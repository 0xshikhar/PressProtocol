#!/bin/bash
set -e

echo "📦 Packaging PressProtocol WordPress Publishing Bridge..."

ROOT_DIR="$(pwd)"
WP_DIR="$ROOT_DIR/integrations/wordpress-plugin"
OUTPUT_DIR="$ROOT_DIR/apps/web/public/downloads"
TMP_STAGE="$WP_DIR/stage/pressprotocol"

mkdir -p "$OUTPUT_DIR"
rm -rf "$WP_DIR/stage"
mkdir -p "$TMP_STAGE"

# 1. Copy required files to stage
echo "📂 Staging WordPress plugin files..."
cp "$WP_DIR/anonpress.php" "$TMP_STAGE/"
cp "$WP_DIR/LICENSE" "$TMP_STAGE/"
cp "$WP_DIR/README.md" "$TMP_STAGE/"
cp "$WP_DIR/readme.txt" "$TMP_STAGE/"
cp "$WP_DIR/uninstall.php" "$TMP_STAGE/"
cp -r "$WP_DIR/includes" "$TMP_STAGE/"
cp -r "$WP_DIR/templates" "$TMP_STAGE/"
cp -r "$WP_DIR/assets" "$TMP_STAGE/"

# Clean up dev files
find "$TMP_STAGE" -name ".DS_Store" -delete
find "$TMP_STAGE" -name "*.log" -delete

# 2. Package into zip
echo "🗜️  Creating release zip bundles..."
cd "$WP_DIR/stage"
zip -r "$OUTPUT_DIR/PressProtocol_Wordpress_Plugin.zip" "pressprotocol" -q
cp "$OUTPUT_DIR/PressProtocol_Wordpress_Plugin.zip" "$OUTPUT_DIR/press-protocol-wordpress.zip"
cd "$ROOT_DIR"

rm -rf "$WP_DIR/stage"

echo "✅ WordPress plugin packaged successfully:"
echo "   - $OUTPUT_DIR/PressProtocol_Wordpress_Plugin.zip"
echo "   - $OUTPUT_DIR/press-protocol-wordpress.zip"
