// ═══════════════════════════════════════════════════════════════════════════════
// WW Update Agent — Image Manager
// Fetches character/weapon images from wiki sources, uploads to imgbb,
// and updates appcore-data.js image references.
//
// Image selection rules (matching existing app conventions):
// - Characters: Full-body sprite, transparent background (webp preferred)
// - Weapons: Icon/render, transparent background (webp/png)
// - Banners: Banner art with character, opaque (jpg/webp)
// - Events: Event artwork, opaque (jpg/webp/avif)
// - Prefer clean versions (no text overlays) over decorated ones
// - Match existing naming: "Name-Full-Sprite.webp", "Weapon-Name.webp"
// ═══════════════════════════════════════════════════════════════════════════════

import { log, addChange } from './log.js';
import { SCRAPER } from './config.js';
import { isExistingUrl } from './protected.js';

const IMGBB_API = 'https://api.imgbb.com/1/upload';
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

/**
 * Upload an image to imgbb from a URL or base64 data.
 * Returns the imgbb URL or null on failure.
 */
export async function uploadToImgbb(imageSource, name, { isUrl = true } = {}) {
  const apiKey = process.env.IMGBB_API_KEY;
  if (!apiKey) {
    log.warn('IMGBB_API_KEY not set — cannot upload images');
    return null;
  }

  try {
    const formData = new URLSearchParams();
    formData.append('key', apiKey);
    formData.append('name', sanitizeImgName(name));

    if (isUrl) {
      formData.append('image', imageSource);
    } else {
      // base64 data
      formData.append('image', imageSource);
    }

    const res = await fetch(IMGBB_API, {
      method: 'POST',
      body: formData,
      headers: { 'User-Agent': SCRAPER.userAgent },
    });

    const data = await res.json();

    if (data.success && data.data?.url) {
      const url = data.data.display_url || data.data.url;
      log.ok(`Uploaded to imgbb: ${name} → ${url}`);
      return url;
    } else {
      log.error(`imgbb upload failed for "${name}": ${data.error?.message || 'Unknown error'}`);
      return null;
    }
  } catch (err) {
    log.error(`imgbb upload error for "${name}": ${err.message}`);
    return null;
  }
}

/**
 * Find the best image URL for a character from wiki sources.
 * Uses Claude to analyze wiki page content and select the right image.
 */
export async function findCharacterImage(name, sourceContent, askClaudeFn) {
  const prompt = `From the following web page content, find the BEST full-body sprite/portrait image URL for the Wuthering Waves character "${name}".

SELECTION RULES:
1. Prefer transparent-background full-body sprites (.webp or .png)
2. If multiple versions exist, prefer the CLEAN one (no text, no banner art, no logo overlay)
3. The image should show the character's full body or at least waist-up portrait
4. Prefer higher resolution images
5. DO NOT select thumbnail images (under 200px)
6. DO NOT select icon/chibi images
7. Prefer images from: wutheringwaves.fandom.com, prydwen.gg, wuwa.gg

WEB PAGE CONTENT:
${sourceContent.slice(0, 30000)}

Return ONLY a JSON object:
{
  "imageUrl": "direct URL to the image file" or null if not found,
  "format": "webp/png/jpg",
  "isTransparent": true/false (your best guess based on file type and context),
  "confidence": 0.0-1.0
}`;

  try {
    const response = await askClaudeFn(
      'You are an image URL extractor. Return only valid JSON.',
      prompt,
      { maxTokens: 512 }
    );
    const parsed = JSON.parse(response.replace(/```json?\n?/g, '').replace(/```/g, '').trim());
    return parsed;
  } catch (err) {
    log.warn(`Could not find image for ${name}: ${err.message}`);
    return { imageUrl: null, confidence: 0 };
  }
}

/**
 * Find the best image URL for a weapon.
 */
export async function findWeaponImage(name, sourceContent, askClaudeFn) {
  const prompt = `From the following web page content, find the BEST weapon icon/render image URL for the Wuthering Waves weapon "${name}".

SELECTION RULES:
1. Prefer transparent-background weapon renders (.webp or .png)
2. Prefer the clean render (no text, no stats overlay)
3. Prefer larger images over thumbnails
4. DO NOT select inventory slot icons (tiny squares)
5. Prefer images from: wutheringwaves.fandom.com, prydwen.gg

WEB PAGE CONTENT:
${sourceContent.slice(0, 30000)}

Return ONLY a JSON object:
{
  "imageUrl": "direct URL to the image file" or null,
  "format": "webp/png/jpg",
  "isTransparent": true/false,
  "confidence": 0.0-1.0
}`;

  try {
    const response = await askClaudeFn(
      'You are an image URL extractor. Return only valid JSON.',
      prompt,
      { maxTokens: 512 }
    );
    return JSON.parse(response.replace(/```json?\n?/g, '').replace(/```/g, '').trim());
  } catch (err) {
    log.warn(`Could not find image for weapon ${name}: ${err.message}`);
    return { imageUrl: null, confidence: 0 };
  }
}

/**
 * Process a batch of missing images — find, upload to imgbb, return URL map.
 * @param {string[]} names - Names to find images for
 * @param {string} type - 'character' or 'weapon'
 * @param {Function} askClaudeFn - The AI query function
 * @param {Function} fetchPageFn - The web fetch function
 * @returns {Object} Map of name → imgbb URL
 */
export async function processMissingImages(names, type, askClaudeFn, fetchPageFn) {
  if (!names.length) return {};
  if (!process.env.IMGBB_API_KEY) {
    log.warn('IMGBB_API_KEY not set — skipping image processing');
    return {};
  }

  log.info(`Processing ${names.length} missing ${type} image(s)...`);
  const results = {};

  for (const name of names) {
    // Fetch the wiki page for this item
    const wikiUrl = `https://wutheringwaves.fandom.com/wiki/${encodeURIComponent(name.replace(/ /g, '_'))}`;
    const page = await fetchPageFn(wikiUrl, { extractText: false }); // Need raw HTML for image URLs

    if (!page.ok) {
      log.warn(`Could not fetch wiki page for ${name}`);
      continue;
    }

    // Extract image URLs from HTML (src attributes)
    const imgUrls = [...page.content.matchAll(/(?:src|data-src)="(https?:\/\/[^"]+\.(?:webp|png|jpg|jpeg)[^"]*)"/gi)]
      .map(m => m[1])
      .filter(url => !url.includes('thumbnail') && !url.includes('/scale-to-width-down/'));

    // Ask Claude to pick the best image
    const finder = type === 'character' ? findCharacterImage : findWeaponImage;
    const imageInfo = await finder(name, page.content.slice(0, 40000), askClaudeFn);

    if (imageInfo.imageUrl && imageInfo.confidence >= 0.7) {
      // Upload to imgbb
      const imgbbUrl = await uploadToImgbb(imageInfo.imageUrl, `${name.replace(/\s+/g, '-')}-${type === 'character' ? 'Full-Sprite' : 'Weapon'}`);
      if (imgbbUrl) {
        results[name] = imgbbUrl;
        addChange('images', `Uploaded ${type} image: ${name} → ${imgbbUrl}`);
      }
    } else {
      log.warn(`No suitable image found for ${name} (confidence: ${(imageInfo.confidence * 100).toFixed(0)}%)`);
    }

    // Politeness delay between wiki fetches
    await sleep(2000);
  }

  return results;
}

/**
 * Check which characters/weapons in DEFAULT_COLLECTION_IMAGES have empty or missing URLs.
 */
export function findMissingImages(source, characterNames, weaponNames) {
  const missing = { characters: [], weapons: [] };

  // Check for characters with empty image URLs
  // PROTECTION: Only report truly empty slots — never report existing URLs
  for (const name of characterNames) {
    const pattern = new RegExp(`'${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}'\\s*:\\s*'([^']*)'`);
    const match = source.match(pattern);
    if (!match) {
      // Key doesn't exist at all — truly missing
      missing.characters.push(name);
    } else if (!match[1] || match[1] === '' || match[1] === 'TBD') {
      // Key exists but value is empty — safe to fill
      missing.characters.push(name);
    }
    // If match[1] contains a real URL → SKIP. Human put it there.
  }

  // Only check banner image slots that are actually empty strings
  const charBannerImg = source.match(/characterBannerImage:\s*'([^']*)'/);
  if (charBannerImg && charBannerImg[1] === '') {
    missing.characters.push('__characterBanner__');
  }
  const weapBannerImg = source.match(/weaponBannerImage:\s*'([^']*)'/);
  if (weapBannerImg && weapBannerImg[1] === '') {
    missing.weapons.push('__weaponBanner__');
  }

  return missing;
}

// Sanitize image name for imgbb (alphanumeric + hyphens only)
function sanitizeImgName(name) {
  return name.replace(/[^a-zA-Z0-9\-]/g, '-').replace(/-+/g, '-').slice(0, 64);
}
