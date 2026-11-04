#!/usr/bin/env bash
# Install Blender 4.5 LTS (official Linux build) into /opt/blender and link it as `blender`. Cloud sessions are fresh each time; rerun this.
# Verifies the download against Blender's published SHA-256 before unpacking.
set -euo pipefail
V=4.5.9; F=blender-$V-linux-x64.tar.xz; U=https://download.blender.org/release/Blender4.5
command -v blender >/dev/null && blender --version | head -1 && exit 0
mkdir -p /opt/blender-dl && cd /opt/blender-dl
curl -sSfLO "$U/$F" && curl -sSfL "$U/blender-$V.sha256" -o sums.txt
grep " $F\$" sums.txt | sha256sum -c -
tar xf "$F" -C /opt && rm -rf /opt/blender && mv "/opt/blender-$V-linux-x64" /opt/blender && rm -rf /opt/blender-dl
ln -sf /opt/blender/blender /usr/local/bin/blender && blender --version | head -1
