// ═══════════════════════════════════════════════════════════════════════════════
// ImportFlow — All import-related state and UI extracted from ProfileTab.jsx
// Includes: platform selector, import method tabs (file/paste/direct),
//           drag-and-drop, URL/ID fields, direct fetch, camera/OCR scanning
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Camera, Check, ClipboardList, Download, Gamepad2, Link, Loader, Monitor, Smartphone, Upload, X } from 'lucide-react';
import { parseGachaUrl, buildFetchParams, fetchAllPools, convertToImportFormat, compressImage, extractIdsFromImage, POOL_LABELS } from '../../utils/gachaImporter.js';
import { MAX_IMPORT_SIZE_MB } from '../../data/constants.js';
import { Card, CardHeader, CardBody } from '../../shared/components/Card.jsx';
import { ImportGuide } from '../../shared/components/ImportGuide.jsx';
import ConveneScanner from './ConveneScanner.jsx';

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
    if (!pid) { setDirectError('player_id is required.'); return; }
    try {
      const params = buildFetchParams(directUrl, pid, rid, directSvrId);
      if (directResourcesId) params.cardPoolId = directResourcesId;
      if (directGachaId) params.gachaId = directGachaId;
      if (directGachaType) params.gachaType = directGachaType;
      if (directLang) params.lang = directLang;
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
        setDirectError('No Convene data returned. The URL may be expired. Try getting a fresh one from the game.');
        return;
      }
      const jsonStr = convertToImportFormat({ ...result, playerId: pid });
      const success = await processImportData(jsonStr);
      if (success) {
        setDirectStatus('done');
      } else {
        setDirectStatus('error');
        setDirectError('Import processing failed');
      }
    } catch (err) {
      if (err.name === 'AbortError') { setDirectStatus('idle'); return; }
      setDirectStatus('error');
      setDirectError(err.message || 'Import failed');
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
      // Attach stream to video element after render (cleared on unmount via cameraTimerRef)
      clearTimeout(cameraTimerRef.current);
      cameraTimerRef.current = setTimeout(() => {
        if (directVideoRef.current) {
          directVideoRef.current.srcObject = stream;
          directVideoRef.current.play().catch(e => console.warn('[Camera] Video play failed:', e.message));
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
      toast?.addToast?.(`File too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Maximum is ${MAX_IMPORT_SIZE_MB}MB.`, 'error');
      e.target.value = '';
      return;
    }
    setImportStatus({ fileName: file.name, fileSize: (file.size / 1024).toFixed(1) });
    const reader = new FileReader();
    reader.onload = (ev) => {
      processImportData(ev.target.result).catch((err) => { toast?.addToast?.('Import failed: ' + (err?.message || 'Unknown error'), 'error'); }).finally(() => setImportStatus(null));
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
    reader.onload = (ev) => { processImportData(ev.target.result).catch((err) => { toast?.addToast?.('Import failed: ' + (err?.message || 'Unknown error'), 'error'); }).finally(() => setImportStatus(null)); };
    reader.onerror = () => { toast?.addToast?.('Failed to read file', 'error'); setImportStatus(null); };
    reader.readAsText(file);
  }, [processImportData, toast]);

  const handlePasteImport = useCallback(() => {
    if (!pasteJsonText.trim()) {
      toast?.addToast?.('Please paste your JSON data first', 'error');
      return;
    }
    processImportData(pasteJsonText).then((ok) => { if (ok) setPasteJsonText(''); }).catch((err) => { toast?.addToast?.('Import failed: ' + (err?.message || 'Unknown error'), 'error'); });
  }, [pasteJsonText, processImportData, toast]);

  return (
    <Card>
      <CardHeader>Import Convene History</CardHeader>
      <CardBody className="space-y-3">
        <p className="text-gray-300 text-sm">Import your Convene history directly from the game.</p>
        <div className="grid grid-cols-3 gap-2">
          {[['pc', 'PC', Monitor], ['android', 'Android', Smartphone], ['ps5', 'PS5', Gamepad2]].map(([k, l, Icon]) => (
            <button key={k} onClick={() => { setImportPlatform(k); if (k === 'pc' || k === 'android') setImportMethod('direct'); if (k === 'ps5') setImportMethod('direct'); }} aria-pressed={importPlatform === k} className={`kuro-btn p-2 text-center ${importPlatform === k ? 'active-gold' : ''}`}>
              <Icon size={16} className="mx-auto mb-0.5" /><div className="text-xs">{l}</div>
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
                  <span className="text-yellow-400/80 text-xs font-medium animate-pulse">Importing...</span>
                </div>
                <p className="text-yellow-400 text-xs font-medium kuro-number">{importStatus.fileName}</p>
                <p className="text-gray-500 text-xs mt-0.5">{importStatus.fileSize} KB - parsing...</p>
              </div>
            ) : (
            <div className={`p-4 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors ${isDragOver ? 'border-yellow-500 bg-yellow-500/10' : 'border-white/20 hover:border-yellow-500/50'}`}>
              <Upload size={20} className={`mx-auto mb-1 ${isDragOver ? 'text-yellow-400' : 'text-gray-300'}`} />
              <p className={`text-xs ${isDragOver ? 'text-yellow-400 font-medium' : 'text-gray-300'}`}>
                {isDragOver ? 'Drop JSON file here' : 'Upload or drag and drop a JSON file'}
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
              placeholder='Paste your JSON data here…

Example: {"pulls":[…]}'
              className="kuro-input w-full h-32 text-xs font-mono resize-none"
              spellCheck={false}
              aria-label="Paste import JSON data"
            />
            <div className="flex gap-2">
              <button
                onClick={handlePasteImport}
                disabled={!pasteJsonText.trim()}
                className={`kuro-btn flex-1 py-2 text-xs ${pasteJsonText.trim() ? 'active-emerald' : 'opacity-50'}`}
              >
                <Check size={14} className="inline mr-1.5" />Import
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
            <p className="text-gray-400 text-xs">
              Tip: In WuWa Tracker, go to Profile → Settings → Data → Export Convene History → Copy the JSON content.
            </p>
          </div>
        )}

        {/* Direct Import Method — fetch from WuWa API */}
        {importMethod === 'direct' && (
          <div className="space-y-2">
            <p className="text-gray-400 text-sm">Paste your Convene History URL below or enter IDs manually.</p>
            <input
              type="text"
              value={directUrl}
              onChange={(e) => handleDirectUrlChange(e.target.value)}
              placeholder="Paste Convene History URL here…"
              className="kuro-input w-full text-xs font-mono"
              spellCheck={false}
            />
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-gray-500 text-xs block mb-0.5">player_id</label>
                <input type="text" value={directPlayerId} onChange={(e) => setDirectPlayerId(e.target.value)} placeholder="e.g. 500123456" className="kuro-input w-full text-xs font-mono" />
              </div>
              <div>
                <label className="text-gray-500 text-xs block mb-0.5">record_id</label>
                <input type="text" value={directRecordId} onChange={(e) => setDirectRecordId(e.target.value)} placeholder="alphanumeric key" className="kuro-input w-full text-xs font-mono" />
              </div>
            </div>
            <div>
              <label className="text-gray-500 text-xs block mb-0.5">svr_id <span className="text-gray-600">(optional)</span></label>
              <input type="text" value={directSvrId} onChange={(e) => setDirectSvrId(e.target.value)} placeholder="e.g. 76" className="kuro-input w-full text-xs font-mono" />
            </div>
            <div>
              <label className="text-gray-500 text-xs block mb-0.5">resources_id <span className="text-gray-600">(optional)</span></label>
              <input type="text" value={directResourcesId} onChange={(e) => setDirectResourcesId(e.target.value)} placeholder="alphanumeric key" className="kuro-input w-full text-xs font-mono" />
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
              <button onClick={openDirectCamera} className="kuro-btn flex-1 py-2 text-xs text-center" disabled={directScanStatus === 'scanning'}>
                <Camera size={14} className="inline mr-1.5" />
                {directScanStatus === 'scanning' ? 'Scanning...' : 'Open Camera'}
              </button>
              <label className="kuro-btn flex-1 py-2 text-xs text-center cursor-pointer">
                <Upload size={14} className="inline mr-1.5" />Upload Image
                <input type="file" accept="image/*" onChange={(e) => handleScreenshotOcr(e.target.files?.[0])} className="hidden" />
              </label>
            </div>
            {directScanStatus === 'done' && <p className="text-emerald-400 text-xs text-center">IDs extracted successfully</p>}
            {directScanStatus === 'error' && <p className="text-red-400 text-xs text-center">{directError}</p>}

            {/* Fetch button */}
            {directStatus === 'fetching' ? (
              <div className="space-y-2">
                <div className="flex items-center justify-center gap-2 py-3">
                  <Loader size={14} className="text-emerald-400 animate-spin" />
                  <span className="text-emerald-400 text-xs">Importing...</span>
                </div>
                <div className="grid grid-cols-4 gap-1">
                  {Object.entries(directProgress).map(([pool, info]) => (
                    <div key={pool} className={`text-center p-1 rounded text-xs ${info.status === 'done' ? 'text-emerald-400 bg-emerald-500/10' : info.status === 'error' ? 'text-red-400 bg-red-500/10' : 'text-gray-400 bg-white/5'}`}>
                      {POOL_LABELS[pool]?.split(' ')[0] || pool}: {info.count || '...'}
                    </div>
                  ))}
                </div>
                <button onClick={() => directAbortRef.current?.abort()} className="kuro-btn w-full py-1.5 text-xs text-red-400">Cancel</button>
              </div>
            ) : (
              <button
                onClick={handleDirectFetch}
                disabled={!directPlayerId.trim()}
                className={`kuro-btn w-full py-2 text-xs ${directPlayerId.trim() ? 'active-emerald' : 'opacity-50'}`}
              >
                <Download size={14} className="inline mr-1.5" />Import
              </button>
            )}

            {directStatus === 'done' && <p className="text-emerald-400 text-xs text-center">Import complete!</p>}
            {directError && <p className="text-red-400 text-xs text-center">{directError}</p>}

            <p className="text-gray-500 text-xs">Open Convene History in-game and copy the URL from the browser address bar. The URL expires after some time.</p>
          </div>
        )}
      </CardBody>
    </Card>
  );
}
