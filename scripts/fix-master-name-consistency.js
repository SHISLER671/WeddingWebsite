#!/usr/bin/env node

/**
 * Fix name consistency in MASTERGUESTLIST.csv to match other lists
 */

const fs = require('fs');
const path = require('path');

// Parse CSV file and return array of rows
function parseCSV(filePath) {
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

function normalizeName(name) {
  if (!name) return '';
  return name.toLowerCase().trim().replace(/\s+/g, ' ');
}

async function main() {
  const baseDir = path.join(__dirname, '..');
  const masterFile = path.join(baseDir, 'MASTERGUESTLIST.csv');
  
  console.log('🔧 Fixing name consistency in MASTERGUESTLIST.csv...\n');
  
  const masterRows = parseCSV(masterFile);
  let updated = 0;
  
  // Fixes to apply
  const fixes = [
    {
      find: (row) => normalizeName(row.name) === normalizeName('Joseph Crisostomo'),
      update: { name: 'Joseph Crisostomo & Guest', headcount: '2' }
    },
    {
      find: (row) => normalizeName(row.name) === normalizeName('Mia Perez'),
      update: { name: 'Mia & Guest', headcount: '2' }
    },
    {
      find: (row) => normalizeName(row.name) === normalizeName('Uncle Joseph & Auntie Annette Roberto'),
      update: { name: 'Uncle Joseph & Auntie Annette Roberto and Lacen', headcount: '3' }
    }
  ];
  
  for (const fix of fixes) {
    const index = masterRows.findIndex(fix.find);
    if (index !== -1) {
      const oldName = masterRows[index].name;
      masterRows[index] = {
        ...masterRows[index],
        ...fix.update
      };
      console.log(`✅ Updated: "${oldName}" → "${masterRows[index].name}"`);
      updated++;
    }
  }
  
  if (updated > 0) {
    writeCSV(masterFile, masterRows);
    console.log(`\n✅ Updated MASTERGUESTLIST.csv with ${updated} fix(es)\n`);
  } else {
    console.log('ℹ️  No updates needed\n');
  }
}

main().catch(console.error);

