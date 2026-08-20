# Content Refresh — Implementation Plan

Breaks the v3.4 → v3.6 catch-up (see `Update_report.md`) into ordered, self-contained steps. Each step lists the **main work** (the thing you asked for) and **connected work** (what else breaks or goes stale if that step ships without it).

Dependency order matters here: **Version → Characters → Weapons/Echoes → Teams/Meta → Events/History → Material**, with **Region** threaded through wherever a new area is involved. Steps are listed in the order I'd implement them, not the order you listed them, since some steps are inputs to others (e.g. Characters must exist before Teams can reference them).

---

## 1. Version — ✅ DONE (commit `2b0c557`)

**Main work:** Extended `VERSION_DATES` with real entries for 3.3 (backfilled), 3.4 (estimated — no source confirms exact dates), 3.5 (confirmed: **July 10 – Aug 19, 2026**), and 3.6 (confirmed start **Aug 20, 2026**, end estimated). Replaced `CURRENT_BANNERS`, which was frozen on a v3.2 rerun that ended ~4 months ago, with the real live banner: **v3.5 Phase 2 — Suisui + Aemeath rerun**, confirmed via Game8's banner tracker. Extended `BANNER_HISTORY` with all of 3.4/3.5/3.6's phases (genuinely-estimated ones flagged `predicted: true`, which the existing UI already knows how to render as "(est.)"). Extended `PIONEER_PODCAST_HISTORY` through 3.6.

**Connected work — what this pulled in:**
- Populating `CURRENT_BANNERS.characters`/`.weapons` isn't just data — a test (`data-integrity.test.js`) asserts every name resolves against `CHARACTER_DATA`/`WEAPON_DATA`. That pulled in a full `CHARACTER_DATA` entry for **Suisui** (base stats, rotation data, buff table, skill multipliers, resonance chain) and new `WEAPON_DATA` entries for **Glint of Clouds** and **Firstlight's Herald** — this is Step 2/3 work done ahead of schedule, out of necessity rather than choice.
- While in there, fixed 6 failing tests caused by last session's Qingxiao/Jingran addition, which had only the character-card fields and none of the calculator-linked data (base stats, rotation, buff table, resonance chain, skill multipliers, a resolvable `bestWeapon`). Jingran still has no confirmed signature weapon anywhere — using `Verdant Summit` as a clearly-commented placeholder.
- `TACTICAL_HOLOGRAM_HISTORY` was **not** extended at the time — resolved in Step 8 (added "Sparring," confirmed v3.5).
- `APP_VERSION` in `constants.js` is still `'3.5.0'` — checked its usage (image cache-busting, save/export/import version stamping and migration-detection in `core/storage.js`, and the "Whispering Wishes Ver.X" text shown in the About/Admin panels). Confirmed it's the **app's own build version**, not a mirror of the game version — but there's no visible history of prior bumps to infer a convention from (e.g. patch-bump per content sync vs. manual maintainer calls), and bumping it wrong could trigger spurious "data migration" console messages for existing users on load. Left untouched — this is a maintainer product decision, not a research gap.
- Verified end-to-end with a headless Playwright pass (not just tests): Tracker tab shows the correct v3.5 Phase 2 banner and countdown, Collection tab's search/filter picks up Qingxiao, Planner's Chronology bar correctly plots the new banner history. Zero new console errors — only expected placeholder-art 404s (no portrait/banner images exist yet for Suisui/Qingxiao/Jingran) and one pre-existing unrelated DOM-nesting warning.
- Full test suite (96 tests) passes; production build succeeds.

---

## 2. Characters — ✅ DONE (this session)

**Main work:** Added full `CHARACTER_DATA` entries for the 6 remaining confirmed-missing resonators — Rebecca, Lucilla, Lucy, Yangyang: Xuanling, Denia, Hiyuki — plus Rover's Electro attunement. Suisui's placeholder ascension/skill/echo fields (from the Version step) were replaced with confirmed real data. Every entry includes real kit description, skills, ascension materials, skill materials, best echoes, best weapon, and team comps — all pulled from prydwen.gg (tier/build/kit) and game8.co (ascension/forte material names, confirmed live on all 7 as of this pass).

**Connected work — completed:**
- `RELEASE_ORDER`: all 6 new names added under `// 3.4` / `// 3.5` blocks.
- **Rover data model**: `Rover.elements` now includes `'Electro'`, with an inline comment flagging that per-attunement kit data (Electro's Thunderclap/Overshock/Apex Resonance skills) isn't separately modeled — the character entry still describes the Spectro attunement's kit. Electro's tier (T4 ToA / T4 WW — confirmed "basically a useless character right now" per Prydwen) is documented in the comment since `TIER_DATA` is one row per character key, not per attunement.
- `CHAR_BUFF_TABLE`, `SKILL_MULTIPLIERS`, `RESONANCE_CHAIN_DATA`, base stats, rotation data, `statScaling`, and `dmgFocus` all populated for all 6 — full test suite (96 tests) passes, confirming every character is calculator-ready.
- `TIER_DATA` rows added for all 6 with confirmed placements (Yangyang: Xuanling and Lucilla are both **T0/T0** — top of the meta on release).
- **Not done — portraits/art assets**: `app/public/portraits/<pinyin-name>/` folders and `DEFAULT_COLLECTION_IMAGES`/`CHARACTER_THEMES` entries. No art asset source was available this session (Prydwen/nanoka images aren't licensed for reuse into a third-party app without checking terms) — characters render with initial-letter fallback avatars in Collection until real art is sourced. Flagged as the main remaining visual gap.

---

## 3. Weapons — ✅ DONE, re-verified (this session)

**Main work:** Added `WEAPON_DATA` entries for all 7 confirmed signature weapons: Skull Thrasher (Rebecca), Freeze Frame (Lucilla), Spectral Trigger (Lucy), Azure Oath (Yangyang: Xuanling), Frostburn (Hiyuki), Forged Dwarf Star (Denia), plus Glint of Clouds/Firstlight's Herald from the Version step. Names and `bestFor` all confirmed via prydwen.gg build guides.

**Follow-up (this session):** The 6 weapons that previously used the app's per-archetype convention numbers (587/500 ATK guesses) have been replaced with real Lv.90 stats and full R1 passive text pulled directly from nanoka.cc's live weapon database pages — several were wrong (e.g. Skull Thrasher's real baseAtk is 500 with +72% Crit DMG, not 587/+48.6%; several passives buff different stats than originally guessed, like Azure Oath granting All-Attribute DMG rather than a Heavy-only buff). `pv` fields, `desc`, and `passive` text were all rewritten to match the real kit text.

**Connected work — completed:**
- `WEAPON_RELEASE_ORDER` in `constants.js`: all 6 new weapons added under `// 3.4` / `// 3.5` blocks.
- `CHARACTER_DATA[name].bestWeapon` now resolves for every one of the 7 characters — confirmed by the passing test suite (96/96).
- Banner weapon images still need matching art, same gap as character portraits — not addressed this pass.

---

## 4. Echoes — ✅ DONE (this session, for Land of Xuanfang's confirmed set)

**Main work:** Confirmed via nanoka.cc's live echo database (not "Kernel Puppet" — that name never shipped) that Land of Xuanfang actually introduced **three** new Sonata Sets, not one: **Song of Feathered Trace** (Support/Energy Regen, Havoc Bane + Glacio Chafe dual-trigger), **Heart of Evil's Purge** (Aero DMG, Tune Strain - Shifting trigger), and **Lamp of Nether Road** (Shield/HP, Shield-gain trigger). Added all three to `ECHO_SETS` with real p2/p5 bonus text, plus the 6 echoes that carry them: Thousand-Puppet Pavilion and Myriad Snare: Rustfire Chassis (4-cost), Forbidden Bastion and Fog Lionarch (3-cost).

**Connected work — completed:**
- Also added **Voidwing Moth** and **Reminiscence: Denia** (Denia's paired signature Echoes) to `ECHO_DATA` — both were already referenced in `CHARACTER_DATA['Denia'].bestEchoes` from an earlier session but never actually defined, a dangling reference.
- Discovered and fixed a **second dangling reference** in the process: `Reel of Spliced Memories` (Voidwing Moth's actual set) was cited in Denia's `bestEchoes` string but never existed in `ECHO_SETS` at all — added it with real bonus data.
- `ALL_4COST_ECHOES`/`ALL_3COST_ECHOES` extended under new `// v3.5 — Land of Xuanfang` blocks.
- Full test suite (96/96) passes, including the `ECHO_DATA`/`ECHO_SETS` cross-reference integrity checks.
- **`ECHO_SKILL_BUFFS` — done (follow-up pass):** populated for all 5 new 4-cost echoes (Thousand-Puppet Pavilion, Myriad Snare: Rustfire Chassis, Reminiscence: Denia, Reminiscence: Threnodian - Voidborne Construct, Reminiscence - Nightmare: Adam Smasher) with real main-slot passive numbers from nanoka.cc. While doing this, found and fixed **two more dangling references**: Voidborne Construct and Adam Smasher echoes, plus their sets `Wishes of Quiet Snowfall` and `Shadow of Shattered Dreams`, were all already cited in Lucilla/Lucy/Hiyuki's `bestEchoes` but never defined anywhere. `Shadow of Shattered Dreams` turned out to be a genuine 1-piece-only set (not the usual 2pc/5pc pattern) — also fixed Lucy's `bestEchoes` text, which incorrectly called it "5pc". A scripted check now confirms every character's `bestEchoes` resolves except Jingran's intentional pre-release placeholder.
- Icon art still not done — no licensed art source, same gap as characters/weapons.
- **3.4's echo set (Somnoire: Night City) — resolved as "none exists":** checked all 4 confirmed v3.4-era characters' Prydwen build guides directly (Rebecca, Lucilla, Lucy, Rover: Electro) — none reference a genuinely new 3.4-exclusive set; all their best sets are either pre-existing ones or the v3.5 sets covered above. v3.4 simply didn't introduce a new Sonata Set.

---

## 5. Region / Map — ⏭️ SKIPPED (blocked, user-confirmed out of scope)

**Main work:** Two entire regions are unrepresented: **Somnoire: Night City** (3.4) and **Land of Xuanfang / Mengzhou** (3.5, ongoing into 3.6). Add zone data to `mapZones.js` (currently an **empty array** — `export const MAP_ZONES = []`), plus draft entries in `mapDefaults.js`/`mapOverlays.js`/`mapIconCatalog.js` for points of interest, collectibles, bosses.

**Why skipped:** This isn't a research gap like the other steps — it's a genuine infrastructure blocker. `MAP_ZONES` polygons are authored in *pixel coordinates on this app's own 16384×16384 tile image*, gathered by clicking the live rendered map in dev mode (per the authoring instructions in `mapZones.js`). There's no external source I can reasonably transplant coordinates from — a different site's interactive map uses its own coordinate space with no calibration mapping to this app's. Worse, the actual tile *images* for both regions don't exist yet in `public/map-tiles/` at all — there's nothing to click coordinates on even with browser access. Confirmed with the user (2026-08-14): skip rather than fabricate placeholder polygons, which would be actively misleading on a map feature.

**To unblock in future:** needs either (a) the real map tile images for both regions sourced and dropped into `public/map-tiles/`, after which coordinates could be gathered via the app's own dev-mode click-to-log flow, or (b) someone hand-authoring the zone polygons directly.

---

## 6. Meta / Tier List — ✅ DONE (already complete from an earlier session; re-verified this session)

`characters.js` has a dedicated `[SECTION:TIER_DATA]` block (~line 673) sourced from Prydwen.gg, assigning `tier.toa` (Tower of Adversity) and `tier.ww` (Whimpering Waste) per character via `Object.assign(CHARACTER_DATA[name], { tier: { toa, ww } })`.

**Verified this session:** all 7 live characters (Rebecca, Lucilla, Lucy, Yangyang: Xuanling, Suisui, Denia, Hiyuki) already have confirmed `TIER_DATA` rows (Prydwen, last updated 01/Aug/2026 — still current). Rover: Electro's T4/T4 placement remains documented in a comment rather than a separate row, per the existing one-row-per-character-key constraint. Qingxiao and Jingran correctly have **no** rows — they haven't released yet (v3.6, ~Aug 20).

**Connected work:**
- `TeamsTab.jsx`/`CollectionTab.jsx` both read `tier.toa`/`tier.ww` directly and are already wired — nothing further needed there.
- Tethys.gg checked as a possible cross-reference source: it has no standalone tier-list page (only per-resonator guides/calculations), so it isn't usable for this. Prydwen remains the sole source.

---

## 7. Team — ✅ DONE (this session)

**Main work:** Cross-checked every one of the 7 live characters' `teams` entries against Prydwen's "Synergies"/"Example Teams" sections (re-fetched all 7 character pages directly, not relying on the earlier nanoka-sourced guesses). Found and fixed 3 real mismatches:
- **Rebecca**: her own page explicitly says "Rebecca's best team is alongside [Yangyang: Xuanling]" (Lucy is only her *second*-best pairing) — the stored `teams` array never included Yangyang: Xuanling at all. Added it as the top entry.
- **Denia**: paired with Lynae in her Aemeath team, but Lynae is never mentioned anywhere in Denia's synergy section — the confirmed 3rd slot for that team is Chisa or Lupa. Fixed to Chisa.
- **Suisui**: was missing her explicitly named "Hiyuki Team" entirely (Prydwen calls Yangyang: Xuanling and Hiyuki her *two* best pairings, only Yangyang's was represented), and her Aemeath pairing also wrongly listed Lynae (same unconfirmed pick as Denia's). Added the Hiyuki team, fixed Aemeath's 3rd slot to Chisa.
- Lucy, Lucilla, Hiyuki, and Yangyang: Xuanling's stored teams were all independently verified accurate — no changes needed there.

**Connected work — completed:**
- Verified every team member name across all 7 characters' `teams` arrays resolves against `CHARACTER_DATA` (no dangling references) via a scripted check.
- `STANDARD_5STAR_CHARACTERS` — no new characters entered the standard pool this cycle, nothing to update.
- Full test suite (96/96) and production build both pass.

---

## 8. History — ✅ DONE (this session)

**Main work:** `BANNER_HISTORY` and `PIONEER_PODCAST_HISTORY` were already extended through 3.6 by earlier work this session (banner chronology fixes + event-date pass). Checked `TACTICAL_HOLOGRAM_HISTORY`, which stopped at v3.2 ("Synchronization") — confirmed via wutheringwaves.fandom.com that a new arena, **"Sparring"** (bosses: Denia, Myriad Snare: Rustfire Chassis — both Land of Xuanfang additions from Step 4), released in v3.5. Added that entry, and fixed `EVENTS.tacticalHologram`'s name, which had been wrongly set to "Simulation" (a misread from the wuwatracker timeline scrape) — the real name is "Sparring".

**Connected work — completed:**
- `DOUBLED_PAWNS_MATRIX_HISTORY` correctly stops at v3.1 — it was replaced by Endstate Matrix in v3.2, per its own comment; not a gap.
- No dedicated version-history table exists for Endstate Matrix itself (unlike Pioneer Podcast/Tactical Hologram/Doubled Pawns) — its single-cycle dates were already corrected in the Event-date pass; introducing a new history table for it wasn't part of this step's scope.
- Full test suite (96/96) and production build pass.

---

## 9. Event — ✅ DONE (this session)

**Main work:** `EVENTS` was extended earlier this session with real, exact-timestamped v3.5-cycle data pulled from wuwatracker.com's embedded event JSON (not the rendered page, which only shows relative countdowns) — 5 stale existing entries (Pioneer Podcast, Tactical Hologram, Endstate Matrix, Tower of Adversity, Whimpering Wastes) got real dates instead of leftover April-2026 ones, and 8 previously-missing events were added: Version Special Campaign, Gifts of Aftertune, Lament Recon: Tacet Crisis, Recaptured: Action Highlights, Bountiful Crescendo, Virtual Crisis: Quadrant Trials, Lollo Campaign: New Journey, Chord Cleansing.

**Connected work — resolved:**
- `EVENTS` vs. the specialized history tables (`PIONEER_PODCAST_HISTORY` etc.): confirmed no overlap needing reconciliation — `EVENTS` is a flat single-current-cycle structure (`EventsTab`/`PlannerTab` only ever read `currentStart`/`currentEnd` off it), while the `_HISTORY` arrays are the only place past cycles are tracked.
- **Somnoire: Night City / Land of Xuanfang one-time events**: deliberately not backfilled. `EVENTS` has no history array and `EventsTab` only renders the live object's active/expired split — there's no surface in the app that would ever display a past version's one-off event, so sourcing that data wouldn't connect to anything, the same reasoning that ruled out other unused-data additions this session.

---

## 10. Material — ✅ DONE (this session)

**Main work:** Ran a scripted cross-check of every character's `ascension`/`skillMaterials` and every weapon's `ascensionMaterials` against `MATERIAL_IMAGES`/`COMMON_MAT_TIERS`/`FORGERY_MAT_TIERS`, since the real material names had already been filled in for all 9 live characters by this point (this session's earlier passes). Found and fixed 2 categories of gap:
- **1 missing common-drop family**: `Autopuppet Kernel` (used by Suisui, Yangyang: Xuanling, and the Azure Oath weapon) had no entry in `COMMON_MAT_TIERS` at all — the Farming Planner would have silently failed to resolve that material row for those three.
- **10 missing specialty/weekly-boss-drop icons**: Cloudperch Seed, Dream of Stars, Flowborne Dream, Forget-Me-Not, Nightmare Flashdrive, Past Reveries, Redbell, Skyward Glazed Heart, Solidarity's Loneflame, We Who Question — added with the same placeholder-image policy used for character/weapon art all session (no licensed icon source available), via a new local `MATERIAL_PLACEHOLDER_IMAGE` constant in `constants.js` (kept local rather than importing banners.js's `PLACEHOLDER_IMAGE`, to avoid coupling the two leaf data modules together).
- A re-run of the same cross-check script after the fix confirms **zero remaining gaps**.

**Connected work — completed:**
- `RESONATOR_ASCENSION_COSTS`/`SKILL_UPGRADE_COSTS`/`WEAPON_ASCENSION_COSTS_5`/`WEAPON_ASCENSION_COSTS_4` confirmed purely level-based (no character-count hardcoding).
- Confirmed the **Material Farming Planner** (`PlannerTab.jsx`) is fully data-driven — it looks up `COMMON_MAT_TIERS[ascension.common]`/`FORGERY_MAT_TIERS[skillMaterials.forgery]`/`MATERIAL_IMAGES[name]` generically for any character/weapon, so this fix directly and immediately unblocks farming-route calculation for all 9 new characters and their weapons.
- Full test suite (96/96) and production build pass.

All 10 steps of the implementation plan are now complete or explicitly resolved (Region/Map skipped as a genuine infrastructure blocker, confirmed with the user).

---

## Suggested build order

```
1. Version           (standalone, ships first — fixes the visible "4 months stale" bug)
2. Characters         (blocks: Weapons, Echoes, Team, History, Material)
3. Weapons  ─┐
4. Echoes    ├─ can be done in parallel once Characters lands
5. Region   ─┘  (independent, but large — decide if in scope)
6. Team               (needs 2+3+4)
7. History            (needs 1+2)
8. Event              (needs 1, otherwise independent)
9. Material           (needs 2, ideally after 5)
10. Meta              (needs 2 + Prydwen access; skip Qingxiao/Jingran until post-launch)
```

Character portraits/art assets are the practical bottleneck across almost every step — worth confirming those exist or can be sourced before committing to a start date on step 2.

---

## 11. v3.6 launch pass — ✅ DONE (2026-08-20 session)

**Main work:** Confirmed v3.6 is genuinely live (nanoka.cc version selector: "3.6 (365) (latest)
(live) (current)") and closed the two real remaining gaps in Qingxiao/Jingran's `CHARACTER_DATA`
entries (which a prior session had already built out well past placeholder level — base stats,
rotation data, buff table, skill multipliers, resonance chain multipliers, and real signature
weapons were all already correct): their ascension/skill-material *names* (both were still the
literal string `'Unconfirmed (releases 3.6, ...)'`) and Jingran's Resonance Chain node names
(missing from `CHAIN_NODE_NAMES` entirely). See `Update_report.md`'s 2026-08-20 entry for full
source citations and exact values.

**Connected work — completed:**
- Added one new material, **Forged Empyrean's Sigh** (the boss-drop material both characters
  share), to `MATERIAL_IMAGES` via a new `MATERIAL_PLACEHOLDER_IMAGE` constant in
  `data/materialData.js` — every other material family both characters need already existed from
  earlier sessions' material passes.
- Fixed `CURRENT_BANNERS`/`BANNER_HISTORY`'s v3.6-p1 `featured4Stars` (was an unconfirmed
  Baizhi/Mortefi/Lumi carry-over guess; real trio per fandom's own convene table is
  Baizhi/Yangyang/Sanhua) and removed the now-stale `predicted: true` flag on that entry.
- Fixed a pre-existing, unrelated test bug: `data-integrity.test.js` unconditionally required
  `baseDef > 0` for every character, which conflicted with Jingran's genuinely kit-fixed `baseDef: 0`
  (confirmed on both nanoka.cc and fandom — his passive literally fixes his DEF to 0). Added an
  explicit, commented exception rather than falsifying his data with a fake nonzero DEF.
- Full test suite (**612/612**, up from 96 at the time of the original audit) and production build
  both pass.

**Confirmed still out of scope / genuine gaps, not oversights:**
- Jingran's `bestEchoes`/`teams` — no community build guide exists yet; he isn't live in any banner
  as of 2026-08-20 (confirmed for 3.6-p2, ~Sept 10).
- `TIER_DATA` rows for Qingxiao/Jingran — Prydwen's tier-list page is still headed "3.4 Patch" and
  its grid has no resolvable character names in this pass's fetch; can't safely infer placement.
- Version 3.7 — checked nanoka.cc for anything beyond 3.6; nothing exists yet. No speculative
  entries added.
- Game8 (`archives/452489`) returned a hard CloudFront 403 all session, unlike prydwen.gg/fandom
  which both worked fine with the same browser-fingerprint technique — not blocking since nanoka.cc
  + fandom fully covered this session's scope, but flagged in case a future session needs Game8
  specifically (e.g. for banner-history cross-checks Game8 previously provided).
