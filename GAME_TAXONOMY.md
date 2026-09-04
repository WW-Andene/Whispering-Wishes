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
│   └── Sonata
│       └── Cost
│           ├── 1
│           │   └── <Name>
│           │       ├── Stats
│           │       │   ├── Main
│           │       │   │   ├── ATK %
│           │       │   │   ├── HP %
│           │       │   │   └── DEF %
│           │       │   └── Sub
│           │       │       └── HP (flat)
│           │       ├── Skill Label
│           │       ├── Skill Description
│           │       └── Echo Skill
│           │           ├── Damage
│           │           └── Buff
│           ├── 3
│           │   └── <Name>
│           │       ├── Stats
│           │       │   ├── Main
│           │       │   └── Substats
│           │       ├── Skill Label
│           │       ├── Skill Description
│           │       └── Echo Skill
│           │           ├── Damage
│           │           └── Buff
│           └── 4
│               └── <Name>
│                   ├── Stats
│                   │   ├── Main
│                   │   └── Substats
│                   ├── Skill Label
│                   ├── Skill Description
│                   └── Echo Skill
│                       ├── Damage
│                       └── Buff
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
│           │   └── (ref: Element list — Glacio/Fusion/Electro/Aero/Spectro/Havoc/Physical)
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
│   │   └── (ref: Element list — Glacio/Fusion/Electro/Aero/Spectro/Havoc/Physical)
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
│   ├── Trigger
│   ├── Condition
│   ├── Timing
│   ├── Target
│   ├── Effects
│   ├── Damage
│   └── Note
├── Orchestration
├── Composition
├── Triggers
├── DoT
├── Schema
├── Shared
└── Projection
```

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
