// Seed / re-seed the users store. Usage:
//   node --env-file=.env.local scripts/seed-users.mjs
//
// Reads users from scripts/users.seed.json (or inline default set) and writes
// Argon2id-hashed records into Vercel KV. Safe to re-run — re-seeds in place.

import { readFile } from 'node:fs/promises';
import { Redis } from '@upstash/redis';
import { hash } from '@node-rs/argon2';

const DEFAULTS = [
  { username: 'admin', password: 'admin1234', role: 'admin' },
  { username: 'demo',  password: 'demo1234',  role: 'viewer' },
];

async function loadUsers() {
  try {
    const raw = await readFile(new URL('./users.seed.json', import.meta.url), 'utf8');
    return JSON.parse(raw);
  } catch {
    console.warn('scripts/users.seed.json not found — using DEFAULTS');
    return DEFAULTS;
  }
}

async function main() {
  const { KV_REST_API_URL, KV_REST_API_TOKEN } = process.env;
  if (!KV_REST_API_URL || !KV_REST_API_TOKEN) {
    console.error('KV_REST_API_URL and KV_REST_API_TOKEN must be set. Create .env.local from .env.example.');
    process.exit(1);
  }
  const kv = new Redis({ url: KV_REST_API_URL, token: KV_REST_API_TOKEN });
  const users = await loadUsers();
  for (const u of users) {
    const passwordHash = await hash(u.password, { algorithm: 2, memoryCost: 19456, timeCost: 2, parallelism: 1 });
    await kv.set(`user:${u.username.toLowerCase()}`, { username: u.username, passwordHash, role: u.role, createdAt: Date.now() });
    console.log(`  ✓ seeded ${u.username} (${u.role})`);
  }
  console.log(`\nSeeded ${users.length} users.`);
}

main().catch((e) => { console.error(e); process.exit(1); });
