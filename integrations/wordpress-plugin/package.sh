#!/bin/bash

# AnonPress WordPress Plugin - Packaging Script
# This script creates a production-ready ZIP file for WordPress deployment

set -e

echo "🚀 AnonPress Plugin Packager"
echo "============================"
echo ""

# Configuration
PLUGIN_NAME="anonpress"
VERSION="1.0.0"
OUTPUT_DIR="dist"
ZIP_NAME="${PLUGIN_NAME}-${VERSION}.zip"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "anonpress.php" ]; then
    echo -e "${RED}Error: anonpress.php not found. Run this script from the plugin directory.${NC}"
    exit 1
fi

echo -e "${YELLOW}Step 1: Cleaning up...${NC}"
# Remove old dist directory
rm -rf "$OUTPUT_DIR"
mkdir -p "$OUTPUT_DIR/$PLUGIN_NAME"

echo -e "${YELLOW}Step 2: Copying files...${NC}"

# Copy required files
cp anonpress.php "$OUTPUT_DIR/$PLUGIN_NAME/"
cp LICENSE "$OUTPUT_DIR/$PLUGIN_NAME/"
cp README.md "$OUTPUT_DIR/$PLUGIN_NAME/"
cp readme.txt "$OUTPUT_DIR/$PLUGIN_NAME/"
cp uninstall.php "$OUTPUT_DIR/$PLUGIN_NAME/"

# Copy directories
cp -r includes "$OUTPUT_DIR/$PLUGIN_NAME/"
cp -r templates "$OUTPUT_DIR/$PLUGIN_NAME/"
cp -r assets "$OUTPUT_DIR/$PLUGIN_NAME/"

# Optional: Copy documentation (comment out if you want smaller package)
echo -e "${YELLOW}Step 3: Including documentation...${NC}"
cp QUICKSTART.md "$OUTPUT_DIR/$PLUGIN_NAME/" 2>/dev/null || echo "  ⚠️  QUICKSTART.md not found (optional)"
cp INTEGRATION.md "$OUTPUT_DIR/$PLUGIN_NAME/" 2>/dev/null || echo "  ⚠️  INTEGRATION.md not found (optional)"
cp DEPLOYMENT.md "$OUTPUT_DIR/$PLUGIN_NAME/" 2>/dev/null || echo "  ⚠️  DEPLOYMENT.md not found (optional)"

echo -e "${YELLOW}Step 4: Cleaning up unnecessary files...${NC}"
# Remove development files
find "$OUTPUT_DIR/$PLUGIN_NAME" -name ".DS_Store" -delete
find "$OUTPUT_DIR/$PLUGIN_NAME" -name ".git*" -delete
find "$OUTPUT_DIR/$PLUGIN_NAME" -name "*.log" -delete
find "$OUTPUT_DIR/$PLUGIN_NAME" -name "node_modules" -type d -exec rm -rf {} + 2>/dev/null || true

echo -e "${YELLOW}Step 5: Setting permissions...${NC}"
# Set proper permissions
find "$OUTPUT_DIR/$PLUGIN_NAME" -type f -exec chmod 644 {} \;
find "$OUTPUT_DIR/$PLUGIN_NAME" -type d -exec chmod 755 {} \;

echo -e "${YELLOW}Step 6: Creating ZIP file...${NC}"
# Create ZIP
cd "$OUTPUT_DIR"
zip -r "$ZIP_NAME" "$PLUGIN_NAME" -q
cd ..

# Get file size
FILE_SIZE=$(du -h "$OUTPUT_DIR/$ZIP_NAME" | cut -f1)

echo ""
echo -e "${GREEN}✅ Success!${NC}"
echo ""
echo "📦 Package created: $OUTPUT_DIR/$ZIP_NAME"
echo "📊 Size: $FILE_SIZE"
echo ""
echo "Next steps:"
echo "1. Go to WordPress Admin → Plugins → Add New"
echo "2. Click 'Upload Plugin'"
echo "3. Choose: $OUTPUT_DIR/$ZIP_NAME"
echo "4. Click 'Install Now'"
echo "5. Activate the plugin"
echo "6. Configure settings at AnonPress → Settings"
echo ""
echo -e "${GREEN}Happy publishing! 🚀${NC}"
