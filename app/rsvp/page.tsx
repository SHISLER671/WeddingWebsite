"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { useAccount } from "wagmi"
import { useSearchParams, useRouter } from "next/navigation"
import { lookupRSVP, type RSVPRecord } from "@/lib/rsvp-lookup"
import { Search, CheckCircle, AlertCircle } from "lucide-react"

const Charcoal = "#333333"

interface AutocompleteGuest {
  id: string
  guest_name: string
  email: string | null
  allowed_party_size: number
  display_name: string
}

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
  const [lookupName, setLookupName] = useState("")
  const [lookupSuggestions, setLookupSuggestions] = useState<AutocompleteGuest[]>([])
  const [showLookupSuggestions, setShowLookupSuggestions] = useState(false)
  const [isLoadingLookupSuggestions, setIsLoadingLookupSuggestions] = useState(false)
  const [selectedLookupIndex, setSelectedLookupIndex] = useState(-1)
  const lookupInputRef = useRef<HTMLInputElement>(null)
  const lookupRef = useRef<HTMLDivElement>(null)
  const lookupDebounceTimerRef = useRef<NodeJS.Timeout | null>(null)
  const [isLookingUp, setIsLookingUp] = useState(false)
  
  // Handle lookup keyboard navigation
  const handleLookupKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showLookupSuggestions || lookupSuggestions.length === 0) {
      if (e.key === "Enter") {
        handleLookupWithGuest()
      }
      return
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault()
        setSelectedLookupIndex((prev) =>
          prev < lookupSuggestions.length - 1 ? prev + 1 : prev
        )
        break
      case "ArrowUp":
        e.preventDefault()
        setSelectedLookupIndex((prev) => (prev > 0 ? prev - 1 : -1))
        break
      case "Enter":
        e.preventDefault()
        if (selectedLookupIndex >= 0 && selectedLookupIndex < lookupSuggestions.length) {
          selectLookupSuggestion(lookupSuggestions[selectedLookupIndex])
        } else {
          handleLookupWithGuest()
        }
        break
      case "Escape":
        setShowLookupSuggestions(false)
        break
    }
  }

  // Handle lookup button click
  const handleLookup = () => {
    handleLookupWithGuest()
  }

  // Close lookup suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (lookupRef.current && !lookupRef.current.contains(event.target as Node)) {
        setShowLookupSuggestions(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])
  const [lookupStatus, setLookupStatus] = useState<"idle" | "success" | "error" | "not-found">("idle")
  const [lookupMessage, setLookupMessage] = useState("")
  const [foundRSVP, setFoundRSVP] = useState<RSVPRecord | null>(null)
  const [seatingAssignment, setSeatingAssignment] = useState<any>(null)
  const [seatingStatus, setSeatingStatus] = useState<"idle" | "loading" | "found" | "not-found">("idle")

  // Autocomplete state
  const [autocompleteSuggestions, setAutocompleteSuggestions] = useState<AutocompleteGuest[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1)
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false)
  const [selectedGuest, setSelectedGuest] = useState<AutocompleteGuest | null>(null) // Track selected guest
  const [nameValidationError, setNameValidationError] = useState<string>("") // Validation error
  const autocompleteRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Autocomplete search for lookup
  const searchLookupGuests = async (query: string) => {
    if (query.length < 2) {
      setLookupSuggestions([])
      setShowLookupSuggestions(false)
      return
    }

    setIsLoadingLookupSuggestions(true)
    try {
      const response = await fetch(`/api/guests/autocomplete?q=${encodeURIComponent(query)}&limit=10`)
      const result = await response.json()

      if (result.success && result.results) {
        setLookupSuggestions(result.results)
        setShowLookupSuggestions(result.results.length > 0)
        setSelectedLookupIndex(-1)
      } else {
        setLookupSuggestions([])
        setShowLookupSuggestions(false)
      }
    } catch (error) {
      console.error("Lookup autocomplete error:", error)
      setLookupSuggestions([])
      setShowLookupSuggestions(false)
    } finally {
      setIsLoadingLookupSuggestions(false)
    }
  }

  // Debounced lookup search
  const debouncedLookupSearch = (query: string) => {
    if (lookupDebounceTimerRef.current) {
      clearTimeout(lookupDebounceTimerRef.current)
    }
    lookupDebounceTimerRef.current = setTimeout(() => {
      searchLookupGuests(query)
    }, 300)
  }

  // Handle lookup name input change
  const handleLookupNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setLookupName(value)
    
    if (value.length >= 2) {
      debouncedLookupSearch(value)
    } else {
      setLookupSuggestions([])
      setShowLookupSuggestions(false)
    }
  }

  // Select lookup suggestion
  const selectLookupSuggestion = (guest: AutocompleteGuest) => {
    setLookupName(guest.guest_name)
    setLookupEmail(guest.email || "")
    setLookupSuggestions([])
    setShowLookupSuggestions(false)
    setSelectedLookupIndex(-1)
    lookupInputRef.current?.blur()
    // Auto-trigger lookup
    handleLookupWithGuest(guest)
  }

  // Handle lookup with selected guest
  const handleLookupWithGuest = async (guest?: AutocompleteGuest) => {
    const emailToUse = guest?.email || lookupEmail
    const nameToUse = guest?.guest_name || lookupName

    if (!emailToUse && !nameToUse) {
      setLookupStatus("error")
      setLookupMessage("Please select your name from the dropdown or enter your email")
      return
    }

    setIsLookingUp(true)
    setLookupStatus("idle")
    setLookupMessage("")
    setShowLookupSuggestions(false)

    try {
      const result = await lookupRSVP({ 
        email: emailToUse || undefined,
        name: nameToUse || undefined
      })

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

        // In edit mode, mark as valid (they already have an RSVP)
        if (isEditMode) {
          setSelectedGuest({
            id: 'existing',
            guest_name: result.rsvp.guest_name,
            email: result.rsvp.email || null,
            allowed_party_size: result.rsvp.guest_count || 1,
            display_name: result.rsvp.guest_name
          })
        }

        // Look up seating assignment
        await lookupSeatingAssignment(result.rsvp.email, result.rsvp.guest_name)
      } else {
        setLookupStatus("not-found")
        if (result.message) {
          setLookupMessage(result.message)
        } else {
          setLookupMessage("No RSVP found. You can create a new RSVP below.")
        }
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

  // Autocomplete search function with debouncing
  const searchGuests = async (query: string) => {
    if (query.length < 2) {
      setAutocompleteSuggestions([])
      setShowSuggestions(false)
      return
    }

    setIsLoadingSuggestions(true)
    try {
      const response = await fetch(`/api/guests/autocomplete?q=${encodeURIComponent(query)}&limit=10`)
      const result = await response.json()

      if (result.success && result.results) {
        setAutocompleteSuggestions(result.results)
        setShowSuggestions(result.results.length > 0)
        setSelectedSuggestionIndex(-1)
      } else {
        setAutocompleteSuggestions([])
        setShowSuggestions(false)
      }
    } catch (error) {
      console.error("Autocomplete error:", error)
      setAutocompleteSuggestions([])
      setShowSuggestions(false)
    } finally {
      setIsLoadingSuggestions(false)
    }
  }

  // Debounced search
  const debouncedSearch = (query: string) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }
    debounceTimerRef.current = setTimeout(() => {
      searchGuests(query)
    }, 300) // 300ms debounce
  }

  // Handle guest name input change
  const handleGuestNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setFormData((prev) => ({
      ...prev,
      guestName: value,
    }))

    // Clear selected guest if user types (they need to select from dropdown)
    if (selectedGuest && value !== selectedGuest.guest_name) {
      setSelectedGuest(null)
      setNameValidationError("")
    }

    // Trigger autocomplete search
    if (value.length >= 2) {
      debouncedSearch(value)
    } else {
      setAutocompleteSuggestions([])
      setShowSuggestions(false)
    }
  }

  // Handle suggestion selection
  const selectSuggestion = (guest: AutocompleteGuest) => {
    setFormData((prev) => ({
      ...prev,
      guestName: guest.guest_name,
      email: guest.email || prev.email, // Pre-fill email if available
    }))
    setSelectedGuest(guest) // Mark as selected from dropdown
    setNameValidationError("") // Clear any validation errors
    setShowSuggestions(false)
    setAutocompleteSuggestions([])
    setSelectedSuggestionIndex(-1)
    inputRef.current?.blur()
  }

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || autocompleteSuggestions.length === 0) return

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault()
        setSelectedSuggestionIndex((prev) =>
          prev < autocompleteSuggestions.length - 1 ? prev + 1 : prev
        )
        break
      case "ArrowUp":
        e.preventDefault()
        setSelectedSuggestionIndex((prev) => (prev > 0 ? prev - 1 : -1))
        break
      case "Enter":
        e.preventDefault()
        if (selectedSuggestionIndex >= 0 && selectedSuggestionIndex < autocompleteSuggestions.length) {
          selectSuggestion(autocompleteSuggestions[selectedSuggestionIndex])
        }
        break
      case "Escape":
        setShowSuggestions(false)
        setSelectedSuggestionIndex(-1)
        inputRef.current?.blur()
        break
    }
  }

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (autocompleteRef.current && !autocompleteRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    
    // Special handling for guest name to trigger autocomplete
    if (name === "guestName") {
      handleGuestNameChange(e as React.ChangeEvent<HTMLInputElement>)
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate that a guest was selected from the dropdown (skip in edit mode if already has RSVP)
    if (!isEditMode || !foundRSVP) {
      if (!selectedGuest) {
        setNameValidationError("Please select your name from the dropdown list")
        inputRef.current?.focus()
        return
      }

      // Ensure the name matches the selected guest
      if (formData.guestName !== selectedGuest.guest_name) {
        setNameValidationError("Please select your name from the dropdown list")
        inputRef.current?.focus()
        return
      }
    }

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
            
            {/* Edit Mode Helpful Note */}
            <div className="bg-jewel-gold/10 border border-jewel-gold/30 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 bg-jewel-gold/20 rounded-full flex items-center justify-center mt-0.5">
                  <div className="w-2 h-2 bg-jewel-gold rounded-full"></div>
                </div>
                <div>
                  <h4 className="font-semibold text-jewel-burgundy text-sm mb-1">Edit RSVP Reminder</h4>
                  <p className="text-jewel-burgundy text-sm leading-relaxed">
                    Use the <strong>same name from your invitation</strong>, or enter your email address to look up and edit your existing RSVP. This helps us keep everything organized!
                  </p>
                </div>
              </div>
            </div>


            <div ref={lookupRef} className="relative">
              <label className="block text-sm font-semibold text-jewel-burgundy mb-2">
                Search by Name or Email
              </label>
              <div className="relative">
                <input
                  ref={lookupInputRef}
                  type="text"
                  value={lookupName || lookupEmail}
                  onChange={(e) => {
                    const value = e.target.value
                    // Check if it looks like an email
                    if (value.includes('@')) {
                      setLookupEmail(value)
                      setLookupName("")
                      setLookupSuggestions([])
                      setShowLookupSuggestions(false)
                    } else {
                      setLookupName(value)
                      setLookupEmail("")
                      // Trigger autocomplete search
                      if (value.length >= 2) {
                        debouncedLookupSearch(value)
                      } else {
                        setLookupSuggestions([])
                        setShowLookupSuggestions(false)
                      }
                    }
                  }}
                  onKeyDown={handleLookupKeyDown}
                  onFocus={() => {
                    if ((lookupName.length >= 2 || lookupEmail.length >= 2) && lookupSuggestions.length > 0) {
                      setShowLookupSuggestions(true)
                    }
                  }}
                  placeholder="Start typing your name or email..."
                  className="w-full px-4 py-3 border border-jewel-burgundy/30 rounded-lg focus:ring-2 focus:ring-jewel-crimson focus:border-jewel-crimson transition-colors"
                  autoComplete="off"
                />
                {isLoadingLookupSuggestions && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-jewel-burgundy"></div>
                  </div>
                )}
              </div>

              {/* Autocomplete Suggestions Dropdown */}
              {showLookupSuggestions && lookupSuggestions.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-jewel-burgundy/30 rounded-lg shadow-lg max-h-60 overflow-auto">
                  {lookupSuggestions.map((guest, index) => (
                    <button
                      key={guest.id}
                      type="button"
                      onClick={() => selectLookupSuggestion(guest)}
                      className={`w-full text-left px-4 py-3 hover:bg-jewel-burgundy/10 transition-colors ${
                        index === selectedLookupIndex ? "bg-jewel-burgundy/20" : ""
                      } ${
                        index === 0 ? "rounded-t-lg" : ""
                      } ${
                        index === lookupSuggestions.length - 1 ? "rounded-b-lg" : ""
                      }`}
                    >
                      <div className="font-medium text-charcoal">{guest.display_name}</div>
                      {guest.email && (
                        <div className="text-xs text-gray-500 mt-0.5">{guest.email}</div>
                      )}
                    </button>
                  ))}
                </div>
              )}

              {(!lookupName && !lookupEmail) && (
                <p className="text-xs text-gray-500 mt-1">Type at least 2 characters to see suggestions</p>
              )}
            </div>

            {lookupStatus !== "idle" && (
              <div
                className={`mt-4 p-4 rounded-lg flex items-start gap-3 ${
                  lookupStatus === "success"
                    ? "bg-jewel-emerald/10 text-jewel-emerald border border-jewel-emerald/30"
                    : lookupStatus === "not-found"
                      ? "bg-soft-blush/80 text-jewel-sapphire border border-jewel-sapphire/30"
                      : "bg-jewel-crimson/10 text-jewel-crimson border border-jewel-crimson/30"
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
                  <div className="bg-soft-blush/80 text-jewel-burgundy border border-jewel-burgundy/30 p-4 rounded-lg flex items-center gap-3">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-jewel-burgundy"></div>
                    <span className="text-sm">Looking up your seating assignment...</span>
                  </div>
                )}
                
                {seatingStatus === "found" && seatingAssignment && (
                  <div className="bg-soft-blush/95 backdrop-blur-sm rounded-2xl shadow-lg border border-jewel-burgundy/30 p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 bg-jewel-burgundy/20 rounded-full flex items-center justify-center">
                        <div className="w-3 h-3 bg-jewel-burgundy rounded-full"></div>
                      </div>
                      <h2 className="text-xl font-serif text-jewel-burgundy">Your Seating Assignment</h2>
                    </div>
                    <div className="text-2xl font-bold text-jewel-sapphire mb-2">
                      Table {seatingAssignment.table_number}
                    </div>
                    {seatingAssignment.plus_one_name && (
                      <div className="text-jewel-sapphire">
                        Plus One: {seatingAssignment.plus_one_name}
                      </div>
                    )}
                    {seatingAssignment.dietary_notes && (
                      <div className="text-xs text-jewel-burgundy/80 mt-2">
                        Dietary Notes: {seatingAssignment.dietary_notes}
                      </div>
                    )}
                  </div>
                )}
                
                {seatingStatus === "not-found" && (
                  <div className="bg-soft-blush/80 text-jewel-burgundy border border-jewel-burgundy/30 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 bg-jewel-burgundy rounded-full"></div>
                      <span className="font-semibold text-sm text-jewel-burgundy">Seating Assignment</span>
                    </div>
                    <div className="text-sm text-jewel-burgundy mb-2">
                      We're still finalizing seating arrangements for your table. 
                    </div>
                    <div className="text-xs text-jewel-crimson">
                      Please contact us directly to confirm your seating - we want to make sure you have the perfect spot!
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {isEditMode && foundRSVP && (
          <div className="max-w-2xl mx-auto mb-8 bg-soft-blush/95 backdrop-blur-sm rounded-2xl shadow-lg border border-jewel-burgundy/30 p-6">
            <div className="flex items-start gap-3 mb-4">
              <CheckCircle className="w-6 h-6 text-jewel-sapphire flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-2xl font-semibold text-jewel-sapphire mb-2 font-serif">Your Current RSVP</h2>
                <div className="space-y-2 text-jewel-sapphire">
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
                <p className="text-sm text-jewel-crimson/80 mt-4">Update any details below and submit to save your changes.</p>
              </div>
            </div>
          </div>
        )}

        {/* RSVP Form */}
        <div className="max-w-2xl mx-auto bg-white/80 backdrop-blur-sm rounded-lg shadow-lg p-8 border border-white/20">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Helpful Note */}
            <div className="bg-soft-blush/80 border border-jewel-sapphire/30 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 bg-jewel-sapphire/20 rounded-full flex items-center justify-center mt-0.5">
                  <div className="w-2 h-2 bg-jewel-sapphire rounded-full"></div>
                </div>
                <div>
                  <h4 className="font-semibold text-jewel-sapphire text-sm mb-1">Quick Tip</h4>
                  <p className="text-jewel-burgundy text-sm leading-relaxed">
                    <strong>Start typing your name</strong> and select it from the dropdown that appears. This helps ensure you select the correct name (especially if you share a first name with other guests). 
                    If you're bringing a plus-one, please add their name(s) in the special message box below. Thank you!
                  </p>
                </div>
              </div>
            </div>
            
            {/* Guest Name with Autocomplete */}
            <div ref={autocompleteRef} className="relative">
              <label htmlFor="guestName" className="block text-base md:text-sm font-semibold text-charcoal mb-2">
                Full Name *
              </label>
              <div className="relative">
                <input
                  ref={inputRef}
                  type="text"
                  id="guestName"
                  name="guestName"
                  value={formData.guestName}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  onFocus={() => {
                    if (formData.guestName.length >= 2 && autocompleteSuggestions.length > 0) {
                      setShowSuggestions(true)
                    }
                  }}
                  required
                  className="w-full px-4 py-3 border border-jewel-burgundy/30 rounded-lg focus:ring-2 focus:ring-jewel-crimson focus:border-jewel-crimson transition-colors"
                  placeholder="Start typing your name..."
                  autoComplete="off"
                />
                {isLoadingSuggestions && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-jewel-burgundy"></div>
                  </div>
                )}
              </div>

              {/* Autocomplete Suggestions Dropdown */}
              {showSuggestions && autocompleteSuggestions.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-jewel-burgundy/30 rounded-lg shadow-lg max-h-60 overflow-auto">
                  {autocompleteSuggestions.map((guest, index) => (
                    <button
                      key={guest.id}
                      type="button"
                      onClick={() => selectSuggestion(guest)}
                      className={`w-full text-left px-4 py-3 hover:bg-jewel-burgundy/10 transition-colors ${
                        index === selectedSuggestionIndex ? "bg-jewel-burgundy/20" : ""
                      } ${
                        index === 0 ? "rounded-t-lg" : ""
                      } ${
                        index === autocompleteSuggestions.length - 1 ? "rounded-b-lg" : ""
                      }`}
                    >
                      <div className="font-medium text-charcoal">{guest.display_name}</div>
                      {guest.email && (
                        <div className="text-xs text-gray-500 mt-0.5">{guest.email}</div>
                      )}
                    </button>
                  ))}
                </div>
              )}

              {/* Helpful hint */}
              {formData.guestName.length > 0 && formData.guestName.length < 2 && (
                <p className="text-xs text-gray-500 mt-1">Type at least 2 characters to see suggestions</p>
              )}
              
              {/* Validation error */}
              {nameValidationError && (
                <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {nameValidationError}
                </p>
              )}
              
              {/* Success indicator */}
              {selectedGuest && formData.guestName === selectedGuest.guest_name && (
                <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  Name selected from guest list
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-base md:text-sm font-semibold text-charcoal mb-2">
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
              <label className="block text-base md:text-sm font-semibold text-charcoal mb-3">Will you be attending? *</label>
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
                  <span className="ml-2 text-charcoal">Yes, I'll be there!</span>
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
                  <span className="ml-2 text-charcoal">Sorry, I can't make it</span>
                </label>
              </div>
            </div>

            {/* Number of Guests */}
            <div>
              <label htmlFor="guestCount" className="block text-base md:text-sm font-semibold text-charcoal mb-2">
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

              {/* Children Policy Notice */}
              <div className="mt-4 bg-jewel-fuchsia/10 border border-jewel-fuchsia/30 rounded-lg p-4">
                <p className="text-base md:text-sm text-charcoal leading-relaxed">
                  For those with little ones: We are looking forward to having a night full of dancing, drinking, and celebration. We would love for you to enjoy the night child-free with us, so please arrange for a babysitter if you have younglings. We can't wait to have you there!
                </p>
              </div>
            </div>

            {/* Dietary Restrictions */}
            <div>
              <label htmlFor="dietary" className="block text-base md:text-sm font-semibold text-charcoal mb-2">
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
              <label htmlFor="message" className="block text-base md:text-sm font-semibold text-charcoal mb-2">
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
