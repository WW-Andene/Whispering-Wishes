// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — utils/apiBase.js
// Resolves /api/* paths correctly whether the app is running as a normal web
// page (Vercel, self-host/server.js) or bundled inside the Capacitor native
// app. On the web, a relative '/api/...' path is same-origin and just works.
// Inside Capacitor, the JS bundle is served from capacitor://localhost (iOS)
// or https://localhost (Android) — there is no server at that origin, so a
// relative path would 404. VITE_API_BASE_URL (set at build time — see
// capacitor.config.json's build step in NATIVE_APP.md) points those
// requests at wherever the app is actually hosted (Vercel or a self-host
// tunnel), while every other feature (calculator, planner, collection,
// teams, tracker) stays fully bundled and offline-capable regardless.
// ═══════════════════════════════════════════════════════════════════════════════

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

const isNativePlatform = () =>
  typeof window !== 'undefined' && !!window.Capacitor?.isNativePlatform?.();

export function apiUrl(path) {
  if (isNativePlatform() && API_BASE_URL) return API_BASE_URL + path;
  return path;
}
