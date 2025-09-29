-- Supabase Gallery Setup Script
-- Run this in your Supabase SQL Editor to set up the gallery feature

-- 1. Create the gallery_items table
CREATE TABLE IF NOT EXISTS gallery_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  file_path TEXT NOT NULL,
  caption TEXT,
  uploader_email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Add foreign key constraint to rsvps table (optional but recommended)
-- This ensures only users who have RSVP'd can upload
ALTER TABLE gallery_items 
ADD CONSTRAINT fk_gallery_uploader_email 
FOREIGN KEY (uploader_email) REFERENCES rsvps(email) 
ON DELETE CASCADE;

-- 3. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_gallery_items_created_at ON gallery_items(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_gallery_items_uploader_email ON gallery_items(uploader_email);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE gallery_items ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS policies

-- Policy 1: Allow public read access to all gallery items
CREATE POLICY "Allow public read access to gallery items" ON gallery_items
  FOR SELECT USING (true);

-- Policy 2: Allow authenticated users to insert gallery items
-- (This will be enforced by the application logic checking RSVP status)
CREATE POLICY "Allow authenticated users to insert gallery items" ON gallery_items
  FOR INSERT WITH CHECK (true);

-- Policy 3: Allow users to delete their own gallery items
CREATE POLICY "Allow users to delete their own gallery items" ON gallery_items
  FOR DELETE USING (uploader_email = current_setting('request.jwt.claims', true)::json->>'email');

-- 6. Create storage bucket (this needs to be done in Supabase Dashboard)
-- Go to Storage > Create Bucket
-- Bucket name: wedding-gallery
-- Public: Yes

-- 7. Create storage policies (run these after creating the bucket)

-- Policy 1: Allow public read access to gallery files
-- INSERT INTO storage.policies (name, definition, check_expression, bucket_id)
-- VALUES (
--   'Allow public read access to gallery files',
--   'true',
--   'true',
--   'wedding-gallery'
-- );

-- Policy 2: Allow authenticated users to upload files
-- INSERT INTO storage.policies (name, definition, check_expression, bucket_id)
-- VALUES (
--   'Allow authenticated users to upload gallery files',
--   'true',
--   'true',
--   'wedding-gallery'
-- );

-- Note: Storage policies need to be created through the Supabase Dashboard
-- Go to Storage > wedding-gallery > Policies and add:
-- 1. Public read policy: SELECT with condition: true
-- 2. Authenticated upload policy: INSERT with condition: true

-- 8. Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON gallery_items TO anon, authenticated;
GRANT INSERT ON gallery_items TO authenticated;
GRANT DELETE ON gallery_items TO authenticated;

-- 9. Create a function to check if user has RSVP'd (optional helper)
CREATE OR REPLACE FUNCTION user_has_rsvp(user_email TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM rsvps WHERE email = user_email
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. Add some sample data (optional - for testing)
-- INSERT INTO gallery_items (file_path, caption, uploader_email) VALUES
-- ('uploads/sample-1.jpg', 'Beautiful wedding moment', 'test@example.com'),
-- ('uploads/sample-2.jpg', 'Cake cutting ceremony', 'test@example.com');

-- Verification queries (run these to check setup)
-- SELECT * FROM gallery_items ORDER BY created_at DESC LIMIT 5;
-- SELECT COUNT(*) as total_items FROM gallery_items;
-- SELECT uploader_email, COUNT(*) as upload_count FROM gallery_items GROUP BY uploader_email;
