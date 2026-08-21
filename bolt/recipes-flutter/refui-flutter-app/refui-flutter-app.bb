# Copyright 2025 RDK Management
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
# http://www.apache.org/licenses/LICENSE-2.0

SUMMARY = "RDK Reference UI Flutter Native Application"
DESCRIPTION = "Native AOT-compiled Flutter application for the RDK Reference UI"
LICENSE = "Apache-2.0"
LIC_FILES_CHKSUM = "file://${COMMON_LICENSE_DIR}/Apache-2.0;md5=89aea4e17d99a7cacdbeed46a0096b10"

DEPENDS += "flutter-engine"

SRC_URI = "git://github.com/nickvth/rdke-refui.git;protocol=https;branch=Flutter_poc;destsuffix=refui-flutter-app"
SRCREV = "${AUTOREV}"

S = "${WORKDIR}/refui-flutter-app/flutter-app"

inherit flutter-app

FLUTTER_APPLICATION_INSTALL_PREFIX = "/usr/share/flutter/refui-flutter-app"

FLUTTER_BUILD_ARGS = "bundle"
