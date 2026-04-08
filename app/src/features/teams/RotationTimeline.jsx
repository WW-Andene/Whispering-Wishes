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

  // Build rows: each row is a step (on-field) or a buff, ordered by start time
  const rows = [];

  // On-field segments
  looped.forEach((seg, i) => {
    const color = ELEMENT_COLORS[seg.element] || '#6b7280';
    rows.push({
      label: seg.name,
      start: seg.start,
      duration: seg.duration,
      color,
      type: 'field',
      detail: `${seg.duration}s`,
    });
  });

  // Buffs
  buffs.forEach(buff => {
    const color = ELEMENT_COLORS[segments.find(s => s.name === buff.source)?.element] || '#6b7280';
    const clampedDur = Math.min(buff.duration, totalTime - buff.start);
    if (clampedDur > 0) {
      rows.push({
        label: buff.source,
        start: buff.start,
        duration: clampedDur,
        color,
        type: 'buff',
        detail: `${STAT_LABELS[buff.stat] || buff.stat} +${buff.value}%`,
      });
    }
  });

  // Group: each on-field segment followed by its buffs sorted by start time
  const ordered = [];
  const usedBuffIdx = new Set();
  // For each looped segment, attach its buffs right after
  looped.forEach(seg => {
    const fieldRow = rows.find(r => r.type === 'field' && r.start === seg.start && r.label === seg.name);
    if (fieldRow) ordered.push(fieldRow);
    // Find buffs from this character that fire during/after this segment
    const segEnd = seg.start + seg.duration;
    const myBuffs = rows
      .map((r, idx) => ({ ...r, _idx: idx }))
      .filter(r => r.type === 'buff' && r.label === seg.name && !usedBuffIdx.has(r._idx)
        && (Math.abs(r.start - seg.start) < 0.5 || Math.abs(r.start - segEnd) < 0.5))
      .sort((a, b) => a.start - b.start);
    myBuffs.forEach(b => { usedBuffIdx.add(b._idx); ordered.push(b); });
  });
  // Append any remaining buffs not attached to a segment
  rows.forEach((r, idx) => { if (r.type === 'buff' && !usedBuffIdx.has(idx)) ordered.push(r); });

  // Time axis ticks
  const tickInterval = totalTime <= 10 ? 1 : 5;
  const ticks = [];
  for (let i = 0; i <= totalTime; i += tickInterval) ticks.push(i);

  return (
    <div className="mt-3 kuro-detail-box">
      <div className="kuro-section-label mb-2">
        Rotation ({totalTime}s)
      </div>

      {/* Time axis */}
      <div className="flex">
        <div className="w-16 flex-shrink-0" />
        <div className="flex-1 relative h-3 mb-0.5">
          {ticks.map(tick => (
            <span key={tick} className="absolute text-[8px] text-gray-600 -translate-x-1/2"
              style={{ left: `${(tick / totalTime) * 100}%` }}>{tick}s</span>
          ))}
        </div>
      </div>

      {/* Rows */}
      <div className="space-y-0.5">
        {ordered.map((row, i) => {
          const leftPct = (row.start / totalTime) * 100;
          const widthPct = (row.duration / totalTime) * 100;
          const isField = row.type === 'field';
          return (
            <div key={i} className="flex items-center">
              <span className={`text-[9px] w-16 truncate text-right pr-2 flex-shrink-0 ${isField ? 'font-bold text-gray-300' : 'text-gray-500'}`}>
                {isField ? row.label : `↳ ${row.label}`}
              </span>
              <div className="flex-1 relative h-5">
                {/* Grid lines */}
                {ticks.map(tick => (
                  <div key={tick} className="absolute top-0 bottom-0 border-l border-white/5"
                    style={{ left: `${(tick / totalTime) * 100}%` }} />
                ))}
                {/* Bar */}
                <div className={`absolute h-full flex items-center ${isField ? 'rounded' : 'rounded-sm'}`}
                  style={{
                    left: `${leftPct}%`,
                    width: `${widthPct}%`,
                    background: `${row.color}${isField ? '30' : '18'}`,
                    border: `1px solid ${row.color}${isField ? '60' : '35'}`,
                  }}>
                  <span className={`truncate px-1 ${isField ? 'text-[9px] font-bold' : 'text-[8px]'}`}
                    style={{ color: row.color }}>{row.detail}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
