# Wuthering Waves Combat DB — Index

Reference-only combat/theorycrafting data for the Team engine (`app/src/features/teams/calcEngine.js`). **Not wired into the app** — lives under `references/combat-db/` and does not touch `app/src/data/*.js`.

## Methodology

- **Primary source:** [Prydwen.gg](https://www.prydwen.gg/wuthering-waves/characters) character build guides (kit description, review, best weapons, echo sets, endgame stat targets, rotation, team synergies, tier-list placement badge).
- **Technique:** Prydwen (and other candidate sources) run Cloudflare bot-detection. Bypassed with `web_fetch(jsRender: true, waitUntil: "load", waitMs: 7000-13000, referer: "https://www.google.com/", userAgent: <Chrome desktop UA>, extractText: true)`.
- **Secondary sources:** attempted but not yet incorporated into character JSONs this pass — see `SOURCES_STATUS.md` for exactly what worked (Nanoka.cc — reachable via numeric character IDs, not slugs; Fandom wiki — reachable but very slow, 40s+ per page) and what wasn't tried (Encore.moe, wuwatracker.com, Reddit).
- **`communityNotes`** in each character JSON is synthesized from Prydwen's own Review/"Meta Position & Conclusion" sections (which already summarize community sentiment) rather than direct Reddit scraping in this pass.
- **Date scraped:** 2026-08-31 (all Prydwen pages carried a "Last updated: 20/August/2026" or similar in-page timestamp as of the scrape).

## Coverage

**60 of 60 characters documented** (`characters/<slug>.json`) with kit breakdown, build guide, teams, rotation, and community notes — 57 with full Prydwen-sourced depth, and 3 (Hsin, Jingran, Suoming) as intentionally partial stub entries because Prydwen had not yet published their kit/build content as of the 2026-08-31 scrape (their pages exist and confirm rarity/element/weapon, but every content section reads "aren't available yet"). See `SOURCES_STATUS.md` for details on those three and a note on re-scraping them later.

## Characters — Done (24)

| Character | Rarity | Element | Weapon | Role | Tier (ToA / WW) |
|---|---|---|---|---|---|
| Aalto | 4★ | Aero | Pistols | Sub DPS / Hybrid | T4 / T4 |
| Aemeath | 5★ | Fusion | Sword | Main DPS | T0 / T0.5 |
| Augusta | 5★ | Electro | Broadblade | Main DPS | T1 / T1 |
| Baizhi | 4★ | Glacio | Rectifier | Support/Healer | T3 / T4 |
| Brant | 5★ | Fusion | Sword | Sub DPS/Hybrid | T1.5 / T4 (DPS); T1.5/T2 (Hybrid) |
| Buling | 4★ | Electro | Rectifier | Support | T2 / T3 |
| Calcharo | 5★ | Electro | Broadblade | Main DPS | T4 / T4 |
| Camellya | 5★ | Havoc | Sword | Main DPS | T2 / T3 |
| Cantarella | 5★ | Havoc | Rectifier | Hybrid | T3 / T1.5 |
| Carlotta | 5★ | Glacio | Pistols | Main DPS | T1 / T4 |
| Cartethyia | 5★ | Aero | Sword | Main DPS | T0.5 / T1.5 |
| Changli | 5★ | Fusion | Sword | Hybrid/Sub DPS | T2 / T3 |
| Chisa | 5★ | Havoc | Broadblade | Support | T0 / T0 |
| Chixia | 4★ | Fusion | Pistols | Sub/Dual DPS | T4 / T4 |
| Ciaccona | 5★ | Aero | Pistols | Hybrid/flex Main DPS | T0.5 / T1 |
| Danjin | 4★ | Havoc | Sword | Hybrid/flex Main DPS | T3 / T3 |
| Denia | 5★ | Fusion | Rectifier | Hybrid | T0 / T0.5 |
| Encore | 5★ | Fusion | Rectifier | Main/Dual DPS | T2 / T4 |
| Jinhsi | 5★ | Spectro | Broadblade | Main DPS | T2 / T4 |
| Jiyan | 5★ | Aero | Broadblade | Main DPS | T1.5 / T1.5 |
| The Shorekeeper | 5★ | Spectro | Rectifier | Support/Healer | T0 / T0.5 |
| Verina | 5★ | Spectro | Rectifier | Support/Healer | T0.5 / T1 |
| Xiangli Yao | 5★ | Electro | Gauntlets | Main DPS | T3 / T4 |
| Yinlin | 5★ | Electro | Rectifier | Hybrid | T3 / T4 |

Full per-character detail (kit/skills, best weapons, echo sets, main-stat priority, teams, rotation, community notes) is in `characters/<slug>.json`.

## Characters — Done, second pass (33 full + 3 partial)

Scraped 2026-08-31, same Prydwen-page technique. Re-verified against the live Prydwen character index at the start of this pass — the 36-slug pending list from the previous pass matched exactly, no additions or removals.

| Character | Rarity | Element | Weapon | Role | Tier (ToA / WW) |
|---|---|---|---|---|---|
| Galbrena | 5★ | Fusion | Pistols | Main DPS | T1 / T1.5 |
| Hiyuki | 5★ | Glacio | Sword | Main DPS | T0 / T0.5 |
| Hsin | 5★ | Electro | Rectifier | *unpublished on Prydwen* | — |
| Iuno | 5★ | Aero | Gauntlets | Hybrid/Support/flex DPS | T0.5-T1 / T1.5-T4 |
| Jianxin | 5★ | Aero | Gauntlets | Hybrid/Support/flex DPS | T4 / T4 |
| Jingran | 5★ | Fusion | Broadblade | *unpublished on Prydwen* | — |
| Lingyang | 5★ | Glacio | Gauntlets | Main DPS | T3 / T4 |
| Lucilla | 5★ | Glacio | Rectifier | Hybrid/Support | T0 / T0 |
| Lucy | 5★ | Spectro | Pistols | Main DPS | T1 / T2 |
| Lumi | 4★ | Electro | Broadblade | Hybrid/flex DPS | T4 / T4 |
| Lupa | 5★ | Fusion | Broadblade | Hybrid/Support | T0.5 / T1 |
| Luuk Herssen | 5★ | Spectro | Gauntlets | Main DPS | T0 / T1.5 |
| Lynae | 5★ | Spectro | Pistols | Hybrid/Support | T0 / T1 |
| Mornye | 5★ | Fusion | Broadblade | Support/Healer | T0 / T1 |
| Mortefi | 4★ | Fusion | Pistols | Hybrid/Support | T1.5 / T2 |
| Phoebe | 5★ | Spectro | Rectifier | Main DPS (Absolution)/Hybrid (Confession) | T1.5-T2 / T3 |
| Phrolova | 5★ | Havoc | Rectifier | Main DPS | T0.5 / T0.5 |
| Qingxiao | 5★ | Aero | Sword | Main DPS | T0 / T1 |
| Qiuyuan | 5★ | Aero | Sword | Hybrid/Support | T0 / T0 |
| Rebecca | 5★ | Electro | Pistols | Hybrid | T0.5 / T1.5 |
| Roccia | 5★ | Havoc | Gauntlets | Hybrid | T3 / T3 |
| Rover (Aero) | 5★ | Aero | Sword | Support/Healer | T1 / T1.5 |
| Rover (Electro) | 5★ | Electro | Sword | Hybrid | T4 / T4 |
| Rover (Havoc) | 5★ | Havoc | Sword | Main DPS/flex Dual DPS | T3 / T4 |
| Rover (Spectro) | 5★ | Spectro | Sword | Hybrid/Support/Healer | T1.5 / T2 |
| Sanhua | 4★ | Glacio | Sword | Hybrid | T2 / T3 |
| Sigrika | 5★ | Aero | Gauntlets | Main DPS | T0 / T0 |
| Suisui | 5★ | Glacio | Rectifier | Support/Healer | T0 / T0.5 |
| Suoming | 5★ | Electro | Sword | *unpublished on Prydwen* | — |
| Taoqi | 4★ | Havoc | Broadblade | Hybrid | T4 / T4 |
| Yangyang | 4★ | Aero | Sword | Hybrid | T4 / T4 |
| Yangyang: Xuanling | 5★ | Havoc | Sword | Main DPS | T0 / T1 |
| Youhu | 4★ | Glacio | Gauntlets | Support/Healer | T4 / T4 |
| Yuanwu | 4★ | Electro | Gauntlets | Support | T4 / T4 |
| Zani | 5★ | Spectro | Gauntlets | Main DPS | T1.5 / T2 |
| Zhezhi | 5★ | Glacio | Rectifier | Hybrid | T3 / T4 |

**Hsin, Jingran, and Suoming are intentionally partial** — Prydwen's pages for them exist and confirm rarity/element/weapon type but every content section (Skills, Review, Build, Rotation, Synergies) reads "aren't available yet. They will be added soon!" as of the 2026-08-31 scrape. Their JSON files record this explicitly rather than fabricating kit data; re-scrape them in a follow-up pass once Prydwen publishes their guides.

## Follow-up priorities

1. Re-scrape Hsin, Jingran, and Suoming once Prydwen publishes their character guides (all three were still placeholder pages as of 2026-08-31).
2. Correct `sources.nanoka` across all 60 completed JSONs — Nanoka uses numeric character IDs, not name slugs (e.g. Jinhsi = `https://ww.nanoka.cc/character/1304`, not `/character/jinhsi`); a partial slug→ID map is in `SOURCES_STATUS.md`. None of the 60 files currently have this fixed.
3. Attempt Encore.moe, wuwatracker.com, and Reddit (r/Wuthering_Waves) per the original task brief — none were reached in either pass.
4. Now that all 60 characters are complete, the weapons/echoes/monsters scope explicitly excluded from this task (per task instructions) would be the natural next step before any of this is wired into `calcEngine.js`.
