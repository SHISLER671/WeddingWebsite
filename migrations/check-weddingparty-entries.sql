-- Check for "weddingparty" entries in seating_assignments
-- and verify they match ENTOURAGE guests

-- First, let's see what columns exist in seating_assignments
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'seating_assignments'
ORDER BY ordinal_position;

-- Check for any entries with "weddingparty" (case-insensitive)
SELECT 
  guest_name,
  email,
  table_number,
  source
FROM seating_assignments
WHERE LOWER(source) LIKE '%weddingparty%' 
   OR LOWER(source) LIKE '%wedding%party%'
   OR LOWER(source) = 'weddingparty'
ORDER BY guest_name;

-- Compare with ENTOURAGE entries
SELECT 
  guest_name,
  email,
  table_number,
  source
FROM seating_assignments
WHERE LOWER(source) LIKE '%entourage%'
   OR LOWER(source) = 'entourage'
ORDER BY guest_name;

