import { Redis } from '@upstash/redis';
import { env, hasServerAuth } from './env.js';

/**
 * Upstash Redis client (replaces the deprecated @vercel/kv).
 * Falls back to an in-memory Map when env vars are missing, so the app still
 * runs on a fresh deploy without configuration.
 */

interface KV {
  get<T = unknown>(k: string): Promise<T | null>;
  set(k: string, v: unknown, opts?: { ex?: number }): Promise<unknown>;
  del(k: string): Promise<unknown>;
  incr(k: string): Promise<number>;
  expire(k: string, seconds: number): Promise<unknown>;
}

let _kv: KV | null = null;

function memoryKv(): KV {
  const store = new Map<string, { v: unknown; exp?: number }>();
  const get = async <T>(k: string): Promise<T | null> => {
    const e = store.get(k);
    if (!e) return null;
    if (e.exp && Date.now() > e.exp) { store.delete(k); return null; }
    return e.v as T;
  };
  return {
    get,
    set: async (k, v, opts) => { store.set(k, { v, exp: opts?.ex ? Date.now() + opts.ex * 1000 : undefined }); return 'OK'; },
    del: async (k) => { store.delete(k); return 1; },
    incr: async (k) => { const cur = ((await get<number>(k)) ?? 0) + 1; store.set(k, { v: cur }); return cur; },
    expire: async (k, s) => { const e = store.get(k); if (e) store.set(k, { ...e, exp: Date.now() + s * 1000 }); return 1; },
  };
}

export function kv(): KV {
  if (_kv) return _kv;
  if (!hasServerAuth) return (_kv = memoryKv());
  const client = new Redis({ url: env.KV_REST_API_URL!, token: env.KV_REST_API_TOKEN! });
  _kv = {
    get: (k) => client.get(k) as Promise<any>,
    set: (k, v, opts) => opts?.ex ? client.set(k, v as any, { ex: opts.ex }) : client.set(k, v as any),
    del: (k) => client.del(k),
    incr: (k) => client.incr(k),
    expire: (k, s) => client.expire(k, s),
  };
  return _kv;
}
