import { useReducer, useRef, useCallback, createContext, useContext } from 'react';
import type { AegisState } from '@/types';
import {
  initialState,
  reducer,
  type Dispatch,
  type Action,
  SHIELD_ORDER,
  genMissionId,
} from '@/state';
import { formatINR } from '@/utils/format';

interface Ctx {
  state: AegisState;
  dispatch: Dispatch;
}

const AegisContext = createContext<Ctx | null>(null);

export function AegisProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, initialState);
  return (
    <AegisContext.Provider value={{ state, dispatch }}>
      {children}
    </AegisContext.Provider>
  );
}

export function useAegis(): Ctx {
  const ctx = useContext(AegisContext);
  if (!ctx) throw new Error('useAegis must be used within AegisProvider');
  return ctx;
}

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

export function useOrchestrator() {
  const { state, dispatch } = useAegis();
  const stateRef = useRef(state);
  stateRef.current = state;

  const log = useCallback(
    (message: string, severity: 'info' | 'success' | 'warning' | 'error' | 'gold' = 'info') =>
      dispatch({ type: 'ADD_LOG', message, severity }),
    [dispatch]
  );

  const addChat = useCallback(
    (role: 'user' | 'aegis', text: string) => dispatch({ type: 'ADD_CHAT', role, text }),
    [dispatch]
  );

  const audit = useCallback(
    (entry: { action: string; actor: string; result: 'success' | 'blocked' | 'warning' }) =>
      dispatch({ type: 'ADD_AUDIT', entry }),
    [dispatch]
  );

  const runShields = useCallback(
    async (failAt?: string) => {
      for (const id of SHIELD_ORDER) {
        dispatch({ type: 'SET_SHIELD', shield: id, status: 'processing' });
        log(`${labelFor(id)} scanning…`, 'gold');
        await wait(600);
        if (failAt === id) {
          dispatch({ type: 'SET_SHIELD', shield: id, status: 'failure' });
          log(`${labelFor(id)} FAILED`, 'error');
          return false;
        }
        dispatch({ type: 'SET_SHIELD', shield: id, status: 'success' });
        log(`${labelFor(id)} passed`, 'success');
        await wait(200);
      }
      return true;
    },
    [dispatch, log]
  );

  const resetShields = useCallback(() => {
    dispatch({ type: 'SET_SHIELDS', status: 'idle' });
  }, [dispatch]);

  const createMission = useCallback(
    async (name: string, merchant: string, budget: number) => {
      const mission = {
        id: `m_${Date.now()}`,
        name,
        missionId: genMissionId(),
        merchant,
        budget,
        spent: 0,
        expiry: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        trustScore: 100,
        status: 'created' as const,
        createdAt: Date.now(),
      };
      dispatch({ type: 'CREATE_MISSION', mission });
      dispatch({ type: 'SET_TRUST', value: 100 });
      log(`Mission Created → ${name}`, 'gold');
      log(`Mission Wallet Generated · ${mission.missionId}`, 'gold');
      audit({ action: `Create Mission: ${name}`, actor: 'operator', result: 'success' });
      addChat('aegis', `Mission Wallet provisioned for "${name}". Budget locked at ${formatINR(budget)}. Standing by for execution.`);
    },
    [dispatch, log, audit, addChat]
  );

  const executeMission = useCallback(async () => {
    const m = stateRef.current.mission;
    if (!m) {
      addChat('aegis', 'No active mission wallet. Create a mission first.');
      return;
    }
    dispatch({ type: 'SET_MISSION_STATUS', status: 'validating' });
    log('Executing mission — running security gauntlet…', 'gold');
    resetShields();
    const ok = await runShields();
    if (!ok) {
      dispatch({ type: 'SET_MISSION_STATUS', status: 'failed' });
      dispatch({ type: 'ADJUST_TRUST', delta: -15 });
      log('Mission ABORTED — shield failure', 'error');
      audit({ action: `Execute: ${m.name}`, actor: 'aegis', result: 'blocked' });
      addChat('aegis', 'Execution blocked. A security shield failed during validation. Review the Security Engine and try again.');
      return;
    }
    dispatch({ type: 'SET_MISSION_STATUS', status: 'executing' });
    await wait(600);
    dispatch({ type: 'UPDATE_MISSION', patch: { spent: m.budget, status: 'completed' } });
    log('Transaction confirmed on-chain', 'success');
    log(`Mission Complete · ${m.name}`, 'success');
    audit({ action: `Execute: ${m.name}`, actor: 'aegis', result: 'success' });
    addChat('aegis', `Mission "${m.name}" executed successfully. ${formatINR(m.budget)} settled with ${m.merchant}.`);
  }, [dispatch, log, audit, addChat, resetShields, runShields]);

  const simulatePromptInjection = useCallback(async () => {
    dispatch({ type: 'INC_ATTACK', blocked: true });
    log('ALERT: Prompt injection detected', 'error');
    dispatch({ type: 'SET_SHIELD', shield: 'missionGuard', status: 'processing' });
    await wait(700);
    dispatch({ type: 'SET_SHIELD', shield: 'missionGuard', status: 'failure' });
    await wait(300);
    dispatch({ type: 'SET_SHIELD', shield: 'missionGuard', status: 'success' });
    dispatch({ type: 'ADJUST_TRUST', delta: -3 });
    log('Prompt injection BLOCKED · Mission Guard', 'success');
    audit({ action: 'Prompt injection attempt', actor: 'attacker', result: 'blocked' });
    addChat('aegis', 'A prompt injection was detected and blocked by the Mission Guard. No funds were moved. Trust score reduced by 3.');
  }, [dispatch, log, audit, addChat]);

  const simulateStolenKey = useCallback(async () => {
    dispatch({ type: 'INC_ATTACK', blocked: true });
    log('ALERT: Stolen session key detected', 'error');
    dispatch({ type: 'SET_SHIELD', shield: 'circuitBreaker', status: 'processing' });
    await wait(700);
    dispatch({ type: 'SET_SHIELD', shield: 'circuitBreaker', status: 'failure' });
    await wait(300);
    dispatch({ type: 'SET_SHIELD', shield: 'circuitBreaker', status: 'success' });
    dispatch({ type: 'ADJUST_TRUST', delta: -8 });
    log('Stolen key BLOCKED · Circuit Breaker tripped', 'success');
    audit({ action: 'Stolen key attempt', actor: 'attacker', result: 'blocked' });
    addChat('aegis', 'A stolen session key was used in an attempted transaction. The Circuit Breaker tripped and blocked it.');
  }, [dispatch, log, audit, addChat]);

  const launchSpamAttack = useCallback(async () => {
    dispatch({ type: 'INC_ATTACK', blocked: true });
    log('ALERT: Spam attack — 47 rapid transactions', 'error');
    dispatch({ type: 'SET_SHIELD', shield: 'riskEngine', status: 'processing' });
    await wait(800);
    dispatch({ type: 'SET_SHIELD', shield: 'riskEngine', status: 'failure' });
    await wait(300);
    dispatch({ type: 'SET_SHIELD', shield: 'riskEngine', status: 'success' });
    dispatch({ type: 'ADJUST_TRUST', delta: -5 });
    log('Spam attack BLOCKED · Risk Engine rate-limit', 'success');
    audit({ action: 'Spam attack (47 tx)', actor: 'attacker', result: 'blocked' });
    addChat('aegis', '47 rapid-fire transactions were detected and rate-limited by the Risk Engine. All blocked. No budget consumed.');
  }, [dispatch, log, audit, addChat]);

  const rotateSessionKey = useCallback(async () => {
    log('Session key rotated', 'gold');
    audit({ action: 'Rotate session key', actor: 'operator', result: 'success' });
    addChat('aegis', 'Session key rotated. Previous key invalidated.');
  }, [dispatch, log, audit, addChat]);

  const freezeWallet = useCallback(async () => {
    dispatch({ type: 'SET_WALLET_STATUS', status: 'frozen' });
    dispatch({ type: 'SET_MISSION_STATUS', status: 'frozen' });
    log('Wallet FROZEN — all activity halted', 'warning');
    audit({ action: 'Freeze wallet', actor: 'operator', result: 'warning' });
    addChat('aegis', 'Mission Wallet frozen. No transactions can be initiated until unfrozen.');
  }, [dispatch, log, audit, addChat]);

  const nukeWallet = useCallback(async () => {
    dispatch({ type: 'SET_WALLET_STATUS', status: 'nuked' });
    log('NUKE INITIATED — dissolving wallet…', 'error');
    await wait(1000);
    dispatch({ type: 'CLEAR_MISSION' });
    dispatch({ type: 'SET_SHIELDS', status: 'idle' });
    dispatch({ type: 'SET_TRUST', value: 50 });
    log('Wallet NUKED — all keys destroyed', 'error');
    audit({ action: 'Nuke wallet', actor: 'operator', result: 'warning' });
    addChat('aegis', 'Mission Wallet nuked. All keys destroyed, budget released, wallet dissolved. Trust score reset to 50.');
  }, [dispatch, log, audit, addChat]);

  const cancelPendingTx = useCallback(async () => {
    log('Pending transaction CANCELLED', 'warning');
    audit({ action: 'Cancel pending transaction', actor: 'operator', result: 'warning' });
    addChat('aegis', 'Pending transaction cancelled. Funds returned to mission budget.');
  }, [dispatch, log, audit, addChat]);

  const cancelMission = useCallback(async () => {
    dispatch({ type: 'CLEAR_MISSION' });
    dispatch({ type: 'SET_SHIELDS', status: 'idle' });
    log('Mission CANCELLED', 'warning');
    audit({ action: 'Cancel mission', actor: 'operator', result: 'warning' });
    addChat('aegis', 'Mission cancelled. Wallet dissolved and budget released.');
  }, [dispatch, log, audit, addChat]);

  const resetDemo = useCallback(async () => {
    dispatch({ type: 'RESET' });
  }, [dispatch]);

  return {
    createMission,
    executeMission,
    simulatePromptInjection,
    simulateStolenKey,
    launchSpamAttack,
    rotateSessionKey,
    freezeWallet,
    nukeWallet,
    cancelPendingTx,
    cancelMission,
    resetDemo,
    log,
    addChat,
  };
}

function labelFor(id: string): string {
  const map: Record<string, string> = {
    missionGuard: 'Mission Guard',
    policyEngine: 'Policy Engine',
    riskEngine: 'Risk Engine',
    smartContract: 'Smart Contract',
    timeLock: 'Time Lock',
    circuitBreaker: 'Circuit Breaker',
  };
  return map[id] || id;
}
