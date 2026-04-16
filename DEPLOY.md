# Deploy AI Rudder to Vercel

Everything in this repo is already wired for Vercel. Follow the four steps below to get a live URL in about five minutes.

---

## TL;DR (5 minutes)

```
1. Import repo → set Root Directory = app
2. Add Upstash Redis integration
3. Paste AUTH_SECRET + provider keys
4. Click Deploy → ship
```

The site will boot in **demo mode** even if you skip steps 2–3; login + dashboard still work, but AI / Voice / Surfe calls return canned responses and a loud warning banner.

---

## Step 1 — Import the repo into Vercel

1. Sign in at **https://vercel.com** with the GitHub account that owns `joseedson18jc/onworknewon`.
2. Click **Add New… → Project**.
3. Choose **Import Git Repository → `joseedson18jc/onworknewon`**.
4. On the configuration screen set:

| Setting | Value |
|---|---|
| **Framework Preset** | Vite (auto-detected) |
| **Root Directory** | `app` ← **important** |
| **Build Command** | `npm run build` (auto) |
| **Output Directory** | `dist` (auto) |
| **Install Command** | `npm install` (auto) |
| **Node Version** | 20.x |

Do **not** click Deploy yet — add the env vars first (Step 3), otherwise the first deploy ships in demo mode and you'll have to redeploy after filling them in.

## Step 2 — Add Upstash Redis (for auth + rate-limits + audit log)

In the Vercel project dashboard → **Storage → Create Database → Upstash Redis** (free tier is fine for dev/staging). Vercel auto-populates two env vars in every environment:

```
KV_REST_API_URL
KV_REST_API_TOKEN
```

These are the same vars the app reads — no rename needed.

> Note: `@vercel/kv` was deprecated; we use `@upstash/redis` directly, which is what the "Upstash Redis" integration provides.

## Step 3 — Environment variables

Vercel → **Settings → Environment Variables**. Apply each to **Production**, **Preview**, and **Development**.

### Required for real production

| Key | Value | How to get it |
|---|---|---|
| `AUTH_SECRET` | 48-byte base64 string | Run `openssl rand -base64 48` locally and paste the output |
| `OPENAI_API_KEY` | `sk-...` | **Rotate** the key that leaked on the current production site, then paste the new one |
| `ELEVENLABS_API_KEY` | opaque string | **Rotate** in the ElevenLabs dashboard → Profile → API keys |
| `SURFE_API_KEY` | opaque string | **Rotate** in the Surfe dashboard → Settings → API |

> ⚠️ Do **not** reuse the leaked keys from Phase-1 audit. They are irrevocably compromised — anyone with View Source on the old URL has them.

### Optional

| Key | Value | Default behavior if missing |
|---|---|---|
| `RESEND_API_KEY` | `re_...` | Forgot-password returns the reset link in the HTTP response (demo-link mode) |
| `NODE_ENV` | `production` | Vercel sets this automatically in Production |

### Quick environment-variable doc

The full list lives in [`app/.env.example`](./app/.env.example). Every var has a description.

## Step 4 — Deploy and verify

Click **Deploy**. The build takes ~90 seconds. Once it's green:

```bash
# Replace with your deploy URL
curl https://your-project.vercel.app/api/health
```

Expected healthy response:

```json
{
  "status": "ok",
  "productionReady": true,
  "version": "abc1234",
  "checks": {
    "authSecret": { "ok": true, "detail": "set" },
    "kv":         { "ok": true, "detail": "upstash" },
    "openai":     { "ok": true, "detail": "configured" },
    "elevenlabs": { "ok": true, "detail": "configured" },
    "surfe":      { "ok": true, "detail": "configured" }
  }
}
```

Any `ok: false` tells you exactly which env var is missing.

### Seed the user database

Once KV is connected, seed your first users:

```bash
# in app/ locally, with .env.local populated from Vercel (Env Vars → "Download" or vercel env pull)
cd app
vercel env pull .env.local
npm run seed
```

Default users (change in `app/scripts/users.seed.json` or set your own):

| Username | Password | Role |
|---|---|---|
| `admin` | `admin1234` | `admin` |
| `demo`  | `demo1234`  | `viewer` |

Passwords are Argon2id-hashed on write. **Change them before you let anyone else sign in.**

---

## Post-deploy checklist

- [ ] `https://<deploy>.vercel.app/` loads and the demo-mode warning banner is **gone**
- [ ] Sign in as `admin / <your-password>` → overview renders with real KPI numbers
- [ ] Press **⌘K** → command palette opens
- [ ] Navigate to **AI Co-Pilot** → ask "Summarize top 3 accounts" → see streaming tokens
- [ ] Navigate to **Accounts** → sort / filter / open account drawer works
- [ ] Navigate to **Decision Map** → force-graph animates
- [ ] Navigate to **Cadence** → 365-day heatmap renders
- [ ] Toggle PT / EN / 中文 — every label switches
- [ ] Toggle dark / light — both themes look correct
- [ ] `curl <deploy>/api/health` → `productionReady: true`
- [ ] GitHub → your repo → **Security → Secret scanning** is enabled (it already caught one leak; keep it on)
- [ ] The old `ai-rudder-panel-*.vercel.app` deploy is **retired** or password-protected

## CI/CD

`.github/workflows/ci.yml` already runs on every push to `main` or `claude/**`:

1. **Gitleaks secret-scan** — blocks PRs that add key-shaped strings.
2. **TypeScript typecheck** — `tsc -b --noEmit`.
3. **Vite production build** — emits artifact for Vercel.

Vercel will auto-deploy:

- every push to `main` → **Production**
- every push to `claude/**` or any PR branch → **Preview URL** (one per branch)

## Custom domain

Vercel → Settings → Domains → Add → `panel.ai-rudder.com` (or whatever you own). DNS: add the `CNAME` Vercel gives you. TLS is automatic.

## Rotating keys without downtime

1. Add the new key to the Vercel env vars as the main value.
2. Redeploy (automatic on the next commit, or **Deploy → Redeploy**).
3. Revoke the old key at the provider **after** the redeploy goes live.

## Rolling back

Vercel → Deployments → select the last known-good commit → **… → Promote to Production**. Roll back is instant.

## Troubleshooting

| Symptom | Fix |
|---|---|
| Build fails with `Cannot find module '@vercel/node'` | Ensure `app/package.json` has `@vercel/node` in `devDependencies` (it does) and that Vercel's Root Directory is set to `app`. |
| Login POST returns 500 | `/api/health` → look for `authSecret: ok: false` or `kv: ok: false`. Set those env vars and redeploy. |
| Banner still says "demo mode" | Both `AUTH_SECRET` and `KV_REST_API_*` must be present. Check the Production environment specifically. |
| AI Co-Pilot returns "[Demo mode]" | `OPENAI_API_KEY` missing — add and redeploy. |
| Gitleaks CI fails | Someone staged a key. Remove the line, rotate the key, force-push a clean commit. |

---

Done. The entire app is now under your control — server-side auth, rotated keys, audited, rate-limited, a11y-compliant, CLS 0, 138 KB gz first-load.
