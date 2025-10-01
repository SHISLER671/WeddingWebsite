"use client"

import { useState } from "react"
import { useAccount } from "wagmi"
import { useLoginWithAbstract } from "@abstract-foundation/agw-react"
import { Menu, X, User, Wallet, LogOut } from "lucide-react"

export default function ProfileMenu() {
  const [isOpen, setIsOpen] = useState(false)
  const { address, status, isConnected } = useAccount()
  const { login, logout } = useLoginWithAbstract()

  const handleConnect = async () => {
    try {
      await login()
      setIsOpen(false)
    } catch (error) {
      console.error("Failed to connect wallet:", error)
    }
  }

  const handleDisconnect = async () => {
    try {
      await logout()
      setIsOpen(false)
    } catch (error) {
      console.error("Failed to disconnect wallet:", error)
    }
  }

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "connected":
        return "text-green-600"
      case "connecting":
        return "text-yellow-600"
      default:
        return "text-gray-600"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "connected":
        return "Connected"
      case "connecting":
        return "Connecting..."
      default:
        return "Disconnected"
    }
  }

  return (
    <div className="relative">
      {/* Hamburger Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-rose-gold hover:bg-white hover:bg-opacity-20 rounded-full transition-colors duration-200"
        aria-label="Profile Menu"
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
          <div className="p-4">
            {/* Header */}
            <div className="flex items-center gap-2 pb-3 border-b border-gray-200">
              <User className="h-5 w-5 text-gray-600" />
              <span className="font-semibold text-gray-800">Wallet Profile</span>
            </div>

            {/* Wallet Status */}
            <div className="py-3 border-b border-gray-200">
              <div className="flex items-center gap-2 mb-2">
                <Wallet className="h-4 w-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">Status:</span>
                <span className={`text-sm font-semibold ${getStatusColor(status)}`}>{getStatusText(status)}</span>
              </div>

              {/* Wallet Address */}
              {isConnected && address && (
                <div className="bg-gray-50 rounded-md p-2 mt-2">
                  <div className="text-xs text-gray-500 mb-1">Wallet Address:</div>
                  <div className="text-sm font-mono text-gray-800 break-all">{formatAddress(address)}</div>
                </div>
              )}

              {status === "connecting" && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-2 mt-2">
                  <div className="text-sm text-yellow-800">Please check your wallet for connection approval...</div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="pt-3">
              {!isConnected ? (
                <button
                  onClick={handleConnect}
                  disabled={status === "connecting"}
                  className="w-full bg-rose-600 hover:bg-rose-700 disabled:bg-gray-400 text-white py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
                >
                  <Wallet className="h-4 w-4 text-white" />
                  {status === "connecting" ? "Connecting..." : "Connect Wallet"}
                </button>
              ) : (
                <button
                  onClick={handleDisconnect}
                  className="w-full bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
                >
                  <LogOut className="h-4 w-4 text-white" />
                  Disconnect Wallet
                </button>
              )}
            </div>

            {/* Info */}
            <div className="mt-3 pt-3 border-t border-gray-200">
              <div className="text-xs text-gray-500 text-center">Powered by Abstract Global Wallet</div>
            </div>
          </div>
        </div>
      )}

      {/* Backdrop to close menu when clicking outside */}
      {isOpen && <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />}
    </div>
  )
}
