# Framework decision — Vite + React 18 + TypeScript + Tailwind v4 + shadcn/ui

## TL;DR

**Migrate from the current vanilla HTML + inline JS single-file app to:**

```
Vite 5 · React 18 · TypeScript 5 · Tailwind v4 · shadcn/ui · Radix
+ TanStack Router · TanStack Query · Zustand · Recharts · Framer Motion
+ i18next · Playwright · Vitest · Storybook + Chromatic
+ Vercel Serverless Functions for the API proxy
```

This is the most robust, modern, and low-risk stack for a sales-intelligence dashboard in 2026.

## Why not other options

| Option | Why not |
|---|---|
| **Stay vanilla + drop in a component kit** | The 325 KB inline JS bundle is already unmanageable and not code-split. Every new feature makes this worse. Bilingual toggle, route splitting, proper auth, state management, and testing are all paid for by a framework anyway. |
| **Next.js 15 (App Router)** | Great, but overkill here. You don't need SSR for a fully-authenticated dashboard — every page is user-specific, so SSR adds latency without SEO benefit. Vite is ~3× faster in dev and the SPA-only model is simpler. Vercel serves Vite apps just as well. |
| **Remix / React Router v7** | Solid, but its server-first philosophy is better for content sites. For dashboards, TanStack Router + Query is a tighter fit. |
| **SvelteKit** | Smaller bundles, but the ecosystem for dashboards (Recharts, shadcn, Radix) is thinner, and TypeScript inference for Svelte 5 is still maturing. React's hiring pool in Brazil is far deeper, which matters if this team grows. |
| **Vue + Nuxt** | Similar ecosystem tradeoffs. Vue 3's DX is great but the chart/design-system ecosystem leans React. |
| **SolidJS** | Fastest, but ecosystem immaturity makes it a bet rather than a safe choice for a production B2B dashboard. |

## Core choices, explained

### Build: **Vite 5**

- **< 200 ms hot-reload** on a 50-route app.
- First-class TypeScript, ESM, and Lightning CSS support.
- Rollup for production: smaller output than webpack, tree-shakes aggressively.
- Works natively on Vercel (zero config).

### Framework: **React 18**

- Concurrent rendering (`useTransition`, `useDeferredValue`) keeps the dashboard responsive while filtering large tables.
- Suspense + streaming for skeleton screens → fixes the CLS 0.392 regression identified in Phase 1b.
- React 19 is landing; React 18 stays on `18.3.x` as the LTS baseline. Upgrade path to 19 is a drop-in once it goes GA.

### Language: **TypeScript 5 (strict)**

- Catches the 19 unlabeled-input + 2 unnamed-button bugs at compile time via typed props on our `<Input>` and `<IconButton>` wrappers.
- Models the sales-intelligence domain (`Account`, `DecisionMaker`, `Briefing`, `Cadence`, `ICPTier`) so refactors are safe.

### Styling: **Tailwind v4 + shadcn/ui + Radix primitives**

- Tailwind v4's **CSS-native engine** is ~5× faster than v3, zero-config, auto-imports design tokens from `@theme`.
- shadcn/ui gives us un-vendored, copy-paste components on Radix primitives — we own the code, no lock-in, no runtime dep beyond Radix.
- Zero CSS-in-JS runtime → smaller bundles, no hydration cost.

### Routing: **TanStack Router**

- Type-safe routes (the path `/accounts/:id` knows `params.id` is a string, compile-time checked).
- Handles loader + search-param state better than React Router for data-heavy dashboards.
- Solves the Phase 1b finding *"28 961 px page, no real routing"* cleanly.

### Data fetching: **TanStack Query**

- Request deduping, caching, automatic refetch, optimistic updates — all free.
- Pairs with a server-side API proxy (see `design/new-features.md`).

### State: **Zustand** (local UI) + **TanStack Query** (server state)

- Zustand for sidebar collapse, dark mode, active filters. No Redux boilerplate.
- Query for everything that comes from the server.

### Charts: **Recharts** default, **Nivo** for rich animation

- Recharts: declarative React components, SVG-based, excellent a11y hooks.
- Nivo: when we need smooth chart transitions on the Portfolio Breakdown or a D3-grade heatmap for the cadence view.

### Motion: **Framer Motion**

- Shared-layout transitions between the accounts list ↔ account detail.
- Gesture handling for drag-to-reorder in the cadence builder.
- Respects `prefers-reduced-motion` out of the box.

### i18n: **i18next + react-i18next**

- Best-in-class React i18n library; supports nested namespaces, pluralization, ICU message format, lazy loading per-locale.
- Supports **PT-BR, EN-US, zh-CN** out of the box; adding a 4th locale later is a JSON file.
- Detection chain: URL `?lang=` → user preference cookie → `navigator.language` → `pt-BR` fallback.

### Backend: **Vercel Serverless Functions** (`/api/*.ts`)

Today the app calls OpenAI / ElevenLabs / Surfe **directly from the browser** with keys baked into the bundle (the P-CRITICAL finding).

**Migration:**
- `/api/ai/notes` proxies to OpenAI, reads the key from `process.env.OPENAI_API_KEY`.
- `/api/voice/tts` proxies to ElevenLabs.
- `/api/enrichment/surfe` proxies to Surfe.
- `/api/auth/*` handles proper login via an httpOnly session cookie (JWT, signed with `process.env.AUTH_SECRET`).
- Password hashing: **Argon2id** for new passwords, **bcrypt** compat for migrations.
- Rate-limiting via Vercel Edge's built-in quotas or Upstash Ratelimit.

### Testing: **Vitest + Playwright + Storybook + Chromatic + axe**

- **Vitest** — unit tests for business logic (ICP scoring, cadence calculations).
- **Playwright** — e2e, including the visual audit script we already wrote.
- **Storybook** — every component gets a story; doubles as living design-system docs.
- **Chromatic** — visual regression on every PR.
- **@axe-core/playwright** — a11y regression in CI.

## Migration plan (phase 3 will execute)

### Migration wave 1 — scaffolding (no visual change for users)

1. `pnpm create vite@latest onworknewon --template react-ts`, move into a `app/` subfolder.
2. Copy current HTML/CSS into `app/public/legacy.html` as a safety net.
3. Set up Tailwind v4 with the design tokens from `design/system.md`.
4. Import shadcn/ui components via the CLI (`npx shadcn@latest add button card input …`).
5. Set up TanStack Router with the route tree from `design/system.md` §5.2.

### Migration wave 2 — rebuild the sign-in + overview

1. Replace login with a proper `<form>`, `react-hook-form` + Zod validation, submits to `/api/auth/login`.
2. Build the `/` overview route: KPI grid (StatCard × 6), Portfolio Breakdown donut, Cadence heatmap, AI insight banner, priority briefings list.
3. Build the skeleton-screen primitive; every async card uses it.
4. Connect i18n, ship PT-BR + EN-US parity + zh-CN stub.

### Migration wave 3 — each existing section becomes a route

`/accounts`, `/accounts/:id`, `/briefings`, `/co-pilot`, `/cadence`, `/market`, `/settings` — one wave per feature, each as a standalone commit series.

### Migration wave 4 — server-side auth + API proxy

1. Rotate all keys (must be done regardless).
2. Migrate Surfe / OpenAI / ElevenLabs calls to serverless functions.
3. Move `CREDENTIALS` to a database (start with Vercel KV / Upstash Redis); hash passwords with Argon2id.

### Migration wave 5 — retire the legacy HTML

Once the new app reaches full feature parity + audit passes, delete `app/public/legacy.html`.

## Size & perf budget

| Metric | Budget |
|---|---|
| JS first-load (gzipped) | < 180 KB |
| CSS first-load (gzipped) | < 20 KB |
| Largest chunk | < 220 KB |
| LCP | < 1.8 s (current post-auth 1 896 ms — marginal) |
| INP | < 150 ms |
| CLS | **< 0.05** (current post-auth 0.392) |
| Lighthouse Performance | ≥ 95 |
| Lighthouse Accessibility | ≥ 100 |
| Lighthouse Best Practices | ≥ 100 |

## Risks & mitigations

| Risk | Mitigation |
|---|---|
| Team unfamiliarity with React/TS | Stack is the industry default in Brazil; shadcn/ui is un-vendored so the learning surface is only React + Tailwind. |
| Migration freezing feature work | Strangle pattern: legacy HTML and new app coexist on different routes during migration. |
| Vercel vendor lock | All the above runs on any Node host (Railway, Fly, Cloudflare Pages) with one config file. |
| Bundle bloat over time | Rollup bundle-analyzer check in CI; Chromatic visual regression catches accidental heavy imports. |

## Why this is "the most robust"

- Every library above has ≥ 1M weekly downloads and active 2026 maintenance.
- Every library above is what the top 3 dashboards in the category (Linear, Attio, Ramp) actually use in some combination.
- Zero proprietary vendor lock-in: all OSS, MIT/Apache licensed, self-hostable.
- Best-in-class hiring pool in Brazil for every layer.
- Plays perfectly with the **UI/UX Pro Max** + **Refactoring UI** + **Frontend Aesthetics** + **Web-Artifacts-Builder** skills already installed in this repo.
- Plays perfectly with the **Chrome DevTools MCP** + **Playwright MCP** closed-loop verification layer.
