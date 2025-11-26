-- Check for case variations and special characters in guest names
-- This will help identify why names are grouping separately

-- Check first character of each name
SELECT 
  guest_name,
  LEFT(guest_name, 1) as first_char,
  ASCII(LEFT(guest_name, 1)) as ascii_value,
  table_number
FROM seating_assignments
ORDER BY guest_name
LIMIT 50;

-- Check if there are any hidden characters or spaces
SELECT 
  guest_name,
  LENGTH(guest_name) as name_length,
  LENGTH(TRIM(guest_name)) as trimmed_length,
  table_number
FROM seating_assignments
WHERE LENGTH(guest_name) != LENGTH(TRIM(guest_name))
ORDER BY guest_name;

-- Check for names that start with different characters but should be together
-- (e.g., names starting with "A" that might have different ASCII values)
SELECT 
  guest_name,
  LEFT(guest_name, 1) as first_char,
  ASCII(LEFT(guest_name, 1)) as ascii_value
FROM seating_assignments
WHERE UPPER(LEFT(guest_name, 1)) = 'A'
ORDER BY guest_name;

-- The real issue: PostgreSQL's default collation sorts by byte order
-- Use this query for proper alphabetical sorting:
SELECT *
FROM seating_assignments
ORDER BY 
  LOWER(TRIM(guest_name)) COLLATE "C" ASC,
  table_number ASC;

