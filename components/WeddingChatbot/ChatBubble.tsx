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

  return (
    <button
      onClick={handleClick}
      className={getThemeClasses()}
      style={bubbleStyles}
      aria-label={state.isOpen ? 'Close chat' : 'Open wedding assistant'}
      aria-expanded={state.isOpen}
      aria-haspopup="dialog"
      onMouseEnter={(e) => {
        if (!state.isOpen) {
          e.currentTarget.style.backgroundColor = hoverStyles.backgroundColor || '';
        }
      }}
      onMouseLeave={(e) => {
        if (!state.isOpen) {
          e.currentTarget.style.backgroundColor = bubbleStyles.backgroundColor || '';
        }
      }}
    >
      {/* Icon */}
      <div className="relative">
        {state.isOpen ? (
          <X className="w-8 h-8" strokeWidth={2.5} />
        ) : (
          <Heart className="w-8 h-8" strokeWidth={2.5} />
        )}
        
        {/* Unread message indicator */}
        {state.unreadCount > 0 && !state.isOpen && (
          <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center animate-bounce">
            {state.unreadCount > 9 ? '9+' : state.unreadCount}
          </div>
        )}

        {/* Loading indicator */}
        {state.isLoading && (
          <div className="absolute inset-0 rounded-full bg-black bg-opacity-20 flex items-center justify-center">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>

      {/* Tooltip */}
      {!state.isOpen && (
        <div className="absolute bottom-full right-0 mb-3 px-3 py-2 bg-gray-800 text-white text-sm rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
          {state.unreadCount > 0 
            ? `${state.unreadCount} new message${state.unreadCount > 1 ? 's' : ''}`
            : 'Chat with Wedding Assistant'
          }
          <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
        </div>
      )}

      {/* Pulsing ring effect */}
      {isPulsing && !state.isOpen && (
        <div className="absolute inset-0 rounded-full border-2 border-current animate-ping opacity-30"></div>
      )}

      {/* Accessibility announcement */}
      <div className="sr-only" aria-live="polite" aria-atomic>
        {state.unreadCount > 0 && !state.isOpen && `You have ${state.unreadCount} new message${state.unreadCount > 1 ? 's' : ''} from the wedding assistant.`}
      </div>
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
