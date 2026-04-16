import * as React from 'react';
import { motion, useReducedMotion, useSpring, useTransform } from 'framer-motion';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { SparkLine } from '@/components/charts/SparkLine';
import { cn } from '@/lib/utils';

export interface StatCardProps {
  label: string;
  value: number;
  delta: number;
  trend: number[];
  color?: string;
  /** Delay for staggered entrance. */
  delay?: number;
  formatter?: (n: number) => string;
}

export const StatCard: React.FC<StatCardProps> = ({
  label, value, delta, trend, color = 'rgb(var(--accent))', delay = 0, formatter = (n) => String(n),
}) => {
  const reduce = useReducedMotion();
  const spring = useSpring(reduce ? value : 0, { stiffness: 80, damping: 18 });
  const display = useTransform(spring, (v) => formatter(Math.round(v)));
  React.useEffect(() => {
    if (reduce) return;
    const to = setTimeout(() => spring.set(value), delay * 1000 + 120);
    return () => clearTimeout(to);
  }, [value, spring, delay, reduce]);

  const trendTone = delta > 0 ? 'success' : delta < 0 ? 'danger' : 'warning';
  const Icon = delta > 0 ? ArrowUpRight : delta < 0 ? ArrowDownRight : Minus;
  const toneCls = trendTone === 'success' ? 'text-success-500' : trendTone === 'danger' ? 'text-danger-500' : 'text-warning-500';

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay, ease: [0.25, 0.8, 0.25, 1] }}
    >
      <Card className="h-full">
        <div className="text-[10.5px] uppercase tracking-[0.06em] text-text-muted font-semibold">{label}</div>
        <div className="flex items-baseline gap-3 mt-2">
          <motion.div className="mono text-3xl font-bold tabular-nums">{reduce ? formatter(value) : display}</motion.div>
          <div className={cn('flex items-center gap-0.5 text-xs font-medium', toneCls)}>
            <Icon className="w-3 h-3" />
            {delta > 0 ? '+' : ''}{delta}
          </div>
        </div>
        <SparkLine data={trend} color={color} area className="mt-3" height={36} />
      </Card>
    </motion.div>
  );
};
