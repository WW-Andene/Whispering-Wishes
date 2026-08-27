package cc.andene.whisperingwishes;

import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.provider.Settings;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

// Small in-project Capacitor plugin (no separate npm package, same pattern as
// SystemSettingsPlugin.java/GlassHapticsPlugin.java) bridging
// FloatingBannerService.java (the "video plays inside the floating banner"
// overlay — see that class's file header) to the JS Profile settings UI.
//
// "Display over other apps" (SYSTEM_ALERT_WINDOW) has no runtime permission
// dialog — the only way to grant it is the user visiting a specific Settings
// screen themselves. requestOverlayPermission() opens that screen directly
// (Settings.ACTION_MANAGE_OVERLAY_PERMISSION, scoped to this app's package
// so the toggle is right there, not buried in a general list); the JS side
// is responsible for the "you'll be redirected to Settings" messaging
// before calling it, and for re-checking hasOverlayPermission() when the
// user returns to the app (there's no callback/promise resolution for a
// permission granted outside the app's own flow).
@CapacitorPlugin(name = "FloatingBanner")
public class FloatingBannerPlugin extends Plugin {
    @PluginMethod
    public void hasOverlayPermission(PluginCall call) {
        JSObject ret = new JSObject();
        ret.put("granted", canDrawOverlays());
        call.resolve(ret);
    }

    @PluginMethod
    public void requestOverlayPermission(PluginCall call) {
        try {
            Intent intent = new Intent(
                    Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
                    Uri.parse("package:" + getContext().getPackageName()));
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            getContext().startActivity(intent);
            call.resolve();
        } catch (Exception e) {
            call.reject("Could not open overlay permission settings: " + e.getMessage());
        }
    }

    @PluginMethod
    public void start(PluginCall call) {
        if (!canDrawOverlays()) {
            call.reject("Overlay permission not granted");
            return;
        }
        try {
            Intent intent = new Intent(getContext(), FloatingBannerService.class);
            getContext().startService(intent);
            call.resolve();
        } catch (Exception e) {
            call.reject("Could not start floating banner: " + e.getMessage());
        }
    }

    @PluginMethod
    public void stop(PluginCall call) {
        getContext().stopService(new Intent(getContext(), FloatingBannerService.class));
        call.resolve();
    }

    private boolean canDrawOverlays() {
        return Build.VERSION.SDK_INT < Build.VERSION_CODES.M || Settings.canDrawOverlays(getContext());
    }
}
