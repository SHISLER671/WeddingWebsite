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
      return sessionStorage.getItem("music-muted") !== "false"
    }
    return true
  })
  const srcInitializedRef = useRef(false)

  // Initialize iframe src ONCE based on saved state - never change it again
  useEffect(() => {
    if (iframeRef.current && !srcInitializedRef.current) {
      // Check if music should be playing from sessionStorage
      const savedPlaying = typeof window !== "undefined" && sessionStorage.getItem("wedding-music-playing") === "true"
      const savedMuted = typeof window !== "undefined" && sessionStorage.getItem("music-muted") !== "false"
      
      // Set src ONCE with autoplay if it was playing before
      const initialSrc = savedPlaying
        ? `https://www.youtube.com/embed/videoseries?list=${YOUTUBE_PLAYLIST_ID}&autoplay=1&mute=${savedMuted ? "1" : "0"}&loop=1&playlist=${YOUTUBE_PLAYLIST_ID}`
        : `https://www.youtube.com/embed/videoseries?list=${YOUTUBE_PLAYLIST_ID}&mute=1&loop=1&playlist=${YOUTUBE_PLAYLIST_ID}`
      
      iframeRef.current.src = initialSrc
      setIsMuted(savedMuted)
      srcInitializedRef.current = true
      
      if (savedPlaying) {
        console.log("[Music] Restored continuous playback", savedMuted ? "(muted)" : "(unmuted)")
      }
    }
  }, [])

  // When music should start - only set src ONCE if not already initialized
  useEffect(() => {
    if (isPlaying && iframeRef.current && !srcInitializedRef.current) {
      try {
        const autoplaySrc = `https://www.youtube.com/embed/videoseries?list=${YOUTUBE_PLAYLIST_ID}&autoplay=1&mute=1&loop=1&playlist=${YOUTUBE_PLAYLIST_ID}`
        iframeRef.current.src = autoplaySrc
        setIsMuted(true)
        srcInitializedRef.current = true
        console.log("[Music] Starting continuous playback (muted)")
      } catch (error) {
        console.log("[Music] Playback initialization:", error)
      }
    }
  }, [isPlaying])

  // Toggle mute/unmute handler
  const handleToggleMute = () => {
    if (iframeRef.current && srcInitializedRef.current) {
      try {
        const currentSrc = iframeRef.current.src
        const newMutedState = !isMuted
        
        // Update src to toggle mute state
        let newSrc: string
        if (newMutedState) {
          // Mute: add or update mute=1
          newSrc = currentSrc.includes("mute=")
            ? currentSrc.replace(/mute=[01]/g, "mute=1")
            : currentSrc + (currentSrc.includes("?") ? "&" : "?") + "mute=1"
        } else {
          // Unmute: change mute=1 to mute=0
          newSrc = currentSrc.includes("mute=")
            ? currentSrc.replace(/mute=[01]/g, "mute=0")
            : currentSrc + (currentSrc.includes("?") ? "&" : "?") + "mute=0"
        }
        
        iframeRef.current.src = newSrc
        setIsMuted(newMutedState)
        if (typeof window !== "undefined") {
          sessionStorage.setItem("music-muted", String(newMutedState))
        }
        console.log("[Music] Toggled mute:", newMutedState ? "muted" : "unmuted")
      } catch (error) {
        console.log("[Music] Toggle mute error:", error)
      }
    }
  }

  // Auto-unmute on any user interaction after music starts (only if muted)
  useEffect(() => {
    if (isPlaying && isMuted && srcInitializedRef.current) {
      const handleUnmute = () => {
        if (iframeRef.current && isMuted) {
          try {
            const currentSrc = iframeRef.current.src
            const unmutedSrc = currentSrc.includes("mute=")
              ? currentSrc.replace(/mute=[01]/g, "mute=0")
              : currentSrc + (currentSrc.includes("?") ? "&" : "?") + "mute=0"
            
            iframeRef.current.src = unmutedSrc
            setIsMuted(false)
            if (typeof window !== "undefined") {
              sessionStorage.setItem("music-muted", "false")
            }
            console.log("[Music] Auto-unmuted on user interaction")
          } catch (error) {
            console.log("[Music] Auto-unmute error:", error)
          }
        }
      }

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

  // Static src - this is the initial src, actual src is managed via ref to prevent React re-renders from reloading
  const staticSrc = `https://www.youtube.com/embed/videoseries?list=${YOUTUBE_PLAYLIST_ID}&mute=1&loop=1&playlist=${YOUTUBE_PLAYLIST_ID}`

  return (
    <>
      <div
        className="fixed inset-0 pointer-events-none opacity-0"
        aria-hidden="true"
        style={{ zIndex: -1, position: "fixed" }}
      >
        <iframe
          key="background-music-continuous" // Stable key prevents React from recreating
          ref={iframeRef}
          src={staticSrc} // Initial src, but we update via ref immediately in useEffect
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
      
      {/* Music Control Button - Always visible when music is playing */}
      {isPlaying && (
        <div
          className="fixed bottom-6 right-6 z-50"
        >
          <button
            onClick={handleToggleMute}
            className={`font-bold text-lg px-6 py-4 rounded-full shadow-2xl border-4 transform hover:scale-105 transition-all duration-300 flex items-center gap-3 min-w-[200px] justify-center ${
              isMuted
                ? "bg-jewel-gold hover:bg-jewel-gold/90 text-jewel-burgundy border-jewel-burgundy"
                : "bg-jewel-burgundy hover:bg-jewel-burgundy/90 text-warm-white border-jewel-gold"
            }`}
            style={{
              boxShadow: isMuted
                ? "0 10px 40px rgba(123, 75, 122, 0.5), 0 0 20px rgba(212, 165, 116, 0.8)"
                : "0 10px 40px rgba(123, 75, 122, 0.5), 0 0 20px rgba(123, 75, 122, 0.6)",
              animation: isMuted ? "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite" : "none",
            }}
          >
            <span className="text-2xl">{isMuted ? "🔊" : "🔇"}</span>
            <span>{isMuted ? "Unmute Music" : "Mute Music"}</span>
          </button>
        </div>
      )}
    </>
  )
}
