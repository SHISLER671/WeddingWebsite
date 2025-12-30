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

// Split long names into two lines intelligently
function splitNameIntoLines(name: string, maxChars: number = 30): { line1: string; line2: string; isTwoLines: boolean } {
  // If name is short enough, don't split
  if (name.length <= maxChars) {
    return { line1: name, line2: "", isTwoLines: false }
  }

  // Try to split at natural break points
  const breakPoints = [
    { pattern: / & /, splitAfter: true },           // "John & Jane" - split after " &"
    { pattern: / and /i, splitAfter: true },        // "John and Jane" - split after " and"
    { pattern: /, /, splitAfter: true },            // "Last, First" - split after ", "
    { pattern: / &amp; /, splitAfter: true },       // HTML encoded & - split after
  ]

  for (const breakPoint of breakPoints) {
    const match = name.match(breakPoint.pattern)
    if (match && match.index !== undefined) {
      // Split after the break point (include it in the first line)
      const splitIndex = breakPoint.splitAfter 
        ? match.index + match[0].length  // Split after the break point
        : match.index                     // Split before the break point
      
      const line1 = name.substring(0, splitIndex).trim()
      const line2 = name.substring(splitIndex).trim()
      
      // Check if both lines are reasonable length (more lenient for very long names)
      // Allow lines up to maxChars + 15 for very long names, or if both lines are at least reasonable
      const maxAllowed = maxChars + 15 // More lenient for long names
      if (line1.length > 0 && line2.length > 0 && 
          (line1.length <= maxAllowed && line2.length <= maxAllowed) ||
          (line1.length <= maxChars * 1.5 && line2.length <= maxChars * 1.5)) {
        return { line1, line2, isTwoLines: true }
      }
    }
  }

  // If no natural break point, split at the middle space
  const words = name.split(/\s+/)
  if (words.length >= 2) {
    let line1 = ""
    let line2 = ""
    let midPoint = Math.ceil(words.length / 2)
    
    // Try to balance the lines
    for (let i = 0; i < words.length; i++) {
      if (i < midPoint) {
        line1 += (line1 ? " " : "") + words[i]
      } else {
        line2 += (line2 ? " " : "") + words[i]
      }
    }
    
    if (line1.length > 0 && line2.length > 0) {
      return { line1, line2, isTwoLines: true }
    }
  }

  // Fallback: split at character midpoint
  const midPoint = Math.floor(name.length / 2)
  // Try to find a space near the midpoint
  let splitIndex = midPoint
  for (let i = 0; i < 10; i++) {
    if (name[midPoint + i] === " ") {
      splitIndex = midPoint + i
      break
    }
    if (name[midPoint - i] === " ") {
      splitIndex = midPoint - i
      break
    }
  }
  
  return {
    line1: name.substring(0, splitIndex).trim(),
    line2: name.substring(splitIndex).trim(),
    isTwoLines: true
  }
}

// Calculate optimal font size based on name length
// Returns font size and whether name should be split into two lines
function calculateOptimalFontSize(name: string, imgWidth: number, baseFontSize: number = 80): { fontSize: number; shouldSplit: boolean } {
  const charCount = name.length
  const maxCharsForSingleLine = 30 // If 30+ characters, split into two lines
  
  // For very short names (1-10 chars), use smaller font to prevent encroachment
  if (charCount <= 10) {
    return { fontSize: Math.max(50, baseFontSize * 0.65), shouldSplit: false } // 50-52px for short names
  }
  
  // For medium names (11-29 chars), use moderate scaling
  if (charCount < maxCharsForSingleLine) {
    const scaleFactor = 1 - ((charCount - 10) / 19) * 0.2 // Scale down 0-20% based on length (11-29 range)
    return { fontSize: Math.floor(baseFontSize * scaleFactor), shouldSplit: false }
  }
  
  // For names 30+ characters, always try to split into two lines
  if (charCount >= maxCharsForSingleLine) {
    // If splitting, we can use a larger font size since each line will be shorter
    const splitResult = splitNameIntoLines(name, maxCharsForSingleLine)
    console.log(`[v0] Split attempt for "${name}" (${charCount} chars):`, splitResult)
    if (splitResult.isTwoLines) {
      // Use a good readable size for two-line names (around 60-65px)
      const twoLineFontSize = Math.max(55, baseFontSize * 0.75)
      return { fontSize: twoLineFontSize, shouldSplit: true }
    } else {
      // Force split even if natural break points didn't work - use word splitting
      console.log(`[v0] Natural split failed, forcing word-based split`)
      const words = name.split(/\s+/)
      if (words.length >= 2) {
        const midPoint = Math.ceil(words.length / 2)
        const line1 = words.slice(0, midPoint).join(' ')
        const line2 = words.slice(midPoint).join(' ')
        if (line1.length > 0 && line2.length > 0) {
          const twoLineFontSize = Math.max(55, baseFontSize * 0.75)
          return { fontSize: twoLineFontSize, shouldSplit: true }
        }
      }
    }
  }
  
  // Fallback: For names that couldn't be split, scale down moderately
  const maxWidth = imgWidth * 0.75 // 75% of image width max
  const estimatedWidth = charCount * (baseFontSize * 0.55) // Average char width estimate
  
  if (estimatedWidth <= maxWidth) {
    return { fontSize: baseFontSize * 0.8, shouldSplit: false } // 80% of base for medium-long names
  }
  
  // Scale down proportionally for very long names that can't be split
  const scaleFactor = maxWidth / estimatedWidth
  return { fontSize: Math.max(45, Math.floor(baseFontSize * 0.8 * scaleFactor)), shouldSplit: false } // Minimum 45px
}

// Calculate optimal text position for guest name at the very top
function calculateOptimalPosition(
  imgWidth: number,
  imgHeight: number,
  fontSize: number,
  name: string,
  isTwoLines: boolean = false,
): { x: number; y: number } {
  // Center horizontally
  const x = imgWidth / 2

  // Position in the top blank area, raised higher to avoid descenders (y, p, g) overlapping template text
  // Use a higher position (5-6% from top) to give more clearance for descenders
  const topArea = imgHeight * 0.05 // 5% from top - raised from 8% to avoid overlap
  
  // Adjust for font size - larger fonts need more space from top edge
  // Account for descenders in lowercase letters (y, p, g, q, j)
  let fontAdjustment = fontSize * 0.2 // Reduced adjustment to keep text higher
  
  // For two-line text, adjust position slightly higher to center both lines better
  if (isTwoLines) {
    fontAdjustment = fontSize * 0.15 // Even less adjustment for two lines
  }

  // Final Y position - well-positioned higher in the top area with clearance for descenders
  const y = topArea + fontAdjustment

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
  isTwoLines: boolean = false,
  line1?: string,
  line2?: string,
): Promise<Buffer> {
  const lineHeight = fontSize * 1.2 // Line spacing for two-line text
  let svg: string

  if (isTwoLines && line1 && line2) {
    // Two-line text using tspan elements
    const escapedLine1 = escapeSvg(line1)
    const escapedLine2 = escapeSvg(line2)
    
    svg = `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <text
          x="${x}"
          y="${y}"
          font-family="Didot, 'Bodoni MT', Garamond, 'Palatino Linotype', 'Book Antiqua', Georgia, 'Times New Roman', Times, serif"
          font-size="${fontSize}"
          font-weight="normal"
          fill="${color}"
          stroke="${strokeColor}"
          stroke-width="${strokeWidth}"
          stroke-linejoin="round"
          stroke-linecap="round"
          text-anchor="middle"
          dominant-baseline="hanging"
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
          font-family="Didot, 'Bodoni MT', Garamond, 'Palatino Linotype', 'Book Antiqua', Georgia, 'Times New Roman', Times, serif"
          font-size="${fontSize}"
          font-weight="normal"
          fill="${color}"
          stroke="${strokeColor}"
          stroke-width="${strokeWidth}"
          stroke-linejoin="round"
          stroke-linecap="round"
          text-anchor="middle"
          dominant-baseline="hanging"
        >${escapedText}</text>
      </svg>
    `.trim()
  }

  // Convert SVG to PNG buffer using Sharp
  return await sharp(Buffer.from(svg))
    .resize(width, height)
    .png()
    .toBuffer()
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
    const optimalFontSize = fontInfo.fontSize
    const shouldSplit = fontInfo.shouldSplit
    
    // Split name if needed
    let nameSplit = shouldSplit ? splitNameIntoLines(name, 30) : { line1: name, line2: "", isTwoLines: false }
    
    // If shouldSplit is true but split failed, force a word-based split
    if (shouldSplit && !nameSplit.isTwoLines && name.length >= 30) {
      console.log(`[v0] Bulk: Split failed, forcing word-based split for "${name}"`)
      const words = name.split(/\s+/)
      if (words.length >= 2) {
        const midPoint = Math.ceil(words.length / 2)
        nameSplit = {
          line1: words.slice(0, midPoint).join(' '),
          line2: words.slice(midPoint).join(' '),
          isTwoLines: true
        }
      }
    }
    
    console.log(`[v0] Bulk: "${name}" (${name.length} chars) - Base: ${fontSize}px, Optimal: ${optimalFontSize}px, TwoLines: ${shouldSplit}, SplitResult:`, nameSplit)
    
    // Calculate optimal position for this guest's name (auto-positioning by default)
    const position = calculateOptimalPosition(imgWidth, imgHeight, optimalFontSize, name, shouldSplit)
    const finalX = useCustomPosition ? (options.x ?? position.x) : position.x
    const finalY = useCustomPosition ? (options.y ?? position.y) : position.y

    // Create text overlay using SVG with optimal font size
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
      shouldSplit,
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

// Single preview function
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

    // Calculate optimal font size and check if name should be split into two lines
    const fontInfo = calculateOptimalFontSize(name, imgWidth, fontSize)
    finalFontSize = fontInfo.fontSize
    shouldSplit = fontInfo.shouldSplit
    
    // Split name if needed
    let nameSplit = shouldSplit ? splitNameIntoLines(name, 30) : { line1: name, line2: "", isTwoLines: false }
    
    // If shouldSplit is true but split failed, force a word-based split
    if (shouldSplit && !nameSplit.isTwoLines && name.length >= 30) {
      console.log(`[v0] Split failed, forcing word-based split for "${name}"`)
      const words = name.split(/\s+/)
      if (words.length >= 2) {
        const midPoint = Math.ceil(words.length / 2)
        nameSplit = {
          line1: words.slice(0, midPoint).join(' '),
          line2: words.slice(midPoint).join(' '),
          isTwoLines: true
        }
      }
    }
    
    console.log(`[v0] Preview: "${name}" (${name.length} chars) - Base: ${fontSize}px, Optimal: ${finalFontSize}px, TwoLines: ${shouldSplit}, SplitResult:`, nameSplit)

    if (autoPosition && (options.x === undefined || options.y === undefined)) {
      const position = calculateOptimalPosition(imgWidth, imgHeight, finalFontSize, name, shouldSplit)
      finalX = position.x
      finalY = position.y
    } else {
      finalX = options.x ?? imgWidth / 2
      finalY = options.y ?? imgHeight * 0.2
    }

    console.log("[v0] Text position:", finalX, finalY, "Font size:", finalFontSize, "Two lines:", shouldSplit)

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
      shouldSplit,
      nameSplit.line1,
      nameSplit.line2,
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
