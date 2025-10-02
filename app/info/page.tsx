"use client"
import Link from "next/link"
import {
  Calendar,
  MapPin,
  Users,
  ArrowLeft,
  ChevronDown,
  MessageCircle,
  Wallet,
  Gift,
  Heart,
  Flower2,
} from "lucide-react"
import ProfileMenu from "../../components/ProfileMenu"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useChat } from "../../contexts/ChatContext"
import { useAccount } from "wagmi"
import { useLoginWithAbstract } from "@abstract-foundation/agw-react"
import WeddingChatbot from "../../components/WeddingChatbot/WeddingChatbot"
import { useEffect } from "react"

export default function InfoPage() {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-100 via-purple-100/60 to-pink-100 relative">
      <div
        className="fixed inset-0 bg-contain bg-center bg-no-repeat pointer-events-none opacity-30"
        style={{
          backgroundImage: "url('/info-background.jpg')",
          zIndex: 0,
        }}
      />
      <div className="relative z-10">
        {/* Header with Navigation */}
        <header className="relative bg-white/90 backdrop-blur-sm shadow-sm border-b-2 border-jewel-gold/20">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <Link
              href="/"
              className="flex items-center text-jewel-burgundy hover:text-jewel-crimson transition-colors font-sans"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Home
            </Link>
            <h1 className="text-2xl font-serif text-jewel-burgundy">Wedding Information</h1>
            <ProfileMenu />
          </div>
        </header>

        <section className="relative py-16">
          <div className="container mx-auto px-4 text-center">
            <div className="flex items-center justify-center gap-4 mb-4">
              <span className="text-4xl">🌹</span>
              <h2 className="text-5xl md:text-6xl font-serif text-jewel-burgundy">Our Special Day</h2>
              <span className="text-4xl">🌹</span>
            </div>
            <p className="text-xl text-gray-700 mb-4 font-sans">
              Join us for a celebration of love on our island paradise
            </p>
            <p className="text-lg text-jewel-purple italic font-medium font-sans">
              Good vibes, great food, and unforgettable memories
            </p>
          </div>
        </section>

        <div className="container mx-auto px-4 pb-16 font-sans">
          <main className="max-w-6xl mx-auto">
            <section className="mb-16">
              <h3 className="text-3xl font-serif text-jewel-burgundy mb-8 text-center">Come celebrate with us!</h3>
              <p className="text-lg text-gray-700 leading-relaxed text-center mb-12">
                We're getting married on our beautiful island home, and we can't wait to share this special moment with
                you. Think tropical breezes, stunning views, and a whole lot of love. Below you'll find everything you
                need to know about our ceremony and the party that follows. Let's make some memories! 🌺
              </p>
            </section>

            {/* Wedding Details Grid */}
            <div className="grid md:grid-cols-3 gap-8 mb-16">
              <div className="bg-white/40 backdrop-blur-lg rounded-lg shadow-lg p-8 border-l-4 border-jewel-burgundy">
                <div className="flex items-center mb-4">
                  <Calendar className="w-6 h-6 text-jewel-burgundy mr-3" />
                  <h4 className="text-2xl font-serif text-jewel-burgundy">When</h4>
                </div>
                <div className="space-y-3 text-gray-600">
                  <p>
                    <strong>Date:</strong> February 13, 2026
                  </p>
                  <p>
                    <strong>Ceremony:</strong> 2:00 PM
                  </p>
                  <p>
                    <strong>Reception:</strong> 6:00 PM
                  </p>
                  <p>
                    <strong>Dancing:</strong> 8:00 PM - Late
                  </p>
                </div>
              </div>

              <div className="bg-white/40 backdrop-blur-lg rounded-lg shadow-lg p-8 border-l-4 border-jewel-fuchsia">
                <div className="flex items-center mb-4">
                  <MapPin className="w-6 h-6 text-jewel-fuchsia mr-3" />
                  <h4 className="text-2xl font-serif text-jewel-fuchsia">Where</h4>
                </div>
                <div className="space-y-3 text-gray-600">
                  <p>
                    <strong>Ceremony:</strong> Dulce Nombre de Maria Cathedral-Basilica
                  </p>
                  <p>
                    <strong>Reception:</strong> Hotel Nikko Guam Tasi Ballroom
                  </p>
                  <p>
                    <strong>Address:</strong> 245 Gun Beach Road, Tumon, Guam 96913
                  </p>
                  <p>
                    <strong>Capacity:</strong> 260 guests
                  </p>
                </div>
              </div>

              <div className="bg-white/40 backdrop-blur-lg rounded-lg shadow-lg p-8 border-l-4 border-jewel-purple">
                <div className="flex items-center mb-4">
                  <Users className="w-6 h-6 text-jewel-purple mr-3" />
                  <h4 className="text-2xl font-serif text-jewel-purple">Dress Code</h4>
                </div>
                <div className="space-y-3 text-gray-600">
                  <p>
                    <strong>Attire:</strong> Formal
                  </p>
                  <p>
                    <strong>Bridesmaids:</strong> Red
                  </p>
                  <p>
                    <strong>Groomsmen:</strong> Black & White
                  </p>
                  <p>
                    <strong>Guests:</strong> Cocktail or Evening Formal
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Questions */}
            <section className="bg-white/40 backdrop-blur-lg rounded-lg shadow-lg p-8 mb-16 border-t-4 border-jewel-gold">
              <h4 className="text-3xl font-serif text-jewel-burgundy mb-6 text-center">Quick Questions</h4>
              <div className="space-y-4">
                <details className="group border-b border-gray-200 pb-4">
                  <summary className="flex justify-between items-center cursor-pointer text-lg font-semibold text-gray-800 hover:text-jewel-burgundy">
                    Who's getting hitched?
                    <ChevronDown className="w-5 h-5 group-open:rotate-180 transition-transform text-jewel-fuchsia" />
                  </summary>
                  <div className="mt-3 text-gray-600">
                    <p>
                      That would be <strong>Pia Consuelo Weisenberger</strong> (daughter of John & Elizabeth
                      Weisenberger) and <strong>Ryan Shisler</strong>! We're tying the knot on our beautiful island
                      home.
                    </p>
                  </div>
                </details>

                <details className="group border-b border-gray-200 pb-4">
                  <summary className="flex justify-between items-center cursor-pointer text-lg font-semibold text-gray-800 hover:text-jewel-burgundy">
                    When and where is this party happening?
                    <ChevronDown className="w-5 h-5 group-open:rotate-180 transition-transform text-jewel-fuchsia" />
                  </summary>
                  <div className="mt-3 text-gray-600">
                    <p>
                      <strong>Date:</strong> February 13, 2026
                    </p>
                    <p>
                      <strong>Ceremony:</strong> 2:00 PM at Dulce Nombre de Maria Cathedral-Basilica
                    </p>
                    <p>
                      <strong>Reception:</strong> 6:00 PM at Hotel Nikko Guam Tasi Ballroom
                    </p>
                    <p className="mt-2 text-jewel-purple">Then we dance until we can't dance anymore! 🌴</p>
                  </div>
                </details>

                <details className="group border-b border-gray-200 pb-4">
                  <summary className="flex justify-between items-center cursor-pointer text-lg font-semibold text-gray-800 hover:text-jewel-burgundy">
                    Where exactly are these places?
                    <ChevronDown className="w-5 h-5 group-open:rotate-180 transition-transform text-jewel-fuchsia" />
                  </summary>
                  <div className="mt-3 text-gray-600">
                    <p>
                      <strong>Ceremony:</strong> Dulce Nombre de Maria Cathedral-Basilica (the beautiful historic
                      cathedral in Hagåtña)
                    </p>
                    <p>
                      <strong>Reception:</strong> Hotel Nikko Guam Tasi Ballroom
                    </p>
                    <p>
                      <strong>Address:</strong> 245 Gun Beach Road, Tumon, Guam 96913
                    </p>
                    <p className="mt-2 text-sm">Valet parking available - because we've got you covered!</p>
                  </div>
                </details>

                <details className="group border-b border-gray-200 pb-4">
                  <summary className="flex justify-between items-center cursor-pointer text-lg font-semibold text-gray-800 hover:text-jewel-burgundy">
                    When do I need to RSVP by?
                    <ChevronDown className="w-5 h-5 group-open:rotate-180 transition-transform text-jewel-fuchsia" />
                  </summary>
                  <div className="mt-3 text-gray-600">
                    <p>
                      Please let us know by <strong>January 10, 2026</strong>. You can RSVP right here on the website -
                      super easy, super quick!
                    </p>
                  </div>
                </details>

                <details className="group">
                  <summary className="flex justify-between items-center cursor-pointer text-lg font-semibold text-gray-800 hover:text-jewel-burgundy">
                    What should I wear?
                    <ChevronDown className="w-5 h-5 group-open:rotate-180 transition-transform text-jewel-fuchsia" />
                  </summary>
                  <div className="mt-3 text-gray-600">
                    <p>
                      Dress code is <strong>Formal</strong> - think cocktail or evening formal attire. Look good, feel
                      good!
                    </p>
                    <p className="mt-2">
                      Since it's a religious ceremony, modest attire is appreciated. But don't stress - just dress up
                      and you'll be perfect!
                    </p>
                  </div>
                </details>
              </div>
            </section>

            {/* About Our Venues */}
            <section className="bg-white/40 backdrop-blur-lg rounded-lg shadow-lg p-8 mb-16 border-t-4 border-jewel-fuchsia">
              <h4 className="text-3xl font-serif text-jewel-burgundy mb-6 text-center">About Our Venues</h4>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h5 className="text-xl font-semibold text-jewel-burgundy mb-3 font-serif">The Cathedral</h5>
                  <p className="text-gray-700 mb-4">
                    We're saying our vows at the stunning Dulce Nombre de Maria Cathedral-Basilica at 2:00 PM. It's a
                    beautiful, historic place that means a lot to us. Sacred, elegant, and the perfect spot to start our
                    forever.
                  </p>
                </div>
                <div>
                  <h5 className="text-xl font-semibold text-jewel-fuchsia mb-3 font-serif">The Reception</h5>
                  <p className="text-gray-700 mb-4">
                    After the ceremony, we're heading to the gorgeous Tasi Ballroom at Hotel Nikko Guam for the real
                    party! Think crystal chandeliers, a huge dance floor, and amazing lighting. The reception starts at
                    6:00 PM, and we'll be dancing until late. Hotel Nikko is right in Tumon with valet parking, so
                    getting there is a breeze. Come ready to eat, drink, and celebrate with us! 🎉
                  </p>
                </div>
              </div>
            </section>

            {/* Meet Sofia */}
            <Card className="mb-16 border-jewel-burgundy/30 shadow-lg bg-white/40 backdrop-blur-lg">
              <CardHeader className="bg-gradient-to-r from-jewel-burgundy/10 to-jewel-fuchsia/10 border-b-2 border-jewel-gold/20">
                <CardTitle className="flex items-center gap-3 text-jewel-burgundy text-2xl font-serif">
                  <MessageCircle className="w-7 h-7" />
                  Meet Sofia - Your 24/7 Wedding Buddy
                </CardTitle>
                <CardDescription className="text-base font-sans">
                  She's basically your personal wedding guru, always online
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="text-gray-700 leading-relaxed mb-6">
                  Sofia is our AI wedding assistant who knows everything about our big day. Got questions at 2 AM about
                  what to wear? Wondering where to grab the best local food? She's got you covered, day or night. No
                  question is too small!
                </p>

                <div className="flex justify-center mb-6">
                  <ChatbotButton />
                </div>

                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="what-is-sofia">
                    <AccordionTrigger className="text-left">So what exactly is Sofia?</AccordionTrigger>
                    <AccordionContent className="text-gray-700 leading-relaxed">
                      Sofia is like having a super knowledgeable friend who never sleeps! She's an AI assistant we built
                      specifically for our wedding. Ask her about the venue, what time things start, where to stay, what
                      to do on the island, or literally anything wedding-related. She's friendly, helpful, and always
                      ready to chat.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="how-to-use">
                    <AccordionTrigger className="text-left">How do I chat with her?</AccordionTrigger>
                    <AccordionContent className="text-gray-700 leading-relaxed">
                      After you RSVP, you'll see a "Chat with Sofia" button on your confirmation page. Click it and
                      start asking away! She's super chill and easy to talk to. Ask about parking, local restaurants,
                      beach recommendations, your RSVP status - whatever you need to know!
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="what-can-ask">
                    <AccordionTrigger className="text-left">What kind of stuff can I ask?</AccordionTrigger>
                    <AccordionContent className="text-gray-700 leading-relaxed">
                      Pretty much anything! Here's what Sofia can help with:
                      <ul className="list-disc list-inside mt-2 space-y-1">
                        <li>Venue details, directions, and parking info</li>
                        <li>Full wedding day timeline and schedule</li>
                        <li>Dress code questions and outfit suggestions</li>
                        <li>Hotel recommendations and where to stay</li>
                        <li>Best beaches, restaurants, and island activities</li>
                        <li>Weather tips and what to pack for Guam</li>
                        <li>Your RSVP status (just give her your email)</li>
                        <li>Gift info and crypto wallet details</li>
                      </ul>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="is-it-safe">
                    <AccordionTrigger className="text-left">Is my info safe with Sofia?</AccordionTrigger>
                    <AccordionContent className="text-gray-700 leading-relaxed">
                      Sofia uses secure connections and doesn't store your conversations. She only sees the wedding info
                      you already shared when you RSVP'd. We take your privacy seriously - no weird data collection or
                      anything like that.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="available-when">
                    <AccordionTrigger className="text-left">When can I reach her?</AccordionTrigger>
                    <AccordionContent className="text-gray-700 leading-relaxed">
                      24/7, baby! Seriously, Sofia never sleeps. Middle of the night? She's there. Sunday morning? She's
                      there. Whenever a question pops into your head, just open the chat and she'll respond instantly.
                      No waiting around!
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="cant-answer">
                    <AccordionTrigger className="text-left">What if she doesn't know something?</AccordionTrigger>
                    <AccordionContent className="text-gray-700 leading-relaxed">
                      Sofia's pretty smart, but if she can't answer something specific, she'll be honest and suggest
                      reaching out to us directly. You can always contact the wedding party for anything Sofia can't
                      handle. We're here to help!
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>

            {/* Abstract Global Wallet */}
            <Card className="mb-16 border-jewel-purple/30 shadow-lg bg-white/40 backdrop-blur-lg">
              <CardHeader className="bg-gradient-to-r from-jewel-purple/10 to-jewel-fuchsia/10 border-b-2 border-jewel-gold/20">
                <CardTitle className="flex items-center gap-3 text-jewel-purple text-2xl font-serif">
                  <Wallet className="w-7 h-7" />
                  Abstract Global Wallet - A Little Future Magic
                </CardTitle>
                <CardDescription className="text-base font-sans">
                  Connect your wallet for a surprise gift from us after the wedding
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="text-gray-700 leading-relaxed mb-6">
                  We're mixing tradition with a little tech magic! Connect your Abstract Global Wallet when you RSVP,
                  and we'll send you a special digital surprise after the wedding. It's our way of saying thanks for
                  celebrating with us. Plus, it's way cooler than it sounds - promise!
                </p>

                <div className="flex justify-center mb-6">
                  <AGWWalletButton />
                </div>

                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="what-is-agw">
                    <AccordionTrigger className="text-left">What's Abstract Global Wallet?</AccordionTrigger>
                    <AccordionContent className="text-gray-700 leading-relaxed">
                      Think of it as a digital wallet for the future - like Venmo or PayPal, but built on blockchain
                      technology. It's super user-friendly and designed for people who've never touched crypto before.
                      No complicated tech jargon, no confusing setup. Just a simple, secure way to hold digital assets.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="why-connect">
                    <AccordionTrigger className="text-left">Why should I bother connecting it?</AccordionTrigger>
                    <AccordionContent className="text-gray-700 leading-relaxed">
                      Because you'll get a special digital keepsake from us after the wedding! It's a unique memento
                      that combines old-school wedding tradition with new-school tech. Plus, it's completely free to set
                      up and takes like 30 seconds. Think of it as a fun way to remember our special day with something
                      totally unique.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="how-to-connect">
                    <AccordionTrigger className="text-left">How do I connect this thing?</AccordionTrigger>
                    <AccordionContent className="text-gray-700 leading-relaxed">
                      Super easy! After you RSVP, you'll see a "Connect Wallet" button with a flower icon on the
                      confirmation page. Click it, and Abstract Global Wallet will walk you through everything. If you
                      don't have a wallet yet, it'll create one for you automatically. No forms, no hassle - just click
                      and you're done!
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="never-used-crypto">
                    <AccordionTrigger className="text-left">I've never used crypto. Will I look dumb?</AccordionTrigger>
                    <AccordionContent className="text-gray-700 leading-relaxed">
                      Not at all! Abstract Global Wallet is literally designed for crypto newbies. You don't need to
                      understand blockchain or buy any cryptocurrency. Just click the button and follow the super simple
                      prompts. It's honestly easier than setting up most apps on your phone. Takes less than a minute!
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="auto-create">
                    <AccordionTrigger className="text-left">
                      Does it make a wallet for me automatically?
                    </AccordionTrigger>
                    <AccordionContent className="text-gray-700 leading-relaxed">
                      Yep! If you don't already have an Abstract Global Wallet, the system creates one for you when you
                      click "Connect Wallet." You'll get your own unique wallet address that's securely linked to your
                      account. No paperwork, no verification emails - it just works. Like magic, but real.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="is-it-safe">
                    <AccordionTrigger className="text-left">Is this safe? I don't want to get hacked.</AccordionTrigger>
                    <AccordionContent className="text-gray-700 leading-relaxed">
                      Totally safe! Abstract Global Wallet uses bank-level security and encryption. Your wallet is
                      protected by advanced cryptography, and only you have access to it. We never see your private
                      keys, and everything is transparent on the blockchain. It's actually more secure than most
                      traditional payment methods!
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="what-surprise">
                    <AccordionTrigger className="text-left">What's the surprise? Give me a hint!</AccordionTrigger>
                    <AccordionContent className="text-gray-700 leading-relaxed">
                      Nice try! 😉 We're keeping it a secret for now, but we promise it'll be something special and
                      meaningful - a digital keepsake that commemorates our wedding day. You'll get it after the
                      wedding, and it'll be a unique way to remember this celebration. Trust us, it's worth the mystery!
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="do-i-have-to">
                    <AccordionTrigger className="text-left">Do I HAVE to do this?</AccordionTrigger>
                    <AccordionContent className="text-gray-700 leading-relaxed">
                      Nope! It's 100% optional. Your RSVP is totally valid whether you connect a wallet or not. We just
                      wanted to offer this as a fun, modern option for anyone interested. Your presence at our wedding
                      is what matters most to us. Everything else is just bonus!
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>

            {/* Navigation Footer */}
            <section className="text-center">
              <div className="flex justify-center">
                <Link
                  href="/gifts"
                  className="flex items-center bg-jewel-emerald hover:bg-emerald-600 text-white px-12 py-5 rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl text-xl font-semibold"
                >
                  <Gift className="w-6 h-6 mr-3" />
                  Registry & Gifts
                </Link>
              </div>
            </section>
          </main>

          {/* Footer */}
          <footer className="text-center mt-16 text-gray-500 font-sans">
            <p>&copy; 2026 Pia & Ryan's Wedding. Made with love and Irie vibes. 🌺</p>
          </footer>
        </div>
        <WeddingChatbot />
      </div>
    </div>
  )
}

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
      <span className="font-semibold text-lg text-white">Chat with Sofia</span>
      <span className="text-sm opacity-90 text-center text-white">AI Wedding Assistant</span>
    </button>
  )
}

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
        className="flex flex-col items-center gap-3 p-6 bg-jewel-sapphire hover:bg-jewel-emerald disabled:from-gray-400 disabled:to-gray-500 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 w-full"
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
