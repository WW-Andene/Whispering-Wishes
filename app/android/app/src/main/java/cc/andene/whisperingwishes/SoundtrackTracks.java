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
        // In-game boss/event OSTs, added in bulk — display labels drop the
        // trailing " OST" (see strings.xml) since that's a filename
        // convention, not something a listener needs to see in the widget.
        new Track("3_5_login", "audio/3.5 Login OST.mp3", R.string.widget_soundtrack_track_3_5_login),
        new Track("aleph_1_boss", "audio/Aleph 1 Boss OST.mp3", R.string.widget_soundtrack_track_aleph_1_boss),
        new Track("arsinosa_boss", "audio/Arsinosa Boss OST.mp3", R.string.widget_soundtrack_track_arsinosa_boss),
        new Track("bell_borne_geochelone_boss", "audio/Bell Borne Geochelone Boss OST.mp3", R.string.widget_soundtrack_track_bell_borne_geochelone_boss),
        new Track("calmity_effigy_boss", "audio/Calmity Effigy Boss OST.mp3", R.string.widget_soundtrack_track_calmity_effigy_boss),
        new Track("crownless_boss", "audio/Crownless Boss OST.mp3", R.string.widget_soundtrack_track_crownless_boss),
        new Track("denia_boss", "audio/Denia Boss OST.mp3", R.string.widget_soundtrack_track_denia_boss),
        new Track("depths_of_illusive_realm", "audio/Depths of Illusive Realm OST.mp3", R.string.widget_soundtrack_track_depths_of_illusive_realm),
        new Track("dragon_of_dirge", "audio/Dragon of Dirge OST.mp3", R.string.widget_soundtrack_track_dragon_of_dirge),
        new Track("dreamless_boss", "audio/Dreamless Boss OST.mp3", R.string.widget_soundtrack_track_dreamless_boss),
        new Track("feilian_beringal_boss", "audio/Feilian Beringal Boss OST.mp3", R.string.widget_soundtrack_track_feilian_beringal_boss),
        new Track("fenrico_boss", "audio/Fenrico Boss OST.mp3", R.string.widget_soundtrack_track_fenrico_boss),
        new Track("fleurdelys", "audio/Fleurdelys OST.mp3", R.string.widget_soundtrack_track_fleurdelys),
        new Track("hecate_boss", "audio/Hecate Boss OST.mp3", R.string.widget_soundtrack_track_hecate_boss),
        new Track("hyvita_full_boss", "audio/Hyvita Full Boss OST.mp3", R.string.widget_soundtrack_track_hyvita_full_boss),
        new Track("impermanence_heron_boss", "audio/Impermanence Heron Boss OST.mp3", R.string.widget_soundtrack_track_impermanence_heron_boss),
        new Track("impermanence_heron_boss_renewed", "audio/Impermanence Heron Boss Renewed OST.mp3", R.string.widget_soundtrack_track_impermanence_heron_boss_renewed),
        new Track("inferno_rider_boss", "audio/Inferno Rider Boss OST.mp3", R.string.widget_soundtrack_track_inferno_rider_boss),
        new Track("ju_boss", "audio/Jué Boss OST.mp3", R.string.widget_soundtrack_track_ju_boss),
        new Track("lady_of_the_sea_boss", "audio/Lady of the Sea Boss OST.mp3", R.string.widget_soundtrack_track_lady_of_the_sea_boss),
        new Track("leviathan_threnodian_boss", "audio/Leviathan Threnodian Boss OST.mp3", R.string.widget_soundtrack_track_leviathan_threnodian_boss),
        new Track("lorelei", "audio/Lorelei OST.mp3", R.string.widget_soundtrack_track_lorelei),
        new Track("mech_abomination_boss", "audio/Mech Abomination Boss OST.mp3", R.string.widget_soundtrack_track_mech_abomination_boss),
        new Track("mephis_alter_boss", "audio/Mephis Alter Boss OST.mp3", R.string.widget_soundtrack_track_mephis_alter_boss),
        new Track("mephis_boss", "audio/Mephis Boss OST.mp3", R.string.widget_soundtrack_track_mephis_boss),
        new Track("mourning_aix_boss", "audio/Mourning Aix Boss OST.mp3", R.string.widget_soundtrack_track_mourning_aix_boss),
        new Track("myriad_snare_boss", "audio/Myriad Snare Boss OST.mp3", R.string.widget_soundtrack_track_myriad_snare_boss),
        new Track("nameless_explorer_boss", "audio/Nameless Explorer Boss OST.mp3", R.string.widget_soundtrack_track_nameless_explorer_boss),
        new Track("rector_husk_boss", "audio/Rector Husk Boss OST.mp3", R.string.widget_soundtrack_track_rector_husk_boss),
        new Track("scar_boss", "audio/Scar Boss OST.mp3", R.string.widget_soundtrack_track_scar_boss),
        new Track("scar_phase_2_boss", "audio/Scar Phase 2 Boss OST.mp3", R.string.widget_soundtrack_track_scar_phase_2_boss),
        new Track("sentry_construct", "audio/Sentry Construct OST.mp3", R.string.widget_soundtrack_track_sentry_construct),
        new Track("sigillum_boss", "audio/Sigillum Boss OST.mp3", R.string.widget_soundtrack_track_sigillum_boss),
        new Track("the_false_sovereign_boss", "audio/The False Sovereign Boss OST.mp3", R.string.widget_soundtrack_track_the_false_sovereign_boss),
        new Track("where_wind_returns_to_celestial_realm", "audio/Where Wind Returns to Celestial Realm OST.mp3", R.string.widget_soundtrack_track_where_wind_returns_to_celestial_realm),
        new Track("whimpering_wastes", "audio/Whimpering Wastes OST.mp3", R.string.widget_soundtrack_track_whimpering_wastes),
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
