"use client"

import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react"

interface MusicContextType {
  isPlaying: boolean
  isMuted: boolean
  currentTrack: string | null
  startMusic: () => void
  stopMusic: () => void
  toggleMute: () => void
  setCurrentTrack: (track: string | null) => void
  nextTrack: () => void
  previousTrack: () => void
}

const MusicContext = createContext<MusicContextType | undefined>(undefined)

const MUSIC_STATE_KEY = "wedding-music-playing"
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

  // Load persisted state from sessionStorage on mount
  useEffect(() => {
    const savedState = sessionStorage.getItem(MUSIC_STATE_KEY)
    if (savedState === "true") {
      setIsPlaying(true)
    }
  }, [])

  // Persist state to sessionStorage whenever it changes
  useEffect(() => {
    sessionStorage.setItem(MUSIC_STATE_KEY, String(isPlaying))
  }, [isPlaying])

  useEffect(() => {
    sessionStorage.setItem(MUSIC_MUTED_KEY, String(isMuted))
  }, [isMuted])

  const startMusic = useCallback(() => {
    if (!isPlaying) {
      setIsPlaying(true)
      sessionStorage.setItem(MUSIC_STATE_KEY, "true")
    }
  }, [isPlaying])

  const stopMusic = useCallback(() => {
    setIsPlaying(false)
    sessionStorage.setItem(MUSIC_STATE_KEY, "false")
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

  return (
    <MusicContext.Provider
      value={{
        isPlaying,
        isMuted,
        currentTrack,
        startMusic,
        stopMusic,
        toggleMute,
        setCurrentTrack: handleSetCurrentTrack,
        nextTrack,
        previousTrack,
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
