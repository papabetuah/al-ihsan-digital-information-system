package org.alihsan.kapuih.player;

import android.app.Activity;
import android.app.role.RoleManager;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.pm.ResolveInfo;
import android.graphics.Color;
import android.media.AudioAttributes;
import android.media.AudioFocusRequest;
import android.media.AudioManager;
import android.os.Build;
import android.os.Bundle;
import android.provider.Settings;
import android.view.KeyEvent;
import android.view.View;
import android.view.WindowManager;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Toast;

public final class MainActivity extends Activity {
    private static final String SITE_URL =
            "https://papabetuah.github.io/al-ihsan-digital-information-system/?nativePlayer=1";

    private WebView webView;
    private AudioManager audioManager;
    private AudioFocusRequest audioFocusRequest;
    private boolean homePromptAttempted;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        getWindow().addFlags(
                WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON |
                WindowManager.LayoutParams.FLAG_FULLSCREEN
        );
        setVolumeControlStream(AudioManager.STREAM_MUSIC);
        enterImmersiveMode();
        requestPermanentMediaAudioFocus();

        webView = new WebView(this);
        webView.setBackgroundColor(Color.BLACK);
        webView.setKeepScreenOn(true);

        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);
        settings.setLoadsImagesAutomatically(true);
        settings.setMediaPlaybackRequiresUserGesture(false);
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        settings.setAllowFileAccess(false);
        settings.setAllowContentAccess(false);
        settings.setCacheMode(WebSettings.LOAD_DEFAULT);
        settings.setUserAgentString(
                settings.getUserAgentString() + " AlIhsanNativePlayer/1.1"
        );

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            settings.setSafeBrowsingEnabled(true);
        }

        webView.setWebChromeClient(new WebChromeClient());
        webView.setWebViewClient(new WebViewClient() {
            @Override
            public void onPageFinished(WebView view, String url) {
                super.onPageFinished(view, url);
                // Keep the page alive and let its own prayer scheduler control playback.
                view.evaluateJavascript(
                        "document.documentElement.dataset.nativePlayer='1';" +
                        "window.AL_IHSAN_PRE_AZAN_AUDIO?.prime?.();",
                        null
                );
            }
        });

        setContentView(webView);
        webView.loadUrl(SITE_URL);
    }

    private boolean isDefaultHome() {
        Intent homeIntent = new Intent(Intent.ACTION_MAIN);
        homeIntent.addCategory(Intent.CATEGORY_HOME);
        ResolveInfo info = getPackageManager().resolveActivity(
                homeIntent,
                android.content.pm.PackageManager.MATCH_DEFAULT_ONLY
        );
        if (info == null || info.activityInfo == null) return false;
        ComponentName resolved = new ComponentName(
                info.activityInfo.packageName,
                info.activityInfo.name
        );
        return getPackageName().equals(resolved.getPackageName());
    }

    private void requestDefaultHomeIfNeeded() {
        if (homePromptAttempted || isDefaultHome()) return;
        homePromptAttempted = true;

        Toast.makeText(
                this,
                "Pilih Al Ihsan TV sebagai aplikasi Home lalu pilih Selalu / Always.",
                Toast.LENGTH_LONG
        ).show();

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            RoleManager roleManager = getSystemService(RoleManager.class);
            if (roleManager != null
                    && roleManager.isRoleAvailable(RoleManager.ROLE_HOME)
                    && !roleManager.isRoleHeld(RoleManager.ROLE_HOME)) {
                try {
                    startActivity(roleManager.createRequestRoleIntent(RoleManager.ROLE_HOME));
                    return;
                } catch (RuntimeException ignored) { }
            }
        }

        try {
            startActivity(new Intent(Settings.ACTION_HOME_SETTINGS));
        } catch (RuntimeException first) {
            try {
                Intent home = new Intent(Intent.ACTION_MAIN);
                home.addCategory(Intent.CATEGORY_HOME);
                startActivity(Intent.createChooser(home, "Pilih Al Ihsan TV sebagai Home"));
            } catch (RuntimeException ignored) { }
        }
    }

    private void requestPermanentMediaAudioFocus() {
        audioManager = (AudioManager) getSystemService(Context.AUDIO_SERVICE);
        if (audioManager == null) return;

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            AudioAttributes attrs = new AudioAttributes.Builder()
                    .setUsage(AudioAttributes.USAGE_MEDIA)
                    .setContentType(AudioAttributes.CONTENT_TYPE_MUSIC)
                    .build();

            audioFocusRequest = new AudioFocusRequest.Builder(AudioManager.AUDIOFOCUS_GAIN)
                    .setAudioAttributes(attrs)
                    .setOnAudioFocusChangeListener(focusChange -> { })
                    .build();

            audioManager.requestAudioFocus(audioFocusRequest);
        } else {
            audioManager.requestAudioFocus(
                    focusChange -> { },
                    AudioManager.STREAM_MUSIC,
                    AudioManager.AUDIOFOCUS_GAIN
            );
        }
    }

    private void enterImmersiveMode() {
        getWindow().getDecorView().setSystemUiVisibility(
                View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY |
                View.SYSTEM_UI_FLAG_FULLSCREEN |
                View.SYSTEM_UI_FLAG_HIDE_NAVIGATION |
                View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN |
                View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION |
                View.SYSTEM_UI_FLAG_LAYOUT_STABLE
        );
    }

    @Override
    public void onWindowFocusChanged(boolean hasFocus) {
        super.onWindowFocusChanged(hasFocus);
        if (hasFocus) enterImmersiveMode();
    }

    @Override
    protected void onResume() {
        super.onResume();
        enterImmersiveMode();
        if (webView != null) {
            webView.onResume();
            webView.resumeTimers();
        }
        requestDefaultHomeIfNeeded();
    }

    @Override
    protected void onPause() {
        if (webView != null) webView.onPause();
        super.onPause();
    }

    @Override
    protected void onDestroy() {
        if (audioManager != null && Build.VERSION.SDK_INT >= Build.VERSION_CODES.O && audioFocusRequest != null) {
            audioManager.abandonAudioFocusRequest(audioFocusRequest);
        }
        if (webView != null) {
            webView.stopLoading();
            webView.destroy();
        }
        super.onDestroy();
    }

    @Override
    public boolean dispatchKeyEvent(KeyEvent event) {
        // Keep normal TV remote volume handling. Back does not exit the kiosk.
        if (event.getKeyCode() == KeyEvent.KEYCODE_BACK) return true;
        return super.dispatchKeyEvent(event);
    }
}
