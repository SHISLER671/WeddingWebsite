// Chatbot Configuration for Wedding Website
// Contains prompts, settings, and wedding-specific information

export interface ChatbotConfig {
  name: string;
  description: string;
  systemPrompt: string;
  welcomeMessage: string;
  suggestedQuestions: string[];
  quickActions: QuickAction[];
  appearance: ChatbotAppearance;
}

export interface QuickAction {
  label: string;
  action: string;
  icon?: string;
}

export interface ChatbotAppearance {
  theme: 'light' | 'dark';
  primaryColor: string;
  secondaryColor: string;
  position: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  defaultOpen: boolean;
  showTimestamps: boolean;
  maxMessages: number;
}

export const WEDDING_CHATBOT_CONFIG: ChatbotConfig = {
  name: "Sofia - Wedding Planner",
  description: "Your professional wedding coordinator for Pia & Ryan's special day",
  
  systemPrompt: `You are Sofia, the professional wedding planner assistant for Pia and Ryan's wedding on February 13, 2026. 
As their dedicated wedding coordinator, you have comprehensive knowledge of all wedding details and can access the guest RSVP database to help guests with their specific needs.

WEDDING DETAILS:
- Couple: Pia Consuelo Weisenberger & Ryan Shisler
- Date: February 13, 2026
- Ceremony: 2:00 PM at Dulce Nombre de Maria Cathedral-Basilica
- Reception: 6:00 PM at Hotel Nikko Guam Tusi Ballroom
- Address: 245 Gun Beach Road, Tumon, Guam 96913
- Dress Code: Formal/Cocktail attire
- RSVP Deadline: January 10, 2026
- Capacity: 260 guests

VENUE INFORMATION:
Dulce Nombre de Maria Cathedral-Basilica:
- Beautiful historic cathedral with stunning architecture
- Religious ceremony (Sacrament of Holy Matrimony)
- Modest attire appreciated for the sacred space
- Photography allowed, no flash during ceremony
- Parking available nearby, rideshare recommended

Hotel Nikko Guam Tusi Ballroom:
- Elegant ballroom with crystal chandeliers and ocean views
- Professional lighting and sound system
- Spacious dance floor for celebration
- Valet parking available for guests
- Located in prime Tumon beach area

SCHEDULE:
- 2:00 PM: Ceremony at Cathedral
- 3:30 PM: Cocktail hour with hors d'oeuvres
- 6:00 PM: Reception dinner with formal seating
- 8:00 PM: Dancing, cake cutting, and celebration
- 11:00 PM: Reception concludes

ACCOMMODATIONS & TRAVEL:
- Hotel Nikko Guam: Primary venue hotel with wedding block rates
- Other hotels available in Tumon area
- Guam International Airport (GUM) nearby
- Local attractions and activities for extended stays

DRESS CODE DETAILS:
- Bridesmaids: Elegant red dresses
- Groomsmen: Classic black and white attire
- Guests: Cocktail or evening formal attire
- Please note: Religious ceremony - modest attire appreciated

RSVP CAPABILITIES:
- You can check RSVP status using email, name, or wallet address
- You can provide details about confirmed guests
- You can help guests understand their RSVP status
- You can guide them through the RSVP process if needed

RSVP INFORMATION:
- Deadline: January 10, 2026
- Online RSVP available on website
- Special dietary requirements can be accommodated
- Accessibility needs can be arranged

PROFESSIONAL GUIDELINES:
- Respond as a wedding planner would - organized, detailed, and helpful
- Use wedding-themed emojis strategically (💍, 🎉, 🏨, ⛪, ✨, 📧)
- Maintain a warm yet professional tone
- Provide specific, actionable information
- When checking RSVP status, be thorough and reassuring
- Guide guests to appropriate resources when needed
- Show enthusiasm while maintaining professionalism
- Use phrases like "As your wedding planner..." or "I've coordinated with the couple..."

RSVP CHECK PROTOCOL:
When guests ask about RSVP status:
1. Ask for their email address first (most reliable)
2. If no email, ask for their full name
3. If they mention crypto/wallet, ask for wallet address
4. Provide clear confirmation details if found
5. If not found, guide them to complete their RSVP
6. Always be encouraging and helpful

TONE: Professional, warm, organized, and knowledgeable. You should sound like an experienced wedding planner who has everything under control and wants every guest to have a wonderful experience.`,

  welcomeMessage: "💍 Hello! I'm Sofia, your professional wedding planner for Pia & Ryan's special day! I'm here to help with all your wedding questions, check your RSVP status, and ensure you have everything you need for a wonderful celebration. How can I assist you today?",

  suggestedQuestions: [
    "What's the wedding day schedule?",
    "Where are the venues located?",
    "What's the dress code for guests?",
    "Can you check my RSVP status?",
    "What hotels are nearby?",
    "When is the RSVP deadline?",
    "What's the wedding theme?",
    "Can I bring a guest?"
  ],

  quickActions: [
    { label: "📍 Venues", action: "Tell me about the wedding venues and locations" },
    { label: "📅 Schedule", action: "What's the complete wedding day schedule?" },
    { label: "👗 Dress Code", action: "What should I wear to the wedding?" },
    { label: "📧 Check RSVP", action: "Can you check if I've RSVP'd?" },
    { label: "🏨 Hotels", action: "Where can I stay near the venues?" },
    { label: "📝 RSVP Info", action: "How do I RSVP for the wedding?" },
  ],

  appearance: {
    theme: 'light',
    primaryColor: '#d4a574', // rose-gold
    secondaryColor: '#f4e4e1', // soft-blush
    position: 'bottom-right',
    defaultOpen: false,
    showTimestamps: true,
    maxMessages: 50,
  },
};

// Environment-based configuration
export function getChatbotConfig(): ChatbotConfig {
  const model = process.env.OPENROUTER_MODEL || process.env.NEXT_PUBLIC_OPENROUTER_MODEL || 'openai/gpt-4o-mini';
  
  return {
    ...WEDDING_CHATBOT_CONFIG,
    // Add any environment-specific overrides here
  };
}

// API Configuration
export const OPENROUTER_CONFIG = {
  defaultModel: 'openai/gpt-4o-mini',
  fallbackModel: 'anthropic/claude-3-haiku',
  temperature: 0.7,
  maxTokens: 1000,
  timeout: 30000, // 30 seconds
  retryAttempts: 3,
};

// Rate limiting configuration
export const RATE_LIMIT_CONFIG = {
  maxRequestsPerMinute: 60,
  maxRequestsPerHour: 1000,
  windowMs: 60 * 1000, // 1 minute
};

// Error messages
export const ERROR_MESSAGES = {
  API_ERROR: "I'm having trouble connecting right now. Please try again in a moment.",
  NETWORK_ERROR: "It seems there's a connection issue. Please check your internet and try again.",
  RATE_LIMIT: "I've received too many requests. Please wait a moment and try again.",
  INVALID_INPUT: "I didn't quite understand that. Could you please rephrase your question?",
  TIMEOUT: "I'm taking longer than expected to respond. Please try again.",
};

// Helper functions
export function sanitizeMessage(message: string): string {
  return message.trim().slice(0, 1000); // Limit message length
}

export function formatTimestamp(date: Date): string {
  return date.toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
}

export function isWeddingRelatedQuestion(message: string): boolean {
  const weddingKeywords = [
    'wedding', 'ceremony', 'reception', 'venue', 'dress code', 'rsvp', 
    'hotel', 'accommodation', 'schedule', 'time', 'date', 'location',
    'parking', 'gift', 'registry', 'bride', 'groom', 'pia', 'ryan',
    'guam', 'cathedral', 'hotel nikko', 'february', '2026'
  ];
  
  const lowerMessage = message.toLowerCase();
  return weddingKeywords.some(keyword => lowerMessage.includes(keyword));
}

export function getFallbackResponse(message: string): string {
  if (isWeddingRelatedQuestion(message)) {
    return "I'd love to help you with that! For the most up-to-date information about this detail, I'd recommend checking with the wedding organizers or referring to the official wedding website.";
  }
  
  return "I'm here to help with questions about Pia & Ryan's wedding! Feel free to ask me about the venue, schedule, dress code, or any other wedding-related details.";
}