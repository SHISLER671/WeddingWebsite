-- Fix RSVP updated_at column and trigger issue
-- Run this in Supabase SQL Editor

-- Step 1: Check if updated_at column exists, if not add it
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'rsvps' 
        AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE public.rsvps 
        ADD COLUMN updated_at timestamptz DEFAULT now();
        
        -- Update existing rows
        UPDATE public.rsvps 
        SET updated_at = created_at 
        WHERE updated_at IS NULL;
        
        RAISE NOTICE 'Added updated_at column to rsvps table';
    ELSE
        RAISE NOTICE 'updated_at column already exists';
    END IF;
END $$;

-- Step 2: Drop the existing trigger if it's causing issues
DROP TRIGGER IF EXISTS update_rsvps_updated_at ON public.rsvps;

-- Step 3: Recreate the trigger function (make it more robust)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    -- Only set updated_at if the column exists
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = TG_TABLE_SCHEMA 
        AND table_name = TG_TABLE_NAME 
        AND column_name = 'updated_at'
    ) THEN
        NEW.updated_at = NOW();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 4: Recreate the trigger
CREATE TRIGGER update_rsvps_updated_at
    BEFORE UPDATE ON public.rsvps
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Verify the trigger was created
SELECT 
    trigger_name, 
    event_manipulation, 
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE event_object_table = 'rsvps'
AND trigger_name = 'update_rsvps_updated_at';

