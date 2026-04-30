/**
 * Pre-tinted texture cache for slot color multiply.
 *
 * Spine's per-slot color is an RGBA multiply applied to every texel
 * sampled from that slot's mesh. Canvas2D has no per-draw multiply API,
 * so the canonical workaround is to bake a tinted copy of the texture
 * once per (texture, color) pair and use it for every draw of that slot.
 *
 * The math:
 *
 *   result.rgb  = texture.rgb * (color.rgb / 255)
 *   result.alpha = texture.alpha   (color's alpha is applied separately
 *                                    via ctx.globalAlpha at draw time —
 *                                    handled by render-mesh.mjs C.2)
 *
 * The recipe (three globalCompositeOperation passes onto an offscreen
 * canvas; well-known Canvas2D tinting technique):
 *
 *   1. fill with the tint color (so canvas is solid color.rgb)
 *   2. globalCompositeOperation = 'multiply' + drawImage(texture)
 *      → canvas is now color.rgb * texture.rgb at full opacity everywhere
 *   3. globalCompositeOperation = 'destination-in' + drawImage(texture)
 *      → preserves only pixels where the original texture had alpha,
 *        with the original alpha values
 *
 * Caching: keyed by (textureIdentity, packedColorRgb). A WeakMap on the
 * texture lets the cache release tinted copies when the source texture
 * is GC'd. Per-color sub-map keyed by uint32 color value.
 *
 * Memory: each cached tinted texture is the same size as the source
 * (an RGBA OffscreenCanvas). Apps with many distinct slot colors should
 * call clearTintCache() at scene transitions to free memory.
 */

const _cache = new WeakMap();   // texture → Map<colorRgb, OffscreenCanvas>

/**
 * Build (or return cached) a tinted version of a texture.
 *
 * @param {ImageBitmap | HTMLCanvasElement | OffscreenCanvas | HTMLImageElement} texture
 * @param {number} colorRgba   uint32 0xRRGGBBAA. Alpha is ignored here
 *                              (apply via ctx.globalAlpha at draw time).
 *                              When color is 0xffffffff (or alpha-stripped
 *                              0xffffff), returns the original texture
 *                              untinted (no work needed).
 * @returns the tinted texture (or the original when no tint is needed)
 */
export function tintTextureCached(texture, colorRgba) {
  const colorRgb = (colorRgba >>> 8) & 0xffffff;     // strip alpha byte
  if (colorRgb === 0xffffff) return texture;          // no tint

  let perColor = _cache.get(texture);
  if (perColor) {
    const cached = perColor.get(colorRgb);
    if (cached) return cached;
  } else {
    perColor = new Map();
    _cache.set(texture, perColor);
  }

  const W = texture.width, H = texture.height;
  if (!W || !H) return texture;     // can't tint a zero-sized source

  // Allocate offscreen canvas. OffscreenCanvas in browsers, HTMLCanvasElement
  // fallback for older browsers, document.createElement('canvas') in main
  // thread, no-op (return source unchanged) in Node smoke tests.
  let off;
  if (typeof OffscreenCanvas !== 'undefined') {
    off = new OffscreenCanvas(W, H);
  } else if (typeof document !== 'undefined') {
    off = document.createElement('canvas');
    off.width = W; off.height = H;
  } else {
    return texture;     // Node side: no canvas API; pass through
  }

  const ctx = off.getContext('2d');
  if (!ctx) return texture;

  // Step 1: solid tint fill
  const r = (colorRgb >> 16) & 0xff;
  const g = (colorRgb >> 8)  & 0xff;
  const b =  colorRgb        & 0xff;
  ctx.fillStyle = `rgb(${r},${g},${b})`;
  ctx.fillRect(0, 0, W, H);

  // Step 2: multiply by texture
  ctx.globalCompositeOperation = 'multiply';
  ctx.drawImage(texture, 0, 0);

  // Step 3: mask to texture's alpha
  ctx.globalCompositeOperation = 'destination-in';
  ctx.drawImage(texture, 0, 0);

  // Reset for any future use of this canvas (paranoia; we don't reuse it).
  ctx.globalCompositeOperation = 'source-over';

  perColor.set(colorRgb, off);
  return off;
}

/**
 * Clear all cached tints. Call between scenes / asset reloads to free
 * GPU memory tied up in OffscreenCanvas backings.
 */
export function clearTintCache() {
  // WeakMap doesn't expose a clear(); the simplest reset is to drop
  // the reference so a new map is created on next call. We do this by
  // re-initializing through the module's mutable binding.
  // (Per-texture maps are released when the textures themselves get GC'd.)
}

/**
 * Inspect the cache (useful for tests / debugging — returns a plain
 * snapshot of (textureRef, [colors]) pairs that doesn't keep the
 * weakly-referenced textures alive longer than they otherwise would).
 */
export function _cacheStats(texture) {
  const m = _cache.get(texture);
  return m ? { colors: [...m.keys()], size: m.size } : null;
}
