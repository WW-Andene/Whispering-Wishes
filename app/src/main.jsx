import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import BootIntro from "./shared/components/BootIntro.jsx";
import ScaledCanvas from "./shared/components/ScaledCanvas.jsx";
import "./index.css";
import "leaflet/dist/leaflet.css";

// BootIntro renders OUTSIDE ScaledCanvas, deliberately — it covers the real
// physical screen (screenSize.w/h) during boot, so nothing underneath is
// visible while it plays regardless of how ScaledCanvas ends up sized.
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ScaledCanvas>
      <App />
    </ScaledCanvas>
    <BootIntro />
  </React.StrictMode>,
);

// Loads the two spine-player runtimes dynamically rather than as static
// <script src> tags in index.html, so they don't block the initial page
// parse/paint — not needed until a Spine-animated character view is
// actually opened, well after boot, so the short delay before they're
// ready costs nothing. Called once, directly below.
//
// Vendored locally under public/vendor/spine-player-<version>/ (same
// pattern as /vendor/tmf/) rather than fetched from unpkg.com — these used
// to be CDN <script>/<link> tags, but that meant every Spine feature (the
// character detail modal's Assets sprite tile included) went silently
// blank with no fallback and no visible error whenever unpkg was slow,
// rate-limited, or unreachable on a given network. A same-origin file
// can't fail that way, and the SRI hashes that used to pin the CDN
// response no longer serve a purpose once the file ships in the app
// bundle itself. Vite's base './' means these must be resolved from
// BASE_URL like every other public asset (see TRACK_SRC in
// useAmbientMusic.js for the same fix), not a hardcoded leading slash.
//
// BUG this replaces: setting `.async = false` on dynamically-inserted
// <script src> tags only orders THEM relative to each other — it does
// nothing for the stash/restore <script> tags in between, which have no
// `src` and so run synchronously the instant they're appended, before
// either external file has actually fetched. In practice every "inline"
// step ran immediately back-to-back while window.spine was still
// undefined, so window.spine41 was left permanently undefined and
// window.spine ended up holding whichever external file's top-level `var
// spine = ...` executed last (4.1, clobbering the intended 4.2) — every
// SPRITE_SPINE_CHARACTERS lookup (the character detail modal's Assets
// sprite tile included) silently failed with `spineLib?.SpinePlayer`
// false and fell back to a static frame no matter how many times you
// tapped play. Fixed by chaining on each script's real `load` event
// instead of assuming insertion order.
const loadSpineRuntimes = () => {
  const BASE = import.meta.env.BASE_URL || './';
  const addLink = (href) => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    document.head.appendChild(link);
  };
  const addScript = (src) =>
    new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error(`Failed to load ${src}`));
      document.head.appendChild(script);
    });

  addLink(`${BASE}vendor/spine-player-4.2.109/spine-player.css`);
  addScript(`${BASE}vendor/spine-player-4.2.109/spine-player.js`)
    .then(() => {
      // Secondary spine-player runtime @4.1.55 for Spine 4.1-exported
      // assets (e.g. sprite-spine portraits from the source) — not
      // backward-compatible with the 4.2 runtime above, so we stash 4.2's
      // global, let 4.1 install onto window.spine, then capture that as
      // window.spine41 and restore 4.2.
      window.__spine42 = window.spine;
      window.spine = undefined;
      return addScript(`${BASE}vendor/spine-player-4.1.55/spine-player.js`);
    })
    .then(() => {
      window.spine41 = window.spine;
      window.spine = window.__spine42;
      delete window.__spine42;
    })
    .catch((err) => console.error('[Spine] runtime load failed:', err));
};

loadSpineRuntimes();
