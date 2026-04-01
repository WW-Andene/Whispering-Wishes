#!/usr/bin/env python3
"""
Remove backgrounds from echo images and re-upload to ibb.co.
Uses flood-fill from edges — lightweight, no AI model needed.

Usage (Termux or any Python 3.7+):
  pip install Pillow requests
  python remove-echo-bg.py

Outputs JS mapping to paste into appcore-data.js DEFAULT_COLLECTION_IMAGES.
"""

import requests
import json
import base64
import sys
from io import BytesIO
from collections import deque
from PIL import Image

IBB_API_KEY = "1cd9272f9b0306dc6d07085947ae0850"
MARGIN = 13  # ±13 per channel (~5% of 255)

ECHO_IMAGES = {
    "Whiff Whaff": "https://i.ibb.co/pvPDj2t6/Whiff-Whaff.png",
    "Snip Snap": "https://i.ibb.co/b5w0y6Fm/Snip-Snap.png",
    "Zig Zag": "https://i.ibb.co/NgB1CXPx/Zig-Zag.png",
    "Tick Tack": "https://i.ibb.co/5xv8bZQw/Tick-Tack.png",
    "Clang Bang": "https://i.ibb.co/sp8bnWqS/Clang-Bang.png",
    "Gulpuff": "https://i.ibb.co/bj9N6GyJ/Gulpuff.png",
    "Chirpuff": "https://i.ibb.co/LXW0sxPK/Chirpuff.png",
    "Excarat": "https://i.ibb.co/fYHBj9f0/Excarat.png",
    "Baby Viridblaze Saurian": "https://i.ibb.co/mrn1KCwW/Baby-Viridblaze-Saurian.png",
    "Sabyr Boar": "https://i.ibb.co/Tx5sZfc7/Sabyr-Boar.png",
    "Fusion Dreadmane": "https://i.ibb.co/QjMNrcNz/Fusion-Dreadmane.png",
    "Diamondclaw": "https://i.ibb.co/HLXTGZwZ/Diamondclaw.png",
    "Cruisewing": "https://i.ibb.co/gMqJ3BgQ/Cruisewing.png",
    "Hoartoise": "https://i.ibb.co/rfKhG5D9/Hoartoise.png",
    "Hooscamp": "https://i.ibb.co/rGXJB3ZF/Hooscamp.png",
    "Lava Larva": "https://i.ibb.co/cKW5xrys/Lava-Larva.png",
    "Dwarf Cassowary": "https://i.ibb.co/N64L3hhD/Dwarf-Cassowary.png",
    "Galescourge Stalker": "https://i.ibb.co/dw4DtP2J/Galescourge-Stalker.png",
    "Voltscourge Stalker": "https://i.ibb.co/MDNfkd8C/Voltscourge-Stalker.png",
    "Frostscourge Stalker": "https://i.ibb.co/672Pj7yR/Frostscourge-Stalker.png",
    "Aero Drake": "https://i.ibb.co/V0vHP6mR/Aero-Drake.png",
    "Electro Drake": "https://i.ibb.co/SDH285Pc/Electro-Drake.png",
    "Glacio Drake": "https://i.ibb.co/gbw1jyD1/Glacio-Drake.png",
    "Fusion Drake": "https://i.ibb.co/4gZtg5nn/Fusion-Drake.png",
    "Spectro Drake": "https://i.ibb.co/tTWghQ5k/Spectro-Drake.png",
    "Havoc Drake": "https://i.ibb.co/nsNDkVLc/Havoc-Drake.png",
    "Glacio Prism": "https://i.ibb.co/DPxd7hnh/Glacio-Prism.png",
    "Fusion Prism": "https://i.ibb.co/F4m58zj0/Fusion-Prism.png",
    "Havoc Prism": "https://i.ibb.co/FbrRCM3j/Havoc-Prism.png",
    "Spectro Prism": "https://i.ibb.co/zH8vmSfM/Spectro-Prism.png",
    "Aero Prism": "https://i.ibb.co/tpFvDp6x/Aero-Prism.png",
    "Chop Chop: Headless": "https://i.ibb.co/QSVwGFv/Chop-Chop-Headless.png",
    "Chop Chop: Leftless": "https://i.ibb.co/DfzWYrQx/Chop-Chop-Leftless.png",
    "Chop Chop: Rightless": "https://i.ibb.co/5h2mJXR5/Chop-Chop-Rightless.png",
    "Fae Ignis": "https://i.ibb.co/TDNHnbP5/Fae-Ignis.png",
    "Nimbus Wraith": "https://i.ibb.co/VpwHYqLj/Nimbus-Wraith.png",
    "Hocus Pocus": "https://i.ibb.co/V0K3W3c3/Hocus-Pocus.png",
    "Lottie Lost": "https://i.ibb.co/934LYmQz/Lottie-Lost.png",
    "Diggy Duggy": "https://i.ibb.co/xKzKn59P/Diggy-Duggy.png",
    "Chest Mimic": "https://i.ibb.co/x8fy6r6N/Chest-Mimic.png",
    "Flora Drone": "https://i.ibb.co/YCxCSv5/Flora-Drone.png",
    "Mining Drone": "https://i.ibb.co/93Y2P7v9/Mining-Drone.png",
    "Geospider S4": "https://i.ibb.co/NdMp0LFy/Geospider-S4.png",
    "Young Roseshroom": "https://i.ibb.co/VpcMk58f/Young-Roseshroom.png",
    "Vanguard Junrock": "https://i.ibb.co/gMFSqGZt/Vanguard-Junrock.png",
    "Fission Junrock": "https://i.ibb.co/8gzmzV1g/Fission-Junrock.png",
    "Golden Junrock": "https://i.ibb.co/B5vmCfcH/Golden-Junrock.png",
    "Calcified Junrock": "https://i.ibb.co/WNDSq6JG/Calcified-Junrock.png",
    "Electro Predator": "https://i.ibb.co/jkjdT6qT/Electro-Predator.png",
    "Glacio Predator": "https://i.ibb.co/TDFLmb4R/Glacio-Predator.png",
    "Aero Predator": "https://i.ibb.co/Xx3y7Qdn/Aero-Predator.png",
    "Fusion Warrior": "https://i.ibb.co/x83Jc7KK/Fusion-Warrior.png",
    "Havoc Warrior": "https://i.ibb.co/kgB2Zc3g/Havoc-Warrior.png",
    "La Guardia": "https://i.ibb.co/C3Dv1xF7/La-Guardia.png",
    "Sagittario": "https://i.ibb.co/pj7ZdDDx/Sagittario.png",
    "Sacerdos": "https://i.ibb.co/xpqtmS6/Sacerdos.png",
    "Devotee's Flesh": "https://i.ibb.co/xtvhpyqw/Devotee-039-s-Flesh.png",
    "Tremor Warrior": "https://i.ibb.co/LddgyQDf/Tremor-Warrior.png",
    "Zip Zap": "https://i.ibb.co/60M6Y63d/Zip-Zap.png",
    "Iceglint Dancer": "https://i.ibb.co/rfF0WbMB/Iceglint-Dancer.png",
    "Shadow Stepper": "https://i.ibb.co/KzQQgJv9/Shadow-Stepper.png",
    "Nightmare: Aero Predator": "https://i.ibb.co/4ZC70TkJ/Nightmare-Aero-Predator.png",
    "Nightmare: Baby Roseshroom": "https://i.ibb.co/vpHJJmp/Nightmare-Baby-Roseshroom.png",
    "Nightmare: Baby Viridblaze Saurian": "https://i.ibb.co/4nvDs4BM/Nightmare-Baby-Viridblaze-Saurian.png",
    "Nightmare: Chirpuff": "https://i.ibb.co/NdvTSMqn/Nightmare-Chirpuff.png",
    "Nightmare: Dwarf Cassowary": "https://i.ibb.co/Q72cVTkv/Nightmare-Dwarf-Cassowary.png",
    "Nightmare: Electro Predator": "https://i.ibb.co/PGXJrqTV/Nightmare-Electro-Predator.png",
    "Nightmare: Glacio Predator": "https://i.ibb.co/fd7LMp6b/Nightmare-Glacio-Predator.png",
    "Nightmare: Gulpuff": "https://i.ibb.co/XxFttBYH/Nightmare-Gulpuff.png",
    "Nightmare: Havoc Warrior": "https://i.ibb.co/XZsKpLsF/Nightmare-Havoc-Warrior.png",
    "Nightmare: Tick Tack": "https://i.ibb.co/GvfLmp2P/Nightmare-Tick-Tack.png",
    "Traffic Illuminator": "https://i.ibb.co/5WJs28pZ/Traffic-Illuminator.png",
}


def is_bg(r, g, b):
    """Check if pixel matches #29292A (41,41,42) within margin."""
    return abs(r - 41) <= MARGIN and abs(g - 41) <= MARGIN and abs(b - 42) <= MARGIN


def flood_fill_remove(img):
    """Flood-fill from edges to remove background. Returns RGBA image."""
    img = img.convert("RGBA")
    pixels = img.load()
    w, h = img.size
    visited = set()
    queue = deque()

    # Seed with edge pixels that match bg color
    for x in range(w):
        for y in (0, h - 1):
            r, g, b, a = pixels[x, y]
            if is_bg(r, g, b):
                queue.append((x, y))
                visited.add((x, y))
    for y in range(1, h - 1):
        for x in (0, w - 1):
            r, g, b, a = pixels[x, y]
            if is_bg(r, g, b):
                queue.append((x, y))
                visited.add((x, y))

    # BFS flood-fill
    while queue:
        x, y = queue.popleft()
        pixels[x, y] = (0, 0, 0, 0)  # transparent
        for dx, dy in ((-1, 0), (1, 0), (0, -1), (0, 1)):
            nx, ny = x + dx, y + dy
            if 0 <= nx < w and 0 <= ny < h and (nx, ny) not in visited:
                visited.add((nx, ny))
                r, g, b, a = pixels[nx, ny]
                if is_bg(r, g, b):
                    queue.append((nx, ny))

    return img


def upload_to_ibb(img, name):
    """Upload PIL image to ibb.co, return URL."""
    buf = BytesIO()
    img.save(buf, format="PNG", optimize=True)
    b64 = base64.b64encode(buf.getvalue()).decode("utf-8")
    safe_name = name.replace(":", "").replace("'", "").replace(" ", "-")
    resp = requests.post(
        "https://api.imgbb.com/1/upload",
        data={"key": IBB_API_KEY, "image": b64, "name": f"{safe_name}-nobg"},
        timeout=60,
    )
    resp.raise_for_status()
    data = resp.json()
    if not data.get("success"):
        raise Exception(f"Upload failed: {data}")
    return data["data"]["url"]


def main():
    results = {}
    failed = []
    total = len(ECHO_IMAGES)

    for i, (name, url) in enumerate(ECHO_IMAGES.items(), 1):
        print(f"[{i}/{total}] {name}...", end=" ", flush=True)
        try:
            # Download
            resp = requests.get(url, headers={"User-Agent": "Mozilla/5.0"}, timeout=30)
            resp.raise_for_status()
            img = Image.open(BytesIO(resp.content))
            print("flood-fill...", end=" ", flush=True)

            # Remove background via flood-fill
            result = flood_fill_remove(img)

            # Upload
            print("uploading...", end=" ", flush=True)
            new_url = upload_to_ibb(result, name)
            results[name] = new_url
            print(f"OK -> {new_url}")

        except Exception as e:
            print(f"FAILED: {e}")
            failed.append((name, str(e)))

    # Summary
    print(f"\n{'='*50}")
    print(f"Done: {len(results)}/{total} OK, {len(failed)} failed")
    if failed:
        print("\nFailed:")
        for name, err in failed:
            print(f"  - {name}: {err}")

    # Output JS
    print(f"\n  // 1-Cost Echo images (bg removed)")
    for name, url in results.items():
        escaped = name.replace("'", "\\'")
        print(f"  '{escaped}': '{url}',")

    # Save JSON
    with open("echo-nobg-urls.json", "w") as f:
        json.dump(results, f, indent=2)
    print(f"\nSaved to echo-nobg-urls.json")


if __name__ == "__main__":
    main()
