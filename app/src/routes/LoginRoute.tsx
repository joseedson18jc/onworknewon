import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { ArrowRight, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { ThemeToggle } from '@/components/ThemeToggle';
import { SparkLine } from '@/components/charts/SparkLine';
import { formatCurrency } from '@/lib/utils';
import { login, type Session, type AuthMode } from '@/lib/api';

export interface LoginRouteProps {
  onSignIn: (user: Session) => void;
  onAuthMode?: (m: AuthMode) => void;
}

export const LoginRoute: React.FC<LoginRouteProps> = ({ onSignIn, onAuthMode }) => {
  const { t, i18n } = useTranslation();
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState<string | undefined>();
  const [warnings, setWarnings] = React.useState<string[]>([]);
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(undefined);
    if (!username || !password) {
      setError(t('auth.invalidCredentials'));
      return;
    }
    setLoading(true);
    try {
      const res = await login(username, password);
      setWarnings(res.warnings ?? []);
      onAuthMode?.(res.authMode);
      onSignIn(res.user);
    } catch (err) {
      const msg = (err as any)?.data?.error;
      setError(msg === 'rate_limited' ? 'Too many attempts. Please wait a few minutes.' : t('auth.invalidCredentials'));
    } finally {
      setLoading(false);
    }
  };

  const locale = i18n.language;
  const heroPipeline = 12_400_000;

  return (
    <div className="min-h-screen bg-mesh bg-noise relative overflow-hidden">
      {/* Ambient blobs */}
      <div className="blob w-[500px] h-[500px] top-[-150px] left-[-150px]" style={{ background: 'rgb(var(--accent) / 0.35)' }} />
      <div className="blob w-[400px] h-[400px] bottom-[-100px] right-[-100px]" style={{ background: 'rgb(59 130 246 / 0.3)' }} />

      <a href="#login-main" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:bg-accent focus:text-navy-900 focus:px-3 focus:py-1 focus:rounded-sm focus:z-50">
        Skip to content
      </a>

      <header className="relative z-10 flex items-center justify-between px-6 py-5 max-w-[1440px] mx-auto">
        <div className="flex items-center gap-2">
          <span className="font-display text-xl font-bold tracking-tight text-accent">AI Rudder</span>
          <span className="inline-block w-2 h-2 rounded-full bg-brand-300 animate-pulse-dot" aria-hidden />
        </div>
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
      </header>

      <main id="login-main" className="relative z-10 mx-auto grid max-w-[1280px] grid-cols-1 gap-8 px-6 pt-6 pb-16 lg:grid-cols-[minmax(0,480px)_1fr] lg:items-center lg:gap-16">
        {/* Left: form */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.25, 0.8, 0.25, 1] }}
          className="rounded-lg border border-border bg-bg-elev/80 p-8 backdrop-blur-xl shadow-xl"
        >
          <h1 className="font-display text-3xl font-bold tracking-tight text-text mb-1">{t('auth.welcomeBack')}</h1>
          <p className="text-sm text-text-muted mb-6">{t('auth.signedInSubtitle')}</p>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4" aria-labelledby="login-title">
            <Input
              label={t('auth.username')}
              type="text"
              autoComplete="username"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="jose"
            />
            <Input
              label={t('auth.password')}
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {error && <p role="alert" className="text-xs text-danger-500 -mt-2">{error}</p>}
            <Button type="submit" variant="primary" size="lg" disabled={loading} className="mt-2" aria-busy={loading}>
              {loading ? t('common.loading') : t('auth.signIn')}
              {!loading && <ArrowRight className="w-4 h-4" />}
            </Button>
            <button
              type="button"
              className="text-xs text-accent hover:text-accent-hover transition-colors"
              onClick={() => alert(t('auth.recoveryInvalidEmail'))}
            >
              {t('auth.forgotPassword')}
            </button>
            {warnings.length > 0 ? (
              <ul className="text-[11px] text-warning-500 mt-2 border-t border-border-subtle pt-3 space-y-1">
                {warnings.map((w, i) => (<li key={i}>⚠ {w}</li>))}
              </ul>
            ) : (
              <p className="text-[11px] text-text-faint mt-2 border-t border-border-subtle pt-3">
                Seeded accounts (demo): <span className="mono">admin / admin1234</span> · <span className="mono">demo / demo1234</span>.
                Server auth uses Argon2id + httpOnly JWT cookie.
              </p>
            )}
          </form>
        </motion.div>

        {/* Right: value prop pane */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.25, 0.8, 0.25, 1] }}
          className="relative hidden lg:flex flex-col gap-6 justify-center"
        >
          <div className="inline-flex items-center gap-2 self-start rounded-full border border-brand-400/40 bg-brand-400/10 px-3 py-1.5 text-xs font-medium text-brand-300">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-300 animate-pulse-dot" />
            Live · 79 hot leads today
          </div>
          <h2 className="font-display text-[40px] leading-[1.1] font-bold text-text max-w-[16ch]">
            <span className="text-gradient">{t('overview.hero')}</span>
          </h2>
          <p className="text-text-muted max-w-[46ch]">{t('overview.subtitle')}</p>

          <div className="rounded-lg border border-border-subtle bg-bg-elev/60 backdrop-blur-md p-5 flex items-center gap-4 shadow-lg">
            <div className="flex-1">
              <div className="text-xs text-text-muted">Weekly pipeline</div>
              <div className="mono text-2xl font-bold text-text mt-0.5">{formatCurrency(heroPipeline, locale)}</div>
              <div className="flex items-center gap-1 text-xs text-success-500 mt-0.5">
                <TrendingUp className="w-3 h-3" /> ↗ 18.2% vs last week
              </div>
            </div>
            <SparkLine data={[40,32,36,24,20,16,22,12,8,10,6]} color="rgb(var(--accent))" area className="max-w-[120px]" />
          </div>
        </motion.div>
      </main>
    </div>
  );
};
