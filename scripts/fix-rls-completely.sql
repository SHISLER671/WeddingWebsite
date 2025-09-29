-- COMPLETE FIX for RLS error - Run this in Supabase SQL Editor
-- This will completely disable RLS and remove all constraints

-- 1. First, let's see what's currently on the table
SELECT * FROM information_schema.tables WHERE table_name = 'gallery_items';

-- 2. Check current RLS status
SELECT schemaname, tablename, rowsecurity FROM pg_tables WHERE tablename = 'gallery_items';

-- 3. Check all policies
SELECT policyname, cmd, permissive, roles, qual, with_check 
FROM pg_policies WHERE tablename = 'gallery_items';

-- 4. Drop ALL policies
DROP POLICY IF EXISTS "Allow public read access to gallery items" ON gallery_items;
DROP POLICY IF EXISTS "Allow authenticated users to insert gallery items" ON gallery_items;
DROP POLICY IF EXISTS "Allow anyone to insert gallery items" ON gallery_items;
DROP POLICY IF EXISTS "Allow users to delete their own gallery items" ON gallery_items;
DROP POLICY IF EXISTS "gallery_select_policy" ON gallery_items;
DROP POLICY IF EXISTS "gallery_insert_policy" ON gallery_items;
DROP POLICY IF EXISTS "gallery_update_policy" ON gallery_items;
DROP POLICY IF EXISTS "gallery_delete_policy" ON gallery_items;
DROP POLICY IF EXISTS "Allow all operations on gallery_items" ON gallery_items;

-- 5. Drop ALL foreign key constraints
ALTER TABLE gallery_items DROP CONSTRAINT IF EXISTS fk_gallery_uploader_email;

-- 6. Completely disable RLS
ALTER TABLE gallery_items DISABLE ROW LEVEL SECURITY;

-- 7. Verify RLS is disabled
SELECT schemaname, tablename, rowsecurity FROM pg_tables WHERE tablename = 'gallery_items';

-- 8. Test insert - this should work now
INSERT INTO gallery_items (file_path, caption, uploader_name) 
VALUES ('test/working-upload.jpg', 'This should work now!', 'Test User');

-- 9. Check if the insert worked
SELECT * FROM gallery_items ORDER BY created_at DESC LIMIT 3;

-- 10. If you want to be extra sure, also check the table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'gallery_items' 
ORDER BY ordinal_position;
