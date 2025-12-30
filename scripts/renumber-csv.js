#!/usr/bin/env node

/**
 * Renumber and alphabetize CSV files
 * 
 * This script:
 * - Sorts entries alphabetically by "Full Name"
 * - Renumbers the "Number" column sequentially starting from 1
 * 
 * Usage:
 *   node scripts/renumber-csv.js [csv-file1] [csv-file2] ...
 *   If no files specified, processes: MASTERGUESTLIST.csv, FINALlist.csv, FinalBride.csv
 */

const fs = require('fs');
const path = require('path');

function parseCSVLine(line) {
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
  
  return values;
}

function formatCSVLine(values) {
  return values.map(field => {
    // If field contains comma, quote, or newline, wrap in quotes and escape quotes
    if (field.includes(',') || field.includes('"') || field.includes('\n')) {
      return `"${field.replace(/"/g, '""')}"`;
    }
    return field;
  }).join(',');
}

function processCSV(csvPath) {
  console.log(`\n📄 Processing: ${path.basename(csvPath)}`);
  
  if (!fs.existsSync(csvPath)) {
    console.error(`   ❌ File not found: ${csvPath}`);
    return false;
  }
  
  const content = fs.readFileSync(csvPath, 'utf8');
  const lines = content.trim().split('\n');
  
  if (lines.length < 2) {
    console.error(`   ❌ File appears to be empty or has no data rows`);
    return false;
  }
  
  // Parse header
  const header = lines[0];
  const headerValues = parseCSVLine(header);
  
  // Find column indices
  const numberIdx = headerValues.findIndex(col => col.toLowerCase() === 'number');
  const nameIdx = headerValues.findIndex(col => col.toLowerCase().includes('name') || col.toLowerCase() === 'full name');
  
  if (numberIdx === -1) {
    console.error(`   ❌ Could not find "Number" column in header`);
    return false;
  }
  
  if (nameIdx === -1) {
    console.error(`   ❌ Could not find "Full Name" column in header`);
    return false;
  }
  
  // Parse data rows
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    const values = parseCSVLine(line);
    if (values.length >= nameIdx + 1) {
      rows.push(values);
    }
  }
  
  console.log(`   📋 Found ${rows.length} entries`);
  
  // Sort alphabetically by Full Name (case-insensitive)
  rows.sort((a, b) => {
    const nameA = (a[nameIdx] || '').toLowerCase().trim();
    const nameB = (b[nameIdx] || '').toLowerCase().trim();
    return nameA.localeCompare(nameB);
  });
  
  // Renumber sequentially
  for (let i = 0; i < rows.length; i++) {
    rows[i][numberIdx] = (i + 1).toString();
  }
  
  // Reconstruct CSV
  const newLines = [header];
  rows.forEach(row => {
    newLines.push(formatCSVLine(row));
  });
  
  const newContent = newLines.join('\n') + '\n';
  
  // Write back to file
  fs.writeFileSync(csvPath, newContent, 'utf8');
  
  console.log(`   ✅ Renumbered and alphabetized ${rows.length} entries`);
  return true;
}

function main() {
  console.log('🔄 Renumber and Alphabetize CSV Files');
  console.log('='.repeat(60));
  
  // Determine which files to process
  const filesToProcess = [];
  
  if (process.argv.length > 2) {
    // Files specified as arguments
    for (let i = 2; i < process.argv.length; i++) {
      filesToProcess.push(process.argv[i]);
    }
  } else {
    // Default files
    const defaultFiles = [
      path.join(process.cwd(), 'MASTERGUESTLIST.csv'),
      path.join(process.cwd(), 'FINALlist.csv'),
      path.join(process.cwd(), 'FinalBride.csv')
    ];
    
    defaultFiles.forEach(file => {
      if (fs.existsSync(file)) {
        filesToProcess.push(file);
      }
    });
  }
  
  if (filesToProcess.length === 0) {
    console.error('❌ No CSV files found to process');
    console.log('\nUsage:');
    console.log('  node scripts/renumber-csv.js [csv-file1] [csv-file2] ...');
    console.log('  Or run without arguments to process default files');
    process.exit(1);
  }
  
  console.log(`\n📁 Processing ${filesToProcess.length} file(s)...`);
  
  let successCount = 0;
  filesToProcess.forEach(file => {
    if (processCSV(file)) {
      successCount++;
    }
  });
  
  console.log('\n' + '='.repeat(60));
  console.log(`✅ Successfully processed ${successCount}/${filesToProcess.length} file(s)`);
  console.log('');
}

main();

