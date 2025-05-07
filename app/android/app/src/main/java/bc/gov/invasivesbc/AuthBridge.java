package bc.gov.invasivesbc;


import android.content.Intent;
import android.net.Uri;
import android.util.Log;

import androidx.activity.result.ActivityResult;
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

import java.io.BufferedInputStream;
import java.io.BufferedOutputStream;
import java.io.IOException;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@CapacitorPlugin(name = "AuthBridge")

public class AuthBridge extends Plugin {

  private static String CLIENT_ID = "invasives-bc-4565";

  private AuthorizationService authService = null;
  private AuthState authState = null;

  private void initAuthService() {
    this.authService = new AuthorizationService(this.getContext());
    this.authState = new AuthState();
  }

  @ActivityCallback()
  public void authCompleteCallback(PluginCall call, ActivityResult result) {
    Log.d("auth", "authcomplete callback");
    AuthorizationResponse authorizationResponse = AuthorizationResponse.fromIntent(result.getData());
    AuthorizationException authorizationException = AuthorizationException.fromIntent(result.getData());
    authState.update(authorizationResponse, authorizationException);


    if (authorizationException != null) {
      Log.e("auth", authorizationException.toJsonString());
    }


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
    final JSObject resolution = new JSObject();
    resolution.put("accessToken", null);
    resolution.put("idToken", null);

    this.authState.performActionWithFreshTokens(authService, new AuthState.AuthStateAction() {
        @Override
        public void execute(@Nullable String accessToken, @Nullable String idToken, @Nullable AuthorizationException ex) {

          try {
            final URL logoutURL = new URL("https://loginproxy.gov.bc.ca/auth/realms/standard/protocol/openid-connect/logout");
            HttpURLConnection conn = (HttpURLConnection) logoutURL.openConnection();
            conn.setRequestMethod("POST");
            conn.setRequestProperty("Content-type", "application/x-www-form-urlencoded");
            conn.setRequestProperty("Authorization", "Bearer " + accessToken);
            conn.setDoOutput(true);
            conn.setDoInput(true);

            try (BufferedOutputStream out = new BufferedOutputStream(conn.getOutputStream())) {
              final String encodedClientID = URLEncoder.encode(CLIENT_ID, StandardCharsets.UTF_8);
              final String encodedRefreshToken = URLEncoder.encode(authState.getRefreshToken(), StandardCharsets.UTF_8);
              final String logoutRequestBody = "client_id=" + encodedClientID + "&refresh_token=" + encodedRefreshToken;

              out.write(logoutRequestBody.getBytes(StandardCharsets.UTF_8));
            }

            try (BufferedInputStream in = new BufferedInputStream(conn.getInputStream())) {
              final byte[] response = in.readAllBytes();
              Log.d("auth", "response: " + new String(response));
            }

          } catch (IOException e) {
            Log.e("auth", "Caught exception processing logout\n" + e.toString());
            call.resolve(resolution);
          } finally {
            authState = null;
          }

          call.resolve(resolution);

        }
      }

    );
  }

  @PluginMethod()
  public void token(PluginCall call) {
    if (this.authState == null) {
      JSObject ret = new JSObject();
      ret.put("error", "no authstate");
      call.resolve(ret);
      Log.e("auth", "no authstate");
      return;
    }
    this.authState.performActionWithFreshTokens(authService, new AuthState.AuthStateAction() {
      @Override
      public void execute(@Nullable String accessToken, @Nullable String idToken, @Nullable AuthorizationException ex) {
        if (ex != null) {
          JSObject ret = new JSObject();
          ret.put("error", "error obtaining tokens");
          Log.e("auth", "error obtaining tokens");
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
        CLIENT_ID,
        ResponseTypeValues.CODE,
        Uri.parse("invasivesbc://callback")
      ).setScopes("openid", "offline_access")
        .build();


    Intent authIntent = authService.getAuthorizationRequestIntent(req);

    startActivityForResult(call, authIntent, "authCompleteCallback");
  }

  @PluginMethod()
  public void authStatus(PluginCall call) {

    if (this.authState == null) {
      Log.e("auth", "no authstate");

      JSObject ret = new JSObject();
      ret.put("error", "no authstate");
      call.resolve(ret);

      return;
    }

    JSObject ret = new JSObject();
    ret.put("authorized", this.authState.isAuthorized());

    Log.d("auth", "authstate: " + this.authState.isAuthorized());

    call.resolve(ret);
  }

}
