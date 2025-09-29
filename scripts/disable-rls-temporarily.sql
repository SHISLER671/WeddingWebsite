-- TEMPORARY FIX: Disable RLS completely to test gallery upload
-- Run this in your Supabase SQL Editor

-- 1. Disable RLS on gallery_items table
ALTER TABLE gallery_items DISABLE ROW LEVEL SECURITY;

-- 2. Verify RLS is disabled
SELECT 
  schemaname, 
  tablename, 
  rowsecurity 
FROM pg_tables 
WHERE tablename = 'gallery_items';

-- 3. Test insert to make sure it works
INSERT INTO gallery_items (file_path, caption, uploader_email) 
VALUES ('test/test.jpg', 'Test caption - RLS disabled', 'test@example.com');

-- 4. Check if the insert worked
SELECT * FROM gallery_items ORDER BY created_at DESC LIMIT 5;

-- If this works, the gallery upload should work on your website!
-- You can re-enable RLS later with proper policies if needed
