import type { VercelRequest, VercelResponse } from '@vercel/node';
import { z } from 'zod';
import { requireSession } from '../_lib/auth.js';
import { check } from '../_lib/ratelimit.js';
import { record } from '../_lib/audit.js';
import { env, hasSurfe, demoWarnings } from '../_lib/env.js';

const body = z.object({
  domain: z.string().min(3).max(253).optional(),
  linkedin: z.string().url().optional(),
  jobTitle: z.string().max(200).optional(),
  type: z.enum(['company', 'person']).default('person'),
}).refine((d) => d.domain || d.linkedin, { message: 'domain or linkedin is required' });

/** Surfe enrichment proxy. */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return res.status(405).json({ error: 'method_not_allowed' }); }
  const claims = await requireSession(req, res);
  if (!claims) return;
  const parsed = body.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'invalid_request', details: parsed.error.flatten() });

  const rl = await check('surfe', claims.sub);
  if (!rl.allowed) {
    await record('surfe.enrichment.rate_limited', { user: claims.sub });
    return res.status(429).json({ error: 'rate_limited', reset: rl.reset });
  }

  await record('surfe.enrichment.call', { user: claims.sub, meta: { type: parsed.data.type } });

  if (!hasSurfe) {
    // Canned demo enrichment payload
    return res.status(200).json({
      warnings: demoWarnings(['surfe']),
      demo: true,
      results: [
        { firstName: 'Jane', lastName: 'Silva', jobTitle: parsed.data.jobTitle ?? 'VP Customer Experience', emails: ['jane.silva@example.com'], linkedinUrl: 'https://www.linkedin.com/in/janesilva' },
      ],
    });
  }

  try {
    const endpoint = parsed.data.type === 'company'
      ? 'https://api.surfe.com/v1/companies/enrichments'
      : 'https://api.surfe.com/v1/people/enrichments';
    const upstream = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${env.SURFE_API_KEY}` },
      body: JSON.stringify({
        domain: parsed.data.domain,
        linkedinUrl: parsed.data.linkedin,
        jobTitle: parsed.data.jobTitle,
      }),
    });
    if (!upstream.ok) return res.status(upstream.status).json({ error: 'upstream_error' });
    return res.status(200).json(await upstream.json());
  } catch {
    return res.status(502).json({ error: 'upstream_unavailable' });
  }
}
