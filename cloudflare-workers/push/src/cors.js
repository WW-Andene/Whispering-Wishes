// Same allowlist api/_common.js uses on the Vercel side — kept as a direct
// port (not shared/imported across repos) so this Worker has zero build step
// and no dependency on the app/ package. Update both places together if the
// list ever changes.
const BASE_ALLOWED_ORIGINS = [
  'https://whispering-wishes.vercel.app',
  'http://localhost:3000',
  'http://localhost:5000',
  'http://localhost:5173',
  'http://localhost:4173',
  'capacitor://localhost',
  'https://localhost',
];

export function isAllowedOrigin(origin, extraOriginsCsv) {
  if (!origin) return false;
  const extra = (extraOriginsCsv || '').split(',').map(s => s.trim()).filter(Boolean);
  if ([...BASE_ALLOWED_ORIGINS, ...extra].includes(origin)) return true;
  return /^https:\/\/whispering-wishes[a-z0-9-]*\.vercel\.app$/.test(origin);
}

export function corsHeaders(origin) {
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Cache-Control': 'no-store',
  };
}
