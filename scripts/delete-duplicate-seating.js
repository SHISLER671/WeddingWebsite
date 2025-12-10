#!/usr/bin/env node

/**
 * Delete duplicate seating assignment for Iuver Likiaksa
 * 
 * This script deletes the duplicate entry:
 * - "Iuver Likiaksa" (table 0) - duplicate to delete
 * 
 * Keeps the correct entry:
 * - "Iuver Likiaksa & Guest" (table 7) - correct entry
 * 
 * Usage:
 *   node scripts/delete-duplicate-seating.js
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

async function deleteDuplicate() {
  try {
    console.log('🗑️  Deleting duplicate seating assignment for Iuver Likiaksa...\n');

    // The duplicate entry ID to delete
    const duplicateId = 'd718820c-d833-4220-a0f4-f699400feeed';

    // First, verify the entry exists
    const { data: existing, error: findError } = await supabase
      .from('seating_assignments')
      .select('*')
      .eq('id', duplicateId)
      .single();

    if (findError) {
      console.error('❌ Error finding entry:', findError.message);
      return;
    }

    if (!existing) {
      console.log('⚠️  Entry not found. It may have already been deleted.');
      return;
    }

    console.log('📋 Found duplicate entry:');
    console.log(`   Name: ${existing.guest_name}`);
    console.log(`   Email: ${existing.email || '(empty)'}`);
    console.log(`   Table: ${existing.table_number}`);
    console.log(`   ID: ${existing.id}\n`);

    // Delete the duplicate
    const { error: deleteError } = await supabase
      .from('seating_assignments')
      .delete()
      .eq('id', duplicateId);

    if (deleteError) {
      console.error('❌ Error deleting entry:', deleteError.message);
      return;
    }

    console.log('✅ Successfully deleted duplicate entry!');
    console.log('\n📋 The correct entry "Iuver Likiaksa & Guest" (table 7) remains in the database.');

  } catch (error) {
    console.error('❌ Fatal error:', error.message);
    process.exit(1);
  }
}

// Run the deletion
deleteDuplicate()
  .then(() => {
    console.log('\n✨ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  });
