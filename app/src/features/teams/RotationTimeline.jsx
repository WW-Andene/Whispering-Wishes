// ═══════════════════════════════════════════════════════════════════════════════
// RotationTimeline — Gantt-style chronology: rows top-to-bottom, time left-to-right
// ═══════════════════════════════════════════════════════════════════════════════

import React from 'react';
import { Card, CardHeader, CardBody } from '../../shared/components/Card.jsx';

const ELEMENT_COLORS = {
  Glacio: '#06b6d4', Fusion: '#f97316', Electro: '#a855f7',
  Aero: '#10b981', Spectro: '#edaf18', Havoc: '#ec4899',
};

export const STAT_LABELS = {
  atkPct: 'ATK', allDmg: 'All DMG', elemDmg: 'Elem DMG', deepen: 'Deepen',
  basicDmg: 'Basic', heavyDmg: 'Heavy', libDmg: 'Lib', echoDmg: 'Echo',
  skillDmg: 'Skill', critRate: 'CR', critDmg: 'CD', resShred: 'RES↓', defShred: 'DEF↓',
  coordDmg: 'Coord', glacioDmg: 'Glacio', fusionDmg: 'Fusion', electroDmg: 'Electro',
  aeroDmg: 'Aero', spectroDmg: 'Spectro', havocDmg: 'Havoc',
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
    // owner field links echo/weapon buffs back to their character
    const ownerName = buff.owner || buff.source;
    const color = ELEMENT_COLORS[segments.find(s => s.name === ownerName)?.element] || ELEMENT_COLORS[segments.find(s => s.name === buff.source)?.element] || '#6b7280';
    const isEcho = buff.type === 'echo';
    const prefix = isEcho ? '◆ ' : '';
    if (buff.duration > 0) rows.push({ label: buff.source, owner: ownerName, start: buff.start, duration: buff.duration, color, type: 'buff', buffKind: isEcho ? 'echo' : 'char', detail: `${prefix}${STAT_LABELS[buff.stat] || buff.stat} +${buff.value}%` });
  });

  // timeScale = the rotation length itself, not the furthest end of any bar — a buff bar that
  // outlasts the rotation (or carries a bad/sentinel duration) must never stretch the whole chart's
  // scale, or it silently squashes every real on-field segment into an unreadable sliver. Buff bars
  // are clamped to the visible width when rendered below instead.
  const maxEnd = Math.max(totalTime, ...rows.filter(r => r.type === 'field').map(r => r.start + r.duration));

  // Group: each on-field segment followed by its buffs
  const ordered = [];
  const usedBuffIdx = new Set();
  segments.forEach(seg => {
    const fieldRow = rows.find(r => r.type === 'field' && r.start === seg.start && r.label === seg.name);
    if (fieldRow) ordered.push(fieldRow);
    const segEnd = seg.start + seg.duration;
    const myBuffs = rows.map((r, i) => ({ ...r, _idx: i }))
      .filter(r => r.type === 'buff' && (r.owner === seg.name || r.label === seg.name) && !usedBuffIdx.has(r._idx)
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
            const leftPct = Math.min((row.start / maxEnd) * 100, 100);
            // Clamp so a buff outlasting the rotation window is drawn flush to the right edge
            // instead of overflowing the card and forcing horizontal scroll.
            const widthPct = Math.min((row.duration / maxEnd) * 100, 100 - leftPct);
            const isField = row.type === 'field';
            const isEcho = row.buffKind === 'echo';
            return (
              <div key={i} style={{ position: 'relative', height: 22, marginBottom: 2 }}>
                {/* Grid lines */}
                {ticks.map(tick => (
                  <div key={tick} className="absolute top-0 bottom-0 border-l border-white/5"
                    style={{ left: `${(tick / maxEnd) * 100}%` }} />
                ))}
                {/* Label */}
                <span className={`absolute text-2xs ${isField ? 'font-bold text-gray-300' : isEcho ? 'text-gray-400' : 'text-gray-500'}`}
                  style={{ left: 0, top: '50%', transform: 'translateY(-50%)', width: leftPct > 8 ? `${leftPct - 1}%` : undefined, textAlign: 'right', paddingRight: 4, zIndex: 2 }}>
                  {leftPct > 8 ? (isField ? row.label : isEcho ? '◆' : '↳') : ''}
                </span>
                {/* Bar */}
                <div className={`absolute flex items-center ${isField ? 'rounded rotation-segment' : 'rounded-sm buff-bar'}`}
                  style={{
                    left: `${leftPct}%`, width: `${Math.max(widthPct, 1)}%`,
                    top: 1, bottom: 1,
                    background: `${row.color}${isField ? '30' : isEcho ? '14' : '18'}`,
                    border: `1px solid ${row.color}${isField ? '60' : isEcho ? '30' : '35'}`,
                    borderStyle: isEcho ? 'dashed' : 'solid',
                  }}>
                  <span className={`truncate px-1 ${isField ? 'text-2xs font-bold' : 'text-2xs'}`}
                    style={{ color: row.color }}>{isField ? `${row.label} ${row.detail}` : row.detail}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Time scale at bottom */}
        <div style={{ position: 'relative', height: 14, marginTop: 4 }}>
          {ticks.map(tick => (
            <span key={tick} className="absolute text-2xs text-gray-600 -translate-x-1/2"
              style={{ left: `${(tick / maxEnd) * 100}%` }}>{tick}s</span>
          ))}
        </div>

        {/* Legend */}
        {ordered.some(r => r.buffKind === 'echo') && (
          <div className="flex items-center gap-3 mt-3 pt-2 border-t border-white/5">
            <span className="text-2xs text-gray-500 flex items-center gap-1">
              <span className="inline-block w-3 h-[6px] rounded-sm border border-white/30 bg-white/15" /> ↳ Char/Set/Weapon
            </span>
            <span className="text-2xs text-gray-500 flex items-center gap-1">
              <span className="inline-block w-3 h-[6px] rounded-sm border border-dashed border-white/25 bg-white/10" /> ◆ Echo Skill
            </span>
          </div>
        )}
      </CardBody>
    </Card>
  );
}
