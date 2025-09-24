// RSVP Lookup Utility for Wedding Chatbot
// Enables chatbot to check RSVP status from Supabase database

import { createClient } from '@supabase/supabase-js';

export interface RSVPRecord {
  id?: number;
  guest_name: string;
  email: string;
  attendance: 'yes' | 'no';
  guest_count: number;
  dietary_restrictions?: string | null;
  special_message?: string | null;
  wallet_address?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface RSVPCheckResult {
  found: boolean;
  rsvp?: RSVPRecord;
  message: string;
  confidence: 'high' | 'medium' | 'low';
}

export interface GuestSearchParams {
  email?: string;
  name?: string;
  wallet_address?: string;
}

// Initialize Supabase client for read-only operations
function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase configuration missing for RSVP lookup');
  }

  return createClient(supabaseUrl, supabaseKey);
}

// Normalize email for better matching
function normalizeEmail(email: string): string {
  return email.toLowerCase().trim();
}

// Normalize name for better matching
function normalizeName(name: string): string {
  return name.toLowerCase().trim()
    .replace(/\s+/g, ' ') // Multiple spaces to single space
    .replace(/[^\w\s]/g, ''); // Remove special characters
}

// Calculate name similarity score (0-1)
function calculateNameSimilarity(name1: string, name2: string): number {
  const normalized1 = normalizeName(name1);
  const normalized2 = normalizeName(name2);
  
  if (normalized1 === normalized2) return 1.0;
  
  // Check if one contains the other
  if (normalized1.includes(normalized2) || normalized2.includes(normalized1)) {
    return 0.8;
  }
  
  // Check for partial matches (first name, last name)
  const parts1 = normalized1.split(' ');
  const parts2 = normalized2.split(' ');
  
  let matchCount = 0;
  for (const part1 of parts1) {
    if (part1.length > 2) { // Only check parts longer than 2 characters
      for (const part2 of parts2) {
        if (part1 === part2) {
          matchCount++;
        }
      }
    }
  }
  
  return Math.min(matchCount / Math.max(parts1.length, parts2.length), 0.7);
}

// Search for RSVP by email (primary method)
async function searchByEmail(email: string): Promise<RSVPRecord | null> {
  try {
    const supabase = getSupabaseClient();
    const normalizedEmail = normalizeEmail(email);
    
    const { data, error } = await supabase
      .from('rsvps')
      .select('*')
      .ilike('email', normalizedEmail)
      .single();

    if (error || !data) return null;
    
    return data as RSVPRecord;
  } catch (error) {
    console.error('Error searching RSVP by email:', error);
    return null;
  }
}

// Search for RSVP by name (fallback method)
async function searchByName(name: string): Promise<RSVPRecord[]> {
  try {
    const supabase = getSupabaseClient();
    const normalizedName = normalizeName(name);
    
    // First try exact match
    const { data: exactMatches, error: exactError } = await supabase
      .from('rsvps')
      .select('*')
      .ilike('guest_name', name);
    
    if (exactError) {
      console.error('Error searching RSVP by name (exact):', exactError);
      return [];
    }
    
    if (exactMatches && exactMatches.length > 0) {
      return exactMatches as RSVPRecord[];
    }
    
    // If no exact match, try partial matching
    const { data: partialMatches, error: partialError } = await supabase
      .from('rsvps')
      .select('*');
    
    if (partialError) {
      console.error('Error searching RSVP by name (partial):', partialError);
      return [];
    }
    
    if (!partialMatches) return [];
    
    // Filter by similarity score
    const matches = partialMatches
      .map(record => ({
        record: record as RSVPRecord,
        similarity: calculateNameSimilarity(name, record.guest_name)
      }))
      .filter(({ similarity }) => similarity >= 0.6)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 5); // Return top 5 matches
    
    return matches.map(({ record }) => record);
  } catch (error) {
    console.error('Error searching RSVP by name:', error);
    return [];
  }
}

// Search for RSVP by wallet address
async function searchByWalletAddress(walletAddress: string): Promise<RSVPRecord | null> {
  try {
    const supabase = getSupabaseClient();
    
    const { data, error } = await supabase
      .from('rsvps')
      .select('*')
      .ilike('wallet_address', walletAddress)
      .single();

    if (error || !data) return null;
    
    return data as RSVPRecord;
  } catch (error) {
    console.error('Error searching RSVP by wallet address:', error);
    return null;
  }
}

// Main RSVP lookup function
export async function lookupRSVP(params: GuestSearchParams): Promise<RSVPCheckResult> {
  try {
    const { email, name, wallet_address } = params;
    
    // Priority 1: Email search (most reliable)
    if (email) {
      const rsvp = await searchByEmail(email);
      if (rsvp) {
        return {
          found: true,
          rsvp,
          message: `Found RSVP for ${rsvp.guest_name} (${rsvp.email})`,
          confidence: 'high'
        };
      }
    }
    
    // Priority 2: Wallet address search
    if (wallet_address) {
      const rsvp = await searchByWalletAddress(wallet_address);
      if (rsvp) {
        return {
          found: true,
          rsvp,
          message: `Found RSVP for ${rsvp.guest_name} (wallet: ${rsvp.wallet_address?.slice(0, 6)}...${rsvp.wallet_address?.slice(-4)})`,
          confidence: 'high'
        };
      }
    }
    
    // Priority 3: Name search (least reliable)
    if (name) {
      const matches = await searchByName(name);
      if (matches.length === 1) {
        const rsvp = matches[0];
        return {
          found: true,
          rsvp,
          message: `Found RSVP for ${rsvp.guest_name} (matched by name)`,
          confidence: 'medium'
        };
      } else if (matches.length > 1) {
        return {
          found: false,
          message: `Found ${matches.length} possible matches for "${name}". Please provide your email address for more accurate results.`,
          confidence: 'low'
        };
      }
    }
    
    // No matches found
    return {
      found: false,
      message: 'No RSVP found with the provided information. Please check your spelling or provide additional details.',
      confidence: 'low'
    };
    
  } catch (error) {
    console.error('Error in RSVP lookup:', error);
    return {
      found: false,
      message: 'Sorry, I encountered an error while checking your RSVP status. Please try again later.',
      confidence: 'low'
    };
  }
}

// Generate human-readable RSVP status message
export function generateRSVPStatusMessage(result: RSVPCheckResult): string {
  if (!result.found) {
    return result.message;
  }
  
  const rsvp = result.rsvp!;
  const status = rsvp.attendance === 'yes' ? '✅ Confirmed' : '❌ Declined';
  const guestCount = rsvp.guest_count || 1;
  
  let message = `${status} RSVP for ${rsvp.guest_name}`;
  
  if (rsvp.attendance === 'yes') {
    message += `\n👥 Guests: ${guestCount}`;
    message += `\n📧 Email: ${rsvp.email}`;
    
    if (rsvp.dietary_restrictions) {
      message += `\n🥗 Dietary restrictions: ${rsvp.dietary_restrictions}`;
    }
    
    if (rsvp.special_message) {
      message += `\n💭 Special message: ${rsvp.special_message}`;
    }
    
    message += '\n\nThank you for your RSVP! We look forward to celebrating with you. 🎉';
  } else {
    message += '\n\nWe\'re sorry you can\'t make it. Thank you for letting us know. 💕';
  }
  
  return message;
}

// Extract search parameters from user message
export function extractRSVPSearchParams(message: string): GuestSearchParams {
  const params: GuestSearchParams = {};
  const lowerMessage = message.toLowerCase();
  
  // Email extraction
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const emailMatches = message.match(emailRegex);
  if (emailMatches) {
    params.email = emailMatches[0];
  }
  
  // Wallet address extraction
  const walletRegex = /0x[a-fA-F0-9]{40}/g;
  const walletMatches = message.match(walletRegex);
  if (walletMatches) {
    params.wallet_address = walletMatches[0];
  }
  
  // Name extraction (remove email and wallet first, then look for name patterns)
  const cleanMessage = message
    .replace(emailRegex, '')
    .replace(walletRegex, '')
    .replace(/rsvp|check|status|my|is|for|name|email|address|wallet/gi, '')
    .trim();
  
  if (cleanMessage.length > 2) {
    // Look for common name patterns
    const namePatterns = [
      /(?:my name is|i am|call me)\s+([a-zA-Z\s]{3,50})/i,
      /([a-zA-Z\s]{3,50})\s*(?:rsvp|check|status)/i,
      /^([a-zA-Z\s]{3,50})$/i
    ];
    
    for (const pattern of namePatterns) {
      const match = cleanMessage.match(pattern);
      if (match && match[1]) {
        params.name = match[1].trim();
        break;
      }
    }
    
    // If no pattern matched, use the cleaned message as potential name
    if (!params.name && cleanMessage.split(' ').length >= 2) {
      params.name = cleanMessage;
    }
  }
  
  return params;
}

// Chatbot-friendly function to handle RSVP status requests
export async function handleRSVPStatusRequest(userMessage: string): Promise<string> {
  try {
    const searchParams = extractRSVPSearchParams(userMessage);
    
    // Validate that we have some search criteria
    if (!searchParams.email && !searchParams.name && !searchParams.wallet_address) {
      return "I'd be happy to check your RSVP status! To help me find your information, could you please provide:\n\n• Your email address (most reliable)\n• Your full name\n• Or your wallet address if you used one to RSVP\n\nWhich would you prefer to share?";
    }
    
    const result = await lookupRSVP(searchParams);
    return generateRSVPStatusMessage(result);
    
  } catch (error) {
    console.error('Error handling RSVP status request:', error);
    return "I apologize, but I'm having trouble checking your RSVP status right now. This could be due to a temporary connection issue. Please try again in a few moments, or contact the wedding organizers directly for assistance.";
  }
}