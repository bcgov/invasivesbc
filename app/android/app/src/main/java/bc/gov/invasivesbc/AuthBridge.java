package bc.gov.invasivesbc;


import android.content.Intent;
import android.net.Uri;

import androidx.activity.result.ActivityResult;
import androidx.activity.result.ActivityResultLauncher;
import androidx.annotation.Nullable;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.ActivityCallback;
import com.getcapacitor.annotation.CapacitorPlugin;

import net.openid.appauth.AuthState;
import net.openid.appauth.AuthorizationException;
import net.openid.appauth.AuthorizationRequest;
import net.openid.appauth.AuthorizationResponse;
import net.openid.appauth.AuthorizationService;
import net.openid.appauth.AuthorizationServiceConfiguration;
import net.openid.appauth.ResponseTypeValues;

import org.json.JSONException;

@CapacitorPlugin(name = "AuthBridge")

public class AuthBridge extends Plugin {

  private AuthorizationService authService = null;
  private AuthState authState = null;

  private void initAuthService() {
    this.authService = new AuthorizationService(this.getContext());
    this.authState = new AuthState();
  }

  @ActivityCallback()
  public void authCompleteCallback(PluginCall call, ActivityResult result) {
    AuthorizationResponse authorizationResponse = AuthorizationResponse.fromIntent(result.getData());
    AuthorizationException authorizationException = AuthorizationException.fromIntent(result.getData());
    authState.update(authorizationResponse, authorizationException);

    if (authorizationResponse == null) {
      JSObject r = new JSObject();
      r.put("authorized", false);
      call.resolve(r);
      return;
    }

    authService.performTokenRequest(authorizationResponse.createTokenExchangeRequest(), (tokenResponse, tokenException) -> {
      authState.update(tokenResponse, tokenException);
      if (tokenResponse != null) {
        JSObject r = new JSObject();
        r.put("authorized", true);
        r.put("accessToken", tokenResponse.accessToken);
        r.put("idToken", tokenResponse.idToken);
        call.resolve(r);
      } else {
        JSObject r = new JSObject();
        r.put("authorized", false);
        call.resolve(r);
      }

    });
  }

  @PluginMethod()
  public void logout(PluginCall call) {
    this.authState = null;
    call.resolve();
  }

  @PluginMethod()
  public void token(PluginCall call) {
    if (this.authState == null) {
      JSObject ret = new JSObject();
      ret.put("error", "no authstate");
      call.resolve(ret);
      return;
    }
    this.authState.performActionWithFreshTokens(authService, new AuthState.AuthStateAction() {
      @Override
      public void execute(@Nullable String accessToken, @Nullable String idToken, @Nullable AuthorizationException ex) {
        if (ex != null) {
          JSObject ret = new JSObject();
          ret.put("error", "error obtaining tokens");
          call.resolve(ret);
          return;
        }

        JSObject r = new JSObject();
        r.put("accessToken", accessToken);
        r.put("idToken", idToken);
        call.resolve(r);
      }
    });
  }

  @PluginMethod()
  public void authStart(PluginCall call) {
    if (this.authService == null) {
      initAuthService();
    }

    AuthorizationServiceConfiguration serviceConfig =
      new AuthorizationServiceConfiguration(
        Uri.parse("https://loginproxy.gov.bc.ca/auth/realms/standard/protocol/openid-connect/auth"), // authorization endpoint
        Uri.parse("https://loginproxy.gov.bc.ca/auth/realms/standard/protocol/openid-connect/token")); // token endpoint

    AuthorizationRequest req =
      new AuthorizationRequest.Builder(
        serviceConfig,
        "invasives-bc-4565",
        ResponseTypeValues.CODE,
        Uri.parse("invasivesbc://callback")
      ).build();


    Intent authIntent = authService.getAuthorizationRequestIntent(req);

    startActivityForResult(call, authIntent, "authCompleteCallback");
  }

  @PluginMethod()
  public void authStatus(PluginCall call) {
    if (this.authState == null) {
      JSObject ret = new JSObject();
      ret.put("error", "no authstate");
      call.resolve(ret);
      return;
    }

    JSObject ret = new JSObject();
    ret.put("authorized", this.authState.isAuthorized());
    call.resolve(ret);
  }

}
