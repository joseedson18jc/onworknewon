import * as React from 'react';
import { cn } from '@/lib/utils';

export interface SparkLineProps {
  data: number[];
  color?: string;
  className?: string;
  ariaLabel?: string;
  /** Show filled area under the line. */
  area?: boolean;
  height?: number;
}

export const SparkLine: React.FC<SparkLineProps> = ({ data, color = 'currentColor', className, ariaLabel = 'Trend line', area = false, height = 32 }) => {
  if (!data.length) return null;
  const width = 180;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const step = width / Math.max(data.length - 1, 1);
  const pts = data.map((v, i) => [i * step, height - ((v - min) / range) * (height - 4) - 2]);
  const line = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ');
  const areaPath = `${line} L${width},${height} L0,${height} Z`;
  const id = React.useId();
  return (
    <svg
      role="img"
      aria-label={ariaLabel}
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      className={cn('w-full', className)}
      style={{ color, height }}
    >
      {area && (
        <>
          <defs>
            <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor={color} stopOpacity="0.35" />
              <stop offset="1" stopColor={color} stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={areaPath} fill={`url(#${id})`} />
        </>
      )}
      <path d={line} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
};
