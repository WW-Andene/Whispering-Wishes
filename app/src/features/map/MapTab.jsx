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
const MAP_BG = '#162a3a';
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

      // Calculate the minimum zoom so the map always fills the container
      const container = containerRef.current;
      const minZoomFit = Math.ceil(Math.log2(
        Math.max(container.clientWidth / MAP_W, container.clientHeight / MAP_H)
      ) + MAX_ZOOM);
      const minZoom = Math.max(0, minZoomFit);

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
      <style>{`.leaflet-map-bg .leaflet-container, .leaflet-map-bg { background: ${MAP_BG} !important; }`}</style>
      <Card>
        <CardHeader>Interactive Map</CardHeader>
        <CardBody style={{ padding: 0 }}>
          <div style={{ width: '100%', height: 'calc(100vh - 200px)', minHeight: '300px', position: 'relative' }}>
            {status && (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888', zIndex: 1000, pointerEvents: 'none' }}>
                {status}
              </div>
            )}
            <div
              ref={containerRef}
              className="leaflet-map-bg"
              style={{ width: '100%', height: '100%', background: MAP_BG, borderRadius: '0 0 12px 12px', overflow: 'hidden' }}
            />
          </div>
        </CardBody>
      </Card>
    </>
  );
}
