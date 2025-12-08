#!/usr/bin/env node

/**
 * Verify seating assignments count in database
 */

const { createClient } = require('@supabase/supabase-js');

require('dotenv').config({ path: '.env.local' });

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Error: Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function verifyCounts() {
  console.log('🔍 Verifying database counts...\n');

  // Count invited_guests
  const { count: invitedCount, error: invitedError } = await supabase
    .from('invited_guests')
    .select('*', { count: 'exact', head: true });

  if (invitedError) {
    console.error('❌ Error counting invited_guests:', invitedError.message);
  } else {
    console.log(`📋 invited_guests: ${invitedCount} entries`);
  }

  // Count seating_assignments
  const { count: seatingCount, error: seatingError } = await supabase
    .from('seating_assignments')
    .select('*', { count: 'exact', head: true });

  if (seatingError) {
    console.error('❌ Error counting seating_assignments:', seatingError.message);
  } else {
    console.log(`🪑 seating_assignments: ${seatingCount} entries`);
  }

  // Get a sample of seating assignments
  const { data: sample, error: sampleError } = await supabase
    .from('seating_assignments')
    .select('id, guest_name, table_number')
    .limit(5);

  if (sampleError) {
    console.error('❌ Error fetching sample:', sampleError.message);
  } else {
    console.log('\n📝 Sample entries:');
    sample?.forEach((entry, i) => {
      console.log(`   ${i + 1}. ${entry.guest_name} (Table: ${entry.table_number || 'Unassigned'})`);
    });
  }

  // Check if counts match
  if (invitedCount === seatingCount) {
    console.log('\n✅ Counts match! Both tables have', invitedCount, 'entries');
  } else {
    console.log('\n⚠️  Count mismatch!');
    console.log(`   invited_guests: ${invitedCount}`);
    console.log(`   seating_assignments: ${seatingCount}`);
  }
}

verifyCounts().catch(console.error);
