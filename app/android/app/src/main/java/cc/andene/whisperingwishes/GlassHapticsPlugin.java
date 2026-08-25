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
// held for 43-60ms (see its HapticsImpactType/HapticsNotificationType.java)
// — which reads as a dull, soft "buzz" on most actuators, not a sharp tap.
//
// This uses VibrationEffect.Composition's primitives instead (API 30+,
// PRIMITIVE_LOW_TICK added in 33): short, OS/OEM-tuned transients rendered
// directly by the haptic actuator's own driver, the same category of API
// that makes stock Android UI taps (Pixel keyboard, quick-settings toggles)
// feel crisp rather than buzzy — the closest thing on a phone motor to the
// short, precise clicks DualSense's HD haptics are known for. Falls back
// through createPredefined() (API 29) and short createOneShot()/legacy
// vibrate() on older OS versions where no primitive API exists at all.
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

    @PluginMethod public void light(PluginCall call) { playTick(0.35f); call.resolve(); }
    @PluginMethod public void medium(PluginCall call) { playTick(0.75f); call.resolve(); }
    @PluginMethod public void heavy(PluginCall call) { playClick(1.0f); call.resolve(); }
    @PluginMethod public void success(PluginCall call) { playSuccess(); call.resolve(); }
    @PluginMethod public void warning(PluginCall call) { playWarning(); call.resolve(); }
    @PluginMethod public void error(PluginCall call) { playError(); call.resolve(); }

    // "Frosted glass tick" — the thinnest primitive the platform exposes.
    @SuppressWarnings("deprecation")
    private void playTick(float scale) {
        if (Build.VERSION.SDK_INT >= 33) {
            vibrator.vibrate(VibrationEffect.startComposition()
                .addPrimitive(VibrationEffect.Composition.PRIMITIVE_LOW_TICK, scale)
                .compose());
        } else if (Build.VERSION.SDK_INT >= 30) {
            vibrator.vibrate(VibrationEffect.startComposition()
                .addPrimitive(VibrationEffect.Composition.PRIMITIVE_TICK, scale)
                .compose());
        } else if (Build.VERSION.SDK_INT >= 29) {
            vibrator.vibrate(VibrationEffect.createPredefined(VibrationEffect.EFFECT_TICK));
        } else if (Build.VERSION.SDK_INT >= 26) {
            vibrator.vibrate(VibrationEffect.createOneShot(10, (int) Math.max(40, 255 * scale)));
        } else {
            vibrator.vibrate(10);
        }
    }

    // A sharper "click" primitive — for the heavier end of the scale.
    @SuppressWarnings("deprecation")
    private void playClick(float scale) {
        if (Build.VERSION.SDK_INT >= 30) {
            vibrator.vibrate(VibrationEffect.startComposition()
                .addPrimitive(VibrationEffect.Composition.PRIMITIVE_CLICK, scale)
                .compose());
        } else if (Build.VERSION.SDK_INT >= 29) {
            vibrator.vibrate(VibrationEffect.createPredefined(VibrationEffect.EFFECT_CLICK));
        } else if (Build.VERSION.SDK_INT >= 26) {
            vibrator.vibrate(VibrationEffect.createOneShot(18, (int) Math.max(80, 255 * scale)));
        } else {
            vibrator.vibrate(20);
        }
    }

    // A light tick followed by a sharper click ~40ms later — reads as a
    // quick two-part "settle" rather than a sustained buzz.
    @SuppressWarnings("deprecation")
    private void playSuccess() {
        if (Build.VERSION.SDK_INT >= 30) {
            vibrator.vibrate(VibrationEffect.startComposition()
                .addPrimitive(VibrationEffect.Composition.PRIMITIVE_TICK, 0.4f)
                .addPrimitive(VibrationEffect.Composition.PRIMITIVE_CLICK, 0.8f, 40)
                .compose());
        } else if (Build.VERSION.SDK_INT >= 26) {
            vibrator.vibrate(VibrationEffect.createWaveform(new long[] { 0, 12, 40, 16 }, new int[] { 0, 90, 0, 160 }, -1));
        } else {
            vibrator.vibrate(new long[] { 0, 12, 40, 16 }, -1);
        }
    }

    // Three short, evenly-spaced ticks — deliberately not a buzz-buzz-buzz.
    @SuppressWarnings("deprecation")
    private void playWarning() {
        if (Build.VERSION.SDK_INT >= 30) {
            vibrator.vibrate(VibrationEffect.startComposition()
                .addPrimitive(VibrationEffect.Composition.PRIMITIVE_TICK, 0.6f)
                .addPrimitive(VibrationEffect.Composition.PRIMITIVE_TICK, 0.6f, 60)
                .addPrimitive(VibrationEffect.Composition.PRIMITIVE_TICK, 0.6f, 60)
                .compose());
        } else if (Build.VERSION.SDK_INT >= 26) {
            vibrator.vibrate(VibrationEffect.createWaveform(new long[] { 0, 14, 60, 14, 60, 14 }, new int[] { 0, 130, 0, 130, 0, 130 }, -1));
        } else {
            vibrator.vibrate(new long[] { 0, 14, 60, 14, 60, 14 }, -1);
        }
    }

    // A firm click followed by a quieter low-tick "settle" — distinct from
    // success's tick-then-click ordering so the two remain tactilely different.
    @SuppressWarnings("deprecation")
    private void playError() {
        if (Build.VERSION.SDK_INT >= 33) {
            vibrator.vibrate(VibrationEffect.startComposition()
                .addPrimitive(VibrationEffect.Composition.PRIMITIVE_CLICK, 0.9f)
                .addPrimitive(VibrationEffect.Composition.PRIMITIVE_LOW_TICK, 0.5f, 70)
                .compose());
        } else if (Build.VERSION.SDK_INT >= 30) {
            vibrator.vibrate(VibrationEffect.startComposition()
                .addPrimitive(VibrationEffect.Composition.PRIMITIVE_CLICK, 0.9f)
                .addPrimitive(VibrationEffect.Composition.PRIMITIVE_TICK, 0.5f, 70)
                .compose());
        } else if (Build.VERSION.SDK_INT >= 29) {
            vibrator.vibrate(VibrationEffect.createPredefined(VibrationEffect.EFFECT_DOUBLE_CLICK));
        } else if (Build.VERSION.SDK_INT >= 26) {
            vibrator.vibrate(VibrationEffect.createWaveform(new long[] { 0, 20, 45, 24 }, new int[] { 0, 200, 0, 255 }, -1));
        } else {
            vibrator.vibrate(new long[] { 0, 20, 45, 24 }, -1);
        }
    }
}
