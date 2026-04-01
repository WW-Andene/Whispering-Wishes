// Detect API base: if served by dashboard server directly, use relative /api.
// If served through a proxy (like Deployable_Preview), use the dashboard's origin.
const API_BASE = window.__WW_B_API || '/api';

export const setApiBase = (url) => { window.__WW_B_API = url; };

export const api = (path, body) =>
  fetch(API_BASE + path, body
    ? { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }
    : {}
  ).then(r => r.json());
