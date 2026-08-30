package cc.andene.whisperingwishes;

import android.annotation.SuppressLint;
import android.content.Context;
import android.os.Build;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.os.VibrationEffect;
import android.os.Vibrator;
import android.os.VibratorManager;
import android.view.HapticFeedbackConstants;
import android.view.ViewGroup;
import android.webkit.JavascriptInterface;
import android.webkit.WebView;
import android.widget.ImageView;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.core.view.WindowInsetsControllerCompat;
import com.getcapacitor.BridgeActivity;
import java.lang.reflect.Method;

// The app's own border/background is always full-screen edge-to-edge,
// unconditionally — setDecorFitsSystemWindows(false) forces that on every
// API level this app supports (24+), independent of what a given OEM's
// platform does on its own for apps targeting SDK 35+. Nothing below this
// line ever touches that: it stays fixed regardless of insets.
//
// The "page" (header + bottom nav content) is a separate concern, laid out
// on top of that fixed border, and adapts to the real device shape. Its
// top/bottom offsets come from the platform's own status_bar_height /
// navigation_bar_height dimension resources — read ONCE in onCreate() below,
// synchronously, from static Resources rather than a WindowInsetsCompat
// listener (which only fires once the decor view has gone through a layout
// pass, some time after first paint — that gap between an initial fallback
// value and the real one arriving is what produced the boot-time header/nav
// reframe). Bridged into the WebView as CSS custom properties via
// evaluateJavascript, exactly once, rather than trusted from the WebView's
// own env(safe-area-inset-*), which has proven unreliable for this on-device.
public class MainActivity extends BridgeActivity {
    // Kept as a field so dismissBootPosterView() (below, called from both
    // NativeBootBridge.dismissBootPoster() and the safety-timeout
    // fallback) can remove it once the intro video is ready.
    private ImageView bootPosterView;

    // Decided once per cold start, before the poster is even shown, so the native poster and
    // BootIntro.jsx's video always agree on which Rover variant is playing this boot — the
    // native poster paints first (before the WebView/JS has even loaded), so it has to be the
    // one making this call; JS then reads it back via NativeBootBridge.isMRoverVariant() rather
    // than rolling its own independent coin flip, which could disagree with what the poster
    // already committed to on screen.
    private boolean bootVariantMRover;

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
        registerPlugin(PullBubblePlugin.class);
        registerPlugin(WallpaperPlugin.class);
        // Also disabled Android's SplashScreen exit-zoom animation
        // (below) as a separate fix attempt — didn't fully resolve the
        // boot splash reframe either. Confirmed since (switching the
        // splash to an animated GIF, a plain <img> with none of
        // <video>'s decode/playback-surface machinery, still showed the
        // exact same reframe) that this was never about the media
        // element at all: it's the WebView's own content-area SIZE
        // changing mid-boot, as edge-to-edge insets settle — status bar
        // + nav bar together are a genuine ~9-12% of screen height, and
        // whatever's on screen when that area gets included/excluded
        // rides along with the resize, regardless of what it is.
        //
        // A prior attempt at THIS specific fix (setDecorFitsSystemWindows
        // AND the insets listener, both moved before super.onCreate())
        // made things worse — intermittently blocked the video outright.
        // Narrower this time: only setDecorFitsSystemWindows() moves
        // earlier, so the WebView's very first layout pass already
        // happens in the final edge-to-edge state — nothing to resize
        // into afterward. The insets listener itself (which reads
        // getBridge().getWebView() and pushes CSS custom properties into
        // it) stays exactly where it already worked, after
        // super.onCreate(), since that's what the earlier regression was
        // actually tied to, not this call.
        WindowCompat.setDecorFitsSystemWindows(getWindow(), false);
        // Actually HIDE the status bar for boot, not just make it
        // transparent. Transparent still leaves the bar existing — the OS
        // still reserves its inset and still draws the clock/battery/
        // notification icons in it — so there's still a status-bar-shaped
        // region for the boot poster to align with or show through, and
        // that region's own inset is part of what settles asynchronously
        // as edge-to-edge insets negotiate (the whole source of the boot
        // reframe this file's other comments document at length). Hiding
        // it outright removes the region entirely: nothing to align with,
        // nothing to reframe. Shown again once BootIntro.jsx's intro
        // finishes (window.AndroidBoot.showStatusBar(), below) — by then
        // layout has long settled, so restoring it isn't a new reframe
        // risk the way removing it mid-boot would have been.
        WindowInsetsControllerCompat insetsController = new WindowInsetsControllerCompat(getWindow(), getWindow().getDecorView());
        insetsController.hide(WindowInsetsCompat.Type.statusBars());
        // Redundant with statusBarColor/navigationBarColor/windowTranslucentStatus
        // already declared in AppTheme.NoActionBar's XML — set again here,
        // in code, because AppCompat's own window-feature setup (triggered
        // by super.onCreate() below) is a known source of overriding or
        // delaying declarative bar attributes from the theme, which is
        // consistent with the boot poster being reported as visibly
        // reframing in stages (contained -> partially expanded -> full)
        // rather than being edge-to-edge from the first frame. Setting
        // these directly on the Window object here, before super.onCreate()
        // triggers that AppCompat setup, means there's nothing left for it
        // to override.
        getWindow().setStatusBarColor(android.graphics.Color.TRANSPARENT);
        getWindow().setNavigationBarColor(android.graphics.Color.TRANSPARENT);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            getSplashScreen().setOnExitAnimationListener(splashScreenView -> splashScreenView.remove());
        }
        super.onCreate(savedInstanceState);
        // A REAL native ImageView, not part of the WebView's own content
        // area at all — so unlike the WebView's HTML poster (which, no
        // matter how it's sized in CSS, is still content the WebView is
        // responsible for laying out, and the WebView's own content area
        // is exactly what resizes mid-boot as edge-to-edge insets settle),
        // this view is laid out directly by Android's normal View system
        // against the real window size, synchronously, with nothing
        // equivalent to that WebView renegotiation to be subject to.
        // Added on top of the WebView (addContentView appends after
        // Capacitor's own setContentView call inside super.onCreate()
        // above, so it paints last/on top) and stays up for the ENTIRE
        // boot phase — index.html/BootIntro.jsx render no poster of their
        // own at all anymore, so there's nothing for this one to hand off
        // to until the intro video is actually ready to play
        // (NativeBootBridge.dismissBootPoster(), below), which is also
        // when it comes down. A 15s safety-timeout fallback (further
        // below) removes it regardless, in case that JS call never
        // arrives (video load failure before any of its own error/ended
        // handlers fire, bridge injection failure, etc.) — this view must
        // never be able to get permanently stuck on screen.
        //
        // scaleType="centerCrop" is the exact native equivalent of the
        // WebView poster's own CSS object-fit:cover — the two scale
        // identically, so there's nothing to mismatch at the handoff (the
        // earlier attempt at a native poster, PR #213, used a
        // BitmapDrawable windowBackground instead, which only offers
        // default stretch/fill scaling — a different shape of the same
        // picture at that handoff, which is why it got reverted).
        // boot_poster.png (drawable-nodpi, so it's never density-scaled)
        // is just a PNG re-encode of boot-intro-poster.gif — that GIF is
        // itself a single still frame (n_frames=1, not actually animated),
        // so this isn't extracting anything out of an animation; it's the
        // same picture in a format Android's ImageView can decode as a
        // resource.
        // boot_poster_mrover.gif (its MRover equivalent) is dropped in as-is instead — it's
        // already a single-frame GIF (same n_frames=1 as the one above), and Android's
        // BitmapFactory/ImageView decode a GIF resource as a plain static Bitmap (first frame
        // only, no animation) same as any other drawable format, so there's no format
        // conversion actually needed for this one.
        //
        // Coin flip between the default (female) Rover boot intro and its MRover (male Rover)
        // equivalent — decided once, here, before either the poster or the video ever renders,
        // so both sides of the boot sequence show the same Rover for this launch.
        bootVariantMRover = new java.util.Random().nextBoolean();
        bootPosterView = new ImageView(this);
        bootPosterView.setImageResource(bootVariantMRover ? R.drawable.boot_poster_mrover : R.drawable.boot_poster);
        bootPosterView.setScaleType(ImageView.ScaleType.CENTER_CROP);
        addContentView(bootPosterView, new ViewGroup.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT));
        new Handler(Looper.getMainLooper()).postDelayed(this::dismissBootPosterView, 15000);
        // Computed ONCE, synchronously, from the device's own static system
        // resources — NOT from a WindowInsetsCompat listener, which only
        // fires once the decor view has actually gone through a layout pass.
        // That listener-based approach is what produced the boot-time
        // reframe: the header/nav rendered at a fallback margin immediately,
        // then got moved once the listener eventually fired with the real
        // value some time after first paint. Reading the platform's own
        // status_bar_height/navigation_bar_height dimension resources needs
        // no layout pass at all — they're just static values for the current
        // screen/density, available the instant Resources exists. Setting
        // them into the WebView exactly once here, with nothing left to ever
        // update them again afterward, is what actually locks the header/nav
        // to their final position from the very first frame instead of
        // reacting to a later correction.
        int statusBarResId = getResources().getIdentifier("status_bar_height", "dimen", "android");
        int statusBarPx = statusBarResId > 0 ? getResources().getDimensionPixelSize(statusBarResId) : 0;
        int navBarResId = getResources().getIdentifier("navigation_bar_height", "dimen", "android");
        int navBarPx = navBarResId > 0 ? getResources().getDimensionPixelSize(navBarResId) : 0;
        float density = getResources().getDisplayMetrics().density;
        // Defensive caps — no real device has a status/nav bar taller than
        // this, regardless of what these resource lookups return.
        float topDp = Math.min(statusBarPx / density, 60f);
        float bottomDp = Math.min(navBarPx / density, 48f);
        WebView webView = getBridge() != null ? getBridge().getWebView() : null;
        if (webView != null) {
            // WebView defaults to an opaque white background the instant it's
            // created — before it has painted any of its own content at all.
            // AppTheme.NoActionBar's windowBackground (the boot poster,
            // painted directly by the OS at the window level, underneath
            // the WebView) only shows through the thin strips the WebView
            // itself never draws into — the status/nav bar insets. Across
            // the rest of the screen, that default opaque paint sits on top
            // of it and hides it completely until the WebView's own content
            // (the HTML poster, then the video) finishes loading. Making the
            // WebView transparent here — as early as it can possibly be
            // called, immediately once the reference exists — means the
            // native poster is what's visible everywhere on screen for
            // those first frames, not just the bar insets.
            webView.setBackgroundColor(android.graphics.Color.TRANSPARENT);
            // __bootInsetsReady is a plain boolean flag, not a callback
            // invocation (window.__onBootInsetsReady(), tried previously —
            // reported by on-device testing to crash the boot poster; most
            // likely because that function isn't guaranteed to exist yet at
            // this exact point in the WebView's script execution, and
            // calling a possibly-undefined global from injected JS is fatal
            // to this evaluateJavascript call rather than a caught error on
            // the page side). index.html just polls this flag on a plain
            // interval instead — reading a boolean can never throw, so
            // there's nothing here for the page side to crash on.
            String js = "document.documentElement.style.setProperty('--safe-area-top','" + topDp + "px');"
                    + "document.documentElement.style.setProperty('--safe-area-bottom','" + bottomDp + "px');"
                    + "window.__bootInsetsReady = true;";
            webView.evaluateJavascript(js, null);
        }
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
        if (webView != null) {
            webView.addJavascriptInterface(new NativeHapticsBridge(webView), "AndroidHaptics");
            webView.addJavascriptInterface(new NativeBootBridge(this), "AndroidBoot");
        }
    }

    // Shared by NativeBootBridge.dismissBootPoster() and the 15s
    // safety-timeout fallback above — either can be the one that actually
    // removes the view; whichever runs first wins, the other is a no-op
    // (bootPosterView is already null by then).
    private void dismissBootPosterView() {
        if (bootPosterView == null) return;
        ViewGroup parent = (ViewGroup) bootPosterView.getParent();
        if (parent != null) parent.removeView(bootPosterView);
        bootPosterView = null;
    }

    // Exposed as window.AndroidBoot.showStatusBar() — called from
    // BootIntro.jsx once its fade-out actually completes, to restore the
    // status bar hidden at the top of onCreate() above. Same
    // addJavascriptInterface pattern as NativeHapticsBridge: a real Java
    // method called directly from JS, no plugin-bridge round trip needed
    // for something this simple.
    private static class NativeBootBridge {
        private final MainActivity activity;
        NativeBootBridge(MainActivity activity) { this.activity = activity; }

        @JavascriptInterface
        public void showStatusBar() {
            activity.runOnUiThread(() -> {
                WindowInsetsControllerCompat controller =
                        new WindowInsetsControllerCompat(activity.getWindow(), activity.getWindow().getDecorView());
                controller.show(WindowInsetsCompat.Type.statusBars());
            });
        }

        // Called from BootIntro.jsx once the intro video is actually ready
        // to play (or has failed trying) — until that moment, this native
        // poster is the only thing rendering a poster at all; index.html
        // and BootIntro.jsx render none of their own anymore.
        @JavascriptInterface
        public void dismissBootPoster() {
            activity.runOnUiThread(activity::dismissBootPosterView);
        }

        // Read by BootIntro.jsx to pick the matching video file for whichever Rover variant
        // onCreate() already committed the native poster to — see bootVariantMRover's own
        // comment for why the decision has to originate here rather than in JS.
        @JavascriptInterface
        public boolean isMRoverVariant() {
            return activity.bootVariantMRover;
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
        PulseBannerWidget.requestUpdate(this);
        CalculatorWidget.requestUpdate(this);
    }
}
