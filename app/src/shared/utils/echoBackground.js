// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — Echo background eraser (multi-method)
// Loads echo images via fetch (avoids CORS tainted canvas), erases background
// pixels using multiple techniques, returns transparent PNG data URL. Cached.
// ═══════════════════════════════════════════════════════════════════════════════

const cache = new Map();
const pending = new Map();

/**
 * Fetch image as a blob and create an ImageBitmap — avoids CORS canvas tainting.
 * Falls back to Image element with crossOrigin if fetch fails.
 */
async function loadImageSafe(src) {
  try {
    const resp = await fetch(src, { mode: 'cors' });
    if (!resp.ok) throw new Error(resp.status);
    const blob = await resp.blob();
    return await createImageBitmap(blob);
  } catch {
    // Fallback: try Image element (may taint canvas on cross-origin)
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  }
}

/**
 * Erase background from an echo image using multi-pass processing.
 *
 * Pass 1: Dark pixel erasure (brightness + spread + saturation)
 * Pass 2: Flood fill from edges (catches mid-dark BG that survives Pass 1)
 * Pass 3: Edge erosion (smooth jagged boundaries)
 */
export function eraseEchoBg(src, opts = {}) {
  if (!src) return Promise.resolve(src);
  if (cache.has(src)) return Promise.resolve(cache.get(src));
  if (pending.has(src)) return pending.get(src);

  const {
    darkThreshold = 15,
    colorTolerance = 32,
    saturationThreshold = 0.16,
    floodFill = true,
    floodTolerance = 25,
    floodLumLimit = 60,
    edgeErosion = 1,
    edgeAlpha = 0.6,
  } = opts;

  const promise = (async () => {
    try {
      const bitmap = await loadImageSafe(src);
      const w = bitmap.width;
      const h = bitmap.height;
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      ctx.drawImage(bitmap, 0, 0, w, h);

      const imageData = ctx.getImageData(0, 0, w, h);
      const d = imageData.data;
      const total = w * h;

      // ── Pass 1: Dark neutral pixel erasure ──────────────────────────
      const erased = new Uint8Array(total);
      for (let i = 0; i < total; i++) {
        const idx = i * 4;
        const r = d[idx], g = d[idx + 1], b = d[idx + 2];
        const brightness = (r + g + b) / 3;
        const spread = Math.max(r, g, b) - Math.min(r, g, b);
        const max = Math.max(r, g, b) / 255;
        const min = Math.min(r, g, b) / 255;
        const l = (max + min) / 2;
        const sat = max === min ? 0 : (l > 0.5 ? (max - min) / (2 - max - min) : (max - min) / (max + min));

        if (brightness < darkThreshold && spread < colorTolerance && sat < saturationThreshold) {
          d[idx + 3] = 0;
          erased[i] = 1;
        }
      }

      // ── Pass 2: Flood fill from edges ───────────────────────────────
      if (floodFill) {
        const visited = new Uint8Array(total);
        const queue = [];

        // Seed all border pixels
        for (let x = 0; x < w; x++) {
          queue.push(x);
          queue.push((h - 1) * w + x);
        }
        for (let y = 1; y < h - 1; y++) {
          queue.push(y * w);
          queue.push(y * w + w - 1);
        }

        const lum = (i) => 0.299 * d[i * 4] + 0.587 * d[i * 4 + 1] + 0.114 * d[i * 4 + 2];

        const colorDist = (a, b) => {
          const ai = a * 4, bi = b * 4;
          const dr = d[ai] - d[bi], dg = d[ai + 1] - d[bi + 1], db = d[ai + 2] - d[bi + 2];
          return Math.sqrt(dr * dr + dg * dg + db * db);
        };

        let qi = 0;
        while (qi < queue.length) {
          const pos = queue[qi++];
          if (visited[pos]) continue;
          visited[pos] = 1;

          if (lum(pos) > floodLumLimit && !erased[pos]) continue;

          if (!erased[pos]) {
            d[pos * 4 + 3] = 0;
            erased[pos] = 1;
          }

          const x = pos % w, y = (pos - x) / w;
          const neighbors = [];
          if (x > 0) neighbors.push(pos - 1);
          if (x < w - 1) neighbors.push(pos + 1);
          if (y > 0) neighbors.push(pos - w);
          if (y < h - 1) neighbors.push(pos + w);

          for (const n of neighbors) {
            if (!visited[n] && !erased[n] && colorDist(pos, n) < floodTolerance) {
              queue.push(n);
            }
          }
        }
      }

      // ── Pass 3: Edge erosion ────────────────────────────────────────
      if (edgeErosion > 0) {
        const toFade = [];
        for (let y = 0; y < h; y++) {
          for (let x = 0; x < w; x++) {
            const pos = y * w + x;
            if (erased[pos]) continue;
            let nearErased = false;
            for (let dy = -edgeErosion; dy <= edgeErosion && !nearErased; dy++) {
              for (let dx = -edgeErosion; dx <= edgeErosion && !nearErased; dx++) {
                if (dx === 0 && dy === 0) continue;
                const nx = x + dx, ny = y + dy;
                if (nx >= 0 && nx < w && ny >= 0 && ny < h && erased[ny * w + nx]) {
                  nearErased = true;
                }
              }
            }
            if (nearErased) toFade.push(pos);
          }
        }
        for (const pos of toFade) {
          d[pos * 4 + 3] = Math.round(d[pos * 4 + 3] * edgeAlpha);
        }
      }

      ctx.putImageData(imageData, 0, 0);
      const result = canvas.toDataURL('image/png');
      cache.set(src, result);
      pending.delete(src);
      return result;
    } catch (e) {
      console.warn('[EchoBG] Processing failed, using original:', e.message);
      pending.delete(src);
      return src;
    }
  })();

  pending.set(src, promise);
  return promise;
}

/** Clear the cache (e.g., on settings change) */
export function clearEchoBgCache() {
  cache.clear();
}
