import { z } from 'zod';

/**
 * Environment validation with graceful degradation.
 *
 * In production, every secret must be set. Locally and on first-deploy, the
 * `demoMode` flag lets the app run with an in-memory store and mocked
 * providers, so links can still be clicked. The endpoints return a loud
 * warning in the response so nobody ships this to customers accidentally.
 */
const schema = z.object({
  AUTH_SECRET: z.string().min(32).optional(),
  KV_REST_API_URL: z.string().url().optional(),
  KV_REST_API_TOKEN: z.string().min(16).optional(),
  OPENAI_API_KEY: z.string().startsWith('sk-').optional(),
  ELEVENLABS_API_KEY: z.string().min(16).optional(),
  SURFE_API_KEY: z.string().min(16).optional(),
  RESEND_API_KEY: z.string().startsWith('re_').optional(),
  NODE_ENV: z.string().default('development'),
});

export const env = schema.parse(process.env);

export const hasServerAuth = !!(env.AUTH_SECRET && env.KV_REST_API_URL && env.KV_REST_API_TOKEN);
export const hasOpenAI = !!env.OPENAI_API_KEY;
export const hasElevenLabs = !!env.ELEVENLABS_API_KEY;
export const hasSurfe = !!env.SURFE_API_KEY;
export const isProd = env.NODE_ENV === 'production';

/** Collect missing-secret warnings — surfaced in API responses for transparency. */
export function demoWarnings(required: Array<'auth' | 'openai' | 'elevenlabs' | 'surfe'>): string[] {
  const w: string[] = [];
  if (required.includes('auth') && !hasServerAuth) w.push('Running in demo mode: AUTH_SECRET / KV_REST_API_URL / KV_REST_API_TOKEN not configured. Users are in-memory only.');
  if (required.includes('openai') && !hasOpenAI) w.push('Running in demo mode: OPENAI_API_KEY not configured. Returning canned response.');
  if (required.includes('elevenlabs') && !hasElevenLabs) w.push('Running in demo mode: ELEVENLABS_API_KEY not configured.');
  if (required.includes('surfe') && !hasSurfe) w.push('Running in demo mode: SURFE_API_KEY not configured.');
  return w;
}
