# Iuno — Prydwen.gg source dump (cleaned)

5★ Aero, Gauntlets. Flexible Main DPS/Hybrid/Support — real-game roles differ significantly (two
separate calculation sets exist: DPS and Hybrid). Real-life last update: review Patch 2.6, calcs Patch
3.0, profile 20/August/2026.

## Kit

### Basic Attack — Moon Steps
- **Moonring - Basic Attack**: up to 3 hits, Aero DMG.
- **Mid-air Attack**: Plunging Attack (STA cost), Aero DMG.
- **Moonring - Dodge Counter**: post-Dodge Normal Attack, Aero DMG. Normal Attack shortly after chains
  into Moonring Basic Stage 3.
- **Moonbow - Basic Attack**: unlocked in Lunar Cycle - New Moon (entered via Heavy Attack - Flux:
  Moonring). Up to 3 hits, Aero DMG, counted as Resonance Liberation DMG. Castable mid-air.
- **Moonbow - Dodge Counter**: in Lunar Cycle - New Moon, post-Dodge Normal Attack, Aero DMG, counted as
  Resonance Liberation DMG. Normal Attack shortly after chains into Moonbow Basic Stage 3. Castable
  mid-air.

**Multipliers (Lv.10):**
- Moonring Basic 1: 87.68%
- Moonring Basic 2: 46.06%×2+47.46%
- Moonring Basic 3: 87.98%×2+90.65%
- Mid-air Attack: 53.68%×2
- Moonring Dodge Counter: 82.08%×2+84.57%
- Moonbow Basic 1: 126.45%
- Moonbow Basic 2: 55.67%×3
- Moonbow Basic 3: 167.01%×2
- Moonbow Dodge Counter: 103.39%×3
- Mid-air Attack STA cost 30.

### Resonance Skill — Foresight Fugue
- **Pulse of Origins**: dash forward, Aero DMG.
- **Closing Refrain**: when NOT in Lunar Cycle, casting Moonring Basic Stage 3 / Intro Skill / Pulse of
  Origins replaces Resonance Skill with Closing Refrain for 5s. Casting it unleashes a flurry of
  strikes, Aero DMG, and activates Lunar Cycle.
- **Unfinished Refrain**: in Lunar Cycle - Half Moon, Resonance Skill is replaced with this. Flurry of
  strikes, Aero DMG. Shares cooldown with Closing Refrain.
- **Arc Beyond the Edge**: in Lunar Cycle - New Moon, Resonance Skill is replaced with this (2 initial
  charges). Shifts position, Aero DMG, counted as Resonance Liberation DMG. Directional input extends
  travel distance. If hit/launched airborne, casting this immediately recovers from the attack.
  Castable mid-air.

**Multipliers (Lv.10):**
- Pulse of Origins: 18.65%×7+130.52%; cooldown 6s; Concerto Regen 6
- Closing Refrain: 140.73%×2+145.00%; Concerto Regen 8
- Unfinished Refrain: 140.73%×2+145.00%; Concerto Regen 8; shares 8s cooldown with Closing Refrain
- Arc Beyond the Edge: 219.79%×2; cooldown 10s; Concerto Regen 8

### Resonance Liberation — Beneath Lunar Tides
Aero DMG, activates Lunar Cycle. Castable mid-air.

**Multipliers (Lv.10):** 1093.46%. Cooldown 25s, cost 125, Concerto Regen 20.

### Forte Circuit — Ebb and Flow
**Lunar Cycle**: activated by casting Closing Refrain or Resonance Liberation. Two states — **Half
Moon** (default entry) and **New Moon** — switchable via Heavy Attack - Flux. While in Lunar Cycle,
Jump is replaced by Heavy Attack - Flux; STA doesn't recover while airborne; movement becomes
"Meandering" (continuous STA drain to move uniquely in mid-air). Environmental interactions, Utility
use, or holding Jump ends Lunar Cycle. Real Lunar Cycle duration: 15s.

- **Half Moon**: attacks with Moonring, restores Sentience on hit. Heavy Attack - Flux: Moonbow (Aero
  DMG, counted as Resonance Liberation DMG, castable mid-air) switches to New Moon.
- **New Moon**: attacks with Moonbow. Casting Moonbow Basic Attack / Arc Beyond the Edge / Moonbow
  Dodge Counter consumes Sentience to increase that skill's DMG Multiplier, restore extra Concerto
  Energy, and heal nearby team Resonators. Heavy Attack - Flux: Moonring (Aero DMG, counted as
  Resonance Liberation DMG, castable mid-air) switches back to Half Moon.
- **Heavy Attack - Absolute Fullness**: replaces Heavy Attack at full Concerto Energy. Ends Lunar
  Cycle, heals nearby team Resonators, Aero DMG to nearby targets (counted as Resonance Liberation
  DMG), conjures a Full Moon Domain at her location. Once per 25s. Castable mid-air.
- **Full Moon Domain**: Resonators inside periodically restore HP/STA. Gaining a Shield inside grants 1
  stack of Blessing of the Wan Light (0.5s trigger cap).
- **Blessing of the Wan Light**: +4% all DMG Amplification per stack for 10s, up to 10 stacks; new
  stacks reset duration; ends early if the recipient swaps off-field.
- **Sentience** (cap 100): Intro restores 40; Resonance Liberation restores 60; Closing Refrain/
  Unfinished Refrain restore 25; in Lunar Cycle, Moonring Basic/Moonring Dodge Counter/Mid-air Attack
  also restore Sentience on hit.

**Multipliers (Lv.10):**
- Lunar Cycle duration 15s
- Flux - Moonbow: 250.51%
- Flux - Moonring: 79.18%×4
- Enhanced Moonbow Basic 1: 205.97%
- Enhanced Moonbow Basic 2: 88.74%×3
- Enhanced Moonbow Basic 3: 266.41%×2
- Enhanced Moonbow Dodge Counter: 156.40%×3
- Enhanced Arc Beyond the Edge: 319.19%×2
- Moonbow Basic 1/2/3 extra Concerto Regen: 4/6/10
- Moonbow Dodge Counter extra Concerto Regen: 8
- Arc Beyond the Edge extra Concerto Regen: 10
- Moonbow Basic 1/2 Healing: 25.91% ATK each; Basic 3 Healing: 48.57% ATK
- Moonbow Dodge Counter Healing: 32.38% ATK
- Arc Beyond the Edge Healing: 48.57% ATK
- Absolute Fullness: 159.05% DMG, 194.26% ATK Healing
- Full Moon Domain: 30s duration, 5s tick interval, 32.38% ATK Healing/tick, 20 STA regen/tick
- Meandering STA cost: 10/s
- Heavy Attack - Flux STA cost: 25

### Inherent Skills
- **Waxing Ascent**: every Basic/Heavy/Dodge Counter/Resonance Skill/Resonance Liberation/Intro Skill
  cast grants 1 Shield = 32% of her ATK for 15s (not passed to the incoming Resonator).
- **Derivation**: casting Intro Skill or Resonance Liberation immediately grants 5 stacks of Blessing
  of the Wan Light.

### Intro Skill — Illuminated Manifestation
Aero DMG. **Multipliers (Lv.10):** 15.91%×7+47.72%. Concerto Regen 10.

### Outro Skill — From Gloom to Gleam
Attacks the target for 100% Aero DMG. The incoming Resonator gains +50% Heavy Attack DMG Amplification
for 14s (ends early if they're swapped off-field). Casting the Outro does NOT interrupt Heavy Attack -
Absolute Fullness, and the Outro's own effect still applies even when overlapping it.

### Resonance Chain (S1-S6)
- **S1**: while in Lunar Cycle, ATK +40%. While inside the Full Moon Domain, additionally restores 1
  Resonance Energy/s. Arc Beyond the Edge and Heavy Attack - Absolute Fullness become immune to
  interruption.
- **S2**: team Resonators with 10 stacks of Blessing of the Wan Light gain an ADDITIONAL +40% all-DMG
  Amplification (on top of the base 40% at 10 stacks from the stacks themselves).
- **S3**: while in Lunar Cycle, Moonbow Basic Attack / Arc Beyond the Edge / Moonbow Dodge Counter DMG
  Amplified +65%. Within a certain window after Moonbow Basic Attack/Dodge Counter, casting Arc Beyond
  the Edge does NOT reset the Moonbow Basic Attack cycle.
- **S4**: casting Heavy Attack - Absolute Fullness grants a Shield = 160% of Iuno's ATK to the WHOLE
  team for 30s (not passed to the incoming Resonator on swap).
- **S5**: Resonance Liberation DMG Bonus +20%.
- **S6**: Heavy Attack - Absolute Fullness DMG Multiplier +1600%. On cast, re-enters Lunar Cycle - New
  Moon, gains 100 Sentience, and resets Arc Beyond the Edge's cooldown entirely.

### Minor Fortes (Total)
Crit Rate +8%, ATK% +12%.

### Base Stats (Lv.90, incl. minor fortes)
HP 10525 | ATK 450 | DEF 1124 | Max Energy 125 | Crit Rate 5% | Crit DMG 150% | Healing Bonus 0% | Aero
DMG Bonus 0%.

## Review

**DPS tier**: **T0.5** (ToA) / **T4** (WW) — Value: **T1.5** (ToA) / **T4** (WW).
**Hybrid tier**: **T1** (ToA) / **T1.5** (WW) — Value: **T1.5** (ToA) / **T1.5** (WW).

**Pros**
- Jack of all trades: Main DPS, Sub DPS, buffing, healing, STA restoration — does everything.
- Shields herself while constantly healing on most attacks — hard to die to consecutive small hits.
- Very team-flexible: fills many roles, rotation can be extended/shortened as needed, gives purpose to
  less-used teammates.

**Cons**
- Damage-focused enough to really want a strong weapon to justify her slot over cheaper alternatives
  (most notably Mortefi).
- Loses her own DMG Amp effects on swap-out, not just the incoming character's — fairly
  quickswap-unfriendly.
- Prone to interruption mid-air — rotation can slow significantly if hit; requires careful dodging.

**Review summary**: Main mechanic is **Lunar Cycle**, entered via Closing Refrain (post-Intro Skill) or
her Ultimate. Two phases — Half Moon (default, effectively skipped in real rotations) and New Moon
(where the majority of her damage lives, gated by her Forte gauge **Sentience**, cap 100). Sentience
income: Intro +40, Closing Refrain +25, Ultimate +60 (Unfinished Refrain and Half-Moon Moonring Basics
also restore it but go unused in the modeled rotation). Sentience spend: a full Moonbow Basic
3-hit-chain costs 50, Arc Beyond the Edge costs 25/cast (2 charges) — so one full Basic chain + both
Skill charges exactly drains a full 100-point bar, which IS her core rotation loop. Enhanced attacks
stay enhanced at ANY nonzero Sentience (not scaled by how much remains, just gated on >0) — exploited in
her Main DPS rotation to extend it further than the "just drain to 0 once" baseline. Reaching New Moon
requires: enter Lunar Cycle, then a jump-attack Flux cast. Standard Basic/Moonring Basic attacks are
essentially unused in real rotations (Moonbow variants are what matters). Her two real self-buffs are
Blessing of the Wan Light (+4%/stack all DMG Amp, up to 10 stacks/40% max, from Intro +5/Ultimate +5)
and Waxing Ascent (a trivial, un-protective Shield whose only purpose is triggering Crown of Valor/her
signature weapon's Shield-gated passives). Her real team value is the Outro (+50% Heavy ATK DMG Amp,
14s, swap-forfeited) and the Full Moon Domain (only relevant with Augusta present — its Blessing-stack
mechanic and healing/STA-restore are otherwise skippable). Competes directly with Mortefi for the same
support niche; whichever characters Iuno wants to buff generally work fine with the F2P Mortefi instead,
making Iuno somewhat "redundant" as a pull despite very strong standalone Main-DPS numbers. Still
excellent as an independent DPS pick (works well with Ciaccona/Jianxin/Rover: Aero without needing
Augusta or Jiyan at all).

## Build

**Best Weapons** — two calculation sets exist (DPS role, top %; Hybrid role, bottom %). DPS calculated
with Lynae + Spectrum Blaster/Pact of Neonlight Leap set + Hyvatia and Ciaccona + Woodland Aria/Gusts of
Welkin set + Nightmare: Kelpie; Hybrid calculated with The Shorekeeper + Variation/Rejuvenating Glow set
+ Fallacy of No Return:
1. **Moongazer's Sigil (signature, R1)** — 100.00% DPS / 100.00% Hybrid. ATK+12%. Intro/Liberation cast:
   Liberation DMG+20% (15s). Obtaining a Shield: Liberation DMG ignores 7.2% target DEF (7s, 0.5s
   trigger, up to 5 stacks = 36% DEF Ignore); Intro cast instantly maxes this to 5 stacks for 3s. Stats:
   ATK 500, Crit Rate 36%. Best on all fronts — massive DEF Ignore (easily stacked via her many
   self-Shields), unconditional Liberation DMG Bonus, huge Crit Rate, solid base ATK.
2. **Verity's Handle** — 84.10% DPS / 93.50% Hybrid. Attribute DMG+12%. Liberation cast: Liberation DMG
   +48% (8s, extends +5s per Resonance Skill cast, up to 3 extensions). Stats: ATK 587, Crit Rate 24.3%.
   Lower value for Main DPS (delayed Ultimate cast); a perfectly acceptable 2nd option (comparable to
   Jiyan's signature on Augusta) thanks to easily-accessed Liberation DMG Bonus plus strong stats.
3. **Blazing Justice** — 77.90% DPS / 77.10% Hybrid. ATK+12%. Basic Attack cast: 8% DEF Ignore + 50%
   Spectro Frazzle DMG Amp (6s, refresh on retrigger). Stats: ATK 587, Crit DMG 48.6%. Best generalist
   Gauntlets option (easy DEF Ignore uptime, good stats) — the Frazzle Amp is wasted on her (only Zani
   uses it), ranking it below the above.
4. **Tragicomedy** — 77.90% DPS / 77.10% Hybrid. ATK+12%. Basic Attack/Intro cast: Heavy ATK DMG+48%
   (3s). Stats: ATK 587, Crit Rate 24.3%. Simple ATK/Crit Rate stick — she gets no use from the Heavy
   ATK-focused passive.
5. **Pulsation Bracer** — 72.00% DPS / 73.00% Hybrid. ATK+12%. Damage to Tune Strain-Interfered targets:
   +6% Basic ATK DMG (3s, up to 4 stacks, 0.5s trigger, refresh on retrigger). Stats: ATK 587, Crit Rate
   24.3%. Strongest permanently-available option — simple ATK/Crit Rate stick.
6. **Abyss Surges** — 69.40% DPS / 76.70% Hybrid. Energy Regen+12.8%. Resonance Skill hit: Basic ATK DMG
   +10% (8s); Basic Attack hit: Resonance Skill DMG +10% (8s). Stats: ATK 587, ATK% 36.4%. Its passives
   are wasted on her, but massive base ATK/ATK% still rank it above most 4★ options.
7. **Aether Strike (R5, Battle Pass)** — 66.40% DPS / 71.20% Hybrid. Liberation cast: ATK+23%,
   Liberation DMG+34.5% (15s). Stats: ATK 412, Crit DMG 40.5%. Lower value for Main DPS (delayed
   Ultimate); significantly worse than Abyss Surges at R1 but still one of her better 4★ picks thanks to
   the Liberation DMG boost and Crit DMG substat.
8. **Stonard (R5, Battle Pass)** — DPS: no % listed. Hybrid: 62.60%. Resonance Skill cast: caster's
   Liberation DMG+54% (15s). Stats: ATK 412, Crit Rate 20.2%. Significantly worse than Abyss Surges at
   R1; calculations assume Closing Refrain is used. Fantastic despite low base ATK, rivaling some
   lower-ranked 5★ options.
9. **Celestial Spiral (R5)** — DPS: no % listed. Hybrid: 62.30%. Resonance Skill cast: +10 Resonance
   Energy, ATK+20% (16s, 20s ICD). Stats: ATK 462, ATK% 18.2%. Calculations assume Closing Refrain is
   used. Good non-Battle-Pass 4★ pick (Energy/ATK), but ranks below every 5★ due to low base stats.
10. **Hollow Mirage (R5)** — 66.40% DPS / 59.50% Hybrid. Liberation cast: 3 stacks of Iron Armor (each
    +5% ATK/DEF, up to 3, -1 stack per hit taken). Stats: ATK 412, ATK% 30.3%. Slightly above the
    craftable option in best-case conditions (upkeep-dependent) — not recommended if better options
    exist.
11. **Legend of Drunken Hero (R5, craftable)** — no % listed (last resort permanently-free option). DMG
    to Negative-Status enemies: ATK+8% (10s, 1/s trigger, up to 4 stacks). Stats: ATK 462, ATK% 18.2%.
    Significantly stronger specifically in a Ciaccona-Main-DPS team; best 4★ that needs zero pulls
    (weekly boss materials only) — otherwise ranks below the above due to lacking secondary stats
    besides ATK%.

**Best Echo Set (Main DPS)**: **Crown of Valor** (100.00%, "the only set that should be run on Main DPS
Iuno"). 3pc: on gaining a Shield, +6% ATK and +4% Crit DMG for 4s (0.5s trigger, up to 5 stacks = 30%
ATK / 20% Crit DMG total). Best combined with a 2pc from Sierra Gale / Gusts of Welkin / Windward
Pilgrimage / Sound of True Name (recommended) or Endless Resonance / Reel of Spliced Memories, or 2pc
from Moonlit Clouds / Empyrean Anthem / Tidebreaking Courage. Iuno and Augusta are the only two
characters in the game able to fully stack this effect.
- Main Echo option: **Lady of the Sea** — simple Summon Echo, +12% Liberation DMG Bonus and +12% Aero
  DMG Bonus in the main slot, no cast restrictions — best choice.

**Best Echo Set (Sub DPS)**: **Moonlit Clouds** (rank #2, "only consider on a Sub DPS Iuno" — near-equal
team damage to Crown of Valor in her best Sub-DPS teams). 2pc: +10% Energy Regen. 5pc: on Outro cast,
next Resonator's ATK+22.5% for 15s.
- Main Echo option: **Impermanence Heron** — the only real option for this set: adds +12% DMG Bonus on
  top of Moonlit Clouds' own 22.5% ATK boost to the incoming Resonator; also restores a lot of Energy to
  the caster on hit. Best cast at the start of her rotation, cancelled via a dash (after Closing Refrain)
  or via her Ultimate (right after Intro).

**Best Echo Stats**: 4-cost Crit Rate/Crit DMG · 3-cost Aero DMG · 3-cost Aero DMG > ATK% · 1-cost ATK%
×2.
**Substat priority**: Energy Regen (until satisfied) > Crit Rate = Crit DMG > Liberation DMG% ≥ ATK% >
flat ATK.

**Best Endgame Stats (Lv.90, S0)**: HP 15000+ | DEF 1100+ | ATK 1800-2400+ | Crit Rate 65-80%+ | Crit
DMG 215-260% | Energy Regen 120-130%+ (Hybrid, estimated with Augusta) OR 100% (DPS, estimated with
Lynae+Shorekeeper) | Aero DMG Bonus 40-70%+.

**Skill Priority (Main DPS)**: Forte Circuit > Resonance Liberation > Basic Attack > Resonance Skill >
Intro Skill. Skill/Intro skippable when leveling at minimal loss.
**Skill Priority (Hybrid)**: Forte Circuit > Resonance Liberation > Intro Skill > Resonance Skill > Basic
Attack. Skill/Intro/Basic skippable when leveling at minimal loss.

## Gameplay and Teams

Iuno has multiple distinct rotations depending on team role. Echo timing note: with Moonlit Clouds +
Impermanence Heron as the main Echo, cast/cancel it via her Ultimate (after Intro) or, in the extended
rotation, after Closing Refrain (cancel via Dash); with Crown of Valor, cast the Echo Skill at any point.

**Standard Sub DPS Rotation** (best with Augusta on the team — Full Moon Domain buffs her the most):
Intro → Ultimate → Jump Attack: Flux - Moonbow → Enhanced Moonbow Basic P1 → P2 → P3 → Enhanced Skill:
Arc Beyond the Edge ×2 → Forte: Heavy Attack: Absolute Fullness (swap) → Outro.

**Standard Sub DPS Rotation (without Augusta)**: same as above but drops Absolute Fullness (its extra
healing/Domain has no Augusta to buff) — swap out one Arc Beyond the Edge cast earlier instead: Intro →
Ultimate → Jump Attack: Flux - Moonbow → Enhanced Moonbow Basic P1-P3 → Enhanced Skill: Arc Beyond the
Edge ×2 (swap on the 2nd) → Outro.

**Extended Sub DPS Rotation** (adds Closing Refrain for extra field time/Concerto without much DPS
loss; needed for certain Skill-cast-triggered weapons like Stonard): Intro → Skill: Closing Refrain →
Jump Attack: Flux - Moonbow → Enhanced Skill: Arc Beyond the Edge (animation-cancel into Ultimate right
after the projectiles fire) → Ultimate → Enhanced Moonbow Basic P1-P3 → Enhanced Skill: Arc Beyond the
Edge (swap here if skipping Absolute Fullness) → (optional) Heavy Attack: Absolute Fullness (swap) →
Outro.

**Main DPS Rotation** (best when Iuno IS the team's Main DPS): Intro → Skill: Closing Refrain → Jump
Attack: Flux - Moonbow → Enhanced Moonbow Basic P1-P3 → Enhanced Skill: Arc Beyond the Edge
(animation-cancel into Ultimate once projectiles fire) → Ultimate → Enhanced Moonbow Basic P1-P3 →
Enhanced Skill: Arc Beyond the Edge → Moonbow Basic P1-P3 (swap; P3 is a 2-part hit, can swap out
earlier than expected) → Outro.

**S6-Only Main DPS Rotation** (Absolute Fullness becomes central once its own S6 buff applies): Intro →
Skill: Closing Refrain → Jump Attack: Flux - Moonbow → Enhanced Skill: Arc Beyond the Edge
(animation-cancel into Ultimate) → Ultimate → Enhanced Moonbow Basic P1-P3 → Enhanced Skill: Arc Beyond
the Edge → Heavy Attack: Absolute Fullness → Enhanced Moonbow Basic P1-P3 → Enhanced Skill: Arc Beyond
the Edge ×2 (swap on the 2nd) → Outro.

**Damage profile — DPS role** (S0-S6 benchmark, 1-target, rotation 13.36s): Liberation dominant, 90.8%
combined Skill+Liberation share per the site's pie chart. Raw totals: Basic 0 · Heavy 0 · Skill 51,975 ·
Liberation 1,247,527 · Intro 17,101 · Outro 14,209 · Echo 42,762.

**Damage profile — Hybrid role** (S0-S6 benchmark, 1-target, rotation 8.43s): 86.8% combined
Skill+Liberation. Raw totals: Basic 0 · Heavy 0 · Skill 27,851 · Liberation 443,125 · Intro 8,966 ·
Outro 7,577 · Echo 22,805.

**Sequence value — DPS role** (1-target, S0 = 100% baseline):
- S0: 1,373,574 DMG / 102,812 DPS (100.00%)
- S1: 1,563,489 DMG / 117,027 DPS (113.83%)
- S2: 1,854,632 DMG / 138,819 DPS (135.02%)
- S3: 2,241,048 DMG / 167,743 DPS (163.16%) — identical total to S4 (S3's own Lunar-Cycle DMG Amp
  doesn't further move this particular 1-target solo-calc number beyond what S4's Shield already set up)
- S4: 2,241,048 DMG / 167,743 DPS (163.16%)
- S5: 2,367,965 DMG / 177,242 DPS (172.39%)
- S6: 3,245,117 DMG / 231,794 DPS (225.45%)

**Sequence value — Hybrid role** (1-target, S0 = 100% baseline):
- S0: 507,953 DMG / 60,255 DPS (100.00%)
- S1: 619,800 DMG / 73,523 DPS (122.02%)
- S2: 777,054 DMG / 92,177 DPS (152.98%)
- S3: 926,039 DMG / 109,850 DPS (182.31%) — identical total to S4, same reasoning as the DPS-role case
- S4: 926,039 DMG / 109,850 DPS (182.31%)
- S5: 1,000,911 DMG / 118,732 DPS (197.05%)
- S6: 1,339,439 DMG / 158,889 DPS (263.69%)

**Synergies**:
- **Augusta**, **Yangyang: Xuanling**, **Jiyan** — best Hybrid-Iuno teammates: Iuno gives Augusta up to
  90% total DMG Amplification via the Full Moon Domain. Yangyang: Xuanling is actually a stronger pick
  than this Augusta pairing despite only getting 50% Heavy DMG Amp from Iuno's Outro, purely from her
  own huge base damage. Jiyan is also solid (uses the same Outro, pairs well with Ciaccona for a Mono
  Aero team).
- **Lynae**, **Ciaccona**, **Yinlin**, **Jianxin** — best buffers for Main-DPS Iuno. Lynae is generally
  best (unmatched generalist buffs, 40% total DMG Amp via her Outro). Ciaccona has no dedicated Outro
  buff for Iuno but brings solid personal damage, a fast rotation, and Aero DMG Bonus/RES Shred via her
  signature. Yinlin's Outro gives less DMG Amp than Jianxin's (25% vs 38%) but Yinlin still edges ahead
  via good Energy generation, solid personal damage, and a quick rotation. Jianxin is a fully viable
  F2P choice, especially at higher Sequences.
- **Phoebe**, **Zani**, **Galbrena** — Heavy Attack dealers who CAN receive Iuno's Outro, but each has a
  stronger dedicated teammate instead (Phoebe is best paired to buff Zani; Qiuyuan is best for
  Galbrena; Phoebe herself already has enough self-buffing that Phrolova outperforms Iuno as her 2nd
  buffer) — Iuno still works, just isn't optimal there.
- **Mornye**, **The Shorekeeper**, **Verina**, **Rover: Aero** — Iuno's own support options, all
  strong. Mornye synergizes specifically with Lynae (who applies Tune Rupture/Strain for Mornye to
  react to) — best choice generally when Lynae is present. Rover: Aero only beats Shorekeeper in
  Main-DPS-Iuno teams for general Aero buffs. Shorekeeper/Verina are the best generalist picks
  (DMG-Amp Outro, high ATK buffs, Shorekeeper also brings Crit buffs).

**Example Teams**:
1. **Yangyang: Xuanling + Augusta + Iuno + Chisa/Shorekeeper** (best team overall) — Chisa is only
   best-in-slot specifically alongside Yangyang: Xuanling; prioritize Shorekeeper when running Augusta
   instead.
2. **Iuno (Main DPS) + Lynae/Ciaccona + Yinlin/Jianxin/Mornye + Shorekeeper/Verina** — Mornye only
   best alongside Lynae; Rover: Aero only over Shorekeeper specifically with Ciaccona in the 2nd slot
   (otherwise use Shorekeeper; Ciaccona+Lynae together is also excellent).
3. **Jiyan + Iuno + Ciaccona + Rover: Aero + Shorekeeper**.
4. **Galbrena + Iuno + Shorekeeper + Verina**.
5. **Zani + Phoebe + Iuno + Rover: Spectro** (Frazzle team).
