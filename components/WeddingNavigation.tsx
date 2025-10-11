"use client"
import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { Heart, Edit, Gift, Camera, Info, Menu, X, Home } from "lucide-react"

interface WeddingNavigationProps {
  currentPage?: string
}

export default function WeddingNavigation({ currentPage }: WeddingNavigationProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isMenuOpen) {
        setIsMenuOpen(false)
        buttonRef.current?.focus()
      }
      if (event.key === 'm' || event.key === 'M') {
        if (!isMenuOpen) {
          setIsMenuOpen(true)
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
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
      {/* Navigation Toggle Button */}
      <button
        ref={buttonRef}
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="fixed top-4 left-4 z-50 bg-jewel-burgundy/90 backdrop-blur-sm text-warm-white p-3 rounded-full shadow-lg hover:bg-jewel-crimson transition-all duration-300 hover:scale-105 border-2 border-jewel-gold/30 animate-pulse"
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
      <div className={`fixed inset-0 z-40 transition-all duration-300 ${isMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
        {/* Backdrop */}
        <div 
          className="absolute inset-0 bg-black/50 backdrop-blur-md"
          onClick={() => setIsMenuOpen(false)}
        />
        
        {/* Menu Panel */}
        <div 
          ref={menuRef}
          className={`absolute top-0 left-0 h-full w-80 max-w-[85vw] bg-jewel-burgundy/95 backdrop-blur-lg border-r-2 border-jewel-gold/50 transform transition-transform duration-300 ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}
        >
          <div className="p-6 pt-16">
            <h3 className="text-xl font-serif font-semibold text-gold-shimmer mb-6 text-center">
              Wedding Navigation
            </h3>
            
            <nav className="space-y-3">
              {navigationItems.map((item, index) => {
                const Icon = item.icon
                const isCurrentPage = currentPage === item.href
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => {
                      setIsMenuOpen(false)
                      // Add a small delay for smooth transition
                      setTimeout(() => {
                        window.location.href = item.href
                      }, 150)
                    }}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 border-2 backdrop-blur-sm bg-warm-white/10 ${item.color} ${
                      isCurrentPage 
                        ? 'border-jewel-gold bg-jewel-gold/20 shadow-lg' 
                        : 'border-transparent hover:shadow-lg hover:scale-105'
                    } transform transition-transform`}
                    style={{
                      animationDelay: `${index * 50}ms`,
                      animation: isMenuOpen ? 'slideInLeft 0.3s ease-out forwards' : 'none'
                    }}
                  >
                    <Icon className="w-5 h-5" />
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

            <div className="mt-8 pt-6 border-t border-jewel-gold/30">
              <p className="text-sm text-warm-white/70 text-center">
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
