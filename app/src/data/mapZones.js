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
//   level      — integer 1..50, freely assigned by the author. Independent
//                of parent depth — you decide what level a zone is, the
//                hierarchy doesn't infer it for you.
//   tags       — string[], free-form ('boss', 'echo', 'resource', ...)
//   note       — string shown in the popup body
//
// Add zones by appending to the array. No registration needed.

export const MAP_ZONES = [
  {
    id: 'huanglong',
    name: 'Huanglong',
    polygon: [[7285, 9923], [7488, 9623], [7488, 9251], [7269, 8931], [6969, 8847], [6653, 8911], [6229, 8763], [5885, 8607], [5816, 8230], [5958, 7845], [5743, 7568], [5884, 7212], [6229, 7166], [6540, 7025], [6632, 6719], [6389, 6559], [6169, 6307], [5869, 6283], [5469, 6267], [5093, 6087], [4747, 5995], [4363, 6024], [4069, 6267], [3967, 6629], [4005, 7009], [3734, 6980], [3432, 6989], [3396, 7302], [3419, 7565], [3441, 7827], [3456, 8103], [3513, 8379], [3741, 8607], [4053, 8823], [4205, 9067], [4329, 9323], [4565, 9583], [4885, 9723], [5237, 9739], [5529, 9779], [5852, 9700], [6183, 9676], [6455, 9811], [6749, 9924], [7017, 9924]],
  },
  {
    id: 'the-black-shore',
    name: 'The Black Shore',
    polygon: [[7024, 7816], [6924, 7996], [6920, 8220], [7034, 8356], [7246, 8412], [7430, 8346], [7518, 8188], [7510, 7956], [7386, 7786], [7188, 7741]],
  },
];
