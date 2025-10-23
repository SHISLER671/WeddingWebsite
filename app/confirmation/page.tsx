"use client"
import Link from "next/link"
import { Calendar, MapPin, Clock, Gift, Edit, Heart, Flower2, MessageCircle, Wallet, Camera } from "lucide-react"
import WeddingChatbot from "../../components/WeddingChatbot/WeddingChatbot"
import { useChat } from "../../contexts/ChatContext"
import { useAccount } from "wagmi"
import { useLoginWithAbstract } from "@abstract-foundation/agw-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useSearchParams } from "next/navigation"
import { useState, useEffect } from "react"

export default function ConfirmationPage() {
  const searchParams = useSearchParams()
  const email = searchParams.get("email")
  const guestName = searchParams.get("name")
  const [seatingAssignment, setSeatingAssignment] = useState<any>(null)
  const [seatingStatus, setSeatingStatus] = useState<"idle" | "loading" | "found" | "not-found">("idle")

  useEffect(() => {
    if (email || guestName) {
      lookupSeatingAssignment(email, guestName)
    }
  }, [email, guestName])

  const lookupSeatingAssignment = async (email: string | null, name: string | null) => {
    setSeatingStatus("loading")
    try {
      let url = "/api/seating?"
      if (email) {
        url += `email=${encodeURIComponent(email)}`
      }
      if (name) {
        if (email) url += "&"
        url += `name=${encodeURIComponent(name)}`
      }
      
      const response = await fetch(url)
      const result = await response.json()
      
      if (result.success && result.hasSeating) {
        setSeatingAssignment(result.data)
        setSeatingStatus("found")
      } else {
        setSeatingAssignment(null)
        setSeatingStatus("not-found")
      }
    } catch (error) {
      console.error("Seating lookup error:", error)
      setSeatingStatus("not-found")
    }
  }
  return (
    <div className="min-h-screen confirmation-page-bg">
      <div className="relative overflow-hidden">
        <div className="relative z-10 px-4 py-16">
          <div className="max-w-4xl mx-auto">
            <div className="text-center">
              <h1 className="text-3xl md:text-5xl font-serif font-bold text-white tracking-wide mb-4 drop-shadow-2xl">
                🎉 Thank You for RSVPing! 🎉
              </h1>
              <p className="text-xl md:text-2xl text-soft-blush font-medium mb-2 drop-shadow-lg">
                We're absolutely thrilled you'll be joining us
              </p>
              <p className="text-lg md:text-xl text-white/90 font-light drop-shadow-md">
                for our special day on February 13th, 2026
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 pb-16">
        {/* Seating Assignment Display */}
        {seatingStatus === "loading" && (
          <div className="mb-8 bg-blue-50/80 backdrop-blur-sm rounded-2xl shadow-lg border border-blue-200/50 p-6">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
              <span className="text-blue-800 font-medium">Looking up your seating assignment...</span>
            </div>
          </div>
        )}
        
        {seatingStatus === "found" && seatingAssignment && (
          <div className="mb-8 bg-blue-50/80 backdrop-blur-sm rounded-2xl shadow-lg border border-blue-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
              </div>
              <h2 className="text-xl font-serif text-blue-900">Your Seating Assignment</h2>
            </div>
            <div className="text-2xl font-bold text-blue-900 mb-2">
              Table {seatingAssignment.table_number}, Seat {seatingAssignment.seat_number}
            </div>
            {seatingAssignment.plus_one_name && (
              <div className="text-blue-700">
                Plus One: {seatingAssignment.plus_one_name} (Seat {seatingAssignment.plus_one_seat})
              </div>
            )}
            {seatingAssignment.dietary_notes && (
              <div className="text-sm text-blue-600 mt-2">
                Dietary Notes: {seatingAssignment.dietary_notes}
              </div>
            )}
          </div>
        )}

        {seatingStatus === "not-found" && (
          <div className="mb-8 bg-blue-50/80 backdrop-blur-sm rounded-2xl shadow-lg border border-blue-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
              </div>
              <h2 className="text-xl font-serif text-blue-900">Seating Assignment</h2>
            </div>
            <div className="text-lg text-blue-900 mb-3">
              We're still finalizing seating arrangements for your table.
            </div>
            <div className="text-sm text-blue-800 mb-4">
              💌 Please contact us directly to confirm your seating - we want to make sure you have the perfect spot for our special day!
            </div>
            <div className="bg-white/40 rounded-lg p-4">
              <div className="text-sm text-blue-700 mb-2">
                <strong>Need to reach us?</strong>
              </div>
              <div className="text-xs text-blue-600">
                Use the "Contact Us" button below or reach out directly. We'll get you sorted with the perfect seat! 🪑
              </div>
            </div>
          </div>
        )}

        <div className="grid gap-8">
          {/* Date & Time Card */}
          <div className="bg-white/40 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-8 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-green-700/20 rounded-full flex items-center justify-center">
                <Calendar className="h-6 w-6 text-green-700" />
              </div>
              <h2 className="text-2xl font-light text-charcoal text-xl">Date & Time</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium text-charcoal/80 mb-2 text-lg">Wedding Date</h3>
                <p className="text-xl text-charcoal">Thursday, February 13, 2026</p>
              </div>
              <div>
                <h3 className="font-medium text-charcoal/80 mb-2 text-lg">Timeline</h3>
                <p className="text-xl text-charcoal">2:00 PM - 10:00 PM</p>
              </div>
            </div>
          </div>

          {/* Location Card */}
          <div className="bg-white/40 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-8 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-green-700/20 rounded-full flex items-center justify-center">
                <MapPin className="h-6 w-6 text-green-700" />
              </div>
              <h2 className="text-2xl font-light text-charcoal text-xl">Venues</h2>
            </div>
            <div className="space-y-6">
              <div className="p-4 bg-soft-blush/50 rounded-xl">
                <h3 className="font-medium text-charcoal mb-2 text-lg">Ceremony</h3>
                <p className="text-xl text-charcoal">Dulce Nombre de Maria Cathedral-Basilica</p>
                <p className="text-charcoal/70 text-lg">Hagåtña, Guam • 2:00 PM</p>
              </div>
              <div className="p-4 rounded-xl">
                <h3 className="font-medium text-charcoal mb-2 text-lg">Reception</h3>
                <p className="text-xl text-charcoal">Hotel Nikko Guam Tasi Ballroom</p>
                <p className="text-charcoal/70 text-lg">Tumon, Guam • 6:00 PM</p>
              </div>
            </div>
          </div>

          {/* Schedule Card */}
          <div className="bg-white/40 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-8 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-green-700/20 rounded-full flex items-center justify-center">
                <Clock className="h-6 w-6 text-green-700" />
              </div>
              <h2 className="text-2xl font-light text-charcoal text-xl">Schedule</h2>
            </div>
            <div className="space-y-4">
              {[
                { time: "2:00 PM", event: "Wedding Mass at Dulce Nombre de Maria Cathedral-Basilica" },
                { time: "2:45 PM", event: "Ceremony concludes - Family photos at Cathedral" },
                { time: "3:15 PM", event: "Travel to photo locations around Hagåtña" },
                { time: "4:00 PM", event: "Couple & wedding party photos at scenic locations" },
                { time: "5:00 PM", event: "Travel to Hotel Nikko Guam for reception" },
                { time: "6:00 PM", event: "Cocktail hour begins at Tasi Ballroom" },
                { time: "6:30 PM", event: "Reception dinner service begins" },
                { time: "7:30 PM", event: "Toasts and speeches" },
                { time: "8:00 PM", event: "First dance and dancing begins" },
                { time: "9:00 PM", event: "Cake cutting ceremony" },
                { time: "10:00 PM", event: "Reception concludes - send-off celebration" },
              ].map((item, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 p-3 rounded-lg hover:bg-soft-blush/30 transition-colors"
                >
                  <div className="w-20 text-green-700 font-medium text-lg">{item.time}</div>
                  <div className="flex-1 text-charcoal text-lg">{item.event}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Dress Code Card */}
          <div className="bg-white/40 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-8 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-green-700/20 rounded-full flex items-center justify-center">
                <Gift className="h-6 w-6 text-green-700" />
              </div>
              <h2 className="text-2xl font-light text-charcoal">Dress Code</h2>
            </div>
            <div>
              <h3 className="font-medium text-charcoal mb-2 text-lg">Dress Code</h3>
              <p className="text-charcoal/80 text-lg">Semi-Formal Attire</p>
              <p className="text-charcoal/60 mt-1 text-base">Cocktail or elegant dressy attire</p>
            </div>
          </div>
        </div>

        <section className="max-w-4xl mx-auto mt-16 mb-8">
          <div className="bg-white/40 backdrop-blur-sm rounded-2xl shadow-lg border border-jewel-fuchsia/20 p-8">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-serif text-jewel-burgundy mb-4">Let's Get Connected!</h3>
              <p className="text-charcoal/80 leading-relaxed text-lg">
                Thanks for RSVPing! Now the extra fun part - chat with Ezekiel (our AI wedding assistant) anytime you
                have questions, and if you're feeling adventurous, connect your AbstractGlobalWallet and click the 'Edit
                RSVP' button to save your wallet info for a special surprise from us after the wedding! 🎁
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-8">
              <ChatbotButton />
              <AGWWalletButton />
            </div>

            {/* Edit RSVP Button - Right below the wallet connection */}
            <div className="flex justify-center">
              <Link
                href="/rsvp?edit=true"
                className="border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white px-8 py-4 text-lg font-semibold rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-3 transform hover:scale-105"
              >
                <Edit className="w-6 h-6" />
                Edit RSVP
              </Link>
            </div>
          </div>
        </section>

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Ezekiel FAQ */}
          <Card className="border-white/20 shadow-lg bg-white/40 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-jewel-crimson/10 to-jewel-fuchsia/10">
              <CardTitle className="flex items-center gap-2 text-jewel-crimson">
                <MessageCircle className="w-5 h-5" />
                About Ezekiel
              </CardTitle>
              <CardDescription>Your 24/7 Wedding Buddy</CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="what">
                  <AccordionTrigger className="text-left text-sm">What can Ezekiel help with?</AccordionTrigger>
                  <AccordionContent className="text-sm text-gray-700">
                    Pretty much everything! Venue details, schedule, dress code, travel tips, hotel recommendations,
                    local restaurant suggestions, your RSVP status - you name it. He's available 24/7 and never gets
                    tired of answering questions!
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="how">
                  <AccordionTrigger className="text-left text-sm">How do I chat with him?</AccordionTrigger>
                  <AccordionContent className="text-sm text-gray-700">
                    Just click the "Chat with Ezekiel" button above! The chat window will pop up and you can start
                    asking questions right away. He's super friendly and easy to talk to - no complicated commands or
                    anything.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="safe">
                  <AccordionTrigger className="text-left text-sm">Is my info safe?</AccordionTrigger>
                  <AccordionContent className="text-sm text-gray-700">
                    Ezekiel uses secure connections and only sees the wedding info you already shared when you RSVP'd.
                    He doesn't store your conversations or collect any weird data. Your privacy is totally protected.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>

          {/* AGW FAQ */}
          <Card className="border-white/20 shadow-lg bg-white/40 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-green-700/10 to-teal-400/10">
              <CardTitle className="flex items-center gap-2 text-green-700">
                <Wallet className="w-5 h-5" />
                About the Wallet
              </CardTitle>
              <CardDescription>Abstract Global Wallet</CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="why">
                  <AccordionTrigger className="text-left text-sm">Why connect a wallet?</AccordionTrigger>
                  <AccordionContent className="text-sm text-gray-700">
                    Connect your wallet to get a special digital gift from us after the wedding! It's a unique keepsake
                    that combines tradition with modern tech - a perfect way to remember our celebration. Plus it's free
                    and takes like 30 seconds!
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="easy">
                  <AccordionTrigger className="text-left text-sm">Is it easy to set up?</AccordionTrigger>
                  <AccordionContent className="text-sm text-gray-700">
                    Super easy! Click the flower button and Abstract Global Wallet will automatically create a wallet
                    for you if you don't have one. No forms, no verification, no complicated setup. It literally takes
                    less than a minute - easier than most apps!
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="required">
                  <AccordionTrigger className="text-left text-sm">Do I have to do this?</AccordionTrigger>
                  <AccordionContent className="text-sm text-gray-700">
                    Nope! It's 100% optional. Your RSVP is totally valid whether you connect a wallet or not. This is
                    just a fun, modern option for anyone interested. Your presence at our wedding is what matters most!
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer - Encourage exploration */}
      <footer className="max-w-4xl mx-auto px-4 py-12 mt-8">
        <div className="bg-white/40 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-8 text-center">
          <h3 className="text-2xl font-serif text-jewel-burgundy mb-6">Don't Miss Out!</h3>
          <p className="text-lg text-charcoal/80 mb-6 leading-relaxed">
            Your RSVP is confirmed, but the fun doesn't stop here! Explore our wedding website to discover all the
            amazing features we've prepared for you.
          </p>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {/* Gallery Feature */}
            <div className="bg-blue-100/30 rounded-xl p-6">
              <Camera className="w-8 h-8 text-blue-600 mx-auto mb-3" />
              <h4 className="font-semibold text-charcoal mb-2">Live Photo Gallery</h4>
              <p className="text-sm text-charcoal/70 mb-3">
                The gallery is open now! Upload your favorite photos and memories.
              </p>
              <p className="text-xs text-blue-600 font-medium">
                📱 QR code available on wedding day for live event uploads!
              </p>
            </div>

            {/* Registry Feature */}
            <div className="bg-green-100/30 rounded-xl p-6">
              <Gift className="w-8 h-8 text-green-600 mx-auto mb-3" />
              <h4 className="font-semibold text-charcoal mb-2">Gift Registry</h4>
              <p className="text-sm text-charcoal/70 mb-3">Browse our curated registry and find the perfect gift.</p>
              <p className="text-xs text-green-600 font-medium">💎 Crypto gifts and traditional options available!</p>
            </div>

            {/* AI Assistant Feature */}
            <div className="bg-jewel-crimson/10 rounded-xl p-6">
              <Heart className="w-8 h-8 text-jewel-crimson mx-auto mb-3" />
              <h4 className="font-semibold text-charcoal mb-2">AI Wedding Assistant</h4>
              <p className="text-sm text-charcoal/70 mb-3">Chat with Ezekiel anytime for wedding questions and tips.</p>
              <p className="text-xs text-jewel-crimson font-medium">🤖 Available 24/7 to help with anything!</p>
            </div>
          </div>

          <div className="border-t border-jewel-burgundy/20 pt-6">
            <p className="text-charcoal/60 text-sm mb-2">
              Take your time to explore - there's so much more to discover!
            </p>
            <p className="text-jewel-burgundy font-semibold text-sm mb-6">
              👇 Click the buttons below to explore:
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Link
                href="/gallery"
                className="bg-blue-100/20 hover:bg-blue-100/30 border border-blue-300/30 hover:border-blue-300 text-blue-600 hover:text-blue-700 font-medium transition-all duration-200 py-3 px-4 rounded-lg text-center text-sm hover:shadow-md"
              >
                📸 Photo Gallery
              </Link>
              <Link 
                href="/gifts" 
                className="bg-green-100/20 hover:bg-green-100/30 border border-green-300/30 hover:border-green-300 text-green-600 hover:text-green-700 font-medium transition-all duration-200 py-3 px-4 rounded-lg text-center text-sm hover:shadow-md"
              >
                🎁 Gift Registry
              </Link>
              <Link 
                href="/info" 
                className="bg-jewel-gold/10 hover:bg-jewel-gold/20 border border-jewel-gold/30 hover:border-jewel-gold text-jewel-gold hover:text-jewel-burgundy font-medium transition-all duration-200 py-3 px-4 rounded-lg text-center text-sm hover:shadow-md"
              >
                ℹ️ Wedding Details
              </Link>
              <Link
                href="/contact"
                className="bg-jewel-burgundy/10 hover:bg-jewel-burgundy/20 border border-jewel-burgundy/30 hover:border-jewel-burgundy text-jewel-burgundy hover:text-jewel-crimson font-medium transition-all duration-200 py-3 px-4 rounded-lg text-center text-sm hover:shadow-md"
              >
                📞 Contact Us
              </Link>
            </div>
          </div>
        </div>
      </footer>

      <WeddingChatbot />
    </div>
  )
}

// Chatbot Button Component
function ChatbotButton() {
  const { actions } = useChat()

  const handleChatbotClick = () => {
    actions.openChat()
  }

  return (
    <button
      onClick={handleChatbotClick}
      className="flex flex-col items-center gap-3 p-6 bg-jewel-crimson hover:bg-jewel-burgundy text-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 min-w-[200px]"
    >
      <Heart className="w-8 h-8 text-white" />
      <span className="font-semibold text-lg text-white">Chat with Ezekiel</span>
      <span className="text-sm opacity-90 text-center text-white">AI Wedding Assistant</span>
    </button>
  )
}

// AGW Wallet Button Component
function AGWWalletButton() {
  const { address, status, isConnected } = useAccount()
  const { login, logout } = useLoginWithAbstract()

  const handleConnect = async () => {
    try {
      await login()
    } catch (error) {
      console.error("Failed to connect wallet:", error)
    }
  }

  const handleDisconnect = async () => {
    try {
      await logout()
    } catch (error) {
      console.error("Failed to disconnect wallet:", error)
    }
  }

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  return (
    <div className="flex flex-col items-center gap-3 min-w-[200px]">
      <button
        onClick={isConnected ? handleDisconnect : handleConnect}
        disabled={status === "connecting"}
        className="flex flex-col items-center gap-3 p-6 bg-green-700 hover:bg-green-700/90 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 w-full"
      >
        <Flower2 className="w-8 h-8 text-white" />
        <span className="font-semibold text-lg text-white">
          {status === "connecting" ? "Connecting..." : isConnected ? "Disconnect" : "Connect Wallet"}
        </span>
        <span className="text-sm opacity-90 text-center text-white">Abstract Global Wallet</span>
      </button>

      {isConnected && address && (
        <div className="bg-warm-white/80 backdrop-blur-sm rounded-lg p-3 shadow-sm w-full">
          <div className="text-xs text-charcoal/60 mb-1">Connected:</div>
          <div className="text-sm font-mono text-charcoal break-all">{formatAddress(address)}</div>
        </div>
      )}
    </div>
  )
}
