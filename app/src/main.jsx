import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import "leaflet/dist/leaflet.css";

// The header/bottom nav (see .boot-frozen-ui in kuro.css) stay hidden until
// <html> carries data-safe-area-ready="1" — on Android, MainActivity.java
// sets that once it's injected the real safe-area inset values, so they only
// ever appear already in their final place. On any platform/situation where
// that native call never happens (web, iOS, or a failure on-device), this is
// the fallback that reveals them anyway rather than leaving them hidden
// forever — env(safe-area-inset-*)'s CSS default is already correct there,
// so there's nothing to wait for.
if (!document.documentElement.hasAttribute('data-safe-area-ready')) {
  setTimeout(() => {
    if (!document.documentElement.hasAttribute('data-safe-area-ready')) {
      document.documentElement.setAttribute('data-safe-area-ready', '1');
    }
  }, 300);
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

// Loads the two spine-player CDN runtimes dynamically rather than as static
// <script src> tags in index.html, so they don't block the initial page
// parse/paint — not needed until a Spine-animated character view is
// actually opened, well after boot, so the short delay before they're
// ready costs nothing. Called once, directly below.
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

loadSpineRuntimes();
