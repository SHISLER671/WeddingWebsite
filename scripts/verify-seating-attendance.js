#!/usr/bin/env node

/**
 * Verify seating assignments match RSVP attendance status
 * Checks:
 * 1. No seating assignments for people with attendance="no"
 * 2. No table_number=0 for people with attendance="yes"
 * 3. All people with attendance="yes" have seating assignments
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

function normalizeName(name) {
  return name?.trim().toLowerCase() || '';
}

async function verifySeatingAttendance() {
  try {
    console.log('🔍 Verifying seating assignments match RSVP attendance status...\n');

    // Get all RSVPs
    const { data: rsvps, error: rsvpError } = await supabase
      .from('rsvps')
      .select('*');

    if (rsvpError) {
      console.error('❌ Error fetching RSVPs:', rsvpError.message);
      return;
    }

    // Get all seating assignments
    const { data: seating, error: seatingError } = await supabase
      .from('seating_assignments')
      .select('*');

    if (seatingError) {
      console.error('❌ Error fetching seating assignments:', seatingError.message);
      return;
    }

    console.log(`📋 Found ${rsvps.length} RSVP(s)`);
    console.log(`📋 Found ${seating.length} seating assignment(s)\n`);

    // Create maps for lookup
    const rsvpMap = new Map();
    rsvps.forEach(rsvp => {
      const emailKey = rsvp.email?.toLowerCase() || '';
      const nameKey = normalizeName(rsvp.guest_name);
      if (emailKey) {
        rsvpMap.set(`email:${emailKey}`, rsvp);
      }
      if (nameKey) {
        rsvpMap.set(`name:${nameKey}`, rsvp);
      }
    });

    const seatingMap = new Map();
    seating.forEach(assignment => {
      const emailKey = assignment.email?.toLowerCase() || '';
      const nameKey = normalizeName(assignment.guest_name);
      if (emailKey) {
        seatingMap.set(`email:${emailKey}`, assignment);
      }
      if (nameKey) {
        seatingMap.set(`name:${nameKey}`, assignment);
      }
    });

    // Check 1: Seating assignments for people with attendance="no" should have table_number=0
    console.log('='.repeat(60));
    console.log('CHECK 1: People with attendance="no" should have table_number=0');
    console.log('='.repeat(60));
    const noAttendanceIssues = [];
    
    seating.forEach(assignment => {
      const emailKey = assignment.email?.toLowerCase() || '';
      const nameKey = normalizeName(assignment.guest_name);
      const rsvpByEmail = emailKey ? rsvpMap.get(`email:${emailKey}`) : null;
      const rsvpByName = nameKey ? rsvpMap.get(`name:${nameKey}`) : null;
      const rsvp = rsvpByEmail || rsvpByName;
      
      if (rsvp && rsvp.attendance === 'no') {
        // Check if they have table_number != 0 (should be 0)
        if (assignment.table_number !== 0 && assignment.table_number !== null) {
          noAttendanceIssues.push({
            seating: assignment,
            rsvp: rsvp
          });
        }
      }
    });

    if (noAttendanceIssues.length > 0) {
      console.log(`❌ Found ${noAttendanceIssues.length} people with attendance="no" who don't have table_number=0:`);
      noAttendanceIssues.forEach(({ seating, rsvp }) => {
        console.log(`   - ${seating.guest_name} (${seating.email})`);
        console.log(`     Current table: ${seating.table_number || 'null'} (should be 0)`);
      });
    } else {
      console.log('✅ All people with attendance="no" have table_number=0');
    }

    // Check 2: People with attendance="yes" who have table_number=0
    console.log('\n' + '='.repeat(60));
    console.log('CHECK 2: People with attendance="yes" who have table_number=0');
    console.log('='.repeat(60));
    const zeroTableIssues = [];

    rsvps.forEach(rsvp => {
      if (rsvp.attendance === 'yes') {
        const emailKey = rsvp.email?.toLowerCase() || '';
        const nameKey = normalizeName(rsvp.guest_name);
        const seatingByEmail = emailKey ? seatingMap.get(`email:${emailKey}`) : null;
        const seatingByName = nameKey ? seatingMap.get(`name:${nameKey}`) : null;
        const assignment = seatingByEmail || seatingByName;

        if (assignment && (assignment.table_number === 0 || assignment.table_number === null)) {
          zeroTableIssues.push({
            rsvp: rsvp,
            seating: assignment
          });
        }
      }
    });

    if (zeroTableIssues.length > 0) {
      console.log(`❌ Found ${zeroTableIssues.length} people with attendance="yes" who have table_number=0:`);
      zeroTableIssues.forEach(({ rsvp, seating }) => {
        console.log(`   - ${rsvp.guest_name} (${rsvp.email})`);
      });
    } else {
      console.log('✅ All people with attendance="yes" have non-zero table numbers (or no seating assignment yet)');
    }

    // Check 3: People with attendance="yes" who don't have seating assignments
    console.log('\n' + '='.repeat(60));
    console.log('CHECK 3: People with attendance="yes" who don\'t have seating assignments');
    console.log('='.repeat(60));
    const missingSeating = [];

    rsvps.forEach(rsvp => {
      if (rsvp.attendance === 'yes') {
        const emailKey = rsvp.email?.toLowerCase() || '';
        const nameKey = normalizeName(rsvp.guest_name);
        const seatingByEmail = emailKey ? seatingMap.get(`email:${emailKey}`) : null;
        const seatingByName = nameKey ? seatingMap.get(`name:${nameKey}`) : null;
        const assignment = seatingByEmail || seatingByName;

        if (!assignment) {
          missingSeating.push(rsvp);
        }
      }
    });

    if (missingSeating.length > 0) {
      console.log(`⚠️  Found ${missingSeating.length} people with attendance="yes" who don't have seating assignments:`);
      missingSeating.forEach(rsvp => {
        console.log(`   - ${rsvp.guest_name} (${rsvp.email})`);
      });
      console.log('\n   Note: This is expected if they just RSVPed. Run sync-seating-from-rsvps.js to create assignments.');
    } else {
      console.log('✅ All people with attendance="yes" have seating assignments');
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 SUMMARY');
    console.log('='.repeat(60));
    console.log(`❌ Seating for attendance="no": ${noAttendanceIssues.length} issues`);
    console.log(`❌ attendance="yes" with table_number=0: ${zeroTableIssues.length} issues`);
    console.log(`⚠️  attendance="yes" missing seating: ${missingSeating.length} issues`);
    
    const totalIssues = noAttendanceIssues.length + zeroTableIssues.length;
    if (totalIssues === 0) {
      console.log('\n✅ All checks passed!');
    } else {
      console.log(`\n⚠️  Found ${totalIssues} issue(s) that need to be fixed.`);
    }

  } catch (error) {
    console.error('❌ Fatal error:', error.message);
    process.exit(1);
  }
}

verifySeatingAttendance()
  .then(() => {
    console.log('\n✨ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  });

