// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — utils/localNotifications.js
// On-device reminders for Calendar/Chronology events (banner ends, limited-time
// events, etc.) — native (Capacitor) only, same precedent as pushNotifications.js.
//
// Unlike pushNotifications.js (server-broadcast, admin-triggered, same message to
// every opted-in device), these are scheduled entirely on-device from data the app
// already has (an event's own end date) — no backend, no account, no external
// service. Each reminder is keyed by a stable string id (derived from the event's
// own key + its end date) hashed down to the 32-bit int Capacitor requires, so
// re-scheduling the same event/date is idempotent and toggling it off cancels the
// exact same id.
// ═══════════════════════════════════════════════════════════════════════════════

import { LocalNotifications } from '@capacitor/local-notifications';
import { isNativePlatform } from './pushNotifications.js';

// Global lead-time setting (Profile → ReminderLeadTimeCard) for how long before an event's
// end date its reminder fires. Read directly from localStorage (rather than via
// usePersistedState) since this module is used from plain functions, not components.
export const REMINDER_LEAD_HOURS_KEY = 'ww-reminder-lead-hours';
export const REMINDER_LEAD_HOURS_OPTIONS = [3, 6, 12, 24];
export const DEFAULT_REMINDER_LEAD_HOURS = 24;

export function getReminderLeadHours() {
  try {
    const raw = localStorage.getItem(REMINDER_LEAD_HOURS_KEY);
    const hours = raw !== null ? JSON.parse(raw) : DEFAULT_REMINDER_LEAD_HOURS;
    return REMINDER_LEAD_HOURS_OPTIONS.includes(hours) ? hours : DEFAULT_REMINDER_LEAD_HOURS;
  } catch { return DEFAULT_REMINDER_LEAD_HOURS; }
}

// Deterministic string -> positive 31-bit int (Capacitor notification ids must fit
// a Java int). Collisions are astronomically unlikely for this app's small event
// key space and harmless anyway (worst case: two reminders overwrite each other).
function hashToId(key) {
  let h = 0;
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) | 0;
  return Math.abs(h) % 2147483647;
}

export async function hasLocalNotificationPermission() {
  if (!isNativePlatform()) return false;
  try { return (await LocalNotifications.checkPermissions()).display === 'granted'; }
  catch { return false; }
}

export async function requestLocalNotificationPermission() {
  if (!isNativePlatform()) return false;
  try { return (await LocalNotifications.requestPermissions()).display === 'granted'; }
  catch { return false; }
}

// Schedules a one-off reminder for the event identified by `key`, firing
// getReminderLeadHours() hours before `endDate` (the event's real end date/time).
// Re-scheduling the same key replaces any prior reminder under it (Capacitor
// overwrites on matching id). Returns false if permission isn't granted/grantable
// or the computed fire time has already passed.
export async function scheduleEventReminder({ key, title, body, endDate }) {
  if (!isNativePlatform() || !key || !endDate) return false;
  const leadHours = getReminderLeadHours();
  const at = new Date(endDate.getTime() - leadHours * 3600000);
  if (at.getTime() <= Date.now()) return false;
  const granted = await hasLocalNotificationPermission() || await requestLocalNotificationPermission();
  if (!granted) return false;
  try {
    await LocalNotifications.schedule({ notifications: [{ id: hashToId(key), title, body, schedule: { at } }] });
    return true;
  } catch (err) {
    console.warn('scheduleEventReminder failed:', err?.message || err);
    return false;
  }
}

export async function cancelEventReminder(key) {
  if (!isNativePlatform() || !key) return;
  try { await LocalNotifications.cancel({ notifications: [{ id: hashToId(key) }] }); } catch {}
}

export async function isEventReminderScheduled(key) {
  if (!isNativePlatform() || !key) return false;
  try {
    const id = hashToId(key);
    const pending = await LocalNotifications.getPending();
    return pending.notifications.some(n => n.id === id);
  } catch { return false; }
}
