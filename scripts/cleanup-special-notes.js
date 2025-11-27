#!/usr/bin/env node

/**
 * Cleanup Special Notes in Seating Assignments
 * 
 * Converts "EMPTY" string values to NULL in special_notes column
 * 
 * Usage:
 *   node scripts/cleanup-special-notes.js
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

async function cleanupSpecialNotes() {
  try {
    console.log('🧹 Cleaning up special_notes column...\n');

    // Step 1: Find all entries with "EMPTY" or empty string in special_notes
    console.log('📋 Finding entries with "EMPTY" or empty string in special_notes...');
    
    // First, get all entries to check for variations
    const { data: allEntries, error: fetchAllError } = await supabase
      .from('seating_assignments')
      .select('id, guest_name, special_notes');

    if (fetchAllError) {
      console.error('❌ Error fetching entries:', fetchAllError.message);
      process.exit(1);
    }

    // Debug: Show unique special_notes values
    const uniqueValues = new Set();
    (allEntries || []).forEach(entry => {
      if (entry.special_notes !== null) {
        uniqueValues.add(`"${entry.special_notes}"`);
      }
    });
    
    if (uniqueValues.size > 0) {
      console.log(`   📊 Found ${uniqueValues.size} unique non-NULL values:`);
      Array.from(uniqueValues).slice(0, 10).forEach(val => console.log(`      - ${val}`));
      if (uniqueValues.size > 10) {
        console.log(`      ... and ${uniqueValues.size - 10} more`);
      }
      console.log('');
    }

    // Filter for entries that need cleanup (EMPTY, empty strings, or variations)
    const entries = (allEntries || []).filter(entry => {
      const notes = entry.special_notes;
      if (notes === null || notes === undefined) return false; // Skip NULL/undefined values
      const trimmed = notes.trim();
      const normalized = trimmed.toUpperCase();
      // Catch: empty strings, "EMPTY" (any case), or whitespace-only
      return trimmed === '' || normalized === 'EMPTY';
    });

    if (!entries || entries.length === 0) {
      console.log('   ✅ No entries found with "EMPTY" or empty string in special_notes');
      console.log('   ✅ All special_notes are already NULL or have valid values');
      return;
    }

    console.log(`   📋 Found ${entries.length} entries with "EMPTY" in special_notes\n`);

    // Step 2: Update all entries to set special_notes to NULL
    console.log('🔄 Updating entries...\n');
    
    let updated = 0;
    let errors = [];

    // Update in batches to avoid overwhelming the database
    const batchSize = 50;
    for (let i = 0; i < entries.length; i += batchSize) {
      const batch = entries.slice(i, i + batchSize);
      const ids = batch.map(e => e.id);

      const { error: updateError } = await supabase
        .from('seating_assignments')
        .update({ special_notes: null })
        .in('id', ids);

      if (updateError) {
        console.error(`   ❌ Failed to update batch ${Math.floor(i / batchSize) + 1}:`, updateError.message);
        errors.push(...batch.map(e => ({ guest: e.guest_name, error: updateError.message })));
      } else {
        updated += batch.length;
        console.log(`   ✅ Updated ${batch.length} entries (${updated}/${entries.length} total)`);
      }
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 Cleanup Summary:');
    console.log('='.repeat(60));
    console.log(`   🔄 Updated: ${updated}`);
    if (errors.length > 0) {
      console.log(`   ❌ Errors: ${errors.length}`);
      errors.forEach(e => console.log(`      - ${e.guest}: ${e.error}`));
    }
    console.log('='.repeat(60));

    if (errors.length === 0) {
      console.log('\n✅ Cleanup complete! All "EMPTY" values converted to NULL');
    } else {
      console.log('\n⚠️  Cleanup completed with errors. Please review above.');
      process.exit(1);
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
    process.exit(1);
  }
}

// Run the cleanup
cleanupSpecialNotes();
