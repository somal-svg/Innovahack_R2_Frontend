export function useOrchestrator() {
  const { state, dispatch } = useAegis();

  // ============ MISSION OPERATIONS ============

  const createMission = async (userPrompt: string) => {
    try {
      await api.createMission(userPrompt);
    } catch (error: any) {
      console.error('Failed to create mission:', error);
      throw error;
    }
  };

  const executeMission = async () => {
    try {
      await api.executeMission();
    } catch (error: any) {
      console.error('Failed to execute mission:', error);
      throw error;
    }
  };

  const cancelMission = async () => {
    try {
      await api.cancelMission();
    } catch (error: any) {
      console.error('Failed to cancel mission:', error);
      throw error;
    }
  };

  const freezeWallet = async () => {
    try {
      await api.freezeWallet();
    } catch (error: any) {
      console.error('Failed to freeze wallet:', error);
      throw error;
    }
  };

  const nukeWallet = async () => {
    try {
      await api.nukeWallet();
    } catch (error: any) {
      console.error('Failed to nuke wallet:', error);
      throw error;
    }
  };

  const rotateSessionKey = async () => {
    try {
      await api.rotateSessionKey();
    } catch (error: any) {
      console.error('Failed to rotate session key:', error);
      throw error;
    }
  };

  const cancelPendingTx = async () => {
    try {
      await api.cancelPendingTx();
    } catch (error: any) {
      console.error('Failed to cancel pending transaction:', error);
      throw error;
    }
  };

  const togglePolicy = async (policyId: string) => {
    try {
      await api.togglePolicy(policyId);
    } catch (error: any) {
      console.error('Failed to toggle policy:', error);
      throw error;
    }
  };

  const resetDemo = async () => {
    try {
      await api.resetDemo();
    } catch (error: any) {
      console.error('Failed to reset demo:', error);
      throw error;
    }
  };

  // ============ ATTACK OPERATIONS ============

  const simulatePromptInjection = async () => {
    try {
      await api.simulatePromptInjection();
    } catch (error: any) {
      console.error('Failed to simulate prompt injection:', error);
      throw error;
    }
  };

  const simulateStolenKey = async () => {
    try {
      await api.simulateStolenKey();
    } catch (error: any) {
      console.error('Failed to simulate stolen key:', error);
      throw error;
    }
  };

  const launchSpamAttack = async () => {
    try {
      await api.launchSpamAttack();
    } catch (error: any) {
      console.error('Failed to launch spam attack:', error);
      throw error;
    }
  };

  return {
    createMission,
    executeMission,
    cancelMission,
    freezeWallet,
    nukeWallet,
    rotateSessionKey,
    cancelPendingTx,
    togglePolicy,
    resetDemo,
    simulatePromptInjection,
    simulateStolenKey,
    launchSpamAttack,
    state,
    dispatch,
  };
}