#!/usr/bin/env node

/**
 * Add OFFISLANDb.csv guests to invited_guests table in Supabase
 * This script adds/updates entries without deleting existing ones
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

// Initialize Supabase client
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Error: Missing Supabase credentials');
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
    
    if (values.length >= 2 && values[1]) {
      guests.push({
        number: values[0] || '',
        guest_name: values[1] || '',
        notes: values[2] || '',
        headcount: values[3] || '',
        rsvp_status: values[4] || '',
        kidentourage: values[5] || ''
      });
    }
  }
  
  return guests;
}

async function addOffIslandGuests() {
  console.log('🔄 Adding OFFISLANDb guests to Supabase...');
  console.log('============================================================\n');
  
  const csvPath = path.join(process.cwd(), '0FFISLANDb.csv');
  
  if (!fs.existsSync(csvPath)) {
    console.error(`❌ File not found: ${csvPath}`);
    process.exit(1);
  }
  
  const guests = parseCSV(csvPath);
  console.log(`📋 Found ${guests.length} guests in OFFISLANDb.csv\n`);
  
  // Fetch current invited_guests to check for existing entries
  const { data: existingGuests, error: fetchError } = await supabase
    .from('invited_guests')
    .select('guest_name');
  
  if (fetchError) {
    console.error('❌ Error fetching existing guests:', fetchError.message);
    process.exit(1);
  }
  
  const existingNames = new Set(
    (existingGuests || []).map(g => g.guest_name?.toLowerCase().trim())
  );
  
  let added = 0;
  let updated = 0;
  let skipped = 0;
  let errors = 0;
  
  for (const guest of guests) {
    try {
      const normalizedName = guest.guest_name.toLowerCase().trim();
      const exists = existingNames.has(normalizedName);
      
      // Extract email from notes if present
      let email = null;
      const notes = guest.notes || '';
      if (notes && notes.includes('@')) {
        email = notes.trim();
      }
      
      // Parse allowed_party_size from headcount column
      let allowedPartySize = null;
      if (guest.headcount) {
        const headcountStr = guest.headcount.toString().trim();
        // Handle formats like "+2,4" where 4 is total, or just "2"
        const match = headcountStr.match(/\+(\d+),(\d+)/);
        if (match) {
          allowedPartySize = parseInt(match[2], 10); // Total is second number
        } else {
          const num = parseInt(headcountStr, 10);
          if (!isNaN(num)) {
            allowedPartySize = num;
          }
        }
      }
      
      // Build source string
      let sourceParts = ['@0FFISLANDb.csv'];
      if (notes && !notes.includes('@')) {
        sourceParts.push(notes);
      }
      if (guest.kidentourage && guest.kidentourage.toUpperCase() === 'YES') {
        sourceParts.push('KIDENTOURAGE');
      }
      const source = sourceParts.join(' | ');
      
      const guestData = {
        guest_name: guest.guest_name.trim(),
        email: email || '',
        allowed_party_size: allowedPartySize,
        source: source
      };
      
      if (exists) {
        // Update existing entry
        const { error: updateError } = await supabase
          .from('invited_guests')
          .update(guestData)
          .eq('guest_name', guest.guest_name.trim());
        
        if (updateError) {
          console.error(`❌ Error updating ${guest.guest_name}:`, updateError.message);
          errors++;
        } else {
          console.log(`🔄 Updated: ${guest.guest_name}`);
          updated++;
        }
      } else {
        // Insert new entry
        const { error: insertError } = await supabase
          .from('invited_guests')
          .insert(guestData);
        
        if (insertError) {
          console.error(`❌ Error adding ${guest.guest_name}:`, insertError.message);
          errors++;
        } else {
          console.log(`✅ Added: ${guest.guest_name}`);
          added++;
        }
      }
    } catch (error) {
      console.error(`❌ Error processing ${guest.guest_name}:`, error.message);
      errors++;
    }
  }
  
  console.log('\n============================================================');
  console.log('📊 Summary:');
  console.log(`   ✅ Added: ${added}`);
  console.log(`   🔄 Updated: ${updated}`);
  console.log(`   ⏭️  Skipped: ${skipped}`);
  console.log(`   ❌ Errors: ${errors}`);
  console.log('============================================================\n');
  
  if (errors === 0) {
    console.log('✅ All OFFISLANDb guests added/updated successfully!');
  } else {
    console.log(`⚠️  Completed with ${errors} error(s)`);
  }
}

addOffIslandGuests()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });

