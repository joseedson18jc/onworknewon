// Phase 1 reconnaissance driver: screenshots + console + network + a11y + Core Web Vitals
// Run: node scripts/audit-phase1.mjs <URL>

import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const URL = process.argv[2] || 'https://ai-rudder-panel-josemercadogc18-1904s-projects.vercel.app';
const DATE = new Date().toISOString().slice(0, 10);
const OUT = join(process.cwd(), 'reports', `screenshots-${DATE}`);
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
  viewports: {},
  console: { errors: [], warnings: [], logs: [] },
  network: { failed: [], slow: [], requestCount: 0, totalBytes: 0 },
  webVitals: {},
  a11y: { violations: [], landmarks: [], headings: [] },
  meta: {},
};

const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
const context = await browser.newContext({
  userAgent:
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36',
  ignoreHTTPSErrors: true,
});
const page = await context.newPage();

// Console capture
page.on('console', (msg) => {
  const text = msg.text();
  const type = msg.type();
  if (type === 'error') results.console.errors.push(text);
  else if (type === 'warning') results.console.warnings.push(text);
  else if (results.console.logs.length < 30) results.console.logs.push(`[${type}] ${text}`);
});
page.on('pageerror', (err) => results.console.errors.push(`[pageerror] ${err.message}`));

// Network capture
const reqStart = new Map();
page.on('request', (req) => {
  results.network.requestCount++;
  reqStart.set(req, Date.now());
});
page.on('requestfailed', (req) => {
  results.network.failed.push({ url: req.url(), failure: req.failure()?.errorText });
});
page.on('response', async (res) => {
  const req = res.request();
  const elapsed = Date.now() - (reqStart.get(req) ?? Date.now());
  if (elapsed > 1500) {
    results.network.slow.push({ url: res.url(), ms: elapsed, status: res.status() });
  }
  try {
    const buf = await res.body();
    results.network.totalBytes += buf.length;
  } catch {}
});

// --- Load at desktop first for Web Vitals + full source ---
await page.setViewportSize({ width: 1536, height: 960 });
const navStart = Date.now();
await page.goto(URL, { waitUntil: 'networkidle', timeout: 30_000 }).catch(async (e) => {
  results.console.errors.push(`[navigation] ${e.message}`);
  await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 30_000 });
});
const loadMs = Date.now() - navStart;
results.meta.loadMs = loadMs;

// Core Web Vitals via PerformanceObserver (approximation — LCP + CLS + TTFB)
const vitals = await page.evaluate(() => {
  return new Promise((resolve) => {
    const out = { lcp: null, cls: 0, fcp: null, ttfb: null, longTasks: 0 };
    try {
      const nav = performance.getEntriesByType('navigation')[0];
      if (nav) out.ttfb = Math.round(nav.responseStart);
    } catch {}
    try {
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        out.lcp = Math.round(entries[entries.length - 1].startTime);
      }).observe({ type: 'largest-contentful-paint', buffered: true });
    } catch {}
    try {
      new PerformanceObserver((list) => {
        for (const e of list.getEntries()) {
          if (!e.hadRecentInput) out.cls += e.value;
        }
      }).observe({ type: 'layout-shift', buffered: true });
    } catch {}
    try {
      new PerformanceObserver((list) => {
        const e = list.getEntries().find((x) => x.name === 'first-contentful-paint');
        if (e) out.fcp = Math.round(e.startTime);
      }).observe({ type: 'paint', buffered: true });
    } catch {}
    try {
      new PerformanceObserver((list) => {
        out.longTasks += list.getEntries().length;
      }).observe({ type: 'longtask', buffered: true });
    } catch {}
    setTimeout(() => {
      out.cls = Math.round(out.cls * 1000) / 1000;
      resolve(out);
    }, 3000);
  });
});
results.webVitals = vitals;

// Landmark + heading a11y audit
const a11y = await page.evaluate(() => {
  const landmarks = Array.from(
    document.querySelectorAll('header, nav, main, aside, footer, [role="main"], [role="navigation"], [role="banner"], [role="contentinfo"]')
  ).map((el) => ({ tag: el.tagName.toLowerCase(), role: el.getAttribute('role'), label: el.getAttribute('aria-label') }));
  const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6')).map((h) => ({
    level: Number(h.tagName[1]),
    text: (h.textContent || '').trim().slice(0, 80),
  }));
  const imgsNoAlt = Array.from(document.querySelectorAll('img')).filter((i) => !i.hasAttribute('alt')).map((i) => i.src.slice(0, 120));
  const inputsNoLabel = Array.from(document.querySelectorAll('input, textarea, select')).filter((el) => {
    if (el.type === 'hidden' || el.type === 'submit' || el.type === 'button') return false;
    const id = el.id;
    const hasLabel = id && document.querySelector(`label[for="${id}"]`);
    const aria = el.getAttribute('aria-label') || el.getAttribute('aria-labelledby');
    return !hasLabel && !aria;
  }).map((el) => el.outerHTML.slice(0, 160));
  const buttonsNoName = Array.from(document.querySelectorAll('button')).filter((b) => !(b.textContent || '').trim() && !b.getAttribute('aria-label')).length;
  const docLang = document.documentElement.lang || null;
  const title = document.title;
  return { landmarks, headings, imgsNoAlt, inputsNoLabel, buttonsNoName, docLang, title };
});
results.a11y = a11y;

// Meta
const meta = await page.evaluate(() => ({
  title: document.title,
  description: document.querySelector('meta[name="description"]')?.content,
  viewport: document.querySelector('meta[name="viewport"]')?.content,
  charset: document.characterSet,
  scripts: document.querySelectorAll('script').length,
  stylesheets: document.querySelectorAll('link[rel="stylesheet"]').length,
  inlineScriptsBytes: Array.from(document.querySelectorAll('script:not([src])')).reduce((n, s) => n + (s.textContent || '').length, 0),
  domNodes: document.getElementsByTagName('*').length,
  hasDarkMode: !!document.querySelector('[data-theme], [class*="dark"]'),
  prefersReducedMotionRespected: (() => {
    try {
      const sheets = Array.from(document.styleSheets);
      return sheets.some((s) => {
        try {
          return Array.from(s.cssRules || []).some((r) => r.cssText?.includes('prefers-reduced-motion'));
        } catch { return false; }
      });
    } catch { return null; }
  })(),
}));
results.meta = { ...results.meta, ...meta };

// Capture DOM HTML snapshot for static analysis
const domHtml = await page.content();
await writeFile(join(OUT, 'dom.html'), domHtml);

// --- Screenshots at all viewports ---
for (const vp of VIEWPORTS) {
  await page.setViewportSize({ width: vp.width, height: vp.height });
  await page.waitForTimeout(500);
  const path = join(OUT, `${vp.name}-${vp.width}x${vp.height}.png`);
  await page.screenshot({ path, fullPage: true });
  results.viewports[vp.name] = { width: vp.width, height: vp.height, file: path.replace(process.cwd() + '/', '') };
}

await browser.close();

// Persist raw JSON
await writeFile(join('reports', `audit-${DATE}.json`), JSON.stringify(results, null, 2));

console.log(JSON.stringify({
  ok: true,
  webVitals: results.webVitals,
  loadMs: results.meta.loadMs,
  requests: results.network.requestCount,
  totalKB: Math.round(results.network.totalBytes / 1024),
  errors: results.console.errors.length,
  warnings: results.console.warnings.length,
  failed: results.network.failed.length,
  slow: results.network.slow.length,
  a11y: {
    imgsNoAlt: results.a11y.imgsNoAlt.length,
    inputsNoLabel: results.a11y.inputsNoLabel.length,
    buttonsNoName: results.a11y.buttonsNoName,
    h1Count: results.a11y.headings.filter((h) => h.level === 1).length,
    totalHeadings: results.a11y.headings.length,
    landmarks: results.a11y.landmarks.length,
  },
}, null, 2));
