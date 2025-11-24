#!/usr/bin/env node

/**
 * Import Guest List CSV to Supabase
 * 
 * Imports guests from CSV file into the invited_guests table
 * 
 * Usage:
 *   node scripts/import-guest-list-to-supabase.js [csv-file]
 * 
 * Default: imports tmp/master-guest-list.csv
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
  
  // Import in batches of 100
  const batchSize = 100;
  for (let i = 0; i < guests.length; i += batchSize) {
    const batch = guests.slice(i, i + batchSize);
    
    try {
      // Use insert with conflict handling instead of upsert to avoid RLS issues
      const { data, error } = await supabase
        .from('invited_guests')
        .insert(batch)
        .select();
      
      if (error) {
        // If it's a unique constraint error, try updating instead
        if (error.code === '23505' || error.message.includes('duplicate') || error.message.includes('unique')) {
          // Try individual inserts/updates for this batch
          let batchSuccess = 0;
          let batchSkipped = 0;
          
          for (const guest of batch) {
            // Try to find existing guest
            const { data: existing } = await supabase
              .from('invited_guests')
              .select('id')
              .eq('guest_name', guest.guest_name)
              .eq('email', guest.email || '')
              .maybeSingle();
            
            if (existing) {
              // Update existing
              const { error: updateError } = await supabase
                .from('invited_guests')
                .update(guest)
                .eq('id', existing.id);
              
              if (!updateError) {
                batchSuccess++;
              } else {
                console.error(`   ⚠️  Failed to update ${guest.guest_name}:`, updateError.message);
                batchSkipped++;
              }
            } else {
              // Insert new
              const { error: insertError } = await supabase
                .from('invited_guests')
                .insert(guest);
              
              if (!insertError) {
                batchSuccess++;
              } else {
                console.error(`   ⚠️  Failed to insert ${guest.guest_name}:`, insertError.message);
                batchSkipped++;
              }
            }
          }
          
          successCount += batchSuccess;
          skippedCount += batchSkipped;
          console.log(`✅ Batch ${Math.floor(i / batchSize) + 1}: ${batchSuccess} processed, ${batchSkipped} skipped`);
        } else {
          console.error(`❌ Batch ${Math.floor(i / batchSize) + 1} error:`, error.message);
          errorCount += batch.length;
        }
      } else {
        const inserted = data?.length || 0;
        successCount += inserted;
        console.log(`✅ Batch ${Math.floor(i / batchSize) + 1}: ${inserted} inserted`);
      }
    } catch (error) {
      console.error(`❌ Batch ${Math.floor(i / batchSize) + 1} error:`, error.message);
      errorCount += batch.length;
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
  console.log('📋 Import Guest List to Supabase');
  console.log('='.repeat(60));
  console.log('');
  
  // Determine CSV file to import
  const csvFile = process.argv[2] || path.join(__dirname, '..', 'tmp', 'master-guest-list.csv');
  
  if (!fs.existsSync(csvFile)) {
    console.error(`❌ Error: CSV file not found: ${csvFile}`);
    console.log('');
    console.log('Available CSV files:');
    const masterCsv = path.join(__dirname, '..', 'tmp', 'master-guest-list.csv');
    const updatedCsv = path.join(__dirname, '..', 'tmp', 'updated-guest-list.csv');
    if (fs.existsSync(masterCsv)) {
      console.log(`   - ${masterCsv} (223 guests)`);
    }
    if (fs.existsSync(updatedCsv)) {
      console.log(`   - ${updatedCsv} (403 guests)`);
    }
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
