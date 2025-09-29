-- Quick fix for gallery RLS policies
-- Run this in your Supabase SQL Editor to fix the authorization error

-- First, drop any existing policies that might be causing issues
DROP POLICY IF EXISTS "Allow public read access to gallery items" ON gallery_items;
DROP POLICY IF EXISTS "Allow authenticated users to insert gallery items" ON gallery_items;
DROP POLICY IF EXISTS "Allow anyone to insert gallery items" ON gallery_items;
DROP POLICY IF EXISTS "Allow users to delete their own gallery items" ON gallery_items;

-- Create new, simple policies that allow the gallery to work
-- Policy 1: Allow public read access to all gallery items
CREATE POLICY "Allow public read access to gallery items" ON gallery_items
  FOR SELECT USING (true);

-- Policy 2: Allow anyone to insert gallery items (we validate RSVP in the app)
CREATE POLICY "Allow anyone to insert gallery items" ON gallery_items
  FOR INSERT WITH CHECK (true);

-- Policy 3: Allow anyone to delete gallery items (for now - you can restrict later)
CREATE POLICY "Allow anyone to delete gallery items" ON gallery_items
  FOR DELETE USING (true);

-- Verify the policies were created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'gallery_items';
