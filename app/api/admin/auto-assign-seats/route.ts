import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export const dynamic = "force-dynamic"

const MAX_TABLE_CAPACITY = 10
const TOTAL_TABLES = 26

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    console.log("[v0] ========== AUTO-ASSIGN STARTING ==========")

    // Step 1: Clear all existing table assignments
    console.log("[v0] Step 1: Clearing all existing table assignments...")
    const { error: clearError } = await supabase
      .from("seating_assignments")
      .update({ table_number: 0, updated_at: new Date().toISOString() })
      .gte("table_number", 0)

    if (clearError) {
      console.error("[v0] Error clearing tables:", clearError.message)
    } else {
      console.log("[v0] ✓ All tables cleared")
    }

    // Step 2: Load all data with JOINs
    console.log("[v0] Step 2: Loading data with JOINs...")
    const { data: invitedGuests, error: loadError } = await supabase
      .from("invited_guests")
      .select(
        `
        id,
        guest_name,
        email,
        allowed_party_size,
        is_entourage,
        rsvps!invited_guest_id (
          attendance,
          guest_count
        )
      `,
      )
      .order("guest_name")

    if (loadError) {
      throw new Error(`Failed to load guests: ${loadError.message}`)
    }

    console.log(`[v0] ✓ Loaded ${invitedGuests?.length || 0} invited guests with RSVP data`)

    // Step 3: Categorize guests
    console.log("[v0] Step 3: Categorizing guests...")
    const entourageGuests: any[] = []
    const attendingGuests: any[] = []

    invitedGuests?.forEach((guest: any) => {
      const rsvp = guest.rsvps?.[0]
      const guestCount = rsvp?.guest_count || guest.allowed_party_size || 1
      const isEntourage = guest.is_entourage === true

      if (isEntourage) {
        entourageGuests.push({ ...guest, guestCount, isEntourage: true })
      } else if (rsvp?.attendance === "yes") {
        attendingGuests.push({ ...guest, guestCount, isEntourage: false })
      }
    })

    console.log(`[v0] ✓ Found ${entourageGuests.length} entourage, ${attendingGuests.length} attending guests`)

    // Sort by party size (largest first) for better packing
    const allGuests = [...entourageGuests, ...attendingGuests].sort((a, b) => b.guestCount - a.guestCount)

    const totalHeadcount = allGuests.reduce((sum, g) => sum + g.guestCount, 0)
    console.log(`[v0] ✓ Total: ${allGuests.length} parties, ${totalHeadcount} people`)

    // Step 4: Assign to tables sequentially
    console.log("[v0] Step 4: Assigning guests to tables...")
    const assignments: any[] = []
    let currentTable = 1
    let currentTableCapacity = 0

    for (const guest of allGuests) {
      const partySize = guest.guestCount

      // Check if party fits in current table
      if (currentTableCapacity + partySize <= MAX_TABLE_CAPACITY) {
        // Fits in current table
        assignments.push({
          invited_guest_id: guest.id,
          table_number: currentTable,
        })
        currentTableCapacity += partySize
        console.log(
          `[v0]   Assigned ${guest.guest_name} (${partySize}) to Table ${currentTable} [${currentTableCapacity}/${MAX_TABLE_CAPACITY}]`,
        )
      } else {
        // Doesn't fit, move to next table
        currentTable++
        currentTableCapacity = partySize

        if (currentTable > TOTAL_TABLES) {
          console.error(`[v0] ✗ RAN OUT OF TABLES! Cannot assign ${guest.guest_name}`)
          break
        }

        assignments.push({
          invited_guest_id: guest.id,
          table_number: currentTable,
        })
        console.log(
          `[v0]   Assigned ${guest.guest_name} (${partySize}) to Table ${currentTable} [${currentTableCapacity}/${MAX_TABLE_CAPACITY}]`,
        )
      }
    }

    console.log(`[v0] ✓ Created ${assignments.length} assignments across ${currentTable} tables`)

    // Step 5: Write to database using upsert with invited_guest_id
    console.log("[v0] Step 5: Writing assignments to database...")
    let successCount = 0
    let errorCount = 0

    for (const assignment of assignments) {
      try {
        // Check if record exists
        const { data: existing } = await supabase
          .from("seating_assignments")
          .select("id")
          .eq("invited_guest_id", assignment.invited_guest_id)
          .maybeSingle()

        if (existing) {
          // Update existing record
          const { error } = await supabase
            .from("seating_assignments")
            .update({
              table_number: assignment.table_number,
              updated_at: new Date().toISOString(),
            })
            .eq("id", existing.id)

          if (error) throw error
          successCount++
        } else {
          // Insert new record
          const { error } = await supabase.from("seating_assignments").insert({
            invited_guest_id: assignment.invited_guest_id,
            table_number: assignment.table_number,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })

          if (error) throw error
          successCount++
        }
      } catch (err: any) {
        console.error(`[v0] ✗ Error assigning guest ID ${assignment.invited_guest_id}:`, err.message)
        errorCount++
      }
    }

    console.log(`[v0] ✓ Successfully assigned ${successCount} guests`)
    if (errorCount > 0) {
      console.error(`[v0] ✗ ${errorCount} errors occurred`)
    }

    // Generate summary
    const tableSummary: any[] = []
    for (let i = 1; i <= currentTable; i++) {
      const tableAssignments = assignments.filter((a) => a.table_number === i)
      const totalCapacity = tableAssignments.reduce((sum, a) => {
        const guest = allGuests.find((g) => g.id === a.invited_guest_id)
        return sum + (guest?.guestCount || 1)
      }, 0)

      tableSummary.push({
        table: i,
        guests: tableAssignments.length,
        capacity: totalCapacity,
        emptySeats: MAX_TABLE_CAPACITY - totalCapacity,
      })
    }

    console.log("[v0] ========== AUTO-ASSIGN COMPLETE ==========")

    return NextResponse.json({
      success: true,
      message: `Successfully assigned ${successCount} guests to ${currentTable} tables`,
      summary: tableSummary,
    })
  } catch (error: any) {
    console.error("[v0] ========== AUTO-ASSIGN FAILED ==========")
    console.error("[v0] Error:", error)
    return NextResponse.json({ success: false, error: error.message || "Internal server error" }, { status: 500 })
  }
}
