package com.uvrenn.project70;

import android.Manifest;
import android.app.Activity;
import android.app.NotificationManager;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.graphics.Color;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.webkit.JavascriptInterface;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.view.View;
import android.widget.FrameLayout;

public class MainActivity extends Activity {
    private static final int REQUEST_NOTIFICATIONS = 7020;
    private WebView webView;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        getWindow().setStatusBarColor(Color.rgb(13, 17, 27));
        getWindow().setNavigationBarColor(Color.rgb(13, 17, 27));

        FrameLayout root = new FrameLayout(this);
        root.setBackgroundColor(Color.rgb(13, 17, 27));

        webView = new WebView(this);
        webView.setBackgroundColor(Color.rgb(13, 17, 27));
        webView.setOverScrollMode(View.OVER_SCROLL_NEVER);

        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);
        settings.setAllowFileAccess(true);
        settings.setAllowContentAccess(true);
        settings.setJavaScriptCanOpenWindowsAutomatically(false);
        settings.setSupportMultipleWindows(false);
        settings.setDefaultTextEncodingName("UTF-8");

        webView.setWebChromeClient(new WebChromeClient());
        webView.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                Uri uri = request.getUrl();
                if ("file".equals(uri.getScheme())) {
                    return false;
                }
                if ("https".equals(uri.getScheme())
                        && ("fonts.googleapis.com".equals(uri.getHost())
                        || "fonts.gstatic.com".equals(uri.getHost()))) {
                    return false;
                }
                try {
                    startActivity(new Intent(Intent.ACTION_VIEW, uri));
                } catch (Exception ignored) {
                    // Ignore links without a compatible external app.
                }
                return true;
            }
        });

        webView.addJavascriptInterface(new Project70Bridge(), "Project70Native");
        root.addView(webView, new FrameLayout.LayoutParams(
                FrameLayout.LayoutParams.MATCH_PARENT,
                FrameLayout.LayoutParams.MATCH_PARENT
        ));
        setContentView(root);

        webView.loadUrl("file:///android_asset/www/index.html");
        ReminderScheduler.restore(this);
    }

    @Override
    public void onBackPressed() {
        if (webView != null && webView.canGoBack()) {
            webView.goBack();
        } else {
            super.onBackPressed();
        }
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, String[] permissions, int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        if (requestCode == REQUEST_NOTIFICATIONS) {
            boolean granted = grantResults.length > 0
                    && grantResults[0] == PackageManager.PERMISSION_GRANTED
                    && notificationsEnabled();
            notifyWebViewPermissionResult(granted);
            if (granted) {
                ReminderScheduler.restore(this);
            }
        }
    }

    private boolean notificationsEnabled() {
        NotificationManager manager =
                (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
        boolean appEnabled = manager != null && manager.areNotificationsEnabled();
        boolean runtimeGranted = Build.VERSION.SDK_INT < 33
                || checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS)
                == PackageManager.PERMISSION_GRANTED;
        return appEnabled && runtimeGranted;
    }

    private void notifyWebViewPermissionResult(boolean granted) {
        if (webView != null) {
            String script = "window.onNativeNotificationPermission && window.onNativeNotificationPermission("
                    + (granted ? "true" : "false") + ");";
            webView.post(() -> webView.evaluateJavascript(script, null));
        }
    }

    private class Project70Bridge {
        @JavascriptInterface
        public void requestNotifications() {
            runOnUiThread(() -> {
                if (Build.VERSION.SDK_INT >= 33
                        && checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS)
                        != PackageManager.PERMISSION_GRANTED) {
                    requestPermissions(
                            new String[]{Manifest.permission.POST_NOTIFICATIONS},
                            REQUEST_NOTIFICATIONS
                    );
                } else {
                    notifyWebViewPermissionResult(notificationsEnabled());
                }
            });
        }

        @JavascriptInterface
        public boolean notificationsEnabled() {
            return MainActivity.this.notificationsEnabled();
        }

        @JavascriptInterface
        public void syncReminders(String workout, String meal, String recovery) {
            if (!notificationsEnabled()) {
                return;
            }
            ReminderScheduler.scheduleDaily(
                    MainActivity.this,
                    "workout",
                    "Workout quest",
                    "Your scheduled training window is here. Check today's plan.",
                    workout
            );
            ReminderScheduler.scheduleDaily(
                    MainActivity.this,
                    "meal",
                    "Meal check-in",
                    "Time for a balanced meal and a protein source.",
                    meal
            );
            ReminderScheduler.scheduleDaily(
                    MainActivity.this,
                    "recovery",
                    "Recovery check",
                    "Wind down, hydrate and make room for sleep.",
                    recovery
            );
        }
    }
}
