import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Calendar, Sparkles, Activity } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { StatCard } from '@/components/dashboard/StatCard';
import { RankingTable } from '@/components/dashboard/RankingTable';
import { DonutChart } from '@/components/charts/DonutChart';
import { BarChart } from '@/components/charts/BarChart';
import { Badge } from '@/components/ui/Badge';
import { ACCOUNTS, KPI, PORTFOLIO } from '@/data/accounts';
import { formatNumber } from '@/lib/utils';

export const OverviewRoute: React.FC<{ userName: string }> = ({ userName }) => {
  const { t, i18n } = useTranslation();
  const dateStr = new Intl.DateTimeFormat(i18n.language, { day: '2-digit', month: 'long', year: 'numeric' }).format(new Date());

  return (
    <div className="max-w-[1440px] mx-auto px-6 py-8">
      {/* Hero */}
      <motion.header
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.25, 0.8, 0.25, 1] }}
        className="relative mb-10 overflow-hidden rounded-lg border border-border-subtle bg-bg-elev/40 p-8 bg-mesh bg-noise"
      >
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2 text-xs text-text-muted">
            <Calendar className="w-3.5 h-3.5" />
            <span>{dateStr}</span>
            <span aria-hidden>·</span>
            <Badge variant="accent" dot>{t('common.today')}</Badge>
          </div>
          <Badge variant="accent" className="font-display">Hi, {userName}</Badge>
        </div>
        <h1 className="font-display text-[40px] leading-[1.1] font-bold tracking-tight mb-2">
          <span className="text-gradient">{t('overview.hero')}</span>
        </h1>
        <p className="text-text-muted max-w-[60ch]">{t('overview.subtitle')}</p>
      </motion.header>

      {/* KPI grid */}
      <section aria-labelledby="kpi-h" className="mb-12">
        <h2 id="kpi-h" className="sr-only">{t('overview.title')}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label={t('overview.hotLeads')} value={KPI.hotLeads.value} delta={KPI.hotLeads.delta} trend={KPI.hotLeads.trend} color="#44C9C1" delay={0} formatter={(n) => formatNumber(n, i18n.language)} />
          <StatCard label={t('overview.weeklyMeetings')} value={KPI.weeklyMeetings.value} delta={KPI.weeklyMeetings.delta} trend={KPI.weeklyMeetings.trend} color="#3B82F6" delay={0.05} formatter={(n) => formatNumber(n, i18n.language)} />
          <StatCard label={t('overview.openProposals')} value={KPI.openProposals.value} delta={KPI.openProposals.delta} trend={KPI.openProposals.trend} color="#F59E0B" delay={0.1} formatter={(n) => formatNumber(n, i18n.language)} />
          <StatCard label={t('overview.atRiskAccounts')} value={KPI.atRiskAccounts.value} delta={KPI.atRiskAccounts.delta} trend={KPI.atRiskAccounts.trend} color="#EF4444" delay={0.15} formatter={(n) => formatNumber(n, i18n.language)} />
        </div>
      </section>

      {/* Portfolio Breakdown */}
      <section aria-labelledby="portfolio-h" className="mb-12">
        <div className="flex items-end justify-between gap-4 mb-4">
          <div>
            <h2 id="portfolio-h" className="font-display text-2xl font-bold">{t('portfolio.title')}</h2>
            <p className="text-sm text-text-muted mt-1">59 accounts analyzed · colorblind-aware palette · "View as table" available.</p>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card>
            <CardHeader><CardTitle>{t('portfolio.byIcpTier')}</CardTitle></CardHeader>
            <DonutChart data={PORTFOLIO.byTier} centerValue="59" centerLabel="accounts" ariaLabel="Accounts by ICP tier" />
          </Card>
          <Card>
            <CardHeader><CardTitle>{t('portfolio.bySector')}</CardTitle></CardHeader>
            <DonutChart data={PORTFOLIO.bySector} centerValue="59" centerLabel="accounts" ariaLabel="Accounts by sector" />
          </Card>
          <Card>
            <CardHeader><CardTitle>{t('portfolio.dealSizeRange')}</CardTitle></CardHeader>
            <BarChart data={PORTFOLIO.dealSize} ariaLabel="Deal size range" />
          </Card>
        </div>
      </section>

      {/* AI insight */}
      <motion.section
        initial={{ opacity: 0, y: 8 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.4 }}
        className="mb-12"
      >
        <Card className="relative overflow-hidden border-accent/30 bg-gradient-to-br from-brand-500/10 via-transparent to-info-500/5">
          <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-accent" />
          </div>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <span className="font-display">{t('portfolio.aiAnalysis')}</span>
              <Badge variant="accent" dot className="font-normal">Live</Badge>
            </CardTitle>
            <CardDescription>Generated every morning by your AI Co-Pilot.</CardDescription>
          </CardHeader>
          <p className="text-[15px] leading-relaxed text-text max-w-[80ch]">
            <strong className="text-accent">Nubank</strong> is warming up fast — AI score jumped from 82 → 92 in 72 h. Three stakeholders engaged this week, including the CRO. Suggested next move: send the Tier-1 executive briefing today; schedule a discovery call for next Tuesday. <span className="text-text-muted">(Source: #4 account record, 3 briefings, 2 Surfe enrichments · cited.)</span>
          </p>
          <div className="flex flex-wrap gap-2 mt-4">
            <Badge variant="accent"><Activity className="w-3 h-3" /> +10 AI score this week</Badge>
            <Badge variant="success" dot>Champion status confirmed</Badge>
            <Badge variant="info">3 next-steps queued</Badge>
          </div>
        </Card>
      </motion.section>

      {/* ICP ranking */}
      <section aria-labelledby="ranking-h" className="mb-12">
        <div className="flex items-end justify-between gap-4 mb-4">
          <div>
            <h2 id="ranking-h" className="font-display text-2xl font-bold">{t('ranking.title')}</h2>
            <p className="text-sm text-text-muted mt-1">{t('ranking.subtitle')}</p>
          </div>
          <Badge variant="default" className="mono">{ACCOUNTS.length} {t('common.all').toLowerCase()}</Badge>
        </div>
        <RankingTable accounts={ACCOUNTS} />
      </section>
    </div>
  );
};
