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

const inquirer = require('inquirer')
const logger = require('./utils/logger')
const Dictionary = require('./Dictionary')
const clear = require('clear')
const figlet = require('figlet')
const clui = require('clui')

const config = require('./config')
const questions = require('./config/questions')

figlet(config.APP.NAME, (err, data) => {
  if (err) {
    logger.error(`échec du démarrage (${err.message})`)
    return process.exit(err.code || 1)
  }

  data.split('\n').forEach(logger.info.bind(logger))

  inquirer.prompt(questions)
    .then(answers => new Dictionary(answers))
    .then((dictionary) => {
      const progress = new clui.Progress(80)
      const totalWords = dictionary.length

      dictionary.persist()
        .on('start', () => {
          clear({fullClear: true})
          logger.info(progress.update(0, totalWords))
        })
        .on('step', (words) => {
          clear({fullClear: false})
          logger.info(progress.update(words, totalWords))
        })
    })
    .catch((err) => logger.error(err.message || err))
})
