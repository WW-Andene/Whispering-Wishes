package cc.andene.whisperingwishes;

import android.content.Intent;
import android.provider.Settings;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.lang.reflect.Method;
import java.util.List;

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

    // Without android/app/google-services.json, no FirebaseApp instance ever gets
    // initialized (build.gradle's `apply plugin: 'com.google.gms.google-services'`
    // above is conditional on that file existing). @capacitor/push-notifications'
    // register() calls FirebaseMessaging.getInstance() internally, which throws
    // IllegalStateException("Default FirebaseApp is not initialized") when no
    // FirebaseApp exists — and that throw happens off the plugin-call stack (inside
    // the Firebase SDK's own background task dispatch), so it becomes an uncaught
    // exception that crashes the whole app rather than a rejected JS promise. Worse,
    // since pushNotifications.js persists the opt-in flag and auto-calls register()
    // on every ProfileTab mount once opted in, this became a crash-on-every-launch
    // loop. JS checks this before ever calling register()/requestPermissions().
    //
    // Reflection, not a direct `import com.google.firebase.FirebaseApp` + Gradle
    // dependency, because :app's own build.gradle has no compile-time dependency on
    // Firebase at all — only capacitor-push-notifications' OWN build.gradle (a
    // separate Gradle module) declares one, as an `implementation` dependency that
    // doesn't propagate to :app's compile classpath. FirebaseApp's class file still
    // ends up in the final APK (dexing merges every module's runtime classpath), so
    // it's safely loadable by name at runtime — it just isn't something :app can
    // `import` and compile against directly without adding a redundant, versionable
    // duplicate Firebase dependency here purely for this one check.
    @PluginMethod
    public void isFirebaseAvailable(PluginCall call) {
        JSObject ret = new JSObject();
        ret.put("available", firebaseAppsPresent());
        call.resolve(ret);
    }

    private boolean firebaseAppsPresent() {
        try {
            Class<?> firebaseApp = Class.forName("com.google.firebase.FirebaseApp");
            Method getApps = firebaseApp.getMethod("getApps", android.content.Context.class);
            List<?> apps = (List<?>) getApps.invoke(null, getContext());
            return apps != null && !apps.isEmpty();
        } catch (Throwable t) {
            return false;
        }
    }
}
