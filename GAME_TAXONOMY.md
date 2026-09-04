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
│       ├── Stats
│       ├── Kit
│       │   ├── Basic ATK
│       │   ├── Heavy ATK
│       │   ├── Skill
│       │   ├── Liberation
│       │   ├── Forte
│       │   ├── Intro
│       │   ├── Outro
│       │   ├── Coordinated ATK
│       │   └── Echo Skill
│       ├── Resonance Chain
│       │   ├── S1
│       │   ├── S2
│       │   ├── S3
│       │   ├── S4
│       │   ├── S5
│       │   └── S6
│       └── Build
│           ├── Weapon    → (ref: Weapon catalog)
│           ├── Echoes    → (ref: Echo catalog)
│           └── Team
│
├── Weapon
│   └── <Name>
│       └── Stats
│
├── Echo
│   └── <Name>
│       └── Stats
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

Open question (not yet resolved): whether Buff/Debuff should be siblings of Damage,
or a subset of it.

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
├── Schema
└── Shared
```

Already partially built in code as of this pass — see `app/src/engine/`
(`orchestration/`, `composition/`, `triggers/`, `dot/`, `shared/`, `schema/`,
`projection/`). Real folder contents, not yet reconciled with this diagram's
5-item list (`dot/` and `projection/` exist in code but aren't listed above yet).

---

## Known naming problems this taxonomy is meant to fix

- `characterBlocks/roverElectro.blocks.js` — camelCase, inconsistent with its three
  siblings (`roveraero`, `roverhavoc`, `roverspectro`, all lowercase).
- `characterBlocks/xianglyao.blocks.js` — missing a letter; "Xiangli Yao" should
  slugify to `xiangliyao`.
- No single canonical `characterId` exists today — three different identity
  strings float around per character (Display Name, file slug, `SOURCE` const
  inside the file) and nothing enforces they agree.
