// ═══════════════════════════════════════════════════════════════════════════════
// RotationTimeline — Vertical step-by-step rotation with on-field + buff windows
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

  // Group buffs by which segment triggers them (buff.start matches segment end)
  const segmentBuffs = segments.map(seg => {
    const segEnd = seg.start + seg.duration;
    return buffs.filter(b => b.source === seg.name && Math.abs(b.start - seg.start) < 0.5 || b.source === seg.name && Math.abs(b.start - segEnd) < 0.5);
  });

  return (
    <div className="mt-3 kuro-detail-box">
      <div className="kuro-section-label mb-2">
        Rotation ({totalTime}s)
      </div>

      <div className="space-y-1">
        {segments.map((seg, i) => {
          const color = ELEMENT_COLORS[seg.element] || '#6b7280';
          const myBuffs = segmentBuffs[i];
          return (
            <div key={i}>
              {/* On-field step */}
              <div className="flex items-center gap-2">
                <span className="text-[9px] text-gray-600 w-5 text-right flex-shrink-0">{i + 1}</span>
                <div className="flex-1 flex items-center gap-2 px-2.5 py-1.5 rounded-lg"
                  style={{ background: `${color}20`, border: `1px solid ${color}40` }}>
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: color }} />
                  <span className="text-[10px] font-bold flex-1" style={{ color }}>{seg.name}</span>
                  <span className="text-[9px] text-gray-400">{seg.duration}s on-field</span>
                  <span className="text-[9px] text-gray-600">{seg.role}</span>
                </div>
              </div>
              {/* Buffs triggered by this step */}
              {myBuffs.length > 0 && (
                <div className="ml-7 mt-0.5 space-y-0.5 mb-1">
                  {myBuffs.map((buff, j) => (
                    <div key={j} className="flex items-center gap-2 px-2 py-1 rounded"
                      style={{ background: `${color}10`, borderLeft: `2px solid ${color}40` }}>
                      <span className="text-[9px] text-gray-500">↳</span>
                      <span className="text-[9px] font-medium" style={{ color }}>{STAT_LABELS[buff.stat] || buff.stat} +{buff.value}%</span>
                      <span className="text-[8px] text-gray-600">{buff.duration}s</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Loop indicator */}
      {(() => {
        const loopDur = segments.reduce((s, seg) => s + seg.duration, 0);
        const loops = Math.round(totalTime / loopDur * 10) / 10;
        return loopDur < totalTime ? (
          <div className="text-[9px] text-gray-600 text-center mt-2 pt-1.5 border-t border-[var(--border-medium)]/30">
            ↻ Repeats ~{loops}× over {totalTime}s rotation
          </div>
        ) : null;
      })()}
    </div>
  );
}
