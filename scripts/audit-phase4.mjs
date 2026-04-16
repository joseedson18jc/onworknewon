// Phase 4 — Closed-loop verification of the rebuilt app
// Run: node scripts/audit-phase4.mjs  (expects the preview server on http://localhost:4173)

import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const URL = process.argv[2] || 'http://localhost:4173/';
const DATE = new Date().toISOString().slice(0, 10);
const OUT = join(process.cwd(), 'reports', `screenshots-${DATE}-after`);
await mkdir(OUT, { recursive: true });

const VIEWPORTS = [
  { name: 'mobile', width: 375, height: 812 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'laptop', width: 1280, height: 800 },
  { name: 'desktop', width: 1536, height: 960 },
];

const summary = { url: URL, capturedAt: new Date().toISOString(), before: {}, after: {}, findings: [] };

async function capture(browser, authenticated) {
  const context = await browser.newContext({ ignoreHTTPSErrors: true, viewport: { width: 1536, height: 960 } });
  const page = await context.newPage();
  const errors = [];
  const warnings = [];
  const failed = [];
  page.on('console', (m) => (m.type() === 'error' ? errors : m.type() === 'warning' ? warnings : []).push?.(m.text()));
  page.on('pageerror', (e) => errors.push('[pageerror] ' + e.message));
  page.on('requestfailed', (r) => failed.push(r.url()));

  await page.goto(URL, { waitUntil: 'networkidle', timeout: 20_000 });
  if (authenticated) {
    // Sign in via demo-mode form
    await page.fill('input[autocomplete="username"]', 'jose');
    await page.fill('input[autocomplete="current-password"]', 'demo-mode-any-password');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(1500);
  }

  const vitals = await page.evaluate(() => {
    return new Promise((resolve) => {
      const out = { lcp: null, cls: 0, fcp: null, ttfb: null, longTasks: 0 };
      try { const n = performance.getEntriesByType('navigation')[0]; if (n) out.ttfb = Math.round(n.responseStart); } catch {}
      try { new PerformanceObserver((l) => { out.lcp = Math.round(l.getEntries().at(-1).startTime); }).observe({ type: 'largest-contentful-paint', buffered: true }); } catch {}
      try { new PerformanceObserver((l) => { for (const e of l.getEntries()) if (!e.hadRecentInput) out.cls += e.value; }).observe({ type: 'layout-shift', buffered: true }); } catch {}
      try { new PerformanceObserver((l) => { const e = l.getEntries().find((x) => x.name === 'first-contentful-paint'); if (e) out.fcp = Math.round(e.startTime); }).observe({ type: 'paint', buffered: true }); } catch {}
      try { new PerformanceObserver((l) => { out.longTasks += l.getEntries().length; }).observe({ type: 'longtask', buffered: true }); } catch {}
      setTimeout(() => { out.cls = Math.round(out.cls * 1000) / 1000; resolve(out); }, 3000);
    });
  });

  const a11y = await page.evaluate(() => {
    const visible = (el) => { const cs = getComputedStyle(el); return cs.display !== 'none' && cs.visibility !== 'hidden' && el.offsetWidth > 0; };
    const inputs = Array.from(document.querySelectorAll('input,textarea,select')).filter(visible);
    const unlabeled = inputs.filter((el) => {
      if (['hidden','submit','button'].includes(el.type)) return false;
      const hasLabel = el.id && document.querySelector(`label[for="${el.id}"]`);
      return !hasLabel && !el.getAttribute('aria-label') && !el.getAttribute('aria-labelledby');
    }).length;
    const btns = Array.from(document.querySelectorAll('button')).filter(visible);
    const unnamed = btns.filter((b) => !(b.textContent || '').trim() && !b.getAttribute('aria-label')).length;
    const h1 = document.querySelectorAll('h1').length;
    const landmarks = document.querySelectorAll('header, nav, main, aside, footer, [role]').length;
    const forms = document.querySelectorAll('form').length;
    const dom = document.getElementsByTagName('*').length;
    const skipLink = !!document.querySelector('a[href="#login-main"], a[href="#main"]');
    return { unlabeledInputs: unlabeled, unnamedButtons: unnamed, h1Count: h1, landmarks, forms, domNodes: dom, skipLink };
  });

  for (const vp of VIEWPORTS) {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.waitForTimeout(500);
    await page.screenshot({ path: join(OUT, `${authenticated ? 'overview' : 'login'}-${vp.name}-${vp.width}x${vp.height}.png`), fullPage: true });
  }

  await context.close();
  return { vitals, a11y, errors, warnings, failed };
}

const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
summary.after.login = await capture(browser, false);
summary.after.overview = await capture(browser, true);
await browser.close();

// Compare against Phase 1 baselines (hard-coded from earlier audits)
summary.before = {
  login: { vitals: { lcp: 1228, cls: 0.049, fcp: 1228, ttfb: 858 }, a11y: { unlabeledInputs: 30, unnamedButtons: 8, h1Count: 2, landmarks: 2, forms: 0, domNodes: 2304 } },
  overview: { vitals: { lcp: 1896, cls: 0.392, fcp: 1288, ttfb: 905 }, a11y: { unlabeledInputs: 19, unnamedButtons: 2, h1Count: 2, landmarks: 3, forms: 0, domNodes: 7732 } },
};

const deltas = {
  lcpOverview: summary.after.overview.vitals.lcp - summary.before.overview.vitals.lcp,
  clsOverview: summary.after.overview.vitals.cls - summary.before.overview.vitals.cls,
  domOverview: summary.after.overview.a11y.domNodes - summary.before.overview.a11y.domNodes,
  unlabeledInputsOverview: summary.after.overview.a11y.unlabeledInputs - summary.before.overview.a11y.unlabeledInputs,
  unnamedButtonsOverview: summary.after.overview.a11y.unnamedButtons - summary.before.overview.a11y.unnamedButtons,
  formsLogin: summary.after.login.a11y.forms - summary.before.login.a11y.forms,
};

await writeFile(join('reports', `after-${DATE}.json`), JSON.stringify({ ...summary, deltas }, null, 2));
console.log(JSON.stringify({ after: summary.after, deltas, errorsLogin: summary.after.login.errors.length, errorsOverview: summary.after.overview.errors.length }, null, 2));
