# Ciaccona — Prydwen.gg source dump (cleaned)

5★ Aero, Pistols, Hybrid (viable Main DPS). Very short-rotation off-field/on-field hybrid who applies
Aero Erosion (and, via her Ultimate, Spectro Frazzle too), buffs team Aero DMG via Solo Concert, and
keeps dealing off-field damage after her Ultimate via a repeating "Recital" singing state. Real-life
last update: review Patch 2.4, calcs Patch 3.0, profile 20/August/2026.

## Kit

### Basic Attack — Quadruple Time Steps
- **Basic Attack**: up to 4 consecutive hits, Aero DMG. Stage 4 inflicts 1 Aero Erosion stack. Dodging
  during Stages 1-3 doesn't reset the combo — pressing Basic Attack in time resumes it at the correct
  stage.
- After Basic Stage 4, Ciaccona starts a **Solo Concert**: she (or an Ensemble Sylph) grants +24% Aero
  DMG Bonus to all nearby team Resonators (not stackable) for as long as it's active.
- **Ensemble Sylph**: up to 2 may exist at once. If Basic Stage 4 is interrupted, the generated Sylph
  finishes the attack for her AND enters Solo Concert. If Solo Concert itself is interrupted, the Sylph
  continues Solo Concert. If interrupted specifically by Resonance Skill instead, the Sylph just
  finishes the current attack WITHOUT entering Solo Concert.
- **Heavy Attack**: STA cost, jumps into mid-air, Aero DMG.
- **Aimed Attack**: hold Aim to fire charged shots, Aero DMG, counted as Heavy Attack DMG.
- **Mid-air Attack**: STA cost, up to 2 hits, Aero DMG. Normal Attack after Stage 2 chains into Basic
  Stage 4 — the core of her Jump-cancel loop (see Gameplay).
- **Dodge Counter**: post-Dodge Normal Attack, Aero DMG.

**Multipliers (Lv.10):**
- Stage 1: 57.06%
- Stage 2: 48.91% + 24.46%×2 + 65.21%
- Stage 3: 33.02%×4
- Stage 4: 61.14%×4
- Heavy Attack: 107.60%
- Aimed Shot: 32.61%; Fully Charged Aimed Shot: 73.37%
- Mid-air Stage 1: 55.43%×2; Mid-air Stage 2: 24.46%×4
- Dodge Counter: 57.17%×4
- Heavy Attack STA cost 25; Mid-air Stage 1/2 STA cost 15 each.

### Resonance Skill — Harmonic Allegro
Dashes a distance, Aero DMG, inflicts 1 Aero Erosion stack on hit. Normal Attack shortly after chains
into Basic Stage 2. Interrupting Basic Attack/Heavy Attack/Mid-air Attack/Solo Concert with this skill
generates an Ensemble Sylph. Castable mid-air.

**Multipliers (Lv.10):** 40.39%×4. Cooldown 10s. Concerto Regen 15.

### Resonance Liberation — Singer's Triple Cadenza / Recital
Ciaccona and her Ensemble Sylphs perform an Improvised Symphonic Poem together — one AoE Aero DMG hit
to nearby targets — and enter **Recital**.

**Recital**: sound waves periodically radiate around her; timing a green/yellow button press against the
circle indicator generates a matching **Symphonic Poem: Tonic** and recovers Concerto Energy. Switching
to another Resonator doesn't end Recital — it auto-generates a Tonic matching the last-used color (green
by default if no input was given yet). While in Recital, Ciaccona is interruption-immune and takes 50%
less DMG. Ensemble Sylphs can directly grant the Solo Concert Aero DMG Bonus during Recital. Exits via
pressing Liberation again or switching her back onto the field.

- **Green Tonic**: Aero DMG to nearby targets, inflicts Aero Erosion.
- **Yellow Tonic**: Aero DMG to nearby targets, inflicts Spectro Frazzle.

**Multipliers (Lv.10):**
- Improvised Symphonic Poem (initial hit): 1100.42%
- Symphonic Poem: Tonic: 6.12%×20
- Cooldown 20s; Resonance Cost 125; Concerto Regen 20; Successful Interaction Concerto Regen 10 (each).

### Resonance Chain (S1-S6)
- **S1**: Casting Harmonic Allegro grants 3s interruption immunity. Casting Basic Attack (any stage)
  increases ATK +35% for 10s.
- **S2**: During Singer's Triple Cadenza (Liberation/Recital), the WHOLE TEAM gains +40% Aero DMG Bonus.
- **S3**: Casting Basic Stage 4 additionally grants 1 Musical Essence segment. Harmonic Allegro gains 1
  more charge.
- **S4**: Ignores 45% target DEF when dealing Heavy Attack (Quadruple Downbeat) DMG. Ignores 45% target
  DEF when dealing Resonance Liberation DMG.
- **S5**: +40% Resonance Liberation DMG Bonus. DMG taken by Resonators within/around Singer's Triple
  Cadenza's range is reduced -30%.
- **S6**: While in Solo Concert, Ciaccona OR an Ensemble Sylph deals Aero DMG equal to 220% of her ATK to
  nearby targets, considered Resonance Liberation DMG.

### Minor Fortes (Total)
Crit DMG +16%, ATK% +12%.

### Base Stats (Lv.90, incl. minor fortes)
HP 12238 | ATK 375 | DEF 1198 | Max Energy 125 | Crit Rate 5% | Crit DMG 150% | Healing Bonus 0% |
Aero DMG Bonus 0%.

### Forte Circuit — Symphony of Wind and Verse
- **Heavy Attack - Quadruple Downbeat** (replaces Heavy Attack at 3 Musical Essence segments): consumes
  all Musical Essence, shoots Downbeat Notes forward, Aero DMG, pulls in nearby targets, inflicts 1 Aero
  Erosion stack. Castable mid-air near the ground.
- **Musical Essence**: cap 3 segments. Basic Stage 4 or Intro Skill each recover 1 segment.

**Multipliers (Lv.10):** Quadruple Downbeat: 31.41%×10 + 314.03%. Concerto Regen 25.

### Inherent Skills
- **Interlude Tune**: casting Singer's Triple Cadenza grants a Shield = 100% of her Max HP for 4s.
  Switching her out removes the Shield.
- **Winds of Rinascita**: Quadruple Downbeat's DMG Multiplier +30%.

### Intro Skill — Roaming with the Wind
Attacks the target, Aero DMG, inflicts 1 Aero Erosion stack. Normal Attack shortly after chains into
Basic Stage 3 (skips Stages 1-2 entirely).

**Multipliers (Lv.10):** 189.11%. Concerto Regen 10.

### Outro Skill — Windcalling Tune
Aero Erosion DMG dealt to targets near the active Resonator is Amplified +100% for 30s.

## Review

**Hybrid tier**: **T0.5** (ToA, standard) / **T1** (WW, standard) — **T1.5** (ToA, Value list) / **T1.5**
(WW, Value list).

**Pros**
- Quick rotation with great damage output; refreshing compared to longer-rotation Hybrids — viable as a
  strong Main DPS too, particularly in AoE (Whimpering Wastes).
- Applies both Spectro Frazzle AND Aero Erosion, buffs Aero DMG via Solo Concert/Gusts of Welkin/her
  Signature — fits many team compositions.
- DOT contributes real off-field damage for once, including her small singing-wave hits.
- Aero Erosion/Spectro Frazzle from her Ultimate apply repeatedly off-field, even across multiple waves.
- Dodges don't reset her Basic Attack combo — rotation is interruption-tolerant.
- High skill ceiling (cancel/optimization potential) but a solid floor too.
- Low sequence value — S0 is already close to full potential (can be seen as a con if you value dupes).

**Cons**
- May need 2 separate Echo Sets to access her full team flexibility (Gusts of Welkin only in Aero teams,
  Moonlit Clouds for general use).
- A lot of her potential is locked behind her Signature weapon, specifically in Aero teams or as Main
  DPS.
- Sings during her Ultimate (aesthetic complaint, no mechanical weight).

**Review summary**: Applies Aero Erosion (and via Ultimate, Spectro Frazzle) while buffing Aero DMG and
retaining real off-field damage presence, similar in spirit to a Coordinated Attacker despite not being
one. Core combo: only Basic Stage 3-4 matter (1-2 are skipped via Intro/rarely used); Stage 4 is
routinely interrupted via a Jump to spawn an Ensemble Sylph (permanent-uptime-equivalent Solo Concert
buff since 2 Sylphs can exist at once and Stage 4 completes for free even when cancelled) AND to chain
into Mid-air Attack 1→2→Basic Stage 4 again for rapid re-triggering. This Jump-cancel loop is central to
both her Main DPS and Sub DPS rotations. Basic Stage 4 serves 3 purposes: charges 1 of 3 Musical Essence
segments, activates Solo Concert, and applies 1 Aero Erosion stack while generating Concerto Energy. At 3
Musical Essence (1 from Intro + 2 from two Basic Stage 4 casts) she unlocks Quadruple Downbeat — big
damage, 25 Concerto Energy, pulls in enemies, +1 more Erosion stack. Her Ultimate enters Recital: a
singing state that persists even off-field, firing a Symphonic Poem: Tonic wave roughly every 1.6s
(manual or automatic), toggleable between Aero Erosion (green, default) and Spectro Frazzle (yellow)
almost instantly. Her Outro amplifies all Aero Erosion DMG +100% for 30s, making her off-field Erosion
presence genuinely strong, especially alongside Aero Rover (Erosion cap 3→6). Best synergy is Cartethyia
(Ciaccona's low field time + multi-wave off-field Erosion application perfectly complements Cartethyia's
high field time and Erosion-hungry kit) — considered one of the strongest pairings in the game. Also a
strong Main DPS with Sanhua (massive Basic ATK DMG Amp + fast rotation lets Ciaccona chain Basic
Stage-4/Quadruple-Downbeat repeatedly, accessing it 2-3× per rotation). Strong with Absolution Phoebe in
Whimpering Wastes specifically (the only real Frazzle partner that can sustain Phoebe across multiple
enemy waves) and a solid Zani Frazzle-support alternative to Spectro Rover alone.

## Build

**Best Weapons** (calculated with Cartethyia + Defier's Thorn/Windward Pilgrimage set + Reminiscence:
Fleurdelys, and Rover: Aero + Bloodpact's Pledge/Windward Pilgrimage set + Reminiscence: Fleurdelys as
teammates):
1. **Woodland Aria (signature, R1)** — 100.00%. ATK+12%. Inflicting Aero Erosion grants +24% Aero DMG
   Bonus (10s); hitting an Erosion target reduces their Aero RES -10% (20s, same-name non-stacking).
   Stats: ATK 500, Crit Rate 36%. Best overall, personally AND for the team — the Aero RES Shred is
   especially valuable in Aero teams.
2. **Phasic Homogenizer** — 86.90%. ATK+12%. Any teammate's Tune Break skill cast grants +20% All-
   Attribute DMG Bonus (14s). Stats: ATK 587, Crit DMG 48.6%. Excellent generalist permanent weapon,
   close to signature-tier for most accounts; better than Static Mist in teams that don't benefit from
   its ATK buff (e.g. Cartethyia's team).
3. **Lux & Umbra** — 82.80%. ATK+12%. Echo Skill DMG grants +24% Heavy Attack DMG Amp (6s); Heavy Attack
   DMG grants +24% Echo Skill DMG Amp (6s), each capped at 24%; both active together also ignores 8%
   target DEF. Stats: ATK 587, Crit DMG 48.6%. Best paired with Reminiscence: Fleurdelys — solid gain
   from the Heavy Attack Amp + DEF Ignore near the end of her rotation.
4. **Spectrum Blaster** — 78.80%. ATK+12%. Extra Basic ATK DMG + Crit Rate/ATK, but she can't trigger the
   party-wide Tune Rupture/Strain proc — worse than the permanent banner options.
5. **The Last Dance** — 77.00%. ATK+12%. Intro/Liberation cast grants +48% Resonance Skill DMG Bonus
   (5s). Stats: ATK 500, Crit DMG 72%. Skill DMG is a negligible share of her damage, so mostly an
   ATK/Crit DMG stat-stick, but a good one thanks to her short rotation reliably retriggering it.
6. **Static Mist** — 69.90%. ER+12.8%. Outro cast grants the incoming Resonator +10% ATK (14s, 1 stack).
   Stats: ATK 587, Crit Rate 24.3%. One of the 2 best permanent options; can outclass Phasic Homogenizer
   in ATK-scaling teams via its team-buffing passive.
7. **Romance in Farewell (R5, F2P craftable)** — best F2P/no-gacha option. Damaging Negative-Status
   enemies grants +8% ATK (10s, up to 4 stacks, 1/s trigger) — synergizes with her constant Erosion
   application.

**Best Echo Sets**:
- **Gusts of Welkin** (100.00%, Aero teams only): 2pc +10% Aero DMG. 5pc: inflicting Aero Erosion grants
  +15% Aero DMG to the whole team, +15% MORE to the applier, 20s. Best when an Aero Main DPS is on the
  team; use Moonlit Clouds otherwise.
  - Main Echo: **Nightmare: Kelpie** — free Aero DMG on Outro cast, +12% Aero DMG Bonus in the main slot;
    best main-slot pick by a small margin over Reminiscence: Fleurdelys (use Fleurdelys instead if
    running Lux & Umbra).
- **Moonlit Clouds** (75.35%, best for all non-Aero teams): 2pc +10% Energy Regen. 5pc: Outro cast grants
  the next Resonator +22.5% ATK (15s). Trades her own personal damage for stronger single-target buffing.
  - Main Echo: **Impermanence Heron** — the only real 5pc option, +12% DMG Bonus on top of the ATK boost,
    restores Energy on hit; best used before her rotation starts (or instantly Dash-cancelled) so only
    the swap-out buff applies, not the cast time/Energy.
- **Windward Pilgrimage** (special case, Main DPS Ciaccona): 2pc +10% Aero DMG. 5pc: hitting an
  Erosion-afflicted target grants +10% Crit Rate and +30% Aero DMG Bonus (10s). Best for Aero Main DPS
  builds specifically.

**Best Echo Stats**: 4-cost Crit Rate/Crit DMG · 3-cost Aero DMG · 3-cost Aero DMG/ATK% · 1-cost ATK%×2.
**Substat priority**: Energy Regen (until satisfied) > Crit Rate = Crit DMG > ATK% > ATK.

**Best Endgame Stats (Lv.90)**: HP 16500+ | DEF 1150+ | ATK 2000-2200+ | Crit Rate 55-80%+ | Crit DMG
225-280%+ | Energy Regen 115%+ | Aero DMG Bonus 30-80%+.

**Skill Priority**: Resonance Liberation > Basic Attack > Forte Circuit > Intro Skill > Resonance Skill.
Skill and Intro can be skipped when leveling to save resources at minimal damage loss.

## Gameplay and Teams

**Damage profile** (1-target scenario): Basic 18.2% · Heavy 17% · Skill 8.3% · Liberation 20.2%
(1/3 rounding note on the pie label) · Intro (bundled) · Echo 28.1% (Basic 43,686 · Heavy 40,925 · Skill
9,370 · Liberation 67,722 · Intro 10,561 · Outro 0 · Echo 19,863 · Debuff/Erosion 48,496).

**Rotation time**: 4.5s (1-target scenario). Post-S3 (extra Harmonic Allegro charge): 4.12s.

**Basic Rotation**: Intro → Basic P3 → Basic P4 → Jump (cancel Basic P4) → Mid-air P1 → Mid-air P2 →
Basic P4 → Skill (cancel Basic P4) → Forte: Heavy Attack (Quadruple Downbeat) → Ultimate: Improvised
Symphonic Poem (cancel the Forte Heavy once it lands) → (optional) Symphonic Poem: Tonic, switch to
Spectro Frazzle if needed → Outro.

**No-Intro Rotation** (when Intro is ceded to another teammate): Skill → Basic P2 → Basic P3 → Basic P4 →
Jump (cancel) → Mid-air P1 → Mid-air P2 → Basic P4 → Jump (cancel) → Mid-air P1 → Mid-air P2 → Basic P4 →
Skill (cancel) → Forte: Heavy Attack → Ultimate (cancel Forte Heavy on hit) → (optional) Tonic → Outro.

**Main DPS Rotation** (with Sanhua): Skill (optional, timed to Sanhua's own Forte Heavy swap-out) → Intro
→ Basic P3 → Basic P4 → Jump (cancel) → Mid-air P1 → Mid-air P2 → Basic P4 → Forte: Heavy Attack → Jump →
Mid-air P1 → Mid-air P2 → Basic P4 → Jump (cancel) → Mid-air P1 → Mid-air P2 → Basic P4 → Jump (cancel) →
Mid-air P1 → Mid-air P2 → Basic P4 → Skill (cancel) → Forte: Heavy Attack → Ultimate (cancel on hit) →
Outro. In a perfect scenario one more Mid-air P1+P2+Basic P4 cycle fits before Ultimate, though not every
real rotation allows it (enemy attacks can slow this down). She should not stay on-field longer than 14s
total.

Notes on real-game rotation mechanics:
- Echo timing: use Impermanence Heron BEFORE her rotation starts; use Reminiscence: Fleurdelys at any
  point during her rotation, ideally once her buffs are fully stacked.
- Basic Stage 4's Jump-cancel is central: it spawns an Ensemble Sylph (near-permanent Solo Concert
  uptime, since up to 2 Sylphs can exist and the interrupted Stage 4 still completes for free) AND puts
  her airborne to chain Mid-air Attack 1→2→Basic Stage 4 again rapidly. Cancelling Stage 4 with Skill
  specifically does NOT trigger Solo Concert (only the Jump-cancel/interrupted-and-finished-by-Sylph path
  does).
- Recital (Ultimate) persists off-field and keeps firing Symphonic Poem: Tonic waves roughly every 1.6s,
  manually-timed or automatic — switching mode (Aero Erosion ↔ Spectro Frazzle) is near-instant.

**Sequence value** (1-target scenario, S0-S6 benchmark team, S0 = 100% baseline):
- S0: 364,200 DMG / 80,933 DPS (100.00%)
- S1: 408,727 DMG / 90,828 DPS (112.23%)
- S2: 436,338 DMG / 96,964 DPS (119.81%)
- S3: 406,864 DMG / 99,235 DPS (122.61%) — DPS rises despite total DMG dropping vs. S2, since S3's extra
  Harmonic Allegro charge shortens her rotation time (4.5s → 4.12s post-S3).
- S4: 469,863 DMG / 114,601 DPS (141.60%)
- S5: 495,829 DMG / 120,934 DPS (149.42%)
- S6: 592,738 DMG / 131,720 DPS (162.75%)

**Synergies**:
- **2nd/3rd slot (Aero/Erosion-focused)**: Cartethyia (her single best partner — Ciaccona's low field
  time + multi-wave off-field Erosion perfectly complements Cartethyia's high field time and
  Erosion-hungry kit), Sigrika, Iuno, Jiyan — universal Aero DMG buffs, Aero RES Shred via her Signature,
  solid personal damage, quick rotation.
- **Spectro Frazzle teams**: Phoebe (the only real partner that lets Absolution Phoebe function in
  Whimpering Wastes, via multi-wave off-field Frazzle), Zani (fine alternative to Spectro Rover alone,
  lets Zani extend to 3 Nightfall casts instead of 2 — though something else usually outclasses her here
  outside the Phoebe/WW case specifically).
- **Main DPS enabler**: Sanhua — best option by far (38% Basic ATK DMG Amp, good ATK%/DMG% via S6/Echo
  sets, very fast rotation maximizing Ciaccona's field time).
- **3rd-slot generalist supports**: Chisa and Rover: Aero (both raise Aero Erosion's cap to 6 in
  Cartethyia teams; Aero Rover also pairs with Main DPS Iuno for general Aero buffs), Rover: Spectro
  (with Zani/Phoebe for more Frazzle application), Shorekeeper and Verina (best generalist picks).

**Example Teams**:
1. **Best Team**: Sigrika + Qiuyuan + Ciaccona.
2. **Cartethyia Team**: Cartethyia + Ciaccona + Chisa/Rover: Aero/Shorekeeper — Chisa only beats Aero
   Rover with her own signature; Shorekeeper mostly used in Whimpering Wastes since Erosion can't ramp to
   6 stacks in time there.
3. **Jiyan Iuno Dual DPS**: Jiyan + Iuno + Ciaccona.
4. **Other Aero Teams**: Iuno + Sigrika + Jiyan + Ciaccona + Rover: Aero. (Iuno + Lynae + Ciaccona is one
   of DPS Iuno's strongest teams overall if available, exceeding these listed teams.)
5. **Spectro Frazzle Teams**: Phoebe + Zani + Ciaccona + Rover: Aero/Shorekeeper — Shorekeeper mainly
   useful on DPS Phoebe's Whimpering Wastes team specifically.
6. **Main DPS Ciaccona**: Ciaccona + Lynae + Sanhua/Mornye/Chisa/Shorekeeper.
