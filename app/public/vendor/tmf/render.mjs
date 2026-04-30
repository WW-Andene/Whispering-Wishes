/**
 * Top-level render dispatch — pick the right renderer for any chunk kind.
 *
 * Usage:
 *   import { render } from './render.mjs';
 *   render(canvas, chunkBytes);                // auto-detect kind
 *   render(canvas, chunkBytes, { texture });   // mesh with texture
 *
 * Time-aware: pass `opts.t` (seconds) to render any kind at a specific
 * point in time — mesh chunks use it to sample animation tracks; raster
 * chunks use it to pick the right frame in a sequence; vector is
 * currently static (animation tracks for vector are Phase 3).
 */

import { parseChunkBytes } from './parse-chunk.mjs';
import { renderVector } from './render-vector.mjs';
import { renderMesh   } from './render-mesh.mjs';
import { TmfPlayer    } from './tmf-player.mjs';

// Re-export the WebGL renderer surface so consumers don't need a deeper
// import path. Use these directly for animated rigs (one persistent
// renderer instance, many draw() calls); use render() / renderMesh()
// for static one-shot rendering.
export { WebGLMeshRenderer, hasWebGL2, orthoMatrix, identityMat3 } from './render-mesh-webgl.mjs';

export async function render(canvas, chunkBytes, opts = {}) {
  const { kind } = parseChunkBytes(chunkBytes);
  if (kind === 'vector') return renderVector(canvas, chunkBytes, opts);
  if (kind === 'mesh')   return renderMesh(canvas, chunkBytes, opts);
  if (kind === 'raster') {
    const player = await TmfPlayer.fromArrayBuffer(chunkBytes);
    return player.drawFrame(canvas, opts.t || 0);
  }
  if (kind === 'pcm') {
    throw new Error("render: 'pcm' is audio — no visual; use TmfPlayer for ZIPs with audio.");
  }
  if (kind === 'procedural') {
    throw new Error("render: 'procedural' renderer not wired yet; use the procedural runtime directly.");
  }
  if (kind === 'text') {
    throw new Error("render: 'text' (subtitle) is an overlay — composite onto the video canvas yourself.");
  }
  throw new Error('render: unsupported chunk kind ' + kind);
}
