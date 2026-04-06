// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — CloudStorageProvider
// Context provider for Google Sign-In, Firebase helpers, and cloud backup/restore.
// Eliminates prop drilling of 10+ cloud-related props through App → ProfileTab.
// ═══════════════════════════════════════════════════════════════════════════════

import { createContext, useContext, useState, useRef, useCallback, useMemo } from 'react';
import { useToast } from './ToastProvider.jsx';
import { useConfirm } from './ConfirmProvider.jsx';
import { sanitizeStateObj } from '../core/storage.js';

const CloudStorageContext = createContext(null);

// Module-level constants (Firebase config from env)
const FIREBASE_DB = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_FIREBASE_DB) || null;
const FIREBASE_API_KEY = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_FIREBASE_API_KEY) || null;
const FIREBASE_AVAILABLE = !!(FIREBASE_DB && FIREBASE_API_KEY);

const FETCH_TIMEOUT_MS = 10000;
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

/**
 * CloudStorageProvider manages Google Sign-In authentication, Firebase helpers,
 * and cloud backup/restore/delete operations.
 *
 * Props:
 * - getBackupPayload: () => object — returns full backup data from app state
 * - onRestoreData: (data) => void — applies restored cloud data to app state
 */
export function CloudStorageProvider({ children, getBackupPayload, onRestoreData }) {
  const toast = useToast();
  const confirm = useConfirm();

  // ── Google Auth state ───────────────────────────────────────────────��───
  const [googleUser, setGoogleUser] = useState(() => {
    try { const v = localStorage.getItem('ww-google-user'); return v ? JSON.parse(v) : null; } catch { return null; }
  });
  const [cloudBackupStatus, setCloudBackupStatus] = useState('idle'); // idle|saving|loading|done|error
  const googleAuthRef = useRef({ idToken: null, refreshToken: null, expiresAt: 0 });

  // ── Firebase Anonymous Auth ─────────────────────────────────────────────
  const firebaseAuthRef = useRef({ idToken: null, expiresAt: 0 });
  const getFirebaseAuth = useCallback(async () => {
    if (!FIREBASE_AVAILABLE) {
      console.warn('[WW] Firebase config missing - online features disabled.');
      return null;
    }
    const now = Date.now();
    if (firebaseAuthRef.current.idToken && firebaseAuthRef.current.expiresAt > now + 60000) {
      return firebaseAuthRef.current.idToken;
    }
    try {
      const res = await fetchWithTimeout(`https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${FIREBASE_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ returnSecureToken: true })
      });
      if (!res.ok) throw new Error('Firebase auth failed');
      const data = await res.json();
      firebaseAuthRef.current = {
        idToken: data.idToken,
        expiresAt: now + (parseInt(data.expiresIn, 10) || 3600) * 1000
      };
      return data.idToken;
    } catch (e) {
      console.warn('Firebase anonymous auth failed:', e);
      return null;
    }
  }, []);

  const firebaseUrl = useCallback((path) => `${FIREBASE_DB}/${path}.json`, []);

  const firebaseFetch = useCallback((path, authToken, options = {}) => {
    const url = `${FIREBASE_DB}/${path}.json`;
    const headers = { ...(options.headers || {}) };
    if (authToken) headers['Authorization'] = `Bearer ${authToken}`;
    return fetchWithTimeout(url, { ...options, headers });
  }, []);

  // ── Google Token Management ─────────────────────────────────────────────
  const refreshGoogleToken = useCallback(async () => {
    const rt = googleAuthRef.current.refreshToken;
    if (!rt || !FIREBASE_API_KEY) return null;
    try {
      const res = await fetchWithTimeout('https://securetoken.googleapis.com/v1/token?key=' + FIREBASE_API_KEY, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `grant_type=refresh_token&refresh_token=${encodeURIComponent(rt)}`,
      });
      if (!res.ok) throw new Error('Token refresh failed');
      const data = await res.json();
      googleAuthRef.current = {
        idToken: data.id_token,
        refreshToken: data.refresh_token || rt,
        expiresAt: Date.now() + (parseInt(data.expires_in, 10) || 3600) * 1000,
      };
      return data.id_token;
    } catch { return null; }
  }, []);

  const getGoogleAuth = useCallback(async () => {
    if (!googleUser) return null;
    const now = Date.now();
    if (googleAuthRef.current.idToken && googleAuthRef.current.expiresAt > now + 60000) {
      return googleAuthRef.current.idToken;
    }
    return refreshGoogleToken();
  }, [googleUser, refreshGoogleToken]);

  // ── Google Sign-In / Sign-Out ───────────────────────────────────────────
  const handleGoogleSignIn = useCallback(async () => {
    if (!FIREBASE_API_KEY) { toast?.addToast?.('Firebase not configured', 'error'); return; }
    try {
      if (!window.google?.accounts?.oauth2) {
        await new Promise((resolve, reject) => {
          if (document.querySelector('script[src*="accounts.google.com/gsi/client"]')) {
            const check = setInterval(() => { if (window.google?.accounts?.oauth2) { clearInterval(check); resolve(); } }, 100);
            setTimeout(() => { clearInterval(check); reject(new Error('GIS load timeout')); }, 10000);
            return;
          }
          const script = document.createElement('script');
          script.src = 'https://accounts.google.com/gsi/client';
          script.onload = resolve;
          script.onerror = () => reject(new Error('Failed to load Google Sign-In'));
          document.head.appendChild(script);
        });
      }
      const accessToken = await new Promise((resolve, reject) => {
        const client = window.google.accounts.oauth2.initTokenClient({
          client_id: import.meta.env?.VITE_GOOGLE_CLIENT_ID || '',
          scope: 'email profile',
          callback: (response) => {
            if (response.error) reject(new Error(response.error));
            else resolve(response.access_token);
          },
        });
        client.requestAccessToken();
      });
      toast?.addToast?.('Signing in...', 'info');
      const fbRes = await fetchWithTimeout(
        `https://identitytoolkit.googleapis.com/v1/accounts:signInWithIdp?key=${FIREBASE_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            postBody: `access_token=${accessToken}&providerId=google.com`,
            requestUri: window.location.origin,
            returnIdToken: true,
            returnSecureToken: true,
          }),
        }
      );
      if (!fbRes.ok) {
        const errData = await fbRes.json().catch(() => ({}));
        throw new Error(errData?.error?.message || 'Firebase sign-in failed');
      }
      const fbData = await fbRes.json();
      const user = {
        uid: fbData.localId,
        displayName: fbData.displayName || fbData.email?.split('@')[0] || 'User',
        photoUrl: fbData.photoUrl || null,
      };
      googleAuthRef.current = {
        idToken: fbData.idToken,
        refreshToken: fbData.refreshToken,
        expiresAt: Date.now() + (parseInt(fbData.expiresIn, 10) || 3600) * 1000,
      };
      setGoogleUser(user);
      try { localStorage.setItem('ww-google-user', JSON.stringify(user)); } catch {}
      toast?.addToast?.(`Signed in as ${user.displayName}`, 'success');
    } catch (err) {
      console.error('Google sign-in error:', err);
      toast?.addToast?.('Sign-in failed: ' + (err.message || 'Unknown error'), 'error');
    }
  }, [toast]);

  const handleGoogleSignOut = useCallback(() => {
    setGoogleUser(null);
    googleAuthRef.current = { idToken: null, refreshToken: null, expiresAt: 0 };
    try { localStorage.removeItem('ww-google-user'); } catch {}
    toast?.addToast?.('Signed out', 'info');
  }, [toast]);

  // ── Cloud Backup ────────────────────────────────────────────────────────
  const handleCloudBackup = useCallback(async () => {
    if (cloudBackupStatus === 'saving' || cloudBackupStatus === 'loading') return; // prevent double-click
    const token = await getGoogleAuth();
    if (!token || !googleUser) {
      toast?.addToast?.('Session expired — please sign in again', 'error');
      handleGoogleSignOut();
      return;
    }
    setCloudBackupStatus('saving');
    try {
      const backupData = getBackupPayload();
      const res = await firebaseFetch(`user-history/${googleUser.uid}`, token, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(backupData),
      });
      if (res.status === 401) {
        toast?.addToast?.('Session expired — please sign in again', 'error');
        handleGoogleSignOut();
        setCloudBackupStatus('idle');
        return;
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setCloudBackupStatus('done');
      toast?.addToast?.(`Backed up ${backupData.pullCount} pulls to cloud`, 'success');
      setTimeout(() => setCloudBackupStatus('idle'), 3000);
    } catch (err) {
      setCloudBackupStatus('error');
      toast?.addToast?.('Backup failed: ' + (err.message || 'Unknown error'), 'error');
      setTimeout(() => setCloudBackupStatus('idle'), 3000);
    }
  }, [getGoogleAuth, googleUser, firebaseFetch, toast, handleGoogleSignOut, getBackupPayload, cloudBackupStatus]);

  // ── Cloud Restore ───────────────────────────────────────────────────────
  const handleCloudRestore = useCallback(async () => {
    let token = await getGoogleAuth();
    if (!token || !googleUser) {
      toast?.addToast?.('Session expired — please sign in again', 'error');
      handleGoogleSignOut();
      return;
    }
    setCloudBackupStatus('loading');
    try {
      const res = await firebaseFetch(`user-history/${googleUser.uid}`, token);
      if (res.status === 401) {
        toast?.addToast?.('Session expired — please sign in again', 'error');
        handleGoogleSignOut();
        setCloudBackupStatus('idle');
        return;
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (!data || !data.profile) {
        toast?.addToast?.('No cloud backup found', 'error');
        setCloudBackupStatus('idle');
        return;
      }
      const doRestore = await confirm?.({
        title: 'Restore from cloud',
        message: `Restore backup from ${data.timestamp ? new Date(data.timestamp).toLocaleString() : 'unknown date'}?\n${data.pullCount || 0} pulls (v${data.version || '?'}).\nThis will REPLACE your current data.`,
        confirmLabel: 'Restore',
        destructive: true,
      });
      if (!doRestore) { setCloudBackupStatus('idle'); return; }
      // Delegate state application to parent via callback
      onRestoreData(data);
      setCloudBackupStatus('done');
      toast?.addToast?.(`Restored ${data.pullCount || 0} pulls from cloud`, 'success');
      setTimeout(() => setCloudBackupStatus('idle'), 3000);
    } catch (err) {
      setCloudBackupStatus('error');
      toast?.addToast?.('Restore failed: ' + (err.message || 'Unknown error'), 'error');
      setTimeout(() => setCloudBackupStatus('idle'), 3000);
    }
  }, [getGoogleAuth, googleUser, firebaseFetch, toast, confirm, handleGoogleSignOut, onRestoreData]);

  // ── Cloud Delete ────────────────────────────────────────────────────────
  const handleCloudDelete = useCallback(async () => {
    const token = await getGoogleAuth();
    if (!token || !googleUser) return;
    try {
      await firebaseFetch(`user-history/${googleUser.uid}`, token, { method: 'DELETE' });
    } catch { /* best-effort */ }
  }, [getGoogleAuth, googleUser, firebaseFetch]);

  // ── Context value ───────────────────────────────────────────────────────
  const value = useMemo(() => ({
    // Google auth
    googleUser,
    handleGoogleSignIn,
    handleGoogleSignOut,
    cloudBackupStatus,
    // Cloud operations
    handleCloudBackup,
    handleCloudRestore,
    handleCloudDelete,
    // Firebase helpers (shared with AnalyticsTab, AdminPanel, etc.)
    getFirebaseAuth,
    firebaseUrl,
    firebaseFetch,
    FIREBASE_AVAILABLE,
  }), [
    googleUser, handleGoogleSignIn, handleGoogleSignOut, cloudBackupStatus,
    handleCloudBackup, handleCloudRestore, handleCloudDelete,
    getFirebaseAuth, firebaseUrl, firebaseFetch,
  ]);

  return (
    <CloudStorageContext.Provider value={value}>
      {children}
    </CloudStorageContext.Provider>
  );
}

export function useCloudStorage() {
  const ctx = useContext(CloudStorageContext);
  if (!ctx) throw new Error('useCloudStorage must be used within CloudStorageProvider');
  return ctx;
}

export { CloudStorageContext };
