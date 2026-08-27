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

// Reveal the app once the boot video has faded out — a fixed fallback delay
// covers the case where autoplay is blocked or the video fails to load, so
// the app never stays hidden behind a splash that isn't going anywhere.
// The video itself is always silent (index.html keeps it .muted — the
// ambient Log Screen track, started in index.html and handed off to
// useAmbientMusic.js, is the audio now), so this fade is visual-only.
const SPLASH_FALLBACK_MS = 6000;
// The video's opacity ramps to 0 over this window BEFORE the clip's natural
// end, then the #splash wrapper fades out at the same time — one continuous
// fade rather than playing to an abrupt last-frame cut.
const SPLASH_FADE_SECONDS = 0.6;
(() => {
  const splash = document.getElementById('splash');
  if (!splash) return;
  const video = document.getElementById('splash-video');
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
    if (video) {
      video.style.transition = `opacity ${SPLASH_FADE_SECONDS}s ease`;
      video.style.opacity = '0';
    }
    splash.style.transition = `opacity ${SPLASH_FADE_SECONDS}s ease`;
    reveal();
  };
  if (video) {
    video.addEventListener('ended', beginFade, { once: true });
    video.addEventListener('error', beginFade, { once: true });
    video.addEventListener('timeupdate', () => {
      if (!video.duration) return;
      const remaining = video.duration - video.currentTime;
      if (remaining <= SPLASH_FADE_SECONDS) beginFade();
    });
  }
  setTimeout(beginFade, SPLASH_FALLBACK_MS);
})();
