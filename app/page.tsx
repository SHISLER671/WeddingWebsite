"use client"
import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Heart, Edit, Gift, Camera, Info, ChevronDown } from "lucide-react"

export default function Home() {
  const [daysUntilWedding, setDaysUntilWedding] = useState<number | null>(null)
  const [showMenu, setShowMenu] = useState(false)

  useEffect(() => {
    // Calculate days until wedding
    const calculateDays = () => {
      const weddingDate = new Date("2026-02-13T00:00:00")
      const today = new Date()
      const diffTime = weddingDate.getTime() - today.getTime()
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      setDaysUntilWedding(diffDays)
    }

    calculateDays()
    // Update daily
    const interval = setInterval(calculateDays, 1000 * 60 * 60 * 24)
    return () => clearInterval(interval)
  }, [])

  const handleCountdownClick = () => {
    setShowMenu(!showMenu)
  }
  return (
    <div className="min-h-screen relative">
      <div className="absolute inset-0 z-0">
        <Image src="/redroses.jpg" alt="Wedding background" fill className="object-cover object-center" priority />
      </div>

      <div className="absolute inset-0 z-10 bg-jewel-burgundy/20"></div>

      <div className="relative z-20 min-h-screen flex flex-col items-center justify-center px-4 py-8">
        <div className="text-center mb-8 md:mb-12">
          <h1 className="text-4xl md:text-6xl font-light text-warm-white mb-4 tracking-wide drop-shadow-lg">
            <span className="text-gold-shimmer font-serif font-semibold">Pia & Ryan</span>
          </h1>
          <p className="text-xl md:text-2xl text-warm-white font-light drop-shadow-md font-sans mb-3">
            Friday, February 13, 2026
          </p>
          {daysUntilWedding !== null && daysUntilWedding > 0 && (
            <button
              onClick={handleCountdownClick}
              className="inline-block bg-jewel-gold/20 backdrop-blur-sm border-2 border-jewel-gold/50 rounded-full px-6 py-3 mt-2 cursor-pointer transition-all duration-300 hover:bg-jewel-gold/30 hover:border-jewel-gold hover:scale-105 hover:shadow-lg hover:shadow-jewel-gold/20 min-h-[60px] flex items-center gap-2 group"
            >
              <p className="text-lg md:text-xl text-gold-shimmer font-semibold drop-shadow-md">
                {daysUntilWedding} {daysUntilWedding === 1 ? "Day" : "Days"} Until the Big Day! 💕
              </p>
              <ChevronDown className={`w-5 h-5 text-gold-shimmer transition-transform duration-300 ${showMenu ? 'rotate-180' : 'group-hover:translate-y-1'}`} />
            </button>
          )}
          {daysUntilWedding !== null && daysUntilWedding === 0 && (
            <button
              onClick={handleCountdownClick}
              className="inline-block bg-jewel-crimson/30 backdrop-blur-sm border-2 border-jewel-gold rounded-full px-6 py-3 mt-2 cursor-pointer transition-all duration-300 hover:bg-jewel-crimson/40 hover:scale-105 hover:shadow-lg hover:shadow-jewel-crimson/20 min-h-[60px] flex items-center gap-2 group animate-pulse"
            >
              <p className="text-lg md:text-xl text-gold-shimmer font-bold drop-shadow-md">
                Today is the Day! 🎉💍
              </p>
              <ChevronDown className={`w-5 h-5 text-gold-shimmer transition-transform duration-300 ${showMenu ? 'rotate-180' : 'group-hover:translate-y-1'}`} />
            </button>
          )}
          {daysUntilWedding !== null && daysUntilWedding < 0 && (
            <button
              onClick={handleCountdownClick}
              className="inline-block bg-jewel-purple/20 backdrop-blur-sm border-2 border-jewel-purple/50 rounded-full px-6 py-3 mt-2 cursor-pointer transition-all duration-300 hover:bg-jewel-purple/30 hover:scale-105 hover:shadow-lg hover:shadow-jewel-purple/20 min-h-[60px] flex items-center gap-2 group"
            >
              <p className="text-lg md:text-xl text-warm-white font-semibold drop-shadow-md">
                Happily Married! 💑✨
              </p>
              <ChevronDown className={`w-5 h-5 text-warm-white transition-transform duration-300 ${showMenu ? 'rotate-180' : 'group-hover:translate-y-1'}`} />
            </button>
          )}
          
          {/* Clear instruction text */}
          <div className="mt-4 text-center">
            <p className="text-sm md:text-base text-warm-white/80 drop-shadow-md font-medium">
              Tap the countdown to explore wedding details
            </p>
          </div>
        </div>

        {/* Animated Navigation Menu */}
        <div className={`transition-all duration-500 ease-in-out overflow-hidden ${showMenu ? 'max-h-[600px] opacity-100 mt-6' : 'max-h-0 opacity-0'}`}>
          <div className="flex flex-col gap-4 md:gap-6 font-sans">
            <Link
              href="/rsvp"
              className="bg-jewel-burgundy hover:bg-jewel-crimson text-warm-white px-10 py-4 text-lg font-medium rounded-full transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-3 min-w-[200px] justify-center border-2 border-jewel-gold/30 transform hover:scale-105"
            >
              <Heart className="w-5 h-5" />
              RSVP
            </Link>
            <Link
              href="/rsvp?edit=true"
              className="border-2 border-jewel-fuchsia text-jewel-fuchsia hover:bg-jewel-fuchsia hover:text-warm-white px-10 py-4 text-lg font-medium rounded-full transition-all duration-300 backdrop-blur-sm bg-warm-white/10 flex items-center gap-3 min-w-[200px] justify-center shadow-lg transform hover:scale-105"
            >
              <Edit className="w-5 h-5" />
              Edit My RSVP
            </Link>
            <Link
              href="/gifts"
              className="border-2 border-jewel-emerald text-jewel-emerald hover:bg-jewel-emerald hover:text-warm-white px-10 py-4 text-lg font-medium rounded-full transition-all duration-300 backdrop-blur-sm bg-warm-white/10 flex items-center gap-3 min-w-[200px] justify-center shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <Gift className="w-5 h-5" />
              Registry & Gifts
            </Link>
            <Link
              href="/gallery"
              className="border-2 border-sky-400 text-sky-400 hover:bg-sky-400 hover:text-warm-white px-10 py-4 text-lg font-medium rounded-full transition-all duration-300 backdrop-blur-sm bg-warm-white/10 flex items-center gap-3 min-w-[200px] justify-center shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <Camera className="w-5 h-5" />
              Photo Gallery
            </Link>
            <Link
              href="/info"
              className="border-2 border-jewel-gold text-jewel-gold hover:bg-jewel-gold hover:text-jewel-burgundy px-10 py-4 text-lg font-medium rounded-full transition-all duration-300 backdrop-blur-sm bg-warm-white/10 flex items-center gap-3 min-w-[200px] justify-center shadow-lg transform hover:scale-105"
            >
              <Info className="w-5 h-5" />
              Wedding Details
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
