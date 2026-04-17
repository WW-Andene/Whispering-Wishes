import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CardHeader } from '../../shared/components/Card.jsx';
import { TabBackground } from '../../shared/backgrounds/TabBackground.jsx';
import { MAP_ZONES } from '../../data/mapZones.js';
import { OVERLAY_CATALOG, loadOverlayDrafts, saveOverlayDrafts } from '../../data/mapOverlays.js';

const MAP_W = 16384;
const MAP_H = 16384;
const TILE_SIZE = 256;
const NATIVE_ZOOM = 6;  // zoom level at which the 16384×16384 tile pyramid is defined
const MAX_ZOOM = 10;    // how far the user can zoom in (tiles upscale beyond NATIVE_ZOOM)
const MAP_BG = '#062633';
const MAP_BG_TRANSPARENT = 'rgba(6, 38, 51, 0.55)';
const BASE = import.meta.env.BASE_URL || '/';
const AUTHOR_FLAG_KEY = 'ww-zone-author';
const DRAFTS_KEY = 'ww-zone-drafts';

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
function slugify(s) {
  return String(s || '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || `zone-${Date.now().toString(36)}`;
}

export default function MapTab({ navPadding = 80 }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const leafletRef = useRef(null);
  const activeLayerRef = useRef(null);
  const draftsLayerRef = useRef(null);
  const headerTapsRef = useRef([]);

  const [status, setStatus] = useState('Loading map...');
  const [mapReady, setMapReady] = useState(false);
  const [authorEnabled, setAuthorEnabled] = useState(() => {
    if (typeof localStorage === 'undefined') return false;
    return localStorage.getItem(AUTHOR_FLAG_KEY) === '1';
  });
  const [authorMode, setAuthorMode] = useState(false);
  const [authorPoints, setAuthorPoints] = useState([]);
  const [drafts, setDrafts] = useState(loadDrafts);
  const [draftName, setDraftName] = useState('');
  const [draftParent, setDraftParent] = useState('');
  const [draftLevel, setDraftLevel] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [jsonSnippet, setJsonSnippet] = useState('');
  const [toast, setToast] = useState('');
  const [panelCollapsed, setPanelCollapsed] = useState(false);
  const [implementMode, setImplementMode] = useState(null);
  const [implementValues, setImplementValues] = useState(null);
  const implementRef = useRef(null);

  // Overlay + floor state
  const [viewFloor, setViewFloor] = useState(0);
  const [overlayDrafts, setOverlayDrafts] = useState(loadOverlayDrafts);
  const [activeOverlayId, setActiveOverlayId] = useState(null);
  const tileLayerRef = useRef(null);
  const overlayLayerRef = useRef(null);
  const overlayInstancesRef = useRef(new Map()); // id → L.imageOverlay (persistent)
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

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
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
        inertia: false,
        fadeAnimation: false,
        zoomAnimation: false,
        markerZoomAnimation: false,
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

      const tileLayer = L.tileLayer(BASE + 'map-tiles/{z}/{y}/{x}.webp', {
        minZoom,
        maxZoom: MAX_ZOOM,
        maxNativeZoom: 6,
        tileSize: TILE_SIZE,
        noWrap: true,
        bounds,
        errorTileUrl: BASE + 'map-tiles/blank.png',
      }).addTo(map);
      tileLayerRef.current = tileLayer;

      // Canonical zone overlays — render parents first, then sub-zones on top
      const pxToLatLng = ([x, y]) => map.unproject([x, y], NATIVE_ZOOM);
      const sorted = [...MAP_ZONES].sort((a, b) => (a.parentId ? 1 : 0) - (b.parentId ? 1 : 0));
      sorted.forEach(zone => {
        if (!Array.isArray(zone.polygon) || zone.polygon.length < 3) return;
        const color = zone.color || COLOR_CANON;
        const isSub = !!zone.parentId;
        const poly = L.polygon(zone.polygon.map(pxToLatLng), {
          color,
          weight: isSub ? 1 : 1.5,
          opacity: 0.85,
          fillColor: color,
          fillOpacity: isSub ? 0.06 : 0.10,
          className: 'zone-polygon',
        }).addTo(map);
        const parentName = isSub ? (MAP_ZONES.find(z => z.id === zone.parentId)?.name || zone.parentId) : null;
        const title = parentName ? `${parentName} › ${zone.name || zone.id}` : (zone.name || zone.id);
        const popupBody = zone.note ? `<div class="zone-popup-note">${zone.note}</div>` : '';
        poly.bindPopup(`<div class="zone-popup-title">${title}</div>${popupBody}`, { className: 'zone-popup', closeButton: false, autoPan: false });
        poly.bindTooltip(title, { sticky: true, className: 'zone-tooltip' });
      });

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
  }, [authorMode, mapReady]);

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

  const floorDist = Math.abs(viewFloor);

  // Persistent overlay instances — L.imageOverlay, created once, updated in place.
  // Uses Leaflet's overlay pane (correct z-index). Combined with transition:none
  // on all panes, the pane reset is instant (no animation glitch).
  useEffect(() => {
    const map = mapRef.current;
    const L = leafletRef.current;
    if (!map || !L || !mapReady) return;

    const instances = overlayInstancesRef.current;
    const pxToLL = ([x, y]) => map.unproject([x, y], NATIVE_ZOOM);
    const visible = overlayDrafts.filter(ov => (ov.floor ?? 0) === viewFloor);
    const visibleIds = new Set(visible.map(ov => ov.id));

    for (const [id, overlay] of instances) {
      if (!visibleIds.has(id)) {
        map.removeLayer(overlay);
        instances.delete(id);
      }
    }

    visible.forEach(ov => {
      if (!ov.center) return;
      const nw = ov.naturalWidth || 8192;
      const nh = ov.naturalHeight || 8192;
      const s = ov.scale || 1;
      const hw = (nw * s) / 2, hh = (nh * s) / 2;
      const [cx, cy] = ov.center;
      const bounds = L.latLngBounds(
        pxToLL([cx - hw, cy + hh]),
        pxToLL([cx + hw, cy - hh])
      );

      let overlay = instances.get(ov.id);
      if (!overlay) {
        const cat = OVERLAY_CATALOG.find(c => c.id === ov.catalogId);
        const url = (BASE + (cat?.imageUrl || ov.imageUrl || '')).replace(/\/\//g, '/');
        overlay = L.imageOverlay(url, bounds, {
          interactive: false,
          className: 'map-overlay-img',
          opacity: ov.opacity ?? 1,
        }).addTo(map);
        instances.set(ov.id, overlay);
      } else {
        overlay.setBounds(bounds);
        overlay.setOpacity(ov.opacity ?? 1);
      }

      const el = overlay.getElement?.();
      if (el) {
        el.style.pointerEvents = 'none';
      }
    });
  }, [overlayDrafts, viewFloor, mapReady, activeOverlayId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      const map = mapRef.current;
      if (map) {
        for (const [, ov] of overlayInstancesRef.current) map.removeLayer(ov);
      }
      overlayInstancesRef.current.clear();
    };
  }, []);




  // Overlay: enter implement mode
  const handleAddOverlay = (catalogId) => {
    const cat = OVERLAY_CATALOG.find(c => c.id === catalogId);
    if (!cat) return;
    const map = mapRef.current;
    const center = map
      ? (() => { const c = map.getCenter(); const pt = map.project(c, NATIVE_ZOOM); return [Math.round(pt.x), Math.round(pt.y)]; })()
      : [MAP_W / 2, MAP_H / 2];
    const placement = {
      id: `${catalogId}-${Date.now().toString(36)}`,
      catalogId: cat.id,
      name: cat.name,
      imageUrl: cat.imageUrl,
      center,
      scale: 1.0,
      rotation: 0,
      floor: viewFloor,
      locked: false,
      opacity: 0.75,
      naturalWidth: cat.naturalWidth,
      naturalHeight: cat.naturalHeight,
    };
    implementRef.current = { data: placement };
    setImplementMode(placement.id);
    setImplementValues({ center, scale: 1.0, rotation: 0, floor: viewFloor, opacity: 0.75 });
  };

  const handleUpdateOverlay = (id, patch) => {
    const next = overlayDrafts.map(o => o.id === id ? { ...o, ...patch } : o);
    setOverlayDrafts(next);
    saveOverlayDrafts(next);
  };

  const handleDeleteOverlay = (id) => {
    // Also remove any linked zone from the tree
    const linkedZone = drafts.find(d => d.overlayId === id);
    if (linkedZone) {
      const nextDrafts = drafts.filter(d => d.id !== linkedZone.id);
      setDrafts(nextDrafts);
      saveDrafts(nextDrafts);
    }
    const next = overlayDrafts.filter(o => o.id !== id);
    setOverlayDrafts(next);
    saveOverlayDrafts(next);
    if (activeOverlayId === id) setActiveOverlayId(null);
  };

  const overlayBoundsPolygon = (ov) => {
    const nw = ov.naturalWidth || 4096;
    const nh = ov.naturalHeight || 4096;
    const s = ov.scale || 1;
    const halfW = (nw * s) / 2;
    const halfH = (nh * s) / 2;
    const [cx, cy] = ov.center;
    // Unrotated corners
    const corners = [
      [cx - halfW, cy - halfH],
      [cx + halfW, cy - halfH],
      [cx + halfW, cy + halfH],
      [cx - halfW, cy + halfH],
    ];
    // Apply rotation around center
    const rad = ((ov.rotation || 0) * Math.PI) / 180;
    if (rad !== 0) {
      const cos = Math.cos(rad), sin = Math.sin(rad);
      return corners.map(([x, y]) => {
        const dx = x - cx, dy = y - cy;
        return [Math.round(cx + dx * cos - dy * sin), Math.round(cy + dx * sin + dy * cos)];
      });
    }
    return corners.map(([x, y]) => [Math.round(x), Math.round(y)]);
  };

  const handleAddOverlayToTree = (ovId) => {
    const ov = overlayDrafts.find(o => o.id === ovId);
    if (!ov) return;
    // Check if already linked
    if (drafts.some(d => d.overlayId === ovId)) {
      showToast('Already in tree');
      return;
    }
    const polygon = overlayBoundsPolygon(ov);
    const zoneId = `overlay-${ovId}`;
    const zone = {
      id: zoneId,
      name: ov.name || 'Sub-map',
      polygon,
      overlayId: ovId,
      level: ov.floor != null ? undefined : undefined,
    };
    const nextDrafts = [...drafts, zone];
    setDrafts(nextDrafts);
    saveDrafts(nextDrafts);
    showToast(`"${zone.name}" added to tree`);
  };

  const handleRemoveOverlayFromTree = (ovId) => {
    const nextDrafts = drafts.filter(d => d.overlayId !== ovId);
    setDrafts(nextDrafts);
    saveDrafts(nextDrafts);
    showToast('Removed from tree');
  };

  // ── Implement mode: dedicated overlay placement ──
  // Creates one overlay, disables everything else, gestures update DOM directly.
  useEffect(() => {
    if (!implementMode || !mapReady) return;
    const map = mapRef.current;
    const L = leafletRef.current;
    if (!map || !L || !implementRef.current) { setImplementMode(null); return; }

    const data = implementRef.current.data;
    const nw = data.naturalWidth || 4096;
    const nh = data.naturalHeight || 4096;
    const live = {
      center: [...data.center],
      scale: data.scale || 1,
      rotation: data.rotation || 0,
      opacity: data.opacity ?? 0.75,
      floor: data.floor ?? 0,
    };

    map.dragging.disable();
    if (map.doubleClickZoom) map.doubleClickZoom.disable();
    if (map.touchZoom) map.touchZoom.disable();

    const pxToLL2 = ([x, y]) => map.unproject([x, y], NATIVE_ZOOM);
    const recomputeBounds = () => {
      const hw = (nw * live.scale) / 2, hh = (nh * live.scale) / 2;
      return L.latLngBounds(
        pxToLL2([live.center[0] - hw, live.center[1] + hh]),
        pxToLL2([live.center[0] + hw, live.center[1] - hh])
      );
    };
    const url = (BASE + data.imageUrl).replace(/\/\//g, '/');
    const overlay = L.imageOverlay(url, recomputeBounds(), {
      interactive: true,
      opacity: live.opacity,
      className: 'map-overlay-img map-overlay-implement',
    }).addTo(map);

    const applyLive = () => {
      overlay.setBounds(recomputeBounds());
      overlay.setOpacity(live.opacity);
      // Append rotation directly after setBounds
      const img = overlay.getElement();
      if (img && live.rotation) {
        img.style.transformOrigin = 'center center';
        img.style.transform += ` rotate(${Math.round(live.rotation)}deg)`;
      }
    };

    const el = overlay.getElement();
    if (!el) { setImplementMode(null); return; }
    overlay._reset();
    el.style.cursor = 'grab';
    el.style.outline = '2px dashed #edaf18';
    el.style.outlineOffset = '4px';

    // Expose to sliders + lock handler
    implementRef.current.updateLive = (patch) => {
      Object.assign(live, patch);
      applyLive();
      setImplementValues(prev => ({ ...prev, ...patch }));
    };
    implementRef.current.getLive = () => ({ ...live });

    // Gesture handlers — raw pixel math only, no Leaflet API during gesture.
    // Screen px → map px: at zoom Z, 1 screen px = 2^(NATIVE_ZOOM - Z) map px.
    let dragStart = null, pinchStart = null;

    const onDown = (evt) => {
      evt.stopPropagation();
      evt.preventDefault();
      gestureActiveRef.current = true;
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
        const t = evt.touches ? evt.touches[0] : evt;
        dragStart = { sx: t.clientX, sy: t.clientY, cx: live.center[0], cy: live.center[1] };
        pinchStart = null;
      }
      el.style.cursor = 'grabbing';
      document.addEventListener('mousemove', onMove, { passive: false });
      document.addEventListener('mouseup', onUp);
      document.addEventListener('touchmove', onMove, { passive: false });
      document.addEventListener('touchend', onUp);
    };

    const onMove = (evt) => {
      evt.preventDefault();
      // Two-finger: pinch + rotate
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
      // One-finger drag
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
      if (evt.touches && evt.touches.length > 0) return;
      dragStart = null;
      pinchStart = null;
      el.style.cursor = 'grab';
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      document.removeEventListener('touchmove', onMove);
      document.removeEventListener('touchend', onUp);
      setImplementValues({ ...live });
      setTimeout(() => { gestureActiveRef.current = false; }, 80);
    };

    el.addEventListener('mousedown', onDown);
    el.addEventListener('touchstart', onDown, { passive: false });

    return () => {
      el.removeEventListener('mousedown', onDown);
      el.removeEventListener('touchstart', onDown);
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      document.removeEventListener('touchmove', onMove);
      document.removeEventListener('touchend', onUp);
      map.removeLayer(overlay);
      map.dragging.enable();
      if (map.doubleClickZoom) map.doubleClickZoom.enable();
      if (map.touchZoom) map.touchZoom.enable();
      gestureActiveRef.current = false;
    };
  }, [implementMode, mapReady]);

  const handleImplementLockAndAdd = () => {
    if (!implementRef.current) return;
    const data = implementRef.current.data;
    const live = implementRef.current.getLive();
    const finalOverlay = {
      ...data,
      center: live.center,
      scale: +live.scale.toFixed(3),
      rotation: Math.round(live.rotation),
      opacity: live.opacity,
      floor: live.floor,
      locked: true,
    };
    const nextOverlays = [...overlayDrafts, finalOverlay];
    setOverlayDrafts(nextOverlays);
    saveOverlayDrafts(nextOverlays);
    const polygon = overlayBoundsPolygon(finalOverlay);
    const zone = { id: `overlay-${finalOverlay.id}`, name: finalOverlay.name, polygon, overlayId: finalOverlay.id };
    const nextDrafts = [...drafts, zone];
    setDrafts(nextDrafts);
    saveDrafts(nextDrafts);
    setImplementMode(null);
    setImplementValues(null);
    implementRef.current = null;
    showToast(`"${finalOverlay.name}" locked & added`);
  };

  const handleImplementCancel = () => {
    setImplementMode(null);
    setImplementValues(null);
    implementRef.current = null;
    showToast('Cancelled');
  };

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
          position: absolute; top: 56px; left: 12px; z-index: 20;
          display: flex; flex-direction: column; align-items: center; gap: 0;
          background: rgba(8, 12, 20, 0.92); border: 1px solid rgba(237, 175, 24, 0.4);
          border-radius: 3px; overflow: hidden;
          box-shadow: 0 0 12px rgba(6, 10, 24, 0.6);
          font-family: 'JetBrains Mono', ui-monospace, monospace;
        }
        .floor-picker button {
          background: transparent; border: none; color: ${COLOR_CANON};
          padding: 4px 10px; cursor: pointer; font-size: 10px; width: 100%;
          transition: background 120ms; -webkit-tap-highlight-color: transparent;
        }
        .floor-picker button:hover { background: rgba(237, 175, 24, 0.15); }
        .floor-picker .floor-label {
          padding: 2px 10px; font-size: 11px; color: #e8e8e8;
          background: rgba(237, 175, 24, 0.08);
          border-top: 1px solid rgba(237, 175, 24, 0.2);
          border-bottom: 1px solid rgba(237, 175, 24, 0.2);
          letter-spacing: 0.06em; text-align: center; min-width: 48px;
        }
        .leaflet-map-pane, .leaflet-tile-pane, .leaflet-overlay-pane,
        .leaflet-tile, .leaflet-image-layer, .leaflet-zoom-animated { transition: none !important; }
        .map-overlay-implement { pointer-events: auto !important; z-index: 500 !important; }
        .implement-panel { border-color: rgba(237, 175, 24, 0.6); box-shadow: 0 0 32px rgba(237, 175, 24, 0.12), 0 0 24px rgba(6, 10, 24, 0.7); }
        .overlay-row {
          background: rgba(56, 189, 248, 0.06); border: 1px solid rgba(56, 189, 248, 0.2);
          border-radius: 3px; padding: 6px 8px; display: flex; flex-direction: column; gap: 6px;
        }
        .overlay-row.is-active { border-color: ${COLOR_CANON}; background: rgba(237, 175, 24, 0.06); }
        .overlay-row-head { display: flex; justify-content: space-between; align-items: center; gap: 6px; }
        .overlay-row .lock-badge {
          font-size: 8px; text-transform: uppercase; letter-spacing: 0.06em;
          background: rgba(34, 197, 94, 0.18); color: #22c55e; border: 1px solid rgba(34, 197, 94, 0.4);
          padding: 0 4px; border-radius: 2px;
        }
        .overlay-controls { display: flex; flex-direction: column; gap: 6px; }
        .overlay-slider {
          -webkit-appearance: none; appearance: none; width: 100%; height: 4px;
          background: rgba(237, 175, 24, 0.2); border-radius: 2px; outline: none;
        }
        .overlay-slider::-webkit-slider-thumb {
          -webkit-appearance: none; appearance: none;
          width: 14px; height: 14px; border-radius: 50%;
          background: ${COLOR_CANON}; cursor: pointer;
          border: 1.5px solid #080c14;
        }
      `}</style>
      <div role="tabpanel" id="tabpanel-map" aria-labelledby="tab-map" tabIndex="0">
      <div className="kuro-calc space-y-3 tab-content">
        <TabBackground id="map" />

        <div className="kuro-card map-card" style={{ height: `calc(100dvh - ${navPadding + 93}px)`, overflow: 'hidden', background: MAP_BG }}>
          <div className="kuro-card-inner" style={{ position: 'relative', height: '100%' }}>
            <div
              ref={containerRef}
              className="leaflet-map-bg"
              style={{ position: 'absolute', inset: 0, background: MAP_BG, zIndex: 1 }}
            />
            {floorDist > 0 && (
              <div
                style={{
                  position: 'absolute', inset: 0, zIndex: 2,
                  background: `rgba(0, 0, 0, ${Math.min(0.75, floorDist * 0.25)})`,
                  pointerEvents: 'none',
                  transition: 'background 300ms',
                }}
              />
            )}
            {status && (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888', zIndex: 1000, pointerEvents: 'none' }}>
                {status}
              </div>
            )}
            <div
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

            {/* Floor picker — always visible */}
            <div className="floor-picker" role="group" aria-label="Floor level">
              <button type="button" onClick={() => setViewFloor(v => v + 1)} aria-label="Floor up">▲</button>
              <span className="floor-label">F{viewFloor >= 0 ? '+' : ''}{viewFloor}</span>
              <button type="button" onClick={() => setViewFloor(v => v - 1)} aria-label="Floor down">▼</button>
            </div>

            {toast && <div className="zone-author-toast" role="status">{toast}</div>}

            {/* ── Implement mode panel ── */}
            {implementMode && implementValues && (
              <div className="zone-author-panel implement-panel" role="group" aria-label="Implement mode">
                <div className="edit-banner" style={{ textAlign: 'center' }}>
                  Placing <span className="edit-banner-name">{implementRef.current?.data?.name || 'sub-map'}</span>
                </div>
                <div className="hint" style={{ textAlign: 'center', fontSize: 9 }}>
                  1 finger = drag · 2 fingers = pinch scale + twist rotate
                </div>
                <div className="row">
                  <div className="field" style={{ flex: '0 0 70px' }}>
                    <label>Floor</label>
                    <div className="row" style={{ gap: 2 }}>
                      <button className="zone-author-btn" type="button" onClick={() => implementRef.current?.updateLive({ floor: (implementValues.floor ?? 0) - 1 })} style={{ padding: '1px 6px' }}>−</button>
                      <span style={{ minWidth: 24, textAlign: 'center' }}>{implementValues.floor ?? 0}</span>
                      <button className="zone-author-btn" type="button" onClick={() => implementRef.current?.updateLive({ floor: (implementValues.floor ?? 0) + 1 })} style={{ padding: '1px 6px' }}>+</button>
                    </div>
                  </div>
                  <div className="field" style={{ flex: '1 1 0' }}>
                    <label>Scale ({(implementValues.scale ?? 1).toFixed(2)}×)</label>
                    <input type="range" min="0.1" max="5" step="0.05" value={implementValues.scale ?? 1}
                      onChange={(e) => implementRef.current?.updateLive({ scale: +e.target.value })}
                      className="overlay-slider" />
                  </div>
                </div>
                <div className="row">
                  <div className="field" style={{ flex: '1 1 0' }}>
                    <label>Rotation ({Math.round(implementValues.rotation ?? 0)}°)</label>
                    <input type="range" min="0" max="360" step="1" value={implementValues.rotation ?? 0}
                      onChange={(e) => implementRef.current?.updateLive({ rotation: +e.target.value })}
                      className="overlay-slider" />
                  </div>
                </div>
                <div className="row">
                  <div className="field" style={{ flex: '1 1 0' }}>
                    <label>Opacity ({Math.round((implementValues.opacity ?? 0.75) * 100)}%)</label>
                    <input type="range" min="0.05" max="1" step="0.05" value={implementValues.opacity ?? 0.75}
                      onChange={(e) => implementRef.current?.updateLive({ opacity: +e.target.value })}
                      className="overlay-slider" />
                  </div>
                </div>
                <div className="row">
                  <button className="zone-author-btn is-active" type="button" onClick={handleImplementLockAndAdd} style={{ flex: 1 }}>Lock & Add to tree</button>
                  <button className="zone-author-btn is-danger" type="button" onClick={handleImplementCancel}>Cancel</button>
                </div>
              </div>
            )}

            {/* ── Zone author panel (hidden during implement mode) ── */}
            {!implementMode && authorMode && panelCollapsed && (
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
            {!implementMode && authorMode && !panelCollapsed && (
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
                  <button className="zone-author-btn" type="button" onClick={handleUndo} disabled={authorPoints.length === 0}>Undo</button>
                  <button className="zone-author-btn" type="button" onClick={handleClear} disabled={authorPoints.length === 0}>Clear</button>
                  <button className="zone-author-btn is-active" type="button" onClick={handleSaveDraft} disabled={authorPoints.length < 3}>
                    {editingId ? 'Update zone' : 'Save zone'}
                  </button>
                  {editingId && (
                    <button className="zone-author-btn is-danger" type="button" onClick={handleCancelEdit}>Cancel edit</button>
                  )}
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

                {/* ── Overlays section ── */}
                <div className="divider" />
                <div className="drafts-head">
                  <span>Sub-maps ({overlayDrafts.filter(o => !o.locked).length})</span>
                  <select
                    className="zone-author-btn"
                    value=""
                    onChange={(e) => { if (e.target.value) handleAddOverlay(e.target.value); }}
                    style={{ padding: '2px 8px', fontSize: 10, minWidth: 0 }}
                  >
                    <option value="">+ Add</option>
                    {OVERLAY_CATALOG.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                {overlayDrafts.filter(ov => !ov.locked).map(ov => {
                  const isActive = ov.id === activeOverlayId;
                  return (
                    <div key={ov.id} className={`overlay-row ${isActive ? 'is-active' : ''}`}>
                      <div className="overlay-row-head">
                        <span className="drname">
                          <span className={`lvl-tag ${ov.floor === viewFloor ? '' : 'is-unset'}`}>F{ov.floor ?? 0}</span>
                          <span className="drlabel">{ov.name}</span>
                          {ov.locked && <span className="lock-badge">locked</span>}
                        </span>
                        <span className="row" style={{ gap: 4 }}>
                          <button
                            className="edit-btn"
                            type="button"
                            onClick={() => setActiveOverlayId(isActive ? null : ov.id)}
                          >
                            {isActive ? 'Close' : 'Edit'}
                          </button>
                          <button type="button" onClick={() => handleDeleteOverlay(ov.id)}>Del</button>
                        </span>
                      </div>
                      {isActive && (
                        <div className="overlay-controls">
                          {!ov.locked && <div className="hint" style={{ fontSize: 9, marginBottom: 2 }}>1 finger = drag · 2 fingers = pinch scale + twist rotate</div>}
                          <div className="row">
                            <div className="field" style={{ flex: '0 0 70px' }}>
                              <label>Floor</label>
                              <div className="row" style={{ gap: 2 }}>
                                <button className="zone-author-btn" type="button" onClick={() => handleUpdateOverlay(ov.id, { floor: (ov.floor ?? 0) - 1 })} style={{ padding: '1px 6px' }}>−</button>
                                <span style={{ minWidth: 24, textAlign: 'center' }}>{ov.floor ?? 0}</span>
                                <button className="zone-author-btn" type="button" onClick={() => handleUpdateOverlay(ov.id, { floor: (ov.floor ?? 0) + 1 })} style={{ padding: '1px 6px' }}>+</button>
                              </div>
                            </div>
                            <div className="field" style={{ flex: '1 1 0' }}>
                              <label>Scale ({(ov.scale ?? 1).toFixed(2)}×)</label>
                              <input type="range" min="0.1" max="5" step="0.05" value={ov.scale ?? 1}
                                onChange={(e) => handleUpdateOverlay(ov.id, { scale: +e.target.value })}
                                className="overlay-slider" />
                            </div>
                          </div>
                          <div className="row">
                            <div className="field" style={{ flex: '1 1 0' }}>
                              <label>Rotation ({ov.rotation ?? 0}°)</label>
                              <input type="range" min="0" max="360" step="1" value={ov.rotation ?? 0}
                                onChange={(e) => handleUpdateOverlay(ov.id, { rotation: +e.target.value })}
                                className="overlay-slider" />
                            </div>
                          </div>
                          <div className="row">
                            <div className="field" style={{ flex: '1 1 0' }}>
                              <label>Opacity ({Math.round((ov.opacity ?? 1) * 100)}%)</label>
                              <input type="range" min="0.05" max="1" step="0.05" value={ov.opacity ?? 1}
                                onChange={(e) => handleUpdateOverlay(ov.id, { opacity: +e.target.value })}
                                className="overlay-slider" />
                            </div>
                          </div>
                          <div className="row">
                            <button
                              className={`zone-author-btn ${ov.locked ? 'is-active' : ''}`}
                              type="button"
                              onClick={() => handleUpdateOverlay(ov.id, { locked: !ov.locked })}
                            >
                              {ov.locked ? 'Unlock' : 'Lock'}
                            </button>
                            {ov.locked && (
                              drafts.some(d => d.overlayId === ov.id)
                                ? <button className="zone-author-btn is-danger" type="button" onClick={() => handleRemoveOverlayFromTree(ov.id)}>Remove from tree</button>
                                : <button className="zone-author-btn is-active" type="button" onClick={() => handleAddOverlayToTree(ov.id)}>Add to tree</button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 10 }}>
              <CardHeader>
                {implementMode
                  ? 'Implement mode · drag to place · Lock & Add when done'
                  : authorMode
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
