package cc.andene.whisperingwishes;

import android.content.Intent;
import android.provider.Settings;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

// Small in-project Capacitor plugin (no separate npm package, same pattern as
// SystemSettingsPlugin) — lets the in-app Pull Bubble settings toggle
// (ProfileTab's PullBubbleCard.jsx) start/stop/query PullBubbleService directly,
// with NO dependency on placing PulseBannerWidget on the home screen at all. The
// widget's own bubble-toggle button (if kept) and this plugin both just send the
// same PullBubbleService.ACTION_TOGGLE intent — either one works, this is simply
// the entry point that doesn't require a widget to exist first.
@CapacitorPlugin(name = "PullBubble")
public class PullBubblePlugin extends Plugin {
    @PluginMethod
    public void isEnabled(PluginCall call) {
        JSObject result = new JSObject();
        result.put("enabled", PullBubbleService.isRunning());
        call.resolve(result);
    }

    @PluginMethod
    public void toggle(PluginCall call) {
        try {
            Intent intent = new Intent(getContext(), PullBubbleService.class);
            intent.setAction(PullBubbleService.ACTION_TOGGLE);
            getContext().startService(intent);
            call.resolve();
        } catch (Exception e) {
            call.reject("Could not toggle the pull bubble: " + e.getMessage());
        }
    }

    // Opens the "draw over other apps" settings screen directly (same one
    // PullBubbleService/FloatingVideoOverlayService open automatically on first
    // use if the permission isn't granted yet) — lets the in-app toggle send the
    // user there proactively instead of only reacting to a failed toggle.
    @PluginMethod
    public void requestOverlayPermission(PluginCall call) {
        try {
            Intent intent = new Intent(Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
                    android.net.Uri.parse("package:" + getContext().getPackageName()));
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            getContext().startActivity(intent);
            call.resolve();
        } catch (Exception e) {
            call.reject("Could not open overlay-permission settings: " + e.getMessage());
        }
    }

    @PluginMethod
    public void canDrawOverlays(PluginCall call) {
        JSObject result = new JSObject();
        result.put("granted", Settings.canDrawOverlays(getContext()));
        call.resolve(result);
    }
}
