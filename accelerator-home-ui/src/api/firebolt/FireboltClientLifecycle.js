/**
 * If not stated otherwise in this file or this component's LICENSE
 * file the following copyright and licenses apply:
 *
 * Copyright 2020 RDK Management
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

/**
 * Wrapper for firebolt-js-client v1.0.0-next.5 Lifecycle API
 * Provides compatibility layer for existing FBTLifecycle interface
 */

import { Lifecycle } from 'firebolt-js-client'

class FireboltClientLifecycle {
    constructor() {
		this._listeners = new Map()
		this.INFO = console.info;
		this.LOG = console.log;
		this.ERR = console.error;
		this.WARN = console.warn;
    }

    /**
     * Register listener for lifecycle events
     * Adapts firebolt-js-client API to match @firebolt-js/sdk interface
     * @param {string} eventName - Event name ('background', 'foreground', 'inactive', 'suspended', 'unloading')
     * @param {Function} callback - Callback function
     * @returns {Promise<number>} - Listener ID
     */
    listen(eventName, callback) {
        try {
            // Call the new Lifecycle API
            return Lifecycle.listen(eventName, callback)
                .then(listenerId => {
                    this._listeners.set(listenerId, { eventName, callback })
                    return listenerId
                })
                .catch(err => {
                    this.ERR(`Error listening to ${eventName}:`, err)
                    throw err
                })
        } catch (err) {
            this.ERR(`Error in Lifecycle.listen for ${eventName}:`, err)
            // Return a promise that rejects to maintain API consistency
            return Promise.reject(err)
        }
    }

    /**
     * Clear a specific listener by ID
     * @param {number} listenerId - Listener ID returned from listen()
     * @returns {boolean} - Success indicator
     */
    clear(listenerId) {
        try {
            const result = Lifecycle.clear(listenerId)
            if (this._listeners.has(listenerId)) {
                this._listeners.delete(listenerId)
            }
            return result
        } catch (err) {
            this.ERR(`Error clearing listener ${listenerId}:`, err)
            return false
        }
    }

    /**
     * Signal that app is ready
     * @returns {Promise} - Ready result
     */
    ready() {
        try {
            return Lifecycle.ready()
                .catch(err => {
                    this.ERR('Error calling Lifecycle.ready():', err)
                    throw err
                })
        } catch (err) {
            this.ERR('Error in Lifecycle.ready():', err)
            return Promise.reject(err)
        }
    }

    /**
     * Signal that app is finished
     * @returns {Promise} - Finished result
     */
    finished() {
        try {
            return Lifecycle.finished()
                .catch(err => {
                    this.ERR('Error calling Lifecycle.finished():', err)
                    throw err
                })
        } catch (err) {
            this.ERR('Error in Lifecycle.finished():', err)
            return Promise.reject(err)
        }
    }

    /**
     * Close the app with reason
     * @param {string} reason - Reason for closing
     * @returns {Promise} - Close result
     */
    close(reason = 'remoteButton') {
        try {
            return Lifecycle.close(reason)
                .catch(err => {
                    this.ERR('Error calling Lifecycle.close():', err)
                    throw err
                })
        } catch (err) {
            this.ERR('Error in Lifecycle.close():', err)
            return Promise.reject(err)
        }
    }

    /**
     * Get current lifecycle state
     * @returns {string|Promise} - Current state or promise resolving to state
     */
    state() {
        try {
            return Lifecycle.state()
        } catch (err) {
            this.ERR('Error getting Lifecycle.state():', err)
            throw err
        }
    }

    /**
     * Clean up all listeners
     */
    destroy() {
        this._listeners.forEach((listener, listenerId) => {
            try {
                this.clear(listenerId)
            } catch (err) {
                this.WARN(`Failed to clear listener ${listenerId}:`, err)
            }
        })
        this._listeners.clear()
    }
}

// Export singleton instance as default
export default new FireboltClientLifecycle()
