import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/Badge';
import { SparkLine } from '@/components/charts/SparkLine';
import { formatCurrency, cn } from '@/lib/utils';
import type { Account } from '@/data/accounts';

export interface RankingTableProps { accounts: Account[] }

const tierVariant = (t: 1 | 2 | 3): 'tier1' | 'tier2' | 'tier3' =>
  t === 1 ? 'tier1' : t === 2 ? 'tier2' : 'tier3';

export const RankingTable: React.FC<RankingTableProps> = ({ accounts }) => {
  const { t, i18n } = useTranslation();
  return (
    <div className="rounded-md border border-border bg-bg-elev overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-[13px]">
          <thead>
            <tr className="bg-bg-elev-2 text-left">
              {[
                ['rank', t('ranking.column.rank')],
                ['name', t('ranking.column.account')],
                ['tier', t('ranking.column.tier')],
                ['sector', t('ranking.column.sector')],
                ['deal', t('ranking.column.dealSize')],
                ['trend', '30d'],
                ['ai', t('ranking.column.aiScore')],
                ['next', t('ranking.column.nextAction')],
              ].map(([k, label]) => (
                <th
                  key={k}
                  scope="col"
                  className="px-4 py-3 font-medium text-[10.5px] uppercase tracking-[0.06em] text-text-muted"
                >
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {accounts.map((a, i) => {
              const scoreTone =
                a.aiScore >= 80 ? 'text-success-500' : a.aiScore >= 60 ? 'text-warning-500' : 'text-danger-500';
              const trendColor =
                a.trend[a.trend.length - 1] > a.trend[0]
                  ? 'rgb(var(--accent))'
                  : a.trend[a.trend.length - 1] < a.trend[0]
                    ? '#EF4444'
                    : '#F59E0B';
              return (
                <motion.tr
                  key={a.id}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: i * 0.03, ease: [0.25, 0.8, 0.25, 1] }}
                  className="border-t border-border-subtle hover:bg-bg-elev-2/50 transition-colors cursor-pointer"
                >
                  <td className="px-4 py-3 mono text-text-muted">{String(a.rank).padStart(2, '0')}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div
                        aria-hidden
                        className="w-7 h-7 rounded-sm flex items-center justify-center font-semibold text-[12px] text-white shrink-0"
                        style={{ background: a.color }}
                      >
                        {a.logo}
                      </div>
                      <span className="font-medium">{a.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={tierVariant(a.tier)}>T{a.tier}</Badge>
                  </td>
                  <td className="px-4 py-3 text-text-muted">{a.sector}</td>
                  <td className="px-4 py-3 mono text-right whitespace-nowrap">{formatCurrency(a.dealSize, i18n.language)}</td>
                  <td className="px-4 py-3 w-[110px]">
                    <SparkLine data={a.trend} color={trendColor} height={24} ariaLabel={`${a.name} 30-day trend`} />
                  </td>
                  <td className={cn('px-4 py-3 mono text-right font-semibold', scoreTone)}>{a.aiScore}</td>
                  <td className="px-4 py-3">
                    <Badge
                      variant={
                        a.status === 'champion' ? 'success' : a.status === 'blocker' ? 'danger' : 'warning'
                      }
                      dot
                    >
                      {t(`decisionMakers.role.${a.status}`)}
                    </Badge>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
