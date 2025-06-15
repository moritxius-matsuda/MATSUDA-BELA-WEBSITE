#!/bin/bash

# Fresh Deployment Script for Status Monitoring Server
# This script completely redeploys the monitoring server with correct configurations

set -e

echo "🚀 Starting Fresh Deployment of Status Monitoring Server..."
echo "=================================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the monitoring-server directory."
    exit 1
fi

# Stop and remove any existing PM2 processes
echo "🛑 Cleaning up existing processes..."
pm2 stop status-monitor 2>/dev/null || echo "   No existing process to stop"
pm2 delete status-monitor 2>/dev/null || echo "   No existing process to delete"

# Clean up old files
echo "🧹 Cleaning up old files..."
rm -rf data/status.db
rm -rf logs/*
rm -rf node_modules

# Create necessary directories
echo "📁 Creating directories..."
mkdir -p data
mkdir -p logs

# Install dependencies
echo "📦 Installing dependencies..."
npm install --production

# Create .env file from template
echo "⚙️ Setting up configuration..."
if [ -f .env ]; then
    echo "   Backing up existing .env to .env.backup"
    cp .env .env.backup
fi
cp .env.example .env

# Install PM2 if not available
if ! command -v pm2 &> /dev/null; then
    echo "📦 Installing PM2 globally..."
    npm install -g pm2
fi

# Start the application
echo "▶️ Starting application with PM2..."
pm2 start ecosystem.config.js

# Wait for initialization
echo "⏳ Waiting for application to initialize..."
sleep 10

# Verify the application is running
echo "🔍 Verifying deployment..."
if pm2 list | grep -q "status-monitor.*online"; then
    echo "✅ PM2 process is running!"
else
    echo "❌ PM2 process failed to start!"
    pm2 logs status-monitor --lines 10
    exit 1
fi

# Test health endpoint
echo "🏥 Testing health endpoint..."
for i in {1..5}; do
    if curl -s http://localhost:3001/health > /dev/null; then
        echo "✅ Health check passed!"
        break
    else
        echo "   Attempt $i/5 failed, retrying in 3 seconds..."
        sleep 3
    fi
    
    if [ $i -eq 5 ]; then
        echo "❌ Health check failed after 5 attempts"
        echo "📋 Recent logs:"
        pm2 logs status-monitor --lines 20
        exit 1
    fi
done

# Test status API
echo "📊 Testing status API..."
sleep 5
STATUS_RESPONSE=$(curl -s http://localhost:3001/api/status || echo "failed")
if [ "$STATUS_RESPONSE" != "failed" ]; then
    OVERALL_STATUS=$(echo $STATUS_RESPONSE | jq -r '.overall' 2>/dev/null || echo "unknown")
    echo "✅ Status API is responding! Overall status: $OVERALL_STATUS"
else
    echo "⚠️ Status API not ready yet, but server is running"
fi

# Save PM2 configuration
echo "💾 Saving PM2 configuration..."
pm2 save

# Setup PM2 startup (optional, requires sudo)
echo "🔄 Setting up PM2 startup script..."
pm2 startup || echo "⚠️ PM2 startup setup requires manual configuration"

echo ""
echo "🎉 DEPLOYMENT COMPLETED SUCCESSFULLY!"
echo "=================================================="
echo ""
echo "📊 Server Status:"
pm2 list | grep status-monitor || echo "Process not found in PM2 list"
echo ""
echo "🔗 Endpoints:"
echo "   Health: http://localhost:3001/health"
echo "   Status: http://localhost:3001/api/status"
echo "   Public: http://18.193.42.105:3001/api/status"
echo ""
echo "📋 Management Commands:"
echo "   View logs:    pm2 logs status-monitor"
echo "   Monitor:      pm2 monit"
echo "   Restart:      pm2 restart status-monitor"
echo "   Stop:         pm2 stop status-monitor"
echo ""
echo "🎯 Expected Results:"
echo "   - Services are checked every 5 seconds"
echo "   - All services should show 'operational' within 30 seconds"
echo "   - 403 status codes are normal for authenticated services"
echo "   - Overall status should be 'operational'"
echo "   - Historical data API available at /api/history"
echo "   - Timeline data for 90-day status visualization"
echo ""
echo "🔍 Quick Status Check:"
curl -s http://localhost:3001/api/status | jq -r '.overall' 2>/dev/null || echo "Status API still initializing..."

echo ""
echo "🧪 Testing History API:"
curl -s http://localhost:3001/api/history/test | jq -r '.status' 2>/dev/null || echo "History API test failed"

echo ""
echo "📊 Testing History Data:"
HISTORY_COUNT=$(curl -s "http://localhost:3001/api/history?days=7" | jq '. | length' 2>/dev/null || echo "0")
echo "History API returned $HISTORY_COUNT days of data"

echo ""
echo "📈 Testing Statistics API:"
UPTIME=$(curl -s "http://localhost:3001/api/stats" | jq -r '.uptime' 2>/dev/null || echo "N/A")
echo "Current uptime: $UPTIME%"

echo ""
echo "🔧 Useful Scripts:"
echo "   API Test: chmod +x test-api.sh && ./test-api.sh"
echo "   DB Check: chmod +x check-database.sh && ./check-database.sh"

echo ""
echo "📊 Initial Database Check:"
chmod +x check-database.sh
./check-database.sh

echo ""
echo "✅ Deployment finished! Monitor the logs for any issues."
echo ""
echo "⏰ Note: Historical data will accumulate over time."
echo "📈 Timeline will show real data as monitoring continues."