// ═══════════════════════════════════════════════════════════════════════════════
// ProfileTab — Extracted from App.jsx [SECTION:TAB-PROFILE]
// Includes: Profile settings, Display settings, Import, ID Card modal,
//           Admin panel modal, Admin mini window
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Award, Camera, Check, ChevronDown, ClipboardList, Crown, Diamond, Download, Gamepad2, Link, Loader, Monitor, RefreshCcw, Settings, Smartphone, Sparkles, Star, Type, Upload, User, X } from 'lucide-react';
import { parseGachaUrl, buildBaseUrl, fetchAllPools, convertToImportFormat, compressImage, extractIdsFromImage, POOL_LABELS } from '../../utils/gachaImporter.js';
import {
  APP_VERSION, MAX_IMPORT_SIZE_MB, HEADER_ICON, haptic,
  SERVERS, getServerOffset,
  CURRENT_BANNERS, CHARACTER_DATA,
  DEFAULT_COLLECTION_IMAGES, ALL_CHARACTERS,
  ALL_5STAR_RESONATORS, ALL_4STAR_RESONATORS,
  ALL_5STAR_WEAPONS, ALL_4STAR_WEAPONS, ALL_3STAR_WEAPONS, ALL_2STAR_WEAPONS, ALL_1STAR_WEAPONS,
  getElementColor, getElementBg,
  CHARACTER_THEMES,
} from '../../appcore-data.js';
import {
  storageAvailable,
} from '../../appcore-engine.js';
import {
  useFocusTrap, FocusTrapModal,
} from '../../appcore-providers.jsx';
import {
  TROPHY_ICON_MAP, TabBackground,
  Card, CardHeader, CardBody,
  TabErrorBoundary,
  ADMIN_BANNER_KEY, ADMIN_HASH,
  VisualSliderGroup, VISUAL_SLIDER_CONFIGS,
  ImportGuide, getActiveBanners,
  hideOnError,
} from '../../appcore-components.jsx';
import IdCardModal from './IdCardModal.jsx';
import AdminPanel from './AdminPanel.jsx';

// Module-level constants (copied from App.jsx — profile/admin specific)
const MAX_USERNAME_LENGTH = 24;
const MAX_ADMIN_ATTEMPTS = 5;
const ADMIN_LOCKOUT_MS = 5 * 60 * 1000;
const ADMIN_TAP_TIMEOUT_MS = 1500;
const ADMIN_SALT = 'whispering-wishes-v3-admin';
const TROPHY_OVERRIDES_KEY = 'whispering-wishes-trophy-overrides-v1';
const ALLOWED_IMAGE_HOSTS = ['i.ibb.co', 'ibb.co', 'i.imgur.com', 'imgur.com', 'cdn.discordapp.com', 'media.discordapp.net', 'pbs.twimg.com', 'raw.githubusercontent.com', 'i.postimg.cc', 'wuwa.gg', 'wuwatracker.com'];
const currentYear = new Date().getFullYear();
import { silentCatch } from '../../utils/silentCatch.js';
const constantTimeCompare = (a, b) => {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
};
const isAllowedImageUrl = (url) => {
  if (!url || typeof url !== 'string') return false;
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'https:') return false;
    return ALLOWED_IMAGE_HOSTS.some(host =>
      parsed.hostname === host || parsed.hostname.endsWith('.' + host)
    );
  } catch { return false; }
};
// DEFAULT_VISUAL_SETTINGS received as prop from App.jsx (canonical source)

const TROPHY_TIER_ORDER = { legendary: 0, epic: 1, gold: 2, purple: 3, orange: 4, pink: 5, cyan: 6, red: 7, green: 8, blue: 9, gray: 10 };

export default function ProfileTab({
  // Core state
  state,
  dispatch,
  // Visual settings
  visualSettings,
  saveVisualSettings,
  // Toast & confirm
  toast,
  confirm,
  // PWA
  pwa,
  // Image framing
  imageFraming,
  getImageFraming,
  saveImageFraming,
  editingImage,
  setEditingImage,
  framingMode,
  setFramingMode,
  miniPanelPosition,
  saveMiniPanelPosition,
  getMiniPanelPositionClasses,
  updateEditingFraming,
  resetEditingFraming,
  // Collection images
  collectionImages,
  customCollectionImages,
  saveCollectionImages,
  // Detail modal (for admin mini window framing)
  detailModal,
  // Export
  handleExport,
  // Import processing
  processImportData,
  // Banners
  activeBanners,
  setActiveBanners,
  // Stats for ID card
  overallStats,
  luckRating,
  ownedCharNames,
  trophies,
  trophyOverrides, setTrophyOverrides,
  DEFAULT_VISUAL_SETTINGS,
  // Firebase (for admin fetch)
  getFirebaseAuth,
  firebaseUrl,
  // Tab navigation (for admin collection/trophy "Go to Import" buttons)
  setActiveTab,
  // Cache busting (for admin collection images)
  withCacheBuster,
}) {
  // ── Tab-local state ──────────────────────────────────────────────────────
  const [importPlatform, setImportPlatform] = useState(null);
  const [importMethod, setImportMethod] = useState('file');
  const [isDragOver, setIsDragOver] = useState(false);
  const [importStatus, setImportStatus] = useState(null);
  const [pasteJsonText, setPasteJsonText] = useState('');
  const [showIdCard, setShowIdCard] = useState(false);
  const [idCardFormat, setIdCardFormat] = useState('landscape');

  // ── Direct import state ──────────────────────────────────────────────────
  const [directUrl, setDirectUrl] = useState('');
  const [directPlayerId, setDirectPlayerId] = useState('');
  const [directRecordId, setDirectRecordId] = useState('');
  const [directSvrId, setDirectSvrId] = useState('');
  const [directStatus, setDirectStatus] = useState('idle'); // idle|fetching|done|error
  const [directError, setDirectError] = useState('');
  const [directProgress, setDirectProgress] = useState({});
  const [directScanStatus, setDirectScanStatus] = useState('idle'); // idle|scanning|done|error
  const [directCameraOpen, setDirectCameraOpen] = useState(false);
  const directAbortRef = useRef(null);
  const directVideoRef = useRef(null);
  const directStreamRef = useRef(null);

  const handleDirectUrlChange = useCallback((val) => {
    setDirectUrl(val);
    setDirectError('');
    const p = parseGachaUrl(val);
    if (p.valid) {
      if (p.playerId) setDirectPlayerId(p.playerId);
      if (p.recordId) setDirectRecordId(p.recordId);
      if (p.svrId) setDirectSvrId(p.svrId);
    }
  }, []);

  const handleDirectFetch = useCallback(async () => {
    const pid = directPlayerId.trim();
    const rid = directRecordId.trim();
    if (!pid || !rid) { setDirectError('player_id and record_id are required.'); return; }
    try {
      const baseUrl = buildBaseUrl(directUrl, pid, rid, directSvrId);
      directAbortRef.current = new AbortController();
      setDirectStatus('fetching');
      setDirectError('');
      setDirectProgress({});
      const result = await fetchAllPools(baseUrl, directAbortRef.current.signal, (pool, status, count) => {
        setDirectProgress(prev => ({ ...prev, [pool]: { status, count } }));
      });
      if (directAbortRef.current?.signal.aborted) { setDirectStatus('idle'); return; }
      const jsonStr = convertToImportFormat({ ...result, playerId: pid });
      await processImportData(jsonStr);
      setDirectStatus('done');
      toast?.addToast?.(`Imported ${result.total} Convenes!`, 'success');
    } catch (err) {
      if (err.name === 'AbortError') { setDirectStatus('idle'); return; }
      setDirectStatus('error');
      setDirectError(err.message || 'Import failed');
    }
  }, [directUrl, directPlayerId, directRecordId, directSvrId, processImportData, toast]);

  const handleScreenshotOcr = useCallback(async (file) => {
    if (!file) return;
    setDirectScanStatus('scanning');
    try {
      const base64 = await compressImage(file);
      const ids = await extractIdsFromImage(base64);
      if (ids.player_id) setDirectPlayerId(ids.player_id);
      if (ids.record_id) setDirectRecordId(ids.record_id);
      if (ids.svr_id) setDirectSvrId(ids.svr_id);
      setDirectScanStatus('done');
      toast?.addToast?.('IDs extracted from screenshot!', 'success');
    } catch (err) {
      setDirectScanStatus('error');
      setDirectError(err.message || 'Screenshot scan failed');
    }
  }, [toast]);

  const openDirectCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' }, width: { ideal: 1920 }, height: { ideal: 1080 } },
        audio: false,
      });
      directStreamRef.current = stream;
      setDirectCameraOpen(true);
      // Attach stream to video element after render
      setTimeout(() => {
        if (directVideoRef.current) {
          directVideoRef.current.srcObject = stream;
          directVideoRef.current.play().catch(() => {});
        }
      }, 100);
    } catch (err) {
      toast?.addToast?.(err.name === 'NotAllowedError' ? 'Camera access denied' : `Camera error: ${err.message}`, 'error');
    }
  }, [toast]);

  const captureDirectCamera = useCallback(() => {
    const video = directVideoRef.current;
    if (!video) return;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    // Stop stream
    directStreamRef.current?.getTracks().forEach(t => t.stop());
    setDirectCameraOpen(false);
    // Convert canvas to blob and OCR
    canvas.toBlob(blob => { if (blob) handleScreenshotOcr(blob); }, 'image/jpeg', 0.85);
  }, [handleScreenshotOcr]);

  const closeDirectCamera = useCallback(() => {
    directStreamRef.current?.getTracks().forEach(t => t.stop());
    setDirectCameraOpen(false);
  }, []);

  // ── Admin state ──────────────────────────────────────────────────────────
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [adminUnlocked, setAdminUnlocked] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [adminTapCount, setAdminTapCount] = useState(0);
  const adminTapTimerRef = useRef(null);
  const adminTapCountRef = useRef(0);
  const [adminTab, setAdminTab] = useState('banners');
  const [adminMiniMode, setAdminMiniMode] = useState(false);
  const [adminLockedUntil, setAdminLockedUntil] = useState(() => {
    try {
      const lockoutUntil = localStorage.getItem('ww-admin-lockout');
      const failCount = parseInt(localStorage.getItem('ww-admin-fails') || '0', 10);
      if (lockoutUntil && Date.now() < parseInt(lockoutUntil, 10)) {
        return parseInt(lockoutUntil, 10);
      }
      if (lockoutUntil) {
        localStorage.removeItem('ww-admin-lockout');
        localStorage.removeItem('ww-admin-fails');
      }
      if (failCount >= MAX_ADMIN_ATTEMPTS * 3) {
        const extendedLockout = Date.now() + ADMIN_LOCKOUT_MS * 4;
        localStorage.setItem('ww-admin-lockout', String(extendedLockout));
        return extendedLockout;
      }
    } catch (err) { silentCatch(err, 'admin lockout init'); }
    return false;
  });
  const [trophyJsonInput, setTrophyJsonInput] = useState('');
  const [activePlayersCount, setActivePlayersCount] = useState(null);
  const [activePlayersHistory, setActivePlayersHistory] = useState([]);
  const [presenceError, setPresenceError] = useState(null);
  const [adminPlayerList, setAdminPlayerList] = useState(null);

  // Banner form state
  const buildBannerForm = useCallback((banners) => {
    const b = banners || {};
    const chars = b.characters || [];
    const weaps = b.weapons || [];
    return {
      version: b.version || '1.0',
      phase: String(b.phase ?? 1),
      startDate: b.startDate?.slice(0, 16) || '',
      endDate: b.endDate?.slice(0, 16) || '',
      charsJson: JSON.stringify(chars, null, 2),
      weapsJson: JSON.stringify(weaps, null, 2),
      charImages: Object.fromEntries(chars.map((c, i) => [i, c.imageUrl || ''])),
      charImagePositions: Object.fromEntries(chars.map((c, i) => [i, c.imagePosition || ''])),
      weapImages: Object.fromEntries(weaps.map((w, i) => [i, w.imageUrl || ''])),
      weapImagePositions: Object.fromEntries(weaps.map((w, i) => [i, w.imagePosition || ''])),
      standardCharImg: b.standardCharBannerImage || '',
      standardWeapImg: b.standardWeapBannerImage || '',
      wwImg: b.whimperingWastesImage || '',
      dpImg: b.doubledPawnsImage || '',
      toaImg: b.towerOfAdversityImage || '',
      irImg: b.illusiveRealmImage || '',
      drImg: b.dailyResetImage || '',
      thImg: b.tacticalHologramImage || '',
      wbImg: b.weeklyBossImage || '',
    };
  }, []);
  const [bannerForm, setBannerForm] = useState(() => buildBannerForm(activeBanners));
  const updateBannerForm = useCallback((field, value) => {
    const imageFields = ['standardCharImg', 'standardWeapImg', 'wwImg', 'dpImg', 'toaImg', 'irImg', 'drImg', 'thImg', 'wbImg'];
    if (imageFields.includes(field) || field.startsWith('charImages.') || field.startsWith('weapImages.')) {
      if (value && !isAllowedImageUrl(value)) return;
    }
    setBannerForm(prev => ({ ...prev, [field]: value }));
  }, []);

  // Focus trap refs
  const idCardTrapRef = useFocusTrap(showIdCard);
  const adminTrapRef = useFocusTrap(showAdminPanel && !adminMiniMode);

  // ── Admin fetch functions ─────────────────────────────────────────────
  const FETCH_TIMEOUT_MS = 10000;
  const PRESENCE_TTL_MS = 120000;
  const fetchWithTimeout = useCallback((url, options = {}) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    return fetch(url, { ...options, signal: controller.signal })
      .catch((err) => {
        if (err.name === 'AbortError') throw new Error(`Request timed out after ${FETCH_TIMEOUT_MS}ms`);
        throw err;
      })
      .finally(() => clearTimeout(timeoutId));
  }, []);

  const fetchActivePlayersCount = useCallback(async () => {
    try {
      const authToken = await getFirebaseAuth();
      const res = await fetchWithTimeout(firebaseUrl('presence', authToken));
      if (res.ok) {
        const data = await res.json();
        if (data) {
          const now = Date.now();
          const activeSessions = Object.entries(data).filter(([, v]) => v?.t && (now - v.t) < PRESENCE_TTL_MS);
          const staleSessions = Object.entries(data).filter(([, v]) => !v?.t || (now - v.t) >= PRESENCE_TTL_MS);
          for (const [key] of staleSessions.slice(0, 50)) {
            try { await fetchWithTimeout(firebaseUrl(`presence/${key}`, authToken), { method: 'DELETE' }); } catch {}
          }
          const count = activeSessions.length;
          setActivePlayersCount(count);
          setPresenceError(null);
          setActivePlayersHistory(prev => {
            const next = [...prev, { time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), count }];
            return next.slice(-30);
          });
        } else {
          setActivePlayersCount(0);
          setPresenceError('No presence data in Firebase. Check that heartbeat writes are succeeding.');
        }
      } else {
        const errText = await res.text().catch(() => '');
        setPresenceError(`Read failed (${res.status}). Add "presence" read/write rule in Firebase.${errText ? ' — ' + errText.slice(0, 80) : ''}`);
      }
    } catch (e) { setPresenceError(`Fetch error: ${e.message}`); }
  }, [getFirebaseAuth, firebaseUrl, fetchWithTimeout]);

  const fetchAdminPlayerList = useCallback(async () => {
    try {
      const authToken = await getFirebaseAuth();
      const res = await fetchWithTimeout(firebaseUrl('leaderboard', authToken));
      if (res.ok) {
        const data = await res.json();
        if (data) {
          const players = Object.entries(data).map(([key, e]) => ({
            firebaseKey: key,
            id: e.id || key,
            uid: e.uid || null,
            avgPity: e.avgPity,
            totalPulls: e.totalPulls ?? 0,
            fiveStars: e.pulls ?? 0,
            won5050: e.won5050 ?? 0,
            lost5050: e.lost5050 ?? 0,
            timestamp: e.timestamp || 0,
          }));
          players.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
          setAdminPlayerList(players);
        } else {
          setAdminPlayerList([]);
        }
      } else {
        setAdminPlayerList([]);
      }
    } catch (e) {
      console.error('Admin player list fetch error:', e);
      setAdminPlayerList([]);
    }
  }, [getFirebaseAuth, firebaseUrl, fetchWithTimeout]);

  // ── Import handlers (moved from App.jsx — they use tab-local state) ────
  const handleFileImport = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const MAX_IMPORT_SIZE = MAX_IMPORT_SIZE_MB * 1024 * 1024;
    if (file.size > MAX_IMPORT_SIZE) {
      toast?.addToast?.(`File too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Maximum is ${MAX_IMPORT_SIZE_MB}MB.`, 'error');
      e.target.value = '';
      return;
    }
    setImportStatus({ fileName: file.name, fileSize: (file.size / 1024).toFixed(1) });
    const reader = new FileReader();
    reader.onload = (ev) => {
      processImportData(ev.target.result).catch(() => {}).finally(() => setImportStatus(null));
    };
    reader.onerror = () => {
      toast?.addToast?.('Failed to read file', 'error');
      setImportStatus(null);
    };
    reader.readAsText(file);
    e.target.value = '';
  }, [processImportData, toast]);

  const handleFileDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    const file = e.dataTransfer?.files?.[0];
    if (!file) return;
    if (!file.name.endsWith('.json')) {
      toast?.addToast?.('Please drop a .json file', 'error');
      return;
    }
    const MAX_IMPORT_SIZE = MAX_IMPORT_SIZE_MB * 1024 * 1024;
    if (file.size > MAX_IMPORT_SIZE) {
      toast?.addToast?.(`File too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Maximum is ${MAX_IMPORT_SIZE_MB}MB.`, 'error');
      return;
    }
    setImportStatus({ fileName: file.name, fileSize: (file.size / 1024).toFixed(1) });
    const reader = new FileReader();
    reader.onload = (ev) => { processImportData(ev.target.result).catch(() => {}).finally(() => setImportStatus(null)); };
    reader.onerror = () => { toast?.addToast?.('Failed to read file', 'error'); setImportStatus(null); };
    reader.readAsText(file);
  }, [processImportData, toast]);

  const handlePasteImport = useCallback(() => {
    if (!pasteJsonText.trim()) {
      toast?.addToast?.('Please paste your JSON data first', 'error');
      return;
    }
    processImportData(pasteJsonText).then(() => setPasteJsonText('')).catch(() => {});
  }, [pasteJsonText, processImportData, toast]);

  // ── Admin handlers ─────────────────────────────────────────────────────
  const handleAdminTap = useCallback(async () => {
    if (adminTapTimerRef.current) clearTimeout(adminTapTimerRef.current);
    haptic.light();
    adminTapCountRef.current += 1;
    const newCount = adminTapCountRef.current;
    setAdminTapCount(newCount);
    if (newCount >= 5) {
      try {
        const lockoutUntil = localStorage.getItem('ww-admin-lockout');
        if (lockoutUntil && Date.now() < parseInt(lockoutUntil, 10)) {
          const remaining = Math.ceil((parseInt(lockoutUntil, 10) - Date.now()) / 60000);
          toast?.addToast?.(`Admin locked for ${remaining}m. Try again later.`, 'error');
          adminTapCountRef.current = 0;
          setAdminTapCount(0);
          return;
        }
        if (lockoutUntil) {
          localStorage.removeItem('ww-admin-lockout');
          localStorage.removeItem('ww-admin-fails');
        }
      } catch {}
      setShowAdminPanel(true);
      adminTapCountRef.current = 0;
      setAdminTapCount(0);
    } else {
      adminTapTimerRef.current = setTimeout(() => {
        adminTapCountRef.current = 0;
        setAdminTapCount(0);
      }, ADMIN_TAP_TIMEOUT_MS);
    }
  }, [toast]);

  const saveCustomBanners = useCallback((banners) => {
    if (!storageAvailable) {
      setActiveBanners(banners);
      toast?.addToast?.('Banner data updated (preview mode - not saved)', 'info');
      return;
    }
    try {
      localStorage.setItem(ADMIN_BANNER_KEY, JSON.stringify(banners));
      setActiveBanners(banners);
      toast?.addToast?.('Banner data updated!', 'success');
    } catch (e) {
      toast?.addToast?.('Failed to save banner data', 'error');
    }
  }, [toast, setActiveBanners]);

  const hashPasswordPBKDF2 = useCallback(async (password, salt) => {
    try {
      const enc = new TextEncoder();
      const keyMaterial = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveBits']);
      const derivedBits = await crypto.subtle.deriveBits(
        { name: 'PBKDF2', salt: enc.encode(salt), iterations: 100000, hash: 'SHA-256' },
        keyMaterial, 256
      );
      return Array.from(new Uint8Array(derivedBits)).map(b => b.toString(16).padStart(2, '0')).join('');
    } catch (e) {
      console.error('crypto.subtle PBKDF2 unavailable:', e);
      return null;
    }
  }, []);

  const hashPasswordSHA256 = useCallback(async (password, salt = '') => {
    try {
      const hashBuffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(salt + password));
      return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
    } catch (e) {
      console.error('crypto.subtle unavailable (requires HTTPS):', e);
      return null;
    }
  }, []);

  const adminSessionFailsRef = useRef(0);
  const adminSessionLockUntilRef = useRef(0);

  const verifyAdminPassword = useCallback(async () => {
    if (!adminPassword || adminPassword.length < 4) {
      toast?.addToast?.('Password must be at least 4 characters', 'error');
      return;
    }
    const now = Date.now();
    if (adminSessionLockUntilRef.current > now) {
      const remaining = Math.ceil((adminSessionLockUntilRef.current - now) / 60000);
      toast?.addToast?.(`Too many failed attempts. Try again in ${remaining}m.`, 'error');
      return;
    }
    try {
      const lockoutUntil = localStorage.getItem('ww-admin-lockout');
      if (lockoutUntil && now < parseInt(lockoutUntil, 10)) {
        const remaining = Math.ceil((parseInt(lockoutUntil, 10) - now) / 60000);
        toast?.addToast?.(`Too many failed attempts. Try again in ${remaining}m.`, 'error');
        return;
      }
    } catch {}
    const pbkdf2Hash = await hashPasswordPBKDF2(adminPassword, ADMIN_SALT);
    const saltedHash = await hashPasswordSHA256(adminPassword, ADMIN_SALT);
    const legacyHash = await hashPasswordSHA256(adminPassword);
    if (!saltedHash && !legacyHash && !pbkdf2Hash) {
      toast?.addToast?.('Hashing unavailable — HTTPS required', 'error');
      return;
    }
    if (constantTimeCompare(pbkdf2Hash, ADMIN_HASH) || constantTimeCompare(saltedHash, ADMIN_HASH) || constantTimeCompare(legacyHash, ADMIN_HASH)) {
      setAdminUnlocked(true);
      setAdminPassword('');
      adminSessionFailsRef.current = 0;
      setBannerForm(buildBannerForm(activeBanners));
      try { localStorage.setItem('ww-admin-fails', '0'); } catch {}
    } else {
      adminSessionFailsRef.current += 1;
      const sessionFails = adminSessionFailsRef.current;
      try {
        const storageFails = parseInt(localStorage.getItem('ww-admin-fails') || '0', 10) + 1;
        localStorage.setItem('ww-admin-fails', storageFails.toString());
        const totalFails = Math.max(sessionFails, storageFails);
        if (totalFails >= MAX_ADMIN_ATTEMPTS) {
          const lockoutTime = now + ADMIN_LOCKOUT_MS;
          adminSessionLockUntilRef.current = lockoutTime;
          localStorage.setItem('ww-admin-lockout', lockoutTime.toString());
          setAdminLockedUntil(lockoutTime);
          setShowAdminPanel(false);
          setAdminPassword('');
          toast?.addToast?.('Too many failed attempts. Admin locked for 5 minutes.', 'error');
        } else {
          toast?.addToast?.(`Incorrect password (${MAX_ADMIN_ATTEMPTS - totalFails} attempts remaining)`, 'error');
        }
      } catch {
        if (sessionFails >= MAX_ADMIN_ATTEMPTS) {
          adminSessionLockUntilRef.current = now + ADMIN_LOCKOUT_MS;
          setShowAdminPanel(false);
          setAdminPassword('');
          toast?.addToast?.('Too many failed attempts. Admin locked for 5 minutes.', 'error');
        } else {
          toast?.addToast?.(`Incorrect password (${MAX_ADMIN_ATTEMPTS - sessionFails} attempts remaining)`, 'error');
        }
      }
    }
  }, [adminPassword, toast, hashPasswordPBKDF2, hashPasswordSHA256, activeBanners, buildBannerForm]);

  // Fetch admin data when Players tab is open
  useEffect(() => {
    if (adminTab === 'players' && adminUnlocked && showAdminPanel) {
      fetchActivePlayersCount();
      fetchAdminPlayerList();
      const interval = setInterval(() => {
        fetchActivePlayersCount();
        fetchAdminPlayerList();
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [adminTab, adminUnlocked, showAdminPanel, fetchActivePlayersCount, fetchAdminPlayerList]);


  // ID Card canvas download — supports landscape (16:9) and portrait (9:16)
  const downloadIdCard = useCallback(async (format) => {
    const isPortrait = (format || idCardFormat) === 'portrait';
    const canvas = document.createElement('canvas');
    const W = isPortrait ? 1080 : 1920;
    const H = isPortrait ? 1920 : 1080;
    canvas.width = W; canvas.height = H;
    const ctx = canvas.getContext('2d');
    const rr = (x,y,w,h,r) => { ctx.beginPath(); ctx.moveTo(x+r,y); ctx.lineTo(x+w-r,y); ctx.quadraticCurveTo(x+w,y,x+w,y+r); ctx.lineTo(x+w,y+h-r); ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h); ctx.lineTo(x+r,y+h); ctx.quadraticCurveTo(x,y+h,x,y+h-r); ctx.lineTo(x,y+r); ctx.quadraticCurveTo(x,y,x+r,y); ctx.closePath(); };

    // Data
    const picName = state.profile.profilePic;
    const picUrl = picName ? (collectionImages[picName] || '') : '';
    let pImg = null;
    // AUDIT-FIX H1: Clear timeouts to prevent leaks on image preload
    if (picUrl) { try { pImg = new Image(); pImg.crossOrigin = 'anonymous'; await new Promise((r,j)=>{const t=setTimeout(j,3000);pImg.onload=()=>{clearTimeout(t);r();};pImg.onerror=()=>{clearTimeout(t);j();};pImg.src=picUrl;}); } catch { pImg = null; } }
    let appIco = null;
    try { appIco = new Image(); await new Promise((r,j)=>{const t=setTimeout(j,2000);appIco.onload=()=>{clearTimeout(t);r();};appIco.onerror=()=>{clearTimeout(t);j();};appIco.src=HEADER_ICON;}); } catch { appIco = null; }

    // Preload resonator portrait images
    const resImgs = {};
    const charHist0 = [...(state.profile.featured?.history||[]),...(state.profile.standardChar?.history||[]),...(state.profile.beginner?.history||[]).filter(p=>p.name&&ALL_CHARACTERS.has(p.name))];
    const preloadNames = [...new Set(charHist0.filter(p=>(p.rarity===5||p.rarity===4)&&p.name&&ALL_CHARACTERS.has(p.name)).map(p=>p.name))].reverse().slice(0, 24);
    await Promise.all(preloadNames.map(name => {
      const url = collectionImages[name];
      if (!url) return Promise.resolve();
      return new Promise(resolve => {
        const img = new Image(); img.crossOrigin = 'anonymous';
        // AUDIT-FIX H1: Clear timeout on load/error to prevent leaks
        const t = setTimeout(resolve, 3000);
        img.onload = () => { clearTimeout(t); resImgs[name] = img; resolve(); };
        img.onerror = () => { clearTimeout(t); resolve(); }; img.src = url;
      });
    }));

    const uname = state.profile.username || 'Resonator';
    const uid = state.profile.uid || '--';
    const svr = state.server;
    const lr = luckRating;
    const tList = [...(trophies?.list || [])].sort((a,b) => (TROPHY_TIER_ORDER[a.tier]??99) - (TROPHY_TIER_ORDER[b.tier]??99)).slice(0, 5);
    const impDate = state.profile.importedAt ? new Date(state.profile.importedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : null;
    const beginnerHist = state.profile.beginner?.history||[];
    const charHist = [
      ...(state.profile.featured?.history || []),
      ...(state.profile.standardChar?.history || []),
      ...beginnerHist.filter(p => p.name && ALL_CHARACTERS.has(p.name))
    ];
    const weapHist = [
      ...(state.profile.weapon?.history || []),
      ...(state.profile.standardWeap?.history || []),
      ...beginnerHist.filter(p => p.name && !ALL_CHARACTERS.has(p.name))
    ];

    const countUniqueOwned = (h, r, isChar) =>
      new Set(h.filter(p => p.rarity === r && p.name && (isChar ? ALL_CHARACTERS.has(p.name) : !ALL_CHARACTERS.has(p.name))).map(p => p.name)).size;

    const c5 = countUniqueOwned(charHist, 5, true);
    const c4 = countUniqueOwned(charHist, 4, true);
    const w5 = countUniqueOwned(weapHist, 5, false);
    const w4 = countUniqueOwned(weapHist, 4, false);
    const w3 = countUniqueOwned(weapHist, 3, false);
    const w2 = countUniqueOwned(weapHist, 2, false);
    const w1 = countUniqueOwned(weapHist, 1, false);

    const newestRes = [...new Set(
      charHist.filter(p => (p.rarity === 5 || p.rarity === 4) && p.name && ALL_CHARACTERS.has(p.name)).map(p => p.name)
    )].reverse();

    const fiveStarPulls = [...charHist, ...weapHist].filter(p => p.rarity === 5 && p.pity > 0);

    const histBuckets = {};
    fiveStarPulls.forEach(p => {
      if (p.pity > 80) {
        histBuckets['81+'] = (histBuckets['81+'] ?? 0) + 1;
      } else {
        const b = Math.floor((p.pity - 1) / 10) * 10 + 1;
        histBuckets[`${b}-${b + 9}`] = (histBuckets[`${b}-${b + 9}`] ?? 0) + 1;
      }
    });

    const histLabels = Array.from({ length: 8 }, (_, i) => `${i * 10 + 1}-${(i + 1) * 10}`);
    if (histBuckets['81+']) histLabels.push('81+');
    histLabels.forEach(b => { if (!histBuckets[b]) histBuckets[b] = 0; });

    const histSummary = fiveStarPulls.length >= 2 ? {
      max: Math.max(...Object.values(histBuckets), 1),
      avg: (fiveStarPulls.reduce((s, p) => s + p.pity, 0) / fiveStarPulls.length).toFixed(1),
      lo: Math.min(...fiveStarPulls.map(p => p.pity)),
      hi: Math.max(...fiveStarPulls.map(p => p.pity))
    } : null;
    const sts = [
      {l:'Avg Pity',v:overallStats?.avgPity??'--',c:'#edaf18'},
      {l:'Total Convenes',v:overallStats?.totalPulls?.toLocaleString()??'--',c:'#e2e8f0'},
      {l:'5-Star',v:String(overallStats?.fiveStars??'--'),c:'#c084fc'},
      {l:'50/50 Win',v:overallStats?.winRate?overallStats.winRate+'%':'--',c:'#4ade80'},
      {l:'Won',v:String(overallStats?.won5050??'--'),c:'#4ade80'},
      {l:'Lost',v:String(overallStats?.lost5050??'--'),c:'#f87171'},
    ];

    // Per-banner breakdown data
    const featHist = state.profile.featured?.history||[];
    const weapBannerHist = state.profile.weapon?.history||[];
    const stdCHist = state.profile.standardChar?.history||[];
    const stdWHist = state.profile.standardWeap?.history||[];
    const bgnHist = state.profile.beginner?.history||[];
    const bannerStats = [
      {l:'Featured',v:String(featHist.length),c:'#edaf18',s:featHist.filter(p=>p.rarity===5).length+' ★5'},
      {l:'Weapon',v:String(weapBannerHist.length),c:'#c084fc',s:weapBannerHist.filter(p=>p.rarity===5).length+' ★5'},
      {l:'Std. Char',v:String(stdCHist.length),c:'#60a5fa',s:stdCHist.filter(p=>p.rarity===5).length+' ★5'},
      {l:'Std. Weap',v:String(stdWHist.length),c:'#60a5fa',s:stdWHist.filter(p=>p.rarity===5).length+' ★5'},
      {l:'Beginner',v:String(bgnHist.length),c:'#34d399',s:bgnHist.filter(p=>p.rarity===5).length+' ★5'},
    ];

    // ═══ DRAWING PRIMITIVES ═══
    // Outer card — .kuro-card
    const drawShell = (x,y,w,h) => {
      ctx.fillStyle='rgba(12,16,24,0.8)';rr(x,y,w,h,24);ctx.fill();
      ctx.strokeStyle='rgba(255,255,255,0.14)';ctx.lineWidth=1.5;rr(x,y,w,h,24);ctx.stroke();
      const il=ctx.createLinearGradient(x,y,x,y+3);il.addColorStop(0,'rgba(255,255,255,0.07)');il.addColorStop(1,'transparent');
      ctx.fillStyle=il;ctx.fillRect(x+24,y+1,w-48,2);
      const sh=ctx.createLinearGradient(x,0,x+w,0);
      sh.addColorStop(0,'transparent');sh.addColorStop(0.2,'rgba(255,255,255,0.35)');sh.addColorStop(0.5,'rgba(255,255,255,0.55)');sh.addColorStop(0.8,'rgba(255,255,255,0.35)');sh.addColorStop(1,'transparent');
      ctx.fillStyle=sh;ctx.fillRect(x+24,y,w-48,1.5);
      ctx.strokeStyle='rgba(255,255,255,0.18)';ctx.lineWidth=1.5;
      ctx.beginPath();ctx.moveTo(x+w-12-18,y+12);ctx.lineTo(x+w-12,y+12);ctx.lineTo(x+w-12,y+12+18);ctx.stroke();
      ctx.strokeStyle='rgba(255,255,255,0.14)';
      ctx.beginPath();ctx.moveTo(x+12+18,y+h-12);ctx.lineTo(x+12,y+h-12);ctx.lineTo(x+12,y+h-12-18);ctx.stroke();
    };

    // Header
    const drawHeader = (x,y,w) => {
      const hH=54;
      const hg=ctx.createLinearGradient(x,y,x+w,y);
      hg.addColorStop(0,'rgba(255,255,255,0.02)');hg.addColorStop(0.4,'transparent');hg.addColorStop(0.6,'transparent');hg.addColorStop(1,'rgba(255,255,255,0.02)');
      ctx.fillStyle=hg;ctx.fillRect(x,y,w,hH);
      ctx.strokeStyle='rgba(255,255,255,0.10)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x,y+hH);ctx.lineTo(x+w,y+hH);ctx.stroke();
      const gb=ctx.createLinearGradient(0,y+15,0,y+15+26);gb.addColorStop(0,'rgba(237,175,24,0.9)');gb.addColorStop(1,'rgba(237,175,24,0.4)');
      ctx.fillStyle=gb;rr(x+18,y+15,4,26,2);ctx.fill();
      ctx.shadowColor='rgba(237,175,24,0.3)';ctx.shadowBlur=12;rr(x+18,y+15,4,26,2);ctx.fill();ctx.shadowColor='transparent';ctx.shadowBlur=0;
      ctx.fillStyle='#f1f5f9';ctx.font='600 18px sans-serif';ctx.fillText('RESONATOR ID',x+32,y+34);
      ctx.fillStyle='#4b5563';ctx.font='14px sans-serif';ctx.textAlign='right';ctx.fillText('whisperingwishes.app',x+w-18,y+34);ctx.textAlign='left';
      return hH;
    };

    // Section panel with gold bar label
    const drawPanel = (x,y,w,h,label) => {
      ctx.fillStyle='rgba(10,14,22,0.55)';rr(x,y,w,h,15);ctx.fill();
      ctx.strokeStyle='rgba(255,255,255,0.14)';ctx.lineWidth=1.5;rr(x,y,w,h,15);ctx.stroke();
      const ps=ctx.createLinearGradient(x,0,x+w,0);ps.addColorStop(0,'transparent');ps.addColorStop(0.3,'rgba(255,255,255,0.18)');ps.addColorStop(0.5,'rgba(255,255,255,0.3)');ps.addColorStop(0.7,'rgba(255,255,255,0.18)');ps.addColorStop(1,'transparent');
      ctx.fillStyle=ps;ctx.fillRect(x+12,y,w-24,1.5);
      ctx.strokeStyle='rgba(255,255,255,0.14)';ctx.lineWidth=1;
      ctx.beginPath();ctx.moveTo(x+w-9-12,y+6);ctx.lineTo(x+w-9,y+6);ctx.lineTo(x+w-9,y+6+12);ctx.stroke();
      ctx.beginPath();ctx.moveTo(x+9+12,y+h-6);ctx.lineTo(x+9,y+h-6);ctx.lineTo(x+9,y+h-6-12);ctx.stroke();
      if(label){
        const gb2=ctx.createLinearGradient(0,y+12,0,y+12+20);gb2.addColorStop(0,'rgba(237,175,24,0.8)');gb2.addColorStop(1,'rgba(237,175,24,0.3)');
        ctx.fillStyle=gb2;rr(x+15,y+12,3.5,20,1.5);ctx.fill();
        ctx.fillStyle='#e2e8f0';ctx.font='600 17px sans-serif';ctx.fillText(label,x+26,y+28);
        return 39;
      }
      return 9;
    };

    // .kuro-stat cell
    const drawStat = (x,y,w,h,val,lab,col,fs) => {
      ctx.fillStyle='rgba(10,14,22,0.8)';rr(x,y,w,h,12);ctx.fill();
      ctx.strokeStyle='rgba(255,255,255,0.20)';ctx.lineWidth=1;rr(x,y,w,h,12);ctx.stroke();
      const ss=ctx.createLinearGradient(x,0,x+w,0);ss.addColorStop(0,'transparent');ss.addColorStop(0.5,'rgba(255,255,255,0.40)');ss.addColorStop(1,'transparent');
      ctx.fillStyle=ss;ctx.fillRect(x+6,y,w-12,1.5);
      const f=Math.round((fs||24)*1.1);
      ctx.fillStyle=col;ctx.font=`bold ${f}px monospace`;ctx.textAlign='center';ctx.fillText(val,x+w/2,y+h*0.48);
      ctx.fillStyle='#9ca3af';ctx.font=`${Math.max(11,Math.round(f*0.5))}px sans-serif`;ctx.fillText(lab,x+w/2,y+h*0.78);ctx.textAlign='left';
    };

    // Resonator portrait — collection-panel style: tall card with image + gradient name overlay
    const drawResPortrait = (x,y,cellW,cellH,name,img) => {
      ctx.fillStyle='rgba(10,14,22,0.9)';rr(x,y,cellW,cellH,9);ctx.fill();
      ctx.strokeStyle='rgba(255,255,255,0.15)';ctx.lineWidth=1;rr(x,y,cellW,cellH,9);ctx.stroke();
      if(img){
        ctx.save();rr(x+1,y+1,cellW-2,cellH-2,8);ctx.clip();
        const f=getImageFraming('collection-'+name);
        const sc=f.zoom/100;
        // Preserve aspect ratio (object-contain): fit image inside cell
        const imgAR=img.naturalWidth/img.naturalHeight;
        const cellAR=cellW/cellH;
        let bw2,bh2;
        if(imgAR>cellAR){bw2=cellW;bh2=cellW/imgAR;}else{bh2=cellH;bw2=cellH*imgAR;}
        const dw=bw2*sc,dh=bh2*sc;
        const dx=x+(cellW-dw)/2-(f.x/100)*bw2*sc;
        const dy=y+(cellH-dh)/2-(f.y/100)*bh2*sc;
        ctx.drawImage(img,dx,dy,dw,dh);
        ctx.restore();
        const fade=ctx.createLinearGradient(0,y+cellH-33,0,y+cellH);
        fade.addColorStop(0,'rgba(0,0,0,0)');fade.addColorStop(1,'rgba(0,0,0,0.85)');
        ctx.save();rr(x+1,y+1,cellW-2,cellH-2,8);ctx.clip();
        ctx.fillStyle=fade;ctx.fillRect(x+1,y+cellH-33,cellW-2,32);
        ctx.restore();
      } else {
        ctx.fillStyle='#4b5563';ctx.font=Math.max(14,Math.round(cellW*0.3))+'px sans-serif';
        ctx.textAlign='center';ctx.fillText(name[0],x+cellW/2,y+cellH/2+6);ctx.textAlign='left';
      }
      ctx.fillStyle='#e5e7eb';ctx.font='11px sans-serif';ctx.textAlign='center';
      const ml=Math.floor(cellW/5.5);
      ctx.fillText(name.length>ml?name.slice(0,ml-1)+'..':name,x+cellW/2,y+cellH-5);ctx.textAlign='left';
    };

    // Draw icon using canvas path primitives — guaranteed to render (no font/Unicode dependency)
    const drawIconPath = (icx,icy,r,iconName,color) => {
      ctx.save();ctx.fillStyle=color;ctx.strokeStyle=color;
      ctx.lineWidth=Math.max(1.5,r*0.15);ctx.lineCap='round';ctx.lineJoin='round';
      const s=r*0.65;
      switch(iconName){
        case 'Crown':{ctx.beginPath();ctx.moveTo(icx-s,icy+s*0.5);ctx.lineTo(icx-s*0.9,icy-s*0.3);ctx.lineTo(icx-s*0.4,icy+s*0.05);ctx.lineTo(icx,icy-s*0.6);ctx.lineTo(icx+s*0.4,icy+s*0.05);ctx.lineTo(icx+s*0.9,icy-s*0.3);ctx.lineTo(icx+s,icy+s*0.5);ctx.closePath();ctx.fill();break;}
        case 'Sparkles':{ctx.beginPath();for(let i=0;i<8;i++){const a=(i*Math.PI/4)-Math.PI/2,rd=i%2===0?s:s*0.3;const px=icx+Math.cos(a)*rd,py=icy+Math.sin(a)*rd;i===0?ctx.moveTo(px,py):ctx.lineTo(px,py);}ctx.closePath();ctx.fill();break;}
        case 'Heart':{const ht=s*0.9;ctx.beginPath();ctx.moveTo(icx,icy+ht*0.55);ctx.bezierCurveTo(icx-ht*1.1,icy-ht*0.2,icx-ht*0.5,icy-ht*0.9,icx,icy-ht*0.3);ctx.bezierCurveTo(icx+ht*0.5,icy-ht*0.9,icx+ht*1.1,icy-ht*0.2,icx,icy+ht*0.55);ctx.fill();break;}
        case 'Swords':{ctx.lineWidth=r*0.18;ctx.beginPath();ctx.moveTo(icx-s*0.7,icy-s*0.7);ctx.lineTo(icx+s*0.7,icy+s*0.7);ctx.moveTo(icx+s*0.7,icy-s*0.7);ctx.lineTo(icx-s*0.7,icy+s*0.7);ctx.stroke();break;}
        case 'Sword':{ctx.lineWidth=r*0.15;ctx.beginPath();ctx.moveTo(icx,icy-s*0.8);ctx.lineTo(icx,icy+s*0.6);ctx.moveTo(icx-s*0.35,icy-s*0.1);ctx.lineTo(icx+s*0.35,icy-s*0.1);ctx.stroke();ctx.beginPath();ctx.arc(icx,icy+s*0.7,s*0.12,0,Math.PI*2);ctx.fill();break;}
        case 'Shield':{ctx.beginPath();ctx.moveTo(icx,icy-s*0.75);ctx.lineTo(icx+s*0.7,icy-s*0.35);ctx.lineTo(icx+s*0.55,icy+s*0.25);ctx.quadraticCurveTo(icx,icy+s*0.85,icx,icy+s*0.85);ctx.quadraticCurveTo(icx,icy+s*0.85,icx-s*0.55,icy+s*0.25);ctx.lineTo(icx-s*0.7,icy-s*0.35);ctx.closePath();ctx.fill();break;}
        case 'Gift':{ctx.fillStyle=color;rr(icx-s*0.55,icy-s*0.15,s*1.1,s*0.8,2);ctx.fill();rr(icx-s*0.65,icy-s*0.45,s*1.3,s*0.35,2);ctx.fill();ctx.fillStyle='rgba(255,255,255,0.4)';ctx.fillRect(icx-s*0.06,icy-s*0.45,s*0.12,s*1.25);ctx.fillRect(icx-s*0.65,icy-s*0.35,s*1.3,s*0.1);break;}
        case 'Zap':{ctx.beginPath();ctx.moveTo(icx+s*0.15,icy-s*0.8);ctx.lineTo(icx-s*0.3,icy+s*0.05);ctx.lineTo(icx+s*0.05,icy+s*0.05);ctx.lineTo(icx-s*0.15,icy+s*0.8);ctx.lineTo(icx+s*0.3,icy-s*0.05);ctx.lineTo(icx-s*0.05,icy-s*0.05);ctx.closePath();ctx.fill();break;}
        case 'Clover':{const cr=s*0.28;ctx.beginPath();ctx.arc(icx,icy-cr,cr,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(icx-cr*0.87,icy+cr*0.5,cr,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(icx+cr*0.87,icy+cr*0.5,cr,0,Math.PI*2);ctx.fill();ctx.lineWidth=r*0.1;ctx.beginPath();ctx.moveTo(icx,icy+cr*0.4);ctx.lineTo(icx,icy+s*0.8);ctx.stroke();break;}
        case 'Flame':{ctx.beginPath();ctx.moveTo(icx,icy-s*0.8);ctx.bezierCurveTo(icx+s*0.6,icy-s*0.3,icx+s*0.5,icy+s*0.4,icx,icy+s*0.7);ctx.bezierCurveTo(icx-s*0.5,icy+s*0.4,icx-s*0.6,icy-s*0.3,icx,icy-s*0.8);ctx.fill();break;}
        case 'Target':{ctx.lineWidth=r*0.12;ctx.beginPath();ctx.arc(icx,icy,s*0.7,0,Math.PI*2);ctx.stroke();ctx.beginPath();ctx.arc(icx,icy,s*0.4,0,Math.PI*2);ctx.stroke();ctx.beginPath();ctx.arc(icx,icy,s*0.12,0,Math.PI*2);ctx.fill();break;}
        case 'AlertCircle':{ctx.lineWidth=r*0.12;ctx.beginPath();ctx.arc(icx,icy,s*0.7,0,Math.PI*2);ctx.stroke();ctx.fillRect(icx-s*0.07,icy-s*0.35,s*0.14,s*0.4);ctx.beginPath();ctx.arc(icx,icy+s*0.32,s*0.08,0,Math.PI*2);ctx.fill();break;}
        case 'TrendingUp':{ctx.lineWidth=r*0.15;ctx.beginPath();ctx.moveTo(icx-s*0.7,icy+s*0.35);ctx.lineTo(icx-s*0.1,icy-s*0.15);ctx.lineTo(icx+s*0.2,icy+s*0.1);ctx.lineTo(icx+s*0.7,icy-s*0.4);ctx.stroke();ctx.beginPath();ctx.moveTo(icx+s*0.3,icy-s*0.4);ctx.lineTo(icx+s*0.7,icy-s*0.4);ctx.lineTo(icx+s*0.7,icy);ctx.stroke();break;}
        case 'TrendingDown':{ctx.lineWidth=r*0.15;ctx.beginPath();ctx.moveTo(icx-s*0.7,icy-s*0.35);ctx.lineTo(icx-s*0.1,icy+s*0.15);ctx.lineTo(icx+s*0.2,icy-s*0.1);ctx.lineTo(icx+s*0.7,icy+s*0.4);ctx.stroke();ctx.beginPath();ctx.moveTo(icx+s*0.3,icy+s*0.4);ctx.lineTo(icx+s*0.7,icy+s*0.4);ctx.lineTo(icx+s*0.7,icy);ctx.stroke();break;}
        case 'Fish':{ctx.beginPath();ctx.moveTo(icx+s*0.6,icy);ctx.quadraticCurveTo(icx,icy-s*0.5,icx-s*0.45,icy);ctx.quadraticCurveTo(icx,icy+s*0.5,icx+s*0.6,icy);ctx.fill();ctx.beginPath();ctx.moveTo(icx-s*0.45,icy);ctx.lineTo(icx-s*0.75,icy-s*0.3);ctx.lineTo(icx-s*0.75,icy+s*0.3);ctx.closePath();ctx.fill();break;}
        case 'Diamond':{ctx.beginPath();ctx.moveTo(icx,icy-s*0.7);ctx.lineTo(icx+s*0.5,icy);ctx.lineTo(icx,icy+s*0.7);ctx.lineTo(icx-s*0.5,icy);ctx.closePath();ctx.fill();break;}
        case 'Gamepad2':{rr(icx-s*0.6,icy-s*0.25,s*1.2,s*0.5,s*0.15);ctx.fill();ctx.fillStyle='rgba(0,0,0,0.3)';ctx.beginPath();ctx.arc(icx-s*0.28,icy,s*0.12,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(icx+s*0.28,icy,s*0.12,0,Math.PI*2);ctx.fill();break;}
        case 'Star':{ctx.beginPath();for(let i=0;i<10;i++){const a=(i*Math.PI/5)-Math.PI/2,rd=i%2===0?s*0.75:s*0.3;const px=icx+Math.cos(a)*rd,py=icy+Math.sin(a)*rd;i===0?ctx.moveTo(px,py):ctx.lineTo(px,py);}ctx.closePath();ctx.fill();break;}
        case 'Trophy':{ctx.beginPath();ctx.moveTo(icx-s*0.45,icy-s*0.5);ctx.lineTo(icx+s*0.45,icy-s*0.5);ctx.lineTo(icx+s*0.3,icy+s*0.1);ctx.quadraticCurveTo(icx,icy+s*0.35,icx-s*0.3,icy+s*0.1);ctx.closePath();ctx.fill();ctx.fillRect(icx-s*0.07,icy+s*0.1,s*0.14,s*0.25);rr(icx-s*0.25,icy+s*0.35,s*0.5,s*0.12,2);ctx.fill();break;}
        default:{ctx.beginPath();for(let i=0;i<10;i++){const a=(i*Math.PI/5)-Math.PI/2,rd=i%2===0?s*0.75:s*0.3;const px=icx+Math.cos(a)*rd,py=icy+Math.sin(a)*rd;i===0?ctx.moveTo(px,py):ctx.lineTo(px,py);}ctx.closePath();ctx.fill();break;}
      }
      ctx.restore();
    };

    // Trophy card — flat dark cell style with trophy color accents
    const drawTrophy = (x,y,size,t) => {
      const tc=t.color||'#9ca3af';
      // Dark fill base
      ctx.fillStyle='rgba(10,14,22,0.8)';rr(x,y,size,size,12);ctx.fill();
      // Colored gradient overlay (stronger tint so color is clearly visible)
      const bg2=ctx.createLinearGradient(x,y,x+size,y+size);
      bg2.addColorStop(0,tc+'30');bg2.addColorStop(1,tc+'12');
      ctx.fillStyle=bg2;rr(x,y,size,size,12);ctx.fill();
      // Colored border
      ctx.strokeStyle=tc+'50';ctx.lineWidth=1;rr(x,y,size,size,12);ctx.stroke();
      // Colored shimmer top line
      const ss=ctx.createLinearGradient(x,0,x+size,0);
      ss.addColorStop(0,'transparent');ss.addColorStop(0.5,tc+'60');ss.addColorStop(1,'transparent');
      ctx.fillStyle=ss;ctx.fillRect(x+6,y,size-12,1.5);
      // Icon — centered, with colored glow for premium look
      const iconR=size*0.28;
      ctx.save();
      ctx.shadowColor=tc;ctx.shadowBlur=Math.max(12,size*0.1);
      drawIconPath(x+size/2,y+size*0.38,iconR,t.icon,tc);
      ctx.restore();
      // Name — white bold, centered
      const nameFontSize=Math.max(10,Math.floor(size*0.12));
      ctx.fillStyle='#ffffff';ctx.font=`bold ${nameFontSize}px sans-serif`;
      const maxW=size-14;
      let nameText=t.name;
      if(ctx.measureText(nameText).width>maxW){
        while(nameText.length>1&&ctx.measureText(nameText+'..').width>maxW)nameText=nameText.slice(0,-1);
        nameText=nameText+'..';
      }
      ctx.textAlign='center';ctx.fillText(nameText,x+size/2,y+size*0.78);
      ctx.textAlign='left';
    };

    // Hero profile image — large, with collection-style framing and gradient fade
    const drawHero = (x,y,w,h) => {
      ctx.fillStyle='rgba(8,12,18,0.95)';rr(x,y,w,h,15);ctx.fill();
      ctx.strokeStyle='rgba(255,255,255,0.18)';ctx.lineWidth=1.5;rr(x,y,w,h,15);ctx.stroke();
      if(pImg){
        ctx.save();rr(x+2,y+2,w-4,h-4,14);ctx.clip();
        const f=picName?getImageFraming('collection-'+picName):{zoom:100,x:0,y:0};
        const sc=f.zoom/100;
        // Preserve aspect ratio (object-contain)
        const imgAR=pImg.naturalWidth/pImg.naturalHeight;
        const cellAR=w/h;
        let bw2,bh2;
        if(imgAR>cellAR){bw2=w;bh2=w/imgAR;}else{bh2=h;bw2=h*imgAR;}
        const dw=bw2*sc,dh=bh2*sc;
        const dx=x+(w-dw)/2-(f.x/100)*bw2*sc;
        const dy=y+(h-dh)/2-(f.y/100)*bh2*sc;
        ctx.drawImage(pImg,dx,dy,dw,dh);
        ctx.restore();
        const fade=ctx.createLinearGradient(0,y+h-90,0,y+h);
        fade.addColorStop(0,'rgba(8,12,18,0)');fade.addColorStop(1,'rgba(8,12,18,0.9)');
        ctx.fillStyle=fade;ctx.fillRect(x+2,y+h-90,w-4,88);
      } else if(appIco){
        const sz=Math.min(w,h)*0.3;ctx.globalAlpha=0.08;ctx.drawImage(appIco,x+(w-sz)/2,y+(h-sz)/2,sz,sz);ctx.globalAlpha=1;
      }
      if(picName){ctx.fillStyle='rgba(255,255,255,0.6)';ctx.font='14px sans-serif';ctx.textAlign='center';ctx.fillText(picName,x+w/2,y+h-9);ctx.textAlign='left';}
    };

    // Luck bar
    const drawLuck = (x,y,w) => {
      if(!lr)return 0;
      rr(x,y,w,12,6);ctx.fillStyle='rgba(10,14,22,0.8)';ctx.fill();
      ctx.strokeStyle='rgba(255,255,255,0.10)';ctx.lineWidth=1;rr(x,y,w,12,6);ctx.stroke();
      const fw=Math.max(6,Math.min(lr.percentile||50,100)/100*w);
      ctx.save();rr(x,y,w,12,6);ctx.clip();
      const g=ctx.createLinearGradient(x,0,x+w,0);g.addColorStop(0,'#f87171');g.addColorStop(0.5,'#edaf18');g.addColorStop(1,'#34d399');
      ctx.fillStyle=g;rr(x,y,fw,12,6);ctx.fill();ctx.restore();
      ctx.fillStyle='rgba(10,14,22,0.85)';rr(x+w+9,y-5,105,21,6);ctx.fill();
      ctx.strokeStyle=(lr.color||'#edaf18')+'60';ctx.lineWidth=1;rr(x+w+9,y-5,105,21,6);ctx.stroke();
      ctx.fillStyle=lr.color||'#edaf18';ctx.font='bold 14px monospace';ctx.textAlign='center';ctx.fillText(lr.tier+' '+lr.rating,x+w+61,y+10);ctx.textAlign='left';
      return 27;
    };

    // Stats grid 3x2
    const drawStats = (sx,sy,gw,ch2,fs) => {
      const g2=8,cols=3,cw2=(gw-(cols-1)*g2)/cols;
      sts.forEach((s,i)=>{const col=i%cols,row=Math.floor(i/cols);drawStat(sx+col*(cw2+g2),sy+row*(ch2+g2),cw2,ch2,s.v,s.l,s.c,fs);});
      return (ch2+g2)*2-g2;
    };

    // Resonator portraits grid — collection-panel style (tall cards, fills width)
    const drawResTags = (rx,ry,mw,cols,max) => {
      const ch2=newestRes.slice(0,max);if(!ch2.length)return 0;
      const g2=6,cellW=(mw-(cols-1)*g2)/cols,cellH=Math.round(cellW*1.6);
      ch2.forEach((n,i)=>{drawResPortrait(rx+(i%cols)*(cellW+g2),ry+Math.floor(i/cols)*(cellH+g2),cellW,cellH,n,resImgs[n]);});
      const rows=Math.ceil(ch2.length/cols);let h2=rows*(cellH+g2)-g2;
      if(newestRes.length>max){ctx.fillStyle='#4b5563';ctx.font='14px sans-serif';ctx.fillText('+'+String(newestRes.length-max)+' more',rx,ry+h2+18);h2+=21;}
      return h2;
    };

    // Collection row
    const drawColl = (cx2,cy2,cw2) => {
      const items=[{l:'5* Res',o:c5,t:ALL_5STAR_RESONATORS.length,c:'#edaf18'},{l:'4* Res',o:c4,t:ALL_4STAR_RESONATORS.length,c:'#c084fc'},{l:'5* Wep',o:w5,t:ALL_5STAR_WEAPONS.length,c:'#edaf18'},{l:'4* Wep',o:w4,t:ALL_4STAR_WEAPONS.length,c:'#c084fc'},{l:'3* Wep',o:w3,t:ALL_3STAR_WEAPONS.length,c:'#60a5fa'},{l:'2* Wep',o:w2,t:ALL_2STAR_WEAPONS.length,c:'#4ade80'},{l:'1* Wep',o:w1,t:ALL_1STAR_WEAPONS.length,c:'#9ca3af'}];
      const g2=6,iw=(cw2-(items.length-1)*g2)/items.length;
      items.forEach((it,i)=>{drawStat(cx2+i*(iw+g2),cy2,iw,48,it.o+'/'+it.t,it.l,it.c,16);});
      return 48;
    };

    // Mini histogram — neon glow style matching Stats tab
    // Helper: draw bar path with only top corners rounded (flat bottom, like CSS rounded-t)
    const barPath = (bx,by,bw,bh2,r) => {
      ctx.beginPath();
      ctx.moveTo(bx+r,by);ctx.lineTo(bx+bw-r,by);
      ctx.quadraticCurveTo(bx+bw,by,bx+bw,by+r);
      ctx.lineTo(bx+bw,by+bh2);ctx.lineTo(bx,by+bh2);
      ctx.lineTo(bx,by+r);
      ctx.quadraticCurveTo(bx,by,bx+r,by);
      ctx.closePath();
    };
    const drawHisto = (hx,hy,hw,hh) => {
      if(!histSummary||!histLabels.length)return;
      const bg2=3,bw2=(hw-(histLabels.length-1)*bg2)/histLabels.length,area=hh-24;
      histLabels.forEach((lab,i)=>{
        const cnt=histBuckets[lab]||0,bh=histSummary.max>0?Math.max(5,(cnt/histSummary.max)*area):5;
        const bx2=hx+i*(bw2+bg2),by2=hy+area-bh;
        const bucket=parseInt(lab)||0;
        const bc=bucket<=20?'#22c55e':bucket<=40?'#4ade80':bucket<=50?'#edaf18':bucket<=60?'#f97316':'#ef4444';
        // Semi-transparent gradient fill with outer glow (single fill, no stacking)
        ctx.save();ctx.shadowColor=bc+'50';ctx.shadowBlur=12;
        const barGrad=ctx.createLinearGradient(0,by2+bh,0,by2);
        barGrad.addColorStop(0,bc+'40');barGrad.addColorStop(1,bc+'20');
        ctx.fillStyle=barGrad;barPath(bx2,by2,bw2,bh,3);ctx.fill();
        ctx.restore();
        // Border — top and sides only, no bottom (matches borderBottom: 'none')
        ctx.strokeStyle=bc+'90';ctx.lineWidth=1;
        ctx.beginPath();
        ctx.moveTo(bx2,by2+bh);ctx.lineTo(bx2,by2+3);
        ctx.quadraticCurveTo(bx2,by2,bx2+3,by2);
        ctx.lineTo(bx2+bw2-3,by2);
        ctx.quadraticCurveTo(bx2+bw2,by2,bx2+bw2,by2+3);
        ctx.lineTo(bx2+bw2,by2+bh);
        ctx.stroke();
        // Bottom glow line — full bar width (matches Stats tab bottom glow)
        if(cnt>0){ctx.save();ctx.shadowColor=bc;ctx.shadowBlur=8;ctx.fillStyle=bc;
        ctx.fillRect(bx2,by2+bh-2,bw2,2);ctx.restore();}
        // Count label with glow (matches textShadow: 0 0 8px ${color})
        if(cnt>0){ctx.save();ctx.shadowColor=bc;ctx.shadowBlur=8;ctx.fillStyle=bc;ctx.font='bold 13px sans-serif';ctx.textAlign='center';ctx.fillText(cnt,bx2+bw2/2,by2-5);ctx.textAlign='left';ctx.restore();}
        // Bottom label
        ctx.fillStyle='#6b7280';ctx.font='10px sans-serif';ctx.textAlign='center';ctx.fillText(lab.split('-')[0],bx2+bw2/2,hy+area+15);ctx.textAlign='left';
      });
    };

    // Banner Breakdown — per-banner pull count + 5★ count row
    const drawBannerRow = (bx2,by2,bw2,bh2) => {
      const g2=6,iw=(bw2-4*g2)/5;
      bannerStats.forEach((bs,i)=>{
        const sx=bx2+i*(iw+g2);
        // stat cell background
        ctx.fillStyle='rgba(10,14,22,0.8)';rr(sx,by2,iw,bh2,12);ctx.fill();
        ctx.strokeStyle='rgba(255,255,255,0.20)';ctx.lineWidth=1;rr(sx,by2,iw,bh2,12);ctx.stroke();
        const ss=ctx.createLinearGradient(sx,0,sx+iw,0);ss.addColorStop(0,'transparent');ss.addColorStop(0.5,'rgba(255,255,255,0.40)');ss.addColorStop(1,'transparent');
        ctx.fillStyle=ss;ctx.fillRect(sx+6,by2,iw-12,1.5);
        // Pull count (main value)
        ctx.fillStyle=bs.c;ctx.font='bold 22px monospace';ctx.textAlign='center';
        ctx.fillText(bs.v,sx+iw/2,by2+bh2*0.35);
        // 5★ sub-value
        ctx.fillStyle='#9ca3af';ctx.font='12px sans-serif';
        ctx.fillText(bs.s,sx+iw/2,by2+bh2*0.58);
        // Label
        ctx.fillStyle='#6b7280';ctx.font='11px sans-serif';
        ctx.fillText(bs.l,sx+iw/2,by2+bh2*0.8);
        ctx.textAlign='left';
      });
      return bh2;
    };

    // Footer
    const drawFooter = (x,y,w) => {
      ctx.strokeStyle='rgba(255,255,255,0.10)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+w,y);ctx.stroke();
      ctx.fillStyle='#4b5563';ctx.font='14px monospace';ctx.fillText('Generated '+new Date().toLocaleDateString(),x,y+18);
      ctx.textAlign='right';ctx.fillText('whisperingwishes.app',x+w,y+18);ctx.textAlign='left';
    };

    // ═══ RENDER ═══
    ctx.fillStyle='#080810';ctx.fillRect(0,0,W,H);
    const bgG=ctx.createRadialGradient(W*0.5,H*0.4,0,W*0.5,H*0.4,W*0.5);
    bgG.addColorStop(0,'rgba(237,175,24,0.008)');bgG.addColorStop(1,'transparent');
    ctx.fillStyle=bgG;ctx.fillRect(0,0,W,H);

    const M=18,ox=M,oy=M,ow=W-M*2,oh=H-M*2;
    drawShell(ox,oy,ow,oh);
    const hH=drawHeader(ox+1,oy+1,ow-2);
    const P=15,bx=ox+P,bw=ow-P*2;
    const footH=30;
    let Y=oy+1+hH+P;
    const bottomY=oy+oh-footH-P;

    if(!isPortrait){
      // ═══ LANDSCAPE 1920x1080 — content-adaptive ═══
      const gap=9;
      const leftW=Math.floor(bw*0.35);
      const rightX=bx+leftW+gap;
      const rightW=bw-leftW-gap;
      const contentH=bottomY-Y;

      // Hero image takes top of left column
      const heroH=Math.floor(contentH*0.32);
      drawHero(bx,Y,leftW,heroH);

      // Profile + Stats + Pity Distribution below hero — fills rest of left
      const idY=Y+heroH+gap;
      const idH=contentH-heroH-gap;
      const idOff=drawPanel(bx,idY,leftW,idH,'Profile');
      ctx.fillStyle='#f1f5f9';ctx.font='bold 30px sans-serif';ctx.fillText(uname,bx+15,idY+idOff+21);
      ctx.fillStyle='#9ca3af';ctx.font='14px sans-serif';ctx.fillText('UID',bx+15,idY+idOff+45);
      ctx.fillStyle='#e2e8f0';ctx.font='18px monospace';ctx.fillText(uid,bx+48,idY+idOff+45);
      ctx.fillStyle='#9ca3af';ctx.font='14px sans-serif';ctx.fillText('Server',bx+15,idY+idOff+66);
      ctx.fillStyle='#edaf18';ctx.font='18px monospace';ctx.fillText(svr,bx+72,idY+idOff+66);
      if(lr)drawLuck(bx+15,idY+idOff+87,leftW-135);
      const metaY=idY+idOff+(lr?117:90);
      ctx.fillStyle='#6b7280';ctx.font='12px sans-serif';
      let metaLine1='';
      if(tList.length>0)metaLine1+=tList.length+' Trophies';
      if(impDate)metaLine1+=(metaLine1?' · ':'')+impDate;
      if(metaLine1)ctx.fillText(metaLine1,bx+15,metaY);
      if(overallStats?.totalAstrite)ctx.fillText(overallStats.totalAstrite.toLocaleString()+' Astrite',bx+15,metaY+16);
      // Convene Stats inside profile panel
      const statCellH=36,statStartY=metaY+(overallStats?.totalAstrite?36:21);
      drawStats(bx+9,statStartY,leftW-18,statCellH,16);
      // Pity Distribution below stats inside profile panel
      const histoY=statStartY+(statCellH+8)*2-8+15;
      const histoH=idY+idH-histoY-9;
      if(histSummary&&histoH>40){
        ctx.strokeStyle='rgba(255,255,255,0.10)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(bx+15,histoY-6);ctx.lineTo(bx+leftW-15,histoY-6);ctx.stroke();
        ctx.fillStyle='#e2e8f0';ctx.font='600 13px sans-serif';ctx.fillText('Pity Distribution',bx+15,histoY+6);
        drawHisto(bx+9,histoY+15,leftW-18,histoH-15);
        ctx.fillStyle='#4b5563';ctx.font='11px sans-serif';ctx.textAlign='right';ctx.fillText('Lo '+histSummary.lo+' | Avg '+histSummary.avg+' | Hi '+histSummary.hi,bx+leftW-12,idY+idH-6);ctx.textAlign='left';
      }

      // ── Right column: Collection → Resonators → Trophies → Banner Breakdown ──
      const panelPad=39;
      const collH=panelPad+48+6;
      const trophyCols=Math.max(tList.length,1),trophyGap=8;
      const trophyCellSize=Math.min(160,Math.floor((rightW-18-(trophyCols-1)*trophyGap)/trophyCols));
      const trophyPanelH=panelPad+trophyCellSize+6;
      const bannerH=panelPad+72+6; // banner breakdown panel height

      const resCols=10,resGap2=6;
      const resMax=Math.min(newestRes.length,20);
      const resCellW=(rightW-18-(resCols-1)*resGap2)/resCols,resCellH=Math.round(resCellW*1.6);
      const resRows=Math.ceil(Math.max(resMax,1)/resCols);
      const resContentH=panelPad+resRows*(resCellH+resGap2)-resGap2+6+(newestRes.length>resMax?21:0);

      // Draw Row 1: Collection (full width)
      const cp1o=drawPanel(rightX,Y,rightW,collH,'Collection');
      drawColl(rightX+9,Y+cp1o,rightW-18);

      // Draw Row 2: Resonators — sized to content, fills width
      const r2Y=Y+collH+gap;
      const rp1o=drawPanel(rightX,r2Y,rightW,resContentH,'Resonators ('+newestRes.length+')');
      drawResTags(rightX+9,r2Y+rp1o,rightW-18,10,resMax);

      // Draw Row 3: Trophies — fixed height, centered
      const r3Y=r2Y+resContentH+gap;
      if(tList.length>0){
        const tp1o=drawPanel(rightX,r3Y,rightW,trophyPanelH,'Trophies ('+tList.length+')');
        tList.forEach((t,i)=>{drawTrophy(rightX+9+i*(trophyCellSize+trophyGap),r3Y+tp1o,trophyCellSize,t);});
      }

      // Draw Row 4: Banner Breakdown — fills remaining
      const r4Y=r3Y+(tList.length>0?trophyPanelH:0)+gap;
      const r4H=bottomY-r4Y;
      if(r4H>60){
        const bp1o=drawPanel(rightX,r4Y,rightW,r4H,'Convene Breakdown');
        drawBannerRow(rightX+9,r4Y+bp1o,rightW-18,r4H-bp1o-6);
      }

      drawFooter(bx,bottomY,bw);

    } else {
      // ═══ PORTRAIT 1080x1920 — content-adaptive ═══
      const gap=9;
      const contentH=bottomY-Y;

      // ── Top: Hero + Profile (with stats inside) side by side ──
      const heroW=Math.floor(bw*0.38);
      // Profile needs: panelPad(39) + name(30) + UID(24) + Server(24) + luck(27+18) + meta(18) + stats(2 rows * (51+8) - 8) = ~280
      const pStatCellH=51,pPad=39;
      const profileMinH=pPad+30+24+24+(lr?45:0)+18+(pStatCellH+8)*2-8+15;
      const heroH=Math.max(Math.floor(contentH*0.22),profileMinH);
      drawHero(bx,Y,heroW,heroH);

      const ix=bx+heroW+gap,iw=bw-heroW-gap;
      const idOff=drawPanel(ix,Y,iw,heroH,'Profile');
      ctx.fillStyle='#f1f5f9';ctx.font='bold 33px sans-serif';ctx.fillText(uname,ix+15,Y+idOff+21);
      const uidLY=Y+idOff+48;
      ctx.fillStyle='#9ca3af';ctx.font='14px sans-serif';ctx.fillText('UID',ix+15,uidLY);
      ctx.fillStyle='#e2e8f0';ctx.font='18px monospace';ctx.fillText(uid,ix+48,uidLY);
      ctx.fillStyle='#9ca3af';ctx.font='14px sans-serif';ctx.fillText('Server',ix+15,uidLY+24);
      ctx.fillStyle='#edaf18';ctx.font='18px monospace';ctx.fillText(svr,ix+72,uidLY+24);
      if(lr)drawLuck(ix+15,uidLY+51,iw-135);
      const metaY2=uidLY+(lr?84:57);
      ctx.fillStyle='#6b7280';ctx.font='12px sans-serif';
      let metaLine='';
      if(tList.length>0)metaLine+=tList.length+' Trophies';
      if(impDate)metaLine+=(metaLine?' · ':'')+impDate;
      if(overallStats?.totalAstrite)metaLine+=(metaLine?' · ':'')+overallStats.totalAstrite.toLocaleString()+' Astrite';
      if(metaLine)ctx.fillText(metaLine,ix+15,metaY2);
      // Convene Stats inside profile panel
      const pStatY=metaY2+30;
      drawStats(ix+9,pStatY,iw-18,pStatCellH,22);

      Y+=heroH+gap;

      // Pre-calculate content heights for adaptive layout
      const pCollH=pPad+48+6;
      const pHistoH=144;
      const pResCols=8,pResGap2=6;
      const pResMax=Math.min(newestRes.length,24);
      const pResCellW=(bw-18-(pResCols-1)*pResGap2)/pResCols,pResCellH=Math.round(pResCellW*1.6);
      const pResRows=Math.ceil(Math.max(pResMax,1)/pResCols);
      const pResContentH=pPad+pResRows*(pResCellH+pResGap2)-pResGap2+6+(newestRes.length>pResMax?21:0);
      const pTrophyCols=Math.max(tList.length,1),pTrophyGap=8;
      const pTrophySize=Math.min(200,Math.floor((bw-18-(pTrophyCols-1)*pTrophyGap)/pTrophyCols));
      const pTrophyPanelH=pPad+pTrophySize+6;
      const pBannerH=pPad+80+6; // banner breakdown

      // ── Pity Distribution ──
      const hp2o=drawPanel(bx,Y,bw,pHistoH,'Pity Distribution');
      if(histSummary){drawHisto(bx+9,Y+hp2o,bw-18,pHistoH-hp2o-12);
        ctx.fillStyle='#4b5563';ctx.font='11px sans-serif';ctx.textAlign='right';ctx.fillText('Low '+histSummary.lo+' | Avg '+histSummary.avg+' | High '+histSummary.hi,bx+bw-12,Y+pHistoH-5);ctx.textAlign='left';}
      Y+=pHistoH+gap;

      // ── Collection ──
      const cp2o=drawPanel(bx,Y,bw,pCollH,'Collection');
      drawColl(bx+9,Y+cp2o,bw-18);
      Y+=pCollH+gap;

      // ── Resonators — fills width ──
      const rp2o=drawPanel(bx,Y,bw,pResContentH,'Resonators ('+newestRes.length+')');
      drawResTags(bx+9,Y+rp2o,bw-18,8,pResMax);
      Y+=pResContentH+gap;

      // ── Trophies — fixed height, centered ──
      if(tList.length>0){
        const tp2o=drawPanel(bx,Y,bw,pTrophyPanelH,'Trophies ('+tList.length+')');
        tList.forEach((t,i)=>{drawTrophy(bx+9+i*(pTrophySize+pTrophyGap),Y+tp2o,pTrophySize,t);});
        Y+=pTrophyPanelH+gap;
      }

      // ── Banner Breakdown — fills remaining ──
      const pRemaining=bottomY-Y;
      if(pRemaining>60){
        const bp2o=drawPanel(bx,Y,bw,pRemaining,'Convene Breakdown');
        drawBannerRow(bx+9,Y+bp2o,bw-18,pRemaining-bp2o-6);
      }

      drawFooter(bx,bottomY,bw);
    }

    try {
      canvas.toBlob(blob=>{
        if(!blob)return;const url=URL.createObjectURL(blob);const a=document.createElement('a');
        a.href=url;a.download='resonator-id-'+(state.profile.username||state.profile.uid||'card')+(isPortrait?'-portrait':'')+'.png';
        a.click();URL.revokeObjectURL(url);toast?.addToast?.('ID Card saved!','success');
      },'image/png');
    } catch (e) {
      console.error('ID card export failed (possible CORS tainted canvas):', e);
      toast?.addToast?.('Failed to save ID card — try a different profile image', 'error');
    }
  }, [state.profile, state.server, overallStats, luckRating, ownedCharNames, collectionImages, toast, idCardFormat, trophies, getImageFraming]);

  return (
    <>
          <div role="tabpanel" id="tabpanel-profile" aria-labelledby="tab-profile" tabIndex="0">
          <TabErrorBoundary tabName="Profile">
          <div className="kuro-calc space-y-3 tab-content">
            <TabBackground id="profile" />

            {/* E2-FP3: Resonator Profile moved above Server Region (identity first) */}
            <Card>
              <CardHeader><User size={14} className="text-cyan-400" /> Resonator Profile</CardHeader>
              <CardBody className="space-y-3">
                {/* Username */}
                <div>
                  <label htmlFor="profile-display-name" className="text-gray-400 text-[10px] block mb-2">Display Name</label>
                  <input
                    id="profile-display-name"
                    type="text"
                    value={state.profile.username}
                    onChange={e => dispatch({ type: 'SET_USERNAME', value: e.target.value.slice(0, MAX_USERNAME_LENGTH) })}
                    placeholder="Enter your name..."
                    maxLength={MAX_USERNAME_LENGTH}
                    className="kuro-input w-full"
                  />
                  {/* AUDIT-FIX H12: gray-600→gray-500 for WCAG AA contrast */}
                  <p className="text-gray-400 text-[10px] mt-0.5 text-right">{state.profile.username.length}/{MAX_USERNAME_LENGTH}</p>
                </div>

                {/* Profile Picture — current selection */}
                <div>
                  <label className="text-gray-400 text-[10px] block mb-2">Profile Picture</label>
                  <div className="flex items-center gap-3">
                    <div className={`w-14 h-14 rounded-lg flex-shrink-0${CHARACTER_DATA[state.profile.profilePic]?.rarity === 5 ? ' holo-5star' : ''}`} style={{ background: 'var(--bg-stat)', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 4px 12px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)', contain: 'paint', position: 'relative', overflow: 'hidden' }}>
                      {state.profile.profilePic && collectionImages[state.profile.profilePic] ? (() => {
                        const f = getImageFraming(`collection-${state.profile.profilePic}`);
                        return <div className="w-full h-full breath-zoom"><img src={collectionImages[state.profile.profilePic]} alt={state.profile.profilePic} className="w-full h-full object-contain" style={{ transform: `scale(${f.zoom / 100}) translate(${-f.x}%, ${-f.y}%)` }} loading="lazy" onError={hideOnError} /></div>;
                      })() : (
                        <img src={HEADER_ICON} alt="Default" className="w-full h-full object-contain bg-neutral-800 p-1" loading="lazy" onError={hideOnError} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-200 text-xs truncate">{state.profile.profilePic || 'Default icon'}</p>
                      <p className="text-gray-400 text-[10px] mt-0.5">Tap the <Crown size={12} className="inline text-yellow-400" /> icon on any owned card in the Collection tab</p>
                      {state.profile.profilePic && (
                        <button
                          onClick={() => dispatch({ type: 'SET_PROFILE_PIC', value: '' })}
                          className="text-red-400/70 text-[10px] hover:text-red-400 mt-0.5"
                        >Reset to default</button>
                      )}
                    </div>
                  </div>
                </div>

                {/* View ID Card Button */}
                <button
                  onClick={() => setShowIdCard(true)}
                  className="kuro-btn kuro-btn-hero w-full text-xs flex items-center justify-center gap-2"
                >
                  <Award size={14} /> View Resonator ID Card
                </button>
              </CardBody>
            </Card>

            {/* Server Region */}
            <Card>
              <CardHeader>Server Region</CardHeader>
              <CardBody>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-1">
                  {Object.keys(SERVERS).map(s => (
                    <button key={s} onClick={() => dispatch({ type: 'SET_SERVER', server: s })} aria-pressed={state.server === s} className={`kuro-btn min-h-[44px] py-2 text-[10px] font-medium ${state.server === s ? 'active-gold' : ''}`}>{s}</button>
                  ))}
                </div>
                <p className="text-gray-400 text-[10px] mt-2 text-center mx-auto" style={{maxWidth: 'none'}}>Reset: 4:00 AM (UTC{getServerOffset(state.server) >= 0 ? '+' : ''}{getServerOffset(state.server)})</p>
              </CardBody>
            </Card>

            {/* Settings + Import — side by side on desktop */}
            <div className="desktop-grid-2 space-y-3 lg:space-y-0">
            {/* Display Settings */}
            <Card>
              <CardHeader><Settings size={14} className="text-gray-400" /> Display Settings</CardHeader>
              <CardBody className="space-y-3">
                {/* OLED Mode Toggle */}
                <div className="flex items-center justify-between p-3 rounded-lg border border-[var(--border-medium)] bg-white/5">
                  <div className="flex items-center gap-3">
                    <div className={`w-[28px] h-[28px] rounded-lg flex items-center justify-center ${visualSettings.oledMode ? 'bg-white text-black' : 'text-gray-400'}`} style={!visualSettings.oledMode ? { background: 'var(--bg-btn)' } : undefined}>
                      <Monitor size={16} />
                    </div>
                    <div>
                      <div className="text-white text-xs font-medium">OLED Mode</div>
                      <div className="text-gray-400 text-[10px]">True black (#000) for OLED screens</div>
                    </div>
                  </div>
                  {/* AUDIT-FIX M22: OLED-aware toggle track */}
                  <button
                    onClick={() => saveVisualSettings({ ...visualSettings, oledMode: !visualSettings.oledMode })}
                    className="relative w-[52px] h-[24px] rounded-full transition-colors"
                    style={{ background: visualSettings.oledMode ? '#fff' : 'var(--bg-btn)' }}
                    role="switch"
                    aria-checked={visualSettings.oledMode}
                    aria-label="Toggle OLED mode"
                  >
                    <div className={`absolute top-[4px] w-[16px] h-[16px] rounded-full transition-all ${visualSettings.oledMode ? 'left-[32px] bg-black' : 'left-[4px] bg-gray-400'}`} />
                  </button>
                </div>
                {visualSettings.oledMode && (
                  <p className="text-emerald-400 text-[10px] text-center">✓ OLED mode active - saves battery on OLED displays</p>
                )}

                {/* Dyslexic Font Toggle */}
                <div className="flex items-center justify-between p-3 rounded-lg border border-[var(--border-medium)] bg-white/5">
                  <div className="flex items-center gap-3">
                    <div className={`w-[28px] h-[28px] rounded-lg flex items-center justify-center ${visualSettings.dyslexicFont ? 'bg-amber-500 text-white' : 'text-gray-400'}`} style={!visualSettings.dyslexicFont ? { background: 'var(--bg-btn)' } : undefined}>
                      <Type size={16} />
                    </div>
                    <div>
                      <div className="text-white text-xs font-medium">Accessibility Font</div>
                      <div className="text-gray-400 text-[10px]">OpenDyslexic — easier to read</div>
                    </div>
                  </div>
                  <button
                    onClick={() => saveVisualSettings({ ...visualSettings, dyslexicFont: !visualSettings.dyslexicFont })}
                    className="relative w-[52px] h-[24px] rounded-full transition-colors"
                    style={{ background: visualSettings.dyslexicFont ? '#f59e0b' : 'var(--bg-btn)' }}
                    role="switch"
                    aria-checked={visualSettings.dyslexicFont}
                    aria-label="Toggle dyslexia font"
                  >
                    <div className={`absolute top-[4px] w-[16px] h-[16px] rounded-full transition-all ${visualSettings.dyslexicFont ? 'left-[32px] bg-white' : 'left-[4px] bg-gray-400'}`} />
                  </button>
                </div>

                {/* Swipe Navigation Toggle */}
                <div className="flex items-center justify-between p-3 rounded-lg border border-[var(--border-medium)] bg-white/5">
                  <div className="flex items-center gap-3">
                    <div className={`w-[28px] h-[28px] rounded-lg flex items-center justify-center ${visualSettings.swipeNavigation ? 'bg-cyan-500 text-white' : 'text-gray-400'}`} style={!visualSettings.swipeNavigation ? { background: 'var(--bg-btn)' } : undefined}>
                      <ChevronDown size={16} className="-rotate-90" />
                    </div>
                    <div>
                      <div className="text-white text-xs font-medium">Swipe Navigation</div>
                      <div className="text-gray-400 text-[10px]">Swipe left/right to switch tabs</div>
                    </div>
                  </div>
                  {/* AUDIT-FIX M22: OLED-aware toggle track */}
                  <button
                    onClick={() => saveVisualSettings({ ...visualSettings, swipeNavigation: !visualSettings.swipeNavigation })}
                    className={`relative w-[52px] h-[24px] rounded-full transition-colors ${visualSettings.swipeNavigation ? 'bg-cyan-500' : ''}`}
                    style={!visualSettings.swipeNavigation ? { background: 'var(--bg-btn)' } : undefined}
                    role="switch"
                    aria-checked={visualSettings.swipeNavigation}
                    aria-label="Toggle swipe navigation"
                  >
                    <div className={`absolute top-[4px] w-[16px] h-[16px] rounded-full transition-all ${visualSettings.swipeNavigation ? 'left-[32px] bg-white' : 'left-[4px] bg-gray-400'}`} />
                  </button>
                </div>
                {visualSettings.swipeNavigation && (
                  <p className="text-cyan-300 text-xs text-center">✓ Swipe left/right on content area to navigate</p>
                )}

                {/* Animations Toggle — 3-state: off < on < full */}
                <div className="flex items-center justify-between p-3 rounded-lg border border-[var(--border-medium)] bg-white/5">
                  <div className="flex items-center gap-3">
                    <div className={`w-[28px] h-[28px] rounded-lg flex items-center justify-center ${visualSettings.animationsEnabled !== 'off' ? (visualSettings.animationsEnabled === 'full' ? 'bg-fuchsia-500 text-white' : 'bg-purple-500 text-white') : 'text-gray-400'}`} style={visualSettings.animationsEnabled === 'off' ? { background: 'var(--bg-btn)' } : undefined}>
                      <Sparkles size={16} />
                    </div>
                    <div>
                      <div className="text-white text-xs font-medium">Animations</div>
                      <div className="text-gray-400 text-[10px]">Background effects, transitions & glow</div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      const next = visualSettings.animationsEnabled === 'off' ? 'on' : visualSettings.animationsEnabled === 'on' ? 'full' : 'off';
                      saveVisualSettings({ ...visualSettings, animationsEnabled: next });
                    }}
                    className="relative w-[72px] h-[24px] rounded-full transition-colors flex-shrink-0"
                    style={{ background: visualSettings.animationsEnabled === 'off' ? 'var(--bg-btn)' : visualSettings.animationsEnabled === 'on' ? '#a855f7' : '#d946ef' }}
                    role="switch"
                    aria-checked={visualSettings.animationsEnabled !== 'off'}
                    aria-label={`Animations: ${visualSettings.animationsEnabled.toUpperCase()} — click to switch to ${visualSettings.animationsEnabled === 'off' ? 'ON' : visualSettings.animationsEnabled === 'on' ? 'FULL' : 'OFF'}`}
                    title={`Currently: ${visualSettings.animationsEnabled.toUpperCase()}. Click to cycle.`}
                  >
                    <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold tracking-wide text-white/80 pointer-events-none select-none">
                      {visualSettings.animationsEnabled === 'off' ? 'OFF' : visualSettings.animationsEnabled === 'on' ? 'ON' : 'FULL'}
                    </span>
                    <div className={`absolute top-[4px] w-[16px] h-[16px] rounded-full transition-all bg-white ${visualSettings.animationsEnabled === 'off' ? 'left-[4px] !bg-gray-400' : visualSettings.animationsEnabled === 'on' ? 'left-[28px]' : 'left-[52px]'}`} />
                  </button>
                </div>
                {visualSettings.animationsEnabled === 'off' && (
                  <p className="text-gray-400 text-xs font-medium text-center mx-auto" style={{maxWidth: 'none'}}>OFF — All animations disabled, saves battery</p>
                )}
                {visualSettings.animationsEnabled === 'on' && (
                  <p className="text-purple-400 text-xs font-medium text-center mx-auto" style={{maxWidth: 'none'}}>ON — Background effects, transitions & glow</p>
                )}
                {visualSettings.animationsEnabled === 'full' && (
                  <p className="text-fuchsia-400 text-xs font-medium text-center mx-auto" style={{maxWidth: 'none'}}>FULL — 2× animation intensity, breathing on all characters</p>
                )}

                {/* Background Style Selector */}
                {visualSettings.animationsEnabled !== 'off' && (
                  <div className="p-3 rounded-lg border border-[var(--border-medium)] bg-white/5">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-[28px] h-[28px] rounded-lg flex items-center justify-center ${visualSettings.bgStyle === 'resonance' ? 'bg-blue-500 text-white' : visualSettings.bgStyle === 'honour' ? 'bg-amber-600 text-white' : visualSettings.bgStyle === 'reflect' ? 'bg-purple-500 text-white' : 'text-gray-400'}`} style={visualSettings.bgStyle === 'none' ? { background: 'var(--bg-btn)' } : undefined}>
                        <Diamond size={16} />
                      </div>
                      <div>
                        <div className="text-white text-xs font-medium">Background Style</div>
                        <div className="text-gray-400 text-[10px]">{visualSettings.bgStyle === 'resonance' ? 'Holographic rings & energy' : visualSettings.bgStyle === 'honour' ? 'Sword field & clouds' : visualSettings.bgStyle === 'reflect' ? 'Triangle mirror wave' : 'No background'}</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-4 gap-1.5">
                      {[
                        { id: 'none', label: 'None', color: 'bg-gray-600' },
                        { id: 'reflect', label: 'Reflect', color: 'bg-purple-500' },
                        { id: 'resonance', label: 'Resonance', color: 'bg-blue-500' },
                        { id: 'honour', label: 'Honour', color: 'bg-amber-600' },
                      ].map(bg => (
                        <button key={bg.id}
                          onClick={() => saveVisualSettings({ ...visualSettings, bgStyle: bg.id })}
                          className={`min-h-[36px] py-1.5 rounded-md text-[10px] font-medium transition-colors ${visualSettings.bgStyle === bg.id ? bg.color + ' text-white' : 'text-gray-400 hover:text-white'}`}
                          style={visualSettings.bgStyle !== bg.id ? { background: 'var(--bg-btn)' } : undefined}
                        >{bg.label}</button>
                      ))}
                    </div>
                    {visualSettings.bgStyle !== 'none' && (
                      <div className="mt-3 pt-3 border-t border-white/5 space-y-2">
                        <div className="flex items-center gap-3">
                          <div className="text-gray-500 text-[9px] font-medium w-[56px] shrink-0">Resolution</div>
                          <div className="flex gap-1 flex-1">
                            {[25, 50, 100, 200].map(res => {
                              const autoVal = visualSettings.animationsEnabled === 'full' ? 100 : 50;
                              const isActive = visualSettings.bgResolution === null ? res === autoVal : visualSettings.bgResolution === res;
                              return <button key={res}
                                onClick={() => saveVisualSettings({ ...visualSettings, bgResolution: res === autoVal ? null : res })}
                                className={`flex-1 min-h-[32px] py-1 rounded text-[9px] font-medium transition-colors ${isActive ? 'bg-white/15 text-white' : 'text-gray-500 hover:text-gray-300'}`}
                                style={!isActive ? { background: 'var(--bg-btn)' } : undefined}
                              >{res}%</button>;
                            })}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-gray-500 text-[9px] font-medium w-[56px] shrink-0">FPS</div>
                          <div className="flex gap-1 flex-1">
                            {[15, 30, 45, 60].map(fps => {
                              const autoVal = visualSettings.animationsEnabled === 'full' ? 30 : 15;
                              const isActive = visualSettings.bgFps === null ? fps === autoVal : visualSettings.bgFps === fps;
                              return <button key={fps}
                                onClick={() => saveVisualSettings({ ...visualSettings, bgFps: fps === autoVal ? null : fps })}
                                className={`flex-1 min-h-[32px] py-1 rounded text-[9px] font-medium transition-colors ${isActive ? 'bg-white/15 text-white' : 'text-gray-500 hover:text-gray-300'}`}
                                style={!isActive ? { background: 'var(--bg-btn)' } : undefined}
                              >{fps}</button>;
                            })}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Theme Selector */}
                <div className="p-3 rounded-lg border border-[var(--border-medium)] bg-white/5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-[28px] h-[28px] rounded-lg flex items-center justify-center`} style={{ background: visualSettings.theme !== 'default' ? getElementBg(CHARACTER_THEMES.find(t => t.id === visualSettings.theme)?.element) : 'var(--bg-btn)', color: visualSettings.theme !== 'default' ? getElementColor(CHARACTER_THEMES.find(t => t.id === visualSettings.theme)?.element) : '#9ca3af' }}>
                      <Sparkles size={16} />
                    </div>
                    <div>
                      <div className="text-white text-xs font-medium">Header Theme</div>
                      <div className="text-gray-400 text-[10px]">Character banner art & accent colors</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5">
                    {/* Default theme */}
                    <button
                      onClick={() => saveVisualSettings({ ...visualSettings, theme: 'default' })}
                      className={`relative rounded-lg overflow-hidden border transition-all ${visualSettings.theme === 'default' ? 'border-yellow-500 ring-1 ring-yellow-500/50' : 'border-[var(--border-medium)] hover:border-gray-500'}`}
                      style={{ aspectRatio: '16/9' }}
                      aria-pressed={visualSettings.theme === 'default'}
                      aria-label="Default theme"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-[#080c14] to-[#0f141c] flex items-center justify-center">
                        <span className="text-gray-400 text-[10px] font-medium">Default</span>
                      </div>
                      {visualSettings.theme === 'default' && <div className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-yellow-500 flex items-center justify-center"><Check size={10} className="text-black" /></div>}
                    </button>
                    {/* Character themes */}
                    {CHARACTER_THEMES.map(t => (
                      <button
                        key={t.id}
                        onClick={() => saveVisualSettings({ ...visualSettings, theme: t.id })}
                        className={`relative rounded-lg overflow-hidden border transition-all ${visualSettings.theme === t.id ? `ring-1` : 'border-[var(--border-medium)] hover:border-gray-500'}`}
                        style={{ aspectRatio: '16/9', borderColor: visualSettings.theme === t.id ? getElementColor(t.element) : undefined, boxShadow: visualSettings.theme === t.id ? `0 0 8px ${getElementColor(t.element)}40` : undefined }}
                        aria-pressed={visualSettings.theme === t.id}
                        aria-label={`${t.name} theme`}
                      >
                        <img src={t.bannerArt} alt={t.name} className="absolute inset-0 w-full h-full object-cover" loading="lazy" onError={hideOnError} />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                        <span className="absolute bottom-0.5 left-1 text-white text-[9px] font-medium drop-shadow-lg">{t.name}</span>
                        {visualSettings.theme === t.id && <div className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full flex items-center justify-center" style={{ background: getElementColor(t.element) }}><Check size={10} className="text-black" /></div>}
                      </button>
                    ))}
                  </div>
                  {visualSettings.theme !== 'default' && (() => {
                    const t = CHARACTER_THEMES.find(th => th.id === visualSettings.theme);
                    return t ? <p className="text-[10px] text-center mt-2" style={{ color: getElementColor(t.element) }}>{t.name} — {t.element} theme active</p> : null;
                  })()}
                </div>

                {/* Install App on Device */}
                {pwa?.canInstall && (
                  <div className="flex items-center justify-between p-3 rounded-lg border border-[var(--border-medium)] bg-white/5">
                    <div className="flex items-center gap-3">
                      <div className="w-[28px] h-[28px] rounded-lg flex items-center justify-center bg-[rgba(237,175,24,0.2)] text-yellow-400">
                        <Download size={16} />
                      </div>
                      <div>
                        <div className="text-white text-xs font-medium">Install App</div>
                        <div className="text-gray-400 text-[10px]">Add to home screen for offline use</div>
                      </div>
                    </div>
                    <button
                      onClick={async () => {
                        const accepted = await pwa.promptInstall();
                        if (accepted) toast?.addToast?.('App installed successfully!', 'success');
                      }}
                      className="px-3 py-1.5 bg-[rgba(237,175,24,0.9)] text-black rounded-lg text-xs font-medium hover:bg-[rgba(237,175,24,1)] transition-colors"
                    >
                      Install
                    </button>
                  </div>
                )}
                {pwa?.isInstalled && (
                  <p className="text-emerald-400 text-[10px] text-center">✓ App is installed on your device</p>
                )}
              </CardBody>
            </Card>

            <Card>
              <CardHeader>Import Convene History</CardHeader>
              <CardBody className="space-y-3">
                <p className="text-gray-300 text-[10px]">Import your Convene history from wuwatracker or compatible trackers.</p>
                <div className="grid grid-cols-3 gap-2">
                  {[['pc', 'PC', Monitor], ['android', 'Android', Smartphone], ['ps5', 'PS5', Gamepad2]].map(([k, l, Icon]) => (
                    <button key={k} onClick={() => setImportPlatform(k)} aria-pressed={importPlatform === k} className={`kuro-btn p-2 text-center ${importPlatform === k ? 'active-gold' : ''}`}>
                      <Icon size={16} className="mx-auto mb-0.5" /><div className="text-[10px]">{l}</div>
                    </button>
                  ))}
                </div>
                {/* P4-FIX: Data-driven import guides — eliminates ~90 lines of copy-paste */}
                {importPlatform && <ImportGuide platform={importPlatform} />}
                
                {/* Import Method Selector */}
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setImportMethod('file')}
                    className={`kuro-btn py-2 text-xs ${importMethod === 'file' ? 'active-gold' : ''}`}
                  >
                    <Upload size={14} className="inline mr-1.5" />File
                  </button>
                  <button
                    onClick={() => setImportMethod('paste')}
                    className={`kuro-btn py-2 text-xs ${importMethod === 'paste' ? 'active-gold' : ''}`}
                  >
                    <ClipboardList size={14} className="inline mr-1.5" />Paste
                  </button>
                  <button
                    onClick={() => setImportMethod('direct')}
                    className={`kuro-btn py-2 text-xs ${importMethod === 'direct' ? 'active-emerald' : ''}`}
                  >
                    <Link size={14} className="inline mr-1.5" />Direct
                  </button>
                </div>
                
                {/* File Upload Method — P8-FIX: Now supports drag-and-drop */}
                {importMethod === 'file' && (
                  <label
                    className="block"
                    onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setIsDragOver(true); }}
                    onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); setIsDragOver(false); }}
                    onDrop={handleFileDrop}
                  >
                    {importStatus ? (
                      <div className="p-4 border-2 border-dashed border-yellow-500/40 rounded-lg text-center bg-yellow-500/5" aria-label="Importing file">
                        <div className="flex items-center justify-center gap-2 mb-2">
                          <div className="kuro-skeleton kuro-skeleton-text" style={{ width: '60%', height: '12px' }} />
                          <span className="text-yellow-400/80 text-[10px] font-medium animate-pulse">Processing…</span>
                        </div>
                        <p className="text-yellow-400 text-[10px] font-medium kuro-number">{importStatus.fileName}</p>
                        <p className="text-gray-500 text-[10px] mt-0.5">{importStatus.fileSize} KB — parsing...</p>
                      </div>
                    ) : (
                    <div className={`p-4 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors ${isDragOver ? 'border-yellow-500 bg-yellow-500/10' : 'border-white/20 hover:border-yellow-500/50'}`}>
                      <Upload size={20} className={`mx-auto mb-1 ${isDragOver ? 'text-yellow-400' : 'text-gray-300'}`} />
                      <p className={`text-[10px] ${isDragOver ? 'text-yellow-400 font-medium' : 'text-gray-300'}`}>
                        {isDragOver ? 'Drop JSON file here' : 'Upload or drag & drop JSON file from wuwatracker'}
                      </p>
                    </div>
                    )}
                    <input type="file" accept=".json" onChange={handleFileImport} className="hidden" />
                  </label>
                )}
                
                {/* Paste JSON Method */}
                {importMethod === 'paste' && (
                  <div className="space-y-2">
                    <textarea
                      value={pasteJsonText}
                      onChange={(e) => setPasteJsonText(e.target.value)}
                      placeholder='Paste your wuwatracker JSON here...

Example: {"pulls":[...]}'
                      className="kuro-input w-full h-32 text-[10px] font-mono resize-none"
                      spellCheck={false}
                      aria-label="Paste import JSON data"
                    />
                    <div className="flex gap-2">
                      <button 
                        onClick={handlePasteImport}
                        disabled={!pasteJsonText.trim()}
                        className={`kuro-btn flex-1 py-2 text-xs ${pasteJsonText.trim() ? 'active-emerald' : 'opacity-50'}`}
                      >
                        <Check size={14} className="inline mr-1.5" />Import Data
                      </button>
                      {pasteJsonText && (
                        <button 
                          onClick={() => setPasteJsonText('')}
                          className="kuro-btn px-3 py-2 text-xs"
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>
                    <p className="text-gray-400 text-[10px]">
                      💡 In wuwatracker: Profile → Settings → Data → Export Pull History → Copy the JSON content
                    </p>
                  </div>
                )}

                {/* Direct Import Method — fetch from WuWa API */}
                {importMethod === 'direct' && (
                  <div className="space-y-2">
                    <p className="text-gray-400 text-[10px]">Paste your Convene History URL or enter IDs manually.</p>
                    <input
                      type="text"
                      value={directUrl}
                      onChange={(e) => handleDirectUrlChange(e.target.value)}
                      placeholder="Paste Convene History URL here..."
                      className="kuro-input w-full text-[10px] font-mono"
                      spellCheck={false}
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-gray-500 text-[9px] block mb-0.5">player_id</label>
                        <input type="text" value={directPlayerId} onChange={(e) => setDirectPlayerId(e.target.value)} placeholder="e.g. 500123456" className="kuro-input w-full text-[10px] font-mono" />
                      </div>
                      <div>
                        <label className="text-gray-500 text-[9px] block mb-0.5">record_id</label>
                        <input type="text" value={directRecordId} onChange={(e) => setDirectRecordId(e.target.value)} placeholder="alphanumeric key" className="kuro-input w-full text-[10px] font-mono" />
                      </div>
                    </div>
                    <div>
                      <label className="text-gray-500 text-[9px] block mb-0.5">svr_id <span className="text-gray-600">(optional)</span></label>
                      <input type="text" value={directSvrId} onChange={(e) => setDirectSvrId(e.target.value)} placeholder="e.g. 76" className="kuro-input w-full text-[10px] font-mono" />
                    </div>

                    {/* Camera / Screenshot OCR */}
                    {directCameraOpen && createPortal(
                      <div className="fixed inset-0 z-[9999] flex flex-col" style={{ background: '#05080e' }}>
                        {/* Video feed with vignette */}
                        <div className="flex-1 relative mx-2 mt-2 mb-1 rounded-xl overflow-hidden">
                          <video ref={directVideoRef} muted playsInline className="absolute inset-0 w-full h-full object-cover" />
                          {/* Vignette overlay */}
                          <div className="absolute inset-0 pointer-events-none" style={{ boxShadow: 'inset 0 0 80px rgba(0,0,0,0.6), inset 0 0 160px rgba(0,0,0,0.3)' }} />

                          {/* HUD overlay */}
                          <div className="absolute inset-0 pointer-events-none">
                            {/* Corner L-brackets — thick, game-style */}
                            <div className="absolute top-6 left-6">
                              <div className="w-10 h-[3px] bg-yellow-400/70" />
                              <div className="w-[3px] h-10 bg-yellow-400/70" />
                            </div>
                            <div className="absolute top-6 right-6">
                              <div className="w-10 h-[3px] bg-yellow-400/70 ml-auto" />
                              <div className="w-[3px] h-10 bg-yellow-400/70 ml-auto" />
                            </div>
                            <div className="absolute bottom-6 left-6">
                              <div className="w-[3px] h-10 bg-yellow-400/70" />
                              <div className="w-10 h-[3px] bg-yellow-400/70" />
                            </div>
                            <div className="absolute bottom-6 right-6">
                              <div className="w-[3px] h-10 bg-yellow-400/70 ml-auto" />
                              <div className="w-10 h-[3px] bg-yellow-400/70 ml-auto" />
                            </div>

                            {/* Center reticle */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16">
                              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1.5px] h-4 bg-yellow-400/40" />
                              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[1.5px] h-4 bg-yellow-400/40" />
                              <div className="absolute left-0 top-1/2 -translate-y-1/2 h-[1.5px] w-4 bg-yellow-400/40" />
                              <div className="absolute right-0 top-1/2 -translate-y-1/2 h-[1.5px] w-4 bg-yellow-400/40" />
                              <div className="absolute inset-[6px] rounded-full border border-yellow-400/20" />
                            </div>

                            {/* HUD data readouts — top left */}
                            <div className="absolute top-8 left-8 mt-[14px] ml-4 space-y-1">
                              <div className="flex items-center gap-1.5">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" style={{ animation: 'camPulse 2s infinite' }} />
                                <span className="text-emerald-400 text-[8px] font-mono uppercase tracking-wider">Live</span>
                              </div>
                              <p className="text-white/30 text-[7px] font-mono">OCR · GROQ VISION</p>
                            </div>

                            {/* HUD data readouts — top right */}
                            <div className="absolute top-8 right-8 mt-[14px] mr-4 text-right space-y-1">
                              <p className="text-white/30 text-[7px] font-mono">{new Date().toLocaleTimeString()}</p>
                              <p className="text-yellow-500/40 text-[7px] font-mono">RES: 1920x1080</p>
                            </div>

                            {/* Horizontal scan lines (subtle) */}
                            <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.5) 2px, rgba(255,255,255,0.5) 3px)', backgroundSize: '100% 3px' }} />

                            {/* Sweeping scan beam */}
                            <div className="absolute left-0 right-0 h-[2px]" style={{ animation: 'camScan 4s ease-in-out infinite', background: 'linear-gradient(90deg, transparent 0%, rgba(237,175,24,0) 15%, rgba(237,175,24,0.5) 50%, rgba(237,175,24,0) 85%, transparent 100%)' }} />

                            {/* Bottom instruction overlay */}
                            <div className="absolute bottom-8 left-0 right-0 text-center">
                              <p className="text-white/50 text-[9px] font-medium tracking-wider uppercase">Align URL within brackets</p>
                            </div>
                          </div>
                        </div>

                        {/* Top header — glass panel */}
                        <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-3 py-2.5" style={{ background: 'rgba(5,8,14,0.85)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(237,175,24,0.1)', paddingTop: 'max(10px, env(safe-area-inset-top))' }}>
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg overflow-hidden" style={{ border: '1px solid rgba(237,175,24,0.3)', boxShadow: '0 0 8px rgba(237,175,24,0.1)' }}>
                              <img src={HEADER_ICON} alt="" className="w-full h-full object-cover" />
                            </div>
                            <div>
                              <p className="text-white text-[11px] font-semibold" style={{ letterSpacing: '0.08em' }}>CONVENE SCANNER</p>
                              <p className="text-[7px] font-mono uppercase" style={{ color: 'rgba(237,175,24,0.5)', letterSpacing: '0.2em' }}>Whispering Wishes</p>
                            </div>
                          </div>
                          <button onClick={closeDirectCamera} className="min-w-[40px] min-h-[40px] rounded-lg flex items-center justify-center text-gray-500 hover:text-white active:scale-95 transition-all" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                            <X size={16} />
                          </button>
                        </div>

                        {/* Bottom capture bar — glass panel */}
                        <div className="flex items-center justify-center py-3" style={{ background: 'rgba(5,8,14,0.85)', backdropFilter: 'blur(12px)', borderTop: '1px solid rgba(237,175,24,0.1)', paddingBottom: 'max(12px, env(safe-area-inset-bottom))' }}>
                          <button onClick={captureDirectCamera} className="group relative active:scale-90 transition-transform">
                            {/* Outer ring — animated glow */}
                            <div className="w-[72px] h-[72px] rounded-full flex items-center justify-center" style={{ border: '2px solid rgba(237,175,24,0.4)', animation: 'camGlow 3s ease-in-out infinite' }}>
                              {/* Inner button */}
                              <div className="w-[56px] h-[56px] rounded-full transition-all group-hover:scale-105" style={{ background: 'linear-gradient(135deg, #edaf18, #f59e0b)', boxShadow: '0 4px 20px rgba(237,175,24,0.3)' }}>
                                <div className="w-full h-full rounded-full flex items-center justify-center">
                                  <Camera size={20} className="text-black/80" />
                                </div>
                              </div>
                            </div>
                          </button>
                        </div>

                        <style>{`
                          @keyframes camScan { 0% { top: 10%; opacity: 0; } 10% { opacity: 1; } 90% { opacity: 1; } 100% { top: 85%; opacity: 0; } }
                          @keyframes camPulse { 0%,100% { opacity: 1; } 50% { opacity: 0.3; } }
                          @keyframes camGlow { 0%,100% { box-shadow: 0 0 8px rgba(237,175,24,0.2); border-color: rgba(237,175,24,0.3); } 50% { box-shadow: 0 0 20px rgba(237,175,24,0.4); border-color: rgba(237,175,24,0.6); } }
                        `}</style>
                      </div>,
                      document.body
                    )}
                    <div className="flex gap-2">
                      <button onClick={openDirectCamera} className="kuro-btn flex-1 py-2 text-xs text-center" disabled={directScanStatus === 'scanning'}>
                        <Camera size={14} className="inline mr-1.5" />
                        {directScanStatus === 'scanning' ? 'Scanning...' : 'Open Camera'}
                      </button>
                      <label className="kuro-btn flex-1 py-2 text-xs text-center cursor-pointer">
                        <Upload size={14} className="inline mr-1.5" />Upload Image
                        <input type="file" accept="image/*" onChange={(e) => handleScreenshotOcr(e.target.files?.[0])} className="hidden" />
                      </label>
                    </div>
                    {directScanStatus === 'done' && <p className="text-emerald-400 text-[10px] text-center">IDs extracted successfully</p>}
                    {directScanStatus === 'error' && <p className="text-red-400 text-[10px] text-center">{directError}</p>}

                    {/* Fetch button */}
                    {directStatus === 'fetching' ? (
                      <div className="space-y-2">
                        <div className="flex items-center justify-center gap-2 py-3">
                          <Loader size={14} className="text-emerald-400 animate-spin" />
                          <span className="text-emerald-400 text-xs">Fetching Convenes...</span>
                        </div>
                        <div className="grid grid-cols-4 gap-1">
                          {Object.entries(directProgress).map(([pool, info]) => (
                            <div key={pool} className={`text-center p-1 rounded text-[8px] ${info.status === 'done' ? 'text-emerald-400 bg-emerald-500/10' : info.status === 'error' ? 'text-red-400 bg-red-500/10' : 'text-gray-400 bg-white/5'}`}>
                              {POOL_LABELS[pool]?.split(' ')[0] || pool}: {info.count || '...'}
                            </div>
                          ))}
                        </div>
                        <button onClick={() => directAbortRef.current?.abort()} className="kuro-btn w-full py-1.5 text-xs text-red-400">Cancel</button>
                      </div>
                    ) : (
                      <button
                        onClick={handleDirectFetch}
                        disabled={!directPlayerId.trim() || !directRecordId.trim()}
                        className={`kuro-btn w-full py-2 text-xs ${directPlayerId.trim() && directRecordId.trim() ? 'active-emerald' : 'opacity-50'}`}
                      >
                        <Download size={14} className="inline mr-1.5" />Import from Server
                      </button>
                    )}

                    {directStatus === 'done' && <p className="text-emerald-400 text-[10px] text-center">Import complete!</p>}
                    {directError && <p className="text-red-400 text-[10px] text-center">{directError}</p>}

                    <p className="text-gray-500 text-[9px]">Open Convene History in-game, copy the URL from the browser address bar. The URL expires after a few minutes.</p>
                  </div>
                )}
              </CardBody>
            </Card>
            </div>{/* end desktop-grid-2 */}

            {state.profile.importedAt && (
              <Card>
                <CardHeader action={<button onClick={async () => { if (await confirm({ title: 'Clear history', message: 'Clear all imported Convene history?\nThis cannot be undone.', confirmLabel: 'Clear', destructive: true })) { dispatch({ type: 'CLEAR_PROFILE' }); toast?.addToast?.('Profile cleared!', 'info'); } }} className="text-red-400 text-[10px] hover:text-red-300 transition-colors" aria-label="Clear all imported Convene history">Clear</button>}>Import Info</CardHeader>
                <CardBody>
                  {state.profile.uid && <div className="flex justify-between text-xs mb-2"><span className="text-gray-400">UID</span><span className="text-gray-100 font-mono">{state.profile.uid}</span></div>}
                  <div className="flex justify-between text-xs"><span className="text-gray-400">Imported</span><span className="text-gray-300">{new Date(state.profile.importedAt).toLocaleDateString('en-US')}</span></div>
                  <p className="text-gray-400 text-[10px] mt-2">View detailed stats in the Stats tab</p>
                </CardBody>
              </Card>
            )}

            <Card>
              <CardBody className="space-y-2">
                <button onClick={handleExport} className="kuro-btn w-full py-2 flex items-center justify-center gap-1">
                  <Download size={14} /> Export Backup
                </button>
                <div className="border-t border-red-900/30 mt-4 pt-3">
                  <p className="text-xs text-red-400/70 mb-2 text-center">Danger Zone</p>
                  <button onClick={async () => { if (await confirm({ title: 'Reset all data', message: 'Are you sure you want to reset ALL data?\nThis cannot be undone.', confirmLabel: 'Reset', destructive: true })) { haptic.warning(); dispatch({ type: 'RESET' }); toast?.addToast?.('All data reset!', 'info'); } }} className="kuro-btn w-full py-2 active-red">
                    Reset All Data
                  </button>
                </div>
              </CardBody>
            </Card>

            {/* About & Legal */}
            <Card>
              <CardHeader>About</CardHeader>
              <CardBody className="space-y-3">
                <div className="text-center">
                  <h4 className="text-gray-100 font-bold text-sm">Whispering Wishes</h4>
                  <p className="text-gray-500 text-[10px]">Version {APP_VERSION}</p>
                </div>
                
                <div className="text-center">
                  <p className="text-gray-400 text-[10px] mb-1">Questions, issues, or feedback?</p>
                  <a 
                    href="mailto:whisperingwishes.app@gmail.com" 
                    className="text-yellow-400 text-xs hover:text-yellow-300 transition-colors underline"
                  >
                    whisperingwishes.app@gmail.com
                  </a>
                </div>
                
                <div className="kuro-divider" />
                
                <div className="space-y-2 text-[10px] text-gray-400">
                  <p className="font-medium text-gray-400">Disclaimer</p>
                  <p>Whispering Wishes is an unofficial fan-made tool and is not affiliated with, endorsed by, or associated with Kuro Games, Kuro Technology (HK) Co., Limited, or any of their subsidiaries.</p>
                  <p>Wuthering Waves, all game content, characters, names, and related media are trademarks and copyrights of Kuro Games © 2024-{currentYear}. All rights reserved.</p>
                </div>
                
                <div className="space-y-2 text-[10px] text-gray-400">
                  <p className="font-medium text-gray-400">Data & Privacy</p>
                  <p>Most data is stored locally on your device using browser storage. Your Convene history, calculator settings, and app preferences remain private and under your control.</p>
                  <p><strong className="text-gray-400">Leaderboard:</strong> If you choose to submit your score, your generated user ID, average pity, Convene count, 50/50 win/loss stats, and owned 5★ items are sent to a shared database and displayed publicly in the leaderboard rankings. This data is pseudonymous (linked to a randomly generated ID). You can opt out by simply not submitting your score.</p>
                  <p>This app does not require any special device permissions. Data import relies on files you manually provide from third-party tools like wuwatracker.com.</p>
                </div>
                
                <div className="space-y-2 text-[10px] text-gray-400">
                  <p className="font-medium text-gray-400">Third-Party Services</p>
                  <p>This app recommends wuwatracker.com for data export. We are not affiliated with wuwatracker.com and are not responsible for their services, data handling, or availability.</p>
                </div>
                
                <div className="space-y-2 text-[10px] text-gray-400">
                  <p className="font-medium text-gray-400">Data Sources & Attribution</p>
                  <p>Banner schedules, event timings, and countdown data are sourced from:</p>
                  <ul className="list-disc list-inside ml-2 space-y-0.5">
                    <li><a href="https://wuwatracker.com" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">WuWa Tracker</a> - Event timeline & pity tracking</li>
                    <li><a href="https://wuthering-countdown.gengamer.in" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">GenGamer Countdown</a> - Banner countdowns</li>
                  </ul>
                  <p className="mt-1">We thank these community resources for providing accurate timing data.</p>
                </div>
                
                <div className="space-y-2 text-[10px] text-gray-400">
                  <p className="font-medium text-gray-400">License</p>
                  <p>This tool is provided "as is" without warranty of any kind. Use at your own discretion. The developers are not responsible for any issues arising from the use of this application.</p>
                </div>
                
                <p className="text-center text-[10px] text-gray-500 pt-2">© {currentYear} <span onClick={handleAdminTap} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleAdminTap(); } }} tabIndex={0} role="button" className="cursor-pointer select-none" style={adminTapCount >= 3 ? { color: 'rgba(237,175,24,0.5)', transition: 'color 0.3s' } : undefined}>{`Whispering Wishes Ver.${APP_VERSION}`}</span> by <a href="https://www.reddit.com/u/WW_Andene" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-gray-400 transition-colors">u/WW_Andene</a> • Made with ♡ for the WuWa community.</p>
              </CardBody>
            </Card>
          </div>
          </TabErrorBoundary>
          </div>

      {/* Resonator ID Card Modal */}
      <IdCardModal
        showIdCard={showIdCard}
        setShowIdCard={setShowIdCard}
        idCardFormat={idCardFormat}
        setIdCardFormat={setIdCardFormat}
        downloadIdCard={downloadIdCard}
        state={state}
        luckRating={luckRating}
        overallStats={overallStats}
        collectionImages={collectionImages}
        ownedCharNames={ownedCharNames}
        idCardTrapRef={idCardTrapRef}
        trophies={trophies}
        getImageFraming={getImageFraming}
      />

      {/* Admin Panel Modal + Mini Window */}
      <AdminPanel
        showAdminPanel={showAdminPanel} setShowAdminPanel={setShowAdminPanel}
        adminUnlocked={adminUnlocked} setAdminUnlocked={setAdminUnlocked}
        adminPassword={adminPassword} setAdminPassword={setAdminPassword}
        adminTab={adminTab} setAdminTab={setAdminTab}
        adminMiniMode={adminMiniMode} setAdminMiniMode={setAdminMiniMode}
        bannerForm={bannerForm} setBannerForm={setBannerForm}
        trophyJsonInput={trophyJsonInput} setTrophyJsonInput={setTrophyJsonInput}
        activePlayersCount={activePlayersCount} activePlayersHistory={activePlayersHistory}
        presenceError={presenceError} adminPlayerList={adminPlayerList}
        adminLockedUntil={adminLockedUntil}
        trophies={trophies}
        fetchActivePlayersCount={fetchActivePlayersCount} fetchAdminPlayerList={fetchAdminPlayerList}
        trophyOverrides={trophyOverrides} setTrophyOverrides={setTrophyOverrides}
        verifyAdminPassword={verifyAdminPassword} saveCustomBanners={saveCustomBanners}
        buildBannerForm={buildBannerForm} updateBannerForm={updateBannerForm}
        visualSettings={visualSettings} saveVisualSettings={saveVisualSettings}
        customCollectionImages={customCollectionImages} saveCollectionImages={saveCollectionImages}
        collectionImages={collectionImages}
        activeBanners={activeBanners} setActiveBanners={setActiveBanners}
        imageFraming={imageFraming} framingMode={framingMode} setFramingMode={setFramingMode}
        editingImage={editingImage} setEditingImage={setEditingImage}
        getImageFraming={getImageFraming} updateEditingFraming={updateEditingFraming}
        resetEditingFraming={resetEditingFraming}
        miniPanelPosition={miniPanelPosition} saveMiniPanelPosition={saveMiniPanelPosition}
        getMiniPanelPositionClasses={getMiniPanelPositionClasses}
        state={state} dispatch={dispatch} toast={toast} confirm={confirm}
        adminTrapRef={adminTrapRef}
        setActiveTab={setActiveTab}
        withCacheBuster={withCacheBuster}
        detailModal={detailModal}
        saveImageFraming={saveImageFraming}
        DEFAULT_VISUAL_SETTINGS={DEFAULT_VISUAL_SETTINGS}
      />

    </>
  );
}
