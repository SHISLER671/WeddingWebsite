import sharp from 'sharp';
import Papa from 'papaparse';
import JSZip from 'jszip';
import { readFile } from 'fs/promises';
import { join } from 'path';

interface Guest {
  FullName: string;
  [key: string]: string;
}

function escapeSvg(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// Load template from public folder
async function loadTemplate(): Promise<Buffer> {
  const templatePath = join(process.cwd(), 'public', 'invitetemplate.jpg');
  return await readFile(templatePath);
}

// Load master guest list from public folder
async function loadMasterGuestList(): Promise<string> {
  const csvPath = join(process.cwd(), 'MASTERGUESTLIST.csv');
  return await readFile(csvPath, 'utf-8');
}

export async function generatePersonalizedInvites(
  csvFile: File | null,
  options: {
    x?: number;
    y?: number;
    fontSize?: number;
    color?: string;
    strokeColor?: string;
    strokeWidth?: number;
    font?: string;
    useMasterList?: boolean;
  } = {}
) {
  const {
    x = 600,
    y = 900,
    fontSize = 80,
    color = '#D4AF37',
    strokeColor = '#4a1c1c',
    strokeWidth = 4,
    font = 'PlayfairDisplay-Regular',
    useMasterList = false,
  } = options;

  // Use master list if requested, otherwise use uploaded file
  let csvText: string;
  if (useMasterList || !csvFile) {
    csvText = await loadMasterGuestList();
  } else {
    csvText = await csvFile.text();
  }
  
  const { data: guests } = Papa.parse<Guest>(csvText, { header: true, skipEmptyLines: true });
  
  // Handle "Full Name" column (with space) as well as "FullName"
  const normalizedGuests = guests.map(guest => ({
    ...guest,
    FullName: guest.FullName || guest['Full Name'] || '',
  }));

  const templateBuffer = await loadTemplate();
  const baseImage = sharp(templateBuffer);
  const metadata = await baseImage.metadata();
  const imgWidth = metadata.width || 1200;
  const imgHeight = metadata.height || 1600;

  const zip = new JSZip();

  for (const guest of normalizedGuests) {
    const name = guest.FullName?.trim();
    if (!name) continue;

    const textSvg = `
      <svg width="${imgWidth}" height="${imgHeight}">
        <style>
          .title { font-family: "${font}, serif"; font-size: ${fontSize}px; fill: ${color}; text-anchor: middle; }
          .stroke { -webkit-text-stroke: ${strokeWidth}px ${strokeColor}; paint-order: stroke fill; }
        </style>
        <text x="${x}" y="${y}" class="title stroke">${escapeSvg(name)}</text>
      </svg>`;

    const output = await baseImage
      .clone()
      .composite([{ input: Buffer.from(textSvg), top: 0, left: 0 }])
      .jpeg({ quality: 95 })
      .toBuffer();

    const safeName = name.replace(/[^a-zA-Z0-9\- ]/g, '_').slice(0, 50);
    zip.file(`${safeName}.jpg`, new Uint8Array(output));
  }

  return await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
}

// Single preview function
export async function generatePreview(
  name: string,
  options: {
    x: number;
    y: number;
    fontSize: number;
    color: string;
    strokeColor: string;
    strokeWidth: number;
    font: string;
  }
) {
  const { x, y, fontSize, color, strokeColor, strokeWidth, font } = options;

  const templateBuffer = await loadTemplate();
  const baseImage = sharp(templateBuffer);
  const metadata = await baseImage.metadata();
  const imgWidth = metadata.width || 1200;
  const imgHeight = metadata.height || 1600;

  const textSvg = `
    <svg width="${imgWidth}" height="${imgHeight}">
      <style>
        .title { font-family: "${font}, serif"; font-size: ${fontSize}px; fill: ${color}; text-anchor: middle; }
        .stroke { -webkit-text-stroke: ${strokeWidth}px ${strokeColor}; paint-order: stroke fill; }
      </style>
      <text x="${x}" y="${y}" class="title stroke">${escapeSvg(name)}</text>
    </svg>`;

  return await baseImage
    .composite([{ input: Buffer.from(textSvg), top: 0, left: 0 }])
    .jpeg({ quality: 92 })
    .toBuffer();
}
