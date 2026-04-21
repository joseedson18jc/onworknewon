import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Heatmap, type HeatmapDay } from '@/components/charts/Heatmap';
import { generateCadence } from '@/data/accounts';
import { formatNumber } from '@/lib/utils';

export const CadenceRoute: React.FC = () => {
  const { t, i18n } = useTranslation();
  const data = React.useMemo(() => generateCadence(), []);
  const [selectedDay, setSelectedDay] = React.useState<HeatmapDay | null>(null);

  const total = data.reduce((a, d) => a + d.count, 0);
  const max = Math.max(...data.map((d) => d.count));
  const last30 = data.slice(-30).reduce((a, d) => a + d.count, 0);
  const prev30 = data.slice(-60, -30).reduce((a, d) => a + d.count, 0);
  const delta = Math.round(((last30 - prev30) / Math.max(prev30, 1)) * 100);

  const streak = React.useMemo(() => {
    let s = 0;
    for (let i = data.length - 1; i >= 0; i--) { if (data[i]!.count > 0) s++; else break; }
    return s;
  }, [data]);

  return (
    <div className="max-w-[1440px] mx-auto px-6 py-8">
      <div className="flex items-end justify-between gap-4 mb-6 flex-wrap">
        <div>
          <h1 className="font-display text-2xl font-bold">{t('cadence.title')}</h1>
          <p className="text-sm text-text-muted mt-1">{t('cadence.heatmap')}</p>
        </div>
        <Badge variant="accent" dot>Live</Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Stat label="Total activities (365d)" value={formatNumber(total, i18n.language)} />
        <Stat label="Last 30 days" value={formatNumber(last30, i18n.language)} sub={delta === 0 ? '→' : delta > 0 ? `↗ +${delta}%` : `↘ ${delta}%`} tone={delta >= 0 ? 'success' : 'danger'} />
        <Stat label="Peak day" value={formatNumber(max, i18n.language)} />
        <Stat label="Active streak" value={`${streak} days`} tone="accent" />
      </div>

      <Card className="p-6">
        <CardHeader>
          <CardTitle>Activity by day</CardTitle>
          <CardDescription>Each cell is one day. Click any cell to drill into that day's touchpoints.</CardDescription>
        </CardHeader>
        <Heatmap data={data} onDayClick={setSelectedDay} />
      </Card>

      {selectedDay && (
        <Card className="mt-4 border-accent/25 bg-accent/5">
          <CardHeader>
            <CardTitle>{selectedDay.date}</CardTitle>
            <CardDescription>{formatNumber(selectedDay.count, i18n.language)} activities on this day.</CardDescription>
          </CardHeader>
          <p className="text-sm text-text-muted">Tip: in Wave 6, this drills into the individual emails / calls / meetings logged on the selected day, with one-click reply templates.</p>
        </Card>
      )}
    </div>
  );
};

const Stat: React.FC<{ label: string; value: string; sub?: string; tone?: 'success' | 'danger' | 'accent' }> = ({ label, value, sub, tone }) => (
  <Card>
    <div className="text-[10.5px] uppercase tracking-[0.06em] text-text-muted font-semibold">{label}</div>
    <div className="mono text-2xl font-bold mt-2">{value}</div>
    {sub && <div className={`text-xs mt-0.5 ${tone === 'success' ? 'text-success-500' : tone === 'danger' ? 'text-danger-500' : 'text-accent'}`}>{sub}</div>}
  </Card>
);
