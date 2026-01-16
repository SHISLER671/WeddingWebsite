import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { requireAdminAPIAuth } from "@/lib/authHelpers"

export const dynamic = 'force-dynamic'

/**
 * Legacy endpoint - kept for backward compatibility
 * New admin page should use /api/admin/guests for GET
 * This endpoint is still used for PUT (updating seating assignments)
 */
export async function GET(request: NextRequest) {
  const auth = requireAdminAPIAuth(request)
  if (auth instanceof NextResponse) return auth

  try {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    console.log("[v0] Admin: Fetching all seating assignments with RSVP counts")

    // Fetch all RSVPs with table assignments
    const { data: rsvps, error: rsvpError } = await supabase
      .from("rsvps")
      .select("id, email, guest_name, guest_count, attendance, table_number, dietary_restrictions")

    if (rsvpError) {
      console.error("[v0] Admin: Database error fetching RSVPs:", rsvpError)
      return NextResponse.json({ success: false, error: "Database error: " + rsvpError.message }, { status: 500 })
    }

    // Fetch invited_guests to get additional info like is_entourage
    const { data: invitedGuests, error: invitedGuestsError } = await supabase
      .from("invited_guests")
      .select("id, guest_name, email, allowed_party_size, is_entourage")

    if (invitedGuestsError) {
      console.warn("[v0] Admin: Could not fetch invited_guests:", invitedGuestsError.message)
    }

    // Create a map of invited_guests by email and name for lookup
    const invitedGuestsMap = new Map<string, any>()
    invitedGuests?.forEach((guest: any) => {
      if (guest.email) {
        invitedGuestsMap.set(guest.email.toLowerCase(), guest)
      }
      const normalizedName = guest.guest_name?.trim().toLowerCase()
      if (normalizedName) {
        invitedGuestsMap.set(`name:${normalizedName}`, guest)
      }
    })

    // Process RSVPs into assignment format
    const processed = rsvps?.map((rsvp: any) => {
      // Find matching invited_guest for additional info
      let matchingInvitedGuest = null
      if (rsvp.email) {
        matchingInvitedGuest = invitedGuestsMap.get(rsvp.email.toLowerCase())
      }
      if (!matchingInvitedGuest && rsvp.guest_name) {
        const normalizedName = rsvp.guest_name.trim().toLowerCase()
        matchingInvitedGuest = invitedGuestsMap.get(`name:${normalizedName}`)
      }

      // Get guest count: prefer RSVP guest_count if RSVP'd yes, otherwise use allowed_party_size, otherwise default to 1
      let actualGuestCount = 1
      if (rsvp.attendance === 'yes') {
        actualGuestCount = rsvp.guest_count || 1
      } else if (matchingInvitedGuest?.allowed_party_size) {
        actualGuestCount = matchingInvitedGuest.allowed_party_size
      }
      
      return {
        id: rsvp.id,
        guest_name: rsvp.guest_name,
        email: rsvp.email,
        table_number: rsvp.table_number || 0,
        actual_guest_count: actualGuestCount,
        is_entourage: matchingInvitedGuest?.is_entourage || false,
        dietary_notes: rsvp.dietary_restrictions || null,
        special_notes: matchingInvitedGuest?.is_entourage ? "ENTOURAGE" : null,
      }
    }) || []

    // Sort by table_number first (0/unassigned at end), then alphabetically by name
    const sorted = processed.sort((a, b) => {
      // First sort by table_number (0 goes to end)
      const tableA = a.table_number || 0
      const tableB = b.table_number || 0
      
      // If both are 0 or both are > 0, compare normally
      if ((tableA === 0 && tableB === 0) || (tableA > 0 && tableB > 0)) {
        if (tableA !== tableB) {
          return tableA - tableB
        }
      } else {
        // One is 0, one is not - 0 goes to end
        if (tableA === 0) return 1
        if (tableB === 0) return -1
      }
      
      // If same table, sort alphabetically by name
      const nameA = (a.guest_name || '').toLowerCase().trim()
      const nameB = (b.guest_name || '').toLowerCase().trim()
      if (nameA < nameB) return -1
      if (nameA > nameB) return 1
      return 0
    })

    // Calculate table capacities
    const tableCapacities: { [key: number]: number } = {}
    sorted.forEach((assignment: any) => {
      const tableNum = assignment.table_number || 0
      if (tableNum > 0) {
        tableCapacities[tableNum] = (tableCapacities[tableNum] || 0) + (assignment.actual_guest_count || 1)
      }
    })

    console.log("[v0] Admin: Successfully fetched", sorted?.length || 0, "assignments")

    return NextResponse.json(
      {
        success: true,
        data: sorted || [],
        tableCapacities, // Include capacity info for frontend
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      }
    )
  } catch (error) {
    console.error("[v0] Admin: Error fetching seating assignments:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error. Please try again.",
      },
      { status: 500 },
    )
  }
}

/**
 * Update seating assignment
 * Updates the rsvps table with table_number
 * Can be called with:
 * - email: guest email (preferred method)
 * - guest_name: guest name (fallback)
 */
export async function PUT(request: NextRequest) {
  const auth = requireAdminAPIAuth(request)
  if (auth instanceof NextResponse) return auth

  try {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    let body
    try {
      body = await request.json()
    } catch (parseError) {
      console.error("[v0] Admin: JSON parse error:", parseError)
      return NextResponse.json(
        { success: false, error: "Invalid request body. Please check your input." },
        { status: 400 },
      )
    }

    const { email, guest_name, table_number, ...otherData } = body

    // Must have either email or guest_name
    if (!email && !guest_name) {
      return NextResponse.json(
        { success: false, error: "Missing required field: email or guest_name" },
        { status: 400 },
      )
    }

    // Ensure table_number is a number if provided
    let tableNum: number | undefined
    if (table_number !== undefined) {
      tableNum = parseInt(String(table_number), 10)
      if (isNaN(tableNum)) {
        return NextResponse.json(
          { success: false, error: "Invalid table_number. Must be a number." },
          { status: 400 },
        )
      }
    }

    // Build query to find the RSVP
    let query = supabase.from("rsvps").select("id, email, guest_name, table_number")
    
    if (email) {
      query = query.eq("email", email)
    } else if (guest_name) {
      query = query.ilike("guest_name", guest_name)
    }

    // Find existing RSVP
    const { data: existing, error: findError } = await query.maybeSingle()

    if (findError) {
      console.error("[v0] Admin: Find error:", findError)
      return NextResponse.json(
        { success: false, error: "Database error: " + findError.message },
        { status: 500 },
      )
    }

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "RSVP not found. Guest must RSVP before table assignment can be updated." },
        { status: 404 },
      )
    }

    // Prepare update data - only update table_number
    const updateData: { table_number: number } = {
      table_number: tableNum !== undefined ? tableNum : existing.table_number || 0,
    }

    // Update the RSVP's table_number
    const { data: updated, error: updateError } = await supabase
      .from("rsvps")
      .update(updateData)
      .eq("id", existing.id)
      .select()
      .single()

    if (updateError) {
      console.error("[v0] Admin: Update error:", updateError)
      return NextResponse.json(
        { success: false, error: "Database error: " + updateError.message },
        { status: 500 },
      )
    }

    if (!updated) {
      console.error("[v0] Admin: No data returned from update")
      return NextResponse.json(
        { success: false, error: "Update failed - no data returned." },
        { status: 404 },
      )
    }

    console.log("[v0] Admin: Successfully updated RSVP table assignment:", updated)

    return NextResponse.json({
      success: true,
      data: updated,
      message: "Table assignment updated successfully",
    })
  } catch (error) {
    console.error("[v0] Admin: Error updating seating assignment:", error)
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
