# Mornye — Prydwen.gg source dump (cleaned)

Source: prydwen.gg/wuthering-waves/characters/mornye
Last updated (per page): 20/August/2026 · Last review update: Patch 3.0 · Last major build/calcs update: Patch 3.0

5★ Fusion Broadblade, Support (Tune Break-oriented buffer/healer).

---

## Kit

### Basic Attack — Ground State Calibration

- **Basic Attack**: up to 4 consecutive hits, Fusion DMG.
- **Heavy Attack**: consumes STA, Fusion DMG.
- **Basic Attack - Wide Field Observation Mode** (replaces Basic Attack in that state): up to 3 consecutive hits, Fusion DMG.
- **Mid-air Attack**: consumes STA, plunging attack, Fusion DMG. Shortly after, chains into Basic Stage 3.
- **Dodge Counter**: Normal Attack after a successful Dodge, Fusion DMG. Shortly after, chains into Basic Stage 2.
- **Dodge Counter - Wide Field Observation Mode** (replaces Dodge Counter in that state): Fusion DMG. Shortly after, chains into Basic - Wide Field Observation Mode Stage 3.

**Multipliers (Lv.10):**
| Move | Value |
|---|---|
| Basic ATK Stage 1 | 22.27%+16.71%×2 |
| Basic ATK Stage 2 | 23.86%+23.86%+17.90%×4 |
| Basic ATK Stage 3 | 41.36%+10.34%×6 |
| Basic ATK Stage 4 | 135.20% |
| Wide Field Stage 1 | 13.92%×4 |
| Wide Field Stage 2 | 25.85%×4 |
| Wide Field Stage 3 | 9.31%×4+33.09%×2 |
| Heavy Attack | 11.10%+11.10%+14.80% |
| Mid-air Attack | 98.61% |
| Dodge Counter | 162.23% |
| Dodge Counter - Wide Field | 25.85%×4 |
| Heavy Attack STA cost | 25 |
| Mid-air Attack STA cost | 30 |

### Resonance Skill — Resolution

- **Expectation Error**: heals all nearby team members, enters **Parry state** (100% DMG Reduction for a time; ends immediately on swap). If attacked while parrying, exits into **Optimal Solution**. If not attacked, pressing Normal Attack exits into Basic Stage 2.
- **Optimal Solution**: Stagnate nearby targets + Fusion DMG, reduces Expectation Error's cooldown by 2s. Swapping ends the Stagnation early.
- **Distributed Array** (replaces Skill in Wide Field Observation Mode): heals all nearby team members + summons Hover Cannons for Fusion DMG.

**Multipliers (Lv.10):**
| Move | Value |
|---|---|
| Distributed Array Healing | 427 + 113.40% DEF |
| Expectation Error Healing | 94 + 24.94% DEF |
| Optimal Solution DMG | 179.73% |
| Distributed Array DMG | 39.77%×4 |
| Expectation Error cooldown | 5s |
| Distributed Array cooldown | 16s |
| Distributed Array Concerto Regen | 10 |

### Resonance Liberation — Critical Protocol

- Attack targets in range, Fusion DMG. For every 1% of Mornye's Energy Regen over 100%, gains +0.5% Crit Rate (cap +80%) and +1% Crit DMG (cap +160%). If a Syntony Field is present on cast, removes it and generates a **High Syntony Field**. Castable mid-air.
- **High Syntony Field** (25s): +20% DEF to nearby team members within it; inherits the base Syntony Field's Interruption Resistance and Off-Tune Buildup Rate boost; inherits its healing with the Healing Multiplier increased by +40%.

**Multipliers (Lv.10):**
| Move | Value |
|---|---|
| Skill DMG | 522.33% DEF |
| Cooldown | 25s |
| Resonance Energy cost | 175 |
| Concerto Regen | 20 |

### Forte Circuit — Mass-Energy Equivalence

- **Baseline Mode** (default): gains **Rest Mass Energy** (cap 100) from Basic Attack, Heavy Attack, Dodge Counter, or Optimal Solution hits.
- **Heavy Attack - Geopotential Shift**: unlocked at 100 Rest Mass Energy, replaces Heavy Attack — Fusion DMG, **counted as Heavy Attack DMG**. Jumps into mid-air, consumes all Rest Mass Energy, enters **Wide Field Observation Mode** for 30s.
- **Wide Field Observation Mode**: on entry, generates a **Syntony Field**. Gains **Relative Momentum** (cap 100) from Wide Field Basic Attack, Wide Field Dodge Counter, or Distributed Array hits (not gained during Inversion). Holding Normal Attack below 100 Relative Momentum performs Wide Field Basic Stages 1→3 in sequence; at 100 Relative Momentum, casts **Heavy Attack - Inversion** instead. Continuously consumes STA while moving (can't regen in this mode). Directional Dodge grants flight for up to 10s (or until STA empties/mode ends). Being hit/launched lets a Dodge press instantly recover (counts as a successful Dodge, up to 3 times, resets when the mode ends). Jump makes her slowly descend — Wide Field Basic/Distributed Array/Inversion unavailable while descending; running out of STA on Jump exits the mode; Dodge/Jump/Mid-air Attack, environmental interactions, Utilities, or swapping all end the mode; also ends when no longer airborne.
- **Syntony Field** (25s): generates Fusion DMG on creation, **counted as Resonance Liberation DMG**. Heals nearby active team members every 3s. +50% Off-Tune Buildup Rate to nearby team members within it. Grants Interruption Resistance to nearby active team members within it.
- **Heavy Attack - Inversion**: unlocked at 100 Relative Momentum, replaces Heavy Attack — consumes all Relative Momentum, Fusion DMG, **counted as Heavy Attack DMG**. Inflicts **Observation Marker** on hit for 30s.
- **Observation Marker**: a team member dealing Tune Break DMG to a marked target makes Mornye inflict **Interfered Marker** on it for 8s.
- **Interfered Marker**: targets also affected by Tune Rupture/Strain-Interfered take increased DMG from all nearby team members — +0.25% per 1% of Mornye's Energy Regen over 100%, up to +40%.
- **Visual Field**: a team member defeating an Observation/Interfered-Marker target grants Mornye Visual Field for 3s — while active, any team member's damage on a hit target inflicts Observation Marker.
- **Tune Rupture Response — Particle Jet**: Fusion DMG to nearby Tune Rupture-Interfered targets, **counted as Tune Rupture DMG**.

**Multipliers (Lv.10):**
| Move | Value |
|---|---|
| Syntony Field Healing | 76 + 20.24% DEF |
| Syntony Field DMG | 39.77%×5 |
| Heavy Attack - Geopotential Shift | 44.14%+99.02% |
| Heavy Attack - Inversion | 258.46% |
| Tune Rupture Response - Particle Jet | 298.22% Tune AMP |
| Wide Field Observation Mode STA cost/sec | 5 |

**Forte "Decoupling"** (2nd Forte listed): responds to Tune Rupture-Interfered — a team member dealing Tune Break DMG that inflicts Tune Rupture-Interfered makes Mornye cast Tune Rupture Response - Particle Jet (once per target per 8s). Responds to Tune Strain-Interfered — each stack on the target raises Mornye's total DMG against it by 0.12% per point of her Tune Break Boost; while she's on the team, the max Tune Strain-Interfered stack cap on a target is +1. Can perform Tune Break on full-Off-Tune-Level targets.

### Inherent Skills

- **Blueprint**: +10% Energy Regen. Casting Intro restores 20 Concerto Energy (once per 20s). Casting Wide Field Basic Stage 3 restores 20 Concerto Energy (once per 20s).
- **Boundedness**: casting Expectation Error or Distributed Array grants **Proof of Boundedness** to the whole team (60s, once per 5 min): active-Resonator DMG taken above 30% Max HP is capped at 30% Max HP (up to 3 triggers, then removed); a fatal blow instead doesn't down the active Resonator (up to 1 trigger, then removed). On removal, the active Resonator heals 150% of Mornye's DEF.

### Intro Skill — Convergence

- Attack, Fusion DMG. Jumps into mid-air, clears all Rest Mass Energy, enters Wide Field Observation Mode.

**Multipliers (Lv.10):**
| Move | Value |
|---|---|
| Skill DMG | 202.79% |
| Concerto Regen | 10 |

### Outro Skill — Recursion

- Grants the team +25% All DMG Amplification for 30s.

### Resonance Chain (Sequences)

- **S1**: Wide Field Basic Attack becomes interruption-immune. Interfered Marker duration +150%. Interfered Marker now grants its DMG increase even without Tune Rupture/Strain-Interfered present. Applying Observation Marker also inflicts Interfered Marker.
- **S2**: Nearby team members gain Crit DMG vs. Interfered-Marker targets: +0.2% per 1% Energy Regen over 100%, up to +32%. Syntony/High Syntony Field's Off-Tune Buildup Rate boost to nearby team members +20% more.
- **S3**: Casting Distributed Array additionally restores 25 Concerto Energy + 100 Relative Momentum (once per 25s).
- **S4**: High Syntony Field healing +30%.
- **S5**: Critical Protocol DMG Multiplier +40%. Tune Rupture Response - Particle Jet DMG Multiplier +160%.
- **S6**: Critical Protocol deals +400% more DMG. If out of combat 4s+, restores Resonance Energy = 10% Max Energy every 0.2s.

### Minor Fortes
Healing Bonus +10%, DEF% +11%.

### Base Stats (Lv.90, incl. minor fortes)
HP 15375 · ATK 288 · DEF 1357 · Max Energy 125 · Crit Rate 5% · Crit DMG 150%

---

## Review

**DPS tier**: **T0** (Tower of Adversity, standard) / **T1** (Whimpering Wastes, standard) / **T0** (Tower of Adversity, Value) / **T1.5** (Whimpering Wastes, Value) — labeled **Support**.

**Pros**
- Mostly universal buffer & healer, even stronger in her meta niches.
- Super cheap to invest into — just satisfy Energy Regen requirements and she's fully functional.
- Part of the universal buffing core with Lynae, part of the universal Fusion core with Lupa.
- Party-wide DEF boost, Interruption Resistance, 3 oneshot resists, and death resistance make her the best Holograms Support in the game — very accessible for casual players.
- S1 is fairly accessible and makes her universally strong without needing specific partners.

**Cons**
- Really wants a Concerto weapon — without one, rotations are slower/clunkier; even with one, the Opener is slow and restricting.
- Tune Break-related buffs are enemy-dependent (buildup varies by enemy class, some bosses have Tune Break Buildup immunity phases).
- Completely quickswap-unfriendly — her enhanced state instantly expires on swap; once her rotation starts (post-Opener) it must be finished.
- Is "only" a sidegrade to Verina outside a team explicitly synergistic with her at S0 — worth remembering since without her relevant teammates or S1, she's likely too niche to be worth the investment (Verina/Shorekeeper are more widely owned/free).

**Key mechanics**
- Two Forte bars: **Rest Mass Energy** (Opener-only, 3 Basics or 1 Parry Skill to fill, unlocks Geopotential Shift → Wide Field Observation Mode) and **Relative Momentum** (gained in Wide Field mode, 3 Basics + a Skill to fill, unlocks Inversion Heavy Attack that places Observation Marker). Intro also directly enters Wide Field Observation Mode, skipping Rest Mass Energy entirely on loop rotations.
- Entering the enhanced state also generates a **Syntony Field**; casting her Ultimate upgrades it into a **High Syntony Field** with more buffs.
- Buffing profile: Syntony Field (+50% Off-Tune Buildup Rate, constant healing, team Interruption Resistance — realistically permanent uptime); High Syntony Field (+20% team DEF, more healing); either Skill cast (3 Oneshot Resists or 1 Death Resist + extra healing, 60s, 5 min cooldown); Tune Break DMG on Tune Rupture/Strain + Inversion-marked targets (up to +40% DMG Bonus); Outro (+25% party-wide All-DMG Amp, realistically permanent uptime); Echo set (+25% party-wide ATK, permanent uptime); Signature weapon (+20% party-wide Crit DMG, realistically permanent uptime).
- Several team buffs (and her own Liberation self-buffs) cap out at 260% total Energy Regen — 10% from a passive + 10% from her Main Echo means she needs 240% more from Echoes; easy with Signature, still achievable with F2P 4★ weapons. Effectively her only real build requirement.

**Meta position**: several meta niches even at S0 — best 3rd-slot in most Mono Fusion teams with Lupa, and in basically every Lynae team (barring a few exceptions like Hiyuki+Chisa or Absolution Phoebe needing Spectro Frazzle). Also best general Support in Aemeath Rupture, Luuk, and Lucy compositions. Until S1, her Interfered Marker buff requires another character's Tune Rupture/Strain application, making her noticeably worse than Shorekeeper outside her scope and roughly equivalent to Verina — arguably the most niche of the three universal Supports pre-S1. Remains broadly usable in every endgame mode/team in spite of quickswap-unfriendliness and conditional buffs.

---

## Build

### Best Weapons
| Weapon | Score/Rank |
|---|---|
| Starfield Calibrator (R1, signature) | 1st |
| Discord (R5, 4★) | 2nd (best 4★) |
| Broadblade#41 (R5, 4★, F2P craftable) | 3rd (only fully F2P-accessible option) |

**Signature (Starfield Calibrator)**: +16% DEF; casting Liberation restores 8 Concerto Energy (once per 20s); healing a Resonator grants all nearby team members +20% Crit DMG for 4s (same-name effects don't stack). Gives huge Energy Regen, DEF, and higher base ATK than the alternatives — best overall for personal damage while meeting Energy Regen needs, plus a permanent party-wide 20% Crit DMG buff and extra Concerto. Rather skippable though — personal damage gain is negligible and the buff's ROI is low.
**Discord**: best 4★ and 2nd overall — Skill cast restores 16 Concerto Energy (once per 20s) plus solid Energy Regen; a no-brainer pick.
**Broadblade#41**: only fully F2P-accessible/craftable option — barely satisfies her 260% Energy Regen requirement, but significantly extends her rotation (no Concerto boost of its own).

### Best Echo Sets

**1) Halo of Starry Radiance** — 2pc: +10% Healing Bonus. 5pc: healing a team member grants all team members +0.2% ATK per 1% Off-Tune Buildup Rate, up to +25% for 4s (same-name effects don't stack). Her dedicated Support set — permanent 25% team ATK buff + permanent 10% Energy Regen via Main Echo. Best choice overall by a small margin over Rejuvenating Glow (higher buff uptime, slightly more team Energy generation/personal damage).
Main Echo: **Reactor Husk** — a Transform Echo giving +10% Energy Regen in the main slot, de facto best choice; cast before Outro at rotation's end and Swap Cancelled for optimal uptime.

**2) Rejuvenating Glow** — 2pc: +10% Healing. 5pc: healing allies grants the whole team +15% ATK for 30s. Easy to keep at 100% uptime, a good party-wide damage increase.
Main Echo: **Fallacy of No Return** — same buffs as Halo of Starry Radiance on cast (+10% team ATK, +10% Energy Regen to the wearer); can be summoned before Ultimate for roughly the same effect as the Signature set, though lower uptime in longer rotations makes this situationally (very slightly) worse.

**Best Echo Stats**: 4-cost DEF% > Healing Bonus · 3-cost Energy Regen · 3-cost Energy Regen / Fusion DMG (Fusion DMG 3-cost only possible on Signature weapon) · 1-cost DEF% ×2.
**Substat priority**: Energy Regen (until 260%) >>> Liberation DMG% > Crit DMG > DEF% > Crit Rate (until 20%) > ATK% > DEF > ATK.

### Endgame Stat Targets (Lv.90)
HP 15000+ · ATK 1000+ · DEF 3000+ · Crit Rate 20%+ · Crit DMG 220%+ · Energy Regen 240% (before Echo and Passive) · Fusion DMG Bonus 0–30% (only possible with Signature equipped).

### Sequence Review
No personal-damage calc table provided — her value is almost entirely team-dependent. Prydwen's own value summary:
- **S1**: High value outside Tune Rupture/Strain teams, medium inside them — makes Interfered Marker permanent uptime and removes the Tune Rupture/Strain-presence condition; more Interruption Resistance. Skippable if only used in Tune Rupture/Strain teams.
- **S2**: Medium value — extra team-wide Crit DMG + Off-Tune Buildup Rate.
- **S3**: Medium-low value — speeds up her own rotation, but the team-context gain doesn't justify the cost.
- **S4**: Next to no value — marginal sustain boost to an already-top-Sustain Support.
- **S5**: Very low value — small personal damage increase on a low-damage Support.
- **S6**: Low value — makes her Ultimate hit hard, but very high acquisition cost for a Support (a Main DPS's S6 generally yields more team damage).

### Skill Priority
Damage focus: Liberation > Forte Circuit > Basic Attack > Intro Skill > Resonance Skill (anything but Liberation skippable at minimal loss).
Healing focus: Liberation > Forte Circuit > Resonance Skill > Basic Attack > Intro Skill (Liberation/Basic/Intro skippable at no healing loss, though leveling Liberation is still recommended).

---

## Gameplay & Teams

### Opener Rotation
Basic 1 → Basic 2 → Basic 3 → Heavy: Geopotential Shift → Basic: Wide Field 1 → Basic: Wide Field 2 → Basic: Wide Field 3 (cancel via Skill) → Skill: Distributed Array → Heavy: Inversion (cancel via Ultimate) → Ultimate → Outro.

### Loop Rotation
Intro → Basic: Wide Field 1 → Basic: Wide Field 2 → Basic: Wide Field 3 (cancel via Skill) → Skill: Distributed Array → Heavy: Inversion (cancel via Ultimate) → Ultimate → Outro.

### Loop Forte Skip Rotation (S0, no Tune Rupture/Strain applier, R4+ Concerto weapon)
Intro → Basic: Wide Field 1 → Basic: Wide Field 2 → Basic: Wide Field 3 (cancel via Ultimate) → Ultimate → Skill: Distributed Array (swap).
At S0 without a Rupture/Strain applier, Heavy: Inversion provides no extra team benefit, so it (and the Echo cast) can be skipped entirely if she generates enough Concerto on loop via an R4+ Concerto weapon (Discord/Signature). Wide Field 3 hits fully during the Ultimate animation, letting her swap out right after casting Skill. Extremely fast — close to S0 Verina speed, relevant for Lucy/Rebecca/Mornye or Galbrena/Lupa/Mornye. Pointless at S1+, since her Interfered Marker then benefits the team regardless of composition.

Echo timing: after Ultimate + Swap Cancelled (Reactor Husk), or right before Ultimate (Fallacy of No Return).

Additional tips: Wide Field Basic 3 becomes cancellable as soon as the attack starts forming around the target; for Inversion, watch the Concerto gauge. At S3+, all Wide Field Basics are skippable. During the Opener, free to Swap Cancel until Geopotential Shift is cast — Basic 3 is a good Swap Cancel window; some setups never Intro her at all to force quickswap.

### Synergies

**Aemeath / Qingxiao / Luuk Herssen / Lynae / Denia / Lupa** — her 2 best niches: Mono Fusion (activates Lupa's full buffs as a generalist Support, enabling Lupa in Hypercarry comps) and teams with a Tune Rupture/Strain applier (Lynae, Denia, Qingxiao, Luuk, Aemeath) — she responds to it via Interfered Marker for extra team DMG%, her strongest synergy category.

### Example Teams
- **Lynae + Mornye**: Aemeath / Hiyuki / Iuno / Yangyang: Xuanling + Lynae + Mornye — any non-Negative-Status DPS (and Hiyuki) works in the 1st slot, fully interchangeable, though Lynae+Mornye slightly favor Liberation damage teams; Tune Strain DPS also fits well.
- **Tune Strain Team**: Qingxiao / Luuk Herssen / Denia + Mornye.
- **Mono Fusion**: Aemeath / Galbrena / Brant / Encore + Lupa + Mornye.
