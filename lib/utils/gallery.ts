// Gallery utility functions for Supabase Storage operations
// Handles file uploads, metadata management, and image optimization

import { createClient } from '@/utils/supabase/client'
import { createClient as createServerClient } from '@/utils/supabase/server'

export interface GalleryItem {
  id: string
  file_path: string
  caption: string | null
  uploader_email: string
  created_at: string
  file_url?: string
  file_type?: 'image' | 'video'
}

export interface UploadResult {
  success: boolean
  data?: GalleryItem
  error?: string
}

// Client-side upload function
export async function uploadGalleryFile(
  file: File,
  caption: string = '',
  uploaderEmail: string
): Promise<UploadResult> {
  try {
    const supabase = createClient()
    
    // Generate unique file path
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
    const filePath = `uploads/${fileName}`
    
    // Upload file to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('wedding-gallery')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })
    
    if (uploadError) {
      console.error('Upload error:', uploadError)
      return { success: false, error: uploadError.message }
    }
    
    // Insert metadata into gallery_items table
    const { data: insertData, error: insertError } = await supabase
      .from('gallery_items')
      .insert({
        file_path: filePath,
        caption: caption || null,
        uploader_email: uploaderEmail
      })
      .select()
      .single()
    
    if (insertError) {
      console.error('Database insert error:', insertError)
      return { success: false, error: insertError.message }
    }
    
    return { success: true, data: insertData }
  } catch (error) {
    console.error('Upload process error:', error)
    return { success: false, error: 'Upload failed. Please try again.' }
  }
}

// Get gallery items with optimized URLs
export async function getGalleryItems(): Promise<GalleryItem[]> {
  try {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('gallery_items')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching gallery items:', error)
      return []
    }
    
    // Add optimized URLs and file type detection
    const itemsWithUrls = await Promise.all(
      (data || []).map(async (item) => {
        const { data: urlData } = supabase.storage
          .from('wedding-gallery')
          .getPublicUrl(item.file_path)
        
        // Determine file type
        const fileExt = item.file_path.split('.').pop()?.toLowerCase()
        const isVideo = ['mp4', 'mov', 'avi', 'webm', 'mkv'].includes(fileExt || '')
        
        return {
          ...item,
          file_url: urlData.publicUrl,
          file_type: isVideo ? 'video' : 'image'
        }
      })
    )
    
    return itemsWithUrls
  } catch (error) {
    console.error('Error fetching gallery items:', error)
    return []
  }
}

// Get optimized image URL with transforms
export function getOptimizedImageUrl(filePath: string, width: number = 400): string {
  const supabase = createClient()
  const { data } = supabase.storage
    .from('wedding-gallery')
    .getPublicUrl(filePath)
  
  // Add Supabase image transform parameters
  return `${data.publicUrl}?width=${width}&quality=80&format=webp`
}

// Check if user is authenticated (has RSVP)
export async function checkUserAuth(email: string): Promise<boolean> {
  try {
    const supabase = createServerClient()
    
    const { data, error } = await supabase
      .from('rsvps')
      .select('email')
      .eq('email', email)
      .single()
    
    return !error && !!data
  } catch (error) {
    console.error('Auth check error:', error)
    return false
  }
}

// Delete gallery item (admin only)
export async function deleteGalleryItem(itemId: string): Promise<boolean> {
  try {
    const supabase = createClient()
    
    // First get the file path
    const { data: item, error: fetchError } = await supabase
      .from('gallery_items')
      .select('file_path')
      .eq('id', itemId)
      .single()
    
    if (fetchError || !item) {
      return false
    }
    
    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from('wedding-gallery')
      .remove([item.file_path])
    
    if (storageError) {
      console.error('Storage delete error:', storageError)
    }
    
    // Delete from database
    const { error: dbError } = await supabase
      .from('gallery_items')
      .delete()
      .eq('id', itemId)
    
    if (dbError) {
      console.error('Database delete error:', dbError)
      return false
    }
    
    return true
  } catch (error) {
    console.error('Delete error:', error)
    return false
  }
}
