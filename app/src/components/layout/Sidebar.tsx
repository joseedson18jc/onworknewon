import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { LayoutDashboard, Users, FileText, Bot, Activity, Compass, Map, Settings, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export type RouteKey =
  | 'overview' | 'accounts' | 'briefings' | 'coPilot' | 'cadence' | 'marketMap' | 'goToMarket' | 'settings';

export interface SidebarProps {
  active: RouteKey;
  onNavigate: (k: RouteKey) => void;
}

const NAV: { key: RouteKey; i18n: string; Icon: LucideIcon }[] = [
  { key: 'overview',   i18n: 'overview.title',  Icon: LayoutDashboard },
  { key: 'accounts',   i18n: 'ranking.title',   Icon: Users },
  { key: 'briefings',  i18n: 'briefings.title', Icon: FileText },
  { key: 'coPilot',    i18n: 'coPilot.title',   Icon: Bot },
  { key: 'cadence',    i18n: 'cadence.title',   Icon: Activity },
  { key: 'marketMap',  i18n: 'nav.decisionMap', Icon: Compass },
  { key: 'goToMarket', i18n: 'nav.goToMarket',  Icon: Map },
  { key: 'settings',   i18n: 'nav.settings',    Icon: Settings },
];

export const Sidebar: React.FC<SidebarProps> = ({ active, onNavigate }) => {
  const { t } = useTranslation();
  return (
    <aside
      aria-label="Primary navigation"
      className="hidden md:flex flex-col w-56 shrink-0 border-r border-border-subtle bg-bg-elev-2/60 backdrop-blur-sm"
    >
      <nav className="flex flex-col gap-0.5 p-3 sticky top-16">
        {NAV.map(({ key, i18n, Icon }) => {
          const is = active === key;
          return (
            <button
              key={key}
              onClick={() => onNavigate(key)}
              aria-current={is ? 'page' : undefined}
              className={cn(
                'group flex items-center gap-3 rounded-sm px-3 py-2 text-sm transition-all duration-150 pressable',
                is
                  ? 'bg-accent/10 text-accent shadow-inset border border-accent/25'
                  : 'text-text-muted hover:text-text hover:bg-bg-elev',
              )}
            >
              <Icon className={cn('w-4 h-4 transition-transform duration-200', is && 'scale-110')} />
              <span className="truncate">{t(i18n)}</span>
            </button>
          );
        })}
      </nav>
      <div className="mt-auto p-3 text-[10px] text-text-faint mono">
        v2.0 · design system v1
      </div>
    </aside>
  );
};
