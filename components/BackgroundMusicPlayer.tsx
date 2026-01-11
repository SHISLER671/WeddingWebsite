"use client"

import { useEffect, useRef, useState } from "react"
import { useMusic } from "@/contexts/MusicContext"

const YOUTUBE_PLAYLIST_ID = "PLpW1t4-1G91SnoEhXi324hjIG41PI_kUh"

export default function BackgroundMusicPlayer() {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const { isPlaying } = useMusic()
  const [isMuted, setIsMuted] = useState(true)
  const hasUnmutedRef = useRef(false)

  useEffect(() => {
    // When music should start, reload the iframe with autoplay enabled
    if (isPlaying && iframeRef.current) {
      try {
        // YouTube playlist embed URL with autoplay and mute
        // mute=1 is required for autoplay to work in most browsers
        const mutedSrc = `https://www.youtube.com/embed/videoseries?list=${YOUTUBE_PLAYLIST_ID}&autoplay=1&mute=1&loop=1&playlist=${YOUTUBE_PLAYLIST_ID}`
        
        if (iframeRef.current.src !== mutedSrc && isMuted) {
          iframeRef.current.src = mutedSrc
          hasUnmutedRef.current = false
        }
        console.log("[Music] Starting YouTube playlist playback (muted)")
      } catch (error) {
        console.log("[Music] Playback initialization:", error)
      }
    }
  }, [isPlaying, isMuted])

  // Unmute on any user interaction after music starts
  useEffect(() => {
    if (isPlaying && isMuted && !hasUnmutedRef.current) {
      const handleUnmute = () => {
        if (iframeRef.current && isMuted && !hasUnmutedRef.current) {
          try {
            // Reload without mute parameter
            const unmutedSrc = `https://www.youtube.com/embed/videoseries?list=${YOUTUBE_PLAYLIST_ID}&autoplay=1&loop=1&playlist=${YOUTUBE_PLAYLIST_ID}`
            iframeRef.current.src = unmutedSrc
            setIsMuted(false)
            hasUnmutedRef.current = true
            console.log("[Music] Unmuting YouTube playlist")
          } catch (error) {
            console.log("[Music] Unmute error:", error)
          }
        }
      }

      // Listen for any user interaction
      const events = ["click", "touchstart", "keydown", "scroll"]
      events.forEach((event) => {
        document.addEventListener(event, handleUnmute, { once: true, passive: true })
      })

      return () => {
        events.forEach((event) => {
          document.removeEventListener(event, handleUnmute)
        })
      }
    }
  }, [isPlaying, isMuted])

  // Reset mute state when playing state changes
  useEffect(() => {
    if (!isPlaying) {
      setIsMuted(true)
      hasUnmutedRef.current = false
    }
  }, [isPlaying])

  // Hidden iframe that persists across navigation
  return (
    <>
      <div
        className="fixed inset-0 pointer-events-none opacity-0"
        aria-hidden="true"
        style={{ zIndex: -1, position: "fixed" }}
      >
        <iframe
          ref={iframeRef}
          src={`https://www.youtube.com/embed/videoseries?list=${YOUTUBE_PLAYLIST_ID}&mute=1&loop=1&playlist=${YOUTUBE_PLAYLIST_ID}`}
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
      {isPlaying && isMuted && !hasUnmutedRef.current && (
        <div
          className="fixed bottom-6 right-6 z-50 animate-pulse"
          style={{ animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite" }}
        >
          <button
            onClick={() => {
              if (iframeRef.current) {
                const unmutedSrc = `https://www.youtube.com/embed/videoseries?list=${YOUTUBE_PLAYLIST_ID}&autoplay=1&loop=1&playlist=${YOUTUBE_PLAYLIST_ID}`
                iframeRef.current.src = unmutedSrc
                setIsMuted(false)
                hasUnmutedRef.current = true
              }
            }}
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
