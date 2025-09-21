"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Users, Mail, Calendar, Heart, LogOut, RefreshCw } from "lucide-react";

interface RSVP {
  id: number;
  guest_name: string;
  email: string;
  attendance: 'yes' | 'no';
  guest_count: number;
  dietary_restrictions?: string;
  special_message?: string;
  wallet_address?: string;
  created_at: string;
}

interface AdminUser {
  userType: string;
  id: number;
}

interface AdminDashboardClientProps {
  adminUser: AdminUser;
}

export default function AdminDashboardClient({ adminUser }: AdminDashboardClientProps) {
  const [rsvps, setRsvps] = useState<RSVP[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadRSVPs();
  }, []);

  const loadRSVPs = async () => {
    try {
      setIsLoading(true);
      // Fetch RSVPs from the API
      const response = await fetch('/api/admin/rsvps');

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setRsvps(result.data);
          setError('');
        } else {
          throw new Error(result.error || 'Failed to fetch RSVPs');
        }
      } else {
        throw new Error('Failed to fetch RSVPs');
      }
    } catch (err) {
      console.error('Error loading RSVPs:', err);
      setError('Failed to load RSVPs. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
    } catch (error) {
      console.error('Logout error:', error);
    }
    window.location.href = '/';
  };

  const stats = {
    total: rsvps.length,
    attending: rsvps.filter(r => r.attendance === 'yes').length,
    notAttending: rsvps.filter(r => r.attendance === 'no').length,
    totalGuests: rsvps.filter(r => r.attendance === 'yes').reduce((sum, r) => sum + r.guest_count, 0),
    withWallet: rsvps.filter(r => r.wallet_address).length
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-serif text-rose-800 mb-2">Wedding Dashboard</h1>
            <p className="text-gray-700">
              Welcome back, {adminUser.userType} 
            </p>
          </div>
          <div className="flex gap-4">
            <Link 
              href="/" 
              className="text-rose-600 hover:text-rose-800 font-medium"
            >
              ← Wedding Site
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <Users className="h-8 w-8 text-rose-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-800">{stats.total}</div>
            <div className="text-sm text-gray-600">Total RSVPs</div>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <Heart className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-800">{stats.attending}</div>
            <div className="text-sm text-gray-600">Attending</div>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <Users className="h-8 w-8 text-red-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-800">{stats.notAttending}</div>
            <div className="text-sm text-gray-600">Not Attending</div>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <Calendar className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-800">{stats.totalGuests}</div>
            <div className="text-sm text-gray-600">Total Guests</div>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <Mail className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-800">{stats.withWallet}</div>
            <div className="text-sm text-gray-600">With Wallet</div>
          </div>
        </div>

        {/* RSVP List */}
        <div className="bg-white rounded-lg shadow-lg">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold text-gray-800">RSVP Responses</h2>
              <button
                onClick={loadRSVPs}
                disabled={isLoading}
                className="flex items-center gap-2 bg-rose-600 hover:bg-rose-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>

          <div className="p-6">
            {isLoading ? (
              <div className="text-center py-8">
                <p className="text-gray-600">Loading RSVPs...</p>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <p className="text-red-600">{error}</p>
              </div>
            ) : rsvps.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600">No RSVPs yet. Share your wedding website to start collecting responses!</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full table-auto">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Name</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Email</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Attending</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Guests</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Dietary</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Message</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Wallet</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rsvps.map((rsvp) => (
                      <tr key={rsvp.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4">{rsvp.guest_name}</td>
                        <td className="py-3 px-4 text-sm text-gray-600">{rsvp.email}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            rsvp.attendance === 'yes' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {rsvp.attendance === 'yes' ? 'Yes' : 'No'}
                          </span>
                        </td>
                        <td className="py-3 px-4">{rsvp.guest_count}</td>
                        <td className="py-3 px-4 text-sm">
                          {rsvp.dietary_restrictions || '-'}
                        </td>
                        <td className="py-3 px-4 text-sm max-w-xs truncate">
                          {rsvp.special_message || '-'}
                        </td>
                        <td className="py-3 px-4 text-xs">
                          {rsvp.wallet_address ? (
                            <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded">
                              {rsvp.wallet_address.slice(0, 6)}...{rsvp.wallet_address.slice(-4)}
                            </span>
                          ) : '-'}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-500">
                          {new Date(rsvp.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
