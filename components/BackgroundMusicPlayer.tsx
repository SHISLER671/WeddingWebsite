"use client"

import { useEffect, useState } from "react"
import { useMusic } from "@/contexts/MusicContext"
import { YouTubePlayer } from "./YouTubePlayer"

const YOUTUBE_PLAYLIST_ID = "PLpW1t4-1G91SnoEhXi324hjIG41PI_kUh"

export default function BackgroundMusicPlayer() {
  const { isPlaying } = useMusic()
  const [isMuted, setIsMuted] = useState(() => {
    // Load mute state from sessionStorage on mount
    if (typeof window !== "undefined") {
      return sessionStorage.getItem("music-muted") !== "false"
    }
    return true
  })

  // Save mute state to sessionStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("music-muted", String(isMuted))
    }
  }, [isMuted])

  // Auto-unmute on any user interaction after music starts (only if muted)
  useEffect(() => {
    if (isPlaying && isMuted) {
      const handleUnmute = () => {
        setIsMuted(false)
        if (typeof window !== "undefined") {
          sessionStorage.setItem("music-muted", "false")
        }
        console.log("[Music] Auto-unmuted on user interaction")
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

  // Toggle mute handler
  const handleToggleMute = () => {
    setIsMuted((prev) => {
      const newState = !prev
      if (typeof window !== "undefined") {
        sessionStorage.setItem("music-muted", String(newState))
      }
      return newState
    })
  }

  return (
    <>
      {/* YouTube Player using IFrame API for continuous playback */}
      <YouTubePlayer
        playlistId={YOUTUBE_PLAYLIST_ID}
        isPlaying={isPlaying}
        isMuted={isMuted}
      />

      {/* Music Control Button - Always visible when music is playing */}
      {isPlaying && (
        <div className="fixed bottom-6 right-6 z-50">
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
