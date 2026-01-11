"use client"

import { useEffect, useRef, useState } from "react"

// YouTube IFrame API types
declare global {
  interface Window {
    YT: any
    onYouTubeIframeAPIReady: () => void
  }
}

interface YouTubePlayerProps {
  playlistId: string
  isPlaying: boolean
  isMuted: boolean
  onStateChange?: (isPlaying: boolean, isMuted: boolean) => void
}

export function YouTubePlayer({ playlistId, isPlaying, isMuted }: YouTubePlayerProps) {
  const playerRef = useRef<any>(null)
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

    return () => {
      // Cleanup if needed
    }
  }, [])

  // Initialize player once API is ready
  useEffect(() => {
    if (!apiReady || !containerRef.current || initializedRef.current) return

    try {
      initializedRef.current = true
      playerRef.current = new window.YT.Player(containerRef.current, {
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
            console.log("[Music] YouTube Player ready")
          },
          onStateChange: (event: any) => {
            // Handle state changes if needed
            console.log("[Music] Player state changed:", event.data)
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

  // Control playback
  useEffect(() => {
    if (!playerReady || !playerRef.current) return

    try {
      if (isPlaying) {
        // Check current state - if not playing, start
        const playerState = playerRef.current.getPlayerState()
        const PLAYING = window.YT.PlayerState.PLAYING
        const BUFFERING = window.YT.PlayerState.BUFFERING
        
        if (playerState !== PLAYING && playerState !== BUFFERING) {
          playerRef.current.playVideo()
        }
      } else {
        playerRef.current.pauseVideo()
      }
    } catch (error) {
      console.error("[Music] Playback control error:", error)
    }
  }, [isPlaying, playerReady])

  // Control mute state (this won't cause reload!)
  useEffect(() => {
    if (!playerReady || !playerRef.current) return

    try {
      if (isMuted) {
        playerRef.current.mute()
      } else {
        playerRef.current.unMute()
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
