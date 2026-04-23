// Catalog of placeable map icons. Each entry is an icon "kind" — the
// editor's Map icons section lets admins pick one of these per placement.
// Adding a new icon = drop a PNG under `app/public/map icons/` and add an
// entry here. Path is passed through encodeURI at read time so filenames
// with spaces ("map icons") survive the HTTP request.
//
// Entry shape:
//   id:          stable key stored on icon drafts (iconDraft.kind)
//   name:        UI label in the editor dropdown
//   category:    default top-level filter group surfaced in the Hexagon
//                popover; user can override per-draft
//   subcategory: default second-level filter group under the category
//                (e.g. "Resonance › Nexus" vs "Resonance › Beacon");
//                user can override per-draft
//   imageUrl:    relative path under the app's BASE_URL
//   size:        natural size on disk in px (square — both PNGs are 128²)

export const MAP_ICON_CATALOG = [
  {
    id: 'resonance-nexus',
    name: 'Resonance Nexus',
    category: 'Resonance',
    subcategory: 'Nexus',
    imageUrl: 'map icons/Resonance_Nexus.png',
    size: 128,
  },
  {
    id: 'resonance-beacon',
    name: 'Resonance Beacon',
    category: 'Resonance',
    subcategory: 'Beacon',
    imageUrl: 'map icons/Resonance_beacon.png',
    size: 128,
  },
];

export function getIconCatalogEntry(kindId) {
  return MAP_ICON_CATALOG.find((c) => c.id === kindId) || null;
}
