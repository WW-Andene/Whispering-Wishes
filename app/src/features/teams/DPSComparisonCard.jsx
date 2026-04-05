// ═══════════════════════════════════════════════════════════════════════════════
// DPSComparisonCard — Side-by-side team DPS comparison with bars + stats table
// ═══════════════════════════════════════════════════════════════════════════════

import React from 'react';
import { BarChart3, Sword, X } from 'lucide-react';
import { ECHO_DATA, ALL_4COST_ECHOES } from '../../data/echoes.js';
import { getElementColor } from '../../utils/helpers.js';
import { haptic } from '../../utils/helpers.js';
import { Card, CardHeader, CardBody } from '../../shared/components/Card.jsx';

const roleColors = {
  DPS: { bg: 'bg-red-500/15', text: 'text-red-400' },
  'Sub-DPS': { bg: 'bg-orange-500/15', text: 'text-orange-400' },
  Support: { bg: 'bg-cyan-500/15', text: 'text-cyan-400' },
  Healer: { bg: 'bg-emerald-500/15', text: 'text-emerald-400' },
};

const COMPARISON_STATS = [
  ['Eff. ATK', e => e.stats.effAtk?.toLocaleString('en-US')],
  ['Crit Rate', e => Math.min(e.stats.critRate, 100).toFixed(1) + '%'],
  ['Crit DMG', e => e.stats.critDmg?.toFixed(1) + '%'],
  ['Elem DMG', e => e.stats.elemDmg?.toFixed(1) + '%'],
  ['DEF Shred', e => (e.stats.defShred || 0) + '%'],
  ['RES Shred', e => (e.stats.resShred || 0) + '%'],
  ['Synergy', e => e.stats.synergy + '%'],
];

export default function DPSComparisonCard({
  teamCompareEntries, setTeamCompareEntries,
  calcTeamStats,
  enemyEcho, enemyLevel, setEnemyLevel,
  setEnemyEchoSearch, setEnemyEchoModalOpen,
  confirm,
}) {
  if (teamCompareEntries.length === 0) return null;

  const computed = teamCompareEntries.map(entry => ({
    ...entry,
    stats: calcTeamStats(entry.slots, entry.teamIdx ?? 0),
  })).filter(e => e.stats);

  if (!computed.length) return null;

  const unifiedMax = Math.max(
    ...computed.flatMap(e => [e.stats.rawDps, e.stats.realDps, e.stats.perfectDps]),
    1
  );

  return (
    <Card id="team-dps-comparison">
      <CardHeader action={
        <button onClick={async () => { if (await confirm?.({ title: 'Clear comparison', message: 'Remove all comparison entries?', confirmLabel: 'Clear', destructive: true })) { setTeamCompareEntries([]); haptic.light(); } }}
          className="kuro-btn text-[10px]" aria-label="Clear all team comparisons">
          Clear All
        </button>
      }><BarChart3 size={14} className="text-purple-400" /> DPS Comparison</CardHeader>
      <CardBody>
        {/* Enemy Target Selector */}
        <div className="flex flex-wrap items-center gap-2 mb-3 p-2 rounded-lg border border-[var(--border-medium)]" style={{ background: 'var(--bg-stat)' }}>
          <Sword size={12} className="text-red-400" />
          <span className="text-gray-400 text-[10px] font-medium">Target:</span>
          <button onClick={() => { setEnemyEchoSearch(''); setEnemyEchoModalOpen(true); haptic.light(); }}
            className="kuro-btn text-[10px] px-2 py-1 flex-1 min-w-[120px] max-w-[240px] text-left truncate">
            {enemyEcho ? (() => {
              const ed = ECHO_DATA[enemyEcho];
              const resEl = ed?.enemyRes ? Object.keys(ed.enemyRes)[0] : '';
              const resVal = ed?.enemyRes?.[resEl] || 10;
              return `${enemyEcho} (${resEl ? resEl.charAt(0).toUpperCase() + resEl.slice(1) + ' ' + resVal + '%' : '10%'})`;
            })() : 'Default (10% all RES)'}
          </button>
          <div className="flex items-center gap-1">
            <span className="text-gray-500 text-[10px]">Lv.</span>
            <input type="text" inputMode="numeric" value={enemyLevel}
              onFocus={e => e.target.select()}
              onChange={e => { const v = e.target.value.replace(/\D/g, ''); if (v === '') { setEnemyLevel(''); return; } const n = parseInt(v, 10); setEnemyLevel(Number.isNaN(n) ? 90 : Math.max(1, Math.min(120, n))); }}
              onBlur={e => { if (!e.target.value || isNaN(parseInt(e.target.value, 10))) setEnemyLevel(90); }}
              className="kuro-input w-12 text-[10px] px-1 py-0.5 text-center" />
          </div>
          <span className="text-gray-600 text-[10px]">DEF {792 + 8 * enemyLevel}</span>
        </div>

        <div className="space-y-3">
          {computed.map((entry) => {
            const s = entry.stats;
            const rawPct = (s.rawDps / unifiedMax) * 100;
            const fullPct = (s.realDps / unifiedMax) * 100;
            const perfectPct = (s.perfectDps / unifiedMax) * 100;
            return (
              <div key={entry.id} className="group p-2.5 rounded-lg border border-[var(--border-medium)] relative" style={{ background: 'var(--bg-stat)' }}>
                <div className="flex items-center justify-between mb-1.5 pr-8">
                  <span className="text-[10px] font-medium text-gray-300 truncate" title={entry.slots.filter(Boolean).join(' / ')}>
                    {entry.slots.filter(Boolean).join(' / ') || 'Empty Team'}
                  </span>
                </div>
                <button onClick={() => { setTeamCompareEntries(prev => prev.filter(e => e.id !== entry.id)); haptic.light(); }}
                  className="absolute top-1 right-1 z-20 w-[28px] h-[28px] aspect-square p-0 rounded-lg bg-red-500/80 text-white flex items-center justify-center opacity-60 hover:opacity-100 transition-opacity btn-icon-square"
                  aria-label="Remove this team from comparison">
                  <X size={12} />
                </button>

                {/* Character cards */}
                <div className="flex gap-1.5 mb-2">
                  {s.members.map((m, mi) => {
                    const rarity5 = m.d.rarity === 5;
                    const rc2 = roleColors[m.d.role] || roleColors.Support;
                    return (
                      <div key={mi} className={`flex-1 min-w-0 p-1.5 rounded-lg border text-center ${rarity5 ? 'border-yellow-500/50' : 'border-purple-500/50'}`}
                        style={{
                          background: rarity5 ? 'linear-gradient(to top, rgba(237,175,24,0.15), rgba(237,175,24,0.05))' : 'linear-gradient(to top, rgba(168,85,247,0.15), rgba(168,85,247,0.05))',
                          boxShadow: rarity5 ? '0 0 12px rgba(237,175,24,0.15), inset 0 0 10px rgba(237,175,24,0.05)' : '0 0 12px rgba(168,85,247,0.15), inset 0 0 10px rgba(168,85,247,0.05)'
                        }}>
                        <div className="text-[10px] font-semibold truncate" style={{ color: getElementColor(m.d.element), textShadow: `0 0 8px ${getElementColor(m.d.element)}60` }}>{m.name}</div>
                        <div className={`text-[8px] ${rarity5 ? 'text-yellow-400' : 'text-purple-400'}`}>{rarity5 ? '★★★★★' : '★★★★'}</div>
                        <span className={`text-[8px] px-1 py-0.5 rounded ${rc2.bg} ${rc2.text} inline-block mt-0.5`}>{m.d.role}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Three-tier DPS bars */}
                {[
                  { label: 'Raw', value: s.rawDps, pct: rawPct, color: '#22c55e' },
                  { label: 'Full', value: s.realDps, pct: fullPct, color: '#06b6d4' },
                  { label: 'Perfect', value: s.perfectDps, pct: perfectPct, color: '#eab308' },
                ].map((bar, bi) => (
                  <div key={bi} className={bi < 2 ? 'mb-1' : 'mb-0.5'}>
                    <div className="flex items-baseline justify-between mb-0.5">
                      <span className="text-gray-400 text-[10px]">{bar.label}</span>
                      <span className="font-bold text-xs kuro-number" style={{ color: bar.color, textShadow: `0 0 8px ${bar.color}99` }}>{bar.value.toLocaleString('en-US')}/s</span>
                    </div>
                    <div className="relative h-4 rounded" style={{ background: 'transparent' }}>
                      <div className="absolute top-0 left-0 bottom-0 rounded transition-all duration-700"
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

                {/* Quick stats */}
                <div className="flex flex-wrap gap-x-4 gap-y-1 pt-1.5 border-t border-[var(--border-medium)]">
                  <div className="text-[10px]"><span className="text-gray-500">DPS: </span><span className="text-white font-medium">{s.mainDps.name}</span></div>
                  <div className="text-[10px]"><span className="text-gray-500">{s.mainDps.scaling !== 'ATK' ? s.mainDps.scaling : 'ATK'}: </span><span className="text-yellow-400 kuro-number">{s.effAtk}</span></div>
                  <div className="text-[10px]"><span className="text-gray-500">CR: </span><span className="text-cyan-400 kuro-number">{s.critRate.toFixed(0)}%</span></div>
                  <div className="text-[10px]"><span className="text-gray-500">CD: </span><span className="text-cyan-400 kuro-number">{s.critDmg.toFixed(0)}%</span></div>
                  <div className="text-[10px]"><span className="text-gray-500">Rot: </span><span className="text-gray-300 kuro-number">{s.mainDps.d.rotTime || 25}s</span></div>
                  {s.mainDps.scaling !== 'ATK' && <div className="text-[10px]"><span className="text-violet-400">{s.mainDps.scaling} scaling</span></div>}
                  {s.defShred > 0 && <div className="text-[10px]"><span className="text-gray-500">DEF↓ </span><span className="text-red-400 kuro-number">{s.defShred}%</span></div>}
                </div>
              </div>
            );
          })}
        </div>

        {/* Side-by-side stats table */}
        {computed.length > 1 && (
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-[10px]">
              <thead>
                <tr className="border-b border-[var(--border-medium)]">
                  <th className="text-left text-gray-500 py-1 pr-2">Stat</th>
                  {computed.map((e, i) => (
                    <th key={i} className="text-center text-gray-400 py-1 px-1">{e.stats.mainDps.name}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {COMPARISON_STATS.map(([label, fn]) => (
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
          <p className="text-gray-500 text-[10px] text-center mt-2">Tap <span className="text-yellow-400">+ Compare</span> to add more ({5 - teamCompareEntries.length} left)</p>
        )}
      </CardBody>
    </Card>
  );
}
