-- Count total invited guests
SELECT count(*) AS invited_count
FROM public.invited_guests;

-- Find duplicates by normalized name (trim + lower)
SELECT lower(trim(guest_name)) AS norm_name, count(*) AS cnt
FROM public.invited_guests
GROUP BY norm_name
HAVING count(*) > 1
ORDER BY cnt DESC
LIMIT 100;

-- Suggested fuzzy duplicates to review (similar names)
SELECT
  a.id,
  a.guest_name AS name_a,
  b.id AS id_b,
  b.guest_name AS name_b,
  similarity(a.guest_name, b.guest_name) AS sim
FROM public.invited_guests a
JOIN public.invited_guests b ON a.id <> b.id
WHERE a.guest_name % b.guest_name
ORDER BY sim DESC
LIMIT 100;
