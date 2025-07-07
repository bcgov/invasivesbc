package bc.gov.invasivesbc;

import android.os.Bundle;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
  @Override
  public void onCreate(Bundle savedInstanceState) {
    registerPlugin(AuthBridge.class);
    registerPlugin(DeviceInformation.class);
    registerPlugin(SafeInsetsPlugin.class); 
    super.onCreate(savedInstanceState);
  }
}
