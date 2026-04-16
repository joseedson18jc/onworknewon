import { SignJWT, jwtVerify } from 'jose';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { env, hasServerAuth } from './env.js';

export interface SessionClaims {
  sub: string; // user id (username)
  role: 'admin' | 'viewer';
  iat: number;
  exp: number;
}

const COOKIE_NAME = 'ai_rudder_session';
const COOKIE_MAX_AGE = 60 * 60 * 8; // 8 hours

function secret(): Uint8Array {
  return new TextEncoder().encode(env.AUTH_SECRET ?? 'demo-mode-unsafe-secret-do-not-use-in-production-xxxxx');
}

export async function signSession(sub: string, role: 'admin' | 'viewer'): Promise<string> {
  return await new SignJWT({ role })
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .setSubject(sub)
    .setIssuedAt()
    .setExpirationTime(`${COOKIE_MAX_AGE}s`)
    .setIssuer('ai-rudder')
    .setAudience('ai-rudder-web')
    .sign(secret());
}

export async function verifySession(token: string): Promise<SessionClaims | null> {
  try {
    const { payload } = await jwtVerify(token, secret(), { issuer: 'ai-rudder', audience: 'ai-rudder-web' });
    return payload as unknown as SessionClaims;
  } catch {
    return null;
  }
}

export function setSessionCookie(res: VercelResponse, token: string): void {
  const attrs = [
    `${COOKIE_NAME}=${token}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    `Max-Age=${COOKIE_MAX_AGE}`,
  ];
  if (env.NODE_ENV === 'production') attrs.push('Secure');
  res.setHeader('Set-Cookie', attrs.join('; '));
}

export function clearSessionCookie(res: VercelResponse): void {
  const attrs = [
    `${COOKIE_NAME}=`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    'Max-Age=0',
  ];
  if (env.NODE_ENV === 'production') attrs.push('Secure');
  res.setHeader('Set-Cookie', attrs.join('; '));
}

export function readSessionCookie(req: VercelRequest): string | null {
  const header = req.headers.cookie ?? '';
  const match = header.split(';').map((s) => s.trim()).find((s) => s.startsWith(`${COOKIE_NAME}=`));
  return match ? decodeURIComponent(match.slice(COOKIE_NAME.length + 1)) : null;
}

/** Require an authenticated session. Returns claims or responds 401 and returns null. */
export async function requireSession(req: VercelRequest, res: VercelResponse): Promise<SessionClaims | null> {
  const token = readSessionCookie(req);
  if (!token) {
    res.status(401).json({ error: 'unauthenticated' });
    return null;
  }
  const claims = await verifySession(token);
  if (!claims) {
    res.status(401).json({ error: 'session_invalid' });
    return null;
  }
  return claims;
}

export const AUTH_COOKIE_NAME = COOKIE_NAME;
export const AUTH_MODE = hasServerAuth ? 'server' : 'demo';
