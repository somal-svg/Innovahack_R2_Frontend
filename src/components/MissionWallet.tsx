import { useState } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Rocket, XCircle, ShieldAlert, Snowflake, RefreshCw, Copy, Check } from 'lucide-react';
import { useAegis, useOrchestrator } from '@/orchestrator';
import { formatINR } from '@/utils/format';

export function MissionWallet({ onViewPolicies }: { onViewPolicies: () => void }) {
  const { state } = useAegis();
  const { executeMission, cancelMission, cancelPendingTx, unfreezeWallet, rotateSessionKey } = useOrchestrator();
  const [copied, setCopied] = useState(false);

  if (!state.mission || state.walletStatus === 'nuked') {
    return (
      <div className="flex h-full flex-col items-center justify-center p-6 text-center opacity-60">
        <ShieldAlert className="h-12 w-12 text-ink-dim mb-4" strokeWidth={1} />
        <p className="text-[14px] font-medium text-ink-dim">No active mission wallet (Purged / Nuked).</p>
        <p className="text-[11px] text-ink-faint mt-1">Issue a prompt to the AI to provision a new one.</p>
      </div>
    );
  }

  const { mission, timeLockRemaining = 0 } = state;
  const isExecuting = mission.status === 'executing' || timeLockRemaining > 0;
  const isFrozen = state.walletStatus === 'frozen' || mission.status === 'frozen';
  const isFailed = ['failed', 'nuked', 'cancelled'].includes(mission.status);

  const handleCopyKey = () => {
    if (mission.sessionKey) {
      navigator.clipboard.writeText(mission.sessionKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const truncatedKey = mission.sessionKey 
    ? `${mission.sessionKey.slice(0, 6)}...${mission.sessionKey.slice(-4)}` 
    : 'None';

  return (
    <div className="flex h-full flex-col p-6 relative overflow-hidden">
      {/* Prominent Frosted Blur Overlay when Frozen */}
      {isFrozen && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-bg/85 backdrop-blur-md p-6 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-error/10 border border-error/30 text-error mb-3 animate-pulse">
            <Snowflake className="h-7 w-7" />
          </div>
          <h3 className="text-[16px] font-bold text-white uppercase tracking-wider">Wallet Frozen & Isolated</h3>
          <p className="text-[11px] text-ink-dim max-w-sm mt-1 mb-6">
            All transaction pipelines, session keys, and automated processes have been forcefully halted by emergency override.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => void unfreezeWallet()}
              className="flex items-center gap-2 rounded-xl bg-success/20 border border-success/40 text-success px-4 py-2.5 text-[12px] font-bold hover:bg-success/30 transition-all"
            >
              <Snowflake className="h-4 w-4" /> Unfreeze Wallet
            </button>
            <button
              onClick={() => void rotateSessionKey()}
              className="flex items-center gap-2 rounded-xl bg-gold/20 border border-gold/40 text-gold px-4 py-2.5 text-[12px] font-bold hover:bg-gold/30 transition-all"
            >
              <RefreshCw className="h-4 w-4" /> Rotate Key
            </button>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between border-b border-gold/15 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold/10">
            <CreditCard className="h-5 w-5 text-gold" />
          </div>
          <div>
            <h2 className="text-[15px] font-bold text-white">{mission.name}</h2>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[11px] font-mono text-ink-dim">{mission.missionId}</span>
              <span className="text-ink-faint">·</span>
              <button 
                onClick={handleCopyKey}
                className="group flex items-center gap-1 font-mono text-[10px] text-gold/80 hover:text-gold transition-colors"
                title="Copy full session key"
              >
                <span>Key: {truncatedKey}</span>
                {copied ? <Check className="h-3 w-3 text-success" /> : <Copy className="h-3 w-3 opacity-60 group-hover:opacity-100" />}
              </button>
            </div>
          </div>
        </div>
        <StatusBadge status={mission.status} />
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4">
          <Detail label="Merchant Allowlist" value={mission.merchant} />
          <Detail label="Budget Allocated" value={formatINR(mission.budget ?? 0)} highlight />
          <Detail label="Total Spent" value={formatINR(mission.spent ?? 0)} />
          <Detail label="Expires At" value={new Date(mission.expiry).toLocaleString()} />
      </div>

      {timeLockRemaining > 0 && (
          <div className="mt-6 rounded-xl border border-warning/30 bg-warning/5 p-4">
            <div className="flex justify-between text-[12px] font-bold text-warning mb-2">
                <span className="flex items-center gap-1.5">
                  <div className="h-2 w-2 rounded-full bg-warning animate-pulse" /> 1-MINUTE TIME LOCK ACTIVE
                </span>
                <span>{timeLockRemaining}s remaining to abort</span>
            </div>
            <div className="h-2 rounded-full bg-black/50 overflow-hidden">
                <motion.div 
                  className="h-full bg-warning"
                  initial={{ width: '100%' }}
                  animate={{ width: `${(timeLockRemaining / 60) * 100}%` }}
                  transition={{ ease: 'linear' }}
                />
            </div>
          </div>
      )}

      <div className="mt-auto pt-6 flex gap-3">
        {mission.status === 'created' && (
            <>
                <button onClick={() => void executeMission()} className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-gold text-bg py-3 text-[13px] font-bold transition-transform hover:scale-[1.02]">
                    <Rocket className="h-4 w-4" /> Execute Mission
                </button>
                <button onClick={() => void cancelMission()} className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-gold/20 text-white py-3 text-[13px] font-bold hover:bg-white/5 transition-colors">
                    Cancel Mission
                </button>
            </>
        )}
        {isExecuting && (
            <button onClick={() => void cancelPendingTx()} className="w-full flex items-center justify-center gap-2 rounded-xl bg-error/90 text-white py-3 text-[13px] font-bold transition-all hover:bg-error hover:scale-[1.01] hover:shadow-[0_0_24px_rgba(239,68,68,0.25)]">
                <XCircle className="h-4 w-4" /> Abort In-Flight Transaction
            </button>
        )}
        {(isFailed || mission.status === 'completed') && (
            <button disabled className="w-full rounded-xl bg-white/5 text-ink-faint py-3 text-[13px] font-bold cursor-not-allowed">
                Mission Terminated
            </button>
        )}
      </div>

      <div className="absolute top-4 right-4 text-[10px] font-mono text-ink-faint">
        <button onClick={onViewPolicies} className="underline hover:text-gold transition-colors">View Scope Policies</button>
      </div>
    </div>
  );
}

function Detail({ label, value, highlight }: { label: string, value: string, highlight?: boolean }) {
    return (
      <div className={`rounded-xl border ${highlight ? 'border-gold/20 bg-gold/5' : 'border-white/5 bg-black/20'} p-3`}>
          <div className={`text-[10px] uppercase tracking-wider ${highlight ? 'text-gold/80' : 'text-ink-faint'}`}>{label}</div>
          <div className={`mt-1 text-[13px] font-bold ${highlight ? 'text-gold' : 'text-white'}`}>{value}</div>
      </div>
    )
}

function StatusBadge({ status }: { status: string }) {
    // ✅ NEW: Added custom styles for the verification badges
    const config: Record<string, { bg: string, text: string }> = {
      idle: { bg: 'bg-white/5', text: 'text-ink-faint' },
      created: { bg: 'bg-gold/10', text: 'text-gold' },
      awaiting_otp: { bg: 'bg-warning/20 border border-warning/40', text: 'text-warning animate-pulse' },
      awaiting_review: { bg: 'bg-warning/20 border border-warning/40', text: 'text-warning animate-pulse' },
      executing: { bg: 'bg-warning/10', text: 'text-warning' },
      completed: { bg: 'bg-success/10', text: 'text-success' },
      cancelled: { bg: 'bg-white/5', text: 'text-ink-dim' },
      failed: { bg: 'bg-error/10', text: 'text-error' },
      frozen: { bg: 'bg-error/10', text: 'text-error animate-pulse' },
      nuked: { bg: 'bg-error/10 text-error', text: 'text-error' },
    };
    const c = config[status] || config.idle;
    
    return (
      <div className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${c.bg} ${c.text}`}>
          {status.replace('_', ' ')}
      </div>
    );
}