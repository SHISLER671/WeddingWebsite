# Supabase Keep-Alive Setup

This document describes the automated keep-alive mechanism for the Pia & Ryan Wedding 2026 website to prevent Supabase's 7-day inactivity pause.

## Overview

- **Purpose**: Keep Supabase project active to prevent automatic pause after 7 days of inactivity
- **Method**: Weekly ping to existing `/api/rsvp` endpoint with invalid data
- **Schedule**: Every Sunday at 2 AM ChST (UTC+8) = 6 PM UTC (18:00)
- **Trigger**: Automated via GitHub Actions + manual trigger option

## How It Works

### 1. Ping Strategy
- Sends POST request to `https://pia-ryan-wedding.vercel.app/api/rsvp`
- Uses invalid JSON payload: `{"guest_name": "", "email": "", "attendance": ""}`
- Triggers validation logging without upserting data
- Expected response: HTTP 400 (validation error) - confirms activity

### 2. GitHub Actions Workflow
- **File**: `.github/workflows/keep-alive.yml`
- **Schedule**: `cron: '0 18 * * 0'` (Sundays at 6 PM UTC)
- **Manual Trigger**: Available in GitHub Actions UI
- **Environment**: Production (configurable)

### 3. Activity Logging
The existing RSVP endpoint logs activity when validation fails:
```typescript
if (!guest_name || !email || !attendance) {
  console.log("[v0] Missing required fields:", {
    guest_name: !!guest_name,
    email: !!email,
    attendance: !!attendance,
  })
  return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
}
```

## Files Created

1. **`.github/workflows/keep-alive.yml`** - Main workflow file
2. **`scripts/test-keep-alive.sh`** - Test script for manual verification
3. **`docs/SUPABASE_KEEP_ALIVE.md`** - This documentation

## Testing

### Manual Test
Run the test script to verify the ping works:
```bash
./scripts/test-keep-alive.sh
```

### Expected Output
```
✅ Test PASSED! Keep-alive ping successful.
🎯 Expected validation error received - endpoint is active.
📈 This confirms Supabase activity will be logged weekly.
```

### GitHub Actions Test
1. Go to GitHub Actions tab
2. Find "Supabase Keep-Alive" workflow
3. Click "Run workflow" button
4. Select "production" environment
5. Click "Run workflow"

## Monitoring

### Success Indicators
- HTTP 400 response (validation error)
- Console logs showing "Missing required fields"
- Supabase activity logs showing API calls

### Failure Indicators
- HTTP 500 or other error codes
- Timeout errors
- No activity in Supabase logs

## Troubleshooting

### Common Issues

1. **Workflow not running**
   - Check GitHub Actions permissions
   - Verify workflow file is in `.github/workflows/`
   - Ensure it's committed to main branch

2. **Ping failing**
   - Check Vercel deployment status
   - Verify endpoint URL is correct
   - Check network connectivity

3. **No Supabase activity**
   - Verify Supabase logs
   - Check if endpoint is actually being called
   - Ensure validation is working correctly

### Manual Verification
```bash
# Test the endpoint directly
curl -X POST https://pia-ryan-wedding.vercel.app/api/rsvp \
  -H "Content-Type: application/json" \
  -d '{"guest_name": "", "email": "", "attendance": ""}'

# Expected: HTTP 400 with validation error
```

## Configuration

### Schedule Adjustment
To change the schedule, modify the cron expression in `.github/workflows/keep-alive.yml`:
```yaml
schedule:
  - cron: '0 18 * * 0'  # Current: Sundays at 6 PM UTC (2 AM ChST)
```

### Time Zone Reference
- **ChST (Chamorro Standard Time)**: UTC+8
- **Current Schedule**: 2 AM ChST = 6 PM UTC (previous day)
- **Cron Format**: `minute hour day month weekday`

## Benefits

1. **Prevents Downtime**: Keeps Supabase project active
2. **No Code Changes**: Uses existing endpoint
3. **Automated**: Runs weekly without manual intervention
4. **Monitored**: GitHub Actions provides execution logs
5. **Testable**: Manual trigger and test script available
6. **Cost Effective**: Minimal resource usage

## Security

- Uses public endpoint (no authentication required)
- Sends invalid data (no data corruption risk)
- Triggers validation (no database writes)
- Logs activity (audit trail available)

---

**Last Updated**: $(date)
**Status**: Active
**Next Run**: Check GitHub Actions for next scheduled execution
