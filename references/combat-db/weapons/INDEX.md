# Weapons — Coverage Index

122 weapons have a structured `references/combat-db/weapons/<weapon-slug>.json` file (rarity, weapon type, main stat, base ATK at Lv.90, substat value at Lv.90, `bestFor` character list, source note). This exceeds the task brief's ~60 estimate because it includes every rarity tier present in the app's data model — 5★ signature/limited weapons, 4★ standard-banner weapons, 3★ "Voyager"/"Night" weapons, and 1-2★ Training/Tyro weapons — not just 5★ signatures.

## Completeness check against character files — PASSED

Cross-referenced every `buildGuide.bestWeapons` entry across all 60 `references/combat-db/characters/*.json` files against these 122 weapon names. **Every weapon named as BiS or an alt option resolves to a file here** — 0 unmatched entries.

## Provenance — read before trusting a number

Same caveat as `echoes/INDEX.md`: these entries were generated from `app/src/data/weapons.js`, **not** independently re-scraped from each weapon's own Prydwen page in this pass. `weapons.js`'s own in-file comments say its baseAtk/substat/passive values were re-verified against nanoka.cc's live weapon pages (Lv.90 stats) on 2026-08-14, with further corrections on 2026-08-18 — a real, cited source, but nanoka.cc rather than Prydwen, and via the app rather than a fresh fetch this session. Refinement (R1-R5) scaling values are **not** captured here at all — `weapons.js`'s `passive`/`desc` fields generally describe R1 (base) numbers only; R1-R5 scaling tables are a genuine gap, not present in the app's data model either.

## Open work for a follow-up pass

1. **R1-R5 refinement scaling** — not sourced anywhere yet (neither in the app nor here). This is the single biggest gap: every weapon file currently records only the R1 passive text/values pulled from `weapons.js`, with no R2-R5 progression. Needs a fresh Prydwen fetch per weapon (`https://www.prydwen.gg/wuthering-waves/weapons/<slug>`) to get the "MAX" — i.e. R5 — figures Prydwen's tables show alongside R1.
2. Independent Prydwen re-verification of base ATK/substat/passive text (currently nanoka-derived via the app, not fetched fresh from Prydwen this session).
3. `ascensionMaterials` fields exist in the app's raw data for many weapons but were not carried into these JSON files (out of scope for "weapons, echoes, monsters" per the task brief, which asked for name/rarity/type/base stat/passive/refinement/bestFor).
