import { type NextRequest, NextResponse } from "next/server"
import { generatePreview } from "@/lib/invite-generator"

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] Preview API route called")
    const formData = await request.formData()
    const previewName = (formData.get("previewName") as string) || "Mr. & Mrs. Smith"

    console.log("[v0] Preview name received:", previewName)

    // All settings are preset - only name is needed
    const options = {
      fontSize: 80,
      color: "#D4AF37",
      strokeColor: "#4a1c1c",
      strokeWidth: 4,
      font: "serif",
      autoPosition: true,
    }

    console.log("[v0] Generating preview with options:", options)

    let previewBuffer: Buffer
    try {
      previewBuffer = await generatePreview(previewName, options)
      console.log("[v0] Preview generated successfully, buffer size:", previewBuffer.length)
    } catch (genError) {
      console.error("[v0] Error in generatePreview function:", genError)
      if (genError instanceof Error) {
        console.error("[v0] Error stack:", genError.stack)
      }
      throw genError
    }

    return new NextResponse(previewBuffer, {
      headers: {
        "Content-Type": "image/jpeg",
        "Cache-Control": "no-store",
      },
    })
  } catch (error) {
    console.error("[v0] Preview generation error:", error)
    if (error instanceof Error) {
      console.error("[v0] Error message:", error.message)
      console.error("[v0] Error stack:", error.stack)

      // Return JSON response with detailed error
      return NextResponse.json(
        {
          error: "Preview generation failed",
          details: error.message,
          stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
        },
        { status: 500 },
      )
    }

    return NextResponse.json({ error: "Unknown error occurred" }, { status: 500 })
  }
}
