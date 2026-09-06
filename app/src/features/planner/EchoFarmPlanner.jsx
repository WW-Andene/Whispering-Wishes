// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — features/planner/EchoFarmPlanner.jsx
// Echo Farming Calculator — Planner tab. Configure a target Echo (Sonata Set, cost
// tier, main/secondary stat, 5 substat slots with a minimum plateau each, and whether
// you're farming it via Tacet Field), see the real probability of each condition and
// the combined odds, and the estimated Waveplate/Shell Credit/Tuner cost to get there.
// Every probability number traces back to Data dump/Echoes/ (see echoFarmingData.js).
// ═══════════════════════════════════════════════════════════════════════════════

import React from 'react';
import { ChevronDown, Zap, Coins, Wrench, Info } from 'lucide-react';
import { Card, CardHeader, CardBody } from '../../shared/components/Card.jsx';
import { KuroSelect } from '../../shared/components/KuroSelect.jsx';
import { hideOnError } from '../../shared/utils/imageHelpers.js';
import { usePersistedState } from '../../hooks/usePersistedState.js';
import { ECHO_SETS } from '../../data/echoes.js';
import { getSetIcon, getElementIcon, getStatIcon } from '../../shared/utils/elementVisuals.js';
import {
  ECHO_MAIN_STAT_CHANCE, ALL_ECHO_SUBSTATS, ECHO_SUBSTAT_POOL_SIZE_AT_SLOT,
  PLATEAU_TIERS, getPlateauChance, TACET_FIELD_WAVEPLATE_COST, TACET_FIELD_ENDGAME_YIELD,
  WEEKLY_BOSS_ENDGAME_YIELD, WORLD_BOSS_ENDGAME_YIELD,
} from '../../data/echoFarmingData.js';
import { t } from '../../utils/i18n.js';

const COST_TIERS = [1, 3, 4];
const SUBSTAT_SLOTS = [0, 1, 2, 3, 4];

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
  set: '',
  mainStats: [],
  secondaryStats: [],
  substats: SUBSTAT_SLOTS.map(() => ({ stats: [], minTier: 0 })),
  tacetField: true,
};

export default function EchoFarmPlanner() {
  const [collapsed, setCollapsed] = usePersistedState('ww-echo-farm-collapsed', false);
  const [cfg, setCfg] = usePersistedState('ww-echo-farm-config', DEFAULT_STATE);

  const setCount = ECHO_SETS ? Object.keys(ECHO_SETS).length : 0;
  const mainStatPool = ECHO_MAIN_STAT_CHANCE[cfg.cost] || {};
  const mainStatOptions = Object.keys(mainStatPool);

  const toggleStat = (list, stat) => list.includes(stat) ? list.filter(s => s !== stat) : [...list, stat];

  // ── Row-level probabilities ──
  const rowChance = (selected) => selected.reduce((s, stat) => s + (mainStatPool[stat] || 0), 0) / 100;
  const mainChance = cfg.mainStats.length ? rowChance(cfg.mainStats) : 1;
  const secondaryChance = cfg.secondaryStats.length ? rowChance(cfg.secondaryStats) : 1;

  const substatRowChance = (slotIdx, slot) => {
    if (!slot.stats.length) return 1;
    const poolSize = ECHO_SUBSTAT_POOL_SIZE_AT_SLOT[slotIdx];
    // Pick chance: how many of the accepted substats could land in this slot, out of the
    // remaining pool — uniform per Kuro's own disclosed rate (see echoFarmingData.js).
    const pickChance = slot.stats.length / poolSize;
    // Plateau chance: average across the accepted substats' own grade curve (they can differ —
    // e.g. Crit Rate/DMG vs. a %-stat — so this is an average, not a single exact rate).
    const avgPlateau = slot.stats.reduce((s, stat) => s + getPlateauChance(stat, slot.minTier) / 100, 0) / slot.stats.length;
    return pickChance * avgPlateau;
  };
  const substatChances = cfg.substats.map((slot, i) => substatRowChance(i, slot));

  // Unified — product of all 7 rows. Substat rows are modeled independently for tractability;
  // the real game draws all 5 from one shared shrinking pool without replacement, so this is a
  // close approximation, not an exact combinatorial answer (flagged in the UI below).
  const unifiedChance = [mainChance, secondaryChance, ...substatChances].reduce((a, b) => a * b, 1);
  const expectedInstances = unifiedChance > 0 ? Math.ceil(1 / unifiedChance) : null;

  // ── Resource estimates ──
  const yieldSource = cfg.tacetField ? TACET_FIELD_ENDGAME_YIELD : WEEKLY_BOSS_ENDGAME_YIELD;
  const runsNeeded = expectedInstances != null ? Math.ceil(expectedInstances / yieldSource.avgEchoesPerRun) : null;
  const waveplateNeeded = cfg.tacetField && runsNeeded != null ? runsNeeded * TACET_FIELD_WAVEPLATE_COST : 0;
  const shellNeeded = runsNeeded != null ? runsNeeded * yieldSource.avgShellCreditPerRun : null;
  // Tuner attempts — once you have a qualifying instance, expected rerolls to reach each slot's
  // own plateau (grade only, the substat type is already locked at that point).
  const tunersPerSlot = cfg.substats.map(slot => {
    if (!slot.stats.length) return 0;
    const avgChance = slot.stats.reduce((s, stat) => s + getPlateauChance(stat, slot.minTier) / 100, 0) / slot.stats.length;
    return avgChance > 0 ? Math.ceil(1 / avgChance) : 0;
  });
  const totalTuners = tunersPerSlot.reduce((a, b) => a + b, 0);

  const rowLabel = (chance) => `${(chance * 100).toFixed(chance * 100 < 1 ? 2 : 1)}%`;

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
              <button key={cost} onClick={() => setCfg(p => ({ ...p, cost, mainStats: [], secondaryStats: [] }))}
                className={`kuro-btn flex-1 text-sm ${cfg.cost === cost ? 'active-gold' : ''}`} style={{ padding: '8px' }}>
                {cost}-{t('planner.echoFarm.cost')}
              </button>
            ))}
          </div>

          {/* Sonata Set */}
          <KuroSelect
            value={cfg.set}
            onChange={set => setCfg(p => ({ ...p, set }))}
            options={[
              { value: '', label: t('planner.echoFarm.anySet') },
              ...(setCount > 0 ? Object.keys(ECHO_SETS).map(name => ({
                value: name,
                label: <span className="inline-flex items-center gap-1.5">{getSetIcon(name) && <img src={getSetIcon(name)} alt="" width={14} height={14} className="shrink-0" onError={hideOnError} />} {name}</span>,
              })) : []),
            ]}
            className="w-full"
            ariaLabel={t('planner.echoFarm.chooseSetAria')}
            small
          />

          {/* Main Stat */}
          <StatRow
            title={t('planner.echoFarm.mainStat')}
            options={mainStatOptions}
            pool={mainStatPool}
            selected={cfg.mainStats}
            onToggle={stat => setCfg(p => ({ ...p, mainStats: toggleStat(p.mainStats, stat) }))}
            chance={mainChance}
            rowLabel={rowLabel}
          />

          {/* Secondary Stat */}
          <StatRow
            title={t('planner.echoFarm.secondaryStat')}
            options={mainStatOptions}
            pool={mainStatPool}
            selected={cfg.secondaryStats}
            onToggle={stat => setCfg(p => ({ ...p, secondaryStats: toggleStat(p.secondaryStats, stat) }))}
            chance={secondaryChance}
            rowLabel={rowLabel}
            note={t('planner.echoFarm.secondaryApprox')}
          />

          {/* 5 Substat slots */}
          {cfg.substats.map((slot, i) => (
            <SubstatRow
              key={i}
              index={i}
              slot={slot}
              chance={substatChances[i]}
              rowLabel={rowLabel}
              onToggleStat={stat => setCfg(p => ({
                ...p, substats: p.substats.map((s, j) => j === i ? { ...s, stats: toggleStat(s.stats, stat) } : s),
              }))}
              onSetTier={tierIdx => setCfg(p => ({
                ...p, substats: p.substats.map((s, j) => j === i ? { ...s, minTier: tierIdx } : s),
              }))}
            />
          ))}

          {/* Tacet Field toggle */}
          <button onClick={() => setCfg(p => ({ ...p, tacetField: !p.tacetField }))} className={`kuro-btn w-full text-sm ${cfg.tacetField ? 'active-emerald' : ''}`} style={{ padding: '8px' }}>
            {cfg.tacetField ? '✓ ' : ''}{t('planner.echoFarm.tacetFieldToggle')}
          </button>

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
              <ResourceTile icon={<Zap size={14} className="text-cyan-400" />} label={t('planner.echoFarm.waveplate')} value={cfg.tacetField ? waveplateNeeded : t('planner.echoFarm.notApplicable')} color="text-cyan-400" />
              <ResourceTile icon={<Coins size={14} className="text-yellow-400" />} label={t('planner.shellCredit')} value={shellNeeded} color="text-yellow-400" />
              <ResourceTile icon={<Wrench size={14} className="text-orange-400" />} label={t('planner.echoFarm.tuners')} value={totalTuners} color="text-orange-400" />
            </div>
            {!cfg.tacetField && (
              <div className="text-2xs text-gray-500">{t('planner.echoFarm.bossRunsNote', { runs: runsNeeded ?? '—' })}</div>
            )}
          </div>
        </CardBody>
      )}
    </Card>
  );
}

function StatRow({ title, options, pool, selected, onToggle, chance, rowLabel, note }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="kuro-section-label">{title}</span>
        <span className="text-sm font-bold text-emerald-400 kuro-number">{rowLabel(chance)}</span>
      </div>
      {note && <div className="text-2xs text-gray-500">{note}</div>}
      <div className="flex flex-wrap gap-1.5">
        {options.map(stat => {
          const active = selected.includes(stat);
          return (
            <button key={stat} onClick={() => onToggle(stat)}
              className={`kuro-btn text-2xs inline-flex items-center gap-1 ${active ? 'active-gold' : ''}`} style={{ padding: '6px 8px' }}>
              <StatIcon stat={stat} size={12} /> {stat} <span className="text-gray-500">{(pool[stat] || 0).toFixed(1)}%</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function SubstatRow({ index, slot, chance, rowLabel, onToggleStat, onSetTier }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="kuro-section-label">{t('planner.echoFarm.substatSlot', { n: index + 1 })}</span>
        <span className="text-sm font-bold text-emerald-400 kuro-number">{rowLabel(chance)}</span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {ALL_ECHO_SUBSTATS.map(stat => {
          const active = slot.stats.includes(stat);
          return (
            <button key={stat} onClick={() => onToggleStat(stat)}
              className={`kuro-btn text-2xs inline-flex items-center gap-1 ${active ? 'active-gold' : ''}`} style={{ padding: '6px 8px' }}>
              <StatIcon stat={stat} size={12} /> {stat}
            </button>
          );
        })}
      </div>
      <div className="flex gap-1.5">
        {PLATEAU_TIERS.map((tier, i) => (
          <button key={tier} onClick={() => onSetTier(i)}
            className={`kuro-btn flex-1 text-2xs ${slot.minTier === i ? 'active-emerald' : ''}`} style={{ padding: '6px' }}>
            {t(`planner.echoFarm.plateau${tier}`)}
          </button>
        ))}
      </div>
    </div>
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
