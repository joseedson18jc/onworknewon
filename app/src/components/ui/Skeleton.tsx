import * as React from 'react';
import { cn } from '@/lib/utils';

/** Reserved-space skeleton. Fixes the Phase 1b CLS 0.392 regression by claiming pixels BEFORE data arrives. */
export const Skeleton: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => (
  <div
    aria-hidden="true"
    className={cn('rounded-sm skeleton-shimmer', className)}
    {...props}
  />
);
