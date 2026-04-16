import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Bell, Search, LogOut } from 'lucide-react';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Button } from '@/components/ui/Button';

export interface TopBarProps {
  onSignOut?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ onSignOut }) => {
  const { t } = useTranslation();
  return (
    <header className="glass sticky top-0 z-20 border-b border-border-subtle">
      <div className="mx-auto flex h-16 max-w-[1440px] items-center gap-4 px-6">
        <div className="flex items-center gap-2">
          <span className="font-display text-xl font-bold tracking-tight text-accent">AI Rudder</span>
          <span className="inline-block w-2 h-2 rounded-full bg-brand-300 animate-pulse-dot" aria-hidden />
        </div>
        <div className="relative mx-4 hidden md:flex flex-1 max-w-xl">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="search"
            aria-label={t('common.search')}
            placeholder={t('common.search') + '…'}
            className="w-full h-9 rounded-sm border border-border bg-bg-elev pl-9 pr-12 text-sm placeholder:text-text-faint focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/30"
          />
          <kbd className="absolute right-2 top-1/2 -translate-y-1/2 mono text-[10px] text-text-faint border border-border-subtle rounded-xs px-1.5 py-0.5">⌘K</kbd>
        </div>
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
