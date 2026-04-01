// ═══════════════════════════════════════════════════════════════════════════════
// WW-B — User Scenario Tests
// Simulates real user actions to find bugs, edge cases, and UX issues.
// Like a beta tester thinking through usage patterns.
// ═══════════════════════════════════════════════════════════════════════════════

import { ask, extractJSON } from './ai.js';
import { log } from './log.js';

const SYSTEM = `You are WW-B, a QA tester for a Wuthering Waves companion web app. You simulate user scenarios to find bugs and edge cases.

For each issue found, return JSON:
{"issues": [{"severity": "critical|major|minor|nit", "description": "string", "location": "file or component", "trigger": "how a user hits this", "suggestion": "how to fix"}]}

Return {"issues": []} if the scenario looks clean.`;

/**
 * Run all scenario tests against the current app state.
 * Returns array of all issues found.
 */
export async function runScenarios(state) {
  log.info('Running user scenario simulations...');

  const context = [
    `App version: ${state.appVersion}`,
    `Characters: ${state.characterNames?.length || 0}`,
    `Weapons: ${state.weaponNames?.length || 0}`,
    `Banner: v${state.banners?.version} p${state.banners?.phase}, ends ${state.banners?.endDate}`,
    `Events: ${Object.keys(state.events || {}).join(', ')}`,
  ].join('\n');

  const hoursLeft = ((new Date(state.banners?.endDate).getTime() - Date.now()) / 3600000).toFixed(0);

  const scenarios = [
    {
      name: 'New player first launch',
      prompt: `A brand new player opens the app. No pull data, no teams, empty collection.
Check: blank screens, NaN/undefined values, missing empty states, confusing defaults.`,
    },
    {
      name: 'Banner transition',
      prompt: `Banner expires in ${hoursLeft}h. What happens when:
- endDate is in the past (expired banner, app not yet updated)
- User checks pity counter on expired banner
- Countdown shows negative time
Check: crashes, confusing UI, negative numbers.`,
    },
    {
      name: 'Whale player collection',
      prompt: `Player owns every character at S6 and every weapon at R5. They open collection tab.
Check: S6 not S7, filters when everything owned, profile pic selector with 60+ chars.`,
    },
    {
      name: 'Data import edge cases',
      prompt: `User imports pull history. What if:
- Convene URL expired
- Garbage text pasted instead of URL
- Double import (duplicated pulls?)
- Import has unknown character name not in app data`,
    },
    {
      name: 'Team builder edge cases',
      prompt: `User builds a team. What if:
- Same character picked twice
- Weapon doesn't match character type
- Missing echo/skill data for DPS calculation
- Empty team slots in rotation timeline`,
    },
  ];

  const allIssues = [];

  for (const scenario of scenarios) {
    log.info(`  ${scenario.name}...`);
    try {
      const response = await ask(SYSTEM,
        `APP CONTEXT:\n${context}\n\nSCENARIO: ${scenario.name}\n${scenario.prompt}\n\nReturn ONLY JSON.`,
        { maxTokens: 2048 }
      );

      let result;
      try {
        const match = response.match(/\{[\s\S]*\}/);
        result = match ? JSON.parse(match[0]) : { issues: [] };
      } catch { result = { issues: [] }; }

      if (result.issues?.length) {
        for (const issue of result.issues) {
          allIssues.push({ scenario: scenario.name, ...issue });
        }
        log.info(`    → ${result.issues.length} issue(s)`);
      } else {
        log.ok(`    → Clean`);
      }
    } catch (e) {
      log.warn(`    → Failed: ${e.message}`);
    }
  }

  return allIssues;
}
