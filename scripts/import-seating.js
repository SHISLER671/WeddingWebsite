#!/usr/bin/env node

/**
 * CSV Import Script for Seating Assignments
 * 
 * This script imports seating assignments from a CSV file.
 * 
 * CSV Format:
 * guest_name,email,table_number,seat_number,plus_one_name,plus_one_seat,dietary_notes,special_notes
 * John Smith,john@example.com,1,1,Jane Smith,2,Vegetarian,Close to dance floor
 * Sarah Johnson,sarah@example.com,1,3,,,,
 * 
 * Usage:
 *   node scripts/import-seating.js seating-assignments.csv
 */

const fs = require('fs')
const path = require('path')
const { createClient } = require('@supabase/supabase-js')

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

function parseCSV(csvContent) {
  const lines = csvContent.trim().split('\n')
  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''))
  
  const data = []
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''))
    const row = {}
    
    headers.forEach((header, index) => {
      row[header] = values[index] || null
    })
    
    data.push(row)
  }
  
  return data
}

async function importSeatingAssignments(csvData) {
  console.log(`📥 Importing ${csvData.length} seating assignments...`)
  
  let successCount = 0
  let errorCount = 0
  
  for (const row of csvData) {
    try {
      const { data, error } = await supabase
        .from('seating_assignments')
        .upsert({
          guest_name: row.guest_name,
          email: row.email,
          table_number: parseInt(row.table_number),
          seat_number: parseInt(row.seat_number),
          plus_one_name: row.plus_one_name || null,
          plus_one_seat: row.plus_one_seat ? parseInt(row.plus_one_seat) : null,
          dietary_notes: row.dietary_notes || null,
          special_notes: row.special_notes || null
        }, {
          onConflict: 'email'
        })
        .select()
        .single()

      if (error) {
        console.error(`❌ Error importing ${row.guest_name}:`, error.message)
        errorCount++
      } else {
        console.log(`✅ Imported: ${row.guest_name} (Table ${row.table_number}, Seat ${row.seat_number})`)
        successCount++
      }
    } catch (error) {
      console.error(`❌ Error importing ${row.guest_name}:`, error.message)
      errorCount++
    }
  }
  
  console.log('\n📊 Import Summary:')
  console.log(`✅ Successful: ${successCount}`)
  console.log(`❌ Errors: ${errorCount}`)
  console.log(`📋 Total: ${csvData.length}`)
}

async function main() {
  const csvFile = process.argv[2]
  
  if (!csvFile) {
    console.log('❌ Usage: node scripts/import-seating.js <csv-file>')
    console.log('')
    console.log('CSV Format:')
    console.log('guest_name,email,table_number,seat_number,plus_one_name,plus_one_seat,dietary_notes,special_notes')
    console.log('John Smith,john@example.com,1,1,Jane Smith,2,Vegetarian,Close to dance floor')
    console.log('Sarah Johnson,sarah@example.com,1,3,,,,')
    process.exit(1)
  }
  
  if (!fs.existsSync(csvFile)) {
    console.log(`❌ File not found: ${csvFile}`)
    process.exit(1)
  }
  
  try {
    const csvContent = fs.readFileSync(csvFile, 'utf8')
    const csvData = parseCSV(csvContent)
    
    console.log('🪑 Seating Assignment CSV Import')
    console.log('=' .repeat(40))
    console.log(`📁 File: ${csvFile}`)
    console.log(`📋 Records: ${csvData.length}`)
    console.log('')
    
    await importSeatingAssignments(csvData)
  } catch (error) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  }
}

main().catch(console.error)
