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

// Reveal the app only once the boot video has actually finished playing
// (not just once React has rendered underneath it) — a fixed fallback delay
// covers the case where autoplay is blocked or the video fails to load, so
// the app never stays hidden behind a splash that isn't going anywhere.
const SPLASH_FALLBACK_MS = 6000;
(() => {
  const splash = document.getElementById('splash');
  if (!splash) return;
  const video = document.getElementById('splash-video');
  let done = false;
  const reveal = () => {
    if (done) return;
    done = true;
    splash.style.opacity = '0';
    splash.addEventListener('transitionend', () => splash.remove(), { once: true });
  };
  if (video) {
    video.addEventListener('ended', reveal, { once: true });
    video.addEventListener('error', reveal, { once: true });
  }
  setTimeout(reveal, SPLASH_FALLBACK_MS);
})();
