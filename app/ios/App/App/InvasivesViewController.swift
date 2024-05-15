//
//  InvasivesViewController.swift
//  App
//
//  Created by Robert Johnstone on 2024/5/14.
//

import UIKit
import Capacitor

class InvasivesViewController: CAPBridgeViewController   {

    override func viewDidLoad() {
        super.viewDidLoad()
        // Do any additional setup after loading the view.
    }
    
    override open func capacitorDidLoad() {
        bridge?.registerPluginInstance(AuthBridge())
    }
    
}
