package cc.andene.whisperingwishes;

import android.os.Bundle;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowInsetsCompat;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    // Android 15+ (targetSdk 35+) enforces edge-to-edge and ignores the old
    // opt-out APIs (Window.setDecorFitsSystemWindows / SYSTEM_UI_FLAG_*, which
    // is all @capacitor/status-bar's overlaysWebView option can toggle) — the
    // WebView is drawn under the status/nav bars unconditionally, and the
    // app is expected to consume WindowInsets itself. Padding the decor view
    // by the system bar insets here pushes the whole WebView below the
    // status bar natively, independent of whether env(safe-area-inset-top)
    // resolves correctly inside the WebView.
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        ViewCompat.setOnApplyWindowInsetsListener(getWindow().getDecorView(), (view, insets) -> {
            Insets bars = insets.getInsets(WindowInsetsCompat.Type.systemBars());
            view.setPadding(bars.left, bars.top, bars.right, bars.bottom);
            return insets;
        });
    }
}
