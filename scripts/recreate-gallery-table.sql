-- NUCLEAR OPTION: Recreate the gallery_items table completely
-- Run this if the above script doesn't work

-- 1. Drop the existing table completely
DROP TABLE IF EXISTS gallery_items CASCADE;

-- 2. Recreate the table with a simple structure
CREATE TABLE gallery_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  file_path TEXT NOT NULL,
  caption TEXT,
  uploader_name TEXT DEFAULT 'Anonymous',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create indexes for performance
CREATE INDEX idx_gallery_items_created_at ON gallery_items(created_at DESC);
CREATE INDEX idx_gallery_items_uploader_name ON gallery_items(uploader_name);

-- 4. DO NOT enable RLS - keep it disabled for open access
-- ALTER TABLE gallery_items ENABLE ROW LEVEL SECURITY; -- DON'T RUN THIS

-- 5. Test insert
INSERT INTO gallery_items (file_path, caption, uploader_name) 
VALUES ('test/recreated-table.jpg', 'Table recreated successfully!', 'Test User');

-- 6. Verify it worked
SELECT * FROM gallery_items ORDER BY created_at DESC LIMIT 3;

-- 7. Check table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'gallery_items' 
ORDER BY ordinal_position;
