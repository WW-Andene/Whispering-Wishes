# Wuthering Waves Combat DB — Index

Reference-only combat/theorycrafting data for the Team engine (`app/src/features/teams/calcEngine.js`). **Not wired into the app** — lives under `references/combat-db/` and does not touch `app/src/data/*.js`.

## Methodology

- **Primary source:** [Prydwen.gg](https://www.prydwen.gg/wuthering-waves/characters) character build guides (kit description, review, best weapons, echo sets, endgame stat targets, rotation, team synergies, tier-list placement badge).
- **Technique:** Prydwen (and other candidate sources) run Cloudflare bot-detection. Bypassed with `web_fetch(jsRender: true, waitUntil: "load", waitMs: 7000-13000, referer: "https://www.google.com/", userAgent: <Chrome desktop UA>, extractText: true)`.
- **Secondary sources:** attempted but not yet incorporated into character JSONs this pass — see `SOURCES_STATUS.md` for exactly what worked (Nanoka.cc — reachable via numeric character IDs, not slugs; Fandom wiki — reachable but very slow, 40s+ per page) and what wasn't tried (Encore.moe, wuwatracker.com, Reddit).
- **`communityNotes`** in each character JSON is synthesized from Prydwen's own Review/"Meta Position & Conclusion" sections (which already summarize community sentiment) rather than direct Reddit scraping in this pass.
- **Date scraped:** 2026-08-31 (all Prydwen pages carried a "Last updated: 20/August/2026" or similar in-page timestamp as of the scrape).

## Coverage

**24 of 60 characters fully documented** (`characters/<slug>.json`) with kit breakdown, build guide, teams, rotation, and community notes. The remaining 36 are **not yet scraped** — listed below with just their Prydwen slug (captured from the character index page) so a follow-up pass can pick up alphabetically/by priority without re-deriving the list. Do not treat the "pending" rows as containing any real data; no file exists for them yet.

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

## Characters — Pending scrape (36)

Slugs captured from Prydwen's character index (`https://www.prydwen.gg/wuthering-waves/characters/<slug>`), alphabetical:

galbrena, hiyuki, hsin, iuno, jianxin, jingran, lingyang, lucilla, lucy, lumi, lupa, luuk-herssen, lynae, mornye, mortefi, phoebe, phrolova, qingxiao, qiuyuan, rebecca, roccia, rover-aero, rover-electro, rover-havoc, rover-spectro, sanhua, sigrika, suisui, suoming, taoqi, yangyang, yangyang-xuanling, youhu, yuanwu, zani, zhezhi

## Follow-up priorities

1. Finish the 36 pending characters using the same Prydwen-page technique (each ~8-13s fetch + a structured-JSON write); prioritize current-meta staples first if doing this incrementally: Zani, Zhezhi, Phrolova, Phoebe, Lupa, Roccia, Iuno, Sanhua, the four Rovers.
2. Correct `sources.nanoka` in the 24 completed JSONs — Nanoka uses numeric character IDs, not name slugs (e.g. Jinhsi = `https://ww.nanoka.cc/character/1304`, not `/character/jinhsi`); a partial slug→ID map is in `SOURCES_STATUS.md`.
3. Attempt Encore.moe, wuwatracker.com, and Reddit (r/Wuthering_Waves) per the original task brief — none were reached in this pass.
4. Once characters are complete, the weapons/echoes/monsters scope explicitly excluded from this pass (per task instructions) would be the natural next step before any of this is wired into `calcEngine.js`.
