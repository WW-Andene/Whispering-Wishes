/**
 * Mesh renderer for TMF `mesh` primitive chunks.
 *
 * Capabilities:
 *   - 2D triangle rendering with UV-mapped texture (affine triangle warp
 *     via clip + transform + drawImage), or flat fill if no texture.
 *   - Animation playback: sample animation tracks at time `t`, compute
 *     bone world transforms via parent walk, apply per-vertex transforms.
 *     Single-bone-per-vertex skinning via the `vertex_bones` array.
 *   - Bone TRS: rotation, translation (x/y), scale (scale_x/scale_y).
 *     Easing per keyframe — linear / step / cubic-bezier with control
 *     points.
 *   - Vertex dequantization (Float32 -> Int16 + scale + bias).
 *
 * Out of scope (Phase 3 follow-up):
 *   - Multi-bone weighted skinning (skin_weights blending). Spine's
 *     weighted-mesh form collapses to dominant bone per vertex.
 *   - IK / path / transform constraints.
 *   - 3D meshes (TMF mesh today is 2D).
 *
 * @param canvas        target 2D canvas
 * @param chunkBytes    raw .tmfn bytes of a mesh chunk
 * @param opts.texture  optional ImageBitmap or HTMLImageElement
 * @param opts.color    fallback fill color when no texture (default '#888')
 * @param opts.t        time in seconds (default 0). Selects the animation
 *                      pose; with no animations or t=0, renders rest pose.
 * @param opts.animation animation name or index (default first)
 *
 * Premultiplied alpha (C.1): `opts.texture` MUST be decoded with the
 * correct premultiplyAlpha mode for its source. For Spine atlas pages
 * (which are typically PMA), use the helper:
 *
 *   import { decodeAtlasPage } from './decode-texture.mjs';
 *   const tex = await decodeAtlasPage(pageBytes, atlas.pages[0]);
 *   renderMesh(canvas, meshChunk, { texture: tex });
 *
 * The helper routes to createImageBitmap with `premultiplyAlpha: 'none'`
 * for premultiplied sources so the browser's compositing math produces
 * the correct single-multiply-by-A result (no double-darkening on
 * partially-transparent pixels — the "dark hair / eyes" failure mode).
 */

import { parseChunkBytes } from './parse-chunk.mjs';
import { sampleTrack } from './easing.mjs';
import { tintTextureCached } from './tint-texture.mjs';

export function renderMesh(canvas, chunkBytes, opts = {}) {
  const { header, payload } = parseChunkBytes(chunkBytes);
  const { vertices, indices, uvs, vertex_bones, skin_weights } = unpackArrays(header, payload);
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  ctx.clearRect(0, 0, W, H);

  // C.2: slot blend mode + color tint.
  // Spine slots map to Canvas2D globalCompositeOperation:
  //   normal   → 'source-over'  (default)
  //   additive → 'lighter'
  //   multiply → 'multiply'
  //   screen   → 'screen'
  // Set on the context for the duration of this mesh draw; restored at end.
  const blend = header.blend_mode;
  const compositeOp = ({
    normal:   'source-over',
    additive: 'lighter',
    multiply: 'multiply',
    screen:   'screen',
  })[blend];
  if (compositeOp) {
    ctx.save();
    ctx.globalCompositeOperation = compositeOp;
  }
  // C.3: per-slot color tint. Spine stores an RGBA8888 multiply applied
  // to every texel. Canvas2D has no per-draw multiply, so we use the
  // pre-tinted texture cache: tintTextureCached(tex, color) returns a
  // tinted OffscreenCanvas equivalent to `tex.rgb * (color.rgb / 255)`,
  // built once per (texture, color) pair and reused. Alpha is applied
  // separately via globalAlpha (Canvas's existing per-draw alpha knob).
  let activeTexture = opts.texture || null;
  if (header.color != null) {
    const a = (header.color & 0xff) / 255;
    if (a < 1) ctx.globalAlpha = a;
    if (activeTexture && (header.color >>> 8) !== 0xffffff) {
      activeTexture = tintTextureCached(activeTexture, header.color);
    }
  }

  // Resolve animation pose: per-bone world transform at time t.
  const bones = header.bones || [];
  const anim = pickAnimation(header.animations || [], opts.animation);
  const t = opts.t || 0;
  const boneWorld = computeBoneWorld(bones, anim, t);

  // Apply per-vertex bone transform (weighted if skin_weights present).
  const posed = applyBoneTransforms(vertices, vertex_bones, skin_weights, bones, boneWorld);

  // Position the mesh inside the canvas: bounds-fit transform.
  const bounds = vertexBounds(posed);
  const scale = Math.min(W / (bounds.maxX - bounds.minX || 1),
                         H / (bounds.maxY - bounds.minY || 1)) * 0.95;
  const tx = W/2 - (bounds.minX + bounds.maxX) / 2 * scale;
  const ty = H/2 - (bounds.minY + bounds.maxY) / 2 * scale;
  const project = (x, y) => [x * scale + tx, y * scale + ty];

  const tex = activeTexture;
  for (let i = 0; i + 2 < indices.length; i += 3) {
    const i0 = indices[i], i1 = indices[i+1], i2 = indices[i+2];
    const [x0, y0] = project(posed[i0*2], posed[i0*2+1]);
    const [x1, y1] = project(posed[i1*2], posed[i1*2+1]);
    const [x2, y2] = project(posed[i2*2], posed[i2*2+1]);
    if (tex && uvs) {
      const u0 = uvs[i0*2] * tex.width,  v0 = uvs[i0*2+1] * tex.height;
      const u1 = uvs[i1*2] * tex.width,  v1 = uvs[i1*2+1] * tex.height;
      const u2 = uvs[i2*2] * tex.width,  v2 = uvs[i2*2+1] * tex.height;
      drawTextureTriangle(ctx, tex, u0, v0, u1, v1, u2, v2, x0, y0, x1, y1, x2, y2);
    } else {
      ctx.fillStyle = opts.color || '#888';
      ctx.beginPath();
      ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.lineTo(x2, y2); ctx.closePath();
      ctx.fill();
    }
  }
  // Restore the blend mode + alpha state we changed above.
  if (compositeOp) ctx.restore();
  if (header.color != null) ctx.globalAlpha = 1;
}

// --- Animation sampling ---------------------------------------------------

function pickAnimation(animations, name) {
  if (animations.length === 0) return null;
  if (name == null) return animations[0];
  if (typeof name === 'number') return animations[name] || animations[0];
  return animations.find(a => a.name === name) || animations[0];
}

/**
 * Compute each bone's world transform [a, b, c, d, e, f] (2D affine) at
 * time t. Walks parents first; bones must be in topological order
 * (Spine, glTF, etc. all guarantee this).
 *
 * Returns an array indexed by bone position in the bones list.
 */
function computeBoneWorld(bones, anim, t) {
  const N = bones.length;
  const world = new Array(N);
  // Index bones by id for parent lookup (Spine uses string parent refs).
  const idToIdx = new Map();
  bones.forEach((b, i) => idToIdx.set(b.id, i));

  for (let i = 0; i < N; i++) {
    const b = bones[i];
    // Local TRS: rest pose + animation deltas.
    let rot = b.rot || 0;
    let tx  = b.x   || 0;
    let ty  = b.y   || 0;
    let sx  = b.scale_x != null ? b.scale_x : 1;
    let sy  = b.scale_y != null ? b.scale_y : 1;
    if (anim) {
      for (const track of anim.tracks || []) {
        if (track.target !== b.id) continue;
        const v = sampleTrack(track.keyframes, t);
        if (track.property === 'rot')      rot += v;
        else if (track.property === 'x')   tx  += v;
        else if (track.property === 'y')   ty  += v;
        else if (track.property === 'scale_x') sx *= v;
        else if (track.property === 'scale_y') sy *= v;
      }
    }
    const cos = Math.cos(rot), sin = Math.sin(rot);
    const local = [cos*sx, sin*sx, -sin*sy, cos*sy, tx, ty];
    const parentIdx = b.parent != null ? idToIdx.get(b.parent) : null;
    world[i] = parentIdx != null && world[parentIdx]
      ? composeAffine(world[parentIdx], local)
      : local;
  }
  return world;
}

function composeAffine(A, B) {
  const [a1,b1,c1,d1,e1,f1] = A;
  const [a2,b2,c2,d2,e2,f2] = B;
  return [
    a1*a2 + c1*b2,
    b1*a2 + d1*b2,
    a1*c2 + c1*d2,
    b1*c2 + d1*d2,
    a1*e2 + c1*f2 + e1,
    b1*e2 + d1*f2 + f1,
  ];
}

/**
 * Apply bone transforms per vertex. Two paths:
 *
 * 1. Multi-bone weighted skinning (D2): when `skin_weights` is present,
 *    each vertex blends contributions from up to N bones with weights.
 *    skin_weights layout: per vertex, K=4 entries of [bone_idx, weight]
 *    (weight=0 entries are skipped). This matches Spine's weighted-mesh
 *    + glTF's JOINTS_0/WEIGHTS_0 conventions.
 *
 * 2. Single-bone affiliation (D2 simplification): when only `vertex_bones`
 *    is present, every vertex follows one bone. Faster path; preferred
 *    when weights aren't needed.
 *
 * 3. No bones at all: pass through identity.
 */
function applyBoneTransforms(vertices, vertexBones, skinWeights, bones, boneWorld) {
  if (!boneWorld || boneWorld.length === 0) return vertices;
  const out = new Float32Array(vertices.length);
  const N = vertices.length / 2;
  const K = skinWeights ? skinWeights.length / N / 2 : 0;

  for (let i = 0; i < N; i++) {
    const x = vertices[i*2], y = vertices[i*2+1];
    if (skinWeights && K > 0) {
      // Weighted blend: x' = Σ w_k * (M_k · v),  same for y.
      let bx = 0, by = 0, totalW = 0;
      for (let k = 0; k < K; k++) {
        const boneIdx = skinWeights[i * K * 2 + k * 2]    | 0;
        const w       = skinWeights[i * K * 2 + k * 2 + 1];
        if (w === 0) continue;
        const M = boneWorld[boneIdx] || [1,0,0,1,0,0];
        bx += w * (M[0]*x + M[2]*y + M[4]);
        by += w * (M[1]*x + M[3]*y + M[5]);
        totalW += w;
      }
      // Normalize against the actual sum of contributing weights —
      // tolerates inputs that don't quite sum to 1.0 due to float drift.
      if (totalW > 0) { out[i*2] = bx / totalW; out[i*2+1] = by / totalW; }
      else { out[i*2] = x; out[i*2+1] = y; }
    } else {
      const boneIdx = vertexBones ? vertexBones[i] : 0;
      const M = boneWorld[boneIdx] || [1,0,0,1,0,0];
      out[i*2]   = M[0]*x + M[2]*y + M[4];
      out[i*2+1] = M[1]*x + M[3]*y + M[5];
    }
  }
  return out;
}

// --- Triangle drawing -----------------------------------------------------

function drawTextureTriangle(ctx, tex,
    u0, v0, u1, v1, u2, v2,
    x0, y0, x1, y1, x2, y2) {
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.lineTo(x2, y2); ctx.closePath();
  ctx.clip();
  const denom = (u1 - u0) * (v2 - v0) - (u2 - u0) * (v1 - v0);
  if (Math.abs(denom) < 1e-9) { ctx.restore(); return; }
  const a = ((x1 - x0) * (v2 - v0) - (x2 - x0) * (v1 - v0)) / denom;
  const c = ((x2 - x0) * (u1 - u0) - (x1 - x0) * (u2 - u0)) / denom;
  const e = x0 - a * u0 - c * v0;
  const b = ((y1 - y0) * (v2 - v0) - (y2 - y0) * (v1 - v0)) / denom;
  const d = ((y2 - y0) * (u1 - u0) - (y1 - y0) * (u2 - u0)) / denom;
  const f = y0 - b * u0 - d * v0;
  ctx.transform(a, b, c, d, e, f);
  ctx.drawImage(tex, 0, 0);
  ctx.restore();
}

function vertexBounds(verts) {
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (let i = 0; i < verts.length; i += 2) {
    const x = verts[i], y = verts[i+1];
    if (x < minX) minX = x; if (x > maxX) maxX = x;
    if (y < minY) minY = y; if (y > maxY) maxY = y;
  }
  return { minX, maxX, minY, maxY };
}

/**
 * Walk a mesh chunk's `refs` map, extracting + dequantizing the typed
 * arrays it points into. Exported so consumers building custom rendering
 * pipelines (e.g. WebGL, server-side rasterization) don't have to repeat
 * the layout decode.
 */
export function unpackArrays(header, payload) {
  const out = { vertices: null, indices: null, uvs: null, vertex_bones: null, skin_weights: null };
  for (const name of ['vertices', 'indices', 'uvs', 'vertex_bones', 'skin_weights']) {
    const ref = header.refs && header.refs[name];
    if (!ref) continue;
    const slice = payload.subarray(ref.off, ref.off + ref.len);
    const ab = new ArrayBuffer(slice.byteLength);
    new Uint8Array(ab).set(slice);
    let arr;
    if (ref.dtype === 'Float32Array')   arr = new Float32Array(ab);
    else if (ref.dtype === 'Int16Array') arr = new Int16Array(ab);
    else if (ref.dtype === 'Uint16Array') arr = new Uint16Array(ab);
    else if (ref.dtype === 'Uint32Array') arr = new Uint32Array(ab);
    else if (ref.dtype === 'Uint8Array')  arr = new Uint8Array(ab);
    else throw new Error('mesh: unsupported dtype ' + ref.dtype);

    if (ref.scale != null) {
      const f = new Float32Array(arr.length);
      for (let i = 0; i < arr.length; i++) f[i] = (arr[i] + 32768) * ref.scale + ref.bias;
      arr = f;
    }
    out[name] = arr;
  }
  return out;
}
