"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { useAccount } from "wagmi"
import { useSearchParams, useRouter } from "next/navigation"
import { lookupRSVP, type RSVPRecord } from "@/lib/rsvp-lookup"
import { Search, CheckCircle, AlertCircle } from "lucide-react"

const Charcoal = "#333333"

export default function RSVPPage() {
  const { address } = useAccount()
  const searchParams = useSearchParams()
  const router = useRouter()
  const isEditMode = searchParams.get("edit") === "true"

  const [formData, setFormData] = useState({
    guestName: "",
    email: "",
    attendance: "",
    guestCount: "1",
    dietary: "",
    message: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [lookupEmail, setLookupEmail] = useState("")
  const [isLookingUp, setIsLookingUp] = useState(false)
  const [lookupStatus, setLookupStatus] = useState<"idle" | "success" | "error" | "not-found">("idle")
  const [lookupMessage, setLookupMessage] = useState("")
  const [foundRSVP, setFoundRSVP] = useState<RSVPRecord | null>(null)
  const [seatingAssignment, setSeatingAssignment] = useState<any>(null)
  const [seatingStatus, setSeatingStatus] = useState<"idle" | "loading" | "found" | "not-found">("idle")

  const handleLookup = async () => {
    if (!lookupEmail) {
      setLookupStatus("error")
      setLookupMessage("Please enter your email address")
      return
    }

    setIsLookingUp(true)
    setLookupStatus("idle")
    setLookupMessage("")

    try {
      const result = await lookupRSVP({ email: lookupEmail })

      if (result.found && result.rsvp) {
        setLookupStatus("success")
        setLookupMessage(`Found your RSVP! Loading your details...`)
        setFoundRSVP(result.rsvp)

        // Pre-fill the form with existing data
        setFormData({
          guestName: result.rsvp.guest_name,
          email: result.rsvp.email,
          attendance: result.rsvp.attendance,
          guestCount: result.rsvp.guest_count.toString(),
          dietary: result.rsvp.dietary_restrictions || "",
          message: result.rsvp.special_message || "",
        })

        // Look up seating assignment
        await lookupSeatingAssignment(lookupEmail, result.rsvp.guest_name)
      } else {
        setLookupStatus("not-found")
        setLookupMessage("No RSVP found with this email. You can create a new RSVP below.")
      }
    } catch (error) {
      console.error("Lookup error:", error)
      setLookupStatus("error")
      setLookupMessage("Error looking up RSVP. Please try again.")
    } finally {
      setIsLookingUp(false)
    }
  }

  const lookupSeatingAssignment = async (email: string, guestName?: string) => {
    setSeatingStatus("loading")
    try {
      let url = `/api/seating?email=${encodeURIComponent(email)}`
      if (guestName) {
        url += `&name=${encodeURIComponent(guestName)}`
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch("/api/rsvp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          guest_name: formData.guestName,
          email: formData.email,
          attendance: formData.attendance,
          guest_count: Number.parseInt(formData.guestCount),
          dietary_restrictions: formData.dietary || null,
          special_message: formData.message || null,
          wallet_address: address || null,
        }),
      })

      const result = await response.json()

      if (response.ok && result.success) {
        router.push(`/confirmation?email=${encodeURIComponent(formData.email)}&name=${encodeURIComponent(formData.guestName)}`)
      } else {
        throw new Error(result.error || "Failed to submit RSVP")
      }
    } catch (error) {
      console.error("Error submitting RSVP:", error)
      alert(
        "Sorry, there was an error submitting your RSVP. Please try again or contact us directly if the problem continues.",
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen relative">
      {/* Fixed background image */}
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: isEditMode ? "url('/IMG-20251005-WA0011.jpg')" : "url('/IMG-20251005-WA0014.jpg')",
          backgroundAttachment: "fixed",
        }}
      />
      {/* Overlay for better text readability */}
      <div className="fixed inset-0 bg-black/20" />

      {/* Scrollable content */}
      <div className="relative z-10 container mx-auto px-4 py-16 font-sans">

        {/* Header */}
        <div className="mb-12">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-serif font-semibold text-white mb-4 drop-shadow-lg">
              {isEditMode ? "Edit Your RSVP" : "RSVP"}
            </h1>
            <p className="text-lg text-white/90 max-w-2xl mx-auto drop-shadow-md">
              {isEditMode
                ? "Update your RSVP details below. Your previous response will be updated."
                : "We're so excited to celebrate with you! Please let us know if you'll be joining us on February 13, 2026."}
            </p>
          </div>
        </div>

        {isEditMode && !foundRSVP && (
          <div className="max-w-2xl mx-auto mb-8 bg-white/80 backdrop-blur-sm rounded-lg shadow-lg p-6 border border-white/20">
            <h2 className="text-2xl font-semibold text-jewel-burgundy mb-4 flex items-center gap-2 font-serif">
              <Search className="w-6 h-6 text-jewel-crimson" />
              Find Your RSVP
            </h2>
            <p className="text-charcoal/80 mb-4">Enter your email address to look up and edit your existing RSVP.</p>

            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                value={lookupEmail}
                onChange={(e) => setLookupEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLookup()}
                placeholder="your.email@example.com"
                className="flex-1 px-4 py-3 border border-jewel-burgundy/30 rounded-lg focus:ring-2 focus:ring-jewel-crimson focus:border-jewel-crimson transition-colors"
              />
              <button
                onClick={handleLookup}
                disabled={isLookingUp}
                className="px-6 py-3 bg-jewel-burgundy hover:bg-jewel-crimson disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors shadow-lg"
              >
                {isLookingUp ? "Searching..." : "Look Up"}
              </button>
            </div>

            {lookupStatus !== "idle" && (
              <div
                className={`mt-4 p-4 rounded-lg flex items-start gap-3 ${
                  lookupStatus === "success"
                    ? "bg-green-50 text-green-800 border border-green-200"
                    : lookupStatus === "not-found"
                      ? "bg-blue-50 text-blue-800 border border-blue-200"
                      : "bg-red-50 text-red-800 border border-red-200"
                }`}
              >
                {lookupStatus === "success" ? (
                  <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                )}
                <span className="text-sm">{lookupMessage}</span>
              </div>
            )}

            {/* Seating Assignment Display */}
            {lookupStatus === "success" && (
              <div className="mt-4">
                {seatingStatus === "loading" && (
                  <div className="bg-blue-50 text-blue-800 border border-blue-200 p-4 rounded-lg flex items-center gap-3">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    <span className="text-sm">Looking up your seating assignment...</span>
                  </div>
                )}
                
                {seatingStatus === "found" && seatingAssignment && (
                  <div className="bg-jewel-gold/10 text-jewel-burgundy border border-jewel-gold/30 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 bg-jewel-gold rounded-full"></div>
                      <span className="font-semibold text-sm">Your Seating Assignment</span>
                    </div>
                    <div className="text-lg font-serif">
                      <strong>Table {seatingAssignment.table_number}, Seat {seatingAssignment.seat_number}</strong>
                    </div>
                    {seatingAssignment.plus_one_name && (
                      <div className="text-sm text-jewel-burgundy/80 mt-1">
                        Plus One: {seatingAssignment.plus_one_name} (Seat {seatingAssignment.plus_one_seat})
                      </div>
                    )}
                    {seatingAssignment.dietary_notes && (
                      <div className="text-xs text-jewel-burgundy/70 mt-2">
                        Dietary Notes: {seatingAssignment.dietary_notes}
                      </div>
                    )}
                  </div>
                )}
                
                {seatingStatus === "not-found" && (
                  <div className="bg-jewel-gold/10 text-jewel-burgundy border border-jewel-gold/30 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 bg-jewel-gold rounded-full"></div>
                      <span className="font-semibold text-sm">Seating Assignment</span>
                    </div>
                    <div className="text-sm text-jewel-burgundy/80 mb-2">
                      We're still finalizing seating arrangements for your table. 
                    </div>
                    <div className="text-xs text-jewel-burgundy/70">
                      💌 Please contact us directly to confirm your seating - we want to make sure you have the perfect spot!
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {isEditMode && foundRSVP && (
          <div className="max-w-2xl mx-auto mb-8 bg-green-50/80 backdrop-blur-sm rounded-lg shadow-lg p-6 border-2 border-green-200/50">
            <div className="flex items-start gap-3 mb-4">
              <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-2xl font-semibold text-gray-800 mb-2 font-serif">Your Current RSVP</h2>
                <div className="space-y-2 text-gray-700">
                  <p>
                    <strong>Name:</strong> {foundRSVP.guest_name}
                  </p>
                  <p>
                    <strong>Email:</strong> {foundRSVP.email}
                  </p>
                  <p>
                    <strong>Status:</strong> {foundRSVP.attendance === "yes" ? "✅ Attending" : "❌ Not Attending"}
                  </p>
                  <p>
                    <strong>Guests:</strong> {foundRSVP.guest_count}
                  </p>
                  {foundRSVP.dietary_restrictions && (
                    <p>
                      <strong>Dietary:</strong> {foundRSVP.dietary_restrictions}
                    </p>
                  )}
                  {foundRSVP.special_message && (
                    <p>
                      <strong>Message:</strong> {foundRSVP.special_message}
                    </p>
                  )}
                </div>
                <p className="text-sm text-gray-600 mt-4">Update any details below and submit to save your changes.</p>
              </div>
            </div>
          </div>
        )}

        {/* RSVP Form */}
        <div className="max-w-2xl mx-auto bg-white/80 backdrop-blur-sm rounded-lg shadow-lg p-8 border border-white/20">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Guest Name */}
            <div>
              <label htmlFor="guestName" className="block text-sm font-semibold text-charcoal mb-2">
                Full Name *
              </label>
              <input
                type="text"
                id="guestName"
                name="guestName"
                value={formData.guestName}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-jewel-burgundy/30 rounded-lg focus:ring-2 focus:ring-jewel-crimson focus:border-jewel-crimson transition-colors"
                placeholder="Your full name"
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-charcoal mb-2">
                Email Address *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-jewel-burgundy/30 rounded-lg focus:ring-2 focus:ring-jewel-crimson focus:border-jewel-crimson transition-colors"
                placeholder="your.email@example.com"
              />
            </div>

            {/* Attendance */}
            <div>
              <label className="block text-sm font-semibold text-charcoal mb-3">Will you be attending? *</label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="attendance"
                    value="yes"
                    checked={formData.attendance === "yes"}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-jewel-crimson border-jewel-burgundy/30 focus:ring-jewel-crimson"
                    required
                  />
                  <span className="ml-2 text-charcoal">Yes, I'll be there! 🎉</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="attendance"
                    value="no"
                    checked={formData.attendance === "no"}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-jewel-crimson border-jewel-burgundy/30 focus:ring-jewel-crimson"
                    required
                  />
                  <span className="ml-2 text-charcoal">Sorry, I can't make it 💔</span>
                </label>
              </div>
            </div>

            {/* Number of Guests */}
            <div>
              <label htmlFor="guestCount" className="block text-sm font-semibold text-charcoal mb-2">
                Number of Guests (including yourself)
              </label>
              <select
                id="guestCount"
                name="guestCount"
                value={formData.guestCount}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-jewel-burgundy/30 rounded-lg focus:ring-2 focus:ring-jewel-crimson focus:border-jewel-crimson transition-colors"
              >
                <option value="1">1 Guest</option>
                <option value="2">2 Guests</option>
                <option value="3">3 Guests</option>
                <option value="4">4 Guests</option>
                <option value="5">5+ Guests</option>
              </select>

              {/* Adults Only Notice */}
              <div className="mt-4 bg-jewel-fuchsia/10 border border-jewel-fuchsia/30 rounded-lg p-4">
                <p className="text-sm text-charcoal leading-relaxed">
                  💕 <strong>Adults-Only Celebration:</strong> We love your little ones, but we've planned this as an
                  adults-only evening so you can relax and enjoy a night out! We hope this gives you a wonderful excuse
                  for a date night. If you absolutely need to bring your children due to exceptional circumstances,
                  please let us know in the message section below and we'll do our best to accommodate.
                </p>
              </div>
            </div>

            {/* Dietary Restrictions */}
            <div>
              <label htmlFor="dietary" className="block text-sm font-semibold text-charcoal mb-2">
                Dietary Restrictions or Allergies
              </label>
              <textarea
                id="dietary"
                name="dietary"
                rows={3}
                value={formData.dietary}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-jewel-burgundy/30 rounded-lg focus:ring-2 focus:ring-jewel-crimson focus:border-jewel-crimson transition-colors"
                placeholder="Please let us know about any dietary restrictions, allergies, or special meal preferences..."
              />
            </div>

            {/* Special Message */}
            <div>
              <label htmlFor="message" className="block text-sm font-semibold text-charcoal mb-2">
                Special Message (Optional)
              </label>
              <textarea
                id="message"
                name="message"
                rows={4}
                value={formData.message}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-jewel-burgundy/30 rounded-lg focus:ring-2 focus:ring-jewel-crimson focus:border-jewel-crimson transition-colors"
                placeholder="Share a message, memory, or well wishes for the happy couple..."
              />
            </div>

            {/* Submit Button */}
            <div className="text-center pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-jewel-burgundy hover:bg-jewel-crimson disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-10 py-4 text-lg font-medium rounded-full transition-colors duration-200 shadow-lg"
              >
                {isSubmitting ? "Submitting..." : isEditMode ? "Update RSVP" : "Submit RSVP"}
              </button>
            </div>
          </form>
        </div>

        {/* Additional Info */}
        <div className="text-center mt-12 text-gray-600"></div>
      </div>
    </div>
  )
}
