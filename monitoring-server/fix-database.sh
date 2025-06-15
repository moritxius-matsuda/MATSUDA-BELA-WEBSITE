#!/bin/bash

echo "🔧 Fixing Database Structure..."
echo "==============================="

# Stop the monitoring service
echo "1. Stopping monitoring service..."
pm2 stop status-monitor

# Backup existing database if it exists
if [ -f "data/status.db" ]; then
    echo "2. Backing up existing database..."
    cp data/status.db data/status.db.backup.$(date +%Y%m%d_%H%M%S)
    echo "   Backup created: data/status.db.backup.$(date +%Y%m%d_%H%M%S)"
fi

# Remove corrupted database
echo "3. Removing corrupted database..."
rm -f data/status.db

# Ensure data directory exists
mkdir -p data

# Restart the monitoring service (this will recreate the database)
echo "4. Restarting monitoring service..."
pm2 start ecosystem.config.js

# Wait for service to initialize
echo "5. Waiting for database initialization..."
sleep 5

# Check if database was created properly
echo "6. Verifying database structure..."
if [ -f "data/status.db" ]; then
    echo "✅ Database file created successfully"
    
    # Install sqlite3 if not available
    if ! command -v sqlite3 &> /dev/null; then
        echo "📦 Installing sqlite3..."
        apt-get update && apt-get install -y sqlite3
    fi
    
    # Check tables
    echo "📋 Database tables:"
    sqlite3 data/status.db ".tables"
    
    echo ""
    echo "🏗️ Services table:"
    sqlite3 data/status.db "SELECT COUNT(*) as service_count FROM services;"
    
    echo ""
    echo "📊 Status checks table structure:"
    sqlite3 data/status.db ".schema status_checks"
    
else
    echo "❌ Database file was not created"
    echo "💡 Check PM2 logs for errors:"
    pm2 logs status-monitor --lines 10
fi

echo ""
echo "7. Current PM2 status:"
pm2 list | grep status-monitor

echo ""
echo "8. Recent logs:"
pm2 logs status-monitor --lines 5 --nostream

echo ""
echo "✅ Database fix completed!"
echo ""
echo "🔍 To verify everything is working:"
echo "   ./check-database.sh"
echo "   ./test-api.sh"