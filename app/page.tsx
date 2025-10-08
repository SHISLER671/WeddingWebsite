"use client"
import Image from "next/image"
import Link from "next/link"
import { Heart, Edit, Gift, Camera, Info } from "lucide-react"

export default function Home() {
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
          <p className="text-xl md:text-2xl text-warm-white font-light drop-shadow-md font-sans">February 13, 2026</p>
        </div>

        <div className="flex flex-col gap-4 md:gap-6 font-sans">
          <Link
            href="/rsvp"
            className="bg-jewel-burgundy hover:bg-jewel-crimson text-warm-white px-10 py-4 text-lg font-medium rounded-full transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-3 min-w-[200px] justify-center border-2 border-jewel-gold/30"
          >
            <Heart className="w-5 h-5" />
            RSVP
          </Link>
          <Link
            href="/rsvp?edit=true"
            className="border-2 border-jewel-fuchsia text-jewel-fuchsia hover:bg-jewel-fuchsia hover:text-warm-white px-10 py-4 text-lg font-medium rounded-full transition-all duration-300 backdrop-blur-sm bg-warm-white/10 flex items-center gap-3 min-w-[200px] justify-center shadow-lg"
          >
            <Edit className="w-5 h-5" />
            Edit My RSVP
          </Link>
          <Link
            href="/gifts"
            className="border-2 border-jewel-emerald text-jewel-emerald hover:bg-jewel-emerald hover:text-warm-white px-10 py-4 text-lg font-medium rounded-full transition-all duration-300 backdrop-blur-sm bg-warm-white/10 flex items-center gap-3 min-w-[200px] justify-center shadow-lg hover:shadow-xl"
          >
            <Gift className="w-5 h-5" />
            Registry & Gifts
          </Link>
          <Link
            href="/gallery"
            className="border-2 border-sky-400 text-sky-400 hover:bg-sky-400 hover:text-warm-white px-10 py-4 text-lg font-medium rounded-full transition-all duration-300 backdrop-blur-sm bg-warm-white/10 flex items-center gap-3 min-w-[200px] justify-center shadow-lg hover:shadow-xl"
          >
            <Camera className="w-5 h-5" />
            Photo Gallery
          </Link>
          <Link
            href="/info"
            className="border-2 border-jewel-gold text-jewel-gold hover:bg-jewel-gold hover:text-jewel-burgundy px-10 py-4 text-lg font-medium rounded-full transition-all duration-300 backdrop-blur-sm bg-warm-white/10 flex items-center gap-3 min-w-[200px] justify-center shadow-lg"
          >
            <Info className="w-5 h-5" />
            Wedding Details
          </Link>
        </div>
      </div>
    </div>
  )
}
