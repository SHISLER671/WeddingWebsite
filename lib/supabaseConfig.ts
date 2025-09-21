import { createClient } from '@supabase/supabase-js';

export const getSupabaseClient = () => {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY) {
    throw new Error('Supabase environment variables are not set');
  }
  return createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
};
