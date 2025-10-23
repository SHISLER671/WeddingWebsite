-- Supabase Seating Assignments Setup Script
-- Run this in your Supabase SQL Editor to set up the seating assignment system

-- 1. Create the seating_assignments table
CREATE TABLE IF NOT EXISTS seating_assignments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  guest_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  table_number INTEGER NOT NULL,
  seat_number INTEGER NOT NULL,
  plus_one_name TEXT,
  plus_one_seat INTEGER,
  dietary_notes TEXT,
  special_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_seating_assignments_email ON seating_assignments(email);
CREATE INDEX IF NOT EXISTS idx_seating_assignments_table ON seating_assignments(table_number);
CREATE INDEX IF NOT EXISTS idx_seating_assignments_guest_name ON seating_assignments(guest_name);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE seating_assignments ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS policies

-- Policy 1: Allow public read access to seating assignments (for guests to see their seats)
CREATE POLICY "Allow public read access to seating assignments" ON seating_assignments
  FOR SELECT USING (true);

-- Policy 2: Allow updates to seating assignments (for admin management)
CREATE POLICY "Allow updates to seating assignments" ON seating_assignments
  FOR UPDATE USING (true);

-- Policy 3: Allow inserts to seating assignments (for admin setup)
CREATE POLICY "Allow inserts to seating assignments" ON seating_assignments
  FOR INSERT WITH CHECK (true);

-- 5. Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON seating_assignments TO anon, authenticated;
GRANT INSERT ON seating_assignments TO authenticated;
GRANT UPDATE ON seating_assignments TO authenticated;

-- 6. Create a function to get seating assignment by email
CREATE OR REPLACE FUNCTION get_seating_assignment(guest_email TEXT)
RETURNS TABLE (
  guest_name TEXT,
  email TEXT,
  table_number INTEGER,
  seat_number INTEGER,
  plus_one_name TEXT,
  plus_one_seat INTEGER,
  dietary_notes TEXT,
  special_notes TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    sa.guest_name,
    sa.email,
    sa.table_number,
    sa.seat_number,
    sa.plus_one_name,
    sa.plus_one_seat,
    sa.dietary_notes,
    sa.special_notes
  FROM seating_assignments sa
  WHERE sa.email = guest_email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Create a function to get all guests at a specific table
CREATE OR REPLACE FUNCTION get_table_guests(table_num INTEGER)
RETURNS TABLE (
  guest_name TEXT,
  email TEXT,
  seat_number INTEGER,
  plus_one_name TEXT,
  plus_one_seat INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    sa.guest_name,
    sa.email,
    sa.seat_number,
    sa.plus_one_name,
    sa.plus_one_seat
  FROM seating_assignments sa
  WHERE sa.table_number = table_num
  ORDER BY sa.seat_number;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Create a function to get seating statistics
CREATE OR REPLACE FUNCTION get_seating_stats()
RETURNS TABLE (
  total_guests BIGINT,
  total_tables BIGINT,
  guests_per_table BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*) as total_guests,
    COUNT(DISTINCT table_number) as total_tables,
    ROUND(COUNT(*)::DECIMAL / COUNT(DISTINCT table_number), 1) as guests_per_table
  FROM seating_assignments;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Create a trigger to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_seating_assignments_updated_at
  BEFORE UPDATE ON seating_assignments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 10. Sample data (replace with your actual guest list)
-- Example format for your guest list:
/*
INSERT INTO seating_assignments (guest_name, email, table_number, seat_number, plus_one_name, plus_one_seat, dietary_notes, special_notes) VALUES
('John Smith', 'john@example.com', 1, 1, 'Jane Smith', 2, 'Vegetarian', 'Close to dance floor'),
('Sarah Johnson', 'sarah@example.com', 1, 3, NULL, NULL, NULL, 'Family with kids'),
('Mike Wilson', 'mike@example.com', 2, 1, 'Lisa Wilson', 2, 'Gluten-free', 'Near exit for early departure'),
('Emily Davis', 'emily@example.com', 2, 3, NULL, NULL, 'Vegan', 'Photographer - needs easy access');
*/

-- Verification queries (run these to check setup)
-- SELECT * FROM seating_assignments ORDER BY table_number, seat_number;
-- SELECT * FROM get_seating_assignment('john@example.com');
-- SELECT * FROM get_table_guests(1);
-- SELECT * FROM get_seating_stats();
