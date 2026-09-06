# Whispering Wishes — Project Rules

Read this before making any code, UI, or styling change. These are hard rules, not suggestions — do not bypass them by reaching for a default Tailwind class, an arbitrary one-off pixel value, a "close enough" number, or a lazy workaround.

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

**Enforcement cadence:** run the `app-restructuring` skill (`claude_skill/app-restructuring-SKILL.md`) and a code-audit pass regularly — as a floor, every ~50 commits to the repo — to keep the codebase in a clean, correctly-organized state rather than letting drift accumulate. Treat this as scheduled maintenance, not something to wait for the user to request.

### Standing exception — MapTab *(Whispering-Wishes-specific)*

Absolutely never touch `MapTab.jsx` or anything connected to it (its hooks, sub-components, map-specific state/utils), for any reason — including this hygiene cadence, an unrelated bug fix, or a "quick" adjacent change — except when given direct, clear, and absolute instructions to do so.

---

## 4. Design System — PerfectSuite numeric scale

> **Updated.** This replaces any prior version of the scale and its tie-break rules. The suite is organized in three explicit tiers per power-of-2 octave: `[Primary]`, `(Secondary)`, `{Tertiary}`.

Every numeric dimension in the app — font-size, width, height, padding, margin, gap, icon size, border-radius input, anything measured in px — **must** be one of these values:

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

No other number is permitted. This applies everywhere, not just new code — when you touch an existing value that isn't in this list, fix it to the nearest PerfectSuite value as part of that change instead of leaving it.

**Before setting any dimension:**
- Never assume a default utility class is compliant — check its computed px value against the list above. (In this project, Tailwind's default scale does NOT reliably map to PerfectSuite: e.g. `text-sm`, even after this project's `kuro.css` override, is 11px, and `--font-sm` in `index.css` is 10px — neither is in the suite.)
- If a token (`--font-*`, `--size-*`, `--space-*`, etc.) already resolves to a PerfectSuite value, use it.
- If the nearest existing token is off-suite, either fix the token (if the change should apply everywhere that token is used) or use an explicit arbitrary-value override scoped to just that element, e.g. `text-[12px]` / `w-[48px]` (if the change is local-only).

### 4.1 Rounding priority (tie-breaking)

When an off-suite value must be corrected, round to the mathematically nearest PerfectSuite value. When two candidates are **equidistant**, break the tie using this priority order — **Nearest beats Primary beats Secondary beats Tertiary**:

- **`[Primary]`** (base 2): `1, 2, 4, 8, 16, 32, 64, 128, 256, 512, 1024`
- **`(Secondary)`** (base 2 intermediate — the midpoint between two consecutive primaries): `3, 6, 12, 24, 48, 96, 192, 384, 768`
- **`{Tertiary}`** (base 2 additional — sum of the primary steps below the next primary, e.g. `8+4+2=14`, `16+8+4+2=30`): `14, 30, 62, 126, 254, 510, 1022`

Worked examples:
- `10` → tie between `8` (primary) and `12` (secondary), both distance 2 → primary wins → **8**
- `13` → tie between `12` (secondary) and `14` (tertiary), both distance 1 → secondary wins → **12**
- `15` → tie between `14` (tertiary) and `16` (primary), both distance 1 → primary wins → **16**
- `11` → `12` is distance 1, `8` is distance 3 → not a tie, nearest wins → **12**
- `17` → `16` is distance 1, `24` is distance 7 → not a tie, nearest wins → **16**

This can and will collapse previously-distinct values onto the same PerfectSuite number (e.g. two font sizes both rounding to `12`) — that's an accepted outcome of strict suite compliance, not a bug to work around by picking a different rounding.

### 4.2 Exception — values above 16px

For a value greater than `16`, don't just snap to the single nearest suite number. Instead: take the nearest `[Primary]` at or below the value, then add another `[Primary]` on top to close the remaining gap as tightly as possible.

- Example: `150` → nearest primary at/below is `128`; `128 + 16 = 144` is the closest reachable primary+primary sum → **144**.

### 4.3 Corner radius

`radius = 0.24 × the element's height`, then rounded to the nearest PerfectSuite sub-number (apply the tie-break priority in §4.1).

### 4.4 Aspect ratios — preferred, not mandatory

Unlike the PerfectSuite scale, these ratios are a **priority list to reach for**, not a hard constraint — use judgment, don't force a mismatch:

`3:2`, `4:3`, `5:4`, `3:1` (the last reserved for wide/short bars — header, navbar, and similar).

### 4.5 Design goals behind the design system

Standardization · Coherency · Consistency · Pixel-perfect precision · Symmetry · Strict aesthetic proportions · Conscious, deliberate art-direction choices — never a default or "close enough" value.

---

## 5. Project-Specific Standards *(Whispering-Wishes-specific)*

### 5.1 Header / Navbar

Visually 192px wide × 64px tall (both PerfectSuite values), even though the actual implementation is responsive/fluid rather than hard-coded — treat 192×64 as the reference proportions when sizing anything meant to align with the header/nav.

### 5.2 Precedent already in the codebase

- Nav icons: `w-4 h-4` (16px), `w-6 h-6` (24px) — still compliant under the updated suite.
- Nav profile button: `w-[48px] h-[48px]` — still compliant.
- `--size-icon-btn: 28px` (kuro.css) — **no longer compliant** under the updated suite (28 was tertiary in the old scale; the new tertiary tier no longer includes it — nearest is now `30`). Flagged here, not yet fixed in code — treat as a normal off-suite value the next time this token is touched.
