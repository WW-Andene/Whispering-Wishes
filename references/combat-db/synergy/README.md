# Combat DB — Team Synergy Layer

Team-building layer on top of the per-character files in `references/combat-db/characters/`. Where the
character files document one resonator at a time, this directory documents how resonators combine into
teams: buff/debuff taxonomy, Outro→Intro chaining, the general swap/energy mechanics that make rotations
work, and named team archetypes. Like the character layer, this is **reference-only** — not wired into
`app/src/data/*.js` or `calcEngine.js`, and does not touch `MapTab.jsx` per project rules.

## Files

- **`buff-debuff-taxonomy.json`** — every buff/debuff type observed across the 60 characters' kits,
  grouped into `damageTypeBuffs` (elemental DMG, Skill/Basic/Heavy/Liberation DMG, All DMG, Crit
  Rate/DMG), `debuffs` (RES Shred, DEF Shred, DMG Amplification/vulnerability, Negative Status
  application), and `utility` (healing, shielding, Energy Regen, Concerto/Resonance Energy generation).
  Each entry cites the providing character's slug and the JSON section the effect was found in.
  Built by keyword-scanning all 60 `characters/<slug>.json` files (kit skills, rotation, communityNotes,
  team notes) — a categorization pass over already-scraped Prydwen text, not a re-scrape.
- **`intro-outro-chains.json`** — per-character (all 60) Intro Skill / Outro Skill graph: what a
  character's Outro grants the incoming teammate, what their Intro does on entry, and (where the
  source stated it) the affected damage type and approximate duration. Also carries each character's
  own `teams` section as candidate Outro→Intro synergy partners. The three unreleased-on-Prydwen
  characters (Hsin, Jingran, Suoming — see `SOURCES_STATUS.md`) are flagged `dataStatus: "stub"` rather
  than given fabricated intro/outro text.
- **`resonance-chain-mechanics.md`** — general (not per-character) explanation of how WuWa team combat
  actually runs: the swap loop, Intro/Outro Skill mechanics, Concerto Energy (what unlocks an Outro),
  Resonance Energy/Liberation and the app's own `ER_THRESHOLD_*` breakpoints, Forte gauges,
  Coordinated Attacks, Negative Status DOTs (Frazzle/Erosion/Chafe/Bane) and Tune Break/Rupture, and
  Resonance Chains (Sequence Nodes, the dupe/constellation system — distinct from swap mechanics).
- **`team-archetypes.json`** — named team archetypes as Prydwen's own Team Tier List actually labels
  them (e.g. `Jinhsi Hypercarry`, `Aemeath Mono Fusion`, `Phrolova Echo`, `Calcharo Dual DPS`), with
  core damage type, a shape explanation (why Hypercarry/Dual DPS/Mono/Rupture/Echo/Fusion Burst teams
  each work mechanically), and example 3-member comps pulled from the lead character's own `teams`
  section.

## How this cross-references the character layer

Every file here keys off the same `slug` used in `characters/<slug>.json` — `intro-outro-chains.json`
and `team-archetypes.json` both cite `characters/<slug>.json` directly as their source for kit text and
example comps, and `buff-debuff-taxonomy.json`'s `providers` rows cite `slug` + the JSON section the
match came from so a claim here can always be traced back to the fuller character entry.

## Methodology

Same standard as the character layer (see `../SOURCES_STATUS.md`): cite sources for every claim, and
say so explicitly rather than inventing a number when a source page didn't give one.

- `intro-outro-chains.json` and most of `buff-debuff-taxonomy.json` and `team-archetypes.json`'s example
  comps are built by parsing/scanning the 60 already-scraped `characters/<slug>.json` files — these
  carry the same Prydwen-page provenance as those files (see each character file's own `sources` field).
- `team-archetypes.json`'s archetype labels and Tower-of-Adversity tier placements are freshly sourced
  from Prydwen's Team Tier List page (`https://www.prydwen.gg/wuthering-waves/team-tier-list`, patch
  3.4, fetched 2026-08-31 with the same `jsRender`/Cloudflare-bypass technique as `SOURCES_STATUS.md`
  documents) — that page's JS-rendered text extraction gave archetype names and tier placement but not
  member-composition text (the team rows render as character-icon images, not text, in this fetch mode),
  which is why example comps for each archetype are instead pulled from the matching lead character's
  own `teams` section rather than from the tier-list page itself.
- `resonance-chain-mechanics.md` is the one file that isn't a re-shaping of already-scraped character
  data — it draws on `wutheringwaves.fandom.com/wiki/Resonance_Chain` (reachable but thin — confirms only
  the Chain-unlock method), an attempted-but-unusable fetch of
  `wutheringwaves.fandom.com/wiki/Combat` (flagged honestly in the file rather than silently
  substituted), `app/src/features/teams/calcEngine.js`'s own constants/comments (Frazzle/Erosion/Tune
  Break/ER-breakpoint modeling, read for terminology alignment, not modified), and general established
  WuWa combat-system knowledge cross-checked against the rotation prose already present in the 60
  character files.

## What's still open

- **Numeric buff values are inconsistent.** Where a character's Prydwen page or `CHAR_BUFF_TABLE` (in
  `app/src/data/characters.js`) gave an exact %/duration, it's captured; where the source page only
  described an effect in prose without a number, `intro-outro-chains.json`'s `damageTypeAffected`/
  `durationApprox` fields are `null` rather than guessed. A follow-up pass cross-referencing every
  character's `kit.skills.outro` text against `CHAR_BUFF_TABLE`'s `outroBuffs` (which has real numbers
  for a large subset of the roster, added during app development, not this combat-db effort) would tighten
  this considerably — `CHAR_BUFF_TABLE` was read for terminology in this pass but not systematically
  merged in.
- **`buff-debuff-taxonomy.json` is a keyword scan, not a hand-verified catalog.** Some `quote` snippets
  are truncated mid-sentence or catch a tangential mention (e.g. "Heal" matching a Prydwen review aside
  rather than a real kit heal) — treat each row as a pointer into the source character file to verify,
  not a guaranteed-precise fact in isolation.
- **`team-archetypes.json` only covers the 30 archetype rows that appeared on the Tower of Adversity
  Team Tier List in this fetch** (patch 3.4, 2026-08-31). The same page has a separate Whimpering Wastes
  tier-list view (switchable in-page) that was not fetched in this pass — a follow-up could add a
  second `wwTier` field per archetype the same way character files carry both `tierList.prydwen`
  ToA/WW numbers.
- **Nanoka.cc, Encore.moe, wuwatracker.com, and Reddit** remain unattempted for this synergy layer too,
  same gap already logged in `SOURCES_STATUS.md` for the character layer.
- **Resonance Chain per-node numeric effects** are not cataloged systematically here beyond the couple of
  examples already present in individual character files' `selfBuffs`/`debuffs` `condition` text (e.g.
  Qingxiao S3, Jingran S4) — a dedicated `resonance-chain-effects.json` per character×node would be a
  reasonable next file if the app ever wants to model chain investment, but was out of scope for this
  pass (`resonance-chain-mechanics.md` covers the *system*, not a per-character node table).
