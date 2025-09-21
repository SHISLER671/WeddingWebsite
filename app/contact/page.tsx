import React from "react";
import Link from "next/link";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-100">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <Link 
            href="/" 
            className="text-rose-600 hover:text-rose-800 font-medium mb-4 inline-block"
          >
            ← Back to Home
          </Link>
          <h1 className="text-4xl md:text-6xl font-serif text-rose-800 mb-4">Contact Us</h1>
          <p className="text-lg text-gray-700 max-w-2xl mx-auto">
            Have questions about the wedding? Need to update your RSVP? We're here to help!
          </p>
        </div>

        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
          {/* Contact Form */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-serif text-rose-700 mb-6">Send us a Message</h2>
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
          <div className="space-y-8">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-serif text-rose-700 mb-6">Get in Touch</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">Email</h3>
                  <p className="text-gray-600">
                    <a href="mailto:wedding@example.com" className="text-rose-600 hover:text-rose-800">
                      wedding@example.com
                    </a>
                  </p>
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">Phone</h3>
                  <p className="text-gray-600">
                    <a href="tel:+1234567890" className="text-rose-600 hover:text-rose-800">
                      (123) 456-7890
                    </a>
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">Response Time</h3>
                  <p className="text-gray-600">
                    We'll get back to you within 24-48 hours
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-serif text-rose-700 mb-6">Quick Actions</h2>
              <div className="space-y-3">
                <Link
                  href="/rsvp"
                  className="block w-full text-center bg-rose-600 hover:bg-rose-700 text-white py-3 px-4 rounded-lg transition-colors duration-200"
                >
                  Submit/Update RSVP
                </Link>
                
                <Link
                  href="/info"
                  className="block w-full text-center border-2 border-rose-600 text-rose-600 hover:bg-rose-600 hover:text-white py-3 px-4 rounded-lg transition-colors duration-200"
                >
                  View Event Details
                </Link>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-serif text-rose-700 mb-4">Wedding Planning Team</h2>
              <p className="text-gray-600 text-sm">
                For vendor inquiries or coordination matters, please contact our wedding planner directly through the main contact information above.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
