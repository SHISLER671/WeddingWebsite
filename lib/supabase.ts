// Supabase client setup for wedding website
// Uses environment variables for secure connection
// Exports supabase client for API routes (e.g., /api/seating)

import { createClient } from '@supabase/supabase-js';

export function getSupabaseClient() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_ANON_KEY;

  console.log('Supabase URL (util):', supabaseUrl || 'Missing');
  if (!supabaseUrl || !supabaseUrl.startsWith('https://')) {
    throw new Error('Invalid Supabase URL in getSupabaseClient');
  }
  if (!supabaseKey) {
    throw new Error('Missing Supabase Key in getSupabaseClient');
  }

  return createClient(supabaseUrl, supabaseKey);
}

// Optional: Keep RSVP interface for future use
export interface RSVPData {
  id?: number;
  guest_name: string;
  email: string;
  attendance: 'yes' | 'no';
  guest_count: number;
  dietary_restrictions?: string;
  special_message?: string;
  wallet_address?: string;
  created_at?: string;
  updated_at?: string;
}

// Real Supabase queries (assumes rsvps table exists)
export async function submitRSVP(rsvpData: Omit<RSVPData, 'id' | 'created_at' | 'updated_at'>) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.from('rsvps').insert(rsvpData).select();
  if (error) throw error;
  return { success: true, data: data[0] };
}

export async function getRSVPs() {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.from('rsvps').select('*');
  if (error) throw error;
  return { success: true, data };
}
