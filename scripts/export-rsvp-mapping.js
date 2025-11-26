#!/usr/bin/env node

/**
 * Export RSVP and Invited Guest data for manual mapping
 * 
 * This script exports:
 * 1. All RSVPs with their IDs and guest names
 * 2. All invited guests with their IDs and guest names
 * 
 * You can then manually create a mapping file to sync RSVP names
 * 
 * Usage:
 *   node scripts/export-rsvp-mapping.js
 */

const fs = require('fs');
const path = require('path');
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

async function exportRSVPMapping() {
  console.log('📋 Exporting RSVP and Invited Guest data for manual mapping...');
  console.log('='.repeat(60));
  console.log('');

  try {
    // Get all RSVPs
    const { data: rsvps, error: rsvpsError } = await supabase
      .from('rsvps')
      .select('id, guest_name, email, attendance, guest_count')
      .order('guest_name');

    if (rsvpsError) {
      console.error('❌ Error fetching RSVPs:', rsvpsError.message);
      return;
    }

    // Get all invited guests
    const { data: invitedGuests, error: invitedError } = await supabase
      .from('invited_guests')
      .select('id, guest_name, email, allowed_party_size, source')
      .order('guest_name');

    if (invitedError) {
      console.error('❌ Error fetching invited guests:', invitedError.message);
      return;
    }

    console.log(`✅ Found ${rsvps.length} RSVPs`);
    console.log(`✅ Found ${invitedGuests.length} invited guests`);
    console.log('');

    // Create CSV files
    const outputDir = path.join(__dirname, '..', 'tmp');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Export RSVPs
    const rsvpCsvPath = path.join(outputDir, 'rsvps-export.csv');
    let rsvpCsv = 'RSVP ID,Current Guest Name,Email,Attendance,Guest Count\n';
    rsvps.forEach(rsvp => {
      rsvpCsv += `${rsvp.id},"${rsvp.guest_name}","${rsvp.email || ''}",${rsvp.attendance},${rsvp.guest_count || 1}\n`;
    });
    fs.writeFileSync(rsvpCsvPath, rsvpCsv);
    console.log(`📄 RSVPs exported to: ${rsvpCsvPath}`);

    // Export Invited Guests
    const guestsCsvPath = path.join(outputDir, 'invited-guests-export.csv');
    let guestsCsv = 'Guest ID,Guest Name,Email,Allowed Party Size,Source\n';
    invitedGuests.forEach(guest => {
      guestsCsv += `${guest.id},"${guest.guest_name}","${guest.email || ''}",${guest.allowed_party_size},${guest.source || ''}\n`;
    });
    fs.writeFileSync(guestsCsvPath, guestsCsv);
    console.log(`📄 Invited guests exported to: ${guestsCsvPath}`);

    // Create a mapping template
    const mappingTemplatePath = path.join(outputDir, 'rsvp-name-mapping.csv');
    let mappingCsv = 'RSVP ID,RSVP Current Name,Invited Guest ID,Invited Guest Name,Match Status\n';
    rsvps.forEach(rsvp => {
      mappingCsv += `${rsvp.id},"${rsvp.guest_name}",,,\n`;
    });
    fs.writeFileSync(mappingTemplatePath, mappingCsv);
    console.log(`📄 Mapping template created at: ${mappingTemplatePath}`);
    console.log('');
    console.log('📝 Next steps:');
    console.log('   1. Open the mapping template CSV');
    console.log('   2. For each RSVP, find the matching invited guest');
    console.log('   3. Fill in the "Invited Guest ID" column with the UUID from invited-guests-export.csv');
    console.log('   4. Fill in "Match Status" with "MATCH" or "NO_MATCH"');
    console.log('   5. Save the file');
    console.log('   6. Run: node scripts/import-rsvp-mapping.js tmp/rsvp-name-mapping.csv');
    console.log('');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

exportRSVPMapping().catch(console.error);
