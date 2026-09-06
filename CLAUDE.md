# Whispering Wishes — Project Rules

Read this before making any code, UI, or styling change. These are hard rules, not suggestions — do not bypass them by reaching for a default Tailwind class, an arbitrary one-off pixel value, a "close enough" number, or a lazy workaround.

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
- Naming and structure of anything touched or added conform to §4.

### 1.7 Skill usage — invoke the right skill proactively, don't wait to be asked

This project defines six skills under `claude_skill/`, each scoped to a distinct kind of work. Recognizing which situation calls for which skill — and invoking it without waiting for the user to name it — is itself part of doing the work well; treating them as optional extras that only run when explicitly requested is how audits get skipped and drift accumulates.

| Skill | File | Invoke when |
|---|---|---|
| `app-audit` | `claude_skill/app-audit-SKILL.md` | A broad, cross-cutting review is called for — security, performance, UX, accessibility, i18n, architecture, "review before launch," "my app feels incoherent," or any request to evaluate the app as a whole rather than one change. |
| `code-audit` | `claude_skill/code-audit-SKILL.md` | Code-level quality is the concern specifically — naming, dead code, duplication, architecture, logic correctness, state management, error handling, async patterns, type safety. This is the skill the §4.9 maintenance cadence's "code-audit pass" refers to; name it explicitly rather than performing an ad hoc, unscoped review. |
| `app-restructuring` | `claude_skill/app-restructuring-SKILL.md` | The work is actual structural change — file/folder reorganization, module-boundary redefinition, splitting a god file (§4.5), consolidating shared code, or anything else in §4 that goes beyond auditing into rearranging. |
| `design-aesthetic-audit` | `claude_skill/design-aesthetic-audit-SKILL.md` | The concern is visual/aesthetic quality specifically — color, typography, motion, visual hierarchy, "make it feel premium," matching a named reference aesthetic — as distinct from the numeric design-token compliance in §7, which is mechanical rather than aesthetic judgment. |
| `art-direction-engine` | `claude_skill/art-direction-engine-SKILL.md` | A new UI, component, or visual theme is being built from scratch and needs an original, distinctive look rather than a default pattern — not for auditing existing UI (that's `design-aesthetic-audit`). |
| `scope-context` | `claude_skill/scope-context-SKILL.md` | A request targets multiple instances across files ("all X," "every Y," "standardize Z") or is spatially/referentially ambiguous ("the box," "make it bigger") — before guessing at scope or referent, run this skill's disambiguation process instead. |

**How this interacts with the rest of this document:**
- The §4.9 maintenance cadence ("every ~50 commits") is the *floor* for `app-restructuring` and `code-audit` — either can and should run sooner when a specific trigger above is hit mid-task, not only on the fixed cadence.
- Running the wrong skill (e.g. a broad `app-audit` when the actual concern is narrowly a naming/dead-code pass better served by `code-audit`) wastes the same effort §5 (Change Scope Discipline) warns against — match the skill to the actual scope of concern, not the biggest hammer available.
- These skills are companions to, not substitutes for, §1.6 (ask rather than assume): a skill's own verification gates do not remove the obligation to flag a genuinely ambiguous or high-stakes call to the user.

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

Do not unilaterally provision any privileged access path — debug bridges (e.g. USB debugging), backend doors, or equivalent — without explicit authorization from the project owner. If diagnosing a device-specific defect appears to require this class of access, stop and request authorization first. Do not enable it preemptively, present it as a fait accompli, or reclassify it as "temporary" or "diagnostic" to sidestep this control.

---

## 4. Code Hygiene, Naming & Structure — records & configuration management

Discipline: **records management and information architecture** (the classification, naming, and lifecycle-maintenance practices formalized in ISO 15489) applied to source code, combined with standard **software configuration management** practice (naming-convention and code-organization guidance as codified in style guides such as Google's engineering style guides and Clean Code's naming principles).

Structuring, organizing, segmenting, naming, and classifying files, folders, and code is **mandatory and non-negotiable**, regardless of deadline, urgency, or how small a change seems. A quick fix does not excuse misplacing a file, reusing a misleading identifier, or leaving a new symbol unclassified "for now."

Hygiene, ownership clarity, coherence, and — above all — **consistency** (of naming, of structure, and of process) are a standing priority that no task, deadline, or request implicitly waives. If a request would require violating this, flag the conflict before proceeding rather than complying silently.

The rest of this section makes that mandate concrete: where a new file or folder goes, what it must be named, and what is and isn't allowed to exist as a standalone file — rather than leaving "structure it properly" as an unstructured instruction.

### 4.1 Directory taxonomy — where a new file goes

The codebase is already organized by **purpose**, not by file type. Before creating anything, classify what you're building against this table and place it in the matching existing directory — do not guess, and do not default to wherever feels adjacent to the thing you're already touching.

| Purpose | Location | Example |
|---|---|---|
| Per-character damage-engine logic (TriggerBlocks) | `app/src/engine/characterBlocks/` | `aalto.blocks.js` |
| Engine math, schema, and resolution logic shared across all characters | `app/src/engine/{math,schema,resolver}/` | `damageFormula.js`, `block.schema.js` |
| Static/reference data tables (characters, weapons, echoes, banners) | `app/src/data/` | `characters.js`, plus a `.fr.js` sibling for the French localization of the same table |
| Sourced raw reference material for a character (patch notes, kit text, drop rates) — not code | `Data dump/<Character>/<Character>.md` | `Data dump/Aalto/Aalto.md` |
| App-wide singleton services with no UI (storage, reducer, time, feature flags) | `app/src/core/` | `storage.js`, `reducer.js` |
| A self-contained product feature's components and feature-local logic | `app/src/features/<feature>/` | `features/teams/TeamsTab.jsx`, `features/teams/calcEngine.js` |
| Reusable React hooks (state/effect logic used by more than one place) | `app/src/hooks/` | `useTabNavigation.js` |
| React context providers | `app/src/providers/` | `ToastProvider.jsx` |
| UI components, constants, or utilities reused **across more than one feature** | `app/src/shared/` | `shared/components/`, `shared/constants/` |
| Generic, framework-agnostic utility functions (no React, no app state) | `app/src/utils/` | `generateId.js` |
| Global stylesheets | `app/src/styles/` | `kuro.css` |
| Every automated test, regardless of what it tests | `app/src/__tests__/` (colocated centrally — this repo does not colocate tests next to source) | `triggerEngine-aalto.test.js` |
| Golden/reference fixtures a test compares against | `app/src/__tests__/__fixtures__/` | `phase3-parity-golden.json` |

**Decision procedure, in order:**
1. Does an existing directory already match this artifact's purpose by the table above? Use it.
2. Is it a genuinely new *kind* of purpose the table doesn't cover (not just a new instance of an existing kind, like a new character or a new feature)? Then creating a new top-level directory is itself a structural decision — flag it and get confirmation before creating it (per the general hygiene mandate above), rather than deciding unilaterally.
3. Never create a "misc," "helpers," "common," or "stuff" catch-all directory. If something doesn't fit the existing taxonomy, that is a signal to ask, not to invent a dumping ground.

### 4.2 Naming conventions — how a new file is named

Naming is not a stylistic afterthought; a misleading or inconsistent name is a hygiene violation on the same footing as a misplaced file.

- **React components:** `PascalCase.jsx`, named after the component they export (`TeamsTab.jsx` exports `TeamsTab`).
- **Hooks:** `useCamelCase.js`, always prefixed `use`, named after what state/behavior they encapsulate (`useTabNavigation.js`).
- **Plain modules (utils, core services, engine logic):** `camelCase.js`, named after the single responsibility of the module, not after the ticket, task, or person that produced it.
- **Per-character engine blocks:** the character's identifier in lowercase, exactly matching its existing id elsewhere in the data layer, suffixed `.blocks.js` (`cartethyia.blocks.js`). Never introduce a second spelling or casing for the same character.
- **Tests:** `<subjectCamelCase>.test.js` for a unit/integration test of a specific module (`rotationSimulator.test.js`); the established `triggerEngine-<lowercasecharname>.test.js` pattern for a character's trigger-block regression test. A new test's name must make its subject identifiable without opening the file.
- **Fixtures:** `<subject>-golden.json`, living in `__fixtures__/`, never inline-duplicated elsewhere.
- **Localized data:** a `.fr.js` (or other locale) suffix on the exact same base name as the source-language file, in the same directory — never a separately-organized locale tree for `data/`.

### 4.3 Persistent documentation — where it lives, and what "persistent" means

This is the rule that exists specifically to stop notes, logs, and one-off summaries from accumulating across the repo over time.

**A finding, decision, or piece of reasoning that must survive the current task belongs in exactly one of these, and nowhere else:**
1. **A code comment**, at the exact line the reasoning concerns, when the point is "why this specific line is the way it is" (e.g. the Camellya chain-scoping investigation documented inline in `phase3-parityGolden.test.js`'s `EXPECTED_DIVERGENCES` entry).
2. **The commit message**, when the point is "why this change was made" and doesn't need to be visible to someone just reading the code later.
3. **An existing, purpose-named reference document already living beside the code it documents** — the established pattern in this repo is a doc named after its exact subject, colocated with what it describes (`engine/characterBlocks/CONTRIBUTING.md` for block-authoring conventions, `features/teams/CALC_TEAM_STATS_DEPENDENCY_MAP.md` for that module's dependency graph). Extend one of these when the new information belongs to its existing subject.
4. **A new reference document**, only when the information is a genuine, reusable deliverable with a clear subject and no existing home for it — named after that subject (not "notes" or "log"), placed beside the code it documents (following the pattern in point 3), and only after flagging its creation to the user, since a new standalone doc is a structural addition, not an incidental byproduct of the task at hand.

**What must never happen, because this is the specific failure mode this rule exists to prevent:**
- Creating files like `NOTES.md`, `TODO.md`, `progress.md`, `fix-log.md`, `investigation.md`, `summary.md`, or any other generically-named scratch or status file inside the repository, at any location, for any reason. If you want to remember something across steps of the same task, use the session's own scratchpad directory (outside the repository) — never a tracked file.
- Leaving a diagnostic-only script or test in the tree after it has served its verification purpose (see §2.4). A temporary `zzz-diag-*.test.js`, a debug-only `throw`, or a hand-rolled reproduction script is deleted before the task is considered done — it does not get committed "just in case," and it is never a substitute for one of the four permanent homes above.
- Writing the same finding into more than one of the above without reason — pick the one destination that fits, rather than a code comment *and* a new doc *and* a chat explanation of the same fact.

### 4.4 Module boundaries — allowed dependency directions

A directory taxonomy only holds if files placed correctly are also only *importing* from directories they're allowed to depend on. Without this, `core/` can end up importing from `features/`, two features can couple to each other directly, and the whole taxonomy in §4.1 becomes decorative. The allowed dependency graph, layered bottom-up:

```
utils/  →  (depends on nothing else in src/)
core/, data/, engine/*  →  utils/
hooks/, providers/  →  core/, data/, engine/*, utils/
shared/  →  hooks/, providers/, core/, data/, engine/*, utils/
features/<feature>/  →  shared/, hooks/, providers/, core/, data/, engine/*, utils/
```

Concretely:
- **A lower layer never imports from a higher one.** `core/`, `data/`, and `engine/` must never import anything from `features/`, `shared/`, `hooks/`, or `providers/`. If a lower-layer module seems to need something from a higher layer, that's a sign the shared piece belongs in the lower layer instead — move it down, don't import up.
- **`shared/` never imports from a specific feature.** The moment `shared/` depends on `features/teams/`, it is no longer shared — either the code isn't actually generic and belongs in that feature, or the feature-specific part must be extracted out before the rest can move to `shared/`.
- **One feature never imports another feature's internals directly** (`features/teams/` reaching into `features/planner/`'s files). Cross-feature reuse goes through `shared/`, promoting the reused piece there first.
- **Engine internals stay internal to the engine.** Code outside `engine/` interacts with it through its existing entry points (e.g. `characterBlocks/index.js`, `engine/math/index.js`), not by reaching into `engine/resolver/` or `engine/schema/` files it doesn't own.

When in doubt about which layer a file belongs to, its allowed imports are the answer: a module that needs to import from `features/` cannot live in `core/`, `data/`, or `engine/`, no matter how "core" its purpose feels.

### 4.5 File decomposition — when a file must be split

A file is a unit of hygiene, not just of code. Split a file once any of these thresholds is crossed, rather than letting it grow indefinitely:

- **It serves more than one responsibility.** If describing the file's purpose in one sentence requires "and," the responsibilities are separable — split along that seam.
- **Its tests need multiple, unrelated top-level `describe` blocks** to cover genuinely different concerns rather than different cases of the same concern. That's a proxy for the file itself covering more than one concern.
- **A change to one part of the file routinely has no effect on, and no relation to, another part of the same file.** Unrelated change-reasons are a decomposition signal (the same principle behind the Single Responsibility Principle).
- **It has grown large enough that a reader must scroll past unrelated code to find the part relevant to their task.** This is a readability failure, not a badge of thoroughness.

When splitting, keep the resulting files inside the same directory (per §4.1) unless the split reveals a genuinely new purpose category, and preserve the naming convention in §4.2 for each resulting file — a split is not an excuse for an ad hoc name.

### 4.6 Generated files and barrel/index files

- **Generated output is never hand-edited.** Anything under a `generated/` directory (e.g. `app/src/data/generated/`) is build output from an explicit generation step. If it needs to change, change the generator and regenerate — editing the output directly creates silent drift the next time it's regenerated, and is treated as a hygiene violation, not a shortcut.
- **`index.js` barrel files re-export; they do not implement.** The established pattern in this repo (`engine/characterBlocks/index.js`, `engine/math/index.js`) is aggregation only — collecting and re-exporting the real modules in that directory. New logic never gets written directly into a barrel file; it goes into a properly named module that the barrel then re-exports.

### 4.7 Deprecation and deletion — retiring a file or dead code correctly

Removing code is as much a structural act as adding it, and gets the same rigor rather than being treated as a free action:

1. **Confirm zero remaining references** before deleting a file or export — search the codebase, don't rely on memory of what you think still uses it (per §1.2, corroborate before acting).
2. **Migrate consumers first, delete second**, in that order within the same piece of work — never leave a codebase in a state where both the old and new paths are live "just in case" beyond the migration itself.
3. **No commented-out code as a soft delete.** Dead code is removed outright; version control, not a comment block, is the record of what used to be there. A comment explaining *why* something was removed is fine; the removed code left in place as a comment is not.
4. **A deletion that removes an entire file's worth of exports is its own reviewable change** (see §5, Change Scope Discipline) unless it's the direct, necessary conclusion of the migration it follows.

### 4.8 New top-level files and directories

The repository root and `app/src/` top level are reserved for canonical, whole-project artifacts (e.g. `README.md`, `IDENTITY.md`, `GAME_TAXONOMY.md`, `CLAUDE.md`, and the top-level source directories in §4.1). Adding anything new at either level — a new root `.md` file, a new top-level `src` directory — is a structural decision on the same footing as changing the taxonomy itself: flag it and get confirmation before creating it, don't add it as a side effect of an unrelated task.

### 4.9 Enforcement — structural rules should be checkable, not just followed

Prose discipline alone is a weaker guarantee than a rule a tool can actually verify. Where practical, back the rules above with something mechanical rather than relying solely on manual compliance:

- A lint rule or dependency-boundary checker (e.g. an ESLint `no-restricted-imports`/import-boundary configuration, or a dependency-graph tool) to catch a §4.4 layering violation automatically.
- A naming-convention check (already precedented by this repo's own `checkCharacterBlockNaming.test.js`) extended to cover other artifact types from §4.2 as they're introduced.
- Treating the absence of such tooling as a gap to close during the maintenance cadence below, not a permanent excuse to fall back on discipline alone.

**Maintenance cadence (lifecycle management):** run the `app-restructuring` skill (`claude_skill/app-restructuring-SKILL.md`) and a code-audit pass on a regular cadence — as a floor, every ~50 commits — to prevent structural drift from accumulating. This is scheduled maintenance, analogous to a records-retention review, not something to defer until requested.

### Standing exception — MapTab *(Whispering-Wishes-specific)*

Do not modify `MapTab.jsx` or anything connected to it (its hooks, sub-components, map-specific state/utilities) for any reason — including this maintenance cadence, an unrelated defect fix, or an adjacent "quick" change — except under direct, explicit, unambiguous instruction to do so.

---

## 5. Change Scope Discipline

Discipline: **change management** — keeping each change unit minimal, reviewable, and traceable to a single intent, per standard configuration-management practice.

1. **Match the diff to the request.** Do not bundle unrelated refactors, renames, or "while I'm here" cleanups into a change whose purpose is something else — file such improvements as their own follow-up instead.
2. **No speculative generality.** Do not add abstractions, configuration options, or extensibility hooks for hypothetical future needs. Build for the requirement in front of you.
3. **Keep commits atomic and their messages accurate.** A commit message describes what actually changed and why; it is not aspirational or a summary of unrelated work swept in alongside.
4. **When a fix surfaces a second, adjacent issue**, decide deliberately whether it belongs in the same change (it directly blocks correctness) or a separate one (it is independently valuable but not required) — and say which, rather than silently expanding scope either way.

---

## 6. App & Feature Development — functional completeness

Discipline: **requirements engineering and interaction design** — specifically the *completeness* criterion for a well-formed requirement (ISO/IEC/IEEE 29148: a requirement set is incomplete if it omits functionality the user needs but didn't think to state explicitly), combined with the standard interaction-design practice of matching a UI request to its recognized **component archetype** rather than only its literal wording, and with Nielsen's usability heuristics — in particular *user control and freedom* and *consistency and standards*, which are exactly what's missing when a feature is built with no way to operate it fully.

This section exists because a request named after a familiar kind of feature ("a color selector," "a music player," "a settings panel") carries an implicit spec far larger than its literal words: real-world convention already defines what that archetype minimally includes. Implementing only the literally-named mechanic and skipping the rest is an **incompleteness defect** — a feature is not done because it compiles and shows something; it is done when it satisfies the implicit requirements of the archetype the user actually asked for, per Definition of Done (§1.1) and §2 (verification against real execution) — not just its most literal reading.

### 6.1 Resolve the request to its component archetype before building

Before writing any code for a named feature, identify what that request actually names: a recognized class of UI/interaction pattern with well-established conventions, not just the single mechanic that makes it distinctive. Two features can share a name and still differ in exact needs, but the baseline set below is what makes something recognizable as that archetype at all — omitting from it isn't a smaller version of the feature, it's a different, broken thing wearing its name.

Representative examples (non-exhaustive — apply the same reasoning to any archetype not listed):

| Requested feature | The literal, distinctive mechanic | The implicit baseline the archetype also requires |
|---|---|---|
| "A color selector/picker" | A way to choose a color value | A trigger to open it, a way to confirm/apply the choice, a visible current-value indicator, and a wired destination that actually receives the chosen value |
| "A music/audio player" | Play/pause of a track | Volume control, a way to mute, a progress/seek indicator, and the actual audio source wired in — a player with nothing to play is not a player |
| "A settings panel" | The individual settings/toggles | A way to open/close or navigate to it, persistence of the choices made, and each setting actually wired to the behavior it claims to control |
| "A form" | The input fields | Validation feedback, a submit action, a cancel/dismiss path, and a wired destination for the submitted data |
| "A modal/dialog" | The content inside it | An open trigger, a close affordance (explicit control, not just an assumed outside-click), and a defined return path for whatever the modal was for |

### 6.2 Verify data flow end-to-end, not just the presence of a control

A control that exists but does nothing, or a value that is produced but never consumed, is exactly the same class of defect as a missing control — both leave the feature functionally incomplete. Before calling a feature done:
1. Trace the full path from user input to observable effect (a color chosen is applied and/or stored somewhere real; a volume slider actually changes the audio output level; a submitted form actually reaches its destination).
2. Confirm there is no dangling half: no UI control with no wired effect, and no wired capability with no UI control to reach it.
3. This is the feature-level instance of §2.1/§2.5 (verify against real execution; a passing build is not evidence the feature works) — exercise the actual interaction, don't infer wiring from the code looking plausible.

### 6.3 This is not a license for scope creep — reconcile with §5

§5.2 ("no speculative generality... build for the requirement in front of you") and this section are not in tension, and neither overrides the other:

- **§5.2 forbids building for hypothetical future requirements** — options, hooks, or abstractions nothing currently asks for.
- **§6 requires building the actual current requirement completely** — the baseline parts in §6.1 are not hypothetical or future; they are already implied by the feature the user named, whether or not they said each part out loud. Skipping them isn't restraint, it's under-delivery against what was actually asked.

The line between the two: if a real-world instance of the named archetype would be considered broken or unusable without a part, that part is in scope now, per §6.1 — not a speculative extra.

### 6.4 When the archetype's baseline is genuinely ambiguous or intentionally reduced

If a request explicitly scopes a feature down ("just the color swatches, no picker UI yet") or the right baseline for an unfamiliar/novel archetype isn't obvious, don't guess silently in either direction — per §1.6, ask, and state explicitly which parts of the usual baseline are being deliberately deferred and why, so the gap is a documented decision rather than an unnoticed omission.

---

## 7. Design System — design-token governance (PerfectSuite numeric scale)

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

### 7.1 Rounding priority (tie-breaking)

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

### 7.2 Exception — values above 16px

For a value greater than `16`, do not snap to the single nearest suite number. Instead: take the nearest `[Primary]` at or below the value, then add another `[Primary]` on top to close the remaining gap as tightly as possible.

- Example: `150` → nearest primary at/below is `128`; `128 + 16 = 144` is the closest reachable primary+primary sum → **144**.

### 7.3 Corner radius

`radius = 0.24 × the element's height`, rounded to the nearest PerfectSuite value (apply the tie-break priority in §7.1).

### 7.4 Aspect ratios — preferred, not mandatory

Unlike the PerfectSuite scale, these ratios are a **priority list to reach for**, not a hard constraint — apply engineering judgment rather than forcing a mismatch:

`3:2`, `4:3`, `5:4`, `3:1` (the last reserved for wide/short bars — header, navbar, and similar).

### 7.5 Design objectives behind the design-token system

Standardization · coherency · consistency · pixel-accurate precision · symmetry · disciplined aesthetic proportion · deliberate, documented art-direction decisions — never a default or "close enough" value.

---

## 8. Project-Specific Standards *(Whispering-Wishes-specific)*

### 8.1 Header / Navbar

Visually 192px wide × 64px tall (both PerfectSuite values), even though the actual implementation is responsive/fluid rather than hard-coded — treat 192×64 as the reference proportions when sizing anything meant to align with the header/nav.

### 8.2 Precedent already in the codebase

- Nav icons: `w-4 h-4` (16px), `w-6 h-6` (24px) — still compliant under the updated suite.
- Nav profile button: `w-[48px] h-[48px]` — still compliant.
- `--size-icon-btn: 28px` (kuro.css) — **no longer compliant** under the updated suite (28 was tertiary in the old scale; the new tertiary tier no longer includes it — nearest is now `30`). Flagged here, not yet fixed in code — treat as a normal off-suite value the next time this token is touched.
