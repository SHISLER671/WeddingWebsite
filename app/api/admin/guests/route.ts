import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/client"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()

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
        rsvps(attendance, guest_count, dietary_restrictions, special_message, table_number)
      `,
      )
      .order("guest_name")

    if (error) {
      console.error("[v1] Admin: Database error:", error)
      return NextResponse.json({ success: false, error: "Database error: " + error.message }, { status: 500 })
    }

    console.log("[v1] Admin: Fetched", guests?.length || 0, "guests")

    // Also fetch all RSVPs directly to match by email/name if relationship join fails
    const { data: allRsvps, error: rsvpFetchError } = await supabase
      .from("rsvps")
      .select("id, email, guest_name, guest_count, attendance, table_number, dietary_restrictions, special_message")

    if (rsvpFetchError) {
      console.warn("[v1] Admin: Could not fetch all RSVPs for matching:", rsvpFetchError.message)
    }

    // Helper function to normalize names for matching
    // Handles variations like "&", "&amp;", "Jr." vs "Jr", etc.
    const normalizeName = (name: string): string => {
      if (!name) return ""
      return name
        .trim()
        .toLowerCase()
        .replace(/&amp;/g, " and ") // Convert HTML entities
        .replace(/&/g, " and ") // Convert & to " and "
        .replace(/\s+/g, " ") // Normalize whitespace
        .replace(/\./g, "") // Remove periods (Jr. vs Jr)
        .replace(/,/g, "") // Remove commas
    }

    // Create a map of RSVPs by email and name for fallback matching
    const rsvpMap = new Map<string, any>()
    allRsvps?.forEach((rsvp: any) => {
      if (rsvp.email) {
        rsvpMap.set(rsvp.email.toLowerCase(), rsvp)
      }
      // Also index by normalized name
      const normalizedName = normalizeName(rsvp.guest_name || "")
      if (normalizedName) {
        rsvpMap.set(`name:${normalizedName}`, rsvp)
      }
    })

    const processed =
      guests?.map((guest: any) => {
        let rsvp = guest.rsvps?.[0]
        const isEntourageMember = guest.is_entourage === true
        
        // Priority 1: If guest has a real email, try to match by email first (most reliable)
        // This handles cases where there are multiple RSVPs (e.g., one with placeholder email, one with real email)
        if (guest.email && guest.email.includes("@") && !guest.email.includes("wedding.invalid")) {
          const emailMatch = rsvpMap.get(guest.email.toLowerCase())
          if (emailMatch) {
            // Prefer RSVP with real email - this is the authoritative source
            rsvp = emailMatch
          }
        }
        
        // Priority 2: If no email match, use relationship join result (if it exists)
        // This handles cases where invited_guest_id is set correctly
        
        // Priority 3: If still no RSVP, try normalized name matching as fallback
        if (!rsvp && guest.guest_name) {
          const normalizedName = normalizeName(guest.guest_name)
          rsvp = rsvpMap.get(`name:${normalizedName}`)
        }

        const rsvpStatus = rsvp?.attendance || "pending"
        const isAttending = rsvpStatus === "yes"
        const tableNumber = rsvp?.table_number || 0

        // Priority: RSVP guest_count > allowed_party_size > 1
        // Always prefer RSVP guest_count if RSVP exists and is attending or entourage
        let actualGuestCount = 0
        if (rsvp && (isAttending || isEntourageMember)) {
          // If RSVP exists and is attending/entourage, use RSVP guest_count
          actualGuestCount = rsvp.guest_count || guest.allowed_party_size || 1
        } else if (isEntourageMember) {
          // Entourage without RSVP - use allowed_party_size
          actualGuestCount = guest.allowed_party_size || 1
        } else if (isAttending && rsvp) {
          // Attending with RSVP - use RSVP guest_count
          actualGuestCount = rsvp.guest_count || guest.allowed_party_size || 1
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
          special_message: rsvp?.special_message || null,
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
