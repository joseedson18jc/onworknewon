import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { AnimatePresence, motion } from 'framer-motion';
import { LoginRoute } from '@/routes/LoginRoute';
import { OverviewRoute } from '@/routes/OverviewRoute';
import { PlaceholderRoute } from '@/routes/PlaceholderRoute';
import { TopBar } from '@/components/layout/TopBar';
import { Sidebar, type RouteKey } from '@/components/layout/Sidebar';
import { useSession } from '@/lib/useSession';
import { logout, type AuthMode } from '@/lib/api';

export const App: React.FC = () => {
  const { t } = useTranslation();
  const { user, authMode, loading, setUser } = useSession();
  const [modeOverride, setModeOverride] = React.useState<AuthMode | null>(null);
  const [route, setRoute] = React.useState<RouteKey>('overview');

  const effectiveMode = modeOverride ?? authMode;

  if (loading) {
    return (
      <div className="min-h-screen bg-mesh flex items-center justify-center">
        <div className="skeleton-shimmer w-32 h-4 rounded-full" aria-label="Loading session" />
      </div>
    );
  }

  if (!user) {
    return <LoginRoute onSignIn={setUser} onAuthMode={setModeOverride} />;
  }

  const handleSignOut = async () => {
    await logout();
    setUser(null);
  };

  let content: React.ReactNode;
  if (route === 'overview') {
    content = <OverviewRoute userName={user.username} />;
  } else if (route === 'accounts') {
    content = <PlaceholderRoute title={t('ranking.title')} description={t('ranking.subtitle')} roadmap={['Virtualized table with @tanstack/react-table', 'Multi-column filters + full-text search', 'Slide-in account detail drawer', 'Bulk Surfe enrichment via /api/enrichment/surfe']} />;
  } else if (route === 'briefings') {
    content = <PlaceholderRoute title={t('briefings.title')} description={t('briefings.allAccounts')} roadmap={['Priority briefings with AI-generated talking points (/api/ai/completions)', 'Cited source footer on every AI claim', 'Voice read-aloud (/api/voice/tts) in PT / EN / zh-CN', 'One-click PDF export']} />;
  } else if (route === 'coPilot') {
    content = <PlaceholderRoute title={t('coPilot.title')} description={t('coPilot.subtitle')} roadmap={['Streaming responses via /api/ai/completions (SSE)', 'Voice I/O (/api/voice/tts + /api/voice/asr)', 'Per-conversation memory, resumable across sessions', 'Keyboard-first ⌘K palette']} />;
  } else if (route === 'cadence') {
    content = <PlaceholderRoute title={t('cadence.title')} description={t('cadence.heatmap')} roadmap={['GitHub-style calendar heatmap of activity', 'Drill-down into any cell', 'Drag-to-reorder cadence steps with Framer Motion', 'Reply-rate analytics per template']} />;
  } else if (route === 'marketMap') {
    content = <PlaceholderRoute title={t('decisionMakers.title')} description={t('decisionMakers.subtitle')} roadmap={['Force-directed graph (D3 / visx)', 'Champion / blocker / neutral color coding', 'Edges = reports-to relationships from Surfe', 'List-mode toggle for screen readers']} />;
  } else if (route === 'goToMarket') {
    content = <PlaceholderRoute title={t('nav.goToMarket')} description="Brazil map shaded by TAM per region." roadmap={['D3 + topojson interactive Brazil map', 'Toggle: by state, industry cluster, rep territory', 'Drill-in to account list per region', 'Competitive matrix overlay']} />;
  } else {
    content = <PlaceholderRoute title={t('nav.settings')} description="Team, API keys (server-side), integrations, audit log." roadmap={[`Auth mode: ${effectiveMode ?? 'unknown'} · httpOnly cookie · Argon2id hashing`, '/api/*: OpenAI / ElevenLabs / Surfe server-side proxies', 'Per-user rate limits + monthly budget caps (Upstash Ratelimit)', 'Append-only audit log (90-day KV retention; migrate to Postgres for SOC 2)']} />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <TopBar onSignOut={handleSignOut} />
      {effectiveMode === 'demo' && (
        <div role="status" className="bg-warning-500/10 text-warning-500 text-center text-xs font-medium py-1.5 border-b border-warning-500/30">
          ⚠ Demo mode — configure <span className="mono">AUTH_SECRET</span>, <span className="mono">KV_REST_API_*</span>, and provider keys in Vercel for production auth.
        </div>
      )}
      <div className="flex flex-1">
        <Sidebar active={route} onNavigate={setRoute} />
        <main className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={route}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.22, ease: [0.25, 0.8, 0.25, 1] }}
            >
              {content}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};
