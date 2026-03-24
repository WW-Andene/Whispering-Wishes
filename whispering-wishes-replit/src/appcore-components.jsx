// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — appcore-components.jsx
// All React UI components: cards, modals, banners, backgrounds, collection grid.
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useState, useMemo, useCallback, useEffect, useRef, memo } from 'react';
import { Sparkles, Swords, Sword, Star, User, TrendingUp, Check, Target, Zap, X, LayoutGrid, CheckCircle, AlertCircle, Gamepad2, Crown, Trophy, Flame, Diamond, Gift, Heart, Shield, TrendingDown, Fish, Clover, ChevronDown } from 'lucide-react';
import {
  HARD_PITY, SOFT_PITY_START, CHARACTER_DATA, WEAPON_DATA,
  DEFAULT_COLLECTION_IMAGES, CURRENT_BANNERS, haptic,
  RESONANCE_CHAIN_DATA, CHAR_BUFF_TABLE,
  MATERIAL_IMAGES, COMMON_MAT_TIERS, FORGERY_MAT_TIERS,
  RESONATOR_ASCENSION_COSTS, RESONATOR_EXP_COSTS, SKILL_UPGRADE_COSTS,
  WEAPON_ASCENSION_COSTS_5, WEAPON_ASCENSION_COSTS_4, WEAPON_EXP_COSTS_5, WEAPON_EXP_COSTS_4,
  ECHO_DATA, ECHO_SETS,
  ELEMENT_COLORS, getElementColor, getSetElementColor, getEchoSetColors, getBuffElementColor,
} from './appcore-data.js';
import {
  getTimeRemaining, getServerAdjustedEnd, getRecurringEventEnd,
  getNextDailyReset, getNextWeeklyReset, storageAvailable, sanitizeStateObj,
} from './appcore-engine.js';
import { useFocusTrap, useEscapeKey, FocusTrapModal } from './appcore-providers.jsx';

// P11-FIX: Shared image error handler — replaces 11+ inline copies (Finding 12.6 / 11.1)
// AUDIT-FIX L12: Use visibility:hidden instead of display:none to prevent layout shift (CLS)
const hideOnError = (e) => {
  e.target.style.visibility = 'hidden';
  e.target.setAttribute('aria-hidden', 'true');
  e.target.alt = '';
};

// Material item display helper — shows [icon] name ×qty
const MaterialItem = ({ name, qty }) => {
  const img = MATERIAL_IMAGES[name];
  return (
    <div className="flex items-center gap-1.5 p-1.5 rounded-lg bg-white/5 border border-[var(--border-medium)] min-w-0">
      {img ? <img src={img} alt={name} className="w-7 h-7 rounded object-contain flex-shrink-0" onError={hideOnError} /> : <div className="w-7 h-7 rounded bg-white/10 flex-shrink-0" />}
      <div className="min-w-0 flex-1">
        <div className="text-[10px] text-gray-300 truncate leading-tight">{name}</div>
        {qty != null && qty > 0 && <div className="text-[10px] text-yellow-400 font-bold leading-tight">&times;{qty}</div>}
      </div>
    </div>
  );
};

// UNIFIED MASK GENERATORS & SHARED COLOR MAPS (deduplicated from v2.6)
// ═══════════════════════════════════════════════════════════════════════════════

// Unified mask gradient generator (horizontal)
// Trophy icon mapping — hoisted to module scope to avoid recreation on every render
const TROPHY_ICON_MAP = { Crown, Sparkles, Heart, Swords, Sword, Shield, Gift, Zap, Clover, Flame, Target, AlertCircle, TrendingDown, TrendingUp, Fish, Diamond, Gamepad2, Star, Trophy };

// Simple memo cache for mask gradients — avoids recreating identical strings
const _maskCache = new Map();
const generateMaskGradient = (fadePos, fadeIntensity) => {
  const key = `h-${fadePos}-${fadeIntensity}`;
  if (_maskCache.has(key)) return _maskCache.get(key);

  let result;
  if (fadePos === undefined || fadeIntensity === undefined) {
    result = 'linear-gradient(to right, rgba(0,0,0,0) 0%, rgba(0,0,0,0) 10%, rgba(0,0,0,0.15) 20%, rgba(0,0,0,0.35) 30%, rgba(0,0,0,0.6) 40%, rgba(0,0,0,0.9) 50%, rgba(0,0,0,0.9) 100%)';
  } else {
    const maxOpacity = fadeIntensity / 100;
    const endPos = fadePos;
    if (endPos <= 10) {
      result = `linear-gradient(to right, rgba(0,0,0,0) 0%, rgba(0,0,0,${maxOpacity}) ${endPos}%, rgba(0,0,0,${maxOpacity}) 100%)`;
    } else {
      const steps = [`rgba(0,0,0,0) 0%`];
      const fadeStart = Math.max(0, endPos - 40);
      if (fadeStart > 0) steps.push(`rgba(0,0,0,0) ${fadeStart}%`);
      for (let i = 1; i <= 5; i++) {
        const pos = fadeStart + (endPos - fadeStart) * (i / 5);
        const opacity = maxOpacity * (i / 5);
        steps.push(`rgba(0,0,0,${opacity.toFixed(2)}) ${pos.toFixed(0)}%`);
      }
      steps.push(`rgba(0,0,0,${maxOpacity}) 100%`);
      result = `linear-gradient(to right, ${steps.join(', ')})`;
    }
  }

  if (_maskCache.size > 200) _maskCache.clear();
  _maskCache.set(key, result);
  return result;
};

// Unified vertical mask gradient generator (for collection)
const _vertMaskCache = new Map();
const generateVerticalMaskGradient = (fadePos, fadeIntensity, direction = 'bottom') => {
  const key = `v-${fadePos}-${fadeIntensity}-${direction}`;
  if (_vertMaskCache.has(key)) return _vertMaskCache.get(key);

  const maxOpacity = fadeIntensity / 100;
  const endPos = fadePos;
  const dir = direction === 'top' ? 'to top' : 'to bottom';
  let result;
  if (endPos <= 10) {
    result = `linear-gradient(${dir}, rgba(0,0,0,0) 0%, rgba(0,0,0,${maxOpacity}) ${endPos}%, rgba(0,0,0,${maxOpacity}) 100%)`;
  } else {
    const steps = [`rgba(0,0,0,0) 0%`];
    const fadeStart = Math.max(0, endPos - 40);
    if (fadeStart > 0) steps.push(`rgba(0,0,0,0) ${fadeStart}%`);
    for (let i = 1; i <= 5; i++) {
      const pos = fadeStart + (endPos - fadeStart) * (i / 5);
      const opacity = maxOpacity * (i / 5);
      steps.push(`rgba(0,0,0,${opacity.toFixed(2)}) ${pos.toFixed(0)}%`);
    }
    steps.push(`rgba(0,0,0,${maxOpacity}) 100%`);
    result = `linear-gradient(${dir}, ${steps.join(', ')})`;
  }

  if (_vertMaskCache.size > 200) _vertMaskCache.clear();
  _vertMaskCache.set(key, result);
  return result;
};

// Shared element color maps (extracted to avoid recreation per render)
const DETAIL_ELEMENT_COLORS = {
  Fusion: { bg: 'bg-orange-500/20', text: 'text-orange-400', border: 'border-orange-500/50' },
  Electro: { bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-500/50' },
  Aero: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/50' },
  Glacio: { bg: 'bg-cyan-500/20', text: 'text-cyan-400', border: 'border-cyan-500/50' },
  Havoc: { bg: 'bg-pink-500/20', text: 'text-pink-400', border: 'border-pink-500/50' },
  Spectro: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/50' },
};

const BANNER_GRADIENT_MAP = {
  Fusion: { borderColor: 'rgba(249,115,22,0.4)', bgColor: 'rgba(249,115,22,0.2)', text: 'text-orange-400', glow: '249,115,22' },
  Electro: { borderColor: 'rgba(168,85,247,0.4)', bgColor: 'rgba(168,85,247,0.2)', text: 'text-purple-400', glow: '168,85,247' },
  Aero: { borderColor: 'rgba(16,185,129,0.4)', bgColor: 'rgba(16,185,129,0.2)', text: 'text-emerald-400', glow: '16,185,129' },
  Glacio: { borderColor: 'rgba(6,182,212,0.4)', bgColor: 'rgba(6,182,212,0.2)', text: 'text-cyan-400', glow: '6,182,212' },
  Havoc: { borderColor: 'rgba(236,72,153,0.55)', bgColor: 'rgba(236,72,153,0.25)', text: 'text-pink-400', glow: '236,72,153' },
  Spectro: { borderColor: 'rgba(234,179,8,0.4)', bgColor: 'rgba(234,179,8,0.2)', text: 'text-yellow-400', glow: '234,179,8' },
};

const EVENT_ACCENT_COLORS = {
  cyan: { text: 'text-cyan-400', border: 'border-cyan-500/30', bg: 'bg-cyan-500/20' },
  pink: { text: 'text-pink-400', border: 'border-pink-500/30', bg: 'bg-pink-500/20' },
  orange: { text: 'text-orange-400', border: 'border-orange-500/30', bg: 'bg-orange-500/20' },
  purple: { text: 'text-purple-400', border: 'border-purple-500/30', bg: 'bg-purple-500/20' },
  yellow: { text: 'text-yellow-400', border: 'border-yellow-500/30', bg: 'bg-yellow-500/20' },
  emerald: { text: 'text-emerald-400', border: 'border-emerald-500/30', bg: 'bg-emerald-500/20' },
  red: { text: 'text-red-400', border: 'border-red-500/30', bg: 'bg-red-500/20' },
};

// Tab background component - eliminates ~400 lines of duplication across 6 tabs
const TabBackground = ({ id, glowColor = 'neutral' }) => {
  return (
    <>
      {/* Dark deep blue base */}
      <div style={{ position:'fixed', inset:0, zIndex:0, pointerEvents:'none', background:'linear-gradient(180deg, #010204 0%, #020408 30%, #030610 60%, #020408 100%)' }} />
      {/* Subtle edge vignette */}
      <div style={{ position:'fixed', inset:0, zIndex:4, pointerEvents:'none', background:'radial-gradient(ellipse 90% 80% at 50% 50%, transparent 40%, rgba(2,3,6,0.5) 100%)' }} />
    </>
  );
};

// [SECTION:COMPONENTS]
const Card = memo(({ children, className = '', style = {} }) => <div className={`kuro-card ${className}`} style={style}><div className="kuro-card-inner">{children}</div></div>);
Card.displayName = 'Card';
/* E4-HH1: `as` prop enables semantic heading tags (h2/h3) for accessibility */
const CardHeader = memo(({ children, action, as: Tag = 'h3' }) => <div className="kuro-header"><Tag>{children}</Tag>{action && <div className="kuro-header-action">{action}</div>}</div>);
CardHeader.displayName = 'CardHeader';
const CardBody = memo(({ children, className = '', style }) => <div className={`kuro-body ${className}`} style={style}>{children}</div>);
CardBody.displayName = 'CardBody';

// Hoisted team parsing helper — avoids recreation per render
const parseTeamMembers = (teamStr) => teamStr.split('+').map(s => s.trim()).filter(Boolean);

// Character Detail Modal
const CharacterDetailModal = ({ name, onClose, imageUrl, framing, infoFraming, getImageFraming, framingMode, editingImage, setEditingImage }) => {
  const data = CHARACTER_DATA[name];
  if (!data) return null;

  const colors = DETAIL_ELEMENT_COLORS[data.element] || DETAIL_ELEMENT_COLORS.Spectro;
  const bestWeapon = data.bestWeapon || null;
  const weaponData = bestWeapon ? WEAPON_DATA[bestWeapon] : null;
  const weaponImg = bestWeapon ? DEFAULT_COLLECTION_IMAGES[bestWeapon] : null;
  
  // Info framing: use info-specific framing, falling back to collection framing offset
  const f = infoFraming || (framing ? { x: framing.x, y: framing.y, zoom: framing.zoom } : { x: 0, y: 0, zoom: 100 });
  
  return (
    <FocusTrapModal isOpen={true} onClose={onClose} className="" onClick={onClose} ariaLabel={`${name} character details`} centered>
      <div
        className={`kuro-card relative w-full max-w-md max-h-[90vh] overflow-hidden border ${colors.border}`}
        onClick={e => e.stopPropagation()}
      >
       <div className="overflow-y-auto max-h-[90vh]">
        {/* Header with image */}
        <div className={`relative h-40 overflow-hidden rounded-t-2xl ${framingMode ? 'cursor-pointer' : ''} ${framingMode && editingImage === `info-${name}` ? 'ring-2 ring-emerald-500' : ''}`} style={{ contain: 'paint' }} data-sheet-header
          onClick={framingMode ? (e) => { e.stopPropagation(); setEditingImage(`info-${name}`); } : undefined}
        >
          <div className={`absolute inset-0 bg-gradient-to-br ${colors.bg}`} />
          {framingMode && editingImage === `info-${name}` && (
            <div className="absolute top-2 left-2 z-20 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
              <span className="text-black text-[10px]">✓</span>
            </div>
          )}
          {imageUrl && (
            <div className="absolute inset-0 breath-zoom">
              <img src={imageUrl} alt={name} className="absolute right-0 bottom-0 h-48 object-contain opacity-80" onError={hideOnError} style={{
                transform: `scale(${f.zoom / 100}) translate(${-f.x}%, ${-f.y}%)`,
                transformOrigin: 'right bottom'
              }} />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[rgba(12,16,24,0.95)] via-transparent to-transparent" />
          <button onClick={onClose} className="absolute top-3 right-3 p-2.5 min-w-[36px] min-h-[36px] flex items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 transition-all" aria-label="Close character details">
            <X size={16} />
          </button>
          <div className="absolute bottom-3 left-4">
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-[10px] px-2 py-0.5 rounded ${colors.bg} ${colors.text} border ${colors.border}`}>{data.element}</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-white/10 text-gray-300 border border-[var(--border-medium)]">{data.weapon}</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-white/10 text-gray-300 border border-[var(--border-medium)]">{data.role}</span>
            </div>
            <h2 className="text-xl font-semibold text-white">{name}</h2>
            <div className="flex items-center gap-0.5 mt-0.5">
              {[...Array(data.rarity)].map((_, i) => <Star key={i} size={12} className="text-yellow-400 fill-yellow-400" />)}
            </div>
          </div>
        </div>
        
        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Description */}
          {data.desc && (() => {
            const dot = data.desc.indexOf('. ');
            const lore = dot > 0 ? data.desc.slice(0, dot + 1) : null;
            const gameplay = dot > 0 ? data.desc.slice(dot + 2) : data.desc;
            return (
              <div className="text-sm space-y-1">
                {lore && <p className="text-gray-400 italic leading-relaxed">{lore}</p>}
                <p className="text-gray-300 leading-relaxed">{gameplay}</p>
              </div>
            );
          })()}

          {/* Combat Stats — Damage Type, Buffs, Debuffs, Tags */}
          <div className="p-3 rounded-xl bg-white/5 border border-[var(--border-medium)] space-y-2">
            <div className="text-[10px] text-gray-400 uppercase tracking-wider">Combat Profile</div>
            <div className="flex flex-wrap gap-1.5">
              <span className={`text-[10px] px-2 py-0.5 rounded font-medium border ${colors.border} ${colors.text}`} style={{ background: 'rgba(255,255,255,0.05)' }}>{data.element} DMG</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-white/5 text-gray-300 border border-[var(--border-medium)]">{data.weapon}</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-white/5 text-gray-300 border border-[var(--border-medium)]">{data.role}</span>
            </div>
            {data.buffs?.length > 0 && (
              <div>
                <div className="text-[10px] text-gray-400 mb-1">Buffs</div>
                <div className="flex flex-wrap gap-1">
                  {data.buffs.map((b, i) => <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/25 text-emerald-400">{b}</span>)}
                </div>
              </div>
            )}
            {data.debuffs?.length > 0 && (
              <div>
                <div className="text-[10px] text-gray-400 mb-1">Debuffs</div>
                <div className="flex flex-wrap gap-1">
                  {data.debuffs.map((db, i) => <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/10 border border-red-500/25 text-red-400">{db}</span>)}
                </div>
              </div>
            )}
            {data.dmgFocus?.length > 0 && (
              <div>
                <div className="text-[10px] text-gray-400 mb-1">Damage Focus</div>
                <div className="flex flex-wrap gap-1">
                  {data.dmgFocus.map((df, i) => <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/25 text-amber-400">{df}</span>)}
                </div>
              </div>
            )}
            {data.statScaling && (
              <div>
                <div className="text-[10px] text-gray-400 mb-1">Stat Scaling</div>
                <div className="flex flex-wrap gap-1">
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-violet-500/10 border border-violet-500/25 text-violet-400">{data.statScaling} Scaling</span>
                </div>
              </div>
            )}
          </div>

          {/* Base Stats (Lv.90) */}
          {data.baseAtk && (
            <div className="p-3 rounded-xl bg-white/5 border border-[var(--border-medium)]">
              <div className="text-[10px] text-gray-400 uppercase tracking-wider mb-2">Base Stats (Lv.90)</div>
              <div className="grid grid-cols-4 gap-2 text-center">
                <div className="p-2 rounded-lg bg-black/20">
                  <div className="text-[10px] text-gray-500">HP</div>
                  <div className="text-sm font-bold text-white">{(data.baseHp || 0).toLocaleString()}</div>
                </div>
                <div className="p-2 rounded-lg bg-black/20">
                  <div className="text-[10px] text-gray-500">ATK</div>
                  <div className="text-sm font-bold text-white">{data.baseAtk}</div>
                </div>
                <div className="p-2 rounded-lg bg-black/20">
                  <div className="text-[10px] text-gray-500">DEF</div>
                  <div className="text-sm font-bold text-white">{(data.baseDef || 0).toLocaleString()}</div>
                </div>
                <div className="p-2 rounded-lg bg-black/20">
                  <div className="text-[10px] text-gray-500">Energy</div>
                  <div className="text-sm font-bold text-white">{data.maxEnergy || '?'}</div>
                </div>
              </div>
            </div>
          )}

          {/* Resonance Chain (S1-S6) */}
          {RESONANCE_CHAIN_DATA[name] && (
            <div className="p-3 rounded-xl bg-white/5 border border-[var(--border-medium)]">
              <div className="text-[10px] text-gray-400 uppercase tracking-wider mb-2">Resonance Chain</div>
              <div className="space-y-1.5">
                {[1,2,3,4,5,6].map(s => {
                  const lvl = RESONANCE_CHAIN_DATA[name]['s' + s];
                  if (!lvl) return null;
                  const stats = Object.entries(lvl).map(([k, v]) => {
                    const labels = { atkPct: 'ATK%', critRate: 'Crit Rate', critDmg: 'Crit DMG', elemDmg: 'Elem DMG', skillDmg: 'Skill DMG', basicDmg: 'Basic DMG', heavyDmg: 'Heavy DMG', libDmg: 'Lib DMG', echoDmg: 'Echo DMG', deepen: 'Deepen', defIgnore: 'DEF Ignore', defShred: 'DEF Shred', resShred: 'RES Shred', totalMult: 'Total Mult', allDmg: 'All DMG', coordDmg: 'Coord DMG' };
                    return (labels[k] || k) + ' +' + v + '%';
                  }).join(', ');
                  return (
                    <div key={s} className="flex items-center gap-2 text-[10px]">
                      <span className={`w-7 text-center font-bold rounded py-0.5 ${s <= 2 ? 'text-yellow-400 bg-yellow-500/10 border border-yellow-500/25' : s <= 4 ? 'text-purple-400 bg-purple-500/10 border border-purple-500/25' : 'text-red-400 bg-red-500/10 border border-red-500/25'}`}>S{s}</span>
                      <span className="text-gray-300 flex-1">{stats}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Buff/Debuff Details from CHAR_BUFF_TABLE */}
          {CHAR_BUFF_TABLE[name]?.note && (
            <div className="p-3 rounded-xl bg-white/5 border border-[var(--border-medium)]">
              <div className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Buff/Debuff Details</div>
              <p className="text-[10px] text-gray-300 leading-relaxed">{CHAR_BUFF_TABLE[name].note}</p>
            </div>
          )}

          {/* BUILD GUIDE SECTION */}
          <div className="space-y-1">
            <h3 className="text-white font-semibold text-sm flex items-center gap-2">
              <Target size={14} className={colors.text} /> Build Guide
            </h3>
          </div>

          {/* Best Weapon - with image and stats */}
          {data.bestWeapon && (
          <div className={`p-3 rounded-xl border ${colors.border} bg-gradient-to-r ${colors.bg} from-transparent`}>
            <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-2">Recommended Weapon</div>
            <div className="flex items-center gap-3">
              {weaponImg && (
                <div className={`w-14 h-14 rounded-lg overflow-hidden bg-neutral-800 border border-[var(--border-medium)] flex-shrink-0${weaponData?.rarity === 5 ? ' holo-5star' : ''}`} style={{ position: 'relative' }}>
                  <img src={weaponImg} alt={data.bestWeapon} className="w-full h-full object-cover" onError={hideOnError} />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="text-yellow-400 text-sm font-bold">{data.bestWeapon}</div>
                {weaponData && (
                  <>
                    <div className="text-gray-400 text-[10px] mt-0.5">{weaponData.type} • {weaponData.baseAtk ? `${weaponData.baseAtk} Base ATK` : ''}{weaponData.baseAtk && weaponData.stat ? ' • ' : ''}{weaponData.stat}{weaponData.subStatValue ? ` ${weaponData.subStatValue}` : ''}</div>
                    <div className="text-gray-400 text-[10px] mt-1 leading-relaxed">{weaponData.passive}</div>
                  </>
                )}
              </div>
            </div>
          </div>
          )}

          {/* Best Echoes - enhanced */}
          <div className="p-3 rounded-xl bg-white/5 border border-[var(--border-medium)]">
            <div className="text-[10px] text-gray-400 uppercase tracking-wider mb-2">Recommended Echoes</div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center flex-shrink-0">
                  <Star size={14} className="text-cyan-400 fill-cyan-400" />
                </div>
                <div>
                  <div className="text-cyan-400 text-xs font-bold">{data.bestEchoes[0]}</div>
                  <div className="text-gray-400 text-[10px]">Main Echo</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center flex-shrink-0">
                  <LayoutGrid size={14} className="text-purple-400" />
                </div>
                <div>
                  <div className="text-purple-400 text-xs font-bold">{data.bestEchoes[1]}</div>
                  <div className="text-gray-400 text-[10px]">Echo Set</div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Team Suggestions - with avatars */}
          <div>
            <h3 className="text-white font-semibold text-sm mb-2 flex items-center gap-2">
              <Swords size={14} className="text-pink-400" /> Team Comps
            </h3>
            <div className="space-y-2">
              {data.teams.map((team, i) => {
                const members = parseTeamMembers(team);
                const hasImages = members.some(m => DEFAULT_COLLECTION_IMAGES[m] || (m.includes('Rover') && DEFAULT_COLLECTION_IMAGES['Rover']));
                return (
                  <div key={i} className="p-3 rounded-xl bg-white/5 border border-[var(--border-medium)]">
                    {hasImages ? (
                      <div className="flex items-center gap-2">
                        {members.map((member, j) => {
                          const memberImg = DEFAULT_COLLECTION_IMAGES[member] || (member.includes('Rover') ? DEFAULT_COLLECTION_IMAGES['Rover'] : null);
                          const mf = getImageFraming ? getImageFraming(`collection-${member}`) : { x: 0, y: 0, zoom: 100 };
                          const is5Star = CHARACTER_DATA[member]?.rarity === 5;
                          return (
                            <div key={j} className="flex flex-col items-center gap-1 flex-1 min-w-0">
                              {memberImg ? (
                                <div className={`w-14 h-14 rounded-lg bg-neutral-800 border border-[var(--border-medium)] overflow-hidden${is5Star ? ' holo-5star' : ''}`} style={{ contain: 'paint', position: 'relative' }}>
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
                              <span className="text-[10px] text-gray-400 text-center leading-tight truncate w-full">{member}</span>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-[10px] text-gray-300">{team}</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Skills */}
          <div>
            <h3 className="text-white font-semibold text-sm mb-2 flex items-center gap-2">
              <Zap size={14} className={colors.text} /> Skills
            </h3>
            <div className="flex flex-wrap gap-1">
              {data.skills.map((skill, i) => (
                <span key={i} className="text-[10px] px-2 py-1 rounded bg-white/5 text-gray-300 border border-[var(--border-medium)]">{skill}</span>
              ))}
            </div>
          </div>
          
          {/* Ascension Materials (Lv 1→90) */}
          <div>
            <h3 className="text-white font-semibold text-sm mb-2 flex items-center gap-2">
              <TrendingUp size={14} className="text-emerald-400" /> Ascension Materials
            </h3>
            <div className="grid grid-cols-2 gap-1.5">
              <MaterialItem name={data.ascension.boss} qty={RESONATOR_ASCENSION_COSTS.boss} />
              <MaterialItem name={data.ascension.specialty} qty={RESONATOR_ASCENSION_COSTS.specialty} />
              {COMMON_MAT_TIERS[data.ascension.common] && <>
                <MaterialItem name={COMMON_MAT_TIERS[data.ascension.common][0]} qty={RESONATOR_ASCENSION_COSTS.commonT3} />
                <MaterialItem name={COMMON_MAT_TIERS[data.ascension.common][1]} qty={RESONATOR_ASCENSION_COSTS.commonT4} />
              </>}
            </div>
          </div>

          {/* Skill Upgrade Materials (all skills to Lv 10) */}
          {data.skillMaterials && (
            <div>
              <h3 className="text-white font-semibold text-sm mb-2 flex items-center gap-2">
                <Zap size={14} className="text-purple-400" /> Skill Materials
              </h3>
              <div className="grid grid-cols-2 gap-1.5">
                <MaterialItem name={data.skillMaterials.weeklyDrop} qty={SKILL_UPGRADE_COSTS.weeklyDrop} />
                {FORGERY_MAT_TIERS[data.skillMaterials.forgery] && <>
                  <MaterialItem name={FORGERY_MAT_TIERS[data.skillMaterials.forgery][0]} qty={SKILL_UPGRADE_COSTS.forgeryT3} />
                  <MaterialItem name={FORGERY_MAT_TIERS[data.skillMaterials.forgery][1]} qty={SKILL_UPGRADE_COSTS.forgeryT4} />
                </>}
                {COMMON_MAT_TIERS[data.ascension.common] && <>
                  <MaterialItem name={COMMON_MAT_TIERS[data.ascension.common][0]} qty={SKILL_UPGRADE_COSTS.commonT3} />
                  <MaterialItem name={COMMON_MAT_TIERS[data.ascension.common][1]} qty={SKILL_UPGRADE_COSTS.commonT4} />
                </>}
              </div>
            </div>
          )}

          {/* EXP Materials */}
          <div>
            <h3 className="text-white font-semibold text-sm mb-2 flex items-center gap-2">
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

// Weapon Detail Modal
const WEAPON_RARITY_COLORS = {
  5: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/50' },
  4: { bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-500/50' },
  3: { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/50' },
  2: { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500/50' },
  1: { bg: 'bg-gray-500/20', text: 'text-gray-400', border: 'border-gray-500/50' },
};
const WeaponDetailModal = ({ name, onClose, imageUrl }) => {
  const data = WEAPON_DATA[name];
  if (!data) return null;

  const colors = WEAPON_RARITY_COLORS[data.rarity] ?? WEAPON_RARITY_COLORS[4];

  return (
    <FocusTrapModal isOpen={true} onClose={onClose} className="" onClick={onClose} ariaLabel={`${name} weapon details`} centered>
      <div
        className={`kuro-card relative w-full max-w-md max-h-[90vh] overflow-hidden border ${colors.border}`}
        onClick={e => e.stopPropagation()}
      >
       <div className="overflow-y-auto max-h-[90vh]">
        {/* Header */}
        <div className={`relative h-40 overflow-hidden rounded-t-2xl${data.rarity === 5 ? ' holo-5star' : ''}`} style={{ contain: 'paint' }} data-sheet-header>
          <div className={`absolute inset-0 bg-gradient-to-br ${colors.bg}`} />
          {imageUrl && (
            <img src={imageUrl} alt={name} className="absolute right-2 top-1/2 -translate-y-1/2 h-36 object-contain opacity-90" onError={hideOnError} />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[rgba(12,16,24,0.95)] via-transparent to-transparent" />
          <button onClick={onClose} className="absolute top-3 right-3 p-2.5 min-w-[36px] min-h-[36px] flex items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 transition-all" aria-label="Close weapon details">
            <X size={16} />
          </button>
          <div className="absolute bottom-3 left-4">
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-[10px] px-2 py-0.5 rounded ${colors.bg} ${colors.text} border ${colors.border}`}>{data.type}</span>
              {data.baseAtk && <span className="text-[10px] px-2 py-0.5 rounded bg-white/10 text-gray-300 border border-[var(--border-medium)]">{data.baseAtk} Base ATK</span>}
              <span className="text-[10px] px-2 py-0.5 rounded bg-white/10 text-gray-300 border border-[var(--border-medium)]">{data.stat}{data.subStatValue ? ` ${data.subStatValue}` : ''}</span>
            </div>
            <h2 className="text-xl font-semibold text-white">{name}</h2>
            <div className="flex items-center gap-0.5 mt-0.5">
              {[...Array(data.rarity)].map((_, i) => <Star key={i} size={12} className="text-yellow-400 fill-yellow-400" />)}
            </div>
          </div>
        </div>
        
        {/* Content */}
        <div className="p-4 space-y-3">
          {data.desc && (() => {
            const sig = data.desc.match(/^(\w+ signature)\.\s*/);
            const rest = sig ? data.desc.slice(sig[0].length) : data.desc;
            const dot = rest.indexOf('. ');
            const lore = dot > 0 ? rest.slice(0, dot + 1) : null;
            const effect = dot > 0 ? rest.slice(dot + 2) : rest;
            return (
              <div className="text-sm space-y-1">
                {sig && <div className="text-[10px] text-gray-500 uppercase tracking-wider">{sig[1]}</div>}
                {lore && <p className="text-gray-400 italic">{lore}</p>}
                <p className="text-gray-300">{effect}</p>
              </div>
            );
          })()}
          
          <div className="p-3 rounded-xl bg-white/5 border border-[var(--border-medium)]">
            <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Passive</div>
            <div className={`text-xs ${colors.text}`}>{data.passive}</div>
          </div>
          
          {data.bestFor && data.bestFor.length > 0 && (
            <div>
              <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Best For</div>
              <div className="flex flex-wrap gap-1">
                {data.bestFor.map((char, i) => (
                  <span key={i} className="text-[10px] px-2 py-1 rounded bg-yellow-500/10 text-yellow-400 border border-yellow-500/30">{char}</span>
                ))}
              </div>
            </div>
          )}

          {/* Ascension Materials */}
          {data.ascensionMaterials && (() => {
            const costs = data.rarity === 5 ? WEAPON_ASCENSION_COSTS_5 : WEAPON_ASCENSION_COSTS_4;
            const forgeryTiers = FORGERY_MAT_TIERS[data.ascensionMaterials.forgery];
            const commonTiers = COMMON_MAT_TIERS[data.ascensionMaterials.common];
            return (
              <div>
                <h3 className="text-white font-semibold text-sm mb-2 flex items-center gap-2">
                  <Swords size={14} className="text-orange-400" /> Ascension Materials
                </h3>
                <div className="grid grid-cols-2 gap-1.5">
                  {forgeryTiers && <>
                    <MaterialItem name={forgeryTiers[0]} qty={costs.forgeryT3} />
                    <MaterialItem name={forgeryTiers[1]} qty={costs.forgeryT4} />
                  </>}
                  {commonTiers && <>
                    <MaterialItem name={commonTiers[0]} qty={costs.commonT3} />
                    <MaterialItem name={commonTiers[1]} qty={costs.commonT4} />
                  </>}
                </div>
              </div>
            );
          })()}

          {/* EXP Materials */}
          <div>
            <h3 className="text-white font-semibold text-sm mb-2 flex items-center gap-2">
              <TrendingUp size={14} className="text-cyan-400" /> EXP Materials
            </h3>
            <div className="grid grid-cols-2 gap-1.5">
              {Object.entries(data.rarity === 5 ? WEAPON_EXP_COSTS_5 : WEAPON_EXP_COSTS_4).filter(([, qty]) => qty > 0).map(([mat, qty]) => (
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

// Echo Detail Modal
const ECHO_COST_COLORS = {
  4: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/50', label: '4 Cost' },
  3: { bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-500/50', label: '3 Cost' },
  1: { bg: 'bg-cyan-500/20', text: 'text-cyan-400', border: 'border-cyan-500/50', label: '1 Cost' },
};
const ECHO_BUFF_COLORS = {
  'Glacio DMG':  { bg: 'bg-cyan-500/10',    text: 'text-cyan-400',    border: 'border-cyan-500/25' },
  'Fusion DMG':  { bg: 'bg-orange-500/10',   text: 'text-orange-400',  border: 'border-orange-500/25' },
  'Electro DMG': { bg: 'bg-purple-500/10',   text: 'text-purple-400',  border: 'border-purple-500/25' },
  'Aero DMG':    { bg: 'bg-emerald-500/10',  text: 'text-emerald-400', border: 'border-emerald-500/25' },
  'Spectro DMG': { bg: 'bg-yellow-500/10',   text: 'text-yellow-400',  border: 'border-yellow-500/25' },
  'Havoc DMG':   { bg: 'bg-pink-500/10',     text: 'text-pink-400',    border: 'border-pink-500/25' },
  'Healing':      { bg: 'bg-green-500/10',     text: 'text-green-400',   border: 'border-green-500/25' },
  'Shield':       { bg: 'bg-blue-500/10',      text: 'text-blue-400',    border: 'border-blue-500/25' },
  'Physical DMG': { bg: 'bg-slate-400/10',     text: 'text-slate-300',   border: 'border-slate-400/25' },
};
const EchoDetailModal = ({ name, onClose, imageUrl, cost }) => {
  const data = ECHO_DATA[name];
  if (!data) return null;

  const costColors = ECHO_COST_COLORS[cost] || ECHO_COST_COLORS[4];
  const buffColors = ECHO_BUFF_COLORS[data.buff] || { bg: 'bg-white/10', text: 'text-gray-300', border: 'border-[var(--border-medium)]' };

  // Get element-based colors for gradient header and border
  const setColors = getEchoSetColors(name);
  const primaryBuffColor = getBuffElementColor(Array.isArray(data.buff) ? data.buff[0] : data.buff);
  const headerGradient = setColors.length >= 2
    ? `linear-gradient(135deg, ${setColors[0]}25 0%, ${setColors[1]}25 ${setColors.length >= 3 ? '50%' : '100%'}${setColors.length >= 3 ? `, ${setColors[2]}25 100%` : ''})`
    : setColors.length === 1
      ? `linear-gradient(135deg, ${setColors[0]}25 0%, ${setColors[0]}10 100%)`
      : undefined;
  const borderColor = setColors.length >= 2
    ? setColors[0]
    : setColors.length === 1 ? setColors[0] : undefined;

  // Find characters that use this echo (referenced in bestEchoes)
  const usedBy = Object.entries(CHARACTER_DATA).filter(([, cd]) =>
    cd.bestEchoes?.some(e => e.toLowerCase().includes(name.toLowerCase()))
  ).map(([cname]) => cname);

  return (
    <FocusTrapModal isOpen={true} onClose={onClose} className="" onClick={onClose} ariaLabel={`${name} echo details`} centered>
      <div
        className="kuro-card relative w-full max-w-md max-h-[90vh] overflow-hidden border"
        style={borderColor ? { borderColor: `${borderColor}80` } : {}}
        onClick={e => e.stopPropagation()}
      >
       <div className="overflow-y-auto max-h-[90vh]">
        {/* Header */}
        <div className="relative h-40 overflow-hidden rounded-t-2xl" style={{ contain: 'paint' }} data-sheet-header>
          <div className="absolute inset-0" style={headerGradient ? { background: headerGradient } : {}} />
          {!headerGradient && <div className={`absolute inset-0 bg-gradient-to-br ${costColors.bg}`} />}
          {imageUrl && (
            <img src={imageUrl} alt={name} className="absolute right-2 top-1/2 -translate-y-1/2 h-36 object-contain opacity-90" onError={hideOnError} />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[rgba(12,16,24,0.95)] via-transparent to-transparent" />
          <button onClick={onClose} className="absolute top-3 right-3 p-2.5 min-w-[36px] min-h-[36px] flex items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 transition-all" aria-label="Close echo details">
            <X size={16} />
          </button>
          <div className="absolute bottom-3 left-4">
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-[10px] px-2 py-0.5 rounded ${costColors.bg} ${costColors.text} border ${costColors.border}`}>{costColors.label}</span>
              {(Array.isArray(data.buff) ? data.buff : [data.buff]).map(b => {
                const bc = ECHO_BUFF_COLORS[b] || buffColors;
                return <span key={b} className={`text-[10px] px-2 py-0.5 rounded ${bc.bg} ${bc.text} border ${bc.border}`}>{b}</span>;
              })}
            </div>
            <h2 className="text-xl font-semibold text-white">{name}</h2>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          {/* Description */}
          {data.desc && (() => {
            const parts = data.desc.split(/(?<=\.)\s+/);
            const identity = parts[0] || '';
            const skillParts = [];
            const buffParts = [];
            for (let i = 1; i < parts.length; i++) {
              if (/grants?\s|Main slot/i.test(parts[i])) buffParts.push(parts[i]);
              else skillParts.push(parts[i]);
            }
            return (
              <div className="text-sm space-y-2">
                <p className="text-gray-400 italic">{identity}</p>
                {skillParts.length > 0 && (
                  <div className="p-2.5 rounded-lg bg-white/5">
                    <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Skill</div>
                    <p className="text-gray-300 text-xs leading-relaxed">{skillParts.join(' ')}</p>
                  </div>
                )}
                {buffParts.length > 0 && (
                  <div className="p-2.5 rounded-lg bg-white/5">
                    <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Buff</div>
                    <p className="text-gray-300 text-xs leading-relaxed">{buffParts.join(' ')}</p>
                  </div>
                )}
              </div>
            );
          })()}

          {/* Sonata Sets */}
          <div className="p-3 rounded-xl bg-white/5 border border-[var(--border-medium)]">
            <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-2">Available Sonata Sets</div>
            <div className="space-y-2">
              {data.sets.map(setName => {
                const setData = ECHO_SETS[setName];
                const setColor = getSetElementColor(setName);
                return (
                  <div key={setName} className="p-2 rounded-lg" style={{ background: `${setColor}10`, borderLeft: `3px solid ${setColor}80` }}>
                    <div className="text-xs font-bold mb-0.5" style={{ color: setColor }}>{setName}</div>
                    {setData ? (
                      <div className="space-y-0.5">
                        {setData.p2 && <div className="text-[10px] text-gray-400"><span className="text-gray-500">2pc:</span> {setData.p2}</div>}
                        {setData.p3 && <div className="text-[10px] text-gray-400"><span className="text-gray-500">3pc:</span> {setData.p3}</div>}
                        {setData.p5 && <div className="text-[10px] text-gray-400"><span className="text-gray-500">5pc:</span> {setData.p5}</div>}
                      </div>
                    ) : (
                      <div className="text-[10px] text-gray-500 italic">Set data not available</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Main Stat Options (based on cost) */}
          <div className="p-3 rounded-xl bg-white/5 border border-[var(--border-medium)]">
            <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-2">Possible Main Stats</div>
            <div className="flex flex-wrap gap-1">
              {cost === 4 && ['ATK%', 'HP%', 'DEF%', 'Crit Rate', 'Crit DMG', 'Healing Bonus', 'Energy Regen'].map(s => (
                <span key={s} className="text-[10px] px-2 py-0.5 rounded bg-yellow-500/10 text-yellow-400 border border-yellow-500/25">{s}</span>
              ))}
              {cost === 3 && ['ATK%', 'HP%', 'DEF%', 'Glacio DMG', 'Fusion DMG', 'Electro DMG', 'Aero DMG', 'Spectro DMG', 'Havoc DMG', 'Energy Regen'].map(s => (
                <span key={s} className="text-[10px] px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/25">{s}</span>
              ))}
              {cost === 1 && ['ATK%', 'HP%', 'DEF%'].map(s => (
                <span key={s} className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/25">{s}</span>
              ))}
            </div>
            <div className="text-[10px] text-gray-500 mt-1">
              Secondary: {cost === 1 ? 'Flat HP' : 'Flat ATK'}
            </div>
          </div>

          {/* Buff Description */}
          <div className="p-3 rounded-xl border" style={{ borderColor: `${primaryBuffColor}40`, background: `${primaryBuffColor}08` }}>
            <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Echo Skill Buff</div>
            <div className="flex flex-wrap gap-1.5">
              {(Array.isArray(data.buff) ? data.buff : [data.buff]).map(b => (
                <span key={b} className="text-xs font-medium" style={{ color: getBuffElementColor(b) }}>{b}</span>
              ))}
            </div>
          </div>

          {/* Used By Characters */}
          {usedBy.length > 0 && (
            <div>
              <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1.5">Recommended For</div>
              <div className="flex flex-wrap gap-2">
                {usedBy.map(charName => {
                  const charImg = DEFAULT_COLLECTION_IMAGES[charName];
                  const is5Star = CHARACTER_DATA[charName]?.rarity === 5;
                  return (
                    <div key={charName} className="flex flex-col items-center gap-1">
                      {charImg ? (
                        <div className={`w-12 h-12 rounded-lg bg-neutral-800 border border-[var(--border-medium)] overflow-hidden${is5Star ? ' holo-5star' : ''}`} style={{ contain: 'paint', position: 'relative' }}>
                          <div className="absolute inset-0 breath-zoom">
                            <img src={charImg} alt={charName} className="absolute inset-0 w-full h-full object-cover object-top" onError={hideOnError} />
                          </div>
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-neutral-800 border border-[var(--border-medium)] flex items-center justify-center">
                          <User size={14} className="text-gray-500" />
                        </div>
                      )}
                      <span className="text-[10px] text-gray-400 text-center leading-tight max-w-[56px] truncate">{charName}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
       </div>
      </div>
    </FocusTrapModal>
  );
};

// Error Boundary — catches crashes per tab so one broken tab doesn't kill the app
class TabErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, prevTabName: props.tabName };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  static getDerivedStateFromProps(nextProps, prevState) {
    // Reset error when tab changes (tabName prop changes)
    if (prevState.prevTabName !== undefined && prevState.prevTabName !== nextProps.tabName) {
      return { hasError: false, error: null, prevTabName: nextProps.tabName };
    }
    return { prevTabName: nextProps.tabName };
  }
  componentDidCatch(error, info) {
    console.error(`[${this.props.tabName || 'Tab'}] Crash:`, error, info?.componentStack);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="kuro-calc space-y-3 tab-content">
          <div className="kuro-card">
            <div className="kuro-card-inner">
              <div className="kuro-body text-center py-8">
                <AlertCircle size={32} className="mx-auto mb-3 text-red-400" />
                <div className="text-white font-bold text-sm mb-1">Something went wrong</div>
                <p className="text-gray-400 text-xs mb-4">The {this.props.tabName || 'tab'} tab encountered an error.</p>
                <button 
                  onClick={() => this.setState({ hasError: false, error: null })}
                  className="kuro-btn active-cyan text-xs px-4 py-2"
                  aria-label={`Retry loading the ${this.props.tabName || 'tab'} tab`}
                >
                  Try Again
                </button>
                {this.state.error && (
                  <details className="mt-3 text-left">
                    <summary className="text-gray-400 text-[10px] cursor-pointer">Error details</summary>
                    <pre className="mt-1 p-2 bg-black/50 rounded text-red-400 text-[10px] overflow-x-auto whitespace-pre-wrap">{this.state.error.message}</pre>
                  </details>
                )}
              </div>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// P6-FIX: Root-level error boundary — catches crashes outside individual tabs (MED)
class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, info) {
    console.error('[App] Fatal crash:', error, info?.componentStack);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#080c12', color: '#fff', fontFamily: 'system-ui, sans-serif', padding: '2rem' }}>
          {/* §E10-ER-F3: Red border accent to distinguish app-level crash from tab-level */}
          <div style={{ textAlign: 'center', maxWidth: 420, border: '1px solid rgba(239,68,68,0.4)', borderRadius: 16, padding: '2rem', background: 'rgba(239,68,68,0.05)' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
            <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Whispering Wishes crashed</h1>
            <p style={{ color: '#9ca3af', fontSize: 14, marginBottom: 24 }}>Something unexpected went wrong. Your data is safe in local storage.</p>
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              style={{ padding: '10px 24px', background: 'rgba(6,182,212,0.2)', border: '1px solid rgba(6,182,212,0.4)', color: '#22d3ee', borderRadius: 8, cursor: 'pointer', fontSize: 14, marginRight: 8, outline: 'none' }}
              onFocus={(e) => { e.target.style.boxShadow = '0 0 0 3px rgba(6,182,212,0.5)'; }}
              onBlur={(e) => { e.target.style.boxShadow = 'none'; }}
            >
              Try Again
            </button>
            <button
              onClick={() => window.location.reload()}
              style={{ padding: '10px 24px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: '#d1d5db', borderRadius: 8, cursor: 'pointer', fontSize: 14, outline: 'none' }}
              onFocus={(e) => { e.target.style.boxShadow = '0 0 0 3px rgba(255,255,255,0.3)'; }}
              onBlur={(e) => { e.target.style.boxShadow = 'none'; }}
            >
              Reload Page
            </button>
            {this.state.error && (
              <details style={{ marginTop: 16, textAlign: 'left' }}>
                <summary style={{ color: '#6b7280', fontSize: 11, cursor: 'pointer' }}>Error details</summary>
                <pre style={{ marginTop: 8, padding: 12, background: 'rgba(0,0,0,0.5)', borderRadius: 8, color: '#f87171', fontSize: 10, overflow: 'auto', whiteSpace: 'pre-wrap' }}>{this.state.error.message}</pre>
              </details>
            )}
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const TabButton = memo(({ active, onClick, children, tabRef, tabId, accentColor }) => {
  const childArray = React.Children.toArray(children);
  const icon = childArray.find(child => React.isValidElement(child));
  const text = childArray.find(child => typeof child === 'string')?.trim();
  const btnRef = useRef(null);
  const accent = accentColor || null;

  useEffect(() => {
    let rafId = null;
    try {
      if (active && btnRef.current && tabRef?.current) {
        rafId = requestAnimationFrame(() => {
          const btn = btnRef.current;
          const nav = tabRef?.current;
          if (!btn || !nav) return;
          const indicator = nav.querySelector('.tab-indicator');
          if (indicator) {
            indicator.style.left = `${btn.offsetLeft + btn.offsetWidth * 0.2}px`;
            indicator.style.width = `${btn.offsetWidth * 0.6}px`;
            if (accent) {
              indicator.style.background = `linear-gradient(90deg, ${accent}99, ${accent}, ${accent}99)`;
              indicator.style.boxShadow = `0 0 12px ${accent}80`;
            } else {
              indicator.style.background = `linear-gradient(90deg, rgba(237,175,24,0.6), rgba(237,175,24,1), rgba(237,175,24,0.6))`;
              indicator.style.boxShadow = `0 0 12px rgba(237,175,24,0.5)`;
            }
          }
        });
      }
    } catch (e) { /* ignore indicator errors */ }
    return () => { if (rafId !== null) cancelAnimationFrame(rafId); };
  }, [active, tabRef, accent]);

  return (
    <button
      ref={btnRef}
      onClick={() => { haptic.light(); onClick(); }}
      role="tab"
      id={tabId ? `tab-${tabId}` : undefined}
      aria-selected={active}
      aria-controls={tabId ? `tabpanel-${tabId}` : undefined}
      tabIndex={active ? 0 : -1}
      aria-label={`${text || 'Navigation'} tab`}
      className={`relative flex flex-col items-center gap-0.5 px-2.5 py-2 text-[10px] font-medium transition-all duration-300 whitespace-nowrap group ${active && !accent ? 'text-yellow-400' : !active ? 'text-gray-500 hover:text-gray-300' : ''}`}
      style={active && accent ? { color: accent } : undefined}
    >
      <div className={`relative z-10 p-1.5 rounded-xl transition-all duration-300 ${active && !accent ? 'bg-yellow-500/10 shadow-lg shadow-yellow-500/25' : !active ? 'group-hover:bg-white/5 group-hover:shadow-md group-hover:shadow-white/5' : ''}`} style={active ? { filter: `drop-shadow(0 0 5px ${accent ? accent + '80' : 'rgba(237,175,24,0.5)'})`, ...(accent ? { background: accent + '1a', boxShadow: `0 10px 15px -3px ${accent}40` } : {}) } : undefined}>
        {icon}
      </div>
      <span className="relative z-10">{text}</span>
    </button>
  );
});
TabButton.displayName = 'TabButton';

const TIMER_COLOR_MAP = { yellow: 'text-yellow-400', pink: 'text-pink-400', cyan: 'text-cyan-400', orange: 'text-orange-400', purple: 'text-purple-400' };

const CountdownTimer = memo(({ endDate, color = 'yellow', compact = false, alwaysShow = false, onExpire, recalcFn }) => {
  const [currentEnd, setCurrentEnd] = useState(endDate);
  const [time, setTime] = useState(() => getTimeRemaining(endDate));
  const expiredRef = useRef(false);
  const currentEndRef = useRef(currentEnd);
  // P9-FIX: Use refs for callbacks to avoid effect re-runs on reference changes (MEDIUM-5f)
  const recalcFnRef = useRef(recalcFn);
  const onExpireRef = useRef(onExpire);
  
  // Keep refs in sync with props
  useEffect(() => { currentEndRef.current = currentEnd; }, [currentEnd]);
  useEffect(() => { recalcFnRef.current = recalcFn; }, [recalcFn]);
  useEffect(() => { onExpireRef.current = onExpire; }, [onExpire]);
  
  // Update end date when prop changes
  useEffect(() => {
    setCurrentEnd(endDate);
    setTime(getTimeRemaining(endDate));
    expiredRef.current = false;
  }, [endDate]);
  
  // P14-FIX: MEDIUM-18 — Use setInterval(1000) instead of requestAnimationFrame for second-precision timer.
  // rAF runs at 60fps but only does meaningful work once per second; setInterval is more efficient.
  // Visibility API pause/resume prevents stale timers when tab is backgrounded.
  useEffect(() => {
    let intervalId = null;

    const updateTimer = () => {
      const end = currentEndRef.current;
      const t = getTimeRemaining(end);
      if (t.expired && recalcFnRef.current) {
        // Auto-rollover for recurring timers (daily/weekly)
        const newEnd = recalcFnRef.current();
        setCurrentEnd(newEnd);
        setTime(getTimeRemaining(newEnd));
        expiredRef.current = false;
      } else {
        setTime(t);
        if (t.expired && !expiredRef.current) {
          expiredRef.current = true;
          if (onExpireRef.current) setTimeout(onExpireRef.current, 500);
        }
      }
    };

    const startInterval = () => {
      if (intervalId) return;
      updateTimer(); // Immediate update
      intervalId = setInterval(updateTimer, 1000);
    };

    const stopInterval = () => {
      if (intervalId) { clearInterval(intervalId); intervalId = null; }
    };

    startInterval();

    // Pause when tab is hidden, resume with immediate update when visible
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        updateTimer(); // Immediate catch-up
        startInterval();
      } else {
        stopInterval();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Handle page focus (backup for visibility)
    const handleFocus = () => { updateTimer(); };
    window.addEventListener('focus', handleFocus);

    return () => {
      stopInterval();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, []); // Callbacks accessed via refs (P9-FIX: MEDIUM-5f)
  
  // For daily/weekly resets, never show "ENDED" - recalculate next reset
  if (time.expired && !alwaysShow) return <span className="text-gray-400 text-xs font-medium uppercase tracking-wider">Ended</span>;
  if (time.expired && alwaysShow) {
    // If expired but alwaysShow, show "0h 0m 0s" briefly until next tick updates
    return <span className={`kuro-number text-xs ${TIMER_COLOR_MAP[color] || TIMER_COLOR_MAP.purple}`}>0h 0m 0s</span>;
  }
  
  const textColor = TIMER_COLOR_MAP[color] || TIMER_COLOR_MAP.purple;
  
  // Unified compact style matching Tracker tab
  if (compact) {
    return (
      <span className={`${textColor} kuro-number text-xs font-medium`} role="timer" aria-label={`${time.days > 0 ? `${time.days} days ` : ''}${time.hours} hours ${time.minutes} minutes ${time.seconds} seconds remaining`}>
        {time.days > 0 && `${time.days}d `}{String(time.hours).padStart(2, '0')}h {String(time.minutes).padStart(2, '0')}m {String(time.seconds).padStart(2, '0')}s
      </span>
    );
  }
  
  return (
    <div className="flex items-center gap-1.5" role="timer" aria-label={`${time.days > 0 ? `${time.days} days ` : ''}${time.hours} hours ${time.minutes} minutes ${time.seconds} seconds remaining`}>
      {time.days > 0 && (
        <>
          <div className="px-2.5 py-1.5 text-center" style={TIMER_BOX_STYLE}>
            <div className="text-white kuro-scoreboard">{time.days}</div>
            <div className="text-gray-400 text-[8px] uppercase tracking-wider mt-0.5">{time.days === 1 ? 'Day' : 'Days'}</div>
          </div>
          <span className={`${textColor} font-bold text-sm opacity-60`}>:</span>
        </>
      )}
      <div className="px-2.5 py-1.5 text-center" style={TIMER_BOX_STYLE}>
        <div className="text-white kuro-scoreboard">{String(time.hours).padStart(2, '0')}</div>
        <div className="text-gray-400 text-[8px] uppercase tracking-wider mt-0.5">Hr</div>
      </div>
      <span className={`${textColor} font-bold text-sm opacity-60`}>:</span>
      <div className="px-2.5 py-1.5 text-center" style={TIMER_BOX_STYLE}>
        <div className="text-white kuro-scoreboard">{String(time.minutes).padStart(2, '0')}</div>
        <div className="text-gray-400 text-[8px] uppercase tracking-wider mt-0.5">Min</div>
      </div>
      <span className={`${textColor} font-bold text-sm opacity-60`}>:</span>
      <div className="px-2.5 py-1.5 text-center" style={TIMER_BOX_STYLE}>
        <div className={`kuro-scoreboard ${textColor}`}>{String(time.seconds).padStart(2, '0')}</div>
        <div className="text-gray-400 text-[8px] uppercase tracking-wider mt-0.5">Sec</div>
      </div>
    </div>
  );
});
CountdownTimer.displayName = 'CountdownTimer';

// P11-FIX: Hoisted constant style objects outside components to prevent recreation on every render (Step 7 audit — NIT-3c)
const TIMER_BOX_STYLE = Object.freeze({ backgroundColor: 'rgba(15,20,28,0.3)', borderRadius: '12px' });
const BANNER_CARD_OVERLAY_STYLE = Object.freeze({ background: 'linear-gradient(to top, rgba(8,12,20,0.85) 60%, transparent)', padding: '10px 12px 12px', textShadow: '0 2px 8px rgba(0,0,0,0.9), 0 1px 3px rgba(0,0,0,0.8)' });
const TEXT_SHADOW_STYLE = Object.freeze({ textShadow: '0 2px 8px rgba(0,0,0,0.9), 0 1px 3px rgba(0,0,0,0.8)' });

const PityRing = memo(({ value = 0, max = 80, size = 52, strokeWidth = 4, color = '#edaf18', glowColor = 'rgba(237,175,24,0.4)', label, sublabel, softPityStart }) => {
  const safeValue = Number(value) || 0;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.min(safeValue / max, 1);
  const offset = circumference * (1 - pct);
  
  // Soft pity zone: configurable threshold, defaults to 65 for max=80
  const softThreshold = softPityStart != null ? softPityStart : (max === HARD_PITY ? SOFT_PITY_START : null);
  const showSoftZone = softThreshold != null && softThreshold < max;
  const isSoftPity = showSoftZone && safeValue >= softThreshold;
  const isDanger = max === HARD_PITY && safeValue >= 75;

  const softStart = showSoftZone ? softThreshold / max : 0;
  const softLen = showSoftZone ? (max - softThreshold) / max : 0;
  const softDash = softLen * circumference;
  const softGap = circumference - softDash;
  const softOffset = -softStart * circumference;
  
  return (
    <div className="flex flex-col items-center">
      <div className={`${isDanger ? 'pity-danger' : isSoftPity ? 'pity-soft' : ''}`} style={{ borderRadius: '50%', width: size, height: size, overflow: 'hidden' }}>
      <svg width={size} height={size} className={`${isSoftPity ? 'pulse-subtle' : ''}`} role="img" aria-label={`Pity: ${safeValue} out of ${max}${isSoftPity ? ', in soft pity zone' : ''}`}>
        <circle className="pity-ring-track" cx={size/2} cy={size/2} r={radius} strokeWidth={strokeWidth} />
        {showSoftZone && (
          <circle 
            cx={size/2} cy={size/2} r={radius} 
            strokeWidth={strokeWidth} 
            stroke="rgba(251, 146, 60, 0.2)"
            fill="none"
            strokeDasharray={`${softDash} ${softGap}`} 
            strokeDashoffset={softOffset}
            transform={`rotate(-90 ${size/2} ${size/2})`}
            strokeLinecap="butt"
          />
        )}
        <circle className="pity-ring-fill" cx={size/2} cy={size/2} r={radius} strokeWidth={strokeWidth} stroke={color} strokeDasharray={circumference} strokeDashoffset={offset} transform={`rotate(-90 ${size/2} ${size/2})`} style={{'--ring-glow': glowColor}} />
        <text className="pity-ring-text" x={size/2} y={size/2} fontSize={size * 0.36} fill={color}>{safeValue}</text>
      </svg>
      </div>
      {label && <div className="text-gray-300 text-[10px] mt-0.5">{label}</div>}
      {sublabel && <div className="text-gray-400 text-[10px]">{sublabel}</div>}
    </div>
  );
});
PityRing.displayName = 'PityRing';

// [SECTION:BACKGROUND]
// Wave phase functions shared by both components
const _wf1 = (x, y, t) => x * 0.012 + Math.sin(y * 0.006) * 3.0 + Math.cos(y * 0.003 + x * 0.002) * 1.5 - t * 0.35;
const _wf2 = (x, y, t) => (x * 0.007 + y * 0.009) + Math.sin(x * 0.004 - y * 0.003) * 2.2 + Math.cos(x * 0.002) * 1.2 - t * 0.25;
const _wf3 = (x, y, t) => y * 0.011 + Math.sin(x * 0.008) * 2.5 + Math.cos(y * 0.004 + x * 0.003) * 1.3 - t * 0.2;

// LAYER A: Smooth ambient glow gradient — z-index 1
// P11-FIX: Wrapped in memo — canvas heavy lifting is in useEffect, but memo prevents
// unnecessary React reconciliation on parent re-renders (Step 7 audit — LOW-3b)
const BackgroundGlow = memo(({ oledMode, animationsEnabled = 'on' }) => {
  const canvasRef = useRef(null);
  useEffect(() => {
    if (animationsEnabled === 'off' || animationsEnabled === false) {
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
      return;
    }
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    // P12-FIX: getContext can return null in low-memory / restricted environments (Step 12 audit — LOW-12p)
    if (!ctx) return;
    const buf = document.createElement('canvas');
    const bctx = buf.getContext('2d');
    if (!bctx) return;
    let animId;
    const BLUR_SCALE = 0.08; // Canvas downscale factor for blur buffer
    let w, h, bw, bh;
    
    // OLED mode uses darker base color
    const bgColor = oledMode ? 'rgb(0,0,0)' : 'rgb(2,3,6)';
    
    // Full mode: boost glow intensity
    const isFull = animationsEnabled === 'full';
    const glowAlphaMax = isFull ? 0.45 : 0.3;
    const glowAlphaScale = isFull ? 1.0 : 0.7;
    const specMul = isFull ? 0.45 : 0.3;
    const peakMul = isFull ? 0.30 : 0.22;
    const colorBoost = isFull ? 1.4 : 1.0;

    const init = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w;
      canvas.height = h;
      bw = Math.ceil(w * BLUR_SCALE);
      bh = Math.ceil(h * BLUR_SCALE);
      buf.width = bw;
      buf.height = bh;
    };
    init();
    window.addEventListener('resize', init);

    let lastFrame = 0;

    const draw = (t) => {
      animId = requestAnimationFrame(draw);
      if (t - lastFrame < 66) return;
      lastFrame = t;
      const time = t * 0.00075; // 25% slower
      bctx.fillStyle = bgColor;
      bctx.fillRect(0, 0, bw, bh);

      const gs = 2;
      for (let by = 0; by < bh; by += gs) {
        for (let bx = 0; bx < bw; bx += gs) {
          const sx = bx / BLUR_SCALE;
          const sy = by / BLUR_SCALE;

          const h1 = Math.sin(_wf1(sx, sy, time));
          const h2 = Math.sin(_wf2(sx, sy, time));
          const h3 = Math.sin(_wf3(sx, sy, time));
          const totalH = h1 * 0.7 + h2 * 0.5 + h3 * 0.4;

          const d = 10;
          const slX = (Math.sin(_wf1(sx+d,sy,time))-h1)*0.7 + (Math.sin(_wf2(sx+d,sy,time))-h2)*0.5 + (Math.sin(_wf3(sx+d,sy,time))-h3)*0.4;
          const slY = (Math.sin(_wf1(sx,sy+d,time))-h1)*0.7 + (Math.sin(_wf2(sx,sy+d,time))-h2)*0.5 + (Math.sin(_wf3(sx,sy+d,time))-h3)*0.4;
          const tilt = Math.sqrt(slX*slX + slY*slY);

          const spec = Math.pow(Math.max(0, 1 - tilt * 2.0), 2);
          const peak = Math.max(0, totalH / 1.5) * peakMul;
          const gI = spec * specMul + peak;

          if (gI > 0.008) {
            const a = Math.min(gI * glowAlphaScale, glowAlphaMax);
            const blend = Math.max(0, Math.min(1, (totalH + 1.6) / 3.2));
            const rr = Math.round(Math.min(255, (6 + blend * 25) * colorBoost));
            const gg = Math.round(Math.min(255, (12 + blend * 40) * colorBoost));
            const bb = Math.round(Math.min(255, (45 + blend * 70) * colorBoost));
            bctx.fillStyle = `rgba(${rr},${gg},${bb},${a})`;
            bctx.fillRect(bx, by, gs, gs);
          }
        }
      }

      ctx.clearRect(0, 0, w, h);
      ctx.filter = 'blur(20px)';
      ctx.drawImage(buf, 0, 0, bw, bh, 0, 0, w, h);
      ctx.filter = 'none';
    };
    animId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', init);
      // P11-FIX: Explicitly release buffer canvas backing store memory (Step 7 audit — LOW-3h)
      buf.width = 0;
      buf.height = 0;
    };
  }, [oledMode, animationsEnabled]);
  
  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none" style={{zIndex: 1, willChange: 'transform'}} aria-hidden="true" role="presentation" />;
});
BackgroundGlow.displayName = 'BackgroundGlow';

// LAYER B: Triangle wave mask — traveling wavefront specular, z-index 2
// P11-FIX: Wrapped in memo — same rationale as BackgroundGlow (Step 7 audit — LOW-3b)
const TriangleMirrorWave = memo(({ oledMode, animationsEnabled = 'on' }) => {
  const canvasRef = useRef(null);
  useEffect(() => {
    if (animationsEnabled === 'off' || animationsEnabled === false) {
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
      return;
    }
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    // P12-FIX: getContext can return null in low-memory / restricted environments (Step 12 audit — LOW-12p)
    if (!ctx) return;
    let animId;
    
    const TW = 36;
    const TH = 31;
    const HALF = TW / 2;
    let w, h, cols, rows, seeds;
    
    const init = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w;
      canvas.height = h;
      cols = Math.ceil(w / HALF) + 4;
      rows = Math.ceil(h / TH) + 4;
      seeds = new Float32Array(cols * rows);
      for (let i = 0; i < seeds.length; i++) seeds[i] = Math.random() * 6.28;
    };
    init();
    window.addEventListener('resize', init);
    
    // Full mode: boost specular and peak intensity
    const isFull = animationsEnabled === 'full';
    const twSpecMul = isFull ? 0.65 : 0.45;
    const twPeakMul = isFull ? 0.18 : 0.12;
    const twAlphaScale = isFull ? 0.6 : 0.45;
    const twAlphaMax = isFull ? 0.35 : 0.25;
    const twColorBoost = isFull ? 1.3 : 1.0;

    let lastFrame = 0;

    const draw = (t) => {
      animId = requestAnimationFrame(draw);
      if (t - lastFrame < 66) return;
      lastFrame = t;
      ctx.clearRect(0, 0, w, h);
      const time = t * 0.00075; // 25% slower

      for (let r = -1; r < rows; r++) {
        for (let c = -1; c < cols; c++) {
          const isUp = ((c + r) % 2 + 2) % 2 === 0;
          const cx = c * HALF;
          const cy = r * TH + (isUp ? TH * 0.33 : TH * 0.66);

          if (cx < -HALF || cx > w + HALF || cy < -TH || cy > h + TH) continue;

          const seedIdx = ((r + 1) * cols + (c + 1));
          const seed = seedIdx >= 0 && seedIdx < seeds.length ? seeds[seedIdx] : 0;

          // Minimal seed for subtle per-triangle variation
          const so = seed * 0.05;

          // Wave heights at this triangle center
          const v1 = Math.sin(_wf1(cx, cy, time) + so);
          const v2 = Math.sin(_wf2(cx, cy, time) + so * 0.7);
          const v3 = Math.sin(_wf3(cx, cy, time) + so * 0.5);
          const totalH = v1 * 0.7 + v2 * 0.5 + v3 * 0.4;

          // Slope from finite differences (traveling wavefront detection)
          const dd = 4;
          const hR = Math.sin(_wf1(cx+dd,cy,time)+so)*0.7 + Math.sin(_wf2(cx+dd,cy,time)+so*0.7)*0.5 + Math.sin(_wf3(cx+dd,cy,time)+so*0.5)*0.4;
          const hD = Math.sin(_wf1(cx,cy+dd,time)+so)*0.7 + Math.sin(_wf2(cx,cy+dd,time)+so*0.7)*0.5 + Math.sin(_wf3(cx,cy+dd,time)+so*0.5)*0.4;
          const slopeX = hR - totalH;
          const slopeY = hD - totalH;
          const tilt = Math.sqrt(slopeX * slopeX + slopeY * slopeY);

          // Specular: flat faces (low tilt) catch light → traveling bright bands
          const specular = Math.pow(Math.max(0, 1 - tilt * 3.5), 5);
          // Peak height glow: wave crests glow slightly
          const peakGlow = Math.max(0, totalH / 2.0) * twPeakMul;

          const intensity = specular * twSpecMul + peakGlow;
          if (intensity < 0.015) continue;

          const x = c * HALF;
          const y = r * TH;
          ctx.beginPath();
          if (isUp) {
            ctx.moveTo(x - HALF, y + TH);
            ctx.lineTo(x, y);
            ctx.lineTo(x + HALF, y + TH);
          } else {
            ctx.moveTo(x - HALF, y);
            ctx.lineTo(x + HALF, y);
            ctx.lineTo(x, y + TH);
          }
          ctx.closePath();

          const sp = Math.min(specular * 3, 1);
          const ri = Math.round(Math.min(255, (60 + sp * 120) * twColorBoost));
          const gi = Math.round(Math.min(255, (85 + sp * 100) * twColorBoost));
          const bi = Math.round(Math.min(255, (150 + sp * 80) * twColorBoost));
          const alpha = Math.min(intensity * twAlphaScale, twAlphaMax);
          ctx.fillStyle = `rgba(${ri},${gi},${bi},${alpha})`;
          ctx.fill();
        }
      }
    };
    animId = requestAnimationFrame(draw);
    
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', init);
    };
  }, [oledMode, animationsEnabled]);

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none" style={{zIndex: 2, willChange: 'transform'}} aria-hidden="true" role="presentation" />;
});
TriangleMirrorWave.displayName = 'TriangleMirrorWave';

// LAYER ALT: Resonance Field — A single ribbon of dots forming a circular loop in 3D
// The ribbon is a ring of dots with width (multiple rows), viewed from the side.
// It undulates up/down like a sine wave as it goes around, and the whole thing rotates.
// Think of it like a halo or ring seen nearly edge-on, rippling like a ribbon.
const ResonanceField = memo(({ oledMode, animationsEnabled = 'on' }) => {
  const canvasRef = useRef(null);
  useEffect(() => {
    if (animationsEnabled === 'off' || animationsEnabled === false) {
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let animId;

    const isFull = animationsEnabled === 'full';
    const alphaScale = isFull ? 1.5 : 1.0;
    const bgColor = oledMode ? 'rgb(0,0,0)' : 'rgb(3,4,12)';

    let w, h;

    const init = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w;
      canvas.height = h;
    };
    init();
    window.addEventListener('resize', init);

    // Camera: side view with slight top-down, no yaw — diagonal comes from canvas rotation
    const tilt = -28 * Math.PI / 180;   // X-axis tilt (side view with a bit of top)
    const cosT = Math.cos(tilt), sinT = Math.sin(tilt);

    // Screen-space diagonal: rotate the entire output ~30° on screen
    const SCREEN_ROTATION = 30 * Math.PI / 180;

    // Pre-compute center offset: project origin (0,0,0) to find where center lands,
    // then offset everything so the ring center sits at screen center
    let centerOffX = 0, centerOffY = 0;

    const CAM_HEIGHT = -100; // camera above the ribbon (negative Y = up)

    const projectRaw = (wx, wy, wz) => {
      const cy = wy - CAM_HEIGHT; // translate Y relative to camera height
      const cz = wz + 400;
      const ey = cy * cosT - cz * sinT;
      const ez = cy * sinT + cz * cosT;
      if (ez < 10) return null;
      const fov = Math.min(w, h) * 1.1;
      const scale = fov / ez;
      const sx = wx * scale;
      const sy = ey * scale;
      const cosR = Math.cos(SCREEN_ROTATION), sinR = Math.sin(SCREEN_ROTATION);
      return { sx: sx * cosR - sy * sinR, sy: sx * sinR + sy * cosR, scale, depth: ez };
    };

    const project = (wx, wy, wz) => {
      const p = projectRaw(wx, wy, wz);
      if (!p) return null;
      return {
        sx: w * 0.5 + p.sx - centerOffX,
        sy: h * 0.55 + p.sy - centerOffY,
        scale: p.scale,
        depth: p.depth
      };
    };

    let lastFrame = 0;

    const draw = (t) => {
      animId = requestAnimationFrame(draw);
      if (t - lastFrame < 50) return;
      lastFrame = t;
      const time = t * 0.00075; // 25% slower globally

      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, w, h);

      // Slow global rotation (very gentle)
      const rot = time * 0.035;

      // Compute center offset so ring center maps to screen center
      const rawCenter = projectRaw(0, 0, 0);
      centerOffX = rawCenter ? rawCenter.sx : 0;
      centerOffY = rawCenter ? rawCenter.sy : 0;

      // --- Ambient glow at center (brighter) + dark vignette outside ---
      const centerP = project(0, 0, 0);
      if (centerP) {
        // Darken edges: vignette pushing darkness outside the ring area
        const vigSize = Math.max(w, h) * 0.7;
        const vig = ctx.createRadialGradient(centerP.sx, centerP.sy, vigSize * 0.35, centerP.sx, centerP.sy, vigSize);
        vig.addColorStop(0, 'rgba(0,0,0,0)');
        vig.addColorStop(0.5, `rgba(0,0,0,${0.15 * alphaScale})`);
        vig.addColorStop(1, `rgba(0,0,0,${0.35 * alphaScale})`);
        ctx.fillStyle = vig;
        ctx.fillRect(0, 0, w, h);

        // Bright glow in the ring zone
        const grd = ctx.createRadialGradient(centerP.sx, centerP.sy, 0, centerP.sx, centerP.sy, Math.max(w, h) * 0.55);
        grd.addColorStop(0, `rgba(140, 200, 255, ${0.55 * alphaScale})`);
        grd.addColorStop(0.08, `rgba(110, 170, 240, ${0.40 * alphaScale})`);
        grd.addColorStop(0.2, `rgba(80, 120, 220, ${0.25 * alphaScale})`);
        grd.addColorStop(0.4, `rgba(110, 80, 200, ${0.12 * alphaScale})`);
        grd.addColorStop(0.6, `rgba(150, 55, 170, ${0.06 * alphaScale})`);
        grd.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = grd;
        ctx.fillRect(0, 0, w, h);
      }

      // --- The ribbon: a ring with width, undulating in Y ---
      // Ring params
      const RADIUS = 212;          // 15% tighter
      const RIBBON_WIDTH = 76;     // 15% tighter
      const ROWS = 44;             // more rows across ribbon width
      const DOTS_AROUND = 680;     // denser squares
      const WAVE_AMP = 30;         // 15% tighter
      const WAVE_FREQ = 2;         // number of wave peaks around the ring

      // Collect all dots for depth sorting
      const allDots = [];

      for (let row = 0; row < ROWS; row++) {
        // Each row is at a different radius (ribbon has width)
        const rowT = row / (ROWS - 1); // 0..1 across ribbon width
        const r = RADIUS - RIBBON_WIDTH * 0.5 + rowT * RIBBON_WIDTH;

        for (let i = 0; i < DOTS_AROUND; i++) {
          const angleT = i / DOTS_AROUND; // 0..1 around the ring
          const angle = angleT * Math.PI * 2 + rot;

          // Per-square variation: pseudo-random hash for organic feel
          const hash = Math.sin(row * 127.1 + i * 311.7) * 43758.5453;
          const jitter = (hash - Math.floor(hash)) * 2 - 1; // -1..1

          // Position on the ring with slight radius jitter (less stiff)
          const radiusJitter = jitter * 0.5;
          const wx = Math.cos(angle) * (r + radiusJitter);
          const wz = Math.sin(angle) * (r + radiusJitter);

          // Ribbon wave + veil-like ripple across the ribbon surface
          const ribbonWave = Math.sin(angle * WAVE_FREQ + time * 0.15) * WAVE_AMP
                           + Math.sin(angle * (WAVE_FREQ + 1) + time * 0.1) * WAVE_AMP * 0.3;
          // Veil: slow ripples that travel across the ribbon width (like fabric in wind)
          const veil = Math.sin(rowT * Math.PI * 3 + angle * 4 + time * 0.25) * 5
                     + Math.sin(rowT * Math.PI * 5 - angle * 2 + time * 0.18) * 3;
          const wy = ribbonWave + veil;

          const p = project(wx, wy, wz);
          if (!p) continue;
          if (p.sx < -10 || p.sx > w + 10 || p.sy < -10 || p.sy > h + 10) continue;

          allDots.push({ p, wy, rowT, angleT, r, angle, jitter });
        }
      }

      // Sort back to front
      allDots.sort((a, b) => b.p.depth - a.p.depth);

      // Draw flat rectangles (dashes tangent to the ring)
      const maxDepth = 1200;
      for (let i = 0; i < allDots.length; i++) {
        const { p, wy, rowT, angle, jitter } = allDots[i];

        const depthNorm = Math.max(0, Math.min(1, 1 - (p.depth - 10) / maxDepth));

        // Square tiles
        const sqSize = (0.8 + depthNorm * 2.5) * p.scale * 0.4;
        const rectW = sqSize;
        const rectH = sqSize;

        // Brighter on wave crests
        const heightNorm = (wy + WAVE_AMP * 1.3) / (WAVE_AMP * 2.6);
        const centerBright = 1 - Math.abs(rowT - 0.5) * 1.2;
        const brightness = 0.05 + depthNorm * 0.45 + heightNorm * 0.3 + centerBright * 0.15;

        // Aemeath colors: cyan accent on wave crests, lavender mid, pink outer
        const cyanPunch = Math.pow(heightNorm, 3); // strong only on brightest crests
        const hue = (260 + rowT * 60 + heightNorm * 15) * (1 - cyanPunch) + 195 * cyanPunch;
        const sat = 55 + heightNorm * 30 + cyanPunch * 25;
        const lit = 55 + brightness * 35;

        const dotAlpha = brightness * 0.5 * alphaScale;
        if (dotAlpha < 0.02) continue;

        // Rotate rectangle to be tangent to the ring (perpendicular to radius)
        // The tangent direction in screen space approximation
        ctx.save();
        ctx.translate(p.sx, p.sy);
        ctx.rotate(angle + Math.PI * 0.5 + SCREEN_ROTATION); // tangent aligned, no random tilt
        ctx.fillStyle = `hsla(${hue}, ${sat}%, ${lit}%, ${dotAlpha})`;
        ctx.fillRect(-rectW * 0.5, -rectH * 0.5, rectW, rectH);
        ctx.restore();
      }

      // --- Sparkle particles floating above/around the ribbon ---
      for (let sp = 0; sp < 60; sp++) {
        const spHash = Math.sin(sp * 191.7) * 43758.5453;
        const spRand = spHash - Math.floor(spHash);
        const spHash2 = Math.sin(sp * 337.3) * 29871.2;
        const spRand2 = spHash2 - Math.floor(spHash2);
        const spAngle = spRand * Math.PI * 2 + rot + time * (0.02 + spRand2 * 0.03);
        const spR = RADIUS - RIBBON_WIDTH * 0.4 + spRand2 * RIBBON_WIDTH * 0.8;
        const spWy = Math.sin(spAngle * WAVE_FREQ + time * 0.15) * WAVE_AMP - 6 - spRand * 25;
        const spP = project(Math.cos(spAngle) * spR, spWy, Math.sin(spAngle) * spR);
        if (!spP) continue;
        if (spP.sx < -5 || spP.sx > w + 5 || spP.sy < -5 || spP.sy > h + 5) continue;
        const twinkle = Math.sin(time * 2.5 + sp * 5.3) * 0.5 + 0.5;
        const spAlpha = twinkle * 0.35 * alphaScale;
        // Mostly lavender-pink, occasional cyan sparkle
        const spHue = spRand < 0.15 ? 192 + spRand * 20 : 250 + spRand * 80;
        const spSize = (1 + twinkle * 2.5) * spP.scale * 0.3;
        ctx.fillStyle = `hsla(${spHue}, 75%, 85%, ${spAlpha})`;
        ctx.fillRect(spP.sx - spSize * 0.5, spP.sy - spSize * 0.5, spSize, spSize);
        ctx.fillStyle = `hsla(${spHue}, 65%, 75%, ${spAlpha * 0.25})`;
        const glowS = spSize * 3;
        ctx.fillRect(spP.sx - glowS * 0.5, spP.sy - glowS * 0.5, glowS, glowS);
      }

      // --- Ribbon ring lines (multiple across the width) ---
      const LINE_ROWS = [0, 0.2, 0.4, 0.6, 0.8, 1.0];
      for (let li = 0; li < LINE_ROWS.length; li++) {
        const rowT_l = LINE_ROWS[li];
        const r = RADIUS - RIBBON_WIDTH * 0.5 + rowT_l * RIBBON_WIDTH;
        const lineAlpha = (li === 0 || li === LINE_ROWS.length - 1 ? 0.1 : 0.05) * alphaScale;

        ctx.beginPath();
        ctx.lineWidth = li === 0 || li === LINE_ROWS.length - 1 ? 1.2 : 0.6;
        let started = false;

        for (let i = 0; i <= 200; i++) {
          const angle = (i / 200) * Math.PI * 2 + rot;
          const wx = Math.cos(angle) * r;
          const wz = Math.sin(angle) * r;
          const veil_l = Math.sin(rowT_l * Math.PI * 3 + angle * 4 + time * 0.25) * 5
                       + Math.sin(rowT_l * Math.PI * 5 - angle * 2 + time * 0.18) * 3;
          const wy = Math.sin(angle * WAVE_FREQ + time * 0.15) * WAVE_AMP
                   + Math.sin(angle * (WAVE_FREQ + 1) + time * 0.1) * WAVE_AMP * 0.3 + veil_l;

          const p = project(wx, wy, wz);
          if (!p) { started = false; continue; }

          if (!started) { ctx.moveTo(p.sx, p.sy); started = true; }
          else ctx.lineTo(p.sx, p.sy);
        }

        // Inner edge cyan, mid lavender, outer pink
        const lineHue = rowT_l < 0.25 ? 195 + rowT_l * 200 : 250 + rowT_l * 60;
        ctx.strokeStyle = `hsla(${lineHue}, 75%, 72%, ${lineAlpha})`;
        ctx.stroke();
        if (li === 0 || li === LINE_ROWS.length - 1) {
          ctx.lineWidth = 5;
          ctx.strokeStyle = `hsla(${lineHue}, 70%, 58%, ${lineAlpha * 0.2})`;
          ctx.stroke();
        }
      }

      // --- Floating lines: loose curves drifting near the ribbon ---
      for (let fl = 0; fl < 10; fl++) {
        const flRadius = RADIUS + RIBBON_WIDTH * (0.5 + fl * 0.12);
        const flYOff = (fl - 5) * 12; // spread above/below
        const flHue = (fl % 4 === 0) ? 195 : 260 + fl * 10; // every 4th line cyan
        const flAlpha = (0.06 + Math.sin(time * 0.2 + fl * 1.3) * 0.03) * alphaScale;

        ctx.beginPath();
        ctx.lineWidth = 0.8;
        let started = false;

        for (let i = 0; i <= 150; i++) {
          const angle = (i / 150) * Math.PI * 2 + rot;
          const drift = Math.sin(angle * 3 + time * 0.12 + fl * 2) * 15;
          const wx = Math.cos(angle) * (flRadius + drift);
          const wz = Math.sin(angle) * (flRadius + drift);
          const wy = Math.sin(angle * WAVE_FREQ + time * 0.15) * WAVE_AMP * 0.4 + flYOff
                   + Math.sin(angle * 5 + time * 0.2 + fl) * 8;

          const p = project(wx, wy, wz);
          if (!p) { started = false; continue; }

          if (!started) { ctx.moveTo(p.sx, p.sy); started = true; }
          else ctx.lineTo(p.sx, p.sy);
        }

        ctx.strokeStyle = `hsla(${flHue}, 75%, 65%, ${flAlpha})`;
        ctx.stroke();
        ctx.lineWidth = 4;
        ctx.strokeStyle = `hsla(${flHue}, 70%, 50%, ${flAlpha * 0.15})`;
        ctx.stroke();
      }

      // --- Inner ribbon: vertical mixer bars (flat on Y=0 plane, no wave) ---
      const INNER_RADIUS = RADIUS * 0.55;
      const INNER_BARS = 540;
      for (let i = 0; i < INNER_BARS; i++) {
        const angleT_b = i / INNER_BARS;
        const angle = angleT_b * Math.PI * 2 + rot;

        const wx = Math.cos(angle) * INNER_RADIUS;
        const wz = Math.sin(angle) * INNER_RADIUS;

        // Each bar has a different height that pulses like a sound mixer
        const hash = Math.sin(i * 173.7) * 43758.5453;
        const barSeed = hash - Math.floor(hash);
        const barHeight = 5 + barSeed * 25 + Math.sin(time * 0.5 + i * 0.6) * 12;

        // Project from flat plane (Y=0), bar extends vertically on screen
        const p = project(wx, 0, wz);
        if (!p) continue;
        if (p.sx < -10 || p.sx > w + 10 || p.sy < -10 || p.sy > h + 10) continue;

        const depthNorm = Math.max(0, Math.min(1, 1 - (p.depth - 10) / maxDepth));
        const barW = (0.8 + depthNorm * 1.5) * p.scale * 0.25;
        const barH = barHeight * p.scale * 0.12;
        const barAlpha = (0.12 + depthNorm * 0.28) * alphaScale;

        // Vertical bars on screen (not rotated)
        const barHue = barSeed < 0.35 ? 192 + barSeed * 15 : 255 + barSeed * 65;
        const barSat = barSeed < 0.35 ? 92 : 75;
        ctx.fillStyle = `hsla(${barHue}, ${barSat}%, 65%, ${barAlpha})`;
        ctx.fillRect(p.sx - barW * 0.5, p.sy - barH, barW, barH);
      }

      // --- Sparkle highlights (frost colors) ---
      for (let i = 0; i < 55; i++) {
        const seed = i * 137.508;
        const angleT_s = (seed * 1.73) % 1;
        const rowT_s = (seed * 0.31) % 1;
        const angle = angleT_s * Math.PI * 2 + rot;
        const r = RADIUS - RIBBON_WIDTH * 0.5 + rowT_s * RIBBON_WIDTH;

        const wx = Math.cos(angle) * r;
        const wz = Math.sin(angle) * r;
        const wy = Math.sin(angle * WAVE_FREQ + time * 0.15) * WAVE_AMP
                 + Math.sin(angle * (WAVE_FREQ + 1) + time * 0.1) * WAVE_AMP * 0.3;

        const p = project(wx, wy, wz);
        if (!p) continue;
        if (p.sx < -5 || p.sx > w + 5 || p.sy < -5 || p.sy > h + 5) continue;

        const pulse = Math.sin(time * (2 + i * 0.12) + seed) * 0.5 + 0.5;
        const sparkAlpha = pulse * 0.5 * alphaScale;
        if (sparkAlpha < 0.05) continue;

        const depthNorm = Math.max(0, Math.min(1, 1 - (p.depth - 10) / maxDepth));
        const sparkSize = (1 + pulse * 1.5) * (0.4 + depthNorm * 0.6);

        ctx.beginPath();
        ctx.arc(p.sx, p.sy, sparkSize, 0, Math.PI * 2);
        // Alternate between lavender and cyan sparkles
        const spkCyan = (i % 3 === 0);
        ctx.fillStyle = spkCyan
          ? `rgba(120, 235, 255, ${sparkAlpha})`
          : `rgba(230, 200, 255, ${sparkAlpha})`;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(p.sx, p.sy, sparkSize * 3, 0, Math.PI * 2);
        ctx.fillStyle = spkCyan
          ? `rgba(80, 220, 255, ${sparkAlpha * 0.15})`
          : `rgba(210, 170, 250, ${sparkAlpha * 0.12})`;
        ctx.fill();
      }

      // --- Flat cyan particles around the ribbon ---
      for (let i = 0; i < 40; i++) {
        const seed = i * 97.31 + 42;
        const aT = ((seed * 2.17) % 1 + time * 0.02 * (0.5 + (seed % 3) * 0.3)) % 1;
        const rT = (seed * 0.47) % 1;
        // Constrain radius to ribbon band with slight scatter outside
        const r = RADIUS - RIBBON_WIDTH * 0.6 + rT * RIBBON_WIDTH * 1.2;
        const angle = aT * Math.PI * 2 + rot;

        const wx = Math.cos(angle) * r;
        const wz = Math.sin(angle) * r;
        // Follow the ribbon wave + slight vertical scatter
        const wy = Math.sin(angle * WAVE_FREQ + time * 0.15) * WAVE_AMP
                 + Math.sin(angle * (WAVE_FREQ + 1) + time * 0.1) * WAVE_AMP * 0.3
                 + Math.sin(time * 0.8 + i * 1.3) * 8 - 4;

        const p = project(wx, wy, wz);
        if (!p) continue;
        if (p.sx < -5 || p.sx > w + 5 || p.sy < -5 || p.sy > h + 5) continue;

        const flicker = Math.sin(time * 1.5 + i * 2.7) * 0.5 + 0.5;
        const pAlpha = (0.15 + flicker * 0.25) * alphaScale;
        if (pAlpha < 0.04) continue;

        const depthNorm = Math.max(0, Math.min(1, 1 - (p.depth - 10) / maxDepth));
        const sz = (1.2 + flicker * 1.0) * (0.3 + depthNorm * 0.7);

        // Flat diamond/square shape
        ctx.save();
        ctx.translate(p.sx, p.sy);
        ctx.rotate(time * 0.4 + i);
        ctx.globalAlpha = pAlpha;
        ctx.fillStyle = `hsl(${192 + (i % 5) * 3}, 92%, ${68 + flicker * 12}%)`;
        ctx.fillRect(-sz, -sz, sz * 2, sz * 2);
        ctx.restore();

        // Soft glow
        ctx.beginPath();
        ctx.arc(p.sx, p.sy, sz * 3, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(80, 225, 255, ${pAlpha * 0.14})`;
        ctx.fill();
      }

      // --- Disc light + Water ripple (linked together) ---
      if (centerP) {
        const RIPPLE_MAX_R = RADIUS + RIBBON_WIDTH;
        const RIPPLE_COUNT = 5;
        const RIPPLE_CYCLE = 20;
        const RIPPLE_AMP = 10;
        const STEPS = 80;
        const BAND_W = 14;

        // Compute all ripple phases first so pulse can read them
        const ripplePhases = [];
        for (let i = 0; i < RIPPLE_COUNT; i++) {
          ripplePhases.push(((time / RIPPLE_CYCLE) + i / RIPPLE_COUNT) % 1);
        }

        // Pulse = driven by the ripple closest to center
        // phase 0 = at center (bright), phase 1 = at edge (dim)
        const nearest = Math.min(...ripplePhases);
        const pulse = 0.4 + 0.45 * Math.cos(nearest * Math.PI * 0.5); // smooth 0.85 at center → 0.4 at edge

        // Large disc glow
        const discSize = Math.max(w, h) * (0.5 + pulse * 0.1);
        const discGrd = ctx.createRadialGradient(centerP.sx, centerP.sy, 0, centerP.sx, centerP.sy, discSize);
        discGrd.addColorStop(0, `rgba(120, 235, 255, ${0.40 * pulse * alphaScale})`);   // cyan core
        discGrd.addColorStop(0.05, `rgba(180, 230, 255, ${0.32 * pulse * alphaScale})`); // transition
        discGrd.addColorStop(0.12, `rgba(235, 200, 255, ${0.22 * pulse * alphaScale})`); // lavender
        discGrd.addColorStop(0.3, `rgba(220, 180, 250, ${0.12 * pulse * alphaScale})`);
        discGrd.addColorStop(0.5, `rgba(225, 155, 235, ${0.06 * pulse * alphaScale})`);  // pink
        discGrd.addColorStop(0.7, `rgba(230, 150, 210, ${0.03 * pulse * alphaScale})`);
        discGrd.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = discGrd;
        ctx.fillRect(0, 0, w, h);

        // --- Holographic Heart of Aemaeth ---
        // Matches reference: soft pink-lavender fill, cyan outline, inner concentric
        // hearts with white/pink strokes, center vertical line with glitch marks.
        const HEART_SIZE = 30 + 5 * pulse;
        const HEART_PTS = 64;

        // Helper: generate projected heart points at a given scale and offset.
        // Modified parametric heart to match reference: fatter lobes (sin^2.3 vs sin^3),
        // shorter tail (compress negative y by 0.7), slightly wider (1.1x).
        const makeHeart = (scale, oxW, oyW) => {
          const pts = [];
          for (let hi = 0; hi <= HEART_PTS; hi++) {
            const t = (hi / HEART_PTS) * Math.PI * 2;
            // sin^2.3 instead of sin^3 → fatter, rounder lobes
            const sinT = Math.sin(t);
            const hx = 16 * Math.sign(sinT) * Math.pow(Math.abs(sinT), 2.3);
            let hy = 13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t);
            // Shorten the tail: compress the bottom portion (negative hy = tail)
            if (hy < 0) hy *= 0.7;
            const wx = hx * HEART_SIZE * scale * 1.1 / 16 + (oxW || 0);
            const wy = -hy * HEART_SIZE * scale / 17 - HEART_SIZE + (oyW || 0);
            const p = project(wx, wy, 0);
            if (!p) return null;
            pts.push(p);
          }
          return pts;
        };

        const drawPath = (pts) => {
          ctx.beginPath();
          ctx.moveTo(pts[0].sx, pts[0].sy);
          for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].sx, pts[i].sy);
          ctx.closePath();
        };

        const heartPts = makeHeart(1, 0, 0);

        if (heartPts) {
          const iridShift = Math.sin(time * 0.5) * 0.5 + 0.5;

          // --- Outer glow (soft cyan bloom) ---
          ctx.save();
          ctx.shadowColor = `rgba(100, 230, 255, ${0.7 * pulse * alphaScale})`;
          ctx.shadowBlur = 30 + pulse * 18;
          drawPath(heartPts);
          ctx.strokeStyle = `rgba(80, 220, 255, ${0.3 * alphaScale})`;
          ctx.lineWidth = 4 + pulse * 2;
          ctx.stroke();
          ctx.restore();

          // --- Soft pink-lavender-blue gradient fill ---
          const bds = heartPts.reduce((b, p) => ({
            x0: Math.min(b.x0, p.sx), x1: Math.max(b.x1, p.sx),
            y0: Math.min(b.y0, p.sy), y1: Math.max(b.y1, p.sy)
          }), { x0: 9999, x1: -9999, y0: 9999, y1: -9999 });

          // Diagonal gradient: top-left pink → bottom-right lavender/blue
          const fillGrd = ctx.createLinearGradient(bds.x0, bds.y0, bds.x1, bds.y1);
          const pA = (0.55 + pulse * 0.15) * alphaScale;
          fillGrd.addColorStop(0, `rgba(${220 + iridShift * 20}, ${180 + iridShift * 30}, ${230 + iridShift * 20}, ${pA})`);
          fillGrd.addColorStop(0.35, `rgba(${230 + iridShift * 15}, ${190 + iridShift * 20}, 255, ${pA * 0.9})`);
          fillGrd.addColorStop(0.65, `rgba(${190 - iridShift * 20}, ${195 + iridShift * 30}, ${255}, ${pA * 0.85})`);
          fillGrd.addColorStop(1, `rgba(${180 + iridShift * 10}, ${190 + iridShift * 20}, ${240 + iridShift * 15}, ${pA * 0.8})`);
          drawPath(heartPts);
          ctx.fillStyle = fillGrd;
          ctx.fill();

          // --- Cyan outline (slightly rough/glitchy) ---
          ctx.save();
          ctx.shadowColor = `rgba(80, 240, 255, ${0.5 * pulse * alphaScale})`;
          ctx.shadowBlur = 10 + pulse * 6;
          // Draw outline with tiny random offsets for glitch texture
          ctx.beginPath();
          for (let i = 0; i <= HEART_PTS; i++) {
            const p = heartPts[i % heartPts.length];
            const glitchX = (Math.sin(i * 73.1 + time * 3) * 0.8);
            const glitchY = (Math.cos(i * 47.7 + time * 2.5) * 0.6);
            if (i === 0) ctx.moveTo(p.sx + glitchX, p.sy + glitchY);
            else ctx.lineTo(p.sx + glitchX, p.sy + glitchY);
          }
          ctx.closePath();
          ctx.strokeStyle = `rgba(${80 + iridShift * 40}, ${230 + iridShift * 20}, 255, ${(0.6 + pulse * 0.3) * alphaScale})`;
          ctx.lineWidth = 2 + pulse * 0.8;
          ctx.stroke();
          ctx.restore();

          // --- Inner concentric hearts (3 layers, progressively smaller) ---
          const innerScales = [0.72, 0.48, 0.28];
          const innerColors = [
            { r: 240, g: 210, b: 255, a: 0.45 }, // light pink-white
            { r: 255, g: 240, b: 255, a: 0.55 }, // brighter white-pink
            { r: 255, g: 255, b: 255, a: 0.6 },  // white core
          ];

          for (let li = 0; li < innerScales.length; li++) {
            const s = innerScales[li];
            // Offset slightly toward center (the heart center is at y = -HEART_SIZE * 0.4 roughly)
            const oyShift = HEART_SIZE * (1 - s) * 0.15;
            const innerH = makeHeart(s, 0, oyShift);
            if (!innerH) continue;

            ctx.save();
            drawPath(heartPts);
            ctx.clip();

            ctx.shadowColor = `rgba(220, 200, 255, ${0.4 * pulse * alphaScale})`;
            ctx.shadowBlur = 6 + pulse * 4;

            // Draw with slight glitch
            ctx.beginPath();
            for (let i = 0; i <= HEART_PTS; i++) {
              const p = innerH[i % innerH.length];
              const gx = Math.sin(i * 53 + time * 2 + li * 2) * 0.5;
              const gy = Math.cos(i * 37 + time * 1.8 + li * 3) * 0.4;
              if (i === 0) ctx.moveTo(p.sx + gx, p.sy + gy);
              else ctx.lineTo(p.sx + gx, p.sy + gy);
            }
            ctx.closePath();

            const c = innerColors[li];
            const shimmer = Math.sin(time * 1.2 + li * 1.5) * 0.15 + 0.85;
            ctx.strokeStyle = `rgba(${c.r}, ${c.g}, ${c.b}, ${c.a * shimmer * alphaScale})`;
            ctx.lineWidth = 1.5 - li * 0.3 + pulse * 0.5;
            ctx.stroke();
            ctx.restore();
          }

          // --- Center vertical line with glitch marks ---
          ctx.save();
          drawPath(heartPts);
          ctx.clip();

          // Vertical center line (from top cleft to tail)
          const topP = project(0, -HEART_SIZE * 1.3, 0);   // cleft area
          const botP = project(0, -HEART_SIZE * 0.05, 0); // near tail
          if (topP && botP) {
            ctx.beginPath();
            const segments = 20;
            for (let si = 0; si <= segments; si++) {
              const frac = si / segments;
              const sx = topP.sx + (botP.sx - topP.sx) * frac;
              const sy = topP.sy + (botP.sy - topP.sy) * frac;
              // Slight jitter
              const jx = Math.sin(si * 11 + time * 4) * 0.6;
              if (si === 0) ctx.moveTo(sx + jx, sy);
              else ctx.lineTo(sx + jx, sy);
            }
            ctx.strokeStyle = `rgba(200, 230, 255, ${0.4 * pulse * alphaScale})`;
            ctx.lineWidth = 1 + pulse * 0.5;
            ctx.shadowColor = `rgba(180, 240, 255, ${0.3 * alphaScale})`;
            ctx.shadowBlur = 5;
            ctx.stroke();

            // Horizontal glitch marks along the line (especially near tail)
            const glitchCount = 6;
            for (let gi = 0; gi < glitchCount; gi++) {
              const gFrac = 0.5 + gi * 0.08 + Math.sin(time * 2.5 + gi) * 0.03;
              if (gFrac > 1) continue;
              const gx = topP.sx + (botP.sx - topP.sx) * gFrac;
              const gy = topP.sy + (botP.sy - topP.sy) * gFrac;
              const gw = 3 + Math.sin(time * 3 + gi * 5) * 2;
              ctx.beginPath();
              ctx.moveTo(gx - gw, gy);
              ctx.lineTo(gx + gw, gy);
              const gAlpha = (0.25 + Math.sin(time * 4 + gi * 3) * 0.15) * alphaScale;
              ctx.strokeStyle = `rgba(120, 240, 255, ${gAlpha})`;
              ctx.lineWidth = 0.8;
              ctx.stroke();
            }
          }
          ctx.restore();

          // --- Glitch: chunky rectangles on the heart's edge, extending outward ---
          const glitchCycle = Math.sin(time * 1.7) * Math.sin(time * 3.1) * Math.sin(time * 0.6);
          const glitchActive = glitchCycle > 0.3;
          const glitchIntensity = glitchActive ? (glitchCycle - 0.3) / 0.7 : 0;

          const pseudoRand = (seed) => {
            const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
            return x - Math.floor(x);
          };

          // Sample the heart's edge at a given parametric t to get world-space (x, y)
          const heartEdge = (t) => {
            const sinT = Math.sin(t);
            const hx = 16 * Math.sign(sinT) * Math.pow(Math.abs(sinT), 2.3);
            let hy = 13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t);
            if (hy < 0) hy *= 0.7;
            const wx = hx * HEART_SIZE * 1.1 / 16;
            const wy = -hy * HEART_SIZE / 17 - HEART_SIZE;
            return { wx, wy };
          };

          // Place rectangles at points along the heart's outline, extending outward
          const baseBlockCount = 4;
          const burstBlockCount = glitchActive ? Math.floor(5 + glitchIntensity * 7) : 0;
          const totalBlocks = baseBlockCount + burstBlockCount;

          for (let gi = 0; gi < totalBlocks; gi++) {
            const isBurst = gi >= baseBlockCount;
            const intensity = isBurst ? glitchIntensity : 0.25 + Math.sin(time * 0.5 + gi) * 0.15;

            const seed = gi * 73.7 + Math.floor(time * (isBurst ? 6 : 1.5)) * 13.1;

            // Pick a point on the heart outline
            const tParam = pseudoRand(seed + 1.1) * Math.PI * 2;
            const edge = heartEdge(tParam);

            // Block dimensions in world units — chunky squares/rectangles
            const blockW = (3 + pseudoRand(seed + 2.2) * 8) * (isBurst ? (1 + glitchIntensity) : 1);
            const blockH = (2 + pseudoRand(seed + 3.3) * 5) * (isBurst ? (1 + glitchIntensity * 0.5) : 1);

            // Extend outward from heart center (away from x=0)
            const outward = Math.sign(edge.wx) || 1;
            const extraPush = (2 + pseudoRand(seed + 4.4) * 6) * intensity;
            const rectX0 = edge.wx + outward * extraPush;
            const rectX1 = rectX0 + outward * blockW;
            const rectY0 = edge.wy - blockH / 2;
            const rectY1 = edge.wy + blockH / 2;

            // Project rectangle corners through 3D
            const p0 = project(Math.min(rectX0, rectX1), rectY0, 0);
            const p1 = project(Math.max(rectX0, rectX1), rectY0, 0);
            const p2 = project(Math.max(rectX0, rectX1), rectY1, 0);
            const p3 = project(Math.min(rectX0, rectX1), rectY1, 0);
            if (!p0 || !p1 || !p2 || !p3) continue;

            const isCyan = pseudoRand(seed + 5.5) > 0.5;
            const col = isCyan ? [80, 230, 255] : [230, 190, 255];
            const blockAlpha = (isBurst ? (0.4 + glitchIntensity * 0.35) : (0.18 + Math.sin(time * 0.8 + gi * 2) * 0.1)) * alphaScale;

            ctx.beginPath();
            ctx.moveTo(p0.sx, p0.sy);
            ctx.lineTo(p1.sx, p1.sy);
            ctx.lineTo(p2.sx, p2.sy);
            ctx.lineTo(p3.sx, p3.sy);
            ctx.closePath();
            ctx.fillStyle = `rgba(${col[0]}, ${col[1]}, ${col[2]}, ${blockAlpha})`;
            ctx.fill();

            // Companion block: opposite color, slightly offset
            if (pseudoRand(seed + 6.6) > 0.5) {
              const col2 = isCyan ? [230, 190, 255] : [80, 230, 255];
              const offY = (pseudoRand(seed + 7.7) - 0.5) * 4;
              const offX = outward * (1 + pseudoRand(seed + 8.8) * 3);
              const smallW = blockW * (0.4 + pseudoRand(seed + 9.9) * 0.4);
              const smallH = blockH * (0.5 + pseudoRand(seed + 10.1) * 0.4);
              const sx0 = Math.min(rectX0, rectX1) + offX;
              const sy0 = rectY0 + offY;
              const q0 = project(sx0, sy0, 0);
              const q1 = project(sx0 + outward * smallW, sy0, 0);
              const q2 = project(sx0 + outward * smallW, sy0 + smallH, 0);
              const q3 = project(sx0, sy0 + smallH, 0);
              if (q0 && q1 && q2 && q3) {
                ctx.beginPath();
                ctx.moveTo(q0.sx, q0.sy);
                ctx.lineTo(q1.sx, q1.sy);
                ctx.lineTo(q2.sx, q2.sy);
                ctx.lineTo(q3.sx, q3.sy);
                ctx.closePath();
                ctx.fillStyle = `rgba(${col2[0]}, ${col2[1]}, ${col2[2]}, ${blockAlpha * 0.6})`;
                ctx.fill();
              }
            }
          }
        }

        // Draw ripple rings using the same phases
        for (let i = 0; i < RIPPLE_COUNT; i++) {
          const phase = ripplePhases[i];
          const r = phase * RIPPLE_MAX_R;
          if (r < 5) continue;

          const fade = Math.sin(phase * Math.PI);
          const alpha = fade * 0.14 * alphaScale;
          if (alpha < 0.005) continue;

          // Inner ripples cyan, mid lavender, outer pink
          const hue = phase < 0.3 ? 195 + phase * 200 : 260 + phase * 60;
          const wy = -RIPPLE_AMP * fade;

          const rOuter = r + BAND_W * 0.5 * fade;
          const rInner = Math.max(0, r - BAND_W * 0.5 * fade);

          // Dark underside — tighter, softer
          const darkBandW = BAND_W * 0.35 * fade;
          const rDarkOuter = r + darkBandW;
          const rDarkInner = Math.max(0, r - darkBandW * 0.3);
          ctx.beginPath();
          let started = false;
          for (let s = 0; s <= STEPS; s++) {
            const a = (s / STEPS) * Math.PI * 2 + rot;
            const p = project(Math.cos(a) * rDarkOuter, wy * 0.3, Math.sin(a) * rDarkOuter);
            if (!p) { started = false; continue; }
            if (!started) { ctx.moveTo(p.sx, p.sy); started = true; }
            else ctx.lineTo(p.sx, p.sy);
          }
          for (let s = STEPS; s >= 0; s--) {
            const a = (s / STEPS) * Math.PI * 2 + rot;
            const p = project(Math.cos(a) * rDarkInner, 0, Math.sin(a) * rDarkInner);
            if (!p) continue;
            ctx.lineTo(p.sx, p.sy);
          }
          ctx.closePath();
          ctx.fillStyle = `hsla(${hue + 10}, 50%, 12%, ${alpha * 0.3})`;
          ctx.fill();

          // Bright top face — tighter
          const topBandW = BAND_W * 0.4 * fade;
          const rTopOuter = r + topBandW;
          const rTopInner = Math.max(0, r - topBandW * 0.5);
          ctx.beginPath();
          started = false;
          for (let s = 0; s <= STEPS; s++) {
            const a = (s / STEPS) * Math.PI * 2 + rot;
            const p = project(Math.cos(a) * rTopOuter, wy, Math.sin(a) * rTopOuter);
            if (!p) { started = false; continue; }
            if (!started) { ctx.moveTo(p.sx, p.sy); started = true; }
            else ctx.lineTo(p.sx, p.sy);
          }
          for (let s = STEPS; s >= 0; s--) {
            const a = (s / STEPS) * Math.PI * 2 + rot;
            const p = project(Math.cos(a) * rTopInner, wy * 0.7, Math.sin(a) * rTopInner);
            if (!p) continue;
            ctx.lineTo(p.sx, p.sy);
          }
          ctx.closePath();
          ctx.fillStyle = `hsla(${hue}, 60%, 48%, ${alpha * 0.4})`;
          ctx.fill();

          // Specular highlight — softer, blurred
          ctx.save();
          ctx.shadowColor = `hsla(${hue - 15}, 80%, 80%, ${alpha * 0.5})`;
          ctx.shadowBlur = 5;
          ctx.beginPath();
          started = false;
          for (let s = 0; s <= STEPS; s++) {
            const a = (s / STEPS) * Math.PI * 2 + rot;
            const p = project(Math.cos(a) * r, wy - 1, Math.sin(a) * r);
            if (!p) { started = false; continue; }
            if (!started) { ctx.moveTo(p.sx, p.sy); started = true; }
            else ctx.lineTo(p.sx, p.sy);
          }
          ctx.strokeStyle = `hsla(${hue - 15}, 75%, 88%, ${alpha * 0.7})`;
          ctx.lineWidth = 0.8 + fade * 1.2;
          ctx.stroke();
          ctx.restore();
        }
      }
    };
    animId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', init);
    };
  }, [oledMode, animationsEnabled]);

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none" style={{zIndex: 1, willChange: 'transform'}} aria-hidden="true" role="presentation" />;
});
ResonanceField.displayName = 'ResonanceField';

// LAYER ALT-2: Augusta Ruins — Ancient golden ruins with sun glow, mist, and floating dust
// Inspired by Rinascita: warm amber tones, stone pillars/arches, atmospheric haze, golden sunlight
const AugustaRuins = memo(({ oledMode, animationsEnabled = 'on' }) => {
  const canvasRef = useRef(null);
  useEffect(() => {
    if (animationsEnabled === 'off' || animationsEnabled === false) {
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let animId;

    const isFull = animationsEnabled === 'full';
    const alphaScale = isFull ? 1.4 : 1.0;
    const bgBase = oledMode ? [0, 0, 0] : [12, 8, 4];

    let w, h;

    const init = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w;
      canvas.height = h;
    };
    init();
    window.addEventListener('resize', init);

    // Pseudo-random hash function for deterministic randomness
    const hash = (n) => { const s = Math.sin(n) * 43758.5453; return s - Math.floor(s); };

    // Burning ash particles
    const ASH_COUNT = 150;
    const ashes = [];
    for (let i = 0; i < ASH_COUNT; i++) {
      ashes.push({
        x: hash(i * 173.7),
        y: hash(i * 311.3),
        size: 1.0 + hash(i * 547.1) * 3.5,
        speed: 0.15 + hash(i * 631.9) * 0.5,   // slower rise
        drift: hash(i * 419.7) * 6.28,
        wobble: 0.3 + hash(i * 293.1) * 0.7,    // horizontal wobble amount
        glowPhase: hash(i * 761.3) * 6.28,       // ember pulse phase
        ember: hash(i * 853.1) > 0.4,            // glowing ember vs dark ash
        rotation: hash(i * 199.9) * 6.28,
        rotSpeed: (hash(i * 337.7) - 0.5) * 2,
      });
    }

    // Mist layers
    const MIST_COUNT = 6;
    const mistLayers = [];
    for (let i = 0; i < MIST_COUNT; i++) {
      mistLayers.push({
        yNorm: 0.55 + hash(i * 197.3) * 0.4,
        speed: 0.01 + hash(i * 283.1) * 0.03,
        opacity: 0.04 + hash(i * 367.9) * 0.08,
        scale: 0.15 + hash(i * 431.7) * 0.2,
      });
    }

    let lastFrame = 0;

    const draw = (t) => {
      animId = requestAnimationFrame(draw);
      if (t - lastFrame < 50) return;
      lastFrame = t;
      const time = t * 0.0005;

      // --- Base: dark warm gradient ---
      const grd = ctx.createLinearGradient(0, 0, 0, h);
      if (oledMode) {
        grd.addColorStop(0, 'rgb(0,0,0)');
        grd.addColorStop(0.4, 'rgb(3,2,1)');
        grd.addColorStop(1, 'rgb(0,0,0)');
      } else {
        grd.addColorStop(0, 'rgb(18,12,6)');
        grd.addColorStop(0.3, 'rgb(10,7,4)');
        grd.addColorStop(0.7, 'rgb(8,5,3)');
        grd.addColorStop(1, 'rgb(5,3,2)');
      }
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, w, h);

      // --- All light rendered with blur ---
      ctx.save();
      ctx.filter = 'blur(6px)';

      // --- Sun/Vortex glow (top center) ---
      const sunX = w * 0.5;
      const sunY = h * 0.19;
      const sunPulse = 1 + Math.sin(time * 0.3) * 0.08;

      // Outer atmospheric haze
      const haze = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, Math.max(w, h) * 0.9);
      haze.addColorStop(0, `rgba(255, 210, 80, ${0.30 * alphaScale * sunPulse})`);
      haze.addColorStop(0.08, `rgba(255, 170, 50, ${0.20 * alphaScale})`);
      haze.addColorStop(0.2, `rgba(220, 120, 20, ${0.10 * alphaScale})`);
      haze.addColorStop(0.45, `rgba(150, 60, 10, ${0.05 * alphaScale})`);
      haze.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = haze;
      ctx.fillRect(0, 0, w, h);

      // Inner sun core — brighter, more intense
      const core = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, w * 0.1);
      core.addColorStop(0, `rgba(255, 250, 220, ${0.7 * alphaScale * sunPulse})`);
      core.addColorStop(0.2, `rgba(255, 220, 120, ${0.45 * alphaScale})`);
      core.addColorStop(0.6, `rgba(255, 170, 50, ${0.15 * alphaScale})`);
      core.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = core;
      ctx.fillRect(0, 0, w, h);

      // Inner sun — tight bright disc with secondary pulse
      const innerPulse = 1 + Math.sin(time * 0.55 + 1.2) * 0.12;
      const innerR = w * 0.028 * innerPulse;
      const inner = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, innerR);
      inner.addColorStop(0, `rgba(255, 255, 248, ${0.92 * alphaScale * innerPulse})`);
      inner.addColorStop(0.25, `rgba(255, 248, 220, ${0.7 * alphaScale * innerPulse})`);
      inner.addColorStop(0.55, `rgba(255, 230, 160, ${0.35 * alphaScale})`);
      inner.addColorStop(0.8, `rgba(255, 200, 100, ${0.1 * alphaScale})`);
      inner.addColorStop(1, 'rgba(255, 180, 60, 0)');
      ctx.fillStyle = inner;
      ctx.beginPath();
      ctx.arc(sunX, sunY, innerR, 0, Math.PI * 2);
      ctx.fill();

      // --- Swirling vortex ring around sun ---
      const vortexR = Math.min(w, h) * 0.14;
      const vortexRot = time * 0.12;
      ctx.save();
      ctx.translate(sunX, sunY);
      // Draw swirling cloud ring segments
      for (let i = 0; i < 40; i++) {
        const angle = (i / 40) * Math.PI * 2 + vortexRot;
        const wobble = Math.sin(angle * 3 + time * 0.5) * vortexR * 0.12;
        const rx = Math.cos(angle) * (vortexR + wobble);
        const ry = Math.sin(angle) * (vortexR * 0.45 + wobble * 0.4); // elliptical — viewed at angle
        const segSize = vortexR * (0.08 + Math.sin(angle * 2 + time * 0.8) * 0.03);
        const segAlpha = (0.08 + Math.sin(angle * 4 + time * 0.6) * 0.04) * alphaScale;
        const segGrd = ctx.createRadialGradient(rx, ry, 0, rx, ry, segSize);
        segGrd.addColorStop(0, `rgba(255, 180, 60, ${segAlpha})`);
        segGrd.addColorStop(0.5, `rgba(200, 100, 20, ${segAlpha * 0.4})`);
        segGrd.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = segGrd;
        ctx.fillRect(rx - segSize, ry - segSize, segSize * 2, segSize * 2);
      }
      // Thin bright ring line
      ctx.beginPath();
      ctx.ellipse(0, 0, vortexR, vortexR * 0.45, 0, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(255, 200, 100, ${0.12 * alphaScale})`;
      ctx.lineWidth = 2;
      ctx.stroke();
      // Second ring, slightly larger, dimmer
      ctx.beginPath();
      ctx.ellipse(0, 0, vortexR * 1.25, vortexR * 0.55, 0, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(255, 160, 60, ${0.06 * alphaScale})`;
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.restore();

      // --- Golden energy halo rings (horizontal, expanding) ---
      for (let ring = 0; ring < 3; ring++) {
        const ringPhase = (time * 0.15 + ring * 2.1) % 6.28;
        const ringExpand = (Math.sin(ringPhase) * 0.5 + 0.5);
        const ringR = vortexR * (0.6 + ringExpand * 1.2);
        const ringAlpha = (0.06 - ringExpand * 0.04) * alphaScale;
        if (ringAlpha < 0.005) continue;
        ctx.beginPath();
        ctx.ellipse(sunX, sunY, ringR, ringR * 0.35, 0, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255, 190, 80, ${ringAlpha})`;
        ctx.lineWidth = 1.5 - ringExpand * 0.8;
        ctx.stroke();
      }

      // --- God rays (dramatic light shafts from sun/vortex) ---
      const RAY_COUNT = 12;
      for (let i = 0; i < RAY_COUNT; i++) {
        const rayAngle = (i / RAY_COUNT) * Math.PI * 1.2 - Math.PI * 0.1 + Math.sin(time * 0.12 + i * 1.7) * 0.06;
        const rayLen = h * (0.5 + hash(i * 811.3) * 0.5);
        const rayWidth = w * (0.01 + hash(i * 937.1) * 0.03);
        const rayAlpha = (0.025 + Math.sin(time * 0.18 + i * 2.1) * 0.015) * alphaScale;

        ctx.save();
        ctx.translate(sunX, sunY);
        ctx.rotate(rayAngle - Math.PI * 0.5);

        const rayGrd = ctx.createLinearGradient(0, 0, 0, rayLen);
        rayGrd.addColorStop(0, `rgba(255, 200, 100, ${rayAlpha * 2.5})`);
        rayGrd.addColorStop(0.15, `rgba(255, 170, 60, ${rayAlpha * 1.5})`);
        rayGrd.addColorStop(0.5, `rgba(255, 140, 40, ${rayAlpha * 0.5})`);
        rayGrd.addColorStop(1, 'rgba(200, 100, 20, 0)');
        ctx.fillStyle = rayGrd;
        ctx.beginPath();
        ctx.moveTo(-rayWidth * 0.2, 0);
        ctx.lineTo(rayWidth * 0.2, 0);
        ctx.lineTo(rayWidth * 2, rayLen);
        ctx.lineTo(-rayWidth * 2, rayLen);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }

      // --- Horizontal lens flare streak (anamorphic) ---
      const flareAlpha = (0.05 + Math.sin(time * 0.25) * 0.025) * alphaScale;
      // Primary soft flare band
      const flareGrd = ctx.createLinearGradient(0, sunY, w, sunY);
      flareGrd.addColorStop(0, 'rgba(255, 160, 40, 0)');
      flareGrd.addColorStop(0.25, `rgba(255, 190, 80, ${flareAlpha * 0.3})`);
      flareGrd.addColorStop(0.5, `rgba(255, 220, 140, ${flareAlpha * 0.8})`);
      flareGrd.addColorStop(0.75, `rgba(255, 190, 80, ${flareAlpha * 0.3})`);
      flareGrd.addColorStop(1, 'rgba(255, 160, 40, 0)');
      ctx.fillStyle = flareGrd;
      ctx.fillRect(0, sunY - h * 0.015, w, h * 0.03);
      // Secondary wider, dimmer band
      ctx.globalAlpha = 0.3;
      ctx.fillRect(0, sunY - h * 0.04, w, h * 0.08);
      ctx.globalAlpha = 1;

      // End blur for all light
      ctx.restore();

      // --- Dramatic clouds — always horizontal, perspective via squash only ---
      {
        // Cloud banks: wide horizontal masses, no rotation
        // Perspective: clouds lower on screen (further from sun) get flatter
        const sunYn = 0.19; // match sunY
        const cloudDefs = [
          // { cx, cy (normalized), widthN, heightN } — always horizontal
          // Left bank — large masses
          { cx: 0.04, cy: 0.06, wN: 0.20, hN: 0.055 },
          { cx: -0.03, cy: 0.14, wN: 0.22, hN: 0.05 },
          { cx: 0.10, cy: 0.22, wN: 0.19, hN: 0.045 },
          { cx: -0.05, cy: 0.29, wN: 0.20, hN: 0.04 },
          { cx: 0.07, cy: 0.36, wN: 0.17, hN: 0.035 },
          { cx: -0.02, cy: 0.43, wN: 0.18, hN: 0.03 },
          { cx: 0.13, cy: 0.48, wN: 0.15, hN: 0.025 },
          // Right bank — large masses
          { cx: 0.96, cy: 0.05, wN: 0.19, hN: 0.055 },
          { cx: 1.03, cy: 0.13, wN: 0.21, hN: 0.05 },
          { cx: 0.90, cy: 0.21, wN: 0.18, hN: 0.045 },
          { cx: 1.05, cy: 0.28, wN: 0.19, hN: 0.04 },
          { cx: 0.93, cy: 0.35, wN: 0.16, hN: 0.035 },
          { cx: 1.02, cy: 0.42, wN: 0.17, hN: 0.03 },
          { cx: 0.87, cy: 0.47, wN: 0.14, hN: 0.025 },
          // Mid-left fills
          { cx: 0.18, cy: 0.10, wN: 0.14, hN: 0.04 },
          { cx: 0.20, cy: 0.32, wN: 0.12, hN: 0.03 },
          { cx: 0.15, cy: 0.40, wN: 0.13, hN: 0.028 },
          // Mid-right fills
          { cx: 0.82, cy: 0.09, wN: 0.13, hN: 0.04 },
          { cx: 0.80, cy: 0.31, wN: 0.12, hN: 0.03 },
          { cx: 0.85, cy: 0.39, wN: 0.11, hN: 0.028 },
          // Wisps near vortex
          { cx: 0.30, cy: 0.04, wN: 0.10, hN: 0.028 },
          { cx: 0.70, cy: 0.03, wN: 0.09, hN: 0.025 },
          { cx: 0.25, cy: 0.12, wN: 0.09, hN: 0.022 },
          { cx: 0.75, cy: 0.11, wN: 0.09, hN: 0.022 },
          { cx: 0.35, cy: 0.18, wN: 0.08, hN: 0.02 },
          { cx: 0.65, cy: 0.17, wN: 0.08, hN: 0.02 },
          // Low horizon wisps
          { cx: 0.30, cy: 0.45, wN: 0.14, hN: 0.022 },
          { cx: 0.50, cy: 0.50, wN: 0.18, hN: 0.02 },
          { cx: 0.70, cy: 0.46, wN: 0.13, hN: 0.022 },
        ];

        for (let ci = 0; ci < cloudDefs.length; ci++) {
          const cd = cloudDefs[ci];
          const drift = Math.sin(time * 0.05 + ci * 2.3) * 0.008;
          const cxP = (cd.cx + drift) * w;
          const cyP = cd.cy * h;

          // Perspective: further from sun → squash height, stretch width
          const vpDist = Math.abs(cd.cy - sunYn);
          const perspSquash = Math.max(0.3, 1 - vpDist * 1.5);
          const rxP = cd.wN * w * (1 + vpDist * 0.6);
          const ryP = cd.hN * h * perspSquash;

          // Sun-lit direction
          const dxS = cxP - sunX, dyS = cyP - sunY;
          const distS = Math.sqrt(dxS * dxS + dyS * dyS) || 1;
          const litDirX = -dxS / distS;
          const litDirY = -dyS / distS;

          // Build cloud from many overlapping horizontal puffs
          // More puffs along the top edge for billowy cauliflower shape
          const puffCount = 8 + Math.floor(hash(ci * 137.3) * 5);
          for (let pi = 0; pi < puffCount; pi++) {
            const pH = hash(ci * 100 + pi * 71.3);
            const pH2 = hash(ci * 100 + pi * 91.7);
            const pH3 = hash(ci * 100 + pi * 53.1);
            const pH4 = hash(ci * 100 + pi * 41.9);

            // Puffs spread horizontally, clustered toward top
            const pOx = (pH - 0.5) * rxP * 1.6;
            // Bias upward: top-heavy billowy shape
            const yBias = -0.3 + pH2 * 0.9; // range -0.3 to 0.6 (more above center)
            const pOy = yBias * ryP;

            // Puff size: wider than tall, larger puffs near the top
            const topBonus = (1 - yBias) * 0.3; // bigger near top
            const pW = rxP * (0.25 + pH3 * 0.25 + topBonus);
            const pH_ = ryP * (0.5 + pH4 * 0.5);

            // Use ellipse scaling for flat horizontal puffs
            const pR = Math.max(pW, pH_);
            ctx.save();
            ctx.translate(cxP + pOx, cyP + pOy);
            ctx.rotate(-5 * Math.PI / 180); // rotate clouds upward 5°
            ctx.scale(pW / pR, pH_ / pR);

            const cGrd = ctx.createRadialGradient(0, 0, pR * 0.05, 0, 0, pR);
            cGrd.addColorStop(0, `rgba(42, 32, 24, ${0.35 * alphaScale})`);
            cGrd.addColorStop(0.3, `rgba(30, 22, 15, ${0.28 * alphaScale})`);
            cGrd.addColorStop(0.65, `rgba(18, 12, 8, ${0.14 * alphaScale})`);
            cGrd.addColorStop(1, 'rgba(10, 6, 3, 0)');
            ctx.fillStyle = cGrd;
            ctx.fillRect(-pR, -pR, pR * 2, pR * 2);
            ctx.restore();
          }

          // Sun-lit highlight on edge facing sun
          const litStr = Math.max(0, 1 - distS / (w * 0.5));
          if (litStr > 0.01) {
            const litGrd = ctx.createRadialGradient(
              cxP + litDirX * rxP * 0.25,
              cyP + litDirY * ryP * 0.25,
              rxP * 0.05,
              cxP, cyP,
              rxP * 0.8
            );
            litGrd.addColorStop(0, `rgba(255, 200, 100, ${0.18 * litStr * alphaScale})`);
            litGrd.addColorStop(0.25, `rgba(255, 160, 60, ${0.10 * litStr * alphaScale})`);
            litGrd.addColorStop(0.55, `rgba(200, 100, 30, ${0.04 * litStr * alphaScale})`);
            litGrd.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.fillStyle = litGrd;
            ctx.fillRect(cxP - rxP, cyP - ryP, rxP * 2, ryP * 2);
          }
        }
      }

      // ============================================================
      // 4 horizontal layers (each 25% of h):
      //   Layer 3 (top):    0%–25%    — sky / sun area
      //   Layer 2:          25%–50%   — mid sky / structures
      //   Layer 1:          50%–75%   — rocks (far, smaller, lighter)
      //   Layer 0 (bottom): 75%–100%  — rocks (near, bigger, darker)
      // ============================================================

      // ===== BATTLEGROUND — ground-plan projected sword field =====
      {
        const W = canvas.width, H = canvas.height;
        const hY = H * 0.68; // low horizon — big sky, low camera feel
        const rng = (i, off) => { const s = Math.sin(i * 153.7 + off * 267.3) * 51291.1; return s - Math.floor(s); };

        // --- OPAQUE SKY (lighter, more luminous) ---
        const sk = ctx.createLinearGradient(0, 0, 0, hY);
        sk.addColorStop(0,    'rgb(35,25,55)');
        sk.addColorStop(0.08, 'rgb(55,35,68)');
        sk.addColorStop(0.18, 'rgb(95,55,78)');
        sk.addColorStop(0.30, 'rgb(155,80,82)');
        sk.addColorStop(0.45, 'rgb(210,120,85)');
        sk.addColorStop(0.60, 'rgb(240,160,90)');
        sk.addColorStop(0.75, 'rgb(252,195,100)');
        sk.addColorStop(0.88, 'rgb(255,220,120)');
        sk.addColorStop(1,    'rgb(255,240,160)');
        ctx.fillStyle = sk;
        ctx.fillRect(0, 0, W, hY + 1);

        // === SUN DISC with bright core ===
        const sunX = W * 0.5, sunY = H * 0.3;
        const sunR = H * 0.08;
        // Outer glow halo
        const sunHalo = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, sunR * 5);
        sunHalo.addColorStop(0, 'rgba(255,250,200,0.5)');
        sunHalo.addColorStop(0.15, 'rgba(255,230,150,0.3)');
        sunHalo.addColorStop(0.4, 'rgba(255,200,100,0.1)');
        sunHalo.addColorStop(1, 'rgba(255,160,60,0)');
        ctx.fillStyle = sunHalo;
        ctx.fillRect(0, 0, W, hY + 1);
        // Bright sun disc
        const sunDisc = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, sunR);
        sunDisc.addColorStop(0, 'rgba(255,255,240,0.95)');
        sunDisc.addColorStop(0.3, 'rgba(255,245,200,0.85)');
        sunDisc.addColorStop(0.7, 'rgba(255,225,140,0.5)');
        sunDisc.addColorStop(1, 'rgba(255,200,100,0)');
        ctx.fillStyle = sunDisc;
        ctx.beginPath(); ctx.arc(sunX, sunY, sunR * 1.5, 0, Math.PI * 2); ctx.fill();

        // === SUN RAYS (god rays fanning out) ===
        const rayCount = 14;
        for (let ri = 0; ri < rayCount; ri++) {
          const angle = (ri / rayCount) * Math.PI * 2 + Math.sin(time * 0.15 + ri) * 0.04;
          const rayLen = H * (0.25 + rng(ri, 200) * 0.2);
          const rayW = 0.035 + rng(ri, 201) * 0.025;
          const rayAlpha = 0.06 + rng(ri, 202) * 0.06;
          const cosR = Math.cos(angle), sinR = Math.sin(angle);
          const ex = sunX + cosR * rayLen, ey = sunY + sinR * rayLen;
          // Tapered ray
          const perpX = -sinR * rayW * rayLen * 0.5;
          const perpY = cosR * rayW * rayLen * 0.5;
          const rayGrad = ctx.createLinearGradient(sunX, sunY, ex, ey);
          rayGrad.addColorStop(0, 'rgba(255,240,170,' + rayAlpha.toFixed(3) + ')');
          rayGrad.addColorStop(0.5, 'rgba(255,210,120,' + (rayAlpha * 0.4).toFixed(3) + ')');
          rayGrad.addColorStop(1, 'rgba(255,180,80,0)');
          ctx.beginPath();
          ctx.moveTo(sunX - perpX * 0.3, sunY - perpY * 0.3);
          ctx.lineTo(sunX + perpX * 0.3, sunY + perpY * 0.3);
          ctx.lineTo(ex + perpX, ey + perpY);
          ctx.lineTo(ex - perpX, ey - perpY);
          ctx.closePath();
          ctx.fillStyle = rayGrad;
          ctx.fill();
        }

        // === DARK STORM CLOUDS — reference style: massive, dark, swirling ===
        // Clouds frame the sun opening — thick dark banks with orange fire underglow
        // Like the reference: dark ominous masses covering most of sky, lit from below
        {
          // Large cloud banks — arranged to frame sun opening in center
          const stormClouds = [
            // Top edge — very dark, massive
            { cx: 0.15, cy: 0.04, w: 0.50, h: 0.12, op: 0.88, glow: 0.15 },
            { cx: 0.75, cy: 0.03, w: 0.55, h: 0.13, op: 0.90, glow: 0.12 },
            { cx: 0.50, cy: 0.02, w: 0.60, h: 0.10, op: 0.92, glow: 0.08 },
            // Upper banks — thick dark masses
            { cx: 0.08, cy: 0.12, w: 0.45, h: 0.14, op: 0.85, glow: 0.18 },
            { cx: 0.88, cy: 0.10, w: 0.40, h: 0.13, op: 0.86, glow: 0.16 },
            { cx: 0.35, cy: 0.08, w: 0.38, h: 0.11, op: 0.82, glow: 0.14 },
            { cx: 0.65, cy: 0.09, w: 0.42, h: 0.12, op: 0.84, glow: 0.15 },
            // Mid sky — swirling masses framing the sun gap
            { cx: 0.05, cy: 0.22, w: 0.38, h: 0.16, op: 0.80, glow: 0.25 },
            { cx: 0.92, cy: 0.20, w: 0.35, h: 0.15, op: 0.78, glow: 0.22 },
            { cx: 0.22, cy: 0.18, w: 0.30, h: 0.12, op: 0.75, glow: 0.28 },
            { cx: 0.78, cy: 0.17, w: 0.32, h: 0.13, op: 0.76, glow: 0.26 },
            // Around sun — thinner, more orange glow, framing the opening
            { cx: 0.15, cy: 0.32, w: 0.28, h: 0.14, op: 0.65, glow: 0.40 },
            { cx: 0.85, cy: 0.30, w: 0.30, h: 0.13, op: 0.68, glow: 0.38 },
            { cx: 0.30, cy: 0.28, w: 0.22, h: 0.10, op: 0.55, glow: 0.45 },
            { cx: 0.70, cy: 0.27, w: 0.24, h: 0.11, op: 0.58, glow: 0.42 },
            // Lower wisps near horizon — orange-lit from below
            { cx: 0.10, cy: 0.50, w: 0.35, h: 0.10, op: 0.45, glow: 0.55 },
            { cx: 0.90, cy: 0.48, w: 0.30, h: 0.09, op: 0.42, glow: 0.52 },
            { cx: 0.40, cy: 0.55, w: 0.25, h: 0.08, op: 0.35, glow: 0.58 },
            { cx: 0.60, cy: 0.52, w: 0.28, h: 0.09, op: 0.38, glow: 0.55 },
            { cx: 0.20, cy: 0.65, w: 0.30, h: 0.08, op: 0.30, glow: 0.60 },
            { cx: 0.80, cy: 0.62, w: 0.25, h: 0.07, op: 0.28, glow: 0.58 },
          ];
          for (let dci = 0; dci < stormClouds.length; dci++) {
            const dc = stormClouds[dci];
            const cx = dc.cx * W, cy = dc.cy * hY;
            const cw = dc.w * W, ch = dc.h * hY;
            // Many overlapping puffs for thick, volumetric look
            const puffCount = 7 + Math.floor(rng(dci, 210) * 5);
            for (let pi = 0; pi < puffCount; pi++) {
              const px = cx + (rng(pi + dci * 13, 211) - 0.5) * cw * 0.9;
              const py = cy + (rng(pi + dci * 13, 212) - 0.5) * ch * 0.7;
              const pr = cw * (0.12 + rng(pi + dci * 13, 213) * 0.18);

              // Dark cloud body — very dark grey-black
              const dg = ctx.createRadialGradient(px, py, 0, px, py, pr);
              dg.addColorStop(0, 'rgba(12,10,16,' + dc.op.toFixed(3) + ')');
              dg.addColorStop(0.35, 'rgba(18,14,22,' + (dc.op * 0.7).toFixed(3) + ')');
              dg.addColorStop(0.7, 'rgba(22,18,26,' + (dc.op * 0.3).toFixed(3) + ')');
              dg.addColorStop(1, 'rgba(25,20,30,0)');
              ctx.fillStyle = dg;
              ctx.save(); ctx.translate(px, py); ctx.scale(1, ch / cw * 2.2);
              ctx.beginPath(); ctx.arc(0, 0, pr, 0, Math.PI * 2); ctx.fill();
              ctx.restore();

              // Orange/fire volumetric underglow — lit from sun below
              const glowY = py + pr * 0.4;
              const og = ctx.createRadialGradient(px, glowY, 0, px, glowY, pr * 0.7);
              og.addColorStop(0, 'rgba(255,120,30,' + (dc.glow * 0.4).toFixed(3) + ')');
              og.addColorStop(0.3, 'rgba(255,80,20,' + (dc.glow * 0.2).toFixed(3) + ')');
              og.addColorStop(0.6, 'rgba(200,50,10,' + (dc.glow * 0.08).toFixed(3) + ')');
              og.addColorStop(1, 'rgba(150,30,5,0)');
              ctx.fillStyle = og;
              ctx.save(); ctx.translate(px, glowY); ctx.scale(1, ch / cw * 1.8);
              ctx.beginPath(); ctx.arc(0, 0, pr * 0.7, 0, Math.PI * 2); ctx.fill();
              ctx.restore();
            }
          }
        }

        // Solid dark ground fill to bottom
        ctx.fillStyle = 'rgb(14,9,6)';
        ctx.fillRect(0, hY, W, H - hY);

        // (Old ground layers, textures, cracks, mountains removed — terrain mesh handles all)

        // ============================================
        // 3D TERRAIN HEIGHTMAP — relief mesh with lighting
        // ============================================
        // Static wave vectors define 2D heightmap h(x,z)
        // Rendered as perspective-projected quad strips, back-to-front
        // Lit by sun direction with shadows/highlights showing form
        // Terrain wave vectors (shared with sword placement for height sampling)
        const tWaves = [
            { fx: 3.5, fz: 2.8, amp: 0.28, px: 0.0, pz: 0.0 },
            { fx: 6.0, fz: 5.0, amp: 0.22, px: 2.1, pz: 1.4 },
            { fx: 9.0, fz: 7.5, amp: 0.16, px: 4.7, pz: 3.2 },
            { fx: 12.0, fz: 10.0, amp: 0.10, px: 1.3, pz: 5.1 },
            { fx: 16.0, fz: 13.0, amp: 0.07, px: 3.8, pz: 0.7 },
            { fx: 20.0, fz: 16.0, amp: 0.04, px: 5.5, pz: 2.9 },
            { fx: 11.0, fz: 18.0, amp: 0.03, px: 0.9, pz: 4.3 },
          ];

        const terrH = (wx, wz) => {
          let h = 0;
          for (const w of tWaves) {
            h += Math.sin(wx * w.fx + w.px) * Math.sin(wz * w.fz + w.pz) * w.amp;
          }
          return h;
        };

        // Terrain mesh rendering block
        {
          // Grid dimensions — cover entire ground plane including foreground
          const TX = 70;   // columns (X subdivisions)
          const TZ = 70;   // rows (Z subdivisions, back to front)
          const tExtentX = 120;  // world X range covers full screen
          const tZnear = 0.02;   // extremely close — terrain must touch screen bottom
          const tZfar = 90;      // farthest Z row

          // Camera/projection (reuse existing system params)
          const tCamH = 0.3; // very low camera, ground-hugging
          const tFocal = W * 0.7;

          // Sun direction for terrain lighting (toward horizon center, from above)
          const sunDirX = 0.0;
          const sunDirY = 0.5;
          const sunDirZ = 0.8;
          const sdLen = Math.sqrt(sunDirX * sunDirX + sunDirY * sunDirY + sunDirZ * sunDirZ);
          const sdx = sunDirX / sdLen, sdy = sunDirY / sdLen, sdz = sunDirZ / sdLen;

          // Project world (wx, wy, wz) → screen (sx, sy)
          const tProj = (wx, wy, wz) => ({
            x: W * 0.5 + wx * tFocal / wz,
            y: hY + (tCamH - wy) * tFocal / wz
          });

          // Build heightmap grid
          const grid = []; // grid[iz][ix] = { wx, wy, wz, sx, sy }
          for (let iz = 0; iz <= TZ; iz++) {
            const row = [];
            const zt = iz / TZ;
            const wz = tZfar - (tZfar - tZnear) * zt; // far to near
            for (let ix = 0; ix <= TX; ix++) {
              const xt = ix / TX;
              const wx = (xt * 2 - 1) * tExtentX;
              const wy = terrH(wx, wz);
              const scr = tProj(wx, wy, wz);
              row.push({ wx, wy, wz, x: scr.x, y: scr.y });
            }
            grid.push(row);
          }

          // Render quads back-to-front (painter's algorithm)
          // Earth tone base colors
          const tBaseR = 45, tBaseG = 32, tBaseB = 24;

          for (let iz = 0; iz < TZ; iz++) {
            for (let ix = 0; ix < TX; ix++) {
              const p00 = grid[iz][ix];
              const p10 = grid[iz][ix + 1];
              const p01 = grid[iz + 1][ix];
              const p11 = grid[iz + 1][ix + 1];

              // Skip quads entirely off screen
              const minX = Math.min(p00.x, p10.x, p01.x, p11.x);
              const maxX = Math.max(p00.x, p10.x, p01.x, p11.x);
              if (maxX < -10 || minX > W + 10) continue;
              const minY = Math.min(p00.y, p10.y, p01.y, p11.y);
              if (minY > H + 10) continue;

              // Approximate surface normal via cross product of diagonals
              // World-space vectors
              const dAx = p11.wx - p00.wx, dAy = p11.wy - p00.wy, dAz = p11.wz - p00.wz;
              const dBx = p10.wx - p01.wx, dBy = p10.wy - p01.wy, dBz = p10.wz - p01.wz;
              let nx = dAy * dBz - dAz * dBy;
              let ny = dAz * dBx - dAx * dBz;
              let nz = dAx * dBy - dAy * dBx;
              const nl = Math.sqrt(nx * nx + ny * ny + nz * nz) || 1;
              nx /= nl; ny /= nl; nz /= nl;
              // Flip normal to face upward
              if (ny < 0) { nx = -nx; ny = -ny; nz = -nz; }

              // Diffuse lighting
              const dot = nx * sdx + ny * sdy + nz * sdz;
              const diff = Math.max(0, dot);

              // Distance fog (further = more faded toward atmosphere)
              const avgZ = (p00.wz + p11.wz) * 0.5;
              const fogT = Math.pow(Math.min(1, (avgZ - tZnear) / (tZfar - tZnear)), 1.2);

              // Combine lighting
              const ambient = 0.18;
              const light = ambient + diff * 0.82;

              // Color: warm earth tones, modulated by height and light
              const avgH = (p00.wy + p10.wy + p01.wy + p11.wy) * 0.25;
              const hBright = 0.85 + avgH * 0.4; // higher = slightly brighter
              const r = Math.round(Math.min(255, tBaseR * light * hBright * (1 - fogT * 0.5) + fogT * 35));
              const g = Math.round(Math.min(255, tBaseG * light * hBright * (1 - fogT * 0.5) + fogT * 22));
              const b = Math.round(Math.min(255, tBaseB * light * hBright * (1 - fogT * 0.5) + fogT * 16));

              // Draw quad
              ctx.beginPath();
              ctx.moveTo(p00.x, p00.y);
              ctx.lineTo(p10.x, p10.y);
              ctx.lineTo(p11.x, p11.y);
              ctx.lineTo(p01.x, p01.y);
              ctx.closePath();
              ctx.fillStyle = 'rgb(' + r + ',' + g + ',' + b + ')';
              ctx.fill();
            }
          }

          // Highlight ridges: draw bright edges on sun-facing slopes
          ctx.lineWidth = 0.5;
          for (let iz = 0; iz < TZ; iz++) {
            for (let ix = 0; ix < TX; ix++) {
              const p00 = grid[iz][ix];
              const p10 = grid[iz][ix + 1];
              const p01 = grid[iz + 1][ix];
              const p11 = grid[iz + 1][ix + 1];

              const minX = Math.min(p00.x, p10.x, p01.x, p11.x);
              const maxX = Math.max(p00.x, p10.x, p01.x, p11.x);
              if (maxX < -10 || minX > W + 10) continue;

              // Normal
              const dAx = p11.wx - p00.wx, dAy = p11.wy - p00.wy, dAz = p11.wz - p00.wz;
              const dBx = p10.wx - p01.wx, dBy = p10.wy - p01.wy, dBz = p10.wz - p01.wz;
              let rnx = dAy * dBz - dAz * dBy;
              let rny = dAz * dBx - dAx * dBz;
              let rnz = dAx * dBy - dAy * dBx;
              const rnl = Math.sqrt(rnx * rnx + rny * rny + rnz * rnz) || 1;
              rnx /= rnl; rny /= rnl; rnz /= rnl;
              if (rny < 0) { rnx = -rnx; rny = -rny; rnz = -rnz; }

              const rdot = rnx * sdx + rny * sdy + rnz * sdz;
              const avgZ = (p00.wz + p11.wz) * 0.5;
              const fogT = Math.pow(Math.min(1, (avgZ - tZnear) / (tZfar - tZnear)), 1.2);

              // Only draw highlight on strongly sun-facing quads
              if (rdot > 0.6) {
                const hStr = (rdot - 0.6) * 2.5 * (1 - fogT * 0.7);
                if (hStr > 0.05) {
                  ctx.strokeStyle = 'rgba(255,200,120,' + Math.min(0.3, hStr * 0.3).toFixed(3) + ')';
                  ctx.beginPath();
                  ctx.moveTo(p00.x, p00.y); ctx.lineTo(p10.x, p10.y);
                  ctx.stroke();
                }
              }
            }
          }
        }

        // ============================================
        // GROUND PLAN → PERSPECTIVE PROJECTION
        // ============================================
        // Square ground plane in world space.
        // Camera at (0, camH, 0) looking along +Z.
        // Swords placed on a grid across the X-Z plane.
        // Project: screenX = W/2 + worldX * focal / worldZ
        //          screenY = hY + camH * focal / worldZ
        //          apparent size = realSize * focal / worldZ

        const camH = 0.3;            // very low camera, ground-hugging
        const focal = W * 0.7;       // focal length → controls FOV
        const gridSpacing = 3.8;     // average gap between swords on the plan
        const sunScreenX = W * 0.5;

        // === 3D LIGHT SOURCE ===
        // Sun at horizon center, slightly above ground
        const lightPos = { x: 0, y: 3.0, z: 80 }; // world-space sun position
        const lightIntensity = 1.2;
        const lightColor = { r: 255, g: 190, b: 90 }; // warm sunset
        const ambientLight = 0.18; // minimum light level — enough to see materials

        // === MATERIAL SYSTEM ===
        // Each material has: base color, specularity (0-1), roughness (0-1), metallic (0-1)
        const materials = {
          steel:    { r: 195, g: 200, b: 215, spec: 0.7, rough: 0.25, metal: 0.9 },  // cool blue-grey
          iron:     { r: 130, g: 105, b:  90, spec: 0.3, rough: 0.6,  metal: 0.7 },  // warm brown-grey
          bronze:   { r: 200, g: 150, b:  60, spec: 0.5, rough: 0.35, metal: 0.85 }, // distinctly warm gold
          darkIron: { r:  70, g:  60, b:  55, spec: 0.15, rough: 0.8, metal: 0.6 },  // dark but visible
          bone:     { r: 220, g: 200, b: 170, spec: 0.1, rough: 0.7,  metal: 0.0 },  // warm cream
          wood:     { r: 120, g:  75, b:  35, spec: 0.05, rough: 0.9, metal: 0.0 }   // rich brown
        };
        const matKeys = Object.keys(materials);

        // === WEAPON TYPES ===
        // All sword variants — same basic silhouette, different proportions/materials.
        // Keeps the battlefield cohesive. tipShape: 0=pointed, 1=slightly broad
        // Sword variants — hM/wM range ~0.88–1.12 for visible but cohesive variety
        const weaponTypes = [
          { name: 'longsword',   bladeP: 0.72, guardP: 0.02,  gripP: 0.21, bwM: 1.0,  gwM: 1.5,  tipS: 0, pomM: 1.0,  hM: 1.0,  wM: 1.0,  bladeMat: 'steel',    handleMat: 'wood' },
          { name: 'greatsword',  bladeP: 0.68, guardP: 0.024, gripP: 0.25, bwM: 1.15, gwM: 1.7,  tipS: 0, pomM: 1.15, hM: 1.12, wM: 1.10, bladeMat: 'steel',    handleMat: 'wood' },
          { name: 'shortsword',  bladeP: 0.67, guardP: 0.02,  gripP: 0.19, bwM: 0.92, gwM: 1.3,  tipS: 0, pomM: 0.88, hM: 0.88, wM: 0.90, bladeMat: 'iron',     handleMat: 'wood' },
          { name: 'broadsword',  bladeP: 0.70, guardP: 0.02,  gripP: 0.20, bwM: 1.25, gwM: 1.5,  tipS: 1, pomM: 1.0,  hM: 0.96, wM: 1.15, bladeMat: 'iron',     handleMat: 'wood' },
          { name: 'arming',      bladeP: 0.70, guardP: 0.018, gripP: 0.20, bwM: 0.90, gwM: 1.35, tipS: 0, pomM: 0.95, hM: 0.92, wM: 0.93, bladeMat: 'steel',    handleMat: 'bone' },
          { name: 'bastard',     bladeP: 0.70, guardP: 0.022, gripP: 0.23, bwM: 1.05, gwM: 1.6,  tipS: 0, pomM: 1.1,  hM: 1.08, wM: 1.03, bladeMat: 'darkIron', handleMat: 'wood' },
          { name: 'falchion',    bladeP: 0.73, guardP: 0.015, gripP: 0.19, bwM: 1.10, gwM: 1.1,  tipS: 1, pomM: 0.85, hM: 0.94, wM: 1.06, bladeMat: 'bronze',   handleMat: 'wood' },
        ];

        // 3D lighting calculation
        function calcLight(worldX, worldY, worldZ, normalX, normalY, normalZ, mat) {
          // Vector from surface to light
          const lx = lightPos.x - worldX, ly = lightPos.y - worldY, lz = lightPos.z - worldZ;
          const ld = Math.sqrt(lx * lx + ly * ly + lz * lz);
          const lnx = lx / ld, lny = ly / ld, lnz = lz / ld;

          // Distance attenuation (inverse square, clamped)
          const atten = Math.min(1, lightIntensity / (1 + ld * ld * 0.0008));

          // Diffuse: dot(normal, lightDir)
          const ndotl = Math.max(0, normalX * lnx + normalY * lny + normalZ * lnz);
          // Roughness dampens diffuse slightly
          const diffuse = ndotl * (1 - mat.rough * 0.3) * atten;

          // Specular: simplified Blinn-Phong
          // View dir roughly (0, -0.3, -1) normalized
          const vl = Math.sqrt(0.09 + 1); const vnx = 0, vny = -0.3 / vl, vnz = -1 / vl;
          const hx = lnx + vnx, hy = lny + vny, hz = lnz + vnz;
          const hd = Math.sqrt(hx * hx + hy * hy + hz * hz) || 1;
          const ndoth = Math.max(0, normalX * hx / hd + normalY * hy / hd + normalZ * hz / hd);
          const specPow = 4 + (1 - mat.rough) * 60;
          const specular = Math.pow(ndoth, specPow) * mat.spec * atten;

          // Final color mix
          const totalLight = ambientLight + diffuse;
          // Metallic materials tint specular with base color, non-metallic use light color
          const sr = mat.metal > 0.5 ? mat.r : lightColor.r;
          const sg = mat.metal > 0.5 ? mat.g : lightColor.g;
          const sb = mat.metal > 0.5 ? mat.b : lightColor.b;

          return {
            r: Math.min(255, mat.r * totalLight + sr * specular),
            g: Math.min(255, mat.g * totalLight + sg * specular),
            b: Math.min(255, mat.b * totalLight + sb * specular),
            rimAtten: atten // pass attenuation for rim light
          };
        }

        // Draw one weapon at screen coords with full 3D treatment
        // wp = weapon props: { type, zRot, irr, wx, wy, wz }
        // Rotate a 3D point (x, y, z) around Y-axis by angle θ, return projected (screenX, screenY, depth)
        function rotY(x, y, z, cosA, sinA) {
          return { x: x * cosA - z * sinA, y: y, z: x * sinA + z * cosA };
        }

        // Draw a filled polygon from projected 2D points
        function fillPoly(pts, color) {
          if (pts.length < 3) return;
          ctx.beginPath();
          ctx.moveTo(pts[0].x, pts[0].y);
          for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
          ctx.closePath();
          ctx.fillStyle = color;
          ctx.fill();
        }

        function drawWeapon(sx, sy, sh, sbw, tilt, wp) {
          if (sh < 1.5 || sbw < 0.2) return;
          const wt = wp.type || weaponTypes[0];
          const ir = wp.irr || {};
          const theta = wp.zRot || 0; // rotation around sword's vertical axis
          const cosA = Math.cos(theta);
          const sinA = Math.sin(theta);

          ctx.save();

          // Clip AT ground line — everything below sy is hidden (buried)
          ctx.beginPath();
          ctx.rect(sx - sh * 2, 0, sh * 4, sy);
          ctx.clip();

          // Place sword tip BELOW ground — tip at sy + 15% of height
          // so the lower blade is buried in the earth
          ctx.translate(sx, sy + sh * 0.15);
          ctx.rotate(tilt * Math.PI / 180);

          // ================================================================
          // DIMENSIONS — matching reference sword proportions
          // ================================================================
          // === SWORD PROPORTIONS (Johnsson module system) ===
          // Total = 11 modules: blade = 8 modules, hilt = 3 modules
          // Module = blade/8; guard width ≈ 2 modules; pommel/blade-base ≈ 0.5 module
          const bladeH = sh * 8 / 11;
          const handleH = sh * 3 / 11;           // hilt = 3/11 of total
          const mod = bladeH / 8;                 // 1 module

          const halfW = mod * 0.25 * wt.bwM;     // blade half-width ≈ 0.5 module wide
          const halfT = Math.max(1.5, halfW * 0.10); // blade depth
          const gripHW = halfW * 0.5;               // grip narrower than blade
          const leatherHW = halfW * 0.65;             // leather wrap width

          // Hilt sub-proportions: pommel:grip ≈ 1:2, thin guard bar
          const pommelH = mod * 1.0;              // pommel ≈ 1 module
          const guardBarH = mod * 0.15;           // guard bar height (thin)
          const gripH = handleH - pommelH - guardBarH; // grip ≈ remainder

          // Widths from module system
          const gripHT = gripHW;                  // grip is round
          const guardArmHW = mod * 1.0;           // each arm ≈ 1 module (total guard ≈ 2 mod)
          const guardBarHT = gripHT;              // guard depth = grip depth
          const pomR = gripHW * wt.pomM;            // pommel matches handle thickness
          const rainGuardH = 0;

          // Y positions (tip at y=0, everything else negative = up)
          const bladeTop = -bladeH;
          const guardTop = bladeTop - guardBarH;
          const rainBot = bladeTop;
          const rainTop = bladeTop - rainGuardH;
          const gripBot = guardTop;
          const gripTop = gripBot - gripH;
          const pomY = gripTop - pomR;

          // ================================================================
          // LIGHTING
          // ================================================================
          const bladeMat = materials[wt.bladeMat] || materials.steel;
          const handleMat = materials[wt.handleMat] || materials.wood;
          const nx = sinA, nz = -cosA;
          const bladeLight = calcLight(wp.wx, 2.0, wp.wz, nx, 0, nz, bladeMat);
          const handleLight = calcLight(wp.wx, 3.5, wp.wz, nx, 0, nz, handleMat);
          const dk = wp.darkness || 0;
          const dkMul = Math.pow(1 - dk, 2.2);

          const blR = Math.round(bladeLight.r * dkMul);
          const blG = Math.round(bladeLight.g * dkMul);
          const blB = Math.round(bladeLight.b * dkMul);
          const hdR = Math.round(handleLight.r * dkMul * 0.95);
          const hdG = Math.round(handleLight.g * dkMul * 0.95);
          const hdB = Math.round(handleLight.b * dkMul * 0.95);

          const frontCol = 'rgb(' + blR + ',' + blG + ',' + blB + ')';
          const sideCol = 'rgb(' + Math.round(blR * 0.45) + ',' + Math.round(blG * 0.45) + ',' + Math.round(blB * 0.45) + ')';
          const backCol = 'rgb(' + Math.round(blR * 0.6) + ',' + Math.round(blG * 0.6) + ',' + Math.round(blB * 0.6) + ')';
          const guardCol = 'rgb(' + Math.round(hdR * 0.85) + ',' + Math.round(hdG * 0.85) + ',' + Math.round(hdB * 0.85) + ')';
          const guardSideCol = 'rgb(' + Math.round(hdR * 0.5) + ',' + Math.round(hdG * 0.5) + ',' + Math.round(hdB * 0.5) + ')';
          const gripCol = 'rgb(' + hdR + ',' + hdG + ',' + hdB + ')';
          const gripSideCol = 'rgb(' + Math.round(hdR * 0.5) + ',' + Math.round(hdG * 0.5) + ',' + Math.round(hdB * 0.5) + ')';

          // Face visibility
          const eps = 0.01;
          const frontVis = cosA > eps;
          const backVis = cosA < -eps;
          const rightVis = sinA > eps;
          const leftVis = sinA < -eps;

          // ================================================================
          // BLADE — razor cross-section with beveled edges meeting at Z=0
          // Each edge bevel is 1/7 of full blade width per side
          // ================================================================
          const taperY = -bladeH * 0.10;
          const tipT = Math.max(0.3, halfT * 0.3);
          const edgeW = halfW * 2 / 7;          // 1/7 of full width
          const innerHW = halfW - edgeW;         // inner flat face half-width

          // Front inner vertices (Z = halfT, X = ±innerHW)
          const fTL = rotY(-innerHW, bladeTop, halfT, cosA, sinA);
          const fTR = rotY(innerHW, bladeTop, halfT, cosA, sinA);
          const fMR = rotY(innerHW, taperY, halfT, cosA, sinA);
          const fTip = rotY(0, 0, tipT, cosA, sinA);
          const fML = rotY(-innerHW, taperY, halfT, cosA, sinA);

          // Back inner vertices (Z = -halfT, X = ±innerHW)
          const bTL = rotY(-innerHW, bladeTop, -halfT, cosA, sinA);
          const bTR = rotY(innerHW, bladeTop, -halfT, cosA, sinA);
          const bMR = rotY(innerHW, taperY, -halfT, cosA, sinA);
          const bTip = rotY(0, 0, -tipT, cosA, sinA);
          const bML = rotY(-innerHW, taperY, -halfT, cosA, sinA);

          // Razor edge vertices (Z = 0, X = ±halfW)
          const eTL = rotY(-halfW, bladeTop, 0, cosA, sinA);
          const eTR = rotY(halfW, bladeTop, 0, cosA, sinA);
          const eMR = rotY(halfW, taperY, 0, cosA, sinA);
          const eML = rotY(-halfW, taperY, 0, cosA, sinA);
          const eTip = rotY(0, 0, 0, cosA, sinA);

          // Curved tip sides: intermediate points with subtle outward bow
          const TIP_SEG = 6;
          const tipBow = innerHW * 0.08; // subtle outward bulge
          const tipCurvePts = (startX, startY, startZ, endX, endY, endZ, sign) => {
            const pts = [];
            for (let i = 1; i < TIP_SEG; i++) {
              const t = i / TIP_SEG;
              const x = startX + (endX - startX) * t + Math.sin(t * Math.PI) * tipBow * sign;
              const y = startY + (endY - startY) * t;
              const z = startZ + (endZ - startZ) * t;
              pts.push(rotY(x, y, z, cosA, sinA));
            }
            return pts;
          };
          // Right side curve points (front, back, edge)
          const fTipR = tipCurvePts(innerHW, taperY, halfT, 0, 0, tipT, 1);
          const bTipR = tipCurvePts(innerHW, taperY, -halfT, 0, 0, -tipT, 1);
          const eTipR = tipCurvePts(halfW, taperY, 0, 0, 0, 0, 1);
          // Left side curve points (front, back, edge)
          const fTipL = tipCurvePts(-innerHW, taperY, halfT, 0, 0, tipT, -1);
          const bTipL = tipCurvePts(-innerHW, taperY, -halfT, 0, 0, -tipT, -1);
          const eTipL = tipCurvePts(-halfW, taperY, 0, 0, 0, 0, -1);

          // Per-bevel visibility using actual face normals
          // Right-front bevel normal ≈ (halfT, 0, edgeW)
          // Right-back  bevel normal ≈ (halfT, 0, -edgeW)
          // Left-front  bevel normal ≈ (-halfT, 0, edgeW)
          // Left-back   bevel normal ≈ (-halfT, 0, -edgeW)
          const rfVis = halfT * sinA + edgeW * cosA > eps;
          const rbVis = halfT * sinA - edgeW * cosA > eps;
          const lfVis = -halfT * sinA + edgeW * cosA > eps;
          const lbVis = -halfT * sinA - edgeW * cosA > eps;

          // Bevel colours
          const fBevelCol = 'rgb(' + Math.round(blR * 0.72) + ',' + Math.round(blG * 0.72) + ',' + Math.round(blB * 0.72) + ')';
          const bBevelCol = 'rgb(' + Math.round(blR * 0.35) + ',' + Math.round(blG * 0.35) + ',' + Math.round(blB * 0.35) + ')';

          // Draw back-to-front (painter's algorithm)
          if (backVis) fillPoly([bTL, bTR, bMR, ...bTipR, bTip, ...bTipL.slice().reverse(), bML], backCol);

          // Back bevels (straight section + curved tip segments)
          if (rbVis) {
            fillPoly([eTR, eMR, bMR, bTR], bBevelCol);
            // Tip segments: right back bevel
            const rbAll = [bMR, ...bTipR, bTip];
            const reAll = [eMR, ...eTipR, eTip];
            for (let i = 0; i < rbAll.length - 1; i++) fillPoly([reAll[i], reAll[i + 1], rbAll[i + 1], rbAll[i]], bBevelCol);
          }
          if (lbVis) {
            fillPoly([bTL, bML, eML, eTL], bBevelCol);
            const lbAll = [bML, ...bTipL.slice().reverse(), bTip];
            const leAll = [eML, ...eTipL.slice().reverse(), eTip];
            for (let i = 0; i < lbAll.length - 1; i++) fillPoly([lbAll[i], lbAll[i + 1], leAll[i + 1], leAll[i]], bBevelCol);
          }

          // Front bevels (straight section + curved tip segments)
          if (rfVis) {
            fillPoly([fTR, fMR, eMR, eTR], fBevelCol);
            const rfAll = [fMR, ...fTipR, fTip];
            const reAll = [eMR, ...eTipR, eTip];
            for (let i = 0; i < rfAll.length - 1; i++) fillPoly([rfAll[i], rfAll[i + 1], reAll[i + 1], reAll[i]], fBevelCol);
          }
          if (lfVis) {
            fillPoly([eTL, eML, fML, fTL], fBevelCol);
            const lfAll = [fML, ...fTipL.slice().reverse(), fTip];
            const leAll = [eML, ...eTipL.slice().reverse(), eTip];
            for (let i = 0; i < lfAll.length - 1; i++) fillPoly([leAll[i], leAll[i + 1], lfAll[i + 1], lfAll[i]], fBevelCol);
          }

          // Front face
          if (frontVis) fillPoly([fTL, fTR, fMR, ...fTipR, fTip, ...fTipL.slice().reverse(), fML], frontCol);

          // Top cap triangles at bladeTop
          if (rbVis || rfVis) fillPoly([fTR, bTR, eTR], sideCol);
          if (lbVis || lfVis) fillPoly([bTL, fTL, eTL], sideCol);

          // Fuller (blood groove) — on both front and back faces
          // Helper to draw fuller on a given face
          const drawFuller = (isFront, tl, tr, ml, mr, tip, faceCol) => {
            const vis = isFront ? frontVis : backVis;
            if (!vis || innerHW <= 1.5) return;

            const fullerW = innerHW * 0.28;
            const fullerStart = bladeTop + mod * 0.3;
            const fullerEnd = taperY + (0 - taperY) * 0.3;
            const fcx = (tl.x + tr.x) * 0.5;

            // Darker recessed color
            const baseR = isFront ? blR : Math.round(blR * 0.6);
            const baseG = isFront ? blG : Math.round(blG * 0.6);
            const baseB = isFront ? blB : Math.round(blB * 0.6);
            const fDkR = Math.round(baseR * 0.55);
            const fDkG = Math.round(baseG * 0.55);
            const fDkB = Math.round(baseB * 0.55);
            const fullerGrad = ctx.createLinearGradient(fcx - fullerW, 0, fcx + fullerW, 0);
            const litSide = isFront ? sinA > 0 : sinA < 0;
            if (litSide) {
              fullerGrad.addColorStop(0, 'rgb(' + Math.round(fDkR * 0.7) + ',' + Math.round(fDkG * 0.7) + ',' + Math.round(fDkB * 0.7) + ')');
              fullerGrad.addColorStop(0.35, 'rgb(' + fDkR + ',' + fDkG + ',' + fDkB + ')');
              fullerGrad.addColorStop(0.7, 'rgb(' + Math.round(fDkR * 1.15) + ',' + Math.round(fDkG * 1.15) + ',' + Math.round(fDkB * 1.15) + ')');
              fullerGrad.addColorStop(1, 'rgb(' + Math.round(fDkR * 0.8) + ',' + Math.round(fDkG * 0.8) + ',' + Math.round(fDkB * 0.8) + ')');
            } else {
              fullerGrad.addColorStop(0, 'rgb(' + Math.round(fDkR * 0.8) + ',' + Math.round(fDkG * 0.8) + ',' + Math.round(fDkB * 0.8) + ')');
              fullerGrad.addColorStop(0.3, 'rgb(' + Math.round(fDkR * 1.15) + ',' + Math.round(fDkG * 1.15) + ',' + Math.round(fDkB * 1.15) + ')');
              fullerGrad.addColorStop(0.65, 'rgb(' + fDkR + ',' + fDkG + ',' + fDkB + ')');
              fullerGrad.addColorStop(1, 'rgb(' + Math.round(fDkR * 0.7) + ',' + Math.round(fDkG * 0.7) + ',' + Math.round(fDkB * 0.7) + ')');
            }

            const sT = (fullerStart - bladeTop) / (taperY - bladeTop || 1);
            const fsY = tl.y + (ml.y - tl.y) * sT;
            const eT = (fullerEnd - taperY) / (0 - taperY || 1);
            const feY = ml.y + (tip.y - ml.y) * eT;
            const fsCx = (tl.x + (ml.x - tl.x) * sT + tr.x + (mr.x - tr.x) * sT) * 0.5;
            const feCx = (ml.x + (tip.x - ml.x) * eT + mr.x + (tip.x - mr.x) * eT) * 0.5;

            const fullerPeakY = fsY - fullerW * 0.7;
            // Groove fill
            ctx.beginPath();
            ctx.moveTo(fsCx - fullerW, fsY);
            ctx.quadraticCurveTo(fsCx, fullerPeakY, fsCx + fullerW, fsY);
            ctx.lineTo(feCx + fullerW * 0.15, feY);
            ctx.lineTo(feCx - fullerW * 0.15, feY);
            ctx.closePath();
            ctx.fillStyle = fullerGrad;
            ctx.fill();

            // Lip highlight
            const lipAlpha = (0.06 + Math.abs(cosA) * 0.06) * (isFront ? 1 : 0.5);
            ctx.beginPath();
            ctx.moveTo(fsCx - fullerW, fsY);
            ctx.quadraticCurveTo(fsCx, fullerPeakY, fsCx + fullerW, fsY);
            ctx.lineTo(feCx + fullerW * 0.15, feY);
            ctx.lineTo(feCx - fullerW * 0.15, feY);
            ctx.closePath();
            const lipGrad = ctx.createLinearGradient(0, fsY, 0, fsY + (feY - fsY) * 0.25);
            lipGrad.addColorStop(0, 'rgba(255,255,255,' + lipAlpha.toFixed(3) + ')');
            lipGrad.addColorStop(1, 'rgba(255,255,255,0)');
            ctx.fillStyle = lipGrad;
            ctx.fill();

            // Bottom shadow
            ctx.beginPath();
            ctx.moveTo(fsCx - fullerW, fsY);
            ctx.quadraticCurveTo(fsCx, fullerPeakY, fsCx + fullerW, fsY);
            ctx.lineTo(feCx + fullerW * 0.15, feY);
            ctx.lineTo(feCx - fullerW * 0.15, feY);
            ctx.closePath();
            const shadowGrad = ctx.createLinearGradient(0, feY - (feY - fsY) * 0.15, 0, feY);
            shadowGrad.addColorStop(0, 'rgba(0,0,0,0)');
            shadowGrad.addColorStop(1, 'rgba(0,0,0,' + (lipAlpha * 0.5).toFixed(3) + ')');
            ctx.fillStyle = shadowGrad;
            ctx.fill();
          };
          // Draw on back face first (painter's order), then front
          drawFuller(false, bTL, bTR, bML, bMR, bTip, backCol);
          drawFuller(true, fTL, fTR, fML, fMR, fTip, frontCol);

          // Blade texture — subtle hammered/grain pattern on visible faces
          if (innerHW > 1.5) {
            const texFaces = [];
            if (backVis) texFaces.push({ tl: bTL, tr: bTR, ml: bML, mr: bMR, tip: bTip, alpha: 0.04 });
            if (frontVis) texFaces.push({ tl: fTL, tr: fTR, ml: fML, mr: fMR, tip: fTip, alpha: 0.06 });

            for (const face of texFaces) {
              ctx.save();
              // Clip to blade face shape
              ctx.beginPath();
              ctx.moveTo(face.tl.x, face.tl.y);
              ctx.lineTo(face.tr.x, face.tr.y);
              ctx.lineTo(face.mr.x, face.mr.y);
              ctx.lineTo(face.tip.x, face.tip.y);
              ctx.lineTo(face.ml.x, face.ml.y);
              ctx.closePath();
              ctx.clip();

              // Vertical grain lines (forging direction)
              const grainCount = Math.max(8, Math.round(innerHW * 0.8));
              for (let gi = 0; gi < grainCount; gi++) {
                const t = (gi + 0.5) / grainCount;
                const x1 = face.tl.x + (face.tr.x - face.tl.x) * t;
                const y1 = face.tl.y + (face.tr.y - face.tl.y) * t;
                const x2 = face.ml.x + (face.tip.x - face.ml.x) * t;
                const y2 = face.ml.y + (face.tip.y - face.ml.y) * t;
                const wobble = rng(gi, 80) * 0.6 + 0.7;
                ctx.strokeStyle = 'rgba(255,255,255,' + (face.alpha * wobble).toFixed(4) + ')';
                ctx.lineWidth = 0.3 + rng(gi, 81) * 0.4;
                ctx.beginPath();
                ctx.moveTo(x1, y1);
                // Slight waviness
                const mx = (x1 + x2) * 0.5 + (rng(gi, 82) - 0.5) * 1.5;
                const my = (y1 + y2) * 0.5;
                ctx.quadraticCurveTo(mx, my, x2, y2);
                ctx.stroke();
              }

              // Scattered forge marks (small dark spots)
              for (let fi = 0; fi < 20; fi++) {
                const ft = rng(fi, 90);
                const fu = rng(fi, 91);
                const fx = face.tl.x + (face.tr.x - face.tl.x) * ft;
                const fy = face.tl.y + (face.tip.y - face.tl.y) * fu;
                const fr = 0.3 + rng(fi, 92) * 0.8;
                ctx.fillStyle = 'rgba(0,0,0,' + (face.alpha * 0.8).toFixed(4) + ')';
                ctx.beginPath();
                ctx.arc(fx, fy, fr, 0, Math.PI * 2);
                ctx.fill();
              }

              ctx.restore();
            }
          }

          // ================================================================
          // GUARD — symmetrical curved crossguard with flared tips
          // Top and bottom edges are exact mirrors around guard center Y
          // ================================================================
          const gCenterY = bladeTop - guardBarH * 0.5; // vertical center of guard
          const gBarDepth = gripHT;
          const gFlareH = guardBarH * 1.8;             // how far tips extend from center
          const gTipW = guardArmHW * 0.22;
          const gcHW = halfW * 1.1;

          {
            const qBez = (ax, ay, cx, cy, bx, by, t) => ({
              x: (1 - t) * (1 - t) * ax + 2 * (1 - t) * t * cx + t * t * bx,
              y: (1 - t) * (1 - t) * ay + 2 * (1 - t) * t * cy + t * t * by
            });
            const N = 8;

            // Build ONE edge (top) then mirror for bottom
            const ghh = guardBarH * 0.5; // half the bar height at arms
            const tipFlare = gFlareH * 0.5; // how far tips extend beyond center

            // Key X positions
            const tipOuterX = guardArmHW + gTipW;
            const tipInnerX = guardArmHW;

            // Cubic bezier for smoother curves
            const cBez = (ax, ay, c1x, c1y, c2x, c2y, bx, by, t) => {
              const u = 1 - t;
              return {
                x: u * u * u * ax + 3 * u * u * t * c1x + 3 * u * t * t * c2x + t * t * t * bx,
                y: u * u * u * ay + 3 * u * u * t * c1y + 3 * u * t * t * c2y + t * t * t * by
              };
            };

            // === TOP EDGE (going left to right) ===
            const gSamplesTop = [];
            const NS = 12; // more samples for smoother curves

            // V-notch: points outward, slightly wider than blade
            const vOuterX = halfW * 1.15;   // V starts slightly wider than blade
            const vInnerX = halfW * 0.2;    // V apex near center
            const vOver = ghh * 0.6;        // how far V extends beyond normal guard edge

            // Left outer tip
            gSamplesTop.push({ x: -tipOuterX, y: gCenterY - tipFlare });
            gSamplesTop.push({ x: -tipInnerX, y: gCenterY - tipFlare * 0.6 });
            // Left arm: tip → V start (bowed outward)
            const armBow = ghh * 0.45; // how much the arm bulges outward
            for (let i = 1; i <= NS; i++) {
              gSamplesTop.push(cBez(
                -tipInnerX, gCenterY - tipFlare * 0.6,
                -tipInnerX * 0.7, gCenterY - ghh - armBow,
                -vOuterX - gcHW * 0.2, gCenterY - ghh - armBow,
                -vOuterX, gCenterY - ghh,
                i / NS
              ));
            }
            // Left V: arm edge → apex (extends OUTWARD, away from center)
            for (let i = 1; i <= NS; i++) {
              gSamplesTop.push(qBez(
                -vOuterX, gCenterY - ghh,
                -vInnerX * 1.5, gCenterY - ghh - vOver,
                -vInnerX, gCenterY - ghh - vOver,
                i / NS
              ));
            }
            // Right V: apex → arm edge
            for (let i = 1; i <= NS; i++) {
              gSamplesTop.push(qBez(
                vInnerX, gCenterY - ghh - vOver,
                vInnerX * 1.5, gCenterY - ghh - vOver,
                vOuterX, gCenterY - ghh,
                i / NS
              ));
            }
            // Right arm: V end → tip (bowed outward)
            for (let i = 1; i <= NS; i++) {
              gSamplesTop.push(cBez(
                vOuterX, gCenterY - ghh,
                vOuterX + gcHW * 0.2, gCenterY - ghh - armBow,
                tipInnerX * 0.7, gCenterY - ghh - armBow,
                tipInnerX, gCenterY - tipFlare * 0.6,
                i / NS
              ));
            }
            // Right outer tip
            gSamplesTop.push({ x: tipOuterX, y: gCenterY - tipFlare });

            // === BOTTOM EDGE — exact mirror of top around gCenterY ===
            const gSamplesBot = gSamplesTop.map(p => ({
              x: p.x,
              y: gCenterY + (gCenterY - p.y)
            }));

            // Build multiple Z-depth layers for curved side faces
            const DEPTH_LAYERS = 5;
            const gTopLayers = [];  // [layer][pointIdx]
            const gBotLayers = [];
            for (let l = 0; l <= DEPTH_LAYERS; l++) {
              const t = l / DEPTH_LAYERS;                    // 0 = front, 1 = back
              const z01 = t * 2 - 1;                         // -1 (front) to +1 (back)
              const zCurved = Math.sin(z01 * Math.PI * 0.5); // barrel curve in Z
              const zVal = gBarDepth * -zCurved;              // front=+gBarDepth, back=-gBarDepth with barrel
              gTopLayers.push(gSamplesTop.map(p => rotY(p.x, p.y, zVal, cosA, sinA)));
              gBotLayers.push(gSamplesBot.map(p => rotY(p.x, p.y, zVal, cosA, sinA)));
            }
            const gTopF = gTopLayers[0];
            const gTopB = gTopLayers[DEPTH_LAYERS];
            const gBotF = gBotLayers[0];
            const gBotB = gBotLayers[DEPTH_LAYERS];

            // Guard side shading: interpolate color per depth layer
            const gsR = parseInt(guardSideCol.slice(4), 10) || 60;
            const gsG = parseInt(guardSideCol.split(',')[1], 10) || 60;
            const gsB = parseInt(guardSideCol.split(',')[2], 10) || 60;

            // Draw back face
            if (backVis) {
              const backPoly = [...gTopB, ...gBotB.slice().reverse()];
              ctx.beginPath();
              ctx.moveTo(backPoly[0].x, backPoly[0].y);
              for (let i = 1; i < backPoly.length; i++) ctx.lineTo(backPoly[i].x, backPoly[i].y);
              ctx.closePath();
              ctx.fillStyle = guardSideCol;
              ctx.fill();
            }

            // Draw curved depth strips along top and bottom edges
            for (let l = 0; l < DEPTH_LAYERS; l++) {
              // Shade: lighter in middle layers (barrel highlight), darker at edges
              const mid = Math.abs((l + 0.5) / DEPTH_LAYERS - 0.5) * 2; // 0=middle, 1=edge
              const shade = 0.7 + 0.3 * (1 - mid);
              const sCol = 'rgb(' + Math.round(gsR * shade) + ',' + Math.round(gsG * shade) + ',' + Math.round(gsB * shade) + ')';
              // Top edge strips
              for (let i = 0; i < gTopLayers[l].length - 1; i++) {
                fillPoly([gTopLayers[l][i], gTopLayers[l][i + 1], gTopLayers[l + 1][i + 1], gTopLayers[l + 1][i]], sCol);
              }
              // Bottom edge strips
              for (let i = 0; i < gBotLayers[l].length - 1; i++) {
                fillPoly([gBotLayers[l][i], gBotLayers[l][i + 1], gBotLayers[l + 1][i + 1], gBotLayers[l + 1][i]], sCol);
              }
            }

            // End caps (simple depth-layered quads, no bulge)
            if (rightVis) {
              for (let l = 0; l < DEPTH_LAYERS; l++) {
                const n = gTopLayers[l].length - 1;
                fillPoly([gTopLayers[l][n], gBotLayers[l][n], gBotLayers[l + 1][n], gTopLayers[l + 1][n]], guardSideCol);
              }
            }
            if (leftVis) {
              for (let l = 0; l < DEPTH_LAYERS; l++) {
                fillPoly([gTopLayers[l][0], gBotLayers[l][0], gBotLayers[l + 1][0], gTopLayers[l + 1][0]], guardSideCol);
              }
            }

            // Draw front face
            if (frontVis) {
              const frontPoly = [...gTopF, ...gBotF.slice().reverse()];
              ctx.beginPath();
              ctx.moveTo(frontPoly[0].x, frontPoly[0].y);
              for (let i = 1; i < frontPoly.length; i++) ctx.lineTo(frontPoly[i].x, frontPoly[i].y);
              ctx.closePath();
              ctx.fillStyle = guardCol;
              ctx.fill();
            }
          }

          // ================================================================
          // GRIP — bare metal upper half + leather-wrapped lower half
          // Leather wrap covers guard→midpoint, bare handle below
          // ================================================================
          {
            const gripMidY = (gripTop + gripBot) * 0.5;
            const leatherTop = gripBot;    // leather starts at guard (bottom of grip rect = near guard)
            const leatherBot = gripMidY;   // leather ends at midpoint

            // Full grip base (metal/wood tone)
            const cylShade = Math.abs(cosA);
            const cylR = Math.round(hdR * (0.5 + cylShade * 0.4));
            const cylG = Math.round(hdG * (0.5 + cylShade * 0.4));
            const cylB = Math.round(hdB * (0.5 + cylShade * 0.4));
            const cylGrad = ctx.createLinearGradient(-gripHW, 0, gripHW, 0);
            const cylHi = 'rgb(' + Math.min(255, cylR + 20) + ',' + Math.min(255, cylG + 20) + ',' + Math.min(255, cylB + 20) + ')';
            const cylLo = 'rgb(' + Math.round(cylR * 0.55) + ',' + Math.round(cylG * 0.55) + ',' + Math.round(cylB * 0.55) + ')';
            if (sinA > 0) {
              cylGrad.addColorStop(0, cylHi);
              cylGrad.addColorStop(0.45, cylHi);
              cylGrad.addColorStop(1, cylLo);
            } else {
              cylGrad.addColorStop(0, cylLo);
              cylGrad.addColorStop(0.55, cylHi);
              cylGrad.addColorStop(1, cylHi);
            }
            // Grip tapers subtly toward pommel
            const gripNarrowHW = gripHW * 0.75; // narrower at pommel end
            // Draw full grip as tapered trapezoid
            ctx.beginPath();
            ctx.moveTo(-gripHW, gripBot);      // wide end (guard side)
            ctx.lineTo(gripHW, gripBot);
            ctx.lineTo(gripNarrowHW, gripTop); // narrow end (pommel side)
            ctx.lineTo(-gripNarrowHW, gripTop);
            ctx.closePath();
            ctx.fillStyle = gripSideCol;
            ctx.fill();
            ctx.beginPath();
            ctx.moveTo(-gripHW, gripBot);
            ctx.lineTo(gripHW, gripBot);
            ctx.lineTo(gripNarrowHW, gripTop);
            ctx.lineTo(-gripNarrowHW, gripTop);
            ctx.closePath();
            ctx.fillStyle = cylGrad;
            ctx.fill();

            // Leather wrap overlay on upper half (guard side)
            // Darker brown/black leather color
            const lR = Math.round(hdR * 0.25);
            const lG = Math.round(hdG * 0.2);
            const lB = Math.round(hdB * 0.18);
            const leatherGrad = ctx.createLinearGradient(-leatherHW, 0, leatherHW, 0);
            const lHi = 'rgb(' + Math.min(255, lR + 12) + ',' + Math.min(255, lG + 8) + ',' + Math.min(255, lB + 6) + ')';
            const lLo = 'rgb(' + Math.round(lR * 0.4) + ',' + Math.round(lG * 0.4) + ',' + Math.round(lB * 0.4) + ')';
            if (sinA > 0) {
              leatherGrad.addColorStop(0, lHi);
              leatherGrad.addColorStop(0.4, lHi);
              leatherGrad.addColorStop(1, lLo);
            } else {
              leatherGrad.addColorStop(0, lLo);
              leatherGrad.addColorStop(0.6, lHi);
              leatherGrad.addColorStop(1, lHi);
            }
            const leatherH = leatherTop - leatherBot;
            const lWideHW = leatherHW;            // wide end = 6/7 blade width (from outer scope)
            // Grip width at leather bottom (midpoint) follows taper
            const midGripT = (leatherBot - gripBot) / (gripTop - gripBot || 1);
            const gripAtMid = gripHW + (gripNarrowHW - gripHW) * midGripT;
            const lNarrowHW = gripAtMid + 1;    // narrow end = 1px wider than grip at that point
            // Draw leather as a gentle trapezoid
            ctx.beginPath();
            ctx.moveTo(-lWideHW, leatherTop);
            ctx.lineTo(lWideHW, leatherTop);
            ctx.lineTo(lNarrowHW, leatherBot);
            ctx.lineTo(-lNarrowHW, leatherBot);
            ctx.closePath();
            ctx.fillStyle = leatherGrad;
            ctx.fill();

            // Leather wrap ridges
            const wrapCount = Math.max(3, Math.round(Math.abs(leatherH) / (gripHW * 0.7)));
            const wrapSpacing = leatherH / (wrapCount + 1);
            const wrapHt = Math.abs(wrapSpacing) * 0.25;
            ctx.fillStyle = 'rgba(0,0,0,0.22)';
            for (let i = 1; i <= wrapCount; i++) {
              const t = i / (wrapCount + 1);
              const wHW = lWideHW + (lNarrowHW - lWideHW) * t;
              const wy = leatherBot + i * wrapSpacing;
              ctx.beginPath();
              ctx.rect(-wHW, wy - wrapHt * 0.5, wHW * 2, wrapHt);
              ctx.fill();
            }
            ctx.fillStyle = 'rgba(255,255,255,0.07)';
            for (let i = 1; i <= wrapCount; i++) {
              const t = i / (wrapCount + 1);
              const wHW = lWideHW + (lNarrowHW - lWideHW) * t;
              const wy = leatherBot + i * wrapSpacing;
              ctx.beginPath();
              ctx.rect(-wHW, wy - wrapHt * 0.5 - wrapHt * 0.5, wHW * 2, wrapHt * 0.3);
              ctx.fill();
            }
          }

          // ================================================================
          // POMMEL — fishtail/brazil-nut with depth, rotates via rotY
          // Sampled as discrete silhouette points for proper 3D rotation
          // ================================================================
          if (pomR > 0.3) {
            const pomCol = 'rgb(' + Math.round(hdR * 0.85) + ',' + Math.round(hdG * 0.85) + ',' + Math.round(hdB * 0.85) + ')';
            const pomLoCol = 'rgb(' + Math.round(hdR * 0.5) + ',' + Math.round(hdG * 0.5) + ',' + Math.round(hdB * 0.5) + ')';
            const pomDepth = gripHT; // Z half-depth matches handle thickness

            const pomHW = pomR * 1.8;
            const pomH = pomR * 2.2;
            const pomTopY = gripTop - pomH;
            const pomBotY = gripTop;
            const neckHW = gripHW * 0.75; // matches narrowed grip end

            // Sample the pommel outline as discrete points (clockwise)
            // Smooth rounded dome shape matching green outline reference
            const qBez = (ax, ay, cx, cy, bx, by, t) => ({
              x: (1 - t) * (1 - t) * ax + 2 * (1 - t) * t * cx + t * t * bx,
              y: (1 - t) * (1 - t) * ay + 2 * (1 - t) * t * cy + t * t * by
            });
            // Cubic bezier for smoother curves
            const cBez = (ax, ay, c1x, c1y, c2x, c2y, bx, by, t) => {
              const u = 1 - t;
              return {
                x: u * u * u * ax + 3 * u * u * t * c1x + 3 * u * t * t * c2x + t * t * t * bx,
                y: u * u * u * ay + 3 * u * u * t * c1y + 3 * u * t * t * c2y + t * t * t * by
              };
            };
            const N = 12; // more samples for smoother curves
            const pomOutline = [];

            // Bottom edge: left neck to right neck
            pomOutline.push({ x: -neckHW, y: pomBotY });
            pomOutline.push({ x: neckHW, y: pomBotY });

            // Right side: neck flares out smoothly then arcs to dome top
            // Use cubic bezier for smoother S-curve from neck to widest point
            const bulgeY = pomBotY - pomH * 0.5; // widest at vertical midpoint
            for (let i = 1; i <= N; i++) {
              pomOutline.push(cBez(
                neckHW, pomBotY,
                neckHW, pomBotY - pomH * 0.15,  // initially goes straight up
                pomHW, pomBotY - pomH * 0.25,    // then curves outward
                pomHW, bulgeY,                    // arrives at widest point horizontally
                i / N
              ));
            }
            // Right upper: widest → dome top (smooth arc)
            for (let i = 1; i <= N; i++) {
              pomOutline.push(cBez(
                pomHW, bulgeY,
                pomHW, bulgeY - pomH * 0.2,      // continues outward briefly
                pomHW * 0.7, pomTopY - pomH * 0.02, // curves toward top
                0, pomTopY,                        // arrives at dome apex
                i / N
              ));
            }
            // Left upper: dome top → widest (mirror)
            for (let i = 1; i <= N; i++) {
              pomOutline.push(cBez(
                0, pomTopY,
                -pomHW * 0.7, pomTopY - pomH * 0.02,
                -pomHW, bulgeY - pomH * 0.2,
                -pomHW, bulgeY,
                i / N
              ));
            }
            // Left side: widest → neck (mirror)
            for (let i = 1; i <= N; i++) {
              pomOutline.push(cBez(
                -pomHW, bulgeY,
                -pomHW, pomBotY - pomH * 0.25,
                -neckHW, pomBotY - pomH * 0.15,
                -neckHW, pomBotY,
                i / N
              ));
            }

            // Transform all outline points through rotY for front and back Z
            const pomF = pomOutline.map(p => rotY(p.x, p.y, pomDepth, cosA, sinA));
            const pomB = pomOutline.map(p => rotY(p.x, p.y, -pomDepth, cosA, sinA));

            // Draw back face
            if (backVis) {
              ctx.beginPath();
              ctx.moveTo(pomB[0].x, pomB[0].y);
              for (let i = 1; i < pomB.length; i++) ctx.lineTo(pomB[i].x, pomB[i].y);
              ctx.closePath();
              ctx.fillStyle = pomLoCol;
              ctx.fill();
            }

            // Draw depth quads connecting front and back outlines
            for (let i = 0; i < pomOutline.length; i++) {
              const j = (i + 1) % pomOutline.length;
              // Check if this edge faces the viewer (simplified: use edge midpoint X)
              const midX = (pomOutline[i].x + pomOutline[j].x) * 0.5;
              const midY = (pomOutline[i].y + pomOutline[j].y) * 0.5;
              // Edge normal in XY (perpendicular to edge, pointing outward)
              const dx = pomOutline[j].x - pomOutline[i].x;
              const dy = pomOutline[j].y - pomOutline[i].y;
              const nx = dy, ny = -dx; // outward normal (clockwise winding)
              // This depth face is visible from right if nx > 0 (and sinA > 0) or from left
              // Simplified: always draw depth strips, painter's algo handles overlap
              fillPoly([pomF[i], pomF[j], pomB[j], pomB[i]], guardSideCol);
            }

            // Draw front face
            if (frontVis) {
              ctx.beginPath();
              ctx.moveTo(pomF[0].x, pomF[0].y);
              for (let i = 1; i < pomF.length; i++) ctx.lineTo(pomF[i].x, pomF[i].y);
              ctx.closePath();
              ctx.fillStyle = pomCol;
              ctx.fill();
            }

            // Gradient overlay for 3D shading on front face
            if (frontVis) {
              const pomGrad = ctx.createLinearGradient(pomF[0].x - pomHW, 0, pomF[0].x + pomHW, 0);
              if (sinA > 0) {
                pomGrad.addColorStop(0, 'rgba(255,255,255,0.1)');
                pomGrad.addColorStop(0.6, 'rgba(0,0,0,0)');
                pomGrad.addColorStop(1, 'rgba(0,0,0,0.12)');
              } else {
                pomGrad.addColorStop(0, 'rgba(0,0,0,0.12)');
                pomGrad.addColorStop(0.4, 'rgba(0,0,0,0)');
                pomGrad.addColorStop(1, 'rgba(255,255,255,0.1)');
              }
              ctx.beginPath();
              ctx.moveTo(pomF[0].x, pomF[0].y);
              for (let i = 1; i < pomF.length; i++) ctx.lineTo(pomF[i].x, pomF[i].y);
              ctx.closePath();
              ctx.fillStyle = pomGrad;
              ctx.fill();
            }

            // Teardrop cutout on front face
            if (frontVis) {
              const cutW = pomHW * 0.35;
              const cutH = pomH * 0.35;
              const cutCY = pomTopY + pomH * 0.35;
              // Transform cutout center and key points through rotY
              const cc = rotY(0, cutCY, pomDepth + 0.1, cosA, sinA);
              const cTop = rotY(0, cutCY - cutH * 0.5, pomDepth + 0.1, cosA, sinA);
              const cR1 = rotY(cutW, cutCY - cutH * 0.1, pomDepth + 0.1, cosA, sinA);
              const cR2 = rotY(cutW * 0.7, cutCY + cutH * 0.3, pomDepth + 0.1, cosA, sinA);
              const cBot = rotY(0, cutCY + cutH * 0.55, pomDepth + 0.1, cosA, sinA);
              const cL2 = rotY(-cutW * 0.7, cutCY + cutH * 0.3, pomDepth + 0.1, cosA, sinA);
              const cL1 = rotY(-cutW, cutCY - cutH * 0.1, pomDepth + 0.1, cosA, sinA);
              ctx.beginPath();
              ctx.moveTo(cTop.x, cTop.y);
              ctx.quadraticCurveTo(cR1.x, cR1.y, cR2.x, cR2.y);
              ctx.quadraticCurveTo(cBot.x, cBot.y, cL2.x, cL2.y);
              ctx.quadraticCurveTo(cL1.x, cL1.y, cTop.x, cTop.y);
              ctx.closePath();
              ctx.fillStyle = 'rgba(0,0,0,0.7)';
              ctx.fill();
              ctx.strokeStyle = 'rgba(255,255,255,0.08)';
              ctx.lineWidth = Math.max(0.3, pomR * 0.06);
              ctx.stroke();
            }
          }

          // ================================================================
          // RIM LIGHT — edge highlight on sun side
          // ================================================================
          const rimSide = sx < sunScreenX ? 1 : -1;
          const rimBase = Math.max(0, 1 - Math.abs(sx - sunScreenX) / (W * 0.45));
          const rimMat = 0.15 + bladeMat.metal * 0.35 + bladeMat.spec * 0.2;
          const rimStr = rimBase * rimMat * bladeLight.rimAtten * dkMul;
          if (rimStr > 0.02 && frontVis) {
            const rEdge = rimSide > 0 ? { t: fTR, b: fMR } : { t: fTL, b: fML };
            const ew = Math.max(0.3, halfW * 0.1);
            ctx.beginPath();
            ctx.moveTo(rEdge.b.x, rEdge.b.y);
            ctx.lineTo(rEdge.t.x, rEdge.t.y);
            ctx.lineTo(rEdge.t.x - rimSide * ew, rEdge.t.y);
            ctx.lineTo(rEdge.b.x - rimSide * ew * 0.3, rEdge.b.y);
            ctx.closePath();
            const rr = Math.round(lightColor.r * 0.6 + bladeMat.r * 0.4);
            const rg = Math.round(lightColor.g * 0.6 + bladeMat.g * 0.4);
            const rb = Math.round(lightColor.b * 0.6 + bladeMat.b * 0.4);
            ctx.fillStyle = 'rgba(' + rr + ',' + rg + ',' + rb + ',' + rimStr.toFixed(3) + ')';
            ctx.fill();
          }

          // ================================================================
          // VOLUMETRIC LIGHT — depth simulation via atmospheric scattering
          // ================================================================
          {
            // 1. DEPTH FOG — back-facing parts fade toward atmosphere color
            //    Parts rotated away from viewer get hazier, simulating aerial perspective
            const fogStr = Math.max(0, -cosA) * 0.35; // stronger when back faces toward us
            if (fogStr > 0.01) {
              // Blade back-side fog
              const fogCol = 'rgba(180,120,60,' + fogStr.toFixed(3) + ')'; // warm atmospheric haze
              ctx.beginPath();
              ctx.moveTo(bTL.x, bTL.y); ctx.lineTo(bTR.x, bTR.y);
              ctx.lineTo(bMR.x, bMR.y); ctx.lineTo(bTip.x, bTip.y);
              ctx.lineTo(bML.x, bML.y); ctx.closePath();
              ctx.fillStyle = fogCol;
              ctx.fill();
            }

            // 2. EDGE SCATTER — light bleeding along silhouette edges
            //    Simulates subsurface/volumetric scatter where light wraps around edges
            const scatterW = Math.max(1, halfW * 0.18); // scatter spread
            const lr = lightColor.r, lg = lightColor.g, lb = lightColor.b;
            const scatterBase = rimBase * 0.4 * dkMul;

            if (scatterBase > 0.02) {
              // Right edge scatter (visible when sword turns right)
              const rScatter = scatterBase * Math.max(0, sinA);
              if (rScatter > 0.01) {
                const grad = ctx.createLinearGradient(
                  fTR.x, 0, fTR.x + scatterW * 3, 0
                );
                grad.addColorStop(0, 'rgba(' + lr + ',' + lg + ',' + lb + ',' + (rScatter * 0.6).toFixed(3) + ')');
                grad.addColorStop(0.4, 'rgba(' + lr + ',' + lg + ',' + lb + ',' + (rScatter * 0.2).toFixed(3) + ')');
                grad.addColorStop(1, 'rgba(' + lr + ',' + lg + ',' + lb + ',0)');
                ctx.beginPath();
                ctx.moveTo(fTR.x, fTR.y);
                ctx.lineTo(fTR.x + scatterW * 3, fTR.y);
                ctx.lineTo(fMR.x + scatterW * 2, fMR.y);
                ctx.lineTo(fTip.x + scatterW, fTip.y);
                ctx.lineTo(fTip.x, fTip.y);
                ctx.lineTo(fMR.x, fMR.y);
                ctx.closePath();
                ctx.fillStyle = grad;
                ctx.fill();
              }
              // Left edge scatter
              const lScatter = scatterBase * Math.max(0, -sinA);
              if (lScatter > 0.01) {
                const grad = ctx.createLinearGradient(
                  fTL.x, 0, fTL.x - scatterW * 3, 0
                );
                grad.addColorStop(0, 'rgba(' + lr + ',' + lg + ',' + lb + ',' + (lScatter * 0.6).toFixed(3) + ')');
                grad.addColorStop(0.4, 'rgba(' + lr + ',' + lg + ',' + lb + ',' + (lScatter * 0.2).toFixed(3) + ')');
                grad.addColorStop(1, 'rgba(' + lr + ',' + lg + ',' + lb + ',0)');
                ctx.beginPath();
                ctx.moveTo(fTL.x, fTL.y);
                ctx.lineTo(fTL.x - scatterW * 3, fTL.y);
                ctx.lineTo(fML.x - scatterW * 2, fML.y);
                ctx.lineTo(fTip.x - scatterW, fTip.y);
                ctx.lineTo(fTip.x, fTip.y);
                ctx.lineTo(fML.x, fML.y);
                ctx.closePath();
                ctx.fillStyle = grad;
                ctx.fill();
              }
            }

            // 3. DEPTH GRADIENT on front face — subtle darkening toward edges
            //    Simulates light falloff with depth; center (closest to viewer) brightest
            if (frontVis) {
              const depthGrad = ctx.createLinearGradient(
                fTL.x, 0, fTR.x, 0
              );
              const dEdge = Math.abs(sinA) * 0.12; // stronger at oblique angles
              if (sinA > 0) {
                depthGrad.addColorStop(0, 'rgba(0,0,0,0)');
                depthGrad.addColorStop(0.7, 'rgba(0,0,0,0)');
                depthGrad.addColorStop(1, 'rgba(0,0,0,' + dEdge.toFixed(3) + ')');
              } else {
                depthGrad.addColorStop(0, 'rgba(0,0,0,' + dEdge.toFixed(3) + ')');
                depthGrad.addColorStop(0.3, 'rgba(0,0,0,0)');
                depthGrad.addColorStop(1, 'rgba(0,0,0,0)');
              }
              ctx.beginPath();
              ctx.moveTo(fTL.x, fTL.y); ctx.lineTo(fTR.x, fTR.y);
              ctx.lineTo(fMR.x, fMR.y); ctx.lineTo(fTip.x, fTip.y);
              ctx.lineTo(fML.x, fML.y); ctx.closePath();
              ctx.fillStyle = depthGrad;
              ctx.fill();
            }

            // 4. VOLUMETRIC GLOW — soft radial light around guard/blade junction
            //    Simulates light pooling where blade meets hilt
            const glowStr = rimBase * 0.25 * dkMul;
            if (glowStr > 0.02) {
              const junctionY = bladeTop; // where blade meets guard
              const glowR = halfW * 2.5;
              const glow = ctx.createRadialGradient(0, junctionY, 0, 0, junctionY, glowR);
              glow.addColorStop(0, 'rgba(' + lr + ',' + lg + ',' + lb + ',' + (glowStr * 0.3).toFixed(3) + ')');
              glow.addColorStop(0.4, 'rgba(' + lr + ',' + lg + ',' + lb + ',' + (glowStr * 0.1).toFixed(3) + ')');
              glow.addColorStop(1, 'rgba(' + lr + ',' + lg + ',' + lb + ',0)');
              ctx.beginPath();
              ctx.arc(0, junctionY, glowR, 0, Math.PI * 2);
              ctx.fillStyle = glow;
              ctx.fill();
            }

            // 5. SPECULAR DEPTH BAND — bright line along blade center
            //    Simulates light reflecting off the blade's thickness profile
            if (frontVis && halfW > 2) {
              const specStr = Math.pow(Math.abs(cosA), 3) * 0.25 * dkMul;
              if (specStr > 0.02) {
                const bandW = Math.max(0.5, halfW * 0.04);
                const specGrad = ctx.createLinearGradient(0, bladeTop, 0, 0);
                specGrad.addColorStop(0, 'rgba(255,255,255,' + (specStr * 0.8).toFixed(3) + ')');
                specGrad.addColorStop(0.6, 'rgba(255,255,255,' + (specStr * 0.4).toFixed(3) + ')');
                specGrad.addColorStop(1, 'rgba(255,255,255,0)');
                const cx = (fTL.x + fTR.x) * 0.5;
                ctx.beginPath();
                ctx.moveTo(cx - bandW, bladeTop);
                ctx.lineTo(cx + bandW, bladeTop);
                ctx.lineTo(fTip.x + bandW * 0.2, fTip.y);
                ctx.lineTo(fTip.x - bandW * 0.2, fTip.y);
                ctx.closePath();
                ctx.fillStyle = specGrad;
                ctx.fill();
              }
            }
          }

          ctx.restore();
        }

        // === BARREL LENS DISTORTION for depth illusion ===
        const lensK = 0.18; // barrel distortion strength
        function lensDistort(px, py) {
          // Normalize to [-1,1] centered on screen
          const nx = (px - W * 0.5) / (W * 0.5);
          const ny = (py - H * 0.5) / (H * 0.5);
          const r2 = nx * nx + ny * ny;
          const factor = 1 + lensK * r2;
          return {
            x: W * 0.5 + nx * factor * W * 0.5,
            y: H * 0.5 + ny * factor * H * 0.5
          };
        }

        // === BATTLEGROUND SWORD FIELD ===
        // Blades stuck in the ground — tip buried, hilt up
        // Close foreground swords partially off-screen at edges
        // Matching reference: scattered across battlefield, various tilts
        {
          const swords = [];
          const fieldZnear = 0.25;  // extremely close — swords dominate the screen
          const fieldZfar = 80;
          const fieldXrange = 30;

          // === GRID OF SWORDS — evenly spaced, then camera projects ===
          // Spacing grows with distance (close rows dense, far rows sparse)
          // so ~equal number of visible swords per row on screen
          const gridZmin = 0.1, gridZmax = 80;
          const maxSwords = 500;
          let swordIdx = 0;
          for (let gz = gridZmin; gz <= gridZmax && swordIdx < maxSwords;) {
            // Spacing scales with Z — constant screen density
            const spacing = 1.5; // constant world-space density everywhere
            // Visible X range at this Z
            const visibleXrange = gz * W / (2 * focal) * 1.5;
            for (let gx = -visibleXrange; gx <= visibleXrange && swordIdx < maxSwords; gx += spacing) {
              const wx = gx + (rng(swordIdx, 101) - 0.5) * spacing * 0.6;
              const wzJ = gz + (rng(swordIdx, 100) - 0.5) * spacing * 0.5;
              if (wzJ < 0.12) { swordIdx++; continue; }
              const wy = terrH(wx, wzJ);

              const scrX = W * 0.5 + wx * focal / wzJ;
              const scrY = hY + (camH - wy) * focal / wzJ;
              const appSize = 1.8 * focal / wzJ;

              // Skip if off screen
              if (scrX < -W * 0.5 || scrX > W * 1.5 || scrY < -H * 0.2 || scrY > H * 1.2) { swordIdx++; continue; }

              const typeIdx = Math.floor(rng(swordIdx, 102) * weaponTypes.length);
              const wType = weaponTypes[typeIdx];
              const zRot = rng(swordIdx, 103) * Math.PI * 2;
              const tilt = (rng(swordIdx, 104) - 0.5) * 24;
              const distT = Math.min(1, wzJ / gridZmax);
              const darkness = distT * 0.6;

              swords.push({
                wx, wy, wz: wzJ, scrX, scrY, appSize, wType, zRot, tilt, darkness
              });
              swordIdx++;
            }
            gz += spacing; // Z step scales with distance
          }

          // Sort back-to-front
          swords.sort((a, b) => b.wz - a.wz);

          // Draw all swords
          for (const s of swords) {
            if (s.appSize < 1.5) continue;
            const sbw = s.appSize * 0.025;
            drawWeapon(s.scrX, s.scrY, s.appSize, sbw, s.tilt, {
              type: s.wType, zRot: s.zRot, irr: {},
              wx: s.wx, wy: s.wy, wz: s.wz, darkness: s.darkness
            });
          }
        }

        // --- EMBERS ---
        for (let i = 0; i < 90; i++) {
          const ex = rng(i, 10) * W;
          const ey = hY + (H - hY) * (0.4 + rng(i, 11) * 0.55);
          const sz = 0.4 + rng(i, 12) * 1.0;
          const pulse = Math.sin(time * 2.5 + i * 1.8) * 0.5 + 0.5;
          const ea = (0.3 + pulse * 0.5) * alphaScale;
          const eg = ctx.createRadialGradient(ex, ey, 0, ex, ey, sz * 3);
          eg.addColorStop(0, 'rgba(255,130,40,' + (ea * 0.25) + ')');
          eg.addColorStop(1, 'rgba(255,80,20,0)');
          ctx.fillStyle = eg;
          ctx.fillRect(ex - sz * 3, ey - sz * 3, sz * 6, sz * 6);
          ctx.beginPath(); ctx.arc(ex, ey, sz, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(255,150,55,' + ea + ')'; ctx.fill();
        }

        for (let i = 0; i < 12; i++) {
          const fx = rng(i, 20) * W;
          const prog = ((time * 0.02 + i * 1.5) % 1);
          const fy = H - prog * H * 0.4;
          const fa = Math.sin(prog * Math.PI) * 0.45 * alphaScale;
          if (fa > 0.03) {
            ctx.beginPath();
            ctx.arc(fx + Math.sin(time * 0.5 + i) * 10, fy, 0.6 + prog * 0.8, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255,140,50,' + fa + ')'; ctx.fill();
          }
        }
      } // end BATTLEGROUND block

      // --- Atmospheric lightning (sky to ground) ---
      const lightningActive = Math.sin(time * 3) > 0.6;
      if (lightningActive) {
        const lightA = (0.12 + Math.sin(time * 8) * 0.08) * alphaScale;
        ctx.strokeStyle = `rgba(255, 150, 70, ${lightA})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        const boltX = w * (0.3 + hash(Math.floor(time * 5)) * 0.4);
        let lx = boltX;
        let ly = h * 0.15;
        ctx.moveTo(lx, ly);
        for (let seg = 0; seg < 10; seg++) {
          lx += (hash(seg * 41.7 + Math.floor(time * 5) * 13.3) - 0.5) * w * 0.06;
          ly += h * 0.06;
          ctx.lineTo(lx, ly);
        }
        ctx.stroke();
        // Warm red-orange glow around lightning
        ctx.strokeStyle = `rgba(255, 100, 50, ${lightA * 0.25})`;
        ctx.lineWidth = 6;
        ctx.stroke();
      }

      // (Floating 3D rock removed)

      // --- Atmospheric mist layers ---
      for (const m of mistLayers) {
        const my = m.yNorm * h;
        const drift = time * m.speed * w;
        const mistW = m.scale * w * 3;

        for (let rep = -1; rep <= 2; rep++) {
          const mx = ((drift + rep * mistW) % (w + mistW)) - mistW * 0.5;
          const mistGrd = ctx.createRadialGradient(mx, my, 0, mx, my, mistW * 0.5);
          const mistAlpha = m.opacity * alphaScale * (0.8 + Math.sin(time * 0.4 + m.yNorm * 10) * 0.2);
          mistGrd.addColorStop(0, `rgba(180, 140, 80, ${mistAlpha})`);
          mistGrd.addColorStop(0.4, `rgba(140, 100, 50, ${mistAlpha * 0.5})`);
          mistGrd.addColorStop(1, 'rgba(100, 70, 30, 0)');
          ctx.fillStyle = mistGrd;
          ctx.fillRect(mx - mistW * 0.5, my - mistW * 0.3, mistW, mistW * 0.6);
        }
      }

      // --- Burning ash particles ---
      for (const a of ashes) {
        // Rising motion with horizontal wobble (like real embers)
        const ax = ((a.x * w + Math.sin(time * 0.8 + a.drift) * a.wobble * 40 + time * 5) % (w + 20)) - 10;
        const ay = ((a.y * h - time * a.speed * 12 + Math.sin(time * 0.5 + a.drift) * 15) % (h + 20)) - 10;

        if (ax < -5 || ax > w + 5 || ay < -5 || ay > h + 5) continue;

        // Ember glow pulse
        const pulse = Math.sin(time * 1.5 + a.glowPhase) * 0.5 + 0.5;
        const rot = a.rotation + time * a.rotSpeed;

        ctx.save();
        ctx.translate(ax, ay);
        ctx.rotate(rot);

        if (a.ember) {
          // Glowing ember — orange-red, bright core
          const eAlpha = (0.25 + pulse * 0.35) * alphaScale;
          const eR = Math.round(255 - pulse * 30);
          const eG = Math.round(100 + pulse * 60);
          const eB = Math.round(20 + pulse * 20);

          // Irregular ash shape (small elongated rect, not circle)
          ctx.fillStyle = `rgba(${eR}, ${eG}, ${eB}, ${eAlpha})`;
          ctx.fillRect(-a.size * 0.6, -a.size * 0.3, a.size * 1.2, a.size * 0.6);

          // Ember glow halo
          const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, a.size * 3);
          glow.addColorStop(0, `rgba(255, 120, 30, ${eAlpha * 0.25})`);
          glow.addColorStop(0.5, `rgba(255, 80, 10, ${eAlpha * 0.08})`);
          glow.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = glow;
          ctx.fillRect(-a.size * 3, -a.size * 3, a.size * 6, a.size * 6);
        } else {
          // Dark ash flake — nearly black, subtle
          const darkAlpha = (0.15 + pulse * 0.1) * alphaScale;
          ctx.fillStyle = `rgba(40, 30, 20, ${darkAlpha})`;
          ctx.fillRect(-a.size * 0.5, -a.size * 0.2, a.size, a.size * 0.4);
        }

        ctx.restore();
      }

      // === FISHEYE LENS DISTORTION — barrel warp, edges bulge outward ===
      // For each output pixel, find where it came from in the undistorted image
      // by reversing the barrel equation: r_distorted = r * (1 + k * r^2)
      {
        const imgData = ctx.getImageData(0, 0, w, h);
        const src = imgData.data;
        const outData = ctx.createImageData(w, h);
        const dst = outData.data;
        const cx = w * 0.5, cy = h * 0.4;
        const normR = Math.max(w, h) * 0.5;
        const k = 0.15;
        // Pre-compute zoom to compensate: at the farthest corner, distort is largest
        // so we scale down the lookup to keep everything inside bounds
        const cornerNx = (w - cx) / normR, cornerNy = (h - cy) / normR;
        const cornerR2 = cornerNx * cornerNx + cornerNy * cornerNy;
        const maxDistort = 1 + k * cornerR2;
        // Scale factor: shrink the distorted lookup so corners still map inside
        const zoomCompensate = 1 / maxDistort;
        for (let y = 0; y < h; y++) {
          for (let x = 0; x < w; x++) {
            const nx = (x - cx) / normR;
            const ny = (y - cy) / normR;
            const r2 = nx * nx + ny * ny;
            // Pincushion: horizon sags down in center, edges pull up
            // Zoom-compensated so frame stays clean rectangle
            const distort = (1 + k * r2) * zoomCompensate;
            const sx = cx + nx * distort * normR;
            const sy = cy + ny * distort * normR;
            const di = (y * w + x) * 4;
            // Clamp to canvas bounds — no black pixels
            const sxi = Math.max(0, Math.min(w - 1, Math.round(sx)));
            const syi = Math.max(0, Math.min(h - 1, Math.round(sy)));
            {
              const si = (syi * w + sxi) * 4;
              dst[di] = src[si]; dst[di+1] = src[si+1]; dst[di+2] = src[si+2]; dst[di+3] = src[si+3];
            }
          }
        }
        ctx.putImageData(outData, 0, 0);
      }

      // --- Vignette darkening at edges ---
      const vigX = w * 0.5;
      const vigY = h * 0.45;
      const vigR = Math.max(w, h) * 0.75;
      const vig = ctx.createRadialGradient(vigX, vigY, vigR * 0.4, vigX, vigY, vigR);
      vig.addColorStop(0, 'rgba(0,0,0,0)');
      vig.addColorStop(0.6, `rgba(0,0,0,${0.15 * alphaScale})`);
      vig.addColorStop(1, `rgba(0,0,0,${0.4 * alphaScale})`);
      ctx.fillStyle = vig;
      ctx.fillRect(0, 0, w, h);
    };

    animId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', init);
    };
  }, [oledMode, animationsEnabled]);

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none" style={{zIndex: 1, willChange: 'transform'}} aria-hidden="true" role="presentation" />;
});
AugustaRuins.displayName = 'AugustaRuins';

// §BANNER_PARTICLES: Theme-driven particle overlay — each banner gets a fitting visual personality
// Character-specific theme overrides (matched to their banner art mood)
const CHARACTER_THEME_MAP = {
  Sigrika: 'sparkle',    // warm, magical, golden sparkles at feet, starry sky
  Qiuyuan: 'qiuyuan',    // dark forest, moon, crows, brume, swirling leaves
  Aemeath: 'frost',      // ice crystals, cold blue digital structures
  'Luuk Herssen': 'feathers', // white doves, bright nature, airy
  Chisa: 'energy',       // urban, red energy lines, industrial
  Galbrena: 'embers',    // fire/ice duality, intense swirling flames
  Augusta: 'embers',     // grand, dragon wings, fire, golden city
  Lupa: 'embers',        // battle energy, red/white explosive swirl
  Mornye: 'cosmic',      // cosmic water, ethereal blue sphere
  Iuno: 'cosmic',        // ocean/cosmic, swirling water energy
};
// Element-based fallback for characters without specific overrides
const ELEMENT_THEME_FALLBACK = {
  Fusion: 'embers', Glacio: 'frost', Aero: 'feathers',
  Havoc: 'mist', Electro: 'energy', Spectro: 'sparkle',
};

// ── Theme definitions: each returns { particles[], draw(ctx, particles, t, w, h) } ──
const BANNER_THEMES = {
  // ✨ SPARKLE: golden 4-point stars twinkling + warm motes floating up + orange glow
  sparkle: (w, h) => {
    const stars = Array.from({ length: 18 }, () => ({
      x: Math.random() * w, y: h * 0.15 + Math.random() * h * 0.83,
      size: 2.2 + Math.random() * 3.5, phase: Math.random() * Math.PI * 2,
      speed: 0.5 + Math.random() * 1.5,
    }));
    const motes = Array.from({ length: 14 }, () => ({
      x: Math.random() * w, y: Math.random() * h,
      vy: -0.15 - Math.random() * 0.25, phase: Math.random() * Math.PI * 2,
      size: 1.2 + Math.random() * 2, alpha: 0.5 + Math.random() * 0.4,
    }));
    // Orange glow zone — bottom-left warm ambient light
    const glowX = w * 0.2, glowY = h * 0.85;
    return (ctx, t) => {
      // Ambient orange glow — subtle warm light from bottom-left
      const gPulse = 0.7 + Math.sin(t * 0.12) * 0.2 + Math.sin(t * 0.07 + 1.5) * 0.1;
      ctx.save();
      ctx.globalAlpha = 0.18 * gPulse;
      const og = ctx.createRadialGradient(glowX, glowY, 0, glowX, glowY, w * 0.45);
      og.addColorStop(0, 'rgba(255,160,50,0.4)');
      og.addColorStop(0.4, 'rgba(255,130,30,0.15)');
      og.addColorStop(1, 'rgba(255,100,20,0)');
      ctx.fillStyle = og;
      ctx.beginPath(); ctx.arc(glowX, glowY, w * 0.45, 0, Math.PI * 2); ctx.fill();
      ctx.restore();

      for (const s of stars) {
        const tw = Math.sin(t * s.speed + s.phase);
        const a = Math.max(0, tw) * 0.95;
        if (a < 0.05) continue;
        ctx.save();
        ctx.globalAlpha = a;
        ctx.fillStyle = 'rgba(255,220,100,1)';
        ctx.shadowColor = 'rgba(255,200,50,0.9)';
        ctx.shadowBlur = 12;
        const sz = s.size * (0.6 + tw * 0.4);
        ctx.beginPath();
        ctx.moveTo(s.x, s.y - sz * 2); ctx.lineTo(s.x + sz * 0.35, s.y - sz * 0.35);
        ctx.lineTo(s.x + sz * 2, s.y); ctx.lineTo(s.x + sz * 0.35, s.y + sz * 0.35);
        ctx.lineTo(s.x, s.y + sz * 2); ctx.lineTo(s.x - sz * 0.35, s.y + sz * 0.35);
        ctx.lineTo(s.x - sz * 2, s.y); ctx.lineTo(s.x - sz * 0.35, s.y - sz * 0.35);
        ctx.closePath(); ctx.fill();
        ctx.restore();
      }
      for (const m of motes) {
        m.y += m.vy;
        m.x += Math.sin(t * 0.5 + m.phase) * 0.2;
        if (m.y < -5) { m.y = h + 5; m.x = Math.random() * w; }
        ctx.save();
        ctx.globalAlpha = m.alpha * (0.6 + Math.sin(t + m.phase) * 0.4);
        ctx.fillStyle = 'rgba(255,240,180,1)';
        ctx.shadowColor = 'rgba(255,220,100,0.8)';
        ctx.shadowBlur = 12;
        ctx.beginPath(); ctx.arc(m.x, m.y, m.size, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      }
    };
  },

  // 🌫️ MIST: dark fog wisps drifting + falling leaves/feathers
  mist: (w, h) => {
    const fog = Array.from({ length: 6 }, () => ({
      x: Math.random() * w * 1.5, y: h * 0.2 + Math.random() * h * 0.6,
      size: 50 + Math.random() * 70, vx: -0.15 - Math.random() * 0.2,
      alpha: 0.05 + Math.random() * 0.06, phase: Math.random() * Math.PI * 2,
    }));
    const leaves = Array.from({ length: 8 }, () => ({
      x: Math.random() * w, y: -10 - Math.random() * h * 0.5,
      size: 1.3 + Math.random() * 2.5, vy: 0.2 + Math.random() * 0.35,
      vx: -0.1 - Math.random() * 0.2, swayAmp: 6 + Math.random() * 12,
      swaySpeed: 0.3 + Math.random() * 0.5, phase: Math.random() * Math.PI * 2,
      rot: Math.random() * Math.PI * 2, rotV: (Math.random() - 0.5) * 0.015,
      alpha: 0.25 + Math.random() * 0.35,
    }));
    return (ctx, t) => {
      for (const f of fog) {
        f.x += f.vx + Math.sin(t * 0.2 + f.phase) * 0.1;
        if (f.x < -f.size * 2) f.x = w + f.size;
        const pulse = f.alpha * (0.7 + Math.sin(t * 0.3 + f.phase) * 0.3);
        ctx.save();
        ctx.globalAlpha = pulse;
        const grad = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, f.size);
        grad.addColorStop(0, 'rgba(80,90,100,0.6)');
        grad.addColorStop(1, 'rgba(60,70,80,0)');
        ctx.fillStyle = grad;
        ctx.beginPath(); ctx.arc(f.x, f.y, f.size, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      }
      for (const l of leaves) {
        l.y += l.vy; l.x += l.vx; l.rot += l.rotV;
        const sx = l.x + Math.sin(t * l.swaySpeed + l.phase) * l.swayAmp;
        if (l.y > h + 10) { l.y = -8; l.x = Math.random() * w; }
        ctx.save();
        ctx.globalAlpha = l.alpha;
        ctx.translate(sx, l.y); ctx.rotate(l.rot);
        ctx.fillStyle = 'rgba(50,60,50,0.9)';
        ctx.beginPath(); ctx.ellipse(0, 0, l.size * 0.5, l.size * 1.8, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    };
  },

  // ❄️ FROST: ice crystal particles drifting down + cold blue sparkle dots
  frost: (w, h) => {
    const crystals = Array.from({ length: 12 }, () => ({
      x: Math.random() * w, y: -5 - Math.random() * h * 0.3,
      size: 2 + Math.random() * 2.5, vy: 0.15 + Math.random() * 0.3,
      vx: (Math.random() - 0.5) * 0.15, rot: Math.random() * Math.PI * 2,
      rotV: (Math.random() - 0.5) * 0.01, alpha: 0.35 + Math.random() * 0.4,
    }));
    const dots = Array.from({ length: 12 }, () => ({
      x: Math.random() * w, y: Math.random() * h,
      phase: Math.random() * Math.PI * 2, speed: 0.4 + Math.random() * 0.8,
      size: 0.7 + Math.random() * 1.3,
    }));
    return (ctx, t) => {
      for (const c of crystals) {
        c.y += c.vy; c.x += c.vx; c.rot += c.rotV;
        if (c.y > h + 10) { c.y = -8; c.x = Math.random() * w; }
        ctx.save();
        ctx.globalAlpha = c.alpha;
        ctx.translate(c.x, c.y); ctx.rotate(c.rot);
        ctx.strokeStyle = 'rgba(140,220,240,0.9)';
        ctx.lineWidth = 0.8;
        ctx.shadowColor = 'rgba(100,200,240,0.6)';
        ctx.shadowBlur = 7;
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
          const a = (Math.PI / 3) * i;
          ctx[i === 0 ? 'moveTo' : 'lineTo'](Math.cos(a) * c.size, Math.sin(a) * c.size);
        }
        ctx.closePath(); ctx.stroke();
        ctx.restore();
      }
      for (const d of dots) {
        const a = Math.pow(Math.max(0, Math.sin(t * d.speed + d.phase)), 2) * 0.8;
        if (a < 0.03) continue;
        ctx.save();
        ctx.globalAlpha = a;
        ctx.fillStyle = 'rgba(180,230,255,1)';
        ctx.shadowColor = 'rgba(100,200,240,0.7)';
        ctx.shadowBlur = 8;
        ctx.beginPath(); ctx.arc(d.x, d.y, d.size, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      }
    };
  },

  // 🔥 EMBERS: orange/red sparks rising + heat shimmer
  embers: (w, h) => {
    const sparks = Array.from({ length: 14 }, () => ({
      x: Math.random() * w, y: h * 0.4 + Math.random() * h * 0.6,
      vy: -0.3 - Math.random() * 0.6, vx: (Math.random() - 0.5) * 0.3,
      size: 1.1 + Math.random() * 1.8, alpha: 0.45 + Math.random() * 0.4,
      phase: Math.random() * Math.PI * 2, life: Math.random(),
      lifeSpeed: 0.004 + Math.random() * 0.005,
      color: Math.random() > 0.4 ? '255,130,40' : '255,80,30',
    }));
    return (ctx, t) => {
      for (const s of sparks) {
        s.life += s.lifeSpeed;
        if (s.life > 1) {
          s.life = 0; s.x = Math.random() * w; s.y = h * 0.4 + Math.random() * h * 0.6;
        }
        s.y += s.vy; s.x += s.vx + Math.sin(t * 2 + s.phase) * 0.3;
        const fade = s.life < 0.1 ? s.life / 0.1 : s.life > 0.6 ? (1 - s.life) / 0.4 : 1;
        const a = s.alpha * fade;
        if (a < 0.02) continue;
        ctx.save();
        ctx.globalAlpha = a;
        ctx.fillStyle = `rgba(${s.color},1)`;
        ctx.shadowColor = `rgba(${s.color},0.8)`;
        ctx.shadowBlur = 8;
        ctx.beginPath(); ctx.arc(s.x, s.y, s.size * (0.5 + fade * 0.5), 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      ctx.save();
      ctx.globalAlpha = 0.025 + Math.sin(t * 0.5) * 0.015;
      const hg = ctx.createLinearGradient(0, h, 0, h * 0.4);
      hg.addColorStop(0, 'rgba(255,100,30,0.4)');
      hg.addColorStop(1, 'rgba(255,100,30,0)');
      ctx.fillStyle = hg;
      ctx.fillRect(0, h * 0.4, w, h * 0.6);
      ctx.restore();
    };
  },

  // 🕊️ FEATHERS: white feathers floating up + soft light dots
  feathers: (w, h) => {
    const feathers = Array.from({ length: 7 }, () => ({
      x: Math.random() * w, y: h + Math.random() * h * 0.3,
      vy: -0.15 - Math.random() * 0.25, vx: (Math.random() - 0.5) * 0.15,
      swayAmp: 10 + Math.random() * 15, swaySpeed: 0.3 + Math.random() * 0.4,
      rot: Math.random() * Math.PI * 2, rotV: (Math.random() - 0.5) * 0.008,
      size: 2 + Math.random() * 2.5, alpha: 0.3 + Math.random() * 0.4,
      phase: Math.random() * Math.PI * 2,
    }));
    const lights = Array.from({ length: 10 }, () => ({
      x: Math.random() * w, y: Math.random() * h,
      phase: Math.random() * Math.PI * 2, speed: 0.3 + Math.random() * 0.5,
      size: 0.8 + Math.random() * 1,
    }));
    return (ctx, t) => {
      for (const f of feathers) {
        f.y += f.vy; f.x += f.vx; f.rot += f.rotV;
        const sx = f.x + Math.sin(t * f.swaySpeed + f.phase) * f.swayAmp;
        if (f.y < -15) { f.y = h + 10; f.x = Math.random() * w; }
        ctx.save();
        ctx.globalAlpha = f.alpha;
        ctx.translate(sx, f.y); ctx.rotate(f.rot);
        ctx.fillStyle = 'rgba(255,255,250,0.85)';
        ctx.shadowColor = 'rgba(255,250,230,0.5)';
        ctx.shadowBlur = 6;
        ctx.beginPath(); ctx.ellipse(0, 0, f.size * 0.4, f.size * 2, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = 'rgba(220,210,190,0.4)';
        ctx.lineWidth = 0.4;
        ctx.beginPath(); ctx.moveTo(0, -f.size * 1.8); ctx.lineTo(0, f.size * 1.8); ctx.stroke();
        ctx.restore();
      }
      for (const l of lights) {
        const a = Math.pow(Math.max(0, Math.sin(t * l.speed + l.phase)), 2) * 0.6;
        if (a < 0.03) continue;
        ctx.save();
        ctx.globalAlpha = a;
        ctx.fillStyle = 'rgba(255,240,200,1)';
        ctx.shadowColor = 'rgba(255,230,160,0.5)';
        ctx.shadowBlur = 7;
        ctx.beginPath(); ctx.arc(l.x, l.y, l.size, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      }
    };
  },

  // ⚡ ENERGY: sharp quick line flashes + geometric bright dots
  energy: (w, h) => {
    const flashes = Array.from({ length: 7 }, () => ({
      x: Math.random() * w, y: Math.random() * h,
      angle: Math.random() * Math.PI, len: 18 + Math.random() * 30,
      phase: Math.random() * 20, speed: 3 + Math.random() * 4,
      color: Math.random() > 0.5 ? '255,60,80' : '255,255,255',
    }));
    const dots = Array.from({ length: 12 }, () => ({
      x: Math.random() * w, y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.8, vy: (Math.random() - 0.5) * 0.5,
      size: 0.7 + Math.random() * 1.2, alpha: 0.4 + Math.random() * 0.45,
      phase: Math.random() * Math.PI * 2,
    }));
    return (ctx, t) => {
      for (const f of flashes) {
        f.phase += 0.016 * f.speed;
        const cycle = f.phase % 8;
        const a = cycle < 0.3 ? cycle / 0.3 : cycle < 0.6 ? (0.6 - cycle) / 0.3 : 0;
        if (a < 0.02) {
          if (cycle > 7.5) { f.x = Math.random() * w; f.y = Math.random() * h; f.angle = Math.random() * Math.PI; }
          continue;
        }
        ctx.save();
        ctx.globalAlpha = a * 0.7;
        ctx.strokeStyle = `rgba(${f.color},1)`;
        ctx.shadowColor = `rgba(${f.color},0.7)`;
        ctx.shadowBlur = 6;
        ctx.lineWidth = 1.2;
        const dx = Math.cos(f.angle) * f.len * 0.5;
        const dy = Math.sin(f.angle) * f.len * 0.5;
        ctx.beginPath(); ctx.moveTo(f.x - dx, f.y - dy); ctx.lineTo(f.x + dx, f.y + dy); ctx.stroke();
        ctx.restore();
      }
      for (const d of dots) {
        d.x += d.vx; d.y += d.vy;
        if (d.x < 0 || d.x > w) d.vx *= -1;
        if (d.y < 0 || d.y > h) d.vy *= -1;
        const pulse = d.alpha * (0.5 + Math.sin(t * 3 + d.phase) * 0.5);
        ctx.save();
        ctx.globalAlpha = pulse;
        ctx.fillStyle = 'rgba(255,200,200,1)';
        ctx.shadowColor = 'rgba(255,60,80,0.6)';
        ctx.shadowBlur = 5;
        ctx.fillRect(d.x - d.size, d.y - d.size, d.size * 2, d.size * 2);
        ctx.restore();
      }
    };
  },

  // 🌌 COSMIC: slow orbiting particles + soft radial glow pulses
  cosmic: (w, h) => {
    const cx = w * 0.5, cy = h * 0.45, radius = Math.min(w, h) * 0.3;
    const orbiters = Array.from({ length: 12 }, () => ({
      angle: Math.random() * Math.PI * 2,
      speed: 0.08 + Math.random() * 0.12,
      rOff: (Math.random() - 0.5) * 20,
      size: 0.8 + Math.random() * 1.5, alpha: 0.25 + Math.random() * 0.4,
      phase: Math.random() * Math.PI * 2,
    }));
    const glows = Array.from({ length: 4 }, () => ({
      x: w * 0.2 + Math.random() * w * 0.6, y: h * 0.15 + Math.random() * h * 0.6,
      size: 25 + Math.random() * 40, phase: Math.random() * Math.PI * 2,
      speed: 0.2 + Math.random() * 0.3,
    }));
    return (ctx, t) => {
      for (const g of glows) {
        const a = 0.035 + Math.sin(t * g.speed + g.phase) * 0.025;
        if (a < 0.005) continue;
        ctx.save();
        ctx.globalAlpha = a;
        const grad = ctx.createRadialGradient(g.x, g.y, 0, g.x, g.y, g.size);
        grad.addColorStop(0, 'rgba(100,180,255,0.7)');
        grad.addColorStop(1, 'rgba(60,120,200,0)');
        ctx.fillStyle = grad;
        ctx.beginPath(); ctx.arc(g.x, g.y, g.size, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      }
      for (const o of orbiters) {
        o.angle += o.speed * 0.016;
        const r = radius + o.rOff + Math.sin(t * 0.5 + o.phase) * 5;
        const ox = cx + Math.cos(o.angle) * r;
        const oy = cy + Math.sin(o.angle) * r * 0.4;
        const pulse = 0.6 + Math.sin(t * 0.8 + o.phase) * 0.4;
        ctx.save();
        ctx.globalAlpha = o.alpha * pulse;
        ctx.fillStyle = 'rgba(140,200,255,1)';
        ctx.shadowColor = 'rgba(100,180,255,0.6)';
        ctx.shadowBlur = 7;
        ctx.beginPath(); ctx.arc(ox, oy, o.size, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      }
    };
  },

  // 🌙 QIUYUAN: moonlit brume, drifting leaves, jade glints
  qiuyuan: (w, h) => {
    // Brume patches — muted grey-green
    const brume = Array.from({ length: 7 }, () => ({
      x: Math.random() * w * 1.5, y: h * 0.2 + Math.random() * h * 0.6,
      size: 60 + Math.random() * 80, vx: -0.12 - Math.random() * 0.18,
      alpha: 0.12 + Math.random() * 0.1, phase: Math.random() * Math.PI * 2,
    }));
    // Leaves — varied shade/size/speed, brighter near moon, darker far away
    const moonX = w * 0.645, moonY = h * 0.115;
    // Leaves spawn from top-right, drift down-left
    // Color: very dark (20,25,35) on right → light (120,135,155) on left
    const leaves = Array.from({ length: 22 }, (_, i) => {
      // Spawn from top edge (wider spread) and right edge (upper half)
      const fromRight = Math.random() < 0.35;
      const lx = fromRight ? w + Math.random() * 10 : w * 0.15 + Math.random() * w * 0.85;
      const ly = fromRight ? Math.random() * h * 0.55 : -Math.random() * 20;
      return {
        x: lx, y: ly,
        size: 1.5 + Math.random() * 7,
        vy: 0.12 + Math.random() * 0.2,
        vx: -0.25 - Math.random() * 0.3, swayAmp: 12 + Math.random() * 22,
        swaySpeed: 0.15 + Math.random() * 0.28, phase: Math.random() * Math.PI * 2,
        rot: Math.random() * Math.PI * 2,
        rotV: 0.015 + Math.random() * 0.025,
        spinPhase: Math.random() * Math.PI * 2,
        spinSpeed: 0.4 + Math.random() * 0.6,
        alpha: 0.55 + Math.random() * 0.25,
        colorShift: Math.random(),
      };
    });
    // Jade glint particles
    const jadeGlints = Array.from({ length: 12 }, () => ({
      x: Math.random() * w, y: h * 0.15 + Math.random() * h * 0.75,
      phase: Math.random() * Math.PI * 2, speed: 0.3 + Math.random() * 0.5,
      size: 1.2 + Math.random() * 2,
    }));
    const moonR = 38;
    return (ctx, t) => {
      // Moon glow handled by CSS-animated div in BannerParticleOverlay
      // Brume
      for (const b of brume) {
        b.x += b.vx + Math.sin(t * 0.15 + b.phase) * 0.08;
        if (b.x < -b.size * 2) b.x = w + b.size;
        const pulse = b.alpha * (0.7 + Math.sin(t * 0.25 + b.phase) * 0.3);
        ctx.save();
        ctx.globalAlpha = pulse;
        const grad = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.size);
        grad.addColorStop(0, 'rgba(100,160,120,0.5)');
        grad.addColorStop(1, 'rgba(60,100,70,0)');
        ctx.fillStyle = grad;
        ctx.beginPath(); ctx.arc(b.x, b.y, b.size, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      }
      // Drifting leaves — circular rotation, strong leftward drift, wide color range
      for (const l of leaves) {
        l.y += l.vy; l.x += l.vx;
        l.rot += l.rotV;
        const sx = l.x + Math.sin(t * l.swaySpeed + l.phase) * l.swayAmp;
        if (l.y > h + 10 || l.x < -20) {
          const fromRight = Math.random() < 0.35;
          l.x = fromRight ? w + Math.random() * 10 : w * 0.15 + Math.random() * w * 0.85;
          l.y = fromRight ? Math.random() * h * 0.55 : -Math.random() * 20;
          l.size = 1.5 + Math.random() * 7;
          l.alpha = 0.55 + Math.random() * 0.25;
          l.colorShift = Math.random();
        }
        // 3D self-rotation: cos squashes width to simulate tumbling
        const spin = Math.cos(t * l.spinSpeed + l.spinPhase);
        const widthScale = 0.2 + Math.abs(spin) * 0.8;
        // Color: dark (8,12,18) to cool blue-grey (120,135,170)
        // Each leaf has its own colorShift, plus face shading from spin
        const faceBias = spin * 0.12;
        const cm = Math.min(1, Math.max(0, l.colorShift + faceBias));
        const lr = Math.floor(8 + cm * 112);
        const lg = Math.floor(12 + cm * 123);
        const lb = Math.floor(18 + cm * 152);
        ctx.save();
        ctx.globalAlpha = l.alpha;
        ctx.translate(sx, l.y); ctx.rotate(l.rot);
        ctx.fillStyle = `rgb(${lr},${lg},${lb})`;
        ctx.beginPath();
        ctx.ellipse(0, 0, l.size * 0.45 * widthScale, l.size * 1.7, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      // Jade glints
      for (const g of jadeGlints) {
        const a = Math.pow(Math.max(0, Math.sin(t * g.speed + g.phase)), 1.5) * 0.95;
        if (a < 0.04) continue;
        ctx.save();
        ctx.globalAlpha = a;
        ctx.fillStyle = 'rgba(140,255,170,1)';
        ctx.shadowColor = 'rgba(100,240,140,0.9)';
        ctx.shadowBlur = 14;
        ctx.beginPath(); ctx.arc(g.x, g.y, g.size, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      }
    };
  },
};

const BannerParticleOverlay = memo(({ characterName, element }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const rect = canvas.parentElement.getBoundingClientRect();
    const w = rect.width || 400;
    const h = rect.height || 190;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);

    // Pick theme: character-specific override → element fallback → sparkle default
    const themeKey = CHARACTER_THEME_MAP[characterName]
      || ELEMENT_THEME_FALLBACK[element]
      || 'sparkle';
    const drawFn = (BANNER_THEMES[themeKey] || BANNER_THEMES.sparkle)(w, h);

    let animId, t = 0;
    const frame = () => {
      ctx.clearRect(0, 0, w, h);
      t += 0.016;
      drawFn(ctx, t);
      animId = requestAnimationFrame(frame);
    };
    animId = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(animId);
  }, [characterName, element]);

  const isQiuyuan = characterName === 'Qiuyuan';

  return (
    <>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none"
        style={{ zIndex: 2, width: '100%', height: '100%' }}
        aria-hidden="true"
      />
      {isQiuyuan && (
        <div
          className="absolute pointer-events-none moon-glow-pulse"
          style={{ left: '65.5%', top: '10.5%', width: '140px', height: '140px', zIndex: 3 }}
          aria-hidden="true"
        />
      )}
    </>
  );
});
BannerParticleOverlay.displayName = 'BannerParticleOverlay';

const BannerCard = memo(({ item, type, stats, bannerImage, visualSettings, endDate, timerColor }) => {
  const isChar = type === 'character';
  const style = BANNER_GRADIENT_MAP[item.element] || BANNER_GRADIENT_MAP.Fusion;
  const imgUrl = item.imageUrl || bannerImage;

  // Use unified mask generator
  const maskGradient = visualSettings
    ? generateMaskGradient(visualSettings.fadePosition, visualSettings.fadeIntensity)
    : generateMaskGradient();
  const pictureOpacity = visualSettings ? visualSettings.pictureOpacity / 100 : 0.9;
  const isFull = visualSettings?.animationsEnabled === 'full';

  return (
    <div className={isFull ? 'banner-card-glow rounded-xl' : ''} style={isFull ? { '--glow-color': style.glow, zIndex: 5 } : { zIndex: 5 }}>
    <div className="relative overflow-hidden rounded-xl border" style={{ height: '190px', isolation: 'isolate', borderColor: style.borderColor, boxShadow: isFull ? 'none' : '0 0 40px rgba(237,175,24,0.06), 0 4px 16px rgba(0,0,0,0.3)' }}>
      {imgUrl && (
        <div className="absolute inset-0" style={{ zIndex: 1 }}>
          <img
            src={imgUrl}
            alt={item.name}
            className="w-full h-full object-cover object-top"
            style={{
              opacity: pictureOpacity,
              maskImage: maskGradient,
              WebkitMaskImage: maskGradient
            }}
            loading="eager"
            onError={hideOnError}
          />
        </div>
      )}
      {imgUrl && isFull && <BannerParticleOverlay characterName={isChar ? item.name : item.forCharacter || item.name} element={item.element} />}

      {endDate && (
        <div className="absolute top-2 right-2 z-20">
          <CountdownTimer endDate={endDate} color={timerColor || 'yellow'} />
        </div>
      )}
      
      <div className="absolute inset-0 z-10 p-3 flex flex-col justify-between" style={TEXT_SHADOW_STYLE}>
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            {item.isNew && <span className="text-[10px] bg-yellow-500 text-black px-1.5 py-0.5 rounded-full font-bold" style={{textShadow: 'none'}}>NEW</span>}
            <span className={`text-[10px] px-2 py-0.5 rounded ${style.text} border`} style={{ borderColor: style.borderColor, backgroundColor: style.bgColor }}>{isChar ? item.element : item.type}</span>
          </div>
          <h4 className="font-bold text-base text-white leading-tight">{item.name}</h4>
          {item.title && <p className="text-gray-200 text-[10px] mt-0.5 line-clamp-1">{item.title}</p>}
        </div>
        
        <div className={stats ? 'mb-14' : ''}>
          <div className="text-gray-300 text-[10px] mb-0.5 uppercase tracking-wider">Featured 4★</div>
          <div className="flex gap-1 flex-wrap">
            {item.featured4Stars.map(n => <span key={n} className="text-[10px] text-cyan-300 bg-cyan-500/30 px-1.5 py-0.5 rounded backdrop-blur-sm">{n}</span>)}
          </div>
        </div>
      </div>
      
      {stats && (
        <div className="absolute bottom-0 left-0 right-0 z-10 border-t border-white/15" style={BANNER_CARD_OVERLAY_STYLE}>
          <div className="flex items-center gap-3">
            <div className="flex-1 flex items-center gap-3">
                <div className="text-center">
                  <div className={`font-bold text-base kuro-number ${isChar ? 'text-yellow-400' : 'text-pink-400'}`}>{stats.pity5}<span className="text-gray-400 text-[10px]">/{HARD_PITY}</span></div>
                  <div className="text-gray-400 text-[10px] mt-0.5">5★ Pity</div>
                </div>
                <div className="text-center">
                  <div className="text-purple-400 font-bold text-sm">{stats.pity4}<span className="text-gray-400 text-[10px]">/10</span></div>
                  <div className="text-gray-400 text-[10px] mt-0.5">4★ Pity</div>
                </div>
                <div className="text-center">
                  <div className="text-white font-bold text-sm">{stats.totalPulls}</div>
                  <div className="text-gray-400 text-[10px] mt-0.5">Convenes</div>
                </div>
              </div>
              {/* MED-27: Escalated from text-[10px] to text-xs font-bold for visual weight */}
              {isChar && (
                <div className={`text-xs font-bold px-2 py-0.5 rounded-full backdrop-blur-sm ${stats.guaranteed ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-orange-500/20 text-orange-400 border border-orange-500/30'}`}>
                  {stats.guaranteed ? '✓ Guaranteed' : '50/50'}
                </div>
              )}
            </div>
          </div>
        )}
    </div>
    </div>
  );
});
BannerCard.displayName = 'BannerCard';

const EventCard = memo(({ event, server, bannerImage, visualSettings, status, onStatusChange }) => {
  const [resetTick, setResetTick] = useState(0);
  const isDaily = event.dailyReset;
  const isWeekly = event.weeklyReset;
  const isRecurring = !isDaily && !isWeekly && event.resetType && /^~?\d+\s*(days?|d|h|m)?$/i.test(event.resetType.trim());
  
  const endDate = useMemo(() => {
    if (isDaily) return getNextDailyReset(server);
    if (isWeekly) return getNextWeeklyReset(server);
    if (isRecurring) return getRecurringEventEnd(event.currentEnd, event.resetType, server);
    return getServerAdjustedEnd(event.currentEnd, server);
  }, [event, server, isDaily, isWeekly, isRecurring, resetTick]);
  
  const handleExpire = useCallback(() => {
    if (isDaily || isWeekly || isRecurring) setResetTick(t => t + 1);
  }, [isDaily, isWeekly, isRecurring]);
  
  const recalcFn = useMemo(() => {
    if (isDaily) return () => getNextDailyReset(server);
    if (isWeekly) return () => getNextWeeklyReset(server);
    if (isRecurring) return () => getRecurringEventEnd(event.currentEnd, event.resetType, server);
    return null;
  }, [isDaily, isWeekly, isRecurring, server, event]);
  
  const colors = EVENT_ACCENT_COLORS[event.accentColor] || EVENT_ACCENT_COLORS.cyan;
  const imgUrl = bannerImage;
  
  const maskGradient = visualSettings 
    ? generateMaskGradient(visualSettings.shadowFadePosition, visualSettings.shadowFadeIntensity)
    : generateMaskGradient();
  const pictureOpacity = visualSettings ? visualSettings.shadowOpacity / 100 : 0.9;
  
  const isDone = status === 'done';
  const isSkipped = status === 'skipped';
  
  return (
    <div className={`relative overflow-hidden rounded-xl border ${isDone ? 'border-emerald-500/30' : isSkipped ? 'border-gray-600/30' : colors.border}`} style={{ height: '190px', isolation: 'isolate', zIndex: 5, opacity: isSkipped ? 0.5 : 1 }}>
      {imgUrl && (
        <img 
          src={imgUrl} 
          alt={event.name} 
          className="absolute inset-0 w-full h-full object-cover"
          style={{
            zIndex: 1,
            opacity: pictureOpacity,
            maskImage: maskGradient,
            WebkitMaskImage: maskGradient,
            filter: isSkipped ? 'grayscale(0.8)' : isDone ? 'grayscale(0.3)' : 'none'
          }}
          loading="lazy"
          onError={hideOnError}
        />
      )}
      
      {isDone && <div className="absolute inset-0 z-[2] bg-emerald-900/20" />}
      
      <div className="absolute inset-0 z-10 p-3 flex flex-col justify-between" style={TEXT_SHADOW_STYLE}>
        <div className="flex justify-between items-start">
          <div className="flex-1 pr-2">
            <h4 className={`font-bold text-sm ${isDone ? 'text-emerald-400' : isSkipped ? 'text-gray-500' : colors.text}`}>
              {isDone && <CheckCircle size={12} className="inline mr-1 -mt-0.5" />}
              {isSkipped && <X size={12} className="inline mr-1 -mt-0.5" />}
              {event.name}
            </h4>
            <p className="text-gray-200 text-[10px]">{event.subtitle}</p>
          </div>
          <div className="text-right flex-shrink-0">
            <div className="text-gray-400 text-[10px] mb-1">{isDaily ? 'Resets in' : isWeekly ? 'Weekly reset' : 'Ends in'}</div>
            <CountdownTimer endDate={endDate} color={event.color} alwaysShow={isDaily || isWeekly || isRecurring} onExpire={handleExpire} recalcFn={recalcFn} />
          </div>
        </div>
        
        <div className="flex justify-between items-end">
          <div className={`inline-block px-2 py-0.5 rounded text-[10px] font-medium ${isDone ? 'bg-emerald-500/20 text-emerald-400' : isSkipped ? 'bg-gray-500/20 text-gray-500 line-through' : `${colors.bg} ${colors.text}`} backdrop-blur-sm`}>
            {event.rewards}
          </div>
          {onStatusChange && (
            <div className="flex gap-1">
              {status ? (
                <button onClick={() => onStatusChange(null)} className="px-3 py-1.5 rounded text-[10px] bg-white/10 text-gray-300 hover:bg-white/20 backdrop-blur-sm transition-colors min-h-[36px]" aria-label={`Undo ${event.name} status`}>
                  Undo
                </button>
              ) : (
                <>
                  <button onClick={() => onStatusChange('done')} className="px-3 py-1.5 rounded text-[10px] bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 backdrop-blur-sm transition-colors min-w-[52px] min-h-[36px] text-center" aria-label={`Mark ${event.name} as done`}>
                    <Check size={10} className="inline -mt-0.5" /> Done
                  </button>
                  <button onClick={() => onStatusChange('skipped')} className="px-3 py-1.5 rounded text-[10px] bg-white/10 text-gray-400 hover:bg-white/20 backdrop-blur-sm transition-colors min-w-[52px] min-h-[36px] text-center" aria-label={`Skip ${event.name}`}>
                    <X size={10} className="inline -mt-0.5" /> Skip
                  </button>
                </>
              )}
            </div>
          )}
          {!onStatusChange && (
            <div className="text-gray-400 text-[10px]">{event.resetType}</div>
          )}
        </div>
      </div>
    </div>
  );
});
EventCard.displayName = 'EventCard';

const ProbabilityBar = memo(({ label, value, color = 'cyan' }) => (
  <div className="flex items-center gap-2" role="meter" aria-label={`${label}: ${value}%`} aria-valuenow={value} aria-valuemin={0} aria-valuemax={100}>
    <span className="text-gray-400 text-[10px] w-12">{label}</span>
    <div className="flex-1 h-5 bg-neutral-800 rounded overflow-hidden">
      <div className={`h-full ${color === 'cyan' ? 'bg-cyan-500' : color === 'pink' ? 'bg-pink-500' : 'bg-yellow-500'} transition-[width] duration-300 flex items-center justify-end pr-1`} style={{ width: `${Math.max(value, 1)}%` }}>
        {value > 10 && <span className="text-[10px] text-black font-bold">{value}%</span>}
      </div>
    </div>
    {value <= 10 && <span className="text-[10px] text-gray-400 w-10">{value}%</span>}
  </div>
));
ProbabilityBar.displayName = 'ProbabilityBar';

// Admin banner storage key
const ADMIN_BANNER_KEY = 'whispering-wishes-admin-banners';
const ADMIN_HASH = 'd0a9f110419bf9487d97f9f99822f6f15c8cd98fed3097a0a0714674aa27feda';

// [SECTION:COLLECTION-GRID]
// Shared component for all collection grids (5★/4★/3★ chars & weapons)
const CollectionGridCard = memo(({ name, count, imgUrl, framing, isSelected, owned, collMask, collOpacity, glowClass, ownedBg, ownedBorder, countLabel, countColor, onClickCard, framingMode, setEditingImage, imageKey, isNew, isProfilePic, onSetProfilePic }) => (
  <div 
    className={`relative overflow-hidden border rounded-lg text-center ${!framingMode ? 'collection-card' : ''} cursor-pointer ${isSelected ? 'border-emerald-500 ring-2 ring-emerald-500/50' : isProfilePic ? ownedBg : owned ? `${ownedBg} ${ownedBorder} ${glowClass}` : 'bg-neutral-800/50 border-neutral-700/50'}`} 
    style={{ height: '140px', contain: 'paint', ...(isProfilePic && !isSelected ? { borderColor: 'rgba(251,146,60,0.7)', boxShadow: '0 0 16px rgba(251,146,60,0.25), inset 0 0 12px rgba(251,146,60,0.06)' } : {}) }}
    role="button"
    tabIndex={0}
    aria-label={`${name}${owned ? `, owned${count > 1 ? ` ×${count}` : ''}` : ', not owned'}${isProfilePic ? ', current profile picture' : ''}${isNew ? ', new' : ''}`}
    onClick={() => {
      if (framingMode) {
        setEditingImage(imageKey);
      } else if (onClickCard) {
        haptic.light();
        onClickCard();
      }
    }}
    onKeyDown={(e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (framingMode) {
          setEditingImage(imageKey);
        } else if (onClickCard) {
          haptic.light();
          onClickCard();
        }
      }
    }}
  >
    {/* P15-FIX: NIT-4 — Skeleton placeholder while image loads, prevents layout shift */}
    {imgUrl ? (
      <div className="absolute inset-0 collection-img-wrap">
        <img
          src={imgUrl}
          alt={name}
          loading="lazy"
          className="w-full h-full object-contain pointer-events-none"
          style={{
            transform: `scale(${framing.zoom / 100}) translate(${-framing.x}%, ${-framing.y}%)`,
            opacity: owned ? collOpacity : 0.3,
            filter: owned ? 'none' : 'grayscale(100%)',
            maskImage: collMask,
            WebkitMaskImage: collMask
          }}
          onError={hideOnError}
        />
      </div>
    ) : (
      <div className="absolute inset-0 bg-neutral-800 animate-pulse" />
    )}
    {isNew && (
      <div className="absolute top-1.5 left-1.5 z-20 px-1.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-yellow-500 text-black" style={{boxShadow: '0 0 8px rgba(237,175,24,0.5)', textShadow: 'none'}}>New</div>
    )}
    {/* Profile pic setter — top-right corner */}
    {owned && !framingMode && onSetProfilePic && (
      <button
        className={`profile-pic-btn absolute z-20 flex items-center justify-center transition-all ${isProfilePic ? 'text-black shadow-lg' : 'bg-black/70 text-gray-500 hover:bg-yellow-500/30 hover:text-yellow-300'}`}
        style={{ top: '4px', right: '4px', width: '22px', height: '22px', minHeight: '22px', borderRadius: '6px', padding: 0, ...(isProfilePic ? { background: '#fb923c', boxShadow: '0 0 10px rgba(251,146,60,0.5)' } : {}) }}
        onClick={(e) => { e.stopPropagation(); onSetProfilePic(name); }}
        title={isProfilePic ? 'Current profile picture' : 'Set as profile picture'}
        aria-label={isProfilePic ? 'Current profile picture' : `Set ${name} as profile picture`}
      >
        <Crown size={12} />
      </button>
    )}
    {isSelected && (
      <div className="absolute top-1 right-1 z-20 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
        <span className="text-black text-[10px]">✓</span>
      </div>
    )}
    <div className="absolute bottom-0 left-0 right-0 z-10 p-2 bg-gradient-to-t from-black/90 via-black/60 to-transparent pointer-events-none" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.9)' }}>
      {owned ? (
        <div className={`${countColor} font-bold text-xl`}>{countLabel}</div>
      ) : (
        <div className="text-gray-500 font-bold text-xl">—</div>
      )}
      <div className={`text-[10px] truncate ${owned ? 'text-gray-200' : 'text-gray-400'}`}>{name}</div>
    </div>
  </div>
), (prev, next) => 
  prev.name === next.name && prev.count === next.count && prev.imgUrl === next.imgUrl &&
  prev.isSelected === next.isSelected && prev.owned === next.owned && prev.collMask === next.collMask &&
  prev.collOpacity === next.collOpacity && prev.framingMode === next.framingMode && prev.isNew === next.isNew &&
  prev.isProfilePic === next.isProfilePic &&
  prev.framing.zoom === next.framing.zoom && prev.framing.x === next.framing.x && prev.framing.y === next.framing.y
);
CollectionGridCard.displayName = 'CollectionGridCard';

// ═══════════════════════════════════════════════════════════════════════════════
// EXTRACTED REUSABLE COMPONENTS (Part 4 deduplication)
// ═══════════════════════════════════════════════════════════════════════════════

// Visual slider group — eliminates ~286 lines of duplication across admin modal + mini window
const VisualSliderGroup = memo(({ title, color, sliders, visualSettings, saveVisualSettings, compact = false, directionControl = null }) => {
  const colorMap = {
    cyan: { text: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/30', accent: 'accent-cyan-500', activeBg: 'bg-cyan-500/30', activeBorder: 'border-cyan-500/50' },
    emerald: { text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', accent: 'accent-emerald-500', activeBg: 'bg-emerald-500/30', activeBorder: 'border-emerald-500/50' },
    pink: { text: 'text-pink-400', bg: 'bg-pink-500/10', border: 'border-pink-500/30', accent: 'accent-pink-500', activeBg: 'bg-pink-500/30', activeBorder: 'border-pink-500/50' },
    purple: { text: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/30', accent: 'accent-purple-500', activeBg: 'bg-purple-500/30', activeBorder: 'border-purple-500/50' },
  };
  const c = colorMap[color] || colorMap.cyan;

  const renderSlider = (slider) => (
    <div key={slider.key}>
      <div className={`flex justify-between text-[${compact ? '9px' : '10px'}] mb-${compact ? '0.5' : '1'}`}>
        <span className={compact ? 'text-gray-400' : 'text-gray-300'}>{compact ? slider.shortLabel : slider.label}</span>
        <span className={c.text}>{visualSettings[slider.key] ?? slider.fallback ?? 50}%</span>
      </div>
      <input type="range" min="0" max="100" value={visualSettings[slider.key] ?? slider.fallback ?? 50} onChange={(e) => saveVisualSettings({ ...visualSettings, [slider.key]: parseInt(e.target.value, 10) })} className={`w-full h-1.5 bg-neutral-700 rounded-lg appearance-none cursor-pointer ${c.accent}`} aria-label={slider.label} />
    </div>
  );

  if (compact) {
    return (
      <div className="space-y-2 border-t border-[var(--border-medium)] pt-2">
        <h4 className={`${c.text} text-[10px] font-medium uppercase tracking-wider`}>{title}</h4>
        {directionControl && (
          <div className="flex gap-1 mb-1.5">
            <button onClick={() => saveVisualSettings({ ...visualSettings, [directionControl.key]: 'top' })} className={`flex-1 py-1 rounded text-[10px] ${visualSettings[directionControl.key] === 'top' ? `${c.activeBg} ${c.text}` : 'bg-neutral-700 text-gray-500'}`} aria-label={`Set ${directionControl.key} direction to top`} aria-pressed={visualSettings[directionControl.key] === 'top'}>↑ Top</button>
            <button onClick={() => saveVisualSettings({ ...visualSettings, [directionControl.key]: 'bottom' })} className={`flex-1 py-1 rounded text-[10px] ${visualSettings[directionControl.key] === 'bottom' ? `${c.activeBg} ${c.text}` : 'bg-neutral-700 text-gray-500'}`} aria-label={`Set ${directionControl.key} direction to bottom`} aria-pressed={visualSettings[directionControl.key] === 'bottom'}>↓ Bottom</button>
          </div>
        )}
        <div className="space-y-1.5">{sliders.map(renderSlider)}</div>
      </div>
    );
  }

  return (
    <div className={`${c.bg} ${c.border} border rounded p-3`}>
      <h3 className={`${c.text} text-sm font-medium mb-3`}>{title}</h3>
      {directionControl && (
        <div className="space-y-3 mb-3">
          <div>
            <div className="flex justify-between text-[10px] mb-1">
              <span className="text-gray-300">Fade Direction</span>
              <span className={c.text}>{visualSettings[directionControl.key] === 'top' ? '↑ Top' : '↓ Bottom'}</span>
            </div>
            <div className="flex gap-2">
              <button onClick={() => saveVisualSettings({ ...visualSettings, [directionControl.key]: 'top' })} className={`flex-1 py-1.5 rounded text-[10px] transition-all ${visualSettings[directionControl.key] === 'top' ? `${c.activeBg} ${c.text} border ${c.activeBorder}` : 'bg-neutral-700 text-gray-400'}`}>↑ Fade to Top</button>
              <button onClick={() => saveVisualSettings({ ...visualSettings, [directionControl.key]: 'bottom' })} className={`flex-1 py-1.5 rounded text-[10px] transition-all ${visualSettings[directionControl.key] === 'bottom' ? `${c.activeBg} ${c.text} border ${c.activeBorder}` : 'bg-neutral-700 text-gray-400'}`}>↓ Fade to Bottom</button>
            </div>
          </div>
        </div>
      )}
      <div className="space-y-3">{sliders.map(renderSlider)}</div>
    </div>
  );
});
VisualSliderGroup.displayName = 'VisualSliderGroup';

// Visual slider configuration data — shared between admin modal and mini window
const VISUAL_SLIDER_CONFIGS = [
  {
    title: 'Banner Card Settings', compactTitle: 'Featured Banners', color: 'cyan',
    sliders: [
      { label: 'Fade Position', shortLabel: 'Fade Pos', key: 'fadePosition' },
      { label: 'Fade Intensity', shortLabel: 'Intensity', key: 'fadeIntensity' },
      { label: 'Picture Opacity', shortLabel: 'Opacity', key: 'pictureOpacity' },
    ],
  },
  {
    title: 'Standard Banner Settings', compactTitle: 'Standard Banners', color: 'emerald',
    sliders: [
      { label: 'Fade Position', shortLabel: 'Fade Pos', key: 'standardFadePosition', fallback: 50 },
      { label: 'Fade Intensity', shortLabel: 'Intensity', key: 'standardFadeIntensity', fallback: 100 },
      { label: 'Picture Opacity', shortLabel: 'Opacity', key: 'standardOpacity', fallback: 100 },
    ],
  },
  {
    title: 'Event Card Settings', compactTitle: 'Event Cards', color: 'pink',
    sliders: [
      { label: 'Fade Position', shortLabel: 'Fade Pos', key: 'shadowFadePosition' },
      { label: 'Fade Intensity', shortLabel: 'Intensity', key: 'shadowFadeIntensity' },
      { label: 'Picture Opacity', shortLabel: 'Opacity', key: 'shadowOpacity' },
    ],
  },
  {
    title: 'Collection Card Settings', compactTitle: 'Collection Cards', color: 'purple',
    directionControl: { key: 'collectionFadeDirection' },
    subtitle: 'Vertical fade (top ↔ bottom)',
    sliders: [
      { label: 'Fade Position', shortLabel: 'Fade Pos', key: 'collectionFadePosition' },
      { label: 'Fade Intensity', shortLabel: 'Intensity', key: 'collectionFadeIntensity' },
      { label: 'Picture Opacity', shortLabel: 'Opacity', key: 'collectionOpacity' },
    ],
  },
];

// Custom styled select dropdown — replaces native <select> with kuro-card backdrop
const KuroSelect = memo(({ value, onChange, options, className = '', ariaLabel, small, center }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const selected = options.find(o => o.value === value);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('pointerdown', handler);
    return () => document.removeEventListener('pointerdown', handler);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open]);

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen(p => !p)}
        className={`flex items-center ${center ? 'justify-center' : 'justify-between'} gap-1 w-full rounded-lg text-gray-300 border border-[var(--border-medium)] focus:border-yellow-500/50 focus:outline-none transition-colors ${small ? 'px-2 py-1.5 text-[10px]' : 'px-2.5 py-1.5 text-[10px] min-h-[44px]'}`}
        style={{ background: 'var(--bg-btn)' }}
        aria-label={ariaLabel}
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <span className="truncate">{selected?.label ?? value}</span>
        <ChevronDown size={12} className={`flex-shrink-0 text-gray-500 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div
          className="absolute left-0 right-0 mt-1 z-[200] flex flex-col gap-1.5"
          role="listbox"
          aria-label={ariaLabel}
        >
          {options.map(opt => {
            const active = opt.value === value;
            return (
              <button
                key={opt.value}
                type="button"
                role="option"
                aria-selected={active}
                onClick={() => { onChange(opt.value); setOpen(false); }}
                className={`kuro-btn w-full text-left px-3 py-2.5 text-sm ${active ? 'active-gold' : 'text-gray-300'}`}
                style={{
                  backdropFilter: 'blur(2px) brightness(0.6)',
                  WebkitBackdropFilter: 'blur(2px) brightness(0.6)',
                }}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
});
KuroSelect.displayName = 'KuroSelect';

// Collection grid section — eliminates ~170 lines of copy-paste across 5 grids
const CollectionGridSection = memo(({ title, starColor, items, collMask, collOpacity, glowClass, ownedBg, ownedBorder, countColor, countPrefix, totalCount, hasActiveFilters, collectionImages, withCacheBuster, getImageFraming, framingMode, editingImage, setEditingImage, activeBanners, setDetailModal, dataLookup, dataType, isCharacter, profilePic, onSetProfilePic, collapsible = false }) => {
  const [expanded, setExpanded] = useState(false);
  if (items.length === 0) return (
    <div className="kuro-empty-state relative py-3">
      {/* §DST1: Ghost-grid — faded placeholder cards hint at the grid layout */}
      <div className="grid grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-2 mb-2" aria-hidden="true">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="ghost-grid-cell aspect-[3/4] rounded-lg border border-white/[0.04]" style={{ animationDelay: `${i * 0.08}s` }} />
        ))}
      </div>
      <p className="text-gray-500 text-xs text-center">No items match your filters</p>
    </div>
  );
  const ownedCount = items.filter(([_, c]) => c > 0).length;
  // When collapsed, show 3 rows worth of items (3 cols on mobile = 9 items)
  const COLLAPSED_ROWS = 3;
  const collapsedCount = COLLAPSED_ROWS * 3; // 3 cols on mobile
  const showItems = collapsible && !expanded ? items.slice(0, collapsedCount) : items;
  const canCollapse = collapsible && items.length > collapsedCount;
  return (
    <>
      <div className="text-[10px] text-gray-400 mb-2 text-right">{ownedCount}/{items.length} shown{hasActiveFilters ? ` (${totalCount} total)` : ''}</div>
      <div className="grid grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-2">
        {showItems.map(([name, count]) => {
          const imgUrl = collectionImages[name];
          const imageKey = `collection-${name}`;
          const isNew = isCharacter
            ? activeBanners.characters?.some(c => c.name === name && c.isNew)
            : activeBanners.weapons?.some(w => w.name === name && w.isNew);
          return (
            <CollectionGridCard
              key={name} name={name} count={count}
              imgUrl={withCacheBuster(imgUrl)} framing={getImageFraming(imageKey)}
              isSelected={framingMode && editingImage === imageKey}
              owned={count > 0} collMask={collMask} collOpacity={collOpacity}
              glowClass={glowClass} ownedBg={ownedBg} ownedBorder={ownedBorder}
              countLabel={count > 0 ? `${countPrefix}${countPrefix === 'S' ? count - 1 : count}` : ''} countColor={countColor}
              framingMode={framingMode} setEditingImage={setEditingImage} imageKey={imageKey}
              onClickCard={dataLookup[name] ? () => setDetailModal({ show: true, type: dataType, name, imageUrl: imgUrl, framing: getImageFraming(imageKey) }) : null}
              isNew={isNew}
              isProfilePic={profilePic === name}
              onSetProfilePic={onSetProfilePic}
            />
          );
        })}
      </div>
      {canCollapse && (
        <button
          onClick={() => setExpanded(prev => !prev)}
          className="w-full mt-2 py-2 rounded-lg border border-[var(--border-medium)] text-gray-400 text-[10px] font-medium hover:text-white hover:border-white/20 active:scale-[0.98] transition-all flex items-center justify-center gap-1"
          style={{ background: 'var(--bg-btn)' }}
        >
          {expanded ? 'Show Less' : `Show All (${items.length})`}
        </button>
      )}
    </>
  );
});
CollectionGridSection.displayName = 'CollectionGridSection';

// P8-FIX: HIGH-15 — Extracted pity counter input component (eliminates ~120 lines of duplication across 4 banners)
const PityCounterInput = memo(({ label, pity, onPityChange, copies, maxCopies, onCopiesChange, fourStarCopies, maxFourStar, onFourStarChange, color, softColor, softGlow, sliderClass, softPityClass, SoftPityIcon, ariaPrefix }) => (
  <div>
    <div className="flex items-center gap-4 mb-2">
      <PityRing value={pity} max={80} size={56} strokeWidth={4} color={pity >= 65 ? softColor : color} glowColor={pity >= 65 ? softGlow : `${color}66`} />
      <div className="flex-1">
        <div className="text-sm font-medium mb-1" style={{ color }}>{label}</div>
        <input type="range" min="0" max="79" value={pity} onChange={e => onPityChange(+e.target.value)} className={`kuro-slider ${sliderClass}`} aria-label={`${ariaPrefix} pity`} />
        {pity >= 65 && <p className={`text-[10px] ${softPityClass}`} style={{ color: softColor }}><SoftPityIcon size={10} className="inline mr-1" style={{ color: softColor, filter: `drop-shadow(0 0 4px ${softColor})` }} />Soft Pity Zone!</p>}
      </div>
      <div className="text-right">
        <span style={{ color: pity >= 65 ? softColor : color }} className={`text-2xl kuro-number ${pity >= 65 ? softPityClass : ''}`}>{pity}</span>
        <span className="text-gray-200 text-sm">/80</span>
      </div>
    </div>
    <div className="grid grid-cols-2 gap-2 text-xs">
      <div className="flex items-center justify-between">
        <span style={{ color }}>5★ Target:</span>
        <input type="text" inputMode="numeric" value={copies} onChange={e => { const v = parseInt(e.target.value, 10) || 1; onCopiesChange(Math.max(1, Math.min(maxCopies, v))); }} className="kuro-input kuro-input-sm" aria-label={`${ariaPrefix} 5-star copies`} />
      </div>
      <div className="flex items-center justify-between">
        <span className="text-purple-400">4★ Target:</span>
        <input type="text" inputMode="numeric" value={fourStarCopies} onChange={e => { const v = parseInt(e.target.value, 10) || 0; onFourStarChange(Math.max(0, Math.min(maxFourStar, v))); }} className="kuro-input kuro-input-sm" aria-label={`${ariaPrefix} 4-star copies`} />
      </div>
    </div>
  </div>
));
PityCounterInput.displayName = 'PityCounterInput';

// Results card — eliminates ~160 lines of copy-paste across 4 calculator results
const CalcResultsCard = memo(({ title, stats, accentStatClass, copiesLabel, copies, isFeatured = true }) => (
  <Card>
    <CardHeader>{title}</CardHeader>
    <CardBody className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <div className={`kuro-stat ${accentStatClass}`}>
          <div className={`text-3xl kuro-number ${parseFloat(stats.successRate) >= 75 ? 'text-emerald-400' : parseFloat(stats.successRate) >= 50 ? 'text-yellow-300' : parseFloat(stats.successRate) >= 25 ? 'text-orange-400' : 'text-red-400'}`}>{stats.successRate}%</div>
          <div className="text-gray-400 text-[10px] mt-1">P(≥{copies} copies)</div>
        </div>
        <div className="kuro-stat kuro-stat-cyan">
          <div className="text-2xl kuro-number text-cyan-400">~{stats.expectedCopies}</div>
          <div className="text-gray-400 text-[10px] mt-1">Expected Copies</div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="kuro-stat kuro-stat-red">
          <div className="text-xl kuro-number text-red-400">{stats.missingPulls > 0 ? stats.missingPulls : '✓'}</div>
          <div className="text-gray-400 text-[10px] mt-1">{stats.missingPulls > 0 ? 'Convenes Needed (avg)' : 'Ready!'}</div>
        </div>
        <div className="kuro-stat kuro-stat-gray">
          <div className="text-xl kuro-number text-gray-400">{stats.worstCase}</div>
          <div className="text-gray-400 text-[10px] mt-1">Worst Case</div>
        </div>
      </div>
      {isFeatured ? (
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="kuro-stat kuro-stat-purple"><span className="text-purple-400 kuro-number">~{stats.fourStarCount}</span><div className="text-gray-400 text-[10px] mt-0.5">4★ Expected</div></div>
          <div className="kuro-stat kuro-stat-purple"><span className="text-purple-400 kuro-number">~{stats.featuredFourStarCount}</span><div className="text-gray-400 text-[10px] mt-0.5">Featured 4★</div></div>
        </div>
      ) : (
        <div className="kuro-stat kuro-stat-purple text-xs">
          <span className="text-purple-400 kuro-number">~{stats.fourStarCount}</span>
          <div className="text-gray-400 text-[10px] mt-0.5">4★ Expected</div>
        </div>
      )}
      {/* AUDIT-FIX M33: Accurate method label — DP is exact for ≤500 pulls, MC simulation for larger values */}
      <p className="text-[10px] text-gray-400 text-center mx-auto" style={{maxWidth: 'none'}}>Rates: 0.8% base, soft pity 65-79, hard pity 80. DP + Monte Carlo hybrid.</p>
    </CardBody>
  </Card>
));
CalcResultsCard.displayName = 'CalcResultsCard';

// Standard banner overlay — cool silver twinkling stars (distinct from Sigrika's warm golden sparkle)
const StandardBannerOverlay = memo(() => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const rect = canvas.parentElement.getBoundingClientRect();
    const w = rect.width || 400;
    const h = rect.height || 190;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);

    // Twinkling 6-point stars (Sigrika uses 4-point golden — these are 6-point silver)
    const stars = Array.from({ length: 22 }, () => ({
      x: Math.random() * w, y: h * 0.08 + Math.random() * h * 0.88,
      size: 1.8 + Math.random() * 3,
      phase: Math.random() * Math.PI * 2,
      speed: 0.6 + Math.random() * 1.2,
      // Staggered blink: each star fades in and out independently
      blinkOffset: Math.random() * 6,
    }));

    // Small drifting dust motes
    const dust = Array.from({ length: 12 }, () => ({
      x: Math.random() * w, y: Math.random() * h,
      vy: -0.1 - Math.random() * 0.15,
      vx: (Math.random() - 0.5) * 0.12,
      size: 0.8 + Math.random() * 1.2,
      phase: Math.random() * Math.PI * 2,
      alpha: 0.4 + Math.random() * 0.3,
    }));

    let animId, t = 0;
    const frame = () => {
      ctx.clearRect(0, 0, w, h);
      t += 0.016;

      // 6-point twinkling stars
      for (const s of stars) {
        // Blink pattern: fully bright for a moment, then fade out
        const cycle = (t * s.speed + s.blinkOffset) % 4;
        let a;
        if (cycle < 0.8) a = Math.sin(cycle / 0.8 * Math.PI); // fade in and out
        else a = 0; // dark
        a *= 0.9;
        if (a < 0.05) continue;

        const sz = s.size * (0.7 + a * 0.3);
        ctx.save();
        ctx.globalAlpha = a;
        ctx.fillStyle = 'rgba(220,235,255,1)';
        ctx.shadowColor = 'rgba(180,210,255,0.8)';
        ctx.shadowBlur = 10;

        // 6-point star shape
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
          const angle = (i / 6) * Math.PI * 2 - Math.PI / 2;
          const innerAngle = ((i + 0.5) / 6) * Math.PI * 2 - Math.PI / 2;
          ctx.lineTo(s.x + Math.cos(angle) * sz * 1.8, s.y + Math.sin(angle) * sz * 1.8);
          ctx.lineTo(s.x + Math.cos(innerAngle) * sz * 0.4, s.y + Math.sin(innerAngle) * sz * 0.4);
        }
        ctx.closePath();
        ctx.fill();

        // Bright center dot
        ctx.shadowBlur = 0;
        ctx.globalAlpha = a * 0.8;
        ctx.beginPath();
        ctx.arc(s.x, s.y, sz * 0.35, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // Drifting dust
      for (const d of dust) {
        d.x += d.vx + Math.sin(t * 0.3 + d.phase) * 0.08;
        d.y += d.vy;
        if (d.y < -5) { d.y = h + 5; d.x = Math.random() * w; }

        const pulse = d.alpha * (0.5 + Math.sin(t * 0.8 + d.phase) * 0.5);
        if (pulse < 0.06) continue;

        ctx.save();
        ctx.globalAlpha = pulse;
        ctx.fillStyle = 'rgba(210,225,250,1)';
        ctx.shadowColor = 'rgba(180,200,240,0.5)';
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      animId = requestAnimationFrame(frame);
    };
    animId = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
      style={{ zIndex: 2, width: '100%', height: '100%' }}
      aria-hidden="true"
    />
  );
});
StandardBannerOverlay.displayName = 'StandardBannerOverlay';

// Standard banner card — eliminates ~110 lines of copy-paste between standard char/weap banners
const StandardBannerSection = memo(({ bannerImage, altText, title, subtitle, items, itemKey, profileData, visualSettings }) => {
  const stdMask = generateMaskGradient(visualSettings.standardFadePosition ?? 50, visualSettings.standardFadeIntensity ?? 100);
  const stdOpacity = (visualSettings.standardOpacity ?? 100) / 100;
  const hasStats = profileData?.history?.length > 0;
  const isFull = visualSettings?.animationsEnabled === 'full';
  return (
    <div className="relative overflow-hidden rounded-xl border border-cyan-500/30" style={{ height: '190px', isolation: 'isolate', zIndex: 5, boxShadow: '0 0 40px rgba(0,200,255,0.06), 0 4px 16px rgba(0,0,0,0.3)' }}>
      {bannerImage && (
        <img
          src={bannerImage}
          alt={altText}
          className="absolute inset-0 w-full h-full object-cover object-top"
          style={{ zIndex: 1, opacity: stdOpacity, maskImage: stdMask, WebkitMaskImage: stdMask }}
          loading="eager"
          onError={hideOnError}
        />
      )}
      {bannerImage && isFull && <StandardBannerOverlay w={0} h={0} />}
      <div className="absolute inset-0 z-10 p-3 flex flex-col justify-between" style={TEXT_SHADOW_STYLE}>
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-[10px] px-2 py-0.5 rounded text-cyan-400 border border-cyan-500/40" style={{ backgroundColor: 'rgba(0,200,255,0.1)' }}>{subtitle}</span>
          </div>
          <h4 className="font-bold text-base text-white leading-tight">{title}</h4>
        </div>
        <div className={hasStats ? 'mb-14' : ''}>
          <div className="text-gray-300 text-[10px] mb-0.5 uppercase tracking-wider">Available 5★</div>
          <div className="flex gap-1 overflow-x-auto scrollbar-hide pb-0.5">
            {items.map(item => <span key={typeof item === 'string' ? item : item[itemKey]} className="text-[10px] text-cyan-300 bg-cyan-500/30 px-1.5 py-0.5 rounded whitespace-nowrap flex-shrink-0 backdrop-blur-sm">{typeof item === 'string' ? item : item[itemKey]}</span>)}
          </div>
        </div>
      </div>
      {hasStats && (
        <div className="absolute bottom-0 left-0 right-0 z-10 border-t border-white/15" style={BANNER_CARD_OVERLAY_STYLE}>
          <div className="flex items-center gap-3">
            <div className="flex-1 flex items-center gap-3">
              <div className="text-center">
                <div className="text-cyan-400 font-bold text-sm">{profileData.pity5}<span className="text-gray-400 text-[10px]">/{HARD_PITY}</span></div>
                <div className="text-gray-400 text-[10px] mt-0.5">5★ Pity</div>
              </div>
              <div className="text-center">
                <div className="text-purple-400 font-bold text-sm">{profileData.pity4}<span className="text-gray-400 text-[10px]">/10</span></div>
                <div className="text-gray-400 text-[10px] mt-0.5">4★ Pity</div>
              </div>
              <div className="text-center">
                <div className="text-white font-bold text-sm">{profileData.history.length}</div>
                <div className="text-gray-400 text-[10px] mt-0.5">Convenes</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});
StandardBannerSection.displayName = 'StandardBannerSection';

// Import guide data — eliminates ~90 lines of repetitive numbered-step JSX
const IMPORT_GUIDE_DATA = {
  pc: {
    title: 'PC',
    steps: [
      <>Go to <span className="text-gray-100 font-medium">wuwatracker.com</span></>,
      <>Run <span className="text-gray-100 font-medium">PowerShell script</span> or upload <span className="text-gray-100 font-medium">Client.log</span></>,
      <>Go to <span className="text-gray-100 font-medium">Profile → Settings → Data</span></>,
      <><span className="text-gray-100 font-medium">Export Pull History</span> → Download JSON → Upload below</>,
    ],
  },
  android: {
    title: 'Android (11+)',
    steps: [
      <>Download <span className="text-gray-100 font-medium">Ascent app</span> (v2.1.6+) to get URL</>,
      <>Go to <span className="text-gray-100 font-medium">wuwatracker.com</span> → Import URL</>,
      <>Go to <span className="text-gray-100 font-medium">Profile → Settings → Data</span></>,
      <><span className="text-gray-100 font-medium">Export Pull History</span> → Download JSON → Upload below</>,
    ],
  },
  ps5: {
    title: 'PS5 (In-Game Browser)',
    steps: [
      <>Open WuWa → Convene → History → tap <span className="text-gray-100 font-medium">"View Details"</span></>,
      <>Press <span className="text-gray-100 font-medium">"Options"</span> → Select <span className="text-gray-100 font-medium">"Page Information"</span></>,
      <>Find <span className="text-gray-100 font-medium">player_id</span> and <span className="text-gray-100 font-medium">record_id</span> in the URL</>,
      <>Go to <span className="text-gray-100 font-medium">wuwatracker.com</span> → Enter IDs → Import</>,
      <>Go to <span className="text-gray-100 font-medium">Profile → Settings → Data</span></>,
      <><span className="text-gray-100 font-medium">Export Pull History</span> → Download JSON → Upload below</>,
    ],
    footer: '⚠️ URL valid for ~24 hours only',
  },
};

const ImportGuide = memo(({ platform }) => {
  const guide = IMPORT_GUIDE_DATA[platform];
  if (!guide) return null;
  return (
    <div className="p-3 bg-white/5 border border-[var(--border-medium)] rounded-lg text-[10px] text-gray-200 space-y-2">
      <p className="text-gray-100 font-medium text-xs">{guide.title}</p>
      {guide.steps.map((step, i) => (
        <div key={i} className="flex items-start gap-2">
          <span className="flex-shrink-0 w-5 h-5 rounded bg-white/10 text-gray-200 flex items-center justify-center text-[10px] font-bold">{i + 1}</span>
          <p>{step}</p>
        </div>
      ))}
      {guide.footer && <p className="text-gray-400 text-[10px] pt-1 border-t border-[var(--border-medium)]">{guide.footer}</p>}
    </div>
  );
});
ImportGuide.displayName = 'ImportGuide';

// ═══════════════════════════════════════════════════════════════════════════════
// END EXTRACTED COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════════

// Load custom banners from localStorage
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

export {
  TROPHY_ICON_MAP, generateVerticalMaskGradient,
  TabBackground, Card, CardHeader, CardBody,
  CharacterDetailModal, WeaponDetailModal, EchoDetailModal,
  TabButton, PityRing, CountdownTimer,
  AppErrorBoundary, TabErrorBoundary,
  BackgroundGlow, TriangleMirrorWave, ResonanceField, AugustaRuins,
  BannerCard, EventCard, ProbabilityBar,
  ADMIN_BANNER_KEY, ADMIN_HASH,
  VisualSliderGroup, VISUAL_SLIDER_CONFIGS,
  KuroSelect, CollectionGridSection, PityCounterInput, CalcResultsCard,
  StandardBannerSection, ImportGuide,
  getActiveBanners,
  hideOnError,
};
