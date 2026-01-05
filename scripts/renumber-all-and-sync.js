#!/usr/bin/env node

/**
 * Renumber and alphabetize all CSV files, then sync to Supabase
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const baseDir = path.join(__dirname, '..');

// All CSV files that should be renumbered
const csvFiles = [
  'MASTERGUESTLIST.csv',
  'FINALlist.csv',
  'FinalBride.csv',
  'FinalGroom.csv',
  'GroomInvited.csv',
  'GroomMomInvited.csv',
  'GroomMomAdditional.csv',
  'OFFislandBside.csv',
  'OFFislandGside.csv',
  'NotOnLists.csv'
];

console.log('🔄 Renumber and Alphabetize All CSV Files');
console.log('='.repeat(80));
console.log('');

let successCount = 0;
let failCount = 0;

for (const csvFile of csvFiles) {
  const filePath = path.join(baseDir, csvFile);
  
  if (!fs.existsSync(filePath)) {
    console.log(`⏭️  Skipping ${csvFile} (file not found)`);
    continue;
  }
  
  try {
    console.log(`📄 Processing: ${csvFile}`);
    execSync(`node scripts/renumber-csv.js "${filePath}"`, { 
      stdio: 'inherit',
      cwd: baseDir 
    });
    successCount++;
  } catch (error) {
    console.error(`❌ Error processing ${csvFile}:`, error.message);
    failCount++;
  }
}

console.log('\n' + '='.repeat(80));
console.log(`✅ Successfully processed ${successCount} file(s)`);
if (failCount > 0) {
  console.log(`❌ Failed to process ${failCount} file(s)`);
}
console.log('');

// Now sync to Supabase
console.log('🔄 Syncing MASTERGUESTLIST.csv to Supabase...');
console.log('='.repeat(80));
console.log('');

try {
  execSync('node scripts/sync-invited-guests-with-csv.js MASTERGUESTLIST.csv', {
    stdio: 'inherit',
    cwd: baseDir
  });
  console.log('\n✅ Sync complete!');
} catch (error) {
  console.error('\n❌ Sync failed:', error.message);
  process.exit(1);
}

console.log('');

