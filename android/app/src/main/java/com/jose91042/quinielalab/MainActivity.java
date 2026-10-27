package com.jose91042.quinielalab;

import android.app.Activity;
import android.content.Intent;
import android.graphics.Color;
import android.net.Uri;
import android.os.Bundle;
import android.view.View;
import android.view.WindowInsets;
import android.webkit.CookieManager;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.ProgressBar;
import android.widget.TextView;

public final class MainActivity extends Activity {
    private static final String HOME = "https://quiniela-lab-jose.onrender.com/";
    private WebView web;
    private ProgressBar progress;
    private LinearLayout errorBox;
    private String failedUrl = HOME;

    static boolean internal(Uri uri) {
        return "https".equalsIgnoreCase(uri.getScheme())
            && "quiniela-lab-jose.onrender.com".equalsIgnoreCase(uri.getHost())
            && (uri.getPort() == -1 || uri.getPort() == 443)
            && uri.getUserInfo() == null;
    }

    @Override public void onCreate(Bundle state) {
        super.onCreate(state);
        LinearLayout root = new LinearLayout(this);
        root.setOrientation(LinearLayout.VERTICAL);
        root.setBackgroundColor(Color.rgb(11,19,34));
        root.setOnApplyWindowInsetsListener((v, insets) -> {
            if (android.os.Build.VERSION.SDK_INT >= 30) {
                android.graphics.Insets i = insets.getInsets(WindowInsets.Type.systemBars() | WindowInsets.Type.displayCutout());
                v.setPadding(i.left,i.top,i.right,i.bottom);
            } else {
                v.setPadding(insets.getSystemWindowInsetLeft(),insets.getSystemWindowInsetTop(),insets.getSystemWindowInsetRight(),insets.getSystemWindowInsetBottom());
            }
            return insets;
        });
        setContentView(root);
        root.requestApplyInsets();
        LinearLayout bar = new LinearLayout(this);
        TextView title = new TextView(this);
        title.setText("Quiniela Lab"); title.setTextColor(Color.WHITE); title.setTextSize(18); title.setPadding(20,12,0,12);
        bar.addView(title,new LinearLayout.LayoutParams(0,-2,1));
        Button reload = new Button(this); reload.setText("Actualizar");
        reload.setOnClickListener(v -> { errorBox.setVisibility(View.GONE); web.setVisibility(View.VISIBLE); web.reload(); });
        bar.addView(reload); root.addView(bar);
        progress = new ProgressBar(this,null,android.R.attr.progressBarStyleHorizontal);
        root.addView(progress,new LinearLayout.LayoutParams(-1,6));
        errorBox = new LinearLayout(this); errorBox.setOrientation(LinearLayout.VERTICAL); errorBox.setPadding(24,48,24,24);
        TextView message = new TextView(this);
        message.setText("No se ha podido cargar la web. Comprueba tu conexión. Si el servidor está arrancando, espera un momento y vuelve a intentarlo.");
        message.setTextColor(Color.WHITE); message.setTextSize(18); errorBox.addView(message);
        Button retry = new Button(this); retry.setText("Volver a intentar");
        retry.setOnClickListener(v -> { errorBox.setVisibility(View.GONE); web.setVisibility(View.VISIBLE); web.loadUrl(failedUrl); });
        errorBox.addView(retry); root.addView(errorBox); errorBox.setVisibility(View.GONE);
        web = new WebView(this);
        root.addView(web,new LinearLayout.LayoutParams(-1,0,1));
        WebSettings settings = web.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setAllowFileAccess(false);
        settings.setAllowContentAccess(false);
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        settings.setUserAgentString(settings.getUserAgentString()+" QuinielaLabApp/1.0 Android");
        CookieManager.getInstance().setAcceptCookie(true);
        CookieManager.getInstance().setAcceptThirdPartyCookies(web,false);
        web.setWebChromeClient(new WebChromeClient() {
            @Override public void onProgressChanged(WebView view,int value) {
                progress.setProgress(value); progress.setVisibility(value == 100 ? View.GONE : View.VISIBLE);
            }
        });
        web.setWebViewClient(new WebViewClient() {
            @Override public boolean shouldOverrideUrlLoading(WebView view,WebResourceRequest request) {
                Uri uri = request.getUrl();
                if (internal(uri)) return false;
                if (request.isForMainFrame() && "https".equalsIgnoreCase(uri.getScheme())) {
                    try { startActivity(new Intent(Intent.ACTION_VIEW,uri)); } catch (android.content.ActivityNotFoundException ignored) { }
                }
                return true;
            }
            @Override public void onPageFinished(WebView view,String url) { CookieManager.getInstance().flush(); }
            @Override public void onReceivedError(WebView view,WebResourceRequest request,WebResourceError error) {
                if (request.isForMainFrame()) showError(request.getUrl());
            }
            @Override public void onReceivedHttpError(WebView view,WebResourceRequest request,WebResourceResponse response) {
                if (request.isForMainFrame() && response.getStatusCode() >= 500) showError(request.getUrl());
            }
        });
        if (state == null || web.restoreState(state) == null) web.loadUrl(HOME);
    }
    private void showError(Uri uri) {
        failedUrl = internal(uri) ? uri.toString() : HOME;
        web.setVisibility(View.GONE); errorBox.setVisibility(View.VISIBLE); progress.setVisibility(View.GONE);
    }
    @Override protected void onSaveInstanceState(Bundle state) { web.saveState(state); super.onSaveInstanceState(state); }
    @Override protected void onPause() { CookieManager.getInstance().flush(); web.onPause(); super.onPause(); }
    @Override protected void onResume() { super.onResume(); if (web != null) web.onResume(); }
    @Override public void onBackPressed() { if (web.canGoBack()) web.goBack(); else super.onBackPressed(); }
    @Override protected void onDestroy() { web.destroy(); super.onDestroy(); }
}
