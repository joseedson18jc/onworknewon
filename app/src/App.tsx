import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { AnimatePresence, motion } from 'framer-motion';
import { LoginRoute } from '@/routes/LoginRoute';
import { OverviewRoute } from '@/routes/OverviewRoute';
import { PlaceholderRoute } from '@/routes/PlaceholderRoute';
import { TopBar } from '@/components/layout/TopBar';
import { Sidebar, type RouteKey } from '@/components/layout/Sidebar';

interface Session { name: string; role: 'admin' | 'viewer' }

export const App: React.FC = () => {
  const { t } = useTranslation();
  const [session, setSession] = React.useState<Session | null>(null);
  const [route, setRoute] = React.useState<RouteKey>('overview');

  if (!session) {
    return <LoginRoute onSignIn={setSession} />;
  }

  let content: React.ReactNode;
  if (route === 'overview') {
    content = <OverviewRoute userName={session.name} />;
  } else if (route === 'accounts') {
    content = <PlaceholderRoute title={t('ranking.title')} description={t('ranking.subtitle')} roadmap={['Virtualized table with @tanstack/react-table', 'Multi-column filters + full-text search', 'Slide-in account detail drawer', 'Bulk Surfe enrichment trigger']} />;
  } else if (route === 'briefings') {
    content = <PlaceholderRoute title={t('briefings.title')} description={t('briefings.allAccounts')} roadmap={['Priority briefings with AI-generated talking points', 'Cited source footer on every AI claim', 'Voice read-aloud in PT / EN / zh-CN', 'One-click PDF export']} />;
  } else if (route === 'coPilot') {
    content = <PlaceholderRoute title={t('coPilot.title')} description={t('coPilot.subtitle')} roadmap={['Streaming responses via /api/ai/notes', 'Voice I/O via ElevenLabs (server proxy)', 'Per-conversation memory, resumable across sessions', 'Keyboard-first ⌘K palette']} />;
  } else if (route === 'cadence') {
    content = <PlaceholderRoute title={t('cadence.title')} description={t('cadence.heatmap')} roadmap={['GitHub-style calendar heatmap of activity', 'Drill-down into any cell', 'Drag-to-reorder cadence steps with Framer Motion', 'Reply-rate analytics per template']} />;
  } else if (route === 'marketMap') {
    content = <PlaceholderRoute title={t('decisionMakers.title')} description={t('decisionMakers.subtitle')} roadmap={['Force-directed graph (D3 / visx)', 'Champion / blocker / neutral color coding', 'Edges = reports-to relationships from Surfe', 'List-mode toggle for screen readers']} />;
  } else if (route === 'goToMarket') {
    content = <PlaceholderRoute title={t('nav.goToMarket')} description="Brazil map shaded by TAM per region." roadmap={['D3 + topojson interactive Brazil map', 'Toggle: by state, industry cluster, rep territory', 'Drill-in to account list per region', 'Competitive matrix overlay']} />;
  } else {
    content = <PlaceholderRoute title={t('nav.settings')} description="Team, API keys (server-side), integrations, audit log." roadmap={['Server-side proxy for OpenAI / ElevenLabs / Surfe keys', 'Argon2id password hashing + httpOnly session cookie', 'Per-user rate limits + monthly budget caps', 'Append-only audit log (SOC 2 ready)']} />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <TopBar onSignOut={() => setSession(null)} />
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
