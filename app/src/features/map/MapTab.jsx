import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CardHeader } from '../../shared/components/Card.jsx';
import { MAP_ZONES } from '../../data/mapZones.js';
import { OVERLAY_CATALOG, loadOverlayDrafts, saveOverlayDrafts } from '../../data/mapOverlays.js';

const MAP_W = 12288;
const MAP_H = 16384;
const TILE_SIZE = 256;
const NATIVE_ZOOM = 6;  // zoom level at which the 16384×16384 tile pyramid is defined
const MAX_ZOOM = 10;    // how far the user can zoom in (tiles upscale beyond NATIVE_ZOOM)
const MAP_BG = '#062634';
const MAP_BG_TRANSPARENT = 'rgba(6, 38, 52, 0.55)';
const BASE = import.meta.env.BASE_URL || '/';
const AUTHOR_FLAG_KEY = 'ww-zone-author';
const DRAFTS_KEY = 'ww-zone-drafts';
const PAINT_KEY = 'ww-paint-strokes';

const COLOR_CANON = '#edaf18';   // brand gold — canonical zones from mapZones.js
const COLOR_DRAFT = '#38bdf8';   // cyan — session drafts
const COLOR_ACTIVE = '#edaf18';  // gold dashed — in-progress polygon

function loadDrafts() {
  if (typeof localStorage === 'undefined') return [];
  try {
    const raw = localStorage.getItem(DRAFTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch { return []; }
}
function saveDrafts(list) {
  try { localStorage.setItem(DRAFTS_KEY, JSON.stringify(list)); } catch {}
}
function loadPaintStrokes() {
  if (typeof localStorage === 'undefined') return [];
  try {
    const raw = localStorage.getItem(PAINT_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch { return []; }
}
function savePaintStrokes(list) {
  try { localStorage.setItem(PAINT_KEY, JSON.stringify(list)); } catch {}
}
function slugify(s) {
  return String(s || '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || `zone-${Date.now().toString(36)}`;
}

// Ramer–Douglas–Peucker polyline simplification. Input/output: [[x,y], ...].
// `epsilon` is the max perpendicular distance (same units as input) a dropped
// point may lie from the kept segment.
function rdpSimplify(points, epsilon) {
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

export default function MapTab({ navPadding = 80 }) {
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
  const [authorEnabled, setAuthorEnabled] = useState(() => {
    if (typeof localStorage === 'undefined') return false;
    return localStorage.getItem(AUTHOR_FLAG_KEY) === '1';
  });
  const [authorMode, setAuthorMode] = useState(false);
  const [freehandMode, setFreehandMode] = useState(false);
  const freehandTraceRef = useRef(null);
  // Ocean-paint tool state — tap/drag to blot map artefacts with ocean color.
  const [paintMode, setPaintMode] = useState(false);
  const [paintBrushSize, setPaintBrushSize] = useState(40);       // radius in native px
  const [paintStrokes, setPaintStrokes] = useState(loadPaintStrokes);
  const paintCanvasRef = useRef(null);
  const paintDrawRef = useRef(() => {});
  const paintLiveRef = useRef(null); // { points: [[x,y]...], size } while drawing
  const [authorPoints, setAuthorPoints] = useState([]);
  const [drafts, setDrafts] = useState(loadDrafts);
  const [draftName, setDraftName] = useState('');
  const [draftParent, setDraftParent] = useState('');
  const [draftLevel, setDraftLevel] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [jsonSnippet, setJsonSnippet] = useState('');
  const [toast, setToast] = useState('');
  const [panelCollapsed, setPanelCollapsed] = useState(false);

  // Sub-map overlay state
  const [viewFloor, setViewFloor] = useState(0);
  const [overlayDrafts, setOverlayDrafts] = useState(loadOverlayDrafts);
  const [editingOverlayId, setEditingOverlayId] = useState(null);
  const [expandedZones, setExpandedZones] = useState(() => new Set());
  const [zoneSelectorCollapsed, setZoneSelectorCollapsed] = useState(false);
  const overlayCanvasRef = useRef(null);           // single <canvas> shared by all overlays
  const overlayImagesRef = useRef(new Map());      // catalogId → HTMLImageElement (decoded source)
  const overlayLiveRef = useRef(null);             // live override during gesture: { id, center?, scale?, rotation? }
  const overlayRedrawRef = useRef(() => {});       // exposes draw() to the gesture effect

  const tileLayerRef = useRef(null);
  const gestureActiveRef = useRef(false);

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
    // Stable order: by level then name
    for (const list of byParent.values()) {
      list.sort((a, b) => (a.level ?? 99) - (b.level ?? 99) || (a.name || '').localeCompare(b.name || ''));
    }
    return byParent;
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

  const switchFloorForZone = useCallback((zone) => {
    const floor = resolveZoneFloor(zone);
    if (floor != null) setViewFloor(floor);
    else setViewFloor(0); // fallback: any zone with no linked floor → ground
  }, [resolveZoneFloor]);

  const handleFlyToZone = useCallback((zone) => {
    const map = mapRef.current;
    const L = leafletRef.current;
    if (!map) return;
    // Switch to the zone's floor if it is linked to a placed sub-map overlay.
    switchFloorForZone(zone);
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
  }, [switchFloorForZone]);

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
        out.push({ ...c, depth, isLast: i === kids.length - 1 });
        walk(c.id, depth + 1);
      });
    };
    walk(null, 0);
    return out;
  }, [drafts]);

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
      // authoring zones near the perimeter.
      const EDGE_PAD_PX = 300;
      const edgePad = pxToLat(EDGE_PAD_PX) * scale;
      const paddedBounds = L.latLngBounds(
        [southWest.lat - bottomPad - edgePad, southWest.lng - edgePad],
        [northEast.lat + topPad + edgePad, northEast.lng + edgePad]
      );

      map.setMaxBounds(paddedBounds);
      map.fitBounds(bounds, { paddingTopLeft: [0, headerH], paddingBottomRight: [0, footerH] });

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

  // Author mode: attach click handler. Map drag stays enabled (one-finger pan).
  // Leaflet distinguishes click (tap) from drag automatically.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) return;
    if (!authorMode) return;
    if (freehandMode) return;
    if (paintMode) return;
    if (map.doubleClickZoom) map.doubleClickZoom.disable();
    const handler = (e) => {
      if (gestureActiveRef.current) return;
      map.closePopup();
      const pt = map.project(e.latlng, NATIVE_ZOOM);
      setAuthorPoints(prev => [...prev, [Math.round(pt.x), Math.round(pt.y)]]);
    };
    map.on('click', handler);
    return () => {
      map.off('click', handler);
      if (map.doubleClickZoom) map.doubleClickZoom.enable();
    };
  }, [authorMode, freehandMode, paintMode, mapReady]);

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
        return [
          Math.max(0, Math.min(MAP_W, Math.round(nat.x))),
          Math.max(0, Math.min(MAP_H, Math.round(nat.y))),
        ];
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
  }, [mapReady, authorMode, freehandMode]);

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
    const group = L.layerGroup();
    const latLngs = authorPoints.map(([x, y]) => map.unproject([x, y], NATIVE_ZOOM));

    // Outline
    if (latLngs.length >= 3) {
      L.polygon(latLngs, {
        color: COLOR_ACTIVE, weight: 1.5, fillColor: COLOR_ACTIVE, fillOpacity: 0.12,
        dashArray: '4 3', className: 'zone-author-poly', interactive: false,
      }).addTo(group);
    } else if (latLngs.length >= 2) {
      L.polyline(latLngs, {
        color: COLOR_ACTIVE, weight: 1.5, dashArray: '4 3', className: 'zone-author-poly', interactive: false,
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
      const marker = L.marker(ll, { draggable: true, icon, autoPan: false, keyboard: false });
      marker.on('dragend', (e) => {
        const np = map.project(e.target.getLatLng(), NATIVE_ZOOM);
        const clamped = [
          Math.max(0, Math.min(MAP_W, Math.round(np.x))),
          Math.max(0, Math.min(MAP_H, Math.round(np.y))),
        ];
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
        const ghost = L.marker(midLL, { icon: ghostIcon, keyboard: false });
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
  }, [authorMode, authorPoints, mapReady]);

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
      }).addTo(group);
      const parentName = isSub
        ? (MAP_ZONES.find(p => p.id === z.parentId)?.name
           || drafts.find(p => p.id === z.parentId)?.name
           || z.parentId)
        : null;
      const title = parentName ? `${parentName} › ${z.name || z.id}` : (z.name || z.id);
      poly.bindTooltip(`[draft] ${title}`, { sticky: true, className: 'zone-tooltip zone-tooltip-draft' });
    });
    group.addTo(map);
    draftsLayerRef.current = group;
  }, [drafts, editingId, mapReady, authorMode]);

  // Sub-map overlay renderer — one shared <canvas>, sized to the map viewport.
  // At every map move/zoom we clear and redraw each visible placement onto the
  // canvas via ctx.drawImage with translate/rotate/scale. Because the canvas
  // never exceeds viewport dimensions, the browser never has to subdivide an
  // oversize compositor layer and the close-zoom perspective warp can't occur.
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

    // Pre-decode any source images we don't have yet
    const visible = overlayDrafts.filter(ov => (ov.floor ?? 0) === viewFloor);
    visible.forEach(ov => {
      const cat = OVERLAY_CATALOG.find(c => c.id === ov.catalogId);
      if (!cat) return;
      if (!overlayImagesRef.current.has(cat.id)) {
        const img = new Image();
        img.decoding = 'async';
        img.src = (BASE + cat.imageUrl).replace(/\/\//g, '/');
        img.onload = () => overlayRedrawRef.current();
        overlayImagesRef.current.set(cat.id, img);
      }
    });

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
        const img = overlayImagesRef.current.get(cat.id);
        if (!img || !img.complete || img.naturalWidth === 0) return;

        const s = ov.scale ?? 1;
        const rotRad = ((ov.rotation || 0) * Math.PI) / 180;
        const zoomFactor = Math.pow(2, map.getZoom() - NATIVE_ZOOM);
        const displayScale = s * zoomFactor;
        // Prefer the decoded image's real dimensions; fall back to the
        // catalog entry if the image hasn't loaded yet.
        const nw = img.naturalWidth || cat.naturalWidth;
        const nh = img.naturalHeight || cat.naturalHeight;
        const centerPt = map.latLngToContainerPoint(map.unproject(ov.center, NATIVE_ZOOM));

        ctx.save();
        ctx.globalAlpha = ov.opacity ?? 1;
        ctx.translate(centerPt.x, centerPt.y);
        ctx.rotate(rotRad);
        ctx.scale(displayScale, displayScale);
        ctx.drawImage(img, -nw / 2, -nh / 2, nw, nh);
        ctx.restore();
      });
    };
    overlayRedrawRef.current = draw;

    map.on('move zoom viewreset zoomend resize', draw);
    draw();

    return () => {
      map.off('move zoom viewreset zoomend resize', draw);
    };
  }, [overlayDrafts, viewFloor, mapReady]);

  // Cleanup shared canvas + image cache on unmount
  useEffect(() => {
    return () => {
      if (overlayCanvasRef.current) {
        overlayCanvasRef.current.remove();
        overlayCanvasRef.current = null;
      }
      overlayImagesRef.current.clear();
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
      // DEBUG: z-index 1000 + translucent red bg proves the canvas is mounted
      // and sized. Remove once paint is confirmed visible.
      canvas.style.cssText = 'position:absolute;top:0;left:0;pointer-events:none;z-index:1000;background:rgba(255,0,0,0.18);outline:2px solid magenta;';
      paintCanvasRef.current = canvas;
    }
    // Defensive: make sure the canvas is actually in the map container —
    // some Leaflet flows (tileLayer reset, invalidateSize) could orphan it.
    if (canvas.parentNode !== container) {
      container.appendChild(canvas);
    }
    // Log once per mount so we can see in console if anything's weird.
    // eslint-disable-next-line no-console
    console.log('[paint] canvas mounted', {
      inDom: document.body.contains(canvas),
      parent: canvas.parentNode && canvas.parentNode.className,
      clientW: container.clientWidth,
      clientH: container.clientHeight,
      canvasW: canvas.width,
      canvasH: canvas.height,
      computedZ: getComputedStyle(canvas).zIndex,
      computedDisplay: getComputedStyle(canvas).display,
      computedOpacity: getComputedStyle(canvas).opacity,
    });

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
      if (!ctx) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, cw, ch);

      // DEBUG beacon — magenta + label. Lets the user confirm the paint
      // canvas is visible and receiving draw calls at all. If this dot is
      // visible but strokes are not, paint == ocean colour and we have a
      // contrast problem, not a rendering one. If this dot is ALSO invisible,
      // the canvas is hidden/covered and we need to fix that first. Safe to
      // delete once paint is confirmed working.
      ctx.save();
      ctx.globalAlpha = 1;
      ctx.fillStyle = '#ff00ff';
      ctx.fillRect(4, 4, 16, 16);
      ctx.font = '11px monospace';
      ctx.fillStyle = '#fff';
      ctx.fillText(`paint canvas ${cw}×${ch} dpr=${dpr}`, 26, 16);
      ctx.restore();

      const zoomFactor = Math.pow(2, map.getZoom() - NATIVE_ZOOM);
      const allStrokes = paintLiveRef.current
        ? [...paintStrokes, paintLiveRef.current]
        : paintStrokes;

      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.fillStyle = MAP_BG;
      ctx.strokeStyle = MAP_BG;

      allStrokes.forEach(stroke => {
        if (!stroke || !Array.isArray(stroke.points) || stroke.points.length === 0) return;
        const radiusPx = (stroke.size || 20) * zoomFactor;
        if (radiusPx < 0.5) return;

        const pts = stroke.points.map(pt => map.latLngToContainerPoint(map.unproject(pt, NATIVE_ZOOM)));

        // Three-pass overlapping strokes fake an airbrush soft edge without
        // relying on ctx.filter or shadowBlur (both have cross-browser quirks
        // that previously made the stroke invisible). Wide faint pass → soft
        // outer halo; narrow opaque pass → visible core. Always renders.
        const passes = [
          { widthMul: 2.6, alpha: 0.22 },
          { widthMul: 2.0, alpha: 0.40 },
          { widthMul: 1.4, alpha: 0.85 },
        ];
        for (const { widthMul, alpha } of passes) {
          ctx.globalAlpha = alpha;
          ctx.lineWidth = Math.max(1, radiusPx * widthMul);
          if (pts.length === 1) {
            const c = pts[0];
            ctx.beginPath();
            ctx.arc(c.x, c.y, ctx.lineWidth / 2, 0, Math.PI * 2);
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
      ctx.globalAlpha = 1;
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
      return [
        Math.max(0, Math.min(MAP_W, Math.round(nat.x))),
        Math.max(0, Math.min(MAP_H, Math.round(nat.y))),
      ];
    };

    const onDown = (e) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      drawing = true;
      pid = e.pointerId;
      paintLiveRef.current = {
        points: [containerToNative(e.clientX, e.clientY)],
        size: paintBrushSize,
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
  }, [paintMode, paintBrushSize, paintStrokes, mapReady]);

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

  // Export/import the entire editor state (zones + sub-maps + paint) as a
  // single JSON blob so it can be backed up, swapped between devices, or
  // shipped to me for hard-coding into the app as a seed.
  const configImportInputRef = useRef(null);

  const handleExportConfig = useCallback(() => {
    const payload = {
      version: 1,
      exportedAt: new Date().toISOString(),
      zoneDrafts: drafts,
      overlayDrafts: overlayDrafts,
      paintStrokes: paintStrokes,
    };
    try {
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      a.href = url;
      a.download = `map-editor-config-${stamp}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('Exported');
    } catch (err) {
      showToast('Export failed: ' + err.message);
    }
  }, [drafts, overlayDrafts, paintStrokes]);

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
  }, []);

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
      const cachedImg = overlayImagesRef.current.get(cat.id);
      const nw = (cachedImg && cachedImg.naturalWidth) || cat.naturalWidth;
      const nh = (cachedImg && cachedImg.naturalHeight) || cat.naturalHeight;
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

  // Triple-tap on header toggles author-enabled
  const handleHeaderTap = useCallback(() => {
    const now = Date.now();
    headerTapsRef.current = [...headerTapsRef.current.filter(t => now - t < 700), now];
    if (headerTapsRef.current.length >= 3) {
      headerTapsRef.current = [];
      setAuthorEnabled(prev => {
        const next = !prev;
        try { localStorage.setItem(AUTHOR_FLAG_KEY, next ? '1' : ''); } catch {}
        setToast(next ? 'Zone author unlocked' : 'Zone author locked');
        setTimeout(() => setToast(''), 1800);
        if (!next) { setAuthorMode(false); setAuthorPoints([]); setJsonSnippet(''); }
        return next;
      });
    }
  }, []);

  const toggleAuthorMode = useCallback(() => {
    setAuthorMode(prev => {
      const next = !prev;
      if (!next) {
        setAuthorPoints([]);
        setJsonSnippet('');
        setEditingId(null);
        setDraftName('');
        setDraftParent('');
        setDraftLevel('');
      }
      return next;
    });
  }, []);

  const handleUndo = () => setAuthorPoints(prev => prev.slice(0, -1));
  const handleClear = () => { setAuthorPoints([]); setJsonSnippet(''); };

  const showToast = (msg, ms = 1800) => {
    setToast(msg);
    setTimeout(() => setToast(''), ms);
  };

  const parseLevel = (raw) => {
    const trimmed = String(raw ?? '').trim();
    if (!trimmed) return undefined;
    const n = Number(trimmed);
    if (!Number.isFinite(n)) return undefined;
    return Math.max(1, Math.min(50, Math.round(n)));
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

        .map-card .kuro-header { background: ${MAP_BG_TRANSPARENT} !important; backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px); }
        .zone-polygon { transition: fill-opacity 160ms cubic-bezier(0.16, 1, 0.3, 1); cursor: pointer; }
        .zone-polygon:hover { fill-opacity: 0.22 !important; }
        .leaflet-tooltip.zone-tooltip {
          background: rgba(8, 12, 20, 0.92);
          color: ${COLOR_CANON};
          border: 1px solid rgba(237, 175, 24, 0.4);
          font-family: 'JetBrains Mono', ui-monospace, monospace;
          font-size: 11px;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          padding: 4px 8px;
          box-shadow: 0 0 12px rgba(6, 10, 24, 0.6);
        }
        .leaflet-tooltip.zone-tooltip-draft { color: ${COLOR_DRAFT}; border-color: rgba(56, 189, 248, 0.45); }
        .leaflet-tooltip.zone-tooltip::before { display: none; }
        .leaflet-popup.zone-popup .leaflet-popup-content-wrapper {
          background: rgba(8, 12, 20, 0.95); color: #e8e8e8;
          border: 1px solid rgba(237, 175, 24, 0.4);
          border-radius: 4px;
          box-shadow: 0 0 24px rgba(6, 10, 24, 0.7);
        }
        .leaflet-popup.zone-popup .leaflet-popup-tip { background: rgba(8, 12, 20, 0.95); border: 1px solid rgba(237, 175, 24, 0.4); }
        .leaflet-popup.zone-popup .zone-popup-title { font-family: 'Cinzel', serif; font-size: 14px; color: ${COLOR_CANON}; letter-spacing: 0.06em; margin-bottom: 4px; }
        .leaflet-popup.zone-popup .zone-popup-note { font-size: 12px; color: #b8b8b8; line-height: 1.45; }
        .leaflet-tooltip.zone-author-label {
          background: #080c14; color: ${COLOR_CANON}; border: 1px solid ${COLOR_CANON};
          font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 10px;
          padding: 1px 5px; box-shadow: 0 0 6px rgba(237, 175, 24, 0.35);
        }
        .leaflet-tooltip.zone-author-label::before { display: none; }
        .zone-author-point-icon { background: transparent; border: none; cursor: grab; }
        .zone-author-point-icon:active { cursor: grabbing; }
        .zone-author-point {
          display: flex; align-items: center; justify-content: center;
          width: 22px; height: 22px; border-radius: 50%;
          background: #080c14; border: 1.5px solid ${COLOR_CANON};
          box-shadow: 0 0 8px rgba(237, 175, 24, 0.5);
          color: ${COLOR_CANON};
          font-family: 'JetBrains Mono', ui-monospace, monospace;
          font-size: 10px; font-weight: 700;
          -webkit-tap-highlight-color: transparent;
          transition: transform 140ms, box-shadow 140ms;
        }
        .zone-author-point-icon:hover .zone-author-point { transform: scale(1.15); box-shadow: 0 0 12px rgba(237, 175, 24, 0.75); }
        .zone-author-ghost-icon { background: transparent; border: none; cursor: pointer; }
        .zone-author-ghost {
          display: flex; align-items: center; justify-content: center;
          width: 16px; height: 16px; border-radius: 50%;
          background: rgba(8, 12, 20, 0.8);
          border: 1px dashed rgba(237, 175, 24, 0.6);
          color: ${COLOR_CANON};
          font-family: 'JetBrains Mono', ui-monospace, monospace;
          font-size: 12px; line-height: 1; font-weight: 700;
          opacity: 0.55;
          transition: opacity 140ms, transform 140ms, background 140ms;
          -webkit-tap-highlight-color: transparent;
        }
        .zone-author-ghost-icon:hover .zone-author-ghost {
          opacity: 1; transform: scale(1.2); background: rgba(237, 175, 24, 0.15);
        }
        .zone-author-btn {
          font-family: 'JetBrains Mono', ui-monospace, monospace;
          font-size: 11px; letter-spacing: 0.06em; text-transform: uppercase;
          padding: 4px 10px; border-radius: 3px; cursor: pointer;
          background: rgba(8, 12, 20, 0.85); color: ${COLOR_CANON};
          border: 1px solid rgba(237, 175, 24, 0.45);
          transition: background 160ms, border-color 160ms;
        }
        .zone-author-btn:hover { background: rgba(237, 175, 24, 0.15); border-color: ${COLOR_CANON}; }
        .zone-author-btn[disabled] { opacity: 0.4; cursor: not-allowed; }
        .zone-author-btn.is-active { background: rgba(237, 175, 24, 0.2); border-color: ${COLOR_CANON}; }
        .zone-author-btn.is-danger { color: #f87171; border-color: rgba(248, 113, 113, 0.4); }
        .zone-author-btn.is-danger:hover { background: rgba(248, 113, 113, 0.12); border-color: #f87171; }
        .zone-author-panel {
          position: absolute; left: 12px; right: 12px; bottom: 56px; z-index: 20;
          background: rgba(8, 12, 20, 0.92); border: 1px solid rgba(237, 175, 24, 0.4);
          border-radius: 4px; padding: 10px 12px;
          box-shadow: 0 0 24px rgba(6, 10, 24, 0.7);
          backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px);
          font-family: 'JetBrains Mono', ui-monospace, monospace;
          color: #e8e8e8; font-size: 12px;
          display: flex; flex-direction: column; gap: 8px;
          max-height: calc(100% - 120px); overflow-y: auto;
        }
        .zone-author-panel .panel-top-row { display: flex; gap: 6px; align-items: center; justify-content: space-between; }
        .zone-author-collapsed {
          position: absolute; right: 12px; bottom: 56px; z-index: 20;
          display: inline-flex; align-items: center; gap: 6px;
          background: rgba(8, 12, 20, 0.92); color: #e8e8e8;
          border: 1px solid rgba(237, 175, 24, 0.4); border-radius: 3px;
          padding: 4px 10px; cursor: pointer;
          font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 11px;
          letter-spacing: 0.05em; text-transform: uppercase;
          box-shadow: 0 0 16px rgba(6, 10, 24, 0.6);
          backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px);
          -webkit-tap-highlight-color: transparent;
        }
        .zone-author-collapsed .count { color: ${COLOR_CANON}; font-weight: 700; font-size: 13px; }
        .zone-author-collapsed .hint { color: #8a8a8a; font-size: 10px; }
        .zone-author-collapsed .chip {
          background: rgba(237, 175, 24, 0.18); color: ${COLOR_CANON};
          border: 1px solid rgba(237, 175, 24, 0.4); border-radius: 2px;
          padding: 0 5px; font-size: 9px; letter-spacing: 0.06em;
        }
        .zone-author-collapsed .caret { color: ${COLOR_CANON}; font-size: 10px; }
        .zone-author-collapsed:hover { background: rgba(237, 175, 24, 0.12); border-color: ${COLOR_CANON}; }
        .zone-author-panel .row { display: flex; gap: 6px; flex-wrap: wrap; align-items: center; }
        .zone-author-panel .count { color: ${COLOR_CANON}; font-weight: 700; }
        .zone-author-panel .hint { color: #8a8a8a; font-size: 10px; letter-spacing: 0.04em; text-transform: uppercase; }
        .zone-author-panel .field {
          display: flex; flex-direction: column; gap: 2px; flex: 1 1 140px; min-width: 0;
        }
        .zone-author-panel .field label { color: #8a8a8a; font-size: 10px; letter-spacing: 0.05em; text-transform: uppercase; }
        .zone-author-panel input, .zone-author-panel select {
          background: #080c14; color: #e8e8e8;
          border: 1px solid rgba(237, 175, 24, 0.3); border-radius: 3px;
          font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 12px;
          padding: 4px 6px; outline: none; min-width: 0; width: 100%;
        }
        .zone-author-panel input:focus, .zone-author-panel select:focus { border-color: ${COLOR_CANON}; }
        .zone-author-panel .divider { height: 1px; background: rgba(237, 175, 24, 0.2); margin: 2px 0; }
        .zone-author-panel .drafts-head { display: flex; justify-content: space-between; align-items: center; color: ${COLOR_DRAFT}; font-size: 10px; letter-spacing: 0.06em; text-transform: uppercase; }
        .zone-author-panel .draft-row {
          display: flex; justify-content: space-between; align-items: center; gap: 6px;
          padding: 3px 0; border-bottom: 1px dashed rgba(56, 189, 248, 0.15);
          font-size: 11px;
        }
        .zone-author-panel .draft-row:last-child { border-bottom: none; }
        .zone-author-panel .draft-row.is-editing { background: rgba(237, 175, 24, 0.08); padding-left: 4px; padding-right: 4px; border-radius: 2px; }
        .zone-author-panel .draft-tree { display: flex; flex-direction: column; }
        .zone-author-panel .draft-row .drname { color: #e8e8e8; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; min-width: 0; flex: 1 1 auto; display: inline-flex; align-items: center; gap: 4px; }
        .zone-author-panel .draft-row .drsub { color: #8a8a8a; margin-left: 4px; }
        .zone-author-panel .draft-row .tree-glyph { color: rgba(56, 189, 248, 0.55); font-size: 10px; }
        .zone-author-panel .draft-row .lvl-tag {
          display: inline-block; min-width: 22px; text-align: center;
          padding: 0 4px; border-radius: 2px; font-size: 9px;
          background: rgba(237, 175, 24, 0.18); color: ${COLOR_CANON};
          border: 1px solid rgba(237, 175, 24, 0.35); letter-spacing: 0.04em;
        }
        .zone-author-panel .draft-row .lvl-tag.is-unset {
          background: rgba(138, 138, 138, 0.12); color: #8a8a8a;
          border-color: rgba(138, 138, 138, 0.35);
        }
        .zone-author-panel .draft-row .drlabel { overflow: hidden; text-overflow: ellipsis; }
        .zone-author-panel .draft-row button {
          background: transparent; border: 1px solid rgba(248, 113, 113, 0.4);
          color: #f87171; padding: 1px 7px; border-radius: 2px; cursor: pointer;
          font-family: inherit; font-size: 10px;
        }
        .zone-author-panel .draft-row button:hover { background: rgba(248, 113, 113, 0.12); }
        .zone-author-panel .draft-row .edit-btn {
          border-color: rgba(237, 175, 24, 0.45); color: ${COLOR_CANON};
        }
        .zone-author-panel .draft-row .edit-btn:hover { background: rgba(237, 175, 24, 0.12); }
        .zone-author-panel .edit-banner {
          background: rgba(237, 175, 24, 0.12);
          border: 1px solid rgba(237, 175, 24, 0.35);
          border-radius: 3px; padding: 4px 8px;
          font-size: 10px; letter-spacing: 0.05em; text-transform: uppercase;
          color: ${COLOR_CANON};
        }
        .zone-author-panel .edit-banner-name { color: #fff; font-weight: 700; letter-spacing: 0.03em; }
        .zone-author-panel textarea {
          width: 100%; min-height: 80px; resize: vertical;
          background: #080c14; color: #e8e8e8;
          border: 1px solid rgba(237, 175, 24, 0.3); border-radius: 3px;
          font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 11px;
          padding: 6px 8px; -webkit-user-select: text; user-select: text;
        }
        .zone-author-toast {
          position: absolute; top: 56px; left: 50%; transform: translateX(-50%);
          z-index: 30; padding: 6px 12px; border-radius: 3px;
          background: rgba(8, 12, 20, 0.95); color: ${COLOR_CANON};
          border: 1px solid rgba(237, 175, 24, 0.45);
          font-family: 'JetBrains Mono', ui-monospace, monospace;
          font-size: 11px; letter-spacing: 0.05em; text-transform: uppercase;
          box-shadow: 0 0 16px rgba(6, 10, 24, 0.6);
          pointer-events: none;
        }
        .map-header-tap { cursor: pointer; -webkit-tap-highlight-color: transparent; }

        .floor-picker {
          /* Float the picker var(--space-md) (12 px) below the kuro-header
             (actual height measured via ResizeObserver, applied as inline
             top) and var(--space-md) from the card's left edge — same
             gap on top and sides. */
          position: absolute;
          left: var(--space-md, 12px);
          z-index: 20;
          display: flex; flex-direction: column; align-items: stretch;
          gap: var(--space-xs, 4px);
          padding: var(--space-sm, 8px);
          background: var(--bg-card);
          border: 1px solid var(--border-default);
          border-radius: var(--radius-lg, 11px);
          box-shadow: var(--shadow-md);
          backdrop-filter: blur(var(--blur-sm)); -webkit-backdrop-filter: blur(var(--blur-sm));
        }
        .floor-picker button {
          background: var(--bg-btn);
          color: var(--text-heading);
          border: 1px solid var(--border-medium);
          border-radius: var(--btn-radius, var(--radius-lg, 11px));
          padding: var(--space-xs, 4px) var(--space-sm, 8px);
          font-family: var(--font-display);
          font-size: var(--font-base, 13px);
          font-weight: 500;
          letter-spacing: 0.02em;
          cursor: pointer;
          -webkit-tap-highlight-color: transparent;
          transition: background 160ms, border-color 160ms, color var(--transition-fast, 120ms);
        }
        .floor-picker button:hover { background: rgba(237, 175, 24, 0.15); border-color: ${COLOR_CANON}; color: ${COLOR_CANON}; }
        .floor-picker input {
          width: 44px;
          background: var(--bg-btn);
          color: var(--text-heading);
          border: 1px solid var(--border-medium);
          border-radius: var(--btn-radius, var(--radius-lg, 11px));
          padding: var(--space-xs, 4px) var(--space-sm, 8px);
          font-family: var(--font-display);
          font-size: var(--font-base, 13px);
          font-weight: 500;
          letter-spacing: 0.02em;
          text-align: center; outline: none; -moz-appearance: textfield;
        }
        .floor-picker input:focus { border-color: ${COLOR_CANON}; }
        .floor-picker input::-webkit-inner-spin-button,
        .floor-picker input::-webkit-outer-spin-button { -webkit-appearance: none; }

        .zone-selector {
          position: absolute;
          right: var(--space-md, 12px);
          z-index: 20;
          display: flex; flex-direction: column;
          gap: var(--space-xs, 4px);
          padding: var(--space-sm, 8px);
          min-width: 160px;
          max-width: 240px;
          max-height: 60vh;
          overflow: auto;
          background: var(--bg-card);
          border: 1px solid var(--border-default);
          border-radius: var(--radius-lg, 11px);
          box-shadow: var(--shadow-md);
          backdrop-filter: blur(var(--blur-sm)); -webkit-backdrop-filter: blur(var(--blur-sm));
        }
        .zone-selector.is-collapsed { max-height: none; overflow: visible; }
        .zone-selector-head {
          display: flex; align-items: center; gap: var(--space-xs, 4px);
          width: 100%;
          font-family: var(--font-display);
          font-size: var(--font-base, 13px);
          color: var(--text-heading);
          letter-spacing: 0.04em;
          text-transform: uppercase;
          background: var(--bg-btn);
          border: 1px solid var(--border-medium);
          border-radius: var(--btn-radius, var(--radius-lg, 11px));
          padding: var(--space-xs, 4px) var(--space-sm, 8px);
          cursor: pointer;
          -webkit-tap-highlight-color: transparent;
          transition: background 160ms, border-color 160ms, color 120ms;
        }
        .zone-selector-head:hover { background: rgba(237, 175, 24, 0.12); border-color: ${COLOR_CANON}; color: ${COLOR_CANON}; }
        .zone-selector-count {
          margin-left: auto;
          font-size: 11px; opacity: 0.75;
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid var(--border-default);
          border-radius: var(--radius-sm, 5px);
          padding: 0 6px;
        }
        .zone-selector-list { display: flex; flex-direction: column; gap: 2px; }
        .zone-selector-empty {
          padding: var(--space-sm, 8px);
          font-family: var(--font-display);
          font-size: 11px;
          color: var(--text-heading);
          opacity: 0.55;
          text-align: center;
        }
        .zone-selector-item {
          display: flex; align-items: center; gap: var(--space-xs, 4px);
          width: 100%;
          background: var(--bg-btn);
          border: 1px solid var(--border-medium);
          border-radius: var(--btn-radius, var(--radius-lg, 11px));
          padding: var(--space-xs, 4px) var(--space-sm, 8px);
          color: var(--text-heading);
          font-family: var(--font-display);
          font-size: var(--font-base, 13px);
          text-align: left;
          cursor: pointer;
          -webkit-tap-highlight-color: transparent;
          transition: background 160ms, border-color 160ms, color 120ms;
        }
        .zone-selector-item:hover { background: rgba(237, 175, 24, 0.12); border-color: ${COLOR_CANON}; color: ${COLOR_CANON}; }
        .zone-selector-caret {
          display: inline-block; width: 10px; text-align: center;
          opacity: 0.7; flex-shrink: 0;
        }
        .zone-selector-name { flex: 1 1 auto; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .zone-selector-row { display: flex; align-items: stretch; gap: var(--space-xs, 4px); }
        .zone-selector-row .zone-selector-item { flex: 1 1 auto; }
        .zone-selector-edit-btn {
          flex: 0 0 auto;
          display: inline-flex; align-items: center; justify-content: center;
          width: 28px;
          background: var(--bg-btn);
          border: 1px solid var(--border-medium);
          border-radius: var(--btn-radius, var(--radius-lg, 11px));
          color: ${COLOR_CANON};
          font-family: var(--font-display);
          font-size: 14px;
          cursor: pointer;
          -webkit-tap-highlight-color: transparent;
          transition: background 160ms, border-color 160ms;
        }
        .zone-selector-edit-btn:hover { background: rgba(237, 175, 24, 0.18); border-color: ${COLOR_CANON}; }

        .overlay-row {
          background: rgba(56, 189, 248, 0.06); border: 1px solid rgba(56, 189, 248, 0.2);
          border-radius: 3px; padding: 6px 8px; display: flex; flex-direction: column; gap: 6px;
        }
        .overlay-row.is-active { border-color: ${COLOR_CANON}; background: rgba(237, 175, 24, 0.06); }
        .overlay-row.is-locked { border-color: rgba(148, 163, 184, 0.35); background: rgba(148, 163, 184, 0.05); }
        .overlay-row-head { display: flex; justify-content: space-between; align-items: center; gap: 6px; }
        .lock-badge, .tree-badge {
          font-size: 8px; text-transform: uppercase; letter-spacing: 0.06em;
          padding: 0 4px; border-radius: 2px; margin-left: 4px;
        }
        .lock-badge {
          background: rgba(148, 163, 184, 0.18); color: #94a3b8;
          border: 1px solid rgba(148, 163, 184, 0.4);
        }
        .tree-badge {
          background: rgba(34, 197, 94, 0.18); color: #22c55e;
          border: 1px solid rgba(34, 197, 94, 0.4);
        }
        .overlay-controls { display: flex; flex-direction: column; gap: 6px; }
        .overlay-slider {
          -webkit-appearance: none; appearance: none; width: 100%; height: 4px;
          background: rgba(237, 175, 24, 0.2); border-radius: 2px; outline: none;
        }
        .overlay-slider::-webkit-slider-thumb {
          -webkit-appearance: none; appearance: none;
          width: 14px; height: 14px; border-radius: 50%;
          background: ${COLOR_CANON}; cursor: pointer; border: 1.5px solid #080c14;
        }
      `}</style>
      <div role="tabpanel" id="tabpanel-map" aria-labelledby="tab-map" tabIndex="0" style={{ position: 'relative', zIndex: 10 }}>
      <div className="kuro-calc space-y-3 tab-content" style={{ position: 'relative', zIndex: 1 }}>
        <div className="kuro-card map-card" style={{ height: `calc(100dvh - ${navPadding + 93}px)`, overflow: 'hidden', background: MAP_BG, position: 'relative', zIndex: 1, isolation: 'isolate' }}>
          <div className="kuro-card-inner" style={{ position: 'relative', height: '100%' }}>
            <div
              ref={containerRef}
              className="leaflet-map-bg"
              style={{ position: 'absolute', inset: 0, background: MAP_BG, zIndex: 1 }}
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
                action={authorEnabled ? (
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); toggleAuthorMode(); }}
                    className={`zone-author-btn ${authorMode ? 'is-active' : ''}`}
                    aria-pressed={authorMode}
                  >
                    {authorMode ? 'Exit draw' : `Draw zone${drafts.length ? ` (${drafts.length})` : ''}`}
                  </button>
                ) : null}
              >
                Interactive Map
              </CardHeader>
            </div>

            {/* Floor picker — same var(--space-md) gap on top and sides */}
            <div className="floor-picker" role="group" aria-label="Floor" style={{ top: `${headerHeight + 12}px` }}>
              <button type="button" onClick={() => setViewFloor(v => v + 1)} aria-label="Floor up">▲</button>
              <input
                type="number"
                value={viewFloor}
                onChange={(e) => { const v = parseInt(e.target.value, 10); if (Number.isFinite(v)) setViewFloor(v); }}
                aria-label="Floor"
              />
              <button type="button" onClick={() => setViewFloor(v => v - 1)} aria-label="Floor down">▼</button>
            </div>

            {toast && <div className="zone-author-toast" role="status">{toast}</div>}

            {/* Zone selector — same var(--space-md) gap on top and right */}
            <div
              className={`zone-selector ${zoneSelectorCollapsed ? 'is-collapsed' : ''}`}
              role="tree"
              aria-label="Zones"
              aria-expanded={!zoneSelectorCollapsed}
              style={{ top: `${headerHeight + 12}px` }}
            >
              <button
                type="button"
                className="zone-selector-head"
                onClick={() => setZoneSelectorCollapsed(v => !v)}
                aria-label={zoneSelectorCollapsed ? 'Expand zone selector' : 'Collapse zone selector'}
              >
                <span className="zone-selector-caret">{zoneSelectorCollapsed ? '▸' : '▾'}</span>
                <span>Zones</span>
                {zoneSelectorCollapsed && (zoneNav.get(null) || []).length > 0 && (
                  <span className="zone-selector-count">{(zoneNav.get(null) || []).length}</span>
                )}
              </button>
              {!zoneSelectorCollapsed && (
                <div className="zone-selector-list">
                  {(() => {
                    const renderNode = (zone, depth) => {
                      const children = zoneNav.get(zone.id) || [];
                      const hasChildren = children.length > 0;
                      const expanded = expandedZones.has(zone.id);
                      return (
                        <div key={zone.id} role="treeitem" aria-expanded={hasChildren ? expanded : undefined}>
                          <div className="zone-selector-row" style={{ paddingLeft: `calc(${depth} * var(--space-md, 12px))` }}>
                            <button
                              type="button"
                              className="zone-selector-item"
                              onClick={() => {
                                switchFloorForZone(zone);
                                if (hasChildren) toggleZoneExpanded(zone.id);
                                else handleFlyToZone(zone);
                              }}
                              onDoubleClick={() => handleFlyToZone(zone)}
                              aria-label={`${zone.name || zone.id}${hasChildren ? expanded ? ' (collapse)' : ' (expand)' : ''}`}
                            >
                              <span className="zone-selector-caret">{hasChildren ? (expanded ? '▾' : '▸') : '·'}</span>
                              <span className="zone-selector-name">{zone.name || zone.id}</span>
                            </button>
                            {zone.overlayId && (
                              <button
                                type="button"
                                className="zone-selector-edit-btn"
                                onClick={(e) => { e.stopPropagation(); handlePushSubMapToEdit(zone); }}
                                aria-label={`Push "${zone.name || zone.id}" back to sub-map editor`}
                                title="Push back to sub-map editor"
                              >
                                ✎
                              </button>
                            )}
                          </div>
                          {hasChildren && expanded && (
                            <div role="group">
                              {children.map(c => renderNode(c, depth + 1))}
                            </div>
                          )}
                        </div>
                      );
                    };
                    const roots = zoneNav.get(null) || [];
                    if (roots.length === 0) {
                      return <div className="zone-selector-empty">No zones</div>;
                    }
                    return roots.map(z => renderNode(z, 0));
                  })()}
                </div>
              )}
            </div>

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
                    className={`zone-author-btn ${freehandMode ? 'is-active' : ''}`}
                    type="button"
                    aria-pressed={freehandMode}
                    onClick={() => setFreehandMode(v => !v)}
                  >
                    {freehandMode ? 'Freehand: on' : 'Freehand'}
                  </button>
                  <button className="zone-author-btn" type="button" onClick={handleUndo} disabled={authorPoints.length === 0}>Undo</button>
                  <button className="zone-author-btn" type="button" onClick={handleClear} disabled={authorPoints.length === 0}>Clear</button>
                  <button className="zone-author-btn is-active" type="button" onClick={handleSaveDraft} disabled={authorPoints.length < 3}>
                    {editingId ? 'Update zone' : 'Save zone'}
                  </button>
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
                    <div className="draft-tree">
                      {draftTree.map(node => {
                        const isEditing = node.id === editingId;
                        // Drafts whose parent is canonical (not in drafts) sit at root,
                        // but we show the canonical parent name as a breadcrumb.
                        const canonicalParentName = node.depth === 0 && node.parentId
                          ? (MAP_ZONES.find(p => p.id === node.parentId)?.name || node.parentId)
                          : null;
                        return (
                          <div
                            key={node.id}
                            className={`draft-row depth-${Math.min(node.depth, 9)} ${isEditing ? 'is-editing' : ''}`}
                            style={{ paddingLeft: 4 + node.depth * 14 }}
                          >
                            <span className="drname">
                              {node.depth > 0 && <span className="tree-glyph">└─ </span>}
                              <span className={`lvl-tag ${node.level == null ? 'is-unset' : ''}`}>
                                {node.level != null ? `L${node.level}` : '—'}
                              </span>
                              <span className="drlabel">{node.name}</span>
                              {canonicalParentName && <span className="drsub">› {canonicalParentName}</span>}
                            </span>
                            <span className="row" style={{ gap: 4 }}>
                              {!isEditing && (
                                <button className="edit-btn" type="button" onClick={() => handleEditDraft(node.id)} aria-label={`Edit ${node.name}`}>Edit</button>
                              )}
                              <button type="button" onClick={() => handleDeleteDraft(node.id)} aria-label={`Delete ${node.name}`}>Delete</button>
                            </span>
                          </div>
                        );
                      })}
                    </div>
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
                  return (
                    <div key={ov.id} className={`overlay-row ${editing ? 'is-active' : ''} ${locked ? 'is-locked' : ''}`}>
                      <div className="overlay-row-head">
                        <span className="drname">
                          <span className={`lvl-tag ${ov.floor === viewFloor ? '' : 'is-unset'}`}>F{ov.floor ?? 0}</span>
                          <span className="drlabel">{ov.name}</span>
                          {locked && <span className="lock-badge">locked</span>}
                          {inTree && <span className="tree-badge">tree</span>}
                        </span>
                        <span className="row" style={{ gap: 4 }}>
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

              </div>
            )}

            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 10 }}>
              <CardHeader>
                {authorMode
                  ? (editingId
                      ? `Editing: ${authorPoints.length} point${authorPoints.length === 1 ? '' : 's'} · tap Update to save`
                      : `Drawing: ${authorPoints.length} point${authorPoints.length === 1 ? '' : 's'} · need 3+ to save`)
                  : 'Pinch to zoom · Drag to pan'}
              </CardHeader>
            </div>
          </div>
        </div>

      </div>
      </div>
    </>
  );
}
