/**
 * Browser-safe port of src/preprocess.js — Uint8Array everywhere, no Buffer.
 * Decode side only (the player never re-encodes). Reverses the preprocess
 * transforms applied at encode time.
 */

// --- filter (Paeth predictor) reverse --------------------------------------

export function filterDecode(buf, width, height, channels = 4) {
  const stride = width * channels;
  const out = new Uint8Array(buf.length);
  for (let y = 0; y < height; y++) {
    const rowOff = y * stride;
    for (let i = 0; i < stride; i++) {
      const left = i >= channels ? out[rowOff + i - channels] : 0;
      const up   = y > 0 ? out[rowOff + i - stride] : 0;
      const ul   = (y > 0 && i >= channels) ? out[rowOff + i - stride - channels] : 0;
      out[rowOff + i] = (buf[rowOff + i] + paeth(left, up, ul)) & 0xff;
    }
  }
  return out;
}
function paeth(a, b, c) {
  const p = a + b - c;
  const pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c);
  return pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
}

// --- color (YCoCg-R) reverse — 6 bytes/pixel back to 4 ---------------------

export function colorDecode(buf) {
  const n = buf.length / 6;
  const out = new Uint8Array(n * 4);
  // The CoCg components were written as Int16LE; reconstruct via DataView.
  const view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
  for (let i = 0; i < n; i++) {
    const y  = buf[i*6];
    const co = view.getInt16(i*6 + 1, true);
    const cg = view.getInt16(i*6 + 3, true);
    const a  = buf[i*6 + 5];
    const tmp = y - (cg >> 1);
    const g = cg + tmp;
    const b = tmp - (co >> 1);
    const r = co + b;
    out[i*4] = r & 0xff; out[i*4+1] = g & 0xff;
    out[i*4+2] = b & 0xff; out[i*4+3] = a;
  }
  return out;
}

// --- planar (RRR GGG BBB AAA -> RGBA RGBA …) reverse -----------------------

export function planarDecode(buf, bytesPerPixel) {
  const n = buf.length / bytesPerPixel;
  const out = new Uint8Array(buf.length);
  for (let c = 0; c < bytesPerPixel; c++) {
    for (let i = 0; i < n; i++) out[i * bytesPerPixel + c] = buf[c * n + i];
  }
  return out;
}

// --- Pipeline driver -------------------------------------------------------

export function reverseRasterPipeline(buf, width, height, ops) {
  let bpp = ops.includes('color') ? 6 : 4;
  for (const op of [...ops].reverse()) {
    if (op === 'planar')      buf = planarDecode(buf, bpp);
    else if (op === 'color') { buf = colorDecode(buf); bpp = 4; }
    else if (op === 'filter') buf = filterDecode(buf, width, height, bpp);
    else throw new Error('preprocess: unknown op ' + op);
  }
  return buf;
}
