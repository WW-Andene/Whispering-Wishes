package cc.andene.whisperingwishes;

import android.content.Context;
import android.os.Build;
import android.os.VibrationEffect;
import android.os.Vibrator;
import android.os.VibratorManager;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

// Replaces @capacitor/haptics on Android. History of what didn't work:
//   v1 — PRIMITIVE_TICK/LOW_TICK: Android's own docs call these deliberately
//        soft/subtle. Wrong primitive regardless of scale.
//   v2 — PRIMITIVE_CLICK: fixed "soft", but multi-pulse patterns were only
//        18-40ms apart — below the ~50-60ms flutter-fusion threshold where
//        touch perception merges separate impulses into one buzz. Widened
//        to 70-90ms.
//   v3 — added a Vibrator.areAllPrimitivesSupported() hardware check before
//        using the primitive at all: backfired, reports false on real
//        Xiaomi/MIUI hardware that renders it fine, silently downgrading
//        every tap to a worse fallback. Reverted.
//   v4 — still buzzy even with the primitive called directly and correctly
//        spaced. Conclusion: on this actual device, PRIMITIVE_CLICK isn't
//        rendered by real actuator hardware at all — the framework falls
//        back to its own generic approximation when the vendor HAL doesn't
//        implement composition primitives, and that approximation is
//        itself buzzy. No amount of primitive/spacing tuning fixes a
//        primitive that was never really hardware-rendered to begin with.
//
// This version drops VibrationEffect.Composition entirely and goes back to
// plain amplitude control (createOneShot/createWaveform, API 26+) — but
// pushed to the extreme opposite of the original "43-60ms ramp" problem:
// the shortest duration the platform will actually render (a handful of
// ms) at maximum amplitude. A pulse that short has no time to feel like a
// sustained buzz no matter how the actuator ramps, while still being sharp
// (full amplitude, no easing) rather than soft.
@CapacitorPlugin(name = "GlassHaptics")
public class GlassHapticsPlugin extends Plugin {
    private Vibrator vibrator;

    @Override
    public void load() {
        Context ctx = getContext();
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            VibratorManager vm = (VibratorManager) ctx.getSystemService(Context.VIBRATOR_MANAGER_SERVICE);
            vibrator = vm.getDefaultVibrator();
        } else {
            vibrator = getDeprecatedVibrator(ctx);
        }
    }

    @SuppressWarnings("deprecation")
    private Vibrator getDeprecatedVibrator(Context ctx) {
        return (Vibrator) ctx.getSystemService(Context.VIBRATOR_SERVICE);
    }

    @PluginMethod public void light(PluginCall call) { pulse(3, 160); call.resolve(); }
    @PluginMethod public void medium(PluginCall call) { pulse(4, 210); call.resolve(); }
    @PluginMethod public void heavy(PluginCall call) { pulse(6, 255); call.resolve(); }
    @PluginMethod public void success(PluginCall call) { playSuccess(); call.resolve(); }
    @PluginMethod public void warning(PluginCall call) { playWarning(); call.resolve(); }
    @PluginMethod public void error(PluginCall call) { playError(); call.resolve(); }

    // A single 3-6ms pulse at near-max amplitude — as short and hard as the
    // platform allows, so there's no window for the motor to ramp into a
    // felt buzz.
    @SuppressWarnings("deprecation")
    private void pulse(int durationMs, int amplitude) {
        if (Build.VERSION.SDK_INT >= 26) {
            vibrator.vibrate(VibrationEffect.createOneShot(durationMs, amplitude));
        } else {
            vibrator.vibrate(durationMs);
        }
    }

    // Two hard 3-4ms pulses 90ms apart — well clear of the flutter-fusion
    // threshold, so it reads as two distinct taps.
    @SuppressWarnings("deprecation")
    private void playSuccess() {
        if (Build.VERSION.SDK_INT >= 26) {
            vibrator.vibrate(VibrationEffect.createWaveform(new long[] { 0, 3, 90, 4 }, new int[] { 0, 150, 0, 220 }, -1));
        } else {
            vibrator.vibrate(new long[] { 0, 3, 90, 4 }, -1);
        }
    }

    // Three short pulses, 80ms apart.
    @SuppressWarnings("deprecation")
    private void playWarning() {
        if (Build.VERSION.SDK_INT >= 26) {
            vibrator.vibrate(VibrationEffect.createWaveform(new long[] { 0, 3, 80, 3, 80, 3 }, new int[] { 0, 190, 0, 190, 0, 190 }, -1));
        } else {
            vibrator.vibrate(new long[] { 0, 3, 80, 3, 80, 3 }, -1);
        }
    }

    // Two max-amplitude pulses 70ms apart — tighter than success's 90ms
    // (reads as more urgent) but still clear of the fusion threshold.
    @SuppressWarnings("deprecation")
    private void playError() {
        if (Build.VERSION.SDK_INT >= 26) {
            vibrator.vibrate(VibrationEffect.createWaveform(new long[] { 0, 4, 70, 5 }, new int[] { 0, 230, 0, 255 }, -1));
        } else {
            vibrator.vibrate(new long[] { 0, 4, 70, 5 }, -1);
        }
    }
}
