#!/bin/bash

# If not stated otherwise in this file or this component's LICENSE file the
# following copyright and licenses apply:
#
# Copyright 2025 RDK Management
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
# http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

# pack-flutter.sh - Build Flutter Web app and create a bolt-compatible package
# Usage: ./pack-flutter.sh
# Similar to pack.sh but for the Flutter Web application

set -e

START_DIR="$(pwd -P)"

echo "=========================================="
echo " Building Flutter Web for Bolt Package"
echo "=========================================="
echo ""

# Step 1: Build Flutter Web
echo "[1/3] Building Flutter Web application..."
pushd ../flutter-app

flutter pub get
flutter build web --release

if [ ! -d "build/web" ]; then
  echo "Flutter build/web was not created!"
  exit 1
fi

echo "       Flutter build complete."
popd

# Step 2: Create package structure
echo "[2/3] Creating package structure..."
TMPDIR=$(mktemp -d)
mkdir -p "$TMPDIR/usr/share/flutter-refui"

cp -r ../flutter-app/build/web/* "$TMPDIR/usr/share/flutter-refui/"
cp ../LICENSE "$TMPDIR/usr/share/flutter-refui/"
cp ../NOTICE "$TMPDIR/usr/share/flutter-refui/"

# Step 3: Create tarball
echo "[3/3] Creating package tarball..."
pushd "$TMPDIR"

TAR_DIR="$START_DIR/packages"
mkdir -p "$TAR_DIR"

TAR_OUTPUT="$TAR_DIR/flutter-refui.tgz"

tar czf "$TAR_OUTPUT" usr

popd

rm -rf "$TMPDIR"

echo ""
echo "=========================================="
echo " BUILD SUCCESSFUL"
echo "=========================================="
echo ""
echo " Package: $TAR_OUTPUT"
echo ""
echo " To create bolt package:"
echo "   bolt pack package-configs/com.rdkcentral.flutter.json $TAR_OUTPUT"
echo ""
echo " To deploy to device:"
echo "   bolt push <device> com.rdkcentral.flutter+1.0.0.bolt"
echo "   bolt run <device> com.rdkcentral.flutter"
echo "=========================================="
