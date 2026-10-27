package com.jose91042.quinielalab;

import android.app.Activity;
import android.content.Intent;
import android.graphics.Color;
import android.graphics.Typeface;
import android.graphics.drawable.GradientDrawable;
import android.net.Uri;
import android.os.Bundle;
import android.view.View;
import android.view.Gravity;
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
import android.widget.FrameLayout;
import android.widget.ProgressBar;
import android.widget.TextView;

public final class MainActivity extends Activity {
    private static final String HOME = "https://quiniela-lab-jose.onrender.com/";
    private WebView web;
    private ProgressBar progress;
    private LinearLayout errorBox;
    private LinearLayout welcome;
    private FrameLayout content;
    private boolean firstPage = true;
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
        root.setBackgroundColor(Color.rgb(244,245,239));
        getWindow().setStatusBarColor(Color.rgb(244,245,239));
        getWindow().setNavigationBarColor(Color.rgb(244,245,239));
        getWindow().getDecorView().setSystemUiVisibility(View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR | View.SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR);
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
        progress = new ProgressBar(this,null,android.R.attr.progressBarStyleHorizontal);
        progress.setProgressTintList(android.content.res.ColorStateList.valueOf(Color.rgb(122,155,72)));
        root.addView(progress,new LinearLayout.LayoutParams(-1,dp(3)));
        errorBox = new LinearLayout(this); errorBox.setOrientation(LinearLayout.VERTICAL); errorBox.setPadding(dp(30),dp(48),dp(30),dp(24));
        errorBox.setGravity(Gravity.CENTER);
        TextView errorTitle = label("Hacemos una pausa.",28,Color.rgb(22,63,50));
        errorTitle.setTypeface(null,Typeface.BOLD); errorBox.addView(errorTitle);
        TextView message = new TextView(this);
        message.setText("Comprueba tu conexión y vuelve a intentarlo. Si el servidor está despertando, puede tardar un momento.");
        message.setTextColor(Color.rgb(112,128,109)); message.setTextSize(15); message.setGravity(Gravity.CENTER); message.setPadding(0,dp(20),0,dp(24)); errorBox.addView(message);
        Button retry = new Button(this); retry.setText("Volver a intentar");
        retry.setAllCaps(false); retry.setTextColor(Color.WHITE); retry.setBackground(round(Color.rgb(22,63,50),16)); retry.setPadding(dp(24),dp(14),dp(24),dp(14));
        retry.setOnClickListener(v -> { errorBox.setVisibility(View.GONE); content.setVisibility(View.VISIBLE); web.setVisibility(View.VISIBLE); web.loadUrl(failedUrl); });
        errorBox.addView(retry); root.addView(errorBox,new LinearLayout.LayoutParams(-1,0,1)); errorBox.setVisibility(View.GONE);
        content = new FrameLayout(this);
        root.addView(content,new LinearLayout.LayoutParams(-1,0,1));
        web = new WebView(this);
        web.setBackgroundColor(Color.rgb(244,245,239));
        content.addView(web,new FrameLayout.LayoutParams(-1,-1));
        welcome = new LinearLayout(this);
        welcome.setOrientation(LinearLayout.VERTICAL); welcome.setGravity(Gravity.CENTER);
        GradientDrawable backdrop = new GradientDrawable(GradientDrawable.Orientation.TL_BR,new int[]{Color.rgb(14,49,39),Color.rgb(31,78,55)});
        welcome.setBackground(backdrop); welcome.setPadding(dp(35),dp(40),dp(35),dp(40));
        TextView logo = label("Q·",56,Color.rgb(216,239,138));
        logo.setTypeface(null,Typeface.BOLD); logo.setGravity(Gravity.CENTER); logo.setBackground(round(Color.rgb(39,85,59),28));
        welcome.addView(logo,new LinearLayout.LayoutParams(dp(106),dp(106)));
        TextView name = label("quiniela lab",33,Color.WHITE); name.setTypeface(null,Typeface.BOLD); name.setPadding(0,dp(26),0,dp(12)); welcome.addView(name);
        TextView motto = label("LEE EL JUEGO. VIVE LA JORNADA.",10,Color.rgb(216,239,138)); motto.setLetterSpacing(.15f); welcome.addView(motto);
        TextView wait = label("Preparando tu pizarra…",14,Color.rgb(194,214,195)); wait.setPadding(0,dp(56),0,dp(12)); welcome.addView(wait);
        ProgressBar spinner = new ProgressBar(this); spinner.setIndeterminateTintList(android.content.res.ColorStateList.valueOf(Color.rgb(216,239,138))); welcome.addView(spinner,new LinearLayout.LayoutParams(dp(24),dp(24)));
        content.addView(welcome,new FrameLayout.LayoutParams(-1,-1));
        WebSettings settings = web.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setAllowFileAccess(false);
        settings.setAllowContentAccess(false);
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        settings.setUserAgentString(settings.getUserAgentString()+" QuinielaLabApp/1.1 Android");
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
            @Override public void onPageFinished(WebView view,String url) {
                CookieManager.getInstance().flush();
                if(firstPage) { firstPage=false; welcome.animate().alpha(0f).setDuration(250).withEndAction(() -> welcome.setVisibility(View.GONE)).start(); }
            }
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
        welcome.setVisibility(View.GONE);
        content.setVisibility(View.GONE);
        web.setVisibility(View.GONE); errorBox.setVisibility(View.VISIBLE); progress.setVisibility(View.GONE);
    }
    private int dp(int value) { return Math.round(value*getResources().getDisplayMetrics().density); }
    private GradientDrawable round(int color,int radius) { GradientDrawable d=new GradientDrawable(); d.setColor(color); d.setCornerRadius(dp(radius)); return d; }
    private TextView label(String text,int size,int color) { TextView t=new TextView(this); t.setText(text); t.setTextSize(size); t.setTextColor(color); t.setGravity(Gravity.CENTER); return t; }
    @Override protected void onSaveInstanceState(Bundle state) { web.saveState(state); super.onSaveInstanceState(state); }
    @Override protected void onPause() { CookieManager.getInstance().flush(); web.onPause(); super.onPause(); }
    @Override protected void onResume() { super.onResume(); if (web != null) web.onResume(); }
    @Override public void onBackPressed() { if (web.canGoBack()) web.goBack(); else super.onBackPressed(); }
    @Override protected void onDestroy() { web.destroy(); super.onDestroy(); }
}
