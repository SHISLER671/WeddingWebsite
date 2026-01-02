import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/client"

export const dynamic = "force-dynamic"

const MAX_TABLE_CAPACITY = 10
const TOTAL_TABLES = 26

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()

    console.log("[v0] ========== AUTO-ASSIGN STARTING ==========")

    console.log("[v0] Step 1: Clearing all existing table assignments in rsvps...")
    const { error: clearError } = await supabase.from("rsvps").update({ table_number: 0 }).gte("table_number", 0)

    if (clearError) {
      console.error("[v0] Error clearing tables:", clearError.message)
    } else {
      console.log("[v0] ✓ All table assignments cleared in rsvps")
    }

    console.log("[v0] Step 2: Loading guests with RSVPs...")
    // NOTE: This queries the database directly - always uses LIVE data, not cached
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

    // Step 4: Assign to tables efficiently
    console.log("[v0] Step 4: Assigning guests to tables...")
    
    // Track capacity for each table
    const tableCapacities: { [tableNum: number]: number } = {}
    const entourageTables: Set<number> = new Set() // Track which tables have entourage
    
    let successCount = 0
    let errorCount = 0

    // Helper function to find the best table for a party
    const findBestTable = (partySize: number, isEntourage: boolean): number | null => {
      if (isEntourage) {
        // For entourage: prioritize lower table numbers, and prefer tables that already have entourage
        // First pass: find entourage tables with space (starting from table 1)
        for (let tableNum = 1; tableNum <= TOTAL_TABLES; tableNum++) {
          if (entourageTables.has(tableNum)) {
            const currentCapacity = tableCapacities[tableNum] || 0
            if (currentCapacity + partySize <= MAX_TABLE_CAPACITY) {
              return tableNum
            }
          }
        }
        // Second pass: find first empty table (starting from table 1) for new entourage table
        for (let tableNum = 1; tableNum <= TOTAL_TABLES; tableNum++) {
          const currentCapacity = tableCapacities[tableNum] || 0
          if (currentCapacity === 0 && partySize <= MAX_TABLE_CAPACITY) {
            return tableNum
          }
        }
        // Third pass: find any table with space (starting from table 1)
        for (let tableNum = 1; tableNum <= TOTAL_TABLES; tableNum++) {
          const currentCapacity = tableCapacities[tableNum] || 0
          if (currentCapacity + partySize <= MAX_TABLE_CAPACITY) {
            return tableNum
          }
        }
      } else {
        // For regular guests: prefer tables without entourage, starting from higher table numbers
        // First pass: find non-entourage tables with space (starting from table 1)
        for (let tableNum = 1; tableNum <= TOTAL_TABLES; tableNum++) {
          if (!entourageTables.has(tableNum)) {
            const currentCapacity = tableCapacities[tableNum] || 0
            if (currentCapacity + partySize <= MAX_TABLE_CAPACITY) {
              return tableNum
            }
          }
        }
        // Second pass: find any table with space (will mix with entourage if needed)
        for (let tableNum = 1; tableNum <= TOTAL_TABLES; tableNum++) {
          const currentCapacity = tableCapacities[tableNum] || 0
          if (currentCapacity + partySize <= MAX_TABLE_CAPACITY) {
            return tableNum
          }
        }
      }
      
      return null // No table available
    }

    for (const guest of guestsToAssign) {
      const partySize = guest.guestCount
      const bestTable = findBestTable(partySize, guest.isEntourage)

      if (!bestTable) {
        console.error(`[v0] ✗ RAN OUT OF TABLES! Cannot assign ${guest.guest_name} (${partySize} people)`)
        errorCount++
        continue
      }

      try {
        const { error: updateError } = await supabase
          .from("rsvps")
          .update({ table_number: bestTable })
          .eq("id", guest.rsvpId)

        if (updateError) {
          console.error(`[v0] ✗ Error assigning ${guest.guest_name}:`, updateError.message)
          errorCount++
          continue
        }

        // Update table capacity tracking
        tableCapacities[bestTable] = (tableCapacities[bestTable] || 0) + partySize
        if (guest.isEntourage) {
          entourageTables.add(bestTable)
        }

        successCount++

        console.log(
          `[v0]   Assigned ${guest.guest_name} (${partySize}, ${guest.isEntourage ? 'entourage' : 'guest'}) to Table ${bestTable} [${tableCapacities[bestTable]}/${MAX_TABLE_CAPACITY}]`,
        )
      } catch (err: any) {
        console.error(`[v0] ✗ Error assigning ${guest.guest_name}:`, err.message)
        errorCount++
      }
    }

    const tablesUsed = Object.keys(tableCapacities).length
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
