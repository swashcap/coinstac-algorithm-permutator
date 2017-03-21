'use strict'

const coinstacSimulator = require('coinstac-simulator')
const combinatorics = require('js-combinatorics')
const fs = require('fs')
const isNumber = require('lodash/isNumber')
const map = require('lodash/map')
const mergeWith = require('lodash/mergeWith')
const path = require('path')
const pify = require('pify')
const rimraf = require('rimraf')
const util = require('util')

const DECLARATION_FILENAME = path.join(__dirname, 'declaration.js')
const writeFile = pify(fs.writeFile)
const unlink = pify(rimraf)

/**
 * Assert results are all numeric.
 *
 * @throws {Error}
 *
 * @param {Object} result
 * @returns {Object}
 */
function assertNumeric (result) {
  return map(result, value => mergeWith(
    {},
    value,
    (objValue, srcValue, key, object, source, stack) => {
      if (Array.isArray(srcValue)) {
        const il = srcValue.length
        for (let i = 0; i < il; i++) {
          if (!isNumber(srcValue[i])) {
            throw new Error(`Non-numeric item "${srcValue[i]}" in array ${stack}`)
          }
        }
      } else if (!isNumber(srcValue)) {
        throw new Error(`Non-numeric value "${srcValue}" in ${stack}`)
      }
    }
  ))
}

/**
 * Run a declaration
 *
 * @param {Object} declaration
 * @returns {Promise}
 */
function runDeclaration (declaration) {
  return writeFile(
    DECLARATION_FILENAME,
    util.inspect(declaration, { depth: null })
  )
    .then(coinstacSimulator.run(DECLARATION_FILENAME))
    .then(assertNumeric)
    .then(
      () => unlink(DECLARATION_FILENAME),
      error => unlink(DECLARATION_FILENAME).then(() => {
        throw error
      })
    )
}

/**
 * Run permutations.
 *
 * @returns {Promise}
 */
function run () {
  const declarations = []

  combinatorics
    .permutationCombination(Array.from(Array(5)).map(
      (value, index) => path.join(
        __dirname,
        `demo2/metadata-${index + 1}.csv`
      )
    ))
    .forEach((metaFilePaths) => {
      if (metaFilePaths.length > 1) {
        declarations.push({
          __ACTIVE_COMPUTATION_INPUTS__: [[
            ['Right-Cerebellum-Cortex'],
            250,
            0,
            [{
              name: 'Is Control',
              type: 'boolean'
            }, {
              name: 'Age',
              type: 'number'
            }]
          ]],
          computationPath: '../src/index.js',
          local: metaFilePaths.map(metaFilePath => ({
            metaFilePath,
            metaCovariateMapping: {
              1: 0,
              2: 1
            }
          })),
          verbose: true
        })
      }
    })

  return Promise.all([declarations[0]].reduce(
    (memo, declaration) => memo.concat(runDeclaration(declaration)),
    []
  ))
  .catch(console.error)
}

module.exports = {
  assertNumeric,
  run,
  runDeclaration
}
