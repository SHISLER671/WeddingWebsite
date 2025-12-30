import sharp from "sharp"
import Papa from "papaparse"
import JSZip from "jszip"
import { readFile } from "fs/promises"
import { join } from "path"

interface Guest {
  FullName: string
  [key: string]: string
}

function escapeSvg(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;")
}

function splitNameIntoLines(name: string, maxChars = 28): { line1: string; line2: string; isTwoLines: boolean } {
  console.log(`[v0] splitNameIntoLines called: "${name}" (${name.length} chars), maxChars: ${maxChars}`)

  // If name is short enough, don't split
  if (name.length < maxChars) {
    console.log(`[v0] Name too short, not splitting`)
    return { line1: name, line2: "", isTwoLines: false }
  }

  // For names >= maxChars, ALWAYS split
  console.log(`[v0] Name is ${name.length} chars (>= ${maxChars}), MUST split`)

  // Priority 1: Split before " & " or " and " (keep conjunction with second part)
  const andMatch = name.match(/^(.+?)(\s+(?:&|and)\s+.+)$/i)
  if (andMatch && andMatch[1] && andMatch[2]) {
    const line1 = andMatch[1].trim()
    const line2 = andMatch[2].trim()
    // Accept if both lines are reasonable length
    if (line1.length >= 3 && line2.length >= 3 && line1.length <= 40 && line2.length <= 40) {
      console.log(`[v0] Conjunction split (before): "${line1}" / "${line2}"`)
      return { line1, line2, isTwoLines: true }
    }
  }

  // Priority 2: Split at comma (common for "Last, First" format)
  const commaIndex = name.indexOf(", ")
  if (commaIndex > 0) {
    const line1 = name.substring(0, commaIndex + 1).trim()
    const line2 = name.substring(commaIndex + 1).trim()
    if (line1.length >= 3 && line2.length >= 3 && line1.length <= 40 && line2.length <= 40) {
      console.log(`[v0] Comma split: "${line1}" / "${line2}"`)
      return { line1, line2, isTwoLines: true }
    }
  }

  // Priority 3: Split at the middle word for balanced lines
  const words = name.split(/\s+/)
  if (words.length >= 2) {
    const midPoint = Math.ceil(words.length / 2)
    const line1 = words.slice(0, midPoint).join(" ")
    const line2 = words.slice(midPoint).join(" ")

    if (line1.length > 0 && line2.length > 0) {
      console.log(`[v0] Word-based split: "${line1}" / "${line2}"`)
      return { line1, line2, isTwoLines: true }
    }
  }

  // Fallback: split at character midpoint near a space
  const midPoint = Math.floor(name.length / 2)
  let splitIndex = midPoint
  for (let i = 0; i < 10; i++) {
    if (midPoint + i < name.length && name[midPoint + i] === " ") {
      splitIndex = midPoint + i
      break
    }
    if (midPoint - i >= 0 && name[midPoint - i] === " ") {
      splitIndex = midPoint - i
      break
    }
  }

  const line1 = name.substring(0, splitIndex).trim()
  const line2 = name.substring(splitIndex).trim()

  if (line1.length > 0 && line2.length > 0) {
    console.log(`[v0] Character-based split: "${line1}" / "${line2}"`)
    return { line1, line2, isTwoLines: true }
  }

  // Last resort: exact half split
  const exactMid = Math.floor(name.length / 2)
  const result = {
    line1: name.substring(0, exactMid).trim(),
    line2: name.substring(exactMid).trim(),
    isTwoLines: true,
  }
  console.log(`[v0] Last resort split result:`, result)
  return result
}

// Define safe zone: guest names must end BEFORE "Please Join Us" text
const SAFE_ZONE_END_PERCENT = 0.16 // Names must end by 16% from top (conservative)
const SAFE_ZONE_START_PERCENT = 0.03 // Start 3% from top for margin

function calculateDynamicFontSize(
  name: string,
  imgWidth: number,
  isTwoLines: boolean,
): { fontSize: number; shouldSplit: boolean } {
  const charCount = name.length
  const splitThreshold = 26 // Split at 26+ characters for earlier intervention

  // If already determined to be two lines, use two-line sizing
  if (isTwoLines) {
    // For two lines, use character count to determine font size
    // Longer names need smaller fonts to fit width
    const longestLineLength = Math.max(
      ...name
        .split(/\s+(?:&|and)\s+/i)
        .map((part) => part.length)
        .concat([charCount / 2]),
    )

    // Scale font based on longest line length and available width
    const baseSize = imgWidth * 0.065 // Base: ~6.5% of canvas width
    const scaleFactor = Math.max(0.6, 1 - (longestLineLength - 15) / 50) // Scale down for longer lines
    const fontSize = Math.floor(baseSize * scaleFactor)

    console.log(
      `[v0] Two-line font calc: longestLine=${longestLineLength}, baseSize=${baseSize}, scaleFactor=${scaleFactor}, final=${fontSize}`,
    )
    return { fontSize: Math.max(45, Math.min(65, fontSize)), shouldSplit: true }
  }

  // Single-line sizing based on character count and canvas width
  // Very short names (1-10 chars): larger but not too large
  if (charCount <= 10) {
    const fontSize = imgWidth * 0.07 // ~7% of canvas width
    return { fontSize: Math.floor(fontSize), shouldSplit: false }
  }

  // Medium names (11-25 chars): scale down progressively
  if (charCount < splitThreshold) {
    const baseSize = imgWidth * 0.08 // Base: 8% of canvas width
    const scaleFactor = 1 - ((charCount - 10) / 20) * 0.35 // Reduce by up to 35%
    const fontSize = Math.floor(baseSize * scaleFactor)
    return { fontSize: Math.max(50, fontSize), shouldSplit: false }
  }

  // Long names (26+ chars): MUST split into two lines
  console.log(`[v0] Name "${name}" has ${charCount} chars, MUST split (threshold: ${splitThreshold})`)
  // Recalculate for two-line mode
  const baseSize = imgWidth * 0.065
  const longestLineLength = charCount / 2 // Estimate
  const scaleFactor = Math.max(0.6, 1 - (longestLineLength - 15) / 50)
  return { fontSize: Math.max(45, Math.min(65, Math.floor(baseSize * scaleFactor))), shouldSplit: true }
}

function calculateBoundaryAwarePosition(
  imgWidth: number,
  imgHeight: number,
  fontSize: number,
  isTwoLines: boolean,
): { x: number; y: number } {
  // Horizontal: always center
  const x = imgWidth / 2

  // Vertical: calculate based on safe zone boundaries
  const safeZoneStart = imgHeight * SAFE_ZONE_START_PERCENT
  const safeZoneEnd = imgHeight * SAFE_ZONE_END_PERCENT
  const availableHeight = safeZoneEnd - safeZoneStart

  let textHeight: number
  if (isTwoLines) {
    // Two lines: height = 2 * fontSize + line spacing (30% of fontSize)
    const lineSpacing = fontSize * 0.3
    textHeight = fontSize * 2 + lineSpacing
  } else {
    // Single line: just the font size (with small buffer for descenders)
    textHeight = fontSize * 1.1
  }

  // Center text vertically within safe zone
  const verticalCenter = safeZoneStart + (availableHeight - textHeight) / 2
  // Y position is where text STARTS (top edge)
  const y = verticalCenter

  console.log(
    `[v0] Boundary-aware position: safeStart=${safeZoneStart}, safeEnd=${safeZoneEnd}, ` +
      `availHeight=${availableHeight}, textHeight=${textHeight}, y=${y}`,
  )

  return { x, y }
}

// Load template from public folder
async function loadTemplate(): Promise<Buffer> {
  try {
    const templatePath = join(process.cwd(), "public", "tenthtemplate.jpg")
    console.log("[v0] Loading template from:", templatePath)
    const buffer = await readFile(templatePath)
    console.log("[v0] Template loaded successfully, size:", buffer.length)
    return buffer
  } catch (error) {
    console.error("[v0] Failed to load template:", error)
    throw new Error(`Failed to load template: ${error instanceof Error ? error.message : String(error)}`)
  }
}

// Load master guest list from public folder
async function loadMasterGuestList(): Promise<string> {
  const csvPath = join(process.cwd(), "MASTERGUESTLIST.csv")
  return await readFile(csvPath, "utf-8")
}

// Create text overlay using SVG (works with Sharp on Vercel)
async function createTextOverlay(
  text: string,
  width: number,
  height: number,
  x: number,
  y: number,
  fontSize: number,
  color: string,
  strokeColor: string,
  strokeWidth: number,
  isTwoLines = false,
  line1?: string,
  line2?: string,
): Promise<Buffer> {
  const lineHeight = fontSize * 1.3
  let svg: string

  console.log(`[v0] createTextOverlay: isTwoLines=${isTwoLines}, line1="${line1}", line2="${line2}"`)

  if (isTwoLines && line1 && line2 && line1.trim() && line2.trim()) {
    // Two-line text using tspan elements
    const escapedLine1 = escapeSvg(line1.trim())
    const escapedLine2 = escapeSvg(line2.trim())
    console.log(`[v0] Rendering TWO-LINE text: "${escapedLine1}" / "${escapedLine2}"`)

    svg = `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <text
          x="${x}"
          y="${y}"
          fontFamily="Didot, 'Bodoni MT', Garamond, 'Palatino Linotype', 'Book Antiqua', Georgia, 'Times New Roman', Times, serif"
          fontSize="${fontSize}"
          fontWeight="normal"
          fill="${color}"
          stroke="${strokeColor}"
          strokeWidth="${strokeWidth}"
          strokeLinejoin="round"
          strokeLinecap="round"
          textAnchor="middle"
          dominantBaseline="hanging"
        >
          <tspan x="${x}" dy="0">${escapedLine1}</tspan>
          <tspan x="${x}" dy="${lineHeight}">${escapedLine2}</tspan>
        </text>
      </svg>
    `.trim()
  } else {
    // Single-line text
    const escapedText = escapeSvg(text)

    svg = `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <text
          x="${x}"
          y="${y}"
          fontFamily="Didot, 'Bodoni MT', Garamond, 'Palatino Linotype', 'Book Antiqua', Georgia, 'Times New Roman', Times, serif"
          fontSize="${fontSize}"
          fontWeight="normal"
          fill="${color}"
          stroke="${strokeColor}"
          strokeWidth="${strokeWidth}"
          strokeLinejoin="round"
          strokeLinecap="round"
          textAnchor="middle"
          dominantBaseline="hanging"
        >${escapedText}</text>
      </svg>
    `.trim()
  }

  // Convert SVG to PNG buffer using Sharp
  return await sharp(Buffer.from(svg)).resize(width, height).png().toBuffer()
}

export async function generatePersonalizedInvites(
  csvFile: File | null,
  options: {
    x?: number
    y?: number
    fontSize?: number
    color?: string
    strokeColor?: string
    strokeWidth?: number
    font?: string
    useMasterList?: boolean
  } = {},
) {
  const {
    fontSize = 80,
    color = "#7B4B7A", // Purple color to match invitation text
    strokeColor = "#5a1f2a", // Darker burgundy stroke for depth
    strokeWidth = 4,
    font = "serif", // Use system serif to avoid font loading issues
    useMasterList = false,
  } = options

  const useCustomPosition = false

  // Use master list if requested, otherwise use uploaded file
  let csvText: string
  if (useMasterList || !csvFile) {
    csvText = await loadMasterGuestList()
  } else {
    csvText = await csvFile.text()
  }

  const { data: guests } = Papa.parse<Guest>(csvText, { header: true, skipEmptyLines: true })

  // Handle "Full Name" column (with space) as well as "FullName"
  const normalizedGuests = guests.map((guest) => ({
    ...guest,
    FullName: guest.FullName || guest["Full Name"] || "",
  }))

  const templateBuffer = await loadTemplate()
  const baseImage = sharp(templateBuffer)
  const metadata = await baseImage.metadata()
  const imgWidth = metadata.width || 1200
  const imgHeight = metadata.height || 1600

  const zip = new JSZip()

  for (const guest of normalizedGuests) {
    const name = guest.FullName?.trim()
    if (!name) continue

    // First, determine if we need to split
    const mustSplit = name.length >= 26
    let nameSplit = mustSplit ? splitNameIntoLines(name, 26) : { line1: name, line2: "", isTwoLines: false }

    // Calculate font size based on split decision
    const fontInfo = calculateDynamicFontSize(name, imgWidth, nameSplit.isTwoLines)
    const optimalFontSize = fontInfo.fontSize

    // If sizing determined we should split but haven't yet, do it now
    if (fontInfo.shouldSplit && !nameSplit.isTwoLines) {
      nameSplit = splitNameIntoLines(name, 26)
    }

    // Calculate boundary-aware position
    const position = calculateBoundaryAwarePosition(imgWidth, imgHeight, optimalFontSize, nameSplit.isTwoLines)
    const finalX = position.x
    const finalY = position.y

    console.log(
      `[v0] Bulk: "${name}" (${name.length} chars) - Font: ${optimalFontSize}px, TwoLines: ${nameSplit.isTwoLines}, Pos: (${finalX}, ${finalY})`,
    )

    const actuallyTwoLines = nameSplit.isTwoLines && !!nameSplit.line1 && !!nameSplit.line2

    const textOverlay = await createTextOverlay(
      name,
      imgWidth,
      imgHeight,
      finalX,
      finalY,
      optimalFontSize,
      color,
      strokeColor,
      strokeWidth,
      actuallyTwoLines,
      nameSplit.line1,
      nameSplit.line2,
    )

    const output = await baseImage
      .clone()
      .composite([{ input: textOverlay, top: 0, left: 0 }])
      .jpeg({ quality: 95 })
      .toBuffer()

    const safeName = name.replace(/[^a-zA-Z0-9\- ]/g, "_").slice(0, 50)
    zip.file(`${safeName}.jpg`, new Uint8Array(output))
  }

  return await zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" })
}

export async function generatePreview(
  name: string,
  options: {
    x?: number
    y?: number
    fontSize: number
    color: string
    strokeColor: string
    strokeWidth: number
    font: string
    autoPosition?: boolean
  },
) {
  try {
    console.log("[v0] generatePreview called with name:", name)
    console.log("[v0] generatePreview options:", options)

    const {
      fontSize = 80,
      color = "#7B4B7A",
      strokeColor = "#5a1f2a",
      strokeWidth = 4,
      font = "serif",
      autoPosition = true,
    } = options

    const templateBuffer = await loadTemplate()
    const baseImage = sharp(templateBuffer)
    const metadata = await baseImage.metadata()
    const imgWidth = metadata.width || 1200
    const imgHeight = metadata.height || 1600

    console.log("[v0] Image dimensions:", imgWidth, "x", imgHeight)

    // First, determine if we need to split
    const mustSplit = name.length >= 26
    let nameSplit = mustSplit ? splitNameIntoLines(name, 26) : { line1: name, line2: "", isTwoLines: false }

    // Calculate font size based on split decision
    const fontInfo = calculateDynamicFontSize(name, imgWidth, nameSplit.isTwoLines)
    const finalFontSize = fontInfo.fontSize

    // If sizing determined we should split but haven't yet, do it now
    if (fontInfo.shouldSplit && !nameSplit.isTwoLines) {
      nameSplit = splitNameIntoLines(name, 26)
    }

    // Calculate boundary-aware position
    const position = calculateBoundaryAwarePosition(imgWidth, imgHeight, finalFontSize, nameSplit.isTwoLines)
    const finalX = position.x
    const finalY = position.y

    console.log(
      `[v0] Preview: "${name}" (${name.length} chars) - Font: ${finalFontSize}px, TwoLines: ${nameSplit.isTwoLines}, Pos: (${finalX}, ${finalY})`,
    )

    const actuallyTwoLines = nameSplit.isTwoLines && !!nameSplit.line1 && !!nameSplit.line2

    const textOverlayBuffer = await createTextOverlay(
      name,
      imgWidth,
      imgHeight,
      finalX,
      finalY,
      finalFontSize,
      color,
      strokeColor,
      strokeWidth,
      actuallyTwoLines,
      nameSplit.line1 || name,
      nameSplit.line2 || "",
    )

    console.log("[v0] Text overlay created, size:", textOverlayBuffer.length)

    const result = await baseImage
      .composite([{ input: textOverlayBuffer, top: 0, left: 0 }])
      .jpeg({ quality: 92 })
      .toBuffer()

    console.log("[v0] Final image generated, size:", result.length)
    return result
  } catch (error) {
    console.error("[v0] Error in generatePreview:", error)
    if (error instanceof Error) {
      console.error("[v0] Error details:", error.message, error.stack)
    }
    throw error
  }
}
