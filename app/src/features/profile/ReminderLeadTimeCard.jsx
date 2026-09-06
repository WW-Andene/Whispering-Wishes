// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — ReminderLeadTimeCard
// Global lead-time setting for the Calendar/Chronology "Notify me when this ends"
// reminders (see AstriteCalendar.jsx + utils/localNotifications.js) — how long
// before an event's end date the on-device notification fires. Native-only, same
// precedent as PushNotificationsCard (renders nothing on the web build).
// ═══════════════════════════════════════════════════════════════════════════════

import React from 'react';
import { BellRing } from 'lucide-react';
import { Card, CardHeader, CardBody } from '../../shared/components/Card.jsx';
import { usePersistedState } from '../../hooks/usePersistedState.js';
import { isNativePlatform } from '../../utils/pushNotifications.js';
import { REMINDER_LEAD_HOURS_KEY, REMINDER_LEAD_HOURS_OPTIONS, DEFAULT_REMINDER_LEAD_HOURS } from '../../utils/localNotifications.js';
import { t } from '../../utils/i18n.js';

export default function ReminderLeadTimeCard() {
  const [leadHours, setLeadHours] = usePersistedState(REMINDER_LEAD_HOURS_KEY, DEFAULT_REMINDER_LEAD_HOURS);

  if (!isNativePlatform()) return null;

  return (
    <Card>
      <CardHeader><BellRing size={14} className="text-cyan-400 inline-block mr-1.5 -mt-0.5" />{t('profile.reminderLeadTime.title')}</CardHeader>
      <CardBody className="space-y-2">
        <p className="text-gray-400 text-sm">{t('profile.reminderLeadTime.description')}</p>
        <div className="flex gap-1.5">
          {REMINDER_LEAD_HOURS_OPTIONS.map(hours => (
            <button key={hours} onClick={() => setLeadHours(hours)}
              className={`kuro-btn flex-1 text-sm ${leadHours === hours ? 'active-gold' : ''}`} style={{ padding: '8px' }}>
              {t('profile.reminderLeadTime.hoursLabel', { hours })}
            </button>
          ))}
        </div>
        <p className="text-gray-500 text-2xs">{t('profile.reminderLeadTime.existingNote')}</p>
      </CardBody>
    </Card>
  );
}
