#!/bin/bash

# Status Monitoring Server Deployment Script
# Usage: ./deploy.sh

set -e

echo "🚀 Deploying Status Monitoring Server..."

# Create necessary directories
mkdir -p data
mkdir -p logs

# Install dependencies
echo "📦 Installing dependencies..."
npm install --production

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "⚙️ Creating .env file from template..."
    cp .env.example .env
    echo "⚠️  Please edit .env file with your configuration!"
fi

# Set up PM2 if not already installed
if ! command -v pm2 &> /dev/null; then
    echo "📦 Installing PM2 globally..."
    npm install -g pm2
fi

# Stop existing process if running
echo "🛑 Stopping existing process..."
pm2 stop status-monitor 2>/dev/null || true
pm2 delete status-monitor 2>/dev/null || true

# Remove old database to start fresh
echo "🗑️  Removing old database for fresh start..."
rm -f data/status.db

# Start the application
echo "▶️  Starting application..."
pm2 start ecosystem.config.js

# Wait for application to initialize
echo "⏳ Waiting for application to initialize..."
sleep 5

# Verify the application is running
echo "🔍 Verifying application status..."
if pm2 list | grep -q "status-monitor.*online"; then
    echo "✅ Application is running successfully!"
else
    echo "❌ Application failed to start. Check logs:"
    pm2 logs status-monitor --lines 20
    exit 1
fi

# Save PM2 configuration
pm2 save

# Setup PM2 startup script
pm2 startup

echo "✅ Deployment completed!"
echo ""
echo "🔍 Testing the monitoring server..."
sleep 3

# Test the health endpoint
if curl -s http://localhost:3001/health > /dev/null; then
    echo "✅ Health check passed!"
else
    echo "⚠️  Health check failed, but server might still be starting..."
fi

# Show initial status
echo ""
echo "📊 Initial status check:"
curl -s http://localhost:3001/api/status | jq -r '.overall' 2>/dev/null || echo "Status API not ready yet"

echo ""
echo "📋 Useful commands:"
echo "📊 Monitor logs: pm2 logs status-monitor"
echo "📈 Monitor status: pm2 monit"
echo "🔄 Restart: pm2 restart status-monitor"
echo "🔍 Health check: curl http://localhost:3001/health"
echo "📊 Status API: curl http://localhost:3001/api/status"
echo ""
echo "🌐 Server is running on port 3001"
echo "🎯 All services should show 'operational' status within 1-2 minutes"