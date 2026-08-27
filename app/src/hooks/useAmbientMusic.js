// ═══════════════════════════════════════════════════════════════════════════════
// useAmbientMusic — loops the selected "Log Screen" background music track
// (public/audio/log-screen-{1,2,3}.m4a) while the app is open. Selected and
// muted via Profile > Display > Sound (visualSettings.logScreenTrack,
// visualSettings.soundEnabled). A single <audio> element is reused across
// track switches so playback doesn't restart just from a re-render.
//
// index.html already starts this same default track (window.__bootAmbientAudio)
// synchronously at boot, before React mounts, so it's already playing under
// the splash video. On first mount here we adopt that exact <audio> element
// instead of creating a new one, so the track carries on with no restart or
// gap once React takes over managing it.
// ═══════════════════════════════════════════════════════════════════════════════

import { useEffect, useRef } from 'react';

// Vite's base is './' (relative) — resolve against BASE_URL, not a hardcoded
// leading-slash path, so this still 404s correctly on a subpath deploy or
// the native file:// build (see chime.js for the same fix).
const BASE = import.meta.env.BASE_URL || './';
const TRACK_SRC = {
  '1': `${BASE}audio/log-screen-1.m4a`,
  '2': `${BASE}audio/log-screen-2.m4a`,
  '3': `${BASE}audio/log-screen-3.m4a`,
};

const AMBIENT_VOLUME = 0.35;

export function useAmbientMusic(visualSettings) {
  const audioRef = useRef(null);
  const track = visualSettings?.logScreenTrack;
  const enabled = !!visualSettings?.soundEnabled && !!TRACK_SRC[track];

  useEffect(() => {
    if (!audioRef.current) {
      const audio = window.__bootAmbientAudio || new Audio();
      audio.loop = true;
      audio.volume = AMBIENT_VOLUME;
      audioRef.current = audio;
    }
    return () => {
      audioRef.current?.pause();
      audioRef.current = null;
    };
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (!enabled) {
      audio.pause();
      return;
    }
    const src = new URL(TRACK_SRC[track], window.location.href).href;
    if (audio.src !== src) {
      audio.src = src;
    }
    audio.play().catch(() => {});
  }, [enabled, track]);
}
