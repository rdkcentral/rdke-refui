# Copyright 2025 RDK Management
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
# http://www.apache.org/licenses/LICENSE-2.0

SUMMARY = "Flutter Ref UI native app image for bolt packaging"

IMAGE_FSTYPES = "container oci"
inherit image
inherit image-oci

NO_RECOMMENDATIONS = "1"
IMAGE_LINGUAS = " "

ROOTFS_POSTPROCESS_COMMAND:append = " stub_gpu_libraries;"

# Remove stub GPU libraries from the rootfs.
# At runtime the real versions will be provided by the GPU layer.
stub_gpu_libraries() {
    rm -f ${IMAGE_ROOTFS}/usr/lib/libEGL.so
    rm -f ${IMAGE_ROOTFS}/usr/lib/libEGL.so.1
    rm -f ${IMAGE_ROOTFS}/usr/lib/libGLESv2.so
    rm -f ${IMAGE_ROOTFS}/usr/lib/libGLESv2.so.2
}

IMAGE_INSTALL += "refui-flutter-app"
IMAGE_INSTALL += "flutter-auto"
IMAGE_INSTALL += "flutter-engine"
