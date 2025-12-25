#!/usr/bin/env node

/**
 * Generate PDF files from CSV guest lists
 * Creates PDFs for:
 * - MASTERGUESTLIST.csv
 * - ATTENDEESBride.csv
 * - ATTENDEESGroom.csv
 */

const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

function parseCSV(csvPath) {
  const content = fs.readFileSync(csvPath, 'utf8');
  const lines = content.trim().split('\n');
  const rows = [];
  
  for (let i = 0; i < lines.length; i++) {
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
    
    rows.push(values);
  }
  
  return rows;
}

function generatePDF(csvPath, outputPath, title) {
  const rows = parseCSV(csvPath);
  if (rows.length === 0) {
    console.error(`❌ No data found in ${csvPath}`);
    return false;
  }
  
  const header = rows[0];
  const dataRows = rows.slice(1);
  
  const doc = new PDFDocument({ 
    margin: 50,
    size: 'LETTER'
  });
  
  doc.pipe(fs.createWriteStream(outputPath));
  
  // Title
  doc.fontSize(20)
     .font('Helvetica-Bold')
     .text(title, { align: 'center' });
  
  doc.moveDown(1);
  
  // Date
  doc.fontSize(10)
     .font('Helvetica')
     .text(`Generated: ${new Date().toLocaleDateString()}`, { align: 'center' });
  
  doc.moveDown(2);
  
  // Table setup
  const pageWidth = doc.page.width - 100; // margins
  const colWidths = [];
  
  // Calculate column widths based on header
  if (header.length > 0) {
    const numCols = header.length;
    const baseWidth = pageWidth / numCols;
    
    // Adjust for Number column (smaller)
    if (header[0] === 'Number') {
      colWidths.push(50);
      const remainingWidth = pageWidth - 50;
      const remainingCols = numCols - 1;
      for (let i = 1; i < numCols; i++) {
        colWidths.push(remainingWidth / remainingCols);
      }
    } else {
      for (let i = 0; i < numCols; i++) {
        colWidths.push(baseWidth);
      }
    }
  }
  
  // Header row
  doc.fontSize(10)
     .font('Helvetica-Bold')
     .fillColor('#000000');
  
  let x = 50;
  header.forEach((col, i) => {
    const width = colWidths[i] || 100;
    doc.text(col || '', x, doc.y, {
      width: width,
      height: 20,
      align: 'left'
    });
    x += width;
  });
  
  doc.moveDown(0.5);
  
  // Draw header underline
  doc.moveTo(50, doc.y)
     .lineTo(pageWidth + 50, doc.y)
     .stroke();
  
  doc.moveDown(0.5);
  
  // Data rows
  doc.fontSize(9)
     .font('Helvetica')
     .fillColor('#000000');
  
  const totalRows = dataRows.length;
  
  dataRows.forEach((row, rowIndex) => {
    // Check if we need a new page
    if (doc.y > doc.page.height - 100) {
      doc.addPage();
      // Redraw header on new page
      doc.fontSize(10)
         .font('Helvetica-Bold')
         .fillColor('#000000');
      let headerX = 50;
      header.forEach((col, i) => {
        const width = colWidths[i] || 100;
        doc.text(col || '', headerX, doc.y, {
          width: width,
          height: 20,
          align: 'left'
        });
        headerX += width;
      });
      doc.moveDown(0.5);
      doc.moveTo(50, doc.y)
         .lineTo(pageWidth + 50, doc.y)
         .stroke();
      doc.moveDown(0.5);
      doc.fontSize(9)
         .font('Helvetica');
    }
    
    let x = 50;
    row.forEach((cell, i) => {
      const width = colWidths[i] || 100;
      const cellText = (cell || '').replace(/^"|"$/g, ''); // Remove quotes
      doc.text(cellText, x, doc.y, {
        width: width,
        height: 15,
        align: 'left',
        ellipsis: true
      });
      x += width;
    });
    
    doc.moveDown(0.8);
    
    // Light gray line between rows
    if (rowIndex < dataRows.length - 1) {
      doc.moveTo(50, doc.y - 5)
         .lineTo(pageWidth + 50, doc.y - 5)
         .strokeColor('#E0E0E0')
         .lineWidth(0.5)
         .stroke()
         .strokeColor('#000000')
         .lineWidth(1);
    }
  });
  
  // Add summary at the end
  doc.moveDown(2);
  doc.fontSize(10)
     .font('Helvetica')
     .fillColor('#666666')
     .text(`Total: ${totalRows} guests`, { align: 'center' });
  
  doc.end();
  
  return new Promise((resolve, reject) => {
    doc.on('end', () => {
      console.log(`✅ Generated: ${outputPath}`);
      resolve(true);
    });
    doc.on('error', (err) => {
      console.error(`❌ Error generating ${outputPath}:`, err);
      reject(err);
    });
  });
}

async function main() {
  const baseDir = path.join(__dirname, '..');
  
  const files = [
    {
      csv: path.join(baseDir, 'MASTERGUESTLIST.csv'),
      pdf: path.join(baseDir, 'MASTERGUESTLIST.pdf'),
      title: 'Master Guest List'
    },
    {
      csv: path.join(baseDir, 'ATTENDEESBride.csv'),
      pdf: path.join(baseDir, 'ATTENDEESBride.pdf'),
      title: 'Bride Attendees List'
    },
    {
      csv: path.join(baseDir, 'ATTENDEESGroom.csv'),
      pdf: path.join(baseDir, 'ATTENDEESGroom.pdf'),
      title: 'Groom Attendees List'
    }
  ];
  
  console.log('📄 Generating PDF files from CSV...\n');
  
  for (const file of files) {
    if (!fs.existsSync(file.csv)) {
      console.error(`❌ CSV file not found: ${file.csv}`);
      continue;
    }
    
    try {
      await generatePDF(file.csv, file.pdf, file.title);
    } catch (error) {
      console.error(`❌ Failed to generate PDF for ${file.csv}:`, error.message);
    }
  }
  
  console.log('\n✨ PDF generation complete!');
}

main().catch(console.error);
