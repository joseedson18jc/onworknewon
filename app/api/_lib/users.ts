import { kv } from './kv.js';
import { hashPassword, verifyPassword } from './password.js';
import { hasServerAuth } from './env.js';

export interface UserRecord {
  username: string;
  passwordHash: string;
  role: 'admin' | 'viewer';
  createdAt: number;
}

const userKey = (u: string) => `user:${u.toLowerCase()}`;

/** Demo seed used only when KV is unconfigured. Passwords are hashed at startup. */
const DEMO_USERS = [
  { username: 'demo', password: 'demo1234', role: 'viewer' as const },
  { username: 'admin', password: 'admin1234', role: 'admin' as const },
];

let demoSeeded: Promise<void> | null = null;
function seedDemo() {
  if (demoSeeded) return demoSeeded;
  demoSeeded = (async () => {
    for (const u of DEMO_USERS) {
      if (await kv().get(userKey(u.username))) continue;
      const rec: UserRecord = {
        username: u.username,
        passwordHash: await hashPassword(u.password),
        role: u.role,
        createdAt: Date.now(),
      };
      await kv().set(userKey(u.username), rec);
    }
  })();
  return demoSeeded;
}

export async function getUser(username: string): Promise<UserRecord | null> {
  if (!hasServerAuth) await seedDemo();
  return (await kv().get<UserRecord>(userKey(username))) ?? null;
}

export async function createUser(username: string, password: string, role: 'admin' | 'viewer' = 'viewer'): Promise<UserRecord> {
  const existing = await kv().get(userKey(username));
  if (existing) throw new Error('user_exists');
  const rec: UserRecord = { username, passwordHash: await hashPassword(password), role, createdAt: Date.now() };
  await kv().set(userKey(username), rec);
  return rec;
}

export async function authenticate(username: string, password: string): Promise<UserRecord | null> {
  const user = await getUser(username);
  if (!user) return null;
  return (await verifyPassword(password, user.passwordHash)) ? user : null;
}
