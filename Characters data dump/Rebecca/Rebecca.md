# Rebecca — Prydwen.gg source dump (cleaned)

5★ Electro, Pistols, Hybrid (Heavy Attack DMG buffer with strong personal Basic Attack damage). Free
character who swaps between two self-buff states (Huntress/Guts) every Intro/Skill cast, builds toward a
Forte Heavy Attack via Fervor, then a big multi-stage Liberation (Mk. 31 HMG → BOOM! Fireworks!). Applies
the Hack mechanic (a Tune-Rupture-family Tune Break response). Real-life last update: review Patch 3.4,
calcs Patch 3.4, profile 20/August/2026.

## Kit

### Basic Attack — Mix-'n'-Match
Two full parallel movesets, one per Forte mode (Huntress/Guts) — see Forte Circuit for how she switches.

**Huntress mode:**
- **Basic Attack - Huntress**: up to 3 hits, Electro DMG.
- **Heavy Attack - Huntress**: hold Normal Attack, continuous fire, STA cost, Electro DMG, **considered
  Basic Attack DMG**. Holding then releasing (while not mid-Tactical-Dodge) casts Heavy Attack - Eat
  Lead!: Huntress.
- **Heavy Attack - Eat Lead!: Huntress**: Electro DMG.
- **Comin' in Hot! - Huntress**: mid-air somersault + land. Keep holding Normal Attack after to chain
  into Heavy Attack - Huntress without consuming STA.
- **Mid-air Plunging Attack - Huntress**: STA cost, Electro DMG.
- **Dodge Counter - Huntress**: post-Dodge Normal Attack, Electro DMG.
- **Tactical Dodge - Huntress**: press Dodge to attack while dodging, Electro DMG; extra Electro DMG on a
  successful Dodge. Castable (grounded) during Basic Attack-Huntress, Heavy Attack-Huntress, Heavy Attack
  - Eat Lead!-Huntress, Comin' in Hot!-Huntress, itself, Resonance Skill, or Intro Skill. Keep holding
  Normal Attack after to chain into Heavy Attack-Huntress without STA cost.

**Guts mode:**
- **Basic Attack - Guts**: up to 3 hits, Electro DMG. Casting Tactical Dodge-Guts doesn't reset this
  combo's cycle within a short window.
- **Heavy Attack - Guts**: STA cost, Electro DMG.
- **Mid-air Plunging Attack - Guts**: STA cost, Electro DMG.
- **Dodge Counter - Guts**: post-Dodge Normal Attack, Electro DMG.
- **Tactical Dodge - Guts**: press Dodge to attack while dodging, Electro DMG; extra Electro DMG on
  successful Dodge. Castable (grounded) during Basic Attack-Guts, itself, Resonance Skill, or Intro Skill.

**Multipliers (Lv.10):**
- Basic Attack-Huntress Stage 1: 36.76%+36.76%
- Basic Attack-Huntress Stage 2: 19.13%×4+19.13%
- Basic Attack-Huntress Stage 3: 109.85%
- Heavy Attack-Huntress: 16.90%+16.90%
- Heavy Attack-Eat Lead!-Huntress: 60.84%+60.84%
- Mid-air Attack-Huntress: 136.04%
- Dodge Counter-Huntress: 211.24%
- Tactical Dodge-Huntress: 16.90%×4+16.90%
- Tactical Dodge-Huntress Successful Dodge: 148.71%
- Basic Attack-Guts Stage 1: 61.69%+61.69%
- Basic Attack-Guts Stage 2: 84.50%
- Basic Attack-Guts Stage 3: 33.77%+33.77%+157.57%
- Heavy Attack-Guts: 202.79%
- Mid-air Attack-Guts: 104.78%
- Dodge Counter-Guts: 258.56%
- Tactical Dodge-Guts: 101.40%
- Tactical Dodge-Guts Successful Dodge: 148.71%
- STA costs: Heavy Attack-Huntress 20, Mid-air-Huntress 30, Tactical Dodge-Huntress 20, Heavy Attack-Guts
  20, Mid-air-Guts 30, Tactical Dodge-Guts 20.

### Resonance Skill — Tactical Tweaks
- **It's Big Boomin' Time!** (in Huntress): closes distance, sprays lead, switches to Guts, blasts the
  target, Electro DMG.
- **Come 'n' Get Me!** (in Guts): sprays lead, uses recoil to close distance, switches to Huntress,
  continues the barrage, Electro DMG. Pressing/holding Normal Attack shortly after near the ground chains
  into Comin' in Hot! - Huntress.

**Multipliers (Lv.10):** It's Big Boomin' Time!: 23.66%×4+35.49%×4. Come 'n' Get Me!: 23.66%+4.74%+
23.66%+23.66%+137.22%+11.83%+11.83%. Both cooldown 1s.

### Resonance Liberation — Party 'til Dawn!
Switching to **Mk. 31 HMG mode** generates a 9.5s Stagnation field: auto-fires the HMG (Electro DMG,
**considered Basic Attack DMG**), accumulating Overload; pressing/holding Normal Attack or Liberation at
intervals enhances firepower and speeds Overload gain (up to 2 enhancement triggers). Auto-locks onto the
enemy closest to the crosshair. Rebecca is immobile while firing, gains 50% DMG Reduction and
interruption immunity.

**Overload** (cap 90): standard-firepower hits grant 2, 1st-enhancement hits grant 4, 2nd-enhancement
hits grant 6.

**BOOM! Fireworks!**: auto-casts when Mk. 31 HMG mode ends OR Overload maxes out, Electro DMG, ends Mk.
31 HMG. Hold Liberation while in HMG mode to instantly cast it. Leaving HMG mode clears all Overload.

**Multipliers (Lv.10):** Mk. 31 HMG: 24.30% (standard) / 48.60% (1st enhancement) / 72.90% (2nd
enhancement). BOOM! Fireworks!: 63.62%+572.58%. Cooldown 25s; Resonance Cost 125; Concerto Regen 20.

### Forte Circuit — Gloves Are Comin' Off!
- **Switch Gears!**: casting Resonance Skill or Intro Skill freely switches between Huntress/Guts. Huntress
  mode: +30% Crit DMG. Guts mode: ignores 15% target DEF. Starts in Huntress by default.
- **Hack - Shifting**: inflicted on damage dealt via Intro Skill (either variant), Heavy Attack -
  Rat-tat-tat!: Huntress, Heavy Attack - Bang-bang-bang!: Guts, or Resonance Liberation - BOOM!
  Fireworks! — each specific skill can retrigger this once every 3s.
- **Hack Response - Meltdown**: Electro DMG to all targets in range affected by Hack - Interfered,
  considered Hack DMG.
- **Heavy Attack - Rat-tat-tat!: Huntress** (replaces Heavy Attack-Huntress at 120 Fervor): hold Normal
  Attack, consumes all Fervor, pulls in nearby targets, Electro DMG, **considered Basic Attack DMG**.
- **Heavy Attack - Bang-bang-bang!: Guts** (replaces Heavy Attack-Guts at 120 Fervor): same
  consume/pull/DMG-type rule.
- **Fervor** (cap 120): restored by Normal Attacks/Resonance Skill damaging the target; gaining "A Girl
  Gets What She Wants!" (via either Intro cast) also restores 50 flat.
- **Hot Hand** (cap 120): regenerates 10/s over time; casting either Forte Heavy Attack restores 40.
- **A Girl Gets What She Wants!**: at 120 Hot Hand, casting either Intro Skill OR either Resonance Skill
  grants, for 12s: BOTH Huntress's and Guts's Stat Bonuses simultaneously (regardless of current mode);
  Hot Hand can't regen during this window and drains 10/s instead.

**Multipliers (Lv.10):** Hack Response-Meltdown: 2358.89% Tune AMP. Rat-tat-tat!: Huntress:
19.89%+19.89%+19.89%+318.10%+19.89%. Bang-bang-bang!: Guts: 278.34%.

### Forte Circuit (2nd section) — Hack - Meltdown
When the target's Off-Tune Level is full, Rebecca can cast Tune Break on it. Inflicts Hack - Shifting and
responds to Hack - Interfered. **Responding to Hack - Interfered**: when ANY teammate deals Tune Break
DMG and inflicts Hack - Interfered, Rebecca triggers Hack - Meltdown on the target (once per target every
8s).

### Inherent Skills
- **Tag, You're It!**: ATK +10% for 12s when A Girl Gets What She Wants! triggers, OR when either Forte
  Heavy Attack is cast — stacks up to 2. Any teammate inflicting Hack - Shifting grants their own Tune
  Break Boost +30 for 30s.
- **Left an Opening!**: increased interruption resistance during either Forte Heavy Attack. Casting
  Party 'til Dawn! grants nearby team Resonators +20% ATK for 30s.

### Intro Skill — My Turn!
- **Yo, It's Big Boomin' Time!** (in Huntress): approaches, sprays lead with Huntress, switches to Guts,
  blasts the target, Electro DMG.
- **Hey, Leadhead, Come 'n' Get Me!** (in Guts): approaches via Guts recoil, switches to Huntress, sprays
  lead, Electro DMG. Normal Attack shortly after near the ground chains into Comin' in Hot! - Huntress.

**Multipliers (Lv.10):** Yo, It's Big Boomin' Time!: 27.04%×6+40.56%+67.60%. Hey, Leadhead, Come 'n' Get
Me!: 10.14%+30.42%+40.56%×4. Concerto Regen 10 (each).

### Outro Skill — Preem Choom
Summons a turret attacking for 14s (2.5% Electro DMG/hit). The incoming Resonator gains **Edgerunner
Bonds**: +15% All DMG Amplification for 14s, plus 1 stack of **Overlimit** every 0.2s (each +0.5% Heavy
Attack DMG Amplification, cap 35% — Lucy gets max stacks instantly when Edgerunner Bonds activates).
Switching off the incoming Resonator ends both early. (Note: Lucy specifically can enhance the turret —
+250% DMG Multiplier, duration cut to 4s — a Lucy-side interaction, not modeled on Rebecca's own kit.)

### Resonance Chain (S1-S6)
- **S1**: DMG Multipliers of Basic Attack-Huntress, Heavy Attack-Huntress, Tactical Dodge-Huntress, Dodge
  Counter-Huntress, Basic Attack-Guts, Tactical Dodge-Guts, AND Dodge Counter-Guts all +50%. When A Girl
  Gets What She Wants! triggers, gains 3 extra Street Smarts stacks (12s) — Tactical Dodge casts consume 1
  Street Smarts stack (if available) to restore 20 STA. BOOM! Fireworks! gains interruption immunity.
- **S2**: Casting either Intro Skill OR Party 'til Dawn! grants the WHOLE TEAM +20% All-Attribute DMG
  Bonus for 30s. Any teammate inflicting Hack - Shifting grants them +15% All DMG Amplification for 30s.
  Hot Hand regens 2× faster out of combat.
- **S3**: Party 'til Dawn! AND BOOM! Fireworks! both gain +60% DMG Multiplier. Party 'til Dawn! gains +30%
  explosion range. Casting either Intro Skill grants 120 flat Hot Hand.
- **S4**: +60% additional Stat Bonus from A Girl Gets What She Wants!'s effect (stacks on top of its base
  bonuses).
- **S5**: +20% Basic Attack DMG Bonus for 8s when inflicting Hack - Shifting.
- **S6**: Basic Attack DMG Bonus from EVERY source +40%. During either Forte Heavy Attack (Rat-tat-tat!/
  Bang-bang-bang!), deals an additional Electro DMG instance = 900% ATK, considered Basic Attack DMG.
  Restores 20 extra Hot Hand when casting either Forte Heavy Attack. On a fatal blow, doesn't go down —
  restores a fixed 2077 HP, up to 5 times immediately (once per 10 real-time minutes). Out of combat 4s+
  restores 120 flat Fervor (once per 4s).

### Minor Fortes (Total)
Crit Rate +8%, ATK% +12%.

### Base Stats (Lv.90, incl. minor fortes)
HP 11600 | ATK 400 | DEF 1173 | Max Energy 150 | Crit Rate 5% | Crit DMG 150% | Healing Bonus 0% |
Electro DMG Bonus 0%.

## Review

**Hybrid tier**: **T0.5** (ToA, standard) / **T1.5** (WW, standard) — **T0.5** (ToA, Value list) / **T1.5**
(WW, Value list).

**Pros**
- Doesn't need her Signature to perform; easy to build Echoes for (good Energy generation).
- Easy gameplay, benefits from Perfect Dodges — interruption rarely an issue.
- Multiple Echo sets all work similarly well on her — easy to gear.
- Fits many teams beyond her intended Lucy pairing; a slightly stronger-or-equal Mortefi alternative.
- Free character.

**Cons**
- Very long rotation vs. the average 2nd-slot buffer (~7.89s+) — deals more damage to compensate, but
  still extends team rotations noticeably.
- Good for free, but still free — won't shatter the meta; mainly a solid Heavy Attack alternative and
  only best-in-slot for an average DPS.
- Ultimate voiceline gets repetitive.

**Review summary**: Buffs Heavy Attack damage while dealing strong personal Basic Attack damage herself.
Swaps freely between two self-buff states — Huntress (+30% Crit DMG) and Guts (ignore 15% target DEF) —
on every Intro/Skill cast, always starting in Huntress. Real rotation: Guts generates most of her Forte
gauge, then the Forte Heavy Attack casts in Huntress mode before Outro — creating a loop since every
rotation begins Huntress → switches to Guts on Intro → back to Huntress via one Skill cast, leaving her
in Huntress at the start of the next rotation. Fervor (manual resource, built via Intro/Basic/Skill) caps
at 120 and unlocks her Forte Heavy Attack (big damage + Concerto). Hot Hand (auto-regenerating) at 120
unlocks "A Girl Gets What She Wants!" on an Intro/Skill cast — both mode bonuses simultaneously for 12s.
Her Ultimate (Party 'til Dawn! → Mk. 31 HMG → BOOM! Fireworks!) restores huge Concerto and deals major
damage across 3 escalating stages (15 total bullets, enhanced every 5th), finishing with a big blast
that's swap-cancellable in an optimized rotation; also grants the team +20% ATK. Her Outro amplifies All
DMG and summons a turret that progressively ramps Heavy Attack DMG Amplification on the on-field
character — up to 15% general + 35% Heavy Attack Amp combined at full uptime (instant for Lucy, full 14s
for anyone else). Also has the Hack mechanic — functionally identical to Tune Rupture (a Tune Break
response), just under a different name, boosting any teammate's Tune Break Skill cast damage when
Rebecca has applied it via several of her attacks. Best paired with Yangyang: Xuanling (the game's
highest Heavy-Attack damage dealer, on par with generalist top-tier Lynae as her buff target) and
naturally excels with Lucy specifically (mutual buffing via the shared Hack mechanic — Lucy can't detach
from Rebecca the way Rebecca can detach from Lucy). Also a strong generic buffer for Phoebe, Jiyan,
Augusta, Galbrena, or any other Heavy Attack-focused DPS — a "second Mortefi," slightly ahead of him in
most Heavy Attack teams (elemental matchup aside) especially once her Signature is acquired.

## Build

**Best Weapons** (calculated with Lucy + Spectral Trigger/Shadow of Shattered Dreams set + Reminiscence -
Nightmare: Adam Smasher, and Mornye + Discord/Halo of Starry Radiance set + Reactor Husk as teammates):
1. **Skull Thrasher (signature, R1)** — 100.00%. ATK+12%. Intro cast: +24% Basic Attack DMG Bonus (14s,
   self). Inflicting Hack - Shifting: +12% Basic Attack DMG Bonus (14s, self) AND +24% ATK to the WHOLE
   TEAM (30s), same-name non-stacking. Stats: ATK 500, Crit DMG 72%. Best by a wide margin — bigger
   party-wide ATK buff than the permanent Static Mist, plus stronger personal Basic/Crit DMG stats.
2. **Spectrum Blaster** — 86.00%. ATK+12%. Intro cast or Basic Attack hit: +36% Basic Attack DMG Bonus
   (4s, self). Inflicting Tune Rupture/Strain-Shifting during Basic Attacks: +8% team-wide All DMG (30s,
   up to 3 stacks) — Rebecca can't trigger this team buff herself (she applies Hack, not Tune Rupture),
   but the self-buff alone plus strong ATK/Crit Rate makes it a very strong alternative to her signature.
3. **Static Mist** — 93.30%. ER+12.8%. Outro cast: +10% ATK to the incoming Resonator (14s, 1 stack).
   Best permanent option when prioritizing team DPS — a strong, perfectly suitable alternative to her
   signature for any Pistols 2nd-slot buffer.
4. **Phasic Homogenizer** — 88.70%. ATK+12%. Any teammate's Tune Break skill cast grants +20%
   All-Attribute DMG Bonus (14s, self). Leans into personal damage over team DPS — a worthwhile trade-off
   in some contexts, close behind Static Mist.
5. **Woodland Aria** — 88.30%. ATK+12%. Simple ATK/Crit Rate stat-stick — no use of its Aero Erosion
   passive.
6. **The Last Dance** — 87.90%. ATK+12%. Simple ATK/Crit DMG stat-stick — barely benefits from its Skill
   DMG-related passive.
7. **Spectral Trigger** — 87.90%. ATK+12%. Simple ATK/Crit DMG stat-stick — no use of its Spectro/Heavy
   DMG-related passives.
8. **Lux & Umbra** — 80.60%. ATK+12%. Simple ATK/Crit DMG stat-stick — no use of its Heavy/Echo DMG
   passives.
9. **Solar Flame (R5, best 4★, Battle Pass)** — 79.10%. Some ATK/Crit Rate, falls behind 5-stars due to
   low Base ATK.
10. **Relativistic Jet (R5, Battle Pass)** — 79.00%. Trades some Crit for Energy on Skill cast.
11. **Pistols#26 (R5, best no-gacha option)** — best fully F2P-accessible option; upgrade to a 5-star as
    soon as possible.

**Best Echo Set**: **Moonlit Clouds** (100.00%). 2pc +10% Energy Regen. 5pc: Outro cast grants the next
Resonator +22.5% ATK (15s). Trades her own personal damage for stronger single-character buffing.
- Main Echo options: **Bell-Borne Geochelone** — +10% DMG Bonus (15s) + DMG reduction for up to 3 hits
  (runs out early if hit 3 times, so best used when NOT expecting to get hit) — ideal cast timing is
  right before her Ultimate (right after her Forte Heavy Attack) to swap-cancel while buffing her own,
  her Main DPS's, and her Support's rotations at once; best in non-Quickswap play. **Impermanence Heron**
  — more consistent in Quickswap specifically (+12% DMG Bonus to the incoming character via Outro, plus
  Energy restore on hit) but is a Transform Echo that must be cast BEFORE her rotation starts, restricting
  its use to Quickswap teams.

**Special Echo Set option**: **Shadow of Shattered Dreams** (1pc-effective set): inflicting Hack -
Shifting grants +35% Basic Attack DMG Bonus AND +35% Heavy Attack DMG Bonus (15s). Best blend of stats
for her OWN personal damage (sacrifices team buffing) — pair with a 2pc set of choice: **Void Thunder**
(recommended), Endless Resonance, Reel of Spliced Memories, Moonlit Clouds, Empyrean Anthem, or
Tidebreaking Courage.
- Main Echo: **Reminiscence - Nightmare: Adam Smasher** — the only real option for this set, grants an
  extra +15% Crit Rate to either Lucy or Rebecca.

**Alternative set (Lucy teams specifically)**: **Pact of Neonlight Leap** (Lynae's signature Echo set).
2pc +10% Spectro DMG. 5pc: Outro cast grants the incoming Resonator +15% ATK, PLUS +0.3% ATK per point of
Tune Break Boost (up to +15% more), 15s or until swapped out. A close contender to Moonlit Clouds in
Lucy's team specifically, though it can't also buff Rebecca's own/her Support's damage the way Bell-Borne
Geochelone can — not stronger overall, but usable if you already have the pieces and don't want to farm a
separate Moonlit Clouds set.
- Main Echo: **Hyvatia** — simple summon Echo, +10% DMG Bonus to the next character switched in via Outro.

**Best Echo Stats**: 4-cost Crit Rate/Crit DMG · 3-cost Electro DMG · 3-cost Electro DMG/ATK% · 1-cost
ATK%×2.
**Substat priority**: Energy Regen (until satisfied) > Crit Rate = Crit DMG > Basic ATK DMG% > ATK% > ATK.

**Best Endgame Stats (Lv.90)**: HP 16000+ | DEF 1150+ | ATK 2000-2300+ | Crit Rate 65-80%+ | Crit DMG
210-280%+ (before the Huntress-mode Crit DMG buff) | Energy Regen 117-118%+ (suitable across all Rebecca
teams) | Electro DMG Bonus 30-60%+.

**Skill Priority**: Forte Circuit > Resonance Liberation > Basic Attack > Intro Skill > Resonance Skill.
Basic/Intro/Skill matter substantially less than Forte/Liberation and can be kept lower to save
resources, though fully upgrading is worth considering late-game.

## Gameplay and Teams

**Damage profile** (1-target scenario): Basic ~37.9% · Skill (small slice) · Intro (small slice) · Hack a
major separate share (Basic 301,984 · Heavy 0 · Skill 20,774 · Liberation 0 · Intro 22,532 · Outro 0 ·
Echo 3,588 · Hack 213,091 — Hack alone is roughly as large as her whole non-Basic kit combined; total
across categories is 561,969, matching the S0 sequence-value DMG exactly).

**Rotation time**: 7.89s (1-target scenario, S0-S6 benchmark team).

**Opener Rotation** (first rotation only — spends slightly more time to bank extra Concerto Energy for
every following rotation): Intro: Huntress → Basic: Guts 1 → Basic: Guts 2 → Basic: Guts 3 → Skill
(switches to Huntress) → Basic: Huntress 1 → Basic: Huntress 2 (cancel endlag via Heavy) → Forte Heavy:
Huntress (cancel endlag via Ultimate) → Ultimate → Boom! Fireworks (casts automatically, swap-cancelled)
→ Outro. Costs ~1.03s more than the Loop Rotation but banks 10 Concerto Energy forward, netting a 0.4s
time save on THIS rotation and the FULL 1.43s save on every rotation after — always worth doing on the
opener.

**Loop Rotation** (every subsequent rotation, once the Opener's banked Concerto lets Boom! Fireworks
swap-cancel without extra attacks): Intro: Huntress → Basic: Guts 1 → Basic: Guts 2 → Basic: Guts 3 →
Skill (switches to Huntress) → Forte Heavy: Huntress (cancel endlag via Ultimate) → Ultimate → Boom!
Fireworks (auto-cast, swap-cancelled) → Outro.

Notes on real-game rotation mechanics:
- Echo timing: cancel out of her Forte Heavy Attack via her Ultimate (Bell-Borne Geochelone), OR use a
  Summon Echo (Adam Smasher) at any point in her rotation, OR Swap Cancel before the rotation starts
  (Moonlit Clouds/Impermanence Heron-style Transform Echoes).
- An experimental, not-yet-fully-explored optimization exists specifically in the Lucy+Mornye team: using
  Rebecca's Ultimate immediately at the start of the fight and running a "Double Intro" pattern on
  subsequent rotations (leaning on Intros for Fervor generation, forfeiting Mornye's own Intro in favor of
  her Basics/Heavy) — requires Quickswap, not confirmed optimal yet.

**Sequence value** (1-target scenario, S0-S6 benchmark team, S0 = 100% baseline):
- S0: 561,969 DMG / 71,225 DPS (100.00%)
- S1: 579,157 DMG / 73,403 DPS (103.06%)
- S2: 654,653 DMG / 82,972 DPS (116.49%)
- S3: 799,688 DMG / 101,354 DPS (142.30%)
- S4: 870,834 DMG / 110,371 DPS (154.96%)
- S5: 919,055 DMG / 116,483 DPS (163.54%)
- S6: 1,461,689 DMG / 185,258 DPS (260.10%) — by far her largest single sequence jump, from the new 900%
  ATK bonus hit on her Forte Heavy Attack plus the +40% universal Basic Attack DMG Bonus.

**Synergies**:
- **2nd slot (best)**: Yangyang: Xuanling — the game's single highest Heavy Attack damage dealer, making
  her Rebecca's best pairing, on par with generalist top-tier Lynae as a buff target. **Lucy** is her
  second-best pairing — mutual buffing through the shared Hack mechanic; unlike Rebecca (who can detach
  from Lucy just fine), Lucy specifically benefits enough from Rebecca that she can't easily detach from
  her.
- **Other strong Heavy Attack pairings**: Phoebe, Jiyan, Augusta, Galbrena — Rebecca functions as a
  "second Mortefi" for any of these, thanks to solid personal damage plus her Outro's Heavy Attack DMG
  Amplification.
- **3rd-slot generalist supports**: Mornye (ideal specifically alongside Lucy, maximizing Hack damage via
  Off-Tune Buildup Rate buffing), Shorekeeper (stronger alternative outside Lucy pairings, or in
  Whimpering Wastes where re-building Off-Tune on the same enemy rarely happens), Verina (reliable
  lower-buff alternative, always available on the permanent banner).

**Example Teams**:
1. **Best Team**: Yangyang: Xuanling + Rebecca + Suisui + Chisa.
2. **Edgerunners Team**: Lucy + Rebecca + Mornye + Shorekeeper/Verina — Shorekeeper likely stronger in
   Whimpering Wastes specifically, since re-building Off-Tune on the same enemy (Mornye's whole reason for
   inclusion) almost never happens there.
3. **Phoebe Team**: Phoebe + Rebecca + Rover: Spectro.
4. **Alternative Heavy Attack Teams**: Augusta/Jiyan/Galbrena + Rebecca + Shorekeeper/Mornye/Verina.
