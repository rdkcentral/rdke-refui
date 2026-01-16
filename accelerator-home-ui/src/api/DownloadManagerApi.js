/**
 * If not stated otherwise in this file or this component's LICENSE
 * file the following copyright and licenses apply:
 *
 * Copyright 2026 RDK Management
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 **/

import { ThunderError } from './ThunderError';
import ThunderJS from 'ThunderJS';
import { CONFIG } from '../Config/Config'
import { Metrics } from "@firebolt-js/sdk"

const REFRESH_INTERVAL_MS = 500;

let instance = null;

export default class DownloadManager {
  static get() {
    if (instance === null) {
      instance = new DownloadManager()
    }
    return instance;
  }

  constructor() {
    this.thunder = ThunderJS(CONFIG.thunderConfig);
    this.callsign = 'org.rdk.DownloadManager';
    this.downloadIdToStatus = new Map();
    this.listeners = new Map();
    this.tickTimeout = null;
    this.INFO = console.info;
    this.LOG = console.log;
    this.ERR = console.error;

    this.thunder.on(this.callsign, "onAppDownloadStatus", event => {
      if (typeof event.downloadStatus === "string") {
        try {
          const downloadStatusArray = JSON.parse(event.downloadStatus);
          for (const downloadStatus of downloadStatusArray) {
            this.LOG(`DownloadManager download status: ${JSON.stringify(downloadStatus)}`);
            if (typeof downloadStatus.downloadId === "string" &&
              typeof downloadStatus.fileLocator === "string") {
              const downloadId = downloadStatus.downloadId;
              this.downloadIdToStatus.set(downloadId, downloadStatus);
              const listener = this.listeners.get(downloadId);
              if (listener) {
                this.listeners.delete(downloadId);
                if (this.listeners.size === 0) {
                  clearTimeout(this.tickTimeout);
                  this.tickTimeout = null;
                }
                listener(downloadId, 100, downloadStatus.failReason);
              }
            } else {
              throw new Error(`Required properties are missing ${JSON.stringify(downloadStatus)}`);
            }
          }
        } catch (err) {
          this.ERR(`onAppDownloadStatus() error: ${err} for event: ${JSON.stringify(event)}`);
        }
      }
    });
  }

  handleThunderError(thunderCall, thunderErr) {
    const err = new ThunderError(thunderCall, thunderErr);
    const errString = err.toString();
    this.ERR(errString);
    Metrics.error(Metrics.ErrorType.OTHER, "DownloadManager", errString, false, null);
    throw err;
  }

  activate() {
    return this.thunder.Controller.activate(
      { callsign: this.callsign }
    ).then(() => {
      this.INFO("DownloadManager activated");
      return true;
    }).catch(err => {
      this.handleThunderError(`activate(${this.callsign})`, err);
    });
  }

  deactivate() {
    return this.thunder.Controller.deactivate(
      { callsign: this.callsign }
    ).then(() => {
      this.INFO("DownloadManager deactivated");
      return true;
    }).catch(err => {
      this.handleThunderError(`deactivate(${this.callsign})`, err);
    });
  }

  async tick() {
    for (const [downloadId] of this.listeners) {
      try {
        const progress = await this.progress(downloadId);
        if (typeof progress?.percent === "number") {
          const listener = this.listeners.get(downloadId);
          if (listener) {
            listener(downloadId, progress.percent);
          }
        }
      } catch (err) {
        this.ERR(`Error: tick() ${downloadId} ${err}`);
      }
    }
    if (this.listeners.size) {
      this.tickTimeout = setTimeout(this.tick.bind(this), REFRESH_INTERVAL_MS);
    } else {
      this.tickTimeout = null;
    }
  }

  download(url, listener) {
    return this.thunder.call(this.callsign, 'download', {
      url,
    }).then(result => {
      this.LOG(`download(${url}) result: ${JSON.stringify(result)}`);
      const downloadId = result.downloadId ?? result;
      const downloadStatus = this.downloadIdToStatus.get(downloadId);

      if (!downloadStatus) {
        this.listeners.set(downloadId, listener);
        if (!this.tickTimeout) {
          this.tickTimeout = setTimeout(this.tick.bind(this), 0);
        }
      } else {
        listener(downloadId, 100, downloadStatus.failReason);
      }

      return downloadId;
    }).catch(err => {
      this.handleThunderError(`download(${url})`, err);
    });
  }

  progress(downloadId) {
    return this.thunder.call(this.callsign, 'progress', {
      downloadId,
    }).then(result => {
      this.LOG(`progress(${downloadId}) result: ${JSON.stringify(result)}`);
      if (typeof result === "number") {
        return {
          percent: result,
        };
      }
      return result;
    }).catch(err => {
      this.handleThunderError(`progress(${downloadId})`, err);
    });
  }

  getFileLocator(downloadId) {
    return this.downloadIdToStatus.get(downloadId)?.fileLocator;
  }

  delete(downloadId) {
    const fileLocator = this.getFileLocator(downloadId);

    if (fileLocator) {
      return this.thunder.call(this.callsign, 'delete', {
        fileLocator,
      }).then(result => {
        this.downloadIdToStatus.delete(downloadId);
        this.LOG(`delete(${fileLocator}) result: ${JSON.stringify(result)}`);
        return result;
      }).catch(err => {
        this.handleThunderError(`delete(${fileLocator})`, err);
      });
    } else {
      throw new Error(`Unknown fileLocator of ${downloadId}`);
    }
  }
}
