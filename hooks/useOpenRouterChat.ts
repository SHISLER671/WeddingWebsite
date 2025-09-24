// Custom hook for OpenRouter chat functionality
// Provides reusable chat logic for wedding website components

'use client';

import { useState, useCallback, useRef } from 'react';
import { getOpenRouterClient, OpenRouterMessage } from '@/lib/openrouter';
import { getChatbotConfig, ERROR_MESSAGES } from '@/lib/chatbot-config';

export interface UseOpenRouterChatOptions {
  maxRetries?: number;
  timeout?: number;
  enableStreaming?: boolean;
}

export interface ChatResponse {
  content: string;
  messageId: string;
  timestamp: Date;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface UseOpenRouterChatReturn {
  sendMessage: (message: string, context?: OpenRouterMessage[]) => Promise<ChatResponse>;
  sendStreamingMessage: (message: string, context?: OpenRouterMessage[]) => Promise<AsyncGenerator<string>>;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
  retryLastMessage: () => Promise<ChatResponse | null>;
  cancelRequest: () => void;
}

export function useOpenRouterChat(
  options: UseOpenRouterChatOptions = {}
): UseOpenRouterChatReturn {
  const {
    maxRetries = 3,
    timeout = 30000,
    enableStreaming = false,
  } = options;

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastMessage, setLastMessage] = useState<{ message: string; context?: OpenRouterMessage[] } | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const cancelRequest = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsLoading(false);
  }, []);

  const generateMessageId = () => `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const sendMessage = useCallback(async (
    message: string,
    context: OpenRouterMessage[] = []
  ): Promise<ChatResponse> => {
    if (!message.trim()) {
      throw new Error('Message cannot be empty');
    }

    setIsLoading(true);
    setError(null);
    setLastMessage({ message, context });

    try {
      const client = getOpenRouterClient();
      const config = getChatbotConfig();

      // Prepare messages with system prompt and context
      const messages: OpenRouterMessage[] = [
        {
          role: 'system',
          content: config.systemPrompt,
        },
        ...context,
        {
          role: 'user',
          content: message,
        },
      ];

      // Set up timeout
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout')), timeout);
      });

      // Make API call with retries
      let lastError: Error | null = null;
      
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          abortControllerRef.current = new AbortController();
          
          const response = await Promise.race([
            client.chatCompletion(messages, {
              temperature: 0.7,
              maxTokens: 24000,
            }),
            timeoutPromise,
          ]);

          const content = response.choices[0]?.message?.content || 
            "I apologize, but I'm having trouble responding right now.";

          return {
            content,
            messageId: generateMessageId(),
            timestamp: new Date(),
            usage: response.usage,
          };

        } catch (error) {
          lastError = error as Error;
          
          // Don't retry on certain errors
          if (error instanceof Error) {
            if (error.message.includes('API key') || 
                error.message.includes('Unauthorized') ||
                error.message.includes('authentication')) {
              break;
            }
          }
          
          // Wait before retry (exponential backoff)
          if (attempt < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt - 1)));
          }
        }
      }

      throw lastError || new Error('All retry attempts failed');

    } catch (error) {
      console.error('OpenRouter chat error:', error);
      
      let errorMessage = ERROR_MESSAGES.API_ERROR;
      
      if (error instanceof Error) {
        if (error.message.includes('network') || error.message.includes('fetch')) {
          errorMessage = ERROR_MESSAGES.NETWORK_ERROR;
        } else if (error.message.includes('rate limit') || error.message.includes('429')) {
          errorMessage = ERROR_MESSAGES.RATE_LIMIT;
        } else if (error.message.includes('timeout')) {
          errorMessage = ERROR_MESSAGES.TIMEOUT;
        } else if (error.message.includes('API key') || error.message.includes('Unauthorized')) {
          errorMessage = 'API configuration error. Please check your API key.';
        }
      }
      
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  }, [maxRetries, timeout]);

  const sendStreamingMessage = useCallback(async (
    message: string,
    context: OpenRouterMessage[] = []
  ): Promise<AsyncGenerator<string>> => {
    if (!message.trim()) {
      throw new Error('Message cannot be empty');
    }

    setIsLoading(true);
    setError(null);
    setLastMessage({ message, context });

    try {
      const client = getOpenRouterClient();
      const config = getChatbotConfig();

      const messages: OpenRouterMessage[] = [
        {
          role: 'system',
          content: config.systemPrompt,
        },
        ...context,
        {
          role: 'user',
          content: message,
        },
      ];

      abortControllerRef.current = new AbortController();
      
      const stream = client.streamChatCompletion(messages, {
        temperature: 0.7,
        maxTokens: 24000,
      });

      return stream;

    } catch (error) {
      console.error('OpenRouter streaming error:', error);
      
      let errorMessage = ERROR_MESSAGES.API_ERROR;
      
      if (error instanceof Error) {
        if (error.message.includes('network') || error.message.includes('fetch')) {
          errorMessage = ERROR_MESSAGES.NETWORK_ERROR;
        } else if (error.message.includes('rate limit') || error.message.includes('429')) {
          errorMessage = ERROR_MESSAGES.RATE_LIMIT;
        } else if (error.message.includes('timeout')) {
          errorMessage = ERROR_MESSAGES.TIMEOUT;
        }
      }
      
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  }, [enableStreaming]);

  const retryLastMessage = useCallback(async (): Promise<ChatResponse | null> => {
    if (!lastMessage) {
      return null;
    }

    try {
      return await sendMessage(lastMessage.message, lastMessage.context);
    } catch (error) {
      // Error is already set by sendMessage
      return null;
    }
  }, [lastMessage, sendMessage]);

  return {
    sendMessage,
    sendStreamingMessage: enableStreaming ? sendStreamingMessage : async () => {
      throw new Error('Streaming not enabled');
    },
    isLoading,
    error,
    clearError,
    retryLastMessage,
    cancelRequest,
  };
}

// Hook for managing chat history
export function useChatHistory(maxMessages: number = 50) {
  const [history, setHistory] = useState<OpenRouterMessage[]>([]);

  const addToHistory = useCallback((message: OpenRouterMessage) => {
    setHistory(prev => {
      const newHistory = [...prev, message];
      // Keep only the last maxMessages
      return newHistory.slice(-maxMessages);
    });
  }, [maxMessages]);

  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  const getRecentHistory = useCallback((count: number = 10) => {
    return history.slice(-count);
  }, [history]);

  return {
    history,
    addToHistory,
    clearHistory,
    getRecentHistory,
  };
}

// Hook for managing chat preferences
export function useChatPreferences() {
  const [preferences, setPreferences] = useState({
    soundEnabled: true,
    notificationsEnabled: true,
    autoOpen: false,
    theme: 'light' as 'light' | 'dark',
  });

  const updatePreference = useCallback((key: keyof typeof preferences, value: any) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  const resetPreferences = useCallback(() => {
    setPreferences({
      soundEnabled: true,
      notificationsEnabled: true,
      autoOpen: false,
      theme: 'light',
    });
  }, []);

  return {
    preferences,
    updatePreference,
    resetPreferences,
  };
}

// Hook for validating chat functionality
export function useChatValidation() {
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const validateChat = useCallback(async () => {
    try {
      const client = getOpenRouterClient();
      const isValidConnection = await client.validateConnection();
      setIsValid(isValidConnection);
      setValidationError(isValidConnection ? null : 'Failed to validate chat connection');
    } catch (error) {
      setIsValid(false);
      setValidationError(error instanceof Error ? error.message : 'Unknown validation error');
    }
  }, []);

  return {
    isValid,
    validationError,
    validateChat,
  };
}