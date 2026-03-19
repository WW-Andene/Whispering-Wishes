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

---

## PART 3 — SECURITY, PRIVACY & COMPLIANCE

### §C1. Authentication & Authorization

#### F-P3-001 — Admin Hash Stored in Client-Side Source Code
**Severity:** MEDIUM
**Confidence:** [CODE: appcore-components.jsx:1370, App.jsx:3043-3108]

`ADMIN_HASH` is a hardcoded SHA-256/PBKDF2 hash visible in the published JavaScript bundle. While PBKDF2 with 100K iterations significantly increases brute-force cost (~100K hashes/sec on GPU vs ~10B for plain SHA-256), the hash is still extractable from the client bundle. Any sufficiently motivated attacker with the hash can run offline dictionary attacks.

**Mitigations already in place:**
- PBKDF2 100K iterations (P13-FIX: CRITICAL-2) ✅
- Constant-time comparison prevents timing attacks ✅
- Progressive lockout: 5 failed attempts → 5-minute cooldown ✅
- Session-based + localStorage-based lockout (survives page refresh) ✅

**Solution:** For true security, admin auth should move to a backend service with Argon2id. For the current client-only architecture, the PBKDF2 approach is the best available option. Ensure the admin password is sufficiently long and random (≥16 characters).

#### F-P3-002 — Admin Lockout Clearable via localStorage
**Severity:** LOW
**Confidence:** [CODE: App.jsx:266-278]

The lockout timer is stored in `ww-admin-lockout` in localStorage. A user can clear localStorage to reset the lockout. However, `adminSessionFailsRef` (in-memory) provides a secondary check that survives localStorage clearing within the same session.

**Solution:** Acceptable for current stakes (LOW — admin controls only visual customization, not real money or user data).

#### F-P3-003 — Firebase Anonymous Auth: Properly Implemented ✅
**Severity:** N/A (PASS)
**Confidence:** [CODE: App.jsx:1218]

Firebase auth uses anonymous `accounts:signUp` via Identity Toolkit. API key is loaded from env vars only (`VITE_FIREBASE_API_KEY`). No hardcoded fallback. Firebase features gracefully disabled when env vars are absent.

#### F-P3-004 — UID Hashing Before Firebase Writes ✅
**Severity:** N/A (PASS)
**Confidence:** [CODE: App.jsx — SHA-256/FNV-1a hashing]

Player UIDs are hashed before being written to Firebase leaderboard/community data. Raw UIDs never leave the client. The leaderboard displays masked IDs (first/last characters only). Admin panel shows full hashed IDs.

---

### §C2. Injection & XSS

#### F-P3-005 — No innerHTML/dangerouslySetInnerHTML/eval Usage ✅
**Severity:** N/A (PASS)
**Confidence:** [CODE: Grep across entire src/]

Zero instances of `innerHTML`, `dangerouslySetInnerHTML`, `eval()`, `Function()`, or `document.write` found anywhere in the application source code. All content is rendered via React's JSX (which auto-escapes).

#### F-P3-006 — Image URL Allowlist: Well-Implemented ✅
**Severity:** N/A (PASS)
**Confidence:** [CODE: App.jsx — ALLOWED_IMAGE_HOSTS, isAllowedImageUrl(), sanitizeImageUrl()]

Custom image URLs are validated against an 11-domain allowlist. HTTPS-only enforcement. URLs not matching the allowlist are rejected. This prevents arbitrary image injection.

#### F-P3-007 — No User-Controlled URL Injection Vectors ✅
**Severity:** N/A (PASS)
**Confidence:** [CODE: App.jsx]

The only `window.open` call (appcore-providers.jsx:165) uses `window.location.href` (same origin). No user-controlled values are concatenated into URLs, `href`, or `src` attributes without validation.

---

### §C3. Prototype Pollution & Import Safety

#### F-P3-008 — Prototype Pollution Protection: Well-Implemented ✅
**Severity:** N/A (PASS)
**Confidence:** [CODE: appcore-engine.js:488-513]

`sanitizeStateObj()` recursively filters `__proto__`, `constructor`, and `prototype` keys from imported objects. Applied to:
- localStorage loads (`loadFromStorage`) ✅
- State imports (`sanitizeImportedState`) ✅
- `LOAD_STATE` action in reducer ✅
- Array elements recursively (P14-FIX: MEDIUM-2) ✅

`sanitizeImportedState()` additionally validates against `ALLOWED_STATE_KEYS` whitelist, preventing unknown top-level keys from entering state.

#### F-P3-009 — JSON.parse Safety ✅
**Severity:** N/A (PASS)
**Confidence:** [CODE: appcore-engine.js:517-552]

`loadFromStorage()` wraps `JSON.parse` in try/catch. Failed parses return `null` and log the error. The caller falls back to `initialState`.

---

### §C4. Network & Dependencies

#### F-P3-010 — CSP Headers: Comprehensive but 'unsafe-inline' in style-src
**Severity:** LOW
**Confidence:** [CODE: vercel.json:8, netlify.toml:9]

**CSP Policy Analysis:**

| Directive | Value | Assessment |
|-----------|-------|-----------|
| `default-src` | `'self'` | ✅ Restrictive default |
| `script-src` | `'self'` | ✅ No external scripts, no unsafe-eval |
| `worker-src` | `'self'` | ✅ Service worker from same origin (P14-FIX) |
| `style-src` | `'self' 'unsafe-inline' fonts.googleapis.com` | ⚠️ `unsafe-inline` required for Tailwind + KuroStyles `<style>` tag |
| `img-src` | `'self'` + 11 image domains + `data:` | ✅ Matches ALLOWED_IMAGE_HOSTS |
| `connect-src` | `'self'` + Firebase + image domains | ✅ Necessary for Firebase + image validation |
| `font-src` | `'self' fonts.gstatic.com` | ✅ Google Fonts only |
| `frame-ancestors` | `'none'` | ✅ Prevents clickjacking |

**Issue:** `'unsafe-inline'` in `style-src` is necessary because KuroStyles injects ~1,700 lines of CSS via a `<style>` tag rendered by React. This is a common tradeoff in React SPAs with CSS-in-JS patterns.

**Solution:** To eliminate `unsafe-inline`, the CSS could be extracted to a static `.css` file. However, this would break the dynamic OLED mode toggle (which changes CSS custom properties based on state). The current approach is acceptable for the app's risk profile.

#### F-P3-011 — No CDN Scripts Without SRI ✅
**Severity:** N/A (PASS)
**Confidence:** [CODE: index.html]

All JavaScript is bundled via Vite — no external CDN `<script>` tags. Fonts are loaded from Google Fonts (style-only, no script execution risk). DNS prefetch hints (`dns-prefetch`) are used for image CDN domains.

#### F-P3-012 — HTTPS Everywhere ✅
**Severity:** N/A (PASS)
**Confidence:** [CODE: Grep for http:// in src/]

Zero instances of `http://` URLs in source code. All external resources use HTTPS. HSTS header set with `max-age=63072000; includeSubDomains; preload`.

#### F-P3-013 — Security Headers: Complete Set ✅
**Severity:** N/A (PASS)
**Confidence:** [CODE: vercel.json, netlify.toml]

| Header | Present | Value |
|--------|---------|-------|
| Content-Security-Policy | ✅ | Detailed policy (see F-P3-010) |
| X-Frame-Options | ✅ | DENY |
| X-Content-Type-Options | ✅ | nosniff |
| Referrer-Policy | ✅ | strict-origin-when-cross-origin |
| Permissions-Policy | ✅ | camera=(), microphone=(), geolocation=() |
| Strict-Transport-Security | ✅ | max-age=63072000; includeSubDomains; preload |

#### F-P3-014 — CSP Mismatch Between Vercel and Netlify
**Severity:** LOW
**Confidence:** [CODE: vercel.json vs netlify.toml]

The Netlify CSP `connect-src` is more restrictive than Vercel's — it omits several image host domains from `connect-src`. Vercel's CSP includes image domains in `connect-src` (needed for fetch-based image validation), while Netlify's does not.

**Solution:** Synchronize the CSP policies between Vercel and Netlify deployments to ensure identical security posture on both platforms.

#### F-P3-015 — Vite Dev Server Host Validation ✅
**Severity:** N/A (PASS)
**Confidence:** [CODE: vite.config.js:9-10]

P14-FIX removed `allowedHosts: true` which previously disabled host header validation, preventing DNS rebinding attacks during development.

---

### §C5. Privacy & Data Minimization

#### F-P3-016 — Player UID Privacy: Well-Protected ✅
**Severity:** N/A (PASS)
**Confidence:** [CODE: App.jsx — SHA-256/FNV-1a hashing]

- Raw UID stored only in `localStorage` (user's own device)
- Firebase writes use hashed UID
- Public leaderboard displays masked IDs
- Consent modal required before any Firebase submission

#### F-P3-017 — Third-Party Image Host IP Exposure
**Severity:** LOW
**Confidence:** [CODE: appcore-data.js — 300+ image URLs across ibb.co, imgur, etc.]

When the app loads character/weapon images from third-party hosts (ibb.co, imgur.com, discordapp.com), the user's IP address and referrer header are sent to those services. This is standard web behavior but worth disclosing.

**Solution:** Consider adding a brief privacy note in the Settings or Profile tab: "Character images are loaded from third-party image hosts. Your IP address is visible to these services when images load."

#### F-P3-018 — No PII in Export JSON ✅
**Severity:** N/A (PASS)
**Confidence:** [CODE: appcore-engine.js — saveToStorage/loadFromStorage]

The export JSON contains pull history, calculator state, team configurations, and settings — no email, real name, location, or other PII. The UID (game player ID) is included but is a game-specific identifier, not a government ID.

#### F-P3-019 — Leaderboard Consent Flow ✅
**Severity:** N/A (PASS)
**Confidence:** [CODE: App.jsx — ww-leaderboard-consent]

Users must explicitly consent via a custom accessible modal before any data is sent to Firebase. Consent is stored in localStorage and respected on subsequent sessions.

---

### §C6. Compliance & Legal

#### F-P3-020 — Copyright Attribution for Game Assets
**Severity:** MEDIUM
**Confidence:** [CODE: entire codebase]

The app uses Wuthering Waves character names, weapon names, game mechanics, and community-sourced character images. No copyright disclaimer or attribution to Kuro Games is visible in the app UI.

**Solution:** Add a footer disclaimer: "Whispering Wishes is a fan-made tool. Wuthering Waves is a trademark of Kuro Games. This project is not affiliated with or endorsed by Kuro Games. Game data and character information are sourced from public community resources."

#### F-P3-021 — Gacha Probability Disclaimer
**Severity:** LOW
**Confidence:** [CODE: appcore-engine.js — probability engine]

The app displays gacha pull probabilities. While it includes notes about "Hybrid DP + Monte Carlo" methodology, there is no prominent disclaimer that these are mathematical estimates based on community-verified rates, not official numbers from Kuro Games.

**Solution:** Add a small disclaimer near probability displays: "Probabilities are mathematical estimates based on community-verified rates. Official rates may differ."

#### F-P3-022 — No Age Gating Required
**Severity:** N/A (PASS)

The app is a planning/tracking tool — it does not facilitate real-money gambling or purchases. No age gating is required.

#### F-P3-023 — GDPR/CCPA: Minimal Exposure
**Severity:** LOW
**Confidence:** [CODE: App.jsx — Firebase integration]

The only data sent to a remote server is:
- Hashed UID (anonymous identifier)
- Pull statistics (non-personal game data)
- Presence heartbeat (session ID, no PII)

This is minimal data processing. However, Firebase usage should be disclosed in a privacy policy.

**Solution:** Add a brief privacy policy accessible from the Profile/Settings tab covering: what data is collected (hashed game ID, pull stats), where it's stored (Firebase), and how to delete it (clear localStorage removes local data; Firebase data can be requested for deletion).

---

### §C7. Mobile-Specific Security

Not applicable — this is a web PWA, not a native mobile app.

---

### P3 Summary

| ID | Category | Severity | Finding |
|----|----------|----------|---------|
| F-P3-001 | §C1 | MEDIUM | Admin hash in client bundle (PBKDF2 mitigated) |
| F-P3-002 | §C1 | LOW | Admin lockout clearable via localStorage |
| F-P3-003 | §C1 | ✅ PASS | Firebase anonymous auth properly implemented |
| F-P3-004 | §C1 | ✅ PASS | UID hashing before Firebase writes |
| F-P3-005 | §C2 | ✅ PASS | No innerHTML/eval/XSS vectors |
| F-P3-006 | §C2 | ✅ PASS | Image URL allowlist enforced |
| F-P3-007 | §C2 | ✅ PASS | No URL injection vectors |
| F-P3-008 | §C3 | ✅ PASS | Prototype pollution protection |
| F-P3-009 | §C3 | ✅ PASS | JSON.parse safety |
| F-P3-010 | §C4 | LOW | CSP requires unsafe-inline for styles |
| F-P3-011 | §C4 | ✅ PASS | No CDN scripts without SRI |
| F-P3-012 | §C4 | ✅ PASS | HTTPS everywhere |
| F-P3-013 | §C4 | ✅ PASS | Complete security headers |
| F-P3-014 | §C4 | LOW | CSP mismatch between Vercel and Netlify |
| F-P3-015 | §C4 | ✅ PASS | Dev server host validation |
| F-P3-016 | §C5 | ✅ PASS | UID privacy well-protected |
| F-P3-017 | §C5 | LOW | Third-party image host IP exposure |
| F-P3-018 | §C5 | ✅ PASS | No PII in exports |
| F-P3-019 | §C5 | ✅ PASS | Leaderboard consent flow |
| F-P3-020 | §C6 | **MEDIUM** | **Missing copyright attribution for Kuro Games** |
| F-P3-021 | §C6 | LOW | Missing gacha probability disclaimer |
| F-P3-023 | §C6 | LOW | No privacy policy for Firebase data |

**Critical findings: 0**
**High findings: 0**
**Medium findings: 2** (admin hash in client, missing copyright attribution)
**Low findings: 6**
**Pass: 14**

**Overall Security Assessment:** The app demonstrates strong security awareness with multiple layers of defense. The codebase shows evidence of 40+ prior security fixes (P2-FIX through P15-FIX). For a client-side hobby tool with LOW stakes, the security posture is **above average**. The main gaps are compliance-related (attribution, disclaimers, privacy policy) rather than technical vulnerabilities.

*End of P3. Commit and push follows.*

---

## PART 4 — STATE & DATA INTEGRITY

### §B1. State Architecture

#### F-P4-001 — State Schema: Well-Defined with Defaults ✅
**Severity:** N/A (PASS)
**Confidence:** [CODE: appcore-engine.js:425-466]

`initialState` is comprehensive and well-structured:
- `server` (string, default 'Asia')
- `profile` with 5 banner sub-objects (featured, weapon, standardChar, standardWeap, beginner), each with `history[]`, `pity5`, `pity4`, and `guaranteed` (featured only)
- `calc` with 18+ fields for calculator inputs (all string/number with safe defaults)
- `planner` with daily income, goal settings, and `addedIncome[]`
- `bookmarks[]`, `eventStatus{}`, `teams[5]`, `activeTeamIndex`, `settings`

All fields have explicit types and defaults. No `undefined` values in initial state.

#### F-P4-002 — Calculator State Deliberately Transient ✅
**Severity:** N/A (PASS)
**Confidence:** [CODE: appcore-engine.js:536]

`calc: { ...initialState.calc }` — calculator state always starts fresh on page load, never persisted from storage. This is intentional: resources change frequently, and stale calculator state would mislead users.

#### F-P4-003 — Derived State: Mostly Computed On-Demand ✅
**Severity:** N/A (PASS)
**Confidence:** [CODE: App.jsx — useMemo hooks]

Stats, trophies, luck ratings, and collection data are all derived via `useMemo` from the source state. No stale cached derived values.

#### F-P4-004 — Reset Completeness ✅
**Severity:** N/A (PASS)
**Confidence:** [CODE: appcore-engine.js:763]

`ACTION.RESET` returns `initialState` directly — a complete, clean reset. `CLEAR_PROFILE` preserves username and profilePic while resetting all pull history and pity counters.

---

### §B2. Persistence & Storage

#### F-P4-005 — Schema Versioning: Key Name Only, No Migration Logic
**Severity:** MEDIUM ⏱ COMPOUNDS
**Confidence:** [CODE: appcore-engine.js:470-471]

`STORAGE_KEY = 'whispering-wishes-v2.2'` — the storage key acts as the version. The comment says "If schema changes require migration, add a migration function here." However, **no migration function exists.** If a future update changes the state schema, users with existing `v2.2` data will either:
1. Get their data merged with `initialState` (current behavior — missing fields filled from defaults)
2. Lose data if field names change or types change

The current merge strategy (`{ ...initialState, ...savedState }`) handles **additive** schema changes well (new fields get defaults). It does NOT handle **rename, removal, or type changes**.

**Solution:** Add a `SCHEMA_VERSION` number inside the stored data, and a migration function chain:
```js
const migrations = {
  1: (state) => ({ ...state, newField: defaultValue }),
  2: (state) => ({ ...state, renamedField: state.oldField }),
};
```
This is LOW urgency now but COMPOUNDS over time as the schema evolves.

#### F-P4-006 — Quota Management: Well-Implemented ✅
**Severity:** N/A (PASS)
**Confidence:** [CODE: appcore-engine.js:555-572, App.jsx:825, 2900]

- `saveToStorage` warns at 4MB (80% of 5MB limit)
- `QuotaExceededError` caught and dispatched as custom event
- App.jsx listens for `ww-storage-error` and shows toast
- Profile tab shows current storage size with color-coded indicator
- Save failure counter prevents toast spam (P12-FIX)

#### F-P4-007 — Concurrent Tab Safety: Handled via StorageEvent ✅
**Severity:** N/A (PASS)
**Confidence:** [CODE: App.jsx:855]

The app listens for `storage` events (fired when another tab writes to localStorage). When the main storage key changes in another tab, the app reloads state from storage. This prevents the "last tab wins" data loss scenario.

#### F-P4-008 — Cold Start Validation: Deep Merge with Defaults ✅
**Severity:** N/A (PASS)
**Confidence:** [CODE: appcore-engine.js:515-553]

`loadFromStorage` performs a deep merge:
- Each profile sub-object merged with its initialState counterpart
- Teams array validated (must be exactly 5 entries, each with `name` string and `slots[3]`)
- `activeTeamIndex` clamped to [0,4]
- Calculator always fresh (not loaded from storage)
- Planner, settings, bookmarks, eventStatus all merged with defaults

This handles schema additions gracefully. Corrupted state falls through to `catch` → returns `null` → app uses `initialState`.

#### F-P4-009 — Multiple localStorage Keys: Auxiliary Data Scattered
**Severity:** LOW
**Confidence:** [CODE: App.jsx — multiple localStorage keys]

The app uses 8+ localStorage keys:
- `whispering-wishes-v2.2` — main state
- `whispering-wishes-visual-settings-v3` — fade/opacity settings
- `whispering-wishes-image-framing-v1` — image pan/zoom
- `whispering-wishes-trophy-overrides-v1` — admin trophy customization
- `ww-team-equipment` — weapon/echo loadouts
- `ww-leaderboard-id` — session ID
- `ww-leaderboard-consent` — consent flag
- `ww-admin-lockout` / `ww-admin-fails` — admin security
- `whispering-wishes-admin-banners` — custom banners
- `whispering-wishes-pre-import-backup` / `whispering-wishes-pre-restore-backup`

**Impact:** Clearing "the app's data" requires knowing all these keys. The export function captures auxiliary data (visual settings, framing, collection images, trophy overrides) in the `aux` field — good. But team equipment (`ww-team-equipment`) is NOT included in exports.

**Solution:** Include `ww-team-equipment` in the export `aux` field for complete round-trip fidelity. Document all localStorage keys in a single constant registry.

---

### §B3. Input Validation & Sanitization

#### F-P4-010 — Calculator Input Validation: Implicit via Coercion
**Severity:** LOW
**Confidence:** [CODE: appcore-engine.js:776-778, 588-599]

Calculator inputs are stored as strings and converted via `+value || 0` (unary plus with fallback). This silently converts invalid inputs to 0 without user feedback. Pity values are clamped in `calcStats`: `Math.max(0, Math.min(MAX_PITY, Math.floor(pity) || 0))`.

The reducer's `ADD_INCOME` uses `Math.floor(+action.income.astrite || 0)` — safe but silent.

**Solution:** Consider showing a brief validation message when a non-numeric value is entered, rather than silently zeroing.

#### F-P4-011 — Team Name Length Validation ✅
**Severity:** N/A (PASS)
**Confidence:** [CODE: appcore-engine.js:755-756]

`RENAME_TEAM` uses `(action.name || '').slice(0, 20)` — caps team names at 20 characters. Falls back to current name if empty.

#### F-P4-012 — Username Length Validation
**Severity:** LOW
**Confidence:** [CODE: App.jsx — MAX_USERNAME_LENGTH = 24]

Username length is enforced at 24 characters. However, the enforcement happens in the UI input (`maxLength`), not in the reducer. A manually crafted dispatch could bypass this.

**Solution:** Add `.slice(0, 24)` in the `SET_USERNAME` reducer case for defense-in-depth.

#### F-P4-013 — Bookmark Name Length Validation ✅
**Severity:** N/A (PASS)
**Confidence:** [CODE: App.jsx — MAX_BOOKMARK_NAME_LENGTH = 30]

Bookmarks enforce a 30-character limit via UI input.

---

### §B4. Import & Export Integrity

#### F-P4-014 — Pre-Import/Pre-Restore Backup: Excellent ✅
**Severity:** N/A (PASS)
**Confidence:** [CODE: App.jsx:2794-2798, 6912-6916]

Before any import or restore operation, the app automatically saves the current state to localStorage as a pre-import/pre-restore backup. This provides rollback capability:
- `whispering-wishes-pre-import-backup` (for wuwatracker imports)
- `whispering-wishes-pre-restore-backup` (for backup restores)
- UI button to restore pre-import backup (P15-FIX)

#### F-P4-015 — Import Validation: Schema Checked ✅
**Severity:** N/A (PASS)
**Confidence:** [CODE: appcore-engine.js:504-513, 762]

Imported state goes through:
1. `sanitizeStateObj()` — strips prototype pollution keys recursively
2. `sanitizeImportedState()` — validates against `ALLOWED_STATE_KEYS` whitelist
3. `{ ...initialState, ...sanitizeImportedState(action.state) }` — merges with defaults

This prevents unknown keys from entering state and ensures all required fields exist.

#### F-P4-016 — Export Includes Auxiliary Data ✅
**Severity:** N/A (PASS)
**Confidence:** [CODE: App.jsx:2971-2982]

Export JSON includes: `timestamp`, `version`, `state`, and `aux` (visualSettings, imageFraming, collectionImages, trophyOverrides). Restore properly re-applies auxiliary data to their respective localStorage keys.

#### F-P4-017 — Team Equipment Not Included in Export
**Severity:** LOW
**Confidence:** [CODE: App.jsx:2971-2982]

`ww-team-equipment` (weapon/echo loadouts per team slot) is NOT included in the export `aux` field. A full export → import round-trip on a new device would lose team equipment data.

**Solution:** Add `ww-team-equipment` to the export `aux` object alongside other auxiliary data.

#### F-P4-018 — Import Size Limit Enforced ✅
**Severity:** N/A (PASS)
**Confidence:** [CODE: appcore-data.js:7 — MAX_IMPORT_SIZE_MB = 5]

Import file size is limited to 5MB before parsing begins.

#### F-P4-019 — History Deduplication: Well-Implemented ✅
**Severity:** N/A (PASS)
**Confidence:** [CODE: appcore-engine.js:649-658]

`deduplicateMerge` in `IMPORT_HISTORY` uses a composite key (`timestamp|name|rarity|id`) to prevent duplicate entries when re-importing. Merged results are re-sorted by timestamp. Pity values are only updated when new entries were actually merged (P9-FIX).

---

### §B5. Data Flow Map

```
USER INPUT                    VALIDATION                STATE                     COMPUTATION              DISPLAY
─────────────                ──────────────            ─────────                ─────────────            ─────────
Calculator inputs      →  +value||0 coercion    →  calc state (useReducer)  →  calcStats()         →  Success rate %
  (astrite, pity, copies)   Math.floor, Math.min     (transient, not saved)     (DP/MC engine)         Probability bars
                                                                                                        Missing pulls

Planner inputs         →  Math.max/min clamps   →  planner state            →  Daily projection    →  Expected date
  (daily astrite, goals)    Number() || 0            (persisted)                 useMemo                Pull forecast

Import JSON            →  JSON.parse in try     →  sanitizeStateObj()       →  merge with          →  Profile/Stats
  (from wuwatracker)        size limit check         sanitizeImportedState       initialState           Collection grid
                            prototype filter         deduplicateMerge                                   Pity rings

Team Builder           →  Character lookup      →  teams[] in state         →  Buff calculations   →  Team damage score
  (select characters)       validated names          (persisted)                 useMemo from            Buff breakdowns
                                                                                CHAR_BUFF_TABLE

Server selection       →  SERVERS[key] lookup   →  server state             →  getServerOffset()   →  Countdown timers
                            fallback to default      (persisted)                 getServerAdjustedEnd    Event times

GAPS:
  → Calculator: silent coercion on invalid input (no user feedback)
  → Team equipment: not in export/import flow (data loss risk on device switch)
  → Username: length enforcement in UI only, not in reducer
```

---

### §B6. Mutation & Reference Integrity

#### F-P4-020 — Reducer Immutability: Correctly Implemented ✅
**Severity:** N/A (PASS)
**Confidence:** [CODE: appcore-engine.js:575-771]

The reducer produces new state via spread operators throughout:
- `{ ...state, server: action.server }`
- `{ ...state, calc: { ...state.calc, [action.field]: action.value } }`
- `teams: state.teams.map(...)` (creates new array)
- `addedIncome: [...state.planner.addedIncome, action.income]` (new array)
- `bookmarks: [...state.bookmarks, { ...newBookmark }]` (new array)

No direct mutation of state objects. All arrays created via spread or `.map()/.filter()`.

#### F-P4-021 — Sort on New Arrays: Safe ✅
**Severity:** N/A (PASS)
**Confidence:** [CODE: appcore-engine.js:657, App.jsx:1268,2079,2708,5095,7212]

All `.sort()` calls operate on newly created arrays:
- `[...existing, ...newEntries].sort(...)` — new array via spread
- `Object.entries(...).sort(...)` — new array from Object.entries
- `[...(trophies?.list || [])].sort(...)` — spread before sort
- `[...new Set(...)].sort()` — new array from Set

No mutation of source arrays through sort.

#### F-P4-022 — Bookmark Load: Validated Key Whitelist ✅
**Severity:** N/A (PASS)
**Confidence:** [CODE: appcore-engine.js:716-728]

`LOAD_BOOKMARK` only spreads keys that exist in `initialState.calc`, preventing bookmark data from introducing unknown state properties.

---

### P4 Summary

| ID | Category | Severity | Finding |
|----|----------|----------|---------|
| F-P4-001 | §B1 | ✅ PASS | State schema well-defined with defaults |
| F-P4-002 | §B1 | ✅ PASS | Calculator state deliberately transient |
| F-P4-005 | §B2 | **MEDIUM** ⏱ | **No schema migration logic (compounds over time)** |
| F-P4-006 | §B2 | ✅ PASS | Quota management well-implemented |
| F-P4-007 | §B2 | ✅ PASS | Concurrent tab safety via StorageEvent |
| F-P4-008 | §B2 | ✅ PASS | Cold start deep merge with defaults |
| F-P4-009 | §B2 | LOW | Team equipment not in export (scattered keys) |
| F-P4-010 | §B3 | LOW | Silent coercion on invalid calculator input |
| F-P4-012 | §B3 | LOW | Username length enforced in UI only |
| F-P4-014 | §B4 | ✅ PASS | Pre-import/pre-restore backup |
| F-P4-015 | §B4 | ✅ PASS | Import validation with schema whitelist |
| F-P4-016 | §B4 | ✅ PASS | Export includes auxiliary data |
| F-P4-017 | §B4 | LOW | Team equipment not in export aux |
| F-P4-019 | §B4 | ✅ PASS | History deduplication well-implemented |
| F-P4-020 | §B6 | ✅ PASS | Reducer immutability correct |
| F-P4-021 | §B6 | ✅ PASS | Sort on new arrays only |

**Critical findings: 0**
**High findings: 0**
**Medium findings: 1** (no schema migration — compounds over time)
**Low findings: 4**
**Pass: 11**

**Overall State/Data Assessment:** The state management is well-architected for a localStorage-only app. The reducer maintains immutability correctly, the import/export system is robust with pre-operation backups, and prototype pollution is thoroughly guarded. The main gap is the lack of schema migration logic, which becomes increasingly costly as the app evolves.

*End of P4. Commit and push follows.*

---

## PART 5 — PERFORMANCE & RESOURCES

### §D1. Runtime Performance

#### F-P5-001 — Two Full-Screen Canvas Animations Running Continuously
**Severity:** MEDIUM
**Confidence:** [CODE: appcore-components.jsx:938-1166]

`BackgroundGlow` and `TriangleMirrorWave` each render a full-screen canvas at ~15fps (66ms frame budget). Each frame involves:
- **BackgroundGlow:** Double-buffered 8% scale canvas → pixel-by-pixel wave computation → blur(20px) draw to full canvas
- **TriangleMirrorWave:** Full triangle grid computation with 3 wave functions, slope calculations, and per-triangle fill

Both animations run simultaneously on every tab. On low-end mobile devices (4× CPU throttle), this is a significant main-thread tax.

**Mitigations already in place:**
- Pauses on `visibilitychange` (tab hidden) ✅
- 66ms frame budget (15fps, not 60fps) ✅
- Disabled entirely when animations toggle is off ✅
- `willChange: 'transform'` for GPU compositing ✅
- Buffer canvas released on unmount (P11-FIX) ✅

**Solution:** Consider:
1. Reducing to a single canvas layer (merge wave functions into one pass)
2. Using `OffscreenCanvas` in a Worker for the pixel computation (would free main thread entirely)
3. Lowering the resolution further on mobile (detect via `navigator.hardwareConcurrency` or viewport width)
4. Auto-disabling animations on devices with < 4 CPU cores

#### F-P5-002 — Deferred Calculator Computation: Well-Optimized ✅
**Severity:** N/A (PASS)
**Confidence:** [CODE: App.jsx — CALC_DEFER_MS = 150]

Heavy DP computation is deferred 150ms after input changes. During slider drag, the DP table is not recomputed on every frame — only after the user pauses. This prevents jank during interactive use.

#### F-P5-003 — No Code Splitting or Lazy Loading
**Severity:** MEDIUM
**Confidence:** [CODE: App.jsx — 8,218 lines, vite.config.js]

All 8 tabs (tracker, events, calculator, planner, analytics, collection, teams, profile) are loaded in the initial bundle. There is no `React.lazy()` or dynamic `import()` anywhere. Vite splits only vendor chunks (react, recharts).

**Impact:**
- The entire App.jsx (~8,218 lines) is parsed and compiled on first load
- Recharts is always loaded even if the user never visits the Analytics tab
- All 300+ character/weapon image URLs are in the data module even if collection is never viewed

**Solution:**
1. Wrap Recharts-dependent components in `React.lazy()` with `Suspense` — Recharts is ~200KB and only used in Stats tab
2. Consider lazy-loading the Collection tab (heaviest DOM with 100+ grid items)
3. Manual chunks in vite.config.js already split react and recharts — this is the right foundation

#### F-P5-004 — 91+ useState Declarations in Single Component
**Severity:** MEDIUM (maintenance + render concern)
**Confidence:** [CODE: App.jsx — 91 useState, 1 useReducer]

The monolithic `WhisperingWishesInner` component has 91+ `useState` hooks plus one `useReducer`. Every state change causes the entire 8,218-line component function to re-execute. While React's reconciler avoids unnecessary DOM updates, the **JavaScript execution cost** of re-running all hooks, conditionals, and JSX construction on every keystroke/click is non-trivial.

**Mitigations already in place:**
- `useMemo` for expensive derived values ✅
- `useCallback` for event handlers ✅
- `memo()` on child components (Card, CardHeader, CardBody, TabButton, CountdownTimer, PityRing, BannerCard, EventCard, etc.) ✅

**Solution:** Extract tab content into separate components (e.g., `TrackerTab`, `CalcTab`, `CollectionTab`). Each would own its local state, reducing the re-render surface area. This is a significant refactor but the highest-impact performance improvement available.

#### F-P5-005 — Collection Grid: 100+ Items Without Virtualization
**Severity:** LOW
**Confidence:** [CODE: App.jsx [TAB-COLLECT], appcore-components.jsx:1372-1456]

The collection grid renders all characters/weapons as DOM elements simultaneously (~100+ items with 6-column grid). Each item includes an `<img>` with lazy loading, which mitigates the image load cost but not the DOM node cost.

**Mitigations already in place:**
- `loading="lazy"` on collection images ✅
- `CollectionGridCard` wrapped in `memo()` with custom comparator ✅
- `contain: 'paint'` on card containers ✅

**Solution:** For 100+ items, the current approach is acceptable. If the game adds significantly more items (200+), consider virtualization with `react-window` or intersection observer-based rendering.

---

### §D2. Web Vitals & Loading

#### F-P5-006 — Font Loading: Preload + Print-Media Trick ✅
**Severity:** N/A (PASS)
**Confidence:** [CODE: index.html:28-37]

Fonts (Rajdhani + JetBrains Mono) are loaded with:
- `preconnect` to fonts.googleapis.com and fonts.gstatic.com
- `preload as="style"` for the CSS
- `media="print" onload="this.media='all'"` trick for non-blocking load
- `<noscript>` fallback

This is the correct pattern for non-render-blocking font loading.

#### F-P5-007 — FOUC Prevention: Inline Critical CSS ✅
**Severity:** N/A (PASS)
**Confidence:** [CODE: index.html:38]

`<style>html,body{background:#080c14;color:#e2e8f0;margin:0}</style>` prevents white flash on dark-themed app. Combined with `color-scheme: dark` in index.css, this eliminates FOUC.

#### F-P5-008 — CLS Risk: Image Dimensions Not Set on Some Images
**Severity:** LOW
**Confidence:** [CODE: appcore-components.jsx, App.jsx]

Banner card images use fixed container height (`height: '190px'`) which prevents CLS ✅. Collection grid cards use fixed height (`height: '140px'`) ✅. However, some images in character detail modals and team builder don't have explicit width/height, relying on parent containers for sizing.

**Solution:** Ensure all `<img>` tags either have explicit `width`/`height` attributes or are in fixed-dimension containers with `contain: 'paint'`.

#### F-P5-009 — DNS Prefetch for Image CDNs ✅
**Severity:** N/A (PASS)
**Confidence:** [CODE: index.html:32-34]

`dns-prefetch` hints for i.ibb.co, i.imgur.com, and cdn.discordapp.com. This reduces DNS lookup latency for character/weapon images.

---

### §D3. Resource Budget

#### F-P5-010 — Resource Budget Table

| Resource | Source | Est. Size (gzip) | Load Strategy | Critical Path? | Optimization |
|----------|--------|-------------------|--------------|----------------|-------------|
| App code (App.jsx + modules) | Vite bundle | ~80-120KB gz | Blocking (module) | Yes | Lazy-load tabs |
| React + ReactDOM | vendor-react chunk | ~45KB gz | Blocking | Yes | Already split |
| Recharts | vendor-charts chunk | ~70KB gz | Blocking | **No** — only Stats tab | **Lazy-load** |
| Lucide icons (50+) | Tree-shaken in bundle | ~15-25KB gz | Blocking | Yes | Already tree-shaken |
| Tailwind CSS | Generated CSS | ~15-25KB gz | Blocking | Yes | Purged unused |
| KuroStyles (inline) | `<style>` tag | ~8-12KB gz | Blocking (inline) | Yes | Cannot extract (dynamic) |
| Rajdhani + JetBrains Mono | Google Fonts CDN | ~30-50KB | Non-blocking | No | Correct strategy |
| Character/weapon images | ibb.co, imgur, etc. | ~2-5MB total | Lazy | No | Lazy loading ✅ |
| Service worker | /sw.js | ~4KB | Background | No | Correct |
| **Estimated Total (JS+CSS)** | | **~250-340KB gz** | | | |

**3G first-load estimate:** ~340KB / 1.5 Mbps ≈ **1.8 seconds** for JS+CSS parse. Acceptable.

**Largest optimization opportunity:** Lazy-load Recharts chunk (~70KB gz) — only loaded when Stats tab is visited.

---

### §D4. Memory Management

#### F-P5-011 — Canvas Buffer Cleanup ✅
**Severity:** N/A (PASS)
**Confidence:** [CODE: appcore-components.jsx:1034-1037]

BackgroundGlow explicitly releases buffer canvas on unmount:
```js
buf.width = 0;
buf.height = 0;
```
This frees the canvas backing store memory (P11-FIX: LOW-3h).

#### F-P5-012 — Timer Cleanup ✅
**Severity:** N/A (PASS)
**Confidence:** [CODE: App.jsx:490-494]

Debounce timers and admin tap timer are cleared on unmount. CountdownTimer clears its interval on unmount. Canvas animations cancel `requestAnimationFrame` on unmount.

**Timer/Listener balance:**
- 49 total `setInterval`/`setTimeout`/`requestAnimationFrame`/`addEventListener` calls
- 41 corresponding cleanup calls (`removeEventListener`/`clearInterval`/`clearTimeout`/`cancelAnimationFrame`)

The 8-count difference is accounted for by:
- One-shot `setTimeout` calls that don't need cleanup (they fire once and are GC'd)
- `addEventListener` in service worker registration (global, lifetime listener)

No timer or listener leaks detected.

#### F-P5-013 — Blob URL Revocation ✅
**Severity:** N/A (PASS)
**Confidence:** [CODE: App.jsx:469-470, 2591-2593]

Both blob URL creation points have matching revocations:
- Manifest blob: old href revoked before creating new one (P7-FIX)
- ID Card download: `URL.revokeObjectURL(url)` called immediately after `a.click()`

#### F-P5-014 — Mask Gradient Cache: Bounded ✅
**Severity:** N/A (PASS)
**Confidence:** [CODE: appcore-components.jsx:52-82, 85-112]

Both `_maskCache` and `_vertMaskCache` are bounded at 200 entries with full clear on overflow. This prevents unbounded memory growth from dynamic gradient generation.

#### F-P5-015 — Presence Heartbeat Every 30 Seconds
**Severity:** LOW
**Confidence:** [CODE: App.jsx — presence tracking]

The active players presence system writes to Firebase every 30 seconds. On slow/metered connections, this adds background data usage. However, this only activates when Firebase is configured.

**Solution:** Consider increasing the heartbeat interval to 60 seconds, or pausing when the app is in the background (visibilitychange).

---

### P5 Summary

| ID | Category | Severity | Finding |
|----|----------|----------|---------|
| F-P5-001 | §D1 | **MEDIUM** | **Two full-screen canvas animations running simultaneously** |
| F-P5-002 | §D1 | ✅ PASS | Deferred calculator computation |
| F-P5-003 | §D1 | **MEDIUM** | **No code splitting — Recharts always loaded** |
| F-P5-004 | §D1 | **MEDIUM** | **91+ useState in monolithic component** |
| F-P5-005 | §D1 | LOW | Collection grid without virtualization (acceptable at current scale) |
| F-P5-006 | §D2 | ✅ PASS | Font loading correctly non-blocking |
| F-P5-007 | §D2 | ✅ PASS | FOUC prevention with inline critical CSS |
| F-P5-008 | §D2 | LOW | CLS risk on some images without explicit dimensions |
| F-P5-009 | §D2 | ✅ PASS | DNS prefetch for image CDNs |
| F-P5-010 | §D3 | LOW | Recharts (~70KB gz) loaded on cold start for all users |
| F-P5-011 | §D4 | ✅ PASS | Canvas buffer cleanup |
| F-P5-012 | §D4 | ✅ PASS | Timer/listener cleanup balanced |
| F-P5-013 | §D4 | ✅ PASS | Blob URL revocation |
| F-P5-014 | §D4 | ✅ PASS | Mask gradient cache bounded |
| F-P5-015 | §D4 | LOW | Presence heartbeat every 30s on metered connections |

**Critical findings: 0**
**High findings: 0**
**Medium findings: 3** (dual canvas animations, no code splitting, monolithic state)
**Low findings: 4**
**Pass: 8**

**Overall Performance Assessment:** The app has good defensive performance practices (deferred computation, memo'd components, debounced saves, bounded caches, timer cleanup). The main performance concerns are architectural: the monolithic component pattern causes unnecessary re-execution, dual canvas animations tax low-end devices, and Recharts should be lazy-loaded. On modern devices, the app likely performs well; on low-end mobile (2-4 core, limited GPU), the canvas animations are the primary bottleneck.

*End of P5. Commit and push follows.*
