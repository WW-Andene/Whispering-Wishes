package cc.andene.whisperingwishes;

import android.os.Bundle;
import android.webkit.WebView;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;
import com.getcapacitor.BridgeActivity;

// The app background/border is always full-screen edge-to-edge, unconditionally
// — setDecorFitsSystemWindows(false) forces that on every API level this app
// supports (24+), independent of whatever a given OEM's platform does on its
// own for apps targeting SDK 35+.
//
// The header is positioned separately from that, and is NOT tied to the
// screen/border size at all: it only reacts to displayCutout() — the actual
// notch/punch-hole camera rectangle, which is genuinely zero on a normal
// phone with no cutout. That's deliberately different from statusBars()
// (always non-zero, since every phone reserves a status bar strip): using
// statusBars() was pushing the header down by a full status-bar's worth of
// space on every device, cutout or not, which read as the header stretching
// whenever the (always-full) screen/border did. On a device with no cutout,
// the header now just sits at its normal default position; on one with a
// camera cutout, it offsets by exactly that cutout's height.
public class MainActivity extends BridgeActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        WindowCompat.setDecorFitsSystemWindows(getWindow(), false);
        ViewCompat.setOnApplyWindowInsetsListener(getWindow().getDecorView(), (view, insets) -> {
            Insets cutout = insets.getInsets(WindowInsetsCompat.Type.displayCutout());
            Insets bottom = insets.getInsets(WindowInsetsCompat.Type.navigationBars());
            float density = getResources().getDisplayMetrics().density;
            // Defensive cap regardless of source — no real device has a camera cutout or
            // gesture nav area taller than this.
            float topDp = Math.min(cutout.top / density, 60f);
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
