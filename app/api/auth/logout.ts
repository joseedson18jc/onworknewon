import type { VercelRequest, VercelResponse } from '@vercel/node';
import { clearSessionCookie, verifySession, readSessionCookie } from '../_lib/auth.js';
import { record } from '../_lib/audit.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'method_not_allowed' });
  }
  const token = readSessionCookie(req);
  if (token) {
    const claims = await verifySession(token);
    if (claims) await record('auth.logout', { user: claims.sub });
  }
  clearSessionCookie(res);
  return res.status(200).json({ ok: true });
}
