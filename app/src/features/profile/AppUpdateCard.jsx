// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — AppUpdateCard
// "Check for Updates" for the native (Capacitor) app build — lets a user
// grab the latest APK from GitHub Releases without rebuilding it themselves
// or losing their local data by reinstalling from scratch. Native-only:
// renders nothing on the web build (see appUpdate.js).
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Download, CheckCircle2 } from 'lucide-react';
import { Card, CardHeader, CardBody } from '../../shared/components/Card.jsx';
import { checkForUpdate, downloadUpdate, isNativePlatform } from '../../utils/appUpdate.js';
import { haptic } from '../../utils/helpers.js';

export default function AppUpdateCard({ toast }) {
  const [native] = useState(isNativePlatform());
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const runCheck = useCallback(async () => {
    setChecking(true);
    setError(null);
    haptic.light();
    try {
      const res = await checkForUpdate();
      setResult(res);
      if (!res.hasUpdate) haptic.success();
    } catch (err) {
      setError(err.message || 'Check failed');
    } finally {
      setChecking(false);
    }
  }, []);

  useEffect(() => {
    if (native) runCheck();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [native]);

  if (!native) return null;

  const handleDownload = async () => {
    haptic.medium();
    try {
      await downloadUpdate(result.downloadUrl);
      toast?.addToast?.('Opening download — install it once it finishes.', 'info');
    } catch (err) {
      toast?.addToast?.(`Couldn't open download: ${err.message}`, 'error');
    }
  };

  return (
    <Card>
      <CardHeader action={
        <button onClick={runCheck} disabled={checking} className="kuro-btn kuro-btn-sm kuro-btn-icon disabled:opacity-40" aria-label="Check for updates">
          <RefreshCw size={14} className={checking ? 'animate-spin' : ''} />
        </button>
      }>App Update</CardHeader>
      <CardBody className="space-y-2">
        {checking && !result && <p className="text-gray-400 text-sm">Checking for updates…</p>}
        {error && <p className="text-red-400 text-sm">Couldn't check for updates: {error}</p>}
        {result && !result.hasUpdate && (
          <div className="flex items-center gap-2 text-emerald-400 text-sm">
            <CheckCircle2 size={16} /> Up to date ({result.currentVersion}, build {result.currentBuild})
          </div>
        )}
        {result && result.hasUpdate && (
          <div className="space-y-2">
            <div className="text-gray-200 text-sm">
              Update available: build {result.currentBuild} → {result.latestBuild}
            </div>
            {result.notes && <p className="text-gray-500 text-2xs whitespace-pre-wrap line-clamp-3">{result.notes}</p>}
            <button onClick={handleDownload} className="kuro-btn kuro-btn-sm flex items-center gap-1 w-full justify-center">
              <Download size={14} /> Download Update
            </button>
          </div>
        )}
      </CardBody>
    </Card>
  );
}
