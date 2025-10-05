// Wedding Gallery Page
// Displays uploaded photos and videos in a responsive grid

"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { Heart, Upload, Camera, Video, X, CheckCircle, AlertCircle, ArrowLeft } from "lucide-react"
import { getGalleryItems, type GalleryItem } from "@/lib/utils/gallery"
import { uploadGalleryItem } from "@/app/actions/upload-gallery-item"
import Link from "next/link"
import { SpinningRoseLoader } from "@/components/spinning-rose-loader"

export default function GalleryPage() {
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [showUploadForm, setShowUploadForm] = useState(false)
  const [uploadName, setUploadName] = useState("")
  const [uploadCaption, setUploadCaption] = useState("")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadStatus, setUploadStatus] = useState<"idle" | "success" | "error">("idle")
  const [uploadMessage, setUploadMessage] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [displayedItems, setDisplayedItems] = useState<GalleryItem[]>([])
  const [itemsToShow, setItemsToShow] = useState(12)
  const [hasMore, setHasMore] = useState(false)

  useEffect(() => {
    loadGalleryItems()
  }, [])

  useEffect(() => {
    setDisplayedItems(galleryItems.slice(0, itemsToShow))
    setHasMore(galleryItems.length > itemsToShow)
  }, [galleryItems, itemsToShow])

  const loadGalleryItems = async () => {
    try {
      setLoading(true)
      const items = await getGalleryItems()
      setGalleryItems(items)
    } catch (error) {
      console.error("Error loading gallery:", error)
    } finally {
      setLoading(false)
    }
  }

  const loadMore = () => {
    setItemsToShow((prev) => prev + 12)
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const fileType = file.type
      const isImage = fileType.startsWith("image/")
      const isVideo = fileType.startsWith("video/")

      if (!isImage && !isVideo) {
        setUploadStatus("error")
        setUploadMessage("Please select an image or video file")
        return
      }

      if (file.size > 10 * 1024 * 1024) {
        setUploadStatus("error")
        setUploadMessage("File size must be less than 10MB")
        return
      }

      setSelectedFile(file)
      setUploadStatus("idle")
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) {
      setUploadStatus("error")
      setUploadMessage("Please select a file to upload")
      return
    }

    try {
      setUploading(true)
      setUploadStatus("idle")

      const formData = new FormData()
      formData.append("file", selectedFile)
      formData.append("caption", uploadCaption)
      formData.append("uploaderName", uploadName || "Anonymous")

      console.log("[v0] Uploading file with Server Action")

      const result = await uploadGalleryItem(formData)

      console.log("[v0] Server Action result:", result)

      if (result.success) {
        setUploadStatus("success")
        setUploadMessage("Upload successful! Your photo/video will appear in the gallery shortly.")
        setSelectedFile(null)
        setUploadCaption("")
        setUploadName("")
        setShowUploadForm(false)
        await loadGalleryItems()
      } else {
        setUploadStatus("error")
        setUploadMessage(result.error || "Upload failed. Please try again.")
      }
    } catch (error) {
      console.error("Upload error:", error)
      setUploadStatus("error")
      setUploadMessage("Upload failed. Please try again.")
    } finally {
      setUploading(false)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) {
      const event = {
        target: { files: [file] },
      } as React.ChangeEvent<HTMLInputElement>
      handleFileSelect(event)
    }
  }

  const renderMediaItem = (item: GalleryItem) => {
    if (item.file_type === "video") {
      return (
        <video
          controls
          className="w-full h-full object-cover rounded-lg"
          poster={item.file_url}
          preload="metadata"
          playsInline
          webkit-playsinline="true"
        >
          <source src={item.file_url} type="video/mp4" />
          <source src={item.file_url} type="video/webm" />
          Your browser does not support the video tag.
        </video>
      )
    } else {
      return (
        <Image
          src={item.file_url || ""}
          alt={item.caption || "Wedding memory"}
          fill
          className="object-cover rounded-lg"
          sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
          loading="lazy"
        />
      )
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-soft-blush via-warm-white to-rose-gold/20 relative">
      <div className="fixed inset-0 z-0">
        <Image
          src="/romantic-wedding-background-with-soft-florals.jpg"
          alt="Wedding background"
          fill
          className="object-cover opacity-30"
          priority
        />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="text-center py-16 px-4">
          <div className="max-w-4xl mx-auto">
            {/* Back Button */}
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-charcoal/70 hover:text-charcoal mb-6 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Home</span>
            </Link>

            <h1 className="text-4xl md:text-6xl font-light text-charcoal mb-4 tracking-wide">Wedding Memories</h1>
            <p className="text-xl md:text-2xl text-charcoal/80 font-light mb-8">
              Share your favorite moments from our special day
            </p>

            {/* Upload Button */}
            <button
              onClick={() => setShowUploadForm(true)}
              className="bg-jewel-sapphire hover:bg-jewel-emerald text-white px-8 py-4 text-lg font-medium rounded-full transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-3 mx-auto"
            >
              <Camera className="w-5 h-5" />
              Share a Memory
            </button>
          </div>
        </div>

        {/* Upload Form Modal */}
        {showUploadForm && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 overflow-y-auto">
            {/* Background Image Layer - now inside the modal container */}
            <div className="relative rounded-2xl shadow-2xl max-w-md w-full my-4 max-h-[90vh] overflow-hidden">
              <div className="absolute inset-0 z-0">
                <Image src="/underleaf.jpg" alt="Floral background" fill className="object-cover" priority />
                {/* Overlay for readability */}
                <div className="absolute inset-0 bg-warm-white/85 backdrop-blur-md" />
              </div>

              {/* Content Layer - now with transparent background */}
              <div className="relative z-10 p-4 sm:p-6 overflow-y-auto max-h-[90vh]">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-semibold text-charcoal">Share a Memory</h3>
                  <button
                    onClick={() => setShowUploadForm(false)}
                    className="p-2 hover:bg-white/50 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Upload Area */}
                <div
                  className="border-2 border-dashed border-rose-gold/50 rounded-lg p-4 sm:p-8 text-center mb-4 cursor-pointer hover:border-rose-gold transition-colors touch-manipulation bg-white/70 backdrop-blur-sm"
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,video/*"
                    onChange={handleFileSelect}
                    className="hidden"
                    capture="environment"
                  />

                  {selectedFile ? (
                    <div className="space-y-2">
                      <CheckCircle className="w-12 h-12 text-jewel-emerald mx-auto" />
                      <p className="text-charcoal font-medium">{selectedFile.name}</p>
                      <p className="text-sm text-charcoal/60">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                      {!uploadCaption && (
                        <p className="text-xs text-rose-gold/80 flex items-center justify-center gap-1">
                          💡 Add a caption below to share your memory!
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload className="w-12 h-12 text-rose-gold mx-auto" />
                      <p className="text-charcoal font-medium">Click or drag to upload</p>
                      <p className="text-sm text-charcoal/60">Images and videos up to 10MB</p>
                      <p className="text-xs text-rose-gold/80 flex items-center justify-center gap-1">
                        💬 Don't forget to add a caption!
                      </p>
                    </div>
                  )}
                </div>

                {/* Name Input */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-charcoal mb-2">
                    <span className="flex items-center gap-2">
                      👤 Your Name
                      <span className="text-xs text-charcoal/60 font-normal">(optional)</span>
                    </span>
                  </label>
                  <input
                    type="text"
                    value={uploadName}
                    onChange={(e) => setUploadName(e.target.value)}
                    placeholder="Enter your name or leave blank for anonymous"
                    className="w-full px-3 py-2 border border-rose-gold/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-gold/50 text-base bg-white/80 backdrop-blur-sm"
                  />
                </div>

                {/* Caption Input */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-charcoal mb-2">
                    <span className="flex items-center gap-2">
                      💬 Add a Caption
                      <span className="text-xs text-charcoal/60 font-normal">(optional)</span>
                    </span>
                  </label>
                  <textarea
                    value={uploadCaption}
                    onChange={(e) => setUploadCaption(e.target.value)}
                    placeholder="Share a memory, quote, or special moment... ✨"
                    rows={3}
                    maxLength={200}
                    className="w-full px-3 py-2 border border-rose-gold/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-gold/50 resize-none text-base placeholder:text-charcoal/50 bg-white/80 backdrop-blur-sm"
                  />
                  <div className="flex justify-between items-center mt-1">
                    <p className="text-xs text-charcoal/60">Add a friendly comment or quote to your memory</p>
                    <span className="text-xs text-charcoal/40">{uploadCaption.length}/200</span>
                  </div>
                </div>

                {/* Status Message */}
                {uploadStatus !== "idle" && (
                  <div
                    className={`mb-4 p-3 rounded-lg flex items-center gap-2 ${
                      uploadStatus === "success"
                        ? "bg-green-50 text-green-700 border border-green-200"
                        : "bg-red-50 text-red-700 border border-red-200"
                    }`}
                  >
                    {uploadStatus === "success" ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      <AlertCircle className="w-4 h-4" />
                    )}
                    <span className="text-sm">{uploadMessage}</span>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => setShowUploadForm(false)}
                    className="flex-1 px-4 py-3 border border-rose-gold text-rose-gold rounded-lg hover:bg-rose-gold/10 transition-colors touch-manipulation"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpload}
                    disabled={uploading || !selectedFile}
                    className="flex-1 px-4 py-3 bg-jewel-sapphire text-white rounded-lg hover:bg-jewel-emerald disabled:opacity-50 disabled:cursor-not-allowed transition-colors touch-manipulation"
                  >
                    {uploading ? "Uploading..." : "Upload"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Gallery Grid */}
        <div className="max-w-7xl mx-auto px-4 pb-16">
          {loading ? (
            <div className="text-center py-16">
              <SpinningRoseLoader size="lg" />
              <p className="text-charcoal/60 mt-6">Loading memories...</p>
            </div>
          ) : galleryItems.length === 0 ? (
            <div className="text-center py-16">
              <Heart className="w-16 h-16 text-rose-gold/50 mx-auto mb-4" />
              <h3 className="text-2xl font-semibold text-charcoal mb-2">No memories yet</h3>
              <p className="text-charcoal/60 mb-6">Be the first to share a special moment!</p>
              <button
                onClick={() => setShowUploadForm(true)}
                className="bg-jewel-sapphire hover:bg-jewel-emerald text-white px-6 py-3 rounded-full transition-all duration-300"
              >
                Share a Memory
              </button>
            </div>
          ) : (
            <>
              <div className="text-center mb-6">
                <p className="text-charcoal/60">
                  Showing {displayedItems.length} of {galleryItems.length} memories
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {displayedItems.map((item) => (
                  <div
                    key={item.id}
                    className="group relative bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 touch-manipulation flex flex-col"
                  >
                    <div className="relative aspect-square overflow-hidden">
                      {renderMediaItem(item)}

                      {/* File Type Indicator */}
                      <div className="absolute top-2 right-2">
                        {item.file_type === "video" ? (
                          <Video className="w-4 h-4 text-white drop-shadow-lg" />
                        ) : (
                          <Camera className="w-4 h-4 text-white drop-shadow-lg" />
                        )}
                      </div>
                    </div>

                    <div className="p-3 sm:p-4 bg-gradient-to-b from-warm-white to-soft-blush/30">
                      {item.uploader_name && (
                        <div className="mb-2">
                          <p className="text-sm font-semibold text-charcoal flex items-center gap-1.5">
                            <span className="text-rose-gold">📸</span>
                            {item.uploader_name}
                          </p>
                        </div>
                      )}
                      {item.caption && (
                        <div className="mb-2">
                          <p className="text-sm text-charcoal/80 line-clamp-3 italic">"{item.caption}"</p>
                        </div>
                      )}
                      <div className="flex items-center justify-between text-xs text-charcoal/60 pt-2 border-t border-rose-gold/20">
                        <p>{new Date(item.created_at).toLocaleDateString()}</p>
                        {item.caption && <span className="text-rose-gold">💬</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Load More Button */}
              {hasMore && (
                <div className="text-center mt-12">
                  <button
                    onClick={loadMore}
                    className="bg-jewel-sapphire hover:bg-jewel-emerald text-white px-8 py-4 text-lg font-medium rounded-full transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    Load More Memories
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
