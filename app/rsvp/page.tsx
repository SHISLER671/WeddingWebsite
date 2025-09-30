"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { useAccount } from "wagmi"
import { useSearchParams, useRouter } from "next/navigation"
import { lookupRSVP, type RSVPRecord } from "@/lib/rsvp-lookup"
import { Search, CheckCircle, AlertCircle } from "lucide-react"

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
        router.push("/confirmation")
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
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-100">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <Link href="/" className="text-rose-600 hover:text-rose-800 font-medium mb-4 inline-block">
            ← Back to Home
          </Link>
          <h1 className="text-4xl md:text-6xl font-serif text-rose-800 mb-4">
            {isEditMode ? "Edit Your RSVP" : "RSVP"}
          </h1>
          <p className="text-lg text-gray-700 max-w-2xl mx-auto">
            {isEditMode
              ? "Update your RSVP details below. Your previous response will be updated."
              : "We're so excited to celebrate with you! Please let us know if you'll be joining us on February 13, 2026."}
          </p>
        </div>

        {isEditMode && !foundRSVP && (
          <div className="max-w-2xl mx-auto mb-8 bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Search className="w-6 h-6 text-rose-600" />
              Find Your RSVP
            </h2>
            <p className="text-gray-600 mb-4">Enter your email address to look up and edit your existing RSVP.</p>

            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                value={lookupEmail}
                onChange={(e) => setLookupEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLookup()}
                placeholder="your.email@example.com"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-colors"
              />
              <button
                onClick={handleLookup}
                disabled={isLookingUp}
                className="px-6 py-3 bg-rose-600 hover:bg-rose-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-colors"
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
          </div>
        )}

        {isEditMode && foundRSVP && (
          <div className="max-w-2xl mx-auto mb-8 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg shadow-lg p-6 border-2 border-green-200">
            <div className="flex items-start gap-3 mb-4">
              <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-2xl font-semibold text-gray-800 mb-2">Your Current RSVP</h2>
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
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Guest Name */}
            <div>
              <label htmlFor="guestName" className="block text-sm font-semibold text-gray-700 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                id="guestName"
                name="guestName"
                value={formData.guestName}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-colors"
                placeholder="Your full name"
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-colors"
                placeholder="your.email@example.com"
              />
            </div>

            {/* Attendance */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Will you be attending? *</label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="attendance"
                    value="yes"
                    checked={formData.attendance === "yes"}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-rose-600 border-gray-300 focus:ring-rose-500"
                    required
                  />
                  <span className="ml-2 text-gray-700">Yes, I'll be there! 🎉</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="attendance"
                    value="no"
                    checked={formData.attendance === "no"}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-rose-600 border-gray-300 focus:ring-rose-500"
                    required
                  />
                  <span className="ml-2 text-gray-700">Sorry, I can't make it 💔</span>
                </label>
              </div>
            </div>

            {/* Number of Guests */}
            <div>
              <label htmlFor="guestCount" className="block text-sm font-semibold text-gray-700 mb-2">
                Number of Guests (including yourself)
              </label>
              <select
                id="guestCount"
                name="guestCount"
                value={formData.guestCount}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-colors"
              >
                <option value="1">1 Guest</option>
                <option value="2">2 Guests</option>
                <option value="3">3 Guests</option>
                <option value="4">4 Guests</option>
                <option value="5">5+ Guests</option>
              </select>
            </div>

            {/* Dietary Restrictions */}
            <div>
              <label htmlFor="dietary" className="block text-sm font-semibold text-gray-700 mb-2">
                Dietary Restrictions or Allergies
              </label>
              <textarea
                id="dietary"
                name="dietary"
                rows={3}
                value={formData.dietary}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-colors"
                placeholder="Please let us know about any dietary restrictions, allergies, or special meal preferences..."
              />
            </div>

            {/* Special Message */}
            <div>
              <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-2">
                Special Message (Optional)
              </label>
              <textarea
                id="message"
                name="message"
                rows={4}
                value={formData.message}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-colors"
                placeholder="Share a message, memory, or well wishes for the happy couple..."
              />
            </div>

            {/* Submit Button */}
            <div className="text-center pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-rose-600 hover:bg-rose-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-8 py-4 text-lg font-semibold rounded-lg transition-colors duration-200 shadow-lg"
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
