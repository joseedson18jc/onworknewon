# CLAUDE.md — Webapp Analyzer & UI/UX Redesign Studio

This repo is configured as a **layered skill + MCP stack** for Claude Code. When you drop in a webapp (local source and/or a live URL), Claude will audit it, propose a modern redesign, implement the changes, and verify them in a real browser in a closed loop.

## Layered toolbox

| Layer | Purpose | Tool |
|---|---|---|
| **1. Eyes** | Drive a real browser; screenshot, console, network, a11y tree, Core Web Vitals | `chrome-devtools` MCP (primary) + `playwright` MCP (CI, cross-browser) |
| **2. Audit brain** | Prioritized findings report from rendered pages + source | **Refactoring UI** skill + **claude-code-frontend-dev** plugin |
| **3. Design brain** | Modern style, palette, typography, chart + illustration system tuned to the product's industry | **UI/UX Pro Max** skill + **Frontend Aesthetics** (Anthropic first-party) |
| **4. Build hands** | Generate/refactor React/Vue/Svelte components, Tailwind, motion, charts, illustrations | **Web-Artifacts-Builder** skill + house-style libraries below |
| **5. Closed-loop fixer** | Edit → render → screenshot → diff → fix → repeat | **claude-code-frontend-dev** auto-triggers on frontend file edits |

See `README.md` for the one-time install commands.

## House style (non-negotiable defaults)

Every redesign must conform to these unless the user explicitly opts out.

### Visual system
- **Component base:** `shadcn/ui` on Tailwind v4 + Radix primitives
- **Charts:** **Recharts** (default), **Nivo** (rich animated), **ECharts** or **visx/D3** only for bespoke viz
- **Illustrations:** **unDraw** SVG set, **Iconify** (any icon), **Lucide** for UI icons, **Heroicons** for marketing
- **Motion:** **Framer Motion** for components, **Lottie** for hero illustrations, **tsparticles** for ambient backgrounds
- **Dark mode:** always shipped; palette must have equivalent light + dark tokens

### Quality gates
- **Accessibility:** WCAG 2.2 AA; keyboard-reachable; contrast ≥ 4.5:1 (≥ 3:1 for large text + UI components)
- **Core Web Vitals:** LCP < 2.5 s · INP < 200 ms · CLS < 0.1 (measured by `chrome-devtools` MCP)
- **Motion:** respect `prefers-reduced-motion`; no animation > 400 ms on primary interactions
- **Responsive:** mobile-first at 640 / 768 / 1024 / 1280 / 1536
- **Data density:** any page that presents numbers must include at least one chart/graph or visual summary

### Anti-patterns (auto-flag and rewrite)
- Walls of text without visual anchors
- Empty states with no illustration + no primary CTA
- Forms > 4 fields without progressive disclosure
- Tables without sort/filter/search on > 20 rows
- Color used as the only affordance (e.g. red text = error, with no icon or label)

## The four-phase workflow

When the user says *"analyze this app"* / *"modernize this page"* / *"start the audit"*:

### Phase 1 — Reconnaissance
1. Open the app (local dev server or live URL) via `chrome-devtools` MCP.
2. Capture screenshots at mobile (375), tablet (768), laptop (1280), desktop (1536).
3. Read console errors, network waterfall, a11y tree, Core Web Vitals.
4. Scan source for known anti-patterns (Refactoring UI rules).
5. Emit `reports/audit-<YYYY-MM-DD>.md` with prioritized findings (severity · screenshot · root-cause guess · suggested fix).
6. Stop and summarize to the user.

### Phase 2 — Design proposal
1. UI/UX Pro Max picks a style, palette, type scale, component token set, chart menu, illustration set for this product's industry.
2. Emit `design/system.md` (tokens + rationale) and a single-HTML preview artifact via Web-Artifacts-Builder.
3. **Do not touch `src/**` yet.** Wait for the user to approve the design system.

### Phase 3 — Implementation
1. All edits land on branch `claude/webapp-analyzer-ui-enhancement-7Qyaz` (or a derived feature branch).
2. Apply the design system: swap primitives, add the missing charts/illustrations/motion, fix bugs + a11y violations flagged in Phase 1, and add any new features the user explicitly asked for.
3. Commit in logical chunks; never squash the audit-fix commits with the feature-add commits.

### Phase 4 — Closed-loop verification
1. `claude-code-frontend-dev` re-renders each changed route, diffs screenshots, re-measures Web Vitals, re-runs a11y + functional checks.
2. If anything regressed, iterate fixes until all Phase 1 findings are closed **or** escalate unresolvable items back to the user.
3. Emit `reports/after-<YYYY-MM-DD>.md` with before/after screenshots, Web Vitals deltas, findings closed.
4. Push and ensure the draft PR is up to date.

## Conventions

- **Working branch:** `claude/webapp-analyzer-ui-enhancement-7Qyaz` (set by session instructions). Never push elsewhere without explicit permission.
- **Commits:** create new commits rather than amending. Descriptive messages, one concern per commit.
- **Reports directory:** `reports/` — never committed with screenshots as binary blobs > 1 MB; downscale first.
- **Design directory:** `design/` — design system docs + preview artifacts.
- **Tests:** co-locate Playwright specs under `tests/e2e/`, Vitest under `tests/unit/`, Storybook stories under `src/**/*.stories.tsx`.

## What not to do

- Don't redesign before Phase 2 is approved.
- Don't delete user code as a shortcut to pass the audit.
- Don't install heavy visual libraries without checking bundle impact — prefer the house-style list above.
- Don't bypass quality gates with `--no-verify` or by disabling a11y lints. If a gate fails, fix the root cause or escalate.
