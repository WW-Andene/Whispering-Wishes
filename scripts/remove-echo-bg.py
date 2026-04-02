#!/usr/bin/env python3
"""
Batch background removal for Whispering Wishes echo images.
Uses rembg (U2Net model) — free, local, unlimited.

Usage: python3 scripts/remove-echo-bg.py
Output: scripts/echo-images-nobg/ (PNG files with transparent backgrounds)
"""

import os
import re
import sys
import requests
from io import BytesIO
from pathlib import Path
from rembg import remove
from PIL import Image

# Extract image URLs from echoes.js
ECHOES_JS = Path(__file__).parent.parent / "app" / "src" / "data" / "echoes.js"
OUTPUT_DIR = Path(__file__).parent / "echo-images-nobg"
OUTPUT_DIR.mkdir(exist_ok=True)

def extract_urls(filepath):
    """Parse echoes.js and extract name → imageUrl pairs."""
    content = filepath.read_text()
    # Match: 'Echo Name': { ... imageUrl: 'https://...' }
    pattern = r"'([^']+)':\s*\{[^}]*imageUrl:\s*'(https?://[^']+)'"
    matches = re.findall(pattern, content)
    return matches

def download_image(url):
    """Download image from URL, return PIL Image."""
    resp = requests.get(url, timeout=30)
    resp.raise_for_status()
    return Image.open(BytesIO(resp.content))

def process_image(img):
    """Remove background using rembg."""
    # Convert to bytes for rembg
    buf = BytesIO()
    img.save(buf, format="PNG")
    buf.seek(0)
    result = remove(buf.read())
    return Image.open(BytesIO(result))

def main():
    echoes = extract_urls(ECHOES_JS)
    if not echoes:
        print("No echo images found in echoes.js!")
        sys.exit(1)

    print(f"Found {len(echoes)} echo images to process")

    already_done = {f.stem for f in OUTPUT_DIR.glob("*.png")}

    for i, (name, url) in enumerate(echoes, 1):
        safe_name = re.sub(r'[^\w\s-]', '', name).strip().replace(' ', '-')

        if safe_name in already_done:
            print(f"  [{i}/{len(echoes)}] {name} — already done, skipping")
            continue

        print(f"  [{i}/{len(echoes)}] {name}...")
        try:
            img = download_image(url)
            result = process_image(img)
            output_path = OUTPUT_DIR / f"{safe_name}.png"
            result.save(output_path, "PNG")
            print(f"    ✓ Saved {output_path.name} ({result.size[0]}×{result.size[1]})")
        except Exception as e:
            print(f"    ✗ Failed: {e}")

    done = list(OUTPUT_DIR.glob("*.png"))
    print(f"\nDone! {len(done)}/{len(echoes)} images processed in {OUTPUT_DIR}")

if __name__ == "__main__":
    main()
