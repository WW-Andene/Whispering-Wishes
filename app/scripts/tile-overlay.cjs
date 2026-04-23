// Slice one overlay .webp into 256px lossless PNG tiles at native resolution.
//
// Usage (from app/):
//   npm install --no-save sharp
//   node scripts/tile-overlay.cjs "public/map-tiles/<overlay-dir>/<name>.webp"
//
// Output: <overlay-dir>/lossless/{y}/{x}.png — one folder of tiles at the
// source image's native resolution. No resize, no rotate, no colour shift.
// Edge tiles are padded to 256×256 with transparent pixels so Leaflet's
// grid stays uniform.

const path = require('path');
const fs = require('fs/promises');
const sharp = require('sharp');

const TILE_SIZE = 256;

async function main() {
  const src = process.argv[2];
  if (!src) {
    console.error('Usage: node scripts/tile-overlay.cjs <path-to-webp>');
    process.exit(1);
  }

  const meta = await sharp(src).metadata();
  const { width: W, height: H } = meta;
  console.log(`Source: ${src}  (${W}×${H}, alpha=${meta.hasAlpha})`);

  // Decode once to raw RGBA so every tile extraction reads the same bytes.
  const { data: buf, info } = await sharp(src)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const outDir = path.join(path.dirname(src), 'lossless');
  await fs.rm(outDir, { recursive: true, force: true });

  const cols = Math.ceil(W / TILE_SIZE);
  const rows = Math.ceil(H / TILE_SIZE);
  const total = cols * rows;
  console.log(`Slicing into ${cols}×${rows} = ${total} tiles → ${outDir}/{y}/{x}.png`);

  const rawOpts = { raw: { width: W, height: H, channels: 4 } };

  let done = 0;
  for (let y = 0; y < rows; y++) {
    const yDir = path.join(outDir, String(y));
    await fs.mkdir(yDir, { recursive: true });

    for (let x = 0; x < cols; x++) {
      const left = x * TILE_SIZE;
      const top = y * TILE_SIZE;
      const cropW = Math.min(TILE_SIZE, W - left);
      const cropH = Math.min(TILE_SIZE, H - top);

      await sharp(buf, rawOpts)
        .extract({ left, top, width: cropW, height: cropH })
        .extend({
          top: 0, left: 0,
          bottom: TILE_SIZE - cropH,
          right: TILE_SIZE - cropW,
          background: { r: 0, g: 0, b: 0, alpha: 0 },
        })
        .png({ compressionLevel: 9, palette: false, effort: 10 })
        .toFile(path.join(yDir, `${x}.png`));

      done++;
      if (done % 300 === 0) process.stdout.write(`  ${done}/${total}\r`);
    }
  }
  process.stdout.write(`  ${done}/${total}\n`);
}

main().catch(e => { console.error(e); process.exit(1); });
