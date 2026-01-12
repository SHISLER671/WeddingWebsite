"use client"

import { useMusic } from "@/contexts/MusicContext"

import type React from "react"
import { useState, useEffect, useRef, useCallback } from "react"
import Image from "next/image"
import {
  Heart,
  Upload,
  Camera,
  Video,
  X,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Grid3x3,
  Maximize2,
  Edit,
  Trash2,
} from "lucide-react"
import { getGalleryItems, type GalleryItem } from "@/lib/utils/gallery"
import { uploadGalleryItem } from "@/app/actions/upload-gallery-item"
import { updateGalleryItemCaption, deleteGalleryItem } from "@/app/actions/gallery-edit"
import Link from "next/link"
import { SpinningRoseLoader } from "@/components/spinning-rose-loader"
import useEmblaCarousel from "embla-carousel-react"

type ViewMode = "carousel" | "grid"

export default function GalleryPage() {
  const { currentTrack } = useMusic()
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

  // View mode state
  const [viewMode, setViewMode] = useState<ViewMode>("carousel")
  const [selectedIndex, setSelectedIndex] = useState(0)

  // Edit/Delete state
  const [currentUser, setCurrentUser] = useState<string>("")
  const [editingItem, setEditingItem] = useState<GalleryItem | null>(null)
  const [editCaption, setEditCaption] = useState("")
  const [deletingItem, setDeletingItem] = useState<GalleryItem | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  // Embla Carousel
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: "center",
    slidesToScroll: 1,
    breakpoints: {
      "(min-width: 768px)": { slidesToScroll: 1 },
    },
  })

  useEffect(() => {
    // Load current user from localStorage
    const storedName = localStorage.getItem("gallery_uploader_name")
    if (storedName) {
      setCurrentUser(storedName)
    }
    loadGalleryItems()
  }, [])

  useEffect(() => {
    if (!emblaApi) return

    const onSelect = () => {
      setSelectedIndex(emblaApi.selectedScrollSnap())
    }

    emblaApi.on("select", onSelect)
    onSelect()

    return () => {
      emblaApi.off("select", onSelect)
    }
  }, [emblaApi])

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

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev()
  }, [emblaApi])

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext()
  }, [emblaApi])

  const scrollTo = useCallback(
    (index: number) => {
      if (emblaApi) emblaApi.scrollTo(index)
    },
    [emblaApi],
  )

  const handleGridItemClick = (index: number) => {
    setViewMode("carousel")
    setTimeout(() => scrollTo(index), 100)
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

      const result = await uploadGalleryItem(formData)

      if (result.success) {
        // Store uploader name in localStorage for future edits/deletes
        if (uploadName) {
          localStorage.setItem("gallery_uploader_name", uploadName)
          setCurrentUser(uploadName)
        }
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

  const isOwnPost = (item: GalleryItem) => {
    if (!currentUser) return false
    return item.uploader_name.toLowerCase() === currentUser.toLowerCase()
  }

  const handleEditClick = (item: GalleryItem, e: React.MouseEvent) => {
    e.stopPropagation()
    setEditingItem(item)
    setEditCaption(item.caption || "")
  }

  const handleDeleteClick = (item: GalleryItem, e: React.MouseEvent) => {
    e.stopPropagation()
    setDeletingItem(item)
  }

  const handleSaveEdit = async () => {
    if (!editingItem || !currentUser) return

    try {
      setIsEditing(true)
      const result = await updateGalleryItemCaption(editingItem.id, editCaption, currentUser)

      if (result.success) {
        await loadGalleryItems()
        setEditingItem(null)
        setEditCaption("")
      } else {
        alert(result.error || "Failed to update caption")
      }
    } catch (error) {
      console.error("Edit error:", error)
      alert("Failed to update caption. Please try again.")
    } finally {
      setIsEditing(false)
    }
  }

  const handleConfirmDelete = async () => {
    if (!deletingItem || !currentUser) return

    try {
      setIsDeleting(true)
      const result = await deleteGalleryItem(deletingItem.id, currentUser)

      if (result.success) {
        await loadGalleryItems()
        setDeletingItem(null)
      } else {
        alert(result.error || "Failed to delete post")
      }
    } catch (error) {
      console.error("Delete error:", error)
      alert("Failed to delete post. Please try again.")
    } finally {
      setIsDeleting(false)
    }
  }

  const renderMediaItem = (item: GalleryItem, isCarousel = false) => {
    if (item.file_type === "video") {
      return (
        <video
          controls
          className={`w-full h-full object-contain ${isCarousel ? "max-h-[60vh]" : "object-cover rounded-lg"}`}
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
      if (isCarousel) {
        return (
          <div className="relative w-full h-full flex items-center justify-center">
            <Image
              src={item.file_url || ""}
              alt={item.caption || "Wedding memory"}
              width={800}
              height={600}
              className="object-contain max-h-[60vh] w-auto"
              loading="lazy"
            />
          </div>
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
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-soft-blush via-warm-white to-rose-gold/20 relative">
      <div className="fixed inset-0 z-0">
        <Image src="/hibiscusring.jpg" alt="Wedding background" fill className="object-cover" priority />
      </div>

      <div className="relative z-10">

        {/* Header */}
        <div className="py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-4xl md:text-6xl font-serif font-semibold text-charcoal mb-4 tracking-wide">Wedding Memories</h1>
              <p className="text-xl md:text-2xl text-charcoal/80 font-light mb-4">
                Share your favorite moments from our special day
              </p>
              <p className="text-sm md:text-base text-charcoal/70 mb-8 italic">
                ✨ You can edit or delete any posts you've shared
              </p>

              {/* View Toggle & Upload Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <button
                  onClick={() => setShowUploadForm(true)}
                  className="bg-jewel-burgundy hover:bg-jewel-crimson text-white px-8 py-4 text-lg font-medium rounded-full transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-3"
                >
                  <Camera className="w-5 h-5" />
                  Share a Memory
                </button>

                {/* View Mode Toggles */}
                {galleryItems.length > 0 && (
                  <div className="flex gap-2 bg-white/80 backdrop-blur-sm p-2 rounded-full shadow-lg">
                    <button
                      onClick={() => setViewMode("carousel")}
                      className={`px-6 py-3 rounded-full transition-all duration-300 flex items-center gap-2 ${
                        viewMode === "carousel"
                          ? "bg-jewel-burgundy text-white shadow-md"
                          : "text-charcoal hover:bg-white/50"
                      }`}
                    >
                      <Maximize2 className="w-4 h-4" />
                      Carousel
                    </button>
                    <button
                      onClick={() => setViewMode("grid")}
                      className={`px-6 py-3 rounded-full transition-all duration-300 flex items-center gap-2 ${
                        viewMode === "grid"
                          ? "bg-jewel-burgundy text-white shadow-md"
                          : "text-charcoal hover:bg-white/50"
                      }`}
                    >
                      <Grid3x3 className="w-4 h-4" />
                      Grid
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Edit Modal */}
        {editingItem && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="relative rounded-2xl shadow-2xl max-w-md w-full my-4 max-h-[90vh] overflow-hidden">
              <div className="absolute inset-0 z-0">
                <Image src="/underleaf.jpg" alt="Floral background" fill className="object-cover" priority />
                <div className="absolute inset-0 bg-warm-white/85 backdrop-blur-md" />
              </div>

              <div className="relative z-10 p-4 sm:p-6 overflow-y-auto max-h-[90vh]">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-semibold text-charcoal">Edit Caption</h3>
                  <button
                    onClick={() => {
                      setEditingItem(null)
                      setEditCaption("")
                    }}
                    className="p-2 hover:bg-white/50 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-charcoal mb-2">
                    Caption
                  </label>
                  <textarea
                    value={editCaption}
                    onChange={(e) => setEditCaption(e.target.value)}
                    placeholder="Share a memory..."
                    rows={3}
                    maxLength={200}
                    className="w-full px-3 py-2 border border-rose-gold/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-gold/50 resize-none text-base bg-white/80 backdrop-blur-sm"
                  />
                  <span className="text-xs text-charcoal/40 float-right mt-1">{editCaption.length}/200</span>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => {
                      setEditingItem(null)
                      setEditCaption("")
                    }}
                    className="flex-1 px-4 py-3 border border-rose-gold text-rose-gold rounded-lg hover:bg-rose-gold/10 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveEdit}
                    disabled={isEditing}
                    className="flex-1 px-4 py-3 bg-jewel-sapphire text-white rounded-lg hover:bg-jewel-emerald disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isEditing ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deletingItem && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="relative rounded-2xl shadow-2xl max-w-md w-full my-4 max-h-[90vh] overflow-hidden">
              <div className="absolute inset-0 z-0">
                <Image src="/underleaf.jpg" alt="Floral background" fill className="object-cover" priority />
                <div className="absolute inset-0 bg-warm-white/85 backdrop-blur-md" />
              </div>

              <div className="relative z-10 p-4 sm:p-6 overflow-y-auto max-h-[90vh]">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-semibold text-charcoal">Delete Post</h3>
                  <button
                    onClick={() => setDeletingItem(null)}
                    className="p-2 hover:bg-white/50 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="mb-6">
                  <p className="text-charcoal mb-4">
                    Are you sure you want to delete this post? This action cannot be undone.
                  </p>
                  {deletingItem.caption && (
                    <p className="text-sm text-charcoal/70 italic mb-2">"{deletingItem.caption}"</p>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => setDeletingItem(null)}
                    className="flex-1 px-4 py-3 border border-rose-gold text-rose-gold rounded-lg hover:bg-rose-gold/10 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmDelete}
                    disabled={isDeleting}
                    className="flex-1 px-4 py-3 bg-jewel-crimson text-white rounded-lg hover:bg-jewel-burgundy disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isDeleting ? "Deleting..." : "Delete Post"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Upload Form Modal */}
        {showUploadForm && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="relative rounded-2xl shadow-2xl max-w-md w-full my-4 max-h-[90vh] overflow-hidden">
              <div className="absolute inset-0 z-0">
                <Image src="/underleaf.jpg" alt="Floral background" fill className="object-cover" priority />
                <div className="absolute inset-0 bg-warm-white/85 backdrop-blur-md" />
              </div>

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
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload className="w-12 h-12 text-rose-gold mx-auto" />
                      <p className="text-charcoal font-medium">Click or drag to upload</p>
                      <p className="text-sm text-charcoal/60">Images and videos up to 10MB</p>
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
                    placeholder="Enter your name"
                    className="w-full px-3 py-2 border border-rose-gold/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-gold/50 text-base bg-white/80 backdrop-blur-sm"
                  />
                  <p className="text-xs text-charcoal/60 mt-1">
                    💡 Tip: Use the same name to edit or delete your posts later
                  </p>
                </div>

                {/* Caption Input */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-charcoal mb-2">
                      <span className="flex items-center gap-2">
                      Add a Caption
                      <span className="text-xs text-charcoal/60 font-normal">(optional)</span>
                    </span>
                  </label>
                  <textarea
                    value={uploadCaption}
                    onChange={(e) => setUploadCaption(e.target.value)}
                    placeholder="Share a memory..."
                    rows={3}
                    maxLength={200}
                    className="w-full px-3 py-2 border border-rose-gold/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-gold/50 resize-none text-base bg-white/80 backdrop-blur-sm"
                  />
                  <span className="text-xs text-charcoal/40 float-right mt-1">{uploadCaption.length}/200</span>
                </div>

                {/* Status Message */}
                {uploadStatus !== "idle" && (
                  <div
                    className={`mb-4 p-3 rounded-lg flex items-center gap-2 ${
                      uploadStatus === "success"
                        ? "bg-jewel-emerald/10 text-jewel-emerald border border-jewel-emerald/30"
                        : "bg-jewel-crimson/10 text-jewel-crimson border border-jewel-crimson/30"
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
                    className="flex-1 px-4 py-3 border border-rose-gold text-rose-gold rounded-lg hover:bg-rose-gold/10 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpload}
                    disabled={uploading || !selectedFile}
                    className="flex-1 px-4 py-3 bg-jewel-sapphire text-white rounded-lg hover:bg-jewel-emerald disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {uploading ? "Uploading..." : "Upload"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Gallery Content */}
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
                className="bg-jewel-burgundy hover:bg-jewel-crimson text-white px-6 py-3 rounded-full transition-all duration-300 font-medium"
              >
                Share a Memory
              </button>
            </div>
          ) : (
            <>
              {/* Carousel View */}
              {viewMode === "carousel" && (
                <div className="relative mb-8">
                  {/* Carousel Container */}
                  <div className="overflow-hidden rounded-2xl bg-black/5 backdrop-blur-sm" ref={emblaRef}>
                    <div className="flex">
                      {galleryItems.map((item, index) => (
                        <div key={item.id} className="flex-[0_0_100%] md:flex-[0_0_100%] min-w-0 px-4">
                          <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-2xl overflow-hidden">
                            {/* Media Container */}
                            <div className="relative bg-black flex items-center justify-center min-h-[50vh] md:min-h-[60vh]">
                              {renderMediaItem(item, true)}

                              {/* File Type Indicator */}
                              <div className="absolute top-4 right-4">
                                {item.file_type === "video" ? (
                                  <Video className="w-6 h-6 text-white drop-shadow-lg" />
                                ) : (
                                  <Camera className="w-6 h-6 text-white drop-shadow-lg" />
                                )}
                              </div>
                            </div>

                            {/* Caption Area */}
                            <div className="p-6 bg-gradient-to-b from-warm-white to-soft-blush/30">
                              {item.uploader_name && (
                                <div className="mb-3 flex items-center justify-between">
                                  <p className="text-lg font-semibold text-charcoal flex items-center gap-2">
                                    {item.uploader_name}
                                  </p>
                                  {isOwnPost(item) && (
                                    <div className="flex gap-2">
                                      <button
                                        onClick={(e) => handleEditClick(item, e)}
                                        className="p-2 hover:bg-rose-gold/20 rounded-lg transition-colors text-charcoal/70 hover:text-charcoal"
                                        aria-label="Edit post"
                                      >
                                        <Edit className="w-4 h-4" />
                                      </button>
                                      <button
                                        onClick={(e) => handleDeleteClick(item, e)}
                                        className="p-2 hover:bg-jewel-crimson/20 rounded-lg transition-colors text-charcoal/70 hover:text-jewel-crimson"
                                        aria-label="Delete post"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    </div>
                                  )}
                                </div>
                              )}
                              {item.caption && (
                                <div className="mb-3">
                                  <p className="text-base text-charcoal/80 italic">"{item.caption}"</p>
                                </div>
                              )}
                              <div className="flex items-center justify-between text-sm text-charcoal/60 pt-3 border-t border-rose-gold/20">
                                <p>{new Date(item.created_at).toLocaleDateString()}</p>
                                <p className="text-rose-gold font-medium">
                                  {index + 1} / {galleryItems.length}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Navigation Buttons */}
                  {galleryItems.length > 1 && (
                    <>
                      <button
                        onClick={scrollPrev}
                        className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-charcoal p-3 md:p-4 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 z-10"
                        aria-label="Previous photo"
                      >
                        <ChevronLeft className="w-6 h-6" />
                      </button>
                      <button
                        onClick={scrollNext}
                        className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-charcoal p-3 md:p-4 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 z-10"
                        aria-label="Next photo"
                      >
                        <ChevronRight className="w-6 h-6" />
                      </button>
                    </>
                  )}
                </div>
              )}

              {/* Grid View */}
              {viewMode === "grid" && (
                <div className="mb-8">
                  <div className="text-center mb-6">
                    <p className="text-charcoal/60">
                      Showing {galleryItems.length} {galleryItems.length === 1 ? "memory" : "memories"} - Click any
                      photo to view in carousel
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                    {galleryItems.map((item, index) => (
                      <div
                        key={item.id}
                        onClick={() => handleGridItemClick(index)}
                        className="group relative bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:scale-105"
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

                          {/* Hover Overlay */}
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                            <Maximize2 className="w-12 h-12 text-white" />
                          </div>
                        </div>

                        <div className="p-3 sm:p-4 bg-gradient-to-b from-warm-white to-soft-blush/30">
                          {item.uploader_name && (
                            <div className="flex items-center justify-between mb-1">
                              <p className="text-sm font-semibold text-charcoal">
                                {item.uploader_name}
                              </p>
                              {isOwnPost(item) && (
                                <div className="flex gap-1">
                                  <button
                                    onClick={(e) => handleEditClick(item, e)}
                                    className="p-1.5 hover:bg-rose-gold/20 rounded transition-colors text-charcoal/70 hover:text-charcoal"
                                    aria-label="Edit post"
                                  >
                                    <Edit className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={(e) => handleDeleteClick(item, e)}
                                    className="p-1.5 hover:bg-jewel-crimson/20 rounded transition-colors text-charcoal/70 hover:text-jewel-crimson"
                                    aria-label="Delete post"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
                          {item.caption && (
                            <p className="text-sm text-charcoal/80 line-clamp-2 italic mb-2">"{item.caption}"</p>
                          )}
                          <p className="text-xs text-charcoal/60">{new Date(item.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Music Info - Background player handles all playback */}
              <div className="max-w-4xl mx-auto mt-8">
                <div className="bg-white/70 backdrop-blur-md rounded-2xl shadow-xl p-6 border-t-4 border-jewel-burgundy">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-3xl">Music</span>
                    <h3 className="text-2xl font-serif font-bold text-jewel-fuchsia">The Soundtrack to Our Story</h3>
                  </div>
                  <p className="text-charcoal/70 mb-4 italic">Music is playing in the background - use the control button in the bottom right corner to mute/unmute</p>
                  <div className="rounded-xl overflow-hidden shadow-lg bg-gradient-to-br from-jewel-burgundy/10 to-jewel-crimson/10 p-8 text-center border border-jewel-burgundy/20">
                    <p className="text-jewel-burgundy font-medium">🎵 Background music is playing continuously</p>
                    {currentTrack && (
                      <p className="text-jewel-burgundy text-lg font-semibold mt-3 italic">
                        Now Playing: "{currentTrack}"
                      </p>
                    )}
                    <p className="text-charcoal/60 text-sm mt-2">Control playback with the button in the bottom right corner</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
