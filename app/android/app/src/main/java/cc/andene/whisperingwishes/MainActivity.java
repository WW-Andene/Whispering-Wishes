package cc.andene.whisperingwishes;

import android.os.Bundle;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowInsetsCompat;
import com.getcapacitor.BridgeActivity;

// Android 15+ (this app targets SDK 36) enforces edge-to-edge and ignores the
// old opt-out APIs (Window.setDecorFitsSystemWindows / SYSTEM_UI_FLAG_* /
// setStatusBarColor) — the WebView is laid out under the status/nav bars
// unconditionally and the app is expected to consume WindowInsets itself.
//
// The whole page is pushed down below the status bar (and up above the nav
// bar / gesture area) by padding the decor view here — this is the single
// source of truth for that inset now, so App.jsx's header/nav no longer add
// their own env(safe-area-inset-*) padding on top of it.
public class MainActivity extends BridgeActivity {
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
