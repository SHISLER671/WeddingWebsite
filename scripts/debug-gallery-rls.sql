-- Debug script to check current RLS policies and fix the issue
-- Run this in your Supabase SQL Editor

-- 1. Check if RLS is enabled and what policies exist
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

-- 2. Check if RLS is enabled on the table
SELECT 
  schemaname, 
  tablename, 
  rowsecurity 
FROM pg_tables 
WHERE tablename = 'gallery_items';

-- 3. Check table structure and constraints
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns 
WHERE table_name = 'gallery_items' 
ORDER BY ordinal_position;

-- 4. Drop ALL existing policies to start fresh
DROP POLICY IF EXISTS "Allow public read access to gallery items" ON gallery_items;
DROP POLICY IF EXISTS "Allow authenticated users to insert gallery items" ON gallery_items;
DROP POLICY IF EXISTS "Allow anyone to insert gallery items" ON gallery_items;
DROP POLICY IF EXISTS "Allow users to delete their own gallery items" ON gallery_items;
DROP POLICY IF EXISTS "Allow public read access to gallery files" ON gallery_items;
DROP POLICY IF EXISTS "Allow authenticated users to upload gallery files" ON gallery_items;

-- 5. Temporarily disable RLS to test
ALTER TABLE gallery_items DISABLE ROW LEVEL SECURITY;

-- 6. Test insert (this should work now)
INSERT INTO gallery_items (file_path, caption, uploader_email) 
VALUES ('test/test.jpg', 'Test caption', 'test@example.com');

-- 7. If the test insert works, re-enable RLS with permissive policies
ALTER TABLE gallery_items ENABLE ROW LEVEL SECURITY;

-- 8. Create very permissive policies
CREATE POLICY "gallery_select_policy" ON gallery_items
  FOR SELECT USING (true);

CREATE POLICY "gallery_insert_policy" ON gallery_items
  FOR INSERT WITH CHECK (true);

CREATE POLICY "gallery_update_policy" ON gallery_items
  FOR UPDATE USING (true);

CREATE POLICY "gallery_delete_policy" ON gallery_items
  FOR DELETE USING (true);

-- 9. Check foreign key constraints that might be causing issues
SELECT 
  tc.constraint_name, 
  tc.table_name, 
  kcu.column_name, 
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_name = 'gallery_items';

-- 10. If foreign key is causing issues, temporarily drop it
-- ALTER TABLE gallery_items DROP CONSTRAINT IF EXISTS fk_gallery_uploader_email;

-- 11. Verify policies are created
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  permissive, 
  roles, 
  cmd
FROM pg_policies 
WHERE tablename = 'gallery_items';
