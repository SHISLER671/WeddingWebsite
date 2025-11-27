#!/usr/bin/env node

/**
 * Sync Seating Assignments with Invited Guests
 * 
 * This script ensures seating_assignments table stays in sync with invited_guests:
 * - Creates entries for all guests in invited_guests (if missing)
 * - Updates guest names and emails if they've changed
 * - Removes entries not in invited_guests (always cleans up)
 * - Removes entries with mock/test emails (e.g., @pending.wedding)
 * - Preserves existing table_number assignments
 * 
 * Usage:
 *   node scripts/sync-seating-with-invited-guests.js
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

// Helper function to check if email is a mock/test email
function isMockEmail(email) {
  if (!email) return false;
  const mockDomains = ['pending.wedding', 'test.com', 'example.com', 'mock.com', 'fake.com'];
  return mockDomains.some(domain => email.toLowerCase().includes(domain));
}

// Helper function to normalize name for comparison
function normalizeName(name) {
  return name?.trim().toLowerCase() || '';
}

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
    const seatingById = new Map(); // Also track by ID for cleanup
    seatingAssignments.forEach(sa => {
      const key = normalizeName(sa.guest_name);
      if (!seatingMap.has(key)) {
        seatingMap.set(key, sa);
      }
      seatingById.set(sa.id, sa);
    });

    // Step 4: Sync invited guests to seating assignments
    let created = 0;
    let updated = 0;
    let unchanged = 0;
    const errors = [];

    console.log('🔄 Syncing guests...\n');

    // Create a set of invited guest names for quick lookup
    const invitedNames = new Set(
      invitedGuests.map(g => normalizeName(g.guest_name))
    );

    for (const guest of invitedGuests) {
      const normalizedName = normalizeName(guest.guest_name);
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
        // Check if name, email, or mock email needs updating
        const hasMockEmail = isMockEmail(existing.email);
        const needsUpdate = 
          existing.guest_name !== guest.guest_name ||
          (existing.email || '') !== (guest.email || '') ||
          hasMockEmail;

        if (needsUpdate) {
          // If it has a mock email, replace with invited_guests email (or null)
          const emailToUse = hasMockEmail ? (guest.email || null) : existing.email;
          
          const { error: updateError } = await supabase
            .from('seating_assignments')
            .update({
              guest_name: guest.guest_name,
              email: emailToUse,
            })
            .eq('id', existing.id);

          if (updateError) {
            console.error(`   ❌ Failed to update ${guest.guest_name}:`, updateError.message);
            errors.push({ guest: guest.guest_name, error: updateError.message });
          } else {
            updated++;
            if (hasMockEmail) {
              console.log(`   🔄 Updated (removed mock email): ${guest.guest_name}`);
            } else {
              console.log(`   🔄 Updated: ${guest.guest_name}`);
            }
          }
        } else {
          unchanged++;
        }
      }
    }

    // Step 5: Cleanup entries not in invited_guests (always cleanup)
    let removed = 0;
    console.log('\n🧹 Cleaning up entries not in invited_guests and mock emails...\n');
    
    for (const assignment of seatingAssignments) {
      const normalizedName = normalizeName(assignment.guest_name);
      const shouldRemove = 
        !invitedNames.has(normalizedName) || // Not in invited_guests
        isMockEmail(assignment.email); // Has mock email

      if (shouldRemove) {
        const reason = !invitedNames.has(normalizedName) 
          ? 'not in invited_guests' 
          : 'has mock email';
        
        const { error: deleteError } = await supabase
          .from('seating_assignments')
          .delete()
          .eq('id', assignment.id);

        if (deleteError) {
          console.error(`   ❌ Failed to remove ${assignment.guest_name}:`, deleteError.message);
          errors.push({ guest: assignment.guest_name, error: deleteError.message });
        } else {
          removed++;
          console.log(`   🗑️  Removed: ${assignment.guest_name} (${reason})`);
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
    console.log(`   🗑️  Removed: ${removed}`);
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
