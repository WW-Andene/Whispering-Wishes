# Whispering Wishes — Exhaustive Multi-Layer Audit Prompt

> **Usage**: Paste this entire prompt into a new conversation (or Claude Project) along with all source files. For best results, feed files in dependency order: `appcore-data.js` → `appcore-engine.js` → `appcore-providers.jsx` → `appcore-components.jsx` → `App.jsx`. If using Claude Projects, add all files as project knowledge and run multiple passes.

---

## System Instruction

You are a principal-level full-stack engineer performing pre-production technical due diligence on **Whispering Wishes v3.2.2**, a Wuthering Waves gacha companion SPA. Your audit determines whether this app ships. Every missed defect is a user-facing incident. Every wrong probability is a trust violation with the player community.

**Rules of engagement:**

1. You must cover **every numbered section** below. No skipping. No summarizing. If a section yields zero findings, state exactly what you inspected and why it passes.
2. For every finding, provide: `[SEVERITY: Critical/High/Medium/Low]` → `File:Line` → Description → Impact → Recommended Fix.
3. Do not make generic observations. Every claim must reference a **specific file, function, line number, or variable name** from the codebase.
4. The codebase has been through prior audit passes (P7, P9, P10, P12 — visible as `P{N}-FIX` comments). Verify that prior fixes are actually correct and complete. Flag any half-fixed or regressed issues.
5. Do NOT trust comments at face value. Verify that the code matches what the comment claims it does.
6. Think adversarially. For every input path, ask: "What happens with NaN, undefined, negative, absurdly large, empty string, prototype-polluted, or malformed data?"
7. End with a Summary Table sorted by severity and an overall Production Readiness Score (1–10) with justification.

---

## 1. GACHA PROBABILITY ENGINE — MATHEMATICAL CORRECTNESS

*This is the highest-stakes section. Incorrect probabilities directly mislead players making real spending decisions.*

### 1A. Rate Model Verification
- Verify `BASE_5STAR_RATE` (0.008) matches Wuthering Waves' published 0.8%.
- Verify `SOFT_PITY_START` (65) and `HARD_PITY` (80) match known game mechanics.
- Trace `getPullRate(pity)` line by line. Confirm the linear ramp formula produces exactly 100% at pity 79 (the pull that hits hard pity 80). Check for off-by-one: does pity 64→65 transition trigger soft pity correctly? Does pity 79 guarantee?
- Confirm the soft pity slope. The code uses `(pity - SOFT_PITY_START + 1) / SOFT_PITY_STEPS`. With SOFT_PITY_STEPS=15, at pity 79 this yields (79-65+1)/15 = 1.0. Verify this is correct or if it should be `(pity - SOFT_PITY_START) / (HARD_PITY - SOFT_PITY_START - 1)`.

### 1B. Dynamic Programming Correctness (`computeDistDP`)
- Trace the 4D DP table dimensions: `[N+1][MAX_PITY+1][guar:2][copies+1]`. Verify index bounds.
- Confirm the state transition: on a 5★ hit, pity resets to 0 (not 1). On a miss, pity increments. Verify `nextPity = Math.min(MAX_PITY, p + 1)` — does this mean a player can sit at pity 80 without getting a 5★? Is that correct?
- Verify the 50/50 system: character banner loss (pFeatured=0.5 when guar=0) sets guar=1, copies unchanged. Win resets guar=0. Weapon banner always featured (pFeatured=1.0).
- Check the `maxCopies` absorbing state — `nextK = Math.min(k + 1, maxCopies)`. Does overflow probability get lost or properly accumulated?
- Verify normalization: the distribution should sum to 1.0. Check `total > 0` guard.
- Test edge cases mentally: N=0 pulls should yield dist=[1,0,0,...]. startPity=79 with 1 pull should yield ~100% for 1 copy (weapon) or ~50% (char without guarantee).

### 1C. Monte Carlo Verification (`computeDistMC`, `simulateOneRun`)
- Verify MC matches DP for small N. Is 50,000 trials (default) sufficient for convergence?
- Check the DP↔MC threshold (`DP_MAX_PULLS=500`). Is the memory estimate in the comment accurate? Verify: `501 × 81 × 2 × 11 × 8 bytes ≈ 7.1MB`.
- The safety cap is `Math.min(N, 5000)`. What happens if a user enters 10,000 pulls? Is the cap silently applied? Is the user informed?

### 1D. Statistical Helpers
- `getCumulativeProb(dist, k)`: verify `dist.slice(k)` correctly computes P(X ≥ k), not P(X > k).
- `computeGachaStats`: verify expected value and standard deviation formulas.
- `expectedPullsToTarget`: trace the iterative computation. Does it converge? Is there a maximum iteration guard? What happens for unreachable targets?
- `minPullsForProb`: same convergence and guard questions.

### 1E. `calcStats` Integration
- Verify `worstCase` formula: for character banner, `HARD_PITY * 2 * copies - (guaranteed ? HARD_PITY : 0) - pity`. Is the guarantee deduction correct? It says "Guarantee only applies to the FIRST copy" — verify the math matches this claim.
- The 4★ calculation uses `Math.floor(pulls / HARD_PITY_4STAR)`. This ignores the actual 4★ soft pity and base rate. Is the floor estimate documented as approximate? Could it mislead users?
- Check that `successRate` = `pGe(safeCopies)` and not `pGe(1)` — these would be very different for multi-copy targets.

---

## 2. TIMEZONE & EVENT ENGINE — DST CORRECTNESS

### 2A. DST-Aware Offset Resolution
- `getServerOffset(server, atDate)` uses `Intl.DateTimeFormat` with `shortOffset`. Verify the regex `GMT([+-]\d+)(?::(\d{2}))?` handles all browser output formats. Does Safari produce the same format as Chrome?
- Test: Europe server on March 29 2026 (DST transition day). Does the offset correctly switch from +1 to +2?
- The comment says "half-hour support (P7-FIX)". Verify the formula `hours + (hours < 0 ? -minutes : minutes)` is correct for timezones like UTC+5:30 (India) and UTC-9:30 (Marquesas).

### 2B. Server-Adjusted Event Times
- `getServerAdjustedEnd`: events are stored in Europe reference time. Trace the offset arithmetic for America (UTC-5 winter, UTC-4 summer). If an event ends at `2026-02-26T08:59:00Z` (Europe CET), what time does an America user see?
- `getRecurringEventEnd`: verify the cycle advancement uses fixed milliseconds (not calendar days). The comment warns about ±1 hour DST drift. Could this cause an event to show "expired" during the transition hour?

### 2C. Daily/Weekly Reset Calculations
- `getNextDailyReset`: trace the double-offset correction (`resetOffsetAtTarget`). If a DST transition happens between now and the next 4:00 AM reset, does the calculation handle it?
- `getNextWeeklyReset`: verify `daysToMon` logic for all 7 days × before/after reset. Specifically test: Sunday before 04:00 (should be 1 day), Monday at exactly 04:00 (boundary).

---

## 3. STATE MANAGEMENT & DATA INTEGRITY

### 3A. Reducer Completeness
- Enumerate every `case` in the reducer. Are there any actions dispatched in the UI that don't have a corresponding case? (Check all `dispatch({type: ...})` calls in App.jsx.)
- The `IMPORT_HISTORY` case has a `deduplicateMerge` function. Trace the dedup key: `timestamp|name|rarity|id`. Can two legitimately different pulls produce the same key? (e.g., pulling the same 3★ weapon twice in the same second.)
- `hadNewEntries` is checked via reference equality (`merged !== state.profile.featured?.history`). This works because `deduplicateMerge` returns the original array when no new entries are found. Verify this contract holds in all code paths.
- `LOAD_BOOKMARK` destructures out `id, name, timestamp` and spreads the rest. If a bookmark was saved with an older state schema (fewer fields), does this cause issues?

### 3B. State Persistence
- `loadFromStorage`: verify the merge with `initialState` fills in missing fields from schema upgrades. What if a saved state has extra keys from a newer version that gets rolled back?
- `saveToStorage`: the 4MB warning threshold — is 80% of 5MB actually 4MB? (Yes, but some browsers have 10MB limits. Is this noted?)
- The storage key migration from legacy keys (`v2.0`, `v2.1`) — is this actually implemented in the code or just documented in replit.md?

### 3C. Sanitization Depth
- `sanitizeStateObj` strips `__proto__`, `constructor`, `prototype` but does NOT recurse into nested objects. Is `sanitizeImportedState` → `sanitizeStateObj` on each top-level key sufficient, or could a nested `profile.featured.__proto__` slip through?
- `sanitizeImportedState` only allows keys in `ALLOWED_STATE_KEYS`. But after sanitizing, `loadFromStorage` does `...safeParsed.profile` which could contain arbitrary keys if `sanitizeStateObj` doesn't whitelist profile sub-keys. Is this a concern?

---

## 4. SECURITY AUDIT

### 4A. XSS Surface
- Search for any `dangerouslySetInnerHTML`, `innerHTML`, `.html()`, or `eval()` usage.
- All user-controlled strings (username, UID, imported data) — trace where they're rendered. Are they always interpolated via JSX (safe) or ever concatenated into HTML strings (unsafe)?
- The username input is capped at 24 chars via `.slice(0, 24)`. But is there also a `maxLength` attribute? Could a programmatic dispatch bypass the slice?

### 4B. Import Attack Surface
- File import (wuwatracker CSV/JSON): what happens with a 100MB file? Is `MAX_IMPORT_SIZE_MB` (5MB) enforced at the file read level, or only after parsing?
- Can a crafted import file inject keys into state that bypass `ALLOWED_STATE_KEYS`?
- Can a crafted import file trigger excessive memory allocation (e.g., history array with millions of entries)?

### 4C. Firebase Security
- If Firebase Realtime Database is used for leaderboard/presence: are the database rules restrictive? Can a user overwrite another user's score? Can they read the entire leaderboard?
- Are Firebase credentials (config object) in the client bundle? (Expected: yes, but confirm rules prevent abuse.)

### 4D. Third-Party Image Loading
- Character/weapon/banner images are loaded from `i.ibb.co`. If an image URL is controlled by data (e.g., `CURRENT_BANNERS.characterBannerImage`), could a malicious data update point to a tracking pixel or exploit?
- Are images loaded with `crossorigin` attributes? Could CORS issues leak user info?

### 4E. Service Worker Security
- The service worker is registered as a Blob URL from an inline string. This means it bypasses CSP `script-src` restrictions. Is this an acceptable tradeoff? Could the inline SW code be tampered with if the CDN is compromised?
- The SW caches responses from `CDN_DOMAINS` and `IMG_DOMAINS`. Could cache poisoning persist a malicious response?

---

## 5. PERFORMANCE AUDIT

### 5A. Bundle & Rendering
- App.jsx is 5,645 lines in a single component. What is the estimated compiled bundle size? Is there any code splitting?
- How many `useState` hooks does `WhisperingWishesInner` use? (Count them.) Each setter can trigger a full re-render. Are expensive computations guarded by `useMemo`/`useCallback` where needed?
- The DP calculation (`computeDistDP`) allocates a 4D array on every calculator input change. Is it memoized? What's the peak memory for N=500?
- Are character/weapon data objects (`CHARACTER_DATA`, `WEAPON_DATA`) stable references, or are they recreated on each render?

### 5B. Image Performance
- How many unique image URLs are in `appcore-data.js`? Are they all loaded eagerly or lazy-loaded?
- Images use `i.ibb.co` — are they served with proper `Cache-Control` headers? Does the service worker compensate?
- Are images using modern formats (WebP/AVIF) or legacy PNG/JPG? Check the actual URLs.
- Is there any `<img loading="lazy">` or Intersection Observer usage?

### 5C. Memory & Leaks
- Search for `setInterval`, `setTimeout`, `addEventListener` without corresponding cleanup in `useEffect` return functions.
- The countdown timers update every second. Are they properly cleaned up when tabs switch?
- The service worker blob URL — is it revoked after registration?

### 5D. Large Data Handling
- If a user has 2,000+ pull history entries, does the Stats tab (with Recharts) lag?
- `deduplicateMerge` creates a `Set` of all existing keys on every import. For large histories, is this O(n) or O(n²)?

---

## 6. ARCHITECTURE & CODE QUALITY

### 6A. Monolith Assessment
- App.jsx at 5,645 lines exceeds Babel's 500KB deopt threshold (noted in replit.md). Has this actually caused build issues? Check `vite.config.js` for any workarounds.
- The 4-file appcore split (data → engine → providers → components) is clean at the module level. But does App.jsx re-import things it shouldn't? Are there circular dependencies?
- Count the props passed to major sub-sections within `WhisperingWishesInner`. Is there prop drilling that should use context?

### 6B. DRY Violations
- The `IMPORT_HISTORY` reducer case repeats near-identical logic for featured, weapon, standardChar, standardWeap, and beginner banners. Could this be a loop over banner types?
- Search for duplicated patterns across banner type handling (tracker tab, stats tab, etc.).

### 6C. Error Boundaries
- Is `TabErrorBoundary` used on all tabs? What does it render on crash? Does it report errors anywhere?
- What happens if Recharts throws during rendering (e.g., malformed data)?

### 6D. Naming & Conventions
- Are there inconsistencies in naming (camelCase vs snake_case, abbreviated vs full names)?
- Are magic numbers documented? (e.g., `240` = 4 hours × 60 minutes — is this clear from context?)
- Are there any `console.log` statements left in production code (beyond intentional warnings/errors)?

---

## 7. ACCESSIBILITY (a11y)

### 7A. Semantic Structure
- Do tabs use proper ARIA roles (`role="tablist"`, `role="tab"`, `role="tabpanel"`, `aria-selected`, `aria-controls`)?
- Are modals using proper focus trap, `role="dialog"`, `aria-modal="true"`?
- Verify `useFocusTrap` and `useEscapeKey` hooks are applied to all modals (check `FocusTrapModal`, `CharacterDetailModal`, `WeaponDetailModal`, `ImportGuide`, `OnboardingModal`).

### 7B. Interactive Elements
- Are all `<button>` elements that use only icons providing `aria-label`?
- Are `<input>` fields associated with `<label>` elements (or `aria-label`)?
- The server region selector uses `aria-pressed` — verify this matches the toggle pattern vs `aria-selected`.
- Are toggle switches using `role="switch"` with `aria-checked`?

### 7C. Color & Contrast
- The app uses gold-on-dark theme. Do text elements meet WCAG 2.1 AA contrast ratios (4.5:1 for normal text, 3:1 for large text)?
- Are severity/rarity indicators distinguishable without color alone? (e.g., 5★ gold vs 4★ purple — is there a shape or text backup?)
- `text-gray-600` on dark backgrounds — is this readable?

### 7D. Motion & Reduced Motion
- Are CSS animations/transitions wrapped in `prefers-reduced-motion` media queries?
- The `TriangleMirrorWave` background animation — can it cause vestibular issues?

---

## 8. UX EDGE CASES & UI LOGIC

### 8A. Empty & Error States
- What does each tab show with zero imported history?
- What happens if localStorage is full and `saveToStorage` returns `false`? Is the user notified?
- What happens if all external images fail to load? (ibb.co outage) Are there fallbacks?
- What does the calculator show with 0 pulls, 0 pity, 0 copies target?

### 8B. Input Validation
- Pity input: can a user enter 80 (at hard pity)? Negative? 999? What happens?
- Pulls input: MAX_CALC_PULLS is defined — what is its value? Is it enforced in the UI or only in `calcStats`?
- Astrite input: can a user enter `MAX_ASTRITE + 1`? Negative? Non-numeric?
- Username: can it contain HTML entities, emoji, RTL characters, or zero-width characters?

### 8C. Banner Transition
- When a new game version drops and `CURRENT_BANNERS` is updated, what happens to users whose app is cached by the service worker? Do they see stale banner data?
- If the app is updated mid-session, does the state migrate cleanly?

---

## 9. PWA & SERVICE WORKER

### 9A. Registration
- The SW is registered as a Blob URL. Verify this works in Chrome, Edge, Firefox, and Safari. (Safari historically has issues with blob SW.)
- Is the SW scope correct? Does `/` scope cover all routes?
- What happens on SW update? Does `skipWaiting` + `clients.claim` cause content flash?

### 9B. Caching Strategy
- App shell: cache-first. Is the manifest precaching `['/', '/index.html']` sufficient? What about JS/CSS chunks?
- CDN domains: cache-first. Are cache entries ever expired?
- Image domains: stale-while-revalidate. Is `MAX_IMG_ENTRIES` (250) enforced via cache eviction?
- Offline: does the app function fully offline after first load? What breaks?

---

## 10. GAME DATA ACCURACY

### 10A. Banner History Completeness
- Verify `BANNER_HISTORY` covers every Wuthering Waves banner from v1.0 (May 2024) to v3.1 (current).
- Cross-reference start/end dates with public records (wuwatracker, wiki).
- Check for missing characters, misspelled names, or wrong element/weapon assignments.

### 10B. Character & Weapon Database
- Spot-check 5+ characters in `CHARACTER_DATA`: verify element, weapon type, role, ascension materials, best echoes, and team recommendations against current meta/wiki.
- Verify `WEAPON_DATA` completeness — are all 5★ weapons from banner history present?
- Are there any characters/weapons in the banner history that are missing from the respective DATA objects?

### 10C. Predicted Banners
- Version 3.1 phase 2 is marked `predicted: true`. Is this clearly labeled in the UI so users know it's speculative?

---

## 11. PRIOR AUDIT REGRESSION CHECK

The codebase has 111+ `P{N}-FIX` annotations. For each category:

- **P7-FIX**: Verify single source of truth for constants, half-hour timezone support, import size limits.
- **P9-FIX**: Verify DST-at-event-date offsets, NaN guards, dedup key improvements, bookmark restore completeness.
- **P10-FIX**: Verify prototype pollution sanitization is effective (try to bypass it mentally).
- **P12-FIX**: Verify monotonic ID counter, storage return values, MAX_CALC_PULLS cap, MC safety cap.

For each, ask: "Is this fix complete, or does it leave a gap?"

---

## 12. TESTING & CI/CD

- Are there any test files (`.test.js`, `.spec.js`, `__tests__/`)? If not, flag as Critical.
- Which functions are most critical to test? Prioritize: `getPullRate`, `computeDistDP`, `getServerOffset`, `sanitizeStateObj`, `deduplicateMerge`, `calcStats`.
- Is there any linting config (`.eslintrc`, `.prettierrc`)? Build-time type checking?
- The Vercel deployment — is there any build validation beyond `vite build`?

---

## OUTPUT FORMAT

```
═══════════════════════════════════════════════════════════
FINDING #{N}
═══════════════════════════════════════════════════════════
Severity : [Critical | High | Medium | Low]
Section  : {Section Number} — {Section Title}
File     : {filename}:{line}
Function : {function name or component}
Issue    : {Precise description}
Impact   : {What goes wrong for users}
Fix      : {Specific recommended change}
```

End with:

```
═══════════════════════════════════════════════════════════
SUMMARY TABLE
═══════════════════════════════════════════════════════════
| # | Severity | Section | File:Line | One-Line Summary |
|---|----------|---------|-----------|------------------|
| 1 | Critical | 1A      | engine:152| Off-by-one in... |
...

PRODUCTION READINESS: X/10
Justification: ...

PRIORITY ACTION ITEMS (Top 5):
1. ...
2. ...
```
