# Spine Live-Render Deformation — Investigation Log

> Handoff notes for the next Claude session. The bug is **not solved**.
> User has explicitly forbidden assuming or taking action without authorization.
> Read this before touching anything spine-related on these characters.

---

## The bug

When the live WebGL spine animation runs for a specific set of sprite-spine
characters, **localized parts deform** (warp/twist/clip) while the rest of the
rig animates correctly.

- Static portrait `<img>` rendering: **fine**.
- Each individual `.webp` page viewed flat: **fine**.
- The tier-0 prerender path (animated WebP / WebM): **fine** when present.
- Live WebGL via `spine-player@4.1.55`: **deformed on these 5**.

## Affected characters (5)

Sprite-spine entries in `app/src/shared/components/SpinePlayer.jsx`:

| key (in `SPRITE_SPINE_CHARACTERS`) | display name | folder |
|---|---|---|
| `zanni` | Zani | `app/public/portraits/zanni/` |
| `kanteleila` | Cantarella | `app/public/portraits/kanteleila/` |
| `xiangliyao` | Xiangli Yao | `app/public/portraits/xiangliyao/` |
| `rover_female` | Rover (Female variants) | `app/public/portraits/rover_female/` |
| `rover_male` | Rover (Male variants) | `app/public/portraits/rover_male/` |

> User initially said only the first three were broken, then corrected to
> include `rover_female`. The reverted fix (`dd587b6`, see below) also
> touched `rover_male` — treat it as affected pending visual confirmation.

## Symptom shape (CRITICAL clue)

The deformation is **localized to specific sub-attachments**, not global:
- Zani: an eye
- Cantarella: a strand of hair / cloth piece
- Xiangli Yao: clothes, a hand

These are characteristically the parts a Spine artist authors as **mesh
attachments** (faces, flowing hair, cloth, weight-painted limbs). The rigid
bulk of the rig animates correctly — those use **region attachments**.

## Failed fix attempt (do not reapply blindly)

```
dd587b6  Fix Zani/Cantarella/Xiangli Yao deformation: atlas size lines wrong
8ed4db4  Revert "Fix …"   ← 6 minutes later
```

The fix added `tools/normalize-spine-atlas-sizes.mjs` and rewrote every
`size:WIDTH,HEIGHT` line in the 5 atlases from the tight packed-bounds
declaration (e.g. `size:2044,1748`) to the actual `.webp` file dimensions
(`size:2048,2048` — every affected webp is physically 2048×2048).

**Outcome from the user:** *"it made the live asset completely messed up,
totally deformed like someone did Rubik's cube it"* — i.e. the fix turned
a localized per-mesh problem into total scrambling across the whole rig.

That outcome is the most informative thing in this whole investigation:
it proves the current `size:` values are **internally consistent** with
the current `bounds:` numbers and the baked mesh UVs in the `.skel` for
the *majority* of attachments. Globally rescaling the UV frame breaks
everything that was working.

## Current best hypothesis

Per-attachment desync between the binary `.skel`'s baked mesh UVs and the
atlas regions those meshes reference. Most likely cause: the atlas was
**re-packed or re-trimmed after the meshes were authored**, so a handful
of mesh attachments now point at slightly-shifted region bounds while the
rest line up. Region attachments compute UVs at runtime from current
`bounds:` so they always agree with the atlas; mesh UVs are baked into
`.skel` at export time and don't get updated by atlas re-pack.

This hypothesis fits every observation:
1. Localized to a few attachments per char.
2. Confined to characters whose atlas pages have non-uniform `size:` (the
   re-pack reflowed those pages; uniform 2048×2048 chars were never
   re-packed differently → no desync).
3. Bumping `size:` globally to 2048 made it worse (it shifted the frame
   for the meshes that were lined up, on top of the ones that weren't).

**Not yet verified.** The hypothesis predicts that diffing the affected
mesh attachments' baked UVs against the corresponding atlas region UVs
would show a small offset. Verifying requires parsing the Spine 4.1
binary `.skel` format.

## Verified facts

- Runtime in use: `@esotericsoftware/spine-player@4.1.55` (sprite-spine,
  via CDN IIFE), `@4.2.109` (banner-spine). Both stashed/restored on
  `window` — see `app/index.html:43-67`. The two runtimes are not
  cross-compatible across minor versions.
- All `.skel` files for the 5 affected chars are exported from Spine
  **4.1.23**. (Other working chars are also 4.1.23 — not the discriminator.)
- Every `.webp` page on disk for the affected chars is **2048×2048**
  (verified via WebP header parse). Atlases declare smaller `size:` values:

  | char | declared `size:` per page |
  |---|---|
  | zanni | 2044×1748, 1864×1608, 1796×1540 |
  | kanteleila | 2004×1900, 2028×1824, 1972×1560 |
  | xiangliyao | 2032×1872, 1900×1304, 1264×1996, 1328×1236 |
  | rover_female | 2004×1532, 1664×1844, 1224×1172 |
  | rover_male | 2036×1588 |

- Other multi-page chars work fine because their `size:` lines correctly
  declare 2048×2048 (linnai, aogusita) or otherwise align with the
  baked mesh UVs (younuo, daniya, feixue, xiakong).

## Ruled out (don't re-explore)

- ❌ Generic multi-page atlas runtime support — linnai/aogusita/younuo
  are multi-page and animate correctly.
- ❌ Spine runtime version mismatch — same export version (4.1.23)
  across working and broken chars.
- ❌ Atlas attribute differences — `size`, `filter`, `scale`, `bounds`,
  `offsets`, `rotate` are the only keys present, identical across both.
- ❌ NPOT (non-power-of-two) WebGL texture filtering — rover_female has
  identical NPOT shape to other working multi-page atlases on the
  texture side; the actual GL texture is always the 2048×2048 file.
- ❌ Naming-convention regressions in region names — broken and working
  chars all use `<prefix>_shenti<n>` style or per-character schemes.
- ❌ Global `size:` line being wrong — the failed fix proved this is
  not the lever.

## Constraints from the user

> *"i forbide you to assume and take random action out of thin air"*

- Do **not** edit `.atlas`, `.skel`, or any spine asset without explicit
  authorization for the specific change.
- Do **not** cherry-pick or re-apply `dd587b6`.
- Do **not** propose "let's just try X" fix paths without first
  understanding *why* X would work and showing that work.
- Investigation, reading, and asking questions are fine.

## Where to look next (research only, don't act)

1. **Parse the Spine 4.1 binary `.skel`** for one affected char (smallest
   is `xiangliyao` at 145,945 bytes). Confirm whether mesh attachment
   `regionUVs` are stored normalized (0-1 within the region quad) or
   in some other space. Extract the UVs for one suspected-broken
   attachment (e.g. an eye-shaped mesh on Zani) and compare against the
   atlas's bounds for that region.
2. **List which attachments are meshes vs regions** in the `.skel` for
   each of the 5 chars. Cross-reference the broken parts (eye, hair,
   cloth, hand) against the mesh list — should match cleanly.
3. **Compare `offsets:` lines** in the affected atlases against the
   working ones. The Spine runtime uses `offsets` to position
   trim-recovered geometry; if those values are wrong for specific
   regions, only attachments referencing them would deform.
4. **Workaround (UI-side, not asset-side)**: force these 5 chars to
   skip the live WebGL tier and use only the prerender / static
   fallback. The infrastructure exists in
   `app/src/shared/components/SpinePlayer.jsx:267-291` (tier-0 lookup)
   and `app/src/shared/spinePrerenderManifest.js`. Would need either
   per-character prerenders captured (the prerender capture pipeline
   exists — see commits around `9edcb55`, `c4f06a1`) or a hard
   `failed = true` flag on those entries so the static `<img>`
   fallback is used. This is a workaround, not a fix.

## Files referenced

- `app/src/shared/components/SpinePlayer.jsx` — render code, registries
- `app/src/shared/spinePrerenderManifest.js` — tier-0 lookup
- `app/index.html` lines 43-67 — runtime loading
- `app/public/portraits/{zanni,kanteleila,xiangliyao,rover_female,rover_male}/`
- `tools/build-prerender-manifest.mjs` — prerender manifest generator
- `tools/extract-sprite-list.mjs` — sprite list build step
- Reverted fix script (no longer in tree): `tools/normalize-spine-atlas-sizes.mjs`
  in commit `dd587b6` if you want to read it.

## Conversation history (compressed)

1. User reported deformation on Zani / Cantarella / Xiangli Yao.
2. Claude (this session) hypothesized multi-page atlas runtime issue.
3. User: ruled out — verified other multi-page chars work fine.
4. Claude: looked deeper, found `dd587b6` / `8ed4db4` in git history.
5. User corrected: `rover_female` is also affected (and `rover_male`
   was in the reverted fix's diff).
6. Claude proposed reapplying `dd587b6`. User: forbid assuming;
   the fix was reverted because it destroyed live rendering.
7. User: localized → spread when fix applied. This pinned the
   hypothesis to per-attachment mesh UV desync, not global atlas.
8. User: requested this log. (You are reading it.)

---

*Logged 2026-04-28. Not a fix — a record of what's known, ruled out,
and still open, so the next session doesn't relitigate the same paths.*
