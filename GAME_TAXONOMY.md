# Game Taxonomy

The naming source for the engine restructuring. Every block `id` should be derived
mechanically from a path through this tree, not hand-typed — the goal is that a
naming bug like `xianglyao` (missing a letter) or `roverElectro` (wrong casing) or
Rebecca's `ruptureDmgMult` two-path desync becomes structurally impossible instead
of something a written convention hopes people remember.

Two separate trees:

- **Game** — the content/data model: what exists in Wuthering Waves itself
  (characters, weapons, echoes, elements, damage types, buffs, debuffs).
- **Engine** — the computation layers that operate ON that content. Not nested
  under Game; a parallel structure.

Status: draft, under active discussion — not yet built into code.

---

## Game

```
Game
├── Character
│   └── <Name>
│       ├── Rarity
│       ├── Element
│       ├── Stats
│       │   ├── Base
│       │   │   ├── HP
│       │   │   ├── ATK
│       │   │   ├── DEF
│       │   │   ├── Max Energy
│       │   │   ├── Crit Rate
│       │   │   └── Crit DMG
│       │   └── Growth Curve
│       ├── Kit
│       │   ├── Basic ATK
│       │   ├── Heavy ATK
│       │   ├── Skill
│       │   ├── Liberation
│       │   ├── Forte
│       │   ├── Intro
│       │   └── Outro
│       ├── Resonance Chain
│       │   ├── S1
│       │   ├── S2
│       │   ├── S3
│       │   ├── S4
│       │   ├── S5
│       │   └── S6
│       ├── Rotation
│       └── Build
│           ├── Weapon
│           │   └── Signature
│           ├── Echoes
│           └── Team
│               ├── Members
│               └── Rotation
│
├── Weapon
│   └── <Name>
│       ├── Rarity
│       ├── Type
│       ├── Signature Of
│       ├── Stats
│       │   ├── Main
│       │   └── Sub
│       └── Buff
│
├── Echo
│   └── <Name>
│       ├── Sonata
│       ├── Cost
│       ├── Stats
│       │   ├── Main
│       │   └── Substats
│       └── Echo Skill
│
├── Enemy
│   └── <Name>
│       ├── Rank
│       ├── Type
│       └── Stats
│
├── Element
│   ├── Glacio
│   ├── Fusion
│   ├── Electro
│   ├── Aero
│   ├── Spectro
│   ├── Havoc
│   └── Physical
│
├── Damage
│   ├── Basic ATK DMG
│   ├── Heavy ATK DMG
│   ├── Skill DMG
│   ├── Liberation DMG
│   ├── Echo Skill DMG
│   ├── Coordinated ATK DMG
│   ├── Intro Skill DMG
│   ├── Outro Skill DMG
│   ├── Glacio DMG
│   ├── Fusion DMG
│   ├── Electro DMG
│   ├── Aero DMG
│   ├── Spectro DMG
│   ├── Havoc DMG
│   └── Physical DMG
│
├── Buff
│   ├── HP (flat)
│   ├── HP %
│   ├── ATK (flat)
│   ├── ATK %
│   ├── DEF (flat)
│   ├── DEF %
│   ├── Crit Rate %
│   ├── Crit DMG %
│   ├── Energy Regen %
│   ├── Healing Bonus %
│   ├── Basic ATK DMG Bonus
│   ├── Heavy ATK DMG Bonus
│   ├── Skill DMG Bonus
│   ├── Liberation DMG Bonus
│   ├── Echo Skill DMG Bonus
│   ├── Coordinated ATK DMG Bonus
│   ├── Intro Skill DMG Bonus
│   ├── Outro Skill DMG Bonus
│   ├── Glacio DMG Bonus
│   ├── Fusion DMG Bonus
│   ├── Electro DMG Bonus
│   ├── Aero DMG Bonus
│   ├── Spectro DMG Bonus
│   ├── Havoc DMG Bonus
│   └── Physical DMG Bonus
│
└── Debuff
    ├── DEF Ignore
    ├── DEF Shred
    ├── RES Shred
    └── Deepen
```

### Notes on the tree above

- **Character > Name**: e.g. Aalto, Jinhsi, Rover: Electro — 58 total, Jingran unreleased/no blocks yet.
- **Stats > Base**: HP/ATK/DEF/Max Energy at Lv.90 — the character's own innate values (`SECTION:BASE_STATS` in characters.js), real per-character data. Crit Rate (5%) and Crit DMG (150%) are also real base stats every character has, but are currently modeled as universal constants (`BASE_CRIT_RATE`/`BASE_CRIT_DMG` in `engine/shared/combatMath.js`) rather than per-character fields — no character overriding them has been found yet, but that hasn't been exhaustively checked across all 58. **Growth Curve**: per-level scaling, if modeled distinctly from Base.
- **Kit**: Echo Skill and Coordinated ATK were deliberately removed from this list — those are damage categories a kit move can be tagged with for buff-matching, not real move slots a character has.
- **Rotation**: the realistic-optimal play order. NOT something the engine can derive on its own from Kit/Chain data — it's sourced from the character's data dump (`Characters data dump/<Name>/`), which captures real community/theorycrafted play order, not something mechanically computable from multiplier tables alone. Not a Build sub-item — it depends on Kit/Chain directly and doesn't reference the Weapon/Echo/Team catalogs the way Build's children do.
- **Build > Weapon > Signature**: the one Weapon entry designed for this specific Character — a flag/ref on a `Weapon.<Name>` node, not a separate catalog.
- **Build > Team > Members**: refs to 2 other Characters (3-member team). **Team > Rotation**: the team-level play order — who's on-field when, swap timing — distinct from a single Character's own solo Rotation above.
- **Weapon > Type**: Sword / Broadblade / Pistols / Gauntlets / Rectifier. **Signature Of**: ref to Character, or null — most weapons aren't anyone's signature.
- **Weapon > Stats > Sub**: the fixed passive-scaling substat, e.g. Crit Rate/Crit DMG/Energy Regen.
- **Echo > Sonata**: the set (`sets` in echoes.js — an echo can belong to 2). **Cost**: 1 / 3 / 4.
- **Echo > Stats > Substats**: 5 random rolls. Not a 3-tier Main/Secondary/Sub split — that's not how the game actually works; corrected from an earlier draft of this doc.
- **Echo > Echo Skill**: 4-cost echoes only, the active skill/buff.
- **Enemy > Rank**: Common / Elite / Calamity / Overlord — the real field name is `rank`, not "Danger level"; corrected from an earlier draft of this doc.
- **Enemy > Stats**: level-scaled HP/ATK/DEF curve per `enemyLevelStats.json`, plus stagger data per `enemyStaggerStats.json`.
- **Damage / Buff**: every entry is spelled out explicitly, not grouped/shortened — a block's `damage.category` or a buff's `statId` must match one of these exact names/ids, not a loose free-text description. This directly closes the ambiguity found earlier ("elemDmg" alone didn't say which element, "self-kit" alone didn't say whose kit) — one exact name per real thing, no folded-together shorthand.

**Resolved: Buff/Debuff stay siblings of Damage, not a subset.** Damage is a
description of a HIT (what category a move's own output falls into); Buff/Debuff
describe a STAT MODIFIER (something that changes a future hit's numbers). A single
Kit move commonly does both at once — e.g. a Liberation cast that deals `skillDmg`
AND grants a team `atkPct` buff — so nesting one inside the other would force an
artificial parent/child relationship between two things that just co-occur, not
things where one contains the other.

### Character block references, not duplication
A move under `Kit` doesn't hardcode a stat string — it references entries under
`Damage`/`Element`/`Buff`/`Debuff` instead of each character file re-typing loose
strings (`'skillDmg'`, `'critRate'`) with no shared source of truth.

### Buff provenance (from earlier in this design pass)
A buff needs both:
- `target` — WHO receives it: `self`, `team`, `next`
- `source` — WHERE it came from: `self-kit`, `teammate-ally-action`, `echo`, `weapon`

Flagged as still unresolved: `source: 'self-kit'` alone doesn't say *whose* kit —
today that's implicit from which character's file the block lives in. This is
fragile the moment a block needs to reference another character explicitly (e.g.
a teammate-ally-action buff — whose action triggered it?).

---

## Engine (parallel tree, not nested under Game)

```
Engine
├── Orchestration
├── Composition
├── Triggers
├── DoT
├── Schema
├── Shared
└── Projection
```

### Notes on the tree above

- **Orchestration**: `rotationOrderSearch.js` — team-level rotation-order search.
- **Composition**: `resolveHitComposedDps.js`, `resolveHitComposedTeamDps.js`, `resolveSimulatedRotation.js`, `resolveSimulatedTeamRotation.js`, `rotationSimulator.js` — turns a rotation + kit into a DPS number.
- **Triggers**: `triggerEngine.js`, `blockWindows.js`, `coordinatedAtk.js`, `energyCycleGating.js`, `sequenceGating.js`, `tieredStacking.js` — WHEN a block fires.
- **DoT**: `dotFormulas.js`, `dotReactions.js`, `dotReactionsFromBlocks.js` — Tune Break/Hack Response aggregate-rate damage, still the one genuinely unported mechanic per `ENGINE_MERGE_INVESTIGATION.md`.
- **Schema**: `buffSource.js`, `knownCategories.js`, `triggerBlocks.schema.js`, `validateBlock.js` — the registries/validators this whole taxonomy is meant to feed.
- **Shared**: `buffAccumulation.js`, `combatMath.js`, `roleHelpers.js`, `skillMultiplierParser.js` — pure functions with no character data.
- **Projection**: `registry.js`, `statPanelProjection.js` — turns composed engine output into a specific UI's shape, e.g. the stat panel.

Reconciled against the real folder contents of `app/src/engine/` as of this pass
(7 folders, not 5 — `dot/` and `projection/` were missing from the previous draft).

---

## Known naming problems this taxonomy is meant to fix

- `characterBlocks/roverElectro.blocks.js` — camelCase, inconsistent with its three
  siblings (`roveraero`, `roverhavoc`, `roverspectro`, all lowercase).
- `characterBlocks/xianglyao.blocks.js` — missing a letter; "Xiangli Yao" should
  slugify to `xiangliyao`.
- No single canonical `characterId` exists today — three different identity
  strings float around per character (Display Name, file slug, `SOURCE` const
  inside the file) and nothing enforces they agree.
