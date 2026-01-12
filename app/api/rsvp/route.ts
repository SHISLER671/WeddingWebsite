import { type NextRequest, NextResponse } from "next/server"
import { createBrowserClient } from "@supabase/ssr"

function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    throw new Error(
      `Supabase environment variables are missing. URL: ${url ? "SET" : "NOT SET"}, Key: ${key ? "SET" : "NOT SET"}`,
    )
  }

  return createBrowserClient(url, key)
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

    // Build query for invited guest lookup (must match to link RSVP properly)
    // Use case-insensitive matching for guest names to handle variations
    console.log("[v0] Looking up invited guest:", { guest_name: trimmedGuestName, email: trimmedEmail || "(no email)" })
    
    let invitedGuest = null
    let guestError = null
    
    // Try to find by email first (if provided and not a placeholder)
    if (trimmedEmail && !trimmedEmail.includes("wedding.invalid")) {
      const { data, error } = await supabase
        .from("invited_guests")
        .select("id, guest_name, email")
        .eq("email", trimmedEmail)
        .maybeSingle()
      
      if (!error && data) {
        invitedGuest = data
        console.log("[v0] Found invited guest by email:", data.id)
      } else if (error) {
        guestError = error
      }
    }
    
    // If not found by email, try by name (case-insensitive)
    if (!invitedGuest) {
      const { data, error } = await supabase
        .from("invited_guests")
        .select("id, guest_name, email")
        .ilike("guest_name", trimmedGuestName)
        .maybeSingle()
      
      if (!error && data) {
        invitedGuest = data
        console.log("[v0] Found invited guest by name:", data.id)
      } else if (error && !guestError) {
        guestError = error
      }
    }

    if (guestError) {
      console.error("[v0] Error finding invited guest:", guestError)
    }

    const invited_guest_id = invitedGuest?.id || null

    if (!invited_guest_id) {
      console.warn("[v0] ⚠️ No matching invited guest found for:", { 
        guest_name: trimmedGuestName, 
        email: trimmedEmail || "(no email provided)",
        note: "RSVP will be created without invited_guest_id link"
      })
    } else {
      console.log("[v0] ✅ Found invited guest ID:", invited_guest_id, "for:", trimmedGuestName)
    }

    // Check for existing RSVP by both name and email
    // Use placeholder email if none provided (for consistent lookup)
    const emailForLookup = trimmedEmail || `no-email-${trimmedGuestName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}@wedding.invalid`
    
    console.log("[v0] Checking for existing RSVP:", { guest_name: trimmedGuestName, email: emailForLookup })
    
    // Try to find existing RSVP by email first (most reliable - emails are unique)
    const { data: existingByEmail, error: emailCheckError } = await supabase
      .from("rsvps")
      .select("id, email, guest_name")
      .eq("email", emailForLookup)
      .maybeSingle()

    if (emailCheckError) {
      console.error("[v0] Error checking for existing RSVP by email:", emailCheckError)
    }

    // Also check by guest name (case-insensitive) as fallback
    // This handles cases where email might have changed or there are variations
    let existingByName = null
    if (!existingByEmail) {
      const { data, error: nameCheckError } = await supabase
        .from("rsvps")
        .select("id, email, guest_name")
        .ilike("guest_name", trimmedGuestName)
        .maybeSingle()

      if (nameCheckError) {
        console.error("[v0] Error checking for existing RSVP by name:", nameCheckError)
      } else {
        existingByName = data
      }
    }

    // Prefer match by email over name (emails are unique and more reliable)
    const existingRsvp = existingByEmail || existingByName

    // Use the same email format for database (consistent with lookup)
    const emailForDb = emailForLookup

    const rsvpData = {
      guest_name: trimmedGuestName,
      email: emailForDb,
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
        guest_name: trimmedGuestName,
        old_email: existingRsvp.email,
        new_email: emailForDb,
        new_attendance: attendance,
        matched_by: existingByEmail ? "email" : "name",
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
