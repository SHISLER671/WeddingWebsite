import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="min-h-screen relative">
      {/* Fixed background image */}
      <div 
        className="fixed inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/hibiscusring.jpg')",
          backgroundAttachment: 'fixed'
        }}
      />
      {/* Overlay for better text readability */}
      <div className="fixed inset-0 bg-black/20" />
      
      {/* Scrollable content */}
      <div className="relative z-10 container mx-auto px-4 py-16">
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

        {/* Header */}
        <div className="mb-12">
          <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-serif text-white mb-4 drop-shadow-lg">Contact Us</h1>
          <p className="text-lg text-white/90 max-w-2xl mx-auto drop-shadow-md">
            Have questions about the wedding? Need to update your RSVP? We're here to help!
          </p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto grid md:grid-cols-2 text-center gap-6">
          {/* Contact Form */}
          <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-lg p-8 border border-white/20 text-left">
            <h2 className="text-2xl font-serif text-rose-700 mb-6 text-center">Send us a Message</h2>
            <form className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                  Your Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-colors"
                  placeholder="Your name"
                />
              </div>
              
              <div>
                <label htmlFor="contactEmail" className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  id="contactEmail"
                  name="contactEmail"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-colors"
                  placeholder="your.email@example.com"
                />
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-semibold text-gray-700 mb-2">
                  Subject
                </label>
                <select
                  id="subject"
                  name="subject"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-colors"
                >
                  <option value="">Select a topic</option>
                  <option value="rsvp">RSVP Question/Change</option>
                  <option value="accommodations">Travel & Accommodations</option>
                  <option value="venue">Venue Information</option>
                  <option value="dietary">Dietary Restrictions</option>
                  <option value="gifts">Gifts & Registry</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label htmlFor="contactMessage" className="block text-sm font-semibold text-gray-700 mb-2">
                  Message
                </label>
                <textarea
                  id="contactMessage"
                  name="contactMessage"
                  rows={5}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-colors"
                  placeholder="How can we help you?"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-rose-600 hover:bg-rose-700 text-white py-3 text-lg font-semibold rounded-lg transition-colors duration-200"
              >
                Send Message
              </button>
            </form>
          </div>

          {/* Contact Information */}
          
        </div>
      </div>
    </div>
  );
}
