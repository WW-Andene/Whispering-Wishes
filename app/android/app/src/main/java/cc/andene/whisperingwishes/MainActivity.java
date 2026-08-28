package cc.andene.whisperingwishes;

import android.annotation.SuppressLint;
import android.content.Context;
import android.os.Build;
import android.os.Bundle;
import android.os.VibrationEffect;
import android.os.Vibrator;
import android.os.VibratorManager;
import android.view.HapticFeedbackConstants;
import android.view.View;
import android.webkit.JavascriptInterface;
import android.webkit.WebChromeClient;
import android.webkit.WebView;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;
import com.getcapacitor.BridgeActivity;
import com.getcapacitor.BridgeWebChromeClient;
import java.lang.reflect.Method;

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
        // The manifest points this activity at AppTheme.NoActionBarLaunch (a
        // Theme.SplashScreen variant) so the OS shows a splash instead of a
        // blank window during cold start — but nothing ever switched the
        // activity's real theme back afterward, so it stayed on the splash
        // theme for its entire life. That theme isn't the app's actual dark,
        // edge-to-edge NoActionBar theme: its own status-bar defaults painted
        // an opaque bar on top of the WebView instead of the transparent one
        // AppTheme.NoActionBar declares, hiding content underneath it. Must
        // run before super.onCreate() so the real theme is active before the
        // first frame is drawn.
        setTheme(R.style.AppTheme_NoActionBar);
        // Must run before super.onCreate() — Capacitor registers plugins
        // while the Bridge is being constructed there.
        registerPlugin(SystemSettingsPlugin.class);
        registerPlugin(GlassHapticsPlugin.class);
        // Reverted: moving setDecorFitsSystemWindows()/the insets listener
        // to before super.onCreate() was tried here as a fix for the boot
        // splash zoom/dezoom, on the theory that switching edge-to-edge
        // AFTER the WebView's first layout caused a real resize. In
        // practice it made things worse (intermittently blocked the video
        // outright) rather than fixing the zoom, so it's undone — back to
        // running after super.onCreate(), as it was before.
        //
        // Real cause of the zoom, addressed below instead: this Activity's
        // launch theme (AppTheme.NoActionBarLaunch, parent Theme.SplashScreen)
        // means Android 12+ shows its OWN mandatory system splash screen
        // before any app content, and that system splash has a DEFAULT
        // EXIT ANIMATION — it scales/zooms the app's first frame in when
        // handing off. That's a platform-level animation, nothing to do
        // with the WebView, insets, or this page's own CSS/JS — and it's
        // APK-only for the same reason as everything else in this
        // category: a plain web page has no Android SplashScreen system to
        // hand off from at all. Overriding the exit listener to remove the
        // splash view immediately (no animation) is what actually disables
        // that platform zoom.
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            getSplashScreen().setOnExitAnimationListener(splashScreenView -> splashScreenView.remove());
        }
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
        // Boot splash (index.html) autoplays a muted <video> the instant
        // the app starts — no user gesture has happened yet at that point,
        // by definition. Android's WebView has its OWN gesture-based
        // autoplay policy (WebSettings.setMediaPlaybackRequiresUserGesture),
        // completely separate from the HTML autoplay attribute and from
        // desktop/mobile Chrome's autoplay rules — Capacitor's Bridge is
        // *supposed* to already disable this by default, but every attempt
        // at fixing the splash from the JS/HTML side alone has failed to
        // produce any visible change on-device, which is consistent with
        // this WebView-level gesture requirement silently blocking
        // autoplay entirely regardless of what the page's own script does.
        // Set explicitly rather than trusted to Capacitor's default.
        if (getBridge() != null && getBridge().getWebView() != null) {
            getBridge().getWebView().getSettings().setMediaPlaybackRequiresUserGesture(false);
        }
        // The boot splash <video> already has playsinline set, which is
        // supposed to tell the browser engine to never escalate it to
        // Android's native fullscreen video surface — but WebView has a
        // real history of doing this anyway for an autoplaying video right
        // at cold start. That native surface (shown via
        // WebChromeClient.onShowCustomView) is a completely separate
        // rendering path from the page's own DOM/CSS: it computes its own
        // scale-to-fit independently of object-fit/width/height, which
        // would explain a video-only, APK-only reframe that a static
        // <img> on the same page would never show (images never go
        // through this path at all). Subclassing Capacitor's own
        // BridgeWebChromeClient (not replacing it outright, which would
        // drop Capacitor's file-upload/permission handling) and no-op'ing
        // the custom-view callbacks refuses that escalation unconditionally
        // — video can only ever render inline, through normal CSS layout.
        if (getBridge() != null) {
            getBridge().setWebChromeClient(new BridgeWebChromeClient(this) {
                @Override
                public void onShowCustomView(View view, WebChromeClient.CustomViewCallback callback) {
                    // Intentionally does nothing — never let a <video>
                    // leave the inline DOM/CSS layout path.
                }

                @Override
                public void onHideCustomView() {
                    // Intentionally does nothing — nothing was ever shown.
                }
            });
        }

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

        @SuppressWarnings("deprecation")
        private Vibrator getVibrator() {
            Context ctx = webView.getContext();
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                VibratorManager vm = (VibratorManager) ctx.getSystemService(Context.VIBRATOR_MANAGER_SERVICE);
                return vm != null ? vm.getDefaultVibrator() : null;
            }
            return (Vibrator) ctx.getSystemService(Context.VIBRATOR_SERVICE);
        }

        // Android 15 (API 35) added frequency-envelope vibration —
        // VibrationEffect.WaveformEnvelopeBuilder lets a control point
        // specify a target frequency (Hz), not just amplitude, on hardware
        // that supports it (Vibrator.areEnvelopeEffectsSupported()). This
        // is the API-level equivalent of "vary the frequency to change the
        // felt texture" — the one variable (amplitude/duration aside) this
        // plugin's whole history never controlled. Called via reflection
        // rather than a direct compile-time reference: it's new and
        // narrowly documented enough that getting an exact method
        // signature wrong should fail soft (caught below, falls through to
        // performHapticFeedback) rather than break the build.
        private boolean tryFrequencySnap(Vibrator vibrator) {
            try {
                if (Build.VERSION.SDK_INT < 35 || vibrator == null) return false;

                Method supportedMethod = Vibrator.class.getMethod("areEnvelopeEffectsSupported");
                if (!(Boolean) supportedMethod.invoke(vibrator)) return false;

                float resonantHz = 150f; // typical phone LRA resonant frequency, used as a fallback
                try {
                    Method resonantMethod = Vibrator.class.getMethod("getResonantFrequency");
                    float reported = (float) resonantMethod.invoke(vibrator);
                    if (reported > 0) resonantHz = reported;
                } catch (Exception ignored) {
                    // getResonantFrequency() not available/reported — keep the fallback.
                }

                Class<?> builderClass = Class.forName("android.os.VibrationEffect$WaveformEnvelopeBuilder");
                Object builder = builderClass.getConstructor().newInstance();
                Method addControlPoint = builderClass.getMethod("addControlPoint", float.class, float.class, long.class);
                // 2026-08-27: dropped from the full resonant frequency (1.0x)
                // to 0.45x — requested feel was "drier, harder, and hollow".
                // The full-resonance snap was tuned for "nail on glass"
                // (thin, sharp, bright); a lower frequency multiple reads as
                // a rounder, hollower knock instead — like rapping on an
                // empty box rather than tapping glass — while keeping the
                // same short attack/decay (5ms/1ms, still no lingering ring)
                // so it stays dry rather than a longer, softer buzz. Full
                // amplitude (1.0) throughout for the "hard" half of the ask.
                addControlPoint.invoke(builder, 1.0f, resonantHz * 0.45f, 5L);
                addControlPoint.invoke(builder, 0.0f, resonantHz * 0.45f, 1L);

                Object effect = builderClass.getMethod("build").invoke(builder);
                Vibrator.class.getMethod("vibrate", VibrationEffect.class).invoke(vibrator, effect);
                return true;
            } catch (Throwable t) {
                // Wrong method name/signature for this OS build, unsupported
                // hardware, or any other reflection failure — fall through.
                return false;
            }
        }

        @JavascriptInterface
        public void tap() {
            // JS interface callbacks run on a WebView-managed thread, not
            // necessarily the main thread — performHapticFeedback/Vibrator
            // calls expect it.
            webView.post(() -> {
                // Falls back to CONTEXT_CLICK (not KEYBOARD_TAP) below API 35
                // or when the envelope reflection call fails — same
                // "short, dry, hard" reasoning as GlassHapticsPlugin.light().
                if (!tryFrequencySnap(getVibrator())) {
                    webView.performHapticFeedback(HapticFeedbackConstants.CONTEXT_CLICK);
                }
            });
        }
    }

    @Override
    public void onResume() {
        super.onResume();
        // Nudge the home-screen widget to refresh now rather than waiting for
        // Android's own 30-minute floor — this is the only other moment its
        // data could have changed (widgetSync.js runs on app mount/banner
        // change), so it's the natural place to ask for a sooner update.
        BannerWidget.requestUpdate(this);
    }
}
