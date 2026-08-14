# Whispering Wishes — Content Refresh Audit Report

**Date of audit:** 2026-08-14
**Current app data version:** 3.3 (partial — only banner stubs for Denia/Hiyuki)
**Current live game version:** 3.6.0
**Gap:** 3 full versions unaccounted for (3.4, 3.5, 3.6)

Sources checked: `tethys.gg` (resonator roster), `encore.moe` (character wiki, version diff tool, news/changelog). `prydwen.gg` and `game8.co` were blocked by bot-protection (Cloudflare / CloudFront 403) during this pass — not yet checked.

---

## 1. Evidence of the gap

- `app/src/data/banners.js` → `BANNER_HISTORY` ends at version 3.3, with the 3.3 entries themselves marked `// upcoming — dates approximate` and only guessed dates (through ~June 10, 2026).
- `app/src/data/banners.js` → `VERSION_DATES`, `PIONEER_PODCAST_HISTORY`, `TACTICAL_HOLOGRAM_HISTORY`, `DOUBLED_PAWNS_MATRIX_HISTORY` all stop at 3.2/3.3.
- `app/src/data/characters.js` → `CHARACTER_DATA` has 45 entries, last additions Aemeath/Sigrika (3.1/3.2 era). No entries for anyone from 3.3 onward.
- `app/src/data/weapons.js` and `app/src/data/echoes.js` → zero entries referencing any post-3.3 character, weapon, or enemy.
- `encore.moe/diff` version-comparison tool lists game versions up through **3.6.0** as selectable, confirming that's the current live version.
- `encore.moe/news`: "Updated encore.moe to 3.5.0" — Jul 8, 2026. `encore.moe/new` (their "latest content" page) shows 3.6-era content already live (new region, new characters), meaning 3.6 has already shipped past that.

---

## 2. Missing characters

### Have banner stubs only, no character data at all (skills/ascension/tier/echoes/weapon/teams)
| Character | Notes |
|---|---|
| Denia | Banner entry in `BANNER_HISTORY` (v3.3-p2) with only an id/name/element placeholder (`element: ''`). Missing from `CHARACTER_DATA` entirely. |
| Hiyuki | Banner entry in `BANNER_HISTORY` (v3.3-p1) with only an id/name/element placeholder (`element: ''`). Missing from `CHARACTER_DATA` entirely. |

### Fully missing — no banner entry, no character data, nothing
| Character | Likely version | Notes |
|---|---|---|
| Rebecca | ~3.4 | Confirmed via `encore.moe/character` roster and Tethys roster. |
| Lucilla | ~3.4/3.5 | Confirmed via both sources. |
| Lucy | ~3.5 | Confirmed via both sources. |
| Rover: Electro | 3.6 | **New Rover attunement.** App's `Rover` entry only lists `elements: ['Spectro', 'Havoc', 'Aero']` — Electro attunement is not represented at all. This affects the Rover data model, not just a new roster entry. |
| Yangyang: Xuanling | 3.6 | New alternate/awakened version of Yangyang tied to the new region's story (Land of Xuanfang). Distinct kit from base Yangyang — needs its own entry, not a reskin. |
| Suisui | 3.6 | Brand new character, part of the 3.6 "Land of Xuanfang" release. Detailed kit terms already published (Zephyr/Drizzle Stance, Cloud Breath, Floral Epistle, Plume Step, etc. — see `encore.moe/new`). |

**Total: 7 characters (2 stub-only + 5 fully missing) need full data cards** — description, skills, ascension materials, skill materials, best echoes, best weapon, recommended teams, tier placement.

---

## 3. Missing weapons

Confirmed new weapons from the 3.6 "new content" listing:
- **Azure Oath**
- **Firstlight's Herald**

(3.4/3.5 signature weapons for Rebecca/Lucilla/Lucy were not yet individually confirmed by name in this pass — needs a follow-up check, likely on Tethys or Prydwen once accessible.)

---

## 4. Missing echoes / enemies

New echo-able enemies from the 3.6 region, per `encore.moe/new`:
- Smiter
- Porcelain Picket / Stone Picket / Aureate Picket
- Kernel Puppet: Joy / Anger / Worry / Reflection / Grief / Fright (6-echo set — likely a themed sonata set)
- Fog Lionarch (+ Body/Head variants)
- Smolder
- Forbidden Bastion (+ Phantom variant)
- Myriad Snare: Rustfire Chassis
- Thousand-Puppet Pavilion
- Phantom: Smiter

None of these exist in `app/src/data/echoes.js`. Given the "Kernel Puppet" 6-piece emotion-themed set, this is very likely a new Sonata Set that also needs registering in `ECHO_SETS`.

---

## 5. Missing region / world content

- **New region: Land of Xuanfang (Mengzhou)** — Chapter IV of the main story ("The Wind Before the Storm," "Xuanling Sings, Storm Quelled," "The Chant of Unseen Ties," "A Promise," "Win or Lose," "Legacy," etc.). The app has no map data, zones, or overlays for this region (`mapZones.js`, `mapOverlays.js`, `mapDefaults.js` would all need extending — not yet audited in detail).
- New world organizations/lore terms introduced: Xuanfang Wardens, Xuan Triad, Skyworks, Censure Court/Cage, Ministry of Foreign Affairs, Rafter Kite, Yuan Fortress — relevant only if the app tracks lore/terms; otherwise skip.
- New namecards: Paths and Possibilities, Mountains and Waters Ring the Hold, Past the Endstate: Adversity Vanguard, Space and Blake Bloom Medal, Xuanfang Wonder, Starlit Encore.

---

## 6. Missing version metadata

`banners.js` needs new entries for:
- `VERSION_DATES`: 3.4, 3.5, 3.6 start/end dates
- `PIONEER_PODCAST_HISTORY`: 3.4, 3.5, 3.6 entries
- `TACTICAL_HOLOGRAM_HISTORY`: check if a new arena shipped with the new region (likely, given precedent of new arenas per new region)
- `BANNER_HISTORY`: real (not approximate) banner phases for 3.3 p1/p2 onward, plus all of 3.4, 3.5, 3.6 — currently only Denia/Hiyuki exist as rough guesses
- `CURRENT_BANNERS`: needs to be replaced entirely — it's still showing the 3.2 Lynae/Zani/Phoebe rerun banner as "current," which ended in-game back in April 2026

---

## 7. Not yet checked (blocked or out of scope this pass)

- **prydwen.gg** — Cloudflare bot-check blocked the fetch. Would normally provide tier list placement and build recommendations; worth retrying with a different fetch strategy or manual visit.
- **game8.co** — CloudFront 403 blocked the fetch. Same purpose as Prydwen — tier lists, patch notes, build guides.
- Exact release dates/version numbers for Rebecca, Lucilla, Lucy individually (only roster order was confirmed, not their precise version/date).
- Detailed skill kits, ascension materials, and recommended teams for all 7 missing characters — only Suisui's kit terms were pulled in this pass; the rest need individual character-page visits.
- Map/zone data for Land of Xuanfang (`mapZones.js`, `mapOverlays.js`, `mapDefaults.js`, `mapIconCatalog.js`) — not cross-checked against the new region yet.
- Standard banner / permanent pool changes, if any, since 3.3.

---

## 8. Suggested priority order

1. **`CURRENT_BANNERS`** in `banners.js` — currently displaying a banner that ended 4 months ago as "live." Highest-visibility bug, cheapest fix once 3.6's actual current banner is confirmed.
2. **Version metadata** (`VERSION_DATES`, `BANNER_HISTORY`, event histories) for 3.4–3.6 — unlocks correct history views and countdown timers app-wide.
3. **7 missing characters** — full `CHARACTER_DATA` entries, starting with whichever are actually meta-relevant (Suisui/Rover: Electro/Yangyang: Xuanling as newest are likely highest-demand).
4. **Weapons + echoes** tied to those characters (Azure Oath, Firstlight's Herald, Kernel Puppet set, etc.).
5. **New region map data**, if the app's map feature is meant to be current.
6. Retry Prydwen/Game8 for tier-list and build data to enrich the character entries beyond bare kit descriptions.
