// Chat Context for Wedding Website Chatbot
// Manages chat state and provides chat functionality to components

'use client';

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { getOpenRouterClient, OpenRouterMessage } from '@/lib/openrouter';
import { getChatbotConfig, formatTimestamp, ERROR_MESSAGES } from '@/lib/chatbot-config';
import { handleRSVPStatusRequest } from '@/lib/rsvp-lookup';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isLoading?: boolean;
}

export interface ChatState {
  isOpen: boolean;
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  unreadCount: number;
}

export interface ChatContextType {
  state: ChatState;
  actions: {
    toggleChat: () => void;
    openChat: () => void;
    closeChat: () => void;
    sendMessage: (message: string) => Promise<void>;
    clearMessages: () => void;
    markAsRead: () => void;
    resetError: () => void;
  };
}

type ChatAction =
  | { type: 'TOGGLE_CHAT' }
  | { type: 'OPEN_CHAT' }
  | { type: 'CLOSE_CHAT' }
  | { type: 'SEND_MESSAGE_START'; payload: string }
  | { type: 'SEND_MESSAGE_SUCCESS'; payload: { id: string; content: string } }
  | { type: 'SEND_MESSAGE_ERROR'; payload: string }
  | { type: 'CLEAR_MESSAGES' }
  | { type: 'MARK_AS_READ' }
  | { type: 'RESET_ERROR' }
  | { type: 'SET_LOADING'; payload: boolean };

const initialState: ChatState = {
  isOpen: false,
  messages: [],
  isLoading: false,
  error: null,
  unreadCount: 0,
};

function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case 'TOGGLE_CHAT':
      return { ...state, isOpen: !state.isOpen };
    
    case 'OPEN_CHAT':
      return { ...state, isOpen: true, unreadCount: 0 };
    
    case 'CLOSE_CHAT':
      return { ...state, isOpen: false };
    
    case 'SEND_MESSAGE_START':
      const newMessage: ChatMessage = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: action.payload,
        timestamp: new Date(),
      };
      
      const loadingMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: '',
        timestamp: new Date(),
        isLoading: true,
      };
      
      return {
        ...state,
        messages: [...state.messages, newMessage, loadingMessage],
        isLoading: true,
        error: null,
      };
    
    case 'SEND_MESSAGE_SUCCESS':
      return {
        ...state,
        messages: state.messages.map(msg => 
          msg.id.includes('assistant') && msg.isLoading
            ? { ...msg, content: action.payload.content, isLoading: false }
            : msg
        ),
        isLoading: false,
        unreadCount: state.isOpen ? 0 : state.unreadCount + 1,
      };
    
    case 'SEND_MESSAGE_ERROR':
      return {
        ...state,
        messages: state.messages.filter(msg => !msg.isLoading),
        isLoading: false,
        error: action.payload,
      };
    
    case 'CLEAR_MESSAGES':
      return { ...state, messages: [], error: null };
    
    case 'MARK_AS_READ':
      return { ...state, unreadCount: 0 };
    
    case 'RESET_ERROR':
      return { ...state, error: null };
    
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    default:
      return state;
  }
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

interface ChatProviderProps {
  children: ReactNode;
}

export function ChatProvider({ children }: ChatProviderProps) {
  const [state, dispatch] = useReducer(chatReducer, initialState);

  // Generate a unique ID for messages
  const generateMessageId = () => `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // Chat actions
  const actions = {
    toggleChat: () => dispatch({ type: 'TOGGLE_CHAT' }),
    openChat: () => dispatch({ type: 'OPEN_CHAT' }),
    closeChat: () => dispatch({ type: 'CLOSE_CHAT' }),
    
    sendMessage: async (message: string) => {
      if (!message.trim()) return;
      
      console.log('💬 [ChatContext] === New Message ===');
      console.log('💬 [ChatContext] Message:', message);
      console.log('💬 [ChatContext] Current messages count:', state.messages.length);
      
      try {
        dispatch({ type: 'SEND_MESSAGE_START', payload: message });
        
        const config = getChatbotConfig();
        const lowerMessage = message.toLowerCase();
        
        console.log('💬 [ChatContext] Chatbot config loaded:', config.name);
        console.log('💬 [ChatContext] Message analysis:', {
          isRSVPRequest: lowerMessage.includes('rsvp'),
          isCheckRequest: lowerMessage.includes('check'),
          isStatusRequest: lowerMessage.includes('status'),
          isConfirmRequest: lowerMessage.includes('confirm'),
          isRegisteredRequest: lowerMessage.includes('registered'),
          isSignedUpRequest: lowerMessage.includes('signed up'),
        });
        
        // Check if this is an RSVP status request
        const isRSVPRequest = lowerMessage.includes('rsvp') || 
                             lowerMessage.includes('check') || 
                             lowerMessage.includes('status') ||
                             lowerMessage.includes('confirm') ||
                             lowerMessage.includes('registered') ||
                             lowerMessage.includes('signed up');
        
        if (isRSVPRequest) {
          console.log('💬 [ChatContext] 🎯 Detected RSVP request, attempting database lookup...');
          try {
            // Handle RSVP status check
            const rsvpResponse = await handleRSVPStatusRequest(message);
            console.log('💬 [ChatContext] ✅ RSVP lookup successful');
            console.log('💬 [ChatContext] Response preview:', rsvpResponse.substring(0, 100) + '...');
            
            dispatch({
              type: 'SEND_MESSAGE_SUCCESS',
              payload: {
                id: generateMessageId(),
                content: rsvpResponse,
              },
            });
            return;
          } catch (rsvpError) {
            console.error('💬 [ChatContext] ❌ RSVP lookup failed:', rsvpError);
            console.log('💬 [ChatContext] Falling back to AI response...');
            // Fall back to AI response if RSVP lookup fails
          }
        }
        
        // Regular AI response
        console.log('💬 [ChatContext] 🤖 Starting AI response generation...');
        const client = getOpenRouterClient();
        
        // Prepare conversation history for OpenRouter
        const openRouterMessages: OpenRouterMessage[] = [
          {
            role: 'system',
            content: config.systemPrompt,
          },
          ...state.messages
            .filter(msg => !msg.isLoading && msg.role !== 'system')
            .map(msg => ({
              role: msg.role,
              content: msg.content,
            }))
            .slice(-10), // Keep last 10 messages for context
          {
            role: 'user',
            content: message,
          },
        ];
        
        console.log('💬 [ChatContext] 📋 Prepared messages for OpenRouter:', {
          totalMessages: openRouterMessages.length,
          systemPromptLength: openRouterMessages[0]?.content?.length || 0,
          historyMessages: openRouterMessages.length - 2,
          currentMessageLength: message.length,
        });
        
        // Send to OpenRouter
        console.log('💬 [ChatContext] 🚀 Sending to OpenRouter API...');
        const response = await client.chatCompletion(openRouterMessages, {
          temperature: 0.7,
          maxTokens: 1000,
        });
        
        console.log('💬 [ChatContext] ✅ OpenRouter response received');
        console.log('💬 [ChatContext] Response ID:', response.id);
        console.log('💬 [ChatContext] Model used:', response.model);
        console.log('💬 [ChatContext] Usage tokens:', response.usage);
        
        const assistantMessage = response.choices[0]?.message?.content || 
          "I apologize, but I'm having trouble responding right now. Please try again.";
        
        console.log('💬 [ChatContext] 📝 Assistant message length:', assistantMessage.length);
        console.log('💬 [ChatContext] Assistant message preview:', assistantMessage.substring(0, 100) + '...');
        
        dispatch({
          type: 'SEND_MESSAGE_SUCCESS',
          payload: {
            id: generateMessageId(),
            content: assistantMessage,
          },
        });
        
        console.log('💬 [ChatContext] ✅ Message successfully dispatched to UI');
        
      } catch (error) {
        console.error('💬 [ChatContext] ❌ Message processing failed:');
        console.error('💬 [ChatContext] Error:', error);
        console.error('💬 [ChatContext] Error type:', typeof error);
        console.error('💬 [ChatContext] Error message:', error instanceof Error ? error.message : 'Unknown error');
        console.error('💬 [ChatContext] Error stack:', error instanceof Error ? error.stack : 'No stack trace');
        
        let errorMessage = ERROR_MESSAGES.API_ERROR;
        
        if (error instanceof Error) {
          console.log('💬 [ChatContext] Analyzing error for user-friendly message...');
          if (error.message.includes('network') || error.message.includes('fetch')) {
            errorMessage = ERROR_MESSAGES.NETWORK_ERROR;
            console.log('💬 [ChatContext] → Network error detected');
          } else if (error.message.includes('rate limit') || error.message.includes('429')) {
            errorMessage = ERROR_MESSAGES.RATE_LIMIT;
            console.log('💬 [ChatContext] → Rate limit error detected');
          } else if (error.message.includes('timeout')) {
            errorMessage = ERROR_MESSAGES.TIMEOUT;
            console.log('💬 [ChatContext] → Timeout error detected');
          } else if (error.message.includes('API key') || error.message.includes('Unauthorized')) {
            errorMessage = 'API configuration error. Please check the service configuration.';
            console.log('💬 [ChatContext] → API key error detected');
          } else {
            console.log('💬 [ChatContext] → Generic API error, using default message');
          }
        }
        
        console.log('💬 [ChatContext] 📢 Dispatching error to UI:', errorMessage);
        dispatch({ type: 'SEND_MESSAGE_ERROR', payload: errorMessage });
      }
    },
    
    clearMessages: () => dispatch({ type: 'CLEAR_MESSAGES' }),
    markAsRead: () => dispatch({ type: 'MARK_AS_READ' }),
    resetError: () => dispatch({ type: 'RESET_ERROR' }),
  };

  // Add welcome message when chat is first opened
  useEffect(() => {
    if (state.isOpen && state.messages.length === 0) {
      const config = getChatbotConfig();
      const welcomeMessage: ChatMessage = {
        id: generateMessageId(),
        role: 'assistant',
        content: config.welcomeMessage,
        timestamp: new Date(),
      };
      
      // Small delay to make it feel natural
      const timer = setTimeout(() => {
        dispatch({
          type: 'SEND_MESSAGE_SUCCESS',
          payload: {
            id: welcomeMessage.id,
            content: welcomeMessage.content,
          },
        });
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [state.isOpen, state.messages.length]);

  // Auto-dismiss errors after 5 seconds
  useEffect(() => {
    if (state.error) {
      const timer = setTimeout(() => {
        actions.resetError();
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [state.error]);

  const contextValue: ChatContextType = {
    state,
    actions,
  };

  return (
    <ChatContext.Provider value={contextValue}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat(): ChatContextType {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}

// Custom hooks for specific chat functionality
export function useChatState() {
  const { state } = useChat();
  return state;
}

export function useChatActions() {
  const { actions } = useChat();
  return actions;
}

export function useChatMessage(id: string) {
  const { state } = useChat();
  return state.messages.find(msg => msg.id === id);
}

// Hook for managing quick actions
export function useQuickActions() {
  const { actions } = useChat();
  const config = getChatbotConfig();
  
  const handleQuickAction = (action: string) => {
    actions.sendMessage(action);
  };
  
  return {
    quickActions: config.quickActions,
    handleQuickAction,
  };
}

// Hook for managing suggested questions
export function useSuggestedQuestions() {
  const { actions } = useChat();
  const config = getChatbotConfig();
  
  const handleSuggestedQuestion = (question: string) => {
    actions.sendMessage(question);
  };
  
  return {
    suggestedQuestions: config.suggestedQuestions,
    handleSuggestedQuestion,
  };
}