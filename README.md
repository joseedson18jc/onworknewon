# onworknewon — Webapp Analyzer & UI/UX Redesign Studio

A Claude Code workspace pre-wired with the skill + MCP stack for **analyzing any webapp and rebuilding it** into a modern, intuitive, chart- and illustration-rich interface — in a closed loop.

## Deploy the rebuilt AI Rudder app

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fjoseedson18jc%2Fonworknewon&project-name=ai-rudder&root-directory=app&env=AUTH_SECRET,OPENAI_API_KEY,ELEVENLABS_API_KEY,SURFE_API_KEY&envDescription=Required+for+production.+Leave+blank+to+deploy+in+demo+mode.&envLink=https%3A%2F%2Fgithub.com%2Fjoseedson18jc%2Fonworknewon%2Fblob%2Fmain%2Fapp%2F.env.example)

One click → imports this repo → Vercel auto-detects Vite → set Root Directory to `app/` → add env vars → ship.

Step-by-step instructions + post-deploy verification in **[`DEPLOY.md`](./DEPLOY.md)**.

## Five-phase workflow (applied to AI Rudder · delivered on PR #1)

Drop in a webapp (local source or a live URL), run `start the audit`, and Claude will:

1. **Audit** the app through a real browser — screenshots, console, network, a11y, Core Web Vitals.
2. **Propose** a full design system tuned to your product's industry (style, palette, typography, charts, illustrations).
3. **Implement** the redesign — fix bugs, add missing features, add charts/graphs/motion — on the working branch.
4. **Verify** every change in a closed loop until the audit passes.
5. **Deploy** (Wave 4+) — server-side auth + API proxies + rate limiting + audit log + Vercel config.

The full operating manual is in [`CLAUDE.md`](./CLAUDE.md). The end-to-end audit → redesign → verify → deploy journey for this project is documented in [`reports/audit-2026-04-16.md`](./reports/audit-2026-04-16.md) and [`reports/after-2026-04-16.md`](./reports/after-2026-04-16.md).

## One-time install (to run the analyzer on a new target)

### 1. Claude Code plugins

```bash
# UI/UX Pro Max — design system generator (67 styles · 25 chart types · 161 palettes · 99 UX rules)
/plugin marketplace add nextlevelbuilder/ui-ux-pro-max-skill
/plugin install ui-ux-pro-max@ui-ux-pro-max-skill

# claude-code-frontend-dev — multimodal visual testing + closed-loop fixer
git clone https://github.com/hemangjoshi37a/claude-code-frontend-dev ~/.claude/plugins/frontend-dev
(cd ~/.claude/plugins/frontend-dev && npm install)
```

### 2. Claude Code skills (drop-in `SKILL.md` files)

Create `~/.claude/skills/<name>/SKILL.md` for each:

- **Refactoring UI Assistant** — visual-hierarchy/spacing/contrast auditor (source: `mcpmarket.com/tools/skills/refactoring-ui-assistant`)
- **Frontend Aesthetics** — Anthropic first-party; typography, color, motion, backgrounds
- **Web-Artifacts-Builder** — Anthropic first-party; React + Tailwind + shadcn/ui single-HTML artifacts

### 3. MCP servers

This repo's [`.claude/settings.json`](./.claude/settings.json) already registers:

- `chrome-devtools` — [`ChromeDevTools/chrome-devtools-mcp`](https://github.com/ChromeDevTools/chrome-devtools-mcp) (screenshots, console, network, Core Web Vitals)
- `playwright` — [`microsoft/playwright-mcp`](https://github.com/microsoft/playwright-mcp) (cross-browser, CI, visual regression)

Both launch via `npx` on first use; no manual install required.

### 4. Project dependencies

```bash
npm install
```

Pre-wires the house-style toolbox: **Recharts · Nivo · ECharts** (charts), **Framer Motion · Lottie · tsparticles** (motion), **Lucide · Iconify · Heroicons** (icons), **Tailwind v4 + shadcn/ui + Radix** (components), **Playwright · Vitest · Storybook + Chromatic** (testing + visual regression), **axe-core** (a11y).

## Kicking off the workflow

Once your webapp source is in this repo (or you have a live URL in mind):

```text
You: analyze and modernize this app. Start with Phase 1.

Claude: [Phase 1 — Reconnaissance]
        opens the app via chrome-devtools MCP…
        captures screenshots at 375/768/1280/1536…
        reads console + network + a11y tree…
        measures LCP / INP / CLS…
        writes reports/audit-2026-04-15.md
        summarizes top findings.
```

Approve the Phase 2 design system spec, then say *"go ahead with Phase 3"* and Claude will implement + Phase-4-verify the changes on branch `claude/webapp-analyzer-ui-enhancement-7Qyaz`, opening/updating a draft PR as it goes.

## Repo layout

```
.
├── CLAUDE.md              # operating manual + house style + 4-phase workflow
├── README.md              # this file
├── .claude/settings.json  # project MCP, permissions, hooks
├── .gitignore
├── package.json           # pre-wired chart / illustration / motion / testing deps
├── design/                # (created by Phase 2) design system spec + preview artifacts
├── reports/               # (created by Phase 1/4) audit + verification reports
├── src/                   # your webapp source (add it here)
└── tests/
    ├── e2e/               # Playwright specs
    └── unit/              # Vitest specs
```

## References

- [UI/UX Pro Max](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill)
- [claude-code-frontend-dev](https://github.com/hemangjoshi37a/claude-code-frontend-dev)
- [LibreUIUX-Claude-Code](https://github.com/HermeticOrmus/LibreUIUX-Claude-Code) (alternative heavyweight suite)
- [Chrome DevTools MCP](https://github.com/ChromeDevTools/chrome-devtools-mcp)
- [Playwright MCP](https://github.com/microsoft/playwright-mcp)
- [Anthropic — Improving frontend design through Skills](https://claude.com/blog/improving-frontend-design-through-skills)
- [awesome-claude-code](https://github.com/hesreallyhim/awesome-claude-code) · [awesome-claude-skills](https://github.com/travisvn/awesome-claude-skills) · [Claude-Code-Frontend-Design-Toolkit](https://github.com/wilwaldon/Claude-Code-Frontend-Design-Toolkit)
