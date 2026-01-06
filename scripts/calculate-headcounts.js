#!/usr/bin/env node

/**
 * Calculate headcounts for specific CSV files
 */

const fs = require('fs');
const path = require('path');

// Parse CSV file and calculate headcount
function calculateHeadcount(csvPath) {
  if (!fs.existsSync(csvPath)) {
    return { count: 0, entries: 0, error: `File not found: ${csvPath}` };
  }
  
  const content = fs.readFileSync(csvPath, 'utf8');
  const lines = content.trim().split('\n');
  
  if (lines.length < 2) {
    return { count: 0, entries: 0 };
  }
  
  let totalHeadcount = 0;
  let entryCount = 0;
  
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
        entryCount++;
        
        // Get headcount (column 4, index 3)
        const headcountStr = values[3]?.replace(/^"|"$/g, '') || '';
        const headcount = parseInt(headcountStr, 10);
        
        if (!isNaN(headcount) && headcount > 0) {
          totalHeadcount += headcount;
        } else {
          // Default to 1 if no headcount specified
          totalHeadcount += 1;
        }
      }
    }
  }
  
  return { count: totalHeadcount, entries: entryCount };
}

async function main() {
  const baseDir = path.join(__dirname, '..');
  
  const files = [
    { name: 'NotOnLists.csv', path: path.join(baseDir, 'NotOnLists.csv') },
    { name: 'FinalBride.csv', path: path.join(baseDir, 'FinalBride.csv') },
    { name: 'OFFislandBside.csv', path: path.join(baseDir, 'OFFislandBside.csv') }
  ];
  
  console.log('📊 Headcount Calculation');
  console.log('='.repeat(80));
  console.log('');
  
  let grandTotal = 0;
  const results = [];
  
  for (const file of files) {
    const result = calculateHeadcount(file.path);
    
    if (result.error) {
      console.log(`❌ ${file.name}: ${result.error}`);
    } else {
      console.log(`📋 ${file.name}:`);
      console.log(`   Entries: ${result.entries}`);
      console.log(`   Headcount: ${result.count}`);
      console.log('');
      
      grandTotal += result.count;
      results.push({ name: file.name, entries: result.entries, headcount: result.count });
    }
  }
  
  console.log('='.repeat(80));
  console.log(`\n📊 TOTAL SUM:`);
  console.log(`   Total Headcount: ${grandTotal} people`);
  console.log(`   Total Entries: ${results.reduce((sum, r) => sum + r.entries, 0)} entries`);
  console.log('');
  
  // Breakdown
  console.log('📋 Breakdown:');
  results.forEach(r => {
    console.log(`   ${r.name}: ${r.headcount} people (${r.entries} entries)`);
  });
  console.log(`   ────────────────────────────────────────────────`);
  console.log(`   TOTAL: ${grandTotal} people`);
  console.log('');
}

main().catch(console.error);

