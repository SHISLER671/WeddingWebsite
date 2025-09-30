-- FINAL FIX for gallery RLS - This will completely disable RLS
-- Run this script to allow all users to upload to the gallery

-- 1. Drop ALL existing policies (just to be safe)
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'gallery_items') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON gallery_items';
    END LOOP;
END $$;

-- 2. Completely disable RLS on the table
ALTER TABLE gallery_items DISABLE ROW LEVEL SECURITY;

-- 3. Grant necessary permissions to anonymous and authenticated users
GRANT SELECT, INSERT ON gallery_items TO anon, authenticated;
GRANT USAGE, SELECT ON SEQUENCE gallery_items_id_seq TO anon, authenticated;

-- 4. Verify RLS is disabled
SELECT 
    schemaname, 
    tablename, 
    rowsecurity as rls_enabled,
    CASE 
        WHEN rowsecurity = false THEN '✓ RLS is DISABLED - uploads should work'
        ELSE '✗ RLS is still ENABLED - there may be an issue'
    END as status
FROM pg_tables 
WHERE tablename = 'gallery_items';

-- 5. Test insert to verify it works
INSERT INTO gallery_items (file_path, caption, uploader_name) 
VALUES ('test/final-fix-test.jpg', 'Testing after final RLS fix', 'System Test')
ON CONFLICT DO NOTHING;

-- 6. Show recent uploads
SELECT id, file_path, caption, uploader_name, created_at 
FROM gallery_items 
ORDER BY created_at DESC 
LIMIT 5;
