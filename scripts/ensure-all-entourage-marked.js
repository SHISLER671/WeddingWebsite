#!/usr/bin/env node

/**
 * Ensure All Entourage Members Are Marked
 * 
 * This script ensures all 26 CSV entourage entries have ENTOURAGE in special_notes
 */

const { createClient } = require('@supabase/supabase-js');

require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// All 26 entourage entries from CSV (lines 159-184)
const ALL_ENTOURAGE = [
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
  'Amos & Erica Taijeron',
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
  return (name || '').trim().toLowerCase().replace(/&/g, 'and').replace(/\s+/g, ' ');
}

async function ensureAllEntourageMarked() {
  try {
    console.log('🔍 Checking all 26 entourage members...\n');
    console.log('='.repeat(80));
    
    // Get all seating assignments
    const { data: allAssignments, error: fetchError } = await supabase
      .from('seating_assignments')
      .select('id, guest_name, special_notes');
    
    if (fetchError) {
      console.error('❌ Error:', fetchError.message);
      process.exit(1);
    }
    
    console.log(`📋 Found ${allAssignments.length} total seating assignments\n`);
    
    // Check each entourage member
    const needsUpdate = [];
    const alreadyMarked = [];
    const notFound = [];
    
    for (const entourageName of ALL_ENTOURAGE) {
      const normalizedEntourage = normalizeName(entourageName);
      
      // Find matching entry
      const match = allAssignments.find(assignment => {
        const normalizedAssignment = normalizeName(assignment.guest_name);
        return normalizedAssignment === normalizedEntourage ||
               normalizedAssignment.includes(normalizedEntourage) ||
               normalizedEntourage.includes(normalizedAssignment);
      });
      
      if (!match) {
        notFound.push(entourageName);
        console.log(`❌ NOT FOUND: ${entourageName}`);
      } else {
        const hasEntourage = match.special_notes && 
                            match.special_notes.toLowerCase().includes('entourage');
        
        if (hasEntourage) {
          alreadyMarked.push(entourageName);
          console.log(`✅ Already marked: ${entourageName}`);
        } else {
          needsUpdate.push({ name: entourageName, id: match.id, currentNotes: match.special_notes });
          console.log(`⚠️  Needs update: ${entourageName} (current: "${match.special_notes || '(empty)'}")`);
        }
      }
    }
    
    console.log('\n' + '='.repeat(80));
    console.log('📊 SUMMARY:');
    console.log('='.repeat(80));
    console.log(`   ✅ Already marked: ${alreadyMarked.length}`);
    console.log(`   ⚠️  Need update: ${needsUpdate.length}`);
    console.log(`   ❌ Not found: ${notFound.length}`);
    console.log('');
    
    if (needsUpdate.length === 0 && notFound.length === 0) {
      console.log('✅ All entourage members are properly marked!');
      return;
    }
    
    // Update entries that need it
    if (needsUpdate.length > 0) {
      console.log(`🔄 Updating ${needsUpdate.length} entries...\n`);
      
      let updated = 0;
      let errors = 0;
      
      for (const entry of needsUpdate) {
        // Set special_notes to ENTOURAGE (preserve existing notes if any)
        let newNotes = 'ENTOURAGE';
        if (entry.currentNotes && entry.currentNotes.trim()) {
          // If there are existing notes, append ENTOURAGE
          const existing = entry.currentNotes.trim();
          if (!existing.toLowerCase().includes('entourage')) {
            newNotes = `${existing}, ENTOURAGE`;
          } else {
            newNotes = existing.replace(/weddingparty/gi, 'ENTOURAGE');
          }
        }
        
        const { error: updateError } = await supabase
          .from('seating_assignments')
          .update({ special_notes: newNotes })
          .eq('id', entry.id);
        
        if (updateError) {
          console.error(`   ❌ Failed to update ${entry.name}:`, updateError.message);
          errors++;
        } else {
          updated++;
          console.log(`   ✅ Updated: ${entry.name}`);
        }
      }
      
      console.log('\n' + '='.repeat(80));
      console.log('✅ UPDATE COMPLETE:');
      console.log('='.repeat(80));
      console.log(`   ✅ Updated: ${updated}`);
      if (errors > 0) {
        console.log(`   ❌ Errors: ${errors}`);
      }
    }
    
    if (notFound.length > 0) {
      console.log('\n⚠️  WARNING: Some entourage members not found in seating_assignments:');
      notFound.forEach(name => console.log(`   - ${name}`));
      console.log('\n💡 These may need to be added via sync script.');
    }
    
    console.log('='.repeat(80));
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

ensureAllEntourageMarked();

