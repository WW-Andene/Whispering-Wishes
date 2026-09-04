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
│   └── <Name>                    (e.g. Aalto, Jinhsi, Rover: Electro — 58 total, Jingran unreleased/no blocks yet)
│       ├── Rarity
│       ├── Element
│       ├── Stats
│       │   ├── Base          (HP / ATK / DEF at Lv.90 — the character's own innate values)
│       │   └── Growth Curve  (per-level scaling, if modeled distinctly from Base)
│       ├── Kit               (corrected: Echo Skill and Coordinated ATK removed — those are
│       │                      DAMAGE CATEGORIES a kit move can be tagged with for buff-matching,
│       │                      not real move slots the character has. A character's Kit is only
│       │                      the moves below.)
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
│       ├── Rotation          (the realistic-optimal play order derived from Kit + Resonance
│       │                      Chain — NOT a Build sub-item, since it depends on Kit/Chain
│       │                      directly and doesn't reference the Weapon/Echo/Team catalogs
│       │                      the way Build's children do)
│       └── Build
│           ├── Weapon        → (ref: Weapon catalog)
│           │   └── Signature  (the one Weapon entry designed for this specific Character —
│           │                   a flag/ref on a Weapon.<Name> node, not a separate catalog)
│           ├── Echoes        → (ref: Echo catalog)
│           └── Team
│               ├── Members    → (refs: 2 other Characters, 3-member team)
│               └── Rotation   (the TEAM-level play order — distinct from a single Character's
│                                own solo Rotation above; who's on-field when, swap timing)
│
├── Weapon
│   └── <Name>
│       ├── Rarity
│       ├── Type            (Sword / Broadblade / Pistols / Gauntlets / Rectifier)
│       ├── Signature Of    → (ref: Character, or null — most weapons aren't anyone's signature)
│       ├── Stats
│       │   ├── Main        (baseAtk)
│       │   └── Sub         (fixed passive-scaling substat, e.g. Crit Rate/Crit DMG/Energy Regen)
│       └── Buff             (passive effect)
│
├── Echo
│   └── <Name>
│       ├── Sonata           (set — `sets` in echoes.js, an echo can belong to 2)
│       ├── Cost              (1 / 3 / 4)
│       ├── Stats
│       │   ├── Main         (fixed per cost tier)
│       │   └── Substats      (5 random rolls — NOT a 3-tier Main/Secondary/Sub split, that's not
│       │                      how the game actually works; corrected from an earlier draft of this doc)
│       └── Echo Skill        (4-cost echoes only — the active skill/buff)
│
├── Enemy
│   └── <Name>
│       ├── Rank              (Common / Elite / Calamity / Overlord — the real field name is `rank`,
│       │                      not "Danger level"; corrected from an earlier draft of this doc)
│       ├── Type
│       └── Stats             (level-scaled HP/ATK/DEF curve, per enemyLevelStats.json;
│                               + stagger data, per enemyStaggerStats.json)
│
├── Element
│   └── Glacio / Fusion / Electro / Aero / Spectro / Havoc / Physical
│
├── Damage
│   └── Basic / Heavy / Skill / Liberation / Echo / Coordinated / Intro / Outro
│       (+ per-Element variants, e.g. Glacio Damage, Fusion Damage, ...)
│
├── Buff
│   └── ATK (flat/%) / DEF (flat/%) / HP (flat/%) / Crit Rate / Crit DMG /
│       Energy Regen / Heal Bonus / (Element) DMG Bonus / (move-type) DMG Bonus
│
└── Debuff
    └── DEF Ignore / DEF Shred / RES Shred / Deepen
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
├── Orchestration    (rotationOrderSearch.js — team-level rotation-order search)
├── Composition      (resolveHitComposedDps.js, resolveHitComposedTeamDps.js,
│                     resolveSimulatedRotation.js, resolveSimulatedTeamRotation.js,
│                     rotationSimulator.js — turns a rotation + kit into a DPS number)
├── Triggers         (triggerEngine.js, blockWindows.js, coordinatedAtk.js,
│                     energyCycleGating.js, sequenceGating.js, tieredStacking.js —
│                     WHEN a block fires)
├── DoT              (dotFormulas.js, dotReactions.js, dotReactionsFromBlocks.js —
│                     Tune Break/Hack Response aggregate-rate damage, still the one
│                     genuinely unported mechanic per ENGINE_MERGE_INVESTIGATION.md)
├── Schema           (buffSource.js, knownCategories.js, triggerBlocks.schema.js,
│                     validateBlock.js — the registries/validators this whole
│                     taxonomy is meant to feed)
├── Shared           (buffAccumulation.js, combatMath.js, roleHelpers.js,
│                     skillMultiplierParser.js — pure functions with no character data)
└── Projection       (registry.js, statPanelProjection.js — turns composed engine
                      output into a specific UI's shape, e.g. the stat panel)
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
