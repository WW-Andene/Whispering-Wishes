import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CardHeader } from '../../shared/components/Card.jsx';
import { TabBackground } from '../../shared/backgrounds/TabBackground.jsx';
import { MAP_ZONES } from '../../data/mapZones.js';
import { OVERLAY_CATALOG, loadOverlayDrafts, saveOverlayDrafts } from '../../data/mapOverlays.js';

const MAP_W = 16384;
const MAP_H = 16384;
const TILE_SIZE = 256;
const MAX_ZOOM = 6;
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

  // Overlay + floor state
  const [viewFloor, setViewFloor] = useState(0);
  const [overlayDrafts, setOverlayDrafts] = useState(loadOverlayDrafts);
  const [activeOverlayId, setActiveOverlayId] = useState(null);
  const tileLayerRef = useRef(null);
  const overlayLayerRef = useRef(null);
  const overlayDragRef = useRef(null);

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
      ) + MAX_ZOOM));

      map = L.map(container, {
        crs: L.CRS.Simple,
        minZoom,
        maxZoom: MAX_ZOOM,
        maxBoundsViscosity: 1.0,
        zoomSnap: 0.5,
        zoomDelta: 0.5,
        attributionControl: false,
        zoomControl: false,
      });

      const southWest = map.unproject([0, MAP_H], MAX_ZOOM);
      const northEast = map.unproject([MAP_W, 0], MAX_ZOOM);
      const bounds = L.latLngBounds(southWest, northEast);

      const cardInner = container.parentElement;
      const headerH = cardInner?.querySelector('.kuro-header')?.offsetHeight || 48;
      const footerH = cardInner?.querySelectorAll('.kuro-header')[1]?.offsetHeight || 48;

      const scale = Math.pow(2, MAX_ZOOM - minZoom);
      const pxToLat = (px) => map.unproject([0, 0], MAX_ZOOM).lat - map.unproject([0, px], MAX_ZOOM).lat;
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
        tileSize: TILE_SIZE,
        noWrap: true,
        bounds,
        errorTileUrl: BASE + 'map-tiles/blank.png',
      }).addTo(map);
      tileLayerRef.current = tileLayer;

      // Canonical zone overlays — render parents first, then sub-zones on top
      const pxToLatLng = ([x, y]) => map.unproject([x, y], MAX_ZOOM);
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

  // Author mode: attach click handler and disable dragging
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) return;
    if (!authorMode) return;
    map.dragging.disable();
    if (map.doubleClickZoom) map.doubleClickZoom.disable();
    const handler = (e) => {
      // If a canonical-zone popup opened from the same click, close it so it
      // doesn't visually shift the view or cover the newly placed point.
      map.closePopup();
      const pt = map.project(e.latlng, MAX_ZOOM);
      setAuthorPoints(prev => [...prev, [Math.round(pt.x), Math.round(pt.y)]]);
    };
    map.on('click', handler);
    return () => {
      map.off('click', handler);
      if (map.dragging) map.dragging.enable();
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
    const latLngs = authorPoints.map(([x, y]) => map.unproject([x, y], MAX_ZOOM));

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
        const np = map.project(e.target.getLatLng(), MAX_ZOOM);
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
        const midLL = map.unproject(midPx, MAX_ZOOM);
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

  // Render saved session drafts (cyan)
  useEffect(() => {
    const map = mapRef.current;
    const L = leafletRef.current;
    if (!map || !L || !mapReady) return;
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
      const latLngs = z.polygon.map(([x, y]) => map.unproject([x, y], MAX_ZOOM));
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
  }, [drafts, editingId, mapReady]);

  // Render image overlays + apply floor-based brightness
  useEffect(() => {
    const map = mapRef.current;
    const L = leafletRef.current;
    if (!map || !L || !mapReady) return;

    // Clear previous overlay layers
    if (overlayLayerRef.current) {
      map.removeLayer(overlayLayerRef.current);
      overlayLayerRef.current = null;
    }

    // Floor-based brightness on the base tile layer
    const tileEl = tileLayerRef.current?.getContainer?.();
    if (tileEl) {
      const dist = Math.abs(viewFloor);
      tileEl.style.filter = dist === 0 ? '' : `brightness(${Math.max(0.15, 1 - 0.25 * dist)})`;
      tileEl.style.transition = 'filter 300ms';
    }

    if (overlayDrafts.length === 0) return;

    const group = L.layerGroup();
    const pxToLL = ([x, y]) => map.unproject([x, y], MAX_ZOOM);

    overlayDrafts.forEach(ov => {
      if (!ov.center || !ov.imageUrl) return;
      const nw = ov.naturalWidth || 4096;
      const nh = ov.naturalHeight || 4096;
      const s = ov.scale || 1;
      const halfW = (nw * s) / 2;
      const halfH = (nh * s) / 2;
      const [cx, cy] = ov.center;
      const sw = pxToLL([cx - halfW, cy + halfH]);
      const ne = pxToLL([cx + halfW, cy - halfH]);
      const bounds = L.latLngBounds(sw, ne);
      const url = (BASE + ov.imageUrl).replace(/\/\//g, '/');
      const overlay = L.imageOverlay(url, bounds, { interactive: true, className: 'map-overlay-img' });
      overlay.addTo(group);

      // Rotation via CSS
      const el = overlay.getElement?.();
      if (el) {
        if (ov.rotation) {
          el.style.transformOrigin = 'center center';
          el.style.transform = `rotate(${ov.rotation}deg)`;
        }
        // Floor brightness
        const floorDist = Math.abs((ov.floor ?? 0) - viewFloor);
        el.style.filter = floorDist === 0 ? '' : `brightness(${Math.max(0.15, 1 - 0.25 * floorDist)})`;
        el.style.transition = 'filter 300ms';
        // Lock cursor
        el.style.cursor = ov.locked ? 'default' : 'grab';
        // Active highlight
        if (ov.id === activeOverlayId) {
          el.style.outline = '2px solid #edaf18';
          el.style.outlineOffset = '2px';
        }
      }

      // Click to select in author mode
      overlay.on('click', (e) => {
        L.DomEvent.stopPropagation(e);
        if (authorMode || authorEnabled) {
          setActiveOverlayId(prev => prev === ov.id ? null : ov.id);
        }
      });

      // Drag support for unlocked overlays in author mode
      if (authorMode && !ov.locked && el) {
        let startPx = null;
        let startCenter = null;
        const onDown = (evt) => {
          evt.stopPropagation();
          evt.preventDefault();
          const touch = evt.touches ? evt.touches[0] : evt;
          startPx = [touch.clientX, touch.clientY];
          startCenter = [...ov.center];
          document.addEventListener('mousemove', onMove, { passive: false });
          document.addEventListener('mouseup', onUp);
          document.addEventListener('touchmove', onMove, { passive: false });
          document.addEventListener('touchend', onUp);
          el.style.cursor = 'grabbing';
        };
        const onMove = (evt) => {
          if (!startPx) return;
          evt.preventDefault();
          const touch = evt.touches ? evt.touches[0] : evt;
          const dx = touch.clientX - startPx[0];
          const dy = touch.clientY - startPx[1];
          // Convert CSS pixel delta to map pixel delta at current zoom
          const zoom = map.getZoom();
          const scaleFactor = Math.pow(2, MAX_ZOOM - zoom);
          const newCenter = [
            Math.round(startCenter[0] + dx * scaleFactor),
            Math.round(startCenter[1] + dy * scaleFactor),
          ];
          setOverlayDrafts(prev => {
            const next = prev.map(o => o.id === ov.id ? { ...o, center: newCenter } : o);
            saveOverlayDrafts(next);
            return next;
          });
        };
        const onUp = () => {
          startPx = null;
          startCenter = null;
          el.style.cursor = 'grab';
          document.removeEventListener('mousemove', onMove);
          document.removeEventListener('mouseup', onUp);
          document.removeEventListener('touchmove', onMove);
          document.removeEventListener('touchend', onUp);
        };
        el.addEventListener('mousedown', onDown);
        el.addEventListener('touchstart', onDown, { passive: false });
      }
    });

    group.addTo(map);
    overlayLayerRef.current = group;
  }, [overlayDrafts, viewFloor, mapReady, authorMode, authorEnabled, activeOverlayId]);

  // Overlay management helpers
  const handleAddOverlay = (catalogId) => {
    const cat = OVERLAY_CATALOG.find(c => c.id === catalogId);
    if (!cat) return;
    const map = mapRef.current;
    const center = map
      ? (() => { const c = map.getCenter(); const pt = map.project(c, MAX_ZOOM); return [Math.round(pt.x), Math.round(pt.y)]; })()
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
      naturalWidth: cat.naturalWidth,
      naturalHeight: cat.naturalHeight,
    };
    const next = [...overlayDrafts, placement];
    setOverlayDrafts(next);
    saveOverlayDrafts(next);
    setActiveOverlayId(placement.id);
    showToast(`Added "${cat.name}"`);
  };

  const handleUpdateOverlay = (id, patch) => {
    const next = overlayDrafts.map(o => o.id === id ? { ...o, ...patch } : o);
    setOverlayDrafts(next);
    saveOverlayDrafts(next);
  };

  const handleDeleteOverlay = (id) => {
    const next = overlayDrafts.filter(o => o.id !== id);
    setOverlayDrafts(next);
    saveOverlayDrafts(next);
    if (activeOverlayId === id) setActiveOverlayId(null);
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
        .map-overlay-img { transition: filter 300ms; }
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
                  <span>Sub-maps ({overlayDrafts.length})</span>
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
                {overlayDrafts.map(ov => {
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
                            <button
                              className={`zone-author-btn ${ov.locked ? 'is-active' : ''}`}
                              type="button"
                              onClick={() => handleUpdateOverlay(ov.id, { locked: !ov.locked })}
                            >
                              {ov.locked ? 'Unlock' : 'Lock'}
                            </button>
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
