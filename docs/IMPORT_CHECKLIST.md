# Guest List Import Checklist

## Current Status ✅

### ✅ CSV File Ready
- **File:** `MASTERGUESTLIST.csv`
- **Status:** Ready to import

### ✅ Import Script Ready
- **File:** `scripts/sync-invited-guests-with-csv.js` (recommended)
- **Status:** Configured and ready

### ⚠️ Database Setup Required

## Action Items

### Step 1: Remove Problematic Function (REQUIRED)
Run this SQL in Supabase SQL Editor:

\`\`\`sql
-- Drop the problematic function that's causing the dietary_restrictions error
DROP FUNCTION IF EXISTS sync_invited_guest_to_rsvp() CASCADE;

-- Verify it's gone (should return no rows)
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_name LIKE '%sync_invited%';
\`\`\`

### Step 2: Verify Database Setup
Run this SQL to check if tables exist:

\`\`\`sql
-- Check if invited_guests table exists
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name = 'invited_guests';

-- Check if required columns exist
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'invited_guests'
ORDER BY ordinal_position;
\`\`\`

**Expected columns:**
- `id` (uuid)
- `guest_name` (text)
- `email` (text)
- `allowed_party_size` (int)
- `source` (text)
- `rsvp_id` (uuid)
- `created_at` (timestamptz)
- `updated_at` (timestamptz)

### Step 3: Run Full Setup (If Tables Don't Exist)
If the tables don't exist or are missing columns, run the full setup:

**File:** `migrations/setup-rsvp-autocomplete.sql`

Copy the entire file and run it in Supabase SQL Editor. This will:
- Create `invited_guests` table
- Create `rsvps` table
- Set up indexes for autocomplete
- Configure RLS policies
- Set up triggers

### Step 4: Import Guest List
Once the database is set up correctly, run:

\`\`\`bash
cd "/Users/ipan/Desktop/working website/WeddingWebsite2026"
node scripts/sync-invited-guests-with-csv.js
\`\`\`

**What the sync script does:**
1. ✅ Reads all guests from `MASTERGUESTLIST.csv`
2. ✅ Adds new guests to `invited_guests` table
3. ✅ Updates existing guests if name, email, or party size changed
4. ✅ Removes guests from database that are no longer in CSV
5. ✅ Sets `source` field to `@MASTERGUESTLIST.csv`
6. ✅ Ensures exact match between CSV and database

**Expected output:**
\`\`\`
📊 Import Summary:
   ✅ Successfully imported: [number]
   ⏭️  Skipped/Updated: [number]
   ❌ Errors: 0
   📋 Total: 223

🔄 Syncing RSVP guest names from invited_guests...
📊 RSVP Sync Summary:
   ✅ Synced: [number]
   ⏭️  Unchanged: [number]
   ❌ Errors: 0
\`\`\`

### Step 5: Test Autocomplete
1. Go to your RSVP page (`/rsvp`)
2. Type a guest name in the "Full Name" field
3. Verify dropdown appears with matching names
4. Select a name from dropdown
5. Verify form fields populate correctly

## Troubleshooting

### If Import Shows "0 imported"
- Check that you ran Step 1 (drop the sync function)
- Verify RLS policies allow INSERT (run the policies from `migrations/setup-rsvp-autocomplete.sql`)
- Check Supabase logs for errors

### If Autocomplete Doesn't Work
- Verify the index exists: `SELECT * FROM pg_indexes WHERE tablename = 'invited_guests';`
- Check API endpoint: Visit `/api/guests/autocomplete?q=test` in browser
- Check browser console for errors

### If You Get RLS Errors
Run this SQL:

\`\`\`sql
-- Allow inserts to invited_guests
DROP POLICY IF EXISTS "Allow insert to invited_guests" ON public.invited_guests;
CREATE POLICY "Allow insert to invited_guests" 
  ON public.invited_guests
  FOR INSERT 
  WITH CHECK (true);

-- Allow updates to invited_guests
DROP POLICY IF EXISTS "Allow update to invited_guests" ON public.invited_guests;
CREATE POLICY "Allow update to invited_guests" 
  ON public.invited_guests
  FOR UPDATE 
  USING (true)
  WITH CHECK (true);

-- Grant permissions
GRANT INSERT, UPDATE ON public.invited_guests TO authenticated;
GRANT INSERT, UPDATE ON public.invited_guests TO anon;
\`\`\`

## Files Reference

- **CSV:** `MASTERGUESTLIST.csv`
- **Sync Script:** `scripts/sync-invited-guests-with-csv.js` (recommended - ensures exact match with CSV)
- **Full Setup SQL:** `migrations/setup-rsvp-autocomplete.sql`
