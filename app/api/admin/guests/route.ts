import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

/**
 * Admin API endpoint to fetch guest list from invited_guests table
 * This table is synced from MASTERGUESTLIST.csv, so it always has the latest names
 *
 * This replaces reading from seating_assignments for the admin display
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    const { searchParams } = new URL(request.url)
    const timestamp = searchParams.get("t")

    console.log("[v1] Admin: Fetching guests with RSVPs", { timestamp })

    const { data: guests, error } = await supabase
      .from("invited_guests")
      .select(
        `
        id,
        guest_name,
        email,
        allowed_party_size,
        source,
        is_entourage,
        created_at,
        rsvps(attendance, guest_count, dietary_restrictions, table_number)
      `,
      )
      .order("guest_name")

    if (error) {
      console.error("[v1] Admin: Database error:", error)
      return NextResponse.json({ success: false, error: "Database error: " + error.message }, { status: 500 })
    }

    console.log("[v1] Admin: Fetched", guests?.length || 0, "guests")

    const processed =
      guests?.map((guest: any) => {
        const rsvp = guest.rsvps?.[0]
        const isEntourageMember = guest.is_entourage === true
        const rsvpStatus = rsvp?.attendance || "pending"
        const isAttending = rsvpStatus === "yes"
        const tableNumber = rsvp?.table_number || 0

        let actualGuestCount = 0
        if (isEntourageMember) {
          actualGuestCount = rsvp?.guest_count || guest.allowed_party_size || 1
        } else if (isAttending) {
          actualGuestCount = rsvp?.guest_count || guest.allowed_party_size || 1
        }

        return {
          id: guest.id,
          guest_name: guest.guest_name,
          email: guest.email,
          table_number: tableNumber,
          actual_guest_count: actualGuestCount,
          allowed_party_size: guest.allowed_party_size || 1,
          rsvp_status: rsvpStatus,
          is_entourage: isEntourageMember,
          has_rsvpd: !!rsvp,
          dietary_restrictions: rsvp?.dietary_restrictions || null,
        }
      }) || []

    // Sort: entourage first, then by table, then by RSVP status, then by name
    const sorted = processed.sort((a, b) => {
      if (a.is_entourage && !b.is_entourage) return -1
      if (!a.is_entourage && b.is_entourage) return 1

      const tableA = a.table_number || 0
      const tableB = b.table_number || 0

      if (tableA > 0 && tableB === 0) return -1
      if (tableA === 0 && tableB > 0) return 1
      if (tableA !== tableB && tableA > 0 && tableB > 0) return tableA - tableB

      const statusOrder = { yes: 1, pending: 2, no: 3 }
      const orderA = statusOrder[a.rsvp_status as keyof typeof statusOrder] || 2
      const orderB = statusOrder[b.rsvp_status as keyof typeof statusOrder] || 2
      if (orderA !== orderB) return orderA - orderB

      return a.guest_name.toLowerCase().localeCompare(b.guest_name.toLowerCase())
    })

    // Calculate table capacities
    const tableCapacities: { [key: number]: number } = {}
    sorted.forEach((guest: any) => {
      const tableNum = guest.table_number || 0
      if (tableNum > 0 && guest.actual_guest_count > 0) {
        tableCapacities[tableNum] = (tableCapacities[tableNum] || 0) + guest.actual_guest_count
      }
    })

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
        stats,
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      },
    )
  } catch (error: any) {
    console.error("[v1] Admin: Error fetching guests:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
