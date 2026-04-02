// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — Echo background eraser (multi-method)
// Loads echo images into an off-screen canvas, erases background pixels using
// multiple techniques, and returns a transparent PNG data URL. Cached per URL.
// ═══════════════════════════════════════════════════════════════════════════════

const cache = new Map();
const pending = new Map();

/**
 * Erase background from an echo image using multi-pass processing.
 *
 * Pass 1: Dark pixel erasure (brightness + spread + saturation)
 * Pass 2: Flood fill from edges (catches mid-dark BG that survives Pass 1)
 * Pass 3: Edge detection protection (restore wrongly erased creature pixels)
 * Pass 4: Edge erosion (smooth jagged boundaries)
 *
 * @param {string} src - Image URL
 * @param {Object} [opts] - Tuning parameters
 * @returns {Promise<string>} data URL with transparent background
 */
export function eraseEchoBg(src, opts = {}) {
  if (!src) return Promise.resolve(src);
  if (cache.has(src)) return Promise.resolve(cache.get(src));
  if (pending.has(src)) return pending.get(src);

  const {
    // Pass 1: Dark pixel erasure
    darkThreshold = 15,
    colorTolerance = 32,
    saturationThreshold = 0.16,
    // Pass 2: Flood fill from edges
    floodFill = true,
    floodTolerance = 25,       // max color distance to spread into neighboring pixel
    // Pass 3: Edge erosion
    edgeErosion = 1,
    edgeAlpha = 0.6,           // alpha multiplier for edge pixels (0-1)
  } = opts;

  const promise = new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const w = img.naturalWidth;
        const h = img.naturalHeight;
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        ctx.drawImage(img, 0, 0, w, h);

        const imageData = ctx.getImageData(0, 0, w, h);
        const d = imageData.data;
        const total = w * h;

        // ── Pass 1: Dark neutral pixel erasure ──────────────────────────
        const erased = new Uint8Array(total); // 0=keep, 1=erased
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
        // Start from all border pixels, spread inward through similar pixels.
        // Only fills into pixels that look like background (similar to their neighbor).
        // Stops when it hits the creature (big color jump).
        if (floodFill) {
          const visited = new Uint8Array(total);
          const queue = [];

          // Seed: all border pixels
          for (let x = 0; x < w; x++) {
            queue.push(x);               // top row
            queue.push((h - 1) * w + x); // bottom row
          }
          for (let y = 1; y < h - 1; y++) {
            queue.push(y * w);           // left column
            queue.push(y * w + w - 1);   // right column
          }

          // Use perceived luminance for more accurate distance
          const lum = (i) => {
            const idx = i * 4;
            return 0.299 * d[idx] + 0.587 * d[idx + 1] + 0.114 * d[idx + 2];
          };

          const colorDist = (a, b) => {
            const ai = a * 4, bi = b * 4;
            const dr = d[ai] - d[bi];
            const dg = d[ai + 1] - d[bi + 1];
            const db = d[ai + 2] - d[bi + 2];
            return Math.sqrt(dr * dr + dg * dg + db * db);
          };

          // BFS flood fill
          let qi = 0;
          while (qi < queue.length) {
            const pos = queue[qi++];
            if (visited[pos]) continue;
            visited[pos] = 1;

            const idx = pos * 4;
            const pixLum = lum(pos);

            // Only flood into dark-ish pixels (luminance < 60)
            // This prevents the flood from eating into bright creature parts
            if (pixLum > 60 && !erased[pos]) continue;

            // Erase this pixel
            if (!erased[pos]) {
              d[idx + 3] = 0;
              erased[pos] = 1;
            }

            // Spread to 4-connected neighbors
            const x = pos % w;
            const y = (pos - x) / w;
            const neighbors = [];
            if (x > 0) neighbors.push(pos - 1);
            if (x < w - 1) neighbors.push(pos + 1);
            if (y > 0) neighbors.push(pos - w);
            if (y < h - 1) neighbors.push(pos + w);

            for (const n of neighbors) {
              if (visited[n] || erased[n]) continue;
              // Only spread if neighbor is similar in color (within tolerance)
              if (colorDist(pos, n) < floodTolerance) {
                queue.push(n);
              }
            }
          }
        }

        // ── Pass 3: Edge erosion ────────────────────────────────────────
        if (edgeErosion > 0) {
          // Find opaque pixels adjacent to erased pixels → fade them
          const toFade = [];
          for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {
              const pos = y * w + x;
              if (erased[pos]) continue;
              // Check if any neighbor within erosion distance is erased
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
        resolve(result);
      } catch {
        pending.delete(src);
        resolve(src);
      }
    };
    img.onerror = () => {
      pending.delete(src);
      resolve(src);
    };
    img.src = src;
  });

  pending.set(src, promise);
  return promise;
}

/** Clear the cache (e.g., on settings change) */
export function clearEchoBgCache() {
  cache.clear();
}
