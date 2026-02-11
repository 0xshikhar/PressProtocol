#!/bin/bash

echo "🧪 Testing /ipfs/:cid Route"
echo "==========================="
echo ""

CID="QmbdkGtJ7GBgHTyyuSnM6X98ezPFRw5PvUnYrYoAvUpyTk"

echo "📋 Testing: http://localhost:4000/ipfs/$CID"
echo ""

# Test if route exists
echo "1️⃣ Testing if route responds..."
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:4000/ipfs/$CID")
echo "   HTTP Status: $STATUS"
echo ""

if [ "$STATUS" = "200" ]; then
    echo "✅ Route works! Getting content..."
    echo ""
    curl -s "http://localhost:4000/ipfs/$CID" | head -30
else
    echo "❌ Route failed with status $STATUS"
    echo ""
    echo "🔍 Checking if route is registered..."
    docker-compose exec -T backend grep -n "fastify.get('/ipfs" dist/routes/content.js || echo "Route not found in compiled code"
fi

echo ""
