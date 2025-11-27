#!/usr/bin/env node

/**
 * Verify All Lists Match
 * 
 * This script compares:
 * 1. CSV file vs invited_guests table
 * 2. invited_guests table vs seating_assignments table
 * 3. Reports any mismatches or missing entries
 * 
 * Usage:
 *   node scripts/verify-all-lists-match.js [csv-file]
 * 
 * Default: checks MASTERGUESTLIST.csv
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

// Initialize Supabase client
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Error: Missing Supabase credentials');
  console.error('   Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local');
  process.exit(1);
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

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
    values.push(current.trim()); // Add last value
    
    if (values.length >= 2) {
      const guestName = values[1]?.replace(/^"|"$/g, '') || '';
      if (guestName) {
        guests.push({
          guest_name: guestName,
          email: values[2]?.replace(/^"|"$/g, '') || '',
          notes: values[2]?.replace(/^"|"$/g, '') || '',
          headcount: values[3]?.replace(/^"|"$/g, '') || '',
          rsvp_status: values[4]?.replace(/^"|"$/g, '') || ''
        });
      }
    }
  }
  
  return guests;
}

function normalizeName(name) {
  return (name || '').trim().toLowerCase();
}

async function verifyAllLists() {
  try {
    console.log('🔍 Verifying all lists match...\n');
    console.log('='.repeat(80));
    
    // Step 1: Parse CSV
    const csvFile = process.argv[2] || path.join(__dirname, '..', 'MASTERGUESTLIST.csv');
    
    if (!fs.existsSync(csvFile)) {
      console.error(`❌ Error: CSV file not found: ${csvFile}`);
      process.exit(1);
    }
    
    console.log(`📁 CSV file: ${csvFile}`);
    const csvGuests = parseCSV(csvFile);
    console.log(`   ✅ Found ${csvGuests.length} guests in CSV\n`);
    
    // Step 2: Fetch invited_guests
    console.log('📋 Fetching invited_guests from database...');
    const { data: invitedGuests, error: invitedError } = await supabase
      .from('invited_guests')
      .select('guest_name, email')
      .order('guest_name');
    
    if (invitedError) {
      console.error('❌ Error fetching invited_guests:', invitedError.message);
      process.exit(1);
    }
    
    console.log(`   ✅ Found ${invitedGuests.length} guests in invited_guests table\n`);
    
    // Step 3: Fetch seating_assignments
    console.log('🪑 Fetching seating_assignments from database...');
    const { data: seatingAssignments, error: seatingError } = await supabase
      .from('seating_assignments')
      .select('guest_name, email, table_number')
      .order('guest_name');
    
    if (seatingError) {
      console.error('❌ Error fetching seating_assignments:', seatingError.message);
      process.exit(1);
    }
    
    console.log(`   ✅ Found ${seatingAssignments.length} guests in seating_assignments table\n`);
    
    // Step 4: Create normalized maps
    const csvMap = new Map();
    csvGuests.forEach(g => {
      const key = normalizeName(g.guest_name);
      csvMap.set(key, g);
    });
    
    const invitedMap = new Map();
    invitedGuests.forEach(g => {
      const key = normalizeName(g.guest_name);
      invitedMap.set(key, g);
    });
    
    const seatingMap = new Map();
    seatingAssignments.forEach(g => {
      const key = normalizeName(g.guest_name);
      seatingMap.set(key, g);
    });
    
    // Step 5: Compare CSV vs invited_guests
    console.log('='.repeat(80));
    console.log('📊 COMPARISON: CSV vs invited_guests');
    console.log('='.repeat(80));
    
    const csvOnly = [];
    const invitedOnly = [];
    const matches = [];
    
    csvMap.forEach((csvGuest, key) => {
      if (invitedMap.has(key)) {
        matches.push(csvGuest.guest_name);
      } else {
        csvOnly.push(csvGuest.guest_name);
      }
    });
    
    invitedMap.forEach((invitedGuest, key) => {
      if (!csvMap.has(key)) {
        invitedOnly.push(invitedGuest.guest_name);
      }
    });
    
    console.log(`✅ Matches: ${matches.length}`);
    console.log(`⚠️  In CSV but NOT in invited_guests: ${csvOnly.length}`);
    if (csvOnly.length > 0) {
      csvOnly.forEach(name => console.log(`   - ${name}`));
    }
    console.log(`⚠️  In invited_guests but NOT in CSV: ${invitedOnly.length}`);
    if (invitedOnly.length > 0) {
      invitedOnly.forEach(name => console.log(`   - ${name}`));
    }
    console.log('');
    
    // Step 6: Compare invited_guests vs seating_assignments
    console.log('='.repeat(80));
    console.log('📊 COMPARISON: invited_guests vs seating_assignments');
    console.log('='.repeat(80));
    
    const invitedNotSeating = [];
    const seatingNotInvited = [];
    const seatingMatches = [];
    
    invitedMap.forEach((invitedGuest, key) => {
      if (seatingMap.has(key)) {
        seatingMatches.push(invitedGuest.guest_name);
      } else {
        invitedNotSeating.push(invitedGuest.guest_name);
      }
    });
    
    seatingMap.forEach((seatingGuest, key) => {
      if (!invitedMap.has(key)) {
        seatingNotInvited.push(seatingGuest.guest_name);
      }
    });
    
    console.log(`✅ Matches: ${seatingMatches.length}`);
    console.log(`⚠️  In invited_guests but NOT in seating_assignments: ${invitedNotSeating.length}`);
    if (invitedNotSeating.length > 0) {
      invitedNotSeating.forEach(name => console.log(`   - ${name}`));
    }
    console.log(`⚠️  In seating_assignments but NOT in invited_guests: ${seatingNotInvited.length}`);
    if (seatingNotInvited.length > 0) {
      seatingNotInvited.forEach(name => console.log(`   - ${name}`));
    }
    console.log('');
    
    // Step 7: Summary
    console.log('='.repeat(80));
    console.log('📋 SUMMARY');
    console.log('='.repeat(80));
    console.log(`CSV file:                    ${csvGuests.length} guests`);
    console.log(`invited_guests table:        ${invitedGuests.length} guests`);
    console.log(`seating_assignments table:   ${seatingAssignments.length} guests`);
    console.log('');
    
    const allMatch = csvOnly.length === 0 && invitedOnly.length === 0 && 
                     invitedNotSeating.length === 0 && seatingNotInvited.length === 0;
    
    if (allMatch) {
      console.log('✅ SUCCESS: All lists match perfectly!');
      console.log(`   - CSV matches invited_guests: ${matches.length}/${csvGuests.length}`);
      console.log(`   - invited_guests matches seating_assignments: ${seatingMatches.length}/${invitedGuests.length}`);
    } else {
      console.log('⚠️  WARNING: Lists do not match perfectly');
      console.log(`   - CSV vs invited_guests: ${csvOnly.length} missing from DB, ${invitedOnly.length} extra in DB`);
      console.log(`   - invited_guests vs seating_assignments: ${invitedNotSeating.length} missing from seating, ${seatingNotInvited.length} extra in seating`);
      console.log('');
      console.log('💡 Recommendation: Run sync script to fix mismatches:');
      console.log('   node scripts/sync-seating-with-invited-guests.js');
      if (csvOnly.length > 0 || invitedOnly.length > 0) {
        console.log('   node scripts/import-guest-list-simple.js MASTERGUESTLIST.csv');
      }
    }
    
    console.log('='.repeat(80));
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

verifyAllLists();
