import { hash, verify } from '@node-rs/argon2';

/** Argon2id parameters per OWASP 2024 cheatsheet, scaled for Vercel serverless. */
// Algorithm enum: 0 = Argon2d, 1 = Argon2i, 2 = Argon2id. Literal used to satisfy
// isolatedModules + preserveConstEnums off.
const PARAMS = {
  algorithm: 2 as const,
  memoryCost: 19456, // 19 MiB — OWASP minimum
  timeCost: 2,
  parallelism: 1,
} as const;

export async function hashPassword(pw: string): Promise<string> {
  return hash(pw, PARAMS);
}

export async function verifyPassword(pw: string, stored: string): Promise<boolean> {
  if (!stored) return false;
  try {
    return await verify(stored, pw, PARAMS);
  } catch {
    return false;
  }
}
