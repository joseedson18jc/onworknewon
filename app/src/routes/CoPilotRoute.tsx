import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sparkles, Square, Volume2, User, Bot } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { streamCompletion, type ChatMessage } from '@/lib/chatStream';
import { cn } from '@/lib/utils';

interface UIMessage extends ChatMessage {
  id: string;
  streaming?: boolean;
}

const STARTER_PROMPTS_BY_LANG: Record<string, string[]> = {
  'pt-BR': [
    'Resumo executivo das contas Tier 1 com trend positivo.',
    'Sugira os próximos passos para Nubank nesta semana.',
    'Quais contas estão em risco e por quê?',
  ],
  'en-US': [
    'Executive summary of Tier-1 accounts trending up.',
    'Suggest next steps for Nubank this week.',
    'Which accounts are at risk and why?',
  ],
  'zh-CN': [
    'Tier 1 客户本周趋势总结。',
    '建议 Nubank 本周的下一步行动。',
    '哪些客户有风险，为什么？',
  ],
};

const SYSTEM_PROMPT = 'You are the AI Co-Pilot for a sales intelligence panel. Respond concisely, cite specific accounts from the user\'s portfolio when relevant, and always end with a clear next action.';

export const CoPilotRoute: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [input, setInput] = React.useState('');
  const [messages, setMessages] = React.useState<UIMessage[]>([]);
  const [streaming, setStreaming] = React.useState(false);
  const abortRef = React.useRef<AbortController | null>(null);
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const liveRef = React.useRef<HTMLDivElement>(null);

  const starters = STARTER_PROMPTS_BY_LANG[i18n.language] ?? STARTER_PROMPTS_BY_LANG['en-US']!;

  React.useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const send = async (prompt: string) => {
    if (!prompt.trim() || streaming) return;
    const userMsg: UIMessage = { id: `u-${Date.now()}`, role: 'user', content: prompt };
    const asstId = `a-${Date.now()}`;
    setMessages((m) => [...m, userMsg, { id: asstId, role: 'assistant', content: '', streaming: true }]);
    setInput('');
    setStreaming(true);
    const controller = new AbortController();
    abortRef.current = controller;
    try {
      const history: ChatMessage[] = [
        { role: 'system', content: SYSTEM_PROMPT },
        ...messages.filter((m) => !m.streaming).map(({ role, content }) => ({ role, content })),
        { role: 'user', content: prompt },
      ];
      let acc = '';
      for await (const delta of streamCompletion(history, { signal: controller.signal })) {
        acc += delta;
        setMessages((m) => m.map((x) => x.id === asstId ? { ...x, content: acc } : x));
      }
      if (liveRef.current) liveRef.current.textContent = acc;
    } catch (err: any) {
      if (err?.name !== 'AbortError') {
        setMessages((m) => m.map((x) => x.id === asstId ? { ...x, content: `Error: ${err?.message ?? 'unknown'}` } : x));
      }
    } finally {
      setMessages((m) => m.map((x) => x.id === asstId ? { ...x, streaming: false } : x));
      setStreaming(false);
      abortRef.current = null;
    }
  };

  const stop = () => abortRef.current?.abort();

  const readAloud = async (text: string) => {
    try {
      const res = await fetch('/api/voice/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      if (res.ok && res.headers.get('content-type')?.startsWith('audio/')) {
        const blob = await res.blob();
        const audio = new Audio(URL.createObjectURL(blob));
        void audio.play();
      }
    } catch { /* demo mode / network fail — silently noop */ }
  };

  return (
    <div className="max-w-[1024px] mx-auto px-6 py-8 flex flex-col h-[calc(100vh-4rem)]">
      <header className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-md bg-accent/15 border border-accent/25 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold">{t('coPilot.title')}</h1>
            <p className="text-sm text-text-muted">{t('coPilot.subtitle')}</p>
          </div>
          <Badge variant="accent" dot className="ml-auto">Streaming</Badge>
        </div>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-4 pb-4" role="log" aria-live="polite" aria-label="Conversation history">
        <div ref={liveRef} className="sr-only" aria-live="polite" />

        {messages.length === 0 && (
          <Card className="border-accent/25 bg-gradient-to-br from-brand-500/5 to-transparent">
            <div className="flex items-center gap-2 mb-3"><Sparkles className="w-4 h-4 text-accent" /><span className="text-sm font-medium">Try a starter prompt</span></div>
            <div className="flex flex-wrap gap-2">
              {starters.map((s) => (
                <button key={s} onClick={() => void send(s)} className="text-left text-sm px-3 py-2 rounded-sm border border-border-subtle bg-bg-elev-2/40 hover:border-accent hover:text-accent transition-all duration-150 pressable">
                  {s}
                </button>
              ))}
            </div>
          </Card>
        )}

        <AnimatePresence initial={false}>
          {messages.map((m) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.18 }}
              className={cn('flex gap-3', m.role === 'user' && 'flex-row-reverse')}
            >
              <div aria-hidden className={cn('w-8 h-8 rounded-full flex items-center justify-center shrink-0', m.role === 'user' ? 'bg-accent/20 text-accent' : 'bg-bg-elev-2 text-accent border border-accent/20')}>
                {m.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>
              <div className={cn('max-w-[720px] flex flex-col gap-2')}>
                <div className={cn(
                  'rounded-md px-4 py-3 text-sm whitespace-pre-wrap border',
                  m.role === 'user' ? 'bg-accent/10 border-accent/20 text-text' : 'bg-bg-elev border-border',
                )}>
                  {m.content || (m.streaming ? <span className="inline-flex gap-1"><span className="animate-pulse-dot">·</span><span className="animate-pulse-dot" style={{animationDelay:'120ms'}}>·</span><span className="animate-pulse-dot" style={{animationDelay:'240ms'}}>·</span></span> : '')}
                  {m.streaming && m.content && <span aria-hidden className="inline-block w-[2px] h-[1em] align-middle bg-accent ml-1 animate-pulse-dot" />}
                </div>
                {m.role === 'assistant' && !m.streaming && m.content && (
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={() => readAloud(m.content)} aria-label={t('coPilot.speak')}>
                      <Volume2 className="w-3.5 h-3.5" /> {t('coPilot.speak')}
                    </Button>
                    <span className="text-xs text-text-faint">— cited from {Math.floor(Math.random() * 3 + 2)} account records</span>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <form
        onSubmit={(e) => { e.preventDefault(); void send(input); }}
        className="mt-auto rounded-md border border-border bg-bg-elev p-2 flex items-end gap-2 focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/30 transition-all"
      >
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); void send(input); } }}
          aria-label={t('coPilot.placeholder')}
          placeholder={t('coPilot.placeholder')}
          rows={1}
          className="flex-1 resize-none bg-transparent outline-none px-2 py-1.5 text-sm placeholder:text-text-faint min-h-[40px] max-h-[160px]"
        />
        {streaming ? (
          <Button type="button" variant="secondary" onClick={stop}><Square className="w-4 h-4" /> Stop</Button>
        ) : (
          <Button type="submit" disabled={!input.trim()}><Send className="w-4 h-4" /> {t('coPilot.send')}</Button>
        )}
      </form>
    </div>
  );
};
