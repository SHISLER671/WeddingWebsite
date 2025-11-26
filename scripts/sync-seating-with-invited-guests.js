#!/usr/bin/env node

/**
 * Sync Seating Assignments with Invited Guests
 * 
 * This script ensures seating_assignments table stays in sync with invited_guests:
 * - Creates entries for all guests in invited_guests (if missing)
 * - Updates guest names and emails if they've changed
 * - Optionally removes entries not in invited_guests (with --cleanup flag)
 * - Preserves existing table_number assignments
 * 
 * Usage:
 *   node scripts/sync-seating-with-invited-guests.js [--cleanup]
 * 
 * Options:
 *   --cleanup  Remove seating assignments for guests not in invited_guests
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

const shouldCleanup = process.argv.includes('--cleanup');

async function syncSeatingAssignments() {
  try {
    console.log('🔄 Syncing seating_assignments with invited_guests...\n');

    // Step 1: Fetch all invited guests
    console.log('📋 Fetching invited guests...');
    const { data: invitedGuests, error: guestsError } = await supabase
      .from('invited_guests')
      .select('guest_name, email, allowed_party_size')
      .order('guest_name');

    if (guestsError) {
      console.error('❌ Error fetching invited guests:', guestsError.message);
      process.exit(1);
    }

    console.log(`   ✅ Found ${invitedGuests.length} invited guests\n`);

    // Step 2: Fetch all seating assignments
    console.log('🪑 Fetching seating assignments...');
    const { data: seatingAssignments, error: seatingError } = await supabase
      .from('seating_assignments')
      .select('id, guest_name, email, table_number');

    if (seatingError) {
      console.error('❌ Error fetching seating assignments:', seatingError.message);
      process.exit(1);
    }

    console.log(`   ✅ Found ${seatingAssignments.length} seating assignments\n`);

    // Step 3: Create a map of existing seating assignments by guest_name (normalized)
    const seatingMap = new Map();
    seatingAssignments.forEach(sa => {
      const key = sa.guest_name?.trim().toLowerCase() || '';
      seatingMap.set(key, sa);
    });

    // Step 4: Sync invited guests to seating assignments
    let created = 0;
    let updated = 0;
    let unchanged = 0;
    const errors = [];

    console.log('🔄 Syncing guests...\n');

    for (const guest of invitedGuests) {
      const normalizedName = guest.guest_name?.trim().toLowerCase() || '';
      const existing = seatingMap.get(normalizedName);

      if (!existing) {
        // Create new seating assignment entry (no table assigned yet)
        const { error: insertError } = await supabase
          .from('seating_assignments')
          .insert({
            guest_name: guest.guest_name,
            email: guest.email || null,
            table_number: 0, // 0 means not assigned yet
            plus_one_name: null,
          });

        if (insertError) {
          console.error(`   ❌ Failed to create entry for ${guest.guest_name}:`, insertError.message);
          errors.push({ guest: guest.guest_name, error: insertError.message });
        } else {
          created++;
          console.log(`   ✅ Created: ${guest.guest_name}`);
        }
      } else {
        // Check if name or email needs updating
        const needsUpdate = 
          existing.guest_name !== guest.guest_name ||
          (existing.email || '') !== (guest.email || '');

        if (needsUpdate) {
          const { error: updateError } = await supabase
            .from('seating_assignments')
            .update({
              guest_name: guest.guest_name,
              email: guest.email || null,
            })
            .eq('id', existing.id);

          if (updateError) {
            console.error(`   ❌ Failed to update ${guest.guest_name}:`, updateError.message);
            errors.push({ guest: guest.guest_name, error: updateError.message });
          } else {
            updated++;
            console.log(`   🔄 Updated: ${guest.guest_name}`);
          }
        } else {
          unchanged++;
        }
      }
    }

    // Step 5: Cleanup entries not in invited_guests (if --cleanup flag)
    let removed = 0;
    if (shouldCleanup) {
      console.log('\n🧹 Cleaning up entries not in invited_guests...\n');
      
      const invitedNames = new Set(
        invitedGuests.map(g => g.guest_name?.trim().toLowerCase() || '')
      );

      for (const assignment of seatingAssignments) {
        const normalizedName = assignment.guest_name?.trim().toLowerCase() || '';
        if (!invitedNames.has(normalizedName)) {
          const { error: deleteError } = await supabase
            .from('seating_assignments')
            .delete()
            .eq('id', assignment.id);

          if (deleteError) {
            console.error(`   ❌ Failed to remove ${assignment.guest_name}:`, deleteError.message);
            errors.push({ guest: assignment.guest_name, error: deleteError.message });
          } else {
            removed++;
            console.log(`   🗑️  Removed: ${assignment.guest_name}`);
          }
        }
      }
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 Sync Summary:');
    console.log('='.repeat(60));
    console.log(`   ✅ Created: ${created}`);
    console.log(`   🔄 Updated: ${updated}`);
    console.log(`   ✓ Unchanged: ${unchanged}`);
    if (shouldCleanup) {
      console.log(`   🗑️  Removed: ${removed}`);
    }
    if (errors.length > 0) {
      console.log(`   ❌ Errors: ${errors.length}`);
      errors.forEach(e => console.log(`      - ${e.guest}: ${e.error}`));
    }
    console.log('='.repeat(60));

    if (errors.length === 0) {
      console.log('\n✅ Sync complete!');
    } else {
      console.log('\n⚠️  Sync completed with errors. Please review above.');
      process.exit(1);
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
    process.exit(1);
  }
}

// Run the sync
syncSeatingAssignments();

