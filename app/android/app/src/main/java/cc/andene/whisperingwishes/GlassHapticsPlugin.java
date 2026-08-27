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

    // Now that light() also uses CONTEXT_CLICK (see above), a single one here
    // would be indistinguishable from a light tap — fired twice, 40ms apart,
    // instead, so medium still reads as a firmer double-click rather than
    // needing a whole different (and likely softer) constant.
    @PluginMethod
    public void medium(PluginCall call) {
        int click = Build.VERSION.SDK_INT >= 23 ? HapticFeedbackConstants.CONTEXT_CLICK : HapticFeedbackConstants.KEYBOARD_TAP;
        fire(click, 0);
        fire(click, 40);
        call.resolve();
    }

    @PluginMethod
    public void heavy(PluginCall call) {
        fire(HapticFeedbackConstants.LONG_PRESS, 0);
        call.resolve();
    }

    // Keyboard-tap, then a firmer confirm ~90ms later — a light-then-hard
    // double tap.
    @PluginMethod
    public void success(PluginCall call) {
        int confirm = Build.VERSION.SDK_INT >= 30 ? HapticFeedbackConstants.CONFIRM : HapticFeedbackConstants.LONG_PRESS;
        fire(HapticFeedbackConstants.KEYBOARD_TAP, 0);
        fire(confirm, 90);
        call.resolve();
    }

    // Three keyboard-taps 80ms apart.
    @PluginMethod
    public void warning(PluginCall call) {
        fire(HapticFeedbackConstants.KEYBOARD_TAP, 0);
        fire(HapticFeedbackConstants.KEYBOARD_TAP, 80);
        fire(HapticFeedbackConstants.KEYBOARD_TAP, 160);
        call.resolve();
    }

    // A dedicated "reject" feedback where available, repeated 70ms later —
    // tighter spacing than success so it still reads as more urgent.
    @PluginMethod
    public void error(PluginCall call) {
        int reject = Build.VERSION.SDK_INT >= 30 ? HapticFeedbackConstants.REJECT : HapticFeedbackConstants.LONG_PRESS;
        fire(reject, 0);
        fire(reject, 70);
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
