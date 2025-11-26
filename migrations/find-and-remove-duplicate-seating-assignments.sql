-- Find and Remove Duplicate Seating Assignments
-- Run this in your Supabase SQL Editor

-- ============================================
-- STEP 1: Find duplicates by guest_name
-- ============================================
-- This will show you all duplicate entries grouped by guest_name
SELECT 
  guest_name,
  COUNT(*) as duplicate_count,
  STRING_AGG(id::text, ', ') as ids,
  STRING_AGG(email::text, ', ') as emails,
  STRING_AGG(table_number::text, ', ') as table_numbers
FROM seating_assignments
GROUP BY guest_name
HAVING COUNT(*) > 1
ORDER BY duplicate_count DESC, guest_name;

-- ============================================
-- STEP 2: Find duplicates by email (if email exists)
-- ============================================
-- This will show duplicates where email is not null/empty
SELECT 
  email,
  COUNT(*) as duplicate_count,
  STRING_AGG(id::text, ', ') as ids,
  STRING_AGG(guest_name, ', ') as guest_names,
  STRING_AGG(table_number::text, ', ') as table_numbers
FROM seating_assignments
WHERE email IS NOT NULL AND email != ''
GROUP BY email
HAVING COUNT(*) > 1
ORDER BY duplicate_count DESC, email;

-- ============================================
-- STEP 3: Find duplicates by guest_name + email combination
-- ============================================
-- This finds exact duplicates (same name AND same email)
SELECT 
  guest_name,
  email,
  COUNT(*) as duplicate_count,
  STRING_AGG(id::text, ', ') as ids,
  STRING_AGG(table_number::text, ', ') as table_numbers
FROM seating_assignments
GROUP BY guest_name, email
HAVING COUNT(*) > 1
ORDER BY duplicate_count DESC, guest_name;

-- ============================================
-- STEP 4: Remove duplicates by guest_name
-- ============================================
-- This keeps the record with the highest table_number (or lowest if all are 0)
-- and removes the rest. Adjust the ORDER BY if you want different logic.
-- 
-- WARNING: Review the duplicates above before running this!
-- Uncomment the DELETE line after reviewing the CTE results.

WITH duplicates AS (
  SELECT 
    id,
    guest_name,
    ROW_NUMBER() OVER (
      PARTITION BY LOWER(TRIM(guest_name))
      ORDER BY 
        CASE WHEN table_number > 0 THEN 1 ELSE 2 END, -- Keep assigned tables first
        table_number DESC, -- Keep highest table number
        id DESC -- Keep most recent if all else equal
    ) as row_num
  FROM seating_assignments
)
-- First, see what will be deleted:
SELECT 
  id,
  guest_name,
  'Will be deleted' as action
FROM duplicates
WHERE row_num > 1
ORDER BY guest_name, id;

-- If the above looks correct, uncomment the DELETE below:
/*
DELETE FROM seating_assignments
WHERE id IN (
  SELECT id
  FROM (
    SELECT 
      id,
      ROW_NUMBER() OVER (
        PARTITION BY LOWER(TRIM(guest_name))
        ORDER BY 
          CASE WHEN table_number > 0 THEN 1 ELSE 2 END,
          table_number DESC,
          id DESC
      ) as row_num
    FROM seating_assignments
  ) duplicates
  WHERE row_num > 1
);
*/

-- ============================================
-- ALTERNATIVE: Remove duplicates by email (if email exists)
-- ============================================
-- Use this if you want to deduplicate by email instead
-- This keeps one record per email address

WITH email_duplicates AS (
  SELECT 
    sa.id,
    sa.email,
    sa.guest_name,
    sa.table_number,
    ROW_NUMBER() OVER (
      PARTITION BY LOWER(TRIM(sa.email))
      ORDER BY 
        CASE WHEN sa.table_number > 0 THEN 1 ELSE 2 END,
        sa.table_number DESC,
        sa.id DESC
    ) as row_num
  FROM seating_assignments sa
  WHERE sa.email IS NOT NULL AND sa.email != ''
)
-- First, see what will be deleted:
SELECT 
  id,
  email,
  guest_name,
  'Will be deleted' as action
FROM email_duplicates
WHERE row_num > 1
ORDER BY email, id;

-- If the above looks correct, uncomment the DELETE below:
/*
DELETE FROM seating_assignments
WHERE id IN (
  SELECT id
  FROM (
    SELECT 
      id,
      ROW_NUMBER() OVER (
        PARTITION BY LOWER(TRIM(email))
        ORDER BY 
          CASE WHEN table_number > 0 THEN 1 ELSE 2 END,
          table_number DESC,
          id DESC
      ) as row_num
    FROM seating_assignments
    WHERE email IS NOT NULL AND email != ''
  ) duplicates
  WHERE row_num > 1
);
*/

-- ============================================
-- FINAL CHECK: Verify no duplicates remain
-- ============================================
SELECT 
  'Duplicates by name' as check_type,
  COUNT(*) as duplicate_count
FROM (
  SELECT LOWER(TRIM(guest_name)) as normalized_name
  FROM seating_assignments
  GROUP BY LOWER(TRIM(guest_name))
  HAVING COUNT(*) > 1
) name_dups

UNION ALL

SELECT 
  'Duplicates by email' as check_type,
  COUNT(*) as duplicate_count
FROM (
  SELECT LOWER(TRIM(email)) as normalized_email
  FROM seating_assignments
  WHERE email IS NOT NULL AND email != ''
  GROUP BY LOWER(TRIM(email))
  HAVING COUNT(*) > 1
) email_dups;

