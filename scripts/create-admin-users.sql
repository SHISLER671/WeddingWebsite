-- Create admin users for wedding dashboard
-- This script will populate the admin_users table with the three required users

-- First, clear any existing admin users to avoid conflicts
DELETE FROM admin_users;

-- Insert the three admin users with their specified passwords
-- Note: In a real application, passwords should be properly hashed
-- For this wedding site, using simple password storage as requested

INSERT INTO admin_users (user_type, password_hash, salt) VALUES 
('GROOM', 'GR00M', 'wedding2026'),
('BRIDE', 'BR1D3', 'wedding2026'), 
('PLANNER', 'PLANN3R', 'wedding2026');

-- Verify the admin users were created
SELECT id, user_type, created_at FROM admin_users ORDER BY user_type;
