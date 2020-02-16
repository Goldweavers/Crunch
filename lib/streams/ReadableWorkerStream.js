/**
 * INF36207_MD5
 * Copyright (c) Julien Sarriot 2020.
 * All rights reserved.
 *
 * This code is licensed under the MIT License.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files(the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and / or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions :
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

const stream = require('stream')
const { Worker } = require('worker_threads')
const path = require('path')

class ReadableWorkerStream extends stream.Readable {
  locked = false
  /**
   *
   * @param {Object} settings
   * @param {Object?} options
   * @return {Promise<ReadableWorkerStream>}
   */
  constructor (settings, options) {
    super(options);

    this.worker = new Worker(
      path.resolve(__dirname, '../workers/permutations.js'),
      {
        workerData: settings,
      },
    )
    this._attachListenersToWorker()
    return new Promise((resolve) => {
      this.worker.once('online', () => resolve(this))
    })
  }

  _attachListenersToWorker() {
    this.worker
      .on('message', (message) => setImmediate((chunk) => {
        if (this.push(chunk) === false && this.locked === false) {
          this.worker.postMessage('pause')
          this.locked = true
        }
      }, message))
      .once('error', (error) => this.destroy(error))
      .once('exit', () => setImmediate(() => this.push(null)))
  }

  /**
   * Automatically called when stream is destroy
   * @param {Error} error
   * @param {*} callback
   * @return {Promise<number>}
   * @private
   */
  _destroy(error, callback) {
    if (error) {
      console.error(error)
    }

    return this.worker.terminate()
      .then(callback)
  }

  /**
   * Automatically called when stream is read
   * @param {number} size
   * @private
   */
  _read(size) {
    if (this.locked === true) {
      this.worker.postMessage('resume')
      this.locked = false
    }
  }
}

module.exports = ReadableWorkerStream
