-- Add proper foreign key relationships to enable Supabase JOIN syntax
-- Step 1: Add foreign key to rsvps.invited_guest_id
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'rsvps_invited_guest_id_fkey'
      AND table_name = 'rsvps'
  ) THEN
    ALTER TABLE rsvps 
    ADD CONSTRAINT rsvps_invited_guest_id_fkey 
    FOREIGN KEY (invited_guest_id) 
    REFERENCES invited_guests(id) 
    ON DELETE CASCADE;

    RAISE NOTICE 'Added foreign key constraint to rsvps.invited_guest_id';
  ELSE
    RAISE NOTICE 'Foreign key constraint already exists on rsvps.invited_guest_id';
  END IF;
END $$;

-- Step 2: Populate invited_guest_id in rsvps where it's NULL
UPDATE rsvps r
SET invited_guest_id = ig.id
FROM invited_guests ig
WHERE r.invited_guest_id IS NULL
  AND (
    (r.guest_name IS NOT NULL AND r.guest_name = ig.guest_name)
    OR (r.email IS NOT NULL AND r.email != '' AND r.email = ig.email)
  );

-- Step 3: Ensure seating_assignments has proper foreign key
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'seating_assignments_invited_guest_id_fkey'
      AND table_name = 'seating_assignments'
  ) THEN
    ALTER TABLE seating_assignments 
    ADD CONSTRAINT seating_assignments_invited_guest_id_fkey 
    FOREIGN KEY (invited_guest_id) 
    REFERENCES invited_guests(id) 
    ON DELETE CASCADE;

    RAISE NOTICE 'Added foreign key constraint to seating_assignments.invited_guest_id';
  ELSE
    RAISE NOTICE 'Foreign key constraint already exists on seating_assignments.invited_guest_id';
  END IF;
END $$;

-- Step 4: Create indexes for better JOIN performance
CREATE INDEX IF NOT EXISTS idx_rsvps_invited_guest_id
ON rsvps (invited_guest_id);

CREATE INDEX IF NOT EXISTS idx_seating_invited_guest_id
ON seating_assignments (invited_guest_id);

-- Step 5: Show summary of relationships
SELECT 
  'invited_guests' as table_name,
  COUNT(*) as total_records
FROM invited_guests
UNION ALL
SELECT 
  'rsvps' as table_name,
  COUNT(*) as total_records
FROM rsvps
UNION ALL
SELECT 
  'rsvps with linked guest' as table_name,
  COUNT(*) as total_records
FROM rsvps
WHERE invited_guest_id IS NOT NULL
UNION ALL
SELECT 
  'seating_assignments' as table_name,
  COUNT(*) as total_records
FROM seating_assignments
UNION ALL
SELECT 
  'seating with linked guest' as table_name,
  COUNT(*) as total_records
FROM seating_assignments
WHERE invited_guest_id IS NOT NULL;
