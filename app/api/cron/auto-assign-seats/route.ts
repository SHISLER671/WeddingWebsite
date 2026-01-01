import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret to prevent unauthorized access
    const authHeader = request.headers.get("authorization")
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.log("[CRON] Starting daily auto-assign seats job")

    const supabase = await createClient()

    // Fetch all invited guests
    const { data: invitedGuests, error: invitedError } = await supabase.from("invited_guests").select("*")

    if (invitedError) throw invitedError

    // Fetch all RSVPs
    const { data: rsvps, error: rsvpError } = await supabase.from("rsvps").select("*")

    if (rsvpError) throw rsvpError

    // Fetch existing seating assignments
    const { data: existingSeating, error: seatingError } = await supabase.from("seating_assignments").select("*")

    if (seatingError) throw seatingError

    const MAX_TABLES = 26
    const SEATS_PER_TABLE = 10

    // Build guest list with RSVP status
    const guestsToAssign = invitedGuests
      .map((guest) => {
        const rsvp = rsvps?.find(
          (r) =>
            r.email?.toLowerCase() === guest.email?.toLowerCase() ||
            r.guest_name?.toLowerCase() === guest.guest_name?.toLowerCase(),
        )

        const isEntourage = guest.special_notes?.toLowerCase().includes("entourage")
        const isAttending = rsvp?.attendance === "yes" || isEntourage

        return {
          email: guest.email || "",
          guest_name: guest.guest_name || "",
          guest_count: isAttending ? rsvp?.guest_count || guest.guest_count || 1 : 0,
          isEntourage,
          isAttending,
          rsvpStatus: rsvp?.attendance || "pending",
        }
      })
      .filter((g) => g.isAttending)

    // Sort: entourage first, then by guest count descending
    guestsToAssign.sort((a, b) => {
      if (a.isEntourage && !b.isEntourage) return -1
      if (!a.isEntourage && b.isEntourage) return 1
      return b.guest_count - a.guest_count
    })

    // Initialize table capacities
    const tableCapacities: { [key: number]: number } = {}
    for (let i = 1; i <= MAX_TABLES; i++) {
      tableCapacities[i] = SEATS_PER_TABLE
    }

    // Account for existing assignments that shouldn't be moved
    existingSeating?.forEach((seat) => {
      if (seat.table_number > 0 && seat.table_number <= MAX_TABLES) {
        const guest = guestsToAssign.find(
          (g) =>
            g.email.toLowerCase() === seat.email?.toLowerCase() ||
            g.guest_name.toLowerCase() === seat.guest_name?.toLowerCase(),
        )
        if (guest) {
          tableCapacities[seat.table_number] -= guest.guest_count
        }
      }
    })

    // Assign unassigned guests
    const assignments: any[] = []
    let currentTable = 1

    for (const guest of guestsToAssign) {
      // Check if already assigned
      const existingAssignment = existingSeating?.find(
        (s) =>
          s.email?.toLowerCase() === guest.email.toLowerCase() ||
          s.guest_name?.toLowerCase() === guest.guest_name.toLowerCase(),
      )

      if (existingAssignment && existingAssignment.table_number > 0) {
        continue // Skip already assigned
      }

      // Find next available table
      while (currentTable <= MAX_TABLES && tableCapacities[currentTable] < guest.guest_count) {
        currentTable++
      }

      if (currentTable > MAX_TABLES) {
        console.log(`[CRON] No available tables for ${guest.guest_name}`)
        break
      }

      assignments.push({
        email: guest.email,
        guest_name: guest.guest_name,
        table_number: currentTable,
        guest_count: guest.guest_count,
      })

      tableCapacities[currentTable] -= guest.guest_count

      // Move to next table if current is nearly full (less than 2 seats left)
      if (tableCapacities[currentTable] < 2) {
        currentTable++
      }
    }

    // Update/insert assignments
    for (const assignment of assignments) {
      const existing = existingSeating?.find(
        (s) =>
          s.email?.toLowerCase() === assignment.email.toLowerCase() ||
          s.guest_name?.toLowerCase() === assignment.guest_name.toLowerCase(),
      )

      if (existing) {
        await supabase
          .from("seating_assignments")
          .update({
            table_number: assignment.table_number,
            guest_count: assignment.guest_count,
          })
          .eq("id", existing.id)
      } else {
        await supabase.from("seating_assignments").insert([assignment])
      }
    }

    console.log(`[CRON] Successfully assigned ${assignments.length} guests`)

    return NextResponse.json({
      success: true,
      message: `Assigned ${assignments.length} guests`,
      assignedCount: assignments.length,
    })
  } catch (error: any) {
    console.error("[CRON] Auto-assign error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
