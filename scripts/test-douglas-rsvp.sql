-- Test RSVP submission for Douglas
-- This script will insert a test RSVP to verify the database connection is working

INSERT INTO rsvps (
  guest_name,
  email,
  attendance,
  guest_count,
  dietary_restrictions,
  special_message,
  wallet_address
) VALUES (
  'Douglas',
  'doug@pretend.com',
  'yes',
  1,
  'No dietary restrictions',
  'Test RSVP submission from v0',
  NULL
);

-- Verify the insertion
SELECT * FROM rsvps WHERE guest_name = 'Douglas' AND email = 'doug@pretend.com';
