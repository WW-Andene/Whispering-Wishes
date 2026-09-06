# Project Rules — Master Template

Read this before making any code, UI, or styling change. These are hard rules, not suggestions — do not bypass them by reaching for a default utility class, an arbitrary one-off pixel value, a "close enough" number, or a lazy workaround.

Rules are grouped into domains below. Within a domain, more specific rules refine — never override — the general ones above them.

---

## 1. Work Habits — process discipline

These govern *how* work gets done, on every task, regardless of size or urgency.

1. **Always review before and after a finding or a fix.** Confirm the problem is real before acting on it, and confirm the fix actually resolved it afterward — don't treat either end as assumed.
2. **Cross-check and verify sources.** Don't trust a single read, a hand-copied reimplementation, or a remembered assumption — verify against the real file, the real test, or the real data before relying on it.
3. **Take time to read and understand the data thoroughly, and use it every time it's relevant to a task** — not just once, opportunistically, whenever convenient. If sourced data exists for a task, it should inform every relevant decision in that task, not just the first one.
4. **Favor real, adapted solutions over lazy workarounds.** When an issue has a genuine fix available — especially when data exists to build one — find, create, or adapt that real solution instead of setting the issue aside or papering over it.

---

## 2. Security — no unauthorized backdoors, ever

Never unilaterally add any kind of backend door — USB debugging or similar — without authorization. If debugging a device-specific bug seems to require this class of access, stop and ask first. Do not enable it, present it as a fait accompli, or frame it as "temporary" or "diagnostic" to work around this rule.

---

## 3. Code Hygiene & Structure — non-negotiable

Structuring, organizing, segmenting, naming, optimizing, and classifying files, folders, and code itself is **absolute — never to be bypassed**, regardless of deadline, urgency, or how small a change seems. A quick fix does not excuse dropping a file in the wrong place, reusing a misleading name, or leaving a new symbol unclassified "for now."

Hygiene, ownership clarity, coherence, and — above all — **consistency** (of entities, of the project, and of process) are an irrefutable priority. No task, deadline, or user request implicitly waives it. If a request would require violating it, flag that before proceeding rather than quietly complying.

**Enforcement cadence:** run a project restructuring/audit skill (if one exists) and a code-audit pass regularly — as a floor, every ~50 commits to the repo — to keep the codebase in a clean, correctly-organized state rather than letting drift accumulate. Treat this as scheduled maintenance, not something to wait for the user to request.

**Standing exceptions:** any file or module the project owner designates off-limits should be listed here explicitly (path, scope of what's covered, and the exact condition under which it may be touched). Do not touch such files outside that condition, even for this hygiene cadence, an unrelated bug fix, or a "quick" adjacent change.

---

## 4. Design System — numeric scale

> Define a single numeric scale for the project. This template uses "PerfectSuite" as an example instance — swap in the project's own scale if different, but keep the same enforcement structure below.

Every numeric dimension in the app — font-size, width, height, padding, margin, gap, icon size, border-radius input, anything measured in px — **must** be one of the scale's defined values. Example scale organized in three tiers per power-of-2 octave — `[Primary]`, `(Secondary)`, `{Tertiary}`:

```
[1]
[2]  (3)
[4]  (6)
[8]  (12)  {14}
[16] (24)  {30}
[32] (48)  {62}
[64] (96)  {126}
[128] (192) {254}
[256] (384) {510}
[512] (768) {1022}
[1024]
```

No other number is permitted. This applies everywhere, not just new code — when you touch an existing value that isn't in the scale, fix it to the nearest scale value as part of that change instead of leaving it.

**Before setting any dimension:**
- Never assume a default utility class is compliant — check its computed px value against the defined scale. A framework's default spacing/typography scale will often NOT map cleanly onto a project's own numeric system.
- If a token (`--font-*`, `--size-*`, `--space-*`, etc.) already resolves to a scale value, use it.
- If the nearest existing token is off-scale, either fix the token (if the change should apply everywhere that token is used) or use an explicit scoped override for just that element (if the change is local-only).

### 4.1 Rounding priority (tie-breaking)

When an off-scale value must be corrected, round to the mathematically nearest scale value. When two candidates are **equidistant**, break the tie using a defined priority order. Example, for the PerfectSuite scale above — **Nearest beats Primary beats Secondary beats Tertiary**:

- **`[Primary]`** (base 2): `1, 2, 4, 8, 16, 32, 64, 128, 256, 512, 1024`
- **`(Secondary)`** (base 2 intermediate — the midpoint between two consecutive primaries): `3, 6, 12, 24, 48, 96, 192, 384, 768`
- **`{Tertiary}`** (base 2 additional — sum of the primary steps below the next primary, e.g. `8+4+2=14`, `16+8+4+2=30`): `14, 30, 62, 126, 254, 510, 1022`

Worked examples:
- `10` → tie between `8` (primary) and `12` (secondary), both distance 2 → primary wins → **8**
- `13` → tie between `12` (secondary) and `14` (tertiary), both distance 1 → secondary wins → **12**
- `15` → tie between `14` (tertiary) and `16` (primary), both distance 1 → primary wins → **16**
- `11` → `12` is distance 1, `8` is distance 3 → not a tie, nearest wins → **12**
- `17` → `16` is distance 1, `24` is distance 7 → not a tie, nearest wins → **16**

This can and will collapse previously-distinct values onto the same scale number (e.g. two font sizes both rounding to `12`) — that's an accepted outcome of strict scale compliance, not a bug to work around by picking a different rounding.

### 4.2 Exception — values above the first primary-doubling threshold

For a value greater than the scale's second primary step (e.g. `16` in the example scale), don't just snap to the single nearest scale number. Instead: take the nearest `[Primary]` at or below the value, then add another `[Primary]` on top to close the remaining gap as tightly as possible.

- Example (PerfectSuite scale): `150` → nearest primary at/below is `128`; `128 + 16 = 144` is the closest reachable primary+primary sum → **144**.

### 4.3 Corner radius

Define a formula relating radius to a component's own dimensions, e.g. `radius = 0.24 × the element's height`, then round to the nearest scale value (apply the tie-break priority in §4.1).

### 4.4 Aspect ratios — preferred, not mandatory

Define a short priority list of preferred aspect ratios to reach for — not a hard constraint; use judgment, don't force a mismatch. Example: `3:2`, `4:3`, `5:4`, `3:1` (the last reserved for wide/short bars).

### 4.5 Design goals behind the design system

Standardization · Coherency · Consistency · Pixel-perfect precision · Symmetry · Strict aesthetic proportions · Conscious, deliberate art-direction choices — never a default or "close enough" value.

---

## 5. Project-Specific Standards

Use this section to record any reference proportions, component precedents, or exceptions unique to this project (e.g. header/navbar reference dimensions, known off-scale tokens not yet fixed, other standing exceptions). Keep such content isolated here so it stays easy to identify and to strip out when reusing this document as a template for a different project.
