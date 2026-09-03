# Whispering Wishes — Remaining Work (consolidated audit, 2026-09-03)

Replaces `Update_report.md`, `Implementation_Plan.md`, `ENGINE_MERGE_PLAN.md`,
`CAPACITOR_APP.md`, and `Engine development.md` (deleted same commit — all were
append-only running logs, mostly resolved history, that had grown too large to
tell "still open" from "done years ago" at a glance). This file keeps ONLY what
is still genuinely open, verified against the current codebase state, not
copied from the old files' own (frequently stale) status claims.

Character-data sourcing conventions (fresh-dump verification, no-fabrication
rule, commit/test workflow) are established practice in this project, not
repeated here — this file tracks engine-architecture and content-refresh gaps
only.

---

## 1. Engine merge — legacy calculator + TriggerBlock engine still not fully unified

Two systems compute damage today: the legacy flat-table calculator
(`calcEngine.js`/`calcTeamStats.js`) and the modern TriggerBlock engine
(`triggerEngine.js`, `resolveHitComposedDps.js`, `resolveHitComposedTeamDps.js`).
The modern engine is the **primary path** for all 56 converted characters;
legacy only still executes for Jingran (unreleased, unconverted). The end
goal — one fused engine, legacy retired — is not reached.

### 1a. Schema gaps — 10 of 17 originally-inventoried, still open

Every gap below was individually investigated (not guessed at) and has a
documented reason it's still open — either missing source data or missing
infrastructure. None need HP/live-state tracking except where noted.

**Buildable now, no new simulation dimension needed:**
- **Ally-action retrofit backlog** (partial — Qingxiao S4 and Sigrika S4
  already fixed). Mechanism (`trigger.type:'ally-action'` + `target.scope:
  'trigger-actor'`) already exists and is tested. Remaining cases, each
  blocked only on a missing action tag, not new code: Luuk Herssen S4,
  Cartethyia S4, Mornye (×2), Galbrena's Afterflame. Lowest-risk, highest-value
  remaining item in this whole file.
- ~~Youhu S2~~ — **closed 2026-09-03, correctly still no block, for a different
  reason than originally stated.** The "no dump file" blocker is gone
  (`Characters data dump/Youhu/Youhu.md` now exists and sources all 3 base
  values it doubles). But her real modeled `CHARACTER_ROTATIONS` never casts
  Poetic Essence at all — she always spends each drawn Antique immediately via
  Ruyi rather than banking to 4 Auspices. Same zero-DPS-in-context boundary as
  Chisa's S4/Mornye's S1/S4, not a schema or data gap. Comments in
  `youhu.blocks.js` and `characters.js`'s own audit note updated to reflect
  this; no engine change needed.
- **Early-forfeit-on-swap** (Carlotta, Changli, Yinlin — a buff on another
  character ends early if THAT character swaps out before its full duration).
  Needs threading the recipient's own swap-out timestamps into
  `blockWindows.js` and the two team resolvers that already see both
  characters' step timelines — real multi-file plumbing, not a new
  simulation dimension.
- **Cantarella's off-field summon-chain** (Diffusion: up to 21 Coordinated ATK
  summons over 30s, numbers already sourced — 14.54%/summon, 21 max, 30s
  window). Needs `windowed-proc` extended to fire off ANY team member's step,
  not just the block owner's — a genuine new trigger-type combination, sized
  similarly to the totalMult architecture fix, self-contained.

**Still blocked on missing source data (no dump file / no dump section covers it):**
- Baizhi — sustained-channel gap (Remnant Entities), no dump file at all.
- Roccia — stateful re-cast loop (Reality Recreation), no dump file at all.
- Qingxiao's Mindlock stack-cap-raise to 25 — the nonlinear-stacking
  primitive is already built (`effects[].tiers`/`cumulativeTieredValue()`),
  but no source confirms her real rotation actually reaches 25 stacks.

**Genuinely need a new simulation layer (excluded per user's own framing —
same tier as HP tracking):**
- Danjin S5 — HP-threshold condition (+15% more when HP<60%), needs live-HP
  tracking. Confirmed via `grep -rn "hpPct|currentHp" engine/*.js`: zero
  matches, the engine has no live-HP simulation anywhere.
- Danjin — on-being-hit trigger (loses a stack per hit taken), needs an
  enemy-attack timeline; no such data exists anywhere.
- Denia's Erosion Field tick-rate (4s→3s) — blocked on the same
  sustained-tick-simulation prerequisite as Baizhi's gap.

### 1b. Phase 2 — DOT-mechanic migration to the modern engine

4 of 5 mechanics migrated and verified (Electro Flare/Buling, Fusion
Burst/Denia+Aemeath, Erosion/Ciaccona, Frazzle/Rover: Spectro). **Tune Break
deliberately left for last, still untouched** — the most structurally
involved of the five (per-character rupture/strain mode-locking already
built for the legacy path via `tuneBreak.modeExclusive`/
`competesWithFusionBurstReaction`/combinatorial mode resolution in
`calcTeamStats.js`, but not yet expressed as TriggerBlocks).

### 1c. Phase A — per-character full audit, mostly not done

The plan's own methodology for reaching "fully merged": an 8-dimension
solo audit per character (SKILL_MULTIPLIERS / CHARACTER_ROTATIONS /
RESONANCE_CHAIN_DATA / CHAR_BUFF_TABLE / dmgFocus / weapon data / echo data /
engine-block parity, all cross-checked against a fresh source). Only 4
characters (Aemeath, Denia, Lynae, Qingxiao) have gone through this as a
*complete* 8-dimension pass. Many more have had *partial*, targeted fixes
from later sessions' dump-verification passes (see the `Characters data
dump/` audit trail and this session's `auditBlockCoverage.mjs` sweep — that
sweep covers 3 of the 8 dimensions: rotation-step/chain/buff-table coverage,
not the full 8). The remaining ~53 characters have not had a full Phase A
pass. Not urgent — the coverage-audit sweep already closed the highest-risk
gaps (unmatched rotation steps = silent 0-DMG bugs) roster-wide — but the
full 8-dimension methodology itself is not complete.

---

## 2. Legacy-calculator correctness — real, unresolved finding

**8 of 24 characters' declared `bestWeapon` still disagree with what the
app's own engine actually computes as highest-DPS**, after two real bugs in
this comparison were already found and fixed (shield-gating on Moongazer's
Sigil/Thunderflare Dominion; `skillDmg` weapon-passive credit not gated by
`dmgFocus`, which also uncovered and fixed a bigger bug — 100
`RESONANCE_CHAIN_DATA` entries across the roster whose category-specific DMG
Mult chain bonuses were silently discarded because the routing step ran
before the chain-bonus block, not after). The remaining 8 disagreements have
**not been root-caused** — could be a further real bug in `calcTeamStats.js`,
stale hand-authored `bestWeapon` data, or a legitimate real-world factor this
simplified model doesn't capture (e.g. AoE/quickswap value, same caveat
already flagged for Aemeath's Fusion Burst resolution). Needs its own
diagnostic-first pass, same rigor as the two fixes that already came out of
this same audit thread.

---

## 3. Content-refresh gaps — 2 items still open

Everything else in the original 10-step content-refresh plan (Version,
Characters, Weapons, Echoes, Team, History, Event, Material, Meta/Tier) is
done and re-verified. Two real items remain:

- **Region/Map data for Somnoire: Night City (3.4) and Land of Xuanfang
  (3.5–3.6)** — `MAP_ZONES` is still `[]` (confirmed empty as of this audit).
  Genuine infrastructure blocker, not a research gap: zone polygons are
  authored in pixel coordinates on this app's own map-tile images via a
  click-to-log dev flow, and the tile images for both regions don't exist in
  `public/map-tiles/` yet (confirmed — only pre-3.4 regions present). Needs
  either the real tile images sourced and dropped in first, or someone
  hand-authoring the polygons directly. User-confirmed out of scope for now,
  not forgotten.
- **`TACTICAL_HOLOGRAM_HISTORY` has no v3.6 "Simulation" row** — confirmed
  still missing in `banners.js` as of this audit (`3.5` is still the newest
  entry). Deliberately left unadded pending a confirmable boss roster for
  that arena, same "don't guess" convention used throughout this project.
  Revisit once a source confirms the v3.6 arena's actual bosses.

Character/weapon/material art (portraits, icons, event banners) — the other
recurring "remaining gap" in the old files — is now fully resolved; every
placeholder flagged across those files' history has since been sourced and
wired to real art (verified directly against `banners.js`/`materialData.js`'s
current state while writing this audit, not assumed from the old files'
claims).

---

## 4. Native app (Android/iOS via Capacitor) — pre-publish steps not done

Build pipeline itself works end-to-end (filtered `dist-native/` build, jsDelivr
CDN offload for the 5 large asset folders, service-worker patching, APK
generation all verified in-session). Not done, genuinely requiring a real
device or a Mac:
- **Real device/emulator install test** — no hardware virtualization was
  available in the environment that built this; the generated APK's install
  and runtime behavior (map tiles loading from the hosted deployment,
  animations/audio streaming from jsDelivr) has only been checked via `curl`
  against the CDN, never by actually running the app on a device.
- **iOS build** — not scaffolded at all; needs a Mac with Xcode, unavailable
  in this environment. Instructions for a future Mac session are documented
  inline in the Capacitor config comments and `package.json` scripts
  (`cap:*`), not repeated here.
- **Signed release build + Google Play Developer account** ($25 one-time) —
  not started; current APK is an unsigned debug build only.
- **Push notifications** — client-side is fully wired (permission, FCM
  registration, listeners), but requires server-side setup never done in this
  environment: a Firebase project + `google-services.json` placed in
  `app/android/app/` (gitignored, never committed), plus 3 server-only env
  vars on the hosting deployment (`FIREBASE_SERVICE_ACCOUNT_JSON`,
  `FIREBASE_DB_URL`, `PUSH_ADMIN_SECRET`). Until both exist, no push
  notification can actually be delivered even though the client code path is
  complete.

---

## How to add to this file

Same convention as the file it replaces: when an audit turns up a real,
verified architecture or content gap, add a dated entry here with what was
found, where, and why it's still open — not a speculative wishlist, and not
re-logging something already fixed. When an item here gets closed, delete its
entry rather than marking it done — this file should only ever describe what
remains.
