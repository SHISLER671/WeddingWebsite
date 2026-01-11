"use client"

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react"

interface MusicContextType {
  isPlaying: boolean
  startMusic: () => void
  stopMusic: () => void
}

const MusicContext = createContext<MusicContextType | undefined>(undefined)

export function MusicProvider({ children }: { children: ReactNode }) {
  const [isPlaying, setIsPlaying] = useState(false)

  const startMusic = useCallback(() => {
    if (!isPlaying) {
      setIsPlaying(true)
      // Music will start via iframe interaction
    }
  }, [isPlaying])

  const stopMusic = useCallback(() => {
    setIsPlaying(false)
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
