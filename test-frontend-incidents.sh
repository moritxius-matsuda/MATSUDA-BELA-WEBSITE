#!/bin/bash

echo "🧪 Testing Frontend Incidents API..."
echo "===================================="

# Assuming the Next.js app is running on localhost:3000
FRONTEND_URL="http://localhost:3000"

echo ""
echo "1. Testing frontend incidents API:"
curl -s "$FRONTEND_URL/api/incidents" | jq '.'

echo ""
echo "2. Testing frontend active incidents:"
curl -s "$FRONTEND_URL/api/incidents?status=active" | jq '.'

echo ""
echo "3. Testing frontend active incidents with limit:"
curl -s "$FRONTEND_URL/api/incidents?status=active&limit=1" | jq '.'

echo ""
echo "✅ Frontend API test completed!"

echo ""
echo "💡 If the frontend is not running, start it with:"
echo "   npm run dev"