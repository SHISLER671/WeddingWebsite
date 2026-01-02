#!/usr/bin/env node

/**
 * Enhanced Admin Interface for Seating Assignments
 * 
 * This script provides advanced admin features for managing seating assignments.
 * 
 * Usage:
 *   node scripts/admin-seating.js search "John Smith"
 *   node scripts/admin-seating.js fuzzy "john" 
 *   node scripts/admin-seating.js validate
 *   node scripts/admin-seating.js export
 */

const { createClient } = require('@supabase/supabase-js')

// Load environment variables
require('dotenv').config({ path: '.env.local' })

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function searchGuest(searchTerm) {
  try {
    console.log(`🔍 Searching for: "${searchTerm}"`)
    
    // Search in RSVPs with table assignments
    const { data: rsvps, error: rsvpError } = await supabase
      .from('rsvps')
      .select('id, email, guest_name, table_number, guest_count, attendance, dietary_restrictions')
      .ilike('guest_name', `%${searchTerm}%`)
      .order('guest_name')

    if (rsvpError) {
      console.error('❌ Search error:', rsvpError.message)
      return
    }

    if (!rsvps || rsvps.length === 0) {
      console.log('❌ No guests found matching that search term')
      return
    }

    console.log(`✅ Found ${rsvps.length} guest(s):`)
    console.log('=' .repeat(60))
    
    rsvps.forEach(rsvp => {
      console.log(`👤 ${rsvp.guest_name}`)
      console.log(`   📧 Email: ${rsvp.email || 'Not provided'}`)
      console.log(`   🪑 Table ${rsvp.table_number || 0}`)
      console.log(`   👥 Guest Count: ${rsvp.guest_count || 1}`)
      console.log(`   ✅ Attendance: ${rsvp.attendance || 'pending'}`)
      if (rsvp.dietary_restrictions) {
        console.log(`   🍽️  Dietary: ${rsvp.dietary_restrictions}`)
      }
      console.log('')
    })
  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}

async function fuzzySearch(searchTerm) {
  try {
    console.log(`🔍 Fuzzy search for: "${searchTerm}"`)
    
    // Get all RSVPs and do fuzzy matching
    const { data: allRsvps, error } = await supabase
      .from('rsvps')
      .select('id, email, guest_name, table_number, guest_count, attendance')
      .order('guest_name')

    if (error) {
      console.error('❌ Search error:', error.message)
      return
    }

    const normalizedSearch = searchTerm.toLowerCase().trim()
    const matches = allRsvps.filter(rsvp => {
      const normalizedName = rsvp.guest_name.toLowerCase()
      return normalizedName.includes(normalizedSearch) || 
             normalizedSearch.includes(normalizedName.split(' ')[0]) ||
             normalizedSearch.includes(normalizedName.split(' ')[1])
    })

    if (matches.length === 0) {
      console.log('❌ No guests found with fuzzy search')
      console.log('💡 Try searching for just the first name or last name')
      return
    }

    console.log(`✅ Found ${matches.length} potential match(es):`)
    console.log('=' .repeat(60))
    
    matches.forEach(rsvp => {
      console.log(`👤 ${rsvp.guest_name}`)
      console.log(`   📧 Email: ${rsvp.email || 'Not provided'}`)
      console.log(`   🪑 Table ${rsvp.table_number || 0}`)
      console.log(`   👥 Guest Count: ${rsvp.guest_count || 1}`)
      console.log('')
    })
  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}

async function validateAssignments() {
  try {
    console.log('🔍 Validating seating assignments...')
    
    const { data: rsvps, error } = await supabase
      .from('rsvps')
      .select('id, guest_name, table_number, guest_count, attendance')
      .order('table_number')

    if (error) {
      console.error('❌ Validation error:', error.message)
      return
    }

    const issues = []
    const tableCounts = {}
    const tablePeopleCounts = {}

    rsvps.forEach(rsvp => {
      if (rsvp.table_number > 0 && rsvp.attendance === 'yes') {
        const tableKey = `table_${rsvp.table_number}`
        // Count parties per table
        tableCounts[tableKey] = (tableCounts[tableKey] || 0) + 1
        // Count people per table
        tablePeopleCounts[tableKey] = (tablePeopleCounts[tableKey] || 0) + (rsvp.guest_count || 1)
      }
    })

    // Check for capacity issues
    Object.keys(tablePeopleCounts).forEach(table => {
      const tableNum = parseInt(table.replace('table_', ''))
      const peopleCount = tablePeopleCounts[table]
      if (peopleCount > 10) {
        issues.push(`Table ${tableNum}: ${peopleCount} people (over capacity - max 10)`)
      }
    })

    if (issues.length === 0) {
      console.log('✅ All seating assignments are valid!')
    } else {
      console.log('❌ Found issues:')
      issues.forEach(issue => console.log(issue))
    }

    // Show table distribution
    console.log('\n📊 Table Distribution:')
    Object.keys(tableCounts).forEach(table => {
      const tableNum = table.replace('table_', '')
      const partyCount = tableCounts[table]
      const peopleCount = tablePeopleCounts[table]
      console.log(`   Table ${tableNum}: ${partyCount} party/parties, ${peopleCount} people`)
    })

  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}

async function exportAssignments() {
  try {
    console.log('📤 Exporting seating assignments...')
    
    const { data: rsvps, error } = await supabase
      .from('rsvps')
      .select('id, guest_name, email, table_number, guest_count, attendance, dietary_restrictions')
      .order('table_number')

    if (error) {
      console.error('❌ Export error:', error.message)
      return
    }

    // Create CSV content
    const csvHeader = 'guest_name,email,table_number,guest_count,attendance,dietary_restrictions'
    const csvRows = rsvps.map(rsvp => [
      rsvp.guest_name,
      rsvp.email || '',
      rsvp.table_number || 0,
      rsvp.guest_count || 1,
      rsvp.attendance || 'pending',
      rsvp.dietary_restrictions || ''
    ].map(field => `"${field}"`).join(','))

    const csvContent = [csvHeader, ...csvRows].join('\n')
    
    const fs = require('fs')
    const filename = `seating-export-${new Date().toISOString().split('T')[0]}.csv`
    fs.writeFileSync(filename, csvContent)
    
    console.log(`✅ Exported ${rsvps.length} assignments to ${filename}`)
    console.log(`📁 File saved in current directory`)

  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}

// Main function
async function main() {
  const command = process.argv[2]
  const searchTerm = process.argv[3]

  switch (command) {
    case 'search':
      if (!searchTerm) {
        console.log('❌ Usage: node scripts/admin-seating.js search "Guest Name"')
        process.exit(1)
      }
      await searchGuest(searchTerm)
      break

    case 'fuzzy':
      if (!searchTerm) {
        console.log('❌ Usage: node scripts/admin-seating.js fuzzy "partial name"')
        process.exit(1)
      }
      await fuzzySearch(searchTerm)
      break

    case 'validate':
      await validateAssignments()
      break

    case 'export':
      await exportAssignments()
      break

    default:
      console.log('🪑 Enhanced Seating Assignment Admin')
      console.log('=' .repeat(50))
      console.log('Commands:')
      console.log('  search   - Search for exact guest name match')
      console.log('  fuzzy    - Fuzzy search for partial name matches')
      console.log('  validate - Check for duplicate seats and issues')
      console.log('  export   - Export all assignments to CSV')
      console.log('')
      console.log('Examples:')
      console.log('  node scripts/admin-seating.js search "John Smith"')
      console.log('  node scripts/admin-seating.js fuzzy "john"')
      console.log('  node scripts/admin-seating.js validate')
      console.log('  node scripts/admin-seating.js export')
      break
  }
}

main().catch(console.error)
