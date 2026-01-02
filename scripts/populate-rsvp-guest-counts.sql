-- Ensure all RSVPs have proper guest_count values
-- This is critical for the auto-assign algorithm to work correctly

-- Update RSVPs where guest_count is NULL or 0
-- Use the allowed_party_size from invited_guests as the default
UPDATE rsvps r
SET guest_count = COALESCE(ig.allowed_party_size, 1)
FROM invited_guests ig
WHERE r.invited_guest_id = ig.id
  AND (r.guest_count IS NULL OR r.guest_count = 0)
  AND r.attendance = 'yes';

-- Show the results
SELECT 
  'RSVPs updated' as status,
  COUNT(*) as count
FROM rsvps
WHERE guest_count > 0 AND attendance = 'yes';
