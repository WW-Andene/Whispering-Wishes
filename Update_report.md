# Whispering Wishes — Content Refresh Audit Report

## 2026-08-20 session (follow-up) — 4 gaps from prior review addressed

**1. game8.co access — genuinely blocked, not a tool-selection failure.** Checked `mcp__DV__dv_tools`'s
full catalog: every DV browser-driving tool (`screenshot`, `interact`, `inspect`, `meta`, `page_eval`,
`console_logs`, `sandbox_*`) only operates against **this app's own deployed preview** (they all require
`owner`/`repo`/`slug`) — none of them navigate arbitrary external URLs. `web_fetch` is the only DV tool
that fetches arbitrary sites, and it already supports `jsRender` (real headless Chromium) + `stealth`
(patches `navigator.webdriver`/plugin fingerprints) + custom UA/referer — i.e. the same technique that
works on prydwen.gg/fandom. Re-tried it against `game8.co/games/Wuthering-Waves/archives/453473` with
full JS rendering, an 8s wait, a real Chrome UA, and a google.com referer: still a hard **CloudFront 403
"Request blocked"** at the edge, before any page JS runs. This matches `web_fetch`'s own documented
limitation: "Pure network/WAF IP-level blocks... cannot be bypassed by any combination of these
options — that needs an official API, a paid proxy/anti-bot vendor, or a mirror source instead." Given
there's no alternate DV tool that reaches non-preview URLs, this is a genuine dead end this session too,
not a missed tool. Not needed in the end — items 2/3 below were fully answerable via wuwatracker.com and
nanoka.cc instead.

**2. `EVENTS` — genuinely stale, now fixed.** Confirmed the gap directly: every dated entry in
`app/src/data/banners.js`'s `EVENTS` object still had `currentEnd`/`currentStart` pinned to the **v3.5
cycle** (ending 2026-08-19), even though `VERSION_DATES`/`PIONEER_PODCAST_HISTORY`/`BANNER_HISTORY` had
already been correctly rolled to v3.6 by the prior session — the live-event countdown block was simply
never touched when v3.6 shipped today. Re-fetched `wuwatracker.com/fr/timeline` via
`mcp__DV__web_fetch` (`jsRender:true`, 6-8s wait) and read the rendered v3.6 event bar directly (the
site exposes no readable embedded JSON for this page, unlike its achievements dataset, so exact
per-event timestamps to the minute weren't recoverable — only names + relative durations). Fixed:
  - `tacticalHologram` renamed **"Tactical Hologram: Simulation"** (replaces v3.5's "Sparring" arena);
    `pioneerPodcast`, `endstateMatrix`, `versionSpecialCampaign` re-anchored to the confirmed-live
    v3.6-p1 window (`BANNER_HISTORY`: 2026-08-20 → 2026-09-10 / 09-30 version end).
  - `towerOfAdversity` rolled to its next 28-day cycle (2026-08-17 → 09-14, independent of version
    boundaries); `whimperingWastes` left untouched — today falls inside its existing Aug 3–31 window.
  - Removed 5 one-off v3.5 events confirmed ended (not on the live v3.6 bar): `versionSpecialCampaign`
    description text, `giftsOfAftertune`, `lamentReconTacetCrisis`, `virtualCrisisQuadrantTrials`,
    `lolloCampaignNewJourney`. Replaced with the actual v3.6 event names read off the bar:
    `giftsOfDriftingMist` (renamed from Aftertune), `bountifulCrescendo` (returning), and 5 new v3.6
    events — `resonanceSimRealm`, `secondComingOfSolaris`, `theStringsRemember`,
    `ifDreamsStillReverberate`, `fogveilPagoda` — all anchored to the v3.6-p1 window as an estimate
    (flagged in-code), same convention this file already uses for `VERSION_DATES`'/`BANNER_HISTORY`'s
    own 3.6 estimates. `chordCleansing` kept (still on the v3.6 bar), dates re-anchored.
  - Mirrored every key rename/addition into `banners.fr.js`'s `EVENTS_FR` (French names/descriptions)
    so the locale swap doesn't silently fall back to English for the new keys.
  - No new `_HISTORY` row was needed beyond what was already there: `PIONEER_PODCAST_HISTORY` already
    had its 3.6 row from the prior session; `TACTICAL_HOLOGRAM_HISTORY` still needs a 3.6 "Simulation"
    row once its exact arena boss roster is confirmable (left unadded rather than guessed — same
    stance as the prior session's Qingxiao/Jingran material sourcing).

**3. Qingxiao kit/weapon — spot-checked against nanoka.cc, confirmed accurate, no fixes needed.**
Re-fetched `ww.nanoka.cc/character/1413` live (v3.6, now genuinely live per the site's own version
selector) and cross-checked `CHARACTER_DATA['Qingxiao']`/`SKILL_MULTIPLIERS['Qingxiao']` field-by-field:
base stats (HP 10,300 / ATK 463 / DEF 1,112 / Tune Break Boost 10) match exactly; skill names (Strings
to Steel, Severing Note, Billows Beneath Heaven, Tonality Shift) match; Basic Attack multipliers in
`SKILL_MULTIPLIERS` (`30.13%×2 → 37.09%×2 → 24.36%×4 → 86.73%+5.43%×4`) and Heavy Attack
(`14.62%×3+21.92%×6+263.03%`) match nanoka's own "Skill Attributes (Lv.10)" table exactly, digit for
digit. `WEAPON_DATA['Glint of Clouds']` (base ATK 500, Crit Rate substat +36.0%, full R1 passive text)
was already populated with real numbers, not placeholder text. Did not find anything blank, truncated,
or wrong in this pass — the prior session's kit-data pull holds up under a fresh independent check. Did
not re-check Jingran's weapon this session (time went to items 1/2/4 instead); it was already flagged
non-placeholder by the prior session's own report.

**4. ibb.co asset album — confirmed genuinely empty, not an access-key/gating issue.** Fetched
`https://ibb.co/album/pnZXD3` via `mcp__DV__web_fetch` with `jsRender:true` and inspected the rendered
page's own embedded resource JSON (`CHV.obj.resource`): `"privacy":"public"`, owned by user `andene`,
**`"image-count":"0"`**, page body literally renders "There's nothing to show here." for every sort
tab (Most recent/Oldest/Most viewed/AZ) and for sub-albums. Tried both the accesskey-as-cookie and
accesskey-as-query-param forms in case the album were actually private — same empty result either way,
and the resource JSON confirms it's already public (no key needed). This is a genuinely empty album,
not a fetch/auth failure — no icons, portraits, or material art to pull from it this session. The app's
existing placeholder-art convention (`MATERIAL_PLACEHOLDER_IMAGE`/`PLACEHOLDER_IMAGE`) stays as-is;
nothing to wire in.

**Tests/build:** 612/612 tests still passing after the `EVENTS` changes; production build succeeds clean.

---

## 2026-08-20 session — v3.6 confirmed live, Qingxiao/Jingran upgraded from placeholder to real kit data

**Confirmed:** nanoka.cc's version selector now reads "Version 3.6 (365) (latest) (live) (current)" —
v3.6 genuinely shipped today, not still in beta. Both Qingxiao (character/1413) and Jingran
(character/1212) have full nanoka.cc kit pages (skills, Forte mechanics, Resonance Chain, damage
tables) despite Jingran's own fandom wiki page still being flagged "upcoming content" — he's
confirmed releasing in the 3.6-p2 banner (~Sept 10, per the app's existing BANNER_HISTORY), not
live day-one like Qingxiao (who released today, confirmed via her own fandom infobox: "Release
Date: August 20, 2026", convene "Wind of Transcendence" 2026-08-20 – 2026-09-10).

**What was actually missing on entry to this session:** a prior session had already built out
Qingxiao and Jingran's `CHARACTER_DATA` entries (base stats, rotation data, buff table, skill
multipliers, resonance chain multipliers, real signature weapons) far beyond a bare placeholder —
the two genuine gaps were (1) ascension/skill material *names*, both still literally
`'Unconfirmed (releases 3.6, ...)'`, and (2) Jingran's Resonance Chain *node names*, entirely
missing from `CHAIN_NODE_NAMES`.

**Fixed this session:**
- **Materials** — confirmed via `wutheringwaves.fandom.com`'s own Ascension Materials / Forte
  tables for both characters (their pages are live even though Jingran hasn't banner-released):
  - Qingxiao: `ascension: { boss: "Forged Empyrean's Sigh", common: 'Autopuppet Kernel', specialty: 'Blade Blossom' }`, `skillMaterials: { weeklyDrop: 'We Who Question', forgery: 'Polarizer' }`
  - Jingran: `ascension: { boss: "Forged Empyrean's Sigh", common: 'Whisperin Core', specialty: 'Cloudperch Seed' }`, `skillMaterials: { weeklyDrop: 'Skyward Glazed Heart', forgery: 'Carved Crystal' }`
  - All families except one already existed in `COMMON_MAT_TIERS`/`FORGERY_MAT_TIERS`/`MATERIAL_IMAGES`
    from earlier sessions' material passes. The one new material — **Forged Empyrean's Sigh** (the
    boss-drop both characters share) — had no icon source; added to `MATERIAL_IMAGES` via a new local
    `MATERIAL_PLACEHOLDER_IMAGE` constant in `data/materialData.js`, matching the existing
    placeholder-art convention (kept separate from `banners.js`'s own `PLACEHOLDER_IMAGE` to avoid
    coupling the two leaf data modules, per that convention's own stated rationale).
- **Jingran's Resonance Chain node names** — sourced from nanoka.cc (fandom's own page literally says
  "Jingran doesn't have any Sequence Nodes yet"): `Yin and Yang in Harmony, the Ultimate Law of Being`
  / `A Solitary Lantern, Across Lands Shade-Trodden` / `World's Course Shifts, Each to Their Rightful
  Paths` / `Where Reality Meets Illusion, Where Living Meet Dead` / `Ends Return to Beginnings, Truth
  of Life Laid Bare` / `As Favors and Feuds Fade, New Stories Await`.
- **`CURRENT_BANNERS`/`BANNER_HISTORY` v3.6-p1 correction** — `featured4Stars` for both Qingxiao and
  Denia's banner cards was an unconfirmed carry-over guess (`Baizhi/Mortefi/Lumi`); fandom's own
  convene table names the real trio as **Baizhi/Yangyang/Sanhua**. Fixed in both places. Also removed
  the stale `predicted: true` flag from the `v3.6-p1` `BANNER_HISTORY` entry — it's confirmed live
  now, not a Game8 estimate anymore.
- **Test suite fix (pre-existing, unrelated to the above):** `data-integrity.test.js`'s "every
  character has base stats" test unconditionally asserted `baseDef > 0` for every character. Jingran's
  kit genuinely fixes his combat DEF to 0 (his "Nether to Light" passive: *"Jingran's DEF is fixed at
  0"* — confirmed identically on both nanoka.cc and fandom), so this was a real conflict between a
  test assumption and a correctly-modeled zero value, not a data bug. Fixed the test to explicitly
  allow Jingran's confirmed real `baseDef: 0` instead of leaving the suite red or falsifying the data
  with a fake nonzero value.

**Verified, not re-fetched (already correct from a prior pass):** Qingxiao's base stats (HP 10300 /
ATK 463 / DEF 1112 / maxEnergy 125), specialty material (Blade Blossom), signature weapon (Glint of
Clouds, real Sword stats/passive already in `WEAPON_DATA`), skills/Forte description, and
`CHAR_BUFF_TABLE`/`SKILL_MULTIPLIERS`/`RESONANCE_CHAIN_DATA` rows for both characters — all
cross-checked against this session's own nanoka.cc kit pulls and found accurate.

**Confirmed as genuine gaps, not fetch failures — left as explicitly-marked "Unconfirmed":**
- **Jingran's `bestEchoes`/`teams`** — no community build guide exists yet; he isn't banner-live
  (confirmed 3.6-p2, ~Sept 10). Fandom's own wiki still says "not featured in any Event Convene."
- **`TIER_DATA` for both characters** — Prydwen's tier-list page, re-fetched this session, is still
  headed "Wuthering Waves Tier List (**3.4** Patch)" and its character grid renders with no resolvable
  text names (image/tooltip-only cells) — neither confirms nor lets us safely infer either character's
  placement. Correctly left with no `TIER_DATA` row for either, same as the prior session's stance.
- **Version 3.7** — checked nanoka.cc's own version selector for anything past 3.6 (`?version=3.7`
  redirects to the same 3.6 roster, no new names) — nothing genuinely confirmed exists yet. No
  placeholder/upcoming entries added, per this session's explicit instruction not to fabricate.

**Source access note:** Game8 (`game8.co/games/Wuthering-Waves/archives/452489`) returned a hard
CloudFront 403 this session (`"The request could not be satisfied... Request blocked"`) even via the
same browser-fingerprint technique that reliably works on prydwen.gg and fandom — could not be routed
around. Not needed in the end: nanoka.cc + fandom together fully covered this session's scope.

**Tests/build:** Full suite now **612/612 passing** (up from 96 in the earlier audit — the app's test
suite has grown substantially across sessions since this report was first written), production build
succeeds clean.

---

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

---

## 9. 2026-08-20 — Missing-art placeholder fix (fandom sourcing + local rehost)

Ran a fresh inventory of every `PLACEHOLDER_IMAGE`/`MATERIAL_PLACEHOLDER_IMAGE` reference across
`app/src/data/*.js`. Finding: **almost all of the characters named in the original placeholder-art
gap (Rebecca, Lucilla, Lucy, Rover: Electro, Yangyang: Xuanling, Suisui, Denia, Hiyuki, Qingxiao,
Jingran and their signature weapons) already have real ibb.co-hosted sprite/banner art** wired in
from prior sessions — that part of the original complaint is stale. The actual remaining gap was
much smaller:

- 2 weapon icons: **Glint of Clouds** (Qingxiao's Sword), **Thousandfold Deliverance** (Jingran's
  Broadblade) — `WEAPON_ICONS` in `banners.js`
- 1 material icon: **Forged Empyrean's Sigh** (Qingxiao/Jingran's shared v3.6 boss-drop ascension
  material) — `MATERIAL_IMAGES` in `materialData.js`
- 9 v3.6 event banner images in `CURRENT_EVENTS` (`banners.js`)

**Sourcing**: fetched wutheringwaves.fandom.com via its MediaWiki `api.php` (`action=query`,
`list=search` + `prop=imageinfo`), which bypasses the site's Cloudflare challenge that blocks plain
HTTP fetches of wiki pages. Found and downloaded real game assets for all 3 weapon/material icons
and 4 of the 9 events (Bountiful Crescendo, Fogveil Pagoda, Chord Cleansing, Second Coming of
Solaris). The other 5 events (Version Special Campaign, Gifts of Drifting Mist, Resonance Sim Realm,
The Strings Remember, If Dreams Still Reverberate) have no dedicated wiki file yet — likely too new
(v3.6 launched today) for the wiki to have uploaded dedicated art — so they remain on
`PLACEHOLDER_IMAGE`.

**Hosting**: no `IMGBB_API_KEY` is set anywhere in this environment (checked env vars, `agent/lib/`,
`.env.example` files — only an example placeholder exists), and imgbb's anonymous web-upload flow is
session/CSRF-gated, not a stable scriptable public endpoint, so it wasn't used. Instead, the 7
sourced images were committed directly into the repo under `app/public/icons/` and referenced by
same-origin path (`/icons/glint-of-clouds.webp`, etc.) — this matches the app's existing local-asset
convention (`app/public/portraits/`, `app/public/map-icons/`) and is covered by the CSP's default
`'self'` `img-src` without needing any external allowlist change. All downloaded files are actually
WebP regardless of their fandom filename extension (confirmed via `file`).

**Wired in**: `Glint of Clouds`, `Thousandfold Deliverance` (`WEAPON_ICONS`), `Forged Empyrean's
Sigh` (`MATERIAL_IMAGES`), `bountifulCrescendo`, `fogveilPagoda`, `chordCleansing`,
`secondComingOfSolaris` (`CURRENT_EVENTS`) — 7 of the 12 gap items closed with real fandom art.

**Still placeholder** (`PLACEHOLDER_IMAGE`, honest gap — no real asset found): `versionSpecialCampaign`,
`giftsOfDriftingMist`, `resonanceSimRealm`, `theStringsRemember`, `ifDreamsStillReverberate`.

**Caveat**: `secondComingOfSolaris`'s art (`File:Second_Coming_of_Solaris_(Ultra).jpg`) is from an
earlier "Second Coming of Solaris" event run, not confirmed as pixel-identical to this v3.6
"Coded Deception" sub-event — used as the best real-asset match, flagged in-code.

Verified: `npm run build` succeeds, `npx vitest run` — 612/612 tests pass, `dist/icons/` contains all
7 new files after build.

---

## 2026-08-20 (session 3) — imgbb migration

**Correction from user**: the imgbb API key (redacted) is a real imgbb.com API key (session 2
had wrongly evaluated it as an unusable ibb.co album key and worked around it by committing images
locally). Migrated the 7 locally-hosted images from session 2 to imgbb per the app's existing
external-hosting convention.

**Uploaded** all 7 via `POST https://api.imgbb.com/1/upload` (multipart, `key=...&image=@file`) —
all succeeded:
- `bountiful-crescendo.webp` -> `https://i.ibb.co/TqLqWVsv/bountiful-crescendo.webp`
- `chord-cleansing.webp` -> `https://i.ibb.co/99Pk72ZX/chord-cleansing.webp`
- `fogveil-pagoda.webp` -> `https://i.ibb.co/WNv772NQ/fogveil-pagoda.webp`
- `forged-empyreans-sigh.webp` -> `https://i.ibb.co/9mZJHrQ4/forged-empyreans-sigh.webp`
- `glint-of-clouds.webp` -> `https://i.ibb.co/Q3CfgYv8/glint-of-clouds.webp`
- `second-coming-of-solaris.webp` -> `https://i.ibb.co/7tVkVbdx/second-coming-of-solaris.webp`
- `thousandfold-deliverance.webp` -> `https://i.ibb.co/ccHCPYHF/thousandfold-deliverance.webp`

Spot-checked 2 URLs with a direct `curl` HEAD-equivalent fetch — both returned `200 image/webp` with
byte sizes matching the local originals exactly (329904 and 45828 bytes), confirming clean uploads.

**Wired in**: updated `WEAPON_ICONS`/`MATERIAL_IMAGES` (`banners.js`, `materialData.js`) and
`CURRENT_EVENTS` (`banners.js`) to point at the new `i.ibb.co` URLs, matching the convention used
everywhere else in those files. Deleted `app/public/icons/` entirely (confirmed via repo-wide grep
that nothing else referenced the local paths) — no orphaned assets remain.

---

## 2026-08-20 (session 4) — Qingxiao skill/Resonance Chain icons: sourcing dead end

**User report** (in French): "You forgot the skill/ability icons and Resonance chain icons for
Qingxiao."

**Confirmed the gap is real**: `app/src/data/characters.js` has two icon lookup tables —
`SKILL_ICONS` (keyed by character name, sub-keyed by skill-name substrings matched via
`getSkillIcon()`) and `CHAIN_NODE_ICONS` (keyed by character name, `s1`–`s6`). Both are populated
for every audited character up through `Suisui`, but **neither has a `'Qingxiao'` entry at all** —
confirmed by grepping both object literals directly (not just `PLACEHOLDER_IMAGE` markers this
time; the keys are simply absent, so `CharacterDetailModal.jsx`'s `getSkillIcon(name, skillName)`
and `CHAIN_NODE_ICONS[name]?.['s'+s]` both silently return `null`/`undefined` for him — no broken
image tag, just nothing rendered). `Jingran` has the same gap but he isn't live yet (~Sept 10) so
wasn't the reported complaint. Exact skill names needed (from `SKILL_MULTIPLIERS['Qingxiao']`):
Basic ATK (`Stringblade Stage 1-4`, `Stringblade`), 2 Skill entries (`Severing Note: Judgement`,
`Severing Note: Ascendant`), Forte (`Heaven's Reckoning: Ephemeral Transcendence`), Liberation
(`Billows Beneath Heaven`), Intro (`Tonality Shift`), Outro (`Lingering Song`). Chain node names are
already present in `CHAIN_NODE_NAMES['Qingxiao']` (sourced nanoka.cc pre-release, 2026-08-18) —
just needed matching icon URLs.

**Sourcing attempt — dead end, confirmed via direct checks, not assumed**:
- Fandom's MediaWiki API (`action=query&titles=Qingxiao&prop=images`, and the same on
  `Qingxiao/Gallery`) lists every image actually uploaded for his page: portraits, splash art,
  element/rarity/element icons, teaser thumbnails. **Zero `Skill_*.png` or
  `Sequence_Node_*.png` files exist for him** — confirmed by title search for each exact skill/node
  name (`Severing Note`, `Ephemeral Transcendence`, `Billows Beneath Heaven`, `Tonality Shift`,
  `Lingering Song`, `Stringblade`, and 2 of his 6 chain-node names) — all return zero File: hits.
  The wiki genuinely hasn't uploaded per-skill/per-node art yet, one day after his live launch —
  consistent with the same freshness gap already noted for his event banners in session 2/3.
- `ww.nanoka.cc/character/1413` (used successfully for his kit *text* in earlier sessions) is a
  SvelteKit SPA — its HTML shell is 3KB with all content fetched client-side by JS; plain `curl`
  gets nothing, and no static `/api/*` or `/_next/data`-style JSON endpoint was found in its bundled
  JS. Rendering it requires a JS-capable fetch.
- DV's browser tools are still down this session: `mcp__DV__dv_status` and
  `mcp__DV__web_fetch` both fail immediately with `Bad Request: missing or invalid Mcp-Session-Id
  header` — the same persistent failure a prior session already flagged. `WebFetch` (the built-in
  tool) got an HTTP 403 from nanoka.cc directly.

**Decision**: did not wire in anything. There is no real art available for Qingxiao's skill/chain
icons from either usable source this session — fabricating filler icons (e.g. reusing a generic
weapon icon for all 5 unique skill slots, or reusing another character's chain nodes) would be
worse than the current silent-gap state, and would misrepresent sourcing rigor the rest of this
data file follows. `SKILL_ICONS['Qingxiao']` and `CHAIN_NODE_ICONS['Qingxiao']` remain unset.

**Verified no regression**: `npx vitest run` — 606/612 passing, 6 pre-existing failures confined to
`SpinePlayer.jsx`/`BannerCard.jsx` (unrelated to character data, present before this session's
investigation began — no data file was touched). `npm run build` (from `app/`) succeeds clean.

**Recommendation for a future session**: retry once either (a) DV's browser tools recover (session
ID header issue gets fixed upstream) so `ww.nanoka.cc/character/1413` can be rendered and its
skill/chain icon `<img>` srcs read directly, or (b) fandom's wiki editors catch up and upload
`Skill_*`/`Sequence_Node_*` files for Qingxiao (likely within the next few days, based on how other
recent 5★s were covered). A same-day check-in with the MediaWiki `action=query&prop=images` calls
used above is cheap and should be the first move next time.

**Re-checked the 5 still-placeholder v3.6 events** (`versionSpecialCampaign`, `giftsOfDriftingMist`,
`resonanceSimRealm`, `theStringsRemember`, `ifDreamsStillReverberate`) via fandom's MediaWiki
`action=query&list=search` API, one day after v3.6 launch. No exact-title wiki pages exist yet for
any of the 5 (search returns only unrelated/older matches, e.g. "Lollo Campaign" pages, "Gifts of
Fleeting Dreams", "Depths of Illusive Realm"). Left on `PLACEHOLDER_IMAGE` — still no real asset
available.

Verified: `npm run build` clean, `npx vitest run` 612/612 passing.

---

## 2026-08-20 (session 5) — Qingxiao skill/R.Chain icons sourced; game8 confirmed still blocked

**Picked up the dead end logged in session 4.** DV's browser tools (`mcp__DV__web_fetch` with
`jsRender`) are working again this session. Used the same anti-bot technique the user described
(real Chrome/Windows UA, `referer: google.com`, `waitUntil: load` + an 8s wait so any JS challenge
has time to finish) to render `ww.nanoka.cc/character/1413`. The rendered page's raw HTML exposed
the game's own CDN paths on `static.nanoka.cc` — `SkillIcon/SkillIconQingxiao/SP_IconQingxiao{B1,C1,
D1,D2,QTE,T,Y}.webp` for the 7 skill-slot icons and `Image/IconDevice/T_IconDevice_QingxiaoM{1-6}_UI.webp`
for the 6 R.Chain node icons. That CDN has no JS challenge of its own, so all 13 fetched cleanly with
a plain `curl` once the exact filenames were known.

**Letter convention** (B=Basic ATK, C=Resonance Skill, D=Forte Circuit [2 icons, matching Qingxiao's
2 Forte-state moves], QTE=Resonance Liberation, T=Intro, Y=Outro) inferred from nanoka's site-wide
skill-icon-atlas ordering, not from filenames alone — cross-checked against the kit text already in
`SKILL_MULTIPLIERS['Qingxiao']` (confirmed correct visually: B1 is a sword-attack icon, QTE is the
liberation-style dramatic burst icon, T/Y are the intro/outro insignia style icons used elsewhere).

Uploaded all 13 to imgbb (`ibb.co/album/pnZXD3`) and wired them into `app/src/data/characters.js`:
- `SKILL_ICONS['Qingxiao']` — 9 skill-name-substring keys covering all `SKILL_MULTIPLIERS['Qingxiao']`
  move names, sharing icons across combo variants (e.g. Plunging Attack/Sword Glide reuse Basic ATK).
- `CHAIN_NODE_ICONS['Qingxiao']` — s1-s6, in the game's own M1-M6 order (matches the existing
  `CHAIN_NODE_NAMES['Qingxiao']` s1-s6 order already sourced from the same nanoka page).

**Event placeholders ("remaining events")**: re-attempted game8.co (archives/453303 banner,
archives/453473 event) with the same browser-signature technique — still returns `ERROR: The
request could not be satisfied` (CloudFront/WAF block), both with `waitUntil: load` and a stealth
retry. Fandom's MediaWiki search (re-checked) still has no pages for the 5 events left on
`PLACEHOLDER_IMAGE` (`versionSpecialCampaign`, `giftsOfDriftingMist`, `resonanceSimRealm`,
`theStringsRemember`, `ifDreamsStillReverberate`) or `CURRENT_BANNERS.eventBannerImage`. Left as-is
— did not fabricate art. game8 access remains the open blocker for a future session to retry.

Verified: `npm install` (deps weren't present this session), `npx vitest run` — 612/612 passing,
`npm run build` (from `app/`) succeeds clean.

---

## 2026-08-20 (session 6) — Fixed event durations using wuwatracker.com's real timeline chronology

**User correction**: the character-rotation pairing in `BANNER_HISTORY` is NOT "Qingxiao + Jingran"
running together — it's "Qingxiao → Jingran" (and Denia → Hiyuki, Mornye standalone), i.e. each
named banner runs its own 20-day slot and is followed by the next one when it ends. Checked
`BANNER_HISTORY` (`v3.6-p1`: Qingxiao+Denia, Aug 20 → Sep 10; `v3.6-p2`: Jingran+Hiyuki+Mornye,
Sep 10 → Sep 30) against `wuwatracker.com/fr/timeline` (rendered via DV's `web_fetch` with the
user's documented bypass — Chrome UA, google.com referer, 8s wait — now working) and confirmed this
sequencing was already correct: "Wind of Transcendence - Qingxiao Banner" (20d) is immediately
followed in the same lane by "Where Santu Beckons - Jingran Banner" (20d), same pattern for the
weapon banners and for Denia→Hiyuki; Mornye has no phase-1 predecessor (new lane starting Sep 10),
matching `v3.6-p2.characters` exactly. No change needed there.

**What the timeline did catch**: 4 of the still-guessed v3.6 event `currentEnd` dates in `EVENTS`
were all set to the phase boundary (2026-09-10) as a fallback, but the timeline shows real, differing
per-event durations counted from the Aug 20 phase-1 start:
- `resonanceSimRealm`: 5d → **2026-08-25** (was guessed at the full 21-day phase span)
- `secondComingOfSolaris`: 12d → **2026-09-01**
- `theStringsRemember`: 20d → **2026-09-09** (1 day short of the phase boundary, not exactly on it)
- `ifDreamsStillReverberate`: 26d → **2026-09-15** (runs 5 days *past* the phase-1/phase-2 boundary
  — the one event that outlasts the boundary rather than ending early)

`versionSpecialCampaign` and `giftsOfDriftingMist` timeline durations ("1mo") are consistent with the
existing Sep 10 guess, left unchanged. `fogveilPagoda`'s exact duration wasn't legible in the scraped
timeline text (absolutely-positioned bar, label extracted but its duration badge wasn't in DOM read
order near it) — left unchanged rather than guess.

Verified: `npx vitest run` — 612/612 passing.

---

## 2026-08-20 (session 7) — Detail Modal rotation: badge parity + fill the last 2-character gap

**User observation**: the Team tab's Rotation Guide (`RotationGuideCard.jsx`) reads as more developed
than the Collection detail modal's own "Standard Rotation" section — worth checking whether that's a
real gap or just team-context info that can't exist per-character.

**Findings**:
1. The Team tab's richer bits (`reason`, `inheritsFromTeam`, `ownKit`, `handsOffToNext`) are computed
   per-team-composition in `calcTeamStats.js` from the actual buff timeline of whichever characters are
   slotted together — they're not static per-character data and genuinely can't exist in a solo detail
   modal (there's no "team" to inherit from/hand off to outside Teams).
2. What *could* carry over 1:1: the Team tab's skill-sequence chips use `stepStyle()` (from
   `RotationTimeline.jsx`) — full spelled-out labels ("Resonance Skill", "Heavy Attack", etc.) instead
   of the modal's old plain `step.type` text. Wired `CharacterDetailModal.jsx` to use the same
   `stepStyle()` badge, so every character's solo rotation now reads with the identical vocabulary as
   the Team tab's guide.
3. **The real gap**: `CHARACTER_ROTATIONS` — the actual per-character step data both views read from —
   was missing exactly 2 of 58 characters: **Qingxiao and Jingran** (confirmed by diffing every
   `CHARACTER_DATA` key against `CHARACTER_ROTATIONS` keys). Their detail modals silently rendered no
   rotation section at all (`localizedRotation` falsy → early return), while every other character had
   one.

**Fixed**: added `CHARACTER_ROTATIONS['Qingxiao']` — sourced from `prydwen.gg/wuthering-waves/
characters/qingxiao`'s "Gameplay and teams" tab (now live, last updated 20/Aug/2026), fetched via
DV's `web_fetch` with the user's documented bypass technique. Prydwen's own step list uses a generic
"Heavy:" prefix for every held-Basic-Attack chain (including her mid-air ones); renamed each step to
its real skill name/type from `SKILL_MULTIPLIERS['Qingxiao']` so it matches this table's existing
convention, keeping Prydwen's exact step order.

**Jingran — still not fixed, left out on purpose**: his own Prydwen page has no Kit/Review/Rotation
content yet ("Jingran rotation information aren't available yet"), and `wutheringwaves.fandom.com/
wiki/Jingran/Combat` returned nothing renderable either — consistent with him not being live until the
v3.6-p2 banner (~Sep 10, per `BANNER_HISTORY`). No fabricated rotation added; `CHARACTER_ROTATIONS`
is now 57 of 58, with Jingran the one legitimate remaining gap until his kit is actually published.

Verified: `npx vitest run` — 612/612 passing, `npm run build` succeeds clean.

---

## 2026-08-20 (session 8) — Actually brought Team tab's rotation depth into the detail modal

**User pushback (correctly)**: the previous session's fix was too narrow — it only changed badge
styling and filled a data gap for one character, not the actual thing asked for (bring the Team tab's
richer rotation explanation — reason/inherits/own-kit/hands-off — into the detail modal, for all
characters). The user then pointed out the key insight: every character already gets exactly this
"solo" version for free in the Team tab today, just by building a team with only that one character
slotted — `calcTeamStats(slots, ...)`'s only hard requirement is `mems.length` non-zero, no minimum
team size.

**Implemented generically, not per-character**: `CharacterDetailModal.jsx` now calls the same
`calcTeamStats` the Team tab uses, with a team of just the one character being viewed
(`calcTeamStats([name, null, null], 0, null, {}, '', 90)` — empty `teamEquipment` falls back to
`bestWeapon`/`bestEchoes`, the same "preview" defaults Team tab itself uses before you've equipped
anything). This computes real `selfActive`/`handsOff` buff blocks — own-kit buffs and what a follow-up
teammate would inherit from an Outro/skill — from the actual buff timeline, not hand-authored text, so
it covers all 58 characters at once with zero per-character authoring.

Two things deliberately left out of the solo view: `reason` (its copy assumes a team exists — "comes
on-field last to receive every buff stacked up before it" reads wrong with no teammates) and
`inherits` (always empty with 1 member, nothing to show). Kept the modal's own richer per-step
rendering (skill icon, DMG% from `SKILL_MULTIPLIERS`, locale-aware notes via
`getLocalizedCharacterRotations`) rather than swapping in Team tab's plainer chip-only version —
overrode the computed timeline's `skillSequence` back to the localized rotation so French notes aren't
lost (`calcTeamStats` itself sources from the raw English-only `CHARACTER_ROTATIONS`, a pre-existing
gap in the Team tab too, not something this introduces).

**Verified for all 58 characters**, not just spot-checked: wrote a throwaway script calling
`calcTeamStats([name, null, null], ...)` for every `CHARACTER_DATA` key — 58/58 computed without
error, all 58 produced non-empty `selfActive`/`handsOff` output (0 silently-empty solo rotations).

Verified: `npx vitest run` — 612/612 passing, `npm run build` succeeds clean.
