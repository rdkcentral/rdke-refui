#!/bin/bash
# flutter-dist.sh - Build script for Flutter Web production build
# Generates a deployable flutter-dist/ folder in the project root.
#
# Usage: bash flutter-dist.sh
# Requirements: Flutter SDK must be installed and in PATH.

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
FLUTTER_APP_DIR="$SCRIPT_DIR"
DIST_DIR="$PROJECT_ROOT/flutter-dist"

echo "=========================================="
echo " RDK RefUI - Flutter Web Build"
echo "=========================================="
echo ""

# Step 1: Clean previous builds
echo "[1/4] Cleaning previous builds..."
if [ -d "$DIST_DIR" ]; then
    rm -rf "$DIST_DIR"
    echo "       Removed existing flutter-dist/"
fi

cd "$FLUTTER_APP_DIR"
flutter clean
echo "       Flutter clean complete."
echo ""

# Step 2: Get dependencies
echo "[2/4] Getting dependencies..."
flutter pub get
echo "       Dependencies resolved."
echo ""

# Step 3: Build Flutter Web (release)
echo "[3/4] Building Flutter Web (release)..."
flutter build web --release
echo "       Build complete."
echo ""

# Step 4: Copy output to flutter-dist/
echo "[4/4] Copying build output to flutter-dist/..."
cp -r "$FLUTTER_APP_DIR/build/web" "$DIST_DIR"
echo "       Output copied to: $DIST_DIR"
echo ""

echo "=========================================="
echo " BUILD SUCCESSFUL"
echo "=========================================="
echo ""
echo " Output: $DIST_DIR"
echo ""
echo " To serve locally:"
echo "   cd $DIST_DIR"
echo "   python3 -m http.server 8080"
echo ""
echo " Then open: http://localhost:8080"
echo "=========================================="
