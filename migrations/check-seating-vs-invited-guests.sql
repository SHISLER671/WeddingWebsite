-- Check for seating assignments that don't match invited_guests
-- Run this to see what's out of sync

-- ============================================
-- Seating assignments NOT in invited_guests
-- ============================================
SELECT 
  sa.id,
  sa.guest_name,
  sa.email,
  sa.table_number,
  'Not in invited_guests' as status
FROM seating_assignments sa
WHERE NOT EXISTS (
  SELECT 1 
  FROM invited_guests ig
  WHERE LOWER(TRIM(ig.guest_name)) = LOWER(TRIM(sa.guest_name))
)
ORDER BY sa.guest_name;

-- ============================================
-- Count summary
-- ============================================
SELECT 
  'Total invited_guests' as metric,
  COUNT(*) as count
FROM invited_guests

UNION ALL

SELECT 
  'Total seating_assignments' as metric,
  COUNT(*) as count
FROM seating_assignments

UNION ALL

SELECT 
  'Seating assignments NOT in invited_guests' as metric,
  COUNT(*) as count
FROM seating_assignments sa
WHERE NOT EXISTS (
  SELECT 1 
  FROM invited_guests ig
  WHERE LOWER(TRIM(ig.guest_name)) = LOWER(TRIM(sa.guest_name))
)

UNION ALL

SELECT 
  'Invited guests NOT in seating_assignments' as metric,
  COUNT(*) as count
FROM invited_guests ig
WHERE NOT EXISTS (
  SELECT 1 
  FROM seating_assignments sa
  WHERE LOWER(TRIM(sa.guest_name)) = LOWER(TRIM(ig.guest_name))
);

