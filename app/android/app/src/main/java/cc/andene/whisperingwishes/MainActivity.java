package cc.andene.whisperingwishes;

import android.os.Bundle;
import android.webkit.WebView;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;
import com.getcapacitor.BridgeActivity;

// Android 15+ (this app targets SDK 36) enforces edge-to-edge at the OS
// level, but only on a device whose actual platform build is genuinely
// Android 15+ — some OEM Android builds (e.g. Xiaomi/MIUI) lag behind or
// patch this differently, so relying on it being automatic isn't safe.
// setDecorFitsSystemWindows(false) requests it explicitly on every API
// level this app supports (24+), so the WebView's real Android View always
// spans the full physical screen — top and bottom — regardless of what a
// given OEM's platform does on its own. Without this, the window can fall
// back to the old "fitted" layout, where the OS itself shrinks the
// WebView's actual height to make room for the status/nav bars — that's a
// real reduction of the view's bounds, not something CSS padding controls.
//
// With the window genuinely edge-to-edge, the only remaining job is
// positioning the header/nav so they don't sit under the status bar or
// gesture area. Real inset values are computed here and pushed into the
// WebView as CSS custom properties on <html> via evaluateJavascript,
// rather than trusting the WebView's own env(safe-area-inset-*) mapping
// (which has proven unreliable on-device for that). App.jsx reads
// --safe-area-top/--safe-area-bottom.
public class MainActivity extends BridgeActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        WindowCompat.setDecorFitsSystemWindows(getWindow(), false);
        ViewCompat.setOnApplyWindowInsetsListener(getWindow().getDecorView(), (view, insets) -> {
            // systemBars() bundles statusBars|navigationBars|captionBar together, and on
            // some OEM builds (e.g. Xiaomi/MIUI) that combined top value comes back taller
            // than the actual visible status bar — inflating the header. Asking for
            // statusBars() + displayCutout() specifically (so a hole-punch/notch camera is
            // still cleared) and navigationBars() alone for the bottom is more precise.
            Insets top = insets.getInsets(WindowInsetsCompat.Type.statusBars() | WindowInsetsCompat.Type.displayCutout());
            Insets bottom = insets.getInsets(WindowInsetsCompat.Type.navigationBars());
            float density = getResources().getDisplayMetrics().density;
            // Defensive cap regardless of source — no real device has a status bar or
            // gesture nav area taller than this, so nothing should ever push the header/nav
            // further than a normal status bar's worth of space no matter what a given
            // OEM's inset APIs report.
            float topDp = Math.min(top.top / density, 60f);
            float bottomDp = Math.min(bottom.bottom / density, 48f);
            WebView webView = getBridge() != null ? getBridge().getWebView() : null;
            if (webView != null) {
                String js = "document.documentElement.style.setProperty('--safe-area-top','" + topDp + "px');"
                        + "document.documentElement.style.setProperty('--safe-area-bottom','" + bottomDp + "px');";
                webView.evaluateJavascript(js, null);
            }
            return insets;
        });
    }
}
