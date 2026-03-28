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

// Deterministic pseudo-random number generator (used by background animations)
function seededRandom(seed) { let s = seed; return function() { s = (s * 9301 + 49297) % 233280; return s / 233280; }; }

// Noise functions for baked ground rendering
function _bgHash(n) { const s = Math.sin(n) * 43758.5453; return s - Math.floor(s); }
function valueNoise(x,y,freq,seed){const fx=x*freq,fy=y*freq,ix=Math.floor(fx),iy=Math.floor(fy),tx=fx-ix,ty=fy-iy,sx=tx*tx*(3-2*tx),sy=ty*ty*(3-2*ty);const n00=_bgHash((ix+iy*137)*7+seed),n10=_bgHash(((ix+1)+iy*137)*7+seed),n01=_bgHash((ix+(iy+1)*137)*7+seed),n11=_bgHash(((ix+1)+(iy+1)*137)*7+seed);return(n00+(n10-n00)*sx)+((n01+(n11-n01)*sx)-(n00+(n10-n00)*sx))*sy;}
function _bgFbm(x,y,oct,seed){let v=0,a=0.5,f=1,t=0;for(let i=0;i<oct;i++){v+=valueNoise(x,y,f,seed+i*1000)*a;t+=a;a*=0.5;f*=2.1;}return v/t;}
function _bgRidged(x,y,oct,seed){let v=0,a=0.5,f=1,t=0;for(let i=0;i<oct;i++){const n=1-Math.abs(valueNoise(x,y,f,seed+i*1000)*2-1);v+=n*n*a;t+=a;a*=0.45;f*=2.2;}return v/t;}

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
const BackgroundGlow = memo(({ oledMode, animationsEnabled = 'on', bgResolution, bgFps }) => {
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
    const isFull = animationsEnabled === 'full';
    const BLUR_SCALE = (bgResolution || (isFull ? 100 : 50)) / 100;
    const frameInterval = bgFps ? Math.round(1000 / bgFps) : (isFull ? 33 : 66);
    let w, h, bw, bh;

    // OLED mode uses darker base color
    const bgColor = oledMode ? 'rgb(0,0,0)' : 'rgb(2,3,6)';

    // Full mode: boost glow intensity
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
      if (t - lastFrame < frameInterval) return;
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
  }, [oledMode, animationsEnabled, bgResolution, bgFps]);
  
  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none" style={{zIndex: 1, willChange: 'transform'}} aria-hidden="true" role="presentation" />;
});
BackgroundGlow.displayName = 'BackgroundGlow';

// LAYER B: Triangle wave mask — traveling wavefront specular, z-index 2
// P11-FIX: Wrapped in memo — same rationale as BackgroundGlow (Step 7 audit — LOW-3b)
const TriangleMirrorWave = memo(({ oledMode, animationsEnabled = 'on', bgResolution, bgFps }) => {
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
    const isFull = animationsEnabled === 'full';
    const triScale = (bgResolution || (isFull ? 100 : 50)) / 100;
    const frameInterval = bgFps ? Math.round(1000 / bgFps) : (isFull ? 33 : 66);

    const TW = 36;
    const TH = 31;
    const HALF = TW / 2;
    let w, h, cols, rows, seeds;

    const init = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.ceil(w * triScale);
      canvas.height = Math.ceil(h * triScale);
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
      cols = Math.ceil(w / HALF) + 4;
      rows = Math.ceil(h / TH) + 4;
      seeds = new Float32Array(cols * rows);
      for (let i = 0; i < seeds.length; i++) seeds[i] = Math.random() * 6.28;
    };
    init();
    window.addEventListener('resize', init);
    const twSpecMul = isFull ? 0.65 : 0.45;
    const twPeakMul = isFull ? 0.18 : 0.12;
    const twAlphaScale = isFull ? 0.6 : 0.45;
    const twAlphaMax = isFull ? 0.35 : 0.25;
    const twColorBoost = isFull ? 1.3 : 1.0;

    let lastFrame = 0;

    const draw = (t) => {
      animId = requestAnimationFrame(draw);
      if (t - lastFrame < frameInterval) return;
      lastFrame = t;
      ctx.save();
      ctx.scale(triScale, triScale);
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
      ctx.restore();
    };
    animId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', init);
    };
  }, [oledMode, animationsEnabled, bgResolution, bgFps]);

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none" style={{zIndex: 2, willChange: 'transform'}} aria-hidden="true" role="presentation" />;
});
TriangleMirrorWave.displayName = 'TriangleMirrorWave';

// LAYER ALT: Resonance Field — A single ribbon of dots forming a circular loop in 3D
// The ribbon is a ring of dots with width (multiple rows), viewed from the side.
// It undulates up/down like a sine wave as it goes around, and the whole thing rotates.
// Think of it like a halo or ring seen nearly edge-on, rippling like a ribbon.
const ResonanceField = memo(({ oledMode, animationsEnabled = 'on', bgResolution, bgFps }) => {
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
    const resScale = (bgResolution || (isFull ? 100 : 50)) / 100;
    const frameInterval = bgFps ? Math.round(1000 / bgFps) : (isFull ? 33 : 66);
    const alphaScale = isFull ? 1.5 : 1.0;
    const bgColor = oledMode ? 'rgb(0,0,0)' : 'rgb(3,4,12)';

    let w, h;

    const init = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.ceil(w * resScale);
      canvas.height = Math.ceil(h * resScale);
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
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
      if (t - lastFrame < frameInterval) return;
      lastFrame = t;
      const time = t * 0.00075; // 25% slower globally

      ctx.save();
      ctx.scale(resScale, resScale);
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
      ctx.restore();
    };
    animId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', init);
    };
  }, [oledMode, animationsEnabled, bgResolution, bgFps]);

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none" style={{zIndex: 1, willChange: 'transform'}} aria-hidden="true" role="presentation" />;
});
ResonanceField.displayName = 'ResonanceField';

// LAYER ALT-2: Augusta Ruins — Ancient golden ruins with sun glow, mist, and floating dust
// Inspired by Rinascita: warm amber tones, stone pillars/arches, atmospheric haze, golden sunlight
const Honour = memo(({ oledMode, animationsEnabled = 'on', bgResolution, bgFps }) => {
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
    let groundCache = null;
    let honourParticles = null;
    let lastFrame = 0;
    let sceneClouds = null;
    let cloudBuildPending = false;
    let cloudRefreshIdx = 0;
    let cloudTime = 0;
    let skyCache = null;

    const isFull = animationsEnabled === 'full';
    const alphaScale = isFull ? 1.4 : 1.0;
    const bgBase = oledMode ? [0, 0, 0] : [12, 8, 4];

    const honourScale = (bgResolution || (isFull ? 100 : 50)) / 100;
    const honourFps = bgFps || (isFull ? 30 : 15);
    const honourInterval = Math.round(1000 / honourFps);

    let w, h;

    const init = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.ceil(w * honourScale);
      canvas.height = Math.ceil(h * honourScale);
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
      groundCache = null;
      honourParticles = null;
      skyCache = null;
    };
    init();
    window.addEventListener('resize', init);

    // Pseudo-random hash function for deterministic randomness
    const hash = (n) => { const s = Math.sin(n) * 43758.5453; return s - Math.floor(s); };
    const sceneSeed = 29483;

    // === Cloud system from cloud-demo ===
    const CLOUD_DEFS = [
      { name: "fume", wispN: 3, densMul: 2.8, densPeak: 50, densFall: [0.4, 0.15, 0.04], baseAlpha: 0.15, hazeThresh: 2, maxDens: 40, depthLevels: 1, alphaCurve: 0 },
      { name: "small", wispN: 4, densMul: 2.2, densPeak: 100, densFall: [0.55, 0.22, 0.06], baseAlpha: 0.72, hazeThresh: 5, maxDens: 120, depthLevels: 2, alphaCurve: 1 },
      { name: "medium", wispN: 5, densMul: 2.0, densPeak: 100, densFall: [0.55, 0.25, 0.08], baseAlpha: 0.82, hazeThresh: 4, maxDens: 140, depthLevels: 3, alphaCurve: 2 },
      { name: "big", wispN: 6, densMul: 1.8, densPeak: 100, densFall: [0.55, 0.25, 0.08], baseAlpha: 0.90, hazeThresh: 4, maxDens: 140, depthLevels: 4, alphaCurve: 2 }
    ];
    function generateBalls(seed, baseRadius, cloudType) {
        const def = CLOUD_DEFS[cloudType];
        const rng = seededRandom(seed);
        const balls = [];

        function spawnCluster(cx, cy, radius, depth, maxDepth) {
            balls.push({ cx: cx, cy: cy, r: radius * (0.6 + rng() * 0.5) });
            if (depth >= maxDepth) return;
            const cc = Math.floor(2 + rng() * 3);
            for (let c = 0; c < cc; c++) {
                const a = rng() * Math.PI * 2;
                const d = radius * (0.3 + rng() * 0.7);
                const nx = (rng() - 0.5) * radius * 0.4;
                const ny = (rng() - 0.5) * radius * 0.4;
                spawnCluster(cx + Math.cos(a) * d + nx, cy + Math.sin(a) * d + ny, radius * (0.35 + rng() * 0.35), depth + 1, maxDepth);
            }
        }

        const fd = cloudType === 0 ? 1 : cloudType === 1 ? 2 : 3;
        const sc = cloudType === 0 ? 2 : cloudType === 1 ? 2 : cloudType === 2 ? 3 : 4;
        const sr = baseRadius * (cloudType === 0 ? 0.5 : 0.4);
        for (let s = 0; s < sc; s++) {
            const sa = rng() * Math.PI * 2;
            const sd = baseRadius * rng() * 0.2;
            spawnCluster(Math.cos(sa) * sd, Math.sin(sa) * sd, sr * (0.7 + rng() * 0.6), 0, fd);
        }

        const wc = def.wispN + Math.floor(rng() * 3);
        for (let w = 0; w < wc; w++) {
            const wa = rng() * Math.PI * 2;
            const wd = baseRadius * (0.4 + rng() * 0.6);
            const wr = baseRadius * (0.05 + rng() * 0.12);
            balls.push({
                cx: Math.cos(wa) * wd + (rng() - 0.5) * baseRadius * 0.3,
                cy: Math.sin(wa) * wd + (rng() - 0.5) * baseRadius * 0.3,
                r: wr
            });
        }

        return balls;
    }
    function bakeMetaball(balls, sunAngle, cloudType, depth, proximity, occlusion, resScale) {
      const def = CLOUD_DEFS[cloudType];
      const sc = resScale || 1;
      const margin = 2.5;
      let minX = 1e9, minY = 1e9, maxX = -1e9, maxY = -1e9;
      for (let i = 0; i < balls.length; i++) { const b = balls[i]; minX = Math.min(minX, b.cx - b.r * margin); minY = Math.min(minY, b.cy - b.r * margin); maxX = Math.max(maxX, b.cx + b.r * margin); maxY = Math.max(maxY, b.cy + b.r * margin); }
      const pad = 6;
      const fullW = Math.ceil(maxX - minX) + pad * 2, fullH = Math.ceil(maxY - minY) + pad * 2;
      if (fullW <= 0 || fullH <= 0 || fullW > 800 || fullH > 800) return null;
      const w = Math.max(4, Math.round(fullW * sc)), h = Math.max(4, Math.round(fullH * sc));
      const ox = (-minX + pad) * sc, oy = (-minY + pad) * sc;
      const dCvs = document.createElement("canvas"); dCvs.width = w; dCvs.height = h;
      const dCtx = dCvs.getContext("2d", { willReadFrequently: true }); dCtx.globalCompositeOperation = "lighter";
      const fo = def.densFall, pk = def.densPeak;
      for (let bi = 0; bi < balls.length; bi++) {
        const ball = balls[bi], bx = ox + ball.cx * sc, by = oy + ball.cy * sc, br = ball.r * def.densMul * sc;
        const grad = dCtx.createRadialGradient(bx, by, 0, bx, by, br);
        grad.addColorStop(0, "rgba(" + pk + "," + pk + "," + pk + ",1)");
        grad.addColorStop(0.25, "rgba(" + pk + "," + pk + "," + pk + "," + fo[0] + ")");
        grad.addColorStop(0.5, "rgba(" + pk + "," + pk + "," + pk + "," + fo[1] + ")");
        grad.addColorStop(0.75, "rgba(" + pk + "," + pk + "," + pk + "," + fo[2] + ")");
        grad.addColorStop(1, "rgba(0,0,0,0)");
        dCtx.fillStyle = grad; dCtx.beginPath(); dCtx.arc(bx, by, br, 0, Math.PI * 2); dCtx.fill();
      }
      const dd = dCtx.getImageData(0, 0, w, h).data;
      const oCvs = document.createElement("canvas"); oCvs.width = w; oCvs.height = h;
      const oCtx = oCvs.getContext("2d"), oD = oCtx.createImageData(w, h), od = oD.data;
      function dens(x, y) { return (x < 0 || x >= w || y < 0 || y >= h) ? 0 : dd[(y * w + x) * 4]; }
      const sdx = Math.cos(sunAngle), sdy = Math.sin(sunAngle), levels = def.depthLevels, bAlpha = def.baseAlpha, hT = def.hazeThresh, mD = def.maxDens;
      const lr = 1 - (occlusion || 0) * 0.7, ds = 1 - depth;
      // Sunset palette — matching warm amber-brown reference
      // Shadow: deep warm brown (like dark amber/chocolate, not olive)
      // Brighter amber palette + per-cloud brightness variation
      const bVar = 0.75 + hash(depth * 127 + proximity * 311) * 0.5;
      // Dramatic dark palette — near-black shadows, deep crimson mids, fiery highlights
      const shR = Math.round((18 + ds * 10 + lr * 8) * bVar), shG = Math.round((6 + ds * 3 + lr * 2) * bVar), shB = Math.round((3 + ds * 1 + lr * 1) * bVar);
      const ltR = Math.min(255, Math.round((245 + ds * 10 + proximity * 10) * bVar)), ltG = Math.min(255, Math.round((140 + ds * 20 + proximity * 15) * bVar)), ltB = Math.min(255, Math.round((45 + ds * 10 + proximity * 8) * bVar));
      const rmR = Math.min(255, Math.round((255 + ds * 5) * bVar)), rmG = Math.min(255, Math.round((160 + ds * 10 + proximity * 8) * bVar)), rmB = Math.min(255, Math.round((50 + ds * 8 + proximity * 5) * bVar));
      for (let py = 2; py < h - 2; py++) {
        for (let px = 2; px < w - 2; px++) {
          const idx = (py * w + px) * 4, density = dd[idx]; if (density < hT) continue;
          const thick = Math.min(1, (density - hT) / (mD - hT));
          const gx = (dens(px+1,py)*2+dens(px+2,py))-(dens(px-1,py)*2+dens(px-2,py));
          const gy = (dens(px,py+1)*2+dens(px,py+2))-(dens(px,py-1)*2+dens(px,py-2));
          const gl = Math.sqrt(gx*gx+gy*gy); let nx = 0, ny = 0; if (gl > 1) { nx = -gx/gl; ny = -gy/gl; }
          const sunF = (nx*sdx+ny*sdy)*0.5+0.5, thin = 1-thick;
          let rim = thin*thin*thin*Math.max(0,sunF)*0.7, sL = sunF*(0.35+thick*0.65);
          if (gl < 2) { sL *= 0.4; rim = 0; }
          // Banded shading — 5 bands: sun-facing → 1 deep → 2 stacked → 3 stacked → 4+
          // Floor at 0.25 (4+ only), 3 stacked = 0.38 (warmer than before)
          if (levels <= 1) sL = 0.55;
          else if (levels === 2) sL = sL > 0.45 ? 0.85 : 0.35;
          else if (levels === 3) sL = sL > 0.6 ? 0.88 : sL > 0.3 ? 0.50 : 0.32;
          else { sL = sL > 0.65 ? 0.9 : sL > 0.48 ? 0.65 : sL > 0.3 ? 0.42 : sL > 0.15 ? 0.32 : 0.22; }
          sL *= lr;
          let r = Math.round(shR+(ltR-shR)*sL), g = Math.round(shG+(ltG-shG)*sL), bv = Math.round(shB+(ltB-shB)*sL);
          if (levels >= 2) { r = Math.min(255,r+Math.round(rmR*rim*0.4*lr)); g = Math.min(255,g+Math.round(rmG*rim*0.4*lr)); bv = Math.min(255,bv+Math.round(rmB*rim*0.4*lr)); }
          let alpha; if (def.alphaCurve===0) alpha=bAlpha*thick; else if (def.alphaCurve===1) alpha=bAlpha*thick*(0.4+thick*0.6); else alpha=bAlpha*thick*thick*(0.3+thick*0.7);
          od[idx]=r; od[idx+1]=g; od[idx+2]=bv; od[idx+3]=Math.round(alpha*255);
        }
      }
      oCtx.putImageData(oD, 0, 0);
      return { canvas: oCvs, ox: minX - pad, oy: minY - pad, w: fullW, h: fullH, sc: sc };
    }

    function buildCloudsForScene(W, H) {
        const sunX = W * 0.5;
        const sunY = H * 0.3;
        const sunR = H * 0.08;
        const minDist = sunR * 1.2;
        const clouds = [];
        // Limit maxReach to what's actually visible — orbit must intersect screen
        const screenDiag = Math.sqrt((W * 0.5) * (W * 0.5) + Math.max(sunY, H - sunY) * Math.max(sunY, H - sunY));
        const maxReach = screenDiag + 250; // + margin for cloud size
        let id = 0;

        function getCachedBake(seed, balls, sunAngle, cType, dep, prox, rs) {
            return bakeMetaball(balls, sunAngle, cType, dep, prox, 0, rs);
        }

        function addC(seed, dist, angle, radius, dep, spd, cType) {
            // Skip if orbit never intersects screen (orbit ellipse fully off-screen)
            const flatR = 0.7;
            const orbitLeft = sunX - dist, orbitRight = sunX + dist;
            const orbitTop = sunY - dist * flatR, orbitBot = sunY + dist * flatR;
            const margin = radius * 3;
            if (orbitRight + margin < 0 || orbitLeft - margin > W || orbitBot + margin < 0 || orbitTop - margin > H) return;
            const prox = Math.max(0, 1 - dist / maxReach);
            const balls = generateBalls(seed, radius, cType);
            const cx = sunX + Math.cos(angle) * dist;
            const cy = sunY + Math.sin(angle) * dist * 0.7;
            const rs = cType <= 1 ? 0.5 : 1;
            const baked = getCachedBake(seed, balls, Math.atan2(sunY - cy, sunX - cx), cType, dep, prox, rs);
            if (!baked) return;
            clouds.push({ id: id++, sunX: sunX, sunY: sunY, orbitDist: dist, angle: angle, orbitSpeed: spd, balls: balls, baked: baked, seed: seed, depth: dep, proximity: prox, baseRadius: radius, cloudType: cType, noRefresh: cType <= 1 });
        }

        function addHi(seed, dist, angle, radius, dep, spd, cType, layerY, layerFlat) {
            const orbitLeft = sunX - dist, orbitRight = sunX + dist;
            const orbitTop = layerY - dist * layerFlat, orbitBot = layerY + dist * layerFlat;
            const margin = radius * 3;
            if (orbitRight + margin < 0 || orbitLeft - margin > W || orbitBot + margin < 0 || orbitTop - margin > H) return;
            const prox = Math.max(0, 1 - dist / maxReach);
            const balls = generateBalls(seed, radius, cType);
            const hcx = sunX + Math.cos(angle) * dist;
            const hcy = layerY + Math.sin(angle) * dist * layerFlat;
            const rs = cType <= 1 ? 0.5 : 1;
            const baked = getCachedBake(seed, balls, Math.atan2(sunY - hcy, sunX - hcx), cType, dep, prox, rs);
            if (!baked) return;
            clouds.push({ id: id++, sunX: sunX, sunY: layerY, orbitDist: dist, angle: angle, orbitSpeed: spd, balls: balls, baked: baked, seed: seed, depth: dep, proximity: prox, baseRadius: radius, cloudType: cType, orbitFlatten: layerFlat, noRefresh: cType <= 1 });
        }

        const speeds = [0.04, 0.07, 0.11, 0.18, 0.28];
        const phases = [0, 1.0, 2.1, 3.4, 4.8];
        for (let s = 0; s < 5; s++) {
            const nCl = 16 + Math.floor(hash(s * 100) * 10);
            for (let c = 0; c < nCl; c++) {
                const cs = s * 1000 + c * 37;
                const rng2 = seededRandom(cs);
                const dist = Math.max(minDist, minDist + Math.sqrt(rng2()) * (maxReach - minDist));
                const ang = phases[s] + (c / nCl) * Math.PI * 2 + (rng2() - 0.5) * (Math.PI * 2 / nCl) * 1.5;
                const sr = rng2();
                let rad, cType;
                if (sr < 0.12) { rad = 110 + rng2() * 80; cType = 3; }
                else if (sr < 0.40) { rad = 55 + rng2() * 60; cType = 2; }
                else if (sr < 0.72) { rad = 28 + rng2() * 30; cType = 1; }
                else { rad = 14 + rng2() * 18; cType = 0; }
                const dep = Math.max(0, Math.min(1, (1 - s / 4) + (rng2() - 0.5) * 0.25));
                const spd = speeds[s] / (0.5 + rad / 60) * (0.55 + dep * 0.45) / (0.3 + dist / (H * 0.5));
                addC(cs, dist, ang, rad, dep, spd, cType);
                const nM = 3 + Math.floor(rng2() * 2);
                for (let m = 0; m < nM; m++) {
                    const ms = cs + 500 + m * 13;
                    const mr = seededRandom(ms);
                    const mRad = rad * (0.25 + mr() * 0.4);
                    const mType = cType > 0 ? cType - 1 : 0;
                    const mDist = Math.max(minDist, dist + (mr() - 0.5) * rad * 4);
                    const mAng = ang + (mr() - 0.5) * 1.0;
                    const mDep = Math.max(0, Math.min(1, dep + (mr() - 0.5) * 0.15));
                    addC(ms, mDist, mAng, mRad, mDep, speeds[s] / (0.5 + mRad / 60) * (0.55 + mDep * 0.45) / (0.3 + mDist / (H * 0.5)) * 1.1, mType);
                    const nSm = 1 + Math.floor(mr() * 2);
                    for (let sm = 0; sm < nSm; sm++) {
                        const ss = ms + 200 + sm * 7;
                        const sr2 = seededRandom(ss);
                        const sRad = mRad * (0.2 + sr2() * 0.35);
                        const sType = mType > 0 ? mType - 1 : 0;
                        const sDist = Math.max(minDist, mDist + (sr2() - 0.5) * mRad * 4);
                        const sAng = mAng + (sr2() - 0.5) * 1.2;
                        const sDep = Math.max(0, Math.min(1, mDep + (sr2() - 0.5) * 0.2));
                        addC(ss, sDist, sAng, sRad, sDep, speeds[s] / (0.5 + sRad / 60) * (0.55 + sDep * 0.45) / (0.3 + sDist / (H * 0.5)) * 1.3, sType);
                    }
                }
            }
        }

        const hiSunY = sunY - H * 0.12;
        const hiMin = minDist * 0.6;
        const hiMax = maxReach * 0.9;
        const hiSp = [0.30, 0.22, 0.15, 0.10];
        const hiPh = [0.5, 1.8, 3.3, 5.0];
        for (let hs = 0; hs < 4; hs++) {
            const hCl = 10 + Math.floor(hash(hs * 200 + 77) * 6);
            for (let hc = 0; hc < hCl; hc++) {
                const hcs = 50000 + hs * 1000 + hc * 41;
                const hrng = seededRandom(hcs);
                const hDist = Math.max(hiMin, hiMin + Math.pow(hrng(), 0.33) * (hiMax - hiMin));
                const hAng = hiPh[hs] + (hc / hCl) * Math.PI * 2 + (hrng() - 0.5) * (Math.PI * 2 / hCl) * 1.5;
                const hsr = hrng();
                let hRad, hcT;
                if (hsr < 0.15) { hRad = 30 + hrng() * 30; hcT = 2; }
                else if (hsr < 0.50) { hRad = 14 + hrng() * 18; hcT = 1; }
                else { hRad = 6 + hrng() * 10; hcT = 0; }
                const hDep = Math.max(0, Math.min(1, (1 - hs / 3) + (hrng() - 0.5) * 0.2));
                addHi(hcs, hDist, hAng, hRad, hDep, hiSp[hs] / (0.5 + hRad / 60) * (0.55 + hDep * 0.45) / (0.3 + hDist / (H * 0.5)), hcT, hiSunY, 0.35);
                const hnM = 1 + Math.floor(hrng() * 1);
                for (let hm = 0; hm < hnM; hm++) {
                    const hms = hcs + 600 + hm * 17;
                    const hmr = seededRandom(hms);
                    const hmRad = hRad * (0.3 + hmr() * 0.35);
                    const hmT = hcT > 0 ? hcT - 1 : 0;
                    const hmDist = Math.max(hiMin, hDist + (hmr() - 0.5) * hRad * 2);
                    const hmAng = hAng + (hmr() - 0.5) * 0.5;
                    addHi(hms, hmDist, hmAng, hmRad, Math.max(0, Math.min(1, hDep + (hmr() - 0.5) * 0.15)), hiSp[hs] / (0.5 + hmRad / 60) * (0.55 + hDep * 0.45) / (0.3 + hmDist / (H * 0.5)) * 1.15, hmT, hiSunY, 0.35);
                }
            }
        }

        const topY = sunY - H * 0.22;
        const topMin = minDist * 0.4;
        const topMax = maxReach * 0.95;
        const topSp = [0.35, 0.26, 0.18];
        const topPh = [0.3, 2.0, 4.2];
        for (let ts = 0; ts < 3; ts++) {
            const tCl = 8 + Math.floor(hash(ts * 300 + 99) * 6);
            for (let tc = 0; tc < tCl; tc++) {
                const tcs = 70000 + ts * 1000 + tc * 47;
                const trng = seededRandom(tcs);
                const tDist = Math.max(topMin, topMin + Math.pow(trng(), 0.33) * (topMax - topMin));
                const tAng = topPh[ts] + (tc / tCl) * Math.PI * 2 + (trng() - 0.5) * (Math.PI * 2 / tCl) * 1.5;
                const tsr2 = trng();
                let tRad, tcT;
                if (tsr2 < 0.35) { tRad = 10 + trng() * 15; tcT = 1; }
                else { tRad = 5 + trng() * 8; tcT = 0; }
                const tDep = Math.max(0, Math.min(1, (1 - ts / 2) + (trng() - 0.5) * 0.15));
                addHi(tcs, tDist, tAng, tRad, tDep, topSp[ts] / (0.5 + tRad / 60) * (0.55 + tDep * 0.45) / (0.3 + tDist / (H * 0.5)), tcT, topY, 0.2);
                const tnM = 1 + Math.floor(trng() * 2);
                for (let tm = 0; tm < tnM; tm++) {
                    const tms = tcs + 700 + tm * 19;
                    const tmr = seededRandom(tms);
                    const tmRad = tRad * (0.3 + tmr() * 0.4);
                    const tmDist = Math.max(topMin, tDist + (tmr() - 0.5) * tRad * 3);
                    const tmAng = tAng + (tmr() - 0.5) * 0.6;
                    addHi(tms, tmDist, tmAng, tmRad, Math.max(0, Math.min(1, tDep + (tmr() - 0.5) * 0.15)), topSp[ts] / (0.5 + tmRad / 60) * (0.55 + tDep * 0.45) / (0.3 + tmDist / (H * 0.5)) * 1.2, 0, topY, 0.2);
                }
            }
        }

        // Screen-space grid fill — place clouds across visible sky area
        // Convert screen position to orbit params around sun
        const skyBot = H * 0.72; // just above horizon
        const flatR = 0.7;
        const gCols = 8, gRows = 16;
        let gIdx = 0;
        for (let gr = 0; gr < gRows; gr++) {
            for (let gc2 = 0; gc2 < gCols; gc2++) {
                const gs = 90000 + gIdx * 71;
                const grng = seededRandom(gs);
                // Target screen position with jitter — bias rows toward bottom half
                const sx = ((gc2 + 0.15 + grng() * 0.7) / gCols) * W;
                const rowT = (gr + 0.15 + grng() * 0.7) / gRows;
                const sy = sunY * 0.3 + Math.pow(rowT, 0.7) * (skyBot - sunY * 0.3);
                // Convert to orbit distance + angle from sun center
                const dx = sx - sunX, dy = (sy - sunY) / flatR;
                const gDist = Math.max(minDist, Math.sqrt(dx * dx + dy * dy));
                const gAng = Math.atan2(dy, dx);
                const gRad = 18 + grng() * 50;
                const gT = gRad > 55 ? 3 : gRad > 35 ? 2 : gRad > 18 ? 1 : 0;
                const gDep = 0.15 + grng() * 0.55;
                const gSpd = 0.08 / (0.5 + gRad / 60) * (0.55 + gDep * 0.45) / (0.3 + gDist / (H * 0.5));
                addC(gs, gDist, gAng, gRad, gDep, gSpd, gT);
                // Companion cloud nearby
                const cs2 = gs + 500;
                const crng = seededRandom(cs2);
                const cRad = gRad * (0.3 + crng() * 0.4);
                const cT2 = gT > 0 ? gT - 1 : 0;
                const cDist = Math.max(minDist, gDist + (crng() - 0.5) * gRad * 3);
                const cAng2 = gAng + (crng() - 0.5) * 0.8;
                const cDep = Math.max(0, Math.min(1, gDep + (crng() - 0.5) * 0.2));
                addC(cs2, cDist, cAng2, cRad, cDep, 0.1 / (0.5 + cRad / 60) * (0.55 + cDep * 0.45) / (0.3 + cDist / (H * 0.5)), cT2);
                gIdx++;
            }
        }

        clouds.sort(function(a, b) { return a.depth - b.depth; });
        return clouds;
    }

    function refreshCloud(cloud, time2, sunX, sunY) {
        if (cloud.noRefresh) return;
        const flatR = cloud.orbitFlatten || 0.7;
        const x = sunX + Math.cos(cloud.angle) * cloud.orbitDist;
        const y = cloud.sunY + Math.sin(cloud.angle) * cloud.orbitDist * flatR;
        const sunAngle = Math.atan2(sunY - y, sunX - x);
        if (!cloud._rc) cloud._rc = 0;
        cloud._rc++;
        let useBalls = cloud.balls;
        if (cloud._rc % 30 === 0) {
            const drift = time2 * 0.0001;
            const drifted = [];
            for (let i = 0; i < cloud.balls.length; i++) {
                const b = cloud.balls[i];
                if (i === 0) { drifted.push(b); continue; }
                drifted.push({
                    cx: b.cx + Math.sin(drift * 3 + i * 1.7) * b.r * 0.12,
                    cy: b.cy + Math.cos(drift * 2.3 + i * 2.1) * b.r * 0.1,
                    r: b.r
                });
            }
            useBalls = drifted;
        }
        const baked = bakeMetaball(useBalls, sunAngle, cloud.cloudType, cloud.depth, cloud.proximity, 0);
        if (baked) cloud.baked = baked;
    }

    const rng = (i, off) => { const s = Math.sin((i + sceneSeed) * 217.3 + off * 341.7) * 73291.9; return s - Math.floor(s); };
    const ihash = (n, off) => { let h = Math.imul(n + off, 2654435761) | 0; h = Math.imul(h ^ (h >>> 16), 0x45d9f3b); h = Math.imul(h ^ (h >>> 13), 0x45d9f3b); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };

    const draw = (t) => {
      animId = requestAnimationFrame(draw);
      if (t - lastFrame < honourInterval) return;
      lastFrame = t;
      const time = t * 0.0005;

      // (all pre-battleground effects removed — only sky + sun in battleground)

      ctx.save();
      ctx.scale(honourScale, honourScale);

      // ===== BATTLEGROUND — ground-plan projected sword field =====
      {
        const W = w, H = h;
        const hY = H; // sky covers 100%

        // === SKY + SUN + CLOUDS (from cloud-demo) ===
        const sunX = W * 0.5, sunY = H * 0.3;
        const sunR = H * 0.06;

        // Sky — warm sunset gradient from ground-background.jsx
        if (!skyCache || skyCache.width !== W || skyCache.height !== H) {
          skyCache = document.createElement('canvas'); skyCache.width = W; skyCache.height = H;
          const sc = skyCache.getContext('2d');
          // Base vertical gradient — dramatic dark sky
          const sk = sc.createLinearGradient(0,0,0,H);
          sk.addColorStop(0,"rgb(8,4,2)");sk.addColorStop(0.1,"rgb(18,8,4)");sk.addColorStop(0.2,"rgb(40,14,6)");
          sk.addColorStop(0.35,"rgb(85,28,10)");sk.addColorStop(0.5,"rgb(140,50,15)");sk.addColorStop(0.65,"rgb(190,80,25)");
          sk.addColorStop(0.78,"rgb(220,120,40)");sk.addColorStop(0.88,"rgb(240,160,60)");sk.addColorStop(1,"rgb(250,190,80)");
          sc.fillStyle=sk;sc.fillRect(0,0,W,H);
          // Sun warm radial glow — intense fire
          const sg=sc.createRadialGradient(sunX,sunY,0,sunX,sunY,Math.max(W,H)*0.55);
          sg.addColorStop(0,"rgba(255,220,140,0.7)");sg.addColorStop(0.08,"rgba(255,180,80,0.5)");sg.addColorStop(0.2,"rgba(255,120,40,0.3)");sg.addColorStop(0.4,"rgba(200,60,15,0.12)");sg.addColorStop(0.7,"rgba(120,25,5,0.04)");sg.addColorStop(1,"rgba(40,8,2,0)");
          sc.fillStyle=sg;sc.fillRect(0,0,W,H);
          // Hot inner glow — brighter core
          const sg2=sc.createRadialGradient(sunX,sunY,0,sunX,sunY,H*0.22);
          sg2.addColorStop(0,"rgba(255,240,190,0.75)");sg2.addColorStop(0.15,"rgba(255,200,100,0.5)");sg2.addColorStop(0.4,"rgba(255,140,50,0.2)");sg2.addColorStop(0.7,"rgba(180,60,15,0.05)");sg2.addColorStop(1,"rgba(100,20,5,0)");
          sc.fillStyle=sg2;sc.fillRect(0,0,W,H);
          // Sun disc core
          const sd = sc.createRadialGradient(sunX,sunY,0,sunX,sunY,sunR);
          sd.addColorStop(0,"rgba(255,255,240,1)");sd.addColorStop(0.3,"rgba(255,250,200,0.9)");sd.addColorStop(0.6,"rgba(255,225,140,0.5)");sd.addColorStop(1,"rgba(255,190,80,0)");
          sc.fillStyle=sd;sc.beginPath();sc.arc(sunX,sunY,sunR*1.8,0,Math.PI*2);sc.fill();
          // Horizon haze band — warm glow at horizon
          const hz=sc.createLinearGradient(0,H*0.55,0,H*0.78);
          hz.addColorStop(0,"rgba(160,70,20,0)");hz.addColorStop(0.3,"rgba(180,90,25,0.08)");hz.addColorStop(0.6,"rgba(200,110,35,0.15)");hz.addColorStop(1,"rgba(220,130,45,0.22)");
          sc.fillStyle=hz;sc.fillRect(0,H*0.55,W,H*0.78-H*0.55);
          // Edge vignette on sky — darken corners/edges
          const vig=sc.createRadialGradient(sunX,sunY,H*0.15,sunX,sunY,Math.max(W,H)*0.85);
          vig.addColorStop(0,"rgba(0,0,0,0)");vig.addColorStop(0.4,"rgba(0,0,0,0)");vig.addColorStop(0.7,"rgba(5,2,1,0.3)");vig.addColorStop(0.85,"rgba(5,2,1,0.55)");vig.addColorStop(1,"rgba(5,2,1,0.75)");
          sc.fillStyle=vig;sc.fillRect(0,0,W,H);
        }
        ctx.drawImage(skyCache, 0, 0);

        // === LIVE CLOUD RENDERING ===
        if (!sceneClouds && !cloudBuildPending) {
          cloudBuildPending = true;
          setTimeout(() => { sceneClouds = buildCloudsForScene(W, H); }, 0);
        }
        if (sceneClouds) {
        cloudTime += honourInterval;
        // Refresh a few cloud shapes
        const rPerF = 2;
        for (let ri = 0; ri < rPerF; ri++) { refreshCloud(sceneClouds[(cloudRefreshIdx + ri) % sceneClouds.length], cloudTime, sunX, sunY); }
        cloudRefreshIdx = (cloudRefreshIdx + rPerF) % sceneClouds.length;
        // Draw clouds with velocity stretch
        for (let di = 0; di < sceneClouds.length; di++) {
          const cloud = sceneClouds[di], rawAng = cloud.orbitSpeed * 0.025, angSpeed = Math.max(0.3 / Math.max(50, cloud.orbitDist), rawAng);
          cloud.angle += angSpeed;
          const ca = cloud.angle, flatR = cloud.orbitFlatten || 0.7;
          const cx2 = cloud.sunX + Math.cos(ca) * cloud.orbitDist;
          const cy2 = cloud.sunY + Math.sin(ca) * cloud.orbitDist * flatR;
          const bk = cloud.baked; const bkSrc = bk && (bk.bitmap || bk.canvas); if (!bkSrc) continue;
          const margin2 = Math.max(bk.w, bk.h) * 1.5;
          if (cx2 + bk.ox > W + margin2 || cx2 + bk.ox + bk.w < -margin2 || cy2 + bk.oy > H + margin2 || cy2 + bk.oy + bk.h < -margin2) continue;
          const vx = -Math.sin(ca) * cloud.orbitDist * angSpeed, vy = Math.cos(ca) * cloud.orbitDist * flatR * angSpeed;
          const speed = Math.sqrt(vx * vx + vy * vy);
          const drawW = bk.w, drawH = bk.h;
          if (speed > 0.01) {
            const stretchAmt = 1 + Math.min(1.2, speed * 0.5), squeezeAmt = 1 / Math.sqrt(stretchAmt);
            const centSkew = Math.max(-0.5, Math.min(0.5, angSpeed * cloud.orbitDist * 0.001));
            const vAngle = Math.atan2(vy, vx);
            const ccx = cx2 + bk.ox + drawW * 0.5, ccy = cy2 + bk.oy + drawH * 0.5;
            ctx.save(); ctx.translate(ccx, ccy); ctx.rotate(vAngle);
            ctx.transform(stretchAmt, centSkew, 0, squeezeAmt, 0, 0);
            ctx.rotate(-vAngle); ctx.drawImage(bkSrc, -drawW * 0.5, -drawH * 0.5, drawW, drawH); ctx.restore();
          } else {
            ctx.drawImage(bkSrc, cx2 + bk.ox, cy2 + bk.oy, drawW, drawH);
          }
        }
        // God rays — fan downward from sun toward ground, matching camera angle
        ctx.save(); ctx.globalCompositeOperation = 'lighter';
        const rayCount = 12;
        // Rays fan from sun downward toward the ground plane
        // Camera looks up at sun (sun at 30% height, horizon at 75%)
        // Center ray direction: straight down from sun to ground center
        const rayCenterAngle = Math.PI * 0.5; // straight down
        const rayConeSpread = Math.PI * 0.55; // wide fan covering most of the ground
        for (let ri2 = 0; ri2 < rayCount; ri2++) {
          const rayRng = seededRandom(ri2 * 777 + 42);
          // Distribute rays across the cone with randomized spacing
          const t = (ri2 + rayRng() * 0.6 - 0.3) / (rayCount - 1);
          const rayAngle = rayCenterAngle - rayConeSpread * 0.5 + t * rayConeSpread;
          // Rays extend from sun all the way to bottom of screen
          const rayLen = (H - sunY) * (1.0 + rayRng() * 0.3);
          // Width varies — some thick, some thin, like real crepuscular rays
          const rayW = sunR * (0.3 + rayRng() * 1.2);
          const ex = sunX + Math.cos(rayAngle) * rayLen;
          const ey = sunY + Math.sin(rayAngle) * rayLen;
          // Warm golden color, varying opacity
          const rayAlpha = 0.03 + rayRng() * 0.05;
          const rayGrad = ctx.createLinearGradient(sunX, sunY, ex, ey);
          rayGrad.addColorStop(0, 'rgba(255,240,170,' + (rayAlpha * 1.2) + ')');
          rayGrad.addColorStop(0.15, 'rgba(255,215,120,' + rayAlpha + ')');
          rayGrad.addColorStop(0.5, 'rgba(255,180,70,' + (rayAlpha * 0.4) + ')');
          rayGrad.addColorStop(0.8, 'rgba(255,140,40,' + (rayAlpha * 0.12) + ')');
          rayGrad.addColorStop(1, 'rgba(255,100,20,0)');
          ctx.fillStyle = rayGrad;
          ctx.beginPath();
          const perpX = -Math.sin(rayAngle), perpY = Math.cos(rayAngle);
          // Narrow at sun, widens as it reaches the ground
          ctx.moveTo(sunX + perpX * rayW * 0.1, sunY + perpY * rayW * 0.1);
          ctx.lineTo(sunX - perpX * rayW * 0.1, sunY - perpY * rayW * 0.1);
          ctx.lineTo(ex - perpX * rayW * 3.5, ey - perpY * rayW * 3.5);
          ctx.lineTo(ex + perpX * rayW * 3.5, ey + perpY * rayW * 3.5);
          ctx.closePath(); ctx.fill();
        }
        ctx.restore();
        } // end if (sceneClouds)

        // Dynamic ambient — clouds darken the sky behind them
        // First pass: draw dark shadow under each cloud to occlude the bright sky
        ctx.save();
        ctx.globalCompositeOperation = 'multiply';
        if (sceneClouds) {
          for (let di = 0; di < sceneClouds.length; di++) {
            const cl = sceneClouds[di];
            // Skip fume and small — too transparent to occlude light
            if (cl.cloudType <= 1) continue;
            const bk = cl.baked; if (!bk) continue;
            const ca = cl.angle, flatR = cl.orbitFlatten || 0.7;
            const clx = cl.sunX + Math.cos(ca) * cl.orbitDist;
            const cly = cl.sunY + Math.sin(ca) * cl.orbitDist * flatR;
            const m2 = Math.max(bk.w, bk.h) * 2;
            if (clx + bk.ox > W + m2 || clx + bk.ox + bk.w < -m2 || cly + bk.oy > H + m2 || cly + bk.oy + bk.h < -m2) continue;
            const shadowR = Math.max(bk.w, bk.h) * 0.5;
            const cx3 = clx + bk.ox + bk.w * 0.5;
            const cy3 = cly + bk.oy + bk.h * 0.5;
            // Only medium and big clouds darken — and less aggressively
            const darkness = cl.cloudType >= 3 ? 0.82 : 0.88;
            const dStr = Math.round(darkness * 255);
            const midStr = Math.round(darkness * 255 + (255 - darkness * 255) * 0.6);
            const shadowGrad = ctx.createRadialGradient(cx3, cy3, 0, cx3, cy3, shadowR);
            shadowGrad.addColorStop(0, 'rgb(' + dStr + ',' + dStr + ',' + dStr + ')');
            shadowGrad.addColorStop(0.5, 'rgb(' + midStr + ',' + midStr + ',' + midStr + ')');
            shadowGrad.addColorStop(1, 'rgb(255,255,255)');
            ctx.fillStyle = shadowGrad;
            ctx.beginPath(); ctx.arc(cx3, cy3, shadowR, 0, Math.PI * 2); ctx.fill();
          }
        }
        ctx.restore();

        // Sun lens flare — circles along the sun-to-center axis
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        const flareCX = W * 0.5, flareCY = H * 0.5;
        // Flare axis: from sun through screen center and beyond
        const flareDX = flareCX - sunX, flareDY = flareCY - sunY;
        const flareLen = Math.sqrt(flareDX * flareDX + flareDY * flareDY);
        const flareNX = flareDX / flareLen, flareNY = flareDY / flareLen;
        // Flare elements at different positions along the axis
        const flareElements = [
          { t: 0.3, r: sunR * 0.8, a: 0.025, cr: 255, cg: 220, cb: 140 },
          { t: 0.5, r: sunR * 0.4, a: 0.04, cr: 255, cg: 200, cb: 100 },
          { t: 0.7, r: sunR * 1.2, a: 0.015, cr: 255, cg: 180, cb: 80 },
          { t: 0.9, r: sunR * 0.3, a: 0.05, cr: 255, cg: 240, cb: 180 },
          { t: 1.2, r: sunR * 0.6, a: 0.02, cr: 200, cg: 150, cb: 60 },
          { t: 1.5, r: sunR * 1.5, a: 0.01, cr: 255, cg: 160, cb: 50 },
          { t: 1.8, r: sunR * 0.25, a: 0.04, cr: 255, cg: 255, cb: 200 },
        ];
        for (const fe of flareElements) {
          const fx = sunX + flareNX * flareLen * fe.t;
          const fy = sunY + flareNY * flareLen * fe.t;
          const fg = ctx.createRadialGradient(fx, fy, 0, fx, fy, fe.r);
          fg.addColorStop(0, 'rgba(' + fe.cr + ',' + fe.cg + ',' + fe.cb + ',' + fe.a + ')');
          fg.addColorStop(0.5, 'rgba(' + fe.cr + ',' + fe.cg + ',' + fe.cb + ',' + (fe.a * 0.3) + ')');
          fg.addColorStop(1, 'rgba(' + fe.cr + ',' + fe.cg + ',' + fe.cb + ',0)');
          ctx.fillStyle = fg; ctx.beginPath(); ctx.arc(fx, fy, fe.r, 0, Math.PI * 2); ctx.fill();
        }
        // Anamorphic streak — horizontal line through sun
        const streakGrad = ctx.createLinearGradient(sunX - W * 0.4, sunY, sunX + W * 0.4, sunY);
        streakGrad.addColorStop(0, 'rgba(255,200,100,0)');
        streakGrad.addColorStop(0.3, 'rgba(255,220,140,0.02)');
        streakGrad.addColorStop(0.5, 'rgba(255,240,180,0.04)');
        streakGrad.addColorStop(0.7, 'rgba(255,220,140,0.02)');
        streakGrad.addColorStop(1, 'rgba(255,200,100,0)');
        ctx.fillStyle = streakGrad;
        ctx.fillRect(sunX - W * 0.4, sunY - sunR * 0.3, W * 0.8, sunR * 0.6);
        ctx.restore();

        // Atmospheric haze near horizon
        const hazeY = H * 0.65;
        const haze = ctx.createLinearGradient(0, hazeY, 0, H);
        haze.addColorStop(0, 'rgba(200,140,60,0)');
        haze.addColorStop(0.3, 'rgba(200,140,60,0.08)');
        haze.addColorStop(0.6, 'rgba(180,110,40,0.15)');
        haze.addColorStop(1, 'rgba(150,80,25,0.2)');
        ctx.fillStyle = haze;
        ctx.fillRect(0, hazeY, W, H - hazeY);

        // === FLAT 3D GROUND PLANE (100m × 100m) + 500 SWORDS ===
        const edgeY = H * 0.75; // horizon line — 25% from bottom
        const focal = W * 0.8;

        // Flat ground — no bowl, wy = 0 everywhere
        const camZ = 8;
        const camH = 0.7;
        const groundCurve = 0.008;
        const projX = (wx, wz) => W * 0.5 + wx * focal / (wz - camZ);
        const projY = (wz, wx) => {
          const wy = wx !== undefined ? groundCurve * wx * wx : 0;
          return edgeY + (camH - wy) * focal / (wz - camZ);
        };

        // --- Baked ground from ground-background.jsx ---
        if (!groundCache || groundCache.width !== W || groundCache.height !== H) {
          groundCache = document.createElement('canvas'); groundCache.width = W; groundCache.height = H;
          const gctx = groundCache.getContext('2d');
          const SEED = sceneSeed;
          const groundH = H - edgeY;
          const slx=0.08,sly=-0.5,slz=0.86,sLen=Math.sqrt(slx*slx+sly*sly+slz*slz);
          const snx=slx/sLen,sny=sly/sLen,snz=slz/sLen;
          const gScale=0.85,gW=Math.round(W*gScale),gHt=Math.round(groundH*gScale);
          if(gW>=4&&gHt>=4){
          const gC=document.createElement("canvas");gC.width=gW;gC.height=gHt;
          const gc=gC.getContext("2d"),gImg=gc.createImageData(gW,gHt),gd=gImg.data;
          const hMap=new Float32Array(gW*gHt);
          const feats=[];
          for(let i=0;i<18;i++)feats.push({cx:_bgHash(i*71+100),cy:0.005+_bgHash(i*71+101)*0.06,rx:0.05+_bgHash(i*71+102)*0.12,ry:0.02+_bgHash(i*71+103)*0.035,h:0.25+_bgHash(i*71+104)*0.4});
          for(let i=0;i<15;i++)feats.push({cx:_bgHash(i*61+150),cy:0.05+_bgHash(i*61+151)*0.14,rx:0.04+_bgHash(i*61+152)*0.1,ry:0.025+_bgHash(i*61+153)*0.04,h:0.18+_bgHash(i*61+154)*0.3});
          for(let i=0;i<18;i++)feats.push({cx:_bgHash(i*83+200),cy:0.15+_bgHash(i*83+201)*0.4,rx:0.04+_bgHash(i*83+202)*0.09,ry:0.03+_bgHash(i*83+203)*0.05,h:0.14+_bgHash(i*83+204)*0.28});
          for(let i=0;i<12;i++)feats.push({cx:_bgHash(i*79+250),cy:0.45+_bgHash(i*79+251)*0.35,rx:0.04+_bgHash(i*79+252)*0.08,ry:0.03+_bgHash(i*79+253)*0.05,h:0.1+_bgHash(i*79+254)*0.22});
          for(let i=0;i<12;i++)feats.push({cx:0.04+_bgHash(i*97+300)*0.92,cy:0.03+_bgHash(i*97+301)*0.8,rx:0.018+_bgHash(i*97+302)*0.04,ry:0.012+_bgHash(i*97+303)*0.03,h:-(0.12+_bgHash(i*97+304)*0.22)});
          feats.push({cx:-0.05,cy:0.85,rx:0.2,ry:0.15,h:0.35},{cx:1.05,cy:0.82,rx:0.18,ry:0.18,h:0.3},{cx:0.5,cy:0.22,rx:0.2,ry:0.16,h:-0.1});
          for(let py=0;py<gHt;py++){const ny=py/gHt,ds=0.7+ny*1.2;for(let px=0;px<gW;px++){const nx=px/gW;
            let h=_bgFbm(nx*2.2,ny*1.3,2,SEED+800)*0.4+_bgFbm(nx*4.5,ny*3,2,SEED+200)*0.3*ds+_bgRidged(nx*3.5,ny*2.5,2,SEED+500)*0.18*ds+_bgFbm(nx*9,ny*6,2,SEED+300)*0.1*ds;
            const pb=_bgFbm(nx*35,ny*22,1,SEED+900);if(pb>0.74)h+=(pb-0.74)*0.35*ds;
            const hn=_bgFbm(nx*28,ny*18,1,SEED+1100);if(hn<0.22)h-=(0.22-hn)*0.3*ds;
            for(const f of feats){const dx=(nx-f.cx)/f.rx,dy=(ny-f.cy)/f.ry,d2=dx*dx+dy*dy;if(d2<4){const tt=Math.max(0,1-Math.sqrt(d2)/2);h+=f.h*tt*tt*(3-2*tt);}}
            hMap[py*gW+px]=h;
          }}
          const brushMap=new Float32Array(gW*gHt);
          for(let py=0;py<gHt;py++)for(let px=0;px<gW;px++)brushMap[py*gW+px]=_bgFbm(px/gW*25+py/gHt*2,py/gHt*4,2,SEED+9000);
          // 4-tone shading with warm tones
          for(let py=0;py<gHt;py++){const dT=py/gHt,dC=Math.pow(dT,0.5);
            const contrast=0.6+dT*0.4,warmShift=(1-dT)*25,baseVal=18+dC*55;
            // Deep dramatic ground — dark shadows, fiery highlights
            const t0r=baseVal*0.35+warmShift*0.2, t0g=baseVal*0.22+warmShift*0.08, t0b=baseVal*0.18+warmShift*0.03;
            const t1r=baseVal*0.55+warmShift*0.32, t1g=baseVal*0.38+warmShift*0.14, t1b=baseVal*0.28+warmShift*0.05;
            // Mid-tone: deep amber
            const tmR=baseVal*0.8+warmShift*0.5, tmG=baseVal*0.52+warmShift*0.25, tmB=baseVal*0.3+warmShift*0.06;
            // Light tones: fiery ember glow
            const t2r=baseVal*1.1+warmShift*0.7, t2g=baseVal*0.72+warmShift*0.35, t2b=baseVal*0.32+warmShift*0.06;
            const t3r=baseVal*1.4+warmShift*0.9, t3g=baseVal*0.9+warmShift*0.45, t3b=baseVal*0.35+warmShift*0.08;
            const tones=[[t0r,t0g,t0b],[t0r+(t1r-t0r)*contrast,t0g+(t1g-t0g)*contrast,t0b+(t1b-t0b)*contrast],[t0r+(tmR-t0r)*contrast,t0g+(tmG-t0g)*contrast,t0b+(tmB-t0b)*contrast],[t0r+(t2r-t0r)*contrast,t0g+(t2g-t0g)*contrast,t0b+(t2b-t0b)*contrast],[t0r+(t3r-t0r)*contrast,t0g+(t3g-t0g)*contrast,t0b+(t3b-t0b)*contrast]];
            for(let px=0;px<gW;px++){const nx=px/gW;
              const gH3=(x,y)=>hMap[Math.max(0,Math.min(gHt-1,y))*gW+Math.max(0,Math.min(gW-1,x))];
              const bs=6+dT*14,hL=(gH3(px-2,py)+gH3(px-1,py))*0.5,hR=(gH3(px+2,py)+gH3(px+1,py))*0.5;
              const hU=(gH3(px,py-2)+gH3(px,py-1))*0.5,hD=(gH3(px,py+2)+gH3(px,py+1))*0.5;
              const bx2=(hL-hR)*bs,by2=(hU-hD)*bs,bl=Math.sqrt(bx2*bx2+by2*by2+1);
              const rawDot=Math.max(0,(bx2/bl)*snx+(by2/bl)*sny+(1/bl)*snz);
              const shifted=rawDot+(brushMap[py*gW+px]-0.5)*0.1;
              // 5 hard bands: deep shadow / shadow / warm mid / light / highlight
              const ti=shifted>0.72?4:shifted>0.52?3:shifted>0.32?2:shifted>0.14?1:0;
              let rr=tones[ti][0],gg=tones[ti][1],bb=tones[ti][2];
              // Soil variation
              const sA=(_bgFbm(nx*2.8,dT*1.8,2,SEED+1000)-0.5)*2,sB=(_bgFbm(nx*1.5,dT*1.0,2,SEED+2000)-0.5)*2;
              rr+=(sA*3+sB*2.5)*dC;gg+=(sA*1.5+sB*1)*dC;bb+=(sA*-0.5+sB*-0.3)*dC;
              const sc2=_bgFbm(nx*3,dT*2,2,SEED+3000);if(sc2<0.25){const s2=Math.pow((0.25-sc2)/0.25,1.5)*0.12;rr*=(1-s2);gg*=(1-s2);bb*=(1-s2);}
              // Cracks — subtle
              const cn=_bgFbm(nx*10,dT*7,2,SEED+7000),ce=Math.abs(cn-0.5);if(ce<0.01){const cs=(1-ce/0.01);rr=rr*(1-cs*0.3)+tones[0][0]*cs*0.3;gg=gg*(1-cs*0.3)+tones[0][1]*cs*0.3;bb=bb*(1-cs*0.3)+tones[0][2]*cs*0.3;}
              // Curve clip highlight + edges
              const hg2=Math.pow(Math.max(0,1-dT*6),3),scx=Math.exp(-Math.pow((nx-0.5)*2,2));
              rr+=hg2*scx*35;gg+=hg2*scx*22;bb+=hg2*scx*8;
              const eDk=1-Math.pow(Math.abs(nx-0.5)*2,2)*0.1;rr*=eDk;gg*=eDk;bb*=eDk;
              const idx=(py*gW+px)*4;gd[idx]=Math.max(0,Math.min(255,Math.round(rr)));gd[idx+1]=Math.max(0,Math.min(255,Math.round(gg)));gd[idx+2]=Math.max(0,Math.min(255,Math.round(bb)));gd[idx+3]=255;
          }}
          gc.putImageData(gImg,0,0);
          // Ground curve
          const curveH = H * 0.035;
          const groundCurveY2 = (x, noisy) => {
            const base = edgeY - curveH * Math.pow((x / W - 0.5) * 2, 2);
            if (!noisy) return base;
            const ix = x / W;
            const n1 = _bgFbm(ix * 6, 0.5, 3, SEED + 6000) * 12 - 6;
            const n2 = _bgFbm(ix * 15, 0.5, 2, SEED + 6100) * 5 - 2.5;
            const n3 = _bgRidged(ix * 10, 0.5, 2, SEED + 6200) * 4 - 2;
            return base + n1 + n2 + n3;
          };
          // Draw ground clipped to curve
          gctx.save();
          gctx.beginPath();
          for (let i2 = 0; i2 <= 200; i2++) { const x2 = (i2 / 200) * W; gctx.lineTo(x2, groundCurveY2(x2, true)); }
          gctx.lineTo(W, H); gctx.lineTo(0, H); gctx.closePath(); gctx.clip();
          gctx.imageSmoothingEnabled=true;gctx.drawImage(gC, 0, edgeY - curveH, W, groundH + curveH);
          // Edge detection overlay
          const eC2=document.createElement("canvas");eC2.width=gW;eC2.height=gHt;const ec2=eC2.getContext("2d"),eImg2=ec2.createImageData(gW,gHt),ed2=eImg2.data;
          for(let py=1;py<gHt-1;py++){for(let px=1;px<gW-1;px++){const getL=(x,y)=>{const i2=(y*gW+x)*4;return gd[i2]*0.3+gd[i2+1]*0.59+gd[i2+2]*0.11;};const gx2=getL(px+1,py)-getL(px-1,py),gy2=getL(px,py+1)-getL(px,py-1),edge=Math.sqrt(gx2*gx2+gy2*gy2),dT2=py/gHt,threshold=6+dT2*10;if(edge>threshold){const strength=Math.min(1,(edge-threshold)/(threshold*0.7)),a=Math.round(strength*22*(0.3+dT2*0.7)),idx2=(py*gW+px)*4;ed2[idx2]=10;ed2[idx2+1]=8;ed2[idx2+2]=6;ed2[idx2+3]=a;}}}
          ec2.putImageData(eImg2,0,0);gctx.imageSmoothingEnabled=true;gctx.drawImage(eC2, 0, edgeY - curveH, W, groundH + curveH);
          // Top texture — sample from mid rows
          const topRows = Math.min(Math.round(gHt * 0.35), gHt);
          const srcOffset = Math.round(gHt * 0.3);
          const tpC2 = document.createElement("canvas"); tpC2.width = gW; tpC2.height = topRows;
          const tpc2 = tpC2.getContext("2d"), tpImg2 = tpc2.createImageData(gW, topRows), tpd2 = tpImg2.data;
          for (let py = 0; py < topRows; py++) {
            const fade = 1 - Math.pow(py / topRows, 1.5);
            const srcY = Math.min(gHt - 1, srcOffset + py);
            for (let px = 0; px < gW; px++) {
              const srcIdx = (srcY * gW + px) * 4;
              const dstIdx = (py * gW + px) * 4;
              let pr = gd[srcIdx], pg2 = gd[srcIdx+1], pb2 = gd[srcIdx+2];
              const ea = ed2[srcIdx+3] / 255;
              if (ea > 0) { pr = pr * (1 - ea) + ed2[srcIdx] * ea; pg2 = pg2 * (1 - ea) + ed2[srcIdx+1] * ea; pb2 = pb2 * (1 - ea) + ed2[srcIdx+2] * ea; }
              tpd2[dstIdx] = Math.round(pr); tpd2[dstIdx+1] = Math.round(pg2); tpd2[dstIdx+2] = Math.round(pb2); tpd2[dstIdx+3] = Math.round(fade * 220);
            }
          }
          tpc2.putImageData(tpImg2, 0, 0);
          gctx.imageSmoothingEnabled = true;
          gctx.drawImage(tpC2, 0, edgeY - curveH, W, Math.round(groundH * 0.35));
          gctx.restore();
          // Ground shade + amber multiply
          gctx.save();
          gctx.beginPath();
          for (let i2 = 0; i2 <= 200; i2++) { const x2 = (i2 / 200) * W; gctx.lineTo(x2, groundCurveY2(x2, true)); }
          gctx.lineTo(W, H); gctx.lineTo(0, H); gctx.closePath(); gctx.clip();
          const gShade=gctx.createLinearGradient(0,edgeY-curveH,0,edgeY+groundH);
          gShade.addColorStop(0,"rgba(25,12,4,0.0)");gShade.addColorStop(0.5,"rgba(20,10,3,0.03)");gShade.addColorStop(1,"rgba(12,5,2,0.08)");
          gctx.fillStyle=gShade;gctx.fillRect(0,edgeY-curveH,W,groundH+curveH);
          gctx.globalCompositeOperation="multiply";
          const amberShade=gctx.createLinearGradient(0,edgeY-curveH,0,edgeY+groundH);
          amberShade.addColorStop(0,"rgba(200,150,80,1)");amberShade.addColorStop(0.3,"rgba(180,120,55,1)");amberShade.addColorStop(0.7,"rgba(150,90,35,1)");amberShade.addColorStop(1,"rgba(120,65,25,1)");
          gctx.fillStyle=amberShade;gctx.fillRect(0,edgeY-curveH,W,groundH+curveH);
          gctx.restore();
          } // end if gW>=4&&gHt>=4
        }
        ctx.drawImage(groundCache, 0, 0);

        // === EMBER/SPARK PARTICLE SYSTEM from ground-background.jsx ===
        if (!honourParticles) {
          const _createParticle = (pW, pH, seed, type) => {
            const s = seed;
            const p = {
              type,
              x: _bgHash(s) * pW, y: pH * 0.15 + _bgHash(s+1) * pH * 0.83,
              vx: 0.5 + _bgHash(s+2) * 1.2,
              vy: -(0.4 + _bgHash(s+3) * 1.0),
              rot: _bgHash(s+4) * Math.PI * 2,
              rotSpeed: (_bgHash(s+5) - 0.5) * 0.07,
              wobbleAmp: 0.5 + _bgHash(s+6) * 1.4,
              wobbleFreq: 0.7 + _bgHash(s+7) * 2.0,
              wobblePhase: _bgHash(s+8) * Math.PI * 2,
              wobbleAmp2: 0.3 + _bgHash(s+17) * 0.8,
              wobbleFreq2: 0.4 + _bgHash(s+18) * 1.3,
              wobblePhase2: _bgHash(s+19) * Math.PI * 2,
              life: 0,
              maxLife: 400 + _bgHash(s+9) * 600,
              baseSize: 0,
              intensity: 0.4 + _bgHash(s+10) * 0.6,
              hueShift: (_bgHash(s+11) - 0.5) * 25,
              shape: [],
              fragments: [],
              disintegrateAt: 0,
            };
            if (type === 0) {
              p.baseSize = 10 + _bgHash(s+12) * 20; p.vy *= 0.7; p.curl = (_bgHash(s+14) - 0.5) * 0.45;
              p.disintegrateAt = 0.45 + _bgHash(s+15) * 0.25;
              const fragCount = 4 + Math.floor(_bgHash(s+16) * 5);
              for (let f = 0; f < fragCount; f++) p.fragments.push({ offX: (_bgHash(s+f*7+40)-0.5) * p.baseSize * 0.7, offY: (_bgHash(s+f*7+41)-0.5) * p.baseSize * 0.5, vx: 0.2 + _bgHash(s+f*7+42) * 0.5, vy: -(0.1 + _bgHash(s+f*7+43) * 0.3), size: 2.5 + _bgHash(s+f*7+44) * 5, rot: _bgHash(s+f*7+45) * Math.PI * 2, delay: _bgHash(s+f*7+46) * 0.3, active: false, x: 0, y: 0 });
            } else if (type === 1) {
              p.baseSize = 10 + _bgHash(s+12) * 22; p.vx *= 1.1;
              p.disintegrateAt = 0.5 + _bgHash(s+15) * 0.25;
              const fragCount = 2 + Math.floor(_bgHash(s+16) * 3);
              for (let f = 0; f < fragCount; f++) p.fragments.push({ offX: (_bgHash(s+f*7+40)-0.5) * p.baseSize, offY: (_bgHash(s+f*7+41)-0.5) * p.baseSize * 0.5, vx: 0.15 + _bgHash(s+f*7+42) * 0.4, vy: -(0.05 + _bgHash(s+f*7+43) * 0.2), size: 1.5 + _bgHash(s+f*7+44) * 3.5, rot: _bgHash(s+f*7+45) * Math.PI * 2, delay: _bgHash(s+f*7+46) * 0.25, active: false, x: 0, y: 0 });
            } else if (type === 2) {
              p.baseSize = 5 + _bgHash(s+12) * 12; p.vx *= 1.5; p.vy *= 1.5;
              p.disintegrateAt = 0.6 + _bgHash(s+15) * 0.2;
            } else {
              const sizeRoll = _bgHash(s+12);
              p.baseSize = sizeRoll < 0.12 ? (14 + _bgHash(s+13) * 8) : sizeRoll < 0.35 ? (5 + _bgHash(s+13) * 7) : (2 + sizeRoll * 5);
              p.vx *= 1.6 + _bgHash(s+16) * 0.8; p.vy *= 1.5 + _bgHash(s+17) * 0.6; p.vx += _bgHash(s+15) * 0.8;
              p.disintegrateAt = 0.65 + _bgHash(s+15) * 0.2;
            }
            if (type === 0) {
              const verts = 5 + Math.floor(_bgHash(s+13) * 4);
              p.aspectW = 0.4 + _bgHash(s+60) * 0.4; p.aspectH = 0.25 + _bgHash(s+61) * 0.3;
              for (let v = 0; v < verts; v++) p.shape.push({ a: (Math.PI * 2 / verts) * v + (_bgHash(s + v * 3 + 20) - 0.5) * 0.5, rad: 0.45 + _bgHash(s + v * 3 + 21) * 0.55 });
            } else if (type <= 2) {
              const verts = 3 + Math.floor(_bgHash(s+13) * 3);
              p.aspectW = 0.35; p.aspectH = 0.2;
              for (let v = 0; v < verts; v++) p.shape.push({ a: (Math.PI*2/verts)*v + _bgHash(s+v*3+20)*0.5, rad: 0.4+_bgHash(s+v*3+21)*0.6 });
            } else {
              p.aspectW = 0.3; p.aspectH = 0.3;
              for (let v = 0; v < 3; v++) p.shape.push({ a: (Math.PI*2/3)*v + _bgHash(s+v*3+20)*0.4, rad: 0.5+_bgHash(s+v*3+21)*0.5 });
            }
            return p;
          };
          const _particles = [];
          for (let i2 = 0; i2 < 40; i2++) _particles.push(_createParticle(W, H, i2*97+13000, 1));
          for (let i2 = 0; i2 < 50; i2++) _particles.push(_createParticle(W, H, i2*79+15000, 2));
          for (let i2 = 0; i2 < 70; i2++) _particles.push(_createParticle(W, H, i2*67+17000, 3));
          for (let i2 = 0; i2 < 30; i2++) _particles.push(_createParticle(W, H, i2*53+19000, 3));
          for (const pp of _particles) {
            const stagger = Math.random() * pp.maxLife * 0.8;
            pp.life = stagger; pp.x += pp.vx * stagger; pp.y += pp.vy * stagger;
          }
          honourParticles = _particles;
        }
        // Update and render particles
        {
          const pTime = performance.now() * 0.001;
          const windGustX = Math.sin(pTime * 0.35) * 0.3 + Math.sin(pTime * 0.8 + 2) * 0.15 + Math.sin(pTime * 1.7 + 5) * 0.08;
          const windGustY = Math.sin(pTime * 0.45 + 1) * 0.12 + Math.sin(pTime * 1.1 + 3) * 0.06;
          for (const p of honourParticles) {
            p.life++;
            if (p.life > p.maxLife || p.x < -50 || p.x > W + 50 || p.y < -50) {
              const side = Math.random();
              if (side < 0.30) { p.x = Math.random() * W; p.y = H * 0.55 + Math.random() * H * 0.45; }
              else if (side < 0.40) { p.x = -15 - Math.random() * 30; p.y = H * 0.15 + Math.random() * H * 0.7; }
              else if (side < 0.50) { p.x = W + 15 + Math.random() * 30; p.y = H * 0.15 + Math.random() * H * 0.7; }
              else if (side < 0.60) { p.x = Math.random() * W; p.y = H * 0.8 + Math.random() * H * 0.2; }
              else if (side < 0.70) { p.x = Math.random() * W; p.y = H * 0.12 + Math.random() * H * 0.35; }
              else if (side < 0.90) { p.x = Math.random() * W * 0.45; p.y = Math.random() * H * 0.5; }
              else { p.x = W * 0.6 + Math.random() * W * 0.4; p.y = H * 0.05 + Math.random() * H * 0.45; }
              p.life = 0; p.maxLife = 400 + Math.random() * 600; p.rot = Math.random() * Math.PI * 2;
              for (const f of p.fragments) f.active = false;
              continue;
            }
            const depth = Math.max(0, Math.min(1, p.y / H));
            const depthScale = 0.55 + depth * 0.45;
            const depthAlpha = 0.6 + depth * 0.4;
            const wobbleX = Math.sin(p.life * 0.02 * p.wobbleFreq + p.wobblePhase) * p.wobbleAmp;
            const wobbleY2 = Math.sin(p.life * 0.015 * p.wobbleFreq2 + p.wobblePhase2) * p.wobbleAmp2;
            p.x += (p.vx + wobbleX * 0.4 + windGustX) * depthScale;
            p.y += (p.vy + wobbleY2 * 0.3 + windGustY) * depthScale;
            p.rot += (p.rotSpeed + windGustX * 0.015) * depthScale;
            const lifeT = p.life / p.maxLife;
            const fadeIn = Math.min(1, p.life / 25);
            const fadeOut = Math.min(1, (p.maxLife - p.life) / 40);
            const alpha = fadeIn * fadeOut * depthAlpha;
            if (alpha < 0.01) continue;
            const burnT = lifeT > p.disintegrateAt ? (lifeT - p.disintegrateAt) / (1 - p.disintegrateAt) : 0;
            // Shed fragments
            if (p.fragments.length > 0 && burnT > 0) {
              for (const f of p.fragments) {
                if (burnT > f.delay && !f.active) { f.active = true; f.x = p.x + f.offX; f.y = p.y + f.offY; }
                if (!f.active) continue;
                f.x += f.vx + windGustX * 0.9 + wobbleX * 0.12;
                f.y += f.vy - 0.08 + windGustY * 0.6;
                f.rot += 0.03 + windGustX * 0.01;
                const fragLife = Math.min(1, (burnT - f.delay) / Math.max(0.01, 1 - f.delay));
                const fragAlpha = Math.max(0, 1 - fragLife * 1.2) * alpha;
                const fragSize = f.size * Math.max(0.1, 1 - fragLife * 0.9) * depthScale;
                if (fragAlpha < 0.02 || fragSize < 0.15) continue;
                ctx.save(); ctx.translate(f.x, f.y); ctx.rotate(f.rot);
                ctx.globalCompositeOperation = "lighter";
                const pulse = 0.5 + Math.sin(p.life * 0.08 + f.delay * 12) * 0.5;
                const fragFlicker = 0.7 + Math.sin(p.life * 0.15 + f.delay * 20) * 0.3;
                const fR = Math.round((210 + p.hueShift) * p.intensity * pulse);
                const fG = Math.round((90 + p.hueShift * 0.3) * p.intensity * pulse);
                const fB = Math.round(20 * p.intensity * pulse);
                const glR2 = fragSize * (5 + pulse * 2);
                const gl = ctx.createRadialGradient(0,0,0,0,0,glR2);
                gl.addColorStop(0, "rgba("+Math.min(255,fR+30)+","+Math.min(255,fG+25)+","+Math.min(255,fB+15)+","+(fragAlpha*0.7*fragFlicker)+")");
                gl.addColorStop(0.25, "rgba("+fR+","+fG+","+fB+","+(fragAlpha*0.35*fragFlicker)+")");
                gl.addColorStop(0.6, "rgba("+Math.round(fR*0.6)+","+Math.round(fG*0.4)+",0,"+(fragAlpha*0.1)+")");
                gl.addColorStop(1, "rgba("+Math.round(fR*0.3)+",0,0,0)");
                ctx.fillStyle = gl; ctx.beginPath(); ctx.arc(0,0,glR2,0,Math.PI*2); ctx.fill();
                ctx.fillStyle = "rgba("+Math.min(255,fR+40)+","+Math.min(255,fG+20)+","+Math.min(255,fB+8)+","+(fragAlpha*0.8*fragFlicker)+")";
                ctx.beginPath(); ctx.arc(0,0,fragSize*0.6,0,Math.PI*2); ctx.fill();
                ctx.fillStyle = "rgba(255,240,180,"+(fragAlpha*0.6*fragFlicker)+")";
                ctx.beginPath(); ctx.arc(0,0,fragSize*0.2,0,Math.PI*2); ctx.fill();
                ctx.restore();
              }
            }
            ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.globalAlpha = alpha;
            if (p.type <= 2) {
              // Embers — round bokeh glowing dots
              ctx.globalCompositeOperation = "lighter";
              const pulse = 0.5 + Math.sin(p.life * 0.06 + p.wobblePhase) * 0.3 + Math.sin(p.life * 0.13) * 0.2;
              const flicker = 0.7 + Math.sin(p.life * 0.19 + p.wobblePhase * 3) * 0.15 + Math.sin(p.life * 0.31 + p.wobblePhase * 5) * 0.15;
              const dim = 1 - burnT * 0.7;
              const sz = p.baseSize * (1 - burnT * 0.4) * depthScale;
              const depthFocus = 0.6 + (p.y / H) * 0.4;
              const hotness = p.intensity * pulse * flicker;
              const coreR = Math.round(Math.min(255, 255 * hotness));
              const coreG = Math.round(Math.min(255, (235 + p.hueShift * 0.2) * hotness));
              const coreB = Math.round(Math.min(255, (160 + p.hueShift * 0.15) * hotness));
              const midR = Math.round(Math.min(255, (255 + p.hueShift * 0.5) * hotness));
              const midG = Math.round(Math.min(255, (140 + p.hueShift * 0.3) * hotness));
              const midB = Math.round(Math.min(80, 35 * hotness));
              const outerR = Math.round(Math.min(255, (200 + p.hueShift) * hotness * 0.7));
              const outerG = Math.round(Math.min(120, (55 + p.hueShift * 0.2) * hotness * 0.5));
              const outerB = Math.round(8 * hotness * 0.3);
              if (sz > 0.3) {
                const bokehR = sz * (3.0 + (1 - depthFocus) * 3.0) * dim;
                const bk2 = ctx.createRadialGradient(0, 0, 0, 0, 0, bokehR);
                bk2.addColorStop(0, "rgba("+outerR+","+outerG+","+outerB+","+(0.5 * pulse * dim)+")");
                bk2.addColorStop(0.35, "rgba("+outerR+","+outerG+","+outerB+","+(0.2 * pulse * dim)+")");
                bk2.addColorStop(0.7, "rgba("+Math.round(outerR*0.6)+","+Math.round(outerG*0.4)+","+outerB+","+(0.07 * pulse * dim)+")");
                bk2.addColorStop(1, "rgba("+Math.round(outerR*0.3)+","+Math.round(outerG*0.2)+",0,0)");
                ctx.fillStyle = bk2; ctx.beginPath(); ctx.arc(0, 0, bokehR, 0, Math.PI * 2); ctx.fill();
                const midGlowR = sz * 1.4 * dim;
                const mg = ctx.createRadialGradient(0, 0, 0, 0, 0, midGlowR);
                mg.addColorStop(0, "rgba("+midR+","+midG+","+midB+","+(0.7 * pulse * dim)+")");
                mg.addColorStop(0.5, "rgba("+midR+","+midG+","+midB+","+(0.3 * pulse * dim)+")");
                mg.addColorStop(1, "rgba("+outerR+","+outerG+",0,0)");
                ctx.fillStyle = mg; ctx.beginPath(); ctx.arc(0, 0, midGlowR, 0, Math.PI * 2); ctx.fill();
                const coreSize = sz * 0.4 * dim * depthFocus;
                const cg3 = ctx.createRadialGradient(0, 0, 0, 0, 0, coreSize);
                cg3.addColorStop(0, "rgba("+coreR+","+coreG+","+coreB+","+(0.9 * flicker * dim)+")");
                cg3.addColorStop(0.4, "rgba("+midR+","+midG+","+midB+","+(0.5 * flicker * dim)+")");
                cg3.addColorStop(1, "rgba("+midR+","+Math.round(midG*0.5)+",0,0)");
                ctx.fillStyle = cg3; ctx.beginPath(); ctx.arc(0, 0, coreSize, 0, Math.PI * 2); ctx.fill();
                const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
                if (speed > 0.6 && sz > 1) {
                  const trailLen = Math.min(sz * 3.5, speed * 4) * dim;
                  const dx = -p.vx / speed, dy = -p.vy / speed;
                  const tg = ctx.createLinearGradient(0, 0, dx * trailLen, dy * trailLen);
                  tg.addColorStop(0, "rgba("+midR+","+midG+","+midB+","+(0.45 * pulse * dim)+")");
                  tg.addColorStop(0.5, "rgba("+outerR+","+outerG+",0,"+(0.15 * pulse * dim)+")");
                  tg.addColorStop(1, "rgba("+outerR+",0,0,0)");
                  ctx.fillStyle = tg;
                  const tw = sz * 0.35 * dim;
                  ctx.beginPath(); ctx.moveTo(-dy * tw, dx * tw); ctx.lineTo(dy * tw, -dx * tw); ctx.lineTo(dx * trailLen, dy * trailLen); ctx.closePath(); ctx.fill();
                }
              }
            } else {
              // Sparks — bright bokeh dots with motion streaks
              ctx.globalCompositeOperation = "lighter";
              const pulse = 0.5 + Math.sin(p.life * 0.09 + p.wobblePhase) * 0.3 + Math.sin(p.life * 0.17 + p.wobblePhase * 3) * 0.2;
              const rapidFlicker = 0.7 + Math.sin(p.life * 0.37 + p.wobblePhase * 7) * 0.2 + Math.sin(p.life * 0.53) * 0.1;
              const dim = 1 - burnT * 0.8;
              const sz = p.baseSize * dim * depthScale;
              const temp = p.intensity * pulse * rapidFlicker;
              const cr = Math.round(Math.min(255, 255 * temp));
              const cg4 = Math.round(Math.min(255, (200 + p.hueShift * 0.4) * temp));
              const cb4 = Math.round(Math.min(140, (85 + p.hueShift * 0.2) * temp));
              const outerCr = Math.round(Math.min(255, (230 + p.hueShift) * temp * 0.7));
              const outerCg = Math.round(Math.min(120, (60 + p.hueShift * 0.2) * temp * 0.5));
              if (sz > 0.2) {
                const haloR = sz * (3.5 + (1 - p.y / H) * 2.5);
                const hg3 = ctx.createRadialGradient(0, 0, 0, 0, 0, haloR);
                hg3.addColorStop(0, "rgba("+outerCr+","+outerCg+",8,"+(0.4 * pulse * dim)+")");
                hg3.addColorStop(0.4, "rgba("+outerCr+","+Math.round(outerCg*0.5)+",0,"+(0.15 * pulse * dim)+")");
                hg3.addColorStop(0.75, "rgba("+Math.round(outerCr*0.4)+","+Math.round(outerCg*0.2)+",0,"+(0.04 * pulse * dim)+")");
                hg3.addColorStop(1, "rgba("+Math.round(outerCr*0.2)+",0,0,0)");
                ctx.fillStyle = hg3; ctx.beginPath(); ctx.arc(0, 0, haloR, 0, Math.PI * 2); ctx.fill();
                const coreR2 = sz * 0.5;
                const ccg = ctx.createRadialGradient(0, 0, 0, 0, 0, coreR2);
                ccg.addColorStop(0, "rgba("+cr+","+cg4+","+cb4+","+(0.85 * rapidFlicker * dim)+")");
                ccg.addColorStop(0.4, "rgba("+cr+","+Math.round(cg4*0.7)+","+Math.round(cb4*0.4)+","+(0.4 * rapidFlicker * dim)+")");
                ccg.addColorStop(1, "rgba("+outerCr+","+outerCg+",0,0)");
                ctx.fillStyle = ccg; ctx.beginPath(); ctx.arc(0, 0, coreR2, 0, Math.PI * 2); ctx.fill();
                const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
                if (speed > 0.4) {
                  const dx = -p.vx / speed, dy = -p.vy / speed;
                  const trailLen = Math.min(sz * 5, speed * 3.5) * dim;
                  const tw = sz * 0.25 * dim;
                  const sg4 = ctx.createLinearGradient(0, 0, dx * trailLen, dy * trailLen);
                  sg4.addColorStop(0, "rgba("+cr+","+cg4+","+cb4+","+(0.5 * pulse * dim)+")");
                  sg4.addColorStop(0.4, "rgba("+outerCr+","+outerCg+",0,"+(0.15 * pulse * dim)+")");
                  sg4.addColorStop(1, "rgba("+outerCr+",0,0,0)");
                  ctx.fillStyle = sg4;
                  ctx.beginPath(); ctx.moveTo(-dy * tw, dx * tw); ctx.lineTo(dy * tw, -dx * tw); ctx.lineTo(dx * trailLen, dy * trailLen); ctx.closePath(); ctx.fill();
                }
              }
            }
            ctx.globalAlpha = 1; ctx.restore();
          }
        }

        // --- SWORDS spread equally on 50m × 50m plane, 2m spacing ---
        const planeSize = 50;
        const baseSpacing = 1;
        const swords = [];
        let swordIdx = 0;

        // Walk the grid with per-sword spacing variation (0.5 to 2)
        for (let bz = 0; bz < planeSize; ) {
          // 4 density zones from camera (z=8) to far (z=50)
          const zoneT = Math.max(0, (bz - 7) / (planeSize - 7));
          let zoneDensity;
          if (zoneT < 0.125) zoneDensity = 0.2;       // zone 1a: z=7-12.4, tightest
          else {
            // z=12.4→0.75, z=20→0.75, z=30→0.75, z=40→0.95, z=50→1.20
            const zAbs = 7 + zoneT * (planeSize - 7);
            if (zAbs < 30) zoneDensity = 0.75;
            else if (zAbs < 40) zoneDensity = 0.75 + (zAbs - 30) / 10 * (0.95 - 0.75);
            else zoneDensity = 0.95 + (zAbs - 40) / 10 * (1.20 - 0.95);
          }
          const rowSpacingZ = (2.0 + ihash(swordIdx + 7000, sceneSeed) * 6.0) * zoneDensity;
          for (let bx = -planeSize / 2; bx < planeSize / 2; ) {
            const cellSpacingX = (2.0 + ihash(swordIdx + 8000, sceneSeed) * 6.0) * zoneDensity;
            const jx = bx + (ihash(swordIdx, sceneSeed + 101) - 0.5) * cellSpacingX * 0.3;
            const jz = bz + (ihash(swordIdx, sceneSeed + 100) - 0.5) * rowSpacingZ * 0.3 + 0.03;
            swordIdx++;
            bx += cellSpacingX;
            if (jz - camZ < 0.02) continue;  // skip swords too close
            // Halve swords in far zone (z > 25)
            if (jz > 25 && (swordIdx & 1)) continue;

            // Clearing — based on view angle, not absolute X
            const dz = jz - camZ;
            const pathEnd = 12;
            if (dz > 0.5 && dz < pathEnd) {
              const t = (dz - 0.5) / (pathEnd - 0.5);
              const viewAngle = Math.abs(jx) / dz;
              const innerA = 0.2 * (1 - t * t);   // angle threshold narrows with distance
              const fadeA = 0.08 * (1 - t * t);
              const jitter = (ihash(swordIdx, sceneSeed + 888) - 0.5) * 0.05;
              const effectiveA = viewAngle + jitter;
              if (effectiveA < innerA) continue;
              if (effectiveA < innerA + fadeA) {
                const grad = (effectiveA - innerA) / fadeA;
                if (ihash(swordIdx, sceneSeed + 999) > grad) continue;
              }
            }

            // Project to screen + ground curve
            const scrX = projX(jx, jz);
            const scrY = projY(jz, jx);
            if (scrX < -200 || scrX > W + 200 || scrY < -200 || scrY > H + 200) continue;

            const size = 2.8 * focal / (jz - camZ);

            // Curve lean — swords follow the ground curve outward at edges
            const curveLean = -2 * groundCurve * jx * 0.3;

            // Random lean + curve lean
            let lh = (swordIdx * 2654435761 + 4829) | 0; lh = Math.imul(lh ^ (lh >>> 16), 0x119de1f3); lh = Math.imul(lh ^ (lh >>> 13), 0x45d9f3b); lh = lh ^ (lh >>> 16);
            const lean = (((lh >>> 0) / 4294967296) * 2 - 1) * (Math.PI * 33.75 / 180) + curveLean;

            // Y-axis rotation — foreshortens width (cos of angle)
            const yAngle = rng(swordIdx, 606) * Math.PI;  // 0-180°
            const yRot = Math.cos(yAngle);

            swords.push({ scrX, scrY, size, lean, yRot, yAngle, wz: jz, wx: jx, shuffle: rng(swordIdx, 200), idx: swordIdx });
          }
          bz += rowSpacingZ;
        }

        // Sort back-to-front
        swords.sort((a, b) => b.wz - a.wz);

        for (const s of swords) {
          // Overall 114.7cm: blade 90.3, guard ~1, grip 18.4, pommel ~5
          const overall = s.size;
          const bladeH = overall * (90.3 / 114.7);
          const mod = bladeH / 8;
          const bladeW = mod * 0.434;                  // 4.9 cm (transform handles rotation)
          const guardH = bladeW / 3;
          const guardW = mod * 1.772;                  // ~20 cm
          const gripW = bladeW * 2 / 3;
          const gripH = overall * (18.4 / 114.7);
          const pomDia = overall * (5.0 / 114.7);
          const pomRx = pomDia / 2;  // transform handles rotation
          const pomRy = pomDia / 2;            // height stays constant

          ctx.save();
          // Flip sword so blade points down into ground, hilt sticks up
          const buried = bladeH * (0.55 + rng(s.idx, 777) * 0.1);
          ctx.beginPath();
          ctx.rect(0, 0, W, s.scrY);
          ctx.clip();
          ctx.translate(s.scrX, s.scrY - buried);
          ctx.scale(1, -1);
          ctx.rotate(-s.lean);
          // 3D Y-axis rotation — skew creates perspective effect
          ctx.transform(Math.abs(s.yRot), 0, Math.sin(s.yAngle) * 0.15, 1, 0, 0);

          // Metallic sword shading — sun proximity + direction
          const sdx2 = s.scrX - sunX, sdy2 = s.scrY - sunY;
          const sunDist2 = Math.sqrt(sdx2 * sdx2 + sdy2 * sdy2);
          const sunProx2 = Math.max(0, 1 - sunDist2 / (Math.max(W, H) * 0.7));
          const lit = sunProx2 * sunProx2;
          const leftLight = s.scrX > sunX;

          const tipEnd = -bladeH + pomDia * 2;
          const ov = 1;
          const gripBot = guardH + gripH;

          // Base dark fill color
          const bR = Math.round(18 + lit * 22), bG = Math.round(16 + lit * 14), bB = Math.round(18 + lit * 6);
          const baseFill = `rgb(${bR},${bG},${bB})`;

          // === Define full sword outline path (reusable) ===
          function swordPath() {
            ctx.beginPath();
            // Blade left edge
            ctx.moveTo(0, -bladeH);
            ctx.bezierCurveTo(-bladeW * 0.25, -bladeH + pomDia * 0.5,
                              -bladeW * 0.5, tipEnd - pomDia,
                              -bladeW / 2, tipEnd);
            ctx.lineTo(-bladeW / 2, ov);
            // Guard left
            ctx.lineTo(-guardW / 2, 0);
            ctx.lineTo(-guardW / 2, guardH);
            // Grip left
            ctx.lineTo(-gripW / 2, guardH);
            ctx.lineTo(-gripW / 2, gripBot);
            // Pommel
            ctx.arc(0, gripBot + pomRy, pomRy, Math.PI, 0);
            // Grip right
            ctx.lineTo(gripW / 2, gripBot);
            ctx.lineTo(gripW / 2, guardH);
            // Guard right
            ctx.lineTo(guardW / 2, guardH);
            ctx.lineTo(guardW / 2, 0);
            // Blade right edge
            ctx.lineTo(bladeW / 2, ov);
            ctx.lineTo(bladeW / 2, tipEnd);
            ctx.bezierCurveTo(bladeW * 0.5, tipEnd - pomDia,
                              bladeW * 0.25, -bladeH + pomDia * 0.5,
                              0, -bladeH);
            ctx.closePath();
          }

          // 1. Fill entire sword dark
          swordPath();
          ctx.fillStyle = baseFill;
          ctx.fill();

          // 2. Clip to sword shape, then paint lighting
          ctx.save();
          swordPath();
          ctx.clip();

          // 3. Highlight from sun side — wide gradient across whole sword
          const sunSide = leftLight ? -1 : 1;
          const hlGrad = ctx.createLinearGradient(sunSide * guardW * 0.6, 0, -sunSide * guardW * 0.3, 0);
          hlGrad.addColorStop(0, 'rgba(' + Math.min(255, 140 + lit * 115) + ',' + Math.min(255, 110 + lit * 80) + ',' + Math.round(60 + lit * 30) + ',' + (0.5 + lit * 0.35) + ')');
          hlGrad.addColorStop(0.35, 'rgba(' + Math.round(80 + lit * 70) + ',' + Math.round(65 + lit * 45) + ',' + Math.round(45 + lit * 15) + ',' + (0.25 + lit * 0.15) + ')');
          hlGrad.addColorStop(0.7, 'rgba(0,0,0,0)');
          ctx.fillStyle = hlGrad;
          ctx.fillRect(-guardW, -bladeH - pomDia, guardW * 2, bladeH + gripH + pomDia * 4);

          // 4. Reflected light from shadow side — warm amber, softer
          const refGrad = ctx.createLinearGradient(-sunSide * guardW * 0.5, 0, sunSide * guardW * 0.2, 0);
          refGrad.addColorStop(0, 'rgba(200,100,25,' + (0.3 + lit * 0.25) + ')');
          refGrad.addColorStop(0.25, 'rgba(160,70,15,' + (0.15 + lit * 0.1) + ')');
          refGrad.addColorStop(0.5, 'rgba(0,0,0,0)');
          ctx.fillStyle = refGrad;
          ctx.fillRect(-guardW, -bladeH - pomDia, guardW * 2, bladeH + gripH + pomDia * 4);

          ctx.restore(); // unclip

          ctx.restore();
        }

        // Full-scene dramatic vignette
        ctx.save();
        const scVig = ctx.createRadialGradient(W*0.5, H*0.3, H*0.1, W*0.5, H*0.5, Math.max(W,H)*0.8);
        scVig.addColorStop(0, "rgba(0,0,0,0)");
        scVig.addColorStop(0.35, "rgba(0,0,0,0)");
        scVig.addColorStop(0.6, "rgba(3,1,0,0.2)");
        scVig.addColorStop(0.8, "rgba(5,2,1,0.45)");
        scVig.addColorStop(1, "rgba(5,2,1,0.7)");
        ctx.fillStyle = scVig;
        ctx.fillRect(0, 0, W, H);
        ctx.restore();
      } // end BATTLEGROUND block
      ctx.restore();
    };

    animId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', init);
    };
  }, [oledMode, animationsEnabled, bgResolution, bgFps]);

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none" style={{zIndex: 1, willChange: 'transform'}} aria-hidden="true" role="presentation" />;
});
Honour.displayName = 'Honour';

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
const CollectionGridCard = memo(({ name, count, imgUrl, framing, isSelected, owned, collMask, collOpacity, glowClass, ownedBg, ownedBorder, countLabel, countColor, onClickCard, framingMode, setEditingImage, imageKey, isNew, isProfilePic, onSetProfilePic }) => {
  const cardStateClass = isSelected
    ? 'border-emerald-500 ring-2 ring-emerald-500/50'
    : isProfilePic
      ? ownedBg
      : owned
        ? `${ownedBg} ${ownedBorder} ${glowClass}`
        : 'bg-neutral-800/50 border-neutral-700/50';
  const cardClassName = `relative overflow-hidden border rounded-lg text-center ${!framingMode ? 'collection-card' : ''} cursor-pointer ${cardStateClass}`;
  return (
  <div
    className={cardClassName}
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
  );
}, (prev, next) =>
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
  BackgroundGlow, TriangleMirrorWave, ResonanceField, Honour,
  BannerCard, EventCard, ProbabilityBar,
  ADMIN_BANNER_KEY, ADMIN_HASH,
  VisualSliderGroup, VISUAL_SLIDER_CONFIGS,
  KuroSelect, CollectionGridSection, PityCounterInput, CalcResultsCard,
  StandardBannerSection, ImportGuide,
  getActiveBanners,
  hideOnError,
};
