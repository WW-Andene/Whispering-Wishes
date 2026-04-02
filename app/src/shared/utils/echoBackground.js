// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — Echo background eraser (pixel-level)
// Loads echo images into an off-screen canvas, erases dark background pixels,
// and returns a transparent PNG data URL. Results are cached per URL.
// ═══════════════════════════════════════════════════════════════════════════════

const cache = new Map();
const pending = new Map();

/**
 * Erase dark background pixels from an echo image.
 * Simple hard cutoff — dark pixels become transparent, everything else untouched.
 *
 * @param {string} src - Image URL
 * @param {number} [darkThreshold=35] - Pixels with brightness below this → transparent (0-255)
 * @returns {Promise<string>} - data:image/png;base64 URL with transparent BG
 */
export function eraseEchoBg(src, darkThreshold = 35) {
  if (!src) return Promise.resolve(src);
  if (cache.has(src)) return Promise.resolve(cache.get(src));
  if (pending.has(src)) return pending.get(src);

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

        for (let i = 0; i < d.length; i += 4) {
          const brightness = (d[i] + d[i + 1] + d[i + 2]) / 3;
          if (brightness < darkThreshold) {
            d[i + 3] = 0;
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
