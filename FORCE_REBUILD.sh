#!/bin/bash

# Force Complete Rebuild - No Cache
set -e

echo "🔥 FORCE REBUILD - Complete Clean Build"
echo "========================================"
echo ""

cd "$(dirname "$0")/backend"

# Step 1: Stop and remove everything
echo "🛑 Step 1: Stopping and removing containers..."
docker-compose down -v 2>/dev/null || true

echo ""

# Step 2: Force rebuild without cache
echo "🔨 Step 2: Building backend (no cache)..."
echo "This may take 5-10 minutes..."
docker-compose build --no-cache backend

echo ""

# Step 3: Start services
echo "🚀 Step 3: Starting services..."
docker-compose up -d

echo ""

# Step 4: Wait for backend
echo "⏳ Step 4: Waiting for backend (45 seconds)..."
sleep 45

echo ""

# Step 5: Verify the route exists in compiled code
echo "🔍 Step 5: Verifying compiled route..."
if docker-compose exec -T backend cat dist/routes/mirrors.js | grep -q "onion-url"; then
    echo "✅ Route 'onion-url' found in compiled code"
else
    echo "❌ Route 'onion-url' NOT found in compiled code!"
    echo "   This indicates a build problem."
fi

echo ""

# Step 6: Test endpoint
echo "🧅 Step 6: Testing endpoint..."
curl -s http://localhost:4000/api/mirrors/onion-url | jq '.' || echo "FAILED"

echo ""
echo ""
echo "✅ Rebuild complete!"
echo ""
echo "If still getting 404:"
echo "1. Check backend logs: docker-compose logs backend"
echo "2. Verify routes registered: docker-compose exec backend cat dist/index.js | grep mirrorsRoutes"
echo ""
