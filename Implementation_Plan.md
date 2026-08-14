# Content Refresh — Implementation Plan

Breaks the v3.4 → v3.6 catch-up (see `Update_report.md`) into ordered, self-contained steps. Each step lists the **main work** (the thing you asked for) and **connected work** (what else breaks or goes stale if that step ships without it).

Dependency order matters here: **Version → Characters → Weapons/Echoes → Teams/Meta → Events/History → Material**, with **Region** threaded through wherever a new area is involved. Steps are listed in the order I'd implement them, not the order you listed them, since some steps are inputs to others (e.g. Characters must exist before Teams can reference them).

---

## 1. Version

**Main work:** Extend `app/src/data/banners.js` → `VERSION_DATES` with real entries for 3.4, 3.5 (confirmed: **July 10 – Aug 19, 2026**), and 3.6 (**starts Aug 20, 2026**). Fix `CURRENT_BANNERS` to reflect the actual live banner (currently frozen on a v3.2 rerun that ended 4 months ago).

**Connected work:**
- `constants.js` → `APP_VERSION` is already `'3.5.0'` — worth confirming this constant is meant to track *game* version or *app build* version; if the former, it needs bumping to 3.6 on launch day.
- Every countdown/timer UI reading `CURRENT_BANNERS.startDate/endDate` or `VERSION_DATES` breaks silently (shows stale or negative countdowns) until this step lands — so this is the correctness-blocking step for almost everything else visible in the UI.
- This step has no data dependencies itself — it's pure dates — so it can and should ship **first**, standalone, before any character/weapon work.

---

## 2. Characters

**Main work:** Add `CHARACTER_DATA` entries for the 7 confirmed-missing resonators: Rebecca, Lucilla, Lucy, Rover: Electro (3.4), Yangyang: Xuanling, Suisui (3.5) — kit data already gathered in `Update_report.md` §2. Qingxiao and Jingran are **done** (added this session). Upgrade Denia/Hiyuki from banner-only placeholder stubs to real entries.

**Connected work — this is the step with the most fan-out:**
- `RELEASE_ORDER` array — every new character needs an entry here (already missing for all 8 names above except Qingxiao/Jingran, which are now added under a `// 3.6` comment; 3.4/3.5 characters need their own `// 3.4` / `// 3.5` blocks).
- `ALL_5STAR_RESONATORS` / `ALL_4STAR_RESONATORS` / `ALL_CHARACTERS` — derived automatically from `CHARACTER_DATA` + `RELEASE_ORDER`, so no manual edit, but worth a sanity check after adding.
- The **Rover data model** specifically needs work beyond a normal character add: `Rover.elements` currently hardcodes `['Spectro', 'Havoc', 'Aero']` — Electro needs to be threaded into whatever UI lets the user pick a Rover attunement (collection screen, team builder, planner), not just appended to the array blindly, since other code may assume 3 attunements.
- `CHAR_BUFF_TABLE`, `SKILL_MULTIPLIERS`, `RESONANCE_CHAIN_DATA`, and the block of parallel arrays around lines 350–660 (dmgFocus, base stats, combo timing, org/affiliation) feed the **Damage Calculator**. These are optional (already inconsistently populated for existing 3.3+ characters) but anyone who wants Rebecca/Lucy/etc. to actually work in the calculator needs these filled in — this is realistically its own sub-step, numerically heavy, best done per-character as a follow-up rather than blocking the character's existence in Collection/Planner/Teams.
- Portraits/art assets: `app/public/portraits/<pinyin-name>/` — every existing character has a folder there; the 7 new characters need matching folders + art before they'll render correctly anywhere in the UI (Collection grid, Team Builder, banner splash). This is likely the single biggest blocker to actually shipping this step — confirm asset availability/licensing before starting.
- `DEFAULT_COLLECTION_IMAGES` and `CHARACTER_THEMES` in `banners.js` also key off character name — needs an entry per new character for the collection screen's fallback art and any per-character UI theming.

---

## 3. Weapons

**Main work:** Add `WEAPON_DATA` entries in `weapons.js` for confirmed weapons: Azure Oath (Yangyang: Xuanling), Firstlight's Herald (Suisui), plus signature weapons for Rebecca/Lucilla/Lucy/Rover: Electro (names not yet confirmed — needs one more source pass, flagged in the report).

**Connected work:**
- `constants.js` → `ALL_5STAR_WEAPONS`, `WEAPON_RELEASE_ORDER`, `WEAPON_ASCENSION_COSTS_5` — same pattern as `RELEASE_ORDER`/`CHARACTER_DATA`: the weapon needs both the data entry and a release-order/cost-table entry or it won't show up in weapon pickers / ascension planners.
- `CHARACTER_DATA[name].bestWeapon` — once a weapon exists, go back and correct the `bestWeapon` field for Rebecca/Lucilla/Lucy/Rover: Electro (currently set from nanoka's "Recommended Weapons" list, which is fine, but double check the exact in-game name once available).
- Banner weapon images (`weaponBannerImage` etc. in `CURRENT_BANNERS`/`BANNER_HISTORY`) need matching art the same way character portraits do.
- **Depends on Characters step** being done first (weapons reference `forCharacter`).

---

## 4. Echoes

**Main work:** Add the confirmed new Sonata Set from Land of Xuanfang to `echoes.js` — Kernel Puppet (Joy/Anger/Worry/Reflection/Grief/Fright, 6-piece), plus the individual enemy echoes (Smiter, Fog Lionarch, Forbidden Bastion, Myriad Snare: Rustfire Chassis, Thousand-Puppet Pavilion, etc.) confirmed by Game8 as the actual competitive set for Qingxiao (**Heart of Evil's Purge** — this is likely the retail name for the "Kernel Puppet" set nanoka.cc showed in beta/datamined form; reconcile the two names before writing data).

**Connected work:**
- `ECHO_SETS` (set → bonus description), `ALL_4COST_ECHOES`/`ALL_3COST_ECHOES`/`ALL_1COST_ECHOES` (cost-tier buckets — need to know each echo's cost, not yet gathered), `ECHO_SKILL_BUFFS` (active-skill numbers for calculator use).
- `ALL_ECHO_SONATA_SETS` / `ALL_ECHO_BUFF_TYPES` are auto-derived — no manual work, but again worth a post-add sanity check.
- `CHARACTER_DATA[name].bestEchoes` — once echo data lands, revisit every new character's `bestEchoes` field (currently populated from nanoka/Game8's build recommendations, should be consistent with actual echo names once entered).
- **3.4's echo set** (tied to Somnoire: Night City) was never inventoried — this step currently only covers 3.5/3.6's set. Needs a follow-up research pass before it's complete.

---

## 5. Region / Map *(not in your list, but blocking — added)*

**Main work:** Two entire regions are unrepresented: **Somnoire: Night City** (3.4) and **Land of Xuanfang / Mengzhou** (3.5, ongoing into 3.6). Add zone data to `mapZones.js` (currently an **empty array** — `export const MAP_ZONES = []`), plus draft entries in `mapDefaults.js`/`mapOverlays.js`/`mapIconCatalog.js` for points of interest, collectibles, bosses.

**Connected work:**
- This is entirely independent data-wise from Characters/Weapons/Echoes, so it can be built in parallel by someone else, but it's high-effort (POI-level detail for two full regions) and probably the single largest piece of work in this whole plan if the map feature is meant to be kept current. Worth explicitly deciding whether this is in scope for this refresh or deferred.

---

## 6. Meta / Tier List *(not in your list — flagged as genuinely new, not a refresh)*

**Main work:** There is currently **no tier-list or meta-ranking data structure anywhere in the codebase** — I checked. If "Meta" means adding one (character tier list, weapon tier list, echo tier list, team tier list, sourced from Game8/Prydwen/Tethys consensus), this isn't a refresh of stale data, it's a new feature and dataset.

**Connected work:**
- Would need a new data file (e.g. `data/tierList.js`) and likely a new UI surface, since no `TierList`/`MetaTab` component currently exists.
- If instead "Meta" means embedding tier info into existing character cards (e.g. an extra field on `CHARACTER_DATA`), that's much smaller — worth clarifying which you mean before scoping this step further.

---

## 7. Team

**Main work:** `CHARACTER_DATA[name].teams` recommendations are already populated for the 7 characters with kit data (from nanoka's Forte/Resonance Chain context + Game8's pre-release team suggestions for Qingxiao). Verify/extend these against Tethys.gg's dedicated team-building tool once Prydwen/Tethys access is confirmed stable.

**Connected work:**
- `STANDARD_5STAR_CHARACTERS` set in `characters.js` — only relevant if any new character enters the standard/permanent banner pool (none do yet, but worth checking each version's patch notes for standard-pool additions going forward).
- Team Builder feature (`features/teams/`) pulls from `CHARACTER_DATA` directly — no separate team-roster data structure exists beyond the `teams` array per character, so this step is really just "keep populating that field accurately," not a separate system.
- **Depends on Characters + Weapons + Echoes** all being reasonably complete, since a team recommendation referencing a weapon/echo set that doesn't exist in the app yet will silently fail to resolve in the UI.

---

## 8. History

**Main work:** Extend `BANNER_HISTORY` with real (non-placeholder) entries for all 3.4 and 3.5 banner phases (currently only Denia/Hiyuki exist, marked "approximate"). Extend `PIONEER_PODCAST_HISTORY`, `TACTICAL_HOLOGRAM_HISTORY`, `DOUBLED_PAWNS_MATRIX_HISTORY` through 3.4/3.5 — check whether new arenas shipped with either new region (historically each new region has added one).

**Connected work:**
- Any "banner archive" or "pull history" UI reads `BANNER_HISTORY` directly — this is what makes the Analytics/Collection tabs' historical views accurate.
- **Depends on Version step** (needs the date ranges) and **Characters/Weapons steps** (each history entry references character/weapon names that need to already exist, or at minimum be spelled consistently for when they're added).

---

## 9. Event

**Main work:** Extend `EVENTS` in `banners.js` with 3.4/3.5/3.6 event periods (currently the `PIONEER_PODCAST_HISTORY` etc. tables are separate from a general `EVENTS` object — confirm what `EVENTS` currently tracks vs. the specialized history tables, since there may be overlap to reconcile rather than pure addition).

**Connected work:**
- Same date-range dependency as History — needs Version step's confirmed dates first.
- Somnoire: Night City and Land of Xuanfang likely each had their own limited-time story/exploration events beyond the recurring ones (Pioneer Podcast, Tactical Hologram) — not yet inventoried, needs a dedicated research pass.

---

## 10. Material

**Main work:** Fill in `MATERIAL_IMAGES`, `COMMON_MAT_TIERS`, `FORGERY_MAT_TIERS` in `constants.js` for every new material introduced by the 7 characters' ascension/skill requirements — currently blocked because **exact material names aren't confirmed** for most of the new characters (flagged explicitly as "Unconfirmed" in the Qingxiao/Jingran entries added this session, and not yet researched at all for Rebecca/Lucilla/Lucy/Rover: Electro/Yangyang: Xuanling/Suisui).

**Connected work:**
- `RESONATOR_ASCENSION_COSTS` / `RESONATOR_EXP_COSTS` / `SKILL_UPGRADE_COSTS` are level-based, not per-character, so likely don't need changes — but worth a quick check that they don't hardcode a max character count anywhere.
- `WEAPON_ASCENSION_COSTS_5` / `WEAPON_ASCENSION_COSTS_4` similarly level-based.
- The **Material Farming Planner** feature (mentioned in `IDENTITY.md` as a recent addition) is the main consumer of this data — it will show broken/missing icons and can't calculate farming routes for any new character until this step lands.
- **This is the natural last step** — it depends on Characters (to know what materials are needed) and ideally on the region/map work (farming routes reference world locations).

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
10. Meta              (new feature — scope separately, not a "refresh")
```

Character portraits/art assets are the practical bottleneck across almost every step — worth confirming those exist or can be sourced before committing to a start date on step 2.
