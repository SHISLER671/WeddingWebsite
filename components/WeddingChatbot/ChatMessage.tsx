// Chat Message Component for Wedding Website
// Individual message display with typing indicators and animations

'use client';

import React from 'react';
import { Heart, User, Bot } from 'lucide-react';
import { ChatMessage } from '@/contexts/ChatContext';
import { formatTimestamp } from '@/lib/chatbot-config';

interface ChatMessageProps {
  message: ChatMessage;
  isLatest?: boolean;
}

export default function ChatMessageComponent({ message, isLatest = false }: ChatMessageProps) {
  const isUser = message.role === 'user';
  const isAssistant = message.role === 'assistant';

  const getMessageClasses = () => {
    const baseClasses = `
      flex gap-3 items-start max-w-[80%]
      ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}
      animate-fade-in
    `;

    return baseClasses;
  };

  const getBubbleClasses = () => {
    const baseClasses = `
      relative px-4 py-3 rounded-2xl shadow-sm backdrop-blur-sm
      transition-all duration-200 ease-in-out
      ${isUser 
        ? 'bg-jewel-crimson/80 text-warm-white rounded-br-none' 
        : 'bg-warm-white/80 text-charcoal rounded-bl-none border border-jewel-fuchsia/20'
      }
      ${message.isLoading ? 'opacity-70' : ''}
    `;

    return baseClasses;
  };

  const getAvatarClasses = () => {
    const baseClasses = `
      w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0
      ${isUser ? 'bg-jewel-crimson text-warm-white' : 'bg-jewel-emerald text-warm-white'}
    `;

    return baseClasses;
  };

  const formatContent = (content: string) => {
    // Simple formatting for URLs
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return content.split(urlRegex).map((part, index) => {
      if (part.match(urlRegex)) {
        return (
          <a
            key={index}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 underline"
          >
            {part}
          </a>
        );
      }
      return part.split('\n').map((line, lineIndex) => (
        <React.Fragment key={lineIndex}>
          {line}
          {lineIndex < part.split('\n').length - 1 && <br />}
        </React.Fragment>
      ));
    });
  };

  return (
    <div className={getMessageClasses()}>
      {/* Avatar */}
      <div className={getAvatarClasses()}>
        {isUser ? (
          <User className="w-5 h-5" strokeWidth={2} />
        ) : (
          <Heart className="w-5 h-5" strokeWidth={2} />
        )}
      </div>

      {/* Message Content */}
      <div className="flex flex-col gap-1">
        <div className={getBubbleClasses()}>
          {message.isLoading ? (
            <div className="flex items-center gap-2">
              <TypingIndicator />
              <span className="text-sm text-gray-500">Thinking...</span>
            </div>
          ) : (
            <div className="text-sm leading-relaxed whitespace-pre-wrap">
              {formatContent(message.content)}
            </div>
          )}
          
          {/* Timestamp */}
          <div className={`
            text-xs mt-2 opacity-70
            ${isUser ? 'text-warm-white/80' : 'text-charcoal/60'}
          `}>
            {formatTimestamp(message.timestamp)}
          </div>
        </div>

        {/* Message status indicators */}
        {isLatest && !message.isLoading && (
          <div className={`flex items-center gap-1 ${isUser ? 'justify-end' : 'justify-start'}`}>
            {isUser && (
              <div className="w-2 h-2 bg-jewel-crimson rounded-full"></div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Typing Indicator Component
export function TypingIndicator() {
  return (
    <div className="flex gap-1">
      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
    </div>
  );
}

// System Message Component
interface SystemMessageProps {
  content: string;
  timestamp: Date;
}

export function SystemMessage({ content, timestamp }: SystemMessageProps) {
  return (
    <div className="flex justify-center my-4">
      <div className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full">
        {content}
      </div>
    </div>
  );
}

// Error Message Component
interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
  return (
    <div className="flex justify-center my-4">
      <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg max-w-[80%]">
        <div className="flex items-center gap-2">
          <div className="text-red-500">⚠️</div>
          <div>
            <div className="font-medium">Something went wrong</div>
            <div className="text-xs opacity-80">{message}</div>
          </div>
          {onRetry && (
            <button
              onClick={onRetry}
              className="ml-2 text-red-600 hover:text-red-800 underline text-xs"
            >
              Retry
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// Date Separator Component
interface DateSeparatorProps {
  date: Date;
}

export function DateSeparator({ date }: DateSeparatorProps) {
  const formatDate = (date: Date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      });
    }
  };

  return (
    <div className="flex items-center gap-4 my-6">
      <div className="flex-1 h-px bg-gray-200"></div>
      <div className="text-xs text-gray-500 font-medium whitespace-nowrap">
        {formatDate(date)}
      </div>
      <div className="flex-1 h-px bg-gray-200"></div>
    </div>
  );
}