import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Sparkles, AlertCircle, ArrowRight } from 'lucide-react';
import type { Account } from '@/data/accounts';
import { streamCompletion } from '@/lib/chatStream';
import { formatCurrency } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';

interface Props { account: Account }

/**
 * AI Intelligence panel for the account drawer.
 * Tries the /api/ai/completions stream first; if the response is demo-flagged
 * (no OPENAI_API_KEY on the server), we render a locally-computed heuristic
 * brief using the same typing animation so the UX is consistent regardless of
 * provider state.
 */
export const AIIntel: React.FC<Props> = ({ account }) => {
  const { t, i18n } = useTranslation();
  const [text, setText] = React.useState('');
  const [source, setSource] = React.useState<'ai' | 'heuristic' | 'pending'>('pending');
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    setText('');
    setSource('pending');
    setError(null);
    const controller = new AbortController();

    const run = async () => {
      const heuristic = buildHeuristic(account, i18n.language);
      const prompt = buildPrompt(account);
      try {
        let acc = '';
        let isDemo = false;
        for await (const delta of streamCompletion(
          [
            { role: 'system', content: 'You are a concise sales intelligence analyst. Reply in 3 short paragraphs: current state, risk, next action. Never use bullet points.' },
            { role: 'user', content: prompt },
          ],
          { signal: controller.signal },
        )) {
          acc += delta;
          // Detect demo-mode canned response and swap to the richer local heuristic.
          if (!isDemo && acc.includes('[Demo mode]')) {
            isDemo = true;
            setSource('heuristic');
            typeWriter(heuristic, setText, controller.signal);
            return;
          }
          if (!isDemo) {
            setSource('ai');
            setText(acc);
          }
        }
      } catch (err) {
        if ((err as any)?.name !== 'AbortError') {
          setError((err as Error).message);
          setSource('heuristic');
          typeWriter(heuristic, setText, controller.signal);
        }
      }
    };

    void run();
    return () => controller.abort();
  }, [account, i18n.language]);

  return (
    <section aria-labelledby={`intel-${account.id}`} className="rounded-md border border-accent/25 bg-gradient-to-br from-brand-500/8 via-transparent to-info-500/5 p-5">
      <header className="flex items-center gap-2 mb-3">
        <span aria-hidden className="w-7 h-7 rounded-sm bg-accent/15 border border-accent/25 flex items-center justify-center">
          <Sparkles className="w-3.5 h-3.5 text-accent" />
        </span>
        <h3 id={`intel-${account.id}`} className="font-display font-semibold text-sm">{t('portfolio.aiAnalysis')}</h3>
        <Badge variant={source === 'ai' ? 'accent' : 'warning'} dot className="ml-auto text-[10px]">
          {source === 'ai' ? 'Live AI' : source === 'heuristic' ? 'Heuristic' : 'Loading…'}
        </Badge>
      </header>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
        aria-live="polite"
        className="text-[13px] leading-relaxed text-text whitespace-pre-line min-h-[84px]"
      >
        {text || <span className="inline-flex gap-1 text-text-muted">
          <span className="animate-pulse-dot">·</span>
          <span className="animate-pulse-dot" style={{ animationDelay: '120ms' }}>·</span>
          <span className="animate-pulse-dot" style={{ animationDelay: '240ms' }}>·</span>
          <span className="ml-2 text-xs">generating intel for {account.name}…</span>
        </span>}
        {text && source !== 'pending' && <span aria-hidden className="inline-block w-[2px] h-[1em] align-middle bg-accent ml-1 animate-pulse-dot" />}
      </motion.div>

      {error && (
        <div role="alert" className="mt-3 flex items-center gap-2 text-xs text-warning-500">
          <AlertCircle className="w-3 h-3" /> Fell back to heuristic brief — {error}
        </div>
      )}

      <footer className="mt-4 flex flex-wrap gap-2">
        <Badge variant={account.aiScore >= 80 ? 'success' : account.aiScore >= 60 ? 'warning' : 'danger'}>
          AI {account.aiScore}
        </Badge>
        <Badge variant="default" className="mono">{formatCurrency(account.dealSize, i18n.language)}</Badge>
        <Badge variant="info" className="flex items-center gap-1"><ArrowRight className="w-3 h-3" /> {account.briefings[0]?.nextAction ?? 'Follow up'}</Badge>
      </footer>
    </section>
  );
};

// --- helpers ---

function buildPrompt(a: Account): string {
  const champions = a.decisionMakers.filter((d) => d.stance === 'champion').length;
  const blockers  = a.decisionMakers.filter((d) => d.stance === 'blocker').length;
  const trendStr = trendDescriptor(a.trend);
  return (
    `Account: ${a.name} (${a.sector}, Tier ${a.tier}).\n` +
    `Deal size: R$ ${a.dealSize.toLocaleString('pt-BR')}.\n` +
    `Current AI score: ${a.aiScore} (${trendStr} over last 30 days).\n` +
    `Status: ${a.status}.\n` +
    `Decision makers: ${a.decisionMakers.length} total — ${champions} champions, ${blockers} blockers.\n` +
    `Top briefing: ${a.briefings[0]?.title ?? 'n/a'} — ${a.briefings[0]?.summary ?? ''}\n` +
    `Last activity: ${a.lastActivity}.\n\n` +
    `Write a 3-paragraph sales intelligence brief: (1) current state, (2) the single biggest risk, (3) the most leveraged next action for this week.`
  );
}

function trendDescriptor(trend: number[]): string {
  const first = trend[0]!;
  const last = trend.at(-1)!;
  const delta = last - first;
  if (delta > 5)  return `trending up +${delta}`;
  if (delta < -5) return `trending down ${delta}`;
  return 'flat';
}

function daysSince(iso: string): number {
  return Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000));
}

function buildHeuristic(a: Account, lang: string): string {
  const trend = trendDescriptor(a.trend);
  const delta = a.trend.at(-1)! - a.trend[0]!;
  const champions = a.decisionMakers.filter((d) => d.stance === 'champion');
  const blockers  = a.decisionMakers.filter((d) => d.stance === 'blocker');
  const days = daysSince(a.lastActivity);
  const priority = a.briefings[0]?.priority ?? 'low';
  const nextAction = a.briefings[0]?.nextAction ?? 'Schedule a discovery call';
  const currency = formatCurrency(a.dealSize, lang);

  const isPT = lang.startsWith('pt');
  const isZH = lang.startsWith('zh');

  const currentState = isPT
    ? `${a.name} é uma conta Tier ${a.tier} do setor ${a.sector} com ticket de ${currency} e score IA de ${a.aiScore} (${trend}). ${champions.length} defensor${champions.length === 1 ? '' : 'es'} e ${blockers.length} bloqueador${blockers.length === 1 ? '' : 'es'} entre os ${a.decisionMakers.length} decisores mapeados. Última atividade há ${days} dia${days === 1 ? '' : 's'}.`
    : isZH
    ? `${a.name} 是一家 ${a.sector} 行业 Tier ${a.tier} 客户，交易规模 ${currency}，AI 评分 ${a.aiScore}（${delta > 5 ? '上升' : delta < -5 ? '下降' : '持平'}）。已识别决策者 ${a.decisionMakers.length} 人，其中推动者 ${champions.length} 人，阻碍者 ${blockers.length} 人。上次互动 ${days} 天前。`
    : `${a.name} is a Tier-${a.tier} ${a.sector} account with a ${currency} deal size and AI score of ${a.aiScore} (${trend}). ${champions.length} champion${champions.length === 1 ? '' : 's'} and ${blockers.length} blocker${blockers.length === 1 ? '' : 's'} among ${a.decisionMakers.length} mapped stakeholders. Last touch was ${days} day${days === 1 ? '' : 's'} ago.`;

  let riskHeadline: string;
  if (blockers.length > 0)         riskHeadline = isPT ? `${blockers.length} bloqueador${blockers.length === 1 ? '' : 'es'} sênior pode${blockers.length === 1 ? '' : 'm'} travar a decisão.` : isZH ? `${blockers.length} 位高级阻碍者可能拖慢决策进程。` : `${blockers.length} senior blocker${blockers.length === 1 ? '' : 's'} could stall the decision.`;
  else if (delta < -5)             riskHeadline = isPT ? `Score IA caiu ${-delta} pontos — momentum está desacelerando.` : isZH ? `AI 评分下降 ${-delta} 点——势头正在放缓。` : `AI score dropped ${-delta} points — momentum is cooling.`;
  else if (days > 14)              riskHeadline = isPT ? `${days} dias sem contato — a conta está esfriando.` : isZH ? `${days} 天未联系——客户正在降温。` : `${days} days without contact — the account is going cold.`;
  else if (champions.length === 0) riskHeadline = isPT ? 'Nenhum defensor claro ainda — o deal está órfão internamente.' : isZH ? '尚无明确推动者——交易内部缺乏支持。' : 'No clear champion yet — the deal is internally orphaned.';
  else                             riskHeadline = isPT ? `Score já ${a.aiScore} — risco é sobrerepresentar a confiança ao cliente.` : isZH ? `评分已达 ${a.aiScore}——风险是对客户表现出过度自信。` : `Score is already ${a.aiScore} — risk is overstating confidence to the customer.`;

  const actionHeadline = isPT
    ? `Recomendado (prioridade ${priority}): ${nextAction}.`
    : isZH
    ? `建议（优先级${priority === 'high' ? '高' : priority === 'medium' ? '中' : '低'}）：${nextAction}。`
    : `Recommended (${priority} priority): ${nextAction}.`;

  return `${currentState}\n\n${isPT ? 'Risco: ' : isZH ? '风险：' : 'Risk: '}${riskHeadline}\n\n${actionHeadline}`;
}

function typeWriter(text: string, setter: (s: string) => void, signal: AbortSignal) {
  let i = 0;
  const step = () => {
    if (signal.aborted) return;
    i = Math.min(text.length, i + Math.max(1, Math.floor(text.length / 120)));
    setter(text.slice(0, i));
    if (i < text.length) setTimeout(step, 18);
  };
  step();
}
