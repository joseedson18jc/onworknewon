import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

const LANGS = [
  { code: 'pt-BR', label: 'PT' },
  { code: 'en-US', label: 'EN' },
  { code: 'zh-CN', label: '中文' },
] as const;

export const LanguageSwitcher: React.FC<{ className?: string }> = ({ className }) => {
  const { i18n } = useTranslation();
  const current = i18n.language || 'pt-BR';
  return (
    <div
      role="radiogroup"
      aria-label="Language"
      className={cn('inline-flex rounded-full border border-border bg-bg-elev p-0.5', className)}
    >
      {LANGS.map((l) => {
        const active = current.startsWith(l.code.split('-')[0]);
        return (
          <button
            key={l.code}
            role="radio"
            aria-checked={active}
            aria-label={`Switch to ${l.code}`}
            onClick={() => i18n.changeLanguage(l.code)}
            className={cn(
              'px-3 py-1.5 text-xs font-medium rounded-full transition-all duration-150 pressable',
              active ? 'bg-accent text-navy-900 shadow-sm' : 'text-text-muted hover:text-text',
            )}
          >
            {l.label}
          </button>
        );
      })}
    </div>
  );
};
