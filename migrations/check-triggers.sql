-- Diagnostic Script: Check for problematic triggers and policies
-- Run this FIRST to see what might be causing the issue

-- ============================================
-- Check all triggers on invited_guests
-- ============================================
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_timing,
  action_statement
FROM information_schema.triggers
WHERE event_object_table = 'invited_guests';

-- ============================================
-- Check all RLS policies on invited_guests
-- ============================================
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'invited_guests';

-- ============================================
-- Check table structure
-- ============================================
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'invited_guests'
ORDER BY ordinal_position;

-- ============================================
-- Check for any functions that might reference dietary_restrictions
-- ============================================
SELECT 
  routine_name,
  routine_definition
FROM information_schema.routines
WHERE routine_definition LIKE '%dietary_restrictions%'
  AND routine_schema = 'public';
