// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — MapTab
// Interactive tiled map using Leaflet with CRS.Simple (pixel coordinates).
// Tiles generated from 12288×16384 source via libvips dzsave (Google layout).
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useEffect, useRef } from 'react';
import L from 'leaflet';

// Map dimensions in pixels
const MAP_W = 12288;
const MAP_H = 16384;
const TILE_SIZE = 256;
const MAX_ZOOM = 6;
const MIN_ZOOM = 0;

export default function MapTab() {
  const containerRef = useRef(null);
  const mapRef = useRef(null);

  useEffect(() => {
    if (mapRef.current) return;

    // CRS.Simple treats (lat, lng) as (y, x) in pixels, with y inverted.
    // unproject converts pixel coords → LatLng at a given zoom.
    const map = L.map(containerRef.current, {
      crs: L.CRS.Simple,
      minZoom: MIN_ZOOM,
      maxZoom: MAX_ZOOM,
      zoomSnap: 0.5,
      zoomDelta: 0.5,
      attributionControl: false,
      zoomControl: false,
    });

    // Image bounds in LatLng: top-left is [0,0], bottom-right is [-height, width]
    const southWest = map.unproject([0, MAP_H], MAX_ZOOM);
    const northEast = map.unproject([MAP_W, 0], MAX_ZOOM);
    const bounds = L.latLngBounds(southWest, northEast);

    map.setMaxBounds(bounds.pad(0.1));
    map.fitBounds(bounds);

    // vips dzsave Google layout: tiles are at {z}/{y}/{x}.webp
    // Leaflet CRS.Simple tile coords match directly (y=0 is top row)
    L.tileLayer(import.meta.env.BASE_URL + 'map-tiles/{z}/{y}/{x}.webp', {
      minZoom: MIN_ZOOM,
      maxZoom: MAX_ZOOM,
      tileSize: TILE_SIZE,
      noWrap: true,
      bounds,
      errorTileUrl: import.meta.env.BASE_URL + 'map-tiles/blank.png',
    }).addTo(map);

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    mapRef.current = map;
    return () => { map.remove(); mapRef.current = null; };
  }, []);

  return (
    <div className="relative w-full" style={{ height: 'calc(100vh - 120px)' }}>
      <div ref={containerRef} className="w-full h-full rounded-xl overflow-hidden" style={{ background: '#0a0a0a' }} />
    </div>
  );
}
