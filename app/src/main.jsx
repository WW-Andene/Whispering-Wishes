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
const SPLASH_FALLBACK_MS = 6000;
// Both the video's own opacity and its volume ramp to 0 over this window
// BEFORE the clip's natural end, then the #splash wrapper fades out at the
// same time — one continuous fade (picture + sound together) rather than
// playing to an abrupt last-frame cut and only fading the wrapper after.
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
      if (remaining <= SPLASH_FADE_SECONDS) {
        beginFade();
        if (!video.muted) video.volume = Math.max(0, remaining / SPLASH_FADE_SECONDS);
      }
    });
  }
  setTimeout(beginFade, SPLASH_FALLBACK_MS);
})();
