import { motion } from 'framer-motion';
import { Shield, Check, X, Clock, Building2, TrendingUp, AlertCircle } from 'lucide-react';
import { formatINR } from '@/utils/format';

// Map verification level to display info
const VERIFICATION_LEVELS: Record<number, { label: string; icon: string; color: string }> = {
  0: { label: 'Auto Execute', icon: '⚡', color: 'text-success' },
  1: { label: 'OTP Required', icon: '🔑', color: 'text-warning' },
  2: { label: 'Phone Notification', icon: '📞', color: 'text-gold' },
  3: { label: 'Manual Review', icon: '🔍', color: 'text-error' },
};

// Map trust requirement to display
const TRUST_META: Record<string, { label: string; color: string }> = {
  low: { label: 'Low', color: 'text-success' },
  medium: { label: 'Medium', color: 'text-warning' },
  high: { label: 'High', color: 'text-error' },
};

export interface MissionPassportProps {
  category: string;
  policy: {
    name: string;
    icon: string;
    defaultBudget: number;
    dailyCeiling: number;
    allowedVendors: string[];
    verificationThresholds: {
      otp: number;
      phone: number;
      manual: number;
    };
    timelockSeconds: number;
    expiryHours: number;
    trustRequirement: 'low' | 'medium' | 'high';
    maxConsecutiveFailures: number;
    fallback: 'manual_review' | 'reject';
  };
  currentAmount: number;
  currentRiskScore?: number;
}

export function MissionPassport({ category, policy, currentAmount, currentRiskScore = 0 }: MissionPassportProps) {
  // Determine verification level based on current amount
  const getVerificationLevel = (): { level: number; reason: string } => {
    const { otp, phone, manual } = policy.verificationThresholds;
    if (currentAmount >= manual) return { level: 3, reason: `Exceeds ₹${formatINR(manual)} threshold` };
    if (currentAmount >= phone) return { level: 2, reason: `Exceeds ₹${formatINR(phone)} threshold` };
    if (currentAmount >= otp) return { level: 1, reason: `Exceeds ₹${formatINR(otp)} threshold` };
    return { level: 0, reason: 'Within auto-execute limits' };
  };

  const { level, reason } = getVerificationLevel();
  const verifInfo = VERIFICATION_LEVELS[level] || VERIFICATION_LEVELS[0];
  const trustInfo = TRUST_META[policy.trustRequirement] || TRUST_META.low;

  const budgetPct = Math.min((currentAmount / policy.defaultBudget) * 100, 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="mt-4 rounded-xl border border-gold/20 bg-gradient-to-br from-gold/5 to-transparent p-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-gold" strokeWidth={2} />
          <span className="text-[11px] font-semibold uppercase tracking-wider text-gold/80">Mission Passport</span>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-ink-faint">
          <span>Policy:</span>
          <span className="font-mono text-gold/70">{policy.name}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* Left column: Policy details */}
        <div className="space-y-2">
          {/* Category */}
          <div className="flex items-center gap-1.5 text-[12px] text-ink-dim">
            <span>{policy.icon}</span>
            <span>Category: <span className="font-semibold text-white">{category}</span></span>
          </div>

          {/* Budget bar */}
          <div>
            <div className="flex justify-between text-[11px]">
              <span className="text-ink-faint">Budget</span>
              <span className="text-white font-medium">{formatINR(currentAmount)} / {formatINR(policy.defaultBudget)}</span>
            </div>
            <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/5">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-gold to-soft-gold-text"
                initial={{ width: 0 }}
                animate={{ width: `${budgetPct}%` }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
              />
            </div>
          </div>

          {/* Allowed Vendors */}
          <div>
            <div className="text-[10px] text-ink-faint uppercase tracking-wider">Allowed Vendors</div>
            <div className="mt-1 flex flex-wrap gap-1">
              {policy.allowedVendors.length === 0 ? (
                <span className="text-[11px] text-ink-dim">All vendors allowed</span>
              ) : (
                policy.allowedVendors.map((vendor, i) => (
                  <span
                    key={i}
                    className="rounded-full bg-gold/10 px-2 py-0.5 text-[10px] font-medium text-gold/80"
                  >
                    {vendor}
                  </span>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right column: Verification & Security */}
        <div className="space-y-2">
          {/* Verification Level */}
          <div className="rounded-lg border border-gold/10 bg-bg/40 p-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-ink-faint uppercase tracking-wider">Verification</span>
              <span className={`text-[11px] font-semibold ${verifInfo.color}`}>
                {verifInfo.icon} {verifInfo.label}
              </span>
            </div>
            <div className="mt-0.5 text-[10px] text-ink-faint">{reason}</div>
          </div>

          {/* Risk Score (if provided) */}
          {currentRiskScore > 0 && (
            <div className="rounded-lg border border-gold/10 bg-bg/40 p-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-ink-faint uppercase tracking-wider">Risk Score</span>
                <span className={`text-[11px] font-semibold ${
                  currentRiskScore < 30 ? 'text-success' :
                  currentRiskScore < 60 ? 'text-warning' : 'text-error'
                }`}>
                  {currentRiskScore}%
                </span>
              </div>
              <div className="mt-1 h-1 overflow-hidden rounded-full bg-white/5">
                <motion.div
                  className={`h-full rounded-full ${
                    currentRiskScore < 30 ? 'bg-success' :
                    currentRiskScore < 60 ? 'bg-warning' : 'bg-error'
                  }`}
                  initial={{ width: 0 }}
                  animate={{ width: `${currentRiskScore}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>
          )}

          {/* Metadata row */}
          <div className="flex gap-2 text-[10px] text-ink-faint">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {policy.timelockSeconds}s timelock
            </span>
            <span className="flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              Trust: {trustInfo.label}
            </span>
            <span className={`${trustInfo.color}`}>{trustInfo.label}</span>
          </div>

          {/* Fallback */}
          <div className="flex items-center gap-1 text-[10px] text-ink-faint">
            <AlertCircle className="h-3 w-3" />
            <span>Fallback: <span className="text-gold/70">{policy.fallback.replace('_', ' ')}</span></span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}