# New feature proposals for AI Rudder v2

Organized by tier. **P-SEC** fixes the P-CRITICAL findings from Phase 1 and must ship in Migration Wave 4 at the latest. **T1** are the interesting new capabilities the user opened the door to ("feel free to implement new interesting related features necessary"). **T2** are nice-to-haves for later.

---

## P-SEC — Security (non-negotiable, must ship)

### 1. Server-side API proxy

Today the app calls OpenAI, ElevenLabs, and Surfe from the browser with provider keys in the bundle. Anyone can exfiltrate those keys from View Source.

**Build:** `/api/ai/notes`, `/api/voice/tts`, `/api/voice/asr`, `/api/enrichment/surfe` as Vercel serverless functions. Each function reads its provider key from `process.env`, validates the caller's session cookie, enforces per-user quotas, forwards the request, and streams the response.

### 2. Proper server-side auth

Replace the `CREDENTIALS` array (plaintext passwords in the JS bundle) with:
- Users stored in **Vercel KV** (or Postgres via Neon).
- Passwords hashed with **Argon2id**.
- Sign-in via `/api/auth/login` returning an **httpOnly, Secure, SameSite=Lax** session cookie (JWT signed with `AUTH_SECRET`).
- CSRF protection via a double-submit token.
- Role claims (`admin` / `viewer`) carried in the JWT, enforced in every API route.
- Forgot-password: send a signed one-time link via Resend / SendGrid; expire in 15 min.
- Optional TOTP / passkeys for admin accounts.

### 3. Rate-limiting + billing guardrails

- **Upstash Ratelimit** or Vercel Edge KV: 30 AI calls / user / min, 100 / day.
- Hard monthly cap per user, enforced in the proxy.
- Alert (email + Slack) when monthly provider spend exceeds threshold.

### 4. Audit log

Every AI call, every account-data change, every login attempt → append-only log in Postgres. Filterable in `/settings/audit`. Critical for SOC2 / ISO 27001 readiness if this product gets sold externally.

### 5. CI secret-scanning

- Add **Gitleaks** or **trufflehog** as a GitHub Action; fail PRs that introduce key-shaped strings.
- Enable GitHub's native **push protection** (it already caught our first commit — keep it on repo-wide).

---

## T1 — New interesting features (recommended for v2)

### 6. ⌘K Command Palette

A `cmdk`-powered global palette. Fuzzy-search across accounts, briefings, decision makers, and commands ("Open ICP ranking", "Add cadence step", "Switch to English", "Toggle dark mode"). Keyboard-first usage is what distinguishes elite sales tools. **Est. 2 days.**

### 7. AI Co-Pilot upgrade: streaming, citations, voice

- Stream the response token-by-token via the `/api/ai/notes` proxy (Vercel's streaming runtime).
- Every AI claim cites the source (which account record, which briefing, which call transcript) — a footnote row beneath each paragraph.
- Voice input via the Web Speech API → transcribed to the server via ElevenLabs ASR → processed. Voice output via ElevenLabs TTS so the co-pilot can read the next-step plan aloud in PT-BR, EN-US, or zh-CN.
- Per-conversation memory stored server-side, resumable across sessions.

### 8. Decision-Maker Map

Replace the flat "Key Decision Makers" list with an **interactive force-directed graph** (D3 / visx) showing, for each account:
- Circles sized by seniority / influence score.
- Edges: reports-to relationships (from Surfe / LinkedIn enrichment).
- Colors: red (blocker), yellow (neutral), green (champion), gray (unknown).
- Hover for briefing notes, last-contact date, cadence step.
- Keyboard-navigable, with a list-mode toggle for screen readers.

### 9. Sales Cadence Heatmap

Replace the static "Cadência inteligente" panel with a **calendar heatmap** (GitHub-contributions-style) showing per-account activity: emails sent, calls made, meetings booked. Click a cell → drill into that day's activity. Identify accounts going cold at a glance.

### 10. ICP Ranking: virtualized, sortable, filterable table with inline sparklines

The current ICP cards show "item loading…" placeholders. Replace with a `@tanstack/react-table` + virtualized (`@tanstack/react-virtual`) data table:
- Columns: Rank · Logo · Account · Tier · Sector · Deal Size · Last Activity · AI Score (with sparkline) · Next Action.
- Sort any column, multi-column filters, full-text search across name/sector.
- Click a row → slide-in drawer with full account detail.
- Bulk select → bulk Surfe enrichment trigger.

### 11. Go-to-Market Map

An interactive **Brazil map (D3 + topojson)** shaded by TAM per region, with clickable states that drill into the account list for that region. Toggle view: by state, by industry cluster, by rep territory.

### 12. Trilingual support: zh-CN added

Full i18n for **pt-BR, en-US, zh-CN** (Simplified Chinese) via i18next. Locale switcher in the top-right (currently PT / EN chips → extended to PT / EN / 中文). Numbers, dates, currencies formatted per locale. Reviewed/corrected translations for the 19 strings that today have identical PT/EN text (flagged in the audit).

### 13. Realtime collaboration (presence + live cursors)

If two reps are on the same account page, show each other's avatars + live cursors (Liveblocks or a self-hosted Yjs). Enables "pair selling". Lightweight implementation — just presence + cursors, no deep CRDT state.

### 14. Export & share

- Export any table to CSV / Excel.
- Generate a **one-click PDF briefing** for any account (server-side via Puppeteer on Vercel).
- Share a read-only snapshot link (expires in 7 days, JWT-signed).

### 15. Integrations

- **Slack**: DM the rep every morning with the day's top 3 briefings.
- **Google Calendar / Outlook**: auto-create meeting cards from the cadence.
- **HubSpot / Salesforce CRM** two-way sync.
- **Webhooks** outbound for every pipeline stage change.

### 16. Mobile-first redesign

Current app is passably responsive but not designed for mobile. Bottom tab bar (5 destinations: Overview, Accounts, Co-Pilot, Cadence, Menu), swipeable cards, pull-to-refresh, offline-first briefings (IndexedDB via Dexie).

---

## T2 — Nice-to-have (backlog)

- **Dark / light mode auto-switching** by system + time-of-day override.
- **Keyboard shortcuts reference panel** (`?` opens it).
- **Personal AI coach**: weekly digest emailed to the rep, "You went 3 days without activity on Nubank — here's a suggested email draft."
- **A/B-testable email templates** for the cadence builder, with reply-rate tracking.
- **On-device inference** for classification tasks (whisper-tiny transcription, e-mbedding for semantic search) via `transformers.js` — removes some paid API costs.
- **SSO**: Google Workspace + Microsoft Entra ID via NextAuth.
- **Audit-ready compliance pack**: export of all user/account-data access logs, delete-my-data self-service.
- **Public API + API keys** for customers to push their own data in.
- **Plugin system** — custom fields, custom views, custom AI prompts per team.

---

## Sequencing recommendation

**Wave 3 of the migration** (see `design/framework-decision.md`) is the right time to ship **#1 + #2 + #3 + #5** (security baseline) and **#12** (zh-CN / i18n refactor — it must land before the translation strings fossilize further).

**Wave 5** adds **#6 + #8 + #10** (command palette + decision-maker map + ICP ranking table) which together elevate the product from "decent internal tool" to "commercial-grade sales intelligence".

Everything else lives in the backlog until the core ships.
