#!/usr/bin/env node

/**
 * Auto-Assign Tables for Wedding Seating
 * 
 * Assigns tables automatically:
 * 1. All ENTOURAGE guests first (starting from table 1)
 * 2. Then RSVPs with attendance="yes" in order of submission (created_at)
 * 
 * Rules:
 * - 26 tables, 10 people per table = 260 total capacity
 * - Only table numbers assigned (seat_number = 0)
 * - Entourage gets priority seating
 * - RSVPs assigned in order of submission
 * 
 * Usage:
 *   node scripts/auto-assign-tables.js
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

// List of entourage guest names (from your CSV entries 159-184)
const ENTOURAGE_GUESTS = [
  'Shane Quintanilla',
  'Kevin & Kyra Leasiolagi',
  'James Whippy',
  'Teke & Julieann Kaminaga',
  'Ray Paul Jardon',
  'Carter & Cristine Young',
  'Jesse & Annaiea Newby',
  'Jose Santos',
  'Vincent Camacho& Jelsea Ngowakl',
  'Carl Nangauta',
  'Jassen Guerrero',
  'Amos & spouse',
  'William & Dana Libby',
  'Devin & Moana Quitugua',
  'Brandon Cepeda',
  'Derrick & Reynne Wahl',
  'Neil Pang',
  'James Losongco',
  'Jonathan Pablo',
  'Gavin Gamido',
  'Camella Ramirez',
  'Christiana Ramirez',
  'Tammy Ramirez',
  'Nisha Chargualaf',
  'Elizabeth Valencia',
  'Audrey Benavente'
];

function normalizeName(name) {
  return name.toLowerCase().trim().replace(/\s+/g, ' ');
}

function isEntourageGuest(guestName, source) {
  // Check if source indicates entourage (if Notes column was stored)
  if (source && source.includes('ENTOURAGE')) {
    return true;
  }
  
  // Check against entourage list
  const normalized = normalizeName(guestName);
  return ENTOURAGE_GUESTS.some(entourage => {
    const normalizedEntourage = normalizeName(entourage);
    // Exact match or partial match (handles variations)
    if (normalized === normalizedEntourage) return true;
    
    // Check if first name matches (for cases like "Kevin Leasiolagi" matching "Kevin & Kyra Leasiolagi")
    const guestFirst = normalized.split(' ')[0];
    const entourageFirst = normalizedEntourage.split(' ')[0];
    if (guestFirst && entourageFirst && guestFirst === entourageFirst) {
      // Check if last name also matches
      const guestLast = normalized.split(' ').pop();
      const entourageLast = normalizedEntourage.split(' ').pop();
      if (guestLast && entourageLast && guestLast === entourageLast) {
        return true;
      }
    }
    
    return false;
  });
}

async function autoAssignTables() {
  console.log('🪑 Auto-Assigning Tables');
  console.log('='.repeat(60));
  console.log('');
  console.log('📋 Rules:');
  console.log('   - 26 tables, 10 people per table');
  console.log('   - Entourage guests seated first');
  console.log('   - Then RSVPs in order of submission');
  console.log('   - Only table numbers assigned (no seat numbers)');
  console.log('');

  try {
    // Step 1: Get all invited guests (check if source contains ENTOURAGE or check by name)
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

    // Step 3: Separate entourage and regular guests
    // Entourage gets tables regardless of RSVP status (reserve seating for all entourage)
    // Regular guests only get tables if they RSVP'd "yes"
    const entourageGuests = [];
    const regularGuests = [];

    // First, add all entourage guests (they all get tables)
    for (const guest of invitedGuests) {
      if (isEntourageGuest(guest.guest_name, guest.source)) {
        entourageGuests.push({
          ...guest,
          type: 'entourage',
          rsvpData: null
        });
      }
    }

    // Step 4: Match RSVPs to invited guests and categorize
    // Only include regular guests who RSVP'd "yes" (rsvps already filtered to attendance="yes")
    for (const rsvp of rsvps) {
      // Find matching invited guest
      const matchingGuest = invitedGuests.find(ig => {
        const normalizedRSVP = normalizeName(rsvp.guest_name);
        const normalizedGuest = normalizeName(ig.guest_name);
        return normalizedRSVP === normalizedGuest || 
               normalizedGuest.includes(normalizedRSVP) ||
               normalizedRSVP.includes(normalizedGuest);
      });

      if (matchingGuest) {
        if (isEntourageGuest(matchingGuest.guest_name, matchingGuest.source)) {
          // Update entourage guest with RSVP data (for accurate guest count)
          const entourageIndex = entourageGuests.findIndex(e => 
            normalizeName(e.guest_name) === normalizeName(matchingGuest.guest_name)
          );
          if (entourageIndex >= 0) {
            entourageGuests[entourageIndex].rsvpData = rsvp;
          }
        } else {
          // Regular guest with RSVP "yes" - add to regular guests list
          regularGuests.push({
            ...matchingGuest,
            type: 'regular',
            rsvpData: rsvp
          });
        }
      } else {
        // RSVP doesn't match invited guest - add as regular guest (only if RSVP'd yes)
        regularGuests.push({
          id: null,
          guest_name: rsvp.guest_name,
          email: rsvp.email,
          allowed_party_size: rsvp.guest_count || 1,
          type: 'regular',
          rsvpData: rsvp
        });
      }
    }

    console.log(`👥 Entourage guests: ${entourageGuests.length}`);
    console.log(`👥 Regular guests with RSVP: ${regularGuests.length}`);
    console.log('');

    // Step 5: Calculate total people
    const entouragePeople = entourageGuests.reduce((sum, g) => sum + (g.rsvpData?.guest_count || g.allowed_party_size || 1), 0);
    const regularPeople = regularGuests.reduce((sum, g) => sum + (g.rsvpData?.guest_count || g.allowed_party_size || 1), 0);
    const totalPeople = entouragePeople + regularPeople;
    const totalCapacity = 26 * 10; // 260

    console.log(`📊 People count:`);
    console.log(`   Entourage: ${entouragePeople} people`);
    console.log(`   Regular guests: ${regularPeople} people`);
    console.log(`   Total: ${totalPeople} people`);
    console.log(`   Capacity: ${totalCapacity} people`);
    console.log('');

    if (totalPeople > totalCapacity) {
      console.log(`⚠️  WARNING: Total people (${totalPeople}) exceeds capacity (${totalCapacity})!`);
      console.log('   Some guests may not get assigned to tables.');
      console.log('');
    }

    // Step 6: Assign tables
    let currentTable = 1;
    let currentTableCount = 0;
    let assignedCount = 0;
    let errorCount = 0;

    // First: Assign all entourage guests
    console.log('👥 Assigning entourage guests...');
    for (const guest of entourageGuests) {
      const peopleCount = guest.rsvpData?.guest_count || guest.allowed_party_size || 1;
      
      // Check if we need a new table
      if (currentTableCount + peopleCount > 10) {
        currentTable++;
        currentTableCount = 0;
      }

      if (currentTable > 26) {
        console.log(`   ⚠️  Ran out of tables! Cannot assign ${guest.guest_name}`);
        errorCount++;
        continue;
      }

      // Check if seating assignment exists, then update or insert
      const { data: existing, error: checkError } = await supabase
        .from('seating_assignments')
        .select('id')
        .eq('guest_name', guest.guest_name)
        .maybeSingle();

      let upsertError = null;
      if (existing) {
        // Update existing
        const { error: updateError } = await supabase
          .from('seating_assignments')
          .update({
            table_number: currentTable,
            seat_number: 0, // No individual seat numbers
            email: guest.email || null,
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
            table_number: currentTable,
            seat_number: 0, // No individual seat numbers
            plus_one_name: null,
            plus_one_seat: null,
          });
        upsertError = insertError;
      }

      if (upsertError) {
        console.error(`   ⚠️  Failed to assign ${guest.guest_name}:`, upsertError.message);
        errorCount++;
      } else {
        assignedCount++;
        currentTableCount += peopleCount;
        console.log(`   ✅ Table ${currentTable}: ${guest.guest_name} (${peopleCount} ${peopleCount === 1 ? 'person' : 'people'})`);
        
        // Move to next table if current table is full
        if (currentTableCount >= 10) {
          currentTable++;
          currentTableCount = 0;
        }
      }
    }

    // Second: Assign regular guests with RSVPs in order
    console.log('');
    console.log('👥 Assigning regular guests (by RSVP order)...');
    for (const guest of regularGuests) {
      const peopleCount = guest.rsvpData?.guest_count || guest.allowed_party_size || 1;
      
      // Check if we need a new table
      if (currentTableCount + peopleCount > 10) {
        currentTable++;
        currentTableCount = 0;
      }

      if (currentTable > 26) {
        console.log(`   ⚠️  Ran out of tables! Cannot assign ${guest.guest_name}`);
        errorCount++;
        continue;
      }

      // Check if seating assignment exists, then update or insert
      const { data: existing, error: checkError } = await supabase
        .from('seating_assignments')
        .select('id')
        .eq('guest_name', guest.guest_name)
        .maybeSingle();

      let upsertError = null;
      if (existing) {
        // Update existing
        const { error: updateError } = await supabase
          .from('seating_assignments')
          .update({
            table_number: currentTable,
            seat_number: 0, // No individual seat numbers
            email: guest.email || null,
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
            table_number: currentTable,
            seat_number: 0, // No individual seat numbers
            plus_one_name: null,
            plus_one_seat: null,
          });
        upsertError = insertError;
      }

      if (upsertError) {
        console.error(`   ⚠️  Failed to assign ${guest.guest_name}:`, upsertError.message);
        errorCount++;
      } else {
        assignedCount++;
        currentTableCount += peopleCount;
        const rsvpDate = guest.rsvpData?.created_at ? new Date(guest.rsvpData.created_at).toLocaleDateString() : 'N/A';
        console.log(`   ✅ Table ${currentTable}: ${guest.guest_name} (${peopleCount} ${peopleCount === 1 ? 'person' : 'people'}, RSVP: ${rsvpDate})`);
        
        // Move to next table if current table is full
        if (currentTableCount >= 10) {
          currentTable++;
          currentTableCount = 0;
        }
      }
    }

    console.log('');
    console.log('📊 Assignment Summary:');
    console.log(`   ✅ Assigned: ${assignedCount} guests`);
    console.log(`   ❌ Errors: ${errorCount}`);
    console.log(`   🪑 Tables used: ${currentTable - (currentTableCount > 0 ? 0 : 1)} of 26`);
    console.log(`   👥 Total people assigned: ${entouragePeople + regularPeople}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

async function main() {
  console.log('⚠️  This will assign tables to all entourage and RSVP guests');
  console.log('   Press Ctrl+C to cancel, or wait 3 seconds to continue...');
  console.log('');
  
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  await autoAssignTables();
  
  console.log('');
  console.log('✅ Table assignment complete!');
}

main().catch(console.error);
