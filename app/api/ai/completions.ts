import type { VercelRequest, VercelResponse } from '@vercel/node';
import { z } from 'zod';
import { requireSession } from '../_lib/auth.js';
import { check } from '../_lib/ratelimit.js';
import { record } from '../_lib/audit.js';
import { env, hasOpenAI, demoWarnings } from '../_lib/env.js';

const body = z.object({
  messages: z.array(z.object({
    role: z.enum(['system', 'user', 'assistant']),
    content: z.string().max(12_000),
  })).min(1).max(40),
  model: z.enum(['gpt-4o', 'gpt-4o-mini', 'gpt-4.1-mini']).default('gpt-4o-mini'),
  temperature: z.number().min(0).max(2).default(0.2),
  stream: z.boolean().default(false),
});

/**
 * OpenAI proxy.
 * - Requires authenticated session (httpOnly cookie).
 * - Rate-limited per user: 30/min + 300/day.
 * - Audit-logged (never logs the prompt or response body — only meta).
 * - Demo mode returns a canned response so the UI can be exercised offline.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return res.status(405).json({ error: 'method_not_allowed' }); }
  const claims = await requireSession(req, res);
  if (!claims) return;

  const parsed = body.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'invalid_request', details: parsed.error.flatten() });

  const perMin = await check('ai', claims.sub);
  if (!perMin.allowed) {
    await record('ai.completions.rate_limited', { user: claims.sub, meta: { window: '1m' } });
    return res.status(429).json({ error: 'rate_limited_minute', reset: perMin.reset });
  }
  const perDay = await check('ai-daily', claims.sub);
  if (!perDay.allowed) {
    await record('ai.completions.rate_limited', { user: claims.sub, meta: { window: '24h' } });
    return res.status(429).json({ error: 'rate_limited_day', reset: perDay.reset });
  }

  await record('ai.completions.call', { user: claims.sub, meta: { model: parsed.data.model, messages: parsed.data.messages.length } });

  if (!hasOpenAI) {
    return res.status(200).json({
      choices: [{ message: { role: 'assistant', content: '[Demo mode] OpenAI key not configured. Connect OPENAI_API_KEY in your Vercel project settings to enable real completions.' } }],
      warnings: demoWarnings(['openai']),
    });
  }

  try {
    const upstream = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${env.OPENAI_API_KEY}` },
      body: JSON.stringify({
        model: parsed.data.model,
        messages: parsed.data.messages,
        temperature: parsed.data.temperature,
        stream: parsed.data.stream,
      }),
    });
    if (!upstream.ok) {
      return res.status(upstream.status).json({ error: 'upstream_error', status: upstream.status });
    }
    if (parsed.data.stream) {
      res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
      res.setHeader('Cache-Control', 'no-cache, no-transform');
      res.setHeader('X-Accel-Buffering', 'no');
      const reader = upstream.body!.getReader();
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        res.write(value);
      }
      return res.end();
    }
    const data = await upstream.json();
    return res.status(200).json(data);
  } catch (e) {
    return res.status(502).json({ error: 'upstream_unavailable' });
  }
}
