import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export const dynamic = "force-dynamic"

const MAX_TABLE_CAPACITY = 10
const MIN_EMPTY_SEATS = 2
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

    // Fetch all invited guests
    const { data: invitedGuests, error: guestsError } = await supabase
      .from("invited_guests")
      .select("*")
      .order("guest_name")

    if (guestsError) {
      return NextResponse.json({ success: false, error: guestsError.message }, { status: 500 })
    }

    // Fetch RSVPs
    const { data: rsvps, error: rsvpError } = await supabase.from("rsvps").select("*")

    if (rsvpError) {
      console.warn("[v0] Auto-Assign: Could not fetch RSVPs:", rsvpError.message)
    }

    // Fetch existing seating to preserve entourage assignments
    const { data: existingSeating, error: seatingError } = await supabase.from("seating_assignments").select("*")

    if (seatingError) {
      console.warn("[v0] Auto-Assign: Could not fetch existing seating:", seatingError.message)
    }

    // Create RSVP map
    const rsvpMap = new Map()
    rsvps?.forEach((rsvp: any) => {
      if (rsvp.email) rsvpMap.set(rsvp.email.toLowerCase(), rsvp)
      if (rsvp.guest_name) rsvpMap.set(rsvp.guest_name.toLowerCase(), rsvp)
    })

    // Create existing seating map
    const existingSeatingMap = new Map()
    existingSeating?.forEach((seat: any) => {
      const key = seat.email?.toLowerCase() || seat.guest_name?.toLowerCase()
      if (key) existingSeatingMap.set(key, seat)
    })

    // Categorize guests
    const entourageGuests: any[] = []
    const attendingGuests: any[] = []

    invitedGuests?.forEach((guest: any) => {
      const key = guest.email?.toLowerCase() || guest.guest_name?.toLowerCase()
      const existingSeat = existingSeatingMap.get(key)
      const rsvp = rsvpMap.get(guest.email?.toLowerCase()) || rsvpMap.get(guest.guest_name?.toLowerCase())

      const isEntourage = existingSeat?.special_notes?.toUpperCase().includes("ENTOURAGE")
      const hasRsvpdYes = rsvp?.attendance === "yes"

      if (isEntourage) {
        entourageGuests.push({
          ...guest,
          guestCount: rsvp?.guest_count || guest.allowed_party_size || 1,
          existingTable: existingSeat?.table_number || 0,
        })
      } else if (hasRsvpdYes) {
        attendingGuests.push({
          ...guest,
          guestCount: rsvp?.guest_count || guest.allowed_party_size || 1,
          existingTable: existingSeat?.table_number || 0,
        })
      }
    })

    console.log(`[v0] Auto-Assign: Found ${entourageGuests.length} entourage, ${attendingGuests.length} attending`)

    // Initialize tables
    const tables: { [key: number]: { guests: any[]; capacity: number } } = {}
    for (let i = 1; i <= TOTAL_TABLES; i++) {
      tables[i] = { guests: [], capacity: 0 }
    }

    // Preserve existing entourage seating
    entourageGuests.forEach((guest) => {
      if (guest.existingTable > 0 && guest.existingTable <= TOTAL_TABLES) {
        tables[guest.existingTable].guests.push(guest)
        tables[guest.existingTable].capacity += guest.guestCount
      }
    })

    // Assign unassigned entourage first
    const unassignedEntourage = entourageGuests.filter((g) => g.existingTable === 0)
    unassignedEntourage.forEach((guest) => {
      // Find table with lowest capacity that can fit this party
      const availableTables = Object.entries(tables)
        .filter(([_, table]) => table.capacity + guest.guestCount <= MAX_TABLE_CAPACITY)
        .sort(([_, a], [__, b]) => b.capacity - a.capacity) // Fill fuller tables first

      if (availableTables.length > 0) {
        const [tableNum, table] = availableTables[0]
        table.guests.push(guest)
        table.capacity += guest.guestCount
      }
    })

    // Assign attending guests to fill tables efficiently
    attendingGuests.forEach((guest) => {
      // Find best table for this guest
      const availableTables = Object.entries(tables)
        .filter(([_, table]) => {
          const remainingCapacity = MAX_TABLE_CAPACITY - table.capacity
          return remainingCapacity >= guest.guestCount && remainingCapacity - guest.guestCount <= MIN_EMPTY_SEATS
        })
        .sort(([_, a], [__, b]) => b.capacity - a.capacity) // Prefer fuller tables

      if (availableTables.length > 0) {
        const [tableNum, table] = availableTables[0]
        table.guests.push(guest)
        table.capacity += guest.guestCount
      } else {
        // No optimal fit, just find any table with space
        const anyTable = Object.entries(tables)
          .filter(([_, table]) => table.capacity + guest.guestCount <= MAX_TABLE_CAPACITY)
          .sort(([_, a], [__, b]) => a.capacity - b.capacity)[0] // Fill emptiest table

        if (anyTable) {
          const [tableNum, table] = anyTable
          table.guests.push(guest)
          table.capacity += guest.guestCount
        }
      }
    })

    // Build updates array with existing IDs where available
    const updates: any[] = []
    Object.entries(tables).forEach(([tableNum, table]) => {
      table.guests.forEach((guest) => {
        const key = guest.email?.toLowerCase() || guest.guest_name?.toLowerCase()
        const existingSeat = existingSeatingMap.get(key)

        updates.push({
          id: existingSeat?.id, // Include existing ID if found
          guest_name: guest.guest_name,
          email: guest.email,
          table_number: Number.parseInt(tableNum),
          special_notes: existingSeat?.special_notes || null,
        })
      })
    })

    console.log(`[v0] Auto-Assign: Generated ${updates.length} table assignments`)

    let successCount = 0
    let errorCount = 0

    for (const update of updates) {
      try {
        if (update.id) {
          // Update existing record by ID
          const { error } = await supabase
            .from("seating_assignments")
            .update({
              table_number: update.table_number,
              updated_at: new Date().toISOString(),
            })
            .eq("id", update.id)

          if (error) {
            console.error(`[v0] Auto-Assign: Error updating ${update.guest_name}:`, error.message)
            errorCount++
          } else {
            successCount++
          }
        } else {
          // Insert new record
          const { error } = await supabase.from("seating_assignments").insert({
            guest_name: update.guest_name,
            email: update.email,
            table_number: update.table_number,
            special_notes: update.special_notes,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })

          if (error) {
            console.error(`[v0] Auto-Assign: Error inserting ${update.guest_name}:`, error.message)
            errorCount++
          } else {
            successCount++
          }
        }
      } catch (err: any) {
        console.error(`[v0] Auto-Assign: Exception for ${update.guest_name}:`, err.message)
        errorCount++
      }
    }

    console.log(`[v0] Auto-Assign: Success: ${successCount}, Errors: ${errorCount}`)

    // Generate summary
    const summary = Object.entries(tables)
      .filter(([_, table]) => table.capacity > 0)
      .map(([tableNum, table]) => ({
        table: Number.parseInt(tableNum),
        guests: table.guests.length,
        capacity: table.capacity,
        emptySeats: MAX_TABLE_CAPACITY - table.capacity,
      }))

    console.log("[v0] Auto-Assign: Complete!", summary)

    return NextResponse.json({
      success: true,
      message: `Assigned ${successCount} guests to ${summary.length} tables (${errorCount} errors)`,
      summary,
    })
  } catch (error) {
    console.error("[v0] Auto-Assign: Error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
