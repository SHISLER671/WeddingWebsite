import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'

export async function GET() {
  try {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    console.log("[v0] Admin: Fetching all seating assignments with RSVP counts")

    // Fetch seating assignments
    const { data: assignments, error } = await supabase
      .from("seating_assignments")
      .select("*")

    // Debug: Check if Jared Quichocho is in the raw assignments
    if (assignments) {
      const jaredQuichocho = assignments.find((a: any) => {
        const name = a.guest_name?.toLowerCase().trim() || ""
        return name.includes("jared") && name.includes("quichocho")
      })
      if (jaredQuichocho) {
        console.log("[v0] Admin: Found Jared Quichocho in raw assignments:", {
          id: jaredQuichocho.id,
          guest_name: jaredQuichocho.guest_name,
          table_number: jaredQuichocho.table_number,
          email: jaredQuichocho.email
        })
      } else {
        console.warn("[v0] Admin: Jared Quichocho NOT found in raw assignments. Total assignments:", assignments.length)
        // Log all guests with "jared" in name for debugging
        const jaredGuests = assignments.filter((a: any) => 
          a.guest_name?.toLowerCase().includes("jared")
        )
        if (jaredGuests.length > 0) {
          console.log("[v0] Admin: Found guests with 'Jared' in name:", jaredGuests.map((g: any) => ({
            name: g.guest_name,
            table: g.table_number
          })))
        }
      }
    }

    if (error) {
      console.error("[v0] Admin: Database error:", error)
      return NextResponse.json({ success: false, error: "Database error: " + error.message }, { status: 500 })
    }

    // Fetch all RSVPs to match by email or name
    const { data: rsvps, error: rsvpError } = await supabase
      .from("rsvps")
      .select("email, guest_name, guest_count, attendance")

    if (rsvpError) {
      console.warn("[v0] Admin: Could not fetch RSVPs:", rsvpError.message)
    }

    // Fetch invited_guests to get allowed_party_size as fallback
    const { data: invitedGuests, error: invitedGuestsError } = await supabase
      .from("invited_guests")
      .select("guest_name, email, allowed_party_size")

    if (invitedGuestsError) {
      console.warn("[v0] Admin: Could not fetch invited_guests:", invitedGuestsError.message)
    }

    // Create a map of RSVPs by email and name for quick lookup
    const rsvpMap = new Map<string, any>()
    rsvps?.forEach((rsvp: any) => {
      if (rsvp.email) {
        rsvpMap.set(rsvp.email.toLowerCase(), rsvp)
      }
      // Also index by normalized name
      const normalizedName = rsvp.guest_name?.trim().toLowerCase()
      if (normalizedName) {
        rsvpMap.set(`name:${normalizedName}`, rsvp)
      }
    })

    // Create a map of invited_guests by email and name for allowed_party_size lookup
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

    // Process assignments to include actual guest count from RSVP or invited_guests
    const processed = assignments?.map((assignment: any) => {
      // Try to find matching RSVP by email first, then by name
      let matchingRsvp = null
      if (assignment.email) {
        matchingRsvp = rsvpMap.get(assignment.email.toLowerCase())
      }
      if (!matchingRsvp && assignment.guest_name) {
        const normalizedName = assignment.guest_name.trim().toLowerCase()
        matchingRsvp = rsvpMap.get(`name:${normalizedName}`)
      }

      // Try to find matching invited_guest for allowed_party_size
      let matchingInvitedGuest = null
      if (assignment.email) {
        matchingInvitedGuest = invitedGuestsMap.get(assignment.email.toLowerCase())
      }
      if (!matchingInvitedGuest && assignment.guest_name) {
        const normalizedName = assignment.guest_name.trim().toLowerCase()
        matchingInvitedGuest = invitedGuestsMap.get(`name:${normalizedName}`)
      }

      // Get guest count: prefer RSVP guest_count if RSVP'd yes, otherwise use allowed_party_size, otherwise default to 1
      let actualGuestCount = 1
      if (matchingRsvp?.attendance === 'yes') {
        actualGuestCount = matchingRsvp.guest_count || 1
      } else if (matchingInvitedGuest?.allowed_party_size) {
        actualGuestCount = matchingInvitedGuest.allowed_party_size
      }
      
      return {
        ...assignment,
        actual_guest_count: actualGuestCount,
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

    // Debug: Check if Jared Quichocho is in the final sorted list
    if (sorted) {
      const jaredQuichochoFinal = sorted.find((a: any) => {
        const name = a.guest_name?.toLowerCase().trim() || ""
        return name.includes("jared") && name.includes("quichocho")
      })
      if (jaredQuichochoFinal) {
        console.log("[v0] Admin: Jared Quichocho in final sorted list:", {
          id: jaredQuichochoFinal.id,
          guest_name: jaredQuichochoFinal.guest_name,
          table_number: jaredQuichochoFinal.table_number,
          actual_guest_count: jaredQuichochoFinal.actual_guest_count,
          position: sorted.indexOf(jaredQuichochoFinal)
        })
      } else {
        console.warn("[v0] Admin: Jared Quichocho NOT in final sorted list. Total sorted:", sorted.length)
        // Log all guests with "jared" in name for debugging
        const jaredGuests = sorted.filter((a: any) => 
          a.guest_name?.toLowerCase().includes("jared")
        )
        if (jaredGuests.length > 0) {
          console.log("[v0] Admin: Found guests with 'Jared' in final sorted list:", jaredGuests.map((g: any) => ({
            name: g.guest_name,
            table: g.table_number,
            position: sorted.indexOf(g)
          })))
        }
      }
    }

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

export async function PUT(request: NextRequest) {
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

    const { id, actual_guest_count, ...updateData } = body

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Missing required field: id" },
        { status: 400 },
      )
    }

    console.log("[v0] Admin: Updating seating assignment:", { id, updateData })

    // actual_guest_count is computed on the fly, not stored in seating_assignments
    // Remove it if it was accidentally included

    // Ensure table_number is a number if provided
    if (updateData.table_number !== undefined) {
      updateData.table_number = parseInt(updateData.table_number, 10)
      if (isNaN(updateData.table_number)) {
        return NextResponse.json(
          { success: false, error: "Invalid table_number. Must be a number." },
          { status: 400 },
        )
      }
    }

    const { data, error } = await supabase
      .from("seating_assignments")
      .update(updateData)
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("[v0] Admin: Update error:", error)
      return NextResponse.json(
        { success: false, error: "Database error: " + error.message },
        { status: 500 },
      )
    }

    if (!data) {
      console.error("[v0] Admin: No data returned from update")
      return NextResponse.json(
        { success: false, error: "Assignment not found or update failed." },
        { status: 404 },
      )
    }

    console.log("[v0] Admin: Successfully updated assignment:", data)

    return NextResponse.json({
      success: true,
      data: data,
      message: "Assignment updated successfully",
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
