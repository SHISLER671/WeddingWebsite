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

    if (!guest_name || !email || !attendance) {
      console.log("[v0] Missing required fields:", {
        guest_name: !!guest_name,
        email: !!email,
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

    const { data: invitedGuest, error: guestError } = await supabase
      .from("invited_guests")
      .select("id")
      .or(`guest_name.eq.${guest_name},email.eq.${email}`)
      .maybeSingle()

    if (guestError) {
      console.error("[v0] Error finding invited guest:", guestError)
    }

    const invited_guest_id = invitedGuest?.id || null

    if (!invited_guest_id) {
      console.warn("[v0] No matching invited guest found for:", { guest_name, email })
    }

    // First, check if an RSVP exists by guest name (to handle cases where auto-RSVP used placeholder emails)
    // Use case-insensitive exact matching
    console.log("[v0] Checking for existing RSVP by guest name:", guest_name)
    const normalizedGuestName = guest_name.trim().toLowerCase()
    const { data: existingByName, error: nameCheckError } = await supabase
      .from("rsvps")
      .select("id, email, guest_name")
      .ilike("guest_name", normalizedGuestName)
      .maybeSingle()

    if (nameCheckError) {
      console.error("[v0] Error checking for existing RSVP by name:", nameCheckError)
    }

    // Also check by email as a fallback
    const { data: existingByEmail, error: emailCheckError } = await supabase
      .from("rsvps")
      .select("id, email, guest_name")
      .eq("email", email)
      .maybeSingle()

    if (emailCheckError) {
      console.error("[v0] Error checking for existing RSVP by email:", emailCheckError)
    }

    // Prefer match by name over email (to handle email changes from placeholder to real email)
    const existingRsvp = existingByName || existingByEmail

    const rsvpData = {
      guest_name,
      email,
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
        new_email: email,
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
