CREATE EXTENSION IF NOT EXISTS "pg_trgm";

CREATE TABLE IF NOT EXISTS public.invited_guests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  guest_name text NOT NULL,
  email text,
  allowed_party_size int NOT NULL DEFAULT 1,
  source text,
  rsvp_id uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS invited_guests_guest_name_email_key
  ON public.invited_guests (guest_name, email);

CREATE INDEX IF NOT EXISTS idx_invited_guests_name_trgm
  ON public.invited_guests USING gin (guest_name gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_invited_guests_email
  ON public.invited_guests (email);

