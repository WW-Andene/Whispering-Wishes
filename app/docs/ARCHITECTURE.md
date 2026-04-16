# Whispering Wishes — Architecture Map

_Generated from the P1 audit (app-audit-SKILL §III). Keep updated as the structure evolves._

## Stack

| Layer | Technology |
|---|---|
| Language | JavaScript (ES2022), JSDoc typedefs — not TypeScript |
| Framework | React 18, Vite 5 |
| State | `useReducer` + 7 context providers (see below) |
| Persistence | `localStorage` (`whispering-wishes-v2.2`) + auxiliary keys; Firebase Realtime DB for community features only (not user-data storage) |
| Backend | Vercel serverless (`api/*.js`) + Firebase RTDB + Google OAuth |
| External | Groq Vision (OCR), HuggingFace RMBG-2.0, WuWa gacha API (proxied), CDN Spine player 4.2.109 |
| Build | Vite + `@vitejs/plugin-react` + in-repo `stampSW` plugin |
| Tests | Vitest + Testing Library + jsdom |

## Module layers (bottom → top)

```
                               ┌──────────────┐
                               │  main.jsx    │
                               │ (entry point)│
                               └──────┬───────┘
                                      │
                               ┌──────▼──────┐
                               │   App.jsx   │  ← orchestrator (72 imports)
                               └──────┬──────┘
                                      │
                          ┌───────────┴───────────┐
                          │                       │
                    ┌─────▼─────┐          ┌──────▼──────┐
                    │ providers │          │  features/  │ (lazy-loaded)
                    │  hooks/   │          │  9 modules  │
                    │  shared/  │          └─────────────┘
                    └─────┬─────┘
                          │
                    ┌─────▼─────────────────────────────┐
                    │  core/                            │
                    │  ├─ stateSanitizer.js  (leaf)     │
                    │  ├─ reducer.js  → sanitizer + constants
                    │  ├─ storage.js  → sanitizer + reducer (one-way, eval-safe)
                    │  ├─ calcStats.js  → constants     │
                    │  ├─ computeTrophies.js  → data/*  │
                    │  ├─ storageKeys.js  → data/chars  │
                    │  └─ time.js  → constants          │
                    └─────┬─────────────────────────────┘
                          │
                    ┌─────▼─────┐
                    │  data/    │ ← static content (characters, weapons, echoes, banners, constants)
                    │   leaf    │
                    └───────────┘
```

**Dependency rule:** edges point downward only. The only still-documented delicate edge is `core/storage.js` → `core/reducer.js` (for `initialState`), used inside function bodies only, never at module-evaluation time.

The former `core/reducer.js ↔ core/storage.js` cycle was broken by the P1-08 fix (sanitizers moved to `core/stateSanitizer.js`).

## Feature modules

| Module | Primary file | LOC | Role |
|---|---|---|---|
| `features/tracker` | `TrackerTab.jsx` | 474 | Banner pity tracking (5 banner types) |
| `features/events` | `EventsTab.jsx` | 203 | Time-gated content + server-reset timers |
| `features/map` | `MapTab.jsx` | 133 | Leaflet interactive map with webp tiles |
| `features/planner` | `PlannerTab.jsx` | 1272 | 28-day income calendar + goal planning |
| `features/calculator` | `CalculatorTab.jsx` | 501 | Probability calculator UI |
| `features/collection` | `CollectionTab.jsx` | 906 | Character/weapon/echo gallery + filters |
| `features/analytics` | `AnalyticsTab.jsx` | 873 | Luck rating, trophies, leaderboard |
| `features/teams` | `TeamsTab.jsx` + `DamageCalculator.jsx` | 858 + 1601 | Team builder + DPS engine |
| `features/profile` | `ProfileTab.jsx` | 1073 | Profile, admin panel, ID card, import flow |

Each feature tab is loaded via `React.lazy()` in `App.jsx` (code-split).

## Providers (7)

| Provider | File | Purpose |
|---|---|---|
| `PWAProvider` | `providers/PWAProvider.jsx` | Service-worker registration + update prompts |
| `ToastProvider` | `providers/ToastProvider.jsx` | Non-blocking notification system |
| `ConfirmProvider` | `providers/ConfirmProvider.jsx` | Modal confirmation dialogs |
| `FocusTrapModal` | `providers/FocusTrapModal.jsx` | Accessibility: focus trap for modals |
| `OnboardingModal` | `providers/OnboardingModal.jsx` | First-run guide |
| `ImageFramingProvider` | `providers/ImageFramingProvider.jsx` | Per-image zoom/pan persistence |
| `CloudStorageProvider` | `providers/CloudStorageProvider.jsx` | Google OAuth + Firebase cloud backup |

## Persistence

| Key | Data | Location |
|---|---|---|
| `whispering-wishes-v2.2` | Main app state blob (profile, calc, planner, settings, bookmarks, teams, …) | `core/storage.js` |
| `VISUAL_SETTINGS_KEY` | Theme accent, OLED mode, reduced-motion | `shared/constants/appConstants.js` |
| `IMAGE_FRAMING_KEY` | Zoom/pan per image | same |
| `COLLECTION_IMAGES_KEY` | User-uploaded replacement art | same |
| `TROPHY_OVERRIDES_KEY` | Admin override for trophy computation | same |
| `ww-team-equipment` | Per-team weapon/echo loadouts | App.jsx |
| `ww-calendar-notes` | Planner notes | App.jsx |
| `ww-admin-*` | Admin panel lockout state | `features/profile/ProfileTab.jsx` |
| Firebase `leaderboard/$uid` | Community leaderboard entry (pity, pulls) | `database.rules.json` |
| Firebase `community-pulls/$uid` | Aggregated community pull stats | same |
| Firebase `presence/$sessionId` | Live session presence | same |
| Firebase `user-history/$uid` | Per-user private pull history backup | same |

Schema migration is scaffolded at `core/storage.js:51` (empty `migrations` object awaiting entries).

## API routes (Vercel serverless)

| Route | File | Purpose | Security |
|---|---|---|---|
| `/api/ocr` | `api/ocr.js` | Groq Vision OCR on gacha-URL screenshots | Origin allowlist · 4MB base64 cap · 15s timeout · response-key whitelist |
| `/api/remove-bg` | `api/remove-bg.js` | HuggingFace RMBG-2.0 background removal | Origin allowlist · image-host allowlist (SSRF guard) · 10MB cap · retry on 503/429 |
| `/api/batch-remove-bg` | `api/batch-remove-bg.js` | Batch variant of above | same |
| `/api/gacha/record/query` | `api/gacha/record/query.js` | Proxy to WuWa gacha API (CORS bypass) | Origin allowlist · 30s timeout · single upstream host |

## Build plugins

- `@vitejs/plugin-react`
- Custom `stampSW` in `vite.config.js:6` — rewrites `public/sw.js` with a build-time ISO timestamp so deployed SWs differ byte-wise and update correctly.

## Conventions to follow

1. **Data is a leaf.** Nothing in `data/` may import from anywhere else in `src/`.
2. **Core one-way.** `core/reducer.js` does not import from `core/storage.js`; both depend on `core/stateSanitizer.js`.
3. **Feature isolation.** A feature should not import from another feature. Shared UI lives in `shared/`; shared logic in `core/` or `utils/`.
4. **Providers stay top-level.** Adding a new one means wrapping it in `App.jsx` — don't construct provider trees inside features.
5. **Persistence keys centralized.** Add new keys to `shared/constants/appConstants.js` or document them here before shipping.
6. **External input is untrusted.** Every path through `sanitizeStateObj` / `sanitizeImportedState` before spreading into state.
7. **Features are lazy.** New tab components must be added to `App.jsx` via `React.lazy()` to stay under the code-split budget.

## Known constraints (from P1 constraint map)

| # | Constraint | Why it exists |
|---|---|---|
| K-01 | Mobile-first only (Tailwind `lg`/`xl`/`2xl` disabled) | Product decision — mobile is the primary surface |
| K-02 | `localStorage` is the sole user-data persistence | Zero-server-cost for user data; Firebase used only for shared community state |
| K-03 | CDN Spine player at pinned version, no SRI | Cost / size — Spine 4.2.109 from unpkg |
| K-04 | Serverless origin allowlist enforced app-side | Prevents abuse of free-tier upstream quotas |
| K-05 | No TypeScript — JSDoc only | Lightweight toolchain |
| K-06 | Circular-import-free (enforced by ESLint) | Fragility mitigation |
| K-07 | `STORAGE_KEY` versioning preserved through refactors | User data continuity |
| K-08 | Firebase rules require auth but rely on app-side owner check | Audit finding — tightening planned in P3 |

## Referenced audits

- `P1` — Inventory & Architecture (this doc)
- `P2` — Domain Logic (gacha engine correctness)
- `P3` — Security & Trust
- `P4` — State & Data Integrity
- further parts to be issued
