# Qiuyuan — Prydwen.gg source dump (cleaned)

Source: prydwen.gg/wuthering-waves/characters/qiuyuan
Last updated (per page): 20/August/2026 · Last review update: Patch 2.7 · Last major build/calcs update: Patch 2.7

5★ Aero Sword, Hybrid (Echo Skill DMG buffer).

---

## Kit

### Basic Attack — Inkwash

- **Basic Attack**: up to 3 consecutive hits, Aero DMG.
- **Heavy Attack**: consumes STA, Aero DMG. Press Normal Attack shortly after to chain into Basic Attack Thus Spoke the Blade: Inkwash Stage 4.
- **Mid-air Attack**: consumes STA, plunging attack, Aero DMG.
- **Dodge Counter**: Normal Attack after a successful Dodge, Aero DMG, counted as Heavy Attack. Moments after a Basic/Heavy Attack, Qiuyuan becomes immune to the next DMG instance and auto-casts Dodge Counter if attacked.

**Multipliers (Lv.10):**
| Move | Value |
|---|---|
| Basic ATK Stage 1 | 41.76% |
| Basic ATK Stage 2 | 34.80%×2 |
| Basic ATK Stage 3 | 24.64%×4 + 65.69% |
| Mid-air Attack | 116.91% |
| Heavy Attack | 165.61% |
| Dodge Counter | 194.84% + 27.84%×3 |
| Mid-air Attack STA cost | 30 |
| Heavy Attack STA cost | 20 |

### Resonance Skill — Through the Groves / Undaunted Wayfarer

- **Through the Groves**: dash forward, Aero DMG, **counted as Echo Skill DMG**. If cast while being attacked, grants DMG immunity to that hit + stagnates nearby enemies + interruption immunity during the dash. Switching characters removes Stagnation.
- **Undaunted Wayfarer** (hold): dash forward consuming STA, Aero DMG, **counted as Echo Skill DMG**. If no targets nearby, leap and dash through the air consuming STA until empty or released; on landing near targets, deals Aero DMG to them, **counted as Echo Skill DMG**. Castable mid-air.

**Multipliers (Lv.10):**
| Move | Value |
|---|---|
| Skill DMG | 71.84%×3 |
| Undaunted Wayfarer DMG | 32.33% + 32.33%×3 + 86.21% |
| Cooldown | 14s |
| Concerto Regen | 10 |
| Undaunted Wayfarer Concerto Regen | 10 |

### Resonance Liberation — Sundering Strike

- Deal Aero DMG to targets in range, **counted as Echo Skill DMG**.
- For every 1% of Qiuyuan's Crit Rate over 50%, grants all nearby active team members +2% Crit DMG for 30s, up to +30% (i.e. capped once Crit Rate reaches 65%+).

**Multipliers (Lv.10):**
| Move | Value |
|---|---|
| Skill DMG | 795.24% |
| Cooldown | 25s |
| Resonance Energy cost | 125 |
| Concerto Regen | 20 |

### Forte Circuit — Verdant Edge

- **Basic Attack — Thus Spoke the Blade: Inkwash**: unlocked at 200 Swordster's Soliloquy, replaces Basic Attack, up to 4 hits, Aero DMG, **counted as Heavy Attack DMG**.
- **Bamboo's Shade**: at 400 Soliloquy, grants all nearby active team members +30% Echo Skill DMG Bonus for 30s.
- **Inksplash of Mind**: at 600 (full) Soliloquy, enters for 8s — Heavy Attack replaced by **Thus Spoke the Blade: To Save**; hold Normal Attack to consume Soliloquy and chain **To Teach → To Save → To Sacrifice** in order, Aero DMG, **counted as Heavy Attack DMG**. Each of these three moves also **counts as casting Echo Skill**. Ends when Soliloquy is used up.
- **Swordster's Soliloquy** (cap 600): +100 from Basic Stage 3; +100 per Inkwash stage; +100 from Dodge Counter; +400 from Intro Skill. Not gained while in Inksplash of Mind; cleared when Inksplash of Mind ends.

**Multipliers (Lv.10):**
| Move | Value |
|---|---|
| Inkwash Stage 1 | 59.65%×2 |
| Inkwash Stage 2 | 55.65%×2 + 74.20% |
| Inkwash Stage 3 | 14.58%×5 + 72.87% |
| Inkwash Stage 4 | 172.37% |
| To Teach | 91.44%×5 |
| To Save | 38.44%×3 + 31.45%×3 |
| To Sacrifice | 217.70% |

### Inherent Skills

- **Quietude Within**: gained for 10s on entering Inksplash of Mind (once per 22s). To Teach/To Save/To Sacrifice deal +50% more DMG; To Sacrifice additionally restores 30 Concerto Energy on hit. Ends early if switched off-field.
- **Drink Away Woes Age-Old**: casting Echo Skill brews Flowing Panacea; next time Soliloquy is gained, consumes it for +10% ATK for 20s.

### Intro Skill — Attack the Must-Defend

- Attack, Aero DMG, **counted as Heavy Attack DMG**. Shortly after, press Normal Attack to perform Inkwash Stage 3 directly.

**Multipliers (Lv.10):**
| Move | Value |
|---|---|
| Skill DMG | 9.55%×5 + 47.72% + 143.15% |
| Concerto Regen | 10 |

### Outro Skill — Strike Before Ready

- Attack, Aero DMG = 100% ATK, **counted as Echo Skill DMG**. Grants incoming character +50% Echo Skill DMG Amplification for 14s or until swapped out.

### Resonance Chain (Sequences)

- **S1**: To Teach/To Save/To Sacrifice can no longer be interrupted. +20% Crit Rate.
- **S2**: Bamboo's Shade grants an additional +30% Echo Skill DMG Amplification to nearby team members.
- **S3**: Sundering Strike DMG Multiplier +500%. If Concerto Energy is full while not in Inksplash of Mind, Skill is replaced with **Straw Cape in Drizzly Rain** (once per 20s): ends Quietude Within immediately, consumes 60 Concerto Energy to deal Aero DMG = 500% ATK (**counted as Echo Skill DMG**), restores 400 Soliloquy; next Basic Attack replaced with Inkwash Stage 3. Casting it also: removes the next Quietude Within grant on next Inksplash of Mind entry; gives To Teach/To Save/To Sacrifice +600% DMG Multiplier and +30 Concerto Energy restore on hit; outside Co-op, replaces the next Outro with **Sheath Fallen, New Shoots Revealed** (Aero DMG = 500% ATK, **counted as Echo Skill DMG**).
- **S4**: ATK +20%.
- **S5**: Ignores 15% target DEF.
- **S6**: Casting To Sacrifice stagnates nearby targets for 5s or until damaged/swapped off (not in Co-op). While active on-field, exiting Inksplash of Mind deals Aero DMG = 600% ATK to targets in range, **counted as Echo Skill DMG**. Casting Straw Cape in Drizzly Rain grants +100% Crit DMG for 6s (ends early on swap).

### Minor Fortes
Crit Rate +8%, ATK% +12%.

### Base Stats (Lv.90, incl. minor fortes)
HP 12238 · ATK 375 · DEF 1198 · Max Energy 125 · Crit Rate 5% · Crit DMG 150%

---

## Review

**DPS tier**: **T0** (Tower of Adversity + Whimpering Wastes, standard) / **T0.5** (Tower of Adversity, Value) / **T0** (Whimpering Wastes, Value) — labeled **Hybrid**.

**Pros**
- Quick rotation, strong specialized buffing, easy gameplay — high-quality buffer.
- Echo Skill DMG niche is currently very strong (Sigrika, Phrolova, Galbrena), for which he's the buffer of choice.
- Very good, permanently accessible weapon options — doesn't strictly need his Signature (unlike more recent Hybrids), keeping his cost lower.

**Cons**
- His value is tied to Echo Skill damage dealers until at least S3 — dies alongside that archetype's relevance, no guarantee of long-term maintenance (precedent: Coordinated Attacks & Youhu).
- Optimal Echo sets vary by team choice — keeping him flexible across teams can be resource-expensive.
- Arguably the most inconsistent Hybrid in the game until S1 — getting interrupted during his Forte Heavy Attack chain is common and can ruin Concerto generation/buff application.

**Key mechanics**
- Forte gauge "Swordster's Soliloquy" (cap 600, in thirds of 200): 200 → enhanced Inkwash Basics; 400 → 30% Echo Skill DMG Bonus to the **active** team member for 30s; 600 → Inksplash of Mind, casts 3 Forte Heavy Attacks (To Teach/To Save/To Sacrifice), restores lots of Concerto Energy, good damage, empties Forte, ends rotation.
- Ultimate grants up to +30% Crit DMG to the active resonator (himself included) at 65%+ Crit Rate — this and the 400-Forte Echo Skill buff apply **only to the active resonator**, not Coordinated/off-field characters (relevant for Phrolova's Hecate — synergy still present regardless per the review).
- Outro grants +50% Echo Skill DMG Amplification to the next character for 14s (expires on further swap) — relevant mainly for Galbrena and Sigrika.
- Also buffs teams via Signature weapon (+20% Echo Skill DMG Bonus, team-wide) and via 2 Echo sets (Moonlit Clouds, Law of Harmony).
- Unused in his standard rotation: non-Inkwash Basic Attack moves, regular Heavy Attack. Dodge Counter is fine to use opportunistically during Forte generation (not while casting Forte Heavy Attacks).
- At S3+, unlocks a unique Skill (Straw Cape in Drizzly Rain) replacing Intro's role to repeat his Basic/Forte-Heavy sequence a second time — unlocks a DPS playstyle, while the standard Skill (hold) remains available for Resonance Energy as a buffer.

**Meta position**: strong meta position — best 2nd-slot teammate for Galbrena, best 3rd-slot teammate for Phrolova, and part of Sigrika's best team alongside Ciaccona. Replaceable everywhere he's used (by Lupa for Galbrena, by Lucilla/Roccia/Shorekeeper/Danjin for Phrolova at lower budget, by Lucilla for Sigrika's 2nd slot) — never strictly necessary, but among the best options in 3 of the strongest teams in the game (Phrolova and Sigrika both top Whimpering Wastes teams).

---

## Build

### Best Weapons (buffs assumed: Sigrika + Solsworn Ciphers + Sound of True Name + Nameless Explorer, Ciaccona + Woodland Aria + Gusts of Welkin + Nightmare: Kelpie)
| Weapon | Score |
|---|---|
| Emerald Sentence (R1, signature) | 100.00% |
| Red Spring (R1) | 85.20% |
| Blazing Brilliance (R1) | 84.40% |
| Emerald of Genesis (R1) | 84.10% |
| Feather Edge (R5, 4★, Battle Pass) | 80.10% |
| Commando of Conviction (R5, 4★, No-Gacha/free) | 74.10% |
| Bloodpact's Pledge (R1) | 72.80% |
| — (best free option, no % listed — 5★-level base stats despite unusable passive) | — |

**Signature (Emerald Sentence)**: +12% ATK; casting Echo Skill within 10s of Intro/Basic grants a stack of Bamboo Cleaver (+30% Heavy Attack DMG Bonus, up to 2 stacks, 12s, once per 10s, ends on swap-off); casting Intro grants the whole team +20% Echo Skill DMG Bonus for 30s. Review notes: his personal damage is on the low end and the team buff is rather low, so this is skippable given good permanently-available alternatives exist.
**Emerald of Genesis**: best permanently-available option by far — provides Energy Regen, Crit Rate, ATK in the quantities he wants; can replace Signature at minimal loss.
**Bloodpact's Pledge**: best free weapon choice (5★-level base stats) despite an unusable passive — weapon rank irrelevant.

### Best Echo Sets

**1) Law of Harmony** (100%) — 3pc: casting Echo Skill grants +30% Heavy Attack DMG Bonus to the caster for 4s, plus all team members +4% Echo Skill DMG Bonus for 30s (stacks ×4, one trigger per Echo of the same name, resets duration at 4 stacks on recast). Optimal in Phrolova teams and DPS Qiuyuan teams — mix of personal damage and team buffing.
Pair with (2pc): Sierra Gale / Gusts of Welkin / Windward Pilgrimage / **Sound of True Name (recommended)** / Moonlit Clouds (2pc) / Endless Resonance (2pc) / Reel of Spliced Memories / Empyrean Anthem (2pc) / Tidebreaking Courage.
Main Echo: **Reminiscence: Fenrico** (best generalist — +12% Aero + 12% Heavy DMG Bonus in main slot); **Bell-Borne Geochelone** (niche, with 2pc Moonlit Clouds, optimal in Phrolova+Cantarella at S0R1 or lower — +10% party DMG Bonus for 15s, best cast right before Ultimate/after Inkwash Basic 4).

**2) Moonlit Clouds** — 2pc: +10% Energy Regen. 5pc: on Outro cast, next character's ATK +22.5% for 15s. Optimal with Galbrena + Shorekeeper — sacrifices Qiuyuan's personal damage for higher single-target buffing.
Main Echo: **Impermanence Heron** — only real 5pc option, +12% DMG Bonus stacked on top of the ATK boost to the next character, restores significant Energy on cast. Usable before rotation (during e.g. Shorekeeper's rotation) or interrupted via Ultimate (no Energy/damage generated, buff still applies).

**Best Echo Stats**: 4-cost Crit Rate/Crit DMG · 3-cost Aero DMG · 3-cost Aero DMG > ATK% · 1-cost ATK% ×2.
**Substat priority**: Energy Regen (until satisfied) > Crit Rate = Crit DMG > ATK% > Heavy Attack DMG% > ATK.

### Endgame Stat Targets (Lv.90)
HP 16500+ · DEF 1150+ · ATK 1600–2400+ · Crit Rate 65–80%+ · Crit DMG 210–260%+ · Energy Regen 115–130%+ (low end: Galbrena+Shorekeeper team; high end: Phrolova+Cantarella team) · Aero DMG Bonus 40–70%+.

### Skill Priority
Forte Circuit > Resonance Liberation > Intro Skill > Resonance Skill > Basic Attack.

---

## Gameplay & Teams

### Standard Hybrid Rotation (S0–S2)
Intro → Basic: Inkwash 3 → Basic: Inkwash 4 (optional: cancel via Skill) → optional Skill (cancel via Ultimate) → Ultimate → Heavy: To Teach → Heavy: To Save → Heavy: To Sacrifice → Outro.

Skill is usable before the rotation in Quickswap (optimal), or mid-rotation in solo/123 play if Energy Regen requires it — not a huge DPS loss to cast it when necessary.

Echo timing: with Law of Harmony, cast immediately (benefits Inherent Skill ATK buff — Reminiscence: Fenrico has no relevant cast timing beyond that). With Impermanence Heron (5pc Moonlit Clouds), cast before rotation (optimal, benefits flat Energy regen + damage) or at the very end interrupted by Outro. With Bell-Borne Geochelone (2pc Moonlit Clouds, Phrolova teams), cast right before Ultimate to buff Phrolova's Enhanced Hecate attacks and most of the rotation.

### S3+ DPS Rotation
Intro → Basic: Inkwash 3 → Basic: Inkwash 4 → Ultimate → Heavy: To Teach → Heavy: To Save → Heavy: To Sacrifice → Skill: Straw Cape in Drizzly Rain → Basic: Inkwash 3 → Basic: Inkwash 4 → Heavy: To Teach → Heavy: To Save → Heavy: To Sacrifice → Outro.

As DPS, always runs 3pc Law of Harmony with Reminiscence: Fenrico as main Echo, cast immediately after Intro.

### Synergies

**Sigrika / Galbrena / Phrolova** — best 2nd-slot for Galbrena, best 3rd-slot for Phrolova. For Galbrena/Sigrika: best buffer via Echo Skill DMG buffs including Outro. For Phrolova: multiple Echo Skill casts activate Hecate Enhanced Attacks, and he's a good recipient of Phrolova's 25% Heavy DMG Amplification Outro.

**The Shorekeeper / Verina** — best generalist Supports, slot in almost any team (team-wide ATK% + 15% DMG Amplify). Shorekeeper additionally provides Crit Rate/Crit DMG, making her the best 3rd slot for Galbrena+Qiuyuan; Verina is a close, more accessible alternative.

### Example Teams
- **Best Team**: Sigrika + Qiuyuan + Ciaccona / The Shorekeeper + Phrolova + Verina (Phrolova stronger in multi-wave scenarios like Whimpering Wastes, but has stronger teams of her own).
- **Phrolova Team**: Phrolova + Lucilla + Cantarella / Lynae + Danjin + Qiuyuan.
- **Galbrena Team**: Galbrena + Qiuyuan + The Shorekeeper / Verina.

---

## Calculations

### Real Damage-Type Breakdown (Prydwen's own simulated rotation, S0, solo/no buffs)
| Type | DMG | Share |
|---|---|---|
| Basic ATK | 0 | 0% |
| **Heavy ATK** | 90,775 | **60.8%** |
| Skill | 0 | 0% |
| Liberation | 0 | 0% |
| Intro | 0 | 0% |
| Outro | 0 | 0% |
| **Echo** | 58,465 | **39.2%** |

Note: page's pie legend only shows Heavy (60.8%) and Echo (39.2%) as nonzero — all other categories (Basic, Skill, Liberation, Intro, Outro) show 0%. This matches his kit: Inkwash Basics are explicitly recategorized as Heavy Attack DMG, To Teach/To Save/To Sacrifice are also Heavy-categorized, and his Skill/Liberation/Intro/Outro moves are all explicitly "counted as Echo Skill DMG."

### Damage Output by Sequence (S0→S6, 1-target, solo — no team/buff contribution)
Rotation time: 6.35s. Build: Emerald Sentence R1, 3pc Law of Harmony + 2pc Sierra Gale, Reminiscence: Fenrico main echo (Crit Rate / Aero DMG / Aero DMG / ATK / ATK).

| Sequence | DMG | DPS | Relative % |
|---|---|---|---|
| S0 | 149,240 | 23,502 | 100.00% |
| S1 | 172,044 | 27,093 | 115.28% |
| S2 | 192,263 | 30,277 | 128.83% |
| S3 | 231,669 | 36,483 | 155.23% |
| S4 | 251,252 | 39,567 | 168.36% |
| S5 | 272,134 | 42,855 | 182.35% |
| S6 | 311,462 | 49,049 | 208.70% |
