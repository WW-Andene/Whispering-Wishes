/**
 * WebGL2 mesh renderer — Phase C.4 (complete: foundation + skinning + tint + blend).
 *
 * Why WebGL: Canvas2D's triangle-warp + per-tile tinting (renderer C.1-C.3)
 * works for static poses but can't match spine-player on animated rigs.
 * The gaps WebGL closes:
 *
 *   - Sub-pixel triangle AA (free 4× MSAA via the antialias context attr).
 *   - Per-vertex bone weight blending in one pass (no CPU mat-mul per
 *     frame; up to 4 influences per vertex, up to 64 bones in the rig).
 *   - Color tint as a fragment uniform (no offscreen-canvas tinting cache).
 *   - Blend mode as gl.blendFunc state (no per-triangle Canvas2D state
 *     thrash). Premultiplied alpha throughout.
 *
 * The renderer is a class (not a function like Canvas2D's renderMesh)
 * because it owns persistent GPU resources — shader programs, VBOs,
 * texture handles. Constructing it lazily on first draw amortizes setup
 * cost across frames; for animation, reuse one renderer across frames.
 *
 * Fallback: hasWebGL2() at the bottom probes capability, and
 * render-mesh.mjs's auto-renderer wires WebGL2 → Canvas2D selection.
 */

const MAX_BONES = 64;        // uniform array size; covers typical rigs

const VERTEX_SHADER = `#version 300 es
in vec2 a_pos;
in vec2 a_uv;
in vec4 a_skin_idx;       // up to 4 bone indices per vertex
in vec4 a_skin_weight;    // matching weights (sum should = 1.0)
uniform mat3 u_projection;
uniform mat3 u_bones[${MAX_BONES}];
uniform bool u_useSkin;
out vec2 v_uv;

void main() {
  vec3 p;
  if (u_useSkin) {
    // Linear-blend skinning: p = sum_i w_i * M_i * pos
    p = vec3(0.0);
    for (int i = 0; i < 4; i++) {
      int   idx = int(a_skin_idx[i]);
      float w   = a_skin_weight[i];
      p += w * (u_bones[idx] * vec3(a_pos, 1.0));
    }
  } else {
    p = vec3(a_pos, 1.0);
  }
  vec3 clip = u_projection * p;
  gl_Position = vec4(clip.xy, 0.0, 1.0);
  v_uv = a_uv;
}
`;

// Fragment shader applies the slot tint as a premultiplied multiply.
// For PMA textures: result.rgb = tex.rgb * tint.rgb * tint.a
//                   result.a   = tex.a   * tint.a
// Keeps the output premultiplied so blendFunc(ONE, ONE_MINUS_SRC_ALPHA)
// composites correctly downstream.
const FRAGMENT_SHADER = `#version 300 es
precision highp float;
in vec2 v_uv;
uniform sampler2D u_tex;
uniform vec4 u_tint;       // straight RGBA in [0,1]
out vec4 outColor;

void main() {
  vec4 t = texture(u_tex, v_uv);
  outColor = vec4(t.rgb * u_tint.rgb * u_tint.a, t.a * u_tint.a);
}
`;

function compileShader(gl, type, source) {
  const sh = gl.createShader(type);
  gl.shaderSource(sh, source);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(sh);
    gl.deleteShader(sh);
    throw new Error('shader compile failed: ' + log);
  }
  return sh;
}

function linkProgram(gl, vsSrc, fsSrc) {
  const vs = compileShader(gl, gl.VERTEX_SHADER, vsSrc);
  const fs = compileShader(gl, gl.FRAGMENT_SHADER, fsSrc);
  const p = gl.createProgram();
  gl.attachShader(p, vs);
  gl.attachShader(p, fs);
  gl.linkProgram(p);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
    const log = gl.getProgramInfoLog(p);
    gl.deleteProgram(p);
    throw new Error('program link failed: ' + log);
  }
  gl.deleteShader(vs);
  gl.deleteShader(fs);
  return p;
}

/**
 * Build an orthographic projection matrix that maps a vertex range
 * [minX, maxX] x [minY, maxY] into clip space [-1, 1] x [-1, 1] with
 * Y axis flipped (canvas Y grows downward, GL clip Y grows upward).
 *
 * Returned as a Float32Array(9) in column-major order.
 */
export function orthoMatrix(minX, minY, maxX, maxY) {
  const sx = 2 / (maxX - minX);
  const sy = 2 / (maxY - minY);
  return new Float32Array([
    sx,  0,  0,
     0, -sy, 0,
    -1 - minX * sx,  1 + minY * sy, 1,
  ]);
}

/** Identity 3x3 column-major Float32Array. */
export function identityMat3() {
  return new Float32Array([1, 0, 0,  0, 1, 0,  0, 0, 1]);
}

export class WebGLMeshRenderer {
  /**
   * @param {HTMLCanvasElement | OffscreenCanvas} canvas
   * @param {object} [opts]
   * @param {boolean} [opts.antialias=true]  request MSAA from the context
   * @param {boolean} [opts.preserveDrawingBuffer=false]
   */
  constructor(canvas, opts = {}) {
    const gl = canvas.getContext('webgl2', {
      antialias:              opts.antialias !== false,
      premultipliedAlpha:     true,    // matches the C.1 decode contract
      preserveDrawingBuffer:  !!opts.preserveDrawingBuffer,
      alpha:                  true,
    });
    if (!gl) throw new Error('WebGLMeshRenderer: WebGL2 unavailable on this canvas');

    this.canvas = canvas;
    this.gl = gl;
    this.program = linkProgram(gl, VERTEX_SHADER, FRAGMENT_SHADER);

    this.attribs = {
      pos:        gl.getAttribLocation(this.program, 'a_pos'),
      uv:         gl.getAttribLocation(this.program, 'a_uv'),
      skinIdx:    gl.getAttribLocation(this.program, 'a_skin_idx'),
      skinWeight: gl.getAttribLocation(this.program, 'a_skin_weight'),
    };
    this.uniforms = {
      projection: gl.getUniformLocation(this.program, 'u_projection'),
      tex:        gl.getUniformLocation(this.program, 'u_tex'),
      tint:       gl.getUniformLocation(this.program, 'u_tint'),
      useSkin:    gl.getUniformLocation(this.program, 'u_useSkin'),
      bones:      gl.getUniformLocation(this.program, 'u_bones[0]'),
    };

    this.vbo            = gl.createBuffer();
    this.uvBuf          = gl.createBuffer();
    this.skinIdxBuf     = gl.createBuffer();
    this.skinWeightBuf  = gl.createBuffer();
    this.ibo            = gl.createBuffer();
    this.vao            = gl.createVertexArray();
    this.texture        = null;
    this.indexCount     = 0;
    this.useSkin        = false;

    // Default state — straight white tint, normal blending, identity bones.
    this._tint  = new Float32Array([1, 1, 1, 1]);
    this._bones = new Float32Array(MAX_BONES * 9);
    for (let i = 0; i < MAX_BONES; i++) {
      this._bones[i * 9 + 0] = 1;
      this._bones[i * 9 + 4] = 1;
      this._bones[i * 9 + 8] = 1;
    }

    gl.enable(gl.BLEND);
    this.setBlendMode('normal');
  }

  /**
   * Upload mesh geometry. `skinIndices` and `skinWeights` are optional:
   * pass them to enable GPU skinning. Without them the mesh renders in
   * its rest pose (passthrough vertex shader path).
   *
   * @param {Float32Array} positions    flat [x,y, x,y, ...]
   * @param {Float32Array} uvs          flat [u,v, u,v, ...]
   * @param {Uint16Array | Uint32Array} indices  triangle indices
   * @param {Float32Array} [skinIndices] flat [b0,b1,b2,b3, ...] per vertex
   * @param {Float32Array} [skinWeights] flat [w0,w1,w2,w3, ...] per vertex
   */
  upload({ positions, uvs, indices, skinIndices = null, skinWeights = null }) {
    const gl = this.gl;
    gl.bindVertexArray(this.vao);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.DYNAMIC_DRAW);
    gl.enableVertexAttribArray(this.attribs.pos);
    gl.vertexAttribPointer(this.attribs.pos, 2, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.uvBuf);
    gl.bufferData(gl.ARRAY_BUFFER, uvs, gl.DYNAMIC_DRAW);
    gl.enableVertexAttribArray(this.attribs.uv);
    gl.vertexAttribPointer(this.attribs.uv, 2, gl.FLOAT, false, 0, 0);

    if (skinIndices && skinWeights) {
      gl.bindBuffer(gl.ARRAY_BUFFER, this.skinIdxBuf);
      gl.bufferData(gl.ARRAY_BUFFER, skinIndices, gl.STATIC_DRAW);
      gl.enableVertexAttribArray(this.attribs.skinIdx);
      gl.vertexAttribPointer(this.attribs.skinIdx, 4, gl.FLOAT, false, 0, 0);

      gl.bindBuffer(gl.ARRAY_BUFFER, this.skinWeightBuf);
      gl.bufferData(gl.ARRAY_BUFFER, skinWeights, gl.STATIC_DRAW);
      gl.enableVertexAttribArray(this.attribs.skinWeight);
      gl.vertexAttribPointer(this.attribs.skinWeight, 4, gl.FLOAT, false, 0, 0);

      this.useSkin = true;
    } else {
      this.useSkin = false;
    }

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.ibo);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
    this.indexCount = indices.length;
    this.indexType = indices instanceof Uint32Array
      ? gl.UNSIGNED_INT
      : gl.UNSIGNED_SHORT;

    gl.bindVertexArray(null);
  }

  setTexture(source) {
    const gl = this.gl;
    if (!this.texture) this.texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  }

  /**
   * Update the bone matrix palette. Pass a Float32Array of N*9 floats
   * (column-major mat3, one matrix per bone). Bones beyond MAX_BONES
   * are ignored.
   */
  setBones(matrices) {
    const n = Math.min(matrices.length, MAX_BONES * 9);
    this._bones.set(matrices.subarray(0, n));
  }

  /**
   * Set the per-draw RGBA tint. Accepts:
   *   - a uint32 0xRRGGBBAA, or
   *   - a [r,g,b,a] array with each component in [0,1].
   * Default white (1,1,1,1) is a no-op multiplied by the texture.
   */
  setTint(rgba) {
    if (typeof rgba === 'number') {
      this._tint[0] = ((rgba >>> 24) & 0xff) / 255;
      this._tint[1] = ((rgba >>> 16) & 0xff) / 255;
      this._tint[2] = ((rgba >>>  8) & 0xff) / 255;
      this._tint[3] = ( rgba         & 0xff) / 255;
    } else {
      this._tint[0] = rgba[0];
      this._tint[1] = rgba[1];
      this._tint[2] = rgba[2];
      this._tint[3] = rgba[3];
    }
  }

  /**
   * Set the GL blend equation matching a TMF blend_mode header value.
   *
   *   normal    -> src*1 + dst*(1-src.a)        (PMA over)
   *   additive  -> src*1 + dst*1
   *   multiply  -> src*dst + dst*(1-src.a)      (PMA-aware approx.)
   *   screen    -> src*1 + dst*(1-src)          (PMA-aware approx.)
   *
   * multiply / screen aren't perfect Photoshop matches in fixed-function
   * blending — the precise form requires reading the destination in the
   * fragment shader (KHR_blend_equation_advanced, not universal). For
   * most slots the fixed-function approximation is visually equivalent.
   */
  setBlendMode(mode) {
    const gl = this.gl;
    switch (mode) {
      case 'additive':
        gl.blendFuncSeparate(gl.ONE, gl.ONE, gl.ONE, gl.ONE);
        break;
      case 'multiply':
        gl.blendFuncSeparate(gl.DST_COLOR, gl.ONE_MINUS_SRC_ALPHA,
                              gl.DST_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        break;
      case 'screen':
        gl.blendFuncSeparate(gl.ONE, gl.ONE_MINUS_SRC_COLOR,
                              gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
        break;
      case 'normal':
      default:
        gl.blendFuncSeparate(gl.ONE, gl.ONE_MINUS_SRC_ALPHA,
                              gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
        break;
    }
  }

  /**
   * Render the uploaded mesh with current state (texture, bones, tint,
   * blend mode). Caller passes the orthographic projection matrix.
   *
   * @param {Float32Array} projection  3x3 column-major matrix
   * @param {object} [opts]
   * @param {boolean} [opts.clear=true]  clear the canvas before drawing
   *                                     (set false to layer multiple draws)
   */
  draw(projection, opts = {}) {
    const gl = this.gl;
    const c = this.canvas;
    gl.viewport(0, 0, c.width, c.height);
    if (opts.clear !== false) {
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
    }

    gl.useProgram(this.program);
    gl.uniformMatrix3fv(this.uniforms.projection, false, projection);
    gl.uniform4fv(this.uniforms.tint, this._tint);
    gl.uniform1i(this.uniforms.useSkin, this.useSkin ? 1 : 0);
    if (this.useSkin) {
      gl.uniformMatrix3fv(this.uniforms.bones, false, this._bones);
    }

    if (this.texture) {
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, this.texture);
      gl.uniform1i(this.uniforms.tex, 0);
    }

    gl.bindVertexArray(this.vao);
    gl.drawElements(gl.TRIANGLES, this.indexCount, this.indexType, 0);
    gl.bindVertexArray(null);
  }

  /** Release all GPU resources owned by this renderer. */
  dispose() {
    const gl = this.gl;
    if (this.program)        gl.deleteProgram(this.program);
    if (this.vbo)            gl.deleteBuffer(this.vbo);
    if (this.uvBuf)          gl.deleteBuffer(this.uvBuf);
    if (this.skinIdxBuf)     gl.deleteBuffer(this.skinIdxBuf);
    if (this.skinWeightBuf)  gl.deleteBuffer(this.skinWeightBuf);
    if (this.ibo)            gl.deleteBuffer(this.ibo);
    if (this.vao)            gl.deleteVertexArray(this.vao);
    if (this.texture)        gl.deleteTexture(this.texture);
  }
}

/**
 * Probe whether WebGL2 is usable on this canvas. Doesn't keep the context.
 */
export function hasWebGL2(canvas) {
  if (!canvas || typeof canvas.getContext !== 'function') return false;
  try {
    const gl = canvas.getContext('webgl2');
    return !!gl;
  } catch {
    return false;
  }
}
