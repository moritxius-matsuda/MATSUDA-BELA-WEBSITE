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

# Start the application
echo "▶️  Starting application..."
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 startup script
pm2 startup

echo "✅ Deployment completed!"
echo "📊 Monitor logs with: pm2 logs status-monitor"
echo "📈 Monitor status with: pm2 monit"
echo "🔄 Restart with: pm2 restart status-monitor"
echo ""
echo "🌐 Server should be running on port 3001"
echo "🔍 Health check: curl http://localhost:3001/health"