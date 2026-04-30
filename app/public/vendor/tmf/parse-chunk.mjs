/**
 * Browser-safe chunk parser. Mirrors the framing in src/chunk.js.
 * Pulled into its own module so the renderers can import it without
 * dragging in the whole player.
 */

const KIND_NAMES = { 1: 'vector', 2: 'procedural', 3: 'raster', 4: 'mesh', 5: 'pcm', 6: 'text' };

export function parseChunkBytes(bytes) {
  if (bytes[0] !== 0x54 || bytes[1] !== 0x4d || bytes[2] !== 0x46 || bytes[3] !== 0x4e)
    throw new Error('not a TMFN chunk');
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const version = view.getUint16(4, true);
  const kindNum = view.getUint16(6, true);
  const headerLen = view.getUint32(8, true);
  const header = cborDecode(bytes.subarray(12, 12 + headerLen));
  const payload = bytes.subarray(12 + headerLen);
  return { version, kind: KIND_NAMES[kindNum] || `unknown(${kindNum})`, header, payload };
}

export function cborDecode(bytes) {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const s = { bytes, view, off: 0 };
  return decode(s);
}

function decode(s) {
  const ib = s.bytes[s.off++];
  const major = ib >> 5;
  const ai = ib & 0x1f;
  const n = readLen(s, ai);
  switch (major) {
    case 0: return n;
    case 1: return -1 - n;
    case 2: { const out = s.bytes.subarray(s.off, s.off + n); s.off += n; return out; }
    case 3: { const buf = s.bytes.subarray(s.off, s.off + n); s.off += n; return new TextDecoder().decode(buf); }
    case 4: { const a = []; for (let i = 0; i < n; i++) a.push(decode(s)); return a; }
    case 5: { const o = {}; for (let i = 0; i < n; i++) { const k = decode(s); o[k] = decode(s); } return o; }
    case 7:
      if (ai === 20) return false;
      if (ai === 21) return true;
      if (ai === 22) return null;
      if (ai === 27) return s.view.getFloat64(s.off - 8, false);
      throw new Error('cbor: simple/float ai ' + ai);
  }
  throw new Error('cbor: bad major ' + major);
}

function readLen(s, ai) {
  if (ai < 24) return ai;
  if (ai === 24) { const v = s.bytes[s.off]; s.off += 1; return v; }
  if (ai === 25) { const v = s.view.getUint16(s.off, false); s.off += 2; return v; }
  if (ai === 26) { const v = s.view.getUint32(s.off, false); s.off += 4; return v; }
  if (ai === 27) { s.off += 8; return 0; }
  throw new Error('cbor: ai ' + ai);
}
