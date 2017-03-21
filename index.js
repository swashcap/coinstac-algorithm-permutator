'use strict'

const coinstacSimulator = require('coinstac-simulator')
const combinatorics = require('js-combinatorics')
const fs = require('fs')
const isNumber = require('lodash/isNumber')
const map = require('lodash/map')
const mergeWith = require('lodash/mergeWith')
const mkdirp = require('mkdirp')
const path = require('path')
const pify = require('pify')
const rimraf = require('rimraf')
const util = require('util')

const DECLARATION_FILENAME = path.join(__dirname, '.tmp/declaration.js')
const asyncMkdirp = pify(mkdirp)
const asyncRimraf = pify(rimraf)
const asyncWriteFile = pify(fs.writeFile)

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
  console.log(
    `Running files: ${declaration.local.map(l => path.basename(l.metaFilePath))}`
  )

  const DECLARATION_DIRNAME = path.dirname(DECLARATION_FILENAME)

  return asyncMkdirp(DECLARATION_DIRNAME)
    .then(() => asyncWriteFile(
      DECLARATION_FILENAME,
      `module.exports = ${util.inspect(declaration, { depth: null })}`
    ))
    .then(() => coinstacSimulator.run(DECLARATION_FILENAME))
    .then(assertNumeric)
    .then(
      () => asyncRimraf(DECLARATION_DIRNAME),
      error => asyncRimraf(DECLARATION_DIRNAME).then(() => {
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
        `mocks/site${index + 1}/site${index + 1}_Covariate.csv`
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
          computationPath: '../node_modules/laplacian-noise-ridge-regression/src/index.js',
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
  .then(
    () => console.log('All permutations passed'),
    console.error
  )
}

if (require.main === module) run()

module.exports = {
  assertNumeric,
  run,
  runDeclaration
}
