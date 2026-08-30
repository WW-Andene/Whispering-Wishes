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
import { suspendAmbientMusic, resumeAmbientMusic } from '../../hooks/useAmbientMusic.js';

// Shared, persistent AudioContext for every gain-boosted convene video —
// NOT one created fresh per video mount. A fresh AudioContext starts
// 'suspended' under the browser's autoplay policy until a real user
// gesture resumes it; the rarity video that opens the pull sim is (fine,
// it mounts synchronously inside the pull-pill's own click), but every
// video AFTER that (the 5★ reveal beat, a 5★/4★'s own convene clip) auto-
// plays from a video's 'ended' event — not a click — so a brand new
// context created right there had a real chance of staying suspended for
// that entire clip, which reads as "the gain boost did nothing" (reported
// twice now) even though the code was technically wired correctly. Reusing
// one context that's resumed as early and as often as there's a real click
// nearby (resumeConveneAudioContext, called from ConvenePullSimModal's tap
// handlers) means it's very likely already 'running' by the time any of
// these auto-chained videos need it.
let sharedCtx = null;
const getConveneAudioContext = () => {
  const AudioCtx = typeof window !== 'undefined' && (window.AudioContext || window.webkitAudioContext);
  if (!AudioCtx) return null;
  if (!sharedCtx) sharedCtx = new AudioCtx();
  return sharedCtx;
};
export const resumeConveneAudioContext = () => {
  const ctx = getConveneAudioContext();
  if (ctx?.state === 'suspended') ctx.resume().catch(() => {});
};

// How long before the clip actually ends its opacity starts easing to 0,
// so playback doesn't just cut to the static image mid-frame — requested
// explicitly as a 1-2s fade, not an instant stop.
const FADE_OUT_SECONDS = 1.5;
// Fade-in on start — requested "same but shorter", so noticeably quicker
// than the fade-out rather than a matching 1.5s.
const FADE_IN_SECONDS = 0.4;

const ConveneVideo = ({ videoUrl, onEnded, zIndex, className = 'absolute inset-0', muted = false, onError, gain = 1, visualSettings }) => {
  const [visible, setVisible] = useState(false);
  const [fadingOut, setFadingOut] = useState(false);
  const firedRef = useRef(false);
  const videoRef = useRef(null);

  // Same duck/resume behavior as ConvenePullSimModal's own rarity/item
  // videos — any convene clip playing here (BannerCard's own ▶, the
  // character detail modal's header/Assets convene videos) should pause the
  // ambient "Log Screen" loop too, not just the pull simulator's. Read
  // through a ref (kept fresh below) rather than closing over
  // `visualSettings` directly, for the same reason ConvenePullSimModal's own
  // copy does: the cleanup effect below only runs once, on unmount, and by
  // then a stale closed-over `visualSettings` could be wrong if the user
  // toggled sound off/on while the video was still playing.
  const visualSettingsRef = useRef(visualSettings);
  useEffect(() => { visualSettingsRef.current = visualSettings; }, [visualSettings]);
  useEffect(() => {
    suspendAmbientMusic();
    return () => resumeAmbientMusic(visualSettingsRef.current);
  }, []);

  // Boost playback volume past the HTML5 <video> element's hard 1.0 (100%)
  // ceiling via a Web Audio GainNode — the only way to go louder than
  // "max volume" without re-encoding the source file. Uses the shared,
  // persistent context above (see its comment for why NOT a fresh one per
  // video) — only the source node and gain node are created fresh per
  // mount, which is required (a <video> element can only ever be connected
  // to one MediaElementSourceNode for its lifetime, which is why this
  // still needs the `key={videoUrl}` below to force a genuinely new
  // <video> element per clip).
  useEffect(() => {
    if (gain === 1 || muted || !videoRef.current) return;
    try {
      const ctx = getConveneAudioContext();
      if (!ctx) return;
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
