#!/bin/bash

# Update Monitoring Server Services
echo "🔄 Updating monitoring server services..."

# Update service URLs in database
node update-services.js

# Restart PM2 process to apply changes
echo "🔄 Restarting monitoring server..."
pm2 restart status-monitor

echo "✅ Update completed!"
echo "📊 Check status: curl http://localhost:3001/api/status"