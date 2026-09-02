# Aemeath — Prydwen.gg source dump (cleaned)

Source: prydwen.gg/wuthering-waves/characters/aemeath
Last updated (per page): 20/August/2026 · Last review update: Patch 3.1 · Last major build/calcs update: Patch 3.1

5★ Fusion Sword, Main DPS. Dual-form (Aemeath/Mech) hybrid with a Tune Rupture / Fusion Burst Resonance Mode switch.

---

## Kit

### Basic Attack — Infinity Calibration (Aemeath form)

- **Basic Attack – Aemeath**: up to 4 consecutive hits, Fusion DMG.
- **Heavy Attack – Aemeath**: hold to charge (consumes STA), release for Charged I; hold longer for Charged II (higher DMG). In Instant Response, Charged II charges faster. Casting Charged II (either form) or Liberation: Finale ends Instant Response. **This move's DMG is counted as Resonance Liberation DMG.** Press Normal Attack shortly after Charged I/II to chain into Basic Attack Stage 2/3.
- **Mid-air Attack – Aemeath**: consumes STA, plunging attack, Fusion DMG. Chains into Basic Stage 2.
- **Dodge Counter – Aemeath**: Normal Attack after a successful Dodge, Fusion DMG. Chains into Basic Stage 4.

**Multipliers (Lv.10, Aemeath form):**
| Move | Value |
|---|---|
| Basic ATK Stage 1 | 46.35% |
| Basic ATK Stage 2 | 13.89% + 20.84% + 34.73% |
| Basic ATK Stage 3 | 9.32%×3 + 18.63% + 46.56% |
| Basic ATK Stage 4 | 6.73%×5 + 100.94% |
| Heavy ATK Charged I | 18.57% + 74.26% |
| Heavy ATK Charged II | 11.60%×4 + 185.60% |
| Mid-air Attack | 86.29% |
| Dodge Counter | 26.02%×3 + 52.03% + 130.06% |
| Heavy ATK STA cost | 20 |
| Mid-air Attack STA cost | 30 |

### Resonance Skill — Shared Voyage (Form Switch + Sync Strikes)

**Form Switch**: swaps between Aemeath and Mech form — the Mech inherits Aemeath's stats and unlocks new moves. Auto-casts Basic Stage 1 on switch (or Mid-air Attack if switched mid-air in Mech form).

- **Sync Strike: Armament Merge**: press Skill shortly after Basic Stage 2/3/4, Heavy ATK, or Dodge Counter (Aemeath form) — Fusion DMG, switches into Mech form.
- **Sync Strike: Call of Dawn**: press Skill shortly after Basic Stage 2/3/4, Heavy ATK, or Dodge Counter (Mech form) — Fusion DMG, can be cast mid-air, switches back to Aemeath form.
- **Basic Attack – Mech**: up to 4 consecutive hits, Fusion DMG. Can be cast mid-air close to ground.
- **Heavy Attack – Mech**: same charge mechanic as the Aemeath-form version (Charged I/II), Charged II **counted as Resonance Liberation DMG**, same Instant Response interaction.
- **Mid-air Attack – Mech** / **Dodge Counter – Mech**: same structure as the Aemeath-form versions.

**Multipliers (Lv.10, Mech form + Sync Strikes):**
| Move | Value |
|---|---|
| Sync Strike: Armament Merge | 26.92% + 40.38% + 67.29% |
| Sync Strike: Call of Dawn | 16.33%×3 + 114.28% |
| Basic ATK Stage 1 | 23.20%×3 |
| Basic ATK Stage 2 | 18.57% + 74.26% |
| Basic ATK Stage 3 | 3.89%×6 + 81.54% + 11.65% |
| Basic ATK Stage 4 | 40.38% + 94.21% |
| Heavy ATK Charged I | 92.83% |
| Heavy ATK Charged II | 232.00% |
| Mid-air Attack | 73.35% + 4.32%×3 |
| Dodge Counter | 9.45%×6 + 198.44% + 28.35% |
| Heavy ATK STA cost | 20 |
| Mid-air Attack STA cost | 30 |
| Form Switch cooldown | 1s |

### Resonance Liberation — Towards the Daybreak

- **Heavenfall Edict – Overdrive**: Fusion DMG, switches to Mech form. Grants: **Stardust Resonance** (30s — enhances Seraphic Duet, ends after 2 Duet casts) and **Heavenfall Edict: Unbound** (60s — replaces Overdrive with **Heavenfall Edict: Finale**; reaching max Resonance Rate while Unbound enters **Instant Response**, removed when Unbound ends). Next Seraphic Duet within 30s doesn't consume Rupturous/Fusion Trail.
- **Heavenfall Edict – Finale**: castable (via Skill or Liberation button) only while Unbound AND at max Synchronization Rate AND max Resonance Rate. Depletes both resources fully, Fusion DMG, ends Unbound and Seraphic Duo, switches back to Aemeath form. Can be cast mid-air close to ground.

**Multipliers (Lv.10):**
| Move | Value |
|---|---|
| Heavenfall Edict: Overdrive | 186.72% + 248.96%×3 |
| Heavenfall Edict: Finale | 1663.83% |
| Overdrive cooldown | 25s |
| Finale cooldown | 25s |
| Overdrive Resonance cost | 125 |
| Overdrive Concerto Regen | 20 |
| Finale Concerto Regen | 20 |

### Forte Circuit — To Sculpt the Silence

- **Seraphic Duo**: entered for 5s upon casting Basic Stage 4 (either form).
- **Resonance Skill – Seraphic Duet: Overture**: while in Seraphic Duo with Synchronization Rate ≥100, press Skill — costs 100 Sync Rate, Fusion DMG, **counted as Resonance Liberation DMG**. Switches to Mech form, exits Seraphic Duo. Can be cast mid-air close to ground.
- **Resonance Skill – Seraphic Duet: Encore**: same, in Mech form — switches back to Aemeath form, exits Seraphic Duo.
- **Resonance Mode** (Tune Rupture / Fusion Burst — set by team composition):
  - Tune Rupture: team responding to Tune Rupture-Interfered inflicts 10 Rupturous Trail stacks (30s, cap 30).
  - Fusion Burst: team inflicting Fusion Burst adds 1 Fusion Trail stack (30s, cap 30). In combat, when a nearby target's Fusion Burst stacks hit 0, inflict 1 stack; if it has >5 stacks, trigger Fusion Burst at its max stack limit and clear stacks.
  - Both modes: Basic Stage 3/4 (either form), Sync Strikes, and both Intro skills inflict Tune Rupture-Shifting / Fusion Burst on hit (once per target per 3s, per skill).
  - Seraphic Duet mode-based enhancement:
    - **Tune Rupture**: removes nearby Rupturous Trail stacks, deals 5 extra Tune Rupture DMG instances (each on a random target in range); +4% DMG Mult per stack removed, 1s, ignores Off-Tune Level gating.
    - **Fusion Burst**: removes Fusion Trail stacks if present, triggers Fusion Burst at max stack limit WITHOUT consuming stacks; +10% DMG Mult to the main target's Fusion Burst per stack removed.
    - In Stardust Resonance: Tune Rupture gets +10 extra Tune Rupture instances; Fusion Burst gets an additional +200% DMG Mult on the main target (stacks with the Fusion Trail bonus above).
- **Tune Rupture Response – Starburst**: active only in Tune Rupture mode. Fusion DMG to targets affected by Tune Rupture-Interfered in range, **counted as Tune Rupture DMG**.
- **Starflux Thrust**: Mech-form-only traversal ability (>200 Starflux), no combat relevance.
- **Synchronization Rate** (cap 200): gained from Basic/Mid-air/Dodge Counter (both forms) and both Sync Strikes landing damage; +40 from either Intro Skill; +30 from Overdrive; **+200 (full)** from Charged II Heavy ATK while BOTH Instant Response and Unbound are active.
- **Resonance Rate** (cap 4): +1 per Seraphic Duet cast; +1 from Overdrive; +1 more from Overdrive while in Starlume Acceleration.
- **Starflux** (cap 600): regenerates naturally over time (Mech-form traversal resource, no combat relevance).

**Multipliers (Lv.10):**
| Move | Value |
|---|---|
| Seraphic Duet: Encore | 17.90%×4 + 35.79%×3 + 178.93% |
| Seraphic Duet: Overture | 17.90% + 14.92%×6 + 23.86%×3 + 59.65%×3 |
| Tune Rupture Response: Starburst | 596.43% Tune AMP |
| Seraphic Duet bonus DMG (per instance) | 109.35% Tune AMP |

**Forte "Unlanded Melody"** (a second Forte listed in the source): once a target's Off-Tune Level is full, cast **Tune Break** on it (chains into Basic Stage 3). Responding to Tune Rupture-Interfered from a team Tune Break triggers Tune Rupture Response - Starburst (once per target per 8s).

### Inherent Skills

- **Before All Sounds**: in Instant Response, Heavy ATK (either form) gains +200% DMG Amplification.
- **Between the Stars**: Tune Rupture mode — team inflicting Tune Rupture-Shifting/dealing Tune Rupture DMG grants Aemeath +20% Crit DMG, up to 3 stacks (once per resonator); at 3 stacks, Heavenfall Edict: Finale DMG is Amplified +25%. Fusion Burst mode — team inflicting Fusion Burst grants +30% Crit DMG, up to 2 stacks (once per resonator); at 2 stacks, same +25% Finale Amp. Resets on roster change or mode switch. **(Replaced by S3 — see Resonance Chain.)**

### Intro Skill — Overture of Departure

- **Songs Across the Universe** (Aemeath form): Fusion DMG. Enters **Starlume Acceleration** for 15s. Chains into Basic Stage 3, or into Basic-Mech Stage 3 via a Skill press.
- **Debut of Meteoric Radiance** (Mech form, replaces the above): Fusion DMG. Same Starlume Acceleration grant and chain options (mirrored for Mech).
- **Starlume Acceleration**: while active, casting Overdrive additionally restores Resonance Rate; casting Overdrive ends Starlume Acceleration.

**Multipliers (Lv.10):**
| Move | Value |
|---|---|
| Songs Across the Universe | 13.46%×2 + 107.66% |
| Debut of Meteoric Radiance | 65.30% + 97.95% |
| Concerto Regen (either) | 10 |

### Outro Skill — Silent Protection

Depending on Aemeath's current Resonance Mode:
- **Tune Rupture**: all team members except Aemeath gain **+10% All-DMG Amplification for 20s** (raised to **+20%** for whoever inflicts Tune Rupture-Shifting).
- **Fusion Burst**: same structure — **+10% All-DMG Amp for 20s**, raised to **+20%** for whoever inflicts Fusion Burst.
Casting the Outro resets these effects.

### Resonance Chain (Sequences)

- **S1**: In Instant Response, Heavy ATK (either form) gains +300% Crit DMG and pulls in nearby targets while charging. Being out of combat and not attacking (Heavy ATK/Finale) for 4s+ enters **Instant Response: Brilliance** (persists outside Unbound's duration too). While in Brilliance and not Unbound, casting Charged II grants 100 Synchronization Rate. In Tune Rupture/Fusion Burst mode, defeating a target with active Trail stacks enters **Sealed Trail** for 10s, recording the highest stack count seen; her next direct-damage skill applies those recorded stacks to its target (up to the current cap), ending Sealed Trail (1s cooldown before it can re-trigger).
- **S2**: Seraphic Duet: Overture and Encore DMG Multipliers both +100%. Tune Rupture mode: repeated Duet-triggered Tune Rupture hits on the same target stack a further +20% DMG Mult per hit (1s, up to 5 stacks). Fusion Burst mode: in Stardust Resonance, Duet's Fusion Burst DMG Mult on the main target is further raised to +400% total; Fusion Trail stacks removed also boost Fusion Trail's own triggered DMG (+15% per stack, on the main target); in combat, a nearby target defeated near the active resonator instantly triggers Fusion Burst at its max stack limit.
- **S3**: Heavenfall Edict: Finale DMG Mult +100%. Heavenfall Edict: Overdrive DMG Mult +40%. In Instant Response, Heavy ATK (either form) now also inflicts Tune Rupture-Shifting/Fusion Burst on nearby targets (mode-dependent). **Replaces Inherent Skill "Between the Stars"** with: Tune Rupture mode — team inflicting Tune Rupture-Shifting/dealing Tune Rupture DMG grants Aemeath +60% Crit DMG (flat, not stacked) and Finale DMG +25% Amplified; Fusion Burst mode — same structure off team Fusion Burst triggers. Resets on roster change/mode switch (both modes).
- **S4**: Casting either Intro, either Sync Strike, or Seraphic Duet grants the whole team +20% All-Attribute DMG Bonus for 30s.
- **S5**: Defeating a target directly with her own skills resets Starflux to 100%. Taking fatal damage instead knocks her out into a 5s "2D Digital Ghost" state, granting the team a Shield = 360% of her ATK for 5s; on exiting, she revives at 100% Max HP + 30 Resonance Energy (once per 10 min). Reviving removes the granted shield.
- **S6**: Targets take +40% more Liberation DMG from Aemeath. Tune Rupture mode: her Tune Rupture DMG can crit, fixed 80% Crit Rate / 275% Crit DMG. Fusion Burst mode (in combat): nearby-target Fusion Burst DMG can crit, same fixed 80%/275%. Rupturous/Fusion Trail stacks inflicted via Forte "To Sculpt the Silence" are doubled. In combat, max Trail stack cap on nearby targets raised to 60; casting Seraphic Duet also directly inflicts 10 Trail stacks on targets in range for 30s.

### Minor Fortes
Crit Rate +8%, ATK% +12%.

### Base Stats (Lv.90, incl. minor fortes)
HP 11025 · ATK 425 · DEF 1149 · Max Energy 125 · Crit Rate 5% · Crit DMG 150%

---

## Review

**DPS tier**: **T0** (Tower of Adversity, both standard and value lists) / **T0.5** (Whimpering Wastes, both lists).

**Pros**
- Strongest Fusion DPS currently — huge damage and scoring potential across all endgame modes.
- Genuinely flexible: performs well in Tune Rupture, Fusion Burst, AND Mono Fusion team archetypes.
- Doesn't strictly need her signature weapon to perform at a high level with standard banner options.

**Cons**
- Wants at least one premium teammate leaning into whichever archetype she's built around — lacks a strong, always-accessible F2P enabler (unlike Phrolova/Augusta).
- Forte generation depends on her short-range melee Basic Attacks actually connecting — airborne or fleeing enemies significantly lengthen her rotation (and buffs can expire before her biggest nuke).

**Key mechanics**
- **Resonance Mode** (Tune Rupture or Fusion Burst, set by teammates) affects: which status her Intro/Basics apply; her Forte (Duet) skill's mode-specific enhancement; whether her Tune Rupture Response (Starburst) is active; her Inherent Skill 2 Crit DMG stacking condition; and her Outro's bonus-amplify condition.
- Two Forte resources: **Synchronization Rate** (from Basics/Intro, unlocks Forte skills at 100 and her 2nd Ultimate at 200) and **Resonance Rate** (from her 1st Ultimate + 2 Forte casts, caps at 4). A single Heavy ATK cast after Resonance Rate is maxed fully refills Synchronization Rate too — required to reach both caps for her 2nd Ultimate.
- Freely form-switches (Aemeath ⇄ Mech) via Skill; her 1st Ultimate always switches her to Mech; her Forte skills always switch her to the opposite form from whichever she's currently in. Sync Strikes are a quickswap-only mechanic (not used in her standard rotation).
- Forte skills require a Basic Stage 4 within 5s prior; must repeat this between her two Forte casts; must be cast after her 1st Ultimate (which enhances them).
- The bulk of her real damage: her Forte skills, Tune Rupture/Fusion Burst procs, and both Ultimates. Mid-air Attack, plain Heavy Attacks (outside the one Sync-Rate-refill cast), and Sync Strikes aren't used in her practical (non-quickswap) rotation.

**Meta position**: top-tier across three distinct archetypes — **Tune Rupture** (enabled by Lynae, Mornye as a secondary contributor), **Fusion Burst** (enabled by Denia), **Mono Fusion** (enabled by Lupa). Fusion Burst is the strongest overall pick (best AoE via quickswap, best ceiling); Tune Rupture/Mono Fusion are close in single-target and fine in Whimpering Wastes when played correctly.

---

## Build

### Best Weapons (buffs assumed: Denia + Chisa team, per Prydwen's own calc note)
| Weapon | Score |
|---|---|
| Everbright Polestar (R1, signature) | 100.00% |
| Emerald of Genesis (R1) | 83.50% |
| Red Spring (R1) | 83.20% |
| Emerald Sentence (R1) | 82.90% |
| Blazing Brilliance (R1) | 78.10% |
| Feather Edge (R5, 4★, Battle Pass) | 74.80% |
| Somnoire Anchor (R5, 4★, event) | 74.10% |
| Endless Collapse (R5, 4★) | 73.90% |
| Commando of Conviction (R5, 4★, No-Gacha/free) | — (no % listed, described as best F2P starter option) |

**Signature (Everbright Polestar)**: +12% All-Attribute DMG Bonus; on inflicting Tune Rupture-Shifting or Fusion Burst, her Liberation DMG ignores 32% target DEF and 10% Fusion RES for 8s — plus strong CRIT Rate/base ATK.
**Emerald of Genesis** (2nd-best, permanent): same base ATK/Crit Rate as the signature, plus ATK% stacking and Energy Regen.
**Commando of Conviction**: best free/No-Gacha option (+30% ATK for 15s on Intro cast).

### Best Echo Set
**Trailblazing Star** (100%, her dedicated set) — 2pc: +10% Fusion DMG. 5pc: inflicting Fusion Burst or Tune Rupture-Shifting grants +20% Crit Rate and +20% Fusion DMG Bonus for 8s, easily upkept throughout her rotation.

**Main echo**: **Sigillum** — grants +20% Liberation DMG Bonus specifically when equipped in Aemeath's own main slot.

**Best Echo Stats**: 4-cost Crit Rate/Crit DMG · 3-cost Fusion DMG · 3-cost ATK% = Fusion DMG · 1-cost ATK% ×2.
**Substat priority**: Energy Regen (until satisfied) > Crit DMG = Crit Rate > ATK% > Liberation DMG% > ATK.

### Endgame Stat Targets (Lv.90)
HP 15000+ · DEF 1100+ · ATK 2000–2400+ · Crit Rate 65%+ (before set bonuses) · Crit DMG 210–260%+ · Energy Regen 115–125%+ (low end: Lynae+Mornye team; high end: Jianxin+Mornye team) · Fusion DMG Bonus 40–70%+.

### Skill Priority
Liberation > Forte Circuit > Resonance Skill > Basic Attack > Intro Skill (Basic/Intro skippable for minimal loss; Liberation/Forte matter far more than Skill).

---

## Gameplay & Teams

### Standard Rotation (non-quickswap)
Opener: cast Skill immediately to start in Mech form (faster animation-cancel windows, marginally higher damage) — `Skill: Mech Basic 1` (switch to Mech).
Then: Intro (Mech) → Basic: Mech 3 → Basic: Mech 4 (cancel via Ultimate) → Ultimate: Overdrive → Basic: Mech 2 → Basic: Mech 3 → Basic: Mech 4 (cancel via Skill) → Skill: Duet Encore → Basic: Aemeath 2 → Basic: Aemeath 3 → Basic: Aemeath 4 (cancel via Skill) → Skill: Duet Overture → Heavy: Mech II (cancel via Ultimate) → Ultimate: Finale → Skill: Mech Basic 1 (switch to Mech) → Outro.
Echo: usable at any point (simple Summon).

Maxes her self-buffs with minimal swap-cancels while keeping rotation time low (useful in the Lynae+Mornye team).

### Advanced (Quickswap) Rotation
Swap in from another character → Basic: Aemeath 2 → 3 → 4 (swap) → repeat that string once more → Intro (either form) → Ultimate: Overdrive → Skill: Duet Encore → Basic: Aemeath 2 → 3 → 4 (cancel via Skill) → Skill: Duet Overture → Heavy: Mech II (cancel via Ultimate) → Ultimate: Finale → Outro.
Spends ~4 more seconds outside her Intro window than the Standard Rotation, letting shorter Outro buffs (e.g. Changli's) still cover her best attacks — required if pairing her with Changli, also useful for Mono Fusion/Fusion Burst/any quickswap team.

### S1+ Opener Rotation
Uses the extra Heavy-ATK-based Forte generation available at Sequence 1+ to fit 3 Forte casts into one rotation (not used in quickswap, since quickswap can optimize further):
`Skill: Mech Basic 1` (switch, swap) → Intro (Mech) → Basic: Mech 3 → Basic: Mech 4 (interrupt via Ultimate) → Ultimate: Overdrive → Skill: Aemeath Basic 1 (switch to Aemeath) → Skill: Duet Overture → Heavy: Mech II → Basic: Mech 3 → Basic: Mech 4 (interrupt via Skill) → Skill: Duet Encore → Basic: Aemeath 2 → 3 → 4 (interrupt via Skill) → Skill: Duet Overture → Heavy: Mech II (cancel via Ultimate) → Ultimate: Finale → Skill: Mech Basic 1 (swap) → Outro → continue with normal loop rotations.

### Synergies

**Lynae / Denia** — "Aemeath's ideal second slot partners are Lynae in Tune Rupture mode and Denia in Fusion Burst mode. While Lynae can draw out more single-target power from Aemeath with little effort, Denia enables quickswap playstyles that allow Aemeath to reach a higher ceiling, a close baseline, and a much stronger AoE presence thanks to the AoE-damaging nature of Fusion Burst as well as constant off-field grouping. Massive buffing and personal damage are provided by the two for some of the strongest teams in the entire game by a mile."

**Lupa / Changli / Brant** — "Enabled by Lupa, Mono Fusion is also one of Aemeath's best team archetypes to play in. Lupa is the enabler as she provides party-wide Fusion RES Ignore, Fusion DMG Bonus, ATK buffs and has a solid generally usable Outro. She can also pair with Denia on alternative Echo Set choices to make for a Fusion Burst team almost as strong as the one with Chisa. Changli provides Fusion DMG and Liberation DMG Amplification on her Outro which can make her strong, but the short nature of its duration makes it only worth using over Brant if his Sustain and longer Outro buffs are not needed by nature of strong Quickswap gameplay."

**Mornye / Chisa / Suisui / The Shorekeeper / Verina** — "The best general Supports for Aemeath. Mornye is always the strongest since Aemeath applies her own Tune Rupture for Mornye to bounce off of and buff her to the max of her abilities, even at S0. She is also an excellent Fusion support with Lupa as she enables her full Mono Fusion buffs. However, in full-fledged Fusion Burst teams, Chisa remains ideal above Suisui and Lupa when alongside Denia, while the latter two remain close contenders. Shorekeeper and Verina are however always strong alternatives that should not be underestimated if you don't have access to either team."

### Example Teams
- **Best Fusion Burst Team**: Aemeath + Denia + **{Chisa / Suisui / Lupa}**. With Lupa: run her on Moonlit Clouds alongside Denia on Flaming Clawprint — Lupa's Outro buffs Aemeath, and Denia rotates first to Outro into Lupa.
- **Best Tune Rupture Team**: Aemeath + Lynae + Mornye. Alternatives for the 3rd slot: Shorekeeper, Verina (both viable), Lupa (strong in Quickswap), Chisa (viable if run in Fusion Burst mode too).
- **Mono Fusion**: Aemeath + Lupa + **{Mornye / Brant / Changli / Galbrena}**. Brant/Changli go in the 2nd slot with Lupa's Outro buffing them, while Lupa's Outro buffs Aemeath alongside Mornye/Galbrena. Changli only beats Brant in quickswap teams; Galbrena only works in quickswap and is a significantly more advanced Dual-DPS playstyle for Aemeath.

---

## Calculations

### Real Damage-Type Breakdown (Prydwen's own simulated rotation, S0, buffed team: Denia+Chisa)
Confirmed via the pie chart's own color-coded legend (3 pages: Basic+Liberation, Intro+Echo, Fusion Burst):

| Type | DMG | Share |
|---|---|---|
| Basic ATK | 91,118 | 6.0% |
| Heavy ATK | 0 | 0% |
| Skill | 0 | 0% |
| **Liberation** | 849,871 | **56.4%** (green, largest wedge) |
| Intro | 19,006 | 1.3% |
| Outro | 0 | 0% |
| Echo | 34,765 | 2.3% |
| **Fusion Burst** | 512,904 | **34.0%** (yellow) |

Note: her real, damage-computed profile shows **Liberation** as her single largest damage source (56.4% — Heavenfall Edict Overdrive/Finale plus both Seraphic Duet casts, which are explicitly "counted as Resonance Liberation DMG"), with the distinct **"Fusion Burst" damage type** (proc/status damage from her own kit, not tied to a specific button) second at 34.0%, and Basic ATK (6.0%) a distant third — Skill and Heavy ATK are a real 0%, since every one of her nominal Skill-slot casts is Liberation-categorized and she has no practical-rotation Heavy ATK usage besides the one Sync-Rate-refill cast (not in this specific calc run).

### Damage Output by Sequence (S0→S6, 1-target, solo — no team/buff contribution)
Rotation time: 11.69s. Build: Everbright Polestar R1, 5pc Trailblazing Star, Sigillum main echo (Crit DMG / ATK% / Fusion DMG / ATK% / ATK%).

| Sequence | DMG | DPS | Relative % |
|---|---|---|---|
| S0 | 1,498,026 | 128,145 | 100.00% |
| S1 | 1,613,868 | 138,055 | 107.73% |
| S2 | 1,983,991 | 169,716 | 132.44% |
| S3 | 2,465,916 | 210,942 | 164.61% |
| S4 | 2,581,963 | 220,869 | 172.36% |
| S5 | 2,581,963 | 220,869 | 172.36% |
| S6 | 4,793,430 | 410,045 | 319.99% |

Note S4 and S5 again produce byte-identical DMG/DPS — S5 (Starflux reset + revive-on-death mechanic) has zero real DPS component, same pattern already seen and already correctly modeled (zeroed) for Augusta's S5.
