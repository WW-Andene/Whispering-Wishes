// Use relative path so it works under any subpath (e.g. /preview/.../api/stats)
const base = new URL('.', window.location.href).href.replace(/\/$/, '');

export const api = (path, body) =>
  fetch(base + '/api' + path, body
    ? { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }
    : {}
  ).then(r => r.json());
