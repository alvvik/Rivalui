#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
TAURI_DIR="$PROJECT_ROOT/src-tauri"
BUNDLE_DEB_DIR="$TAURI_DIR/target/release/bundle/deb"

echo "building for Arch Linux"

cd "$PROJECT_ROOT"

rm -rf "$TAURI_DIR/target/release/bundle"

npm run tauri build

ARCH_BUILD_DIR="build"
rm -rf "$ARCH_BUILD_DIR"
mkdir -p "$ARCH_BUILD_DIR"

if [ -d "$BUNDLE_DEB_DIR" ]; then
  DEB_DIR=$(find "$BUNDLE_DEB_DIR" -maxdepth 1 -type d -name "*_amd64" -print -quit || true)
else
  DEB_DIR=""
fi

if [ -n "${DEB_DIR:-}" ] && [ -d "$DEB_DIR/data/usr" ]; then
  cp -r "$DEB_DIR/data/usr" "$ARCH_BUILD_DIR/"
else
  DEB_FILE=$(ls "$BUNDLE_DEB_DIR"/*_amd64.deb 2>/dev/null | head -n 1 || true)
  if [ -z "${DEB_FILE:-}" ]; then
    echo "Error: DEB payload not found."
    echo "Checked: $BUNDLE_DEB_DIR"
    exit 1
  fi

  TMPDIR="$(mktemp -d)"
  trap 'rm -rf "$TMPDIR"' EXIT

  cd "$TMPDIR"

  if ! command -v ar >/dev/null 2>&1; then
    echo "Error: 'ar' not found while extracting .deb (install binutils)."
    exit 1
  fi

  ar x "$DEB_FILE"

 tar -xf data.tar.*
  cp -r usr "$ARCH_BUILD_DIR/"
fi

install -Dm755 "$SCRIPT_DIR/rivalui-color-service" "$ARCH_BUILD_DIR/usr/bin/rivalui-color-service"
install -Dm644 "$SCRIPT_DIR/rivalui-color.service" "$ARCH_BUILD_DIR/usr/lib/systemd/user/rivalui-color.service"

cd "$ARCH_BUILD_DIR"
tar -czf rivalui.tar.gz usr/
cp "$SCRIPT_DIR/PKGBUILD" ./

makepkg -sf --noconfirm

mkdir -p "$PROJECT_ROOT/pkg"
mv *.pkg.tar.zst "$PROJECT_ROOT/pkg/" 2>/dev/null || mv *.pkg.tar.xz "$PROJECT_ROOT/pkg/" 2>/dev/null || true

echo "Arch package successfully built in pkg/"
ls -lh "$PROJECT_ROOT/pkg/"
