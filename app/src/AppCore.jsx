// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — AppCore.jsx (Barrel)
// Thin re-export layer. App.jsx imports from here — no changes needed.
// Split into: appcore-data.js, appcore-engine.js, appcore-providers.jsx,
//             appcore-components.jsx
// ═══════════════════════════════════════════════════════════════════════════════

// --- data ---
export { CHARACTER_DATA, ALL_5STAR_RESONATORS, ALL_4STAR_RESONATORS, ALL_CHARACTERS, STANDARD_5STAR_CHARACTERS, RELEASE_ORDER, CHAR_BUFF_TABLE, RESONANCE_CHAIN_DATA } from './data/characters.js';
export { CURRENT_BANNERS, BANNER_HISTORY, EVENTS, DEFAULT_COLLECTION_IMAGES, CHARACTER_THEMES, VERSION_SPLASH_SCREENS, OTHER_BACKGROUNDS } from './data/banners.js';
export { APP_VERSION, HEADER_ICON, MAX_IMPORT_SIZE_MB, HARD_PITY, ASTRITE_PER_PULL, BEGINNER_ASTRITE_PER_PULL, LUNITE_DAILY_ASTRITE, MAX_ASTRITE, MAX_CALC_PULLS, SERVERS, TAB_ORDER, MEDAL_COLORS, SUBSCRIPTIONS, ALL_5STAR_WEAPONS, ALL_4STAR_WEAPONS, ALL_3STAR_WEAPONS, ALL_2STAR_WEAPONS, ALL_1STAR_WEAPONS, WEAPON_RELEASE_ORDER, STANDARD_5STAR_WEAPONS, getServerOffset } from './data/constants.js';
export { ECHO_SETS, ALL_4COST_ECHOES, ALL_3COST_ECHOES, ALL_1COST_ECHOES, ECHO_DATA, ALL_ECHO_SONATA_SETS, ALL_ECHO_BUFF_TYPES } from './data/echoes.js';
export { WEAPON_DATA } from './data/weapons.js';
export { haptic, generateUniqueId, calculateLuckRating, getElementColor, getElementBg, getElementBorder, ELEMENT_COLORS } from './utils/helpers.js';
// --- core ---
export { initialState, reducer } from './core/reducer.js';
export { STORAGE_KEY, storageAvailable, sanitizeStateObj, sanitizeImportedState, loadFromStorage, saveToStorage } from './core/storage.js';
export { getServerAdjustedEnd } from './core/time.js';
export { calcStats } from './core/calcStats.js';
// --- providers ---
export { PWAProvider, usePWA } from './providers/PWAProvider.jsx';
export { ToastProvider, useToast } from './providers/ToastProvider.jsx';
export { ConfirmProvider, useConfirm } from './providers/ConfirmProvider.jsx';
export { FocusTrapModal, useFocusTrap, useEscapeKey } from './providers/FocusTrapModal.jsx';
export { KuroStyles } from './providers/KuroStyles.jsx';
export { OnboardingModal } from './providers/OnboardingModal.jsx';
// --- shared ---
export { Card, CardHeader, CardBody, TabButton } from './shared/components/Card.jsx';
export { KuroSelect } from './shared/components/KuroSelect.jsx';
export { PityRing } from './shared/components/PityRing.jsx';
export { PityCounterInput } from './shared/components/PityCounterInput.jsx';
export { CountdownTimer } from './shared/components/CountdownTimer.jsx';
export { CollectionGridSection } from './shared/components/CollectionGrid.jsx';
export { VisualSliderGroup, VISUAL_SLIDER_CONFIGS } from './shared/components/VisualSlider.jsx';
export { ImportGuide } from './shared/components/ImportGuide.jsx';
export { BannerCard, StandardBannerSection, EventCard, ProbabilityBar, ADMIN_BANNER_KEY, ADMIN_HASH, getActiveBanners } from './shared/components/BannerCard.jsx';
export { CalcResultsCard } from './shared/components/CalcResults.jsx';
export { CharacterDetailModal } from './shared/modals/CharacterDetailModal.jsx';
export { WeaponDetailModal } from './shared/modals/WeaponDetailModal.jsx';
export { EchoDetailModal } from './shared/modals/EchoDetailModal.jsx';
export { BackgroundGlow, TriangleMirrorWave, ResonanceField, Honour, TabBackground } from './shared/backgrounds/Backgrounds.jsx';
export { AppErrorBoundary, TabErrorBoundary } from './shared/errors/ErrorBoundaries.jsx';
export { TROPHY_ICON_MAP } from './shared/utils/trophyIcons.js';
export { generateVerticalMaskGradient } from './shared/utils/maskGradient.js';
export { hideOnError } from './shared/utils/imageHelpers.js';
