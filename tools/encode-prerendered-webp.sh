#!/usr/bin/env bash
# Encodes lossless animated WebPs from the PNG frame folders dropped by
# app/public/dev/prerender.html. Run after extracting spine-prerender.zip.
#
# Usage:
#   tools/encode-prerendered-webp.sh <unzipped-dir> [output-root]
#
# Example:
#   unzip -d /tmp/prerender ~/Downloads/spine-prerender.zip
#   tools/encode-prerendered-webp.sh /tmp/prerender app/public/portraits
#
# Requires `img2webp` (libwebp). Install via:
#   apt: sudo apt-get install webp
#   brew: brew install webp

set -euo pipefail

if [ "$#" -lt 1 ]; then
  echo "usage: $0 <unzipped-dir> [output-root=app/public/portraits]" >&2
  exit 1
fi

if ! command -v img2webp >/dev/null 2>&1; then
  echo "img2webp not found. Install libwebp (e.g. 'sudo apt-get install webp')." >&2
  exit 1
fi

src="$1"
out_root="${2:-app/public/portraits}"

if [ ! -d "$src" ]; then
  echo "Source directory not found: $src" >&2
  exit 1
fi

mkdir -p "$out_root"

shopt -s nullglob

found=0
encoded=0
while IFS= read -r meta; do
  found=$((found + 1))
  dir_meta="$(dirname "$meta")"
  rel_dir="${dir_meta#$src/}"
  # rel_dir looks like "<dir>/Portraits_<name>_idle"
  char_dir="${rel_dir%/*}"
  base="${rel_dir##*/}"
  fps=$(grep -E '"fps"' "$meta" | sed -E 's/.*"fps":[[:space:]]*([0-9]+).*/\1/')
  if [ -z "$fps" ]; then fps=60; fi
  # img2webp expects per-frame duration in ms
  dur_ms=$(awk -v f="$fps" 'BEGIN { printf "%d", 1000 / f }')

  out_dir="$out_root/$char_dir"
  out_file="$out_dir/${base}.webp"
  mkdir -p "$out_dir"

  frames=("$dir_meta"/frame_*.png)
  if [ "${#frames[@]}" -eq 0 ]; then
    echo "skip $rel_dir: no frames" >&2
    continue
  fi

  echo "encoding ${#frames[@]} frames @ ${fps}fps -> $out_file"
  img2webp -lossless -d "$dur_ms" -loop 0 "${frames[@]}" -o "$out_file" >/dev/null
  encoded=$((encoded + 1))
done < <(find "$src" -name meta.json -type f | sort)

echo "encoded $encoded / $found character idle loops into $out_root"
