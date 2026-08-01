import { AnimatePresence, motion } from 'framer-motion';
import {
  Rocket,
  Shield,
  Fingerprint,
  Building2,
  Clock,
  DollarSign,
  CheckCircle2,
  XCircle,
  Snowflake,
  Eye,
  Play,
  Ban,
  type LucideIcon,
} from 'lucide-react';
import { useAegis, useOrchestrator } from '@/orchestrator';
import { formatINR } from '@/utils/format';

export function MissionWallet({ onViewPolicies }: { onViewPolicies: () => void }) {
  const { state } = useAegis();
  const { executeMission, cancelMission } = useOrchestrator();
  const mission = state.mission;
  const frozen = state.walletStatus === 'frozen';
  const nuked = state.walletStatus === 'nuked';

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-gold/15 px-5 py-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-gold/10 ring-1 ring-gold/30">
            <Fingerprint className="h-4 w-4 text-gold" strokeWidth={2} />
          </div>
          <div>
            <h2 className="text-[13px] font-semibold tracking-wide text-white">
              Mission Wallet
            </h2>
            <p className="text-[10px] text-ink-faint">Sovereign mission passport</p>
          </div>
        </div>
        <StatusBadge status={state.walletStatus} />
      </div>

      <div className="relative flex-1 overflow-hidden p-5">
        {!mission && !nuked && <EmptyState />}

        {nuked && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex h-full flex-col items-center justify-center text-center"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-error/10 ring-1 ring-error/30">
              <XCircle className="h-8 w-8 text-error" strokeWidth={2} />
            </div>
            <p className="mt-4 text-[14px] font-semibold text-white">Wallet Dissolved</p>
            <p className="mt-1 text-[12px] text-ink-faint">All keys destroyed. Issue a new mission to provision a wallet.</p>
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {mission && !nuked && (
            <motion.div
              key={mission.id}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.9, filter: 'blur(8px)' }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className={frozen ? 'pointer-events-none' : ''}
            >
              {frozen && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 z-20 flex items-center justify-center rounded-2xl bg-bg/70 backdrop-blur-md"
                >
                  <div className="flex flex-col items-center gap-2">
                    <Snowflake className="h-10 w-10 text-warning animate-pulse" strokeWidth={1.5} />
                    <span className="text-[13px] font-semibold text-warning">WALLET FROZEN</span>
                  </div>
                </motion.div>
              )}

              {/* Passport Card */}
              <div className="relative overflow-hidden rounded-2xl border border-gold/25 bg-gradient-to-br from-bg-card via-bg-secondary to-bg-card shadow-soft-lg">
                <div className="absolute inset-0 grid-bg opacity-30" />
                <div className="absolute inset-0 radial-gold" />

                {/* Stamp */}
                <AnimatePresence>
                  {mission.status === 'completed' && (
                    <motion.div
                      initial={{ scale: 3, opacity: 0, rotate: -25 }}
                      animate={{ scale: 1, opacity: 1, rotate: -15 }}
                      transition={{ type: 'spring', stiffness: 200, damping: 12 }}
                      className="absolute right-4 top-4 z-10 flex h-20 w-20 items-center justify-center rounded-full border-2 border-success/60"
                    >
                      <div className="flex flex-col items-center">
                        <CheckCircle2 className="h-7 w-7 text-success" strokeWidth={2.5} />
                        <span className="mt-0.5 text-[7px] font-bold tracking-widest text-success">EXECUTED</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="relative z-[1] p-5">
                  <div>
                    <div className="text-[10px] font-medium tracking-[0.15em] text-gold/70">
                      MISSION PASSPORT
                    </div>
                    <h3 className="mt-1 text-[20px] font-bold leading-tight text-white">
                      {mission.name}
                    </h3>
                    <div className="mt-0.5 font-mono text-[11px] text-ink-faint">
                      {mission.missionId}
                    </div>
                  </div>

                  {/* Info grid */}
                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <InfoTile icon={DollarSign} label="Budget" value={formatINR(mission.budget)} />
                    <InfoTile
                      icon={Rocket}
                      label="Remaining"
                      value={formatINR(mission.budget - mission.spent)}
                      accent
                    />
                    <InfoTile icon={Building2} label="Merchant" value={mission.merchant} />
                    <InfoTile
                      icon={Clock}
                      label="Expiry"
                      value={new Date(mission.expiry).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    />
                  </div>

                  {/* Trust meter */}
                  <div className="mt-4">
                    <div className="mb-1.5 flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-[10px] font-medium tracking-wide text-ink-dim">
                        <Shield className="h-3 w-3 text-gold" strokeWidth={2.5} />
                        TRUST METER
                      </span>
                      <span className="text-[12px] font-bold text-white">
                        {mission.trustScore}
                        <span className="text-ink-faint">/100</span>
                      </span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-white/5">
                      <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-gold to-soft-gold-text"
                        initial={{ width: 0 }}
                        animate={{ width: `${mission.trustScore}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="mt-4 grid grid-cols-2 gap-2.5">
                <WalletButton
                  icon={Play}
                  label="Execute Mission"
                  variant="primary"
                  onClick={executeMission}
                  disabled={frozen || mission.status === 'completed' || mission.status === 'failed'}
                />
                <WalletButton
                  icon={Eye}
                  label="View Policies"
                  variant="ghost"
                  onClick={onViewPolicies}
                />
                <WalletButton
                  icon={Ban}
                  label="Cancel Mission"
                  variant="danger"
                  onClick={cancelMission}
                  disabled={frozen}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex h-full flex-col items-center justify-center text-center">
      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        className="flex h-16 w-16 items-center justify-center rounded-2xl border border-gold/20 bg-gold/5"
      >
        <Rocket className="h-7 w-7 text-gold/50" strokeWidth={1.5} />
      </motion.div>
      <p className="mt-5 text-[14px] font-semibold text-white">No Mission Wallet</p>
      <p className="mt-1.5 max-w-[220px] text-[12px] leading-relaxed text-ink-faint">
        Issue a mission instruction in the console to provision a sovereign wallet.
      </p>
    </div>
  );
}

function InfoTile({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="rounded-lg border border-gold/10 bg-bg/40 px-3 py-2.5">
      <div className="flex items-center gap-1.5">
        <Icon className={`h-3 w-3 ${accent ? 'text-success' : 'text-gold/60'}`} strokeWidth={2} />
        <span className="text-[9px] font-medium tracking-wide text-ink-faint">{label}</span>
      </div>
      <div className={`mt-1 text-[13px] font-semibold ${accent ? 'text-success' : 'text-white'}`}>
        {value}
      </div>
    </div>
  );
}

function WalletButton({
  icon: Icon,
  label,
  variant,
  onClick,
  disabled,
}: {
  icon: LucideIcon;
  label: string;
  variant: 'primary' | 'ghost' | 'danger';
  onClick: () => void;
  disabled?: boolean;
}) {
  const styles = {
    primary: 'bg-gold text-bg hover:shadow-gold',
    ghost: 'border border-gold/20 bg-white/[0.03] text-ink-dim hover:border-gold/40 hover:text-white',
    danger: 'border border-error/20 bg-error/5 text-error/80 hover:bg-error/10 hover:text-error',
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-[12px] font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-30 ${styles[variant]}`}
    >
      <Icon className="h-3.5 w-3.5" strokeWidth={2.5} />
      {label}
    </button>
  );
}

function StatusBadge({ status }: { status: 'empty' | 'active' | 'frozen' | 'nuked' }) {
  const config = {
    empty: { label: 'Idle', color: 'text-ink-faint', dot: 'bg-ink-faint' },
    active: { label: 'Active', color: 'text-success', dot: 'bg-success animate-pulse' },
    frozen: { label: 'Frozen', color: 'text-warning', dot: 'bg-warning' },
    nuked: { label: 'Destroyed', color: 'text-error', dot: 'bg-error' },
  };
  const c = config[status];
  return (
    <div className="flex items-center gap-1.5 rounded-full border border-gold/15 bg-bg-card/60 px-2.5 py-1">
      <div className={`h-1.5 w-1.5 rounded-full ${c.dot}`} />
      <span className={`text-[10px] font-medium ${c.color}`}>{c.label}</span>
    </div>
  );
}
