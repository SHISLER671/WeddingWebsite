#!/usr/bin/env node

/**
 * Update invited_guests emails from rsvps table
 * 
 * This script updates the email field in invited_guests table
 * with emails from rsvps table where names match.
 * 
 * This fixes mismatches where invited_guests has empty email
 * but rsvps has the actual email.
 * 
 * Usage:
 *   node scripts/update-invited-guests-emails-from-rsvps.js
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
// Removes common suffixes like "& Guest", " & Guest", etc.
function normalizeName(name) {
  if (!name) return '';
  let normalized = name.trim().toLowerCase();
  // Remove common suffixes
  normalized = normalized.replace(/\s*&\s*guest\s*$/i, '');
  normalized = normalized.replace(/\s*and\s*guest\s*$/i, '');
  normalized = normalized.replace(/\s*\+\s*guest\s*$/i, '');
  return normalized;
}

async function updateInvitedGuestsEmails() {
  try {
    console.log('🔄 Updating invited_guests emails from rsvps table...\n');

    // Step 1: Fetch all RSVPs with emails
    const { data: rsvps, error: rsvpError } = await supabase
      .from('rsvps')
      .select('guest_name, email')
      .not('email', 'is', null);

    if (rsvpError) {
      console.error('❌ Error fetching RSVPs:', rsvpError.message);
      return;
    }

    if (!rsvps || rsvps.length === 0) {
      console.log('⚠️  No RSVPs with emails found.');
      return;
    }

    console.log(`📋 Found ${rsvps.length} RSVP(s) with emails`);

    // Step 2: Fetch all invited_guests
    const { data: invitedGuests, error: invitedError } = await supabase
      .from('invited_guests')
      .select('*');

    if (invitedError) {
      console.error('❌ Error fetching invited_guests:', invitedError.message);
      return;
    }

    console.log(`📋 Found ${invitedGuests?.length || 0} invited guest(s)`);

    // Step 3: Create a map of RSVPs by normalized name and email
    const rsvpMapByName = new Map();
    const rsvpMapByEmail = new Map();
    rsvps.forEach((rsvp) => {
      const nameKey = normalizeName(rsvp.guest_name);
      if (nameKey) {
        // If multiple RSVPs with same name, use the first one
        if (!rsvpMapByName.has(nameKey)) {
          rsvpMapByName.set(nameKey, rsvp);
        }
      }
      // Also index by email for direct matching
      if (rsvp.email) {
        const emailKey = rsvp.email.toLowerCase().trim();
        if (!rsvpMapByEmail.has(emailKey)) {
          rsvpMapByEmail.set(emailKey, rsvp);
        }
      }
    });

    // Step 4: Update invited_guests with emails from RSVPs
    let updated = 0;
    let skipped = 0;
    let errors = 0;

    for (const guest of invitedGuests || []) {
      try {
        // Try to find matching RSVP by email first (most reliable)
        let matchingRsvp = null;
        if (guest.email) {
          const emailKey = guest.email.toLowerCase().trim();
          matchingRsvp = rsvpMapByEmail.get(emailKey);
        }
        
        // If no match by email, try by normalized name
        if (!matchingRsvp) {
          const nameKey = normalizeName(guest.guest_name);
          matchingRsvp = nameKey ? rsvpMapByName.get(nameKey) : null;
        }

        if (matchingRsvp && matchingRsvp.email) {
          // Only update if invited_guest doesn't have an email or has a different email
          if (!guest.email || guest.email.toLowerCase().trim() !== matchingRsvp.email.toLowerCase().trim()) {
            const { error: updateError } = await supabase
              .from('invited_guests')
              .update({ email: matchingRsvp.email })
              .eq('id', guest.id);

            if (updateError) {
              console.error(`❌ Error updating ${guest.guest_name}:`, updateError.message || updateError);
              errors++;
            } else {
              updated++;
              console.log(`✅ Updated: ${guest.guest_name} → ${matchingRsvp.email}`);
            }
          } else {
            skipped++;
          }
        }
      } catch (error) {
        console.error(`❌ Error processing ${guest.guest_name}:`, error.message);
        errors++;
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('📊 UPDATE SUMMARY');
    console.log('='.repeat(60));
    console.log(`✅ Updated: ${updated}`);
    console.log(`⏭️  Skipped: ${skipped} (already had matching email)`);
    if (errors > 0) {
      console.log(`❌ Errors: ${errors}`);
    }
    console.log('='.repeat(60));
    console.log('\n✅ Update complete!');

  } catch (error) {
    console.error('❌ Fatal error:', error.message);
    process.exit(1);
  }
}

// Run the update
updateInvitedGuestsEmails()
  .then(() => {
    console.log('\n✨ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  });
