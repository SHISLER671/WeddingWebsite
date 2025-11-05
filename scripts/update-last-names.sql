-- Batch Update Last Names Script
-- Use this to update guest names as you get the last names
-- Run in Supabase SQL Editor
-- 
-- Instructions:
-- 1. Copy the UPDATE statements below
-- 2. Replace the placeholder names with actual full names
-- 3. Run in Supabase SQL Editor
-- 4. Add more UPDATE statements as needed

-- Example updates - replace with your actual data:
-- UPDATE seating_assignments 
-- SET guest_name = 'David Smith' 
-- WHERE email = 'david.pending@pending.wedding';

-- UPDATE seating_assignments 
-- SET guest_name = 'Jack Johnson' 
-- WHERE email = 'jack.pending@pending.wedding';

-- UPDATE seating_assignments 
-- SET guest_name = 'Bri Martinez' 
-- WHERE email = 'bri.pending@pending.wedding';

-- Add more UPDATE statements as you get last names
-- Format: UPDATE seating_assignments SET guest_name = 'Full Name' WHERE email = 'placeholder@pending.wedding';

-- ============================================
-- BATCH UPDATE EXAMPLE (Multiple names at once)
-- ============================================
-- UPDATE seating_assignments 
-- SET guest_name = CASE
--   WHEN email = 'david.pending@pending.wedding' THEN 'David Smith'
--   WHEN email = 'jack.pending@pending.wedding' THEN 'Jack Johnson'
--   WHEN email = 'bri.pending@pending.wedding' THEN 'Bri Martinez'
--   WHEN email = 'luke.pending@pending.wedding' THEN 'Luke Williams'
--   WHEN email = 'sylv.pending@pending.wedding' THEN 'Sylv Brown'
--   -- Add more WHEN clauses as needed
-- END
-- WHERE email IN (
--   'david.pending@pending.wedding',
--   'jack.pending@pending.wedding',
--   'bri.pending@pending.wedding',
--   'luke.pending@pending.wedding',
--   'sylv.pending@pending.wedding'
--   -- Add more emails here
-- );

-- ============================================
-- QUERY: Find all guests still needing last names
-- ============================================
-- SELECT guest_name, email, special_notes 
-- FROM seating_assignments 
-- WHERE guest_name LIKE '%[LAST NAME]%' 
-- ORDER BY guest_name;

-- ============================================
-- UPDATE TABLE NUMBERS (when ready)
-- ============================================
-- UPDATE seating_assignments 
-- SET table_number = 1 
-- WHERE email = 'john.weisenberger@pending.wedding';

-- UPDATE seating_assignments 
-- SET table_number = 1 
-- WHERE email = 'elizabeth.weisenberger@pending.wedding';

-- ============================================
-- UPDATE REAL EMAILS (when guests RSVP)
-- ============================================
-- UPDATE seating_assignments 
-- SET email = 'real.email@example.com' 
-- WHERE guest_name = 'John Smith' AND email LIKE '%@pending.wedding';

-- ============================================
-- UPDATE MULTIPLE FIELDS AT ONCE
-- ============================================
-- UPDATE seating_assignments 
-- SET 
--   guest_name = 'David Smith',
--   table_number = 5,
--   seat_number = 3
-- WHERE email = 'david.pending@pending.wedding';

