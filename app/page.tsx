"use client"

import type React from "react"
import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Mail, Menu, X } from "lucide-react"
import { useLoginWithAbstract } from "@abstract-foundation/agw-react"

export default function Home() {
  const { login, logout } = useLoginWithAbstract()
  const [showAdminLogin, setShowAdminLogin] = useState(false)
  const [adminUser, setAdminUser] = useState("")
  const [adminPassword, setAdminPassword] = useState("")
  const [adminError, setAdminError] = useState("")

  const handleWalletConnect = async () => {
    try {
      await login()
      // After successful login, redirect to RSVP
      setTimeout(() => {
        window.location.href = "/rsvp"
      }, 1000)
    } catch (error) {
      console.error("Error connecting wallet:", error)
      alert("Failed to connect wallet. Please try again.")
    }
  }

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setAdminError("")

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userType: adminUser,
          password: adminPassword,
        }),
      })

      if (response.ok) {
        const result = await response.json()
        // Successfully logged in, redirect to admin dashboard
        // Token is now stored in secure httpOnly cookie
        window.location.href = "/admin/dashboard"
      } else {
        const error = await response.json()
        setAdminError(error.message || "Invalid credentials")
      }
    } catch (error) {
      setAdminError("Login failed. Please try again.")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-100 via-pink-50 to-purple-100">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image src="/romantic-wedding-background-with-soft-florals.jpg" alt="Wedding background" fill className="object-cover opacity-30" />
        </div>

        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold mb-4 text-gray-800 text-balance">Pia & Ryan</h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-8">February 13, 2026 • Guam</p>
          <p className="text-lg md:text-xl text-gray-700 mb-12 max-w-2xl mx-auto text-pretty">
            Join us as we celebrate our love and begin our journey together as husband and wife
          </p>

          {/* RSVP Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <button
              onClick={handleWalletConnect}
              className="bg-rose-500 hover:bg-rose-600 text-white px-8 py-4 text-lg font-semibold rounded-lg transition-colors duration-200 shadow-lg"
            >
              Connect Wallet & RSVP
            </button>
            <Link
              href="/rsvp"
              className="border-2 border-rose-500 text-rose-500 hover:bg-rose-500 hover:text-white px-8 py-4 text-lg font-medium bg-white rounded-lg transition-colors duration-200 flex items-center"
            >
              <Mail className="w-5 h-5 mr-2" />
              Quick RSVP (Email Only)
            </Link>
          </div>

          {/* Navigation Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/info"
              className="bg-white/80 backdrop-blur-sm hover:bg-white text-gray-800 px-8 py-3 text-lg font-semibold rounded-lg transition-colors duration-200 shadow-md"
            >
              📋 Wedding Details
            </Link>
            <Link
              href="/seating"
              className="bg-white/80 backdrop-blur-sm hover:bg-white text-gray-800 px-8 py-3 text-lg font-semibold rounded-lg transition-colors duration-200 shadow-md"
            >
              💺 Find Your Seat
            </Link>
          </div>
        </div>
      </section>

      {/* Admin Hamburger Menu - Bottom Left */}
      <div className="fixed bottom-4 left-4 z-50">
        <button
          onClick={() => setShowAdminLogin(true)}
          className="bg-gray-800 hover:bg-gray-700 text-white p-3 rounded-full shadow-lg transition-colors duration-200"
          title="Admin Login"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Admin Login Modal */}
      {showAdminLogin && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800">Admin Login</h2>
              <button
                onClick={() => {
                  setShowAdminLogin(false)
                  setAdminError("")
                  setAdminUser("")
                  setAdminPassword("")
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">User Type</label>
                <select
                  value={adminUser}
                  onChange={(e) => setAdminUser(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500"
                >
                  <option value="">Select User Type</option>
                  <option value="BRIDE">BRIDE</option>
                  <option value="GROOM">GROOM</option>
                  <option value="PLANNER">PLANNER</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500"
                  placeholder="Enter password"
                />
              </div>

              {adminError && <div className="text-red-600 text-sm">{adminError}</div>}

              <button
                type="submit"
                className="w-full bg-rose-500 hover:bg-rose-600 text-white py-2 px-4 rounded-md transition-colors duration-200"
              >
                Login
              </button>
            </form>
          </div>
        </div>
      )}

      <footer className="text-center py-8 text-gray-600">
        <p>&copy; 2026 Pia & Ryan Wedding. Made with love.</p>
      </footer>
    </div>
  )
}
