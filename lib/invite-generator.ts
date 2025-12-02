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

// Calculate optimal text position for guest name in the top blank space
function calculateOptimalPosition(
  imgWidth: number,
  imgHeight: number,
  fontSize: number,
  name: string
): { x: number; y: number } {
  // Center horizontally
  const x = imgWidth / 2;
  
  // Position in the top 20-25% of the image (blank space area)
  // Adjust based on font size to ensure good spacing
  const topAreaStart = imgHeight * 0.15; // Start at 15% from top
  const topAreaEnd = imgHeight * 0.30;   // End at 30% from top
  const topAreaCenter = (topAreaStart + topAreaEnd) / 2;
  
  // Adjust for longer names (they need more vertical space)
  const nameLength = name.length;
  const lengthAdjustment = Math.min(nameLength * 2, 50); // Max 50px adjustment
  
  // Final Y position - slightly above center of top area
  const y = topAreaCenter - (lengthAdjustment / 2);
  
  return { x, y };
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
    fontSize = 80,
    color = '#D4AF37',
    strokeColor = '#4a1c1c',
    strokeWidth = 4,
    font = 'PlayfairDisplay-Regular',
    useMasterList = false,
  } = options;
  
  // Auto-positioning is enabled by default (x and y are calculated per guest)
  const useCustomPosition = options.x !== undefined && options.y !== undefined;

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

    // Calculate optimal position for this guest's name (auto-positioning by default)
    const position = calculateOptimalPosition(imgWidth, imgHeight, fontSize, name);
    const finalX = useCustomPosition ? (options.x ?? position.x) : position.x;
    const finalY = useCustomPosition ? (options.y ?? position.y) : position.y;

    const textSvg = `
      <svg width="${imgWidth}" height="${imgHeight}">
        <style>
          .title { font-family: "${font}, serif"; font-size: ${fontSize}px; fill: ${color}; text-anchor: middle; }
          .stroke { -webkit-text-stroke: ${strokeWidth}px ${strokeColor}; paint-order: stroke fill; }
        </style>
        <text x="${finalX}" y="${finalY}" class="title stroke">${escapeSvg(name)}</text>
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
    x?: number;
    y?: number;
    fontSize: number;
    color: string;
    strokeColor: string;
    strokeWidth: number;
    font: string;
    autoPosition?: boolean;
  }
) {
  const { fontSize, color, strokeColor, strokeWidth, font, autoPosition = true } = options;

  const templateBuffer = await loadTemplate();
  const baseImage = sharp(templateBuffer);
  const metadata = await baseImage.metadata();
  const imgWidth = metadata.width || 1200;
  const imgHeight = metadata.height || 1600;

  // Calculate optimal position if auto-positioning is enabled
  let finalX: number;
  let finalY: number;
  
  if (autoPosition && (options.x === undefined || options.y === undefined)) {
    const position = calculateOptimalPosition(imgWidth, imgHeight, fontSize, name);
    finalX = position.x;
    finalY = position.y;
  } else {
    finalX = options.x ?? imgWidth / 2;
    finalY = options.y ?? imgHeight * 0.2;
  }

  const textSvg = `
    <svg width="${imgWidth}" height="${imgHeight}">
      <style>
        .title { font-family: "${font}, serif"; font-size: ${fontSize}px; fill: ${color}; text-anchor: middle; }
        .stroke { -webkit-text-stroke: ${strokeWidth}px ${strokeColor}; paint-order: stroke fill; }
      </style>
      <text x="${finalX}" y="${finalY}" class="title stroke">${escapeSvg(name)}</text>
    </svg>`;

  return await baseImage
    .composite([{ input: Buffer.from(textSvg), top: 0, left: 0 }])
    .jpeg({ quality: 92 })
    .toBuffer();
}
