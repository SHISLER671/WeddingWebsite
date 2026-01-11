"use client"

import { useEffect, useRef, useState } from "react"

// YouTube IFrame API types
declare global {
  interface Window {
    YT: any
    onYouTubeIframeAPIReady: () => void
    weddingMusicPlayer: any // Global player instance
  }
}

interface YouTubePlayerProps {
  playlistId: string
  isPlaying: boolean
  isMuted: boolean
  onStateChange?: (isPlaying: boolean, isMuted: boolean) => void
}

export function YouTubePlayer({ playlistId, isPlaying, isMuted }: YouTubePlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [apiReady, setApiReady] = useState(false)
  const [playerReady, setPlayerReady] = useState(false)
  const initializedRef = useRef(false)

  // Load YouTube IFrame API script
  useEffect(() => {
    if (typeof window === "undefined") return

    // Check if already loaded
    if (window.YT && window.YT.Player) {
      setApiReady(true)
      return
    }

    // Check if script is already being loaded
    if (document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
      // Wait for it to load
      const checkReady = setInterval(() => {
        if (window.YT && window.YT.Player) {
          setApiReady(true)
          clearInterval(checkReady)
        }
      }, 100)
      return () => clearInterval(checkReady)
    }

    // Create script tag
    const tag = document.createElement("script")
    tag.src = "https://www.youtube.com/iframe_api"
    const firstScriptTag = document.getElementsByTagName("script")[0]
    firstScriptTag?.parentNode?.insertBefore(tag, firstScriptTag)

    // Set up callback (replace existing if any)
    const originalCallback = window.onYouTubeIframeAPIReady
    window.onYouTubeIframeAPIReady = () => {
      if (originalCallback) originalCallback()
      setApiReady(true)
    }
  }, [])

  // Initialize player once API is ready - use global instance
  useEffect(() => {
    if (!apiReady || !containerRef.current) return

    // Use global player instance if it exists
    if (window.weddingMusicPlayer) {
      setPlayerReady(true)
      console.log("[Music] Using existing global player instance")
      return
    }

    // Only initialize once
    if (initializedRef.current) return

    try {
      initializedRef.current = true
      window.weddingMusicPlayer = new window.YT.Player(containerRef.current, {
        height: "1",
        width: "1",
        playerVars: {
          listType: "playlist",
          list: playlistId,
          autoplay: 0,
          mute: 1,
          loop: 1,
          controls: 0,
          showinfo: 0,
          rel: 0,
          fs: 0,
          modestbranding: 1,
        },
        events: {
          onReady: (event: any) => {
            setPlayerReady(true)
            console.log("[Music] YouTube Player ready - global instance created")
          },
          onStateChange: (event: any) => {
            // Handle state changes if needed
            const state = event.data
            console.log("[Music] Player state changed:", state)
            // State 1 = playing, 2 = paused, 0 = ended
          },
          onError: (event: any) => {
            console.error("[Music] Player error:", event.data)
          },
        },
      })
    } catch (error) {
      console.error("[Music] Failed to create player:", error)
      initializedRef.current = false
    }
  }, [apiReady, playlistId])

  // Control playback - check state first to avoid restarting
  useEffect(() => {
    if (!playerReady || !window.weddingMusicPlayer || !window.YT || !window.YT.PlayerState) return

    try {
      const player = window.weddingMusicPlayer
      
      if (isPlaying) {
        // Check current state - only play if not already playing/buffering
        const playerState = player.getPlayerState()
        // YouTube PlayerState constants: 0=ended, 1=playing, 2=paused, 3=buffering, 5=cued
        const PLAYING = 1
        const BUFFERING = 3
        
        // Only call playVideo if not already playing/buffering
        if (playerState !== PLAYING && playerState !== BUFFERING) {
          console.log("[Music] Starting playback (state:", playerState, ")")
          player.playVideo()
        } else {
          console.log("[Music] Already playing, maintaining state")
        }
      } else {
        const playerState = player.getPlayerState()
        const PLAYING = 1
        if (playerState === PLAYING || playerState === 3) {
          console.log("[Music] Pausing playback")
          player.pauseVideo()
        }
      }
    } catch (error) {
      console.error("[Music] Playback control error:", error)
    }
  }, [isPlaying, playerReady])

  // Control mute state (this won't cause reload!)
  useEffect(() => {
    if (!playerReady || !window.weddingMusicPlayer) return

    try {
      const player = window.weddingMusicPlayer
      if (isMuted) {
        player.mute()
      } else {
        player.unMute()
      }
    } catch (error) {
      console.error("[Music] Mute control error:", error)
    }
  }, [isMuted, playerReady])

  return (
    <div
      ref={containerRef}
      style={{
        position: "absolute",
        top: "-9999px",
        left: "-9999px",
        width: "1px",
        height: "1px",
        visibility: "hidden",
      }}
    />
  )
}
