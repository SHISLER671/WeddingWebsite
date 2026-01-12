"use client"

import { useEffect, useRef, useState } from "react"

// YouTube IFrame API types
declare global {
  interface Window {
    YT: any
    onYouTubeIframeAPIReady: () => void
    weddingMusicPlayer: any // Global player instance
    weddingMusicPlayerReady: boolean // Track if player is ready
    weddingMusicContainer: HTMLElement | null // Global container
  }
}

interface YouTubePlayerProps {
  playlistId: string
  isPlaying: boolean
  isMuted: boolean
  onStateChange?: (isPlaying: boolean, isMuted: boolean) => void
  onTrackChange?: (trackTitle: string | null) => void
  onTrackIndexChange?: (index: number | null) => void
  onPlaylistLoaded?: (playlist: Array<{ videoId: string; title: string | null; index: number }>) => void
  onNextTrack?: () => void
  onPreviousTrack?: () => void
}

// Create container once, outside React
function getOrCreateContainer(): HTMLElement | null {
  if (typeof window === "undefined") return null

  // Return existing container if it exists
  if (window.weddingMusicContainer) {
    return window.weddingMusicContainer
  }

  // Create container and store globally
  const container = document.createElement("div")
  container.id = "youtube-player-global-container"
  container.style.cssText =
    "position:fixed;top:-9999px;left:-9999px;width:1px;height:1px;visibility:hidden;pointer-events:none;z-index:-1;"
  
  // Append to body (outside React tree)
  document.body.appendChild(container)
  window.weddingMusicContainer = container

  return container
}

export function YouTubePlayer({
  playlistId,
  isPlaying,
  isMuted,
  onTrackChange,
  onTrackIndexChange,
  onPlaylistLoaded,
}: YouTubePlayerProps) {
  const [apiReady, setApiReady] = useState(false)
  const [playerReady, setPlayerReady] = useState(false)
  const initializedRef = useRef(false)
  const lastPlayingStateRef = useRef<boolean | null>(null)

  // Get/create container on mount
  useEffect(() => {
    if (typeof window === "undefined") return
    
    // Ensure container exists
    getOrCreateContainer()
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
    if (!apiReady) return

    const container = getOrCreateContainer()
    if (!container) return

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

    // Create inner container div for YouTube player
    let playerContainer = container.querySelector("#youtube-player-inner") as HTMLElement
    if (!playerContainer) {
      playerContainer = document.createElement("div")
      playerContainer.id = "youtube-player-inner"
      playerContainer.style.cssText = "width:1px;height:1px;"
      container.appendChild(playerContainer)
    }

    try {
      initializedRef.current = true

      window.weddingMusicPlayer = new window.YT.Player(playerContainer, {
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
          onReady: async (event: any) => {
            setPlayerReady(true)
            window.weddingMusicPlayerReady = true
            console.log("[Music] YouTube Player ready - global instance created")

            // Get playlist and initial track info
            try {
              const player = event.target
              
              // Get playlist video IDs
              const videoIds = player.getPlaylist() || []
              console.log("[Music] Playlist loaded, video count:", videoIds.length)

              // Get current track index
              const currentIndex = player.getPlaylistIndex()
              if (onTrackIndexChange) {
                onTrackIndexChange(currentIndex >= 0 ? currentIndex : null)
              }

              // Get initial track title
              const videoData = player.getVideoData()
              const trackTitle = videoData?.title || null
              if (trackTitle && onTrackChange) {
                onTrackChange(trackTitle)
              }

              // Build playlist array with video IDs (titles will be fetched on demand)
              const playlist = videoIds.map((videoId: string, index: number) => ({
                videoId,
                title: index === currentIndex ? trackTitle : null, // Only get title for current track initially
                index,
              }))

              if (onPlaylistLoaded) {
                onPlaylistLoaded(playlist)
              }
            } catch (error) {
              console.error("[Music] Error getting playlist info:", error)
            }
          },
          onStateChange: (event: any) => {
            const state = event.data
            console.log("[Music] Player state changed:", state)
            // State 1 = playing, 2 = paused, 0 = ended
            
            // When video starts playing (state 1), get the current track info
            if (state === 1 && window.weddingMusicPlayer) {
              try {
                const player = window.weddingMusicPlayer
                const videoData = player.getVideoData()
                const trackTitle = videoData?.title || null
                const currentIndex = player.getPlaylistIndex()
                
                console.log("[Music] Current track:", trackTitle, "Index:", currentIndex)
                
                if (onTrackChange) {
                  onTrackChange(trackTitle)
                }
                
                if (onTrackIndexChange) {
                  onTrackIndexChange(currentIndex >= 0 ? currentIndex : null)
                }
              } catch (error) {
                console.error("[Music] Error getting video data:", error)
              }
            }
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

  // Poll for current track info periodically when playing
  useEffect(() => {
    if (!playerReady || !isPlaying || !window.weddingMusicPlayer || !window.weddingMusicPlayerReady) return

    const updateTrackInfo = () => {
      try {
        const player = window.weddingMusicPlayer
        if (typeof player.getVideoData === "function") {
          const videoData = player.getVideoData()
          const trackTitle = videoData?.title || null
          if (trackTitle && onTrackChange) {
            onTrackChange(trackTitle)
          }
        }
      } catch (error) {
        // Silently fail - player might be transitioning
      }
    }

    // Update immediately
    updateTrackInfo()

    // Poll every 2 seconds to catch track changes
    const interval = setInterval(updateTrackInfo, 2000)

    return () => clearInterval(interval)
  }, [playerReady, isPlaying, onTrackChange])

  // Don't render anything - container is managed outside React
  return null
}
