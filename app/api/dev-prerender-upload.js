// Vercel serverless route — accepts captures from the dev panel served at
// /dev/ and commits them to the repo via the GitHub Git Data API. Used when the dev
// panel is opened on the deployed Vercel preview (the Vite-middleware path
// only works under `vite dev`).
//
// Two-phase upload so each request stays under Vercel's body-size cap and all
// 65 files land in ONE commit instead of 65:
//
//   POST { action: 'blob', path, contentB64 }
//     → uploads ONE file as a GitHub blob, returns its SHA. Repeat per file.
//
//   POST { action: 'commit', files: [{path, sha}], branch?, message? }
//     → builds a tree containing every accumulated blob, creates one commit
//       on the target branch, fast-forwards the ref. Returns the commit URL.
//
//   GET → health probe. Reports the resolved repo + branch + which env vars
//         are still missing so the dev panel can show "go set X on Vercel".
//
// Env vars (all read at request time so Vercel hot-reloads pick them up):
//   GITHUB_TOKEN              → fine-grained PAT with contents:write on this repo
//   PRERENDER_ADMIN_TOKEN     → secret the dev panel sends as Bearer auth
//   PRERENDER_REPO            → owner/name override (defaults to VERCEL_GIT_REPO_*)
//   PRERENDER_BRANCH          → branch override (defaults to VERCEL_GIT_COMMIT_REF)

import { rateLimit } from './_common.js';

const ALLOWED_ORIGINS = [
  'https://whispering-wishes.vercel.app',
  'http://localhost:3000',
  'http://localhost:5000',
  'http://localhost:5173',
];
const isAllowedOrigin = (o) =>
  !o || ALLOWED_ORIGINS.includes(o) || /^https:\/\/whispering-wishes[a-z0-9-]*\.vercel\.app$/.test(o);

// Same allowlist the Vite plugin enforces — captures must land at one of the
// dev-panel output paths, never anywhere else in the repo.
const ALLOWED_EXTS = new Set(['.webm', '.mp4']);
const ALLOWED_PREFIXES = ['app/public/portraits/', 'app/public/spine/role_'];

function getRepo() {
  if (process.env.PRERENDER_REPO) return process.env.PRERENDER_REPO;
  const owner = process.env.VERCEL_GIT_REPO_OWNER;
  const name = process.env.VERCEL_GIT_REPO_SLUG;
  return owner && name ? `${owner}/${name}` : null;
}

function getDefaultBranch() {
  return process.env.PRERENDER_BRANCH || process.env.VERCEL_GIT_COMMIT_REF || 'main';
}

function safePath(p) {
  if (typeof p !== 'string') return null;
  if (p.includes('..') || p.includes('\0') || p.startsWith('/')) return null;
  const lower = p.toLowerCase();
  let okExt = false;
  for (const e of ALLOWED_EXTS) if (lower.endsWith(e)) { okExt = true; break; }
  if (!okExt) return null;
  let okPrefix = false;
  for (const pre of ALLOWED_PREFIXES) if (p.startsWith(pre)) { okPrefix = true; break; }
  if (!okPrefix) return null;
  return p;
}

function ghHeaders(token) {
  return {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'whispering-wishes-prerender-uploader',
    'Content-Type': 'application/json',
  };
}

async function gh(method, url, token, body) {
  const r = await fetch(url, {
    method,
    headers: ghHeaders(token),
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!r.ok) {
    const text = await r.text().catch(() => '');
    throw new Error(`GitHub ${method} ${url.replace(/^https:\/\/api\.github\.com/, '')} → ${r.status}: ${text.slice(0, 300)}`);
  }
  return r.json();
}

export default async function handler(req, res) {
  const origin = req.headers.origin || '';
  if (!isAllowedOrigin(origin)) return res.status(403).json({ error: 'Origin not allowed' });
  res.setHeader('Cache-Control', 'no-store');

  // Health probe — never requires auth so the panel can detect the route.
  if (req.method === 'GET') {
    const repo = getRepo();
    const missing = [
      !repo && 'PRERENDER_REPO (or VERCEL_GIT_REPO_OWNER + VERCEL_GIT_REPO_SLUG)',
      !process.env.GITHUB_TOKEN && 'GITHUB_TOKEN',
      !process.env.PRERENDER_ADMIN_TOKEN && 'PRERENDER_ADMIN_TOKEN',
    ].filter(Boolean);
    return res.status(200).json({
      ok: missing.length === 0,
      mode: 'github',
      repo: repo || null,
      branch: getDefaultBranch(),
      missing,
    });
  }

  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const adminToken = process.env.PRERENDER_ADMIN_TOKEN;
  if (!adminToken) return res.status(503).json({ error: 'PRERENDER_ADMIN_TOKEN not configured on server' });
  const auth = req.headers.authorization || '';
  if (auth !== `Bearer ${adminToken}`) return res.status(401).json({ error: 'Unauthorized' });

  // 200/min covers a 65-file batch + commit comfortably while still throttling
  // a runaway loop. Per-IP, in-memory bucket from _common.js.
  if (!rateLimit(req, res, { key: 'prerender_upload', max: 200, windowMs: 60_000 })) return;

  const ghToken = process.env.GITHUB_TOKEN;
  if (!ghToken) return res.status(503).json({ error: 'GITHUB_TOKEN not configured on server' });
  const repo = getRepo();
  if (!repo) return res.status(503).json({ error: 'Repo not resolved (set PRERENDER_REPO)' });

  const body = req.body || {};
  const action = body.action;

  try {
    if (action === 'blob') {
      const { contentB64, path } = body;
      if (typeof contentB64 !== 'string' || !contentB64) {
        return res.status(400).json({ error: 'missing contentB64' });
      }
      // Path is informational here (the blob isn't bound to a path until the
      // commit step) but we validate it eagerly so the client gets a clear
      // error before uploading 65 files into limbo.
      if (path !== undefined && !safePath(path)) {
        return res.status(400).json({ error: `disallowed path: ${path}` });
      }
      const out = await gh('POST', `https://api.github.com/repos/${repo}/git/blobs`, ghToken, {
        content: contentB64,
        encoding: 'base64',
      });
      return res.status(200).json({ sha: out.sha, path: path || null });
    }

    if (action === 'commit') {
      const { files, branch, message } = body;
      if (!Array.isArray(files) || files.length === 0) {
        return res.status(400).json({ error: 'missing files[]' });
      }
      const targetBranch = (typeof branch === 'string' && branch) || getDefaultBranch();
      const cleanFiles = [];
      for (const f of files) {
        const p = safePath(f && f.path);
        if (!p || typeof f.sha !== 'string' || !/^[0-9a-f]{40}$/i.test(f.sha)) {
          return res.status(400).json({ error: `bad entry: ${JSON.stringify(f)}` });
        }
        cleanFiles.push({ path: p, sha: f.sha });
      }

      const refUrl = `https://api.github.com/repos/${repo}/git/refs/heads/${encodeURIComponent(targetBranch)}`;
      const ref = await gh('GET', refUrl, ghToken);
      const parentCommit = await gh(
        'GET',
        `https://api.github.com/repos/${repo}/git/commits/${ref.object.sha}`,
        ghToken,
      );

      const tree = await gh('POST', `https://api.github.com/repos/${repo}/git/trees`, ghToken, {
        base_tree: parentCommit.tree.sha,
        tree: cleanFiles.map((f) => ({
          path: f.path,
          mode: '100644',
          type: 'blob',
          sha: f.sha,
        })),
      });

      const commitMsg = (typeof message === 'string' && message.trim())
        || `Add ${cleanFiles.length} prerender capture${cleanFiles.length === 1 ? '' : 's'} via dev panel`;
      const commit = await gh('POST', `https://api.github.com/repos/${repo}/git/commits`, ghToken, {
        message: commitMsg,
        tree: tree.sha,
        parents: [parentCommit.sha],
      });

      // Fast-forward only — refuses if the branch moved in between, which is
      // what we want (no silent overwrites of someone else's push).
      await gh('PATCH', refUrl, ghToken, { sha: commit.sha, force: false });

      return res.status(200).json({
        commitSha: commit.sha,
        htmlUrl: `https://github.com/${repo}/commit/${commit.sha}`,
        files: cleanFiles.length,
        branch: targetBranch,
      });
    }

    return res.status(400).json({ error: 'unknown action' });
  } catch (err) {
    return res.status(502).json({ error: String(err.message || err) });
  }
}

// Each blob upload is one MP4. Vercel's gateway hard-caps request bodies at
// ~4.5 MB; bumping bodyParser to 5mb gives the parser room to match. Captures
// larger than ~3 MB raw (~4 MB base64) will get rejected at the gateway and
// the client will need to reduce resolution/bitrate.
export const config = {
  api: {
    bodyParser: { sizeLimit: '5mb' },
  },
};
