package bc.gov.invasivesbc;

import android.os.Bundle;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
  @Override
  public void onCreate(Bundle savedInstanceState) {
    registerPlugin(AuthBridge.class);
    super.onCreate(savedInstanceState);
  }
}
