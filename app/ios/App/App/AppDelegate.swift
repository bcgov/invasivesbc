import UIKit
import Capacitor
import AppAuth

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {
    
    var currentAuthorizationFlow: OIDExternalUserAgentSession?
    var authBridgeInstance: AuthBridge?
    
    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        // Override point for customization after application launch.
        return true
    }
  
    func application(_ application: UIApplication,
                     configurationForConnecting connectingSceneSession: UISceneSession,
                     options: UIScene.ConnectionOptions) -> UISceneConfiguration {
        let config = UISceneConfiguration(name: "Default Configuration",
                                          sessionRole: connectingSceneSession.role)
        config.delegateClass = SceneDelegate.self
        return config
    }
  
    func application(_ application: UIApplication, shouldSaveSecureApplicationState coder: NSCoder) -> Bool {
       coder.encode(140, forKey: "InvasivesBCVersion")
       return true
    }
        
    func application(_ application: UIApplication,
                shouldRestoreSecureApplicationState coder: NSCoder) -> Bool {
       let version = coder.decodeInteger(forKey: "InvasivesBCVersion")
       if version == 140 {
          return true
       }
      
       // skip state restoration on version mismatch
       return false
    }
    
    func applicationWillTerminate(_ application: UIApplication) {
        // Called when the application is about to terminate. Save data if appropriate. See also applicationDidEnterBackground:.
    }
    
    func application(_ app: UIApplication, open url: URL, options: [UIApplication.OpenURLOptionsKey: Any] = [:]) -> Bool {
        // Called when the app was launched with a url. Feel free to add additional processing here,
        // but if you want the App API to support tracking app url opens, make sure to keep this call
        
        if let authorizationFlow = self.currentAuthorizationFlow,
                                   authorizationFlow.resumeExternalUserAgentFlow(with: url) {
          self.currentAuthorizationFlow = nil
          return true
        }
        
        return ApplicationDelegateProxy.shared.application(app, open: url, options: options)
    }
    
    func application(_ application: UIApplication, continue userActivity: NSUserActivity, restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void) -> Bool {
        // Called when the app was launched with an activity, including Universal Links.
        // Feel free to add additional processing here, but if you want the App API to support
        // tracking app url opens, make sure to keep this call
        return ApplicationDelegateProxy.shared.application(application, continue: userActivity, restorationHandler: restorationHandler)
    }
  
  func application(_ application: UIApplication,
                   handleEventsForBackgroundURLSession identifier: String,
                   completionHandler: @escaping () -> Void) {
      // called when the app is launched in background due to download completion. it is required that the app call the passed completionHandler after handling the download
      Task {
          await BackgroundDownloadService.singleton.saveCompletionHandler(completionHandler)
      }
  }
    
}
