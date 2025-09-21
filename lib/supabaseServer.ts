// Server-side Supabase client for admin operations
// Uses service role key to bypass Row Level Security for admin tables

import { createClient } from '@supabase/supabase-js';

// Temporary workaround for Replit Secrets (values are swapped) 
// For production deployment, use correct variable assignments
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY; // Contains URL due to Replit secrets
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error('Missing Supabase server environment variables. Check SUPABASE_SERVICE_ROLE_KEY secret.');
}

// Create server-side client with service role key (bypasses RLS)
export const supabaseServer = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});
