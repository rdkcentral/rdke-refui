# bolt

This directory contains tools and configuration files used to create a ref-ui bolt package to be used on RDK environment.

## Contents

### `pack.sh`

This script prepares `refui.tgz` archive containing `dist` of the application. `index.html` file is located within `/home/root/lxresui` directory.

### package-configs

This directory contains a configuration file compliant with <https://github.com/rdkcentral/oci-package-spec/blob/main/metadata.md>. It is used to create a bolt package that can be loaded via a `file://` URI.

## Usage

To preapre a bolt package:

1. You need to [bolt-tools](https://github.com/rdkcentral/bolt-tools) configured,
2. Create rootfs layer: `./pack.sh`,
3. Go to `packages` directory,
4. Create a bolt package: `bolt pack ../package-configs/com.rdkcentral.refui.json refui.tgz`
5. You should have `com.rdkcentral.refui+0.0.1.bolt` created in the `packages` directory.

To run:

1. Ensure you have `gpu-layer` prepared,
2. Ensure you have `base` and `wpe-develop` packages pushed to the STB,
3. `bolt push <STB_IP> com.rdkcentral.refui+0.0.1`,
4. `bolt run <STB_IP> com.rdkcentral.refui+0.0.1`
5. You should be able to see ref-ui loaded.
