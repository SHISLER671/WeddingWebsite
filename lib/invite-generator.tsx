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

function calculateOptimalFontSize(
  name: string,
  imgWidth: number,
  baseFontSize = 80,
): { fontSize: number; shouldSplit: boolean } {
  const charCount = name.length
  const splitThreshold = 28 // Split at 28+ characters (was 30)

  // For very short names (1-10 chars), use moderate font size
  if (charCount <= 10) {
    return { fontSize: Math.max(55, baseFontSize * 0.7), shouldSplit: false }
  }

  // For medium names (11-27 chars), use moderate scaling
  if (charCount < splitThreshold) {
    const scaleFactor = 1 - ((charCount - 10) / (splitThreshold - 10)) * 0.25
    return { fontSize: Math.floor(baseFontSize * scaleFactor), shouldSplit: false }
  }

  // For names 28+ characters, ALWAYS split into two lines with readable font
  console.log(`[v0] Name "${name}" has ${charCount} chars, will split (threshold: ${splitThreshold})`)
  // Use 58-62px for two-line names for better readability
  const twoLineFontSize = Math.max(58, Math.min(62, baseFontSize * 0.75))
  return { fontSize: twoLineFontSize, shouldSplit: true }
}

function calculateOptimalPosition(
  imgWidth: number,
  imgHeight: number,
  fontSize: number,
  name: string,
  isTwoLines = false,
): { x: number; y: number } {
  // Center horizontally
  const x = imgWidth / 2

  const topMargin = imgHeight * 0.02

  // Add spacing based on font size with careful adjustment
  let fontAdjustment: number

  if (isTwoLines) {
    // Two-line text needs minimal adjustment since we're starting higher
    fontAdjustment = fontSize * 0.4
  } else {
    // Single-line text adjustment based on size
    if (fontSize <= 55) {
      fontAdjustment = fontSize * 0.3
    } else {
      fontAdjustment = fontSize * 0.35
    }
  }

  // Final Y position - positioned very high with maximum clearance
  const y = topMargin + fontAdjustment

  console.log(
    `[v0] Position calc: fontSize=${fontSize}, isTwoLines=${isTwoLines}, topMargin=${topMargin}, fontAdj=${fontAdjustment}, finalY=${y}`,
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

// NOTE: Custom font embedding doesn't work with Sharp's SVG renderer on Vercel
// Sharp uses librsvg which doesn't support @font-face with data URIs
// We use elegant system serif fonts (Georgia, Times New Roman) instead

// Create text overlay using SVG (works with Sharp on Vercel)
// NOTE: Sharp's SVG renderer (librsvg) does NOT support @font-face with data URIs
// We use elegant system serif fonts that will render properly
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
  // Adjust line spacing for better readability (was 1.2, now 1.3)
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

  // Auto-positioning is enabled by default (x and y are calculated per guest)
  const useCustomPosition = options.x !== undefined && options.y !== undefined

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

    // Calculate optimal font size and check if name should be split into two lines
    const fontInfo = calculateOptimalFontSize(name, imgWidth, fontSize)
    let optimalFontSize = fontInfo.fontSize

    const mustSplit = name.length >= 28
    const shouldSplit = fontInfo.shouldSplit || mustSplit

    // Split name if needed
    let nameSplit =
      shouldSplit || mustSplit ? splitNameIntoLines(name, 28) : { line1: name, line2: "", isTwoLines: false }

    // If split failed but needed, force word-based split
    if ((shouldSplit || mustSplit) && !nameSplit.isTwoLines) {
      console.log(`[v0] Bulk: Split failed, forcing word-based split for "${name}" (${name.length} chars)`)
      const words = name.split(/\s+/)
      if (words.length >= 2) {
        const midPoint = Math.ceil(words.length / 2)
        nameSplit = {
          line1: words.slice(0, midPoint).join(" "),
          line2: words.slice(midPoint).join(" "),
          isTwoLines: true,
        }
        optimalFontSize = Math.max(58, fontSize * 0.75)
      } else {
        const midPoint = Math.floor(name.length / 2)
        nameSplit = {
          line1: name.substring(0, midPoint),
          line2: name.substring(midPoint),
          isTwoLines: true,
        }
        optimalFontSize = Math.max(58, fontSize * 0.75)
      }
    }

    console.log(
      `[v0] Bulk: "${name}" (${name.length} chars) - Optimal: ${optimalFontSize}px, TwoLines: ${shouldSplit}, SplitResult:`,
      nameSplit,
    )

    // Calculate optimal position
    const position = calculateOptimalPosition(imgWidth, imgHeight, optimalFontSize, name, shouldSplit)
    const finalX = useCustomPosition ? (options.x ?? position.x) : position.x
    const finalY = useCustomPosition ? (options.y ?? position.y) : position.y

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
      color = "#7B4B7A", // Purple color to match invitation text
      strokeColor = "#5a1f2a", // Darker burgundy stroke for depth
      strokeWidth = 4,
      font = "serif",
      autoPosition = true,
    } = options

    const templateBuffer = await loadTemplate()
    console.log("[v0] Creating sharp instance")
    const baseImage = sharp(templateBuffer)
    const metadata = await baseImage.metadata()
    const imgWidth = metadata.width || 1200
    const imgHeight = metadata.height || 1600

    console.log("[v0] Image dimensions:", imgWidth, "x", imgHeight)

    let finalX: number
    let finalY: number
    let finalFontSize: number
    let shouldSplit: boolean

    // Calculate optimal font size and check if name should be split
    const fontInfo = calculateOptimalFontSize(name, imgWidth, fontSize)
    finalFontSize = fontInfo.fontSize

    const mustSplit = name.length >= 28
    shouldSplit = fontInfo.shouldSplit || mustSplit

    // Split name if needed
    let nameSplit =
      shouldSplit || mustSplit ? splitNameIntoLines(name, 28) : { line1: name, line2: "", isTwoLines: false }

    // If split failed but needed, force word-based split
    if ((shouldSplit || mustSplit) && !nameSplit.isTwoLines) {
      console.log(`[v0] Preview: Split failed, forcing word-based split for "${name}" (${name.length} chars)`)
      const words = name.split(/\s+/)
      if (words.length >= 2) {
        const midPoint = Math.ceil(words.length / 2)
        nameSplit = {
          line1: words.slice(0, midPoint).join(" "),
          line2: words.slice(midPoint).join(" "),
          isTwoLines: true,
        }
        finalFontSize = Math.max(58, fontSize * 0.75)
      } else {
        const midPoint = Math.floor(name.length / 2)
        nameSplit = {
          line1: name.substring(0, midPoint),
          line2: name.substring(midPoint),
          isTwoLines: true,
        }
        finalFontSize = Math.max(58, fontSize * 0.75)
      }
    }

    console.log(
      `[v0] Preview: "${name}" (${name.length} chars) - Optimal: ${finalFontSize}px, TwoLines: ${shouldSplit}, SplitResult:`,
      nameSplit,
    )

    if (autoPosition && (options.x === undefined || options.y === undefined)) {
      const position = calculateOptimalPosition(imgWidth, imgHeight, finalFontSize, name, shouldSplit)
      finalX = position.x
      finalY = position.y
    } else {
      finalX = options.x ?? imgWidth / 2
      finalY = options.y ?? imgHeight * 0.2
    }

    console.log("[v0] Text position:", finalX, finalY, "Font size:", finalFontSize, "Two lines:", shouldSplit)

    const actuallyTwoLines =
      (name.length >= 28 && nameSplit.isTwoLines && !!nameSplit.line1 && !!nameSplit.line2) ||
      (nameSplit.isTwoLines && !!nameSplit.line1 && !!nameSplit.line2)

    console.log(
      "[v0] Actually rendering two lines?",
      actuallyTwoLines,
      "Line1:",
      nameSplit.line1,
      "Line2:",
      nameSplit.line2,
    )

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
