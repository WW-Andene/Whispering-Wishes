// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — shared/components/bannerUtils.js
// Banner utility functions and admin constants.
// ═══════════════════════════════════════════════════════════════════════════════

import { getLocalizedCurrentBanners } from '../../data/banners.js';
import { storageAvailable, sanitizeStateObj } from '../../core/storage.js';
import { getLocale } from '../../utils/i18n.js';

const ADMIN_BANNER_KEY = 'whispering-wishes-admin-banners';

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
  return custom || getLocalizedCurrentBanners(getLocale());
};

export { ADMIN_BANNER_KEY, loadCustomBanners, getActiveBanners };
