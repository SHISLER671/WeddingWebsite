-- Fix seating assignments table to allow null emails
-- Run this in your Supabase SQL Editor

-- Make email column nullable since we're using name-based lookup
ALTER TABLE seating_assignments ALTER COLUMN email DROP NOT NULL;

-- Add a comment to explain the change
COMMENT ON COLUMN seating_assignments.email IS 'Email is optional - seating assignments work primarily by guest name';
