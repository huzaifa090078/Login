package com.login.wholesale;

import android.os.Bundle;
import android.view.View;
import android.webkit.WebView;
import android.widget.Toast;
import androidx.activity.OnBackPressedCallback;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    private long lastBackPressTime = 0;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Ensure decor fits system windows so app content is strictly below the status bar / notch
        WindowCompat.setDecorFitsSystemWindows(getWindow(), true);

        // Apply window insets to root content view (status bar, notch/display cutout, navigation bar)
        View contentView = findViewById(android.R.id.content);
        if (contentView != null) {
            ViewCompat.setOnApplyWindowInsetsListener(contentView, (v, windowInsets) -> {
                Insets insets = windowInsets.getInsets(
                    WindowInsetsCompat.Type.systemBars() | WindowInsetsCompat.Type.displayCutout()
                );
                v.setPadding(insets.left, insets.top, insets.right, insets.bottom);
                return windowInsets;
            });
        }

        // Handle physical/system back button step-by-step
        getOnBackPressedDispatcher().addCallback(this, new OnBackPressedCallback(true) {
            @Override
            public void handleOnBackPressed() {
                WebView webView = getBridge() != null ? getBridge().getWebView() : null;
                if (webView != null) {
                    webView.evaluateJavascript(
                        "(function() { return (window.handleAndroidBackButton && window.handleAndroidBackButton()) ? 'handled' : 'unhandled'; })();",
                        value -> {
                            if (value != null && value.contains("handled") && !value.contains("unhandled")) {
                                // Successfully stepped back inside web app (closed modal, cleared search/category, etc.)
                                return;
                            }
                            handleAppExit();
                        }
                    );
                } else {
                    handleAppExit();
                }
            }
        });
    }

    private void handleAppExit() {
        long currentTime = System.currentTimeMillis();
        if (currentTime - lastBackPressTime < 2000) {
            finish();
        } else {
            lastBackPressTime = currentTime;
            Toast.makeText(this, "Press back again to exit", Toast.LENGTH_SHORT).show();
        }
    }
}
