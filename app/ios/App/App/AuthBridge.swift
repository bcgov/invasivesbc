//
//  AuthBridge.swift
//  App
//
//  Created by Robert Johnstone on 2024/5/14.
//

import Foundation
import Capacitor
import AppAuth

@objc(AuthBridge)
public class AuthBridge: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "AuthBridge"
    public let jsName = "AuthBridge"
    
    private var authState: OIDAuthState?
    
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "authStart", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "authStatus", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "token", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "logout", returnType: CAPPluginReturnPromise)
    ]
    
    @objc func token(_ call: CAPPluginCall) {
        guard let authState = authState else { call.resolve(["error": "no authstate"]); return; }
        
        authState.performAction() { (accessToken, idToken, error) in
            if error != nil  {
                call.resolve(["error": "Error fetching fresh tokens: \(error?.localizedDescription ?? "Unknown error")"])
              return
            }
            
            guard let accessToken = accessToken else {
                call.resolve(["error": "No access token available"])

              return
            }
            
            guard let idToken = idToken else {
                call.resolve(["error": "No id token available"])

              return
            }
            
            call.resolve(["accessToken": accessToken, "idToken": idToken]);
        }
        
    }
    
    @objc func authStatus(_ call: CAPPluginCall) {
        guard let authState = authState else { call.resolve(["error": "no authstate"]); return; }

        call.resolve([
            "authorized": authState.isAuthorized
        ])
    }
    
    
    @objc func logout(_ call: CAPPluginCall) {
        guard let idTokenHint = call.getString("id_token_hint") else {
            call.reject("id_token_hint parameter is missing.")
            return
        }

        guard let postLogoutRedirectUri = call.getString("post_logout_redirect_uri") else {
            call.reject("post_logout_redirect_uri parameter is missing.")
            return
        }

        guard let SSO_BASE_URL = Bundle.main.infoDictionary?["SSO_BASE_URL"] as? String else {
            call.reject("No SSO base URL configured")
            return
        }

        guard let SSO_CLIENT_ID = Bundle.main.infoDictionary?["SSO_CLIENT_ID"] as? String else {
            call.reject("No SSO client id configured")
            return
        }

        guard let endsessionEndpoint = URL(string: "\(SSO_BASE_URL)/protocol/openid-connect/logout") else {
            call.reject("Invalid logout endpoint URL")
            return
        }

        guard let postLogoutRedirectURL = URL(string: "invasivesbc://callback") else {
            call.reject("Invalid redirect URI")
            return
        }

        var request = URLRequest(url: endsessionEndpoint)
        request.httpMethod = "POST"
        let bodyParams: [String: String] = [
            "id_token_hint": idTokenHint,
            "post_logout_redirect_uri": postLogoutRedirectURL.absoluteString,
            "client_id": SSO_CLIENT_ID
        ]

        do {
            let bodyData = try JSONSerialization.data(withJSONObject: bodyParams, options: [])
            request.httpBody = bodyData
        } catch {
            print("Error serializing JSON body: \(error.localizedDescription)")
            call.reject("Failed to serialize JSON body")
            return
        }

        let task = URLSession.shared.dataTask(with: request) { data, response, error in
            if let error = error {
                print("Error logging out: \(error.localizedDescription)")
                call.reject("Logout failed: \(error.localizedDescription)")
                return
            }

            if let httpResponse = response as? HTTPURLResponse {
                if httpResponse.statusCode == 200 {
                    print("Successfully logged out")

                    self.authState = nil
                    call.resolve([
                        "authorized": false,
                        "accessToken": nil,
                        "idToken": nil
                    ])
                } else {
                    print("Logout failed with status code: \(httpResponse.statusCode)")
                    if let data = data, let responseString = String(data: data, encoding: .utf8) {
                        print("Response: \(responseString)")
                    }
                    call.reject("Logout failed with status code: \(httpResponse.statusCode)")
                }
            } else {
                call.reject("No response received")
            }
        }

        task.resume()
        
    }
    
    @objc func authStart(_ call: CAPPluginCall) {
        guard let SSO_BASE_URL = Bundle.main.infoDictionary?["SSO_BASE_URL"] as? String else {
            call.resolve(["error": "No sso base url configured"]);
            return;
        }
        
        guard let SSO_CLIENT_ID = Bundle.main.infoDictionary?["SSO_CLIENT_ID"] as? String else {
            call.resolve(["error": "No sso client id configured"]);
            return;
        }
        
        let authorizationEndpoint = URL(string: "\(SSO_BASE_URL)/protocol/openid-connect/auth")!
        let tokenEndpoint = URL(string: "\(SSO_BASE_URL)/protocol/openid-connect/token")!
        let configuration = OIDServiceConfiguration(authorizationEndpoint: authorizationEndpoint,
                                                    tokenEndpoint: tokenEndpoint)
        let redirectURI = URL(string:"invasivesbc://callback")!
        let clientID = "\(SSO_CLIENT_ID)"
        
        let request = OIDAuthorizationRequest(configuration: configuration,
                                              clientId: clientID,
                                              scopes: [OIDScopeOpenID, OIDScopeProfile],
                                              redirectURL: redirectURI,
                                              responseType: OIDResponseTypeCode,
                                              additionalParameters: nil)
                
        DispatchQueue.main.sync {
            
            let appDelegate = UIApplication.shared.delegate as! AppDelegate
            
            let keyWindow = UIApplication.shared.windows.filter {$0.isKeyWindow}.first
            var ivc: UIViewController? = nil
            
            if var topController = keyWindow?.rootViewController {
                while let presentedViewController = topController.presentedViewController {
                    topController = presentedViewController
                }
                ivc = topController
            }
            
            appDelegate.authBridgeInstance = self
            
            appDelegate.currentAuthorizationFlow =
            OIDAuthState.authState(byPresenting: request, presenting: ivc!) { authState, error in
                if let authState = authState {
                    self.authState = authState
                    call.resolve([
                        "authorized": true,
                        "accessToken": authState.lastTokenResponse?.accessToken as Any,
                        "idToken": authState.lastTokenResponse?.idToken as Any
                     ])
                    print("Got authorization tokens. Access token: " +
                          "\(authState.lastTokenResponse?.accessToken ?? "nil")")
                } else {
                    print("Authorization error: \(error?.localizedDescription ?? "Unknown error")")
                    self.authState = nil
                    call.resolve([
                        "authorized": false
                     ])
                }
            }
        }
    }
    
}
