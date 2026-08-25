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
// v1 of this plugin used PRIMITIVE_TICK/PRIMITIVE_LOW_TICK for the base
// taps, which turned out to still feel "too full and deep" — Android's own
// docs describe LOW_TICK/TICK as deliberately soft/subtle sensations, the
// opposite of what was wanted. Switched entirely to PRIMITIVE_CLICK (varying
// only its scale/amplitude, never swapping in a softer primitive) — a
// single sharp, dry transient with no resonant tail, closer to a mechanical
// keyboard-style key click (e.g. MIUI's own keyboard tap feedback) than a
// vibration motor buzz. Falls back through createPredefined(EFFECT_CLICK)
// (API 29) and short, high-amplitude createOneShot()/legacy vibrate() on
// older OS versions with no primitive-composition API at all — every
// fallback tier stays short-and-sharp rather than reaching for a softer
// effect just because the primitive API isn't available.
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

    @PluginMethod public void light(PluginCall call) { playClick(0.3f, 8, 130); call.resolve(); }
    @PluginMethod public void medium(PluginCall call) { playClick(0.65f, 9, 190); call.resolve(); }
    @PluginMethod public void heavy(PluginCall call) { playClick(1.0f, 10, 255); call.resolve(); }
    @PluginMethod public void success(PluginCall call) { playSuccess(); call.resolve(); }
    @PluginMethod public void warning(PluginCall call) { playWarning(); call.resolve(); }
    @PluginMethod public void error(PluginCall call) { playError(); call.resolve(); }

    // A single dry click — same primitive at every intensity, only the
    // amplitude/scale changes, so "light" never turns into a softer/longer
    // sensation, just a quieter version of the same hard tap.
    @SuppressWarnings("deprecation")
    private void playClick(float scale, int fallbackDurationMs, int fallbackAmplitude) {
        if (Build.VERSION.SDK_INT >= 30) {
            vibrator.vibrate(VibrationEffect.startComposition()
                .addPrimitive(VibrationEffect.Composition.PRIMITIVE_CLICK, scale)
                .compose());
        } else if (Build.VERSION.SDK_INT >= 29) {
            vibrator.vibrate(VibrationEffect.createPredefined(VibrationEffect.EFFECT_CLICK));
        } else if (Build.VERSION.SDK_INT >= 26) {
            vibrator.vibrate(VibrationEffect.createOneShot(fallbackDurationMs, fallbackAmplitude));
        } else {
            vibrator.vibrate(fallbackDurationMs);
        }
    }

    // Two hard clicks in quick succession (25ms apart) — a tight double-tap,
    // not a soft-then-hard swell.
    @SuppressWarnings("deprecation")
    private void playSuccess() {
        if (Build.VERSION.SDK_INT >= 30) {
            vibrator.vibrate(VibrationEffect.startComposition()
                .addPrimitive(VibrationEffect.Composition.PRIMITIVE_CLICK, 0.6f)
                .addPrimitive(VibrationEffect.Composition.PRIMITIVE_CLICK, 1.0f, 25)
                .compose());
        } else if (Build.VERSION.SDK_INT >= 26) {
            vibrator.vibrate(VibrationEffect.createWaveform(new long[] { 0, 8, 25, 9 }, new int[] { 0, 160, 0, 220 }, -1));
        } else {
            vibrator.vibrate(new long[] { 0, 8, 25, 9 }, -1);
        }
    }

    // Three short, tightly-spaced clicks — a dry rattle, not a slow pulse.
    @SuppressWarnings("deprecation")
    private void playWarning() {
        if (Build.VERSION.SDK_INT >= 30) {
            vibrator.vibrate(VibrationEffect.startComposition()
                .addPrimitive(VibrationEffect.Composition.PRIMITIVE_CLICK, 0.8f)
                .addPrimitive(VibrationEffect.Composition.PRIMITIVE_CLICK, 0.8f, 40)
                .addPrimitive(VibrationEffect.Composition.PRIMITIVE_CLICK, 0.8f, 40)
                .compose());
        } else if (Build.VERSION.SDK_INT >= 26) {
            vibrator.vibrate(VibrationEffect.createWaveform(new long[] { 0, 9, 40, 9, 40, 9 }, new int[] { 0, 190, 0, 190, 0, 190 }, -1));
        } else {
            vibrator.vibrate(new long[] { 0, 9, 40, 9, 40, 9 }, -1);
        }
    }

    // Two firm clicks, closer together than success's (18ms) — reads as a
    // harder, more urgent double-tap so it stays distinct from success.
    @SuppressWarnings("deprecation")
    private void playError() {
        if (Build.VERSION.SDK_INT >= 30) {
            vibrator.vibrate(VibrationEffect.startComposition()
                .addPrimitive(VibrationEffect.Composition.PRIMITIVE_CLICK, 1.0f)
                .addPrimitive(VibrationEffect.Composition.PRIMITIVE_CLICK, 1.0f, 18)
                .compose());
        } else if (Build.VERSION.SDK_INT >= 29) {
            vibrator.vibrate(VibrationEffect.createPredefined(VibrationEffect.EFFECT_DOUBLE_CLICK));
        } else if (Build.VERSION.SDK_INT >= 26) {
            vibrator.vibrate(VibrationEffect.createWaveform(new long[] { 0, 10, 18, 10 }, new int[] { 0, 230, 0, 255 }, -1));
        } else {
            vibrator.vibrate(new long[] { 0, 10, 18, 10 }, -1);
        }
    }
}
