import { useState, useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Send, Mic, Sparkles, type LucideIcon } from 'lucide-react';
import { useAegis, useOrchestrator } from '@/orchestrator';
import { formatINR } from '@/utils/format';
import type { ChatMessage } from '@/types';

const SUGGESTED_PROMPTS = [
  'Buy AWS Server',
  'Renew GitHub Subscription',
  'Book Flight',
  'Provision Database Cluster',
];

const MERCHANT_MAP: Record<string, { merchant: string; budget: number }> = {
  aws: { merchant: 'AWS India', budget: 45000 },
  server: { merchant: 'AWS India', budget: 45000 },
  github: { merchant: 'GitHub', budget: 1800 },
  subscription: { merchant: 'GitHub', budget: 1800 },
  flight: { merchant: 'IndiGo', budget: 22000 },
  book: { merchant: 'IndiGo', budget: 22000 },
  database: { merchant: 'AWS India', budget: 65000 },
  cluster: { merchant: 'AWS India', budget: 65000 },
  stripe: { merchant: 'Stripe India', budget: 12000 },
};

function parsePrompt(text: string): { name: string; merchant: string; budget: number } {
  const lower = text.toLowerCase();
  for (const key of Object.keys(MERCHANT_MAP)) {
    if (lower.includes(key)) {
      return {
        name: text,
        merchant: MERCHANT_MAP[key].merchant,
        budget: MERCHANT_MAP[key].budget,
      };
    }
  }
  return { name: text, merchant: 'Unknown Merchant', budget: 15000 };
}

export function MissionConsole() {
  const { state } = useAegis();
  const { addChat, createMission } = useOrchestrator();
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [state.chat]);

  const handleSend = async (text: string) => {
    if (!text.trim()) return;
    addChat('user', text);
    setInput('');
    const parsed = parsePrompt(text);
    await new Promise((r) => setTimeout(r, 500));
    addChat('aegis', `Acknowledged. Provisioning a Mission Wallet for "${parsed.name}" — merchant: ${parsed.merchant}, budget: ${formatINR(parsed.budget)}.`);
    await new Promise((r) => setTimeout(r, 800));
    await createMission(parsed.name, parsed.merchant, parsed.budget);
  };

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center gap-2.5 border-b border-gold/15 px-5 py-4">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-gold/10 ring-1 ring-gold/30">
          <Sparkles className="h-4 w-4 text-gold" strokeWidth={2} />
        </div>
        <div>
          <h2 className="text-[13px] font-semibold tracking-wide text-white">
            AI Mission Console
          </h2>
          <p className="text-[10px] text-ink-faint">Natural language mission control</p>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
        <AnimatePresence initial={false}>
          {state.chat.map((msg: ChatMessage) => (
            <ChatBubble key={msg.id} message={msg} />
          ))}
        </AnimatePresence>
      </div>

      {/* Suggested prompts */}
      <div className="flex flex-wrap gap-2 px-5 pb-3">
        {SUGGESTED_PROMPTS.map((p) => (
          <button
            key={p}
            onClick={() => handleSend(p)}
            className="rounded-full border border-gold/20 bg-white/[0.03] px-3 py-1.5 text-[11px] font-medium text-ink-dim transition-all hover:border-gold/40 hover:text-white hover:shadow-gold-sm"
          >
            {p}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="px-5 pb-5">
        <div className="group relative flex items-end gap-2 rounded-2xl border border-gold/20 bg-bg-card/60 p-2.5 transition-all focus-within:border-gold/40 focus-within:shadow-gold-sm">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend(input);
              }
            }}
            rows={1}
            placeholder="Issue a mission instruction…"
            className="flex-1 resize-none bg-transparent px-2 py-1.5 text-[13px] text-white placeholder:text-ink-faint focus:outline-none"
            style={{ maxHeight: 100 }}
          />
          <button className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-ink-dim transition-colors hover:bg-white/5 hover:text-white">
            <Mic className="h-4 w-4" strokeWidth={2} />
          </button>
          <button
            onClick={() => handleSend(input)}
            disabled={!input.trim()}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gold text-bg transition-all hover:shadow-gold disabled:opacity-30 disabled:hover:shadow-none"
          >
            <Send className="h-4 w-4" strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </div>
  );
}

function ChatBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user';
  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      <div className={`max-w-[85%] ${isUser ? 'items-end' : 'items-start'}`}>
        {!isUser && (
          <div className="mb-1.5 flex items-center gap-1.5">
            <div className="flex h-4 w-4 items-center justify-center rounded bg-gold/15">
              <Sparkles className="h-2.5 w-2.5 text-gold" strokeWidth={2.5} />
            </div>
            <span className="text-[10px] font-medium tracking-wide text-gold/80">AEGIS</span>
          </div>
        )}
        <div
          className={`rounded-2xl px-4 py-2.5 text-[13px] leading-relaxed ${
            isUser
              ? 'bg-gold text-bg font-medium rounded-br-md'
              : 'bg-white/[0.04] text-ink-dim border border-gold/10 rounded-bl-md'
          }`}
        >
          {message.text}
        </div>
      </div>
    </motion.div>
  );
}
