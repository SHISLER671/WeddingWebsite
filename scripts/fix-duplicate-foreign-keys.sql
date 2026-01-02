-- Remove duplicate foreign key constraint from seating_assignments
-- This fixes the "more than one relationship was found" error

-- Step 1: Find duplicate foreign key constraints
SELECT
  tc.table_schema,
  tc.table_name,
  kcu.column_name,
  array_agg(tc.constraint_name) AS constraints,
  count(*) AS cnt
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
WHERE tc.table_name = 'seating_assignments'
  AND tc.constraint_type = 'FOREIGN KEY'
GROUP BY tc.table_schema, tc.table_name, kcu.column_name
HAVING count(*) > 1;

-- Step 2: Drop the duplicate constraint (the "new" one from table rename)
ALTER TABLE seating_assignments 
DROP CONSTRAINT IF EXISTS seating_assignments_new_invited_guest_id_fkey;

-- Step 3: Verify only one foreign key remains
SELECT
  tc.constraint_name,
  tc.table_schema,
  tc.table_name,
  kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
WHERE tc.table_name = 'seating_assignments'
  AND tc.constraint_type = 'FOREIGN KEY';
