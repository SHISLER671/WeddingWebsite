#!/usr/bin/env node

/**
 * Check current RSVPs from the database
 */

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

async function checkRSVPs() {
  console.log('📋 Checking RSVPs from database...\n');
  
  const { data: rsvps, error } = await supabase
    .from('rsvps')
    .select('*')
    .order('guest_name');
  
  if (error) {
    console.error('❌ Error fetching RSVPs:', error.message);
    process.exit(1);
  }
  
  if (!rsvps || rsvps.length === 0) {
    console.log('   ℹ️  No RSVPs found in database\n');
    return;
  }
  
  console.log(`   ✅ Found ${rsvps.length} RSVP(s)\n`);
  console.log('='.repeat(60));
  
  const yesRSVPs = rsvps.filter(r => r.attendance === 'yes');
  const noRSVPs = rsvps.filter(r => r.attendance === 'no');
  
  console.log(`\n✅ CONFIRMED (Yes): ${yesRSVPs.length}`);
  console.log('-'.repeat(60));
  yesRSVPs.forEach(rsvp => {
    console.log(`   👤 ${rsvp.guest_name}`);
    console.log(`      📧 ${rsvp.email}`);
    console.log(`      👥 Guest Count: ${rsvp.guest_count || 1}`);
    if (rsvp.dietary_restrictions) {
      console.log(`      🍽️  Dietary: ${rsvp.dietary_restrictions}`);
    }
    console.log('');
  });
  
  if (noRSVPs.length > 0) {
    console.log(`\n❌ DECLINED (No): ${noRSVPs.length}`);
    console.log('-'.repeat(60));
    noRSVPs.forEach(rsvp => {
      console.log(`   👤 ${rsvp.guest_name}`);
      console.log(`      📧 ${rsvp.email}`);
      console.log('');
    });
  }
  
  // Calculate total confirmed headcount
  const totalConfirmed = yesRSVPs.reduce((sum, rsvp) => sum + (rsvp.guest_count || 1), 0);
  
  console.log('='.repeat(60));
  console.log(`\n📊 SUMMARY:`);
  console.log(`   Total RSVPs: ${rsvps.length}`);
  console.log(`   ✅ Confirmed: ${yesRSVPs.length} entries`);
  console.log(`   👥 Confirmed Headcount: ${totalConfirmed} people`);
  console.log(`   ❌ Declined: ${noRSVPs.length} entries`);
  console.log('');
}

checkRSVPs().catch(console.error);

