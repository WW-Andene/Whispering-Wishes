// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — features/map/tileMath.js (extracted from MapTab.jsx)
// Tile pyramid dimensions and RDP polyline simplification — pure math, no
// React/Leaflet dependency.
// ═══════════════════════════════════════════════════════════════════════════════

export const MAP_W = 12288;
export const MAP_H = 16384;
export const TILE_SIZE = 256;
export const NATIVE_ZOOM = 6;  // zoom level at which the 16384×16384 tile pyramid is defined
export const MAX_ZOOM = 10;    // how far the user can zoom in (tiles upscale beyond NATIVE_ZOOM)

// Ramer–Douglas–Peucker polyline simplification. Input/output: [[x,y], ...].
// `epsilon` is the max perpendicular distance (same units as input) a dropped
// point may lie from the kept segment.
export function rdpSimplify(points, epsilon) {
  if (!Array.isArray(points) || points.length < 3) return points || [];
  const sqSegDist = ([x, y], [x1, y1], [x2, y2]) => {
    const dx = x2 - x1, dy = y2 - y1;
    const lenSq = dx * dx + dy * dy;
    let t = 0;
    if (lenSq > 0) t = ((x - x1) * dx + (y - y1) * dy) / lenSq;
    t = Math.max(0, Math.min(1, t));
    const px = x1 + t * dx, py = y1 + t * dy;
    const ex = x - px, ey = y - py;
    return ex * ex + ey * ey;
  };
  const epsSq = epsilon * epsilon;
  const keep = new Array(points.length).fill(false);
  keep[0] = true;
  keep[points.length - 1] = true;
  const stack = [[0, points.length - 1]];
  while (stack.length) {
    const [first, last] = stack.pop();
    let maxDist = 0, index = -1;
    for (let i = first + 1; i < last; i++) {
      const d = sqSegDist(points[i], points[first], points[last]);
      if (d > maxDist) { maxDist = d; index = i; }
    }
    if (maxDist > epsSq && index !== -1) {
      keep[index] = true;
      stack.push([first, index], [index, last]);
    }
  }
  return points.filter((_, i) => keep[i]);
}
