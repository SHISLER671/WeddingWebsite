import { type NextRequest, NextResponse } from "next/server"
import { createBrowserClient } from "@supabase/ssr"

function getSupabaseClient() {
  return createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseClient()

    const body = await request.json()

    console.log("[v0] RSVP submission received:", {
      guest_name: body.guest_name,
      email: body.email,
      attendance: body.attendance,
    })

    const { guest_name, email, attendance, guest_count, dietary_restrictions, special_message, wallet_address } = body

    // Trim and validate required fields (email can be empty string for some guests)
    const trimmedGuestName = guest_name?.trim()
    const trimmedEmail = email?.trim()
    
    if (!trimmedGuestName || !attendance) {
      console.log("[v0] Missing required fields:", {
        guest_name: !!trimmedGuestName,
        email: !!trimmedEmail,
        attendance: !!attendance,
      })
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    if (!["yes", "no"].includes(attendance)) {
      console.log("[v0] Invalid attendance value:", attendance)
      return NextResponse.json(
        { success: false, error: 'Invalid attendance value. Must be "yes" or "no"' },
        { status: 400 },
      )
    }

    // Build query for invited guest lookup
    let guestQuery = supabase.from("invited_guests").select("id")
    
    if (trimmedEmail) {
      guestQuery = guestQuery.or(`guest_name.eq.${trimmedGuestName},email.eq.${trimmedEmail}`)
    } else {
      guestQuery = guestQuery.eq("guest_name", trimmedGuestName)
    }
    
    const { data: invitedGuest, error: guestError } = await guestQuery.maybeSingle()

    if (guestError) {
      console.error("[v0] Error finding invited guest:", guestError)
    }

    const invited_guest_id = invitedGuest?.id || null

    if (!invited_guest_id) {
      console.warn("[v0] No matching invited guest found for:", { guest_name: trimmedGuestName, email: trimmedEmail })
    }

    // First, check if an RSVP exists by guest name (to handle cases where auto-RSVP used placeholder emails)
    // Use case-insensitive exact matching
    console.log("[v0] Checking for existing RSVP by guest name:", trimmedGuestName)
    const normalizedGuestName = trimmedGuestName.toLowerCase()
    const { data: existingByName, error: nameCheckError } = await supabase
      .from("rsvps")
      .select("id, email, guest_name")
      .ilike("guest_name", normalizedGuestName)
      .maybeSingle()

    if (nameCheckError) {
      console.error("[v0] Error checking for existing RSVP by name:", nameCheckError)
    }

    // Also check by email as a fallback (only if email was provided)
    let existingByEmail = null
    if (trimmedEmail) {
      const { data, error: emailCheckError } = await supabase
        .from("rsvps")
        .select("id, email, guest_name")
        .eq("email", trimmedEmail)
        .maybeSingle()

      if (emailCheckError) {
        console.error("[v0] Error checking for existing RSVP by email:", emailCheckError)
      } else {
        existingByEmail = data
      }
    }

    // Prefer match by name over email (to handle email changes from placeholder to real email)
    const existingRsvp = existingByName || existingByEmail

    const rsvpData = {
      guest_name: trimmedGuestName,
      email: trimmedEmail || null,
      invited_guest_id,
      attendance,
      guest_count: guest_count || 1,
      dietary_restrictions: dietary_restrictions || null,
      special_message: special_message || null,
      wallet_address: wallet_address || null,
    }

    let data, error

    if (existingRsvp) {
      // Update existing RSVP (handles both name match and email match cases)
      console.log(`[v0] Found existing RSVP (id: ${existingRsvp.id}), updating...`, {
        old_email: existingRsvp.email,
        new_email: trimmedEmail,
        matched_by: existingByName ? "name" : "email",
      })

      const { data: updateData, error: updateError } = await supabase
        .from("rsvps")
        .update(rsvpData)
        .eq("id", existingRsvp.id)
        .select()
        .single()

      data = updateData
      error = updateError

      if (!error) {
        console.log("[v0] Successfully updated existing RSVP:", data)
      }
    } else {
      // Create new RSVP
      console.log("[v0] No existing RSVP found, creating new one...")

      const { data: insertData, error: insertError } = await supabase
        .from("rsvps")
        .insert(rsvpData)
        .select()
        .single()

      data = insertData
      error = insertError

      if (!error) {
        console.log("[v0] Successfully created new RSVP:", data)
      }
    }

    if (error) {
      console.error("[v0] Supabase error upserting RSVP:", error)
      return NextResponse.json({ success: false, error: "Failed to submit RSVP: " + error.message }, { status: 500 })
    }

    console.log("[v0] RSVP successfully processed:", data)

    return NextResponse.json({
      success: true,
      data: data,
      message: "RSVP submitted successfully",
    })
  } catch (error) {
    console.error("[v0] Error processing RSVP submission:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error. Please try again.",
      },
      { status: 500 },
    )
  }
}
