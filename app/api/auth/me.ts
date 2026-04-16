import type { VercelRequest, VercelResponse } from '@vercel/node';
import { readSessionCookie, verifySession, AUTH_MODE } from '../_lib/auth.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'method_not_allowed' });
  }
  const token = readSessionCookie(req);
  if (!token) return res.status(200).json({ user: null, authMode: AUTH_MODE });
  const claims = await verifySession(token);
  if (!claims) return res.status(200).json({ user: null, authMode: AUTH_MODE });
  return res.status(200).json({
    user: { username: claims.sub, role: claims.role, exp: claims.exp },
    authMode: AUTH_MODE,
  });
}
