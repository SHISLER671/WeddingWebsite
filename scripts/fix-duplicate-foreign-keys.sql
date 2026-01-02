-- Remove duplicate foreign key constraint from seating_assignments
-- Keep only one foreign key to invited_guests

-- Drop the old constraint from the table rename
ALTER TABLE seating_assignments 
DROP CONSTRAINT IF EXISTS seating_assignments_new_invited_guest_id_fkey;

-- Verify only one foreign key remains
SELECT 
  constraint_name,
  table_name,
  column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
  ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'seating_assignments'
  AND tc.constraint_type = 'FOREIGN KEY';
