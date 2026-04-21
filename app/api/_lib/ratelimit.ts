import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { env, hasServerAuth } from './env.js';

/**
 * Sliding-window rate limiter per (user × endpoint).
 * Graceful fallback: always-allow when KV/Upstash not configured.
 */

let limiters: Record<string, Ratelimit> | null = null;

function redis(): Redis | null {
  if (!hasServerAuth) return null;
  return new Redis({ url: env.KV_REST_API_URL!, token: env.KV_REST_API_TOKEN! });
}

function getLimiters(): Record<string, Ratelimit> | null {
  if (limiters) return limiters;
  const r = redis();
  if (!r) return null;
  limiters = {
    'ai': new Ratelimit({ redis: r, limiter: Ratelimit.slidingWindow(30, '1 m'), analytics: true, prefix: 'rl:ai' }),
    'ai-daily': new Ratelimit({ redis: r, limiter: Ratelimit.slidingWindow(300, '24 h'), analytics: true, prefix: 'rl:ai-d' }),
    'voice': new Ratelimit({ redis: r, limiter: Ratelimit.slidingWindow(10, '1 m'), analytics: true, prefix: 'rl:voice' }),
    'surfe': new Ratelimit({ redis: r, limiter: Ratelimit.slidingWindow(20, '1 m'), analytics: true, prefix: 'rl:surfe' }),
    'auth': new Ratelimit({ redis: r, limiter: Ratelimit.slidingWindow(10, '10 m'), analytics: true, prefix: 'rl:auth' }),
  };
  return limiters;
}

export interface RateLimitResult { allowed: boolean; remaining: number; reset: number }

export async function check(bucket: 'ai' | 'ai-daily' | 'voice' | 'surfe' | 'auth', key: string): Promise<RateLimitResult> {
  const l = getLimiters();
  if (!l) return { allowed: true, remaining: Number.POSITIVE_INFINITY, reset: 0 };
  const r = await l[bucket].limit(key);
  return { allowed: r.success, remaining: r.remaining, reset: r.reset };
}
