
package bc.gov.invasivesbc;

import android.os.Build;
import android.view.View;
import android.view.WindowInsets;
import android.graphics.Insets;

import androidx.core.view.ViewCompat;

import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.JSObject;

@CapacitorPlugin(name = "SafeInsets")
public class SafeInsets extends Plugin {

    @Override
    public void load() {
        View decorView = getActivity().getWindow().getDecorView();

        ViewCompat.setOnApplyWindowInsetsListener(decorView, (v, in) -> {
            
            int top = 0, bottom = 0, left = 0, right = 0;
            WindowInsets insets = decorView.getRootWindowInsets();
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
                int insetTypes = WindowInsets.Type.systemBars()
                                  | WindowInsets.Type.displayCutout()
                                  | WindowInsets.Type.systemGestures()
                                  | WindowInsets.Type.ime();

                Insets combinedInsets = insets.getInsets(insetTypes);
                top = combinedInsets.top;
                bottom = combinedInsets.bottom;
                left = combinedInsets.left;
                right = combinedInsets.right;
            } else {
                top = insets.getSystemWindowInsetTop();
                bottom = insets.getSystemWindowInsetBottom();
                left = insets.getSystemWindowInsetLeft();
                right = insets.getSystemWindowInsetRight();
            }

            JSObject result = new JSObject();
            result.put("top", top);
            result.put("bottom", bottom);
            result.put("left", left);
            result.put("right", right);
            System.out.println("DYNAMIC---->>"+result + "and"+Build.VERSION.SDK_INT+"and"+Build.VERSION_CODES.R);

            notifyListeners("insetsChanged", result);
            return in;
        });
    }

    @PluginMethod
    public void getAllInsets(PluginCall call) {
        getActivity().runOnUiThread(() -> {
            View decorView = getActivity().getWindow().getDecorView();
            WindowInsets insets = decorView.getRootWindowInsets();

            int top = 0, bottom = 0, left = 0, right = 0;

            if (insets != null) {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
                    int insetTypes = WindowInsets.Type.systemBars()
                                      | WindowInsets.Type.displayCutout()
                                      | WindowInsets.Type.systemGestures()
                                      | WindowInsets.Type.ime();

                    Insets combinedInsets = insets.getInsets(insetTypes);
                    top = combinedInsets.top;
                    bottom = combinedInsets.bottom;
                    left = combinedInsets.left;
                    right = combinedInsets.right;
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
            System.out.println("INITIAL---->>"+result + "and"+Build.VERSION.SDK_INT+"and"+Build.VERSION_CODES.R);
            call.resolve(result);
        });
    }
}
