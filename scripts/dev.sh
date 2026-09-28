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

TOR_SPAWNED_BY_SCRIPT=false

# Cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping services..."
    if [ "$TOR_SPAWNED_BY_SCRIPT" = true ] && [ -f "core/node/.data/tor/tor.pid" ]; then
        TOR_PID=$(cat "core/node/.data/tor/tor.pid" 2>/dev/null || true)
        if [ -n "$TOR_PID" ] && kill -0 "$TOR_PID" 2>/dev/null; then
            echo "🧅 Stopping local Tor daemon (PID $TOR_PID)..."
            kill "$TOR_PID" 2>/dev/null || true
            rm -f "core/node/.data/tor/tor.pid"
        fi
    fi
    kill $(jobs -p) 2>/dev/null || true
    echo "✅ Cleanup complete"
}

trap cleanup EXIT INT TERM

MODE=${1:-"--all"}

# Start Tor Hidden Service Daemon
start_tor() {
    if command -v tor >/dev/null 2>&1; then
        mkdir -p core/node/.data/tor/onion_service core/node/.data/tor/data
        chmod 700 core/node/.data/tor core/node/.data/tor/onion_service core/node/.data/tor/data 2>/dev/null || true
        
        TOR_DIR="$(pwd)/core/node/.data/tor"
        if [ ! -f core/node/.data/tor/torrc ]; then
            cat << EOF > core/node/.data/tor/torrc
DataDirectory ${TOR_DIR}/data
HiddenServiceDir ${TOR_DIR}/onion_service
HiddenServicePort 80 127.0.0.1:4000
SocksPort 9052
PidFile ${TOR_DIR}/tor.pid
Log notice file ${TOR_DIR}/tor.log
EOF
        fi

        TOR_PID_FILE="${TOR_DIR}/tor.pid"
        TOR_RUNNING=false
        if [ -f "$TOR_PID_FILE" ]; then
            PID=$(cat "$TOR_PID_FILE" 2>/dev/null || true)
            if [ -n "$PID" ] && kill -0 "$PID" 2>/dev/null; then
                TOR_RUNNING=true
            else
                rm -f "$TOR_PID_FILE"
            fi
        fi

        if [ "$TOR_RUNNING" = false ]; then
            echo "🧅 Starting local Tor v3 Hidden Service daemon..."
            tor -f core/node/.data/tor/torrc --runasdaemon 1
            TOR_SPAWNED_BY_SCRIPT=true
        else
            echo "🧅 Tor hidden service daemon already active on port 9052"
        fi

        if [ -f core/node/.data/tor/onion_service/hostname ]; then
            ONION_HOST=$(cat core/node/.data/tor/onion_service/hostname | tr -d '[:space:]')
            echo -e "${GREEN}🧅 Tor v3 Address: http://${ONION_HOST}${NC}"
        fi
    fi
}

# Start Node Service
start_node() {
    start_tor
    export TOR_PROXY_PORT=${TOR_PROXY_PORT:-9052}
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
