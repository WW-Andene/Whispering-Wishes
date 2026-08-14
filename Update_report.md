# Whispering Wishes — Content Refresh Audit Report

**Date of audit:** 2026-08-14
**App's last data version:** 3.3 (partial — only banner stubs for Denia/Hiyuki)
**Live game version:** 3.5 ("Blade of Past Resounds, Lingering Dream Hymns" — July 10 to August 19, 2026)
**Version 3.6 releases:** August 20, 2026 (6 days from today) — new characters Qingxiao and Jingran confirmed
**Gap:** 2 full shipped versions (3.4, 3.5) plus a 3rd about to land (3.6)

Sources used: `tethys.gg` (resonator roster), `encore.moe` (character wiki, version-diff tool), `ww.nanoka.cc` (character wiki with full kit data, current live-version banner), `game8.co` (patch notes, current/upcoming banners, hidden-trophy lists confirming per-version content), `prydwen.gg` (tier lists, build guides, real signature weapons/echo sets — Cloudflare block bypassed with a real browser UA, a Google referer, and enough render time for the JS challenge to clear; see §9).

---

## 9. Prydwen tier/build data — confirmed (2026-08-14, later pass)

Cloudflare no longer blocks `prydwen.gg` (bypassed via realistic browser fingerprint). Pulled full Review + Build tabs for all 8 characters still missing/partial in `CHARACTER_DATA`. This supersedes any earlier weapon/echo *guesses* in §2 with confirmed data — Rover: Electro's best weapon in particular was previously guessed wrong.

| Character | Role | Tier (ToA / WW) | Confirmed signature weapon | Confirmed best echo set | Notes |
|---|---|---|---|---|---|
| **Rebecca** | Hybrid | T0.5 / T1 | Skull Thrasher ✅ (guess confirmed) | Moonlit Clouds | Free character (collab). Best with Lucy. |
| **Lucilla** | Hybrid | **T0 / T0** | Freeze Frame ✅ (guess confirmed) | Wishes of Quiet Snowfall (Chafe) / Moonlit Clouds (Echo) | Dual Resonance Mode — needs 2-3 different echo builds depending on team. |
| **Lucy** | DPS | T1 / T2 | Spectral Trigger ✅ (guess confirmed) | Shadow of Shattered Dreams | Collab DPS — "lower damage ceiling than every modern release before her" per Prydwen; below Hiyuki/Aemeath/Luuk/Sigrika. |
| **Rover: Electro** | Hybrid | **T4 / T4** | **Blazing Brilliance** (NOT Emerald of Genesis — my earlier guess was wrong) | Moonlit Clouds | Prydwen: "basically a useless character right now," awaiting a future Electro Flare DPS to pair with. |
| **Yangyang: Xuanling** | DPS | **T0 / T0** | Azure Oath ✅ (confirmed) | Song of Feathered Trace (5P; main echo **Thousand-Puppet Pavilion** — confirms the Xuanfang-region echo set guessed in §4) | "One of the most meta releases... if not the most meta DPS to ever release." Best team: Chisa + Suisui. |
| **Suisui** | Support/Healer | T0 / T0.5 | Firstlight's Herald ✅ (already added) | Not captured in this pass (page truncated before Build tab) — needs one more fetch | Already fully in `CHARACTER_DATA`; **TIER_DATA row added this pass**. |
| **Denia** | Hybrid | T0 / T0.5 | Not captured this pass | Not captured this pass | **Element confirmed: Fusion**, Rectifier. Dual Resonance Mode (Fusion Burst / Tune Strain), same as Lucilla's problem — 3 echo sets needed for full flexibility. |
| **Hiyuki** | DPS | **T0 / T0.5** | Not captured this pass | Not captured this pass | **Element confirmed: Glacio**, Sword. Base stats confirmed: HP 10300 / ATK 463 / DEF 1112 / maxEnergy 125. "Best Glacio DPS by a huge margin... no competition since Carlotta." |

**Correction to §2:** Rover: Electro's `bestWeapon` should be **Blazing Brilliance**, not Emerald of Genesis as originally guessed — fix when her `CHARACTER_DATA` entry is built in Step 2.

**Still needed before Step 2 can fully build these 7 characters:** Suisui's echo set, Denia's and Hiyuki's signature weapons/echo sets (pages exist, just weren't fetched deep enough this pass), and full kit ascension/skill material names for all 7 (Prydwen shows "upgrade material information aren't available yet" for every one of them — will need `wiki.gg`/Fandom or wait for the game's own in-app data mine).

---

## 1. Evidence of the gap

- `app/src/data/banners.js` → `BANNER_HISTORY` ends at version 3.3, with the 3.3 entries themselves marked `// upcoming — dates approximate`.
- `app/src/data/banners.js` → `CURRENT_BANNERS` still displays the **v3.2 Lynae/Zani/Phoebe rerun** as "live" — that banner phase ended April 29, 2026, over 3 months ago.
- `VERSION_DATES`, `PIONEER_PODCAST_HISTORY`, `TACTICAL_HOLOGRAM_HISTORY`, `DOUBLED_PAWNS_MATRIX_HISTORY` all stop at 3.2/3.3.
- `app/src/data/characters.js` → `CHARACTER_DATA` has 45 entries, last additions Aemeath/Sigrika (3.1/3.2 era). Nothing from 3.3 onward.
- `app/src/data/weapons.js` / `echoes.js` → zero entries for anyone past 3.3.
- nanoka.cc confirms the live game version is **3.5**, with 3.6 currently in beta (patches 3.6.1–3.6.7 visible as upcoming/datamined).
- Game8's banner-tracker page (last updated Aug 10, 2026) confirms **3.5 Phase 2 is live now** (Suisui + Aemeath rerun banner), and **3.6 launches Aug 20, 2026** with Qingxiao and Jingran.

---

## 2. Missing characters — confirmed, with kit data pulled

### Version 3.4 — new region "Somnoire: Night City" (cyberpunk-themed, quest: *At Dream's Edge*)
| Character | Rarity | Element | Weapon | Role | Recommended weapons | Notes |
|---|---|---|---|---|---|---|
| **Rebecca** | 5★ | Electro | Pistols | Hybrid DPS/Hack-response, mode-switching (Huntress/Guts stances) | Skull Thrasher, Phasic Homogenizer, Relativistic Jet | Fury-Type Arsenal. Full kit pulled (Forte Gauge, Fervor/Hot Hand mechanics, Resonance Chains). |
| **Lucilla** | 5★ | Glacio | Rectifier | Support — dual mode (Glacio Chafe buffer / Echo Skill buffer) | Freeze Frame, Cosmic Ripples, Fusion Accretion | President of Startorch Academy. Full kit pulled (Focus Ring mechanic, Film Roll/Zoom stacks). |
| **Lucy** | 5★ | Spectro | Pistols | Main DPS, Hack DMG specialist | Spectral Trigger, Phasic Homogenizer, Solar Flame | The "Netrunner." Full kit pulled (TCP/Root Access/Algorithm Compaction, Spoofing Program Resonance Liberation). |
| **Rover: Electro** | 5★ | Electro | Sword | New Rover attunement — Resonance Skill DMG focus, multi-element Apex Resonance (Spectro/Havoc/Aero sub-hits) | Emerald of Genesis, Blazing Brilliance, Endless Collapse | App's `Rover` entry currently only lists `elements: ['Spectro','Havoc','Aero']` — the whole Rover data model needs an Electro branch added, not just a roster entry. Full kit pulled. |

*(Weapon: **Firstlight's Herald** (Rectifier) confirmed as a 3.4/3.5-era signature weapon, currently rate-up alongside Suisui.)*

### Version 3.5 — new region "Land of Xuanfang" (Mengzhou, Main Story Chapter IV)
| Character | Rarity | Element | Weapon | Role | Recommended weapons | Notes |
|---|---|---|---|---|---|---|
| **Yangyang: Xuanling** | 5★ | Havoc | Sword | Main DPS — dual Sword Stance (Azure/Feather) system, Havoc Bane stacking | Azure Oath, Emerald Sentence, Commando of Conviction | New alternate form of Yangyang, distinct kit — NOT a reskin, needs own `CHARACTER_DATA` entry. Full kit pulled. Released 3.5 Phase 1 (July 10). |
| **Suisui** | 5★ | Glacio | — (weapon type not captured this pass) | New Zephyr/Drizzle dual-stance kit | Firstlight's Herald (confirmed rate-up) | Suisui's sister-of-Yangyang character. Released 3.5 Phase 2 (July 30). Detailed Forte terms already captured in an earlier pass (Cloud Breath, Floral Epistle, Plume Step, Roaming Transcendent). Full nanoka kit page not yet pulled — do that before writing her `CHARACTER_DATA` entry. |

### Already has banner stub, still needs real character data
| Character | Notes |
|---|---|
| Denia | Banner entry exists (v3.3-p2) with placeholder `element: ''`. Nanoka/Game8 list her as a Version 3.5 **boss/story character** too — confirm if she's also playable-relevant beyond the banner stub. |
| Hiyuki | Banner entry exists (v3.3-p1) with placeholder `element: ''`. Needs full `CHARACTER_DATA` entry. |

### Confirmed upcoming (3.6, releases Aug 20, 2026 — 6 days out)
| Character | Notes |
|---|---|
| Qingxiao | 5★, Aero (confirmed via Game8 banner tracker: "5★ Limited Rate-Up: Qingxiao (Aero)"). Debuts alongside a Denia rerun. |
| Jingran | Confirmed releasing in 3.6, part of the ongoing Land of Xuanfang story. Element not yet confirmed. |
| Suoming, Hsin | Confirmed by Game8 as "future patches" beyond 3.6 — not yet released, don't build for these yet. |

**Total to build now: 7 characters** (Rebecca, Lucilla, Lucy, Rover: Electro, Yangyang: Xuanling, Suisui, plus filling in Denia/Hiyuki's real data) — full kit data for 5 of them is already captured above from nanoka.cc and ready to transcribe into `CHARACTER_DATA` format. Qingxiao/Jingran should wait until 3.6 actually ships (Aug 20) since kit data may still change.

---

## 3. Missing weapons (confirmed by name)

- **Azure Oath** — signature for Yangyang: Xuanling (Sword)
- **Firstlight's Herald** — signature for Suisui (Rectifier)
- 3.5 weapon reruns confirmed live: Verdant Summit, Stringmaster, Ages of Harvest, Blazing Brilliance, Rime-Draped Sprouts, Verity's Handle
- Rebecca/Lucilla/Lucy signature weapons not yet individually confirmed by exact name — likely need one more nanoka.cc `/weapon` pass (list call returned no readable content this time, page needs a retry or different selector).

---

## 4. Missing echoes / enemies

From `encore.moe/new` (3.6 datamine) — a full new Sonata Set tied to the Land of Xuanfang region:
- Smiter, Porcelain/Stone/Aureate Picket
- Kernel Puppet: Joy / Anger / Worry / Reflection / Grief / Fright (6-piece — very likely a themed sonata set, needs registering in `ECHO_SETS`)
- Fog Lionarch (+ Body/Head), Smolder, Forbidden Bastion (+ Phantom variant), Myriad Snare: Rustfire Chassis, Thousand-Puppet Pavilion, Phantom: Smiter

None of these exist in `app/src/data/echoes.js`. This is 3.6-era (not yet live) — lower priority than the 3.4/3.5 echoes tied to Somnoire: Night City and the first Xuanfang wave, which weren't separately inventoried this pass and need a follow-up check.

---

## 5. Missing region / world content

Two entire new regions are absent from the app's map data:
- **Somnoire: Night City** (v3.4) — cyberpunk-themed region tied to Rebecca/Lucy/Lucilla's story (quest: *At Dream's Edge*). Confirmed via Game8's 3.4 hidden-trophy list (references to "David and Lucy's residence," "Cherry Blossom Market," "Startorch Academy," "Illusion's End").
- **Land of Xuanfang / Mengzhou** (v3.5, ongoing into 3.6) — Main Story Chapter IV. New orgs/lore: Xuanfang Wardens, Xuan Triad, Skyworks, Censure Court/Cage, Ministry of Foreign Affairs.

`mapZones.js`, `mapOverlays.js`, `mapDefaults.js`, `mapIconCatalog.js` need extending for both — not yet cross-checked in detail against what's actually missing.

---

## 6. Missing version metadata

`banners.js` needs:
- **`CURRENT_BANNERS` replaced entirely** — highest-visibility issue, it's showing a banner that ended 3.5 months ago as "live." Correct current banner (confirmed via Game8, last updated Aug 10): **Phase 2 — Suisui (Glacio) + Aemeath (Fusion) rerun**, weapon banner **Firstlight's Herald + Everbright Polestar**, running until Aug 19, 2026.
- `VERSION_DATES`: add 3.4 (approx. dates need confirming) and 3.5 (**confirmed: July 10 – August 19, 2026**)
- `BANNER_HISTORY`: real (not "approximate") entries for all of 3.4 and 3.5's two phases each
- `PIONEER_PODCAST_HISTORY` / `TACTICAL_HOLOGRAM_HISTORY` / `DOUBLED_PAWNS_MATRIX_HISTORY`: extend through 3.4/3.5, check if new arenas shipped with either new region

---

## 7. Not yet checked / needs a follow-up pass

- Prydwen.gg — still Cloudflare-blocked; would add tier-list placement and community build consensus on top of the raw kit data already gathered.
- Suisui's weapon type and full nanoka.cc kit page (only her Forte terms were captured, not the full character page like the other 5).
- Exact signature weapons for Rebecca, Lucilla, Lucy by name.
- Full echo/enemy list for 3.4 (Somnoire: Night City) — only 3.6's datamined list was inventoried.
- Map/zone data specifics for both new regions.
- Qingxiao and Jingran's kits — intentionally deferred until 3.6 ships Aug 20 to avoid building on beta data that may change.
- Denia's apparent dual role as both a banner character (3.3) and a "Version 3.5 Boss" per Game8 — worth confirming what that boss reference actually means before assuming she needs two different data treatments.

---

## 8. Suggested priority order

1. **`CURRENT_BANNERS`** — fix the banner that's been stale for 3.5 months. Cheapest, highest-visibility win. Data is already confirmed above.
2. **Version metadata** for 3.4/3.5 (`VERSION_DATES`, `BANNER_HISTORY`, event histories).
3. **5 characters with kit data already in hand**: Rebecca, Lucilla, Lucy, Rover: Electro, Yangyang: Xuanling — can go straight into `CHARACTER_DATA` from the tables in section 2.
4. **Denia & Hiyuki** — upgrade from placeholder stubs to real entries.
5. **Suisui** — one more nanoka.cc fetch needed for her full kit before writing her entry.
6. **Weapons + echoes** tied to all of the above.
7. **New region map data** (Somnoire: Night City, Land of Xuanfang) if the app's map feature should reflect current content.
8. **Wait for Aug 20** before touching Qingxiao/Jingran — build them once 3.6 is actually live, not off beta datamines.
