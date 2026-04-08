import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

// Capture beforeinstallprompt EARLY — the browser fires it before React mounts,
// so useEffect listeners miss it. Store on window for PWAProvider to pick up.
// Do NOT call e.preventDefault() here — let the browser show its native install bar.
window.__pwaInstallPrompt = null;
window.addEventListener('beforeinstallprompt', (e) => {
  window.__pwaInstallPrompt = e;
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
