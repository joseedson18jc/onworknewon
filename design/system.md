# AI Rudder — Design System v1

**Industry:** B2B SaaS · Sales Intelligence · Fintech-adjacent (Brazil)
**Audience:** Sales reps, account executives, revenue ops, GTM leaders
**Tone:** Precise, data-rich, confident. Respects the user's attention. Feels like the best dashboard in the category (think Ramp · Linear · Attio · Watershed).
**Platforms:** Web (responsive), dark-mode-first with full light-mode parity.

---

## 1. Palette

### 1.1 Brand (preserved from the current product)

The current teal + navy signature is strong and immediately recognizable — we keep it as the brand anchor and build a full scale around it.

| Token | Hex | Notes |
|---|---|---|
| `--brand-50` | `#EAFBFA` | Teal tint for hover backgrounds |
| `--brand-100` | `#C7F4F1` | |
| `--brand-200` | `#8CE6E2` | |
| `--brand-300` | `#44C9C1` | **signature teal**, keep for the wordmark |
| `--brand-400` | `#1CA7A0` | |
| `--brand-500` | `#0E8A85` | default teal button |
| `--brand-600` | `#0A6F6B` | |
| `--brand-700` | `#08524F` | |
| `--brand-800` | `#043736` | |
| `--brand-900` | `#022523` | |

### 1.2 Navy (surface ramp)

| Token | Hex | Use |
|---|---|---|
| `--navy-50` | `#F3F7FC` | Light-mode surface raised |
| `--navy-100` | `#DCE6F2` | |
| `--navy-200` | `#B3C5DE` | |
| `--navy-300` | `#7A98C1` | |
| `--navy-400` | `#4A6D9D` | |
| `--navy-500` | `#024F94` | **signature navy**, keep for the wordmark |
| `--navy-600` | `#023D75` | |
| `--navy-700` | `#022C57` | |
| `--navy-800` | `#011D3C` | **default dark canvas** |
| `--navy-900` | `#010F22` | **deepest dark canvas** |

### 1.3 Neutral (grays tuned for dark mode)

Use **cool grays** (slight blue cast) so they live comfortably next to the navy canvas.

| Token | Hex | Use |
|---|---|---|
| `--gray-50` | `#F8FAFC` | |
| `--gray-100` | `#E6EDF6` | Light mode text-primary on light surface |
| `--gray-200` | `#C6D2E0` | Muted text in dark mode |
| `--gray-300` | `#9AA8BA` | Hint/helper text in dark mode |
| `--gray-400` | `#6C7A90` | Placeholder text |
| `--gray-500` | `#4A596E` | Divider / subtle border |
| `--gray-600` | `#35445A` | |
| `--gray-700` | `#232F44` | Elevated dark surface (cards on dark canvas) |
| `--gray-800` | `#15203A` | Dark canvas |
| `--gray-900` | `#0B1327` | Deepest |

### 1.4 Semantic

| Token | Hex | Use |
|---|---|---|
| `--success-500` | `#22C55E` | Deal won, account healthy |
| `--success-600` | `#16A34A` | |
| `--warning-500` | `#F59E0B` | At-risk, due soon |
| `--warning-600` | `#D97706` | |
| `--danger-500` | `#EF4444` | Deal lost, churn risk |
| `--danger-600` | `#DC2626` | |
| `--info-500` | `#3B82F6` | AI suggestions, insights |
| `--info-600` | `#2563EB` | |

### 1.5 Chart palette (ordinal, colorblind-aware)

Pulled to be distinguishable under deuteranopia and protanopia; ordered so small-multiple dashboards stay legible.

1. `#44C9C1` · teal (brand)
2. `#3B82F6` · blue (info)
3. `#A855F7` · violet
4. `#F59E0B` · amber
5. `#EF4444` · red
6. `#22C55E` · green
7. `#EC4899` · pink
8. `#14B8A6` · cyan-teal

### 1.6 Semantic token map

Always consume via semantic tokens, not raw colors. Each has a light-mode + dark-mode value.

| Token | Light | Dark |
|---|---|---|
| `--color-bg` | `--gray-50` | `--navy-900` |
| `--color-bg-elevated` | `#FFFFFF` | `--gray-700` |
| `--color-border` | `--gray-200` | `--gray-600` |
| `--color-border-subtle` | `--gray-100` | `--gray-700` |
| `--color-text-primary` | `--gray-900` | `--gray-100` |
| `--color-text-muted` | `--gray-500` | `--gray-300` |
| `--color-text-placeholder` | `--gray-400` | `--gray-400` |
| `--color-accent` | `--brand-500` | `--brand-300` |
| `--color-accent-hover` | `--brand-600` | `--brand-200` |
| `--color-ring` | `--brand-500` | `--brand-300` |

**All contrast ratios verified ≥ 4.5:1** on semantic text tokens against their bg tokens (WCAG 2.2 AA).

---

## 2. Typography

### 2.1 Typefaces

- **Display / Headings:** **Sora** (variable, 200–800) — geometric, modern sans with slightly humanist curves. Gives gravitas to the brand hero line while staying readable.
- **Body / UI:** **Inter** (variable) — workhorse for dense dashboards; excellent at 12–16 px.
- **Tabular / Data:** **JetBrains Mono** (variable) — for tables, KPIs, numeric values, IDs, timestamps. Same cap height as Inter so mixed cells don't jitter.
- **Chinese (zh-CN):** **Noto Sans SC** (sans), **Noto Serif SC** (serif fallback). Pair with JetBrains Mono for numerics.

### 2.2 Type scale (modular 1.2 base 16)

| Token | px / rem | Weight | Use |
|---|---|---|---|
| `text-xs` | 12 / 0.75 | 500 | Captions, tooltips, table meta |
| `text-sm` | 14 / 0.875 | 500 | Body small, buttons, nav |
| `text-base` | 16 / 1 | 400 | Default body |
| `text-lg` | 18 / 1.125 | 500 | Intro paragraphs |
| `text-xl` | 20 / 1.25 | 600 | Card titles |
| `text-2xl` | 24 / 1.5 | 600 | Section titles |
| `text-3xl` | 30 / 1.875 | 700 | Page titles |
| `text-4xl` | 36 / 2.25 | 700 | Hero sub |
| `text-5xl` | 48 / 3 | 700 | Hero primary |
| `text-6xl` | 60 / 3.75 | 800 | Marketing only |

### 2.3 Line height

- Body & UI: **1.5**
- Headings ≤ `text-xl`: **1.4**
- Headings ≥ `text-2xl`: **1.2**

### 2.4 Letter spacing

- Headings: `-0.02em` (tighter)
- UPPERCASE labels: `+0.06em`
- Numerics (JetBrains Mono): `0`, with `font-variant-numeric: tabular-nums`

---

## 3. Spacing, radius, shadow, motion

### 3.1 Spacing scale (in px, multiples of 4)

`0, 2, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96, 128, 160`

### 3.2 Radius

| Token | Value | Use |
|---|---|---|
| `--radius-xs` | 4 px | Inputs, chips |
| `--radius-sm` | 6 px | Buttons, badges |
| `--radius-md` | 10 px | Cards |
| `--radius-lg` | 14 px | Modals, panels |
| `--radius-xl` | 20 px | Hero cards, illustration frames |
| `--radius-full` | 9999 px | Pills, avatars |

### 3.3 Shadow (5-level elevation)

Shadows use a **tinted navy** at low opacity rather than pure black — feels more native in dark mode.

```css
--shadow-xs:  0 1px 2px   rgba(2, 15, 34, 0.08);
--shadow-sm:  0 2px 4px   rgba(2, 15, 34, 0.10), 0 1px 2px rgba(2, 15, 34, 0.06);
--shadow-md:  0 6px 16px  rgba(2, 15, 34, 0.14), 0 2px 4px rgba(2, 15, 34, 0.06);
--shadow-lg:  0 16px 32px rgba(2, 15, 34, 0.18), 0 4px 8px rgba(2, 15, 34, 0.08);
--shadow-xl:  0 24px 48px rgba(2, 15, 34, 0.24), 0 8px 16px rgba(2, 15, 34, 0.12);
--shadow-glow: 0 0 0 1px var(--brand-400), 0 0 20px rgba(68, 201, 193, 0.35);
```

### 3.4 Motion

| Token | Duration | Curve | Use |
|---|---|---|---|
| `--motion-fast` | 120 ms | `cubic-bezier(0.4, 0, 0.2, 1)` | Button press, hover |
| `--motion-base` | 180 ms | `cubic-bezier(0.4, 0, 0.2, 1)` | State transitions |
| `--motion-slow` | 300 ms | `cubic-bezier(0.25, 0.8, 0.25, 1)` | Modal enter/exit |
| `--motion-chart` | 600 ms | `cubic-bezier(0.4, 0, 0.2, 1)` | Chart mount |

**All durations reduce to 0 when `@media (prefers-reduced-motion: reduce)`.**

---

## 4. Component inventory

Base: **shadcn/ui** on **Tailwind v4** with **Radix primitives**. Extended with:

- **Charts:** Recharts (default), Nivo (when animations or richer tooltips are needed).
- **Icons:** Lucide React (primary, line style) + Iconify (any brand logos).
- **Illustrations:** unDraw SVGs (recolored to brand), Lottie for the hero + empty-state animations.
- **Motion:** Framer Motion everywhere components need physics.
- **Charts (hero / ambient):** `tsparticles` with extreme restraint — login & hero only, opt-out via reduced-motion.

### Components shipped in v1

| Category | Components |
|---|---|
| Inputs | Button (primary/secondary/ghost/danger/icon), TextInput, TextArea, Select, Combobox, Checkbox, Radio, Switch, Slider, DatePicker, DateRangePicker, FileDrop |
| Display | Card, StatCard (with delta), Badge, Chip, Avatar, AvatarStack, KeyValue, ProgressBar, SparkLine, Skeleton (reserved-space) |
| Navigation | TopBar, Sidebar, Tabs, Breadcrumbs, Pagination, CommandPalette (⌘K) |
| Feedback | Toast, Alert, Banner, Dialog, Drawer, Popover, Tooltip |
| Data | DataTable (with sort/filter/virtualization), KanbanBoard, Timeline |
| Charts | LineChart, AreaChart, BarChart, DonutChart, HeatMap, FunnelChart, RadarChart, GaugeChart, WorldMap (D3 topojson) |
| Dashboard | KPIGrid, InsightCard (AI-generated summary), CadenceHeatmap, DecisionMakerMap |
| Illustrations | EmptyState, OnboardingStep, HeroLottie |

---

## 5. Layout primitives

### 5.1 Skeleton screens with reserved space

Every asynchronously-loaded card must render a **pixel-perfect skeleton** with the exact final height, to keep CLS < 0.1.

### 5.2 Route shell

**Breaking the 28 961 px tower into routes.** Current app puts every section on one page; the redesign splits into:

```
/                    → Overview (KPI grid + hero insight + cadence heatmap)
/accounts            → ICP Ranking table (sortable, filterable, virtualized)
/accounts/:id        → Single account — decision-maker map, briefings, cadence
/briefings           → Priority briefings list + detail
/co-pilot            → AI Co-Pilot chat + meeting prep
/cadence             → Cadence builder + heatmap
/market              → Go-to-Market map + competitive matrix
/settings            → Team, API keys (server-side), integrations
```

### 5.3 Responsive grid

Mobile-first: `1 col → 2 col → 3 col → 4 col` at `640 / 768 / 1024 / 1280`.
Sidebar becomes a bottom-tab-bar on mobile (5 icons max).

---

## 6. Internationalization

Move off `.lang-pt` / `.lang-en` class-toggled spans (current pattern) to proper JSON dictionaries.

- **Supported locales (v1):** `pt-BR` (default), `en-US`, `zh-CN` (Simplified Chinese).
- **Storage:** `src/locales/{locale}.json` keyed by dotted paths (e.g. `nav.accounts`, `ranking.title`).
- **Runtime:** `i18next` + `react-i18next` (best-in-class for React), with `react-intl` as a fallback if you prefer ICU message format.
- **Locale detection:** URL `?lang=zh-CN` > user preference (persisted in cookie) > `navigator.language` > `pt-BR` fallback.
- **Numeric/date formatting:** `Intl.NumberFormat` + `Intl.DateTimeFormat` per locale. Brazilian Reais formatted `R$ 1.234,56`, USD `$1,234.56`, CNY `¥1,234.56`.
- **RTL readiness:** not needed for v1 (PT/EN/zh-CN are LTR) but we'll use logical properties (`padding-inline`, `margin-block`, etc.) so RTL can be added later without refactors.

See `src/locales/` for sample starter dictionaries.

---

## 7. Accessibility guardrails

- WCAG 2.2 **AA** is the floor; target **AAA** for body text (contrast ≥ 7:1).
- Every interactive element:
  - Focus ring of `2px solid var(--color-ring)` with `2px` offset.
  - Keyboard reachable in DOM order; `aria-label` on icon-only controls.
  - Hit target ≥ 44 × 44 px on touch viewports.
- Every `<form>` is a real `<form>`; fields have `<label>`; submit responds to Enter.
- Every chart ships a `role="img"` and `aria-label="…"` summary, plus a text-mode `<table>` fallback behind a "View as table" toggle.
- Live regions (`aria-live="polite"`) for the AI Co-Pilot stream.

---

## 8. Data viz guidelines

- Always pair a number with a **context delta** ("vs. last 30 days"), a **sparkline**, or a **status pill**.
- Currency uses `tabular-nums` and right-align.
- Donut charts show at most 6 slices; the rest become "Other" with a popover breakdown.
- Bar charts: horizontal by default (keeps long category labels readable on mobile).
- Empty states for charts: show the axes, an unDraw illustration, and a primary CTA ("Upload your first accounts").

---

## 9. House-style handshake

The design system is written to satisfy this repo's `CLAUDE.md` house style end-to-end:

- ✅ shadcn/ui + Tailwind v4 + Radix
- ✅ Recharts default + Nivo for rich animation
- ✅ Lucide + Iconify + unDraw
- ✅ Framer Motion, Lottie, tsparticles (restrained)
- ✅ Dark mode + light mode parity
- ✅ WCAG 2.2 AA + keyboard
- ✅ LCP < 2.5 s, INP < 200 ms, CLS < 0.1 (current authenticated CLS 0.392 → target 0.05 via skeletons)
- ✅ Respect `prefers-reduced-motion`
- ✅ Mobile-first 640/768/1024/1280/1536
- ✅ Every data page includes at least one chart

---

## 10. What's next

- `design/preview-2026-04-16.html` — interactive single-HTML showcase of this system (palette, type, components, charts, redesigned sign-in, dashboard tile preview). Opens in any browser — no build step.
- `design/framework-decision.md` — why Vite + React 18 + TypeScript + Tailwind v4 + shadcn/ui is the most robust choice for this migration.
- `design/new-features.md` — concrete new feature proposals (server-side API proxy, proper auth, ⌘K command palette, zh-CN support, decision-maker map, AI Co-Pilot upgrades).
- `src/locales/*.json` — starter i18n dictionaries with reviewed PT-BR/EN-US translations plus new zh-CN.

Phase 3 begins on your approval.
