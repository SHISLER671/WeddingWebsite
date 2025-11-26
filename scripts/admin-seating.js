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
    
    const { data, error } = await supabase
      .from('seating_assignments')
      .select('*')
      .ilike('guest_name', `%${searchTerm}%`)
      .order('guest_name')

    if (error) {
      console.error('❌ Search error:', error.message)
      return
    }

    if (data.length === 0) {
      console.log('❌ No guests found matching that search term')
      return
    }

    console.log(`✅ Found ${data.length} guest(s):`)
    console.log('=' .repeat(60))
    
    data.forEach(guest => {
      console.log(`👤 ${guest.guest_name}`)
      console.log(`   📧 Email: ${guest.email || 'Not provided'}`)
      console.log(`   🪑 Table ${guest.table_number}`)
      if (guest.plus_one_name) {
        console.log(`   👥 Plus One: ${guest.plus_one_name}`)
      }
      if (guest.dietary_notes) {
        console.log(`   🍽️  Dietary: ${guest.dietary_notes}`)
      }
      if (guest.special_notes) {
        console.log(`   📝 Notes: ${guest.special_notes}`)
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
    
    // Get all guests and do fuzzy matching
    const { data: allGuests, error } = await supabase
      .from('seating_assignments')
      .select('*')
      .order('guest_name')

    if (error) {
      console.error('❌ Search error:', error.message)
      return
    }

    const normalizedSearch = searchTerm.toLowerCase().trim()
    const matches = allGuests.filter(guest => {
      const normalizedName = guest.guest_name.toLowerCase()
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
    
    matches.forEach(guest => {
      console.log(`👤 ${guest.guest_name}`)
      console.log(`   📧 Email: ${guest.email || 'Not provided'}`)
      console.log(`   🪑 Table ${guest.table_number}`)
      console.log('')
    })
  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}

async function validateAssignments() {
  try {
    console.log('🔍 Validating seating assignments...')
    
    const { data: guests, error } = await supabase
      .from('seating_assignments')
      .select('*')
      .order('table_number')

    if (error) {
      console.error('❌ Validation error:', error.message)
      return
    }

    const issues = []
    const tableCounts = {}

    guests.forEach(guest => {
      const tableKey = `table_${guest.table_number}`
      // Count guests per table
      tableCounts[tableKey] = (tableCounts[tableKey] || 0) + 1
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
      const guestCount = tableCounts[table]
      console.log(`   Table ${tableNum}: ${guestCount} guest(s)`)
    })

  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}

async function exportAssignments() {
  try {
    console.log('📤 Exporting seating assignments...')
    
    const { data: guests, error } = await supabase
      .from('seating_assignments')
      .select('*')
      .order('table_number')

    if (error) {
      console.error('❌ Export error:', error.message)
      return
    }

    // Create CSV content
    const csvHeader = 'guest_name,email,table_number,plus_one_name,dietary_notes,special_notes'
    const csvRows = guests.map(guest => [
      guest.guest_name,
      guest.email || '',
      guest.table_number,
      guest.plus_one_name || '',
      guest.dietary_notes || '',
      guest.special_notes || ''
    ].map(field => `"${field}"`).join(','))

    const csvContent = [csvHeader, ...csvRows].join('\n')
    
    const fs = require('fs')
    const filename = `seating-export-${new Date().toISOString().split('T')[0]}.csv`
    fs.writeFileSync(filename, csvContent)
    
    console.log(`✅ Exported ${guests.length} assignments to ${filename}`)
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
