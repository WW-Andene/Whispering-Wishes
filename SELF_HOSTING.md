# Self-hosting Whispering Wishes

Run the app on your own machine instead of (or alongside) Vercel — same production
build, no cold starts, no shared resources, full control. This is purely additive:
nothing here touches `vercel.json` or anything Vercel reads, so the Vercel
deployment keeps working unchanged if you want to keep both around.

## 1. Build and run locally

```bash
git clone https://github.com/WW-Andene/Whispering-Wishes.git
cd Whispering-Wishes/app
npm install
npm run build          # production build → dist/
cp self-host/.env.example self-host/.env
# edit self-host/.env — see "Environment variables" below
npm run selfhost
```

The app is now at **http://localhost:4173** — the exact same optimized/minified
build that runs on Vercel, but using your machine's own CPU/RAM with zero
network latency.

`self-host/server.js` is a small Express server that:
- serves `dist/` as static files with SPA fallback (mirrors `vercel.json`'s rewrite rule, so deep-linking/refreshing any route works)
- mounts the same `/api/*` handlers Vercel uses (`remove-bg`, `batch-remove-bg`, `ocr`, `gacha/record/query`) — they're plain `(req, res)` Node functions, so no rewrite was needed
- applies the same security headers `vercel.json` sets in production (HSTS only when served over HTTPS)

## 2. Environment variables (`app/self-host/.env`)

| Variable | Required for | Where to get it |
|---|---|---|
| `HF_API_KEY` | Background removal (Collection tab image editing) | https://huggingface.co/settings/tokens (free) |
| `ADMIN_HASH` | Admin panel's batch background-removal tool | whatever hash your admin panel expects |
| `PORT` / `HOST` | Server bind address | defaults `4173` / `0.0.0.0` |
| `EXTRA_ALLOWED_ORIGINS` | Letting a non-default URL call `/api/*` | see below |

You only need the keys for features you actually use — everything else (calculator,
planner, collection tracking, team builder) works with no keys configured at all.

**About `EXTRA_ALLOWED_ORIGINS`**: the API routes only accept requests from an
origin allowlist (prevents random sites from draining your API quota).
`http://localhost:4173` is allowed by default. If you expose the app under a
different URL — a Cloudflare Tunnel domain, a LAN IP, a custom `PORT` — add it
here (comma-separated):
```
EXTRA_ALLOWED_ORIGINS=https://your-tunnel.trycloudflare.com,http://192.168.1.50:4173
```

## 3. Exposing it to the internet

Pick one:

### Cloudflare Tunnel (recommended)
Free, automatic HTTPS, no router port-forwarding, hides your home IP.
```bash
# download cloudflared: https://github.com/cloudflare/cloudflared/releases
cloudflared tunnel --url http://localhost:4173
```
Gives you a `https://xxxx.trycloudflare.com` URL immediately (no account needed
for a quick/temporary tunnel). For a permanent URL on your own domain, create a
named tunnel instead:
```bash
cloudflared tunnel login
cloudflared tunnel create whispering-wishes
cloudflared tunnel route dns whispering-wishes wuwa.yourdomain.com
```
then a `config.yml`:
```yaml
tunnel: whispering-wishes
credentials-file: /path/to/<tunnel-id>.json
ingress:
  - hostname: wuwa.yourdomain.com
    service: http://localhost:4173
  - service: http_status:404
```
```bash
cloudflared tunnel run whispering-wishes
```
Whichever URL you land on, add it to `EXTRA_ALLOWED_ORIGINS` in `self-host/.env`
and restart the server, or `/api/*` calls made from that URL will get a 403.

### ngrok
Quicker for a one-off test, but the free-tier URL changes every restart:
```bash
ngrok http 4173
```

### Tailscale Funnel
If you already use Tailscale — `tailscale funnel 4173` exposes it publicly, or
`tailscale serve 4173` keeps it private to your own tailnet (no public exposure
at all, useful if this is just for you across your own devices).

### Traditional port-forwarding + DDNS
Possible but not recommended over the above: exposes your home IP directly, no
automatic HTTPS (you'd need a reverse proxy like Caddy or nginx + Let's Encrypt
in front of it yourself), and your router becomes a direct target.

## 4. Keeping it running (optional)

To not need a terminal window open all the time:

**Windows** — [pm2](https://pm2.keymetrics.io/) + [pm2-windows-startup](https://www.npmjs.com/package/pm2-windows-startup):
```bash
npm install -g pm2 pm2-windows-startup
pm2-startup install
cd Whispering-Wishes/app
pm2 start self-host/server.js --name whispering-wishes
pm2 save
```
Now it survives reboots and restarts automatically if it crashes.

**Linux** — a systemd user service, or the same `pm2` approach above.

## Notes

- `npm run selfhost` and the Vercel deployment can run at the same time — they
  don't share any state (localStorage is per-browser-origin, so the two are
  actually separate save files unless you export/import between them).
- If you change `PORT` or `HOST`, the API routes' origin allowlist needs the new
  origin added to `EXTRA_ALLOWED_ORIGINS` (see above) or requests will 403.
- `self-host/.env` is gitignored — never commit real API keys.
