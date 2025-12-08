#!/usr/bin/env node

/**
 * Sync Seating Assignments from RSVPs Only
 * 
 * This script populates seating_assignments table ONLY from rsvps table.
 * It does NOT sync from invited_guests or MASTERGUESTLIST.
 * 
 * Flow:
 * - MASTERGUESTLIST.csv → invited_guests (via sync-invited-guests-with-csv.js)
 * - rsvps → seating_assignments (this script)
 * - Admin page reads from invited_guests (for display)
 * - Admin page updates seating_assignments (for table assignments)
 * 
 * Usage:
 *   node scripts/sync-seating-from-rsvps.js
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

// Helper function to normalize name for comparison
function normalizeName(name) {
  return name?.trim().toLowerCase() || '';
}

async function syncSeatingFromRSVPs() {
  try {
    console.log('🔄 Syncing seating_assignments from rsvps table only...\n');

    // Step 1: Fetch all RSVPs
    const { data: rsvps, error: rsvpError } = await supabase
      .from('rsvps')
      .select('*');

    if (rsvpError) {
      console.error('❌ Error fetching RSVPs:', rsvpError.message);
      return;
    }

    if (!rsvps || rsvps.length === 0) {
      console.log('⚠️  No RSVPs found. Nothing to sync.');
      return;
    }

    console.log(`📋 Found ${rsvps.length} RSVP(s)`);

    // Step 2: Fetch existing seating assignments to preserve table numbers
    const { data: existingAssignments, error: existingError } = await supabase
      .from('seating_assignments')
      .select('*');

    if (existingError) {
      console.error('❌ Error fetching existing assignments:', existingError.message);
      return;
    }

    // Create a map of existing assignments by email and name to preserve table numbers
    const existingMap = new Map();
    existingAssignments?.forEach((assignment) => {
      const emailKey = assignment.email?.toLowerCase() || '';
      const nameKey = normalizeName(assignment.guest_name);
      if (emailKey) {
        existingMap.set(`email:${emailKey}`, assignment);
      }
      if (nameKey) {
        existingMap.set(`name:${nameKey}`, assignment);
      }
    });

    console.log(`📋 Found ${existingAssignments?.length || 0} existing seating assignment(s)`);

    // Step 3: Process RSVPs and create/update seating assignments
    let created = 0;
    let updated = 0;
    let errors = 0;

    for (const rsvp of rsvps) {
      try {
        // Find existing assignment by email or name
        const emailKey = rsvp.email?.toLowerCase() || '';
        const nameKey = normalizeName(rsvp.guest_name);
        const existingByEmail = emailKey ? existingMap.get(`email:${emailKey}`) : null;
        const existingByName = nameKey ? existingMap.get(`name:${nameKey}`) : null;
        const existing = existingByEmail || existingByName;

        // Prepare seating assignment data from RSVP
        const seatingData = {
          guest_name: rsvp.guest_name,
          email: rsvp.email,
          // Preserve table_number if it exists, otherwise set to 0 (unassigned)
          table_number: existing?.table_number || 0,
          // Preserve plus_one_name, dietary_notes, special_notes if they exist
          plus_one_name: existing?.plus_one_name || null,
          dietary_notes: rsvp.dietary_restrictions || existing?.dietary_notes || null,
          special_notes: rsvp.special_message || existing?.special_notes || null,
        };

        if (existing) {
          // Update existing assignment
          const { error: updateError } = await supabase
            .from('seating_assignments')
            .update({
              guest_name: seatingData.guest_name,
              email: seatingData.email,
              dietary_notes: seatingData.dietary_notes,
              special_notes: seatingData.special_notes,
              // Don't update table_number here - it's managed by admin
              // Don't update plus_one_name here - it's managed by admin
            })
            .eq('id', existing.id);

          if (updateError) {
            console.error(`❌ Error updating assignment for ${rsvp.guest_name}:`, updateError.message || updateError || 'Unknown error');
            console.error(`   Full error:`, JSON.stringify(updateError, null, 2));
            errors++;
          } else {
            updated++;
            console.log(`✅ Updated: ${rsvp.guest_name} (${rsvp.email})`);
          }
        } else {
          // Create new assignment
          const { error: insertError } = await supabase
            .from('seating_assignments')
            .insert(seatingData);

          if (insertError) {
            console.error(`❌ Error creating assignment for ${rsvp.guest_name}:`, insertError.message || insertError || 'Unknown error');
            console.error(`   Full error:`, JSON.stringify(insertError, null, 2));
            errors++;
          } else {
            created++;
            console.log(`✅ Created: ${rsvp.guest_name} (${rsvp.email})`);
          }
        }
      } catch (error) {
        console.error(`❌ Error processing RSVP for ${rsvp.guest_name}:`, error.message);
        errors++;
      }
    }

    // Step 4: Remove seating assignments that don't have corresponding RSVPs
    // But preserve assignments that might have table numbers assigned
    const rsvpEmails = new Set(rsvps.map(r => r.email?.toLowerCase()).filter(Boolean));
    const rsvpNames = new Set(rsvps.map(r => normalizeName(r.guest_name)).filter(Boolean));

    let removed = 0;
    if (existingAssignments) {
      for (const assignment of existingAssignments) {
        const emailMatch = assignment.email && rsvpEmails.has(assignment.email.toLowerCase());
        const nameMatch = assignment.guest_name && rsvpNames.has(normalizeName(assignment.guest_name));

        if (!emailMatch && !nameMatch) {
          // This assignment doesn't match any RSVP
          // Only remove if it doesn't have a table assignment (to preserve admin work)
          if (!assignment.table_number || assignment.table_number === 0) {
            const { error: deleteError } = await supabase
              .from('seating_assignments')
              .delete()
              .eq('id', assignment.id);

            if (deleteError) {
              console.error(`❌ Error removing assignment for ${assignment.guest_name}:`, deleteError.message);
            } else {
              removed++;
              console.log(`🗑️  Removed: ${assignment.guest_name} (no matching RSVP)`);
            }
          } else {
            console.log(`⚠️  Preserved: ${assignment.guest_name} (has table assignment but no RSVP)`);
          }
        }
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('📊 SYNC SUMMARY');
    console.log('='.repeat(60));
    console.log(`✅ Created: ${created}`);
    console.log(`🔄 Updated: ${updated}`);
    console.log(`🗑️  Removed: ${removed}`);
    if (errors > 0) {
      console.log(`❌ Errors: ${errors}`);
    }
    console.log('='.repeat(60));
    console.log('\n✅ Sync complete!');

  } catch (error) {
    console.error('❌ Fatal error:', error.message);
    process.exit(1);
  }
}

// Run the sync
syncSeatingFromRSVPs()
  .then(() => {
    console.log('\n✨ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  });
