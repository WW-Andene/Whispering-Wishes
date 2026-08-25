package cc.andene.whisperingwishes;

import android.os.Bundle;
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
    protected void onCreate(Bundle savedInstanceState) {
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
