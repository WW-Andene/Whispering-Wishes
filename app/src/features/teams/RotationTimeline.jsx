// ═══════════════════════════════════════════════════════════════════════════════
// RotationTimeline — Visual rotation timeline with on-field segments + buff windows
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

  const totalTime = rotationTimeline.totalTime;
  // Build a color map from character name → element color
  const charColors = {};
  rotationTimeline.segments.forEach(seg => {
    charColors[seg.name] = ELEMENT_COLORS[seg.element] || '#6b7280';
  });

  // Generate tick marks every 5s (or every 1s if total < 10s)
  const tickInterval = totalTime <= 10 ? 1 : 5;
  const ticks = [];
  for (let t = 0; t <= totalTime; t += tickInterval) ticks.push(t);

  return (
    <div className="mt-3 kuro-detail-box">
      <div className="kuro-section-label mb-2">
        Rotation Timeline ({totalTime}s)
      </div>

      {/* Time scale */}
      <div className="relative h-3 mb-0.5">
        {ticks.map(t => (
          <span key={t} className="absolute text-[8px] text-gray-600 -translate-x-1/2" style={{ left: `${(t / totalTime) * 100}%` }}>{t}s</span>
        ))}
      </div>

      {/* Tick grid lines — shared across segments + buffs */}
      <div className="relative">
        {/* Grid lines */}
        <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 1 }}>
          {ticks.map(t => (
            <div key={t} className="absolute top-0 bottom-0 border-l border-white/5" style={{ left: `${(t / totalTime) * 100}%` }} />
          ))}
        </div>

        {/* Segments bar — loop to fill full rotation time */}
        {(() => {
          const looped = [];
          const oneLoop = rotationTimeline.segments;
          const loopDur = oneLoop.reduce((s, seg) => s + seg.duration, 0);
          let t = 0;
          let idx = 0;
          while (t < totalTime && loopDur > 0) {
            const seg = oneLoop[idx % oneLoop.length];
            const remaining = totalTime - t;
            const dur = Math.min(seg.duration, remaining);
            looped.push({ ...seg, duration: dur, order: idx + 1 });
            t += dur;
            idx++;
          }
          return (
            <div className="flex rounded-lg overflow-hidden h-7 mb-1 relative" style={{ zIndex: 2 }}>
              {looped.map((seg, i) => {
                const pct = (seg.duration / totalTime) * 100;
                const color = charColors[seg.name];
                return (
                  <div key={i} className="flex items-center justify-center relative"
                    style={{ width: `${pct}%`, background: `${color}30`, borderRight: i < looped.length - 1 ? '1px solid rgba(0,0,0,0.3)' : 'none' }}
                    title={`#${seg.order} ${seg.name}: ${seg.duration}s on-field`}>
                    <span className="text-[9px] font-bold truncate px-1" style={{ color }}>{seg.name}</span>
                  </div>
                );
              })}
            </div>
          );
        })()}

        {/* Buff windows */}
        {rotationTimeline.buffs.length > 0 && (
          <div className="space-y-1 mt-1 relative" style={{ zIndex: 2 }}>
            {rotationTimeline.buffs.slice(0, 6).map((buff, i) => {
              const startPct = Math.min((buff.start / totalTime) * 100, 100);
              const durPct = Math.min((buff.duration / totalTime) * 100, 100 - startPct);
              const color = charColors[buff.source] || '#10b981';
              return (
                <div key={i} className="flex items-center gap-1.5">
                  <span className="text-[9px] text-gray-500 w-16 truncate text-right flex-shrink-0" title={buff.source}>{buff.source}</span>
                  <div className="flex-1 h-5 rounded bg-white/5 relative overflow-hidden">
                    <div className="absolute h-full rounded flex items-center justify-center" style={{ left: `${startPct}%`, width: `${durPct}%`, background: `${color}30`, border: `1px solid ${color}50` }}>
                      <span className="text-[8px] font-medium truncate px-1" style={{ color }}>{STAT_LABELS[buff.stat] || buff.stat} +{buff.value}%</span>
                    </div>
                  </div>
                </div>
              );
            })}
            {rotationTimeline.buffs.length > 6 && (
              <div className="text-[8px] text-gray-500 text-center mt-0.5">+{rotationTimeline.buffs.length - 6} more</div>
            )}
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2">
        {rotationTimeline.segments.map((seg, i) => {
          const color = charColors[seg.name];
          return (
            <div key={i} className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full" style={{ background: color }} />
              <span className="text-[10px] text-gray-400">{seg.name} <span className="text-gray-500">{seg.duration}s</span></span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
