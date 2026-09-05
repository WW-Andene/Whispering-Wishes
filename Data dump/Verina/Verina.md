# Verina — Prydwen.gg source dump (cleaned)

5★ Spectro, Rectifier, Generalist Support (healer/buffer). One of the shortest rotations in the game —
swap in, quick Basic Attacks, Skill, Ultimate, dump Forte stacks, Outro. Buffs are near-permanent uptime
team-wide ATK/All-Type DMG Amplify plus real healing. Real-life last update: review Patch 2.1, calcs
Patch 2.2, profile 20/August/2026.

## Kit

### Basic Attack — Cultivation
- **Basic Attack**: up to 5 consecutive vine attacks, Spectro DMG.
- **Heavy Attack**: STA cost, charges forward, Spectro DMG.
- **Mid-air Attack**: STA cost, up to 3 hits, Spectro DMG.
- **Mid-air Heavy Attack**: hold Basic Attack airborne, STA cost, Plunging Attack, Spectro DMG.
- **Dodge Counter**: post-Dodge Basic Attack, Spectro DMG.

**Multipliers (Lv.10):**
- Part 1: 37.86%
- Part 2: 51.16%
- Part 3: 25.58%×2
- Part 4: 67.32%
- Part 5: 71.62%
- Heavy Attack: 99.41%
- Mid-air Part 1: 56.37%
- Mid-air Part 2: 53.19%
- Mid-air Part 3: 25.42%×3
- Mid-air Heavy Attack: 61.64%
- Dodge Counter: 129.23%
- STA costs: Heavy Attack 30, Mid-air Attack 5 (per hit), Mid-air Heavy Attack 30.

### Resonance Skill — Botany Experiment
Converges an energy field, grows foliage, Spectro DMG in range.

**Multipliers (Lv.10):** 35.79%×3+71.58%. Cooldown 12s. Concerto Energy Regen 30.

### Resonance Liberation — Arboreal Flourish
Nourishes nearby foliage rapidly, Spectro DMG, restores HP to all nearby team members. Applies a
**Photosynthesis Mark** to the target on hit.

**Photosynthesis Mark**: whenever a nearby team member attacks a marked target, Verina performs a
Coordinated Attack — Spectro DMG + heals the attacking party member — triggered once per second.

**Multipliers (Lv.10):** Skill (Ultimate) DMG 198.81%. Arboreal Flourish Healing: 950 + 23.80% ATK.
Coordinated Attack DMG 9.95%. Coordinated Attack Healing: 428 + 10.71% ATK. Photosynthesis Mark duration
12s. Cooldown 25s; Resonance Energy Cost 175; Concerto Regen 20.

### Forte Circuit — Starflower Blooms
- **Heavy Attack: Starflower Blooms**: casting Heavy Attack while carrying Photosynthesis Energy consumes
  1 stack — recovers Concerto Energy, heals nearby party members, deals Spectro DMG, **considered Heavy
  Attack damage**.
- **Mid-air Attack: Starflower Blooms**: same consume/regen/heal rule on Mid-air Attack — Spectro DMG,
  **considered Basic Attack damage**. Castable via Basic Attack input right after Heavy Attack: Starflower
  Blooms.
- **Photosynthesis Energy** (cap 4): gained 1/stack from a landed Basic Attack Stage 5, a landed Resonance
  Skill (Botany Experiment), or a landed Intro Skill (Verdant Growth) hit.

**Multipliers (Lv.10):**
- Heavy Attack: Starflower Blooms: 64.95%+97.42%
- Mid-air Attack: Starflower Bloom Part 1: 67.64%
- Mid-air Attack: Starflower Bloom Part 2: 63.82%
- Mid-air Attack: Starflower Bloom Part 3: 30.50%×3
- Starflower Blooms Healing: 1188 + 29.75% ATK
- Photosynthesis Energy consumption Concerto Regen: 12

### Inherent Skills
- **Grace of Life**: protects a party member from a fatal blow, grants a Shield = 120% of Verina's ATK
  for 10s (once per 10 real-time minutes).
- **Gift of Nature**: casting Heavy Attack-Starflower Blooms, Mid-air Attack-Starflower Blooms, Arboreal
  Flourish (Liberation), OR Blossom (Outro) grants the WHOLE TEAM +20% ATK for 20s.

### Intro Skill — Verdant Growth
Attacks the target, Spectro DMG.

**Multipliers (Lv.10):** 99.41%. Concerto Regen 10.

### Outro Skill — Blossom
Heals the next character (or another nearby team's character that activates an Outro Skill) = 19% of
Verina's ATK per second for 6s. All characters on nearby teams gain +15% All-Type DMG Deepen for 30s.

### Resonance Chain (S1-S6)
- **S1**: Outro (Blossom) grants the next character a continuous Heal = 20% Verina's ATK every 5s for 30s
  (on top of Blossom's own base heal).
- **S2**: Casting Botany Experiment (Skill) additionally grants 1 Photosynthesis Energy AND 10 Concerto
  Energy.
- **S3**: Healing from Resonance Liberation's Photosynthesis Mark +12%.
- **S4**: Heavy Attack-Starflower Blooms, Mid-air Attack-Starflower Blooms, Arboreal Flourish (Liberation),
  OR Blossom (Outro) grant the WHOLE TEAM +15% Spectro DMG Bonus for 24s.
- **S5**: Healing a team member below 50% HP grants +20% Healing (on that heal).
- **S6**: Heavy Attack-Starflower Blooms and Mid-air Attack-Starflower Blooms deal +20% more damage, AND
  each trigger a Coordinated Attack once, healing all nearby characters — both this Coordinated Attack's
  DMG and Healing equal Resonance Liberation's Photosynthesis Mark's own Coordinated Attack values.

### Minor Fortes (Total)
ATK% +12%, Healing Bonus +12%.

### Base Stats (Lv.90, incl. minor fortes)
HP 14238 | ATK 338 | DEF 1100 | Max Energy 175 | Crit Rate 5% | Crit DMG 150% | Healing Bonus 0% |
Spectro DMG Bonus 0%.

## Review

**Support tier**: **T0.5** (ToA, standard) / **T1** (WW, standard) — **T0** (ToA, Value list) / **T0.5**
(WW, Value list).

**Pros**
- One of the shortest rotations in the game by far.
- Requires very little investment to be effective.
- Strong ATK and All-Type DMG Amplify buffs to the whole team.
- Grants a cheat-death ability (2nd Inherent Skill) — trivializes handling enemy damage.
- Slots into literally any team and performs extremely well.
- Very easy to use.

**Cons**
- Her Intro Skill is bad — launches her airborne, lengthens her rotation, usually best skipped entirely.
- Outside quickswap teams, always outshined by Shorekeeper, who buffs the team more.

**Review summary**: Generalist Support whose kit centers on reaching her Outro (Blossom) as fast as
possible — a team-wide +15% All-Type DMG Amplify for 30s plus real continuous ATK-scaled healing to
whoever's on-field, both near-permanent given her extremely short rotation. Forte (Photosynthesis Energy,
cap 4) is her biggest contributor: generated by Intro (unused in practice), Resonance Skill, and her 5th
Basic Attack hit; consumed via Mid-air Attacks (always preferred — Heavy Attack is too slow, and minimizing
her own field time matters more than the marginal difference) for big Concerto Energy plus ATK-scaled
team healing. Resonance Skill and Basic Attacks are simple filler hits — Skill notably generates a lot of
real Resonance Energy (useful if under-built on ER), and her Basic Attack combo starts at Stage 3 (not
Stage 1) when swapped into without an Intro — central to her real optimal rotation. Ultimate deals
largely-irrelevant Coordinated Attack damage (~1-1.5% of a full team's total) over 12s, notable mainly for
Jinhsi synergy, while also healing the whole party for a solid chunk of ATK. Her Inherent Skill (Gift of
Nature) grants the whole team +20% ATK for 20s every time she heals — stacking with her Outro and
Rejuvenating Glow-set/Fallacy-of-No-Return-Echo buffing for a huge, near-constant buff package. Accesses
her Outro FASTER than any other character in the game currently, even ahead of top-tier Sanhua and other
generalist supports like Shorekeeper/Baizhi — makes her exceptional in high-level quickswap play, and her
Coordinated Attacks favor Jinhsi teams specifically. Only real flaw: her Intro Skill is functionally
unusable (launches her airborne, away from her real kit, and starting her real Basic combo from Stage 3
via a plain swap-in is faster anyway) — as a result, teams running her often cast a teammate's own Intro
TWICE instead, generally not a real problem. Overall: top-tier, only lagging behind Shorekeeper in raw
buff strength, which she compensates for with roughly half Shorekeeper's field time.

## Build

**Best Weapons** (no specific listed teammates/set for the weapon-tier calc context on this page):
1. **Variation (R5)** — best overall. Resonance Skill cast: restores 16 flat Concerto Energy (20s ICD).
   Stats: ATK 337, ER 51.8%. Lets her cut one attack from her already very short rotation, shaving even
   more time and effectively boosting team damage further; also provides her single best substat (ER).
2. **Stellar Symphony (signature, R1)** — Shorekeeper's signature, also excellent on Verina. HP+12%.
   Liberation cast: restores 8 Concerto Energy (20s ICD). A healing-Skill cast grants nearby party +14%
   ATK for 30s (same-name non-stacking). Stats: ATK 412, ER 77%. Huge ER as a secondary stat, plus real
   HP and Concerto utility — valuable for any Rectifier support able to equip it.
3. **Call of the Abyss (R5, free via Rinascita Exploration)** — Liberation cast grants +32% Healing Bonus
   for 15s. Stats: ATK 338, ER 51.8%. Best choice without a Concerto-focused weapon available — strong ER
   plus a real Healing Bonus boost for extra sustain.
4. **Rectifier#25 (R5, F2P craftable)** — Skill cast: heals 10% HP if below 60% (8s ICD), or +24% ATK for
   10s if above 60%. Stats: ATK 337, ER 51.8%. Good F2P option — real ATK% + base ATK for healing power
   plus solid ER.
5. **Rectifier of Voyager (R5)** — Skill cast: restores 12 flat Resonance Energy (20s ICD). Stats: ATK
   300, ER 32.3%. Easily accessible, grants sizable raw Energy — the flat gain is stronger the less ER
   the character/team already has; preferred over some 4-star ER options like Rectifier#25 for this
   reason specifically.

**Best Echo Set**: **Rejuvenating Glow** (best overall). 2pc +10% Healing. 5pc: healing an ally grants
the WHOLE TEAM +15% ATK for 30s. Unconditional Healing% plus a huge, easy-to-maintain team ATK buff
(triggerable via kit abilities or weapon effects) — big help to every party member.
- Main Echo options: **Fallacy of No Return** — +10% ER for the wearer, team-wide +10% ATK on use (20s).
  Strong for maximizing Energy generation or favoring a more permanent party-buffing effect vs. Bell-Borne
  Geochelone. **Bell-Borne Geochelone** — weaker for this set nowadays (shorter buff uptime, only +10%
  DMG Bonus for 15s) but a good pick if Fallacy isn't available; also blocks 50% DMG for up to 3 hits, for
  extra team survivability if desired.

**Special Echo Set option**: **Moonlit Clouds**. 2pc +10% ER. 5pc: Outro cast grants the next Resonator
+22.5% ATK for 15s — takes pressure off her own gear toward ER breakpoints, and amplifies a main DPS's
burst window on swap-in.
- Main Echo: **Impermanence Heron** — a Transform Echo trading the wearer's own damage for team benefit;
  best used and immediately swap-cancelled right before her Outro, so the next character gets +12% DMG%
  on top of 5pc Moonlit Clouds's own +22.5% ATK% (same trigger condition) — a sizable combined boost.
  Also restores a large chunk of Energy on use, often saving 1-2 ER substats Verina would otherwise need.

**Best Echo Stats**: 4-cost Crit Rate/ATK% · 3-cost Energy Regen · 3-cost Energy Regen/Spectro DMG ·
1-cost ATK%×2.
**Substat priority**: Energy Regen (until satisfied) > Crit Rate = Crit DMG > ATK% > ATK. (Her personal
damage is genuinely better than most credit her for — buildable the same way Shorekeeper's damage build
is, if desired, per the site's own note.)

**Best Endgame Stats (Lv.90)**: HP 18000+ | DEF 1100+ | ATK 1500+ | Crit Rate 60%+ | Crit DMG 210%+ |
Energy Regen 220-230% (the single most important stat by far — investing in her damage is fully
skippable) | Spectro DMG Bonus 0-30%. A slightly lower ER (~200%) works if her Skill is allowed to hit the
enemy, but interrupting it via her Ultimate to save time is usually better, so the higher ER requirement
should be prioritized.

**Skill Priority**: Forte Circuit > Resonance Liberation > Resonance Skill > Basic Attack > Intro Skill.

## Gameplay and Teams

A Concerto-Energy-generating weapon (Variation or Stellar Symphony) is highly recommended — it can skip
the final Starflower Blooms attack, saving a total of 0.76s across both listed rotations.

Casting her Intro Skill is NOT recommended — it makes reaching her Concerto Energy thresholds slow and
awkward, especially at S0. Better to double-Intro a teammate instead (may slightly alter that teammate's
own rotation, but shouldn't lengthen it).

Skill (Botany Experiment) can and should be immediately cancelled by casting the Ultimate right after —
its own damage doesn't land and no Resonance Energy is generated this way (Concerto Energy still is); if
struggling with Energy requirements, letting the Skill hit instead isn't a big loss.

Echo timing: best used at the very end of the rotation, right before Outro, to maximize buff uptime.

**Rotation (S0)** — Time: 3.75s: (swap in WITHOUT an Intro) Basic P3 → Basic P4 → Basic P5 → Skill: Botany
Experiment → Ultimate → Jump → Forte: Mid-air Attack: Starflower Blooms P1 → P2 → P3 → Outro.

**Rotation (S2)** — Time: 2.35s: (swap in without an Intro) Basic P3 → Skill: Botany Experiment →
Ultimate → Jump → Forte: Mid-air Attack: Starflower Blooms P1 → P2 → P3 → Outro. (S2's own Photosynthesis
Energy grant from Skill cast lets her skip Basic P4/P5 entirely and still reach 4 stacks.)

**Synergies**: usable literally anywhere as the 2nd-best Support in the game, very slightly behind
Shorekeeper. Best specifically in some Jinhsi teams running a secondary support with no Coordinated
Attacks of their own, and in quickswap teams that favor her especially low field time.

**Example Teams**: fully flexible — usable in the Support slot of any team composition in the game.
