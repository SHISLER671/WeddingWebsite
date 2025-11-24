#!/usr/bin/env node

/**
 * Generate SQL to clean and sync seating_assignments table with ONLY CSV data
 * This will DELETE all existing records and INSERT only the CSV guests
 * 
 * Usage:
 *   node scripts/generate-clean-seating-sql.js [csv-file] > output.sql
 */

const fs = require('fs');
const path = require('path');

function parseCSV(csvPath) {
  const content = fs.readFileSync(csvPath, 'utf8');
  const lines = content.trim().split('\n');
  const guests = [];
  
  // Skip header
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    // Parse CSV line (handling quoted fields)
    const values = [];
    let current = '';
    let inQuotes = false;
    
    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim());
    
    const guestName = values[0]?.replace(/^"|"$/g, '') || '';
    const email = values[1]?.replace(/^"|"$/g, '') || '';
    const tableNumber = values[2]?.replace(/^"|"$/g, '') || '0';
    const seatNumber = values[3]?.replace(/^"|"$/g, '') || '0';
    const plusOneName = values[4]?.replace(/^"|"$/g, '') || '';
    const plusOneSeat = values[5]?.replace(/^"|"$/g, '') || '';
    const dietaryNotes = values[6]?.replace(/^"|"$/g, '') || '';
    const specialNotes = values[7]?.replace(/^"|"$/g, '') || '';
    
    if (guestName && email) {
      guests.push({
        guest_name: guestName.replace(/'/g, "''"), // Escape single quotes for SQL
        email: email.replace(/'/g, "''"),
        table_number: parseInt(tableNumber) || 0,
        seat_number: parseInt(seatNumber) || 0,
        plus_one_name: plusOneName ? plusOneName.replace(/'/g, "''") : null,
        plus_one_seat: plusOneSeat ? parseInt(plusOneSeat) : null,
        dietary_notes: dietaryNotes ? dietaryNotes.replace(/'/g, "''") : null,
        special_notes: specialNotes ? specialNotes.replace(/'/g, "''") : null,
      });
    }
  }
  
  return guests;
}

function generateSQL(guests) {
  let sql = `-- ============================================
-- Clean and Sync Seating Assignments - CSV ONLY
-- Generated: ${new Date().toISOString()}
-- Total guests from CSV: ${guests.length}
-- ============================================
-- 
-- WARNING: This will DELETE ALL existing records
-- and INSERT ONLY the ${guests.length} guests from the CSV
-- ============================================

BEGIN;

-- Step 1: Delete ALL existing seating assignments
DELETE FROM seating_assignments;

-- Step 2: Insert ONLY guests from CSV
`;

  // Generate INSERT statements
  guests.forEach((guest, index) => {
    const plusOneNameSQL = guest.plus_one_name ? `'${guest.plus_one_name}'` : 'NULL';
    const plusOneSeatSQL = guest.plus_one_seat !== null ? guest.plus_one_seat : 'NULL';
    const dietaryNotesSQL = guest.dietary_notes ? `'${guest.dietary_notes}'` : 'NULL';
    const specialNotesSQL = guest.special_notes ? `'${guest.special_notes}'` : 'NULL';
    
    sql += `INSERT INTO seating_assignments (
  guest_name,
  email,
  table_number,
  seat_number,
  plus_one_name,
  plus_one_seat,
  dietary_notes,
  special_notes
) VALUES (
  '${guest.guest_name}',
  '${guest.email}',
  ${guest.table_number},
  ${guest.seat_number},
  ${plusOneNameSQL},
  ${plusOneSeatSQL},
  ${dietaryNotesSQL},
  ${specialNotesSQL}
);

`;
  });

  sql += `-- Verification query
SELECT 
  COUNT(*) as total_records,
  COUNT(DISTINCT email) as unique_emails,
  COUNT(DISTINCT table_number) as total_tables,
  COUNT(CASE WHEN table_number > 0 THEN 1 END) as assigned_guests,
  COUNT(CASE WHEN table_number = 0 THEN 1 END) as unassigned_guests
FROM seating_assignments;

COMMIT;

-- ============================================
-- Clean import complete!
-- Table now contains ONLY the ${guests.length} guests from CSV
-- ============================================
`;

  return sql;
}

async function main() {
  const csvFile = process.argv[2] || path.join(__dirname, '..', 'tmp', 'master-guest-list.csv');
  
  if (!fs.existsSync(csvFile)) {
    console.error(`❌ Error: CSV file not found: ${csvFile}`);
    process.exit(1);
  }
  
  console.error(`📁 Reading CSV: ${csvFile}`);
  const guests = parseCSV(csvFile);
  console.error(`📋 Found ${guests.length} guests`);
  
  const sql = generateSQL(guests);
  console.log(sql);
}

main().catch(console.error);
