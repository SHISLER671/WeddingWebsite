"use client"
import Link from "next/link"
import { Calendar, MapPin, Clock, Gift, Edit, Sparkles, Heart, Flower2 } from "lucide-react"
import WeddingChatbot from "../../components/WeddingChatbot/WeddingChatbot"
import { useChat } from '../../contexts/ChatContext';
import { useAccount } from 'wagmi';
import { useLoginWithAbstract } from '@abstract-foundation/agw-react';

export default function ConfirmationPage() {
  return (
    <div className="min-h-screen bg-warm-white">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-soft-blush to-rose-gold/20"></div>
        <div className="relative z-10 px-4 py-16">
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-start mb-8">
              <Link
                href="/rsvp?edit=true"
                className="bg-charcoal hover:bg-charcoal/90 text-warm-white px-6 py-3 text-sm font-medium rounded-full transition-all duration-300 shadow-lg flex items-center gap-2"
              >
                <Edit className="w-4 h-4" />
                Edit RSVP
              </Link>
              <Link href="/" className="text-charcoal/70 hover:text-charcoal font-medium transition-colors">
                ← Home
              </Link>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center gap-3 mb-6">
                <Sparkles className="w-8 h-8 text-rose-gold" />
                <h1 className="text-4xl md:text-6xl font-light text-charcoal tracking-wide">Thank You</h1>
                <Sparkles className="w-8 h-8 text-rose-gold" />
              </div>
              <p className="text-xl md:text-2xl text-charcoal/80 font-light mb-4">for your time to RSVP</p>
              <p className="text-lg text-rose-gold font-medium">We appreciate your love</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 pb-16">
        <div className="grid gap-8">
          {/* Date & Time Card */}
          <div className="bg-warm-white rounded-2xl shadow-lg border border-soft-blush p-8 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-rose-gold/20 rounded-full flex items-center justify-center">
                <Calendar className="h-6 w-6 text-rose-gold" />
              </div>
              <h2 className="text-2xl font-light text-charcoal">Date & Time</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium text-charcoal/80 mb-2">Wedding Date</h3>
                <p className="text-lg text-charcoal">Thursday, February 13, 2026</p>
              </div>
              <div>
                <h3 className="font-medium text-charcoal/80 mb-2">Timeline</h3>
                <p className="text-lg text-charcoal">2:00 PM - 10:00 PM</p>
              </div>
            </div>
          </div>

          {/* Location Card */}
          <div className="bg-warm-white rounded-2xl shadow-lg border border-soft-blush p-8 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-rose-gold/20 rounded-full flex items-center justify-center">
                <MapPin className="h-6 w-6 text-rose-gold" />
              </div>
              <h2 className="text-2xl font-light text-charcoal">Venues</h2>
            </div>
            <div className="space-y-6">
              <div className="p-4 bg-soft-blush/50 rounded-xl">
                <h3 className="font-medium text-charcoal mb-2">Ceremony</h3>
                <p className="text-lg text-charcoal">Dulce Nombre de Maria Cathedral-Basilica</p>
                <p className="text-charcoal/70">Hagåtña, Guam • 2:00 PM</p>
              </div>
              <div className="p-4 bg-soft-blush/50 rounded-xl">
                <h3 className="font-medium text-charcoal mb-2">Reception</h3>
                <p className="text-lg text-charcoal">Hotel Nikko Guam Tusi Ballroom</p>
                <p className="text-charcoal/70">Tumon, Guam • 6:00 PM</p>
              </div>
            </div>
          </div>

          {/* Schedule Card */}
          <div className="bg-warm-white rounded-2xl shadow-lg border border-soft-blush p-8 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-rose-gold/20 rounded-full flex items-center justify-center">
                <Clock className="h-6 w-6 text-rose-gold" />
              </div>
              <h2 className="text-2xl font-light text-charcoal">Schedule</h2>
            </div>
            <div className="space-y-4">
              {[
                { time: "2:00 PM", event: "Mass at Cathedral-Basilica" },
                { time: "4:00 PM", event: "Photos & Travel" },
                { time: "6:00 PM", event: "Reception Begins" },
                { time: "8:00 PM", event: "Dancing & Celebration" },
              ].map((item, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 p-3 rounded-lg hover:bg-soft-blush/30 transition-colors"
                >
                  <div className="w-20 text-rose-gold font-medium">{item.time}</div>
                  <div className="flex-1 text-charcoal">{item.event}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Important Info Card */}
          <div className="bg-warm-white rounded-2xl shadow-lg border border-soft-blush p-8 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-rose-gold/20 rounded-full flex items-center justify-center">
                <Gift className="h-6 w-6 text-rose-gold" />
              </div>
              <h2 className="text-2xl font-light text-charcoal">Details</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium text-charcoal mb-2">Dress Code</h3>
                <p className="text-charcoal/80">Formal Attire</p>
                <p className="text-sm text-charcoal/60 mt-1">Elegant and dressy</p>
              </div>
              <div>
                <h3 className="font-medium text-charcoal mb-2">RSVP Deadline</h3>
                <p className="text-charcoal/80">January 10, 2026</p>
              </div>
            </div>
          </div>
        </div>

        {/* New Interactive Section */}
        <section className="max-w-4xl mx-auto mt-16 mb-16">
          <div className="bg-warm-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-jewel-fuchsia/20 p-8">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-serif text-jewel-burgundy mb-4">Connect & Chat</h3>
              <p className="text-charcoal/80 leading-relaxed">
                Thank you for taking the time to be a part of our special occasion! Please feel free to spark up a chat with Sophia the AI wedding agent assistant, and you may also click the flower button to connect your wallet, just resubmit the rsvp form again after to save you wallet for a future surprise from the couple!
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              {/* Chatbot Button */}
              <ChatbotButton />
              
              {/* AGW Wallet Button */}
              <AGWWalletButton />
            </div>
          </div>
        </section>
      </div>

      {/* Wedding Chatbot - Only accessible from confirmation page */}
      <WeddingChatbot />
    </div>
  )
}

// Chatbot Button Component
function ChatbotButton() {
  const { actions } = useChat();
  
  const handleChatbotClick = () => {
    actions.openChat();
  };

  return (
    <button 
      onClick={handleChatbotClick}
      className="flex flex-col items-center gap-3 p-6 bg-gradient-to-br from-jewel-crimson to-jewel-burgundy hover:from-jewel-burgundy hover:to-jewel-crimson text-warm-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 min-w-[200px]"
    >
      <Heart className="w-8 h-8 text-warm-white" />
      <span className="font-semibold text-lg">Chat with Sofia</span>
      <span className="text-sm opacity-90 text-center">AI Wedding Assistant</span>
    </button>
  );
}

// AGW Wallet Button Component
function AGWWalletButton() {
  const { address, status, isConnected } = useAccount();
  const { login, logout } = useLoginWithAbstract();

  const handleConnect = async () => {
    try {
      await login();
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    }
  };

  const handleDisconnect = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Failed to disconnect wallet:', error);
    }
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <div className="flex flex-col items-center gap-3 min-w-[200px]">
      <button 
        onClick={isConnected ? handleDisconnect : handleConnect}
        disabled={status === 'connecting'}
        className="flex flex-col items-center gap-3 p-6 bg-gradient-to-br from-jewel-sapphire to-jewel-emerald hover:from-jewel-emerald hover:to-jewel-sapphire disabled:from-gray-400 disabled:to-gray-500 text-warm-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 w-full"
      >
        <Flower2 className="w-8 h-8 text-warm-white" />
        <span className="font-semibold text-lg">
          {status === 'connecting' ? 'Connecting...' : isConnected ? 'Disconnect' : 'Connect Wallet'}
        </span>
        <span className="text-sm opacity-90 text-center">Abstract Global Wallet</span>
      </button>
      
      {isConnected && address && (
        <div className="bg-warm-white/80 backdrop-blur-sm rounded-lg p-3 shadow-sm w-full">
          <div className="text-xs text-charcoal/60 mb-1">Connected:</div>
          <div className="text-sm font-mono text-charcoal break-all">
            {formatAddress(address)}
          </div>
        </div>
      )}
    </div>
  );
}
