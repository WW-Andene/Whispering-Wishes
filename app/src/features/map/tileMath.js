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

// Icon/zone-point placement bounds — [0, MAP_W] x [0, MAP_H] is only the
// Solaris_3 base map's own native canvas. A sub-map overlay (e.g. Mengzhou,
// center [-862, 7077]) can be positioned so part of it sits outside that
// rectangle; clamping placement clicks to Solaris's bounds alone then cuts
// off the part of the overlay that extends past the edge ("invisible wall").
// This computes the union of Solaris's own bounds with every placed
// overlay's bounding circle (center ± half the rotated rectangle's
// diagonal - a conservative superset of its true axis-aligned bounding box,
// safe regardless of the overlay's rotation) so placement is never
// restricted to less than what's actually visible on screen.
export function computePlacementBounds(overlayDrafts, catalog) {
  let minX = 0, minY = 0, maxX = MAP_W, maxY = MAP_H;
  for (const ov of overlayDrafts || []) {
    const cat = catalog.find((c) => c.id === ov.catalogId);
    if (!cat || !Array.isArray(ov.center)) continue;
    const [cx, cy] = ov.center;
    const scale = ov.scale ?? 1;
    const halfDiag = 0.5 * scale * Math.hypot(cat.naturalWidth, cat.naturalHeight);
    minX = Math.min(minX, cx - halfDiag);
    minY = Math.min(minY, cy - halfDiag);
    maxX = Math.max(maxX, cx + halfDiag);
    maxY = Math.max(maxY, cy + halfDiag);
  }
  return { minX, minY, maxX, maxY };
}

export function clampToBounds(x, y, bounds) {
  return [
    Math.max(bounds.minX, Math.min(bounds.maxX, x)),
    Math.max(bounds.minY, Math.min(bounds.maxY, y)),
  ];
}

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
