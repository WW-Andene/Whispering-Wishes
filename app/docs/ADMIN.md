# ADMIN.md — Whispering Wishes admin model

_Reference doc for the audit finding P3-04._

The app has a **two-tier admin system**. This doc explains why the client-side hash is visible in source code and why that is not a security bug.

---

## Tier 1 — UI gatekeeping (client-side PBKDF2)

**Purpose:** reveal optional admin-only UI surface (banner form editor, trophy override panel, convene scanner, background uploader). Everything behind this tier edits **local app state only** — it never writes to a shared resource.

**Mechanism:**

- Client stores `ADMIN_HASH` (PBKDF2-derived) and `ADMIN_SALT` as constants in `src/shared/constants/appConstants.js`.
- User enters a password → client derives PBKDF2 with 100k iterations → constant-time compare (see `src/utils/constantTimeCompare.js`) against `ADMIN_HASH`.
- Five wrong attempts → 5-minute session lockout.
- Three session lockouts → permanent ban (`ww-admin-banned` in localStorage).
- On success, `adminUnlocked` state flips to true in ProfileTab, revealing the admin tabs.

**What the hash protects against:**

- Casual tampering via URL hash, HTML inspect, or trying random passwords
- Automated brute force at ~100k iterations per attempt + 5-attempt lockout

**What the hash does NOT protect against:**

- Someone who downloads the JS bundle and runs offline brute-force on their own machine. They can extract `ADMIN_HASH` + `ADMIN_SALT` from source and try billions of candidates without the lockout. **That is by design** — see "Scope of trust" below.

## Tier 2 — Server-side admin operations (env-var hash)

**Purpose:** gate the one server-side admin endpoint (`/api/batch-remove-bg`) that actually performs a privileged action (calls a paid HuggingFace API).

**Mechanism:**

- `process.env.ADMIN_HASH` on Vercel holds the same hash.
- Client sends `x-admin-key: <hash>` header when calling `/api/batch-remove-bg`.
- Server constant-time compares against `process.env.ADMIN_HASH` (`api/batch-remove-bg.js:38-41`).
- Unauthorized → 401.

**What the server hash protects against:**

- Anyone hitting `/api/batch-remove-bg` without the admin header → 401.
- Someone who extracted the client-side hash (Tier 1 fail) → they get in. That is **intentional**: the server treats "proved knowledge of the PBKDF2 hash" as "is an admin". Since PBKDF2 with 100k iterations on a strong password is expensive to brute-force, this is an acceptable shared secret for this app's scope.

## Scope of trust

- **This app is a fan tool, not a bank.** Admin actions are: editing banner form data (displayed locally), overriding trophy names (local), uploading custom character backgrounds (local), calling one paid API to process an image (server, rate-limited).
- **The admin password is not the user's password.** It is a shared secret known by the app maintainer. A compromised admin password allows: re-running background removal on the paid API more than typical, editing banner data for the local user. No PII is exposed; no cross-user harm is possible.
- **A full server-side session model** (JWT, refresh tokens, cookie management) would be over-engineering for this surface area. Current P3-04 audit verdict: the two-tier model is proportional to the threat.

## When this model needs to change

Add a real `/api/admin/verify` endpoint + session tokens if any of these become true:

1. Admin actions affect state shared between users (leaderboard curation, community pull aggregation write, presence moderation)
2. Admin can delete or modify server-stored records beyond their own
3. Multiple admin roles exist with different permissions
4. The admin password is cycled frequently and you need to revoke specific sessions

Until any of those apply, the current model is the right fit.

## Files

- Client unlock logic: `src/features/profile/ProfileTab.jsx:355-430`
- Constant-time compare: `src/utils/constantTimeCompare.js`
- Server check: `api/batch-remove-bg.js:38-41`
- Lockout storage keys: `src/core/storageKeys.js` (ADMIN_KEYS)
- Rate limit + kill switch helper: `api/_common.js`

## Hardening checklist (future, if Tier 2 ever grows)

- [ ] Move `ADMIN_HASH` constant off client entirely; keep only on server env var
- [ ] Replace client-side PBKDF2 verify with a `POST /api/admin/verify` that returns a short-lived signed token
- [ ] Store the token in memory (not localStorage) — it survives the session only
- [ ] Add server-side attempt throttling on `/api/admin/verify` in addition to client lockout
- [ ] Rotate admin password via env-var redeploy; all issued tokens become invalid on rotation
