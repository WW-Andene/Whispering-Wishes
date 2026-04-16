import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CardHeader } from '../../shared/components/Card.jsx';
import { TabBackground } from '../../shared/backgrounds/TabBackground.jsx';
import { MAP_ZONES } from '../../data/mapZones.js';

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
  const [jsonSnippet, setJsonSnippet] = useState('');
  const [toast, setToast] = useState('');

  const parentOptions = useMemo(() => {
    const canon = MAP_ZONES.map(z => ({ id: z.id, name: z.name || z.id, kind: 'canonical' }));
    const drafted = drafts.map(z => ({ id: z.id, name: z.name || z.id, kind: 'draft' }));
    return [...canon, ...drafted];
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
      const paddedBounds = L.latLngBounds(
        [southWest.lat - bottomPad, southWest.lng],
        [northEast.lat + topPad, northEast.lng]
      );

      map.setMaxBounds(paddedBounds);
      map.fitBounds(bounds, { paddingTopLeft: [0, headerH], paddingBottomRight: [0, footerH] });

      L.tileLayer(BASE + 'map-tiles/{z}/{y}/{x}.webp', {
        minZoom,
        maxZoom: MAX_ZOOM,
        tileSize: TILE_SIZE,
        noWrap: true,
        bounds,
        errorTileUrl: BASE + 'map-tiles/blank.png',
      }).addTo(map);

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
        poly.bindPopup(`<div class="zone-popup-title">${title}</div>${popupBody}`, { className: 'zone-popup', closeButton: false });
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
    const handler = (e) => {
      const pt = map.project(e.latlng, MAX_ZOOM);
      setAuthorPoints(prev => [...prev, [Math.round(pt.x), Math.round(pt.y)]]);
    };
    map.on('click', handler);
    return () => {
      map.off('click', handler);
      if (map.dragging) map.dragging.enable();
    };
  }, [authorMode, mapReady]);

  // Render live in-progress polygon/points
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
    if (latLngs.length >= 3) {
      L.polygon(latLngs, {
        color: COLOR_ACTIVE, weight: 1.5, fillColor: COLOR_ACTIVE, fillOpacity: 0.12,
        dashArray: '4 3', className: 'zone-author-poly',
      }).addTo(group);
    } else if (latLngs.length >= 2) {
      L.polyline(latLngs, {
        color: COLOR_ACTIVE, weight: 1.5, dashArray: '4 3', className: 'zone-author-poly',
      }).addTo(group);
    }
    latLngs.forEach((ll, i) => {
      L.circleMarker(ll, {
        radius: 5, color: COLOR_ACTIVE, fillColor: '#080c14', fillOpacity: 1, weight: 1.5,
      }).bindTooltip(String(i + 1), { permanent: true, direction: 'top', className: 'zone-author-label' }).addTo(group);
    });
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
    if (drafts.length === 0) return;
    const group = L.layerGroup();
    const sorted = [...drafts].sort((a, b) => (a.parentId ? 1 : 0) - (b.parentId ? 1 : 0));
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
  }, [drafts, mapReady]);

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
      if (!next) { setAuthorPoints([]); setJsonSnippet(''); }
      return next;
    });
  }, []);

  const handleUndo = () => setAuthorPoints(prev => prev.slice(0, -1));
  const handleClear = () => { setAuthorPoints([]); setJsonSnippet(''); };

  const showToast = (msg, ms = 1800) => {
    setToast(msg);
    setTimeout(() => setToast(''), ms);
  };

  const handleSaveDraft = () => {
    if (authorPoints.length < 3) return;
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
    };
    const updated = [...drafts, next];
    setDrafts(updated);
    saveDrafts(updated);
    setAuthorPoints([]);
    setDraftName('');
    setDraftParent('');
    setJsonSnippet('');
    showToast(`Saved "${name}"`);
  };

  const handleDeleteDraft = (id) => {
    const updated = drafts.filter(d => d.id !== id);
    setDrafts(updated);
    saveDrafts(updated);
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
        .zone-author-panel .draft-row .drname { color: #e8e8e8; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; min-width: 0; }
        .zone-author-panel .draft-row .drsub { color: #8a8a8a; margin-left: 4px; }
        .zone-author-panel .draft-row button {
          background: transparent; border: 1px solid rgba(248, 113, 113, 0.4);
          color: #f87171; padding: 1px 7px; border-radius: 2px; cursor: pointer;
          font-family: inherit; font-size: 10px;
        }
        .zone-author-panel .draft-row button:hover { background: rgba(248, 113, 113, 0.12); }
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

            {toast && <div className="zone-author-toast" role="status">{toast}</div>}

            {authorMode && (
              <div className="zone-author-panel" role="group" aria-label="Zone author controls">
                <div className="row">
                  <span className="count">{authorPoints.length}</span>
                  <span className="hint">point{authorPoints.length === 1 ? '' : 's'} · tap map to add</span>
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
                      {parentOptions.length > 0 && (
                        <optgroup label="Existing zones">
                          {parentOptions.map(p => (
                            <option key={p.id} value={p.id}>{p.kind === 'draft' ? '[draft] ' : ''}{p.name}</option>
                          ))}
                        </optgroup>
                      )}
                    </select>
                  </div>
                </div>
                <div className="row">
                  <button className="zone-author-btn" type="button" onClick={handleUndo} disabled={authorPoints.length === 0}>Undo</button>
                  <button className="zone-author-btn" type="button" onClick={handleClear} disabled={authorPoints.length === 0}>Clear</button>
                  <button className="zone-author-btn is-active" type="button" onClick={handleSaveDraft} disabled={authorPoints.length < 3}>Save zone</button>
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
                    <div>
                      {drafts.map(d => {
                        const parent = d.parentId
                          ? (MAP_ZONES.find(p => p.id === d.parentId)?.name
                             || drafts.find(p => p.id === d.parentId)?.name
                             || d.parentId)
                          : null;
                        return (
                          <div key={d.id} className="draft-row">
                            <span className="drname">
                              {d.name}
                              {parent && <span className="drsub">› {parent}</span>}
                            </span>
                            <button type="button" onClick={() => handleDeleteDraft(d.id)} aria-label={`Delete ${d.name}`}>Delete</button>
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
              </div>
            )}

            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 10 }}>
              <CardHeader>
                {authorMode
                  ? `Drawing: ${authorPoints.length} point${authorPoints.length === 1 ? '' : 's'} · need 3+ to save`
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
