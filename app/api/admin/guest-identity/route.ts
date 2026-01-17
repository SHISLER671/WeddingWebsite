import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { requireAdminAPIAuth } from "@/lib/authHelpers"

export const dynamic = "force-dynamic"

type Body = {
  invited_guest_id: string
  guest_name: string
  email?: string | null
  previous_guest_name?: string | null
  previous_email?: string | null
}

function isValidUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
}

function buildLooseNamePattern(name: string): string | null {
  const tokens = name
    .toLowerCase()
    .replace(/&amp;/g, " and ")
    .replace(/&/g, " and ")
    .replace(/[.,]/g, "")
    .split(/\s+/)
    .map((t) => t.trim())
    .filter(Boolean)
    .filter((t) => t.length >= 3)

  if (tokens.length === 0) return null
  const picked = tokens.slice(0, 3)
  return `%${picked.join("%")}%`
}

export async function PUT(request: NextRequest) {
  const auth = requireAdminAPIAuth(request)
  if (auth instanceof NextResponse) return auth

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json({ success: false, error: "Missing Supabase server credentials" }, { status: 500 })
    }

    let body: Body
    try {
      body = (await request.json()) as Body
    } catch {
      return NextResponse.json({ success: false, error: "Invalid JSON body" }, { status: 400 })
    }

    const invitedGuestId = body.invited_guest_id?.trim()
    const newGuestName = body.guest_name?.trim()
    const emailProvided = body.email !== undefined
    const newEmail = emailProvided ? String(body.email ?? "").trim() : undefined
    const prevGuestName = (body.previous_guest_name ?? "").toString().trim()
    const prevEmail = (body.previous_email ?? "").toString().trim()

    if (!invitedGuestId || !isValidUuid(invitedGuestId)) {
      return NextResponse.json({ success: false, error: "Invalid invited_guest_id" }, { status: 400 })
    }

    if (!newGuestName) {
      return NextResponse.json({ success: false, error: "Missing guest_name" }, { status: 400 })
    }

    const supabase = createClient(supabaseUrl, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })

    // Fetch existing invited guest (by id first)
    let { data: existing, error: fetchError } = await supabase
      .from("invited_guests")
      .select("id, guest_name, email")
      .eq("id", invitedGuestId)
      .maybeSingle()

    if (fetchError) {
      return NextResponse.json({ success: false, error: fetchError.message }, { status: 500 })
    }

    // Fallback: if record was deleted/reinserted by a CSV resync, the old id can be stale.
    // In that case, try to re-locate by previous email/name (best-effort).
    if (!existing && (prevEmail || prevGuestName)) {
      if (prevEmail && prevEmail.includes("@") && !prevEmail.includes("wedding.invalid")) {
        const res = await supabase
          .from("invited_guests")
          .select("id, guest_name, email")
          .eq("email", prevEmail)
          .maybeSingle()
        existing = res.data
        fetchError = res.error
      }

      if (!existing && prevGuestName) {
        // First try exact-ish match (case-insensitive)
        let res = await supabase
          .from("invited_guests")
          .select("id, guest_name, email")
          .ilike("guest_name", prevGuestName)
          .maybeSingle()
        existing = res.data
        fetchError = res.error

        // If no match, try a loose partial match based on key tokens (e.g. "Elijah Limtiaco")
        if (!existing) {
          const pattern = buildLooseNamePattern(prevGuestName) || buildLooseNamePattern(newGuestName)
          if (pattern) {
            const list = await supabase
              .from("invited_guests")
              .select("id, guest_name, email")
              .ilike("guest_name", pattern)
              .limit(2)

            fetchError = list.error
            if (!fetchError && list.data && list.data.length === 1) {
              existing = list.data[0]
            } else if (!fetchError && list.data && list.data.length > 1) {
              return NextResponse.json(
                {
                  success: false,
                  error:
                    "Multiple possible matches found for this guest after resync. Please click Reload and try again.",
                },
                { status: 409 },
              )
            }
          }
        }
      }

      if (fetchError) {
        return NextResponse.json({ success: false, error: fetchError.message }, { status: 500 })
      }
    }

    if (!existing) {
      return NextResponse.json(
        {
          success: false,
          error: "invited_guest not found (please click Reload and try again)",
        },
        { status: 404 },
      )
    }

    // Update invited_guests identity fields.
    // IMPORTANT: If email is not provided, do not touch it (name-only edits).
    const invitedUpdate: Record<string, any> = { guest_name: newGuestName }
    if (emailProvided) invitedUpdate.email = newEmail

    const { data: updatedInvited, error: updateInvitedError } = await supabase
      .from("invited_guests")
      .update(invitedUpdate)
      .eq("id", existing.id)
      .select("id, guest_name, email")
      .single()

    if (updateInvitedError) {
      const msg = updateInvitedError.message || "Failed to update invited guest"
      const code = (updateInvitedError as any)?.code
      // Postgres unique violation (e.g. duplicate email)
      if (code === "23505" || msg.toLowerCase().includes("duplicate key value")) {
        return NextResponse.json(
          {
            success: false,
            error: "That email is already assigned to another guest. Please use a different email (or clear it).",
          },
          { status: 409 },
        )
      }
      return NextResponse.json({ success: false, error: msg }, { status: 500 })
    }

    // If an RSVP exists linked to this invited guest, update its guest_name and optionally email.
    // RSVP email is unique, so only update email if a real value is provided.
    const rsvpUpdate: Record<string, string> = { guest_name: newGuestName }
    if (emailProvided && newEmail && newEmail.includes("@")) {
      rsvpUpdate.email = newEmail
    }

    let updatedRsvps = 0
    try {
      const { data: rsvpData, error: rsvpErr } = await supabase
        .from("rsvps")
        .update(rsvpUpdate)
        .eq("invited_guest_id", invitedGuestId)
        .select("id")

      if (rsvpErr) {
        // If schema doesn't support invited_guest_id, fall back to best-effort matching by previous email/name.
        // (Some environments may have older RSVP schema.)
        const msg = (rsvpErr as any)?.message || ""
        if (msg.toLowerCase().includes("invited_guest_id")) {
          const prevEmail = (existing.email ?? "").toString().trim()
          const prevName = (existing.guest_name ?? "").toString().trim()

          let q = supabase.from("rsvps").update(rsvpUpdate)
          if (prevEmail && prevEmail.includes("@") && !prevEmail.includes("wedding.invalid")) {
            q = q.eq("email", prevEmail)
          } else {
            q = q.ilike("guest_name", prevName)
          }
          const { data: fallbackData, error: fallbackErr } = await q.select("id")
          if (fallbackErr) {
            return NextResponse.json({ success: false, error: fallbackErr.message }, { status: 500 })
          }
          updatedRsvps = fallbackData?.length || 0
        } else {
          return NextResponse.json({ success: false, error: rsvpErr.message }, { status: 500 })
        }
      } else {
        updatedRsvps = rsvpData?.length || 0
      }
    } catch (e: any) {
      return NextResponse.json({ success: false, error: e?.message || "Failed to update RSVPs" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: {
        invited_guest: updatedInvited,
        updated_rsvps: updatedRsvps,
      },
    })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message || "Internal server error" }, { status: 500 })
  }
}
