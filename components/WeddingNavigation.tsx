"use client"
import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { Heart, Edit, Gift, Camera, Info, Menu, X, Home, Loader2 } from "lucide-react"

interface WeddingNavigationProps {
  currentPage?: string
}

export default function WeddingNavigation({ currentPage }: WeddingNavigationProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isNavigating, setIsNavigating] = useState(false)
  const [navigatingTo, setNavigatingTo] = useState<string | null>(null)
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null)
  const [touchEnd, setTouchEnd] = useState<{ x: number; y: number } | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  // Keyboard navigation and focus management
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isMenuOpen) {
        setIsMenuOpen(false)
        buttonRef.current?.focus()
      }
      if ((event.key === 'm' || event.key === 'M') && !event.ctrlKey && !event.metaKey) {
        if (!isMenuOpen) {
          setIsMenuOpen(true)
          event.preventDefault()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isMenuOpen])

  // Focus management for menu
  useEffect(() => {
    if (isMenuOpen && menuRef.current) {
      // Focus first menu item when menu opens
      const firstMenuItem = menuRef.current.querySelector('a[href]') as HTMLAnchorElement
      if (firstMenuItem) {
        setTimeout(() => firstMenuItem.focus(), 100)
      }
    }
  }, [isMenuOpen])

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node) && 
          buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false)
      }
    }

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isMenuOpen])

  // Swipe gesture handling
  const minSwipeDistance = 50

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null)
    setTouchStart({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY
    })
  }

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY
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
        className="fixed top-4 left-4 z-50 bg-jewel-burgundy/90 backdrop-blur-sm text-warm-white p-3 rounded-full shadow-lg hover:bg-jewel-crimson transition-all duration-300 hover:scale-105 border-2 border-jewel-gold/30 hover:shadow-jewel-gold/20 hover:shadow-2xl"
        aria-label="Toggle navigation menu (Press 'M' to open, 'Escape' to close)"
        title="Navigation Menu (M to open, Esc to close)"
      >
        {isMenuOpen ? (
          <X className="w-5 h-5" />
        ) : (
          <Menu className="w-5 h-5" />
        )}
      </button>

      {/* Navigation Menu Overlay */}
      <div 
        className={`fixed inset-0 z-40 transition-all duration-300 ${isMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        role="dialog"
        aria-modal="true"
        aria-label="Wedding navigation menu"
        aria-hidden={!isMenuOpen}
      >
        {/* Backdrop */}
        <div 
          className="absolute inset-0 bg-black/50 backdrop-blur-md"
          onClick={() => setIsMenuOpen(false)}
        />
        
        {/* Menu Panel */}
        <div 
          ref={menuRef}
          className={`absolute top-0 left-0 h-full w-80 max-w-[85vw] bg-jewel-burgundy/95 backdrop-blur-lg border-r-2 border-jewel-gold/50 transform transition-all duration-300 ${isMenuOpen ? 'translate-x-0 shadow-2xl shadow-jewel-burgundy/20' : '-translate-x-full'}`}
          style={{
            background: 'linear-gradient(135deg, rgba(139, 69, 19, 0.95) 0%, rgba(101, 67, 33, 0.95) 100%)'
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
                  <Link
                    key={item.href}
                    href={item.href}
                    role="menuitem"
                    aria-label={`Navigate to ${item.label}${isCurrentPage ? ' (current page)' : ''}`}
                    aria-current={isCurrentPage ? 'page' : undefined}
                    onMouseEnter={() => {
                      // Preload the page on hover for faster navigation
                      const link = document.createElement('link')
                      link.rel = 'prefetch'
                      link.href = item.href
                      document.head.appendChild(link)
                    }}
                    onClick={() => {
                      setIsNavigating(true)
                      setNavigatingTo(item.href)
                      setIsMenuOpen(false)
                      // Add a small delay for smooth transition
                      setTimeout(() => {
                        window.location.href = item.href
                      }, 150)
                    }}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 border-2 backdrop-blur-sm bg-warm-white/10 ${item.color} ${
                      isCurrentPage 
                        ? 'border-jewel-gold bg-jewel-gold/20 shadow-lg' 
                        : 'border-transparent hover:shadow-lg hover:scale-105 active:scale-95'
                    } transform transition-transform touch-manipulation touch-feedback`}
                    style={{
                      animationDelay: `${index * 50}ms`,
                      animation: isMenuOpen ? 'slideInLeft 0.3s ease-out forwards' : 'none'
                    }}
                  >
                    {isNavigating && navigatingTo === item.href ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Icon className="w-5 h-5" />
                    )}
                    <span className="font-medium">{item.label}</span>
                    {isCurrentPage && (
                      <span className="ml-auto text-xs bg-jewel-gold/20 px-2 py-1 rounded-full text-gold-shimmer">
                        Current
                      </span>
                    )}
                  </Link>
                )
              })}
            </nav>

            <div className="mt-8 pt-6 border-t border-jewel-gold/30 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
              <p className="text-sm text-warm-white/70 text-center font-medium">
                Pia & Ryan Wedding
              </p>
              <p className="text-xs text-warm-white/50 text-center mt-1">
                February 13, 2026
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
