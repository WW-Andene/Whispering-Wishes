#!/usr/bin/env bash
# Drops the WebM files captured by app/public/dev/prerender.html into
# app/public/portraits/<dir>/Portraits_<name>_idle.webm next to the .skel.
# After this runs, regenerate the prerender manifest (npm run manifest)
# so SpinePlayer picks them up.
#
# Usage:
#   tools/install-prerendered-webm.sh <unzipped-dir> [output-root]
#
# Example:
#   unzip -d /tmp/prerender ~/Downloads/spine-prerender.zip
#   tools/install-prerendered-webm.sh /tmp/prerender app/public/portraits
#
# Optional WebM -> animated WebP conversion (only if you specifically need
# Safari-on-iOS-< 17 compatibility — modern Chrome/Firefox/Safari play WebM
# natively):
#
#   ffmpeg -i input.webm -c:v libwebp_anim -lossless 1 -loop 0 \
#          -pix_fmt yuva420p output.webp

set -euo pipefail

if [ "$#" -lt 1 ]; then
  echo "usage: $0 <unzipped-dir> [output-root=app/public/portraits]" >&2
  exit 1
fi

src="$1"
out_root="${2:-app/public/portraits}"

if [ ! -d "$src" ]; then
  echo "Source directory not found: $src" >&2
  exit 1
fi

shopt -s nullglob

found=0
copied=0
# The capture page emits files at <unzipped>/<dir>/Portraits_<name>_idle.webm
while IFS= read -r webm; do
  found=$((found + 1))
  rel="${webm#$src/}"
  out="$out_root/$rel"
  mkdir -p "$(dirname "$out")"
  cp "$webm" "$out"
  echo "wrote $out ($(du -h "$out" | cut -f1))"
  copied=$((copied + 1))
done < <(find "$src" -name 'Portraits_*_idle.webm' -type f | sort)

if [ -f "$src/manifest.json" ]; then
  echo "(capture manifest at $src/manifest.json)"
fi

echo "installed $copied / $found WebM idle loops into $out_root"
echo "next: run \`npm run manifest\` (or \`npm run build\`) to refresh the runtime manifest"
