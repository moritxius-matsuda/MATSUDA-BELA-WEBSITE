#!/bin/bash

echo "🚨 Creating Test Incident..."
echo "============================"

# Create a test incident
INCIDENT_DATA='{
  "title": "Langsame Antwortzeiten bei der Hauptwebsite",
  "description": "Benutzer melden verlangsamte Ladezeiten auf der Hauptwebsite. Wir untersuchen das Problem.",
  "status": "investigating",
  "impact": "degraded",
  "affectedServices": ["main-website", "guides-system"]
}'

echo "📝 Creating incident with data:"
echo "$INCIDENT_DATA" | jq '.'

echo ""
echo "🔄 Sending to API..."
RESPONSE=$(curl -s -X POST "http://localhost:3001/api/incidents" \
  -H "Content-Type: application/json" \
  -d "$INCIDENT_DATA")

echo "📋 Response:"
echo "$RESPONSE" | jq '.'

INCIDENT_ID=$(echo "$RESPONSE" | jq -r '.id' 2>/dev/null)

if [ "$INCIDENT_ID" != "null" ] && [ "$INCIDENT_ID" != "" ]; then
  echo ""
  echo "✅ Incident created successfully!"
  echo "🆔 Incident ID: $INCIDENT_ID"
  
  echo ""
  echo "📊 Testing incident retrieval:"
  curl -s "http://localhost:3001/api/incidents?status=active" | jq '.incidents | length'
  
  echo ""
  echo "🔍 Active incidents:"
  curl -s "http://localhost:3001/api/incidents?status=active" | jq '.incidents[] | {id, title, status, impact}'
  
else
  echo ""
  echo "❌ Failed to create incident"
  echo "🔍 Check server logs:"
  pm2 logs status-monitor --lines 10
fi

echo ""
echo "💡 To resolve this incident later, use:"
echo "   curl -X PUT \"http://localhost:3001/api/incidents/$INCIDENT_ID\" -H \"Content-Type: application/json\" -d '{\"status\":\"resolved\"}'"

echo ""
echo "🧹 To delete this test incident:"
echo "   curl -X DELETE \"http://localhost:3001/api/incidents/$INCIDENT_ID\""