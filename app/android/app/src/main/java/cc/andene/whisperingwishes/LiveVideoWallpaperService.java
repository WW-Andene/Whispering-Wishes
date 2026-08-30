package cc.andene.whisperingwishes;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.SharedPreferences;
import android.graphics.SurfaceTexture;
import android.media.MediaPlayer;
import android.opengl.EGL14;
import android.opengl.EGLConfig;
import android.opengl.EGLContext;
import android.opengl.EGLDisplay;
import android.opengl.EGLSurface;
import android.opengl.GLES11Ext;
import android.opengl.GLES20;
import android.opengl.Matrix;
import android.os.Handler;
import android.os.HandlerThread;
import android.service.wallpaper.WallpaperService;
import android.util.Log;
import android.view.Surface;
import android.view.SurfaceHolder;

import androidx.core.content.ContextCompat;

import java.io.File;
import java.nio.ByteBuffer;
import java.nio.ByteOrder;
import java.nio.FloatBuffer;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;

// Real Android Live Wallpaper — WallpaperPlugin's static setWallpaper()/WallpaperManager.
// setBitmap() can never animate, so a genuine WallpaperService is the only way to get an
// actually-moving background. Deliberately scoped to a single static looping video with no
// parallax/multi-page home-screen offset handling — see WallpaperPlugin.setLiveWallpaper()'s
// own header for the full apply flow (download/cache -> store path -> system confirmation
// screen).
//
// Renders via a small GLES2 pipeline (SurfaceTexture + a textured quad) instead of handing
// MediaPlayer the wallpaper's SurfaceHolder directly — MediaPlayer.setVideoScalingMode() only
// offers "stretch" or "uniform-scale-and-center-crop", neither of which can be panned off
// center, so there was no way to apply the same offsetX/offsetY (object-position-style) crop
// the static wallpaper path already supports. Routing playback through a SurfaceTexture puts
// each decoded frame into a GL texture this class draws itself, with the crop/pan baked into
// the texture-coordinate transform (computeCropMatrix() below) instead of the pixels — same
// object-fit:cover + object-position math WallpaperPlugin.centerCropToScreenAspect() uses for
// the static path, just applied as a live transform every frame instead of a one-time Bitmap
// crop (the video's natural size isn't known until MediaPlayer reports it, so it can't be
// pre-cropped the way a decoded Bitmap can).
public class LiveVideoWallpaperService extends WallpaperService {
    private static final String TAG = "LiveVideoWallpaper";
    static final String PREFS_NAME = "CapacitorStorage";
    static final String PREF_VIDEO_PATH = "live_wallpaper_video_path";
    // 0-100 object-position-style percentages (50/50 = center, the old fixed behavior) —
    // written by WallpaperPlugin.setLiveWallpaper() from the same position-editor d-pad
    // ProfileTab.jsx's wallpaper crown flow already uses for the static path.
    static final String PREF_OFFSET_X = "live_wallpaper_offset_x";
    static final String PREF_OFFSET_Y = "live_wallpaper_offset_y";
    // Sent by WallpaperPlugin.setLiveWallpaper() every time a new animated background is applied
    // — including while this exact service is already the active live wallpaper. Once a live
    // wallpaper's Engine surface exists, Android has no reason to recreate it just because the
    // app overwrote the video file it reads from underneath it (same component, same surface —
    // nothing about the wallpaper's identity changed from the OS's point of view), so without
    // this the engine kept playing whatever it had already loaded: picking a second animated
    // background looked like nothing happened until the surface was recreated some other way
    // (e.g. re-picking home screen, locking/unlocking). This receiver is the explicit "the file
    // changed, reload it" signal that case was missing.
    static final String ACTION_REFRESH = "cc.andene.whisperingwishes.REFRESH_LIVE_WALLPAPER";

    private static final String VERTEX_SHADER =
            "attribute vec2 aPosition;\n" +
            "attribute vec2 aTexCoord;\n" +
            "uniform mat4 uTexMatrix;\n" +
            "varying vec2 vTexCoord;\n" +
            "void main() {\n" +
            "  gl_Position = vec4(aPosition, 0.0, 1.0);\n" +
            "  vTexCoord = (uTexMatrix * vec4(aTexCoord, 0.0, 1.0)).xy;\n" +
            "}\n";
    private static final String FRAGMENT_SHADER =
            "#extension GL_OES_EGL_image_external : require\n" +
            "precision mediump float;\n" +
            "varying vec2 vTexCoord;\n" +
            "uniform samplerExternalOES sTexture;\n" +
            "void main() {\n" +
            "  gl_FragColor = texture2D(sTexture, vTexCoord);\n" +
            "}\n";
    // Full-screen quad (triangle strip) in clip space, paired 1:1 with the texcoords below —
    // this fixed mapping never changes; all cropping/panning happens in uTexMatrix instead.
    private static final float[] QUAD_POSITIONS = { -1f, -1f, 1f, -1f, -1f, 1f, 1f, 1f };
    private static final float[] QUAD_TEXCOORDS = { 0f, 0f, 1f, 0f, 0f, 1f, 1f, 1f };

    @Override
    public Engine onCreateEngine() {
        return new VideoEngine();
    }

    private class VideoEngine extends Engine {
        private MediaPlayer mediaPlayer;
        private boolean visible = true;
        // Kept so the refresh receiver below can re-call startPlayback() against the surface
        // that's actually current, without waiting for a new onSurfaceCreated/Changed callback
        // that may never come on its own (see ACTION_REFRESH's own comment for why one is needed).
        private SurfaceHolder currentHolder;
        private final BroadcastReceiver refreshReceiver = new BroadcastReceiver() {
            @Override
            public void onReceive(Context context, Intent intent) {
                if (currentHolder != null) startPlayback(currentHolder);
            }
        };

        // ── GL/EGL state — every field below is only ever touched on glThread once it exists,
        // except through the runOnGlThread(Sync) helpers, which is what keeps a single EGL
        // context consistently current on one thread for this Engine's whole lifetime. ──
        private HandlerThread glThread;
        private Handler glHandler;
        private EGLDisplay eglDisplay = EGL14.EGL_NO_DISPLAY;
        private EGLSurface eglSurface = EGL14.EGL_NO_SURFACE;
        private EGLContext eglContext = EGL14.EGL_NO_CONTEXT;
        private int glProgram;
        private int aPositionLoc, aTexCoordLoc, uTexMatrixLoc;
        private int textureId;
        private SurfaceTexture surfaceTexture;
        private Surface videoSurface;
        private FloatBuffer positionBuffer;
        private FloatBuffer texCoordBuffer;
        private final float[] stMatrix = new float[16];
        private final float[] cropMatrix = new float[16];
        private final float[] combinedMatrix = new float[16];
        private int surfaceWidth, surfaceHeight;
        private int videoWidth, videoHeight;
        private float offsetXFrac = 0.5f, offsetYFrac = 0.5f;

        @Override
        public void onCreate(SurfaceHolder surfaceHolder) {
            super.onCreate(surfaceHolder);
            ContextCompat.registerReceiver(LiveVideoWallpaperService.this, refreshReceiver,
                    new IntentFilter(ACTION_REFRESH), ContextCompat.RECEIVER_NOT_EXPORTED);
            glThread = new HandlerThread("LiveWallpaperGL");
            glThread.start();
            glHandler = new Handler(glThread.getLooper());
        }

        @Override
        public void onSurfaceCreated(SurfaceHolder holder) {
            super.onSurfaceCreated(holder);
            currentHolder = holder;
            startPlayback(holder);
        }

        @Override
        public void onSurfaceChanged(SurfaceHolder holder, int format, int width, int height) {
            super.onSurfaceChanged(holder, format, width, height);
            currentHolder = holder;
            // A changed surface (rotation, resize) needs the player AND the GL/EGL surface
            // re-bound to the new SurfaceHolder — simplest reliable way is to tear down and
            // start fresh rather than trying to rebind mid-playback.
            startPlayback(holder);
        }

        @Override
        public void onVisibilityChanged(boolean isVisible) {
            visible = isVisible;
            runOnGlThread(() -> {
                if (mediaPlayer == null) return;
                try {
                    if (isVisible) mediaPlayer.start();
                    else mediaPlayer.pause();
                } catch (Exception ignored) {
                    // MediaPlayer can be in a transient invalid state right around
                    // surface/visibility churn — nothing meaningful to recover here, next
                    // onSurfaceCreated/Changed will rebuild it anyway.
                }
            });
        }

        private void startPlayback(SurfaceHolder holder) {
            SharedPreferences prefs = getSharedPreferences(PREFS_NAME, MODE_PRIVATE);
            String path = prefs.getString(PREF_VIDEO_PATH, null);
            if (path == null || !new File(path).exists()) {
                Log.w(TAG, "No cached live-wallpaper video at " + path);
                return;
            }
            offsetXFrac = clamp01(prefs.getFloat(PREF_OFFSET_X, 50f) / 100f);
            offsetYFrac = clamp01(prefs.getFloat(PREF_OFFSET_Y, 50f) / 100f);

            android.graphics.Rect frame = holder.getSurfaceFrame();
            surfaceWidth = frame.width();
            surfaceHeight = frame.height();
            videoWidth = 0;
            videoHeight = 0;

            // Runs entirely on glThread: tearing down any previous GL/EGL/MediaPlayer state
            // and rebuilding it against the (possibly new) SurfaceHolder is not something two
            // overlapping invocations should ever interleave.
            glHandler.post(() -> {
                releasePlaybackLocked();
                initGl(holder);
                computeCropMatrix();

                try {
                    MediaPlayer player = new MediaPlayer();
                    player.setDataSource(path);
                    player.setSurface(videoSurface);
                    player.setLooping(true);
                    // A wallpaper plays silently — it's a background, not media playback the
                    // user deliberately started.
                    player.setVolume(0f, 0f);
                    player.setOnVideoSizeChangedListener((mp, width, height) -> runOnGlThread(() -> {
                        videoWidth = width;
                        videoHeight = height;
                        computeCropMatrix();
                    }));
                    player.setOnPreparedListener(mp -> {
                        if (visible) mp.start();
                    });
                    player.prepareAsync();
                    mediaPlayer = player;
                } catch (Exception e) {
                    Log.w(TAG, "Could not start live wallpaper playback", e);
                    releasePlaybackLocked();
                }
            });
        }

        // ── GL setup (glThread only) ──────────────────────────────────────────────────────
        private void initGl(SurfaceHolder holder) {
            eglDisplay = EGL14.eglGetDisplay(EGL14.EGL_DEFAULT_DISPLAY);
            if (eglDisplay == EGL14.EGL_NO_DISPLAY) {
                Log.w(TAG, "eglGetDisplay failed");
                return;
            }
            int[] version = new int[2];
            if (!EGL14.eglInitialize(eglDisplay, version, 0, version, 1)) {
                Log.w(TAG, "eglInitialize failed");
                return;
            }

            int[] configAttribs = {
                EGL14.EGL_RENDERABLE_TYPE, EGL14.EGL_OPENGL_ES2_BIT,
                EGL14.EGL_RED_SIZE, 8, EGL14.EGL_GREEN_SIZE, 8, EGL14.EGL_BLUE_SIZE, 8,
                EGL14.EGL_ALPHA_SIZE, 8, EGL14.EGL_NONE,
            };
            EGLConfig[] configs = new EGLConfig[1];
            int[] numConfigs = new int[1];
            if (!EGL14.eglChooseConfig(eglDisplay, configAttribs, 0, configs, 0, 1, numConfigs, 0) || numConfigs[0] == 0) {
                Log.w(TAG, "eglChooseConfig failed");
                return;
            }
            EGLConfig eglConfig = configs[0];

            int[] contextAttribs = { EGL14.EGL_CONTEXT_CLIENT_VERSION, 2, EGL14.EGL_NONE };
            eglContext = EGL14.eglCreateContext(eglDisplay, eglConfig, EGL14.EGL_NO_CONTEXT, contextAttribs, 0);
            eglSurface = EGL14.eglCreateWindowSurface(eglDisplay, eglConfig, holder.getSurface(), new int[]{ EGL14.EGL_NONE }, 0);
            if (!EGL14.eglMakeCurrent(eglDisplay, eglSurface, eglSurface, eglContext)) {
                Log.w(TAG, "eglMakeCurrent failed");
                return;
            }

            glProgram = buildProgram();
            aPositionLoc = GLES20.glGetAttribLocation(glProgram, "aPosition");
            aTexCoordLoc = GLES20.glGetAttribLocation(glProgram, "aTexCoord");
            uTexMatrixLoc = GLES20.glGetUniformLocation(glProgram, "uTexMatrix");

            int[] textures = new int[1];
            GLES20.glGenTextures(1, textures, 0);
            textureId = textures[0];
            GLES20.glBindTexture(GLES11Ext.GL_TEXTURE_EXTERNAL_OES, textureId);
            GLES20.glTexParameteri(GLES11Ext.GL_TEXTURE_EXTERNAL_OES, GLES20.GL_TEXTURE_MIN_FILTER, GLES20.GL_LINEAR);
            GLES20.glTexParameteri(GLES11Ext.GL_TEXTURE_EXTERNAL_OES, GLES20.GL_TEXTURE_MAG_FILTER, GLES20.GL_LINEAR);
            GLES20.glTexParameteri(GLES11Ext.GL_TEXTURE_EXTERNAL_OES, GLES20.GL_TEXTURE_WRAP_S, GLES20.GL_CLAMP_TO_EDGE);
            GLES20.glTexParameteri(GLES11Ext.GL_TEXTURE_EXTERNAL_OES, GLES20.GL_TEXTURE_WRAP_T, GLES20.GL_CLAMP_TO_EDGE);

            surfaceTexture = new SurfaceTexture(textureId);
            surfaceTexture.setOnFrameAvailableListener(st -> runOnGlThread(this::drawFrame), glHandler);
            videoSurface = new Surface(surfaceTexture);

            positionBuffer = toFloatBuffer(QUAD_POSITIONS);
            texCoordBuffer = toFloatBuffer(QUAD_TEXCOORDS);
        }

        private int buildProgram() {
            int vertexShader = compileShader(GLES20.GL_VERTEX_SHADER, VERTEX_SHADER);
            int fragmentShader = compileShader(GLES20.GL_FRAGMENT_SHADER, FRAGMENT_SHADER);
            int program = GLES20.glCreateProgram();
            GLES20.glAttachShader(program, vertexShader);
            GLES20.glAttachShader(program, fragmentShader);
            GLES20.glLinkProgram(program);
            int[] linkStatus = new int[1];
            GLES20.glGetProgramiv(program, GLES20.GL_LINK_STATUS, linkStatus, 0);
            if (linkStatus[0] == 0) {
                Log.w(TAG, "Program link failed: " + GLES20.glGetProgramInfoLog(program));
            }
            return program;
        }

        private int compileShader(int type, String source) {
            int shader = GLES20.glCreateShader(type);
            GLES20.glShaderSource(shader, source);
            GLES20.glCompileShader(shader);
            int[] compileStatus = new int[1];
            GLES20.glGetShaderiv(shader, GLES20.GL_COMPILE_STATUS, compileStatus, 0);
            if (compileStatus[0] == 0) {
                Log.w(TAG, "Shader compile failed: " + GLES20.glGetShaderInfoLog(shader));
            }
            return shader;
        }

        private FloatBuffer toFloatBuffer(float[] values) {
            FloatBuffer buffer = ByteBuffer.allocateDirect(values.length * 4)
                    .order(ByteOrder.nativeOrder()).asFloatBuffer();
            buffer.put(values).position(0);
            return buffer;
        }

        // Same object-fit:cover + object-position math WallpaperPlugin.centerCropToScreenAspect()
        // applies to a static Bitmap, expressed instead as a texture-coordinate scale+translate
        // (glThread only) — recomputed whenever either the video's own natural size or the
        // surface size becomes known/changes.
        private void computeCropMatrix() {
            if (videoWidth <= 0 || videoHeight <= 0 || surfaceWidth <= 0 || surfaceHeight <= 0) {
                Matrix.setIdentityM(cropMatrix, 0);
                return;
            }
            float scale = Math.max((float) surfaceWidth / videoWidth, (float) surfaceHeight / videoHeight);
            float scaledW = videoWidth * scale;
            float scaledH = videoHeight * scale;
            float texWindowW = Math.min(1f, surfaceWidth / scaledW);
            float texWindowH = Math.min(1f, surfaceHeight / scaledH);
            float texLeft = (1f - texWindowW) * offsetXFrac;
            float texTop = (1f - texWindowH) * offsetYFrac;

            Matrix.setIdentityM(cropMatrix, 0);
            Matrix.translateM(cropMatrix, 0, texLeft, texTop, 0f);
            Matrix.scaleM(cropMatrix, 0, texWindowW, texWindowH, 1f);
        }

        private void drawFrame() {
            if (eglDisplay == EGL14.EGL_NO_DISPLAY || surfaceTexture == null) return;
            surfaceTexture.updateTexImage();
            surfaceTexture.getTransformMatrix(stMatrix);
            Matrix.multiplyMM(combinedMatrix, 0, stMatrix, 0, cropMatrix, 0);

            GLES20.glViewport(0, 0, surfaceWidth, surfaceHeight);
            GLES20.glClearColor(0f, 0f, 0f, 1f);
            GLES20.glClear(GLES20.GL_COLOR_BUFFER_BIT);
            GLES20.glUseProgram(glProgram);

            positionBuffer.position(0);
            GLES20.glVertexAttribPointer(aPositionLoc, 2, GLES20.GL_FLOAT, false, 0, positionBuffer);
            GLES20.glEnableVertexAttribArray(aPositionLoc);
            texCoordBuffer.position(0);
            GLES20.glVertexAttribPointer(aTexCoordLoc, 2, GLES20.GL_FLOAT, false, 0, texCoordBuffer);
            GLES20.glEnableVertexAttribArray(aTexCoordLoc);

            GLES20.glActiveTexture(GLES20.GL_TEXTURE0);
            GLES20.glBindTexture(GLES11Ext.GL_TEXTURE_EXTERNAL_OES, textureId);
            GLES20.glUniformMatrix4fv(uTexMatrixLoc, 1, false, combinedMatrix, 0);

            GLES20.glDrawArrays(GLES20.GL_TRIANGLE_STRIP, 0, 4);
            EGL14.eglSwapBuffers(eglDisplay, eglSurface);
        }

        // Tears down the MediaPlayer, SurfaceTexture/Surface, and GL/EGL context — glThread
        // only. Named "Locked" not for a real lock but to flag that every field it touches is
        // only ever safe to touch from glThread, the same discipline a lock would enforce.
        private void releasePlaybackLocked() {
            if (mediaPlayer != null) {
                try { mediaPlayer.release(); } catch (Exception ignored) { }
                mediaPlayer = null;
            }
            if (videoSurface != null) {
                videoSurface.release();
                videoSurface = null;
            }
            if (surfaceTexture != null) {
                surfaceTexture.release();
                surfaceTexture = null;
            }
            if (eglDisplay != EGL14.EGL_NO_DISPLAY) {
                EGL14.eglMakeCurrent(eglDisplay, EGL14.EGL_NO_SURFACE, EGL14.EGL_NO_SURFACE, EGL14.EGL_NO_CONTEXT);
                if (eglSurface != EGL14.EGL_NO_SURFACE) EGL14.eglDestroySurface(eglDisplay, eglSurface);
                if (eglContext != EGL14.EGL_NO_CONTEXT) EGL14.eglDestroyContext(eglDisplay, eglContext);
                EGL14.eglTerminate(eglDisplay);
            }
            eglDisplay = EGL14.EGL_NO_DISPLAY;
            eglSurface = EGL14.EGL_NO_SURFACE;
            eglContext = EGL14.EGL_NO_CONTEXT;
        }

        // Posts to glThread and returns immediately — fine for anything not racing against the
        // Surface becoming invalid right after this call returns (start/pause, a fresh
        // (re)start of playback).
        private void runOnGlThread(Runnable r) {
            if (glHandler != null) glHandler.post(r);
        }

        // Blocks until glThread finishes — required before this method's OWN caller returns
        // control to a WallpaperService callback that might immediately invalidate the Surface
        // (onSurfaceDestroyed, onDestroy): letting glThread's teardown lag behind that risks it
        // touching a Surface/EGLSurface that's already gone.
        private void runOnGlThreadSync(Runnable r) {
            if (glHandler == null) { r.run(); return; }
            CountDownLatch latch = new CountDownLatch(1);
            glHandler.post(() -> {
                try { r.run(); } finally { latch.countDown(); }
            });
            try { latch.await(2, TimeUnit.SECONDS); } catch (InterruptedException ignored) { }
        }

        // Instance method, not static — VideoEngine is a non-static inner class, and this
        // project's Java source compatibility level may not allow static members there
        // (that restriction was only lifted from JDK 16 onward).
        private float clamp01(float v) {
            return Math.max(0f, Math.min(1f, v));
        }

        @Override
        public void onSurfaceDestroyed(SurfaceHolder holder) {
            super.onSurfaceDestroyed(holder);
            runOnGlThreadSync(this::releasePlaybackLocked);
        }

        @Override
        public void onDestroy() {
            super.onDestroy();
            runOnGlThreadSync(this::releasePlaybackLocked);
            if (glThread != null) glThread.quitSafely();
            try { LiveVideoWallpaperService.this.unregisterReceiver(refreshReceiver); } catch (Exception ignored) {
                // Already unregistered, or never successfully registered — nothing to clean up.
            }
        }
    }
}
