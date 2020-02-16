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

const ReadableWorkerStream = require('./streams/ReadableWorkerStream')
const TransformProgressBarStream = require('./streams/TransformProgressBarStream')
const fs = require('fs')

class Dictionary {
  /**
   * Initialize the dictionary
   * @param {{path: string, minLength: number, maxLength: number, characters: [string]}} options
   */
  constructor (options) {
    this._options = options

    if (options.maxLength < options.minLength) {
      throw new Error('Le taille maximale des mots de passe ne peut pas être inférieure à celle minimale.')
    }
    return new Promise((resolve, reject) => {
      this._fileWriteStream = fs.createWriteStream(options.path)
        .on('open', () => resolve(this))
        .on('error', reject)
    })
  }

  persist () {
    const worker = new ReadableWorkerStream(this._options)
    const progressBarStream = new TransformProgressBarStream(this.length, {
      encoding: 'utf8'
    })

    worker
      .then((stream) => {
        progressBarStream.emit('start')

        return stream
          .pipe(progressBarStream)
          .pipe(this._fileWriteStream)
      })
    return progressBarStream
  }

  _calcPermutations (n, r) {
    const factorial = (x) => x ? x * factorial(x - 1) : 1

    return factorial(n) / factorial(n - r)
  }

  /**
   * To calculate permutations, we use the equation nPr,
   * where n is the total number of choices and r is the amount of items being selected.
   * To solve this equation, use the equation nPr = n! / (n - r)!.
   * @return {number}
   */
  get length () {
    const { minLength, maxLength } = this._options
    let totalWords = 0

    for (let length = minLength; length <= maxLength; length++) {
      totalWords += this._calcPermutations(length, length)
    }
    return totalWords
  }
}

module.exports = Dictionary
