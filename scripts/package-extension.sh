#!/bin/bash
set -e

echo "📦 Packaging PressProtocol Chromium MV3 Extension..."

ROOT_DIR="$(pwd)"
DIST_DIR="$ROOT_DIR/integrations/browser-extension/dist"
OUTPUT_DIR="$ROOT_DIR/apps/web/public/downloads"

mkdir -p "$OUTPUT_DIR"

# 1. Build extension with pnpm
echo "🔨 Building extension TypeScript & copying assets..."
pnpm --filter pressprotocol-extension build

# 2. Package into zip
echo "🗜️  Creating release zip bundles..."
cd "$DIST_DIR"
zip -r "$OUTPUT_DIR/PressProtocol_Browser_Extension.zip" . -q
cp "$OUTPUT_DIR/PressProtocol_Browser_Extension.zip" "$OUTPUT_DIR/press-protocol-extension.zip"
cd "$ROOT_DIR"

echo "✅ Extension packaged successfully:"
echo "   - $OUTPUT_DIR/PressProtocol_Browser_Extension.zip"
echo "   - $OUTPUT_DIR/press-protocol-extension.zip"
