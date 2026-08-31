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

Given ~8-13s per Prydwen page fetch and the need for one page per character, covering all 60 characters end-to-end (with the current single-primary-source depth) is roughly a 60 x (fetch + write) loop — feasible but long. The first pass completed 24 of 60 characters with full Prydwen-sourced depth (kit, build, teams, rotation, community notes) before time constraints required stopping to document and push. See `INDEX.md` for exactly which characters are done.

## Second pass — 2026-08-31 (this session)

Finished the remaining 36 characters listed as "pending" in the first pass, using the identical technique (`jsRender: true`, `waitUntil: "load"`, `waitMs: 10000-13000`, Google referer, Chrome desktop UA, `extractText: true`).

- **Re-verified the pending list against the live Prydwen character index** (`/wuthering-waves/characters`) before starting — the 36 slugs from the first pass's INDEX.md matched exactly against the current index; no characters were added or removed from the roster in the interim.
- **33 of the 36 scraped with full depth** (kit, review, build, weapons, echoes, teams, rotation, community notes), same as the first pass's 24.
- **3 of the 36 — Hsin, Jingran, Suoming — are unpublished on Prydwen.** Each has a live page confirming rarity/element/weapon type, but every content section (Skills, Resonance Chain, Minor Fortes, Stats, Upgrade Materials, Review, Pros & Cons, Build, Rotation, Synergies, Example Teams) is placeholder text reading "aren't available yet. They will be added soon!" These are almost certainly newly-announced/not-yet-released characters. Their `characters/<slug>.json` files record this explicitly (partial `kit.intro` note, empty `buildGuide`/`teams`/`rotation`) rather than fabricating data — do not treat them as silently dropped; they are flagged, just incomplete pending a future Prydwen update.
- One transient empty-page fetch on `lucy` (first attempt returned only nav chrome with no content, likely a slow Cloudflare resolve) — retried once with `waitMs: 13000` and `forceRefresh: true`, succeeded fully on the second attempt. Same transient issue hit `zhezhi`, same fix worked.
- Nanoka.cc, Fandom, Encore.moe, wuwatracker.com, and Reddit were **not** attempted in this second pass either (out of scope per the task brief's priority on finishing all 36 on Prydwen first); `sources.nanoka` in all 36 new files is left as the placeholder slug-style URL (`null` where no reasonable guess existed), same known gap as the first pass's 24 files.

**Total after this session: 60/60 characters have a `characters/<slug>.json` file** — 57 with full Prydwen-sourced depth, 3 (Hsin, Jingran, Suoming) as documented partial stubs pending Prydwen publishing their kits.

## Third pass — cross-check with non-Prydwen sources — 2026-08-31 (this session)

Goal: cross-check and enrich the synergy layer (`synergy/*`) using sources beyond Prydwen, per task brief. Full detail lives in `synergy/README.md`; this section is the source-by-source access log.

- **`app/src/data/characters.js` (in-repo, no fetch needed) — DONE, fully cross-referenced.** `CHAR_BUFF_TABLE` covers 58/60 characters (all except Hsin and Suoming — notably it *does* have real kit data for Jingran despite Jingran being a Prydwen stub, a genuine app-ahead-of-Prydwen finding, documented in `intro-outro-chains.json`). Merged into `intro-outro-chains.json` as a `crossCheckedSources` entry per character. Found 2 real contradictions (Baizhi, Verina — `durationApprox` had picked up a HoT-tick duration instead of the actual buff duration) and fixed both against the app's authoritative numbers; found 2 apparent-but-non-contradictory duration differences (Buling, Lucy each have two distinct timed effects, not one wrong number).

- **Nanoka.cc — DONE, ID map completed and applied.** Fetched `https://ww.nanoka.cc/character` (list page); it renders instantly (~13s) and includes the full name→numeric-ID map for every released character (Rover elements/genders included as separate IDs). Used this to fix the placeholder slug-style `sources.nanoka` URL in all 58 released characters' `characters/<slug>.json` files to the correct numeric-ID URL (Hsin/Suoming correctly left `null` — no nanoka page exists for either). Individual nanoka character pages (kit-multiplier detail) were **not** deep-scraped in this pass — Fandom's Outro Skill page (below) gave equivalent-or-better numeric coverage for the specific cross-check task (Outro buffs) at a fraction of the fetch cost, so nanoka's per-character multiplier tables remain a gap for a future pass focused on Basic/Skill/Liberation multiplier accuracy specifically (not covered by this synergy-layer pass).

- **Fandom wiki — DONE for general mechanics, MAJOR FIND on `Outro_Skill`.** `wutheringwaves.fandom.com/wiki/Outro_Skill` rendered successfully (43s, `jsRender:true, waitMs:13000`) and turned out to carry the **exact official text of all 57 released characters' Outro Skills** (name, character, full effect with precise %/duration numbers) plus a two-paragraph Tutorial confirming the Concerto Energy→Outro→Intro chain in the game's own words. Cross-checked against all 57 `intro-outro-chains.json` entries; found and fixed 1 real numeric contradiction (Iuno: Prydwen-derived 14s vs. Fandom's exact 10s — Fandom used as the more authoritative wording). `wutheringwaves.fandom.com/wiki/Coordinated_Attack` also rendered successfully and gave the official closed 7-character Coordinated-Attack role list (Baizhi, Cantarella, Mortefi, Verina, Yinlin, Yuanwu, Zhezhi) — added to `resonance-chain-mechanics.md` §6. `wutheringwaves.fandom.com/wiki/Resonance_Chain` re-fetched, confirmed thin as before but confirms the 6-Sequence-Node cap and unlock methods verbatim. `wutheringwaves.fandom.com/wiki/Combat` — attempted again, still did not return within the tool's timeout budget; consistently unreachable across both sessions rather than retried further.

- **Encore.moe — REACHABLE, not deep-scraped.** Front page and `/character` list load fine (~15-40s, `jsRender`). Shares nanoka's numeric character-ID scheme. Spot-checked Jinhsi's page (`/character/1304`) — has Overview/Skills/Stats/Resonance Chain tabs with real kit data, but no dedicated team-archetype/tier-list section found on the site nav (its Tower of Adversity/Endstate Matrix/Whimpering Wastes links are damage leaderboards, not team-comp pages). Not deep-scraped for per-character numbers in this pass since Fandom's Outro Skill page already delivered equivalent/better data for the specific cross-check needed; flagged as a candidate source for a future Skill-multiplier-focused pass.

- **wuwatracker.com — REACHABLE, no structured team-synergy data found.** Front page loads (~40s, `jsRender`) but is a pull/pity tracker + news-article site, not a structured character/team database with its own synergy data model on the page fetched. Its `/Wiki` and `/Tools` nav sections were not crawled further given the time budget.

- **Reddit (`old.reddit.com/r/Wuthering_Waves`) — BLOCKED, confirmed not transient.** Two different fetch attempts (a plain unauthenticated request, which redirected to `/login`; and a `jsRender` + Google-referer + Chrome-UA request matching the documented anti-bot technique) both hit Reddit's own "whoa there, pardner! Your request has been blocked due to a network policy" block page on different search URLs. This is Reddit's own bot-detection actively filtering the fetch path, not a one-off timeout — logged honestly rather than silently working around it or fabricating a community-consensus note. No `communityCrossCheck` data from Reddit was added anywhere in the synergy layer as a result; see `team-archetypes.json`'s `communityCrossCheckAttempt` field for the full detail.

## Fourth pass — weapons, echoes, monsters — 2026-08-31 (this session)

Scope per task brief: weapons/echoes/monsters as the parts explicitly out of scope in prior passes. Time budget available in this session's invocation was significantly smaller than the "multi-hour" scope the brief anticipates, so this pass triaged hard per the brief's own priority order (weapons and echoes over monsters) and is honestly partial. Full detail in `weapons/INDEX.md`, `echoes/INDEX.md`, `monsters/INDEX.md`.

- **Weapons — DONE (methodology caveat below).** 122/122 weapons in `app/src/data/weapons.js` (exceeds the ~60 signature-weapon estimate because it includes 4★/3★/1-2★ tiers too) got a `weapons/<slug>.json` file. Completeness cross-check against all 60 characters' `buildGuide.bestWeapons` passed with 0 unmatched entries. **Caveat:** entries were derived from `weapons.js` (itself nanoka.cc-sourced per its own in-file audit comments, dated 2026-08-14/08-18), not independently re-fetched from Prydwen's per-weapon pages this session — R1-R5 refinement scaling in particular is a real gap, present in neither the app nor here.
- **Echoes — DONE for 32/34 sets (methodology caveat below).** Prydwen's live echo-list page (`https://www.prydwen.gg/wuthering-waves/echoes`, fetched successfully this session, ~11.5s Cloudflare resolve) was used to confirm the full 34-set name list. `app/src/data/echoes.js`'s `ECHO_SETS` table covers 32 of those 34 — **Endless Resonance** and **Flamewing's Shadow** are absent from the app entirely and so have no file here, flagged as an open gap. All 11 sets in `calcEngine.js`'s `TEAM_SET_BUFFS` have a matching file; no new discrepancy beyond what `echoes.js`'s own prior audit already fixed was found. **Caveat:** same as weapons — 2pc/5pc bonus text/values were derived from the app's existing (nanoka-sourced) data, not re-fetched per-set from Prydwen's own set pages this session.
- **Monsters — NOT STARTED.** Zero files. `monsters/INDEX.md` records a candidate ~35-name boss list (derived from the Overlord/Calamity-class Echo entries visible on Prydwen's echo list page) and the planned nanoka/Fandom technique for a follow-up pass, per the brief's own instruction to be honest about gaps rather than fabricate.
