-- Add index for guest name autocomplete performance
-- This index optimizes prefix searches (ILIKE queries) used by the autocomplete feature

-- The existing trigram index (idx_invited_guests_name_trgm) is good for fuzzy matching,
-- but for prefix matching (which is what autocomplete uses), a btree index on lower(guest_name)
-- will be more efficient

-- Add btree index on lowercased guest_name for prefix matching
CREATE INDEX IF NOT EXISTS idx_invited_guests_name_prefix 
ON public.invited_guests USING btree (lower(guest_name));

-- Note: The existing trigram index (idx_invited_guests_name_trgm) is still useful
-- for fuzzy/similarity searches, but this new index will be faster for prefix matching
-- which is what the autocomplete feature uses.
