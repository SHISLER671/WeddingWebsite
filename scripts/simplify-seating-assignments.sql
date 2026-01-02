-- Simplify seating_assignments table to only store table relationships
-- Remove redundant fields that exist in other tables

-- Step 1: Create a simplified new table structure
CREATE TABLE IF NOT EXISTS seating_assignments_new (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invited_guest_id uuid REFERENCES invited_guests(id) ON DELETE CASCADE,
  table_number integer NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Step 2: Migrate existing data by matching guest_name and email
INSERT INTO seating_assignments_new (invited_guest_id, table_number, created_at, updated_at)
SELECT 
  ig.id as invited_guest_id,
  sa.table_number,
  sa.created_at,
  sa.updated_at
FROM seating_assignments sa
INNER JOIN invited_guests ig ON (
  sa.guest_name = ig.guest_name 
  OR (sa.email IS NOT NULL AND sa.email = ig.email)
)
WHERE sa.table_number IS NOT NULL AND sa.table_number > 0
ON CONFLICT DO NOTHING;

-- Step 3: Drop old table and rename new one
DROP TABLE seating_assignments;
ALTER TABLE seating_assignments_new RENAME TO seating_assignments;

-- Step 4: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_seating_guest_id ON seating_assignments(invited_guest_id);
CREATE INDEX IF NOT EXISTS idx_seating_table_number ON seating_assignments(table_number);
CREATE UNIQUE INDEX IF NOT EXISTS idx_seating_unique_guest ON seating_assignments(invited_guest_id);

-- Step 5: Re-enable RLS
ALTER TABLE seating_assignments ENABLE ROW LEVEL SECURITY;

-- Step 6: Recreate RLS policies
DROP POLICY IF EXISTS "Allow public read access to seating assignments" ON seating_assignments;
DROP POLICY IF EXISTS "Allow inserts to seating assignments" ON seating_assignments;
DROP POLICY IF EXISTS "Allow updates to seating assignments" ON seating_assignments;

CREATE POLICY "Allow public read access to seating assignments"
  ON seating_assignments FOR SELECT
  USING (true);

CREATE POLICY "Allow inserts to seating assignments"
  ON seating_assignments FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow updates to seating assignments"
  ON seating_assignments FOR UPDATE
  USING (true);

-- Step 7: Add a trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION update_seating_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_seating_updated_at
BEFORE UPDATE ON seating_assignments
FOR EACH ROW
EXECUTE FUNCTION update_seating_updated_at();
