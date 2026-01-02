-- Migrate seating data to rsvps table and eliminate seating_assignments
-- This simplifies the architecture to use a single source of truth

-- Step 1: Add table_number column to rsvps if it doesn't exist
ALTER TABLE rsvps 
ADD COLUMN IF NOT EXISTS table_number integer DEFAULT 0;

-- Step 2: Create RSVP records for entourage members who don't have them yet
-- Fixed NOT NULL constraint on email by using unique placeholder emails
INSERT INTO rsvps (invited_guest_id, guest_name, email, attendance, guest_count, table_number)
SELECT 
  ig.id,
  ig.guest_name,
  COALESCE(NULLIF(ig.email, ''), 'no-email+' || ig.id::text || '@wedding.invalid') AS email, -- Generate unique placeholder for missing emails
  'yes', -- Entourage are pre-confirmed
  ig.allowed_party_size,
  sa.table_number
FROM invited_guests ig
INNER JOIN seating_assignments sa ON sa.invited_guest_id = ig.id
WHERE ig.is_entourage = true
  AND NOT EXISTS (
    SELECT 1 FROM rsvps r 
    WHERE r.invited_guest_id = ig.id
       OR (ig.email IS NOT NULL AND ig.email <> '' AND r.email = ig.email)
  )
  AND sa.table_number IS NOT NULL
  AND sa.table_number > 0;

-- Step 3: Migrate existing seating assignments to rsvps for guests with RSVPs
UPDATE rsvps r
SET table_number = sa.table_number
FROM seating_assignments sa
WHERE r.invited_guest_id = sa.invited_guest_id
  AND sa.table_number IS NOT NULL
  AND sa.table_number > 0
  AND (r.table_number IS NULL OR r.table_number = 0);

-- Step 4: Show results before dropping table
SELECT 
  'RSVPs with table assignments' as status,
  COUNT(*) as count
FROM rsvps
WHERE table_number IS NOT NULL AND table_number > 0;

-- Step 5: Drop the seating_assignments table (we don't need it anymore!)
DROP TABLE IF EXISTS seating_assignments CASCADE;

-- Step 6: Create index for performance
CREATE INDEX IF NOT EXISTS idx_rsvps_table_number ON rsvps(table_number);

-- Step 7: Verify the simplified structure
SELECT 
  'Summary' as info,
  COUNT(*) as total_rsvps,
  COUNT(*) FILTER (WHERE table_number > 0) as with_table_assigned,
  COUNT(*) FILTER (WHERE table_number > 0 AND attendance = 'yes') as attending_with_table
FROM rsvps;
