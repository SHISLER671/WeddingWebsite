"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart, MapPin, Search, User, Mail } from "lucide-react";
import seatingData from "../../data/seating-data.json";

interface SeatingAssignment {
  name: string;
  email: string;
  table: string;
  seat: string;
  x: number; // Position on map (percentage)
  y: number; // Position on map (percentage)
}

export default function SeatingPage() {
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [foundSeat, setFoundSeat] = useState<SeatingAssignment | null>(null);
  const [searchError, setSearchError] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(true);
    setSearchError('');
    setFoundSeat(null);

    try {
      // First try to search in Supabase database
      const response = await fetch(`/api/seating?name=${encodeURIComponent(guestName)}&email=${encodeURIComponent(guestEmail)}`);
      const result = await response.json();

      if (response.ok && result.success) {
        setFoundSeat(result.data);
      } else {
        // Fallback to local JSON data if database lookup fails
        const guest = seatingData.seatingChart.find(
          (assignment) => 
            assignment.name.toLowerCase().trim() === guestName.toLowerCase().trim() &&
            assignment.email.toLowerCase().trim() === guestEmail.toLowerCase().trim()
        );

        if (guest) {
          setFoundSeat(guest);
        } else {
          setSearchError(result.error || 'No seating assignment found. Please check your name and email, or contact the wedding organizers.');
        }
      }
    } catch (error) {
      console.error('Error searching for seat:', error);
      // Fallback to local JSON data on error
      try {
        const guest = seatingData.seatingChart.find(
          (assignment) => 
            assignment.name.toLowerCase().trim() === guestName.toLowerCase().trim() &&
            assignment.email.toLowerCase().trim() === guestEmail.toLowerCase().trim()
        );

        if (guest) {
          setFoundSeat(guest);
        } else {
          setSearchError('No seating assignment found. Please check your name and email, or contact the wedding organizers.');
        }
      } catch (fallbackError) {
        setSearchError('Sorry, there was an error finding your seat. Please try again.');
      }
    } finally {
      setIsSearching(false);
    }
  };

  const clearSearch = () => {
    setGuestName('');
    setGuestEmail('');
    setFoundSeat(null);
    setSearchError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-100">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <Link 
            href="/info" 
            className="text-rose-600 hover:text-rose-800 font-medium mb-4 inline-block"
          >
            ← Back to Wedding Details
          </Link>
          <h1 className="text-4xl md:text-6xl font-serif text-rose-800 mb-4">Seating Plan</h1>
          <p className="text-lg text-gray-700 max-w-2xl mx-auto">
            Find your seat at Tasi Ballroom for our special celebration on February 13, 2026.
          </p>
        </div>

        {/* Search Form */}
        <div className="max-w-lg mx-auto mb-12 bg-white rounded-lg shadow-lg p-6">
          <form onSubmit={handleSearch} className="space-y-4">
            <div>
              <label htmlFor="guestName" className="block text-sm font-semibold text-gray-700 mb-2">
                <User className="inline h-4 w-4 mr-1" />
                Your Full Name
              </label>
              <input
                type="text"
                id="guestName"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-colors"
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <label htmlFor="guestEmail" className="block text-sm font-semibold text-gray-700 mb-2">
                <Mail className="inline h-4 w-4 mr-1" />
                Email Address
              </label>
              <input
                type="email"
                id="guestEmail"
                value={guestEmail}
                onChange={(e) => setGuestEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-colors"
                placeholder="Enter your email address"
              />
            </div>

            {/* Error Message */}
            {searchError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-600 text-sm">{searchError}</p>
              </div>
            )}

            {/* Search Button */}
            <button
              type="submit"
              disabled={isSearching}
              className="w-full bg-rose-600 hover:bg-rose-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-3 px-4 rounded-lg font-semibold transition-colors duration-200 shadow-lg flex items-center justify-center gap-2"
            >
              <Search className="h-4 w-4" />
              {isSearching ? 'Searching...' : 'Find My Seat'}
            </button>

            {foundSeat && (
              <button
                type="button"
                onClick={clearSearch}
                className="w-full bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-lg font-medium transition-colors duration-200"
              >
                Search Again
              </button>
            )}
          </form>
        </div>

        {/* Seating Assignment Display */}
        {foundSeat && (
          <div className="max-w-4xl mx-auto mb-8">
            <div className="bg-white rounded-lg shadow-lg p-6 text-center mb-6">
              <div className="flex items-center justify-center gap-2 mb-3">
                <MapPin className="h-6 w-6 text-rose-600" />
                <h2 className="text-2xl font-bold text-gray-800">Your Seat Assignment</h2>
              </div>
              <div className="bg-rose-50 rounded-lg p-4 inline-block">
                <p className="text-lg font-semibold text-rose-800">{foundSeat.table}</p>
                <p className="text-md text-rose-600">{foundSeat.seat}</p>
              </div>
              <p className="text-gray-600 mt-3">
                Your seat is highlighted with a ❤️ on the ballroom map below
              </p>
            </div>

            {/* Ballroom Map */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4 text-center">
                Tasi Ballroom Layout
              </h3>
              <div className="relative w-full h-96 bg-gray-100 rounded-lg overflow-hidden">
                {/* Ballroom Background Image */}
                <Image
                  src="/images/tasi-ballroom.jpg"
                  alt="Tasi Ballroom"
                  fill
                  className="object-cover opacity-70"
                />
                
                {/* Guest's Seat Marker */}
                <div 
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 z-10"
                  style={{
                    left: `${foundSeat.x}%`,
                    top: `${foundSeat.y}%`
                  }}
                >
                  <div className="relative">
                    <Heart className="h-8 w-8 text-red-500 fill-current animate-pulse drop-shadow-lg" />
                    <div className="absolute top-10 left-1/2 transform -translate-x-1/2 bg-white px-2 py-1 rounded shadow-lg text-xs font-semibold text-gray-800 whitespace-nowrap">
                      Your Seat
                    </div>
                  </div>
                </div>

                {/* Ballroom Features Overlay */}
                <div className="absolute inset-0 pointer-events-none">
                  {/* Stage Area */}
                  <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-rose-200 bg-opacity-80 px-4 py-2 rounded-lg">
                    <p className="text-sm font-semibold text-rose-800">🎵 Stage</p>
                  </div>
                  
                  {/* Dance Floor */}
                  <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 bg-purple-200 bg-opacity-80 px-4 py-2 rounded-lg">
                    <p className="text-sm font-semibold text-purple-800">💃 Dance Floor</p>
                  </div>
                </div>
              </div>

              <div className="mt-4 text-center text-sm text-gray-600">
                <p>Welcome to Tasi Ballroom! We're so excited to celebrate with you.</p>
              </div>
            </div>
          </div>
        )}

        {/* Help Section */}
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Need Help?</h3>
            <p className="text-gray-600 mb-4">
              If you can't find your seating assignment or have any questions, please don't hesitate to reach out.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/rsvp" 
                className="text-rose-600 hover:text-rose-800 font-medium"
              >
                Update Your RSVP
              </Link>
              <Link 
                href="/contact" 
                className="text-rose-600 hover:text-rose-800 font-medium"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
