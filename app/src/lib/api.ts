/** Tiny typed fetch wrapper with error envelope normalisation. */
export type Session = { username: string; role: 'admin' | 'viewer'; exp?: number };
export type AuthMode = 'server' | 'demo';

export interface LoginResponse {
  user: Session;
  authMode: AuthMode;
  warnings?: string[];
}

async function json<T>(res: Response): Promise<T> {
  const text = await res.text();
  let data: any = {};
  try { data = text ? JSON.parse(text) : {}; } catch { /* non-json (e.g. vite index.html 404) */ }
  if (!res.ok) throw Object.assign(new Error(data?.error || `http_${res.status}`), { status: res.status, data });
  return data as T;
}

/** True when /api/auth/me responds with JSON (i.e. the serverless functions are live). */
let apiAvailable: boolean | null = null;
async function detectApi(): Promise<boolean> {
  if (apiAvailable !== null) return apiAvailable;
  try {
    const res = await fetch('/api/auth/me', { credentials: 'same-origin' });
    const ct = res.headers.get('content-type') ?? '';
    apiAvailable = ct.includes('application/json');
  } catch {
    apiAvailable = false;
  }
  return apiAvailable;
}

/** Client-side demo fallback so `vite preview` (no functions) still boots the dashboard. */
const clientDemo = {
  user: null as Session | null,
  login(username: string, _password: string): LoginResponse {
    this.user = { username, role: username.toLowerCase() === 'demo' ? 'viewer' : 'admin' };
    return {
      user: this.user,
      authMode: 'demo',
      warnings: ['Running in client-only demo mode: no /api/* endpoints were reached. Deploy to Vercel to enable real server-side auth.'],
    };
  },
  logout() { this.user = null; },
  me(): { user: Session | null; authMode: AuthMode } {
    return { user: this.user, authMode: 'demo' };
  },
};

export async function login(username: string, password: string): Promise<LoginResponse> {
  if (!(await detectApi())) {
    await new Promise((r) => setTimeout(r, 300));
    return clientDemo.login(username, password);
  }
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
    credentials: 'same-origin',
  });
  return json<LoginResponse>(res);
}

export async function logout(): Promise<void> {
  if (!(await detectApi())) { clientDemo.logout(); return; }
  await fetch('/api/auth/logout', { method: 'POST', credentials: 'same-origin' }).catch(() => {});
}

export async function me(): Promise<{ user: Session | null; authMode: AuthMode }> {
  if (!(await detectApi())) return clientDemo.me();
  const res = await fetch('/api/auth/me', { credentials: 'same-origin' });
  return json<{ user: Session | null; authMode: AuthMode }>(res);
}

export async function forgotPassword(email: string): Promise<{ ok: boolean; warnings?: string[]; demoLink?: string }> {
  if (!(await detectApi())) {
    // No /api/*: stub a deterministic demo response so the UI flow still works.
    await new Promise((r) => setTimeout(r, 250));
    return { ok: true, warnings: ['Running in client-only demo mode — no email was sent.'], demoLink: `${location.origin}/?reset=demo&email=${encodeURIComponent(email)}` };
  }
  const res = await fetch('/api/auth/forgot', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  return json(res);
}

export async function aiCompletion(messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>, opts: { model?: string; temperature?: number } = {}): Promise<any> {
  const res = await fetch('/api/ai/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, ...opts }),
    credentials: 'same-origin',
  });
  return json(res);
}
