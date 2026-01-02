import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

/**
 * Update guest count for a guest
 * Updates both invited_guests.allowed_party_size and rsvps.guest_count if RSVP exists
 */
export async function PUT(request: NextRequest) {
  try {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    const body = await request.json()
    const { guest_name, email, guest_count } = body

    if (!guest_name) {
      return NextResponse.json({ success: false, error: "Missing required field: guest_name" }, { status: 400 })
    }

    if (!guest_count || guest_count < 1) {
      return NextResponse.json({ success: false, error: "Guest count must be at least 1" }, { status: 400 })
    }

    console.log("[v0] Admin: Updating guest count:", { guest_name, email, guest_count })

    // Update invited_guests table (allowed_party_size)
    let invitedGuestsQuery = supabase.from("invited_guests").update({ allowed_party_size: guest_count })

    if (email) {
      invitedGuestsQuery = invitedGuestsQuery.eq("email", email)
    } else {
      invitedGuestsQuery = invitedGuestsQuery.ilike("guest_name", guest_name)
    }

    const { error: invitedGuestsError } = await invitedGuestsQuery

    if (invitedGuestsError) {
      console.error("[v0] Admin: Error updating invited_guests:", invitedGuestsError)
      return NextResponse.json(
        { success: false, error: "Failed to update invited_guests: " + invitedGuestsError.message },
        { status: 500 },
      )
    }

    // Update rsvps table (guest_count) if RSVP exists
    // Try both email and name to find the RSVP
    let rsvpUpdateQuery = supabase.from("rsvps").update({ guest_count })
    
    if (email) {
      rsvpUpdateQuery = rsvpUpdateQuery.eq("email", email)
    } else {
      // Use name matching if no email
      rsvpUpdateQuery = rsvpUpdateQuery.ilike("guest_name", guest_name)
    }
    
    const { data: rsvpUpdateResult, error: rsvpError } = await rsvpUpdateQuery.select("id").limit(1)

    if (rsvpError) {
      console.warn("[v0] Admin: Could not update RSVP (may not exist):", rsvpError.message)
      // Don't fail if RSVP doesn't exist - that's okay, but log it
    } else if (rsvpUpdateResult && rsvpUpdateResult.length > 0) {
      console.log("[v0] Admin: Successfully updated RSVP guest_count for:", guest_name)
    } else {
      console.warn("[v0] Admin: No RSVP found to update for:", { guest_name, email })
    }

    console.log("[v0] Admin: Successfully updated guest count")

    return NextResponse.json({
      success: true,
      message: "Guest count updated successfully",
    })
  } catch (error) {
    console.error("[v0] Admin: Error updating guest count:", error)
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"
    return NextResponse.json(
      {
        success: false,
        error: `Internal server error: ${errorMessage}`,
      },
      { status: 500 },
    )
  }
}
