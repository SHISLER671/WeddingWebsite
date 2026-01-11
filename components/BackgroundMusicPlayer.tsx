"use client"

import { useEffect, useRef } from "react"
import { useMusic } from "@/contexts/MusicContext"

const SPOTIFY_PLAYLIST_ID = "0wsQQLXJAaWwiG0SbeIJEP"

export default function BackgroundMusicPlayer() {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const { isPlaying } = useMusic()

  useEffect(() => {
    // When music should start, reload the iframe to trigger autoplay
    // This works because the reload happens as a result of user interaction
    if (isPlaying && iframeRef.current) {
      try {
        // Reload the iframe with autoplay - this should work since it's user-initiated
        const newSrc = `https://open.spotify.com/embed/playlist/${SPOTIFY_PLAYLIST_ID}?utm_source=generator`
        if (iframeRef.current.src !== newSrc) {
          iframeRef.current.src = newSrc
        } else {
          // If src is same, force reload
          iframeRef.current.src = ""
          setTimeout(() => {
            if (iframeRef.current) {
              iframeRef.current.src = newSrc
            }
          }, 100)
        }
        console.log("[Music] Starting playback")
      } catch (error) {
        console.log("[Music] Playback initialization:", error)
      }
    }
  }, [isPlaying])

  // Hidden iframe that persists across navigation
  return (
    <div
      className="fixed inset-0 pointer-events-none opacity-0"
      aria-hidden="true"
      style={{ zIndex: -1, position: "fixed" }}
    >
      <iframe
        ref={iframeRef}
        src={`https://open.spotify.com/embed/playlist/${SPOTIFY_PLAYLIST_ID}?utm_source=generator`}
        width="1"
        height="1"
        frameBorder="0"
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        loading="eager"
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
  )
}
