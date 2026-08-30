package cc.andene.whisperingwishes;

// Shared track table for the Soundtrack widget (SoundtrackWidget.java, display only) and its
// playback service (SoundtrackPlaybackService.java, actually plays them) — same 4 choices as
// Profile > Display > Sound > Ambient Music (useAmbientMusic.js's own TRACK_SRC), reusing the
// exact same bundled assets rather than a second copy of them.
final class SoundtrackTracks {
    static final class Track {
        final String key;
        final String assetPath;
        final int labelResId;
        Track(String key, String assetPath, int labelResId) {
            this.key = key;
            this.assetPath = assetPath;
            this.labelResId = labelResId;
        }
    }

    static final Track[] ALL = {
        new Track("1", "audio/log-screen-1.m4a", R.string.widget_soundtrack_track1),
        new Track("2", "audio/log-screen-2.m4a", R.string.widget_soundtrack_track2),
        new Track("3", "audio/log-screen-3.m4a", R.string.widget_soundtrack_track3),
        new Track("convene", "audio/convene-screen.m4a", R.string.widget_soundtrack_track_convene),
    };

    static final String DEFAULT_KEY = "1";
    static final String PREF_TRACK_KEY = "widget_soundtrack_track";
    static final String PREF_PLAYING_KEY = "widget_soundtrack_playing";
    static final String PREF_LOOP_KEY = "widget_soundtrack_loop";
    static final boolean DEFAULT_LOOP = true; // matches this widget's original always-loop behavior
    static final String PREF_SHUFFLE_KEY = "widget_soundtrack_shuffle";
    static final boolean DEFAULT_SHUFFLE = false;

    private SoundtrackTracks() {}

    static int indexOf(String key) {
        for (int i = 0; i < ALL.length; i++) {
            if (ALL[i].key.equals(key)) return i;
        }
        return 0; // unknown/missing key — default to the first track rather than crashing
    }

    static Track byKey(String key) {
        return ALL[indexOf(key)];
    }
}
