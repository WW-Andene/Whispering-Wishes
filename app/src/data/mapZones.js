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
    polygon: [[5885, 8607], [5816, 8230], [5958, 7845], [5743, 7568], [5884, 7212], [6229, 7166], [6540, 7025], [6632, 6719], [6389, 6559], [6169, 6307], [5869, 6283], [5469, 6267], [5093, 6087], [4747, 5995], [4363, 6024], [4069, 6267], [3967, 6629], [4005, 7009], [3734, 6980], [3432, 6989], [3396, 7302], [3419, 7565], [3441, 7827], [3456, 8103], [3513, 8379], [3741, 8607], [4053, 8823], [4205, 9067], [4329, 9323], [4565, 9583], [4885, 9723], [5237, 9739], [5529, 9779], [5852, 9700], [6083, 9603], [6154, 9305], [6154, 8856]],
    level: 1,
  },
  {
    id: 'the-black-shore',
    name: 'The Black Shore',
    polygon: [[7024, 7816], [6924, 7996], [6920, 8220], [7034, 8356], [7246, 8412], [7430, 8346], [7518, 8188], [7510, 7956], [7386, 7786], [7188, 7741]],
    level: 1,
  },
  {
    id: 'rinascita',
    name: 'Rinascita',
    polygon: [[9737, 8379], [9319, 8893], [8953, 9382], [8893, 10038], [8911, 10612], [9096, 11156], [9361, 11626], [9245, 12259], [9865, 12462], [10544, 12411], [10637, 13029], [11041, 13415], [11782, 13533], [12379, 13152], [12579, 12700], [12611, 12106], [12053, 11768], [11643, 11244], [11702, 10670], [11803, 10095], [11575, 9687], [11015, 9512], [10435, 9639], [10511, 9009], [10273, 8530]],
    level: 1,
  },
  {
    id: 'septimont',
    name: 'Septimont',
    polygon: [[12073, 13564], [11714, 13771], [11708, 14117], [11758, 14456], [11918, 14745], [12025, 15046], [12396, 15115], [12781, 15143], [13113, 15211], [13452, 15132], [13732, 14948], [13836, 14671], [14048, 14451], [14176, 14131], [13992, 13859], [13661, 13855], [13409, 14003], [13141, 13887], [12805, 13727], [12479, 13666]],
    parentId: 'rinascita',
    level: 2,
  },
  {
    id: 'sanguis-plateaus',
    name: 'Sanguis Plateaus',
    polygon: [[12592, 16384], [12864, 16384], [13087, 16381], [13295, 16384], [13468, 16366], [13425, 16220], [13516, 16082], [13576, 15927], [13594, 15765], [13501, 15593], [13356, 15525], [13198, 15437], [12999, 15351], [12874, 15268], [12789, 15224], [12700, 15163], [12587, 15176], [12500, 15227], [12394, 15268], [12297, 15294], [12176, 15390], [12124, 15534], [12026, 15642], [11882, 15730], [11733, 15847], [11589, 15927], [11501, 16079], [11605, 16227], [11803, 16253], [11901, 16384], [12076, 16384], [12284, 16384]],
    parentId: 'rinascita',
    level: 2,
  },
  {
    id: 'mt-firmament',
    name: 'Mt.Firmament',
    polygon: [[6316, 8891], [6218, 9042], [6254, 9237], [6365, 9381], [6438, 9503], [6450, 9646], [6520, 9794], [6677, 9836], [6826, 9842], [6987, 9817], [7103, 9729], [7244, 9633], [7343, 9469], [7292, 9325], [7264, 9198], [7216, 9050], [7080, 8991], [6903, 9000], [6761, 9041], [6585, 9028], [6452, 8951]],
    parentId: 'huanglong',
    level: 2,
  },
  {
    id: 'roya-frostlands',
    name: 'Roya Frostlands',
    polygon: [[5181, 5133], [5941, 4897], [6212, 4376], [6056, 3834], [6450, 3392], [6427, 2849], [6359, 2261], [5941, 1831], [5509, 1419], [5523, 685], [5240, 32], [4710, 0], [4084, 0], [3377, 0], [2831, -13], [2469, 462], [2292, 1229], [2467, 1981], [2771, 2749], [3235, 3139], [3489, 3743], [3905, 4295], [4342, 4903]],
    level: 1,
  },
  {
    id: 'overlay-lahai-roi',
    name: 'Lahai Roi',
    polygon: [[4317, 5182], [3196, 2543], [5835, 1422], [6956, 4061]],
    overlayId: 'lahai-roi-placed',
    parentId: 'roya-frostlands',
    level: 2,
  },
];
