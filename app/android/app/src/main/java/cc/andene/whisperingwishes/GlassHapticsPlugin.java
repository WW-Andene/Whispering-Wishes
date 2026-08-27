package cc.andene.whisperingwishes;

import android.content.Context;
import android.os.Build;
import android.os.Handler;
import android.os.Looper;
import android.os.VibrationEffect;
import android.os.Vibrator;
import android.os.VibratorManager;
import android.view.HapticFeedbackConstants;
import android.view.View;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import java.lang.reflect.Method;

// Complete rewrite — every earlier version of this plugin (raw
// createWaveform, VibrationEffect.Composition primitives, short/long raw
// pulses) went through the Vibrator API, and none of them matched the
// user's own system keyboard's tap feel, no matter how duration/amplitude/
// primitive was tuned. Confirmed on-device: the system keyboard (MIUI) DOES
// produce a crisp, distinct tap on this exact hardware — so the motor is
// capable of it, and the bottleneck was never the actuator. The reason is
// architectural: a system keyboard's key tap doesn't call Vibrator at all.
// It calls View.performHapticFeedback(int) with a HapticFeedbackConstants
// value (KEYBOARD_TAP for a keyboard) — a completely separate Android API
// that routes through the OEM's own tuned haptic composer for that specific
// feedback *constant*, not the generic Vibrator/VibrationEffect pipeline.
// No Vibrator call, however tuned, can reach that path — only
// performHapticFeedback() can.
//
// Multi-part patterns (success/warning/error) can't be expressed as a
// single composed effect the way VibrationEffect.Composition allowed —
// performHapticFeedback() fires one named feedback per call — so they're
// built by sequencing separate calls with Handler.postDelayed() instead.
@CapacitorPlugin(name = "GlassHaptics")
public class GlassHapticsPlugin extends Plugin {
    private final Handler mainHandler = new Handler(Looper.getMainLooper());

    // View methods must run on the main thread; Capacitor plugin methods
    // don't guarantee that, so every feedback fire — including single taps
    // — goes through postDelayed (0ms delay = "now") rather than calling
    // performHapticFeedback() directly from whatever thread invoked us.
    private void fire(int constant, int delayMs) {
        mainHandler.postDelayed(() -> {
            if (getBridge() == null) return;
            View webView = getBridge().getWebView();
            if (webView != null) webView.performHapticFeedback(constant);
        }, delayMs);
    }

    // 2026-08-27: switched from KEYBOARD_TAP to CONTEXT_CLICK — requested
    // feel was "short, dry, hard, like a nail on glass". KEYBOARD_TAP is
    // tuned by OEMs for the soft feel of typing; CONTEXT_CLICK is the
    // documented sharper, more percussive constant (a definite click, not a
    // typing tap) and is the closer match. Falls back to KEYBOARD_TAP below
    // API 23 (CONTEXT_CLICK's minimum), same guard already used by medium().
    @PluginMethod
    public void light(PluginCall call) {
        fire(Build.VERSION.SDK_INT >= 23 ? HapticFeedbackConstants.CONTEXT_CLICK : HapticFeedbackConstants.KEYBOARD_TAP, 0);
        call.resolve();
    }

    // 2026-08-27: on API 35+ (this device included), each level below now
    // tries a real frequency/amplitude envelope first — MainActivity's
    // low-latency tap bridge already proved this path (not the old
    // Composition-primitive/createWaveform attempts referenced in the class
    // comment above) can shape a genuinely distinct, textured feel on this
    // hardware, not just "loud vs quiet, long vs short". Frequency here is
    // expressed as a multiple of the actuator's own resonant frequency —
    // lower multiples read as a duller/heavier thud, the full 1.0x as the
    // sharpest, thinnest click (used by light's snap). Falls through to the
    // existing performHapticFeedback sequence below API 35 or if the
    // reflection call fails for any reason (unsupported hardware, wrong
    // method signature on this OS build, etc).
    private static final class EnvPoint {
        final float amp, freqMul; final long ms;
        EnvPoint(float amp, float freqMul, long ms) { this.amp = amp; this.freqMul = freqMul; this.ms = ms; }
    }

    private boolean tryEnvelope(EnvPoint[] points) {
        try {
            if (Build.VERSION.SDK_INT < 35) return false;
            Vibrator vibrator = getVibrator();
            if (vibrator == null) return false;

            Method supportedMethod = Vibrator.class.getMethod("areEnvelopeEffectsSupported");
            if (!(Boolean) supportedMethod.invoke(vibrator)) return false;

            float resonantHz = 150f; // typical phone LRA resonant frequency, used as a fallback
            try {
                Method resonantMethod = Vibrator.class.getMethod("getResonantFrequency");
                float reported = (float) resonantMethod.invoke(vibrator);
                if (reported > 0) resonantHz = reported;
            } catch (Exception ignored) {
                // getResonantFrequency() not available/reported — keep the fallback.
            }

            Class<?> builderClass = Class.forName("android.os.VibrationEffect$WaveformEnvelopeBuilder");
            Object builder = builderClass.getConstructor().newInstance();
            Method addControlPoint = builderClass.getMethod("addControlPoint", float.class, float.class, long.class);
            for (EnvPoint p : points) {
                addControlPoint.invoke(builder, p.amp, resonantHz * p.freqMul, p.ms);
            }

            Object effect = builderClass.getMethod("build").invoke(builder);
            Vibrator.class.getMethod("vibrate", VibrationEffect.class).invoke(vibrator, effect);
            return true;
        } catch (Throwable t) {
            // Wrong method name/signature for this OS build, unsupported
            // hardware, or any other reflection failure — fall through.
            return false;
        }
    }

    // Firmer double-snap than light's single one — same 1.0x-resonance snap
    // shape repeated with a silent gap in between, encoded as one precise
    // envelope instead of two separately-scheduled performHapticFeedback
    // calls (removes Handler/JS-bridge timing jitter between the two hits).
    private static final EnvPoint[] MEDIUM_ENVELOPE = {
        new EnvPoint(1.0f, 1.0f, 3), new EnvPoint(0.0f, 1.0f, 1),
        new EnvPoint(0.0f, 1.0f, 36),
        new EnvPoint(1.0f, 1.0f, 3), new EnvPoint(0.0f, 1.0f, 1),
    };

    // Now that light() also uses CONTEXT_CLICK (see above), a single one here
    // would be indistinguishable from a light tap — fired twice, 40ms apart,
    // instead, so medium still reads as a firmer double-click rather than
    // needing a whole different (and likely softer) constant.
    @PluginMethod
    public void medium(PluginCall call) {
        if (!tryEnvelope(MEDIUM_ENVELOPE)) {
            int click = Build.VERSION.SDK_INT >= 23 ? HapticFeedbackConstants.CONTEXT_CLICK : HapticFeedbackConstants.KEYBOARD_TAP;
            fire(click, 0);
            fire(click, 40);
        }
        call.resolve();
    }

    // A single low-frequency (0.5x resonance) punch, held longer than
    // light/medium's snaps — lower frequency reads as deeper/heavier, the
    // longer hold as more deliberate than a quick click.
    private static final EnvPoint[] HEAVY_ENVELOPE = {
        new EnvPoint(1.0f, 0.5f, 8), new EnvPoint(0.0f, 0.5f, 3),
    };

    @PluginMethod
    public void heavy(PluginCall call) {
        if (!tryEnvelope(HEAVY_ENVELOPE)) {
            fire(HapticFeedbackConstants.LONG_PRESS, 0);
        }
        call.resolve();
    }

    // A low thud followed by a bright full-resonance click — a rising,
    // two-tone "confirm" texture rather than two identical hits.
    private static final EnvPoint[] SUCCESS_ENVELOPE = {
        new EnvPoint(1.0f, 0.5f, 6), new EnvPoint(0.0f, 0.5f, 2),
        new EnvPoint(0.0f, 0.5f, 60),
        new EnvPoint(1.0f, 1.0f, 3), new EnvPoint(0.0f, 1.0f, 1),
    };

    // Keyboard-tap, then a firmer confirm ~90ms later — a light-then-hard
    // double tap. (Fallback for below API 35 / no envelope support.)
    @PluginMethod
    public void success(PluginCall call) {
        if (!tryEnvelope(SUCCESS_ENVELOPE)) {
            int confirm = Build.VERSION.SDK_INT >= 30 ? HapticFeedbackConstants.CONFIRM : HapticFeedbackConstants.LONG_PRESS;
            fire(HapticFeedbackConstants.KEYBOARD_TAP, 0);
            fire(confirm, 90);
        }
        call.resolve();
    }

    // Three mid-frequency (0.7x resonance) pulses — a rattling texture
    // distinct from success/error's cleaner hits.
    private static final EnvPoint[] WARNING_ENVELOPE = {
        new EnvPoint(1.0f, 0.7f, 4), new EnvPoint(0.0f, 0.7f, 2), new EnvPoint(0.0f, 0.7f, 44),
        new EnvPoint(1.0f, 0.7f, 4), new EnvPoint(0.0f, 0.7f, 2), new EnvPoint(0.0f, 0.7f, 44),
        new EnvPoint(1.0f, 0.7f, 4), new EnvPoint(0.0f, 0.7f, 2),
    };

    // Three keyboard-taps 80ms apart. (Fallback for below API 35 / no
    // envelope support.)
    @PluginMethod
    public void warning(PluginCall call) {
        if (!tryEnvelope(WARNING_ENVELOPE)) {
            fire(HapticFeedbackConstants.KEYBOARD_TAP, 0);
            fire(HapticFeedbackConstants.KEYBOARD_TAP, 80);
            fire(HapticFeedbackConstants.KEYBOARD_TAP, 160);
        }
        call.resolve();
    }

    // Two sharp, deep (0.35x resonance) hits close together — the lowest,
    // buzziest texture of the set, meant to read as more urgent/negative
    // than heavy's single mid-low punch.
    private static final EnvPoint[] ERROR_ENVELOPE = {
        new EnvPoint(1.0f, 0.35f, 10), new EnvPoint(0.0f, 0.35f, 3),
        new EnvPoint(0.0f, 0.35f, 40),
        new EnvPoint(1.0f, 0.35f, 10), new EnvPoint(0.0f, 0.35f, 3),
    };

    // A dedicated "reject" feedback where available, repeated 70ms later —
    // tighter spacing than success so it still reads as more urgent.
    // (Fallback for below API 35 / no envelope support.)
    @PluginMethod
    public void error(PluginCall call) {
        if (!tryEnvelope(ERROR_ENVELOPE)) {
            int reject = Build.VERSION.SDK_INT >= 30 ? HapticFeedbackConstants.REJECT : HapticFeedbackConstants.LONG_PRESS;
            fire(reject, 0);
            fire(reject, 70);
        }
        call.resolve();
    }

    // ═══════════════════════════════════════════════════════════════════════
    // DIAGNOSTIC LAB — every remaining untried variable in the vibration
    // module's public surface, for one-shot manual A/B testing on-device.
    // Not used by the app's real UI (see helpers.js) — wired to a temporary
    // "Haptic Lab" section in ProfileTab instead. Delete once the search for
    // a distinguishable feel on this hardware concludes either way.
    // ═══════════════════════════════════════════════════════════════════════

    @SuppressWarnings("deprecation")
    private Vibrator getVibrator() {
        Context ctx = getContext();
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            VibratorManager vm = (VibratorManager) ctx.getSystemService(Context.VIBRATOR_MANAGER_SERVICE);
            return vm != null ? vm.getDefaultVibrator() : null;
        }
        return (Vibrator) ctx.getSystemService(Context.VIBRATOR_SERVICE);
    }

    private void firePrimitive(int primitiveId, PluginCall call) {
        if (Build.VERSION.SDK_INT < 30) { call.reject("Requires API 30+"); return; }
        Vibrator v = getVibrator();
        if (v == null) { call.reject("No vibrator"); return; }
        v.vibrate(VibrationEffect.startComposition().addPrimitive(primitiveId, 1.0f).compose());
        call.resolve();
    }

    // Never tried: every Composition primitive besides CLICK/TICK/LOW_TICK.
    @PluginMethod public void labThud(PluginCall call) { firePrimitive(VibrationEffect.Composition.PRIMITIVE_THUD, call); }
    @PluginMethod public void labSpin(PluginCall call) { firePrimitive(VibrationEffect.Composition.PRIMITIVE_SPIN, call); }
    @PluginMethod public void labQuickRise(PluginCall call) { firePrimitive(VibrationEffect.Composition.PRIMITIVE_QUICK_RISE, call); }
    @PluginMethod public void labSlowRise(PluginCall call) { firePrimitive(VibrationEffect.Composition.PRIMITIVE_SLOW_RISE, call); }
    @PluginMethod public void labQuickFall(PluginCall call) { firePrimitive(VibrationEffect.Composition.PRIMITIVE_QUICK_FALL, call); }

    private void fireConstant(int constant, int minApi, PluginCall call) {
        if (Build.VERSION.SDK_INT < minApi) { call.reject("Requires API " + minApi + "+"); return; }
        if (getBridge() == null) { call.reject("No bridge"); return; }
        View webView = getBridge().getWebView();
        if (webView == null) { call.reject("No webview"); return; }
        webView.performHapticFeedback(constant);
        call.resolve();
    }

    // Never tried: every HapticFeedbackConstants value besides
    // KEYBOARD_TAP/CONTEXT_CLICK/LONG_PRESS/CONFIRM/REJECT.
    @PluginMethod public void labClockTick(PluginCall call) { fireConstant(HapticFeedbackConstants.CLOCK_TICK, 1, call); }
    @PluginMethod public void labGestureStart(PluginCall call) { fireConstant(HapticFeedbackConstants.GESTURE_START, 30, call); }
    @PluginMethod public void labGestureEnd(PluginCall call) { fireConstant(HapticFeedbackConstants.GESTURE_END, 30, call); }
    @PluginMethod public void labSegmentTick(PluginCall call) { fireConstant(HapticFeedbackConstants.SEGMENT_TICK, 30, call); }
    @PluginMethod public void labSegmentFrequentTick(PluginCall call) { fireConstant(HapticFeedbackConstants.SEGMENT_FREQUENT_TICK, 30, call); }
    @PluginMethod public void labToggleOn(PluginCall call) { fireConstant(HapticFeedbackConstants.TOGGLE_ON, 34, call); }
    @PluginMethod public void labToggleOff(PluginCall call) { fireConstant(HapticFeedbackConstants.TOGGLE_OFF, 34, call); }
    @PluginMethod public void labDragStart(PluginCall call) { fireConstant(HapticFeedbackConstants.DRAG_START, 34, call); }

    // Never tried: performHapticFeedback's flags parameter — this bypasses
    // the per-view "haptic enabled" setting check entirely, in case that
    // check (not the constant/API choice) was silently downgrading every
    // previous attempt to a generic renderer.
    @PluginMethod
    public void labKeyboardTapIgnoreSetting(PluginCall call) {
        if (getBridge() == null) { call.reject("No bridge"); return; }
        View webView = getBridge().getWebView();
        if (webView == null) { call.reject("No webview"); return; }
        webView.performHapticFeedback(HapticFeedbackConstants.KEYBOARD_TAP, HapticFeedbackConstants.FLAG_IGNORE_VIEW_SETTING);
        call.resolve();
    }
}
