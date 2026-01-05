#!/usr/bin/env node

/**
 * Create NotOnLists.csv with names from MASTER that aren't in other lists
 */

const fs = require('fs');
const path = require('path');

// Normalize name for comparison (lowercase, trim, remove extra spaces)
function normalizeName(name) {
  if (!name) return '';
  return name.toLowerCase().trim().replace(/\s+/g, ' ');
}

// Parse CSV file and return Set of normalized names
function parseCSVNames(filePath) {
  if (!fs.existsSync(filePath)) {
    return new Set();
  }
  
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.trim().split('\n');
  const names = new Set();
  
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
    
    // Format: Number,Full Name,Notes,Headcount,RSVP Status,KIDENTOURAGE
    if (values.length >= 2) {
      const guestName = values[1]?.replace(/^"|"$/g, '') || '';
      if (guestName) {
        names.add(normalizeName(guestName));
      }
    }
  }
  
  return names;
}

// Parse CSV file and return array of full rows
function parseCSVRows(filePath) {
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

function escapeCSV(value) {
  if (!value) return '';
  // If value contains comma, quote, or newline, wrap in quotes and escape quotes
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

async function main() {
  const masterFile = path.join(__dirname, '..', 'MASTERGUESTLIST.csv');
  const outputFile = path.join(__dirname, '..', 'NotOnLists.csv');
  
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
  
  console.log('🔍 Finding names in MASTER not in other lists...\n');
  
  // Parse master list
  const masterRows = parseCSVRows(masterFile);
  console.log(`📋 MASTERGUESTLIST.csv: ${masterRows.length} names`);
  
  // Parse all other lists and combine
  const allOtherNames = new Set();
  
  for (const otherFile of otherFiles) {
    const filePath = path.join(__dirname, '..', otherFile);
    const names = parseCSVNames(filePath);
    names.forEach(name => allOtherNames.add(name));
  }
  
  console.log(`📊 Total unique names in other lists: ${allOtherNames.size}\n`);
  
  // Find rows in MASTER but not in any other list
  const notOnLists = masterRows.filter(row => {
    const normalizedName = normalizeName(row.name);
    return !allOtherNames.has(normalizedName);
  });
  
  console.log(`✅ Found ${notOnLists.length} names not in other lists\n`);
  
  // Create CSV content
  const csvLines = ['Number,Full Name,Notes,Headcount,RSVP Status,KIDENTOURAGE'];
  
  notOnLists.forEach((row, index) => {
    const line = [
      index + 1, // New sequential number
      escapeCSV(row.name),
      escapeCSV(row.notes),
      escapeCSV(row.headcount),
      escapeCSV(row.rsvpStatus),
      escapeCSV(row.kidEntourage)
    ].join(',');
    csvLines.push(line);
  });
  
  // Write to file
  fs.writeFileSync(outputFile, csvLines.join('\n') + '\n', 'utf8');
  
  console.log(`✅ Created: ${outputFile}`);
  console.log(`   Contains ${notOnLists.length} entries\n`);
  
  // Show summary
  const entourageCount = notOnLists.filter(r => r.notes.toUpperCase().includes('ENTOURAGE') || r.kidEntourage.toUpperCase() === 'ENTOURAGE').length;
  const totalHeadcount = notOnLists.reduce((sum, r) => {
    const count = parseInt(r.headcount) || 1;
    return sum + count;
  }, 0);
  
  console.log('📊 Summary:');
  console.log(`   Total entries: ${notOnLists.length}`);
  console.log(`   Entourage: ${entourageCount}`);
  console.log(`   Estimated headcount: ${totalHeadcount}`);
  console.log('');
}

main().catch(console.error);

