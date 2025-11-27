-- Fix Import Issue: Add missing RLS policies and ensure proper permissions
-- Run this AFTER running setup-rsvp-autocomplete.sql

-- ============================================
-- FIX: Add INSERT and UPDATE policies for invited_guests
-- ============================================

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

-- ============================================
-- FIX: Grant INSERT and UPDATE permissions
-- ============================================

GRANT INSERT, UPDATE ON public.invited_guests TO authenticated;
GRANT INSERT, UPDATE ON public.invited_guests TO anon;

-- ============================================
-- VERIFICATION
-- ============================================
-- After running this, try the import again:
-- node scripts/sync-invited-guests-with-csv.js MASTERGUESTLIST.csv
