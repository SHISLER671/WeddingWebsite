"use client"

import { useEffect, useRef, useState } from "react"
import { useMusic } from "@/contexts/MusicContext"

const YOUTUBE_PLAYLIST_ID = "PLpW1t4-1G91SnoEhXi324hjIG41PI_kUh"

export default function BackgroundMusicPlayer() {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const { isPlaying } = useMusic()
  const [isMuted, setIsMuted] = useState(() => {
    // Load mute state from sessionStorage on mount
    if (typeof window !== "undefined") {
      const saved = sessionStorage.getItem("music-muted")
      return saved !== "false"
    }
    return true
  })
  const hasInitializedRef = useRef(false)

  // Initialize iframe once - set src only once to avoid reloads
  useEffect(() => {
    if (iframeRef.current && !hasInitializedRef.current) {
      // Load saved state
      const savedMuted = typeof window !== "undefined" && sessionStorage.getItem("music-muted") !== "false"
      const savedPlaying = typeof window !== "undefined" && sessionStorage.getItem("wedding-music-playing") === "true"
      
      // Set initial src based on saved state
      const initialSrc = savedPlaying
        ? `https://www.youtube.com/embed/videoseries?list=${YOUTUBE_PLAYLIST_ID}&autoplay=1&mute=${savedMuted ? "1" : "0"}&loop=1&playlist=${YOUTUBE_PLAYLIST_ID}`
        : `https://www.youtube.com/embed/videoseries?list=${YOUTUBE_PLAYLIST_ID}&mute=1&loop=1&playlist=${YOUTUBE_PLAYLIST_ID}`
      
      iframeRef.current.src = initialSrc
      setIsMuted(savedMuted)
      hasInitializedRef.current = true
      
      if (savedPlaying) {
        console.log("[Music] Restored playback state", savedMuted ? "(muted)" : "(unmuted)")
      }
    }
  }, [])

  // When music should start - only update src if not already initialized with autoplay
  useEffect(() => {
    if (isPlaying && iframeRef.current && hasInitializedRef.current) {
      const currentSrc = iframeRef.current.src
      // Only change src if autoplay isn't already enabled
      if (!currentSrc.includes("autoplay=1")) {
        try {
          const autoplaySrc = `https://www.youtube.com/embed/videoseries?list=${YOUTUBE_PLAYLIST_ID}&autoplay=1&mute=1&loop=1&playlist=${YOUTUBE_PLAYLIST_ID}`
          iframeRef.current.src = autoplaySrc
          setIsMuted(true)
          console.log("[Music] Starting YouTube playlist playback (muted)")
        } catch (error) {
          console.log("[Music] Playback initialization:", error)
        }
      }
    }
  }, [isPlaying])

  // Unmute handler - changes src (unavoidable, but only happens once)
  const handleUnmute = () => {
    if (iframeRef.current && isMuted) {
      try {
        const unmutedSrc = `https://www.youtube.com/embed/videoseries?list=${YOUTUBE_PLAYLIST_ID}&autoplay=1&loop=1&playlist=${YOUTUBE_PLAYLIST_ID}`
        iframeRef.current.src = unmutedSrc
        setIsMuted(false)
        if (typeof window !== "undefined") {
          sessionStorage.setItem("music-muted", "false")
        }
        console.log("[Music] Unmuting YouTube playlist")
      } catch (error) {
        console.log("[Music] Unmute error:", error)
      }
    }
  }

  // Auto-unmute on any user interaction after music starts
  useEffect(() => {
    if (isPlaying && isMuted && hasInitializedRef.current) {
      const events = ["click", "touchstart", "keydown"]
      const handlers = events.map((event) => {
        const handler = handleUnmute
        document.addEventListener(event, handler, { once: true, passive: true })
        return { event, handler }
      })

      return () => {
        handlers.forEach(({ event, handler }) => {
          document.removeEventListener(event, handler)
        })
      }
    }
  }, [isPlaying, isMuted])

  // Save mute state to sessionStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("music-muted", String(isMuted))
    }
  }, [isMuted])

  // Static initial src - this is set once and shouldn't change during render
  const staticSrc = `https://www.youtube.com/embed/videoseries?list=${YOUTUBE_PLAYLIST_ID}&mute=1&loop=1&playlist=${YOUTUBE_PLAYLIST_ID}`

  return (
    <>
      <div
        className="fixed inset-0 pointer-events-none opacity-0"
        aria-hidden="true"
        style={{ zIndex: -1, position: "fixed" }}
      >
        <iframe
          key="background-music-persistent"
          ref={iframeRef}
          src={staticSrc}
          width="1"
          height="1"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          style={{
            position: "absolute",
            top: "-9999px",
            left: "-9999px",
            width: "1px",
            height: "1px",
            border: "none",
            visibility: "hidden",
          }}
          title="Background Music Player"
        />
      </div>
      
      {/* Prominent Unmute Button - Shows when music is playing and muted */}
      {isPlaying && isMuted && (
        <div
          className="fixed bottom-6 right-6 z-50 animate-pulse"
          style={{ animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite" }}
        >
          <button
            onClick={handleUnmute}
            className="bg-jewel-gold hover:bg-jewel-gold/90 text-jewel-burgundy font-bold text-lg px-6 py-4 rounded-full shadow-2xl border-4 border-jewel-burgundy transform hover:scale-105 transition-all duration-300 flex items-center gap-3 min-w-[200px] justify-center"
            style={{
              boxShadow: "0 10px 40px rgba(123, 75, 122, 0.5), 0 0 20px rgba(212, 165, 116, 0.8)",
            }}
          >
            <span className="text-2xl">🔊</span>
            <span>Unmute Music</span>
          </button>
        </div>
      )}
    </>
  )
}
