// ═══════════════════════════════════════════════════════════════════════════════
// ConveneScanner — Camera HUD overlay for OCR-based Convene URL extraction
// Extracted from ProfileTab.jsx
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useRef } from 'react';
import { createPortal } from 'react-dom';
import { getPortalRoot } from '../../shared/scaling/canvasScale.js';
import { Camera, Scan, X } from 'lucide-react';
import { HEADER_ICON } from '../../data/constants.js';
import { t } from '../../utils/i18n.js';

// Scan zone: 4:3 landscape ratio. Shared with ImportFlow's captureDirectCamera so the captured
// image is cropped to exactly the rectangle this HUD shows the user, not the full raw frame.
export const SCAN_ZONE = { top: 38, left: 8, right: 8, height: 24 };

export default function ConveneScanner({
  directCameraOpen,
  closeDirectCamera,
  captureDirectCamera,
  directVideoRef,
  directStreamRef,
}) {
  const pinchRef = useRef({ start: null, zoomStart: 1, currentZoom: 1 });

  if (!directCameraOpen) return null;

  const zone = SCAN_ZONE;
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

      {/* Dark mask with rounded cutout */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none">
        <defs>
          <mask id="scanMask">
            <rect width="100%" height="100%" fill="white" />
            <rect x={`${zone.left}%`} y={`${zone.top}%`} width={`${100 - zone.left - zone.right}%`} height={`${zone.height}%`} rx={r} ry={r} fill="black" />
          </mask>
        </defs>
        <rect width="100%" height="100%" fill="rgba(6,10,18,0.82)" mask="url(#scanMask)" />
      </svg>

      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 pointer-events-none" style={{ paddingTop: 'max(8px, env(safe-area-inset-top))' }}>
        <div className="flex items-center justify-between px-4 py-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl overflow-hidden kuro-border-default kuro-shadow-ring">
              <img src={HEADER_ICON} alt="" className="w-full h-full object-cover" />
            </div>
            <div>
              <p style={{ fontSize: 'var(--font-base)', fontWeight: 700, letterSpacing: '0.04em', color: 'rgba(255,255,255,0.85)' }}>Whispering Wishes</p>
            </div>
          </div>
          <button onClick={closeDirectCamera} aria-label={t('profile.importFlow.direct.closeCamera')} className="pointer-events-auto flex items-center justify-center kuro-scanner-btn">
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
              border: '2px solid rgba(255,255,255,0.7)',
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
          <Scan size={32} strokeWidth={2} style={{ color: 'rgba(255,255,255,0.4)' }} />
          <svg className="absolute" width="28" height="28" viewBox="0 0 28 28">
            <line x1="0" y1="14" x2="12" y2="14" stroke="rgba(255,255,255,0.4)" strokeWidth="2" />
            <line x1="16" y1="14" x2="28" y2="14" stroke="rgba(255,255,255,0.4)" strokeWidth="2" />
            <line x1="14" y1="0" x2="14" y2="12" stroke="rgba(255,255,255,0.4)" strokeWidth="2" />
            <line x1="14" y1="16" x2="14" y2="28" stroke="rgba(255,255,255,0.4)" strokeWidth="2" />
          </svg>
        </div>

      </div>

      {/* Instruction text */}
      <div className="absolute left-0 right-0 text-center pointer-events-none" style={{ top: `${zone.top + zone.height + 2}%` }}>
        <p style={{ fontSize: 'var(--font-2xs)', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)' }}>{t('profile.scanner.instructionAlign')}</p>
        <p style={{ fontSize: 'var(--font-2xs)', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.12)', marginTop: 4 }}>{t('profile.scanner.instructionPinch')}</p>
      </div>

      {/* Bottom bar */}
      <div className="absolute bottom-0 left-0 right-0 pointer-events-none" style={{ paddingBottom: 'max(20px, env(safe-area-inset-bottom))' }}>
        <div className="flex justify-center pointer-events-auto" style={{ paddingTop: 16 }}>
          <button onClick={captureDirectCamera} aria-label={t('profile.importFlow.direct.captureScreenshot')} className="relative active:scale-90 transition-transform" style={{ width: 'var(--size-avatar-md)', height: 'var(--size-avatar-md)' }}>
            <div className="absolute inset-[-4px] rounded-full" style={{ background: 'conic-gradient(from 0deg, transparent 0%, transparent 20%, rgba(255,255,255,0.3) 45%, rgba(255,255,255,0.55) 50%, rgba(255,255,255,0.3) 55%, transparent 80%, transparent 100%)', animation: 'captureShimmer 3s linear infinite' }} />
            <div className="absolute inset-0 kuro-scanner-ring-outer" />
            <div className="absolute kuro-scanner-ring-inner" style={{ inset: 4 }} />
            <div className="absolute inset-0 flex items-center justify-center">
              <Camera size={24} style={{ color: 'rgba(255,255,255,0.4)' }} />
            </div>
          </button>
        </div>
        <p className="text-center" style={{ fontSize: 8, letterSpacing: '0.12em', color: 'rgba(255,255,255,0.15)', marginTop: 8, textTransform: 'uppercase', fontWeight: 600 }}>{t('profile.scanner.capture')}</p>
      </div>

      <style>{`
        @keyframes captureShimmer { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>,
    getPortalRoot()
  );
}
