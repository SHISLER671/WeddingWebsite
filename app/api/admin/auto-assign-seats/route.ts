import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

const MAX_TABLE_CAPACITY = 10
const TOTAL_TABLES = 26

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    console.log("[v0] ========== AUTO-ASSIGN STARTING ==========")

    console.log("[v0] Step 1: Clearing all existing table assignments in rsvps...")
    const { error: clearError } = await supabase.from("rsvps").update({ table_number: 0 }).gte("table_number", 0)

    if (clearError) {
      console.error("[v0] Error clearing tables:", clearError.message)
    } else {
      console.log("[v0] ✓ All table assignments cleared in rsvps")
    }

    console.log("[v0] Step 2: Loading guests with RSVPs...")
    const { data: invitedGuests, error: loadError } = await supabase
      .from("invited_guests")
      .select(
        `
        id,
        guest_name,
        email,
        allowed_party_size,
        is_entourage,
        rsvps (
          id,
          attendance,
          guest_count
        )
      `,
      )
      .order("guest_name")

    if (loadError) {
      throw new Error(`Failed to load guests: ${loadError.message}`)
    }

    console.log(`[v0] ✓ Loaded ${invitedGuests?.length || 0} invited guests`)

    // Step 3: Categorize guests
    console.log("[v0] Step 3: Categorizing guests...")
    const guestsToAssign: any[] = []

    invitedGuests?.forEach((guest: any) => {
      const rsvp = guest.rsvps?.[0]
      const isEntourage = guest.is_entourage === true
      const isAttending = rsvp?.attendance === "yes"

      if (!rsvp || (!isEntourage && !isAttending)) {
        return // Skip guests with no RSVP or not attending
      }

      const guestCount = Math.max(1, rsvp?.guest_count || guest.allowed_party_size || 1)

      console.log(
        `[v0]   ${guest.guest_name}: entourage=${isEntourage}, attendance=${rsvp?.attendance}, count=${guestCount}`,
      )

      guestsToAssign.push({
        ...guest,
        rsvpId: rsvp.id,
        guestCount,
        isEntourage,
      })
    })

    const entourageCount = guestsToAssign.filter((g) => g.isEntourage).length
    const attendingCount = guestsToAssign.filter((g) => !g.isEntourage).length
    console.log(`[v0] ✓ Found ${entourageCount} entourage, ${attendingCount} attending guests`)

    // Sort: entourage first, then by party size (largest first)
    guestsToAssign.sort((a, b) => {
      if (a.isEntourage && !b.isEntourage) return -1
      if (!a.isEntourage && b.isEntourage) return 1
      return b.guestCount - a.guestCount
    })

    const totalHeadcount = guestsToAssign.reduce((sum, g) => sum + g.guestCount, 0)
    console.log(`[v0] ✓ Total: ${guestsToAssign.length} parties, ${totalHeadcount} people`)

    // Step 4: Assign to tables sequentially
    console.log("[v0] Step 4: Assigning guests to tables...")
    let currentTable = 1
    let currentTableCapacity = 0
    let successCount = 0
    let errorCount = 0

    for (const guest of guestsToAssign) {
      const partySize = guest.guestCount

      // Check if party fits in current table
      if (currentTableCapacity + partySize > MAX_TABLE_CAPACITY) {
        // Move to next table
        currentTable++
        currentTableCapacity = 0

        if (currentTable > TOTAL_TABLES) {
          console.error(`[v0] ✗ RAN OUT OF TABLES! Cannot assign ${guest.guest_name}`)
          break
        }
      }

      try {
        const { error: updateError } = await supabase
          .from("rsvps")
          .update({ table_number: currentTable })
          .eq("id", guest.rsvpId)

        if (updateError) {
          console.error(`[v0] ✗ Error assigning ${guest.guest_name}:`, updateError.message)
          errorCount++
          continue
        }

        currentTableCapacity += partySize
        successCount++

        console.log(
          `[v0]   Assigned ${guest.guest_name} (${partySize}) to Table ${currentTable} [${currentTableCapacity}/${MAX_TABLE_CAPACITY}]`,
        )
      } catch (err: any) {
        console.error(`[v0] ✗ Error assigning ${guest.guest_name}:`, err.message)
        errorCount++
      }
    }

    const tablesUsed = currentTable
    console.log(`[v0] ✓ Successfully assigned ${successCount} guests across ${tablesUsed} tables`)
    if (errorCount > 0) {
      console.error(`[v0] ✗ ${errorCount} errors occurred`)
    }

    console.log("[v0] ========== AUTO-ASSIGN COMPLETE ==========")

    return NextResponse.json({
      success: true,
      message: `Successfully assigned ${successCount} guests to ${tablesUsed} tables`,
      stats: {
        assigned: successCount,
        errors: errorCount,
        tables: tablesUsed,
        totalPeople: totalHeadcount,
      },
    })
  } catch (error: any) {
    console.error("[v0] ========== AUTO-ASSIGN FAILED ==========")
    console.error("[v0] Error:", error)
    return NextResponse.json({ success: false, error: error.message || "Unknown error" }, { status: 500 })
  }
}
