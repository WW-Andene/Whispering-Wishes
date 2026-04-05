// ═══════════════════════════════════════════════════════════════════════════════
// ConveneScanner — Camera HUD overlay for OCR-based Convene URL extraction
// Extracted from ProfileTab.jsx
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useRef } from 'react';
import { createPortal } from 'react-dom';
import { Camera, Scan, X } from 'lucide-react';
import { HEADER_ICON } from '../../data/constants.js';

export default function ConveneScanner({
  directCameraOpen,
  closeDirectCamera,
  captureDirectCamera,
  directVideoRef,
  directStreamRef,
}) {
  const pinchRef = useRef({ start: null, zoomStart: 1, currentZoom: 1 });

  if (!directCameraOpen) return null;

  // Scan zone dimensions (percentage of viewport)
  const zone = { top: 35, left: 8, right: 8, height: 35 };

  return createPortal(
    <div className="fixed inset-0 z-[9999]" style={{ touchAction: 'none' }} onTouchMove={(e) => {
      if (e.touches.length >= 2) e.preventDefault();
    }} onTouchStart={(e) => {
      if (e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        pinchRef.current.start = Math.hypot(dx, dy);
        pinchRef.current.zoomStart = pinchRef.current.currentZoom;
      }
    }} onTouchEnd={() => {
      if (pinchRef.current.start && directStreamRef.current) {
        const track = directStreamRef.current.getVideoTracks()[0];
        const caps = track?.getCapabilities?.();
        if (caps?.zoom) {
          const zoom = Math.min(Math.max(pinchRef.current.currentZoom, caps.zoom.min), caps.zoom.max);
          track.applyConstraints({ advanced: [{ zoom }] }).catch(e => console.warn('[Camera] Zoom constraint failed:', e.message));
        }
        pinchRef.current.start = null;
      }
    }} onTouchMoveCapture={(e) => {
      if (e.touches.length === 2 && pinchRef.current.start && directStreamRef.current) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const dist = Math.hypot(dx, dy);
        const scale = dist / pinchRef.current.start;
        const track = directStreamRef.current.getVideoTracks()[0];
        const caps = track?.getCapabilities?.();
        if (caps?.zoom) {
          const newZoom = Math.min(Math.max(pinchRef.current.zoomStart * scale, caps.zoom.min), caps.zoom.max);
          pinchRef.current.currentZoom = newZoom;
          track.applyConstraints({ advanced: [{ zoom: newZoom }] }).catch(e => console.warn('[Camera] Zoom constraint failed:', e.message));
        }
      }
    }}>
      <video ref={directVideoRef} muted playsInline className="absolute inset-0 w-full h-full object-cover" />

      {/* ═══ CAMERA HUD ═══ */}

      {/* Dark mask outside scan zone — 4 rectangles around the cutout */}
      <div className="absolute pointer-events-none" style={{ top: 0, left: 0, right: 0, height: `${zone.top}%`, background: 'rgba(6,10,18,0.82)' }} />
      <div className="absolute pointer-events-none" style={{ top: `${zone.top + zone.height}%`, left: 0, right: 0, bottom: 0, background: 'rgba(6,10,18,0.82)' }} />
      <div className="absolute pointer-events-none" style={{ top: `${zone.top}%`, left: 0, width: `${zone.left}%`, height: `${zone.height}%`, background: 'rgba(6,10,18,0.82)' }} />
      <div className="absolute pointer-events-none" style={{ top: `${zone.top}%`, right: 0, width: `${zone.right}%`, height: `${zone.height}%`, background: 'rgba(6,10,18,0.82)' }} />

      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 pointer-events-none" style={{ paddingTop: 'max(8px, env(safe-area-inset-top))' }}>
        <div className="flex items-center justify-between px-4 py-2">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 0 0 1px rgba(255,255,255,0.03), inset 0 0 0 1px rgba(255,255,255,0.05)' }}>
              <img src={HEADER_ICON} alt="" className="w-full h-full object-cover" />
            </div>
            <div>
              <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.04em', color: 'rgba(255,255,255,0.85)', fontFamily: "'Rajdhani', sans-serif" }}>Whispering Wishes</p>
              <p style={{ fontSize: 7, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'rgba(255,255,255,0.15)', marginTop: -1 }}>Convene Scanner</p>
            </div>
          </div>
          <button onClick={closeDirectCamera} className="pointer-events-auto flex items-center justify-center" style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(6,10,18,0.8)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <X size={16} style={{ color: 'rgba(255,255,255,0.35)' }} />
          </button>
        </div>
      </div>

      {/* ── Scan zone ── */}
      <div className="absolute pointer-events-none" style={{ top: `${zone.top}%`, left: `${zone.left}%`, right: `${zone.right}%`, height: `${zone.height}%` }}>

        {/* Rounded border */}
        <div className="absolute inset-0" style={{ border: '1.5px solid rgba(255,255,255,0.2)', borderRadius: 16 }} />

        {/* Corner brackets — rounded */}
        {[
          { top: -1, left: -1 },
          { top: -1, right: -1 },
          { bottom: -1, left: -1 },
          { bottom: -1, right: -1 }
        ].map((pos, i) => {
          const isTop = 'top' in pos;
          const isLeft = 'left' in pos;
          return (
            <div key={i} className="absolute" style={{ ...pos, width: 28, height: 28, overflow: 'hidden' }}>
              <div style={{
                position: 'absolute',
                [isTop ? 'top' : 'bottom']: 0,
                [isLeft ? 'left' : 'right']: 0,
                width: 28,
                height: 28,
                border: '2.5px solid rgba(255,255,255,0.6)',
                borderRadius: 10,
                [isTop ? 'borderBottom' : 'borderTop']: 'none',
                [isLeft ? 'borderRight' : 'borderLeft']: 'none',
              }} />
            </div>
          );
        })}

        {/* Scan sweep beam */}
        <div className="absolute overflow-hidden" style={{ inset: 4, borderRadius: 12 }}>
          <div className="absolute left-0 right-0" style={{ height: '2px', animation: 'camScan 3s ease-in-out infinite', background: 'linear-gradient(90deg, transparent 5%, rgba(255,255,255,0.15) 30%, rgba(255,255,255,0.35) 50%, rgba(255,255,255,0.15) 70%, transparent 95%)', boxShadow: '0 0 16px 2px rgba(255,255,255,0.05)' }} />
        </div>

        {/* Scan icon center */}
        <div className="absolute flex items-center justify-center" style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
          <Scan size={28} style={{ color: 'rgba(255,255,255,0.06)' }} />
        </div>
      </div>

      {/* Instruction text — below scan zone */}
      <div className="absolute left-0 right-0 text-center pointer-events-none" style={{ top: `${zone.top + zone.height + 2}%` }}>
        <p style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.2)', fontFamily: "'Rajdhani', sans-serif" }}>Align URL text box within frame</p>
        <p style={{ fontSize: 7, letterSpacing: '0.1em', color: 'rgba(255,255,255,0.1)', marginTop: 4 }}>Pinch to zoom</p>
      </div>

      {/* Bottom bar */}
      <div className="absolute bottom-0 left-0 right-0 pointer-events-none" style={{ paddingBottom: 'max(20px, env(safe-area-inset-bottom))' }}>
        <div className="flex justify-center pointer-events-auto" style={{ paddingTop: 16 }}>
          <button onClick={captureDirectCamera} className="relative active:scale-90 transition-transform" style={{ width: 68, height: 68 }}>
            {/* Outer glow ring */}
            <div className="absolute inset-[-4px] rounded-full" style={{ background: 'conic-gradient(from 0deg, transparent 0%, transparent 20%, rgba(255,255,255,0.3) 45%, rgba(255,255,255,0.55) 50%, rgba(255,255,255,0.3) 55%, transparent 80%, transparent 100%)', animation: 'captureShimmer 3s linear infinite' }} />
            {/* Outer ring */}
            <div className="absolute inset-0 rounded-full" style={{ border: '1.5px solid rgba(255,255,255,0.12)', background: 'rgba(6,10,18,0.85)', backdropFilter: 'blur(12px)' }} />
            {/* Inner circle */}
            <div className="absolute rounded-full" style={{ inset: 5, background: 'rgba(6,10,18,1)', border: '1px solid rgba(255,255,255,0.08)' }} />
            {/* Camera icon */}
            <div className="absolute inset-0 flex items-center justify-center">
              <Camera size={20} style={{ color: 'rgba(255,255,255,0.35)' }} />
            </div>
          </button>
        </div>
        <p className="text-center" style={{ fontSize: 8, letterSpacing: '0.12em', color: 'rgba(255,255,255,0.12)', marginTop: 8, textTransform: 'uppercase', fontWeight: 600 }}>Capture</p>
      </div>

      <style>{`
        @keyframes camScan { 0% { top: 0%; opacity: 0; } 10% { opacity: 1; } 90% { opacity: 1; } 100% { top: 95%; opacity: 0; } }
        @keyframes captureShimmer { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>,
    document.body
  );
}
