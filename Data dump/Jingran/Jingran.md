# Jingran

Source: a real nanoka.cc .mht browser snapshot, user-uploaded (confirmed genuine via its own
`Snapshot-Content-Location: https://ww.nanoka.cc/character/1212` header), captured 7/September/2026,
page shows "Version 3.6 (live)" — his real kit, now released (not the pre-release placeholder state
this repo previously had for him). 5★ Fusion Broadblade Main Damage Dealer, Mengzhou.

Base stats (Lv.90): HP 15375, ATK 313, DEF — (not listed on this page).

## Kit

### Combat Skills — Edge of Life and Death (Normal Attack)

Dual-stance Basic Attack: **Drink Soul** while in Yin Vessel, **Devil's Bane** while in Yang Font — up
to 4 consecutive attacks each, Fusion DMG. Casting **Stage 3 or Stage 4** of either combo restores 50
Qi AND is explicitly stated to be "dealing Heavy Attack DMG" — i.e. Stage 3/4 are counted as Heavy
Attack DMG, NOT Basic Attack DMG, despite firing off the Basic Attack button (Stage 1/2 stay Basic
Attack DMG, no override text for those).

**Mid-air Attack**: consumes STA, Plunging Attack, Fusion DMG — no "considered X DMG" override text.

**Dodge Counter — Nether Dive** (Yin Vessel) / **Light Watch** (Yang Font): Normal Attack shortly after
a successful Dodge, Fusion DMG. Restores 100 Qi and is explicitly "dealing Heavy Attack DMG" — both
Dodge Counter variants are counted as Heavy Attack DMG, not Basic Attack DMG.

**Shadow Step**: press Dodge with directional input — a FIXED (non-%, non-scaling) damage instance,
"considered Basic Attack DMG," explicitly "not affected by any DMG Bonus effects." Multiplier shown as
a flat `30+25` (not a %ATK/%HP figure) — genuinely not representable as a %-basis hit in this codebase's
schema without guessing what stat the flat number is drawn from; left unmodeled.

**Multipliers (Lv.10):**
| Move | Multiplier |
|---|---|
| Drink Soul Stage 1 | 44.74% |
| Drink Soul Stage 2 | 37.28%+37.28% |
| Drink Soul Stage 3 | 27.33%×4 |
| Drink Soul Stage 4 | 45.95%+45.95%+30.63%+30.63% |
| Devil's Bane Stage 1 | 39.82% |
| Devil's Bane Stage 2 | 59.68%+39.79% |
| Devil's Bane Stage 3 | 47.73%+47.73%+63.64% |
| Devil's Bane Stage 4 | 86.95%+12.43%×3 |
| Mid-air Attack | 92.45% |
| Dodge Counter — Nether Dive | 49.70%×4 |
| Dodge Counter — Light Watch | 74.57%+74.57%+99.43% |
| Mid-air Attack STA Cost | 30 |
| Shadow Step DMG (flat, not %) | 30+25 |
| Shadow Step STA Cost | 20 |

### Resonance Skill — Malevolent Encounter

**Encroaching Yin** (Yin Vessel) / **Scorching Yang** (Yang Font): Fusion DMG, castable mid-air. Casting
either grants **Cleanse of Impurity** for 4s (or until swap/stance-change/Netherworld-Traverse-or-
Afterlife's-Guide-cast).
**Netherworld Traverse** (Yin, needs Cleanse of Impurity) / **Afterlife's Guide** (Yang, needs Cleanse of
Impurity): mid-air Normal-Attack-input follow-up, Fusion DMG, explicitly "**considered Heavy Attack
DMG**." Restores 100 Qi.

| | |
|---|---|
| Encroaching Yin DMG | 65.61%+32.81%×3 |
| Scorching Yang DMG | 65.61%+32.81%×3 (same shared value as Encroaching Yin) |
| Netherworld Traverse DMG | 51.69%+25.85%×2+38.77%×4 |
| Afterlife's Guide DMG | 65.87%+65.87%+131.74% |
| Encroaching Yin Cooldown | 15s |
| Scorching Yang Cooldown | 15s |

### Forte Circuit — Upstream Along Santu

**Qi Modulation**: Jingran switches Yin Vessel ⟷ Yang Font by casting Heavy Attack - Soul Raid/Stardome
Meander. Starts in Yang Font by default.
**Heavy Attack — Soul Raid** (Yin Vessel, needs 300 Qi): hold Normal Attack, consumes 300 Qi, Fusion DMG,
switches to Yang Font on cast.
**Heavy Attack — Stardome Meander** (Yang Font, needs 300 Qi): same shape, switches to Yin Vessel on
cast, castable mid-air.

**Qi** (cap 300): +50 on Basic Attack Stage 3/4 (either stance) hit; +100 on Dodge Counter (either
variant)/Netherworld Traverse/Afterlife's Guide/Intro cast; +200 on Liberation cast, or on Soul
Raid/Stardome Meander cast while holding Wayfarer's Mark.

**Fire of Life** (cap 100): +100 on Liberation cast; cleared when Yinghuo ends. While in Yinghuo, if
Fire of Life > 0, casting Soul Raid/Stardome Meander consumes 25 Fire of Life and increases that cast's
own DMG Multiplier based on Max HP (see "Skill Attributes" below — a real, sourced per-1000-HP scaling
rate, capped at 25,000 HP counted).

**Nether to Light** (passive): Jingran's DEF is fixed at 0. Gains Incoming Healing Bonus +6.2% per 1000
Max HP (cap 310% at 50,000 HP). Gains Fusion DMG Bonus +1.5% per 1000 Max HP (cap 75% at 50,000 HP).

**Yang Changes, Yin Unites** (passive): gains flat ATK +36 per 1000 Max HP, capped at +1800 (at 50,000
HP) — this is a flat-ATK-from-HP conversion, not a %ATK stat.

| | |
|---|---|
| Soul Raid DMG | 16.40%×2+21.09%×3+138.22% |
| Stardome Meander DMG | 24.04%+24.04%+48.08%+144.22% |
| Soul Raid DMG Increase per 1,000 Max HP (in Yinghuo, Fire of Life > 0) | 1.48%×2+1.90%×3+12.44% |
| Stardome Meander DMG Increase per 1,000 Max HP (same condition) | 2.17%+2.17%+4.33%+12.98% |

### Resonance Liberation — Burial of Thousand Souls

Castable mid-air near ground. Fusion DMG, **considered Heavy Attack DMG**, grants 100 Fire of Life. On
cast: if current HP > 50% Max HP, reduce to 50% Max HP; gain 200 Qi; gain 3 stacks of Wayfarer's Mark;
enter **Yinghuo** for 15s.
**Wayfarer's Mark** (cap 3): Soul Raid/Stardome Meander cast restores 200 Qi and consumes 1 stack, for
15s.
**Yinghuo**: landing damage with Soul Raid/Stardome Meander summons **Chimei Wangliang** to attack
(Fusion DMG, considered Heavy Attack DMG) — once per Soul Raid/Stardome Meander cast. All Fire of Life
clears when Yinghuo ends.

| | |
|---|---|
| Burial of Thousand Souls DMG | 93.15%×8 |
| Chimei Wangliang DMG | 83.51% |
| Cooldown | 25s |
| Resonance Cost | 125 |
| Concerto Regen | 20 |

### Intro Skill — Question the Tombs

Fusion DMG. Consumes all Ghost Shroud, converting it 1:1 into Fortune in Disguise stacks. Restores 100
Qi.
**Fortune in Disguise** (cap 50): each stack grants Fusion DMG Bonus +0.05% per 1000 Max HP (cap 2.5%
per stack at 50,000 HP), 15s, ends on swap-out.
**Ghost Shroud** (cap 50): +1 point whenever Jingran gains a Shield (0.5s ICD).

| | |
|---|---|
| Skill DMG | 198.81% |
| Concerto Regen | 10 |

### Outro Skill — Rising Fortune and Ebbing Evil

Fusion DMG = **795% of Jingran's ATK** (the one row on his whole kit that states an explicit ATK basis,
not HP).

### Inherent Skills

- **Hark the Dust**: casting Intro/Encroaching Yin/Scorching Yang grants **Earth Charm** — for 15s,
  while Jingran is the active Resonator, dealing damage grants an unstackable Shield = 1.6% Max HP + 700
  (5s duration, 0.5s ICD, doesn't pass to the incoming Resonator). While in Yinghuo, the same trigger
  instead grants a smaller Shield = 0.8% Max HP + 350. Purely defensive, no DPS component.
- **Trace the Vestige**: on entering combat, if Ghost Shroud < 25, restore it to 25 (4s ICD). When a
  teammate other than Jingran gains a Shield, Jingran gains 2 Ghost Shroud (0.5s ICD). Also grants
  **Fixation** on combat-entry (4s ICD) and on casting Outro; when a teammate gains a Shield, Jingran
  instead gains 15 Ghost Shroud and loses Fixation. Purely resource-economy/utility, no DPS component.

### Minor Fortes

Sourced as the sum of every Combat-Skill-tree "Stat Bonus" breakpoint on this page (B2/B3/B4/B5 nodes
across his 4 skill trees), the same real mechanic other characters' "Minor Fortes (Total)" section
already aggregates:
- Edge of Life and Death: B3 Crit Rate +1.20%, B5 Crit Rate +2.80% (4.00% total)
- Malevolent Encounter: B2 HP +1.80%, B4 HP +4.20% (6.00% total)
- Burial of Thousand Souls: B2 HP +1.80%, B4 HP +4.20% (6.00% total)
- Question the Tombs: B3 Crit Rate +1.20%, B5 Crit Rate +2.80% (4.00% total)

**Total: Crit Rate +8%, HP% +12%.**

### Resonance Chain

| Node | Effect |
|---|---|
| S1 | DMG Multipliers of Encroaching Yin, Netherworld Traverse, Scorching Yang, and Afterlife's Guide +80%. Those 4 moves also become interruption-immune. |
| S2 | DMG Multipliers of Soul Raid and Stardome Meander +46% (and, while in Yinghuo, the Fire-of-Life-based HP-scaling DMG increase on those same 2 moves is ALSO +46%). On combat-entry (4s ICD): +300 Qi, gain Netherworld's Boon (Soul Raid/Stardome Meander cast restores 25% Max Resonance Energy and grants those 2 moves +180% DMG Amplification for 4s). |
| S3 | Casting Soul Raid/Stardome Meander grants +5 Ghost Shroud. Casting Liberation replaces "Yang Changes, Yin Unites" with **Yin-Yang Everflow** for 15s: flat ATK +50 per 1000 Max HP, cap +2500 (vs. the base passive's +36/1000, cap +1800) — a flat-ATK-from-HP upgrade, not a %ATK stat. |
| S4 | When ANY Resonator on the team gains a Shield, the WHOLE TEAM gains +20% All-Attribute DMG Bonus for 30s. |
| S5 | On taking a fatal blow: instead of falling, gain a Shield = 50% Max HP for 15s (10min ICD), not passed to the incoming Resonator. Purely defensive. |
| S6 | Targets take 40% more Heavy Attack DMG from Jingran. Chimei Wangliang's own DMG Multiplier +80%. On entering Yinghuo: gain **Parade of Thousand Souls** for 15s — while Jingran is the active Resonator, dealing damage summons Chimei Wangliang (Fusion DMG, considered Heavy Attack DMG), up to 1/second, max 8 summons; resets/ends on Liberation cast or Yinghuo ending. |

### Stats (Lv.90)

HP 15375, ATK 313, DEF — (not listed), Max Energy 125, Crit Rate 5%, Crit DMG 150%, Healing Bonus 0%,
Fusion DMG 0%.

## Build

Source for this section: a second, later snapshot from prydwen.gg
(prydwen.gg/wuthering-waves/characters/jingran), user-provided via a .mht file (fetched 2026-09-12) —
supersedes the nanoka.cc snapshot's own "Build (partial — not yet written)" placeholder above, whose
guide content had no Echo-set/team-synergy/rotation section written yet for him at that earlier date
(a newly-released character). Real-life last update on the prydwen page itself: review/calcs Patch 3.6,
profile 10/September/2026.

### Best Weapons (Lv.90, % = calculated performance vs. his Signature)
| Weapon | Score | Stats |
|---|---|---|
| Thousandfold Deliverance (R1, signature) | 100.0% | ATK 413, HP% 72.2% |
| Thunderflare Dominion (R1, Augusta's sig) | 85.1% | ATK 675, CRIT Rate 12.1% |
| Verdant Summit (R1) | 82.0% | ATK 587, CRIT DMG 48.6% |
| Wildfire Mark (R1) | 78.8% | ATK 587, CRIT DMG 48.6% |
| Radiance Cleaver (R1) | 73.7% | ATK 587, CRIT DMG 48.6% |
| Aureate Zenith (R5, 4★, best 4★) | 73.1% | ATK 412, CRIT DMG 40.5% |
| Ages of Harvest (R1) | 70.9% | ATK 587, CRIT Rate 24.3% |
| Kumokiri (R1) | 69.1% | ATK 500, CRIT Rate 36% |
| Autumntrace (R5, 4★) | 68.7% | ATK 412, CRIT Rate 20.2% |
| Lustrous Razor (R1, standard 5★) | 67.6% | ATK 587, ER 36.4% |
| Helios Cleaver (R5, 4★) | 62.8% | ATK 412, ATK 30.3% |
| Waning Redshift (R5, 4★) | 62.4% | ATK 462, ATK 18.2% |
| Meditations on Mercy (R5, best no-gacha/F2P) | 59.9% | ATK 462, ATK 18.2% |

Note: this table's Radiance Cleaver (#5, 73.7%) and Aureate Zenith (#6, 73.1%) rankings are consistent
with the nanoka.cc snapshot's earlier, coarser #2/#3 ranking of the same 2 weapons above — corroborating
both sources rather than conflicting.

**Signature (Thousandfold Deliverance)**: +12% All-Attribute DMG Bonus. Casting Intro or gaining a
Shield as the active Resonator grants Nature's Order + Cradle of Life (once per 0.5s via Shield, up to
6 stacks, 7s). Nature's Order: +4% Crit DMG per stack (cap 24%); at 6 stacks, +12% Heavy Attack Crit
Rate. Cradle of Life: casting a Heavy Attack consumes up to 2 stacks, each granting Heavy Attack DEF
Ignore +15% (cap 30%) for 2s. His Signature is the only weapon giving him ~72% HP%, letting him hit
the 50000 Max HP self-buff cap on a 4-4-1-1-1 build while still stacking Crit/DEF Ignore — a very large
gap over every alternative.

### Best Echo Sets
**Lamp of Nether Road** (his signature set, 100%): 2pc HP +10%; 5pc — gaining a Shield grants +5% Crit
Rate for 5s (max 4 stacks, once per 0.5s); at max stacks, +15% Fusion DMG Bonus. Fully ramped: +10%
HP, +20% Crit Rate, +15% Fusion DMG Bonus.

**Best Main Echo**: Myriad Snare: Rustfire Chassis (Simple Summon, HP-scaling) — grants the wearer
+12% Fusion DMG Bonus and +12% Heavy Attack DMG Bonus in the main slot; deals 10.20% Max HP on impact
plus 0.37% Max HP ×19 hits over its duration (CD 20s).

**Best Echo Stats**: 4-cost CRIT DMG/HP%, 4-cost CRIT DMG/HP%, 1-cost HP%, 1-cost HP%, 1-cost HP%.
Substat priority: Energy Regen (until satisfied) > HP (until 50000 total) > Crit Rate = Crit DMG >
Heavy DMG% > ATK% > ATK.

### Best Endgame Stats (Level 90, S0)
HP: 50000 (priority above Crit stats — abandon building HP further past this). DEF: 0 (fixed by kit).
ATK: 3200+ (post-HP-conversion). Crit Rate: 50%+ (before Echo set/Signature). Crit DMG: 260-340%+.
Energy Regen: 110-120%+ (lower end in a Brant/Mortefi+Lupa team, higher end in an Iuno+Shorekeeper/
Lupa+Mornye team). Fusion DMG Bonus: 87% (before Set & Ghost Shroud bonuses).

### Skill Priority
Forte Circuit > Res. Liberation > Res. Skill > Basic Attack > Intro Skill (Intro/Basic can be skipped
when leveling for minimal loss).

## Gameplay and Teams

### Standard Rotation (S0-S1)
Intro → Ultimate → Heavy: Stardome Meander → Basic: Yin 2/3/4 → Heavy: Soul Raid → Skill: Scorching
Yang → Basic: Afterlife's Guide → Heavy: Stardome Meander → Skill: Encroaching Yin → Basic: Netherworld
Traverse → Heavy: Soul Raid → Outro.

### S2+ Rotation (Stardome Meander openable pre-Intro)
Opener only: Heavy: Stardome Meander (swap) → Intro → Ultimate → Heavy: Soul Raid → Basic: Yang 2/3/4 →
Heavy: Stardome Meander → Skill: Encroaching Yin → Basic: Netherworld Traverse → Heavy: Soul Raid →
Skill: Scorching Yang → Basic: Afterlife's Guide → Heavy: Stardome Meander → Outro.

Dodge Counters can fully replace a Skill or Basic chain and immediately net his next Heavy Attack —
use them to save rotation time whenever possible. Extra Basic Attacks (Yang for S0-S1, Yin for S2+)
pad out rotation time if the team's cycle runs longer than his 4-Forte-Heavy sequence; best placed
after his 4th Heavy, before Outro (outside Quickswap).

### Synergies
- **Iuno / Lupa** — Jingran's 2 best archetypes: Iuno (Shield-based Heavy Attack buffer) and Lupa
  (Mono Fusion enabler) — his 2 best synergies overall, though not recommended together since Lupa
  wants a full Fusion team.
- **Mortefi / Rebecca** — Lupa's best partner in a Jingran team is Mortefi (Fusion Heavy Attack buffer,
  enables Lupa too); works without Lupa in a pinch, but Rebecca is generally the stronger Heavy Attack
  buffer when Mono Fusion isn't being run (Electro element, so worse specifically inside Mono Fusion).
- **The Shorekeeper / Mornye / Verina** — Jingran scales with any general Support (no dedicated
  HP-scaler/Shield-archetype Support exists yet). Shorekeeper is generally the most flexible/best
  pick; Mornye is a safe alternative that also enables Mono Fusion with Lupa; Verina is the
  permanently-accessible Shorekeeper replacement.

### Example Teams
1. **Best Team**: Jingran + Iuno + Shorekeeper/Verina. (Shorekeeper ideal; Iuno+Verina is still
   stronger than the Mono Fusion/F2P alternatives by a slight margin, excluding Quickswap.)
2. **Mono Fusion**: Jingran + Mortefi + Mornye/Lupa. (Mortefi on Moonlit Clouds w/ Stonewall Bracer
   main Echo in 2nd slot, OR Mornye on Halo of Starry Radiance w/ Spacetrek Explorer main Echo in 3rd
   slot so Lupa can Outro-buff Jingran.)
3. **F2P Team**: Jingran + Rebecca/Mortefi + Shorekeeper/Verina. (Support runs Halo of Starry Radiance
   w/ Spacetrek Explorer main Echo — a Shield-generating Main Echo lets non-Iuno supports approximate
   Iuno's Ghost Shroud generation for him.)

## Calculations

### Damage Profile (Prydwen's own simulated rotation, S0, solo/no buffs)
Basic 15,667 (0.8%) · Heavy 1,824,337 (84%) · Skill 78,044 (part of 8.4% Skill share incl. Intro/Outro)
· Liberation 0 · Intro 27,754 · Outro 181,825 · Echo 43,624. Total ≈ 2,171,250. Rotation time 13.37s.
Confirms his damage is overwhelmingly Heavy Attack (84%), with Skill/Intro/Outro/Echo as the remainder
and zero Liberation damage share (his Liberation is a resource-setup cast, not a damage source).

### Damage Output by Sequence (1-Target, 13.37s rotation)
- S0: 2,171,250 DMG / 162,397 DPS (100.00%)
- S1: 2,332,662 DMG / 174,469 DPS (107.43%)
- S2: 2,919,050 DMG / 224,197 DPS (138.05%)
- S3: 3,533,757 DMG / 271,409 DPS (167.13%)
- S4: 3,725,972 DMG / 286,172 DPS (176.22%)
- S5: 3,725,972 DMG / 286,172 DPS (176.22%) — S5 grants no damage delta (a survivability node).
- S6: 5,977,682 DMG / 459,115 DPS (282.71%)

Calculated with buffs from Iuno (Moongazer's Sigil + Moonlit Clouds + Bell-Borne Geochelone) and The
Shorekeeper (Variation + Rejuvenating Glow + Fallacy of No Return).

## Review / Ratings
Tier: DPS T0 (Tower of Adversity), T1 (Whimpering Wastes) — same split on the Value Tier List.

**Pros**: one of the strongest/most accessible DPS releases in a while; only needs his Signature to
perform at a very high level; strong sequence value (S2, S6 particularly); damage spread evenly across
his rotation with good AoE (multi-wave-friendly); wide team-option access, easy to build a team around.

**Cons**: one of the most Signature-weapon-reliant characters in the game (permanent alternatives are
notably worse, not just slightly); poor Whimpering Wastes purple-token options once his dedicated gold
token rotates out; low Quickswap potential in his ideal teams.

**Meta position**: strong on-release meta contender; baseline performance is very high even though his
ceiling doesn't scale much further past it. Best used with Iuno + Shorekeeper; second-best in a Mono
Fusion setup (Mortefi + Lupa); can fall back to F2P Heavy Attack buffers (Rebecca/Mortefi + Shorekeeper/
Verina) via the Shield-generating-Main-Echo workaround, landing around the Cartethyia-to-Galbrena power
generation for those teams. HP-CONVERTING (like Brant is with Energy Regen), not HP-scaling like
Cartethyia — his multipliers apply to ATK, with HP only feeding the ATK-conversion and %-bonus passives.

## App Data Comparison (vs. `app/src/data/characters.js` + `jingran.blocks.js`)

First real Data dump for Jingran — none existed before (he was pre-release when this repo's characters.js
entry was last touched). `SKILL_MULTIPLIERS['Jingran']` and `RESONANCE_CHAIN_DATA['Jingran']`'s numeric
values already matched this source exactly (both were the same "the source is already leaking early kit
data" values this repo had sourced before his live release) — the deltas found and fixed are all about
**category/scoping**, not raw numbers:

1. **Real bug**: `jingran.skill.netherworld-traverse`/`jingran.skill.afterlifes-guide` were categorized
   `skillDmg` despite this source's explicit "considered Heavy Attack DMG" text for both — fixed to
   `heavyDmg`.
2. **Real, newly-sourced split**: Basic ATK Stage 3/4 (both stances) are explicitly "dealing Heavy Attack
   DMG," not Basic Attack DMG like Stage 1/2 — previously modeled as one combined `basicDmg` block per
   stance; split into Stage 1-2 (`basicDmg`) and Stage 3-4 (`heavyDmg`) blocks.
3. **Real, newly-sourced moves, previously entirely missing**: Mid-air Attack, Dodge Counter — Nether
   Dive, Dodge Counter — Light Watch. Both Dodge Counter variants are explicitly "considered Heavy Attack
   DMG" per this source.
4. **`RESONANCE_CHAIN_DATA['Jingran']`'s S1/S3/S4/S5 were unsourced placeholders**, not real values —
   S1 (`skillDmg: 80`) was an unscoped approximation of a real effect scoped to exactly 4 named moves
   (2 of which are `heavyDmg`, not `skillDmg` — a flat `skillDmg` buff never even reaches them); S3
   (`atkPct: 15`) has no basis anywhere in this source's real S3 text (a flat-ATK-from-HP conversion
   upgrade, not a %ATK stat); S4 (`totalMult: 10`) doesn't match this source's real S4 text (a
   conditional team-wide `allDmg` buff) at all; S5 (`totalMult: 5`) is real defensive-only utility with
   zero DPS component. All four zeroed in the flat table; S1/S2 rebuilt as `scopedToBlockId` buffs in
   `jingran.blocks.js` instead (matching this project's established chain-scoping-bug-fix pattern), S3/
   S4/S5 documented as real-but-unmodeled utility. S6's `heavyDmg: 40` was already confirmed correct;
   S6 ALSO turned out to carry two more real, previously-undocumented effects (Chimei Wangliang DMG
   Multiplier +80%, and the Parade of Thousand Souls proc mechanic) — added.
5. **Minor Fortes and both Inherent Skills had no block at all** — added (Crit Rate+8%/HP%+12%; Hark the
   Dust/Trace the Vestige as inert utility, no DPS component).

**2026-09-12 update (second, prydwen.gg snapshot)**: filled in `CHARACTER_DATA['Jingran']`'s previously
empty `bestEchoes`/`teams`/`weaponAlts` from this section's own Build/Gameplay-and-Teams content above
(his own dump is authoritative for his own teams field), added `CHARACTER_ROTATIONS['Jingran']` (both
the Standard S0-S1 and S2+ rotations, now published above under Gameplay and Teams), and added
reciprocal team entries to Iuno's own `teams` field (her own dump independently names the same
Jingran+Iuno+Shorekeeper/Verina pairing as her #1 Best Team pick). Checked Mortefi/Rebecca/Mornye/Lupa/
The Shorekeeper/Verina's own dump files under `Data dump/` for a Jingran mention before adding any
further reciprocal entries — none of them mention him, so no reciprocal entries were added to their own
`teams` fields (a one-way citation from Jingran's own dump is still valid data for his own field, per
this session's established standard, just not cross-corroborated).

**Also found and fixed in this same pass — a real basis bug, not a numeric one**: this section's own
closing Meta-position paragraph explicitly states Jingran is "HP-CONVERTING... not HP-scaling like
Cartethyia — his multipliers apply to ATK, with HP only feeding the ATK-conversion." Every
`damage.basis` in `jingran.blocks.js` (17 blocks) was `'HP'`, and `CHARACTER_DATA['Jingran'].statScaling`
was `'HP'` in `characters.js` — both modeled him like Cartethyia's real HP-scaling kit, which this
source now explicitly rules out. Neither the nanoka.cc snapshot above nor his real kit text ever
actually stated an HP damage basis (his "Yang Changes, Yin Unites" passive was always described as a
flat-ATK-from-HP *conversion*, not a raw-HP damage scale) — `engine/characterBlocks/CONTRIBUTING.md`'s
own basis-selection rule ("Only use 'HP'/'DEF' when the character's own kit text says explicitly the
hit scales off that stat instead") was never actually satisfied. Fixed: all 17 blocks switched to
`basis: 'ATK'` (the schema default, matching Brant's own ATK-basis HP-conversion kit); the Outro block
was already correctly `'ATK'`. `statScaling` corrected to `'ATK'` and the `ROTATION_DATA`/`totalMult`
heuristic row re-derived as a sum of %ATK multipliers across the Standard (S0-S1) rotation (was `60`,
labeled "%HP, NOT %ATK" — now `3875`, see that row's own comment in `characters.js` for the full
addition). Because damage.basis wasn't touched anywhere else in this file's `## Kit` section above (no
number in the raw kit data changed, only which stat it multiplies against in the engine), it was left
as-is rather than rewritten.

No `CHARACTER_ROTATIONS['Jingran']` entry exists in this app yet as of the FIRST (nanoka.cc) pass: that
snapshot's own guide text had no rotation/combo/team section written yet (a newly-released character) —
not fabricated. This has since been resolved by the second (prydwen.gg) pass above, which supplies a
real, sourced Standard and S2+ rotation.
