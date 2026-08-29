// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — PushNotificationsCard
// Opt-in toggle for push notifications on the native (Capacitor) app build.
// Native-only: renders nothing on the web build (see pushNotifications.js).
//
// Shows the raw FCM token once registered — there's no backend that sends
// anything to it yet (see pushNotifications.js header comment), so exposing
// it here lets it be pasted into the Firebase Console's "Send test message"
// tool for now rather than being invisible/unverifiable.
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useState, useEffect, useCallback } from 'react';
import { Bell, BellOff, Copy } from 'lucide-react';
import { Card, CardHeader, CardBody } from '../../shared/components/Card.jsx';
import { initPushNotifications, disablePushNotifications, isNativePlatform, getStoredPushToken, hasOptedIntoPush } from '../../utils/pushNotifications.js';
import { haptic } from '../../utils/haptics.js';
import { t } from '../../utils/i18n.js';

export default function PushNotificationsCard({ toast }) {
  const [native] = useState(isNativePlatform());
  const [enabled, setEnabled] = useState(hasOptedIntoPush());
  const [token, setToken] = useState(getStoredPushToken());
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (native && hasOptedIntoPush()) {
      initPushNotifications({ onToken: setToken }).catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [native]);

  if (!native) return null;

  const handleToggle = async () => {
    haptic.light();
    setBusy(true);
    try {
      if (enabled) {
        await disablePushNotifications();
        setEnabled(false);
      } else {
        const res = await initPushNotifications({ onToken: setToken });
        if (res.granted) {
          setEnabled(true);
          haptic.success();
        } else if (res.unavailable) {
          toast?.addToast?.(t('profile.pushNotifications.unavailable'), 'warning');
        } else {
          toast?.addToast?.(t('profile.pushNotifications.permissionDenied'), 'warning');
        }
      }
    } catch (err) {
      toast?.addToast?.(t('profile.pushNotifications.error', { error: err.message }), 'error');
    } finally {
      setBusy(false);
    }
  };

  const copyToken = async () => {
    if (!token) return;
    try {
      await navigator.clipboard.writeText(token);
      toast?.addToast?.(t('profile.pushNotifications.tokenCopied'), 'success');
      haptic.light();
    } catch {}
  };

  return (
    <Card>
      <CardHeader>{enabled ? <Bell size={14} className="text-cyan-400 inline-block mr-1.5 -mt-0.5" /> : <BellOff size={14} className="text-gray-400 inline-block mr-1.5 -mt-0.5" />}{t('profile.pushNotifications.title')}</CardHeader>
      <CardBody className="space-y-2">
        <p className="text-gray-400 text-sm">{t('profile.pushNotifications.description')}</p>
        <button onClick={handleToggle} disabled={busy} className={`kuro-btn kuro-btn-sm w-full ${enabled ? 'active-cyan' : ''} disabled:opacity-40`}>
          {enabled ? t('profile.pushNotifications.disable') : t('profile.pushNotifications.enable')}
        </button>
        {enabled && token && (
          <button onClick={copyToken} className="kuro-btn kuro-btn-sm w-full flex items-center justify-center gap-1 text-gray-400">
            <Copy size={12} /> {t('profile.pushNotifications.copyToken')}
          </button>
        )}
        {enabled && !token && <p className="text-gray-500 text-2xs">{t('profile.pushNotifications.registering')}</p>}
      </CardBody>
    </Card>
  );
}
