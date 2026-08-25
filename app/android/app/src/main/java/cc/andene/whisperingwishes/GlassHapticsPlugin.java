package cc.andene.whisperingwishes;

import android.os.Build;
import android.os.Handler;
import android.os.Looper;
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

    @PluginMethod
    public void light(PluginCall call) {
        fire(HapticFeedbackConstants.KEYBOARD_TAP, 0);
        call.resolve();
    }

    @PluginMethod
    public void medium(PluginCall call) {
        fire(Build.VERSION.SDK_INT >= 23 ? HapticFeedbackConstants.CONTEXT_CLICK : HapticFeedbackConstants.KEYBOARD_TAP, 0);
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
}
