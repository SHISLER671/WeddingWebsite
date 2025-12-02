#!/usr/bin/env node

/**
 * Fix numbering in MASTERGUESTLIST.csv
 * Ensures the Number column is sequential starting from 1
 */

const fs = require('fs');
const path = require('path');

const csvFile = path.join(__dirname, '..', 'MASTERGUESTLIST.csv');

// Read CSV
const content = fs.readFileSync(csvFile, 'utf8');
const lines = content.trim().split('\n');

// Keep header
const header = lines[0];
const dataLines = lines.slice(1);

// Fix numbering
const fixedLines = [header];
dataLines.forEach((line, index) => {
  if (!line.trim()) {
    fixedLines.push('');
    return;
  }
  
  // Parse the line (handling quoted fields)
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
  
  // Replace first column (Number) with correct sequential number
  const correctNumber = index + 1;
  values[0] = correctNumber.toString();
  
  // Reconstruct the line
  const fixedLine = values.map((val, i) => {
    // Keep quotes if they were there, or add them if needed
    if (i === 2 && val.includes(',')) {
      return `"${val}"`;
    }
    return val;
  }).join(',');
  
  fixedLines.push(fixedLine);
});

// Write back
fs.writeFileSync(csvFile, fixedLines.join('\n') + '\n', 'utf8');

console.log(`✅ Fixed numbering in ${csvFile}`);
console.log(`   Total entries: ${dataLines.length}`);

