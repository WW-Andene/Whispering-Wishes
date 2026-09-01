# Phase 1 handoff — precise skill/Forte/Resonance Chain mechanics

## Is there a Phase 2 document?
Yes — see `PHASE2_PLAN.md` at the repo root. It's a planning doc only (no
Phase 2 work has started): it explains what the flat Resonance-Chain schema
can't represent, where the relevant calc-engine code lives, the open design
questions that need the user's sign-off before writing any Phase 2 code, and
a suggested approach for when the user greenlights it. Do not start Phase 2
work from Phase 1 — finish/continue the character-by-character data pass
described below unless the user explicitly asks to move to Phase 2.

## What this is
The user found the character skill/Forte/Outro/Resonance Chain data in
`app/src/data/characters.js` too shallow to support a real rotation-construction
system — flavor text or flat action-name arrays instead of exact mechanics
(exact numbers, exact trigger conditions, cast-order/timing-window forfeit
rules, stat categories). This is a **Phase 1** pass: rewrite that data to be
mechanically precise, sourced, and correctly wired to the `SKILL_MULTIPLIERS`
lookup the calc engine uses. **Phase 2** (wiring this into `calcEngine.js` /
`calcTeamStats.js` / `autoEquip.js` logic) is explicitly a separate, later
step — do not start it without the user asking.

Work happens directly on branch `claude/wuthering-waves-character-data-xmq44i`
in `ww-andene/whispering-wishes`. Commit + push per character (or small
batch), no PR, no amend/rebase. The user explicitly prefers **absolute
precision over speed** — one character done right beats five done shallow.

## Done — 21 of 58 (commits, newest first)
`Lingyang` (`2fd076bd`), `Jianxin` (`a131409c`), `Encore` (`b2ad8bc1`),
`Calcharo` (`08689fdc`), `Jiyan` (`c25d8e2c`), `Verina` (`86182a5a`),
`Shorekeeper` (`5e764ae0`), `Yinlin` (`7a256cff`), `Roccia` (`2b31b9a3`),
`Iuno` (`0672b1f5`), `Cantarella` (`26216bc6`), `Phoebe` (`e49e7b9b`),
`Zani` (`54cd8aa1`), `Brant` (`2d5d4d3a`), `Carlotta` (`8cbfed99`),
`Cartethyia` (`91a9cacb`), `Phrolova` (`f9aefb6f`), `Changli` (`3a865c64`),
`Jinhsi` (`fd0cd7d8`), `Camellya` (`898dac8e`), `Augusta` (`87b419bc`).

Read `Augusta`, `Camellya`, and `Jinhsi` in full in `characters.js` first —
they're the calibration references for the fidelity bar every subsequent
character must match.

## Remaining — 36 characters (skip Jingran, see note below)
In rough priority order (5★ Main/Sub DPS first, then Supports/Healers, then
lower-priority/niche characters):

**Next up:** `Xiangli Yao` (key is `'Xiangli Yao'` with a space) — a pass on
this character was started and failed mid-way due to a session rate limit,
**no commit was made**, so start it completely fresh, don't assume any
partial state exists in the file.

Then, still unaudited: `Zhezhi`, `Ciaccona`, `Lupa`, `Galbrena`, `Qiuyuan`,
`Chisa`, `Lynae`, `Mornye`, `Luuk Herssen`, `Aemeath`, `Sigrika`, `Rebecca`,
`Lucilla`, `Lucy`, `Yangyang: Xuanling`, `Denia`, `Hiyuki`, `Suisui`,
`Qingxiao`, `Aalto`, `Baizhi`, `Chixia`, `Danjin`, `Yangyang`, `Sanhua`,
`Taoqi`, `Yuanwu`, `Mortefi`, `Youhu`, `Lumi`, `Buling`, plus the four Rover
attunements (`Rover: Spectro`, `Rover: Havoc`, `Rover: Aero`, `Rover: Electro`
— low priority, share one real kit conceptually but are modeled as four
separate entries per the file's own header comment).

**`Jingran` — do not attempt.** He's an announced-but-unreleased 5★ (release
date Sept 10 2026 per Prydwen/Fandom as of the last check on 2026-08-31/09-01)
with no public kit data yet. Both sites explicitly say his skills/Forte/nodes
"aren't available yet." Re-check after his release patch, not before.

## The recurring bug classes to check on every character (in priority order)
These were found on nearly every character audited so far — check for all of
them every time, don't assume a character is clean just because it "looks
more developed":

1. **Zero-damage rotation bug (found ~11+ times, the most serious class).**
   `CharacterDetailModal.jsx` / the calc engine resolves each
   `CHARACTER_ROTATIONS[char]` step's damage via a **substring match**:
   `rowName.includes(step.skill)` against `SKILL_MULTIPLIERS[char]` row
   names. If a rotation step's `skill` string isn't an exact substring of
   some row name — a wording mismatch ("Attack" vs "ATK"), a missing/extra
   suffix ("Stage 4" vs no stage suffix, "1-5" vs no numbers), an invented
   flavor phrase instead of the real move name, or a genuinely missing row —
   that step silently resolves to **zero damage**. Check every single step.
2. **Resonance Chain nodes stored under the wrong stat category** — the
   single most common error, roughly half of all nodes checked. A node
   might be stored as `skillDmg` when the move it buffs is actually
   classified as Heavy ATK-type by the game itself, or as a generic
   `totalMult` for an effect that's really a Crit Rate/Crit DMG/DEF-ignore/
   resistance-shred/ATK% bu­ff, etc. Get the exact category right from the
   verbatim source text, not just the number.
3. **Fabricated numbers on nodes with zero real DPS component.** A lot of
   pre-existing `RESONANCE_CHAIN_DATA` entries have a plausible-looking
   number (`totalMult: 5`, `totalMult: 10`, `totalMult: 15` are common
   filler values) on a node that's actually pure utility — Energy/resource
   regen, an extra charge, AoE range increase, poise/interrupt immunity, a
   shield, healing. Zero these (`{}`) rather than guessing, but document the
   real (non-DPS) effect precisely in a comment. Leave a
   `// TODO: needs Phase 2 schema` note since the flat `{stat: value}`
   schema genuinely can't represent most of these.
4. **Multi-hit stages collapsed into one wrong summed number** instead of
   the real per-hit breakdown (e.g. `145.8%` stored when the move is really
   3 separate hits of `36.44%×2 + 72.9%`). Pull exact per-hit values from
   the wiki's Attribute Scaling / Lv.10 table.
5. **Wrong level baseline.** At least one character (Iuno) had her entire
   `SKILL_MULTIPLIERS` table stored at Lv.1 instead of the project's
   standard Lv.10 baseline, silently halving every real value. Spot-check
   against a second source if numbers look suspiciously low.
6. **Damage attributed to the wrong parent skill entirely** (found on Jiyan)
   — multipliers labeled as belonging to Liberation that the source
   actually says are Heavy Attack-type damage (or similar mislabeling).
   Verify each multiplier's *category*, not just its magnitude.
7. **Completely undocumented hidden mechanics** — e.g. Calcharo's post-buff
   Intro cast silently swaps to a different named move with its own
   multiplier that wasn't in the file at all; Zani's burst-exit is an OR
   gate (resource threshold OR timer, whichever comes first) that wasn't
   captured before. Don't assume the existing `desc` prose is complete —
   read the actual wiki Forte/Skill tables in full.

## Site access — the technique that works (used successfully ~21 times)
**As of this handoff, the `mcp__DP__web_fetch` tool (part of the "DP" MCP
server) has disconnected** — a fresh session may need to reconnect it or
find an equivalent headless-browser tool before this technique is usable
again. When it's available:
- `jsRender: true`
- Real Chrome/Windows user-agent string (not a generic/default one)
- `Referer: https://www.google.com/` (look like an inbound Google click)
- `waitUntil: 'load'` (not `'networkidle'` — that often never fires on
  these sites)
- ~8000–9000ms extra wait after load before reading content
- May need **2 attempts** — the first sometimes only returns a Cloudflare
  interstitial, the second (immediately after) usually clears it

Sources, in priority order:
1. `https://wutheringwaves.fandom.com/wiki/<Character>/Combat` — primary,
   most mechanically precise. If `jsRender` fails twice, fall back to the
   wiki's own MediaWiki API (no Cloudflare gate):
   `https://wutheringwaves.fandom.com/api.php?action=parse&page=<Character>/Combat&prop=text&formatversion=2`
2. `https://www.prydwen.gg/wuthering-waves/characters/<slug>` — good
   cross-reference for ambiguous numbers or when the wiki's own Lua scaling
   module errors out (this happens sometimes, e.g. it did for Jinhsi's Forte
   table).
3. `https://ww.nanoka.cc/character/<id>` — useful but character IDs must be
   confirmed correct before trusting the page (a prior pass guessed wrong
   and silently landed on a different character's page — don't force this
   source if you can't confirm the ID, fandom+prydwen agreement is enough).
4. `https://encore.moe/?lang=en` — occasionally useful, not load-bearing so
   far.

Plain `WebFetch` (the generic tool, not `mcp__DP__web_fetch`) returned
HTTP 402 in this environment in every attempt — don't bother with it.

## Hard rules (apply to every pass)
- Do not invent/guess any mechanic or number — verify against source, or
  leave `// TODO: verify` / `// TODO: needs Phase 2 schema` rather than
  guessing.
- Never touch `MapTab.jsx` or anything connected to it, ever, no exceptions.
- Never touch `calcEngine.js`, `calcTeamStats.js`, `autoEquip.js`, or any
  other calc-engine wiring logic this phase — Phase 2 only, out of scope now.
- Follow the file's existing inline sourcing-comment convention: cite
  source + date for every factual correction, matching the style already
  used throughout (see any of the 21 completed characters for examples).
- Run `node --check app/src/data/characters.js` before every commit.
- Commit and push to `claude/wuthering-waves-character-data-xmq44i` via
  `git push -u origin claude/wuthering-waves-character-data-xmq44i` (retry
  up to 4x on network failure only, backoff 2s/4s/8s/16s). No PR.
- One character per pass is the established, user-approved cadence — don't
  try to batch several characters into one pass to go faster; the user
  explicitly chose precision over speed.

## Suggested next-agent prompt shape
Each completed character so far was done by spawning a fresh agent with:
the character name, the running list of completed commits (as calibration
references + the "don't assume existing text is correct" warning), the
current version of this bug-class list, the site-access technique, and the
hard rules above — then asking it to report back with a concrete fidelity
example, a full list of numeric/categorical corrections with old→new+source,
remaining TODOs, and commit/push confirmation. Reusing that shape works well
and keeps each pass self-contained for a fresh agent with no prior context.
