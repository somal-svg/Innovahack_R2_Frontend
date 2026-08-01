import type {
  AegisState,
  ShieldId,
  ShieldState,
  Policy,
  AuditEntry,
  TerminalLog,
  LogSeverity,
  Mission,
  MissionStatus,
  BankAccount,
  EnterpriseProfile,
} from '@/types';

let idCounter = 0;
export const uid = (prefix = 'id') => `${prefix}_${Date.now()}_${idCounter++}`;

export const SHIELD_ORDER: ShieldId[] = [
  'missionGuard',
  'policyEngine',
  'riskEngine',
  'smartContract',
  'timeLock',
  'circuitBreaker',
];

export const SHIELD_META: Record<
  ShieldId,
  { label: string; description: string }
> = {
  missionGuard: {
    label: 'Mission Guard',
    description: 'Validates mission intent against authorized scope.',
  },
  policyEngine: {
    label: 'Policy Engine',
    description: 'Enforces spending limits, merchant allowlists & rules.',
  },
  riskEngine: {
    label: 'Risk Engine',
    description: 'Scores transaction risk using behavioral models.',
  },
  smartContract: {
    label: 'Smart Contract',
    description: 'On-chain escrow enforcing budget & expiry constraints.',
  },
  timeLock: {
    label: 'Time Lock',
    description: 'Delay window before any irreversible action executes.',
  },
  circuitBreaker: {
    label: 'Circuit Breaker',
    description: 'Halts all activity when anomaly threshold is breached.',
  },
};

export const DEFAULT_POLICIES: Policy[] = [
  {
    id: 'p1',
    name: 'Max Spend Per Mission',
    description: 'No single mission may spend more than ₹5,00,000.',
    enabled: true,
    rule: 'mission.budget <= 500000',
  },
  {
    id: 'p2',
    name: 'Merchant Allowlist',
    description: 'Only approved merchants may receive funds.',
    enabled: true,
    rule: 'merchant IN (AWS India, GitHub, Stripe India, IndiGo)',
  },
  {
    id: 'p3',
    name: 'Session Expiry',
    description: 'Mission wallets expire after 24 hours.',
    enabled: true,
    rule: 'now < mission.expiry',
  },
  {
    id: 'p4',
    name: 'Prompt Injection Defense',
    description: 'Blocks instructions that attempt to override policy.',
    enabled: true,
    rule: 'intent.signature == verified',
  },
  {
    id: 'p5',
    name: 'Rate Limit',
    description: 'Maximum 10 transactions per mission per minute.',
    enabled: true,
    rule: 'tx.rate <= 10/min',
  },
];

const DEFAULT_PROFILE: EnterpriseProfile = {
  owner: 'Rajesh Sharma',
  role: 'Chief Financial Officer',
  enterprise: 'Apex Labs India Pvt Ltd',
  plan: 'Enterprise Sovereign',
  perMissionCap: 500000,
  dailyOutflowCeiling: 2000000,
  dailySpent: 480000,
};

const DEFAULT_BANKS: BankAccount[] = [
  {
    id: 'b1',
    bank: 'HDFC Corporate Banking',
    label: 'Operating Account',
    last4: '8842',
    ifsc: 'HDFC0008842',
    balance: 18500000,
    type: 'Corporate Current',
    status: 'connected',
  },
  {
    id: 'b2',
    bank: 'ICICI Commercial Bank',
    label: 'Reserve Treasury',
    last4: '1190',
    ifsc: 'ICIC0001190',
    balance: 32000000,
    type: 'Sweep / Treasury',
    status: 'connected',
  },
];

function makeShields(): Record<ShieldId, ShieldState> {
  const out = {} as Record<ShieldId, ShieldState>;
  for (const id of SHIELD_ORDER) {
    out[id] = {
      id,
      label: SHIELD_META[id].label,
      description: SHIELD_META[id].description,
      status: 'idle',
      lastCheck: '—',
    };
  }
  return out;
}

export function initialState(): AegisState {
  return {
    mission: null,
    shields: makeShields(),
    logs: [],
    chat: [
      {
        id: uid('msg'),
        role: 'aegis',
        text: 'AEGIS online. Issue a mission instruction to provision a Mission Wallet. Try "Buy AWS Server" or "Renew GitHub Subscription".',
        timestamp: Date.now(),
      },
    ],
    audit: [],
    policies: DEFAULT_POLICIES.map((p) => ({ ...p })),
    walletStatus: 'empty',
    trustScore: 98,
    attackCount: 0,
    blockedCount: 0,
    bankAccounts: DEFAULT_BANKS,
    profile: DEFAULT_PROFILE,
    reserveBalance: 50500000,
    allocatedBalance: 0,
  };
}

export type Action =
  | { type: 'RESET' }
  | { type: 'ADD_LOG'; message: string; severity: LogSeverity }
  | { type: 'ADD_CHAT'; role: 'user' | 'aegis'; text: string }
  | { type: 'SET_SHIELD'; shield: ShieldId; status: ShieldState['status'] }
  | { type: 'SET_SHIELDS'; status: ShieldState['status'] }
  | { type: 'CREATE_MISSION'; mission: Mission }
  | { type: 'UPDATE_MISSION'; patch: Partial<Mission> }
  | { type: 'CLEAR_MISSION' }
  | { type: 'SET_WALLET_STATUS'; status: AegisState['walletStatus'] }
  | { type: 'SET_TRUST'; value: number }
  | { type: 'ADJUST_TRUST'; delta: number }
  | { type: 'INC_ATTACK'; blocked: boolean }
  | { type: 'ADD_AUDIT'; entry: Omit<AuditEntry, 'id' | 'timestamp' | 'hash'> }
  | { type: 'TOGGLE_POLICY'; id: string }
  | { type: 'SET_MISSION_STATUS'; status: MissionStatus }
  | { type: 'ALLOCATE_FUNDS'; amount: number }
  | { type: 'RELEASE_FUNDS'; amount: number };

function hash(): string {
  const chars = '0123456789abcdef';
  let s = '0x';
  for (let i = 0; i < 40; i++) s += chars[Math.floor(Math.random() * 16)];
  return s;
}

export function reducer(state: AegisState, action: Action): AegisState {
  switch (action.type) {
    case 'RESET':
      return initialState();

    case 'ADD_LOG': {
      const log: TerminalLog = {
        id: uid('log'),
        message: action.message,
        severity: action.severity,
        timestamp: Date.now(),
      };
      return { ...state, logs: [...state.logs, log].slice(-200) };
    }

    case 'ADD_CHAT': {
      const msg = {
        id: uid('msg'),
        role: action.role,
        text: action.text,
        timestamp: Date.now(),
      };
      return { ...state, chat: [...state.chat, msg] };
    }

    case 'SET_SHIELD':
      return {
        ...state,
        shields: {
          ...state.shields,
          [action.shield]: {
            ...state.shields[action.shield],
            status: action.status,
            lastCheck:
              action.status === 'success' || action.status === 'failure'
                ? new Date().toLocaleTimeString('en-US', { hour12: false })
                : state.shields[action.shield].lastCheck,
          },
        },
      };

    case 'SET_SHIELDS': {
      const shields = { ...state.shields };
      for (const id of SHIELD_ORDER) {
        shields[id] = {
          ...shields[id],
          status: action.status,
          lastCheck:
            action.status === 'success' || action.status === 'failure'
              ? new Date().toLocaleTimeString('en-US', { hour12: false })
              : shields[id].lastCheck,
        };
      }
      return { ...state, shields };
    }

    case 'CREATE_MISSION':
      return {
        ...state,
        mission: action.mission,
        walletStatus: 'active',
        allocatedBalance: state.allocatedBalance + action.mission.budget,
        reserveBalance: Math.max(0, state.reserveBalance - action.mission.budget),
      };

    case 'UPDATE_MISSION':
      return state.mission
        ? { ...state, mission: { ...state.mission, ...action.patch } }
        : state;

    case 'CLEAR_MISSION': {
      const released = state.mission ? state.mission.budget - state.mission.spent : 0;
      return {
        ...state,
        mission: null,
        walletStatus: 'empty',
        allocatedBalance: Math.max(0, state.allocatedBalance - released),
        reserveBalance: state.reserveBalance + released,
      };
    }

    case 'SET_MISSION_STATUS':
      return state.mission
        ? { ...state, mission: { ...state.mission, status: action.status } }
        : state;

    case 'SET_WALLET_STATUS':
      return { ...state, walletStatus: action.status };

    case 'SET_TRUST':
      return { ...state, trustScore: Math.max(0, Math.min(100, action.value)) };

    case 'ADJUST_TRUST':
      return {
        ...state,
        trustScore: Math.max(0, Math.min(100, state.trustScore + action.delta)),
      };

    case 'INC_ATTACK':
      return {
        ...state,
        attackCount: state.attackCount + 1,
        blockedCount: action.blocked
          ? state.blockedCount + 1
          : state.blockedCount,
      };

    case 'ADD_AUDIT': {
      const entry: AuditEntry = {
        ...action.entry,
        id: uid('audit'),
        timestamp: Date.now(),
        hash: hash(),
      };
      return { ...state, audit: [entry, ...state.audit].slice(0, 100) };
    }

    case 'TOGGLE_POLICY':
      return {
        ...state,
        policies: state.policies.map((p) =>
          p.id === action.id ? { ...p, enabled: !p.enabled } : p
        ),
      };

    case 'ALLOCATE_FUNDS':
      return {
        ...state,
        allocatedBalance: state.allocatedBalance + action.amount,
        reserveBalance: Math.max(0, state.reserveBalance - action.amount),
      };

    case 'RELEASE_FUNDS':
      return {
        ...state,
        allocatedBalance: Math.max(0, state.allocatedBalance - action.amount),
        reserveBalance: state.reserveBalance + action.amount,
      };

    default:
      return state;
  }
}

export type Dispatch = React.Dispatch<Action>;

export function genMissionId(): string {
  const chars = '0123456789ABCDEF';
  let s = 'MID-';
  for (let i = 0; i < 8; i++) s += chars[Math.floor(Math.random() * 16)];
  return s;
}
