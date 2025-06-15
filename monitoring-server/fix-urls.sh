#!/bin/bash

echo "🔧 Fixing service URLs and updating monitoring logic..."

# Update the database with better URLs
sqlite3 data/status.db << EOF
-- Update URLs to public endpoints
UPDATE services SET url = 'https://moritxius.de' WHERE id = 'main-website';
UPDATE services SET url = 'https://moritxius.de' WHERE id = 'guides-system';
UPDATE services SET url = 'https://moritxius.de' WHERE id = 'comments-api';
UPDATE services SET url = 'https://moritxius.de' WHERE id = 'guides-api';
UPDATE services SET url = 'https://epic-werewolf-17800.upstash.io' WHERE id = 'upstash-redis';

-- Show updated URLs
SELECT 'Updated service URLs:';
SELECT id, name, url FROM services;
EOF

echo "✅ Database updated!"

# Copy updated monitoring files (you need to upload these first)
echo "📁 Make sure you've uploaded the updated monitoring files:"
echo "   - src/monitor.js (with improved 403 handling)"
echo "   - src/database.js (with better default URLs)"

# Restart the monitoring server
echo "🔄 Restarting monitoring server..."
pm2 restart status-monitor

echo "✅ Done! Waiting 15 seconds for checks to complete..."
sleep 15

# Check the status
echo "📊 Current overall status:"
curl -s http://localhost:3001/api/status | jq -r '.overall'

echo ""
echo "🔍 Individual service status:"
curl -s http://localhost:3001/api/status | jq -r '.categories[].services[] | "\(.name): \(.status)"'

echo ""
echo "🔍 Recent check details for problematic services:"
curl -s http://localhost:3001/api/status/service/upstash-redis | tail -1
curl -s http://localhost:3001/api/status/service/comments-api | tail -1