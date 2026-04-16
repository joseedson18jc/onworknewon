/** Minimal OpenAI-compatible SSE parser for `/api/ai/completions?stream=true`. */
export interface ChatMessage { role: 'system' | 'user' | 'assistant'; content: string }

export async function* streamCompletion(messages: ChatMessage[], opts: { model?: string; signal?: AbortSignal } = {}): AsyncGenerator<string, void, void> {
  const res = await fetch('/api/ai/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'same-origin',
    signal: opts.signal,
    body: JSON.stringify({ messages, model: opts.model, stream: true }),
  });
  if (!res.ok) {
    let data: any = {};
    try { data = await res.json(); } catch {}
    throw Object.assign(new Error(data?.error || `http_${res.status}`), { status: res.status, data });
  }
  if (!res.body) throw new Error('no_response_body');

  const ct = res.headers.get('content-type') ?? '';
  // Non-stream fallback (e.g. demo mode returns plain JSON)
  if (ct.includes('application/json')) {
    const data = await res.json();
    const text: string = data?.choices?.[0]?.message?.content ?? '';
    // Yield a char-chunked simulated stream so the UI still animates.
    for (let i = 0; i < text.length; i += 12) {
      yield text.slice(i, i + 12);
      await new Promise((r) => setTimeout(r, 18));
    }
    return;
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';
    for (const raw of lines) {
      const line = raw.trim();
      if (!line || !line.startsWith('data:')) continue;
      const payload = line.slice(5).trim();
      if (payload === '[DONE]') return;
      try {
        const json = JSON.parse(payload);
        const delta: string = json?.choices?.[0]?.delta?.content ?? '';
        if (delta) yield delta;
      } catch { /* ignore keepalive/ping lines */ }
    }
  }
}
