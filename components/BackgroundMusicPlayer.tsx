"use client"

import { useEffect } from "react"
import { useMusic } from "@/contexts/MusicContext"
import { YouTubePlayer } from "./YouTubePlayer"

const YOUTUBE_PLAYLIST_ID = "PLpW1t4-1G91SnoEhXi324hjIG41PI_kUh"

export default function BackgroundMusicPlayer() {
  const { isPlaying, isMuted, currentTrack, toggleMute, setCurrentTrack } = useMusic()

  // Auto-unmute on any user interaction after music starts (only if muted)
  useEffect(() => {
    if (isPlaying && isMuted) {
      const handleUnmute = () => {
        toggleMute()
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
  }, [isPlaying, isMuted, toggleMute])

  return (
    <>
      {/* YouTube Player using IFrame API for continuous playback */}
      <YouTubePlayer
        playlistId={YOUTUBE_PLAYLIST_ID}
        isPlaying={isPlaying}
        isMuted={isMuted}
        onTrackChange={setCurrentTrack}
      />

      {/* Music Control Button - Always visible when music is playing */}
      {isPlaying && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md">
          <button
            onClick={toggleMute}
            className={`font-bold text-lg px-6 py-4 rounded-full shadow-2xl border-4 transform hover:scale-105 transition-all duration-300 flex flex-col items-center gap-2 w-full ${
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
            <div className="flex items-center gap-3">
              <span className="text-2xl">{isMuted ? "🔊" : "🔇"}</span>
              <span>{isMuted ? "Unmute Music" : "Mute Music"}</span>
            </div>
            {currentTrack && (
              <div className="text-sm font-normal opacity-90 text-center px-2 truncate w-full">
                <span className="italic">"{currentTrack}"</span>
              </div>
            )}
          </button>
        </div>
      )}
    </>
  )
}
