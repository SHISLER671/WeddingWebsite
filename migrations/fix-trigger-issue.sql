-- Fix Trigger/RLS Issue: Remove any references to dietary_restrictions in invited_guests
-- Run this in your Supabase SQL Editor

-- ============================================
-- STEP 1: Check for problematic triggers
-- ============================================
-- Run this first to see what triggers exist:
-- SELECT trigger_name, event_manipulation, event_object_table, action_statement
-- FROM information_schema.triggers
-- WHERE event_object_table = 'invited_guests';

-- ============================================
-- STEP 2: Drop and recreate the update trigger (safe)
-- ============================================

-- Drop existing trigger
DROP TRIGGER IF EXISTS update_invited_guests_updated_at ON public.invited_guests;

-- Recreate the trigger function (make sure it's clean)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate the trigger
CREATE TRIGGER update_invited_guests_updated_at
  BEFORE UPDATE ON public.invited_guests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- STEP 3: Check and fix RLS policies
-- ============================================

-- List all policies on invited_guests (for reference)
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
-- FROM pg_policies
-- WHERE tablename = 'invited_guests';

-- Drop and recreate INSERT policy (ensure it's clean)
DROP POLICY IF EXISTS "Allow insert to invited_guests" ON public.invited_guests;
CREATE POLICY "Allow insert to invited_guests" 
  ON public.invited_guests
  FOR INSERT 
  WITH CHECK (true);

-- Drop and recreate UPDATE policy (ensure it's clean)
DROP POLICY IF EXISTS "Allow update to invited_guests" ON public.invited_guests;
CREATE POLICY "Allow update to invited_guests" 
  ON public.invited_guests
  FOR UPDATE 
  USING (true)
  WITH CHECK (true);

-- ============================================
-- STEP 4: Verify table structure
-- ============================================
-- Run this to verify the table structure is correct:
-- SELECT column_name, data_type, is_nullable
-- FROM information_schema.columns
-- WHERE table_name = 'invited_guests'
-- ORDER BY ordinal_position;

-- ============================================
-- STEP 5: If there are other triggers, drop them
-- ============================================
-- If you see other triggers in STEP 1, drop them here:
-- DROP TRIGGER IF EXISTS [trigger_name] ON public.invited_guests;

-- ============================================
-- VERIFICATION
-- ============================================
-- After running this, try the import again:
-- node scripts/sync-invited-guests-with-csv.js MASTERGUESTLIST.csv
