"use client"
import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Heart, Edit, Gift, Camera, Info, Menu, X, Home, Loader2 } from "lucide-react"

interface WeddingNavigationProps {
  currentPage: string
}

export default function WeddingNavigation({ currentPage }: WeddingNavigationProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isNavigating, setIsNavigating] = useState(false)
  const [navigatingTo, setNavigatingTo] = useState("")
  const buttonRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  // Touch state for swipe gestures
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null)
  const [touchEnd, setTouchEnd] = useState<{ x: number; y: number } | null>(null)

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+M or Cmd+M to toggle menu
      if ((e.ctrlKey || e.metaKey) && e.key === "m") {
        e.preventDefault()
        setIsMenuOpen((prev) => !prev)
      }
      // Escape to close menu
      if (e.key === "Escape" && isMenuOpen) {
        setIsMenuOpen(false)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isMenuOpen])

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node) &&
        isMenuOpen
      ) {
        setIsMenuOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [isMenuOpen])

  // Swipe gesture handling
  const minSwipeDistance = 50

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null)
    setTouchStart({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
    })
  }

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
    })
  }

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return

    const distanceX = touchStart.x - touchEnd.x
    const distanceY = touchStart.y - touchEnd.y
    const isLeftSwipe = distanceX > minSwipeDistance
    const isRightSwipe = distanceX < -minSwipeDistance
    const isVerticalSwipe = Math.abs(distanceY) > Math.abs(distanceX)

    // Only handle horizontal swipes
    if (!isVerticalSwipe) {
      if (isLeftSwipe && !isMenuOpen) {
        // Swipe left to open menu
        setIsMenuOpen(true)
      } else if (isRightSwipe && isMenuOpen) {
        // Swipe right to close menu
        setIsMenuOpen(false)
      }
    }
  }

  const navigationItems = [
    { href: "/", label: "Home", icon: Home, color: "text-jewel-gold hover:bg-jewel-gold hover:text-jewel-burgundy" },
    { href: "/rsvp", label: "RSVP", icon: Heart, color: "text-jewel-burgundy hover:bg-jewel-burgundy hover:text-warm-white" },
    { href: "/rsvp?edit=true", label: "Edit RSVP", icon: Edit, color: "text-jewel-fuchsia hover:bg-jewel-fuchsia hover:text-warm-white" },
    { href: "/gifts", label: "Registry & Gifts", icon: Gift, color: "text-jewel-emerald hover:bg-jewel-emerald hover:text-warm-white" },
    { href: "/gallery", label: "Photo Gallery", icon: Camera, color: "text-sky-400 hover:bg-sky-400 hover:text-warm-white" },
    { href: "/info", label: "Wedding Details", icon: Info, color: "text-jewel-gold hover:bg-jewel-gold hover:text-jewel-burgundy" },
  ]

  const handleNavigation = (href: string, e: React.MouseEvent) => {
    e.preventDefault()
    setIsNavigating(true)
    setNavigatingTo(href)
    setIsMenuOpen(false)
    
    // Use Next.js router for client-side navigation (preserves state)
    setTimeout(() => {
      router.push(href)
      // Clear navigation state after navigation
      setTimeout(() => {
        setIsNavigating(false)
        setNavigatingTo("")
      }, 300)
    }, 150)
  }

  return (
    <>
      {/* Global Loading Overlay */}
      {isNavigating && (
        <div className="fixed inset-0 z-[60] bg-black/30 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-jewel-burgundy/95 backdrop-blur-lg rounded-lg p-6 border-2 border-jewel-gold/50">
            <div className="flex items-center gap-3 text-warm-white">
              <Loader2 className="w-6 h-6 animate-spin text-jewel-gold" />
              <span className="font-medium">Navigating...</span>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Toggle Button */}
      <button
        ref={buttonRef}
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="fixed top-4 left-4 z-50 bg-jewel-burgundy/90 backdrop-blur-sm text-warm-white p-3 rounded-full shadow-lg hover:bg-jewel-crimson transition-all duration-300 hover:scale-105 border-2 border-jewel-gold/30 hover:shadow-jewel-gold/20 hover:shadow-2xl touch-manipulation w-12 h-12 sm:w-auto sm:h-auto"
        style={{
          // Ensure safe area on notched devices
          top: "max(1rem, env(safe-area-inset-top, 1rem))",
        }}
        aria-label="Toggle navigation menu (Press 'Ctrl+M' or 'Cmd+M' to open, 'Escape' to close)"
        title="Navigation Menu (Ctrl+M or Cmd+M to open, Esc to close)"
      >
        {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Navigation Menu Overlay */}
      <div
        className={`fixed inset-0 z-40 transition-all duration-300 ${isMenuOpen ? "opacity-100 visible" : "opacity-0 invisible"}`}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div
          ref={menuRef}
          className="absolute left-0 top-0 bottom-0 w-80 max-w-[85vw] bg-gradient-to-br from-jewel-burgundy via-jewel-crimson to-jewel-burgundy shadow-2xl transform transition-transform duration-300 ease-out"
          style={{
            transform: isMenuOpen ? "translateX(0)" : "translateX(-100%)",
            boxShadow: "4px 0 20px rgba(0, 0, 0, 0.3)",
          }}
        >
          <div className="p-6 pt-16">
            <h3 className="text-xl font-serif font-semibold text-gold-shimmer mb-6 text-center animate-fade-in-up">
              Wedding Navigation
            </h3>

            <nav className="space-y-3" role="menu" aria-label="Wedding website navigation">
              {navigationItems.map((item, index) => {
                const Icon = item.icon
                const isCurrentPage = currentPage === item.href

                return (
                  <a
                    key={item.href}
                    href={item.href}
                    role="menuitem"
                    aria-label={`Navigate to ${item.label}${isCurrentPage ? " (current page)" : ""}`}
                    aria-current={isCurrentPage ? "page" : undefined}
                    onMouseEnter={() => {
                      // Preload the page on hover for faster navigation
                      const link = document.createElement("link")
                      link.rel = "prefetch"
                      link.href = item.href
                      document.head.appendChild(link)
                    }}
                    onClick={(e) => handleNavigation(item.href, e)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 border-2 backdrop-blur-sm bg-warm-white/10 ${item.color} ${
                      isCurrentPage
                        ? "border-jewel-gold bg-jewel-gold/20 shadow-lg"
                        : "border-transparent hover:shadow-lg hover:scale-105 active:scale-95"
                    } transform transition-transform touch-manipulation touch-feedback cursor-pointer`}
                    style={{
                      animationDelay: `${index * 50}ms`,
                    }}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    <span className="font-medium">{item.label}</span>
                  </a>
                )
              })}
            </nav>
          </div>
        </div>

        {/* Backdrop */}
        {isMenuOpen && (
          <div
            className="absolute inset-0 bg-black/50 -z-10"
            onClick={() => setIsMenuOpen(false)}
            aria-hidden="true"
          />
        )}
      </div>
    </>
  )
}
