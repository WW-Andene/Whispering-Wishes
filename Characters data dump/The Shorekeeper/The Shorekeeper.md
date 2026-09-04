# The Shorekeeper — Prydwen.gg source dump (cleaned)

Source: prydwen.gg/wuthering-waves/characters/the-shorekeeper
Last updated (per page): 20/August/2026 · Last review update: Patch 1.4 · Last major build/calcs update: Patch 2.6

5★ Spectro Rectifier, Support (Healer, universal Crit-based buffer).

---

## Kit

### Basic Attack — Origin Calculus

- **Basic Attack**: up to 4 consecutive hits, Spectro DMG. Each hit generates 1 Collapsed Core.
- **Heavy Attack**: hold Normal Attack to enter **Unbound Form** (continuous STA drain) — generates 1 Deductive Data/sec, auto-collects nearby plant collectibles. Ending it (STA depleted or casting Basic Attack) deals Spectro DMG; each Deductive Data segment converts to Empirical Data and generates a Collapsed Core.
- **Mid-air Attack**: consumes STA, plunging attack, generates 1 Collapsed Core. Chains into Basic Stage 2 shortly after.
- **Dodge Counter**: Normal Attack after a successful Dodge, Spectro DMG.

**Multipliers (Lv.10):**
| Move | Value |
|---|---|
| Basic ATK Stage 1 | 31.78% |
| Basic ATK Stage 2 | 23.86%×2 |
| Basic ATK Stage 3 | 23.32%×3 |
| Basic ATK Stage 4 | 72.72% |
| Heavy Attack | 45.81% |
| Plunging Attack | 73.96% |
| Dodge Counter | 87.48%×2 |
| Heavy Attack STA cost | 25 |
| Plunging Attack STA cost | 30 |

### Resonance Skill — Chaos Theory

- Heals all nearby team members, summons 5 **Dim Star Butterflies** (auto-track and attack, Spectro DMG). Chains into Basic Attack Stage 2 shortly after. Castable mid-air.

**Multipliers (Lv.10):**
| Move | Value |
|---|---|
| Dim Star Butterfly | 31.31% |
| Healing | 1313 + 5.97% HP |
| Cooldown | 16s |
| Concerto Regen | 20 |

### Resonance Liberation — End Loop

- Generates the **Outer Stellarealm**: continuously heals all team members within range (once per 3s).
- **Inner Stellarealm** (evolves from Outer when a team member uses their Intro within it): +0.01% team Crit Rate per 0.2% of Shorekeeper's Energy Regen, up to +12.5%. Retains Outer's effects.
- **Supernal Stellarealm** (evolves from Inner on a 2nd Intro within it): +0.01% team Crit DMG per 0.1% of Shorekeeper's Energy Regen, up to +25%. Retains Inner's effects. Shorekeeper's first Intro cast during its duration is replaced with **Intro Skill: Discernment** (once per Supernal Stellarealm generation).

**Multipliers (Lv.10):**
| Move | Value |
|---|---|
| Healing | 438 + 2.39% HP |
| Stellarealm duration | 30s |
| Cooldown | 25s |
| Resonance Energy cost | 175 |
| Concerto Regen | 20 |

### Forte Circuit — Astral Chord

- **Flare Star Butterfly**: a Normal Attack hit generates a Collapsed Core, which becomes a Flare Star Butterfly (auto-track/attack, Spectro DMG) after 6s. Cap 5 Collapsed Cores — the next hit at cap instantly converts one.
- **Illation**: at 5 Empirical Data, casting Heavy Attack consumes them all to pull in nearby targets + Spectro DMG; also instantly converts all Collapsed Cores into Flare Star Butterflies.
- **Transmutation**: at 5 Empirical Data, casting Mid-air Attack consumes them all for Spectro DMG; also instantly converts all Collapsed Cores. Chains into Basic Stage 2 shortly after.
- **Empirical Data** (cap 5): +1 from Basic Stage 1/2/4 hit; +2 from Basic Stage 3 hit; +1 from Mid-air Attack hit; +1 from Dodge Counter hit.

**Multipliers (Lv.10):**
| Move | Value |
|---|---|
| Flare Star Butterfly | 37.29% |
| Illation | 18.97%×5 |
| Transmutation | 73.96% |
| Illation STA cost | 25 |
| Transmutation STA cost | 30 |
| Illation Concerto Regen | 6 |
| Transmutation Concerto Regen | 6 |

### Inherent Skills

- **Life Entwined**: another Resonator taking a fatal blow instead survives, healed for 50% of Shorekeeper's HP, while Shorekeeper loses the same amount (floor 1 HP). Once per 10 min.
- **Self Gravitation**: while the on-field Resonator is within a Stellarealm, Shorekeeper's Energy Regen +10%. If Rover is on the team, Rover also gets +10% Energy Regen.

### Intro Skill — Proof of Existence

- **Enlightenment** (base): heals all nearby team members + summons 5 Dim Star Butterflies (Spectro DMG), **counted as Resonance Skill DMG**.
- **Discernment** (replaces the above once per Supernal Stellarealm generation): ends the current Stellarealm, heals all nearby team members, deals Spectro DMG — guaranteed Crit, **counted as Resonance Liberation DMG**.

**Multipliers (Lv.10):**
| Move | Value |
|---|---|
| Enlightenment | 45.30%×5 |
| Discernment | 19.64%×3 HP |
| Enlightenment Healing | 259 + 1.20% HP |
| Discernment Healing | 289 + 1.32% HP |
| Enlightenment Concerto Regen | 10 |
| Discernment Concerto Regen | 20 |

### Outro Skill — Binary Butterfly

- Summons 1 Flare Star Butterfly + 1 Dim Star Butterfly to circle the on-field Resonator for up to 30s: if that Resonator is hit/launched, tapping Dodge instantly recovers (triggers a successful Dodge; launched-near-ground lands standing), up to 5 times. Grants all nearby team members +15% DMG Amplification.

### Resonance Chain (Sequences)

- **S1**: Stellarealms' healing/buff range +150%, duration +10s. Casting Discernment no longer ends the existing Stellarealm.
- **S2**: Outer Stellarealm additionally grants nearby team members +40% ATK.
- **S3**: casting Liberation grants Shorekeeper 20 Concerto Energy (once per 25s).
- **S4**: +70% Healing Bonus when casting Chaos Theory (Skill).
- **S5**: Basic Attack Stage 3's pull range +50%, Illation's pull range +30%.
- **S6**: Discernment DMG Multiplier +42%. Casting Discernment grants +500% Crit DMG.

### Minor Fortes
HP% +12%, Healing Bonus +12%.

### Base Stats (Lv.90, incl. minor fortes)
HP 16713 · ATK 288 · DEF 1100 · Max Energy 125 · Crit Rate 5% · Crit DMG 150%

---

## Review

**DPS tier**: **T0** (Tower of Adversity, standard) / **T0.5** (Whimpering Wastes, standard) / **T0** (Tower of Adversity, Value) / **T0.5** (Whimpering Wastes, Value) — labeled **Support**.

**Pros**
- Unique, incredible Crit Rate and Crit DMG buffs.
- Tremendous continuous team healing.
- Full-team DMG Amplification that isn't lost on swap.
- Excellent carrier of the Rejuvenating Glow set.
- Surprisingly high damage with the empowered Intro (if built for it).
- Incredibly flexible — usable in many teams.

**Cons**
- Really wants a Concerto-generating weapon, feels notably worse without one.
- Can have a slow start in Tower of Adversity depending on team composition.
- Lacks the Coordinated Attacks mechanic Verina has, lowering her potential vs. characters that synergize with that.

**Key mechanics**
- Liberation (End Loop, 175 Energy) summons the **Stellarealm** for 30s — 3 stacking stages: Outer (baseline: heal every 3s), Inner (after 1 ally Intro within it: up to +12.5% team Crit Rate scaling with her Energy Regen), Supernal (after a 2nd Intro within it: up to +25% team Crit DMG scaling with her Energy Regen). Reaching full Supernal (12.5% Crit Rate + 25% Crit DMG + continuous healing) requires ~250% Energy Regen (150% from Echo/Weapon/Passives) — also a comfortable checkpoint for reliable Liberation access. 25s cooldown, plannable near-permanent uptime.
- Outro grants the whole party +15% DMG Amplification for 30s regardless of swaps, plus up to 5 free interruption recoveries (tap Dodge) for the on-field Resonator.
- Game plan: generate Concerto fast → Liberation → immediately Outro to trigger an ally's Intro (upgrades the Stellarealm right away) → only 1 more Intro needed to fully upgrade it.
- Forte "Astral Chord": two 5-cap resources — Collapsed Cores (from any Basic Attack, become Flare Star Butterflies after 6s, generating Concerto) and Empirical Data (from Basic Attacks, +2 on Stage 3) which at 5 charges enhances her next Heavy Attack (**Illation** — preferred, has Pull) or Mid-air Attack (**Transmutation**) into a Concerto-generating Spectro nuke that also instantly converts all Collapsed Cores.
- Skill (Chaos Theory) grants 20 Concerto instantly + team heal + summons 5 Dim Star Butterflies (≈30 Concerto total once they land) — 16s cooldown, cast whenever available and not already at full Concerto; chains into Basic Stage 2.
- Two Intro skills: base **Enlightenment** always available, empowered **Discernment** available once per Supernal Stellarealm — ends the Stellarealm early (usually a non-issue since she's normally swapped in only to refresh it anyway) but generates double Concerto, deals HP-scaling damage (a surprisingly large nuke), always Crits, and heals slightly more.
- Inherent Skills: standard Cheat Death (Life Entwined); +10% Energy Regen while any Resonator is inside a Stellarealm (counts toward the 250% target, effectively only 240% needed from gear) — also buffs Rover's Energy Regen if present.

**Meta position**: shares Verina's role (fits almost any team) but her buffs are Crit-based rather than ATK%-based, usually giving higher raw damage multiplication than Verina excluding other synergies. Unlike Verina, requires a strict rotation since her buffing is entirely tied to Liberation + Outro. No particular synergy requirement — broadly effective with everyone, making her the most widely usable, generally-effective Support in the game.

---

## Build

### Best Weapons
| Weapon | Score |
|---|---|
| Variation (R5, 4★) | 100.00% |
| Stellar Symphony (R1, signature) | 116.30% (listed above Variation despite being "best weapon... but not by a big difference") |
| Rectifier#25 (R5, 4★, F2P craftable) | 87.20% |
| Call of the Abyss (R5, 4★, free via Rinascita exploration quest) | 85.10% |

**Signature (Stellar Symphony)**: +12% HP; Liberation restores 8 Concerto Energy (once per 20s); casting a healing Resonance Skill grants nearby team members +14% ATK for 30s (same-name effects don't stack). Her best weapon, but not by a big margin over Variation — provides less Concerto than an R5 Variation, noticeably slowing her opener; strong Energy Regen makes hitting 230% easy.
**Variation**: Skill cast restores 16 Concerto Energy (once per 20s) plus massive Energy Regen — significantly speeds and smooths her rotation, one of the best choices, very close to Signature even at R1.
**Rectifier#25**: best gacha-free option — Energy Regen + a small conditional ATK% boost on Skill cast.
**Call of the Abyss**: more healing-focused free option (Liberation grants +16% Healing Bonus for 15s) — same Energy Regen as Rectifier#25, preferable if more team healing is desired, not a necessity.

### Best Echo Sets

**1) Rejuvenating Glow** — 2pc: +10% Healing. 5pc: healing allies grants the whole team +15% ATK for 30s. Triggerable via character abilities and weapon effects, easy 100% uptime, big help to all party members.
Main Echo: **Fallacy of No Return** — +10% Energy Regen on cast (lets a Spectro DMG 3-cost be run on 4★ weapons while still hitting 230% ER, boosting her personal damage); also +10% team ATK for 20s and HP-scaling damage. Generally her best choice.
Main Echo alt: **Bell-Borne Geochelone** — worse for damage nowadays (shorter uptime: +10% DMG Bonus for 15s only) but a good fallback without a good Fallacy roll; also blocks 50% DMG on up to 3 hits for extra survivability if desired.

**Special set: Moonlit Clouds** — 2pc: +10% Energy Regen (unconditional). 5pc: casting Outro grants the next Resonator +22.5% ATK for 15s, amplifying a Main DPS's burst window.
Main Echo: **Impermanence Heron** — trades the wearer's personal damage for team benefit; use and immediately swap-cancel right before Outro. Grants the next character +12% DMG% (stacks with 5pc Moonlit's own +22.5% ATK% under the same trigger) plus a large Energy chunk on use, often saving 1-2 Energy Regen substats otherwise needed.

**Best Echo Stats**: 4-cost Crit DMG > HP% · 3-cost Energy Regen · 3-cost Energy Regen / Spectro DMG · 1-cost HP% ×2.
**Substat priority**: Energy Regen (until 230%) > Crit DMG ≥ Liberation DMG% > HP% > Crit Rate > HP > ATK% = ATK.
Note: ER/Spectro DMG main-stat on the 3-cost slot is the personal-damage end-goal but hard without her Signature — always prioritize hitting the 230% Energy Regen requirement first (250% total with Fallacy of No Return + passive).

### Endgame Stat Targets (Lv.90)
HP 20000-35000+ · DEF 1100+ · Crit Rate 20-40%+ · Crit DMG 220-280%+ · Energy Regen 230% before Echo/Passive (up to 250% total counting her passive + Fallacy of No Return, or 240% with a different Echo) · Spectro DMG Bonus 0-30%.
Note: her personal damage is very low — investing in it is fully skippable; Energy Regen is by far the most important stat.

### Skill Priority
Intro Skill > Resonance Skill > Basic Attack > Forte Circuit > Resonance Liberation.

---

## Gameplay & Teams

### Opener Rotation (no Intro/Concerto available, e.g. Tower of Adversity start)
Basic P1 → Basic P2 → Basic P3 → Basic P4 → Forte: Heavy ATK Illation → Basic P1 → Basic P2 → Basic P3 → Basic P4 → Forte: Heavy ATK Illation → Skill: Chaos Theory → Echo → Liberation → Outro.

### Standard Rotation (Intro/Concerto available)
Intro Skill: Discernment → Basic P1 → Basic P2 → Basic P3 → Basic P4 → Forte: Heavy ATK Illation → Skill: Chaos Theory → Echo → Liberation → Outro.

Both rotations need 6-8 extra Concerto Energy to function smoothly — easily covered by Variation S1 or her Signature; without either, supplement with extra Basic Attacks or a Dodge Counter.

### Synergies

Very flexible — usable as the 3rd-slot buffer for any current team. No particular required synergy; effective with everyone.

### Example Teams
- **Augusta Team**: Augusta + Iuno + Mortefi + The Shorekeeper.
- **Carlotta Team**: Carlotta + Zhezhi + The Shorekeeper.
- **Zani Team**: Zani + Phoebe + The Shorekeeper.
- **Camellya Team**: Camellya + Roccia + Sanhua + The Shorekeeper.

---

## Calculations

### Real Damage-Type Breakdown (Prydwen's own simulated rotation, S0, solo/no buffs)
| Type | DMG | Share |
|---|---|---|
| Basic ATK | 2,335 | (small, part of 12.4% combined label) |
| Heavy ATK | 1,222 | (small) |
| **Skill** | 2,017 | shown as one of the small-slice labels ("1/2") |
| **Liberation** | 36,251 | **75.9%** (largest wedge) |
| Intro | 0 | 0% |
| Outro | 0 | 0% |
| Echo | 5,911 | (small, part of 12.4% combined label) |

Note: matches her kit — Discernment (Intro) is explicitly "counted as Resonance Liberation DMG," so essentially all real burst damage funnels into the Liberation category despite the Intro-slot input; Enlightenment (base Intro) is "counted as Resonance Skill DMG." No full Damage Output/Sequence table was provided on this page (no numeric S0→S6 table present), consistent with the Build tab's own note that her personal damage is fully skippable to invest in.

## App Data Comparison (vs. `app/src/data/characters.js` + `shorekeeper.blocks.js`)

First full 9-dimension Phase A pass for this character — no prior App Data Comparison existed.
SKILL_MULTIPLIERS, CHARACTER_ROTATIONS, CHAR_BUFF_TABLE, RESONANCE_CHAIN_DATA, base stats, `bestEchoes`,
and `dmgFocus` (`['Liberation']`, matching this source's own 75.9% Liberation share) all already matched
this source exactly.

**Real bugs found and fixed (2026-09-04)**:
1. **Flare Star Butterfly damage was completely unmodeled**, dimension 8 — found via a full kit
   walkthrough, not caught in this character's original conversion pass. It's not an alternate unused
   variant: the modeled rotation's 4-stage Basic ATK combo generates exactly 4 Collapsed Cores (kit
   text: "each hit generates 1 Collapsed Core"), and the very next step, Illation, explicitly "instantly
   converts all Collapsed Cores into Flare Star Butterflies" — so 4 real 37.29%-ATK hits fire every
   single rotation, guaranteed, previously contributing zero damage. Added as
   `shorekeeper.forte.flare-star-butterfly`, riding the existing Illation trigger. Category had no
   explicit "considered X DMG" override anywhere in the kit text — flagged and decided by the user:
   skillDmg (Forte Circuit mechanic bucket).
2. **Icon lookup bug**: `SKILL_ICONS['Shorekeeper']['Heavy Attack: Illation']` was too long to ever
   match `getSkillIcon()`'s `skillName.includes(key)` check against the real (short) rotation-step name
   `'Illation'` — the icon was silently never resolving. Shortened the key to `'Illation'`, exact same
   bug class already fixed for Xiangli Yao's `'Revamp'` key.

**Flagged, not changed — needs a human decision**: `weaponAlts.alt5` currently lists `["Firstlight's
Herald", 'Cosmic Ripples']`, but this source's own Best Weapons table lists only 4 total options for
her (Variation 4★, her signature Stellar Symphony, Rectifier#25 4★, Call of the Abyss 4★) — no other 5★
weapon at all. Neither Firstlight's Herald nor Cosmic Ripples appears anywhere in this dump. Left
unchanged since this "cleaned" dump extraction may not be an exhaustive weapon list (unlike the
Resonance Chain/SKILL_MULTIPLIERS tables, which are), so removing real alt5 data on an assumption of
completeness risked being the wrong call — flagged here rather than guessed at.

6 new/updated tests (Flare Star Butterfly ×2, icon lookup), full suite green (1438/1438). rawDps moved
from ~1254 to include the new Butterfly damage (engine/legacy ratio now 1.015, previously exact parity
— the Stage 1 harness doesn't fold this new engine-only damage into the legacy comparison path, a known,
expected divergence for any character whose engine block set now models MORE than the legacy flat table
does).
