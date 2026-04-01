// API_BASE injected by server.js into the HTML at runtime
const base = (window.__API_BASE || '') + '/api';

export const api = (path, body) =>
  fetch(base + path, body
    ? { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }
    : {}
  ).then(r => r.json());
