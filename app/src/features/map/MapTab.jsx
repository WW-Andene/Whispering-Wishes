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
        .map-card .kuro-header { background: ${MAP_BG_TRANSPARENT} !important; backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px); }
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
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 }}>
              <CardHeader>Interactive Map</CardHeader>
            </div>
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 10 }}>
              <CardHeader>Pinch to zoom · Drag to pan</CardHeader>
            </div>
          </div>
        </div>

      </div>
      </div>
    </>
  );
}
