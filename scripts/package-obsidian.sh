#!/bin/bash
set -e

echo "📦 Packaging PressProtocol Obsidian Sovereign Publishing Plugin..."

ROOT_DIR="$(pwd)"
OBSIDIAN_DIR="$ROOT_DIR/integrations/obsidian-plugin"
OUTPUT_DIR="$ROOT_DIR/apps/web/public/downloads"
TMP_STAGE="$OBSIDIAN_DIR/stage/pressprotocol"

mkdir -p "$OUTPUT_DIR"
rm -rf "$OBSIDIAN_DIR/stage"
mkdir -p "$TMP_STAGE"

# 1. Copy required files to stage
echo "📂 Staging Obsidian plugin files..."
cp "$OBSIDIAN_DIR/main.js" "$TMP_STAGE/"
cp "$OBSIDIAN_DIR/manifest.json" "$TMP_STAGE/"
cp "$OBSIDIAN_DIR/styles.css" "$TMP_STAGE/"
cp "$OBSIDIAN_DIR/README.md" "$TMP_STAGE/"

# Clean up dev files
find "$TMP_STAGE" -name ".DS_Store" -delete

# 2. Package into zip
echo "🗜️  Creating release zip bundle..."
cd "$OBSIDIAN_DIR/stage"
zip -r "$OUTPUT_DIR/PressProtocol_Obsidian_Plugin.zip" "pressprotocol" -q
cp "$OUTPUT_DIR/PressProtocol_Obsidian_Plugin.zip" "$OUTPUT_DIR/press-protocol-obsidian.zip"
cd "$ROOT_DIR"

rm -rf "$OBSIDIAN_DIR/stage"

echo "✅ Obsidian plugin packaged successfully:"
echo "   - $OUTPUT_DIR/PressProtocol_Obsidian_Plugin.zip"
echo "   - $OUTPUT_DIR/press-protocol-obsidian.zip"
