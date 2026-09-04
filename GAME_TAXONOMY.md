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
│       │   ├── HP
│       │   ├── ATK
│       │   ├── DEF
│       │   ├── Max Energy
│       │   ├── Crit Rate
│       │   └── Crit DMG
│       ├── Kit → (each move: ref Block)
│       │   ├── Basic ATK
│       │   │   ├── Basic ATK
│       │   │   ├── Heavy ATK
│       │   │   ├── Mid-air ATK
│       │   │   └── Dodge Counter ATK
│       │   ├── Skill
│       │   ├── Liberation
│       │   ├── Forte
│       │   ├── Intro
│       │   └── Outro
│       ├── Resonance Chain → (each node: ref Block)
│       │   ├── S1
│       │   ├── S2
│       │   ├── S3
│       │   ├── S4
│       │   ├── S5
│       │   └── S6
│       ├── Rotation
│       └── Build
│           ├── Weapon
│           ├── Echoes
│           └── Team
│               ├── Members
│               │   └── Role
│               │       ├── Main DPS
│               │       ├── Sub DPS
│               │       ├── Support
│               │       └── Healer
│               └── Rotation
│
├── Weapon
│   └── <Name>
│       ├── Rarity
│       ├── Type
│       ├── Stats
│       │   ├── Main
│       │   └── Sub
│       ├── Passive
│       │   ├── Description
│       │   ├── Effect Text
│       │   └── Values
│       ├── Best For
│       └── Ascension Materials
│           ├── Forgery
│           └── Common
│
├── Echo
│   └── Cost
│       ├── 1
│       │   └── <Name>
│       │       ├── Sonata
│       │       ├── Stats
│       │       │   ├── Main
│       │       │   │   ├── ATK %
│       │       │   │   ├── HP %
│       │       │   │   └── DEF %
│       │       │   └── Secondary
│       │       │       └── HP (flat)
│       │       ├── Skill Label
│       │       ├── Skill Description
│       │       └── Echo Skill
│       │           ├── Damage
│       │           └── Buff
│       ├── 3
│       │   └── <Name>
│       │       ├── Sonata
│       │       ├── Stats
│       │       │   ├── Main
│       │       │   │   ├── ATK %
│       │       │   │   ├── HP %
│       │       │   │   ├── DEF %
│       │       │   │   ├── Energy Regen
│       │       │   │   ├── Glacio DMG %
│       │       │   │   ├── Fusion DMG %
│       │       │   │   ├── Electro DMG %
│       │       │   │   ├── Aero DMG %
│       │       │   │   ├── Spectro DMG %
│       │       │   │   ├── Havoc DMG %
│       │       │   │   └── Physical DMG %
│       │       │   ├── Secondary
│       │       │   │   └── ATK (flat)
│       │       │   └── Substats
│       │       ├── Skill Label
│       │       ├── Skill Description
│       │       └── Echo Skill
│       │           ├── Damage
│       │           └── Buff
│       └── 4
│           └── <Name>
│               ├── Sonata
│               ├── Stats
│               │   ├── Main
│               │   │   ├── Crit Rate %
│               │   │   ├── Crit DMG %
│               │   │   ├── ATK %
│               │   │   ├── HP %
│               │   │   ├── DEF %
│               │   │   └── Healing Bonus %
│               │   ├── Secondary
│               │   │   └── ATK (flat)
│               │   └── Substats
│               ├── Skill Label
│               ├── Skill Description
│               └── Echo Skill
│                   ├── Damage
│                   └── Buff
│
├── Enemy
│   └── <Name>
│       ├── Rank
│       │   ├── Common
│       │   ├── Elite
│       │   ├── Calamity
│       │   └── Overlord
│       └── Stats
│           ├── HP
│           ├── ATK
│           ├── DEF
│           ├── RES
│           │   ├── Glacio RES
│           │   ├── Fusion RES
│           │   ├── Electro RES
│           │   ├── Aero RES
│           │   ├── Spectro RES
│           │   ├── Havoc RES
│           │   └── Physical RES
│           └── Stagger
│               ├── Interruption RES
│               ├── Interruption RES Recovery
│               ├── Vibration
│               ├── Vibration Recovery
│               ├── Rage
│               └── Rage Recovery
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
│   ├── Base Stat
│   │   ├── HP %
│   │   ├── ATK %
│   │   ├── DEF %
│   │   ├── Crit Rate
│   │   └── Crit DMG
│   ├── DMG Bonus — Universal
│   │   └── All DMG
│   ├── DMG Bonus — Move Type
│   │   ├── Basic ATK DMG
│   │   ├── Heavy ATK DMG
│   │   ├── Skill DMG
│   │   ├── Liberation DMG
│   │   ├── Echo Skill DMG
│   │   └── Coordinated ATK DMG
│   ├── DMG Bonus — Element
│   │   ├── Glacio DMG
│   │   ├── Fusion DMG
│   │   ├── Electro DMG
│   │   ├── Aero DMG
│   │   ├── Spectro DMG
│   │   ├── Havoc DMG
│   │   └── Physical DMG
│   └── Multiplier
│       └── Total Mult
│
└── Debuff
    ├── DEF Ignore
    ├── DEF Shred
    ├── Deepen
    ├── Glacio RES Shred
    ├── Fusion RES Shred
    ├── Electro RES Shred
    ├── Aero RES Shred
    ├── Spectro RES Shred
    ├── Havoc RES Shred
    ├── Physical RES Shred
    └── Negative Status
        ├── Erosion
        ├── Flare
        ├── Frazzle
        └── Fusion Burst
```

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
├── Block
│   ├── Kind
│   │   ├── Damage
│   │   ├── Buff
│   │   ├── Debuff
│   │   ├── Heal
│   │   └── Utility
│   ├── Trigger
│   │   ├── Cast
│   │   ├── Swap-in
│   │   ├── Swap-out
│   │   ├── Passive
│   │   ├── On-hit
│   │   ├── Resource-threshold
│   │   ├── Negative-status-hit
│   │   ├── Field-time
│   │   ├── Partner-outro-return
│   │   ├── Windowed-cast
│   │   ├── Requires-prior-cast
│   │   ├── Windowed-proc
│   │   └── Ally-action
│   ├── Condition
│   ├── Timing
│   ├── Target
│   │   ├── Self
│   │   ├── On-field
│   │   ├── Next-on-field
│   │   ├── Whole-team
│   │   ├── Marked-enemy
│   │   ├── All-enemies
│   │   └── Trigger-actor
│   ├── Effects
│   │   └── Stacking Mode
│   │       ├── Unique
│   │       ├── Stacking
│   │       └── Refresh
│   ├── Damage
│   └── Note
├── Orchestration
│   └── rotationOrderSearch.js
├── Composition
│   ├── resolveHitComposedDps.js
│   ├── resolveHitComposedTeamDps.js
│   ├── resolveSimulatedRotation.js
│   ├── resolveSimulatedTeamRotation.js
│   └── rotationSimulator.js
├── Triggers
│   ├── triggerEngine.js
│   ├── blockWindows.js
│   ├── coordinatedAtk.js
│   ├── energyCycleGating.js
│   ├── sequenceGating.js
│   └── tieredStacking.js
├── DoT
│   ├── dotFormulas.js
│   ├── dotReactions.js
│   └── dotReactionsFromBlocks.js
├── Schema
│   ├── buffSource.js
│   ├── knownCategories.js
│   ├── triggerBlocks.schema.js
│   └── validateBlock.js
├── Shared
│   ├── buffAccumulation.js
│   ├── combatMath.js
│   ├── roleHelpers.js
│   └── skillMultiplierParser.js
└── Projection
    ├── registry.js
    └── statPanelProjection.js
```

Reconciled against the real folder contents of `app/src/engine/` as of this pass
(7 folders, not 5 — `dot/` and `projection/` were missing from an earlier draft).

---

## Known naming problems this taxonomy is meant to fix

- `characterBlocks/roverElectro.blocks.js` — camelCase, inconsistent with its three
  siblings (`roveraero`, `roverhavoc`, `roverspectro`, all lowercase).
- `characterBlocks/xianglyao.blocks.js` — missing a letter; "Xiangli Yao" should
  slugify to `xiangliyao`.
- No single canonical `characterId` exists today — three different identity
  strings float around per character (Display Name, file slug, `SOURCE` const
  inside the file) and nothing enforces they agree.
- `SKILL_MULTIPLIERS` rows use the same move type spelled inconsistently across
  the roster: `'Heavy ATK'` and `'Heavy Attack'` both appear as distinct strings,
  and Mid-air appears as three different strings (`'Mid-air'`, `'Mid-air ATK'`,
  `'Mid-air Attack'`) — confirmed by exhaustive grep of the real
  `SECTION:SKILL_MULTIPLIERS` block (`characters.js:3715-5182`). Kit's canonical
  names (`Heavy ATK`, `Mid-air ATK`) collapse these to one spelling each; the raw
  data itself still needs normalizing to match.
