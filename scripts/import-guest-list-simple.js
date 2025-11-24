#!/usr/bin/env node

/**
 * Simple Import Guest List CSV to Supabase
 * 
 * Uses direct SQL inserts to bypass RLS issues
 * 
 * Usage:
 *   node scripts/import-guest-list-simple.js [csv-file]
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
    
    const guestName = values[0]?.replace(/^"|"$/g, '') || '';
    const email = values[1]?.replace(/^"|"$/g, '') || null;
    
    if (guestName) {
      guests.push({
        guest_name: guestName,
        email: email || null,
        allowed_party_size: 1,
        source: 'master_list'
      });
    }
  }
  
  return guests;
}

async function importGuests(guests) {
  console.log(`📥 Importing ${guests.length} guests to Supabase...`);
  console.log('');
  
  let successCount = 0;
  let errorCount = 0;
  let skippedCount = 0;
  
  // Import one at a time to handle conflicts properly
  for (let i = 0; i < guests.length; i++) {
    const guest = guests[i];
    
    try {
      // First, check if guest exists
      const { data: existing, error: checkError } = await supabase
        .from('invited_guests')
        .select('id')
        .eq('guest_name', guest.guest_name)
        .eq('email', guest.email || '')
        .maybeSingle();
      
      if (existing) {
        // Update existing
        const { error: updateError } = await supabase
          .from('invited_guests')
          .update({
            allowed_party_size: guest.allowed_party_size,
            source: guest.source
          })
          .eq('id', existing.id);
        
        if (updateError) {
          console.error(`   ⚠️  Failed to update ${guest.guest_name}:`, updateError.message);
          errorCount++;
        } else {
          skippedCount++;
          if ((i + 1) % 50 === 0) {
            console.log(`   📊 Progress: ${i + 1}/${guests.length} processed...`);
          }
        }
      } else {
        // Insert new
        const { error: insertError } = await supabase
          .from('invited_guests')
          .insert(guest);
        
        if (insertError) {
          console.error(`   ⚠️  Failed to insert ${guest.guest_name}:`, insertError.message);
          errorCount++;
        } else {
          successCount++;
          if ((i + 1) % 50 === 0) {
            console.log(`   📊 Progress: ${i + 1}/${guests.length} processed...`);
          }
        }
      }
    } catch (error) {
      console.error(`   ❌ Error processing ${guest.guest_name}:`, error.message);
      errorCount++;
    }
  }
  
  console.log('');
  console.log('📊 Import Summary:');
  console.log(`   ✅ Successfully imported: ${successCount}`);
  console.log(`   ⏭️  Skipped/Updated: ${skippedCount}`);
  console.log(`   ❌ Errors: ${errorCount}`);
  console.log(`   📋 Total: ${guests.length}`);
}

async function main() {
  console.log('📋 Import Guest List to Supabase (Simple Method)');
  console.log('='.repeat(60));
  console.log('');
  
  // Determine CSV file to import
  const csvFile = process.argv[2] || path.join(__dirname, '..', 'tmp', 'master-guest-list.csv');
  
  if (!fs.existsSync(csvFile)) {
    console.error(`❌ Error: CSV file not found: ${csvFile}`);
    process.exit(1);
  }
  
  console.log(`📁 CSV file: ${csvFile}`);
  
  // Parse CSV
  const guests = parseCSV(csvFile);
  console.log(`📋 Found ${guests.length} guests in CSV`);
  console.log('');
  
  // Confirm import
  console.log('⚠️  This will import/update guests in the invited_guests table');
  console.log('   Press Ctrl+C to cancel, or wait 3 seconds to continue...');
  console.log('');
  
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  // Import to Supabase
  await importGuests(guests);
  
  console.log('');
  console.log('✅ Import complete!');
  console.log('');
  console.log('🧪 Test the autocomplete:');
  console.log('   1. Go to your RSVP page');
  console.log('   2. Type a guest name');
  console.log('   3. Verify dropdown appears with matches');
}

main().catch(console.error);
