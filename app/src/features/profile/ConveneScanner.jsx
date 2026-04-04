// ═══════════════════════════════════════════════════════════════════════════════
// ConveneScanner — Camera HUD overlay for OCR-based Convene URL extraction
// Extracted from ProfileTab.jsx
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useRef } from 'react';
import { createPortal } from 'react-dom';
import { Camera, X } from 'lucide-react';
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

  return createPortal(
    <div className="fixed inset-0 z-[9999]" style={{ touchAction: 'none' }} onTouchMove={(e) => {
      // Prevent page zoom on pinch
      if (e.touches.length >= 2) e.preventDefault();
    }} onTouchStart={(e) => {
      // Track pinch start distance
      if (e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        pinchRef.current.start = Math.hypot(dx, dy);
        pinchRef.current.zoomStart = pinchRef.current.currentZoom;
      }
    }} onTouchEnd={() => {
      // Apply zoom to camera track
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

      {/* ═══ CAMERA HUD — matches kuro-card design system ═══ */}

      {/* Full dark overlay with cutout feel */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 85% 55% at 50% 45%, transparent 0%, rgba(6,10,18,0.4) 60%, rgba(6,10,18,0.88) 100%)' }} />

      {/* Top bar — kuro-card header style */}
      <div className="absolute top-0 left-0 right-0 pointer-events-none" style={{ paddingTop: 'max(8px, env(safe-area-inset-top))', background: 'linear-gradient(to bottom, rgba(6,10,18,0.95) 0%, rgba(6,10,18,0.7) 70%, transparent 100%)' }}>
        <div className="flex items-center justify-between px-4 py-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 0 0 1px rgba(255,255,255,0.03), inset 0 0 0 1px rgba(255,255,255,0.05)' }}>
              <img src={HEADER_ICON} alt="" className="w-full h-full object-cover" />
            </div>
            <div>
              <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.02em', color: 'rgba(255,255,255,0.88)', fontFamily: "'Rajdhani', sans-serif" }}>CONVENE SCANNER</p>
              <p style={{ fontSize: 7, textTransform: 'uppercase', letterSpacing: '0.2em', color: 'rgba(255,255,255,0.15)', marginTop: -1 }}>Whispering Wishes</p>
            </div>
          </div>
          <button onClick={closeDirectCamera} className="pointer-events-auto flex items-center justify-center" style={{ width: 38, height: 38, borderRadius: 12, background: 'rgba(6,10,18,0.7)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 0 0 1px rgba(255,255,255,0.03)' }}>
            <X size={15} style={{ color: 'rgba(255,255,255,0.35)' }} />
          </button>
        </div>
        {/* Shimmer line under header — matches kuro-card::after */}
        <div style={{ height: '0.5px', margin: '0 16px', background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.35) 20%, rgba(255,255,255,0.6) 50%, rgba(255,255,255,0.35) 80%, transparent 100%)', animation: 'shimmer 3s ease-in-out infinite' }} />
      </div>

      {/* ── Scan zone ── */}
      <div className="absolute pointer-events-none" style={{ top: '18%', left: '6%', right: '6%', bottom: '24%' }}>

        {/* Kuro-card triple border */}
        <div className="absolute inset-0" style={{ border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16 }} />
        <div className="absolute" style={{ inset: 3, border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14 }} />
        <div className="absolute" style={{ inset: 6, border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12 }} />

        {/* Top shimmer on scan zone */}
        <div style={{ position: 'absolute', top: -1, left: 12, right: 12, height: '0.75px', background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 20%, rgba(255,255,255,0.65) 50%, rgba(255,255,255,0.4) 80%, transparent 100%)', animation: 'shimmer 3s ease-in-out infinite', borderRadius: 8 }} />

        {/* Corner brackets — viewfinder */}
        {[
          { top: 12, left: 12 },
          { top: 12, right: 12 },
          { bottom: 12, left: 12 },
          { bottom: 12, right: 12 }
        ].map((pos, i) => {
          const isTop = 'top' in pos;
          const isLeft = 'left' in pos;
          return (
            <div key={i} className="absolute" style={{ ...pos, width: 28, height: 28 }}>
              {/* Horizontal arm */}
              <div style={{ position: 'absolute', [isTop ? 'top' : 'bottom']: 0, [isLeft ? 'left' : 'right']: 0, width: 28, height: '1.5px', background: 'linear-gradient(' + (isLeft ? '90deg' : '270deg') + ', rgba(255,255,255,0.45), rgba(255,255,255,0.1))' }} />
              {/* Vertical arm */}
              <div style={{ position: 'absolute', [isTop ? 'top' : 'bottom']: 0, [isLeft ? 'left' : 'right']: 0, width: '1.5px', height: 28, background: 'linear-gradient(' + (isTop ? '180deg' : '0deg') + ', rgba(255,255,255,0.45), rgba(255,255,255,0.1))' }} />
              {/* Corner dot */}
              <div style={{ position: 'absolute', [isTop ? 'top' : 'bottom']: -1, [isLeft ? 'left' : 'right']: -1, width: 3, height: 3, borderRadius: '50%', background: 'rgba(255,255,255,0.5)' }} />
            </div>
          );
        })}

        {/* kuro-card-inner corner decorations (top-right, bottom-left) */}
        <div style={{ position: 'absolute', top: 14, right: 14, width: 10, height: 10, borderTop: '1px solid rgba(255,255,255,0.15)', borderRight: '1px solid rgba(255,255,255,0.15)', borderRadius: '0 3px 0 0', opacity: 0.8 }} />
        <div style={{ position: 'absolute', bottom: 14, left: 14, width: 10, height: 10, borderBottom: '1px solid rgba(255,255,255,0.15)', borderLeft: '1px solid rgba(255,255,255,0.15)', borderRadius: '0 0 0 3px', opacity: 0.8 }} />

        {/* Center crosshair */}
        <div className="absolute" style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
          <div style={{ position: 'absolute', width: 36, height: '0.5px', top: 0, left: -18, background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent)' }} />
          <div style={{ position: 'absolute', width: '0.5px', height: 36, top: -18, left: 0, background: 'linear-gradient(180deg, transparent, rgba(255,255,255,0.25), transparent)' }} />
          <div style={{ position: 'absolute', width: 14, height: 14, top: -7, left: -7, border: '0.5px solid rgba(255,255,255,0.12)', borderRadius: 2 }} />
          <div style={{ position: 'absolute', width: 4, height: 4, top: -2, left: -2, borderRadius: '50%', background: 'rgba(255,255,255,0.2)' }} />
        </div>

        {/* CRT effect layer */}
        <div className="absolute overflow-hidden" style={{ inset: 6, borderRadius: 12 }}>
          {/* Scanlines */}
          <div className="absolute inset-0" style={{ background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.06) 2px, rgba(0,0,0,0.06) 4px)', pointerEvents: 'none' }} />
          {/* Flicker */}
          <div className="absolute inset-0" style={{ animation: 'crtFlicker 0.15s infinite', opacity: 0.02, background: 'white', pointerEvents: 'none' }} />
          {/* Sweep beam */}
          <div className="absolute left-0 right-0" style={{ height: '1.5px', animation: 'camScan 4s ease-in-out infinite', background: 'linear-gradient(90deg, transparent 5%, rgba(255,255,255,0.3) 30%, rgba(255,255,255,0.45) 50%, rgba(255,255,255,0.3) 70%, transparent 95%)', boxShadow: '0 0 16px 2px rgba(255,255,255,0.06)' }} />
        </div>
      </div>

      {/* Instruction text */}
      <div className="absolute left-0 right-0 text-center pointer-events-none" style={{ bottom: '26%' }}>
        <p style={{ fontSize: 8, fontWeight: 500, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.2)', fontFamily: "'Rajdhani', sans-serif" }}>Align URL within frame</p>
      </div>

      {/* Bottom bar — gradient up from dark */}
      <div className="absolute bottom-0 left-0 right-0 pointer-events-none" style={{ background: 'linear-gradient(to top, rgba(6,10,18,0.95) 0%, rgba(6,10,18,0.6) 60%, transparent 100%)', paddingBottom: 'max(16px, env(safe-area-inset-bottom))' }}>
        {/* Capture button */}
        <div className="flex justify-center pointer-events-auto" style={{ paddingTop: 12 }}>
          <button onClick={captureDirectCamera} className="relative active:scale-90 transition-transform" style={{ width: 64, height: 64 }}>
            {/* Outer glow ring */}
            <div className="absolute inset-[-3px] rounded-full" style={{ background: 'conic-gradient(from 0deg, transparent 0%, transparent 25%, rgba(255,255,255,0.35) 47%, rgba(255,255,255,0.6) 50%, rgba(255,255,255,0.35) 53%, transparent 75%, transparent 100%)', animation: 'captureShimmer 3s linear infinite' }} />
            {/* Outer ring — kuro-card border style */}
            <div className="absolute inset-0 rounded-full" style={{ border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(6,10,18,0.8)', backdropFilter: 'blur(12px)', boxShadow: '0 0 0 1px rgba(255,255,255,0.03), inset 0 0 0 1px rgba(255,255,255,0.05)' }} />
            {/* Inner circle */}
            <div className="absolute rounded-full" style={{ inset: 4, background: 'rgba(6,10,18,1)', border: '1px solid rgba(255,255,255,0.06)' }} />
            {/* Camera icon */}
            <div className="absolute inset-0 flex items-center justify-center">
              <Camera size={18} style={{ color: 'rgba(255,255,255,0.3)' }} />
            </div>
          </button>
        </div>
        {/* Hint below button */}
        <p className="text-center" style={{ fontSize: 7, letterSpacing: '0.12em', color: 'rgba(255,255,255,0.1)', marginTop: 6, textTransform: 'uppercase' }}>Capture</p>
      </div>

      <style>{`
        @keyframes camScan { 0% { top: 0%; opacity: 0; } 10% { opacity: 1; } 90% { opacity: 1; } 100% { top: 95%; opacity: 0; } }
        @keyframes captureShimmer { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes crtFlicker { 0% { opacity: 0.03; } 50% { opacity: 0; } 100% { opacity: 0.03; } }
      `}</style>
    </div>,
    document.body
  );
}
