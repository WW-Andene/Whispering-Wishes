// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — shared/components/ConveneVideoLayer.jsx
// Shared "play a character's convene video in place" video element — the
// fade-to-static-image-before-it-ends timing logic, used identically by
// BannerCard.jsx (gacha banner card) and CharacterDetailModal.jsx (header).
// Extracted once a second call site needed the exact same fade-out logic,
// rather than duplicating it. Each caller keeps its own toggle button
// inline (positioning/DOM-order needs differ per call site enough that
// sharing that small a piece of JSX wasn't worth the indirection).
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useRef, useState, useCallback } from 'react';

// How long before the clip actually ends its opacity starts easing to 0,
// so playback doesn't just cut to the static image mid-frame — requested
// explicitly as a 1-2s fade, not an instant stop.
const FADE_SECONDS = 1.5;

const ConveneVideo = ({ videoUrl, onEnded, zIndex, className = 'absolute inset-0' }) => {
  const [fading, setFading] = useState(false);
  const firedRef = useRef(false);

  const handleTimeUpdate = useCallback((e) => {
    const v = e.currentTarget;
    if (!firedRef.current && v.duration && v.duration - v.currentTime <= FADE_SECONDS) {
      firedRef.current = true;
      setFading(true);
    }
  }, []);

  return (
    <div className={className} style={zIndex != null ? { zIndex } : undefined}>
      <video
        key={videoUrl}
        src={videoUrl}
        className="w-full h-full object-cover"
        style={{ opacity: fading ? 0 : 1, transition: `opacity ${FADE_SECONDS}s linear` }}
        autoPlay
        playsInline
        onTimeUpdate={handleTimeUpdate}
        onEnded={onEnded}
      />
    </div>
  );
};

export { ConveneVideo };
