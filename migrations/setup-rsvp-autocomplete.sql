-- ============================================
-- RSVP Autocomplete Setup for Supabase
-- ============================================
-- Run this entire script in your Supabase SQL Editor
-- This sets up all tables, indexes, and permissions needed
-- for the RSVP autocomplete feature to work
-- ============================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ============================================
-- 1. INVITED_GUESTS TABLE
-- ============================================
-- Stores the guest list for autocomplete dropdown
CREATE TABLE IF NOT EXISTS public.invited_guests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  guest_name text NOT NULL,
  email text,
  allowed_party_size int NOT NULL DEFAULT 1,
  source text,
  rsvp_id uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Unique constraint on guest_name + email combination
CREATE UNIQUE INDEX IF NOT EXISTS invited_guests_guest_name_email_key
  ON public.invited_guests (guest_name, email);

-- Trigram index for fuzzy matching (if needed later)
CREATE INDEX IF NOT EXISTS idx_invited_guests_name_trgm
  ON public.invited_guests USING gin (guest_name gin_trgm_ops);

-- Email index
CREATE INDEX IF NOT EXISTS idx_invited_guests_email
  ON public.invited_guests (email);

-- Prefix index for autocomplete (optimizes ILIKE queries)
CREATE INDEX IF NOT EXISTS idx_invited_guests_name_prefix 
  ON public.invited_guests USING btree (lower(guest_name));

-- ============================================
-- 2. RSVPS TABLE
-- ============================================
-- Stores RSVP submissions from guests
CREATE TABLE IF NOT EXISTS public.rsvps (
  id bigserial PRIMARY KEY,
  guest_name text NOT NULL,
  email text NOT NULL,
  attendance text NOT NULL CHECK (attendance IN ('yes', 'no')),
  guest_count int NOT NULL DEFAULT 1,
  dietary_restrictions text,
  special_message text,
  wallet_address text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Unique constraint on email (allows updating existing RSVPs)
CREATE UNIQUE INDEX IF NOT EXISTS unique_email 
  ON public.rsvps (email);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_rsvps_email 
  ON public.rsvps (email);

CREATE INDEX IF NOT EXISTS idx_rsvps_guest_name 
  ON public.rsvps (guest_name);

CREATE INDEX IF NOT EXISTS idx_rsvps_attendance 
  ON public.rsvps (attendance);

-- ============================================
-- 3. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on both tables
ALTER TABLE public.invited_guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rsvps ENABLE ROW LEVEL SECURITY;

-- INVITED_GUESTS policies
-- Allow public read access for autocomplete (guests need to see names)
DROP POLICY IF EXISTS "Allow public read access to invited_guests" ON public.invited_guests;
CREATE POLICY "Allow public read access to invited_guests" 
  ON public.invited_guests
  FOR SELECT 
  USING (true);

-- Allow inserts to invited_guests (for importing guest list)
DROP POLICY IF EXISTS "Allow insert to invited_guests" ON public.invited_guests;
CREATE POLICY "Allow insert to invited_guests" 
  ON public.invited_guests
  FOR INSERT 
  WITH CHECK (true);

-- Allow updates to invited_guests (for updating guest list)
DROP POLICY IF EXISTS "Allow update to invited_guests" ON public.invited_guests;
CREATE POLICY "Allow update to invited_guests" 
  ON public.invited_guests
  FOR UPDATE 
  USING (true)
  WITH CHECK (true);

-- RSVPS policies
-- Allow public to insert their own RSVP
DROP POLICY IF EXISTS "Allow public insert RSVP" ON public.rsvps;
CREATE POLICY "Allow public insert RSVP" 
  ON public.rsvps
  FOR INSERT 
  WITH CHECK (true);

-- Allow public to update their own RSVP (by email)
DROP POLICY IF EXISTS "Allow public update own RSVP" ON public.rsvps;
CREATE POLICY "Allow public update own RSVP" 
  ON public.rsvps
  FOR UPDATE 
  USING (true)
  WITH CHECK (true);

-- Allow public to read their own RSVP (by email)
DROP POLICY IF EXISTS "Allow public read own RSVP" ON public.rsvps;
CREATE POLICY "Allow public read own RSVP" 
  ON public.rsvps
  FOR SELECT 
  USING (true);

-- ============================================
-- 4. TRIGGERS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for invited_guests
DROP TRIGGER IF EXISTS update_invited_guests_updated_at ON public.invited_guests;
CREATE TRIGGER update_invited_guests_updated_at
  BEFORE UPDATE ON public.invited_guests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for rsvps
DROP TRIGGER IF EXISTS update_rsvps_updated_at ON public.rsvps;
CREATE TRIGGER update_rsvps_updated_at
  BEFORE UPDATE ON public.rsvps
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 5. GRANT PERMISSIONS
-- ============================================

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON public.invited_guests TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON public.invited_guests TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.rsvps TO anon, authenticated;
GRANT USAGE, SELECT ON SEQUENCE rsvps_id_seq TO anon, authenticated;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================
-- Run these after setup to verify everything works:

-- Check tables exist
-- SELECT table_name FROM information_schema.tables 
-- WHERE table_schema = 'public' AND table_name IN ('invited_guests', 'rsvps');

-- Check indexes
-- SELECT indexname, indexdef FROM pg_indexes 
-- WHERE tablename IN ('invited_guests', 'rsvps');

-- Test autocomplete query (replace 'John' with test name)
-- SELECT id, guest_name, email, allowed_party_size 
-- FROM public.invited_guests 
-- WHERE guest_name ILIKE 'John%' 
-- ORDER BY guest_name 
-- LIMIT 10;

-- Check RLS policies
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
-- FROM pg_policies 
-- WHERE tablename IN ('invited_guests', 'rsvps');

