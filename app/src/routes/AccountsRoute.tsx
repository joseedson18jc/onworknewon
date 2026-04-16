import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
  createColumnHelper, flexRender, getCoreRowModel, getFilteredRowModel,
  getSortedRowModel, useReactTable, type SortingState,
} from '@tanstack/react-table';
import { useVirtualizer } from '@tanstack/react-virtual';
import { X, ArrowUp, ArrowDown, Search } from 'lucide-react';
import { ACCOUNTS, type Account } from '@/data/accounts';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { SparkLine } from '@/components/charts/SparkLine';
import { formatCurrency, cn } from '@/lib/utils';

const columnHelper = createColumnHelper<Account>();
const tierVariant = (t: 1 | 2 | 3): 'tier1' | 'tier2' | 'tier3' => t === 1 ? 'tier1' : t === 2 ? 'tier2' : 'tier3';

export const AccountsRoute: React.FC<{ focusAccountId?: string | null; onFocusConsumed?: () => void }> = ({ focusAccountId, onFocusConsumed }) => {
  const { t, i18n } = useTranslation();
  const [filter, setFilter] = React.useState('');
  const [sorting, setSorting] = React.useState<SortingState>([{ id: 'rank', desc: false }]);
  const [selected, setSelected] = React.useState<Account | null>(null);

  React.useEffect(() => {
    if (!focusAccountId) return;
    const a = ACCOUNTS.find((x) => x.id === focusAccountId);
    if (a) setSelected(a);
    onFocusConsumed?.();
  }, [focusAccountId, onFocusConsumed]);

  const columns = React.useMemo(
    () => [
      columnHelper.accessor('rank', {
        header: '#',
        cell: (info) => <span className="mono text-text-muted">{String(info.getValue()).padStart(2, '0')}</span>,
        size: 50,
      }),
      columnHelper.accessor('name', {
        header: t('ranking.column.account'),
        cell: (info) => {
          const a = info.row.original;
          return (
            <div className="flex items-center gap-2.5">
              <div aria-hidden className="w-7 h-7 rounded-xs flex items-center justify-center font-semibold text-[11px] text-white shrink-0" style={{ background: a.color }}>{a.logo}</div>
              <span className="font-medium">{a.name}</span>
            </div>
          );
        },
        size: 240,
      }),
      columnHelper.accessor('tier', {
        header: t('ranking.column.tier'),
        cell: (info) => <Badge variant={tierVariant(info.getValue())}>T{info.getValue()}</Badge>,
        size: 80,
      }),
      columnHelper.accessor('sector', { header: t('ranking.column.sector'), size: 120 }),
      columnHelper.accessor('dealSize', {
        header: t('ranking.column.dealSize'),
        cell: (info) => <span className="mono">{formatCurrency(info.getValue(), i18n.language)}</span>,
        size: 140,
      }),
      columnHelper.accessor('trend', {
        header: '30d',
        cell: (info) => {
          const v = info.getValue();
          const c = v.at(-1)! > v[0]! ? 'rgb(var(--accent))' : v.at(-1)! < v[0]! ? '#EF4444' : '#F59E0B';
          return <SparkLine data={v} color={c} height={24} ariaLabel={`${info.row.original.name} 30-day trend`} />;
        },
        size: 110,
        enableSorting: false,
      }),
      columnHelper.accessor('aiScore', {
        header: t('ranking.column.aiScore'),
        cell: (info) => {
          const v = info.getValue();
          const tone = v >= 80 ? 'text-success-500' : v >= 60 ? 'text-warning-500' : 'text-danger-500';
          return <span className={cn('mono font-semibold', tone)}>{v}</span>;
        },
        size: 80,
      }),
      columnHelper.accessor('status', {
        header: t('ranking.column.nextAction'),
        cell: (info) => (
          <Badge variant={info.getValue() === 'champion' ? 'success' : info.getValue() === 'blocker' ? 'danger' : 'warning'} dot>
            {t(`decisionMakers.role.${info.getValue()}`)}
          </Badge>
        ),
        size: 140,
      }),
    ],
    [i18n.language, t],
  );

  const table = useReactTable({
    data: ACCOUNTS,
    columns,
    state: { sorting, globalFilter: filter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const rows = table.getRowModel().rows;
  const parentRef = React.useRef<HTMLDivElement>(null);
  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 56,
    overscan: 8,
  });

  return (
    <div className="max-w-[1440px] mx-auto px-6 py-8">
      <div className="flex items-end justify-between gap-4 mb-6 flex-wrap">
        <div>
          <h1 className="font-display text-2xl font-bold">{t('ranking.title')}</h1>
          <p className="text-sm text-text-muted mt-1">{t('ranking.subtitle')}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="search"
              aria-label={t('common.search')}
              placeholder={t('common.search') + '…'}
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-64 h-9 rounded-sm border border-border bg-bg-elev pl-9 pr-3 text-sm placeholder:text-text-faint focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/30"
            />
          </div>
          <Badge variant="default" className="mono">{rows.length} / {ACCOUNTS.length}</Badge>
        </div>
      </div>

      <div className="rounded-md border border-border bg-bg-elev overflow-hidden">
        <div className="overflow-x-auto">
          <div className="min-w-[1020px]">
            <div className="bg-bg-elev-2 text-left flex" role="row">
              {table.getHeaderGroups()[0]!.headers.map((h) => {
                const canSort = h.column.getCanSort();
                const sort = h.column.getIsSorted();
                return (
                  <div
                    key={h.id}
                    role="columnheader"
                    aria-sort={sort === 'asc' ? 'ascending' : sort === 'desc' ? 'descending' : 'none'}
                    style={{ width: h.getSize() }}
                    className={cn('px-4 py-3 font-medium text-[10.5px] uppercase tracking-[0.06em] text-text-muted', canSort && 'cursor-pointer select-none hover:text-text transition-colors')}
                    onClick={canSort ? h.column.getToggleSortingHandler() : undefined}
                    onKeyDown={canSort ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); h.column.getToggleSortingHandler()?.(e); } } : undefined}
                    tabIndex={canSort ? 0 : -1}
                  >
                    <span className="inline-flex items-center gap-1">
                      {flexRender(h.column.columnDef.header, h.getContext())}
                      {sort === 'asc' && <ArrowUp className="w-3 h-3" />}
                      {sort === 'desc' && <ArrowDown className="w-3 h-3" />}
                    </span>
                  </div>
                );
              })}
            </div>

            <div ref={parentRef} className="max-h-[640px] overflow-y-auto" role="rowgroup">
              <div style={{ height: rowVirtualizer.getTotalSize(), position: 'relative' }}>
                {rowVirtualizer.getVirtualItems().map((v) => {
                  const row = rows[v.index]!;
                  return (
                    <div
                      key={row.id}
                      role="row"
                      tabIndex={0}
                      onClick={() => setSelected(row.original)}
                      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelected(row.original); } }}
                      style={{ position: 'absolute', top: 0, left: 0, height: v.size, transform: `translateY(${v.start}px)` }}
                      className="flex w-full border-t border-border-subtle hover:bg-bg-elev-2/50 cursor-pointer transition-colors focus:outline-none focus-visible:bg-bg-elev-2 focus-visible:ring-1 focus-visible:ring-accent"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <div key={cell.id} style={{ width: cell.column.getSize() }} className="px-4 py-3 flex items-center text-[13px]">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {selected && <AccountDrawer account={selected} onClose={() => setSelected(null)} />}
      </AnimatePresence>
    </div>
  );
};

/** Slide-in account detail drawer. */
const AccountDrawer: React.FC<{ account: Account; onClose: () => void }> = ({ account, onClose }) => {
  const { t, i18n } = useTranslation();
  const lastRef = React.useRef<HTMLButtonElement>(null);
  React.useEffect(() => { lastRef.current?.focus(); }, []);
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);
  return (
    <>
      <motion.button
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-40 bg-navy-900/60 backdrop-blur-sm"
        aria-label="Close drawer"
      />
      <motion.aside
        initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
        transition={{ duration: 0.25, ease: [0.25, 0.8, 0.25, 1] }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-title"
        className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-[520px] bg-bg-elev border-l border-border shadow-xl overflow-y-auto"
      >
        <div className="sticky top-0 z-10 glass flex items-center justify-between px-6 py-4 border-b border-border-subtle">
          <div className="flex items-center gap-3">
            <div aria-hidden className="w-9 h-9 rounded-sm flex items-center justify-center font-semibold text-white" style={{ background: account.color }}>{account.logo}</div>
            <div>
              <h2 id="drawer-title" className="font-display text-lg font-bold">{account.name}</h2>
              <div className="text-xs text-text-muted">{account.domain} · {account.sector}</div>
            </div>
          </div>
          <Button ref={lastRef} variant="icon" size="icon" onClick={onClose} aria-label="Close">
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-3 gap-3">
            <Stat label="Tier" value={<Badge variant={tierVariant(account.tier)}>T{account.tier}</Badge>} />
            <Stat label={t('ranking.column.dealSize')} value={<span className="mono font-semibold">{formatCurrency(account.dealSize, i18n.language)}</span>} />
            <Stat label={t('ranking.column.aiScore')} value={<span className={cn('mono font-bold text-xl', account.aiScore >= 80 ? 'text-success-500' : account.aiScore >= 60 ? 'text-warning-500' : 'text-danger-500')}>{account.aiScore}</span>} />
          </div>

          <section>
            <h3 className="font-display font-semibold mb-3">{t('decisionMakers.title')}</h3>
            <ul className="space-y-2">
              {account.decisionMakers.map((dm) => (
                <li key={dm.id} className="flex items-center gap-3 text-sm">
                  <span aria-hidden className="w-8 h-8 rounded-full bg-bg-elev-2 flex items-center justify-center text-xs font-semibold">{dm.name.split(' ').map((p) => p[0]).join('').slice(0, 2)}</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{dm.name}</div>
                    <div className="text-xs text-text-muted truncate">{dm.title}</div>
                  </div>
                  <Badge
                    variant={dm.stance === 'champion' ? 'success' : dm.stance === 'blocker' ? 'danger' : dm.stance === 'neutral' ? 'warning' : 'default'}
                    dot
                  >
                    {t(`decisionMakers.role.${dm.stance}`)}
                  </Badge>
                  <span className="mono text-xs text-text-faint w-8 text-right">{dm.influence}</span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h3 className="font-display font-semibold mb-3">{t('briefings.title')}</h3>
            <ul className="space-y-3">
              {account.briefings.map((b) => (
                <li key={b.id} className="rounded-sm border border-border-subtle bg-bg-elev-2/50 p-4">
                  <div className="flex items-center gap-2 mb-1.5">
                    <Badge variant={b.priority === 'high' ? 'danger' : b.priority === 'medium' ? 'warning' : 'default'} dot>{b.priority}</Badge>
                    <span className="font-medium text-sm">{b.title}</span>
                  </div>
                  <p className="text-xs text-text-muted mb-2">{b.summary}</p>
                  <div className="text-xs text-accent">→ {b.nextAction}</div>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </motion.aside>
    </>
  );
};

const Stat: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <div className="rounded-sm border border-border-subtle bg-bg-elev-2/40 p-3">
    <div className="text-[10px] uppercase tracking-[0.06em] text-text-muted mb-1">{label}</div>
    <div>{value}</div>
  </div>
);
