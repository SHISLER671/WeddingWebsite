-- Add is_entourage boolean column to invited_guests table
ALTER TABLE invited_guests 
ADD COLUMN IF NOT EXISTS is_entourage BOOLEAN DEFAULT FALSE;

-- Update existing records to set is_entourage based on source field
UPDATE invited_guests 
SET is_entourage = TRUE 
WHERE source ILIKE '%ENTOURAGE%' OR source ILIKE '%KIDENTOURAGE%';

-- Create an index for faster queries
CREATE INDEX IF NOT EXISTS idx_invited_guests_is_entourage 
ON invited_guests(is_entourage) 
WHERE is_entourage = TRUE;

-- Add a trigger to automatically set is_entourage when source changes
CREATE OR REPLACE FUNCTION update_is_entourage()
RETURNS TRIGGER AS $$
BEGIN
  NEW.is_entourage := (NEW.source ILIKE '%ENTOURAGE%' OR NEW.source ILIKE '%KIDENTOURAGE%');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_is_entourage
BEFORE INSERT OR UPDATE OF source ON invited_guests
FOR EACH ROW
EXECUTE FUNCTION update_is_entourage();
