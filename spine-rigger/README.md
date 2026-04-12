# Spine Rigger

Sprite → Skeleton → Spine JSON

Upload a character sprite, auto-detect or manually place bones, export Spine-compatible skeleton JSON.

## Stack
- Next.js 14 (App Router)
- MediaPipe Pose Landmarker (in-browser, no API key)
- Canvas 2D bone editor
- Spine JSON 4.1 export

## Deploy

This subfolder is a **standalone Next.js 14 app** living inside the main Whispering-Wishes monorepo. Vercel treats it as a separate project.

### First-time Vercel setup

1. In the Vercel dashboard, **Add New → Project** and import the same Whispering-Wishes repo a second time.
2. During the import screen, set **Root Directory** to `spine-rigger/`.
3. Framework preset should auto-detect as **Next.js**. Build / install / output commands are already pinned in `spine-rigger/vercel.json`.
4. No env vars required — MediaPipe runs fully in-browser.
5. Deploy.

After that, every push to `main` rebuilds both projects independently (the main Vite app from `app/`, and the spine-rigger Next.js app from `spine-rigger/`). The `claude/*` branch filter in `spine-rigger/vercel.json` prevents preview deploys on work-in-progress branches, matching the root-level setup.

### Local dev

```bash
cd spine-rigger
npm install
npm run dev
```

## Usage

1. Upload sprite (PNG with transparent background recommended)
2. Bones appear at default positions
3. Tap **Auto-Detect** to run MediaPipe pose estimation
4. **Drag bones** to correct positions
5. Tap **Export Spine JSON** to download skeleton.json
6. Import into Spine Editor

## Limitations

- MediaPipe is trained on real humans — accuracy varies on anime/stylized characters
- Manual correction is expected and normal
- Spine JSON includes skeleton only (no mesh/skin attachments)
- Single-pose detection (front-facing works best)
