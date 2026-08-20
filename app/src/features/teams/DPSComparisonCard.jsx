// ═══════════════════════════════════════════════════════════════════════════════
// DPSComparisonCard — Side-by-side team DPS comparison with bars + stats table
// ═══════════════════════════════════════════════════════════════════════════════

import React from 'react';
import { BarChart3, Sword, X } from 'lucide-react';
import { getEnemyStatsAtLevel } from '../../data/echoes.js';
import { getElementColor, getElementIcon } from '../../utils/helpers.js';
import { haptic } from '../../utils/helpers.js';
import { Card, CardHeader, CardBody } from '../../shared/components/Card.jsx';
import { hideOnError } from '../../shared/utils/imageHelpers.js';
import { t, formatNumber } from '../../utils/i18n.js';

const roleColors = {
  DPS: { bg: 'bg-red-500/15', text: 'text-red-400' },
  'Sub-DPS': { bg: 'bg-orange-500/15', text: 'text-orange-400' },
  Support: { bg: 'bg-cyan-500/15', text: 'text-cyan-400' },
  Healer: { bg: 'bg-emerald-500/15', text: 'text-emerald-400' },
};

const getComparisonStats = () => [
  [t('teams.dpsCompare.statEffAtk'), e => formatNumber(e.stats.effAtk)],
  [t('teams.dpsCompare.statCritRate'), e => Math.min(e.stats.critRate, 100).toFixed(1) + '%'],
  [t('teams.dpsCompare.statCritDmg'), e => e.stats.critDmg?.toFixed(1) + '%'],
  [t('teams.dpsCompare.statElemDmg'), e => e.stats.elemDmg?.toFixed(1) + '%'],
  [t('teams.dpsCompare.statAmplify'), e => (e.stats.amplify || 0).toFixed(1) + '%'],
  [t('teams.dpsCompare.statDefShred'), e => (e.stats.defShred || 0) + '%'],
  [t('teams.dpsCompare.statResShred'), e => (e.stats.resShred || 0) + '%'],
  [t('teams.dpsCompare.statSynergy'), e => '+' + (e.stats.synergyUplift || e.stats.synergy || 0) + '%'],
];

// Comparison entries snapshot their equipment under a synthetic 'cmp<id>' teamIdx (see the
// "+ Compare" handler in TeamsTab.jsx) rather than the real team's index, so they never share
// state with a live team's gear. That snapshot has to be torn down explicitly when its entry is
// removed, or it leaks in teamEquipment (and localStorage) forever.
const cleanupEntryEquipment = (entry, setTeamEquipment) => {
  if (typeof entry.teamIdx !== 'string' || !setTeamEquipment) return;
  const prefix = entry.teamIdx + ':';
  setTeamEquipment(prev => {
    const next = { ...prev };
    let changed = false;
    Object.keys(next).forEach(k => { if (k.startsWith(prefix)) { delete next[k]; changed = true; } });
    return changed ? next : prev;
  });
};

export default function DPSComparisonCard({
  teamCompareEntries, setTeamCompareEntries,
  calcTeamStats,
  enemyEcho, enemyLevel, setEnemyLevel,
  setEnemyEchoSearch, setEnemyEchoModalOpen,
  confirm,
  setTeamEquipment,
}) {
  if (teamCompareEntries.length === 0) return null;

  const computed = teamCompareEntries.map(entry => ({
    ...entry,
    stats: calcTeamStats(entry.slots, entry.teamIdx ?? 0),
  })).filter(e => e.stats);

  if (!computed.length) return null;

  const unifiedMax = Math.max(
    ...computed.map(e => e.stats.teamDps || e.stats.perfectDps || 0),
    1
  );

  return (
    <Card id="team-dps-comparison">
      <CardHeader action={
        <button onClick={async () => { if (await confirm?.({ title: t('teams.dpsCompare.clearTitle'), message: t('teams.dpsCompare.clearMessage'), confirmLabel: t('teams.dpsCompare.clearConfirm'), destructive: true })) { teamCompareEntries.forEach(e => cleanupEntryEquipment(e, setTeamEquipment)); setTeamCompareEntries([]); haptic.light(); } }}
          className="kuro-btn text-sm" aria-label={t('teams.dpsCompare.clearAllAria')}>
          {t('teams.dpsCompare.clearAll')}
        </button>
      }><BarChart3 size={14} className="text-purple-400" /> {t('teams.dpsCompare.header')}</CardHeader>
      <CardBody>
        {/* Enemy Target — same shared enemyEcho/enemyLevel state as the always-visible Target card
            above Team Overview; editing it here edits it there too. Kept as a compact read-only
            summary + shortcut into the same selector modal, rather than a second full editable
            control, to avoid two out-of-sync-looking copies of the same picker. */}
        <button onClick={() => { setEnemyEchoSearch(''); setEnemyEchoModalOpen(true); haptic.light(); }}
          className="w-full mb-3 flex items-center gap-2.5 p-2 rounded-lg border border-[var(--border-medium)] hover:border-white/20 transition-colors text-left"
          style={{ background: 'var(--bg-stat)' }}>
          <Sword size={12} className="text-red-400 shrink-0" />
          <span className="text-gray-400 text-sm font-medium shrink-0">{t('teams.dpsCompare.target')}</span>
          <span className="text-white text-sm font-medium truncate flex-1">{enemyEcho || t('teams.dpsCompare.noTarget')}</span>
          <span className="text-gray-500 text-sm shrink-0">{t('teams.dpsCompare.level', { level: enemyLevel })}</span>
          <span className="text-gray-600 text-sm shrink-0">{t('teams.dpsCompare.def', { value: getEnemyStatsAtLevel(enemyEcho, enemyLevel)?.def ?? (792 + 8 * (Number(enemyLevel) || 90)) })}</span>
        </button>

        <div className="space-y-3">
          {computed.map((entry) => {
            const s = entry.stats;
            const teamPct = ((s.teamDps || s.perfectDps || 0) / unifiedMax) * 100;
            const soloPct = ((s.soloDps || s.rawDps || 0) / unifiedMax) * 100;
            return (
              <div key={entry.id} className="group p-2.5 rounded-lg border border-[var(--border-medium)] relative" style={{ background: 'var(--bg-stat)' }}>
                <div className="flex items-center justify-between mb-1.5 pr-8">
                  <span className="text-sm font-medium text-gray-300 truncate" title={entry.slots.filter(Boolean).join(' / ')}>
                    {entry.slots.filter(Boolean).join(' / ') || t('teams.dpsCompare.emptyTeam')}
                  </span>
                </div>
                <button onClick={() => { cleanupEntryEquipment(entry, setTeamEquipment); setTeamCompareEntries(prev => prev.filter(e => e.id !== entry.id)); haptic.light(); }}
                  className="absolute top-1 right-1 z-20 w-[28px] h-[28px] aspect-square p-0 rounded-lg bg-red-500/80 text-white flex items-center justify-center opacity-60 hover:opacity-100 transition-opacity btn-icon-square"
                  aria-label={t('teams.dpsCompare.removeAria')}>
                  <X size={12} />
                </button>

                {/* Character cards */}
                <div className="flex gap-1.5 mb-2">
                  {s.members.map((m, mi) => {
                    const rarity5 = m.d.rarity === 5;
                    const rc2 = roleColors[m.d.role] || roleColors.Support;
                    return (
                      <div key={mi} className={`flex-1 min-w-0 p-1.5 rounded-lg border text-center ${rarity5 ? 'border-yellow-500/50 glow-gold bg-yellow-500/10' : 'border-purple-500/50 glow-purple bg-purple-500/10'}`}>
                        <div className="text-sm font-semibold truncate inline-flex items-center justify-center gap-1 w-full" style={{ color: getElementColor(m.d.element), textShadow: `0 0 8px ${getElementColor(m.d.element)}60` }}>
                          {getElementIcon(m.d.element) && <img src={getElementIcon(m.d.element)} alt="" className="w-3 h-3 shrink-0" onError={hideOnError} />}
                          <span className="truncate">{m.name}</span>
                        </div>
                        <div className={`text-2xs ${rarity5 ? 'text-yellow-400' : 'text-purple-400'}`}>{rarity5 ? '★★★★★' : '★★★★'}</div>
                        <span className={`text-2xs px-1 py-0.5 rounded ${rc2.bg} ${rc2.text} inline-block mt-0.5`}>{m.d.role}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Two-tier DPS bars: Team DPS (primary) + Solo DPS (reference) */}
                {[
                  { label: t('teams.dpsCompare.barTeam'), value: s.teamDps || s.perfectDps || 0, pct: teamPct, color: '#06b6d4' },
                  { label: t('teams.dpsCompare.barSolo'), value: s.soloDps || s.rawDps || 0, pct: soloPct, color: '#22c55e' },
                ].map((bar, bi) => (
                  <div key={bi} className={bi < 1 ? 'mb-1' : 'mb-0.5'}>
                    <div className="flex items-baseline justify-between mb-0.5">
                      <span className="text-gray-400 text-sm">{bar.label}</span>
                      <span className="font-bold text-base kuro-number dps-number" style={{ color: bar.color, textShadow: `0 0 8px ${bar.color}99` }}>{formatNumber(bar.value)}/s</span>
                    </div>
                    <div className="relative h-4 rounded" style={{ background: 'transparent' }}>
                      <div className="absolute top-0 left-0 bottom-0 rounded transition-all duration-700 dps-bar"
                        style={{
                          width: Math.max(bar.pct, 4) + '%',
                          background: `linear-gradient(90deg, ${bar.color}40, ${bar.color}20)`,
                          border: `1px solid ${bar.color}90`,
                          borderLeft: 'none',
                          boxShadow: `0 0 12px ${bar.color}50, inset 0 0 15px ${bar.color}30`
                        }} />
                      <div className="absolute top-0 bottom-0 w-[2px] rounded-full"
                        style={{ left: 0, background: bar.color, boxShadow: `0 0 8px ${bar.color}, 0 0 16px ${bar.color}80` }} />
                    </div>
                  </div>
                ))}
                {/* Synergy uplift badge */}
                {(s.synergyUplift != null) && (
                  <div className="text-center mt-1">
                    <span className={`text-sm font-medium ${s.synergyUplift >= 80 ? 'text-emerald-400' : s.synergyUplift >= 40 ? 'text-amber-400' : 'text-red-400'}`}>
                      {t('teams.dpsCompare.synergyUplift', { value: s.synergyUplift || 0 })}
                    </span>
                  </div>
                )}

                {/* Quick stats */}
                <div className="flex flex-wrap gap-x-4 gap-y-1 pt-1.5 border-t border-[var(--border-medium)]">
                  <div className="text-sm"><span className="text-gray-500">{t('teams.dpsCompare.dps')}</span><span className="text-white font-medium">{s.mainDps.name}</span></div>
                  <div className="text-sm"><span className="text-gray-500">{s.mainDps.scaling !== 'ATK' ? s.mainDps.scaling : 'ATK'}: </span><span className="text-yellow-400 kuro-number">{formatNumber(s.effAtk)}</span></div>
                  <div className="text-sm"><span className="text-gray-500">{t('teams.dpsCompare.cr')}</span><span className="text-cyan-400 kuro-number">{s.critRate.toFixed(0)}%</span></div>
                  <div className="text-sm"><span className="text-gray-500">{t('teams.dpsCompare.cd')}</span><span className="text-cyan-400 kuro-number">{s.critDmg.toFixed(0)}%</span></div>
                  <div className="text-sm"><span className="text-gray-500">{t('teams.dpsCompare.rot')}</span><span className="text-gray-300 kuro-number">{s.rotTime || s.mainDps.d.rotTime || 25}s</span></div>
                  {s.mainDps.scaling !== 'ATK' && <div className="text-sm"><span className="text-violet-400">{t('teams.dpsCompare.scalingSuffix', { stat: s.mainDps.scaling })}</span></div>}
                  {s.defShred > 0 && <div className="text-sm"><span className="text-gray-500">{t('teams.dpsCompare.defShred')}</span><span className="text-red-400 kuro-number">{Math.round(s.defShred)}%</span></div>}
                </div>
              </div>
            );
          })}
        </div>

        {/* Side-by-side stats table */}
        {computed.length > 1 && (
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border-medium)]">
                  <th className="text-left text-gray-500 py-1 pr-2">{t('teams.dpsCompare.statLabel')}</th>
                  {computed.map((e, i) => (
                    <th key={i} className="text-center text-gray-400 py-1 px-1">{e.stats.mainDps.name}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {getComparisonStats().map(([label, fn]) => (
                  <tr key={label} className="border-b border-[var(--border-medium)]/30">
                    <td className="text-gray-500 py-0.5 pr-2">{label}</td>
                    {computed.map((e, i) => {
                      const val = fn(e);
                      const parseNum = (s) => parseFloat(String(s).replace(/,/g, '')) || 0;
                      const nums = computed.map(c => parseNum(fn(c)));
                      const isMax = parseNum(val) === Math.max(...nums) && nums.filter(n => n === Math.max(...nums)).length === 1;
                      return <td key={i} className={`text-center py-0.5 px-1 ${isMax ? 'text-yellow-400 font-bold' : 'text-gray-300'}`}>{val}</td>;
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {teamCompareEntries.length < 5 && (
          <p className="text-gray-500 text-sm text-center mt-2">{t('teams.dpsCompare.addMore', { compare: t('teams.dpsCompare.compareLabel'), count: 5 - teamCompareEntries.length })}</p>
        )}
      </CardBody>
    </Card>
  );
}
