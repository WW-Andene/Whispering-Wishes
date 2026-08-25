// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — features/calculator/CalcResults.jsx
// CalcResultsCard component
// ═══════════════════════════════════════════════════════════════════════════════

import React, { memo } from 'react';
import { Card, CardHeader, CardBody } from '../../shared/components/Card.jsx';
import { t } from '../../utils/i18n.js';

const getSuccessColor = (rate) => {
  const r = parseFloat(rate);
  if (r >= 75) return 'text-emerald-400';
  if (r >= 50) return 'text-yellow-300';
  if (r >= 25) return 'text-orange-400';
  return 'text-red-400';
};

// Results card — eliminates ~160 lines of copy-paste across 4 calculator results
const CalcResultsCard = memo(({ title, stats, accentStatClass, copiesLabel, copies, isFeatured = true }) => (
  <Card>
    <CardHeader>{title}</CardHeader>
    <CardBody className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <div className={`kuro-stat prob-result ${accentStatClass}`}>
          <div className={`text-4xl kuro-number ${getSuccessColor(stats.successRate)}`}>{stats.successRateBelow01 ? '<0.1' : stats.successRate}%</div>
          <div className="text-gray-400 text-sm mt-1">{t('calculator.resultsCard.successProbability', { copies })}</div>
        </div>
        <div className="kuro-stat kuro-stat-cyan">
          <div className="text-3xl kuro-number text-cyan-400">~{stats.expectedCopies}</div>
          <div className="text-gray-400 text-sm mt-1">{t('calculator.resultsCard.expectedCopies')}</div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="kuro-stat kuro-stat-red">
          <div className="text-2xl kuro-number text-red-400">{stats.missingPulls > 0 ? stats.missingPulls : '✓'}</div>
          <div className="text-gray-400 text-sm mt-1">{stats.missingPulls > 0 ? t('calculator.resultsCard.convenesNeededAvg') : t('calculator.resultsCard.ready')}</div>
        </div>
        <div className="kuro-stat kuro-stat-gray">
          <div className="text-2xl kuro-number text-gray-400">{stats.worstCase}</div>
          <div className="text-gray-400 text-sm mt-1">{t('calculator.resultsCard.worstCase')}</div>
        </div>
      </div>
      {isFeatured ? (
        <div className="grid grid-cols-2 gap-2 text-base">
          <div className="kuro-stat kuro-stat-purple">
            <span className="text-purple-400 kuro-number">~{stats.featuredFourStarCount}</span>
            {stats.fourStarTarget > 0 ? (
              <div className={`text-sm mt-0.5 ${stats.featuredFourStarCount >= stats.fourStarTarget ? 'text-emerald-400' : 'text-orange-400'}`}>
                {t('calculator.resultsCard.featured4Star', { count: stats.featuredFourStarCount, target: stats.fourStarTarget })}
              </div>
            ) : (
              <div className="text-gray-400 text-sm mt-0.5">{t('calculator.resultsCard.featured4StarNoTarget')}</div>
            )}
          </div>
          <div className="kuro-stat kuro-stat-purple">
            <span className="text-purple-400 kuro-number">~{stats.fourStarCount}</span>
            <div className="text-gray-400 text-sm mt-0.5">{t('calculator.resultsCard.fourStarTotal')}</div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2 text-base">
          <div className="kuro-stat kuro-stat-purple">
            <span className="text-purple-400 kuro-number">~{stats.fourStarCount}</span>
            {stats.fourStarTarget > 0 ? (
              <div className={`text-sm mt-0.5 ${stats.fourStarCount >= stats.fourStarTarget ? 'text-emerald-400' : 'text-orange-400'}`}>
                {t('calculator.resultsCard.fourStarExpected', { count: stats.fourStarCount, target: stats.fourStarTarget })}
              </div>
            ) : (
              <div className="text-gray-400 text-sm mt-0.5">{t('calculator.resultsCard.fourStarExpectedNoTarget')}</div>
            )}
          </div>
          {stats.missingPulls4Star > 0 && (
            <div className="kuro-stat kuro-stat-purple">
              <span className="text-orange-400 kuro-number">{stats.missingPulls4Star}</span>
              <div className="text-orange-400 text-sm mt-0.5">{t('calculator.resultsCard.fourStarConvenesNeeded')}</div>
            </div>
          )}
        </div>
      )}
      {stats.missingPulls4Star > 0 && stats.missingPulls4Star > stats.missingPulls5Star && (
        <p className="text-sm text-orange-400 text-center">{t('calculator.resultsCard.fourStarNeedsMore')}</p>
      )}
      {/* AUDIT-FIX M33: Accurate method label — DP is exact for ≤500 pulls, MC simulation for larger values */}
      <p className="text-sm text-gray-400 text-center mx-auto" style={{maxWidth: 'none'}}>{t('calculator.resultsCard.ratesDisclosure')}</p>
    </CardBody>
  </Card>
));
CalcResultsCard.displayName = 'CalcResultsCard';

export { CalcResultsCard };
