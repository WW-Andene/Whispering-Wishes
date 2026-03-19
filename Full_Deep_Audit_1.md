# Full Deep Audit — Whispering Wishes v3.2.3

> **Audit Date:** 2026-03-19
> **Auditor:** Claude (Opus 4.6)
> **Skills Applied:** `app-audit-SKILL.md` · `design-aesthetic-audit-SKILL.md` · `art-direction-engine-SKILL.md` · `scope-context-SKILL.md`
> **Scope:** Full Deep Audit — All Parts P1–P13, Categories A–O, Design Companion Mode
> **Mode:** Read-only audit — no code modifications

---

## §0 — APP CONTEXT BLOCK

```yaml
# ─── IDENTITY ─────────────────────────────────────────────────────────────────
App Name:      Whispering Wishes
Version:       v3.2.3 (single source of truth: APP_VERSION in appcore-data.js)
Domain:        Wuthering Waves gacha companion — pity tracking, probability calculator,
               resource planner, collection tracker, team builder, analytics dashboard
Audience:      Wuthering Waves players — enthusiasts and community members (mobile-first)
Stakes:        LOW (hobby/entertainment — no real money transactions, no health, no legal)
               Note: Gambling-adjacent (gacha probability) → §K3 activated at MEDIUM depth

# ─── TECH STACK ───────────────────────────────────────────────────────────────
Framework:     React 18.2 (Vite 5 build)
Styling:       Tailwind CSS 3.4 + extensive inline CSS-in-JS via <style> tag (KuroStyles)
State:         useReducer + localStorage (whispering-wishes-v2.2)
Persistence:   localStorage only (5MB limit) — no backend for user data
Workers:       Static service worker (/public/sw.js) — network-first + stale-while-revalidate
Visualization: Recharts 2.10.3
Build:         Vite 5.4.8 with React plugin, manual chunks (vendor-react, vendor-charts)
External APIs: Firebase Realtime Database (leaderboard, community stats, presence)
               Google Identity Toolkit (anonymous auth)
               ImgBB (agent-side image hosting)
AI/LLM:        Agent-side only — Anthropic Claude (claude-sonnet-4-20250514) for data updates
               No client-side AI integration

# ─── PLATFORM & LOCALE ────────────────────────────────────────────────────────
Target Platforms: Mobile-first PWA + Desktop (responsive, 1024px+ desktop layout)
Locale / i18n:    English only (US)
Performance Budget: None formally defined

# ─── ARCHITECTURE CONSTRAINTS ─────────────────────────────────────────────────
Constraints:
  - App.jsx is an 8,218-line monolithic component (all 8 tabs in one file)
  - Split into 4 module files: appcore-data.js, appcore-engine.js, appcore-providers.jsx, appcore-components.jsx
  - AppCore.jsx is a barrel re-export layer
  - localStorage is the sole persistence mechanism for user data
  - Firebase is optional (gracefully disabled without env vars)
  - No backend for user data — fully client-side
  - PWA with offline support via service worker
  - Deployed on Vercel + Netlify (dual deployment)

# ─── DESIGN IDENTITY ──────────────────────────────────────────────────────────
Design Identity:
  Theme:         Dark-first cyberpunk-luxe with gold (#edaf18) accent — "Lahai-Roi Design Language"
  Personality:   Premium, atmospheric, game-authentic — feels like a companion to Wuthering Waves
  Signature:     Animated triangle wave + ambient glow canvas backgrounds, glowing card borders,
                 shimmer top-edge on cards, OLED pitch-black mode, kuro-* CSS class system,
                 scoreboard numerals (JetBrains Mono), Rajdhani display font
  Protected:     Canvas wave backgrounds, gold accent color (#edaf18), dark atmospheric surfaces,
                 kuro-card/kuro-stat/kuro-btn component styling, pity ring SVGs,
                 collection grid with image framing controls

  Visual Reference:      Wuthering Waves official UI, gacha companion apps (paimon.moe, wuwatracker)
  Emotional Target:      "A premium tool made by someone who genuinely plays this game"
  Visual Differentiator: Animated atmospheric canvas backgrounds + cyberpunk card system
  Monetization Tier:     Free (community tool, no revenue intent)
  Distribution Channel:  Direct URL share, Reddit/Discord community, GitHub

# ─── DOMAIN RULES ─────────────────────────────────────────────────────────────
Domain Rules:
  - HARD_PITY = 80 (guaranteed 5★ at 80 pulls) [CODE: appcore-data.js]
  - SOFT_PITY_START = 65 (rate increases linearly from pull 65 to 80) [CODE]
  - BASE_5STAR_RATE = 0.008 (0.8% base rate) [CODE: appcore-engine.js]
  - ASTRITE_PER_PULL = 160 [CODE]
  - BEGINNER_ASTRITE_PER_PULL = 128 [CODE]
  - HARD_PITY_4STAR = 10 (guaranteed 4★ every 10 pulls) [CODE]
  - FEATURED_4STAR_RATE = 0.5 (50% chance featured 4★) [CODE]
  - Character banner: 50/50 system (win = featured, lose = standard, next = guaranteed) [CODE]
  - Weapon banner: 100% featured (no 50/50) [CODE]
  - MAX_ASTRITE = 9,999,999 [CODE]
  - MAX_CALC_PULLS = 2,000 [CODE]
  - LUNITE_DAILY_ASTRITE = 90 [CODE]
  - Servers: Asia (UTC+8), America (UTC-5/DST), Europe (UTC+1/DST), SEA (UTC+8), HMT (UTC+8) [CODE]
  - Daily reset: 04:00 server local time [CODE]
  - Weekly reset: Monday 04:00 server local time [CODE]
  - Events stored in Europe CET/CEST reference timezone [CODE]

# ─── CRITICAL USER WORKFLOWS ──────────────────────────────────────────────────
Workflows:
  1: New user → onboarding modal → browse banners → view pity
  2: Import history from wuwatracker.com → see pity/stats/collection auto-populated
  3: Use calculator → set resources → see probability of getting target character
  4: Plan income → add sources → see daily pull projection
  5: Export state → fresh device → import → verify round-trip fidelity
  6: Team builder → select characters → see buff calculations → compare teams
  7: Browse collection → filter by element/rarity → view character details
  8: Submit to leaderboard → consent → view rankings

# ─── KNOWN ISSUES ─────────────────────────────────────────────────────────────
Known Issues:
  - App.jsx is 8,218 lines (monolithic) — maintenance risk
  - 40+ prior audit fixes already applied (P2-FIX through P15-FIX)

# ─── GROWTH CONTEXT ───────────────────────────────────────────────────────────
App Maturity:             Active development (v3.2.3, 30+ banner phases tracked)
Expected Scale:           Community tool — hundreds to low thousands of users
Likeliest Next Features:  More characters/weapons per patch, new echo sets, new regions
Planned Constraint Changes: None stated
```

---

## §I — ADAPTIVE CALIBRATION

### §I.1 Domain Classification

| Domain | Classification |
|--------|---------------|
| **Primary** | Game Companion / Fan Tool |
| **Secondary** | Gambling-adjacent (gacha probability) |
| **Amplified Dimensions** | §A2 (Probability), §A3 (Timezone), §A5 (Game Data), §E (Design), §K3 (Gacha) |
| **Stakes** | LOW base, elevated to MEDIUM for probability displays |

### §I.2 Architecture Classification

| Architecture | Classification |
|-------------|---------------|
| **Primary** | Multi-file SPA (Vite/React) with monolithic main component |
| **Secondary** | PWA (service worker), localStorage-only persistence |
| **Failure Modes** | Dead code accumulation in monolith, localStorage quota, SW cache versioning, no code-splitting, CSS specificity at scale in single `<style>` tag |

### §I.3 App Size → Scope

| Metric | Value |
|--------|-------|
| App.jsx | 8,218 lines |
| appcore-data.js | ~1,984 lines |
| appcore-engine.js | ~841 lines |
| appcore-providers.jsx | ~1,707 lines |
| appcore-components.jsx | ~1,826 lines |
| Service worker | ~165 lines |
| Agent code | ~7,552 lines (31 modules) |
| **Total app code** | **~14,576 lines** |
| **Audit Depth** | 13 Parts + Domain Deep Dives |

### §I.4 Five-Axis Aesthetic Profile

| Axis | Classification | Implication |
|------|---------------|-------------|
| **A1 Commercial Intent** | Non-revenue (free community tool) | Commercial signals irrelevant — craft, clarity, and authenticity are the goals |
| **A2 Use Context** | Leisure / casual | Delight is primary, friction must be minimal, polish and playfulness both appropriate |
| **A3 Audience** | Enthusiast / community member | Community vocabulary and aesthetic norms signal insider status — generic design signals outsider |
| **A4 Subject Identity** | Strong established aesthetic (Wuthering Waves) | App should honor the visual language of its subject — palette, motion, typography should feel inspired by the game |
| **A5 Aesthetic Role** | Aesthetic amplifies value | Good aesthetic makes the tool more trusted, enjoyable, and recommended — standard design investment |

**Aesthetic Goal Profile:**
> *"The aesthetic goal for Whispering Wishes is: craft and subject fidelity — the app should feel made by someone who genuinely plays Wuthering Waves, with visual quality that rivals official companion tools. This means honoring the game's dark atmospheric palette, using community vocabulary precisely, and maintaining the animated atmospheric identity as a visual signature."*

### §I.5 Domain Rule Extraction

All domain rules extracted from code (see §0). Key constants verified present:

| Rule | Value | Source | Status |
|------|-------|--------|--------|
| HARD_PITY | 80 | appcore-data.js:1408 | [CODE] — matches known WuWa mechanics |
| SOFT_PITY_START | 65 | appcore-data.js:1409 | [CODE] — matches community-verified data |
| BASE_5STAR_RATE | 0.008 | appcore-engine.js:159 | [CODE] — 0.8% base rate |
| 50/50 system | 50% featured on character win | appcore-engine.js:210 | [CODE] |
| Weapon 100% | Always featured | appcore-engine.js:212-213 | [CODE] |
| DST handling | Intl.DateTimeFormat | appcore-data.js:110-127 | [CODE] — proper DST at event date |

---

## §III — PRE-FLIGHT CHECKLIST

```
[✓] Read the entire source codebase (all .jsx/.js/.css/.html/.json files)
[✓] Classify: Game Companion, Multi-file SPA + PWA, ~14,576 LOC → 13 parts
[✓] Extract all domain rules from code → 15+ rules documented in §0
[✓] Identify architectural constraints → monolith, localStorage, no backend, dual deploy
[✓] Extract Design Identity → Lahai-Roi dark cyberpunk-luxe with gold accent
[✓] Build Feature Preservation Ledger (see P1 below)
[✓] Map critical workflows (8 workflows documented in §0)
[✓] Identify top 5 risk areas:
    1. Monolithic App.jsx (8,218 lines) — maintenance/scaling risk
    2. Probability engine correctness — gacha math must be exact
    3. Timezone/DST handling — 5 server regions with different DST rules
    4. localStorage persistence — quota, migration, concurrent tabs
    5. Service worker caching — version sync, stale content risk
[✓] Plan: 13 parts + Final Summary Dashboard
```

---

## PART 1 — INVENTORY & ARCHITECTURE

### Feature Preservation Ledger

Every working feature is **innocent until proven broken**. This ledger is a binding contract.

| # | Feature | Status | Files | Safety Notes |
|---|---------|--------|-------|-------------|
| F1 | Banner Tracker (3 categories) | ✅ Working | App.jsx [TAB-TRACKER] | 3 sub-categories: Resonators, Weapons, Standard |
| F2 | Event Tracker with Timers | ✅ Working | App.jsx [TAB-EVENTS] | Daily/weekly/recurring auto-advance |
| F3 | Pull Calculator (DP + MC) | ✅ Working | App.jsx [TAB-CALC], appcore-engine.js | Hybrid probability engine |
| F4 | Resource Planner | ✅ Working | App.jsx [TAB-PLANNER] | Income tracking, daily projection |
| F5 | Analytics & Stats | ✅ Working | App.jsx [TAB-STATS] | Pity histograms, luck rating, Recharts |
| F6 | Collection Grid | ✅ Working | App.jsx [TAB-COLLECT] | 5★/4★/3★ chars & weapons, filters, image framing |
| F7 | Team Builder | ✅ Working | App.jsx [TAB-TEAMS] | Buff calculations, resonance chains, damage scoring |
| F8 | Profile & Import/Export | ✅ Working | App.jsx [TAB-PROFILE] | wuwatracker import, JSON export, settings |
| F9 | PWA Install & Offline | ✅ Working | sw.js, appcore-providers.jsx | Network-first + SWR + cache-first strategies |
| F10 | Onboarding Modal | ✅ Working | appcore-providers.jsx | 7-step welcome flow |
| F11 | Desktop Layout | ✅ Working | KuroStyles CSS | Sidebar nav + ad margin at 1024px+ |
| F12 | OLED Mode | ✅ Working | App.jsx, KuroStyles | Pitch-black backgrounds |
| F13 | Animated Backgrounds | ✅ Working | appcore-components.jsx | BackgroundGlow + TriangleMirrorWave canvases |
| F14 | Leaderboard (Firebase) | ✅ Working | App.jsx | Anonymous auth, consent, UID hashing |
| F15 | Community Pulls (Firebase) | ✅ Working | App.jsx | "Most Pulled" aggregation |
| F16 | Active Players (Firebase) | ✅ Working | App.jsx | Real-time presence tracking |
| F17 | Admin Panel | ✅ Working | App.jsx | PBKDF2 auth, banner editing, trophy overrides |
| F18 | Bookmarks | ✅ Working | appcore-engine.js reducer | Save/load/delete calculator states |
| F19 | Character/Weapon Detail Modals | ✅ Working | appcore-components.jsx | Stats, build guides, materials, resonance chains |
| F20 | Visual Settings (Fade/Opacity) | ✅ Working | App.jsx, appcore-components.jsx | Per-section image framing controls |
| F21 | Toast Notification System | ✅ Working | appcore-providers.jsx | Success/error/warning/info with haptic |
| F22 | Cross-Tab State Sync | ✅ Working | App.jsx | StorageEvent listener for multi-tab |
| F23 | Animations Toggle | ✅ Working | App.jsx | Respects prefers-reduced-motion |
| F24 | Countdown Timers | ✅ Working | appcore-components.jsx | Server-adjusted, DST-aware, visibility-paused |
| F25 | Data Import from wuwatracker | ✅ Working | App.jsx [TAB-PROFILE] | PC/Android/PS5 guides |

**Total: 25 working features. No recommendation may break any of these.**

### Constraint Map

| Constraint | Impact | Accommodation |
|-----------|--------|---------------|
| Monolithic App.jsx (8,218 lines) | Cannot easily refactor without risk | All findings must work within current structure |
| localStorage-only (5MB limit) | No server-side backup | Quota monitoring, size warnings already implemented |
| No backend for user data | Cannot do server-side validation | All validation client-side |
| Vite 5 build with manual chunks | vendor-react + vendor-charts splits | No dynamic import/code-splitting beyond this |
| Dual deployment (Vercel + Netlify) | CSP headers must be in sync | Both have CSP configured |
| Firebase optional | Features degrade gracefully | Env var gating already in place |
| Tailwind + inline KuroStyles | ~1,700 lines of CSS in `<style>` tag | Token system via CSS custom properties |
| React 18 (not 19) | No server components, no use() | Standard hooks-based patterns |

### Workflow Map

```
W1: New User Flow
  Landing → Onboarding Modal (7 steps) → Tracker Tab → Browse Banners → View Pity Rings

W2: Import Flow
  Profile Tab → Import Guide → Follow platform steps → Paste JSON → Parse → Validate →
  Deduplicate → Merge into state → Auto-populate pity/collection/stats

W3: Calculator Flow
  Calculator Tab → Select banner type → Set pity/guarantee → Enter resources →
  [150ms defer] → DP/MC computation → Display probability matrix

W4: Planner Flow
  Planner Tab → Set daily astrite → Toggle Lunite → Add income sources →
  Set goal → See daily pull projection + expected date

W5: Export/Import Round-Trip
  Profile → Export → Download JSON → [New device] → Profile → Import → Paste JSON →
  Validate → Load State → Verify all data preserved

W6: Team Builder Flow
  Teams Tab → Select team slot → Browse characters → Filter by element/role →
  Select character → View buffs/resonance → Compare teams

W7: Collection Flow
  Collection Tab → Browse grid → Filter (element/weapon/rarity/search) →
  Click character → Detail modal → View stats/materials/teams

W8: Leaderboard Flow
  Profile/Stats → Leaderboard button → Consent modal → Hash UID →
  Submit to Firebase → View rankings
```

### Audit Plan

| Part | Focus | Priority Areas |
|------|-------|---------------|
| **P1** | ✅ Complete — Inventory & Architecture | Feature Ledger, Constraint Map, Workflows |
| **P2** | Domain Logic & Business Rules | Probability engine, timezone, game data accuracy |
| **P3** | Security, Privacy & Compliance | Firebase auth, XSS surface, CSP, GDPR, IP/copyright |
| **P4** | State & Data Integrity | Reducer, localStorage, import/export, validation |
| **P5** | Performance & Resources | Bundle size, canvas rendering, re-renders, memory |
| **P6** | Visual Design & Polish | Design tokens, color, typography, component quality |
| **P7** | UX & Information Architecture | Navigation, flows, onboarding, copy quality |
| **P8** | Accessibility (WCAG 2.1 AA) | Screen reader, keyboard, focus, contrast, ARIA |
| **P9** | Compatibility | Cross-browser, PWA, mobile/touch, network resilience |
| **P10** | Code Quality & Architecture | Dead code, duplication, naming, god component |
| **P11** | AI/LLM Integration | Agent security, prompt safety, cost controls |
| **P12** | i18n & Localization | Hardcoded strings, locale formats |
| **P13** | Development Scenario Projections | Scale cliffs, tech debt, dependency decay |
| **Final** | Summary Dashboard | Findings table, root causes, quick wins, roadmap |

---

*End of §0 + §I + §III + P1. Commit and push follows.*

---

## PART 2 — DOMAIN LOGIC & BUSINESS RULES

### §A1. Business Rule & Formula Correctness

#### F-P2-001 — Probability Engine: All Core Formulas Verified ✅
**Severity:** N/A (PASS)
**Confidence:** [CODE: appcore-engine.js lines 148-394]

The hybrid DP + Monte Carlo gacha probability engine has been verified line by line:

| Component | Status | Verification |
|-----------|--------|-------------|
| `getPullRate(pity)` | ✅ CORRECT | 0.8% base at 0–64, linear ramp 65–79, guaranteed at 80 (clamped via Math.min) |
| `computeDistDP` (character) | ✅ CORRECT | 50/50 at guar=0 (50% featured copies++/guar→0, 50% loss guar→1), 100% at guar=1 |
| `computeDistDP` (weapon) | ✅ CORRECT | Always 100% featured, no guarantee dimension |
| `expectedPullsToTarget` | ✅ CORRECT | Value iteration with g=1 computed before g=0 (dependency satisfied) |
| `minPullsForProb` | ✅ CORRECT | Binary search with ±5 MC verification (500K trials) |
| `computeGachaStats` | ✅ CORRECT | sqrt guard for floating-point variance |
| `calcStats` worstCase (char) | ✅ CORRECT | HARD_PITY × 2 × copies − (guaranteed ? HARD_PITY : 0) − pity |
| `calcStats` worstCase (weapon) | ✅ CORRECT | HARD_PITY × copies − pity |

**Edge cases verified:**
- N=0 pulls → dist[0]=1.0, all probabilities=0% ✅
- pity=80 (MAX_PITY) → getPullRate returns 1.0 (clamped), nextPity capped at 80 ✅
- copies=0 → expectedPullsToTarget returns 0 immediately ✅
- N>5000 → safeN caps at 5000, MC trials used ✅

**Numerical stability:**
- GACHA_EPS = 1e-15 threshold skips negligible probabilities safely ✅
- Distribution normalization guards against total=0 ✅
- Variance sqrt guards against negative floating-point results ✅

#### F-P2-002 — 4★ Calculation is Intentional Estimate
**Severity:** LOW (information)
**Confidence:** [CODE: appcore-engine.js:803-807]

The 4★ calculation assumes hard pity every 10 pulls (`Math.floor(safePulls / 10)`), which is a floor estimate. Actual 4★ count is typically higher due to base rate hits before pity. The comment on line 803 explicitly documents this as intentional.

**Solution:** Consider adding a tooltip or footnote near the 4★ display: "Estimate — actual count may be higher due to early pulls."

#### F-P2-003 — DP_MAX_PULLS Threshold is Well-Justified
**Severity:** N/A (PASS)
**Confidence:** [CODE: appcore-engine.js:269-272]

DP_MAX_PULLS = 500 is documented with memory analysis: 501 × 81 × 2 × 11 = ~891K entries ≈ 7.1MB. Beyond this, MC is used. The threshold is correct.

---

### §A2. Probability & Statistical Correctness

#### F-P2-004 — Monte Carlo Trial Count Adequacy
**Severity:** LOW
**Confidence:** [CODE: appcore-engine.js:260-267, 282-283]

| Context | Trial Count | Standard Error | Adequate? |
|---------|------------|----------------|-----------|
| Standard MC (N>500) | 100,000 | ~0.3% at 50% probability | ✅ Yes |
| Binary search MC | 200,000 | ~0.2% | ✅ Yes |
| Verification MC | 500,000 | ~0.1% | ✅ Yes |

Trial counts are appropriate for the precision needed (1 decimal place display).

**Solution:** No change needed. The hierarchical trial count (100K → 200K → 500K) is a good design.

#### F-P2-005 — CDF Integrity
**Severity:** N/A (PASS)
**Confidence:** [CODE: appcore-engine.js:227-239]

Distribution normalization (line 238-239) ensures probabilities sum to 1.0. The DP table accounts for all probability mass including the "0 copies" bucket.

#### F-P2-006 — Uncertainty Communication
**Severity:** LOW
**Confidence:** [CODE: appcore-engine.js:275-284]

The MC method introduces stochastic noise. The displayed probability uses `toFixed(1)` (1 decimal place), which is appropriate given MC standard error. However, there is no visual indicator that MC-based results (N>500) have lower precision than DP-based results (N≤500).

**Solution:** When N>500 (MC mode), add a subtle "≈" prefix or tooltip: "Approximate — based on simulation" to distinguish from exact DP results.

---

### §A3. Temporal & Timezone Correctness

#### F-P2-007 — DST-Aware Server Offset: Correctly Implemented ✅
**Severity:** N/A (PASS)
**Confidence:** [CODE: appcore-data.js:98-128]

`getServerOffset(server, atDate)` correctly:
- Returns fixed offset for non-DST servers (Asia, SEA, HMT = UTC+8)
- Uses `Intl.DateTimeFormat` with `timeZoneName: 'shortOffset'` for DST servers (America, Europe)
- Parses GMT offset at the **specific event date**, not the current date (P9-FIX)
- Handles half-hour offsets via regex `GMT([+-]\d+)(?::(\d{2}))?`
- Falls back to hardcoded offset if Intl API fails
- Guards against NaN dates

#### F-P2-008 — Server-Adjusted End Date Logic: Conceptually Sound but Complex
**Severity:** LOW (documentation)
**Confidence:** [CODE: appcore-engine.js:40-52]

`getServerAdjustedEnd` adjusts event end times from Europe reference to other servers. The logic:
1. Compute server offset at event date (DST-aware)
2. Compute Europe offset at event date (DST-aware)
3. offsetDiff = serverOffset − europeOffset
4. adjustedMs = storedMs − (offsetDiff × 3600000)

This is correct: events stored in Europe local time are shifted by the difference between the viewing server and Europe. For example, an event ending at 11:59 CET on March 18 ends at the same absolute UTC moment regardless of server — the adjustment converts from "Europe local reference" to "absolute UTC for display."

**Solution:** Add a code comment explaining the full conversion chain for future maintainers: "Events are authored as Europe local times. This function converts to absolute UTC by removing the Europe-to-target-server offset."

#### F-P2-009 — Daily/Weekly Reset DST Correction: Two-Pass Verification ✅
**Severity:** N/A (PASS)
**Confidence:** [CODE: appcore-engine.js:74-145]

Both `getNextDailyReset` and `getNextWeeklyReset` use iterative DST correction:
1. Compute initial estimate using current server offset
2. Compute the offset at the estimated UTC time
3. If it differs (DST boundary crossed), recompute with corrected offset

This two-pass approach correctly handles the edge case where the reset time itself falls during a DST transition.

#### F-P2-010 — Recurring Event Cycle Drift Near DST
**Severity:** LOW
**Confidence:** [CODE: appcore-engine.js:57-71]

`getRecurringEventEnd` uses fixed milliseconds for cycle advancement (`cycleMs = days × 86400000`). The comment on line 56-57 acknowledges that during DST transitions, the recalculated end may drift by ±1 hour but self-corrects on the next cycle.

**Solution:** This is acceptable for the current use case (28-day cycles). If precision is needed, consider using `Date` methods that account for calendar days rather than fixed milliseconds.

#### F-P2-011 — CURRENT_BANNERS Date Verification
**Severity:** N/A (PASS)
**Confidence:** [CODE: appcore-data.js:131-137]

```
startDate: '2026-02-26T09:00:00Z'  // Feb 26, 10:00 CET = 09:00 UTC ✅ (Feb is CET = UTC+1)
endDate: '2026-03-18T10:59:00Z'    // Mar 18, 11:59 CET = 10:59 UTC ✅ (Mar 18 < Mar 29 DST switch)
```

Both dates are in CET (winter) territory. The UTC conversions are correct.

#### F-P2-012 — Stale Event Dates
**Severity:** MEDIUM
**Confidence:** [CODE: appcore-data.js:1304-1402]

Several events have `currentEnd` dates that are in the past or very near:
- `doubledPawns` ends `2026-03-19T03:00:00Z` — **today** (March 19, 2026)
- `whimperingWastes` ends `2026-03-16T02:59:00Z` — **3 days ago**
- `towerOfAdversity` ends `2026-03-02T02:59:00Z` — **17 days ago**

These are non-recurring events. When expired, they show "Ended" which is correct behavior, but keeping stale events in the data may confuse users.

**Solution:** The auto-update agent should clean up expired non-recurring events, or the UI should filter/hide events that ended more than 7 days ago.

---

### §A4. State Machine Correctness

#### F-P2-013 — Reducer Action Type Safety: Well-Implemented ✅
**Severity:** N/A (PASS)
**Confidence:** [CODE: appcore-engine.js:397-422]

The ACTION object (frozen constant) prevents typo-based dispatch failures. The default case in the reducer (line 764-768) warns on unknown action types. This is a good defensive pattern.

#### F-P2-014 — Bookmark Load Validates Against initialState Keys
**Severity:** N/A (PASS)
**Confidence:** [CODE: appcore-engine.js:716-728]

`LOAD_BOOKMARK` only restores fields that exist in `initialState.calc`, preventing state pollution from bookmarks saved in older app versions.

#### F-P2-015 — Team Slot Index Bounds
**Severity:** N/A (PASS)
**Confidence:** [CODE: appcore-engine.js:732-759]

`SET_ACTIVE_TEAM` clamps index to [0,4]. `SET_TEAM_SLOT`, `CLEAR_TEAM_SLOT`, `CLEAR_TEAM` all use `.map()` with index equality checks, which safely ignores out-of-bounds indices.

---

### §A5. Embedded Data Accuracy

#### F-P2-016 — 33 Missing 4★ Weapon Data Entries
**Severity:** MEDIUM
**Confidence:** [CODE: appcore-data.js]

87% of 4★ weapons in `ALL_4STAR_WEAPONS` (33 out of 38) have NO entry in `WEAPON_DATA`. Only Discord, Variation, Marcato, Lunar Cutter, and Thunderbolt have full data.

Missing weapons include: Overture, Ocean's Gift, Bloodpact's Pledge, Waltz in Masquerade, Legend of Drunken Hero, Romance in Farewell, Fables of Wisdom, Meditations on Mercy, Call of the Abyss, Somnoire Anchor, Fusion Accretion, Celestial Spiral, Relativistic Jet, Endless Collapse, Waning Redshift, Beguiling Melody, Lumingloss, Commando of Conviction, Scale Slasher, Jinzhou Keeper, Comet Flare, Augment, Hollow Mirage, Stonard, Novaburst, Undying Flame, Cadenza, Helios Cleaver, Dauntless Evernight, Autumntrace, Solar Flame, Feather Edge, Amity Accord.

**Impact:** Weapon detail modals will show nothing for these weapons. Collection grid displays them but clicking shows no stats.

**Solution:** Add WEAPON_DATA entries for all 33 missing 4★ weapons with: rarity, type, stat, baseAtk, subStatValue, desc, passive, bestFor, ascensionMaterials.

#### F-P2-017 — Duplicate CHAR_BUFF_TABLE Entries
**Severity:** LOW
**Confidence:** [CODE: appcore-data.js]

`Jinhsi` and `Xiangli Yao` each appear twice in CHAR_BUFF_TABLE. The second definition overwrites the first due to JavaScript object key behavior. Both duplicate entries contain identical data (self-buff notes only), so there is no functional bug — but it is dead code.

**Solution:** Remove the duplicate entries at lines ~1044-1057 (keep the first definition at ~879-892).

#### F-P2-018 — 11 Characters Missing Resonance Chain Data
**Severity:** LOW
**Confidence:** [CODE: appcore-data.js, RESONANCE_CHAIN_DATA]

Missing from RESONANCE_CHAIN_DATA:
- **5★:** Rover, Jianxin (2 characters)
- **4★:** Aalto, Baizhi, Chixia, Yangyang, Taoqi, Yuanwu, Youhu, Lumi, Buling (9 characters)

**Impact:** Character detail modals won't show the "Resonance Chain" section for these characters. Team builder buff calculations won't include their S1-S6 bonuses.

**Solution:** Add RESONANCE_CHAIN_DATA entries for all 11 missing characters. Prioritize Rover and Jianxin (5★).

#### F-P2-019 — All Character Cross-References Valid ✅
**Severity:** N/A (PASS)
**Confidence:** [CODE: appcore-data.js]

- All `bestWeapon` references point to existing WEAPON_DATA entries ✅
- All team composition strings reference valid CHARACTER_DATA names ✅
- All ascension material references exist in MATERIAL_IMAGES ✅
- All skill material references exist in MATERIAL_IMAGES ✅
- CURRENT_BANNERS.standardCharacters matches STANDARD_5STAR_CHARACTERS ✅
- CURRENT_BANNERS.standardWeapons matches STANDARD_5STAR_WEAPONS ✅

#### F-P2-020 — Base Stats Completeness ✅
**Severity:** N/A (PASS)
**Confidence:** [CODE: appcore-data.js:604-654]

All 45 characters (33 5★ + 12 4★) have baseHp, baseAtk, baseDef, maxEnergy assigned via the forEach loop.

---

### §A6. Async & Concurrency Bug Patterns

#### F-P2-021 — CountdownTimer: setInterval with Visibility Pause ✅
**Severity:** N/A (PASS)
**Confidence:** [CODE: appcore-components.jsx:774-830]

CountdownTimer (P14-FIX) uses `setInterval(1000)` instead of rAF, pauses on `visibilitychange`, and resumes with immediate update on visibility. Callbacks accessed via refs to avoid effect re-runs. This is well-implemented.

#### F-P2-022 — Debounced localStorage Saves ✅
**Severity:** N/A (PASS)
**Confidence:** [CODE: App.jsx — documented P7-FIX]

localStorage writes are debounced (300ms) to prevent excessive I/O during rapid state changes.

#### F-P2-023 — Calculator Deferred Computation ✅
**Severity:** N/A (PASS)
**Confidence:** [CODE: App.jsx — documented CALC_DEFER_MS = 150]

Heavy DP computation is deferred 150ms after calculator input changes, preventing jank during slider drag.

#### F-P2-024 — Firebase Fetch Timeout ✅
**Severity:** N/A (PASS)
**Confidence:** [CODE: App.jsx — FETCH_TIMEOUT_MS = 10000]

All Firebase fetch calls use AbortController with 10s timeout. No hung network requests.

#### F-P2-025 — Cross-Tab State Sync
**Severity:** N/A (PASS)
**Confidence:** [CODE: App.jsx — StorageEvent listener]

The app listens for `storage` events to sync state across tabs. This is a good pattern for localStorage-based apps.

---

### §A7. JS Type Coercion & Implicit Conversion

#### F-P2-026 — String-to-Number Coercion in Calculator Inputs
**Severity:** LOW
**Confidence:** [CODE: appcore-engine.js:588-599, 776-778]

Calculator state stores resources as strings (`astrite: ''`, `radiant: ''`). The reducer uses `+value` (unary plus) for conversion: `(+state.calc.astrite || 0)`. This is safe because:
- `+''` returns 0 (falsy, caught by `|| 0`)
- `+undefined` returns NaN (caught by `|| 0`)
- `+'123'` returns 123

However, `+'123abc'` returns NaN → 0, which silently discards invalid input without user feedback.

**Solution:** Consider adding input validation feedback for non-numeric entries (currently the input clamps silently).

#### F-P2-027 — Math.floor Used Correctly for Integer Clamping ✅
**Severity:** N/A (PASS)
**Confidence:** [CODE: appcore-engine.js:776-778]

`calcStats` uses `Math.floor(pulls) || 0` for safe integer conversion. The `|| 0` catches NaN from `Math.floor(undefined)`.

---

### P2 Summary

| ID | Category | Severity | Finding |
|----|----------|----------|---------|
| F-P2-001 | §A1 | ✅ PASS | Probability engine formulas all verified correct |
| F-P2-002 | §A1 | LOW | 4★ estimate documented as intentional floor |
| F-P2-004 | §A2 | ✅ PASS | MC trial counts adequate for displayed precision |
| F-P2-006 | §A2 | LOW | No visual indicator for MC vs DP precision |
| F-P2-007 | §A3 | ✅ PASS | DST-aware server offsets correctly implemented |
| F-P2-008 | §A3 | LOW | Server adjustment logic correct but complex |
| F-P2-009 | §A3 | ✅ PASS | Two-pass DST correction for daily/weekly resets |
| F-P2-010 | §A3 | LOW | Recurring cycle drift ±1h near DST (documented) |
| F-P2-012 | §A3 | MEDIUM | Stale event dates (3 events expired) |
| F-P2-013 | §A4 | ✅ PASS | Action type constants prevent typo bugs |
| F-P2-016 | §A5 | **MEDIUM** | **33 missing 4★ weapon data entries** |
| F-P2-017 | §A5 | LOW | Duplicate CHAR_BUFF_TABLE entries (Jinhsi, Xiangli Yao) |
| F-P2-018 | §A5 | LOW | 11 characters missing resonance chain data |
| F-P2-019 | §A5 | ✅ PASS | All character cross-references valid |
| F-P2-021 | §A6 | ✅ PASS | Timer visibility handling correct |
| F-P2-022 | §A6 | ✅ PASS | Debounced saves |
| F-P2-024 | §A6 | ✅ PASS | Fetch timeout with AbortController |
| F-P2-026 | §A7 | LOW | Silent string-to-number coercion on invalid input |

**Critical findings: 0**
**High findings: 0**
**Medium findings: 2** (stale events, missing weapon data)
**Low findings: 6**
**Pass: 12**

*End of P2. Commit and push follows.*
