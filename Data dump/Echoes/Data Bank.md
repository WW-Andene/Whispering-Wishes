# Data Bank — Rank, Rates & Rules

Source: Wuthering Waves Wiki (Fandom), "Data Bank" page. Extracted from user-provided .mht 2026-09-06. Reward items (Astrite/Tuner/Sealed Tube grants per level-up) intentionally omitted — this file covers rank progression and drop-rate mechanics only.

## Core rule

Absorb Echoes to increase Data Bank level. The higher the level, the higher the **Base Drop Rate** of Echoes and the higher the max absorbable **Rarity** of Echoes. Leveling up also raises Max Stamina and the **Echo Cost Limit** for characters.

**Echoes do not cost Waveplate to obtain, except at Tacet Fields — one Tacet Field run costs 60 Waveplate.** Boss fights (the source of Overlord/Calamity-class Echoes) use a different resource, not Waveplate.

## Data Bank EXP per Echo Rank unlocked

Discovering a new Echo (via the Pangu Terminal, or unlocking a higher Rank of one already owned) grants Data Bank EXP. Unlocking a higher-Rank variant of an Echo also retroactively grants the EXP for any lower Rank of that same Echo not yet discovered.

| Echo Rank | Data Bank EXP obtained |
|---|---|
| 2★ | 10 |
| 3★ | 10 |
| 4★ | 15 |
| 5★ | 20 |

## Enhanced Drop Rate mechanic

Beyond the passive Base Drop Rate, the Terminal can spend extra computational power for a chance at a boosted drop:
- **Cost 4 Enhanced Drop Rate**: up to **15 enhanced absorptions per week**. Cooldown resets Monday 04:00 server time. Once depleted, Cost-4 drops revert to the Base Drop Rate for the current level until the weekly reset.
- **Cost 1 & 3 Enhanced Drop Rate**: up to **5 enhanced absorptions per week** (separate pool from the Cost-4 one, only unlocked at Data Bank Level 27+). Same Monday 04:00 reset.

## Data Bank Level table

Columns: EXP needed for next level · SOL3 (story) Phase required to unlock that level · Base Drop Rate (of getting an Echo drop at all) · Cost 4 Enhanced Drop Rate · Cost 1&3 Enhanced Drop Rate (only nonzero from Lv.27) · Echo Drop Rate by Rarity (conditional on a drop happening — 2★/3★/4★/5★ split) · Maximum Echo Cost Limit.

| Level | EXP for next Level | SOL3 Phase required | Base Drop Rate | Cost 4 Enhanced Drop Rate | Cost 1&3 Enhanced Drop Rate | 2★ | 3★ | 4★ | 5★ | Max Cost Limit |
|---|---|---|---|---|---|---|---|---|---|---|
| 0 | 30 | 1 | 6% | 20% | - | 100% | - | - | - | 8 |
| 1 | 30 | 1 | 10% | 20% | - | 100% | - | - | - | 8 |
| 2 | 60 | 1 | 10% | 20% | - | 100% | - | - | - | 10 |
| 3 | 100 | 1 | 10% | 40% | - | 100% | - | - | - | 10 |
| 4 | 120 | 1 | 15% | 40% | - | 100% | - | - | - | 10 |
| 5 | 140 | 1 | 15% | 40% | - | 70% | 30% | - | - | 10 |
| 6 | 160 | 1 | 15% | 40% | - | 50% | 50% | - | - | 10 |
| 7 | 160 | 1 | 15% | 40% | - | 20% | 80% | - | - | 10 |
| 8 | 180 | 3 | 15% | 40% | - | - | 70% | 30% | - | 10 |
| 9 | 180 | 3 | 15% | 40% | - | - | 70% | 30% | - | 12 |
| 10 | 180 | 3 | 20% | 40% | - | - | 70% | 30% | - | 12 |
| 11 | 180 | 3 | 20% | 40% | - | - | 50% | 50% | - | 12 |
| 12 | 180 | 3 | 20% | 50% | - | - | 50% | 50% | - | 12 |
| 13 | 180 | 3 | 20% | 50% | - | - | 25% | 75% | - | 12 |
| 14 | 200 | 3 | 20% | 60% | - | - | 25% | 75% | - | 12 |
| 15 | 200 | 4 | 20% | 60% | - | - | - | 70% | 30% | 12 |
| 16 | 200 | 4 | 20% | 80% | - | - | - | 70% | 30% | 12 |
| 17 | 200 | 4 | 20% | 80% | - | - | - | 50% | 50% | 12 |
| 18 | 220 | 4 | 20% | 90% | - | - | - | 50% | 50% | 12 |
| 19 | 250 | 5 | 20% | 90% | - | - | - | 20% | 80% | 12 |
| 20 | 350 | 5 | 20% | 100% | - | - | - | 20% | 80% | 12 |
| 21 | - | 5 | 20% | 100% | - | - | - | - | 100% | 12 |
| 22 | - | 5 | 20% | 100% | - | - | - | - | 100% | 12 |
| 23 | - | 5 | 20% | 100% | - | - | - | - | 100% | 12 |
| 24 | - | 5 | 20% | 100% | - | - | - | - | 100% | 12 |
| 25 | - | 5 | 20% | 100% | - | - | - | - | 100% | 12 |
| 26 | - | 5 | 20% | 100% | - | - | - | - | 100% | 12 |
| 27 | - | 5 | 20% | 100% | 100% | - | - | - | 100% | 12 |
| 28 | - | 5 | 20% | 100% | 100% | - | - | - | 100% | 12 |
| 29 | - | 5 | 20% | 100% | 100% | - | - | - | 100% | 12 |
| 30 (max) | - | 5 | 20% | 100% | 100% | - | - | - | 100% | 12 |

Notes:
- The "Echo Drop Rate by Rarity" columns are conditional on a drop already happening (Base or Enhanced) — they answer "given you got an Echo, what Rank is it," not "what's the chance of that Rank overall."
- Max Cost Limit caps at 12 starting Level 9 — this is the same "Echo Cost Limit" already referenced generically in `Data dump/Echoes/Probability.md`'s Classification section (max achievable at Data Bank Level 9, confirmed consistent between both sources).
- Data Bank max level has increased over patches: 20 (v1.0) → 21 (v1.1) → 24 (v2.0) → 25 (v2.2) → 26 (v2.5) → 30 (v3.0, current cap).

## Open question

Waiting on the user's "extended drop rate" spreadsheet for further detail beyond this table (e.g. per-domain or per-boss specifics). Format-agnostic — .xlsx or .csv both work fine to ingest directly.
