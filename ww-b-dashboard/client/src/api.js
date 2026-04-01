export const api = (path, body) =>
  fetch('/api' + path, body
    ? { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }
    : {}
  ).then(r => r.json());
