package com.example.plugins;

import android.os.Build;
import android.view.View;
import android.view.WindowInsets;

import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.JSObject;

@CapacitorPlugin(name = "SafeInsetsPlugin")
public class SafeInsetsPlugin extends Plugin {

    @PluginMethod
    public void getInsets(PluginCall call) {
        getActivity().runOnUiThread(() -> {
            View decorView = getActivity().getWindow().getDecorView();
            WindowInsets insets = decorView.getRootWindowInsets();

            int top = 0, bottom = 0, left = 0, right = 0;

            if (insets != null) {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
                    android.graphics.Insets combinedInsets = insets.getInsets(
                        WindowInsets.Type.systemBars()
                        | WindowInsets.Type.displayCutout()
                        | WindowInsets.Type.systemGestures()
                    );


                  if (Build.VERSION.SDK_INT >= 35) {
                    combinedInsets |= WindowInsets.Type.safeGestures();
                  }

                    top = combinedInsets.top;
                    bottom = combinedInsets.bottom;
                    left = combinedInsets.left;
                    right = combinedInsets.right;
                } else {
                    // Fallback for older Android versions
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
