package cc.andene.whisperingwishes;

import android.app.Activity;
import android.content.Intent;
import android.os.Bundle;

// Trampoline target for the home-screen long-press App Shortcut declared in
// res/xml/shortcuts.xml ("Toggle pull bubble") — a shortcut Intent must name a real Activity,
// but there's nothing to actually show here: it just forwards straight into
// PullBubbleService's existing ACTION_TOGGLE handling (the same action PulseBannerWidget's own
// bubble-toggle button already uses) and finishes immediately. Themed AppTheme.Trampoline
// (Theme.AppCompat.NoDisplay) so no flash of a blank window is visible in between.
public class PullBubbleShortcutActivity extends Activity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        Intent toggle = new Intent(this, PullBubbleService.class);
        toggle.setAction(PullBubbleService.ACTION_TOGGLE);
        startService(toggle);
        finish();
    }
}
