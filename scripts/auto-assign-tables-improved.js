#!/usr/bin/env node

/**
 * Auto-Assign Tables for Wedding Seating (Improved)
 * 
 * Assigns tables automatically with these priorities:
 * 1. All ENTOURAGE and KIDENTOURAGE guests first (regardless of RSVP)
 * 2. Then RSVPs with attendance="yes" in order of submission
 * 
 * Rules:
 * - 26 tables, 10 people per table = 260 total capacity
 * - Max 10 people per table
 * - Keep families and couples together (don't split)
 * - Entourage/KIDENTOURAGE get priority seating
 * - RSVPs assigned in order of submission
 * 
 * Usage:
 *   node scripts/auto-assign-tables-improved.js
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

function normalizeName(name) {
  return name.toLowerCase().trim().replace(/\s+/g, ' ');
}

function isEntourageOrKidEntourage(guestName, source) {
  // Check if source/notes contains ENTOURAGE
  if (source && typeof source === 'string' && source.toUpperCase().includes('ENTOURAGE')) {
    return true;
  }
  
  // Check if source/notes contains KIDENTOURAGE
  if (source && typeof source === 'string' && source.toUpperCase().includes('KIDENTOURAGE')) {
    return true;
  }
  
  return false;
}

function isFamilyOrCouple(guestName) {
  // Check for indicators of families or couples
  const name = guestName.toLowerCase();
  return name.includes('&') || 
         name.includes('and family') || 
         name.includes('and') ||
         name.includes('family');
}

async function autoAssignTables() {
  console.log('🪑 Auto-Assigning Tables (Improved)');
  console.log('='.repeat(60));
  console.log('');
  console.log('📋 Rules:');
  console.log('   - 26 tables, 10 people per table (max)');
  console.log('   - ENTOURAGE/KIDENTOURAGE guests seated first (with or without RSVP)');
  console.log('   - Then RSVPs in order of submission');
  console.log('   - Keep families and couples together');
  console.log('   - Only table numbers assigned (no seat numbers)');
  console.log('');

  try {
    // Step 1: Get all invited guests with source/notes
    const { data: invitedGuests, error: invitedError } = await supabase
      .from('invited_guests')
      .select('id, guest_name, email, allowed_party_size, source')
      .order('guest_name');

    if (invitedError) {
      console.error('❌ Error fetching invited guests:', invitedError.message);
      return;
    }

    console.log(`📋 Found ${invitedGuests.length} invited guests`);

    // Step 2: Get all RSVPs with attendance="yes", ordered by created_at
    const { data: rsvps, error: rsvpsError } = await supabase
      .from('rsvps')
      .select('id, guest_name, email, attendance, guest_count, created_at')
      .eq('attendance', 'yes')
      .order('created_at', { ascending: true });

    if (rsvpsError) {
      console.error('❌ Error fetching RSVPs:', rsvpsError.message);
      return;
    }

    console.log(`✅ Found ${rsvps.length} RSVPs with attendance="yes"`);
    console.log('');

    // Step 3: Categorize guests
    const entourageGuests = []; // ENTOURAGE/KIDENTOURAGE (get tables regardless of RSVP)
    const regularGuests = []; // Regular guests who RSVP'd "yes"

    // First, identify all ENTOURAGE/KIDENTOURAGE guests
    for (const guest of invitedGuests) {
      if (isEntourageOrKidEntourage(guest.guest_name, guest.source)) {
        entourageGuests.push({
          ...guest,
          type: 'entourage',
          rsvpData: null
        });
      }
    }

    // Step 4: Match RSVPs to invited guests
    // Update entourage guests with RSVP data if they RSVP'd
    for (const rsvp of rsvps) {
      const normalizedRSVP = normalizeName(rsvp.guest_name);
      
      // Find matching invited guest
      const matchingGuest = invitedGuests.find(ig => {
        const normalizedGuest = normalizeName(ig.guest_name);
        return normalizedRSVP === normalizedGuest || 
               normalizedGuest.includes(normalizedRSVP) ||
               normalizedRSVP.includes(normalizedGuest);
      });

      if (matchingGuest) {
        if (isEntourageOrKidEntourage(matchingGuest.guest_name, matchingGuest.source)) {
          // Update entourage guest with RSVP data (for accurate guest count)
          const entourageIndex = entourageGuests.findIndex(e => 
            normalizeName(e.guest_name) === normalizeName(matchingGuest.guest_name)
          );
          if (entourageIndex >= 0) {
            entourageGuests[entourageIndex].rsvpData = rsvp;
          }
        } else {
          // Regular guest with RSVP "yes"
          regularGuests.push({
            ...matchingGuest,
            type: 'regular',
            rsvpData: rsvp
          });
        }
      } else {
        // RSVP doesn't match invited guest - add as regular guest
        regularGuests.push({
          id: null,
          guest_name: rsvp.guest_name,
          email: rsvp.email,
          allowed_party_size: rsvp.guest_count || 1,
          source: null,
          type: 'regular',
          rsvpData: rsvp
        });
      }
    }

    console.log(`👥 Entourage/KIDENTOURAGE guests: ${entourageGuests.length}`);
    console.log(`👥 Regular guests with RSVP: ${regularGuests.length}`);
    console.log('');

    // Step 5: Calculate total people
    const entouragePeople = entourageGuests.reduce((sum, g) => 
      sum + (g.rsvpData?.guest_count || g.allowed_party_size || 1), 0);
    const regularPeople = regularGuests.reduce((sum, g) => 
      sum + (g.rsvpData?.guest_count || g.allowed_party_size || 1), 0);
    const totalPeople = entouragePeople + regularPeople;
    const totalCapacity = 26 * 10; // 260

    console.log(`📊 People count:`);
    console.log(`   Entourage/KIDENTOURAGE: ${entouragePeople} people`);
    console.log(`   Regular guests: ${regularPeople} people`);
    console.log(`   Total: ${totalPeople} people`);
    console.log(`   Capacity: ${totalCapacity} people`);
    console.log('');

    if (totalPeople > totalCapacity) {
      console.log(`⚠️  WARNING: Total people (${totalPeople}) exceeds capacity (${totalCapacity})!`);
      console.log('   Some guests may not get assigned to tables.');
      console.log('');
    }

    // Step 6: Assign tables (max 10 per table, keep families/couples together)
    let currentTable = 1;
    let currentTableCount = 0;
    let assignedCount = 0;
    let errorCount = 0;

    // Helper function to assign a guest to a table
    async function assignGuestToTable(guest, tableNumber, peopleCount) {
      // Check if seating assignment exists
      const { data: existing, error: checkError } = await supabase
        .from('seating_assignments')
        .select('id')
        .or(`guest_name.eq.${guest.guest_name},email.eq.${guest.email || ''}`)
        .maybeSingle();

      let upsertError = null;
      if (existing) {
        // Update existing
        const { error: updateError } = await supabase
          .from('seating_assignments')
          .update({
            table_number: tableNumber,
            email: guest.email || null,
            guest_name: guest.guest_name,
          })
          .eq('id', existing.id);
        upsertError = updateError;
      } else {
        // Insert new
        const { error: insertError } = await supabase
          .from('seating_assignments')
          .insert({
            guest_name: guest.guest_name,
            email: guest.email || null,
            table_number: tableNumber,
            plus_one_name: null,
          });
        upsertError = insertError;
      }

      if (upsertError) {
        console.error(`   ⚠️  Failed to assign ${guest.guest_name}:`, upsertError.message);
        return false;
      } else {
        return true;
      }
    }

    // First: Assign all ENTOURAGE/KIDENTOURAGE guests
    console.log('👥 Assigning ENTOURAGE/KIDENTOURAGE guests...');
    for (const guest of entourageGuests) {
      const peopleCount = guest.rsvpData?.guest_count || guest.allowed_party_size || 1;
      
      // Check if we need a new table (max 10 per table)
      if (currentTableCount + peopleCount > 10) {
        currentTable++;
        currentTableCount = 0;
      }

      if (currentTable > 26) {
        console.log(`   ⚠️  Ran out of tables! Cannot assign ${guest.guest_name}`);
        errorCount++;
        continue;
      }

      const success = await assignGuestToTable(guest, currentTable, peopleCount);
      if (success) {
        assignedCount++;
        currentTableCount += peopleCount;
        const rsvpInfo = guest.rsvpData ? ` (RSVP'd: ${guest.rsvpData.guest_count} people)` : ' (no RSVP yet)';
        console.log(`   ✅ Table ${currentTable}: ${guest.guest_name} (${peopleCount} ${peopleCount === 1 ? 'person' : 'people'})${rsvpInfo}`);
        
        // Move to next table if current table is full (10 people)
        if (currentTableCount >= 10) {
          currentTable++;
          currentTableCount = 0;
        }
      } else {
        errorCount++;
      }
    }

    // Second: Assign regular guests with RSVPs in order
    console.log('');
    console.log('👥 Assigning regular guests (by RSVP order)...');
    for (const guest of regularGuests) {
      const peopleCount = guest.rsvpData?.guest_count || guest.allowed_party_size || 1;
      
      // Check if we need a new table (max 10 per table)
      // Keep families/couples together - if this guest won't fit, start new table
      if (currentTableCount + peopleCount > 10) {
        currentTable++;
        currentTableCount = 0;
      }

      if (currentTable > 26) {
        console.log(`   ⚠️  Ran out of tables! Cannot assign ${guest.guest_name}`);
        errorCount++;
        continue;
      }

      const success = await assignGuestToTable(guest, currentTable, peopleCount);
      if (success) {
        assignedCount++;
        currentTableCount += peopleCount;
        const rsvpDate = guest.rsvpData?.created_at ? new Date(guest.rsvpData.created_at).toLocaleDateString() : 'N/A';
        const familyNote = isFamilyOrCouple(guest.guest_name) ? ' [family/couple]' : '';
        console.log(`   ✅ Table ${currentTable}: ${guest.guest_name} (${peopleCount} ${peopleCount === 1 ? 'person' : 'people'}, RSVP: ${rsvpDate})${familyNote}`);
        
        // Move to next table if current table is full (10 people)
        if (currentTableCount >= 10) {
          currentTable++;
          currentTableCount = 0;
        }
      } else {
        errorCount++;
      }
    }

    console.log('');
    console.log('📊 Assignment Summary:');
    console.log(`   ✅ Assigned: ${assignedCount} guests`);
    console.log(`   ❌ Errors: ${errorCount}`);
    const tablesUsed = currentTable - (currentTableCount > 0 ? 0 : 1);
    console.log(`   🪑 Tables used: ${tablesUsed} of 26`);
    console.log(`   👥 Total people assigned: ${entouragePeople + regularPeople}`);
    console.log('');

    // Step 7: Check for RSVP'd guests without tables
    console.log('🔍 Checking for RSVP\'d guests without tables...');
    const { data: allAssignments, error: assignError } = await supabase
      .from('seating_assignments')
      .select('guest_name, email, table_number');

    if (!assignError && allAssignments) {
      const unassignedRSVPs = rsvps.filter(rsvp => {
        const hasAssignment = allAssignments.some(a => 
          (a.email && a.email.toLowerCase() === rsvp.email.toLowerCase()) ||
          normalizeName(a.guest_name) === normalizeName(rsvp.guest_name)
        );
        return !hasAssignment || allAssignments.find(a => 
          (a.email && a.email.toLowerCase() === rsvp.email.toLowerCase()) ||
          normalizeName(a.guest_name) === normalizeName(rsvp.guest_name)
        )?.table_number === 0;
      });

      if (unassignedRSVPs.length > 0) {
        console.log(`   ⚠️  Found ${unassignedRSVPs.length} RSVP'd guests without tables:`);
        unassignedRSVPs.forEach(rsvp => {
          console.log(`      - ${rsvp.guest_name} (${rsvp.email})`);
        });
      } else {
        console.log('   ✅ All RSVP\'d guests have tables assigned!');
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
  }
}

async function main() {
  console.log('⚠️  This will assign tables to all ENTOURAGE/KIDENTOURAGE and RSVP guests');
  console.log('   Press Ctrl+C to cancel, or wait 3 seconds to continue...');
  console.log('');
  
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  await autoAssignTables();
  
  console.log('');
  console.log('✅ Table assignment complete!');
}

main().catch(console.error);
