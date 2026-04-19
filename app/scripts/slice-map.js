// Slice a single map PNG into a Leaflet tile pyramid.
//
// Usage (from the app/ folder):
//   npm install --no-save sharp
//   node scripts/slice-map.js [sourcePath] [outputDir]
//
// Defaults:
//   sourcePath = app/public/map-tiles/Solaris_3/Solaris_3.png
//   outputDir  = app/public/map-tiles
//
// Produces app/public/map-tiles/{z}/{y}/{x}.webp where 0 ≤ z ≤ 6.
// z=6 is the native zoom (1 source px per tile px).
// Lower z levels halve resolution each step so the whole map fits fewer tiles.
//
// Runs sharp natively (fast), but you can also invoke this with Node 18+ and
// no other deps beyond sharp.

const path = require('path');
const fs = require('fs/promises');
const sharp = require('sharp');

const TILE_SIZE = 256;
const NATIVE_ZOOM = 6;
const MIN_ZOOM = 0;

const sourcePath = process.argv[2] || path.join('public', 'map-tiles', 'Solaris_3', 'Solaris_3.png');
const outputDir = process.argv[3] || path.join('public', 'map-tiles');

async function main() {
  const meta = await sharp(sourcePath).metadata();
  const { width: srcW, height: srcH } = meta;
  console.log(`Source: ${sourcePath} — ${srcW} × ${srcH}`);

  for (let z = NATIVE_ZOOM; z >= MIN_ZOOM; z--) {
    const factor = Math.pow(2, NATIVE_ZOOM - z);
    const scaledW = Math.max(1, Math.round(srcW / factor));
    const scaledH = Math.max(1, Math.round(srcH / factor));
    const cols = Math.ceil(scaledW / TILE_SIZE);
    const rows = Math.ceil(scaledH / TILE_SIZE);
    const total = cols * rows;
    console.log(`z=${z}: ${scaledW}×${scaledH}  →  ${cols}×${rows} = ${total} tiles`);

    // Render the downscaled base once, then slice it.
    const baseBuffer = await sharp(sourcePath)
      .resize(scaledW, scaledH, { kernel: sharp.kernel.lanczos3 })
      .toBuffer();

    let done = 0;
    for (let y = 0; y < rows; y++) {
      const yDir = path.join(outputDir, String(z), String(y));
      await fs.mkdir(yDir, { recursive: true });

      for (let x = 0; x < cols; x++) {
        const left = x * TILE_SIZE;
        const top = y * TILE_SIZE;
        const cropW = Math.min(TILE_SIZE, scaledW - left);
        const cropH = Math.min(TILE_SIZE, scaledH - top);

        await sharp(baseBuffer)
          .extract({ left, top, width: cropW, height: cropH })
          // Pad edge tiles to a full 256×256 with transparent pixels
          .extend({
            top: 0, left: 0,
            bottom: TILE_SIZE - cropH,
            right: TILE_SIZE - cropW,
            background: { r: 0, g: 0, b: 0, alpha: 0 },
          })
          .webp({ quality: 82, effort: 4 })
          .toFile(path.join(yDir, `${x}.webp`));

        done++;
        if (done % 200 === 0) {
          process.stdout.write(`  ${done}/${total}\r`);
        }
      }
    }
    process.stdout.write(`  ${done}/${total}\n`);
  }

  console.log('\nDone.');
  console.log('Make sure app/src/features/map/MapTab.jsx has:');
  console.log(`  const MAP_W = ${meta.width};`);
  console.log(`  const MAP_H = ${meta.height};`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
