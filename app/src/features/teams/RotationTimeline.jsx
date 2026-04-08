// ═══════════════════════════════════════════════════════════════════════════════
// RotationTimeline — Gantt-style chronology: rows top-to-bottom, time left-to-right
// ═══════════════════════════════════════════════════════════════════════════════

import React from 'react';
import { Card, CardHeader, CardBody } from '../../shared/components/Card.jsx';

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

  // One cycle only — no looping
  const rows = [];
  segments.forEach(seg => {
    rows.push({ label: seg.name, start: seg.start, duration: seg.duration, color: ELEMENT_COLORS[seg.element] || '#6b7280', type: 'field', detail: `${seg.duration}s` });
  });
  buffs.forEach(buff => {
    const color = ELEMENT_COLORS[segments.find(s => s.name === buff.source)?.element] || '#6b7280';
    if (buff.duration > 0) rows.push({ label: buff.source, start: buff.start, duration: buff.duration, color, type: 'buff', detail: `${STAT_LABELS[buff.stat] || buff.stat} +${buff.value}%` });
  });

  // timeScale = furthest end of any bar
  const maxEnd = Math.max(totalTime, ...rows.map(r => r.start + r.duration));

  // Group: each on-field segment followed by its buffs
  const ordered = [];
  const usedBuffIdx = new Set();
  segments.forEach(seg => {
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

  // Ticks
  const tickInterval = maxEnd <= 10 ? 1 : 5;
  const ticks = [];
  for (let i = 0; i <= maxEnd; i += tickInterval) ticks.push(i);
  if (ticks[ticks.length - 1] < Math.ceil(maxEnd)) ticks.push(Math.ceil(maxEnd));

  return (
    <Card>
      <CardHeader>Rotation ({totalTime}s)</CardHeader>
      <CardBody>
        {/* All percentage-based — no fixed width, no scroll, fits any container */}
        <div style={{ position: 'relative' }}>
          {ordered.map((row, i) => {
            const leftPct = (row.start / maxEnd) * 100;
            const widthPct = (row.duration / maxEnd) * 100;
            const isField = row.type === 'field';
            return (
              <div key={i} style={{ position: 'relative', height: 22, marginBottom: 2 }}>
                {/* Grid lines */}
                {ticks.map(tick => (
                  <div key={tick} className="absolute top-0 bottom-0 border-l border-white/5"
                    style={{ left: `${(tick / maxEnd) * 100}%` }} />
                ))}
                {/* Label */}
                <span className={`absolute text-[9px] ${isField ? 'font-bold text-gray-300' : 'text-gray-500'}`}
                  style={{ left: 0, top: '50%', transform: 'translateY(-50%)', width: leftPct > 8 ? `${leftPct - 1}%` : undefined, textAlign: 'right', paddingRight: 4, zIndex: 2 }}>
                  {leftPct > 8 ? (isField ? row.label : '↳') : ''}
                </span>
                {/* Bar */}
                <div className={`absolute flex items-center ${isField ? 'rounded' : 'rounded-sm'}`}
                  style={{
                    left: `${leftPct}%`, width: `${Math.max(widthPct, 1)}%`,
                    top: 1, bottom: 1,
                    background: `${row.color}${isField ? '30' : '18'}`,
                    border: `1px solid ${row.color}${isField ? '60' : '35'}`,
                  }}>
                  <span className={`truncate px-1 ${isField ? 'text-[9px] font-bold' : 'text-[8px]'}`}
                    style={{ color: row.color }}>{isField ? `${row.label} ${row.detail}` : row.detail}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Time scale at bottom */}
        <div style={{ position: 'relative', height: 14, marginTop: 4 }}>
          {ticks.map(tick => (
            <span key={tick} className="absolute text-[8px] text-gray-600 -translate-x-1/2"
              style={{ left: `${(tick / maxEnd) * 100}%` }}>{tick}s</span>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}
