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

set -e

START_DIR="$(pwd -P)"

pushd ../accelerator-home-ui

npm install

npm install -g @lightningjs/cli

lng dist

if [ ! -d "dist" ]; then
  echo "Dist was not created!"
  exit 1
fi

TMPDIR=$(mktemp -d)
mkdir -p "$TMPDIR/usr/share/refui"

cp -r dist/es6/* "$TMPDIR/usr/share/refui/"
cp ../LICENSE "$TMPDIR/usr/share/refui/"
cp ../NOTICE "$TMPDIR/usr/share/refui/"

popd

pushd "$TMPDIR"

TAR_DIR="$START_DIR/packages"

mkdir -p "$TAR_DIR"

TAR_OUTPUT="$TAR_DIR/refui.tgz"

tar czf "$TAR_OUTPUT" usr

popd

rm -rf "$TMPDIR"

echo "File: $TAR_OUTPUT"
