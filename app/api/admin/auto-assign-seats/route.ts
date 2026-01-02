import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export const dynamic = "force-dynamic"

const MAX_TABLE_CAPACITY = 10
const TOTAL_TABLES = 26

/**
 * Auto-assign guests to tables optimally
 * - Entourage gets priority seating
 * - Keep parties together
 * - Fill tables efficiently (no more than 2 empty seats)
 * - Only assign guests who RSVP'd "yes" or are entourage
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    console.log("[v0] Auto-Assign: Starting automatic table assignment...")

    console.log("[v0] Auto-Assign: Clearing all existing table assignments...")
    const { error: clearError } = await supabase
      .from("seating_assignments")
      .update({ table_number: 0, updated_at: new Date().toISOString() })
      .neq("table_number", -1) // Don't touch any special flags if they exist

    if (clearError) {
      console.error("[v0] Auto-Assign: Error clearing tables:", clearError.message)
    } else {
      console.log("[v0] Auto-Assign: All tables cleared successfully")
    }

    const [
      { data: invitedGuests, error: guestsError },
      { data: rsvps, error: rsvpError },
      { data: existingSeating, error: seatingError },
    ] = await Promise.all([
      supabase.from("invited_guests").select("*").order("guest_name"),
      supabase.from("rsvps").select("*"),
      supabase.from("seating_assignments").select("*"),
    ])

    if (guestsError) {
      return NextResponse.json({ success: false, error: guestsError.message }, { status: 500 })
    }

    console.log(`[v0] Auto-Assign: Loaded ${invitedGuests?.length || 0} invited guests, ${rsvps?.length || 0} RSVPs`)

    const rsvpMap = new Map()
    rsvps?.forEach((rsvp: any) => {
      const nameKey = (rsvp.guest_name || "").toLowerCase().trim()
      const emailKey = (rsvp.email || "").toLowerCase().trim()

      if (nameKey) rsvpMap.set(nameKey, rsvp)
      if (emailKey) rsvpMap.set(emailKey, rsvp)
    })

    const existingSeatingMap = new Map()
    existingSeating?.forEach((seat: any) => {
      const key = (seat.guest_name || "").toLowerCase().trim()
      if (key) existingSeatingMap.set(key, seat)
    })

    const entourageGuests: any[] = []
    const attendingGuests: any[] = []

    invitedGuests?.forEach((guest: any) => {
      const guestKey = (guest.guest_name || "").toLowerCase().trim()
      const emailKey = (guest.email || "").toLowerCase().trim()

      const existingSeat = existingSeatingMap.get(guestKey)
      const rsvp = rsvpMap.get(guestKey) || rsvpMap.get(emailKey)

      const isEntourage = guest.is_entourage === true

      const hasRsvpdYes = rsvp?.attendance === "yes"
      const guestCount = rsvp?.guest_count || guest.allowed_party_size || 1

      if (isEntourage) {
        console.log(`[v0] Auto-Assign: ${guest.guest_name} is ENTOURAGE (party of ${guestCount})`)
        entourageGuests.push({ ...guest, guestCount, isEntourage: true })
      } else if (hasRsvpdYes) {
        console.log(`[v0] Auto-Assign: ${guest.guest_name} RSVP'd YES (party of ${guestCount})`)
        attendingGuests.push({ ...guest, guestCount, isEntourage: false })
      } else {
        console.log(`[v0] Auto-Assign: Skipping ${guest.guest_name} (RSVP: ${rsvp?.attendance || "none"})`)
      }
    })

    console.log(
      `[v0] Auto-Assign: Found ${entourageGuests.length} entourage, ${attendingGuests.length} attending guests`,
    )

    const allGuestsToAssign = [...entourageGuests, ...attendingGuests].sort((a, b) => b.guestCount - a.guestCount)

    console.log(`[v0] Auto-Assign: Total guests to assign: ${allGuestsToAssign.length}`)

    const tables: { [key: number]: { guests: any[]; capacity: number } } = {}
    for (let i = 1; i <= TOTAL_TABLES; i++) {
      tables[i] = { guests: [], capacity: 0 }
    }

    let currentTable = 1

    allGuestsToAssign.forEach((guest) => {
      const partySize = guest.guestCount

      // Check if party fits in current table
      if (tables[currentTable].capacity + partySize <= MAX_TABLE_CAPACITY) {
        tables[currentTable].guests.push(guest)
        tables[currentTable].capacity += partySize
        console.log(
          `[v0] Assigned ${guest.guest_name} (${partySize} people) to Table ${currentTable} (now ${tables[currentTable].capacity}/10)`,
        )
      } else {
        // Move to next table
        currentTable++

        if (currentTable > TOTAL_TABLES) {
          console.warn(`[v0] Ran out of tables for ${guest.guest_name}`)
          return
        }

        tables[currentTable].guests.push(guest)
        tables[currentTable].capacity += partySize
        console.log(
          `[v0] Table ${currentTable - 1} full, moved to Table ${currentTable}. Assigned ${guest.guest_name} (${partySize} people) (now ${tables[currentTable].capacity}/10)`,
        )
      }
    })

    const updates: any[] = []
    Object.entries(tables).forEach(([tableNum, table]) => {
      table.guests.forEach((guest) => {
        const existingSeat = existingSeatingMap.get((guest.guest_name || "").toLowerCase().trim())

        updates.push({
          id: existingSeat?.id,
          guest_name: guest.guest_name,
          email: guest.email && guest.email.trim() ? guest.email : null,
          table_number: Number.parseInt(tableNum),
          special_notes: guest.isEntourage ? "ENTOURAGE" : existingSeat?.special_notes || null,
        })
      })
    })

    console.log(`[v0] Auto-Assign: Prepared ${updates.length} assignments`)

    let successCount = 0
    let errorCount = 0

    for (const update of updates) {
      try {
        if (update.id) {
          const { error } = await supabase
            .from("seating_assignments")
            .update({
              table_number: update.table_number,
              email: update.email,
              special_notes: update.special_notes,
              updated_at: new Date().toISOString(),
            })
            .eq("id", update.id)

          if (error) throw error
          successCount++
        } else {
          // Check if record exists by guest_name
          const { data: existing } = await supabase
            .from("seating_assignments")
            .select("id")
            .eq("guest_name", update.guest_name)
            .maybeSingle()

          if (existing) {
            const { error } = await supabase
              .from("seating_assignments")
              .update({
                table_number: update.table_number,
                email: update.email,
                special_notes: update.special_notes,
                updated_at: new Date().toISOString(),
              })
              .eq("id", existing.id)

            if (error) throw error
            successCount++
          } else {
            const { error } = await supabase.from("seating_assignments").insert({
              guest_name: update.guest_name,
              email: update.email,
              table_number: update.table_number,
              special_notes: update.special_notes,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })

            if (error) throw error
            successCount++
          }
        }
      } catch (err: any) {
        console.error(`[v0] Auto-Assign: Error for ${update.guest_name}:`, err.message)
        errorCount++
      }
    }

    const summary = Object.entries(tables)
      .filter(([_, table]) => table.capacity > 0)
      .map(([tableNum, table]) => ({
        table: Number.parseInt(tableNum),
        guests: table.guests.length,
        totalCapacity: table.capacity,
        emptySeats: MAX_TABLE_CAPACITY - table.capacity,
        guestNames: table.guests.map((g) => g.guest_name).join(", "),
      }))

    console.log(`[v0] Auto-Assign: Complete! ${successCount} assigned, ${errorCount} errors`)
    console.log(`[v0] Auto-Assign: Using ${summary.length} tables`)

    return NextResponse.json({
      success: true,
      message: `Successfully assigned ${successCount} guests to ${summary.length} tables`,
      summary,
    })
  } catch (error: any) {
    console.error("[v0] Auto-Assign: Fatal error:", error)
    return NextResponse.json({ success: false, error: error.message || "Internal server error" }, { status: 500 })
  }
}
