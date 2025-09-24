// Main Wedding Chatbot Component
// Orchestrates all chatbot components and provides mobile responsiveness

'use client';

import React, { useState, useEffect } from 'react';
import { useChat } from '@/contexts/ChatContext';
import ChatBubble from './ChatBubble';
import ChatWindow from './ChatWindow';
import { MobileChatWindow } from './ChatWindow';

interface WeddingChatbotProps {
  className?: string;
}

export default function WeddingChatbot({ className = '' }: WeddingChatbotProps) {
  const { state, actions } = useChat();
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Initial check
    checkMobile();

    // Listen for window resize
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Handle mobile-specific interactions
  useEffect(() => {
    if (isMobile && state.isOpen) {
      // Prevent body scroll when chat is open on mobile
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobile, state.isOpen]);

  // Close chat when switching from mobile to desktop
  useEffect(() => {
    if (!isMobile && state.isOpen) {
      // Keep chat open on desktop
    }
  }, [isMobile, state.isOpen]);

  const handleMobileClose = () => {
    actions.closeChat();
  };

  return (
    <>
      {/* Chat Bubble - always visible */}
      <ChatBubble className={className} />

      {/* Desktop Chat Window */}
      {!isMobile && <ChatWindow />}

      {/* Mobile Chat Window */}
      {isMobile && (
        <MobileChatWindow 
          isOpen={state.isOpen} 
          onClose={handleMobileClose}
        />
      )}

      {/* Accessibility announcements */}
      <div className="sr-only" aria-live="polite" aria-atomic>
        {state.isOpen && 'Chat window opened'}
        {!state.isOpen && state.messages.length > 0 && 'Chat window closed'}
        {state.error && `Error: ${state.error}`}
      </div>

      {/* Global styles for chat animations */}
      <style jsx global>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.3s ease-out forwards;
        }

        /* Custom scrollbar for chat messages */
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #d4a574;
          border-radius: 3px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #b8935f;
        }

        /* Mobile-specific optimizations */
        @media (max-width: 768px) {
          .chat-window {
            border-radius: 0 !important;
            max-height: 100vh !important;
            height: 100vh !important;
          }
        }

        /* Prevent text selection in chat interface */
        .chat-no-select {
          -webkit-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          user-select: none;
        }

        /* Smooth transitions for chat elements */
        .chat-transition {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        /* Heart animation for wedding theme */
        @keyframes heart-pulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.1);
          }
        }

        .heart-pulse {
          animation: heart-pulse 2s ease-in-out infinite;
        }
      `}</style>
    </>
  );
}

// Export individual components for granular usage
export { ChatBubble, ChatWindow, MobileChatWindow };

// Types for component props
export interface WeddingChatbotConfig {
  enableMobile?: boolean;
  autoOpen?: boolean;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  theme?: 'light' | 'dark';
  showOnInit?: boolean;
}

// Default configuration
export const DEFAULT_CHATBOT_CONFIG: WeddingChatbotConfig = {
  enableMobile: true,
  autoOpen: false,
  position: 'bottom-right',
  theme: 'light',
  showOnInit: false,
};

// Hook for managing chatbot configuration
export function useWeddingChatbot(config: WeddingChatbotConfig = DEFAULT_CHATBOT_CONFIG) {
  const { state, actions } = useChat();

  useEffect(() => {
    if (config.showOnInit && !state.isOpen) {
      setTimeout(() => actions.openChat(), 1000);
    }
  }, [config.showOnInit, state.isOpen, actions]);

  useEffect(() => {
    if (config.autoOpen && state.messages.length === 0) {
      // Auto-open for first-time users
      const timer = setTimeout(() => actions.openChat(), 2000);
      return () => clearTimeout(timer);
    }
  }, [config.autoOpen, state.messages.length, actions]);

  return {
    state,
    actions,
    config: { ...DEFAULT_CHATBOT_CONFIG, ...config },
  };
}

// Enhanced version with analytics support
interface WeddingChatbotWithAnalyticsProps extends WeddingChatbotProps {
  onChatOpen?: () => void;
  onChatClose?: () => void;
  onMessageSent?: (message: string) => void;
  onMessageReceived?: (message: string) => void;
  onError?: (error: string) => void;
}

export function WeddingChatbotWithAnalytics({
  onChatOpen,
  onChatClose,
  onMessageSent,
  onMessageReceived,
  onError,
  className = '',
}: WeddingChatbotWithAnalyticsProps) {
  const { state, actions } = useChat();
  const [previousOpenState, setPreviousOpenState] = useState(state.isOpen);
  const [previousMessageCount, setPreviousMessageCount] = useState(state.messages.length);

  // Track chat open/close events
  useEffect(() => {
    if (state.isOpen !== previousOpenState) {
      if (state.isOpen) {
        onChatOpen?.();
      } else {
        onChatClose?.();
      }
      setPreviousOpenState(state.isOpen);
    }
  }, [state.isOpen, previousOpenState, onChatOpen, onChatClose]);

  // Track message events
  useEffect(() => {
    const currentMessageCount = state.messages.length;
    if (currentMessageCount > previousMessageCount) {
      const latestMessage = state.messages[currentMessageCount - 1];
      if (latestMessage) {
        if (latestMessage.role === 'user') {
          onMessageSent?.(latestMessage.content);
        } else {
          onMessageReceived?.(latestMessage.content);
        }
      }
    }
    setPreviousMessageCount(currentMessageCount);
  }, [state.messages, previousMessageCount, onMessageSent, onMessageReceived]);

  // Track error events
  useEffect(() => {
    if (state.error) {
      onError?.(state.error);
    }
  }, [state.error, onError]);

  return <WeddingChatbot className={className} />;
}