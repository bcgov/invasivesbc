package bc.gov.invasivesbc;

import android.app.Activity;
import android.os.Build;
import android.os.Handler;
import android.os.Looper;
import android.view.View;
import android.view.WindowInsets;
import android.graphics.Insets;

import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.JSObject;

@CapacitorPlugin(name = "SafeInsets")
public class SafeInsets extends Plugin {

    private final Handler debounceHandler = new Handler(Looper.getMainLooper());
    private Runnable debounceRunnable;
    private static final int DEBOUNCE_DELAY_MS = 100;

    @Override
    public void load() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            Activity activity = getActivity();
            if (activity == null) return;

            View decorView = activity.getWindow().getDecorView();

            decorView.setOnApplyWindowInsetsListener((v, insets) -> {
                Insets gestureInsets = insets.getInsets(WindowInsets.Type.systemGestures());
                Insets statusBarInsets = insets.getInsets(WindowInsets.Type.statusBars());
                Insets imeInsets = insets.getInsets(WindowInsets.Type.ime());

                int top = statusBarInsets.top;
                int bottom = gestureInsets.bottom;
                int left = gestureInsets.left;
                int right = gestureInsets.right;

                // TO DO: add ime logic here
                // boolean imeVisible = insets.isVisible(WindowInsets.Type.ime()); // Not consistent with all tablets
                // if (imeVisible) {
                //     bottom = Math.max(bottom, imeInsets.bottom); 
                // }
                
                JSObject result = new JSObject();
                result.put("top", top);
                result.put("bottom", bottom);
                result.put("left", left);
                result.put("right", right);

                if (debounceRunnable != null) {
                    debounceHandler.removeCallbacks(debounceRunnable);
                }

                debounceRunnable = () -> notifyListeners("insetsChanged", result);
                debounceHandler.postDelayed(debounceRunnable, DEBOUNCE_DELAY_MS);
                return v.onApplyWindowInsets(insets);
            });
        }
    }

    @PluginMethod
    public void getSafeAreaInsets(PluginCall call) {
        Activity activity = getActivity();
        if (activity == null) {
            call.reject("Activity is null");
            return;
        }

        activity.runOnUiThread(() -> {
            View decorView = activity.getWindow().getDecorView();
            WindowInsets insets = decorView.getRootWindowInsets();

            int top = 0, bottom = 0, left = 0, right = 0;
            boolean imeVisible = false;

            if (insets != null) {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
                    Insets gestureInsets = insets.getInsets(WindowInsets.Type.systemGestures());
                    Insets statusBarInsets = insets.getInsets(WindowInsets.Type.statusBars());
                    Insets imeInsets = insets.getInsets(WindowInsets.Type.ime());

                    top = statusBarInsets.top;
                    bottom = gestureInsets.bottom;
                    left = gestureInsets.left;
                    right = gestureInsets.right;
                
                } else if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                    bottom = insets.getSystemGestureInsets().bottom;
                    left = insets.getSystemGestureInsets().left;
                    right = insets.getSystemGestureInsets().right;
                    top = insets.getSystemWindowInsetTop();
                } else {
                    top = insets.getSystemWindowInsetTop();
                    bottom = insets.getSystemWindowInsetBottom();
                    left = insets.getSystemWindowInsetLeft();
                    right = insets.getSystemWindowInsetRight();
                }
            }

            JSObject result = new JSObject();
            result.put("top", top);
            result.put("bottom", bottom);
            result.put("left", left);
            result.put("right", right);

            call.resolve(result);
        });
    }
}
