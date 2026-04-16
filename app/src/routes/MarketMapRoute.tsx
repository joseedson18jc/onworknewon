import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ForceGraph, type GraphNode, type GraphLink } from '@/components/charts/ForceGraph';
import { ACCOUNTS } from '@/data/accounts';

export const MarketMapRoute: React.FC = () => {
  const { t } = useTranslation();
  const [accountId, setAccountId] = React.useState(ACCOUNTS[0]!.id);
  const account = ACCOUNTS.find((a) => a.id === accountId) ?? ACCOUNTS[0]!;

  const nodes: GraphNode[] = React.useMemo(
    () => account.decisionMakers.map((dm) => ({
      id: dm.id, label: dm.name, title: dm.title, stance: dm.stance, influence: dm.influence,
    })),
    [account],
  );
  const links: GraphLink[] = React.useMemo(
    () => account.decisionMakers
      .filter((dm) => !!dm.reportsTo)
      .map((dm) => ({ source: dm.reportsTo!, target: dm.id })),
    [account],
  );

  const legend = [
    { key: 'champion', label: t('decisionMakers.role.champion'), color: '#22C55E' },
    { key: 'neutral',  label: t('decisionMakers.role.neutral'),  color: '#F59E0B' },
    { key: 'blocker',  label: t('decisionMakers.role.blocker'),  color: '#EF4444' },
    { key: 'unknown',  label: t('decisionMakers.role.unknown'),  color: '#6C7A90' },
  ];

  return (
    <div className="max-w-[1440px] mx-auto px-6 py-8">
      <div className="flex items-end justify-between gap-4 mb-6 flex-wrap">
        <div>
          <h1 className="font-display text-2xl font-bold">{t('decisionMakers.title')}</h1>
          <p className="text-sm text-text-muted mt-1">{t('decisionMakers.subtitle')}</p>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <span className="text-text-muted">Account</span>
          <select
            value={accountId}
            onChange={(e) => setAccountId(e.target.value)}
            className="h-9 rounded-sm border border-border bg-bg-elev px-3 text-sm focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/30"
          >
            {ACCOUNTS.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
        </label>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-4">
        <Card className="p-2">
          <div className="flex items-center justify-between px-3 py-2">
            <div className="text-sm font-medium">{account.name}</div>
            <div className="flex flex-wrap gap-2">
              {legend.map((l) => (
                <span key={l.key} className="inline-flex items-center gap-1.5 text-xs text-text-muted">
                  <span aria-hidden className="w-2.5 h-2.5 rounded-full" style={{ background: l.color }} />
                  {l.label}
                </span>
              ))}
            </div>
          </div>
          <div className="h-[500px]">
            <ForceGraph
              nodes={nodes}
              links={links}
              width={900}
              height={500}
              ariaLabel={`Decision-maker graph for ${account.name}`}
              textModeId={`dm-list-${account.id}`}
            />
          </div>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Stakeholder list</CardTitle>
            <CardDescription>Reports-to edges pulled from Surfe enrichment.</CardDescription>
          </CardHeader>
          <ul className="space-y-2.5">
            {account.decisionMakers.map((dm) => (
              <li key={dm.id} className="flex items-center gap-3 text-sm">
                <span aria-hidden className="w-8 h-8 rounded-full bg-bg-elev-2 flex items-center justify-center text-xs font-semibold shrink-0">
                  {dm.name.split(' ').map((p) => p[0]).join('').slice(0, 2)}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{dm.name}</div>
                  <div className="text-xs text-text-muted truncate">{dm.title}</div>
                </div>
                <Badge
                  variant={dm.stance === 'champion' ? 'success' : dm.stance === 'blocker' ? 'danger' : dm.stance === 'neutral' ? 'warning' : 'default'}
                  dot
                >
                  {dm.influence}
                </Badge>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
};
