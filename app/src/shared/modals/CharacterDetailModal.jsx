// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — shared/modals/CharacterDetailModal.jsx
// CharacterDetailModal
// ═══════════════════════════════════════════════════════════════════════════════

import React from 'react';
import { Sparkles, Swords, Star, User, Users, TrendingUp, Target, Zap, X, LayoutGrid, RotateCw } from 'lucide-react';
import { CHARACTER_DATA, CHAR_BUFF_TABLE, SKILL_MULTIPLIERS, CHARACTER_ROTATIONS, RESONANCE_CHAIN_DATA, getSkillIcon, CHAIN_NODE_ICONS, CHAIN_NODE_NAMES } from '../../data/characters.js';
import { WEAPON_DATA } from '../../data/weapons.js';
import { ECHO_DATA } from '../../data/echoes.js';
import { DEFAULT_COLLECTION_IMAGES } from '../../data/banners.js';
import { COMMON_MAT_TIERS, FORGERY_MAT_TIERS, RESONATOR_ASCENSION_COSTS, RESONATOR_EXP_COSTS, SKILL_UPGRADE_COSTS } from '../../data/constants.js';
import { FocusTrapModal } from '../../providers/FocusTrapModal.jsx';
import { getElementIcon, getWeaponTypeIcon, getStatIcon, getFactionIcon, getRegionIcon, getSetIcon } from '../../utils/helpers.js';
import { hideOnError } from '../utils/imageHelpers.js';
import { MaterialItem } from '../components/MaterialItem.jsx';
import { SpinePlayer, getSpineId } from '../components/SpinePlayer.jsx';
import { useImageFramingContext } from '../../providers/ImageFramingProvider.jsx';

// Shared element color maps
const DETAIL_ELEMENT_COLORS = {
  Fusion: { bg: 'bg-orange-500/20', text: 'text-orange-400', border: 'border-orange-500/50' },
  Electro: { bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-500/50' },
  Aero: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/50' },
  Glacio: { bg: 'bg-cyan-500/20', text: 'text-cyan-400', border: 'border-cyan-500/50' },
  Havoc: { bg: 'bg-pink-500/20', text: 'text-pink-400', border: 'border-pink-500/50' },
  Spectro: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/50' },
};

// Hoisted team parsing helper
const parseTeamMembers = (teamStr) => teamStr.split('+').map(s => s.trim()).filter(Boolean);

const CharacterDetailModal = ({ name, onClose, imageUrl, framing, infoFraming, onViewInTeams, collectionData, visualSettings }) => {
  const { getImageFraming, framingMode, editingImage, setEditingImage } = useImageFramingContext();
  const data = CHARACTER_DATA[name];
  if (!data) return null;

  const colors = DETAIL_ELEMENT_COLORS[data.element] || DETAIL_ELEMENT_COLORS.Spectro;
  const bestWeapon = data.bestWeapon || null;
  const weaponData = bestWeapon ? WEAPON_DATA[bestWeapon] : null;
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
  const spineId = isFullAnim && !framingMode ? getSpineId(name, { surface: 'collection' }) : null;
  
  return (
    <FocusTrapModal isOpen={true} onClose={onClose} className="" onClick={onClose} ariaLabel={`${name} Resonator details`} centered>
      <div
        className={`kuro-card relative w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col border ${colors.border}`}
        onClick={e => e.stopPropagation()}
      >
       <div className="overflow-y-auto flex-1" data-sheet-scroll>
        {/* Header with image */}
        <div className={`relative h-40 overflow-hidden rounded-t-2xl ${framingMode ? 'cursor-pointer' : ''} ${framingMode && editingImage === `info-${name}` ? 'ring-2 ring-emerald-500' : ''}`} style={{ contain: 'paint' }} data-sheet-header
          onClick={framingMode ? (e) => { e.stopPropagation(); setEditingImage(`info-${name}`); } : undefined}
        >
          <div className={`absolute inset-0 bg-gradient-to-br ${colors.bg}`} />
          {framingMode && editingImage === `info-${name}` && (
            <div className="absolute top-2 left-2 z-20 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
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
          <div className="absolute inset-0 bg-gradient-to-t from-[rgba(12,16,24,0.95)] via-transparent to-transparent" />
          <button onClick={onClose} className="absolute top-3 right-3 p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg bg-black/50 text-white hover:bg-black/70 modal-close-btn" aria-label="Close Resonator details">
            <X size={16} />
          </button>
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
            {data.title && <div className="text-sm text-gray-400 italic -mt-0.5">{data.title}</div>}
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
                    <span className="text-gray-500">Birthday</span>
                    <span className="text-gray-300">{(() => {
                      const [m, d] = data.birthday.split('-');
                      const months = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                      return `${months[parseInt(m, 10)]} ${parseInt(d, 10)}`;
                    })()}</span>
                  </>
                )}
                {data.birthplace && (
                  <>
                    <span className="text-gray-500">Birthplace</span>
                    <span className="text-gray-300 inline-flex items-center gap-1">
                      {getRegionIcon(data.birthplace) && <img src={getRegionIcon(data.birthplace)} alt="" className="w-3.5 h-3.5" onError={hideOnError} />}
                      {data.birthplace}
                    </span>
                  </>
                )}
                {data.region && (
                  <>
                    <span className="text-gray-500">Region</span>
                    <span className="text-gray-300 inline-flex items-center gap-1">
                      {getRegionIcon(data.region) && <img src={getRegionIcon(data.region)} alt="" className="w-3.5 h-3.5" onError={hideOnError} />}
                      {data.region}
                    </span>
                  </>
                )}
                {data.organization && (
                  <>
                    <span className="text-gray-500">Organization</span>
                    <span className="text-gray-300 inline-flex items-center gap-1">
                      {getFactionIcon(data.organization) && <img src={getFactionIcon(data.organization)} alt="" className="w-3.5 h-3.5" onError={hideOnError} />}
                      {data.organization}
                    </span>
                  </>
                )}
                {data.voiceActor && (
                  <>
                    <span className="text-gray-500">Voice Actor{typeof data.voiceActor !== 'string' ? 's' : ''}</span>
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
            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-base font-bold ${
              data.tier.toa === 'T0' ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/40' :
              data.tier.toa === 'T0.5' ? 'bg-orange-500/20 text-orange-300 border border-orange-500/40' :
              data.tier.toa === 'T1' || data.tier.toa === 'T1.5' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' :
              data.tier.toa === 'T2' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40' :
              'bg-gray-500/20 text-gray-300 border border-gray-500/40'
            }`}>
              <span className="text-sm text-gray-400">ToA</span> {data.tier.toa}
              <span className="text-gray-600 mx-0.5">|</span>
              <span className="text-sm text-gray-400">WW</span> {data.tier.ww}
            </div>
          )}

          {/* Personal Description & Combat Profile — lore blurb + gameplay role/playstyle summary */}
          {data.desc && (() => {
            const dot = data.desc.indexOf('. ');
            const lore = dot > 0 ? data.desc.slice(0, dot + 1) : null;
            const gameplay = dot > 0 ? data.desc.slice(dot + 2) : data.desc;
            return (
              <div className="text-md space-y-1">
                {lore && <p className="text-gray-400 italic leading-relaxed">{lore}</p>}
                <p className="text-gray-300 leading-relaxed">{gameplay}</p>
              </div>
            );
          })()}

          <div className="kuro-detail-box space-y-2">
            <div className="kuro-section-label">Combat Profile</div>
            <div className="flex flex-wrap gap-1.5">
              <span className={`kuro-badge font-medium border ${colors.border} ${colors.text} inline-flex items-center gap-1`} style={{ background: 'rgba(255,255,255,0.05)' }}>
                {getElementIcon(data.element) && <img src={getElementIcon(data.element)} alt="" className="w-3.5 h-3.5" onError={hideOnError} />}
                {data.element} DMG
              </span>
              <span className="kuro-badge kuro-badge-neutral inline-flex items-center gap-1">
                {getWeaponTypeIcon(data.weapon) && <img src={getWeaponTypeIcon(data.weapon)} alt="" className="w-3.5 h-3.5" onError={hideOnError} />}
                {data.weapon}
              </span>
              <span className="kuro-badge kuro-badge-neutral">{data.role}</span>
            </div>
            {data.dmgFocus?.length > 0 && (
              <div>
                <div className="text-sm text-gray-400 mb-1">Damage Focus</div>
                <div className="flex flex-wrap gap-1">
                  {data.dmgFocus.map((df, i) => <span key={i} className="kuro-badge kuro-badge-amber">{df}</span>)}
                </div>
              </div>
            )}
            {data.statScaling && (
              <div>
                <div className="text-sm text-gray-400 mb-1">Stat Scaling</div>
                <div className="flex flex-wrap gap-1">
                  <span className="kuro-badge kuro-badge-violet inline-flex items-center gap-1">
                    {getStatIcon(data.statScaling) && <img src={getStatIcon(data.statScaling)} alt="" className="w-3.5 h-3.5" onError={hideOnError} />}
                    {data.statScaling} Scaling
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Quick action — view in teams */}
          {onViewInTeams && (
            <button onClick={onViewInTeams} className="kuro-btn w-full flex items-center justify-center gap-1.5">
              <Users size={12} /> View in Team Builder
            </button>
          )}

          {/* Stats — Base Stats (Lv.90) */}
          {data.baseAtk && (
            <div className="kuro-detail-box">
              <div className="kuro-section-label mb-2">Base Stats (Lv.90)</div>
              <div className="grid grid-cols-4 gap-2 text-center">
                <div className="p-2 rounded-lg bg-black/20">
                  <div className="text-sm text-gray-500 flex items-center justify-center gap-1">
                    {getStatIcon('HP') && <img src={getStatIcon('HP')} alt="" className="w-3 h-3" onError={hideOnError} />}
                    HP
                  </div>
                  <div className="text-xl font-bold text-white kuro-number">{(data.baseHp || 0).toLocaleString('en-US')}</div>
                </div>
                <div className="p-2 rounded-lg bg-black/20">
                  <div className="text-sm text-gray-500 flex items-center justify-center gap-1">
                    {getStatIcon('ATK') && <img src={getStatIcon('ATK')} alt="" className="w-3 h-3" onError={hideOnError} />}
                    ATK
                  </div>
                  <div className="text-xl font-bold text-white kuro-number">{data.baseAtk}</div>
                </div>
                <div className="p-2 rounded-lg bg-black/20">
                  <div className="text-sm text-gray-500 flex items-center justify-center gap-1">
                    {getStatIcon('DEF') && <img src={getStatIcon('DEF')} alt="" className="w-3 h-3" onError={hideOnError} />}
                    DEF
                  </div>
                  <div className="text-xl font-bold text-white kuro-number">{(data.baseDef || 0).toLocaleString('en-US')}</div>
                </div>
                <div className="p-2 rounded-lg bg-black/20">
                  <div className="text-sm text-gray-500 flex items-center justify-center gap-1">
                    {getStatIcon('Energy Regen') && <img src={getStatIcon('Energy Regen')} alt="" className="w-3 h-3" onError={hideOnError} />}
                    Energy
                  </div>
                  <div className="text-xl font-bold text-white kuro-number">{data.maxEnergy || '?'}</div>
                </div>
              </div>
            </div>
          )}

          {/* Skills with Multipliers */}
          <div>
            <h3 className="text-white font-semibold text-xl mb-2 flex items-center gap-2">
              <Zap size={14} className={colors.text} /> Skills
              <span className="text-sm text-gray-500 font-normal ml-auto">Lv.10 - Scaling: ({data.statScaling || 'ATK'}%)</span>
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
                        <span className={`text-sm font-medium shrink-0 ${typeColors[type] || 'text-gray-400'}`}>{type}</span>
                        <span className="text-sm text-gray-200 font-medium break-words">{skillName}</span>
                      </div>
                      <div className="text-sm text-gray-400 break-words mt-0.5">{mult}</div>
                      {desc && <div className="text-xs text-gray-500 break-words mt-1 italic">{desc}</div>}
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
              <div className="kuro-section-label mb-2">Resonance Chain</div>
              <div className="space-y-1.5">
                {[1,2,3,4,5,6].map(s => {
                  const lvl = RESONANCE_CHAIN_DATA[name]['s' + s];
                  if (!lvl) return null;
                  const unlocked = ownedCopies >= s + 1; // S1 needs 2 copies, S2 needs 3, etc.
                  const stats = Object.entries(lvl).map(([k, v]) => {
                    const labels = {
                      atkPct: 'ATK%',
                      critRate: 'Crit Rate',
                      critDmg: 'Crit DMG',
                      elemDmg: 'Elem DMG',
                      skillDmg: 'Skill DMG',
                      basicDmg: 'Basic DMG',
                      heavyDmg: 'Heavy DMG',
                      libDmg: 'Lib DMG',
                      echoDmg: 'Echo DMG',
                      deepen: 'Deepen',
                      defIgnore: 'DEF Ignore',
                      defShred: 'DEF Shred',
                      resShred: 'RES Shred',
                      totalMult: 'Total Mult',
                      allDmg: 'All DMG',
                      coordDmg: 'Coord DMG',
                    };
                    return (labels[k] || k) + ' +' + v + '%';
                  }).join(', ');
                  const nodeIcon = CHAIN_NODE_ICONS[name]?.['s' + s];
                  const nodeName = CHAIN_NODE_NAMES[name]?.['s' + s];
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
          {(CHAR_BUFF_TABLE[name]?.note || data.buffs?.length > 0 || data.debuffs?.length > 0) && (
            <div className="kuro-detail-box space-y-2">
              <div className="kuro-section-label">Buff / Debuff</div>
              {data.buffs?.length > 0 && (
                <div>
                  <div className="text-sm text-gray-400 mb-1">Buffs</div>
                  <div className="flex flex-wrap gap-1">
                    {data.buffs.map((b, i) => <span key={i} className="kuro-badge kuro-badge-emerald">{b}</span>)}
                  </div>
                </div>
              )}
              {data.debuffs?.length > 0 && (
                <div>
                  <div className="text-sm text-gray-400 mb-1">Debuffs</div>
                  <div className="flex flex-wrap gap-1">
                    {data.debuffs.map((db, i) => <span key={i} className="kuro-badge kuro-badge-red">{db}</span>)}
                  </div>
                </div>
              )}
              {CHAR_BUFF_TABLE[name]?.note && (
                <p className="text-sm text-gray-300 leading-relaxed">{CHAR_BUFF_TABLE[name].note}</p>
              )}
            </div>
          )}

          {/* Standard Rotation — team-context rotation steps, reusable base for the Team tab */}
          {CHARACTER_ROTATIONS[name] && (
            <div>
              <h3 className="text-white font-semibold text-xl mb-2 flex items-center gap-2">
                <RotateCw size={14} className={colors.text} /> Standard Rotation
              </h3>
              <div className="space-y-0.5">
                {CHARACTER_ROTATIONS[name].map((step, i) => {
                  const typeColors = {
                    'Basic ATK': 'text-gray-300', 'Mid-air': 'text-gray-300', 'Heavy ATK': 'text-orange-300',
                    'Charged ATK': 'text-orange-300', 'Skill': 'text-cyan-300', 'Liberation': 'text-yellow-300',
                    'Forte': 'text-purple-300', 'Intro': 'text-green-300', 'Outro': 'text-pink-300',
                  };
                  // Look up this step's DMG from SKILL_MULTIPLIERS — single source of truth, same [type, name] tags
                  // used above, so Team tab can resolve the same step against the same table later.
                  const row = (SKILL_MULTIPLIERS[name] || []).find(([t, n]) => t === step.type && n.includes(step.skill));
                  const dmg = row?.[2];
                  const stepIcon = getSkillIcon(name, step.skill);
                  return (
                    <div key={i} className="flex items-start gap-2 px-2 py-1.5 rounded bg-white/5">
                      <span className="text-sm font-medium text-gray-600 shrink-0 w-4 text-right">{i + 1}</span>
                      {stepIcon && <img src={stepIcon} alt="" className="w-4 h-4 rounded shrink-0 mt-0.5" onError={hideOnError} />}
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-baseline gap-x-1.5">
                          <span className={`text-sm font-medium shrink-0 ${typeColors[step.type] || 'text-gray-400'}`}>{step.type}</span>
                          <span className="text-sm text-white font-semibold break-words">{step.skill}</span>
                          {dmg && <span className={`text-sm font-semibold break-words ${colors.text}`}>{dmg}</span>}
                          {step.duration != null && (
                            <span className="kuro-badge kuro-badge-neutral text-2xs shrink-0">{step.duration}s</span>
                          )}
                        </div>
                        {step.note && <div className="text-xs text-gray-500 break-words mt-0.5 italic">{step.note}</div>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* BUILD GUIDE SECTION */}
          <div className="space-y-1">
            <h3 className="text-white font-semibold text-xl flex items-center gap-2">
              <Target size={14} className={colors.text} /> Build Guide
            </h3>
          </div>

          {/* Best Weapon - with image and stats */}
          {data.bestWeapon && (() => {
          const hasWeapon = ownsWeapon(data.bestWeapon);
          return (
          <div className={`p-3 rounded-xl border ${hasWeapon ? colors.border : 'border-gray-700/50'} ${hasWeapon ? `bg-gradient-to-r ${colors.bg} from-transparent` : 'bg-white/[0.02]'}`} style={!hasWeapon ? { opacity: 0.55 } : undefined}>
            <div className="flex items-center justify-between mb-2">
              <div className="kuro-section-label">Recommended Weapon</div>
              {!hasWeapon && <span className="text-2xs text-gray-600 uppercase tracking-wider">Not Owned</span>}
            </div>
            <div className="flex items-center gap-3">
              {weaponImg && (
                <div className={`w-14 h-14 rounded-lg overflow-hidden bg-neutral-800 border border-[var(--border-medium)] flex-shrink-0${hasWeapon && weaponData?.rarity === 5 ? ' holo-5star' : ''}`} style={{ position: 'relative', filter: hasWeapon ? 'none' : 'grayscale(100%)' }}>
                  <img src={weaponImg} alt={data.bestWeapon} className="w-full h-full object-cover" onError={hideOnError} />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className={`text-xl font-bold ${hasWeapon ? 'text-yellow-400' : 'text-gray-500'}`}>{data.bestWeapon}</div>
                {weaponData && (
                  <>
                    <div className="text-gray-400 text-sm mt-0.5">{weaponData.type} • {weaponData.baseAtk ? `${weaponData.baseAtk} Base ATK` : ''}{weaponData.baseAtk && weaponData.stat ? ' • ' : ''}{weaponData.stat}{weaponData.subStatValue ? ` ${weaponData.subStatValue}` : ''}</div>
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
            <div className="kuro-section-label mb-2">Alternative Weapons</div>
            <div className="space-y-3">
              {[['5★', data.weaponAlts.alt5], ['4★', data.weaponAlts.alt4], ['3★', data.weaponAlts.alt3]].filter(([, list]) => list?.length).map(([tier, list]) => (
                <div key={tier}>
                  <div className="text-sm text-gray-500 mb-1.5">{tier}</div>
                  <div className="space-y-1.5">
                    {list.map((w, i) => {
                      const wd = WEAPON_DATA[w];
                      const wImg = DEFAULT_COLLECTION_IMAGES[w];
                      const owned = ownsWeapon(w);
                      return (
                        <div key={i} className={`flex items-center gap-2.5 p-1.5 rounded-lg ${owned ? 'bg-white/[0.03]' : 'bg-white/[0.015]'}`} style={!owned ? { opacity: 0.55 } : undefined}>
                          {wImg ? (
                            <div className={`w-10 h-10 rounded-lg overflow-hidden bg-neutral-800 border border-[var(--border-medium)] flex-shrink-0${owned && wd?.rarity === 5 ? ' holo-5star' : ''}`} style={{ position: 'relative', filter: owned ? 'none' : 'grayscale(100%)' }}>
                              <img src={wImg} alt={w} className="w-full h-full object-cover" onError={hideOnError} />
                            </div>
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-neutral-800 border border-[var(--border-medium)] flex items-center justify-center flex-shrink-0">
                              <Sparkles size={12} className="text-gray-600" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className={`text-sm font-semibold truncate ${owned ? 'text-gray-200' : 'text-gray-500'}`}>{w}{!owned && ' (Not Owned)'}</div>
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

          {/* Best Echoes - with picture (main echo icon, or set icon for the "X Ypc" set slot) */}
          {data.bestEchoes?.length > 0 && (() => {
            const mainEchoImg = ECHO_DATA[data.bestEchoes[0]]?.iconUrl;
            const setSlotName = data.bestEchoes[1] ? data.bestEchoes[1].replace(/\s+\d+pc$/i, '').trim() : null;
            const setImg = setSlotName ? getSetIcon(setSlotName) : null;
            return (
          <div className="kuro-detail-box">
            <div className="kuro-section-label mb-2">Recommended Echoes</div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {mainEchoImg ? <img src={mainEchoImg} alt="" className="w-full h-full object-cover" onError={hideOnError} /> : <Star size={14} className="text-cyan-400 fill-cyan-400" />}
                </div>
                <div>
                  <div className="text-cyan-400 text-base font-bold">{data.bestEchoes[0]}</div>
                  <div className="text-gray-400 text-sm">Main Echo</div>
                </div>
              </div>
              {data.bestEchoes[1] && (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {setImg ? <img src={setImg} alt="" className="w-full h-full object-cover" onError={hideOnError} /> : <LayoutGrid size={14} className="text-purple-400" />}
                </div>
                <div>
                  <div className="text-purple-400 text-base font-bold">{data.bestEchoes[1]}</div>
                  <div className="text-gray-400 text-sm">Echo Set</div>
                </div>
              </div>
              )}
            </div>
          </div>
            );
          })()}

          {/* Team Suggestions - with avatars */}
          <div>
            <h3 className="text-white font-semibold text-xl mb-2 flex items-center gap-2">
              <Swords size={14} className="text-pink-400" /> Team Comps
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
              <TrendingUp size={14} className="text-emerald-400" /> Ascension Materials
            </h3>
            <div className="grid grid-cols-2 gap-1.5">
              {data.ascension ? <>
                <MaterialItem name={data.ascension.boss} qty={RESONATOR_ASCENSION_COSTS.boss} />
                <MaterialItem name={data.ascension.specialty} qty={RESONATOR_ASCENSION_COSTS.specialty} />
                {COMMON_MAT_TIERS[data.ascension.common] && <>
                  <MaterialItem name={COMMON_MAT_TIERS[data.ascension.common][0]} qty={RESONATOR_ASCENSION_COSTS.commonT3} />
                  <MaterialItem name={COMMON_MAT_TIERS[data.ascension.common][1]} qty={RESONATOR_ASCENSION_COSTS.commonT4} />
                </>}
              </> : <div className="text-gray-500 text-sm col-span-2">No ascension data</div>}
            </div>
          </div>

          {/* Skill Upgrade Materials (all skills to Lv 10) */}
          {data.skillMaterials && (
            <div>
              <h3 className="text-white font-semibold text-xl mb-2 flex items-center gap-2">
                <Zap size={14} className="text-purple-400" /> Skill Materials
              </h3>
              <div className="grid grid-cols-2 gap-1.5">
                <MaterialItem name={data.skillMaterials.weeklyDrop} qty={SKILL_UPGRADE_COSTS.weeklyDrop} />
                {FORGERY_MAT_TIERS[data.skillMaterials.forgery] && <>
                  <MaterialItem name={FORGERY_MAT_TIERS[data.skillMaterials.forgery][0]} qty={SKILL_UPGRADE_COSTS.forgeryT3} />
                  <MaterialItem name={FORGERY_MAT_TIERS[data.skillMaterials.forgery][1]} qty={SKILL_UPGRADE_COSTS.forgeryT4} />
                </>}
                {data.ascension?.common && COMMON_MAT_TIERS[data.ascension.common] && <>
                  <MaterialItem name={COMMON_MAT_TIERS[data.ascension.common][0]} qty={SKILL_UPGRADE_COSTS.commonT3} />
                  <MaterialItem name={COMMON_MAT_TIERS[data.ascension.common][1]} qty={SKILL_UPGRADE_COSTS.commonT4} />
                </>}
              </div>
            </div>
          )}

          {/* EXP Materials */}
          <div>
            <h3 className="text-white font-semibold text-xl mb-2 flex items-center gap-2">
              <TrendingUp size={14} className="text-cyan-400" /> EXP Materials
            </h3>
            <div className="grid grid-cols-2 gap-1.5">
              {Object.entries(RESONATOR_EXP_COSTS).filter(([, qty]) => qty > 0).map(([mat, qty]) => (
                <MaterialItem key={mat} name={mat} qty={qty} />
              ))}
            </div>
          </div>
        </div>
       </div>
      </div>
    </FocusTrapModal>
  );
};

export { CharacterDetailModal };
