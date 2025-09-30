"use server"

import { createClient } from "@/lib/supabase/server"

export async function uploadGalleryItem(formData: FormData) {
  try {
    const file = formData.get("file") as File
    const caption = formData.get("caption") as string
    const uploaderName = formData.get("uploaderName") as string

    if (!file) {
      return { success: false, error: "No file provided" }
    }

    // Convert file to base64
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64 = buffer.toString("base64")
    const mimeType = file.type

    // Create data URL to store in database
    const dataUrl = `data:${mimeType};base64,${base64}`

    const supabase = await createClient()

    const { data, error } = await supabase
      .from("gallery_items")
      .insert({
        file_path: dataUrl,
        caption: caption || null,
        uploader_name: uploaderName || "Anonymous",
      })
      .select()
      .single()

    if (error) {
      console.error("[v0] Database insert error:", error)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error) {
    console.error("[v0] Upload action error:", error)
    const errorMessage = error instanceof Error ? error.message : "Upload failed"
    return { success: false, error: errorMessage }
  }
}
