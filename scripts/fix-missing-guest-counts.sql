-- Fix all RSVPs with missing or zero guest_count values
-- This ensures the auto-assign algorithm uses correct party sizes

-- Update ALL RSVPs (not just attendance='yes') to have proper guest_count
UPDATE rsvps r
SET guest_count = COALESCE(ig.allowed_party_size, 1)
FROM invited_guests ig
WHERE r.invited_guest_id = ig.id
  AND (r.guest_count IS NULL OR r.guest_count = 0 OR r.guest_count < 1);

-- Show updated counts
SELECT 
  'Total RSVPs' as category,
  COUNT(*) as count
FROM rsvps
UNION ALL
SELECT 
  'RSVPs with guest_count > 0' as category,
  COUNT(*) as count
FROM rsvps
WHERE guest_count > 0
UNION ALL  
SELECT 
  'RSVPs with attendance=yes' as category,
  COUNT(*) as count
FROM rsvps
WHERE attendance = 'yes';
