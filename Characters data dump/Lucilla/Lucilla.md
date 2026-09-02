# Lucilla — Prydwen.gg Build Guide (cleaned dump)

Last updated on source: 20/August/2026. Last review update: Patch 3.4. Last major build/calcs update: Patch 3.4.

5★ Glacio Rectifier. Dual-mode Hybrid (Resonance Mode - Glacio Chafe / Resonance Mode - Echo, configurable pre-combat), built around a 5-input, Energy-free Photo-consuming Ultimate.

## Kit

### Basic Attack — Snapshot

- **Basic Attack**: up to 3 consecutive attacks, Glacio DMG. Holding Normal Attack during Stage 3 deploys a Focus Ring; releasing outside Perfect Focus triggers Stage 3 - Unremarkable (Glacio DMG + Trace), inside Perfect Focus triggers Stage 3 - Commendable (more Glacio DMG + more Trace). Pressing Normal Attack shortly after Stage 2 skips straight to Stage 3 - Unremarkable. Holding Normal Attack chains Stage 1→2→3 automatically.
- **Mid-air Attack**: consumes STA, Plunging Attack, Glacio DMG. Pressing Normal Attack shortly after chains into Stage 2.
- **Dodge Counter**: press Normal Attack shortly after a successful Dodge, Glacio DMG. Chains into Stage 3 shortly after.

**Multipliers (Lv.10):**
| Move | DMG |
|---|---|
| Basic Attack Stage 1 | 59.29% |
| Basic Attack Stage 2 | 26.89%+40.34% |
| Basic Attack Stage 3 - Unremarkable | 159.55% |
| Basic Attack Stage 3 - Commendable | 235.27% |
| Mid-air Attack | 86.29% |
| Dodge Counter | 67.83%+82.90% |

Mid-air Attack STA cost: 30.

### Resonance Skill — Phantom Frame

Pulls in nearby targets, Glacio DMG. Holding Resonance Skill deploys a Focus Ring (cursor moves around it); releasing outside Perfect Focus triggers **Compensate** (Glacio DMG, reduces Skill CD by 8s, chains into Basic Attack Stage 2), releasing inside Perfect Focus triggers **Spotlight** (Glacio DMG, restores 20 Concerto Energy, inflicts an extra Glacio Chafe stack in Chafe mode, interruption-immune, chains into Basic Attack Stage 2). Casting on-field without holding directly triggers Compensate.

**Multipliers (Lv.10):** Phantom Frame 13.26%×3; Compensate 249.07%; Spotlight 82.35%+82.35%+274.48%+109.80%. Cooldown: 16s.

### Resonance Liberation — Clear As Day

Holds 0 max Resonance Energy — costs none. Unlocks once Lucilla holds all 3 Photos.

Deals Glacio DMG and enters **Reminiscence**:
- **Glacio Chafe mode**: DMG dealt is **considered Basic Attack DMG**. Grants +30% Basic Attack DMG Bonus for 10s.
- **Echo mode**: DMG dealt is **considered Echo Skill DMG**. Grants +30% Echo Skill DMG Bonus for 10s.

While in Reminiscence: increased interruption resistance; cannot cast Resonance Skill/Liberation. Basic Attack, Dodge Counter, Mid-air Attack, and Intro Skill are replaced with their Reminiscence-state versions. Can be cast mid-air close to the ground.

- **Basic Attack - Tracing Forms**: up to 3 consecutive attacks, Glacio DMG, **considered Basic Attack DMG**. Holding Normal Attack chains all 3 stages; Stage 3 can be repeatedly attacked while held, ending in **Letting It Go** automatically.
- **Letting It Go**: Glacio DMG to targets in range; **considered Basic Attack DMG** (Chafe mode) / **Echo Skill DMG** (Echo mode). Interruption- and damage-immune, disables Resonator switching while casting. Restores 20 Concerto Energy. Ends Reminiscence.
- **Mid-air Attack - Reminiscence**: consumes STA, Plunging Attack, Glacio DMG, considered Basic Attack DMG. Chains into Tracing Forms Stage 2.
- **Dodge Counter - Reminiscence**: Glacio DMG, considered Basic Attack DMG. Chains into Tracing Forms Stage 3.

**Multipliers (Lv.10):**
| Move | DMG |
|---|---|
| Clear As Day | 142.74% |
| Basic Attack - Tracing Forms Stage 1 | 30.64%+45.95% |
| Basic Attack - Tracing Forms Stage 2 | 59.77%+89.65% |
| Basic Attack - Tracing Forms Stage 3 | 52.12%×8 |
| Letting It Go | 84.81%×3+593.64% |
| Mid-air Attack - Reminiscence | 110.94% |
| Dodge Counter - Reminiscence | 115.55%+141.22% |

Mid-air Attack - Reminiscence STA cost: 30. Cooldown: 25s. Concerto Regen: 20.

### Intro Skill — Clip It

- **Clip It**: Glacio DMG, inflicts 1 stack of Glacio Chafe.
- **Clip It: Hard Cut** (replaces Clip It while in Reminiscence): Glacio DMG, inflicts 1 stack of Glacio Chafe. Chains into Tracing Forms Stage 3.

**Multipliers (Lv.10):** Clip It 97.42%; Clip It: Hard Cut 149.41%. Concerto Regen: 10 each.

### Outro Skill — Montage

- **Glacio Chafe mode**: Glacio Chafe DMG near the active Resonator Amplified by 60% for 30s. Ends early on mode switch.
- **Echo mode**: incoming Resonator gains 50% Echo Skill DMG Amplification for 14s. Ends early if they're swapped out, or on mode switch.

### Forte Circuit — Memory Palace / Tune Break: Rectifier

- **Déjà Vu** (on casting Clear As Day): Glacio Chafe mode — 4 stacks of Film Roll for 30s (max 4 stacks, removed on expiry). Echo mode — 1 stack of Zoom for 30s (max 1, removed on expiry). Ends early on mode switch.
- **Film Roll**: when another active teammate inflicts Glacio Chafe, Lucilla consumes 1 stack to inflict Glacio Chafe 2× more on nearby targets (once/0.5s).
- **Zoom**: each stack grants the active Resonator's Echo Skill +10% Crit. DMG.
- **Oblivion**: during Tracing Forms Stage 3, consumes 1 Photo intermittently to deal 1 instance of Glacio DMG. Glacio Chafe mode: considered Basic Attack DMG, inflicts 1 Glacio Chafe stack. Echo mode: considered Echo Skill DMG, each cast counted as a different Echo Skill.
- **Quick Glance**: camera mode for marking collectibles (non-combat).
- **Trace** (up to 150): +100 on Intro, +50 on Spotlight, +50 on Basic Stage 3 - Commendable, +25 on Compensate or Stage 3 - Unremarkable.
- **Photos** (up to 3): every 50 Trace restored generates 1 Photo.
- **Tune Break: Rectifier**: at full Off-Tune Level, can cast Tune Break.

**Multiplier (Lv.10):** Oblivion 285.48%.

### Inherent Skills

- **Slow Motion**: Focus Ring deployment slows targets in her shot. Casting Spotlight — Chafe mode: Glacio RES of targets near the active Resonator -8% for 30s (Chafe-DMG kills near her count as the active Resonator's). Echo mode: team +25% Echo Skill DMG Bonus for 30s. Ends on mode switch.
- **Remembrance**: Film Roll cap → 10, Zoom cap → 4. Each Photo consumed grants 2 Film Roll (Chafe mode) or 1 Zoom (Echo mode) instead of the base amount.

## Resonance Chain (S1–S6)

- **S1 — Distant Noon**: first Perfect Focus landing during Phantom Bubble's Focus Ring immediately expands it to fill the ring. Crit. Rate +20% for 10s on casting Spotlight. Interruption immunity during Phantom Frame and Tracing Forms Stage 3.
- **S2 — Slumbering Moonlight**: casting Clear As Day — Chafe mode: Glacio Chafe DMG near the active Resonator Amplified +80%. Echo mode: team +40% Echo Skill DMG Bonus. Lasts as long as Reminiscence is active, +30s after it ends; ends early on mode switch.
- **S3 — Days Fade Unheard**: **Letting It Go's DMG Multiplier +100%.**
- **S4 — The Past Fades Into Silence**: Oblivion pulls in nearby targets on hit. Casting Oblivion grants +10% ATK for 6s, stacking ×3 (all stacks removed on expiry). Taking 30% less DMG during Tracing Forms Stage 3.
- **S5 — Time is Like a Stream**: **Oblivion's DMG Multiplier +50%.**
- **S6 — Gazing In the Mist of Time**: in Reminiscence, each Photo consumed grants 1 stack of Remembrance (max 3); each stack increases Letting It Go's DMG to the target by 200% (up to 600% at max), consumed on cast. Gains Longing on a Reminiscence kill; ending Reminiscence out of combat consumes it to restore 150 Trace.

## Minor Fortes (Total)

CRIT Rate +8%, ATK% +12%.

## Base Stats (Lv.90, incl. minor fortes)

HP 12238, ATK 375, DEF 1198, Max Energy 150, CRIT Rate 5%, CRIT DMG 150%, Healing Bonus 0%, Glacio DMG 0%.

## Build

### Best Weapons (score % shown = Glacio Chafe / Echo)

Calculated with: Glacio Chafe — Hiyuki + Frostburn + Wishes of Quiet Snowfall set + Reminiscence: Threnodian - Voidborne Construct + Chisa + Kumokiri + Rejuvenating Glow set + Fallacy of No Return. Echo — Sigrika + Solsworn Ciphers + Sound of True Name set + Nameless Explorer + The Shorekeeper + Variation + Rejuvenating Glow set + Fallacy of No Return.

| Weapon | Chafe | Echo | Note |
|---|---|---|---|
| Freeze Frame (Signature, R1) | 95.70% | 81.60% | ATK+12%. After inflicting Glacio Chafe, self +30% Glacio DMG Bonus (12s), team +24% ATK (30s). Highest personal DMG of any option + team ATK buff. |
| Whispers of Sirens (R1) | 95.60% | 87.60% | 2nd-best Chafe mode (Echo Skill grants +40% Basic DMG Bonus, castable immediately in Chafe); nearly useless in Echo mode (barely deals Basic DMG there) |
| Stringmaster (R1) | 93.10% | 99.00% | Generic strong Rectifier choice — best non-Signature in Echo mode |
| Lethean Elegy (R1) | 93.10% | 80.50% | Only viable Signature alternative in Echo mode (fully benefits from its Echo Skill DMG effects) |
| Rime-Draped Sprouts (R1) | 92.40% | 79.50% | Mostly ATK/CRIT DMG stick — only benefits from 1 stack |
| Forged Dwarf Star (R1) | 92.40% | 79.50% | Simple ATK/CRIT Rate stick |
| Luminous Hymn (R1) | 90.40% | 68.60% | Simple ATK/CRIT Rate stick |
| Radiant Dawn (R5, Battle Pass) | 90.30% | 73.50% | Best Chafe-mode option among 4★s; not advised in Echo mode |
| Cosmic Ripples (R1) | 89.10% | 73.30% | Best permanent, but no CRIT stat — weak, especially Echo mode |
| Augment (R5, Battle Pass) | 87.00% | 62.10% | Best 4★ in Echo mode |
| Waltz in Masquerade (R5) | — | — | Best no-gacha; strong in Chafe, weak in Echo |

### Best Echo Sets

- **Wishes of Quiet Snowfall** (Chafe BiS, 100.00%): 2pc Glacio DMG +10%; 5pc — inflicting Glacio Chafe grants +10% Glacio DMG Bonus for 15s and the Snowfall effect (15s, once/25s): while active, dealing Liberation DMG removes it and grants +25% Crit Rate for 6s (extends 4s per Liberation hit, up to 6×/0.5s); Outro removes it and grants the incoming Resonator +25% Glacio DMG Bonus for 15s (only one Snowfall payoff triggers per removal). Main Echo: Glommoth (+12% Glacio DMG Bonus to incoming character via Outro).
- **Moonlit Clouds** (Echo BiS, 100.00%): 2pc Energy Regen +10% (useless to her); 5pc — Outro grants next Resonator +22.5% ATK for 15s. Main Echo: Impermanence Heron (adds +12% DMG Bonus to the Outro payoff).
- **Dream of the Lost** (special, Phrolova team, 3pc): permanent +20% CRIT Rate and +35% Echo Skill DMG Bonus — pair with 2pc Reel of Spliced Memories (recommended) or 2pc Moonlit Clouds. Main Echo: Voidwing Moth (+12% ATK to incoming character via Outro) preferred over Impermanence Heron (whose ER/Energy-restore half is wasted on her).

### Best Echo Stats

4-cost: CRIT Rate/CRIT DMG. 3-cost: Glacio DMG. 3-cost: Glacio DMG > ATK%. 1-cost ×2: ATK%.

Substat priority: CRIT Rate = CRIT DMG > ATK% > ATK = Basic DMG%. In Echo mode, Basic DMG substat is nearly useless (prioritize ATK instead); in Chafe mode it's only slightly ahead of ATK.

### Best Endgame Stats (Lv.90, S0)

HP 16000+, DEF 1150+, ATK 1900-2200+, CRIT Rate 65-80%+, CRIT DMG 210-280%+, Energy Regen 100%, Glacio DMG Bonus 30-70%+.

### Skill Priority

Res. Liberation > Res. Skill > Forte Circuit > Intro Skill > Basic Attack (Basic can be fully skipped — useless to her practical rotation; Intro can be skipped when leveling for minimal DPS loss).

## Gameplay and Teams

### Standard Rotation

Intro → Skill: Spotlight (Perfect Release) → Ultimate → (hold Basic/Heavy from here) → Heavy: Basic - Forms 1 → Forms 2 → Forms 3 → Letting It Go → Outro.

To release Spotlight perfectly, release ~a quarter-second into the hold, right as the two grey zones on the ring turn gold. Ultimate can be spammed (won't fire until the Skill animation finishes); in Chafe mode Outro can likewise be spammed by swapping during Letting It Go.

Echo timing: Phrolova/other Echo teams — swap at the end of the rotation, after Letting It Go, before Outro (Voidwing Moth/Impermanence Heron). Glacio Chafe — Summon Echo usable at any point.

### Synergies

- **Hiyuki** — Lucilla's only Glacio Chafe partner and best overall partner: Hiyuki's high base damage + Lucilla's heavy Glacio Chafe application produces massive Glacio Bite damage (a mix of Liberation and Basic DMG for Hiyuki).
- **Sigrika / Phrolova / Galbrena** — Echo mode: Lucilla's Outro amplifies Echo Skill DMG and she can cast multiple Echo Skills herself while boosting team Echo DMG generally. Sigrika is best by far (pairs naturally with Shorekeeper); Galbrena also works but her 1/3 Heavy DMG makes her a bit worse in the role than Qiuyuan; Phrolova pairs with both Lucilla and Qiuyuan for a heavy Echo Skill DMG team (Phrolova's new best team overall).

### Example Teams

- **Glacio Chafe**: Hiyuki / Lucilla / Suisui / Chisa. Shorekeeper/Verina also work in the 3rd slot but buff Hiyuki's team less effectively than Suisui/Chisa.
- **Echo Skill Hypercarry**: Sigrika / Galbrena / Lucilla / The Shorekeeper / Verina.
- **Phrolova Team**: Phrolova / Lucilla / Qiuyuan / Cantarella. With Cantarella on the team, pivot Lucilla to the 3rd slot and let Cantarella's Outro buff Phrolova instead.

## Review

**Ratings — Hybrid**: Tower of Adversity T0, Whimpering Wastes T0. Value Tier List: ToA (Value) T1, WW (Value) T0.5.

**Pros**: best pick for Glacio Chafe, one of the best for Echo Skill DMG — two of the game's strongest archetypes; no Energy requirement, only 5 rotation inputs, very easy and flexible; can lean personal-DMG or buffing depending on team role.

**Cons**: rotation restricts quickswap by design (animation-heavy, blocks swaps); like all Rectifier users, no good permanent Signature alternative (Cosmic Ripples never ideal), worse in Echo mode due to higher personal-stat reliance; needs 3 different Echo Sets total (2 modes + Phrolova team) for full flexibility.

Key mechanic: her core rotation is generating 3 Photos (Intro → timed Skill) then consuming them via Basic Attack in her Ultimate stance (casting Letting It Go), fully restoring Concerto Energy and deploying her mode-dependent buffs. Only 5 real inputs — tied with Sanhua for easiest Hybrid rotation in the game.

Buff recap by mode: attacks apply 25 Glacio Chafe stacks (Chafe) or 40% Echo Skill CRIT DMG (Echo); held-Skill grants -8% Glacio RES (Chafe) or +25% Echo Skill DMG team-wide (Echo); Outro amplifies Glacio Chafe DMG +60%/30s (Chafe) or Echo Skill DMG +50%/14s to the incoming character (Echo); 5pc Wishes of Quiet Snowfall + Glommoth gives the incoming character +37% Glacio DMG Bonus (Chafe teams); 5pc Moonlit Clouds + Heron gives +22.5% ATK and +12% general DMG Bonus to the incoming character (Echo teams); in Echo mode, each Photo consumed counts as a separate Echo Skill cast; in the Phrolova team, Voidwing Moth adds +12% ATK to the incoming character; her Signature gives the team +24% ATK.

Meta position: best-in-slot for Hiyuki (Glacio Chafe) and on equal footing with Qiuyuan for Sigrika/Galbrena/Phrolova (Echo) — Lucilla is more consistent (interruption-immune during Letting It Go, more specialized buffs, pairs better with Shorekeeper for Sigrika) but more Signature-reliant than Qiuyuan and less effective for Galbrena specifically. Strong contender in the meta as of release.
