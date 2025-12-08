#!/usr/bin/env node

/**
 * Check for duplicate entries in invited_guests table
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

function normalizeName(name) {
  return name?.toLowerCase().trim().replace(/\s+/g, ' ') || '';
}

async function checkDuplicates() {
  try {
    const { data, error } = await supabase
      .from('invited_guests')
      .select('id, guest_name, email, allowed_party_size')
      .order('guest_name');
    
    if (error) {
      console.error('❌ Error:', error.message);
      return;
    }
    
    console.log(`📊 Total entries in database: ${data.length}`);
    
    // Check for duplicates by normalized name
    const nameMap = new Map();
    const emailMap = new Map();
    const duplicates = [];
    
    data.forEach(guest => {
      const normalizedName = normalizeName(guest.guest_name);
      const email = guest.email?.toLowerCase().trim() || '';
      
      // Check by name
      if (normalizedName) {
        if (!nameMap.has(normalizedName)) {
          nameMap.set(normalizedName, []);
        }
        nameMap.get(normalizedName).push(guest);
      }
      
      // Check by email (if present)
      if (email) {
        if (!emailMap.has(email)) {
          emailMap.set(email, []);
        }
        emailMap.get(email).push(guest);
      }
    });
    
    // Find duplicates
    nameMap.forEach((guests, name) => {
      if (guests.length > 1) {
        duplicates.push({ type: 'name', value: name, guests });
      }
    });
    
    emailMap.forEach((guests, email) => {
      if (guests.length > 1 && email) {
        duplicates.push({ type: 'email', value: email, guests });
      }
    });
    
    if (duplicates.length > 0) {
      console.log(`\n❌ Found ${duplicates.length} duplicate groups:`);
      duplicates.forEach((dup, idx) => {
        console.log(`\n${idx + 1}. Duplicate by ${dup.type}: "${dup.value}"`);
        dup.guests.forEach(g => {
          console.log(`   - ID: ${g.id}, Name: "${g.guest_name}", Email: ${g.email || 'none'}`);
        });
      });
    } else {
      console.log('\n✅ No duplicates found by name or email');
    }
    
    // Also check exact count vs unique count
    const uniqueNames = new Set(data.map(g => normalizeName(g.guest_name)).filter(Boolean));
    console.log(`\n📊 Unique names (normalized): ${uniqueNames.size}`);
    console.log(`📊 Total entries: ${data.length}`);
    console.log(`📊 Difference: ${data.length - uniqueNames.size} potential duplicates`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkDuplicates();

