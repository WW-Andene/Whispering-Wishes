package cc.andene.whisperingwishes;

import android.content.Intent;
import android.provider.Settings;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

// Small in-project Capacitor plugin (no separate npm package) — opens the
// OS-level Sound & Vibration settings screen. Exists because some OEM
// skins (MIUI/Xiaomi confirmed, likely others) have a hardware-level master
// vibration switch that silently no-ops even a direct Vibrator.vibrate()
// call (what @capacitor/haptics itself uses — see its Haptics.java, no
// View.performHapticFeedback() involved). There is no Android API to query
// or override that switch from an app; the only honest fix is a one-tap
// shortcut to where the user can flip it back on themselves.
@CapacitorPlugin(name = "SystemSettings")
public class SystemSettingsPlugin extends Plugin {
    @PluginMethod
    public void openSoundSettings(PluginCall call) {
        try {
            Intent intent = new Intent(Settings.ACTION_SOUND_SETTINGS);
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            getContext().startActivity(intent);
            call.resolve();
        } catch (Exception e) {
            call.reject("Could not open sound settings: " + e.getMessage());
        }
    }
}
