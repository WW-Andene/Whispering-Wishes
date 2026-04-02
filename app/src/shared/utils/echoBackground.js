// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — Echo background eraser (pixel-level)
// Loads echo images into an off-screen canvas, erases dark background pixels,
// and returns a transparent PNG data URL. Results are cached per URL.
// ═══════════════════════════════════════════════════════════════════════════════

const cache = new Map();
const pending = new Map();

/**
 * Erase dark background pixels from an echo image.
 *
 * @param {string} src - Image URL
 * @param {Object} [opts]
 * @param {number} [opts.darkThreshold=45] - Brightness cutoff (0-255)
 * @param {number} [opts.colorTolerance=4] - Max RGB spread to consider "gray"
 * @param {number} [opts.saturationThreshold=0.08] - Max HSL saturation to erase (0-1)
 * @param {number} [opts.edgeErosion=1] - Expand transparent zone by N pixels
 * @param {boolean} [opts.cornerCrop=true] - Erase bottom-right cost badge area
 * @returns {Promise<string>} - data:image/png;base64 URL with transparent BG
 */
export function eraseEchoBg(src, opts = {}) {
  if (!src) return Promise.resolve(src);
  if (cache.has(src)) return Promise.resolve(cache.get(src));
  if (pending.has(src)) return pending.get(src);

  const {
    darkThreshold = 8,
    colorTolerance = 32,
    saturationThreshold = 0.16,
    edgeErosion = 1,
    cornerCrop = false,
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

        // Pass 1: Erase dark neutral pixels
        for (let i = 0; i < d.length; i += 4) {
          const r = d[i], g = d[i + 1], b = d[i + 2];
          const brightness = (r + g + b) / 3;
          const spread = Math.max(r, g, b) - Math.min(r, g, b);

          // HSL saturation: more accurate than spread for colored glows
          const max = Math.max(r, g, b) / 255;
          const min = Math.min(r, g, b) / 255;
          const l = (max + min) / 2;
          const sat = max === min ? 0 : (l > 0.5 ? spread / 255 / (2 - max - min) : spread / 255 / (max + min));

          if (brightness < darkThreshold && spread < colorTolerance && sat < saturationThreshold) {
            d[i + 3] = 0;
          }
        }

        // Pass 2: Corner crop — erase bottom-right cost badge
        if (cornerCrop) {
          const badgeR = Math.round(w * 0.18); // badge radius ~18% of width
          const cx = w - Math.round(w * 0.12); // badge center X
          const cy = h - Math.round(h * 0.12); // badge center Y
          for (let y = cy - badgeR; y <= cy + badgeR; y++) {
            for (let x = cx - badgeR; x <= cx + badgeR; x++) {
              if (x < 0 || x >= w || y < 0 || y >= h) continue;
              const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
              if (dist <= badgeR) {
                const i = (y * w + x) * 4;
                d[i + 3] = 0;
              }
            }
          }
        }

        // Pass 3: Edge erosion — expand transparent zone by N pixels
        if (edgeErosion > 0) {
          // Build a mask of which pixels are transparent
          const transparent = new Uint8Array(w * h);
          for (let i = 0; i < d.length; i += 4) {
            if (d[i + 3] === 0) transparent[i / 4] = 1;
          }
          // For each opaque pixel, check if any neighbor within N pixels is transparent
          for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {
              const idx = y * w + x;
              if (transparent[idx]) continue; // already transparent
              let nearEdge = false;
              outer: for (let dy = -edgeErosion; dy <= edgeErosion; dy++) {
                for (let dx = -edgeErosion; dx <= edgeErosion; dx++) {
                  if (dx === 0 && dy === 0) continue;
                  const nx = x + dx, ny = y + dy;
                  if (nx < 0 || nx >= w || ny < 0 || ny >= h) continue;
                  if (transparent[ny * w + nx]) { nearEdge = true; break outer; }
                }
              }
              if (nearEdge) {
                const i = idx * 4;
                // Fade edge pixel rather than hard erase
                d[i + 3] = Math.round(d[i + 3] * 0.6);
              }
            }
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
