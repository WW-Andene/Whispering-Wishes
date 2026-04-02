#!/usr/bin/env python3
"""
Batch background removal for Whispering Wishes echo images.

Two modes:
  Local:  python3 scripts/remove-echo-bg.py
          Uses rembg (U2Net) — free, offline, unlimited. Requires: pip install "rembg[cpu]" pillow requests

  Cloud:  python3 scripts/remove-echo-bg.py --huggingface YOUR_TOKEN
          Uses HuggingFace Inference API (BRIA-RMBG-1.4) — free tier, no install.
          Get a free token at: https://huggingface.co/settings/tokens

Output: scripts/echo-images-nobg/ (PNG files with transparent backgrounds)
Skips already-processed images on re-run (resume-safe).
"""

import os
import re
import sys
import time
import requests
from io import BytesIO
from pathlib import Path
from PIL import Image

ECHOES_JS = Path(__file__).parent.parent / "app" / "src" / "data" / "echoes.js"
OUTPUT_DIR = Path(__file__).parent / "echo-images-nobg"
OUTPUT_DIR.mkdir(exist_ok=True)

HF_MODEL = "briaai/RMBG-2.0"
HF_API_URL = f"https://api-inference.huggingface.co/models/{HF_MODEL}"


def extract_urls(filepath):
    """Parse echoes.js and extract name -> imageUrl pairs."""
    content = filepath.read_text()
    pattern = r"'([^']+)':\s*\{[^}]*imageUrl:\s*'(https?://[^']+)'"
    return re.findall(pattern, content)


def download_image(url):
    """Download image from URL, return bytes."""
    resp = requests.get(url, timeout=30)
    resp.raise_for_status()
    return resp.content


def remove_bg_local(img_bytes):
    """Remove background using local rembg (U2Net)."""
    from rembg import remove
    result = remove(img_bytes)
    return Image.open(BytesIO(result))


def remove_bg_huggingface(img_bytes, token, retries=3):
    """Remove background using HuggingFace Inference API."""
    headers = {"Authorization": f"Bearer {token}"}
    for attempt in range(retries):
        resp = requests.post(HF_API_URL, headers=headers, data=img_bytes, timeout=60)
        if resp.status_code == 200:
            return Image.open(BytesIO(resp.content))
        elif resp.status_code == 503:
            # Model loading — wait and retry
            wait = resp.json().get("estimated_time", 20)
            print(f"    ⏳ Model loading, waiting {wait:.0f}s...")
            time.sleep(min(wait, 60))
        elif resp.status_code == 429:
            # Rate limited
            print(f"    ⏳ Rate limited, waiting 10s...")
            time.sleep(10)
        else:
            resp.raise_for_status()
    raise RuntimeError(f"HuggingFace API failed after {retries} retries")


def main():
    # Parse args
    use_hf = False
    hf_token = None
    if "--huggingface" in sys.argv:
        idx = sys.argv.index("--huggingface")
        if idx + 1 < len(sys.argv):
            hf_token = sys.argv[idx + 1]
            use_hf = True
        else:
            print("Error: --huggingface requires a token argument")
            print("Get one free at: https://huggingface.co/settings/tokens")
            sys.exit(1)

    if not use_hf:
        try:
            from rembg import remove
            print("Mode: Local (rembg + U2Net)")
        except ImportError:
            print("rembg not installed. Choose one:")
            print('  pip install "rembg[cpu]" pillow requests    # local mode')
            print("  python3 scripts/remove-echo-bg.py --huggingface YOUR_TOKEN  # cloud mode")
            sys.exit(1)
    else:
        print(f"Mode: HuggingFace API ({HF_MODEL})")

    echoes = extract_urls(ECHOES_JS)
    if not echoes:
        print("No echo images found in echoes.js!")
        sys.exit(1)

    print(f"Found {len(echoes)} echo images to process\n")

    already_done = {f.stem for f in OUTPUT_DIR.glob("*.png")}
    success = 0
    failed = 0

    for i, (name, url) in enumerate(echoes, 1):
        safe_name = re.sub(r'[^\w\s-]', '', name).strip().replace(' ', '-')

        if safe_name in already_done:
            print(f"  [{i}/{len(echoes)}] {name} — already done, skipping")
            success += 1
            continue

        print(f"  [{i}/{len(echoes)}] {name}...")
        try:
            img_bytes = download_image(url)

            if use_hf:
                result = remove_bg_huggingface(img_bytes, hf_token)
            else:
                result = remove_bg_local(img_bytes)

            output_path = OUTPUT_DIR / f"{safe_name}.png"
            result.save(output_path, "PNG")
            print(f"    ✓ Saved {output_path.name} ({result.size[0]}×{result.size[1]})")
            success += 1
        except Exception as e:
            print(f"    ✗ Failed: {e}")
            failed += 1

    print(f"\nDone! {success} succeeded, {failed} failed, out of {len(echoes)} total")
    print(f"Output: {OUTPUT_DIR}")


if __name__ == "__main__":
    main()
