// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — CloudStorageProvider
// Context provider for Google Sign-In, Firebase helpers, and cloud backup/restore.
// Eliminates prop drilling of 10+ cloud-related props through App → ProfileTab.
// ═══════════════════════════════════════════════════════════════════════════════

import { createContext, useContext, useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { Browser } from '@capacitor/browser';
import { App as CapacitorApp } from '@capacitor/app';
import { useToast } from './ToastProvider.jsx';
import { useConfirm } from './ConfirmProvider.jsx';

const CloudStorageContext = createContext(null);

// Custom-scheme redirect the native OAuth flow below sends Google back to — matches
// android:scheme="@string/custom_url_scheme" on MainActivity's own intent-filter
// (AndroidManifest.xml) and capacitor.config.json's appId, so the OS routes it back into this
// app instead of a browser tab going nowhere.
const OAUTH_REDIRECT_URI = 'cc.andene.whisperingwishes://oauth-callback';

// PKCE (RFC 7636) helpers for the native authorization-code flow below — a public client (no
// client secret, since this is a bundled mobile app) proves it's the one that started the flow
// by sending a random verifier up front (as its SHA-256 hash) and the plain verifier back at
// the token-exchange step, instead of a secret Google's own docs say never to ship in an app.
const base64UrlEncode = (bytes) => {
  let str = '';
  for (const b of bytes) str += String.fromCharCode(b);
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};
const generateCodeVerifier = () => {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return base64UrlEncode(bytes);
};
const generateCodeChallenge = async (verifier) => {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier));
  return base64UrlEncode(new Uint8Array(digest));
};

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

  // Track mounted state to prevent setState after unmount during async cloud ops
  const mountedRef = useRef(true);
  useEffect(() => () => { mountedRef.current = false; }, []);
  const safeSetStatus = useCallback((s) => { if (mountedRef.current) setCloudBackupStatus(s); }, []);

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

  // ── Google Sign-In (web) — Google Identity Services' own token-client popup, unchanged. Only
  // works on an actual web page origin; Google rejects this flow (disallowed_useragent) inside
  // an Android WebView, which is exactly why the native branch below exists. ──
  const getGoogleAccessTokenWeb = useCallback(async () => {
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
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('Sign-in timed out — popup may have been blocked')), 60000);
      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: import.meta.env?.VITE_GOOGLE_CLIENT_ID || '',
        scope: 'email profile',
        callback: (response) => {
          clearTimeout(timeout);
          if (response.error) reject(new Error(response.error));
          else resolve(response.access_token);
        },
      });
      client.requestAccessToken();
    });
  }, []);

  // ── Google Sign-In (native) — authorization-code + PKCE flow through the system browser
  // (@capacitor/browser), since Google blocks its OAuth pages from loading inside an embedded
  // WebView at all. The redirect comes back to the app via the custom-scheme intent-filter added
  // to MainActivity (AndroidManifest.xml), delivered here as an 'appUrlOpen' event.
  //
  // NOTE: this requires a Google Cloud OAuth client of a type that allows a custom-scheme
  // redirect URI — the existing VITE_GOOGLE_CLIENT_ID (a "Web application" client, needed for
  // the web flow above) can only redirect to https:// URLs and will reject
  // cc.andene.whisperingwishes://oauth-callback outright. A second client (type "iOS" — the
  // conventional choice for custom-scheme redirects, works fine for a non-iOS app) needs to be
  // created in Google Cloud Console with this exact redirect URI registered, and its client ID
  // supplied as VITE_GOOGLE_CLIENT_ID_NATIVE. Until that's set, this throws immediately rather
  // than silently failing partway through the browser flow.
  const getGoogleAccessTokenNative = useCallback(() => new Promise((resolve, reject) => {
    const nativeClientId = import.meta.env?.VITE_GOOGLE_CLIENT_ID_NATIVE || '';
    if (!nativeClientId) { reject(new Error('Native Google Sign-In not configured (VITE_GOOGLE_CLIENT_ID_NATIVE missing)')); return; }
    let settled = false;
    let urlListenerHandle = null;
    let finishedListenerHandle = null;
    const timeout = setTimeout(() => finish(() => reject(new Error('Sign-in timed out'))), 120000);
    const finish = (action) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      urlListenerHandle?.remove();
      finishedListenerHandle?.remove();
      action();
    };
    (async () => {
      try {
        const verifier = generateCodeVerifier();
        const challenge = await generateCodeChallenge(verifier);
        const authUrl = 'https://accounts.google.com/o/oauth2/v2/auth?' + new URLSearchParams({
          client_id: nativeClientId,
          redirect_uri: OAUTH_REDIRECT_URI,
          response_type: 'code',
          scope: 'email profile',
          code_challenge: challenge,
          code_challenge_method: 'S256',
          prompt: 'select_account',
        }).toString();

        // Fires if the user closes the browser tab themselves without completing sign-in —
        // Browser.close() below (the success path) also fires this event, so the settled guard
        // above keeps that from double-rejecting an already-resolved promise.
        finishedListenerHandle = await Browser.addListener('browserFinished', () => {
          finish(() => reject(new Error('Sign-in cancelled')));
        });
        urlListenerHandle = await CapacitorApp.addListener('appUrlOpen', async ({ url }) => {
          if (!url.startsWith(OAUTH_REDIRECT_URI)) return;
          try { await Browser.close(); } catch { /* already closed */ }
          const parsed = new URL(url);
          const error = parsed.searchParams.get('error');
          const code = parsed.searchParams.get('code');
          if (error) { finish(() => reject(new Error(error))); return; }
          if (!code) { finish(() => reject(new Error('No authorization code returned'))); return; }
          try {
            const tokenRes = await fetchWithTimeout('https://oauth2.googleapis.com/token', {
              method: 'POST',
              headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
              body: new URLSearchParams({
                code,
                client_id: nativeClientId,
                redirect_uri: OAUTH_REDIRECT_URI,
                grant_type: 'authorization_code',
                code_verifier: verifier,
              }).toString(),
            });
            if (!tokenRes.ok) { finish(() => reject(new Error('Token exchange failed'))); return; }
            const tokenData = await tokenRes.json();
            finish(() => resolve(tokenData.access_token));
          } catch (e) {
            finish(() => reject(e));
          }
        });

        await Browser.open({ url: authUrl });
      } catch (e) {
        finish(() => reject(e));
      }
    })();
  }), []);

  // ── Google Sign-In / Sign-Out ───────────────────────────────────────────
  const handleGoogleSignIn = useCallback(async () => {
    if (!FIREBASE_API_KEY) { toast?.addToast?.('Firebase not configured', 'error'); return; }
    try {
      const accessToken = Capacitor.isNativePlatform()
        ? await getGoogleAccessTokenNative()
        : await getGoogleAccessTokenWeb();
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
  }, [toast, getGoogleAccessTokenNative, getGoogleAccessTokenWeb]);

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
    safeSetStatus('saving');
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
        safeSetStatus('idle');
        return;
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      safeSetStatus('done');
      toast?.addToast?.(`Backed up ${backupData.pullCount} pulls to cloud`, 'success');
      setTimeout(() => safeSetStatus('idle'), 3000);
    } catch (err) {
      safeSetStatus('error');
      toast?.addToast?.('Backup failed: ' + (err.message || 'Unknown error'), 'error');
      setTimeout(() => safeSetStatus('idle'), 3000);
    }
  }, [getGoogleAuth, googleUser, firebaseFetch, toast, handleGoogleSignOut, getBackupPayload, cloudBackupStatus]);

  // ── Cloud Restore ───────────────────────────────────────────────────────
  const handleCloudRestore = useCallback(async () => {
    if (cloudBackupStatus === 'saving' || cloudBackupStatus === 'loading') return; // prevent double-tap
    let token = await getGoogleAuth();
    if (!token || !googleUser) {
      toast?.addToast?.('Session expired — please sign in again', 'error');
      handleGoogleSignOut();
      return;
    }
    safeSetStatus('loading');
    try {
      const res = await firebaseFetch(`user-history/${googleUser.uid}`, token);
      if (res.status === 401) {
        toast?.addToast?.('Session expired — please sign in again', 'error');
        handleGoogleSignOut();
        safeSetStatus('idle');
        return;
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (!data || !data.profile) {
        toast?.addToast?.('No cloud backup found', 'error');
        safeSetStatus('idle');
        return;
      }
      const doRestore = await confirm?.({
        title: 'Restore from cloud',
        message: `Restore backup from ${data.timestamp ? new Date(data.timestamp).toLocaleString() : 'unknown date'}?\n${data.pullCount || 0} pulls (v${data.version || '?'}).\nThis will REPLACE your current data.`,
        confirmLabel: 'Restore',
        destructive: true,
      });
      if (!doRestore) { safeSetStatus('idle'); return; }
      // Delegate state application to parent via callback
      onRestoreData(data);
      safeSetStatus('done');
      toast?.addToast?.(`Restored ${data.pullCount || 0} pulls from cloud`, 'success');
      setTimeout(() => safeSetStatus('idle'), 3000);
    } catch (err) {
      safeSetStatus('error');
      toast?.addToast?.('Restore failed: ' + (err.message || 'Unknown error'), 'error');
      setTimeout(() => safeSetStatus('idle'), 3000);
    }
  }, [getGoogleAuth, googleUser, firebaseFetch, toast, confirm, handleGoogleSignOut, onRestoreData, cloudBackupStatus]);

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
