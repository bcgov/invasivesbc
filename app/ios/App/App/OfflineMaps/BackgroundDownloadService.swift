//
//  OfflineMaps.swift
//  App
//
//  Created by Robert Johnstone on 2025/8/20.
//

import Foundation
import OSLog

struct DownloadTaskMetadata: Codable {
  var url: String
  var name: String
  var type: String
  var format: String
}

/* stored in-memory, so we can notify the capacitor plugin (and thus the js code) about download state */
/* note that it is possible the capacitor plugin does not exist (if we are in the background state) so we need this level of indirection */
struct CallbackReferences {
  var progress: (Float) -> Void
  var completion: (Bool) -> Void
}

actor BackgroundDownloadService: NSObject, URLSessionDelegate,
  URLSessionDownloadDelegate
{

  private let logger = Logger(
    subsystem: "\(Bundle.main.bundleIdentifier!)",
    category: "protomaps-downloader"
  )

  private let dataStore = UserDefaults.standard

  private var completionHandler: (() -> Void)?

  private var activeDownloads = [String: URLSessionDownloadTask]()
  private var downloadStateCallbacks = [String: CallbackReferences]()

  private lazy var urlSession: URLSession = {
    let config = URLSessionConfiguration.background(
      withIdentifier: "\(Bundle.main.bundleIdentifier!).protomaps-downloader"
    )
    config.isDiscretionary = false  // change to true to allow ios to schedule the download more flexibly
    config.sessionSendsLaunchEvents = true

    return URLSession(
      configuration: config,
      delegate: self,
      delegateQueue: OperationQueue()
    )
  }()

  static let singleton = BackgroundDownloadService()

  // not constructable
  private override init() {
    super.init()
  }

  private func handleCompletion() {
    logger.debug(
      "handling completion event, removing stored completion handler"
    )
    self.completionHandler?()
    self.completionHandler = nil
  }

  public nonisolated func urlSessionDidFinishEvents(
    forBackgroundURLSession session: URLSession
  ) {
    logger.debug("urlSessionDidFinishEvents")
    Task {
      // settled. fire the completion handler, if it exists, to notify the OS we are done processing background jobs
      await self.handleCompletion()
    }
  }

  private func removeDownload(for url: String) {
    self.activeDownloads[url] = nil
    self.downloadStateCallbacks[url] = nil
  }

  public nonisolated func urlSession(
    _ session: URLSession,
    task: URLSessionTask,
    didCompleteWithError error: Error?
  ) {
    logger.debug(
      "urlSession:task:didCompleteWithError: \(String(describing: error))"
    )

    Task {
      await self.removeDownload(for: task.originalRequest!.url!.absoluteString)
    }
  }

  private func completeDownload(
    for tempLocation: URL,
    downloadTask: URLSessionDownloadTask
  ) {

    logger.info("completeDownload")

    guard downloadTask.originalRequest?.url != nil else {
      logger.error("url is required")
      return
    }

    guard let key = downloadTask.originalRequest?.url?.absoluteString else {
      logger.error("url is required")
      return
    }

    if let encoded = self.dataStore.object(forKey: key) as? Data {
      let decoder = JSONDecoder()
      let taskMetadata = try! decoder.decode(
        DownloadTaskMetadata.self,
        from: encoded
      )

      let ext =
        switch taskMetadata.format {
        case "pmtiles":
          "pmtiles"
        default:
          "pmtiles"
        }

      let path =
        switch taskMetadata.type {
        case "vector":
          "vectors"
        case "raster":
          "rasters"
        default:
          "unknown"
        }

      defer {
        self.removeDownload(for: key)
      }

      do {
        let permanentLocation = URL.cachesDirectory.appendingPathComponent(path)
          .appendingPathComponent(taskMetadata.name + ".\(ext)")
        logger.info("moving to \(permanentLocation)")

        try FileManager.default.createDirectory(
          at: URL.cachesDirectory.appendingPathComponent(path),
          withIntermediateDirectories: true
        )
        try FileManager.default.moveItem(
          at: tempLocation,
          to: permanentLocation
        )

        logger.debug("file is now in permanent location")

        // notify capacitor
        downloadStateCallbacks[key]?.completion(true)
      } catch {
        downloadStateCallbacks[key]?.completion(false)
        logger.error("Error moving file \(error)")
      }
    }

  }

  public nonisolated func urlSession(
    _ session: URLSession,
    downloadTask: URLSessionDownloadTask,
    didFinishDownloadingTo location: URL
  ) {
    logger.debug("urlSession:downloadTask:didFinishDownloadingTo: \(location)")

    let tempLocation = FileManager.default.temporaryDirectory
      .appendingPathComponent(location.lastPathComponent)
    try? FileManager.default.moveItem(
      at: location,
      to: tempLocation
    )

    Task {
      await self.completeDownload(for: tempLocation, downloadTask: downloadTask)
    }
  }

  public nonisolated func urlSession(
    _ session: URLSession,
    downloadTask: URLSessionDownloadTask,
    didWriteData bytesWritten: Int64,
    totalBytesWritten: Int64,
    totalBytesExpectedToWrite: Int64
  ) {

    guard let key = downloadTask.originalRequest?.url?.absoluteString else {
      logger.error("url is missing in progress delegate call")
      return
    }

    if totalBytesExpectedToWrite > 0 {
      let progress = Float(totalBytesWritten) / Float(totalBytesExpectedToWrite)
      let progressPercentage = progress * 100
      logger.info(
        "Download with task identifier: \(downloadTask.taskIdentifier) is \(progressPercentage)% complete..."
      )
      Task {
        await downloadStateCallbacks[key]?.progress(progressPercentage)
      }
    }
  }

  public func queueDownload(
    metadata: DownloadTaskMetadata,
    progressCallback: @escaping (Float) -> Void,
    completionCallback: @escaping (Bool) -> Void
  ) {
    let downloadTask = self.urlSession.downloadTask(
      with: URL(string: metadata.url)!
    )
    downloadStateCallbacks.updateValue(
      CallbackReferences(
        progress: progressCallback,
        completion: completionCallback
      ),
      forKey: metadata.url
    )

    let encoder = JSONEncoder()
    if let encoded = try? encoder.encode(metadata) {
      // persist metadata
      dataStore.set(encoded, forKey: metadata.url)
    }

    downloadTask.resume()
  }

  /* if we were re-launched due to the completion of a background download, we need to save (and later call) this handler */
  func saveCompletionHandler(_ completionHandler: @escaping (() -> Void)) {
    self.completionHandler = completionHandler
  }

}
