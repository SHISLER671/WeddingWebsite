"use client"
import Link from "next/link"
import { Calendar, MapPin, Users, Heart, ArrowLeft, ChevronDown } from "lucide-react"
import ProfileMenu from "../../components/ProfileMenu"

export default function InfoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-100">
      {/* Header with Navigation */}
      <header className="relative bg-white/90 backdrop-blur-sm shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center text-rose-700 hover:text-rose-800 transition-colors">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Home
          </Link>
          <h1 className="text-2xl font-serif text-rose-800">Wedding Information</h1>
          <ProfileMenu />
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-5xl md:text-6xl font-serif text-rose-800 mb-4">Our Special Day</h2>
          <p className="text-xl text-gray-700 mb-8">Everything you need to know about our wedding celebration</p>
        </div>
      </section>

      <div className="container mx-auto px-4 pb-16">
        <main className="max-w-6xl mx-auto">
          {/* Main Details Section */}
          <section className="mb-16">
            <h3 className="text-3xl font-serif text-rose-700 mb-8 text-center">Join us for our special day</h3>
            <p className="text-lg text-gray-700 leading-relaxed text-center mb-12">
              We are excited to celebrate this momentous occasion with our family and friends at the beautiful Hotel
              Nikko Guam. Below you'll find all the details about our ceremony, reception, and celebration.
            </p>
          </section>

          {/* Wedding Details Grid */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="bg-white rounded-lg shadow-lg p-8 border-l-4 border-rose-400">
              <div className="flex items-center mb-4">
                <Calendar className="w-6 h-6 text-rose-600 mr-3" />
                <h4 className="text-2xl font-serif text-rose-700">When</h4>
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

            <div className="bg-white rounded-lg shadow-lg p-8 border-l-4 border-rose-400">
              <div className="flex items-center mb-4">
                <MapPin className="w-6 h-6 text-rose-600 mr-3" />
                <h4 className="text-2xl font-serif text-rose-700">Where</h4>
              </div>
              <div className="space-y-3 text-gray-600">
                <p>
                  <strong>Ceremony:</strong> Dulce Nombre de Maria Cathedral-Basilica
                </p>
                <p>
                  <strong>Reception:</strong> Hotel Nikko Guam Tusi Ballroom
                </p>
                <p>
                  <strong>Address:</strong> 245 Gun Beach Road, Tumon, Guam 96913
                </p>
                <p>
                  <strong>Capacity:</strong> 260 guests
                </p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-8 border-l-4 border-rose-400">
              <div className="flex items-center mb-4">
                <Users className="w-6 h-6 text-rose-600 mr-3" />
                <h4 className="text-2xl font-serif text-rose-700">Dress Code</h4>
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

          {/* FAQ Section */}
          <section className="bg-white rounded-lg shadow-lg p-8 mb-16">
            <h4 className="text-3xl font-serif text-rose-700 mb-6 text-center">Frequently Asked Questions</h4>
            <div className="space-y-4">
              <details className="group border-b border-gray-200 pb-4">
                <summary className="flex justify-between items-center cursor-pointer text-lg font-semibold text-gray-800 hover:text-rose-600">
                  Who are the bride and groom?
                  <ChevronDown className="w-5 h-5 group-open:rotate-180 transition-transform" />
                </summary>
                <div className="mt-3 text-gray-600">
                  <p>
                    The bride is <strong>Pia Consuelo Weisenberger</strong>, daughter of Mr. & Mrs. John & Elizabeth
                    Weisenberger.
                  </p>
                  <p>
                    The groom is <strong>Ryan Shisler</strong>.
                  </p>
                </div>
              </details>

              <details className="group border-b border-gray-200 pb-4">
                <summary className="flex justify-between items-center cursor-pointer text-lg font-semibold text-gray-800 hover:text-rose-600">
                  What is the wedding date and time?
                  <ChevronDown className="w-5 h-5 group-open:rotate-180 transition-transform" />
                </summary>
                <div className="mt-3 text-gray-600">
                  <p>
                    <strong>Date:</strong> February 13, 2026
                  </p>
                  <p>
                    <strong>Ceremony:</strong> 2:00 PM at Dulce Nombre de Maria Cathedral-Basilica
                  </p>
                  <p>
                    <strong>Reception:</strong> 6:00 PM at Hotel Nikko Guam Tusi Ballroom
                  </p>
                </div>
              </details>

              <details className="group border-b border-gray-200 pb-4">
                <summary className="flex justify-between items-center cursor-pointer text-lg font-semibold text-gray-800 hover:text-rose-600">
                  Where are the ceremony and reception?
                  <ChevronDown className="w-5 h-5 group-open:rotate-180 transition-transform" />
                </summary>
                <div className="mt-3 text-gray-600">
                  <p>
                    <strong>Ceremony:</strong> Dulce Nombre de Maria Cathedral-Basilica
                  </p>
                  <p>
                    <strong>Reception:</strong> Hotel Nikko Guam Tusi Ballroom
                  </p>
                  <p>
                    <strong>Address:</strong> 245 Gun Beach Road, Tumon, Guam 96913
                  </p>
                </div>
              </details>

              <details className="group border-b border-gray-200 pb-4">
                <summary className="flex justify-between items-center cursor-pointer text-lg font-semibold text-gray-800 hover:text-rose-600">
                  When is the RSVP deadline?
                  <ChevronDown className="w-5 h-5 group-open:rotate-180 transition-transform" />
                </summary>
                <div className="mt-3 text-gray-600">
                  <p>
                    Please RSVP by <strong>January 10, 2026</strong>.
                  </p>
                  <p>You can RSVP online using our RSVP form on this website.</p>
                </div>
              </details>

              <details className="group border-b border-gray-200 pb-4">
                <summary className="flex justify-between items-center cursor-pointer text-lg font-semibold text-gray-800 hover:text-rose-600">
                  What type of ceremony is this?
                  <ChevronDown className="w-5 h-5 group-open:rotate-180 transition-transform" />
                </summary>
                <div className="mt-3 text-gray-600">
                  <p>
                    This is a <strong>Sacrament of Holy Matrimony</strong> ceremony, taking place at the beautiful Dulce
                    Nombre de Maria Cathedral-Basilica.
                  </p>
                </div>
              </details>

              <details className="group">
                <summary className="flex justify-between items-center cursor-pointer text-lg font-semibold text-gray-800 hover:text-rose-600">
                  What should I wear?
                  <ChevronDown className="w-5 h-5 group-open:rotate-180 transition-transform" />
                </summary>
                <div className="mt-3 text-gray-600">
                  <p>
                    The dress code is <strong>Formal</strong>. We recommend cocktail or evening formal attire.
                  </p>
                  <p>Please note this is a religious ceremony, so modest attire is appreciated.</p>
                </div>
              </details>
            </div>
          </section>

          {/* Venue Information */}
          <section className="bg-white rounded-lg shadow-lg p-8 mb-16">
            <h4 className="text-3xl font-serif text-rose-700 mb-6 text-center">About Our Venues</h4>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h5 className="text-xl font-semibold text-rose-600 mb-3">Dulce Nombre de Maria Cathedral-Basilica</h5>
                <p className="text-gray-700 mb-4">
                  Our ceremony will take place at this beautiful and historic cathedral, a sacred place where we will
                  exchange vows in the Sacrament of Holy Matrimony at 2:00 PM.
                </p>
              </div>
              <div>
                <h5 className="text-xl font-semibold text-rose-600 mb-3">Hotel Nikko Guam Tusi Ballroom</h5>
                <p className="text-gray-700 mb-4">
                  Our reception will be held at the elegant Tusi Ballroom at Hotel Nikko Guam starting at 6:00 PM. The
                  ballroom features beautiful crystal chandeliers, spacious dance floor, and professional lighting that
                  will create magical moments throughout our celebration.
                </p>
                <p className="text-gray-700">
                  Hotel Nikko Guam is conveniently located in Tumon with valet parking available for all guests.
                </p>
              </div>
            </div>
          </section>

          {/* Seating Chart Section */}
          

          {/* Travel & Accommodations */}
          

          {/* AI Chatbot Placeholder Section */}
          <section className="bg-gradient-to-r from-purple-100 to-rose-100 rounded-lg shadow-lg p-8 mb-16 border-2 border-dashed border-purple-300">
            <div className="text-center">
              <h4 className="text-2xl font-serif text-purple-700 mb-4">🤖 Wedding Assistant (Coming Soon)</h4>
              <p className="text-gray-700 mb-4">
                We're building an AI-powered wedding assistant to help answer all your questions about:
              </p>
              <div className="grid md:grid-cols-3 gap-4 text-sm text-gray-600 mb-6">
                <div className="bg-white/70 rounded-lg p-3">
                  <strong>Venue Details</strong>
                  <br />
                  Hotel amenities, parking, accessibility
                </div>
                <div className="bg-white/70 rounded-lg p-3">
                  <strong>Wedding Schedule</strong>
                  <br />
                  Timeline, events, ceremony details
                </div>
                <div className="bg-white/70 rounded-lg p-3">
                  <strong>Travel & Stay</strong>
                  <br />
                  Accommodations, local attractions, weather
                </div>
              </div>
              <div className="bg-white/50 rounded-lg p-4 text-sm text-gray-500">
                <strong>Integration Ready:</strong> This section is prepared for Flowise AI agent integration. The
                chatbot will be embedded here to provide instant answers to guest questions.
              </div>
            </div>
          </section>

          {/* RSVP Section */}
          

          {/* Navigation Footer */}
          <section className="text-center">
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/"
                className="flex items-center border-2 border-rose-600 text-rose-600 hover:bg-rose-600 hover:text-white px-6 py-3 rounded-lg transition-colors duration-200"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Link>
              
              <Link
                href="/rsvp"
                className="flex items-center bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition-colors duration-200"
              >
                Submit RSVP
              </Link>
            </div>
          </section>
        </main>

        <footer className="text-center mt-16 text-gray-500">
          <p>&copy; 2026 Wedding Website. Made with love.</p>
        </footer>
      </div>
    </div>
  )
}
