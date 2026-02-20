# Ultimate Deep Audit Prompt — Whispering Wishes v3.2.2 (v3 Improved)

> **Instructions**: Copy this entire prompt into a new conversation with the full `App.jsx` file attached.

> ⚠️ **THIS AUDIT MUST BE DELIVERED IN MULTIPLE PARTS (12–14 minimum).** Do NOT attempt it in a single response. See §II for the mandatory multi-part structure.

---

## I. CONTEXT & MISSION

You are auditing **App.jsx** (~10,144 lines) — a monolithic single-file React PWA called **Whispering Wishes**, a companion tool for the gacha game *Wuthering Waves*.

**Tech stack**: React (CDN), Tailwind CSS (CDN), Recharts, Lucide icons, vanilla JS canvas animations, Blob-based Web Worker/Service Worker, `useReducer` + `localStorage` persistence. Zero build tools.

**Your mission**: Perform an exhaustive, line-by-line audit across **60 dimensions** grouped into **11 categories**, plus a **Removal Protection** framework. Every function, component, constant, CSS rule, and data entry is in scope.

**Your role**: You are simultaneously a senior software engineer, security auditor, UX designer, game-systems analyst, accessibility specialist, performance engineer, and compliance officer.

---

## I-B. WUTHERING WAVES GAME MECHANICS REFERENCE

> **Why this exists**: The auditor must understand the game's actual mechanics to verify whether the app models them correctly. Incorrect assumptions here cascade into wrong probabilities, wrong resource planning, and wrong advice to users. This is the **ground truth** the audit should verify against.

### Gacha System Overview

WuWa's gacha system is called **Convene**. Players spend currency (Tides or Astrite) to pull for characters (Resonators) and weapons.

### Currency System

| Currency | Use | Acquisition |
|----------|-----|-------------|
| **Astrite** | Premium currency. 160 Astrite = 1 Tide of any type | Quests, events, dailies, exploration, mail, compensation, top-up |
| **Lustrous Tide** | Novice Convene, Character Permanent Convene, Weapon Permanent Convene | Exchanged from Astrite, rewards |
| **Radiant Tide** | Character Event Convene (limited banners) | Exchanged from Astrite, event rewards |
| **Forging Tide** | Weapon Event Convene (limited banners) | Exchanged from Astrite, event rewards |
| **Lunite** | Real-money premium currency, converts 1:1 to Astrite | Top-up (real money) |

**Key constant the app should use**: `ASTRITE_PER_PULL = 160`

**Lunite Subscription (Monthly Pass)**: 300 Lunite instant + 90 Astrite/day for 30 days = 300 + 2,700 = 3,000 total (equivalent).

### Banner Types (Convene)

| Banner | Tide Type | 5★ Pity | 50/50? | Notes |
|--------|-----------|---------|--------|-------|
| **Novice Convene** | Lustrous | 50 | No | 10-pull only, 20% discount (8 tides per 10-pull), disappears after first 5★, one-time only |
| **Beginner's Choice Convene** | Lustrous | 80 | Yes (50/50) | Unlocks after Novice, player selects desired 5★, disappears after first 5★ |
| **Character Permanent Convene** | Lustrous | 80 | No (random from pool) | Always available, 5 standard 5★ characters |
| **Weapon Permanent Convene** | Lustrous | 80 | No (player selects target) | Always available, 5 standard 5★ weapons, guaranteed selected weapon |
| **Character Event Convene** | Radiant | 80 | Yes (50/50 → guaranteed) | Limited-time, 1 featured 5★ + 3 featured 4★, pity carries across event banners |
| **Weapon Event Convene** | Forging | 80 | **No** (100% featured) | Limited-time, 1 featured 5★ weapon, NO 50/50 — guaranteed featured weapon at pity |

### Drop Rates (Identical Across All Banners)

| Rarity | Base Rate |
|--------|-----------|
| 5★ | 0.8% |
| 4★ | 6.0% |
| 3★ | 93.2% |

**"Consolidated rate"** often cited as 1.8% for 5★ — this is the effective rate including pity, not the base rate.

### Pity System — CRITICAL VERIFICATION TARGET

**5★ Pity:**
- **Hard Pity**: 80 pulls — guaranteed 5★ on the 80th pull if none obtained before
- **Soft Pity**: Community-determined (not officially confirmed by Kuro Games), starts around pull **65–66**, with rates increasing linearly until 100% at pull 80
- The app models this as: **0.8% base rate from pull 1–64, then linear ramp from pull 65 to pull 80** (`SOFT_PITY_START = 65`, `HARD_PITY = 80`)
- Pity counter resets to 0 when ANY 5★ is obtained
- Pity carries over between banners of the same type (e.g., one Character Event banner to the next)
- Pity is **NOT shared** across different banner types

**4★ Pity:**
- Guaranteed 4★ character or weapon every **10 pulls** if none obtained in the previous 9
- The app estimates 4★ count as `floor(pulls / 10)` — this is an approximation

**50/50 System (Character Event Convene only):**
- When a 5★ drops on a Character Event banner, there is a **50% chance** it's the featured (rate-up) character
- If you get a non-featured 5★ (lose the 50/50), your **next** 5★ on that banner type is **guaranteed** to be the featured character
- This "guarantee" state carries over across different Character Event banners
- **Weapon Event Convene has NO 50/50** — the 5★ weapon is always the featured weapon

**Worst-case pulls to guarantee a specific character/weapon:**
- **Character**: `copies × 2 × 80 = copies × 160` pulls (lose every 50/50, hit hard pity every time)
- **Weapon**: `copies × 80` pulls (no 50/50, hit hard pity every time)

### Server Regions & Timezones

| Server | Timezone | UTC Offset | DST? |
|--------|----------|------------|------|
| **Asia** | CST (China Standard Time) | UTC+8 | No |
| **SEA** (Southeast Asia) | UTC+8 (same as Asia) | UTC+8 | No |
| **HMT** (Hong Kong/Macao/Taiwan) | UTC+8 (same as Asia) | UTC+8 | No |
| **America** | UTC-5 (EST) / UTC-4 (EDT) | UTC-5 or UTC-4 | **Yes** (US DST rules) |
| **Europe** | UTC+1 (CET) / UTC+2 (CEST) | UTC+1 or UTC+2 | **Yes** (EU DST rules) |

**Daily Reset**: 4:00 AM server local time, every day
**Weekly Reset**: Monday 4:00 AM server local time

> ⚠️ **DST is a critical audit target.** Asia/SEA/HMT never change offset (UTC+8 always). America and Europe shift twice a year. The app must handle DST transitions for countdowns, banner end times, and reset timers.

### Version & Banner Schedule Structure

- Game updates roughly every **5–6 weeks** (a "version" or "patch")
- Each version typically has **2 banner phases** (first half + second half)
- Each phase features **1 limited 5★ character + 1 limited 5★ weapon** (sometimes reruns run alongside new characters)
- Banner end dates are set to specific server times and must account for timezone differences

### Typical F2P Income Per Version (Approximate)

- **Daily commissions**: 60 Astrite/day
- **Lunite Subscription** (if purchased): 90 Astrite/day
- **Events, codes, compensation, achievements**: varies per version, typically 8,000–15,000+ Astrite total per version for F2P
- **Battle Pass** (if purchased): additional tides and Astrite

> The app's income tracker and resource planner should account for these sources. Verify that the hardcoded economy values match current game data.

---

## I-C. CRITICAL USER WORKFLOWS TO AUDIT

> **Why this exists**: Bugs are most impactful when they break real user journeys. The auditor should trace these workflows end-to-end through the code and verify correctness at each step.

### Workflow 1: New User — First Visit to First Calculation

```
Landing → Onboarding flow (5 steps) → Select server region → Set current pity (0–79) 
→ Set current astrite → Set 50/50 status (won/lost) → Set desired copies (1–7) 
→ View probability results → View chart → Understand what the numbers mean
```

**Audit checkpoints:**
- Does onboarding actually trigger on first visit? Can it be re-triggered?
- Are all inputs validated during onboarding? (pity range, astrite non-negative, etc.)
- Is the default server region sensible?
- Does the calculator show correct results immediately after onboarding, or is there a stale-state flash?
- Are results accessible to screen readers?
- What happens if the user closes onboarding mid-flow?

### Workflow 2: Returning User — Daily Update Routine

```
Open app → Auto-load saved state from localStorage → Check countdown timers (daily/weekly/version) 
→ Update astrite (add daily income) → Check if banner has changed → View updated probabilities
```

**Audit checkpoints:**
- Is localStorage load validated? What if schema has changed between versions?
- Do timers show correct values immediately, or flash wrong values first?
- Is adding daily income a single action or multiple steps?
- If the user opens in a new tab, is state in sync?
- What happens if the app was cached by SW and is now stale?

### Workflow 3: Pull History Import & Analysis

```
Copy pull history from third-party tracker → Paste/upload JSON → Preview import → Confirm 
→ Deduplication with existing history → View merged history → See luck rating → See pull statistics
```

**Audit checkpoints:**
- What formats are accepted? Is format detection robust?
- What happens with malformed JSON? Partially valid data?
- Does deduplication correctly handle timestamp collisions?
- Is there a preview step before committing?
- Can the import be undone?
- Is a pre-import backup automatically saved?
- Could malicious JSON cause XSS or prototype pollution?

### Workflow 4: Planning for a Specific Character

```
Browse upcoming banners → Select desired character → Set current pity/50-50/astrite state 
→ View probability of getting them → See "missing astrite" → Explore income sources → Add income 
→ See updated probability → Bookmark this plan
```

**Audit checkpoints:**
- Is banner data up to date? Are predicted banners clearly labeled?
- Does changing any input immediately update all derived values?
- Is the "missing astrite" calculation correct (total needed minus current)?
- Does bookmarking save ALL relevant state? Can it be restored accurately?
- Does the dual-banner optimizer correctly handle character + weapon jointly?

### Workflow 5: Dual Banner Allocation (Character + Weapon)

```
Set character target (copies) → Set weapon target (copies) → Set total available pulls 
→ App recommends optimal allocation → View combined probability → Adjust manually if desired
```

**Audit checkpoints:**
- Does `recommendDualAllocation` correctly solve the optimization?
- Is the independence assumption valid? (Character and weapon banners are independent in WuWa — yes)
- Does it correctly account for 50/50 on character but not weapon?
- Are edge cases handled? (0 pulls available, already guaranteed, very high copies)

### Workflow 6: Collection Tracker Management

```
Browse character/weapon grid → Mark owned characters → View character detail modal 
→ See skills, materials, echo sets, team comps → Filter/search collection
```

**Audit checkpoints:**
- Does the collection grid render smoothly with all 40+ characters?
- Is owned/not-owned state persisted correctly?
- Do character detail modals load the correct data for each character?
- Are images loading with fallbacks?
- Is the detail modal accessible (keyboard nav, screen reader, focus trap)?

### Workflow 7: Export → Fresh Device → Import Round-Trip

```
Export all data to JSON → Clear browser / open on new device → Import JSON 
→ Verify all state restored: pity, history, bookmarks, collection, income, settings
```

**Audit checkpoints:**
- Does the export include every piece of user state?
- Does import correctly restore ALL fields?
- Is export format versioned? What if importing an older format?
- Round-trip: `export → import → export` → are the two exports identical?
- File size: could a heavy user's export exceed `MAX_IMPORT_SIZE_MB`?

### Workflow 8: Admin Panel Access

```
Enter admin password → SHA-256 hash comparison → Access admin features → Perform admin actions → Log out
```

**Audit checkpoints:**
- Is the hash comparison constant-time? (Timing attack risk)
- Can the 5-attempt lockout be bypassed by clearing localStorage?
- Is the password ever stored in plaintext?
- What admin actions are available, and are they all properly guarded?
- Is there a session timeout?

### Workflow 9: Offline Usage (PWA)

```
Install PWA → Go offline → Open app → View cached data → Perform calculations 
→ Try to use features requiring network (images, presence) → Come back online
```

**Audit checkpoints:**
- Does the SW cache all critical assets?
- Can the full calculator work offline?
- Do images show fallbacks when offline?
- What happens to the presence system when offline?
- When coming back online, does state re-sync correctly?
- Is the SW blob approach working across browsers? (Known: Firefox/Safari issues)

### Workflow 10: Edge Case — Long-Term User with Massive Data

```
User has 10,000+ pull history entries → 50+ bookmarks → 2+ years of income history 
→ App must still load quickly → localStorage approaching 5MB → Export still works → Search still works
```

**Audit checkpoints:**
- Does localStorage size stay within limits? Is there a warning?
- Is rendering performance acceptable with large datasets?
- Does JSON.stringify on large state cause main-thread jank?
- Is history search/filter efficient?
- Could old data be archived or compressed?

---
## II. EXECUTION PLAN — MANDATORY MULTI-PART STRUCTURE

### Why This Exists

At ~10,144 lines with 60 dimensions, a single-response audit **will** hit output limits, lose context, and truncate critical findings. You MUST split across multiple responses.

### Pre-Flight Check (Do This FIRST)

Before writing any findings, confirm:
1. ☐ You can see the full `App.jsx` file (verify approximate line count)
2. ☐ You have read this entire audit prompt
3. ☐ You will announce: *"This audit will be delivered in [N] parts."*

If the file appears truncated or unavailable, **stop and tell the user immediately.**

### Splitting Rules

1. **NEVER attempt the full audit in one response.** Output will truncate and the most important findings will be lost.
2. **Plan for 12–14 parts minimum.** Each part covers 3–5 dimensions with thorough, specific findings.
3. **Each part must be self-contained and actionable.** Begin with a coverage header; end with a running totals summary.
4. **Prioritize depth over breadth.** A finding like "some components may re-render unnecessarily" is worthless. A finding like `[MEDIUM] BannerCard at line 4521 re-renders on every parent state change because the memo() comparison at line 4518 doesn't check bannerData.endDate` is valuable.
5. **If you're writing one-line findings — STOP and split further.**

### Anti-Hallucination Rules

- **NEVER invent line numbers.** If you cannot identify the exact line, say "approximately near [function/section name]" instead.
- **NEVER assume code behavior without reading it.** If a section is unclear, note it as "requires closer inspection" rather than fabricating a finding.
- **NEVER report a bug you haven't traced through the actual code path.** Theoretical concerns should be labeled `[THEORETICAL]`.
- **Clearly distinguish** between confirmed bugs (you traced the code), likely bugs (strong evidence but not fully traced), and potential concerns (plausible but unverified).

### Recommended 14-Part Breakdown

| Part | Focus | Dimensions | Key Deliverables |
|------|-------|-----------|------------------|
| **1** | Pre-Flight, Planning & Inventory | §55, §58, §59, §I-B, §I-C | Pre-Flight Check, Feature Preservation Ledger, Architecture Constraint Acknowledgments, Game Mechanics Verification Notes, confirmed audit plan |
| **2** | Core Math & Statistics | §1-gacha, §32, §31 | Statistical Verification Results, probability engine findings |
| **3** | State Management & Data Flow | §1-reducer, §19, §26, §29, §30, §49 | Data Integrity Report, reducer action audit |
| **4** | Game Data Accuracy | §4, §34, §35, §56 | Data Completeness Scorecard, Data Accuracy Report |
| **5** | Security & Privacy | §2, §12, §38, §48 | Sensitive Data Inventory, security findings |
| **6** | UI/UX & Accessibility | §5, §6, §41, §42, §52 | Accessibility findings, Error Message Inventory |
| **7** | Design System & Typography | §11, §14, §15, §46, §57 | Typography & Design Token Audit |
| **8** | Performance & Web Vitals | §3, §39, §47 | Performance findings, Resource Budget Breakdown |
| **9** | Memory, Animation, Canvas & Stress | §24, §23, §10 | Memory leak audit, animation findings, edge case inventory |
| **10** | Platform, PWA & Degradation | §8, §9, §27, §28, §50 | Compatibility matrix, Graceful Degradation Matrix |
| **11** | Images, Assets & Export | §40, §51, §44 | Image & Asset Audit, scroll/print findings |
| **12** | Code Quality & Architecture | §7, §13, §22, §25, §53 | Code quality findings, component architecture audit |
| **13** | Time, Data Presentation & Trust | §33, §54, §36, §37, §43, §45 | Number Formatting Audit, Timezone Verification |
| **14** | Final Report & Synthesis | §16–§18, §20, §21 + all remaining | **Final Summary Dashboard**, Priority Action Items, consolidated cross-cutting findings |

### Running Summary Protocol

At the END of every part:

```
═══════════════════════════════════════════
RUNNING TOTALS (after Part X of N)
═══════════════════════════════════════════
CRITICAL: [count] ([+new this part])
HIGH:     [count] ([+new this part])
MEDIUM:   [count] ([+new this part])
LOW:      [count] ([+new this part])
NIT:      [count] ([+new this part])
VERIFIED: [count] ([+new this part])
───────────────────────────────────────────
Root causes identified: [RC-01: ..., RC-02: ..., ...]
Quick wins (HIGH+ severity, Trivial/Small effort): [count]
Compound findings: [count]
───────────────────────────────────────────
Dimensions completed: [list]
Dimensions remaining: [list]
Deliverables completed: [list]
Deliverables remaining: [list]
───────────────────────────────────────────
Cross-cutting issues noticed (for later parts): [brief notes]
Next part will cover: [brief preview]
═══════════════════════════════════════════
```

### Between Parts

- **Wait** for the user to say "continue" / "next" / "part X" before proceeding.
- If the user asks to skip, go deeper, or provides corrections — accommodate.
- **Announce any plan changes** at the start of the affected part.
- **Carry forward** any cross-cutting issues noted in previous parts.

### Anti-Truncation Safeguards

- **Aim for 60–80% of max output capacity per part** — leave a buffer.
- If approaching the limit, STOP at a clean section boundary and post the running summary.
- Never sacrifice finding quality for coverage.
- Never skip the running summary — it ties all parts together.
- If you hit truncation, the user will ask you to redo from the last clean summary.

### Part Quality Self-Check

Before posting each part, quickly verify:
- ☐ Every finding has a specific line number or function reference (not "somewhere in the file")
- ☐ Every finding above LOW includes a concrete fix (not just "should be improved")
- ☐ No two findings in this part describe the same root cause — if so, merge them
- ☐ Severity ratings are consistent with §III calibration
- ☐ Running summary is included at the end

### Positive Verification Protocol

**Don't only report bugs.** When you verify that a critical path works correctly, note it:

```
[VERIFIED] ✓ Title
Dimension: §X
Line(s): #
What was checked: Brief description
Result: Confirmed correct / Working as intended
```

This is especially important for:
- Gacha probability math (DP solver, MC simulation, percentile calculations)
- Worst-case formulas
- 50/50 vs guaranteed logic
- Weapon banner (no 50/50) vs character banner handling
- Import/export round-trip integrity
- Pity carry-over between banners

Positive verifications build trust in the audit and help the developer know which code is safe to leave untouched. **Aim for at least 3–5 positive verifications per part where applicable.**

### Root Cause Grouping

Multiple findings may share the same root cause. When this happens:
- **Tag findings with a root cause ID**: e.g., `Root cause: RC-03 (no input validation on numeric fields)`
- **In the running summary**, maintain a root cause list so the final report can group fixes
- A single root-cause fix that resolves 5 symptoms is far more valuable than 5 individual patches

### Compound Severity

Two individually-MEDIUM findings that **interact** may produce a CRITICAL outcome. Flag these:

```
[COMPOUND-HIGH] Title
Components: Finding #12 (MEDIUM) + Finding #27 (MEDIUM)
Interaction: [How they combine to produce a worse outcome]
Combined impact: [What actually happens to the user]
```

Example: "Pity accepts value 81" (MEDIUM) + "DP solver doesn't bounds-check pity input" (MEDIUM) = array out-of-bounds crash or wrong probabilities for all users who mistype (COMPOUND-HIGH).

### Context Continuity Protocol

Over 14 parts, earlier context will fade. To maintain coherence:
- **Each part's opening** should briefly reference key findings from previous parts that affect the current dimensions
- If the user notices you've forgotten something, they may paste key findings back — incorporate them without complaint
- The **Final Report (Part 14)** must re-read all running summaries to produce a coherent synthesis

---

## III. SEVERITY CALIBRATION

> Assign consistent severity ratings. Do not inflate — a mislabeled CRITICAL dilutes real findings.

| Severity | Definition | Examples |
|----------|-----------|----------|
| **CRITICAL** | Data loss, security breach, wrong probability results shown to users, app crash with no recovery, persistent state corruption | DP solver returning wrong probabilities; XSS via import; state corruption surviving reload |
| **HIGH** | Feature broken for a meaningful user segment, incorrect game data misleading planning, >3s delays on common actions | Wrong character element; unbounded memory leak; missing error boundary causing white screen; tab navigation completely unreachable by keyboard (blocks all screen-reader users) |
| **MEDIUM** | Edge-case bugs, minor data inaccuracies, low-end device issues, inconsistent but functional UI | Timer off by 1hr during DST; hover state missing on one button; pity allowing value 81; all probability text fails WCAG AA contrast on OLED mode; DP computation >500ms on mid-range mobile |
| **LOW** | Code quality issues not affecting users, minor visual inconsistencies, missing best practices | Inconsistent naming; missing `memo()` on rarely-rendered component; missing alt text on decorative image; no `aria-live` on a rarely-updated status region |
| **NIT** | Style preferences, optional improvements, minor doc gaps | Magic number could be a const; slightly outdated comment; 5px spacing should be 4px |

**Anti-Inflation Rules:**
- CRITICAL only if it affects ALL users or causes IRREVERSIBLE damage
- HIGH only if it affects a SIGNIFICANT user segment or produces WRONG information
- When in doubt, rate one level LOWER than your first instinct
- Performance issues are HIGH/CRITICAL only on common user paths
- Code quality issues are almost never above MEDIUM unless they mask a real bug
- **Use the workflows in §I-C as your "common user paths" guide** — a bug in Workflow 1 (first visit) or Workflow 2 (daily use) is more severe than one in Workflow 8 (admin panel)

**Expected Distribution** (calibration guide, not a quota):
A well-maintained ~10K-line app typically yields ~0–3 CRITICAL, ~5–15 HIGH, ~20–40 MEDIUM, ~30–60 LOW, ~20–40 NIT. If your counts diverge wildly, re-examine your calibration.

**Confidence Tags** — Append to any finding where you're not 100% certain:
- `[CONFIRMED]` — You traced the full code path and verified the bug exists
- `[LIKELY]` — Strong evidence but not fully traced (e.g., pattern matches a known bug class)
- `[THEORETICAL]` — Plausible concern based on architecture, but not verified in code
- `[NEEDS-RUNTIME]` — Cannot be verified by static analysis alone; requires runtime testing

---

## IV. AUDIT DIMENSIONS (60 Total)

---

### Category A — Correctness & Core Logic

#### §1. CORRECTNESS & LOGIC BUGS

> **Cross-reference**: Verify all gacha math against the ground-truth mechanics in §I-B. Trace each bug's impact through the user workflows in §I-C.

- **Gacha Probability Engine**: Verify `computeDistDP`, `computeDistMC`/`simulateOneRun`, `computeGachaDist`, `expectedPullsToTarget`, `minPullsForProb`, `computeCombinedOutcomes`, `recommendDualAllocation`. Check:
  - Is the soft pity ramp `getPullRate()` mathematically correct for WuWa's known rates (0.8% base, linear 65→80)?
  - Does the DP table correctly handle the 4D state space `[pulls][pity][guaranteed][copies]`?
  - Are weapon banners (100% featured) vs character banners (50/50 with guarantee) handled correctly in every path?
  - Is the DP normalization correct? Could floating-point accumulation cause drift?
  - Does `GACHA_EPS = 1e-15` create correctness issues by skipping valid states?
  - Does `minPullsForProb` binary search converge correctly? Could MC stochastic noise cause oscillation?
  - Is `expectedPullsToTarget` value iteration solving in the correct direction? Boundary conditions?
  - Does `computeCombinedOutcomes` correctly model joint probability of independent banner outcomes?
  - Does `recommendDualAllocation` correctly compute for both `expected` and `prob90` modes?
- **calcStats Function**: Does it correctly compute successRate, p1–p7, missingPulls, missingAstrite, expectedCopies, stddev, worstCase? Is the worst-case formula correct for both character and weapon banners?
- **4★ Calculations**: Is `fourStarCount = floor(pulls / 10)` a valid estimate? Does `FEATURED_4STAR_RATE = 0.5` match actual game mechanics? Is pity4 computed correctly?
- **Luck Rating** (`computeLuckRating`): Is the σ-based classification (mean 62.5, std dev 12) statistically sound? Edge cases (0 pulls, 1 pull, all hard pity)?
- **State Reducer**: **List every action type found in the reducer** and confirm each is (a) dispatched somewhere, (b) handles state immutably, (c) has valid edge case handling. Do not skip unnamed actions. Specifically verify these known high-risk actions:
  - Immutability violations (direct state mutation)
  - Missing spread operators causing lost fields (especially nested objects like `...state.settings`)
  - Incorrect arithmetic (ADD_INCOME, REMOVE_INCOME, CLEAR_ALL_INCOME, ADD_DAILY_INCOME)
  - Edge cases: negative astrite, NaN propagation, integer overflow
  - IMPORT_HISTORY deduplication — timestamp collisions causing data loss?
  - LOAD_BOOKMARK — does it restore all necessary fields?
  - CLEAR_PROFILE — does it preserve username/profilePic while clearing everything else?
  - RESET — safe? Orphaned state?
- **Countdown Timers**: Do `getNextReset()`, `getWeeklyReset()`, `getEndOfVersion()` handle DST, timezone edge cases, leap seconds, server offsets? What happens at exactly midnight or with a wrong system clock?
- **Banner Date Logic**: Does `getServerAdjustedEnd()` correctly convert UTC to server-local time for all 5 regions? DST rules correct?
- **History Deduplication**: Does `deduplicateMerge()` correctly merge by `timestamp|name`? Could duplicate 3★ weapons cause data loss?

#### §29. DATA INTEGRITY & VALIDATION

- **Input Validation Completeness**: For every user input (pity, astrite, copies, income, import JSON, admin password) — is validation applied? List every input and its validation rules or lack thereof.
- **Type Coercion Risks**: Are string-to-number conversions safe? `parseInt` radix? `"" + 0`? NaN propagation?
- **Boundary Value Enforcement**: Min/max constraints on all numerics? Can pity exceed 80? Copies go negative? Astrite be NaN or Infinity?
- **Data Shape Validation on Load**: When state loads from localStorage, is every field validated for type, range, and existence?
- **Import Data Sanitization**: Is every field of every imported record validated? Could malformed records corrupt the app?
- **Floating-Point Precision**: Are probability values subject to drift? Epsilon comparisons used? `0.1 + 0.2 !== 0.3` bugs?
- **Data Invariants**: What invariants should always hold? (`totalPulls >= 0`, `pity >= 0 && pity < 80`, `probability >= 0 && probability <= 1`) — are these checked?
- **Output Validation Before Display**: Are computed results sanity-checked before rendering? If the DP solver returns NaN, Infinity, negative probability, or probability > 1 due to bad inputs, does the UI show "NaN%" to the user or catch it? Is there a guard between computation and display?

#### §30. DATA FLOW & TRANSFORMATION PIPELINE

- **End-to-End Data Flow**: Trace `user inputs → reducer state → gacha computation → chart rendering → displayed percentages`. What could go wrong at each step?
- **Derived Data Consistency**: Are derived values (expectedCopies, successRate, luckRating) always recomputed when source data changes?
- **Async Data Race Conditions**: Could the user change inputs while the Worker is computing? Are results matched to requests? Could stale results overwrite fresher ones?
- **Side Effect Ordering**: Are localStorage writes, Worker messages, and timer updates ordered correctly?
- **Cascading Update Chains**: When pity changes, are all downstream values (probability, expected pulls, missing astrite, luck rating) updated atomically?
- **Import/Export Round-Trip**: Does `export → import` produce identical state? Any fields lost?

#### §26. CONDITIONAL RENDERING & STATE MACHINE INTEGRITY

- **Impossible States**: Are there state variable combinations that should be impossible but aren't prevented? (e.g., `isLoading: true` and `hasError: true`)
- **Boolean Explosion**: Are related booleans (`isOpen`, `isLoading`, `isError`, `isSuccess`) that should be a single enum?
- **Null/Undefined Rendering**: Could `null`/`undefined` reach JSX and render as the string "null" or cause a React error?
- **Fallback Chains**: Are `?.` chains silently swallowing real bugs?

#### §49. CONFLICT RESOLUTION & DATA RECONCILIATION

- **Concurrent Tab Conflicts**: Two tabs modifying state — last write wins? Partial overwrites?
- **Import Merge Strategy**: Overlapping data — what wins? Is it deterministic?
- **Deduplication Conflicts**: Same key, different data — which record wins?
- **localStorage Key Namespacing**: Could another app on the same origin collide?

#### §19. STATE MANAGEMENT & DATA MIGRATION

- **Schema Versioning**: Version number on localStorage schema? Migration path when schema changes?
- **Forward Compatibility**: Newer schema than code expects — graceful failure?
- **Backward Compatibility**: New fields have defaults for older saved states?
- **State Size Growth**: Could years of history + bookmarks hit ~5MB limit? Warning threshold realistic?
- **Corruption Recovery**: Invalid JSON in localStorage (crash mid-write, extension interference) — app recovers?
- **State Atomicity**: Multi-field updates atomic? Crash mid-dispatch leave inconsistent state?
- **Cross-Version State**: User downgrades app (cached PWA) — older code works with newer state?
- **State Dehydration**: Full state serialized including recomputable values? Could state be smaller?
- **Default State Completeness**: `initialState` defines every field? Any created only by specific actions but assumed elsewhere?

---

### Category B — Mathematics & Statistics

#### §32. STATISTICAL & MATHEMATICAL INTEGRITY

- **Distribution Correctness**: Does the CDF sum to 1.0 (within tolerance)? Is residual probability handled?
- **Expected Value**: Is `E[X] = Σ(x * P(x))` computed correctly? Off-by-one in summation range?
- **Standard Deviation**: Is `σ = sqrt(E[X²] - E[X]²)` stable? Catastrophic cancellation giving negative variance?
- **Percentile Accuracy**: Are P10/P25/P50/P75/P90 computed as proper quantiles?
- **MC Convergence**: At 50K/100K/200K trials, what's the theoretical standard error? Is there a convergence check?
- **DP vs MC Agreement**: When both available, do they agree within tolerance? Is disagreement flagged?
- **Joint Probability Independence**: Is the character + weapon independence assumption correct for WuWa?
- **Worst-Case Formula**: Is `copies * 2 * HARD_PITY` (character) / `copies * HARD_PITY` (weapon) provably correct?
- **Numerical Stability**: Does the DP table accumulate errors over 500+ iterations? Should Kahan summation be used?
- **Confidence Intervals**: Are displayed probabilities accompanied by uncertainty estimates?
- **Known-Good Test Vectors**: Use these community-verified approximate values to spot-check the engine:
  - Character banner, 1 copy, 0 pity, not guaranteed: expected value ≈ 62.5 pulls, median ≈ 67, P(≤80) ≈ 84%
  - Weapon banner, 1 copy, 0 pity: expected value ≈ 54 pulls (no 50/50, more favorable)
  - Character banner, worst case 1 copy: exactly 160 pulls (lose 50/50 + hard pity twice)
  - Weapon banner, worst case 1 copy: exactly 80 pulls (hard pity once, no 50/50)
  - CDF must sum to ≥0.9999 within the supported pull range; any residual probability should be accounted for

#### §31. DATA VISUALIZATION ACCURACY

- **Chart Data Mapping**: Are Recharts data points aligned correctly? Off-by-one showing pull N-1 instead of N?
- **Axis Scaling**: Could very small probabilities be invisible? Could large pull counts compress the useful range?
- **Rounding in Display**: What rounding is applied to percentages? Consistent strategy?
- **PityRing / ProbabilityBar Accuracy**: Arc calculation correct? 0% and 100% edge cases? Bar width matches value?
- **Tooltip Precision**: Exact computed values or re-approximated?
- **Visual vs Computed Agreement**: For every displayed number, verify it matches the computed value.
- **Chart Responsiveness**: Correct resize behavior? Labels overlapping at narrow widths?

---

### Category C — Game Data

#### §4. DATA ACCURACY (GAME CONTENT)

**Data accuracy is existential for a game companion app.** Cross-reference every piece against §I-B (Game Mechanics Reference) and current game data. Verify every piece:

- **All 32+ five-star characters**: Names, elements, weapon types, roles (Main DPS/Sub DPS/Support/Healer)
- **All 12+ four-star characters**: Same checks
- **All weapons** (signature + standard pool): Names, types, character assignments
- **Character Skills** (4 per character = 128+ skills): Names and descriptions accurate?
- **Ascension Materials**: Material names, boss material assignments per character
- **Echo Set Recommendations**: Current with latest meta? Set bonuses described correctly?
- **Team Compositions**: 2 teams per character — viable? Role assignments sensible?
- **Banner History Archive** (v1.0 → v3.1): All dates, character/weapon assignments, start/end dates correct? Predicted banners flagged?
- **Standard Pool**: 5 standard characters, 10 standard weapons — correct and up to date?
- **Events**: Names, subtitles, reward amounts, reset types, countdown end dates for current version
- **Economy**: Subscription prices, astrite amounts, top-up crystal amounts, `ASTRITE_PER_PULL = 160`
- **Pity Constants**: `HARD_PITY = 80`, `SOFT_PITY_START = 65`, 0.8% base rate, linear ramp
- **Release Order**: Character and weapon release order arrays match actual chronological release?
- **Featured 4-Stars per Banner**: Correctly listed for current and historical banners?

#### §34. DATA COMPLETENESS & COVERAGE

- **Character Roster**: All characters released up to stated version included? Count vs known roster?
- **Weapon Roster**: All 5★ and 4★ weapons? Standard pool separated from limited?
- **Skill Data**: All characters have exactly 4 skills?
- **Material Data**: Complete ascension material lists? Boss materials? Weekly boss materials?
- **Banner History**: Every banner from v1.0 to current? Any gaps?
- **Event Coverage**: All current-version events listed?
- **Standard Pool**: Updated as characters/weapons are added?
- **Economy Data**: All free astrite sources accounted for? (Dailies, weeklies, events, compensation, gifts, achievements, exploration, mail)
- **Echo Sets**: All sets represented? New sets from recent patches?

#### §35. DATA RELATIONSHIPS & CROSS-REFERENCING

- **Character ↔ Weapon**: Every character has correct signature weapon? Bidirectional?
- **Character ↔ Element**: Consistent across all references (collection, banners, detail modal, teams)?
- **Character ↔ Banner**: Every banner character exists in the database?
- **Banner ↔ Dates**: Aligned with version timeline? No overlaps or gaps?
- **Team ↔ Roster**: All recommended characters exist? Roles consistent?
- **Material ↔ Character**: Correctly mapped? All materials are known game materials?
- **Skill Names ↔ Game**: Exact match with official in-game names?

#### §33. DATA FRESHNESS, STALENESS & TEMPORAL INTEGRITY

- **Game Data Currency**: As of what version is data accurate? Is there a `DATA_VERSION` constant?
- **Banner Schedule Staleness**: After end dates pass, are banners shown as "ended"?
- **Event Expiration**: Expired events — hidden, grayed, or incorrectly shown as active?
- **Version Number**: Is v3.2.2 reflected in code? Single source of truth or hardcoded in multiple places?
- **Cache Staleness**: Could SW cache-first serve outdated character art?
- **Timezone-Dependent Freshness**: Is "daily reset" correct for all 5 regions simultaneously?
- **History Temporal Ordering**: Always sorted chronologically? Out-of-order entries cause bugs?

---

### Category D — Security, Privacy & Compliance

#### §2. SECURITY & DATA SAFETY

- **Admin Panel**: SHA-256 hash auth — is the expected hash visible in the JS source code? Can a user simply read it and use a rainbow table or brute-force the short password offline? Is the hash comparison constant-time or vulnerable to timing attacks? Is the 5-attempt lockout counter stored in localStorage where the user can reset it to 0 by clearing storage? Password in plaintext anywhere (source, state, logs)?
- **localStorage**: Sensitive data unencrypted? Same-origin access risk? 5MB warning threshold correct?
- **Import/Export**: Prototype pollution, XSS, or state corruption from malicious JSON? `MAX_IMPORT_SIZE_MB = 5` enforced? `JSON.parse` in try/catch?
- **External Resources**: All HTTPS? Mixed-content risks? Tracking via image hosts?
- **Service Worker**: Cache poisoning vectors? Versioning and cleanup correct?
- **eval/innerHTML/dangerouslySetInnerHTML**: Any use? XSS vectors?
- **Web Worker**: Blob URL secure? Tamper risk? 10s timeout fallback safe?
- **Crypto**: `crypto.randomUUID()` fallback sufficiently unique?

#### §12. POLICIES & COMPLIANCE

- **CSP**: Meta tag or header? `unsafe-inline`/`unsafe-eval` required? What breaks under strict CSP?
- **CORS**: External resources subject to restrictions? Silent failures?
- **Privacy**: PII collected? GDPR/CCPA compliance? Privacy policy?
- **Data Retention**: Full deletion possible? Orphaned localStorage keys?
- **Third-Party Sharing**: Image hosts and CDNs receive IP/referrer — disclosed?
- **Game IP**: Copyrighted assets used? Legal disclaimer?
- **Age Restrictions**: Gambling-adjacent mechanics — age-gating considerations?

#### §38. DATA SECURITY & PRIVACY IN DEPTH

- **Sensitive Data Inventory**: Classify all stored data (public / private / sensitive)
- **Data Minimization**: Only minimum necessary data stored?
- **localStorage Enumeration Risk**: Other same-origin scripts can read everything
- **Export Sensitivity**: Unexpected sensitive info in export JSON?
- **Timing Attacks**: Admin hash comparison vulnerable?
- **Data in URL**: State in hash/query params leaking via referrer?
- **Third-Party Fingerprinting**: Image hosts logging IP, referrer, user agent
- **Presence System Anonymity**: Session IDs correlatable?

#### §48. REGEX & STRING SAFETY

- **ReDoS**: Any regex on user input with catastrophic backtracking risk? List every regex.
- **String Injection**: User strings interpolated into HTML, CSS, URLs, or class names?
- **JSON.parse Safety**: In try/catch everywhere?
- **Unicode Handling**: Special characters in names breaking `split`/`slice`/`length`?
- **URL Construction**: String concatenation producing invalid URLs?

---

### Category E — Performance & Resources

#### §3. PERFORMANCE & OPTIMIZATION

- **DP Solver Memory**: 500 × 81 × 2 × 11 = ~891K entries — memory footprint? At what N does it break? 500-pull MC threshold optimal?
- **MC Trials**: 50K/100K/200K sufficient? Standard error at each level?
- **React Re-renders**: Every component that could re-render unnecessarily. All `memo()` comparison functions correct? Missing `useCallback`/`useMemo` deps?
- **Canvas Animations**: 15fps throttle CPU cost? `requestAnimationFrame` cleanup? Visibility pause? Memory leaks? Low-end mobile?
- **Large Lists**: Collection grid jank? Virtualization needed?
- **localStorage I/O**: `saveToStorage` frequency? Synchronous `JSON.stringify` jank?
- **Event Listeners**: All `addEventListener` paired with `removeEventListener` in cleanup?
- **CSS-in-JS**: `KuroStyles` re-created every render? OLED toggle full recalc?
- **Computation Feedback Loop**: When DP/MC is computing, does the user see a loading indicator or do results just silently appear? If computation takes >200ms, is there any feedback?

#### §39. WEB VITALS & CRITICAL RENDERING PATH

- **LCP**: Largest element on first load? Blocked by render-blocking resources?
- **FID / INP**: Long tasks (>50ms) during initial load? DP/MC blocking main thread?
- **CLS**: Images without width/height? Dynamic components shifting content? Font reflow?
- **Render-Blocking Resources**: Which CDN scripts block rendering? `defer`/`async` candidates?
- **First Meaningful Paint**: Blank screen, FOUC, or skeleton?
- **JS Parse Time**: ~10K lines parse/compile time on low-end mobile?
- **Resource Hints**: `preconnect`, `dns-prefetch`, `preload` for critical origins?
- **Initial Render Cost**: Expensive computations triggered on mount instead of on-demand?

#### §47. RESOURCE BUDGET & PAGE WEIGHT

- **JS Budget**: App code + React + ReactDOM + Recharts + Lucide (40+ imports) + Tailwind
- **CSS Budget**: Full Tailwind (~3MB from CDN?) + KuroStyles
- **Image Budget**: Total image payload per tab and whole app
- **Total First Load**: Complete transfer size? Reasonable on 3G?
- **Cached Load**: Post-SW size and time?
- **CDN Weight**: CDN libs vs app code ratio? Lighter alternatives?
- **Unused Code Ratio**: How much of ~10K lines executes in a typical session?
- **Compression**: gzip/brotli? Compressed vs uncompressed size?

#### §24. MEMORY MANAGEMENT & GARBAGE COLLECTION

- **Closure Leaks**: Closures capturing large objects preventing GC?
- **DOM Node Leaks**: Canvas, style tags, blob URLs cleaned up on unmount?
- **Blob URL Cleanup**: `URL.revokeObjectURL` called for Workers and exports?
- **Timer Leaks**: All `setInterval`/`setTimeout` cleared on unmount?
- **Worker Cleanup**: Terminated when not needed? Multiple Workers spawned accidentally?
- **Large Array Retention**: DP table released after computation or held in closure?

#### §23. ANIMATION & MOTION DESIGN SYSTEM

- **Motion Consistency**: Same easing curves? Entry/exit animation direction?
- **Duration Scale**: Consistent system (150ms micro / 300ms standard / 500ms dramatic)?
- **Reduced Motion**: Every animation (CSS + canvas) respects `prefers-reduced-motion`?
- **GPU Compositing**: Using `transform`/`opacity` only? Or animating layout properties?
- **Interruption Handling**: Tab switch mid-animation? Click during fade-in? Stuck states?
- **Canvas Lifecycle**: `requestAnimationFrame` canceled on unmount? Zombie loops?

#### §10. EDGE CASES & STRESS TESTING

- **Massive History**: 10,000+ entries — rendering, sorting, deduplication, localStorage limits?
- **Rapid State Changes**: Rapidly clicking +/- on pity — race conditions?
- **Concurrent Tabs**: localStorage write conflicts? Data loss?
- **Clock Manipulation**: System clock forward/backward — timers break? Events wrong status?
- **Extreme Inputs**: pity=80, copies=10, astrite=99999999, negative values?
- **Network Interruption**: Images mid-load? Presence API fail? CDN scripts fail?
- **Memory Pressure**: DP solver OOM on low-memory mobile?

---

### Category F — UI, UX & Design

#### §5. UI/UX AUDIT

- **Visual Consistency**: Cards, buttons, badges, overlays — consistent border-radius, spacing, font sizes, color tokens? One-off hardcoded values?
- **Font Usage**: List every unique `text-*` class and `font-size`. Heading sizes, body, captions, labels following a coherent typographic scale?
- **Color Accessibility**: All text-on-background combos meet WCAG AA? (4.5:1 normal, 3:1 large) — check gray-400 on dark, cyan-400 on dark, element colors on bg-opacity
- **Non-Text Contrast**: Borders, icons, focus rings, form controls meet WCAG 2.1 AA §1.4.11 (3:1 against adjacent colors)?
- **Layout Alignment Consistency**: Text alignment (left/center/right) consistent across similar component types? Flex/grid alignment (`items-center`, `justify-between`) used consistently? Misaligned elements across cards, rows, or sections?
- **Touch Targets**: All interactive elements ≥44×44px on mobile?
- **Responsive Design**: Works at 320px, 375px, 768px, 1440px? Overflow, truncation, overlapping?
- **OLED Mode**: All elements switch correctly? Hardcoded backgrounds that don't respect it? Smooth transition?
- **Loading States**: Indicators for MC simulation, history import, export generation, admin operations?
- **Error States**: Images fail? localStorage full? Malformed JSON? Offline? SW fails?
- **Empty States**: No history? No bookmarks? No income? Empty collection? Expired events?
- **Animations**: `tabFadeIn`, `cardSlideIn`, `pulseScale`, `shimmer`, `borderGlow` — respect `prefers-reduced-motion`?
- **Onboarding**: 5-step flow clear and helpful? Covers essentials? Re-triggerable?
- **Toast System**: Visible enough? Stack correctly? Auto-dismiss timing? Haptic feedback?
- **Modal Focus Trapping**: `useFocusTrap` correctly traps focus? Tab outside possible?
- **Swipe Navigation**: Interferes with horizontal scrolling? Threshold appropriate? iOS Safari?
- **First Impression & Information Overload**: Does the calculator tab overwhelm new users with too many inputs/numbers at once? Is the information hierarchy clear — do users know where to look first? Is there a clear visual path from "set inputs" → "see results"?
- **Perceived Performance**: Does the app show stale-then-fresh results (optimistic UI), or blank the display while computing? When switching tabs, is there a visible loading flash or instant content?

#### §11. TYPOGRAPHY & FONT SYSTEM

- **Font Declarations**: Font-family stacks? Fallback fonts? Consistent primary/secondary/monospace system?
- **Font Loading**: FOIT/FOUT? `font-display` used? Fonts preloaded?
- **Typographic Scale**: Consistent scale (12/14/16/18/24/32px) or random? List every unique size.
- **Font Weight**: `font-bold` always for emphasis, or mixed `semibold`/`medium` for same intent?
- **Line Height**: Consistent across similar text types?
- **Truncation & Overflow**: Long strings handled? `text-ellipsis` where needed?
- **Font Licensing**: External/web fonts properly licensed?

#### §14. UI STANDARDIZATION & DESIGN TOKENS

- **Spacing Scale**: Consistent system? List every unique padding/margin. One-off values like `p-[13px]`?
- **Color Palette**: Reusable tokens or hardcoded? Near-duplicates to consolidate?
- **Border Radius**: `rounded-*` consistent? Cards, buttons, badges, modals all match?
- **Shadow System**: Consistent scale or arbitrary values?
- **Z-Index Scale**: Managed? Collisions? Defined stacking order?
- **Icon Sizing**: Lucide icons sized consistently? `size` prop vs CSS?
- **Button Variants**: Consistent system (primary/secondary/ghost/danger)? Hover/active/focus/disabled states?
- **Card / Modal / Input / Badge Patterns**: Each type consistent across the app?
- **Transition Tokens**: `transition-*` / `duration-*` consistent?
- **Opacity Scale**: Overlays, disabled, hover — from a limited set?
- **Responsive Breakpoint Consistency**: Same Tailwind breakpoints (`sm`/`md`/`lg`/`xl`) everywhere, or arbitrary one-off values like `max-w-[743px]`? List every custom breakpoint.
- **Vertical Rhythm & Whitespace Density**: Consistent spacing between sections, cards, and content groups? Similar containers have similar internal padding and external margins?
- **OLED Theme Token Mapping**: Are OLED overrides applied systematically (e.g., one CSS class that remaps all tokens) or individually per component? Are there components that define their own colors and bypass the OLED override? List any hardcoded colors that don't respond to the OLED toggle.

#### §15. UI COHERENCE & INFORMATION ARCHITECTURE

- **Visual Hierarchy**: Primary actions more prominent? Most important info first?
- **Navigation Mental Model**: Tab labels/icons predictable? Tab order logical?
- **Cross-View Consistency**: Different tabs feel like the same app?
- **Progressive Disclosure**: Complex info (DP details) behind expandable sections?
- **Feedback Loops**: Immediate visual feedback after every action?
- **Empty → Full Transitions**: Graceful? Empty states helpful?
- **Terminology Consistency**: Same concept always called the same thing? ("astrite" vs "Astrite"; "pity" vs "counter")

#### §46. MICRO-INTERACTIONS & FEEDBACK STATES

- **Hover/Active/Focus/Disabled States**: Every interactive element? Consistent style?
- **`:focus-visible`**: Visible for keyboard, suppressed for mouse?
- **Loading Micro-States**: Per-element or global only?
- **Skeleton Screens**: Shown during load/compute?
- **Copy Feedback**: Visual confirmation on clipboard copy?
- **Haptic Feedback**: `navigator.vibrate()` appropriate? Graceful degradation?

#### §42. ERROR MESSAGE QUALITY & USER COMMUNICATION

- **Error Message Inventory**: Every message — plain language? Explains what happened? What to do next?
- **Technical Jargon**: Stack traces or error codes exposed to users?
- **Severity Levels**: Red/yellow/blue/green visually distinct?
- **Actionable Errors**: Clear recovery action for every error?
- **Confirmations**: Destructive actions have meaningful confirmation (not just "Are you sure?")?
- **Progress Communication**: Long operations show progress or freeze the screen?
- **Help Text**: Complex features (pity, 50/50, soft pity) explained for new players?

#### §52. DARK PATTERN AVOIDANCE & ETHICAL UX

- **No Manipulation**: No fake urgency, confirmshaming, hidden costs, addictive loops
- **Honest Probabilities**: No cherry-picking favorable scenarios
- **Spending Awareness**: Top-up calculator — responsible-spending messaging?
- **Data Collection Transparency**: Presence system opt-in or opt-out?
- **No Misleading Branding**: Clear it's a fan tool, not official Kuro Games?

#### §45. USER TRUST & CALCULATION TRANSPARENCY

- **Show Your Work**: Method (DP/MC/hybrid) disclosed? Verifiable?
- **Confidence Disclosure**: MC results presented as estimates or exact values?
- **Assumption Transparency**: "assumes 0.8% base rate," "assumes linear ramp" — stated?
- **Methodology Documentation**: In-app "How It Works" section?
- **Disclaimer**: Third-party tool, not affiliated, results are estimates?

---

### Category G — Accessibility & Semantics

#### §6. ACCESSIBILITY (a11y)

- **ARIA Attributes**: Every interactive element — `role`, `aria-label`, `aria-selected`, `aria-expanded`, `aria-live`? Tab buttons `role="tab"`? Modals `role="dialog"` + `aria-modal`? ProbabilityBar `role="meter"`?
- **Keyboard Navigation**: Every feature accessible without mouse? Tab switching (ArrowLeft/Right), modal (Escape), admin panel, collection grid, bookmarks
- **Screen Reader Experience**: Banner cards, event statuses, probabilities, collection counts, timers — all comprehensible?
- **Focus Management**: After modal close, focus returns to trigger? Tab switch focus correct?
- **Color-Only Information**: Any info conveyed only by color? Text/icon alternatives?
- **Live Region Coverage**: When probability results update after input changes, is the new result announced to screen readers via `aria-live`? When countdowns tick, are updates throttled so screen readers aren't spammed? Are toast notifications announced?
- **Text Sizing**: Works at 200% browser zoom? Clipping/overflow?

#### §41. SEMANTIC HTML & DOM STRUCTURE

- **Semantic Elements**: `<header>`, `<nav>`, `<main>`, `<section>`, `<article>` or all `<div>`?
- **Heading Hierarchy**: Logical `h1` → `h2` → `h3`? Exactly one `<h1>`? Levels skipped?
- **Form Elements**: `<label>` connected to inputs? `<fieldset>` / `<legend>` for groups?
- **List Semantics**: Lists as `<ul>`/`<ol>`/`<li>` or `<div>` soup?
- **Button vs Div**: Correct semantic element for every interactive element?
- **DOM Depth/Size**: >15 nesting levels? >1,500 total nodes?

---

### Category H — Navigation, Interaction & Recovery

#### §44. SCROLL BEHAVIOR & NAVIGATION STATE

- **Scroll Position Restoration**: Preserved across tab switches?
- **Scroll Lock in Modals**: Background scroll disabled? Modal content scrollable?
- **Back Button**: Previous tab? Close modal? Leave app?
- **Deep Linking**: URL hash for tabs (#calculator, #collection)?
- **Pull-to-Refresh**: Interferes with scrolling?
- **Long Lists**: Pagination, infinite scroll, or everything-at-once?

#### §53. KEYBOARD SHORTCUTS & POWER USER FEATURES

- **Shortcuts**: `1-9` tabs, `Ctrl+S` export, `Escape` close — exist?
- **Conflicts**: App shortcuts vs browser shortcuts?
- **Batch Operations**: Multi-select events, bookmarks, income sources?
- **Search / Filter**: In collection, history, banner archive?
- **Quick Input**: Frictionless daily updates?

#### §43. UNDO / REDO & MISTAKE RECOVERY

- **Undo Support**: Every state-modifying action — categorize as trivially undoable, should-have-undo, or irreversible-by-design
- **Accidental Action Prevention**: Destructive actions have meaningful confirmations?
- **Export Before Destructive Action**: Suggested before RESET / CLEAR_PROFILE?
- **Import Rollback**: Pre-import snapshot saved?
- **History Entry Correction**: Individual entries editable/removable?

---

### Category I — Platform & Compatibility

#### §8. PWA & OFFLINE BEHAVIOR

- **SW Caching**: All critical assets cached? 3-strategy approach correct per resource type?
- **Cache Invalidation**: Old cache cleaned on update? Stale JS possible?
- **Blob SW**: Doesn't work in Firefox/Safari — graceful fallback?
- **Install Prompt**: `beforeinstallprompt` handled? iOS flow (no event)?
- **Manifest**: All fields correct? Icon sizes? `display: standalone`? `theme_color` consistent?
- **Offline Functionality**: Everything works offline once loaded? What breaks?
- **Update Flow**: When a new version is deployed, how does the user find out? Is there an "update available" prompt? Could the user be stuck on a stale cached version indefinitely? Is `skipWaiting` used? What's the cache invalidation mechanism?

#### §9. BROWSER COMPATIBILITY

- **Safari/iOS**: `backdrop-filter`? `CSS.supports`? Blob Workers? `crypto.randomUUID`? `navigator.vibrate`?
- **Firefox**: Worker concerns? `-webkit-` without standard equivalents?
- **Older Browsers**: Minimum version? Optional chaining, nullish coalescing, `crypto.randomUUID` polyfills needed?
- **Mobile**: `viewport-fit=cover` for notched devices? Safe area insets?

#### §27. NETWORK RESILIENCE & OFFLINE GRACEFUL DEGRADATION

- **External Image Failure**: ibb.co down — placeholders? Layout shift?
- **CDN Script Failure**: Recharts/Lucide fail — crash or degrade? Error boundaries around charts?
- **Reconnection**: Coming back online — auto-recover? Presence reconnect?
- **Timeouts / Retries**: Hanging requests? Exponential backoff?

#### §28. PLATFORM-SPECIFIC BEHAVIORS

- **iOS Safari**: `position: fixed` + virtual keyboard? `-webkit-overflow-scrolling`? `100vh` bug?
- **Android**: Back button as PWA?
- **Hover vs Touch**: `@media (hover: hover)`? Tooltips on touch?
- **Notch / Safe Area**: `env(safe-area-inset-*)` respected?
- **Dark Mode OS**: `prefers-color-scheme` — conflicts with OLED toggle?
- **Pinch-to-Zoom**: Disabled via viewport? Accessibility implications?

#### §50. GRACEFUL DEGRADATION & PROGRESSIVE ENHANCEMENT

- **No-JS**: What does the user see? Blank page or fallback message?
- **Partial JS Failure**: React loads but Recharts fails — crash or degrade?
- **No-Worker Fallback**: Synchronous MC works correctly? UX impact?
- **No-Crypto Fallback**: `randomUUID` fallback works?
- **Feature Detection Quality**: All detections correct? `'serviceWorker' in navigator` ≠ registration success.
- **Progressive Loading**: Content revealed incrementally or all-or-nothing?

#### §40. IMAGE & ASSET MANAGEMENT

- **ibb.co Dependency**: SLA? Reliability? Could images be deleted or rate-limited?
- **Formats**: WebP/AVIF or legacy PNG/JPG?
- **Lazy Loading**: `loading="lazy"` or Intersection Observer for off-screen images?
- **Error Handling**: `onError` fallback? Layout break?
- **Image Caching**: Cached by SW? Invalidation mechanism?
- **Alt Text**: Meaningful or empty for decorative?
- **Favicon & PWA Icons**: All required sizes provided?

---

### Category J — Code Quality & Architecture

#### §7. CODE QUALITY & MAINTAINABILITY

- **Single-File Architecture**: At 10,144 lines — natural split points? Dependencies blocking extraction?
- **Dead Code**: Unused functions, unreferenced constants, commented-out code, unreachable branches? P7-FIX/P8-FIX remnants?
- **Naming Conventions**: `camelCase`/`PascalCase`/`SCREAMING_SNAKE` consistent? Misleading names?
- **Magic Numbers**: Every hardcoded number that should be named
- **Error Handling**: Every `try/catch` — appropriate? Logged? Shown to user? Silently swallowed?
- **Duplication**: Remaining code duplication despite deduplication efforts?
- **Section Index**: Lines 9–32 accurately reflect file structure?

#### §13. CODE FORMAT & STYLE CONSISTENCY

- **Indentation**: Consistent? Mixed tabs/spaces? 2-space vs 4-space?
- **Semicolons**: Consistent? ASI hazards?
- **Quotes**: Single vs double consistent for JS strings vs JSX attributes?
- **Import Organization**: Grouped logically? Unused imports?
- **Console Statements**: Leftover `console.log` in production?
- **Commented-Out Code**: Should be removed?
- **Linting**: Would it pass ESLint recommended / Prettier defaults?

#### §25. COMPONENT ARCHITECTURE & API CONTRACTS

- **Prop Drilling**: 4+ levels indicating need for context?
- **Component Responsibility**: Single, clear responsibility? God components?
- **Reusability**: Duplicated components that could be parameterized?
- **Component Size**: >200 lines should split? Trivial wrappers adding no value?
- **Event Handler Naming**: `onSomething` for callbacks, `handleSomething` for internal?

#### §22. DOCUMENTATION & DEVELOPER EXPERIENCE

- **Algorithm Documentation**: DP solver, MC, binary search — math explained? Inputs/outputs/edge cases?
- **Comment Quality**: Accurate, useful, not restating code?
- **Section Index Accuracy**: Matches actual file locations?
- **Architecture Decision Records**: Why single-file? Why blob SW? Why DP + MC hybrid?
- **Changelog**: Version history v1.0 → v3.2.2?
- **Known Issues**: Firefox SW, Safari compat, max state size documented?

---

### Category K — Data Presentation, Portability & Infrastructure

#### §37. DATA PRESENTATION & INFORMATION FORMATTING

- **Number Formatting**: All numbers consistent? `1234` as `1,234` everywhere or only sometimes?
- **Percentage Precision**: Same decimal places everywhere? Range-dependent (2 for <10%, 1 for 10-99%, 0 for 100%)?
- **Date Formatting**: Same format everywhere? Mixed `YYYY-MM-DD` / `MM/DD/YYYY` / `Jan 15, 2026`?
- **Zero vs Empty vs Null**: `0`, `—`, `None`, or hidden? Consistent?
- **Unit Labeling**: "45 pulls" not just "45"? Ambiguous anywhere?
- **Contextual Precision**: Casual users see "about 0.8%" not "0.00834217%"?

#### §36. DATA PORTABILITY & INTEROPERABILITY

- **Export Format**: Documented? Schema version identifier?
- **Export Completeness**: ALL user data captured?
- **Import Tolerance**: Extra fields, missing fields, reordered fields?
- **Partial Import**: History-only without overwriting bookmarks/settings?
- **Import Preview**: Preview before committing?
- **Clipboard / Share**: Key data copyable or shareable?
- **Schema Self-Description**: If a user or third-party tool wanted to parse the export, are field names, types, and valid ranges inferable from the JSON alone? Is there a schema version field external tools can check?

#### §54. TEMPORAL LOGIC & TIMEZONE EDGE CASES

- **Timezone Inventory**: All 5 server regions — UTC offset correct including DST?
- **DST Transitions**: Timers jump, duplicate, or go negative?
- **Clock Skew**: Wrong system clock — which features break?
- **Year Boundary**: Dec 31 → Jan 1 — date calculations assume same year?
- **Timestamp Format**: Consistent format for storage/comparison?

#### §16. INTERNATIONALIZATION & LOCALIZATION

- **Hardcoded Strings**: All English? i18n infrastructure?
- **Pluralization**: "1 pull" vs "2 pulls" handled?
- **Date/Number/Currency Formatting**: Locale-aware APIs or hardcoded?
- **RTL Readiness**: Layout breaks in Arabic/Hebrew?
- **Text Expansion**: 30-50% longer translated strings break layouts?

#### §17. SEO, META TAGS & SOCIAL SHARING

- **Title/Description**: Set descriptively?
- **Open Graph / Twitter Cards**: `og:title`, `og:image`, `twitter:card` set?
- **Favicon**: Works in all contexts?
- **Canonical URL**: Set?

#### §18. DEPENDENCY MANAGEMENT & SUPPLY CHAIN

- **CDN Pinning**: Exact versions or `latest`/ranges?
- **SRI**: `integrity` hashes on `<script>` tags?
- **CDN Downtime**: Fallback if cdnjs.cloudflare.com is down?
- **License Compliance**: All libraries compatible?
- **Version Lock**: CDN API change could silently break?

#### §20. TESTING & VERIFICATION STRATEGY

- **Mathematical Verification**: Known test vectors for gacha engine?
- **Manual Testing Checklist**: Critical user paths per release?
- **Cross-Browser Matrix**: Which browser/OS combos critical?
- **Performance Benchmarks**: DP < 500ms, page load < 3s, animation > 30fps?
- **Accessibility Testing**: axe-core, Lighthouse, screen reader?

#### §21. ERROR TELEMETRY & OBSERVABILITY

- **Error Boundaries**: React error boundary wrapping app? User sees what on component crash?
- **Global Error Handler**: `window.onerror` catching unhandled errors?
- **Crash Recovery**: Recovery mechanism? In-progress work lost?
- **Logging Hygiene**: `console.log` gated behind debug flag?

#### §51. PRINT & EXPORT VISUAL QUALITY

- **Print Stylesheet**: `@media print`? Layout makes sense on paper?
- **Screenshot Friendliness**: Looks good when screenshotted for Discord/social?
- **Data Export Readability**: JSON pretty-printed or minified?
- **CSV Export**: Pull history exportable as CSV?

---

## V. REMOVAL PROTECTION FRAMEWORK

> ⚠️ **CRITICAL AUDITOR DIRECTIVE**: AI auditors have a strong tendency to recommend removing code, features, or data that appear unused — but are actually load-bearing, intentionally preserved, or serve non-obvious purposes. **Before recommending ANY removal, you MUST pass the Removal Safety Checklist (§60).**

---

#### §55. REMOVAL PROTECTION — FEATURES & FUNCTIONALITY

**Feature Inventory — Do Not Remove Without Justification.** Enumerate every feature and confirm it is (a) functioning, (b) reachable, (c) serving a purpose:

- Gacha probability calculator (DP + MC + hybrid)
- Pity tracker per banner type
- Astrite / resource planner & income tracker
- Pull history import / export / deduplication
- Collection tracker (characters + weapons)
- Character detail modal (skills, materials, echo sets, teams)
- Bookmark system
- Banner history archive
- Event tracker with countdowns
- Countdown timers (daily / weekly / version)
- Dual banner allocation optimizer
- Luck rating calculator
- Admin panel
- OLED mode toggle
- Onboarding flow
- Profile system (username, profile pic)
- PWA install prompt & Service Worker
- Presence system
- Toast notification system
- Canvas background animations (TriangleMirrorWave, BackgroundGlow)
- Tab navigation with keyboard & swipe support
- 4★ pity and calculations
- Top-up crystal calculator
- KuroStyles (global CSS injection)

**For EACH feature**: confirm it exists, works, and should NOT be removed. To recommend removal, you must provide: (1) proof it's truly unused/broken, (2) proof no other feature depends on it, (3) proof no user workflow requires it.

**"Dead Code" False Positive Prevention.** Before flagging ANYTHING as dead/unused:
- Search ALL references (string-based, dynamic calls, reducer action types, Worker messages)
- Check `dispatch({ type: ... })` — reducer actions are referenced by string
- Check `useEffect`, `useCallback`, `useMemo`, `memo` comparison functions
- Check fallback/defensive paths, Service Worker, Web Worker, canvas loops
- Check conditional rendering (behind toggles, admin panel, feature flags)
- **If you cannot prove with certainty that code is unreachable, do NOT recommend removal**

**Defensive Code Protection.** These patterns are INTENTIONAL:
- Fallback values (`|| default`, `?? fallback`) — protect against localStorage corruption
- Try/catch with empty catches — intentional silent recovery
- Redundant null checks — defense in depth
- Feature detection (`CSS.supports`, `'vibrate' in navigator`) — cross-browser required
- Polyfill fallbacks — needed for older browsers

**Reducer Action Preservation.** Before suggesting any action is unused, search for every `dispatch({ type: 'ACTION_NAME'` across the entire file. **Do NOT recommend removing any action unless you prove zero dispatch calls exist.**

**Constant Preservation.** Before flagging any constant as unused, check: computations, JSX template literals, className strings, Worker blob code, comments, documentation.

#### §56. REMOVAL PROTECTION — DATA & GAME CONTENT

- **Game Data**: Every character, weapon, skill, material, echo set, team, banner, event, economy value — confirm it's currently accurate, displayed somewhere, and used in at least one calculation.
- **Historical Data**: Banner archive from old versions MUST be preserved (historical reference, pull history context, pattern analysis). **NEVER recommend removing old banner data.**
- **Standard Pool**: May appear "unused" if not featured, but essential for probability calculation (losing 50/50) and collection tracking. **NEVER recommend removing.**
- **Predicted Data**: Intentional feature for planning. Verify it's labeled as speculative, don't remove.
- **Skill & Material Data**: Core to character detail modal value. **Do NOT recommend trimming.**
- **4-Star Data**: Part of collection tracker, featured 4-star system, pity calculations. **NEVER recommend removing as "less important."**
- **Economy Constants**: `ASTRITE_PER_PULL = 160`, prices, etc. sourced from the actual game. **Do NOT recommend "extracting to config" in a way that removes from main file.**
- **Expired Event Data**: Still relevant for income calculation, historical reference, countdown verification.

#### §57. REMOVAL PROTECTION — CSS, STYLES & VISUAL ELEMENTS

- **KuroStyles**: Exists because some styles can't be expressed in Tailwind (keyframes, OLED overrides, global selectors). **Do NOT recommend removing or splitting out.**
- **Animations**: Intentional visual polish, performance-optimized, reduced-motion aware. **Do NOT recommend removing for "simplicity" without measuring impact.**
- **OLED Styles**: Every override prevents burn-in. **Do NOT remove without verifying base theme handles it.**
- **Canvas Pixel Values**: Geometric calculations, not magic numbers. **Do NOT extract to constants.**
- **Responsive Breakpoints**: Each variant exists for a specific screen size. **Verify before removing.**

#### §58. REMOVAL PROTECTION — ARCHITECTURE & STRUCTURE

- **Single-File Architecture**: INTENTIONAL. Zero build tools, no import management, simple deployment. **Do NOT recommend splitting as a "fix" — frame as trade-off only.**
- **useReducer (21+ actions)**: INTENTIONAL. **Do NOT recommend replacing with useState, Redux, Zustand, or splitting the reducer.**
- **Blob Worker/SW**: Required because single-file = no separate Worker file. **Audit correctness, note compat issues, do NOT recommend file-based replacement without acknowledging constraint.**
- **localStorage over IndexedDB**: Simpler for <5MB. **Do NOT recommend migration unless typical users exceed limits.**
- **CDN over npm**: Intentional zero-build-step. **Do NOT recommend bundler switch.**
- **Inline Everything**: Part of single-file philosophy. **Audit correctness, do NOT recommend extraction as default.**

#### §59. OVERHAUL COHERENCE — PARITY GUARANTEES

Any recommendation MUST preserve:
- **Feature Parity**: 100% — no feature broken, degraded, or removed
- **Data Parity**: 100% — no game, user, or historical data lost
- **UX Parity**: At least as good — no removal of visual feedback, animation, or info density without justification
- **Performance Parity**: No degradation
- **Compatibility Parity**: No reduced browser/device support
- **Zero-Build-Step Parity**: Must work without webpack/Vite/npm build
- **Offline Parity**: Offline functionality preserved
- **Import/Export Parity**: Old exports must still import correctly

#### §60. REMOVAL SAFETY CHECKLIST

> **MANDATORY** before recommending removal of ANY code, feature, data, style, constant, or pattern:

1. ☐ Searched the ENTIRE file (all ~10,144 lines) for every reference?
2. ☐ Checked string-based references (reducer types, classNames, Worker messages)?
3. ☐ Checked indirect references (callbacks, effects, event handlers, dynamic paths)?
4. ☐ Checked if it's a fallback/defensive path for error conditions?
5. ☐ Checked if it's a cross-browser compatibility feature?
6. ☐ Checked if removing it breaks any dependent feature?
7. ☐ Checked if it's game data used elsewhere even if not on current screen?
8. ☐ Checked if it's historical data preserved intentionally?
9. ☐ Confirmed it's not part of intentional architecture (single-file, blob Worker, CDN)?
10. ☐ Can state with 100% certainty no user workflow requires it?
11. ☐ Removing it would NOT reduce feature set, data coverage, or visual quality?
12. ☐ If wrong, what's the blast radius? Is it recoverable?

**If ANY box is unchecked → recommend "VERIFY BEFORE REMOVING" with the uncertainty noted, NOT "Remove this."**

**Confidence Tiers:**
- **12/12 checked** → SAFE TO REMOVE — proceed with recommendation
- **10–11/12 checked** → LIKELY SAFE — recommend removal but explicitly note the 1–2 uncertainties and their blast radius
- **≤9/12 checked** → DO NOT RECOMMEND REMOVAL — list as "investigate further" only

---

## V-B. MODIFICATION DISCIPLINE — UNDERSTAND BEFORE YOU TOUCH

> ⚠️ **CRITICAL AUDITOR & IMPLEMENTER DIRECTIVE**: AI models have a dangerous tendency to "improve" working code by rewriting it in ways that silently drop behavior, flatten nuance, or break adjacent features. **The most harmful changes are not the ones that add bugs — they're the ones that remove working logic the AI didn't understand.** This section applies during the audit AND when implementing any recommended fix.

### The Core Rule

**If you cannot explain WHY a line of code exists, you are not allowed to change it.**

Not "I think it's unused." Not "this could be simpler." Not "this pattern isn't standard." You must positively understand the code's purpose before recommending or making any modification. If you don't understand it, say so — that's a finding in itself ("§22 Documentation: this function's intent is unclear"), not a license to rewrite.

### Before Modifying ANY Code

Complete this mental checklist for every change you recommend or implement:

1. ☐ **What does this code currently do?** — Describe its actual behavior, not what you think it should do
2. ☐ **Why was it written this way?** — Is there a non-obvious reason for the specific approach? (performance, compatibility, edge case, defensive coding, single-file constraint)
3. ☐ **What calls it / what does it call?** — Trace every upstream caller and downstream dependency
4. ☐ **What state does it read and write?** — Which reducer actions, localStorage keys, or component props does it touch?
5. ☐ **What would break if this code vanished entirely?** — If the answer is "I'm not sure," you don't understand it well enough to modify it
6. ☐ **Is my proposed change strictly additive or is it replacing existing logic?** — Additive changes (adding validation, adding a null check) are low-risk. Replacements and rewrites are high-risk.
7. ☐ **Does my change preserve every edge case the original handles?** — List the edge cases explicitly. If the original has a `|| 0` fallback and your rewrite doesn't, you just introduced a NaN bug.

### Common AI Modification Mistakes — AVOID THESE

**1. "Cleaning up" conditional logic that handles edge cases**
```
// ORIGINAL — the "weird" fallback is intentional
const rate = pity >= SOFT_PITY_START 
  ? BASE_RATE + (pity - SOFT_PITY_START + 1) * RAMP_RATE 
  : BASE_RATE || 0.008;

// BAD "CLEANUP" — silently dropped the || 0.008 fallback
const rate = pity >= SOFT_PITY_START 
  ? BASE_RATE + (pity - SOFT_PITY_START + 1) * RAMP_RATE 
  : BASE_RATE;
```
The `|| 0.008` was defending against `BASE_RATE` being undefined/0 from a corrupted load. The "cleanup" removed a safety net.

**2. Rewriting a function and dropping a parameter or code path**
- You rewrite `calcStats()` to "simplify" it and drop the `worstCase` computation because your version computes it differently — but downstream code expected the old field name.
- You refactor a reducer action and forget to spread a nested object (`...state.settings`), silently wiping user settings on next dispatch.

**3. "Modernizing" patterns that exist for compatibility**
- Replacing `var` with `let` in the Blob Worker string — but the Worker runs in a separate scope where this doesn't matter, and the test was done on `var`.
- Replacing `function` with arrow function in a context where `this` binding matters.
- Replacing `||` with `??` without checking if falsy-vs-nullish matters (e.g., `value || default` where `value = 0` should NOT use `default`, but `value ?? default` would also keep `0` — or vice versa, where `value = ""` should fall through).

**4. Consolidating "duplicate" code that actually handles different cases**
- Two similar-looking functions for character banner and weapon banner — the character version has 50/50 logic, the weapon version doesn't. "Merging them into one with a flag" risks mixing up the paths.

**5. Extracting "magic numbers" that are actually geometric calculations**
- Canvas pixel values like `x * 0.866` (which is `cos(30°)`) are NOT magic numbers — they're trigonometry. Extracting them to constants named `MAGIC_OFFSET_1` makes the code worse, not better.

**6. Removing "dead" code that's actually reached through dynamic dispatch**
- Reducer actions dispatched via string: `dispatch({ type: actionName })` where `actionName` is a variable
- Functions called from the Worker blob via `postMessage`
- CSS classes applied via template literals: `` `text-${color}-400` ``
- Code behind feature flags, admin panel, or conditional rendering

### The "Surgical Fix" Standard

Every fix should be **surgical** — the minimum change that resolves the finding without touching anything else:

| Fix Type | Risk Level | Rule |
|----------|-----------|------|
| **Adding** a null check, validation, or fallback | 🟢 Low | Preferred — purely additive |
| **Adding** a missing ARIA attribute, alt text, or semantic element | 🟢 Low | Preferred — doesn't alter behavior |
| **Changing** a single value (wrong constant, wrong comparison operator) | 🟡 Medium | Verify the old value was actually wrong, not a deliberate choice |
| **Wrapping** existing code (error boundary, try/catch, memo) | 🟡 Medium | Verify the wrapper doesn't alter execution order or swallow errors |
| **Refactoring** a function's internals | 🔴 High | Must prove identical output for all inputs, including edge cases |
| **Rewriting** a component or module | 🔴🔴 Very High | Must pass all 12 boxes of §60 AND the 7-point checklist above |
| **Deleting** code | 🔴🔴🔴 Extreme | Must pass §60 Removal Safety Checklist with 12/12 confidence |

### When Implementing Fixes

If this audit's findings are later used to implement changes:

- **One finding = one change.** Do not bundle multiple fixes into a single rewrite. Each fix should be independently verifiable and independently revertible.
- **Before/after for every change.** Show the exact lines being changed, not just the new version. The developer must be able to see what was there before.
- **Test the edges, not just the happy path.** If you fix pity validation, test: pity=0, pity=1, pity=64, pity=65, pity=79, pity=80, pity=81, pity=-1, pity=NaN, pity=undefined, pity="forty".
- **If you're unsure whether your fix is safe, say so.** A fix labeled "CAUTION: may affect [X], verify manually" is honest. A fix that silently breaks [X] is a regression.
- **Never refactor while fixing.** If a function has a bug AND is poorly structured, fix the bug first with minimal change. Refactoring is a separate recommendation with separate risk assessment.

### The Golden Question

Before submitting any modification recommendation, ask yourself:

> *"If the developer applies this change at 2 AM without carefully reviewing it, what's the worst that could happen?"*

If the answer is anything other than "nothing bad" — add explicit warnings, reduce the scope of the change, or split it into safer steps.

---

## VI. OUTPUT FORMAT

### Finding Format

For each finding:
```
[SEVERITY] [CONFIDENCE] Title
Dimension: §X
Line(s): # (or "near [function name]" if exact line unknown)
Description: What's wrong — specific, not vague
Impact: What could go wrong for users
Fix: Specific code change recommended (include before/after snippet when possible)
Effort: Trivial (<5 min) / Small (<1 hr) / Medium (<1 day) / Large (1+ day refactor)
Regression risk: What could break if this fix is applied incorrectly
Cross-refs: Related findings in other dimensions, if any
```

### Required Deliverables (Tiered by Priority)

**Tier 1 — Must Complete (Parts 1–3)**

| Deliverable | Description |
|-------------|-------------|
| **Feature Preservation Ledger** | Every feature: Name, Status (Working/Broken/Partial), Dependencies, Safe to Modify?, Safe to Remove? (NO for all working features unless proven) |
| **Architecture Constraint Acknowledgments** | Every constraint (single-file, zero-build, CDN, blob Worker/SW, localStorage, useReducer): Reason It Exists, What Breaks If Changed, Recommendations Must Respect |
| **Priority Action Items** | Top 10 most impactful fixes, sorted in two tiers: (1) **Quick Wins** — HIGH/CRITICAL severity + Trivial/Small effort, then (2) **Strategic Fixes** — remaining HIGH/CRITICAL sorted by severity × user impact. Include root cause IDs where applicable. |
| **Data Integrity Report** | Every validation gap: input, missing validation, invalid values possible, downstream corruption |
| **Statistical Verification Results** | Each math function: test vector, expected result, actual result, pass/fail |
| **Workflow Trace Report** | For each workflow in §I-C: steps traced, bugs found per step, overall pass/fail |

**Tier 2 — Should Complete (Parts 4–10)**

| Deliverable | Description |
|-------------|-------------|
| **Data Accuracy Report** | Every game data discrepancy with correct value |
| **Data Completeness Scorecard** | Every category: expected count, actual count, missing, incorrect |
| **Sensitive Data Inventory** | All data stored/transmitted: classification (public/private/sensitive), protection status |
| **Data Flow Diagram** | Text diagram: input → state → computation → display with corruption/staleness annotation |
| **Graceful Degradation Matrix** | Per dependency: failure mode, user impact, current fallback, fallback quality (Good/Partial/None/Crash) |
| **Resource Budget Breakdown** | Page weight by category: App JS, React, Recharts, Lucide, Tailwind, images, fonts, total |
| **Web Vitals Estimate** | Estimated LCP, FID/INP, CLS with bottlenecks and fixes |

**Tier 3 — Complete if Time Allows (Parts 11–14)**

| Deliverable | Description |
|-------------|-------------|
| **Typography & Design Token Audit** | Every unique font size, spacing, color, border-radius, shadow, z-index — consolidation recommendations |
| **Number Formatting Audit** | Every formatting pattern: value type, current format, location, recommended standard |
| **Error Message Inventory** | Every user-facing message: text, trigger, severity, actionable?, improvement |
| **Semantic HTML Scorecard** | Per component: current element, should be, impact, fix |
| **Image & Asset Audit** | Every external URL: host, used by, fallback?, alt text?, cached?, risk level |
| **Timezone Verification** | Per region: UTC offset, DST rules, daily reset time, verified?, edge cases |
| **Missing Tests Matrix** | Critical code paths → test type needed, prioritized by risk |
| **Policy & Compliance Gaps** | Missing/incomplete requirements with severity and remediation |
| **Removal Recommendations with Safety Audit** | Per item: reason, all references, checklist result (all 12 boxes), blast radius, confidence |
| **Architecture Recommendations** | High-level structural improvements preventing entire bug classes |

### Summary Dashboard (Final Part)

**Findings by Severity & Confidence:**

| Severity | Count | Confirmed | Likely | Theoretical | Quick Wins |
|----------|-------|-----------|--------|-------------|------------|
| CRITICAL | ? | ? | ? | ? | ? |
| HIGH     | ? | ? | ? | ? | ? |
| MEDIUM   | ? | ? | ? | ? | ? |
| LOW      | ? | ? | ? | ? | ? |
| NIT      | ? | ? | ? | ? | ? |

**Positive Verifications:** [count] critical paths confirmed working correctly

**Root Causes:** [count] unique root causes identified, mapped to [count] total findings

**Compound Findings:** [count] multi-finding interactions escalating combined severity

**Top 5 Quick Wins** (highest severity, lowest effort — fix these first):
1. ...
2. ...
3. ...
4. ...
5. ...

---

## VII. CROSS-CUTTING CONCERN MAP

> Some issues span multiple dimensions. When you encounter these, note the cross-reference so the final report can consolidate them.

| Concern | Touches Dimensions | Example |
|---------|--------------------|---------|
| **Floating-point precision** | §1, §29, §32 | Probability drift in DP → wrong chart display → wrong user decisions |
| **OLED mode completeness** | §5, §14, §57 | Hardcoded color in one component breaks theme → visual inconsistency → accessibility |
| **Worker reliability** | §3, §9, §27, §50 | Blob Worker fails in Firefox → no MC fallback → wrong or missing probabilities |
| **localStorage limits** | §2, §10, §19, §49 | State grows → quota exceeded → silent data loss → corrupted reload |
| **Timezone correctness** | §1, §33, §54, §I-B | Wrong DST offset for America (EST↔EDT) or Europe (CET↔CEST) → wrong banner end time → wrong countdown → wrong planning. Asia/SEA/HMT are always UTC+8 (no DST). |
| **Import/export integrity** | §2, §29, §30, §36 | Malformed import → prototype pollution → state corruption → data loss |
| **Image host reliability** | §27, §40, §50 | ibb.co down → broken images → layout shift → degraded UX |
| **Input boundary enforcement** | §1, §10, §26, §29 | Pity > 80 or negative astrite → DP array out-of-bounds → crash or wrong results |
| **Reduced motion compliance** | §5, §23, §46, §57 | CSS animation respects `prefers-reduced-motion` but canvas animation doesn't → accessibility violation |
| **Stale cache after update** | §8, §19, §33 | SW serves old JS → new state schema, old code → silent data corruption |
| **4★ system consistency** | §1, §4, §32, §34, §56 | 4★ pity, featured rate, count estimation referenced across probability, data, and collection — changes must propagate everywhere |

---

## VIII. FINAL MANDATE

**Be relentless. Be specific. Be exhaustive.** Every line of code, every pixel, every number, every font choice, spacing value, animation curve, color token, state transition, error path, platform behavior, data point, probability calculation, formatting rule, and cross-reference is in scope.

**Your job is to find bugs, not to simplify the app. Your job is to verify correctness, not to reduce scope. Your job is to improve quality, not to remove features.** Every recommendation must make the app BETTER without making it LESS. If code works correctly and serves a purpose, confirm it works — don't suggest removing it because "it could be simpler." Simplicity recommendations are welcome only when they provably preserve 100% functionality.

**Be honest about uncertainty.** A finding labeled `[THEORETICAL]` with a clear explanation of why you suspect an issue is infinitely more valuable than a `[CONFIRMED]` finding that's actually wrong. Never fabricate line numbers, function names, or code behavior to seem thorough.

**Do NOT attempt this audit in a single response.** Follow the Execution Plan (§II). Start with Part 1 (Pre-Flight, Planning & Inventory), announce your part count, and wait for the user before each subsequent part.

**Start with Part 1:** Perform the Pre-Flight Check, read the entire file top to bottom, verify the game mechanics in §I-B match the app's constants and logic, build the Feature Preservation Ledger and Architecture Constraint Acknowledgments, confirm your audit plan, and present the running summary. Then wait.
