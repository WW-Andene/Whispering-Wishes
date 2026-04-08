// ═══════════════════════════════════════════════════════════════════════════════
// RotationTimeline — Gantt chronology matching Planner style (percentage-based)
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
    const clampedDur = Math.min(buff.duration, totalTime - buff.start);
    if (clampedDur > 0) rows.push({ label: buff.source, start: buff.start, duration: clampedDur, color, type: 'buff', detail: `${STAT_LABELS[buff.stat] || buff.stat} +${buff.value}%` });
  });

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

  // Tick marks
  const tickInterval = totalTime <= 10 ? 1 : 5;
  const ticks = [];
  for (let i = 0; i <= totalTime; i += tickInterval) ticks.push(i);

  return (
    <div>
      <div style={{ fontSize: 'var(--font-base)', fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--text-heading)', marginBottom: 'var(--space-sm)' }}>
        Rotation ({totalTime}s)
      </div>

      {/* Time scale — same pattern as Planner chronology day scale */}
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${totalTime}, 1fr)`, marginBottom: '4px' }}>
        {Array.from({ length: totalTime }, (_, i) => {
          const sec = i + 1;
          const show = sec === 1 || sec % tickInterval === 0 || sec === totalTime;
          return <span key={i} style={{ fontSize: 'var(--font-sm)', color: 'var(--text-disabled)', fontFamily: 'var(--font-data)', textAlign: 'center' }}>{show ? sec : ''}</span>;
        })}
      </div>

      {/* Bars — same pattern as Planner chronology bars */}
      <div style={{ position: 'relative' }}>
        {ordered.map((row, i) => {
          const leftPct = (row.start / totalTime) * 100;
          const widthPct = (row.duration / totalTime) * 100;
          const isField = row.type === 'field';
          return (
            <div key={i} title={`${row.label}: ${row.detail}`} style={{ position: 'relative', height: 'var(--size-icon-btn)', marginBottom: '2px' }}>
              <div style={{
                position: 'absolute', left: `${leftPct}%`, width: `${widthPct}%`,
                height: '100%', borderRadius: 'var(--radius-sm)',
                background: isField
                  ? `linear-gradient(to right, ${row.color}45, ${row.color}28)`
                  : `linear-gradient(to right, ${row.color}25, ${row.color}15)`,
                border: `1px solid ${row.color}${isField ? '90' : '50'}`,
                boxShadow: isField ? `0 0 6px ${row.color}30` : 'none',
                display: 'flex', alignItems: 'center', padding: '0 4px',
                overflow: 'hidden', minWidth: '0',
              }}>
                <span style={{
                  fontSize: 'var(--font-sm)', color: row.color, fontWeight: isField ? 700 : 500,
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flex: 1,
                }}>
                  {isField ? row.label : row.detail}
                </span>
                <span style={{
                  fontSize: 'var(--font-xs)', color: row.color, fontFamily: 'var(--font-data)',
                  opacity: 0.6, marginLeft: '4px', flexShrink: 0,
                }}>
                  {isField ? `${row.duration}s` : row.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
