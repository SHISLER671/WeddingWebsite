import { createBrowserClient } from "@supabase/ssr"

// Cache environment variables at import time to avoid intermittent access issues
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || ""
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || ""

export function createClient() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error("Supabase environment variables are missing. Please check your project configuration.")
  }
  return createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY)
}
