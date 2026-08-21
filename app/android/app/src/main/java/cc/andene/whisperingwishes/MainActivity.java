package cc.andene.whisperingwishes;

import android.os.Bundle;
import android.webkit.WebView;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowInsetsCompat;
import com.getcapacitor.BridgeActivity;

// Android 15+ (this app targets SDK 36) enforces edge-to-edge and ignores the
// old opt-out APIs entirely — the window is always laid out under the
// status/nav bars, and the system draws its own status bar chrome as a
// compositor-level layer, not a transparent cutout that reveals whatever the
// app painted underneath. That's why pinning windowBackground to the app's
// own color didn't make the status bar strip blend — nothing the app draws
// is actually visible there when the WebView is padded away from it.
//
// So this stays genuinely edge-to-edge (no View padding reserved at all —
// the WebView draws its own background all the way to the physical screen
// edges, top and bottom), and instead of trusting the WebView's own
// env(safe-area-inset-*) CSS mapping (which has proven unreliable on-device
// for positioning the header), the real inset values are pushed in directly
// as CSS custom properties on <html> via evaluateJavascript. App.jsx reads
// --safe-area-top/--safe-area-bottom instead of env() on native Android.
public class MainActivity extends BridgeActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        ViewCompat.setOnApplyWindowInsetsListener(getWindow().getDecorView(), (view, insets) -> {
            Insets bars = insets.getInsets(WindowInsetsCompat.Type.systemBars());
            float density = getResources().getDisplayMetrics().density;
            float topDp = bars.top / density;
            float bottomDp = bars.bottom / density;
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
