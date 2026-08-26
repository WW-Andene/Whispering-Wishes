// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — HapticLabCard
// TEMPORARY diagnostic card — every remaining untried variable in Android's
// vibration module (Composition primitives beyond CLICK/TICK/LOW_TICK,
// HapticFeedbackConstants beyond KEYBOARD_TAP/CONTEXT_CLICK/LONG_PRESS/
// CONFIRM/REJECT, and the FLAG_IGNORE_VIEW_SETTING flag) as one-tap buttons,
// for on-device A/B testing. Not used by the app's real feedback (see
// utils/haptics.js) — delete this file and its GlassHapticsPlugin.java lab*
// methods once the search concludes either way.
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useState } from 'react';
import { FlaskConical } from 'lucide-react';
import { Card, CardHeader, CardBody } from '../../shared/components/Card.jsx';
// Shares the app's one GlassHaptics bridge from utils/haptics.js instead of
// calling registerPlugin('GlassHaptics') a second time here — a prior
// version of this file created its own independent plugin proxy, which
// worked but meant two separate JS-side handles onto the same native plugin.
import { haptic, GlassHaptics, isNativePlatform } from '../../utils/haptics.js';

const LAB_ITEMS = [
  { key: 'labThud', label: 'PRIMITIVE_THUD' },
  { key: 'labSpin', label: 'PRIMITIVE_SPIN' },
  { key: 'labQuickRise', label: 'PRIMITIVE_QUICK_RISE' },
  { key: 'labSlowRise', label: 'PRIMITIVE_SLOW_RISE' },
  { key: 'labQuickFall', label: 'PRIMITIVE_QUICK_FALL' },
  { key: 'labClockTick', label: 'CLOCK_TICK' },
  { key: 'labGestureStart', label: 'GESTURE_START' },
  { key: 'labGestureEnd', label: 'GESTURE_END' },
  { key: 'labSegmentTick', label: 'SEGMENT_TICK' },
  { key: 'labSegmentFrequentTick', label: 'SEGMENT_FREQUENT_TICK' },
  { key: 'labToggleOn', label: 'TOGGLE_ON' },
  { key: 'labToggleOff', label: 'TOGGLE_OFF' },
  { key: 'labDragStart', label: 'DRAG_START' },
  { key: 'labKeyboardTapIgnoreSetting', label: 'KEYBOARD_TAP + IGNORE_VIEW_SETTING' },
];

export default function HapticLabCard() {
  const [native] = useState(isNativePlatform());
  const [status, setStatus] = useState({});

  if (!native) return null;

  const run = async (key) => {
    haptic.light();
    try {
      await GlassHaptics[key]();
      setStatus((s) => ({ ...s, [key]: 'ok' }));
    } catch (err) {
      setStatus((s) => ({ ...s, [key]: err.message || 'unsupported' }));
    }
  };

  return (
    <Card>
      <CardHeader><FlaskConical size={14} className="text-orange-400 inline-block mr-1.5 -mt-0.5" /> Haptic Lab (diagnostic)</CardHeader>
      <CardBody className="space-y-2">
        <p className="text-gray-400 text-sm">Carte temporaire — chaque bouton teste une primitive/constante de vibration jamais essayée. Tape chacune et note laquelle sent différent.</p>
        <div className="grid grid-cols-2 gap-2">
          {LAB_ITEMS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => run(key)}
              className="kuro-btn kuro-btn-sm text-left flex flex-col items-start gap-0.5 py-2"
            >
              <span className="text-2xs font-mono">{label}</span>
              {status[key] && <span className={`text-2xs ${status[key] === 'ok' ? 'text-emerald-400' : 'text-red-400'}`}>{status[key] === 'ok' ? 'déclenché' : status[key]}</span>}
            </button>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}
