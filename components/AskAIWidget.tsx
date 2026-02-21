import React, { useEffect, useMemo, useRef, useState } from 'react';

type AskAIDoc = {
  id: string;
  title: string;
  url: string;
  source: 'blog' | 'substack' | 'projects' | 'llms' | 'mlcode' | 'resume';
  text: string;
};

type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  sources?: AskAIDoc[];
};

const INDEX_URL = '/knowledge-base/ask-ai-index.json';
const ASKAI_PROXY_URL = 'https://ask-ai-proxy.sankar1535.workers.dev/';
const HEALTH_URL = `${ASKAI_PROXY_URL}health`;

const tokenize = (input: string): string[] =>
  input
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((x) => x.length > 1);

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const buildLocalAnswer = (query: string, docs: AskAIDoc[]): string => {
  if (!docs.length) return `Not found in this website data for: "${query}"`;
  const lines = docs.slice(0, 3).map((d, idx) => `${idx + 1}. ${d.text.slice(0, 180).trim()}`);
  return `Based on your website content:\n${lines.join('\n')}`;
};

export const AskAIWidget: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [docs, setDocs] = useState<AskAIDoc[]>([]);
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'checking' | 'online' | 'limit_reached' | 'offline'>('checking');
  const [progressText, setProgressText] = useState('');
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        const res = await fetch(INDEX_URL, { cache: 'no-store' });
        if (!res.ok) throw new Error('Index missing');
        const data = await res.json();
        setDocs(data.docs || []);
      } catch {
        setMessages([
          {
            id: 'boot-error',
            role: 'assistant',
            text: 'Ask AI index missing. Run the update workflow once.',
          },
        ]);
      }
    };
    init();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open, progressText]);

  useEffect(() => {
    let alive = true;
    const checkHealth = async () => {
      try {
        setStatus('checking');
        const res = await fetch(HEALTH_URL, { method: 'GET' });
        if (!alive) return;
        if (!res.ok) {
          setStatus('offline');
          return;
        }
        const data = await res.json();
        if (data?.status === 'limit_reached') {
          setStatus('limit_reached');
        } else {
          setStatus('online');
        }
      } catch {
        if (alive) setStatus('offline');
      }
    };

    if (open) checkHealth();
    return () => {
      alive = false;
    };
  }, [open]);

  const searchDocs = useMemo(
    () => (q: string) => {
      const qTokens = tokenize(q);
      if (!qTokens.length) return [];
      const qSet = new Set(qTokens);
      return docs
        .map((doc) => {
          const dTokens = tokenize(`${doc.title} ${doc.text}`);
          const overlap = dTokens.reduce((acc, tokenItem) => acc + (qSet.has(tokenItem) ? 1 : 0), 0);
          const phraseBoost = `${doc.title} ${doc.text}`.toLowerCase().includes(q.toLowerCase()) ? 3 : 0;
          return { doc, score: overlap + phraseBoost };
        })
        .filter((x) => x.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 5)
        .map((x) => x.doc);
    },
    [docs]
  );

  const addMessage = (message: ChatMessage) => {
    setMessages((prev) => [...prev, message]);
  };

  const ask = async () => {
    const trimmed = query.trim();
    if (!trimmed || loading) return;

    addMessage({
      id: `u-${Date.now()}`,
      role: 'user',
      text: trimmed,
    });
    setQuery('');
    setLoading(true);

    let topDocs: AskAIDoc[] = [];
    try {
      setProgressText('Thinking...');
      await sleep(250);
      topDocs = searchDocs(trimmed);
      setProgressText('Getting results...');
      await sleep(250);

      if (!topDocs.length) {
        addMessage({
          id: `a-${Date.now()}`,
          role: 'assistant',
          text: `Not found in this website data for: "${trimmed}"`,
          sources: [],
        });
        return;
      }

      const context = topDocs
        .map((d) => `Title: ${d.title}\nURL: ${d.url}\nSource: ${d.source}\nContent: ${d.text}`)
        .join('\n\n---\n\n');

      const response = await fetch(ASKAI_PROXY_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: trimmed,
          context,
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        let message = `Ask AI failed (${response.status}).`;
        try {
          const parsed = JSON.parse(errText);
          if (parsed?.error) message = String(parsed.error);
        } catch {
          // Keep fallback message
        }
        if (response.status === 429) setStatus('limit_reached');
        addMessage({
          id: `a-${Date.now()}`,
          role: 'assistant',
          text: `${message}\n\n${buildLocalAnswer(trimmed, topDocs)}`,
          sources: topDocs,
        });
        return;
      }

      setStatus('online');
      const data = await response.json();
      const text = data?.choices?.[0]?.message?.content;
      addMessage({
        id: `a-${Date.now()}`,
        role: 'assistant',
        text: typeof text === 'string' && text.trim() ? text.trim() : buildLocalAnswer(trimmed, topDocs),
        sources: topDocs,
      });
    } catch {
      addMessage({
        id: `a-${Date.now()}`,
        role: 'assistant',
        text: `Request failed.\n\n${buildLocalAnswer(trimmed, topDocs)}`,
        sources: topDocs,
      });
    } finally {
      setProgressText('');
      setLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
    setProgressText('');
  };

  return (
    <>
      <button
        onClick={() => setOpen((v) => !v)}
        className="group fixed bottom-5 right-5 z-[70] rounded-full border border-gray-300 dark:border-slate/60 bg-white dark:bg-navy shadow-lg hover:shadow-xl transition-shadow px-4 py-2 flex items-center justify-center"
        aria-label="Toggle Ask AI"
        title="Ask AI"
      >
        <span className="text-sm font-semibold text-gray-900 dark:text-lightest-slate">Ask AI</span>
        <span className="pointer-events-none absolute -top-10 right-0 rounded-md bg-[#081126] px-2 py-1 text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity">
          Ask AI
        </span>
      </button>

      {open ? (
        <button
          aria-label="Close Ask AI"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-[69] bg-black/40 backdrop-blur-[1px]"
        />
      ) : null}

      <section
        className={`fixed z-[70] border border-gray-200 dark:border-slate/60 bg-[#0b1834] text-slate-100 shadow-2xl transition-all duration-300 ease-out
        inset-0 rounded-none sm:inset-auto sm:left-1/2 sm:top-1/2 sm:w-[min(920px,95vw)] sm:h-[80vh] sm:max-h-[760px] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-2xl
        ${open ? 'opacity-100 sm:scale-100 pointer-events-auto' : 'opacity-0 sm:scale-95 pointer-events-none'}`}
      >
        <div className="h-full flex flex-col">
        <header className="h-12 sm:h-14 px-3 sm:px-4 border-b border-slate/60 bg-[#081126] flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <i className="fa-solid fa-angle-double-right text-[#1f8bff]"></i>
            <h3 className="text-lg sm:text-2xl font-semibold truncate text-white">Ask AI</h3>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full border ${
                status === 'online'
                  ? 'border-green-300 text-green-300'
                  : status === 'limit_reached'
                    ? 'border-amber-300 text-amber-300'
                    : status === 'offline'
                      ? 'border-red-300 text-red-300'
                      : 'border-slate text-slate'
              }`}
            >
              {status === 'online'
                ? 'Online'
                : status === 'limit_reached'
                  ? 'Limit reached'
                  : status === 'offline'
                    ? 'Offline'
                    : 'Checking'}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={clearChat}
              className="text-xs text-slate hover:text-white"
              aria-label="Clear chat"
              title="Clear chat"
            >
              <i className="fa-regular fa-trash-can"></i>
            </button>
            <button
              onClick={() => setOpen(false)}
              className="text-xs text-slate hover:text-white"
            >
              Close
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto">
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center p-6 text-slate">
              Ask a question about my experience, projects, blogs, or code.
            </div>
          ) : (
            <div className="space-y-3 p-3">
              {messages.map((m) => (
                <article key={m.id} className="space-y-2">
                  <div className="text-sm font-semibold text-white/95 flex items-center gap-2">
                    <i className={`fa-regular ${m.role === 'user' ? 'fa-message' : 'fa-comment-dots'} text-[#1f8bff]`}></i>
                    {m.role === 'user' ? 'You' : 'Ask AI'}
                  </div>
                  <div className={`rounded-lg p-4 text-base leading-7 whitespace-pre-wrap ${m.role === 'user' ? 'bg-[#1b2846]' : 'bg-[#07152f]'}`}>
                    {m.text}
                  </div>
                  {m.role === 'assistant' && m.sources && m.sources.length > 0 ? (
                    <details className="rounded-lg bg-[#1b2846]">
                      <summary className="cursor-pointer list-none px-4 py-3 text-sm font-semibold flex items-center justify-between">
                        <span>Sources</span>
                        <i className="fa-solid fa-chevron-down text-xs"></i>
                      </summary>
                      <div className="px-4 pb-4 space-y-2">
                        {m.sources.map((doc) => (
                          <a
                            key={`${m.id}-${doc.id}`}
                            href={doc.url}
                            target="_blank"
                            rel="noreferrer"
                            className="block rounded-md bg-[#0f1d3c] px-3 py-2 hover:bg-[#112349]"
                          >
                            <p className="text-sm font-semibold">{doc.title}</p>
                            <p className="text-xs text-slate">{doc.source}</p>
                          </a>
                        ))}
                      </div>
                    </details>
                  ) : null}
                </article>
              ))}
            </div>
          )}

          {loading ? (
            <div className="px-3 pb-3">
              <div className="text-sm font-semibold text-white/95 flex items-center gap-2">
                <i className="fa-regular fa-comment-dots text-[#1f8bff]"></i>
                Ask AI
              </div>
              <div className="mt-2 rounded-lg p-4 bg-[#07152f] text-base leading-7 animate-pulse">
                {progressText || 'Thinking...'}
              </div>
            </div>
          ) : null}
          <div ref={bottomRef} />
        </div>

        <div className="border-t border-slate/60 bg-[#081126] p-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
          <div className="rounded-lg border border-slate/60 bg-[#0b1834] px-2 flex items-end gap-2">
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask a follow-up question..."
              rows={3}
              className="flex-1 resize-none bg-transparent text-sm text-white placeholder:text-slate focus:outline-none py-2 min-h-20 sm:min-h-24 max-h-36 sm:max-h-40 overflow-y-auto"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  ask();
                }
              }}
            />
            <button
              onClick={ask}
              disabled={loading || !query.trim()}
              className="h-9 w-9 rounded-full bg-[#1f3a78] hover:bg-[#2a4d98] disabled:opacity-50 disabled:cursor-not-allowed text-white"
              aria-label="Send"
            >
              <i className="fa-solid fa-paper-plane text-xs"></i>
            </button>
          </div>
        </div>
        </div>
      </section>
    </>
  );
};
