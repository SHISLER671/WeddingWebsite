CREATE OR REPLACE FUNCTION public.upsert_invited_guests(rows jsonb)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  r jsonb;
  v_guest_name text;
  v_email text;
  v_allowed_party_size int;
  v_source text;
BEGIN
  IF rows IS NULL OR jsonb_typeof(rows) <> 'array' THEN
    RAISE EXCEPTION 'upsert_invited_guests expects a JSON array input';
  END IF;

  FOR r IN
    SELECT value
    FROM jsonb_array_elements(rows) AS value
  LOOP
    v_guest_name := NULLIF(trim((r->>'guest_name')::text), '');
    v_email := NULLIF(trim((r->>'email')::text), '');
    v_source := NULLIF(trim((r->>'source')::text), '');

    IF v_guest_name IS NULL THEN
      CONTINUE;
    END IF;

    v_allowed_party_size :=
      COALESCE(
        NULLIF(r->>'allowed_party_size', '')::int,
        1
      );

    INSERT INTO public.invited_guests (
      guest_name,
      email,
      allowed_party_size,
      source,
      updated_at
    )
    VALUES (
      v_guest_name,
      v_email,
      v_allowed_party_size,
      v_source,
      now()
    )
    ON CONFLICT (guest_name, email) DO UPDATE
    SET
      guest_name = EXCLUDED.guest_name,
      allowed_party_size = EXCLUDED.allowed_party_size,
      source = COALESCE(EXCLUDED.source, invited_guests.source),
      updated_at = now();
  END LOOP;
END;
$$;

