"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Download } from "lucide-react"

export default function LivePreviewForm() {
  const searchParams = useSearchParams()
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [imageLoaded, setImageLoaded] = useState(false)
  const templateImageRef = useRef<HTMLImageElement | null>(null)

  const guestNameFromUrl = searchParams.get("guest")
  const defaultName = guestNameFromUrl ? decodeURIComponent(guestNameFromUrl) : "Alexandra & Benjamin"

  const [previewName, setPreviewName] = useState(defaultName)

  useEffect(() => {
    const img = new Image()
    img.crossOrigin = "anonymous"
    img.src = "/tenthtemplate.jpg"
    img.onload = () => {
      templateImageRef.current = img
      setImageLoaded(true)
    }
    img.onerror = (e) => {
      console.error("[v0] Failed to load template image:", e)
    }
  }, [])

  const calculateFontSize = (name: string, imageWidth: number): number => {
    const SAFE_ZONE_HEIGHT = imageWidth * 0.13 // 13% of canvas height for safe zone
    const charCount = name.length

    // Split long names at 28+ characters
    if (charCount >= 28) {
      // Two-line sizing: ensure total height fits in safe zone
      const maxTwoLineFontSize = SAFE_ZONE_HEIGHT / 2.6 // Account for 2 lines + spacing
      const widthBasedSize = (imageWidth * 0.9) / (Math.max(name.length / 2, 15) * 0.6)
      return Math.floor(Math.min(maxTwoLineFontSize, widthBasedSize, 70))
    }

    // Single-line sizing: ensure it fits width and height
    const maxSingleLineFontSize = SAFE_ZONE_HEIGHT / 1.5
    const widthBasedSize = (imageWidth * 0.9) / (charCount * 0.6)

    return Math.floor(Math.min(maxSingleLineFontSize, widthBasedSize, 90))
  }

  const splitName = (name: string): { line1: string; line2: string; shouldSplit: boolean } => {
    if (name.length < 26) {
      return { line1: name, line2: "", shouldSplit: false }
    }

    // Try natural break points BEFORE conjunctions
    const patterns = [
      { regex: / & /, splitBefore: true },
      { regex: / and /i, splitBefore: true },
      { regex: /, /, splitBefore: false },
    ]

    for (const { regex, splitBefore } of patterns) {
      const match = name.match(regex)
      if (match && match.index !== undefined) {
        const splitIndex = splitBefore ? match.index : match.index + match[0].length
        const line1 = name.substring(0, splitIndex).trim()
        const line2 = name.substring(splitIndex).trim()
        if (line1.length > 5 && line2.length > 5) {
          return { line1, line2, shouldSplit: true }
        }
      }
    }

    // Word-based split
    const words = name.split(/\s+/)
    if (words.length >= 2) {
      const midPoint = Math.ceil(words.length / 2)
      const line1 = words.slice(0, midPoint).join(" ")
      const line2 = words.slice(midPoint).join(" ")
      return { line1, line2, shouldSplit: true }
    }

    return { line1: name, line2: "", shouldSplit: false }
  }

  const loadPreview = async (name: string) => {
    if (!canvasRef.current || !templateImageRef.current) {
      return
    }

    setIsLoading(true)

    try {
      const canvas = canvasRef.current
      const ctx = canvas.getContext("2d")
      if (!ctx) throw new Error("Canvas context not available")

      const img = templateImageRef.current

      canvas.width = img.width
      canvas.height = img.height

      ctx.drawImage(img, 0, 0)

      const textX = img.width / 2
      const fontSize = calculateFontSize(name, img.width)
      const nameSplit = splitName(name)

      const SAFE_ZONE_START = img.height * 0.03 // 3% from top
      const SAFE_ZONE_END = img.height * 0.14 // 14% from top (was 13%)
      const SAFE_ZONE_HEIGHT = SAFE_ZONE_END - SAFE_ZONE_START

      console.log("[v0] === INVITATION RENDERING ===")
      console.log("[v0] Canvas dimensions:", img.width, "x", img.height)
      console.log("[v0] Guest name:", name)
      console.log("[v0] Name length:", name.length)
      console.log("[v0] Split into two lines:", nameSplit.shouldSplit)
      if (nameSplit.shouldSplit) {
        console.log("[v0] Line 1:", nameSplit.line1, "length:", nameSplit.line1.length)
        console.log("[v0] Line 2:", nameSplit.line2, "length:", nameSplit.line2.length)
      }
      console.log("[v0] Font size:", fontSize)
      console.log("[v0] Safe zone:", SAFE_ZONE_START, "to", SAFE_ZONE_END, "height:", SAFE_ZONE_HEIGHT)

      let baseY: number

      if (nameSplit.shouldSplit) {
        // Two lines: calculate total height and center in safe zone
        const lineHeight = fontSize * 1.15
        const totalHeight = fontSize + lineHeight
        baseY = SAFE_ZONE_START + (SAFE_ZONE_HEIGHT - totalHeight) / 2

        console.log("[v0] Two-line mode - Line height:", lineHeight, "Total height:", totalHeight)
        console.log("[v0] Base Y position:", baseY)
        console.log("[v0] Line 1 Y:", baseY)
        console.log("[v0] Line 2 Y:", baseY + lineHeight)
        console.log("[v0] Bottom of text:", baseY + lineHeight + fontSize)
      } else {
        // Single line: center in safe zone
        baseY = SAFE_ZONE_START + (SAFE_ZONE_HEIGHT - fontSize) / 2

        console.log("[v0] Single-line mode")
        console.log("[v0] Base Y position:", baseY)
        console.log("[v0] Bottom of text:", baseY + fontSize)
      }

      console.log("[v0] Safe zone end:", SAFE_ZONE_END)
      console.log(
        "[v0] Text fits in safe zone:",
        nameSplit.shouldSplit ? baseY + fontSize * 2.15 < SAFE_ZONE_END : baseY + fontSize < SAFE_ZONE_END,
      )

      // Use elegant serif font stack
      ctx.font = `${fontSize}px "Didot", "Bodoni MT", "Garamond", "Palatino Linotype", "Book Antiqua", Georgia, "Times New Roman", Times, serif`
      ctx.fillStyle = "#7B4B7A"
      ctx.textAlign = "center"
      ctx.textBaseline = "hanging"

      ctx.shadowColor = "rgba(0, 0, 0, 0.3)"
      ctx.shadowBlur = 10
      ctx.shadowOffsetX = 2
      ctx.shadowOffsetY = 2

      if (nameSplit.shouldSplit) {
        // Render two lines with proper spacing
        const lineHeight = fontSize * 1.15
        ctx.fillText(nameSplit.line1, textX, baseY)
        ctx.fillText(nameSplit.line2, textX, baseY + lineHeight)
      } else {
        // Render single line
        ctx.fillText(name, textX, baseY)
      }

      canvas.toBlob(
        (blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob)
            setPreviewUrl((prev) => {
              if (prev) URL.revokeObjectURL(prev)
              return url
            })
          }
        },
        "image/jpeg",
        0.95,
      )
    } catch (error) {
      console.error("[v0] Error generating preview:", error)
      alert(`Error: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setIsLoading(false)
    }
  }

  const downloadPreview = () => {
    if (!canvasRef.current) {
      alert("No preview available to download")
      return
    }

    canvasRef.current.toBlob(
      (blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob)
          const link = document.createElement("a")
          link.href = url
          const safeName = previewName.replace(/[^a-zA-Z0-9\- ]/g, "_").slice(0, 50)
          link.download = `invitation-${safeName}.jpg`
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          URL.revokeObjectURL(url)
        }
      },
      "image/jpeg",
      0.95,
    )
  }

  useEffect(() => {
    const currentName = guestNameFromUrl ? decodeURIComponent(guestNameFromUrl) : defaultName

    if (guestNameFromUrl) {
      setPreviewName(currentName)
    }

    if (imageLoaded) {
      loadPreview(currentName)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [guestNameFromUrl, imageLoaded])

  async function updatePreview(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    await loadPreview(previewName)
  }

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-xl p-8 mb-8">
      <h2 className="text-2xl font-semibold mb-6 text-jewel-burgundy">Live Preview</h2>

      <canvas ref={canvasRef} className="hidden" />

      <form onSubmit={updatePreview} className="grid lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="p-4 bg-jewel-gold/10 rounded-lg border border-jewel-gold/20">
            <p className="text-sm text-jewel-burgundy mb-2">
              <strong>Template:</strong> Using <code>tenthtemplate.jpg</code> from public folder
            </p>
            <p className="text-sm text-jewel-burgundy">
              <strong>Settings:</strong> All styling and positioning are automatic and preset
            </p>
          </div>

          <div>
            <Label htmlFor="previewName">Guest Name</Label>
            <Input
              name="previewName"
              id="previewName"
              value={previewName}
              onChange={(e) => setPreviewName(e.target.value)}
              placeholder="Enter guest name"
              className="text-lg"
            />
            <p className="text-sm text-gray-600 mt-2">Enter the guest name to preview on the invitation</p>
          </div>

          <Button
            type="submit"
            disabled={isLoading || !imageLoaded}
            className="w-full bg-jewel-burgundy hover:bg-jewel-crimson text-lg py-6"
          >
            {isLoading ? "Generating Preview..." : "Update Preview"}
          </Button>

          <Button
            type="button"
            onClick={downloadPreview}
            disabled={!previewUrl || isLoading}
            variant="outline"
            className="w-full border-jewel-burgundy text-jewel-burgundy hover:bg-jewel-burgundy/10 text-lg py-6 bg-transparent"
          >
            <Download className="mr-2 h-5 w-5" />
            Download This Invitation
          </Button>
        </div>

        <div className="flex items-center justify-center bg-gray-100 rounded-lg overflow-hidden min-h-[400px]">
          {previewUrl ? (
            <img src={previewUrl || "/placeholder.svg"} alt="Live preview" className="max-w-full h-auto" />
          ) : (
            <p className="text-gray-500">
              {imageLoaded ? "Enter a name and click Update Preview" : "Loading template..."}
            </p>
          )}
        </div>
      </form>
    </div>
  )
}
