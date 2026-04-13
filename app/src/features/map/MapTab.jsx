// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — MapTab
// Interactive tiled map using Leaflet with CRS.Simple (pixel coordinates).
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useEffect, useRef, useState } from 'react';
import { Card, CardHeader, CardBody } from '../../shared/components/Card.jsx';

const MAP_W = 12288;
const MAP_H = 16384;
const TILE_SIZE = 256;
const MAX_ZOOM = 6;
const MAP_BG = '#062633';
const BASE = import.meta.env.BASE_URL || '/';

export default function MapTab() {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const [status, setStatus] = useState('Loading map...');

  useEffect(() => {
    let map = null;
    let cancelled = false;

    import('leaflet').then(({ default: L }) => {
      if (cancelled || !containerRef.current) return;

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

      map.setMaxBounds(bounds);
      map.fitBounds(bounds);

      L.tileLayer(BASE + 'map-tiles/{z}/{y}/{x}.webp', {
        minZoom,
        maxZoom: MAX_ZOOM,
        tileSize: TILE_SIZE,
        noWrap: true,
        bounds,
        errorTileUrl: BASE + 'map-tiles/blank.png',
      }).addTo(map);

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      setTimeout(() => { if (map) map.invalidateSize(); }, 200);

      mapRef.current = map;
      setStatus(null);
    }).catch(err => {
      if (!cancelled) setStatus('Error: ' + err.message);
    });

    return () => {
      cancelled = true;
      if (map) { map.remove(); map = null; }
      mapRef.current = null;
    };
  }, []);

  return (
    <>
      <style>{`.leaflet-map-bg, .leaflet-map-bg .leaflet-container { background: ${MAP_BG} !important; }`}</style>
      <div className="kuro-card" style={{ height: 'calc(100dvh - 92px)' }}>
        <div className="kuro-card-inner" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <CardHeader>Interactive Map</CardHeader>
          <div className="kuro-body flex-1 flex flex-col" style={{ overflow: 'hidden' }}>
            {status && <div className="text-center text-gray-500 text-sm py-4">{status}</div>}
            <div
              ref={containerRef}
              className="leaflet-map-bg flex-1"
              style={{ width: '100%', background: MAP_BG, borderRadius: '8px', overflow: 'hidden' }}
            />
          </div>
          <CardHeader>Pinch to zoom · Drag to pan</CardHeader>
        </div>
      </div>
    </>
  );
}
