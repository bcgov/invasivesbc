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

        guard let SSO_BASE_URL = Bundle.main.infoDictionary?["SSO_BASE_URL"] as? String else {
            call.reject("No SSO base URL configured")
            self.authState = nil
            return
        }

        guard let SSO_CLIENT_ID = Bundle.main.infoDictionary?["SSO_CLIENT_ID"] as? String else {
            call.reject("No SSO client ID configured")
            self.authState = nil
            return
        }

        guard let refreshToken = authState?.lastTokenResponse?.refreshToken else {
            call.reject("No refresh token available")
            self.authState = nil
            return
        }
        
        let revokeEndpoint = "\(SSO_BASE_URL)/protocol/openid-connect/revoke"

        let session = URLSession.shared

        // revoke refresh token
        var revokeRequest = URLRequest(url: URL(string: revokeEndpoint)!)
        revokeRequest.httpMethod = "POST"
        revokeRequest.setValue("application/x-www-form-urlencoded", forHTTPHeaderField: "Content-Type")

        let revokeBodyParams = [
            "client_id": SSO_CLIENT_ID,
            "token": refreshToken,
            "token_type_hint": "refresh_token"
        ]
        
        let revokeBodyString = revokeBodyParams.map { "\($0.key)=\($0.value)" }.joined(separator: "&")
        revokeRequest.httpBody = revokeBodyString.data(using: .utf8)

        let revokeTask = session.dataTask(with: revokeRequest) { data, response, error in
            if let error = error {
                print("Error revoking token: \(error.localizedDescription)")
            } else if let httpResponse = response as? HTTPURLResponse, httpResponse.statusCode == 200 {
                print("Successfully revoked refresh token")
            } else {
                print("Failed to revoke token")
            }

            // call keycloak logout endpoint
            self.performLogout(call)
        }
        
        revokeTask.resume()
    }
    
    @objc func performLogout(_ call: CAPPluginCall) {
        guard let idToken = authState?.lastTokenResponse?.idToken else {
            call.reject("No refresh token available")
            self.authState = nil
            return
        }
        guard let SSO_BASE_URL = Bundle.main.infoDictionary?["SSO_BASE_URL"] as? String else {
            call.reject("No SSO base URL configured")
            self.authState = nil
            return
        }

        guard let SSO_CLIENT_ID = Bundle.main.infoDictionary?["SSO_CLIENT_ID"] as? String else {
            call.reject("No SSO client id configured")
            self.authState = nil
            return
        }

        let endsessionEndpoint = "\(SSO_BASE_URL)/protocol/openid-connect/logout"
        
        guard let refreshToken = authState?.lastTokenResponse?.refreshToken else {
            call.reject("No refresh token available")
            self.authState = nil
            return
        }
        var request = URLRequest(url: URL(string: endsessionEndpoint)!)
        request.httpMethod = "POST"
        let bodyParams: [String: String] = [
            "id_token_hint": idToken,
            "client_id": SSO_CLIENT_ID,
            "refresh_token":refreshToken
        ]

        do {
            let bodyData = try JSONSerialization.data(withJSONObject: bodyParams, options: [])
            request.httpBody = bodyData
        } catch {
            print("Failed to serialize bodyParams: \(error.localizedDescription)")
        }

        let task = URLSession.shared.dataTask(with: request) { data, response, error in
            if let error = error {
                print("Authorization error: \(error.localizedDescription)")
                    call.resolve([
                        "authorized": false,
                        "accessToken": nil,
                        "idToken": nil
                     ])
                self.authState = nil
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
                    self.authState = nil
                } else {
                    print("Failed to logout")
                    self.authState = nil
                    call.resolve([
                        "authorized": false,
                        "accessToken": nil,
                        "idToken": nil
                     ])                    
                    
                }
            } else {
                call.reject("No response received")
                self.authState = nil
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
                
        
        var authorizationParameters = ["prompt": "login"]
        if let idpHint = call.options["idpHint"] {
            authorizationParameters["kc_idp_hint"] = "\(idpHint)";
        }
        
        let request = OIDAuthorizationRequest(configuration: configuration,
                                              clientId: clientID,
                                              scopes: [OIDScopeOpenID, OIDScopeProfile, "offline_access"],
                                              redirectURL: redirectURI,
                                              responseType: OIDResponseTypeCode,
                                              additionalParameters: authorizationParameters)

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
