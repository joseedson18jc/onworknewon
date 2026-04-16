import * as React from 'react';
import { cn } from '@/lib/utils';

export interface HeatmapDay { date: string; count: number }

export interface HeatmapProps {
  data: HeatmapDay[];
  ariaLabel?: string;
  cellSize?: number;
  gap?: number;
  onDayClick?: (day: HeatmapDay) => void;
  className?: string;
}

const WEEKDAY_LABELS = ['', 'Mon', '', 'Wed', '', 'Fri', ''];

/**
 * GitHub-contributions-style 52-week × 7-day heatmap.
 * Uses brand-tinted 5-level scale. Cells are buttons (keyboard + screen-reader friendly).
 */
export const Heatmap: React.FC<HeatmapProps> = ({ data, ariaLabel = 'Activity heatmap', cellSize = 12, gap = 3, onDayClick, className }) => {
  const max = Math.max(1, ...data.map((d) => d.count));
  const getLevel = (n: number) => (n === 0 ? 0 : Math.min(4, Math.ceil((n / max) * 4)));

  // Layout: group days into columns of 7 (Sunday-start).
  const start = new Date(data[0]!.date);
  const startDow = start.getDay();
  const columns: Array<Array<HeatmapDay | null>> = [];
  let col: Array<HeatmapDay | null> = Array.from({ length: startDow }, () => null);
  for (const day of data) {
    col.push(day);
    if (col.length === 7) { columns.push(col); col = []; }
  }
  if (col.length) { while (col.length < 7) col.push(null); columns.push(col); }

  // Month labels
  const monthTicks: Array<{ col: number; label: string }> = [];
  let lastMonth = -1;
  for (let c = 0; c < columns.length; c++) {
    for (const d of columns[c]!) {
      if (!d) continue;
      const m = new Date(d.date).getMonth();
      if (m !== lastMonth) {
        monthTicks.push({ col: c, label: new Date(d.date).toLocaleString('default', { month: 'short' }) });
        lastMonth = m;
      }
      break;
    }
  }

  const width = columns.length * (cellSize + gap);
  const height = 7 * (cellSize + gap);
  const monthRowH = 14;
  const weekdayColW = 28;

  return (
    <div className={cn('overflow-x-auto', className)} role="img" aria-label={ariaLabel}>
      <svg width={weekdayColW + width} height={monthRowH + height}>
        <g transform={`translate(${weekdayColW}, 0)`}>
          {monthTicks.map((m, i) => (
            <text key={i} x={m.col * (cellSize + gap)} y={10} className="fill-text-muted text-[10px]" style={{ fontFamily: 'Inter, sans-serif' }}>
              {m.label}
            </text>
          ))}
        </g>
        <g transform={`translate(0, ${monthRowH})`}>
          {WEEKDAY_LABELS.map((l, i) => l && (
            <text key={i} x={0} y={i * (cellSize + gap) + cellSize - 2} className="fill-text-muted text-[10px]" style={{ fontFamily: 'Inter, sans-serif' }}>
              {l}
            </text>
          ))}
        </g>
        <g transform={`translate(${weekdayColW}, ${monthRowH})`}>
          {columns.map((colDays, c) => colDays.map((d, r) => {
            if (!d) return null;
            const lvl = getLevel(d.count);
            const fill = lvl === 0 ? 'rgb(var(--border-subtle))'
              : lvl === 1 ? 'rgb(var(--accent) / 0.25)'
              : lvl === 2 ? 'rgb(var(--accent) / 0.5)'
              : lvl === 3 ? 'rgb(var(--accent) / 0.75)'
              : 'rgb(var(--accent))';
            return (
              <rect
                key={`${c}-${r}`}
                x={c * (cellSize + gap)}
                y={r * (cellSize + gap)}
                width={cellSize}
                height={cellSize}
                rx={2}
                fill={fill}
                aria-label={`${d.date}: ${d.count} activities`}
                tabIndex={0}
                role="button"
                style={{ cursor: 'pointer' }}
                onClick={() => onDayClick?.(d)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onDayClick?.(d); } }}
              >
                <title>{d.date}: {d.count} activities</title>
              </rect>
            );
          }))}
        </g>
      </svg>
      <div className="flex items-center gap-2 mt-2 text-xs text-text-muted pl-[28px]">
        <span>Less</span>
        {[0, 1, 2, 3, 4].map((l) => (
          <span
            key={l}
            className="inline-block rounded-[2px]"
            style={{
              width: cellSize,
              height: cellSize,
              background: l === 0 ? 'rgb(var(--border-subtle))'
                : l === 1 ? 'rgb(var(--accent) / 0.25)'
                : l === 2 ? 'rgb(var(--accent) / 0.5)'
                : l === 3 ? 'rgb(var(--accent) / 0.75)'
                : 'rgb(var(--accent))',
            }}
          />
        ))}
        <span>More</span>
      </div>
    </div>
  );
};
