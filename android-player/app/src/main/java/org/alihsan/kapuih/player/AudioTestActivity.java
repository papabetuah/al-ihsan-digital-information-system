package org.alihsan.kapuih.player;

import android.app.Activity;
import android.graphics.Color;
import android.os.Build;
import android.os.Bundle;
import android.view.Gravity;
import android.view.WindowManager;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.TextView;

public final class AudioTestActivity extends Activity {
    private static final String BASE =
            "https://papabetuah.github.io/al-ihsan-digital-information-system/?nativePlayer=1&preazanTest=";

    private WebView webView;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        getWindow().addFlags(
                WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON |
                WindowManager.LayoutParams.FLAG_FULLSCREEN
        );
        showMenu();
    }

    private void showMenu() {
        LinearLayout menu = new LinearLayout(this);
        menu.setOrientation(LinearLayout.VERTICAL);
        menu.setGravity(Gravity.CENTER);
        menu.setPadding(64, 48, 64, 48);
        menu.setBackgroundColor(Color.rgb(0, 24, 27));

        TextView title = new TextView(this);
        title.setText("AL IHSAN — TES AUDIO PRA-AZAN");
        title.setTextColor(Color.WHITE);
        title.setTextSize(26);
        title.setGravity(Gravity.CENTER);
        title.setPadding(0, 0, 0, 24);
        menu.addView(title);

        TextView help = new TextView(this);
        help.setText("Pilih skenario. Audio pertama harus mulai otomatis setelah jeda 2 detik.\nTes ini tidak mengubah jadwal sholat produksi.");
        help.setTextColor(Color.LTGRAY);
        help.setTextSize(17);
        help.setGravity(Gravity.CENTER);
        help.setPadding(0, 0, 0, 30);
        menu.addView(help);

        addButton(menu, "TES ISYA", "Isya");
        addButton(menu, "TES SUBUH", "Subuh");
        addButton(menu, "TES JUMAT", "Jumat");
        setContentView(menu);
    }

    private void addButton(LinearLayout menu, String label, String prayer) {
        Button button = new Button(this);
        button.setText(label);
        button.setTextSize(20);
        LinearLayout.LayoutParams params = new LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT, 86
        );
        params.setMargins(0, 10, 0, 10);
        button.setLayoutParams(params);
        button.setOnClickListener(v -> startTest(prayer));
        menu.addView(button);
    }

    private void startTest(String prayer) {
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
                settings.getUserAgentString() + " AlIhsanNativeAudioTest/1.1"
        );
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            settings.setSafeBrowsingEnabled(true);
        }

        webView.setWebChromeClient(new WebChromeClient());
        webView.setWebViewClient(new WebViewClient());
        setContentView(webView);
        webView.loadUrl(BASE + prayer);
    }

    @Override
    public void onBackPressed() {
        if (webView != null) {
            webView.stopLoading();
            webView.destroy();
            webView = null;
            showMenu();
            return;
        }
        super.onBackPressed();
    }

    @Override
    protected void onDestroy() {
        if (webView != null) {
            webView.stopLoading();
            webView.destroy();
        }
        super.onDestroy();
    }
}
