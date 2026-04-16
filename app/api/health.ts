import type { VercelRequest, VercelResponse } from '@vercel/node';
import { hasServerAuth, hasOpenAI, hasElevenLabs, hasSurfe, env } from './_lib/env.js';
import { kv } from './_lib/kv.js';

/**
 * Public health endpoint — pokes every critical integration.
 * Used by Vercel, uptime monitors, and the post-deploy verifier.
 */
export default async function handler(_req: VercelRequest, res: VercelResponse) {
  const checks: Record<string, { ok: boolean; detail?: string }> = {};
  const started = Date.now();

  // Auth secret + KV
  checks.authSecret = { ok: !!env.AUTH_SECRET, detail: env.AUTH_SECRET ? 'set' : 'missing (demo mode)' };
  try {
    await kv().set('health:ping', Date.now(), { ex: 30 });
    const v = await kv().get<number>('health:ping');
    checks.kv = { ok: typeof v === 'number', detail: hasServerAuth ? 'upstash' : 'in-memory' };
  } catch (e) {
    checks.kv = { ok: false, detail: (e as Error).message };
  }

  checks.openai = { ok: hasOpenAI, detail: hasOpenAI ? 'configured' : 'missing (demo mode)' };
  checks.elevenlabs = { ok: hasElevenLabs, detail: hasElevenLabs ? 'configured' : 'missing (demo mode)' };
  checks.surfe = { ok: hasSurfe, detail: hasSurfe ? 'configured' : 'missing (demo mode)' };

  const productionReady = hasServerAuth && hasOpenAI && checks.kv.ok;
  const status = productionReady ? 'ok' : 'degraded';

  return res.status(200).json({
    status,
    productionReady,
    version: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? 'dev',
    env: env.NODE_ENV,
    checks,
    latencyMs: Date.now() - started,
    timestamp: new Date().toISOString(),
  });
}
