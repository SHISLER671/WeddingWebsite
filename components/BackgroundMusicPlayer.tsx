"use client"

import { useEffect, useState } from "react"
import { useMusic } from "@/contexts/MusicContext"
import { YouTubePlayer } from "./YouTubePlayer"
import { SkipBack, SkipForward, List, X } from "lucide-react"

const YOUTUBE_PLAYLIST_ID = "PLpW1t4-1G91SnoEhXi324hjIG41PI_kUh"

export default function BackgroundMusicPlayer() {
  const {
    isPlaying,
    isMuted,
    currentTrack,
    currentTrackIndex,
    playlist,
    toggleMute,
    setCurrentTrack,
    setCurrentTrackIndex,
    setPlaylist,
    nextTrack,
    previousTrack,
    playTrackAtIndex,
  } = useMusic()
  const [showPlaylist, setShowPlaylist] = useState(false)
  const [loadingTitles, setLoadingTitles] = useState(false)

  // Fetch titles for all tracks when playlist is expanded
  useEffect(() => {
    if (showPlaylist && playlist.length > 0 && typeof window !== "undefined" && window.weddingMusicPlayer && window.weddingMusicPlayerReady) {
      // Check if we need to fetch titles
      const needsTitles = playlist.some((track) => !track.title)
      if (!needsTitles) return

      setLoadingTitles(true)
      const fetchTitles = async () => {
        try {
          const player = window.weddingMusicPlayer
          const currentIndex = player.getPlaylistIndex()
          const updatedPlaylist = [...playlist]

          // Fetch titles for tracks that don't have them
          for (let i = 0; i < updatedPlaylist.length; i++) {
            if (!updatedPlaylist[i].title) {
              try {
                // Temporarily load the video to get its data (without playing)
                const wasPlaying = player.getPlayerState() === 1 // PLAYING state
                const savedIndex = currentIndex

                // Load the video (this doesn't play it if we're quick)
                player.loadVideoById(updatedPlaylist[i].videoId, 0, "small")
                
                // Wait a bit for video to load
                await new Promise((resolve) => setTimeout(resolve, 300))

                // Get video data
                const videoData = player.getVideoData()
                if (videoData && videoData.title) {
                  updatedPlaylist[i].title = videoData.title
                  setPlaylist([...updatedPlaylist])
                }

                // Restore previous video if it was playing
                if (wasPlaying && savedIndex >= 0) {
                  player.playVideoAt(savedIndex)
                  await new Promise((resolve) => setTimeout(resolve, 100))
                  if (wasPlaying) {
                    player.playVideo()
                  }
                } else if (savedIndex >= 0) {
                  player.playVideoAt(savedIndex)
                }
              } catch (error) {
                console.error(`[Music] Error fetching title for track ${i}:`, error)
              }
            }
          }
        } catch (error) {
          console.error("[Music] Error fetching playlist titles:", error)
        } finally {
          setLoadingTitles(false)
        }
      }

      fetchTitles()
    }
  }, [showPlaylist, playlist, setPlaylist])

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
        onTrackIndexChange={setCurrentTrackIndex}
        onPlaylistLoaded={setPlaylist}
      />

      {/* Music Control Panel - Always visible when music is playing */}
      {isPlaying && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md">
          <div className="flex flex-col gap-3 items-end">
            {/* Expandable Playlist */}
            {showPlaylist && playlist.length > 0 && (
              <div className="bg-jewel-burgundy/95 backdrop-blur-md rounded-2xl shadow-2xl border-4 border-jewel-gold p-4 max-h-[400px] overflow-y-auto w-full">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-warm-white font-bold text-lg">Playlist</h3>
                  <button
                    onClick={() => setShowPlaylist(false)}
                    className="text-warm-white hover:text-jewel-gold transition-colors"
                    aria-label="Close playlist"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="space-y-1">
                  {playlist.map((track) => (
                    <button
                      key={track.index}
                      onClick={() => {
                        playTrackAtIndex(track.index)
                        setShowPlaylist(false)
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-all duration-200 ${
                        track.index === currentTrackIndex
                          ? "bg-jewel-gold text-jewel-burgundy font-semibold"
                          : "bg-warm-white/10 text-warm-white hover:bg-warm-white/20"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xs opacity-70">#{track.index + 1}</span>
                        <span className="truncate flex-1">
                          {track.title || `Track ${track.index + 1}`}
                        </span>
                        {track.index === currentTrackIndex && (
                          <span className="text-xs">▶</span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Track Navigation Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={previousTrack}
                className="bg-jewel-burgundy/90 hover:bg-jewel-burgundy text-warm-white p-3 rounded-full shadow-lg border-2 border-jewel-gold/30 hover:scale-110 transition-all duration-300"
                aria-label="Previous track"
                title="Previous track"
              >
                <SkipBack className="w-5 h-5" />
              </button>
              <button
                onClick={() => setShowPlaylist(!showPlaylist)}
                className="bg-jewel-burgundy/90 hover:bg-jewel-burgundy text-warm-white p-3 rounded-full shadow-lg border-2 border-jewel-gold/30 hover:scale-110 transition-all duration-300"
                aria-label={showPlaylist ? "Hide playlist" : "Show playlist"}
                title={showPlaylist ? "Hide playlist" : "Show playlist"}
              >
                <List className="w-5 h-5" />
              </button>
              <button
                onClick={nextTrack}
                className="bg-jewel-burgundy/90 hover:bg-jewel-burgundy text-warm-white p-3 rounded-full shadow-lg border-2 border-jewel-gold/30 hover:scale-110 transition-all duration-300"
                aria-label="Next track"
                title="Next track"
              >
                <SkipForward className="w-5 h-5" />
              </button>
            </div>

            {/* Main Mute/Unmute Button */}
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
        </div>
      )}
    </>
  )
}
