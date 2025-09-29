-- Update gallery schema to remove email requirement and make it open for all
-- Run this in your Supabase SQL Editor

-- 1. Drop the foreign key constraint that was causing issues
ALTER TABLE gallery_items DROP CONSTRAINT IF EXISTS fk_gallery_uploader_email;

-- 2. Rename the email column to name (optional step)
-- ALTER TABLE gallery_items RENAME COLUMN uploader_email TO uploader_name;

-- 3. Or add a new name column and keep email for now
ALTER TABLE gallery_items ADD COLUMN IF NOT EXISTS uploader_name TEXT;

-- 4. Update existing records to have a name if they don't
UPDATE gallery_items 
SET uploader_name = COALESCE(uploader_name, 'Anonymous')
WHERE uploader_name IS NULL;

-- 5. Make uploader_name NOT NULL with a default
ALTER TABLE gallery_items ALTER COLUMN uploader_name SET DEFAULT 'Anonymous';
ALTER TABLE gallery_items ALTER COLUMN uploader_name SET NOT NULL;

-- 6. Disable RLS temporarily to allow open uploads
ALTER TABLE gallery_items DISABLE ROW LEVEL SECURITY;

-- 7. Test insert to make sure it works
INSERT INTO gallery_items (file_path, caption, uploader_name) 
VALUES ('test/open-upload.jpg', 'Test open upload', 'Test User');

-- 8. Check if it worked
SELECT * FROM gallery_items ORDER BY created_at DESC LIMIT 3;

-- 9. If you want to keep RLS enabled later, you can re-enable it with permissive policies:
-- ALTER TABLE gallery_items ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Allow all operations on gallery_items" ON gallery_items
--   FOR ALL USING (true) WITH CHECK (true);
