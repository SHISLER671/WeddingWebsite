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
      return NextResponse.json(
        { success: false, error: "Missing required field: guest_name" },
        { status: 400 },
      )
    }

    if (!guest_count || guest_count < 1) {
      return NextResponse.json(
        { success: false, error: "Guest count must be at least 1" },
        { status: 400 },
      )
    }

    console.log("[v0] Admin: Updating guest count:", { guest_name, email, guest_count })

    // Update invited_guests table (allowed_party_size)
    const invitedGuestsUpdate: any = { allowed_party_size: guest_count }
    const invitedGuestsQuery = supabase
      .from("invited_guests")
      .update(invitedGuestsUpdate)

    if (email) {
      invitedGuestsQuery.eq("email", email)
    } else {
      invitedGuestsQuery.ilike("guest_name", guest_name)
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
    if (email) {
      const { error: rsvpError } = await supabase
        .from("rsvps")
        .update({ guest_count })
        .eq("email", email)

      if (rsvpError) {
        console.warn("[v0] Admin: Could not update RSVP (may not exist):", rsvpError.message)
        // Don't fail if RSVP doesn't exist - that's okay
      }
    } else {
      // Try to find by guest name
      const { data: rsvpData } = await supabase
        .from("rsvps")
        .select("email")
        .ilike("guest_name", guest_name)
        .limit(1)
        .single()

      if (rsvpData?.email) {
        const { error: rsvpError } = await supabase
          .from("rsvps")
          .update({ guest_count })
          .eq("email", rsvpData.email)

        if (rsvpError) {
          console.warn("[v0] Admin: Could not update RSVP:", rsvpError.message)
        }
      }
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
