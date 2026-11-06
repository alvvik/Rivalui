#!/bin/bash
set -e

echo "building for Arch Linux "

npm run tauri build

DEB_DIR=$(find ../src-tauri/target/release/bundle/deb -maxdepth 1 -type d -name "*_amd64" | head -n 1)
if [ -z "$DEB_DIR" ]; then
  echo "Error: DEB bundle directory not found!"
  exit 1
fi

ARCH_BUILD_DIR="build"
rm -rf "$ARCH_BUILD_DIR"
mkdir -p "$ARCH_BUILD_DIR"

cp -r "$DEB_DIR/data/usr" "$ARCH_BUILD_DIR/"
install -Dm755 rivalui-color-service "$ARCH_BUILD_DIR/usr/bin/rivalui-color-service"
install -Dm644 rivalui-color.service "$ARCH_BUILD_DIR/usr/lib/systemd/user/rivalui-color.service"

cd "$ARCH_BUILD_DIR"
tar -czf rivalui.tar.gz usr/
cp ../PKGBUILD .

makepkg -sf --noconfirm

mkdir -p ../../pkg
mv *.pkg.tar.zst ../../pkg/ 2>/dev/null || mv *.pkg.tar.xz ../../pkg/ 2>/dev/null || true

echo "Arch package successfully built in pkg/"
ls -lh ../../pkg/
