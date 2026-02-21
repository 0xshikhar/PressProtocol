#!/bin/bash

# PressProtocol Setup Script (PNPM Driven)
# Automates the initial setup process with PNPM

set -e

echo "🚀 PressProtocol Setup Script"
echo "============================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Check prerequisites
echo "📋 Checking prerequisites..."

# Check Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    echo "Please install Node.js 20+ from https://nodejs.org"
    exit 1
fi
echo -e "${GREEN}✅ Node.js $(node --version)${NC}"

# Check pnpm
if ! command -v pnpm &> /dev/null; then
    echo -e "${RED}❌ pnpm is not installed${NC}"
    echo "Please install pnpm using: npm install -g pnpm or corepack enable"
    exit 1
fi
echo -e "${GREEN}✅ pnpm $(pnpm --version)${NC}"

echo ""

# Setup core/node
echo "🔧 Setting up PressProtocol Node (core/node)..."
if [ -d "core/node" ]; then
    pnpm --dir core/node install
    if [ -f "core/node/prisma/schema.prisma" ]; then
        echo "Generating Prisma client..."
        pnpm --dir core/node exec prisma generate --no-engine || true
    fi
    echo -e "${GREEN}✅ core/node dependencies configured${NC}"
fi

echo ""

# Setup apps/web
echo "🌐 Setting up PressProtocol Web App (apps/web)..."
if [ -d "apps/web" ]; then
    pnpm --dir apps/web install
    echo -e "${GREEN}✅ apps/web dependencies configured${NC}"
fi

echo ""

# Setup browser extension integration
if [ -d "integrations/browser-extension" ]; then
    echo "🔌 Setting up browser extension..."
    pnpm --dir integrations/browser-extension install || true
    echo -e "${GREEN}✅ Browser extension dependencies configured${NC}"
fi

echo ""
echo -e "${GREEN}🎉 Setup complete! Run ./scripts/dev.sh to launch environment.${NC}"
