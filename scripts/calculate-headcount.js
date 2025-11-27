#!/usr/bin/env node

/**
 * Calculate total headcount from CSV including entourage and plus-ones
 */

const fs = require('fs');
const path = require('path');

function parseCSV(csvPath) {
  const content = fs.readFileSync(csvPath, 'utf8');
  const lines = content.trim().split('\n');
  const guests = [];
  
  // Skip header
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
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
      const fullName = values[1]?.replace(/^"|"$/g, '') || '';
      const notes = values[2]?.replace(/^"|"$/g, '') || '';
      const headcount = values[3]?.replace(/^"|"$/g, '') || '';
      
      if (fullName) {
        guests.push({
          fullName,
          notes,
          headcount: headcount ? parseInt(headcount, 10) : 1
        });
      }
    }
  }
  
  return guests;
}

function extractPlusOnes(notes) {
  if (!notes) return 0;
  
  // Look for patterns like "+1", "+2", "+3", etc.
  const plusOneMatch = notes.match(/\+\s*(\d+)/);
  if (plusOneMatch) {
    return parseInt(plusOneMatch[1], 10);
  }
  
  // Also check for patterns like "and Family", "+2", etc. in notes
  const familyMatch = notes.match(/and\s+Family/i);
  if (familyMatch) {
    // "and Family" typically means +2 (spouse + kids)
    return 2;
  }
  
  return 0;
}

function main() {
  const csvPath = path.join(__dirname, '..', 'MASTERGUESTLIST.csv');
  
  if (!fs.existsSync(csvPath)) {
    console.error(`❌ Error: CSV file not found: ${csvPath}`);
    process.exit(1);
  }
  
  console.log('📊 Calculating total headcount...\n');
  
  const guests = parseCSV(csvPath);
  
  let totalHeadcount = 0;
  let entourageCount = 0;
  let plusOnesCount = 0;
  let regularGuestsCount = 0;
  let entourageGuests = [];
  let plusOneGuests = [];
  
  for (const guest of guests) {
    const isEntourage = guest.notes && guest.notes.toUpperCase().includes('ENTOURAGE');
    const plusOnes = extractPlusOnes(guest.notes);
    
    // Base headcount from the Headcount column
    const baseCount = guest.headcount || 1;
    
    // Additional plus-ones from Notes column
    const additionalPlusOnes = plusOnes;
    
    // Total for this guest entry
    const entryTotal = baseCount + additionalPlusOnes;
    
    totalHeadcount += entryTotal;
    
    if (isEntourage) {
      entourageCount += entryTotal;
      entourageGuests.push({
        name: guest.fullName,
        count: entryTotal,
        notes: guest.notes
      });
    } else if (plusOnes > 0) {
      plusOnesCount += additionalPlusOnes;
      plusOneGuests.push({
        name: guest.fullName,
        baseCount,
        plusOnes: additionalPlusOnes,
        total: entryTotal,
        notes: guest.notes
      });
    } else {
      regularGuestsCount += entryTotal;
    }
  }
  
  console.log('='.repeat(60));
  console.log('📊 HEADCOUNT BREAKDOWN');
  console.log('='.repeat(60));
  console.log(`\n👥 Regular Guests: ${regularGuestsCount}`);
  console.log(`🎭 Entourage: ${entourageCount}`);
  console.log(`➕ Plus-Ones (from Notes): ${plusOnesCount}`);
  console.log(`\n📋 TOTAL HEADCOUNT: ${totalHeadcount}`);
  console.log('='.repeat(60));
  
  if (entourageGuests.length > 0) {
    console.log(`\n🎭 Entourage Details (${entourageGuests.length} entries):`);
    entourageGuests.forEach(g => {
      console.log(`   - ${g.name}: ${g.count} (${g.notes})`);
    });
  }
  
  if (plusOneGuests.length > 0) {
    console.log(`\n➕ Plus-One Details (${plusOneGuests.length} entries):`);
    plusOneGuests.forEach(g => {
      console.log(`   - ${g.name}: ${g.baseCount} base + ${g.plusOnes} plus = ${g.total} total`);
    });
  }
  
  console.log(`\n📋 Total Guest Entries: ${guests.length}`);
  console.log(`👥 Total Headcount: ${totalHeadcount}\n`);
}

main();
