#!/usr/bin/env node

/**
 * Compare MASTERGUESTLIST.csv with other CSV files
 * Find names that are in MASTER but not in any other list
 */

const fs = require('fs');
const path = require('path');

// Normalize name for comparison (lowercase, trim, remove extra spaces)
function normalizeName(name) {
  if (!name) return '';
  return name.toLowerCase().trim().replace(/\s+/g, ' ');
}

// Parse CSV file
function parseCSV(filePath) {
  if (!fs.existsSync(filePath)) {
    console.warn(`⚠️  File not found: ${filePath}`);
    return [];
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

async function main() {
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
  
  console.log('🔍 Comparing MASTERGUESTLIST.csv with other lists...\n');
  
  // Parse master list
  const masterNames = parseCSV(masterFile);
  console.log(`📋 MASTERGUESTLIST.csv: ${masterNames.size} names\n`);
  
  // Parse all other lists and combine
  const allOtherNames = new Set();
  const foundInFiles = new Map(); // Track which file each name was found in
  
  for (const otherFile of otherFiles) {
    const filePath = path.join(__dirname, '..', otherFile);
    const names = parseCSV(filePath);
    
    names.forEach(name => {
      allOtherNames.add(name);
      if (!foundInFiles.has(name)) {
        foundInFiles.set(name, []);
      }
      foundInFiles.get(name).push(otherFile);
    });
    
    console.log(`📄 ${otherFile}: ${names.size} names`);
  }
  
  console.log(`\n📊 Total unique names in other lists: ${allOtherNames.size}\n`);
  
  // Find names in MASTER but not in any other list
  const onlyInMaster = [];
  const masterFileContent = fs.readFileSync(masterFile, 'utf8');
  const masterLines = masterFileContent.trim().split('\n');
  
  // Skip header
  for (let i = 1; i < masterLines.length; i++) {
    const line = masterLines[i].trim();
    if (!line) continue;
    
    // Parse CSV line
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
      const normalizedName = normalizeName(guestName);
      
      if (guestName && !allOtherNames.has(normalizedName)) {
        onlyInMaster.push({
          name: guestName,
          normalizedName,
          notes: values[2]?.replace(/^"|"$/g, '') || '',
          headcount: values[3]?.replace(/^"|"$/g, '') || '',
          isEntourage: values[5]?.replace(/^"|"$/g, '').toUpperCase() === 'ENTOURAGE'
        });
      }
    }
  }
  
  console.log('='.repeat(80));
  console.log(`\n📊 RESULTS:\n`);
  
  if (onlyInMaster.length === 0) {
    console.log('✅ All names in MASTERGUESTLIST.csv appear in at least one other list!\n');
  } else {
    console.log(`⚠️  Found ${onlyInMaster.length} name(s) in MASTER that are NOT in any other list:\n`);
    console.log('-'.repeat(80));
    
    onlyInMaster.forEach((entry, index) => {
      console.log(`\n${index + 1}. ${entry.name}`);
      if (entry.notes) console.log(`   Notes: ${entry.notes}`);
      if (entry.headcount) console.log(`   Headcount: ${entry.headcount}`);
      if (entry.isEntourage) console.log(`   🎭 ENTOURAGE`);
    });
    
    console.log('\n' + '='.repeat(80));
    console.log(`\n📋 Summary: ${onlyInMaster.length} name(s) only in MASTERGUESTLIST.csv\n`);
  }
}

main().catch(console.error);

