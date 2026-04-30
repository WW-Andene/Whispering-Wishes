/**
 * TMF Player — read a `.tmf` raster chunk and render its frames to a canvas.
 *
 * Runs in browsers and Node 22+. Browser path uses native `createImageBitmap`
 * for WebP/AVIF/PNG decoding (no codec deps). Node path uses `sharp` as a
 * shim if installed; without it, only formats Node natively decodes work.
 *
 * Today this player handles the chunk layouts produced by `pack-frame-sequence`:
 *   - inner_codec ∈ { webp_lossy, webp_lossless, avif_lossy, avif_lossless, png }
 *     plus passthrough mode (same labels, raw bytes).
 *   - inter_frame: 'none' (lossy frames don't delta cleanly).
 *
 * Lossless byte-path chunks (preprocess + zstd, with or without inter_frame
 * delta) are NOT handled yet — they need a browser zstd polyfill and a JS
 * port of preprocess.js. Add when needed.
 *
 * Public API:
 *   const p = await TmfPlayer.fromArrayBuffer(buf);
 *   p.width / p.height / p.duration / p.frameCount / p.times
 *   const bitmap = await p.decodeFrame(i);    // ImageBitmap
 *   await p.drawFrame(canvas, t);              // paint frame at time t (seconds)
 *   p.play(canvas, { loop: true, onFrame });   // animation loop, returns stop()
 */

// --- Environment detection -------------------------------------------------

const inBrowser = typeof window !== 'undefined' && typeof createImageBitmap === 'function';
const inNode = typeof process !== 'undefined' && process.versions && process.versions.node;

// --- Lossless byte-path support -------------------------------------------
// (preprocess + compression + optional inter-frame delta on raw RGBA tiles.)

import * as preprocessReverse from './preprocess.mjs';

/**
 * Decompress payload bytes by named algorithm. Works in browsers and Node.
 *   none    — pass-through.
 *   deflate — DecompressionStream in browsers, zlib.inflateSync in Node.
 *   zstd    — fzstd in either environment (small pure-JS, no native zstd
 *             in browsers; using it in Node too keeps the code path
 *             uniform and avoids a node:zlib dep on this side).
 *   brotli  — zlib.brotliDecompressSync in Node. Browsers have no
 *             baseline brotli in DecompressionStream so this throws there.
 *             At encode time, picking 'brotli' implies "Node-only target".
 */
async function decompress(bytes, algo) {
  if (!algo || algo === 'none') return bytes;
  if (inNode) {
    // Node has all four built in via zlib. The dynamic import keeps the
    // browser bundle from pulling node:zlib.
    const { default: zlib } = await import('node:zlib');
    if (algo === 'deflate') return new Uint8Array(zlib.inflateSync(bytes));
    if (algo === 'brotli')  return new Uint8Array(zlib.brotliDecompressSync(bytes));
    if (algo === 'zstd')    return new Uint8Array(zlib.zstdDecompressSync(bytes));
    throw new Error('unknown compression: ' + algo);
  }
  // Browser path
  if (algo === 'deflate') {
    const ds = new DecompressionStream('deflate');
    const out = await new Response(new Blob([bytes]).stream().pipeThrough(ds)).arrayBuffer();
    return new Uint8Array(out);
  }
  if (algo === 'zstd') {
    let fzstd;
    try { fzstd = await import('fzstd'); }
    catch (_) { throw new Error('zstd decompression requires the `fzstd` package — not installed'); }
    return fzstd.decompress(bytes);
  }
  if (algo === 'brotli') {
    throw new Error('brotli decompression not available in browsers (use deflate or zstd at encode time)');
  }
  throw new Error('unknown compression: ' + algo);
}

// --- Chunk frame parser ----------------------------------------------------
// CBOR decode + chunk parsing live in parse-chunk.mjs; we re-import here
// (historically these were inlined; deduped during the player-bundle work).

import { parseChunkBytes as parseChunk, cborDecode } from './parse-chunk.mjs';

// --- Tile decoders (per inner_codec) --------------------------------------

const MIME = {
  webp_lossy:    'image/webp',
  webp_lossless: 'image/webp',
  avif_lossy:    'image/avif',
  avif_lossless: 'image/avif',
  png:           'image/png',
};

/**
 * Extract RGBA bytes from an ImageBitmap (browser) or ImageData-like
 * {width,height,data} object (Node). Used when compositing multiple tiles
 * into one frame — we need pixel data, not just a drawable bitmap.
 */
async function bitmapToRgba(bitmap, w, h) {
  if (bitmap.data) return bitmap.data instanceof Uint8ClampedArray ? bitmap.data : new Uint8ClampedArray(bitmap.data);
  // Browser path: render the bitmap to an OffscreenCanvas and read it back.
  if (typeof OffscreenCanvas !== 'undefined') {
    const c = new OffscreenCanvas(w, h);
    const ctx = c.getContext('2d');
    ctx.drawImage(bitmap, 0, 0);
    return ctx.getImageData(0, 0, w, h).data;
  }
  throw new Error('cannot extract RGBA from bitmap (no OffscreenCanvas)');
}

async function decodeTileBitmap(bytes, innerCodec) {
  const mime = MIME[innerCodec];
  if (!mime) throw new Error('unsupported inner_codec: ' + innerCodec);

  if (inBrowser) {
    // Browsers handle WebP and PNG natively for years; AVIF is supported in
    // every modern browser too. No codec deps needed.
    const blob = new Blob([bytes], { type: mime });
    return await createImageBitmap(blob);
  }

  // Node fallback via sharp (optional dep). Returns an ImageData-shaped
  // object that drawFrame's renderer treats interchangeably with an
  // ImageBitmap. If sharp isn't installed, only PNG works (via the
  // existing adapter).
  if (innerCodec === 'png') {
    const { pngToRaster } = await import('../adapters/png.js').catch(() => ({}));
    if (pngToRaster) {
      const r = pngToRaster(Buffer.from(bytes));
      return { width: r.width, height: r.height, data: new Uint8ClampedArray(r.tiles[0].data.buffer, r.tiles[0].data.byteOffset, r.tiles[0].data.byteLength) };
    }
  }
  let sharp;
  try { ({ default: sharp } = await import('sharp')); } catch (_) {}
  if (!sharp) throw new Error('Node decode of ' + innerCodec + ' requires `sharp`. Install with: npm install sharp');
  const { data, info } = await sharp(Buffer.from(bytes)).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  return {
    width: info.width,
    height: info.height,
    data: new Uint8ClampedArray(data.buffer, data.byteOffset, data.byteLength),
  };
}

// --- Container reader (browser-side, store + deflate) ---------------------
// Mirrors src/zip.js readZip, written in plain ES so it runs in the browser.

const SIG_EOCD = 0x06054b50;
const SIG_LFH  = 0x04034b50;
const SIG_CDH  = 0x02014b50;

async function readZipBytes(bytes) {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  let eocdOff = -1;
  for (let i = bytes.length - 22; i >= Math.max(0, bytes.length - 0x10000); i--) {
    if (view.getUint32(i, true) === SIG_EOCD) { eocdOff = i; break; }
  }
  if (eocdOff < 0) throw new Error('zip: EOCD not found');
  const cdOffset  = view.getUint32(eocdOff + 16, true);
  const cdEntries = view.getUint16(eocdOff + 10, true);

  const out = {};
  let off = cdOffset;
  for (let i = 0; i < cdEntries; i++) {
    if (view.getUint32(off, true) !== SIG_CDH) throw new Error('zip: bad CDH at ' + off);
    const method   = view.getUint16(off + 10, true);
    const compSz   = view.getUint32(off + 20, true);
    const nameLen  = view.getUint16(off + 28, true);
    const extraLen = view.getUint16(off + 30, true);
    const cmtLen   = view.getUint16(off + 32, true);
    const localOff = view.getUint32(off + 42, true);
    const name = new TextDecoder().decode(bytes.subarray(off + 46, off + 46 + nameLen));

    if (view.getUint32(localOff, true) !== SIG_LFH) throw new Error('zip: bad LFH for ' + name);
    const lfhNameLen  = view.getUint16(localOff + 26, true);
    const lfhExtraLen = view.getUint16(localOff + 28, true);
    const dataStart = localOff + 30 + lfhNameLen + lfhExtraLen;
    const slice = bytes.subarray(dataStart, dataStart + compSz);

    if (method === 0) {
      out[name] = slice;
    } else if (method === 8) {
      // DecompressionStream is available in browsers since 2023 and Node 18+.
      const ds = new DecompressionStream('deflate-raw');
      const blob = new Blob([slice]);
      const decompressedBuf = await new Response(blob.stream().pipeThrough(ds)).arrayBuffer();
      out[name] = new Uint8Array(decompressedBuf);
    } else {
      throw new Error('zip: unsupported method ' + method + ' for ' + name);
    }
    off += 46 + nameLen + extraLen + cmtLen;
  }
  return out;
}

function detectContainerOrChunk(bytes) {
  if (bytes[0] === 0x54 && bytes[1] === 0x4d && bytes[2] === 0x46 && bytes[3] === 0x4e) return 'chunk'; // "TMFN"
  if (bytes[0] === 0x50 && bytes[1] === 0x4b) return 'zip';   // "PK"
  return 'unknown';
}

// --- Player ----------------------------------------------------------------

export class TmfPlayer {
  /**
   * Build from a typed-array of either a bare `.tmfn` chunk or a `.tmf`
   * container (ZIP). Returns a Promise — container ZIPs need async deflate.
   */
  static async fromArrayBuffer(buf) {
    const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
    const kind = detectContainerOrChunk(bytes);
    if (kind === 'zip') {
      const files = await readZipBytes(bytes);
      const manifestBytes = files['manifest.json'];
      if (!manifestBytes) throw new Error('container: missing manifest.json');
      const manifest = JSON.parse(new TextDecoder().decode(manifestBytes));
      // Find the video raster and the audio pcm by role.
      let videoChunk = null, audioChunk = null;
      for (const [, asset] of Object.entries(manifest.assets || {})) {
        const data = files[asset.path];
        if (!data) throw new Error('container: missing chunk ' + asset.path);
        if (asset.kind === 'raster' && (asset.role === 'video' || !videoChunk)) videoChunk = data;
        if (asset.kind === 'pcm'    && (asset.role === 'audio' || !audioChunk)) audioChunk = data;
      }
      if (!videoChunk) throw new Error('container: no raster asset to play');
      const { header, payload, version } = parseChunk(videoChunk);
      return new TmfPlayer({ header, payload, version, manifest, audioChunk });
    }
    if (kind === 'chunk') {
      const { header, payload, version, kind: k } = parseChunk(bytes);
      if (k !== 'raster') {
        throw new Error(
          `TmfPlayer is the raster sequence player; got bare ${k} chunk. ` +
          `Use render() from './render.mjs' for one-shot rendering of any kind.`,
        );
      }
      return new TmfPlayer({ header, payload, version });
    }
    throw new Error('TmfPlayer: input is neither a TMFN chunk nor a ZIP container');
  }

  constructor({ header, payload, version, manifest = null, audioChunk = null }) {
    this.version = version;
    this.header = header;
    this.payload = payload;
    this.manifest = manifest;
    this.audioChunk = audioChunk;            // raw .tmfn bytes for the pcm asset, if any
    this.width = header.width;
    this.height = header.height;
    this.frameCount = header.frames.length;
    this.times = header.frames.map(f => f.t);
    this.duration = header.duration_s || (this.times[this.times.length - 1] || 0);
    this.innerCodec = header.inner_codec || null;

    // Lazy LRU cache — bounded so a long sequence doesn't grow heap unbounded (R3).
    // Insertion order gives LRU semantics for free with Map.
    this._cache = new Map();
    this._cacheLimit = 64;             // ~tunable; covers ~2s @ 30fps prefetch window
    this._prefetchN = 4;               // R2: lookahead window
    this._prefetchInFlight = new Set();
  }

  /** Configure the decode cache size and prefetch lookahead. */
  configureCache({ limit, prefetch } = {}) {
    if (limit != null)    this._cacheLimit = Math.max(1, limit | 0);
    if (prefetch != null) this._prefetchN  = Math.max(0, prefetch | 0);
  }

  /** Index of the frame whose presentation time covers `t` seconds. */
  indexAt(t) {
    if (t <= this.times[0]) return 0;
    let lo = 0, hi = this.times.length - 1;
    while (lo < hi) {
      const mid = (lo + hi + 1) >> 1;
      if (this.times[mid] <= t) lo = mid; else hi = mid - 1;
    }
    return lo;
  }

  /**
   * Decode frame at `idx`. Returns an ImageBitmap (browser, single-tile
   * inner_codec frames) or an ImageData-like {width,height,data} object
   * (multi-tile, lossless byte path, or Node).
   *
   * For multi-tile frames, tiles are decoded independently and composited
   * into a single RGBA plane. For inter_frame='delta1' frames, the
   * previous frame's RGBA is fetched and accumulated.
   */
  async decodeFrame(idx) {
    // LRU touch — re-insert moves to end.
    if (this._cache.has(idx)) {
      const v = this._cache.get(idx);
      this._cache.delete(idx); this._cache.set(idx, v);
      this._kickPrefetch(idx);
      return v;
    }
    const frame = this.header.frames[idx];

    // Fast path: single-tile inner_codec frame (passthrough/AVIF/WebP/PNG).
    let result;
    if (this.innerCodec && frame.tiles.length === 1
        && (!this.header.inter_frame || this.header.inter_frame === 'none')) {
      const t = frame.tiles[0];
      const slice = this.payload.subarray(t.off, t.off + t.len);
      result = await decodeTileBitmap(slice, this.innerCodec);
    } else {
      // General path: composite per-tile RGBA into a full frame.
      const W = this.width, H = this.height;
      const out = new Uint8ClampedArray(W * H * 4);
      for (let ti = 0; ti < frame.tiles.length; ti++) {
        const tileRgba = await this._decodeTileRgba(idx, ti);
        const t = frame.tiles[ti];
        for (let py = 0; py < t.h; py++) {
          const srcRow = py * t.w * 4;
          const dstRow = ((t.y + py) * W + t.x) * 4;
          out.set(tileRgba.subarray(srcRow, srcRow + t.w * 4), dstRow);
        }
      }
      result = { width: W, height: H, data: out };
    }

    this._cache.set(idx, result);
    // R3: evict oldest when cache exceeds limit.
    while (this._cache.size > this._cacheLimit) {
      const oldestKey = this._cache.keys().next().value;
      this._cache.delete(oldestKey);
    }
    this._kickPrefetch(idx);
    return result;
  }

  /** R2: kick off background decodes for the next N frames. Best-effort. */
  _kickPrefetch(curIdx) {
    if (this._prefetchN <= 0) return;
    for (let i = 1; i <= this._prefetchN; i++) {
      const next = curIdx + i;
      if (next >= this.frameCount) break;
      if (this._cache.has(next) || this._prefetchInFlight.has(next)) continue;
      this._prefetchInFlight.add(next);
      // Schedule async without awaiting — fire and forget.
      Promise.resolve().then(() => this.decodeFrame(next))
        .catch(() => {})    // swallow prefetch errors; main decode will surface them
        .finally(() => this._prefetchInFlight.delete(next));
    }
  }

  /**
   * Decode a single tile to a Uint8Array of RGBA bytes (no compositing).
   * Reverses, in order: compression -> preprocess -> inter-frame delta.
   * For inner_codec tiles, decodes via the image decoder and extracts
   * RGBA from the resulting bitmap.
   */
  async _decodeTileRgba(frameIdx, tileIdx) {
    const h = this.header;
    const t = h.frames[frameIdx].tiles[tileIdx];
    const slice = this.payload.subarray(t.off, t.off + t.len);

    // Inner codec: the tile is an encoded image — decode + extract RGBA.
    if (h.inner_codec) {
      const bitmap = await decodeTileBitmap(slice, h.inner_codec);
      return await bitmapToRgba(bitmap, t.w, t.h);
    }

    // Lossless byte path: per-tile pipeline overrides chunk-level pipeline
    // when auto_pipeline was used at encode time.
    const compression = t.compression || h.compression || 'none';
    const ops = t.preprocess || h.preprocess || [];
    let buf = await decompress(slice, compression);
    if (ops.length) buf = preprocessReverse.reverseRasterPipeline(buf, t.w, t.h, ops);

    // Reverse inter-frame delta1 if used. delta1: each byte is (cur - prev) mod 256.
    if ((h.inter_frame || 'none') === 'delta1' && frameIdx > 0) {
      const prev = await this._decodeTileRgba(frameIdx - 1, tileIdx);
      const out = new Uint8Array(buf.length);
      for (let i = 0; i < buf.length; i++) out[i] = (prev[i] + buf[i]) & 0xff;
      return out;
    }
    return buf;
  }

  /** Draw the frame covering time `t` to the given canvas (2D context). */
  async drawFrame(canvas, t) {
    const idx = this.indexAt(t);
    const frame = await this.decodeFrame(idx);
    if (canvas.width !== this.width)  canvas.width = this.width;
    if (canvas.height !== this.height) canvas.height = this.height;
    // T3.9: when the source raster declares a wide-gamut color space,
    // request a matching canvas backing if the browser supports it.
    // Falls back to sRGB silently. No-op in Node where getContext is mocked.
    const cs = this.header.color_space;
    const ctxOpts = (cs === 'display-p3' || cs === 'rec2020')
      ? { colorSpace: 'display-p3' }       // Rec.2020 in canvas isn't standard yet; P3 is the closest
      : undefined;
    const ctx = ctxOpts ? canvas.getContext('2d', ctxOpts) : canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (typeof ImageBitmap !== 'undefined' && frame instanceof ImageBitmap) {
      ctx.drawImage(frame, 0, 0);
    } else {
      // ImageData-like — for multi-tile, lossless, or Node decode.
      const imageData = (typeof ImageData !== 'undefined')
        ? new ImageData(frame.data, frame.width, frame.height)
        : frame;
      if (typeof ctx.putImageData === 'function') ctx.putImageData(imageData, 0, 0);
      else throw new Error('canvas context has no putImageData (no DOM available)');
    }
    return idx;
  }

  /**
   * Decode the container's audio chunk (if any) into a WebAudio AudioBuffer.
   * Returns null if there's no audio. Browser-only; in Node this resolves to
   * the raw {sampleRate, channels, samples} which a caller can hand to a
   * Node audio engine.
   */
  async decodeAudio(audioContext = null) {
    if (!this.audioChunk) return null;
    const { header, payload } = parseChunk(this.audioChunk);
    this._audioHeader = header;       // expose for play() to read loop_start_s / loop_end_s
    if (header.compression && header.compression !== 'none')
      throw new Error('TmfPlayer audio: ' + header.compression + ' decode not yet wired in browser');
    if (header.predict && header.predict !== 'none')
      throw new Error('TmfPlayer audio: predict=' + header.predict + ' decode not yet wired in browser');

    // Reconstruct the typed array from the raw payload.
    const Ctor = ({ Float32Array, Int16Array, Int32Array, Uint8Array })[header.dtype] || Float32Array;
    const ab = new ArrayBuffer(payload.byteLength);
    new Uint8Array(ab).set(payload);
    const samples = new Ctor(ab);

    // No AudioContext (Node side, or caller didn't pass one): return raw.
    if (!audioContext) {
      if (typeof AudioContext === 'undefined') {
        return { sampleRate: header.sample_rate, channels: header.channels, samples };
      }
      audioContext = new AudioContext({ sampleRate: header.sample_rate });
    }

    // Build an AudioBuffer. Handle int / float by normalising to float32.
    const channels = header.channels;
    const frames = samples.length / channels;
    const audioBuf = audioContext.createBuffer(channels, frames, header.sample_rate);
    const norm = ({ Int16Array: 1/32768, Int32Array: 1/2147483648, Uint8Array: 1/128 })[header.dtype];
    for (let ch = 0; ch < channels; ch++) {
      const dst = audioBuf.getChannelData(ch);
      if (header.dtype === 'Float32Array') {
        for (let i = 0; i < frames; i++) dst[i] = samples[i * channels + ch];
      } else if (header.dtype === 'Uint8Array') {
        for (let i = 0; i < frames; i++) dst[i] = (samples[i * channels + ch] - 128) * norm;
      } else {
        for (let i = 0; i < frames; i++) dst[i] = samples[i * channels + ch] * norm;
      }
    }
    return audioBuf;
  }

  /**
   * Animation loop. Returns a stop() function.
   *
   * Honors `loop` (default true), `playbackRate` (default 1), and an
   * optional `onFrame(idx, t)` callback. If the container has audio AND
   * the environment has WebAudio, audio is started in sync with frames
   * and the player follows AudioContext.currentTime — drift-free.
   *
   * `audio: false` opts out of audio playback even if the container has it.
   */
  play(canvas, opts = {}) {
    const loop = opts.loop !== false;
    const rate = opts.playbackRate || 1;
    const wantAudio = opts.audio !== false && this.audioChunk && typeof AudioContext !== 'undefined';

    let stopped = false;
    let audioCtx = null;
    let audioSource = null;
    let audioStartTime = 0;        // AudioContext time when playback started
    const raf = (typeof requestAnimationFrame === 'function')
      ? requestAnimationFrame
      : (cb => setTimeout(() => cb(performance.now()), 16));

    const start = async () => {
      if (wantAudio) {
        audioCtx = new AudioContext();
        const audioBuffer = await this.decodeAudio(audioCtx);
        audioSource = audioCtx.createBufferSource();
        audioSource.buffer = audioBuffer;
        audioSource.loop = loop;
        audioSource.playbackRate.value = rate;
        // Loop points (E7): if the audio chunk carries loop_start_s /
        // loop_end_s, honor them. WebAudio's BufferSource has loopStart
        // and loopEnd in seconds, applied when loop=true.
        if (loop && this._audioHeader) {
          if (this._audioHeader.loop_start_s != null) audioSource.loopStart = this._audioHeader.loop_start_s;
          if (this._audioHeader.loop_end_s   != null) audioSource.loopEnd   = this._audioHeader.loop_end_s;
        }
        audioSource.connect(audioCtx.destination);
        audioStartTime = audioCtx.currentTime;
        audioSource.start();
      }
      const tWallStart = performance.now();
      const tick = async (now) => {
        if (stopped) return;
        let t;
        if (wantAudio && audioCtx) {
          t = (audioCtx.currentTime - audioStartTime) * rate;
        } else {
          t = (now - tWallStart) / 1000 * rate;
        }
        if (t >= this.duration) {
          if (loop && this.duration > 0) t = t % this.duration;
          else { stopped = true; if (audioSource) audioSource.stop(); return; }
        }
        const idx = await this.drawFrame(canvas, t);
        if (opts.onFrame) opts.onFrame(idx, t);
        raf(tick);
      };
      raf(tick);
    };
    start();
    return () => {
      stopped = true;
      if (audioSource) try { audioSource.stop(); } catch (_) {}
      if (audioCtx)    try { audioCtx.close(); }   catch (_) {}
    };
  }
}

export { parseChunk, cborDecode };
