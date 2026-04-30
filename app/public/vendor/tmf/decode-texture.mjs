/**
 * Texture decode helper — produces ImageBitmaps suitable for the mesh
 * renderer with correct alpha handling for premultiplied vs straight
 * sources.
 *
 * Why this matters (the "dark hair / eyes" problem):
 *
 *   Spine atlas pages are typically PREMULTIPLIED (each pixel's RGB is
 *   already multiplied by A on disk). The browser's default
 *   createImageBitmap with `premultiplyAlpha: 'default'` will multiply
 *   AGAIN for its internal representation, then Canvas2D's drawImage
 *   does source-over compositing — net effect: RGB gets multiplied by
 *   A^2 instead of A, darkening every partially-transparent pixel.
 *
 *   Result: dark character art (hair, eyes, shadows) renders too dark
 *   and too saturated. Visually identical to the chroma-key MP4
 *   workaround failure mode.
 *
 * The fix: tell createImageBitmap NOT to premultiply when the source
 * is already premultiplied. Then the bitmap stores the on-disk bytes
 * verbatim, drawImage does one (and only one) compositing-time multiply
 * by A, and the math comes out right.
 *
 * Usage:
 *
 *   const tex = await decodeTextureForMesh(bytes, { premultiplied: true });
 *   renderMesh(canvas, meshChunk, { texture: tex });
 *
 * Or pass an atlas-page record directly:
 *
 *   const tex = await decodeAtlasPage(pageBytes, atlasPage);
 *   //                                          ^^^^^^^^^^ from spine-atlas.parseAtlas
 */

const PREMULT_HINT = {
  // Atlas formats / sources known to be premultiplied by convention.
  spine: true,
  webp_pma: true,
};

/**
 * Decode raw image bytes into an ImageBitmap suitable for the mesh
 * renderer's drawImage path.
 *
 * @param {Uint8Array | ArrayBuffer} bytes
 * @param {object} opts
 * @param {boolean} opts.premultiplied
 *   true  → source is premultiplied (Spine atlas, PMA WebP). The bitmap
 *           is decoded with `premultiplyAlpha: 'none'` so the on-disk
 *           bytes survive verbatim and drawImage's compositing produces
 *           the correct one-multiply result.
 *   false → source is straight alpha (the default for PNG/WebP). The
 *           bitmap is decoded with default premultiplication so the
 *           browser's compositing pipeline gets the right inputs.
 * @returns {Promise<ImageBitmap | object>} ImageBitmap in browsers,
 *          a fallback {width,height,data} in Node where we can use
 *          sharp to decode.
 */
export async function decodeTextureForMesh(bytes, opts = {}) {
  const premultiplied = opts.premultiplied === true;
  const u8 = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);

  if (typeof createImageBitmap === 'function' && typeof Blob === 'function') {
    const blob = new Blob([u8]);
    return await createImageBitmap(blob, {
      premultiplyAlpha: premultiplied ? 'none' : 'default',
      colorSpaceConversion: 'none',
    });
  }

  // Node fallback: try sharp. Sharp by default returns straight RGBA.
  // For the mesh renderer's Canvas2D path that will run in a real
  // browser at playback time, this fallback is mostly used during tests
  // and headless rendering — exact alpha math isn't compositing-critical
  // there since most test paths render to mocks.
  try {
    const { default: sharp } = await import('sharp');
    const { data, info } = await sharp(Buffer.from(u8))
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });
    return { width: info.width, height: info.height, data,
              premultiplied: false };
  } catch (_) {
    throw new Error('decodeTextureForMesh: needs createImageBitmap (browser) or sharp (Node)');
  }
}

/**
 * Decode an atlas page texture using its parsed metadata. Convenience
 * wrapper: reads the atlas page's `pma` flag and routes to
 * decodeTextureForMesh with the right premultiplied hint.
 *
 *   const atlas = parseAtlas(text);
 *   const pageBytes = await fetch(atlas.pages[0].name).then(r => r.arrayBuffer());
 *   const tex = await decodeAtlasPage(pageBytes, atlas.pages[0]);
 */
export async function decodeAtlasPage(bytes, page) {
  // page.pma is set when the atlas declared `pma: true` (Spine 4.1+).
  // For older atlases without an explicit pma line, we default to true
  // because Spine's modern export pipeline emits premultiplied atlases
  // by default and that's the failing case for the dark-hair problem.
  const premultiplied = page && (page.pma === true || page.pma === undefined);
  return decodeTextureForMesh(bytes, { premultiplied });
}

/**
 * Hint helper for callers who already have an ImageBitmap from somewhere
 * else and need to know whether the renderer should treat it as
 * premultiplied. Returns true when the source format is in the
 * PREMULT_HINT table or the caller passed `premultiplied: true`.
 */
export function isPremultiplied(source) {
  if (source && source.premultiplied === true) return true;
  if (source && source.format && PREMULT_HINT[source.format]) return true;
  return false;
}
