"use client";
import React, { useState } from "react";
import Link from "next/link";
import { Mail, Lock, User, Eye, EyeOff } from "lucide-react";

export default function AdminLoginPage() {
  const [userType, setUserType] = useState(''); // Replaced email with userType
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userType, password }) // Updated to use userType
      });
      const result = await response.json();
      if (response.ok && result.success) {
        // Store admin session data
        localStorage.setItem('adminUser', JSON.stringify(result.user));
        // Redirect to admin dashboard
        window.location.href = '/admin/dashboard';
      } else {
        setError(result.error || 'Invalid user type or password');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-100 flex items-center justify-center">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link
            href="/"
            className="text-rose-600 hover:text-rose-800 font-medium mb-4 inline-block"
          >
            ← Back to Wedding
          </Link>
          <h1 className="text-3xl font-serif text-rose-800 mb-2">Admin Access</h1>
          <p className="text-gray-600">Wedding Management Dashboard</p>
        </div>
        {/* Login Form */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex items-center justify-center mb-6">
            <div className="bg-rose-100 p-3 rounded-full">
              <User className="h-6 w-6 text-rose-600" />
            </div>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* User Type */}
            <div>
              <label htmlFor="userType" className="block text-sm font-semibold text-gray-700 mb-2">
                User Type
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <select
                  id="userType"
                  value={userType}
                  onChange={(e) => setUserType(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-colors"
                >
                  <option value="">Select User Type</option>
                  <option value="BRIDE">BRIDE</option>
                  <option value="GROOM">GROOM</option>
                  <option value="PLANNER">PLANNER</option>
                </select>
              </div>
            </div>
            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-colors"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
            </div>
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}
            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-rose-600 hover:bg-rose-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-3 px-4 rounded-lg font-semibold transition-colors duration-200 shadow-lg"
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>
          {/* Admin Info */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="text-center">
              <p className="text-xs text-gray-500 mb-2">
                Admin access for wedding organizers
              </p>
              <div className="text-xs text-gray-400">
                👰 Bride • 🤵 Groom • 💼 Wedding Planner
              </div>
              <div className="text-xs text-gray-500 mt-2">
                Demo: bride@wedding2026.com / BRIDESTAYIRIE
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
