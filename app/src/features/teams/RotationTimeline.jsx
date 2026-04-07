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

  return (
    <div className="mt-3 p-3 rounded-xl bg-white/5 border border-[var(--border-medium)]">
      <div className="kuro-section-label mb-2">
        Rotation Timeline ({rotationTimeline.totalTime}s)
      </div>

      {/* Segments bar */}
      <div className="flex rounded-lg overflow-hidden h-6 mb-2">
        {rotationTimeline.segments.map((seg, i) => {
          const pct = (seg.duration / rotationTimeline.totalTime) * 100;
          const color = ELEMENT_COLORS[seg.element] || '#6b7280';
          return (
            <div key={i} className="flex items-center justify-center relative"
              style={{ width: `${pct}%`, background: `${color}30`, borderRight: i < rotationTimeline.segments.length - 1 ? '1px solid rgba(0,0,0,0.3)' : 'none' }}
              title={`${seg.name}: ${seg.duration}s on-field`}>
              <span className="text-[8px] font-bold truncate px-0.5" style={{ color }}>{seg.name}</span>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-x-3 gap-y-1">
        {rotationTimeline.segments.map((seg, i) => {
          const color = ELEMENT_COLORS[seg.element] || '#6b7280';
          return (
            <div key={i} className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full" style={{ background: color }} />
              <span className="text-[10px] text-gray-400">{seg.name} <span className="text-gray-500">{seg.duration}s</span></span>
            </div>
          );
        })}
      </div>

      {/* Buff windows */}
      {rotationTimeline.buffs.length > 0 && (
        <div className="mt-2 pt-2 border-t border-[var(--border-medium)]/30 space-y-1">
          <div className="text-[10px] text-gray-500 mb-1">Buff Windows</div>
          {rotationTimeline.buffs.slice(0, 6).map((buff, i) => {
            const startPct = Math.min((buff.start / rotationTimeline.totalTime) * 100, 100);
            const durPct = Math.min((buff.duration / rotationTimeline.totalTime) * 100, 100 - startPct);
            return (
              <div key={i} className="flex items-center gap-1.5">
                <span className="text-[8px] text-gray-500 w-16 truncate text-right" title={buff.source}>{buff.source}</span>
                <div className="flex-1 h-2.5 rounded-full bg-white/5 relative overflow-hidden">
                  <div className="absolute h-full rounded-full bg-emerald-500/40 flex items-center justify-center" style={{ left: `${startPct}%`, width: `${durPct}%` }}>
                    <span className="text-[7px] text-emerald-300 font-medium truncate px-0.5">{STAT_LABELS[buff.stat] || buff.stat} +{buff.value}%</span>
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
  );
}
