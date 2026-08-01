// Add these to EnterpriseProfile in types.ts
export interface EnterpriseProfile {
  owner: string; role: string; enterprise: string; plan: string;
  perMissionCap: number; dailyOutflowCeiling: number; dailySpent: number; highestSpend: number;
}
// Add to AegisState in types.ts
export interface AegisState {
  /* ... existing fields ... */
  successfulMissions: number;
  consecutiveFailures: number;
}