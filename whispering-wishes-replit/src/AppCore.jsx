// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES v3.2.2 — AppCore.jsx (Barrel)
// Thin re-export layer. App.jsx imports from here — no changes needed.
// Split into: appcore-data.js, appcore-engine.js, appcore-providers.jsx,
//             appcore-components.jsx
// ═══════════════════════════════════════════════════════════════════════════════

// --- appcore-data.js ---
export {
  APP_VERSION, MAX_IMPORT_SIZE_MB, HEADER_ICON, haptic,
  calculateLuckRating, SERVERS, getServerOffset,
  CURRENT_BANNERS, BANNER_HISTORY, CHARACTER_DATA, WEAPON_DATA,
  EVENTS, SUBSCRIPTIONS, HARD_PITY, ASTRITE_PER_PULL,
  LUNITE_DAILY_ASTRITE, MAX_ASTRITE, MAX_CALC_PULLS,
  DEFAULT_COLLECTION_IMAGES, RELEASE_ORDER, WEAPON_RELEASE_ORDER,
  ALL_5STAR_RESONATORS, ALL_5STAR_WEAPONS,
  ALL_4STAR_RESONATORS, ALL_4STAR_WEAPONS, ALL_3STAR_WEAPONS,
  ALL_CHARACTERS, STANDARD_5STAR_CHARACTERS, STANDARD_5STAR_WEAPONS,
  TAB_ORDER, MEDAL_COLORS,
} from './appcore-data.js';

// --- appcore-engine.js ---
export {
  getServerAdjustedEnd,
  initialState, STORAGE_KEY, storageAvailable,
  sanitizeStateObj, sanitizeImportedState,
  loadFromStorage, saveToStorage, reducer, calcStats,
} from './appcore-engine.js';

// --- appcore-providers.jsx ---
export {
  PWAProvider, ToastProvider, useToast,
  useFocusTrap, useEscapeKey, FocusTrapModal,
  OnboardingModal, KuroStyles,
} from './appcore-providers.jsx';

// --- appcore-components.jsx ---
export {
  TROPHY_ICON_MAP, generateVerticalMaskGradient, TabBackground,
  Card, CardHeader, CardBody,
  CharacterDetailModal, WeaponDetailModal,
  TabButton, CountdownTimer, PityRing,
  AppErrorBoundary, TabErrorBoundary,
  BackgroundGlow, TriangleMirrorWave,
  BannerCard, EventCard, ProbabilityBar,
  ADMIN_BANNER_KEY, ADMIN_HASH,
  CollectionGridSection, VisualSliderGroup, VISUAL_SLIDER_CONFIGS,
  PityCounterInput, CalcResultsCard, StandardBannerSection,
  ImportGuide, getActiveBanners,
} from './appcore-components.jsx';
