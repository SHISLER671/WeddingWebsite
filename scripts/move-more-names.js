#!/usr/bin/env node

/**
 * Move more names from NotOnLists.csv to other lists and delete duplicates
 */

const fs = require('fs');
const path = require('path');

// Normalize name for comparison
function normalizeName(name) {
  if (!name) return '';
  return name.toLowerCase().trim().replace(/\s+/g, ' ');
}

// Parse CSV file and return array of rows
function parseCSV(filePath) {
  if (!fs.existsSync(filePath)) {
    return [];
  }
  
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.trim().split('\n');
  const rows = [];
  
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
    
    if (values.length >= 2) {
      const guestName = values[1]?.replace(/^"|"$/g, '') || '';
      if (guestName) {
        rows.push({
          number: values[0]?.replace(/^"|"$/g, '') || '',
          name: guestName,
          notes: values[2]?.replace(/^"|"$/g, '') || '',
          headcount: values[3]?.replace(/^"|"$/g, '') || '',
          rsvpStatus: values[4]?.replace(/^"|"$/g, '') || '',
          kidEntourage: values[5]?.replace(/^"|"$/g, '') || ''
        });
      }
    }
  }
  
  return rows;
}

// Write CSV file
function writeCSV(filePath, rows, header = 'Number,Full Name,Notes,Headcount,RSVP Status,KIDENTOURAGE') {
  const escapeCSV = (value) => {
    if (!value) return '';
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  };
  
  const lines = [header];
  rows.forEach((row, index) => {
    const line = [
      index + 1, // Sequential number
      escapeCSV(row.name),
      escapeCSV(row.notes),
      escapeCSV(row.headcount),
      escapeCSV(row.rsvpStatus),
      escapeCSV(row.kidEntourage)
    ].join(',');
    lines.push(line);
  });
  
  fs.writeFileSync(filePath, lines.join('\n') + '\n', 'utf8');
}

// Find name in list (case-insensitive)
function findNameInList(rows, targetName) {
  const normalizedTarget = normalizeName(targetName);
  return rows.find(r => normalizeName(r.name) === normalizedTarget);
}

async function main() {
  const baseDir = path.join(__dirname, '..');
  
  // Read NotOnLists.csv
  const notOnLists = parseCSV(path.join(baseDir, 'NotOnLists.csv'));
  console.log(`📋 Loaded ${notOnLists.length} names from NotOnLists.csv\n`);
  
  // Define moves
  const moves = [
    { name: 'Keith Surber', to: 'OFFislandGside.csv' },
    { name: 'Tatum Taitague', to: 'GroomInvited.csv' },
    { name: 'Uncle Antonio Roberto', to: 'OFFislandGside.csv' },
    { name: 'Uncle Manuel Roberto', to: 'OFFislandGside.csv' },
    { name: 'Uncle Rudy & Auntie Priscilla Mendiola', to: 'OFFislandGside.csv' }
  ];
  
  // Names to delete (already exist elsewhere)
  const deletions = [
    { name: 'Larry & Lisa Quintanilla', reason: 'Already in GroomMomAdditional.csv' },
    { name: 'Uncle Joseph & Auntie Annette Roberto', reason: 'Already exists as "Uncle Joseph & Auntie Annette Roberto and Lacen" in GroomInvited.csv' }
  ];
  
  const remainingInNotOnLists = [];
  const movedNames = [];
  const deletedNames = [];
  
  for (const row of notOnLists) {
    const move = moves.find(m => normalizeName(m.name) === normalizeName(row.name));
    const shouldDelete = deletions.find(d => normalizeName(d.name) === normalizeName(row.name));
    
    if (move) {
      // Move to target file
      const targetFile = path.join(baseDir, move.to);
      const targetRows = parseCSV(targetFile);
      
      // Check if already exists
      const exists = findNameInList(targetRows, row.name);
      if (exists) {
        console.log(`⚠️  "${row.name}" already exists in ${move.to}, skipping move`);
        remainingInNotOnLists.push(row);
      } else {
        targetRows.push(row);
        writeCSV(targetFile, targetRows);
        movedNames.push({ name: row.name, to: move.to });
        console.log(`✅ Moved "${row.name}" to ${move.to}`);
      }
    } else if (shouldDelete) {
      deletedNames.push({ name: row.name, reason: shouldDelete.reason });
      console.log(`🗑️  Removing "${row.name}" from NotOnLists: ${shouldDelete.reason}`);
    } else {
      remainingInNotOnLists.push(row);
    }
  }
  
  // Update NotOnLists.csv
  writeCSV(path.join(baseDir, 'NotOnLists.csv'), remainingInNotOnLists);
  
  console.log(`\n📝 Updated NotOnLists.csv: ${remainingInNotOnLists.length} entries remaining`);
  console.log('\n' + '='.repeat(80));
  console.log('\n📊 SUMMARY:');
  console.log(`   Moved: ${movedNames.length} name(s)`);
  console.log(`   Deleted: ${deletedNames.length} duplicate(s)`);
  console.log(`   Remaining in NotOnLists: ${remainingInNotOnLists.length}`);
  console.log('');
}

main().catch(console.error);
