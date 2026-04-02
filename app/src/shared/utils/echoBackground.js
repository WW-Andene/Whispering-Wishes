// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — Echo background eraser (pixel-level)
// Loads echo images into an off-screen canvas, erases dark background pixels,
// and returns a transparent PNG data URL. Results are cached per URL.
// ═══════════════════════════════════════════════════════════════════════════════

const cache = new Map();
const pending = new Map();

/**
 * Erase dark background pixels from an echo image.
 * Returns a data URL with transparent background.
 *
 * Algorithm:
 * 1. Load image into off-screen canvas
 * 2. For each pixel, calculate brightness: (R + G + B) / 3
 * 3. If brightness < threshold → set alpha to 0 (fully transparent)
 * 4. For pixels near the threshold → fade alpha proportionally (soft edge)
 * 5. Apply radial vignette to fade edges
 *
 * @param {string} src - Image URL
 * @param {Object} [opts]
 * @param {number} [opts.darkThreshold=50] - Pixels darker than this → transparent (0-255)
 * @param {number} [opts.fadeRange=30] - Soft edge range above threshold
 * @param {boolean} [opts.vignetteEdges=true] - Apply radial vignette to edges
 * @returns {Promise<string>} - data:image/png;base64 URL with transparent BG
 */
export function eraseEchoBg(src, opts = {}) {
  if (!src) return Promise.resolve(src);
  if (cache.has(src)) return Promise.resolve(cache.get(src));
  if (pending.has(src)) return pending.get(src);

  const { darkThreshold = 50, fadeRange = 30, vignetteEdges = true } = opts;

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
        const cx = w / 2;
        const cy = h * 0.45; // slightly above center (creature tends to be upper-center)
        const maxR = Math.sqrt(cx * cx + cy * cy);

        for (let i = 0; i < d.length; i += 4) {
          const r = d[i], g = d[i + 1], b = d[i + 2];
          const brightness = (r + g + b) / 3;

          // Dark pixel → transparent
          if (brightness < darkThreshold) {
            d[i + 3] = 0;
          } else if (brightness < darkThreshold + fadeRange) {
            // Soft edge — fade proportionally
            const t = (brightness - darkThreshold) / fadeRange;
            d[i + 3] = Math.round(d[i + 3] * t);
          }

          // Radial vignette — fade edges to transparent
          if (vignetteEdges) {
            const px = (i / 4) % w;
            const py = Math.floor((i / 4) / w);
            const dist = Math.sqrt((px - cx) ** 2 + (py - cy) ** 2) / maxR;
            if (dist > 0.55) {
              const vignette = Math.max(0, 1 - (dist - 0.55) / 0.35);
              d[i + 3] = Math.round(d[i + 3] * vignette);
            }
          }
        }

        ctx.putImageData(imageData, 0, 0);
        const result = canvas.toDataURL('image/png');
        cache.set(src, result);
        pending.delete(src);
        resolve(result);
      } catch {
        // CORS or canvas tainted — fall back to original
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
