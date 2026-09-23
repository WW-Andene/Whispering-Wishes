// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — features/map/ReferenceImageLayer.jsx
// The draggable screenshot itself, floating over the map — direct user
// request ("importer une photo pour la superposer et placer les points plus
// vite"). Renders nothing when no image is loaded. State (url/x/y/scale/
// rotation/opacity/adjust) lives in MapTab.jsx (session-only, no
// persistence — the image is a positioning aid, not map data); this
// component only turns pointer drags into onChange({x,y}) calls.
//
// `adjust` gates pointer-events on the whole layer: while adjusting, the
// image captures drag/wheel so you can line it up with the real map beneath
// it; once you turn Adjust off, pointer-events go to 'none' so clicks pass
// straight through to Leaflet for placing zone/icon points — the image
// stays visible (per its opacity) but never blocks placement.
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useRef } from 'react';

// Scale slider range (25%–300%) also caps what wheel-to-zoom can reach.
const MIN_SCALE = 0.25;
const MAX_SCALE = 3;
const WHEEL_SCALE_STEP = 0.08;

export function ReferenceImageLayer({ refImage, onChange }) {
  const dragRef = useRef(null);
  if (!refImage) return null;
  const { url, x, y, scale, rotation, opacity, adjust } = refImage;

  const onPointerDown = (e) => {
    if (!adjust) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = { startX: e.clientX, startY: e.clientY, origX: x, origY: y };
  };
  const onPointerMove = (e) => {
    if (!dragRef.current) return;
    onChange({ x: dragRef.current.origX + (e.clientX - dragRef.current.startX), y: dragRef.current.origY + (e.clientY - dragRef.current.startY) });
  };
  const endDrag = (e) => {
    dragRef.current = null;
    try { e.currentTarget.releasePointerCapture(e.pointerId); } catch {}
  };
  const onWheel = (e) => {
    if (!adjust) return;
    e.preventDefault();
    e.stopPropagation();
    const next = Math.min(MAX_SCALE, Math.max(MIN_SCALE, scale + (e.deltaY < 0 ? WHEEL_SCALE_STEP : -WHEEL_SCALE_STEP)));
    onChange({ scale: next });
  };

  return (
    <div
      className="map-ref-image-layer"
      style={{ position: 'absolute', inset: 0, zIndex: 5, overflow: 'hidden', pointerEvents: adjust ? 'auto' : 'none' }}
    >
      <img
        src={url}
        alt=""
        draggable={false}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onWheel={onWheel}
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          maxWidth: '70%',
          maxHeight: '70%',
          opacity,
          transform: `translate(-50%, -50%) translate(${x}px, ${y}px) rotate(${rotation}deg) scale(${scale})`,
          cursor: adjust ? 'grab' : 'default',
          touchAction: 'none',
          boxShadow: adjust ? '0 0 0 2px rgba(237,175,24,0.6), 0 8px 24px rgba(0,0,0,0.5)' : 'none',
        }}
      />
    </div>
  );
}
