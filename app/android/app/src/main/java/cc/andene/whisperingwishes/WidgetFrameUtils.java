package cc.andene.whisperingwishes;

import android.content.Context;
import android.graphics.Bitmap;
import android.graphics.Matrix;
import android.media.MediaMetadataRetriever;

import java.util.ArrayList;
import java.util.List;

// Shared frame-decoding helper for WidgetVideoPlaybackService (convene animation) and
// WidgetPullPlaybackService (pull rarity video) — both need the same "decode a short clip
// into N downsampled bitmaps, evenly spaced across its duration" logic to flip a widget's
// ImageView through on a timer, since RemoteViews cannot host a VideoView at all (see
// PulseBannerWidget.java's file header). Split out once a second caller needed it rather
// than copy-pasting the same decode loop twice.
final class WidgetFrameUtils {
    private WidgetFrameUtils() {}

    // source is either an http(s) URL (streamed clips) or "asset:<path under assets/public/>"
    // for a bundled local clip. MediaMetadataRetriever supports both a network Uri and an
    // AssetFileDescriptor as a data source.
    static List<Bitmap> extractFrames(Context context, String source, int maxFrames, long frameIntervalMs, int framePx) throws Exception {
        MediaMetadataRetriever retriever = new MediaMetadataRetriever();
        try {
            if (source.startsWith("asset:")) {
                String assetPath = "public/" + source.substring("asset:".length());
                try (android.content.res.AssetFileDescriptor afd = context.getAssets().openFd(assetPath)) {
                    retriever.setDataSource(afd.getFileDescriptor(), afd.getStartOffset(), afd.getLength());
                }
            } else {
                retriever.setDataSource(source, new java.util.HashMap<>());
            }

            String durationStr = retriever.extractMetadata(MediaMetadataRetriever.METADATA_KEY_DURATION);
            long durationMs = durationStr != null ? Long.parseLong(durationStr) : 0;
            if (durationMs <= 0) durationMs = 3000; // sane fallback for a metadata-less source

            int frameCount = Math.min(maxFrames, Math.max(1, (int) (durationMs / frameIntervalMs)));
            List<Bitmap> frames = new ArrayList<>(frameCount);
            for (int i = 0; i < frameCount; i++) {
                long timeUs = (durationMs * i / frameCount) * 1000L;
                Bitmap raw = retriever.getFrameAtTime(timeUs, MediaMetadataRetriever.OPTION_CLOSEST_SYNC);
                if (raw == null) continue;
                frames.add(downscale(raw, framePx));
            }
            return frames;
        } finally {
            retriever.release();
        }
    }

    static Bitmap downscale(Bitmap src, int targetPx) {
        int longest = Math.max(src.getWidth(), src.getHeight());
        if (longest <= targetPx) return src;
        float scale = (float) targetPx / longest;
        Matrix m = new Matrix();
        m.postScale(scale, scale);
        Bitmap scaled = Bitmap.createBitmap(src, 0, 0, src.getWidth(), src.getHeight(), m, true);
        if (scaled != src) src.recycle();
        return scaled;
    }
}
