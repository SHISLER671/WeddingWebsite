import { type NextRequest, NextResponse } from "next/server"
import { generatePersonalizedInvites } from "@/lib/invite-generator"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const csvFile = formData.get("csv") as File | null

    // Use master list if no CSV file is uploaded
    const useMasterList = !csvFile || csvFile.size === 0

    // All settings are preset
    const options = {
      fontSize: 80,
      color: "#7B4B7A", // Medium purple/plum to match invitation text color
      strokeColor: "#4a1c1c",
      strokeWidth: 4,
      font: "serif",
      useMasterList: useMasterList,
    }

    console.log("[v0] Generating bulk invites with options:", {
      ...options,
      csvFile: csvFile ? csvFile.name : "using master list",
    })
    const zipBuffer = await generatePersonalizedInvites(csvFile, options)
    console.log("[v0] Generated ZIP buffer, size:", zipBuffer.length)

    return new NextResponse(zipBuffer, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": "attachment; filename=personalized-wedding-invitations.zip",
      },
    })
  } catch (error) {
    console.error("[v0] Bulk generation error:", error)
    const errorMessage = error instanceof Error ? error.message : "Bulk generation failed"
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
