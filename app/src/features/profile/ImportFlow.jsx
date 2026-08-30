// ═══════════════════════════════════════════════════════════════════════════════
// ImportFlow — All import-related state and UI extracted from ProfileTab.jsx
// Includes: platform selector, import method tabs (file/paste/direct),
//           drag-and-drop, URL/ID fields, direct fetch, camera/OCR scanning
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Camera, Check, ClipboardList, Download, Gamepad2, Link, Loader, Monitor, Smartphone, Upload, X } from 'lucide-react';
import { parseGachaUrl, buildFetchParams, fetchAllPools, convertToImportFormat, compressImage, extractIdsFromImage, prefetchOcrAssets, POOL_LABELS } from '../../utils/gachaImporter.js';
import { MAX_IMPORT_SIZE_MB } from '../../data/constants.js';
import { Card, CardHeader, CardBody } from '../../shared/components/Card.jsx';
import { ImportGuide } from './ImportGuide.jsx';
import ConveneScanner, { SCAN_ZONE } from './ConveneScanner.jsx';
import { t } from '../../utils/i18n.js';

export default function ImportFlow({
  processImportData,
  toast,
}) {
  // ── Import state (fully self-contained — not read by ProfileTab) ────────
  const [importPlatform, setImportPlatform] = useState(null);
  const [importMethod, setImportMethod] = useState('file');
  const [isDragOver, setIsDragOver] = useState(false);
  const [importStatus, setImportStatus] = useState(null);
  const [pasteJsonText, setPasteJsonText] = useState('');

  // ── Direct import state ─────────────────────────────────────────────────
  const [directUrl, setDirectUrl] = useState('');
  const [directPlayerId, setDirectPlayerId] = useState('');
  const [directRecordId, setDirectRecordId] = useState('');
  const [directSvrId, setDirectSvrId] = useState('');
  const [directResourcesId, setDirectResourcesId] = useState('');
  const [directGachaId, setDirectGachaId] = useState('');
  const [directGachaType, setDirectGachaType] = useState('');
  const [directLang, setDirectLang] = useState('en');
  const [directStatus, setDirectStatus] = useState('idle'); // idle|fetching|done|error
  const [directError, setDirectError] = useState('');
  const [directProgress, setDirectProgress] = useState({});
  const [directScanStatus, setDirectScanStatus] = useState('idle'); // idle|scanning|done|error
  const [directCameraOpen, setDirectCameraOpen] = useState(false);
  const directAbortRef = useRef(null);
  const directVideoRef = useRef(null);
  const directStreamRef = useRef(null);
  const cameraTimerRef = useRef(null);

  // Warm the service worker's OCR asset cache as soon as this screen mounts, well before the
  // user taps "Scan" — see prefetchOcrAssets' own doc for why (removes the download from the
  // OCR init timeout's critical path on both this and every future visit).
  useEffect(() => { prefetchOcrAssets(); }, []);

  const handleDirectUrlChange = useCallback((val) => {
    setDirectUrl(val);
    setDirectError('');
    const p = parseGachaUrl(val);
    if (p.valid) {
      if (p.playerId) setDirectPlayerId(p.playerId);
      if (p.recordId) setDirectRecordId(p.recordId);
      if (p.svrId) setDirectSvrId(p.svrId);
      if (p.resourcesId) setDirectResourcesId(p.resourcesId);
      if (p.gachaId) setDirectGachaId(p.gachaId);
      if (p.gachaType) setDirectGachaType(p.gachaType);
      if (p.lang) setDirectLang(p.lang);
    }
  }, []);

  const handleDirectFetch = useCallback(async () => {
    const pid = directPlayerId.trim();
    const rid = directRecordId.trim();
    if (!pid) { setDirectError(t('profile.importFlow.direct.playerIdRequired')); return; }
    try {
      const params = buildFetchParams(directUrl, pid, rid, directSvrId);
      if (directResourcesId) params.cardPoolId = directResourcesId;
      if (directGachaId) params.gachaId = directGachaId;
      if (directGachaType) params.gachaType = directGachaType;
      if (directLang) params.lang = directLang;
      directAbortRef.current?.abort();
      directAbortRef.current = new AbortController();
      setDirectStatus('fetching');
      setDirectError('');
      setDirectProgress({});
      const result = await fetchAllPools(params, directAbortRef.current.signal, (pool, status, count) => {
        setDirectProgress(prev => ({ ...prev, [pool]: { status, count } }));
      });
      if (directAbortRef.current?.signal.aborted) { setDirectStatus('idle'); return; }
      if (result.total === 0) {
        setDirectStatus('error');
        setDirectError(t('profile.importFlow.toast.noConveneData'));
        return;
      }
      const jsonStr = convertToImportFormat({ ...result, playerId: pid });
      const success = await processImportData(jsonStr);
      if (success) {
        setDirectStatus('done');
      } else {
        setDirectStatus('error');
        setDirectError(t('profile.importFlow.toast.importProcessingFailed'));
      }
    } catch (err) {
      if (err.name === 'AbortError') { setDirectStatus('idle'); return; }
      setDirectStatus('error');
      setDirectError(err.message || t('profile.importFlow.toast.importFailedGeneric'));
    }
  }, [directUrl, directPlayerId, directRecordId, directSvrId, directResourcesId, directGachaId, directGachaType, directLang, processImportData]);

  const handleScreenshotOcr = useCallback(async (file) => {
    if (!file) return;
    setDirectScanStatus('scanning');
    try {
      const base64 = await compressImage(file);
      const ids = await extractIdsFromImage(base64);
      if (ids.player_id) setDirectPlayerId(ids.player_id);
      if (ids.record_id) setDirectRecordId(ids.record_id);
      if (ids.svr_id) setDirectSvrId(ids.svr_id);
      if (ids.resources_id) setDirectResourcesId(ids.resources_id);
      if (ids.gacha_id) setDirectGachaId(ids.gacha_id);
      if (ids.gacha_type) setDirectGachaType(ids.gacha_type);
      if (ids.lang) setDirectLang(ids.lang);
      setDirectScanStatus('done');
      toast?.addToast?.(t('profile.importFlow.toast.idsExtracted'), 'success');
    } catch (err) {
      setDirectScanStatus('error');
      setDirectError(err.message || t('profile.importFlow.toast.screenshotScanFailed'));
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
      // Attach stream to video element after render (cleared on unmount via cameraTimerRef)
      clearTimeout(cameraTimerRef.current);
      cameraTimerRef.current = setTimeout(() => {
        if (directVideoRef.current) {
          directVideoRef.current.srcObject = stream;
          directVideoRef.current.play().catch(e => console.warn('[Camera] Video play failed:', e.message));
        }
      }, 100);
    } catch (err) {
      toast?.addToast?.(err.name === 'NotAllowedError' ? t('profile.importFlow.toast.cameraDenied') : t('profile.importFlow.toast.cameraError', { message: err.message }), 'error');
    }
  }, [toast]);

  const captureDirectCamera = useCallback(() => {
    const video = directVideoRef.current;
    if (!video) return;
    const canvas = document.createElement('canvas');
    // Crop to the same scan-zone rectangle ConveneScanner's HUD shows the user (top 38%, left/
    // right 8% margin, height 24% of the on-screen video). Capturing the full raw frame instead
    // of just this zone is why live-camera OCR was so much worse than a pasted screenshot: the
    // real URL text is a tiny fraction of the full viewport, surrounded by background/UI noise
    // that Tesseract then has to search through (and frequently misreads into the result).
    // The video element renders at `object-cover`, so its native resolution (video.videoWidth/
    // Height) isn't a 1:1 match for the displayed viewport — map the zone's on-screen percentage
    // rect into source-pixel coordinates using the same scale/center-crop math object-cover uses.
    const rect = video.getBoundingClientRect();
    const dw = rect.width, dh = rect.height;
    const vw = video.videoWidth, vh = video.videoHeight;
    if (!dw || !dh || !vw || !vh) return;
    const scale = Math.max(dw / vw, dh / vh);
    const offsetX = (dw - vw * scale) / 2;
    const offsetY = (dh - vh * scale) / 2;
    const toSrcX = (dx) => (dx - offsetX) / scale;
    const toSrcY = (dy) => (dy - offsetY) / scale;

    const zone = SCAN_ZONE;
    const zoneDisplay = {
      left: dw * (zone.left / 100),
      right: dw * (1 - zone.right / 100),
      top: dh * (zone.top / 100),
      bottom: dh * ((zone.top + zone.height) / 100),
    };
    const sx = Math.max(0, toSrcX(zoneDisplay.left));
    const sy = Math.max(0, toSrcY(zoneDisplay.top));
    const sw = Math.min(vw, toSrcX(zoneDisplay.right)) - sx;
    const sh = Math.min(vh, toSrcY(zoneDisplay.bottom)) - sy;

    canvas.width = sw;
    canvas.height = sh;
    canvas.getContext('2d').drawImage(video, sx, sy, sw, sh, 0, 0, sw, sh);
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

  // Auto-close camera when user leaves screen or component unmounts
  useEffect(() => {
    if (!directCameraOpen) return;
    const onHide = () => { if (document.hidden) closeDirectCamera(); };
    document.addEventListener('visibilitychange', onHide);
    return () => {
      document.removeEventListener('visibilitychange', onHide);
      clearTimeout(cameraTimerRef.current);
      // Cleanup stream on unmount (e.g. tab switch while camera open)
      directStreamRef.current?.getTracks().forEach(t => t.stop());
    };
  }, [directCameraOpen, closeDirectCamera]);

  // ── File / Paste handlers ───────────────────────────────────────────────
  const handleFileImport = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const MAX_IMPORT_SIZE = MAX_IMPORT_SIZE_MB * 1024 * 1024;
    if (file.size > MAX_IMPORT_SIZE) {
      toast?.addToast?.(t('profile.importFlow.toast.fileTooLarge', { size: (file.size / 1024 / 1024).toFixed(1), max: MAX_IMPORT_SIZE_MB }), 'error');
      e.target.value = '';
      return;
    }
    setImportStatus({ fileName: file.name, fileSize: (file.size / 1024).toFixed(1) });
    const reader = new FileReader();
    reader.onload = (ev) => {
      processImportData(ev.target.result).catch((err) => { toast?.addToast?.(t('profile.importFlow.toast.importFailed', { message: err?.message || t('profile.importFlow.toast.unknownError') }), 'error'); }).finally(() => setImportStatus(null));
    };
    reader.onerror = () => {
      toast?.addToast?.(t('profile.importFlow.toast.readFailed'), 'error');
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
      toast?.addToast?.(t('profile.importFlow.toast.dropJsonOnly'), 'error');
      return;
    }
    const MAX_IMPORT_SIZE = MAX_IMPORT_SIZE_MB * 1024 * 1024;
    if (file.size > MAX_IMPORT_SIZE) {
      toast?.addToast?.(t('profile.importFlow.toast.fileTooLarge', { size: (file.size / 1024 / 1024).toFixed(1), max: MAX_IMPORT_SIZE_MB }), 'error');
      return;
    }
    setImportStatus({ fileName: file.name, fileSize: (file.size / 1024).toFixed(1) });
    const reader = new FileReader();
    reader.onload = (ev) => { processImportData(ev.target.result).catch((err) => { toast?.addToast?.(t('profile.importFlow.toast.importFailed', { message: err?.message || t('profile.importFlow.toast.unknownError') }), 'error'); }).finally(() => setImportStatus(null)); };
    reader.onerror = () => { toast?.addToast?.(t('profile.importFlow.toast.readFailed'), 'error'); setImportStatus(null); };
    reader.readAsText(file);
  }, [processImportData, toast]);

  const handlePasteImport = useCallback(() => {
    if (!pasteJsonText.trim()) {
      toast?.addToast?.(t('profile.importFlow.toast.pasteFirst'), 'error');
      return;
    }
    processImportData(pasteJsonText).then((ok) => { if (ok) setPasteJsonText(''); }).catch((err) => { toast?.addToast?.(t('profile.importFlow.toast.importFailed', { message: err?.message || t('profile.importFlow.toast.unknownError') }), 'error'); });
  }, [pasteJsonText, processImportData, toast]);

  return (
    <Card>
      <CardHeader>{t('profile.importFlow.title')}</CardHeader>
      <CardBody className="space-y-3">
        <p className="text-gray-300 text-sm">{t('profile.importFlow.subtitle')}</p>
        <div className="grid grid-cols-3 gap-2">
          {[['pc', t('profile.importFlow.platform.pc'), Monitor], ['android', t('profile.importFlow.platform.android'), Smartphone], ['ps5', t('profile.importFlow.platform.ps5'), Gamepad2]].map(([k, l, Icon]) => (
            <button key={k} onClick={() => { setImportPlatform(k); if (k === 'pc' || k === 'android') setImportMethod('direct'); if (k === 'ps5') setImportMethod('direct'); }} aria-pressed={importPlatform === k} className={`kuro-btn p-2 text-center ${importPlatform === k ? 'active-gold' : ''}`}>
              <Icon size={16} className="mx-auto mb-0.5" /><div className="text-sm">{l}</div>
            </button>
          ))}
        </div>
        {/* P4-FIX: Data-driven import guides — eliminates ~90 lines of copy-paste */}
        {importPlatform && <ImportGuide platform={importPlatform} />}

        {/* Import Method Selector */}
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => setImportMethod('file')}
            className={`kuro-btn py-2 text-base ${importMethod === 'file' ? 'active-gold' : ''}`}
          >
            <Upload size={14} className="inline mr-1.5" />{t('profile.importFlow.method.file')}
          </button>
          <button
            onClick={() => setImportMethod('paste')}
            className={`kuro-btn py-2 text-base ${importMethod === 'paste' ? 'active-gold' : ''}`}
          >
            <ClipboardList size={14} className="inline mr-1.5" />{t('profile.importFlow.method.paste')}
          </button>
          <button
            onClick={() => setImportMethod('direct')}
            className={`kuro-btn py-2 text-base ${importMethod === 'direct' ? 'active-emerald' : ''}`}
          >
            <Link size={14} className="inline mr-1.5" />{t('profile.importFlow.method.direct')}
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
              <div className="p-4 border-2 border-dashed border-yellow-500/40 rounded-lg text-center bg-yellow-500/5" aria-label={t('profile.importFlow.file.importing')}>
                <div className="flex items-center justify-center gap-2 mb-2">
                  <div className="kuro-skeleton kuro-skeleton-text" style={{ width: '60%', height: '12px' }} />
                  <span className="text-yellow-400/80 text-sm font-medium animate-pulse">{t('profile.importFlow.file.importing')}</span>
                </div>
                <p className="text-yellow-400 text-sm font-medium kuro-number">{importStatus.fileName}</p>
                <p className="text-gray-500 text-sm mt-0.5">{t('profile.importFlow.file.sizeKb', { size: importStatus.fileSize })}</p>
              </div>
            ) : (
            <div className={`p-4 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors ${isDragOver ? 'border-yellow-500 bg-yellow-500/10' : 'border-white/20 hover:border-yellow-500/50'}`}>
              <Upload size={24} className={`mx-auto mb-1 ${isDragOver ? 'text-yellow-400' : 'text-gray-300'}`} />
              <p className={`text-sm ${isDragOver ? 'text-yellow-400 font-medium' : 'text-gray-300'}`}>
                {isDragOver ? t('profile.importFlow.file.dropHere') : t('profile.importFlow.file.uploadOrDrop')}
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
              placeholder={t('profile.importFlow.paste.placeholder')}
              className="kuro-input w-full h-32 text-sm font-mono resize-none"
              spellCheck={false}
              aria-label="Paste import JSON data"
            />
            <div className="flex gap-2">
              <button
                onClick={handlePasteImport}
                disabled={!pasteJsonText.trim()}
                className={`kuro-btn flex-1 py-2 text-base ${pasteJsonText.trim() ? 'active-emerald' : 'opacity-50'}`}
              >
                <Check size={14} className="inline mr-1.5" />{t('profile.importFlow.paste.import')}
              </button>
              {pasteJsonText && (
                <button
                  onClick={() => setPasteJsonText('')}
                  className="kuro-btn px-3 py-2 text-base"
                >
                  <X size={14} />
                </button>
              )}
            </div>
            <p className="text-gray-400 text-sm">
              {t('profile.importFlow.paste.tip')}
            </p>
          </div>
        )}

        {/* Direct Import Method — fetch from WuWa API */}
        {importMethod === 'direct' && (
          <div className="space-y-2">
            <p className="text-gray-400 text-sm">{t('profile.importFlow.direct.subtitle')}</p>
            <input
              type="text"
              value={directUrl}
              onChange={(e) => handleDirectUrlChange(e.target.value)}
              placeholder={t('profile.importFlow.direct.urlPlaceholder')}
              className="kuro-input w-full text-sm font-mono"
              spellCheck={false}
            />
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-gray-500 text-sm block mb-0.5">{t('profile.importFlow.direct.playerId')}</label>
                <input type="text" value={directPlayerId} onChange={(e) => setDirectPlayerId(e.target.value)} placeholder={t('profile.importFlow.direct.playerIdPlaceholder')} className="kuro-input w-full text-sm font-mono" />
              </div>
              <div>
                <label className="text-gray-500 text-sm block mb-0.5">{t('profile.importFlow.direct.recordId')}</label>
                <input type="text" value={directRecordId} onChange={(e) => setDirectRecordId(e.target.value)} placeholder={t('profile.importFlow.direct.recordIdPlaceholder')} className="kuro-input w-full text-sm font-mono" />
              </div>
            </div>
            <div>
              <label className="text-gray-500 text-sm block mb-0.5">{t('profile.importFlow.direct.svrId')} <span className="text-gray-600">{t('profile.importFlow.direct.optional')}</span></label>
              <input type="text" value={directSvrId} onChange={(e) => setDirectSvrId(e.target.value)} placeholder={t('profile.importFlow.direct.svrIdPlaceholder')} className="kuro-input w-full text-sm font-mono" />
            </div>
            <div>
              <label className="text-gray-500 text-sm block mb-0.5">{t('profile.importFlow.direct.resourcesId')} <span className="text-gray-600">{t('profile.importFlow.direct.optional')}</span></label>
              <input type="text" value={directResourcesId} onChange={(e) => setDirectResourcesId(e.target.value)} placeholder={t('profile.importFlow.direct.resourcesIdPlaceholder')} className="kuro-input w-full text-sm font-mono" />
            </div>

            {/* Camera / Screenshot OCR */}
            <ConveneScanner
              directCameraOpen={directCameraOpen}
              closeDirectCamera={closeDirectCamera}
              captureDirectCamera={captureDirectCamera}
              directVideoRef={directVideoRef}
              directStreamRef={directStreamRef}
            />
            <div className="flex gap-2">
              <button onClick={openDirectCamera} className="kuro-btn flex-1 py-2 text-base text-center" disabled={directScanStatus === 'scanning'}>
                <Camera size={14} className="inline mr-1.5" />
                {directScanStatus === 'scanning' ? t('profile.importFlow.direct.scanning') : t('profile.importFlow.direct.openCamera')}
              </button>
              <label className="kuro-btn flex-1 py-2 text-base text-center cursor-pointer">
                <Upload size={14} className="inline mr-1.5" />{t('profile.importFlow.direct.uploadImage')}
                <input type="file" accept="image/*" onChange={(e) => handleScreenshotOcr(e.target.files?.[0])} className="hidden" />
              </label>
            </div>
            {directScanStatus === 'done' && <p className="text-emerald-400 text-sm text-center">{t('profile.importFlow.direct.idsExtracted')}</p>}
            {directScanStatus === 'error' && <p className="text-red-400 text-sm text-center">{directError}</p>}

            {/* Fetch button */}
            {directStatus === 'fetching' ? (
              <div className="space-y-2">
                <div className="flex items-center justify-center gap-2 py-3">
                  <Loader size={14} className="text-emerald-400 animate-spin" />
                  <span className="text-emerald-400 text-base">{t('profile.importFlow.direct.importing')}</span>
                </div>
                <div className="grid grid-cols-4 gap-1">
                  {Object.entries(directProgress).map(([pool, info]) => (
                    <div key={pool} className={`text-center p-1 rounded text-2xs ${info.status === 'done' ? 'text-emerald-400 bg-emerald-500/10' : info.status === 'error' ? 'text-red-400 bg-red-500/10' : 'text-gray-400 bg-white/5'}`}>
                      {POOL_LABELS[pool]?.split(' ')[0] || pool}: {info.count || '...'}
                    </div>
                  ))}
                </div>
                <button onClick={() => directAbortRef.current?.abort()} className="kuro-btn w-full py-1.5 text-base text-red-400">{t('profile.importFlow.direct.cancel')}</button>
              </div>
            ) : (
              <button
                onClick={handleDirectFetch}
                disabled={!directPlayerId.trim()}
                className={`kuro-btn w-full py-2 text-base ${directPlayerId.trim() ? 'active-emerald' : 'opacity-50'}`}
              >
                <Download size={14} className="inline mr-1.5" />{t('profile.importFlow.direct.import')}
              </button>
            )}

            {directStatus === 'done' && <p className="text-emerald-400 text-sm text-center">{t('profile.importFlow.direct.importComplete')}</p>}
            {directError && <p className="text-red-400 text-sm text-center">{directError}</p>}

            <p className="text-gray-500 text-sm">{t('profile.importFlow.direct.urlExpiresNote')}</p>
          </div>
        )}
      </CardBody>
    </Card>
  );
}
