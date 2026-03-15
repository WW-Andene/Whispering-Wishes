# Whispering Wishes — Autonomous Update Agent

A fully autonomous agent that keeps the Whispering Wishes app updated with the latest Wuthering Waves game data. It fetches data from multiple web sources, uses Claude AI to extract and validate structured game data, and applies precise code updates to `appcore-data.js`.

## What It Updates

| Category | Frequency | Sources |
|----------|-----------|---------|
| **Banners** — featured characters, weapons, dates, 4★ lineups | Every 2–3 weeks (banner phase rotation) | Game8, Prydwen, Fandom Wiki |
| **Events** — end dates for Tower of Adversity, Whimpering Wastes, etc. | As events cycle (28-day rotations, version updates) | Game8, Fandom Wiki |
| **Characters** — new Resonators with full data (element, weapon, skills, builds, teams) | Every ~3 weeks (new character release) | Prydwen, Game8, Fandom Wiki |
| **Weapons** — new 5★ weapons with stats and signature pairings | Every ~3 weeks (new weapon release) | Game8, Prydwen |
| **Lists** — ALL_5STAR_RESONATORS, RELEASE_ORDER, BANNER_HISTORY, etc. | Whenever characters/weapons/banners are added | Derived from above |

## How It Works

```
┌─────────────┐     ┌──────────┐     ┌───────────┐     ┌──────────┐     ┌─────────┐
│  Web Sources │────▶│ Scraper  │────▶│ Claude AI │────▶│  Writer  │────▶│   Git   │
│  (Game8,     │     │ (fetch + │     │ (analyze, │     │ (precise │     │ (branch │
│  Prydwen,    │     │  extract │     │  extract, │     │  string  │     │  commit │
│  Fandom)     │     │  text)   │     │  validate)│     │  replace)│     │  push)  │
└─────────────┘     └──────────┘     └───────────┘     └──────────┘     └─────────┘
                                           │
                                     ┌─────┴─────┐
                                     │ Validator  │
                                     │ (integrity │
                                     │  checks)   │
                                     └───────────┘
```

1. **Read** — Parses current `appcore-data.js` to understand what the app currently shows
2. **Fetch** — Scrapes game data from 3+ web sources per category
3. **Analyze** — Sends web content to Claude API for structured data extraction
4. **Compare** — Diffs extracted data against current app data
5. **Write** — Applies precise string replacements to source code
6. **Validate** — Runs 11 integrity checks (balanced braces, cross-references, duplicates, valid dates, etc.)
7. **Publish** — Creates a git branch, commits, and pushes for review

## Setup

### 1. Install dependencies

```bash
cd agent
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
# Edit .env and add your Anthropic API key
```

### 3. Run

```bash
# Full update cycle
node index.js

# Dry run (analyze only, no file changes)
node index.js --dry-run

# Update only banners
node index.js --only=banners

# Update only events
node index.js --only=events

# Update only characters + weapons
node index.js --only=characters

# Update files but don't commit to git
node index.js --no-git
```

## GitHub Actions (Fully Autonomous)

The agent runs automatically via GitHub Actions:

- **Schedule**: Daily at 10:00 UTC
- **Manual**: Trigger from GitHub UI → Actions → "Auto-Update Game Data" → Run workflow

### Required Secrets

Add these in your repo Settings → Secrets and variables → Actions:

| Secret | Description |
|--------|-------------|
| `ANTHROPIC_API_KEY` | Your Anthropic API key (starts with `sk-ant-`) |

`GITHUB_TOKEN` is automatically provided by GitHub Actions.

### What the workflow does

1. Checks out the repo
2. Installs agent dependencies
3. Runs the update agent
4. If changes detected → creates a **Pull Request** for review
5. You review the PR and merge when satisfied

## Confidence System

The agent assigns a confidence score (0–1) to every detected change based on source agreement and data clarity:

| Confidence | Action |
|------------|--------|
| ≥ 85% | Auto-applied (written to code) |
| < 85% | Logged as "NEEDS_REVIEW" — not applied |

Lower the threshold in `lib/config.js` → `THRESHOLDS.autoApplyConfidence` if you want more aggressive auto-updates.

## Validation Checks

Before writing any changes, the agent runs these integrity checks:

1. **Balanced braces/brackets/parens** — catches broken JS syntax
2. **CHARACTER_DATA count = ALL_5STAR + ALL_4STAR** — cross-reference consistency
3. **ALL_CHARACTERS = CHARACTER_DATA keys** — set membership
4. **Every ALL_5STAR entry exists in CHARACTER_DATA** — no orphan entries
5. **Banner characters exist in CHARACTER_DATA** — no missing characters
6. **Banner dates are valid ISO strings** — no NaN dates
7. **Start date < end date** — temporal sanity
8. **RELEASE_ORDER count = CHARACTER_DATA count** — completeness
9. **No duplicate entries** in any list array
10. **Valid element names** — must be one of the 6 canonical elements
11. **BANNER_HISTORY ordering** — newest first

If ANY check fails, the agent aborts without writing files.

## File Structure

```
agent/
├── package.json        # Dependencies (just @anthropic-ai/sdk)
├── .env.example        # Environment template
├── README.md           # This file
├── index.js            # Main orchestrator — CLI entry point
└── lib/
    ├── config.js       # All URLs, paths, game constants, schemas
    ├── scraper.js      # Web fetching with rate limiting
    ├── ai.js           # Claude API integration for data extraction
    ├── reader.js       # Parses current appcore-data.js
    ├── writer.js       # Applies precise string replacements
    ├── validate.js     # Post-update integrity checks
    ├── log.js          # Colored logging + change tracking
    └── git.js          # Git branch/commit/push operations
```

## Cost Estimate

Each full update cycle uses ~3–5 Claude API calls:
- 1 for banner analysis
- 1 for event analysis
- 1 for character detection
- 1 for weapon detection
- 0–1 for combat data generation (only if new characters found)

At Sonnet pricing, this is roughly **$0.02–0.05 per run** or **~$1/month** with daily scheduling.

## Troubleshooting

**Agent exits with "No banner sources available"**
→ The source websites may be temporarily down. The agent will retry next run.

**Confidence too low on a valid change**
→ Lower `THRESHOLDS.autoApplyConfidence` in `lib/config.js` from 0.85 to 0.7.

**Validation fails after update**
→ Check the error messages. Common causes: a character was added to CHARACTER_DATA but not to ALL_CHARACTERS or RELEASE_ORDER. The writer should handle this automatically, but edge cases in source formatting can cause regex mismatches.

**Git push fails**
→ Check that the GitHub token has `contents: write` permission. In GitHub Actions, this is set in the workflow file.

## Architecture Decisions

1. **Claude API as the intelligence layer** — Web scraping is fragile when source sites change layout. Claude can interpret unstructured content regardless of format changes, making the agent resilient to source website redesigns.

2. **String replacement, not AST manipulation** — `appcore-data.js` is a single 1,450-line file with a stable format. Precise string replacement is simpler, more transparent, and less likely to introduce formatting changes than AST-based code generation.

3. **Confidence gating** — Changes below 85% confidence are logged but not applied. This prevents bad data from reaching users when sources disagree or content is ambiguous.

4. **Validation before write** — 11 integrity checks catch errors before they hit disk. The agent would rather abort than ship broken data.

5. **PR workflow** — Changes are pushed to a branch and surfaced as a Pull Request, not committed directly to main. This gives you (or anyone) a chance to review before the changes go live.
