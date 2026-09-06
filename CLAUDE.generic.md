# Project Rules — Master Template

Read this before making any code, UI, or styling change. These are hard rules, not suggestions — do not bypass them by reaching for a default utility class, an arbitrary one-off pixel value, a "close enough" number, or a lazy workaround.

Rules are grouped into domains below, each grounded in an established professional discipline rather than ad hoc preference. Within a domain, more specific rules refine — never override — the general ones above them.

---

## 1. Work Habits — process discipline

Discipline: **quality assurance / engineering process discipline** (cf. the verification and root-cause-analysis practices underlying ISO 9001 process control and standard code-review methodology).

1. **Verify before and after every finding or fix (pre-/post-verification).** Confirm the defect is real, reproducible, and understood before acting on it; confirm the fix actually resolves it afterward via a positive check (a passing test, a reproduced-then-cleared repro case, a before/after diff of the actual numbers). Neither end is ever assumed.
2. **Cross-check and corroborate sources.** Do not rely on a single read, a hand-copied reimplementation, or a remembered assumption. Verify claims against the authoritative source — the real file, the real test, the real data — before relying on them. If a hand-rolled diagnostic script disagrees with the real code path, trust the real code path and find out why the script was wrong, not the reverse.
3. **Perform due diligence on source data, and apply it consistently.** Read and understand reference data thoroughly before using it, and apply that understanding at every decision point in the task where it is relevant — not as a one-time lookup consulted only when convenient.
4. **Prefer root-cause remediation over palliative workarounds.** Where a genuine, sourced fix is available, implement it rather than deferring, suppressing, or working around the underlying issue. This is standard root-cause-analysis practice: a workaround treats a symptom and leaves the defect live.
5. **State uncertainty explicitly; never present a guess as a verified fact.** If something wasn't checked, say so. A confident-sounding but unverified claim is a worse outcome than an honest "I haven't confirmed this yet."
6. **Ask rather than assume when a decision materially changes behavior, scope, or risk.** Use judgment for reversible, low-stakes calls; escalate for anything hard to reverse, ambiguous in intent, or outside the request's stated scope (see §5, Change Scope Discipline).

### 1.1 Definition of Done

A task is not complete until all of the following hold — treat this as the exit checklist for any non-trivial change:

- The root cause (not just the symptom) is identified and addressed, per §1.4.
- The fix is verified against real execution (tests, a reproduced scenario, or measured output), not just read-through review.
- The full relevant test suite passes — not just the test for the immediate change; a regression elsewhere is still a regression.
- Any newly-introduced non-obvious behavior, tradeoff, or known limitation is documented **in the code or commit message**, not only explained conversationally. If asked "did you document it?", the answer should already be yes.
- The diff is reviewed for scope: no unrelated cleanup, no drive-by refactors, no speculative abstractions bundled into the same change (see §5).
- Naming and structure of anything touched or added conform to §3.

---

## 2. Verification & Testing Discipline

Discipline: **software testing and validation methodology** — the practice of treating automated tests and reproducible measurements as the primary evidence of correctness, not narrative confidence.

1. **Run the real test suite before making a change and after.** A pre-existing failure is not yours to silently absorb into your diff's "before" state without noting it; a new failure after your change is yours to explain or fix before calling the task done.
2. **Prefer measured evidence over inferred behavior.** When a value, a rate, or a count matters, obtain it via the actual code path (a temporary, always-reverted diagnostic if needed) rather than computing it by hand from assumptions about how the system behaves.
3. **When a change causes divergence from a previous baseline (a golden file, a snapshot, a fixture), never widen the tolerance or update the baseline without first establishing why the divergence is expected.** Document the specific, cited reason next to the widened tolerance or updated fixture — a bare "widened for now" is not acceptable.
4. **Delete throwaway diagnostics.** Debug-only instrumentation (temporary throws, dumps, one-off scripts) is removed once it has served its verification purpose — it does not linger in the codebase or get mistaken for permanent code.
5. **A test suite passing is necessary, not sufficient, for UI/UX work.** For anything user-facing, exercise the actual feature (start the app, interact with it) before reporting success — passing type checks or unit tests verifies correctness of code, not correctness of experience.

---

## 3. Security — access control & least privilege

Discipline: **information security / access control**, specifically the principle of least privilege and change-authorization control found in frameworks such as ISO/IEC 27001 and NIST SP 800-53 (access control family).

Do not unilaterally provision any privileged access path — debug bridges, backend doors, or equivalent — without explicit authorization from the project owner. If diagnosing a defect appears to require this class of access, stop and request authorization first. Do not enable it preemptively, present it as a fait accompli, or reclassify it as "temporary" or "diagnostic" to sidestep this control.

---

## 4. Code Hygiene, Naming & Structure — records & configuration management

Discipline: **records management and information architecture** (the classification, naming, and lifecycle-maintenance practices formalized in ISO 15489) applied to source code, combined with standard **software configuration management** practice (naming-convention and code-organization guidance as codified in style guides such as Google's engineering style guides and Clean Code's naming principles).

Structuring, organizing, segmenting, naming, and classifying files, folders, and code is **mandatory and non-negotiable**, regardless of deadline, urgency, or how small a change seems. A quick fix does not excuse misplacing a file, reusing a misleading identifier, or leaving a new symbol unclassified "for now."

Hygiene, ownership clarity, coherence, and — above all — **consistency** (of naming, of structure, and of process) are a standing priority that no task, deadline, or request implicitly waives. If a request would require violating this, flag the conflict before proceeding rather than complying silently.

The rest of this section makes that mandate concrete: where a new file or folder goes, what it must be named, and what is and isn't allowed to exist as a standalone file — rather than leaving "structure it properly" as an unstructured instruction. Populate the tables and examples below with this project's own conventions the first time this template is adopted; keep the structure (taxonomy → naming → persistent-documentation homes → new-top-level-entry gate) intact.

### 4.1 Directory taxonomy — where a new file goes

Every codebase should be organized by **purpose**, not by file type. Before creating anything, classify what you're building against a table like this one and place it in the matching existing directory — never guess, and never default to wherever feels adjacent to the thing you're already touching. Fill in the left column with this project's actual purpose categories and the right column with its actual directories; keep the row for tests and fixtures, which almost every project needs:

| Purpose | Location |
|---|---|
| *(e.g. app-wide singleton services with no UI)* | *(e.g. `src/core/`)* |
| *(e.g. a self-contained product feature's components and logic)* | *(e.g. `src/features/<feature>/`)* |
| *(e.g. reusable hooks/composables)* | *(e.g. `src/hooks/`)* |
| *(e.g. UI/constants/utilities reused across more than one feature)* | *(e.g. `src/shared/`)* |
| *(e.g. generic, framework-agnostic utility functions)* | *(e.g. `src/utils/`)* |
| Every automated test | Wherever this project's testing convention places them (colocated with source, or centralized — pick one and apply it everywhere) |
| Golden/reference fixtures a test compares against | A dedicated fixtures directory beside the tests |

**Decision procedure, in order:**
1. Does an existing directory already match this artifact's purpose by the table above? Use it.
2. Is it a genuinely new *kind* of purpose the table doesn't cover (not just a new instance of an existing kind)? Then creating a new top-level directory is itself a structural decision — flag it and get confirmation before creating it (per the general hygiene mandate above), rather than deciding unilaterally.
3. Never create a "misc," "helpers," "common," or "stuff" catch-all directory. If something doesn't fit the existing taxonomy, that is a signal to ask, not to invent a dumping ground.

### 4.2 Naming conventions — how a new file is named

Naming is not a stylistic afterthought; a misleading or inconsistent name is a hygiene violation on the same footing as a misplaced file. Define, and then hold to, an explicit convention per artifact type this project has — for example:

- **UI components:** a consistent casing convention, named after the component/export itself.
- **Hooks/composables:** a consistent prefix (`use`, or the framework's equivalent), named after the state/behavior they encapsulate.
- **Plain modules:** named after the single responsibility of the module, not after the ticket, task, or person that produced it.
- **Domain entities with a stable identifier** (e.g. per-item configuration files keyed to a real-world id): the identifier's canonical spelling and casing, used identically everywhere it appears — never a second spelling for the same entity.
- **Tests:** a name that makes the test's subject identifiable without opening the file.
- **Fixtures:** named after their subject, living beside/under the tests that use them, never inline-duplicated elsewhere.
- **Localized variants of the same data:** the exact same base name as the source-language file, distinguished only by a locale suffix, in the same directory.

### 4.3 Persistent documentation — where it lives, and what "persistent" means

This is the rule that exists specifically to stop notes, logs, and one-off summaries from accumulating across the repo over time.

**A finding, decision, or piece of reasoning that must survive the current task belongs in exactly one of these, and nowhere else:**
1. **A code comment**, at the exact line the reasoning concerns, when the point is "why this specific line is the way it is."
2. **The commit message**, when the point is "why this change was made" and doesn't need to be visible to someone just reading the code later.
3. **An existing, purpose-named reference document already living beside the code it documents.** Extend one of these when the new information belongs to its existing subject, rather than starting a new file.
4. **A new reference document**, only when the information is a genuine, reusable deliverable with a clear subject and no existing home for it — named after that subject (not "notes" or "log"), placed beside the code it documents, and only after flagging its creation to the project owner, since a new standalone doc is a structural addition, not an incidental byproduct of the task at hand.

**What must never happen, because this is the specific failure mode this rule exists to prevent:**
- Creating files like `NOTES.md`, `TODO.md`, `progress.md`, `fix-log.md`, `investigation.md`, `summary.md`, or any other generically-named scratch or status file inside the repository, at any location, for any reason. If you want to remember something across steps of the same task, use an out-of-repository scratch location — never a tracked file.
- Leaving a diagnostic-only script or test in the tree after it has served its verification purpose (see §2.4). A temporary diagnostic test, a debug-only trace, or a hand-rolled reproduction script is deleted before the task is considered done — it does not get committed "just in case," and it is never a substitute for one of the four permanent homes above.
- Writing the same finding into more than one of the above without reason — pick the one destination that fits, rather than a code comment *and* a new doc *and* a chat explanation of the same fact.

### 4.4 New top-level files and directories

The repository root and the top level of the source tree are reserved for canonical, whole-project artifacts (a README, this rules file, and the top-level source directories in §4.1). Adding anything new at either level — a new root document, a new top-level source directory — is a structural decision on the same footing as changing the taxonomy itself: flag it and get confirmation before creating it, don't add it as a side effect of an unrelated task.

**Maintenance cadence (lifecycle management):** run a project restructuring/audit skill (if one exists) and a code-audit pass on a regular cadence — as a floor, every ~50 commits — to prevent structural drift from accumulating. This is scheduled maintenance, analogous to a records-retention review, not something to defer until requested.

**Standing exceptions:** any file or module the project owner designates off-limits should be listed here explicitly (path, scope of what's covered, and the exact condition under which it may be touched). Do not touch such files outside that condition, even for this maintenance cadence, an unrelated defect fix, or an adjacent "quick" change.

---

## 5. Change Scope Discipline

Discipline: **change management** — keeping each change unit minimal, reviewable, and traceable to a single intent, per standard configuration-management practice.

1. **Match the diff to the request.** Do not bundle unrelated refactors, renames, or "while I'm here" cleanups into a change whose purpose is something else — file such improvements as their own follow-up instead.
2. **No speculative generality.** Do not add abstractions, configuration options, or extensibility hooks for hypothetical future needs. Build for the requirement in front of you.
3. **Keep commits atomic and their messages accurate.** A commit message describes what actually changed and why; it is not aspirational or a summary of unrelated work swept in alongside.
4. **When a fix surfaces a second, adjacent issue**, decide deliberately whether it belongs in the same change (it directly blocks correctness) or a separate one (it is independently valuable but not required) — and say which, rather than silently expanding scope either way.

---

## 6. Design System — design-token governance

Discipline: **design-token systems**, the standard mechanism (used across major design systems, e.g. Material Design, Salesforce Lightning) for enforcing a single source of truth for spacing, sizing, and typography scales, ensuring pixel-accurate consistency across a UI.

> Define a single numeric scale for the project. This template uses "PerfectSuite" as an example instance — swap in the project's own scale if different, but keep the same enforcement structure below.

Every numeric dimension in the app — font-size, width, height, padding, margin, gap, icon size, border-radius input, anything measured in px — **must** resolve to one of the scale's defined values. Example scale organized in three tiers per power-of-2 octave — `[Primary]`, `(Secondary)`, `{Tertiary}`:

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

No other number is permitted. This applies to existing code as well as new code — when an off-scale value is touched, correct it to the nearest scale value as part of that change rather than leaving it.

**Before setting any dimension:**
- Never assume a default utility class is compliant — verify its computed px value against the defined scale. A framework's default spacing/typography scale will often not map cleanly onto a project's own token system.
- If a token (`--font-*`, `--size-*`, `--space-*`, etc.) already resolves to a scale value, use it — this is the token layer doing its job.
- If the nearest existing token is off-scale, either correct the token (when the change should propagate to every usage) or apply an explicit, scoped override for just that element (when the change is local only).

### 6.1 Rounding priority (tie-breaking)

When correcting an off-scale value, round to the mathematically nearest scale value. When two candidates are **equidistant**, resolve the tie by a defined priority order. Example, for the PerfectSuite scale above — **Nearest beats Primary beats Secondary beats Tertiary**:

- **`[Primary]`** (base 2): `1, 2, 4, 8, 16, 32, 64, 128, 256, 512, 1024`
- **`(Secondary)`** (base 2 intermediate — the midpoint between two consecutive primaries): `3, 6, 12, 24, 48, 96, 192, 384, 768`
- **`{Tertiary}`** (base 2 additional — sum of the primary steps below the next primary, e.g. `8+4+2=14`, `16+8+4+2=30`): `14, 30, 62, 126, 254, 510, 1022`

Worked examples:
- `10` → tie between `8` (primary) and `12` (secondary), both distance 2 → primary wins → **8**
- `13` → tie between `12` (secondary) and `14` (tertiary), both distance 1 → secondary wins → **12**
- `15` → tie between `14` (tertiary) and `16` (primary), both distance 1 → primary wins → **16**
- `11` → `12` is distance 1, `8` is distance 3 → not a tie, nearest wins → **12**
- `17` → `16` is distance 1, `24` is distance 7 → not a tie, nearest wins → **16**

This can and will collapse previously-distinct values onto the same scale number (e.g. two font sizes both rounding to `12`) — that is an accepted outcome of strict scale compliance, not a bug to work around by picking a different rounding.

### 6.2 Exception — values above the first primary-doubling threshold

For a value greater than the scale's second primary step (e.g. `16` in the example scale), do not snap to the single nearest scale number. Instead: take the nearest `[Primary]` at or below the value, then add another `[Primary]` on top to close the remaining gap as tightly as possible.

- Example (PerfectSuite scale): `150` → nearest primary at/below is `128`; `128 + 16 = 144` is the closest reachable primary+primary sum → **144**.

### 6.3 Corner radius

Define a formula relating radius to a component's own dimensions, e.g. `radius = 0.24 × the element's height`, then round to the nearest scale value (apply the tie-break priority in §6.1).

### 6.4 Aspect ratios — preferred, not mandatory

Define a short priority list of preferred aspect ratios to reach for — not a hard constraint; apply engineering judgment rather than forcing a mismatch. Example: `3:2`, `4:3`, `5:4`, `3:1` (the last reserved for wide/short bars).

### 6.5 Design objectives behind the design-token system

Standardization · coherency · consistency · pixel-accurate precision · symmetry · disciplined aesthetic proportion · deliberate, documented art-direction decisions — never a default or "close enough" value.

---

## 7. Project-Specific Standards

Use this section to record any reference proportions, component precedents, or exceptions unique to this project (e.g. header/navbar reference dimensions, known off-scale tokens not yet fixed, other standing exceptions). Keep such content isolated here so it stays easy to identify and to strip out when reusing this document as a template for a different project.
