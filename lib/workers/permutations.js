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

const EventEmitter = require('events')
const { parentPort, workerData } = require('worker_threads')
const { characters, minLength, maxLength } = workerData

const choices = characters.join('').split('')

const pipeline = new EventEmitter()
let lock = false;

(async () => {
  parentPort.on('message', (message) => pipeline.emit(message));
  pipeline.on('pause', () => lock = true)

  for (let length = minLength; length <= maxLength; length++) {
    await generate(length, [...choices.slice(0, length)])
  }
  process.exit(0)
})();

/**
 *
 * @param {number} n
 * @param {string[]} A
 */
async function generate (n, A) {
  const c = Array(n).fill(0)

  parentPort.postMessage(A.join(''))

  let i = 0
  while (i < n) {
    if (c[i] < i) {
      if (i % 2 === 0) {
        [A[0], A[i]] = [A[i], A[0]]
      } else {
        [A[c[i]], A[i]] = [A[i], A[c[i]]]
      }
      setImmediate((permutation) => {
        parentPort.postMessage(permutation)
      }, A.join(''))
      c[i] = c[i] + 1
      i = 0
    } else {
      c[i] = 0
      i = i + 1
    }
    if (lock === true) {
      await new Promise((resolve) => pipeline.once('resume', resolve))
      lock = false
    }
    await new Promise((resolve) => setImmediate(resolve))
  }
}
