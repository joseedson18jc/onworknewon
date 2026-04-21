import * as React from 'react';
import { Command } from 'cmdk';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Users, FileText, Bot, Activity, Compass, Map, Settings,
  Sun, Moon, Languages, LogOut, Search,
} from 'lucide-react';
import { ACCOUNTS } from '@/data/accounts';
import type { RouteKey } from '@/components/layout/Sidebar';
import { cn, normalizeForSearch } from '@/lib/utils';

// Diacritic-insensitive multi-token match ("itau un" → "Itaú Unibanco").
const paletteFilter = (value: string, search: string): number => {
  const needle = normalizeForSearch(search).trim();
  if (!needle) return 1;
  const haystack = normalizeForSearch(value);
  return needle.split(/\s+/).every((tok) => haystack.includes(tok)) ? 1 : 0;
};

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onNavigate: (route: RouteKey, accountId?: string) => void;
  onToggleTheme: () => void;
  onChangeLanguage: (code: string) => void;
  onSignOut: () => void;
}

const ROUTE_ITEMS: Array<{ key: RouteKey; label: string; i18n: string; Icon: typeof LayoutDashboard }> = [
  { key: 'overview',   label: 'Overview',       i18n: 'overview.title',  Icon: LayoutDashboard },
  { key: 'accounts',   label: 'ICP Ranking',    i18n: 'ranking.title',   Icon: Users },
  { key: 'briefings',  label: 'Briefings',      i18n: 'briefings.title', Icon: FileText },
  { key: 'coPilot',    label: 'AI Co-Pilot',    i18n: 'coPilot.title',   Icon: Bot },
  { key: 'cadence',    label: 'Cadence',        i18n: 'cadence.title',   Icon: Activity },
  { key: 'marketMap',  label: 'Decision Map',   i18n: 'nav.decisionMap', Icon: Compass },
  { key: 'goToMarket', label: 'Go-to-Market',   i18n: 'nav.goToMarket',  Icon: Map },
  { key: 'settings',   label: 'Settings',       i18n: 'nav.settings',    Icon: Settings },
];

export const CommandPalette: React.FC<Props> = ({ open, onOpenChange, onNavigate, onToggleTheme, onChangeLanguage, onSignOut }) => {
  const { t, i18n } = useTranslation();

  // Global ⌘K / Ctrl+K
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.key === 'k' || e.key === 'K') && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onOpenChange]);

  return (
    <AnimatePresence>
      {open && (
        <Command.Dialog
          open={open}
          onOpenChange={onOpenChange}
          label="Command palette"
          filter={paletteFilter}
          className="fixed inset-0 z-50 flex items-start justify-center pt-[12vh] px-4"
          contentClassName="w-full max-w-[640px]"
          overlayClassName="fixed inset-0 bg-navy-900/70 backdrop-blur-sm"
        >
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.18, ease: [0.25, 0.8, 0.25, 1] }}
            className="w-full rounded-lg border border-border bg-bg-elev shadow-xl overflow-hidden"
          >
            <div className="flex items-center gap-2 border-b border-border-subtle px-4 py-3">
              <Search className="w-4 h-4 text-text-muted" />
              <Command.Input
                autoFocus
                placeholder={t('common.search') + ' accounts, actions, settings…'}
                className="flex-1 bg-transparent outline-none text-sm placeholder:text-text-faint"
              />
              <kbd className="mono text-[10px] text-text-faint border border-border-subtle rounded-xs px-1.5 py-0.5">esc</kbd>
            </div>
            <Command.List className="max-h-[60vh] overflow-y-auto p-2">
              <Command.Empty className="py-8 text-center text-sm text-text-muted">No results.</Command.Empty>

              <Command.Group heading="Navigate" className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-[0.06em] [&_[cmdk-group-heading]]:text-text-faint">
                {ROUTE_ITEMS.map(({ key, i18n: k, Icon }) => (
                  <Command.Item
                    key={key}
                    value={`nav ${t(k)} ${key}`}
                    onSelect={() => { onNavigate(key); onOpenChange(false); }}
                    className={cn(
                      'flex items-center gap-3 rounded-sm px-2 py-2 text-sm text-text cursor-pointer',
                      "data-[selected=true]:bg-accent/10 data-[selected=true]:text-accent",
                    )}
                  >
                    <Icon className="w-4 h-4 text-text-muted" /> {t(k)}
                  </Command.Item>
                ))}
              </Command.Group>

              <Command.Group heading="Accounts" className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-[0.06em] [&_[cmdk-group-heading]]:text-text-faint">
                {ACCOUNTS.map((a) => (
                  <Command.Item
                    key={a.id}
                    value={`account ${a.name} ${a.sector} ${a.status} tier${a.tier} ${a.domain}`}
                    onSelect={() => { onNavigate('accounts', a.id); onOpenChange(false); }}
                    className="flex items-center gap-3 rounded-sm px-2 py-2 text-sm cursor-pointer data-[selected=true]:bg-accent/10 data-[selected=true]:text-accent"
                  >
                    <span aria-hidden className="w-6 h-6 rounded-xs flex items-center justify-center text-[11px] font-semibold text-white shrink-0" style={{ background: a.color }}>{a.logo}</span>
                    <span className="flex-1 truncate">{a.name}</span>
                    <span className="mono text-xs text-text-faint">T{a.tier}</span>
                  </Command.Item>
                ))}
              </Command.Group>

              <Command.Group heading="Actions" className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-[0.06em] [&_[cmdk-group-heading]]:text-text-faint">
                <Command.Item value="toggle theme light dark" onSelect={() => { onToggleTheme(); onOpenChange(false); }} className="flex items-center gap-3 rounded-sm px-2 py-2 text-sm cursor-pointer data-[selected=true]:bg-accent/10 data-[selected=true]:text-accent">
                  {document.documentElement.getAttribute('data-theme') === 'dark'
                    ? <><Sun className="w-4 h-4" /> Switch to light mode</>
                    : <><Moon className="w-4 h-4" /> Switch to dark mode</>}
                </Command.Item>
                {(['pt-BR','en-US','zh-CN'] as const).filter((c) => !i18n.language.startsWith(c.split('-')[0]!)).map((c) => (
                  <Command.Item key={c} value={`language ${c}`} onSelect={() => { onChangeLanguage(c); onOpenChange(false); }} className="flex items-center gap-3 rounded-sm px-2 py-2 text-sm cursor-pointer data-[selected=true]:bg-accent/10 data-[selected=true]:text-accent">
                    <Languages className="w-4 h-4" /> {t(`language.${c}`, c)}
                  </Command.Item>
                ))}
                <Command.Item value="sign out logout" onSelect={() => { onSignOut(); onOpenChange(false); }} className="flex items-center gap-3 rounded-sm px-2 py-2 text-sm text-danger-500 cursor-pointer data-[selected=true]:bg-danger-500/10">
                  <LogOut className="w-4 h-4" /> {t('auth.signOut')}
                </Command.Item>
              </Command.Group>
            </Command.List>
          </motion.div>
        </Command.Dialog>
      )}
    </AnimatePresence>
  );
};
