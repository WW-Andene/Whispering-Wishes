# Cartethyia — Prydwen.gg source dump (cleaned)

5★ Aero, Sword, Main DPS. HP-scaling hybrid Basic-Attack/Liberation dealer who transforms into a second
form, Fleurdelys, via her Resonance Liberation, then chains into a second, harder-hitting Liberation
(Blade of Howling Squall) once Fleurdelys's own Forte gauge (Conviction) is full. Real-life last update:
review Patch 2.4, calcs Patch 3.0, profile 20/August/2026.

## Kit

### Basic Attack — Sword to Carve My Forms
- **Basic Attack - Cartethyia**: up to 4 consecutive hits, Aero DMG. After Stage 4, inflicts 1 stack of
  Aero Erosion and summons Sword of Divinity's Shadow (cap 1, 20s).
- **Heavy Attack - Cartethyia**: consumes STA, Aero DMG, summons Sword of Discord's Shadow (cap 1, 20s).
  Castable mid-air. Counted as Basic Attack DMG.
- **Mid-air Attack - Cartethyia**: Plunging Attack on Normal Attack release while airborne (STA cost),
  Aero DMG, also counted as Aero Erosion DMG. Normal Attack shortly after chains into Basic Stage 2.
  Casting this recalls ALL currently-held Sword Shadows at once — the specific combo of types/count
  recalled determines the Plunging Attack's exact form and grants the corresponding Heart of
  Virtue/Mandate of Divinity/Power of Discord buff to Fleurdelys (see Forte Circuit).
- **Dodge Counter - Cartethyia**: post-Dodge Normal Attack, Aero DMG.

**Multipliers (Lv.10):**
- Stage 1: 4.78%HP
- Stage 2: 3.94%+3.94%+5.25%HP
- Stage 3: 4.28%×4HP
- Stage 4: 2.52%×3+7.54%HP
- Dodge Counter: 6.85%×4HP
- Heavy Attack: 2.08%×3+6.24%HP
- Mid-air Attack (no Shadows): 5.65%HP
- Mid-air Attack (1 Shadow recalled): 5.65%HP
- Mid-air Attack (2 Shadows recalled): 3.30%×3HP
- Mid-air Attack (3 Shadows recalled): 11.29%×3HP
- Mid-air Attack STA cost 30; Heavy Attack STA cost 20.

### Resonance Skill — Sword to Bear Their Names
**Resonance Skill - Cartethyia**: attacks the target, launches and plunges nearby enemies, Aero DMG,
inflicts 2 stacks of Aero Erosion. Counted as Basic Attack DMG. Castable mid-air. Summons Sword of
Virtue's Shadow (cap 1, 20s).

**Multipliers (Lv.10):** 6.89%×3+8.86%HP. Concerto Regen 10. Cooldown 14s.

### Resonance Liberation — A Knight's Heartfelt Prayers / Blade of Howling Squall
By reducing HP to 50% of Max HP (no HP cost if already below 50%), Cartethyia transforms into
**Fleurdelys** and enters **Manifest** for 12s. Castable mid-air. Entering Manifest clears all Conviction.
Ending the state does not consume Resonance Energy.

While in Manifest: Basic Stage 5 / Mid-air Stage 2 / Resonance Skill - May Tempest Break the Tides
instantly trigger 1 Aero Erosion DMG instance and reduce the target's Aero Erosion stack by 1.

Fleurdelys's attacks restore **Conviction** (cap 120) on hit. At 120 Conviction, Resonance Liberation is
replaced by **Blade of Howling Squall**; below 120, pressing Resonance Liberation instead transforms
back to Cartethyia (no Resonance Energy cost while in Manifest).

Sword Shadow bonuses active during Manifest (each removed when Manifest ends):
- **Heart of Virtue**: Basic Stage 4 (Fleurdelys) generates a Stagnate force field; Fleurdelys's
  interruption resistance increases.
- **Mandate of Divinity**: Aero Erosion DMG Amplified +50%, damage interval -50% (i.e. ticks twice as
  fast) for enemies near Fleurdelys.
- **Power of Discord**: on Basic Stage 5 / Mid-air Stage 2 / Enhanced Heavy Attack landing, or after
  May Tempest Break the Tides deals damage, raises Aero Erosion stacks on all nearby targets to the
  highest count among them.

Fleurdelys reverts to Cartethyia automatically during dialogue/interaction animations/Utility use.
Fleurdelys can walk on water (continuous STA drain in deep water) and walk in mid-air off a ledge
(continuous STA drain).

**Avatar transitions** (swap between forms without leaving Manifest, pausing/resuming its timer):
- **Avatar - Cartethyia**: below 120 Conviction, casting Resonance Liberation performs Basic Stage 2
  (Cartethyia form) and pauses the Manifest timer. Castable mid-air (performs Mid-air Attack -
  Cartethyia instead).
- **Avatar - Fleurdelys**: while paused, casting Resonance Liberation (as Cartethyia) performs Basic
  Stage 2 (Fleurdelys form) for free and resumes the Manifest timer. Castable mid-air (performs Mid-air
  Attack - Fleurdelys Stage 1 instead).

**Blade of Howling Squall**: at 120 Conviction. Removes all Conviction, ends Manifest, restores 50% of
Max HP, deals Aero DMG in a line AoE. On hit, removes ALL Aero Erosion stacks from the target — each
stack removed Amplifies DMG taken by the target +20%, up to 5 stacks (100% max). Castable mid-air.

**Multipliers (Lv.10):**
- Blade of Howling Squall: 13.12%×7
- A Knight's Heartfelt Prayers: cost 125, cooldown 25s, Concerto Regen 20
- Blade of Howling Squall: cooldown 25s, Concerto Regen 20
- Avatar transition cooldown: 1.5s

### Forte Circuit — Tempest (Fleurdelys's kit)
- **Basic Attack - Fleurdelys**: up to 5 hits, Aero DMG, restores Conviction on hit.
- **Mid-air Attack - Fleurdelys**: up to 3 hits (STA cost), Aero DMG, restores Conviction. Holding
  Normal Attack airborne casts Stage 3; Basic Attack shortly after chains into Basic Stage 3
  (Fleurdelys). Casting either Resonance Skill while airborne resets the Mid-air Attack cycle.
- **Heavy Attack - Fleurdelys**: thrust, Aero DMG, restores Conviction. Counted as Basic Attack DMG.
- **Enhanced Heavy Attack - Fleurdelys**: Normal Attack during Heavy Attack — fall back, line-AoE blast,
  Aero DMG, restores Conviction. Counted as Basic Attack DMG. Basic Attack shortly after chains into
  Upward Cut.
- **Upward Cut - Fleurdelys**: Jump while grounded, Aero DMG, restores Conviction.
- **Dodge Counter - Fleurdelys**: post-Dodge Normal Attack, Aero DMG, restores Conviction. Basic Attack
  shortly after chains into Basic Stage 4 (Fleurdelys).
- **Resonance Skill - Sword to Answer Waves' Call**: force field pulling in targets, Aero DMG, restores
  Conviction. Castable mid-air.
- **Resonance Skill - May Tempest Break the Tides**: follow-up press after Answer Waves' Call — giant
  Sword Shadow crush + pull-in force field, Aero DMG to grounded targets, restores Conviction. Basic
  Attack shortly after chains into Basic Stage 3 (Fleurdelys). Resonance Skill re-enters cooldown if
  this follow-up isn't cast within a window, or on swap-out. Castable mid-air.

**Multipliers (Lv.10):**
- Basic Stage 1: 6.49%HP
- Basic Stage 2: 3.63%+1.82%+1.82%+1.82%HP
- Basic Stage 3: 2.13%×3+4.26%HP
- Basic Stage 4: 2.74%×5HP
- Basic Stage 5: 7.20%+28.80%HP
- Dodge Counter: 3.20%×3+6.39%HP
- Upward Cut: 4.54%×2HP
- Heavy Attack: 4.28%+9.97%HP
- Enhanced Heavy Attack: 7.78%×2+3.89%HP
- Mid-air Stage 1: 2.99%+2.99%+3.08%HP
- Mid-air Stage 2: 7.39%+7.39%+14.77%HP
- Mid-air Stage 3: 2.20%HP
- Sword to Answer Waves' Call: 1.86%×4+17.36%; Concerto Regen 10
- May Tempest Break the Tides: 1.86%×2+7.03%×3; Concerto Regen 10
- Resonance Skill cooldown 14s
- Heavy/Enhanced Heavy Attack STA cost 20 each; Mid-air Stage 1/2 STA cost 5 each, Stage 3 STA cost 30

### Inherent Skills
- **A Heart's Truest Wishes**: healing received by all OTHER team Resonators +20%, their interruption
  resistance enhanced. If Rover: Aero is in the team, Rover: Aero additionally restores 25 Windstrings
  on casting their own Omega Storm.
- **Wind's Indelible Imprint**: targets with 1-3 Aero Erosion stacks take +30% more DMG from
  Cartethyia/Fleurdelys. Targets with MORE than 3 stacks additionally take +10% more DMG per stack above
  3, up to 3 extra stacks (so up to +60% total DMG taken at 6 stacks: 30% base + 30% from 3 bonus
  stacks).

### Intro Skill — Sword to Mark Tide's Trace / Sword to Call for Freedom
- **Cartethyia — Sword to Mark Tide's Trace**: Aero DMG, inflicts 2 Aero Erosion stacks, summons Sword
  of Discord's Shadow (cap 1, 20s). Normal Attack shortly after chains into Basic Stage 2.
- **Fleurdelys — Sword to Call for Freedom**: thrust, Aero DMG, restores Conviction. Normal Attack
  shortly after chains into Basic Stage 2 (Fleurdelys).

**Multipliers (Lv.10):**
- Sword to Mark Tide's Trace: 2.08%×3+6.24%HP; Concerto Regen 10
- Sword to Call for Freedom: 4.28%+9.97%HP; Concerto Regen 10

### Outro Skill — Wind's Divine Blessing
Aero DMG dealt by the incoming (non-Cartethyia/Fleurdelys) Resonator to targets with Negative Statuses
Amplified +17.5% for 20s.

### Resonance Chain (S1-S6)
- **S1**: Gain **Zeal** (10s) whenever Cartethyia's/Fleurdelys's attacks directly damage AND defeat an
  Aero-Erosion-afflicted target. While in Zeal, on a kill, the NEXT direct-damage move raises Aero
  Erosion stacks on the target(s) to the highest count among the defeated targets (capped at the
  current max stack limit); Zeal is then removed, 1s cooldown. Separately: at 30/60/90/120 Conviction,
  Fleurdelys's Crit DMG +25% for 15s each (up to 4 stacks, 100% total at max) — duration doesn't reset
  on gaining a new stack; all stacks removed on casting Blade of Howling Squall.
- **S2**: Casting A Knight's Heartfelt Prayers raises the Aero Erosion max-stack limit on nearby targets
  by 3. The next direct-damage hit inflicts 3 Aero Erosion stacks on all nearby targets AND immediately
  triggers their Aero Erosion DMG once without consuming stacks. Cartethyia's Basic/Heavy/Dodge
  Counter/Intro Skill DMG Multiplier +50%; Mid-air Attack DMG Multiplier +200%. After Mid-air Attack -
  Cartethyia, each DISTINCT type of Sword Shadow recalled reduces Resonance Skill cooldown by 1s (up to
  3s at 3 distinct types).
- **S3**: Basic Stage 5 (Fleurdelys) / Mid-air Stage 2 (Fleurdelys) / Enhanced Heavy Attack / May Tempest
  Break the Tides now inflict 2 Aero Erosion stacks (previously 0, per the base-kit text — these moves
  only CONSUME Erosion in Manifest without S3). Blade of Howling Squall DMG Multiplier +100%.
- **S4**: After ANY team Resonator inflicts Havoc Bane, Fusion Burst, Spectro Frazzle, Electro Flare,
  Glacio Chafe, or Aero Erosion, the WHOLE team gains +20% DMG Bonus to ALL Attributes for 20s.
- **S5**: On taking a fatal blow, Cartethyia/Fleurdelys don't go down — instead gain a Shield = 20% of
  Cartethyia's Max HP for 10s (once per 10 real-time minutes). A Knight's Heartfelt Prayers' HP cost
  reduced to 25% of Max HP (from 50%).
- **S6**: After casting Blade of Howling Squall, raise the target's Aero Erosion stacks to max (Blade of
  Howling Squall no longer removes stacks on cast — its own +20%/stack DMG-taken-amp effect from
  removing stacks is gone once this is unlocked, since nothing is removed anymore). Within 30s of
  casting Sword to Mark Tide's Trace / Sword to Call for Freedom (Intro) / A Knight's Heartfelt Prayers /
  Blade of Howling Squall, when ANY team Resonator inflicts Aero Erosion on a target already at max
  stacks, immediately trigger that target's Aero Erosion DMG once. Targets take +40% more DMG from
  Fleurdelys specifically.

### Minor Fortes (Total)
Crit Rate +8%, HP% +12%.

### Base Stats (Lv.90, incl. minor fortes)
HP 14800 | ATK 313 | DEF 611 | Max Energy 125 | Crit Rate 5% | Crit DMG 150% | Healing Bonus 0% |
Aero DMG Bonus 0%.

## Review

**DPS tier**: **T0.5** (ToA, standard) / **T1.5** (WW, standard) — **T1** (ToA, Value list) / **T2** (WW,
Value list).

**Pros**
- Best DPS in the game in her best team under optimal conditions.
- Built-in interruption resistance once her inputs are learned — near-impossible to fail her rotation.
- Self-sufficient: heals herself, applies AND amplifies her own Aero Erosion.
- Hard to hit — much of her rotation is airborne.
- Can Stagnate AND group enemies while in Fleurdelys form.
- Many swap-cancel windows for optimization/quickswap.
- Strong even off her best team/weapon, purely on kit strength.
- Boosts teammates' interruption resistance/healing, funnels Forte points to Rover: Aero if present.

**Cons**
- Very expensive: teammate-reliant, signature-weapon-reliant, wants unconventional builds on her
  teammates too, and she herself scales off HP (unconventional, non-shareable investment).
- Can struggle keeping Aero Erosion stacked in AoE if she kills everything in one hit (notably in
  Whimpering Wastes); worse without Ciaccona on the team.
- Kit text is extremely long/dense.

**Review summary**: Entire kit's damage scales off HP, not ATK — makes gearing her unusually
restrictive since most Swords/Echo sets are ATK-oriented. Pre-Manifest combo builds all 3 Sword Shadow
types (Discord via Intro, Divinity via Basic 4, Virtue via Resonance Skill), then Mid-air Attack recalls
all of them at once to buff Fleurdelys before transforming. Intro and Resonance Skill each apply 2 Aero
Erosion stacks, Basic Stage 4 applies 1, for 5 stacks/rotation pre-Manifest (base cap 3, raiseable +3 via
Rover: Aero's Outro or Cartethyia's own S2, so up to 6 in practice). Her Inherent Skill (Wind's
Indelible Imprint) grants +30% DMG to any Aero-Erosion target regardless of stack count, plus +10% more
per stack above 3 (up to +60% total DMG bonus at 6 stacks) — makes Erosion stacking central to her
damage. In Manifest, the optimal Conviction-building order is Skill 1 → Mid-air 3 → Skill 2 (consumes 1
Erosion) → Basic 3/4/5 (Basic 5 consumes 1 Erosion) → Heavy → Enhanced Heavy, then Blade of Howling
Squall to end the rotation. At S0 she's tightly teammate-restricted (needs Ciaccona + Rover: Aero,
non-negotiably, for full erosion/amp uptime); S2 removes the Rover: Aero requirement by letting her
self-sustain 6 stacks. Best DPS in the game in her ideal team; still excellent solo/off-meta thanks to
kit strength alone.

## Build

**Best Weapons** (calculated with Ciaccona + Woodland Aria/Gusts of Welkin set + Nightmare: Kelpie, and
Rover: Aero + Bloodpact's Pledge/Windward Pilgrimage set + Reminiscence: Fleurdelys as teammates):
1. **Defier's Thorn (signature, R1)** — 100.00%. Max HP+12%. 15s after Intro/Basic Attack cast, ignores
   8% target DEF. If target has ≥1 Aero Erosion stack, DMG taken by target Amplified +20%. Stats: ATK
   413, HP 72.2%. Best by a large margin — the only weapon giving her the HP% she actually wants, plus
   DEF Ignore and a universal Erosion-conditional DMG Amp.
2. **Red Spring** — 79.50%. ATK+12%. Basic Attack DMG grants +10% Basic ATK DMG Bonus (14s, 1/s
   trigger, up to 3 stacks); Concerto Energy consumption grants +40% Basic DMG Bonus (10s, 1/s trigger,
   ends on swap-out). Stats: ATK 587, Crit Rate 24.3%. Second-best — good Crit Rate substat plus real
   use of the Basic DMG bonus passive.
3. **Feather Edge (R5, Battle Pass)** — 77.00%. Resonance Liberation cast: ATK+23%, Liberation DMG Bonus
   +34.5% (15s). Stats: ATK 412, Crit Rate 20.3%. Great since her low base ATK doesn't hurt her
   (HP-scaling) — real use of the Liberation DMG bonus (one of her two main damage types) plus solid
   Crit Rate.
4. **Blazing Brilliance** — 75.90%. ATK+12%. On damage, 1 stack of Searing Feather (0.5s ICD); Resonance
   Skill cast grants 5 stacks; each stack +4% Resonance Skill DMG Bonus, up to 14 stacks (all removed
   12s after reaching cap). Stats: ATK 587, Crit DMG 48.6%. Simple Crit DMG/Skill DMG stick — Skill DMG
   is a negligible share of her damage.
5. **Emerald Sentence** — 75.70%. ATK+12%. Echo Skill within 10s of Intro/Basic grants Bamboo Cleaver
   (+30% Heavy ATK DMG Bonus, stack ×2, 12s, 10s ICD, ends early on swap-out); Intro grants team +20%
   Echo Skill DMG Bonus (30s). Stats: ATK 587, Crit Rate 24.3%. Simple Crit Rate stick — passives barely
   used.
6. **Emerald of Genesis** — 72.30%. Energy Regen+12.8%. Resonance Skill cast: ATK+6%, up to 2 stacks
   (10s). Stats: ATK 587, Crit Rate 24.3%. Best permanently-available (non-Battle-Pass, non-signature)
   option given she has no better alternatives.
7. **Guardian Sword (R5)** — no % listed (last resort). Resonance Skill DMG+24%. Stats: ATK 300, HP
   30.3%. Last resort if none of the above are owned — the only OTHER Sword in the game offering HP%
   besides her own signature.

**Best Echo Set**: **Windward Pilgrimage** (100.00%). 2pc: +10% Aero DMG. 5pc: hitting an
Aero-Erosion-afflicted target grants +10% Crit Rate and +30% Aero DMG Bonus for 10s. Best set for any
Aero Main DPS who applies (or is teamed with an applier of) Aero Erosion — offers 10% more Crit Rate
than alternative Aero sets (Gusts of Welkin/Sierra Gale) so long as Erosion uptime holds.
- Main Echo option: **Reminiscence: Fleurdelys** — Summon Echo dealing 27.36% Aero DMG×8 + 136.80% Aero
  DMG once (20s CD); grants the wielder +10% Aero DMG Bonus in the main slot, PLUS another +10% Aero DMG
  Bonus specifically if the wielder is Rover: Aero or Cartethyia — best choice for her.

**Best Echo Stats**: 4-cost Crit Rate · 4-cost Crit DMG · 1-cost HP% ×3.
**Substat priority**: Energy Regen (until satisfied) > Crit Rate = Crit DMG > HP% > Basic Attack DMG% =
Liberation DMG% > flat HP.

**Best Endgame Stats (Lv.90, S0)**: HP 35000-50000+ | DEF 600+ | Crit Rate 65-80%+ | Crit DMG 240-270%+
| Energy Regen 110%+ | Aero DMG Bonus 30%+.

**Skill Priority**: Forte Circuit > Resonance Liberation > Basic Attack > Resonance Skill > Intro Skill.
Skill and Intro can be skipped when leveling to save resources at minimal damage loss.

## Gameplay and Teams

**Full rotation** (real-game order, per Prydwen's own optimal-time sequence):
Intro (Cartethyia) → Basic P2 → Basic P3 → Basic P4 → Resonance Skill (Sword to Bear Their Names) →
Mid-air Attack (Cartethyia) → Resonance Liberation (A Knight's Heartfelt Prayers, transforms to
Fleurdelys) → Skill 1 (Sword to Answer Waves' Call) → Mid-air Attack Stage 3 (Fleurdelys, hold Basic
during Skill) → Basic P3 → Basic P4 → Basic P5 → Skill 2 (May Tempest Break the Tides) → Basic P3 →
Basic P4 → Basic P5 → Resonance Liberation (Blade of Howling Squall) → Outro. Rotation time 13.23s
(S0-S6 calc benchmark team).

Notes on real-game rotation adjustments:
- Intro applies 2 Aero Erosion, Resonance Skill applies 2, Basic Stage 4 applies 1 — 5 stacks/rotation
  before any teammate/chain-level cap increase (base cap 3; Rover: Aero's Outro and Cartethyia's own S2
  each raise it by 3, up to 6 total in practice).
- With Ciaccona on the team, or at S3, Aero Erosion is kept permanently at max stacks — in that case
  spending 1 more Erosion stack and using Mid-air Attack 1+2 (instead of Mid-air Attack 3) is slightly
  higher DPS, though situational (depends on whether the faster/slower rotation kills the target
  quicker).
- Multiple Swap Cancel windows exist: her base Cartethyia form allows weaving her Resonance Skill mid-
  teammate-rotation (must Jump after Basic 4 to still get her Mid-air Attack's Sword Shadow buffs); in
  Fleurdelys form, Mid-air Attack 3 / Skill 2 / Basic P5 / Enhanced Heavy Attack can all be swap-cancelled
  and resumed without losing rotation time (as long as no swap-forfeited Outro buff is active) — enables
  Quickswap teams (e.g. with Changli) and lets Rover: Aero get a full Windstrings-restore Ultimate cast
  in without Concerto Energy issues.
- Animation-cancel points: Basic 4's endlag → Resonance Skill or Jump→Mid-air Attack (Cartethyia form);
  Mid-air Attack's endlag → Resonance Liberation (early enough still procs Sword Shadow buffs, but loses
  meaningful damage if cancelled too early — needs careful timing); Mid-air Attack 3's endlag → Skill 2
  (Fleurdelys form); Enhanced Heavy Attack's endlag → Blade of Howling Squall (Fleurdelys form).

**Damage profile** (S0-S6 calc benchmark team, 1-target scenario): Basic 51.6% · Liberation 23.6% ·
Debuff (Erosion) 12.5% · Skill 6.6% · Intro 3.4% · Echo 3.4% (exact % breakdown per the site's own pie
chart: Basic 225,945 · Debuff 29,099 · Skill 54,679 · Liberation 103,156 · Intro 13,133 · Outro 0 · Echo
11,885 — Heavy 0, since her Heavy Attack is largely swap-cancelled out of the modeled rotation).

**Sequence value** (1-target scenario, same benchmark team, S0 = 100% baseline):
- S0: 1,343,844 DMG / 101,575 DPS (100.00%)
- S1: 1,533,140 DMG / 115,883 DPS (114.09%)
- S2: 2,015,501 DMG / 152,343 DPS (149.98%) — S2's value is CONDITIONAL: weaker in teams already running
  Rover: Aero (both raise the Erosion cap by the same +3, so they don't stack usefully together).
- S3: 2,486,093 DMG / 187,913 DPS (185.00%) — also weaker with a teammate (e.g. Ciaccona) already
  maintaining max Erosion stacks throughout her Liberation window.
- S4: 2,639,279 DMG / 199,492 DPS (196.40%) — identical total to S5 in this 1-target benchmark (S4's own
  team-wide DMG Bonus doesn't add further to a solo-calc single-character number the way it would in a
  real team context).
- S5: 2,639,279 DMG / 199,492 DPS (196.40%)
- S6: 3,237,199 DMG / 244,686 DPS (240.89%)

**Synergies**:
- **Ciaccona** — best Sub DPS: short, high-damage rotation; buffs via Solo Concert/Echo set/potential
  weapon; Amplifies Aero Erosion DMG +100% on her own Outro; keeps Erosion applied off-field
  continuously, letting Cartethyia use her kit's buffs to the fullest.
- **Rover: Aero**, **Chisa**, **The Shorekeeper** — the three best 3rd-slot supports. Rover: Aero and
  Chisa both raise the Aero Erosion stack cap by 3 (same as Cartethyia's own S2); Chisa's buffs are
  better than Rover: Aero's ONLY with her own signature weapon equipped; Shorekeeper is mainly used in
  Whimpering Wastes (multi-wave content where ramping Erosion to 6 stacks is impractical) for her own
  buffs/rotation speed instead.
- **Sanhua** — best F2P pairing: buffs Basic Attack DMG (covers several of Cartethyia's moves), rotates
  extremely fast, doesn't apply Erosion herself (her role is just maximizing Cartethyia's own field
  time) — stronger than an alternative like Aalto (insufficient field-time backing/buffing).

**Example Teams**:
1. **Cartethyia + Ciaccona + Chisa/Rover: Aero/Shorekeeper** — Chisa only beats Rover: Aero with her own
   signature weapon; Shorekeeper is mainly the 3rd-slot pick in Whimpering Wastes since Erosion can't
   ramp to 6 stacks in time there anyway.
2. **Cartethyia + Rover: Aero + Chisa/Sanhua** — Rover: Aero opens 2nd in rotation order with
   Chisa/Shorekeeper on the team, but opens the rotation FIRST when paired with Sanhua instead. Use
   Skyfall Severance (Rover: Aero's own Utility) to convert Havoc Bane into Erosion when running with
   Chisa specifically.
