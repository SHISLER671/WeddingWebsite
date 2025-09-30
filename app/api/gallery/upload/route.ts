import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const caption = formData.get("caption") as string
    const uploaderName = formData.get("uploaderName") as string

    console.log("[v0] Upload API called with file:", file?.name, file?.type)

    if (!file) {
      return NextResponse.json({ success: false, error: "No file provided" }, { status: 400 })
    }

    const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("[v0] Missing Supabase configuration")
      return NextResponse.json({ success: false, error: "Server configuration error" }, { status: 500 })
    }

    // Generate unique file path
    const fileExt = file.name.split(".").pop()
    const uniqueFileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
    const filePath = `uploads/${uniqueFileName}`

    console.log("[v0] Generated file path:", filePath)

    // Convert file to array buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    console.log("[v0] Buffer created, size:", buffer.length)

    const storageUrl = `${supabaseUrl}/storage/v1/object/wedding-gallery/${filePath}`

    console.log("[v0] Uploading to storage URL")

    const uploadResponse = await fetch(storageUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${supabaseServiceKey}`,
        "Content-Type": file.type,
        "x-upsert": "false",
      },
      body: buffer,
    })

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text()
      console.error("[v0] Storage upload failed:", uploadResponse.status, errorText)
      return NextResponse.json(
        {
          success: false,
          error: `Storage upload failed: ${errorText}`,
        },
        { status: 500 },
      )
    }

    const uploadResult = await uploadResponse.json()
    console.log("[v0] File uploaded successfully:", uploadResult)

    const dbUrl = `${supabaseUrl}/rest/v1/gallery_items`

    console.log("[v0] Inserting into database")

    const dbResponse = await fetch(dbUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${supabaseServiceKey}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
        apikey: supabaseServiceKey,
      },
      body: JSON.stringify({
        file_path: filePath,
        caption: caption || null,
        uploader_name: uploaderName || "Anonymous",
      }),
    })

    if (!dbResponse.ok) {
      const errorText = await dbResponse.text()
      console.error("[v0] Database insert failed:", dbResponse.status, errorText)
      return NextResponse.json(
        {
          success: false,
          error: `Database insert failed: ${errorText}`,
        },
        { status: 500 },
      )
    }

    const dbData = await dbResponse.json()
    console.log("[v0] Database insert successful:", dbData)

    return NextResponse.json({ success: true, data: dbData[0] })
  } catch (error) {
    console.error("[v0] Upload process error:", error)
    const errorMessage = error instanceof Error ? error.message : "Upload failed"
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 })
  }
}
