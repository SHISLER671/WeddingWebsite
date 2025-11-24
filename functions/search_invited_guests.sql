CREATE OR REPLACE FUNCTION public.search_invited_guests(q text, limit_rows int DEFAULT 10)
RETURNS TABLE (
  id uuid,
  guest_name text,
  email text,
  allowed_party_size int,
  score float
)
LANGUAGE sql
STABLE
AS
$$
  SELECT
    id,
    guest_name,
    email,
    allowed_party_size,
    GREATEST(similarity(guest_name, q), 0.0) AS score
  FROM public.invited_guests
  WHERE
    q IS NOT NULL
    AND trim(q) <> ''
    AND (
      guest_name ILIKE q || '%'
      OR guest_name % q
    )
  ORDER BY score DESC, guest_name
  LIMIT limit_rows;
$$;
