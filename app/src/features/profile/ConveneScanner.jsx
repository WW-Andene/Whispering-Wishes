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

  // Scan zone: 4:3 landscape ratio
  const zone = { top: 38, left: 8, right: 8, height: 24 };
  const r = 12; // corner radius
  const bracketSize = 32; // bracket arm length
  const bracketOffset = 6; // gap between zone border and bracket

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

      {/* Dark mask — 4 panels around the zone with rounded inner edges via clip-path */}
      {/* Top */}
      <div className="absolute pointer-events-none" style={{ top: 0, left: 0, right: 0, height: `${zone.top}%`, background: 'rgba(6,10,18,0.82)' }} />
      {/* Bottom */}
      <div className="absolute pointer-events-none" style={{ bottom: 0, left: 0, right: 0, height: `${100 - zone.top - zone.height}%`, background: 'rgba(6,10,18,0.82)' }} />
      {/* Left */}
      <div className="absolute pointer-events-none" style={{ top: `${zone.top}%`, left: 0, width: `${zone.left}%`, height: `${zone.height}%`, background: 'rgba(6,10,18,0.82)' }} />
      {/* Right */}
      <div className="absolute pointer-events-none" style={{ top: `${zone.top}%`, right: 0, width: `${zone.right}%`, height: `${zone.height}%`, background: 'rgba(6,10,18,0.82)' }} />
      {/* Rounded corner fills — 4 small squares at zone corners filled with mask color + inverse border-radius */}
      {[
        { top: `${zone.top}%`, left: `${zone.left}%`, borderBottomRightRadius: r },
        { top: `${zone.top}%`, right: `${zone.right}%`, borderBottomLeftRadius: r },
        { bottom: `${100 - zone.top - zone.height}%`, left: `${zone.left}%`, borderTopRightRadius: r },
        { bottom: `${100 - zone.top - zone.height}%`, right: `${zone.right}%`, borderTopLeftRadius: r },
      ].map((style, i) => (
        <div key={i} className="absolute pointer-events-none" style={{ ...style, width: r, height: r, background: 'rgba(6,10,18,0.82)' }} />
      ))}

      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 pointer-events-none" style={{ paddingTop: 'max(8px, env(safe-area-inset-top))' }}>
        <div className="flex items-center justify-between px-4 py-2">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 0 0 1px rgba(255,255,255,0.03), inset 0 0 0 1px rgba(255,255,255,0.05)' }}>
              <img src={HEADER_ICON} alt="" className="w-full h-full object-cover" />
            </div>
            <div>
              <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.04em', color: 'rgba(255,255,255,0.85)', fontFamily: "'Rajdhani', sans-serif" }}>Whispering Wishes</p>
            </div>
          </div>
          <button onClick={closeDirectCamera} className="pointer-events-auto flex items-center justify-center" style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(6,10,18,0.8)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <X size={16} style={{ color: 'rgba(255,255,255,0.35)' }} />
          </button>
        </div>
      </div>

      {/* ── Scan zone ── */}
      <div className="absolute pointer-events-none" style={{ top: `${zone.top}%`, left: `${zone.left}%`, right: `${zone.right}%`, height: `${zone.height}%` }}>

        {/* Zone border — visible */}
        <div className="absolute inset-0" style={{ border: '2px solid rgba(255,255,255,0.35)', borderRadius: r }} />

        {/* Bracket corners OUTSIDE the zone — rounded, matching zone radius */}
        {[
          { top: -bracketOffset, left: -bracketOffset, btr: r + 2, sides: ['Top', 'Left'] },
          { top: -bracketOffset, right: -bracketOffset, btr: r + 2, sides: ['Top', 'Right'] },
          { bottom: -bracketOffset, left: -bracketOffset, btr: r + 2, sides: ['Bottom', 'Left'] },
          { bottom: -bracketOffset, right: -bracketOffset, btr: r + 2, sides: ['Bottom', 'Right'] },
        ].map(({ sides, btr, ...pos }, i) => (
          <div key={i} className="absolute" style={{ ...pos, width: bracketSize, height: bracketSize, overflow: 'hidden' }}>
            <div style={{
              position: 'absolute',
              [sides[0].toLowerCase()]: 0,
              [sides[1].toLowerCase()]: 0,
              width: bracketSize,
              height: bracketSize,
              border: '2.5px solid rgba(255,255,255,0.7)',
              [`border${sides[0]}${sides[1]}Radius`]: btr,
              [`border${sides[0] === 'Top' ? 'Bottom' : 'Top'}${sides[1]}Radius`]: 0,
              [`border${sides[0]}${sides[1] === 'Left' ? 'Right' : 'Left'}Radius`]: 0,
              [`border${sides[0] === 'Top' ? 'Bottom' : 'Top'}${sides[1] === 'Left' ? 'Right' : 'Left'}Radius`]: 0,
              [`border${sides[0] === 'Top' ? 'Bottom' : 'Top'}`]: 'none',
              [`border${sides[1] === 'Left' ? 'Right' : 'Left'}`]: 'none',
            }} />
          </div>
        ))}

        {/* Center target + cross */}
        <div className="absolute flex items-center justify-center" style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
          {/* Square target icon */}
          <Scan size={36} style={{ color: 'rgba(255,255,255,0.15)' }} />
          {/* Cross overlay */}
          <div style={{ position: 'absolute', width: 44, height: '1.5px', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent)' }} />
          <div style={{ position: 'absolute', width: '1.5px', height: 44, background: 'linear-gradient(180deg, transparent, rgba(255,255,255,0.35), transparent)' }} />
        </div>

      </div>

      {/* Instruction text */}
      <div className="absolute left-0 right-0 text-center pointer-events-none" style={{ top: `${zone.top + zone.height + 2}%` }}>
        <p style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', fontFamily: "'Rajdhani', sans-serif" }}>Align URL text box within frame</p>
        <p style={{ fontSize: 7, letterSpacing: '0.1em', color: 'rgba(255,255,255,0.12)', marginTop: 4 }}>Pinch to zoom</p>
      </div>

      {/* Bottom bar */}
      <div className="absolute bottom-0 left-0 right-0 pointer-events-none" style={{ paddingBottom: 'max(20px, env(safe-area-inset-bottom))' }}>
        <div className="flex justify-center pointer-events-auto" style={{ paddingTop: 16 }}>
          <button onClick={captureDirectCamera} className="relative active:scale-90 transition-transform" style={{ width: 68, height: 68 }}>
            <div className="absolute inset-[-4px] rounded-full" style={{ background: 'conic-gradient(from 0deg, transparent 0%, transparent 20%, rgba(255,255,255,0.3) 45%, rgba(255,255,255,0.55) 50%, rgba(255,255,255,0.3) 55%, transparent 80%, transparent 100%)', animation: 'captureShimmer 3s linear infinite' }} />
            <div className="absolute inset-0 rounded-full" style={{ border: '1.5px solid rgba(255,255,255,0.15)', background: 'rgba(6,10,18,0.85)', backdropFilter: 'blur(12px)' }} />
            <div className="absolute rounded-full" style={{ inset: 5, background: 'rgba(6,10,18,1)', border: '1px solid rgba(255,255,255,0.1)' }} />
            <div className="absolute inset-0 flex items-center justify-center">
              <Camera size={20} style={{ color: 'rgba(255,255,255,0.4)' }} />
            </div>
          </button>
        </div>
        <p className="text-center" style={{ fontSize: 8, letterSpacing: '0.12em', color: 'rgba(255,255,255,0.15)', marginTop: 8, textTransform: 'uppercase', fontWeight: 600 }}>Capture</p>
      </div>

      <style>{`
        @keyframes captureShimmer { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>,
    document.body
  );
}
