package bc.gov.invasivesbc;

import static android.content.Context.ACTIVITY_SERVICE;

import android.app.ActivityManager;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "DeviceInformation")

public class DeviceInformation extends Plugin {


  final Runtime runtime = Runtime.getRuntime();

  @PluginMethod()
  public void deviceCharacteristics(PluginCall call) {

    ActivityManager.MemoryInfo memoryInfo = new ActivityManager.MemoryInfo();
    ActivityManager activityManager = (ActivityManager) this.getContext().getSystemService(ACTIVITY_SERVICE);
    activityManager.getMemoryInfo(memoryInfo);

    JSObject ret = new JSObject();
    ret.put("totalBytes", memoryInfo.totalMem);
    ret.put("availableBytes", memoryInfo.availMem);
    ret.put("lowMemoryCondition", memoryInfo.lowMemory);
    ret.put("largeMemoryClass", activityManager.getLargeMemoryClass());
    ret.put("VMFree", runtime.freeMemory());
    ret.put("VMMax", runtime.maxMemory());

    call.resolve(ret);
  }
}
