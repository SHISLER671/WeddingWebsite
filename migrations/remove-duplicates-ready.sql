-- ============================================
-- STEP 1: Preview what will be KEPT vs DELETED
-- ============================================
-- Run this first to see which records will be kept and which will be deleted

WITH duplicates AS (
  SELECT 
    id,
    guest_name,
    email,
    table_number,
    ROW_NUMBER() OVER (
      PARTITION BY LOWER(TRIM(guest_name))
      ORDER BY 
        CASE WHEN table_number > 0 THEN 1 ELSE 2 END, -- Keep assigned tables first
        table_number DESC, -- Keep highest table number
        id DESC -- Keep most recent if all else equal
    ) as row_num
  FROM seating_assignments
)
SELECT 
  CASE 
    WHEN row_num = 1 THEN '✅ KEEP'
    ELSE '❌ DELETE'
  END as action,
  id,
  guest_name,
  email,
  table_number,
  row_num
FROM duplicates
WHERE id IN (
  SELECT id FROM duplicates WHERE row_num > 1
  UNION
  SELECT id FROM duplicates d2 
  WHERE d2.row_num = 1 
  AND EXISTS (
    SELECT 1 FROM duplicates d3 
    WHERE LOWER(TRIM(d3.guest_name)) = LOWER(TRIM(d2.guest_name)) 
    AND d3.row_num > 1
  )
)
ORDER BY LOWER(TRIM(guest_name)), row_num;

-- ============================================
-- STEP 2: Count how many will be deleted
-- ============================================
SELECT 
  COUNT(*) as records_to_delete,
  COUNT(DISTINCT LOWER(TRIM(guest_name))) as unique_guest_names_affected
FROM (
  SELECT 
    id,
    guest_name,
    ROW_NUMBER() OVER (
      PARTITION BY LOWER(TRIM(guest_name))
      ORDER BY 
        CASE WHEN table_number > 0 THEN 1 ELSE 2 END,
        table_number DESC,
        id DESC
    ) as row_num
  FROM seating_assignments
) duplicates
WHERE row_num > 1;

-- ============================================
-- STEP 3: DELETE the duplicates
-- ============================================
-- ⚠️  WARNING: This will permanently delete duplicate records!
-- Make sure you've reviewed Step 1 and Step 2 above first.
-- 
-- This keeps ONE record per guest_name (the one with highest table_number,
-- or most recent if unassigned) and deletes all other duplicates.

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

-- ============================================
-- STEP 4: Verify duplicates are gone
-- ============================================
SELECT 
  'Duplicates by name' as check_type,
  COUNT(*) as duplicate_count
FROM (
  SELECT LOWER(TRIM(guest_name)) as normalized_name
  FROM seating_assignments
  GROUP BY LOWER(TRIM(guest_name))
  HAVING COUNT(*) > 1
) name_dups;

-- Should return 0 duplicates if successful!

