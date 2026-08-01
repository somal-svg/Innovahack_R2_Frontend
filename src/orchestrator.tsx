

import { useReducer, useEffect, createContext, useContext } from 'react';
import { AegisState } from '@/types';
import { initialState, reducer, type Dispatch, type Action } from '@/state';
import * as api from '@/services/api';
import { initializeSocket, disconnectSocket } from '@/services/socket';

interface Ctx {
  state: AegisState;
  dispatch: Dispatch;
}

const AegisContext = createContext<Ctx | null>(null);

export function AegisProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, initialState);

  useEffect(() => {
    // Initialize socket connection
    const socket = initializeSocket(dispatch);
    
    return () => {
      disconnectSocket();
    };
  }, [dispatch]);

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

// ============ ORCHESTRATOR HOOK ============

export function useOrchestrator() {
  const { state, dispatch } = useAegis();

  // ============ MISSION OPERATIONS ============

  const createMission = async (name: string, merchant: string, budget: number, userPrompt?: string) => {
  try {
    await api.createMission(name, merchant, budget, userPrompt);
  } catch (error: any) {
    console.error('Failed to create mission:', error);
    throw error;
   }
 };

  const executeMission = async () => {
    try {
      await api.executeMission();
      // The socket will update the state via 'shield_update' and 'mission_update' events
    } catch (error: any) {
      console.error('Failed to execute mission:', error);
      throw error;
    }
  };

  const cancelMission = async () => {
    try {
      await api.cancelMission();
      // The socket will update the state via 'mission_update' event
    } catch (error: any) {
      console.error('Failed to cancel mission:', error);
      throw error;
    }
  };

  const freezeWallet = async () => {
    try {
      await api.freezeWallet();
      // The socket will update the state via 'wallet_status' event
    } catch (error: any) {
      console.error('Failed to freeze wallet:', error);
      throw error;
    }
  };

  const nukeWallet = async () => {
    try {
      await api.nukeWallet();
      // The socket will update the state via 'wallet_status' and 'mission_update' events
    } catch (error: any) {
      console.error('Failed to nuke wallet:', error);
      throw error;
    }
  };

  const rotateSessionKey = async () => {
    try {
      await api.rotateSessionKey();
      // The socket will update the state via 'mission_update' event
    } catch (error: any) {
      console.error('Failed to rotate session key:', error);
      throw error;
    }
  };

  const cancelPendingTx = async () => {
    try {
      await api.cancelPendingTx();
      // The socket will update the state via 'log' event
    } catch (error: any) {
      console.error('Failed to cancel pending transaction:', error);
      throw error;
    }
  };

  const togglePolicy = async (policyId: string) => {
    try {
      await api.togglePolicy(policyId);
      // The socket will update the state via 'policy_update' event
    } catch (error: any) {
      console.error('Failed to toggle policy:', error);
      throw error;
    }
  };

  const resetDemo = async () => {
    try {
      await api.resetDemo();
      // The socket will update the state via 'state_reset' event
    } catch (error: any) {
      console.error('Failed to reset demo:', error);
      throw error;
    }
  };

  // ============ ATTACK OPERATIONS ============

  const simulatePromptInjection = async () => {
    try {
      await api.simulatePromptInjection();
      // The socket will update the state via 'shield_update', 'log', 'audit', and 'chat' events
    } catch (error: any) {
      console.error('Failed to simulate prompt injection:', error);
      throw error;
    }
  };

  const simulateStolenKey = async () => {
    try {
      await api.simulateStolenKey();
      // The socket will update the state via 'shield_update', 'log', 'audit', and 'chat' events
    } catch (error: any) {
      console.error('Failed to simulate stolen key:', error);
      throw error;
    }
  };

  const launchSpamAttack = async () => {
    try {
      await api.launchSpamAttack();
      // The socket will update the state via 'shield_update', 'log', 'audit', and 'chat' events
    } catch (error: any) {
      console.error('Failed to launch spam attack:', error);
      throw error;
    }
  };

  return {
    // Mission operations
    createMission,
    executeMission,
    cancelMission,
    freezeWallet,
    nukeWallet,
    rotateSessionKey,
    cancelPendingTx,
    togglePolicy,
    resetDemo,
    // Attack operations
    simulatePromptInjection,
    simulateStolenKey,
    launchSpamAttack,
    // State
    state,
    dispatch,
  };
}