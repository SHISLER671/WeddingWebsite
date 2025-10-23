#!/usr/bin/env node

/**
 * Seating Assignment Management Script
 * 
 * This script helps you manage seating assignments for your wedding.
 * You can add, update, and view seating assignments.
 * 
 * Usage:
 *   node scripts/manage-seating.js add "John Smith" "john@example.com" 1 1 "Jane Smith" 2
 *   node scripts/manage-seating.js list
 *   node scripts/manage-seating.js table 1
 *   node scripts/manage-seating.js stats
 */

const { createClient } = require('@supabase/supabase-js')

// Load environment variables
require('dotenv').config({ path: '.env.local' })

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function addSeatingAssignment(guestName, email, tableNumber, seatNumber, plusOneName = null, plusOneSeat = null, dietaryNotes = null, specialNotes = null) {
  try {
    const { data, error } = await supabase
      .from('seating_assignments')
      .insert({
        guest_name: guestName,
        email: email,
        table_number: parseInt(tableNumber),
        seat_number: parseInt(seatNumber),
        plus_one_name: plusOneName,
        plus_one_seat: plusOneSeat ? parseInt(plusOneSeat) : null,
        dietary_notes: dietaryNotes,
        special_notes: specialNotes
      })
      .select()
      .single()

    if (error) {
      console.error('❌ Error adding seating assignment:', error.message)
      return false
    }

    console.log('✅ Seating assignment added successfully!')
    console.log(`   Guest: ${data.guest_name}`)
    console.log(`   Email: ${data.email}`)
    console.log(`   Table: ${data.table_number}, Seat: ${data.seat_number}`)
    if (data.plus_one_name) {
      console.log(`   Plus One: ${data.plus_one_name} (Seat ${data.plus_one_seat})`)
    }
    return true
  } catch (error) {
    console.error('❌ Error:', error.message)
    return false
  }
}

async function listAllAssignments() {
  try {
    const { data, error } = await supabase
      .from('seating_assignments')
      .select('*')
      .order('table_number', { ascending: true })
      .order('seat_number', { ascending: true })

    if (error) {
      console.error('❌ Error fetching assignments:', error.message)
      return
    }

    console.log('📋 All Seating Assignments:')
    console.log('=' .repeat(80))
    
    if (data.length === 0) {
      console.log('No seating assignments found.')
      return
    }

    data.forEach(assignment => {
      console.log(`Table ${assignment.table_number}, Seat ${assignment.seat_number}: ${assignment.guest_name} (${assignment.email})`)
      if (assignment.plus_one_name) {
        console.log(`  └─ Plus One: ${assignment.plus_one_name} (Seat ${assignment.plus_one_seat})`)
      }
      if (assignment.dietary_notes) {
        console.log(`  └─ Dietary: ${assignment.dietary_notes}`)
      }
      if (assignment.special_notes) {
        console.log(`  └─ Special: ${assignment.special_notes}`)
      }
    })
  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}

async function getTableAssignments(tableNumber) {
  try {
    const { data, error } = await supabase
      .from('seating_assignments')
      .select('*')
      .eq('table_number', parseInt(tableNumber))
      .order('seat_number', { ascending: true })

    if (error) {
      console.error('❌ Error fetching table assignments:', error.message)
      return
    }

    console.log(`🪑 Table ${tableNumber} Assignments:`)
    console.log('=' .repeat(40))
    
    if (data.length === 0) {
      console.log('No assignments found for this table.')
      return
    }

    data.forEach(assignment => {
      console.log(`Seat ${assignment.seat_number}: ${assignment.guest_name} (${assignment.email})`)
      if (assignment.plus_one_name) {
        console.log(`  └─ Plus One: ${assignment.plus_one_name} (Seat ${assignment.plus_one_seat})`)
      }
    })
  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}

async function getSeatingStats() {
  try {
    const { data, error } = await supabase
      .from('seating_assignments')
      .select('table_number')

    if (error) {
      console.error('❌ Error fetching stats:', error.message)
      return
    }

    const totalGuests = data.length
    const uniqueTables = [...new Set(data.map(item => item.table_number))].length
    const avgGuestsPerTable = totalGuests / uniqueTables

    console.log('📊 Seating Statistics:')
    console.log('=' .repeat(30))
    console.log(`Total Guests: ${totalGuests}`)
    console.log(`Total Tables: ${uniqueTables}`)
    console.log(`Average per Table: ${avgGuestsPerTable.toFixed(1)}`)
  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}

// Main function
async function main() {
  const command = process.argv[2]

  switch (command) {
    case 'add':
      const [guestName, email, tableNumber, seatNumber, plusOneName, plusOneSeat, dietaryNotes, specialNotes] = process.argv.slice(3)
      if (!guestName || !tableNumber || !seatNumber) {
        console.log('❌ Usage: node manage-seating.js add "Guest Name" [email@example.com] tableNumber seatNumber [plusOneName] [plusOneSeat] [dietaryNotes] [specialNotes]')
        console.log('   Note: Email is optional - seating assignments work primarily by guest name')
        process.exit(1)
      }
      await addSeatingAssignment(guestName, email || '', tableNumber, seatNumber, plusOneName, plusOneSeat, dietaryNotes, specialNotes)
      break

    case 'list':
      await listAllAssignments()
      break

    case 'table':
      const tableNum = process.argv[3]
      if (!tableNum) {
        console.log('❌ Usage: node manage-seating.js table tableNumber')
        process.exit(1)
      }
      await getTableAssignments(tableNum)
      break

    case 'stats':
      await getSeatingStats()
      break

    default:
      console.log('🪑 Seating Assignment Management')
      console.log('=' .repeat(40))
      console.log('Commands:')
      console.log('  add     - Add a new seating assignment')
      console.log('  list    - List all seating assignments')
      console.log('  table   - Show assignments for a specific table')
      console.log('  stats   - Show seating statistics')
      console.log('')
      console.log('Examples:')
      console.log('  node manage-seating.js add "John Smith" 1 1 "Jane Smith" 2')
      console.log('  node manage-seating.js add "Sarah Johnson" "sarah@example.com" 1 3')
      console.log('  node manage-seating.js list')
      console.log('  node manage-seating.js table 1')
      console.log('  node manage-seating.js stats')
      break
  }
}

main().catch(console.error)
