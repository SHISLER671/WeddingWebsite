#!/usr/bin/env node

/**
 * Cleanup duplicate RSVPs
 * 
 * This script identifies duplicate RSVPs (same guest name) and helps you
 * decide which ones to keep. It prefers:
 * 1. RSVPs with real emails (not placeholder "no-email+...")
 * 2. More recent RSVPs
 * 3. RSVPs with more complete data
 * 
 * Usage:
 *   node scripts/cleanup-duplicate-rsvps.js [--dry-run] [--auto-delete]
 * 
 * Options:
 *   --dry-run: Only show duplicates, don't delete (default)
 *   --auto-delete: Automatically delete duplicates (keeps the best one)
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

// Normalize name for comparison (lowercase, trim, remove extra spaces)
function normalizeName(name) {
  if (!name) return '';
  return name.toLowerCase().trim().replace(/\s+/g, ' ');
}

// Check if email is a placeholder
function isPlaceholderEmail(email) {
  if (!email) return true;
  return email.toLowerCase().startsWith('no-email+') || 
         email.toLowerCase() === 'n/a' ||
         email.toLowerCase().trim() === '';
}

// Score an RSVP to determine which one to keep (higher is better)
function scoreRsvp(rsvp) {
  let score = 0;
  
  // Prefer real emails over placeholders
  if (!isPlaceholderEmail(rsvp.email)) {
    score += 100;
  }
  
  // Prefer more recent RSVPs
  if (rsvp.updated_at) {
    const daysSinceUpdate = (Date.now() - new Date(rsvp.updated_at).getTime()) / (1000 * 60 * 60 * 24);
    score += Math.max(0, 30 - daysSinceUpdate); // More recent = higher score
  }
  
  // Prefer RSVPs with more complete data
  if (rsvp.dietary_restrictions) score += 5;
  if (rsvp.special_message) score += 5;
  if (rsvp.wallet_address) score += 5;
  if (rsvp.invited_guest_id) score += 10;
  
  // Prefer RSVPs with attendance = "yes" (more likely to be the real one)
  if (rsvp.attendance === 'yes') score += 10;
  
  return score;
}

async function findDuplicates() {
  console.log('🔍 Finding duplicate RSVPs...\n');
  
  // Fetch all RSVPs
  const { data: rsvps, error } = await supabase
    .from('rsvps')
    .select('*')
    .order('guest_name');
  
  if (error) {
    console.error('❌ Error fetching RSVPs:', error.message);
    process.exit(1);
  }
  
  if (!rsvps || rsvps.length === 0) {
    console.log('   ℹ️  No RSVPs found in database\n');
    return [];
  }
  
  // Group by normalized name
  const nameGroups = new Map();
  rsvps.forEach(rsvp => {
    const normalizedName = normalizeName(rsvp.guest_name);
    if (!nameGroups.has(normalizedName)) {
      nameGroups.set(normalizedName, []);
    }
    nameGroups.get(normalizedName).push(rsvp);
  });
  
  // Find groups with duplicates (more than 1 RSVP)
  const duplicates = [];
  nameGroups.forEach((group, normalizedName) => {
    if (group.length > 1) {
      // Sort by score (best first)
      group.sort((a, b) => scoreRsvp(b) - scoreRsvp(a));
      duplicates.push({
        name: group[0].guest_name, // Use first name as display name
        normalizedName,
        rsvps: group,
        keep: group[0], // Best one to keep
        delete: group.slice(1) // Ones to delete
      });
    }
  });
  
  return duplicates;
}

function displayDuplicates(duplicates, dryRun = true) {
  if (duplicates.length === 0) {
    console.log('✅ No duplicates found! All RSVPs are unique.\n');
    return;
  }
  
  console.log(`\n⚠️  Found ${duplicates.length} duplicate group(s):\n`);
  console.log('='.repeat(80));
  
  duplicates.forEach((dup, index) => {
    console.log(`\n${index + 1}. ${dup.name}`);
    console.log('-'.repeat(80));
    
    // Show the one to KEEP
    const keep = dup.keep;
    console.log(`   ✅ KEEP (ID: ${keep.id}, Score: ${scoreRsvp(keep).toFixed(1)})`);
    console.log(`      📧 Email: ${keep.email || '(none)'}`);
    console.log(`      ✅ Attendance: ${keep.attendance}`);
    console.log(`      👥 Guest Count: ${keep.guest_count || 1}`);
    console.log(`      📅 Updated: ${keep.updated_at ? new Date(keep.updated_at).toLocaleString() : 'N/A'}`);
    if (keep.dietary_restrictions) console.log(`      🍽️  Dietary: ${keep.dietary_restrictions}`);
    if (keep.special_message) console.log(`      💬 Message: ${keep.special_message.substring(0, 50)}...`);
    
    // Show ones to DELETE
    dup.delete.forEach((rsvp, delIndex) => {
      console.log(`\n   ❌ DELETE (ID: ${rsvp.id}, Score: ${scoreRsvp(rsvp).toFixed(1)})`);
      console.log(`      📧 Email: ${rsvp.email || '(none)'}`);
      console.log(`      ✅ Attendance: ${rsvp.attendance}`);
      console.log(`      👥 Guest Count: ${rsvp.guest_count || 1}`);
      console.log(`      📅 Updated: ${rsvp.updated_at ? new Date(rsvp.updated_at).toLocaleString() : 'N/A'}`);
      if (rsvp.dietary_restrictions) console.log(`      🍽️  Dietary: ${rsvp.dietary_restrictions}`);
      if (rsvp.special_message) console.log(`      💬 Message: ${rsvp.special_message.substring(0, 50)}...`);
    });
  });
  
  const totalToDelete = duplicates.reduce((sum, dup) => sum + dup.delete.length, 0);
  console.log('\n' + '='.repeat(80));
  console.log(`\n📊 SUMMARY:`);
  console.log(`   Duplicate groups: ${duplicates.length}`);
  console.log(`   RSVPs to keep: ${duplicates.length}`);
  console.log(`   RSVPs to delete: ${totalToDelete}`);
  console.log(`   Mode: ${dryRun ? 'DRY RUN (no changes will be made)' : 'LIVE (will delete duplicates)'}`);
  console.log('');
  
  return totalToDelete;
}

async function deleteDuplicates(duplicates) {
  const idsToDelete = [];
  duplicates.forEach(dup => {
    dup.delete.forEach(rsvp => {
      idsToDelete.push(rsvp.id);
    });
  });
  
  if (idsToDelete.length === 0) {
    console.log('✅ No duplicates to delete.\n');
    return { deleted: 0, errors: 0 };
  }
  
  console.log(`\n🗑️  Deleting ${idsToDelete.length} duplicate RSVP(s)...\n`);
  
  let deleted = 0;
  let errors = 0;
  
  // Delete in batches to avoid overwhelming the database
  const batchSize = 50;
  for (let i = 0; i < idsToDelete.length; i += batchSize) {
    const batch = idsToDelete.slice(i, i + batchSize);
    
    const { error } = await supabase
      .from('rsvps')
      .delete()
      .in('id', batch);
    
    if (error) {
      console.error(`   ❌ Error deleting batch ${Math.floor(i / batchSize) + 1}:`, error.message);
      errors += batch.length;
    } else {
      deleted += batch.length;
      console.log(`   ✅ Deleted batch ${Math.floor(i / batchSize) + 1}: ${batch.length} RSVP(s)`);
    }
  }
  
  console.log('\n' + '='.repeat(80));
  console.log(`\n📊 DELETION SUMMARY:`);
  console.log(`   ✅ Successfully deleted: ${deleted}`);
  if (errors > 0) {
    console.log(`   ❌ Errors: ${errors}`);
  }
  console.log('');
  
  return { deleted, errors };
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = !args.includes('--auto-delete');
  const autoDelete = args.includes('--auto-delete');
  
  console.log('🧹 RSVP Duplicate Cleanup Tool');
  console.log('='.repeat(80));
  console.log('');
  
  if (dryRun) {
    console.log('ℹ️  Running in DRY RUN mode (no changes will be made)');
    console.log('   Use --auto-delete to actually delete duplicates\n');
  } else {
    console.log('⚠️  Running in AUTO-DELETE mode (duplicates will be deleted)');
    console.log('   Press Ctrl+C within 5 seconds to cancel...\n');
    await new Promise(resolve => setTimeout(resolve, 5000));
  }
  
  // Find duplicates
  const duplicates = await findDuplicates();
  
  // Display duplicates
  const totalToDelete = displayDuplicates(duplicates, dryRun);
  
  if (totalToDelete === 0) {
    console.log('✅ No action needed.\n');
    process.exit(0);
  }
  
  // Delete if auto-delete is enabled
  if (autoDelete) {
    const result = await deleteDuplicates(duplicates);
    if (result.errors === 0) {
      console.log('✅ Cleanup complete!\n');
      process.exit(0);
    } else {
      console.log(`⚠️  Cleanup complete with ${result.errors} error(s).\n`);
      process.exit(1);
    }
  } else {
    console.log('💡 To delete these duplicates, run: node scripts/cleanup-duplicate-rsvps.js --auto-delete\n');
    process.exit(0);
  }
}

main().catch((error) => {
  console.error('\n❌ Fatal error:', error);
  process.exit(1);
});
