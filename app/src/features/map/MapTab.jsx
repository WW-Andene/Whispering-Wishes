import React, { useCallback, useEffect, useRef, useState } from 'react';
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

export default function MapTab({ navPadding = 80 }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const leafletRef = useRef(null);
  const authorLayerRef = useRef(null);
  const headerTapsRef = useRef([]);

  const [status, setStatus] = useState('Loading map...');
  const [mapReady, setMapReady] = useState(false);
  const [authorEnabled, setAuthorEnabled] = useState(() => {
    if (typeof localStorage === 'undefined') return false;
    return localStorage.getItem(AUTHOR_FLAG_KEY) === '1';
  });
  const [authorMode, setAuthorMode] = useState(false);
  const [authorPoints, setAuthorPoints] = useState([]);
  const [jsonSnippet, setJsonSnippet] = useState('');
  const [toast, setToast] = useState('');

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
      // Use ceil so map always fully covers the container (no black bands)
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

      // Measure header/footer heights so pan bounds + initial fit account for overlays
      const cardInner = container.parentElement;
      const headerH = cardInner?.querySelector('.kuro-header')?.offsetHeight || 48;
      const footerH = cardInner?.querySelectorAll('.kuro-header')[1]?.offsetHeight || 48;

      // Extend maxBounds so user can pan map content out from under overlays.
      // Scale padding so it works at the worst (lowest) zoom level too.
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

      // Zone overlays — pixel coords in mapZones.js → Leaflet lat/lng via unproject
      const pxToLatLng = ([x, y]) => map.unproject([x, y], MAX_ZOOM);
      MAP_ZONES.forEach(zone => {
        if (!Array.isArray(zone.polygon) || zone.polygon.length < 3) return;
        const color = zone.color || '#edaf18';
        const poly = L.polygon(zone.polygon.map(pxToLatLng), {
          color,
          weight: 1.5,
          opacity: 0.85,
          fillColor: color,
          fillOpacity: 0.10,
          className: 'zone-polygon',
        }).addTo(map);
        const popupBody = zone.note ? `<div class="zone-popup-note">${zone.note}</div>` : '';
        poly.bindPopup(
          `<div class="zone-popup-title">${zone.name || zone.id}</div>${popupBody}`,
          { className: 'zone-popup', closeButton: false }
        );
        poly.bindTooltip(zone.name || zone.id, { sticky: true, className: 'zone-tooltip' });
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

  // Render live author polygon/points
  useEffect(() => {
    const map = mapRef.current;
    const L = leafletRef.current;
    if (!map || !L || !mapReady) return;
    if (authorLayerRef.current) {
      map.removeLayer(authorLayerRef.current);
      authorLayerRef.current = null;
    }
    if (!authorMode || authorPoints.length === 0) return;
    const group = L.layerGroup();
    const latLngs = authorPoints.map(([x, y]) => map.unproject([x, y], MAX_ZOOM));
    if (latLngs.length >= 3) {
      L.polygon(latLngs, {
        color: '#edaf18', weight: 1.5, fillColor: '#edaf18', fillOpacity: 0.12, dashArray: '4 3',
        className: 'zone-author-poly',
      }).addTo(group);
    } else if (latLngs.length >= 2) {
      L.polyline(latLngs, {
        color: '#edaf18', weight: 1.5, dashArray: '4 3', className: 'zone-author-poly',
      }).addTo(group);
    }
    latLngs.forEach((ll, i) => {
      L.circleMarker(ll, {
        radius: 5, color: '#edaf18', fillColor: '#080c14', fillOpacity: 1, weight: 1.5,
      }).bindTooltip(String(i + 1), { permanent: true, direction: 'top', className: 'zone-author-label' }).addTo(group);
    });
    group.addTo(map);
    authorLayerRef.current = group;
  }, [authorMode, authorPoints, mapReady]);

  // Triple-tap on "Interactive Map" header toggles author-enabled flag
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
  const handleCopy = async () => {
    if (authorPoints.length < 3) return;
    const snippet =
`{
  id: 'new-zone',
  name: 'New zone',
  polygon: [${authorPoints.map(([x, y]) => `[${x}, ${y}]`).join(', ')}],
},`;
    setJsonSnippet(snippet);
    try {
      await navigator.clipboard.writeText(snippet);
      setToast('Copied to clipboard');
      setTimeout(() => setToast(''), 1800);
    } catch {
      setToast('Long-press the text below to copy');
      setTimeout(() => setToast(''), 2400);
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
          color: #edaf18;
          border: 1px solid rgba(237, 175, 24, 0.4);
          font-family: 'JetBrains Mono', ui-monospace, monospace;
          font-size: 11px;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          padding: 4px 8px;
          box-shadow: 0 0 12px rgba(6, 10, 24, 0.6);
        }
        .leaflet-tooltip.zone-tooltip::before { display: none; }
        .leaflet-popup.zone-popup .leaflet-popup-content-wrapper {
          background: rgba(8, 12, 20, 0.95);
          color: #e8e8e8;
          border: 1px solid rgba(237, 175, 24, 0.4);
          border-radius: 4px;
          box-shadow: 0 0 24px rgba(6, 10, 24, 0.7);
        }
        .leaflet-popup.zone-popup .leaflet-popup-tip { background: rgba(8, 12, 20, 0.95); border: 1px solid rgba(237, 175, 24, 0.4); }
        .leaflet-popup.zone-popup .zone-popup-title { font-family: 'Cinzel', serif; font-size: 14px; color: #edaf18; letter-spacing: 0.06em; margin-bottom: 4px; }
        .leaflet-popup.zone-popup .zone-popup-note { font-size: 12px; color: #b8b8b8; line-height: 1.45; }
        .leaflet-tooltip.zone-author-label {
          background: #080c14; color: #edaf18; border: 1px solid #edaf18;
          font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 10px;
          padding: 1px 5px; box-shadow: 0 0 6px rgba(237, 175, 24, 0.35);
        }
        .leaflet-tooltip.zone-author-label::before { display: none; }
        .zone-author-btn {
          font-family: 'JetBrains Mono', ui-monospace, monospace;
          font-size: 11px; letter-spacing: 0.06em; text-transform: uppercase;
          padding: 4px 10px; border-radius: 3px; cursor: pointer;
          background: rgba(8, 12, 20, 0.85); color: #edaf18;
          border: 1px solid rgba(237, 175, 24, 0.45);
          transition: background 160ms, border-color 160ms;
        }
        .zone-author-btn:hover { background: rgba(237, 175, 24, 0.15); border-color: #edaf18; }
        .zone-author-btn[disabled] { opacity: 0.4; cursor: not-allowed; }
        .zone-author-btn.is-active { background: rgba(237, 175, 24, 0.2); border-color: #edaf18; }
        .zone-author-panel {
          position: absolute; left: 12px; right: 12px; bottom: 56px; z-index: 20;
          background: rgba(8, 12, 20, 0.92); border: 1px solid rgba(237, 175, 24, 0.4);
          border-radius: 4px; padding: 10px 12px;
          box-shadow: 0 0 24px rgba(6, 10, 24, 0.7);
          backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px);
          font-family: 'JetBrains Mono', ui-monospace, monospace;
          color: #e8e8e8; font-size: 12px;
          display: flex; flex-direction: column; gap: 8px;
        }
        .zone-author-panel .row { display: flex; gap: 6px; flex-wrap: wrap; align-items: center; }
        .zone-author-panel .count { color: #edaf18; font-weight: 700; }
        .zone-author-panel .hint { color: #8a8a8a; font-size: 10px; letter-spacing: 0.04em; text-transform: uppercase; }
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
          background: rgba(8, 12, 20, 0.95); color: #edaf18;
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
            {/* Map fills the entire card */}
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
            {/* Overlay header and footer on top of map */}
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
                    {authorMode ? 'Exit draw' : 'Draw zone'}
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
                  <button className="zone-author-btn" type="button" onClick={handleUndo} disabled={authorPoints.length === 0}>Undo</button>
                  <button className="zone-author-btn" type="button" onClick={handleClear} disabled={authorPoints.length === 0}>Clear</button>
                  <button className="zone-author-btn" type="button" onClick={handleCopy} disabled={authorPoints.length < 3}>Copy JSON</button>
                </div>
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
                  ? `Drawing: ${authorPoints.length} point${authorPoints.length === 1 ? '' : 's'} · need 3+ to copy`
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
