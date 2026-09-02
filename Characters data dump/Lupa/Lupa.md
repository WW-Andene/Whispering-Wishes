# Lupa — Prydwen.gg source dump (cleaned)

5★ Fusion, Broadblade, Hybrid (dedicated Fusion team buffer with solid personal damage). Extended-
rotation buffer who leans on her Ultimate to trigger team-wide "Pack Hunt"/"Glory" buffs (35s, near-
permanent given her own rotation length), then builds toward her Forte Enhanced Skill (Dance With the
Wolf: Climax) via 2 "Wolfaith" stacks. Real-life last update: review Patch 2.4, calcs Patch 3.0, profile
20/August/2026.

## Kit

### Basic Attack — Flaming Star
- **Basic Attack**: up to 4 consecutive hits, Fusion DMG. After Stage 3, Normal Attack in time chains
  into Mid-air Attack Stage 1. After Dodge Counter/Basic Starfall/Shewolf's Hunt/Feral Fang, Normal
  Attack in time chains into Basic Stage 2.
- **Heavy Attack**: STA cost, Fusion DMG.
- **Heavy Attack - Wolf's Gnawing** (replaces Heavy Attack at 50 Wolflame): STA cost, Fusion DMG. Does
  NOT restore Wolflame; consumes 50 Wolflame, grants 1 Wolfaith.
- **Heavy Attack - Wolf's Claw** (replaces Heavy Attack at 50 Wolflame + 1 Wolfaith): STA cost, Fusion
  DMG. Same non-restore/consume/grant rule as Wolf's Gnawing. Chainable via Normal Attack right after
  Mid-air Attack: Firestrike or Wolf's Gnawing if the 50-Wolflame/1-Wolfaith condition is met then.
- **Mid-air Attack**: STA cost, up to 3 hits, Fusion DMG. The combo cycle never resets.
- **Mid-air Attack - Firestrike** (replaces Mid-air Stage 3 at 50 Wolflame): STA cost, Fusion DMG,
  considered Heavy Attack DMG. Same non-restore/consume/grant rule as the enhanced Heavy Attacks.
- **Plunging Attack**: hold Normal Attack airborne, STA cost, Fusion DMG. Normal Attack after chains
  into Basic Attack - Starfall. Also reachable via a Dodge during Mid-air Stage 3/Firestrike.
- **Basic Attack - Starfall**: Fusion DMG.
- **Dodge Counter**: post-Dodge Normal Attack, Fusion DMG.

**Multipliers (Lv.10):**
- Stage 1: 22.52% + 22.52% + 45.04%
- Stage 2: 90.08%
- Stage 3: 78.84% + 13.14%×6
- Stage 4: 73.87% + 73.87% + 49.25%×2
- Heavy Attack: 56.36% + 56.36%
- Heavy Attack - Wolf's Gnawing: 56.11% + 56.11%
- Heavy Attack - Wolf's Claw: 72.15% + 18.04%×4 + 96.19%
- Mid-air Stage 1: 76.73%
- Mid-air Stage 2: 77.23% + 19.31%×4
- Mid-air Stage 3: 28.48% + 28.48%
- Mid-air Attack - Firestrike: 28.48% + 28.48%
- Plunging Attack: 26.20% + 52.39% + 26.20%
- Basic Attack - Starfall: 12.65%×4 + 118.06%
- Dodge Counter: 34.18%×4 + 136.72%
- STA costs: Heavy Attack/Wolf's Gnawing/Wolf's Claw 25 each; Mid-air Attack 5; Plunging Attack 30;
  Mid-air Attack - Firestrike 30.

### Resonance Skill — Shewolf's Hunt / Feral Fang
- **Shewolf's Hunt**: hurls her Wildfire Banner, Fusion DMG, restores 15 Wolflame, marks the target 8s.
  After casting, a follow-up window opens for Feral Fang. Castable mid-air near the ground. Holding
  Skill instead leaps into the air, chaining into Mid-air Stage 1 on a timed Normal Attack.
- **Feral Fang**: locks onto the target, Fusion DMG, restores 15 Wolflame. DMG Multiplier vs marked
  targets +50%. Enters cooldown if not cast within the window or if Lupa is swapped out. Castable mid-air
  near the ground.

**Multipliers (Lv.10):** Shewolf's Hunt 140.77%; Feral Fang 313.61%. Cooldown 12s.

### Resonance Liberation — Fire-Kissed Glory
Attacks the target, Fusion DMG. Consumes all Wolfaith, restores 100 Wolflame. Basic Attack or Resonance
Skill shortly after chains into Resonance Skill - Foebreaker. Castable mid-air near the ground.

Strengthens the WHOLE TEAM for 35s:
- **Pack Hunt**: all team Resonators gain +6% ATK, and +10% Fusion DMG Bonus specifically against
  Overlord/Calamity-class targets (both non-stackable). With 3 Fusion Resonators on the team, the
  Overlord/Calamity Fusion DMG Bonus additionally +10%. Casting ANY teammate's Intro Skill enhances Pack
  Hunt, granting all Resonators another +6% ATK, up to +18% total (2 enhancements). If Lupa's Pack Hunt
  reaches its cap within its duration, she enters **Wild Hunt** and her Intro Skill is replaced by
  **Nowhere to Run!** (triggerable once per Pack Hunt).
- Active Resonator auto-recovers/is treated as having dodged if hit or launched airborne while grounded
  again — up to 3 times.

**Resonance Skill - Foebreaker**: consumes all Wolflame, Fusion DMG, enters **Burning Matchpoint**.
**Burning Matchpoint**: Normal Attacks restore +500% more Wolflame on hit (functionally moot since
Liberation already fully restores Wolflame); Shewolf's Hunt/Feral Fang can't be cast in this state.

**Multipliers (Lv.10):** Skill (Fire-Kissed Glory) 820.44%; Foebreaker 304.46%. Burning Matchpoint
duration 12s. Cooldown 20s; Resonance Cost 125; Concerto Regen 20.

### Forte Circuit — Ignis Lupa
**Wildfire Banner**: ATK +12% for 8s on casting any of: Feral Fang, Wolf's Gnawing/Wolf's Claw/Firestrike,
Fire-Kissed Glory, Dance With the Wolf/Dance With the Wolf: Climax.

- **Dance With the Wolf** (replaces Resonance Skill at 2 Wolfaith): consumes all Wolfaith, Fusion DMG,
  considered Resonance Liberation DMG. Castable mid-air near the ground.
- **Dance With the Wolf: Climax** (replaces Resonance Skill at 2 Wolfaith while in Burning Matchpoint):
  same consume/DMG-type rule, removes Burning Matchpoint on use. Castable mid-air near the ground.
- **Set the Arena Ablaze** (Resonance Skill slot): within 8s of casting Dance With the Wolf/Climax, Lupa
  stays on-field after swapping and backs up the incoming Resonator's own Resonance Liberation cast with
  a hit of her own, Fusion DMG, considered Resonance Skill DMG. Triggers once per that 8s window.
- **Wolflame** (cap 100): restored by landing Normal Attacks, casting Resonance Skill, casting Resonance
  Liberation.
- **Wolfaith** (cap 2): lasts 10s per stack (duration resets on refresh); each unused stack converts to
  50 Wolflame when its timer expires. Restored by casting Wolf's Gnawing/Wolf's Claw/Firestrike.

**Multipliers (Lv.10):**
- Dance With the Wolf: 56.02% + 42.02%×4 + 336.11%
- Dance With the Wolf: Climax: 75.63% + 56.72%×4 + 453.75%
- Set the Arena Ablaze: 42.35% + 169.40%

### Inherent Skills
- **Remember My Name**: after dashing 2.5s, enters Sprint — next Basic Attack becomes Basic Attack -
  Starfall. Increased interruption resistance during Wolf's Gnawing/Wolf's Claw/Firestrike.
- **Applause of Victory**: defeating a marked target resets Shewolf's Hunt's cooldown.
- **Resonance Liberation - Glory**: casting Fire-Kissed Glory grants **Glory** for 35s: all team
  Resonators' attacks ignore 3% target Fusion RES, +3% per OTHER Fusion team member (up to +9% total with
  2 others), and with 3 Fusion Resonators total, ignore an ADDITIONAL flat 6% (so up to 15% total Fusion
  RES Ignore at a full Fusion team).

### Intro Skill — Try Focusing, Eh? / Nowhere to Run!
- **Try Focusing, Eh?**: attacks the target, Fusion DMG. Normal Attack shortly after chains into Mid-air
  Stage 3.
- **Nowhere to Run!** (replaces Intro Skill only when Lupa is in Wild Hunt): removes Pack Hunt and Glory
  from the whole team, Fusion DMG, considered Resonance Liberation DMG.

**Multipliers (Lv.10):** Try Focusing, Eh? 29.76% + 42.16%×4; Nowhere to Run! 793.57% + 49.60%×4.
Concerto Regen 10 (each).

### Outro Skill — Stand by Me, Warrior
The incoming Resonator gains +20% Fusion DMG Amplification and +25% Basic Attack DMG Amplification for
14s or until they're switched out.

### Resonance Chain (S1-S6)
- **S1**: Casting Fire-Kissed Glory restores 10 Concerto Energy AND grants +20% Crit Rate for 10s. Gains
  interruption immunity when casting Dance With the Wolf: Climax.
- **S2**: Casting Fire-Kissed Glory, Wolf's Gnawing, Wolf's Claw, OR Firestrike grants the WHOLE TEAM
  +20% Fusion DMG Bonus for 30s, stacking up to 2 times.
- **S3**: Nowhere to Run!'s DMG Multiplier +100%. Fire-Kissed Glory's Pack Hunt no longer requires 3
  Fusion Resonators for its full effect. Fire-Kissed Glory's Glory effect is upgraded: additionally grants
  the WHOLE TEAM +15% Fusion RES Ignore for 35s (replacing/modifying the base scaling version).
- **S4**: Dance With the Wolf: Climax's DMG Multiplier +125%.
- **S5**: Casting Intro Skill (Try Focusing, Eh? OR Nowhere to Run!) grants +15% Resonance Liberation DMG
  Bonus for 10s.
- **S6**: Dance With the Wolf: Climax, Fire-Kissed Glory, AND Nowhere to Run! all ignore 30% target DEF.
  Feral Fang restores 100 Wolflame on hit (once per 20s). Forte Circuit's Dance With the Wolf is replaced
  by Dance With the Wolf: Climax even OUTSIDE Burning Matchpoint (castable any time). Casting Nowhere to
  Run! no longer ends Pack Hunt/Glory.

### Minor Fortes (Total)
Crit Rate +8%, ATK% +12%.

### Base Stats (Lv.90, incl. minor fortes)
HP 11913 | ATK 388 | DEF 1186 | Max Energy 125 | Crit Rate 5% | Crit DMG 150% | Healing Bonus 0% |
Fusion DMG Bonus 0%.

## Review

**Hybrid tier**: **T0.5** (ToA, standard) / **T1** (WW, standard) — **T1** (ToA, Value list) / **T1** (WW,
Value list).

**Pros**
- Very easy to use: 3 free auto-dodges per rotation, easy Forte/Concerto buildup.
- Very strong Fusion team buffs while retaining good personal damage.
- Good non-limited weapon options — clears well without heavy investment.
- Evenly spread damage with good AoE, valuable in Whimpering Wastes (even where some of her conditional
  DMG Bonuses don't apply, it barely matters).
- Lots of exploitable Swap Cancel windows, straightforward kit — accessible to any skill level.

**Cons**
- Nearly locked to mono-Fusion compositions; competes directly with top-tier Sanhua outside them.
- Long field time despite being a buffer — awkward with short-cooldown supports (Shorekeeper/Verina).
- Outro expires on swap despite wanting the 3rd slot and having many swap-cancel windows — quickswapping
  her is only worth it if played precisely.
- Ideally wants a full 3-Fusion-damage-dealer team (including herself), unlike hypercarry comps — real
  extra investment cost just to match top tiers, before even outperforming them.

**Review summary**: Dedicated Fusion team buffer with an extended rotation whose buffs last equally long
(35s), making mono-Fusion team rotations viable despite their length. Her Ultimate (Fire-Kissed Glory) is
the core of her kit: costs 125 Energy on a 20s cooldown (never bottlenecked), fully restores Wolflame,
and triggers team-wide Pack Hunt (+6% ATK, scaling to +18% via 2 teammate Intro casts; +10-20% Fusion DMG
Bonus vs Overlord/Calamity targets depending on Fusion-character count) and Glory (+3-15% Fusion RES
Ignore, same team-composition scaling) for 35s — both essentially permanent given team rotation length,
though they reset when Lupa starts her NEXT rotation via Nowhere to Run!. Fully-enhanced Pack Hunt (2
Intro casts) triggers Wild Hunt, unlocking Nowhere to Run! (a big Liberation-type burst that removes both
buffs on cast). Post-Ultimate, Foebreaker (via Basic/Skill follow-up) sets up Mid-air Attacks; by the
third Mid-air hit she has enough Wolflame for Firestrike, then Wolf's Claw, generating the 2 Wolfaith
needed for her real damage/rotation-ending move, Dance With the Wolf: Climax (the non-Burning-Matchpoint
version is essentially never used — its weaker damage isn't worth staying on-field longer). Her Outro
(Stand by Me, Warrior) amplifies the incoming Resonator's Fusion DMG +20% and Basic Attack DMG +25% for
14s (forfeit on swap). A pseudo-Coordinated-Attack (Set the Arena Ablaze) triggers automatically whenever
a teammate casts THEIR Ultimate within 8s of Lupa's own Forte Enhanced Skill — usually only 1 real trigger
per rotation outside Quickswap play, given her Outro's swap-forfeit nature. Real strength is enabling a
brand-new mono-Fusion archetype (Changli-Brant-Lupa, or Aemeath/Galbrena/Encore-centered variants) where
Lupa buffs the whole team while 1-2 other Fusion damage dealers do the heavy lifting — she is also
notably strong specifically with Encore (short-rotation downtime lines up well with Lupa's own length,
enabling a good F2P Encore-Lupa-Verina/Shorekeeper team even outside full mono-Fusion comps) despite
competing there with Sanhua (Lupa wins on raw buff strength + personal damage at comparable field-time
cost in that specific pairing).

## Build

**Best Weapons** (calculated with Aemeath + Everbright Polestar/Trailblazing Star set + Sigillum, and
Mornye + Discord/Halo of Starry Radiance set + Reactor Husk as teammates):
1. **Wildfire Mark (signature, R1)** — 100.00%. ATK+12%. Intro/Liberation cast: +24% Liberation DMG
   Bonus (6s); a Heavy Attack DMG hit during that window extends it +4s (once) AND grants the WHOLE TEAM
   +24% Fusion DMG Bonus for 30s (same-name non-stacking). Stats: ATK 587, Crit DMG 48.6%. Best by a wide
   margin — high stats plus a real team-wide Fusion DMG buff.
2. **Ages of Harvest** — 87.00%. Attribute DMG+12%. Intro cast grants +24% Resonance Skill DMG Bonus
   (12s); Resonance Skill cast grants another +24% Resonance Skill DMG Bonus (12s). Stats: ATK 587, Crit
   Rate 24.3%. Mostly a Crit Rate/ATK stick — the Skill DMG buff only covers Foebreaker (~1/8 of her real
   damage), so good but not the strongest.
3. **Kumokiri** — 86.70%. ATK+12%. Intro cast or inflicting Negative Statuses grants +8% Liberation DMG
   Bonus (stacks ×3, 15s); at max stacks, teammates inflicting Negative Statuses grant +24% All-Attribute
   DMG Bonus (15s, same-name non-stacking). Stats: ATK 500, Crit Rate 36%. Good alternative if Wildfire
   Mark isn't owned — big Crit Rate at slightly lower ATK.
4. **Verdant Summit** — 84.60%. Resonance Attribute DMG+12%. Intro/Liberation cast grants +24% Heavy
   Attack DMG Bonus (stacks ×2, 14s). Stats: ATK 587, Crit DMG 48.6%. Mostly Crit DMG/ATK stick — only
   buffs Wolf's Claw (~1/16 of her damage).
5. **Thunderflare Dominion** — no clear %, listed as a simple ATK/Crit Rate stick; she doesn't benefit
   from its Heavy-Attack-focused passives.
6. **Radiance Cleaver (best permanent option)** — 80.50%. ATK+12%. Damaging a Tune-Strain-Interfered
   target grants +24% Liberation DMG Bonus (3s, refreshable). Good ATK/Crit DMG stick.
7. **Lustrous Razor (Standard Banner)** — 75.00%. ER+12.8%. Resonance Skill cast grants +7% Liberation
   DMG Bonus (stacks ×3, 12s). A rare case where the Standard Banner weapon is genuinely strong on her —
   real ER need plus a real Liberation DMG buff she can access.
8. **Waning Redshift (R5, best 4★)** — 74.80%. Resonance Skill cast: +10 flat Energy, +20% ATK (16s,
   20s ICD). Eases her real Energy Regen requirement.
9. **Aureate Zenith (R5, Battle Pass)** — 73.10%. Liberation cast: +23% ATK, +34.5% Heavy Attack DMG
   Bonus (15s). Barely benefits from the Heavy ATK portion; lower Base ATK holds it back.
10. **Autumntrace (R5, Battle Pass)** — 68.50%. Basic/Heavy ATK DMG grants +12.8% ATK (stacks ×5, 7s,
    1/s trigger). Hard to stack since she deals mostly Liberation DMG.
11. **Meditations on Mercy (R5, best F2P)** — best fully F2P-accessible option; recommend pulling for
    Lustrous Razor once accessible.

**Best Echo Set**: **Flaming Clawprint** (100.00%). 2pc +10% Fusion DMG. 5pc: Liberation cast grants the
WHOLE TEAM +15% Fusion DMG Bonus AND the caster +20% Liberation DMG Bonus, both 35s (near-permanent given
her rotation). Her dedicated best set — boosts her primary damage type immediately on her own Ultimate
while providing team-wide support, matching her typical Fusion-DPS pairings.
- Main Echo option: **Lioness of Glory** — a strong summon-type Echo (82.08% + 191.52% Fusion DMG,
  usable anywhere in her rotation), plus +12% Fusion DMG Bonus and +12% Liberation DMG Bonus in the main
  slot — best choice for her.

**Best Echo Stats**: 4-cost Crit Rate/Crit DMG · 3-cost Fusion DMG · 3-cost Fusion DMG/ATK% · 1-cost
ATK%×2.
**Substat priority**: Energy Regen (until satisfied) > Crit Rate = Crit DMG > ATK% > ATK > Liberation DMG%.

**Best Endgame Stats (Lv.90)**: HP 16000+ | DEF 1100+ | ATK 1800-2500+ | Crit Rate 65-80%+ | Crit DMG
215-260%+ | Energy Regen 115-130%+ (lower end estimated with Changli+Brant, higher end with
Encore+Shorekeeper) | Fusion DMG Bonus 50-80%+.

**Skill Priority**: Resonance Liberation > Intro Skill > Forte Circuit > Basic Attack > Resonance Skill.
Skill can be skipped when leveling to save resources at minimal damage loss.

## Gameplay and Teams

**Damage profile** (1-target scenario, computed from the raw per-category numbers, which sum exactly to
the S0 sequence total of 393,401 — the page's own pie-label percentages didn't cleanly map to categories
in extraction order, so recomputed directly): Basic ~5.1% · Heavy ~6.5% · Skill ~11.4% · Liberation ~72%
· Echo ~5% (Basic 19,965 · Heavy 25,687 · Skill 44,978 · Liberation 283,095 · Intro 0 · Outro 0 · Echo
19,676).

**Rotation time**: 8.14s (1-target scenario, S0-S6 benchmark team). Calculations assume Lupa is on her
2nd rotation or later (several of her buffs — 5pc Flaming Clawprint, Wildfire Mark's own passive, S2
Fusion DMG Bonus, S3 Fusion RES Shred — aren't accessed on the very first rotation, and her Enhanced
Intro, Nowhere to Run!, isn't castable on rotation 1 either).

**Opener Rotation** (no Intro Skill available — used when she opens the team's rotation, e.g. best-team
context): Skill: Shewolf's Hunt → Ultimate → Skill: Foebreaker (Basic or Skill shortly after Ultimate) →
Mid-air Attack 1 → Mid-air Attack 2 → Mid-air Attack: Firestrike (Basic after Mid-air 2) → Heavy: Wolf's
Claw (Basic after Firestrike) → Forte: Skill: Dance With the Wolf - Climax → Outro.

**Loop Rotation** (Intro Skill available): Intro → Ultimate → Skill: Foebreaker → Mid-air Attack 1 →
Mid-air Attack 2 → Mid-air Attack: Firestrike → Heavy: Wolf's Claw → Forte: Skill: Dance With the Wolf -
Climax → Outro.

Echo usage (both rotations): a Summon Echo (e.g. Lioness of Glory) at any point in the rotation; a
Transform Echo (e.g. Nightmare: Inferno Rider) right after her Forte Skill, or before the rotation starts.

Notes on real-game rotation mechanics:
- 3 free auto-dodges after Ultimate cast, plus interruption resistance on Wolf's Claw/Firestrike — she
  should essentially never be interrupted if this rotation is followed consistently.
- Most of her skills take ~1s+ to cast, giving generous swap-in/out windows with little field-time cost.
- Real swap-cancel windows: Skill: Foebreaker, Mid-air Attack 2, Mid-air Attack: Firestrike, Heavy:
  Wolf's Claw, Forte: Skill: Dance With the Wolf - Climax.
- Set the Arena Ablaze (the pseudo-Coordinated-Attack) triggers whenever a teammate casts THEIR Ultimate
  within 8s of Lupa's own Forte Skill cast — time her Forte Skill/Outro near a teammate's own big hits to
  capitalize on it, though its damage is modest and fine to forfeit if inconvenient.
- Swapping out mid-Mid-air-Attack-2/Firestrike leaves her airborne — the combo progress never resets, so
  this is safe to interrupt for a teammate's own combo timing.

**Sequence value** (1-target scenario, S0-S6 benchmark team, S0 = 100% baseline):
- S0: 393,401 DMG / 48,329 DPS (100.00%)
- S1: 453,404 DMG / 55,701 DPS (115.25%)
- S2: 524,086 DMG / 64,384 DPS (133.22%)
- S3: 672,187 DMG / 82,578 DPS (170.87%)
- S4: 807,401 DMG / 99,189 DPS (205.24%)
- S5: 838,625 DMG / 103,025 DPS (213.17%)
- S6: 963,386 DMG / 118,352 DPS (244.89%)

**Synergies**:
- **Aemeath, Mornye, Galbrena, Brant, Changli, Encore** — all strong partners since she's a dedicated
  Fusion buffer, though she works well with any Fusion damage dealer. Aemeath/Mornye are both generalist
  Fusion buffers, elevating any strong-baseline Fusion DPS paired with Lupa (Aemeath additionally pairs
  with Denia for Fusion Burst). Aemeath and Galbrena have the highest baseline Fusion damage, making them
  ideal Lupa/Mornye recipients. Brant and Encore fully leverage her Outro. Changli buffs Lupa or Aemeath
  via her own Outro, enabling several strong mono-Fusion team shapes with Lupa as the central enabler.

**Example Teams**:
1. **Best Team**: Aemeath/Galbrena/Brant/Encore + Lupa + Denia/Mornye/Changli — Denia only viable
   alongside Aemeath specifically in Fusion Burst mode; Changli only rivals Mornye in certain Quickswap
   comps and is generally the weaker pick for most players (requires precise Outro-buff timing).
2. **Classic Mono Fusion**: Aemeath/Changli/Galbrena/Encore/Brant + Lupa.
3. **Chixia Best Team**: Chixia + Brant + Lupa.
4. **Encore F2P Team**: Encore + Lupa + Shorekeeper/Chixia — rotate Lupa first with Chixia on the team,
   otherwise rotate Shorekeeper first.
