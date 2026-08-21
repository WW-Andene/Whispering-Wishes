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
// Only the bottom inset (gesture nav bar) is reserved natively here — the
// top stays edge-to-edge on purpose, so the WebView keeps drawing its own
// background all the way behind the status bar/notch for a seamless,
// continuous look instead of a hard flat cut. The header itself still
// avoids the status bar via its own env(safe-area-inset-top) CSS padding
// in App.jsx (that padding is real content offset, not a native reservation
// of screen space, so it doesn't create the "stops below the bar" look).
public class MainActivity extends BridgeActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        ViewCompat.setOnApplyWindowInsetsListener(getWindow().getDecorView(), (view, insets) -> {
            Insets bars = insets.getInsets(WindowInsetsCompat.Type.systemBars());
            view.setPadding(bars.left, 0, bars.right, bars.bottom);
            return insets;
        });
    }
}
