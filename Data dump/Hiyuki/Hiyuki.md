# Hiyuki — Prydwen.gg source dump (cleaned)

Source: prydwen.gg/wuthering-waves/characters/hiyuki
Last updated (per page): 20/August/2026 · Last review update: Patch 3.3 · Last major build/calcs update: Patch 3.5

5★ Glacio Sword, Main DPS. Dual-form (Present Self / Foreclaimed Self) Glacio Chafe/Liberation DPS.

---

## Kit

### Basic Attack — Flaming Sakura Blade Art

**Present Self (starting form):**
- **Basic Attack – Present Self**: up to 3 consecutive hits, Glacio DMG. Stage 3 applies 1 Glacio Chafe stack.
- **Heavy Attack – Frost Splinter: Present Self**: unlocks at 300 Dedication. Hold to fire 3 arrows (STA cost), Glacio DMG, **counted as Resonance Liberation DMG**, interrupt-immune throughout. Last arrow consumes all 300 Dedication and unlocks Foreclaiming: Inward Vision. Applies 1 Glacio Chafe stack on hit.
- **Mid-air Attack – Present Self**: STA cost, plunging attack, Glacio DMG.
- **Dodge Counter – Present Self**: Normal Attack after a successful Dodge, Glacio DMG. Chains into Basic Stage 3.

**Foreclaimed Self (entered via Foreclaiming: Inward Vision):**
- **Basic Attack – Foreclaimed Self**: replaces the Present Self version. Up to 5 consecutive hits, Glacio DMG, **counted as Resonance Liberation DMG**. Stages 3/4/5 each apply 1 Glacio Chafe stack.
- **Heavy Attack – Foreclaimed Self**: hold to enter Hold Breath (continuous STA drain); release or STA-depletion triggers a forward thrust, Glacio DMG, **counted as Resonance Liberation DMG**. If hit during the thrust: neutralizes that damage instance, Stagnates nearby targets, and grants a period of interrupt immunity + 100% incoming DMG reduction.
- **Heavy Attack – Bitterfrost: Foreclaimed Self**: replaces the above at full Whiteout Bitterfrost. Hold, consumes STA + 3 Whiteout Bitterfrost stacks, grants 1 Snowforged Blade, Glacio DMG, **counted as Resonance Liberation DMG**, applies 1 Glacio Chafe stack. Lands first if airborne.
- **Mid-air Attack – Foreclaimed Self**: replaces the Present Self version. Up to 3 hits (STA cost each), Glacio DMG, **counted as Resonance Liberation DMG**. Stage 3 is a plunge. Stages 2/3 apply 1 Glacio Chafe stack each.
- **Dodge Counter – Foreclaimed Self**: replaces the Present Self version. Normal Attack after a Dodge, Glacio DMG, **counted as Resonance Liberation DMG**. Chains into Basic Stage 3.

**Multipliers (Lv.10):**
| Move | Value |
|---|---|
| Basic ATK (Present) Stage 1 | 37.72% + 37.72% |
| Basic ATK (Present) Stage 2 | 90.25% |
| Basic ATK (Present) Stage 3 | 4.92%×5 + 98.37% |
| Heavy ATK: Frost Splinter (Present) | 79.31%×2 + 158.61% |
| Mid-air Attack (Present) | 128.18% |
| Dodge Counter (Present) | 173.75% |
| Basic ATK (Foreclaimed) Stage 1 | 49.27% |
| Basic ATK (Foreclaimed) Stage 2 | 40.02% + 40.02% |
| Basic ATK (Foreclaimed) Stage 3 | 25.16%×4 + 67.08% |
| Basic ATK (Foreclaimed) Stage 4 | 29.93%×5 |
| Basic ATK (Foreclaimed) Stage 5 | 12.17% + 109.47% |
| Heavy ATK (Foreclaimed) | 107.16% |
| Heavy ATK: Bitterfrost (Foreclaimed) | 15.41%×8 + 493.05% |
| Mid-air Attack (Foreclaimed) Stage 1 | 28.83% + 28.83% + 38.43% |
| Mid-air Attack (Foreclaimed) Stage 2 | 26.09%×4 |
| Mid-air Plunge (Foreclaimed) | 111.60% |
| Dodge Counter (Foreclaimed) | 81.77% + 81.77% |

### Resonance Skill — Frostblight

- **Present Self**: Resonance Skill deals Glacio DMG. Enhances the next Basic Stage 3 (restores 100 Dedication on cast, ends on swap-out). Chains into Basic Stage 3 (or holds into it below 300 Dedication).
- **Foreclaimed Self** (replaces the above with two skills sharing one cooldown):
  - **Frostblight: Jade Cleave** (grounded): pulls in nearby targets, Glacio DMG, removes their Frostbind.
  - **Frostblight: Petalfall** (mid-air): same, pulls in targets, Glacio DMG, removes Frostbind.

**Multipliers (Lv.10):**
| Move | Value |
|---|---|
| Resonance Skill (Present Self) | 24.50%×4 + 97.98% |
| Frostblight: Jade Cleave | 66.01%×4 |
| Frostblight: Petalfall | 64.02%×4 + 64.02% |
| Present Self Skill cooldown | 20s |
| Jade Cleave/Petalfall cooldown | 12s (shared) |

### Resonance Liberation — Foreclaiming

- **Foreclaiming: Inward Vision**: available (as Liberation button) after casting Frost Splinter (Present Self, from 300 Dedication). Glacio DMG. Grants 3 Frostharden Iai; consumes 300 Dedication + Frostheart; enters Foreclaimed Self and restores 50 Frostheart. Applies 4 Glacio Chafe stacks. Costs no Resonance Energy.
- **Foreclaiming: Blade Liberation** (Foreclaimed Self only): press-release consumes all 3 Snowforged Blade stacks if present (else none consumed); OR hold to charge, consuming 1 Snowforged Blade periodically, auto-casts on release/depletion/timeout. Glacio DMG — **each Snowforged Blade point consumed increases this hit's DMG Multiplier**. Consumes 300 Dedication + Frostheart, ends Foreclaimed Self.

**Multipliers (Lv.10):**
| Move | Value |
|---|---|
| Foreclaiming: Inward Vision | 397.62% |
| Foreclaiming: Blade Liberation base | 198.81% + 795.24% |
| Blade Liberation DMG increase per Snowforged Blade | +795.24% (total, across all 3 stacks) |
| Inward Vision cooldown | 25s |
| Blade Liberation cooldown | 25s |
| Blade Liberation Resonance cost | 125 |
| Concerto Regen (either) | 20 |

### Forte Circuit — Everfrost Dominion

- **Glacio Bite**: while Hiyuki is in the team, Glacio Chafe inflicted by ANY nearby team member converts to **Glacio Bite** (a distinct proc — each new Glacio Bite stack triggers a Glacio Bite DMG instance scaled to the target's current stack limit; can apply even to frozen targets). Glacio Bite is itself also counted as Glacio Chafe (and its damage as Glacio Chafe DMG). Foreclaiming: Inward Vision or Basic Attack - Iai hitting a target with ≥10 Glacio Chafe stacks consumes 10 stacks to trigger Frostbind. Hiyuki joining the team clears existing Glacio Chafe; her leaving clears all Glacio Bite stacks unless another Glacio-Chafe-converting ally remains.
- **Present Self** / **Foreclaimed Self**: her two forms (see Basic/Heavy/Mid-air/Dodge sections above).
- **Iai Stance**: at ≥100 Frostheart, certain actions (Dodge after most Foreclaimed-Self normal attacks, or holding Skill after Jade Cleave/Petalfall) flash her backward (or behind a valid target) at STA cost, entering Iai Stance (resets mid-air Dodge charges; ends on swap-out).
  - **Basic Attack – Iai**: within a window after entering Iai Stance, Normal Attack consumes 100 Frostheart, Glacio DMG, **counted as Resonance Liberation DMG**. Re-castable while Frostheart stays ≥100. If hit mid-cast: neutralizes that damage + interrupt immunity + 100% DMG reduction for a period. Each cast consuming a Frostharden Iai stack (if any) inflicts 3 Glacio Chafe stacks and grants 1 Whiteout Bitterfrost.
- **Dedication** (cap 300): Present Self — Basic Stage 3 restores 100; Skill enhances the next Stage 3 to restore another 100 (ends on swap-out).
- **Frostheart** (cap 300): restored by Jade Cleave/Petalfall, or by any Foreclaimed-Self normal attack (except Bitterfrost) landing.
- **Frostharden Iai** (cap 3): +3 from casting Inward Vision.
- **Whiteout Bitterfrost** (cap 3): +1 each time Frostharden Iai is consumed via Iai.
- **Snowforged Blade** (cap 3): +1 per Bitterfrost Heavy ATK cast.

**Multiplier (Lv.10):** Basic Attack - Iai: **283.82% + 47.31%×4**. Iai Stance STA cost: 20.

### Forte "Tune Break: Sword"
At full Off-Tune Level, cast Tune Break — chains into Basic Stage 3 (either form).

### Inherent Skills

- **Fine Snow**: a teammate applying Glacio Chafe OR Havoc Bane grants 1 **Snow Rust** stack (cap 3, each ally triggers it once). Tiers: 1 stack — Glacio Bite DMG +30% (while she's active/nearby) + her own Crit DMG +40%; 2 stacks — each Glacio Chafe application she inflicts also deals a flat +102% Glacio Bite DMG instance; 3 stacks — Glacio Bite DMG taken by nearby targets +30% more (stacks with tier 1's +30%). Resets on team roster change.
- **Ephemeral Realm**: after 4s out of combat (post-fight or post-knockout) with <1 Snowforged Blade, restore 1.

### Intro Skill — Frostedge
Glacio DMG, **counted as Resonance Liberation DMG**, applies 1 Glacio Chafe stack. In Present Self: restores 200 Dedication, chains into Foreclaimed-Self Basic Stage 3. In Foreclaimed Self: chains into Basic Stage 2.
**Multiplier (Lv.10):** 156.15%. Concerto Regen: 10.

### Outro Skill — Snowlight Blessing
Glacio DMG dealt by nearby team members OTHER than Hiyuki is Amplified +20% against Glacio-Chafe-affected targets, for 20s.

### Resonance Chain (Sequences)

- **S1**: Foreclaimed-Self Basic/Heavy/Mid-air/Plunge/Dodge Counter DMG Multipliers +120%. Foreclaimed Basic Stage 3 gains extended range + pull-in; interrupt immunity during Stage 4/5. Casting Inward Vision enhances the next Foreclaimed Basic Stage 1/2 to also inflict 1 Glacio Chafe stack.
- **S2**: Basic Attack - Iai's DMG Multiplier +125%. Replaces Ephemeral Realm: after 4s out of combat post-fight/knockout, restore 3 Snowforged Blade AND (separately) restore 3 Frostharden Iai + reset 2 charges of Jade Cleave's cooldown + the next 2 Jade Cleave/Petalfall casts restore +50 extra Frostheart each.
- **S3**: Fine Snow gains: every 2s after a new teammate joins or Hiyuki revives, +1 Snow Rust (max 1 stack via this specific trigger). Frost Splinter (Present)/Bitterfrost (Foreclaimed) Heavy ATK DMG Multipliers +160%. At 2 Snow Rust stacks, while active: her Glacio Bite proc DMG Multiplier +488%.
- **S4**: Casting Present-Self Skill, Jade Cleave, or Petalfall grants all nearby team members +20% DMG dealt for 30s. Also restores 18% Max HP on Jade Cleave/Petalfall cast.
- **S5**: Present-Self Skill, Jade Cleave, and Petalfall DMG Multipliers +80%.
- **S6**: Foreclaiming: Inward Vision and Blade Liberation Crit DMG +500%. At 2 Snow Rust: the "each Glacio Chafe SHE applies also procs Glacio Bite" effect extends to "each Glacio Chafe ANY team member applies also procs Glacio Bite" (while she's active). At 2 Snow Rust: her own Crit DMG +40% (separate from S3's DMG-mult bonus). At 3 Snow Rust: total Glacio Bite DMG taken by nearby targets +25% more.

### Minor Fortes
Crit Rate +8%, ATK% +12%.

### Base Stats (Lv.90, incl. minor fortes)
HP 10300 · ATK 463 · DEF 1112 · Max Energy 125 · Crit Rate 5% · Crit DMG 150%

*(Upgrade material info not yet listed on this source page.)*

---

## Review

**DPS tier**: **T0** (Tower of Adversity, standard list) / **T0.5** (Whimpering Wastes, standard list) — but **T1 / T1** on the Value Tier List (both).

**Pros**
- The best Glacio DPS by a huge margin, in her best team (essentially no competition since Carlotta).
- Good multi-wave AoE capability (big hits + grouping) despite being a Negative-Status-focused character.
- Long animations either pause game timers or grant invulnerability — no real vulnerability windows.

**Cons**
- Very few good teammate alternatives — Lucilla/Lynae and Chisa are huge, largely irreplaceable power-ups (Chisa swappable for Mornye only if Lynae is present). Not a particularly F2P-friendly pickup.

**Key mechanics**
- Forte flow: build **Dedication** (Intro + Basic 3) → cast the Frost Splinter Heavy ATK → enter Ultimate stance (Foreclaimed Self via Inward Vision) → build **Frostheart** (2 Skills + a full Basic chain) → cast **Iai** after a Dodge → convert Forte into 3 Whiteout Bitterfrost → cast the special (Bitterfrost) Heavy ATK → empower and auto-cast her 2nd Ultimate (Blade Liberation) with another Heavy ATK.
- Applies Glacio Chafe extensively (~20 stacks/rotation across Intro/Basic/Heavy/Liberation/Iai — more than the 10-stack cap on her own), but **converts all Glacio Chafe (from herself or allies) into Glacio Bite** — a distinct, much-harder-hitting Negative Status (stuns 2s instead of freezing, genuinely still counted as Glacio Chafe/Chafe DMG).
- **Fine Snow** (Inherent Skill, up to 3 Snow Rust stacks — 1 per teammate applying Glacio Chafe/Havoc Bane, max once each) is the core team-building driver: she gets 1 stack alone, needs allies (Chisa/Lucilla) for 2-3. The 2nd stack is the single biggest damage jump (Glacio Bite DMG "skyrockets"); the 3rd is comparatively minor.

**Meta position**: extremely strong but team-restricted. Contrasted with Aemeath (a similar-ceiling Liberation-Sword DPS) — Hiyuki needs a genuinely full, specific team to hit her real ceiling, while Aemeath is far more flexible. Both share the general "Liberation Sword DPS" problem of lacking F2P-accessible buffers (Jianxin being the only one, and a subpar choice).

---

## Build

### Best Weapons (buffs assumed: Lucilla + Chisa team, per Prydwen's own calc note)
| Weapon | Score |
|---|---|
| Frostburn (R1, signature) | 100.00% |
| Blazing Brilliance (R1) | 80.80% |
| Emerald of Genesis (R1) | 80.10% |
| Emerald Sentence (R1) | 79.20% |
| Red Spring (R1) | 79.00% |
| Everbright Polestar (R1) | 78.80% |
| Feather Edge (R5, 4★, Battle Pass) | 76.90% |
| Fables of Wisdom (R5, 4★, F2P/no-gacha) | 71.80% |

**Signature (Frostburn)**: +12% ATK; on inflicting Glacio Chafe, +28% Glacio DMG Amp and Liberation DMG ignores 10% target DEF; while active, nearby Glacio Chafe DMG taken +20% for 6s (0.1s trigger cap, strongest instance only) — large, hers-alone stat gains, clear best-in-slot.

### Best Echo Set
**Wishes of Quiet Snowfall** (100%) — 2pc: +10% Glacio DMG. 5pc: inflicting Glacio Chafe grants +10% Glacio DMG for 15s; also grants "Snowfall" (15s, 25s internal cooldown) — while active, dealing Liberation DMG consumes Snowfall for +25% Crit Rate (6s), or extends Snowfall's duration by 4s (0.5s trigger cap, up to 6 times); casting Outro instead consumes Snowfall to grant the incoming ally +25% Glacio DMG for 15s (only one of these end-effects triggers per consumption). "The best choice bar none due to its very high stat gains for Hiyuki specifically" — up to +25% Crit Rate on top of +20% total Glacio DMG.

**Main echo**: **Reminiscence: Threnodian - Voidborne Construct** — simple Summon, +12% Glacio DMG + 12% Liberation DMG Bonus in the main slot.

**Best Echo Stats**: 4-cost Crit Rate/Crit DMG · 3-cost Glacio DMG · 3-cost Glacio DMG ≥ ATK% (near-interchangeable with her signature) · 1-cost ATK% ×2.
**Substat priority**: Energy Regen (until satisfied) > Crit DMG = Crit Rate (until 75%) > ATK% > Liberation DMG% > ATK.

### Endgame Stat Targets (Lv.90)
HP 15000+ · DEF 1150+ · ATK 1800–2200+ · Crit Rate 65%+ (before set) · Crit DMG 210–260%+ · Energy Regen 120% · Glacio DMG% 40–70%+.

### Skill Priority
Liberation > Basic Attack > Forte Circuit > Resonance Skill > Intro Skill (Intro skippable for minimal loss; Skill semi-skippable but worth investing if resources allow).

---

## Gameplay & Teams

### Standard Rotation
Echo: usable at any point (simple Summon).
Intro → Basic 3 → Heavy: Frost Splinter (cancel via Liberation asap) → Liberation: Inward Vision → Basic (Foreclaimed) 1 → 2 → 3 (cancel via Skill) → Skill: Jade Cleave → Skill: Petalfall → Basic (Foreclaimed) 1 → 2 → 3 (cancel via Dodge) → Dodge (enter Iai Stance) → Basic: Iai ×3 → Heavy: Bitterfrost → hold Liberation: Blade Liberation → Skill (swap) → Outro.

The Skill cast right before Outro is optional — skip it if it costs too much time before swapping (given sufficient Energy Regen), or save it for later (cast Basic 3 before Intro next time, then go straight into Frost Splinter once Intro lands).

**Ultimate stack management**: her 2nd Ultimate accumulates charge stacks (up to 3, gaining 2 in a single rotation on the opener, 1 per rotation after) — tapping (instead of holding) Blade Liberation consumes stacks progressively rather than all at once, letting you bank power for a weaker next-wave enemy in multi-wave content (each stack meaningfully empowers the hit).

Her Tune Break Skill chains directly into Foreclaimed-Self Basic Stage 3; pre-Intro Forte buildup for extra Iai casts per rotation is possible but restricted to advanced quickswap.

### Synergies

**Lucilla / Lynae** — "Best and only competitive buffers for Hiyuki. Lucilla leans a lot into Hiyuki's Glacio Chafe DMG, while Lynae will have Hiyuki doing bigger numbers on her Ultimates due to her higher raw Liberation DMG buffing. Overall, Lucilla wins out because she can stack up Hiyuki's passive that requires allies to apply Glacio Chafe/Havoc Bane, fully leans into the Glacio Chafe archetype and has an easy rotation. Lynae is a bit worse due to no Glacio Chafe synergy, but still has strong enough general buffs that she remains one of the top picks for the Hiyuki team's 2nd slot."

**Suisui / Chisa / Mornye / Verina** — "These are the Support choices Hiyuki has ranked in order. Anyone other than Suisui, Chisa and Mornye (with Lynae specifically for the latter) will experience significant drop-offs in performance. This is because Suisui's and Chisa's abilities to apply Glacio Chafe and Havoc Bane respectively make them synergize with Hiyuki's passive, giving Hiyuki the ability to deal a ton of additional Glacio Bite DMG. Mornye on the other hand has a synergy with Lynae more than Hiyuki, but she has very general buffs that Hiyuki can exploit too; Verina serves as an alternative option if neither are available."

**Yinlin / Zhezhi / Changli / Jianxin** — "These are potential 'last resort' buffing/secondary damage dealing options for Hiyuki if Lynae isn't available. Due to lower overall buffs, or an excessive rotation time, or simply lower overall personal damage, these Support options can work for Hiyuki, but Chisa is strongly recommended to back her up as a Support if you want to use any of these with her."

### Example Teams
- **Best Team**: Hiyuki + **{Lucilla / Lynae}** + **{Suisui / Chisa / Mornye / Verina}**. Only pair Mornye with Lynae specifically (unless no better option is available).
- **Alternative Team**: Hiyuki + **{Yinlin / Zhezhi / Changli / Jianxin}** + Suisui/Chisa. "Other Support options listed above are possible ... but will provide very subpar results. Not recommended, try to get Suisui or Chisa for a strong backing."

---

## Calculations

### Real Damage-Type Breakdown (Prydwen's own simulated rotation, S0, buffed team: Lucilla+Chisa)
| Type | DMG | Share |
|---|---|---|
| Basic ATK | 0 | 0% |
| Heavy ATK | 0 | 0% |
| **Skill** | 88,174 | **6.1%** |
| **Liberation** | 880,054 | **60.8%** |
| Intro | 0 | 0% |
| Outro | 0 | 0% |
| Echo | 39,937 | 2.8% |
| **Glacio Bite** | 438,900 | **30.3%** |

Liberation dominates (60.8%) — consistent with her kit text: nearly every Foreclaimed-Self attack (Basic, Heavy, Mid-air, Dodge Counter, plus both Foreclaiming skills and Basic-Iai) is explicitly "counted as Resonance Liberation DMG." **Glacio Bite** is a distinct proc/status damage type (30.3%), not tied to a specific button. Basic ATK, Heavy ATK, Intro, and Outro are all a genuine 0% in this run — every one of her nominal Basic/Heavy/Intro casts in the real rotation happens while in Foreclaimed Self, where they're all reclassified to Liberation.

### Damage Output by Sequence (S0→S6, 1-target, solo — no team/buff contribution)
Rotation time: 10.5s. Build: Frostburn R1, 5pc Wishes of Quiet Snowfall, Reminiscence: Threnodian - Voidborne Construct main echo (Crit DMG / Glacio DMG ×2 / ATK% ×2).

| Sequence | DMG | DPS | Relative % |
|---|---|---|---|
| S0 | 1,409,738 | 134,260 | 100.00% |
| S1 | 1,610,815 | 153,410 | 114.26% |
| S2 | 1,906,392 | 181,561 | 135.23% |
| S3 | 2,588,779 | 246,550 | 183.64% |
| S4 | 2,713,881 | 258,464 | 192.51% |
| S5 | 2,816,701 | 268,257 | 199.80% |
| S6 | 3,680,972 | 350,568 | 261.11% |

Unlike Augusta/Aemeath, every sequence here produces a DISTINCT DMG/DPS value — no S(n)==S(n+1) flat pair, consistent with every one of her chain nodes (S1-S6) having a real, stated DMG-relevant effect per the Kit tab (no "shield"/"revive"/pure-utility node like Augusta's or Aemeath's S5).
