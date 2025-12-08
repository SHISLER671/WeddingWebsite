#!/usr/bin/env node

/**
 * Sync invited_guests table with MASTERGUESTLIST.csv
 * 
 * This script ensures the invited_guests table exactly matches the CSV:
 * - Adds/updates entries from CSV
 * - Removes entries NOT in CSV
 * 
 * Usage:
 *   node scripts/sync-invited-guests-with-csv.js [csv-file]
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
    values.push(current.trim());
    
      // Format: Number,Full Name,Notes,Headcount,RSVP Status,KIDENTOURAGE
      if (values.length >= 2) {
        const guestName = values[1]?.replace(/^"|"$/g, '') || '';
        const notes = values[2]?.replace(/^"|"$/g, '') || '';
        const headcount = values[3]?.replace(/^"|"$/g, '') || '';
        const kidEntourage = values[5]?.replace(/^"|"$/g, '') || ''; // KIDENTOURAGE column
        
        // Extract email from notes if present
        let email = null;
        if (notes && notes.includes('@')) {
          email = notes.trim();
        }
        
        // Parse headcount
        let allowedPartySize = 1;
        if (headcount) {
          const headcountNum = parseInt(headcount, 10);
          if (!isNaN(headcountNum) && headcountNum > 0) {
            allowedPartySize = headcountNum;
          }
        }
        
        // Build source string with Notes and KIDENTOURAGE info
        let sourceParts = ['@MASTERGUESTLIST.csv'];
        if (notes) {
          sourceParts.push(notes);
        }
        if (kidEntourage && kidEntourage.toUpperCase() === 'YES') {
          sourceParts.push('KIDENTOURAGE');
        }
        const source = sourceParts.join(' | ');
        
        if (guestName) {
          guests.push({
          guest_name: guestName.trim(),
          email: email || '',
          allowed_party_size: allowedPartySize,
          source: source
          });
        }
      }
  }
  
  return guests;
}

// Normalize name for comparison (lowercase, trim, remove extra spaces)
function normalizeName(name) {
  return name.toLowerCase().trim().replace(/\s+/g, ' ');
}

async function syncWithCSV(csvGuests) {
  console.log(`📥 Syncing ${csvGuests.length} guests from CSV to Supabase...`);
  console.log('');
  
  // Get all current entries from database
  console.log('📋 Fetching current invited_guests from database...');
  const { data: dbGuests, error: fetchError } = await supabase
    .from('invited_guests')
    .select('id, guest_name, email, allowed_party_size');
  
  if (fetchError) {
    console.error('❌ Error fetching invited_guests:', fetchError.message);
    return { added: 0, updated: 0, deleted: 0, errors: 0 };
  }
  
  console.log(`   Found ${dbGuests.length} current entries in database`);
  console.log('');
  
  // Create maps for quick lookup
  const csvMap = new Map();
  csvGuests.forEach(guest => {
    const key = normalizeName(guest.guest_name);
    csvMap.set(key, guest);
  });
  
  const dbMap = new Map();
  dbGuests.forEach(guest => {
    const key = normalizeName(guest.guest_name);
    if (!dbMap.has(key)) {
      dbMap.set(key, []);
    }
    dbMap.get(key).push(guest);
  });
  
  let added = 0;
  let updated = 0;
  let deleted = 0;
  let errors = 0;
  let unchanged = 0;
  const toDelete = []; // Track entries to delete (not in CSV or duplicates)
  const keepIds = new Set(); // Track IDs to keep (matched from CSV)
  
  // Step 1: Add/Update entries from CSV
  console.log('🔄 Step 1: Adding/updating entries from CSV...');
  for (const csvGuest of csvGuests) {
    const normalizedName = normalizeName(csvGuest.guest_name);
    const dbMatches = dbMap.get(normalizedName) || [];
    
    if (dbMatches.length === 0) {
      // New entry - insert
      const { error: insertError } = await supabase
        .from('invited_guests')
        .insert(csvGuest);
      
      if (insertError) {
        console.error(`   ❌ Failed to insert ${csvGuest.guest_name}:`, insertError.message);
        errors++;
      } else {
        added++;
        if (added % 10 === 0) {
          console.log(`   📊 Progress: ${added} added, ${updated} updated...`);
        }
      }
    } else {
      // Update first match, mark others for deletion (duplicates)
      const existing = dbMatches[0];
      keepIds.add(existing.id); // Mark this ID to keep
      
      const needsUpdate = 
        existing.guest_name !== csvGuest.guest_name ||
        (existing.email || '') !== (csvGuest.email || '') ||
        existing.allowed_party_size !== csvGuest.allowed_party_size;
      
      // Always update source field to ensure consistency
      const updateData = {
        guest_name: csvGuest.guest_name,
        email: csvGuest.email,
        allowed_party_size: csvGuest.allowed_party_size,
        source: csvGuest.source
      };
      
      if (needsUpdate) {
        const { error: updateError } = await supabase
          .from('invited_guests')
          .update(updateData)
          .eq('id', existing.id);
        
        if (updateError) {
          console.error(`   ❌ Failed to update ${csvGuest.guest_name}:`, updateError.message);
          errors++;
        } else {
          updated++;
          if (updated % 10 === 0) {
            console.log(`   📊 Progress: ${added} added, ${updated} updated...`);
          }
        }
      } else {
        // Even if nothing else changed, update source field to ensure consistency
        const { error: sourceUpdateError } = await supabase
          .from('invited_guests')
          .update({ source: csvGuest.source })
          .eq('id', existing.id);
        
        if (sourceUpdateError) {
          console.error(`   ⚠️  Failed to update source for ${csvGuest.guest_name}:`, sourceUpdateError.message);
        }
        unchanged++;
      }
      
      // Mark duplicate entries for deletion (keep only the first one)
      if (dbMatches.length > 1) {
        for (let i = 1; i < dbMatches.length; i++) {
          toDelete.push(dbMatches[i]);
        }
      }
    }
  }
  
  console.log(`   ✅ Added: ${added}`);
  console.log(`   🔄 Updated: ${updated}`);
  console.log(`   ⏭️  Unchanged: ${unchanged}`);
  console.log('');
  
  // Step 2: Delete entries NOT in CSV
  console.log('🧹 Step 2: Removing entries NOT in CSV...');
  
  for (const dbGuest of dbGuests) {
    // Skip if we're keeping this ID (it was matched from CSV)
    if (keepIds.has(dbGuest.id)) {
      continue;
    }
    
    const normalizedName = normalizeName(dbGuest.guest_name);
    if (!csvMap.has(normalizedName)) {
      toDelete.push(dbGuest);
    }
  }
  
  if (toDelete.length > 0) {
    console.log(`   ⚠️  Found ${toDelete.length} entries to delete:`);
    toDelete.forEach(guest => {
      console.log(`      - ${guest.guest_name} (id: ${guest.id})`);
    });
    console.log('');
    
    // Delete in batches to avoid overwhelming the database
    const batchSize = 50;
    for (let i = 0; i < toDelete.length; i += batchSize) {
      const batch = toDelete.slice(i, i + batchSize);
      const ids = batch.map(g => g.id);
      
      const { error: deleteError } = await supabase
        .from('invited_guests')
        .delete()
        .in('id', ids);
      
      if (deleteError) {
        console.error(`   ❌ Failed to delete batch:`, deleteError.message);
        errors++;
      } else {
        deleted += batch.length;
        console.log(`   🗑️  Deleted ${batch.length} entries (${deleted}/${toDelete.length} total)`);
      }
    }
  } else {
    console.log('   ✅ No entries to delete - database already matches CSV');
  }
  
  console.log('');
  console.log('📊 Sync Summary:');
  console.log(`   ✅ Added: ${added}`);
  console.log(`   🔄 Updated: ${updated}`);
  console.log(`   ⏭️  Unchanged: ${unchanged}`);
  console.log(`   🗑️  Deleted: ${deleted}`);
  console.log(`   ❌ Errors: ${errors}`);
  console.log(`   📋 CSV entries: ${csvGuests.length}`);
  console.log(`   📋 Final DB entries: ${csvGuests.length - errors + (added - deleted)}`);
  
  return { added, updated, deleted, unchanged, errors };
}

async function main() {
  console.log('🔄 Sync invited_guests with MASTERGUESTLIST.csv');
  console.log('='.repeat(60));
  console.log('');
  
  // Determine CSV file to import
  const csvFile = process.argv[2] || path.join(__dirname, '..', 'MASTERGUESTLIST.csv');
  
  if (!fs.existsSync(csvFile)) {
    console.error(`❌ Error: CSV file not found: ${csvFile}`);
    process.exit(1);
  }
  
  console.log(`📁 CSV file: ${csvFile}`);
  console.log('');
  
  // Parse CSV
  const guests = parseCSV(csvFile);
  console.log(`📋 Found ${guests.length} guests in CSV`);
  console.log('');
  
  // Confirm sync
  console.log('⚠️  This will:');
  console.log('   1. Add/update entries from CSV to invited_guests');
  console.log('   2. DELETE all entries NOT in CSV');
  console.log('');
  console.log('   Press Ctrl+C to cancel, or wait 5 seconds to continue...');
  console.log('');
  
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  // Sync with CSV
  const result = await syncWithCSV(guests);
  
  console.log('');
  if (result.errors === 0) {
    console.log('✅ Sync complete! Database now matches CSV exactly.');
  } else {
    console.log(`⚠️  Sync complete with ${result.errors} error(s). Please review above.`);
  }
  console.log('');
}

main().catch(console.error);
