# Full Deep Audit Plan — P6: Visual Design & Polish (Companion Mode)
## Whispering Wishes v3.2.3

---

## Audit Scope

This plan covers a **complete, exhaustive, zero-omission audit** of the visual design and polish of Whispering Wishes, using three skill documents as governing frameworks:

1. **app-audit-SKILL.md** — §E1 through §E10 (Category E: Visual Design Quality & Polish)
2. **design-aesthetic-audit-SKILL.md** — Full companion mode (§DS1-DS2, §DP0-DP2, §DC1, §DBI3, and all remaining sections)
3. **art-direction-engine-SKILL.md** — Complete coverage (§BRIEF, §BAN, §CHECK, §COLOR, §DEPTH, §TEXTURE, §LIGHT, §SHAPE, §COMPOSITION, §TOKENS, §ATMOSPHERE, §DERIVE, typography, source/reference, anti-slop, components, interaction, brand identity, visual science, psychology, audience, platforms)

### Target Surface: All 8 Tabs
- Tracker (Banner tracking)
- Events
- Calculator
- Planner
- Stats
- Collection
- Teams
- Profile

### App Identity (Protected — Do Not Alter)
- **Style**: Dark cyberpunk-luxe / Wuthering Waves gacha tracker
- **Palette**: Deep blue-black (#080c14) backgrounds, gold (#edaf18) accent
- **Typography**: Rajdhani (display) + JetBrains Mono (data)
- **Tailwind custom gray scale**: Cool-tinted chromatic grays (f5f7fa → 0c1018)
- **Audience**: Wuthering Waves players (expert/enthusiast gacha community)
- **Emotional target**: Focused calm of a precision instrument with game-world atmosphere

---

## Step-by-Step Audit Plan

### STEP 1: §0 — Aesthetic Context Block + Five-Axis Profile
**Skill reference**: design-aesthetic-audit §0, app-audit §I.4

**Deliverables**:
- Extract Design Identity from code (current style, intended style, personality, protected elements)
- Fill Five-Axis Quick Profile:
  - A1: Commercial intent
  - A2: Use context
  - A3: Audience
  - A4: Subject identity
  - A5: Aesthetic role
- Document the axis profile that will govern ALL subsequent findings

**Coverage**: Complete §0, complete §I.4 (all 5 axes)

**Commit checkpoint**: After step completion

---

### STEP 2: §DS1 + §DS2 — Style Classification & Coherence
**Skill reference**: design-aesthetic-audit §DS1, §DS2

**Deliverables**:
- Classify primary design school against full taxonomy (Minimal/Flat, Material/Elevation, Glassmorphism, Neo-Brutalist, Cyberpunk/Terminal, etc.)
- Identify secondary influences (0-2 styles)
- Coherence score: COHERENT / MIXED-INTENTIONAL / ACCIDENTALLY MIXED
- Style-appropriate execution assessment
- §DS2 coherence audit:
  - Consistent style vocabulary across ALL 8 tabs
  - Style inflection points (every component breaking established language)
  - Intentional tension vs accidental mixing
  - Style-appropriate detail level
  - Hardcoded value audit (hex values bypassing theme)
  - Shape system consistency

**Coverage**: Complete §DS1, complete §DS2

**Commit checkpoint**: After step completion

---

### STEP 3: §DP0 — Character Extraction
**Skill reference**: design-aesthetic-audit §DP0

**Deliverables**:
- Extract ALL current character evidence from the codebase:
  - Every color value, pattern, and relationship
  - Every typography decision (weights, sizes, tracking, line heights)
  - Every motion/animation value (durations, easings, transitions)
  - Every spatial pattern (padding, margin, gaps, radii)
  - Every depth/surface treatment (shadows, blurs, gradients, overlays)
  - Every icon usage and style
  - Every component shape and treatment
- Document what the design IS currently, not what it should be
- Cover ALL 8 tabs exhaustively

**Coverage**: Complete §DP0 extraction

**Commit checkpoint**: After step completion

---

### STEP 4: §DP1 + §DP2 — Character Dimensions & Brief
**Skill reference**: design-aesthetic-audit §DP1, §DP2

**Deliverables**:
- §DP1: Analyze character along all dimensions:
  - Temperature (warm ↔ cool)
  - Weight (light ↔ heavy)
  - Speed (fast ↔ slow)
  - Formality (formal ↔ casual)
  - Complexity (simple ↔ complex)
  - Age (contemporary ↔ timeless)
  - Energy (calm ↔ energetic)
- §DP2: Produce the Character Brief:
  - Character in one sentence
  - Character keywords (3-5)
  - Character "never" list
  - What makes it distinctive
  - What threatens its character
  - Audience emotional expectation

**Coverage**: Complete §DP1, complete §DP2

**Commit checkpoint**: After step completion

---

### STEP 5: §DC1 — Perceptual Color Architecture
**Skill reference**: design-aesthetic-audit §DC1, §DC2

**Deliverables**:
- Full perceptual color analysis in OKLCH:
  - Background layer analysis (hue, chroma, temperature)
  - Surface layer progression (lightness steps, hue shifts)
  - Text color chromaticity assessment
  - Accent color calibration (peak chroma for hue?)
  - Semantic color calibration (error/success/warning vs palette)
- §DC2: Complete palette role inventory (table with every token/role/value/assessment)
- Color temperature coherence mapping
- Near-duplicate color consolidation candidates
- Accent overload assessment

**Coverage**: Complete §DC1, complete §DC2

**Commit checkpoint**: After step completion

---

### STEP 6: §DC3 + §DC4 + §DC5 — Dark Mode, Brand Color, Color Narrative
**Skill reference**: design-aesthetic-audit §DC3, §DC4, §DC5

**Deliverables**:
- §DC3: Dark mode craft assessment:
  - Surface elevation-as-lightness system audit
  - Surface 0/1/2/3 lightness progression
  - Common dark mode failures check
  - OLED considerations
- §DC4: Brand color distinctiveness:
  - Hue ownership in competitive landscape
  - Calibration signature assessment
  - Icon → accent coherence
  - Competitive hue mapping (WuWa trackers)
- §DC5: Color as narrative:
  - Gradient design audit (every gradient, what argument it makes)
  - Tension color assessment
  - Color state narrative mapping (onboarding → engagement → achievement → error → empty)
  - Color harmony system identification

**Coverage**: Complete §DC3, complete §DC4, complete §DC5

**Commit checkpoint**: After step completion

---

### STEP 7: §DBI1 + §DBI3 — Brand Archetype & Anti-Genericness
**Skill reference**: design-aesthetic-audit §DBI1, §DBI3

**Deliverables**:
- §DBI1: Brand archetype identification
  - Map to archetype (Creator, Explorer, Sage, etc.)
  - Archetype-visual language alignment
- §DBI3: Anti-genericness audit (CRITICAL):
  - Every visual element that makes the app interchangeable with generic trackers
  - For EACH generic element: specific minimal change to make it distinctly THIS app
  - Default palette detection
  - Default component style detection
  - Default layout convention detection
  - Assessment across ALL 8 tabs

**Coverage**: Complete §DBI1, complete §DBI3

**Commit checkpoint**: After step completion

---

### STEP 8: §E1 — Design Token System
**Skill reference**: app-audit §E1

**Deliverables**:
- Spacing scale audit (list every one-off value)
- Color palette architecture (near-duplicate colors, token debt)
- Typography scale (every unique font-size, coherent scale check)
- Font weight semantics (consistent purpose per weight?)
- Border radius system (consistent per component type?)
- Shadow hierarchy (scale or arbitrary?)
- Z-index governance (every z-index value, collision check)
- Animation token set (consistent durations/easings?)
- Token naming quality (semantic vs presentational)
- CSS custom property coverage

**Coverage**: Complete §E1 across ALL source files

**Commit checkpoint**: After step completion

---

### STEP 9: §E2 — Visual Rhythm & Spatial Composition
**Skill reference**: app-audit §E2

**Deliverables**:
- Vertical rhythm assessment across ALL 8 tabs
- Density consistency between similar components
- Alignment grid assessment
- Whitespace intention analysis
- Proportion assessment (label+value, icon+text, header+content)
- Focal point clarity per primary screen (all 8 tabs)
- Visual weight distribution per screen
- Mobile screen real estate discipline
- Edge-to-edge content assessment
- Responsive grid breakpoints

**Coverage**: Complete §E2 across ALL 8 tabs

**Commit checkpoint**: After step completion

---

### STEP 10: §E3 — Color Craft & Contrast
**Skill reference**: app-audit §E3

**Deliverables**:
- Color harmony assessment
- Dark mode craft (chromatic near-blacks vs pure neutrals)
- Accent consistency (overuse detection)
- Color temperature coherence
- WCAG contrast compliance (4.5:1 normal, 3:1 large/bold) — every text/bg combo
- Non-text contrast (3:1 WCAG 1.4.11 for UI components)
- State colors (hover/active/disabled/error/success/warning)
- Color psychology alignment with emotional target
- Color saturation calibration
- Cross-reference with §DC1-DC5 findings

**Coverage**: Complete §E3 across ALL 8 tabs

**Commit checkpoint**: After step completion

---

### STEP 11: §E4 — Typography Craft
**Skill reference**: app-audit §E4

**Deliverables**:
- Heading hierarchy clarity assessment
- Line length assessment (45-75 chars optimal)
- Line height assessment (1.4-1.6× body)
- Font pairing assessment (Rajdhani + JetBrains Mono)
- Letter spacing audit (display/heading/body/caps)
- Text rendering (-webkit-font-smoothing check)
- Label quality audit
- Typography as character signal (axis-driven)
- Type craft signals (tabular nums, tracking, OpenType)
- Cross-reference with design-aesthetic-audit §DT1-§DT4

**Coverage**: Complete §E4 across ALL 8 tabs

**Commit checkpoint**: After step completion

---

### STEP 12: §E5 — Component Visual Quality
**Skill reference**: app-audit §E5

**Deliverables**:
- **Core Interactive**: Buttons (5 states), Inputs (5 states), Checkboxes, Switches, Sliders, Dropdowns, Search
- **Container**: Cards, Modals/Dialogs, Tab bar, Bottom navigation
- **Informational**: Badges/chips/tags, Toasts, Progress indicators, Tooltips, Banners/alerts
- **Content Display**: List items, Icons, Avatars/thumbnails, Dividers, Images, Empty states, Date/time
- **Structural**: Skeleton/shimmer, RecyclerView/list visual quality
- Each component assessed for: visual consistency, state completeness, and craft
- Cover EVERY component across ALL 8 tabs

**Coverage**: Complete §E5 — every component type, every tab

**Commit checkpoint**: After step completion

---

### STEP 13: §E6 — Interaction Design Quality
**Skill reference**: app-audit §E6

**Deliverables**:
- Hover feedback audit (every interactive element)
- Active/pressed feedback
- Transition quality (deliberate and smooth?)
- Loading state quality (skeleton vs spinner)
- Animation narrative (motion tells the right story?)
- Empty state design (designed, not blank?)
- Error state design (inline, icon + text?)
- Animation as character signal (axis-driven)
- Delight moments assessment
- Physical responsiveness feel
- Cross-reference with design-aesthetic-audit §DM1-§DM5

**Coverage**: Complete §E6 across ALL 8 tabs

**Commit checkpoint**: After step completion

---

### STEP 14: §E7 — Overall Visual Professionalism
**Skill reference**: app-audit §E7

**Deliverables**:
- Design coherence (whole vs independently designed sections)
- Attention to detail (pixel-perfect alignment, gaps, borders)
- Brand consistency section-to-section
- First-impression test (7-second assessment)
- Screenshot quality test (each primary screen)
- Visual noise inventory (every unnecessary element per screen)
- Cross-device visual consistency
- Competitive credibility check (vs top WuWa trackers)
- Polish delta (specific changes per section)
- Polish level assessment (axis-driven)

**Coverage**: Complete §E7 across ALL 8 tabs

**Commit checkpoint**: After step completion

---

### STEP 15: §E8 — Product Aesthetics (Axis-Driven)
**Skill reference**: app-audit §E8

**Deliverables**:
- [A1] Commercial intent: first-impression credibility, visual trust, competitive benchmark, conversion blockers, distribution channel fit
- [A2] Use context: cognitive load audit, information scannability, visual noise (leisure/casual: delight calibration)
- [A3] Audience: density as respect, vocabulary accuracy, power-user surface area
- [A4] Subject identity: palette coherence with WuWa, typographic tone, motion character, iconography register, insider signal audit, anti-corporate check
- [A5] Aesthetic role assessment
- Universal: "made with intent" test, icon quality, visual coherence

**Coverage**: Complete §E8 — all axis-tagged items

**Commit checkpoint**: After step completion

---

### STEP 16: §E9 — Visual Identity & Recognizability
**Skill reference**: app-audit §E9

**Deliverables**:
- Visual signature assessment (partial screenshot identification test)
- Visual metaphor coherence
- Accent color intentionality
- Emotional arc design
- Anti-genericness audit (distinct from §DBI3, code-focused)
- App icon quality assessment
- Motion identity assessment
- Iconography as identity signal
- Color system as memory
- Brand scalability

**Coverage**: Complete §E9

**Commit checkpoint**: After step completion

---

### STEP 17: §E10 — Data Storytelling & Visual Communication
**Skill reference**: app-audit §E10

**Deliverables**:
- Numbers as visual elements (key metrics visual weight)
- Hierarchy of insight (raw → computed → actionable)
- Chart design quality (AreaChart, BarChart — question they answer)
- Progressive complexity revelation
- Data density calibration
- Empty → populated visual storytelling
- Error as communication
- Colorblind-safe data encoding
- Data table design quality
- Responsive data display
- Number formatting as visual design
- Real-time data visual treatment (countdown timers, pity counters)

**Coverage**: Complete §E10 across Stats, Calculator, Tracker tabs (primary data surfaces)

**Commit checkpoint**: After step completion

---

### STEP 18: Art-Direction-Engine Complete Coverage
**Skill reference**: art-direction-engine-SKILL.md — ALL sections

**Deliverables**:
- §BRIEF: Produce Art Direction Brief from current state (SUBJECT, AUDIENCE, EMOTIONAL TARGET, VALUES, VISUAL CONCEPT, PALETTE, TYPOGRAPHY, SHAPE, DEPTH & SURFACE, MOTION, ICONS, COMPONENTS, IDENTITY, PROPORTIONS)
- §BAN: Run absolute blacklist check against current code (every banned value detected)
- §CHECK: Self-audit checklist (CRAFT + STRATEGY — every checkbox assessed)
- §COLOR: Five-layer palette analysis (Background, Surfaces, Text, Accent, Semantic)
- §DEPTH: Five techniques assessment
- §TEXTURE: Surface materiality audit
- §LIGHT: Consistent light source audit
- §SHAPE: Shape language audit (radius scale assessment)
- §COMPOSITION: Layout as composition audit
- §TOKENS: Token architecture assessment (3-layer system)
- §ATMOSPHERE: Ambient visual environment audit
- §DERIVE: Art direction from subject matter (WuWa domain visual culture)
- Typography sections (§CLASSIFY, §LIBRARY, §PAIRING, §SCALE, §WEIGHT, §TRACKING, §OPENTYPE, §VARIABLE, §LOADING, §EVALUATE, §HIERARCHY, §MICRO)
- Source/Reference sections (§IMAGE, §SOURCE, §MOOD, §TRANSLATE)
- Anti-Slop sections (§DETECT, §FIX, §META)
- Component sections (§BUTTONS, §CARDS, §INPUTS, §NAVIGATION, §EMPTY, §LOADING, §ERRORS, §ICONS, §TABLES)
- Interaction sections (§HOVER, §FOCUS, §ACTIVE, §TRANSITIONS, §EASING, §SCROLL, §STAGGER, §FEEDBACK, §SIGNATURE)
- Brand Identity sections (§RECOGNITION, §LOGO, §SYSTEM, §NAMING, §COMPETITIVE, §CONSISTENCY, §EVOLUTION)
- Visual Science sections (§PROPORTION, §GRID, §IMPACT, §WEIGHT, §CONTRAST, §SCREEN, §PERFORMANCE, §RESPONSIVE, §DENSITY)
- Psychology sections (§COLOR-PSYCH, §SHAPE-MEANING, §EMOTION-MAP, §MEANING, §VALUES, §TRUST, §ATTENTION, §COGNITIVE, §MEMORY, §FEELING)
- Audience sections (§PROFILE, §DEMOGRAPHICS, §EXPERTISE, §ACCESSIBILITY, §SOCIAL, §PROOF, §MARKETING, §CONVERSION, §POSITIONING)
- Platform section: §WEB (CSS Custom Properties)

**Coverage**: EVERY section of art-direction-engine-SKILL.md

**Commit checkpoint**: After step completion

---

### STEP 19: Cross-Verification & Consistency Pass
**Skill reference**: scope-context-SKILL.md §V, app-audit §VIII

**Deliverables**:
- Cross-reference ALL findings from Steps 1-18 for:
  - Contradictions between findings
  - Inconsistencies in assessments
  - Gaps where something was mentioned but not fully analyzed
  - Alignment verification: every finding respects app identity
  - Compound chains: aesthetic finding → UX gap → accessibility gap
- Verify EVERY tab was covered in EVERY applicable step
- Verify zero omissions against all three skill document section lists
- Produce consistency verification matrix

**Coverage**: Complete cross-verification

**Commit checkpoint**: After step completion

---

### STEP 20: Final Compilation — Full_Deep_Audit_2.md
**Deliverables**:
- Compile ALL findings from Steps 1-19 into Full_Deep_Audit_2.md
- For EACH finding: provide a specific, actionable solution
- Organized by severity: [CRITICAL] → [HIGH] → [MEDIUM] → [LOW] → [POLISH]
- Include:
  - Executive summary with scores per aspect
  - §0 context block
  - Style classification results
  - Character brief
  - Color architecture findings + solutions
  - Typography findings + solutions
  - Component findings + solutions
  - Interaction findings + solutions
  - Identity findings + solutions
  - Data storytelling findings + solutions
  - Art direction brief
  - Anti-slop check results
  - Cross-verification results
  - Final scores per section (targeting 9.5+/10)
  - Summary dashboard

**Coverage**: Complete compilation with solutions

**Commit + push**: Final delivery

---

## Total Steps: 20

## Governing Principles
1. **No code modifications** — audit only
2. **Respect app identity** — never recommend replacing the core visual identity
3. **Cover every element of every tab** — zero omissions
4. **Cross-verify everything** — no inconsistency, no incoherence, no misalignment
5. **Every finding has a solution** — no finding without actionable fix
6. **Commit/push between each step** — ask permission before proceeding
7. **Ping every 15s during compilation** (Step 20)

## Skill Documents Covered
- [x] app-audit-SKILL.md — §E1-§E10 (complete)
- [x] design-aesthetic-audit-SKILL.md — ALL sections (§DS1-DS2, §DP0-DP2, §DC1-DC5, §DBI1+§DBI3, §DT1-DT4, §DM1-DM5, §DH1-DH4, §DSA1-DSA5, §DI1-DI4, §DCO1-DCO6, §DST1-DST4, §DRC1-DRC3, §DCVW1-DCVW3, §DDV1-DDV3, §DTA1-DTA2, §DDT1-DDT2, §DCP1-DCP3, §DIL1-DIL3, §DP3, §DBI2)
- [x] art-direction-engine-SKILL.md — ALL sections (complete)
- [x] scope-context-SKILL.md — §V cross-verification protocol
