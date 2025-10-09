#!/bin/bash

# AnonPress Setup Script
# Automates the initial setup process with Prisma Postgres

set -e

echo "🚀 AnonPress Setup Script"
echo "=========================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check prerequisites
echo "📋 Checking prerequisites..."

# Check Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    echo "Please install Node.js 20+ from https://nodejs.org"
    exit 1
fi
echo -e "${GREEN}✅ Node.js $(node --version)${NC}"

echo ""

# Setup environment
echo "⚙️  Setting up environment..."

if [ ! -f .env ]; then
    cp .env.example .env
    echo -e "${GREEN}✅ Created .env file${NC}"
    echo -e "${YELLOW}⚠️  Please edit .env and add your Pinata API keys${NC}"
    echo ""
    echo "Get Pinata keys from: https://pinata.cloud"
    echo "Then run this script again."
    echo ""
    read -p "Press Enter to open .env file..."
    ${EDITOR:-nano} .env
    exit 0
else
    echo -e "${GREEN}✅ .env file exists${NC}"
fi

# Check if Pinata keys are set
if grep -q "your_pinata_api_key" .env; then
    echo -e "${RED}❌ Please configure Pinata API keys in .env${NC}"
    exit 1
fi

echo ""

# Setup backend
echo "🔧 Setting up backend..."
cd backend

if [ ! -d "node_modules" ]; then
    echo "Installing backend dependencies..."
    npm install
    echo -e "${GREEN}✅ Backend dependencies installed${NC}"
else
    echo -e "${GREEN}✅ Backend dependencies already installed${NC}"
fi

# Generate Prisma client
echo "Generating Prisma client..."
npx prisma generate
echo -e "${GREEN}✅ Prisma client generated${NC}"

cd ..

echo ""

# Setup web app
echo "🌐 Setting up web app..."
cd web-app

if [ ! -d "node_modules" ]; then
    echo "Installing web app dependencies..."
    if command -v bun &> /dev/null; then
        bun install
    else
        npm install
    fi
    echo -e "${GREEN}✅ Web app dependencies installed${NC}"
else
    echo -e "${GREEN}✅ Web app dependencies already installed${NC}"
fi

cd ..

echo ""

# Setup browser extension
echo "🔌 Setting up browser extension..."
cd browser-extension

if [ ! -d "node_modules" ]; then
    echo "Installing extension dependencies..."
    npm install
    echo -e "${GREEN}✅ Extension dependencies installed${NC}"
else
    echo -e "${GREEN}✅ Extension dependencies already installed${NC}"
fi

cd ..

echo ""

# Database setup
echo "🗄️  Database setup (Prisma Postgres)..."
echo ""
echo -e "${BLUE}ℹ️  AnonPress uses Prisma Postgres (fully managed cloud database)${NC}"
echo ""
echo "📝 Setup steps:"
echo "   1. Go to: https://console.prisma.io"
echo "   2. Create a new project (or use existing)"
echo "   3. Select 'Prisma Postgres' as your database"
echo "   4. Copy the DATABASE_URL connection string"
echo "   5. Add it to backend/.env file"
echo ""
read -p "Have you created your Prisma Postgres database? (y/n): " db_ready

if [ "$db_ready" != "y" ]; then
    echo -e "${YELLOW}⚠️  Please set up Prisma Postgres first${NC}"
    echo ""
    echo "Visit: https://console.prisma.io"
    echo "Then run this script again."
    exit 0
fi

echo ""

# Run migrations
echo "🔄 Running database migrations..."
cd backend
npx prisma migrate dev --name init
echo -e "${GREEN}✅ Database migrations complete${NC}"
cd ..

echo ""
echo "✅ Setup complete!"
echo ""
echo "📝 Next steps:"
echo "1. Start backend:     cd backend && npm run dev"
echo "2. Start web app:     cd web-app && bun dev"
echo "3. Start extension:   cd browser-extension && npm run dev"
echo ""
echo "Or use the dev script: ./scripts/dev.sh"
echo ""
echo "📚 Documentation:"
echo "- Quick Start:  cat QUICKSTART.md"
echo "- Full Guide:   cat SETUP_GUIDE.md"
echo ""
echo "🎉 Happy publishing!"
