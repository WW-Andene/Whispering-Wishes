import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Settings, Trash2, LocateFixed, Map as MapIcon, Hexagon, Plus, Construction, X } from 'lucide-react';
import { Card, CardHeader } from '../../shared/components/Card.jsx';
import { MAP_ZONES } from '../../data/mapZones.js';
import { OVERLAY_CATALOG, loadOverlayDrafts, saveOverlayDrafts } from '../../data/mapOverlays.js';
import { DEFAULT_ICON_DRAFTS } from '../../data/mapDefaults.js';
import { MAP_ICON_CATALOG, getIconCatalogEntry } from '../../data/mapIconCatalog.js';
import { tileUrlsForOverlay } from '../../core/tileSW.js';
import { FocusTrapModal } from '../../shared/components/FocusTrapModal.jsx';
import { hideOnError } from '../../shared/utils/imageHelpers.js';
import { MAP_W, MAP_H, TILE_SIZE, NATIVE_ZOOM, MAX_ZOOM, rdpSimplify, computePlacementBounds, clampToBounds } from './tileMath.js';
import { getIconImage } from './iconImageCache.js';
import { OVERLAY_TILE_CACHE, OVERLAY_TILE_CACHE_LIMIT, OVERLAY_TILE_RETRY_COUNTS } from './tileCache.js';
import { loadDrafts, saveDrafts, loadPaintStrokes, savePaintStrokes } from './mapStorage.js';
import { useToast } from './useToast.js';
import { useOfflineTiles } from './useOfflineTiles.js';
import { OfflineDownloadsPopover } from './OfflineDownloadsPopover.jsx';
import { ZonesPopover } from './ZonesPopover.jsx';
import { IconFiltersPopover } from './IconFiltersPopover.jsx';
import { t } from '../../utils/i18n.js';

const MAP_WIP_SEEN_KEY = 'ww-map-wip-seen';
// Last-left map position (center in native-zoom pixel coords + zoom), so
// reopening the Map tab/app resumes where the user left off instead of
// resetting to the default view every time — direct user request.
const MAP_LAST_VIEW_KEY = 'ww-map-last-view';

// Matches the base Solaris_3 tiles' own ocean color (#062634) as it actually
// renders on screen, i.e. after the .leaflet-tile-pane contrast/brightness/
// saturation filter (see its CSS rule below) darkens it slightly — using the
// pre-filter hex here made the flat background peeking out beyond the tiles
// (e.g. the wide maxBounds padding) read visibly lighter than the ocean.
const MAP_BG = '#002233';
const MAP_BG_TRANSPARENT = 'rgba(0, 34, 51, 0.55)';
// Fully-transparent MAP_BG, for the fade-pen's radial-gradient outer stop
// (see the paint-stroke draw loop's 'fade' branch) — distinct from
// MAP_BG_TRANSPARENT above, which is a fixed 55% used for UI chrome, not 0%.
const MAP_BG_ZERO_ALPHA = 'rgba(0, 34, 51, 0)';
const BASE = import.meta.env.BASE_URL || '/';
const AUTHOR_FLAG_KEY = 'ww-zone-author';

const COLOR_CANON = '#edaf18';   // brand gold — canonical zones from mapZones.js
const COLOR_DRAFT = '#38bdf8';   // cyan — session drafts
const COLOR_ACTIVE = '#edaf18';  // gold dashed — in-progress polygon

function slugify(s) {
  return String(s || '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || `zone-${Date.now().toString(36)}`;
}

// One pass of Chaikin corner-cutting (direct user request — "round the
// corners of the square zones"): each edge (P, Q) contributes two new
// points 25%/75% of the way along it, replacing the sharp vertex between
// consecutive edges with a short flat cut. A single light pass (small
// `cut` fraction) rounds a rectangle's 90° corners noticeably while barely
// perturbing an already-dense, organically-shaped zone polygon — no need
// to special-case "is this zone square".
function roundPolygonCorners(points, cut = 0.18) {
  if (!Array.isArray(points) || points.length < 3) return points;
  const out = [];
  for (let i = 0; i < points.length; i++) {
    const [x0, y0] = points[i];
    const [x1, y1] = points[(i + 1) % points.length];
    out.push([x0 + (x1 - x0) * cut, y0 + (y1 - y0) * cut]);
    out.push([x0 + (x1 - x0) * (1 - cut), y0 + (y1 - y0) * (1 - cut)]);
  }
  return out;
}

export default function MapTab({ navPadding = 80, headerPadding = 88 }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const leafletRef = useRef(null);
  const activeLayerRef = useRef(null);
  const draftsLayerRef = useRef(null);
  const headerTapsRef = useRef([]);
  const cardHeaderRef = useRef(null);
  const [headerHeight, setHeaderHeight] = useState(48);

  const [status, setStatus] = useState('Loading map...');
  const [mapReady, setMapReady] = useState(false);
  const [showWipNotice, setShowWipNotice] = useState(() => {
    if (typeof localStorage === 'undefined') return false;
    try { return localStorage.getItem(MAP_WIP_SEEN_KEY) !== '1'; } catch { return true; }
  });
  const dismissWipNotice = useCallback(() => {
    setShowWipNotice(false);
    try { localStorage.setItem(MAP_WIP_SEEN_KEY, '1'); } catch {}
  }, []);
  const [authorEnabled, setAuthorEnabled] = useState(() => {
    if (typeof localStorage === 'undefined') return false;
    return localStorage.getItem(AUTHOR_FLAG_KEY) === '1';
  });
  const [authorMode, setAuthorMode] = useState(false);
  const [freehandMode, setFreehandMode] = useState(false);
  const [pointMode, setPointMode] = useState(false);
  const freehandTraceRef = useRef(null);
  // Ocean-paint tool state — tap/drag to blot map artefacts with ocean color.
  const [paintMode, setPaintMode] = useState(false);
  const [paintBrushSize, setPaintBrushSize] = useState(40);       // radius in native px
  // 'solid' = original hard-edged blot; 'fade' = soft radial-gradient dab of
  // translucent ocean colour, fading to transparent at the brush edge;
  // 'blur' = blurs the map/overlay pixels already there instead of painting
  // any new colour, feathered the same way 'fade' feathers its colour.
  // Stored per-stroke (stroke.mode) so existing saved strokes with no mode
  // field still render as 'solid', unchanged.
  const [paintBrushMode, setPaintBrushMode] = useState('solid');
  const [paintStrokes, setPaintStrokes] = useState(loadPaintStrokes);
  const paintCanvasRef = useRef(null);
  // Reusable scratch layer for the fade pen — each fade stroke's own dabs
  // composite onto this (cleared and reused, not reallocated) with
  // globalCompositeOperation 'lighten' so a stroke's self-overlaps cap at
  // the gradient's own peak alpha instead of stacking darker, before being
  // drawn onto the real paint canvas once. See the fade-mode block below.
  const fadeLayerCanvasRef = useRef(null);
  const paintDrawRef = useRef(() => {});
  const paintLiveRef = useRef(null); // { points: [[x,y]...], size } while drawing
  const [authorPoints, setAuthorPoints] = useState([]);
  const [drafts, setDrafts] = useState(loadDrafts);
  const [draftName, setDraftName] = useState('');
  const [draftParent, setDraftParent] = useState('');
  const [draftLevel, setDraftLevel] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [jsonSnippet, setJsonSnippet] = useState('');
  const [toast, showToast] = useToast();
  const [panelCollapsed, setPanelCollapsed] = useState(false);

  // Sub-map overlay state
  const [viewFloor, setViewFloor] = useState(0);
  const [overlayDrafts, setOverlayDrafts] = useState(loadOverlayDrafts);
  const [editingOverlayId, setEditingOverlayId] = useState(null);
  // Placement clamp bounds — widened beyond Solaris_3's own [0,MAP_W]x[0,MAP_H]
  // canvas to cover every placed sub-map overlay, so clicking/dragging near
  // the edge of an overlay that itself sits partly outside Solaris's bounds
  // (e.g. Mengzhou) doesn't get silently snapped back inside them.
  const placementBounds = useMemo(
    () => computePlacementBounds(overlayDrafts, OVERLAY_CATALOG),
    [overlayDrafts]
  );
  // Offline cache status per catalog id: { cached, total, downloading, done }.
  // Populated on mount by querying the tile-cache service worker; updated
  // live during downloads so the UI can show a progress indicator.
  // Downloads popover (gear icon) — shown to all users.
  const [downloadsOpen, setDownloadsOpen] = useState(false);
  const downloadsAnchorRef = useRef(null);
  const downloadsPanelRef = useRef(null);
  const [expandedZones, setExpandedZones] = useState(() => new Set());
  // Zones tree is now a header-anchored popover (like downloads).
  const [zonesOpen, setZonesOpen] = useState(false);
  const zonesAnchorRef = useRef(null);
  const zonesPanelRef = useRef(null);
  // Icon filters popover — toggles visibility of placed map-icon categories.
  const [filtersOpen, setFiltersOpen] = useState(false);
  const filtersAnchorRef = useRef(null);
  const filtersPanelRef = useRef(null);
  // Map icons (placed by admins via the author panel). Each entry:
  //   { id, category, x, y, label? }
  // Persisted to localStorage. Categories drive the filter popover.
  const [iconDrafts, setIconDrafts] = useState(() => {
    if (typeof localStorage === 'undefined') return DEFAULT_ICON_DRAFTS;
    try {
      const raw = localStorage.getItem('ww-icon-drafts');
      if (raw === null) return DEFAULT_ICON_DRAFTS;
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : DEFAULT_ICON_DRAFTS;
    } catch { return DEFAULT_ICON_DRAFTS; }
  });
  const [iconFiltersOff, setIconFiltersOff] = useState(() => {
    // Set of category keys currently hidden. Persisted. 'Zone/Area' defaults
    // to off (direct user request) — seeded into the off-set exactly once
    // (tracked by ZONE_AREA_SEEDED_KEY) so a later explicit "turn it on"
    // sticks across reloads instead of this default re-adding it forever.
    const ZONE_AREA_SEEDED_KEY = 'ww-icon-filters-zone-area-seeded';
    if (typeof localStorage === 'undefined') return new Set(['Zone/Area']);
    let set;
    try {
      const raw = localStorage.getItem('ww-icon-filters-off');
      const parsed = raw ? JSON.parse(raw) : [];
      set = new Set(Array.isArray(parsed) ? parsed : []);
    } catch { set = new Set(); }
    try {
      if (!localStorage.getItem(ZONE_AREA_SEEDED_KEY)) {
        set.add('Zone/Area');
        localStorage.setItem(ZONE_AREA_SEEDED_KEY, '1');
        localStorage.setItem('ww-icon-filters-off', JSON.stringify([...set]));
      }
    } catch {}
    return set;
  });
  const saveIconDrafts = useCallback((next) => {
    setIconDrafts(next);
    try { localStorage.setItem('ww-icon-drafts', JSON.stringify(next)); } catch {}
  }, []);
  // Zone id whose Area outline should pulse — set by clicking a zone row in
  // the Regions popover (ZonesPopover), cleared automatically after the
  // pulse plays out. Direct user request.
  const [pulseZoneId, setPulseZoneId] = useState(null);
  const pulseZoneTimerRef = useRef(null);
  const triggerZonePulse = useCallback((zoneId) => {
    setPulseZoneId(zoneId);
    if (pulseZoneTimerRef.current) clearTimeout(pulseZoneTimerRef.current);
    pulseZoneTimerRef.current = setTimeout(() => setPulseZoneId(null), 2200);
  }, []);
  useEffect(() => () => { if (pulseZoneTimerRef.current) clearTimeout(pulseZoneTimerRef.current); }, []);

  const toggleIconFilter = useCallback((cat) => {
    setIconFiltersOff((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat); else next.add(cat);
      try { localStorage.setItem('ww-icon-filters-off', JSON.stringify([...next])); } catch {}
      return next;
    });
  }, []);

  // ── Bulk selection in the author panel's draft tree ──────────────────
  // Admins can tick zones, subzones, or in-tree icons to apply a rename /
  // level / floor change to the lot at once. Ephemeral (not persisted) —
  // selection clears on reload.
  //   Zone    = draft with level == null || level === 1
  //   Subzone = draft with level >= 2
  //   Icon    = iconDraft with inTree === true
  const [selectedDraftIds, setSelectedDraftIds] = useState(() => new Set());
  const [selectedIconIds, setSelectedIconIds] = useState(() => new Set());
  const [bulkFind, setBulkFind] = useState('');
  const [bulkReplace, setBulkReplace] = useState('');
  const [bulkLevel, setBulkLevel] = useState('');
  const [bulkFloor, setBulkFloor] = useState('');
  // Place-on-map mode — stores the id of the icon awaiting a map click.
  // When non-null, the next map click sets its x/y and clears this state.
  // Mirrored to a ref so the author-mode click handler can stand down
  // (it'd otherwise add a zone-polygon vertex to the same click).
  const [placingIconId, setPlacingIconId] = useState(null);
  const placingIconIdRef = useRef(null);
  // Multi-place mode — stores the id of the icon row acting as the
  // template. While non-null, every map click CLONES the template at
  // the click location (keeping the same kind / category / rotation /
  // scale / opacity) instead of moving a single pending icon. Exits on
  // re-click of the button, ESC, or leaving the map.
  const [multiPlaceFromId, setMultiPlaceFromId] = useState(null);
  useEffect(() => {
    placingIconIdRef.current = placingIconId != null || multiPlaceFromId != null;
  }, [placingIconId, multiPlaceFromId]);
  // L2-leaf confirm: first tap on a leaf arms it, second tap within
  // ZONE_ARM_MS fires handleFlyToZone. Leaves don't have an explicit
  // fly-to icon; this prevents accidental navigation when browsing.
  const [pendingZoneId, setPendingZoneId] = useState(null);
  const pendingZoneTimerRef = useRef(null);
  const ZONE_ARM_MS = 2500;
  const overlayCanvasRef = useRef(null);           // single <canvas> shared by all overlays
  const overlayLiveRef = useRef(null);             // live override during gesture: { id, center?, scale?, rotation? }
  const overlayRedrawRef = useRef(() => {});       // exposes draw() to the gesture effect

  const tileLayerRef = useRef(null);
  const gestureActiveRef = useRef(false);

  // View rotation (CSS-transform only — Leaflet's own lat/lng<->pixel math
  // never learns about it). Two-finger twist changes it; author/freehand/paint
  // modes force it back to 0 because their click/drag handlers convert raw
  // pointer positions through Leaflet's own (rotation-unaware) math.
  const [rotation, setRotation] = useState(0);
  const rotationRef = useRef(0);
  const rotateTouchRef = useRef(null); // { angle, rotation, dist, zoom } captured at 2-finger touchstart
  const panTouchRef = useRef(null);    // { x, y } for rotation-corrected 1-finger pan
  // Live pinch-zoom preview scale (CSS-only, like Leaflet's own native
  // touchZoom): updated every touchmove for a smooth, continuous feel,
  // committed to a real map.setZoom() only once the gesture ends — calling
  // setZoom() on every touchmove instead snapped to zoomSnap each frame
  // (felt "stepped") and was heavy enough to drop touch events mid-gesture
  // (made zooming all the way out feel stuck).
  const pinchScaleRef = useRef(1);
  const applyMapTransform = () => {
    const container = containerRef.current;
    if (!container) return;
    const scale = pinchScaleRef.current;
    const deg = rotationRef.current;
    container.style.transform = (deg || scale !== 1) ? `scale(${scale}) rotate(${deg}deg)` : '';
    container.style.transformOrigin = '50% 50%';
  };

  // Set of descendant ids of the zone being edited — used to forbid circular parenting.
  const editingDescendants = useMemo(() => {
    if (!editingId) return new Set();
    const all = drafts;
    const out = new Set();
    const walk = (id) => {
      all.forEach(z => {
        if (z.parentId === id && !out.has(z.id)) {
          out.add(z.id);
          walk(z.id);
        }
      });
    };
    walk(editingId);
    return out;
  }, [drafts, editingId]);

  // Tree-shaped parent dropdown: canonical zones first, then drafts, each with depth.
  // Excludes the zone being edited and any of its descendants (would create a cycle).
  const parentOptionsTree = useMemo(() => {
    const all = [
      ...MAP_ZONES.map(z => ({ id: z.id, name: z.name || z.id, parentId: z.parentId, level: z.level, kind: 'canonical' })),
      ...drafts
        .filter(z => z.id !== editingId && !editingDescendants.has(z.id))
        .map(z => ({ id: z.id, name: z.name || z.id, parentId: z.parentId, level: z.level, kind: 'draft' })),
    ];
    const allIds = new Set(all.map(z => z.id));
    const byParent = new Map();
    all.forEach(z => {
      const pid = z.parentId && allIds.has(z.parentId) ? z.parentId : null;
      if (!byParent.has(pid)) byParent.set(pid, []);
      byParent.get(pid).push(z);
    });
    const out = [];
    const walk = (pid, depth) => {
      const kids = byParent.get(pid) || [];
      kids.forEach(c => {
        out.push({ id: c.id, name: c.name, kind: c.kind, depth, level: c.level });
        walk(c.id, depth + 1);
      });
    };
    walk(null, 0);
    return out;
  }, [drafts, editingId, editingDescendants]);

  // Full zone catalogue (canonical + user drafts) for the read-only zone
  // selector in the top-right. Indexed by parentId so the selector can
  // lazily show children as the user expands each level.
  const zoneNav = useMemo(() => {
    const all = [...MAP_ZONES, ...drafts];
    const byParent = new Map();
    all.forEach(z => {
      const pid = z.parentId || null;
      if (!byParent.has(pid)) byParent.set(pid, []);
      byParent.get(pid).push(z);
    });
    // Preserve user-defined order from the drafts array + MAP_ZONES order
    // for canonical zones. The up/down arrows in the drafts panel drive
    // both this tree and the drafts list, regardless of level.
    return byParent;
  }, [drafts]);

  // L3 zones with a precomputed polygon centroid, feeding the "Zone" icon
  // filter's Names/Area layers below — direct user request. True polygon
  // centroid (shoelace-weighted, not just the vertex/bbox average) so a
  // name label lands visually centered in an irregular zone shape; falls
  // back to the bbox center for a degenerate (near-zero-area) polygon.
  const l3Zones = useMemo(() => {
    return drafts
      .filter(z => z.level === 3 && Array.isArray(z.polygon) && z.polygon.length >= 3)
      .map(z => {
        const pts = z.polygon;
        let area = 0, cx = 0, cy = 0;
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        for (let i = 0; i < pts.length; i++) {
          const [x0, y0] = pts[i];
          const [x1, y1] = pts[(i + 1) % pts.length];
          const cross = x0 * y1 - x1 * y0;
          area += cross;
          cx += (x0 + x1) * cross;
          cy += (y0 + y1) * cross;
          if (x0 < minX) minX = x0; if (y0 < minY) minY = y0;
          if (x0 > maxX) maxX = x0; if (y0 > maxY) maxY = y0;
        }
        area *= 0.5;
        const centroid = Math.abs(area) > 1e-6
          ? [cx / (6 * area), cy / (6 * area)]
          : [(minX + maxX) / 2, (minY + maxY) / 2];
        return { ...z, centroid };
      });
  }, [drafts]);

  // Walk the zone + its ancestor chain until we find one linked to a placed
  // sub-map, and return that placement's floor. Lets zones drawn inside a
  // sub-map inherit its floor without needing their own overlayId.
  const resolveZoneFloor = useCallback((zone) => {
    const allZones = [...MAP_ZONES, ...drafts];
    const byId = new Map(allZones.map(z => [z.id, z]));
    let cursor = zone;
    const seen = new Set();
    while (cursor && !seen.has(cursor.id)) {
      seen.add(cursor.id);
      if (cursor.overlayId) {
        const ov = overlayDrafts.find(o => o.id === cursor.overlayId);
        if (ov && Number.isFinite(ov.floor)) return ov.floor;
      }
      if (!cursor.parentId) break;
      cursor = byId.get(cursor.parentId);
    }
    return null;
  }, [drafts, overlayDrafts]);

  // Zone dropdown options for the icon editor, sorted by tree order
  // ("Parent › Child" labels) so admins can pick the correct owning
  // zone quickly.
  const zoneOptions = useMemo(() => {
    const all = [...MAP_ZONES, ...drafts];
    const byId = new Map(all.map(z => [z.id, z]));
    const labelFor = (z) => {
      if (z.parentId) {
        const parent = byId.get(z.parentId);
        return `${parent?.name || z.parentId} › ${z.name || z.id}`;
      }
      return z.name || z.id;
    };
    return all.map(z => ({ id: z.id, label: labelFor(z), zone: z }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [drafts]);

  // Find the deepest zone whose polygon encloses (x, y). Uses the standard
  // ray-casting point-in-polygon test; iterates zones in descending level
  // order so a child polygon wins over its parent. Returns the zone object
  // or null.
  const findEnclosingZone = useCallback((x, y) => {
    const all = [...MAP_ZONES, ...drafts];
    // Higher level = deeper nesting (L2 > L1). Zones without a level fall
    // to the end (treated as shallowest).
    const sorted = [...all].sort((a, b) => (b.level || 0) - (a.level || 0));
    for (const z of sorted) {
      if (!Array.isArray(z.polygon) || z.polygon.length < 3) continue;
      let inside = false;
      const poly = z.polygon;
      for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
        const xi = poly[i][0], yi = poly[i][1];
        const xj = poly[j][0], yj = poly[j][1];
        const intersect = ((yi > y) !== (yj > y)) &&
          (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
      }
      if (inside) return z;
    }
    return null;
  }, [drafts]);

  // Gold-highlight the zone that corresponds to the current floor: the
  // zone whose overlayId points at an overlay draft sitting on viewFloor.
  // Floor 0 has no single "current zone" (it's the base map) so we return
  // null there — no highlight.
  const currentZoneId = useMemo(() => {
    if (viewFloor === 0) return null;
    const ov = overlayDrafts.find(o => (o.floor ?? 0) === viewFloor);
    if (!ov) return null;
    const zone = drafts.find(z => z.overlayId === ov.id);
    return zone?.id || null;
  }, [viewFloor, overlayDrafts, drafts]);

  const switchFloorForZone = useCallback((zone) => {
    const floor = resolveZoneFloor(zone);
    if (floor != null) setViewFloor(floor);
    else setViewFloor(0); // fallback: any zone with no linked floor → ground
  }, [resolveZoneFloor]);

  const handleFlyToIcon = useCallback((ic) => {
    const map = mapRef.current;
    if (!map) return;
    // If the icon has a floor assignment, switch to it before flying.
    if (ic.floor != null && Number.isFinite(ic.floor)) setViewFloor(ic.floor);
    const target = map.unproject([ic.x, ic.y], NATIVE_ZOOM);
    try {
      const targetZoom = Math.min(map.getMaxZoom(), NATIVE_ZOOM + 1);
      map.flyTo(target, targetZoom, { duration: 0.5 });
    } catch {
      map.panTo(target);
    }
  }, []);

  const handleFlyToZone = useCallback((zone) => {
    const map = mapRef.current;
    const L = leafletRef.current;
    if (!map) return;
    // Switch to the zone's floor if it is linked to a placed sub-map overlay.
    switchFloorForZone(zone);

    // If the zone points at a sub-map overlay, warm the browser HTTP cache
    // for all its tiles BEFORE the fly-to animation begins — that way the
    // canvas renderer has tiles ready as it passes over them instead of
    // watching a patchwork fill in mid-flight. Fire-and-forget, low-stakes:
    // the browser queues these (~6 concurrent per origin), cached responses
    // are reused on the following Image() requests, failures are silent.
    if (zone.overlayId) {
      const ov = overlayDrafts.find(o => o.id === zone.overlayId);
      const cat = ov && OVERLAY_CATALOG.find(c => c.id === ov.catalogId);
      if (cat?.imageUrl?.endsWith?.('.webp')) {
        const urls = tileUrlsForOverlay(cat);
        for (const url of urls) {
          fetch(url).catch(() => {});
        }
      }
    }

    if (!Array.isArray(zone.polygon) || zone.polygon.length < 2) return;
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    zone.polygon.forEach(([x, y]) => {
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
    });
    const nw = map.unproject([minX, minY], NATIVE_ZOOM);
    const se = map.unproject([maxX, maxY], NATIVE_ZOOM);
    // Zoom 25% tighter than the natural fit (scale × 1.25 → zoom + log2(1.25)).
    const ZOOM_BOOST = Math.log2(1.25);
    try {
      const bounds = L ? L.latLngBounds(nw, se) : null;
      const fitZoom = bounds && typeof map.getBoundsZoom === 'function'
        ? map.getBoundsZoom(bounds, false, [40, 40])
        : null;
      if (fitZoom != null) {
        const targetZoom = Math.min(map.getMaxZoom(), fitZoom + ZOOM_BOOST);
        const center = bounds.getCenter();
        map.flyTo(center, targetZoom, { duration: 0.6 });
      } else {
        map.flyToBounds([nw, se], { duration: 0.6, padding: [40, 40] });
      }
    } catch {
      map.fitBounds([nw, se], { padding: [40, 40] });
    }
  }, [switchFloorForZone, overlayDrafts]);

  const toggleZoneExpanded = useCallback((id) => {
    setExpandedZones(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);

  // Push a tree-promoted sub-map back into edit mode: remove the linked zone
  // from drafts (so the overlay reappears in the Sub-maps list), unlock the
  // overlay, turn on author mode + expand the panel, and mark the overlay as
  // the one being edited so the user lands right in its edit controls.
  const handlePushSubMapToEdit = useCallback((zone) => {
    if (!zone || !zone.overlayId) return;
    const ovId = zone.overlayId;
    const nextDrafts = drafts.filter(d => d.id !== zone.id);
    if (nextDrafts.length !== drafts.length) {
      setDrafts(nextDrafts);
      saveDrafts(nextDrafts);
    }
    const nextOverlays = overlayDrafts.map(o => o.id === ovId ? { ...o, locked: false } : o);
    setOverlayDrafts(nextOverlays);
    saveOverlayDrafts(nextOverlays);
    setEditingOverlayId(ovId);
    if (!authorMode) setAuthorMode(true);
    setPanelCollapsed(false);
    // Snap the view to the overlay's floor so the user sees what they're editing.
    const ov = nextOverlays.find(o => o.id === ovId);
    if (ov && Number.isFinite(ov.floor)) setViewFloor(ov.floor);
  }, [drafts, overlayDrafts, authorMode]);

  // Tree of drafts only (canonical-parented drafts surface at root with breadcrumb).
  // Returns flat list in DFS traversal order, each node carrying { ...draft, depth, isLast }.
  const draftTree = useMemo(() => {
    const draftIds = new Set(drafts.map(d => d.id));
    const byParent = new Map();
    drafts.forEach(d => {
      const pid = d.parentId && draftIds.has(d.parentId) ? d.parentId : null;
      if (!byParent.has(pid)) byParent.set(pid, []);
      byParent.get(pid).push(d);
    });
    const out = [];
    const walk = (pid, depth) => {
      const kids = byParent.get(pid) || [];
      kids.forEach((c, i) => {
        out.push({ ...c, depth, isFirst: i === 0, isLast: i === kids.length - 1 });
        walk(c.id, depth + 1);
      });
    };
    walk(null, 0);
    return out;
  }, [drafts]);

  // Move a draft up/down among ALL its siblings (same parent), regardless
  // of level — gives the user full ordering control. The auto level sort
  // happens in zoneNav for display in the top-right tree only.
  const handleMoveDraft = (id, direction) => {
    const idx = drafts.findIndex(d => d.id === id);
    if (idx < 0) return;
    const draft = drafts[idx];
    const draftIds = new Set(drafts.map(d => d.id));
    const myParent = draft.parentId && draftIds.has(draft.parentId) ? draft.parentId : null;
    const siblings = drafts
      .map((d, i) => ({ d, i }))
      .filter(x => {
        const xp = x.d.parentId && draftIds.has(x.d.parentId) ? x.d.parentId : null;
        return xp === myParent;
      });
    const sibPos = siblings.findIndex(x => x.d.id === id);
    const targetSibPos = sibPos + direction;
    if (targetSibPos < 0 || targetSibPos >= siblings.length) return;
    const targetIdx = siblings[targetSibPos].i;
    const next = [...drafts];
    [next[idx], next[targetIdx]] = [next[targetIdx], next[idx]];
    setDrafts(next);
    saveDrafts(next);
  };

  // ── Bulk-select helpers ─────────────────────────────────────────────
  const isZoneDraft = (d) => d.level == null || d.level === 1;
  const isSubzoneDraft = (d) => d.level != null && d.level >= 2;
  const toggleDraftSelection = (id) => setSelectedDraftIds((prev) => {
    const next = new Set(prev);
    if (next.has(id)) next.delete(id); else next.add(id);
    return next;
  });
  const toggleIconSelectionId = (id) => setSelectedIconIds((prev) => {
    const next = new Set(prev);
    if (next.has(id)) next.delete(id); else next.add(id);
    return next;
  });
  // "Select all [type]" — toggles: if every matching item is already
  // selected, deselect that set; otherwise add them all to the selection.
  const toggleSelectAllZones = () => {
    const ids = drafts.filter(isZoneDraft).map(d => d.id);
    setSelectedDraftIds((prev) => {
      const next = new Set(prev);
      const allIn = ids.length > 0 && ids.every(id => next.has(id));
      if (allIn) ids.forEach(id => next.delete(id));
      else ids.forEach(id => next.add(id));
      return next;
    });
  };
  const toggleSelectAllSubzones = () => {
    const ids = drafts.filter(isSubzoneDraft).map(d => d.id);
    setSelectedDraftIds((prev) => {
      const next = new Set(prev);
      const allIn = ids.length > 0 && ids.every(id => next.has(id));
      if (allIn) ids.forEach(id => next.delete(id));
      else ids.forEach(id => next.add(id));
      return next;
    });
  };
  const toggleSelectAllIcons = () => {
    const ids = iconDrafts.filter(ic => ic.inTree).map(ic => ic.id);
    setSelectedIconIds((prev) => {
      const next = new Set(prev);
      const allIn = ids.length > 0 && ids.every(id => next.has(id));
      if (allIn) ids.forEach(id => next.delete(id));
      else ids.forEach(id => next.add(id));
      return next;
    });
  };
  const clearBulkSelection = () => {
    setSelectedDraftIds(new Set());
    setSelectedIconIds(new Set());
  };
  // Keep selection sets from accumulating ids for drafts/icons that have
  // since been deleted — trim on every mutation.
  useEffect(() => {
    const live = new Set(drafts.map(d => d.id));
    setSelectedDraftIds((prev) => {
      let changed = false;
      const next = new Set();
      prev.forEach(id => { if (live.has(id)) next.add(id); else changed = true; });
      return changed ? next : prev;
    });
  }, [drafts]);
  useEffect(() => {
    const live = new Set(iconDrafts.filter(ic => ic.inTree).map(ic => ic.id));
    setSelectedIconIds((prev) => {
      let changed = false;
      const next = new Set();
      prev.forEach(id => { if (live.has(id)) next.add(id); else changed = true; });
      return changed ? next : prev;
    });
  }, [iconDrafts]);

  const selectionTotal = selectedDraftIds.size + selectedIconIds.size;
  const selectedDraftsHasDraft = selectedDraftIds.size > 0;
  const selectedHasIcon = selectedIconIds.size > 0;

  // Bulk rename — if `find` is non-empty we do a find/replace (all occurrences,
  // case-sensitive). If `find` is empty we set the name to `replace` verbatim
  // on every selected item. Drafts use .name, icons use .label.
  const applyBulkRename = () => {
    if (!selectionTotal) return;
    const find = bulkFind;
    const replace = bulkReplace;
    if (!find && !replace) return;
    const rename = (current) => {
      const base = current || '';
      if (!find) return replace;
      return base.split(find).join(replace);
    };
    if (selectedDraftIds.size) {
      const nextDrafts = drafts.map(d => selectedDraftIds.has(d.id)
        ? { ...d, name: rename(d.name) || d.name }
        : d);
      setDrafts(nextDrafts);
      saveDrafts(nextDrafts);
    }
    if (selectedIconIds.size) {
      const nextIcons = iconDrafts.map(ic => selectedIconIds.has(ic.id)
        ? { ...ic, label: rename(ic.label) }
        : ic);
      saveIconDrafts(nextIcons);
    }
    setBulkFind('');
    setBulkReplace('');
    showToast(`Renamed ${selectionTotal} item${selectionTotal === 1 ? '' : 's'}`);
  };
  // Bulk level — only applies to selected drafts (zones + subzones).
  // Icons have no level. Empty string clears the level (sets undefined).
  const applyBulkLevel = () => {
    if (!selectedDraftIds.size) return;
    const lvl = parseLevel(bulkLevel);
    const nextDrafts = drafts.map(d => selectedDraftIds.has(d.id)
      ? { ...d, level: lvl ?? undefined }
      : d);
    setDrafts(nextDrafts);
    saveDrafts(nextDrafts);
    showToast(`Set level ${lvl == null ? '—' : `L${lvl}`} on ${selectedDraftIds.size} draft${selectedDraftIds.size === 1 ? '' : 's'}`);
  };
  // Bulk floor — icons have an explicit .floor field; zones derive floor
  // from overlays so this doesn't apply there. Empty string = "All" (null)
  // for icons (show on every floor).
  const applyBulkFloor = () => {
    if (!selectedIconIds.size) return;
    const raw = String(bulkFloor).trim();
    const fl = raw === '' ? null : (Number.isFinite(+raw) ? Math.round(+raw) : null);
    const nextIcons = iconDrafts.map(ic => selectedIconIds.has(ic.id)
      ? { ...ic, floor: fl }
      : ic);
    saveIconDrafts(nextIcons);
    showToast(`Set floor ${fl == null ? 'All' : fl} on ${selectedIconIds.size} icon${selectedIconIds.size === 1 ? '' : 's'}`);
  };

  // Measure the map card's header so the floor picker sits the same visual
  // gap below it as it does from the card's left edge.
  useEffect(() => {
    const el = cardHeaderRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(entries => {
      for (const entry of entries) {
        const h = entry.contentRect.height;
        if (h > 0) setHeaderHeight(h);
      }
    });
    ro.observe(el);
    // Initial measurement (RO fires asynchronously)
    const rect = el.getBoundingClientRect();
    if (rect.height > 0) setHeaderHeight(rect.height);
    return () => ro.disconnect();
  }, [mapReady]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    document.body.classList.add('map-tab-active');
    return () => {
      document.body.style.overflow = '';
      document.body.classList.remove('map-tab-active');
    };
  }, []);

  useEffect(() => {
    let map = null;
    let cancelled = false;

    import('leaflet').then(({ default: L }) => {
      if (cancelled || !containerRef.current) return;
      leafletRef.current = L;

      setStatus('Initializing...');

      const container = containerRef.current;
      const minZoom = Math.max(0, Math.ceil(Math.log2(
        Math.max(container.clientWidth / MAP_W, container.clientHeight / MAP_H)
      ) + NATIVE_ZOOM));

      map = L.map(container, {
        crs: L.CRS.Simple,
        minZoom,
        maxZoom: MAX_ZOOM,
        maxBoundsViscosity: 1.0,
        zoomSnap: 0.5,
        zoomDelta: 0.5,
        attributionControl: false,
        zoomControl: false,
        zoomAnimation: false,
      });

      const southWest = map.unproject([0, MAP_H], NATIVE_ZOOM);
      const northEast = map.unproject([MAP_W, 0], NATIVE_ZOOM);
      const bounds = L.latLngBounds(southWest, northEast);

      const cardInner = container.parentElement;
      const headerH = cardInner?.querySelector('.kuro-header')?.offsetHeight || 48;
      const footerH = cardInner?.querySelectorAll('.kuro-header')[1]?.offsetHeight || 48;

      const scale = Math.pow(2, NATIVE_ZOOM - minZoom);
      const pxToLat = (px) => map.unproject([0, 0], NATIVE_ZOOM).lat - map.unproject([0, px], NATIVE_ZOOM).lat;
      const topPad = pxToLat(headerH) * scale;
      const bottomPad = pxToLat(footerH) * scale;
      // Extra breathing room on all four sides so edges aren't tight when
      // authoring zones near the perimeter. Several placed zones/overlays
      // (Huanglong reaches x=-3546, well west of the base canvas's own x=0
      // edge) extend past the base MAP_W x MAP_H canvas entirely - 300px
      // wasn't enough slack for that, effectively fencing off part of
      // Mengzhou (nested inside Huanglong) behind maxBounds and, since
      // Leaflet won't zoom out past the point where maxBounds already fills
      // the viewport, capping how far out you could zoom at all.
      const EDGE_PAD_PX = 4000;
      const edgePad = pxToLat(EDGE_PAD_PX) * scale;
      const paddedBounds = L.latLngBounds(
        [southWest.lat - bottomPad - edgePad, southWest.lng - edgePad],
        [northEast.lat + topPad + edgePad, northEast.lng + edgePad]
      );

      map.setMaxBounds(paddedBounds);
      map.fitBounds(bounds, { paddingTopLeft: [0, headerH], paddingBottomRight: [0, footerH] });

      // Default opening view: the last position the user left the map at
      // (persisted below on every pan/zoom), falling back to Huanglong >
      // Jinzhou on a genuinely first open — direct user request. Overrides
      // the whole-map fitBounds() above rather than replacing it, so the
      // maxBounds/minZoom math (which needs the whole-map fit to compute
      // correctly) stays untouched.
      let appliedSavedView = false;
      try {
        const raw = localStorage.getItem(MAP_LAST_VIEW_KEY);
        if (raw) {
          const saved = JSON.parse(raw);
          if (Number.isFinite(saved?.x) && Number.isFinite(saved?.y) && Number.isFinite(saved?.zoom)) {
            map.setView(map.unproject([saved.x, saved.y], NATIVE_ZOOM), saved.zoom, { animate: false });
            appliedSavedView = true;
          }
        }
      } catch {}
      if (!appliedSavedView) {
        const jinzhou = drafts.find(z => z.id === 'new-zone-2')
          || drafts.find(z => z.parentId === 'huanglong' && z.name === 'Jinzhou');
        if (jinzhou && Array.isArray(jinzhou.polygon) && jinzhou.polygon.length > 1) {
          let jMinX = Infinity, jMinY = Infinity, jMaxX = -Infinity, jMaxY = -Infinity;
          jinzhou.polygon.forEach(([x, y]) => {
            if (x < jMinX) jMinX = x; if (y < jMinY) jMinY = y;
            if (x > jMaxX) jMaxX = x; if (y > jMaxY) jMaxY = y;
          });
          const jNw = map.unproject([jMinX, jMinY], NATIVE_ZOOM);
          const jSe = map.unproject([jMaxX, jMaxY], NATIVE_ZOOM);
          map.fitBounds(L.latLngBounds(jNw, jSe), { padding: [40, 40], animate: false });
        }
      }

      const tileLayer = L.tileLayer(BASE + 'map-tiles/Solaris_3/{z}/{y}/{x}.webp', {
        minZoom,
        maxZoom: MAX_ZOOM,
        maxNativeZoom: 6,
        tileSize: TILE_SIZE,
        noWrap: true,
        bounds,
        errorTileUrl: BASE + 'map-tiles/blank.png',
      }).addTo(map);
      tileLayerRef.current = tileLayer;

      setTimeout(() => { if (map) map.invalidateSize(); }, 200);

      mapRef.current = map;
      setStatus(null);
      setMapReady(true);
    }).catch(err => {
      if (!cancelled) setStatus('Error: ' + err.message);
    });

    return () => {
      cancelled = true;
      if (map) { map.remove(); map = null; }
      mapRef.current = null;
      leafletRef.current = null;
      setMapReady(false);
    };
  }, []);

  // Editing modes convert raw pointer positions through Leaflet's own
  // (rotation-unaware) map.project/e.latlng math, so a non-zero CSS rotation
  // would place zone points / painted strokes in the wrong spot. Snap back
  // to 0° the moment any of them turns on.
  const editingModeActive = authorMode || freehandMode || paintMode;
  useEffect(() => {
    if (editingModeActive && rotationRef.current !== 0) {
      rotationRef.current = 0;
      setRotation(0);
    }
  }, [editingModeActive]);

  // Apply the rotation (+ any live pinch-zoom preview scale) to the Leaflet
  // container via CSS transform only — Leaflet's internal pixel/lat-lng
  // math never sees this.
  useEffect(() => {
    applyMapTransform();
  }, [rotation]);

  // The container is deliberately oversized (see its inline style below) so
  // a rotated square still fully covers the axis-aligned viewport instead of
  // exposing the card background at its corners. Tell Leaflet its size
  // changed (same zoom/center, just a bigger canvas to tile into) whenever
  // that sizing toggles.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) return;
    const id = requestAnimationFrame(() => map.invalidateSize({ animate: false, pan: false }));
    return () => cancelAnimationFrame(id);
  }, [mapReady, editingModeActive]);

  // Persist the current position (center + zoom) on every pan/zoom, debounced,
  // so the map reopens where the user left it — direct user request. Stored as
  // native-zoom pixel coords (via map.project) rather than raw lat/lng, same
  // convention as every zone/icon coordinate elsewhere in this file.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) return;
    let saveTimer = null;
    const saveView = () => {
      clearTimeout(saveTimer);
      saveTimer = setTimeout(() => {
        try {
          const c = map.project(map.getCenter(), NATIVE_ZOOM);
          localStorage.setItem(MAP_LAST_VIEW_KEY, JSON.stringify({ x: c.x, y: c.y, zoom: map.getZoom() }));
        } catch {}
      }, 500);
    };
    map.on('moveend', saveView);
    map.on('zoomend', saveView);
    return () => {
      clearTimeout(saveTimer);
      map.off('moveend', saveView);
      map.off('zoomend', saveView);
    };
  }, [mapReady]);

  // Two-finger twist-to-rotate (combined with its own pinch-zoom) +
  // rotation-corrected one-finger pan. Only active outside the editing
  // modes above. Leaflet's native dragging is rotation-unaware, so it's
  // only suspended (in favor of the corrected pan below) for the duration
  // of a drag that starts while rotated — leaving both handlers live at
  // once double-pans the view, which is what made panning look
  // direction-inverted while rotated. At rotation 0, native dragging (with
  // its inertia) is left alone. Native touchZoom is replaced outright for
  // every 2-finger gesture (not just while actually rotated) because a
  // rotate gesture and a pinch gesture are the same two fingers — without
  // its own zoom handling here, the twist handler would swallow every
  // pinch, which is why zoom got "stuck" once you'd rotated at all.
  useEffect(() => {
    const map = mapRef.current;
    const container = containerRef.current;
    if (!map || !container || !mapReady) return;
    if (editingModeActive) return;

    // Without this, the browser can claim a 2-finger gesture for its own
    // native pinch-zoom-the-page handling at touchstart time (touch-action
    // is decided before touchmove ever reaches JS), which is what made
    // twisting and pinching together feel broken — preventDefault() in
    // onTouchMove alone isn't early enough to stop it.
    const prevTouchAction = container.style.touchAction;
    container.style.touchAction = 'none';

    const touchAngle = (t0, t1) => Math.atan2(t1.clientY - t0.clientY, t1.clientX - t0.clientX) * 180 / Math.PI;
    const touchDist = (t0, t1) => Math.hypot(t1.clientX - t0.clientX, t1.clientY - t0.clientY);
    const rotateVector = (dx, dy, deg) => {
      const rad = -deg * Math.PI / 180;
      return {
        x: dx * Math.cos(rad) - dy * Math.sin(rad),
        y: dx * Math.sin(rad) + dy * Math.cos(rad),
      };
    };

    let draggingSuspended = false;
    const suspendDragging = () => {
      if (rotationRef.current !== 0 && map.dragging?.enabled()) {
        map.dragging.disable();
        draggingSuspended = true;
      }
    };
    const resumeDragging = () => {
      if (draggingSuspended) {
        map.dragging?.enable();
        draggingSuspended = false;
      }
    };

    const onTouchStart = (e) => {
      if (e.touches.length === 2) {
        panTouchRef.current = null;
        // Native touchZoom doesn't know about the rotated view either (it
        // zooms around a screen point it converts via Leaflet's own,
        // rotation-unaware, containerPointToLatLng), so it's replaced here
        // by our own pinch-zoom (around the map's current center) combined
        // with the twist-to-rotate, instead of just disabling zoom outright.
        if (map.touchZoom?.enabled()) map.touchZoom.disable();
        rotateTouchRef.current = {
          angle: touchAngle(e.touches[0], e.touches[1]),
          rotation: rotationRef.current,
          dist: touchDist(e.touches[0], e.touches[1]),
          zoom: map.getZoom(),
        };
      } else if (e.touches.length === 1) {
        rotateTouchRef.current = null;
        suspendDragging();
        panTouchRef.current = draggingSuspended ? { x: e.touches[0].clientX, y: e.touches[0].clientY } : null;
      }
    };
    const onTouchMove = (e) => {
      if (e.touches.length === 2 && rotateTouchRef.current) {
        e.preventDefault();
        const delta = touchAngle(e.touches[0], e.touches[1]) - rotateTouchRef.current.angle;
        let next = (rotateTouchRef.current.rotation + delta) % 360;
        if (next < 0) next += 360;
        rotationRef.current = next;
        setRotation(next);

        // Preview-only: a CSS scale, not a real map.setZoom(), so the pinch
        // feels continuous instead of snapping to zoomSnap every frame (and
        // isn't heavy enough to drop touch events mid-gesture).
        const dist = touchDist(e.touches[0], e.touches[1]);
        if (dist > 0 && rotateTouchRef.current.dist > 0) {
          pinchScaleRef.current = dist / rotateTouchRef.current.dist;
          applyMapTransform();
        }
      } else if (e.touches.length === 1 && panTouchRef.current) {
        e.preventDefault();
        const dx = e.touches[0].clientX - panTouchRef.current.x;
        const dy = e.touches[0].clientY - panTouchRef.current.y;
        panTouchRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        const corrected = rotateVector(dx, dy, rotationRef.current);
        map.panBy([-corrected.x, -corrected.y], { animate: false });
      }
    };
    const commitPinchZoom = () => {
      const start = rotateTouchRef.current;
      const scale = pinchScaleRef.current;
      if (start && start.dist > 0 && scale !== 1) {
        const targetZoom = start.zoom + Math.log2(scale);
        const clamped = Math.min(map.getMaxZoom(), Math.max(map.getMinZoom(), targetZoom));
        map.setZoom(clamped, { animate: false });
      }
      pinchScaleRef.current = 1;
      applyMapTransform();
    };
    const onTouchEnd = (e) => {
      if (e.touches.length < 2) {
        commitPinchZoom();
        rotateTouchRef.current = null;
      }
      if (e.touches.length < 1) {
        panTouchRef.current = null;
        resumeDragging();
      }
      if (e.touches.length === 0 && map.touchZoom && !map.touchZoom.enabled()) map.touchZoom.enable();
    };

    container.addEventListener('touchstart', onTouchStart, { passive: true });
    container.addEventListener('touchmove', onTouchMove, { passive: false });
    container.addEventListener('touchend', onTouchEnd, { passive: true });
    container.addEventListener('touchcancel', onTouchEnd, { passive: true });
    return () => {
      container.removeEventListener('touchstart', onTouchStart);
      container.removeEventListener('touchmove', onTouchMove);
      container.removeEventListener('touchend', onTouchEnd);
      container.removeEventListener('touchcancel', onTouchEnd);
      if (map.touchZoom && !map.touchZoom.enabled()) map.touchZoom.enable();
      resumeDragging();
      container.style.touchAction = prevTouchAction;
    };
  }, [mapReady, editingModeActive]);

  // Author mode: attach click handler. Map drag stays enabled (one-finger pan).
  // Leaflet distinguishes click (tap) from drag automatically.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) return;
    if (!authorMode) return;
    if (freehandMode) return;
    if (paintMode) return;
    if (!pointMode) return;
    if (map.doubleClickZoom) map.doubleClickZoom.disable();
    const handler = (e) => {
      if (gestureActiveRef.current) return;
      // Icon-place mode preempts zone-point adds — the user is placing
      // an icon, not drawing a polygon.
      if (placingIconIdRef.current) return;
      map.closePopup();
      const pt = map.project(e.latlng, NATIVE_ZOOM);
      setAuthorPoints(prev => [...prev, [Math.round(pt.x), Math.round(pt.y)]]);
    };
    map.on('click', handler);
    return () => {
      map.off('click', handler);
      if (map.doubleClickZoom) map.doubleClickZoom.enable();
    };
  }, [authorMode, freehandMode, paintMode, pointMode, mapReady]);

  // Freehand draw mode: hold + drag on the map to trace a shape; on release
  // the traced path is simplified (RDP) into polygon points that replace
  // authorPoints. Map dragging/zoom is suspended while this mode is active.
  useEffect(() => {
    const map = mapRef.current;
    const L = leafletRef.current;
    if (!map || !L || !mapReady || !authorMode || !freehandMode) return;
    const container = map.getContainer();
    const origCursor = container.style.cursor;
    const origTouchAction = container.style.touchAction;
    container.style.cursor = 'crosshair';
    container.style.touchAction = 'none';
    map.dragging?.disable();
    map.touchZoom?.disable();
    map.doubleClickZoom?.disable();
    map.scrollWheelZoom?.disable();
    map.boxZoom?.disable();

    let drawing = false;
    let pid = null;
    let rawPts = [];

    const ensureTrace = () => {
      if (!freehandTraceRef.current) {
        const line = L.polyline([], {
          color: COLOR_ACTIVE, weight: 2, opacity: 0.95,
          dashArray: '4 3', interactive: false, className: 'zone-freehand-trace',
        });
        line.addTo(map);
        freehandTraceRef.current = line;
      }
      return freehandTraceRef.current;
    };
    const updateTrace = () => {
      const line = freehandTraceRef.current;
      if (!line) return;
      line.setLatLngs(rawPts.map(([cx, cy]) => map.containerPointToLatLng([cx, cy])));
    };
    const removeTrace = () => {
      if (freehandTraceRef.current) {
        try { map.removeLayer(freehandTraceRef.current); } catch {}
        freehandTraceRef.current = null;
      }
    };

    const getXY = (e) => {
      const rect = container.getBoundingClientRect();
      return [e.clientX - rect.left, e.clientY - rect.top];
    };

    const onDown = (e) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      drawing = true;
      pid = e.pointerId;
      rawPts = [getXY(e)];
      ensureTrace();
      try { container.setPointerCapture(e.pointerId); } catch {}
      e.preventDefault();
    };
    const onMove = (e) => {
      if (!drawing || e.pointerId !== pid) return;
      const [x, y] = getXY(e);
      const last = rawPts[rawPts.length - 1];
      const dx = x - last[0], dy = y - last[1];
      if (dx * dx + dy * dy < 4) return; // 2px min spacing
      rawPts.push([x, y]);
      updateTrace();
      e.preventDefault();
    };
    const finish = (e) => {
      if (!drawing) return;
      drawing = false;
      try { container.releasePointerCapture(e.pointerId); } catch {}
      removeTrace();
      const pts = rawPts;
      rawPts = [];
      if (pts.length < 3) return;
      const simplified = rdpSimplify(pts, 6);
      const mapped = simplified.map(([cx, cy]) => {
        const ll = map.containerPointToLatLng([cx, cy]);
        const nat = map.project(ll, NATIVE_ZOOM);
        return clampToBounds(Math.round(nat.x), Math.round(nat.y), placementBounds);
      });
      setAuthorPoints(mapped);
    };

    container.addEventListener('pointerdown', onDown);
    container.addEventListener('pointermove', onMove);
    container.addEventListener('pointerup', finish);
    container.addEventListener('pointercancel', finish);

    return () => {
      container.removeEventListener('pointerdown', onDown);
      container.removeEventListener('pointermove', onMove);
      container.removeEventListener('pointerup', finish);
      container.removeEventListener('pointercancel', finish);
      container.style.cursor = origCursor;
      container.style.touchAction = origTouchAction;
      map.dragging?.enable();
      map.touchZoom?.enable();
      map.doubleClickZoom?.enable();
      map.scrollWheelZoom?.enable();
      map.boxZoom?.enable();
      removeTrace();
    };
  }, [mapReady, authorMode, freehandMode, placementBounds]);

  // Render live in-progress polygon with draggable points + midpoint inserters
  useEffect(() => {
    const map = mapRef.current;
    const L = leafletRef.current;
    if (!map || !L || !mapReady) return;
    if (activeLayerRef.current) {
      map.removeLayer(activeLayerRef.current);
      activeLayerRef.current = null;
    }
    if (!authorMode || authorPoints.length === 0) return;
    // Dedicated pane, appended as a sibling of Leaflet's own .leaflet-map-pane
    // (map.getContainer(), not the default _mapPane) rather than inside it.
    // Leaflet's generic ".leaflet-pane" CSS rule gives .leaflet-map-pane
    // itself z-index 400 - every pane created the normal way (the default
    // markerPane included, z-index 600) lives INSIDE that element, so its
    // z-index only wins against its OTHER children, never against a sibling
    // of .leaflet-map-pane itself. The sub-map overlay canvas (z-index 400)
    // and paint canvas (450) are exactly such siblings (plain <canvas>
    // elements appended directly into the map container), so they always
    // painted over every Leaflet-pane-hosted layer regardless of that
    // layer's own z-index - invisible wherever a sub-map overlay (Mengzhou,
    // Lahai-Roi, ...) actually painted opaque pixels there, while working
    // fine over the base Solaris map (nothing opaque on the overlay canvas
    // to sit on top there). createPane is idempotent - safe to call on
    // every render. Markers reposition correctly on pan/zoom regardless of
    // which pane hosts them (each Leaflet Marker recalculates its own pixel
    // position from the map's current view on every relevant map event,
    // rather than relying on inheriting a transform from its pane parent).
    if (!map.getPane('zoneAuthorPane')) {
      map.createPane('zoneAuthorPane', map.getContainer());
      map.getPane('zoneAuthorPane').style.zIndex = 1000;
    }
    const group = L.layerGroup();
    const latLngs = authorPoints.map(([x, y]) => map.unproject([x, y], NATIVE_ZOOM));

    // Outline
    if (latLngs.length >= 3) {
      L.polygon(latLngs, {
        color: COLOR_ACTIVE, weight: 1.5, fillColor: COLOR_ACTIVE, fillOpacity: 0.12,
        dashArray: '4 3', className: 'zone-author-poly', interactive: false, pane: 'zoneAuthorPane',
      }).addTo(group);
    } else if (latLngs.length >= 2) {
      L.polyline(latLngs, {
        color: COLOR_ACTIVE, weight: 1.5, dashArray: '4 3', className: 'zone-author-poly', interactive: false, pane: 'zoneAuthorPane',
      }).addTo(group);
    }

    // Draggable numbered vertex markers (drag → move, tap → delete)
    latLngs.forEach((ll, i) => {
      const icon = L.divIcon({
        className: 'zone-author-point-icon',
        html: `<span class="zone-author-point"><span class="zone-author-point-num">${i + 1}</span></span>`,
        iconSize: [22, 22],
        iconAnchor: [11, 11],
      });
      const marker = L.marker(ll, { draggable: true, icon, autoPan: false, keyboard: false, pane: 'zoneAuthorPane' });
      marker.on('dragend', (e) => {
        const np = map.project(e.target.getLatLng(), NATIVE_ZOOM);
        const clamped = clampToBounds(Math.round(np.x), Math.round(np.y), placementBounds);
        setAuthorPoints(prev => prev.map((p, idx) => idx === i ? clamped : p));
      });
      marker.on('click', (ev) => {
        L.DomEvent.stopPropagation(ev);
        setAuthorPoints(prev => prev.filter((_, idx) => idx !== i));
      });
      marker.addTo(group);
    });

    // Midpoint "+" inserters — one per edge (including closing edge when polygon)
    if (authorPoints.length >= 2) {
      const edgeCount = authorPoints.length >= 3 ? authorPoints.length : 1;
      for (let i = 0; i < edgeCount; i++) {
        const a = authorPoints[i];
        const b = authorPoints[(i + 1) % authorPoints.length];
        const midPx = [Math.round((a[0] + b[0]) / 2), Math.round((a[1] + b[1]) / 2)];
        const midLL = map.unproject(midPx, NATIVE_ZOOM);
        const ghostIcon = L.divIcon({
          className: 'zone-author-ghost-icon',
          html: '<span class="zone-author-ghost">+</span>',
          iconSize: [16, 16],
          iconAnchor: [8, 8],
        });
        const insertAt = i + 1;
        const ghost = L.marker(midLL, { icon: ghostIcon, keyboard: false, pane: 'zoneAuthorPane' });
        ghost.on('click', (ev) => {
          L.DomEvent.stopPropagation(ev);
          setAuthorPoints(prev => {
            const next = [...prev];
            next.splice(insertAt, 0, midPx);
            return next;
          });
        });
        ghost.addTo(group);
      }
    }

    group.addTo(map);
    activeLayerRef.current = group;
  }, [authorMode, authorPoints, mapReady, placementBounds]);

  // Render saved session drafts (cyan) — only in author mode
  useEffect(() => {
    const map = mapRef.current;
    const L = leafletRef.current;
    if (!map || !L || !mapReady) return;
    if (!authorMode) {
      if (draftsLayerRef.current) { map.removeLayer(draftsLayerRef.current); draftsLayerRef.current = null; }
      return;
    }
    if (draftsLayerRef.current) {
      map.removeLayer(draftsLayerRef.current);
      draftsLayerRef.current = null;
    }
    const visible = drafts.filter(d => d.id !== editingId);
    if (visible.length === 0) return;
    // Same fix as the in-progress authorPoints pane below: a sibling of
    // .leaflet-map-pane, not nested inside it, so saved zone outlines don't
    // vanish under a placed sub-map overlay's canvas either (that canvas is
    // itself a sibling with an explicit z-index, which always wins against
    // anything living inside .leaflet-map-pane regardless of that thing's
    // own z-index - see the other pane's comment for the full explanation).
    if (!map.getPane('zoneAuthorPane')) {
      map.createPane('zoneAuthorPane', map.getContainer());
      map.getPane('zoneAuthorPane').style.zIndex = 1000;
    }
    const group = L.layerGroup();
    const sorted = [...visible].sort((a, b) => (a.parentId ? 1 : 0) - (b.parentId ? 1 : 0));
    sorted.forEach(z => {
      if (!Array.isArray(z.polygon) || z.polygon.length < 3) return;
      const isSub = !!z.parentId;
      const latLngs = z.polygon.map(([x, y]) => map.unproject([x, y], NATIVE_ZOOM));
      const poly = L.polygon(latLngs, {
        color: COLOR_DRAFT,
        weight: isSub ? 1 : 1.5,
        opacity: 0.85,
        fillColor: COLOR_DRAFT,
        fillOpacity: isSub ? 0.08 : 0.12,
        dashArray: '6 4',
        className: 'zone-polygon zone-draft',
        pane: 'zoneAuthorPane',
        // zoneAuthorPane sits at z-index 1000, above the paint canvas
        // (450) - left interactive while paintMode is on, this polygon's
        // own hit-testing swallowed the pointerdown that starts a paint
        // stroke, forcing the user to start every stroke from outside the
        // zone's fill and drag in. Locking it non-interactive during paint
        // lets strokes start anywhere, including directly over a zone.
        interactive: !paintMode,
      }).addTo(group);
      const parentName = isSub
        ? (MAP_ZONES.find(p => p.id === z.parentId)?.name
           || drafts.find(p => p.id === z.parentId)?.name
           || z.parentId)
        : null;
      const title = parentName ? `${parentName} › ${z.name || z.id}` : (z.name || z.id);
      if (!paintMode) {
        poly.bindTooltip(`[draft] ${title}`, { sticky: true, className: 'zone-tooltip zone-tooltip-draft' });
      }
    });
    group.addTo(map);
    draftsLayerRef.current = group;
  }, [drafts, editingId, mapReady, authorMode, paintMode]);

  // "Zone" icon filter — Names/Area layers for L3 zones (direct user
  // request). Area: same technique as the author-mode zone-drafts polygon
  // above, but gold/outline-only/no-fill, rounder joints, and a soft blur
  // for a "vague-ish" look rather than author mode's crisp dashed line —
  // this is a player-facing reference layer, not an editing aid. Names: a
  // divIcon label centered at each zone's true polygon centroid (computed
  // in l3Zones above). Both are independently toggleable via the same
  // iconFiltersOff Set every icon category already uses ('Zone',
  // 'Zone/Area', 'Zone/Names' keys), so they share the exact show/hide/
  // persistence mechanics without any new state plumbing.
  const zoneAreaLayerRef = useRef(null);
  useEffect(() => {
    const map = mapRef.current;
    const L = leafletRef.current;
    if (!map || !L || !mapReady) return;
    if (zoneAreaLayerRef.current) {
      map.removeLayer(zoneAreaLayerRef.current);
      zoneAreaLayerRef.current = null;
    }
    const areaOn = !iconFiltersOff.has('Zone') && !iconFiltersOff.has('Zone/Area');
    if (!areaOn || l3Zones.length === 0) return;
    if (!map.getPane('zoneAreaPane')) {
      map.createPane('zoneAreaPane', map.getContainer());
      // Above the sub-map overlay canvas (400) so an L3 zone nested inside a
      // placed overlay (e.g. Mengzhou's Xuanfang Hold) still shows its
      // outline instead of it being painted over by that raster; below the
      // paint canvas (450) so paint mode is unaffected.
      map.getPane('zoneAreaPane').style.zIndex = 420;
      map.getPane('zoneAreaPane').style.pointerEvents = 'none';
    }
    const group = L.layerGroup();
    // Floor-gated the same way placed icons already are: a zone whose
    // resolved floor (via resolveZoneFloor — walks up to the nearest
    // overlay-linked ancestor) is null shows on every floor; a zone
    // resolved to a specific sub-map's floor only shows while viewFloor
    // matches it. Without this, an L3 zone nested inside a placed overlay
    // (e.g. Mengzhou's Xuanfang Hold) rendered on every floor regardless —
    // direct user report of zone outlines/labels appearing to "move" was
    // really this: the same fixed-position outline sitting there whichever
    // floor/sub-map you'd actually navigated to, no longer matching what
    // was really at that spot on the floor you were looking at.
    l3Zones
      .filter(z => { const f = resolveZoneFloor(z); return f == null || f === viewFloor; })
      .forEach(z => {
        const latLngs = roundPolygonCorners(z.polygon).map(([x, y]) => map.unproject([x, y], NATIVE_ZOOM));
        L.polygon(latLngs, {
          color: COLOR_CANON,
          weight: 2,
          opacity: 0.7,
          fill: false,
          lineJoin: 'round',
          lineCap: 'round',
          className: `zone-area-outline ${pulseZoneId === z.id ? 'zone-area-pulse' : ''}`,
          pane: 'zoneAreaPane',
          interactive: false,
        }).addTo(group);
      });
    group.addTo(map);
    zoneAreaLayerRef.current = group;
  }, [l3Zones, mapReady, iconFiltersOff, pulseZoneId, viewFloor, resolveZoneFloor]);

  const zoneNamesLayerRef = useRef(null);
  useEffect(() => {
    const map = mapRef.current;
    const L = leafletRef.current;
    if (!map || !L || !mapReady) return;
    if (zoneNamesLayerRef.current) {
      map.removeLayer(zoneNamesLayerRef.current);
      zoneNamesLayerRef.current = null;
    }
    const namesOn = !iconFiltersOff.has('Zone') && !iconFiltersOff.has('Zone/Names');
    if (!namesOn || l3Zones.length === 0) return;
    const group = L.layerGroup();
    l3Zones
      .filter(z => { const f = resolveZoneFloor(z); return f == null || f === viewFloor; })
      .forEach(z => {
        const center = map.unproject(z.centroid, NATIVE_ZOOM);
        L.marker(center, {
          icon: L.divIcon({
            className: 'zone-name-label-wrap',
            html: `<span class="zone-name-label">${(z.name || z.id).replace(/</g, '&lt;')}</span>`,
            // Explicit 0,0 anchor (rather than relying on Leaflet's own
            // null-iconSize fallback) — the label's own -50%/-50% CSS
            // transform does the actual centering on the point.
            iconSize: null,
            iconAnchor: [0, 0],
          }),
          interactive: false,
          keyboard: false,
        }).addTo(group);
      });
    group.addTo(map);
    zoneNamesLayerRef.current = group;
  }, [l3Zones, mapReady, iconFiltersOff, viewFloor, resolveZoneFloor]);

  // Sub-map overlay renderer — one shared <canvas>, sized to the map viewport.
  // For each visible placement we iterate the subset of the overlay's native
  // 256-px PNG tile grid that intersects the viewport, fetch any missing
  // tiles on demand (browser HTTP-caches), and draw loaded tiles via
  // ctx.drawImage with the same translate/rotate/scale the editor has always
  // used. Keeps the full transform pipeline intact (rotation/scale/drag stay
  // live) while avoiding the 18 MB-per-overlay single-image decode.
  //
  // Tile cache is module-scoped (OVERLAY_TILE_CACHE) so it survives tab
  // switches — re-opening the Map tab paints already-decoded tiles without
  // re-fetching. Re-insertion is used to implement LRU; the oldest tile is
  // dropped when we exceed OVERLAY_TILE_CACHE_LIMIT. Browser HTTP cache (and
  // the offline service worker, where installed) cover persistence across
  // reloads.
  const OVERLAY_TILE_PX = 256;
  const OVERLAY_TILE_MARGIN = 1;        // prefetch 1 tile beyond viewport

  useEffect(() => {
    if (!mapReady) return;
    const map = mapRef.current;
    if (!map) return;
    const container = map.getContainer();

    let canvas = overlayCanvasRef.current;
    if (!canvas) {
      canvas = document.createElement('canvas');
      canvas.style.cssText = 'position:absolute;top:0;left:0;pointer-events:none;z-index:400;';
      container.appendChild(canvas);
      overlayCanvasRef.current = canvas;
    }

    const tileCache = OVERLAY_TILE_CACHE;

    // `z` is only meaningful for pyramid overlays (cat.pyramid) - undefined
    // for every flat single-level overlay, so the cache key/URL below stay
    // byte-identical to before for all of them.
    const getTile = (cat, ty, tx, z) => {
      const key = z == null ? `${cat.id}:${ty}:${tx}` : `${cat.id}:${z}:${ty}:${tx}`;
      const hit = tileCache.get(key);
      if (hit) {
        // Bump to most-recent by re-inserting.
        tileCache.delete(key);
        tileCache.set(key, hit);
        return hit;
      }
      const img = new Image();
      img.decoding = 'async';
      // Derive tile URL from the catalog's imageUrl: replace the filename
      // with lossless/{y}/{x}.png (or lossless/{z}/{y}/{x}.png for a
      // pyramid overlay) and URL-encode each segment defensively.
      const dir = cat.imageUrl.replace(/\/[^/]+$/, '');
      const segs = dir.split('/').map(encodeURIComponent).join('/');
      const tilePath = z == null ? `/lossless/${ty}/${tx}.png` : `/lossless/${z}/${ty}/${tx}.png`;
      const url = (BASE + segs + tilePath).replace(/([^:])\/\//g, '$1/');
      img.src = url;
      // A failed fetch (transient CDN 503/timeout - more likely right after
      // a bulk tile-cache invalidation) just dropped the tile from cache
      // with nothing to pick it back up: draw() only calls getTile() again
      // on the next 'move zoom viewreset zoomend resize' event, so a tile
      // that errored during an otherwise-static view stayed blank until the
      // user manually panned/zoomed. Retry with backoff instead, and
      // request a redraw once retried so getTile() re-fetches it on its own.
      // Attempt count lives in OVERLAY_TILE_RETRY_COUNTS, not on the image
      // itself - this Image() gets discarded and a fresh one created on
      // every retry (tileCache.delete below), which would otherwise reset
      // any counter stored on it back to zero each time.
      const retryTile = () => {
        clearTimeout(stallTimer);
        tileCache.delete(key);
        const attempt = (OVERLAY_TILE_RETRY_COUNTS.get(key) || 0) + 1;
        if (attempt > 4) { OVERLAY_TILE_RETRY_COUNTS.delete(key); return; }
        OVERLAY_TILE_RETRY_COUNTS.set(key, attempt);
        const delay = 400 * Math.pow(2, attempt - 1) + Math.random() * 200;
        setTimeout(() => { overlayRedrawRef.current(); }, delay);
      };
      img.onload = () => { clearTimeout(stallTimer); OVERLAY_TILE_RETRY_COUNTS.delete(key); overlayRedrawRef.current(); };
      img.onerror = retryTile;
      // A stalled request (slow/flaky connection) fires neither onload nor
      // onerror - the browser just keeps waiting - so without an explicit
      // deadline the tile sat in tileCache as a permanently-pending Image()
      // forever, and every later getTile() call for the same key returned
      // that same stuck cache hit instead of starting a fresh fetch. 10s is
      // generous for a 256px tile on any connection that will complete at
      // all; on one that won't, retrying (and eventually giving up per-tile
      // rather than hanging indefinitely) is strictly better than never
      // recovering without a manual pan/zoom.
      const stallTimer = setTimeout(retryTile, 10000);
      tileCache.set(key, img);
      // Evict oldest when over cap.
      while (tileCache.size > OVERLAY_TILE_CACHE_LIMIT) {
        const firstKey = tileCache.keys().next().value;
        if (firstKey === key) break;
        tileCache.delete(firstKey);
      }
      return img;
    };

    const syncSize = () => {
      const dpr = window.devicePixelRatio || 1;
      const cw = container.clientWidth;
      const ch = container.clientHeight;
      const wantW = Math.round(cw * dpr), wantH = Math.round(ch * dpr);
      if (canvas.width !== wantW || canvas.height !== wantH) {
        canvas.width = wantW;
        canvas.height = wantH;
        canvas.style.width = cw + 'px';
        canvas.style.height = ch + 'px';
      }
      return { dpr, cw, ch };
    };

    const draw = () => {
      const { dpr, cw, ch } = syncSize();
      const ctx = canvas.getContext('2d');
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, cw, ch);

      // Dark mask behind the sub-maps — flat 75% whenever the view is off
      // floor 0, regardless of distance. Painted first so overlays sit on
      // top and render at full clarity; base tiles below show through at
      // 25% opacity.
      if (viewFloor !== 0) {
        ctx.save();
        ctx.globalAlpha = 0.75;
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, cw, ch);
        ctx.restore();
      }

      const currentVisible = overlayDrafts.filter(ov => (ov.floor ?? 0) === viewFloor);
      const live = overlayLiveRef.current;
      currentVisible.forEach(rawOv => {
        const ov = (live && live.id === rawOv.id) ? { ...rawOv, ...live } : rawOv;
        const cat = OVERLAY_CATALOG.find(c => c.id === ov.catalogId);
        if (!cat) return;

        const s = ov.scale ?? 1;
        const rotRad = ((ov.rotation || 0) * Math.PI) / 180;
        const zoomFactor = Math.pow(2, map.getZoom() - NATIVE_ZOOM);
        const displayScale = s * zoomFactor;
        const nw = cat.naturalWidth;
        const nh = cat.naturalHeight;

        // Pyramid overlays (cat.pyramid — currently only Mengzhou, see that
        // catalog entry's own comment) pick the tile level whose native
        // resolution is closest to 1:1 with the screen, so a fully
        // zoomed-out overlay draws from a handful of coarse tiles instead of
        // every native tile at once. Flat overlays are unaffected: z stays
        // null and tileFactor stays 1, identical to the pre-pyramid tiling.
        let z = null;
        let tileFactor = 1;
        if (cat.pyramid) {
          const idealZ = cat.maxZoom + Math.log2(displayScale);
          z = Math.min(cat.maxZoom, Math.max(cat.minZoom, Math.round(idealZ)));
          tileFactor = Math.pow(2, cat.maxZoom - z);
        }
        const tilePx = OVERLAY_TILE_PX * tileFactor;
        const cols = Math.ceil(nw / tilePx);
        const rows = Math.ceil(nh / tilePx);
        const centerPt = map.latLngToContainerPoint(map.unproject(ov.center, NATIVE_ZOOM));

        // Compute which tiles of the overlay are visible: inverse-transform
        // the four viewport corners from screen space into overlay-local
        // pixel space (origin at the overlay's top-left, 0..nw × 0..nh),
        // take their AABB, and expand by a 1-tile prefetch margin.
        const cosInv = Math.cos(-rotRad);
        const sinInv = Math.sin(-rotRad);
        const toLocal = (sx, sy) => {
          const dx = (sx - centerPt.x) / displayScale;
          const dy = (sy - centerPt.y) / displayScale;
          return {
            x: dx * cosInv - dy * sinInv + nw / 2,
            y: dx * sinInv + dy * cosInv + nh / 2,
          };
        };
        const c0 = toLocal(0, 0);
        const c1 = toLocal(cw, 0);
        const c2 = toLocal(cw, ch);
        const c3 = toLocal(0, ch);
        const minLx = Math.min(c0.x, c1.x, c2.x, c3.x);
        const maxLx = Math.max(c0.x, c1.x, c2.x, c3.x);
        const minLy = Math.min(c0.y, c1.y, c2.y, c3.y);
        const maxLy = Math.max(c0.y, c1.y, c2.y, c3.y);
        const tMinX = Math.max(0, Math.floor(minLx / tilePx) - OVERLAY_TILE_MARGIN);
        const tMaxX = Math.min(cols - 1, Math.floor(maxLx / tilePx) + OVERLAY_TILE_MARGIN);
        const tMinY = Math.max(0, Math.floor(minLy / tilePx) - OVERLAY_TILE_MARGIN);
        const tMaxY = Math.min(rows - 1, Math.floor(maxLy / tilePx) + OVERLAY_TILE_MARGIN);
        if (tMinX > tMaxX || tMinY > tMaxY) return; // overlay entirely off-screen

        ctx.save();
        ctx.globalAlpha = ov.opacity ?? 1;
        ctx.translate(centerPt.x, centerPt.y);
        ctx.rotate(rotRad);
        ctx.scale(displayScale, displayScale);

        for (let ty = tMinY; ty <= tMaxY; ty++) {
          for (let tx = tMinX; tx <= tMaxX; tx++) {
            const tile = getTile(cat, ty, tx, z);
            if (!tile.complete || tile.naturalWidth === 0) continue;
            // Each tile covers overlay-local [tx·tilePx..tx·tilePx+tilePx, ty·tilePx..ty·tilePx+tilePx].
            // The ctx was translated to the overlay's centre, so shift by -nw/2, -nh/2.
            ctx.drawImage(
              tile,
              tx * tilePx - nw / 2,
              ty * tilePx - nh / 2,
              tilePx,
              tilePx,
            );
          }
        }
        ctx.restore();
      });

      // ── Placed map icons. Drawn last so they sit on top of sub-maps,
      // at a fixed base screen size (28 px) multiplied by the icon's
      // scale. Icons whose floor is set and doesn't match viewFloor
      // are hidden (icons with floor==null are "all floors"). Categories
      // toggled off in the Hexagon filter are skipped.
      const ICON_BASE_PX = 28;
      const trigger = () => overlayRedrawRef.current();
      iconDrafts.forEach((ic) => {
        const cat = getIconCatalogEntry(ic.kind);
        if (!cat) return;
        const category = ic.category || cat.category || 'Uncategorised';
        const subcategory = ic.subcategory || cat.subcategory || '';
        // Filter if either the category is hidden OR the specific
        // category/subcategory pair is hidden.
        if (iconFiltersOff.has(category)) return;
        if (subcategory && iconFiltersOff.has(`${category}/${subcategory}`)) return;
        if (ic.floor != null && ic.floor !== viewFloor) return;
        const img = getIconImage(ic.kind, trigger);
        if (!img || !img.complete || img.naturalWidth === 0) return;
        const pt = map.latLngToContainerPoint(map.unproject([ic.x, ic.y], NATIVE_ZOOM));
        const size = ICON_BASE_PX * (ic.scale ?? 1);
        const rot = ((ic.rotation || 0) * Math.PI) / 180;
        ctx.save();
        ctx.globalAlpha = ic.opacity ?? 1;
        ctx.translate(pt.x, pt.y);
        if (rot) ctx.rotate(rot);
        ctx.drawImage(img, -size / 2, -size / 2, size, size);
        ctx.restore();
      });
    };
    overlayRedrawRef.current = draw;

    map.on('move zoom viewreset zoomend resize', draw);
    draw();

    return () => {
      map.off('move zoom viewreset zoomend resize', draw);
    };
  }, [overlayDrafts, viewFloor, mapReady, iconDrafts, iconFiltersOff]);

  // Cleanup shared canvas + any pending zone-arm timer on unmount.
  useEffect(() => {
    return () => {
      if (overlayCanvasRef.current) {
        overlayCanvasRef.current.remove();
        overlayCanvasRef.current = null;
      }
      if (pendingZoneTimerRef.current) {
        clearTimeout(pendingZoneTimerRef.current);
        pendingZoneTimerRef.current = null;
      }
    };
  }, []);

  // Ocean-paint renderer. Single viewport-sized canvas mounted below the
  // sub-map overlay canvas so paint sits on top of the base tiles but under
  // placed sub-maps. Each stroke is a polyline of native-px points with a
  // radius; we stroke it with lineCap:'round' so overlapping discs form a
  // continuous blob. Current in-progress stroke lives in paintLiveRef for
  // smooth dragging without React rerenders.
  useEffect(() => {
    if (!mapReady) return;
    const map = mapRef.current;
    if (!map) return;
    const container = map.getContainer();

    let canvas = paintCanvasRef.current;
    if (!canvas) {
      canvas = document.createElement('canvas');
      // z-index 450: above the Leaflet tile pane (200), above the sub-map
      // overlay canvas (400). Paint covers both, which is what we want for
      // an "erase artefacts" brush.
      canvas.style.cssText = 'position:absolute;top:0;left:0;pointer-events:none;z-index:450;';
      paintCanvasRef.current = canvas;
    }
    // Defensive: make sure the canvas is actually in the map container —
    // some Leaflet flows (tileLayer reset, invalidateSize) could orphan it.
    if (canvas.parentNode !== container) {
      container.appendChild(canvas);
    }

    const syncSize = () => {
      const dpr = window.devicePixelRatio || 1;
      const cw = container.clientWidth;
      const ch = container.clientHeight;
      const wantW = Math.round(cw * dpr), wantH = Math.round(ch * dpr);
      if (canvas.width !== wantW || canvas.height !== wantH) {
        canvas.width = wantW;
        canvas.height = wantH;
        canvas.style.width = cw + 'px';
        canvas.style.height = ch + 'px';
      }
      return { dpr, cw, ch };
    };

    // Blur pen — smooths whatever's actually underneath (base map tiles +
    // sub-map overlay canvas) instead of painting new colour over it, for
    // softening a hard edge without erasing/recolouring it. Unlike
    // 'solid'/'fade' this can't be drawn straight into the shared paint
    // canvas with a fill style: it has to (1) snapshot the current on-screen
    // pixels under the strokes, (2) blur that snapshot, (3) feather to each
    // stroke's circular footprint with the same soft radial mask 'fade'
    // uses, then (4) composite the result back.
    //
    // Batched across every blur-mode stroke in ONE pass instead of one
    // snapshot+blur per stroke: a DOM query (container.querySelectorAll)
    // plus a CSS blur filter application is not cheap, and this draw() runs
    // on every map move/zoom/resize event, not just once - with, say, 165
    // strokes (this map's actual seeded default) that was 165 DOM queries
    // and 165 blur-filter passes on every single pan/zoom frame. Strokes are
    // grouped by blur radius (rounded to the nearest 0.25px) since the CSS
    // blur filter itself is one value applied to a whole canvas - same-size
    // strokes (the overwhelmingly common case; this map's 165 default
    // strokes are all identical size) collapse into a single shared
    // snapshot+blur; only genuinely different brush sizes still get their
    // own pass, still far fewer than one per stroke.
    //
    // Masking switched from destination-in-per-circle (correct only for a
    // single circle - sequentially destination-in'ing multiple circles onto
    // the same canvas intersects them rather than unioning them, silently
    // erasing any part of an earlier stroke that a later one doesn't also
    // cover) to accumulating every circle's radial-gradient footprint on its
    // own mask canvas first via normal (source-over) painting, then applying
    // that combined mask to the blurred snapshot in one destination-in - so
    // disjoint strokes in the same bucket no longer erase each other, and
    // overlapping ones correctly build up to full opacity instead.
    const drawBlurStrokes = (ctx, jobs, dpr, cw, ch) => {
      const buckets = new Map(); // roundedBlurPx -> { blurPx, circles: [{x,y,radiusPx}] }
      jobs.forEach(({ pts, radiusPx }) => {
        const blurPx = Math.max(2, radiusPx * 0.35);
        const key = Math.round(blurPx * 4) / 4;
        let bucket = buckets.get(key);
        if (!bucket) { bucket = { blurPx: key, circles: [] }; buckets.set(key, bucket); }
        pts.forEach(c => bucket.circles.push({ x: c.x, y: c.y, radiusPx }));
      });

      const containerRect = container.getBoundingClientRect();
      const tileImgs = container.querySelectorAll('.leaflet-tile-pane img.leaflet-tile-loaded');

      buckets.forEach(({ blurPx, circles }) => {
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        circles.forEach(c => {
          minX = Math.min(minX, c.x - c.radiusPx); maxX = Math.max(maxX, c.x + c.radiusPx);
          minY = Math.min(minY, c.y - c.radiusPx); maxY = Math.max(maxY, c.y + c.radiusPx);
        });
        // Pad the snapshot beyond the strokes' own bounds so the blur filter
        // has real pixels to sample from at the edge instead of sampling
        // past the snapshot into implicit transparency (which would fade
        // the blurred result toward transparent black at its border).
        const pad = Math.ceil(blurPx * 3);
        const sx = Math.max(0, Math.floor(minX - pad));
        const sy = Math.max(0, Math.floor(minY - pad));
        const ex = Math.min(cw, Math.ceil(maxX + pad));
        const ey = Math.min(ch, Math.ceil(maxY + pad));
        const sw = ex - sx, sh = ey - sy;
        if (sw <= 0 || sh <= 0) return;

        const snap = document.createElement('canvas');
        snap.width = Math.round(sw * dpr);
        snap.height = Math.round(sh * dpr);
        const sctx = snap.getContext('2d');
        sctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        sctx.translate(-sx, -sy);

        // Base map tiles are plain <img> elements in Leaflet's tile pane,
        // not a canvas — draw every currently-loaded one that overlaps this
        // bucket's snapshot rect at its actual on-screen position.
        tileImgs.forEach(img => {
          const r = img.getBoundingClientRect();
          const ix = r.left - containerRect.left, iy = r.top - containerRect.top;
          if (ix > ex || iy > ey || ix + r.width < sx || iy + r.height < sy) return;
          try { sctx.drawImage(img, ix, iy, r.width, r.height); } catch {}
        });
        // Sub-map overlays are already a canvas (overlayCanvasRef) — draw
        // the whole thing in, drawImage scales from its own backing size to
        // the 0,0,cw,ch destination regardless of dpr, so no separate
        // handling needed versus the tile <img>s above.
        if (overlayCanvasRef.current) {
          try { sctx.drawImage(overlayCanvasRef.current, 0, 0, cw, ch); } catch {}
        }

        const blurred = document.createElement('canvas');
        blurred.width = snap.width;
        blurred.height = snap.height;
        const bctx = blurred.getContext('2d');
        bctx.filter = `blur(${blurPx * dpr}px)`;
        bctx.drawImage(snap, 0, 0);
        bctx.filter = 'none';

        // Union mask: every circle painted source-over (accumulates, rather
        // than intersecting) onto its own canvas, in CSS px scaled by the
        // same dpr transform sctx uses above (needed on any HiDPI screen —
        // devicePixelRatio 2-3, effectively every phone — or each circle
        // ends up 1/dpr its intended size in the canvas's corner).
        const mask = document.createElement('canvas');
        mask.width = blurred.width;
        mask.height = blurred.height;
        const mctx = mask.getContext('2d');
        mctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        circles.forEach(c => {
          const grad = mctx.createRadialGradient(c.x - sx, c.y - sy, 0, c.x - sx, c.y - sy, c.radiusPx);
          grad.addColorStop(0, 'rgba(0,0,0,1)');
          grad.addColorStop(1, 'rgba(0,0,0,0)');
          mctx.fillStyle = grad;
          mctx.beginPath();
          mctx.arc(c.x - sx, c.y - sy, c.radiusPx, 0, Math.PI * 2);
          mctx.fill();
        });

        bctx.globalCompositeOperation = 'destination-in';
        bctx.setTransform(1, 0, 0, 1, 0, 0); // mask is already device-px sized 1:1 with blurred
        bctx.drawImage(mask, 0, 0);
        bctx.globalCompositeOperation = 'source-over';

        ctx.drawImage(blurred, sx, sy, sw, sh);
      });
    };

    const draw = () => {
      const { dpr, cw, ch } = syncSize();
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, cw, ch);

      const zoomFactor = Math.pow(2, map.getZoom() - NATIVE_ZOOM);
      const allStrokes = paintLiveRef.current
        ? [...paintStrokes, paintLiveRef.current]
        : paintStrokes;

      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.fillStyle = MAP_BG;
      ctx.strokeStyle = MAP_BG;
      ctx.globalAlpha = 1;

      // Pre-compute each stroke's screen-space points once and split blur
      // strokes out into their own batch, drawn in a single pass (see
      // drawBlurStrokes above) before the solid/fade loop below - blur
      // softens existing content, so painting solid/fade touch-ups on top
      // of it (rather than perfectly interleaved in creation order, the one
      // behaviour trade-off of batching) matches the actual workflow.
      const blurJobs = [];
      const rest = [];
      allStrokes.forEach(stroke => {
        if (!stroke || !Array.isArray(stroke.points) || stroke.points.length === 0) return;
        const radiusPx = (stroke.size || 20) * zoomFactor;
        if (radiusPx < 0.5) return;
        const pts = stroke.points.map(pt => map.latLngToContainerPoint(map.unproject(pt, NATIVE_ZOOM)));
        if (stroke.mode === 'blur') blurJobs.push({ pts, radiusPx });
        else rest.push({ mode: stroke.mode, pts, radiusPx });
      });

      if (blurJobs.length > 0) drawBlurStrokes(ctx, blurJobs, dpr, cw, ch);

      rest.forEach(({ mode, pts, radiusPx }) => {
        if (mode === 'fade') {
          // Fade pen — stamp a soft radial-gradient dab at every recorded
          // point instead of a single hard-edged stroke path, so the blot
          // blends into whatever's underneath at its edges rather than
          // cutting it off sharply. Points are recorded at most ~4 native px
          // apart (see onMove's spacing check below), which is well inside
          // radiusPx for any usable brush size, so consecutive dabs overlap
          // enough to read as one continuous soft stroke.
          //
          // Eased multi-stop falloff (holds most of its opacity out past
          // the midpoint, then tapers) instead of a straight 0->1 linear
          // alpha ramp, which still reads as a fairly hard-edged disc with
          // only a thin feather right at its rim - this spreads the
          // transition across the whole radius for a visibly more diffuse
          // blot.
          //
          // Self-overlap is capped rather than stacked: every dab in THIS
          // stroke is composited onto the reusable fadeLayer scratch canvas
          // with globalCompositeOperation 'lighten', so two overlapping
          // dabs from the same drag (e.g. a slow stroke doubling back on
          // itself) settle at whichever's opacity is higher at each pixel
          // instead of summing to something darker every time they cross.
          // Different strokes still layer normally against each other and
          // against solid/blur strokes - only a stroke's own self-overlap
          // is affected - since fadeLayer is cleared and redrawn onto ctx
          // fresh for each stroke.
          let fadeLayer = fadeLayerCanvasRef.current;
          if (!fadeLayer) {
            fadeLayer = document.createElement('canvas');
            fadeLayerCanvasRef.current = fadeLayer;
          }
          if (fadeLayer.width !== canvas.width || fadeLayer.height !== canvas.height) {
            fadeLayer.width = canvas.width;
            fadeLayer.height = canvas.height;
          }
          const fctx = fadeLayer.getContext('2d');
          fctx.setTransform(dpr, 0, 0, dpr, 0, 0);
          fctx.clearRect(0, 0, cw, ch);
          fctx.globalCompositeOperation = 'lighten';
          pts.forEach(c => {
            const grad = fctx.createRadialGradient(c.x, c.y, 0, c.x, c.y, radiusPx);
            grad.addColorStop(0, MAP_BG);
            grad.addColorStop(0.3, 'rgba(0, 34, 51, 0.85)');
            grad.addColorStop(0.6, 'rgba(0, 34, 51, 0.45)');
            grad.addColorStop(1, MAP_BG_ZERO_ALPHA);
            fctx.fillStyle = grad;
            fctx.beginPath();
            fctx.arc(c.x, c.y, radiusPx, 0, Math.PI * 2);
            fctx.fill();
          });
          fctx.globalCompositeOperation = 'source-over';
          // fadeLayer is already device-px sized 1:1 with the real canvas -
          // reset ctx to identity for this copy so it isn't scaled a second
          // time by ctx's own dpr transform (the exact bug already fixed
          // once for the blur pen's mask).
          ctx.save();
          ctx.setTransform(1, 0, 0, 1, 0, 0);
          ctx.drawImage(fadeLayer, 0, 0);
          ctx.restore();
        } else {
          // Solid pen — single opaque pass, no multi-pass layering so
          // strokes look flat, not embossed. Colour matches the ocean
          // exactly, so painting over artefacts in ocean areas reads as
          // erasing them.
          ctx.lineWidth = Math.max(1, radiusPx * 2);
          if (pts.length === 1) {
            const c = pts[0];
            ctx.beginPath();
            ctx.arc(c.x, c.y, radiusPx, 0, Math.PI * 2);
            ctx.fill();
          } else {
            ctx.beginPath();
            pts.forEach((c, i) => {
              if (i === 0) ctx.moveTo(c.x, c.y);
              else ctx.lineTo(c.x, c.y);
            });
            ctx.stroke();
          }
        }
      });
    };
    paintDrawRef.current = draw;
    map.on('move zoom viewreset zoomend resize', draw);
    draw();

    return () => {
      map.off('move zoom viewreset zoomend resize', draw);
    };
  }, [paintStrokes, mapReady]);

  // Paint pointer handlers — attached directly to the paint canvas so they
  // don't fight Leaflet's own event plumbing. The canvas is pointer-events:
  // auto only while paintMode is on, so panning works normally otherwise.
  useEffect(() => {
    if (!paintMode || !mapReady) return;
    const map = mapRef.current;
    const canvas = paintCanvasRef.current;
    if (!map || !canvas) return;
    const container = map.getContainer();
    const prevCursor = container.style.cursor;
    const prevCanvasPE = canvas.style.pointerEvents;
    const prevCanvasTouchAction = canvas.style.touchAction;
    container.style.cursor = 'crosshair';
    canvas.style.pointerEvents = 'auto';
    canvas.style.touchAction = 'none';
    canvas.style.cursor = 'crosshair';
    map.dragging?.disable();
    map.touchZoom?.disable();
    map.doubleClickZoom?.disable();
    map.scrollWheelZoom?.disable();

    let drawing = false;
    let pid = null;

    const containerToNative = (clientX, clientY) => {
      const rect = container.getBoundingClientRect();
      const px = clientX - rect.left;
      const py = clientY - rect.top;
      const ll = map.containerPointToLatLng([px, py]);
      const nat = map.project(ll, NATIVE_ZOOM);
      return clampToBounds(Math.round(nat.x), Math.round(nat.y), placementBounds);
    };

    const onDown = (e) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      drawing = true;
      pid = e.pointerId;
      paintLiveRef.current = {
        points: [containerToNative(e.clientX, e.clientY)],
        size: paintBrushSize,
        mode: paintBrushMode,
      };
      paintDrawRef.current();
      try { canvas.setPointerCapture(e.pointerId); } catch {}
      e.preventDefault();
      e.stopPropagation();
    };
    const onMove = (e) => {
      if (!drawing || e.pointerId !== pid) return;
      const live = paintLiveRef.current;
      if (!live) return;
      const pt = containerToNative(e.clientX, e.clientY);
      const last = live.points[live.points.length - 1];
      const dx = pt[0] - last[0], dy = pt[1] - last[1];
      // min 4 native-px spacing so we don't bloat with duplicate points
      if (dx * dx + dy * dy < 16) return;
      live.points.push(pt);
      paintDrawRef.current();
      e.preventDefault();
    };
    const onUp = (e) => {
      if (!drawing) return;
      drawing = false;
      try { canvas.releasePointerCapture(e.pointerId); } catch {}
      const live = paintLiveRef.current;
      paintLiveRef.current = null;
      if (live && live.points.length > 0) {
        setPaintStrokes(prev => {
          const next = [...prev, live];
          savePaintStrokes(next);
          return next;
        });
      } else {
        paintDrawRef.current();
      }
    };

    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerup', onUp);
    canvas.addEventListener('pointercancel', onUp);

    return () => {
      canvas.removeEventListener('pointerdown', onDown);
      canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('pointerup', onUp);
      canvas.removeEventListener('pointercancel', onUp);
      canvas.style.pointerEvents = prevCanvasPE;
      canvas.style.touchAction = prevCanvasTouchAction;
      canvas.style.cursor = '';
      container.style.cursor = prevCursor;
      map.dragging?.enable();
      map.touchZoom?.enable();
      map.doubleClickZoom?.enable();
      map.scrollWheelZoom?.enable();
      paintLiveRef.current = null;
      paintDrawRef.current();
    };
  }, [paintMode, paintBrushSize, paintBrushMode, paintStrokes, mapReady, placementBounds]);

  const handlePaintUndo = useCallback(() => {
    setPaintStrokes(prev => {
      const next = prev.slice(0, -1);
      savePaintStrokes(next);
      return next;
    });
  }, []);

  const handlePaintClear = useCallback(() => {
    setPaintStrokes([]);
    savePaintStrokes([]);
  }, []);

  // Copy all paint strokes as JSON to the clipboard. Use case: the user
  // paints to mask map artefacts, then pastes this JSON in chat so I can
  // bake the strokes into the source PNG + re-slice the tile pyramid.
  const handleCopyPaintJson = useCallback(async () => {
    const json = JSON.stringify(paintStrokes, null, 2);
    try {
      await navigator.clipboard.writeText(json);
      showToast(`Copied ${paintStrokes.length} stroke${paintStrokes.length === 1 ? '' : 's'}`);
    } catch {
      // Fallback: dump into the existing zone-author JSON snippet textarea
      setJsonSnippet(json);
      showToast('Clipboard blocked — shown below, long-press to copy');
    }
  }, [paintStrokes]);

  // Export/import the entire editor state (zones + sub-maps + paint) as a
  // single JSON blob so it can be backed up, swapped between devices, or
  // shipped to me for hard-coding into the app as a seed.
  const configImportInputRef = useRef(null);

  const handleExportConfig = useCallback(async () => {
    const payload = {
      version: 2,
      exportedAt: new Date().toISOString(),
      zoneDrafts: drafts,
      overlayDrafts: overlayDrafts,
      iconDrafts: iconDrafts,
      paintStrokes: paintStrokes,
    };
    const json = JSON.stringify(payload, null, 2);
    const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const filename = `map-editor-config-${stamp}.json`;
    // An <a download> click silently does nothing in the Capacitor Android
    // WebView - no default handler for a blob: URL "download", unlike a
    // real desktop browser - so this used to report "Exported" even though
    // nothing was ever written to disk. Same fix as idCardRenderer.js's
    // native branch: write the file for real via @capacitor/filesystem.
    if (window.Capacitor?.isNativePlatform?.()) {
      try {
        const { Filesystem, Directory } = await import('@capacitor/filesystem');
        await Filesystem.writeFile({ path: filename, data: json, directory: Directory.Documents, encoding: 'utf8' });
        showToast('Exported to Documents/' + filename);
      } catch (err) {
        showToast('Export failed: ' + err.message);
      }
      return;
    }
    try {
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('Exported');
    } catch (err) {
      showToast('Export failed: ' + err.message);
    }
  }, [drafts, overlayDrafts, iconDrafts, paintStrokes]);

  const handleImportConfigClick = useCallback(() => {
    configImportInputRef.current?.click();
  }, []);

  const handleImportConfigFile = useCallback(async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      let applied = 0;
      if (Array.isArray(data.zoneDrafts)) {
        setDrafts(data.zoneDrafts);
        saveDrafts(data.zoneDrafts);
        applied++;
      }
      if (Array.isArray(data.overlayDrafts)) {
        setOverlayDrafts(data.overlayDrafts);
        saveOverlayDrafts(data.overlayDrafts);
        applied++;
      }
      if (Array.isArray(data.iconDrafts)) {
        saveIconDrafts(data.iconDrafts);
        applied++;
      }
      if (Array.isArray(data.paintStrokes)) {
        setPaintStrokes(data.paintStrokes);
        savePaintStrokes(data.paintStrokes);
        applied++;
      }
      if (applied === 0) {
        showToast('No valid sections found in file');
      } else {
        showToast(`Imported ${applied} section${applied === 1 ? '' : 's'}`);
      }
    } catch (err) {
      showToast('Import failed: ' + err.message);
    }
  }, [saveIconDrafts]);

  const handleAddOverlay = useCallback((catalogId) => {
    const cat = OVERLAY_CATALOG.find(c => c.id === catalogId);
    if (!cat) return;
    const map = mapRef.current;
    const center = map
      ? (() => { const c = map.getCenter(); const pt = map.project(c, NATIVE_ZOOM); return [Math.round(pt.x), Math.round(pt.y)]; })()
      : [MAP_W / 2, MAP_H / 2];
    const ov = {
      id: `${catalogId}-${Date.now().toString(36)}`,
      catalogId: cat.id,
      name: cat.name,
      center,
      scale: 1,
      rotation: 0,
      floor: viewFloor,
      opacity: 1,
    };
    const next = [...overlayDrafts, ov];
    setOverlayDrafts(next);
    saveOverlayDrafts(next);
    setEditingOverlayId(ov.id);
  }, [overlayDrafts, viewFloor]);

  // Compute a quad polygon (native px) from an overlay's center/scale/rotation.
  // Used when adding a sub-map to the zone tree so the tree entry has a real
  // polygon matching the overlay's footprint.
  const overlayBoundsPolygon = useCallback((ov) => {
    const cat = OVERLAY_CATALOG.find(c => c.id === ov.catalogId);
    if (!cat) return [];
    const nw = cat.naturalWidth, nh = cat.naturalHeight;
    const s = ov.scale || 1;
    const halfW = (nw * s) / 2, halfH = (nh * s) / 2;
    const [cx, cy] = ov.center;
    const corners = [
      [cx - halfW, cy - halfH],
      [cx + halfW, cy - halfH],
      [cx + halfW, cy + halfH],
      [cx - halfW, cy + halfH],
    ];
    const rad = ((ov.rotation || 0) * Math.PI) / 180;
    if (rad !== 0) {
      const cos = Math.cos(rad), sin = Math.sin(rad);
      return corners.map(([x, y]) => {
        const dx = x - cx, dy = y - cy;
        return [Math.round(cx + dx * cos - dy * sin), Math.round(cy + dx * sin + dy * cos)];
      });
    }
    return corners.map(([x, y]) => [Math.round(x), Math.round(y)]);
  }, []);

  const handleUpdateOverlay = useCallback((id, patch) => {
    const next = overlayDrafts.map(o => o.id === id ? { ...o, ...patch } : o);
    setOverlayDrafts(next);
    saveOverlayDrafts(next);
    // If this overlay has a linked tree zone and its footprint changed, keep
    // the zone polygon in sync with the overlay bounds.
    if (patch && (patch.center || patch.scale !== undefined || patch.rotation !== undefined)) {
      const linkIdx = drafts.findIndex(d => d.overlayId === id);
      if (linkIdx >= 0) {
        const updatedOv = next.find(o => o.id === id);
        if (updatedOv) {
          const polygon = overlayBoundsPolygon(updatedOv);
          const nextDrafts = drafts.map((d, i) => i === linkIdx ? { ...d, polygon } : d);
          setDrafts(nextDrafts);
          saveDrafts(nextDrafts);
        }
      }
    }
    // If the user just locked this overlay AND it's already in the tree, it
    // leaves the editable Sub-maps list — close the edit panel.
    if (patch && patch.locked === true && editingOverlayId === id &&
        drafts.some(d => d.overlayId === id)) {
      setEditingOverlayId(null);
    }
  }, [overlayDrafts, drafts, overlayBoundsPolygon, editingOverlayId]);

  const {
    overlayOffline,
    downloadables,
    handleDownloadItem,
    handleDownloadAll,
    handlePurgeItem,
    handleDownloadOverlay,
    handlePurgeOverlay,
  } = useOfflineTiles(showToast);

  const handleDeleteOverlay = useCallback((id) => {
    // Also remove any linked zone from the tree
    const next = overlayDrafts.filter(o => o.id !== id);
    const nextDrafts = drafts.filter(d => d.overlayId !== id);
    setOverlayDrafts(next);
    saveOverlayDrafts(next);
    if (nextDrafts.length !== drafts.length) {
      setDrafts(nextDrafts);
      saveDrafts(nextDrafts);
    }
    if (editingOverlayId === id) setEditingOverlayId(null);
  }, [overlayDrafts, drafts, editingOverlayId]);

  const handleAddOverlayToTree = useCallback((id) => {
    const ov = overlayDrafts.find(o => o.id === id);
    if (!ov) return;
    if (drafts.some(d => d.overlayId === id)) return;
    const polygon = overlayBoundsPolygon(ov);
    const zone = {
      id: `overlay-${id}`,
      name: ov.name || 'Sub-map',
      polygon,
      overlayId: id,
    };
    const nextDrafts = [...drafts, zone];
    setDrafts(nextDrafts);
    saveDrafts(nextDrafts);
    // If this placement is locked + now in tree, it disappears from the
    // editable Sub-maps list. Close its edit panel so we don't leave it
    // open with a dangling editingOverlayId.
    if (ov.locked && editingOverlayId === id) setEditingOverlayId(null);
  }, [overlayDrafts, drafts, overlayBoundsPolygon, editingOverlayId]);

  const handleRemoveOverlayFromTree = useCallback((id) => {
    const nextDrafts = drafts.filter(d => d.overlayId !== id);
    if (nextDrafts.length === drafts.length) return;
    setDrafts(nextDrafts);
    saveDrafts(nextDrafts);
  }, [drafts]);

  // Finger-gesture placement for the currently-edited sub-map on the current floor.
  // Listens on the map container at capture phase so it runs before Leaflet's
  // pan/zoom handlers. A hit-test compares the touch point against the overlay's
  // rotated bounding box: only touches inside start a gesture, so tapping the
  // empty map around the sub-map still pans/zooms normally.
  //   1 finger drag   → move center
  //   2 fingers pinch → scale + rotate
  // Live state goes into overlayLiveRef; redraw is called directly on every
  // move (no React re-render). State is committed once on release.
  useEffect(() => {
    if (!editingOverlayId || !mapReady) return;
    const map = mapRef.current;
    if (!map) return;
    const ov = overlayDrafts.find(o => o.id === editingOverlayId);
    if (!ov || (ov.floor ?? 0) !== viewFloor) return;
    if (ov.locked) return; // locked overlays don't accept gestures
    const cat = OVERLAY_CATALOG.find(c => c.id === ov.catalogId);
    if (!cat) return;
    const container = map.getContainer();

    const hitTest = (clientX, clientY) => {
      const rect = container.getBoundingClientRect();
      const px = clientX - rect.left;
      const py = clientY - rect.top;
      const live = overlayLiveRef.current;
      const current = (live && live.id === ov.id) ? { ...ov, ...live } : ov;
      const centerPt = map.latLngToContainerPoint(map.unproject(current.center, NATIVE_ZOOM));
      const zoomFactor = Math.pow(2, map.getZoom() - NATIVE_ZOOM);
      const nw = cat.naturalWidth;
      const nh = cat.naturalHeight;
      const halfW = (nw * (current.scale ?? 1) * zoomFactor) / 2;
      const halfH = (nh * (current.scale ?? 1) * zoomFactor) / 2;
      const rot = -((current.rotation || 0) * Math.PI) / 180;
      const dx = px - centerPt.x, dy = py - centerPt.y;
      const lx = dx * Math.cos(rot) - dy * Math.sin(rot);
      const ly = dx * Math.sin(rot) + dy * Math.cos(rot);
      return Math.abs(lx) <= halfW && Math.abs(ly) <= halfH;
    };

    const live = {
      id: ov.id,
      center: [...ov.center],
      scale: ov.scale ?? 1,
      rotation: ov.rotation ?? 0,
    };
    let dragStart = null, pinchStart = null, active = false;

    const applyLive = () => {
      overlayLiveRef.current = {
        id: live.id,
        center: live.center,
        scale: live.scale,
        rotation: live.rotation,
      };
      overlayRedrawRef.current();
    };

    const onMove = (evt) => {
      if (!active) return;
      evt.preventDefault();
      if (evt.touches && evt.touches.length >= 2) {
        if (!pinchStart) {
          const t1 = evt.touches[0], t2 = evt.touches[1];
          pinchStart = {
            dist: Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY),
            angle: Math.atan2(t2.clientY - t1.clientY, t2.clientX - t1.clientX) * 180 / Math.PI,
            initScale: live.scale,
            initRotation: live.rotation,
          };
          dragStart = null;
          return;
        }
        const t1 = evt.touches[0], t2 = evt.touches[1];
        const dist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
        const angle = Math.atan2(t2.clientY - t1.clientY, t2.clientX - t1.clientX) * 180 / Math.PI;
        live.scale = Math.max(0.05, Math.min(10, pinchStart.initScale * (dist / pinchStart.dist)));
        live.rotation = ((pinchStart.initRotation + (angle - pinchStart.angle)) % 360 + 360) % 360;
        applyLive();
        return;
      }
      if (dragStart) {
        const t = evt.touches ? evt.touches[0] : evt;
        const dxScreen = t.clientX - dragStart.sx;
        const dyScreen = t.clientY - dragStart.sy;
        const s = Math.pow(2, NATIVE_ZOOM - map.getZoom());
        live.center = [Math.round(dragStart.cx + dxScreen * s), Math.round(dragStart.cy + dyScreen * s)];
        applyLive();
      }
    };

    const onUp = (evt) => {
      if (!active) return;
      if (evt.touches && evt.touches.length > 0) return;
      active = false;
      dragStart = null;
      pinchStart = null;
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      document.removeEventListener('touchmove', onMove);
      document.removeEventListener('touchend', onUp);
      map.dragging?.enable();
      if (map.touchZoom) map.touchZoom.enable();
      const committed = {
        center: [Math.round(live.center[0]), Math.round(live.center[1])],
        scale: +live.scale.toFixed(3),
        rotation: Math.round(live.rotation),
      };
      overlayLiveRef.current = null;
      handleUpdateOverlay(editingOverlayId, committed);
    };

    const onDown = (evt) => {
      const t = evt.touches ? evt.touches[0] : evt;
      if (!hitTest(t.clientX, t.clientY)) return;
      evt.preventDefault();
      evt.stopPropagation();
      active = true;
      map.dragging?.disable();
      if (map.touchZoom) map.touchZoom.disable();
      // Refresh starting values from committed state in case it moved elsewhere
      live.center = [...ov.center];
      live.scale = ov.scale ?? 1;
      live.rotation = ov.rotation ?? 0;
      if (evt.touches && evt.touches.length >= 2) {
        const t1 = evt.touches[0], t2 = evt.touches[1];
        pinchStart = {
          dist: Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY),
          angle: Math.atan2(t2.clientY - t1.clientY, t2.clientX - t1.clientX) * 180 / Math.PI,
          initScale: live.scale,
          initRotation: live.rotation,
        };
        dragStart = null;
      } else {
        dragStart = { sx: t.clientX, sy: t.clientY, cx: live.center[0], cy: live.center[1] };
        pinchStart = null;
      }
      document.addEventListener('mousemove', onMove, { passive: false });
      document.addEventListener('mouseup', onUp);
      document.addEventListener('touchmove', onMove, { passive: false });
      document.addEventListener('touchend', onUp);
    };

    container.addEventListener('mousedown', onDown, true);
    container.addEventListener('touchstart', onDown, { capture: true, passive: false });

    return () => {
      container.removeEventListener('mousedown', onDown, true);
      container.removeEventListener('touchstart', onDown, { capture: true });
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      document.removeEventListener('touchmove', onMove);
      document.removeEventListener('touchend', onUp);
      map.dragging?.enable();
      if (map.touchZoom) map.touchZoom.enable();
      overlayLiveRef.current = null;
      overlayRedrawRef.current();
    };
  }, [editingOverlayId, overlayDrafts, viewFloor, mapReady, handleUpdateOverlay]);

  // Icon place-on-map: next map click writes x/y onto the pending icon
  // and exits place mode. Cursor goes crosshair while armed.
  useEffect(() => {
    if (!placingIconId || !mapReady) return;
    const map = mapRef.current;
    if (!map) return;
    const container = map.getContainer();
    const prevCursor = container.style.cursor;
    container.style.cursor = 'crosshair';
    const onClick = (e) => {
      const pt = map.project(e.latlng, NATIVE_ZOOM);
      const [x, y] = clampToBounds(Math.round(pt.x), Math.round(pt.y), placementBounds);
      // Auto-detect owning zone and inherit the zone's floor (if any)
      // unless the user has already pinned a custom floor.
      const zone = findEnclosingZone(x, y);
      const inheritedFloor = zone ? resolveZoneFloor(zone) : null;
      setIconDrafts((prev) => {
        const next = prev.map((ic) => {
          if (ic.id !== placingIconId) return ic;
          const patch = { x, y };
          if (zone) patch.zoneId = zone.id;
          // Only inherit floor when the draft didn't already have one
          // OR the user hasn't customised it yet (floor === undefined).
          if (inheritedFloor != null && (ic.floor === undefined || ic.floor === null)) {
            patch.floor = inheritedFloor;
          }
          return { ...ic, ...patch };
        });
        try { localStorage.setItem('ww-icon-drafts', JSON.stringify(next)); } catch {}
        return next;
      });
      setPlacingIconId(null);
    };
    map.on('click', onClick);
    return () => {
      map.off('click', onClick);
      container.style.cursor = prevCursor;
    };
  }, [placingIconId, mapReady, findEnclosingZone, resolveZoneFloor, placementBounds]);

  // Multi-place — each click spawns a clone of the template icon at the
  // click location, keeping the same kind/category/subcategory/visual.
  // Auto-detects zoneId + floor the same way single place-on-map does.
  useEffect(() => {
    if (!multiPlaceFromId || !mapReady) return;
    const map = mapRef.current;
    if (!map) return;
    const container = map.getContainer();
    const prevCursor = container.style.cursor;
    container.style.cursor = 'crosshair';
    const onClick = (e) => {
      const pt = map.project(e.latlng, NATIVE_ZOOM);
      const [x, y] = clampToBounds(Math.round(pt.x), Math.round(pt.y), placementBounds);
      const zone = findEnclosingZone(x, y);
      const inheritedFloor = zone ? resolveZoneFloor(zone) : null;
      setIconDrafts((prev) => {
        const tpl = prev.find((i) => i.id === multiPlaceFromId);
        if (!tpl) {
          // The template icon is gone (e.g. it got committed/removed from
          // the draft list elsewhere) — stop spawning clones from a
          // template that no longer exists instead of silently no-op'ing
          // on every further click while the mode stays stuck on.
          setMultiPlaceFromId(null);
          return prev;
        }
        const id = `icon-${Date.now().toString(36)}-${Math.floor(Math.random() * 1e4).toString(36)}`;
        const clone = {
          id,
          kind: tpl.kind,
          category: tpl.category,
          subcategory: tpl.subcategory,
          label: '',
          x, y,
          rotation: tpl.rotation ?? 0,
          scale: tpl.scale ?? 1,
          opacity: tpl.opacity ?? 1,
          zoneId: zone?.id || null,
          floor: inheritedFloor ?? tpl.floor ?? null,
          locked: false,
        };
        const next = [...prev, clone];
        try { localStorage.setItem('ww-icon-drafts', JSON.stringify(next)); } catch {}
        return next;
      });
    };
    map.on('click', onClick);
    const onKey = (e) => { if (e.key === 'Escape') setMultiPlaceFromId(null); };
    document.addEventListener('keydown', onKey);
    return () => {
      map.off('click', onClick);
      document.removeEventListener('keydown', onKey);
      container.style.cursor = prevCursor;
    };
  }, [multiPlaceFromId, mapReady, findEnclosingZone, resolveZoneFloor, placementBounds]);

  // Close the downloads popover when clicking outside it.
  useEffect(() => {
    if (!downloadsOpen) return;
    const onDown = (e) => {
      if (downloadsPanelRef.current?.contains(e.target)) return;
      if (downloadsAnchorRef.current?.contains(e.target)) return;
      setDownloadsOpen(false);
    };
    document.addEventListener('pointerdown', onDown);
    return () => document.removeEventListener('pointerdown', onDown);
  }, [downloadsOpen]);

  // Same for the zones popover.
  useEffect(() => {
    if (!zonesOpen) return;
    const onDown = (e) => {
      if (zonesPanelRef.current?.contains(e.target)) return;
      if (zonesAnchorRef.current?.contains(e.target)) return;
      setZonesOpen(false);
    };
    document.addEventListener('pointerdown', onDown);
    return () => document.removeEventListener('pointerdown', onDown);
  }, [zonesOpen]);

  // Same for the icon-filters popover.
  useEffect(() => {
    if (!filtersOpen) return;
    const onDown = (e) => {
      if (filtersPanelRef.current?.contains(e.target)) return;
      if (filtersAnchorRef.current?.contains(e.target)) return;
      setFiltersOpen(false);
    };
    document.addEventListener('pointerdown', onDown);
    return () => document.removeEventListener('pointerdown', onDown);
  }, [filtersOpen]);

  // Triple-tap on header toggles author-enabled. Unlocking author also
  // enters draw mode in one shot (opens the editor panel); locking fully
  // exits — matches the "edition feature lives inside the editor panel"
  // flow where the only entry/exit is the triple-tap.
  const handleHeaderTap = useCallback(() => {
    const now = Date.now();
    headerTapsRef.current = [...headerTapsRef.current.filter(t => now - t < 700), now];
    if (headerTapsRef.current.length >= 3) {
      headerTapsRef.current = [];
      setAuthorEnabled(prev => {
        const next = !prev;
        try { localStorage.setItem(AUTHOR_FLAG_KEY, next ? '1' : ''); } catch {}
        showToast(next ? 'Zone author unlocked' : 'Zone author locked');
        if (next) {
          setAuthorMode(true);
          setPanelCollapsed(false);
        } else {
          setAuthorMode(false); setAuthorPoints([]); setJsonSnippet('');
        }
        return next;
      });
    }
  }, []);

  const handleUndo = () => setAuthorPoints(prev => prev.slice(0, -1));
  const handleClear = () => { setAuthorPoints([]); setJsonSnippet(''); };

  const parseLevel = (raw) => {
    const trimmed = String(raw ?? '').trim();
    if (!trimmed) return undefined;
    const n = Number(trimmed);
    if (!Number.isFinite(n)) return undefined;
    return Math.max(1, Math.min(50, Math.round(n)));
  };

  const handleSaveSubzone = () => {
    if (authorPoints.length < 3) return;
    if (!editingId) return;
    const level = parseLevel(draftLevel);
    const parent = drafts.find(d => d.id === editingId)
      || MAP_ZONES.find(z => z.id === editingId);
    const baseName = parent?.name ? `${parent.name} / sub ${drafts.filter(d => d.parentId === editingId).length + 1}` : `Subzone ${drafts.length + 1}`;
    const existingIds = new Set([...MAP_ZONES.map(z => z.id), ...drafts.map(z => z.id)]);
    let id = slugify(baseName);
    let suffix = 2;
    while (existingIds.has(id)) { id = `${slugify(baseName)}-${suffix++}`; }
    const next = {
      id,
      name: baseName,
      polygon: authorPoints,
      parentId: editingId,
      ...(level ? { level } : {}),
    };
    const updated = [...drafts, next];
    setDrafts(updated);
    saveDrafts(updated);
    setAuthorPoints([]);
    showToast(`Saved subzone "${baseName}"`);
  };

  const handleSaveDraft = () => {
    if (authorPoints.length < 3) return;
    const level = parseLevel(draftLevel);
    if (editingId) {
      const name = draftName.trim() || drafts.find(d => d.id === editingId)?.name || 'Zone';
      const updated = drafts.map(d => d.id === editingId ? {
        ...d,
        name,
        polygon: authorPoints,
        parentId: draftParent || undefined,
        level: level ?? undefined,
      } : d);
      setDrafts(updated);
      saveDrafts(updated);
      setEditingId(null);
      setAuthorPoints([]);
      setDraftName('');
      setDraftParent('');
      setDraftLevel('');
      setJsonSnippet('');
      showToast(`Updated "${name}"`);
      return;
    }
    const name = draftName.trim() || `New zone ${drafts.length + 1}`;
    const existingIds = new Set([...MAP_ZONES.map(z => z.id), ...drafts.map(z => z.id)]);
    let id = slugify(name);
    let suffix = 2;
    while (existingIds.has(id)) { id = `${slugify(name)}-${suffix++}`; }
    const next = {
      id,
      name,
      polygon: authorPoints,
      ...(draftParent ? { parentId: draftParent } : {}),
      ...(level ? { level } : {}),
    };
    const updated = [...drafts, next];
    setDrafts(updated);
    saveDrafts(updated);
    setAuthorPoints([]);
    setDraftName('');
    setDraftParent('');
    setDraftLevel('');
    setJsonSnippet('');
    showToast(`Saved "${name}"`);
  };

  const handleEditDraft = (id) => {
    const d = drafts.find(x => x.id === id);
    if (!d) return;
    setEditingId(id);
    setAuthorPoints(Array.isArray(d.polygon) ? d.polygon.map(([x, y]) => [x, y]) : []);
    setDraftName(d.name || '');
    setDraftParent(d.parentId || '');
    setDraftLevel(d.level != null ? String(d.level) : '');
    setJsonSnippet('');
    if (!authorMode) setAuthorMode(true);
    showToast(`Editing "${d.name || d.id}"`);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setAuthorPoints([]);
    setDraftName('');
    setDraftParent('');
    setDraftLevel('');
    setJsonSnippet('');
    showToast('Edit cancelled');
  };

  const handleDeleteDraft = (id) => {
    if (editingId === id) setEditingId(null);
    const updated = drafts.filter(d => d.id !== id);
    setDrafts(updated);
    saveDrafts(updated);
    if (editingId === id) { setAuthorPoints([]); setDraftName(''); setDraftParent(''); }
  };

  const handleClearDrafts = () => {
    if (drafts.length === 0) return;
    setDrafts([]);
    saveDrafts([]);
    setJsonSnippet('');
    showToast('Drafts cleared');
  };

  const buildSnippet = (list) => {
    const fmtZone = (z) => {
      const parts = [`  id: '${z.id}'`, `  name: '${String(z.name).replace(/'/g, "\\'")}'`];
      parts.push(`  polygon: [${z.polygon.map(([x, y]) => `[${x}, ${y}]`).join(', ')}]`);
      if (z.overlayId) parts.push(`  overlayId: '${z.overlayId}'`);
      if (z.parentId) parts.push(`  parentId: '${z.parentId}'`);
      if (z.level != null) parts.push(`  level: ${z.level}`);
      return `{\n${parts.join(',\n')},\n}`;
    };
    return list.map(fmtZone).join(',\n') + ',';
  };

  const handleCopyAll = async () => {
    if (drafts.length === 0) return;
    const snippet = buildSnippet(drafts);
    setJsonSnippet(snippet);
    try {
      await navigator.clipboard.writeText(snippet);
      showToast(`Copied ${drafts.length} zone${drafts.length === 1 ? '' : 's'}`);
    } catch {
      showToast('Long-press textarea to copy', 2400);
    }
  };

  return (
    <>
      <style>{`
        /* While the map tab is mounted, hide every fixed full-viewport
           background layer the rest of the app renders. The map card is
           opaque and full-viewport, so these layers only cause stacking
           conflicts and repaint noise. */
        body.map-tab-active canvas.fixed[aria-hidden="true"][role="presentation"],
        body.map-tab-active div.fixed.inset-0[aria-hidden="true"] {
          display: none !important;
        }

        /* Same glass treatment on the mini-panel (Zones/Icon filters/Offline
           downloads popover) headers as the main map header/bottom bar —
           they were falling back to plain .kuro-header's near-opaque
           default instead, direct user report ("opaque instead of also
           being transparent"). */
        .map-card .kuro-header,
        .map-zones-popover .kuro-header,
        .map-filters-popover .kuro-header,
        .map-downloads-popover .kuro-header {
          background: ${MAP_BG_TRANSPARENT} !important;
          backdrop-filter: blur(4px);
          -webkit-backdrop-filter: blur(4px);
        }

        /* Slight lift on the base map tiles only (not the zone/icon overlay
           canvas or UI chrome on top) — a small contrast/brightness/saturation
           bump reads as "less flat", closest CSS has to a sharpness nudge. */
        .leaflet-map-bg .leaflet-tile-pane {
          filter: contrast(1.06) brightness(1.04) saturate(1.05);
        }
        .zone-polygon { transition: fill-opacity var(--transition-normal, 160ms); cursor: pointer; }
        .zone-polygon:hover { fill-opacity: 0.22 !important; }

        /* ── "Zone" icon filter — L3 Area outlines / Names ─────────────── */
        /* Soft blur is what makes this read as "vague-ish" rather than the
           crisp dashed author-mode outline it's modeled on — a drop-shadow
           (not filter:blur, which SVG renders per-element and gets clipped
           to each polygon's own tiny bounding box, cutting the blur off at
           the path edge) glows the same gold along the whole stroke. */
        .zone-area-outline {
          filter: drop-shadow(0 0 3px rgba(237, 175, 24, 0.9)) drop-shadow(0 0 7px rgba(237, 175, 24, 0.5));
        }
        .zone-area-pulse {
          animation: zone-area-pulse-kf 1.1s ease-in-out 2;
        }
        @keyframes zone-area-pulse-kf {
          0%, 100% { opacity: 0.7; filter: drop-shadow(0 0 3px rgba(237, 175, 24, 0.9)) drop-shadow(0 0 7px rgba(237, 175, 24, 0.5)); }
          50% { opacity: 1; filter: drop-shadow(0 0 6px rgba(237, 175, 24, 1)) drop-shadow(0 0 16px rgba(237, 175, 24, 0.85)); }
        }
        .zone-name-label-wrap { background: transparent !important; border: none !important; }
        .zone-name-label {
          display: inline-block;
          transform: translate(-50%, -50%);
          color: var(--text-heading);
          font-family: var(--font-accent);
          font-weight: 600;
          font-size: 13px;
          letter-spacing: 0.06em;
          white-space: nowrap;
          text-shadow: 0 1px 3px rgba(0,0,0,0.9), 0 0 6px rgba(0,0,0,0.6);
          pointer-events: none;
        }

        /* ── Leaflet tooltip / popup — Kuro-tokenised ─────────────────── */
        .leaflet-tooltip.zone-tooltip {
          background: var(--bg-card);
          color: ${COLOR_CANON};
          border: 1px solid rgba(var(--color-gold), 0.4);
          font-family: var(--font-data);
          font-size: 11px;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          padding: var(--space-xs, 4px) var(--space-sm, 8px);
          border-radius: var(--radius-sm, 5px);
          box-shadow: var(--shadow-md);
          backdrop-filter: blur(var(--blur-sm)); -webkit-backdrop-filter: blur(var(--blur-sm));
        }
        .leaflet-tooltip.zone-tooltip-draft { color: ${COLOR_DRAFT}; border-color: rgba(var(--color-cyan), 0.45); }
        .leaflet-tooltip.zone-tooltip::before { display: none; }
        .leaflet-popup.zone-popup .leaflet-popup-content-wrapper {
          background: var(--bg-card); color: var(--text-body);
          border: 1px solid rgba(var(--color-gold), 0.4);
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-lg);
        }
        .leaflet-popup.zone-popup .leaflet-popup-tip {
          background: var(--bg-card);
          border: 1px solid rgba(var(--color-gold), 0.4);
        }
        .leaflet-popup.zone-popup .zone-popup-title {
          font-family: var(--font-accent);
          font-size: var(--font-md, 14px);
          color: ${COLOR_CANON};
          letter-spacing: 0.06em;
          margin-bottom: var(--space-xs, 4px);
        }
        .leaflet-popup.zone-popup .zone-popup-note {
          font-size: 12px;
          color: var(--text-body);
          opacity: 0.7;
          line-height: 1.45;
        }

        /* ── Author-mode numbered vertex markers ─────────────────────── */
        .leaflet-tooltip.zone-author-label {
          background: var(--bg-card-inner);
          color: ${COLOR_CANON};
          border: 1px solid ${COLOR_CANON};
          font-family: var(--font-data);
          font-size: 10px;
          padding: 1px 5px;
          border-radius: var(--radius-xs, 3px);
          box-shadow: 0 0 6px rgba(var(--color-gold), 0.35);
        }
        .leaflet-tooltip.zone-author-label::before { display: none; }
        .zone-author-point-icon { background: transparent; border: none; cursor: grab; }
        .zone-author-point-icon:active { cursor: grabbing; }
        .zone-author-point {
          display: flex; align-items: center; justify-content: center;
          width: 24px; height: 24px; border-radius: 50%;
          background: var(--bg-card-inner);
          border: 1.5px solid ${COLOR_CANON};
          box-shadow: 0 0 8px rgba(var(--color-gold), 0.5);
          color: ${COLOR_CANON};
          font-family: var(--font-data);
          font-size: 10px; font-weight: 700;
          -webkit-tap-highlight-color: transparent;
          transition: transform var(--transition-fast, 140ms), box-shadow var(--transition-fast, 140ms);
        }
        .zone-author-point-icon:hover .zone-author-point {
          transform: scale(1.15);
          box-shadow: 0 0 12px rgba(var(--color-gold), 0.75);
        }
        .zone-author-ghost-icon { background: transparent; border: none; cursor: pointer; }
        .zone-author-ghost {
          display: flex; align-items: center; justify-content: center;
          width: 16px; height: 16px; border-radius: 50%;
          background: var(--bg-card);
          border: 1px dashed rgba(var(--color-gold), 0.6);
          color: ${COLOR_CANON};
          font-family: var(--font-data);
          font-size: 12px; line-height: 1; font-weight: 700;
          opacity: 0.55;
          transition: opacity var(--transition-fast, 140ms), transform var(--transition-fast, 140ms), background var(--transition-fast, 140ms);
          -webkit-tap-highlight-color: transparent;
        }
        .zone-author-ghost-icon:hover .zone-author-ghost {
          opacity: 1; transform: scale(1.2); background: rgba(var(--color-gold), 0.15);
        }

        /* Legacy .zone-author-btn matches .kuro-btn-sm exactly now:
           padding 4×10, 8px radius, 12px font, same bg/border tokens. */
        .zone-author-btn {
          font-family: var(--font-display);
          font-size: 12px;
          font-weight: 500;
          letter-spacing: 0.02em;
          padding: 4px 8px;
          min-height: 30px;
          border-radius: 8px;
          cursor: pointer;
          background: var(--bg-btn);
          color: var(--text-heading);
          border: 1px solid var(--border-medium);
          transition: background var(--transition-normal, 160ms), border-color var(--transition-normal, 160ms), color var(--transition-fast, 120ms);
          -webkit-tap-highlight-color: transparent;
        }
        .zone-author-btn:hover {
          background: rgba(var(--color-gold), 0.15);
          border-color: ${COLOR_CANON};
          color: ${COLOR_CANON};
        }
        .zone-author-btn[disabled] { opacity: 0.4; cursor: not-allowed; }
        .zone-author-btn.is-active {
          background: rgba(var(--color-gold), 0.2);
          border-color: ${COLOR_CANON};
          color: ${COLOR_CANON};
        }
        .zone-author-btn.is-danger {
          color: #f87171;
          border-color: rgba(var(--color-red), 0.4);
        }
        .zone-author-btn.is-danger:hover {
          background: rgba(var(--color-red), 0.12);
          border-color: #f87171;
        }

        /* ── Header-anchored popovers (zones / filters / downloads) ───── */
        /* The shared Kuro <Card> supplies shadow/border/backdrop; the tiny
           corner-decoration pseudo-elements (.kuro-card-inner::before/after)
           are meant for full-tab cards and look cluttered inside a 300 px
           popover (they overlap the ✕ close button at top-right and clip
           against the last list row at bottom-left) — hide them here. */
        .map-zones-popover .kuro-card-inner::before,
        .map-zones-popover .kuro-card-inner::after,
        .map-filters-popover .kuro-card-inner::before,
        .map-filters-popover .kuro-card-inner::after,
        .map-downloads-popover .kuro-card-inner::before,
        .map-downloads-popover .kuro-card-inner::after { display: none; }

        /* ── Offline downloads popover (gear icon, user-side) ─────────── */
        /* Wraps a real <Card>; Kuro card provides the visuals. Only layout
           + per-context paddings here. All interactive elements use
           canonical .kuro-btn / .kuro-btn-sm / .kuro-btn-icon. */
        .map-downloads-popover {
          position: absolute;
          right: var(--space-md, 12px);
          z-index: var(--z-overlay, 1000);
          width: 256px;
          overflow: visible;
        }
        .map-downloads-popover .kuro-header { padding: var(--space-sm, 8px) var(--space-md, 12px); }
        .map-downloads-popover .kuro-header h3::before { display: none; }
        .map-downloads-popover .kuro-header h3 {
          font-family: var(--font-display);
          font-size: var(--font-base, 13px);
          letter-spacing: 0.03em;
        }
        .map-downloads-popover .kuro-body { padding: var(--space-sm, 8px) var(--space-md, 12px); }
        .map-downloads-popover .map-downloads-body {
          display: flex; flex-direction: column;
          gap: var(--space-sm, 8px);
          max-height: 60vh; overflow-y: auto;
        }
        .map-downloads-all {
          width: 100%;
          display: inline-flex; align-items: center; justify-content: center;
          gap: var(--space-xs, 6px);
        }
        .map-downloads-list { display: flex; flex-direction: column; gap: 0; }
        .map-downloads-row {
          display: flex; align-items: center; justify-content: space-between;
          gap: var(--space-sm, 8px);
          padding: var(--space-sm, 8px) 0;
          border-top: 1px solid var(--border-subtle);
        }
        .map-downloads-row:first-child { border-top: none; padding-top: 0; }
        .map-downloads-row:last-child { padding-bottom: 0; }
        .map-downloads-meta { min-width: 0; flex: 1; }
        .map-downloads-meta .name {
          color: var(--text-heading);
          font-family: var(--font-display);
          font-size: var(--font-base, 13px);
          font-weight: 500;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .map-downloads-meta .hint {
          color: var(--text-body);
          font-family: var(--font-data);
          font-size: 10px;
          letter-spacing: 0.04em;
          margin-top: 2px;
          opacity: 0.7;
        }

        /* ── Zone author panel (bottom sheet when authoring) ──────────── */
        .zone-author-panel {
          position: absolute;
          left: var(--space-md, 12px);
          right: var(--space-md, 12px);
          bottom: 62px;
          z-index: var(--z-elevated, 10);
          background: var(--bg-card);
          border: 1px solid var(--border-default);
          border-radius: var(--radius-lg, 11px);
          padding: var(--space-sm, 8px) var(--space-md, 12px);
          box-shadow: var(--shadow-md);
          backdrop-filter: blur(var(--blur-sm)); -webkit-backdrop-filter: blur(var(--blur-sm));
          font-family: var(--font-display);
          color: var(--text-body);
          font-size: 12px;
          display: flex; flex-direction: column; gap: var(--space-sm, 8px);
          max-height: calc(100% - 120px); overflow-y: auto;
        }
        .zone-author-panel .panel-top-row {
          display: flex; gap: var(--space-xs, 6px);
          align-items: center; justify-content: space-between;
        }
        .zone-author-collapsed {
          position: absolute;
          right: var(--space-md, 12px);
          bottom: 62px;
          z-index: var(--z-elevated, 10);
          display: inline-flex; align-items: center; gap: var(--space-xs, 6px);
          background: var(--bg-card); color: var(--text-body);
          border: 1px solid var(--border-default);
          border-radius: var(--radius-lg, 11px);
          padding: var(--space-xs, 4px) var(--space-sm, 10px);
          cursor: pointer;
          font-family: var(--font-display);
          font-size: 11px;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          box-shadow: var(--shadow-md);
          backdrop-filter: blur(var(--blur-sm)); -webkit-backdrop-filter: blur(var(--blur-sm));
          -webkit-tap-highlight-color: transparent;
          transition: background var(--transition-normal, 160ms), border-color var(--transition-normal, 160ms);
        }
        .zone-author-collapsed .count { color: ${COLOR_CANON}; font-weight: 700; font-size: 13px; }
        .zone-author-collapsed .hint { color: var(--text-body); opacity: 0.6; font-size: 10px; }
        .zone-author-collapsed .chip {
          background: rgba(var(--color-gold), 0.18);
          color: ${COLOR_CANON};
          border: 1px solid rgba(var(--color-gold), 0.4);
          border-radius: var(--radius-xs, 3px);
          padding: 0 5px;
          font-size: 9px;
          letter-spacing: 0.06em;
        }
        .zone-author-collapsed .caret { color: ${COLOR_CANON}; font-size: 10px; }
        .zone-author-collapsed:hover {
          background: rgba(var(--color-gold), 0.12);
          border-color: ${COLOR_CANON};
        }
        .zone-author-panel .row {
          display: flex; gap: var(--space-sm, 8px); flex-wrap: wrap; align-items: center;
        }
        .zone-author-panel .count { color: ${COLOR_CANON}; font-weight: 700; }
        .zone-author-panel .hint {
          color: var(--text-body); opacity: 0.6;
          font-size: 10px; letter-spacing: 0.04em; text-transform: uppercase;
        }
        .zone-author-panel .field {
          display: flex; flex-direction: column;
          gap: 2px; flex: 1 1 auto; min-width: 0;
        }
        .zone-author-panel .field label {
          color: var(--text-body); opacity: 0.6;
          font-size: 10px; letter-spacing: 0.05em; text-transform: uppercase;
        }
        .zone-author-panel input,
        .zone-author-panel select,
        .zone-author-panel textarea {
          background: var(--bg-input);
          color: var(--text-heading);
          border: 1px solid var(--border-medium);
          border-radius: var(--input-radius, var(--radius-md, 7px));
          font-family: var(--font-display);
          font-size: 12px;
          padding: 8px 8px;
          min-height: 30px;
          outline: none; min-width: 0; width: 100%;
          transition: border-color var(--transition-fast, 120ms);
        }
        .zone-author-panel input:focus,
        .zone-author-panel select:focus,
        .zone-author-panel textarea:focus {
          border-color: var(--border-focus);
        }
        .zone-author-panel textarea {
          min-height: 96px; resize: vertical;
          font-family: var(--font-data);
          font-size: 11px;
          padding: var(--space-xs, 6px) var(--space-sm, 8px);
          -webkit-user-select: text; user-select: text;
        }
        .zone-author-panel .divider {
          height: 1px;
          background: var(--border-subtle);
          margin: var(--space-md, 12px) 0;
        }
        .zone-author-panel .drafts-head {
          display: flex; justify-content: space-between; align-items: center;
          color: ${COLOR_DRAFT}; font-size: 10px;
          letter-spacing: 0.06em; text-transform: uppercase;
        }
        .zone-author-panel .draft-row {
          display: flex; justify-content: space-between; align-items: center;
          gap: var(--space-sm, 8px);
          padding: 6px 0;
          border-bottom: 1px dashed rgba(var(--color-cyan), 0.15);
          font-size: 11px;
        }
        .zone-author-panel .draft-row:last-child { border-bottom: none; }
        .zone-author-panel .draft-row.is-editing {
          background: rgba(var(--color-gold), 0.08);
          padding-left: var(--space-xs, 4px);
          padding-right: var(--space-xs, 4px);
          border-radius: var(--radius-xs, 3px);
        }
        .zone-author-panel .draft-tree { display: flex; flex-direction: column; }
        .zone-author-panel .draft-row .drname {
          color: var(--text-heading);
          overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
          min-width: 0; flex: 1 1 auto;
          display: inline-flex; align-items: center; gap: var(--space-xs, 4px);
        }
        .zone-author-panel .draft-row .drsub {
          color: var(--text-body); opacity: 0.6;
          margin-left: var(--space-xs, 4px);
        }
        .zone-author-panel .draft-row .tree-glyph {
          color: rgba(var(--color-cyan), 0.55); font-size: 10px;
        }
        .zone-author-panel .draft-row .lvl-tag {
          display: inline-flex; align-items: center; justify-content: center;
          min-width: 24px;
          /* Matches .kuro-badge geometry (2×8 padding, 4px radius,
             10px font) for one consistent inline-chip scale. */
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 10px;
          line-height: 1.4;
          background: rgba(var(--color-gold), 0.18);
          color: ${COLOR_CANON};
          border: 1px solid rgba(var(--color-gold), 0.35);
          letter-spacing: 0.04em;
        }
        .zone-author-panel .draft-row .lvl-tag.is-unset {
          background: rgba(138, 138, 138, 0.12);
          color: var(--text-body); opacity: 0.7;
          border-color: rgba(138, 138, 138, 0.35);
        }
        .zone-author-panel .draft-row .drlabel { overflow: hidden; text-overflow: ellipsis; }
        .zone-author-panel .draft-row button {
          background: transparent;
          border: 1px solid rgba(var(--color-red), 0.4);
          color: #f87171;
          padding: 1px 7px;
          border-radius: var(--radius-xs, 3px);
          cursor: pointer;
          font-family: inherit;
          font-size: 10px;
          transition: background var(--transition-normal, 160ms);
        }
        .zone-author-panel .draft-row button:hover { background: rgba(var(--color-red), 0.12); }
        .zone-author-panel .draft-row .edit-btn {
          border-color: rgba(var(--color-gold), 0.45);
          color: ${COLOR_CANON};
        }
        .zone-author-panel .draft-row .edit-btn:hover { background: rgba(var(--color-gold), 0.12); }
        .zone-author-panel .edit-banner {
          background: rgba(var(--color-gold), 0.12);
          border: 1px solid rgba(var(--color-gold), 0.35);
          border-radius: 4px;
          /* Match .kuro-badge padding (2×8) so inline chips across the
             app share one scale. Gold variant isn't in the palette, so
             styling stays custom. */
          padding: 2px 8px;
          font-size: 10px; letter-spacing: 0.05em; text-transform: uppercase;
          line-height: 1.4;
          color: ${COLOR_CANON};
        }
        .zone-author-panel .edit-banner-name {
          color: var(--text-heading); font-weight: 700; letter-spacing: 0.03em;
        }

        /* Floating toast above the map. Padding matches the
           canonical kuro-btn (10×12) so the chip reads as a button-
           equivalent pill rather than a bespoke surface. */
        .zone-author-toast {
          position: absolute; top: 62px; left: 50%;
          transform: translateX(-50%);
          z-index: var(--z-toast, 9500);
          padding: 12px;
          border-radius: var(--radius-lg);
          background: var(--bg-card);
          color: ${COLOR_CANON};
          border: 1px solid rgba(var(--color-gold), 0.45);
          font-family: var(--font-display);
          font-size: 11px;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          box-shadow: var(--shadow-md);
          backdrop-filter: blur(var(--blur-sm)); -webkit-backdrop-filter: blur(var(--blur-sm));
          pointer-events: none;
        }
        .map-header-tap { cursor: pointer; -webkit-tap-highlight-color: transparent; }

        /* ── Zones popover (header-anchored, like downloads) ──────────── */
        .map-zones-popover {
          position: absolute;
          right: var(--space-md, 12px);
          z-index: var(--z-overlay, 1000);
          width: 256px;
          overflow: visible;
        }
        /* ── Bottom instructions bar ───────────────────────────────────── */
        .map-instructions-bar .kuro-header h3 {
          font-size: var(--font-sm, 12px);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .map-zones-popover .kuro-header { padding: var(--space-sm, 8px) var(--space-md, 12px); }
        .map-zones-popover .kuro-header h3::before { display: none; }
        .map-zones-popover .kuro-header h3 {
          font-family: var(--font-display);
          font-size: var(--font-base, 13px);
          letter-spacing: 0.03em;
        }
        .map-zones-popover .kuro-body { padding: var(--space-sm, 8px) var(--space-md, 12px); }
        .map-zones-popover .map-zones-body {
          display: flex; flex-direction: column;
          gap: var(--space-xs, 4px);
          max-height: 60vh; overflow-y: auto;
        }

        /* ── Icon filters popover (hexagon button) ────────────────────── */
        .map-filters-popover {
          position: absolute;
          right: var(--space-md, 12px);
          z-index: var(--z-overlay, 1000);
          width: 256px;
          overflow: visible;
        }
        .map-filters-popover .kuro-header { padding: var(--space-sm, 8px) var(--space-md, 12px); }
        .map-filters-popover .kuro-header h3::before { display: none; }
        .map-filters-popover .kuro-header h3 {
          font-family: var(--font-display);
          font-size: var(--font-base, 13px);
          letter-spacing: 0.03em;
        }
        .map-filters-popover .kuro-body { padding: var(--space-sm, 8px) var(--space-md, 12px); }
        .map-filters-popover .map-filters-body {
          display: flex; flex-direction: column;
          gap: var(--space-xs, 4px);
          max-height: 60vh; overflow-y: auto;
        }
        .map-filters-list { display: flex; flex-direction: column; gap: var(--space-xs, 4px); }
        /* Gap between label text and count badge (A) matches the
           button's top/bottom padding (D/E = 4 px from .kuro-btn-sm)
           so the badge sits with equal breathing room on its left
           and above/below. Only flex gap contributes — no extra
           padding-right on the label. */
        .map-filters-popover .zone-selector-item .zone-selector-name {
          padding-right: 0;
        }
        .map-filters-popover .kuro-badge {
          font-variant-numeric: tabular-nums;
        }

        /* ── Map-icon editor row (admin-only, in author panel) ────────── */
        .icon-row {
          display: flex; flex-direction: column;
          gap: var(--space-sm, 8px);
          padding: var(--space-sm, 8px);
          background: rgba(var(--color-cyan), 0.04);
          border: 1px solid rgba(var(--color-cyan), 0.18);
          border-radius: 8px;
        }
        .icon-row + .icon-row { margin-top: var(--space-xs, 6px); }
        .icon-row.is-active {
          border-color: ${COLOR_CANON};
          background: rgba(var(--color-gold), 0.08);
          box-shadow: 0 0 0 1px rgba(var(--color-gold), 0.25);
        }
        .icon-row.is-locked { border-style: dashed; opacity: 0.92; }

        /* Locked icons appearing as leaves in the Regions tree — smaller
           caret slot replaced by a 14×14 thumbnail of the icon. */
        /* Icon thumbnail inside the draft-tree (editor panel). The
           user-facing Regions popover intentionally does NOT render
           icons — map icons are an admin-only concept surfaced only
           inside the author panel's drafts tree. */
        .draft-row-icon-thumb {
          width: 14px; height: 14px; object-fit: contain;
          margin: 0 4px; vertical-align: middle;
        }
        .draft-row.is-icon-row { opacity: 0.9; }
        .draft-row.is-icon-row .drlabel { font-size: 11px; }

        /* Bulk selection — "Select zones / subzones / icons" strip above the
           draft tree, plus the bulk-action bar that appears once anything is
           ticked. Uses the same Kuro tokens as the rest of the author panel. */
        .zone-author-panel .bulk-select-bar {
          padding: var(--space-xs, 4px) 0 var(--space-sm, 8px) 0;
        }
        .zone-author-panel .bulk-check {
          appearance: none; -webkit-appearance: none;
          width: 12px; height: 12px;
          margin: 0 var(--space-xs, 4px) 0 0;
          border: 1px solid rgba(var(--color-gold), 0.45);
          border-radius: var(--radius-xs, 3px);
          background: var(--bg-card-inner);
          cursor: pointer;
          position: relative;
          flex: 0 0 auto;
          vertical-align: middle;
          transition: background var(--transition-normal, 160ms), border-color var(--transition-normal, 160ms);
        }
        .zone-author-panel .bulk-check:hover {
          border-color: ${COLOR_CANON};
          background: rgba(var(--color-gold), 0.1);
        }
        .zone-author-panel .bulk-check:checked {
          background: rgba(var(--color-gold), 0.55);
          border-color: ${COLOR_CANON};
        }
        .zone-author-panel .bulk-check:checked::after {
          content: '';
          position: absolute;
          left: 3px; top: 0;
          width: 4px; height: 8px;
          border: solid var(--bg-card);
          border-width: 0 1.5px 1.5px 0;
          transform: rotate(45deg);
        }
        .zone-author-panel .draft-row.is-selected {
          background: rgba(var(--color-gold), 0.08);
          box-shadow: inset 2px 0 0 0 ${COLOR_CANON};
        }
        .zone-author-panel .bulk-action-bar {
          margin-top: var(--space-sm, 8px);
          padding: var(--space-sm, 8px);
          background: rgba(var(--color-gold), 0.06);
          border: 1px solid rgba(var(--color-gold), 0.35);
          border-radius: var(--radius-sm, 5px);
          display: flex; flex-direction: column;
          gap: var(--space-xs, 6px);
        }
        .zone-author-panel .bulk-action-bar-head {
          display: flex; align-items: center; justify-content: space-between;
          font-family: var(--font-display);
          font-size: 10px;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: ${COLOR_CANON};
        }
        .zone-author-panel .bulk-action-row {
          display: flex; align-items: center;
          gap: var(--space-xs, 6px);
        }
        .zone-author-panel .bulk-action-label {
          flex: 0 0 48px;
          font-family: var(--font-display);
          font-size: 10px;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          color: var(--text-body);
          opacity: 0.85;
        }
        .zone-author-panel .bulk-action-row input[type="text"],
        .zone-author-panel .bulk-action-row input[type="number"],
        .zone-author-panel .bulk-action-row select {
          flex: 1 1 0;
          min-width: 0;
          background: var(--bg-card-inner);
          border: 1px solid var(--border-medium);
          color: var(--text-heading);
          font-family: var(--font-data);
          font-size: 11px;
          padding: 4px 6px;
          border-radius: var(--radius-xs, 3px);
        }
        .zone-author-panel .bulk-action-row input:focus,
        .zone-author-panel .bulk-action-row select:focus {
          outline: none;
          border-color: ${COLOR_CANON};
          box-shadow: 0 0 0 1px rgba(var(--color-gold), 0.25);
        }
        .icon-preview {
          flex: 0 0 auto;
          width: 32px; height: 32px;
          display: flex; align-items: center; justify-content: center;
          background: var(--bg-card-inner);
          border: 1px solid var(--border-medium);
          border-radius: var(--radius-sm, 5px);
          overflow: hidden;
        }
        .icon-preview img { max-width: 100%; max-height: 100%; display: block; }
        .kuro-btn-sm.is-danger {
          color: #f87171;
          border-color: rgba(var(--color-red), 0.4);
        }
        .kuro-btn-sm.is-danger:hover {
          background: rgba(var(--color-red), 0.12);
          border-color: #f87171;
          color: #f87171;
        }
        .zone-selector-empty {
          padding: var(--space-sm, 8px);
          font-family: var(--font-display);
          font-size: 11px;
          color: var(--text-heading);
          opacity: 0.55;
          text-align: center;
        }
        .zone-selector-empty {
          padding: var(--space-sm, 8px);
          font-family: var(--font-display);
          font-size: 11px;
          color: var(--text-heading);
          opacity: 0.55;
          text-align: center;
        }
        .zone-selector-item {
          justify-content: flex-start;
          text-align: left;
          gap: var(--space-xs, 4px);
        }
        .zone-selector-item.is-armed {
          background: rgba(var(--color-gold), 0.2);
          border-color: rgba(var(--color-gold), 1);
          color: ${COLOR_CANON};
          animation: zone-armed-pulse 1s ease-in-out infinite;
        }
        @keyframes zone-armed-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(var(--color-gold), 0.35); }
          50% { box-shadow: 0 0 0 3px rgba(var(--color-gold), 0.08); }
        }
        /* Gold highlight for the zone whose overlay matches the current
           viewFloor — shows "you are here" in the tree. */
        .zone-selector-item.is-current {
          background: rgba(var(--color-gold), 0.14);
          border-color: ${COLOR_CANON};
          color: ${COLOR_CANON};
          box-shadow: var(--shadow-md), 0 0 0 1px rgba(var(--color-gold), 0.35);
        }
        .zone-selector-item.is-current:hover {
          background: rgba(var(--color-gold), 0.22);
          border-color: ${COLOR_CANON};
          color: ${COLOR_CANON};
        }
        .zone-selector-caret {
          display: inline-block; width: 8px; text-align: center;
          opacity: 0.7; flex-shrink: 0;
        }
        .zone-selector-name {
          flex: 1 1 auto;
          overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
        }
        .zone-selector-row {
          display: flex; align-items: stretch; gap: var(--space-sm, 8px);
        }
        .zone-selector-row .zone-selector-item { flex: 1 1 auto; }

        /* ── Sub-map overlay rows (editor panel) ──────────────────────── */
        /* Treat each row as a mini-card: 8px radius (matches kuro-btn-sm
           + kuro-badge scale), 8×10 padding (aligns with mobile kuro-input
           and nested button padding), 8px internal gap on the 8-px rhythm. */
        .overlay-row {
          background: rgba(var(--color-cyan), 0.06);
          border: 1px solid rgba(var(--color-cyan), 0.2);
          border-radius: 8px;
          padding: 8px 8px;
          display: flex; flex-direction: column;
          gap: var(--space-sm, 8px);
        }
        .overlay-row.is-active {
          border-color: ${COLOR_CANON};
          background: rgba(var(--color-gold), 0.06);
        }
        .overlay-row.is-locked {
          border-color: rgba(148, 163, 184, 0.35);
          background: rgba(148, 163, 184, 0.05);
        }
        .overlay-row-head {
          display: flex; justify-content: space-between; align-items: center;
          gap: var(--space-sm, 8px);
        }
        .overlay-controls { display: flex; flex-direction: column; gap: var(--space-sm, 8px); }
        /* Badges inside overlay rows inherit canonical .kuro-badge
           visuals (padding 2x8, radius 4, 10 px font) via JSX classes
           kuro-badge kuro-badge-neutral / kuro-badge-emerald. Only add
           a small left margin for inline placement. */
        .overlay-row .kuro-badge { margin-left: var(--space-xs, 4px); text-transform: uppercase; letter-spacing: 0.06em; }
        .overlay-slider {
          -webkit-appearance: none; appearance: none;
          width: 100%; height: 4px;
          background: rgba(var(--color-gold), 0.2);
          border-radius: var(--radius-xs, 3px);
          outline: none;
        }
        .overlay-slider::-webkit-slider-thumb {
          -webkit-appearance: none; appearance: none;
          width: 14px; height: 14px; border-radius: 50%;
          background: ${COLOR_CANON};
          cursor: pointer;
          border: 1.5px solid var(--bg-card-inner);
        }
      `}</style>
      <div role="tabpanel" id="tabpanel-map" aria-labelledby="tab-map" tabIndex="0" style={{ position: 'relative', zIndex: 10 }}>
      <FocusTrapModal isOpen={showWipNotice} onClose={dismissWipNotice} className="" onClick={dismissWipNotice} ariaLabel="Map work in progress" centered padding="p-3">
        <div className="kuro-card w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
          <div className="px-4 py-3 border-b border-[var(--border-medium)] flex items-center justify-between" data-sheet-header>
            <div className="flex items-center gap-2">
              <Construction size={16} className="text-yellow-400" />
              <h3 className="text-white font-semibold text-lg">{t('map.wip.title')}</h3>
            </div>
            <button onClick={dismissWipNotice} className="p-3 min-w-[48px] min-h-[48px] flex items-center justify-center rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-all" aria-label={t('map.wip.close')}>
              <X size={16} />
            </button>
          </div>
          <div className="w-full h-48 flex items-center justify-center overflow-hidden" style={{ background: 'var(--bg-btn)' }}>
            <img
              src="./misc-assets/jZQdMWr1-abby-teaser.png"
              alt=""
              className="object-contain w-full h-full"
              loading="eager"
              onError={hideOnError}
            />
          </div>
          <div className="p-4 space-y-3 text-sm text-gray-300 leading-relaxed">
            <p>{t('map.wip.body1')}</p>
            <p>{t('map.wip.body2')}</p>
          </div>
          <div className="px-4 pb-4">
            <button onClick={dismissWipNotice} className="kuro-btn w-full">{t('map.wip.gotIt')}</button>
          </div>
        </div>
      </FocusTrapModal>
      {/* Wrapper gets the outer height (canvas height minus header/nav reserved space); the card is a
          flex child (flex: 1) that fills whatever's left INSIDE that box, including .tab-content's
          own padding (box-sizing: border-box handles that automatically). Extra -12: the margin
          that should sit between the wrapper and the nav (mirroring the one between the header and
          the wrapper) wasn't showing up on its own, so it's reserved explicitly here.
          var(--canvas-height-px), not 100dvh — 100dvh is the REAL physical viewport height, which
          only equals ScaledCanvas.jsx's own (elastic) canvas height when scale is exactly 1 (the
          reference device); on every other device this card came up short of the canvas's actual
          available height, i.e. didn't reach the bottom. See ScaledCanvas.jsx's own comment on
          --canvas-height-px. */}
      <div className="kuro-calc space-y-3 tab-content" style={{ display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 1, height: `calc(var(--canvas-height-px, 100dvh) - ${headerPadding + navPadding + 12}px)` }}>
        <div className="kuro-card map-card" style={{ flex: '1 1 auto', minHeight: 0, overflow: 'hidden', background: MAP_BG, position: 'relative', zIndex: 1, isolation: 'isolate' }}>
          <div className="kuro-card-inner" style={{ position: 'relative', height: '100%' }}>
            <div
              ref={containerRef}
              className="leaflet-map-bg"
              style={{
                position: 'absolute',
                // Oversized outside the editing modes so a rotated square still
                // fully covers the axis-aligned viewport instead of exposing the
                // card background at its corners; the editing modes need the
                // container at its exact, un-rotated footprint (see the effect
                // above pairing this with map.invalidateSize()).
                inset: editingModeActive ? 0 : '-30%',
                width: editingModeActive ? '100%' : '160%',
                height: editingModeActive ? '100%' : '160%',
                background: MAP_BG,
                zIndex: 1,
              }}
            />
            {status && (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888', zIndex: 1000, pointerEvents: 'none' }}>
                {status}
              </div>
            )}
            <div
              ref={cardHeaderRef}
              className="map-header-tap"
              onClick={handleHeaderTap}
              style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 }}
            >
              <CardHeader
                action={
                  <>
                    <button
                      ref={zonesAnchorRef}
                      type="button"
                      className={`kuro-btn kuro-btn-sm kuro-btn-icon ${zonesOpen ? 'is-active' : ''}`}
                      onClick={(e) => { e.stopPropagation(); setZonesOpen(v => { if (!v) { setDownloadsOpen(false); setFiltersOpen(false); } return !v; }); }}
                      aria-label={t('map.header.regions')}
                      aria-expanded={zonesOpen}
                      title={t('map.header.regions')}
                    >
                      <MapIcon size={14} />
                    </button>
                    <button
                      ref={filtersAnchorRef}
                      type="button"
                      className={`kuro-btn kuro-btn-sm kuro-btn-icon ${filtersOpen ? 'is-active' : ''}`}
                      onClick={(e) => { e.stopPropagation(); setFiltersOpen(v => { if (!v) { setZonesOpen(false); setDownloadsOpen(false); } return !v; }); }}
                      aria-label={t('map.header.iconFilters')}
                      aria-expanded={filtersOpen}
                      title={t('map.header.iconFilters')}
                    >
                      <Hexagon size={14} />
                    </button>
                    {!editingModeActive && (
                      <button
                        type="button"
                        className={`kuro-btn kuro-btn-sm kuro-btn-icon ${rotation !== 0 ? 'is-active' : ''}`}
                        onClick={(e) => { e.stopPropagation(); rotationRef.current = 0; setRotation(0); }}
                        aria-label="Reset map rotation"
                        title={rotation !== 0 ? `Rotated ${Math.round(rotation)}° · tap to reset` : 'Twist with two fingers to rotate'}
                      >
                        {/* lucide's own Compass geometry (circle + needle
                            polygon, same viewBox/stroke), with an extra gold
                            fill polygon layered over just the needle's north
                            (upper-right) half — the south half stays exactly
                            lucide's plain outline. */}
                        <svg
                          width={14}
                          height={14}
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          style={{ transform: `rotate(${-rotation}deg)` }}
                        >
                          <circle cx="12" cy="12" r="10" />
                          <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
                          <polygon points="16.24 7.76 14.12 14.12 9.88 9.88" fill="rgb(var(--color-gold))" stroke="none" />
                        </svg>
                      </button>
                    )}
                    <button
                      ref={downloadsAnchorRef}
                      type="button"
                      className={`kuro-btn kuro-btn-sm kuro-btn-icon ${downloadsOpen ? 'is-active' : ''}`}
                      onClick={(e) => { e.stopPropagation(); setDownloadsOpen(v => { if (!v) { setZonesOpen(false); setFiltersOpen(false); } return !v; }); }}
                      aria-label={t('map.header.offlineDownloads')}
                      aria-expanded={downloadsOpen}
                      title={t('map.header.offlineDownloads')}
                    >
                      <Settings size={14} />
                    </button>
                  </>
                }
              >
                {t('map.header.title')}
              </CardHeader>
            </div>

            {downloadsOpen && (
              <OfflineDownloadsPopover
                panelRef={downloadsPanelRef}
                top={headerHeight + 8}
                maxHeight={`calc(var(--canvas-height-px, 100dvh) - ${headerHeight + navPadding + 40}px)`}
                downloadables={downloadables}
                overlayOffline={overlayOffline}
                onDownloadAll={handleDownloadAll}
                onDownloadItem={handleDownloadItem}
                onPurgeItem={handlePurgeItem}
                onClose={() => setDownloadsOpen(false)}
              />
            )}

            {toast && <div className="zone-author-toast" role="status">{toast}</div>}

            {/* Zone selector — same var(--space-md) gap on top and right */}
            {zonesOpen && (
              <ZonesPopover
                panelRef={zonesPanelRef}
                top={headerHeight + 8}
                maxHeight={`calc(var(--canvas-height-px, 100dvh) - ${headerHeight + navPadding + 40}px)`}
                zoneNav={zoneNav}
                expandedZones={expandedZones}
                currentZoneId={currentZoneId}
                pendingZoneId={pendingZoneId}
                setPendingZoneId={setPendingZoneId}
                pendingZoneTimerRef={pendingZoneTimerRef}
                zoneArmMs={ZONE_ARM_MS}
                authorMode={authorMode}
                toggleZoneExpanded={toggleZoneExpanded}
                onFlyToZone={handleFlyToZone}
                onPushSubMapToEdit={handlePushSubMapToEdit}
                onZoneClick={triggerZonePulse}
                showToast={showToast}
                onClose={() => setZonesOpen(false)}
              />
            )}

            {filtersOpen && (
              <IconFiltersPopover
                panelRef={filtersPanelRef}
                top={headerHeight + 8}
                maxHeight={`calc(var(--canvas-height-px, 100dvh) - ${headerHeight + navPadding + 40}px)`}
                iconDrafts={iconDrafts}
                getIconCatalogEntry={getIconCatalogEntry}
                iconFiltersOff={iconFiltersOff}
                toggleIconFilter={toggleIconFilter}
                l3ZoneCount={l3Zones.length}
                onClose={() => setFiltersOpen(false)}
              />
            )}

            {/* ── Zone author panel ── */}
            {authorMode && panelCollapsed && (
              <button
                type="button"
                className="zone-author-collapsed"
                onClick={() => setPanelCollapsed(false)}
                aria-label="Expand zone author panel"
              >
                <span className="count">{authorPoints.length}</span>
                <span className="hint">pt{authorPoints.length === 1 ? '' : 's'}</span>
                {editingId && <span className="chip">edit</span>}
                <span className="caret">▲</span>
              </button>
            )}
            {authorMode && !panelCollapsed && (
              <div className="zone-author-panel" role="group" aria-label="Zone author controls">
                <div className="panel-top-row">
                  {editingId ? (
                    <div className="edit-banner">
                      Editing <span className="edit-banner-name">{drafts.find(d => d.id === editingId)?.name || editingId}</span>
                    </div>
                  ) : <div style={{ flex: 1 }} />}
                  <button
                    type="button"
                    className="zone-author-btn is-active"
                    onClick={() => {
                      // Exit the editor entirely — clears author-unlock so the
                      // panel disappears. Triple-tap the card header to re-enter.
                      try { localStorage.setItem(AUTHOR_FLAG_KEY, ''); } catch {}
                      setAuthorEnabled(false);
                      setAuthorMode(false);
                      setAuthorPoints([]);
                      setJsonSnippet('');
                      showToast('Zone author locked');
                    }}
                    aria-label="Lock editor"
                    title="Lock editor (triple-tap map header to re-open)"
                    style={{ padding: '2px 8px' }}
                  >
                    Lock editor
                  </button>
                  <button
                    type="button"
                    className="zone-author-btn"
                    onClick={() => setPanelCollapsed(true)}
                    aria-label="Minimize panel"
                    title="Minimize"
                    style={{ padding: '2px 8px' }}
                  >▼</button>
                </div>
                <div className="row">
                  <span className="count">{authorPoints.length}</span>
                  <span className="hint">point{authorPoints.length === 1 ? '' : 's'} · tap to add · drag pts · tap pt = delete · + = insert</span>
                </div>
                <div className="row">
                  <div className="field">
                    <label htmlFor="zone-author-name">Name</label>
                    <input
                      id="zone-author-name"
                      type="text"
                      value={draftName}
                      onChange={(e) => setDraftName(e.target.value)}
                      placeholder={`New zone ${drafts.length + 1}`}
                      autoComplete="off"
                    />
                  </div>
                  <div className="field">
                    <label htmlFor="zone-author-parent">Parent (optional)</label>
                    <select
                      id="zone-author-parent"
                      value={draftParent}
                      onChange={(e) => setDraftParent(e.target.value)}
                    >
                      <option value="">— None (top-level)</option>
                      {parentOptionsTree.length > 0 && (
                        <optgroup label="Existing zones (indented = sub-zone)">
                          {parentOptionsTree.map(p => (
                            <option key={p.id} value={p.id}>
                              {'\u00A0\u00A0'.repeat(p.depth)}
                              {p.depth > 0 ? '└ ' : ''}
                              {p.kind === 'draft' ? '[draft] ' : ''}
                              {p.name}
                              {p.level != null ? `  · L${p.level}` : ''}
                            </option>
                          ))}
                        </optgroup>
                      )}
                    </select>
                  </div>
                </div>
                <div className="row">
                  <div className="field" style={{ flex: '0 0 90px' }}>
                    <label htmlFor="zone-author-level">Level (1–50)</label>
                    <input
                      id="zone-author-level"
                      type="number"
                      inputMode="numeric"
                      min="1"
                      max="50"
                      step="1"
                      value={draftLevel}
                      onChange={(e) => setDraftLevel(e.target.value)}
                      placeholder="—"
                      autoComplete="off"
                    />
                  </div>
                </div>
                <div className="row">
                  <button
                    className={`zone-author-btn ${pointMode ? 'is-active' : ''}`}
                    type="button"
                    aria-pressed={pointMode}
                    onClick={() => { setPointMode(v => !v); if (!pointMode) { setFreehandMode(false); setPaintMode(false); } }}
                  >
                    {pointMode ? 'Point: on' : 'Point'}
                  </button>
                  <button
                    className={`zone-author-btn ${freehandMode ? 'is-active' : ''}`}
                    type="button"
                    aria-pressed={freehandMode}
                    onClick={() => { setFreehandMode(v => !v); if (!freehandMode) { setPointMode(false); setPaintMode(false); } }}
                  >
                    {freehandMode ? 'Freehand: on' : 'Freehand'}
                  </button>
                  <button className="zone-author-btn" type="button" onClick={handleUndo} disabled={authorPoints.length === 0}>Undo</button>
                  <button className="zone-author-btn" type="button" onClick={handleClear} disabled={authorPoints.length === 0}>Clear</button>
                  <button className="zone-author-btn is-active" type="button" onClick={handleSaveDraft} disabled={authorPoints.length < 3}>
                    {editingId ? 'Update zone' : 'Save zone'}
                  </button>
                  {pointMode && editingId && (
                    <button
                      className="zone-author-btn"
                      type="button"
                      onClick={handleSaveSubzone}
                      disabled={authorPoints.length < 3}
                      title="Save current points as a child zone of the one being edited"
                    >
                      Save as subzone
                    </button>
                  )}
                  {editingId && (
                    <button className="zone-author-btn is-danger" type="button" onClick={handleCancelEdit}>Cancel edit</button>
                  )}
                </div>

                {/* ── Ocean paint tool — blot over map artefacts ── */}
                <div className="divider" />
                <div className="drafts-head"><span>Ocean paint ({paintStrokes.length})</span></div>
                <div className="row">
                  <button
                    className={`zone-author-btn ${paintMode ? 'is-active' : ''}`}
                    type="button"
                    aria-pressed={paintMode}
                    onClick={() => { setPaintMode(v => !v); if (!paintMode) { setFreehandMode(false); } }}
                  >
                    {paintMode ? 'Paint: on' : 'Paint'}
                  </button>
                  <button
                    className="zone-author-btn"
                    type="button"
                    onClick={handlePaintUndo}
                    disabled={paintStrokes.length === 0}
                  >Undo stroke</button>
                  <button
                    className="zone-author-btn"
                    type="button"
                    onClick={handleCopyPaintJson}
                    disabled={paintStrokes.length === 0}
                    title="Copy stroke JSON to paste to Claude so paint can be baked into the tiles"
                  >Copy JSON</button>
                  <button
                    className="zone-author-btn is-danger"
                    type="button"
                    onClick={handlePaintClear}
                    disabled={paintStrokes.length === 0}
                  >Clear all</button>
                </div>
                <div className="row">
                  <div className="field" style={{ flex: '1 1 0' }}>
                    <label>Brush ({paintBrushSize}px native)</label>
                    <input
                      type="range"
                      min="4"
                      max="200"
                      step="1"
                      value={paintBrushSize}
                      onChange={(e) => setPaintBrushSize(+e.target.value || 40)}
                      className="overlay-slider"
                    />
                  </div>
                  <button
                    className={`zone-author-btn ${paintBrushMode === 'solid' ? 'is-active' : ''}`}
                    type="button"
                    aria-pressed={paintBrushMode === 'solid'}
                    onClick={() => setPaintBrushMode('solid')}
                    title="Hard-edged blot — paints a flat, fully opaque shape"
                  >Solid</button>
                  <button
                    className={`zone-author-btn ${paintBrushMode === 'fade' ? 'is-active' : ''}`}
                    type="button"
                    aria-pressed={paintBrushMode === 'fade'}
                    onClick={() => setPaintBrushMode('fade')}
                    title="Soft-edged blot — paints translucent ocean colour, fading to transparent at the brush edge"
                  >Fade</button>
                  <button
                    className={`zone-author-btn ${paintBrushMode === 'blur' ? 'is-active' : ''}`}
                    type="button"
                    aria-pressed={paintBrushMode === 'blur'}
                    onClick={() => setPaintBrushMode('blur')}
                    title="Blurs the map/overlay pixels already there, feathered at the brush edge — smooths a hard edge without painting any new colour"
                  >Blur</button>
                </div>

                {/* ── Config export / import — backup & restore the whole editor state ── */}
                <div className="divider" />
                <div className="drafts-head"><span>Editor config</span></div>
                <div className="row">
                  <button className="zone-author-btn" type="button" onClick={handleExportConfig}>
                    Export JSON
                  </button>
                  <button className="zone-author-btn" type="button" onClick={handleImportConfigClick}>
                    Import JSON
                  </button>
                  <input
                    ref={configImportInputRef}
                    type="file"
                    accept="application/json,.json"
                    style={{ display: 'none' }}
                    onChange={handleImportConfigFile}
                  />
                </div>
                <div className="hint" style={{ fontSize: 10, opacity: 0.7 }}>
                  Exports zones + sub-maps + paint as one JSON. Paste that file into chat and I can ship it as an app-wide seed.
                </div>

                {drafts.length > 0 && (
                  <>
                    <div className="divider" />
                    <div className="drafts-head">
                      <span>Drafts ({drafts.length})</span>
                      <div className="row" style={{ gap: 4 }}>
                        <button className="zone-author-btn" type="button" onClick={handleCopyAll}>Copy all</button>
                        <button className="zone-author-btn is-danger" type="button" onClick={handleClearDrafts}>Clear drafts</button>
                      </div>
                    </div>
                    {/* Bulk-select buttons — tick every zone / subzone / in-tree
                        icon in one click. Clicking again deselects that set. */}
                    {(() => {
                      const zoneIds = drafts.filter(isZoneDraft).map(d => d.id);
                      const subIds = drafts.filter(isSubzoneDraft).map(d => d.id);
                      const iconIds = iconDrafts.filter(ic => ic.inTree).map(ic => ic.id);
                      const allZonesSelected = zoneIds.length > 0 && zoneIds.every(id => selectedDraftIds.has(id));
                      const allSubsSelected = subIds.length > 0 && subIds.every(id => selectedDraftIds.has(id));
                      const allIconsSelected = iconIds.length > 0 && iconIds.every(id => selectedIconIds.has(id));
                      return (
                        <div className="bulk-select-bar row" style={{ gap: 4, flexWrap: 'wrap' }}>
                          <button
                            type="button"
                            className={`kuro-btn kuro-btn-sm ${allZonesSelected ? 'is-active' : ''}`}
                            disabled={zoneIds.length === 0}
                            onClick={toggleSelectAllZones}
                            title={`Select all zones (L1) — ${zoneIds.length} available`}
                          >
                            {allZonesSelected ? 'Unselect zones' : 'Select zones'} ({zoneIds.length})
                          </button>
                          <button
                            type="button"
                            className={`kuro-btn kuro-btn-sm ${allSubsSelected ? 'is-active' : ''}`}
                            disabled={subIds.length === 0}
                            onClick={toggleSelectAllSubzones}
                            title={`Select all subzones (L2+) — ${subIds.length} available`}
                          >
                            {allSubsSelected ? 'Unselect subzones' : 'Select subzones'} ({subIds.length})
                          </button>
                          <button
                            type="button"
                            className={`kuro-btn kuro-btn-sm ${allIconsSelected ? 'is-active' : ''}`}
                            disabled={iconIds.length === 0}
                            onClick={toggleSelectAllIcons}
                            title={`Select all in-tree icons — ${iconIds.length} available`}
                          >
                            {allIconsSelected ? 'Unselect icons' : 'Select icons'} ({iconIds.length})
                          </button>
                        </div>
                      );
                    })()}
                    <div className="draft-tree">
                      {draftTree.map(node => {
                        const isEditing = node.id === editingId;
                        const canonicalParentName = node.depth === 0 && node.parentId
                          ? (MAP_ZONES.find(p => p.id === node.parentId)?.name || node.parentId)
                          : null;
                        // Indent by level (L1 → 0, L2 → 14, L3 → 28). Falls
                        // back to draft tree depth when level is unset so
                        // every row still has SOME indentation.
                        const indentLevel = (node.level != null ? node.level - 1 : node.depth);
                        // Icons that have been added-to-tree under this zone.
                        // Rendered as rows directly below the zone row, indented
                        // one level deeper, so admins can see their tree
                        // composition from within the editor panel.
                        const zoneIcons = iconDrafts.filter(ic => ic.inTree && ic.zoneId === node.id);
                        const isSelected = selectedDraftIds.has(node.id);
                        return (
                          <React.Fragment key={node.id}>
                            <div
                              className={`draft-row depth-${Math.min(indentLevel, 9)} ${isEditing ? 'is-editing' : ''} ${isSelected ? 'is-selected' : ''}`}
                              style={{ paddingLeft: 4 + indentLevel * 14 }}
                            >
                              <span className="drname">
                                {indentLevel > 0 && <span className="tree-glyph">└─ </span>}
                                <input
                                  type="checkbox"
                                  className="bulk-check"
                                  checked={isSelected}
                                  onChange={() => toggleDraftSelection(node.id)}
                                  aria-label={`Select ${node.name}`}
                                  title={`Select "${node.name}" for bulk edit`}
                                />
                                <span className={`lvl-tag ${node.level == null ? 'is-unset' : ''}`}>
                                  {node.level != null ? `L${node.level}` : '—'}
                                </span>
                                <span className="drlabel">{node.name}</span>
                                {canonicalParentName && <span className="drsub">› {canonicalParentName}</span>}
                                {zoneIcons.length > 0 && (
                                  <span className="kuro-badge kuro-badge-emerald" style={{ marginLeft: 6 }}>
                                    {zoneIcons.length} icon{zoneIcons.length === 1 ? '' : 's'}
                                  </span>
                                )}
                              </span>
                              <span className="row" style={{ gap: 4 }}>
                                <button
                                  className="edit-btn"
                                  type="button"
                                  onClick={() => handleMoveDraft(node.id, -1)}
                                  disabled={node.isFirst}
                                  aria-label={`Move ${node.name} up`}
                                  title="Move up"
                                >▲</button>
                                <button
                                  className="edit-btn"
                                  type="button"
                                  onClick={() => handleMoveDraft(node.id, 1)}
                                  disabled={node.isLast}
                                  aria-label={`Move ${node.name} down`}
                                  title="Move down"
                                >▼</button>
                                {!isEditing && (
                                  <button className="edit-btn" type="button" onClick={() => handleEditDraft(node.id)} aria-label={`Edit ${node.name}`}>Edit</button>
                                )}
                                <button type="button" onClick={() => handleDeleteDraft(node.id)} aria-label={`Delete ${node.name}`}>Delete</button>
                              </span>
                            </div>
                            {zoneIcons.map(ic => {
                              const icCat = getIconCatalogEntry(ic.kind);
                              const iconSrc = icCat ? (BASE + icCat.imageUrl.split('/').map(encodeURIComponent).join('/')).replace(/([^:])\/\//g, '$1/') : null;
                              const nameText = ic.label || icCat?.name || 'Icon';
                              const iconSelected = selectedIconIds.has(ic.id);
                              return (
                                <div
                                  key={`tree-ic-${ic.id}`}
                                  className={`draft-row is-icon-row ${iconSelected ? 'is-selected' : ''}`}
                                  style={{ paddingLeft: 4 + (indentLevel + 1) * 14 }}
                                >
                                  <span className="drname">
                                    <span className="tree-glyph">└─ </span>
                                    <input
                                      type="checkbox"
                                      className="bulk-check"
                                      checked={iconSelected}
                                      onChange={() => toggleIconSelectionId(ic.id)}
                                      aria-label={`Select ${nameText}`}
                                      title={`Select "${nameText}" for bulk edit`}
                                    />
                                    {iconSrc && <img src={iconSrc} alt="" className="draft-row-icon-thumb" />}
                                    <span className="drlabel">{nameText}</span>
                                  </span>
                                  <span className="row" style={{ gap: 4 }}>
                                    <button
                                      className="edit-btn"
                                      type="button"
                                      onClick={() => handleFlyToIcon(ic)}
                                      title="Fly to"
                                      aria-label={`Fly to ${nameText}`}
                                    >⊹</button>
                                    <button
                                      className="edit-btn"
                                      type="button"
                                      onClick={() => saveIconDrafts(iconDrafts.map(x => x.id === ic.id ? { ...x, inTree: false, locked: false } : x))}
                                      title="Push back to icon editor"
                                      aria-label={`Push ${nameText} back to editor`}
                                    >✎</button>
                                  </span>
                                </div>
                              );
                            })}
                          </React.Fragment>
                        );
                      })}
                    </div>
                    {/* Bulk action bar — visible only when something is selected. */}
                    {selectionTotal > 0 && (
                      <div className="bulk-action-bar">
                        <div className="bulk-action-bar-head">
                          <span>
                            {selectionTotal} selected
                            {selectedDraftIds.size > 0 && ` · ${selectedDraftIds.size} draft${selectedDraftIds.size === 1 ? '' : 's'}`}
                            {selectedIconIds.size > 0 && ` · ${selectedIconIds.size} icon${selectedIconIds.size === 1 ? '' : 's'}`}
                          </span>
                          <button
                            type="button"
                            className="kuro-btn kuro-btn-sm"
                            onClick={clearBulkSelection}
                            title="Clear selection"
                          >
                            Clear
                          </button>
                        </div>
                        {/* Rename — find/replace across every selected name
                            (zone .name and icon .label). Empty "find" sets
                            the name to "replace" verbatim. */}
                        <div className="bulk-action-row">
                          <label className="bulk-action-label">Rename</label>
                          <input
                            type="text"
                            value={bulkFind}
                            onChange={(e) => setBulkFind(e.target.value)}
                            placeholder="find"
                            aria-label="Text to find"
                          />
                          <input
                            type="text"
                            value={bulkReplace}
                            onChange={(e) => setBulkReplace(e.target.value)}
                            placeholder="replace"
                            aria-label="Replacement text"
                          />
                          <button
                            type="button"
                            className="kuro-btn kuro-btn-sm"
                            onClick={applyBulkRename}
                            disabled={!bulkFind && !bulkReplace}
                            title={bulkFind
                              ? `Replace "${bulkFind}" with "${bulkReplace}" on ${selectionTotal} item${selectionTotal === 1 ? '' : 's'}`
                              : `Set every name to "${bulkReplace}" on ${selectionTotal} item${selectionTotal === 1 ? '' : 's'}`}
                          >
                            Apply
                          </button>
                        </div>
                        {/* Level — only zones/subzones have a level field. */}
                        <div className="bulk-action-row">
                          <label className="bulk-action-label">Level</label>
                          <select
                            value={bulkLevel}
                            onChange={(e) => setBulkLevel(e.target.value)}
                            aria-label="Bulk level"
                          >
                            <option value="">— Unset</option>
                            {[1, 2, 3, 4, 5].map(n => (
                              <option key={n} value={String(n)}>L{n}</option>
                            ))}
                          </select>
                          <button
                            type="button"
                            className="kuro-btn kuro-btn-sm"
                            onClick={applyBulkLevel}
                            disabled={!selectedDraftsHasDraft}
                            title={selectedDraftsHasDraft
                              ? `Set level on ${selectedDraftIds.size} draft${selectedDraftIds.size === 1 ? '' : 's'} (icons skipped)`
                              : 'Select at least one zone or subzone'}
                          >
                            Apply
                          </button>
                        </div>
                        {/* Floor — only icons have a direct .floor field.
                            Zone floor is derived from the parent overlay and
                            isn't settable here. Empty = "All floors". */}
                        <div className="bulk-action-row">
                          <label className="bulk-action-label">Floor</label>
                          <input
                            type="number"
                            value={bulkFloor}
                            onChange={(e) => setBulkFloor(e.target.value)}
                            placeholder="All"
                            aria-label="Bulk floor"
                            style={{ width: 80 }}
                          />
                          <button
                            type="button"
                            className="kuro-btn kuro-btn-sm"
                            onClick={applyBulkFloor}
                            disabled={!selectedHasIcon}
                            title={selectedHasIcon
                              ? `Set floor on ${selectedIconIds.size} icon${selectedIconIds.size === 1 ? '' : 's'} (drafts skipped)`
                              : 'Select at least one icon'}
                          >
                            Apply
                          </button>
                        </div>
                        <div className="hint" style={{ fontSize: 10, opacity: 0.7 }}>
                          Level applies to zones/subzones only. Floor applies to icons only — zone floors come from their parent sub-map.
                        </div>
                      </div>
                    )}
                  </>
                )}

                {jsonSnippet && (
                  <textarea
                    readOnly
                    value={jsonSnippet}
                    onFocus={(e) => e.target.select()}
                    aria-label="Zone JSON snippet"
                  />
                )}

                {/* ── Sub-maps section — only editable (unlocked or not in tree) placements. */}
                {(() => {
                  const editableOverlays = overlayDrafts.filter(ov => !(ov.locked && drafts.some(d => d.overlayId === ov.id)));
                  return (<>
                <div className="divider" />
                <div className="drafts-head">
                  <span>Sub-maps ({editableOverlays.length})</span>
                  <select
                    className="zone-author-btn"
                    value=""
                    onChange={(e) => { if (e.target.value) handleAddOverlay(e.target.value); }}
                    style={{ padding: '2px 8px', fontSize: 10, minWidth: 0 }}
                    aria-label="Add sub-map"
                  >
                    <option value="">+ Add</option>
                    {OVERLAY_CATALOG.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                {editableOverlays.map(ov => {
                  const editing = editingOverlayId === ov.id;
                  const locked = !!ov.locked;
                  const inTree = drafts.some(d => d.overlayId === ov.id);
                  const disabled = locked;
                  const cat = OVERLAY_CATALOG.find(c => c.id === ov.catalogId);
                  const off = overlayOffline[ov.catalogId] || {};
                  const offTotal = off.total || 0;
                  const offCached = off.cached || 0;
                  const downloading = !!off.downloading;
                  const fullyCached = offTotal > 0 && offCached >= offTotal;
                  const offlineLabel = downloading
                    ? `${Math.round((off.done / Math.max(offTotal, 1)) * 100)}%`
                    : fullyCached ? '✓ Offline' : 'Save offline';
                  const offlineTitle = downloading
                    ? `Downloading ${off.done}/${offTotal} tiles`
                    : fullyCached ? `All ${offTotal} tiles cached — click to remove` : `Download ${offTotal || '?'} tiles for offline use`;
                  return (
                    <div key={ov.id} className={`overlay-row ${editing ? 'is-active' : ''} ${locked ? 'is-locked' : ''}`}>
                      <div className="overlay-row-head">
                        <span className="drname">
                          <span className={`lvl-tag ${ov.floor === viewFloor ? '' : 'is-unset'}`}>F{ov.floor ?? 0}</span>
                          <span className="drlabel">{ov.name}</span>
                          {locked && <span className="kuro-badge kuro-badge-neutral">locked</span>}
                          {inTree && <span className="kuro-badge kuro-badge-emerald">tree</span>}
                        </span>
                        <span className="row" style={{ gap: 4 }}>
                          {cat && (
                            <button
                              type="button"
                              className="edit-btn"
                              disabled={downloading}
                              title={offlineTitle}
                              onClick={() => fullyCached ? handlePurgeOverlay(cat) : handleDownloadOverlay(cat)}
                              style={{ opacity: downloading ? 0.6 : 1 }}
                            >
                              {offlineLabel}
                            </button>
                          )}
                          <button className="edit-btn" type="button" onClick={() => setEditingOverlayId(editing ? null : ov.id)}>
                            {editing ? 'Close' : 'Edit'}
                          </button>
                          <button type="button" onClick={() => handleDeleteOverlay(ov.id)}>Del</button>
                        </span>
                      </div>
                      {editing && (
                        <div className="overlay-controls">
                          <div className="row">
                            <button
                              type="button"
                              className={`zone-author-btn ${locked ? 'is-active' : ''}`}
                              aria-pressed={locked}
                              onClick={() => handleUpdateOverlay(ov.id, { locked: !locked })}
                              style={{ flex: '1 1 0' }}
                            >
                              {locked ? 'Unlock' : 'Lock'}
                            </button>
                            <button
                              type="button"
                              className={`zone-author-btn ${inTree ? 'is-active' : ''}`}
                              aria-pressed={inTree}
                              onClick={() => inTree ? handleRemoveOverlayFromTree(ov.id) : handleAddOverlayToTree(ov.id)}
                              style={{ flex: '1 1 0' }}
                            >
                              {inTree ? 'Remove from tree' : 'Add to tree'}
                            </button>
                          </div>
                          {locked && (
                            <div className="hint" style={{ fontSize: 10, opacity: 0.7 }}>
                              Locked — tap Unlock to modify, or Del to remove and re-add.
                            </div>
                          )}
                          <div className="row">
                            <div className="field" style={{ flex: '1 1 0' }}>
                              <label>X</label>
                              <input type="number" value={ov.center[0]} disabled={disabled}
                                onChange={(e) => handleUpdateOverlay(ov.id, { center: [Math.round(+e.target.value) || 0, ov.center[1]] })} />
                            </div>
                            <div className="field" style={{ flex: '1 1 0' }}>
                              <label>Y</label>
                              <input type="number" value={ov.center[1]} disabled={disabled}
                                onChange={(e) => handleUpdateOverlay(ov.id, { center: [ov.center[0], Math.round(+e.target.value) || 0] })} />
                            </div>
                            <div className="field" style={{ flex: '0 0 80px' }}>
                              <label>Floor</label>
                              <div className="row" style={{ gap: 2 }}>
                                <button className="zone-author-btn" type="button" disabled={disabled} onClick={() => handleUpdateOverlay(ov.id, { floor: (ov.floor ?? 0) - 1 })} style={{ padding: '1px 6px' }}>−</button>
                                <span style={{ minWidth: 28, textAlign: 'center' }}>{ov.floor ?? 0}</span>
                                <button className="zone-author-btn" type="button" disabled={disabled} onClick={() => handleUpdateOverlay(ov.id, { floor: (ov.floor ?? 0) + 1 })} style={{ padding: '1px 6px' }}>+</button>
                              </div>
                            </div>
                          </div>
                          <div className="row">
                            <div className="field" style={{ flex: '1 1 0' }}>
                              <label>Rotation ({Math.round(ov.rotation ?? 0)}°)</label>
                              <input type="range" min="0" max="360" step="1" value={ov.rotation ?? 0} disabled={disabled}
                                onChange={(e) => handleUpdateOverlay(ov.id, { rotation: +e.target.value })}
                                className="overlay-slider" />
                            </div>
                          </div>
                          <div className="row">
                            <div className="field" style={{ flex: '1 1 0' }}>
                              <label>Scale ({(ov.scale ?? 1).toFixed(2)}×)</label>
                              <input type="range" min="0.1" max="5" step="0.05" value={ov.scale ?? 1} disabled={disabled}
                                onChange={(e) => handleUpdateOverlay(ov.id, { scale: +e.target.value })}
                                className="overlay-slider" />
                            </div>
                          </div>
                          <div className="row">
                            <div className="field" style={{ flex: '1 1 0' }}>
                              <label>Opacity ({Math.round((ov.opacity ?? 1) * 100)}%)</label>
                              <input type="range" min="0.1" max="1" step="0.05" value={ov.opacity ?? 1} disabled={disabled}
                                onChange={(e) => handleUpdateOverlay(ov.id, { opacity: +e.target.value })}
                                className="overlay-slider" />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
                  </>);
                })()}

                {/* ── Map icons section — admin-only authoring surface for
                    placing interactive icons on the map. Each icon =
                      { id, kind, category, x, y, label }
                    where `kind` is an id from mapIconCatalog.js (drives
                    which PNG renders at that location). `category`
                    defaults from the catalog entry but can be overridden
                    per-draft; it drives the Hexagon filter popover.
                    Persists to localStorage 'ww-icon-drafts'. */}
                <div className="divider" />
                <div className="drafts-head">
                  <span>Map icons ({iconDrafts.length})</span>
                  {(() => {
                    // "Visible" = still in the author list (inTree=false).
                    const visible = iconDrafts.filter(ic => !ic.inTree);
                    const lockableCount = visible.filter(ic => !ic.locked).length;
                    const treeAddableCount = visible.filter(ic => ic.zoneId).length;
                    const allVisibleLocked = visible.length > 0 && lockableCount === 0;
                    return (
                      <div className="row" style={{ gap: 4, flex: '0 0 auto' }}>
                        <button
                          type="button"
                          className="kuro-btn kuro-btn-sm"
                          disabled={visible.length === 0}
                          title={allVisibleLocked
                            ? 'Unlock every visible icon (restores editing)'
                            : `Lock ${lockableCount} icon${lockableCount === 1 ? '' : 's'} — stays in the list but fields disabled`}
                          onClick={() => {
                            const nextLocked = !allVisibleLocked;
                            // Toggle locked on visible (non-inTree) drafts only —
                            // in-tree drafts already have locked=true implicitly.
                            saveIconDrafts(iconDrafts.map(ic => ic.inTree ? ic : ({ ...ic, locked: nextLocked })));
                          }}
                        >
                          {allVisibleLocked ? 'Unlock all' : 'Lock all'}
                        </button>
                        <button
                          type="button"
                          className="kuro-btn kuro-btn-sm"
                          disabled={treeAddableCount === 0}
                          title={`Move ${treeAddableCount} icon${treeAddableCount === 1 ? '' : 's'} to the Regions tree (locks them + hides from this list). Icons without a zone are skipped.`}
                          onClick={() => {
                            // Add-to-tree = set inTree=true AND locked=true on
                            // every visible icon that has a zoneId. Orphans
                            // (no zoneId) are left in the list untouched.
                            const next = iconDrafts.map(ic => (!ic.inTree && ic.zoneId)
                              ? { ...ic, inTree: true, locked: true }
                              : ic);
                            saveIconDrafts(next);
                            // If multi-place's template icon just got moved
                            // into the tree, stop the mode instead of
                            // leaving it stuck spawning clones from an icon
                            // that no longer lives in the temporary list.
                            if (multiPlaceFromId && next.find(ic => ic.id === multiPlaceFromId)?.inTree) {
                              setMultiPlaceFromId(null);
                            }
                          }}
                        >
                          Add all
                        </button>
                        <button
                          type="button"
                          className="kuro-btn kuro-btn-sm"
                          onClick={() => {
                            const id = `icon-${Date.now().toString(36)}-${Math.floor(Math.random() * 1e4).toString(36)}`;
                            const firstKind = MAP_ICON_CATALOG[0];
                            const next = [...iconDrafts, {
                              id,
                              kind: firstKind?.id || '',
                              category: firstKind?.category || 'Uncategorised',
                              subcategory: firstKind?.subcategory || '',
                              x: MAP_W / 2,
                              y: MAP_H / 2,
                              label: '',
                              locked: false,
                            }];
                            saveIconDrafts(next);
                          }}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}
                        >
                          <Plus size={12} /> Add
                        </button>
                      </div>
                    );
                  })()}
                </div>
                {iconDrafts.length === 0 && (
                  <div className="hint" style={{ fontSize: 10, padding: '4px 0' }}>
                    No icons yet. Add one to get started. Categories show up in the Hexagon filter menu.
                  </div>
                )}
                {iconDrafts.filter(ic => !ic.inTree).map((ic) => {
                  const cat = getIconCatalogEntry(ic.kind);
                  const base = (import.meta.env.BASE_URL || '/');
                  const iconSrc = cat ? (base + cat.imageUrl.split('/').map(encodeURIComponent).join('/')).replace(/([^:])\/\//g, '$1/') : null;
                  const patchIcon = (patch) => saveIconDrafts(iconDrafts.map(x => x.id === ic.id ? { ...x, ...patch } : x));
                  const isPlacing = placingIconId === ic.id;
                  const isMulti = multiPlaceFromId === ic.id;
                  const locked = !!ic.locked;
                  const disabled = locked;
                  return (
                    <div key={ic.id} className={`icon-row ${isPlacing || isMulti ? 'is-active' : ''} ${locked ? 'is-locked' : ''}`}>
                      {/* Row 1 — preview, kind dropdown, per-icon actions */}
                      <div className="row">
                        <div className="icon-preview" aria-hidden="true">
                          {iconSrc && <img src={iconSrc} alt="" />}
                        </div>
                        <div className="field" style={{ flex: '1 1 0' }}>
                          <label>Kind {locked && <span className="kuro-badge kuro-badge-neutral" style={{ marginLeft: 4 }}>locked</span>}</label>
                          <select
                            value={ic.kind || ''}
                            disabled={disabled}
                            onChange={(e) => {
                              const nextCat = getIconCatalogEntry(e.target.value);
                              const prevCat = getIconCatalogEntry(ic.kind);
                              patchIcon({
                                kind: e.target.value,
                                // Auto-sync category/subcategory when user hadn't customised.
                                category: (!ic.category || ic.category === prevCat?.category)
                                  ? (nextCat?.category || 'Uncategorised')
                                  : ic.category,
                                subcategory: (!ic.subcategory || ic.subcategory === prevCat?.subcategory)
                                  ? (nextCat?.subcategory || '')
                                  : ic.subcategory,
                              });
                            }}
                          >
                            {MAP_ICON_CATALOG.map(c => (
                              <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                          </select>
                        </div>
                        <button
                          type="button"
                          className="kuro-btn kuro-btn-sm kuro-btn-icon"
                          onClick={() => handleFlyToIcon(ic)}
                          title={`Zoom to ${ic.label || cat?.name || 'icon'}`}
                          aria-label="Zoom to icon"
                        >
                          <LocateFixed size={14} />
                        </button>
                        <button
                          type="button"
                          className="kuro-btn kuro-btn-sm kuro-btn-icon is-danger"
                          disabled={disabled}
                          onClick={() => saveIconDrafts(iconDrafts.filter(x => x.id !== ic.id))}
                          title="Delete icon"
                          aria-label="Delete icon"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>

                      {/* Row 2a — zone attribution (auto-detected on place) */}
                      <div className="row">
                        <div className="field" style={{ flex: '1 1 auto' }}>
                          <label>Zone</label>
                          <select
                            value={ic.zoneId || ''}
                            disabled={disabled}
                            onChange={(e) => {
                              const zoneId = e.target.value || null;
                              const zone = zoneId ? zoneOptions.find(o => o.id === zoneId)?.zone : null;
                              const floor = zone ? resolveZoneFloor(zone) : null;
                              patchIcon({
                                zoneId,
                                ...(floor != null ? { floor } : {}),
                              });
                            }}
                          >
                            <option value="">— None (free placement)</option>
                            {zoneOptions.map(o => (
                              <option key={o.id} value={o.id}>{o.label}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Row 2b — category + subcategory + label */}
                      <div className="row">
                        <div className="field" style={{ flex: '1 1 0' }}>
                          <label>Category</label>
                          <input
                            type="text"
                            value={ic.category || ''}
                            disabled={disabled}
                            onChange={(e) => patchIcon({ category: e.target.value || 'Uncategorised' })}
                            placeholder="Resonance"
                          />
                        </div>
                        <div className="field" style={{ flex: '1 1 0' }}>
                          <label>Subcategory</label>
                          <input
                            type="text"
                            value={ic.subcategory || ''}
                            disabled={disabled}
                            onChange={(e) => patchIcon({ subcategory: e.target.value })}
                            placeholder="e.g. Nexus"
                          />
                        </div>
                      </div>
                      <div className="row">
                        <div className="field" style={{ flex: '1 1 0' }}>
                          <label>Label</label>
                          <input type="text" value={ic.label || ''}
                            disabled={disabled}
                            onChange={(e) => patchIcon({ label: e.target.value })} />
                        </div>
                      </div>

                      {/* Row 3 — place-on-map single / multi + X/Y + floor */}
                      <div className="row">
                        <button
                          type="button"
                          className={`kuro-btn kuro-btn-sm ${isPlacing ? 'is-active' : ''}`}
                          disabled={disabled || isMulti}
                          onClick={() => setPlacingIconId(isPlacing ? null : ic.id)}
                          title={isPlacing ? 'Cancel placement' : 'Click on map to place'}
                          style={{ flex: '1 1 auto' }}
                        >
                          {isPlacing ? 'Click on map…' : 'Place on map'}
                        </button>
                        <button
                          type="button"
                          className={`kuro-btn kuro-btn-sm ${isMulti ? 'is-active' : ''}`}
                          disabled={disabled || isPlacing}
                          onClick={() => setMultiPlaceFromId(isMulti ? null : ic.id)}
                          title={isMulti ? 'Stop placing (Esc)' : 'Every map click places a clone of this icon'}
                          style={{ flex: '1 1 auto' }}
                        >
                          {isMulti ? 'Stop placing' : 'Place many'}
                        </button>
                      </div>
                      <div className="row">
                        <div className="field" style={{ flex: '0 0 72px' }}>
                          <label>X</label>
                          <input type="number" value={ic.x} disabled={disabled}
                            onChange={(e) => patchIcon({ x: Math.round(+e.target.value) || 0 })} />
                        </div>
                        <div className="field" style={{ flex: '0 0 72px' }}>
                          <label>Y</label>
                          <input type="number" value={ic.y} disabled={disabled}
                            onChange={(e) => patchIcon({ y: Math.round(+e.target.value) || 0 })} />
                        </div>
                        <div className="field" style={{ flex: '1 1 auto' }}>
                          <label>Floor</label>
                          <div className="row" style={{ gap: 2 }}>
                            <button className="kuro-btn kuro-btn-sm" type="button" disabled={disabled}
                              onClick={() => patchIcon({ floor: ic.floor == null ? 0 : ic.floor - 1 })}
                              style={{ padding: '1px 6px', minHeight: 24 }}>−</button>
                            <span style={{ minWidth: 28, textAlign: 'center', fontSize: 11 }}>
                              {ic.floor == null ? 'All' : ic.floor}
                            </span>
                            <button className="kuro-btn kuro-btn-sm" type="button" disabled={disabled}
                              onClick={() => patchIcon({ floor: ic.floor == null ? 0 : ic.floor + 1 })}
                              style={{ padding: '1px 6px', minHeight: 24 }}>+</button>
                            <button className="kuro-btn kuro-btn-sm" type="button" disabled={disabled}
                              onClick={() => patchIcon({ floor: ic.floor == null ? 0 : null })}
                              title={ic.floor == null ? 'Pin to current floor' : 'Show on all floors'}
                              style={{ padding: '1px 6px', minHeight: 24 }}>
                              {ic.floor == null ? '·' : '∞'}
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Row 4 — rotation / scale / opacity sliders */}
                      <div className="row">
                        <div className="field" style={{ flex: '1 1 0' }}>
                          <label>Rotation ({Math.round(ic.rotation ?? 0)}°)</label>
                          <input type="range" min="0" max="360" step="1"
                            value={ic.rotation ?? 0} disabled={disabled}
                            onChange={(e) => patchIcon({ rotation: +e.target.value })}
                            className="overlay-slider" />
                        </div>
                      </div>
                      <div className="row">
                        <div className="field" style={{ flex: '1 1 0' }}>
                          <label>Scale ({(ic.scale ?? 1).toFixed(2)}×)</label>
                          <input type="range" min="0.3" max="3" step="0.05"
                            value={ic.scale ?? 1} disabled={disabled}
                            onChange={(e) => patchIcon({ scale: +e.target.value })}
                            className="overlay-slider" />
                        </div>
                      </div>
                      <div className="row">
                        <div className="field" style={{ flex: '1 1 0' }}>
                          <label>Opacity ({Math.round((ic.opacity ?? 1) * 100)}%)</label>
                          <input type="range" min="0.1" max="1" step="0.05"
                            value={ic.opacity ?? 1} disabled={disabled}
                            onChange={(e) => patchIcon({ opacity: +e.target.value })}
                            className="overlay-slider" />
                        </div>
                      </div>

                      {/* Row 5 — lock (edit-mode only) + add-to-tree (moves out of list) */}
                      <div className="row">
                        <button
                          type="button"
                          className={`kuro-btn kuro-btn-sm ${locked ? 'is-active' : ''}`}
                          onClick={() => patchIcon({ locked: !locked })}
                          title={locked
                            ? 'Unlock to edit this icon again'
                            : 'Lock editing fields — icon stays in the list but can\'t be changed'}
                          style={{ flex: '1 1 auto' }}
                        >
                          {locked ? 'Unlock' : 'Lock'}
                        </button>
                        <button
                          type="button"
                          className="kuro-btn kuro-btn-sm"
                          onClick={() => {
                            patchIcon({ locked: true, inTree: true });
                            // Same as the "Add all" bulk action: don't leave
                            // multi-place stuck cloning from a template that
                            // just moved into the tree.
                            if (multiPlaceFromId === ic.id) setMultiPlaceFromId(null);
                          }}
                          disabled={!ic.zoneId}
                          title={ic.zoneId
                            ? 'Move this icon to the Regions tree (hides it from the editor list)'
                            : 'Pick a zone first so the icon has a parent in the tree'}
                          style={{ flex: '1 1 auto' }}
                        >
                          Add to tree
                        </button>
                      </div>
                    </div>
                  );
                })}

              </div>
            )}

            <div className="map-instructions-bar" style={{ position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 10 }}>
              <CardHeader>
                {authorMode
                  ? (editingId
                      ? `Editing: ${authorPoints.length} point${authorPoints.length === 1 ? '' : 's'} · tap Update to save`
                      : `Drawing: ${authorPoints.length} point${authorPoints.length === 1 ? '' : 's'} · need 3+ to save`)
                  : 'Pinch to zoom · Drag to pan · Twist with two fingers to rotate'}
              </CardHeader>
            </div>
          </div>
        </div>

      </div>
      </div>
    </>
  );
}
