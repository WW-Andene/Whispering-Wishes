// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — features/planner/EchoFarmPlanner.jsx
// Echo Farming Calculator — Planner tab. Pick a specific target Echo (not just a
// Sonata Set — some Echoes carry two sets at once, which a set-only picker can't
// represent), main/secondary stat, 5 substat slots with a minimum plateau each, and
// the real farming source for that Echo's cost tier (4-cost Echoes only ever drop
// from bosses, never Tacet Fields — 1/3-cost are Tacet Field only). See the real
// probability of each condition and the combined odds, plus the estimated Waveplate/
// Shell Credit/Tuner cost to get there. Every number traces to Data dump/Echoes/
// (see echoFarmingData.js).
//
// Structure (2026-09-06 revision): every stat-picking row (Main/Secondary/5x Substat)
// used to dump its full option list inline — with the 13-entry substat pool repeated
// 5 times that was an unreadable wall of buttons. Each row is now a single compact
// summary button (icon strip + chance) that opens one shared StatPickerModal, the same
// "Kuro panel" pattern (FocusTrapModal + kuro-card) already used by EchoSelector/
// WeaponSelector/TeamSelector's own pickers — one picker component, seven call sites.
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useState } from 'react';
import { ChevronDown, Zap, Coins, Wrench, Info, X, ChevronRight, Search } from 'lucide-react';
import { Card, CardHeader, CardBody } from '../../shared/components/Card.jsx';
import { FocusTrapModal } from '../../shared/components/FocusTrapModal.jsx';
import { hideOnError } from '../../shared/utils/imageHelpers.js';
import { usePersistedState } from '../../hooks/usePersistedState.js';
import { ECHO_DATA, ALL_4COST_ECHOES, ALL_3COST_ECHOES, ALL_1COST_ECHOES } from '../../data/echoes.js';
import { getSetIcon, getElementIcon, getStatIcon } from '../../shared/utils/elementVisuals.js';
import {
  ECHO_MAIN_STAT_CHANCE, ALL_ECHO_SUBSTATS, ECHO_SUBSTAT_POOL_SIZE_AT_SLOT,
  PLATEAU_TIERS, getPlateauChance, TACET_FIELD_WAVEPLATE_COST, TACET_FIELD_ENDGAME_YIELD,
  WEEKLY_BOSS_ENDGAME_YIELD, WORLD_BOSS_ENDGAME_YIELD,
} from '../../data/echoFarmingData.js';
import { t } from '../../utils/i18n.js';

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

// Renders a stat's icon — element icon for "<Element> DMG" main-stat entries, the shared
// STAT_ICONS lookup (already strips a trailing %) for everything else, no icon at all if
// neither exists (Healing Bonus, the 4 DMG-Bonus substats) rather than a fabricated one.
function StatIcon({ stat, size = 14 }) {
  const elMatch = stat?.match(/^(\w+) DMG$/);
  const src = elMatch ? getElementIcon(elMatch[1]) : getStatIcon(stat);
  if (!src) return null;
  return <img src={src} alt="" width={size} height={size} className="shrink-0" onError={hideOnError} />;
}

const DEFAULT_STATE = {
  cost: 4,
  echoName: '',
  mainStats: [],
  secondaryStats: [],
  substats: [0, 1, 2, 3, 4].map(() => ({ stats: [], minTier: 0 })),
  farmSource: 'weeklyBoss', // 'tacetField' | 'weeklyBoss' | 'worldBoss'
};

export default function EchoFarmPlanner() {
  const [collapsed, setCollapsed] = usePersistedState('ww-echo-farm-collapsed', false);
  const [cfg, setCfg] = usePersistedState('ww-echo-farm-config-v2', DEFAULT_STATE);
  // Which popup is open: null, 'echo', 'main', 'secondary', or a substat slot index.
  const [openPicker, setOpenPicker] = useState(null);
  const [echoSearch, setEchoSearch] = useState('');

  const mainStatPool = ECHO_MAIN_STAT_CHANCE[cfg.cost] || {};
  const mainStatOptions = Object.keys(mainStatPool);
  // Secondary can't roll the same stat as Primary — "An Echo cannot have the same Primary and
  // Secondary Mainstat" (Data dump/Echoes/Probability.md). Excludes whatever's checked in Main.
  const secondaryStatOptions = mainStatOptions.filter(s => !cfg.mainStats.includes(s));

  const echoData = cfg.echoName ? ECHO_DATA[cfg.echoName] : null;
  const echoSets = echoData?.sets || [];

  const setCost = (cost) => setCfg(p => ({
    ...p, cost, echoName: '', mainStats: [], secondaryStats: [],
    farmSource: cost === 4 ? (p.farmSource === 'tacetField' ? 'weeklyBoss' : p.farmSource) : 'tacetField',
  }));

  const toggleStat = (list, stat) => list.includes(stat) ? list.filter(s => s !== stat) : [...list, stat];

  // ── Row-level probabilities ──
  const rowChance = (selected) => selected.reduce((s, stat) => s + (mainStatPool[stat] || 0), 0) / 100;
  const mainChance = cfg.mainStats.length ? rowChance(cfg.mainStats) : 1;
  const secondaryChance = cfg.secondaryStats.length ? rowChance(cfg.secondaryStats) : 1;

  const substatRowChance = (slotIdx, slot) => {
    if (!slot.stats.length) return 1;
    const poolSize = ECHO_SUBSTAT_POOL_SIZE_AT_SLOT[slotIdx];
    const pickChance = slot.stats.length / poolSize;
    const avgPlateau = slot.stats.reduce((s, stat) => s + getPlateauChance(stat, slot.minTier) / 100, 0) / slot.stats.length;
    return pickChance * avgPlateau;
  };
  const substatChances = cfg.substats.map((slot, i) => substatRowChance(i, slot));

  const unifiedChance = [mainChance, secondaryChance, ...substatChances].reduce((a, b) => a * b, 1);
  const expectedInstances = unifiedChance > 0 ? Math.ceil(1 / unifiedChance) : null;

  // ── Resource estimates ──
  const yieldSource = cfg.farmSource === 'tacetField' ? TACET_FIELD_ENDGAME_YIELD
    : cfg.farmSource === 'worldBoss' ? WORLD_BOSS_ENDGAME_YIELD : WEEKLY_BOSS_ENDGAME_YIELD;
  const runsNeeded = expectedInstances != null ? Math.ceil(expectedInstances / yieldSource.avgEchoesPerRun) : null;
  const waveplateNeeded = cfg.farmSource === 'tacetField' && runsNeeded != null ? runsNeeded * TACET_FIELD_WAVEPLATE_COST : 0;
  const shellNeeded = runsNeeded != null ? runsNeeded * yieldSource.avgShellCreditPerRun : null;
  const tunersPerSlot = cfg.substats.map(slot => {
    if (!slot.stats.length) return 0;
    const avgChance = slot.stats.reduce((s, stat) => s + getPlateauChance(stat, slot.minTier) / 100, 0) / slot.stats.length;
    return avgChance > 0 ? Math.ceil(1 / avgChance) : 0;
  });
  const totalTuners = tunersPerSlot.reduce((a, b) => a + b, 0);

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

          {/* Target Echo — real portrait, rank, and its actual Sonata Set(s), derived rather
              than freely chosen, so a dual-set Echo is represented correctly instead of forcing
              a single-set guess. */}
          <button onClick={() => setOpenPicker('echo')} className="kuro-btn w-full text-left flex items-center gap-2.5" style={{ padding: '8px 10px' }}>
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
            {cfg.substats.map((slot, i) => (
              <StatSummaryRow
                key={i}
                title={t('planner.echoFarm.substatSlot', { n: i + 1 })}
                selected={slot.stats}
                chance={substatChances[i]}
                rowLabel={rowLabel}
                tierLabel={slot.stats.length ? t(`planner.echoFarm.plateau${PLATEAU_TIERS[slot.minTier]}`) : null}
                onClick={() => setOpenPicker(i)}
              />
            ))}
          </div>

          {/* Farming source — forced to Tacet Field for 1/3-cost, Weekly/World Boss choice for
              4-cost (never Tacet Field: Overlord/Calamity Echoes only drop from bosses). */}
          {cfg.cost === 4 ? (
            <div className="flex gap-1.5">
              {[['weeklyBoss', t('planner.echoFarm.weeklyBoss')], ['worldBoss', t('planner.echoFarm.worldBoss')]].map(([key, label]) => (
                <button key={key} onClick={() => setCfg(p => ({ ...p, farmSource: key }))}
                  className={`kuro-btn flex-1 text-sm ${cfg.farmSource === key ? 'active-emerald' : ''}`} style={{ padding: '8px' }}>
                  {label}
                </button>
              ))}
            </div>
          ) : (
            <div className="kuro-btn w-full text-sm text-center active-emerald" style={{ padding: '8px' }}>
              ✓ {t('planner.echoFarm.tacetFieldOnly')}
            </div>
          )}

          {/* Unified statistics */}
          <div className="p-3 rounded-lg space-y-2" style={{ background: 'var(--bg-stat)', border: '1px solid var(--border-hover)' }}>
            <div className="kuro-section-label">{t('planner.echoFarm.unifiedStats')}</div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">{t('planner.echoFarm.overallChance')}</span>
              <span className="text-base font-bold text-emerald-400 kuro-number">{rowLabel(unifiedChance)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">{t('planner.echoFarm.instancesNeeded')}</span>
              <span className="text-base font-bold text-white kuro-number">{expectedInstances != null ? expectedInstances : '—'}</span>
            </div>
            <div className="grid grid-cols-3 gap-1.5 pt-1">
              <ResourceTile icon={<Zap size={14} className="text-cyan-400" />} label={t('planner.echoFarm.waveplate')} value={cfg.farmSource === 'tacetField' ? waveplateNeeded : t('planner.echoFarm.notApplicable')} color="text-cyan-400" />
              <ResourceTile icon={<Coins size={14} className="text-yellow-400" />} label={t('planner.shellCredit')} value={shellNeeded} color="text-yellow-400" />
              <ResourceTile icon={<Wrench size={14} className="text-orange-400" />} label={t('planner.echoFarm.tuners')} value={totalTuners} color="text-orange-400" />
            </div>
            {cfg.farmSource !== 'tacetField' && (
              <div className="text-2xs text-gray-500">{t('planner.echoFarm.bossRunsNote', { runs: runsNeeded ?? '—' })}</div>
            )}
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
                      className={`kuro-card text-left w-full flex items-center gap-2.5 p-2 transition-all hover:scale-[1.01] ${selected ? 'border-2 border-yellow-400/60 bg-yellow-500/10' : ''}`}>
                      <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 border border-red-500/30 bg-red-500/8">
                        <img src={ed.iconUrl || ed.monsterIconUrl} alt="" className="w-full h-full object-cover" onError={hideOnError} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm text-white font-medium truncate">{name}</div>
                        <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                          {(ed.sets || []).map(setName => (
                            <span key={setName} className="inline-flex items-center gap-1 text-2xs text-gray-400">
                              {getSetIcon(setName) && <img src={getSetIcon(setName)} alt="" width={11} height={11} className="shrink-0" onError={hideOnError} />} {setName}
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
function StatSummaryRow({ title, selected, chance, rowLabel, tierLabel, note, onClick }) {
  return (
    <button onClick={onClick} className="kuro-btn w-full text-left flex items-center justify-between gap-2" style={{ padding: '8px 10px' }}>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className="text-sm text-white font-medium">{title}</span>
          {tierLabel && <span className="kuro-badge kuro-badge-gray text-2xs">{tierLabel}</span>}
        </div>
        <div className="flex items-center gap-1 mt-0.5 flex-wrap">
          {selected.length === 0 ? (
            <span className="text-2xs text-gray-500">{note || t('planner.echoFarm.anyStat')}</span>
          ) : selected.map(stat => (
            <span key={stat} className="inline-flex items-center gap-1 text-2xs text-gray-300">
              <StatIcon stat={stat} size={11} /> {stat}
            </span>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <span className="text-sm font-bold text-emerald-400 kuro-number">{rowLabel(chance)}</span>
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
