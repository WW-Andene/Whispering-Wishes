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

import React, { useRef, useState, useCallback, useEffect } from 'react';

// How long before the clip actually ends its opacity starts easing to 0,
// so playback doesn't just cut to the static image mid-frame — requested
// explicitly as a 1-2s fade, not an instant stop.
const FADE_OUT_SECONDS = 1.5;
// Fade-in on start — requested "same but shorter", so noticeably quicker
// than the fade-out rather than a matching 1.5s.
const FADE_IN_SECONDS = 0.4;

const ConveneVideo = ({ videoUrl, onEnded, zIndex, className = 'absolute inset-0', muted = false, onError, gain = 1 }) => {
  const [visible, setVisible] = useState(false);
  const [fadingOut, setFadingOut] = useState(false);
  const firedRef = useRef(false);
  const videoRef = useRef(null);

  // Boost playback volume past the HTML5 <video> element's hard 1.0 (100%)
  // ceiling via a Web Audio GainNode — the only way to go louder than
  // "max volume" without re-encoding the source file. Routing a video
  // element through Web Audio permanently hands its audio output to that
  // graph, so this only runs once per mounted <video> (remounts on every
  // videoUrl change via the key below, so each play gets a fresh node —
  // reusing one across remounts would throw "already connected to a
  // different MediaElementSourceNode").
  useEffect(() => {
    if (gain === 1 || muted || !videoRef.current) return;
    let ctx;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      ctx = new AudioCtx();
      const source = ctx.createMediaElementSource(videoRef.current);
      const gainNode = ctx.createGain();
      gainNode.gain.value = gain;
      source.connect(gainNode).connect(ctx.destination);
      if (ctx.state === 'suspended') ctx.resume().catch(() => {});
    } catch {
      // Web Audio unavailable/blocked (some webviews) — video just plays
      // at its normal max volume instead of the boosted one. Never worth
      // failing playback over.
    }
    return () => { ctx?.close?.().catch(() => {}); };
  }, [videoUrl, gain, muted]);

  // Reset per videoUrl (the `key={videoUrl}` below already remounts the
  // <video>, but this component instance itself is reused across plays).
  useEffect(() => {
    setVisible(false);
    setFadingOut(false);
    firedRef.current = false;
  }, [videoUrl]);

  // Fade in only once the video actually has a decodable frame ready
  // (onLoadedData), not just on mount — on a slow connection (native app
  // fetching convene-animations/ from the hosted deployment, see
  // capacitor-build/build.mjs) a video with no data yet renders as the
  // browser's generic media-player glyph; staying invisible until then
  // just leaves the static art underneath showing, which is what was
  // already visible before this video layer mounted anyway.
  const handleLoadedData = useCallback(() => setVisible(true), []);

  const handleTimeUpdate = useCallback((e) => {
    const v = e.currentTarget;
    if (!firedRef.current && v.duration && v.duration - v.currentTime <= FADE_OUT_SECONDS) {
      firedRef.current = true;
      setFadingOut(true);
    }
  }, []);

  return (
    <div className={className} style={zIndex != null ? { zIndex } : undefined}>
      <video
        key={videoUrl}
        ref={videoRef}
        src={videoUrl}
        className="w-full h-full object-cover"
        style={{
          opacity: fadingOut ? 0 : (visible ? 1 : 0),
          transition: `opacity ${fadingOut ? FADE_OUT_SECONDS : FADE_IN_SECONDS}s linear`,
        }}
        preload="auto"
        autoPlay
        muted={muted}
        playsInline
        disablePictureInPicture
        disableRemotePlayback
        controlsList="nodownload noremoteplayback nofullscreen"
        onLoadedData={handleLoadedData}
        onTimeUpdate={handleTimeUpdate}
        onEnded={onEnded}
        onError={onError}
      />
    </div>
  );
};

export { ConveneVideo };
