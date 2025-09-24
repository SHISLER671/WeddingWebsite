// Chatbot Debug Component
// Provides debugging tools and logs for the wedding chatbot

'use client';

import React, { useState } from 'react';
import { useChat } from '@/contexts/ChatContext';
import { getOpenRouterClient } from '@/lib/openrouter';
import { handleRSVPStatusRequest } from '@/lib/rsvp-lookup';

export default function ChatbotDebug() {
  const { state, actions } = useChat();
  const [testResults, setTestResults] = useState<any>({});
  const [isLoading, setIsLoading] = useState(false);

  const testOpenRouterConnection = async () => {
    setIsLoading(true);
    try {
      console.log('🧪 [Debug] Testing OpenRouter connection...');
      const client = getOpenRouterClient();
      const isValid = await client.validateConnection();
      
      setTestResults(prev => ({
        ...prev,
        openRouter: {
          success: isValid,
          message: isValid ? '✅ Connection successful' : '❌ Connection failed',
          timestamp: new Date().toISOString()
        }
      }));
      
      console.log('🧪 [Debug] OpenRouter test result:', isValid);
    } catch (error) {
      console.error('🧪 [Debug] OpenRouter test error:', error);
      setTestResults(prev => ({
        ...prev,
        openRouter: {
          success: false,
          message: `❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
          timestamp: new Date().toISOString()
        }
      }));
    }
    setIsLoading(false);
  };

  const testSupabaseConnection = async () => {
    setIsLoading(true);
    try {
      console.log('🧪 [Debug] Testing Supabase RSVP lookup...');
      const testMessage = "Can you check RSVP for test@example.com";
      const response = await handleRSVPStatusRequest(testMessage);
      
      setTestResults(prev => ({
        ...prev,
        supabase: {
          success: true,
          message: '✅ RSVP lookup function working',
          response: response.substring(0, 100) + '...',
          timestamp: new Date().toISOString()
        }
      }));
      
      console.log('🧪 [Debug] Supabase test response:', response);
    } catch (error) {
      console.error('🧪 [Debug] Supabase test error:', error);
      setTestResults(prev => ({
        ...prev,
        supabase: {
          success: false,
          message: `❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
          timestamp: new Date().toISOString()
        }
      }));
    }
    setIsLoading(false);
  };

  const testChatFunctionality = async () => {
    setIsLoading(true);
    try {
      console.log('🧪 [Debug] Testing chat functionality...');
      const testMessage = "Hello, this is a test message";
      await actions.sendMessage(testMessage);
      
      setTestResults(prev => ({
        ...prev,
        chat: {
          success: true,
          message: '✅ Chat message sent successfully',
          testMessage,
          timestamp: new Date().toISOString()
        }
      }));
      
      console.log('🧪 [Debug] Chat test completed');
    } catch (error) {
      console.error('🧪 [Debug] Chat test error:', error);
      setTestResults(prev => ({
        ...prev,
        chat: {
          success: false,
          message: `❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
          timestamp: new Date().toISOString()
        }
      }));
    }
    setIsLoading(false);
  };

  const clearLogs = () => {
    setTestResults({});
    console.clear();
  };

  const showEnvironmentInfo = () => {
    const envInfo = {
      'NEXT_PUBLIC_SUPABASE_URL': process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Missing',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing',
      'OPENROUTER_API_KEY': process.env.OPENROUTER_API_KEY ? '✅ Set' : '❌ Missing',
      'OPENROUTER_MODEL': process.env.OPENROUTER_MODEL || 'openai/gpt-4o-mini (default)',
      'NEXT_PUBLIC_OPENROUTER_MODEL': process.env.NEXT_PUBLIC_OPENROUTER_MODEL || 'openai/gpt-4o-mini (default)',
    };

    setTestResults(prev => ({
      ...prev,
      environment: {
        success: Object.values(envInfo).every(status => status.includes('✅')),
        message: 'Environment Variables',
        details: envInfo,
        timestamp: new Date().toISOString()
      }
    }));
  };

  return (
    <div className="fixed bottom-4 left-4 z-50 bg-white rounded-lg shadow-xl border border-gray-200 p-4 max-w-md max-h-96 overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">🧪 Chatbot Debug Panel</h3>
        <button
          onClick={clearLogs}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          Clear
        </button>
      </div>

      <div className="space-y-2 mb-4">
        <button
          onClick={showEnvironmentInfo}
          disabled={isLoading}
          className="w-full text-left px-3 py-2 bg-blue-50 text-blue-700 rounded hover:bg-blue-100 disabled:opacity-50"
        >
          📋 Check Environment Variables
        </button>
        
        <button
          onClick={testOpenRouterConnection}
          disabled={isLoading}
          className="w-full text-left px-3 py-2 bg-green-50 text-green-700 rounded hover:bg-green-100 disabled:opacity-50"
        >
          🤖 Test OpenRouter Connection
        </button>
        
        <button
          onClick={testSupabaseConnection}
          disabled={isLoading}
          className="w-full text-left px-3 py-2 bg-purple-50 text-purple-700 rounded hover:bg-purple-100 disabled:opacity-50"
        >
          🗄️ Test Supabase RSVP Lookup
        </button>
        
        <button
          onClick={testChatFunctionality}
          disabled={isLoading}
          className="w-full text-left px-3 py-2 bg-orange-50 text-orange-700 rounded hover:bg-orange-100 disabled:opacity-50"
        >
          💬 Test Chat Functionality
        </button>
      </div>

      {/* Current State */}
      <div className="border-t pt-4 mb-4">
        <h4 className="font-medium text-gray-700 mb-2">Current State:</h4>
        <div className="text-sm text-gray-600 space-y-1">
          <div>Chat Open: {state.isOpen ? '✅' : '❌'}</div>
          <div>Messages: {state.messages.length}</div>
          <div>Loading: {state.isLoading ? '✅' : '❌'}</div>
          <div>Error: {state.error ? '✅' : '❌'}</div>
          <div>Unread: {state.unreadCount}</div>
        </div>
      </div>

      {/* Test Results */}
      {Object.keys(testResults).length > 0 && (
        <div className="border-t pt-4">
          <h4 className="font-medium text-gray-700 mb-2">Test Results:</h4>
          <div className="space-y-2 text-sm">
            {Object.entries(testResults).map(([key, result]: [string, any]) => (
              <div key={key} className={`p-2 rounded ${result.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                <div className="font-medium">{result.message}</div>
                {result.details && (
                  <div className="mt-1 text-xs opacity-75">
                    {Object.entries(result.details).map(([env, status]) => (
                      <div key={env}>{env}: {status}</div>
                    ))}
                  </div>
                )}
                {result.response && (
                  <div className="mt-1 text-xs opacity-75">
                    Response: {result.response}
                  </div>
                )}
                <div className="text-xs opacity-50 mt-1">
                  {new Date(result.timestamp).toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="border-t pt-4 mt-4">
        <h4 className="font-medium text-gray-700 mb-2">Debug Instructions:</h4>
        <div className="text-xs text-gray-600 space-y-1">
          <div>1. Check environment variables first</div>
          <div>2. Test OpenRouter connection</div>
          <div>3. Test Supabase RSVP lookup</div>
          <div>4. Test chat functionality</div>
          <div>5. Check browser console for detailed logs</div>
          <div>6. Look for 🤖, 💬, 🗄️ log prefixes</div>
        </div>
      </div>
    </div>
  );
}

// Hook to enable/disable debug mode
export function useDebugMode() {
  const [debugMode, setDebugMode] = useState(false);
  
  const toggleDebugMode = () => {
    setDebugMode(!debugMode);
    console.log('🧪 [Debug] Debug mode:', !debugMode ? 'enabled' : 'disabled');
  };
  
  return { debugMode, toggleDebugMode };
}