//
//  OfflineMaps.swift
//  App
//
//  Created by Robert Johnstone on 2025/7/18.
//

import Capacitor
import Foundation
import OSLog

struct DownloadRequest {
  var url: String
  var name: String
  var type: String
  var format: String
}

struct OfflineMapRecord: Encodable {
  var name: String
  var metadata: String
}

@objc(OfflineMaps)
public class OfflineMaps: CAPPlugin, CAPBridgedPlugin {
  private let logger = Logger(
    subsystem: "\(Bundle.main.bundleIdentifier!)",
    category: "protomaps-downloader"
  )

  private let dataStore = UserDefaults.standard

  public let identifier = "OfflineMaps"
  public let jsName = "OfflineMaps"

  public let pluginMethods: [CAPPluginMethod] = [
    CAPPluginMethod(
      name: "requestDownload",
      returnType: CAPPluginReturnCallback
    ),
    CAPPluginMethod(name: "byteRange", returnType: CAPPluginReturnPromise),
    CAPPluginMethod(name: "listDownloads", returnType: CAPPluginReturnPromise),
    CAPPluginMethod(name: "delete", returnType: CAPPluginReturnPromise),
  ]

  override public func load() {
    logger.debug("OfflineMaps plugin loaded")
  }

  @objc func byteRange(_ call: CAPPluginCall) {
    guard let filename = call.getString("filename") else {
      call.reject("filename required")
      return
    }
    guard let offset = call.getInt("offset") else {
      call.reject("offset required")
      return
    }
    guard let length = call.getInt("length") else {
      call.reject("length required")
      return
    }

    do {
      let fullPath = URL.cachesDirectory.appendingPathComponent(filename)
      let handle = try FileHandle(forReadingFrom: fullPath)
      try handle.seek(toOffset: UInt64(offset))
      let data = handle.readData(ofLength: length)
      try handle.close()
      call.resolve(["encoded": data.base64EncodedString()])
    } catch let error {
      call.reject("\(error)")
      return
    }

  }

  @objc func delete(_ call: CAPPluginCall) {

    guard let name = call.getString("name") else {
      call.reject("filename required")
      return
    }
    guard let fileType = call.getString("type") else {
      call.reject("type required")
      return
    }

    if !(fileType == "vectors" || fileType == "rasters") {
      call.reject("type incorrect")
      return
    }

    let fullPath = URL.cachesDirectory.appendingPathComponent(fileType)
      .appendingPathComponent(name + ".pmtiles")
      

    do {
      try FileManager.default.removeItem(at: fullPath)
      call.resolve()
    } catch let error {
      logger.error("error deleting file: \(error)")
      call.reject("error deleting file")
    }

  }

  @objc func listDownloads(_ call: CAPPluginCall) {
    let resourceKeys = Set<URLResourceKey>([.nameKey, .isDirectoryKey])

    let vectorEnumerator = FileManager.default.enumerator(
      at: URL.cachesDirectory.appendingPathComponent("vectors"),
      includingPropertiesForKeys: Array(resourceKeys),
      options: .skipsHiddenFiles
    )!
    let rasterEnumerator = FileManager.default.enumerator(
      at: URL.cachesDirectory.appendingPathComponent("rasters"),
      includingPropertiesForKeys: Array(resourceKeys),
      options: .skipsHiddenFiles
    )!

    var foundVectors: [OfflineMapRecord] = []
    var foundRasters: [OfflineMapRecord] = []

    for case let fileURL as URL in vectorEnumerator {
      guard
        let resourceValues = try? fileURL.resourceValues(forKeys: resourceKeys),
        let isDirectory = resourceValues.isDirectory
      else {
        continue
      }
      if !isDirectory {
        logger.debug("fc: metadata-\(fileURL.lastPathComponent)")
        foundVectors.append(
          OfflineMapRecord(
            name: fileURL.lastPathComponent,
            metadata: dataStore.string(
              forKey: "metadata-\(fileURL.lastPathComponent)"
            ) ?? ""
          )
        )
      }
    }
    for case let fileURL as URL in rasterEnumerator {
      guard
        let resourceValues = try? fileURL.resourceValues(forKeys: resourceKeys),
        let isDirectory = resourceValues.isDirectory
      else {
        continue
      }
      if !isDirectory {
        foundRasters.append(
          OfflineMapRecord(
            name: fileURL.lastPathComponent,
            metadata: dataStore.string(
              forKey: "metadata-\(fileURL.lastPathComponent)"
            ) ?? ""
          )
        )
      }
    }
    call.resolve([
      "vectors": foundVectors.map({ v in
        return ["name": v.name, "metadata": v.metadata]
      }),
      "rasters": foundRasters.map({ v in
        return ["name": v.name, "metadata": v.metadata]
      }),
    ])
  }

  @objc func requestDownload(_ call: CAPPluginCall) {
    logger.info(
      "requesting new download: \(String(describing: call.getString("url")))"
    )
    guard let url = call.getString("url") else {
      call.reject("parameter url required")
      return
    }

    let opaqueJSON = call.getString("metadata", "")

    let md = DownloadTaskMetadata(
      url: url,
      name: call.getString("name", "unnamed download"),
      type: call.getString("type", "vector"),
      format: call.getString("format", "pmtiles")
    )

    dataStore.set(opaqueJSON, forKey: "metadata-\(md.name).\(md.format)")
    logger.debug(
      "stored key: metadata-\(md.name).\(md.format), data: \(opaqueJSON)"
    )

    call.keepAlive = true

    let completion = { (result: Bool) in
      if result {
        call.resolve(["status": result ? "success" : "error"])
        return
      } else {
        call.reject("An error occurred downloading the file")
      }
    }

    let progress = { (percentage: Float) in
      call.resolve(["status": "downloading", "percent": percentage])
    }

    Task {
      await BackgroundDownloadService.singleton.queueDownload(
        metadata: md,
        progressCallback: progress,
        completionCallback: completion
      )

      call.resolve([
        "status": "download queued"
      ])

    }

  }

}
