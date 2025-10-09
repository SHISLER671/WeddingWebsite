// Wedding Gallery Page - Carousel + Grid View with Spotify
// Displays photos in an immersive carousel or quick-scan grid

"use client"

import type React from "react"
import { useState, useEffect, useRef, useCallback } from "react"
import Image from "next/image"
import { Heart, Upload, Camera, Video, X, CheckCircle, AlertCircle, ArrowLeft, ChevronLeft, ChevronRight, Grid3x3, Maximize2 } from "lucide-react"
import { getGalleryItems, type GalleryItem } from "@/lib/utils/gallery"
import { uploadGalleryItem } from "@/app/actions/upload-gallery-item"
import Link from "next/link"
import { SpinningRoseLoader } from "@/components/spinning-rose-loader"
import useEmblaCarousel from 'embla-carousel-react'

type ViewMode = 'carousel' | 'grid'

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
  
  // View mode state
  const [viewMode, setViewMode] = useState<ViewMode>('carousel')
  const [selectedIndex, setSelectedIndex] = useState(0)
  
  // Embla Carousel
  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    loop: true,
    align: 'center',
    slidesToScroll: 1,
    breakpoints: {
      '(min-width: 768px)': { slidesToScroll: 1 }
    }
  })

  useEffect(() => {
    loadGalleryItems()
  }, [])

  useEffect(() => {
    if (!emblaApi) return

    const onSelect = () => {
      setSelectedIndex(emblaApi.selectedScrollSnap())
    }

    emblaApi.on('select', onSelect)
    onSelect()

    return () => {
      emblaApi.off('select', onSelect)
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

  const scrollTo = useCallback((index: number) => {
    if (emblaApi) emblaApi.scrollTo(index)
  }, [emblaApi])

  const handleGridItemClick = (index: number) => {
    setViewMode('carousel')
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

  const renderMediaItem = (item: GalleryItem, isCarousel: boolean = false) => {
    if (item.file_type === "video") {
      return (
        <video
          controls
          className={`w-full h-full object-contain ${isCarousel ? 'max-h-[60vh]' : 'object-cover rounded-lg'}`}
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
        <Image
          src="/hibiscusring.jpg"
          alt="Wedding background"
          fill
          className="object-cover"
          priority
        />
      </div>

      <div className="relative z-10">
        {/* Fixed Back to Home Button - Top Left */}
        <div className="fixed top-4 left-4 z-20">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-white hover:text-jewel-crimson transition-colors font-medium bg-black/20 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/20"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>

        {/* Header */}
        <div className="py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-4xl md:text-6xl font-light text-charcoal mb-4 tracking-wide">Wedding Memories</h1>
              <p className="text-xl md:text-2xl text-charcoal/80 font-light mb-8">
                Share your favorite moments from our special day
              </p>

              {/* View Toggle & Upload Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <button
                  onClick={() => setShowUploadForm(true)}
                  className="bg-jewel-sapphire hover:bg-jewel-emerald text-white px-8 py-4 text-lg font-medium rounded-full transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-3"
                >
                  <Camera className="w-5 h-5" />
                  Share a Memory
                </button>

                {/* View Mode Toggles */}
                {galleryItems.length > 0 && (
                  <div className="flex gap-2 bg-white/80 backdrop-blur-sm p-2 rounded-full shadow-lg">
                    <button
                      onClick={() => setViewMode('carousel')}
                      className={`px-6 py-3 rounded-full transition-all duration-300 flex items-center gap-2 ${
                        viewMode === 'carousel'
                          ? 'bg-jewel-sapphire text-white shadow-md'
                          : 'text-charcoal hover:bg-white/50'
                      }`}
                    >
                      <Maximize2 className="w-4 h-4" />
                      Carousel
                    </button>
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`px-6 py-3 rounded-full transition-all duration-300 flex items-center gap-2 ${
                        viewMode === 'grid'
                          ? 'bg-jewel-sapphire text-white shadow-md'
                          : 'text-charcoal hover:bg-white/50'
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
                    placeholder="Share a memory... ✨"
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
                className="bg-jewel-sapphire hover:bg-jewel-emerald text-white px-6 py-3 rounded-full transition-all duration-300"
              >
                Share a Memory
              </button>
            </div>
          ) : (
            <>
              {/* Carousel View */}
              {viewMode === 'carousel' && (
                <div className="space-y-8">
                  <div className="relative">
                    {/* Carousel Container */}
                    <div className="overflow-hidden rounded-2xl bg-black/5 backdrop-blur-sm" ref={emblaRef}>
                      <div className="flex">
                        {galleryItems.map((item, index) => (
                          <div
                            key={item.id}
                            className="flex-[0_0_100%] md:flex-[0_0_100%] min-w-0 px-4"
                          >
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
                                  <div className="mb-3">
                                    <p className="text-lg font-semibold text-charcoal flex items-center gap-2">
                                      <span className="text-rose-gold">📸</span>
                                      {item.uploader_name}
                                    </p>
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

                  {/* Spotify Player */}
                  <div className="max-w-4xl mx-auto">
                    <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-6 border-2 border-jewel-purple/20">
                      <div className="flex items-center gap-3 mb-4">
                        <span className="text-3xl">🎵</span>
                        <h3 className="text-2xl font-semibold text-jewel-purple">The Soundtrack to Our Story</h3>
                      </div>
                      <p className="text-charcoal/70 mb-4 italic">
                        Let the music move you as you browse our memories...
                      </p>
                      <div className="rounded-xl overflow-hidden shadow-lg">
                        <iframe 
                          data-testid="embed-iframe" 
                          style={{borderRadius: '12px'}} 
                          src="https://open.spotify.com/embed/playlist/6zaH3KMo6AGlFtKv9jn3vT?utm_source=generator" 
                          width="100%" 
                          height="352" 
                          frameBorder="0" 
                          allowFullScreen 
                          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
                          loading="lazy"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Grid View */}
              {viewMode === 'grid' && (
                <div>
                  <div className="text-center mb-6">
                    <p className="text-charcoal/60">
                      Showing {galleryItems.length} {galleryItems.length === 1 ? 'memory' : 'memories'} - Click any photo to view in carousel
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
                            <p className="text-sm font-semibold text-charcoal flex items-center gap-1.5 mb-1">
                              <span className="text-rose-gold">📸</span>
                              {item.uploader_name}
                            </p>
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
            </>
          )}
        </div>
      </div>
    </div>
  )
}