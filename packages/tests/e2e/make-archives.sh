#!/bin/sh
# Builds the fake archive dir: $DATA_DIR/archive/e2e.zip with one fb2 entry.
# Uses the runner's `zip` CLI (preinstalled on GHA ubuntu + macOS).
set -eu
DATA_DIR="${1:?usage: make-archives.sh <data-dir>}"
ARCH="$DATA_DIR/archive"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT
mkdir -p "$ARCH"
printf '<?xml version="1.0" encoding="utf-8"?><FictionBook>E2E-FAKE-FB2-BOOK-1</FictionBook>' > "$TMP/e2ebook.fb2"
rm -f "$ARCH/e2e.zip"
(cd "$TMP" && zip -q -j "$ARCH/e2e.zip" e2ebook.fb2)
echo "archive: $ARCH/e2e.zip"
