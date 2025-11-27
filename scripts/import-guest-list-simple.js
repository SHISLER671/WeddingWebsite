#!/usr/bin/env node

/**
 * Simple Import Guest List CSV to Supabase
 * 
 * Uses direct SQL inserts to bypass RLS issues
 * 
 * Usage:
 *   node scripts/import-guest-list-simple.js [csv-file]
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

function parseCSV(csvPath) {
  const content = fs.readFileSync(csvPath, 'utf8');
  const lines = content.trim().split('\n');
  const guests = [];
  
  // Skip header
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    // Parse CSV line (handling quoted fields)
    const values = [];
    let current = '';
    let inQuotes = false;
    
    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim());
    
    // Handle two CSV formats:
    // Format 1: guest_name,email (old format)
    // Format 2: Number,Full Name,Notes,Headcount,RSVP Status (new format)
    
    let guestName = '';
    let email = null;
    let allowedPartySize = 1;
    
    if (values.length >= 5) {
      // New format: Number,Full Name,Notes,Headcount,RSVP Status
      guestName = values[1]?.replace(/^"|"$/g, '') || '';
      const notes = values[2]?.replace(/^"|"$/g, '') || '';
      const headcount = values[3]?.replace(/^"|"$/g, '') || '';
      
      // Try to extract email from Notes if present
      // Notes might contain email or other info
      if (notes && notes.includes('@')) {
        email = notes.trim();
      }
      
      // Parse headcount (should be a number)
      const headcountNum = parseInt(headcount, 10);
      if (!isNaN(headcountNum) && headcountNum > 0) {
        allowedPartySize = headcountNum;
      }
    } else if (values.length >= 2) {
      // Old format: guest_name,email
      guestName = values[0]?.replace(/^"|"$/g, '') || '';
      email = values[1]?.replace(/^"|"$/g, '') || null;
      if (email === '') email = null;
    } else if (values.length === 1) {
      // Just guest name
      guestName = values[0]?.replace(/^"|"$/g, '') || '';
    }
    
    if (guestName) {
      guests.push({
        guest_name: guestName.trim(),
        email: email || '', // Use empty string instead of null to avoid NOT NULL constraint issues
        allowed_party_size: allowedPartySize,
        source: '@MASTERGUESTLIST.csv'
      });
    }
  }
  
  return guests;
}

async function importGuests(guests) {
  console.log(`📥 Importing ${guests.length} guests to Supabase...`);
  console.log('');
  
  let successCount = 0;
  let errorCount = 0;
  let skippedCount = 0;
  
  // Import one at a time to handle conflicts properly
  for (let i = 0; i < guests.length; i++) {
    const guest = guests[i];
    
    try {
      // First, check if guest exists (by name + email combination)
      let existing = null;
      
      // Try to find by exact match: guest_name + email
      const { data: exactMatch, error: checkError1 } = await supabase
        .from('invited_guests')
        .select('id, guest_name')
        .eq('guest_name', guest.guest_name)
        .eq('email', guest.email || '')
        .maybeSingle();
      
      if (exactMatch) {
        existing = exactMatch;
      } else {
        // If no exact match, try by name only (in case email format differs)
        const { data: nameMatch, error: checkError2 } = await supabase
          .from('invited_guests')
          .select('id, guest_name')
          .eq('guest_name', guest.guest_name)
          .maybeSingle();
        
        if (nameMatch) {
          existing = nameMatch;
        }
      }
      
      if (existing) {
        // Update existing (including guest_name in case it changed)
        const updateData = {
          guest_name: guest.guest_name,
          allowed_party_size: guest.allowed_party_size,
          source: guest.source
        };
        // Include email (even if empty) to satisfy NOT NULL constraint
        if (guest.email !== undefined) {
          updateData.email = guest.email;
        }
        const { error: updateError } = await supabase
          .from('invited_guests')
          .update(updateData)
          .eq('id', existing.id);
        
        if (updateError) {
          console.error(`   ⚠️  Failed to update ${guest.guest_name}:`, updateError.message);
          errorCount++;
        } else {
          skippedCount++;
          if ((i + 1) % 50 === 0) {
            console.log(`   📊 Progress: ${i + 1}/${guests.length} processed...`);
          }
        }
      } else {
        // Insert new
        const { error: insertError } = await supabase
          .from('invited_guests')
          .insert(guest);
        
        if (insertError) {
          console.error(`   ⚠️  Failed to insert ${guest.guest_name}:`, insertError.message);
          errorCount++;
        } else {
          successCount++;
          if ((i + 1) % 50 === 0) {
            console.log(`   📊 Progress: ${i + 1}/${guests.length} processed...`);
          }
        }
      }
    } catch (error) {
      console.error(`   ❌ Error processing ${guest.guest_name}:`, error.message);
      errorCount++;
    }
  }
  
  console.log('');
  console.log('📊 Import Summary:');
  console.log(`   ✅ Successfully imported: ${successCount}`);
  console.log(`   ⏭️  Skipped/Updated: ${skippedCount}`);
  console.log(`   ❌ Errors: ${errorCount}`);
  console.log(`   📋 Total: ${guests.length}`);
  
  return { successCount, skippedCount, errorCount };
}

async function cleanupOldGuests(currentSource) {
  console.log('');
  console.log('🧹 Cleaning up old guest entries...');
  console.log('');
  
  try {
    // Delete all entries that don't have the current source
    const { data: deletedData, error: deleteError } = await supabase
      .from('invited_guests')
      .delete()
      .neq('source', currentSource)
      .select();
    
    if (deleteError) {
      console.error('❌ Error cleaning up old guests:', deleteError.message);
      return { deletedCount: 0, errorCount: 1 };
    }
    
    const deletedCount = deletedData?.length || 0;
    console.log(`   ✅ Deleted ${deletedCount} old guest entries`);
    console.log(`   📋 Only entries with source "${currentSource}" remain`);
    
    return { deletedCount, errorCount: 0 };
  } catch (error) {
    console.error('❌ Error cleaning up old guests:', error.message);
    return { deletedCount: 0, errorCount: 1 };
  }
}

async function syncRSVPNames() {
  console.log('');
  console.log('🔄 Syncing RSVP guest names from invited_guests (matching by name)...');
  console.log('');
  
  try {
    // Get all invited_guests
    const { data: invitedGuests, error: invitedError } = await supabase
      .from('invited_guests')
      .select('guest_name');
    
    if (invitedError) {
      console.error('❌ Error fetching invited_guests:', invitedError.message);
      return { syncedCount: 0, errorCount: 0 };
    }
    
    if (!invitedGuests || invitedGuests.length === 0) {
      console.log('   ℹ️  No invited guests found');
      return { syncedCount: 0, errorCount: 0 };
    }
    
    console.log(`   📋 Found ${invitedGuests.length} invited guests`);
    
    // Get all RSVPs (get all fields so we can preserve them during update)
    const { data: rsvps, error: rsvpsError } = await supabase
      .from('rsvps')
      .select('*');
    
    if (rsvpsError) {
      console.error('❌ Error fetching rsvps:', rsvpsError.message);
      return { syncedCount: 0, errorCount: 0 };
    }
    
    if (!rsvps || rsvps.length === 0) {
      console.log('   ℹ️  No RSVPs found to sync');
      return { syncedCount: 0, errorCount: 0 };
    }
    
    console.log(`   📋 Found ${rsvps.length} RSVPs to check`);
    console.log('');
    
    // Helper function to extract individual names from combined names
    function extractNames(fullName) {
      if (!fullName) return [];
      // Split by common separators: &, and, comma
      const parts = fullName
        .split(/[&,]/)
        .map(part => part.replace(/\s+and\s+/gi, ' ').trim())
        .filter(part => part.length > 0);
      return parts;
    }
    
    // Helper function to normalize a name for comparison
    function normalizeName(name) {
      return name.toLowerCase().trim().replace(/\s+/g, ' ');
    }
    
    // Helper function to extract first and last name
    function getNameParts(name) {
      const words = normalizeName(name).split(/\s+/).filter(w => w.length > 0);
      if (words.length === 0) return { first: '', last: '' };
      if (words.length === 1) return { first: words[0], last: words[0] };
      return { first: words[0], last: words[words.length - 1] };
    }
    
    // Helper function to check if RSVP name matches any part of invited guest name
    function findMatchingInvitedGuest(rsvpName, invitedGuests) {
      const normalizedRSVP = normalizeName(rsvpName);
      const rsvpParts = extractNames(rsvpName);
      const rsvpNameParts = getNameParts(rsvpName);
      
      // First try exact match (case-insensitive)
      for (const guest of invitedGuests) {
        if (normalizeName(guest.guest_name) === normalizedRSVP) {
          return guest.guest_name;
        }
      }
      
      // Then try partial match - check if RSVP name is contained in invited guest name
      for (const guest of invitedGuests) {
        const normalizedGuest = normalizeName(guest.guest_name);
        if (normalizedGuest.includes(normalizedRSVP) || normalizedRSVP.includes(normalizedGuest)) {
          return guest.guest_name;
        }
      }
      
      // Try matching by first name + last name (handles cases like "Vincent Camacho" matching "Vincent Ignacio Cruz Camacho Jr.")
      if (rsvpNameParts.first && rsvpNameParts.last) {
        for (const guest of invitedGuests) {
          const guestParts = extractNames(guest.guest_name);
          const normalizedGuest = normalizeName(guest.guest_name);
          
          for (const guestPart of guestParts) {
            const guestNameParts = getNameParts(guestPart);
            // Match if first name matches AND last name matches
            if (guestNameParts.first === rsvpNameParts.first && 
                guestNameParts.last === rsvpNameParts.last) {
              return guest.guest_name;
            }
            // Also check if RSVP name is contained in guest part (handles "Tasha" matching "Tasha Taitano")
            const normalizedGuestPart = normalizeName(guestPart);
            if (normalizedGuestPart.includes(rsvpNameParts.first) && 
                normalizedGuestPart.includes(rsvpNameParts.last)) {
              return guest.guest_name;
            }
          }
        }
      }
      
      // Try matching individual name parts (e.g., "Tasha Perez" matching "Eric & Tasha Taitano")
      // This handles cases where RSVP has individual name but guest list has combined name
      for (const rsvpPart of rsvpParts) {
        const normalizedPart = normalizeName(rsvpPart);
        const partNameParts = getNameParts(rsvpPart);
        
        for (const guest of invitedGuests) {
          const guestParts = extractNames(guest.guest_name);
          const normalizedGuest = normalizeName(guest.guest_name);
          
          // Check if any part of RSVP name matches any part of guest name
          for (const guestPart of guestParts) {
            const normalizedGuestPart = normalizeName(guestPart);
            const guestPartNameParts = getNameParts(guestPart);
            
            // Match if first name AND last name both match (strict matching)
            // This handles "Tasha Taitano" matching "Eric & Tasha Taitano" (both first and last name match)
            if (partNameParts.first && partNameParts.last && 
                guestPartNameParts.first && guestPartNameParts.last) {
              if (partNameParts.first === guestPartNameParts.first && 
                  partNameParts.last === guestPartNameParts.last) {
                return guest.guest_name;
              }
            }
            // Match if full part is contained (handles "Tasha Taitano" matching "Eric & Tasha Taitano")
            // Only if the full name part matches, not just first or last name alone
            if (normalizedGuestPart.includes(normalizedPart) || 
                normalizedPart.includes(normalizedGuestPart)) {
              return guest.guest_name;
            }
          }
        }
      }
      
      return null;
    }
    
    let syncedCount = 0;
    let errorCount = 0;
    let unchangedCount = 0;
    let notFoundCount = 0;
    
    // Update RSVPs where name matches (exact or partial) and differs
    for (const rsvp of rsvps) {
      if (!rsvp.guest_name) {
        unchangedCount++;
        continue;
      }
      
      const invitedName = findMatchingInvitedGuest(rsvp.guest_name, invitedGuests);
      
      if (invitedName) {
        // Found a match - update if names differ
        if (invitedName !== rsvp.guest_name) {
          // Update RSVP name to match invited_guests (keep all other fields unchanged)
          // Use direct UPDATE by id (not upsert) to properly trigger the BEFORE UPDATE trigger
          const { error: updateError } = await supabase
            .from('rsvps')
            .update({ guest_name: invitedName })
            .eq('id', rsvp.id);
          
          if (updateError) {
            // If update fails, try by email as fallback
            const { error: emailUpdateError } = await supabase
              .from('rsvps')
              .update({ guest_name: invitedName })
              .eq('email', rsvp.email);
            
            if (emailUpdateError) {
              console.error(`   ⚠️  Failed to sync RSVP for ${rsvp.guest_name}:`, emailUpdateError.message);
              errorCount++;
            } else {
              syncedCount++;
              console.log(`   ✅ Synced: "${rsvp.guest_name}" → "${invitedName}"`);
            }
          } else {
            syncedCount++;
            console.log(`   ✅ Synced: "${rsvp.guest_name}" → "${invitedName}"`);
          }
          
          if (syncedCount % 10 === 0 && syncedCount > 0) {
            console.log(`   📊 Progress: ${syncedCount} RSVPs synced...`);
          }
        } else {
          unchangedCount++;
        }
      } else {
        // No match found in invited_guests
        notFoundCount++;
        console.log(`   ⚠️  No match found for RSVP: "${rsvp.guest_name}"`);
      }
    }
    
    console.log('');
    console.log('📊 RSVP Sync Summary:');
    console.log(`   ✅ Synced: ${syncedCount}`);
    console.log(`   ⏭️  Unchanged: ${unchangedCount}`);
    console.log(`   ⚠️  Not found in guest list: ${notFoundCount}`);
    console.log(`   ❌ Errors: ${errorCount}`);
    
    return { syncedCount, errorCount };
  } catch (error) {
    console.error('❌ Error syncing RSVP names:', error.message);
    return { syncedCount: 0, errorCount: 1 };
  }
}

async function syncSeatingAssignments() {
  console.log('');
  console.log('🔄 Syncing seating_assignments with invited_guests...');
  console.log('');
  
  try {
    // Get all invited guests
    const { data: invitedGuests, error: invitedError } = await supabase
      .from('invited_guests')
      .select('guest_name, email')
      .order('guest_name');
    
    if (invitedError) {
      console.error('❌ Error fetching invited_guests:', invitedError.message);
      return { created: 0, updated: 0, errorCount: 0 };
    }
    
    if (!invitedGuests || invitedGuests.length === 0) {
      console.log('   ℹ️  No invited guests found');
      return { created: 0, updated: 0, errorCount: 0 };
    }
    
    console.log(`   📋 Found ${invitedGuests.length} invited guests`);
    
    // Get all seating assignments
    const { data: seatingAssignments, error: seatingError } = await supabase
      .from('seating_assignments')
      .select('id, guest_name, email, table_number');
    
    if (seatingError) {
      console.error('❌ Error fetching seating_assignments:', seatingError.message);
      return { created: 0, updated: 0, errorCount: 0 };
    }
    
    // Create a map of existing seating assignments by guest_name (normalized)
    const seatingMap = new Map();
    (seatingAssignments || []).forEach(sa => {
      const key = sa.guest_name?.trim().toLowerCase() || '';
      seatingMap.set(key, sa);
    });
    
    let created = 0;
    let updated = 0;
    let errorCount = 0;
    
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
          console.error(`   ⚠️  Failed to create entry for ${guest.guest_name}:`, insertError.message);
          errorCount++;
        } else {
          created++;
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
            console.error(`   ⚠️  Failed to update ${guest.guest_name}:`, updateError.message);
            errorCount++;
          } else {
            updated++;
          }
        }
      }
    }
    
    console.log('');
    console.log('📊 Seating Sync Summary:');
    console.log(`   ✅ Created: ${created}`);
    console.log(`   🔄 Updated: ${updated}`);
    if (errorCount > 0) {
      console.log(`   ❌ Errors: ${errorCount}`);
    }
    
    return { created, updated, errorCount };
  } catch (error) {
    console.error('❌ Error syncing seating assignments:', error.message);
    return { created: 0, updated: 0, errorCount: 1 };
  }
}

async function main() {
  console.log('📋 Import Guest List to Supabase (Simple Method)');
  console.log('='.repeat(60));
  console.log('');
  
  // Determine CSV file to import
  const csvFile = process.argv[2] || path.join(__dirname, '..', 'MASTERGUESTLIST.csv');
  
  if (!fs.existsSync(csvFile)) {
    console.error(`❌ Error: CSV file not found: ${csvFile}`);
    process.exit(1);
  }
  
  console.log(`📁 CSV file: ${csvFile}`);
  
  // Parse CSV
  const guests = parseCSV(csvFile);
  console.log(`📋 Found ${guests.length} guests in CSV`);
  console.log('');
  
  // Get the source from the first guest (all should have the same source)
  const currentSource = guests.length > 0 ? guests[0].source : '@MASTERGUESTLIST.csv';
  
  // Confirm import
  console.log('⚠️  This will:');
  console.log('   1. Import/update guests in the invited_guests table');
  console.log('   2. Delete all guests NOT in this CSV (cleanup old entries)');
  console.log('   3. Sync RSVP guest names to match invited_guests (by name)');
  console.log('   4. Sync seating_assignments with invited_guests');
  console.log('   Press Ctrl+C to cancel, or wait 3 seconds to continue...');
  console.log('');
  
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  // Import to Supabase
  const importResult = await importGuests(guests);
  
  // Clean up old entries (delete everything not from current CSV)
  const cleanupResult = await cleanupOldGuests(currentSource);
  
  // Sync RSVP names
  const syncResult = await syncRSVPNames();
  
  // Sync seating assignments
  const seatingSyncResult = await syncSeatingAssignments();
  
  console.log('');
  console.log('✅ Import, cleanup, and sync complete!');
  console.log('');
  console.log('📊 Final Summary:');
  console.log(`   📥 Guests imported: ${importResult.successCount}`);
  console.log(`   🔄 Guests updated: ${importResult.skippedCount}`);
  console.log(`   🗑️  Old entries deleted: ${cleanupResult.deletedCount}`);
  console.log(`   🔗 RSVPs synced: ${syncResult.syncedCount}`);
  console.log(`   🪑 Seating entries created: ${seatingSyncResult.created}`);
  console.log(`   🔄 Seating entries updated: ${seatingSyncResult.updated}`);
  console.log('');
  console.log('🧪 Test the autocomplete:');
  console.log('   1. Go to your RSVP page');
  console.log('   2. Type a guest name');
  console.log('   3. Verify dropdown appears with matches');
}

main().catch(console.error);
