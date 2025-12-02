"use server"

import { createClient } from "@/lib/supabase/server"

/**
 * Server Action: Update Gallery Item Caption
 * Allows guests to edit the caption of their own posts
 */
export async function updateGalleryItemCaption(itemId: string, caption: string, uploaderName: string) {
  try {
    const supabase = await createClient()

    // First verify the item exists and belongs to the uploader
    const { data: item, error: fetchError } = await supabase
      .from("gallery_items")
      .select("uploader_name")
      .eq("id", itemId)
      .single()

    if (fetchError || !item) {
      return { success: false, error: "Item not found" }
    }

    // Verify ownership (case-insensitive comparison)
    if (item.uploader_name.toLowerCase() !== uploaderName.toLowerCase()) {
      return { success: false, error: "You can only edit your own posts" }
    }

    // Update the caption
    const { data, error } = await supabase
      .from("gallery_items")
      .update({ caption: caption || null })
      .eq("id", itemId)
      .select()
      .single()

    if (error) {
      console.error("[v0] Update error:", error)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error) {
    console.error("[v0] Update action error:", error)
    const errorMessage = error instanceof Error ? error.message : "Update failed"
    return { success: false, error: errorMessage }
  }
}

/**
 * Server Action: Delete Gallery Item
 * Allows guests to delete their own posts
 */
export async function deleteGalleryItem(itemId: string, uploaderName: string) {
  try {
    const supabase = await createClient()

    // First verify the item exists and belongs to the uploader
    const { data: item, error: fetchError } = await supabase
      .from("gallery_items")
      .select("uploader_name, file_path")
      .eq("id", itemId)
      .single()

    if (fetchError || !item) {
      return { success: false, error: "Item not found" }
    }

    // Verify ownership (case-insensitive comparison)
    if (item.uploader_name.toLowerCase() !== uploaderName.toLowerCase()) {
      return { success: false, error: "You can only delete your own posts" }
    }

    // Delete from database (file_path is stored as data URL, so no storage cleanup needed)
    const { error: deleteError } = await supabase
      .from("gallery_items")
      .delete()
      .eq("id", itemId)

    if (deleteError) {
      console.error("[v0] Delete error:", deleteError)
      return { success: false, error: deleteError.message }
    }

    return { success: true }
  } catch (error) {
    console.error("[v0] Delete action error:", error)
    const errorMessage = error instanceof Error ? error.message : "Delete failed"
    return { success: false, error: errorMessage }
  }
}

