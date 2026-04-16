import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Search, LogOut } from 'lucide-react';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Button } from '@/components/ui/Button';

export interface TopBarProps {
  onSignOut?: () => void;
  onOpenPalette?: () => void;
  onLogoClick?: () => void;
}

interface Notification { id: string; title: string; detail: string; timeAgo: string; unread: boolean }

const DEMO_NOTIFICATIONS: Notification[] = [
  { id: 'n-1', title: 'Nubank · AI score +10',   detail: 'Three stakeholders engaged this week, including the CRO.', timeAgo: '2h',  unread: true },
  { id: 'n-2', title: 'Casas Bahia at risk',     detail: 'No contact in 18 days. Champion left the company.',        timeAgo: '1d',  unread: true },
  { id: 'n-3', title: 'Itaú briefing scheduled', detail: 'Proposal review on Friday 10:00 with the CFO.',            timeAgo: '2d',  unread: false },
  { id: 'n-4', title: 'New account added',       detail: 'Vivo was added to the Tier 1 portfolio.',                  timeAgo: '3d',  unread: false },
];

export const TopBar: React.FC<TopBarProps> = ({ onSignOut, onOpenPalette, onLogoClick }) => {
  const { t } = useTranslation();
  const [bellOpen, setBellOpen] = React.useState(false);
  const [notifs, setNotifs] = React.useState<Notification[]>(DEMO_NOTIFICATIONS);
  const bellRef = React.useRef<HTMLDivElement>(null);
  const unread = notifs.filter((n) => n.unread).length;

  React.useEffect(() => {
    if (!bellOpen) return;
    const onDoc = (e: MouseEvent) => { if (bellRef.current && !bellRef.current.contains(e.target as Node)) setBellOpen(false); };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setBellOpen(false); };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onDoc); document.removeEventListener('keydown', onKey); };
  }, [bellOpen]);

  const markAllRead = () => setNotifs((ns) => ns.map((n) => ({ ...n, unread: false })));

  return (
    <header className="glass sticky top-0 z-20 border-b border-border-subtle">
      <div className="mx-auto flex h-16 max-w-[1440px] items-center gap-4 px-6">
        <button
          type="button"
          onClick={onLogoClick}
          aria-label={t('nav.panel') + ' · home'}
          className="flex items-center gap-2 rounded-sm pressable hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 px-1 -mx-1"
        >
          <span className="font-display text-xl font-bold tracking-tight text-accent">AI Rudder</span>
          <span className="inline-block w-2 h-2 rounded-full bg-brand-300 animate-pulse-dot" aria-hidden />
        </button>
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
          <div ref={bellRef} className="relative">
            <Button
              variant="icon"
              size="icon"
              aria-label={`Notifications${unread ? `, ${unread} unread` : ''}`}
              aria-haspopup="dialog"
              aria-expanded={bellOpen}
              onClick={() => setBellOpen((v) => !v)}
            >
              <Bell className="w-4 h-4" />
              {unread > 0 && (
                <span aria-hidden className="absolute top-1 right-1 w-2 h-2 rounded-full bg-danger-500 ring-2 ring-bg-elev" />
              )}
            </Button>
            <AnimatePresence>
              {bellOpen && (
                <motion.div
                  role="dialog"
                  aria-label="Notifications"
                  initial={{ opacity: 0, y: -6, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.98 }}
                  transition={{ duration: 0.15, ease: [0.25, 0.8, 0.25, 1] }}
                  className="absolute right-0 mt-2 w-[340px] rounded-md border border-border bg-bg-elev shadow-xl overflow-hidden z-30"
                >
                  <div className="flex items-center justify-between px-4 py-3 border-b border-border-subtle">
                    <span className="text-sm font-semibold">Notifications</span>
                    {unread > 0 && (
                      <button type="button" onClick={markAllRead} className="text-xs text-accent hover:text-accent-hover transition-colors">
                        Mark all read
                      </button>
                    )}
                  </div>
                  <ul className="max-h-[360px] overflow-y-auto" role="list">
                    {notifs.map((n) => (
                      <li
                        key={n.id}
                        className="px-4 py-3 border-b border-border-subtle last:border-0 hover:bg-bg-elev-2/60 transition-colors cursor-pointer"
                      >
                        <div className="flex items-start gap-2">
                          {n.unread && <span aria-hidden className="mt-1.5 w-1.5 h-1.5 rounded-full bg-accent shrink-0" />}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className={`text-sm ${n.unread ? 'font-semibold text-text' : 'text-text-muted'}`}>{n.title}</span>
                              <span className="ml-auto mono text-[10px] text-text-faint">{n.timeAgo}</span>
                            </div>
                            <p className="text-xs text-text-muted mt-0.5">{n.detail}</p>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                  <div className="px-4 py-2.5 text-center border-t border-border-subtle">
                    <button type="button" className="text-xs text-accent hover:text-accent-hover">View all</button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <Button variant="icon" size="icon" onClick={onSignOut} aria-label={t('auth.signOut')}>
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </header>
  );
};
