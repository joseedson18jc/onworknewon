import { kv } from './kv.js';

export type AuditEvent =
  | 'auth.login.success' | 'auth.login.failed' | 'auth.logout' | 'auth.forgot.sent'
  | 'ai.completions.call' | 'ai.completions.rate_limited'
  | 'voice.tts.call' | 'voice.tts.rate_limited'
  | 'surfe.enrichment.call' | 'surfe.enrichment.rate_limited'
  | 'rate_limit.hit';

export interface AuditRecord {
  ts: number;
  event: AuditEvent;
  user?: string;
  ip?: string;
  ua?: string;
  meta?: Record<string, unknown>;
}

/**
 * Append-only audit log. Uses KV with an auto-expiring 90-day window by
 * default. For longer retention, wire this to a durable Postgres column
 * (`Vercel Postgres` / Neon) in Wave 5.
 */
export async function record(event: AuditEvent, fields: Omit<AuditRecord, 'ts' | 'event'> = {}): Promise<void> {
  const rec: AuditRecord = { ts: Date.now(), event, ...fields };
  const key = `audit:${rec.ts}:${Math.random().toString(36).slice(2, 8)}`;
  try {
    await kv().set(key, rec, { ex: 60 * 60 * 24 * 90 });
  } catch {
    // Never let audit logging break the user-visible flow.
  }
}
