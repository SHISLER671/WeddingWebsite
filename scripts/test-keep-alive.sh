#!/bin/bash

# Test script for Supabase Keep-Alive functionality
# This simulates the GitHub Actions workflow locally

echo "🔄 Testing Supabase Keep-Alive ping..."
echo "⏰ Timestamp: $(date)"
echo "🌐 Environment: test"

# Ping the RSVP endpoint with invalid data to trigger validation logging
# This counts as activity without upserting any data
response=$(curl -s -w "\n%{http_code}" -X POST https://pia-ryan-wedding.vercel.app/api/rsvp \
  -H "Content-Type: application/json" \
  -d '{"guest_name": "", "email": "", "attendance": ""}' \
  --max-time 30)

# Extract HTTP status code (last line)
http_code=$(echo "$response" | tail -n1)
# Extract response body (all lines except last)
response_body=$(echo "$response" | sed '$d')

echo "📊 HTTP Status: $http_code"
echo "📝 Response: $response_body"

# Check if the request was successful (should return 400 for validation error)
if [ "$http_code" -eq 400 ]; then
  echo "✅ Test PASSED! Keep-alive ping successful."
  echo "🎯 Expected validation error received - endpoint is active."
  echo "📈 This confirms Supabase activity will be logged weekly."
  exit 0
elif [ "$http_code" -eq 200 ]; then
  echo "⚠️  Unexpected 200 response - endpoint may have changed behavior"
  exit 1
else
  echo "❌ Keep-alive ping failed with status: $http_code"
  echo "🔍 Response: $response_body"
  exit 1
fi
