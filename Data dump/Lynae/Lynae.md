# Lynae — Prydwen.gg Build Guide (cleaned dump)

Last updated on source: 20/August/2026. Last review update: Patch 3.0. Last major build/calcs update: Patch 3.0.

5★ Spectro Pistols. Generalist Hybrid buffer built around 3 Forte resources (Overflow, Lumiflow, True Color), with a Tune Rupture/Tune Strain Resonance Mode toggle.

## Kit

### Basic Attack — Chroma Drift

- **Basic Attack**: up to 3 consecutive attacks, Spectro DMG.
- **Mid-air Attack**: consumes STA, Plunging Attack, Spectro DMG.
- **Dodge Counter**: press Normal Attack right after a successful Dodge, Spectro DMG.
- **Spark Collision**: with full Overflow (Optical Sampling Stage), hold Normal Attack to charge — 15 Overflow converts to 12.5% Lumiflow every 0.2s, interruption-immune, 50% less DMG taken. Releasing (or hitting full Lumiflow) casts Spark Collision Lv.1/2/3 depending on Lumiflow ratio (<50% / 50-100% / =100%), and puts her into Kaleidoscopic Parade.
- **Kaleidoscopic Parade - Basic Attack**: replaces Basic Attack while in Kaleidoscopic Parade, up to 5 consecutive attacks.
- **Kaleidoscopic Parade - Ground/Mid-air Heavy Attack**: hold Normal Attack (ground or air) — Spectro DMG, considered Basic Attack DMG. Releasing the ground version casts Graffiti Blast (also considered Basic Attack DMG). Mid-air version can't gain charges airborne; charges reset when grounded and active.
- **Kaleidoscopic Parade - Mid-air Attack**: replaces Mid-air Attack in Parade, Plunging Attack.
- **Kaleidoscopic Parade - Dodge Counter**: replaces Dodge Counter in Parade; chains into Kaleidoscopic Basic Stage 2.

**Multipliers (Lv.10):**
| Move | DMG |
|---|---|
| Basic Attack Stage 1 | 86.19% |
| Basic Attack Stage 2 | 52.39%×3 |
| Basic Attack Stage 3 | 123.37% |
| Dodge Counter | 239.97% |
| Mid-air Attack | 14.37%+129.28% |
| Basic Attack - Spark Collision Lv.1 | 55.56%×2 |
| Basic Attack - Spark Collision Lv.2 | 166.67%×2 |
| Basic Attack - Spark Collision Lv.3 | 277.78%×2 |
| Kaleidoscopic Parade - Basic Attack Stage 1 | 82.81% |
| Kaleidoscopic Parade - Basic Attack Stage 2 | 38.87%×2 |
| Kaleidoscopic Parade - Basic Attack Stage 3 | 37.75%×3 |
| Kaleidoscopic Parade - Basic Attack Stage 4 | 29.75%×2+44.62%×2 |
| Kaleidoscopic Parade - Basic Attack Stage 5 | 75.54%+15.11%×5+100.72% |
| Kaleidoscopic Parade - Dodge Counter | 184.20% |
| Kaleidoscopic Parade - Ground Heavy Attack | 17.63%×7 |
| Kaleidoscopic Parade - Graffiti Blast | 104.78% |
| Kaleidoscopic Parade - Mid-Air Attack | 14.37%+129.28% |
| Kaleidoscopic Parade - Mid-air Heavy Attack | 34.77%×7 |

STA costs: Mid-air Attack 30; Kaleidoscopic Ground Heavy (per strike) 25; Kaleidoscopic Mid-air Heavy 25; Kaleidoscopic Mid-air Attack 30.

### Resonance Skill — Lynae-Style Palettes

- **Lynae-Style Palettes**: Spectro DMG. In Kaleidoscopic Parade, holding this replaces it with **Additive Color** (Spectro DMG, ground only, also exits Parade if used via the base-skill hold path). Chains into Basic Attack Stage 2. Shares CD between the two.

**Multipliers (Lv.10):** Lynae-Style Palettes 139.31%+46.44%×3; Additive Color 116.31%×2. Cooldown: 6s each.

### Resonance Liberation — Prismatic Overblast

Deals Spectro DMG and grants all nearby teammates **+24% All DMG Bonus for 30s**. A Basic Attack follow-up ("To a Vivid Tomorrow!") can be cast shortly after.

**Multipliers (Lv.10):** Prismatic Overblast 87.48%×10; To a Vivid Tomorrow! 8.38%×12+10.05%×10. Concerto Regen 20. Cooldown 25s. Energy Cost 125.

### Intro Skill — Time to Show Some Colors!

Spectro DMG, inflicts Photochromic Flux. In Optical Sampling Stage, restores 100 Overflow.

**Multiplier (Lv.10):** 22.48%×10. Concerto Regen 10.

### Outro Skill — Let's Hit the Road!

100% Spectro DMG hit. The next incoming Resonator gains **+15% All DMG Amplification and +25% Resonance Liberation DMG Amplification for 14s** (or until swapped out). Ends Kaleidoscopic Parade (unless S6).

### Forte Circuit — Chromaticity Modeling

- **Optical Sampling Stage** (default state): Overflow recovers via Basic Attack, Lynae-Style Palettes, Mid-air Attack, Dodge Counter. At full Overflow, Spark Collision becomes available; exiting the stage clears Overflow.
- **Kaleidoscopic Parade** (entered via Spark Collision): continuously recovers Lumiflow while moving/casting certain skills; Running/Sprinting replaced by faster Free/Speed Skating.
- **Basic Attack - Polychrome Leap**: Jump replacement (needs ≥1/3 max Lumiflow). Consumes 1/3 max Lumiflow, Spectro DMG, inflicts Photochromic Flux, grants 1 True Color (up to 3). Chains up to 3 airborne stages; switching resets the combo. Stage 2 also pulls in nearby targets.
- **Basic Attack - Iridescent Splash**: airborne, 3 True Color, Visual Impact on CD — Spectro DMG + Photochromic Flux, consumes 3 True Color.
- **Basic Attack - Visual Impact**: airborne, 3 True Color, not on CD — Spectro DMG + Photochromic Flux, consumes 3 True Color, grants nearby team **+40 Tune Break Boost for 30s**. Both literally named "Basic Attack -", i.e. real Basic Attack DMG.
- **Resonance Mode**: Photochromic Flux (from Polychrome Leap/Iridescent Splash/Visual Impact/Intro) inflicts Tune Rupture - Shifting (Rupture mode) or Tune Strain - Shifting (Strain mode) for 25s.
- **Tune Rupture Response - Spectral Analysis**: deals 1 instance of Spectro DMG (considered Tune Rupture DMG) to targets affected by Tune Rupture - Interfered. Multiplier (Lv.10): **1880.75%**.
- **Overflow** (up to 120): see Optical Sampling Stage above.
- **Lumiflow** (up to 120, 360 at S6): +20%/s while moving/climbing/dodging/casting Kaleidoscopic moves; depletes 20%/s while stationary or off-field. Exiting Kaleidoscopic Parade clears it.
- **True Color** (up to 3): +1 per Polychrome Leap cast; cleared on exiting Kaleidoscopic Parade.

**Multipliers (Lv.10):** Iridescent Splash 304.18%; Visual Impact 1216.72%; Polychrome Leap Stage 1 33.80%×3; Stage 2 16.90%×6; Stage 3 13.10%×8; Tune Rupture Response - Spectral Analysis 1880.75% Tune AMP. Visual Impact CD: 25s.

### Forte Circuit — Spectral Analysis (Tune Break response)

Can inflict Tune Rupture/Tune Strain - Shifting; can respond to both Interfered states. Rupture response: any teammate's Tune Break DMG that inflicts Tune Rupture - Interfered triggers Spectral Analysis (once/8s/target). Strain response: +0.12% total DMG per Tune Break Boost point per Tune Strain - Interfered stack; +1 to the target's max Interfered stack cap while she's in the team. At full Off-Tuning Level, can cast Tune Break.

### Inherent Skills

- **Colors Never Fade!**: after Visual Impact, leaves Spray Paint on the ground that inflicts Photochromic Flux every 2s for 5s. Switching Resonance Mode doesn't affect an already-placed Spray Paint's ongoing effects. With Lynae in the team, expedition motorbike Energy Tank +600, and she auto-enters Kaleidoscopic Parade + restores 20% Lumiflow on it.
- **Adaptive Optics: Everyday Applications**: casting Intro grants +25% Spectro DMG for 9s. Out-of-combat directionless dodge in Kaleidoscopic Parade grants Optic Camo (15s, lets her enter aggro range unnoticed); removed by any other skill, interaction, or entering combat.

## Resonance Chain (S1–S6)

- **S1**: **Basic Attack - Polychrome Leap's DMG Multiplier +120%.** Spray Paint duration +100%, pulls targets in every 6s. Interruption immunity during Polychrome Leap and Visual Impact. In Optical Sampling Stage, after 2s out of combat, restores 120 Overflow.
- **S2**: Self **+25% All-DMG Amplification** (unconditional). Outro Skill gains an additional effect: casting Outro grants the incoming Resonator **+25% All-DMG Amplification for 14s** (or until they're switched out) — separate from and additive with the base-kit Outro buff.
- **S3**: **Basic Attack - Visual Impact and Basic Attack - Iridescent Splash's DMG Multiplier +90%.** With Lumiflow ≥120, gains 1 stack of Premixed Hue/s (up to 25, each +55% Spectro DMG on Additive Color, no gain while casting it, all lost when it ends); loses 1 stack/0.5s below 120 Lumiflow. Out of combat: 2× regen, 0.5× depletion.
- **S4**: ATK +20%.
- **S5**: **Resonance Liberation - Prismatic Overblast's DMG Multiplier +70%.**
- **S6**: Each Graffiti Blast or Mid-air Heavy Attack cast grants 1 stack of Color of Soul (up to 3); each stack: **+30% DMG on Polychrome Leap and Visual Impact**, all stacks consumed after casting either. Casting Polychrome Leap resets Mid-air Heavy Attack charges. Interruption immunity + 30% less DMG taken during Mid-air Heavy Attack. Stays in Kaleidoscopic Parade after Outro. Lumiflow cap 120→360 (faster roller-skating at max). Casting Intro during Kaleidoscopic Parade restores 120 Lumiflow.

## Minor Fortes (Total)

CRIT Rate +8%, ATK% +12%.

## Base Stats (Lv.90, incl. minor fortes)

HP 12238, ATK 375, DEF 1198, Max Energy 125, CRIT Rate 5%, CRIT DMG 150%, Healing Bonus 0%, Spectro DMG 0%.

## Build

### Best Weapons

Calculated with: Aemeath + Everbright Polestar + Trailblazing Star set + Sigillum + Mornye + Discord + Halo of Starry Radiance set + Reactor Husk.

| Weapon | Score | Note |
|---|---|---|
| Spectrum Blaster (Signature, R1) | 100.00% | ATK+12%. Intro/Basic hits: +36% Basic ATK DMG Bonus (4s). Inflicting Tune Rupture/Strain-Shifting via Basic: team +8% All DMG (30s, ×3 stacks). Boosts both personal and team damage at once. |
| Phasic Homogenizer (R1) | 85.00% | Generalist permanent Pistol — near-Signature-level, ATK/DMG Bonus/CRIT DMG all at once |
| The Last Dance (R1) | 83.80% | Mostly ATK/CRIT DMG stick — barely benefits from its Skill DMG effect |
| Lux & Umbra (R1) | 82.60% | ATK/CRIT DMG stick — no Heavy/Echo DMG to benefit from |
| Static Mist (R1) | 81.50% | Noticeably less personal DMG than other 5★s, but best pick after Signature — its passive buffs the Main DPS's ATK instead of Lynae's own damage |
| Woodland Aria (R1) | 70.30% | ATK/CRIT Rate stick — no Aero Erosion synergy |
| Solar Flame (R5) | 68.80% | ATK/CRIT Rate stick — no Heavy ATK synergy |
| Relativistic Jet (R5) | 68.50% | Small flat Energy + ATK; solid but outclassed by 5★s |
| Pistols#26 (R5) | — | Strongest no-gacha; ATK-only, no other stats |

### Best Echo Sets

- **Pact of Neonlight Leap** (100%): 2pc Spectro DMG +10%; 5pc — casting Outro grants the incoming Resonator +15% ATK, plus +0.3% ATK per point of Tune Break Boost, up to +15% more (30% ATK total max), 15s or until swapped out. Purpose-built support set for Lynae; buffs the Main DPS massively. Main Echo: Hyvatia (adds +10% DMG Bonus to the next character via Outro, sacrificing some personal damage — preferred by buff-focused characters).

### Best Echo Stats

4-cost: CRIT Rate/CRIT DMG. 3-cost: Spectro DMG. 3-cost: Spectro DMG > ATK%. 1-cost ×2: ATK%.

Substat priority: Energy Regen (until satisfied) > CRIT Rate = CRIT DMG > ATK% > ATK = Basic Attack DMG%.

### Best Endgame Stats (Lv.90, S0)

HP 12000+, DEF 1150+, ATK 2000-2200+, CRIT Rate 50-80%+, CRIT DMG 250-280%+, Energy Regen 115-130%+ (lower end Iuno+Ciaccona, higher end Xiangli Yao+Shorekeeper — highly variable given her team flexibility), Spectro DMG Bonus 40-70%+.

### Skill Priority

Forte Circuit > Res. Liberation > Basic Attack > Res. Skill > Intro Skill (Skill and Intro can be skipped when leveling for minimal DPS loss).

## Gameplay and Teams

### Standard Rotation

Intro (cancel → Ultimate) → Ultimate → Skill: Lynae-Style Palettes → Heavy: Spark Collision (full charge, cancel → Jump) → Jump: Polychrome Leap ×3 → Basic: Mid-air Attack: Visual Impact → Outro.

Echo timing: any point after (or right before) Ultimate, for initial Energy generation.

**S6 Rotation** (Lynae stays in Lumiflow state across rotations at S6, since Outro no longer clears it): Intro → Heavy: Ground Heavy Attack ×2 → (release) Graffiti Blast → Skill: Additive Color → Jump: Polychrome Leap ×3 → Heavy: Mid-air Heavy Attack (interrupt ~5 hits via Mid-air Attack) → Basic: Mid-air Attack: Visual Impact → Ultimate → Outro. Faster and higher DPS than Standard, thanks to skipping the long Spark Collision charge and gaining bonus DMG on Polychrome Leap/Visual Impact from Heavy Attacks (Color of Soul, S6).

Ultimate can be moved to right before Outro if Energy isn't available yet (e.g. Whimpering Wastes Side 1). Never Swap Cancel an ability right before Outro — it cancels the ability instead. Intro can't be skipped (huge Overflow source); pre-Intro quickswap prep is limited to Skill (~1s save) and possibly the Ultimate follow-up. On PC/Controller, Animation Cancelling first Skill via Ultimate-on-hit saves ~0.5s (not viable on mobile). Post-Intro, 3rd Polychrome Leap and Visual Impact are both swap-cancellable (niche use cases).

### Synergies

- **Aemeath / Hiyuki / Qingxiao / Luuk Herssen / Iuno** — best pairs with Liberation damage dealers who fully use her Outro or exploit Tune Rupture/Strain. Aemeath is by far the best (perfect synergy on every axis). Hiyuki (with Chisa) can match Aemeath in power. Iuno is also very strong (heavy Liberation damage). Luuk/Qingxiao benefit from her Tune Strain mode + general buffs.
- **Phoebe / Carlotta / Camellya** — best generalist Hybrid buffer in the game; ideal for Phoebe (no dedicated partner otherwise, wants general buffs for her many damage types); can edge out Carlotta/Camellya's own dedicated buffers when built for damage.
- **Mornye / Shorekeeper / Verina** — the 3 best generalist Supports. Mornye has special synergy (can respond to the Tune Rupture/Strain Lynae applies), making her the top choice generally; Shorekeeper close second (huge CRIT buffs); Verina most accessible, still strong.

Resonance Mode choice: use Tune Strain only if the Main DPS has a direct Tune Strain synergy (e.g. Luuk); otherwise always Tune Rupture (bigger raw damage increase, and works fine even for a Main DPS who interacts with Tune Rupture directly, e.g. Aemeath).

### Example Teams

- **Best Team**: Aemeath / Qingxiao / Luuk Herssen / Lynae / Mornye. Lynae+Mornye pair with almost any DPS (exceptions: Zani, Cartethyia). Rupture mode with Aemeath, Tune Strain mode with Qingxiao/Luuk.
- **Lynae + Chisa**: Hiyuki / Aemeath / Yangyang: Xuanling / Lynae / Chisa. Can get close to Aemeath-team power thanks to Chisa + Hiyuki's high base damage (though Aemeath on Fusion Burst here is weaker than the Rupture team above).
- **Alternative Liberation Teams**: Hiyuki / Iuno / Xiangli Yao / Calcharo / Lynae / Mornye / The Shorekeeper / Verina (Ciaccona also an option alongside Iuno).
- **Other Alternative Teams**: Carlotta / Camellya / Lynae / Mornye / The Shorekeeper / Verina.
- **Phoebe Team**: Phoebe / Lynae / Rover (Spectro).

## Review

**Ratings — Hybrid**: Tower of Adversity T0, Whimpering Wastes T1. Value Tier List: ToA (Value) T0, WW (Value) T1.

**Pros**: best generalist Hybrid buffer in the game — huge universal buffs to one character plus much higher personal damage than most Hybrids; doesn't need her Signature to perform (very F2P friendly); functions in almost every team and is the best buffer for a good chunk of them, pushing all Liberation DPS up the meta with specialized Tune Rupture/Strain synergies on top.

**Cons**: low Swap Cancel headroom, very Intro-dependent, major abilities have long cooldowns — locked into essentially one rotation with relatively low flexibility (though quickswap isn't fully impossible).

Key mechanics: manages 3 Forte resources (Overflow → Lumiflow via Spark Collision → True Color via Polychrome Leap, capping her rotation in Visual Impact). Ultimate's first part is the only one worth casting (near-all the damage, no time cost, provides buffs) — cast right after Intro for buff uptime.

Buff recap: Outro — 15% All DMG + 25% Liberation DMG Amp to next (expires on swap); Ultimate — 24% party-wide All DMG Bonus; Visual Impact — 40 Tune Break Boost party-wide; Echo set — 30% ATK + 10% All DMG Bonus to next via Outro; Signature — up to 24% party-wide All DMG Bonus. Totals 58% DMG Bonus + 30% ATK + 15% All-type + 25% Liberation Amp to one character; even on Static Mist (no Signature), trades 24% DMG Bonus for 10% ATK — a negligible loss.

Meta position: one of the strongest characters ever released — flagship generalist Hybrid, best-in-slot for numerous top-tier DPS (Aemeath, Luuk, Hiyuki, Iuno) while also working excellently with Carlotta, Phoebe, Camellya, Augusta, and even Phrolova. Reminiscent of Shorekeeper's universality, but as a Hybrid buffer.
