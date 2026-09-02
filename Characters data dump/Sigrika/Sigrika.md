# Sigrika — Prydwen.gg source dump (cleaned)

5★ Aero, Gauntlets, Main DPS. Echo Skill damage archetype (like Phrolova/Galbrena) — generates and consumes Runes via Basic Attacks to fuel a big Forte nuke.

## Kit

### Basic Attack — One, Two, Three
- **Basic Attack**: up to 4 hits, Aero DMG. Casting Stage 4 enters Decipher state (5s, ends early on swap-out). At ≥50 Full Stop, the Basic cycle starts from Stage 2.
- **Basic Attack - Elucidated** (Echo Skill DMG): in Decipher, ground Normal Attack — Aero DMG, ends Decipher.
- **Heavy Attack**: STA cost, Aero DMG; a following Normal Attack chains into Basic Stage 2.
- **Mid-air Attack (Plunging)**: STA cost, Aero DMG; chains into Basic Stage 2.
- **Dodge Counter**: post-Dodge ground Normal Attack, Aero DMG; chains into Basic Stage 4.
- **Dodge Counter - Decipher** (Echo Skill DMG): in Decipher, post-Dodge ground Normal Attack — Aero DMG, ends Decipher.
- **Mid-air Dodge Counter**: post-Dodge mid-air Normal Attack, Aero DMG; chains into Basic Stage 2.

**Multipliers (Lv.10):**
- Basic Stage 1: 52.97%
- Basic Stage 2: 50.34%+50.34%
- Basic Stage 3: 33.41%+33.41%+44.54%
- Basic Stage 4: 41.36%+51.70%+51.70%+62.03%
- Basic - Elucidated: 61.56%×3+123.11%
- Heavy Attack: 58.14%×2 (STA 20)
- Mid-air Attack: 104.78% (STA 30)
- Dodge Counter: 65.91%+65.91%+87.88%
- Mid-air Dodge Counter: 206.17% (STA 30)
- Dodge Counter - Decipher: 61.56%×3+123.11%

### Resonance Skill — Royan Close Quarters Combat
- **BOOMY BOOM!**: Aero DMG; a following Normal Attack chains into Basic Stage 3. Cooldown 10s.
- **BIG BOOMY BOOM!** (Echo Skill DMG): in Decipher, ground Skill press — Aero DMG, ends Decipher.
- **Soliskin to the Aid** (Echo Skill DMG): in Decipher at ≥50 Full Stop, ground Skill press — Aero DMG, ends Decipher.

**Multipliers (Lv.10):** BOOMY BOOM! 28.63%+28.63%+28.63%+57.26%; BIG BOOMY BOOM! 28.81%×4+172.85%; Soliskin to the Aid 27.83%×3+194.77%.

### Resonance Liberation — Where Trust Leads Me! (Echo Skill DMG)
Aero DMG, grants Divergent (20s). **Divergent**: the next Rune gained also grants a Rune of the opposite type, then is removed; Convergent takes priority if both are held; doesn't trigger at 100 Full Stop.
**Multipliers (Lv.10):** 861.43%. Cooldown 25s, cost 125, Concerto Regen 20.

### Forte Circuit — Within Infinity's Embrace
- **Heavy Attack - Schemata of Runes** (Echo Skill DMG): hold Normal Attack, consumes 2 Runes. Trust+Answer → Runic Outburst; 2× Trust → Runic Chain Whip; 2× Answer → Runic Soliskin. At ≥30 Soliskin Vitality, consumes 30 to add +50% DMG Multiplier to the current Runic effect and grants 1 Innate Gift? stack; below 30, consumes all of it for +15% DMG Amplification per 10 points consumed.
  - **Runic Outburst** (Echo Skill DMG): Aero DMG.
  - **Runic Chain Whip** (Echo Skill DMG): Stagnates nearby targets, Aero DMG.
  - **Runic Soliskin** (Echo Skill DMG): pulls in nearby targets, Aero DMG.
- **Forte Circuit - Learn My True Name** (Echo Skill DMG): at 100 Full Stop and off cooldown, hold Skill to consume all Full Stop — Aero DMG (Skill tap alone still casts BOOMY BOOM!/Soliskin to the Aid).
- **Innate Gift?** (cap 2): each stack grants Runic Outburst/Chain Whip/Soliskin/Learn My True Name +30% DMG Amplification; ends after Learn My True Name cast or swap-out.
- **Rune** (cap 4, or 2 without ≥50 Full Stop; +2 more slots at ≥50 Full Stop): oldest Rune shifts out when gaining a new one at cap. Basic - Elucidated/Dodge Counter - Decipher hits grant Rune: Trust; BIG BOOMY BOOM!/Soliskin to the Aid hits grant Rune: Answer.
- **Full Stop**: +50 after Schemata of Runes cast.
- **Soliskin Vitality** (cap 60): +10 per unique-named teammate Echo Skill cast nearby (each Echo name triggers once); Outro resets the per-Echo trigger record.

**Multipliers (Lv.10):** Schemata of Runes 132.51%; Runic Outburst 117.67%+205.92%+264.75%; Runic Chain Whip 49.70%×4+66.26%×3; Runic Soliskin 39.76%+59.63%×4+119.26%; Learn My True Name 302.87%+908.61% (cooldown 25s, Concerto Regen 10).

### Forte Circuit — Tune Break
At full Off-Tune Level, casts Tune Break on the target; a following Normal Attack chains into Basic Stage 3.

### Inherent Skills
- **True Names Invoked**: Intro grants Convergent (20s). **Convergent**: next Rune gained also grants a same-type Rune, then removed; takes priority over Divergent if both held; doesn't trigger at 100 Full Stop.
- **True Names Aligned**: gains 1 Blessing of Runes (cap 6) per unique-named teammate Echo Skill cast nearby; resets on lineup change. **Blessing of Runes**: each stack grants the active Resonator +3% Aero DMG Bonus and +3% Echo Skill DMG Bonus; at 6 stacks, an extra +30% to both. Every 1% Energy Regen over 125% grants +2% Echo Skill DMG Bonus, up to +50%.

### Intro Skill — Solsworn Etymology
Aero DMG; a following Normal Attack chains into Basic Stage 2. **Multipliers (Lv.10):** 163.42%. Concerto Regen 10.

### Outro Skill — In This Very Moment
Aero DMG = 795% ATK. Grants 2 stacks of Encapsulated (30s). **Encapsulated**: when any nearby teammate casts an Echo Skill, Stagnates the target and consumes 1 stack (cap 2); all stacks removed if Sigrika leaves the lineup.

### Resonance Chain (S1–S6)
- **S1**: Basic - Elucidated / Dodge Counter - Decipher / BIG BOOMY BOOM! / Soliskin to the Aid DMG Multipliers +70%. Interruption immunity while casting Basic - Elucidated / BIG BOOMY BOOM! / Soliskin to the Aid. Encapsulated cap raised to 3; Outro grants 1 additional stack.
- **S2**: Learn My True Name DMG Multiplier +120%. Out of combat for >4s grants Divergent (once per 4s).
- **S3**: Innate Gift? cap raised to 4 and no longer removed by Learn My True Name cast or swap-out (only clears after 30s continuously out of combat).
- **S4**: Any teammate's Echo Skill cast grants the whole team +20% ATK for 20s.
- **S5**: Liberation (Where Trust Leads Me!) DMG Multiplier +30%.
- **S6**: Targets take +30% more DMG from Sigrika. Innate Gift? gains: each stack also grants Runic Outburst/Chain Whip/Soliskin/Learn My True Name +15% DMG Amplification (up to 60%) and DEF Ignore +7.5% (up to 30%).

### Minor Fortes
Crit Rate +8%, ATK% +12%.

### Base Stats (Lv.90, incl. minor fortes)
HP 10775 · ATK 438 · DEF 1137 · Max Energy 125 · Crit Rate 5% · Crit DMG 150% · Aero DMG 0%.

*(Upgrade material info not yet listed on this source page.)*

## Review

**DPS tier**: **T0** (ToA, standard) / **T0** (WW, standard) — **T0.5** (ToA, Value list) / **T0** (WW, Value list).

**Pros**
- One of the best overall DPS in the game with the right investment/team — arguably the strongest Whimpering Wastes DPS, and an excellent ToA/Matrix DPS too.
- Buffs team Aero and Echo Skill DMG.
- Built-in Stun mechanics (Outro-triggered Stagnate on teammate Echo Skill casts, plus her own grouping/stun during her rotation) that ease team rotations.

**Cons**
- Lacks good F2P teammates and F2P weapons — near-mandatory to have Qiuyuan or Lucilla, and her Signature weapon is a strongly desired upgrade to reach top-level performance.

**Review summary**: Specializes in Echo Skill damage, similar to Phrolova/Galbrena, but doesn't enter an enhanced state — instead builds toward her Forte nuke. Core mechanic is generating/consuming Runes via her enhanced Basic Attacks (Basic - Elucidated/Dodge Counter - Decipher for Trust Runes, BIG BOOMY BOOM!/Soliskin to the Aid for Answer Runes), gaining 1 Rune per full Basic chain (2 if Intro/Ultimate was cast within the last 20s). Consuming 2 same-type Runes in her Heavy Attack triggers a real effect (Runic Outburst/Chain Whip/Soliskin depending on type); 2 different-type Runes (from her Ultimate) just deals higher plain damage with no extra effect. Once both special Heavy Attacks are used, holding Skill casts her big Forte nuke, ending the rotation.

Dodge Counter conveniently chains into Basic Stage 4, so dodging doesn't disrupt Rune generation. Discourages swapping — loses team Outro buffs, her own Aero/Echo Skill DMG buff (Inherent-driven, active-character-only), and a large chunk of Forte DMG Amplification on her strongest hits. Her Outro-triggered Stagnate on teammate Echo Skill casts helps inconsistent teammates like Qiuyuan land scripted rotations reliably against aggressive bosses.

Almost all of her damage is Echo Skill DMG, a category almost nothing else can buff besides Qiuyuan or Lucilla — and she has 3 separate layers of mechanics (Forte's Soliskin Vitality, Inherent's Blessing of Runes, Encapsulated) all keyed to teammate Echo Skill casts, making her very reliant on Qiuyuan/Lucilla specifically (Lynae/Mornye are much weaker alternatives). Lacks strong F2P weapon alternatives too, unlike Luuk Herssen/Aemeath. A super strong DPS with a real opportunity-cost catch — extremely rewarding with the right teammates and investment, probably the strongest Whimpering Wastes DPS and one of the strongest in ToA/Matrix too.

## Build

**Best Weapons** (calculated with Qiuyuan + Emerald Sentence/Moonlit Clouds set + Impermanence Heron, and Ciaccona + Woodland Aria/Gusts of Welkin set + Nightmare: Kelpie as teammates):
1. **Solsworn Ciphers (signature, R1)** — 100.00%. ATK+12%. Intro or Echo Skill cast grants +32% Echo Skill DMG Amplification (15s). Echo Skill DMG: Aero DMG ignores 10% target DEF (6s). Stats: ATK 587, Crit DMG 48.6%. Only weapon giving her desired stat mix (high ATK, Crit DMG, Echo Skill DMG Amp, extra DEF Ignore) — de facto best by a good amount.
2. **Blazing Justice** — 85.40%. ATK+12%. Basic Attack cast: ignores 8% target DEF, Amplifies Spectro Frazzle DMG +50% (6s, unused by Sigrika — the DEF Ignore is the relevant part). Stats: ATK 587, Crit DMG 48.6%. Same base stats as her Signature plus a small extra DEF Ignore boost.
3. **Pulsation Bracer** — 81.80%. ATK+12%. Damaging Interfered targets: +6% Basic Attack DMG Bonus (3s, up to 4 stacks, 0.5s trigger cap) — unused passive. Stats: ATK 587, Crit Rate 24.3%. Best permanent option — plain ATK/Crit Rate stick. (Same calculation applies to Tragicomedy and Daybreaker's Spine.)
4. **Verity's Handle** — 78.50%. Attribute DMG+12% (in place of ATK). (Liberation DMG passive, unused.) Stats: ATK 587, Crit Rate 24.3%. Slightly worse than the above ATK sticks.
5. **Moongazer's Sigil** — 76.30%. ATK+12%. (Liberation-focused passive, unused.) Stats: ATK 500, Crit Rate 36%. Too much Crit Rate given her own kit buffs, plus lower base ATK — underperforms the above.
6. **Abyss Surges** — 69.40%. Energy Regen+12.8%. (Basic/Skill DMG passive, unused.) Stats: ATK 587, ATK 36.4%. Big ATK/ER but no Crit stat — worse overall.
7. **Aether Strike (R5, Battle Pass)** — 69.40% (tied). Liberation cast: ATK+23%, +34.5% Liberation DMG Bonus (15s). Stats: ATK 412, Crit DMG 40.5%. Best 4★ by a tiny margin, but far behind any 5★ due to much lower base ATK.
8. **Legend of Drunken Hero (R5)** — no % listed (lowest, last in list). Damaging Negative-Status enemies: ATK+8% (10s, 1/s trigger, up to 4 stacks) — usable since Ciaccona is on her calc team. Stats: ATK 462, ATK 18.2%. Best F2P no-gacha option; without the passive active it underperforms the listed number but remains an acceptable temporary pick. 5★ options like Pulsation Bracer still strongly preferred.

**Best Echo Set**: **Sound of True Name** (100.00%). 2pc: +10% Aero DMG. 5pc: dealing Echo Skill DMG grants +20% Echo Skill Crit Rate and +15% Aero DMG Bonus (5s). Easily-accessed +20% Crit Rate and +25% total Aero DMG Bonus — the clear best set for her.
- Main Echo option: **Nameless Explorer** — simple Summon Echo usable anytime in the rotation; main-slot passive grants +12% Aero DMG Bonus and +20% Echo Skill DMG Bonus.

**Best Echo Stats**: 4-cost Crit Rate/Crit DMG · 3-cost ATK% · 3-cost ATK% > Energy Regen · 1-cost ATK% ×2.
**Substat priority**: Energy Regen (until satisfied) > Crit DMG = Crit Rate > Energy Regen (above 125% until 150%) > ATK% > ATK. (Build Energy Regen only to team requirements first; push past 125% only with spare substats/for max optimization. ATK/ATK main-stats are always correct.)

### Endgame Stat Targets (Lv.90)
HP 15000+ · DEF 1100+ · ATK 2400–3000+ · Crit Rate 65%+ (before set bonus) · Crit DMG 210–290%+ · Energy Regen 109–119% (lower with Qiuyuan+Ciaccona/Phrolova, higher with Qiuyuan+Shorekeeper) · Aero DMG Bonus 10–40%+.

### Skill Priority
Forte Circuit > Resonance Liberation > Basic Attack > Intro Skill > Resonance Skill (Intro and Skill both practically don't matter and should be skipped when leveling; Forte is by far the most important).

## Gameplay & Teams

### Standard Rotation
Intro → Basic 2 → Basic 3 → Basic 4 → Basic: Elucidated → Heavy: Chain Whip (animation cancelled on hit via Ultimate) → Ultimate → Basic 2 → Basic 3 → Basic 4 → Basic: Elucidated → Heavy: Outburst (animation cancelled on hit via Hold Skill) → Hold Skill: Learn My True Name → Outro.

Echo Skill: usable at any point in the rotation.

### Double Outburst (Advanced Quickswap Hypercarry variant)
In fast-rotating Quickswap teams (e.g. Qiuyuan+Shorekeeper) there can be enough spare rotation headroom to build up to 2 stronger Outburst Forte Heavies (2 different Runes each cast) instead of 1 Outburst + 1 Chain Whip.

**Double Outburst Opener**: Ultimate → Skill → Basic 3 → Basic 4 → Basic: Elucidated (swap out). *(During another character's Quickswap window: Skill → Basic 3 → Basic 4 → Basic: Elucidated (swap).)*

**Double Outburst Loop**: Intro → Heavy: Outburst → Basic 2 → Basic 3 → Basic 4 → Basic: Elucidated → Basic 2 → Basic 3 → Basic 4 → Skill: BIG BOOMY BOOM! → Heavy: Outburst (animation cancelled on hit via Hold Skill) → Hold Skill: Learn My True Name → Ultimate → Outro.

This extra-Ultimate opener trick also works outside Quickswap (an early extra Ultimate cast, ~25s before Outro), but costs about 1s of rotation time (can't animation-cancel one Forte Heavy), so its use case is niche. Not worth running this extension unless the team's Standard Rotation already takes ~25s or more — it's a bonus extension when there's spare time, not a strict upgrade, and Quickswap-only.

### Synergies
- **Qiuyuan / Lucilla / Ciaccona / Lynae** — best buffers. Qiuyuan and Lucilla provide the Echo Skill casts and Echo Skill DMG buffs Sigrika needs most — by far her strongest synergies and a staple of top teams. Ciaccona is the best 3rd-slot pairing with Qiuyuan (party Aero DMG + Aero RES Shred with her Signature; without it, Shorekeeper is preferred, especially with Lucilla) — she can also fill the 2nd slot alongside Shorekeeper/Aero Rover. Lynae is the fallback option for very generalized buffing if the others are unavailable.
- **Phrolova** — particular synergy: both function similarly and can share Qiuyuan's extra Echo Skill casts to deal big damage together. Sigrika's Inherent buffs Phrolova slightly, though it doesn't amount to much — mostly the pairing benefits from working with Qiuyuan together. Great for Whimpering Wastes, considerable for single-target if Phrolova lacks her own ideal teammates (e.g. Cantarella).
- **Shorekeeper / Mornye / Verina / Rover (Aero)** — best 3rd-slot options. Shorekeeper is generally strongest (extra Sustain vs. Ciaccona, doesn't need a Signature weapon for near-full team buffs). Mornye pairs better with Lynae; Aero Rover pairs better with Ciaccona in alternative teams. Verina is a generally solid, permanently accessible fallback.

### Example Teams
- **Best Team**: Sigrika + Qiuyuan + Lucilla + Ciaccona/Shorekeeper/Phrolova/Verina. (Phrolova stronger for AoE multi-wave like Whimpering Wastes; otherwise prefer other Support options in single-wave content.)
- **Alternative Team**: Sigrika + Lynae + Ciaccona/Mornye/Rover (Aero)/Shorekeeper/Verina. (Mornye only alongside Lynae; Aero Rover only alongside Ciaccona.)

## Calculations

### Damage Profile
Basic 79,389 · Heavy 0 · Skill 0 · Liberation 0 · Intro 13,573 · Outro 82,890 · Echo 1,563,992.
Total: 1,739,844. Echo 89.9% · Outro 4.8% · Basic 4.6% · Intro 0.8%.

*(Confirms the overwhelming majority of her real damage — including her nominal Heavy Attack, Resonance Skill, Resonance Liberation, and Forte Circuit hits — is counted under "Echo" per the kit's own extensive "considered Echo Skill DMG" reclassifications; Heavy/Skill/Liberation categories are genuinely 0%, and only her plain Basic Attack chain and Intro/Outro stay in their own categories.)*

### Damage Output by Sequence (1-Target, 11.09s rotation)
- S0: 1,739,844 DMG / 156,884 DPS (100.00%)
- S1: 1,862,498 DMG / 167,943 DPS (107.05%)
- S2: 2,412,720 DMG / 217,558 DPS (138.67%)
- S3: 2,683,748 DMG / 241,997 DPS (154.25%)
- S4: 2,856,448 DMG / 257,569 DPS (164.18%)
- S5: 2,934,741 DMG / 264,629 DPS (168.68%)
- S6: 4,672,862 DMG / 421,358 DPS (268.58%)

No adjacent-sequence pair is byte-identical — every node has a real, distinct DPS contribution.

Calculation build used: Solsworn Ciphers (R1) + Sound of True Name 5pc + Nameless Explorer main echo; substats ATK 45% / Crit Rate 42% / Crit DMG 84%.
