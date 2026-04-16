import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { AnimatePresence } from 'framer-motion';
import {
  createColumnHelper, flexRender, getCoreRowModel, getFilteredRowModel,
  getSortedRowModel, useReactTable, type SortingState,
} from '@tanstack/react-table';
import { useVirtualizer } from '@tanstack/react-virtual';
import { ArrowUp, ArrowDown, Search } from 'lucide-react';
import { ACCOUNTS, type Account } from '@/data/accounts';
import { Badge } from '@/components/ui/Badge';
import { LogoAvatar } from '@/components/ui/LogoAvatar';
import { SparkLine } from '@/components/charts/SparkLine';
import { AccountDrawer } from '@/components/dashboard/AccountDrawer';
import { formatCurrency, cn } from '@/lib/utils';

const columnHelper = createColumnHelper<Account>();
const tierVariant = (t: 1 | 2 | 3): 'tier1' | 'tier2' | 'tier3' => t === 1 ? 'tier1' : t === 2 ? 'tier2' : 'tier3';

export interface AccountsFilter {
  tier?: 1 | 2 | 3;
  sector?: string;
  minDealSize?: number;
  maxDealSize?: number;
  status?: 'champion' | 'neutral' | 'blocker';
  search?: string;
}

export interface AccountsRouteProps {
  focusAccountId?: string | null;
  onFocusConsumed?: () => void;
  initialFilter?: AccountsFilter | null;
  onFilterConsumed?: () => void;
}

export const AccountsRoute: React.FC<AccountsRouteProps> = ({ focusAccountId, onFocusConsumed, initialFilter, onFilterConsumed }) => {
  const { t, i18n } = useTranslation();
  const [filter, setFilter] = React.useState(initialFilter?.search ?? '');
  const [facet, setFacet] = React.useState<AccountsFilter | null>(initialFilter ?? null);
  const [sorting, setSorting] = React.useState<SortingState>([{ id: 'rank', desc: false }]);
  const [selected, setSelected] = React.useState<Account | null>(null);

  React.useEffect(() => {
    if (!initialFilter) return;
    setFacet(initialFilter);
    if (initialFilter.search) setFilter(initialFilter.search);
    onFilterConsumed?.();
  }, [initialFilter, onFilterConsumed]);

  React.useEffect(() => {
    if (!focusAccountId) return;
    const a = ACCOUNTS.find((x) => x.id === focusAccountId);
    if (a) setSelected(a);
    onFocusConsumed?.();
  }, [focusAccountId, onFocusConsumed]);

  const filteredAccounts = React.useMemo(() => {
    if (!facet) return ACCOUNTS;
    return ACCOUNTS.filter((a) => {
      if (facet.tier && a.tier !== facet.tier) return false;
      if (facet.sector && a.sector !== facet.sector) return false;
      if (facet.status && a.status !== facet.status) return false;
      if (facet.minDealSize !== undefined && a.dealSize < facet.minDealSize) return false;
      if (facet.maxDealSize !== undefined && a.dealSize > facet.maxDealSize) return false;
      return true;
    });
  }, [facet]);

  const facetLabel = React.useMemo(() => {
    if (!facet) return null;
    const parts: string[] = [];
    if (facet.tier) parts.push(`Tier ${facet.tier}`);
    if (facet.sector) parts.push(facet.sector);
    if (facet.status) parts.push(t(`decisionMakers.role.${facet.status}`));
    if (facet.minDealSize !== undefined || facet.maxDealSize !== undefined) {
      const fmt = (n: number) => `$${Math.round(n / 1000)}K`;
      if (facet.minDealSize !== undefined && facet.maxDealSize !== undefined) parts.push(`${fmt(facet.minDealSize)}–${fmt(facet.maxDealSize)}`);
      else if (facet.minDealSize !== undefined) parts.push(`≥ ${fmt(facet.minDealSize)}`);
      else if (facet.maxDealSize !== undefined) parts.push(`≤ ${fmt(facet.maxDealSize)}`);
    }
    return parts.join(' · ');
  }, [facet, t]);

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
              <LogoAvatar domain={a.domain} letter={a.logo} color={a.color} name={a.name} size={28} />
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
    data: filteredAccounts,
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
          {facetLabel && (
            <button
              type="button"
              onClick={() => setFacet(null)}
              className="mt-2 inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 text-accent px-3 py-1 text-xs font-medium hover:bg-accent/20 transition-colors"
              aria-label="Clear active filter"
            >
              <span>{facetLabel}</span>
              <span aria-hidden>×</span>
            </button>
          )}
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
