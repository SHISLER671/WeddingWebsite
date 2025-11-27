-- Fix "EMPTY" string values in special_notes column
-- This script converts all "EMPTY" string values (case-insensitive, with/without whitespace) to NULL

-- First, let's see what we're working with
SELECT 
  COUNT(*) as total_rows,
  COUNT(CASE WHEN special_notes IS NULL THEN 1 END) as null_count,
  COUNT(CASE WHEN UPPER(TRIM(special_notes)) = 'EMPTY' THEN 1 END) as empty_string_count,
  COUNT(CASE WHEN special_notes IS NOT NULL AND UPPER(TRIM(special_notes)) != 'EMPTY' THEN 1 END) as other_values_count
FROM public.seating_assignments;

-- Show what will be updated (for verification)
SELECT 
  id,
  guest_name,
  special_notes as current_value,
  'Will be set to NULL' as action
FROM public.seating_assignments
WHERE special_notes IS NOT NULL 
  AND UPPER(TRIM(special_notes)) = 'EMPTY'
LIMIT 10;

-- Update all "EMPTY" strings to NULL (case-insensitive, handles whitespace)
UPDATE public.seating_assignments
SET special_notes = NULL
WHERE special_notes IS NOT NULL 
  AND UPPER(TRIM(special_notes)) = 'EMPTY';

-- Verify the fix
SELECT 
  COUNT(*) as total_rows,
  COUNT(CASE WHEN special_notes IS NULL THEN 1 END) as null_count,
  COUNT(CASE WHEN UPPER(TRIM(special_notes)) = 'EMPTY' THEN 1 END) as empty_string_count,
  COUNT(CASE WHEN special_notes IS NOT NULL AND UPPER(TRIM(special_notes)) != 'EMPTY' THEN 1 END) as other_values_count
FROM public.seating_assignments;

-- Show all remaining non-NULL values
SELECT DISTINCT special_notes
FROM public.seating_assignments
WHERE special_notes IS NOT NULL
ORDER BY special_notes;
