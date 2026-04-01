# WW-B — Audit Agent

WW-B is an **audit-only** maintenance agent for Whispering Wishes. It checks game data, finds bugs, simulates user scenarios, and compiles all findings into a report. **It never modifies app code.**

## How it works

1. Creates `WW-B_maintenance_(x)` branch
2. Fetches game data from web sources (Game8, Prydwen)
3. Compares with app's current data (banners, events, roster)
4. Checks image URL health
5. Validates structural integrity
6. Runs code audit (finds bugs and improvements)
7. Simulates user scenarios (new player, whale, edge cases)
8. Writes `WW-B_comment_(x).md` with all findings
9. Commits and pushes the comment file only

**All findings are tagged `NEEDS MANUAL APPLY`.** Nothing happens until you review and approve.

## Usage

```bash
# Set API key
export GROQ_API_KEY=gsk_...

# Full audit
npm run audit

# Quick check (events + expiring banners)
npm run micro

# Preview without creating branch/commit
npm run dry-run

# Code audit only
npm run code-only
```

## Output

Each run produces `WW-B_comment_(x).md` containing:
- **Summary** — action count, findings count
- **Changes** — what needs updating (banners, events, roster)
- **Action Log** — timestamped details for every check

## Architecture

```
index.js          → Orchestrator (audit flow)
lib/ai.js         → Groq API (ask, askJSON, extractJSON)
lib/checks.js     → Game data checks (banners, events, roster)
lib/scenarios.js  → User scenario simulations
lib/audit.js      → Code analysis
lib/git.js        → Branch, commit, action logging
lib/scraper.js    → Web fetching
lib/reader.js     → App state parser
lib/validate.js   → Structural validation
lib/memory.js     → Persistent run history
lib/health.js     → URL health checks
lib/config.js     → Configuration
lib/log.js        → Logging
```

## Environment

| Variable | Required | Description |
|----------|----------|-------------|
| `GROQ_API_KEY` | Yes | Free key from [console.groq.com](https://console.groq.com/keys) |
| `GROQ_MODEL` | No | Default: `llama-3.3-70b-versatile` |
| `GIT_AUTHOR_NAME` | No | Default: `WW-B` |
