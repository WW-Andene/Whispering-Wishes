// ═══════════════════════════════════════════════════════════════════════════════
// WW Update Agent — Banner Image Monitor
//
// Monitors for new banner art appearing on Game8, Prydwen, and wikis.
// When characterBannerImage/weaponBannerImage are empty (common for new phases),
// this module finds the art, uploads to imgbb, and fills the URL.
//
// Runs during both FULL and MICRO cycles — banner art often appears
// hours or days after the banner goes live.
// ═══════════════════════════════════════════════════════════════════════════════

import { log, addChange } from './log.js';
import { uploadToImgbb } from './images.js';
import { isProtectedImageField } from './protected.js';

const BANNER_IMAGE_SOURCES = [
  // Game8 banner pages (usually have the banner art first)
  'https://game8.co/games/Wuthering-Waves/archives/468081',
  // Prydwen banner page
  'https://prydwen.gg/wuthering-waves/banners',
  // Fandom wiki convene page
  'https://wutheringwaves.fandom.com/wiki/Convene',
  // Reddit (drip marketing / official art posts)
  'https://wutheringwaves.fandom.com/wiki/Convene/History',
];

/**
 * Check which banner image slots are empty in CURRENT_BANNERS.
 */
export function findEmptyBannerImages(source) {
  const empty = [];

  const fields = [
    'characterBannerImage',
    'weaponBannerImage',
    'eventBannerImage',
  ];

  for (const field of fields) {
    const match = source.match(new RegExp(`${field}:\\s*'([^']*)'`));
    if (match && (!match[1] || match[1] === '')) {
      empty.push(field);
    }
  }

  // Also check individual character imageUrl fields in CURRENT_BANNERS
  const charBlock = source.match(/characters:\s*\[([\s\S]*?)\],\s*weapons:/);
  if (charBlock) {
    const charImgs = [...charBlock[1].matchAll(/name:\s*'([^']+)'[\s\S]*?imageUrl:\s*'([^']*)'/g)];
    for (const m of charImgs) {
      if (!m[2] || m[2] === '') {
        empty.push(`character:${m[1]}`);
      }
    }
  }

  // Check weapon imageUrl fields
  const weapBlock = source.match(/weapons:\s*\[([\s\S]*?)\],\s*\/\/ Standard/);
  if (weapBlock) {
    const weapImgs = [...weapBlock[1].matchAll(/name:\s*['"]([^'"]+)['"][\s\S]*?imageUrl:\s*'([^']*)'/g)];
    for (const m of weapImgs) {
      if (!m[2] || m[2] === '') {
        empty.push(`weapon:${m[1]}`);
      }
    }
  }

  return empty;
}

/**
 * Search web sources for banner art and extract image URLs.
 * Uses Claude to identify the correct banner images from page content.
 */
export async function findBannerImages(emptySlots, bannerData, askClaudeFn, fetchPageFn) {
  if (!emptySlots.length) return {};

  log.info(`Searching for ${emptySlots.length} missing banner image(s)...`);

  // Fetch banner-related pages
  const results = {};
  const pages = [];

  for (const url of BANNER_IMAGE_SOURCES) {
    const page = await fetchPageFn(url, { extractText: false });
    if (page.ok) pages.push(page);
  }

  if (!pages.length) {
    log.warn('No banner image sources available');
    return {};
  }

  // Build a combined content with all image URLs visible
  const allContent = pages.map(p => {
    // Extract all image URLs from raw HTML
    const imgUrls = [...p.content.matchAll(/(?:src|data-src|href)="(https?:\/\/[^"]+\.(?:webp|png|jpg|jpeg|avif)[^"]*)"/gi)]
      .map(m => m[1])
      .filter(url => !url.includes('thumbnail') && !url.includes('icon') && !url.includes('20px'))
      .slice(0, 50); // Cap per page

    return `--- ${p.url} ---\nImage URLs found:\n${imgUrls.join('\n')}\n\nPage text (first 8000 chars):\n${p.content.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').slice(0, 8000)}`;
  }).join('\n\n');

  // Ask Claude to match images to empty slots
  const charNames = bannerData.characters.map(c => c.name).join(', ');
  const weapNames = bannerData.weapons.map(w => w.name).join(', ');

  const prompt = `I need banner images for Wuthering Waves v${bannerData.version} Phase ${bannerData.phase}.
Featured characters: ${charNames}
Featured weapons: ${weapNames}

EMPTY SLOTS TO FILL:
${emptySlots.map(s => `- ${s}`).join('\n')}

IMAGE SELECTION RULES:
- "characterBannerImage": The official banner artwork showing the featured character(s). Usually a wide/landscape image with the character posed dramatically. Prefer the clean version without text/dates overlay.
- "weaponBannerImage": The official weapon banner artwork. Usually shows the featured weapon(s) with a themed background.
- "character:Name": Individual character artwork for the banner card. Should be a portrait or bust shot, not a full banner. Prefer the "drip marketing" or official reveal art.
- "weapon:Name": Individual weapon banner art.

SOURCES:
${allContent}

For each empty slot, find the BEST matching image URL from the sources above.
Return JSON:
{
  "found": {
    "slotName": "direct image URL"
  },
  "notFound": ["slot names where no suitable image was found"]
}

Only include URLs you're confident are correct banner art (not random screenshots or thumbnails).
Return ONLY the JSON object.`;

  try {
    const response = await askClaudeFn(
      'You are a Wuthering Waves banner image matcher. Find official banner art from web sources. Return only valid JSON.',
      prompt,
      { maxTokens: 2048 }
    );

    const parsed = JSON.parse(response.replace(/```json?\n?/g, '').replace(/```/g, '').trim());

    if (parsed.found) {
      for (const [slot, url] of Object.entries(parsed.found)) {
        if (url && typeof url === 'string' && url.startsWith('http')) {
          results[slot] = url;
        }
      }
    }

    if (parsed.notFound?.length) {
      log.dim(`Not found yet: ${parsed.notFound.join(', ')}`);
    }

    return results;
  } catch (err) {
    log.warn(`Banner image search failed: ${err.message}`);
    return {};
  }
}

/**
 * Upload found banner images to imgbb and update the source buffer.
 * Returns true if any images were updated.
 */
export async function applyBannerImages(foundImages, getBufferFn, loadBufferFn) {
  if (!Object.keys(foundImages).length) return false;
  if (!process.env.IMGBB_API_KEY) {
    log.warn('IMGBB_API_KEY not set — cannot upload banner images');
    return false;
  }

  let changed = false;

  for (const [slot, sourceUrl] of Object.entries(foundImages)) {
    const buf = getBufferFn();

    // PROTECTION: Check if this slot already has a real URL
    // If it does, a human put it there — don't touch it.
    if (slot.startsWith('character:') || slot.startsWith('weapon:')) {
      const itemName = slot.split(':')[1];
      const escapedName = itemName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const existingMatch = buf.match(new RegExp(`name:\\s*['"]${escapedName}['"][\\s\\S]*?imageUrl:\\s*'([^']*)'`));
      if (existingMatch && existingMatch[1] && existingMatch[1].startsWith('http')) {
        log.dim(`Skipped ${slot} — already has image`);
        continue;
      }
    } else {
      // Top-level field (characterBannerImage, etc.)
      // PROTECTION: Skip if it's a protected event image that already has a URL
      if (isProtectedImageField(slot)) {
        const existingMatch = buf.match(new RegExp(`${slot}:\\s*'([^']*)'`));
        if (existingMatch && existingMatch[1] && existingMatch[1].startsWith('http')) {
          log.dim(`Skipped protected field ${slot} — already has custom image`);
          continue;
        }
      }
      // Even for non-protected fields, check if already filled
      const existingMatch = buf.match(new RegExp(`${slot}:\\s*'([^']*)'`));
      if (existingMatch && existingMatch[1] && existingMatch[1].startsWith('http')) {
        log.dim(`Skipped ${slot} — already has image`);
        continue;
      }
    }

    // Slot is empty — safe to fill
    const imgName = slot.replace(/[:/]/g, '-').replace(/\s+/g, '-');
    const imgbbUrl = await uploadToImgbb(sourceUrl, imgName);
    if (!imgbbUrl) continue;

    if (slot.startsWith('character:') || slot.startsWith('weapon:')) {
      const itemName = slot.split(':')[1];
      const escapedName = itemName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const pattern = new RegExp(`(name:\\s*['"]${escapedName}['"][\\s\\S]*?imageUrl:\\s*)'([^']*)'`);
      const match = buf.match(pattern);
      if (match) {
        loadBufferFn(buf.replace(match[0], `${match[1]}'${imgbbUrl}'`));
        log.ok(`Banner image: ${slot} → ${imgbbUrl}`);
        addChange('banner-images', `Filled ${slot} image`);
        changed = true;
      }
    } else {
      const pattern = new RegExp(`(${slot}:\\s*)'([^']*)'`);
      const match = buf.match(pattern);
      if (match) {
        loadBufferFn(buf.replace(match[0], `${match[1]}'${imgbbUrl}'`));
        log.ok(`Banner image: ${slot} → ${imgbbUrl}`);
        addChange('banner-images', `Filled ${slot}`);
        changed = true;
      }
    }
  }

  return changed;
}
