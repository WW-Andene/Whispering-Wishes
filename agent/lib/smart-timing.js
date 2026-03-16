// ═══════════════════════════════════════════════════════════════════════════════
// WW Update Agent — Smart Timing
// Predicts optimal times to check for banner updates based on historical patterns
// ═══════════════════════════════════════════════════════════════════════════════

import { log } from './log.js';

// Kuro Games typically releases banners at specific times
const TYPICAL_BANNER_TIMES = [
  { hour: 2, minute: 0, timezone: 'UTC' }, // Common server reset time
  { hour: 10, minute: 0, timezone: 'UTC' }, // Maintenance end time
  { hour: 14, minute: 0, timezone: 'UTC' }, // Afternoon update slot
];

// Version cycles are typically 6 weeks (42 days)
const TYPICAL_VERSION_CYCLE_DAYS = 42;
const TYPICAL_PHASE_CYCLE_DAYS = 21;

/**
 * Calculate the next optimal check time based on current banner end date.
 * Returns ISO timestamp of when to next check for updates.
 */
export function calculateNextCheckTime(currentBannerEndDate, bufferHours = 36) {
  if (!currentBannerEndDate) return null;
  
  const endDate = new Date(currentBannerEndDate);
  const checkTime = new Date(endDate.getTime() - (bufferHours * 3600000));
  
  // If check time is in the past, return immediate check
  if (checkTime.getTime() < Date.now()) {
    return new Date().toISOString();
  }
  
  return checkTime.toISOString();
}

/**
 * Predict likely banner release dates based on historical patterns.
 */
export function predictNextBannerDates(lastBannerHistory) {
  if (!lastBannerHistory || lastBannerHistory.length < 2) {
    return { phase2Likely: null, nextVersionLikely: null };
  }
  
  const recent = lastBannerHistory.slice(-4); // Last 4 banners
  const phases = recent.filter(b => b.phase === 1);
  
  if (phases.length < 2) return { phase2Likely: null, nextVersionLikely: null };
  
  // Calculate average time between version starts
  const intervals = [];
  for (let i = 1; i < phases.length; i++) {
    const prev = new Date(phases[i-1].startDate);
    const curr = new Date(phases[i].startDate);
    intervals.push(curr.getTime() - prev.getTime());
  }
  
  const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
  const lastPhase1 = phases[phases.length - 1];
  const lastStart = new Date(lastPhase1.startDate);
  
  const predictedNextVersion = new Date(lastStart.getTime() + avgInterval);
  const predictedPhase2 = new Date(lastStart.getTime() + (TYPICAL_PHASE_CYCLE_DAYS * 24 * 3600000));
  
  return {
    phase2Likely: predictedPhase2.toISOString(),
    nextVersionLikely: predictedNextVersion.toISOString()
  };
}

/**
 * Check if current time is within a "high probability" window for banner updates.
 */
export function isHighProbabilityWindow() {
  const now = new Date();
  const utcHour = now.getUTCHours();
  
  // Check if current UTC hour matches typical release times (±1 hour window)
  return TYPICAL_BANNER_TIMES.some(time => 
    Math.abs(utcHour - time.hour) <= 1
  );
}

/**
 * Suggest run frequency based on how close we are to predicted banner dates.
 */
export function suggestRunFrequency(currentBannerEndDate, predictions) {
  if (!currentBannerEndDate) return 'daily';
  
  const now = Date.now();
  const endTime = new Date(currentBannerEndDate).getTime();
  const hoursUntilEnd = (endTime - now) / 3600000;
  
  if (hoursUntilEnd < 24) return '4-hourly'; // Very close to end
  if (hoursUntilEnd < 72) return '12-hourly'; // Close to end  
  if (hoursUntilEnd < 168) return 'daily'; // Within a week
  return 'weekly'; // Far from end
}

export function logTimingAnalysis(currentBanners, predictions) {
  const frequency = suggestRunFrequency(currentBanners.endDate, predictions);
  const isHighProb = isHighProbabilityWindow();
  
  log.info(`Timing analysis: ${frequency} runs suggested`);
  if (isHighProb) {
    log.info('Current time is in high-probability window for banner updates');
  }
  
  if (predictions.phase2Likely) {
    const phase2Date = new Date(predictions.phase2Likely).toLocaleDateString();
    log.dim(`Predicted Phase 2: ${phase2Date}`);
  }
}