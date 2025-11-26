-- Fix alphabetical sorting issue in Supabase UI
-- PostgreSQL's default sorting uses byte order which can cause grouping issues
-- Use these queries for proper alphabetical sorting

-- ============================================
-- Option 1: Pure alphabetical sort (case-insensitive)
-- ============================================
SELECT *
FROM seating_assignments
ORDER BY LOWER(TRIM(guest_name)) ASC;

-- ============================================
-- Option 2: Sort by table first, then alphabetically
-- ============================================
SELECT *
FROM seating_assignments
ORDER BY 
  CASE WHEN table_number > 0 THEN 1 ELSE 2 END, -- Assigned tables first
  table_number ASC,
  LOWER(TRIM(guest_name)) ASC;

-- ============================================
-- Option 3: Use case-insensitive collation (if available)
-- ============================================
SELECT *
FROM seating_assignments
ORDER BY guest_name COLLATE "en_US" ASC;

-- ============================================
-- To create a view with proper sorting (permanent solution):
-- ============================================
-- CREATE OR REPLACE VIEW seating_assignments_sorted AS
-- SELECT *
-- FROM seating_assignments
-- ORDER BY LOWER(TRIM(guest_name)) ASC;

