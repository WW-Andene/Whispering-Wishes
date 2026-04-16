import React, { useEffect, useRef, useState } from 'react';
import { CardHeader } from '../../shared/components/Card.jsx';
import { TabBackground } from '../../shared/backgrounds/TabBackground.jsx';

const MAP_W = 16384;
const MAP_H = 16384;
const TILE_SIZE = 256;
const MAX_ZOOM = 6;
const MAP_BG = '#062633';
const MAP_BG_TRANSPARENT = 'rgba(6, 38, 51, 0.55)';
const BASE = import.meta.env.BASE_URL || '/';

export default function MapTab({ navPadding = 80 }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const [status, setStatus] = useState('Loading map...');

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  useEffect(() => {
    let map = null;
    let cancelled = false;

    import('leaflet').then(({ default: L }) => {
      if (cancelled || !containerRef.current) return;

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
      <style>{`
        .map-card .kuro-header { background: transparent !important; }
      `}</style>
      <div role="tabpanel" id="tabpanel-map" aria-labelledby="tab-map" tabIndex="0">
      <div className="kuro-calc space-y-3 tab-content">
        <TabBackground id="map" />

        <div className="kuro-card map-card" style={{ height: `calc(100dvh - ${navPadding + 93}px)`, overflow: 'hidden', background: MAP_BG_TRANSPARENT }}>
          <div className="kuro-card-inner" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <CardHeader>Interactive Map</CardHeader>
            <div style={{ flex: 1, overflow: 'hidden', position: 'relative', background: MAP_BG }}>
              {status && (
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888', zIndex: 1000, pointerEvents: 'none' }}>
                  {status}
                </div>
              )}
              <div
                ref={containerRef}
                className="leaflet-map-bg"
                style={{ position: 'absolute', inset: 0, background: MAP_BG }}
              />
            </div>
            <CardHeader>Pinch to zoom · Drag to pan</CardHeader>
          </div>
        </div>

      </div>
      </div>
    </>
  );
}
