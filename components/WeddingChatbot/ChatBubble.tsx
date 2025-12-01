// Chat Bubble Component for Wedding Website
// Floating chat trigger button with wedding-themed design

'use client';

import React, { useEffect, useState } from 'react';
import { Heart, MessageCircle, X } from 'lucide-react';
import { useChat } from '@/contexts/ChatContext';
import { getChatbotConfig } from '@/lib/chatbot-config';

interface ChatBubbleProps {
  className?: string;
}

export default function ChatBubble({ className = '' }: ChatBubbleProps) {
  const { state, actions } = useChat();
  const [isPulsing, setIsPulsing] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const config = getChatbotConfig();

  // Trigger pulsing when there are unread messages
  useEffect(() => {
    if (state.unreadCount > 0 && !state.isOpen) {
      setIsPulsing(true);
      const timer = setTimeout(() => setIsPulsing(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [state.unreadCount, state.isOpen]);

  // Fade in animation on mount
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleClick = () => {
    actions.toggleChat();
    if (state.unreadCount > 0) {
      actions.markAsRead();
    }
  };

  const getPositionClasses = () => {
    switch (config.appearance.position) {
      case 'bottom-left':
        return 'bottom-6 left-6';
      case 'top-right':
        return 'top-24 right-6'; // Account for existing profile menu
      case 'top-left':
        return 'top-24 left-6';
      case 'bottom-right':
      default:
        return 'bottom-6 right-6';
    }
  };

  const getThemeClasses = () => {
    const baseClasses = `
      relative z-50 w-16 h-16 rounded-full shadow-lg 
      transition-all duration-300 ease-in-out transform
      hover:scale-110 active:scale-95
      flex items-center justify-center
      backdrop-blur-sm border-2
      ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
    `;

    const themeClasses = config.appearance.theme === 'dark' 
      ? `bg-gray-800 border-gray-600 text-white hover:bg-gray-700`
      : `bg-white border-${config.appearance.primaryColor} text-${config.appearance.primaryColor} hover:bg-${config.appearance.secondaryColor}`;

    const pulsingClasses = isPulsing ? 'animate-pulse' : '';
    const shadowClasses = state.isOpen ? 'shadow-xl' : 'shadow-lg';

    return `${baseClasses} ${themeClasses} ${pulsingClasses} ${shadowClasses} ${className}`;
  };

  // Custom styles for dynamic colors
  const bubbleStyles: React.CSSProperties = {
    backgroundColor: config.appearance.theme === 'dark' ? '#1f2937' : '#ffffff',
    borderColor: config.appearance.primaryColor,
    color: config.appearance.primaryColor,
  };

  const hoverStyles: React.CSSProperties = {
    backgroundColor: config.appearance.theme === 'dark' ? '#374151' : config.appearance.secondaryColor,
  };

  // Compact button for top-left placement next to hamburger menu
  // Hamburger is at left-4 (16px) with w-12 h-12 (48px) = ends at ~64px
  // Chat button positioned at left-20 (80px) on desktop, left-[72px] (72px) on mobile
  // Minimum 44x44px touch target for mobile accessibility
  return (
    <button
      onClick={handleClick}
      className={`
        fixed top-4 left-[72px] sm:left-20 z-[45]
        w-11 h-11 sm:w-12 sm:h-12 rounded-full shadow-lg
        flex items-center justify-center
        transition-all duration-300 ease-in-out
        hover:scale-110 active:scale-95
        touch-manipulation
        backdrop-blur-sm border-2
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
        ${state.isOpen 
          ? 'bg-jewel-crimson/90 border-jewel-gold/50 text-warm-white shadow-xl' 
          : 'bg-jewel-burgundy/90 border-jewel-gold/30 text-warm-white hover:bg-jewel-crimson/90 hover:border-jewel-gold/50 active:bg-jewel-crimson/90'
        }
        ${pulsingClasses}
      `}
      style={{
        // Ensure safe area on notched devices
        top: 'max(1rem, env(safe-area-inset-top, 1rem))',
      }}
      aria-label={state.isOpen ? 'Close wedding assistant chat' : 'Open wedding assistant chat'}
      title={state.isOpen ? 'Close chat' : 'Ask Ezekiel, your wedding assistant'}
    >
      {state.isOpen ? (
        <X className="w-5 h-5 sm:w-5 sm:h-5" />
      ) : (
        <MessageCircle className="w-5 h-5 sm:w-5 sm:h-5" />
      )}
      {state.unreadCount > 0 && !state.isOpen && (
        <div className="absolute -top-0.5 -right-0.5 bg-jewel-gold text-jewel-burgundy font-bold rounded-full w-5 h-5 flex items-center justify-center border-2 border-jewel-burgundy text-[11px] leading-none">
          {state.unreadCount > 9 ? '9+' : state.unreadCount}
        </div>
      )}
    </button>
  );
}

// Alternative minimal version for mobile
interface MinimalChatBubbleProps {
  onClick: () => void;
  isOpen: boolean;
  unreadCount: number;
}

export function MinimalChatBubble({ onClick, isOpen, unreadCount }: MinimalChatBubbleProps) {
  const config = getChatbotConfig();

  return (
    <button
      onClick={onClick}
      className={`
        fixed z-50 w-12 h-12 rounded-full shadow-lg
        flex items-center justify-center
        transition-all duration-200
        hover:scale-105 active:scale-95
        ${config.appearance.theme === 'dark' ? 'bg-gray-800' : 'bg-white'}
        border-2
      `}
      style={{
        borderColor: config.appearance.primaryColor,
        color: config.appearance.primaryColor,
        bottom: '1.5rem',
        right: '1.5rem',
      }}
      aria-label={isOpen ? 'Close chat' : 'Open wedding assistant'}
    >
      {isOpen ? (
        <X className="w-6 h-6" />
      ) : (
        <Heart className="w-6 h-6" />
      )}
      
      {unreadCount > 0 && !isOpen && (
        <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
          {unreadCount > 9 ? '9+' : unreadCount}
        </div>
      )}
    </button>
  );
}
