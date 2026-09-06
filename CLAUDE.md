# Whispering Wishes — Project Rules

Read this before making any code, UI, or styling change. These are hard rules, not suggestions — do not bypass them by reaching for a default Tailwind class, an arbitrary one-off pixel value, a "close enough" number, or a lazy workaround.

Rules are grouped into domains below, each grounded in an established professional discipline rather than ad hoc preference. Within a domain, more specific rules refine — never override — the general ones above them.

---

## 1. Work Habits — process discipline

Discipline: **quality assurance / engineering process discipline** (cf. the verification and root-cause-analysis practices underlying ISO 9001 process control and standard code-review methodology).

1. **Verify before and after every finding or fix (pre-/post-verification).** Confirm the defect is real, reproducible, and understood before acting on it; confirm the fix actually resolves it afterward via a positive check. Neither end is ever assumed.
2. **Cross-check and corroborate sources.** Do not rely on a single read, a hand-copied reimplementation, or a remembered assumption. Verify claims against the authoritative source — the real file, the real test, the real data — before relying on them. This mirrors the standard of independent verification used in technical audits and peer review.
3. **Perform due diligence on source data, and apply it consistently.** Read and understand reference data thoroughly before using it, and apply that understanding at every decision point in the task where it is relevant — not as a one-time lookup consulted only when convenient.
4. **Prefer root-cause remediation over palliative workarounds.** Where a genuine, sourced fix is available, implement it rather than deferring, suppressing, or working around the underlying issue. This is standard root-cause-analysis practice: a workaround treats a symptom and leaves the defect live.

---

## 2. Security — access control & least privilege

Discipline: **information security / access control**, specifically the principle of least privilege and change-authorization control found in frameworks such as ISO/IEC 27001 and NIST SP 800-53 (access control family).

Do not unilaterally provision any privileged access path — debug bridges (e.g. USB debugging), backend doors, or equivalent — without explicit authorization from the project owner. If diagnosing a device-specific defect appears to require this class of access, stop and request authorization first. Do not enable it preemptively, present it as a fait accompli, or reclassify it as "temporary" or "diagnostic" to sidestep this control.

---

## 3. Code Hygiene, Naming & Structure — records & configuration management

Discipline: **records management and information architecture** (the classification, naming, and lifecycle-maintenance practices formalized in ISO 15489) applied to source code, combined with standard **software configuration management** practice (naming-convention and code-organization guidance as codified in style guides such as Google's engineering style guides and Clean Code's naming principles).

Structuring, organizing, segmenting, naming, and classifying files, folders, and code is **mandatory and non-negotiable**, regardless of deadline, urgency, or how small a change seems. A quick fix does not excuse misplacing a file, reusing a misleading identifier, or leaving a new symbol unclassified "for now."

Hygiene, ownership clarity, coherence, and — above all — **consistency** (of naming, of structure, and of process) are a standing priority that no task, deadline, or request implicitly waives. If a request would require violating this, flag the conflict before proceeding rather than complying silently.

**Maintenance cadence (lifecycle management):** run the `app-restructuring` skill (`claude_skill/app-restructuring-SKILL.md`) and a code-audit pass on a regular cadence — as a floor, every ~50 commits — to prevent structural drift from accumulating. This is scheduled maintenance, analogous to a records-retention review, not something to defer until requested.

### Standing exception — MapTab *(Whispering-Wishes-specific)*

Do not modify `MapTab.jsx` or anything connected to it (its hooks, sub-components, map-specific state/utilities) for any reason — including this maintenance cadence, an unrelated defect fix, or an adjacent "quick" change — except under direct, explicit, unambiguous instruction to do so.

---

## 4. Design System — design-token governance (PerfectSuite numeric scale)

Discipline: **design-token systems**, the standard mechanism (used across major design systems, e.g. Material Design, Salesforce Lightning) for enforcing a single source of truth for spacing, sizing, and typography scales, ensuring pixel-accurate consistency across a UI.

> **Updated.** This replaces any prior version of the scale and its tie-break rules. The suite is organized in three explicit tiers per power-of-2 octave: `[Primary]`, `(Secondary)`, `{Tertiary}`.

Every numeric dimension in the app — font-size, width, height, padding, margin, gap, icon size, border-radius input, anything measured in px — **must** resolve to one of these values:

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

No other number is permitted. This applies to existing code as well as new code — when an off-scale value is touched, correct it to the nearest PerfectSuite value as part of that change rather than leaving it.

**Before setting any dimension:**
- Never assume a default utility class is compliant — verify its computed px value against the scale above. (In this project, Tailwind's default scale does not reliably map to PerfectSuite: e.g. `text-sm`, even after this project's `kuro.css` override, is 11px, and `--font-sm` in `index.css` is 10px — neither is in the suite.)
- If a token (`--font-*`, `--size-*`, `--space-*`, etc.) already resolves to a PerfectSuite value, use it — this is the token layer doing its job.
- If the nearest existing token is off-scale, either correct the token (when the change should propagate to every usage) or apply an explicit, scoped arbitrary-value override, e.g. `text-[12px]` / `w-[48px]` (when the change is local only).

### 4.1 Rounding priority (tie-breaking)

When correcting an off-scale value, round to the mathematically nearest PerfectSuite value. When two candidates are **equidistant**, resolve the tie by this priority order — **Nearest beats Primary beats Secondary beats Tertiary**:

- **`[Primary]`** (base 2): `1, 2, 4, 8, 16, 32, 64, 128, 256, 512, 1024`
- **`(Secondary)`** (base 2 intermediate — the midpoint between two consecutive primaries): `3, 6, 12, 24, 48, 96, 192, 384, 768`
- **`{Tertiary}`** (base 2 additional — sum of the primary steps below the next primary, e.g. `8+4+2=14`, `16+8+4+2=30`): `14, 30, 62, 126, 254, 510, 1022`

Worked examples:
- `10` → tie between `8` (primary) and `12` (secondary), both distance 2 → primary wins → **8**
- `13` → tie between `12` (secondary) and `14` (tertiary), both distance 1 → secondary wins → **12**
- `15` → tie between `14` (tertiary) and `16` (primary), both distance 1 → primary wins → **16**
- `11` → `12` is distance 1, `8` is distance 3 → not a tie, nearest wins → **12**
- `17` → `16` is distance 1, `24` is distance 7 → not a tie, nearest wins → **16**

This can and will collapse previously-distinct values onto the same PerfectSuite number (e.g. two font sizes both rounding to `12`) — that is an accepted outcome of strict scale compliance, not a bug to work around by picking a different rounding.

### 4.2 Exception — values above 16px

For a value greater than `16`, do not snap to the single nearest suite number. Instead: take the nearest `[Primary]` at or below the value, then add another `[Primary]` on top to close the remaining gap as tightly as possible.

- Example: `150` → nearest primary at/below is `128`; `128 + 16 = 144` is the closest reachable primary+primary sum → **144**.

### 4.3 Corner radius

`radius = 0.24 × the element's height`, rounded to the nearest PerfectSuite value (apply the tie-break priority in §4.1).

### 4.4 Aspect ratios — preferred, not mandatory

Unlike the PerfectSuite scale, these ratios are a **priority list to reach for**, not a hard constraint — apply engineering judgment rather than forcing a mismatch:

`3:2`, `4:3`, `5:4`, `3:1` (the last reserved for wide/short bars — header, navbar, and similar).

### 4.5 Design objectives behind the design-token system

Standardization · coherency · consistency · pixel-accurate precision · symmetry · disciplined aesthetic proportion · deliberate, documented art-direction decisions — never a default or "close enough" value.

---

## 5. Project-Specific Standards *(Whispering-Wishes-specific)*

### 5.1 Header / Navbar

Visually 192px wide × 64px tall (both PerfectSuite values), even though the actual implementation is responsive/fluid rather than hard-coded — treat 192×64 as the reference proportions when sizing anything meant to align with the header/nav.

### 5.2 Precedent already in the codebase

- Nav icons: `w-4 h-4` (16px), `w-6 h-6` (24px) — still compliant under the updated suite.
- Nav profile button: `w-[48px] h-[48px]` — still compliant.
- `--size-icon-btn: 28px` (kuro.css) — **no longer compliant** under the updated suite (28 was tertiary in the old scale; the new tertiary tier no longer includes it — nearest is now `30`). Flagged here, not yet fixed in code — treat as a normal off-suite value the next time this token is touched.
