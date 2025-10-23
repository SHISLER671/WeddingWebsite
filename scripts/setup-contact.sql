-- Supabase Contact Form Setup Script
-- Run this in your Supabase SQL Editor to set up the contact form feature

-- 1. Create the contact_messages table
CREATE TABLE IF NOT EXISTS contact_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'read', 'replied', 'archived'))
);

-- 2. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_contact_messages_created_at ON contact_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_messages_status ON contact_messages(status);
CREATE INDEX IF NOT EXISTS idx_contact_messages_email ON contact_messages(email);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS policies

-- Policy 1: Allow public read access to contact messages (for admin viewing)
CREATE POLICY "Allow public read access to contact messages" ON contact_messages
  FOR SELECT USING (true);

-- Policy 2: Allow anyone to insert contact messages
CREATE POLICY "Allow anyone to insert contact messages" ON contact_messages
  FOR INSERT WITH CHECK (true);

-- Policy 3: Allow updates to contact messages (for status changes)
CREATE POLICY "Allow updates to contact messages" ON contact_messages
  FOR UPDATE USING (true);

-- 5. Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON contact_messages TO anon, authenticated;
GRANT INSERT ON contact_messages TO anon, authenticated;
GRANT UPDATE ON contact_messages TO authenticated;

-- 6. Create a function to get contact message statistics (optional helper)
CREATE OR REPLACE FUNCTION get_contact_stats()
RETURNS TABLE (
  total_messages BIGINT,
  new_messages BIGINT,
  read_messages BIGINT,
  replied_messages BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*) as total_messages,
    COUNT(*) FILTER (WHERE status = 'new') as new_messages,
    COUNT(*) FILTER (WHERE status = 'read') as read_messages,
    COUNT(*) FILTER (WHERE status = 'replied') as replied_messages
  FROM contact_messages;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Create a function to mark messages as read (optional helper)
CREATE OR REPLACE FUNCTION mark_message_read(message_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE contact_messages 
  SET status = 'read' 
  WHERE id = message_id;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Verification queries (run these to check setup)
-- SELECT * FROM contact_messages ORDER BY created_at DESC LIMIT 5;
-- SELECT COUNT(*) as total_messages FROM contact_messages;
-- SELECT status, COUNT(*) as count FROM contact_messages GROUP BY status;
-- SELECT * FROM get_contact_stats();
