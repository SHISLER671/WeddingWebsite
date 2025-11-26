#!/usr/bin/env node

/**
 * Fix WeddingParty to ENTOURAGE
 * 
 * This script:
 * 1. Finds all entries in seating_assignments with "weddingparty" in any column
 * 2. Verifies they match the ENTOURAGE guest list
 * 3. Updates them to "ENTOURAGE" for consistency
 * 
 * Usage:
 *   node scripts/fix-weddingparty-to-entourage.js
 */

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

// List of entourage guest names
const ENTOURAGE_GUESTS = [
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
  return (name || '').trim().toLowerCase();
}

function isEntourageGuest(guestName) {
  const normalized = normalizeName(guestName);
  return ENTOURAGE_GUESTS.some(entourage => {
    const normalizedEntourage = normalizeName(entourage);
    if (normalized === normalizedEntourage) return true;
    
    // Check first name match
    const guestFirst = normalized.split(' ')[0];
    const entourageFirst = normalizedEntourage.split(' ')[0];
    if (guestFirst && entourageFirst && guestFirst === entourageFirst) {
      return true;
    }
    
    return false;
  });
}

async function fixWeddingPartyEntries() {
  try {
    console.log('🔍 Checking for "weddingparty" entries in seating_assignments...\n');
    
    // First, get all seating assignments to check all columns
    const { data: allAssignments, error: fetchError } = await supabase
      .from('seating_assignments')
      .select('*');
    
    if (fetchError) {
      console.error('❌ Error fetching seating assignments:', fetchError.message);
      process.exit(1);
    }
    
    console.log(`📋 Found ${allAssignments.length} total seating assignments\n`);
    
    // Check which columns exist
    if (allAssignments.length > 0) {
      console.log('📊 Available columns:', Object.keys(allAssignments[0]).join(', '));
      console.log('');
    }
    
    // Find entries with "weddingparty" in any text column
    const weddingPartyEntries = [];
    
    allAssignments.forEach(assignment => {
      let foundInColumn = null;
      
      // Check all string columns
      Object.keys(assignment).forEach(key => {
        const value = assignment[key];
        if (typeof value === 'string' && value.toLowerCase().includes('weddingparty')) {
          foundInColumn = key;
        }
      });
      
      if (foundInColumn) {
        weddingPartyEntries.push({
          ...assignment,
          foundInColumn
        });
      }
    });
    
    if (weddingPartyEntries.length === 0) {
      console.log('✅ No entries found with "weddingparty" in any column');
      return;
    }
    
    console.log(`⚠️  Found ${weddingPartyEntries.length} entries with "weddingparty":\n`);
    
    weddingPartyEntries.forEach(entry => {
      console.log(`   - ${entry.guest_name} (found in column: ${entry.foundInColumn})`);
    });
    
    console.log('\n🔍 Verifying these match ENTOURAGE list...\n');
    
    const matches = [];
    const nonMatches = [];
    
    weddingPartyEntries.forEach(entry => {
      if (isEntourageGuest(entry.guest_name)) {
        matches.push(entry);
        console.log(`   ✅ ${entry.guest_name} - matches ENTOURAGE list`);
      } else {
        nonMatches.push(entry);
        console.log(`   ⚠️  ${entry.guest_name} - NOT in ENTOURAGE list`);
      }
    });
    
    console.log('\n' + '='.repeat(80));
    console.log('📊 SUMMARY:');
    console.log('='.repeat(80));
    console.log(`   Total "weddingparty" entries: ${weddingPartyEntries.length}`);
    console.log(`   ✅ Match ENTOURAGE list: ${matches.length}`);
    console.log(`   ⚠️  Don't match ENTOURAGE list: ${nonMatches.length}`);
    console.log('');
    
    if (nonMatches.length > 0) {
      console.log('⚠️  WARNING: Some entries with "weddingparty" are NOT in the ENTOURAGE list:');
      nonMatches.forEach(entry => {
        console.log(`   - ${entry.guest_name}`);
      });
      console.log('');
      console.log('   These will NOT be updated. Please review manually.');
      console.log('');
    }
    
    if (matches.length === 0) {
      console.log('ℹ️  No entries to update.');
      return;
    }
    
    // Update entries
    console.log(`🔄 Updating ${matches.length} entries from "weddingparty" to "ENTOURAGE"...\n`);
    
    let updated = 0;
    let errors = 0;
    
    for (const entry of matches) {
      // Determine which column to update based on where "weddingparty" was found
      const updateData = {};
      
      // If it's in a column that contains the value, replace it
      if (entry.foundInColumn === 'source' || entry.foundInColumn === 'special_notes' || entry.foundInColumn === 'dietary_notes') {
        const currentValue = entry[entry.foundInColumn] || '';
        // Replace weddingparty with ENTOURAGE (case-insensitive)
        const newValue = currentValue.replace(/weddingparty/gi, 'ENTOURAGE').trim();
        updateData[entry.foundInColumn] = newValue || 'ENTOURAGE';
      } else {
        // If it's in guest_name or other column, we might need to check invited_guests
        // For now, let's check if there's a source column we can update
        const { data: invitedGuest } = await supabase
          .from('invited_guests')
          .select('source')
          .eq('guest_name', entry.guest_name)
          .single();
        
        if (invitedGuest && invitedGuest.source) {
          // Update based on invited_guests source
          if (invitedGuest.source.includes('ENTOURAGE')) {
            // Check if seating_assignments has a source column
            const { error: updateError } = await supabase
              .from('seating_assignments')
              .update({ source: 'ENTOURAGE' })
              .eq('id', entry.id);
            
            if (updateError) {
              // If source column doesn't exist, try special_notes
              const { error: notesError } = await supabase
                .from('seating_assignments')
                .update({ special_notes: 'ENTOURAGE' })
                .eq('id', entry.id);
              
              if (notesError) {
                console.error(`   ❌ Failed to update ${entry.guest_name}:`, notesError.message);
                errors++;
                continue;
              }
            }
            updated++;
            console.log(`   ✅ Updated: ${entry.guest_name}`);
          }
        }
      }
      
      // If we have updateData, apply it
      if (Object.keys(updateData).length > 0) {
        const { error: updateError } = await supabase
          .from('seating_assignments')
          .update(updateData)
          .eq('id', entry.id);
        
        if (updateError) {
          console.error(`   ❌ Failed to update ${entry.guest_name}:`, updateError.message);
          errors++;
        } else {
          updated++;
          console.log(`   ✅ Updated: ${entry.guest_name} (${entry.foundInColumn})`);
        }
      }
    }
    
    console.log('\n' + '='.repeat(80));
    console.log('✅ UPDATE COMPLETE:');
    console.log('='.repeat(80));
    console.log(`   ✅ Updated: ${updated}`);
    if (errors > 0) {
      console.log(`   ❌ Errors: ${errors}`);
    }
    console.log('='.repeat(80));
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

fixWeddingPartyEntries();

