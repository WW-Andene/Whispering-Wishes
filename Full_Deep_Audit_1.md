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
