"use client"
import Link from "next/link"
import {
  Calendar,
  MapPin,
  Users,
  ArrowLeft,
  ChevronDown,
  MessageCircle,
  Heart,
} from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useChat } from "../../contexts/ChatContext"
import WeddingChatbot from "../../components/WeddingChatbot/WeddingChatbot"
import { useEffect } from "react"

export default function InfoPage() {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <div className="min-h-screen relative">
      {/* Fixed background image */}
      <div 
        className="fixed inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/IMG-20251005-WA0013.jpg')",
          backgroundAttachment: 'fixed'
        }}
      />
      {/* Overlay for better text readability */}
      <div className="fixed inset-0 bg-black/20" />
      
      {/* Scrollable content */}
      <div className="relative z-10">
        {/* Fixed Back to Home Button - Top Left */}
        <div className="fixed top-4 left-4 z-20">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-white hover:text-jewel-crimson transition-colors font-medium bg-black/20 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/20"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>

        <section className="relative py-16">
          <div className="container mx-auto px-4 text-center">
            <div className="flex items-center justify-center gap-4 mb-4">
              <span className="text-4xl">🌹</span>
              <h2 className="text-6xl md:text-7xl font-serif font-bold text-white drop-shadow-lg">Our Special Day</h2>
              <span className="text-4xl">🌹</span>
            </div>
            <p className="text-2xl text-white/95 mb-4 font-sans font-medium drop-shadow-md">
              Join us for a celebration of love on our island paradise
            </p>
          </div>
        </section>

        <div className="container mx-auto px-4 pb-16 font-sans">
          <main className="max-w-6xl mx-auto">
            <section className="mb-8">
              <h3 className="text-4xl font-serif font-bold text-white mb-8 text-center drop-shadow-lg">Come celebrate with us!</h3>
              <p className="text-xl text-white/95 leading-relaxed text-center mb-8 font-medium drop-shadow-md">
                We're getting married on our beautiful island home and can't wait to share this moment with you. 
                Below you'll find everything you need to know about our ceremony and celebration. 🌺
              </p>
            </section>

            {/* Wedding Details Grid */}
            <div className="grid md:grid-cols-3 gap-8 mb-8">
              <div className="bg-white/40 backdrop-blur-lg rounded-lg shadow-lg p-8 border-l-4 border-jewel-burgundy">
                <div className="flex items-center mb-4">
                  <Calendar className="w-6 h-6 text-jewel-burgundy mr-3" />
                  <h4 className="text-3xl font-serif font-bold text-jewel-burgundy">When</h4>
                </div>
                <div className="space-y-3 text-gray-800 font-sans">
                  <p className="text-lg">
                    <strong className="text-xl font-semibold">Date:</strong> <em>Friday, February 13, 2026</em>
                  </p>
                  <p className="text-lg">
                    <strong className="text-xl font-semibold">Ceremony:</strong> <em>2:00 PM</em>
                  </p>
                  <p className="text-lg">
                    <strong className="text-xl font-semibold">Reception:</strong> <em>6:00 PM</em>
                  </p>
                  <p className="text-lg">
                    <strong className="text-xl font-semibold">After Party:</strong> <em>11:00 PM</em>
                  </p>
                </div>
              </div>

              <div className="bg-white/40 backdrop-blur-lg rounded-lg shadow-lg p-8 border-l-4 border-blue-800">
                <div className="flex items-center mb-4">
                  <MapPin className="w-6 h-6 text-blue-800 mr-3" />
                  <h4 className="text-3xl font-serif font-bold text-blue-800">Where</h4>
                </div>
                <div className="space-y-3 text-gray-800 font-sans">
                  <p className="text-lg">
                    <strong className="text-xl font-semibold">Ceremony:</strong> <em>Dulce Nombre de Maria Cathedral-Basilica</em>
                  </p>
                  <p className="text-lg">
                    <strong className="text-xl font-semibold">Reception:</strong> <em>Hotel Nikko Guam Tasi Ballroom</em>
                  </p>
                  <p className="text-lg">
                    <strong className="text-xl font-semibold">Address:</strong> <em>245 Gun Beach Road, Tumon, Guam 96913</em>
                  </p>
                  <p className="text-lg">
                    <strong className="text-xl font-semibold">Capacity:</strong> <em>260 guests</em>
                  </p>
                </div>
              </div>

              <div className="bg-white/40 backdrop-blur-lg rounded-lg shadow-lg p-8 border-l-4 border-jewel-purple">
                <div className="flex items-center mb-4">
                  <Users className="w-6 h-6 text-jewel-purple mr-3" />
                  <h4 className="text-3xl font-serif font-bold text-jewel-purple">Dress Code</h4>
                </div>
                <div className="space-y-3 text-gray-800 font-sans">
                  <p className="text-lg">
                    <strong className="text-xl font-semibold">Bridesmaids:</strong> <em>Red</em>
                  </p>
                  <p className="text-lg">
                    <strong className="text-xl font-semibold">Groomsmen:</strong> <em>Black</em>
                  </p>
                  <p className="text-lg">
                    <strong className="text-xl font-semibold">Guests:</strong> <em>Cocktail or Semi-Formal</em>
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Questions */}
            <section className="bg-white/40 backdrop-blur-lg rounded-lg shadow-lg p-8 mb-8 border-t-4 border-jewel-gold">
              <h4 className="text-4xl font-serif font-bold text-jewel-burgundy mb-6 text-center">Quick Questions</h4>
              <div className="space-y-4">
                <details className="group border-b border-gray-200 pb-4">
                  <summary className="flex justify-between items-center cursor-pointer text-xl font-bold text-gray-800 hover:text-jewel-burgundy">
                    Who's getting hitched?
                    <ChevronDown className="w-6 h-6 group-open:rotate-180 transition-transform text-blue-800" />
                  </summary>
                  <div className="mt-3 text-gray-800">
                    <p className="text-lg">
                      That would be <strong className="text-xl">Pia Consuelo Weisenberger</strong> <em>(daughter of John & Elizabeth
                      Weisenberger)</em> and <strong className="text-xl">Ryan Shisler</strong>! We're tying the knot on our beautiful island
                      home.
                    </p>
                  </div>
                </details>

                <details className="group border-b border-gray-200 pb-4">
                  <summary className="flex justify-between items-center cursor-pointer text-xl font-bold text-gray-800 hover:text-jewel-burgundy">
                    When and where is this party happening?
                    <ChevronDown className="w-6 h-6 group-open:rotate-180 transition-transform text-blue-800" />
                  </summary>
                  <div className="mt-3 text-gray-800">
                    <p className="text-lg">
                      <strong className="text-xl">Date:</strong> <em>February 13, 2026</em>
                    </p>
                    <p className="text-lg">
                      <strong className="text-xl">Ceremony:</strong> <em>2:00 PM at Dulce Nombre de Maria Cathedral-Basilica</em>
                    </p>
                    <p className="text-lg">
                      <strong className="text-xl">Reception:</strong> <em>6:00 PM at Hotel Nikko Guam Tasi Ballroom</em>
                    </p>
                    <p className="mt-2 text-lg font-bold text-jewel-purple">Then we dance until we can't dance anymore! 🌴</p>
                  </div>
                </details>

                <details className="group border-b border-gray-200 pb-4">
                  <summary className="flex justify-between items-center cursor-pointer text-xl font-bold text-gray-800 hover:text-jewel-burgundy">
                    Where exactly are these places?
                    <ChevronDown className="w-6 h-6 group-open:rotate-180 transition-transform text-blue-800" />
                  </summary>
                  <div className="mt-3 text-gray-800">
                    <p className="text-lg">
                      <strong className="text-xl">Ceremony:</strong> <em>Dulce Nombre de Maria Cathedral-Basilica</em> <em>(the beautiful historic
                      cathedral in Hagåtña)</em>
                    </p>
                    <p className="text-lg">
                      <strong className="text-xl">Reception:</strong> <em>Hotel Nikko Guam Tasi Ballroom</em>
                    </p>
                    <p className="text-lg">
                      <strong className="text-xl">Address:</strong> <em>245 Gun Beach Road, Tumon, Guam 96913</em>
                    </p>
                    <p className="mt-2 text-lg font-bold">Valet parking available - because we've got you covered!</p>
                  </div>
                </details>

                <details className="group border-b border-gray-200 pb-4">
                  <summary className="flex justify-between items-center cursor-pointer text-xl font-bold text-gray-800 hover:text-jewel-burgundy">
                    When do I need to RSVP by?
                    <ChevronDown className="w-6 h-6 group-open:rotate-180 transition-transform text-blue-800" />
                  </summary>
                  <div className="mt-3 text-gray-800">
                    <p className="text-lg">
                      Please let us know by <strong className="text-xl">January 10, 2026</strong>. You can RSVP right here on the website -
                      <em>super easy, super quick!</em>
                    </p>
                  </div>
                </details>

                <details className="group">
                  <summary className="flex justify-between items-center cursor-pointer text-xl font-bold text-gray-800 hover:text-jewel-burgundy">
                    What should I wear?
                    <ChevronDown className="w-6 h-6 group-open:rotate-180 transition-transform text-blue-800" />
                  </summary>
                  <div className="mt-3 text-gray-800">
                    <p className="text-lg">
                      Dress code is <strong className="text-xl">Formal</strong> - <em>think cocktail or evening formal attire. Look good, feel
                      good!</em>
                    </p>
                    <p className="mt-2 text-lg">
                      Since it's a religious ceremony, <strong>modest attire is appreciated</strong>. But don't stress - just dress up
                      and you'll be perfect!
                    </p>
                  </div>
                </details>
              </div>
            </section>

            {/* About Our Venues */}
            <section className="bg-white/40 backdrop-blur-lg rounded-lg shadow-lg p-8 mb-8 border-t-4 border-blue-800">
              <h4 className="text-4xl font-serif font-bold text-jewel-burgundy mb-6 text-center">About Our Venues</h4>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h5 className="text-2xl font-bold text-jewel-burgundy mb-4 font-serif">The Cathedral</h5>
                  <p className="text-lg text-gray-800 mb-4">
                    We're saying our vows at the stunning <strong>Dulce Nombre de Maria Cathedral-Basilica at 2:00 PM</strong>. It's a
                    beautiful, historic place that means a lot to us. <em>Sacred, elegant, and the perfect spot to start our
                    forever.</em>
                  </p>
                </div>
                <div>
                  <h5 className="text-2xl font-bold text-blue-800 mb-4 font-serif">The Reception</h5>
                  <p className="text-lg text-gray-800 mb-4">
                    After the ceremony, we're heading to the gorgeous <strong>Tasi Ballroom at Hotel Nikko Guam</strong> for the real
                    party! <em>Think crystal chandeliers, a huge dance floor, and amazing lighting.</em> The reception starts at
                    <strong>6:00 PM</strong>, and we'll be dancing until late. Hotel Nikko is right in Tumon with valet parking, so
                    getting there is a breeze. <strong>Come ready to eat, drink, and celebrate with us! 🎉</strong>
                  </p>
                </div>
              </div>
            </section>

            {/* Wedding Party */}
            <section className="bg-white/40 backdrop-blur-lg rounded-lg shadow-lg p-8 mb-8 border-t-4 border-jewel-crimson">
              <h4 className="text-4xl font-serif font-bold text-jewel-burgundy mb-8 text-center">Wedding Party</h4>
              
              <div className="grid md:grid-cols-2 gap-8 mb-8">
                {/* Bridesmaids & Maids of Honor */}
                <div className="bg-gradient-to-br from-jewel-burgundy/10 to-blue-800/10 rounded-lg p-6 border-l-4 border-blue-800">
                  <h5 className="text-2xl font-serif font-bold text-blue-800 mb-4 flex items-center gap-2">
                    <Users className="w-6 h-6" />
                    Bridesmaids & Maids of Honor
                  </h5>
                  <div className="space-y-3">
                    <div className="text-center">
                      <h6 className="text-xl font-bold text-jewel-burgundy mb-2">Maid of Honor</h6>
                      <p className="text-lg text-gray-800"></p>
                    </div>
                    <div className="text-center">
                      <h6 className="text-xl font-bold text-jewel-burgundy mb-2">Maid of Honor</h6>
                      <p className="text-lg text-gray-800"></p>
                    </div>
                    <div className="border-t border-blue-800/30 pt-3">
                      <h6 className="text-lg font-bold text-blue-800 mb-3 text-center">Bridesmaids</h6>
                      <div className="space-y-2">
                        <p className="text-lg text-gray-800"></p>
                        <p className="text-lg text-gray-800"></p>
                        <p className="text-lg text-gray-800"></p>
                        <p className="text-lg text-gray-800"></p>
                        <p className="text-lg text-gray-800"></p>
                        <p className="text-lg text-gray-800"></p>
                        <p className="text-lg text-gray-800"></p>
                        <p className="text-lg text-gray-800"></p>
                        <p className="text-lg text-gray-800"></p>
                        <p className="text-lg text-gray-800"></p>
                        <p className="text-lg text-gray-800"></p>
                        <p className="text-lg text-gray-800"></p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Groomsmen & Best Man */}
                <div className="bg-gradient-to-br from-jewel-purple/10 to-jewel-emerald/10 rounded-lg p-6 border-l-4 border-jewel-purple">
                  <h5 className="text-2xl font-serif font-bold text-jewel-purple mb-4 flex items-center gap-2">
                    <Users className="w-6 h-6" />
                    Groomsmen & Best Men
                  </h5>
                  <div className="space-y-3">
                    <div>
                      <h6 className="text-lg font-bold text-jewel-purple mb-3">Best Men</h6>
                      <div className="space-y-1 mb-4">
                        <p className="text-gray-800">• Kevin Leasiolagi</p>
                        <p className="text-gray-800">• Shane Quintanilla</p>
                      </div>
                    </div>
                    <div className="border-t border-jewel-purple/30 pt-3">
                      <h6 className="text-lg font-bold text-jewel-purple mb-3">Groomsmen</h6>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                        <p className="text-gray-800">• James Whippy</p>
                        <p className="text-gray-800">• Teke Kaminaga</p>
                        <p className="text-gray-800">• Ray Paul Jardon</p>
                        <p className="text-gray-800">• Carter Young</p>
                        <p className="text-gray-800">• Jesse Newby</p>
                        <p className="text-gray-800">• Jose Santos</p>
                        <p className="text-gray-800">• Vincent Camacho</p>
                        <p className="text-gray-800">• Carl Nangauta</p>
                        <p className="text-gray-800">• Jassen Guerro</p>
                        <p className="text-gray-800">• Amos Taijeron</p>
                        <p className="text-gray-800">• William Libby</p>
                        <p className="text-gray-800">• Devin Quitugua</p>
                        <p className="text-gray-800">• Brandon Cepeda</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="text-center mt-6">
                <p className="text-lg text-gray-800 font-medium">
                  <em>We're so grateful to have these amazing people standing with us on our special day!</em>
                </p>
              </div>
            </section>

            {/* Meet Ezekiel */}
            <Card className="mb-8 border-jewel-burgundy/30 shadow-lg bg-white/40 backdrop-blur-lg">
              <CardHeader className="bg-gradient-to-r from-jewel-burgundy/10 to-blue-800/10 border-b-2 border-jewel-gold/20">
                <CardTitle className="flex items-center gap-3 text-jewel-burgundy text-3xl font-serif font-bold">
                  <MessageCircle className="w-8 h-8" />
                  Meet Ezekiel - Your 24/7 Wedding Buddy
                </CardTitle>
                <CardDescription className="text-lg font-sans text-gray-800">
                  He's basically your personal wedding guru, always online
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="text-lg text-gray-800 leading-relaxed mb-6">
                  Ezekiel is our AI wedding assistant who knows everything about our big day. <em>Got questions at 2 AM about
                  what to wear? Wondering where to grab the best local food?</em> He's got you covered, day or night. <strong>No
                  question is too small!</strong>
                </p>

                <div className="flex justify-center mb-6">
                  <ChatbotButton />
                </div>

                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="what-is-sofia">
                    <AccordionTrigger className="text-left">So what exactly is Ezekiel?</AccordionTrigger>
                    <AccordionContent className="text-lg text-gray-800 leading-relaxed">
                      Ezekiel is like having a <strong>super knowledgeable friend who never sleeps!</strong> He's an AI assistant we built
                      specifically for our wedding. <em>Ask him about the venue, what time things start, where to stay, what
                      to do on the island, or literally anything wedding-related.</em> He's friendly, helpful, and always
                      ready to chat.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="how-to-use">
                    <AccordionTrigger className="text-left">How do I chat with him?</AccordionTrigger>
                    <AccordionContent className="text-lg text-gray-800 leading-relaxed">
                      After you RSVP, you'll see a <strong>"Chat with Ezekiel" button on your confirmation page.</strong> Click it and
                      start asking away! <em>He's super chill and easy to talk to.</em> Ask about parking, local restaurants,
                      beach recommendations, your RSVP status - <strong>whatever you need to know!</strong>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="what-can-ask">
                    <AccordionTrigger className="text-left">What kind of stuff can I ask?</AccordionTrigger>
                    <AccordionContent className="text-lg text-gray-800 leading-relaxed">
                      <strong>Pretty much anything!</strong> Here's what Ezekiel can help with:
                      <ul className="list-disc list-inside mt-3 space-y-2 text-lg">
                        <li><strong>Venue details, directions, and parking info</strong></li>
                        <li><strong>Full wedding day timeline and schedule</strong></li>
                        <li><strong>Dress code questions and outfit suggestions</strong></li>
                        <li><strong>Hotel recommendations and where to stay</strong></li>
                        <li><strong>Best beaches, restaurants, and island activities</strong></li>
                        <li><strong>Weather tips and what to pack for Guam</strong></li>
                        <li><strong>Your RSVP status (just give him your email)</strong></li>
                        <li><strong>General wedding information and logistics</strong></li>
                      </ul>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="is-it-safe">
                    <AccordionTrigger className="text-left">Is my info safe with Ezekiel?</AccordionTrigger>
                    <AccordionContent className="text-lg text-gray-800 leading-relaxed">
                      Ezekiel uses <strong>secure connections and doesn't store your conversations.</strong> He only sees the wedding info
                      you already shared when you RSVP'd. <em>We take your privacy seriously</em> - no weird data collection or
                      anything like that.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="available-when">
                    <AccordionTrigger className="text-left">When can I reach him?</AccordionTrigger>
                    <AccordionContent className="text-lg text-gray-800 leading-relaxed">
                      <strong>24/7, baby!</strong> Seriously, Ezekiel never sleeps. <em>Middle of the night? He's there. Sunday morning? He's
                      there.</em> Whenever a question pops into your head, just open the chat and he'll respond instantly.
                      <strong>No waiting around!</strong>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="cant-answer">
                    <AccordionTrigger className="text-left">What if he doesn't know something?</AccordionTrigger>
                    <AccordionContent className="text-lg text-gray-800 leading-relaxed">
                      Ezekiel's pretty smart, but if he can't answer something specific, he'll be <strong>honest and suggest
                      reaching out to us directly.</strong> <em>You can always contact the wedding party for anything Ezekiel can't
                      handle.</em> We're here to help!
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>



          </main>

          {/* Footer */}
          <footer className="text-center mt-8 text-gray-800 font-sans">
            <p className="text-lg">&copy; 2026 Pia & Ryan's Wedding. <em>Made with love and Irie vibes.</em> 🌺</p>
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
      <span className="font-semibold text-lg text-white">Chat with Ezekiel</span>
      <span className="text-sm opacity-90 text-center text-white">AI Wedding Assistant</span>
    </button>
  )
}
