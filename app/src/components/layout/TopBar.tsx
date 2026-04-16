import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Bell, Search, LogOut } from 'lucide-react';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Button } from '@/components/ui/Button';

export interface TopBarProps {
  onSignOut?: () => void;
  onOpenPalette?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ onSignOut, onOpenPalette }) => {
  const { t } = useTranslation();
  return (
    <header className="glass sticky top-0 z-20 border-b border-border-subtle">
      <div className="mx-auto flex h-16 max-w-[1440px] items-center gap-4 px-6">
        <div className="flex items-center gap-2">
          <span className="font-display text-xl font-bold tracking-tight text-accent">AI Rudder</span>
          <span className="inline-block w-2 h-2 rounded-full bg-brand-300 animate-pulse-dot" aria-hidden />
        </div>
        <button
          type="button"
          onClick={onOpenPalette}
          aria-label="Open command palette"
          className="relative mx-4 hidden md:flex flex-1 max-w-xl h-9 rounded-sm border border-border bg-bg-elev pl-9 pr-12 text-sm text-text-faint items-center text-left hover:border-accent/60 hover:text-text transition-colors focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/30"
        >
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <span>{t('common.search')}…</span>
          <kbd className="absolute right-2 top-1/2 -translate-y-1/2 mono text-[10px] text-text-faint border border-border-subtle rounded-xs px-1.5 py-0.5">⌘K</kbd>
        </button>
        <div className="ml-auto flex items-center gap-2">
          <LanguageSwitcher />
          <ThemeToggle />
          <Button variant="icon" size="icon" aria-label="Notifications">
            <Bell className="w-4 h-4" />
          </Button>
          <Button variant="icon" size="icon" onClick={onSignOut} aria-label={t('auth.signOut')}>
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </header>
  );
};
