import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
  leftIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', label, hint, error, leftIcon, id, ...props }, ref) => {
    const inputId = id ?? React.useId();
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-text-muted">
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
              {leftIcon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            type={type}
            aria-invalid={!!error || undefined}
            aria-describedby={hint ? `${inputId}-hint` : error ? `${inputId}-err` : undefined}
            className={cn(
              'w-full rounded-sm border bg-bg px-3.5 py-2.5 text-[15px] text-text placeholder:text-text-faint',
              'transition-colors duration-150 ease-in-out-smooth',
              'focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/30',
              error ? 'border-danger-500' : 'border-border',
              leftIcon && 'pl-10',
              className,
            )}
            {...props}
          />
        </div>
        {hint && !error && (
          <p id={`${inputId}-hint`} className="text-xs text-text-faint">{hint}</p>
        )}
        {error && (
          <p id={`${inputId}-err`} className="text-xs text-danger-500" role="alert">{error}</p>
        )}
      </div>
    );
  },
);
Input.displayName = 'Input';
