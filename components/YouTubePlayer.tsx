"use client"

import { useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"

// YouTube IFrame API types
declare global {
  interface Window {
    YT: any
    onYouTubeIframeAPIReady: () => void
    weddingMusicPlayer: any // Global player instance
    weddingMusicPlayerReady: boolean // Track if player is ready
  }
}

interface YouTubePlayerProps {
  playlistId: string
  isPlaying: boolean
  isMuted: boolean
  onStateChange?: (isPlaying: boolean, isMuted: boolean) => void
}

// Global container for player - created once, persists forever
const GLOBAL_CONTAINER_ID = "youtube-player-global-container"

function getOrCreateGlobalContainer(): HTMLElement {
  if (typeof window === "undefined") {
    // SSR fallback
    const div = document.createElement("div")
    return div
  }

  let container = document.getElementById(GLOBAL_CONTAINER_ID)
  if (!container) {
    container = document.createElement("div")
    container.id = GLOBAL_CONTAINER_ID
    container.style.cssText =
      "position:fixed;top:-9999px;left:-9999px;width:1px;height:1px;visibility:hidden;pointer-events:none;z-index:-1;"
    document.body.appendChild(container)
  }
  return container
}

export function YouTubePlayer({ playlistId, isPlaying, isMuted }: YouTubePlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [apiReady, setApiReady] = useState(false)
  const [playerReady, setPlayerReady] = useState(false)
  const initializedRef = useRef(false)
  const [globalContainer, setGlobalContainer] = useState<HTMLElement | null>(null)
  const lastPlayingStateRef = useRef<boolean | null>(null)

  // Get global container on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const container = getOrCreateGlobalContainer()
      setGlobalContainer(container)
    }
  }, [])

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
    if (!apiReady || !globalContainer || !containerRef.current) return

    // Use global player instance if it exists and is ready
    if (window.weddingMusicPlayer && window.weddingMusicPlayerReady) {
      try {
        // Check if player is still valid
        if (typeof window.weddingMusicPlayer.getPlayerState === "function") {
          setPlayerReady(true)
          console.log("[Music] Using existing global player instance")
          return
        }
      } catch (error) {
        // Player might be destroyed, recreate it
        console.log("[Music] Existing player invalid, will recreate")
        window.weddingMusicPlayer = null
        window.weddingMusicPlayerReady = false
      }
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
            window.weddingMusicPlayerReady = true
            console.log("[Music] YouTube Player ready - global instance created via portal")
          },
          onStateChange: (event: any) => {
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
  }, [apiReady, playlistId, globalContainer])

  // Control playback - ONLY change state if it actually changed
  useEffect(() => {
    if (!playerReady || !window.weddingMusicPlayer || !window.weddingMusicPlayerReady) return

    // Skip if state hasn't actually changed
    if (lastPlayingStateRef.current === isPlaying) {
      return
    }

    try {
      const player = window.weddingMusicPlayer

      // Safety check
      if (typeof player.getPlayerState !== "function") {
        console.warn("[Music] Player not ready, skipping playback control")
        return
      }

      const currentState = player.getPlayerState()
      const PLAYING = 1
      const BUFFERING = 3
      const PAUSED = 2

      if (isPlaying) {
        // Only play if not already playing/buffering
        if (currentState !== PLAYING && currentState !== BUFFERING) {
          console.log("[Music] Starting playback (current state:", currentState, ")")
          player.playVideo()
          lastPlayingStateRef.current = true
        } else {
          console.log("[Music] Already playing, no action needed")
          lastPlayingStateRef.current = true
        }
      } else {
        // Only pause if currently playing/buffering
        if (currentState === PLAYING || currentState === BUFFERING) {
          console.log("[Music] Pausing playback")
          player.pauseVideo()
          lastPlayingStateRef.current = false
        } else {
          console.log("[Music] Already paused, no action needed")
          lastPlayingStateRef.current = false
        }
      }
    } catch (error) {
      console.error("[Music] Playback control error:", error)
    }
  }, [isPlaying, playerReady])

  // Control mute state (this won't cause reload!)
  useEffect(() => {
    if (!playerReady || !window.weddingMusicPlayer || !window.weddingMusicPlayerReady) return

    try {
      const player = window.weddingMusicPlayer

      // Safety check
      if (typeof player.mute !== "function" || typeof player.unMute !== "function") {
        console.warn("[Music] Player not ready for mute control")
        return
      }

      if (isMuted) {
        player.mute()
      } else {
        player.unMute()
      }
    } catch (error) {
      console.error("[Music] Mute control error:", error)
    }
  }, [isMuted, playerReady])

  // Render player container via portal to global container
  if (!globalContainer) {
    return null
  }

  return createPortal(
    <div
      key="youtube-player-container"
      ref={containerRef}
      style={{
        width: "1px",
        height: "1px",
      }}
    />,
    globalContainer
  )
}
