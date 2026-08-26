// ═══════════════════════════════════════════════════════════════════════════════
// usePresenceTracking — Anonymous presence heartbeat via Firebase
// Manages: session ID, Firebase auth, heartbeat interval, cleanup on unmount
// ═══════════════════════════════════════════════════════════════════════════════

import { useEffect, useRef, useCallback } from 'react';
import { generateUniqueId } from '../utils/generateId.js';
const FETCH_TIMEOUT_MS = 10000;
const PRESENCE_INTERVAL_MS = 60000;
const FIREBASE_WRITE_COOLDOWN_MS = 5000;
const FIREBASE_RATE_LIMIT_MAX_ENTRIES = 100;

const FIREBASE_DB = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_FIREBASE_DB) || null;
const FIREBASE_API_KEY = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_FIREBASE_API_KEY) || null;
const FIREBASE_AVAILABLE = !!(FIREBASE_DB && FIREBASE_API_KEY);

const fetchWithTimeout = (url, options = {}) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  return fetch(url, { ...options, signal: controller.signal })
    .catch((err) => {
      if (err.name === 'AbortError') {
        throw new Error(`[WW] Request to ${new URL(url).hostname} timed out after ${FETCH_TIMEOUT_MS}ms`);
      }
      throw err;
    })
    .finally(() => clearTimeout(timeoutId));
};

// Rate limiter for Firebase writes
const firebaseWriteTimestamps = new Map();
const checkFirebaseRateLimit = (pathKey) => {
  const now = Date.now();
  const lastWrite = firebaseWriteTimestamps.get(pathKey) || 0;
  if (now - lastWrite < FIREBASE_WRITE_COOLDOWN_MS) return false;
  firebaseWriteTimestamps.set(pathKey, now);
  if (firebaseWriteTimestamps.size > FIREBASE_RATE_LIMIT_MAX_ENTRIES) {
    const staleThreshold = now - FIREBASE_WRITE_COOLDOWN_MS * 10;
    for (const [key, ts] of firebaseWriteTimestamps) {
      if (ts < staleThreshold) firebaseWriteTimestamps.delete(key);
    }
  }
  return true;
};

export { FIREBASE_AVAILABLE, FIREBASE_DB, FIREBASE_API_KEY, fetchWithTimeout, checkFirebaseRateLimit };

export function usePresenceTracking() {
  const presenceSessionId = useRef('s_' + generateUniqueId().replace(/-/g, '').slice(0, 12));
  const firebaseAuthRef = useRef({ idToken: null, expiresAt: 0 });

  const getFirebaseAuth = useCallback(async () => {
    if (!FIREBASE_AVAILABLE) return null;
    const now = Date.now();
    if (firebaseAuthRef.current.idToken && firebaseAuthRef.current.expiresAt > now + 60000) {
      return firebaseAuthRef.current.idToken;
    }
    try {
      const res = await fetchWithTimeout(`https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${FIREBASE_API_KEY}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ returnSecureToken: true }),
      });
      if (!res.ok) throw new Error('Firebase auth failed');
      const data = await res.json();
      firebaseAuthRef.current = { idToken: data.idToken, expiresAt: now + (parseInt(data.expiresIn, 10) || 3600) * 1000 };
      return data.idToken;
    } catch (e) { console.warn('Firebase anonymous auth failed:', e); return null; }
  }, []);

  const firebaseFetch = useCallback((path, authToken, options = {}) => {
    const url = `${FIREBASE_DB}/${path}.json`;
    const headers = { ...(options.headers || {}) };
    if (authToken) headers['Authorization'] = `Bearer ${authToken}`;
    return fetchWithTimeout(url, { ...options, headers });
  }, []);

  const sendPresenceHeartbeat = useCallback(async () => {
    if (!checkFirebaseRateLimit('presence-heartbeat')) return;
    try {
      const authToken = await getFirebaseAuth();
      const res = await firebaseFetch(`presence/${presenceSessionId.current}`, authToken, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ t: Date.now() }),
      });
      if (!res.ok) {
        const errText = await res.text().catch(() => '');
        console.warn(`[WW] Heartbeat write failed (${res.status})${errText ? ' -' + errText.slice(0, 80) : ''}`);
      }
    } catch (e) { /* heartbeat errors are non-critical */ }
  }, [getFirebaseAuth, firebaseFetch]);

  const removePresence = useCallback(async () => {
    try {
      const authToken = await getFirebaseAuth();
      await firebaseFetch(`presence/${presenceSessionId.current}`, authToken, { method: 'DELETE' });
    } catch { /* best-effort */ }
  }, [getFirebaseAuth, firebaseFetch]);

  // Start heartbeat on mount, clean up on unmount
  useEffect(() => {
    sendPresenceHeartbeat();
    const interval = setInterval(sendPresenceHeartbeat, PRESENCE_INTERVAL_MS);
    return () => {
      clearInterval(interval);
      removePresence();
    };
  }, [sendPresenceHeartbeat, removePresence]);

  return { getFirebaseAuth, firebaseFetch, checkFirebaseRateLimit };
}
