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
const MIN_ZOOM = 1;

export default function MapTab() {
  const containerRef = useRef(null);
  const mapRef = useRef(null);

  useEffect(() => {
    if (mapRef.current) return; // already initialized

    // Convert pixel bounds to Leaflet LatLng (CRS.Simple: y is inverted)
    const southWest = L.CRS.Simple.pointToLatLng(L.point(0, MAP_H), MAX_ZOOM);
    const northEast = L.CRS.Simple.pointToLatLng(L.point(MAP_W, 0), MAX_ZOOM);
    const bounds = L.latLngBounds(southWest, northEast);

    const map = L.map(containerRef.current, {
      crs: L.CRS.Simple,
      minZoom: MIN_ZOOM,
      maxZoom: MAX_ZOOM,
      maxBounds: bounds.pad(0.1),
      maxBoundsViscosity: 1.0,
      zoomSnap: 0.5,
      zoomDelta: 0.5,
      attributionControl: false,
      zoomControl: false,
    });

    // Fit the map to show the full image
    map.fitBounds(bounds);

    // Tile layer — vips Google layout: {z}/{y}/{x}
    L.tileLayer('/map-tiles/{z}/{y}/{x}.webp', {
      minZoom: MIN_ZOOM,
      maxZoom: MAX_ZOOM,
      tileSize: TILE_SIZE,
      noWrap: true,
      bounds,
      errorTileUrl: '/map-tiles/blank.png',
    }).addTo(map);

    // Zoom controls in bottom-right
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  return (
    <div className="relative w-full" style={{ height: 'calc(100vh - 120px)' }}>
      <div ref={containerRef} className="w-full h-full rounded-xl overflow-hidden" style={{ background: '#0a0a0a' }} />
    </div>
  );
}
