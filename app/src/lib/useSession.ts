import * as React from 'react';
import { me, type Session, type AuthMode } from './api';

export interface SessionState {
  user: Session | null;
  authMode: AuthMode | null;
  loading: boolean;
  refresh: () => Promise<void>;
  setUser: (u: Session | null) => void;
}

/** Restores the httpOnly-cookie session on mount and exposes it to the app. */
export function useSession(): SessionState {
  const [user, setUser] = React.useState<Session | null>(null);
  const [authMode, setAuthMode] = React.useState<AuthMode | null>(null);
  const [loading, setLoading] = React.useState(true);

  const refresh = React.useCallback(async () => {
    try {
      const r = await me();
      setUser(r.user);
      setAuthMode(r.authMode);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => { void refresh(); }, [refresh]);

  return { user, authMode, loading, refresh, setUser };
}
