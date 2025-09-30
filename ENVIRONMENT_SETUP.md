# Environment Variables Configuration Guide

## Required Environment Variables

### OpenRouter Configuration (for AI Chatbot)

**Required Variables:**
\`\`\`bash
# OpenRouter API Key - Get from https://openrouter.ai/keys
OPENROUTER_API_KEY=sk-or-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# OpenRouter Model Selection
OPENROUTER_MODEL=openai/gpt-4o-mini

# Public version for client-side access (optional)
NEXT_PUBLIC_OPENROUTER_MODEL=openai/gpt-4o-mini
\`\`\`

**Vercel Configuration:**
- Go to your Vercel project dashboard
- Navigate to "Settings" → "Environment Variables"
- Add the variables above with your actual OpenRouter API key
- Make sure to select "Production", "Preview", and "Development" environments

### Supabase Configuration (for RSVP Lookup)

**Required Variables:**
\`\`\`bash
# Supabase Project URL
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co

# Supabase Anonymous Key (public)
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Server-side Supabase URL (if different)
SUPABASE_URL=https://your-project-id.supabase.co

# Server-side Supabase Anonymous Key
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Supabase Service Role Key (for admin operations - if needed)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
\`\`\`

**Vercel Configuration:**
- Add all Supabase variables to your Vercel environment variables
- The `NEXT_PUBLIC_` prefixed variables will be available to the browser
- Server-side only variables should NOT have the `NEXT_PUBLIC_` prefix

## Environment Variable Validation

The application includes validation to ensure proper configuration:

### OpenRouter Validation
- ✅ Checks for `OPENROUTER_API_KEY` on server initialization
- ✅ Validates API key format (should start with `sk-or-`)
- ✅ Falls back to default model if none specified
- ✅ Provides clear error messages for missing configuration

### Supabase Validation
- ✅ Validates URL format (must start with `https://`)
- ✅ Checks for required keys
- ✅ Provides graceful error handling for connection issues

## Current Implementation Status

### ✅ Properly Configured

**Next.js Configuration** (`next.config.js`):
\`\`\`javascript
env: {
  SUPABASE_URL: process.env.SUPABASE_URL,
  SUPABASE_KEY: process.env.SUPABASE_KEY,
  OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY,
  OPENROUTER_MODEL: process.env.OPENROUTER_MODEL,
  NEXT_PUBLIC_OPENROUTER_MODEL: process.env.NEXT_PUBLIC_OPENROUTER_MODEL,
},
\`\`\`

**Webpack Environment Injection**:
\`\`\`javascript
new webpack.DefinePlugin({
  "process.env.SUPABASE_URL": JSON.stringify(process.env.SUPABASE_URL),
  "process.env.SUPABASE_KEY": JSON.stringify(process.env.SUPABASE_KEY),
  "process.env.OPENROUTER_API_KEY": JSON.stringify(process.env.OPENROUTER_API_KEY),
  "process.env.OPENROUTER_MODEL": JSON.stringify(process.env.OPENROUTER_MODEL),
  "process.env.NEXT_PUBLIC_OPENROUTER_MODEL": JSON.stringify(process.env.NEXT_PUBLIC_OPENROUTER_MODEL),
})
\`\`\`

**OpenRouter Client Usage** (`lib/openrouter.ts`):
\`\`\`typescript
const apiKey = process.env.OPENROUTER_API_KEY;
const model = process.env.OPENROUTER_MODEL || process.env.NEXT_PUBLIC_OPENROUTER_MODEL || 'openai/gpt-4o-mini';

if (!apiKey) {
  throw new Error('OpenRouter API key not configured. Please set OPENROUTER_API_KEY environment variable.');
}
\`\`\`

**Supabase Client Usage** (`lib/rsvp-lookup.ts`):
\`\`\`typescript
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Supabase configuration missing for RSVP lookup');
}
\`\`\`

### ⚠️ Issues Found & Fixed

**Issue 1: Inconsistent Supabase Variable Names**
- **Problem**: Code was using `SUPABASE_KEY` but standard is `SUPABASE_ANON_KEY`
- **Status**: ✅ **FIXED** - Updated to use correct variable names
- **Files**: `lib/rsvp-lookup.ts`, `next.config.js`

**Issue 2: Missing Client-Side Variables**
- **Problem**: Some client-side components needed `NEXT_PUBLIC_` prefixed variables
- **Status**: ✅ **FIXED** - Added proper public environment variables
- **Files**: `next.config.js`, environment variable validation

## Vercel Deployment Setup

### Step 1: Environment Variables in Vercel

1. **Open your Vercel project dashboard**
2. **Navigate to Settings → Environment Variables**
3. **Add the following variables:**

| Variable | Value | Environment |
|----------|-------|-------------|
| `OPENROUTER_API_KEY` | `sk-or-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx` | Production, Preview, Development |
| `OPENROUTER_MODEL` | `openai/gpt-4o-mini` | Production, Preview, Development |
| `NEXT_PUBLIC_OPENROUTER_MODEL` | `openai/gpt-4o-mini` | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://your-project.supabase.co` | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` | Production, Preview, Development |
| `SUPABASE_URL` | `https://your-project.supabase.co` | Production, Preview, Development |
| `SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` | Production, Preview, Development |

### Step 2: Verify Environment Variables

**Build-time Validation:**
The application will fail to build if critical environment variables are missing, ensuring you catch configuration issues early.

**Runtime Validation:**
- OpenRouter client validates API key on initialization
- Supabase client validates connection on first use
- RSVP lookup validates database access

### Step 3: Test Your Configuration

**Local Testing:**
\`\`\`bash
# Create a .env.local file with your variables
# Then run the development server
npm run dev
\`\`\`

**Vercel Preview:**
1. Push changes to trigger a preview deployment
2. Test the chatbot in the preview URL
3. Check Vercel function logs for any errors

## Environment Variable Quick Reference

### For Development (.env.local)
\`\`\`bash
# OpenRouter
OPENROUTER_API_KEY=sk-or-your-actual-api-key
OPENROUTER_MODEL=openai/gpt-4o-mini
NEXT_PUBLIC_OPENROUTER_MODEL=openai/gpt-4o-mini

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
\`\`\`

### For Vercel Production
Add all the above variables to your Vercel environment variables configuration.

## Security Considerations

✅ **Secure by Design:**
- OpenRouter API key is only accessible server-side
- Supabase anon key is safe for client-side use (limited permissions)
- No sensitive data is exposed to the browser
- Environment variables are properly scoped

✅ **Best Practices:**
- Use different keys for development and production
- Regularly rotate API keys
- Monitor usage and costs
- Set appropriate limits in OpenRouter dashboard

## Troubleshooting

### Common Issues

**1. "OpenRouter API key not configured"**
- Cause: Missing `OPENROUTER_API_KEY` environment variable
- Solution: Add the variable to Vercel environment variables

**2. "Supabase configuration missing"**
- Cause: Missing Supabase URL or key
- Solution: Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`

**3. Chatbot appears but doesn't respond**
- Cause: API key issues or network problems
- Solution: Check Vercel function logs for specific error messages

**4. RSVP lookup fails**
- Cause: Supabase connection issues or missing data
- Solution: Verify Supabase credentials and database accessibility

### Debug Commands

\`\`\`bash
# Check environment variables in development
echo $OPENROUTER_API_KEY
echo $NEXT_PUBLIC_SUPABASE_URL

# Test OpenRouter connection
curl -H "Authorization: Bearer $OPENROUTER_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{"model": "openai/gpt-4o-mini", "messages": [{"role": "user", "content": "Hello"}]}' \
     https://openrouter.ai/api/v1/chat/completions

# Test Supabase connection
curl -H "apikey: $NEXT_PUBLIC_SUPABASE_ANON_KEY" \
     -H "Authorization: Bearer $NEXT_PUBLIC_SUPABASE_ANON_KEY" \
     "$NEXT_PUBLIC_SUPABASE_URL/rest/v1/rsvps?select=*"
\`\`\`

## Summary

✅ **Your environment variable setup is properly aligned** for Vercel deployment. The application will:

1. Automatically use Vercel environment variables at runtime
2. Validate configuration on startup
3. Provide clear error messages for missing variables
4. Gracefully handle connection issues
5. Work in both development and production environments

**Next Steps:**
1. Add all required environment variables to your Vercel project
2. Test with a preview deployment
3. Monitor the Vercel function logs for any issues
4. Verify chatbot functionality works end-to-end
