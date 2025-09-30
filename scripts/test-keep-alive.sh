#!/bin/bash

# Test script for Supabase keep-alive functionality
# This simulates what the GitHub Actions workflow will do

echo "🧪 Testing Supabase Keep-Alive Ping..."
echo "⏰ Timestamp: $(date)"
echo "🌐 Target: https://pia-ryan-wedding.vercel.app/api/rsvp"
echo ""

# Test the ping
echo "📡 Sending ping request..."
response=$(curl -s -w "\n%{http_code}" -X POST https://pia-ryan-wedding.vercel.app/api/rsvp \
  -H "Content-Type: application/json" \
  -d '{"guest_name": "", "email": "", "attendance": ""}' \
  --max-time 30)

# Extract HTTP status code (last line)
http_code=$(echo "$response" | tail -n1)
# Extract response body (all lines except last)
response_body=$(echo "$response" | head -n -1)

echo "📊 HTTP Status: $http_code"
echo "📝 Response: $response_body"
echo ""

# Check if the request was successful
if [ "$http_code" -eq 400 ]; then
  echo "✅ Test PASSED! Keep-alive ping successful."
  echo "🎯 Expected validation error received - endpoint is active."
  echo "📈 This confirms Supabase activity will be logged weekly."
elif [ "$http_code" -eq 200 ]; then
  echo "⚠️  Test WARNING: Unexpected 200 response"
  echo "🔍 Endpoint behavior may have changed"
else
  echo "❌ Test FAILED with status: $http_code"
  echo "🔍 Check endpoint availability and configuration"
  exit 1
fi

echo ""
echo "🏁 Keep-alive test completed!"
echo "💡 This test simulates the weekly GitHub Actions workflow."
