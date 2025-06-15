#!/bin/bash

echo "🧪 Testing Incidents API..."
echo "=========================="

echo ""
echo "1. Testing all incidents:"
curl -s "http://localhost:3001/api/incidents" | jq '.'

echo ""
echo "2. Testing active incidents:"
curl -s "http://localhost:3001/api/incidents?status=active" | jq '.'

echo ""
echo "3. Testing active incidents with limit:"
curl -s "http://localhost:3001/api/incidents?status=active&limit=1" | jq '.'

echo ""
echo "4. Database check - all incidents:"
sqlite3 /tmp/status_monitor.db "SELECT id, title, status, impact, created_at FROM incidents ORDER BY created_at DESC LIMIT 5;"

echo ""
echo "5. Database check - active incidents:"
sqlite3 /tmp/status_monitor.db "SELECT id, title, status, impact, created_at FROM incidents WHERE status IN ('investigating', 'identified', 'monitoring') ORDER BY created_at DESC;"

echo ""
echo "✅ Test completed!"