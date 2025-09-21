-- Add RLS policy to allow anonymous users to insert RSVPs
-- Enable RLS on rsvps table (if not already enabled)
ALTER TABLE rsvps ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anonymous users to insert RSVPs
CREATE POLICY "Allow anonymous RSVP submissions" ON rsvps
FOR INSERT 
TO anon
WITH CHECK (true);

-- Create policy to allow anonymous users to read their own RSVPs (optional, for confirmation)
CREATE POLICY "Allow anonymous RSVP reads" ON rsvps
FOR SELECT 
TO anon
USING (true);
