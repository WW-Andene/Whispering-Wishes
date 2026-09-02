# Yangyang: Xuanling — Prydwen.gg source dump (cleaned)

5★ Havoc, Sword, Main DPS. Havoc Bane / Heavy Attack archetype, switches between Azure and Feather Sword Stance.

## Kit

### Basic Attack — Succor and Smite
- **Basic Attack - Azure Sword Stance**: up to 4 hits, Havoc DMG, consumes Melody. While Melody isn't depleted, Energy Regen +20% on hit. Stage 4 applies 1 Havoc Bane.
- **Basic Attack - Feather Sword Stance**: same shape, Havoc DMG, Stage 4 applies 1 Havoc Bane.
- **Mid-air Attack - Azure/Feather Sword Stance**: STA cost, Plunging Attack, consumes Melody, Havoc DMG; chains into Basic Stage 2 of the matching stance.
- **Dodge Counter - Azure/Feather Sword Stance**: post-Dodge Normal Attack, consumes Melody, Havoc DMG; chains into Basic Stage 3 of the matching stance (counts as that stance's Basic Stage 2 for cycle purposes).

**Multipliers (Lv.10):**
- Azure Basic Stage 1: 47.72%
- Azure Basic Stage 2: 20.14%+20.14%+60.41%
- Azure Basic Stage 3: 30.21%+70.48%
- Azure Basic Stage 4: 18.57%+18.57%+148.49%
- Feather Basic Stage 1: 39.77%+39.77%
- Feather Basic Stage 2: 33.56%×3
- Feather Basic Stage 3: 14.86%+7.43%×3+37.14%
- Feather Basic Stage 4: 71.58%+71.58%+95.43%
- Mid-air Attack - Azure: 98.61%
- Mid-air Attack - Feather: 98.61%
- Dodge Counter - Azure: 39.23%+39.23%+117.67%
- Dodge Counter - Feather: 65.37%×3
- Mid-air Attack STA cost 30 (both stances).

### Resonance Skill — Feather's Edge
- **Sword Stance Switch (Azure↔Feather)**: switches stance and performs the target stance's Basic Stage 1, Havoc DMG.
- **Sword Stance Switch: Azure** (Heavy Attack DMG): from Feather Basic, switches to Azure — Havoc DMG; can Dodge-cancel into it (consumes 50 Melody); Basic cycle doesn't reset briefly after.
- **Sword Stance Switch: Feather** (Heavy Attack DMG): mirror of the above from Azure Basic.

**Multipliers (Lv.10):** Switch: Azure 69.95%+15.55%×3; Switch: Feather 33.56%×3.

### Resonance Liberation — Hush of a Thousand Voices (Heavy Attack DMG)
Consumes all Melody, Havoc DMG, restores 1 Azure Plume. Grants Voice upon Voice (no stacking): the next Sword Stance Flow: Azure/Feather cast summons **Shadow of Xuanling** (Heavy Attack DMG) to attack, then removes Voice upon Voice.
**Multipliers (Lv.10):** Hush of a Thousand Voices 1988.10%; Shadow of Xuanling 337.98%. Cost 125, Concerto Regen 20, cooldown 25s.

### Forte Circuit — The Way of Ten Thousand Voices
- **Resonance Skill - Sword Stance Flow: Azure** (Heavy Attack DMG): replaces Feather's Edge when Melody depletes in Feather stance. Switches to Azure, Havoc DMG, restores 100 Melody + 1 Azure Plume; consumes 1 Havoc Bane stack on hit. Doesn't reset the Feather Basic cycle briefly after cast — if it WOULD reset the cycle, instead summons a **Wraith of Sound** to finish the attack (fixed Havoc DMG, considered Basic Attack DMG, unaffected by DMG Bonus, no Havoc Bane). Dodge-cancellable (consumes 50 Melody).
- **Resonance Skill - Sword Stance Flow: Feather** (Heavy Attack DMG): mirror of the above from Azure stance.
- **Heavy Attack - Azure Sword Stance** (Heavy Attack DMG): at max Azure Plume in Azure stance, hold Normal Attack (STA + all Azure Plume) — big cyclone hit. Grants Bated Breath: while active on-field, +160% Crit DMG to this Heavy Attack (removed once it ends; obtainable once per 25s). Applies 2 Havoc Bane.
- **Heavy Attack - Feather Sword Stance**: at max Azure Plume in Feather stance (grounded, not mid Havoc in Bloom cycle), hold Normal Attack (STA) — Havoc DMG, auto-chains into Mid-air Attack - Feather Fall on hit. Grants Streaming Storm (15s): while active on-field, +160% Crit DMG to this Heavy Attack or the next Feather Fall/Havoc in Bloom Basic/Dodge Counter hit (removed when Havoc in Bloom Stage 3 ends; obtainable once per 25s). Applies 2 Havoc Bane.
- **Mid-air Attack - Feather Fall**: at max Azure Plume in Feather stance while airborne, replaces Mid-air Attack - Feather Sword Stance. Press/hold Normal Attack (STA + all Azure Plume) — Havoc DMG, enters **Hark the Wind** (12s).
- **Hark the Wind**: in Feather stance, Basic Attack - Feather Sword Stance is replaced by **Basic Attack - Havoc in Bloom** (Heavy Attack DMG) — up to 3 hits; Stage 2/3 castable mid-air near ground; Stage 3 ends the cycle (non-resettable). A Dodge Counter during this counts toward the Havoc in Bloom cycle.
- **Feathered Oath**: any nearby teammate inflicting Havoc Bane grants 1 stack (4s, 1/s trigger cap, up to 6 stacks); while on-field, each stack gives +25% Crit DMG (up to +150%) to Heavy Attack - Azure/Feather, Feather Fall, Havoc in Bloom Basic/Dodge Counter.
- **Refrain**: before Basic Stage 4 (either stance) or Heavy Attack (either stance) hits, propagates the highest nearby Havoc Bane stack count to all nearby targets.
- **Melody** (cap 100): restored to 100 by Sword Stance Flow: Azure/Feather; fully consumed by Liberation; drained by Normal Attacks on hit; Dodge-cancelling a Stance Switch/Flow cast also consumes 50.
- **Azure Plume** (cap 2): +1 from Sword Stance Flow: Azure/Feather or Intro; +1 from Liberation; fully consumed by Heavy Attack - Azure or Mid-air Attack - Feather Fall.

**Multipliers (Lv.10):**
- Sword Stance Flow: Azure: 69.95%+15.55%×3
- Sword Stance Flow: Feather: 33.56%×3
- Heavy Attack - Azure: 135.16%+135.16%+180.21%
- Heavy Attack - Feather: 21.71%+195.34%
- Mid-air Attack - Feather Fall: 14.80%×3+66.57% (STA 20)
- Havoc in Bloom Stage 1: 39.79%×3
- Havoc in Bloom Stage 2: 89.25%+66.94%+66.94%
- Havoc in Bloom Stage 3: 23.98%×5+279.69%
- Dodge Counter - Havoc in Bloom Stage 1-3: identical to Basic Havoc in Bloom Stage 1-3 above
- Wraith of Sound: 523 (flat, fixed)
- Heavy Attack STA cost 10 (both stances).

### Forte Circuit — Tune Break - Sword
At full Off-Tune Level, casts Tune Break on the target.

### Inherent Skills
- **Unbroken Vow**: at 1–3 Havoc Bane stacks on target, each stack Amplifies Yangyang's DMG +10% (up to +30%); at 4–6 stacks, each stack instead Amplifies +12% (up to +36%).
- **One Life, One Blade**: Liberation raises target's Havoc Bane to max on hit. Any nearby teammate inflicting Havoc Bane grants 1 Windbound stack (1/s trigger cap, up to 6). At 6 Windbound, all are consumed for One with the Wind: the next Sword Stance Flow cast summons **Feather Release: Xuanling** to apply 6 Havoc Bane stacks, then ends the state. Windbound can't stack while One with the Wind is active.

### Intro Skill — Skybound Feather
Havoc DMG, restores 1 Azure Plume, applies 1 Havoc Bane on hit. **Multipliers (Lv.10):** 116.59%. Concerto Regen 10.

### Outro Skill — As the Wind Wills
Havoc DMG = 300% ATK. All other teammates gain Tonal Switch (20s): the next time a Tonal Switch holder inflicts Havoc Bane, their Havoc DMG is Amplified +20%. Resets on re-cast.

### Resonance Chain (S1–S6)
- **S1**: Sword Stance Flow: Azure/Feather cast summons **Shadow of Xuanling: Unfaltering** (Havoc DMG = 337.98% ATK, considered Heavy Attack DMG) and Stagnates nearby enemies. Heavy Attack - Azure / Havoc in Bloom Basic / Havoc in Bloom Dodge Counter gain interruption immunity.
- **S2**: Heavy Attack - Azure/Feather, Feather Fall, Havoc in Bloom Basic/Dodge Counter DMG +100%. After >4s continuously out of combat (post-combat-exit or revive), once: gain 1 Strung Notes stack (next Azure/Feather Basic cast summons **Shadow of Xuanling: Strung Notes**, 337.98% ATK, Heavy Attack DMG, then Strung Notes is removed); restore 2 Azure Plume; reset Bated Breath/Streaming Storm's cooldowns.
- **S3**: Liberation (Hush of a Thousand Voices) DMG Amplified +175%. After Intro or Sword Stance Flow: Azure/Feather, max Havoc Bane stacks on nearby targets +3 for 20s (doesn't stack). Basic Stage 4 (either stance) and Heavy Attack (either stance) inflict 1 extra Havoc Bane stack.
- **S4**: Intro, Sword Stance Switch: Azure/Feather, or Sword Stance Flow: Azure/Feather cast grants the whole team +20% ATK for 20s.
- **S5**: On a fatal blow, doesn't go down — instead heals 50% Max HP and gains 3s DMG/interruption immunity. Once per 10 minutes.
- **S6**: Inflicting Havoc Bane grants Voice Flux (30s): while active, Heavy Attack DMG +40%. Sword Stance Flow: Azure/Feather cast grants Still as Withered Wood (30s): while active and on-field, any nearby teammate inflicting Glacio Chafe/Fusion Burst/Electro Flare/Aero Erosion/Spectro Frazzle/Havoc Bane summons **Shadow of Xuanling: Still as Withered Wood** (337.98% ATK, Heavy Attack DMG, guaranteed crit) — once per second, up to 5 summons per Still as Withered Wood application (recharges on expiry/removal). Cooldown 25s.

### Minor Fortes
Crit Rate +8%, ATK% +12%.

### Base Stats
*(Not listed on this source page: "Stats data not available for this character." Upgrade material info also not yet listed.)*

## Review

**DPS tier**: **T0** (ToA, standard) / **T1** (WW, standard) — **T0** (ToA, Value list) / **T1.5** (WW, Value list).

**Pros**
- Top-tier damage ceiling, mid-air-combat-focused, generally hard-to-interrupt animations.
- Excels in all endgame content (single-target AND multi-wave) — applies/spreads Havoc Bane herself constantly.
- Energy Regen requirements trivially easy to meet.
- Huge range of viable teams, F2P and premium alike.
- Short rotation for a Main DPS while dealing enormous damage.

**Cons**
- Self-buffs Crit stats so heavily that Shorekeeper becomes largely redundant on her — more limited premium 3rd-slot options than most (Mornye only with Lynae, or Chisa, as upgrades from Verina).
- Somewhat limited Swap Cancel potential; plays best with Outro buffers since her damage is spread evenly across her rotation (hard to buff key moments), and a lot of her self-buffs are on-field-only.

**Review summary**: Relies on Havoc Bane + Heavy Attack damage for a fast yet extremely strong rotation. Constantly applies Havoc Bane (upkeeping max stacks even in multi-wave content), which both DEF-Shreds enemies and (via her own Inherent) Amplifies her own DMG up to +30%/+36% at 1–3/4–6 stacks. Rotation revolves around switching Azure ↔ Feather stance — starts in Azure by default, switches via Skill (or an enhanced Skill variant once Melody fully depletes, restoring Azure Plume which powers her Mid-air Attack and Azure Heavy Attack). Self-buffs Crit DMG heavily through the rotation (can exceed 500% total Crit DMG with a standard build/team). Outro buffs other Havoc Bane appliers' Havoc DMG (+20%) besides dealing a small hit itself (currently only Chisa can make direct use of it as a Havoc Bane applier).

Excels across every scenario — AoE, single-target, single-wave, multi-wave, F2P or premium. Despite her Signature being a good upgrade over Emerald of Genesis, still one of the most F2P-friendly characters overall, thanks to free-to-play Rebecca being a strong support and her sheer base damage. Works well with AoE powerhouses like Phrolova and generally-applicable supports like Lynae/Rebecca/Mortefi. Considered one of the most meta DPS releases to date — extremely few real flaws.

## Build

**Best Weapons** (calculated with Lynae + Spectrum Blaster/Pact of Neonlight Leap set + Hyvatia, and Chisa + Kumokiri/Rejuvenating Glow set + Fallacy of No Return as teammates):
1. **Azure Oath (signature, R1)** — 100.00%. All-Attribute DMG+12%. After inflicting Havoc Bane, +36% Heavy Attack DMG Amplification and Heavy Attack DMG ignores 12% target DEF (8s). Stats: ATK 587, Crit Rate 24.3%. Best by a landslide — Crit Rate + Heavy DMG Amp/DEF Ignore blend suits her since she scales excessively on most other stats already.
2. **Emerald Sentence** — 80.80%. ATK+12%. Echo Skill within 10s of Intro/Basic grants a stacking Heavy Attack DMG Bonus (used elsewhere, not counted for her passive directly — see below); Intro grants team +20% Echo Skill DMG Bonus (30s). Stats: ATK 587, Crit Rate 24.3%. Same base stats as Signature, replaces the passive with team-wide Echo/Heavy DMG support — 2nd best (even accounting for Phrolova benefiting from it on her team).
3. **Red Spring** — 80.50%. ATK+12%. Basic Attack DMG grants +10% Basic Attack DMG Bonus (14s, 1/s trigger, up to 3 stacks); Concerto Energy consumption grants +40% Basic DMG Bonus (10s). Stats: ATK 587, Crit Rate 24.3%. Mostly an ATK/Crit Rate stick — negligible Basic DMG Bonus gain for her.
4. **Everbright Polestar** — 80.30%. All-Attribute DMG+12%. (Tune Rupture/Fusion Burst passive, unused.) Stats: ATK 587, Crit Rate 24.3%. Stat stick.
5. **Frostburn** — 80.30% (tied). ATK+12%. (Glacio Chafe passive, unused.) Stats: ATK 587, Crit Rate 24.3%. Stat stick.
6. **Emerald of Genesis** — 79.90%. Energy Regen+12.8%. Skill cast: ATK+6%, up to 2 stacks (10s). Stats: ATK 587, Crit Rate 24.3%. Best permanent 5★ option — negligible ER gain (her Echo set already gives +10%) plus a small ramp-up ATK bonus.
7. **Blazing Brilliance** — 73.70%. ATK+12%. Searing Feather stacks grant +4%/stack Resonance Skill DMG Bonus (up to 14 stacks, unused — Skill DMG isn't relevant to her). Stats: ATK 587, Crit DMG 48.6%. Crit DMG scales noticeably worse than Crit Rate on her.
8. **Lumingloss (R5, Battle Pass)** — 70.40%. Skill cast: Basic+Heavy DMG +64% (10s, 1/s trigger, 1 stack). Stats: ATK 387, ATK 36.4%. Best 4★ option — some Heavy DMG Bonus plus good ATK, still far behind any 5★.
9. **Fables of Wisdom (R5)** — no % listed (lowest, last in list). Damaging Negative-Status enemies: ATK+8% (10s, 1/s trigger, up to 4 stacks). Stats: ATK 462, ATK 18.2%. Best no-gacha option — lots of ATK, no other relevant stats.

**Best Echo Set**: **Song of Feathered Trace** (100.00%). 2pc: +10% Energy Regen. 5pc: inflicting Havoc Bane grants Xuanling's Feather — +20% Crit Rate and +35% Heavy Attack DMG Bonus (15s); inflicting Glacio Chafe grants Chongming's Feather — +0.1% team ATK per 1% of the Resonator's own Energy Regen, up to +25% (10s, irrelevant to Yangyang's own Glacio-less kit but present as a team-support side-clause). A significant Crit Rate + Heavy DMG boost on top of easing Energy needs — her perfect DPS set.
- Main Echo option: **Thousand-Puppet Pavilion** — main-slot passive grants +12% Havoc DMG and +12% Heavy Attack DMG Bonus, the best fit for her set.

**Best Echo Stats**: 4-cost Crit Rate/Crit DMG · 3-cost Havoc DMG · 3-cost ATK% = Havoc DMG · 1-cost ATK% ×2.
**Substat priority**: Energy Regen (until satisfied) > Crit Rate = Crit DMG > ATK% = Heavy DMG% > ATK.

### Endgame Stat Targets (Lv.90)
HP 15500+ · DEF 1100+ · ATK 2100–2300+ · Crit Rate 65%+ (before set bonuses) · Crit DMG 255–300%+ · Energy Regen 107–119% (lower end w/ Rebecca+Chisa, higher end w/ Chisa+Verina; easily met thanks to her 2pc Echo set's +10% ER) · Havoc DMG Bonus 30–60%+.

### Skill Priority
Forte Circuit > Resonance Liberation > Basic Attack > Intro Skill > Resonance Skill (Skill can be fully skipped — useless to her practical rotation; Basic and Intro also skippable for minimal loss).

## Gameplay & Teams

### Standard Rotation
Intro → Basic: Azure 1 → Basic: Azure 2 → Basic: Azure 3 → Basic: Azure 4 → Skill (switch to Feather) → Heavy: Feather → Basic: Mid-air Attack: Feather Fall → Basic: Havoc in Bloom 1 → Basic: Havoc in Bloom 2 → Basic: Havoc in Bloom 3 (animation endlag cancelled via Ultimate) → Ultimate → Skill (switch to Azure) → Heavy: Azure → Outro.

Echo Skill: recommended to use immediately at rotation start (a Summon Echo that deals periodic damage as Havoc Bane is applied throughout the rotation).

### Synergies
- **Chisa / Suisui** — Yangyang's best partners. Chisa provides general Negative Status buffing, applies Havoc Bane herself, and raises its max stack count (great as a 2nd slot alongside Suisui, or 3rd slot alongside Heavy Attack Outro buffers). Suisui is the strongest available 3rd slot by sheer buff amount for Havoc Bane consumers like Yangyang.
- **Rebecca / Lynae / Phrolova / Iuno / Mortefi** — Heavy Attack Outro buffers that work well; Lynae also brings strong general buffs plus high personal damage. Not far behind her best teams — Phrolova is a fantastic Dual DPS pick for her best Whimpering Wastes teams, and Rebecca+Suisui is shockingly close to Chisa+Suisui in strength.
- **Mornye / Verina** — decent 3rd-slot fallbacks if Chisa/Suisui aren't available. Verina is the generalist go-to; Mornye pairs best specifically with Lynae.

### Example Teams
- **Best Team**: Yangyang: Xuanling + Chisa + Suisui. (Run Chisa on Moonlit Clouds for the strongest buffing.)
- **Alternative Premium Teams**: Yangyang: Xuanling + Lynae/Rebecca/Iuno/Phrolova + Suisui/Chisa/Mornye. (Only run Mornye alongside Lynae, as an alternative to Suisui/Chisa.)
- **F2P Team**: Yangyang: Xuanling + Mortefi + Verina.

## Calculations

### Damage Profile
Basic 70,755 · Heavy 1,491,269 · Skill 0 · Liberation 0 · Intro 18,309 · Outro 47,112 · Echo 42,966.
Total: 1,670,411. Heavy 89.3% · Basic 4.2% · Outro 2.8% · Echo 2.6% · Intro 1.1%.

*(Confirms nearly her entire real damage — including her nominal Resonance Skill/Sword Stance Flow casts, Resonance Liberation, and most Basic/Havoc in Bloom hits reclassified via "considered Heavy Attack DMG" — is counted under "Heavy," the overwhelmingly dominant category at 89.3%; Skill and Liberation categories are genuinely 0%.)*

### Damage Output by Sequence (1-Target, 10.14s rotation)
- S0: 1,673,579 DMG / 165,047 DPS (100.00%)
- S1: 1,846,338 DMG / 182,084 DPS (110.32%)
- S2: 2,126,584 DMG / 209,722 DPS (127.07%)
- S3: 2,606,398 DMG / 257,041 DPS (155.74%)
- S4: 2,783,354 DMG / 274,492 DPS (166.31%)
- S5: 2,783,354 DMG / 274,492 DPS (166.31%)
- S6: 4,449,245 DMG / 438,781 DPS (265.85%)

**S4 and S5 are byte-identical** (2,783,354 DMG / 274,492 DPS both) — the same "zero real DPS component" signature already seen for Augusta/Aemeath's own S5 chain nodes. Matches S5's own kit text exactly: "When Yangyang: Xuanling takes a fatal blow, she will not be downed... immune to DMG and interruption for 3s. Once every 10 min" — a purely defensive/survivability node with no DPS component at all.

Calculation build used: Azure Oath (R1) + Song of Feathered Trace 5pc + Thousand-Puppet Pavilion main echo; substats ATK 45% / Crit Rate 42% / Crit DMG 84%.
