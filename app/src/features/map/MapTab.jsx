// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — MapTab
// Interactive tiled map using Leaflet with CRS.Simple (pixel coordinates).
// Tiles generated from 12288×16384 source via libvips dzsave (Google layout).
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useEffect, useRef, useState } from 'react';

// Map dimensions in pixels
const MAP_W = 12288;
const MAP_H = 16384;
const TILE_SIZE = 256;
const MAX_ZOOM = 6;
const MIN_ZOOM = 0;
const BASE = import.meta.env.BASE_URL || '/';

export default function MapTab() {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let map = null;

    const init = async () => {
      try {
        const L = (await import('leaflet')).default;

        if (!containerRef.current) return;

        map = L.map(containerRef.current, {
          crs: L.CRS.Simple,
          minZoom: MIN_ZOOM,
          maxZoom: MAX_ZOOM,
          zoomSnap: 0.5,
          zoomDelta: 0.5,
          attributionControl: false,
          zoomControl: false,
        });

        // Image bounds: top-left [0,0] → bottom-right [width, height]
        const southWest = map.unproject([0, MAP_H], MAX_ZOOM);
        const northEast = map.unproject([MAP_W, 0], MAX_ZOOM);
        const bounds = L.latLngBounds(southWest, northEast);

        map.setMaxBounds(bounds.pad(0.1));
        map.fitBounds(bounds);

        // vips dzsave Google layout: {z}/{y}/{x}.webp
        L.tileLayer(BASE + 'map-tiles/{z}/{y}/{x}.webp', {
          minZoom: MIN_ZOOM,
          maxZoom: MAX_ZOOM,
          tileSize: TILE_SIZE,
          noWrap: true,
          bounds,
          errorTileUrl: BASE + 'map-tiles/blank.png',
        }).addTo(map);

        L.control.zoom({ position: 'bottomright' }).addTo(map);

        // Force Leaflet to recalculate container size
        setTimeout(() => map.invalidateSize(), 100);

        mapRef.current = map;
      } catch (err) {
        console.error('Map init failed:', err);
        setError(err.message);
      }
    };

    init();

    return () => {
      if (map) { map.remove(); }
      mapRef.current = null;
    };
  }, []);

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 text-red-400">
        Map failed to load: {error}
      </div>
    );
  }

  return (
    <div className="relative w-full" style={{ height: 'calc(100vh - 120px)' }}>
      <div
        ref={containerRef}
        className="w-full h-full rounded-xl overflow-hidden"
        style={{ background: '#0a0a0a', minHeight: '400px' }}
      />
    </div>
  );
}
