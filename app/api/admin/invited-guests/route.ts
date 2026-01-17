import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { requireAdminAPIAuth } from "@/lib/authHelpers"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

type Body = {
  guest_name: string
  allowed_party_size?: number
  email?: string | null
  is_entourage?: boolean
}

function normalizeName(name: string): string {
  return name.toLowerCase().trim().replace(/\s+/g, " ")
}

export async function POST(request: NextRequest) {
  const auth = requireAdminAPIAuth(request)
  if (auth instanceof NextResponse) return auth

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

  const guestName = (body.guest_name || "").trim()
  const email = (body.email ?? "").toString().trim()
  const allowed = Number.isFinite(body.allowed_party_size) ? Number(body.allowed_party_size) : 1
  const isEntourage = body.is_entourage === true

  if (!guestName) {
    return NextResponse.json({ success: false, error: "guest_name is required" }, { status: 400 })
  }
  if (!Number.isInteger(allowed) || allowed < 1 || allowed > 20) {
    return NextResponse.json({ success: false, error: "allowed_party_size must be an integer between 1 and 20" }, { status: 400 })
  }

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  // Duplicate checks
  if (email && email.includes("@") && !email.includes("wedding.invalid")) {
    const { data: existingByEmail, error: emailErr } = await supabase
      .from("invited_guests")
      .select("id, guest_name, email")
      .eq("email", email)
      .maybeSingle()
    if (emailErr) {
      return NextResponse.json({ success: false, error: emailErr.message }, { status: 500 })
    }
    if (existingByEmail) {
      return NextResponse.json(
        { success: false, error: "A guest with this email already exists", existing: existingByEmail },
        { status: 409 },
      )
    }
  }

  const { data: candidates, error: nameErr } = await supabase
    .from("invited_guests")
    .select("id, guest_name, email")
    .ilike("guest_name", guestName)
    .limit(5)
  if (nameErr) {
    return NextResponse.json({ success: false, error: nameErr.message }, { status: 500 })
  }
  const normalized = normalizeName(guestName)
  const exact = (candidates || []).find((g: any) => normalizeName(g.guest_name) === normalized)
  if (exact) {
    return NextResponse.json(
      { success: false, error: "A guest with this name already exists", existing: exact },
      { status: 409 },
    )
  }

  const insertRow = {
    guest_name: guestName,
    // Keep DB-compatible behavior (Supabase email may be NOT NULL).
    email: email || "",
    allowed_party_size: allowed,
    is_entourage: isEntourage,
    source: "@ADMIN",
  }

  const { data: created, error: insertErr } = await supabase.from("invited_guests").insert(insertRow).select("*").single()
  if (insertErr) {
    const msg = insertErr.message || "Failed to create invited guest"
    const code = (insertErr as any)?.code
    if (code === "23505" || msg.toLowerCase().includes("duplicate key value")) {
      return NextResponse.json(
        { success: false, error: "A guest with this email already exists (or there is a duplicate email conflict)." },
        { status: 409 },
      )
    }
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }

  return NextResponse.json({ success: true, data: created })
}
