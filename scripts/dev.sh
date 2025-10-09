#!/bin/bash

# AnonPress Development Script
# Starts all services in development mode with Prisma Postgres

set -e

echo "🚀 Starting AnonPress Development Environment"
echo "============================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping services..."
    kill $(jobs -p) 2>/dev/null || true
    echo "✅ Cleanup complete"
}

trap cleanup EXIT INT TERM

# Check if .env exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  .env file not found. Running setup...${NC}"
    ./scripts/setup.sh
    exit 0
fi

# Check if backend .env exists
if [ ! -f backend/.env ]; then
    echo -e "${RED}❌ backend/.env file not found${NC}"
    echo "Please create backend/.env with your Prisma Postgres DATABASE_URL"
    echo "Run: ./scripts/setup.sh"
    exit 1
fi

echo -e "${GREEN}✅ Using Prisma Postgres (cloud database)${NC}"
echo ""

# Start backend
echo "🔧 Starting backend API..."
cd backend
npm run dev &
BACKEND_PID=$!
cd ..

# Wait for backend to be ready
echo "⏳ Waiting for backend to be ready..."
for i in {1..30}; do
    if curl -s http://localhost:4000/health > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Backend ready${NC}"
        break
    fi
    if [ $i -eq 30 ]; then
        echo "❌ Backend failed to start"
        exit 1
    fi
    sleep 1
done

echo ""

# Start web app
echo "🌐 Starting web app..."
cd web-app
if command -v bun &> /dev/null; then
    bun dev &
else
    npm run dev &
fi
WEBAPP_PID=$!
cd ..

echo ""
echo -e "${GREEN}✅ All services started!${NC}"
echo ""
echo "📍 Services running at:"
echo "   Backend:  http://localhost:4000"
echo "   Web App:  http://localhost:3000"
echo ""
echo "📝 Logs:"
echo "   - Backend logs are streaming above"
echo "   - Web app logs are streaming above"
echo ""
echo "🛑 Press Ctrl+C to stop all services"
echo ""

# Wait for processes
wait
