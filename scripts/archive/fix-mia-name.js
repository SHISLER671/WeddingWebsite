#!/usr/bin/env node

/**
 * Fix "Mia Perez & Guest" to "Mia & Guest" in FinalBride.csv and FINALlist.csv
 */

const fs = require('fs');
const path = require('path');

function fixMiaName(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const updated = content.replace(/Mia Perez & Guest/g, 'Mia & Guest');
  
  if (content !== updated) {
    fs.writeFileSync(filePath, updated, 'utf8');
    console.log(`✅ Updated ${filePath}`);
    return true;
  }
  return false;
}

const baseDir = path.join(__dirname, '..');
const files = [
  path.join(baseDir, 'FinalBride.csv'),
  path.join(baseDir, 'FINALlist.csv')
];

console.log('🔧 Fixing "Mia Perez & Guest" to "Mia & Guest"...\n');

let updated = 0;
for (const file of files) {
  if (fixMiaName(file)) {
    updated++;
  }
}

if (updated > 0) {
  console.log(`\n✅ Updated ${updated} file(s)\n`);
} else {
  console.log('ℹ️  No updates needed\n');
}
