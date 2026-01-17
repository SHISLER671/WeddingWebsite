"use client"

import { useEffect, useState } from "react"
import { useMusic } from "@/contexts/MusicContext"
import { YouTubePlayer } from "./YouTubePlayer"
import { Eye, EyeOff, List, Pause, Play, SkipBack, SkipForward, Volume2, VolumeX, X } from "lucide-react"

const YOUTUBE_PLAYLIST_ID = "PLpW1t4-1G91SnoEhXi324hjIG41PI_kUh"

export default function BackgroundMusicPlayer() {
  const {
    isPlaying,
    isMuted,
    currentTrack,
    currentTrackIndex,
    playlist,
    startMusic,
    stopMusic,
    toggleMute,
    setCurrentTrack,
    setCurrentTrackIndex,
    setPlaylist,
    nextTrack,
    previousTrack,
    playTrackAtIndex,
  } = useMusic()
  const [showPlaylist, setShowPlaylist] = useState(false)
  const [showVideo, setShowVideo] = useState(true)
  const [loadingTitles, setLoadingTitles] = useState(false)

  // Ensure music stops when leaving the Gallery page (unmount)
  useEffect(() => {
    return () => {
      try {
        stopMusic()
      } catch {}

      if (typeof window !== "undefined" && window.weddingMusicPlayer && window.weddingMusicPlayerReady) {
        try {
          window.weddingMusicPlayer.pauseVideo()
        } catch {}
      }
    }
  }, [stopMusic])

  // Fetch titles for all tracks when playlist is expanded (using YouTube oEmbed API)
  useEffect(() => {
    if (showPlaylist && playlist.length > 0) {
      // Check if we need to fetch titles
      const needsTitles = playlist.some((track) => !track.title)
      if (!needsTitles) return

      setLoadingTitles(true)
      const fetchTitles = async () => {
        try {
          const updatedPlaylist = [...playlist]

          // Fetch titles using YouTube oEmbed API (no API key needed)
          const fetchPromises = updatedPlaylist.map(async (track, index) => {
            if (!track.title) {
              try {
                const response = await fetch(
                  `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${track.videoId}&format=json`
                )
                if (response.ok) {
                  const data = await response.json()
                  return { index, title: data.title }
                }
              } catch (error) {
                console.error(`[Music] Error fetching title for track ${index}:`, error)
              }
            }
            return null
          })

          const results = await Promise.all(fetchPromises)
          results.forEach((result) => {
            if (result && updatedPlaylist[result.index]) {
              updatedPlaylist[result.index].title = result.title
            }
          })

          setPlaylist(updatedPlaylist)
        } catch (error) {
          console.error("[Music] Error fetching playlist titles:", error)
        } finally {
          setLoadingTitles(false)
        }
      }

      fetchTitles()
    }
  }, [showPlaylist, playlist, setPlaylist])

  return (
    <div className="bg-white/70 backdrop-blur-md rounded-2xl shadow-xl p-6 border-t-4 border-jewel-burgundy">
      {/* YouTube Player using IFrame API for continuous playback */}
      <YouTubePlayer
        playlistId={YOUTUBE_PLAYLIST_ID}
        isPlaying={isPlaying}
        isMuted={isMuted}
        showVideo={showVideo}
        showNativeControls={true}
        onTrackChange={setCurrentTrack}
        onTrackIndexChange={setCurrentTrackIndex}
        onPlaylistLoaded={setPlaylist}
      />

      <div className="flex items-center gap-3 mb-4">
        <span className="text-3xl">Music</span>
        <h3 className="text-2xl font-serif font-bold text-jewel-fuchsia">The Soundtrack to Our Story</h3>
      </div>

      <p className="text-charcoal/70 mb-5 italic">
        Music is optional on this page. It will not start unless you press play.
      </p>

      <div className="mb-4">
        <button
          onClick={() => setShowVideo((v) => !v)}
          className="inline-flex items-center justify-center gap-2 bg-white/80 hover:bg-white text-charcoal px-4 py-2 rounded-full transition-all duration-300 shadow-md border border-rose-gold/40 font-semibold"
          type="button"
          aria-label={showVideo ? "Hide video" : "Show video"}
        >
          {showVideo ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          <span className="text-sm">{showVideo ? "Hide Video" : "Show Video"}</span>
        </button>
      </div>

      {/* Expandable Playlist */}
      {showPlaylist && playlist.length > 0 && (
        <div className="mb-4 bg-jewel-burgundy/95 backdrop-blur-md rounded-2xl shadow-2xl border-4 border-jewel-gold p-4 max-h-[340px] overflow-y-auto w-full">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-warm-white font-bold text-lg">Playlist</h4>
            <button
              onClick={() => setShowPlaylist(false)}
              className="text-warm-white hover:text-jewel-gold transition-colors"
              aria-label="Close playlist"
              type="button"
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
                  startMusic()
                  setShowPlaylist(false)
                }}
                className={`w-full text-left px-3 py-2 rounded-lg transition-all duration-200 ${
                  track.index === currentTrackIndex
                    ? "bg-jewel-gold text-jewel-burgundy font-semibold"
                    : "bg-warm-white/10 text-warm-white hover:bg-warm-white/20"
                }`}
                type="button"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs opacity-70">#{track.index + 1}</span>
                  <span className="truncate flex-1">{track.title || `Track ${track.index + 1}`}</span>
                  {track.index === currentTrackIndex && <span className="text-xs">Playing</span>}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <button
          onClick={() => (isPlaying ? stopMusic() : startMusic())}
          className="inline-flex items-center justify-center gap-2 bg-jewel-burgundy hover:bg-jewel-crimson text-warm-white px-5 py-3 rounded-full transition-all duration-300 shadow-lg border-2 border-jewel-gold/30 font-semibold"
          type="button"
          aria-label={isPlaying ? "Pause music" : "Play music"}
        >
          {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          <span>{isPlaying ? "Pause Music" : "Play Music"}</span>
        </button>

        <button
          onClick={toggleMute}
          className={`inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full transition-all duration-300 shadow-lg border-2 font-semibold ${
            isMuted
              ? "bg-jewel-gold/90 hover:bg-jewel-gold text-jewel-burgundy border-jewel-burgundy/40"
              : "bg-white/80 hover:bg-white text-charcoal border-rose-gold/40"
          }`}
          type="button"
          aria-label={isMuted ? "Unmute music" : "Mute music"}
        >
          {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          <span>{isMuted ? "Unmute" : "Mute"}</span>
        </button>

        <button
          onClick={() => setShowPlaylist((v) => !v)}
          className="inline-flex items-center justify-center gap-2 bg-white/80 hover:bg-white text-charcoal px-5 py-3 rounded-full transition-all duration-300 shadow-lg border-2 border-rose-gold/40 font-semibold"
          type="button"
          aria-label={showPlaylist ? "Hide playlist" : "Show playlist"}
        >
          <List className="w-5 h-5" />
          <span>{showPlaylist ? "Hide Playlist" : "Show Playlist"}</span>
        </button>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button
          onClick={previousTrack}
          className="inline-flex items-center justify-center gap-2 bg-jewel-burgundy/90 hover:bg-jewel-burgundy text-warm-white px-4 py-2 rounded-full shadow-md border border-jewel-gold/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Previous track"
          title="Previous track"
          type="button"
          disabled={!playlist.length}
        >
          <SkipBack className="w-4 h-4" />
          <span className="text-sm font-semibold">Prev</span>
        </button>
        <button
          onClick={nextTrack}
          className="inline-flex items-center justify-center gap-2 bg-jewel-burgundy/90 hover:bg-jewel-burgundy text-warm-white px-4 py-2 rounded-full shadow-md border border-jewel-gold/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Next track"
          title="Next track"
          type="button"
          disabled={!playlist.length}
        >
          <SkipForward className="w-4 h-4" />
          <span className="text-sm font-semibold">Next</span>
        </button>
      </div>

      {currentTrack && (
        <div className="mt-4 text-charcoal/80">
          <span className="font-semibold">Now playing:</span> <span className="italic">"{currentTrack}"</span>
        </div>
      )}

      {loadingTitles && <div className="mt-3 text-sm text-charcoal/60">Loading playlist details…</div>}
    </div>
  )
}
