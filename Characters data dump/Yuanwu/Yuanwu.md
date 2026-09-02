# Yuanwu — Prydwen.gg source dump (cleaned)

Source: prydwen.gg/wuthering-waves/characters/yuanwu
Last updated (per page): 20/August/2026 · Last review update: Patch 2.1 · Last major build/calcs update: Patch 2.1

4★ Electro Gauntlets, Support/Hybrid. Free character (Ephor's Boxing Gym owner).

---

## Kit

### Basic Attack — Leihuangquan

- **Basic Attack**: up to 5 continuous hits, Electro DMG.
- **Heavy Attack**: consumes Stamina, Electro DMG.
- **Mid-air Attack**: consumes Stamina, plunging attack, Electro DMG.
- **Dodge Counter**: Basic Attack after a successful Dodge, Electro DMG.

**Multipliers (Lv.10):**
| Move | Value |
|---|---|
| Basic ATK Part 1 | 49.11% |
| Basic ATK Part 2 | 51.81%×2 |
| Basic ATK Part 3 | 21.84%×2 + 32.76%×2 |
| Basic ATK Part 4 | 51.81%×2 |
| Basic ATK Part 5 | 49.11%×2 + 65.48% |
| Heavy Attack | 159.05% |
| Mid-air Attack | 98.61% |
| Dodge Counter | 114.52%×2 |
| Heavy Attack STA cost | 20 |
| Mid-air Attack STA cost | 30 |

### Resonance Skill — Leihuang Master (Thunder Wedge)

Summons **Thunder Wedge** (Electro DMG on summon), forming a **Thunder Field** centered on it. Thunder Wedge lasts **12s**.

Forte Circuit "Rumbling Spark" and Liberation "Blazing Might" immediately **detonate** the on-field Thunder Wedge, dealing Electro DMG, **counted as Resonance Skill DMG**.

**Thunder Field**: the on-field character (any team member, not just Yuanwu) triggers a **Coordinated Attack** from Thunder Wedge whenever their hits land inside it — Electro DMG, once per 1.2s, effect lasts 1.5s.

**Multipliers (Lv.10):**
| Move | Value |
|---|---|
| Skill (Thunder Wedge summon) DMG | 23.86% |
| Thunder Wedge Coordinated Attack DMG | 7.96% DEF |
| Thunder Wedge Detonation DMG | 59.65% DEF |
| Rumbling Spark DMG | 108.54% DEF |
| Thunder Wedge duration | 12s |
| Cooldown | 3s |
| Leihuang Master Concerto Regen | 3 |
| Rumbling Spark Concerto Regen | 25 |

### Resonance Liberation — Blazing Might

Grants **Lightning Infused** (Forte Circuit status) to all nearby characters for 10s — increased Anti-interruption. Then deals a powerful Electro DMG blow.

**Multipliers (Lv.10):**
| Move | Value |
|---|---|
| Skill DMG | 174.96%×2 DEF |
| Cooldown | 20s |
| Resonance Energy cost | 125 |
| Concerto Regen | 20 |

### Forte Circuit — Unassuming Blade

- **Rumbling Spark**: at full "Readiness", hold Resonance Skill to consume all Readiness — Electro DMG, enters Lightning Infused.
- **Thunder Uprising**: at full Readiness, Thunder Wedge cast instead triggers this — Electro DMG.
- **Lightning Infused**: greatly increased anti-interruption. While active:
  - Basic Attacks hit a larger area, deplete enemy Vibration Strength faster.
  - Heavy Attacks: attack speed up, deplete Vibration Strength faster.
  - Dodge Counters: attack speed up, deplete Vibration Strength faster.
  - Using Basic Attack within 3s of a Heavy Attack or a successful counterattack triggers **Thunderweaver** — Electro DMG, **counted as Basic Attack damage**.

**Readiness** (0–100): +6/s while Thunder Wedge is on the field (even off-field); +5 per Thunder Wedge Coordinated Attack hit.

**Multipliers (Lv.10):**
| Move | Value |
|---|---|
| Thunder Uprising DMG | 39.77% DEF |
| Lightning Infused Basic ATK Part 1 | 24.56% DEF |
| Lightning Infused Basic ATK Part 2 | 25.91%×2 DEF |
| Lightning Infused Basic ATK Part 3 | 10.92%×2 + 16.38%×2 DEF |
| Lightning Infused Basic ATK Part 4 | 11.46%×5 DEF |
| Lightning Infused Basic ATK Part 5 | 16.37%×3 + 32.74% DEF |
| Lightning Infused Heavy Attack | 31.02% DEF |
| Thunderweaver | 31.02% + 20.68%×2 DEF |
| Lightning Infused Dodge Counter | 43.27% + 32.45%×2 (DEF-scaling, unit not explicitly repeated in source but consistent with row) |

*(Note: every one of these Lightning Infused / Thunder Wedge / Rumbling Spark / Liberation values is explicitly DEF-scaling, not ATK-scaling — Yuanwu is a DEF-scaler.)*

### Intro Skill — Thunder Bombardment
Electro DMG. Multiplier (Lv.10): **63.62% DEF**. Concerto Regen: 10.

### Outro Skill — Lightning Manipulation
Summons thunderbolts on a field centered on the skill target, dealing **significant Vibration Strength depletion** to enemies hit. **No direct DMG stated.**

### Resonance Chain (Sequences)

- **S1**: While in Lightning Infused, Basic Attack Speed +20% and Heavy Attack Speed +20%.
- **S2**: Intro Skill (Thunder Bombardment) additionally recovers 15 Resonance Energy for Yuanwu.
- **S3**: Thunder Wedge's Coordinated Attack DMG additionally increased by 20% of Yuanwu's DEF.
- **S4**: Casting Liberation (Blazing Might) grants the on-field character a Shield = 200% of Yuanwu's DEF for 10s.
- **S5**: While Thunder Wedge is on the field, Yuanwu's Resonance Liberation DMG Bonus +50%.
- **S6**: All team members near Thunder Wedge's range gain +32% DEF for 3s.

### Minor Fortes
Electro DMG +12%, DEF% +15.2%.

### Base Stats (Lv.90, incl. minor fortes)
HP 8525 · ATK 225 · DEF 1638 · Max Energy 125 · Crit Rate 5% · Crit DMG 150%

---

## Review

**Support tier**: T4 (both Tower of Adversity and Whimpering Wastes, standard and value lists).

**Pros**
- Surprisingly great at triggering the Rejuvenating Glow healing set (via Originite: Type IV's self-heal on Basic Attack).
- Shortest rotation time in the game — just Basic Attack, Skill, Echo.
- Needs zero investment to perform his role.
- Arguably the easiest character to play.
- Gives the whole team Interruption Resistance.
- Great at shredding enemy stagger/Vibration Strength bars.
- He's free.

**Cons**
- Provides almost no buffs compared to other supports.
- Needs to replace Thunder Wedge often against mobile enemies.
- Deals essentially zero damage unless heavily invested (with poor returns).
- As of Patch 1.4, only works well in one team (Jinhsi) — not even the strongest option there, discouraging investment further.

**Key mechanics**
- Skill (Thunder Wedge, 3s cooldown to re-place) is the core of his kit: a large circular field that generates Forte via Coordinated Attacks (every 1.2s) against anyone hit inside it, damage scaling off his DEF. Lasts 12s.
- At full Forte, an enhanced Skill early-detonates the Wedge for a bigger DEF-scaling burst, then enters an empowered-attack state (subpar damage even then).
- Liberation deals DEF-scaling damage, grants the Forte's enhanced state (Interruption Resistance) to the WHOLE team, and also detonates Thunder Wedge (helps Concerto Energy generation).
- Overall wants minimal field time — place Thunder Wedge and leave immediately; his own empowered combo isn't worth staying on-field for.

**Why he's low tier**: no real damage output and no real buffs — doesn't fill either of the two roles that make a support "meta" (healing, or buffing). His one real niche: he can refresh his Coordinated-Attack-triggering Thunder Wedge with ~100% uptime, making him the best Forte-stack generator for **Jinhsi** specifically (who scales off Coordinated Attacks) — the only character who currently does this well. In that one role, he's viable even completely unbuilt (Lv.1, 3★ weapon, Lv.0 echoes) since his own damage contribution barely matters. Still: he does very little personal damage even there, works in exactly one team, and needs a somewhat awkward second-support build (Moonlit Clouds on the OTHER support) to fully optimize.

**Conclusion**: usable in exactly one team (Jinhsi), not useful elsewhere — but genuinely recommendable there given how little investment he needs, and how easy he is to play.

---

## Build

### Calculation results (solo, no team buffs — see caveats below)
Rotation time: 2.96s. Solo DPS scaling by sequence:
| Sequence | DMG | DPS | Relative % |
|---|---|---|---|
| S0 | 78,379 | 26,470 | 100.00% |
| S1 | 78,379 | 26,470 | 100.00% |
| S2 | 78,379 | 26,470 | 100.00% |
| S3 | 97,058 | 32,779 | 123.83% |
| S4 | 97,058 | 32,779 | 123.83% |
| S5 | 103,122 | 34,827 | 131.57% |
| S6 | 115,310 | 38,943 | 147.12% |

(Build used for calcs: Amity Accord R1, 5pc Void Thunder, Nightmare: Tempest Mephis main echo — Crit Rate/Electro DMG/Electro DMG/DEF%/DEF% cost lineup, substats weighted toward Crit Rate/Crit DMG/Energy Regen.)

**Prydwen's own caveat**: these numbers are solo (no team/weapon/echo buffs from allies), meant only for comparing his own sequences/rotations against each other — not a tier-list metric.

### Best Weapons
Two build contexts:

**As a personal-damage DEF-scaler:**
| Weapon | Score |
|---|---|
| Verity's Handle (R1, Xiangli Yao signature) | 101.32% |
| Amity Accord (R5) | 100.00% |
| Stonard (R5) | 93.03% |
| Guardian Gauntlets (R5, F2P) | 90.36% |
| Originite: Type IV (R5) | 85.91% |
| Gauntlets of Voyager (R5) | 85.01% |
| Abyss Surges (R1) | — (no % listed) |

**As a Support triggering Rejuvenating Glow**: use **Originite: Type IV** — its self-heal-on-Basic-Attack (bad combat stats otherwise) is specifically what activates the 5pc Rejuvenating Glow healing-triggered set.

### Best Echo Sets
Two viable directions:
1. **Rejuvenating Glow** (top pick) — 10% Healing Bonus + 15% team-wide ATK% for 30s whenever Yuanwu heals himself or an ally (very easy 100% uptime via Originite: Type IV's self-heal). Main echo options: **Fallacy of No Return** (10% ER + 10% team ATK for 20s on use) or **Bell-Borne Geochelone** (10% team DMG Bonus for 15s + damage-blocking, weaker for this set but a fine fallback).
2. **Moonlit Clouds** (2nd pick) — 10% ER, and on Outro grants the incoming character +22.5% ATK. Main echo: **Impermanence Heron** (swap-cancel it right before Outro — grants the incoming character +12% DMG, stacking with Moonlit Clouds' own +22.5% ATK; also a large Energy Regen chunk on use, at the cost of the wearer's own damage).

**Special-case set**: Empyrean Anthem — 10% ER + 80% Coordinated DMG, plus an on-crit-Coordinated-Attack team ATK% buff. Main echo: Nightmare: Tempest Mephis (+12% Electro DMG + 12% Skill DMG in the main slot).

**Best Echo Stats**: 4-cost Crit Rate/Crit DMG · 3-cost Electro DMG · 3-cost Electro DMG > DEF% · 1-cost DEF% ×2.
**Substat priority**: Energy Regen (until satisfied) > Crit Rate = Crit DMG > DEF% > flat DEF.

### Endgame Stat Targets (Lv.90)
"Yuanwu is a Support who deals very low personal damage — investing in his damage is fully skippable. Energy Regen requirements are by far the most important stat."
HP 13000+ · DEF 1800+ · ATK 1200+ · Crit Rate 60%+ · Crit DMG 250%+ · **Energy Regen 100%** · Electro DMG Bonus 30–60%+.
Note: "Yuanwu's optimal playstyle in a Jinhsi team does not involve his Resonance Liberation."

### Skill Priority
Liberation > Resonance Skill > Forte Circuit > Intro Skill > Basic Attack.

---

## Gameplay & Teams

Yuanwu has no fixed rotation — he's built around minimal field time. Guidance instead of a strict sequence:

- Building his Forte Gauge fast is the priority — maximizes damage potential, generates Concerto/Resonance Energy.
- While Thunder Wedge is active he gains Forte passively, plus more per Coordinated Attack landed inside its radius (his own or an ally's) — keep it up and in range at all times.
- Fully filling Forte also emits a small AoE pulse of damage.
- Using the charged/enhanced Skill to spend a full Forte Gauge is the easiest way to generate Concerto/Resonance Energy.
- His Liberation and his Forte-empowered Skill both detonate any active Thunder Wedge — make sure it's on the target before using either (it can be re-summoned quickly to minimize downtime).
- His Liberation's Lightning Infused state benefits the whole team with Anti-interruption, persisting even after he swaps out.
- Use Liberation as soon as available (ideally to also detonate a Wedge), unless deliberately saving it to cover a teammate's Anti-interruption need.
- Despite being an "enhanced state" like other characters have, Lightning Infused's multipliers are low enough that staying on-field to use his empowered Basic Attack combo isn't worth it.

**Ability priority**: Echo → Intro (if available) → Skill (place Thunder Wedge) → Liberation (detonates Wedge) → Skill: Forte (Rumbling Spark) → Skill (place Thunder Wedge again) → Outro (if available) → Skill (re-place Thunder Wedge as needed to keep it up and on top of the enemy).

### Synergies

**Jinhsi** — "Yuanwu's only meta use case is to work as a good budget option for Jinhsi teams, as he's free to acquire, takes minimal field time, can activate the Rejuvenating Glow set easily with the Originite: Type IV 3 star weapon, and has the highest Coordinated Attack frequency of any character in the game. The pairing isn't meta, but requires minimal investment to perform, and remains a good option."

**Verina** — "One of the usual Healing Support options that can slot into any team. Super easy to use, provides amazing team-wide ATK% buffs and 15% DMG Amplify with one of the fastest rotations in the game. Make sure to run her with Moonlit Clouds if you're using her along with Yuanwu, as she can trigger her Outro way more consistently & faster than he can every rotation!"

**The Shorekeeper** — "Similar to Verina, a premium Healing Support option who can not only slot into any team, but also provide insane 12.5% Crit Rate, 25% Crit DMG, 25% ATK and 15% DMG Amplify buffs to your whole team. One of the best but also easy to use characters in the game. Make sure to run her with Moonlit Clouds if you're using her along with Yuanwu, as she can trigger her Outro way more consistently & faster than he can every rotation!"

### Example Team ("Best Team")
**Jinhsi + Yuanwu + {The Shorekeeper / Verina}**.
Note: "Make sure to run Yuanwu on Rejuvenating Glow and your third party member on Moonlit Clouds for optimal DPS!"
