"use client"
import Link from "next/link"
import { Calendar, MapPin, Gift, Edit, Heart, Flower2, MessageCircle, Wallet, Camera } from "lucide-react"
import { useChat } from "../../contexts/ChatContext"
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
  const [seatingStatus, setSeatingStatus] = useState<"idle" | "loading" | "found" | "not-found" | "seating-full">(
    "idle",
  )

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
      } else if (result.seatingFull) {
        setSeatingAssignment(null)
        setSeatingStatus("seating-full")
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
                Thank You for RSVPing!
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
          <div className="mb-8 bg-white/70 backdrop-blur-md rounded-2xl shadow-lg border border-jewel-burgundy/30 p-6">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-jewel-burgundy"></div>
              <span className="text-jewel-burgundy font-medium">Looking up your seating assignment...</span>
            </div>
          </div>
        )}

        {seatingStatus === "found" && seatingAssignment && (
          <div className="mb-8 bg-white/70 backdrop-blur-md rounded-2xl shadow-lg border border-jewel-burgundy/30 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-jewel-sapphire/20 rounded-full flex items-center justify-center">
                <div className="w-3 h-3 bg-jewel-sapphire rounded-full"></div>
              </div>
              <h2 className="text-xl font-serif text-jewel-sapphire">Your Seating Assignment</h2>
            </div>
            <div className="text-2xl font-bold text-jewel-sapphire mb-2">Table {seatingAssignment.table_number}</div>
            {seatingAssignment.plus_one_name && (
              <div className="text-jewel-sapphire">Additional guest: {seatingAssignment.plus_one_name}</div>
            )}
            {seatingAssignment.dietary_notes && (
              <div className="text-sm text-jewel-burgundy/80 mt-2">
                Dietary Notes: {seatingAssignment.dietary_notes}
              </div>
            )}
          </div>
        )}

        {seatingStatus === "seating-full" && (
          <div className="mb-8 bg-white/70 backdrop-blur-md rounded-2xl shadow-lg border border-jewel-burgundy/30 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-jewel-burgundy/20 rounded-full flex items-center justify-center">
                <div className="w-3 h-3 bg-jewel-burgundy rounded-full"></div>
              </div>
              <h2 className="text-xl font-serif text-jewel-burgundy">Seating Assignment</h2>
            </div>
            <div className="text-2xl font-bold text-jewel-sapphire mb-2">
              Please check with the wedding party regarding your seating
            </div>
            <div className="text-base text-jewel-burgundy/80 mt-3">
              We're so excited you'll be joining us! Please reach out to us directly so we can ensure you have a
              wonderful spot for our celebration.
            </div>
          </div>
        )}

        {seatingStatus === "not-found" && (
          <div className="mb-8 bg-white/70 backdrop-blur-md rounded-2xl shadow-lg border border-jewel-burgundy/30 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-jewel-burgundy/20 rounded-full flex items-center justify-center">
                <div className="w-3 h-3 bg-jewel-burgundy rounded-full"></div>
              </div>
              <h2 className="text-xl font-serif text-jewel-burgundy">Seating Assignment</h2>
            </div>
            <div className="text-lg text-jewel-burgundy mb-3">
              We're still finalizing seating arrangements for your table.
            </div>
            <div className="text-base md:text-sm text-jewel-crimson mb-4">
              Please contact us directly to confirm your seating - we want to make sure you have the perfect spot for
              our special day!
            </div>
            <div className="bg-white/40 rounded-lg p-4">
              <div className="text-sm text-jewel-burgundy mb-2">
                <strong>Need to reach us?</strong>
              </div>
              <div className="text-xs text-jewel-burgundy/80">
                Use the "Contact Us" button below or reach out directly. We'll get you sorted with the perfect seat!
              </div>
            </div>
          </div>
        )}

        <div className="grid gap-8">
          {/* Date & Time Card */}
          <div className="bg-white/70 backdrop-blur-md rounded-2xl shadow-lg border-t-4 border-jewel-burgundy p-8 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-jewel-emerald/20 rounded-full flex items-center justify-center">
                <Calendar className="h-6 w-6 text-jewel-emerald" />
              </div>
              <h2 className="text-2xl font-light text-charcoal text-xl">Date & Time</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium text-charcoal/80 mb-2 text-lg">Wedding Date</h3>
                <p className="text-xl text-charcoal">Friday, February 13, 2026</p>
              </div>
              <div>
                <h3 className="font-medium text-charcoal/80 mb-2 text-lg">Timeline</h3>
                <p className="text-xl text-charcoal">Sacrament of Holy Matrimony Mass: 2pm • Reception: 6:30pm</p>
              </div>
            </div>
          </div>

          {/* Location Card */}
          <div className="bg-white/70 backdrop-blur-md rounded-2xl shadow-lg border-t-4 border-jewel-burgundy p-8 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-green-700/20 rounded-full flex items-center justify-center">
                <MapPin className="h-6 w-6 text-green-700" />
              </div>
              <h2 className="text-2xl font-light text-charcoal text-xl">Venues</h2>
            </div>
            <div className="space-y-6">
              <div className="p-4 bg-soft-blush/50 rounded-xl">
                <h3 className="font-medium text-charcoal mb-2 text-lg">Sacrament of Holy Matrimony Mass</h3>
                <p className="text-xl text-charcoal">Dulce Nombre de Maria Cathedral-Basilica</p>
                <p className="text-charcoal/70 text-lg">Hagåtña, Guam • 2pm</p>
              </div>
              <div className="p-4 rounded-xl">
                <h3 className="font-medium text-charcoal mb-2 text-lg">Reception</h3>
                <p className="text-xl text-charcoal">Hotel Nikko Guam, Tasi Ballroom</p>
                <p className="text-charcoal/70 text-lg">Tumon, Guam • 6:30pm</p>
              </div>
            </div>
          </div>

          {/* Schedule Card removed as requested */}

          {/* Dress Code Card */}
          <div className="bg-white/70 backdrop-blur-md rounded-2xl shadow-lg border-t-4 border-jewel-burgundy p-8 hover:shadow-xl transition-shadow duration-300">
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

        {/* Don't Miss Out - moved up to appear right after Dress Code */}
        <section className="max-w-4xl mx-auto mt-16 mb-8">
          <div className="bg-white/70 backdrop-blur-md rounded-2xl shadow-lg border-t-4 border-jewel-burgundy p-8 text-center">
            <h3 className="text-2xl font-serif text-jewel-burgundy mb-6">Don't Miss Out!</h3>
            <p className="text-lg text-charcoal/80 mb-6 leading-relaxed">
              Your RSVP is confirmed, but the fun doesn't stop here! Explore our wedding website to discover all the
              amazing features we've prepared for you.
            </p>

            <div className="grid md:grid-cols-3 gap-6 mb-2">
              {/* Gallery Feature */}
              <Link
                href="/gallery"
                className="rounded-xl p-6 transition-all duration-300 hover:shadow-xl cursor-pointer border-2 border-jewel-sapphire text-jewel-sapphire hover:bg-jewel-sapphire hover:text-warm-white"
              >
                <Camera className="w-8 h-8 text-jewel-sapphire mx-auto mb-3" />
                <h4 className="font-semibold text-charcoal mb-2">Live Photo Gallery</h4>
                <p className="text-base md:text-sm text-charcoal/70 mb-3">
                  The gallery is open now! Upload your favorite photos and memories.
                </p>
                <p className="text-xs text-jewel-sapphire font-medium">
                  QR code available on wedding day for live event uploads.
                </p>
              </Link>

              {/* Registry Feature */}
              <Link
                href="/gifts"
                className="rounded-xl p-6 transition-all duration-300 hover:shadow-xl cursor-pointer border-2 border-jewel-emerald text-jewel-emerald hover:bg-jewel-emerald hover:text-warm-white"
              >
                <Gift className="w-8 h-8 text-jewel-emerald mx-auto mb-3" />
                <h4 className="font-semibold text-charcoal mb-2">Gift Registry</h4>
                <p className="text-base md:text-sm text-charcoal/70 mb-3">
                  Browse our curated registry and find the perfect gift.
                </p>
                <p className="text-xs text-jewel-emerald font-medium">
                  Crypto gifts and traditional options available.
                </p>
              </Link>

              {/* Wedding Details Feature */}
              <Link
                href="/info"
                className="rounded-xl p-6 transition-all duration-300 hover:shadow-xl cursor-pointer border-2 border-jewel-gold text-jewel-gold hover:bg-jewel-gold hover:text-jewel-burgundy"
              >
                <div className="w-8 h-8 text-jewel-gold mx-auto mb-3 flex items-center justify-center">
                  <div className="w-6 h-6 bg-jewel-gold rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">i</span>
                  </div>
                </div>
                <h4 className="font-semibold text-charcoal mb-2">Wedding Details</h4>
                <p className="text-base md:text-sm text-charcoal/70 mb-3">
                  Everything you need to know about our special day.
                </p>
                <p className="text-xs text-jewel-gold font-medium">Schedule, venues, and all the important info.</p>
              </Link>
            </div>
            <div className="border-t border-jewel-burgundy/20 pt-4">
              <p className="text-charcoal/60 text-sm">Tap any card to explore more</p>
            </div>
          </div>
        </section>

        {/* Let's Get Connected comes after Don't Miss Out */}
        <section className="max-w-4xl mx-auto mt-6 mb-8">
          <div className="bg-white/70 backdrop-blur-md rounded-2xl shadow-lg border-t-4 border-jewel-burgundy p-8">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-serif text-jewel-burgundy mb-4">Let's Get Connected!</h3>
              <p className="text-charcoal/80 leading-relaxed text-lg">
                Thanks for RSVPing! Now the extra fun part - chat with Ezekiel (our AI wedding assistant) anytime you
                have questions, and if you're feeling adventurous, connect your AbstractGlobalWallet ( What's this? See
                below ) and click the 'Edit RSVP' button to save your wallet info for a special surprise from us after
                the wedding! 🎁
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
                className="border-2 border-jewel-sapphire text-white hover:bg-jewel-sapphire hover:text-white px-8 py-4 text-lg font-semibold rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-3 transform hover:scale-105"
              >
                <Edit className="w-6 h-6" />
                Edit RSVP
              </Link>
            </div>
          </div>
        </section>

        {/* About sections follow */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Ezekiel FAQ */}
          <Card className="border-white/20 shadow-lg bg-white/70 backdrop-blur-md">
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
          <Card className="border-white/20 shadow-lg bg-white/70 backdrop-blur-md">
            <CardHeader className="bg-gradient-to-r from-jewel-emerald/10 to-jewel-sapphire/10">
              <CardTitle className="flex items-center gap-2 text-jewel-emerald">
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
                    Super easy! Click the button above and Abstract Global Wallet will automatically create a wallet for
                    you if you don't have one. No forms, no verification, no complicated setup. It literally takes less
                    than a minute - easier than most apps!
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

      {/* Final CTA - Contact Us */}
      <section className="max-w-4xl mx-auto px-4 py-12 mt-2">
        <div className="flex justify-center">
          <Link
            href="/contact"
            className="bg-jewel-burgundy/10 hover:bg-jewel-burgundy/20 border border-jewel-burgundy/30 hover:border-jewel-burgundy text-white font-medium transition-all duration-200 py-3 px-8 rounded-lg text-center text-sm hover:shadow-md"
          >
            Contact Us
          </Link>
        </div>
      </section>
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
  const { login, logout } = useLoginWithAbstract()
  const [walletState, setWalletState] = useState<{
    address: string | null
    isConnected: boolean
    status: "idle" | "connecting" | "connected" | "disconnected"
  }>({
    address: null,
    isConnected: false,
    status: "idle",
  })

  const handleConnect = async () => {
    try {
      setWalletState((prev) => ({ ...prev, status: "connecting" }))
      const result = await login()
      if (result?.address) {
        setWalletState({
          address: result.address,
          isConnected: true,
          status: "connected",
        })
      }
    } catch (error) {
      console.error("Failed to connect wallet:", error)
      setWalletState((prev) => ({ ...prev, status: "idle" }))
    }
  }

  const handleDisconnect = async () => {
    try {
      await logout()
      setWalletState({
        address: null,
        isConnected: false,
        status: "disconnected",
      })
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
        onClick={walletState.isConnected ? handleDisconnect : handleConnect}
        disabled={walletState.status === "connecting"}
        className="flex flex-col items-center gap-3 p-6 bg-jewel-emerald hover:bg-jewel-emerald/90 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 w-full"
      >
        <Flower2 className="w-8 h-8 text-white" />
        <span className="font-semibold text-lg text-white">
          {walletState.status === "connecting"
            ? "Connecting..."
            : walletState.isConnected
              ? "Disconnect"
              : "Connect Wallet"}
        </span>
        <span className="text-sm opacity-90 text-center text-white">Abstract Global Wallet</span>
      </button>

      {walletState.isConnected && walletState.address && (
        <div className="bg-warm-white/80 backdrop-blur-sm rounded-lg p-3 shadow-sm w-full">
          <div className="text-xs text-charcoal/60 mb-1">Connected:</div>
          <div className="text-sm font-mono text-charcoal break-all">{formatAddress(walletState.address)}</div>
        </div>
      )}
    </div>
  )
}
