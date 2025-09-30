"use server"

import { createClient } from "@supabase/supabase-js"

export interface UploadResult {
  success: boolean
  data?: {
    id: string
    file_path: string
    caption: string | null
    uploader_name: string
    created_at: string
  }
  error?: string
}

export async function uploadGalleryFileAction(
  fileData: string,
  fileName: string,
  fileType: string,
  caption: string,
  uploaderName: string,
): Promise<UploadResult> {
  try {
    console.log("[v0] Upload action called with:", { fileName, fileType, caption, uploaderName })

    if (!fileData) {
      return { success: false, error: "No file provided" }
    }

    const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    console.log("[v0] Environment check:", {
      hasUrl: !!supabaseUrl,
      hasServiceKey: !!supabaseServiceKey,
    })

    if (!supabaseUrl || !supabaseServiceKey) {
      return { success: false, error: "Server configuration error: Missing Supabase credentials" }
    }

    // Generate unique file path
    const fileExt = fileName.split(".").pop()
    const uniqueFileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
    const filePath = `uploads/${uniqueFileName}`

    console.log("[v0] Generated file path:", filePath)

    // Convert base64 to buffer
    const base64Data = fileData.split(",")[1]
    const buffer = Buffer.from(base64Data, "base64")

    console.log("[v0] Buffer created, size:", buffer.length)

    const uploadUrl = `${supabaseUrl}/storage/v1/object/wedding-gallery/${filePath}`

    console.log("[v0] Uploading to URL:", uploadUrl)

    const uploadResponse = await fetch(uploadUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${supabaseServiceKey}`,
        "Content-Type": fileType,
        "x-upsert": "false",
      },
      body: buffer,
    })

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text()
      console.error("[v0] Upload error:", errorText)
      return { success: false, error: `Upload failed: ${errorText}` }
    }

    const uploadResult = await uploadResponse.json()
    console.log("[v0] File uploaded successfully:", uploadResult)

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })

    console.log("[v0] Supabase client created for database operations")

    // Insert metadata into gallery_items table (bypasses RLS with service role)
    const { data: insertData, error: insertError } = await supabase
      .from("gallery_items")
      .insert({
        file_path: filePath,
        caption: caption || null,
        uploader_name: uploaderName || "Anonymous",
      })
      .select()
      .single()

    if (insertError) {
      console.error("[v0] Database insert error:", insertError)
      return { success: false, error: insertError.message }
    }

    console.log("[v0] Database record created:", insertData)

    return { success: true, data: insertData }
  } catch (error) {
    console.error("[v0] Upload process error:", error)
    const errorMessage = error instanceof Error ? error.message : "Upload failed. Please try again."
    return { success: false, error: errorMessage }
  }
}
