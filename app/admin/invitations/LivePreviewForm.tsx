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
    img.src = "/invitetemplate.jpg"
    img.onload = () => {
      templateImageRef.current = img
      setImageLoaded(true)
    }
    img.onerror = (e) => {
      console.error("[v0] Failed to load template image:", e)
    }
  }, [])

  const calculateFontSize = (name: string, imageWidth: number): number => {
    const baseSize = 120
    const maxWidth = imageWidth * 0.85 // 85% of image width

    // Estimate text width (rough approximation)
    const charCount = name.length
    const estimatedWidth = charCount * (baseSize * 0.6) // ~0.6 is average char width ratio

    if (estimatedWidth <= maxWidth) {
      return baseSize
    }

    // Scale down proportionally
    const scaleFactor = maxWidth / estimatedWidth
    return Math.floor(baseSize * scaleFactor)
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

      const textY = img.height * 0.12
      const textX = img.width / 2
      const fontSize = calculateFontSize(name, img.width)

      ctx.font = `${fontSize}px serif`
      ctx.fillStyle = "#722F37"
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"

      ctx.shadowColor = "rgba(0, 0, 0, 0.3)"
      ctx.shadowBlur = 10
      ctx.shadowOffsetX = 2
      ctx.shadowOffsetY = 2

      ctx.fillText(name, textX, textY)

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
              <strong>Template:</strong> Using <code>invitetemplate.jpg</code> from public folder
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
