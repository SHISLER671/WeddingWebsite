import sharp from "sharp"
import Papa from "papaparse"
import JSZip from "jszip"
import { readFile } from "fs/promises"
import { join } from "path"
import { Canvas, registerFont } from "@napi-rs/canvas"

interface Guest {
  FullName: string
  [key: string]: string
}

function escapeSvg(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
}

// Calculate optimal text position for guest name at the very top
function calculateOptimalPosition(
  imgWidth: number,
  imgHeight: number,
  fontSize: number,
  name: string,
): { x: number; y: number } {
  // Center horizontally
  const x = imgWidth / 2

  // Position at the very top of the image (top 10-15% area)
  // This is the blank space above the invitation text
  const topArea = imgHeight * 0.12 // 12% from top

  // Adjust slightly for font size (larger fonts need more space from top)
  const fontAdjustment = fontSize * 0.3

  // Final Y position - at the top blank space
  const y = topArea + fontAdjustment

  return { x, y }
}

// Load template from public folder
async function loadTemplate(): Promise<Buffer> {
  try {
    const templatePath = join(process.cwd(), "public", "invitetemplate.jpg")
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

// Register Tan Pearl font with @napi-rs/canvas
let fontRegistered = false
async function registerTanPearlFont(): Promise<boolean> {
  if (fontRegistered) return true

  try {
    // Try different possible font file names and locations
    const possiblePaths = [
      join(process.cwd(), "public", "fonts", "TanPearl.ttf"),
      join(process.cwd(), "public", "fonts", "TanPearl.otf"),
      join(process.cwd(), "public", "fonts", "tan-pearl.ttf"),
      join(process.cwd(), "public", "fonts", "tan-pearl.otf"),
      join(process.cwd(), "public", "fonts", "Tan Pearl.ttf"),
      join(process.cwd(), "public", "fonts", "Tan Pearl.otf"),
    ]

    for (const fontPath of possiblePaths) {
      try {
        registerFont(fontPath, { family: "Tan Pearl" })
        console.log("[v0] Successfully registered Tan Pearl font from:", fontPath)
        fontRegistered = true
        return true
      } catch (error) {
        // Try next path
        continue
      }
    }

    console.warn("[v0] Tan Pearl font file not found, will use fallback fonts")
    return false
  } catch (error) {
    console.warn("[v0] Error registering Tan Pearl font:", error)
    return false
  }
}

// Create text overlay using @napi-rs/canvas
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
): Promise<Buffer> {
  const canvas = new Canvas(width, height)
  const ctx = canvas.getContext("2d")

  // Set up text rendering
  ctx.textAlign = "center"
  ctx.textBaseline = "top"
  ctx.font = `${fontSize}px "Tan Pearl", "Times New Roman", serif`
  ctx.fillStyle = color
  ctx.strokeStyle = strokeColor
  ctx.lineWidth = strokeWidth
  ctx.lineJoin = "round"
  ctx.lineCap = "round"

  // Draw text with stroke (outline) first, then fill
  ctx.strokeText(text, x, y)
  ctx.fillText(text, x, y)

  return canvas.toBuffer("image/png")
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
    color = "#7B4B7A", // Medium purple/plum to match invitation text color
    strokeColor = "#4a1c1c",
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

  // Register Tan Pearl font with canvas
  await registerTanPearlFont()

  const zip = new JSZip()

  for (const guest of normalizedGuests) {
    const name = guest.FullName?.trim()
    if (!name) continue

    // Calculate optimal position for this guest's name (auto-positioning by default)
    const position = calculateOptimalPosition(imgWidth, imgHeight, fontSize, name)
    const finalX = useCustomPosition ? (options.x ?? position.x) : position.x
    const finalY = useCustomPosition ? (options.y ?? position.y) : position.y

    // Create text overlay using canvas
    const textOverlay = await createTextOverlay(
      name,
      imgWidth,
      imgHeight,
      finalX,
      finalY,
      fontSize,
      color,
      strokeColor,
      strokeWidth,
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
      color = "#7B4B7A", // Medium purple/plum to match invitation text color
      strokeColor = "#4a1c1c",
      strokeWidth = 4,
      font = "serif",
      autoPosition = true,
    } = options

    const templateBuffer = await loadTemplate()
    console.log("[v0] Creating sharp instance")
    const baseImage = sharp(templateBuffer)

    console.log("[v0] Getting metadata")
    const metadata = await baseImage.metadata()
    const imgWidth = metadata.width || 1200
    const imgHeight = metadata.height || 1600
    console.log("[v0] Image dimensions:", imgWidth, "x", imgHeight)

    // Register Tan Pearl font with canvas
    await registerTanPearlFont()

    // Calculate optimal position if auto-positioning is enabled
    let finalX: number
    let finalY: number

    if (autoPosition && (options.x === undefined || options.y === undefined)) {
      const position = calculateOptimalPosition(imgWidth, imgHeight, fontSize, name)
      finalX = position.x
      finalY = position.y
      console.log("[v0] Auto-positioned at:", finalX, finalY)
    } else {
      finalX = options.x ?? imgWidth / 2
      finalY = options.y ?? imgHeight * 0.2
      console.log("[v0] Manual position at:", finalX, finalY)
    }

    console.log("[v0] Creating canvas text overlay")
    const textOverlay = await createTextOverlay(
      name,
      imgWidth,
      imgHeight,
      finalX,
      finalY,
      fontSize,
      color,
      strokeColor,
      strokeWidth,
    )

    console.log("[v0] Compositing image with text overlay")
    const result = await baseImage
      .composite([{ input: textOverlay, top: 0, left: 0 }])
      .jpeg({ quality: 92 })
      .toBuffer()

    console.log("[v0] Image generated successfully, size:", result.length)
    return result
  } catch (error) {
    console.error("[v0] Error in generatePreview:", error)
    if (error instanceof Error) {
      console.error("[v0] Error details:", error.message, error.stack)
    }
    throw error
  }
}
