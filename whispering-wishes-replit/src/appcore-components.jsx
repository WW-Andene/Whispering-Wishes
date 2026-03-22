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
  Fusion: { borderColor: 'rgba(249,115,22,0.4)', bgColor: 'rgba(249,115,22,0.2)', text: 'text-orange-400' },
  Electro: { borderColor: 'rgba(168,85,247,0.4)', bgColor: 'rgba(168,85,247,0.2)', text: 'text-purple-400' },
  Aero: { borderColor: 'rgba(16,185,129,0.4)', bgColor: 'rgba(16,185,129,0.2)', text: 'text-emerald-400' },
  Glacio: { borderColor: 'rgba(6,182,212,0.4)', bgColor: 'rgba(6,182,212,0.2)', text: 'text-cyan-400' },
  Havoc: { borderColor: 'rgba(236,72,153,0.55)', bgColor: 'rgba(236,72,153,0.25)', text: 'text-pink-400' },
  Spectro: { borderColor: 'rgba(234,179,8,0.4)', bgColor: 'rgba(234,179,8,0.2)', text: 'text-yellow-400' },
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
            <img src={imageUrl} alt={name} className="absolute right-0 bottom-0 h-48 object-contain opacity-80" onError={hideOnError} style={{
              transform: `scale(${f.zoom / 100}) translate(${-f.x}%, ${-f.y}%)`,
              transformOrigin: 'right bottom'
            }} />
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
                <img src={weaponImg} alt={data.bestWeapon} className="w-14 h-14 rounded-lg object-cover bg-neutral-800 border border-[var(--border-medium)] flex-shrink-0" onError={hideOnError} />
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
                          return (
                            <div key={j} className="flex flex-col items-center gap-1 flex-1 min-w-0">
                              {memberImg ? (
                                <div className="w-14 h-14 rounded-lg bg-neutral-800 border border-[var(--border-medium)] overflow-hidden" style={{ contain: 'paint', position: 'relative' }}>
                                  <img src={memberImg} alt={member} className="absolute inset-0 w-full h-full object-cover object-top" onError={hideOnError} style={{ transform: `scale(${mf.zoom / 100}) translate(${-mf.x}%, ${-mf.y}%)` }} />
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
        <div className="relative h-40 overflow-hidden rounded-t-2xl" style={{ contain: 'paint' }} data-sheet-header>
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
                  return (
                    <div key={charName} className="flex flex-col items-center gap-1">
                      {charImg ? (
                        <div className="w-12 h-12 rounded-lg bg-neutral-800 border border-[var(--border-medium)] overflow-hidden" style={{ contain: 'paint', position: 'relative' }}>
                          <img src={charImg} alt={charName} className="absolute inset-0 w-full h-full object-cover object-top" onError={hideOnError} />
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

const TabButton = memo(({ active, onClick, children, tabRef, tabId }) => {
  const childArray = React.Children.toArray(children);
  const icon = childArray.find(child => React.isValidElement(child));
  const text = childArray.find(child => typeof child === 'string')?.trim();
  const btnRef = useRef(null);
  
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
            indicator.style.background = `linear-gradient(90deg, rgba(237,175,24,0.6), rgba(237,175,24,1), rgba(237,175,24,0.6))`;
            indicator.style.boxShadow = `0 0 12px rgba(237,175,24,0.5)`;
          }
        });
      }
    } catch (e) { /* ignore indicator errors */ }
    return () => { if (rafId !== null) cancelAnimationFrame(rafId); };
  }, [active, tabRef]);
  
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
      className={`relative flex flex-col items-center gap-0.5 px-2.5 py-2 text-[10px] font-medium transition-all duration-300 whitespace-nowrap group ${active ? 'text-yellow-400' : 'text-gray-500 hover:text-gray-300'}`}
    >
      <div className={`relative z-10 p-1.5 rounded-xl transition-all duration-300 ${active ? 'bg-yellow-500/10 shadow-lg shadow-yellow-500/25' : 'group-hover:bg-white/5 group-hover:shadow-md group-hover:shadow-white/5'}`} style={active ? { filter: 'drop-shadow(0 0 5px rgba(237,175,24,0.5))' } : undefined}>
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
          <div className="rounded-lg px-2.5 py-1.5 text-center border border-[var(--border-medium)]" style={TIMER_BOX_STYLE}>
            <div className="text-white kuro-scoreboard">{time.days}</div>
            <div className="text-gray-400 text-[8px] uppercase tracking-wider mt-0.5">{time.days === 1 ? 'Day' : 'Days'}</div>
          </div>
          <span className={`${textColor} font-bold text-sm opacity-60`}>:</span>
        </>
      )}
      <div className="rounded-lg px-2.5 py-1.5 text-center border border-[var(--border-medium)]" style={TIMER_BOX_STYLE}>
        <div className="text-white kuro-scoreboard">{String(time.hours).padStart(2, '0')}</div>
        <div className="text-gray-400 text-[8px] uppercase tracking-wider mt-0.5">Hr</div>
      </div>
      <span className={`${textColor} font-bold text-sm opacity-60`}>:</span>
      <div className="rounded-lg px-2.5 py-1.5 text-center border border-[var(--border-medium)]" style={TIMER_BOX_STYLE}>
        <div className="text-white kuro-scoreboard">{String(time.minutes).padStart(2, '0')}</div>
        <div className="text-gray-400 text-[8px] uppercase tracking-wider mt-0.5">Min</div>
      </div>
      <span className={`${textColor} font-bold text-sm opacity-60`}>:</span>
      <div className="rounded-lg px-2.5 py-1.5 text-center border border-[var(--border-medium)]" style={TIMER_BOX_STYLE}>
        <div className={`kuro-scoreboard ${textColor}`}>{String(time.seconds).padStart(2, '0')}</div>
        <div className="text-gray-400 text-[8px] uppercase tracking-wider mt-0.5">Sec</div>
      </div>
    </div>
  );
});
CountdownTimer.displayName = 'CountdownTimer';

// P11-FIX: Hoisted constant style objects outside components to prevent recreation on every render (Step 7 audit — NIT-3c)
const TIMER_BOX_STYLE = Object.freeze({ backgroundColor: 'rgba(12,16,24,0.7)', backdropFilter: 'blur(8px)' });
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
  
  const softStart = showSoftZone ? softThreshold / max : 0;
  const softLen = showSoftZone ? (max - softThreshold) / max : 0;
  const softDash = softLen * circumference;
  const softGap = circumference - softDash;
  const softOffset = -softStart * circumference;
  
  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} className={isSoftPity ? 'pulse-subtle' : ''} role="img" aria-label={`Pity: ${safeValue} out of ${max}${isSoftPity ? ', in soft pity zone' : ''}`}>
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
      const time = t * 0.001;
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
      const time = t * 0.001;

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

const BannerCard = memo(({ item, type, stats, bannerImage, visualSettings, endDate, timerColor }) => {
  const isChar = type === 'character';
  const style = BANNER_GRADIENT_MAP[item.element] || BANNER_GRADIENT_MAP.Fusion;
  const imgUrl = item.imageUrl || bannerImage;

  // Use unified mask generator
  const maskGradient = visualSettings
    ? generateMaskGradient(visualSettings.fadePosition, visualSettings.fadeIntensity)
    : generateMaskGradient();
  const pictureOpacity = visualSettings ? visualSettings.pictureOpacity / 100 : 0.9;
  const animEnabled = visualSettings?.animationsEnabled !== 'off' && visualSettings?.animationsEnabled !== false;

  return (
    <div className="relative overflow-hidden rounded-xl border" style={{ height: '190px', isolation: 'isolate', zIndex: 5, borderColor: style.borderColor, boxShadow: '0 0 40px rgba(237,175,24,0.06), 0 4px 16px rgba(0,0,0,0.3)' }}>
      {/* Ghost echo layers — clones that drift and fade to simulate movement */}
      {imgUrl && animEnabled && [1, 2, 3].map(i => (
        <img
          key={`echo-${i}`}
          src={imgUrl}
          alt=""
          className="absolute inset-0 w-full h-full object-cover object-top pointer-events-none banner-echo"
          style={{
            zIndex: 0,
            opacity: 0,
            maskImage: maskGradient,
            WebkitMaskImage: maskGradient,
            animation: `bannerEcho ${6 + i * 2}s ease-in-out ${i * 2}s infinite`,
          }}
          loading="eager"
          aria-hidden="true"
        />
      ))}
      {imgUrl && (
        <img
          src={imgUrl}
          alt={item.name}
          className="absolute inset-0 w-full h-full object-cover object-top"
          style={{
            zIndex: 1,
            opacity: pictureOpacity,
            maskImage: maskGradient,
            WebkitMaskImage: maskGradient
          }}
          loading="eager"
          onError={hideOnError}
        />
      )}
      
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
      <img
        src={imgUrl}
        alt={name}
        loading="lazy"
        className="absolute inset-0 w-full h-full object-contain pointer-events-none"
        style={{
          transform: `scale(${framing.zoom / 100}) translate(${-framing.x}%, ${-framing.y}%)`,
          opacity: owned ? collOpacity : 0.3,
          filter: owned ? 'none' : 'grayscale(100%)',
          maskImage: collMask,
          WebkitMaskImage: collMask
        }}
        onError={hideOnError}
      />
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

// Standard banner card — eliminates ~110 lines of copy-paste between standard char/weap banners
const StandardBannerSection = memo(({ bannerImage, altText, title, subtitle, items, itemKey, profileData, visualSettings }) => {
  const stdMask = generateMaskGradient(visualSettings.standardFadePosition ?? 50, visualSettings.standardFadeIntensity ?? 100);
  const stdOpacity = (visualSettings.standardOpacity ?? 100) / 100;
  const hasStats = profileData?.history?.length > 0;
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
  BackgroundGlow, TriangleMirrorWave,
  BannerCard, EventCard, ProbabilityBar,
  ADMIN_BANNER_KEY, ADMIN_HASH,
  VisualSliderGroup, VISUAL_SLIDER_CONFIGS,
  KuroSelect, CollectionGridSection, PityCounterInput, CalcResultsCard,
  StandardBannerSection, ImportGuide,
  getActiveBanners,
  hideOnError,
};
