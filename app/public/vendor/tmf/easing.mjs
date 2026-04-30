/**
 * Easing functions for keyframe interpolation.
 *
 * A keyframe carries either a string easing name ('linear' | 'step') or
 * a `cubic` descriptor with cubic-bezier control points.
 *
 * `interpolate(a, b, t, easing)` returns a value between `a` and `b`
 * with t in [0,1]. Used by the mesh animation sampler.
 */

export function ease(t, easing) {
  if (!easing || easing === 'linear') return t;
  if (easing === 'step') return 0;        // step holds at the start until next keyframe
  if (easing === 'cubic' || (easing && easing.type === 'cubic')) {
    const cp = easing.cp || [0.42, 0, 0.58, 1];
    return cubicBezierY(t, cp[0], cp[1], cp[2], cp[3]);
  }
  return t;
}

export function lerp(a, b, t) { return a + (b - a) * t; }

/** Find the value at time t given a sorted-by-t list of keyframes. */
export function sampleTrack(keyframes, t) {
  if (!keyframes || keyframes.length === 0) return 0;
  if (t <= keyframes[0].t) return keyframes[0].v;
  if (t >= keyframes[keyframes.length - 1].t) return keyframes[keyframes.length - 1].v;
  // Binary search for the segment.
  let lo = 0, hi = keyframes.length - 1;
  while (lo < hi - 1) {
    const mid = (lo + hi) >> 1;
    if (keyframes[mid].t <= t) lo = mid; else hi = mid;
  }
  const k0 = keyframes[lo], k1 = keyframes[lo + 1];
  const u = (t - k0.t) / (k1.t - k0.t);
  const eased = ease(u, k0.easing);
  return lerp(k0.v, k1.v, eased);
}

/**
 * Solve cubic-bezier y at parametric t given (cx1,cy1,cx2,cy2). The SVG /
 * CSS convention: P0 = (0,0), P3 = (1,1), inputs are the two interior
 * control points. We solve t-as-x then evaluate y(t) — the precise way
 * timing curves work in CSS.
 */
function cubicBezierY(x, cx1, cy1, cx2, cy2) {
  // Solve x(t) = x via Newton-Raphson on t.
  let t = x;
  for (let i = 0; i < 8; i++) {
    const xt = bezier(t, 0, cx1, cx2, 1) - x;
    if (Math.abs(xt) < 1e-6) break;
    const dx = bezierD(t, 0, cx1, cx2, 1);
    if (Math.abs(dx) < 1e-9) break;
    t -= xt / dx;
    t = Math.max(0, Math.min(1, t));
  }
  return bezier(t, 0, cy1, cy2, 1);
}
function bezier(t, p0, p1, p2, p3) {
  const u = 1 - t;
  return u*u*u*p0 + 3*u*u*t*p1 + 3*u*t*t*p2 + t*t*t*p3;
}
function bezierD(t, p0, p1, p2, p3) {
  const u = 1 - t;
  return 3*u*u*(p1-p0) + 6*u*t*(p2-p1) + 3*t*t*(p3-p2);
}
