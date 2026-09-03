// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — shared/modals/CharacterDetailModal.jsx
// CharacterDetailModal
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useState } from 'react';
import { Sparkles, Swords, Star, User, Users, TrendingUp, Target, Zap, X, LayoutGrid, RotateCw, Play } from 'lucide-react';
import { CHARACTER_DATA, CHAR_BUFF_TABLE, SKILL_MULTIPLIERS, CHARACTER_ROTATIONS, RESONANCE_CHAIN_DATA, getSkillIcon, CHAIN_NODE_ICONS, getLocalizedCharacterData, getLocalizedCharBuffTable, getLocalizedCharacterRotations, getLocalizedChainNodeNames, findSkillMultiplierRow } from '../../data/characters.js';
import { SKILL_TYPE_FR, SKILL_NAME_FR } from '../../data/characters.fr.js';
import { WEAPON_DATA, getLocalizedWeaponData } from '../../data/weapons.js';
import { getSonataLoadouts } from '../../data/echoes.js';
import { DEFAULT_COLLECTION_IMAGES, getConveneAnimation, getCharacterBannerArt } from '../../data/banners.js';
import { COMMON_MAT_TIERS, FORGERY_MAT_TIERS, RESONATOR_ASCENSION_COSTS, RESONATOR_EXP_COSTS, SKILL_UPGRADE_COSTS } from '../../data/constants.js';
import { FocusTrapModal } from '../components/FocusTrapModal.jsx';
import { stepStyle } from '../../features/teams/RotationTimeline.jsx';
import { calcTeamStats } from '../../features/teams/calcTeamStats.js';
import { getElementIcon, getWeaponTypeIcon, getStatIcon, getFactionIcon, getRegionIcon, getCombatRoleIcon } from '../utils/elementVisuals.js';
import { hideOnError } from '../utils/imageHelpers.js';
import { MaterialItem } from '../components/MaterialItem.jsx';
import { SpinePlayer, getSpineId, SPINE_SPRITES_ENABLED_OUTSIDE_PANEL } from '../components/SpinePlayer.jsx';
import { FullSpineViewerButton } from '../components/FullSpineViewerButton.jsx';
import { ConveneVideo } from '../components/ConveneVideoLayer.jsx';
import { useImageFramingContext } from '../../providers/ImageFramingProvider.jsx';
import { t, formatNumber, getLocale } from '../../utils/i18n.js';

// Shared element color maps. `hex` (same source as elementVisuals.js's ELEMENT_COLORS)
// drives the header's corner fade: lighter top-left, subtly darker/cooler
// bottom-right, both mixed from this same base hue.
const DETAIL_ELEMENT_COLORS = {
  Fusion: { bg: 'bg-orange-500/20', text: 'text-orange-400', border: 'border-orange-500/50', hex: '#f97316' },
  Electro: { bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-500/50', hex: '#a855f7' },
  Aero: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/50', hex: '#10b981' },
  Glacio: { bg: 'bg-cyan-500/20', text: 'text-cyan-400', border: 'border-cyan-500/50', hex: '#06b6d4' },
  Havoc: { bg: 'bg-pink-500/20', text: 'text-pink-400', border: 'border-pink-500/50', hex: '#ec4899' },
  Spectro: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/50', hex: '#edaf18' },
};
// Sonata (echo set) colors, for the Recommended Echoes section's sonata name + main-echo highlight.
// The 6 DMG-element sets use the app's standard element colors (same hues as the header/element
// badges elsewhere) — these are a real, consistent brand convention, not a guess. The 12 sets whose
// ECHO_SETS.element is non-elemental (Heal/Support/ATK/Shield) have no such convention, so each is
// keyed by its own set name to a color actually sampled from its in-game icon artwork (SET_ICONS in
// elementVisuals.js) — average hue of the icon's saturated pixels, brightened for legibility on a dark
// background but not reassigned to an arbitrary category color (e.g. Moonlit Clouds' icon is a
// muted slate-blue, not the violet a "Support" default would have implied).
const SONATA_ELEMENT_COLORS = {
  Fusion: { text: 'text-orange-400', border: 'border-orange-500/60', ring: 'ring-orange-500/60', bg: 'bg-orange-500/10' },
  Electro: { text: 'text-purple-400', border: 'border-purple-500/60', ring: 'ring-purple-500/60', bg: 'bg-purple-500/10' },
  Aero: { text: 'text-emerald-400', border: 'border-emerald-500/60', ring: 'ring-emerald-500/60', bg: 'bg-emerald-500/10' },
  Glacio: { text: 'text-cyan-400', border: 'border-cyan-500/60', ring: 'ring-cyan-500/60', bg: 'bg-cyan-500/10' },
  Havoc: { text: 'text-pink-400', border: 'border-pink-500/60', ring: 'ring-pink-500/60', bg: 'bg-pink-500/10' },
  Spectro: { text: 'text-yellow-400', border: 'border-yellow-500/60', ring: 'ring-yellow-500/60', bg: 'bg-yellow-500/10' },
};
// Sampled from each set's actual SET_ICONS artwork (see elementVisuals.js) — full literal Tailwind
// arbitrary-value classes, one const per set, so the JIT scanner can find them at build time.
const SONATA_SET_COLORS = {
  'Rejuvenating Glow': { text: 'text-[#9dd247]', border: 'border-[#9dd247]/60', ring: 'ring-[#9dd247]/60', bg: 'bg-[#9dd247]/10' },
  'Moonlit Clouds': { text: 'text-[#7480aa]', border: 'border-[#7480aa]/60', ring: 'ring-[#7480aa]/60', bg: 'bg-[#7480aa]/10' },
  'Lingering Tunes': { text: 'text-[#d14b47]', border: 'border-[#d14b47]/60', ring: 'ring-[#d14b47]/60', bg: 'bg-[#d14b47]/10' },
  'Crown of Valor': { text: 'text-[#bc8d5d]', border: 'border-[#bc8d5d]/60', ring: 'ring-[#bc8d5d]/60', bg: 'bg-[#bc8d5d]/10' },
  'Law of Harmony': { text: 'text-[#7091c9]', border: 'border-[#7091c9]/60', ring: 'ring-[#7091c9]/60', bg: 'bg-[#7091c9]/10' },
  'Empyrean Anthem': { text: 'text-[#6f90c6]', border: 'border-[#6f90c6]/60', ring: 'ring-[#6f90c6]/60', bg: 'bg-[#6f90c6]/10' },
  'Tidebreaking Courage': { text: 'text-[#7598a3]', border: 'border-[#7598a3]/60', ring: 'ring-[#7598a3]/60', bg: 'bg-[#7598a3]/10' },
  'Halo of Starry Radiance': { text: 'text-[#a1d345]', border: 'border-[#a1d345]/60', ring: 'ring-[#a1d345]/60', bg: 'bg-[#a1d345]/10' },
  'Song of Feathered Trace': { text: 'text-[#a79a81]', border: 'border-[#a79a81]/60', ring: 'ring-[#a79a81]/60', bg: 'bg-[#a79a81]/10' },
  'Lamp of Nether Road': { text: 'text-[#c46e54]', border: 'border-[#c46e54]/60', ring: 'ring-[#c46e54]/60', bg: 'bg-[#c46e54]/10' },
  'Reel of Spliced Memories': { text: 'text-[#7293c9]', border: 'border-[#7293c9]/60', ring: 'ring-[#7293c9]/60', bg: 'bg-[#7293c9]/10' },
  'Shadow of Shattered Dreams': { text: 'text-[#d54a43]', border: 'border-[#d54a43]/60', ring: 'ring-[#d54a43]/60', bg: 'bg-[#d54a43]/10' },
};
const DEFAULT_SONATA_COLOR = { text: 'text-purple-400', border: 'border-purple-500/60', ring: 'ring-purple-500/60', bg: 'bg-purple-500/10' };
// Mixes a hex color toward an {r,g,b} target by `amount` (0-1), at `alpha` opacity.
const _mixRgba = (hex, target, amount, alpha) => {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.round(((n >> 16) & 255) + (target.r - ((n >> 16) & 255)) * amount);
  const g = Math.round(((n >> 8) & 255) + (target.g - ((n >> 8) & 255)) * amount);
  const b = Math.round((n & 255) + (target.b - (n & 255)) * amount);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};
// Single diagonal fade: a lighter tint of the element color top-left, fading
// through transparent, into a subtle cooler/darker shade (mixed toward the
// app's own near-black navy, --bg-app-ish rgb(12,16,24)) bottom-right — both
// derived from the same base hue rather than an unrelated color.
const elementCornerFade = (hex) =>
  `linear-gradient(135deg, ${_mixRgba(hex, { r: 255, g: 255, b: 255 }, 0.5, 0.28)} 0%, transparent 45%, ${_mixRgba(hex, { r: 12, g: 16, b: 24 }, 0.65, 0.22)} 100%)`;

// Hoisted team parsing helper
const parseTeamMembers = (teamStr) => teamStr.split('+').map(s => s.trim()).filter(Boolean);

// Long-form kit/note prose in the data files is written as one dense run-on paragraph (audit-trail
// style, not reader-facing) — often just a handful of very long compound sentences packed with
// parentheticals, colons, and em-dashes. Grouping by a fixed sentence COUNT (the prior approach) still
// produced a wall of text whenever those sentences were individually long, so this splits by an actual
// length budget instead: walk sentence-by-sentence (". "/"; " before a capital letter or digit — avoids
// breaking on "e.g." "vs." decimals, etc.) and start a new paragraph once the running paragraph would
// exceed maxChars. A single sentence that alone exceeds the budget is further broken on its own
// secondary clause boundaries (" — "/"; ") so no one paragraph is still an unreadable block.
function splitIntoParagraphs(text, maxChars = 200) {
  if (!text) return [];
  const sentences = text.match(/[^.!?]+[.!?]+(?:['"’»]?\s+|$)/g) || [text];
  const paragraphs = [];
  let current = '';
  const pushCurrent = () => { if (current.trim()) paragraphs.push(current.trim()); current = ''; };
  for (const raw of sentences) {
    const sentence = raw.trim();
    if (!sentence) continue;
    if (sentence.length > maxChars) {
      pushCurrent();
      // Oversized single sentence: break on its own em-dash/semicolon clause boundaries instead.
      const clauses = sentence.split(/(?<=[;])\s+|\s+—\s+/);
      let clausePara = '';
      for (const clause of clauses) {
        if (clausePara && (clausePara.length + clause.length + 3) > maxChars) {
          paragraphs.push(clausePara.trim());
          clausePara = clause;
        } else {
          clausePara = clausePara ? `${clausePara} — ${clause}` : clause;
        }
      }
      if (clausePara.trim()) paragraphs.push(clausePara.trim());
      continue;
    }
    if (current && (current.length + sentence.length + 1) > maxChars) pushCurrent();
    current = current ? `${current} ${sentence}` : sentence;
  }
  pushCurrent();
  return paragraphs.filter(Boolean);
}

const CharacterDetailModal = ({ name, onClose, imageUrl, framing, infoFraming, onViewInTeams, collectionData, visualSettings }) => {
  const { getImageFraming, framingMode, editingImage, setEditingImage } = useImageFramingContext();
  const [conveneVideoPlaying, setConveneVideoPlaying] = useState(false);
  const [assetBannerVideoPlaying, setAssetBannerVideoPlaying] = useState(false);
  const data = CHARACTER_DATA[name];
  if (!data) return null;
  const conveneVideoUrl = getConveneAnimation(name);
  const bannerArtUrl = getCharacterBannerArt(name);

  const colors = DETAIL_ELEMENT_COLORS[data.element] || DETAIL_ELEMENT_COLORS.Spectro;
  const bestWeapon = data.bestWeapon || null;
  const weaponData = bestWeapon ? (getLocalizedWeaponData(getLocale())[bestWeapon] || WEAPON_DATA[bestWeapon]) : null;
  const localizedBuffNote = getLocalizedCharBuffTable(getLocale())[name]?.note || CHAR_BUFF_TABLE[name]?.note;
  const localizedRotation = getLocalizedCharacterRotations(getLocale())[name] || CHARACTER_ROTATIONS[name];
  // Solo Rotation Guide — reuses the Team tab's own calcTeamStats/RotationGuideCard, fed a team of
  // just this one character (teamEquipment: {} → falls back to bestWeapon/bestEchoes, same "preview"
  // defaults the Team tab itself uses before you've equipped anything). This is what actually made the
  // Team tab's rotation read as "more developed" than this modal's own plain step list: `reason`/
  // `inheritsFromTeam`/`ownKit`/`handsOffToNext` are computed from the buff timeline, not hand-authored
  // per character — so building it here generically covers all 58 characters at once, no per-character
  // authoring needed, same as Team tab gets it "for free" from calcTeamStats. One inbound override:
  // calcTeamStats sources skillSequence from the raw (English-only) CHARACTER_ROTATIONS, but this
  // modal already has locale-aware notes via getLocalizedCharacterRotations — swapped back in below so
  // French users don't lose notes they already had.
  const soloRotationTimeline = React.useMemo(() => {
    try {
      const stats = calcTeamStats([name, null, null], 0, null, {}, '', 90);
      const timeline = stats?.rotationTimeline;
      if (!timeline?.steps?.length) return null;
      if (localizedRotation) timeline.steps[0].skillSequence = localizedRotation;
      return timeline;
    } catch {
      return null;
    }
  }, [name, localizedRotation]);
  const localizedChainNodeNames = getLocalizedChainNodeNames(getLocale());
  const weaponImg = bestWeapon ? DEFAULT_COLLECTION_IMAGES[bestWeapon] : null;

  // Ownership helpers for greyed-out completion indicators
  const ownsChar = (n) => {
    if (!collectionData) return true; // no data = don't grey out
    return (collectionData.chars5Counts?.[n] || 0) + (collectionData.chars4Counts?.[n] || 0) > 0;
  };
  const charCopies = (n) => {
    if (!collectionData) return 0;
    return (collectionData.chars5Counts?.[n] || 0) + (collectionData.chars4Counts?.[n] || 0);
  };
  const ownsWeapon = (n) => {
    if (!collectionData) return true;
    return (collectionData.weaps5Counts?.[n] || 0) + (collectionData.weaps4Counts?.[n] || 0) + (collectionData.weaps3Counts?.[n] || 0) > 0;
  };
  const ownedCopies = charCopies(name); // how many copies of THIS character
  
  // Info framing: use info-specific framing, falling back to collection framing offset
  const f = infoFraming || (framing ? { x: framing.x, y: framing.y, zoom: framing.zoom } : { x: 0, y: 0, zoom: 100 });

  const isFullAnim = visualSettings?.animationsEnabled === 'full';
  const spineId = SPINE_SPRITES_ENABLED_OUTSIDE_PANEL && isFullAnim && !framingMode ? getSpineId(name, { surface: 'collection' }) : null;

  return (
    <FocusTrapModal isOpen={true} onClose={onClose} className="" onClick={onClose} ariaLabel={t('modals.characterDetail.resonatorDetailsAria', { name })} centered padding="p-3">
      <div
        className={`kuro-card relative w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col border ${colors.border}`}
        onClick={e => e.stopPropagation()}
      >
       <div className="overflow-y-auto flex-1" data-sheet-scroll>
        {/* Header with image */}
        <div className={`relative h-48 overflow-hidden rounded-t-2xl ${framingMode ? 'cursor-pointer' : ''} ${framingMode && editingImage === `info-${name}` ? 'ring-2 ring-emerald-500' : ''}`} style={{ contain: 'paint' }} data-sheet-header
          onClick={framingMode ? (e) => { e.stopPropagation(); setEditingImage(`info-${name}`); } : undefined}
        >
          <div className={`absolute inset-0 bg-gradient-to-br ${colors.bg}`} />
          <div className="absolute inset-0" style={{ background: elementCornerFade(colors.hex) }} />
          {framingMode && editingImage === `info-${name}` && (
            <div className="absolute top-2 left-2 z-20 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
              <span className="text-black text-sm">✓</span>
            </div>
          )}
          {imageUrl && (
            <div className={`absolute inset-0 ${spineId ? '' : 'breath-zoom'}`}>
              {spineId ? (
                /* Spine spans the full header width: clipped top/bottom by the
                   parent's overflow-hidden, but NOT side-clipped. */
                <div className="absolute inset-x-0 bottom-0 h-48 pointer-events-none" style={{ opacity: 0.8 }}>
                  <SpinePlayer
                    characterId={spineId}
                    context="detail"
                    className="w-full h-full"
                    backgroundColor="#00000000"
                    fallbackImgUrl={imageUrl}
                    fallbackImgStyle={{
                      objectFit: 'contain',
                      objectPosition: 'right bottom',
                      transform: `scale(${f.zoom / 100}) translate(${-f.x}%, ${-f.y}%)`,
                      transformOrigin: 'right bottom',
                    }}
                  />
                </div>
              ) : (
                <img src={imageUrl} alt={name} className="absolute right-0 bottom-0 h-48 object-contain opacity-80" onError={hideOnError} style={{
                  transform: `scale(${f.zoom / 100}) translate(${-f.x}%, ${-f.y}%)`,
                  transformOrigin: 'right bottom'
                }} />
              )}
            </div>
          )}
          {/* Convene video plays directly in the header itself (same spot as
              the image/Spine layer above) rather than a separate modal —
              matches BannerCard.jsx's treatment of the same ▶ button, fading
              out over its last ~1.5s instead of cutting to the static image
              (see ConveneVideoLayer.jsx). */}
          {conveneVideoPlaying && conveneVideoUrl && (
            <ConveneVideo videoUrl={conveneVideoUrl} onEnded={() => setConveneVideoPlaying(false)} visualSettings={visualSettings} />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[rgba(12,16,24,0.95)] via-transparent to-transparent" />
          <button onClick={onClose} className="absolute top-3 right-3 p-3 min-w-[48px] min-h-[48px] flex items-center justify-center rounded-lg bg-black/50 text-white hover:bg-black/70 modal-close-btn" aria-label={t('modals.characterDetail.closeAria')}>
            <X size={16} />
          </button>
          {conveneVideoUrl ? (
            <button
              onClick={(e) => { e.stopPropagation(); setConveneVideoPlaying(p => !p); }}
              className="kuro-btn w-8 h-8 !p-0 rounded-full flex items-center justify-center absolute bottom-3 right-3 z-20"
              aria-label={conveneVideoPlaying ? t('modals.characterDetail.closeConveneVideoAria') : t('modals.characterDetail.viewConveneVideoAria', { name })}
            >
              {conveneVideoPlaying ? <X size={14} /> : <Play size={12} className="fill-current ml-0.5" />}
            </button>
          ) : (
            <FullSpineViewerButton name={name} imageUrl={imageUrl} className="absolute bottom-3 right-3 z-20" />
          )}
          <div className="absolute bottom-3 left-4">
            <div className="flex items-center gap-2 mb-1">
              <span className={`kuro-badge ${colors.bg} ${colors.text} border ${colors.border} inline-flex items-center gap-1`}>
                {getElementIcon(data.element) && <img src={getElementIcon(data.element)} alt="" className="w-3.5 h-3.5" onError={hideOnError} />}
                {data.element}
              </span>
              <span className="kuro-badge kuro-badge-neutral inline-flex items-center gap-1">
                {getWeaponTypeIcon(data.weapon) && <img src={getWeaponTypeIcon(data.weapon)} alt="" className="w-3.5 h-3.5" onError={hideOnError} />}
                {data.weapon}
              </span>
              <span className="kuro-badge kuro-badge-neutral">{data.role}</span>
            </div>
            <h2 className="text-2xl font-semibold text-white">{name}</h2>
            {data.title && <div className="text-sm text-gray-400 italic -mt-0.5">{getLocalizedCharacterData(getLocale())[name]?.title || data.title}</div>}
            <div className="flex items-center gap-0.5 mt-0.5">
              {[...Array(data.rarity)].map((_, i) => <Star key={i} size={12} className="text-yellow-400 fill-yellow-400" />)}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Identity block: Birthday / Birthplace / Region (nation) / Organization (faction, with icon) /
              Voice Actor(s) — Title is shown under the name above. These are distinct associations (a
              character's birthplace, the nation they're tied to, and their specific in-game faction can
              all differ), laid out as a label:value grid instead of same-line badges so they read clearly
              rather than wrapping into an undifferentiated stack. */}
          {(data.birthday || data.birthplace || data.region || data.organization || data.voiceActor) && (
            <div className="kuro-detail-box">
              <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5 text-sm">
                {data.birthday && (
                  <>
                    <span className="text-gray-500">{t('modals.characterDetail.birthday')}</span>
                    <span className="text-gray-300">{(() => {
                      const [m, d] = data.birthday.split('-');
                      const months = t('modals.characterDetail.months');
                      return `${months[parseInt(m, 10)]} ${parseInt(d, 10)}`;
                    })()}</span>
                  </>
                )}
                {data.birthplace && (
                  <>
                    <span className="text-gray-500">{t('modals.characterDetail.birthplace')}</span>
                    <span className="text-gray-300 inline-flex items-center gap-1">
                      {getRegionIcon(data.birthplace) && <img src={getRegionIcon(data.birthplace)} alt="" className="w-3.5 h-3.5" onError={hideOnError} />}
                      {data.birthplace}
                    </span>
                  </>
                )}
                {data.region && (
                  <>
                    <span className="text-gray-500">{t('modals.characterDetail.region')}</span>
                    <span className="text-gray-300 inline-flex items-center gap-1">
                      {getRegionIcon(data.region) && <img src={getRegionIcon(data.region)} alt="" className="w-3.5 h-3.5" onError={hideOnError} />}
                      {data.region}
                    </span>
                  </>
                )}
                {data.organization && (
                  <>
                    <span className="text-gray-500">{t('modals.characterDetail.organization')}</span>
                    <span className="text-gray-300 inline-flex items-center gap-1">
                      {getFactionIcon(data.organization) && <img src={getFactionIcon(data.organization)} alt="" className="w-3.5 h-3.5" onError={hideOnError} />}
                      {data.organization}
                    </span>
                  </>
                )}
                {data.voiceActor && (
                  <>
                    <span className="text-gray-500">{typeof data.voiceActor !== 'string' ? t('modals.characterDetail.voiceActors') : t('modals.characterDetail.voiceActor')}</span>
                    <span className="text-gray-300">
                      {typeof data.voiceActor === 'string' ? data.voiceActor : (
                        Object.entries({ en: 'EN', jp: 'JP', cn: 'CN', kr: 'KR' })
                          .filter(([code]) => data.voiceActor[code])
                          .map(([code, label]) => `${label} ${data.voiceActor[code]}`)
                          .join(' · ')
                      )}
                    </span>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Tier */}
          {data.tier && (
            <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-base font-bold ${
              data.tier.toa === 'T0' ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/40' :
              data.tier.toa === 'T0.5' ? 'bg-orange-500/20 text-orange-300 border border-orange-500/40' :
              data.tier.toa === 'T1' || data.tier.toa === 'T1.5' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' :
              data.tier.toa === 'T2' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40' :
              'bg-gray-500/20 text-gray-300 border border-gray-500/40'
            }`}>
              <span className="text-sm text-gray-400">{t('modals.characterDetail.tierToa')}</span> {data.tier.toa}
              <span className="text-gray-600 mx-0.5">|</span>
              <span className="text-sm text-gray-400">{t('modals.characterDetail.tierWw')}</span> {data.tier.ww}
            </div>
          )}

          {/* Personal Description & Combat Profile — lore blurb + gameplay role/playstyle summary */}
          {data.desc && (() => {
            const localizedDesc = getLocalizedCharacterData(getLocale())[name]?.desc || data.desc;
            const dot = localizedDesc.indexOf('. ');
            const lore = dot > 0 ? localizedDesc.slice(0, dot + 1) : null;
            const gameplay = dot > 0 ? localizedDesc.slice(dot + 2) : localizedDesc;
            return (
              <div className="text-md space-y-2">
                {lore && <p className="text-gray-400 italic leading-relaxed">{lore}</p>}
                {splitIntoParagraphs(gameplay).map((para, i) => (
                  <p key={i} className="text-gray-300 leading-relaxed">{para}</p>
                ))}
              </div>
            );
          })()}

          <div className="kuro-detail-box space-y-2">
            <div className="kuro-section-label">{t('modals.characterDetail.combatProfile')}</div>
            {/* data.combatRoles (when audited) is the authoritative, iconed tag list straight from the
                character's own infobox. Once a character has been audited into it, it's the sole source
                for "what does this kit do" — the old plain-text, iconless data.role badge and dmgFocus
                badges are dropped entirely for that character (not conditionally kept whenever no exact
                tag match is found — e.g. "Sub DPS" has no 1:1 wiki tag equivalent, but showing it next to
                Combat Role would still read as a stale leftover). Those plain fallbacks only render for
                the handful of characters not yet audited into combatRoles (currently just Jingran, an
                unreleased character with no published kit to source tags from). */}
            {(() => {
              const audited = data.combatRoles?.length > 0;
              return (
                <>
                  <div className="flex flex-wrap gap-1.5">
                    <span className={`kuro-badge font-medium border ${colors.border} ${colors.text} inline-flex items-center gap-1`} style={{ background: 'rgba(255,255,255,0.05)' }}>
                      {getElementIcon(data.element) && <img src={getElementIcon(data.element)} alt="" className="w-3.5 h-3.5" onError={hideOnError} />}
                      {t('modals.characterDetail.elementDmg', { element: data.element })}
                    </span>
                    <span className="kuro-badge kuro-badge-neutral inline-flex items-center gap-1">
                      {getWeaponTypeIcon(data.weapon) && <img src={getWeaponTypeIcon(data.weapon)} alt="" className="w-3.5 h-3.5" onError={hideOnError} />}
                      {data.weapon}
                    </span>
                    {!audited && <span className="kuro-badge kuro-badge-neutral">{data.role}</span>}
                  </div>
                  {!audited && data.dmgFocus?.length > 0 && (
                    <div>
                      <div className="text-sm text-gray-400 mb-1">{t('modals.characterDetail.damageFocus')}</div>
                      <div className="flex flex-wrap gap-1">
                        {data.dmgFocus.map((df, i) => <span key={i} className="kuro-badge kuro-badge-amber">{df}</span>)}
                      </div>
                    </div>
                  )}
                  {audited && (
                    <div>
                      <div className="text-sm text-gray-400 mb-1">{t('modals.characterDetail.combatRole')}</div>
                      <div className="flex flex-wrap gap-1.5">
                        {data.combatRoles.map((tag) => {
                          const icon = getCombatRoleIcon(tag);
                          return (
                            <span key={tag} className="kuro-badge kuro-badge-neutral inline-flex items-center gap-1">
                              {icon ? <img src={icon} alt="" className="w-3.5 h-3.5" onError={hideOnError} /> : <Sparkles size={12} className="text-gray-400" />}
                              {tag}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </>
              );
            })()}
            {data.statScaling && (
              <div>
                <div className="text-sm text-gray-400 mb-1">{t('modals.characterDetail.statScaling')}</div>
                <div className="flex flex-wrap gap-1">
                  <span className="kuro-badge kuro-badge-violet inline-flex items-center gap-1">
                    {getStatIcon(data.statScaling) && <img src={getStatIcon(data.statScaling)} alt="" className="w-3.5 h-3.5" onError={hideOnError} />}
                    {t('modals.characterDetail.scalingBadge', { stat: data.statScaling })}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Quick action — view in teams */}
          {onViewInTeams && (
            <button onClick={onViewInTeams} className="kuro-btn w-full flex items-center justify-center gap-1.5">
              <Users size={12} /> {t('modals.characterDetail.viewInTeamBuilder')}
            </button>
          )}

          {/* Stats — Base Stats (Lv.90) */}
          {data.baseAtk && (
            <div className="kuro-detail-box">
              <div className="kuro-section-label mb-2">{t('modals.characterDetail.baseStats')}</div>
              <div className="grid grid-cols-4 gap-2 text-center">
                <div className="p-2 rounded-lg bg-black/20">
                  <div className="text-sm text-gray-500 flex items-center justify-center gap-1">
                    {getStatIcon('HP') && <img src={getStatIcon('HP')} alt="" className="w-3 h-3" onError={hideOnError} />}
                    {t('modals.characterDetail.statHp')}
                  </div>
                  <div className="text-xl font-bold text-white kuro-number">{formatNumber(data.baseHp || 0)}</div>
                </div>
                <div className="p-2 rounded-lg bg-black/20">
                  <div className="text-sm text-gray-500 flex items-center justify-center gap-1">
                    {getStatIcon('ATK') && <img src={getStatIcon('ATK')} alt="" className="w-3 h-3" onError={hideOnError} />}
                    {t('modals.characterDetail.statAtk')}
                  </div>
                  <div className="text-xl font-bold text-white kuro-number">{formatNumber(data.baseAtk)}</div>
                </div>
                <div className="p-2 rounded-lg bg-black/20">
                  <div className="text-sm text-gray-500 flex items-center justify-center gap-1">
                    {getStatIcon('DEF') && <img src={getStatIcon('DEF')} alt="" className="w-3 h-3" onError={hideOnError} />}
                    {t('modals.characterDetail.statDef')}
                  </div>
                  <div className="text-xl font-bold text-white kuro-number">{formatNumber(data.baseDef || 0)}</div>
                </div>
                <div className="p-2 rounded-lg bg-black/20">
                  <div className="text-sm text-gray-500 flex items-center justify-center gap-1">
                    {getStatIcon('Energy Regen') && <img src={getStatIcon('Energy Regen')} alt="" className="w-3 h-3" onError={hideOnError} />}
                    {t('modals.characterDetail.statEnergy')}
                  </div>
                  <div className="text-xl font-bold text-white kuro-number">{data.maxEnergy || '?'}</div>
                </div>
              </div>
            </div>
          )}

          {/* Skills with Multipliers */}
          <div>
            <h3 className="text-white font-semibold text-xl mb-2 flex items-center gap-2">
              <Zap size={14} className={colors.text} /> {t('modals.characterDetail.skills')}
              <span className="text-sm text-gray-500 font-normal ml-auto">{t('modals.characterDetail.skillsScaling', { stat: data.statScaling || 'ATK' })}</span>
            </h3>
            {SKILL_MULTIPLIERS[name] ? (
              <div className="space-y-0.5">
                {SKILL_MULTIPLIERS[name].map(([type, skillName, mult, desc], i) => {
                  const typeColors = {
                    'Basic ATK': 'text-gray-300', 'Mid-air': 'text-gray-300', 'Heavy ATK': 'text-orange-300',
                    'Charged ATK': 'text-orange-300', 'Skill': 'text-cyan-300', 'Liberation': 'text-yellow-300',
                    'Forte': 'text-purple-300', 'Intro': 'text-green-300', 'Outro': 'text-pink-300',
                  };
                  const typeBg = {
                    'Basic ATK': 'bg-gray-500/10', 'Mid-air': 'bg-gray-500/10', 'Heavy ATK': 'bg-orange-500/10',
                    'Charged ATK': 'bg-orange-500/10', 'Skill': 'bg-cyan-500/10', 'Liberation': 'bg-yellow-500/10',
                    'Forte': 'bg-purple-500/10', 'Intro': 'bg-green-500/10', 'Outro': 'bg-pink-500/10',
                  };
                  const skillIcon = getSkillIcon(name, skillName);
                  return (
                    <div key={i} className={`px-2 py-1.5 rounded ${typeBg[type] || 'bg-white/5'}`}>
                      <div className="flex items-baseline gap-1.5">
                        {skillIcon && <img src={skillIcon} alt="" className="w-4 h-4 rounded shrink-0 self-center" onError={hideOnError} />}
                        <span className={`text-sm font-medium shrink-0 ${typeColors[type] || 'text-gray-400'}`}>{(getLocale() === 'fr' && SKILL_TYPE_FR[type]) || type}</span>
                        <span className="text-sm text-gray-200 font-medium break-words">{(getLocale() === 'fr' && SKILL_NAME_FR[name]?.[skillName]) || skillName}</span>
                      </div>
                      <div className="text-sm text-gray-400 break-words mt-0.5">{mult}</div>
                      {desc && (
                        <div className="space-y-1 mt-1">
                          {splitIntoParagraphs(desc, 140).map((para, pi) => (
                            <div key={pi} className="text-xs text-gray-500 break-words italic leading-relaxed">{para}</div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-wrap gap-1">
                {(data.skills || []).map((skill, i) => (
                  <span key={i} className="kuro-badge kuro-badge-neutral">{skill}</span>
                ))}
              </div>
            )}
          </div>

          {/* Resonance Chain (S1-S6) */}
          {RESONANCE_CHAIN_DATA[name] && (
            <div className="kuro-detail-box">
              <div className="kuro-section-label mb-2">{t('modals.characterDetail.resonanceChain')}</div>
              <div className="space-y-1.5">
                {[1,2,3,4,5,6].map(s => {
                  const lvl = RESONANCE_CHAIN_DATA[name]['s' + s];
                  if (!lvl) return null;
                  const unlocked = ownedCopies >= s + 1; // S1 needs 2 copies, S2 needs 3, etc.
                  const stats = Object.entries(lvl).map(([k, v]) => {
                    const labels = t('modals.characterDetail.chainStatLabels');
                    return (labels[k] || k) + ' +' + v + '%';
                  }).join(', ');
                  const nodeIcon = CHAIN_NODE_ICONS[name]?.['s' + s];
                  const nodeName = localizedChainNodeNames[name]?.['s' + s];
                  const tierBorder = !unlocked ? 'border-gray-500/30' : s <= 2 ? 'border-yellow-500/25' : s <= 4 ? 'border-purple-500/25' : 'border-red-500/25';
                  const tierText = !unlocked ? 'text-gray-400' : s <= 2 ? 'text-yellow-400' : s <= 4 ? 'text-purple-400' : 'text-red-400';
                  return (
                    <div key={s} className={`flex items-start gap-2 text-sm ${!unlocked ? 'opacity-50' : ''}`}>
                      {nodeIcon && (
                        <div className={`w-7 h-7 rounded overflow-hidden flex-shrink-0 border ${tierBorder}`} style={!unlocked ? { filter: 'grayscale(100%)' } : undefined}>
                          <img src={nodeIcon} alt="" className="w-full h-full object-cover" onError={hideOnError} />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-baseline gap-1.5">
                          <span className={`text-2xs font-bold rounded px-1 py-0.5 shrink-0 ${!unlocked ? 'bg-gray-500/10 border border-gray-500/30' : s <= 2 ? 'bg-yellow-500/10 border border-yellow-500/25' : s <= 4 ? 'bg-purple-500/10 border border-purple-500/25' : 'bg-red-500/10 border border-red-500/25'} ${tierText}`}>S{s}</span>
                          {nodeName && <span className={`font-semibold ${tierText}`}>{nodeName}</span>}
                        </div>
                        <span className={unlocked ? 'text-gray-300' : 'text-gray-500'}>{stats}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Buff/Debuff — CHAR_BUFF_TABLE note plus the short buff/debuff tag lists */}
          {(localizedBuffNote || data.buffs?.length > 0 || data.debuffs?.length > 0) && (
            <div className="kuro-detail-box space-y-2">
              <div className="kuro-section-label">{t('modals.characterDetail.buffDebuff')}</div>
              {data.buffs?.length > 0 && (
                <div>
                  <div className="text-sm text-gray-400 mb-1">{t('modals.characterDetail.buffs')}</div>
                  <div className="flex flex-wrap gap-1">
                    {data.buffs.map((b, i) => <span key={i} className="kuro-badge kuro-badge-emerald">{b}</span>)}
                  </div>
                </div>
              )}
              {data.debuffs?.length > 0 && (
                <div>
                  <div className="text-sm text-gray-400 mb-1">{t('modals.characterDetail.debuffs')}</div>
                  <div className="flex flex-wrap gap-1">
                    {data.debuffs.map((db, i) => <span key={i} className="kuro-badge kuro-badge-red">{db}</span>)}
                  </div>
                </div>
              )}
              {localizedBuffNote && (
                <div className="space-y-2">
                  {splitIntoParagraphs(localizedBuffNote).map((para, i) => (
                    <p key={i} className="text-sm text-gray-300 leading-relaxed">{para}</p>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Standard Rotation — team-context rotation steps, reusable base for the Team tab */}
          {localizedRotation && (
            <div>
              <h3 className="text-white font-semibold text-xl mb-2 flex items-center gap-2">
                <RotateCw size={14} className={colors.text} /> {t('modals.characterDetail.standardRotation')}
              </h3>
              <div className="space-y-0.5">
                {localizedRotation.map((step, i) => {
                  // Same full-word, color-coded badge as the Team tab's Rotation Guide (RotationGuideCard's
                  // skillSequence chips) — spells out "Resonance Skill"/"Heavy Attack"/etc. instead of the
                  // short raw step.type, so a step reads the same whether it's seen here (solo, per-character)
                  // or team-composed in Teams.
                  const sty = stepStyle(step.type, getLocale());
                  // Look up this step's DMG from SKILL_MULTIPLIERS — single source of truth, same [type, name] tags
                  // used above, so Team tab can resolve the same step against the same table later. Uses the
                  // shared findSkillMultiplierRow() (exact match first, fuzzy substring fallback, dev-mode
                  // console.warn on any mismatch) instead of a bare inline substring lookup — see that
                  // function's own doc comment in characters.js for why.
                  const row = findSkillMultiplierRow(name, step);
                  const dmg = row?.[2];
                  const stepIcon = getSkillIcon(name, step.skill);
                  // 'Echo' steps (e.g. "Use Echo", "Swap Cancel") aren't a character skill at all —
                  // they're whatever echo the player has equipped, so they can never resolve to a
                  // per-character skill icon. Show a generic echo glyph instead of leaving the row
                  // silently iconless.
                  const isEchoStep = step.type === 'Echo';
                  return (
                    <div key={i} className="flex items-start gap-2 px-2 py-1.5 rounded bg-white/5">
                      <span className="text-sm font-medium text-gray-600 shrink-0 w-4 text-right">{i + 1}</span>
                      {stepIcon ? (
                        <img src={stepIcon} alt="" className="w-4 h-4 rounded shrink-0 mt-0.5" onError={hideOnError} />
                      ) : isEchoStep ? (
                        <LayoutGrid size={14} className="text-gray-500 shrink-0 mt-0.5" />
                      ) : null}
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-baseline gap-x-1.5">
                          <span className={`text-2xs font-bold px-1.5 py-0.5 rounded border shrink-0 ${sty.cls}`}>{sty.label}</span>
                          <span className="text-sm text-white font-semibold break-words">{step.skill}</span>
                          {dmg && <span className={`text-sm font-semibold break-words ${colors.text}`}>{dmg}</span>}
                          {step.duration != null && (
                            <span className="kuro-badge kuro-badge-neutral text-2xs shrink-0">{step.duration}s</span>
                          )}
                        </div>
                        {step.note && (
                          <div className="space-y-1 mt-0.5">
                            {splitIntoParagraphs(step.note, 140).map((para, pi) => (
                              <div key={pi} className="text-xs text-gray-500 break-words italic leading-relaxed">{para}</div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              {/* Own Kit / Hands Off — same buff blocks the Team tab's Rotation Guide shows, computed
                  by feeding this one character alone into calcTeamStats (see soloRotationTimeline
                  above). `reason` and `inheritsFromTeam` are skipped here: with no teammates in a
                  solo team, inherits is always empty and reason's copy ("comes on-field last to
                  receive every buff stacked up before it") assumes a team that isn't there. */}
              {(() => {
                const solo = soloRotationTimeline?.steps?.[0];
                if (!solo || (solo.selfActive.length === 0 && solo.handsOff.length === 0)) return null;
                return (
                  <div className="mt-2 space-y-2">
                    {solo.selfActive.length > 0 && (
                      <div>
                        <div className="text-2xs text-gray-500 uppercase tracking-wide mb-1">{t('teams.rotationGuide.ownKit')}</div>
                        <div className="flex flex-wrap gap-1">
                          {solo.selfActive.map((b, bi) => <span key={bi} className="kuro-badge kuro-badge-violet">{b}</span>)}
                        </div>
                      </div>
                    )}
                    {solo.handsOff.length > 0 && (
                      <div>
                        <div className="text-2xs text-emerald-400/70 uppercase tracking-wide mb-1">↑ {t('teams.rotationGuide.handsOffToNext')}</div>
                        <div className="flex flex-wrap gap-1">
                          {solo.handsOff.map((b, bi) => <span key={bi} className="kuro-badge kuro-badge-emerald">{b}</span>)}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          )}

          {/* BUILD GUIDE SECTION */}
          <div className="space-y-1">
            <h3 className="text-white font-semibold text-xl flex items-center gap-2">
              <Target size={14} className={colors.text} /> {t('modals.characterDetail.buildGuide')}
            </h3>
          </div>

          {/* Best Weapon - with image and stats */}
          {data.bestWeapon && (() => {
          const hasWeapon = ownsWeapon(data.bestWeapon);
          return (
          <div className={`p-3 rounded-xl border ${hasWeapon ? colors.border : 'border-gray-700/50'} ${hasWeapon ? `bg-gradient-to-r ${colors.bg} from-transparent` : 'bg-white/[0.02]'}`} style={!hasWeapon ? { opacity: 0.55 } : undefined}>
            <div className="flex items-center justify-between mb-2">
              <div className="kuro-section-label">{t('modals.characterDetail.recommendedWeapon')}</div>
              {!hasWeapon && <span className="text-2xs text-gray-600 uppercase tracking-wider">{t('modals.characterDetail.notOwned')}</span>}
            </div>
            <div className="flex items-center gap-3">
              {weaponImg && (
                <div className={`w-14 h-14 rounded-lg overflow-hidden bg-neutral-800 border border-[var(--border-medium)] flex-shrink-0${hasWeapon && weaponData?.rarity === 5 ? ' holo-5star' : ''}`} style={{ position: 'relative', filter: hasWeapon ? 'none' : 'grayscale(100%)' }}>
                  <img src={weaponImg} alt={weaponData?.displayName || data.bestWeapon} className="w-full h-full object-cover" onError={hideOnError} />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className={`text-xl font-bold ${hasWeapon ? 'text-yellow-400' : 'text-gray-500'}`}>{weaponData?.displayName || data.bestWeapon}</div>
                {weaponData && (
                  <>
                    <div className="text-gray-400 text-sm mt-0.5">{weaponData.type} • {weaponData.baseAtk ? t('modals.characterDetail.baseAtkValue', { value: weaponData.baseAtk }) : ''}{weaponData.baseAtk && weaponData.stat ? ' • ' : ''}{weaponData.stat}{weaponData.subStatValue ? ` ${weaponData.subStatValue}` : ''}</div>
                    <div className="text-gray-400 text-sm mt-1 leading-relaxed">{weaponData.passive}</div>
                  </>
                )}
              </div>
            </div>
          </div>
          );
          })()}

          {/* Alternative Weapons — signature is data.bestWeapon above; this lists rarity-tiered fallbacks
              when a character has weaponAlts (5★/4★/3★, each with at least one option). Same image +
              stat-line treatment as the Recommended Weapon box above, just compact/row-based since there
              can be several per tier. */}
          {data.weaponAlts && (
          <div className="kuro-detail-box">
            <div className="kuro-section-label mb-2">{t('modals.characterDetail.alternativeWeapons')}</div>
            <div className="space-y-3">
              {[['5★', data.weaponAlts.alt5], ['4★', data.weaponAlts.alt4], ['3★', data.weaponAlts.alt3]].filter(([, list]) => list?.length).map(([tier, list]) => (
                <div key={tier}>
                  <div className="text-sm text-gray-500 mb-1.5">{tier}</div>
                  <div className="space-y-1.5">
                    {list.map((w, i) => {
                      const wd = getLocalizedWeaponData(getLocale())[w] || WEAPON_DATA[w];
                      const wImg = DEFAULT_COLLECTION_IMAGES[w];
                      const owned = ownsWeapon(w);
                      const wLabel = wd?.displayName || w;
                      return (
                        <div key={i} className={`flex items-center gap-3 p-1.5 rounded-lg ${owned ? 'bg-white/[0.03]' : 'bg-white/[0.015]'}`} style={!owned ? { opacity: 0.55 } : undefined}>
                          {wImg ? (
                            <div className={`w-12 h-12 rounded-lg overflow-hidden bg-neutral-800 border border-[var(--border-medium)] flex-shrink-0${owned && wd?.rarity === 5 ? ' holo-5star' : ''}`} style={{ position: 'relative', filter: owned ? 'none' : 'grayscale(100%)' }}>
                              <img src={wImg} alt={wLabel} className="w-full h-full object-cover" onError={hideOnError} />
                            </div>
                          ) : (
                            <div className="w-12 h-12 rounded-lg bg-neutral-800 border border-[var(--border-medium)] flex items-center justify-center flex-shrink-0">
                              <Sparkles size={12} className="text-gray-600" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className={`text-sm font-semibold truncate ${owned ? 'text-gray-200' : 'text-gray-500'}`}>{wLabel}{!owned && ` (${t('modals.characterDetail.notOwned')})`}</div>
                            {wd && <div className="text-xs text-gray-500 truncate">{wd.type} • {wd.stat}{wd.subStatValue ? ` ${wd.subStatValue}` : ''}</div>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
          )}

          {/* Best Echoes - with pictures. bestEchoes is read in [main, set, main, set, ...] pairs — each
              pair is one recommended build and renders as its own row: a sonata (set) name heading
              followed by its full 5-echo (cost 4/3/3/1/1) loadout in a fixed grid so every icon lines up.
              The cost-4 slot is the community-sourced main echo; the cost-3/cost-1 slots are generic
              representatives (any echo carrying the same set works — no guide names one specifically),
              each paired with the standard main-stat priority for that cost tier. Any trailing "(...)"
              note (role/purpose, e.g. "(personal DMG)") on the source data is pulled out as the row's label. */}
          {data.bestEchoes?.length > 0 && (() => {
            const loadouts = getSonataLoadouts(data.bestEchoes, data.statScaling, data.element);
            const showBuildLabels = loadouts.length > 1;
            return (
          <div className="kuro-detail-box">
            <div className="kuro-section-label mb-2">{t('modals.characterDetail.recommendedEchoes')}</div>
            <div className="space-y-4">
              {loadouts.map((build, idx) => {
                const sc = SONATA_SET_COLORS[build.sonataSetName] || SONATA_ELEMENT_COLORS[build.sonataElement] || DEFAULT_SONATA_COLOR;
                return (
                <div key={idx} className="space-y-2">
                  {showBuildLabels && (
                    <div className="text-gray-500 text-xs font-semibold uppercase tracking-wide">
                      {t('modals.characterDetail.buildN', { n: idx + 1 })}{build.label ? ` — ${build.label}` : ''}
                    </div>
                  )}
                  {build.sonataName && (
                    <div className={`${sc.text} text-base font-bold`}>{build.sonataName}</div>
                  )}
                  {build.slots.length > 0 && (
                    <div className="grid grid-cols-5 gap-2">
                      {build.slots.map((slot, si) => (
                        <div key={si} className="flex flex-col items-center gap-1">
                          <div className={`w-12 h-12 rounded-lg border flex items-center justify-center overflow-hidden ${slot.generic ? 'bg-white/5 border-[var(--border-medium)]' : `${sc.bg} ${sc.border} ring-2 ${sc.ring}`}`}>
                            {slot.iconUrl ? <img src={slot.iconUrl} alt={slot.name} className="w-full h-full object-cover" onError={hideOnError} /> : <LayoutGrid size={12} className={sc.text} />}
                          </div>
                          <div className="text-[8px] text-gray-300 text-center leading-tight line-clamp-2">{slot.name}</div>
                          <div className="text-[8px] text-gray-500 text-center leading-tight">{t('modals.characterDetail.echoCost', { cost: slot.cost })}{slot.mainStat ? ` · ${slot.mainStat}` : ''}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                );
              })}
            </div>
          </div>
            );
          })()}

          {/* Team Suggestions - with avatars */}
          <div>
            <h3 className="text-white font-semibold text-xl mb-2 flex items-center gap-2">
              <Swords size={14} className="text-pink-400" /> {t('modals.characterDetail.teamComps')}
            </h3>
            <div className="space-y-2">
              {(data.teams || []).map((team, i) => {
                const members = parseTeamMembers(team);
                const hasImages = members.some(m => DEFAULT_COLLECTION_IMAGES[m] || (m.includes('Rover') && DEFAULT_COLLECTION_IMAGES['Rover']));
                return (
                  <div key={i} className="kuro-detail-box">
                    {hasImages ? (
                      <div className="flex items-center gap-2">
                        {members.map((member, j) => {
                          const memberImg = DEFAULT_COLLECTION_IMAGES[member] || (member.includes('Rover') ? DEFAULT_COLLECTION_IMAGES['Rover'] : null);
                          const mf = getImageFraming ? getImageFraming(`collection-${member}`) : { x: 0, y: 0, zoom: 100 };
                          const is5Star = CHARACTER_DATA[member]?.rarity === 5;
                          const memberOwned = ownsChar(member) || member === name; // current char always "owned"
                          return (
                            <div key={j} className={`flex flex-col items-center gap-1 flex-1 min-w-0 ${!memberOwned ? 'opacity-50' : ''}`}>
                              {memberImg ? (
                                <div className={`w-14 h-14 rounded-lg bg-neutral-800 border border-[var(--border-medium)] overflow-hidden${memberOwned && is5Star ? ' holo-5star' : ''}`} style={{ contain: 'paint', position: 'relative', filter: memberOwned ? 'none' : 'grayscale(100%)' }}>
                                  <div className="absolute inset-0 breath-zoom">
                                    <img src={memberImg} alt={member} className="absolute inset-0 w-full h-full object-cover object-top" onError={hideOnError} style={{ transform: `scale(${mf.zoom / 100}) translate(${-mf.x}%, ${-mf.y}%)` }} />
                                  </div>
                                </div>
                              ) : (
                                <div className="w-14 h-14 rounded-lg bg-neutral-800 border border-[var(--border-medium)] flex items-center justify-center">
                                  {/* AUDIT-FIX H12: gray-600 fails WCAG AA contrast on dark bg */}
                                  <User size={14} className="text-gray-500" />
                                </div>
                              )}
                              <span className="text-sm text-gray-400 text-center leading-tight truncate w-full">{member}</span>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-sm text-gray-300">{team}</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Ascension Materials (Lv 1→90) */}
          <div>
            <h3 className="text-white font-semibold text-xl mb-2 flex items-center gap-2">
              <TrendingUp size={14} className="text-emerald-400" /> {t('modals.characterDetail.ascensionMaterials')}
            </h3>
            <div className="grid grid-cols-2 gap-1.5">
              {data.ascension ? <>
                <MaterialItem name={data.ascension.boss} qty={RESONATOR_ASCENSION_COSTS.boss} />
                <MaterialItem name={data.ascension.specialty} qty={RESONATOR_ASCENSION_COSTS.specialty} />
                {COMMON_MAT_TIERS[data.ascension.common] && <>
                  {COMMON_MAT_TIERS[data.ascension.common].length >= 4 && <>
                    <MaterialItem name={COMMON_MAT_TIERS[data.ascension.common][0]} qty={RESONATOR_ASCENSION_COSTS.commonT1} />
                    <MaterialItem name={COMMON_MAT_TIERS[data.ascension.common][1]} qty={RESONATOR_ASCENSION_COSTS.commonT2} />
                  </>}
                  <MaterialItem name={COMMON_MAT_TIERS[data.ascension.common].at(-2)} qty={RESONATOR_ASCENSION_COSTS.commonT3} />
                  <MaterialItem name={COMMON_MAT_TIERS[data.ascension.common].at(-1)} qty={RESONATOR_ASCENSION_COSTS.commonT4} />
                </>}
              </> : <div className="text-gray-500 text-sm col-span-2">{t('modals.characterDetail.noAscensionData')}</div>}
            </div>
          </div>

          {/* Skill Upgrade Materials (all skills to Lv 10) */}
          {data.skillMaterials && (
            <div>
              <h3 className="text-white font-semibold text-xl mb-2 flex items-center gap-2">
                <Zap size={14} className="text-purple-400" /> {t('modals.characterDetail.skillMaterials')}
              </h3>
              <div className="grid grid-cols-2 gap-1.5">
                <MaterialItem name={data.skillMaterials.weeklyDrop} qty={SKILL_UPGRADE_COSTS.weeklyDrop} />
                {FORGERY_MAT_TIERS[data.skillMaterials.forgery] && <>
                  {FORGERY_MAT_TIERS[data.skillMaterials.forgery].length >= 4 && <>
                    <MaterialItem name={FORGERY_MAT_TIERS[data.skillMaterials.forgery][0]} qty={SKILL_UPGRADE_COSTS.forgeryT1} />
                    <MaterialItem name={FORGERY_MAT_TIERS[data.skillMaterials.forgery][1]} qty={SKILL_UPGRADE_COSTS.forgeryT2} />
                  </>}
                  <MaterialItem name={FORGERY_MAT_TIERS[data.skillMaterials.forgery].at(-2)} qty={SKILL_UPGRADE_COSTS.forgeryT3} />
                  <MaterialItem name={FORGERY_MAT_TIERS[data.skillMaterials.forgery].at(-1)} qty={SKILL_UPGRADE_COSTS.forgeryT4} />
                </>}
                {data.ascension?.common && COMMON_MAT_TIERS[data.ascension.common] && <>
                  {COMMON_MAT_TIERS[data.ascension.common].length >= 4 && <>
                    <MaterialItem name={COMMON_MAT_TIERS[data.ascension.common][0]} qty={SKILL_UPGRADE_COSTS.commonT1} />
                    <MaterialItem name={COMMON_MAT_TIERS[data.ascension.common][1]} qty={SKILL_UPGRADE_COSTS.commonT2} />
                  </>}
                  <MaterialItem name={COMMON_MAT_TIERS[data.ascension.common].at(-2)} qty={SKILL_UPGRADE_COSTS.commonT3} />
                  <MaterialItem name={COMMON_MAT_TIERS[data.ascension.common].at(-1)} qty={SKILL_UPGRADE_COSTS.commonT4} />
                </>}
              </div>
            </div>
          )}

          {/* EXP Materials */}
          <div>
            <h3 className="text-white font-semibold text-xl mb-2 flex items-center gap-2">
              <TrendingUp size={14} className="text-cyan-400" /> {t('modals.characterDetail.expMaterials')}
            </h3>
            <div className="grid grid-cols-2 gap-1.5">
              {Object.entries(RESONATOR_EXP_COSTS).filter(([, qty]) => qty > 0).map(([mat, qty]) => (
                <MaterialItem key={mat} name={mat} qty={qty} />
              ))}
            </div>
          </div>

          {/* Assets — Sprite (▶ opens the same full Spine viewer as the
              header's own button), Banner Art, and Banner Animation (the
              convene video, playable right in its own tile). 2026-08-27:
              starting with Qingxiao; every asset here is null-safe and
              simply omits a tile when that character doesn't have it yet. */}
          {(imageUrl || bannerArtUrl) && (
            <div>
              <h3 className="text-white font-semibold text-xl mb-2 flex items-center gap-2">
                <LayoutGrid size={14} className="text-gray-300" /> {t('modals.characterDetail.assetsSection')}
              </h3>
              {/* Vertical stack, not a row of forced-square crops — each tile
                  keeps the aspect ratio its actual content is shot at: the
                  Sprite is a tall full-body cutout (1:2, matching the full
                  Spine viewer's own aspect), Banner Art/Animation are the
                  wide gacha-banner crop (16:9, matching the theme picker's
                  own background tiles in ProfileTab.jsx). */}
              <div className="flex flex-col gap-2">
                {/* Was aspect-[1/2] — shortened ~35% (1:2 -> 1:1.3) to
                    crop off the bottom gap the -20% ty raise opened up,
                    matching it back against the top. */}
                {imageUrl && (
                  <FullSpineViewerButton name={name} imageUrl={imageUrl} variant="tile" label={t('modals.characterDetail.assetSprite')} className="w-full aspect-[1/1.3]" />
                )}
                {/* Banner Art and Banner Animation fused into one tile — the
                    art is what's shown either way, the video (when this
                    character has one) just plays inline over it instead of
                    getting a whole separate duplicate-art tile. */}
                {bannerArtUrl && (
                  <div className="relative rounded-lg overflow-hidden border border-[var(--border-medium)] aspect-video">
                    {assetBannerVideoPlaying ? (
                      <ConveneVideo videoUrl={conveneVideoUrl} onEnded={() => setAssetBannerVideoPlaying(false)} className="absolute inset-0" visualSettings={visualSettings} />
                    ) : (
                      <img src={bannerArtUrl} alt="" className="w-full h-full object-cover" onError={hideOnError} />
                    )}
                    {conveneVideoUrl && (
                      <button
                        onClick={(e) => { e.stopPropagation(); setAssetBannerVideoPlaying(p => !p); }}
                        className="absolute inset-0 flex items-center justify-center"
                        aria-label={assetBannerVideoPlaying ? t('modals.characterDetail.closeConveneVideoAria') : t('modals.characterDetail.viewConveneVideoAria', { name })}
                      >
                        {!assetBannerVideoPlaying && (
                          <div className="w-8 h-8 rounded-full bg-black/50 flex items-center justify-center">
                            <Play size={12} className="fill-current text-white ml-0.5" />
                          </div>
                        )}
                      </button>
                    )}
                    {!assetBannerVideoPlaying && <span className="absolute bottom-1 left-1.5 text-white text-sm font-medium drop-shadow-lg pointer-events-none">{t('modals.characterDetail.assetBanner')}</span>}

                  </div>
                )}
              </div>
            </div>
          )}
        </div>
       </div>
      </div>
    </FocusTrapModal>
  );
};

export { CharacterDetailModal };
