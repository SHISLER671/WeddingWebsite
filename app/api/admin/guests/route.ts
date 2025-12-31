import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export const dynamic = "force-dynamic"

/**
 * Admin API endpoint to fetch guest list from invited_guests table
 * This table is synced from MASTERGUESTLIST.csv, so it always has the latest names
 *
 * This replaces reading from seating_assignments for the admin display
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    // Get cache-busting parameters from query string
    const { searchParams } = new URL(request.url)
    const timestamp = searchParams.get("t")
    const forceRefresh = searchParams.get("v") === "1"

    console.log("[v1] Admin: Fetching guests from invited_guests table (synced from MASTERGUESTLIST.csv)", {
      timestamp,
      forceRefresh,
    })

    // Fetch all invited guests (this is synced from MASTERGUESTLIST.csv)
    // Use a fresh query each time to avoid any caching
    const {
      data: invitedGuests,
      error,
      count,
    } = await supabase.from("invited_guests").select("*", { count: "exact" }).order("guest_name")

    if (error) {
      console.error("[v1] Admin: Database error:", error)
      return NextResponse.json({ success: false, error: "Database error: " + error.message }, { status: 500 })
    }

    console.log(
      "[v1] Admin: Fetched",
      invitedGuests?.length || 0,
      "guests from invited_guests table (count:",
      count || "N/A",
      ")",
    )

    // Fetch seating assignments to get table numbers and other seating info
    const { data: seatingAssignments, error: seatingError } = await supabase.from("seating_assignments").select("*")

    if (seatingError) {
      console.warn("[v1] Admin: Could not fetch seating assignments:", seatingError.message)
    }

    // Fetch RSVPs to get actual guest counts
    const { data: rsvps, error: rsvpError } = await supabase
      .from("rsvps")
      .select("email, guest_name, guest_count, attendance")

    if (rsvpError) {
      console.warn("[v1] Admin: Could not fetch RSVPs:", rsvpError.message)
    }

    // Create maps for quick lookup
    const seatingMap = new Map<string, any>()
    seatingAssignments?.forEach((assignment: any) => {
      if (assignment.email) {
        seatingMap.set(assignment.email.toLowerCase().trim(), assignment)
      }
      if (assignment.guest_name) {
        seatingMap.set(assignment.guest_name.toLowerCase().trim(), assignment)
      }
      // Also create a combined key for exact matches
      if (assignment.email && assignment.guest_name) {
        seatingMap.set(
          `${assignment.email.toLowerCase().trim()}:${assignment.guest_name.toLowerCase().trim()}`,
          assignment,
        )
      }
    })

    const rsvpMap = new Map<string, any>()
    rsvps?.forEach((rsvp: any) => {
      if (rsvp.email) {
        rsvpMap.set(rsvp.email.toLowerCase(), rsvp)
      }
      const normalizedName = rsvp.guest_name?.trim().toLowerCase()
      if (normalizedName) {
        rsvpMap.set(`name:${normalizedName}`, rsvp)
      }
    })

    // Combine invited_guests with seating and RSVP data
    const processed =
      invitedGuests?.map((guest: any) => {
        const emailKey = guest.email?.toLowerCase().trim() || ""
        const nameKey = guest.guest_name?.toLowerCase().trim() || ""

        let seating = null

        // Strategy 1: Exact email match (most reliable)
        if (emailKey) {
          seating = seatingMap.get(emailKey)
        }

        // Strategy 2: Exact name match
        if (!seating && nameKey) {
          seating = seatingMap.get(nameKey)
        }

        // Strategy 3: Combined key match
        if (!seating && emailKey && nameKey) {
          seating = seatingMap.get(`${emailKey}:${nameKey}`)
        }

        if (!seating && (emailKey || nameKey)) {
          console.log(`[v0] No seating found for guest: ${guest.guest_name} (email: ${guest.email})`)
        } else if (seating) {
          console.log(`[v0] Found seating for ${guest.guest_name}: Table ${seating.table_number}`)
        }

        // Find matching RSVP
        let matchingRsvp = rsvpMap.get(emailKey)
        if (!matchingRsvp && nameKey) {
          matchingRsvp = rsvpMap.get(`name:${nameKey}`)
        }

        // Get actual guest count: prefer RSVP if yes, otherwise use allowed_party_size
        let actualGuestCount = guest.allowed_party_size || 1
        if (matchingRsvp?.attendance === "yes") {
          actualGuestCount = matchingRsvp.guest_count || actualGuestCount
        }

        return {
          id: guest.id,
          guest_name: guest.guest_name,
          email: guest.email,
          table_number: seating?.table_number ?? 0, // Use nullish coalescing to handle null/undefined
          plus_one_name: seating?.plus_one_name || null,
          dietary_notes: seating?.dietary_notes || null,
          special_notes: seating?.special_notes || null,
          actual_guest_count: actualGuestCount,
          allowed_party_size: guest.allowed_party_size || 1,
        }
      }) || []

    // Sort by table_number first (0/unassigned at end), then alphabetically by name
    const sorted = processed.sort((a, b) => {
      const tableA = a.table_number || 0
      const tableB = b.table_number || 0

      if ((tableA === 0 && tableB === 0) || (tableA > 0 && tableB > 0)) {
        if (tableA !== tableB) {
          return tableA - tableB
        }
      } else {
        if (tableA === 0) return 1
        if (tableB === 0) return -1
      }

      const nameA = (a.guest_name || "").toLowerCase().trim()
      const nameB = (b.guest_name || "").toLowerCase().trim()
      if (nameA < nameB) return -1
      if (nameA > nameB) return 1
      return 0
    })

    // Calculate table capacities
    const tableCapacities: { [key: number]: number } = {}
    sorted.forEach((guest: any) => {
      const tableNum = guest.table_number || 0
      if (tableNum > 0) {
        tableCapacities[tableNum] = (tableCapacities[tableNum] || 0) + (guest.actual_guest_count || 1)
      }
    })

    console.log(
      "[v1] Admin: Successfully fetched",
      sorted?.length || 0,
      "guests from invited_guests (database count:",
      count || invitedGuests?.length || 0,
      ")",
    )

    return NextResponse.json(
      {
        success: true,
        data: sorted || [],
        tableCapacities,
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      },
    )
  } catch (error) {
    console.error("[v1] Admin: Error fetching guests:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error. Please try again.",
      },
      { status: 500 },
    )
  }
}
