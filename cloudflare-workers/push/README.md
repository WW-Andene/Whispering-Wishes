# Push notifications — Cloudflare Worker

Free, always-on backend for Whispering Wishes' push notifications, for anyone
not running the Vercel deployment. Same logic as `app/api/push/register.js`
and `app/api/push/send.js`, ported to a Cloudflare Worker (Workers' free tier
is 100k requests/day, no idle sleep — a genuine always-reachable serverless
host, not something you have to keep a PC running for).

## What this needs from you

You still need the Firebase pieces from `CAPACITOR_APP.md`'s push section —
this Worker replaces *where the server code runs*, not the Firebase project
setup:

1. A Firebase project with an Android app registered (package
   `cc.andene.whisperingwishes`) → `google-services.json` in
   `app/android/app/` (gitignored, build-time only, unrelated to this Worker)
2. A service-account key from that same project (Project Settings → Service
   accounts → "Generate new private key")

## 1. Install Wrangler (Cloudflare's CLI)

```bash
npm install -g wrangler
wrangler login    # opens a browser to link your (free) Cloudflare account
```

## 2. Deploy the Worker

```bash
cd cloudflare-workers/push
wrangler deploy
```

First deploy prints your Worker's URL, something like:
`https://whispering-wishes-push.<your-subdomain>.workers.dev`

## 3. Set the secrets

Never put these in `wrangler.toml` or commit them — `wrangler secret put`
stores them encrypted on Cloudflare's side, same idea as Vercel's env vars:

```bash
wrangler secret put FIREBASE_SERVICE_ACCOUNT_JSON
# paste the whole downloaded JSON file's contents, then Enter

wrangler secret put FIREBASE_DB_URL
# e.g. https://your-project.firebaseio.com

wrangler secret put PUSH_ADMIN_SECRET
# any random string — generate one with: openssl rand -hex 32
```

## 4. Point the app at it

In `app/.env.local` (or wherever you set build-time vars) / the
`VITE_PUSH_API_BASE_URL` GitHub Actions repo secret for the APK build:

```
VITE_PUSH_API_BASE_URL=https://whispering-wishes-push.<your-subdomain>.workers.dev
```

Rebuild. `src/utils/pushNotifications.js` now posts device registrations to
this Worker's `/register` instead of `/api/push/register`.

## 5. Test

```bash
# after opening the app once, to register a device token
curl -X POST https://whispering-wishes-push.<your-subdomain>.workers.dev/send \
  -H "x-admin-secret: <your PUSH_ADMIN_SECRET>" -H "Content-Type: application/json" \
  -d '{"title":"Test","body":"It works!"}'
```

## Notes

- `/send` is never called by the app — it's your own admin tool, same as the
  Vercel version. Trigger it manually, or from a scheduled GitHub Actions
  workflow (`schedule:` + a `curl` step) if you want automated event-ending
  reminders without a always-on machine for *that* either.
- The origin allowlist in `src/cors.js` is a direct copy of
  `app/api/_common.js`'s — if you ever add a new allowed origin there
  (e.g. a new self-host tunnel domain), update both files.
- Redeploy after any code change with `wrangler deploy` from this directory.
- To see live logs while testing: `wrangler tail`.
