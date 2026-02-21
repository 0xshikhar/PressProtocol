#!/bin/bash

# PressProtocol Development Script (PNPM Driven)
# Starts node and/or web app in development mode

set -e

echo "🚀 Starting PressProtocol Development Environment"
echo "================================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping services..."
    kill $(jobs -p) 2>/dev/null || true
    echo "✅ Cleanup complete"
}

trap cleanup EXIT INT TERM

MODE=${1:-"--all"}

# Start Node Service
start_node() {
    if [ ! -f core/node/.env ]; then
        echo -e "${YELLOW}⚠️ core/node/.env file not found. Creating from .env.example if available...${NC}"
        if [ -f core/node/.env.example ]; then
            cp core/node/.env.example core/node/.env
        fi
    fi
    echo "🔧 Starting PressProtocol Node Daemon (core/node)..."
    pnpm --dir core/node dev &
    NODE_PID=$!
}

# Start Web App
start_web() {
    echo "🌐 Starting PressProtocol Web App (apps/web)..."
    pnpm --dir apps/web dev &
    WEB_PID=$!
}

case "$MODE" in
    "--node")
        start_node
        ;;
    "--web")
        start_web
        ;;
    "--all"|*)
        start_node
        start_web
        ;;
esac

echo ""
echo -e "${GREEN}✅ Services initiated!${NC}"
echo ""
echo "📍 Endpoints:"
echo "   Node RPC / API: http://localhost:4000"
echo "   Web Portal:     http://localhost:3000"
echo ""
echo "🛑 Press Ctrl+C to stop services"
echo ""

wait
