import type { VercelRequest, VercelResponse } from '@vercel/node';
import { z } from 'zod';
import { requireSession } from '../_lib/auth.js';
import { check } from '../_lib/ratelimit.js';
import { record } from '../_lib/audit.js';
import { env, hasElevenLabs, demoWarnings } from '../_lib/env.js';

const body = z.object({
  text: z.string().min(1).max(5000),
  voiceId: z.string().default('21m00Tcm4TlvDq8ikWAM'),
  modelId: z.string().default('eleven_multilingual_v2'),
});

/** ElevenLabs TTS proxy. Returns audio/mpeg bytes. */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return res.status(405).json({ error: 'method_not_allowed' }); }
  const claims = await requireSession(req, res);
  if (!claims) return;
  const parsed = body.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'invalid_request', details: parsed.error.flatten() });

  const rl = await check('voice', claims.sub);
  if (!rl.allowed) {
    await record('voice.tts.rate_limited', { user: claims.sub });
    return res.status(429).json({ error: 'rate_limited', reset: rl.reset });
  }

  await record('voice.tts.call', { user: claims.sub, meta: { chars: parsed.data.text.length, model: parsed.data.modelId } });

  if (!hasElevenLabs) {
    return res.status(200).json({ warnings: demoWarnings(['elevenlabs']), demo: true });
  }

  try {
    const upstream = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(parsed.data.voiceId)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'xi-api-key': env.ELEVENLABS_API_KEY!,
        Accept: 'audio/mpeg',
      },
      body: JSON.stringify({
        text: parsed.data.text,
        model_id: parsed.data.modelId,
        voice_settings: { stability: 0.5, similarity_boost: 0.75 },
      }),
    });
    if (!upstream.ok) return res.status(upstream.status).json({ error: 'upstream_error' });
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Cache-Control', 'private, max-age=0, no-store');
    const buf = Buffer.from(await upstream.arrayBuffer());
    return res.status(200).send(buf);
  } catch {
    return res.status(502).json({ error: 'upstream_unavailable' });
  }
}
