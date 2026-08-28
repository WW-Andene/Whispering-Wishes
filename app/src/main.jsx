import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import "leaflet/dist/leaflet.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

// Loads the two spine-player CDN runtimes dynamically instead of as static
// <script src> tags in index.html — see the removed tags' old spot there
// for the full "why" (synchronous <script src> blocking the main thread
// WHILE the boot video plays was very likely the cause of reported
// stutter). Called once from beginFade() below, so the fetch+parse+execute
// of these two real libraries only starts once the video's active
// playback window is already ending.
//
// Dynamically created <script> elements fetch in parallel by default but
// execute in insertion order as long as `.async = false` is set on each —
// that's what preserves the 4.2-load → stash → 4.1-load → restore sequence
// (window.spine must end up holding the 4.2 runtime again once both are
// loaded — see the inline script below) without needing to chain onload
// callbacks by hand.
const loadSpineRuntimes = () => {
  const addLink = (href, integrity) => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    link.integrity = integrity;
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  };
  const addScript = (src, integrity) => {
    const script = document.createElement('script');
    script.src = src;
    script.integrity = integrity;
    script.crossOrigin = 'anonymous';
    script.async = false;
    document.head.appendChild(script);
  };
  const addInline = (code) => {
    const script = document.createElement('script');
    script.textContent = code;
    script.async = false;
    document.head.appendChild(script);
  };

  // P3-02 audit fix: Subresource Integrity hashes pinned to version
  // 4.2.109/4.1.55. Regenerate on version bump:
  //   curl -sSL "<url>" | openssl dgst -sha384 -binary | openssl base64 -A
  addLink(
    'https://unpkg.com/@esotericsoftware/spine-player@4.2.109/dist/spine-player.css',
    'sha384-SAzRnvZaanzeQyV9076wVkiVpz8Ps2uicu0yff7GJdBU2Pr65zYUg5tYbXT8Uzaz',
  );
  addScript(
    'https://unpkg.com/@esotericsoftware/spine-player@4.2.109/dist/iife/spine-player.js',
    'sha384-C2uhee9ZK7jve2lChHRuBQ0OqZjzZSNaxmRiBY9Y0fHA6yFLUZjPQyE7ogX3kJZg',
  );
  // Secondary spine-player runtime @4.1.55 for Spine 4.1-exported assets
  // (e.g. sprite-spine portraits from nanoka) — not backward-compatible
  // with the 4.2 runtime above, so we stash 4.2's globals, let 4.1 install
  // onto window.spine, then capture as window.spine41 and restore 4.2.
  addInline('window.__spine42 = window.spine; window.spine = undefined;');
  addScript(
    'https://unpkg.com/@esotericsoftware/spine-player@4.1.55/dist/iife/spine-player.js',
    'sha384-JmJJLCJBXRw87w7ce9AOcL7EqR8Km9mzuu0MDsbSaceHZEeB+0QstgcQ6a076u8Q',
  );
  addInline('window.spine41 = window.spine; window.spine = window.__spine42; delete window.__spine42;');
};

// Reveal the app once the boot splash has faded out — a fixed fallback
// delay covers the case where the GIF fails to load, so the app never
// stays hidden behind a splash that isn't going anywhere. The splash has
// no audio of its own (a GIF can't carry a track) — the ambient Log Screen
// track (started in index.html and handed off to useAmbientMusic.js) is
// the boot audio, so this fade is visual-only.
const SPLASH_FALLBACK_MS = 6000;
// splash-intro.gif is 29 frames re-timed to ~15fps (67ms/frame) — see the
// regeneration note on the <img> tag in index.html. Unlike the old <video>,
// an <img> has no 'ended'/'timeupdate'/duration to hook into, so the play-
// once timing is just this fixed duration instead: 29 * 67 = 1943ms.
const GIF_PLAY_MS = 1943;
// The splash's opacity ramps to 0 over this window BEFORE the GIF's natural
// end, then the #splash wrapper fades out at the same time — one continuous
// fade rather than a hard cut on the last frame.
const SPLASH_FADE_SECONDS = 0.6;
(() => {
  const splash = document.getElementById('splash');
  if (!splash) return;
  const splashImg = document.getElementById('splash-video');
  let fading = false, done = false;
  const reveal = () => {
    if (done) return;
    done = true;
    splash.style.opacity = '0';
    splash.addEventListener('transitionend', () => splash.remove(), { once: true });
  };
  const beginFade = () => {
    if (fading) return;
    fading = true;
    loadSpineRuntimes();
    if (splashImg) {
      splashImg.style.transition = `opacity ${SPLASH_FADE_SECONDS}s ease`;
      splashImg.style.opacity = '0';
    }
    splash.style.transition = `opacity ${SPLASH_FADE_SECONDS}s ease`;
    reveal();
  };
  if (splashImg) {
    splashImg.addEventListener('error', beginFade, { once: true });
  }
  setTimeout(beginFade, Math.max(0, GIF_PLAY_MS - SPLASH_FADE_SECONDS * 1000));
  setTimeout(beginFade, SPLASH_FALLBACK_MS);
})();
