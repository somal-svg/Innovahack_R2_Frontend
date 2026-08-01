// src/services/api.ts

const API_BASE = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

// Helper function to handle responses
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `HTTP error ${response.status}`);
  }
  return response.json();
}

// ============ MISSION OPERATIONS ============

export async function createMission(name: string, merchant: string, budget: number) {
  const response = await fetch(`${API_BASE}/api/mission/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, merchant, budget }),
  });
  return handleResponse(response);
}

export async function executeMission() {
  const response = await fetch(`${API_BASE}/api/mission/execute`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  });
  return handleResponse(response);
}

export async function cancelMission() {
  const response = await fetch(`${API_BASE}/api/mission/cancel`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  });
  return handleResponse(response);
}

export async function freezeWallet() {
  const response = await fetch(`${API_BASE}/api/mission/freeze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  });
  return handleResponse(response);
}

export async function nukeWallet() {
  const response = await fetch(`${API_BASE}/api/mission/nuke`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  });
  return handleResponse(response);
}

export async function rotateSessionKey() {
  const response = await fetch(`${API_BASE}/api/mission/rotate-key`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  });
  return handleResponse(response);
}

export async function cancelPendingTx() {
  const response = await fetch(`${API_BASE}/api/mission/cancel-pending`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  });
  return handleResponse(response);
}

export async function togglePolicy(policyId: string) {
  const response = await fetch(`${API_BASE}/api/mission/toggle-policy`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ policyId }),
  });
  return handleResponse(response);
}

export async function resetDemo() {
  const response = await fetch(`${API_BASE}/api/mission/reset`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  });
  return handleResponse(response);
}

export async function parseIntent(text: string) {
  const response = await fetch(`${API_BASE}/api/mission/parse`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });
  return handleResponse(response);
}

// ============ ATTACK OPERATIONS ============

export async function simulatePromptInjection() {
  const response = await fetch(`${API_BASE}/api/attack/prompt-injection`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  });
  return handleResponse(response);
}

export async function simulateStolenKey() {
  const response = await fetch(`${API_BASE}/api/attack/stolen-key`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  });
  return handleResponse(response);
}

export async function launchSpamAttack() {
  const response = await fetch(`${API_BASE}/api/attack/spam`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  });
  return handleResponse(response);
}