// ═══════════════════════════════════════════════════════════════════════════════
// WW Update Agent — Protected Assets
//
// This file defines what the agent must NEVER replace, overwrite, or "improve."
//
// CORE PRINCIPLE: If a value already exists and is non-empty, a human put it
// there deliberately. The agent can only:
//   - FILL empty slots (empty string, null, undefined, 'TBD')
//   - ADD new entries that didn't exist before
//   - NEVER replace a working URL with a different one
//   - NEVER change text/descriptions that already have real content
//
// This isn't just about images — it applies to ALL curated content.
// ═══════════════════════════════════════════════════════════════════════════════

// ── Image protection ─────────────────────────────────────────────────────────
// ALL existing non-empty image URLs in appcore-data.js are considered
// human-curated. The agent can:
//   ✓ Fill an empty imageUrl: '' → 'https://...'
//   ✓ Add a new character's image that doesn't exist yet
//   ✗ Replace 'https://i.ibb.co/ABC/image.jpg' with a different URL
//   ✗ "Upgrade" a jpg to webp by re-uploading
//   ✗ Replace a "dead" URL automatically (only report it)

// ── Event image protection ───────────────────────────────────────────────────
// All event images (whimperingWastesImage, doubledPawnsImage, etc.) are
// custom-made by the app creator. NEVER replace them.
// Exception: if the agent creates an entirely NEW event (not in EVENTS yet),
// it may find and set an image for that new event.
export const PROTECTED_IMAGE_FIELDS = [
  'whimperingWastesImage',
  'doubledPawnsImage',
  'towerOfAdversityImage',
  'illusiveRealmImage',
  'tacticalHologramImage',
  'weeklyBossImage',
  'standardCharBannerImage',
  'standardWeapBannerImage',
  'dailyResetImage',
  'eventBannerImage',  // Protected once filled — custom event art
];

// ── Content protection rules ─────────────────────────────────────────────────
// These rules are injected into every AI prompt that could modify content.

export const PROTECTION_RULES = `
PROTECTED CONTENT — NON-NEGOTIABLE RULES:

1. EXISTING IMAGES: Any non-empty image URL (https://...) in the codebase was
   placed there by the human creator. NEVER replace, "upgrade", or re-upload
   an existing image. You may ONLY fill empty strings ('') with new URLs.

2. EVENT IMAGES: All event card images (whimperingWastesImage, doubledPawnsImage,
   towerOfAdversityImage, illusiveRealmImage, tacticalHologramImage, weeklyBossImage,
   standardCharBannerImage, standardWeapBannerImage, dailyResetImage) are custom-made
   artwork. NEVER touch these. The ONLY exception is if you create a brand new event
   that has never existed in the app before.

3. COLLECTION IMAGES: The 267+ character and weapon images in DEFAULT_COLLECTION_IMAGES
   are curated. NEVER replace an existing entry. Only add NEW entries for characters
   or weapons that don't have an image yet (empty or missing key).

4. DEAD URLS: If a health check reports an image URL as dead (404), REPORT it in
   the change log but DO NOT auto-replace it. The human may need to re-upload their
   original custom image. The agent cannot recreate custom artwork.

5. CHARACTER DESCRIPTIONS: If a character's 'desc' field has real content (not 'TBD'),
   don't rewrite it. You may only fill 'TBD' placeholders.

6. EXISTING FEATURES: Never remove or fundamentally change UI features, tab layouts,
   or user-facing behavior. Only add new features or polish existing ones.
`;

/**
 * Check if a specific image field is protected (human-curated, never replace).
 */
export function isProtectedImageField(fieldName) {
  return PROTECTED_IMAGE_FIELDS.includes(fieldName);
}

/**
 * Check if a specific value should be treated as "empty" (OK to fill).
 * Empty means: '', null, undefined, 'TBD', or missing entirely.
 */
export function isEmpty(value) {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed === '' || trimmed === 'TBD' || trimmed === 'N/A';
  }
  return false;
}

/**
 * Check if a URL value is "existing" (human-curated, don't touch).
 */
export function isExistingUrl(value) {
  return typeof value === 'string' && value.startsWith('http') && value.length > 10;
}

/**
 * Filter a list of proposed image updates, removing any that would
 * overwrite existing URLs.
 */
export function filterImageUpdates(updates, currentSource) {
  return updates.filter(update => {
    // Protected fields — never touch
    if (isProtectedImageField(update.field || update.slot)) {
      return false;
    }

    // Check if the current value is already a real URL
    if (update.oldValue && isExistingUrl(update.oldValue)) {
      return false;
    }

    return true;
  });
}
