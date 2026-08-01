// src/services/socket.ts

import { io, Socket } from 'socket.io-client';
import { Dispatch } from 'react';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

let socket: Socket | null = null;

export function initializeSocket(dispatch: Dispatch<any>): Socket {
  if (socket) {
    console.warn('Socket already initialized');
    return socket;
  }

  socket = io(BACKEND_URL, {
    transports: ['websocket'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  // ============ EVENT HANDLERS ============

  socket.on('connect', () => {
    console.log('🔗 Socket connected to backend');
  });

  socket.on('disconnect', () => {
    console.log('🔌 Socket disconnected');
  });

  socket.on('connect_error', (error) => {
    console.error('❌ Socket connection error:', error);
  });

  // ============ STATE INIT ============
  socket.on('state_init', (data) => {
    console.log('📦 State init received');
    dispatch({ type: 'INIT_STATE', payload: data });
  });

  // ============ LOGS ============
  socket.on('log', (entry) => {
    dispatch({ type: 'ADD_LOG', payload: entry });
  });

  // ============ CHAT ============
  socket.on('chat', (entry) => {
    dispatch({ type: 'ADD_CHAT', payload: entry });
  });

  // ============ SHIELDS ============
  socket.on('shield_update', (data) => {
    dispatch({ type: 'UPDATE_SHIELD', payload: data });
  });

  // ============ MISSION ============
  socket.on('mission_update', (data) => {
    dispatch({ type: 'SET_MISSION', payload: data.mission });
  });

  // ============ WALLET STATUS ============
  socket.on('wallet_status', (data) => {
    dispatch({ type: 'SET_WALLET_STATUS', payload: data.status });
  });

  // ============ TRUST ============
  socket.on('trust_update', (data) => {
    dispatch({ type: 'SET_TRUST', payload: data.trustScore });
  });

  // ============ AUDIT ============
  socket.on('audit', (entry) => {
    dispatch({ type: 'ADD_AUDIT', payload: entry });
  });

  // ============ ATTACK STATS ============
  socket.on('attack_stats', (data) => {
    dispatch({ type: 'UPDATE_ATTACK_STATS', payload: data });
  });

  // ============ POLICIES ============
  socket.on('policy_update', (data) => {
    dispatch({ type: 'UPDATE_POLICIES', payload: data.policies });
  });

  // ============ BALANCES ============
  socket.on('balance_update', (data) => {
    dispatch({ type: 'UPDATE_BALANCES', payload: data });
  });

  // ============ PROFILE ============
  socket.on('profile_update', (profile) => {
    dispatch({ type: 'UPDATE_PROFILE', payload: profile });
  });

  // ============ STATE RESET ============
  socket.on('state_reset', (data) => {
    dispatch({ type: 'INIT_STATE', payload: data });
  });

  return socket;
}

export function getSocket(): Socket | null {
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
    console.log('🔌 Socket manually disconnected');
  }
}