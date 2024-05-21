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
        self.authState = nil
        call.resolve([:])
    }
    
    @objc func authStart(_ call: CAPPluginCall) {
        let authorizationEndpoint = URL(string: "http://localhost:8080/auth/realms/invasives/protocol/openid-connect/auth")!
        let tokenEndpoint = URL(string: "http://localhost:8080/auth/realms/invasives/protocol/openid-connect/token")!
        let configuration = OIDServiceConfiguration(authorizationEndpoint: authorizationEndpoint,
                                                    tokenEndpoint: tokenEndpoint)
        let redirectURI = URL(string:"invasivesbc://callback")!
        let clientID = "invasivesbc"
        
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
