import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import type { Account } from '@/data/accounts';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { LogoAvatar } from '@/components/ui/LogoAvatar';
import { AIIntel } from '@/components/dashboard/AIIntel';
import { formatCurrency, cn } from '@/lib/utils';

export interface AccountDrawerProps { account: Account; onClose: () => void }

const tierVariant = (t: 1 | 2 | 3): 'tier1' | 'tier2' | 'tier3' => t === 1 ? 'tier1' : t === 2 ? 'tier2' : 'tier3';

export const AccountDrawer: React.FC<AccountDrawerProps> = ({ account, onClose }) => {
  const { t, i18n } = useTranslation();
  const closeRef = React.useRef<HTMLButtonElement>(null);

  React.useEffect(() => { closeRef.current?.focus(); }, []);
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <>
      <motion.button
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-40 bg-navy-900/60 backdrop-blur-sm"
        aria-label="Close drawer"
      />
      <motion.aside
        initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
        transition={{ duration: 0.25, ease: [0.25, 0.8, 0.25, 1] }}
        role="dialog"
        aria-modal="true"
        aria-labelledby={`drawer-title-${account.id}`}
        className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-[560px] bg-bg-elev border-l border-border shadow-xl overflow-y-auto"
      >
        <div className="sticky top-0 z-10 glass flex items-center justify-between px-6 py-4 border-b border-border-subtle">
          <div className="flex items-center gap-3 min-w-0">
            <LogoAvatar domain={account.domain} letter={account.logo} color={account.color} name={account.name} size={40} />
            <div className="min-w-0">
              <h2 id={`drawer-title-${account.id}`} className="font-display text-lg font-bold truncate">{account.name}</h2>
              <div className="text-xs text-text-muted truncate">{account.domain} · {account.sector}</div>
            </div>
          </div>
          <Button ref={closeRef} variant="icon" size="icon" onClick={onClose} aria-label="Close">
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-3 gap-3">
            <Stat label="Tier" value={<Badge variant={tierVariant(account.tier)}>T{account.tier}</Badge>} />
            <Stat label={t('ranking.column.dealSize')} value={<span className="mono font-semibold">{formatCurrency(account.dealSize, i18n.language)}</span>} />
            <Stat label={t('ranking.column.aiScore')} value={<span className={cn('mono font-bold text-xl', account.aiScore >= 80 ? 'text-success-500' : account.aiScore >= 60 ? 'text-warning-500' : 'text-danger-500')}>{account.aiScore}</span>} />
          </div>

          <AIIntel account={account} />

          <section>
            <h3 className="font-display font-semibold mb-3">{t('decisionMakers.title')}</h3>
            <ul className="space-y-2">
              {account.decisionMakers.map((dm) => (
                <li key={dm.id} className="flex items-center gap-3 text-sm">
                  <span aria-hidden className="w-8 h-8 rounded-full bg-bg-elev-2 flex items-center justify-center text-xs font-semibold">
                    {dm.name.split(' ').map((p) => p[0]).join('').slice(0, 2)}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{dm.name}</div>
                    <div className="text-xs text-text-muted truncate">{dm.title}</div>
                  </div>
                  <Badge
                    variant={dm.stance === 'champion' ? 'success' : dm.stance === 'blocker' ? 'danger' : dm.stance === 'neutral' ? 'warning' : 'default'}
                    dot
                  >
                    {t(`decisionMakers.role.${dm.stance}`)}
                  </Badge>
                  <span className="mono text-xs text-text-faint w-8 text-right">{dm.influence}</span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h3 className="font-display font-semibold mb-3">{t('briefings.title')}</h3>
            <ul className="space-y-3">
              {account.briefings.map((b) => (
                <li key={b.id} className="rounded-sm border border-border-subtle bg-bg-elev-2/50 p-4">
                  <div className="flex items-center gap-2 mb-1.5">
                    <Badge variant={b.priority === 'high' ? 'danger' : b.priority === 'medium' ? 'warning' : 'default'} dot>{b.priority}</Badge>
                    <span className="font-medium text-sm">{b.title}</span>
                  </div>
                  <p className="text-xs text-text-muted mb-2">{b.summary}</p>
                  <div className="text-xs text-accent">→ {b.nextAction}</div>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </motion.aside>
    </>
  );
};

const Stat: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <div className="rounded-sm border border-border-subtle bg-bg-elev-2/40 p-3">
    <div className="text-[10px] uppercase tracking-[0.06em] text-text-muted mb-1">{label}</div>
    <div>{value}</div>
  </div>
);
