import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium',
  {
    variants: {
      variant: {
        default: 'bg-bg-elev-2 text-text-muted',
        success: 'bg-success-500/15 text-success-500',
        warning: 'bg-warning-500/15 text-warning-500',
        danger: 'bg-danger-500/15 text-danger-500',
        info: 'bg-info-500/15 text-info-500',
        accent: 'bg-accent/15 text-accent',
        tier1: 'bg-brand-300/15 text-brand-300',
        tier2: 'bg-info-500/15 text-info-500',
        tier3: 'bg-warning-500/15 text-warning-500',
      },
      dot: { true: "before:content-[''] before:w-1.5 before:h-1.5 before:rounded-full before:bg-current", false: '' },
    },
    defaultVariants: { variant: 'default', dot: false },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export const Badge: React.FC<BadgeProps> = ({ className, variant, dot, ...props }) => (
  <span className={cn(badgeVariants({ variant, dot }), className)} {...props} />
);
