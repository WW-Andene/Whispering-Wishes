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

## Build (partial — this source's guide text is not yet fully written for him)

**Recommended Weapons** (ranked, no ATK%/comparison figures given on this page): 1. Thousandfold
Deliverance (already `bestWeapon` in this repo). 2. Radiance Cleaver. 3. Aureate Zenith.

**Key Stat**: HP (this page's own "Key Stat: HP 5000.0%" line — likely a malformed/placeholder render on
the source's own page, not a literal 5000% target; not used as a real number here).

No Echo set recommendation, team synergy, or rotation/combo text exists on this page — this source's
guide content for him isn't fully written yet (a newly-released character), same genuinely-unconfirmed
state this repo's own CHARACTER_DATA['Jingran'] comment already documents for bestEchoes/teams. Not
fabricated here either.

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

No `CHARACTER_ROTATIONS['Jingran']` entry exists still: this source's own guide text for him has no
rotation/combo/team section written yet (confirmed above, under Build) — not fabricated.
