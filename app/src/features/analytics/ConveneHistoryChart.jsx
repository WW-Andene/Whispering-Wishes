// ═══════════════════════════════════════════════════════════════════════════════
// ConveneHistoryChart — SVG line chart with banner filters, time range, pagination
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, TrendingUp } from 'lucide-react';
import { Card, CardHeader, CardBody } from '../../shared/components/Card.jsx';
import { t, formatNumber, formatDate } from '../../utils/i18n.js';

const BANNER_FILTERS = [
  ['all', 'analytics.history.banners.all'],
  ['featured', 'analytics.history.banners.featured'],
  ['weapon', 'analytics.history.banners.weapon'],
  ['stdChar', 'analytics.history.banners.stdChar'],
  ['stdWeap', 'analytics.history.banners.stdWeap'],
];

const TIME_RANGES = ['daily', 'weekly', 'monthly', 'yearly'];
const VISIBLE_COUNTS = { daily: 14, weekly: 12, monthly: 6, yearly: 6 };

const groupData = (chartHist, range) => {
  const grouped = {};
  chartHist.forEach(p => {
    if (!p.timestamp) return;
    const date = new Date(p.timestamp);
    let key;
    if (range === 'daily') {
      key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    } else if (range === 'weekly') {
      const target = new Date(date.valueOf());
      target.setDate(target.getDate() - ((target.getDay() + 6) % 7) + 3);
      const jan4 = new Date(target.getFullYear(), 0, 4);
      const weekNum = 1 + Math.round(((target.getTime() - jan4.getTime()) / 86400000 - 3 + ((jan4.getDay() + 6) % 7)) / 7);
      key = `${target.getFullYear()}-W${String(Math.max(1, weekNum)).padStart(2, '0')}`;
    } else if (range === 'monthly') {
      key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    } else {
      key = `${date.getFullYear()}`;
    }
    if (!grouped[key]) grouped[key] = { pulls: 0, fiveStars: 0 };
    grouped[key].pulls++;
    if (p.rarity === 5) grouped[key].fiveStars++;
  });
  return grouped;
};

const formatLabel = (key, range) => {
  if (range === 'daily') {
    return formatDate(new Date(key + 'T12:00:00'), { month: 'short', day: 'numeric' });
  } else if (range === 'weekly') {
    return key.split('-')[1];
  } else if (range === 'monthly') {
    return formatDate(new Date(key + '-15T12:00:00'), { month: 'short' });
  }
  return key;
};

function ConveneHistoryChart({ statsTabData }) {
  const [chartRange, setChartRange] = useState('monthly');
  const [chartOffset, setChartOffset] = useState(9999);
  const [chartBanner, setChartBanner] = useState('all');

  const chartHist = chartBanner === 'all' ? statsTabData.allHist
    : chartBanner === 'featured' ? statsTabData.featuredHist
    : chartBanner === 'weapon' ? statsTabData.weaponHist
    : chartBanner === 'stdChar' ? statsTabData.stdCharHist
    : statsTabData.stdWeapHist;

  const grouped = groupData(chartHist, chartRange);
  const allData = Object.entries(grouped)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([key, data]) => ({ key, label: formatLabel(key, chartRange), pulls: data.pulls }));

  const maxVisible = VISIBLE_COUNTS[chartRange];
  const maxOffset = Math.max(0, allData.length - maxVisible);
  const clampedOffset = Math.min(chartOffset, maxOffset);
  const chartData = allData.slice(clampedOffset, clampedOffset + maxVisible);
  const canGoLeft = clampedOffset > 0;
  const canGoRight = clampedOffset < maxOffset;

  return (
    <Card className="stats-full-width">
      <CardHeader>
        <span className="flex items-center gap-1.5"><TrendingUp size={14} /> {t('analytics.history.title')}</span>
      </CardHeader>
      <CardBody>
        <div className="flex gap-1 mb-2 flex-wrap">
          {BANNER_FILTERS.map(([val, labelKey]) => (
            <button
              key={val}
              onClick={() => { setChartBanner(val); setChartOffset(9999); }}
              className={`kuro-chip ${chartBanner === val ? 'active-gold' : ''}`}
            >
              {t(labelKey)}
            </button>
          ))}
        </div>
        <div className="flex gap-1 mb-3 flex-wrap">
          {TIME_RANGES.map(r => (
            <button
              key={r}
              onClick={() => { setChartRange(r); setChartOffset(9999); }}
              className={`kuro-chip ${chartRange === r ? 'active-gold' : ''}`}
            >
              {t(`analytics.history.ranges.${r}`)}
            </button>
          ))}
        </div>

        {chartHist.length < 10 ? (
          <p className="kuro-empty-state text-gray-400 text-base text-center py-4">{t('analytics.history.noDataFilter')}</p>
        ) : allData.length < 2 ? (
          <p className="kuro-empty-state text-gray-400 text-base text-center py-4">{t('analytics.history.noDataCombination')}</p>
        ) : (
          <>
            <div className="flex items-center justify-between mb-3">
              <div />
              {allData.length > maxVisible && (
                <div className="flex gap-1">
                  <button
                    onClick={() => setChartOffset(Math.max(0, clampedOffset - Math.floor(maxVisible / 2)))}
                    disabled={!canGoLeft}
                    className={`p-1 rounded transition-colors ${canGoLeft ? 'bg-white/10 text-gray-300 hover:bg-white/20' : 'bg-white/5 text-gray-500'}`}
                  >
                    <ChevronLeft size={14} />
                  </button>
                  <button
                    onClick={() => setChartOffset(Math.min(maxOffset, clampedOffset + Math.floor(maxVisible / 2)))}
                    disabled={!canGoRight}
                    className={`p-1 rounded transition-colors ${canGoRight ? 'bg-white/10 text-gray-300 hover:bg-white/20' : 'bg-white/5 text-gray-500'}`}
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              )}
            </div>
            <div className="h-32">
              <div className="sr-only">{t('analytics.history.srSummary', { points: chartData?.map(d => t('analytics.history.srDataPoint', { label: d.label, count: formatNumber(d.pulls) })).join(', ') })}</div>
              <ChartSvg chartData={chartData} />
            </div>
            {allData.length > maxVisible && (
              <div className="text-center text-sm text-gray-400 mt-1">
                {t('analytics.history.pageRange', { start: formatNumber(clampedOffset + 1), end: formatNumber(Math.min(clampedOffset + maxVisible, allData.length)), total: formatNumber(allData.length) })}
              </div>
            )}
          </>
        )}
      </CardBody>
    </Card>
  );
}

function ChartSvg({ chartData }) {
  if (!chartData || chartData.length === 0) return null;
  const W = 400, H = 128, PAD = { top: 10, right: 10, bottom: 20, left: 35 };
  const cW = W - PAD.left - PAD.right, cH = H - PAD.top - PAD.bottom;
  const maxVal = Math.max(...chartData.map(d => d.pulls), 1);
  const yTicks = [0, Math.round(maxVal / 2), maxVal];
  const pts = chartData.map((d, i) => ({
    x: PAD.left + (chartData.length > 1 ? (i / (chartData.length - 1)) * cW : cW / 2),
    y: PAD.top + cH - (d.pulls / maxVal) * cH,
    ...d,
  }));
  const line = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
  const area = `${line} L${pts[pts.length - 1].x},${PAD.top + cH} L${pts[0].x},${PAD.top + cH} Z`;
  const xStep = Math.max(1, Math.ceil(chartData.length / 6));

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full" preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id="pullGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(237,175,24,0.22)" />
          <stop offset="100%" stopColor="rgba(237,175,24,0)" />
        </linearGradient>
      </defs>
      {yTicks.map(v => {
        const y = PAD.top + cH - (v / maxVal) * cH;
        return (
          <g key={v}>
            <line x1={PAD.left} x2={W - PAD.right} y1={y} y2={y} stroke="rgba(255,255,255,0.04)" strokeDasharray="3 3" />
            <text x={PAD.left - 4} y={y + 3} textAnchor="end" fill="#8892a4" fontSize="9" fontFamily="var(--font-data)">{v}</text>
          </g>
        );
      })}
      <path d={area} fill="url(#pullGrad)" />
      <path d={line} fill="none" stroke="rgba(237,175,24,0.4)" strokeWidth="1.5" />
      {pts.map((p, i) => i % xStep === 0 ? (
        <text key={i} x={p.x} y={H - 4} textAnchor="middle" fill="#8892a4" fontSize="9" fontFamily="var(--font-data)">{p.label}</text>
      ) : null)}
      {pts.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r="8" fill="transparent" className="cursor-pointer">
            <title>{t('analytics.history.tooltipConvenes', { label: p.label, count: formatNumber(p.pulls) })}</title>
          </circle>
          <circle cx={p.x} cy={p.y} r="2" fill="rgba(237,175,24,0.6)" className="pointer-events-none" />
        </g>
      ))}
    </svg>
  );
}

export default React.memo(ConveneHistoryChart);
