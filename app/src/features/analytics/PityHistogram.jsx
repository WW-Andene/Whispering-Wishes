// ═══════════════════════════════════════════════════════════════════════════════
// PityHistogram — 5★ pity distribution bar chart with neon glow styling
// ═══════════════════════════════════════════════════════════════════════════════

import React from 'react';
import { BarChart3 } from 'lucide-react';
import { Card, CardHeader, CardBody } from '../../shared/components/Card.jsx';

const getBarColor = (label) => {
  const start = parseInt(label.split('-')[0], 10);
  if (start <= 20) return '#22c55e';
  if (start <= 40) return '#4ade80';
  if (start <= 50) return '#edaf18';
  if (start <= 60) return '#f97316';
  return '#ef4444';
};

const PITY_ZONES = [
  { color: '#22c55e', label: '1-20' },
  { color: '#4ade80', label: '21-40' },
  { color: '#edaf18', label: '41-50' },
  { color: '#f97316', label: '51-60' },
  { color: '#ef4444', label: '61-80' },
];

function PityHistogram({ statsTabData }) {
  if (!statsTabData.histogramStats) {
    return (
      <Card>
        <CardHeader>
          <span className="flex items-center gap-1.5"><BarChart3 size={14} /> 5★ Pity Distribution</span>
        </CardHeader>
        <CardBody>
          <p className="text-gray-400 text-base text-center py-4">Need 2+ five-star Convenes to show distribution</p>
        </CardBody>
      </Card>
    );
  }

  const { fiveStars, histogramBuckets: buckets, allBucketLabels: allBuckets, histogramStats } = statsTabData;
  const { maxCount, avgPity, minPity, maxPity } = histogramStats;

  return (
    <Card>
      <CardHeader action={<span className="text-gray-500 text-sm">{fiveStars.length} Convenes</span>}>
        <span className="flex items-center gap-1.5"><BarChart3 size={14} /> 5★ Pity Distribution</span>
      </CardHeader>
      <CardBody>
        <div className="sr-only">
          Pity distribution: {allBuckets.map(label => `${label} Convenes: ${buckets[label] || 0}`).join(', ')}.
          Average pity: {avgPity}, range: {minPity} to {maxPity}.
        </div>
        <div className="flex items-end gap-1.5 h-24 pt-6 mb-2" aria-hidden="true">
          {allBuckets.map(label => {
            const count = buckets[label] || 0;
            const height = maxCount > 0 ? (count / maxCount) * 100 : 0;
            const color = getBarColor(label);
            return (
              <div key={label} className="flex-1 flex flex-col items-center" title={`${label} pity: ${count} Convene${count !== 1 ? 's' : ''}`}>
                <div className="w-full relative" style={{ height: '72px' }}>
                  {count > 0 && (
                    <div
                      className="absolute left-0 right-0 text-sm text-center font-bold kuro-number"
                      style={{
                        bottom: `${height}%`,
                        marginBottom: '4px',
                        color: color,
                        textShadow: `0 0 8px ${color}`,
                      }}
                    >
                      {count}
                    </div>
                  )}
                  <div
                    className="absolute bottom-0 left-1 right-1 rounded-t transition-all histogram-bar"
                    style={{
                      height: `${height}%`,
                      minHeight: count > 0 ? '8px' : '0',
                      background: `linear-gradient(to top, ${color}40, ${color}20)`,
                      border: count > 0 ? `1px solid ${color}90` : 'none',
                      borderBottom: 'none',
                      boxShadow: count > 0 ? `0 0 12px ${color}50, inset 0 0 15px ${color}30` : 'none',
                    }}
                  />
                  {count > 0 && (
                    <div
                      className="absolute bottom-0 left-1 right-1 h-[2px] rounded-full"
                      style={{
                        background: color,
                        boxShadow: `0 0 8px ${color}, 0 0 16px ${color}80`,
                      }}
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex gap-1.5">
          {allBuckets.map(label => (
            <div key={label} className="flex-1 text-sm text-gray-400 text-center">{label}</div>
          ))}
        </div>

        <div className="mt-3 pt-3 border-t border-[var(--border-medium)] grid grid-cols-3 gap-2 text-center">
          <div>
            <div className="text-emerald-400 font-bold text-xl kuro-number kuro-tshadow-glow-emerald">{minPity}</div>
            <div className="text-gray-400 text-sm">Lowest</div>
          </div>
          <div>
            <div className="text-yellow-400 font-bold text-xl kuro-number kuro-tshadow-glow-gold">{avgPity}</div>
            <div className="text-gray-400 text-sm">Average</div>
          </div>
          <div>
            <div className="text-red-400 font-bold text-xl kuro-number kuro-tshadow-glow-red">{maxPity}</div>
            <div className="text-gray-400 text-sm">Highest</div>
          </div>
        </div>

        <div className="mt-2 flex items-center justify-center gap-2 text-sm flex-wrap">
          {PITY_ZONES.map(z => (
            <span key={z.label} className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full" style={{ background: z.color, boxShadow: `0 0 6px ${z.color}` }} />
              <span className="text-gray-400">{z.label}</span>
            </span>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}

export default React.memo(PityHistogram);
