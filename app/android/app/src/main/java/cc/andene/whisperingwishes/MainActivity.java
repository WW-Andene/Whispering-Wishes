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
// The header's own top clearance is a hardcoded constant in App.jsx
// (NOTCH_CLEARANCE_PX) — not computed here at all. Every WindowInsets-based
// approach tried for it ended up visually entangled with this edge-to-edge
// background on real hardware, so it's deliberately not wired to anything
// native pushes in. Only the bottom (gesture nav) inset is still bridged
// here, since that hasn't shown the same issue.
public class MainActivity extends BridgeActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        WindowCompat.setDecorFitsSystemWindows(getWindow(), false);
        ViewCompat.setOnApplyWindowInsetsListener(getWindow().getDecorView(), (view, insets) -> {
            Insets bottom = insets.getInsets(WindowInsetsCompat.Type.navigationBars());
            float density = getResources().getDisplayMetrics().density;
            // Defensive cap — no real device has a gesture nav area taller than this.
            float bottomDp = Math.min(bottom.bottom / density, 48f);
            WebView webView = getBridge() != null ? getBridge().getWebView() : null;
            if (webView != null) {
                String js = "document.documentElement.style.setProperty('--safe-area-bottom','" + bottomDp + "px');";
                webView.evaluateJavascript(js, null);
            }
            return insets;
        });
    }
}
