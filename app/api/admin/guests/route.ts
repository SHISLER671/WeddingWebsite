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

    const isEntourage = (guest: any): boolean => {
      // Primary source: is_entourage boolean from invited_guests
      if (guest.is_entourage === true) return true

      // Fallback: check special_notes for legacy data
      const specialNotes = guest.special_notes || ""
      return specialNotes.toUpperCase().includes("ENTOURAGE")
    }

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

        const hasRsvpd = !!matchingRsvp
        const rsvpStatus = matchingRsvp?.attendance || "pending"
        const isAttending = rsvpStatus === "yes"
        const isEntourageMember = isEntourage(guest)

        // For entourage: always count (they're VIP even without RSVP)
        // For others: only count if RSVP'd yes
        let actualGuestCount = 0
        if (isEntourageMember) {
          actualGuestCount = matchingRsvp?.guest_count || guest.allowed_party_size || 1
        } else if (isAttending) {
          actualGuestCount = matchingRsvp?.guest_count || guest.allowed_party_size || 1
        }

        return {
          id: guest.id,
          guest_name: guest.guest_name,
          email: guest.email,
          table_number: seating?.table_number ?? 0,
          plus_one_name: seating?.plus_one_name || null,
          dietary_notes: seating?.dietary_notes || null,
          special_notes: seating?.special_notes || null,
          actual_guest_count: actualGuestCount,
          allowed_party_size: guest.allowed_party_size || 1,
          rsvp_status: rsvpStatus,
          is_entourage: isEntourageMember,
          has_rsvpd: hasRsvpd,
        }
      }) || []

    const sorted = processed.sort((a, b) => {
      // Priority 1: Entourage first (VIP treatment)
      if (a.is_entourage && !b.is_entourage) return -1
      if (!a.is_entourage && b.is_entourage) return 1

      // Priority 2: Those with table assignments
      const tableA = a.table_number || 0
      const tableB = b.table_number || 0

      if (tableA > 0 && tableB === 0) return -1
      if (tableA === 0 && tableB > 0) return 1

      // Priority 3: Within same table group, sort by table number
      if (tableA !== tableB && tableA > 0 && tableB > 0) {
        return tableA - tableB
      }

      // Priority 4: RSVP status (yes before pending before no)
      const statusOrder = { yes: 1, pending: 2, no: 3 }
      const orderA = statusOrder[a.rsvp_status as keyof typeof statusOrder] || 2
      const orderB = statusOrder[b.rsvp_status as keyof typeof statusOrder] || 2
      if (orderA !== orderB) return orderA - orderB

      // Final: Alphabetical by name
      const nameA = (a.guest_name || "").toLowerCase().trim()
      const nameB = (b.guest_name || "").toLowerCase().trim()
      return nameA.localeCompare(nameB)
    })

    const tableCapacities: { [key: number]: number } = {}
    sorted.forEach((guest: any) => {
      const tableNum = guest.table_number || 0
      if (tableNum > 0 && guest.actual_guest_count > 0) {
        tableCapacities[tableNum] = (tableCapacities[tableNum] || 0) + guest.actual_guest_count
      }
    })

    console.log(
      "[v1] Admin: Successfully fetched",
      sorted?.length || 0,
      "guests from invited_guests (database count:",
      count || invitedGuests?.length || 0,
      ")",
    )

    const stats = {
      total: sorted.length,
      entourage: sorted.filter((g: any) => g.is_entourage).length,
      attending: sorted.filter((g: any) => g.rsvp_status === "yes").length,
      pending: sorted.filter((g: any) => !g.has_rsvpd).length,
      declined: sorted.filter((g: any) => g.rsvp_status === "no").length,
      seated: sorted.filter((g: any) => g.table_number > 0).length,
    }

    console.log("[v1] Admin: Guest stats:", stats)

    return NextResponse.json(
      {
        success: true,
        data: sorted || [],
        tableCapacities,
        stats, // Include stats in response
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
