import type { VercelRequest, VercelResponse } from '@vercel/node';
import { z } from 'zod';
import { authenticate } from '../_lib/users.js';
import { signSession, setSessionCookie, AUTH_MODE } from '../_lib/auth.js';
import { check } from '../_lib/ratelimit.js';
import { record } from '../_lib/audit.js';
import { demoWarnings } from '../_lib/env.js';

const body = z.object({
  username: z.string().min(1).max(64),
  password: z.string().min(1).max(256),
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'method_not_allowed' });
  }

  const parsed = body.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'invalid_request', details: parsed.error.flatten() });
  }

  const ip = (req.headers['x-forwarded-for']?.toString().split(',')[0] ?? req.socket.remoteAddress ?? 'unknown').trim();
  const ua = req.headers['user-agent']?.toString();

  const rl = await check('auth', ip);
  if (!rl.allowed) {
    await record('rate_limit.hit', { ip, ua, meta: { endpoint: 'auth.login' } });
    return res.status(429).json({ error: 'rate_limited', reset: rl.reset });
  }

  const user = await authenticate(parsed.data.username, parsed.data.password);
  if (!user) {
    await record('auth.login.failed', { ip, ua, meta: { username: parsed.data.username } });
    // 400ms constant-time-ish delay to blunt username enumeration
    await new Promise((r) => setTimeout(r, 400));
    return res.status(401).json({ error: 'invalid_credentials' });
  }

  const token = await signSession(user.username, user.role);
  setSessionCookie(res, token);
  await record('auth.login.success', { user: user.username, ip, ua });

  return res.status(200).json({
    user: { username: user.username, role: user.role },
    authMode: AUTH_MODE,
    warnings: demoWarnings(['auth']),
  });
}
