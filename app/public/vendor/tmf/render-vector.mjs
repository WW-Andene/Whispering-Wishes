/**
 * Vector renderer for TMF `vector` primitive chunks.
 *
 * Draws SVG-style paths + text to a Canvas 2D context. Handles fill,
 * stroke, opacity, basic text. Doesn't handle gradients, masks, or
 * filters yet — those live in the `defs` map and require canvas
 * pattern/gradient construction (next pass).
 *
 * Input is a decoded TMFN chunk whose `header.kind === 'vector'`.
 * The chunk header carries everything needed; payload is empty.
 */

import { parseChunkBytes } from './parse-chunk.mjs';

/**
 * Render a vector chunk to a 2D canvas.
 *
 * @param {HTMLCanvasElement|OffscreenCanvas} canvas
 * @param {Uint8Array} chunkBytes  raw bytes of a vector .tmfn chunk
 * @param {object}     opts
 *   @prop {number} width   canvas width in px (default canvas.width)
 *   @prop {number} height  canvas height in px (default canvas.height)
 */
export function renderVector(canvas, chunkBytes, opts = {}) {
  const { header } = parseChunkBytes(chunkBytes);
  const [vx, vy, vw, vh] = header.viewBox || [0, 0, 100, 100];
  const cw = opts.width  || canvas.width  || vw;
  const ch = opts.height || canvas.height || vh;
  if (canvas.width  !== cw) canvas.width  = cw;
  if (canvas.height !== ch) canvas.height = ch;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, cw, ch);

  // Map viewBox into canvas space, preserving aspect ratio (xMidYMid meet).
  const sx = cw / vw, sy = ch / vh;
  const s  = Math.min(sx, sy);
  const dx = (cw - vw * s) / 2 - vx * s;
  const dy = (ch - vh * s) / 2 - vy * s;
  ctx.save();
  ctx.translate(dx, dy);
  ctx.scale(s, s);

  // Paths.
  const defs = header.defs || {};
  for (const p of header.paths || []) {
    const path = pathFromD(p.d);
    ctx.save();
    // Per-path transform (group hierarchy is flattened to per-path
    // transforms at encode time by the SVG adapter; this honors any
    // residual transform on the path itself).
    if (p.transform && Array.isArray(p.transform) && p.transform.length === 6) {
      ctx.transform(...p.transform);
    }
    // Filters (B4): blur / drop-shadow / brightness / contrast / hue-rotate.
    // Canvas2D's `filter` property accepts an SVG-like filter string;
    // Chrome/Firefox/Safari support 'blur(Npx)', 'drop-shadow(...)',
    // 'brightness(N)', 'contrast(N)', 'hue-rotate(Ndeg)', etc.
    if (p.filter) ctx.filter = filterString(p.filter);
    if (p.opacity != null) ctx.globalAlpha = p.opacity;
    // Stroke options (B9): dasharray, linecap, linejoin, miterlimit.
    if (p.stroke) {
      if (p.stroke.dasharray) ctx.setLineDash(p.stroke.dasharray);
      if (p.stroke.linecap)   ctx.lineCap = p.stroke.linecap;
      if (p.stroke.linejoin)  ctx.lineJoin = p.stroke.linejoin;
      if (p.stroke.miterlimit != null) ctx.miterLimit = p.stroke.miterlimit;
    }
    if (p.fill && p.fill !== 'none') {
      ctx.fillStyle = resolvePaint(ctx, p.fill, defs);
      if (p.fill_opacity != null) {
        const prev = ctx.globalAlpha;
        ctx.globalAlpha = (prev ?? 1) * p.fill_opacity;
        ctx.fill(path);
        ctx.globalAlpha = prev;
      } else ctx.fill(path);
    }
    if (p.stroke && p.stroke.color && p.stroke.color !== 'none') {
      ctx.strokeStyle = resolvePaint(ctx, p.stroke.color, defs);
      ctx.lineWidth = p.stroke.width || 1;
      ctx.stroke(path);
    }
    ctx.restore();
  }

  // Text.
  for (const t of header.texts || []) {
    ctx.fillStyle = t.fill || '#000';
    ctx.font = `${t.size || 12}px ${t.font || 'sans-serif'}`;
    ctx.textAlign = mapAnchor(t.anchor);
    ctx.textBaseline = 'alphabetic';
    if (t.opacity != null) ctx.globalAlpha = t.opacity;
    ctx.fillText(t.value || '', t.x || 0, t.y || 0);
    ctx.globalAlpha = 1;
  }
  ctx.restore();
}

function mapAnchor(a) { return a === 'middle' ? 'center' : a === 'end' ? 'right' : 'left'; }

/**
 * Build a Canvas2D filter string from a TMF filter spec.
 * Spec accepts a string (passthrough — already in Canvas2D format) or
 * a structured object: { blur: 4, drop_shadow: {x, y, blur, color},
 * brightness: 1.2, contrast: 1.5, hue_rotate: 90, saturate: 0.5,
 * grayscale: 1, sepia: 1, invert: 1, opacity: 0.8 }.
 * Multiple effects compose by concatenating space-separated CSS filters.
 */
function filterString(spec) {
  if (typeof spec === 'string') return spec;
  if (!spec || typeof spec !== 'object') return 'none';
  const parts = [];
  if (spec.blur != null) parts.push(`blur(${spec.blur}px)`);
  if (spec.drop_shadow) {
    const ds = spec.drop_shadow;
    parts.push(`drop-shadow(${ds.x || 0}px ${ds.y || 0}px ${ds.blur || 0}px ${ds.color || '#000'})`);
  }
  if (spec.brightness != null) parts.push(`brightness(${spec.brightness})`);
  if (spec.contrast   != null) parts.push(`contrast(${spec.contrast})`);
  if (spec.hue_rotate != null) parts.push(`hue-rotate(${spec.hue_rotate}deg)`);
  if (spec.saturate   != null) parts.push(`saturate(${spec.saturate})`);
  if (spec.grayscale  != null) parts.push(`grayscale(${spec.grayscale})`);
  if (spec.sepia      != null) parts.push(`sepia(${spec.sepia})`);
  if (spec.invert     != null) parts.push(`invert(${spec.invert})`);
  if (spec.opacity    != null) parts.push(`opacity(${spec.opacity})`);
  return parts.length ? parts.join(' ') : 'none';
}

/**
 * Resolve a paint value: solid color string passes through; "url(#id)"
 * looks up `defs[id]` and constructs a Canvas2D gradient. Supports
 * linear and radial gradients with stops [{ offset, color, opacity? }].
 */
function resolvePaint(ctx, paint, defs) {
  if (typeof paint !== 'string') return paint;
  const m = /^url\(#([^)]+)\)$/.exec(paint);
  if (!m) return paint;
  const def = defs[m[1]];
  if (!def) return '#000';
  if (def.type === 'linear') {
    const g = ctx.createLinearGradient(def.x1 || 0, def.y1 || 0, def.x2 || 1, def.y2 || 0);
    for (const s of def.stops || []) g.addColorStop(s.offset || 0, s.color || '#000');
    return g;
  }
  if (def.type === 'radial') {
    const g = ctx.createRadialGradient(
      def.fx || def.cx || 0, def.fy || def.cy || 0, 0,
      def.cx || 0, def.cy || 0, def.r || 1);
    for (const s of def.stops || []) g.addColorStop(s.offset || 0, s.color || '#000');
    return g;
  }
  return '#000';
}

/**
 * Build a Path2D from an SVG-style path d-string. Handles M/m L/l C/c
 * Q/q Z/z, plus h/v H/V (horizontal/vertical), and basic relative
 * variants. Skips A (arcs) — would need an SVG-arc to bezier converter
 * (future). Path2D itself has no `addPath` from SVG-d unfortunately on
 * older browsers, so we tokenize and emit moveTo/lineTo/etc. directly.
 */
function pathFromD(d) {
  const path = new Path2D();
  if (!d) return path;
  const tokens = d.match(/[a-zA-Z]|-?\d*\.?\d+(?:[eE][-+]?\d+)?/g) || [];
  let i = 0;
  let cx = 0, cy = 0;     // current point
  let startX = 0, startY = 0;
  let prevCmd = '';
  // For S/T smoothing: previous control point reflected.
  let lastCubicCx2 = null, lastCubicCy2 = null;
  let lastQuadCx1 = null,  lastQuadCy1 = null;

  while (i < tokens.length) {
    const tok = tokens[i];
    let cmd;
    if (/[a-zA-Z]/.test(tok)) { cmd = tok; i++; }
    else cmd = (prevCmd === 'M' ? 'L' : prevCmd === 'm' ? 'l' : prevCmd) || 'L';
    const rel = cmd >= 'a' && cmd <= 'z';
    const num = () => parseFloat(tokens[i++]);
    const flag = () => {
      // SVG arc flags can be a single 0/1 with no space; tokenizer already
      // splits them but accept either single-char or full-number forms.
      const t = tokens[i++];
      return t === '1' || t === '1.0' ? 1 : 0;
    };
    switch (cmd.toUpperCase()) {
      case 'M': {
        const x = rel ? cx + num() : num();
        const y = rel ? cy + num() : num();
        path.moveTo(x, y); cx = x; cy = y; startX = x; startY = y;
        lastCubicCx2 = lastCubicCy2 = lastQuadCx1 = lastQuadCy1 = null;
        break;
      }
      case 'L': {
        const x = rel ? cx + num() : num();
        const y = rel ? cy + num() : num();
        path.lineTo(x, y); cx = x; cy = y;
        lastCubicCx2 = lastCubicCy2 = lastQuadCx1 = lastQuadCy1 = null;
        break;
      }
      case 'H': {
        const x = rel ? cx + num() : num();
        path.lineTo(x, cy); cx = x;
        break;
      }
      case 'V': {
        const y = rel ? cy + num() : num();
        path.lineTo(cx, y); cy = y;
        break;
      }
      case 'C': {
        const x1 = rel ? cx + num() : num(), y1 = rel ? cy + num() : num();
        const x2 = rel ? cx + num() : num(), y2 = rel ? cy + num() : num();
        const x  = rel ? cx + num() : num(), y  = rel ? cy + num() : num();
        path.bezierCurveTo(x1, y1, x2, y2, x, y);
        lastCubicCx2 = x2; lastCubicCy2 = y2; cx = x; cy = y;
        lastQuadCx1 = lastQuadCy1 = null;
        break;
      }
      case 'S': {
        // Smooth cubic — first control point is reflection of previous cp2.
        const x1 = lastCubicCx2 != null ? 2*cx - lastCubicCx2 : cx;
        const y1 = lastCubicCy2 != null ? 2*cy - lastCubicCy2 : cy;
        const x2 = rel ? cx + num() : num(), y2 = rel ? cy + num() : num();
        const x  = rel ? cx + num() : num(), y  = rel ? cy + num() : num();
        path.bezierCurveTo(x1, y1, x2, y2, x, y);
        lastCubicCx2 = x2; lastCubicCy2 = y2; cx = x; cy = y;
        lastQuadCx1 = lastQuadCy1 = null;
        break;
      }
      case 'Q': {
        const x1 = rel ? cx + num() : num(), y1 = rel ? cy + num() : num();
        const x  = rel ? cx + num() : num(), y  = rel ? cy + num() : num();
        path.quadraticCurveTo(x1, y1, x, y);
        lastQuadCx1 = x1; lastQuadCy1 = y1; cx = x; cy = y;
        lastCubicCx2 = lastCubicCy2 = null;
        break;
      }
      case 'T': {
        // Smooth quad — control point is reflection of previous Q's cp.
        const x1 = lastQuadCx1 != null ? 2*cx - lastQuadCx1 : cx;
        const y1 = lastQuadCy1 != null ? 2*cy - lastQuadCy1 : cy;
        const x  = rel ? cx + num() : num(), y  = rel ? cy + num() : num();
        path.quadraticCurveTo(x1, y1, x, y);
        lastQuadCx1 = x1; lastQuadCy1 = y1; cx = x; cy = y;
        lastCubicCx2 = lastCubicCy2 = null;
        break;
      }
      case 'A': {
        const rx = num(), ry = num(), xRot = num();
        const large = flag(), sweep = flag();
        const x = rel ? cx + num() : num(), y = rel ? cy + num() : num();
        arcToBezier(path, cx, cy, x, y, rx, ry, xRot * Math.PI / 180, large, sweep);
        cx = x; cy = y;
        lastCubicCx2 = lastCubicCy2 = lastQuadCx1 = lastQuadCy1 = null;
        break;
      }
      case 'Z': {
        path.closePath(); cx = startX; cy = startY;
        lastCubicCx2 = lastCubicCy2 = lastQuadCx1 = lastQuadCy1 = null;
        break;
      }
      default:
        while (i < tokens.length && !/[a-zA-Z]/.test(tokens[i])) i++;
        break;
    }
    prevCmd = cmd;
  }
  return path;
}

/**
 * SVG endpoint-arc -> sequence of cubic-bezier curves emitted into a
 * Path2D. Implements the SVG 1.1 endpoint-to-center conversion (F.6.5)
 * and approximates each <=π/2 segment with one cubic. Standard, stable
 * formulas — no novel math here.
 */
function arcToBezier(path, x1, y1, x2, y2, rx, ry, phi, large, sweep) {
  if (rx === 0 || ry === 0) { path.lineTo(x2, y2); return; }
  rx = Math.abs(rx); ry = Math.abs(ry);
  // Step 1: transform to origin.
  const dx = (x1 - x2) / 2, dy = (y1 - y2) / 2;
  const cosP = Math.cos(phi), sinP = Math.sin(phi);
  const x1p =  cosP*dx + sinP*dy;
  const y1p = -sinP*dx + cosP*dy;
  // Ensure radii are large enough.
  let lambda = (x1p*x1p) / (rx*rx) + (y1p*y1p) / (ry*ry);
  if (lambda > 1) { const s = Math.sqrt(lambda); rx *= s; ry *= s; }
  // Step 2: center.
  const sign = (large !== sweep) ? 1 : -1;
  let sq = (rx*rx*ry*ry - rx*rx*y1p*y1p - ry*ry*x1p*x1p) /
           (rx*rx*y1p*y1p + ry*ry*x1p*x1p);
  sq = Math.max(0, sq);
  const coef = sign * Math.sqrt(sq);
  const cxp = coef * (rx*y1p) / ry;
  const cyp = coef * -(ry*x1p) / rx;
  // Step 3: back to original frame.
  const cx = cosP*cxp - sinP*cyp + (x1 + x2)/2;
  const cy = sinP*cxp + cosP*cyp + (y1 + y2)/2;
  // Angles.
  const ang = (ux, uy, vx, vy) => {
    const dot = ux*vx + uy*vy;
    const len = Math.sqrt((ux*ux+uy*uy)*(vx*vx+vy*vy));
    let a = Math.acos(Math.max(-1, Math.min(1, dot / len)));
    if (ux*vy - uy*vx < 0) a = -a;
    return a;
  };
  const theta1 = ang(1, 0, (x1p - cxp)/rx, (y1p - cyp)/ry);
  let dtheta = ang((x1p - cxp)/rx, (y1p - cyp)/ry, (-x1p - cxp)/rx, (-y1p - cyp)/ry);
  if (!sweep && dtheta > 0) dtheta -= 2*Math.PI;
  if ( sweep && dtheta < 0) dtheta += 2*Math.PI;

  // Split into <= π/2 segments and approximate each with one cubic.
  const segments = Math.ceil(Math.abs(dtheta) / (Math.PI/2));
  const delta = dtheta / segments;
  const t = (4/3) * Math.tan(delta / 4);
  for (let k = 0; k < segments; k++) {
    const a = theta1 + k * delta;
    const b = a + delta;
    const sa = Math.sin(a), ca = Math.cos(a);
    const sb = Math.sin(b), cb = Math.cos(b);
    // Unit-circle control points.
    const c1x = ca - t*sa, c1y = sa + t*ca;
    const c2x = cb + t*sb, c2y = sb - t*cb;
    const ex = cb,            ey = sb;
    // Apply ellipse + rotation + center.
    const xform = (px, py) => [
      cx + cosP * (rx*px) - sinP * (ry*py),
      cy + sinP * (rx*px) + cosP * (ry*py),
    ];
    const [c1xT, c1yT] = xform(c1x, c1y);
    const [c2xT, c2yT] = xform(c2x, c2y);
    const [exT,  eyT ] = xform(ex,  ey);
    path.bezierCurveTo(c1xT, c1yT, c2xT, c2yT, exT, eyT);
  }
}
