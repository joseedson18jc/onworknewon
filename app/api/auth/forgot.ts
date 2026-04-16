import type { VercelRequest, VercelResponse } from '@vercel/node';
import { z } from 'zod';
import { SignJWT } from 'jose';
import { env, demoWarnings } from '../_lib/env.js';
import { check } from '../_lib/ratelimit.js';
import { record } from '../_lib/audit.js';

const body = z.object({ email: z.string().email() });

/**
 * Forgot-password flow.
 * - Rate-limited by IP.
 * - Always returns 200 regardless of whether the email exists (prevents
 *   enumeration).
 * - Signs a one-time JWT valid for 15 minutes and sends via Resend.
 * - In demo mode (no RESEND_API_KEY), returns the link in the response so
 *   developers can test the flow without email deliverability.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'method_not_allowed' });
  }
  const parsed = body.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'invalid_email' });

  const ip = (req.headers['x-forwarded-for']?.toString().split(',')[0] ?? req.socket.remoteAddress ?? 'unknown').trim();
  const rl = await check('auth', ip);
  if (!rl.allowed) return res.status(429).json({ error: 'rate_limited', reset: rl.reset });

  const secret = new TextEncoder().encode(env.AUTH_SECRET ?? 'demo-mode-unsafe-secret-do-not-use-in-production-xxxxx');
  const token = await new SignJWT({ email: parsed.data.email })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('15m')
    .setIssuer('ai-rudder')
    .setAudience('ai-rudder-reset')
    .sign(secret);

  const origin = req.headers.host ? `https://${req.headers.host}` : 'http://localhost:4173';
  const link = `${origin}/reset?token=${token}`;

  await record('auth.forgot.sent', { ip, meta: { email: parsed.data.email } });

  const warnings = demoWarnings(['auth']);
  if (!env.RESEND_API_KEY) {
    warnings.push('RESEND_API_KEY not configured — returning reset link in response for demo. Wire Resend in production.');
    return res.status(200).json({ ok: true, warnings, demoLink: link });
  }

  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'AI Rudder <no-reply@ai-rudder.app>',
        to: parsed.data.email,
        subject: 'Redefinir senha · Reset password · 重置密码',
        html: `<p>Click to reset:</p><p><a href="${link}">${link}</a></p><p>Expires in 15 minutes.</p>`,
      }),
    });
  } catch {
    // Silently swallow — never tell the caller if the email exists.
  }

  return res.status(200).json({ ok: true, warnings });
}
