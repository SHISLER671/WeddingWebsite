// OpenRouter API Client for Wedding Website Chatbot
// Handles communication with OpenRouter for AI-powered wedding assistance

export interface OpenRouterMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface OpenRouterResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface OpenRouterError {
  message: string;
  type: string;
  code?: string;
}

export class OpenRouterClient {
  private apiKey: string;
  private model: string;
  private baseUrl: string = 'https://openrouter.ai/api/v1';

  constructor(apiKey: string, model: string = 'openai/gpt-4o-mini') {
    if (!apiKey) {
      throw new Error('OpenRouter API key is required');
    }
    this.apiKey = apiKey;
    this.model = model;
  }

  /**
   * Send a chat completion request to OpenRouter
   */
  async chatCompletion(
    messages: OpenRouterMessage[],
    options?: {
      temperature?: number;
      maxTokens?: number;
      stream?: boolean;
    }
  ): Promise<OpenRouterResponse> {
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    console.log('🤖 [OpenRouter] === Chat Completion Request ===');
    console.log('🤖 [OpenRouter] Request ID:', requestId);
    console.log('🤖 [OpenRouter] Model:', this.model);
    console.log('🤖 [OpenRouter] Messages count:', messages.length);
    console.log('🤖 [OpenRouter] Options:', options);
    console.log('🤖 [OpenRouter] First message role:', messages[0]?.role);
    console.log('🤖 [OpenRouter] Last message role:', messages[messages.length - 1]?.role);
    console.log('🤖 [OpenRouter] Last message preview:', messages[messages.length - 1]?.content?.substring(0, 100) + '...');

    try {
      const requestBody = {
        model: this.model,
        messages,
        temperature: options?.temperature ?? 0.7,
        max_tokens: options?.maxTokens ?? 24000,
        stream: options?.stream ?? false,
      };

      console.log('🤖 [OpenRouter] Sending request to:', `${this.baseUrl}/chat/completions`);
      console.log('🤖 [OpenRouter] Request body:', JSON.stringify(requestBody, null, 2));

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': typeof window !== 'undefined' ? window.location.origin : 'https://wedding-website.local',
          'X-Title': 'Pia & Ryan Wedding Assistant',
        },
        body: JSON.stringify(requestBody),
      });

      console.log('🤖 [OpenRouter] Response status:', response.status);
      console.log('🤖 [OpenRouter] Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('🤖 [OpenRouter] API Error Response:', errorData);
        const error = new Error(
          `OpenRouter API Error: ${response.status} - ${errorData.error?.message || response.statusText}`
        );
        console.error('🤖 [OpenRouter] Error:', error.message);
        throw error;
      }

      const data: OpenRouterResponse = await response.json();
      console.log('🤖 [OpenRouter] === Success Response ===');
      console.log('🤖 [OpenRouter] Response ID:', data.id);
      console.log('🤖 [OpenRouter] Model used:', data.model);
      console.log('🤖 [OpenRouter] Choices count:', data.choices?.length || 0);
      console.log('🤖 [OpenRouter] First choice:', data.choices?.[0]);
      console.log('🤖 [OpenRouter] Usage:', data.usage);
      console.log('🤖 [OpenRouter] Response content preview:', data.choices?.[0]?.message?.content?.substring(0, 100) + '...');

      return data;
    } catch (error) {
      console.error('🤖 [OpenRouter] === Request Failed ===');
      console.error('🤖 [OpenRouter] Request ID:', requestId);
      console.error('🤖 [OpenRouter] Error:', error);
      console.error('🤖 [OpenRouter] Error stack:', error instanceof Error ? error.stack : 'No stack trace');
      throw error;
    }
  }

  /**
   * Stream a chat completion response for real-time updates
   */
  async *streamChatCompletion(
    messages: OpenRouterMessage[],
    options?: {
      temperature?: number;
      maxTokens?: number;
    }
  ): AsyncGenerator<string, void, unknown> {
    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': typeof window !== 'undefined' ? window.location.origin : 'https://wedding-website.local',
          'X-Title': 'Pia & Ryan Wedding Assistant',
        },
        body: JSON.stringify({
          model: this.model,
          messages,
          temperature: options?.temperature ?? 0.7,
          max_tokens: options?.maxTokens ?? 24000,
          stream: true,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `OpenRouter Streaming Error: ${response.status} - ${errorData.error?.message || response.statusText}`
        );
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('Unable to get response stream reader');
      }

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter(line => line.trim());

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') {
              return;
            }

            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content || '';
              if (content) {
                yield content;
              }
            } catch (e) {
              // Ignore parsing errors for partial chunks
            }
          }
        }
      }
    } catch (error) {
      console.error('OpenRouter Streaming Error:', error);
      throw error;
    }
  }

  /**
   * Get available models from OpenRouter
   */
  async getModels(): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/models`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch models: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching models:', error);
      throw error;
    }
  }

  /**
   * Validate API key and connection
   */
  async validateConnection(): Promise<boolean> {
    try {
      const testMessages: OpenRouterMessage[] = [
        {
          role: 'system',
          content: 'You are a helpful assistant.',
        },
        {
          role: 'user',
          content: 'Hello, this is a test message.',
        },
      ];

      const response = await this.chatCompletion(testMessages, {
        maxTokens: 10,
      });

      return response.choices.length > 0;
    } catch (error) {
      console.error('OpenRouter connection validation failed:', error);
      return false;
    }
  }
}

// Singleton instance for global use
let openRouterClient: OpenRouterClient | null = null;

/**
 * Get or create the OpenRouter client instance
 */
export function getOpenRouterClient(): OpenRouterClient {
  if (!openRouterClient) {
    const apiKey = process.env.OPENROUTER_API_KEY;
    const model = process.env.OPENROUTER_MODEL || process.env.NEXT_PUBLIC_OPENROUTER_MODEL || 'openai/gpt-4o-mini';
    
    console.log('🤖 [OpenRouter] Initializing client...');
    console.log('🤖 [OpenRouter] API Key configured:', apiKey ? '✅ Yes' : '❌ No');
    console.log('🤖 [OpenRouter] Model:', model);
    
    if (!apiKey) {
      const error = 'OpenRouter API key not configured. Please set OPENROUTER_API_KEY environment variable.';
      console.error('🤖 [OpenRouter] Configuration Error:', error);
      throw new Error(error);
    }
    
    openRouterClient = new OpenRouterClient(apiKey, model);
    console.log('🤖 [OpenRouter] Client initialized successfully');
  }
  
  return openRouterClient;
}

/**
 * Create a new OpenRouter client with specific configuration
 */
export function createOpenRouterClient(apiKey: string, model?: string): OpenRouterClient {
  return new OpenRouterClient(apiKey, model);
}
