"use client"
import Link from "next/link"
import { useState } from "react"

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle")
  const [submitMessage, setSubmitMessage] = useState("")

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
    setSubmitStatus("idle")

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (response.ok && result.success) {
        setSubmitStatus("success")
        setSubmitMessage(result.message)
        setFormData({ name: "", email: "", subject: "", message: "" })
      } else {
        throw new Error(result.error || "Failed to send message")
      }
    } catch (error) {
      console.error("Error sending message:", error)
      setSubmitStatus("error")
      setSubmitMessage("Sorry, there was an error sending your message. Please try again or contact us directly.")
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
          backgroundImage: "url('/p1Tricho.jpg')",
          backgroundAttachment: "fixed",
        }}
      />
      {/* Overlay for better text readability */}
      <div className="fixed inset-0 bg-black/20" />

      {/* Scrollable content */}
      <div className="relative z-10 container mx-auto px-4 py-16">

        {/* Header */}
        <div className="mb-12">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-serif font-semibold text-white mb-4 drop-shadow-lg">Contact Us</h1>
            <p className="text-lg text-white/90 max-w-2xl mx-auto drop-shadow-md">
              Have questions about the wedding? Need to update your RSVP? We're here to help!
            </p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto grid md:grid-cols-2 text-center gap-6">
          {/* Contact Form */}
          <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-lg p-8 border border-white/20 text-left">
            <h2 className="text-2xl font-serif text-jewel-burgundy mb-6 text-center">Send us a Message</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Status Messages */}
              {submitStatus === "success" && (
                <div className="bg-jewel-emerald/20 border border-jewel-emerald text-jewel-emerald px-4 py-3 rounded-lg">
                  ✅ {submitMessage}
                </div>
              )}
              {submitStatus === "error" && (
                <div className="bg-jewel-crimson/20 border border-jewel-crimson text-jewel-crimson px-4 py-3 rounded-lg">
                  ❌ {submitMessage}
                </div>
              )}

              <div>
                <label htmlFor="name" className="block text-sm font-semibold text-charcoal mb-2">
                  Your Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-jewel-burgundy/30 rounded-lg focus:ring-2 focus:ring-jewel-crimson focus:border-jewel-crimson transition-colors"
                  placeholder="Your name"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-charcoal mb-2">
                  Email Address
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

              <div>
                <label htmlFor="subject" className="block text-sm font-semibold text-charcoal mb-2">
                  Subject
                </label>
                <select
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-jewel-burgundy/30 rounded-lg focus:ring-2 focus:ring-jewel-crimson focus:border-jewel-crimson transition-colors"
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
                <label htmlFor="message" className="block text-sm font-semibold text-charcoal mb-2">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                  rows={5}
                  className="w-full px-4 py-3 border border-jewel-burgundy/30 rounded-lg focus:ring-2 focus:ring-jewel-crimson focus:border-jewel-crimson transition-colors"
                  placeholder="How can we help you?"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-jewel-burgundy hover:bg-jewel-crimson disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-3 text-lg font-medium rounded-full transition-colors duration-200 shadow-lg"
              >
                {isSubmitting ? "Sending..." : "Send Message"}
              </button>
            </form>
          </div>

          {/* Contact Information */}
        </div>
      </div>
    </div>
  )
}
