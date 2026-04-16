import * as React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface BarDatum { label: string; value: number }

export interface BarChartProps {
  data: BarDatum[];
  ariaLabel?: string;
  className?: string;
  barHeight?: number;
  gap?: number;
  formatValue?: (n: number) => string;
}

export const BarChart: React.FC<BarChartProps> = ({
  data, ariaLabel = 'Bar chart', className, gap = 14, formatValue = (n) => String(n),
}) => {
  const max = Math.max(...data.map((d) => d.value), 1);
  const id = React.useId();
  return (
    <div role="img" aria-label={ariaLabel} className={cn('flex flex-col', className)} style={{ gap }}>
      <svg width="0" height="0" className="absolute">
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="rgb(var(--accent))" stopOpacity="0.7" />
            <stop offset="1" stopColor="rgb(var(--accent))" />
          </linearGradient>
        </defs>
      </svg>
      {data.map((d, i) => {
        const w = (d.value / max) * 100;
        return (
          <div key={i} className="flex items-center gap-3 text-[12px]">
            <div className="w-16 shrink-0 text-text-muted mono">{d.label}</div>
            <div className="flex-1 relative h-[14px]">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${w}%` }}
                transition={{ duration: 0.6, delay: i * 0.06, ease: [0.4, 0, 0.2, 1] }}
                className="h-full rounded-xs"
                style={{ background: `url(#${id}), linear-gradient(90deg, rgb(var(--accent) / 0.7), rgb(var(--accent)))` }}
              />
            </div>
            <div className="w-10 text-right mono font-semibold">{formatValue(d.value)}</div>
          </div>
        );
      })}
    </div>
  );
};
