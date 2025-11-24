# RSVP Autocomplete Flow Documentation

## Overview
The RSVP form uses an autocomplete feature that requires guests to select their name from a dropdown list populated from the `invited_guests` table in Supabase.

## User Flow

1. **Guest clicks RSVP button** → Navigates to `/rsvp`
2. **Guest types name** → After 2+ characters, autocomplete dropdown appears
3. **Guest selects name** → Name and email (if available) are pre-filled
4. **Guest completes form** → Fills in attendance, guest count, dietary restrictions, etc.
5. **Guest submits** → Form validates that name was selected from dropdown
6. **RSVP saved to Supabase** → Stored in `rsvps` table
7. **Confirmation page** → Guest redirected to `/confirmation` with success message

## Key Features

### Autocomplete Requirements
- **Minimum 2 characters** to trigger search
- **300ms debounce** to reduce API calls
- **Case-insensitive prefix matching** (ILIKE query)
- **Shows full names** including last names to distinguish duplicates
- **Keyboard navigation** (arrow keys, Enter, Escape)
- **Click outside to close** dropdown

### Validation
- **Must select from dropdown** - Cannot submit with manually typed name
- **Visual feedback**:
  - ✅ Green checkmark when name is selected
  - ❌ Red error if trying to submit without selection
- **Edit mode exception** - If editing existing RSVP, validation is skipped

### API Endpoints

#### `/api/guests/autocomplete`
- **Method**: GET
- **Query params**: 
  - `q` (required): Search query (min 2 chars)
  - `limit` (optional): Max results (default 10, max 20)
- **Returns**: JSON with matching guests from `invited_guests` table
- **Security**: Uses service role key, server-side only

#### `/api/rsvp`
- **Method**: POST
- **Body**: 
  - `guest_name` (required)
  - `email` (required)
  - `attendance` (required: "yes" or "no")
  - `guest_count` (optional, default 1)
  - `dietary_restrictions` (optional)
  - `special_message` (optional)
  - `wallet_address` (optional)
- **Returns**: Success/error response
- **Database**: Upserts to `rsvps` table (conflict on email)

## Database Schema

### `invited_guests` table
\`\`\`sql
- id (uuid, primary key)
- guest_name (text, required)
- email (text, nullable)
- allowed_party_size (int, default 1)
- source (text)
- rsvp_id (uuid, nullable)
- created_at (timestamptz)
- updated_at (timestamptz)
\`\`\`

### `rsvps` table
\`\`\`sql
- id (integer, primary key)
- guest_name (text, required)
- email (text, required, unique)
- attendance (text, required: 'yes' or 'no')
- guest_count (int, default 1)
- dietary_restrictions (text, nullable)
- special_message (text, nullable)
- wallet_address (text, nullable)
- created_at (timestamptz)
- updated_at (timestamptz)
\`\`\`

## Setup Instructions

1. **Import guest list to Supabase**:
   - Use `tmp/master-guest-list.csv` (223 guests) or `tmp/updated-guest-list.csv` (403 guests)
   - Import into `invited_guests` table
   - Ensure `guest_name` column is populated correctly

2. **Verify autocomplete API**:
   - Test: `GET /api/guests/autocomplete?q=John`
   - Should return matching guests

3. **Test RSVP flow**:
   - Type a name in the RSVP form
   - Verify dropdown appears
   - Select a name
   - Submit form
   - Verify redirect to confirmation page

## Troubleshooting

### Autocomplete not showing
- Check that `invited_guests` table has data
- Verify API endpoint is accessible
- Check browser console for errors
- Ensure guest name has at least 2 characters

### Validation error on submit
- Ensure name was selected from dropdown (not typed manually)
- Check that `selectedGuest` state is set
- Verify name matches exactly

### RSVP not saving
- Check Supabase connection
- Verify `rsvps` table exists
- Check API route logs for errors
- Ensure email is unique (or update existing RSVP)

## Files Involved

- `app/rsvp/page.tsx` - RSVP form with autocomplete
- `app/api/guests/autocomplete/route.ts` - Autocomplete API endpoint
- `app/api/rsvp/route.ts` - RSVP submission API
- `app/confirmation/page.tsx` - Confirmation page
- `migrations/20251112_create_invited_guests.sql` - Database schema
