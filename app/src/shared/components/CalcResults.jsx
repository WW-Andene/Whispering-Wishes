// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — shared/components/CalcResults.jsx
// CalcResultsCard component
// ═══════════════════════════════════════════════════════════════════════════════

import React, { memo } from 'react';
import { Card, CardHeader, CardBody } from './Card.jsx';

// Results card — eliminates ~160 lines of copy-paste across 4 calculator results
const CalcResultsCard = memo(({ title, stats, accentStatClass, copiesLabel, copies, isFeatured = true }) => (
  <Card>
    <CardHeader>{title}</CardHeader>
    <CardBody className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <div className={`kuro-stat ${accentStatClass}`}>
          <div className={`text-3xl kuro-number ${parseFloat(stats.successRate) >= 75 ? 'text-emerald-400' : parseFloat(stats.successRate) >= 50 ? 'text-yellow-300' : parseFloat(stats.successRate) >= 25 ? 'text-orange-400' : 'text-red-400'}`}>{stats.successRate}%</div>
          <div className="text-gray-400 text-[10px] mt-1">P(≥{copies} copies)</div>
        </div>
        <div className="kuro-stat kuro-stat-cyan">
          <div className="text-2xl kuro-number text-cyan-400">~{stats.expectedCopies}</div>
          <div className="text-gray-400 text-[10px] mt-1">Expected Copies</div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="kuro-stat kuro-stat-red">
          <div className="text-xl kuro-number text-red-400">{stats.missingPulls > 0 ? stats.missingPulls : '✓'}</div>
          <div className="text-gray-400 text-[10px] mt-1">{stats.missingPulls > 0 ? 'Convenes Needed (avg)' : 'Ready!'}</div>
        </div>
        <div className="kuro-stat kuro-stat-gray">
          <div className="text-xl kuro-number text-gray-400">{stats.worstCase}</div>
          <div className="text-gray-400 text-[10px] mt-1">Worst Case</div>
        </div>
      </div>
      {isFeatured ? (
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="kuro-stat kuro-stat-purple"><span className="text-purple-400 kuro-number">~{stats.fourStarCount}</span><div className="text-gray-400 text-[10px] mt-0.5">4★ Expected</div></div>
          <div className="kuro-stat kuro-stat-purple"><span className="text-purple-400 kuro-number">~{stats.featuredFourStarCount}</span><div className="text-gray-400 text-[10px] mt-0.5">Featured 4★</div></div>
        </div>
      ) : (
        <div className="kuro-stat kuro-stat-purple text-xs">
          <span className="text-purple-400 kuro-number">~{stats.fourStarCount}</span>
          <div className="text-gray-400 text-[10px] mt-0.5">4★ Expected</div>
        </div>
      )}
      {/* AUDIT-FIX M33: Accurate method label — DP is exact for ≤500 pulls, MC simulation for larger values */}
      <p className="text-[10px] text-gray-400 text-center mx-auto" style={{maxWidth: 'none'}}>Rates: 0.8% base, soft pity 65-79, hard pity 80. DP + Monte Carlo hybrid.</p>
    </CardBody>
  </Card>
));
CalcResultsCard.displayName = 'CalcResultsCard';

export { CalcResultsCard };
