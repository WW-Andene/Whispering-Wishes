# Source Access Status — Combat DB

Scrape session: 2026-08-31. Anti-bot technique used per task instructions: `jsRender: true`, `waitUntil: "load"`, `waitMs: 7000-13000`, `referer: "https://www.google.com/"`, a Chrome desktop `userAgent`, `extractText: true`.

## Prydwen.gg — WORKING (primary source, used for all character entries)

- Character index (`/wuthering-waves/characters`): works reliably with the technique above, ~8-13s Cloudflare challenge resolution per request.
- Individual character build pages (`/wuthering-waves/characters/<slug>`): work reliably, same technique, ~8-13s per page. Each page yields kit description, review, weapons, echo sets, stat targets, rotation, and team synergy sections — used as the primary source for every character JSON in `characters/`.
- Tier list pages (`/wuthering-waves/tier-list`, `/wuthering-waves/team-tier-list`): not separately fetched in this pass — tier placements were instead pulled from the "DPS/Support/Hybrid TX" badges embedded at the top of each character's own build page, which duplicate the tier-list data per-character. Treat `tierList.prydwen` in each JSON as sourced from that in-page badge, not the standalone tier-list page.

## Nanoka.cc — PARTIALLY WORKING, not used for content in this pass

- `https://ww.nanoka.cc/character/<name-slug>` (e.g. `/character/jinhsi`) returns a 200 "Requested resource not found" page — nanoka does **not** use name slugs.
- `https://ww.nanoka.cc/character` (list page) loads correctly with the same jsRender technique and reveals the real URL scheme: **numeric IDs**, e.g. `https://ww.nanoka.cc/character/1304` = Jinhsi. A full slug→ID map was captured during this session (see below) but individual character pages were not fetched for kit-multiplier cross-referencing due to time budget — this is the main gap for a follow-up pass.
- Nanoka numeric IDs captured (partial, from the list page): Jinhsi=1304, Yinlin=1302, Xiangli Yao=1305, Calcharo=1301, Encore=1203, Changli=1205, Brant=1206, Camellya=1603, Verina=1503, The Shorekeeper=1505, Jiyan=1404, Carlotta=1107, Cartethyia=1409, Ciaccona=1407, Chixia=1202, Chisa=1508, Danjin=1602, Denia=1211, Aemeath=1210, Augusta=1306, Baizhi=1103, Buling=1307, Zani=1507, Zhezhi=1105, and more (see full link dump captured 2026-08-31, not reproduced here). The `sources.nanoka` field in the character JSONs currently uses the (incorrect) slug-style URL as a placeholder — **fix in a follow-up pass** using the numeric IDs.

## Fandom wiki (wutheringwaves.fandom.com) — WORKING BUT VERY SLOW

- Runs a Cloudflare challenge that took 8-13s on the site-wide list page but over **40 seconds** on an individual character page (`/wiki/Jinhsi`) in this session, and the resulting extract was empty/truncated. Technically reachable with `jsRender + waitMs >= 15000`, but the cost-per-page (in both wall-clock time and truncation risk) made it impractical to use for all 60 characters in this pass. Not used as a source for any character in this pass; flagged for a follow-up with a longer `waitMs` (20000+) and no `maxTextLength` cap.

## Encore.moe — NOT ATTEMPTED

Not fetched in this pass due to time budget after prioritizing Prydwen depth. Follow-up should check `https://encore.moe/?lang=en` for character/build content linked from the front page.

## wuwatracker.com — NOT ATTEMPTED

Not fetched in this pass. Follow-up should check for a resources/API section with skill/stat data.

## Reddit / r/Wuthering_Waves — NOT ATTEMPTED

Not fetched in this pass. Community rotation/team-comp consensus notes included in each character JSON's `communityNotes` field are synthesized from Prydwen's own "Review" and "Meta Position & Conclusion" sections (which already summarize community sentiment), not from direct Reddit scraping. A follow-up pass should cross-reference `old.reddit.com/r/Wuthering_Waves` search results for current-patch theorycrafting to corroborate or add nuance to these notes.

## Practical takeaway for a follow-up pass

Given ~8-13s per Prydwen page fetch and the need for one page per character, covering all 60 characters end-to-end (with the current single-primary-source depth) is roughly a 60 x (fetch + write) loop — feasible but long. This pass completed 24 of 60 characters with full Prydwen-sourced depth (kit, build, teams, rotation, community notes) before time constraints required stopping to document and push. See `INDEX.md` for exactly which characters are done vs. pending.
