// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — PullBubbleCard
// Opt-in toggle for PullBubbleService's persistent floating "chat heads" pull
// bubble, on the native (Capacitor) app build. Native-only: renders nothing on
// the web build. This is the entry point that does NOT require placing
// PulseBannerWidget on the home screen — the whole point of asking for it.
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useState, useEffect, useRef } from 'react';
import { Circle, CircleOff } from 'lucide-react';
import { Card, CardHeader, CardBody } from '../../shared/components/Card.jsx';
import { isNativePlatform, isPullBubbleEnabled, togglePullBubble, canDrawOverlays, requestOverlayPermission } from '../../utils/pullBubble.js';
import { haptic } from '../../utils/haptics.js';
import { t } from '../../utils/i18n.js';

export default function PullBubbleCard({ toast }) {
  const [native] = useState(isNativePlatform());
  const [enabled, setEnabled] = useState(false);
  const [busy, setBusy] = useState(false);
  // Set right before sending the user to Settings for "Display over other apps" — Android gives
  // that permission NO in-app Allow/Deny dialog at all (a deliberate OS restriction since API 23,
  // to prevent exactly the kind of instant-grant an overlay permission could abuse for
  // tapjacking; every app hits this same detour, this isn't something we can route around).
  // What WAS avoidable: without this flag, coming back from Settings left the toggle exactly
  // where it was, silently requiring a second manual tap even though the permission was already
  // granted. Now the app-resume listener below finishes the job on its own.
  const pendingEnableRef = useRef(false);

  useEffect(() => {
    if (!native) return;
    isPullBubbleEnabled().then(setEnabled);
  }, [native]);

  // Finishes enabling the bubble automatically once the user comes back from the overlay
  // permission Settings screen, instead of requiring them to press the toggle a second time.
  useEffect(() => {
    if (!native) return;
    let listenerHandle;
    (async () => {
      const { App } = await import('@capacitor/app');
      listenerHandle = await App.addListener('appStateChange', async ({ isActive }) => {
        if (!isActive || !pendingEnableRef.current) return;
        pendingEnableRef.current = false;
        if (!(await canDrawOverlays())) return; // still not granted — nothing to finish
        try {
          await togglePullBubble();
          setEnabled(await isPullBubbleEnabled());
          haptic.success();
          toast?.addToast?.(t('profile.pullBubble.permissionGranted'), 'success');
        } catch (err) {
          toast?.addToast?.(t('profile.pullBubble.error', { error: err.message }), 'error');
        }
      });
    })();
    return () => { listenerHandle?.remove(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [native]);

  if (!native) return null;

  const handleToggle = async () => {
    haptic.light();
    setBusy(true);
    try {
      const hasOverlay = await canDrawOverlays();
      if (!enabled && !hasOverlay) {
        // Same permission PullBubbleService/FloatingVideoOverlayService would
        // request automatically on first use — asked proactively here so the
        // toggle's own state doesn't flip to "on" for a bubble that can't
        // actually appear yet.
        pendingEnableRef.current = true;
        await requestOverlayPermission();
        toast?.addToast?.(t('profile.pullBubble.permissionNeeded'), 'warning');
        return;
      }
      await togglePullBubble();
      // PullBubbleService.isRunning() flips synchronously inside the native
      // toggle call, so a fresh read right after reflects the new state
      // (unlike push notifications, there's no async registration step here).
      setEnabled(await isPullBubbleEnabled());
      haptic.success();
    } catch (err) {
      toast?.addToast?.(t('profile.pullBubble.error', { error: err.message }), 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card>
      <CardHeader>{enabled ? <Circle size={14} className="text-cyan-400 inline-block mr-1.5 -mt-0.5" fill="currentColor" /> : <CircleOff size={14} className="text-gray-400 inline-block mr-1.5 -mt-0.5" />}{t('profile.pullBubble.title')}</CardHeader>
      <CardBody className="space-y-2">
        <p className="text-gray-400 text-sm">{t('profile.pullBubble.description')}</p>
        <button onClick={handleToggle} disabled={busy} className={`kuro-btn kuro-btn-sm w-full ${enabled ? 'active-cyan' : ''} disabled:opacity-40`}>
          {enabled ? t('profile.pullBubble.disable') : t('profile.pullBubble.enable')}
        </button>
      </CardBody>
    </Card>
  );
}
