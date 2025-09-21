-- Fix RSVP RLS policies - Version 2
-- This script handles potential conflicts and ensures proper policies

-- First, drop existing policies if they exist (ignore errors if they don't exist)
DROP POLICY IF EXISTS "Allow anonymous RSVP submissions" ON rsvps;
DROP POLICY IF EXISTS "Allow anonymous RSVP reads" ON rsvps;

-- Enable RLS on rsvps table (if not already enabled)
ALTER TABLE rsvps ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anonymous users to insert RSVPs
CREATE POLICY "Allow anonymous RSVP submissions" ON rsvps
FOR INSERT 
TO anon, authenticated
WITH CHECK (true);

-- Create policy to allow reading RSVPs (for admin purposes)
CREATE POLICY "Allow RSVP reads" ON rsvps
FOR SELECT 
TO anon, authenticated
USING (true);

-- Grant necessary permissions to anon role
GRANT INSERT ON rsvps TO anon;
GRANT SELECT ON rsvps TO anon;

-- Also grant to authenticated users
GRANT INSERT ON rsvps TO authenticated;
GRANT SELECT ON rsvps TO authenticated;
