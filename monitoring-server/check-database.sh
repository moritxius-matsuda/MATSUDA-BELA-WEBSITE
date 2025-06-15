#!/bin/bash

echo "🔍 Checking Database Structure and Data..."
echo "========================================"

# Check if database file exists
if [ -f "data/status.db" ]; then
    echo "✅ Database file exists: data/status.db"
    
    # Show database size
    DB_SIZE=$(ls -lh data/status.db | awk '{print $5}')
    echo "📊 Database size: $DB_SIZE"
    
    echo ""
    echo "📋 Database Tables:"
    sqlite3 data/status.db ".tables"
    
    echo ""
    echo "🏗️ status_checks table structure:"
    sqlite3 data/status.db ".schema status_checks" 2>/dev/null || echo "❌ status_checks table does not exist"
    
    echo ""
    echo "📊 Services in database:"
    sqlite3 data/status.db "SELECT id, name, url FROM services;" 2>/dev/null || echo "❌ services table does not exist"
    
    echo ""
    echo "📈 Status checks count:"
    CHECK_COUNT=$(sqlite3 data/status.db "SELECT COUNT(*) FROM status_checks;" 2>/dev/null || echo "0")
    echo "Total status checks: $CHECK_COUNT"
    
    if [ "$CHECK_COUNT" -gt 0 ]; then
        echo ""
        echo "📅 Date range of status checks:"
        sqlite3 data/status.db "SELECT MIN(DATE(checked_at)) as first_check, MAX(DATE(checked_at)) as last_check FROM status_checks;" 2>/dev/null
        
        echo ""
        echo "📊 Status distribution:"
        sqlite3 data/status.db "SELECT status, COUNT(*) as count FROM status_checks GROUP BY status ORDER BY count DESC;" 2>/dev/null
        
        echo ""
        echo "🔍 Recent status checks (last 10):"
        sqlite3 data/status.db "SELECT service_id, status, response_time, checked_at FROM status_checks ORDER BY checked_at DESC LIMIT 10;" 2>/dev/null
    else
        echo "⚠️ No status checks found in database"
        echo "💡 This is normal for a new deployment. Data will accumulate over time."
    fi
    
else
    echo "❌ Database file does not exist: data/status.db"
    echo "💡 Run the monitoring server first to create the database"
fi

echo ""
echo "🔧 PM2 Status:"
pm2 list | grep status-monitor || echo "❌ status-monitor not running"

echo ""
echo "📝 Recent logs:"
pm2 logs status-monitor --lines 5 --nostream 2>/dev/null || echo "❌ No logs available"

echo ""
echo "✅ Database check completed!"