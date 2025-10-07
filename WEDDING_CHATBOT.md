# Wedding Chatbot with RSVP Integration

## Overview

The wedding chatbot "Jahmal" is a professional wedding planner assistant that can help guests with wedding information and check their RSVP status in real-time using the Supabase database.

## Features

### 1. Wedding Information
- **Venue Details**: Information about ceremony and reception locations
- **Schedule**: Complete wedding day timeline
- **Dress Code**: Attire recommendations for guests
- **Accommodations**: Hotel recommendations and travel information
- **General Questions**: Answer any wedding-related inquiries

### 2. RSVP Status Check
The chatbot can check RSVP status using:
- **Email Address** (most reliable)
- **Full Name** (with fuzzy matching)
- **Wallet Address** (for crypto-enabled RSVPs)

### 3. Professional Personality
- **Name**: Jahmal - Wedding Planner
- **Tone**: Professional, warm, organized, and knowledgeable
- **Expertise**: Comprehensive knowledge of all wedding details

## How Guests Can Use the Chatbot

### Checking RSVP Status

Guests can ask questions like:
- "Can you check my RSVP status?"
- "Have I RSVP'd for the wedding?"
- "Did I register for Pia and Ryan's wedding?"
- "Check my RSVP with email john@example.com"
- "Can you confirm if Sarah Johnson is coming?"

### Getting Wedding Information

Guests can ask about:
- "What time is the ceremony?"
- "Where is the reception being held?"
- "What should I wear to the wedding?"
- "Are there hotels nearby?"
- "When is the RSVP deadline?"

## Technical Implementation

### Architecture

\`\`\`
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Chat UI       │    │  Chat Context   │    │  RSVP Lookup    │
│  Components     │────│   Provider      │────│   Utility       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │  OpenRouter API │
                       │   (AI Backend)   │
                       └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │  Supabase DB    │
                       │  (RSVP Data)    │
                       └─────────────────┘
\`\`\`

### Key Components

1. **Chat Context** (`/contexts/ChatContext.tsx`)
   - Manages chat state and message handling
   - Integrates RSVP lookup with AI responses
   - Handles loading states and error management

2. **RSVP Lookup** (`/lib/rsvp-lookup.ts`)
   - Searches Supabase database by email, name, or wallet
   - Provides fuzzy matching for names
   - Generates human-readable response messages

3. **Chat Components** (`/components/WeddingChatbot/`)
   - `ChatBubble.tsx`: Floating chat trigger
   - `ChatWindow.tsx`: Main chat interface
   - `ChatMessage.tsx`: Individual message display

4. **Configuration** (`/lib/chatbot-config.ts`)
   - Wedding planner persona and system prompt
   - Venue information and schedule
   - Quick actions and suggested questions

### RSVP Search Logic

The chatbot uses a tiered search approach:

1. **Email Search** (Priority 1)
   - Exact match (case-insensitive)
   - Most reliable method

2. **Wallet Address Search** (Priority 2)
   - Exact match for crypto-enabled RSVPs
   - Useful for Web3-savvy guests

3. **Name Search** (Priority 3)
   - Fuzzy matching with similarity scoring
   - Handles variations and partial matches
   - Returns multiple matches if ambiguous

### Error Handling

- **Database Connection Issues**: Falls back to AI response
- **No Matches Found**: Provides helpful guidance
- **Multiple Matches**: Asks for more specific information
- **Invalid Input**: Provides clear instructions

## Environment Variables Required

\`\`\`env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key

# OpenRouter Configuration
OPENROUTER_API_KEY=your_openrouter_api_key
OPENROUTER_MODEL=openai/gpt-4o-mini
NEXT_PUBLIC_OPENROUTER_MODEL=openai/gpt-4o-mini
\`\`\`

## Database Schema

The chatbot expects the following `rsvps` table structure:

\`\`\`sql
CREATE TABLE rsvps (
  id INTEGER PRIMARY KEY,
  guest_name TEXT NOT NULL,
  email TEXT NOT NULL,
  attendance TEXT NOT NULL CHECK (attendance IN ('yes', 'no')),
  guest_count INTEGER NOT NULL DEFAULT 1,
  dietary_restrictions TEXT,
  special_message TEXT,
  wallet_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Unique constraint on email for upsert operations
ALTER TABLE rsvps ADD CONSTRAINT unique_email UNIQUE (email);
\`\`\`

## Security Considerations

1. **Read-Only Access**: Chatbot uses anon key for read operations only
2. **No Sensitive Data**: Only returns RSVP status, not personal information
3. **Input Validation**: All user inputs are sanitized and validated
4. **Rate Limiting**: Implemented to prevent abuse
5. **Error Messages**: Generic messages don't reveal system details

## Testing

Run the test suite to verify functionality:

\`\`\`bash
# Run the integration tests
npx ts-node lib/test-rsvp-integration.ts
\`\`\`

Test cases include:
- Parameter extraction from messages
- Database lookup operations
- Message generation
- Full integration scenarios

## Customization

### Changing the Wedding Planner Persona

Edit `lib/chatbot-config.ts` to modify:
- Name and description
- System prompt and personality
- Wedding details and schedule
- Quick actions and suggested questions

### Styling

The chatbot uses the site's rose-gold color palette:
- Primary: `#d4a574` (rose-gold)
- Secondary: `#f4e4e1` (soft-blush)
- Custom CSS variables in `app/globals.css`

### Position and Behavior

Configure chatbot appearance in `lib/chatbot-config.ts`:
- Position (bottom-right, bottom-left, top-right, top-left)
- Theme (light/dark)
- Default open state
- Message limit

## Deployment

1. **Environment Variables**: Set all required environment variables
2. **Database**: Ensure `rsvps` table exists with proper data
3. **Dependencies**: Install all npm packages
4. **Build**: Run `npm run build` to verify no errors
5. **Test**: Test RSVP functionality with real data

## Troubleshooting

### Common Issues

1. **Chatbot not appearing**
   - Check ChatProvider integration in layout
   - Verify no JavaScript errors in console

2. **RSVP lookup not working**
   - Verify Supabase connection
   - Check environment variables
   - Ensure rsvps table exists and has data

3. **AI responses not working**
   - Check OpenRouter API key
   - Verify model selection
   - Check network connectivity

4. **Styling issues**
   - Verify Tailwind CSS is working
   - Check custom CSS variables
   - Inspect component classes

## Future Enhancements

1. **Multi-language Support**: Add translations for international guests
2. **Real-time Updates**: Live RSVP status updates
3. **Calendar Integration**: Add to calendar functionality
4. **Photo Gallery**: Integration with wedding photos
5. **Gift Registry**: Link to gift registry information

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review the test cases
3. Verify environment configuration
4. Check browser console for errors
