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

    // Fetch existing RSVPs with table assignments
    const { data: existingRsvps, error: rsvpSeatingError } = await supabase
      .from("rsvps")
      .select("id, email, guest_name, table_number, guest_count")

    if (rsvpSeatingError) throw rsvpSeatingError

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
    existingRsvps?.forEach((rsvp) => {
      if (rsvp.table_number > 0 && rsvp.table_number <= MAX_TABLES) {
        const guest = guestsToAssign.find(
          (g) =>
            g.email.toLowerCase() === rsvp.email?.toLowerCase() ||
            g.guest_name.toLowerCase() === rsvp.guest_name?.toLowerCase(),
        )
        if (guest) {
          tableCapacities[rsvp.table_number] -= guest.guest_count
        }
      }
    })

    // Assign unassigned guests
    const assignments: any[] = []
    let currentTable = 1

    for (const guest of guestsToAssign) {
      // Check if already assigned
      const existingRsvp = existingRsvps?.find(
        (r) =>
          r.email?.toLowerCase() === guest.email.toLowerCase() ||
          r.guest_name?.toLowerCase() === guest.guest_name.toLowerCase(),
      )

      if (existingRsvp && existingRsvp.table_number > 0) {
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

    // Update RSVPs with table assignments
    for (const assignment of assignments) {
      const existingRsvp = existingRsvps?.find(
        (r) =>
          r.email?.toLowerCase() === assignment.email.toLowerCase() ||
          r.guest_name?.toLowerCase() === assignment.guest_name.toLowerCase(),
      )

      if (existingRsvp) {
        // Update existing RSVP
        await supabase
          .from("rsvps")
          .update({
            table_number: assignment.table_number,
          })
          .eq("id", existingRsvp.id)
      } else {
        // Find or create RSVP for this guest
        const { data: invitedGuest } = await supabase
          .from("invited_guests")
          .select("id")
          .or(`email.eq.${assignment.email},guest_name.eq.${assignment.guest_name}`)
          .maybeSingle()

        // Try to find existing RSVP by email or name
        const { data: rsvp } = await supabase
          .from("rsvps")
          .select("id")
          .or(`email.eq.${assignment.email},guest_name.eq.${assignment.guest_name}`)
          .maybeSingle()

        if (rsvp) {
          // Update existing RSVP
          await supabase
            .from("rsvps")
            .update({ table_number: assignment.table_number })
            .eq("id", rsvp.id)
        } else {
          // Create new RSVP with table assignment (attendance will be set later)
          await supabase.from("rsvps").insert({
            email: assignment.email,
            guest_name: assignment.guest_name,
            invited_guest_id: invitedGuest?.id || null,
            table_number: assignment.table_number,
            attendance: "yes",
            guest_count: assignment.guest_count,
          })
        }
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
