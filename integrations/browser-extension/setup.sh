#!/bin/bash

set -e

echo "🚀 Setting up AnonPress Browser Extension V2"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install

# Build extension
echo "Building extension..."
pnpm run build

echo ""
echo "✅ Setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Open Chrome and go to chrome://extensions"
echo "2. Enable 'Developer mode'"
echo "3. Click 'Load unpacked'"
echo "4. Select the 'integrations/browser-extension/dist' folder"
echo ""
echo "🔥 Extension is ready to use!"
