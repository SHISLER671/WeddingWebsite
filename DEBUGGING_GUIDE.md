# Chatbot Debugging Guide

## Overview

I've added comprehensive logging and debugging tools to help identify why the chatbot isn't responding. The system now includes detailed logging at every step of the chatbot pipeline.

## 🔍 Debug Panel

A debug panel is now available in the bottom-left corner of your website. It allows you to test individual components:

### Debug Panel Features:
1. **Environment Variables Check** - Verifies all required variables are set
2. **OpenRouter Connection Test** - Tests AI API connectivity
3. **Supabase RSVP Lookup Test** - Tests database access
4. **Chat Functionality Test** - Tests the complete chat pipeline

## 📋 Testing Steps

### Step 1: Check Environment Variables
1. Open your website
2. Click "📋 Check Environment Variables" in the debug panel
3. Verify all variables show "✅ Set"

### Step 2: Test OpenRouter Connection
1. Click "🤖 Test OpenRouter Connection"
2. Check for success message
3. Look for detailed logs in browser console (F12)

### Step 3: Test Supabase RSVP Lookup
1. Click "🗄️ Test Supabase RSVP Lookup"
2. Verify the RSVP lookup function works
3. Check console for database connection logs

### Step 4: Test Chat Functionality
1. Click "💬 Test Chat Functionality"
2. Watch for the test message to appear in chat
3. Monitor the response in the chat interface

## 🐛 Log Monitoring

### Console Log Prefixes:
- **🤖 [OpenRouter]**: AI API communication
- **💬 [ChatContext]**: Chat state management
- **🗄️ [RSVP]**: Database operations
- **🧪 [Debug]**: Debug panel actions

### Key Logs to Watch For:

#### Successful Flow:
\`\`\`
💬 [ChatContext] === New Message ===
💬 [ChatContext] 🤖 Starting AI response generation...
🤖 [OpenRouter] Initializing client...
🤖 [OpenRouter] === Chat Completion Request ===
🤖 [OpenRouter] ✅ Success Response
💬 [ChatContext] ✅ Message successfully dispatched to UI
\`\`\`

#### Error Scenarios:
\`\`\`
🤖 [OpenRouter] Configuration Error: OpenRouter API key not configured
🗄️ [RSVP] Configuration error: Supabase configuration missing
💬 [ChatContext] ❌ Message processing failed
\`\`\`

## 🔧 Common Issues & Solutions

### 1. No Response at All
**Symptoms**: Chat shows loading indicator but no response
**Check**: 
- Open browser console (F12)
- Look for 🤖 [OpenRouter] initialization logs
- Verify OPENROUTER_API_KEY environment variable

### 2. Environment Variable Issues
**Symptoms**: Debug panel shows missing variables
**Solution**:
- Verify Vercel environment variables are set
- Check variable names exactly match
- Ensure variables are available in Production environment

### 3. OpenRouter API Issues
**Symptoms**: API connection fails or returns errors
**Check**:
- API key format (should start with `sk-or-`)
- Model name is correct (`openai/gpt-4o-mini`)
- API key has proper permissions

### 4. Supabase Connection Issues
**Symptoms**: RSVP lookup fails
**Check**:
- Supabase URL and anon key are correct
- Database table `rsvps` exists
- Row Level Security policies allow read access

### 5. Network Issues
**Symptoms**: Timeouts or connection errors
**Check**:
- Vercel function logs
- Network connectivity
- CORS settings

## 📊 Detailed Error Analysis

### Using Browser Developer Tools:

1. **Open Console**: F12 → Console tab
2. **Send Message**: Type something in the chat
3. **Watch Logs**: Look for the log sequence above
4. **Identify Failure**: Find where the process stops

### Log Analysis:

#### If you see:
\`\`\`
💬 [ChatContext] === New Message ===
💬 [ChatContext] 🤖 Starting AI response generation...
\`\`\`
But no further logs → **OpenRouter client initialization issue**

#### If you see:
\`\`\`
🤖 [OpenRouter] Initializing client...
🤖 [OpenRouter] API Key configured: ❌ No
\`\`\`
→ **Environment variable issue**

#### If you see:
\`\`\`
🤖 [OpenRouter] === Chat Completion Request ===
🤖 [OpenRouter] Response status: 401
\`\`\`
→ **API key authentication issue**

#### If you see:
\`\`\`
🗄️ [RSVP] Configuration error: Supabase configuration missing
\`\`\`
→ **Supabase environment variable issue**

## 🚀 Production Deployment Checks

### Before Deploying:
1. ✅ All environment variables set in Vercel
2. ✅ Variables available in Production environment
3. ✅ API keys are valid and have credits
4. ✅ Database is accessible with provided credentials

### After Deploying:
1. ✅ Test with debug panel
2. ✅ Send real messages in chat
3. ✅ Test RSVP lookup functionality
4. ✅ Check Vercel function logs

## 🔧 Removing Debug Panel

Once everything is working, remove the debug panel:

1. **Remove from layout.tsx**:
   \`\`\`tsx
   // Remove this line:
   import ChatbotDebug from "../components/ChatbotDebug"
   
   // Remove this line:
   <ChatbotDebug />
   \`\`\`

2. **Optional**: Reduce logging level in production
   - Remove or comment out verbose console.log statements
   - Keep error logging for troubleshooting

## 🎯 Quick Test Checklist

- [ ] Open website and locate chat bubble
- [ ] Open chat and see welcome message
- [ ] Open debug panel (bottom-left)
- [ ] Check environment variables (all ✅)
- [ ] Test OpenRouter connection
- [ ] Test Supabase RSVP lookup
- [ ] Test chat functionality
- [ ] Send a real message and get response
- [ ] Test RSVP lookup: "Can you check RSVP for test@example.com"
- [ ] Check browser console for detailed logs
- [ ] Verify all functionality works as expected

## 📞 Getting Help

If issues persist:
1. **Screenshot**: Take screenshots of debug panel results
2. **Console Logs**: Copy all console output (🤖, 💬, 🗄️ logs)
3. **Environment**: Confirm environment variables are set
4. **Error Messages**: Note any specific error messages

Share this information for faster troubleshooting!
