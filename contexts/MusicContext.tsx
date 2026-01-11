"use client"

import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react"

interface MusicContextType {
  isPlaying: boolean
  startMusic: () => void
  stopMusic: () => void
}

const MusicContext = createContext<MusicContextType | undefined>(undefined)

const MUSIC_STATE_KEY = "wedding-music-playing"

export function MusicProvider({ children }: { children: ReactNode }) {
  const [isPlaying, setIsPlaying] = useState(false)

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

  return (
    <MusicContext.Provider value={{ isPlaying, startMusic, stopMusic }}>
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
