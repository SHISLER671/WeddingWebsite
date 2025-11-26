#!/usr/bin/env node

/**
 * Import RSVP name mappings from manual mapping file
 * 
 * Reads a CSV file with RSVP ID -> Invited Guest ID mappings
 * and updates RSVP guest names accordingly
 * 
 * CSV format:
 *   RSVP ID,RSVP Current Name,Invited Guest ID,Invited Guest Name,Match Status
 * 
 * Usage:
 *   node scripts/import-rsvp-mapping.js tmp/rsvp-name-mapping.csv
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
  const mappings = [];
  
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
    
    const rsvpId = (values[0]?.replace(/^"|"$/g, '') || '').trim();
    const rsvpCurrentName = (values[1]?.replace(/^"|"$/g, '') || '').trim();
    const invitedGuestId = (values[2]?.replace(/^"|"$/g, '') || '').trim();
    const invitedGuestName = (values[3]?.replace(/^"|"$/g, '') || '').trim();
    const matchStatus = (values[4]?.replace(/^"|"$/g, '') || '').trim().toUpperCase();
    
    // Debug: log first few rows to see what we're parsing
    if (i <= 3) {
      console.log(`   Row ${i}: RSVP ID="${rsvpId}", Guest ID="${invitedGuestId}", Status="${matchStatus}"`);
    }
    
    // Match status can be "MATCH" (case-insensitive) or any non-empty value if we want to be flexible
    if (rsvpId && invitedGuestId && (matchStatus === 'MATCH' || matchStatus === '')) {
      mappings.push({
        rsvpId,
        rsvpCurrentName,
        invitedGuestId,
        invitedGuestName,
      });
    } else if (rsvpId && invitedGuestId) {
      // Log skipped rows for debugging
      if (i <= 5) {
        console.log(`   ⚠️  Skipping row ${i}: RSVP ID="${rsvpId}", Status="${matchStatus}" (not MATCH)`);
      }
    }
  }
  
  return mappings;
}

async function importMappings(mappings) {
  console.log(`📥 Processing ${mappings.length} RSVP name mappings...`);
  console.log('');
  
  let successCount = 0;
  let errorCount = 0;
  
  for (let i = 0; i < mappings.length; i++) {
    const mapping = mappings[i];
    
    try {
      // First, verify the invited guest exists and get the exact name
      const { data: guest, error: guestError } = await supabase
        .from('invited_guests')
        .select('guest_name')
        .eq('id', mapping.invitedGuestId)
        .single();
      
      if (guestError || !guest) {
        console.error(`   ⚠️  Invited guest not found for ID ${mapping.invitedGuestId}`);
        errorCount++;
        continue;
      }
      
      const targetName = guest.guest_name;
      
      // Update RSVP by ID - only update guest_name (don't include updated_at if column doesn't exist)
      const { error: updateError } = await supabase
        .from('rsvps')
        .update({ guest_name: targetName })
        .eq('id', mapping.rsvpId);
      
      if (updateError) {
        console.error(`   ⚠️  Failed to update RSVP ${mapping.rsvpId} (${mapping.rsvpCurrentName}):`, updateError.message);
        errorCount++;
      } else {
        successCount++;
        console.log(`   ✅ Synced: "${mapping.rsvpCurrentName}" → "${targetName}"`);
        if ((i + 1) % 10 === 0) {
          console.log(`   📊 Progress: ${i + 1}/${mappings.length} processed...`);
        }
      }
    } catch (error) {
      console.error(`   ❌ Error processing ${mapping.rsvpId}:`, error.message);
      errorCount++;
    }
  }
  
  console.log('');
  console.log('📊 Import Summary:');
  console.log(`   ✅ Successfully synced: ${successCount}`);
  console.log(`   ❌ Errors: ${errorCount}`);
  console.log(`   📋 Total: ${mappings.length}`);
  
  return { successCount, errorCount };
}

async function main() {
  console.log('📋 Import RSVP Name Mappings');
  console.log('='.repeat(60));
  console.log('');
  
  // Determine CSV file
  const csvFile = process.argv[2] || path.join(__dirname, '..', 'tmp', 'rsvp-name-mapping.csv');
  
  if (!fs.existsSync(csvFile)) {
    console.error(`❌ Error: CSV file not found: ${csvFile}`);
    console.log('');
    console.log('💡 Tip: Run this first to create the mapping template:');
    console.log('   node scripts/export-rsvp-mapping.js');
    process.exit(1);
  }
  
  // Check if file is binary (Excel file)
  const fileBuffer = fs.readFileSync(csvFile);
  if (fileBuffer[0] === 0x50 && fileBuffer[1] === 0x4B) { // PK (ZIP signature = Excel file)
    console.error(`❌ Error: This appears to be an Excel file (.xlsx), not a CSV file`);
    console.log('');
    console.log('💡 Solution:');
    console.log('   1. Open the file in Excel/Google Sheets');
    console.log('   2. Go to File > Save As / Export');
    console.log('   3. Choose "CSV (Comma delimited) (*.csv)"');
    console.log('   4. Save it and run this script again');
    console.log('');
    console.log('   Or rename your file to have a .csv extension');
    process.exit(1);
  }
  
  console.log(`📁 CSV file: ${csvFile}`);
  console.log('');
  
  // Parse CSV
  console.log('📋 Parsing CSV file...');
  const mappings = parseCSV(csvFile);
  console.log(`📋 Found ${mappings.length} mappings to process`);
  console.log('');
  
  if (mappings.length === 0) {
    console.log('⚠️  No mappings found. Possible issues:');
    console.log('   1. Make sure your CSV has "MATCH" (case-insensitive) in the Match Status column');
    console.log('   2. Make sure RSVP ID and Invited Guest ID columns are filled in');
    console.log('   3. Check that the file is saved as CSV (not Excel .xlsx)');
    console.log('');
    console.log('💡 Tip: The first few rows will be shown above for debugging');
    process.exit(1);
  }
  
  // Confirm import
  console.log('⚠️  This will update RSVP guest names based on your manual mappings');
  console.log('   Press Ctrl+C to cancel, or wait 3 seconds to continue...');
  console.log('');
  
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  // Import mappings
  const result = await importMappings(mappings);
  
  console.log('');
  console.log('✅ Import complete!');
}

main().catch(console.error);
