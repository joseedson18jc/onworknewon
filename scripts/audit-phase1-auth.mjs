// Phase 1b — authenticated surface re-audit via sessionStorage bypass
// Run: node scripts/audit-phase1-auth.mjs

import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const URL = process.argv[2] || 'https://ai-rudder-panel-josemercadogc18-1904s-projects.vercel.app';
const DATE = new Date().toISOString().slice(0, 10);
const OUT = join(process.cwd(), 'reports', `screenshots-${DATE}-authenticated`);
await mkdir(OUT, { recursive: true });

const VIEWPORTS = [
  { name: 'mobile', width: 375, height: 812 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'laptop', width: 1280, height: 800 },
  { name: 'desktop', width: 1536, height: 960 },
];

const results = {
  url: URL,
  capturedAt: new Date().toISOString(),
  bypass: 'sessionStorage.rudder_auth=1',
  console: { errors: [], warnings: [] },
  network: { failed: [], slow: [], requestCount: 0, totalBytes: 0 },
  webVitals: {},
  a11y: { landmarks: [], headings: [], imgsNoAlt: [], inputsNoLabel: 0, buttonsNoName: 0, contrastWarnings: [] },
  sections: [],
  charts: { canvas: 0, svgCharts: 0, tables: 0, dataDensity: {} },
  meta: {},
};

const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
const context = await browser.newContext({ ignoreHTTPSErrors: true });
// BYPASS: seed auth in sessionStorage before any script runs
await context.addInitScript(() => {
  sessionStorage.setItem('rudder_auth', '1');
  sessionStorage.setItem('rudder_user', 'demo');
  sessionStorage.setItem('rudder_role', 'admin');
});
const page = await context.newPage();

page.on('console', (msg) => {
  if (msg.type() === 'error') results.console.errors.push(msg.text());
  else if (msg.type() === 'warning') results.console.warnings.push(msg.text());
});
page.on('pageerror', (err) => results.console.errors.push(`[pageerror] ${err.message}`));
const reqStart = new Map();
page.on('request', (req) => { results.network.requestCount++; reqStart.set(req, Date.now()); });
page.on('requestfailed', (req) => results.network.failed.push({ url: req.url(), failure: req.failure()?.errorText }));
page.on('response', async (res) => {
  const elapsed = Date.now() - (reqStart.get(res.request()) ?? Date.now());
  if (elapsed > 1500) results.network.slow.push({ url: res.url(), ms: elapsed, status: res.status() });
  try { results.network.totalBytes += (await res.body()).length; } catch {}
});

await page.setViewportSize({ width: 1536, height: 960 });
await page.goto(URL, { waitUntil: 'networkidle', timeout: 30_000 }).catch(async (e) => {
  results.console.errors.push(`[navigation] ${e.message}`);
  await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 30_000 });
});

// Give the app time to render the authenticated view (charts etc.)
await page.waitForTimeout(3000);

// If the app shows a login screen even with sessionStorage set, try calling enterApp()
await page.evaluate(() => {
  if (typeof enterApp === 'function') {
    try { enterApp(); } catch (e) { console.warn('enterApp failed', e); }
  }
  // If there's a #login element still visible, hide it and show #app
  const login = document.getElementById('login');
  const app = document.getElementById('app');
  if (login) login.style.display = 'none';
  if (app) app.style.display = '';
});
await page.waitForTimeout(2000);

// Web Vitals
results.webVitals = await page.evaluate(() => {
  return new Promise((resolve) => {
    const out = { lcp: null, cls: 0, fcp: null, ttfb: null, longTasks: 0 };
    try { const nav = performance.getEntriesByType('navigation')[0]; if (nav) out.ttfb = Math.round(nav.responseStart); } catch {}
    try { new PerformanceObserver((list) => { out.lcp = Math.round(list.getEntries().at(-1).startTime); }).observe({ type: 'largest-contentful-paint', buffered: true }); } catch {}
    try { new PerformanceObserver((list) => { for (const e of list.getEntries()) if (!e.hadRecentInput) out.cls += e.value; }).observe({ type: 'layout-shift', buffered: true }); } catch {}
    try { new PerformanceObserver((list) => { const e = list.getEntries().find((x) => x.name === 'first-contentful-paint'); if (e) out.fcp = Math.round(e.startTime); }).observe({ type: 'paint', buffered: true }); } catch {}
    try { new PerformanceObserver((list) => { out.longTasks += list.getEntries().length; }).observe({ type: 'longtask', buffered: true }); } catch {}
    setTimeout(() => { out.cls = Math.round(out.cls * 1000) / 1000; resolve(out); }, 3000);
  });
});

// Authenticated-surface a11y + structure audit
const a11y = await page.evaluate(() => {
  const visible = (el) => {
    const cs = getComputedStyle(el);
    return cs.display !== 'none' && cs.visibility !== 'hidden' && el.offsetWidth > 0 && el.offsetHeight > 0;
  };
  const landmarks = Array.from(document.querySelectorAll('header, nav, main, aside, footer, [role]'))
    .filter(visible)
    .map((el) => ({ tag: el.tagName.toLowerCase(), role: el.getAttribute('role'), id: el.id }));
  const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'))
    .filter(visible)
    .map((h) => ({ level: Number(h.tagName[1]), text: (h.textContent || '').trim().slice(0, 100) }));
  const imgsNoAlt = Array.from(document.querySelectorAll('img')).filter((i) => visible(i) && !i.hasAttribute('alt')).length;
  const inputsNoLabel = Array.from(document.querySelectorAll('input, textarea, select')).filter((el) => {
    if (!visible(el) || ['hidden', 'submit', 'button'].includes(el.type)) return false;
    const hasLabel = el.id && document.querySelector(`label[for="${el.id}"]`);
    return !hasLabel && !el.getAttribute('aria-label') && !el.getAttribute('aria-labelledby');
  }).length;
  const buttonsNoName = Array.from(document.querySelectorAll('button')).filter((b) => visible(b) && !(b.textContent || '').trim() && !b.getAttribute('aria-label')).length;
  const canvas = document.querySelectorAll('canvas').length;
  const svgCharts = Array.from(document.querySelectorAll('svg')).filter((s) => visible(s) && (s.getAttribute('viewBox') || '').split(' ').map(Number).some((n) => n > 100)).length;
  const tables = document.querySelectorAll('table').length;
  const rowCounts = Array.from(document.querySelectorAll('table')).map((t) => t.querySelectorAll('tbody tr').length);
  const sections = Array.from(document.querySelectorAll('section, .card, [data-section]'))
    .filter(visible)
    .slice(0, 40)
    .map((s) => ({ tag: s.tagName.toLowerCase(), id: s.id, cls: s.className.slice(0, 60), height: s.offsetHeight, width: s.offsetWidth }));
  return { landmarks, headings, imgsNoAlt, inputsNoLabel, buttonsNoName, canvas, svgCharts, tables, rowCounts, sections };
});
Object.assign(results.a11y, {
  landmarks: a11y.landmarks,
  headings: a11y.headings,
  imgsNoAlt: a11y.imgsNoAlt,
  inputsNoLabel: a11y.inputsNoLabel,
  buttonsNoName: a11y.buttonsNoName,
});
results.charts = { canvas: a11y.canvas, svgCharts: a11y.svgCharts, tables: a11y.tables, rowCounts: a11y.rowCounts };
results.sections = a11y.sections;

// Meta
results.meta = await page.evaluate(() => ({
  domNodes: document.getElementsByTagName('*').length,
  visibleText: document.body.innerText.length,
  hasDarkMode: !!document.querySelector('[data-theme="dark"]'),
  title: document.title,
  bodyClasses: document.body.className,
}));

// Screenshots at each viewport
for (const vp of VIEWPORTS) {
  await page.setViewportSize({ width: vp.width, height: vp.height });
  await page.waitForTimeout(800);
  const path = join(OUT, `${vp.name}-${vp.width}x${vp.height}.png`);
  await page.screenshot({ path, fullPage: true });
}

await browser.close();

await writeFile(join('reports', `audit-${DATE}-authenticated.json`), JSON.stringify(results, null, 2));

console.log(JSON.stringify({
  ok: true,
  webVitals: results.webVitals,
  requests: results.network.requestCount,
  totalKB: Math.round(results.network.totalBytes / 1024),
  errors: results.console.errors.length,
  warnings: results.console.warnings.length,
  domNodes: results.meta.domNodes,
  headings: results.a11y.headings.length,
  landmarks: results.a11y.landmarks.length,
  imgsNoAlt: results.a11y.imgsNoAlt,
  inputsNoLabel: results.a11y.inputsNoLabel,
  buttonsNoName: results.a11y.buttonsNoName,
  charts: results.charts,
  sections: results.sections.length,
  title: results.meta.title,
  bodyClasses: results.meta.bodyClasses,
  visibleText: results.meta.visibleText,
}, null, 2));
