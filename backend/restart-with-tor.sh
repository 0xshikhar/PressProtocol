#!/bin/bash

# Restart Backend with Tor Integration
# This script rebuilds the Docker image and restarts services

set -e

echo "🔄 Restarting AnonPress Backend with Tor Integration..."
echo "======================================================="
echo ""

# Step 1: Stop containers
echo "⏸️  Step 1: Stopping containers..."
docker-compose down

echo ""

# Step 2: Rebuild backend with new Tor code
echo "🔨 Step 2: Rebuilding backend image..."
docker-compose build --no-cache backend

echo ""

# Step 3: Start all services
echo "🚀 Step 3: Starting services..."
docker-compose up -d

echo ""

# Step 4: Wait for backend to be ready
echo "⏳ Step 4: Waiting for backend to initialize..."
sleep 15

echo ""

# Step 5: Check onion service
echo "🧅 Step 5: Checking Tor onion service..."
curl -s http://localhost:4000/api/mirrors/onion-url | jq || echo "Backend starting up..."

echo ""
echo ""

# Step 6: Check logs
echo "📋 Step 6: Recent backend logs:"
echo "================================"
docker-compose logs --tail 30 backend

echo ""
echo ""
echo "✅ Backend restarted!"
echo ""
echo "🔗 Next steps:"
echo "1. Wait ~30 seconds for Tor onion address to be generated"
echo "2. Publish test content: http://localhost:3000/write"
echo "3. Check /read page for Tor .onion link"
echo ""
echo "💡 To see live logs:"
echo "   docker-compose logs -f backend"
echo ""
