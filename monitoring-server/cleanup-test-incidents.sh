#!/bin/bash

echo "🧹 Cleaning up Test Incidents..."
echo "================================"

echo "📋 Current incidents:"
curl -s "http://localhost:3001/api/incidents" | jq '.incidents[] | {id, title, status}'

echo ""
echo "🗑️ Deleting test incidents..."

# Get all incidents and delete ones with test-related titles
INCIDENTS=$(curl -s "http://localhost:3001/api/incidents" | jq -r '.incidents[] | select(.title | test("Test|test|Langsame|Demo")) | .id')

if [ -z "$INCIDENTS" ]; then
  echo "ℹ️ No test incidents found to delete"
else
  for INCIDENT_ID in $INCIDENTS; do
    echo "🗑️ Deleting incident: $INCIDENT_ID"
    curl -s -X DELETE "http://localhost:3001/api/incidents/$INCIDENT_ID"
    echo ""
  done
fi

echo ""
echo "📊 Remaining incidents:"
curl -s "http://localhost:3001/api/incidents" | jq '.incidents | length'

echo ""
echo "✅ Cleanup completed!"