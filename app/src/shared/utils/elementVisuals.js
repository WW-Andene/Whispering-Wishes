// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — shared/utils/elementVisuals.js
// Extracted from the former utils/helpers.js grab-bag (2026-08-26 restructuring):
// this file owns the app's element/weapon/set/faction/region/combat-role color
// and icon lookup system — a single, unrelated-to-haptics domain that used to
// be bolted onto the same file as the haptic-feedback module. Moved to
// shared/ (not utils/) because it's consumed by 10+ feature and shared
// components, not a small cross-cutting helper.
// ═══════════════════════════════════════════════════════════════════════════════

import { ECHO_SETS, ECHO_DATA } from '../../data/echoes.js';

// ═══════════════════════════════════════════════════════════════════════════════
// ELEMENT COLOR UTILITIES — Single source of truth for element→color mappings
// P6-FIX: Consolidates 3 duplicate inline copies (F-P6-046)
// ═══════════════════════════════════════════════════════════════════════════════
const ELEMENT_COLORS = {
  Fusion:  { hex: '#f97316', bg: 'rgba(249,115,22,0.15)', border: 'rgba(249,115,22,0.4)' },
  Electro: { hex: '#a855f7', bg: 'rgba(168,85,247,0.15)', border: 'rgba(168,85,247,0.4)' },
  Aero:    { hex: '#10b981', bg: 'rgba(16,185,129,0.15)', border: 'rgba(16,185,129,0.4)' },
  Glacio:  { hex: '#06b6d4', bg: 'rgba(6,182,212,0.15)',  border: 'rgba(6,182,212,0.4)' },
  Havoc:   { hex: '#ec4899', bg: 'rgba(236,72,153,0.15)', border: 'rgba(236,72,153,0.4)' },
  Spectro: { hex: '#edaf18', bg: 'rgba(237,175,24,0.15)',  border: 'rgba(237,175,24,0.4)' }, /* MED-1: brand gold */
  Heal:    { hex: '#22c55e', bg: 'rgba(34,197,94,0.15)',  border: 'rgba(34,197,94,0.4)' },
  Support: { hex: '#60a5fa', bg: 'rgba(96,165,250,0.15)', border: 'rgba(96,165,250,0.4)' },
  ATK:     { hex: '#ef4444', bg: 'rgba(239,68,68,0.15)',  border: 'rgba(239,68,68,0.4)' },
  Shield:  { hex: '#94a3b8', bg: 'rgba(148,163,184,0.15)', border: 'rgba(148,163,184,0.4)' },
  Physical:{ hex: '#94a3b8', bg: 'rgba(148,163,184,0.15)', border: 'rgba(148,163,184,0.4)' },
};
// Wong palette — optimized for deuteranopia, protanopia, and tritanopia
// Source: https://www.nature.com/articles/nmeth.1618
const _cbHex = (hex) => ({ hex, bg: `${hex}26`, border: `${hex}66` }); // 15% and 40% alpha via hex
const ELEMENT_COLORS_CB = {
  Fusion:  _cbHex('#e69f00'), // amber (was orange — too close to Havoc/red)
  Electro: _cbHex('#cc79a7'), // rose-mauve (was purple — OK but improved)
  Aero:    _cbHex('#009e73'), // teal (was green — indistinguishable from red)
  Glacio:  _cbHex('#56b4e9'), // sky blue (was cyan — improved contrast)
  Havoc:   _cbHex('#d55e00'), // vermillion (was pink — too close to red)
  Spectro: _cbHex('#f0e442'), // bright yellow (was gold — improved distinction)
  Heal:    _cbHex('#009e73'), // teal
  Support: _cbHex('#56b4e9'), // sky blue
  ATK:     _cbHex('#d55e00'), // vermillion
  Shield:  _cbHex('#94a3b8'),
  Physical:_cbHex('#94a3b8'),
};
// Element shape labels — shown alongside name in CB mode (§E10-CB-F3 spec)
// Plain text symbols only — no emoji
const ELEMENT_SHAPES = {
  Fusion: '△', Electro: '◇', Aero: '○', Glacio: '□', Havoc: '✕', Spectro: '☆',
};
// Official in-game element icons (T_IconElementAttri* UI assets), re-hosted on ibb.co.
// Source: the source asset CDN, traced from its client bundle 2026-08-17.
const ELEMENT_ICONS = {
  Glacio:  './ui-icons/i.ibb.co-60n11MZg-Element-Glacio.webp',
  Fusion:  './ui-icons/i.ibb.co-RpbkMNCt-Element-Fusion.webp',
  Electro: './ui-icons/i.ibb.co-BVKXJnxb-Element-Electro.webp',
  Aero:    './ui-icons/i.ibb.co-YF7k8Wy6-Element-Aero.webp',
  Spectro: './ui-icons/i.ibb.co-JjVxtqZ4-Element-Spectro.webp',
  Havoc:   './ui-icons/i.ibb.co-20gBGvrV-Element-Havoc.webp',
};
const getElementIcon = (el) => ELEMENT_ICONS[el] || null;
// Official in-game weapon-type icons (SP_IconNor* UI assets), re-hosted on ibb.co.
// Source: the source/assets/ww/UIResources/Common/Atlas/SkillIcon/SkillIconNor/, 2026-08-17.
const WEAPON_TYPE_ICONS = {
  Broadblade: './ui-icons/i.ibb.co-JF8qY50h-Weapon-Type-Broadblade.webp',
  Sword:      './ui-icons/i.ibb.co-Xx5RH0dH-Weapon-Type-Sword.webp',
  Pistols:    './ui-icons/i.ibb.co-sJbMbWm4-Weapon-Type-Pistols.webp',
  Gauntlets:  './ui-icons/i.ibb.co-wFXHM40H-Weapon-Type-Gauntlets.webp',
  Rectifier:  './ui-icons/i.ibb.co-5gds1gDg-Weapon-Type-Rectifier.webp',
};
const getWeaponTypeIcon = (type) => WEAPON_TYPE_ICONS[type] || null;
// Official in-game stat icons (T_Iconproperty* UI assets for ATK/HP/DEF/Energy Regen; Crit Rate/Crit
// DMG from the wiki, since the source's Crit Rate filename couldn't be found).
// Re-hosted on ibb.co. Keys are the base stat name — '%' suffixes (e.g. weapon substat 'ATK%') are
// stripped by getStatIcon() before lookup.
const STAT_ICONS = {
  ATK:          './ui-icons/i.ibb.co-XrcVGXTx-Stat-ATK.webp',
  HP:           './ui-icons/i.ibb.co-nsrx0Ckg-Stat-HP.webp',
  DEF:          './ui-icons/i.ibb.co-xtS2fNjc-Stat-DEF.webp',
  'Energy Regen': './ui-icons/i.ibb.co-rRJTgZKr-Stat-Energy-Regen.webp',
  'Crit Rate':  './ui-icons/i.ibb.co-yBdK77pW-Stat-Crit-Rate.webp',
  'Crit DMG':   './ui-icons/i.ibb.co-tT1t8HTN-Stat-Crit-DMG.webp',
};
const getStatIcon = (stat) => {
  if (!stat) return null;
  const key = stat.trim().replace(/%$/, '');
  return STAT_ICONS[key] || null;
};
// Official Sonata (echo) set icons (T_IconSonata* UI assets), re-hosted on ibb.co.
// Source: the wiki/Sonata, traced 2026-08-17.
const SET_ICONS = {
  'Freezing Frost':            './ui-icons/i.ibb.co-b5cjDwZP-Icon-Freezing-Frost.webp',
  'Molten Rift':                './ui-icons/i.ibb.co-q3qYZYrP-Icon-Molten-Rift.webp',
  'Void Thunder':                './ui-icons/i.ibb.co-LhH3mKDt-Icon-Void-Thunder.webp',
  'Sierra Gale':                './ui-icons/i.ibb.co-JWxWKBbG-Icon-Sierra-Gale.webp',
  'Celestial Light':            './ui-icons/i.ibb.co-23wDkGX2-Icon-Celestial-Light.webp',
  // Sun-Sinking Eclipse was renamed to Havoc Eclipse in v1.4 — same set, same icon
  'Havoc Eclipse':              './ui-icons/i.ibb.co-p6mwBLpJ-Icon-Sun-sinking-Eclipse.webp',
  'Rejuvenating Glow':          './ui-icons/i.ibb.co-dwJc2xcy-Icon-Rejuvenating-Glow.webp',
  'Moonlit Clouds':              './ui-icons/i.ibb.co-PBDwxwt-Icon-Moonlit-Clouds.webp',
  'Lingering Tunes':            './ui-icons/i.ibb.co-G4qdLpgx-Icon-Lingering-Tunes.webp',
  'Frosty Resolve':              './ui-icons/i.ibb.co-HfNmN45f-Icon-Frosty-Resolve.webp',
  'Eternal Radiance':            './ui-icons/i.ibb.co-6zkWW4h-Icon-Eternal-Radiance.webp',
  'Midnight Veil':              './ui-icons/i.ibb.co-vbQ99B4-Icon-Midnight-Veil.webp',
  'Empyrean Anthem':            './ui-icons/i.ibb.co-WNPt9mvL-Icon-Empyrean-Anthem.webp',
  'Tidebreaking Courage':        './ui-icons/i.ibb.co-twrQZYKq-Icon-Tidebreaking-Courage.webp',
  'Gusts of Welkin':            './ui-icons/i.ibb.co-s93G4MWw-Icon-Gusts-of-Welkin.webp',
  'Windward Pilgrimage':        './ui-icons/i.ibb.co-WWMCRYcw-Icon-Windward-Pilgrimage.webp',
  'Flaming Clawprint':          './ui-icons/i.ibb.co-B5Rsjgn2-Icon-Flaming-Clawprint.webp',
  'Crown of Valor':              './ui-icons/i.ibb.co-DfCHGtNs-Icon-Crown-of-Valor.webp',
  'Law of Harmony':              './ui-icons/i.ibb.co-fdKgmPfs-Icon-Law-of-Harmony.webp',
  "Flamewing's Shadow":          './ui-icons/i.ibb.co-FL64LWkQ-Icon-Flamewing-s-Shadow.webp',
  'Thread of Severed Fate':      './ui-icons/i.ibb.co-Zz6yX3X0-Icon-Thread-of-Severed-Fate.webp',
  'Dream of the Lost':          './ui-icons/i.ibb.co-dwXb8xTc-Icon-Dream-of-the-Lost.webp',
  'Pact of Neonlight Leap':      './ui-icons/i.ibb.co-9m2qR6xk-Icon-Pact-of-Neonlight-Leap.webp',
  'Rite of Gilded Revelation':  './ui-icons/i.ibb.co-fzBZS81C-Icon-Rite-of-Gilded-Revelation.webp',
  'Halo of Starry Radiance':    './ui-icons/i.ibb.co-Y7MT2Y4G-Icon-Halo-of-Starry-Radiance.webp',
  'Trailblazing Star':          './ui-icons/i.ibb.co-0RvWtQgj-Icon-Trailblazing-Star.webp',
  'Chromatic Foam':              './ui-icons/i.ibb.co-G4Qr7QdJ-Icon-Chromatic-Foam.webp',
  'Sound of True Name':          './ui-icons/i.ibb.co-Df7Y2V3q-Icon-Sound-of-True-Name.webp',
  'Song of Feathered Trace':    './ui-icons/i.ibb.co-k65KVHds-Icon-Song-of-Feathered-Trace.webp',
  "Heart of Evil's Purge":      './ui-icons/i.ibb.co-zT2YWWFT-Icon-Heart-of-Evil-s-Purge.webp',
  'Lamp of Nether Road':        './ui-icons/i.ibb.co-XwV6kgH-Icon-Lamp-of-Nether-Road.webp',
  'Reel of Spliced Memories':    './ui-icons/i.ibb.co-qYKQ4Vx9-Icon-Reel-of-Spliced-Memories.webp',
  'Wishes of Quiet Snowfall':    './ui-icons/i.ibb.co-q3k4jgDX-Icon-Wishes-of-Quiet-Snowfall.webp',
  'Shadow of Shattered Dreams':  './ui-icons/i.ibb.co-XZvbg138-Icon-Shadow-of-Shattered-Dreams.webp',
};
const getSetIcon = (setName) => SET_ICONS[setName] || null;
// In-game faction emblem/logo icons, re-hosted on ibb.co.
// Source: the wiki/Category:Factions, traced 2026-08-17.
// NOT a complete faction list — the wiki only has a proper emblem/logo image
// for these; other factions (e.g. Ghost Hounds, Court of Savantae, Ministry of
// War) have no dedicated icon asset there, so they're intentionally omitted
// rather than guessed. Consumed by CharacterDetailModal's Organization row.
const FACTION_ICONS = {
  'Black Shores':          './ui-icons/i.ibb.co-j9CYZKpd-Black-Shores.webp',
  'Midnight Rangers':      './ui-icons/i.ibb.co-Zz92sqFX-Midnight-Rangers.webp',
  'Fractsidus':            './ui-icons/i.ibb.co-kVVdYWDC-Fractsidus.webp',
  'Pioneer Association':  './ui-icons/i.ibb.co-5XkMDsnY-Pioneer-Association.webp',
  'Lollo Logistics':      './ui-icons/i.ibb.co-bR6KRJXM-Lollo-Logistics.webp',
  'Order of the Deep':    './ui-icons/i.ibb.co-qYB4FKVs-Order-of-the-Deep.webp',
  'Troupe of Fools':      './ui-icons/i.ibb.co-S7NWRwVD-Troupe-of-Fools.webp',
  'Montelli Family':      './ui-icons/i.ibb.co-21NbvT2k-Montelli-Family.webp',
  'Fisalia Family':        './ui-icons/i.ibb.co-xqn6PCQd-Fisalia-Family.webp',
  'Startorch Academy':    './ui-icons/i.ibb.co-tprYJw6t-Startorch-Academy.webp',
  'Spacetrek Collective':  './ui-icons/i.ibb.co-ynLTRypG-Spacetrek-Collective.webp',
  'Roya Tribe':            './ui-icons/i.ibb.co-PZkNcXCb-Roya-Tribe.webp',
  // Added 2026-08-17 for Augusta's audit: Septimont is a city-state region of Rinascita (see
  // REGION_DATA's fix in characters.js) but also has its own dedicated emblem, used as her organization.
  'Septimont':             './ui-icons/i.ibb.co-0pV0d4Yg-septimont-emblem.webp',
  // Added 2026-08-17 for Lucy's audit: her organization field is the nation Lahai-Roi itself (see
  // characters.js's IDENTITY_DATA comment) — reuses the same Roya Frostlands Emblem asset as the
  // REGION_ICONS entry below, matching the Black Shores dual-use precedent (a name that's both a
  // nation and a faction shares one emblem rather than needing two).
  'Lahai-Roi':             './ui-icons/i.ibb.co-0jpmLZTp-Region-royafrostlands.webp',
  // Added 2026-08-18 for Qingxiao's audit: Mengzhou is a city within Huanglong (like Jinzhou) with its
  // own dedicated emblem, sourced from the wiki's File:Mengzhou_Emblem.png (uploaded for her 3.6 release).
  'Mengzhou':              './ui-icons/i.ibb.co-hJV68MmF-mengzhou-emblem.webp',
  // Added 2026-08-18 for Baizhi's 4★ audit, sourced from the wiki's File:Huaxu_Academy.png.
  'Huaxu Academy':         './ui-icons/i.ibb.co-hFdM9DTy-huaxu-academy.webp',
};
const getFactionIcon = (faction) => FACTION_ICONS[faction] || null;
// In-game nation/region emblem icons, re-hosted on ibb.co. Same convention as FACTION_ICONS but for
// the `region`/`birthplace` fields (see characters.js's REGION_DATA/IDENTITY_DATA comments) — a nation
// is a distinct concept from a specific faction, even though some names coincide (e.g. Black Shores is
// both a nation and its own faction, so it's deliberately listed in both maps with the same asset).
// Only populated for nations that have appeared for an audited character so far.
const REGION_ICONS = {
  'Huanglong': './ui-icons/i.ibb.co-G34c0tdc-Huanglong-Emblem.webp',
  'Black Shores': './ui-icons/i.ibb.co-j9CYZKpd-Black-Shores.webp',
  // Added 2026-08-18: Septimont is a valid Region filter value (CollectionTab) but had no REGION_ICONS
  // entry — only a FACTION_ICONS one. Same asset, matching this file's own Black Shores dual-use precedent.
  'Septimont': './ui-icons/i.ibb.co-0pV0d4Yg-septimont-emblem.webp',
  // Added 2026-08-17: Carlotta's region (and Roccia/Phoebe/Brant/Cantarella/Zani/Ciaccona/Cartethyia/
  // Lupa/Phrolova's, per REGION_DATA in characters.js) had no icon at all until now.
  'Rinascita': './ui-icons/i.ibb.co-hFwcxxhG-rinascita-emblem.webp',
  // Fixed 2026-08-17 (was File:Lahai-Roi.png, a 1920x1080 gameplay screenshot, not an emblem — wrong
  // asset for a badge icon). The nation's own {{Nation Infobox}} on the wiki lists File:Roya_Frostlands_
  // Emblem.png as ITS emblem too (Lahai-Roi is the underground nation beneath the surface Roya
  // Frostlands, and the wiki has never made a separate emblem for the two) — same asset as the
  // 'Roya Frostlands' entry below, matching the wiki's own convention rather than guessing a new icon.
  'Lahai-Roi': './ui-icons/i.ibb.co-0jpmLZTp-Region-royafrostlands.webp',
  // Added 2026-08-17: Aemeath's birthplace (distinct from her Lahai-Roi region tie above) — sourced
  // from the wiki's own File:Roya_Frostlands_Emblem.png. New Federation (Lynae/Mornye's birthplace) has
  // no dedicated emblem asset on the wiki, so it's intentionally left unset rather than guessed.
  'Roya Frostlands': './ui-icons/i.ibb.co-0jpmLZTp-Region-royafrostlands.webp',
};
const getRegionIcon = (region) => REGION_ICONS[region] || null;

// Combat Role tag icons — the small badge row (Main Damage Dealer, Heavy Attack DMG, Traction, DMG
// Amplification, Tune Rupture Response, etc.) shown on each character's infobox, distinct from the
// single `role` field (Main DPS/Sub DPS/Healer/etc.) already used elsewhere. Source: the wiki's own
// Combat_Roles wiki page (the fixed, game-wide icon set — every character just picks a subset of these
// same ~38 icons), re-hosted on ibb.co (2026-08-17). Keys match the infobox `role` field's tag text
// exactly (semicolon-separated in wikitext, see characters.js's COMBAT_ROLE_DATA comment).
const COMBAT_ROLE_ICONS = {
  'Main Damage Dealer':                    './ui-icons/i.ibb.co-W4hpCQK0-Role-Main-Damage-Dealer.webp',
  'Resonance Skill Damage':                './ui-icons/i.ibb.co-pBKR9Cnh-Role-Resonance-Skill-Damage.webp',
  'Concerto Efficiency':                   './ui-icons/i.ibb.co-QvrG5dSh-Role-Concerto-Efficiency.webp',
  'Traction':                              './ui-icons/i.ibb.co-z9nYB8L-Role-Traction.webp',
  'Resonance Liberation Regeneration':     './ui-icons/i.ibb.co-rRwcLxNs-Role-Resonance-Liberation-Regeneration.webp',
  'Support and Healer':                    './ui-icons/i.ibb.co-xSxCY50N-Role-Support-And-Healer.webp',
  'Coordinated Attack':                    './ui-icons/i.ibb.co-zWxYmVq3-Role-Coordinated-Attack.webp',
  'DMG Amplification':                     './ui-icons/i.ibb.co-1tbwQf7c-Role-DMGAmplification.webp',
  'Basic Attack DMG Amplification':        './ui-icons/i.ibb.co-VcHHWdsP-Role-Basic-Attack-DMGAmplification.webp',
  'Resonance Liberation Damage':           './ui-icons/i.ibb.co-VWpRsvgx-Role-Resonance-Liberation-Damage.webp',
  'Resonance Skill DMG Amplification':     './ui-icons/i.ibb.co-PHkR7pc-Role-Resonance-Skill-DMGAmplification.webp',
  'Stagnation':                            './ui-icons/i.ibb.co-jkksyQRy-Role-Stagnation.webp',
  'Basic Attack Damage':                   './ui-icons/i.ibb.co-QFG8KmHN-Role-Basic-Attack-Damage.webp',
  'Havoc DMG Amplification':               './ui-icons/i.ibb.co-WNGg3bcj-Role-Havoc-DMGAmplification.webp',
  'Aero DMG Amplification':                './ui-icons/i.ibb.co-j9x4bJ4M-Role-Aero-DMGAmplification.webp',
  'Heavy Attack Damage':                   './ui-icons/i.ibb.co-dsRPFN0h-Role-Heavy-Attack-Damage.webp',
  'Heavy Attack DMG Amplification':        './ui-icons/i.ibb.co-4wjWDVxF-Role-Heavy-Attack-DMGAmplification.webp',
  'Resonance Liberation DMG Amplification': './ui-icons/i.ibb.co-MDvPXhD4-Role-Resonance-Liberation-DMGAmplification.webp',
  'Electro DMG Amplification':             './ui-icons/i.ibb.co-4Rw38fBj-Role-Electro-DMGAmplification.webp',
  'Vibration Strength Reduction':          './ui-icons/i.ibb.co-gM2GBSkv-Role-Vibration-Strength-Reduction.webp',
  'Interruption Resistance Boost':         './ui-icons/i.ibb.co-1tWDtMZK-Role-Interruption-Resistance-Boost.webp',
  'Fusion DMG Amplification':              './ui-icons/i.ibb.co-hFQJvK5t-Role-Fusion-DMGAmplification.webp',
  'Glacio DMG Amplification':              './ui-icons/i.ibb.co-Gv9NJ8sF-Role-Glacio-DMGAmplification.webp',
  'Spectro DMG Amplification':             './ui-icons/i.ibb.co-sJVW2xP6-Role-Spectro-DMGAmplification.webp',
  'Coordinated Attack DMG Amplification':  './ui-icons/i.ibb.co-G34ytqhK-Role-Coordinated-Attack-DMGAmplification.webp',
  'Spectro Frazzle':                       './ui-icons/i.ibb.co-tpjNJZ4q-Role-Spectro-Frazzle-Role.webp',
  'Aero Erosion':                          './ui-icons/i.ibb.co-YBfF4MZJ-Role-Aero-Erosion-Role.webp',
  'Echo Skill DMG Amplification':          './ui-icons/i.ibb.co-ccGBSck3-Role-Echo-Skill-DMGAmplification.webp',
  'Glacio Chafe':                          './ui-icons/i.ibb.co-CK3CZrT8-Role-Glacio-Chafe-Role.webp',
  'Electro Flare':                         './ui-icons/i.ibb.co-wFQpCbgN-Role-Electro-Flare-Role.webp',
  'Fusion Burst':                          './ui-icons/i.ibb.co-YFnMtBws-Role-Fusion-Burst-Role.webp',
  'Havoc Bane':                            './ui-icons/i.ibb.co-kV0kLwbb-Role-Havoc-Bane-Role.webp',
  'Tune Rupture Response':                 './ui-icons/i.ibb.co-5X8kGT3f-Role-Tune-Rupture-Response.webp',
  'Tune Break Boost':                      './ui-icons/i.ibb.co-PZY92L4r-Role-Tune-Break-Boost.webp',
  'Tune Strain Response':                  './ui-icons/i.ibb.co-jZJchddX-Role-Tune-Strain-Response.webp',
  'Off-Tune Buildup Efficiency':           './ui-icons/i.ibb.co-Jjcpjtg6-Role-Off-Tune-Buildup-Efficiency.webp',
  'Echo Skill Damage':                     './ui-icons/i.ibb.co-XrLtSVzH-Role-Echo-Skill-Damage.webp',
  'Hack Response':                         './ui-icons/i.ibb.co-jPFyVDzn-Role-Hack-Response.webp',
};
const getCombatRoleIcon = (tag) => COMBAT_ROLE_ICONS[tag] || null;
// Gacha currency icons — user-supplied assets, filed 2026-08-27.
const CURRENCY_ICONS = {
  Astrite:      './ui-icons/Currency-Astrite.webp',
  Lunite:       './ui-icons/Currency-Lunite.webp',
  'Radiant Tide':   './ui-icons/Currency-Radiant-Tide.webp',
  'Forging Tide':   './ui-icons/Currency-Forging-Tide.webp',
  'Lustrous Tide':  './ui-icons/Currency-Lustrous-Tide.webp',
};
const getCurrencyIcon = (currency) => CURRENCY_ICONS[currency] || null;

// P2-01 + P5-08 / P11-03 audit fixes:
//   P2-01: optional-chain documentElement.classList so the SSR render path
//          no longer crashes when document is partially built.
//   P5-08 / P11-03: the previous implementation read the DOM on every element
//          color lookup (called many times per render). Now the result is
//          cached in a module-scope flag, refreshed lazily when the
//          `colorblind-mode` class toggles on <html>. A MutationObserver
//          watches the classList and invalidates the cache on change —
//          installed once, per tab, on first call.
let _cbCached = null;            // null = not yet initialized; boolean once read
let _cbObserverInstalled = false;
const _refreshCBFlag = () => {
  _cbCached = typeof document !== 'undefined'
    && document.documentElement?.classList?.contains('colorblind-mode') === true;
};
const _installCBObserver = () => {
  if (_cbObserverInstalled) return;
  if (typeof document === 'undefined' || typeof MutationObserver === 'undefined') return;
  const root = document.documentElement;
  if (!root) return;
  _cbObserverInstalled = true;
  const observer = new MutationObserver(_refreshCBFlag);
  observer.observe(root, { attributes: true, attributeFilter: ['class'] });
};
const _isCB = () => {
  if (_cbCached === null) {
    _refreshCBFlag();
    _installCBObserver();
  }
  return _cbCached === true;
};
const _getColors = (el) => (_isCB() ? ELEMENT_COLORS_CB[el] : ELEMENT_COLORS[el]) || ELEMENT_COLORS[el];
const getElementColor = (el) => _getColors(el)?.hex || '#6b7280';
const getElementBg = (el) => _getColors(el)?.bg || 'rgba(107,114,128,0.15)';
const getElementBorder = (el) => _getColors(el)?.border || 'rgba(107,114,128,0.4)';
const getElementShape = (el) => _isCB() ? (ELEMENT_SHAPES[el] || '') : '';
// Get element color for a sonata set name
const getSetElementColor = (setName) => {
  const setData = ECHO_SETS[setName];
  return setData ? getElementColor(setData.element) : '#6b7280';
};
// Get unique element colors for an echo's sets (for multi-color gradients)
const getEchoSetColors = (echoName) => {
  const data = ECHO_DATA[echoName];
  if (!data) return [];
  const seen = new Set();
  return data.sets.map(s => {
    const el = ECHO_SETS[s]?.element;
    const hex = getElementColor(el);
    if (seen.has(hex)) return null;
    seen.add(hex);
    return hex;
  }).filter(Boolean);
};
// Get buff element color (maps 'Glacio DMG' → Glacio, etc.)
const getBuffElementColor = (buff) => {
  const el = typeof buff === 'string' ? buff.replace(' DMG', '') : '';
  return ELEMENT_COLORS[el]?.hex || ELEMENT_COLORS[buff]?.hex || '#6b7280';
};

export {
  ELEMENT_COLORS,
  ELEMENT_ICONS,
  getElementColor,
  getElementBg,
  getElementBorder,
  getElementShape,
  getElementIcon,
  getSetElementColor,
  getEchoSetColors,
  getBuffElementColor,
  WEAPON_TYPE_ICONS,
  getWeaponTypeIcon,
  STAT_ICONS,
  getStatIcon,
  SET_ICONS,
  getSetIcon,
  FACTION_ICONS,
  getFactionIcon,
  REGION_ICONS,
  getRegionIcon,
  COMBAT_ROLE_ICONS,
  getCombatRoleIcon,
  CURRENCY_ICONS,
  getCurrencyIcon,
};
