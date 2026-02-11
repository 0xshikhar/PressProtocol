#!/bin/bash

set -e

echo "🚀 Setting up AnonPress Browser Extension V2"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build extension
echo "🔨 Building extension..."
npm run build

# Create icons directory
echo "🎨 Creating placeholder icons..."
mkdir -p dist/icons
# Note: Add actual icon files to dist/icons/ manually

echo ""
echo "✅ Setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Add icon files (icon-16.png, icon-48.png, icon-128.png) to dist/icons/"
echo "2. Open Chrome and go to chrome://extensions"
echo "3. Enable 'Developer mode'"
echo "4. Click 'Load unpacked'"
echo "5. Select the 'dist' folder"
echo ""
echo "🔥 Extension is ready to use!"
