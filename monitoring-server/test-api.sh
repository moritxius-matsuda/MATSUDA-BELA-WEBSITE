
#!/bin/bash

echo "🔍 Testing Monitoring Server APIs..."
echo "=================================="

# Test basic health
echo "1. Testing health endpoint:"
curl -s http://localhost:3001/health | jq '.' || echo "Health endpoint failed"

echo ""
echo "2. Testing status endpoint:"
curl -s http://localhost:3001/api/status | jq '.overall' || echo "Status endpoint failed"

echo ""
echo "3. Testing history test endpoint:"
curl -s http://localhost:3001/api/history/test | jq '.' || echo "History test endpoint failed"

echo ""
echo "4. Testing history endpoint:"
curl -s "http://localhost:3001/api/history?service=main-website&days=7" | jq '. | length' || echo "History endpoint failed"

echo ""
echo "5. Testing all services history:"
curl -s "http://localhost:3001/api/history?days=7" | jq '. | length' || echo "All services history failed"

echo ""
echo "6. Testing statistics endpoint:"
curl -s "http://localhost:3001/api/stats" | jq '.uptime' || echo "Statistics endpoint failed"

echo ""
echo "7. Testing service-specific stats:"
curl -s "http://localhost:3001/api/stats/main-website" | jq '.uptime' || echo "Service stats failed"

echo ""
echo "8. PM2 Status:"
pm2 list | grep status-monitor

echo ""
echo "9. Recent logs:"
pm2 logs status-monitor --lines 5 --nostream

echo ""
echo "✅ API Test completed!"