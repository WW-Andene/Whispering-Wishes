// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — shared/utils/imageHelpers.js
// Shared image error handler — replaces inline copies (Finding 12.6 / 11.1)
// ═══════════════════════════════════════════════════════════════════════════════

// Issue #148: Show fallback placeholder instead of silently hiding broken images
const BROKEN_IMG_FALLBACK = "data:image/svg+xml," + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48"><rect width="48" height="48" rx="6" fill="rgba(255,255,255,0.08)"/><g transform="translate(12,12)" stroke="rgba(255,255,255,0.3)" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="22 16 17 11 6 22"/><line x1="1" y1="1" x2="23" y2="23"/></g></svg>');
const hideOnError = (e) => {
  const img = e.target;
  img.src = BROKEN_IMG_FALLBACK;
  img.style.objectFit = 'contain';
  img.style.background = 'rgba(255,255,255,0.05)';
  img.style.borderRadius = '4px';
  img.removeAttribute('onerror');
  img.onerror = null; // prevent infinite loop
  img.setAttribute('aria-label', 'Image failed to load');
};

export { hideOnError };
