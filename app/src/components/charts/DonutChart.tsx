import * as React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface DonutSlice {
  label: string;
  value: number;
  color: string;
}

export interface DonutChartProps {
  data: DonutSlice[];
  centerValue?: string | number;
  centerLabel?: string;
  size?: number;
  thickness?: number;
  ariaLabel?: string;
  className?: string;
}

export const DonutChart: React.FC<DonutChartProps> = ({
  data, centerValue, centerLabel, size = 160, thickness = 16, ariaLabel = 'Donut chart', className,
}) => {
  const radius = (size - thickness) / 2;
  const circ = 2 * Math.PI * radius;
  const total = data.reduce((a, s) => a + s.value, 0) || 1;
  let offset = 0;
  const trackColor = 'rgb(var(--border-subtle))';

  return (
    <div className={cn('flex items-center gap-4', className)}>
      <svg role="img" aria-label={ariaLabel} width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke={trackColor} strokeWidth={thickness} />
        {data.map((s, i) => {
          const len = (s.value / total) * circ;
          const dash = `${len} ${circ - len}`;
          const el = (
            <motion.circle
              key={i}
              cx={size/2}
              cy={size/2}
              r={radius}
              fill="none"
              stroke={s.color}
              strokeWidth={thickness}
              strokeDasharray={dash}
              strokeDashoffset={-offset}
              transform={`rotate(-90 ${size/2} ${size/2})`}
              initial={{ strokeDasharray: `0 ${circ}` }}
              animate={{ strokeDasharray: dash }}
              transition={{ duration: 0.6, delay: i * 0.08, ease: [0.4, 0, 0.2, 1] }}
            />
          );
          offset += len;
          return el;
        })}
        {centerValue !== undefined && (
          <>
            <text x={size/2} y={size/2 - 2} textAnchor="middle" className="fill-text font-display text-[24px] font-bold">{centerValue}</text>
            {centerLabel && <text x={size/2} y={size/2 + 16} textAnchor="middle" className="fill-text-muted text-[10px]">{centerLabel}</text>}
          </>
        )}
      </svg>
      <div className="flex flex-col gap-2 text-[13px] flex-1 min-w-0">
        {data.map((s, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: s.color }} />
            <span className="truncate">{s.label}</span>
            <span className="mono ml-auto text-text-muted">{s.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
