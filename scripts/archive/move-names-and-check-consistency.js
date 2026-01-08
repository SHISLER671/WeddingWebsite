#!/usr/bin/env node

/**
 * Move names from NotOnLists.csv to other lists and check name consistency
 */

const fs = require('fs');
const path = require('path');

// Normalize name for comparison (lowercase, trim, remove extra spaces)
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

// Find name in list (case-insensitive, fuzzy matching)
function findNameInList(rows, targetName) {
  const normalizedTarget = normalizeName(targetName);
  
  // Exact match first
  let match = rows.find(r => normalizeName(r.name) === normalizedTarget);
  if (match) return match;
  
  // Try removing common suffixes
  const targetParts = normalizedTarget.split(/\s+/);
  for (const row of rows) {
    const rowParts = normalizeName(row.name).split(/\s+/);
    // Check if all target parts are in row (allowing for order differences)
    if (targetParts.every(part => rowParts.some(rp => rp.includes(part) || part.includes(rp)))) {
      return row;
    }
  }
  
  return null;
}

// Check name consistency across all lists
function checkNameConsistency() {
  console.log('\n🔍 Checking name consistency across all lists...\n');
  
  const masterFile = path.join(__dirname, '..', 'MASTERGUESTLIST.csv');
  const otherFiles = [
    'FinalBride.csv',
    'FinalGroom.csv',
    'FINALlist.csv',
    'GroomInvited.csv',
    'GroomMomInvited.csv',
    'GroomMomAdditional.csv',
    'OFFislandBside.csv',
    'OFFislandGside.csv'
  ];
  
  const masterRows = parseCSV(masterFile);
  const masterMap = new Map();
  masterRows.forEach(row => {
    const normalized = normalizeName(row.name);
    if (!masterMap.has(normalized)) {
      masterMap.set(normalized, []);
    }
    masterMap.get(normalized).push(row);
  });
  
  const inconsistencies = [];
  
  for (const otherFile of otherFiles) {
    const filePath = path.join(__dirname, '..', otherFile);
    const otherRows = parseCSV(filePath);
    
    for (const otherRow of otherRows) {
      const normalized = normalizeName(otherRow.name);
      const masterMatches = masterMap.get(normalized);
      
      if (!masterMatches || masterMatches.length === 0) {
        // Try fuzzy match
        let found = false;
        for (const [masterNorm, masterRows] of masterMap.entries()) {
          const masterParts = masterNorm.split(/\s+/);
          const otherParts = normalized.split(/\s+/);
          
          // Check if names are similar (same key parts)
          if (masterParts.length === otherParts.length && 
              masterParts.every((mp, i) => mp === otherParts[i] || mp.includes(otherParts[i]) || otherParts[i].includes(mp))) {
            found = true;
            break;
          }
        }
        
        if (!found) {
          inconsistencies.push({
            file: otherFile,
            name: otherRow.name,
            issue: 'Not found in MASTER (exact or similar match)'
          });
        }
      } else {
        // Check if spelling matches exactly
        const exactMatch = masterMatches.find(m => m.name === otherRow.name);
        if (!exactMatch) {
          inconsistencies.push({
            file: otherFile,
            name: otherRow.name,
            masterName: masterMatches[0].name,
            issue: 'Spelling difference (normalized match but different casing/spacing)'
          });
        }
      }
    }
  }
  
  if (inconsistencies.length === 0) {
    console.log('✅ No name consistency issues found!\n');
  } else {
    console.log(`⚠️  Found ${inconsistencies.length} name consistency issue(s):\n`);
    inconsistencies.forEach((inc, index) => {
      console.log(`${index + 1}. ${inc.file}: "${inc.name}"`);
      if (inc.masterName) {
        console.log(`   MASTER has: "${inc.masterName}"`);
      }
      console.log(`   Issue: ${inc.issue}\n`);
    });
  }
  
  return inconsistencies;
}

async function main() {
  const baseDir = path.join(__dirname, '..');
  
  // Read NotOnLists.csv
  const notOnLists = parseCSV(path.join(baseDir, 'NotOnLists.csv'));
  console.log(`📋 Loaded ${notOnLists.length} names from NotOnLists.csv\n`);
  
  // Define moves and corrections
  const moves = [
    { name: 'Aubree Chaco', to: 'GroomInvited.csv' },
    { name: 'Charli-Paige Arceo', to: 'OFFislandGside.csv' },
    { name: 'Isaiah Shisler', to: 'GroomInvited.csv' },
    { name: 'Jared & Rita Mendiola', to: 'OFFislandGside.csv' },
    { name: 'Justin & Justina Aguigui', to: 'OFFislandGside.csv' },
    { name: 'Kamille Green', to: 'OFFislandGside.csv' },
    { name: 'Larry & Lisa Quintanilla', to: 'GroomMomAdditional.csv' },
    { name: 'Marvin Mafnas', to: 'GroomInvited.csv' },
    { name: 'Mia Perez', to: 'GroomInvited.csv', correctTo: 'Mia & Guest' },
    { name: 'Ray Paul Jardon', to: 'OFFislandGside.csv' },
    { name: 'Ricky & Hannah Phillips', to: 'OFFislandGside.csv' },
    { name: 'Roque & Valerie Torres and Family', to: 'OFFislandGside.csv' },
    { name: 'Shane & Marie Roberto', to: 'OFFislandGside.csv' },
    { name: 'Shaniece & John Bactad', to: 'OFFislandGside.csv' },
    { name: 'Shyann Roberto', to: 'OFFislandGside.csv' },
    { name: 'Tomisha Roberto', to: 'OFFislandGside.csv' }
  ];
  
  // Names to remove (duplicates/corrections)
  const removals = [
    { name: 'Joe Mateo', reason: 'Should be Joseph Mateo (already exists)' },
    { name: 'Mike Mateo & Ashley', reason: 'Should be Michael Mateo & Ashley Bato (already exists)' }
  ];
  
  // Process moves
  const remainingInNotOnLists = [];
  const movedNames = [];
  
  for (const row of notOnLists) {
    const move = moves.find(m => normalizeName(m.name) === normalizeName(row.name));
    
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
        // Add with corrected name if needed
        const newRow = {
          ...row,
          name: move.correctTo || row.name
        };
        targetRows.push(newRow);
        writeCSV(targetFile, targetRows);
        movedNames.push({ name: row.name, to: move.to, corrected: move.correctTo });
        console.log(`✅ Moved "${row.name}" to ${move.to}${move.correctTo ? ` (corrected to "${move.correctTo}")` : ''}`);
      }
    } else {
      // Check if should be removed
      const shouldRemove = removals.find(r => normalizeName(r.name) === normalizeName(row.name));
      if (shouldRemove) {
        console.log(`🗑️  Removing "${row.name}" from NotOnLists: ${shouldRemove.reason}`);
      } else {
        remainingInNotOnLists.push(row);
      }
    }
  }
  
  // Update NotOnLists.csv
  writeCSV(path.join(baseDir, 'NotOnLists.csv'), remainingInNotOnLists);
  console.log(`\n📝 Updated NotOnLists.csv: ${remainingInNotOnLists.length} entries remaining\n`);
  
  // Check name consistency
  const inconsistencies = checkNameConsistency();
  
  console.log('\n' + '='.repeat(80));
  console.log('\n📊 SUMMARY:');
  console.log(`   Moved: ${movedNames.length} name(s)`);
  console.log(`   Removed: ${removals.length} duplicate(s)`);
  console.log(`   Remaining in NotOnLists: ${remainingInNotOnLists.length}`);
  console.log(`   Name consistency issues: ${inconsistencies.length}`);
  console.log('');
}

main().catch(console.error);
