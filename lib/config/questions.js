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

const path = require('path')

const questions = [
  {
    type: 'number',
    name: 'minLength',
    message: 'Longueur minimale des mots de passe du dictionnaire',
    validate: number => number < 1
      ? 'La longueur est invalide.'
      : true,
    default: 3,
  },
  {
    type: 'number',
    name: 'maxLength',
    message: 'Longueur maximale des mots de passe du dictionnaire',
    validate: number => number < 1
      ? 'La longueur est invalide.'
      : true,
    default: 8,
  },
  {
    type: 'checkbox',
    name: 'characters',
    message: 'Caractères permis dans le dictionnaire',
    choices: [
      {
        name: 'minuscules (a-z)',
        value: 'abcdefghijklmnopqrstuvwxyz'
      },
      {
        name: 'majuscules (A-Z)',
        value: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
      },
      {
        name: 'chiffres (0-9)',
        value: '0123456789'
      },
      {
        name: 'caractères spéciaux (~!@#$%^&*()-_=+[]{};:,.<>/?|)',
        value: '~!@#$%^&*()-_=+[]{};:,.<>/?|'
      }
    ],
    validate: answer => answer.length < 1
      ? 'Vous devez choisir au moins un type de caractères.'
      : true,
  },
  {
    type: 'input',
    name: 'path',
    message: 'Dossier et fichier de sortie dans lequel seront déposés les mots de passe',
    validate: answer => path.extname(answer) !== '.txt'
      ? 'Vous devez choisir un chemin de fichier valide.'
      : true,
    filter: filePath => path.resolve(filePath)
  }
]

module.exports = questions
