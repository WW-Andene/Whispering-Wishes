// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — data/constants.js
// Barrel re-export — the actual constants now live in domain-specific files:
//   appMeta.js       — app version, import size limit, header icon
//   servers.js       — server timezones + DST-aware UTC offset lookup
//   gachaRates.js    — gacha rates/pity, subscriptions, calculator input caps
//   materialData.js  — material icons/tiers, ascension/EXP/skill-upgrade costs
//   weaponLists.js   — weapon rarity lists + release order
//   uiConstants.js   — small cross-feature UI constants (tab order, medal colors)
// Kept as a single import surface so existing `from '../../data/constants.js'`
// call sites across the app don't need touching.
// ═══════════════════════════════════════════════════════════════════════════════

export { APP_VERSION, MAX_IMPORT_SIZE_MB, HEADER_ICON } from './appMeta.js';
export { SERVERS, getServerOffset } from './servers.js';
export {
  HARD_PITY,
  SOFT_PITY_START,
  LUNITE_DAILY_ASTRITE,
  ASTRITE_PER_PULL,
  BEGINNER_ASTRITE_PER_PULL,
  SUBSCRIPTIONS,
  MAX_ASTRITE,
  MAX_LUNITE,
  MAX_RADIANT,
  MAX_LUSTROUS,
  MAX_CALC_PULLS,
  HARD_PITY_4STAR,
  FEATURED_4STAR_RATE,
  AVG_PULLS_PER_4STAR,
  AVG_4STAR_PULLS_PER_FEATURED,
  LEADERBOARD_DISPLAY_LIMIT,
} from './gachaRates.js';
export {
  MATERIAL_IMAGES,
  COMMON_MAT_TIERS,
  FORGERY_MAT_TIERS,
  RESONATOR_ASCENSION_COSTS,
  RESONATOR_EXP_COSTS,
  SKILL_UPGRADE_COSTS,
  WEAPON_REFINE_SCALE,
  WEAPON_ASCENSION_COSTS_5,
  WEAPON_ASCENSION_COSTS_4,
  WEAPON_EXP_COSTS_5,
  WEAPON_EXP_COSTS_4,
} from './materialData.js';
export {
  ALL_5STAR_WEAPONS,
  ALL_4STAR_WEAPONS,
  ALL_3STAR_WEAPONS,
  ALL_2STAR_WEAPONS,
  ALL_1STAR_WEAPONS,
  WEAPON_RELEASE_ORDER,
} from './weaponLists.js';
export { TAB_ORDER, MEDAL_COLORS } from './uiConstants.js';
