"use client"

import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react"

interface PlaylistTrack {
  videoId: string
  title: string | null
  index: number
}

interface MusicContextType {
  isPlaying: boolean
  isMuted: boolean
  currentTrack: string | null
  currentTrackIndex: number | null
  playlist: PlaylistTrack[]
  startMusic: () => void
  stopMusic: () => void
  toggleMute: () => void
  setCurrentTrack: (track: string | null) => void
  setCurrentTrackIndex: (index: number | null) => void
  setPlaylist: (playlist: PlaylistTrack[]) => void
  nextTrack: () => void
  previousTrack: () => void
  playTrackAtIndex: (index: number) => void
}

const MusicContext = createContext<MusicContextType | undefined>(undefined)

const MUSIC_MUTED_KEY = "music-muted"

export function MusicProvider({ children }: { children: ReactNode }) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(() => {
    if (typeof window !== "undefined") {
      return sessionStorage.getItem(MUSIC_MUTED_KEY) !== "false"
    }
    return true
  })
  const [currentTrack, setCurrentTrack] = useState<string | null>(null)
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number | null>(null)
  const [playlist, setPlaylist] = useState<PlaylistTrack[]>([])

  useEffect(() => {
    sessionStorage.setItem(MUSIC_MUTED_KEY, String(isMuted))
  }, [isMuted])

  const startMusic = useCallback(() => {
    if (!isPlaying) {
      setIsPlaying(true)
    }
  }, [isPlaying])

  const stopMusic = useCallback(() => {
    setIsPlaying(false)
  }, [])

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const newState = !prev
      sessionStorage.setItem(MUSIC_MUTED_KEY, String(newState))
      return newState
    })
  }, [])

  const handleSetCurrentTrack = useCallback((track: string | null) => {
    setCurrentTrack(track)
  }, [])

  const nextTrack = useCallback(() => {
    if (typeof window !== "undefined" && window.weddingMusicPlayer && window.weddingMusicPlayerReady) {
      try {
        window.weddingMusicPlayer.nextVideo()
      } catch (error) {
        console.error("[Music] Error skipping to next track:", error)
      }
    }
  }, [])

  const previousTrack = useCallback(() => {
    if (typeof window !== "undefined" && window.weddingMusicPlayer && window.weddingMusicPlayerReady) {
      try {
        window.weddingMusicPlayer.previousVideo()
      } catch (error) {
        console.error("[Music] Error skipping to previous track:", error)
      }
    }
  }, [])

  const playTrackAtIndex = useCallback((index: number) => {
    if (typeof window !== "undefined" && window.weddingMusicPlayer && window.weddingMusicPlayerReady) {
      try {
        window.weddingMusicPlayer.playVideoAt(index)
      } catch (error) {
        console.error("[Music] Error playing track at index:", error)
      }
    }
  }, [])

  const handleSetCurrentTrackIndex = useCallback((index: number | null) => {
    setCurrentTrackIndex(index)
  }, [])

  const handleSetPlaylist = useCallback((newPlaylist: PlaylistTrack[]) => {
    setPlaylist(newPlaylist)
  }, [])

  return (
    <MusicContext.Provider
      value={{
        isPlaying,
        isMuted,
        currentTrack,
        currentTrackIndex,
        playlist,
        startMusic,
        stopMusic,
        toggleMute,
        setCurrentTrack: handleSetCurrentTrack,
        setCurrentTrackIndex: handleSetCurrentTrackIndex,
        setPlaylist: handleSetPlaylist,
        nextTrack,
        previousTrack,
        playTrackAtIndex,
      }}
    >
      {children}
    </MusicContext.Provider>
  )
}

export function useMusic() {
  const context = useContext(MusicContext)
  if (context === undefined) {
    throw new Error("useMusic must be used within a MusicProvider")
  }
  return context
}
