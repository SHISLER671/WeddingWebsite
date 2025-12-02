import sharp from 'sharp';
import Papa from 'papaparse';
import JSZip from 'jszip';

interface Guest {
  FullName: string;
  [key: string]: string;
}

function escapeSvg(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export async function generatePersonalizedInvites(
  csvFile: File,
  templateFile: File,
  options: {
    x?: number;
    y?: number;
    fontSize?: number;
    color?: string;
    strokeColor?: string;
    strokeWidth?: number;
    font?: string;
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
  } = options;

  const csvText = await csvFile.text();
  const { data: guests } = Papa.parse<Guest>(csvText, { header: true, skipEmptyLines: true });

  const templateBuffer = Buffer.from(await templateFile.arrayBuffer());
  const baseImage = sharp(templateBuffer);
  const metadata = await baseImage.metadata();
  const imgWidth = metadata.width || 1200;
  const imgHeight = metadata.height || 1600;

  const zip = new JSZip();

  for (const guest of guests) {
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
  templateFile: File,
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

  const templateBuffer = Buffer.from(await templateFile.arrayBuffer());
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
