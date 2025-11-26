#!/usr/bin/env node

/**
 * Verify All Entourage Members
 * 
 * Compares the website entourage list with CSV and database entries
 * to ensure all are marked as ENTOURAGE
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Website entourage list (from info page)
const WEBSITE_ENTOURAGE = [
  'Amos Taijeron', // CSV: "Amos & Erica Taijeron"
  'Audrey Benevente', // CSV: "Audrey Benavente" (spelling difference)
  'Brandon Cepeda',
  'Camella Ramirez',
  'Carl Nangauta',
  'Carter Young', // CSV: "Carter & Cristine Young"
  'Christiana Ramirez',
  'Devin Quitugua', // CSV: "Devin & Moana Quitugua"
  'Elizabeth Valencia',
  'Gavin Garrido', // CSV: "Gavin Gamido" (name difference!)
  'James Losongco',
  'James Whippy',
  'Jassen Guerrero',
  'Jesse Newby', // CSV: "Jesse & Annaiea Newby"
  'Jonathon Pablo', // CSV: "Jonathan Pablo" (spelling difference)
  'Jose Santos',
  'Kevin Leasiolagi', // CSV: "Kevin & Kyra Leasiolagi"
  'Neil Pang',
  'Nisha Chargualaf',
  'Ray Paul Jardon',
  'Reynne Wahl', // CSV: "Derrick & Reynne Wahl"
  'Shane Quintanilla',
  'Tammy Ramirez',
  'Teke Kaminaga', // CSV: "Teke & Julieann Kaminaga"
  'Vincent Camacho', // CSV: "Vincent Camacho& Jelsea Ngowakl"
  'William Libby' // CSV: "William & Dana Libby"
];

// CSV entourage entries (from updated-guest-list-2026.csv lines 159-184)
const CSV_ENTOURAGE = [
  'Shane Quintanilla',
  'Kevin & Kyra Leasiolagi',
  'James Whippy',
  'Teke & Julieann Kaminaga',
  'Ray Paul Jardon',
  'Carter & Cristine Young',
  'Jesse & Annaiea Newby',
  'Jose Santos',
  'Vincent Camacho& Jelsea Ngowakl',
  'Carl Nangauta',
  'Jassen Guerrero',
  'Amos & Erica Taijeron',
  'William & Dana Libby',
  'Devin & Moana Quitugua',
  'Brandon Cepeda',
  'Derrick & Reynne Wahl',
  'Neil Pang',
  'James Losongco',
  'Jonathan Pablo',
  'Gavin Gamido',
  'Camella Ramirez',
  'Christiana Ramirez',
  'Tammy Ramirez',
  'Nisha Chargualaf',
  'Elizabeth Valencia',
  'Audrey Benavente'
];

function normalizeName(name) {
  return (name || '').trim().toLowerCase().replace(/&/g, 'and').replace(/\s+/g, ' ');
}

function findMatch(name, list) {
  const normalized = normalizeName(name);
  return list.find(item => {
    const normalizedItem = normalizeName(item);
    // Check exact match
    if (normalized === normalizedItem) return true;
    // Check if name contains the item or vice versa
    if (normalized.includes(normalizedItem) || normalizedItem.includes(normalized)) return true;
    // Check first name match
    const nameFirst = normalized.split(' ')[0];
    const itemFirst = normalizedItem.split(' ')[0];
    if (nameFirst && itemFirst && nameFirst === itemFirst) return true;
    return false;
  });
}

async function verifyAllEntourage() {
  try {
    console.log('🔍 Verifying all entourage members...\n');
    console.log('='.repeat(80));
    
    // Step 1: Check seating_assignments for ENTOURAGE entries
    console.log('📋 Checking seating_assignments for ENTOURAGE entries...');
    const { data: seatingAssignments, error: seatingError } = await supabase
      .from('seating_assignments')
      .select('guest_name, special_notes, dietary_notes')
      .or('special_notes.ilike.%ENTOURAGE%,dietary_notes.ilike.%ENTOURAGE%');
    
    if (seatingError) {
      console.error('❌ Error:', seatingError.message);
      process.exit(1);
    }
    
    console.log(`   Found ${seatingAssignments.length} entries with ENTOURAGE in notes\n`);
    
    // Step 2: Check invited_guests for ENTOURAGE entries
    console.log('📋 Checking invited_guests for ENTOURAGE entries...');
    const { data: invitedGuests, error: invitedError } = await supabase
      .from('invited_guests')
      .select('guest_name, source, notes')
      .or('source.ilike.%ENTOURAGE%,notes.ilike.%ENTOURAGE%');
    
    if (invitedError) {
      console.error('❌ Error:', invitedError.message);
      process.exit(1);
    }
    
    console.log(`   Found ${invitedGuests.length} entries with ENTOURAGE\n`);
    
    // Step 3: Compare all lists
    console.log('='.repeat(80));
    console.log('📊 COMPARISON');
    console.log('='.repeat(80));
    
    const seatingNames = seatingAssignments.map(s => s.guest_name);
    const invitedNames = invitedGuests.map(i => i.guest_name);
    
    console.log(`\nWebsite list: ${WEBSITE_ENTOURAGE.length} names`);
    console.log(`CSV list: ${CSV_ENTOURAGE.length} names`);
    console.log(`seating_assignments with ENTOURAGE: ${seatingNames.length} names`);
    console.log(`invited_guests with ENTOURAGE: ${invitedNames.length} names\n`);
    
    // Check which CSV entries are missing ENTOURAGE in seating_assignments
    console.log('🔍 Checking CSV entourage entries in seating_assignments...\n');
    const missingFromSeating = [];
    
    for (const csvName of CSV_ENTOURAGE) {
      const found = seatingNames.find(s => {
        const normalizedCSV = normalizeName(csvName);
        const normalizedSeating = normalizeName(s);
        return normalizedCSV === normalizedSeating || 
               normalizedCSV.includes(normalizedSeating) ||
               normalizedSeating.includes(normalizedCSV);
      });
      
      if (!found) {
        missingFromSeating.push(csvName);
      }
    }
    
    if (missingFromSeating.length > 0) {
      console.log(`⚠️  ${missingFromSeating.length} CSV entourage entries NOT found in seating_assignments ENTOURAGE list:`);
      missingFromSeating.forEach(name => console.log(`   - ${name}`));
    } else {
      console.log('✅ All CSV entourage entries found in seating_assignments');
    }
    
    // Check which seating entries with ENTOURAGE are not in CSV list
    console.log('\n🔍 Checking seating_assignments ENTOURAGE entries against CSV list...\n');
    const notInCSV = [];
    
    for (const seatingName of seatingNames) {
      const found = CSV_ENTOURAGE.find(csv => {
        const normalizedCSV = normalizeName(csv);
        const normalizedSeating = normalizeName(seatingName);
        return normalizedCSV === normalizedSeating || 
               normalizedCSV.includes(normalizedSeating) ||
               normalizedSeating.includes(normalizedCSV);
      });
      
      if (!found) {
        notInCSV.push(seatingName);
      }
    }
    
    if (notInCSV.length > 0) {
      console.log(`⚠️  ${notInCSV.length} seating_assignments ENTOURAGE entries NOT in CSV list:`);
      notInCSV.forEach(name => console.log(`   - ${name}`));
    } else {
      console.log('✅ All seating_assignments ENTOURAGE entries found in CSV');
    }
    
    // List all CSV entourage entries
    console.log('\n' + '='.repeat(80));
    console.log('📋 CSV ENTOURAGE LIST (26 entries):');
    console.log('='.repeat(80));
    CSV_ENTOURAGE.forEach((name, idx) => {
      const hasInSeating = seatingNames.some(s => {
        const normalizedCSV = normalizeName(name);
        const normalizedSeating = normalizeName(s);
        return normalizedCSV === normalizedSeating || 
               normalizedCSV.includes(normalizedSeating) ||
               normalizedSeating.includes(normalizedCSV);
      });
      const marker = hasInSeating ? '✅' : '❌';
      console.log(`${marker} ${idx + 1}. ${name}`);
    });
    
    console.log('\n' + '='.repeat(80));
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

verifyAllEntourage();
