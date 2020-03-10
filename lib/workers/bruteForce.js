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

const pipeline = new EventEmitter()
let semaphone = 0;

(async () => {
  parentPort.on('message', (message) => pipeline.emit(message))
  pipeline.on('pause', () => semaphone += 1)
  pipeline.on('resume', () => {
    semaphone -= 1
    if (semaphone === 0) {
      pipeline.emit('unlock')
    }
  })

  for (let length = minLength; length < maxLength + 1; length++) {
    await bruteForce({
      length,
      chars: characters.join('').split(''),
    })
  }

  return process.exit(0)
})()

async function bruteForce ({ length, chars }) {
  const passwordLength = length
  const possibilities = Math.pow(chars.length, passwordLength)

  for (let index = 0; index < possibilities; ++index) {
    let val = index
    let password = ''

    for (let j = 0; j < passwordLength; j++) {
      const char = val % chars.length

      password = chars[char] + password
      val = Math.floor(val / chars.length)
    }

    if (semaphone > 0) {
      await new Promise((resolve) => pipeline.once('unlock', resolve))
    } else {
      await new Promise(resolve => setImmediate(resolve))
    }

    parentPort.postMessage(password)
  }
}
