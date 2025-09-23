"use client"
import Image from "next/image"
import Link from "next/link"
import { Heart, Edit } from "lucide-react"

export default function Home() {
  return (
    <div className="min-h-screen relative">
      <div className="absolute inset-0 z-0">
        <Image src="/tricho.jpg" alt="Wedding background" fill className="object-cover" />
      </div>

      <div className="absolute inset-0 z-10 bg-charcoal/20"></div>

      <div className="relative z-20 min-h-screen flex flex-col items-center justify-center px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-light text-warm-white mb-4 tracking-wide">Pia & Ryan</h1>
          <p className="text-xl md:text-2xl text-warm-white/90 font-light text-chart-2">February 13, 2026</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-6">
          <Link
            href="/rsvp"
            className="bg-rose-gold hover:bg-rose-gold/90 text-charcoal px-10 py-4 text-lg font-medium rounded-full transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-3 min-w-[200px] justify-center"
          >
            <Heart className="w-5 h-5" />
            RSVP
          </Link>
          <Link
            href="/rsvp?edit=true"
            className="border-2 border-rose-gold text-rose-gold hover:bg-rose-gold hover:text-charcoal px-10 py-4 text-lg font-medium rounded-full transition-all duration-300 backdrop-blur-sm bg-warm-white/10 flex items-center gap-3 min-w-[200px] justify-center"
          >
            <Edit className="w-5 h-5" />
            Edit My RSVP
          </Link>
        </div>
      </div>
    </div>
  )
}
