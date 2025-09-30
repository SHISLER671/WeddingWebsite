-- Fix Gallery RLS with Permissive Policies
-- This script creates policies that allow all operations for everyone
-- This is the correct approach instead of disabling RLS

-- Step 1: Enable RLS (it should be enabled for policies to work)
ALTER TABLE gallery_items ENABLE ROW LEVEL SECURITY;

-- Step 2: Drop all existing policies
DROP POLICY IF EXISTS "Allow public read access" ON gallery_items;
DROP POLICY IF EXISTS "Allow public insert" ON gallery_items;
DROP POLICY IF EXISTS "Allow public upload" ON gallery_items;
DROP POLICY IF EXISTS "Enable insert for all users" ON gallery_items;
DROP POLICY IF EXISTS "Enable read for all users" ON gallery_items;
DROP POLICY IF EXISTS "Enable delete for all users" ON gallery_items;
DROP POLICY IF EXISTS "Public can insert gallery items" ON gallery_items;
DROP POLICY IF EXISTS "Public can read gallery items" ON gallery_items;
DROP POLICY IF EXISTS "Public can delete gallery items" ON gallery_items;

-- Step 3: Create new permissive policies for all operations
-- These policies return TRUE for everyone (authenticated or anonymous)

-- Allow anyone to read gallery items
CREATE POLICY "Allow all to read gallery items"
ON gallery_items
FOR SELECT
TO public
USING (true);

-- Allow anyone to insert gallery items
CREATE POLICY "Allow all to insert gallery items"
ON gallery_items
FOR INSERT
TO public
WITH CHECK (true);

-- Allow anyone to update gallery items
CREATE POLICY "Allow all to update gallery items"
ON gallery_items
FOR UPDATE
TO public
USING (true)
WITH CHECK (true);

-- Allow anyone to delete gallery items
CREATE POLICY "Allow all to delete gallery items"
ON gallery_items
FOR DELETE
TO public
USING (true);

-- Step 4: Verify the policies were created
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'gallery_items';

-- Step 5: Verify RLS is enabled
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'gallery_items';
