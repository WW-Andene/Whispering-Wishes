# Phrolova — Prydwen.gg source dump (cleaned)

5★ Havoc, Rectifier, Main DPS. Half on-field/half off-field DPS: builds "Volatile Notes" via Basic
Attacks/Skill, unlocks Ultimate (Curtain Call / "Waltz of Forsaken Depths") which costs no Resonance
Energy and enters a 24s Maestro state where her partner Hecate fights alongside/instead of her,
attacking off-field. Real-life last update: review Patch 2.5, calcs Patch 3.0, profile 20/August/2026.

## Kit

### Basic Attack — Movement of Life and Death
- **Basic Attack**: up to 3 consecutive hits, Havoc DMG. Stage 3 enters **Reincarnate** state.
- **Heavy Attack**: consumes STA, Havoc DMG. Normal Attack shortly after chains into Basic Stage 2.
- **Scarlet Coda** (replaces Heavy Attack): Phrolova enters the **Compose** state every 25s. When she has
  6 Volatile Notes, is in Compose, and NOT in Resolving Chord, Heavy Attack is replaced by Scarlet Coda —
  consumes STA, Havoc DMG (considered Resonance Skill DMG), Stagnates and pulls in nearby targets. Each
  stack of Aftersound additionally increases this hit's DMG Multiplier. Counted as casting an Echo
  Skill. Sends Compose into cooldown and activates **Resolving Chord**.
- **Mid-air Attack**: STA cost, Plunging Attack, Havoc DMG.
- **Dodge Counter**: post-Dodge Normal Attack, Havoc DMG. Normal Attack shortly after chains into Basic
  Stage 3.

**Multipliers (Lv.10):**
- Stage 1: 53.45%×2
- Stage 2: 95.43%
- Stage 3: 32.69%×6
- Heavy Attack: 79.85%×2
- Scarlet Coda: 33.01%×2 + 12.38%×8 + 495.10% (+82.55% DMG Multiplier per Aftersound stack)
- Mid-air Attack: 127.24%
- Dodge Counter: 121.99%
- Scarlet Coda Concerto Regen 40; Heavy Attack STA cost 25; Scarlet Coda STA cost 25; Mid-air Attack STA
  cost 30.

### Resonance Skill — Whispers in a Fleeting Dream
Attacks the target, Havoc DMG. Sends Phrolova into Reincarnate.

**Multipliers (Lv.10):** 105.97%×2. Cooldown 12s. Concerto Regen 10.

### Resonance Liberation — Waltz of Forsaken Depths / Maestro
Phrolova's max Resonance Energy is 0; this skill costs none. Available only in the **Resolving Chord**
state (entered by casting Scarlet Coda). Casting it ends Resolving Chord and enters **Maestro** for 24s.

**Maestro**: +120% self ATK. Phrolova floats and commands Hecate to fight; Hecate shares her stats/
statuses, and Hecate's own damage counts as coming from Phrolova (Hecate's attacks don't remove the
target's Hazy Dream state). She plays her Volatile Notes in turn, each held 4s. While on-field during
Maestro she can cue Hecate: Basic Attack (Normal Attack — every 2nd cast is replaced by Enhanced Attack),
Dodge (Hecate dodges, takes no damage on a successful dodge), Reset (Jump), Curtain Call (Resonance
Liberation — ends Maestro). Any damage Hecate takes in this state also hits Phrolova. When Phrolova is
OFF-field during Maestro, Hecate takes no damage and auto-casts Basic Attack-Hecate; when ANY teammate
casts an Echo Skill, Hecate instead casts Enhanced Attack-Hecate (max 10 triggers total per Maestro,
Echoes of the same name trigger it only once). Switching back to Phrolova ends Maestro; ending Maestro
removes all Volatile Notes.

- **Basic Attack-Hecate**: up to 2 hits, Havoc DMG, counted as Echo Skill DMG.
- **Enhanced Attack-Hecate: Strings/Winds/Cadenza** (fires per whichever Volatile Note is currently
  playing): Havoc DMG, counted as Echo Skill DMG; Strings/Cadenza Stagnate, Winds/Cadenza pull in.
- **Curtain Call**: castable 5 ways (ending Maestro on-field without Intro, switching to Phrolova while
  Maestro is active off-field/switching-without-Intro cases, pressing Liberation in Maestro, or HOLDING
  Liberation in Resolving Chord) — Stagnates and deals Havoc DMG. In Resolving Chord, casting it instead
  removes all Volatile Notes and ends Resolving Chord without ever entering Maestro.

**Multipliers (Lv.10):**
- Basic Attack-Hecate Stage 1: 27.84%
- Basic Attack-Hecate Stage 2: 13.92%×2
- Enhanced Attack-Hecate: Strings: 104.38% + 243.55%
- Enhanced Attack-Hecate: Winds: 99.16% + 231.37%
- Enhanced Attack-Hecate: Cadenza: 104.38% + 243.55%
- Curtain Call: 465.22%
- Waltz of Forsaken Depths Concerto Regen 20; Duration 24s.

### Forte Circuit — Rhapsody of a New World
- **Basic Attack - Movement of Fate and Finality**: in Reincarnate, Normal Attack on the ground —
  Stagnates the target, Havoc DMG (considered Resonance Skill DMG), ends Reincarnate.
- **Resonance Skill - Murmurs in a Haunting Dream**: in Reincarnate, Resonance Skill on the ground —
  Havoc DMG (considered Resonance Skill DMG), ends Reincarnate.
- **Aftersound**: cap 24 stacks. When off-field, casting any of the 3 Enhanced Attack-Hecate variants
  grants 1 stack. All stacks removed every 30s while out of combat.
- **Volatile Note**: cap 6 (gaining a 7th shifts everything left, dropping the leftmost Strings/Winds
  note — Cadenza notes are never dropped this way). Basic Stage 3 or Movement of Fate and Finality grants
  1 Strings note; Skill or Murmurs in a Haunting Dream grants 1 Winds note; with Inherent Skill Accidental
  active, Suite of Quietus/Suite of Immortality/any Echo Skill grants 1 Cadenza note. No notes gained
  during Resolving Chord.

**Multipliers (Lv.10):**
- Movement of Fate and Finality: 37.88%×4 + 117.83%×3
- Murmurs in a Haunting Dream: 23.21%×4 + 46.41% + 324.82%

### Inherent Skills
- **Accidental**: casting an Echo Skill grants increased interruption resistance and -30% DMG taken for
  15s. After casting Suite of Quietus/Suite of Immortality/an Echo Skill, the next Volatile Note gained
  becomes a Cadenza note.
- **Octet**: gain 10 Aftersound stacks on entering battle (can't retrigger within 4s of leaving combat).
  Each Aftersound stack grants +2.5% Crit DMG. Once Aftersound is at its 24-stack cap, each ADDITIONAL
  stack instead grants +1% Crit DMG, up to +100% total — removed when Aftersound stacks are cleared.

### Intro Skill — Suite of Quietus / Suite of Immortality
- **Suite of Quietus** (base): attacks the target, Havoc DMG. Normal Attack shortly after chains into
  Basic Stage 3.
- **Suite of Immortality** (replaces Suite of Quietus while in Maestro state; cancelled if Curtain Call is
  cast first): Havoc DMG (considered Resonance Skill DMG), Stagnates the target. Normal Attack shortly
  after chains into Basic Stage 3.

**Multipliers (Lv.10):**
- Suite of Quietus: 80.61% + 120.91%
- Suite of Immortality: 596.43%
- Both: Concerto Regen 10.

### Outro Skill — Unfinished Piece
The incoming Resonator gains +20% Havoc DMG Amplification and +25% Heavy Attack DMG Amplification for
14s (or until swapped out). If Phrolova is in Maestro when casting this, Hecate additionally casts
Enhanced Attack-Hecate 2 more times when she's switched off-field, still within the same Maestro
duration.

### Resonance Chain (S1-S6)
- **S1**: DMG Multiplier of Movement of Fate and Finality +80%; DMG Multiplier of Murmurs in a Haunting
  Dream +80%. If Phrolova has fewer than 2 Volatile Notes while NOT in Maestro and stays out of combat
  for 4s, gains Volatile Note - Cadenza until she has at least 2.
- **S2**: DMG Multiplier of Scarlet Coda +75%; Aftersound now ALSO increases Scarlet Coda's DMG
  Multiplier, +75% additionally. Casting Scarlet Coda grants 14 Aftersound stacks.
- **S3**: Echo Skill DMG Amplified +80%. Casting Scarlet Coda converts all Volatile Notes to Cadenza
  notes in turn. Targets hit by Enhanced Attack-Hecate: Cadenza have ATK reduced -20% for 15s.
- **S4**: Casting an Echo Skill grants the WHOLE TEAM +20% Attribute DMG Bonus for 30s.
- **S5**: On entering Maestro, generates a field Stagnating nearby targets for 4s (removed early if
  Maestro ends or she swaps out before then). Damage taken during Maestro is reduced -30%.
- **S6**: DMG Multiplier of Enhanced Attack-Hecate +24%. During Movement of Fate and Finality AND Murmurs
  in a Haunting Dream, additionally commands Hecate to cast 1 **Apparition of Beyond-Hecate** — Havoc DMG
  equal to 216.42% of Phrolova's ATK (considered Echo Skill DMG), granting 8 Aftersound stacks on hit. If
  Phrolova is OFF-field during Maestro, targets take +40% more DMG from Hecate and Phrolova. If Phrolova
  is ON-field during Maestro, she instead gains +60% Havoc DMG Bonus.

### Minor Fortes (Total)
Crit Rate +8%, ATK% +12%.

### Base Stats (Lv.90, incl. minor fortes)
HP 10775 | ATK 438 | DEF 1137 | Max Energy 125 | Crit Rate 5% | Crit DMG 150% | Healing Bonus 0% |
Havoc DMG Bonus 0%.

## Review

**DPS tier**: **T0.5** (ToA, standard) / **T0.5** (WW, standard) — **T1** (ToA, Value list) / **T0** (WW,
Value list).

**Pros**
- Deals very high damage both on-field and off-field, giving her a constant presence in gameplay.
- No Resonance Energy requirement whatsoever for her Ultimate.
- Works as both a Main DPS and a SubDPS-style buffer for Heavy Attack DPS characters.
- Massive self-buffs to ATK and Crit — not as reliant on teammate buffs, reinforcing her SubDPS role.
- Heavy Crowd Control kit (Stagnate/pull-in) plus self interruption-resistance/damage-taken reduction.

**Cons**
- Weapon-dependent to an extreme degree: without her signature (Lethean Elegy) her damage falls off
  drastically — a "package deal" character.
- Her Echo set (Dream of the Lost) is only usable on her; her signature weapon isn't shared either
  (Stringmaster exists for that role) — building her is a fully dedicated investment.
- Aftersound stack ramp-up and Enhanced-Intro dependency make her FIRST rotation notably weaker than
  every subsequent one.
- Scales poorly off external ATK buffs — she already provides so much ATK herself (120% self-buff in
  Maestro) that additive ATK% buffs are diluted.

**Review summary**: Half on-field/half off-field Havoc Main DPS built around a "build 6 notes → Scarlet
Coda → Ultimate → Hecate fights off-field" core loop. Her Ultimate (Curtain Call/Waltz of Forsaken
Depths) costs 0 Resonance Energy but is gated behind Resolving Chord (itself gated behind Scarlet Coda,
which needs 6 Volatile Notes + the Compose state, auto-available every 25s) — so her real bottleneck is
note-building speed, not energy. Enhanced Intro (Suite of Immortality, only available after her first
Ultimate cast) is dramatically stronger than the base Intro, making her ideal position the FIRST
character in the team's rotation order. Off-field, Hecate attacks automatically and gets an Enhanced
Attack whenever ANY teammate casts an Echo Skill (up to 10 times per Maestro) — this is what gives her
strong synergy with Cantarella specifically (multiple Echo Skill casts). Signature weapon (Lethean
Elegy) is a categorical power spike due to the sheer stat quantity it provides (ATK, Crit Rate, ATK%,
Skill DMG Bonus, Echo Skill DMG Amp, DEF Ignore) — without it, she drops well behind other top-tier DPS
options including Camellya. Best team is Phrolova + Cantarella + Qiuyuan (Cantarella for Echo Skill
casts/Havoc-Skill Amplification, Qiuyuan for team-wide Echo Skill DMG buffing and his own Echo casts);
Roccia/Danjin/Shorekeeper/Havoc Rover are all solid alternate 3rd-slot picks. She can also function as a
Heavy Attack DMG amplifier for Yangyang: Xuanling/Galbrena/Phoebe/Jiyan while still dealing strong
personal damage of her own.

## Build

**Best Weapons** (calculated with Cantarella + Whispers of Sirens/Midnight Veil set, and Lorelei +
Qiuyuan + Emerald Sentence/Law of Harmony+Moonlit Clouds set + Bell-Borne Geochelone as teammates):
1. **Lethean Elegy (signature, R1)** — 100.00%. ATK+12%. Within 12s of dealing Echo Skill DMG: +32%
   Resonance Skill DMG Bonus, +32% Echo Skill DMG Amplification, ignore 8% target DEF. Stats: ATK 587,
   Crit Rate 24.3%. Massive power leap — she's balanced around having it; best by an alarming margin.
2. **Stringmaster** — 82.00%. DMG Bonus+12%. Resonance Skill DMG: ATK+12% (stacks ×2, 5s); off-field
   grants an ADDITIONAL +12% ATK. Stats: ATK 500, Crit Rate 36%. Great generic stats, somewhat diluted by
   her own already-huge ATK buffs.
3. **Whispers of Sirens** — 77.10%. ATK+12%. Echo Skill within 10s of Intro/Basic grants Gentle Dream
   stacks (max 2, 10s each; same-name Echoes trigger once): 1 stack = +40% Basic ATK DMG Bonus, 2 stacks
   = ignore 12% Havoc RES. Stats: ATK 500, Crit DMG 72%. Her Forte Heavy Attack (Scarlet Coda) counts as
   an Echo Skill cast, letting her partially benefit from the RES-shred, though only for a small slice of
   her rotation.
4. **Rime-Draped Sprouts** — 75.20%. ATK+12%. Simple ATK/Crit DMG stick, little use of its Basic ATK-
   focused passive.
5. **Luminous Hymn** — 72.40%. ATK+12%. Simple ATK/Crit Rate stick, little use of its Frazzle passive.
6. **Cosmic Ripples** (best permanent/non-Battle-Pass option) — 66.90%. ER+12.8%. Little use of its Basic
   ATK DMG passive.
7. **Radiant Dawn (R5, Battle Pass, best 4★)** — 64.90%. Crit DMG + ATK on Skill cast, decent fit.
8. **Augment (R5, Battle Pass)** — 64.10%. ATK on Liberation cast, diluted by her own 120% self-ATK buff.
9. **Fusion Accretion (R5)** — 63.60%. ATK/ATK% on Skill cast; flat Energy Regen wasted on her.
10. **Jinzhou Keeper (R5, F2P-accessible)** — no % listed; best fully free-to-obtain option.

**Best Echo Set**: **Dream of the Lost** (3pc, 100.00%): holding 0 Resonance Energy grants +20% Crit
Rate and +35% Echo Skill DMG Bonus — permanently active only on Phrolova (she has 0 max Energy). Best
combined with 2pc **Havoc Eclipse**/**Midnight Veil** (recommended), or 2pc **Endless Resonance**/**Reel
of Spliced Memories**, or 2pc **Frosty Resolve**.
- Main Echo option: **Nightmare: Hecate** — a Transform Echo, quick to cast (extends her rotation ~1s),
  grants +12% Havoc DMG Bonus and +20% Echo Skill DMG Bonus in the main slot.

**Best Echo Stats**: 4-cost Crit Rate/Crit DMG · 3-cost Havoc DMG · 3-cost Havoc DMG/ATK% · 1-cost ATK%
×2.
**Substat priority**: Crit Rate = Crit DMG > ATK% > Skill DMG% > ATK.

**Best Endgame Stats (Lv.90)**: HP 15000+ | DEF 1100+ | ATK 2000-2500+ | Crit Rate 60%+ (before Echo set
bonuses) | Crit DMG 215-260%+ (before any Aftersound stacks) | Energy Regen 100% (avoid ER substats
entirely — her Ultimate costs no Energy).

**Skill Priority**: Resonance Liberation > Basic Attack > Forte Circuit > Intro Skill > Resonance Skill.
Skill and Intro can be skipped when leveling to save resources at minimal damage loss.

## Gameplay and Teams

**Damage profile** (1-target scenario): Basic 6.1% · Skill 50% · Echo 43.9% (Basic 39,077 · Heavy 0 ·
Skill 279,425 · Liberation 0 · Intro 0 · Outro 0 · Echo 318,009).

**Opener Rotation** (no prior Ultimate/Enhanced Intro available — used when she's the FIRST character in
the team's rotation): switch in from any other character (skips Basic P1) → Basic P2 → Basic P3 → Forte:
Basic OR Forte: Skill → Skill: Whispers in a Fleeting Dream → Forte: Basic OR Forte: Skill → Basic P1 →
Basic P2 → Basic P3 → Forte: Basic OR Forte: Skill → Heavy: Scarlet Coda → Ultimate → Outro. (If
Shorekeeper is on the team, Phrolova becomes the 2nd character in rotation order instead, using a
weakened Intro version of this same rotation.)

**Loop Rotation** (Enhanced Intro available, her main recurring rotation): Intro: Suite of Immortality →
Basic P3 → Forte: Basic OR Forte: Skill → Skill: Whispers in a Fleeting Dream → Forte: Basic OR Forte:
Skill → Basic P1 → Basic P2 → Basic P3 → Forte: Basic OR Forte: Skill → Heavy: Scarlet Coda → Ultimate →
Outro.

**Rotation time**: 9.45s (1-target scenario, S0-S6 benchmark team).

Notes on real-game rotation adjustments:
- Against a boss: use Forte: Basic (Movement of Fate and Finality) for higher damage + Stagnate. Against
  multiple enemies: use Forte: Skill (Murmurs in a Haunting Dream) to group them.
- Echo cast timing (both rotations): right after her SECOND Forte Enhanced attack.
- Switching Phrolova in from any other character while in combat starts her at Basic P2, skipping P1.
- Her Enhanced Intro (Suite of Immortality) requires having cast her Ultimate previously and instantly
  ends the 24s Maestro timer rather than waiting it out — always preferred when available.
- Many animation-cancel points (Forte: Basic instantly, Forte: Skill when the portal opens, Basic P3 via
  Dash — the last trades some per-rotation damage for higher DPS, situational) and swap-cancel windows
  (every Forte: Basic/Forte: Skill, plus her Echo Skill cast) — but be mindful when paired with
  characters whose own Outro expires on swap (Danjin, Cantarella), which limits how freely these windows
  can be used.

**Sequence value** (1-target scenario, S0-S6 benchmark team, S0 = 100% baseline):
- S0: 1,237,454 DMG / 130,947 DPS (100.00%)
- S1: 1,373,222 DMG / 145,314 DPS (110.97%)
- S2: 1,670,025 DMG / 176,722 DPS (134.96%)
- S3: 2,069,591 DMG / 219,004 DPS (167.25%)
- S4: 2,236,596 DMG / 236,676 DPS (180.74%)
- S5: 2,236,596 DMG / 236,676 DPS (180.74%) — identical total to S4 in this solo-calc benchmark (S5's own
  effects don't add further to a single-character number the way they would in a real fight).
- S6: 3,372,550 DMG / 356,883 DPS (272.54%)

Sequence comments: **S2**'s value depends on how many rotations are executed over a fight (more rotations
= lower relative value, per the site's own Aftersound-averaging methodology). **S3**'s value depends on
how much of the fight includes Hecate active (weaker in her opener rotation, which doesn't have Hecate
yet) and how much other amplification is already stacked. **S6** similarly scales with fight length/
Hecate uptime.

With her signature weapon specifically (Lethean Elegy): S6 — 2,763,617 DMG / 219,631 DPS (287.4%); S5 —
1,817,187 DMG / 144,416 DPS (188.9%).

**Synergies**:
- **2nd slot (best to weakest)**: Lucilla (buffs team Echo DMG + high personal damage, best with Qiuyuan
  or as 3rd slot without him), Cantarella (own multiple Echo Skill casts + strong Outro buff to
  Phrolova's on-field damage), Sigrika (works well with Qiuyuan/Lucilla as a dual-DPS pairing), Lynae
  (general buffer, no extra Echo Skill casts).
- **3rd slot (best to weakest)**: Qiuyuan (multiple Echo Skill casts + team-wide Echo Skill DMG buff —
  best choice), Roccia (benefits fully from Phrolova's Outro, extra Echo Skill cast via Magic Box),
  Danjin (good Outro, short rotation, party-wide buffing at S6). Danjin/Roccia can also fill 2nd slot if
  Cantarella isn't available.
- **Heavy-Attack-DPS pairings**: Yangyang: Xuanling, Galbrena, Phoebe, Jiyan — Phrolova buffs their
  Havoc/Heavy Attack DMG via Outro while dealing strong off-field damage of her own; Yangyang: Xuanling
  makes the best use of this since her Outro also applies to her Havoc DMG specifically.
- **3rd-slot supports**: The Shorekeeper (best for ATK/Crit-scaling DPS, short rotation), Buling (Skill
  DMG buffs + more personal damage, higher rotation time, F2P), Verina (good buffs, one of the shortest
  rotation times, F2P).

**Example Teams**:
1. **Best Team**: Phrolova + Lucilla + Cantarella / Qiuyuan / Roccia / Shorekeeper / Danjin — Lucilla is
   best only in the 2nd slot paired with Qiuyuan as 3rd (not recommended with Shorekeeper); otherwise she
   pivots to 3rd slot alongside another Outro-buffing character.
2. **Alternative Teams**: Phrolova + Sigrika / Roccia / Danjin + Qiuyuan / Shorekeeper / Buling — only use
   Sigrika alongside Qiuyuan; Danjin+Roccia is a possible pairing where Roccia moves to 3rd slot.
3. **Dual DPS**: Yangyang: Xuanling + Galbrena + Jiyan + Phrolova + Suisui / Chisa / Shorekeeper — Suisui
   and Chisa are only best specifically with Yangyang: Xuanling on the team, otherwise prioritize
   Shorekeeper.
4. **Phoebe Dual DPS**: Phoebe + Phrolova + Rover: Spectro — same concept as the Jiyan pairing, with
   Spectro Rover as the support; one of Phoebe's best teams assuming Phrolova has her Signature weapon.
5. **F2P Team**: Phrolova + Danjin + Shorekeeper / Rover: Havoc / Buling.
