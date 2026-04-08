// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — shared/components/bannerUtils.js
// Banner utility functions and admin constants.
// ═══════════════════════════════════════════════════════════════════════════════

import { CURRENT_BANNERS } from '../../data/banners.js';
import { storageAvailable, sanitizeStateObj } from '../../core/storage.js';

const ADMIN_BANNER_KEY = 'whispering-wishes-admin-banners';
const ADMIN_HASH = '3cfcc468339c419168af41cd27265872e0f5d654a415edd90e59f2785886c494';

const loadCustomBanners = () => {
  if (!storageAvailable) return null;
  try {
    const saved = localStorage.getItem(ADMIN_BANNER_KEY);
    if (!saved) return null;
    const parsed = sanitizeStateObj(JSON.parse(saved));
    // P10-FIX: Validate loaded banner structure (Step 6 audit)
    if (typeof parsed !== 'object' || parsed === null || !Array.isArray(parsed.characters) || !Array.isArray(parsed.weapons)) {
      return null;
    }
    return parsed;
  } catch (e) {
    return null;
  }
};

// Get active banners (custom or default)
const getActiveBanners = () => {
  const custom = loadCustomBanners();
  return custom || CURRENT_BANNERS;
};


export { ADMIN_BANNER_KEY, ADMIN_HASH, loadCustomBanners, getActiveBanners };
