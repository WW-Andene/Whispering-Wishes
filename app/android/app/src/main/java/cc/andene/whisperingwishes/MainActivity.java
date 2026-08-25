package cc.andene.whisperingwishes;

import android.annotation.SuppressLint;
import android.os.Bundle;
import android.view.HapticFeedbackConstants;
import android.webkit.JavascriptInterface;
import android.webkit.WebView;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;
import com.getcapacitor.BridgeActivity;

// The app's own border/background is always full-screen edge-to-edge,
// unconditionally — setDecorFitsSystemWindows(false) forces that on every
// API level this app supports (24+), independent of what a given OEM's
// platform does on its own for apps targeting SDK 35+. Nothing below this
// line ever touches that: it stays fixed regardless of insets.
//
// The "page" (header + bottom nav content) is a separate concern, laid out
// on top of that fixed border, and adapts to the real device shape:
//  - top: displayCutout() only, not statusBars() — displayCutout() is
//    genuinely zero on a device with no notch/punch-hole camera (so the
//    header sits at its normal position, a "classic full" layout), and only
//    reports space where an actual camera physically is on one that has it.
//    statusBars() is always non-zero on every phone regardless of a cutout,
//    which is why it doesn't belong here.
//  - bottom: navigationBars(), same as before — the gesture/button nav area.
// Both are bridged into the WebView as CSS custom properties via
// evaluateJavascript rather than trusted from the WebView's own
// env(safe-area-inset-*), which has proven unreliable for this on-device.
public class MainActivity extends BridgeActivity {
    @Override
    @SuppressLint("JavascriptInterface")
    protected void onCreate(Bundle savedInstanceState) {
        // Must run before super.onCreate() — Capacitor registers plugins
        // while the Bridge is being constructed there.
        registerPlugin(SystemSettingsPlugin.class);
        registerPlugin(GlassHapticsPlugin.class);
        super.onCreate(savedInstanceState);
        WindowCompat.setDecorFitsSystemWindows(getWindow(), false);
        ViewCompat.setOnApplyWindowInsetsListener(getWindow().getDecorView(), (view, insets) -> {
            Insets cutout = insets.getInsets(WindowInsetsCompat.Type.displayCutout());
            Insets navBar = insets.getInsets(WindowInsetsCompat.Type.navigationBars());
            float density = getResources().getDisplayMetrics().density;
            // Defensive caps — no real device has a camera cutout or gesture nav area
            // taller than this, regardless of what a given OEM's inset APIs report.
            float topDp = Math.min(cutout.top / density, 60f);
            float bottomDp = Math.min(navBar.bottom / density, 48f);
            WebView webView = getBridge() != null ? getBridge().getWebView() : null;
            if (webView != null) {
                String js = "document.documentElement.style.setProperty('--safe-area-top','" + topDp + "px');"
                        + "document.documentElement.style.setProperty('--safe-area-bottom','" + bottomDp + "px');";
                webView.evaluateJavascript(js, null);
            }
            return insets;
        });

        // Experimental low-latency haptic path — see GlassHapticsPlugin.java's
        // history: performHapticFeedback(KEYBOARD_TAP) called through
        // Capacitor's normal plugin bridge (JSON message + promise round
        // trip) still didn't match the system keyboard's tap feel, despite
        // using the exact same feedback constant. One remaining, untested
        // difference: the keyboard calls performHapticFeedback() synchronously
        // from within its own native touch handling, with essentially zero
        // latency after the finger lands — our plugin call, going through the
        // JS bridge, arrives some milliseconds later. If Xiaomi's haptic
        // renderer is timing-sensitive (common for "premium" haptic engines,
        // which often expect near-zero touch-to-trigger latency to pick the
        // sharp waveform over a generic fallback), that gap alone could be
        // why. addJavascriptInterface() calls a real Java method directly
        // from JS with no message serialization or promise wrapping — the
        // lowest-latency JS-to-native path WebView offers, well below
        // Capacitor's own plugin bridge overhead. Exposed as
        // window.AndroidHaptics.tap() — see src/utils/helpers.js, which
        // prefers this over the GlassHaptics plugin for the "light" tap
        // specifically (the one fired on every button press) to test the
        // timing hypothesis; success/warning/error stay on the plugin path.
        WebView webView = getBridge() != null ? getBridge().getWebView() : null;
        if (webView != null) {
            webView.addJavascriptInterface(new NativeHapticsBridge(webView), "AndroidHaptics");
        }
    }

    // @JavascriptInterface only exposes this one explicitly-annotated,
    // no-argument method to JS — not arbitrary reflection, so this doesn't
    // carry the pre-API-17 addJavascriptInterface security history (minSdk
    // here is 24).
    private static class NativeHapticsBridge {
        private final WebView webView;
        NativeHapticsBridge(WebView webView) { this.webView = webView; }

        @JavascriptInterface
        public void tap() {
            // JS interface callbacks run on a WebView-managed thread, not
            // necessarily the main thread — performHapticFeedback requires it.
            webView.post(() -> webView.performHapticFeedback(HapticFeedbackConstants.KEYBOARD_TAP));
        }
    }

    @Override
    public void onResume() {
        super.onResume();
        // Nudge the home-screen widget to refresh now rather than waiting for
        // Android's own 30-minute floor — this is the only other moment
        // widget_end_millis could have changed (widgetSync.js runs on app
        // mount/server change), so it's the natural place to ask for a
        // sooner update.
        EventCountdownWidget.requestUpdate(this);
    }
}
