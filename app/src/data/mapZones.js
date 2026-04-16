// Map zones for the interactive map (MapTab.jsx — Leaflet tile viewer).
//
// Each zone is a polygon authored in PIXEL coordinates on the native
// 16384×16384 map image: [x, y] where
//   x = 0..16384 (left → right)
//   y = 0..16384 (top  → bottom)
//
// MapTab converts these to Leaflet lat/lng via map.unproject() at render time.
//
// AUTHORING TIP: in dev build (`npm run dev`), click anywhere on the map
// and the pixel coords are logged to the browser console as
//   [mapZones] click → [x, y]
// Paste those points into the `polygon` array below in clockwise order.
//
// Optional fields:
//   color      — hex string, default '#edaf18' (brand gold)
//   parentId   — id of another zone in this file; marks this as a sub-zone
//                (rendered with a thinner stroke; tooltip shows "Parent › Child")
//   tags       — string[], free-form ('boss', 'echo', 'resource', ...)
//   note       — string shown in the popup body
//
// Add zones by appending to the array. No registration needed.

export const MAP_ZONES = [
  // Example placeholder — delete once real zones are authored.
  // {
  //   id: 'huanglong',
  //   name: 'Huanglong',
  //   polygon: [[5000, 5000], [11000, 5000], [11000, 11000], [5000, 11000]],
  // },
  // {
  //   id: 'jinzhou',
  //   name: 'Jinzhou',
  //   polygon: [[7800, 7600], [9200, 7600], [9200, 8900], [7800, 8900]],
  //   parentId: 'huanglong',
  //   note: 'Capital of Huanglong.',
  // },
];
