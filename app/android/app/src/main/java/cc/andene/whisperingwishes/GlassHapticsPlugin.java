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

// Replaces @capacitor/haptics on Android. That plugin's impact/notification
// styles are all VibrationEffect.createWaveform() — a raw amplitude ramp
// held for 43-60ms — which reads as a dull, soft "buzz" on most actuators.
//
// v1 used PRIMITIVE_TICK/LOW_TICK, which Android's own docs describe as
// deliberately soft/subtle — wrong primitive regardless of scale. v2 moved
// everything to PRIMITIVE_CLICK, which fixed the "soft" complaint but the
// multi-pulse patterns (success/warning/error) still read as a buzz
// ("zz zz zz") instead of distinct taps ("click click click"). Root cause:
// those pulses were only 18-40ms apart — below the ~50-60ms flutter-fusion
// threshold where human touch perception stops resolving separate impulses
// and merges them into one continuous vibration, regardless of how sharp
// each individual pulse is. Fixed by widening every inter-pulse gap to
// 70ms+.
//
// v3 also added a Vibrator.areAllPrimitivesSupported() hardware check
// before ever attempting PRIMITIVE_CLICK, meant to protect devices with no
// real composition-capable actuator from a buzzy OS-level emulation of the
// primitive. That backfired: it's known to report false on some real
// Xiaomi/MIUI devices whose actuator handles the primitive fine, which
// silently downgraded every single light/medium/heavy tap (fired on every
// button press) to the createOneShot() fallback — and a plain amplitude
// pulse rides an ERM-style motor's physical spin-up/coast-down time, which
// is exactly the buzz being complained about. Removed: just attempt the
// primitive unconditionally on API 30+, as v2 did — that was never the
// part users flagged as buzzy, only the multi-click spacing was.
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

    private boolean supportsClickPrimitive() {
        return Build.VERSION.SDK_INT >= 30;
    }

    @PluginMethod public void light(PluginCall call) { playClick(0.3f, 6, 130); call.resolve(); }
    @PluginMethod public void medium(PluginCall call) { playClick(0.65f, 7, 190); call.resolve(); }
    @PluginMethod public void heavy(PluginCall call) { playClick(1.0f, 8, 255); call.resolve(); }
    @PluginMethod public void success(PluginCall call) { playSuccess(); call.resolve(); }
    @PluginMethod public void warning(PluginCall call) { playWarning(); call.resolve(); }
    @PluginMethod public void error(PluginCall call) { playError(); call.resolve(); }

    // A single dry click — same primitive at every intensity, only the
    // amplitude changes, so "light" never turns into a longer/softer
    // sensation, just a quieter version of the same hard tap.
    @SuppressWarnings("deprecation")
    private void playClick(float scale, int fallbackDurationMs, int fallbackAmplitude) {
        if (supportsClickPrimitive()) {
            vibrator.vibrate(VibrationEffect.startComposition()
                .addPrimitive(VibrationEffect.Composition.PRIMITIVE_CLICK, scale)
                .compose());
        } else if (Build.VERSION.SDK_INT >= 26) {
            vibrator.vibrate(VibrationEffect.createOneShot(fallbackDurationMs, fallbackAmplitude));
        } else {
            vibrator.vibrate(fallbackDurationMs);
        }
    }

    // A single primitive click at `delayMs` into a composition, or the
    // matching single-pulse position in a legacy on/off waveform — shared by
    // the three multi-tap patterns below so their timing is defined once.
    private VibrationEffect.Composition addClick(VibrationEffect.Composition c, float scale, int delayMs) {
        return delayMs == 0 ? c.addPrimitive(VibrationEffect.Composition.PRIMITIVE_CLICK, scale)
                             : c.addPrimitive(VibrationEffect.Composition.PRIMITIVE_CLICK, scale, delayMs);
    }

    // Two hard clicks 90ms apart — comfortably above the ~50-60ms
    // flutter-fusion threshold, so it reads as two distinct taps ("click
    // click") instead of one continuous buzz.
    @SuppressWarnings("deprecation")
    private void playSuccess() {
        if (supportsClickPrimitive()) {
            vibrator.vibrate(addClick(addClick(VibrationEffect.startComposition(), 0.6f, 0), 1.0f, 90).compose());
        } else if (Build.VERSION.SDK_INT >= 26) {
            vibrator.vibrate(VibrationEffect.createWaveform(new long[] { 0, 6, 90, 7 }, new int[] { 0, 160, 0, 220 }, -1));
        } else {
            vibrator.vibrate(new long[] { 0, 6, 90, 7 }, -1);
        }
    }

    // Three short clicks, 80ms apart — a dry "toc toc toc" rattle, not a
    // rapid buzz.
    @SuppressWarnings("deprecation")
    private void playWarning() {
        if (supportsClickPrimitive()) {
            vibrator.vibrate(
                addClick(addClick(addClick(VibrationEffect.startComposition(), 0.8f, 0), 0.8f, 80), 0.8f, 80).compose()
            );
        } else if (Build.VERSION.SDK_INT >= 26) {
            vibrator.vibrate(VibrationEffect.createWaveform(new long[] { 0, 7, 80, 7, 80, 7 }, new int[] { 0, 190, 0, 190, 0, 190 }, -1));
        } else {
            vibrator.vibrate(new long[] { 0, 7, 80, 7, 80, 7 }, -1);
        }
    }

    // Two firm clicks 70ms apart — tighter than success's 90ms (reads as
    // more urgent) but still well clear of the fusion threshold.
    @SuppressWarnings("deprecation")
    private void playError() {
        if (supportsClickPrimitive()) {
            vibrator.vibrate(addClick(addClick(VibrationEffect.startComposition(), 1.0f, 0), 1.0f, 70).compose());
        } else if (Build.VERSION.SDK_INT >= 26) {
            vibrator.vibrate(VibrationEffect.createWaveform(new long[] { 0, 8, 70, 8 }, new int[] { 0, 230, 0, 255 }, -1));
        } else {
            vibrator.vibrate(new long[] { 0, 8, 70, 8 }, -1);
        }
    }
}
