// ═══════════════════════════════════════════════════════════════════════════════
// RotationTimeline — Gantt-style chronology: rows top-to-bottom, time left-to-right
// ═══════════════════════════════════════════════════════════════════════════════

import React from 'react';

const ELEMENT_COLORS = {
  Glacio: '#06b6d4', Fusion: '#f97316', Electro: '#a855f7',
  Aero: '#10b981', Spectro: '#edaf18', Havoc: '#ec4899',
};

const STAT_LABELS = {
  atkPct: 'ATK', allDmg: 'All DMG', elemDmg: 'Elem DMG', deepen: 'Deepen',
  basicDmg: 'Basic', heavyDmg: 'Heavy', libDmg: 'Lib', echoDmg: 'Echo',
  skillDmg: 'Skill', critRate: 'CR', critDmg: 'CD', resShred: 'RES↓', defShred: 'DEF↓',
};

export default function RotationTimeline({ rotationTimeline }) {
  if (!rotationTimeline || !rotationTimeline.segments?.length || !rotationTimeline.totalTime) return null;

  const { segments, buffs, totalTime } = rotationTimeline;

  // Build looping segments to fill full rotation
  const loopDur = segments.reduce((s, seg) => s + seg.duration, 0);
  const looped = [];
  let t = 0;
  let idx = 0;
  while (t < totalTime && loopDur > 0) {
    const seg = segments[idx % segments.length];
    const dur = Math.min(seg.duration, totalTime - t);
    looped.push({ ...seg, start: t, duration: dur });
    t += dur;
    idx++;
  }

  // Build rows
  const rows = [];
  looped.forEach(seg => {
    rows.push({ label: seg.name, start: seg.start, duration: seg.duration, color: ELEMENT_COLORS[seg.element] || '#6b7280', type: 'field', detail: `${seg.duration}s` });
  });
  buffs.forEach(buff => {
    const color = ELEMENT_COLORS[segments.find(s => s.name === buff.source)?.element] || '#6b7280';
    if (buff.duration > 0 && buff.start < totalTime) rows.push({ label: buff.source, start: buff.start, duration: buff.duration, color, type: 'buff', detail: `${STAT_LABELS[buff.stat] || buff.stat} +${buff.value}%` });
  });

  // Find the true end of all content (buffs can extend past totalTime)
  const maxEnd = Math.max(totalTime, ...rows.map(r => r.start + r.duration));
  const timeScale = maxEnd;

  // Group: each on-field segment followed by its buffs
  const ordered = [];
  const usedBuffIdx = new Set();
  looped.forEach(seg => {
    const fieldRow = rows.find(r => r.type === 'field' && r.start === seg.start && r.label === seg.name);
    if (fieldRow) ordered.push(fieldRow);
    const segEnd = seg.start + seg.duration;
    const myBuffs = rows.map((r, i) => ({ ...r, _idx: i }))
      .filter(r => r.type === 'buff' && r.label === seg.name && !usedBuffIdx.has(r._idx)
        && (Math.abs(r.start - seg.start) < 0.5 || Math.abs(r.start - segEnd) < 0.5))
      .sort((a, b) => a.start - b.start);
    myBuffs.forEach(b => { usedBuffIdx.add(b._idx); ordered.push(b); });
  });
  rows.forEach((r, i) => { if (r.type === 'buff' && !usedBuffIdx.has(i)) ordered.push(r); });

  // Ticks — cover full timeScale
  const tickInterval = timeScale <= 10 ? 1 : 5;
  const ticks = [];
  for (let i = 0; i <= timeScale; i += tickInterval) ticks.push(i);
  if (ticks[ticks.length - 1] < timeScale) ticks.push(Math.ceil(timeScale));

  const tableWidth = Math.max(600, timeScale * 24 + 64);

  return (
    <div className="kuro-card" style={{ overflow: 'visible' }}>
      <div style={{
        padding: 'var(--card-padding)',
        overflowX: 'auto',
        WebkitOverflowScrolling: 'touch',
        borderRadius: 16,
      }}>
        <div className="kuro-section-label mb-2">Rotation ({totalTime}s)</div>
        <table style={{ width: tableWidth, borderCollapse: 'collapse', tableLayout: 'fixed' }}>
          <colgroup>
            <col style={{ width: 64 }} />
            <col />
          </colgroup>
          <thead>
            <tr>
              <td />
              <td>
                <div className="relative h-4">
                  {ticks.map(tick => (
                    <span key={tick} className="absolute text-[8px] text-gray-600 -translate-x-1/2"
                      style={{ left: `${(tick / timeScale) * 100}%` }}>{tick}s</span>
                  ))}
                </div>
              </td>
            </tr>
          </thead>
          <tbody>
            {ordered.map((row, i) => {
              const leftPct = (row.start / timeScale) * 100;
              const widthPct = (row.duration / timeScale) * 100;
              const isField = row.type === 'field';
              return (
                <tr key={i}>
                  <td className="align-middle pr-1.5 text-right">
                    <span className={`text-[9px] ${isField ? 'font-bold text-gray-300' : 'text-gray-500'}`}>
                      {isField ? row.label : '↳'}
                    </span>
                  </td>
                  <td className="relative" style={{ height: 22 }}>
                    {ticks.map(tick => (
                      <div key={tick} className="absolute top-0 bottom-0 border-l border-white/5"
                        style={{ left: `${(tick / timeScale) * 100}%` }} />
                    ))}
                    <div className={`absolute flex items-center ${isField ? 'rounded' : 'rounded-sm'}`}
                      style={{
                        left: `${leftPct}%`, width: `${widthPct}%`,
                        top: 1, bottom: 1,
                        background: `${row.color}${isField ? '30' : '18'}`,
                        border: `1px solid ${row.color}${isField ? '60' : '35'}`,
                      }}>
                      <span className={`truncate px-1 ${isField ? 'text-[9px] font-bold' : 'text-[8px]'}`}
                        style={{ color: row.color }}>{row.detail}</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
