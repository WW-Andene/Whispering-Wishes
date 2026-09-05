# Luuk Herssen — Prydwen.gg source dump (cleaned)

5★ Spectro, Gauntlets, Main DPS. Aerial-combat character who builds toward a massive single-hit Ultimate nuke.

## Kit

### Basic Attack — Such is Light
- **Basic Attack**: up to 4 consecutive attacks, Spectro DMG. Stage 3 hurls out a whirling blade (disappears on other damaging skills/leaving field).
- **Heavy Attack**: STA cost, jump into the air, Spectro DMG.
- **Mid-air Attack**: up to 4 consecutive hits, Spectro DMG. Stage 4 is a Plunging Attack (STA cost). Normal Attack input → Scythe: Dissection string; Jump input → Scythe: Resection string (also inflicts Tune Strain - Shifting for 25s, -15% DMG taken for 1s). As active Resonator, mid-air cycle isn't reset while airborne. Hold Normal Attack mid-air for a Plunging Attack (STA cost).
- **Dodge Counter**: ground — Normal Attack right after a successful Dodge, Spectro DMG (chains into Basic Stage 3 on a following Normal Attack). Mid-air — Normal Attack right after a successful Dodge flashes toward the target, Spectro DMG.

**Multipliers (Lv.10):**
- Basic Attack Stage 1: 40.56%+40.56%
- Basic Attack Stage 2: 60.16%+90.24%
- Basic Attack Stage 3: 5.02%×30
- Basic Attack Stage 4: 96.33%
- Heavy Attack: 91.26%
- Mid-air Stage 1: 57.46%
- Mid-air Stage 2 (Dissection): 28.23%+28.23%+37.63%
- Mid-air Stage 3 (Dissection): 42.93%+42.93%+57.24%
- Mid-air Stage 2 (Resection): 50.42%+50.42%
- Mid-air Stage 3 (Resection): 74.92%+74.92%
- Mid-air Stage 4: 104.78%
- Ground Dodge Counter: 125.90%+125.90%
- Mid-air Dodge Counter: 256.87%
- Heavy Attack STA cost 25; Mid-air Stage 4 STA cost 30.

### Resonance Skill — Reunion of All the Fallen
- **Golden Reflux**: flash to target, Spectro DMG, inflicts Tune Strain - Shifting (25s). 2 charges. Castable mid-air.
- **Aureole of Execution**: casting Basic Stage 4 or Mid-air Stage 3 replaces Resonance Skill with this. Deals Basic Attack DMG, inflicts Tune Strain - Shifting (25s). 3 forms (Ring/Breach/Glare) cycling in sequence; each cast grants 1 Endnotes on the Endgame stack. Switching resonator resets the cycle back to Golden Reflux. Castable mid-air.
  - **Ring**: Spectro DMG, resets Mid-air cycle to Stage 1; next Normal Attack triggers Golden Impale (lost if Dodge Countered mid-air or swapped out).
  - **Breach**: spin/dash forward, Spectro DMG along path, resets Mid-air cycle to Stage 1, hurls an Ichor Blade; same Golden Impale follow-up rule.
  - **Glare**: hurls Solid-State Ichor, Spectro DMG, forms an Ichor Deposit on the ground.
  - **Golden Impale** (Basic Attack DMG): flash to target, Spectro DMG.
  - **Ichor Deposit** (Basic Attack DMG): auto-detonates after 5s, Spectro DMG.
  - **Endnotes on the Endgame**: +25% Liberation (Rewritten in Winter's Margins) DMG Multiplier per stack, up to 3 stacks; cleared by casting Liberation or swapping out.

**Multipliers (Lv.10):**
- Golden Reflux: 201.20%
- Ring: 26.56%×5+88.53%
- Breach: 95.91%×3
- Glare: 354.11%
- Golden Impale: 155.47%
- Ichor Deposit: 153.45%
- Golden Reflux cooldown: 8s.

### Resonance Liberation — Rewritten in Winter's Margins
Spectro DMG, considered Basic Attack DMG. Castable mid-air.

**Multipliers (Lv.10):** 745.54%+49.71%×5. Energy cost 125, Concerto Regen 20, cooldown 25s.

### Forte Circuit — Spark from the Frost
- **Mid-air Attack - Gavel of Earthshaker**: once Glare's Ichor Deposit is out, press Normal Attack mid-air to slam down and detonate it — Spectro DMG (considered Basic Attack DMG), fully restores STA. Unavailable once Liberation is cast or Luuk swaps out.
- **Aureate Judge**: at full Ichor Flow, enter this state — Ichor Flow stops regenerating, all Aureole of Execution forms' DMG Multiplier +110%; casting Glare also boosts the next Gavel of Earthshaker/Ichor Deposit DMG Multiplier by +110%. 100 Ichor Flow consumed per Aureole of Execution cast; ends when Ichor Flow depletes.
- **Golden Rule**: while Luuk is in the team, other Resonators gain Golden Rule; when a Golden-Rule resonator casts Outro into Luuk, all Golden Rules are consumed and Luuk gains 200 Ichor Flow + 12 Concerto Energy. Resets after 24s. Doesn't apply in co-op.
- **Dawnlit Keep**: +1 stack (cap 1) after 4s out of combat or on Intro cast; consuming it on taking damage reduces DMG taken by 60% and grants 1s interruption immunity (once per second).
- **Radiant Reave**: mid-air Dodge briefly extends airtime and hurls an Ichor Blade; up to 3 triggers before landing/3s off-field resets the counter.
- **Ichor Blade** (Basic Attack DMG, fixed, unaffected by DMG Bonus, not a Counterattack trigger): only one exists at a time; disappears on other damaging skills/leaving field.
- **Ichor Flow**: cap 300; restored by Normal Attacks, Golden Reflux, Aureole of Execution, Golden Impale, Gavel of Earthshaker; Intro restores 100.

**Multipliers (Lv.10):** Gavel of Earthshaker 306.90% (Concerto Regen 10); Ichor Blade 10% per 0.15s; Mid-air Suspension STA cost 5/s; Ichor Blade duration 5s.

### Inherent Skills
- **Pulses Under the Snow**: when the team directly damages and defeats a Tune Strain - Interfered target, Luuk gains (or raises) Perpetuating Daytime stacks to match that target's Interfered stacks (only if he has none, or the target's stacks exceed his current).
- **Perpetuating Daytime**: when the team casts Tune Break on a Shifting target, Luuk loses all Perpetuating Daytime and applies equal stacks of Interfered (capped by the target's stack cap); 1s cooldown. Lost entirely on knockout (and can't regain any while down). Caps at 2 stacks.
- **Uncaused Diagnosis**: Luuk's skills directly damaging an Interfered target Amplify that instance of damage by 5% per 10 points of his Tune Break Boost, up to 30%. After any nearby teammate inflicts Shifting or deals Tune Break DMG, Luuk's ATK +25% for 20s.

### Resonance Chain (S1–S6)
- **S1**: +150% Mid-air Attack DMG Bonus. Dawnlit Keep max stack +1. In Aureate Judge, casting Aureole of Execution grants 1 Dawnlit Keep stack.
- **S2**: Rewritten in Winter's Margins DMG Multiplier +60% (stacks with Endnotes on the Endgame's own bonus). Uncaused Diagnosis enhanced: Amplify becomes 10% per 10 Tune Break Boost points, capped at 60% (up from 30%).
- **S3**: All Aureole of Execution forms' DMG Multiplier +136% while in Aureate Judge. Casting Glare also raises the next Gavel of Earthshaker/Ichor Deposit DMG Multiplier by +136%. Pulses Under the Snow enhanced: Perpetuating Daytime caps at 4 stacks.
- **S4**: After any team member deals Tune Break DMG, the whole team deals +20% DMG for 20s (unstackable).
- **S5**: Intro (Before Injection of Dawn) and Outro (Bow to the Last Light) gain +80% DMG Bonus. Golden Reflux DMG Multiplier +50%, cooldown -2s, +1 charge.
- **S6**: When nearby teammates deal Tune Break DMG, all Aureole of Execution forms, Ichor Deposit, and Gavel of Earthshaker deal +30% more DMG to the target for 25s. Each Endnotes on the Endgame stack additionally grants Rewritten in Winter's Margins +40% DMG Bonus, up to +120%. Damaging an Interfered target raises its Interfered stack count by 2, ignoring the normal stack cap.

### Outro Skill — Bow to the Last Light
Spectro DMG equal to 500% of Luuk's ATK.

*(No Intro Skill multiplier text was given on this source page beyond its name, Before Injection of Dawn — referenced by S1/S5's node text but not separately detailed with its own multiplier row.)*

### Minor Fortes
Crit Rate +8%, ATK% +12%.

### Base Stats (Lv.90, incl. minor fortes)
HP 10300 · ATK 463 · DEF 1112 · Max Energy 125 · Crit Rate 5% · Crit DMG 150%.

*(Upgrade material info not yet listed on this source page.)*

## Review

**DPS tier**: **T0** (Tower of Adversity, standard) / **T1.5** (Whimpering Wastes, standard) — **T0** (ToA, Value list) / **T2** (WW, Value list).

**Pros**
- Strong mid-air damage, inherently easier to dodge enemy attacks with.
- One of the most accessible DPS in the game — functions very well on a permanently-obtainable weapon and free/beginner teammates.
- Very easy to learn and optimize; low skill floor.

**Cons**
- Mid-air focus means being knocked out of the air is especially punishing.
- Zero quickswap tolerance — swapping off at any point during his rotation completely breaks his kit.
- Outro buffs will almost certainly expire unless Dash-Cancelling his Golden Impale casts to shorten the rotation (not strictly required with Lynae/Denia, but important with Sanhua).
- His best team competes directly with Aemeath for the same premium teammates.

**Review summary**: Kit revolves around aerial combat, building toward his very strong single-hit Ultimate nuke (one of the strongest in the game, rivaling Aemeath's 2nd Ultimate and Jinhsi's Skill). Key mechanic is Golden Rule — a buff granted to teammates on his Intro, on a 24s cooldown, that returns him a full Forte bar + Concerto when a Golden-Rule teammate Outros into him; this is what lets him consume Forte for his 3 enhanced Aureole of Execution skills (Ring/Breach/Glare, worth +75% Liberation multiplier total) and unlock his Gavel of Earthshaker plunging attack. Effectively rotates on a fixed ~25s cycle (his Liberation's own cooldown): Intro → 3× (3 mid-air attacks + 1 Aureole of Execution skill) → Gavel of Earthshaker → Liberation → Skill (swap) → Outro.

Rotation details: his Jump-input Resection mid-air string is marginally better overall (slightly more damage/rotation and more Energy) than the Basic-input Dissection string despite being marginally longer. Golden Impale (unlocked after Ring/Breach) deals less than his 3rd Mid-air Attack hit and has a long animation that threatens buff-uptime timing — optimal play Dash-Cancels out of it to reach the next mid-air string faster and preserve buffs through to his big Ultimate nuke.

Very budget-friendly and self-sufficient (can stack his own Tune Strain fully solo); Denia/Lynae+Mornye are strong but not mandatory. Free character Sanhua is a perfectly suitable damage booster, and the permanent 5★ weapon Pulsation Bracer plays right into his kit. Ranks just below Aemeath/Hiyuki/Sigrika in his full premium team (Denia+Mornye), and rivals Carlotta/Zani in their own premium comps in more accessible builds — but only in single-target content. His biggest weakness is multi-wave/AoE (Whimpering Wastes) — nearly helpless without Denia's off-field grouping, and only average even with her.

## Build

**Best Weapons** (calculated with Denia + Forged Dwarf Star/Reel of Spliced Memories set + Voidwing Moth, and Mornye + Discord/Halo of Starry Radiance set + Reactor Husk as teammates):
1. **Daybreaker's Spine (signature, R1)** — 100.00%. ATK+12%. After Basic Attack DMG, +20% Spectro DMG Bonus (4s). After inflicting Shifting, +20% Basic Attack DMG Amp and Basic Attack ignores 10% target DEF (6s). Stats at Lv.90: ATK 587, Crit Rate 24.3%. Best option by far — huge extra Spectro/Basic DMG Bonus and DEF Ignore on top of high ATK/Crit Rate.
2. **Pulsation Bracer** — 85.70%. ATK+12%. Damaging Interfered targets grants +6% Basic Attack DMG Bonus (3s), up to 4 stacks, 0.5s trigger cap, retrigger refreshes duration. Same stats as signature. Excellent permanent-banner F2P option — his 2nd best overall.
3. **Blazing Justice** — 80.70%. ATK+12%. On Basic Attack cast: ignores 8% target DEF, Amplifies Spectro Frazzle DMG +50% (6s), refreshable. Stats: ATK 587, Crit DMG 48.6%. Good alternative to Pulsation Bracer (can be better via crit-fishing).
4. **Moongazer's Sigil** — 80.40%. ATK+12%. (Liberation-DMG-focused passive, unused by Luuk.) Stats: ATK 500, Crit Rate 36%. Simple ATK/Crit Rate stick.
5. **Verity's Handle** — 80.20%. Attribute DMG+12%. (Liberation-DMG-focused passive, unused.) Stats: ATK 587, Crit Rate 24.3%. Simple stat stick.
6. **Tragicomedy** — 74.50%. ATK+12%. (Heavy ATK-focused passive, unused.) Stats: ATK 587, Crit Rate 24.3%. Simple stat stick.
7. **Abyss Surges** — 66.50%. Energy Regen+12.8%. Weaker than Pulsation Bracer (no Crit substat, weaker passive for Luuk).
8. **Celestial Spiral (R5)** — 65.90%. Skill cast: +10 Energy, ATK+20% (16s), 20s internal cooldown. Stats: ATK 462, ATK 18.2%. Solid ATK + some Energy relief.
9. **Aether Strike (R5, Battle Pass)** — 63.90%. Liberation cast: ATK+23%, +34.5% Liberation DMG Bonus (15s). Passive nearly wasted since Liberation is cast at rotation-end. Stats: ATK 412, Crit DMG 40.5%.
10. **Stonard (R5)** — 63.50%. Skill release: +54% Liberation DMG Bonus (15s), unused passive. Stats: ATK 412, Crit Rate 20.2%. Weaker than 5★ options (lower base ATK).
11. **Hollow Mirage (R5)** — 61.60%. Liberation cast: 3 stacks Iron Armor (ATK/DEF +5% each, cap 3), lost 1 per hit taken. Can underperform vs. shown number if hit often. Stats: ATK 412, ATK 30.3%.
12. **Legend of Drunken Hero (R5)** — no % listed (lowest, last in list). Damaging Negative-Status enemies: ATK+8% (10s), 1/s trigger, up to 4 stacks. Weak ATK stick — his best no-gacha choice, but Pulsation Bracer strongly recommended over it whenever accessible.

**Best Echo Set**: **Rite of Gilded Revelation** (100.00%). 2pc: +10% Spectro DMG. 5pc: Basic Attack DMG grants +10% Spectro DMG (5s), up to 3 stacks; at 3 stacks, casting Liberation grants +40% Basic Attack DMG Bonus. Stackable Spectro DMG buff (up to +40%) plus a big +40% Basic DMG Bonus specifically timed to his Ultimate cast — best set bar none.
- Main Echo option: **Twin Nova: Nebulous Cannon** — main-slot passive grants +12% Spectro DMG and +12% Basic Attack DMG Bonus, an easy fit.

**Best Echo Stats**: 4-cost Crit Rate/Crit DMG · 3-cost Spectro DMG · 3-cost ATK% = Spectro DMG · 1-cost ATK% ×2.
**Substat priority**: Energy Regen (until satisfied) > Crit DMG = Crit Rate > ATK% = Basic DMG% > ATK.

### Endgame Stat Targets (Lv.90)
HP 14500+ · DEF 1100+ · ATK 2100–3000+ · Crit Rate 65–80%+ · Crit DMG 210–260%+ · Energy Regen 118–125%+ (lower end w/ Sanhua+Mornye, higher end w/ Lynae+Mornye) · Spectro DMG Bonus 40–70%+.

### Skill Priority
Resonance Skill > Resonance Liberation > Basic Attack > Forte Circuit > Intro Skill (Intro skippable for minimal loss).

## Gameplay & Teams

### Standard Rotation
Intro → Jump: Mid-air Resection 2 → Jump: Mid-air Resection 3 → Skill: Ring → Basic: Golden Impale (instantly Dash-cancelled) → Dash → Basic: Mid-air Attack 1 → Jump: Mid-air Resection 2 → Jump: Mid-air Resection 3 → Skill: Breach → Basic: Golden Impale (instantly Dash-cancelled) → Dash → Basic: Mid-air Attack 1 → Jump: Mid-air Resection 2 → Jump: Mid-air Resection 3 → Skill: Glare → Basic: Mid-air Gavel of Earthshaker (animation end-lag cancelled via Ultimate) → Ultimate → Skill (swap) → Outro.

Dash-cancelling Golden Impale is highly recommended (improves team DPS, keeps every buff active through the Ultimate) even though frame-perfect play could technically skip it. Extra Skill/Echo casts can be squeezed in pre-Intro with light quickswap support, though the gain is minimal. Echo Skill: generally skip in favor of his own Skill (which deals more), unless there's a lot of pre-rotation headroom for a Swap Cancel.

### Synergies
- **Denia / Lynae / Sanhua** — best 2nd-slot buffers. Denia strongest overall (extra Tune Strain, big personal + team buffs, off-field grouping, fast rotation). Lynae close 2nd (extra Tune Strain application, slight extra DMG Amp via Outro, big ATK/DMG Bonus buffs). Sanhua is a fully viable free/budget pick (extra Basic DMG Amp, ATK buffs, fast rotation) — may require an extra post-Ultimate Mid-air Attack chain to keep Luuk's rotation on a clean 25s cooldown.
- **Mornye / Shorekeeper / Verina** — best general Supports. Mornye strongest (Luuk self-applies Tune Strain for her to bounce off, even at S0). Shorekeeper/Verina both strong, competitive alternatives without Mornye.

### Example Team
**Best Team**: Luuk Herssen + Denia + Lynae/Sanhua + Mornye/Shorekeeper/Verina. (With Sanhua, extend Luuk's rotation post-Ultimate with extra Mid-air Attacks if needed to keep him on a 25s cooldown.)

## Calculations

### Damage Profile
Basic 1,294,590 · Heavy 0 · Skill 0 · Liberation 0 · Intro 41,895 · Outro 96,084 · Echo 23,987.
Total: 1,456,556. Basic 88.9% · Outro 6.6% · Intro 2.9% · Echo 1.6%.

*(Confirms nearly his entire damage output — including his nominal "Resonance Skill", "Resonance Liberation", and Forte Circuit hits — is counted as Basic Attack DMG per the kit's own "considered Basic Attack DMG" reclassifications; Heavy/Skill/Liberation categories are genuinely 0%.)*

### Damage Output by Sequence (1-Target, 12.4s rotation)
- S0: 1,487,561 DMG / 119,964 DPS (100.00%)
- S1: 1,689,192 DMG / 136,225 DPS (113.55%)
- S2: 2,106,780 DMG / 169,901 DPS (141.63%)
- S3: 2,638,504 DMG / 212,782 DPS (177.37%)
- S4: 2,807,808 DMG / 226,436 DPS (188.75%)
- S5: 2,883,749 DMG / 232,560 DPS (193.86%)
- S6: 4,116,800 DMG / 331,999 DPS (276.75%)

No adjacent-sequence pair is byte-identical — every node has a real, distinct DPS contribution.

Calculation build used: Daybreaker's Spine (R1) + Rite of Gilded Revelation 5pc + Twin Nova: Nebulous Cannon main echo; substats ATK 45% / Crit Rate 42% / Crit DMG 84%.
