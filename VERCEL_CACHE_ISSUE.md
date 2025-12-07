# Vercel Cache Issue - Admin Seating API

## Problem
The Admin page at `/admin` is showing stale data from the `/api/admin/seating` endpoint. Database has been updated correctly, but the API response appears to be cached.

## Database Verification
✅ **Database is correct:**
- Query shows: "Uncle Rudy Roberto" (correct)
- Query shows: "Aubree Chaco" (correct)
- No old "Rudy Roberto" entry exists

## What We've Tried

### 1. API Route Configuration
- ✅ Added `export const dynamic = 'force-dynamic'`
- ✅ Added `export const revalidate = 0`
- ✅ Added `export const fetchCache = 'force-no-store'`
- ✅ Added cache-busting headers in response:
  ```typescript
  headers: {
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
  }
  ```

### 2. Client-Side Fetch
- ✅ Added timestamp query parameter: `?t=${Date.now()}`
- ✅ Added `cache: 'no-store'` option
- ✅ Added `Cache-Control: no-cache` header

### 3. Database Sync
- ✅ Synced `invited_guests` table with CSV
- ✅ Synced `seating_assignments` table with `invited_guests`
- ✅ Verified database directly - data is correct

## API Endpoint
- **Route:** `/app/api/admin/seating/route.ts`
- **Method:** GET
- **Returns:** Seating assignments from `seating_assignments` Supabase table

## Expected Behavior
The API should return fresh data from Supabase on every request, showing:
- "Uncle Rudy Roberto" (not "Rudy Roberto")
- "Aubree Chaco"

## Current Behavior
Admin page shows old cached data despite:
- Hard refresh (Ctrl+Shift+R / Cmd+Shift+R)
- Clicking "Reload" button
- Database being correct

## Questions for Vercel Support
1. Is Vercel edge caching this API route despite `force-dynamic`?
2. Are there Vercel-specific cache headers we need to set?
3. Should we purge the Vercel cache manually?
4. Is there a Vercel configuration we're missing?

## Files Changed
- `app/api/admin/seating/route.ts` - Added cache prevention
- `app/admin/page.tsx` - Added cache-busting to fetch

