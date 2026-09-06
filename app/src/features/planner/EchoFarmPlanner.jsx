// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — features/planner/EchoFarmPlanner.jsx
// Echo Farming Calculator — Planner tab. Pick a specific target Echo (not just a
// Sonata Set — some Echoes carry two sets at once, which a set-only picker can't
// represent), main/secondary stat, 5 substat slots with a minimum plateau each, its
// rarity/level, and whether you're farming it via Tacet Field (4-cost Echoes never
// drop from Tacet Fields — bosses only; 1/3-cost drop from both, so that toggle is
// only disabled for cost 4, never forced either way otherwise). See the real
// probability of each condition and the combined odds, plus the estimated Waveplate/
// Shell Credit/Tuner/leveling cost to get there. Every number traces to
// Data dump/Echoes/ (see echoFarmingData.js).
//
// Structure (2026-09-06 revision): every stat-picking row (Main/Secondary/5x Substat)
// used to dump its full option list inline — with the 13-entry substat pool repeated
// 5 times that was an unreadable wall of buttons. Each row is now a single compact
// summary button (icon strip + chance) that opens one shared StatPickerModal, the same
// "Kuro panel" pattern (FocusTrapModal + kuro-card) already used by EchoSelector/
// WeaponSelector/TeamSelector's own pickers — one picker component, seven call sites.
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useState } from 'react';
import { ChevronDown, Zap, Coins, Wrench, Info, X, ChevronRight, Search, Heart } from 'lucide-react';
import { Card, CardHeader, CardBody } from '../../shared/components/Card.jsx';
import { FocusTrapModal } from '../../shared/components/FocusTrapModal.jsx';
import { hideOnError } from '../../shared/utils/imageHelpers.js';
import { usePersistedState } from '../../hooks/usePersistedState.js';
import { ECHO_DATA, ALL_4COST_ECHOES, ALL_3COST_ECHOES, ALL_1COST_ECHOES } from '../../data/echoes.js';
import { getSetIcon, getElementIcon, getStatIcon, getCombatRoleIcon } from '../../shared/utils/elementVisuals.js';
import {
  ECHO_MAIN_STAT_CHANCE, ALL_ECHO_SUBSTATS, ECHO_SUBSTAT_POOL_SIZE_AT_SLOT,
  PLATEAU_TIERS, getPlateauChance, TACET_FIELD_WAVEPLATE_COST, TACET_FIELD_ENDGAME_YIELD,
  ECHO_LEVEL_CUMULATIVE_EXP, ECHO_MAX_LEVEL_BY_RARITY, SHELL_CREDIT_PER_ECHO_EXP, SHELL_CREDIT_PER_TUNE_ATTEMPT,
  DATA_BANK_LEVELS, MAX_DATA_BANK_LEVEL,
} from '../../data/echoFarmingData.js';
import { t, getPluralForm } from '../../utils/i18n.js';

// ECHO_LISTS (echoes.js) are declared newest-first per cost tier already — reused as-is here
// so the Target Echo picker sorts the same way every other "All Sets"/echo-list filter in the
// app does, without re-deriving a separate order.
const ECHO_LIST_BY_COST = { 4: ALL_4COST_ECHOES, 3: ALL_3COST_ECHOES, 1: ALL_1COST_ECHOES };
const COST_TIERS = [1, 3, 4];
// 4-cost (Overlord/Calamity) Echoes only ever drop from boss fights, never Tacet Fields;
// 1/3-cost (Common/Elite) are Tacet Field only. See Data dump/Echoes/Data Bank.md.
const DEFAULT_RANK_BY_COST = { 1: 'Common', 3: 'Elite', 4: 'Overlord' };
// Same rank-badge color convention as MonsterCard.jsx (not exported from there, so mirrored here).
const RANK_BADGE_CLASS = { Calamity: 'kuro-badge-red', Overlord: 'kuro-badge-amber', Elite: 'kuro-badge-emerald', Common: '' };

// Maps the 4 "X DMG" substat names to their real official Combat Role icon — these aren't
// covered by STAT_ICONS (which only has ATK/HP/DEF/Energy Regen/Crit Rate/Crit DMG) or the
// element-icon regex below (they're not "<Element> DMG", they're "<Action> DMG").
const SUBSTAT_ROLE_ICON_NAME = {
  'Basic ATK DMG': 'Basic Attack Damage',
  'Heavy ATK DMG': 'Heavy Attack Damage',
  'Resonance Skill DMG': 'Resonance Skill Damage',
  'Resonance Liberation DMG': 'Resonance Liberation Damage',
};

// Renders a stat's icon — element icon for "<Element> DMG" main-stat entries, the official
// Combat Role icon for the 4 "X ATK/Skill/Liberation DMG" substats, the shared STAT_ICONS
// lookup (already strips a trailing %) for everything else. Healing Bonus has no official
// icon anywhere in this app (same gap TeamSelector's own buff filter already has), so it
// keeps the same lucide Heart fallback that filter already established as this app's
// precedent — never null when a reasonable fallback already exists elsewhere in the app.
function StatIcon({ stat, size = 14 }) {
  if (stat === 'Healing Bonus') return <Heart size={size} className="shrink-0 text-pink-400" />;
  const roleSrc = SUBSTAT_ROLE_ICON_NAME[stat] ? getCombatRoleIcon(SUBSTAT_ROLE_ICON_NAME[stat]) : null;
  if (roleSrc) return <img src={roleSrc} alt="" width={size} height={size} className="shrink-0" onError={hideOnError} />;
  const elMatch = stat?.match(/^(\w+) DMG$/);
  const src = elMatch ? getElementIcon(elMatch[1]) : getStatIcon(stat);
  if (!src) return null;
  return <img src={src} alt="" width={size} height={size} className="shrink-0" onError={hideOnError} />;
}

// Max Echo level is 25, not 90 — that's a character level — and depends on rarity (2★→10,
// 3★→15, 4★→20, 5★→25, per Data Bank.md). Each of the 5 substat slots unlocks one at a time,
// every 5 levels (5/10/15/20/25), a real verified mechanic (Echo Leveling.md). Below the
// slot's unlock level it can't be rolled yet, so its row is disabled rather than counted
// toward the combined odds.
const substatUnlockLevel = (slotIdx) => (slotIdx + 1) * 5;
const RARITIES = [2, 3, 4, 5];

const DEFAULT_STATE = {
  cost: 4,
  echoName: '',
  rarity: 5,
  level: 25,
  dataBankLevel: MAX_DATA_BANK_LEVEL,
  mainStats: [],
  secondaryStats: [],
  substats: [0, 1, 2, 3, 4].map(() => ({ stats: [], minTier: 0 })),
  tacetField: false, // disabled/false-forced only when cost === 4
};

export default function EchoFarmPlanner() {
  const [collapsed, setCollapsed] = usePersistedState('ww-echo-farm-collapsed', false);
  const [cfg, setCfg] = usePersistedState('ww-echo-farm-config-v2', DEFAULT_STATE);
  // Which popup is open: null, 'echo', 'main', 'secondary', or a substat slot index.
  const [openPicker, setOpenPicker] = useState(null);
  const [echoSearch, setEchoSearch] = useState('');

  const mainStatPool = ECHO_MAIN_STAT_CHANCE[cfg.cost] || {};
  const mainStatOptions = Object.keys(mainStatPool);
  // Secondary Stat draws from the same defined per-cost pool as Main Stat (Data dump/Echoes/
  // Probability.md's "Mainstats" table doesn't distinguish a separate primary-only vs.
  // secondary-only pool — both slots pick from the same per-cost stat list). No exclusion here:
  // there's no sourced rule that a specific Echo's two main stats can't repeat a category.
  const secondaryStatOptions = mainStatOptions;

  const echoData = cfg.echoName ? ECHO_DATA[cfg.echoName] : null;
  const echoSets = echoData?.sets || [];

  // 4-cost (Overlord/Calamity) Echoes never drop from Tacet Fields (bosses only) — that's the
  // one sourced constraint (Data dump/Echoes/Data Bank.md). 1/3-cost Echoes drop from BOTH
  // Tacet Fields and bosses, so the toggle is never forced one way or the other for them.
  const setCost = (cost) => setCfg(p => ({
    ...p, cost, echoName: '', mainStats: [], secondaryStats: [],
    tacetField: cost === 4 ? false : p.tacetField,
  }));

  const maxLevel = ECHO_MAX_LEVEL_BY_RARITY[cfg.rarity];
  const setRarity = (rarity) => setCfg(p => ({ ...p, rarity, level: Math.min(p.level, ECHO_MAX_LEVEL_BY_RARITY[rarity]) }));

  const toggleStat = (list, stat) => list.includes(stat) ? list.filter(s => s !== stat) : [...list, stat];

  // ── Row-level probabilities ──
  const rowChance = (selected) => selected.reduce((s, stat) => s + (mainStatPool[stat] || 0), 0) / 100;
  const mainChance = cfg.mainStats.length ? rowChance(cfg.mainStats) : 1;
  const secondaryChance = cfg.secondaryStats.length ? rowChance(cfg.secondaryStats) : 1;

  const isSubstatUnlocked = (slotIdx) => cfg.level >= substatUnlockLevel(slotIdx);

  const substatRowChance = (slotIdx, slot) => {
    if (!isSubstatUnlocked(slotIdx) || !slot.stats.length) return 1;
    const poolSize = ECHO_SUBSTAT_POOL_SIZE_AT_SLOT[slotIdx];
    const pickChance = slot.stats.length / poolSize;
    const avgPlateau = slot.stats.reduce((s, stat) => s + getPlateauChance(stat, slot.minTier) / 100, 0) / slot.stats.length;
    return pickChance * avgPlateau;
  };
  const substatChances = cfg.substats.map((slot, i) => substatRowChance(i, slot));

  // Rarity chance — real Data Bank Level input, not assumed. Rarity split swings hard by level
  // (e.g. 4★ peaks at 80% around level 19-20, then falls to 0% at endgame once the pool becomes
  // 100% 5★), so this is a required, user-set factor, not a constant. 0% means the chosen
  // rarity simply isn't obtainable at this level at all (still in the pool, or aged out of it).
  const dbLevelRow = DATA_BANK_LEVELS.find(row => row.level === cfg.dataBankLevel) || DATA_BANK_LEVELS[DATA_BANK_LEVELS.length - 1];
  const rarityChance = (dbLevelRow.rarity[cfg.rarity] || 0) / 100;

  const unifiedChance = [mainChance, secondaryChance, rarityChance, ...substatChances].reduce((a, b) => a * b, 1);
  const expectedInstances = unifiedChance > 0 ? Math.ceil(1 / unifiedChance) : null;

  // ── Resource estimates ──
  // Waveplate only applies via Tacet Field (cost 4 never uses it — bosses cost no Waveplate at
  // all, and this calculator doesn't model a specific boss's other resource costs since Drop
  // Rates.md's boss tables aren't broken down by target Echo/set either). TACET_FIELD_ENDGAME_
  // YIELD's avgEchoesPerRun is already "echoes of any rarity" — rarityChance above narrows the
  // unifiedChance to the target rarity specifically, so this doesn't double-count it.
  const runsNeeded = cfg.tacetField && expectedInstances != null ? Math.ceil(expectedInstances / TACET_FIELD_ENDGAME_YIELD.avgEchoesPerRun) : null;
  const waveplateNeeded = runsNeeded != null ? runsNeeded * TACET_FIELD_WAVEPLATE_COST : 0;
  const dropShellNeeded = runsNeeded != null ? runsNeeded * TACET_FIELD_ENDGAME_YIELD.avgShellCreditPerRun : 0;
  const tunersPerSlot = cfg.substats.map((slot, i) => {
    if (!isSubstatUnlocked(i) || !slot.stats.length) return 0;
    const avgChance = slot.stats.reduce((s, stat) => s + getPlateauChance(stat, slot.minTier) / 100, 0) / slot.stats.length;
    return avgChance > 0 ? Math.ceil(1 / avgChance) : 0;
  });
  const totalTuners = tunersPerSlot.reduce((a, b) => a + b, 0);
  const tuneShellCost = totalTuners * SHELL_CREDIT_PER_TUNE_ATTEMPT;

  // ── Leveling cost — cumulative EXP to reach the chosen level from 0, at this rarity, and
  // its Shell Credit equivalent (Echo Leveling.md's own disclosed 0.1 Shell/EXP rate). ──
  const levelingExp = ECHO_LEVEL_CUMULATIVE_EXP[cfg.rarity]?.[cfg.level] ?? 0;
  const levelingShell = Math.round(levelingExp * SHELL_CREDIT_PER_ECHO_EXP);

  const totalShellNeeded = dropShellNeeded + tuneShellCost + levelingShell;

  const rowLabel = (chance) => `${(chance * 100).toFixed(chance * 100 < 1 ? 2 : 1)}%`;

  const updateMain = (stat) => setCfg(p => ({ ...p, mainStats: toggleStat(p.mainStats, stat) }));
  const updateSecondary = (stat) => setCfg(p => ({ ...p, secondaryStats: toggleStat(p.secondaryStats, stat) }));
  const updateSubstat = (slotIdx, stat) => setCfg(p => ({
    ...p, substats: p.substats.map((s, j) => j === slotIdx ? { ...s, stats: toggleStat(s.stats, stat) } : s),
  }));
  const setSubstatTier = (slotIdx, tierIdx) => setCfg(p => ({
    ...p, substats: p.substats.map((s, j) => j === slotIdx ? { ...s, minTier: tierIdx } : s),
  }));

  return (
    <Card>
      <div className="cursor-pointer" role="button" tabIndex={0} onClick={() => setCollapsed(p => !p)} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setCollapsed(p => !p); } }} aria-expanded={!collapsed}>
        <CardHeader action={<ChevronDown size={14} className={`text-gray-400 transition-transform duration-200 ${collapsed ? '' : 'rotate-180'}`} />}>
          {t('planner.echoFarm.title')}
        </CardHeader>
      </div>
      {!collapsed && (
        <CardBody className="space-y-3">
          <div className="flex items-start gap-1.5 p-2 rounded-lg text-2xs text-gray-400" style={{ background: 'var(--bg-stat)', border: '1px solid var(--border-hover)' }}>
            <Info size={12} className="shrink-0 mt-0.5 text-cyan-400" />
            <span>{t('planner.echoFarm.disclaimer')}</span>
          </div>

          {/* Cost tier */}
          <div className="flex gap-1.5">
            {COST_TIERS.map(cost => (
              <button key={cost} onClick={() => setCost(cost)}
                className={`kuro-btn flex-1 text-sm ${cfg.cost === cost ? 'active-gold' : ''}`} style={{ padding: '8px' }}>
                {cost}-{t('planner.echoFarm.cost')}
              </button>
            ))}
          </div>

          {/* Rarity — independent of cost (the wiki explicitly notes they don't correlate);
              determines the Echo's own max level per Data Bank.md. */}
          <div className="flex gap-1.5">
            {RARITIES.map(r => (
              <button key={r} onClick={() => setRarity(r)}
                className={`kuro-btn flex-1 text-sm ${cfg.rarity === r ? 'active-gold' : ''}`} style={{ padding: '8px' }}>
                {'★'.repeat(r)}
              </button>
            ))}
          </div>

          {/* Data Bank Level — a real input, never assumed: the rarity split changes drastically
              by level (Data dump/Echoes/Data Bank.md), so the chance of a given rarity dropping
              at all depends entirely on this. rarityChance below shows exactly what the chosen
              Rarity+Level combo yields, including 0% when that rarity has aged out of the pool
              (e.g. targeting 2★-4★ at endgame level, where the pool is 100% 5★). */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="kuro-section-label">{t('planner.echoFarm.dataBankLevel')}</span>
              <span className="text-sm font-bold text-white kuro-number">{cfg.dataBankLevel}</span>
            </div>
            <input type="range" min={0} max={MAX_DATA_BANK_LEVEL} step={1} value={cfg.dataBankLevel}
              onChange={e => setCfg(p => ({ ...p, dataBankLevel: Number(e.target.value) }))}
              className="w-full accent-yellow-500" aria-label={t('planner.echoFarm.dataBankLevel')} />
            <div className="flex items-center justify-between text-2xs">
              <span className="text-gray-500">{t('planner.echoFarm.rarityChanceAtLevel', { rarity: cfg.rarity })}</span>
              <span className={rarityChance > 0 ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}>{(rarityChance * 100).toFixed(0)}%</span>
            </div>
            {rarityChance === 0 && <div className="text-2xs text-red-400">{t('planner.echoFarm.rarityNotObtainable')}</div>}
          </div>

          {/* Target Echo — real portrait, rank, and its actual Sonata Set(s), derived rather
              than freely chosen, so a dual-set Echo is represented correctly instead of forcing
              a single-set guess. */}
          <button onClick={() => setOpenPicker('echo')} className="kuro-btn w-full text-left flex items-center gap-2" style={{ padding: '8px 10px' }}>
            {echoData ? (
              <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 border border-yellow-500/30 bg-yellow-500/8">
                <img src={echoData.iconUrl || echoData.monsterIconUrl} alt={cfg.echoName} className="w-full h-full object-cover" onError={hideOnError} />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-lg flex-shrink-0 border border-[var(--border-medium)] bg-white/5" />
            )}
            <div className="min-w-0 flex-1">
              <div className="text-sm text-white font-medium truncate">{cfg.echoName || t('planner.echoFarm.chooseEcho')}</div>
              {echoSets.length > 0 && (
                <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                  {echoSets.map(setName => (
                    <span key={setName} className="inline-flex items-center gap-1 text-2xs text-gray-400">
                      {getSetIcon(setName) && <img src={getSetIcon(setName)} alt="" width={12} height={12} className="shrink-0" onError={hideOnError} />} {setName}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <ChevronRight size={14} className="text-gray-500 shrink-0" />
          </button>

          {/* Echo level — real max is 25, not 90 (that's a character level), and depends on the
              chosen rarity above. Each substat slot unlocks one at a time every 5 levels; ticks
              mark those unlock points. Also drives the Leveling Cost tile below, sourced from
              Data dump/Echoes/Echo Leveling.md's cumulative EXP table. */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="kuro-section-label">{t('planner.echoFarm.echoLevel')}</span>
              <span className="text-sm font-bold text-white kuro-number">Lv. {cfg.level} / {maxLevel}</span>
            </div>
            <input type="range" min={0} max={maxLevel} step={1} value={cfg.level}
              onChange={e => setCfg(p => ({ ...p, level: Number(e.target.value) }))}
              className="w-full accent-yellow-500" aria-label={t('planner.echoFarm.echoLevel')} />
            <div className="flex justify-between text-2xs text-gray-500 px-0.5">
              {[5, 10, 15, 20, 25].filter(lvl => lvl <= maxLevel).map(lvl => <span key={lvl}>{lvl}</span>)}
            </div>
          </div>

          {/* Stat rows — compact summaries, each opens the shared picker popup */}
          <div className="space-y-1.5">
            <StatSummaryRow
              title={t('planner.echoFarm.mainStat')}
              selected={cfg.mainStats}
              chance={mainChance}
              rowLabel={rowLabel}
              onClick={() => setOpenPicker('main')}
            />
            <StatSummaryRow
              title={t('planner.echoFarm.secondaryStat')}
              selected={cfg.secondaryStats}
              chance={secondaryChance}
              rowLabel={rowLabel}
              note={t('planner.echoFarm.secondaryApprox')}
              onClick={() => setOpenPicker('secondary')}
            />
            {cfg.substats.map((slot, i) => {
              const unlocked = isSubstatUnlocked(i);
              return (
                <StatSummaryRow
                  key={i}
                  title={t('planner.echoFarm.substatSlot', { n: i + 1 })}
                  selected={slot.stats}
                  chance={substatChances[i]}
                  rowLabel={rowLabel}
                  tierLabel={unlocked && slot.stats.length ? t(`planner.echoFarm.plateau${PLATEAU_TIERS[slot.minTier]}`) : null}
                  note={!unlocked
                    ? (substatUnlockLevel(i) > maxLevel
                      ? t('planner.echoFarm.impossibleAtRarity', { level: substatUnlockLevel(i) })
                      : t('planner.echoFarm.locksUntil', { level: substatUnlockLevel(i) }))
                    : undefined}
                  disabled={!unlocked}
                  onClick={() => unlocked && setOpenPicker(i)}
                />
              );
            })}
          </div>

          {/* Farming via Tacet Field — the only sourced constraint is that 4-cost Echoes never
              drop from Tacet Fields (bosses only, no Waveplate cost either way), so the toggle
              is disabled (and forced off) only for cost 4; 1/3-cost Echoes drop from both Tacet
              Fields and bosses, so it's freely toggleable there, not forced to either state. */}
          <button onClick={() => cfg.cost !== 4 && setCfg(p => ({ ...p, tacetField: !p.tacetField }))} disabled={cfg.cost === 4}
            className={`kuro-btn w-full text-sm ${cfg.tacetField ? 'active-emerald' : ''} ${cfg.cost === 4 ? 'opacity-40 cursor-not-allowed' : ''}`} style={{ padding: '8px' }}>
            {cfg.tacetField ? '✓ ' : ''}{t('planner.echoFarm.tacetFieldToggle')}
          </button>
          {cfg.cost === 4 && <div className="text-2xs text-gray-500">{t('planner.echoFarm.cost4NoTacet')}</div>}

          {/* Unified statistics */}
          <div className="p-3 rounded-lg space-y-2" style={{ background: 'var(--bg-stat)', border: '1px solid var(--border-hover)' }}>
            <div className="kuro-section-label">{t('planner.echoFarm.unifiedStats')}</div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">{t('planner.echoFarm.overallChance')}</span>
              <span className="text-base font-bold text-emerald-400 kuro-number">
                {rowLabel(unifiedChance)}
                {expectedInstances != null && <span className="text-gray-400 font-normal"> ({t(`planner.echoFarm.echoesCount.${getPluralForm(expectedInstances)}`, { count: expectedInstances })})</span>}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-1.5 pt-1">
              <ResourceTile icon={<Zap size={14} className="text-cyan-400" />} label={t('planner.echoFarm.waveplate')} value={cfg.tacetField ? waveplateNeeded : t('planner.echoFarm.notApplicable')} color="text-cyan-400" />
              <ResourceTile icon={<Coins size={14} className="text-yellow-400" />} label={t('planner.shellCredit')} value={totalShellNeeded} color="text-yellow-400" />
              <ResourceTile icon={<Wrench size={14} className="text-orange-400" />} label={t('planner.echoFarm.tuners')} value={totalTuners} color="text-orange-400" />
            </div>
            <div className="text-2xs text-gray-500 space-y-0.5">
              {!cfg.tacetField && <div>{t('planner.echoFarm.noTacetNote')}</div>}
              <div>{t('planner.echoFarm.levelingCostNote', { exp: levelingExp.toLocaleString(), shell: levelingShell.toLocaleString() })}</div>
            </div>
          </div>
        </CardBody>
      )}

      {/* ── Target Echo picker popup ── */}
      {openPicker === 'echo' && (
        <FocusTrapModal isOpen onClose={() => setOpenPicker(null)} className="" onClick={() => setOpenPicker(null)} centered padding="p-3" ariaLabel={t('planner.echoFarm.chooseEcho')}>
          <div className="kuro-card w-full max-w-md max-h-[80vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-medium)]">
              <h3 className="text-white text-xl font-semibold">{t('planner.echoFarm.chooseEcho')}</h3>
              <button onClick={() => setOpenPicker(null)} className="p-3 min-w-[48px] min-h-[48px] flex items-center justify-center rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-all" aria-label={t('planner.closeLabel')}><X size={16} /></button>
            </div>
            <div className="p-3 border-b border-[var(--border-subtle)]">
              <div className="relative">
                <input type="text" value={echoSearch} onChange={e => setEchoSearch(e.target.value)} placeholder={t('planner.echoFarm.searchEchoes')} className="kuro-input w-full pl-8 text-base" autoFocus />
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
              {(ECHO_LIST_BY_COST[cfg.cost] || [])
                .filter(name => !echoSearch || name.toLowerCase().includes(echoSearch.toLowerCase()))
                .map(name => {
                  const ed = ECHO_DATA[name];
                  if (!ed) return null;
                  const rank = ed.rank || DEFAULT_RANK_BY_COST[cfg.cost];
                  const selected = cfg.echoName === name;
                  return (
                    <button key={name} onClick={() => { setCfg(p => ({ ...p, echoName: name })); setOpenPicker(null); setEchoSearch(''); }}
                      className={`kuro-card text-left w-full flex items-center gap-2 p-2 transition-all hover:scale-[1.01] ${selected ? 'border-2 border-yellow-400/60 bg-yellow-500/10' : ''}`}>
                      <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 border border-red-500/30 bg-red-500/8">
                        <img src={ed.iconUrl || ed.monsterIconUrl} alt="" className="w-full h-full object-cover" onError={hideOnError} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm text-white font-medium truncate">{name}</div>
                        <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                          {(ed.sets || []).map(setName => (
                            <span key={setName} className="inline-flex items-center gap-1 text-2xs text-gray-400">
                              {getSetIcon(setName) && <img src={getSetIcon(setName)} alt="" width={12} height={12} className="shrink-0" onError={hideOnError} />} {setName}
                            </span>
                          ))}
                        </div>
                      </div>
                      {rank && <span className={`kuro-badge ${RANK_BADGE_CLASS[rank] || ''} shrink-0 text-2xs`}>{rank}</span>}
                    </button>
                  );
                })}
            </div>
          </div>
        </FocusTrapModal>
      )}

      {/* ── Shared picker popup — Main/Secondary Stat or one Substat slot ── */}
      {(openPicker === 'main' || openPicker === 'secondary' || typeof openPicker === 'number') && (
        <StatPickerModal
          title={
            openPicker === 'main' ? t('planner.echoFarm.mainStat')
            : openPicker === 'secondary' ? t('planner.echoFarm.secondaryStat')
            : t('planner.echoFarm.substatSlot', { n: openPicker + 1 })
          }
          options={openPicker === 'main' ? mainStatOptions : openPicker === 'secondary' ? secondaryStatOptions : ALL_ECHO_SUBSTATS}
          pool={openPicker === 'main' || openPicker === 'secondary' ? mainStatPool : null}
          selected={
            openPicker === 'main' ? cfg.mainStats
            : openPicker === 'secondary' ? cfg.secondaryStats
            : cfg.substats[openPicker].stats
          }
          onToggle={
            openPicker === 'main' ? updateMain
            : openPicker === 'secondary' ? updateSecondary
            : (stat) => updateSubstat(openPicker, stat)
          }
          tierValue={typeof openPicker === 'number' ? cfg.substats[openPicker].minTier : null}
          onSetTier={typeof openPicker === 'number' ? (tierIdx) => setSubstatTier(openPicker, tierIdx) : null}
          onClose={() => setOpenPicker(null)}
        />
      )}
    </Card>
  );
}

// Compact summary — icon strip of what's selected (or "Any"), the row's own chance, and (for
// substat slots) the chosen plateau tier. Tapping anywhere opens the shared picker popup.
function StatSummaryRow({ title, selected, chance, rowLabel, tierLabel, note, onClick, disabled }) {
  return (
    <button onClick={onClick} disabled={disabled} className={`kuro-btn w-full text-left flex items-center justify-between gap-2 ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`} style={{ padding: '8px 10px' }}>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className="text-sm text-white font-medium">{title}</span>
          {tierLabel && <span className="kuro-badge kuro-badge-gray text-2xs">{tierLabel}</span>}
        </div>
        <div className="flex items-center gap-1 mt-0.5 flex-wrap">
          {disabled || selected.length === 0 ? (
            <span className="text-2xs text-gray-500">{note || t('planner.echoFarm.anyStat')}</span>
          ) : selected.map(stat => (
            <span key={stat} className="inline-flex items-center gap-1 text-2xs text-gray-300">
              <StatIcon stat={stat} size={12} /> {stat}
            </span>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        {!disabled && <span className="text-sm font-bold text-emerald-400 kuro-number">{rowLabel(chance)}</span>}
        <ChevronRight size={14} className="text-gray-500" />
      </div>
    </button>
  );
}

// Shared "Kuro panel" popup — same FocusTrapModal + kuro-card shell used by EchoSelector/
// WeaponSelector/TeamSelector's own pickers, so this reads as the same app-wide pattern
// instead of a one-off. `pool` (main-stat % per option) is null for substat pickers, which
// show a plateau-tier row at the bottom instead.
function StatPickerModal({ title, options, pool, selected, onToggle, tierValue, onSetTier, onClose }) {
  return (
    <FocusTrapModal isOpen onClose={onClose} className="" onClick={onClose} centered padding="p-3" ariaLabel={title}>
      <div className="kuro-card w-full max-w-md max-h-[80vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-medium)]">
          <h3 className="text-white text-xl font-semibold">{title}</h3>
          <button onClick={onClose} className="p-3 min-w-[48px] min-h-[48px] flex items-center justify-center rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-all" aria-label={t('planner.closeLabel')}><X size={16} /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {options.length === 0 ? (
            <div className="text-sm text-gray-500 text-center py-4">{t('planner.echoFarm.noOptionsLeft')}</div>
          ) : (
            <div className="grid grid-cols-2 gap-1.5">
              {options.map(stat => {
                const active = selected.includes(stat);
                return (
                  <button key={stat} onClick={() => onToggle(stat)}
                    className={`kuro-btn text-sm inline-flex items-center gap-1.5 justify-start ${active ? 'active-gold' : ''}`} style={{ padding: '8px' }}>
                    <StatIcon stat={stat} size={14} />
                    <span className="truncate">{stat}</span>
                    {pool && <span className="text-2xs text-gray-500 ml-auto shrink-0">{(pool[stat] || 0).toFixed(1)}%</span>}
                  </button>
                );
              })}
            </div>
          )}
          {onSetTier && (
            <div className="space-y-1">
              <div className="kuro-section-label">{t('planner.echoFarm.minPlateau')}</div>
              <div className="flex gap-1.5">
                {PLATEAU_TIERS.map((tier, i) => (
                  <button key={tier} onClick={() => onSetTier(i)}
                    className={`kuro-btn flex-1 text-sm ${tierValue === i ? 'active-emerald' : ''}`} style={{ padding: '8px' }}>
                    {t(`planner.echoFarm.plateau${tier}`)}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </FocusTrapModal>
  );
}

function ResourceTile({ icon, label, value, color }) {
  return (
    <div className="flex flex-col items-center gap-0.5 p-1.5 rounded" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)' }}>
      {icon}
      <span className={`text-sm font-bold kuro-number ${color}`}>{typeof value === 'number' ? value.toLocaleString() : value}</span>
      <span className="text-2xs text-gray-500 text-center leading-tight">{label}</span>
    </div>
  );
}
